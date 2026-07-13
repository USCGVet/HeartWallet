/**
 * tests/unit/rpc.test.js
 *
 * Unit tests for RPC module - formatBalance and response validation logic
 * Tests the exported pure functions without requiring live network connections
 */

import { describe, it, expect } from 'vitest';
import { formatBalance, computeEip1559Fees } from '../../src/core/rpc.js';

describe('rpc.js', () => {
  describe('formatBalance', () => {
    it('should format 1 ETH correctly', () => {
      const oneEthWei = '0x' + BigInt('1000000000000000000').toString(16);
      expect(formatBalance(oneEthWei, 4)).toBe('1.0000');
    });

    it('should format 0 balance', () => {
      expect(formatBalance('0x0', 4)).toBe('0.0000');
    });

    it('should format small amounts', () => {
      // 0.001 ETH
      const wei = '0x' + BigInt('1000000000000000').toString(16);
      expect(formatBalance(wei, 4)).toBe('0.0010');
    });

    it('should format large balances', () => {
      // 1000 ETH
      const wei = '0x' + BigInt('1000000000000000000000').toString(16);
      const result = formatBalance(wei, 2);
      expect(result).toBe('1000.00');
    });

    it('should respect decimal parameter', () => {
      const oneEthWei = '0x' + BigInt('1000000000000000000').toString(16);
      expect(formatBalance(oneEthWei, 2)).toBe('1.00');
      expect(formatBalance(oneEthWei, 8)).toBe('1.00000000');
    });

    it('should default to 4 decimals', () => {
      const oneEthWei = '0x' + BigInt('1000000000000000000').toString(16);
      expect(formatBalance(oneEthWei)).toBe('1.0000');
    });

    it('should handle fractional amounts', () => {
      // 1.23456789 ETH
      const wei = '0x' + BigInt('1234567890000000000').toString(16);
      expect(formatBalance(wei, 4)).toBe('1.2346'); // rounded
    });
  });

  describe('computeEip1559Fees', () => {
    const base = 400000n * (10n ** 9n); // 400,000 gwei base fee, in wei

    it('produces a generous cap = base*4 + tip and passes the tip through', () => {
      const tip = 20000n * (10n ** 9n);
      const { maxFeePerGas, maxPriorityFeePerGas } = computeEip1559Fees(base, tip);
      expect(maxFeePerGas).toBe(base * 4n + tip);
      expect(maxPriorityFeePerGas).toBe(tip);
    });

    it('applies a 5% base-fee tip floor when none is supplied', () => {
      const { maxPriorityFeePerGas } = computeEip1559Fees(base, 0n);
      expect(maxPriorityFeePerGas).toBe(base / 20n);
    });

    it('honors a higher preferred max fee as a floor', () => {
      const huge = base * 10n;
      const { maxFeePerGas } = computeEip1559Fees(base, 0n, huge.toString());
      expect(maxFeePerGas).toBe(huge);
    });

    it('ignores a lower preferred max fee (keeps the robust cap)', () => {
      const { maxFeePerGas } = computeEip1559Fees(base, 0n, base.toString());
      expect(maxFeePerGas).toBe(base * 4n + base / 20n);
    });

    it('accepts a hex-string base fee', () => {
      const { maxFeePerGas } = computeEip1559Fees('0x' + base.toString(16), 0n);
      expect(maxFeePerGas).toBe(base * 4n + base / 20n);
    });
  });
});
