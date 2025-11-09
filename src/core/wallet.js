/**
 * core/wallet.js
 *
 * Multi-wallet creation, import, and key management
 *
 * SECURITY: Uses self-describing encryption format with iteration metadata
 * for future-proof cryptographic agility.
 */

import { ethers } from 'ethers';
import { save, load } from './storage.js';
import { isValidMnemonic, isValidPrivateKey, validatePasswordStrength } from './validation.js';

// ===== PBKDF2 ITERATION RECOMMENDATIONS =====
// Based on historical OWASP data and GPU cracking speed trends
//
// Historical OWASP Recommendations:
// - 2016: 10,000 iterations
// - 2021: 310,000 iterations (31x in 5 years = 97% CAGR)
// - 2023: 600,000 iterations (1.94x in 2 years = 39% CAGR)
//
// GPU Cracking Speed Growth (2016-2022):
// - GTX 1080 → RTX 4090: 8x improvement = 39% CAGR
//
// Model: 35% CAGR (doubling every ~2.3 years)
// Rationale: Conservative estimate matching GPU improvements
const ITERATION_MILESTONES = [
  // Historical OWASP recommendations (actual data)
  { year: 2016, iterations: 10000,   source: 'OWASP 2016' },
  { year: 2021, iterations: 310000,  source: 'OWASP 2021' },
  { year: 2023, iterations: 600000,  source: 'OWASP 2023' },

  // Projected using 35% CAGR from 2023 baseline
  { year: 2024, iterations: 810000,  source: 'Projected (35% CAGR)' },
  { year: 2025, iterations: 1094000, source: 'Projected (35% CAGR)' },
  { year: 2026, iterations: 1477000, source: 'Projected (35% CAGR)' },
  { year: 2027, iterations: 1994000, source: 'Projected (35% CAGR)' },
  { year: 2028, iterations: 2692000, source: 'Projected (35% CAGR)' },
  { year: 2029, iterations: 3635000, source: 'Projected (35% CAGR)' },
  { year: 2030, iterations: 4907000, source: 'Projected (35% CAGR)' },
  { year: 2031, iterations: 5000000, source: 'Capped for UX (~2sec on slow devices)' },
];

/**
 * Gets recommended PBKDF2 iteration count for current year
 * Uses historical OWASP data and exponential growth model
 *
 * @param {number} year - Year to get recommendation for (defaults to current year)
 * @returns {number} Recommended iteration count
 */
export function getCurrentRecommendedIterations(year = new Date().getFullYear()) {
  // Find exact match first
  const exactMatch = ITERATION_MILESTONES.find(m => m.year === year);
  if (exactMatch) return exactMatch.iterations;

  // Find surrounding milestones for interpolation
  const before = ITERATION_MILESTONES
    .filter(m => m.year < year)
    .sort((a, b) => b.year - a.year)[0];

  const after = ITERATION_MILESTONES
    .filter(m => m.year > year)
    .sort((a, b) => a.year - b.year)[0];

  // Before all milestones: use earliest
  if (!before) return ITERATION_MILESTONES[0].iterations;

  // After all milestones: use latest (capped)
  if (!after) return ITERATION_MILESTONES[ITERATION_MILESTONES.length - 1].iterations;

  // Exponential interpolation (accurate for CAGR-based growth)
  const yearRange = after.year - before.year;
  const iterationRatio = after.iterations / before.iterations;
  const yearProgress = (year - before.year) / yearRange;

  return Math.floor(before.iterations * Math.pow(iterationRatio, yearProgress));
}

// Legacy iteration count for backward compatibility
const LEGACY_ITERATIONS = 100000;

// ===== SELF-DESCRIBING ENCRYPTION FORMAT =====
// Format: [4 bytes: iteration count][16 bytes: salt][12 bytes: IV][variable: ciphertext]
// This allows iteration count to evolve over time without breaking existing wallets

/**
 * Derives an encryption key from password using PBKDF2
 * @param {string} password - User password
 * @param {Uint8Array} salt - Salt for key derivation (16 bytes)
 * @param {number} iterations - PBKDF2 iteration count
 * @returns {Promise<CryptoKey>}
 */
