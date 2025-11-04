/**
 * core/wallet.js
 *
 * Multi-wallet creation, import, and key management
 */

import { ethers } from 'ethers';
import { save, load } from './storage.js';
import { isValidMnemonic, isValidPrivateKey, validatePasswordStrength } from './validation.js';

// ===== ADDITIONAL ENCRYPTION LAYER =====
// Adds AES-GCM encryption on top of ethers.js keystore encryption
// This provides defense-in-depth against Chrome storage compromise

/**
 * Derives an encryption key from password using PBKDF2
 * @param {string} password - User password
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>}
 */
async function deriveEncryptionKey(password, salt) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive AES-GCM key
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data with AES-GCM (additional layer)
 * @param {string} data - Data to encrypt
 * @param {string} password - User password
 * @returns {Promise<string>} Base64 encoded encrypted data with salt and iv
 */
async function encryptWithAES(data, password) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // SECURITY: Generate cryptographically random salt and IV
  // crypto.getRandomValues() uses the browser's CSPRNG (Cryptographically Secure
  // Pseudo-Random Number Generator), which ensures:
  // 1. True randomness from hardware entropy sources
  // 2. IV uniqueness is cryptographically guaranteed (collision probability < 2^-64)
  // 3. Unpredictability - cannot be guessed by attackers
  // Each encryption operation gets a unique IV, which is critical for AES-GCM security
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key
  const key = await deriveEncryptionKey(password, salt);
  
  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataBuffer
  );
  
  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
  
  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts AES-GCM encrypted data
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} password - User password
 * @returns {Promise<string>} Decrypted data
 */
async function decryptWithAES(encryptedData, password) {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // Derive key
    const key = await deriveEncryptionKey(password, salt);
    
    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Decryption failed - incorrect password or corrupted data');
  }
}

// Storage keys
const OLD_WALLET_KEY = 'wallet_encrypted'; // Legacy single wallet
const WALLETS_KEY = 'wallets_multi'; // New multi-wallet structure

/**
 * Migration: Converts old single-wallet format to new multi-wallet format
 * Runs automatically on first load
 * @returns {Promise<boolean>} True if migration occurred, false if already migrated
 */
export async function migrateToMultiWallet() {
  try {
    // Check if already using new format
    const walletsData = await load(WALLETS_KEY);
    if (walletsData) {
      return false; // Already migrated
    }

    // Check for old format wallet
    const oldWallet = await load(OLD_WALLET_KEY);
    if (!oldWallet) {
      return false; // No wallet to migrate
    }

    // Get address from old wallet (we'll need to temporarily decrypt it)
    // For now, we'll create a placeholder - the address will be populated on first unlock
    const newFormat = {
      activeWalletId: 'wallet_migrated_' + Date.now(),
      walletList: [{
        id: 'wallet_migrated_' + Date.now(),
        nickname: 'Main Wallet',
        address: null, // Will be populated on unlock
        encryptedKeystore: oldWallet,
        createdAt: Date.now(),
        importMethod: 'migrated'
      }]
    };

    // Save new format
    await save(WALLETS_KEY, newFormat);

    // Keep old wallet for safety during transition
    // Can be cleaned up later

    // Migrated to multi-wallet format
    return true;
  } catch (error) {
    console.error('Error during migration:', error);
    return false;
  }
}

/**
 * Gets all wallets data
 * @returns {Promise<{activeWalletId: string, walletList: Array}>}
 */
export async function getAllWallets() {
  const walletsData = await load(WALLETS_KEY);
  if (!walletsData) {
    return {
      activeWalletId: null,
      walletList: []
    };
  }
  return walletsData;
}

/**
 * Gets active wallet info (without decrypting)
 * @returns {Promise<Object|null>} Active wallet metadata or null
 */
export async function getActiveWallet() {
  const walletsData = await getAllWallets();
  if (!walletsData.activeWalletId || walletsData.walletList.length === 0) {
    return null;
  }

  const activeWallet = walletsData.walletList.find(
    w => w.id === walletsData.activeWalletId
  );

  return activeWallet || null;
}

/**
 * Checks if any wallet exists
 * @returns {Promise<boolean>}
 */
export async function walletExists() {
  const walletsData = await getAllWallets();
  return walletsData.walletList.length > 0;
}

/**
 * Generates a unique wallet ID using cryptographically secure random
 * @returns {string}
 */
function generateWalletId() {
  // Generate cryptographically secure random bytes
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  const randomStr = Array.from(array, byte => byte.toString(36)).join('');
  return 'wallet_' + Date.now() + '_' + randomStr;
}

/**
 * Checks if a wallet with the given address already exists
 * @param {string} address - Ethereum address
 * @returns {Promise<boolean>}
 */
async function isDuplicateAddress(address) {
  const walletsData = await getAllWallets();
  return walletsData.walletList.some(
    w => w.address && w.address.toLowerCase() === address.toLowerCase()
  );
}

/**
 * Generates a default nickname for a new wallet
 * @returns {Promise<string>}
 */
