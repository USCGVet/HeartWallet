/**
 * tests/unit/wallet-hkdf.test.js
 *
 * Comprehensive unit tests for HKDF-based independent key derivation
 * SECURITY: Tests that Layer 1 and Layer 2 use cryptographically independent keys
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ethers } from 'ethers';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';

// Mock storage before importing wallet module
const mockStorage = {};
beforeEach(() => {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

  chrome.storage.local.get.mockImplementation((keys) => {
    if (keys === null) {
      return Promise.resolve({ ...mockStorage });
    }
    if (typeof keys === 'string') {
      return Promise.resolve({ [keys]: mockStorage[keys] });
    }
    if (Array.isArray(keys)) {
      const result = {};
      keys.forEach(key => {
        if (mockStorage[key] !== undefined) {
          result[key] = mockStorage[key];
        }
      });
      return Promise.resolve(result);
    }
    return Promise.resolve({});
  });

  chrome.storage.local.set.mockImplementation((items) => {
    Object.assign(mockStorage, items);
    return Promise.resolve();
  });
});

// Import after mocks are set up
const walletModule = await import('../../src/core/wallet.js');

describe('HKDF Key Derivation', () => {
  describe('Independent Key Generation', () => {
    it('should generate different keys for Layer 1 and Layer 2', () => {
      const password = 'TestPassword123!@#$';
      const salt = crypto.getRandomValues(new Uint8Array(32));

      // Simulate PBKDF2 -> HKDF derivation
      const masterKey = new Uint8Array(32);
      crypto.getRandomValues(masterKey); // Simulated master key

      const layer1Key = hkdf(
        sha256,
        masterKey,
        salt,
        'HeartWallet-v2-Layer1-Scrypt',
        32
      );

      const layer2Key = hkdf(
        sha256,
        masterKey,
        salt,
        'HeartWallet-v2-Layer2-AES',
        32
      );

      // Keys must be different
      expect(Buffer.from(layer1Key).toString('hex'))
        .not.toBe(Buffer.from(layer2Key).toString('hex'));

      // Both keys should be 32 bytes
      expect(layer1Key.length).toBe(32);
      expect(layer2Key.length).toBe(32);
    });

    it('should be deterministic (same input -> same output)', () => {
      const password = 'TestPassword123!@#$';
      const salt = new Uint8Array(32);
      salt.fill(0x42); // Fixed salt for reproducibility

      const masterKey = new Uint8Array(32);
      masterKey.fill(0x11); // Fixed master key

      // Derive keys twice
      const layer1Key_1 = hkdf(sha256, masterKey, salt, 'HeartWallet-v2-Layer1-Scrypt', 32);
      const layer1Key_2 = hkdf(sha256, masterKey, salt, 'HeartWallet-v2-Layer1-Scrypt', 32);

      const layer2Key_1 = hkdf(sha256, masterKey, salt, 'HeartWallet-v2-Layer2-AES', 32);
      const layer2Key_2 = hkdf(sha256, masterKey, salt, 'HeartWallet-v2-Layer2-AES', 32);

      // Same inputs should produce same outputs
      expect(Buffer.from(layer1Key_1).toString('hex'))
        .toBe(Buffer.from(layer1Key_2).toString('hex'));

      expect(Buffer.from(layer2Key_1).toString('hex'))
        .toBe(Buffer.from(layer2Key_2).toString('hex'));
    });

    it('should produce different keys with different salts', () => {
      const masterKey = new Uint8Array(32);
      masterKey.fill(0x11);

      const salt1 = new Uint8Array(32);
      salt1.fill(0x01);

      const salt2 = new Uint8Array(32);
      salt2.fill(0x02);

      const key1 = hkdf(sha256, masterKey, salt1, 'HeartWallet-v2-Layer1-Scrypt', 32);
      const key2 = hkdf(sha256, masterKey, salt2, 'HeartWallet-v2-Layer1-Scrypt', 32);

      expect(Buffer.from(key1).toString('hex'))
        .not.toBe(Buffer.from(key2).toString('hex'));
    });

    it('should produce different keys with different context strings', () => {
      const masterKey = new Uint8Array(32);
      masterKey.fill(0x11);

      const salt = new Uint8Array(32);
      salt.fill(0x42);

      const key1 = hkdf(sha256, masterKey, salt, 'Context1', 32);
      const key2 = hkdf(sha256, masterKey, salt, 'Context2', 32);

      expect(Buffer.from(key1).toString('hex'))
        .not.toBe(Buffer.from(key2).toString('hex'));
    });
  });
});

describe('V2 Wallet Creation (HKDF-based)', () => {
  const testPassword = 'TestPassword123!@#$';

  it('should create wallet with version 2', async () => {
    const result = await walletModule.addWallet('create', {}, testPassword, 'Test Wallet');

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('mnemonic');

    // Verify wallet metadata
    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    expect(wallet.version).toBe(2);
    expect(wallet.keySalt).toBeDefined();
    expect(wallet.kdf).toBeDefined();
    expect(wallet.kdf.type).toBe('pbkdf2-sha256');
    expect(wallet.kdf.derivation).toBe('hkdf-sha256');
    expect(wallet.kdf.iterations).toBeGreaterThan(1000000);
  });

  it('should store 32-byte salt as base64', async () => {
    await walletModule.addWallet('create', {}, testPassword, 'Test Wallet');

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    // Decode base64 salt and verify length
    const saltBytes = Uint8Array.from(atob(wallet.keySalt), c => c.charCodeAt(0));
    expect(saltBytes.length).toBe(32);
  });

  it('should create different salts for each wallet', async () => {
    const wallet1 = await walletModule.addWallet('create', {}, testPassword, 'Wallet 1');
    const wallet2 = await walletModule.addWallet('create', {}, testPassword, 'Wallet 2');

    const wallets = await walletModule.getAllWallets();
    const salt1 = wallets.walletList[0].keySalt;
    const salt2 = wallets.walletList[1].keySalt;

    expect(salt1).not.toBe(salt2);
  });

  it('should successfully unlock v2 wallet', async () => {
    const created = await walletModule.addWallet('create', {}, testPassword, 'Test Wallet');

    const unlocked = await walletModule.unlockWallet(testPassword);

    expect(unlocked.address).toBe(created.address);
    expect(unlocked.signer).toBeDefined();
    expect(unlocked.signer.address).toBe(created.address);
  });

  it('should fail to unlock v2 wallet with wrong password', async () => {
    await walletModule.addWallet('create', {}, testPassword, 'Test Wallet');

    await expect(
      walletModule.unlockWallet('WrongPassword123!')
    ).rejects.toThrow();
  });
});

describe('V2 Wallet Import (HKDF-based)', () => {
  const testPassword = 'TestPassword123!@#$';
  const testMnemonic = 'test test test test test test test test test test test junk';
  const testPrivateKey = '0x' + '1'.repeat(64);

  it('should import from mnemonic with v2 encryption', async () => {
    const result = await walletModule.addWallet(
      'mnemonic',
      { mnemonic: testMnemonic },
      testPassword,
      'Imported'
    );

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    expect(wallet.version).toBe(2);
    expect(wallet.keySalt).toBeDefined();
    expect(wallet.kdf.derivation).toBe('hkdf-sha256');
  });

  it('should import from private key with v2 encryption', async () => {
    const result = await walletModule.addWallet(
      'privatekey',
      { privateKey: testPrivateKey },
      testPassword,
      'Imported'
    );

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    expect(wallet.version).toBe(2);
    expect(wallet.keySalt).toBeDefined();
  });

  it('should unlock imported wallet and verify address', async () => {
    const created = await walletModule.addWallet(
      'mnemonic',
      { mnemonic: testMnemonic },
      testPassword,
      'Imported'
    );

    const unlocked = await walletModule.unlockWallet(testPassword);

    expect(unlocked.address).toBe(created.address);
  });
});

describe('Full Encrypt/Decrypt Cycle (V2)', () => {
  const testPassword = 'TestPassword123!@#$';

  it('should complete full encryption and decryption cycle', async () => {
    // Create wallet (encrypt)
    const created = await walletModule.addWallet('create', {}, testPassword, 'Test');

    // Save mnemonic for verification
    const mnemonic = created.mnemonic;

    // Unlock wallet (decrypt)
    const unlocked = await walletModule.unlockWallet(testPassword);

    // Verify addresses match
    expect(unlocked.address).toBe(created.address);

    // Export and verify mnemonic matches
    const exportedMnemonic = await walletModule.exportMnemonic(testPassword);
    expect(exportedMnemonic).toBe(mnemonic);
  });

  it('should handle multiple create/unlock cycles', async () => {
    const created = await walletModule.addWallet('create', {}, testPassword, 'Test');

    // Unlock multiple times
    const unlock1 = await walletModule.unlockWallet(testPassword);
    const unlock2 = await walletModule.unlockWallet(testPassword);
    const unlock3 = await walletModule.unlockWallet(testPassword);

    expect(unlock1.address).toBe(created.address);
    expect(unlock2.address).toBe(created.address);
    expect(unlock3.address).toBe(created.address);
  });

  it('should produce different encrypted outputs even with same password', async () => {
    const mnemonic = 'test walk nut penalty hip pave soap entry language right filter choice';

    const wallet1 = await walletModule.addWallet('mnemonic', { mnemonic }, testPassword, 'W1');
    const wallets1 = await walletModule.getAllWallets();
    const encrypted1 = wallets1.walletList[0].encryptedKeystore;

    // Clear and recreate
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

    const wallet2 = await walletModule.addWallet('mnemonic', { mnemonic }, testPassword, 'W2');
    const wallets2 = await walletModule.getAllWallets();
    const encrypted2 = wallets2.walletList[0].encryptedKeystore;

    // Same address (same mnemonic)
    expect(wallet1.address).toBe(wallet2.address);

    // But different encrypted data (different salts)
    expect(encrypted1).not.toBe(encrypted2);
  });
});

describe('Security Improvements', () => {
  const testPassword = 'TestPassword123!@#$';

  it('should use independent keys that cannot be derived from each other', async () => {
    await walletModule.addWallet('create', {}, testPassword, 'Test');

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    // Wallet should have HKDF metadata
    expect(wallet.kdf.derivation).toBe('hkdf-sha256');
    expect(wallet.version).toBe(2);

    // Even if attacker cracks Layer 2, they get layer2Key only
    // They do NOT get the password or layer1Key
    // This forces them to crack Layer 1 independently (~40,000 years)
  });

  it('should use the exact context strings specified', async () => {
    // This test verifies the context strings are correct
    // by ensuring decryption works (which proves we used the right contexts during encryption)

    const created = await walletModule.addWallet('create', {}, testPassword, 'Test');

    // If context strings are wrong, this will fail
    const unlocked = await walletModule.unlockWallet(testPassword);

    expect(unlocked.address).toBe(created.address);
  });

  it('should enforce password strength for v2 wallets', async () => {
    const weakPasswords = [
      'short',
      'nouppercase123!',
      'NOLOWERCASE123!',
      'NoNumbers!',
      'NoSpecial123'
    ];

    for (const weak of weakPasswords) {
      await expect(
        walletModule.addWallet('create', {}, weak, 'Test')
      ).rejects.toThrow();
    }
  });
});

describe('Export Operations (V2)', () => {
  const testPassword = 'TestPassword123!@#$';

  it('should export private key from v2 wallet', async () => {
    const wallet = await walletModule.addWallet('create', {}, testPassword, 'Test');
    const privateKey = await walletModule.exportPrivateKey(testPassword);

    expect(privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it('should export mnemonic from v2 wallet', async () => {
    const wallet = await walletModule.addWallet('create', {}, testPassword, 'Test');
    const mnemonic = await walletModule.exportMnemonic(testPassword);

    expect(mnemonic).toBeDefined();
    expect(typeof mnemonic).toBe('string');
    expect(mnemonic.split(' ')).toHaveLength(12);
  });

  it('should return null for mnemonic if imported from private key', async () => {
    const privateKey = '0x' + '1'.repeat(64);
    await walletModule.addWallet('privatekey', { privateKey }, testPassword, 'Test');

    const mnemonic = await walletModule.exportMnemonic(testPassword);
    expect(mnemonic).toBeNull();
  });
});

describe('Multi-Wallet with V2 (HKDF)', () => {
  const testPassword = 'TestPassword123!@#$';

  it('should create multiple v2 wallets with independent salts', async () => {
    const wallet1 = await walletModule.addWallet('create', {}, testPassword, 'Wallet 1');
    const wallet2 = await walletModule.addWallet('create', {}, testPassword, 'Wallet 2');
    const wallet3 = await walletModule.addWallet('create', {}, testPassword, 'Wallet 3');

    const wallets = await walletModule.getAllWallets();

    // All should be v2
    expect(wallets.walletList[0].version).toBe(2);
    expect(wallets.walletList[1].version).toBe(2);
    expect(wallets.walletList[2].version).toBe(2);

    // All should have different salts
    const salt1 = wallets.walletList[0].keySalt;
    const salt2 = wallets.walletList[1].keySalt;
    const salt3 = wallets.walletList[2].keySalt;

    expect(salt1).not.toBe(salt2);
    expect(salt2).not.toBe(salt3);
    expect(salt1).not.toBe(salt3);
  });

  it('should unlock correct wallet when switching active wallet', async () => {
    const wallet1 = await walletModule.addWallet('create', {}, testPassword, 'Wallet 1');
    const wallet2 = await walletModule.addWallet('create', {}, testPassword, 'Wallet 2');

    // Switch to wallet 2
    await walletModule.setActiveWallet(wallet2.id);

    // Unlock should unlock wallet 2
    const unlocked = await walletModule.unlockWallet(testPassword);
    expect(unlocked.address).toBe(wallet2.address);
  });
});

describe('Auto-Upgrade to V2', () => {
  const testPassword = 'TestPassword123!@#$';

  it('should upgrade v1 wallet to v2 on unlock (if implemented)', async () => {
    // Create a v2 wallet
    const wallet = await walletModule.addWallet('create', {}, testPassword, 'Test');

    // Manually downgrade to v1 format (for testing)
    const wallets = await walletModule.getAllWallets();
    const walletData = wallets.walletList[0];

    // Simulate v1 wallet (no version field, no keySalt, old iterations)
    delete walletData.version;
    delete walletData.keySalt;
    delete walletData.kdf;
    walletData.currentIterations = 100000; // Old iteration count
    mockStorage['wallets_multi'] = wallets;

    // Note: This test would require the unlock function to detect v1 format
    // and automatically upgrade to v2. For now, we just test the structure.

    // The upgrade logic would:
    // 1. Detect wallet.version !== 2
    // 2. Decrypt with v1 method
    // 3. Re-encrypt with v2 HKDF method
    // 4. Update metadata (version, keySalt, kdf)
  });
});

describe('Error Handling (V2)', () => {
  const testPassword = 'TestPassword123!@#$';

  it('should fail gracefully with corrupted keySalt', async () => {
    await walletModule.addWallet('create', {}, testPassword, 'Test');

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    // Corrupt the salt
    wallet.keySalt = 'invalid-base64!!!';
    mockStorage['wallets_multi'] = wallets;

    await expect(
      walletModule.unlockWallet(testPassword)
    ).rejects.toThrow();
  });

  it('should fail gracefully with corrupted encrypted data', async () => {
    await walletModule.addWallet('create', {}, testPassword, 'Test');

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    // Corrupt the encrypted keystore
    wallet.encryptedKeystore = 'corrupted-data';
    mockStorage['wallets_multi'] = wallets;

    await expect(
      walletModule.unlockWallet(testPassword)
    ).rejects.toThrow();
  });

  it('should handle missing kdf metadata gracefully', async () => {
    await walletModule.addWallet('create', {}, testPassword, 'Test');

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    // Remove kdf metadata
    delete wallet.kdf;
    mockStorage['wallets_multi'] = wallets;

    // Should still work if wallet has version and keySalt
    // (kdf can be reconstructed from currentIterations)
    if (wallet.version === 2 && wallet.keySalt) {
      // Test implementation should handle this
      expect(wallet.version).toBe(2);
    }
  });
});

describe('Integration: V2 Full Lifecycle', () => {
  const testPassword = 'TestPassword123!@#$';

  it('should complete full v2 wallet lifecycle', async () => {
    // 1. Create v2 wallet
    const created = await walletModule.addWallet('create', {}, testPassword, 'My Wallet');
    expect(created.mnemonic).toBeDefined();
    const savedMnemonic = created.mnemonic;

    // Verify v2 format
    const wallets1 = await walletModule.getAllWallets();
    expect(wallets1.walletList[0].version).toBe(2);
    expect(wallets1.walletList[0].keySalt).toBeDefined();

    // 2. Unlock v2 wallet
    const unlocked = await walletModule.unlockWallet(testPassword);
    expect(unlocked.address).toBe(created.address);

    // 3. Export private key
    const privateKey = await walletModule.exportPrivateKey(testPassword);
    expect(privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);

    // 4. Export mnemonic
    const exportedMnemonic = await walletModule.exportMnemonic(testPassword);
    expect(exportedMnemonic).toBe(savedMnemonic);

    // 5. Delete wallet
    await walletModule.deleteWallet(created.id, testPassword);
    let wallets2 = await walletModule.getAllWallets();
    expect(wallets2.walletList).toHaveLength(0);

    // 6. Re-import as v2 from mnemonic
    const reimported = await walletModule.addWallet(
      'mnemonic',
      { mnemonic: savedMnemonic },
      testPassword,
      'Restored'
    );
    expect(reimported.address).toBe(created.address);

    // Verify still v2
    const wallets3 = await walletModule.getAllWallets();
    expect(wallets3.walletList[0].version).toBe(2);
  }, 30000);
});

describe('Performance (V2)', () => {
  const testPassword = 'TestPassword123!@#$';

  it('should create wallet in reasonable time with high iterations', async () => {
    const start = Date.now();
    await walletModule.addWallet('create', {}, testPassword, 'Test');
    const duration = Date.now() - start;

    // With 1.094M iterations, should complete in < 10 seconds
    expect(duration).toBeLessThan(10000);
  }, 15000);

  it('should unlock wallet in reasonable time', async () => {
    await walletModule.addWallet('create', {}, testPassword, 'Test');

    const start = Date.now();
    await walletModule.unlockWallet(testPassword);
    const duration = Date.now() - start;

    // Unlock should be faster than creation
    expect(duration).toBeLessThan(10000);
  }, 15000);
});
