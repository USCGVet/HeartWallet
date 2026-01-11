/**
 * tests/unit/validation.test.js
 *
 * Unit tests for validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  isValidAddress,
  isValidMnemonic,
  isValidPrivateKey,
  validatePasswordStrength,
  shortenAddress
} from '../../src/core/validation.js';

describe('validation.js', () => {
  describe('isValidAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(isValidAddress('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidAddress('0xinvalid')).toBe(false);
      expect(isValidAddress('')).toBe(false);
    });
  });

  describe('isValidMnemonic', () => {
    it('should reject invalid mnemonics', () => {
      expect(isValidMnemonic('invalid mnemonic phrase')).toBe(false);
      expect(isValidMnemonic('')).toBe(false);
    });
  });

  describe('isValidPrivateKey', () => {
    it('should validate correct private keys with 0x prefix', () => {
      const key = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      expect(isValidPrivateKey(key)).toBe(true);
    });

    it('should reject invalid private keys', () => {
      expect(isValidPrivateKey('0xinvalid')).toBe(false);
      expect(isValidPrivateKey('123')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('MyStr0ng!Pass123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords that are too short', () => {
      const result = validatePasswordStrength('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten valid addresses', () => {
      const addr = '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359';
      expect(shortenAddress(addr)).toBe('0xfB69...d359');
    });

    it('should return invalid addresses unchanged', () => {
      expect(shortenAddress('invalid')).toBe('invalid');
    });
  });
});