async function generateDefaultNickname() {
  const walletsData = await getAllWallets();
  const count = walletsData.walletList.length;
  return 'Wallet ' + (count + 1);
}

/**
 * Adds a new wallet to the wallet list
 * @param {string} type - 'create', 'mnemonic', or 'privatekey'
 * @param {Object} data - {mnemonic?, privateKey?}
 * @param {string} password - User password for encryption
 * @param {string} nickname - Optional custom nickname
 * @returns {Promise<{id: string, address: string, mnemonic?: string}>}
 * @throws {Error} If validation fails or wallet creation fails
 */
export async function addWallet(type, data, password, nickname = null) {
  // Validate password strength
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    throw new Error(passwordCheck.errors.join(', '));
  }

  let wallet;
  let mnemonic = null;

  try {
    // Create or import wallet based on type
    switch (type) {
      case 'create':
        wallet = ethers.Wallet.createRandom();
        mnemonic = wallet.mnemonic.phrase;
        break;

      case 'mnemonic':
        if (!data.mnemonic || !isValidMnemonic(data.mnemonic)) {
          throw new Error('Invalid mnemonic phrase');
        }
        const cleanMnemonic = data.mnemonic.trim().replace(/\s+/g, ' ');
        wallet = ethers.Wallet.fromPhrase(cleanMnemonic);
        break;

      case 'privatekey':
        if (!data.privateKey || !isValidPrivateKey(data.privateKey)) {
          throw new Error('Invalid private key');
        }
        const key = data.privateKey.startsWith('0x') ? data.privateKey : '0x' + data.privateKey;
        wallet = new ethers.Wallet(key);
        break;

      default:
        throw new Error('Invalid wallet type: ' + type);
    }

    // Check for duplicate address
    if (await isDuplicateAddress(wallet.address)) {
      throw new Error('This wallet already exists in your wallet list');
    }

    // Double encryption:
    // 1. Encrypt wallet with ethers.js (creates encrypted JSON keystore)
    const encryptedJson = await wallet.encrypt(password);
    
    // 2. Encrypt the keystore again with AES-GCM (additional security layer)
    const doubleEncrypted = await encryptWithAES(encryptedJson, password);

    // Generate nickname if not provided
    const finalNickname = nickname || await generateDefaultNickname();

    // Create wallet entry with double-encrypted keystore
    const walletEntry = {
      id: generateWalletId(),
      nickname: finalNickname,
      address: wallet.address,
      encryptedKeystore: doubleEncrypted,
      createdAt: Date.now(),
      importMethod: type,
      encryptionVersion: 2 // Track encryption version for future upgrades
    };

    // Get current wallets data
    const walletsData = await getAllWallets();

    // Check wallet limit (max 10)
    if (walletsData.walletList.length >= 10) {
      throw new Error('Maximum wallet limit (10) reached. Please delete a wallet to add a new one.');
    }

    // Add to list
    walletsData.walletList.push(walletEntry);

    // Set as active if it's the first wallet
    if (walletsData.walletList.length === 1) {
      walletsData.activeWalletId = walletEntry.id;
    }

    // Save updated data
    await save(WALLETS_KEY, walletsData);

    // Return wallet info
    return {
      id: walletEntry.id,
      address: wallet.address,
      mnemonic: mnemonic // Only set for newly created wallets
    };
  } catch (error) {
    console.error('Error adding wallet:', error);
    throw error;
  }
}

/**
 * Sets the active wallet
 * @param {string} walletId - Wallet ID to switch to
 * @returns {Promise<Object>} The new active wallet info
 * @throws {Error} If wallet ID not found
 */
export async function setActiveWallet(walletId) {
  const walletsData = await getAllWallets();

  // Find wallet
  const wallet = walletsData.walletList.find(w => w.id === walletId);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  // Update active wallet
  walletsData.activeWalletId = walletId;
  await save(WALLETS_KEY, walletsData);

  return wallet;
}

/**
 * Renames a wallet
 * @param {string} walletId - Wallet ID to rename
 * @param {string} newNickname - New nickname
 * @returns {Promise<void>}
 * @throws {Error} If wallet not found or nickname is invalid
 */
export async function renameWallet(walletId, newNickname) {
  if (!newNickname || newNickname.trim().length === 0) {
    throw new Error('Nickname cannot be empty');
  }

  if (newNickname.length > 30) {
    throw new Error('Nickname too long (max 30 characters)');
  }

  const walletsData = await getAllWallets();
  const wallet = walletsData.walletList.find(w => w.id === walletId);

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  wallet.nickname = newNickname.trim();
  await save(WALLETS_KEY, walletsData);
}

/**
 * Deletes a wallet
 * @param {string} walletId - Wallet ID to delete
 * @param {string} password - User password for verification
 * @returns {Promise<void>}
 * @throws {Error} If password is incorrect or wallet not found
 */