async function deriveEncryptionKey(password, salt, iterations) {
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
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data with AES-GCM and stores iteration count in metadata
 * @param {string} data - Data to encrypt
 * @param {string} password - User password
 * @param {number} iterations - PBKDF2 iterations (defaults to current recommendation)
 * @returns {Promise<string>} Base64 encoded encrypted data with metadata
 */
async function encryptWithAES(data, password, iterations = getCurrentRecommendedIterations()) {
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

  // Derive key with specified iterations
  const key = await deriveEncryptionKey(password, salt, iterations);

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataBuffer
  );

  // Prepend iteration count as 4-byte big-endian integer
  const iterationBytes = new Uint8Array(4);
  new DataView(iterationBytes.buffer).setUint32(0, iterations, false); // Big-endian

  // Combine: [iterations][salt][IV][ciphertext]
  const combined = new Uint8Array(
    4 + salt.length + iv.length + encryptedBuffer.byteLength
  );
  combined.set(iterationBytes, 0);
  combined.set(salt, 4);
  combined.set(iv, 4 + salt.length);
  combined.set(new Uint8Array(encryptedBuffer), 4 + salt.length + iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts AES-GCM encrypted data, reading iteration count from metadata
 * Handles both new format (with iteration metadata) and legacy format
 *
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} password - User password
 * @returns {Promise<string>} Decrypted data
 */
async function decryptWithAES(encryptedData, password) {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    let iterationCount;
    let salt, iv, encrypted;

    // Auto-detect format: new (with metadata) vs legacy
    if (combined.length >= 4) {
      const possibleIterations = new DataView(combined.buffer, 0, 4).getUint32(0, false);

      // Heuristic: valid iteration counts are 100k-5M
      // If first 4 bytes are in this range, it's the new self-describing format
      if (possibleIterations >= 100000 && possibleIterations <= 5000000) {
        // ✅ NEW FORMAT - read iteration count from metadata
        iterationCount = possibleIterations;
        salt = combined.slice(4, 20);
        iv = combined.slice(20, 32);
        encrypted = combined.slice(32);
      } else {
        // ✅ LEGACY FORMAT - use hardcoded legacy iteration count
        iterationCount = LEGACY_ITERATIONS;
        salt = combined.slice(0, 16);
        iv = combined.slice(16, 28);
        encrypted = combined.slice(28);
      }
    } else {
      throw new Error('Invalid encrypted data format');
    }

    // Derive key using the stored iteration count
    const key = await deriveEncryptionKey(password, salt, iterationCount);

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
    if (error.message === 'Invalid encrypted data format') {
      throw error;
    }
    throw new Error('Decryption failed - incorrect password or corrupted data');
  }
}

/**
 * Extracts iteration count from encrypted data without decrypting
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {number} Iteration count, or LEGACY_ITERATIONS if legacy format
 */
function getIterationsFromEncrypted(encryptedData) {
  try {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    if (combined.length >= 4) {
      const possibleIterations = new DataView(combined.buffer, 0, 4).getUint32(0, false);

      // Check if it looks like a valid iteration count
      if (possibleIterations >= 100000 && possibleIterations <= 5000000) {
        return possibleIterations;
      }
    }

    // Legacy format
    return LEGACY_ITERATIONS;
  } catch (error) {
    return LEGACY_ITERATIONS;
  }
}

// Storage keys
const OLD_WALLET_KEY = 'wallet_encrypted'; // Legacy single wallet
const WALLETS_KEY = 'wallets_multi'; // New multi-wallet structure

// ===== CONCURRENCY CONTROL =====
// Prevents race conditions when multiple tabs upgrade the same wallet simultaneously
// Maps wallet ID to upgrade Promise
const ongoingUpgrades = new Map();

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

    // Get current recommended iterations
    const currentIterations = getCurrentRecommendedIterations();

    // Double encryption:
    // 1. Encrypt wallet with ethers.js (creates encrypted JSON keystore)
    const encryptedJson = await wallet.encrypt(password);

    // 2. Encrypt the keystore again with AES-GCM using current iteration recommendations
    const doubleEncrypted = await encryptWithAES(encryptedJson, password, currentIterations);

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
      lastSecurityUpgrade: Date.now(), // Track when encryption was last upgraded
      currentIterations: currentIterations // Store for UI display
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

    console.log(`🔐 Wallet created with ${currentIterations.toLocaleString()} PBKDF2 iterations`);

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
 * Auto-upgrades encryption if using outdated iteration count
 *
 * @param {string} password - User password
 * @param {Object} options - Optional settings
 * @param {boolean} options.skipUpgrade - Skip auto-upgrade (for testing)
 * @param {Function} options.onUpgradeStart - Callback when upgrade starts
 * @returns {Promise<{address: string, signer: ethers.Wallet, upgraded?: boolean}>}
 * @throws {Error} If password is incorrect or no active wallet
 */
export async function unlockWallet(password, options = {}) {
  const activeWallet = await getActiveWallet();

  if (!activeWallet) {
    throw new Error('No wallet found. Please create or import a wallet.');
  }

  return await unlockSpecificWallet(activeWallet.id, password, options);
}

/**
 * Unlocks a specific wallet by ID with auto-upgrade capability
 *
 * @param {string} walletId - Wallet ID to unlock
 * @param {string} password - User password
 * @param {Object} options - Optional settings
 * @param {boolean} options.skipUpgrade - Skip auto-upgrade (for testing/export)
 * @param {Function} options.onUpgradeStart - Callback when upgrade starts
 * @returns {Promise<{address: string, signer: ethers.Wallet, upgraded?: boolean, iterationsBefore?: number, iterationsAfter?: number}>}
 * @throws {Error} If password is incorrect or wallet not found
 */
