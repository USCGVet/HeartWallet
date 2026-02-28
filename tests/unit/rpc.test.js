/**
 * tests/unit/rpc.test.js
 *
 * Unit tests for RPC module - formatBalance and response validation logic
 * Tests the exported pure functions without requiring live network connections
 */

import { describe, it, expect } from 'vitest';
import { formatBalance } from '../../src/core/rpc.js';

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
});