export async function deleteWallet(walletId, password) {
  // Verify password first by trying to unlock active wallet
  await unlockWallet(password);

  const walletsData = await getAllWallets();
  const walletIndex = walletsData.walletList.findIndex(w => w.id === walletId);

  if (walletIndex === -1) {
    throw new Error('Wallet not found');
  }

  // Remove wallet from list
  walletsData.walletList.splice(walletIndex, 1);

  // If we deleted the active wallet, switch to first available
  if (walletsData.activeWalletId === walletId) {
    walletsData.activeWalletId = walletsData.walletList.length > 0
      ? walletsData.walletList[0].id
      : null;
  }

  await save(WALLETS_KEY, walletsData);
}

/**
 * Unlocks the active wallet and returns signer
 * @param {string} password - User password
 * @returns {Promise<{address: string, signer: ethers.Wallet}>}
 * @throws {Error} If password is incorrect or no active wallet
 */
export async function unlockWallet(password) {
  const activeWallet = await getActiveWallet();

  if (!activeWallet) {
    throw new Error('No wallet found. Please create or import a wallet.');
  }

  return await unlockSpecificWallet(activeWallet.id, password);
}

/**
 * Unlocks a specific wallet by ID
 * @param {string} walletId - Wallet ID to unlock
 * @param {string} password - User password
 * @returns {Promise<{address: string, signer: ethers.Wallet}>}
 * @throws {Error} If password is incorrect or wallet not found
 */
export async function unlockSpecificWallet(walletId, password) {
  try {
    const walletsData = await getAllWallets();
    const wallet = walletsData.walletList.find(w => w.id === walletId);

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // SECURITY: All wallets MUST use double encryption (version 2)
    if (!wallet.encryptionVersion || wallet.encryptionVersion < 2) {
      throw new Error('This wallet uses outdated encryption. Please re-import your wallet for enhanced security.');
    }

    // Decrypt the AES-GCM layer first
    const keystoreJson = await decryptWithAES(wallet.encryptedKeystore, password);

    // Then decrypt wallet using ethers.js keystore
    const signer = await ethers.Wallet.fromEncryptedJson(
      keystoreJson,
      password
    );

    // Update address if it's null (migration case)
    if (!wallet.address) {
      wallet.address = signer.address;
      await save(WALLETS_KEY, walletsData);
    }

    return {
      address: signer.address,
      signer: signer
    };
  } catch (error) {
    if (error.message.includes('incorrect password') || error.message.includes('Decryption failed')) {
      throw new Error('Incorrect password');
    }
    throw new Error('Failed to unlock wallet: ' + error.message);
  }
}

/**
 * Exports private key for the active wallet
 * @param {string} password - User password
 * @returns {Promise<string>} Hex private key
 * @throws {Error} If password is incorrect
 */
export async function exportPrivateKey(password) {
  const { signer } = await unlockWallet(password);
  return signer.privateKey;
}

/**
 * Exports mnemonic for the active wallet
 * @param {string} password - User password
 * @returns {Promise<string|null>} 12-word mnemonic or null if wallet was imported from private key
 * @throws {Error} If password is incorrect
 */
export async function exportMnemonic(password) {
  const { signer } = await unlockWallet(password);
  return signer.mnemonic ? signer.mnemonic.phrase : null;
}

/**
 * Exports private key for a specific wallet
 * @param {string} walletId - Wallet ID
 * @param {string} password - User password
 * @returns {Promise<string>} Hex private key
 * @throws {Error} If password is incorrect or wallet not found
 */
export async function exportPrivateKeyForWallet(walletId, password) {
  const { signer } = await unlockSpecificWallet(walletId, password);
  return signer.privateKey;
}

/**
 * Exports mnemonic for a specific wallet
 * @param {string} walletId - Wallet ID
 * @param {string} password - User password
 * @returns {Promise<string|null>} 12-word mnemonic or null if not available
 * @throws {Error} If password is incorrect or wallet not found
 */
export async function exportMnemonicForWallet(walletId, password) {
  const { signer } = await unlockSpecificWallet(walletId, password);
  return signer.mnemonic ? signer.mnemonic.phrase : null;
}

/**
 * LEGACY: Creates first wallet (for initial setup compatibility)
 * @param {string} password - User password
 * @returns {Promise<{address: string, mnemonic: string}>}
 */
export async function createWallet(password) {
  const result = await addWallet('create', {}, password, 'Main Wallet');
  return {
    address: result.address,
    mnemonic: result.mnemonic
  };
}

/**
 * LEGACY: Imports from mnemonic (for initial setup compatibility)
 * @param {string} mnemonic - 12-word seed phrase
 * @param {string} password - User password
 * @returns {Promise<{address: string}>}
 */
export async function importFromMnemonic(mnemonic, password) {
  const result = await addWallet('mnemonic', { mnemonic }, password, 'Main Wallet');
  return {
    address: result.address
  };
}

/**
 * LEGACY: Imports from private key (for initial setup compatibility)
 * @param {string} privateKey - Hex private key
 * @param {string} password - User password
 * @returns {Promise<{address: string}>}
 */
export async function importFromPrivateKey(privateKey, password) {
  const result = await addWallet('privatekey', { privateKey }, password, 'Main Wallet');
  return {
    address: result.address
  };
}