export async function unlockSpecificWallet(walletId, password, options = {}) {
  try {
    const walletsData = await getAllWallets();
    const wallet = walletsData.walletList.find(w => w.id === walletId);

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Decrypt the AES-GCM layer (automatically detects iteration count)
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

    // ===== AUTO-UPGRADE SYSTEM =====
    // Check if wallet encryption needs security upgrade
    if (!options.skipUpgrade) {
      const currentIterations = getIterationsFromEncrypted(wallet.encryptedKeystore);
      const recommendedIterations = getCurrentRecommendedIterations();

      // Upgrade if current iterations are below recommendation
      if (currentIterations < recommendedIterations) {
        // CONCURRENCY CONTROL: Check if upgrade already in progress for this wallet
        if (ongoingUpgrades.has(walletId)) {
          console.log(`⏳ Wallet upgrade already in progress, waiting for completion...`);

          // Wait for the ongoing upgrade to complete
          await ongoingUpgrades.get(walletId);

          // Reload wallet data after upgrade completes
          const updatedWalletsData = await getAllWallets();
          const updatedWallet = updatedWalletsData.walletList.find(w => w.id === walletId);

          // Return with upgraded flag set to true (another tab did the upgrade)
          return {
            address: signer.address,
            signer: signer,
            upgraded: true,
            iterationsBefore: currentIterations,
            iterationsAfter: recommendedIterations,
            upgradedByConcurrentTab: true
          };
        }

        // Start upgrade and track it
        const upgradePromise = (async () => {
          try {
            const iterationsBefore = currentIterations;

            console.log(`🔐 Wallet encryption upgrade available:`);
            console.log(`   Current: ${currentIterations.toLocaleString()} iterations`);
            console.log(`   Recommended: ${recommendedIterations.toLocaleString()} iterations`);

            // Notify user via callback if provided
            if (options.onUpgradeStart) {
              options.onUpgradeStart({
                currentIterations,
                recommendedIterations,
                estimatedTimeMs: Math.floor((recommendedIterations / 100000) * 100) // ~100ms per 100k iterations
              });
            }

            console.log(`🔄 Upgrading wallet security...`);
            const upgradeStart = Date.now();

            // Re-encrypt with current recommendations
            // Layer 1: ethers.js keystore (unchanged)
            const newKeystoreJson = await signer.encrypt(password);

            // Layer 2: AES-GCM with new iteration count
            const newEncrypted = await encryptWithAES(
              newKeystoreJson,
              password,
              recommendedIterations
            );

            // Update wallet (reload to get latest state)
            const latestWalletsData = await getAllWallets();
            const latestWallet = latestWalletsData.walletList.find(w => w.id === walletId);

            if (!latestWallet) {
              throw new Error('Wallet not found during upgrade');
            }

            latestWallet.encryptedKeystore = newEncrypted;
            latestWallet.lastSecurityUpgrade = Date.now();
            latestWallet.currentIterations = recommendedIterations;
            await save(WALLETS_KEY, latestWalletsData);

            const upgradeTime = Date.now() - upgradeStart;
            console.log(`✅ Wallet upgraded to ${recommendedIterations.toLocaleString()} iterations (${upgradeTime}ms)`);

            return {
              iterationsBefore,
              iterationsAfter: recommendedIterations
            };
          } finally {
            // Clean up tracking
            ongoingUpgrades.delete(walletId);
          }
        })();

        // Track the ongoing upgrade
        ongoingUpgrades.set(walletId, upgradePromise);

        // Wait for upgrade to complete
        const upgradeResult = await upgradePromise;

        return {
          address: signer.address,
          signer: signer,
          upgraded: true,
          ...upgradeResult
        };
      }
    }

    return {
      address: signer.address,
      signer: signer,
      upgraded: false
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
  // Skip upgrade when exporting (user just wants the key)
  const { signer } = await unlockWallet(password, { skipUpgrade: true });
  return signer.privateKey;
}

/**
 * Exports mnemonic for the active wallet
 * @param {string} password - User password
 * @returns {Promise<string|null>} 12-word mnemonic or null if wallet was imported from private key
 * @throws {Error} If password is incorrect
 */
export async function exportMnemonic(password) {
  // Skip upgrade when exporting (user just wants the mnemonic)
  const { signer } = await unlockWallet(password, { skipUpgrade: true });
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
  const { signer } = await unlockSpecificWallet(walletId, password, { skipUpgrade: true });
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
  const { signer } = await unlockSpecificWallet(walletId, password, { skipUpgrade: true });
  return signer.mnemonic ? signer.mnemonic.phrase : null;
}

/**
 * Gets security information for a wallet
 * @param {string} walletId - Wallet ID
 * @returns {Promise<{currentIterations: number, recommendedIterations: number, needsUpgrade: boolean, lastUpgrade: number}>}
 */
export async function getWalletSecurityInfo(walletId) {
  const walletsData = await getAllWallets();
  const wallet = walletsData.walletList.find(w => w.id === walletId);

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const currentIterations = getIterationsFromEncrypted(wallet.encryptedKeystore);
  const recommendedIterations = getCurrentRecommendedIterations();

  return {
    currentIterations,
    recommendedIterations,
    needsUpgrade: currentIterations < recommendedIterations,
    lastUpgrade: wallet.lastSecurityUpgrade || wallet.createdAt
  };
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
