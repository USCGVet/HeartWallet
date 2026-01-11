/**
 * tests/unit/signing.test.js
 *
 * Unit tests for message signing functions (EIP-191 & EIP-712)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ethers } from 'ethers';
import {
  personalSign,
  signTypedData,
  validateSignRequest
} from '../../src/core/signing.js';

describe('signing.js', () => {
  let testWallet;
  let testSigner;

  beforeEach(() => {
    const testPrivateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    testWallet = new ethers.Wallet(testPrivateKey);
    testSigner = testWallet;
  });

  describe('personalSign', () => {
    it('should sign a simple text message', async () => {
      const message = 'Hello, World!';
      const signature = await personalSign(testSigner, message);
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
    });

    it('should handle empty messages', async () => {
      await expect(personalSign(testSigner, '')).rejects.toThrow('Message is required');
    });

    it('should reject invalid signer', async () => {
      await expect(personalSign(null, 'test')).rejects.toThrow('Invalid signer provided');
    });
  });

  describe('signTypedData', () => {
    const validTypedData = {
      domain: { name: 'Test DApp', version: '1', chainId: 369 },
      types: { Person: [{ name: 'name', type: 'string' }] },
      primaryType: 'Person',
      message: { name: 'Alice' }
    };

    it('should sign valid typed data', async () => {
      const signature = await signTypedData(testSigner, validTypedData);
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
    });

    it('should reject typed data without domain', async () => {
      const invalidData = { ...validTypedData, domain: undefined };
      await expect(signTypedData(testSigner, invalidData)).rejects.toThrow('missing domain, types, or message');
    });
  });

  describe('validateSignRequest', () => {
    const validAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    it('should validate correct personal_sign request', () => {
      const result = validateSignRequest('personal_sign', ['Hello, World!', validAddress]);
      expect(result.valid).toBe(true);
    });

    it('should reject null params', () => {
      const result = validateSignRequest('personal_sign', null);
      expect(result.valid).toBe(false);
    });
  });
});
