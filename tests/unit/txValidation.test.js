/**
 * tests/unit/txValidation.test.js
 *
 * Unit tests for transaction validation - the main defense against malicious dApp transactions
 */

import { describe, it, expect } from 'vitest';
import { validateTransactionRequest, sanitizeErrorMessage } from '../../src/core/txValidation.js';

const VALID_ADDRESS = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
const VALID_ADDRESS_2 = '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359';

describe('txValidation.js', () => {
  describe('validateTransactionRequest', () => {

    // ===== VALID TRANSACTIONS =====

    it('should accept a valid simple transfer', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        value: '0xde0b6b3a7640000', // 1 ETH in wei
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized.to).toBeDefined();
      expect(result.sanitized.value).toBe('0xde0b6b3a7640000');
    });

    it('should accept a valid transaction with all fields', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        from: VALID_ADDRESS_2,
        value: '0x1',
        data: '0xa9059cbb',
        gas: '0x5208',      // 21000
        gasPrice: '0x3b9aca00', // 1 Gwei
        nonce: '0x0'
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept contract creation (data only, no to)', () => {
      const result = validateTransactionRequest({
        data: '0x6060604052341561000f57600080fd',
        value: '0x0'
      });
      expect(result.valid).toBe(true);
    });

    it('should default value to 0x0 when not provided', () => {
      const result = validateTransactionRequest({ to: VALID_ADDRESS });
      expect(result.valid).toBe(true);
      expect(result.sanitized.value).toBe('0x0');
    });

    it('should default data to 0x when not provided', () => {
      const result = validateTransactionRequest({ to: VALID_ADDRESS });
      expect(result.sanitized.data).toBe('0x');
    });

    it('should normalize to address to checksum format', () => {
      const result = validateTransactionRequest({
        to: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed', // lowercase
        value: '0x0'
      });
      expect(result.valid).toBe(true);
      expect(result.sanitized.to).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
    });

    it('should accept nonce as number', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        nonce: 5
      });
      expect(result.valid).toBe(true);
      expect(result.sanitized.nonce).toBe(5);
    });

    // ===== INVALID ADDRESS FIELDS =====

    it('should reject non-string to address', () => {
      const result = validateTransactionRequest({
        to: 12345,
        data: '0xabcd'
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('"to" field must be a string'))).toBe(true);
    });

    it('should reject invalid hex to address', () => {
      const result = validateTransactionRequest({
        to: '0xINVALID',
        data: '0xabcd'
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('"to" field must be a valid Ethereum address'))).toBe(true);
    });

    it('should reject to address with wrong length', () => {
      const result = validateTransactionRequest({
        to: '0x1234',
        data: '0xabcd'
      });
      expect(result.valid).toBe(false);
    });

    it('should reject non-string from address', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        from: 999
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('"from" field must be a string'))).toBe(true);
    });

    // ===== INVALID VALUE FIELD =====

    it('should reject non-hex value', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        value: 'not-hex'
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('"value" field must be a valid hex'))).toBe(true);
    });

    // ===== INVALID DATA FIELD =====

    it('should reject non-string data', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        data: 12345
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('"data" field must be a string'))).toBe(true);
    });

    it('should reject data with odd hex length', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        data: '0xabc' // odd number of hex chars
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('"data" field must be valid hex data'))).toBe(true);
    });

    it('should accept empty data 0x', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        data: '0x'
      });
      expect(result.valid).toBe(true);
    });

    // ===== GAS LIMIT VALIDATION =====

    it('should reject gas below 21000', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gas: '0x1' // 1 gas
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('gas" limit too low'))).toBe(true);
    });

    it('should reject gas above 10M', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gas: '0x' + (10000001).toString(16)
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('gas" limit too high'))).toBe(true);
    });

    it('should accept gas at exactly 21000', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gas: '0x5208' // 21000
      });
      expect(result.valid).toBe(true);
      expect(result.sanitized.gas).toBe('0x5208');
    });

    it('should accept gas at exactly 10M', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gas: '0x' + (10000000).toString(16)
      });
      expect(result.valid).toBe(true);
    });

    it('should validate gasLimit the same as gas', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gasLimit: '0x1' // too low
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('"gasLimit" too low'))).toBe(true);
    });

    // ===== GAS PRICE VALIDATION =====

    it('should reject gasPrice exceeding max Gwei', () => {
      // 1001 Gwei in hex
      const gasPriceWei = BigInt(1001) * BigInt('1000000000');
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gasPrice: '0x' + gasPriceWei.toString(16)
      }, 1000);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('exceeds maximum'))).toBe(true);
    });

    it('should accept gasPrice within limit', () => {
      // 500 Gwei
      const gasPriceWei = BigInt(500) * BigInt('1000000000');
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gasPrice: '0x' + gasPriceWei.toString(16)
      }, 1000);
      expect(result.valid).toBe(true);
    });

    it('should use custom maxGasPriceGwei', () => {
      // 50 Gwei should fail with maxGasPriceGwei=10
      const gasPriceWei = BigInt(50) * BigInt('1000000000');
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gasPrice: '0x' + gasPriceWei.toString(16)
      }, 10);
      expect(result.valid).toBe(false);
    });

    it('should skip the gas price bound when maxGasPriceGwei is null', () => {
      // null means "caller has no basis for a bound" (RPC unreachable and nothing
      // cached). It must skip the check cleanly rather than throwing or rejecting -
      // a dApp gasPrice is discarded before signing regardless.
      const gasPriceWei = BigInt(10_000_000) * BigInt('1000000000');
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gasPrice: '0x' + gasPriceWei.toString(16)
      }, null);
      expect(result.valid).toBe(true);
      expect(result.sanitized.gasPrice).toBe('0x' + gasPriceWei.toString(16));
    });

    it('should still reject a negative gasPrice when the bound is skipped', () => {
      // Skipping the ceiling must not skip the other gasPrice checks
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gasPrice: '-0x1'
      }, null);
      expect(result.valid).toBe(false);
    });

    it('should still reject a malformed gasPrice when the bound is skipped', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        gasPrice: 'not-hex'
      }, null);
      expect(result.valid).toBe(false);
    });

    // ===== NONCE VALIDATION =====

    it('should reject unreasonably high nonce', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        nonce: '0x' + BigInt('9007199254740992').toString(16)
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('nonce" is unreasonably high'))).toBe(true);
    });

    it('should accept zero nonce', () => {
      const result = validateTransactionRequest({
        to: VALID_ADDRESS,
        nonce: '0x0'
      });
      expect(result.valid).toBe(true);
    });

    // ===== STRUCTURAL VALIDATION =====

    it('should reject transaction with no to and no data', () => {
      const result = validateTransactionRequest({});
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('must have "to" address or "data"'))).toBe(true);
    });

    it('should reject transaction with no to and empty data', () => {
      const result = validateTransactionRequest({ data: '0x' });
      expect(result.valid).toBe(false);
    });

    it('should report multiple errors at once', () => {
      const result = validateTransactionRequest({
        to: 'bad-address',
        value: 'not-hex',
        gas: '0x1',
        data: '0xabc' // odd
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('sanitizeErrorMessage', () => {
    it('should pass through normal error messages', () => {
      expect(sanitizeErrorMessage('Transaction failed')).toBe('Transaction failed');
    });

    it('should return Unknown error for non-string input', () => {
      expect(sanitizeErrorMessage(null)).toBe('Unknown error');
      expect(sanitizeErrorMessage(undefined)).toBe('Unknown error');
      expect(sanitizeErrorMessage(123)).toBe('Unknown error');
    });

    it('should strip HTML tags', () => {
      expect(sanitizeErrorMessage('<script>alert(1)</script>Error')).toBe('alert(1)Error');
    });

    it('should strip javascript: protocol', () => {
      expect(sanitizeErrorMessage('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should strip event handlers', () => {
      const result = sanitizeErrorMessage('onerror=alert(1)');
      expect(result).not.toContain('onerror=');
    });

    it('should remove null bytes and control characters', () => {
      expect(sanitizeErrorMessage('hello\x00world')).toBe('helloworld');
      expect(sanitizeErrorMessage('test\x01\x02\x03')).toBe('test');
    });

    it('should truncate messages over 500 characters', () => {
      const longMsg = 'A'.repeat(600);
      const result = sanitizeErrorMessage(longMsg);
      expect(result.length).toBeLessThanOrEqual(500);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should return Unknown error for empty string after sanitization', () => {
      expect(sanitizeErrorMessage('')).toBe('Unknown error');
    });
  });
});
