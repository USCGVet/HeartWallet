/**
 * tests/unit/wallet-v3.test.js
 *
 * Unit tests for v3 wallet encryption (Argon2id + HKDF)
 *
 * SECURITY: Tests two-layer encryption with cryptographically independent keys
 * PERFORMANCE: Uses mocked Argon2 worker for fast execution (~1ms vs 2-5 seconds)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ethers } from 'ethers';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';

// Mock storage
const mockStorage = {};
beforeEach(() => {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

  chrome.storage.local.get.mockImplementation((keys) => {
    if (keys === null) return Promise.resolve({ ...mockStorage });
    if (typeof keys === 'string') return Promise.resolve({ [keys]: mockStorage[keys] });
    if (Array.isArray(keys)) {
      const result = {};
      keys.forEach(key => {
        if (mockStorage[key] !== undefined) result[key] = mockStorage[key];
      });
      return Promise.resolve(result);
    }
    return Promise.resolve({});
  });

  chrome.storage.local.set.mockImplementation((items) => {
    Object.assign(mockStorage, items);
    return Promise.resolve();
  });

  chrome.storage.local.remove.mockImplementation((keys) => {
    const keyList = Array.isArray(keys) ? keys : [keys];
    keyList.forEach(key => delete mockStorage[key]);
    return Promise.resolve();
  });
});

// Import wallet module after mocks
const walletModule = await import('../../src/core/wallet.js');

const TEST_PASSWORD = 'TestPassword123!@#$';
const TEST_MNEMONIC = 'test test test test test test test test test test test junk';
const TEST_PRIVATE_KEY = '0x' + '1'.repeat(64);

// ===== HKDF KEY DERIVATION TESTS =====
describe('HKDF Key Derivation', () => {
  it('should generate different keys for Layer 1 and Layer 2', () => {
    const masterKey = new Uint8Array(32);
    crypto.getRandomValues(masterKey);
    const salt = new Uint8Array(32);
    crypto.getRandomValues(salt);

    const encoder = new TextEncoder();
    const layer1Key = hkdf(sha256, masterKey, salt, encoder.encode('HeartWallet-v3-Layer1-Scrypt'), 32);
    const layer2Key = hkdf(sha256, masterKey, salt, encoder.encode('HeartWallet-v3-Layer2-AES'), 32);

    expect(Buffer.from(layer1Key).toString('hex')).not.toBe(Buffer.from(layer2Key).toString('hex'));
    expect(layer1Key.length).toBe(32);
    expect(layer2Key.length).toBe(32);
  });

  it('should be deterministic (same input = same output)', () => {
    const masterKey = new Uint8Array(32).fill(0x42);
    const salt = new Uint8Array(32).fill(0x11);

    const encoder = new TextEncoder();
    const info = encoder.encode('HeartWallet-v3-Layer1-Scrypt');
    const key1 = hkdf(sha256, masterKey, salt, info, 32);
    const key2 = hkdf(sha256, masterKey, salt, info, 32);

    expect(Buffer.from(key1).toString('hex')).toBe(Buffer.from(key2).toString('hex'));
  });
});

// ===== V3 WALLET CREATION =====
describe('V3 Wallet Creation', () => {
  it('should create wallet with v3 Argon2id encryption', async () => {
    const result = await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Test Wallet');

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('mnemonic');
    expect(ethers.isAddress(result.address)).toBe(true);

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    expect(wallet.version).toBe(3);
    expect(wallet.keySalt).toBeDefined();
    expect(wallet.kdf).toBeDefined();
    expect(wallet.kdf.type).toBe('argon2id');
    expect(wallet.kdf.derivation).toBe('hkdf-sha256');
  });

  it('should store 32-byte salt as base64', async () => {
    await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Test Wallet');

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    const saltBytes = Uint8Array.from(atob(wallet.keySalt), c => c.charCodeAt(0));
    expect(saltBytes.length).toBe(32);
  });

  it('should create different salts for each wallet', async () => {
    await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Wallet 1');
    await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Wallet 2');

    const wallets = await walletModule.getAllWallets();
    expect(wallets.walletList[0].keySalt).not.toBe(wallets.walletList[1].keySalt);
  });
});

// ===== V3 WALLET UNLOCK =====
describe('V3 Wallet Unlock', () => {
  it('should unlock v3 wallet with correct password', async () => {
    const created = await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Test Wallet');
    const unlocked = await walletModule.unlockWallet(TEST_PASSWORD);

    expect(unlocked.address).toBe(created.address);
    expect(unlocked.signer).toBeDefined();
  });

  it('should fail to unlock with wrong password', async () => {
    await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Test Wallet');
    await expect(walletModule.unlockWallet('WrongPassword123!')).rejects.toThrow();
  });
});

// ===== V3 WALLET IMPORT =====
describe('V3 Wallet Import', () => {
  it('should import from mnemonic with v3 encryption', async () => {
    await walletModule.addWallet('mnemonic', { mnemonic: TEST_MNEMONIC }, TEST_PASSWORD, 'Imported');

    const wallets = await walletModule.getAllWallets();
    expect(wallets.walletList[0].version).toBe(3);
    expect(wallets.walletList[0].kdf.type).toBe('argon2id');
  });

  it('should import from private key with v3 encryption', async () => {
    await walletModule.addWallet('privatekey', { privateKey: TEST_PRIVATE_KEY }, TEST_PASSWORD, 'Imported');

    const wallets = await walletModule.getAllWallets();
    expect(wallets.walletList[0].version).toBe(3);
  });
});

// ===== EXPORT OPERATIONS =====
describe('V3 Export Operations', () => {
  it('should export private key', async () => {
    await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Test');
    const privateKey = await walletModule.exportPrivateKey(TEST_PASSWORD);

    expect(privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it('should export mnemonic for created wallet', async () => {
    const created = await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Test');
    const mnemonic = await walletModule.exportMnemonic(TEST_PASSWORD);

    expect(mnemonic).toBe(created.mnemonic);
  });

  it('should return null mnemonic for private key import', async () => {
    await walletModule.addWallet('privatekey', { privateKey: TEST_PRIVATE_KEY }, TEST_PASSWORD, 'Test');
    const mnemonic = await walletModule.exportMnemonic(TEST_PASSWORD);

    expect(mnemonic).toBeNull();
  });
});

// ===== MULTI-WALLET =====
describe('V3 Multi-Wallet', () => {
  it('should create multiple v3 wallets', async () => {
    await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Wallet 1');
    await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Wallet 2');

    const wallets = await walletModule.getAllWallets();
    expect(wallets.walletList).toHaveLength(2);
    expect(wallets.walletList.every(w => w.version === 3)).toBe(true);
  });

  it('should switch between wallets correctly', async () => {
    const w1 = await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Wallet 1');
    const w2 = await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Wallet 2');

    await walletModule.setActiveWallet(w2.id);
    const unlocked = await walletModule.unlockWallet(TEST_PASSWORD);

    expect(unlocked.address).toBe(w2.address);
  });
});

// ===== PASSWORD VALIDATION =====
describe('Password Validation', () => {
  it('should reject weak passwords', async () => {
    await expect(walletModule.addWallet('create', {}, 'short', 'Test')).rejects.toThrow();
    await expect(walletModule.addWallet('create', {}, 'nouppercase123!', 'Test')).rejects.toThrow();
  });
});

// ===== ERROR HANDLING =====
describe('Error Handling', () => {
  it('should fail with corrupted keySalt', async () => {
    await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Test');

    const wallets = await walletModule.getAllWallets();
    wallets.walletList[0].keySalt = 'invalid!!!';
    mockStorage['wallets_multi'] = wallets;

    await expect(walletModule.unlockWallet(TEST_PASSWORD)).rejects.toThrow();
  });

  it('should reject duplicate addresses', async () => {
    await walletModule.addWallet('mnemonic', { mnemonic: TEST_MNEMONIC }, TEST_PASSWORD, 'First');
    await expect(
      walletModule.addWallet('mnemonic', { mnemonic: TEST_MNEMONIC }, TEST_PASSWORD, 'Dup')
    ).rejects.toThrow(/already exists/);
  });
});

// ===== ARGON2 PARAMETERS =====
describe('Argon2id Parameters', () => {
  it('should use recommended parameters', async () => {
    await walletModule.addWallet('create', {}, TEST_PASSWORD, 'Test');

    const wallets = await walletModule.getAllWallets();
    const wallet = wallets.walletList[0];

    expect(wallet.kdf.memory).toBeGreaterThanOrEqual(262144);
    expect(wallet.kdf.iterations).toBeGreaterThanOrEqual(5);
  });
});

// ===== PBKDF2 ITERATIONS (legacy) =====
describe('PBKDF2 Iteration Recommendations', () => {
  const { getCurrentRecommendedIterations } = walletModule;

  it('should enforce minimum floor', () => {
    expect(getCurrentRecommendedIterations(2020)).toBe(1094000);
  });

  it('should cap at 5,000,000', () => {
    expect(getCurrentRecommendedIterations(2050)).toBe(5000000);
  });
});
