/**
 * tests/unit/erc20.test.js
 *
 * Unit tests for ERC-20 token contract interface
 */

import { describe, it, expect, vi } from 'vitest';
import { parseUnits, formatUnits } from 'ethers';
import {
  formatTokenBalance,
  parseTokenAmount
} from '../../src/core/erc20.js';

describe('erc20.js', () => {
  describe('formatTokenBalance', () => {
    it('should format 18 decimal token balance', () => {
      const balanceWei = parseUnits('100.123456', 18).toString();

      const formatted = formatTokenBalance(balanceWei, 18, 4);

      expect(formatted).toBe('100.1235'); // Rounded to 4 decimals
    });

    it('should format 6 decimal token balance (USDC)', () => {
      const balanceWei = parseUnits('50.123456', 6).toString();

      const formatted = formatTokenBalance(balanceWei, 6, 4);

      expect(formatted).toBe('50.1235');
    });

    it('should format 8 decimal token balance (HEX)', () => {
      const balanceWei = parseUnits('1000.12345678', 8).toString();

      const formatted = formatTokenBalance(balanceWei, 8, 4);

      expect(formatted).toBe('1000.1235');
    });

    it('should use default 4 decimals when not specified', () => {
      const balanceWei = parseUnits('42.987654321', 18).toString();

      const formatted = formatTokenBalance(balanceWei, 18);

      expect(formatted).toBe('42.9877');
    });

    it('should handle custom display decimals', () => {
      const balanceWei = parseUnits('10.123456789', 18).toString();

      const formatted2 = formatTokenBalance(balanceWei, 18, 2);
      const formatted6 = formatTokenBalance(balanceWei, 18, 6);
      const formatted8 = formatTokenBalance(balanceWei, 18, 8);

      expect(formatted2).toBe('10.12');
      expect(formatted6).toBe('10.123457');
      expect(formatted8).toBe('10.12345679');
    });

    it('should handle zero balance', () => {
      const formatted = formatTokenBalance('0', 18, 4);

      expect(formatted).toBe('0.0000');
    });

    it('should handle very small balances', () => {
      const balanceWei = '1'; // 1 wei of 18 decimal token

      const formatted = formatTokenBalance(balanceWei, 18, 4);

      expect(formatted).toBe('0.0000');
    });

    it('should handle very large balances', () => {
      const balanceWei = parseUnits('999999999.123456', 18).toString();

      const formatted = formatTokenBalance(balanceWei, 18, 4);

      expect(formatted).toBe('999999999.1235');
    });

    it('should return default on invalid input', () => {
      const formatted = formatTokenBalance('invalid', 18, 4);

      expect(formatted).toBe('0.0000');
    });

    it('should format different decimal tokens correctly', () => {
      // 18 decimals (standard ERC-20)
      const balance18 = parseUnits('1.5', 18).toString();
      expect(formatTokenBalance(balance18, 18, 2)).toBe('1.50');

      // 6 decimals (USDC/USDT)
      const balance6 = parseUnits('1.5', 6).toString();
      expect(formatTokenBalance(balance6, 6, 2)).toBe('1.50');

      // 8 decimals (HEX)
      const balance8 = parseUnits('1.5', 8).toString();
      expect(formatTokenBalance(balance8, 8, 2)).toBe('1.50');
    });
  });

  describe('parseTokenAmount', () => {
    it('should parse 18 decimal token amount', () => {
      const parsed = parseTokenAmount('100.5', 18);

      expect(parsed).toBe(parseUnits('100.5', 18).toString());
    });

    it('should parse 6 decimal token amount (USDC)', () => {
      const parsed = parseTokenAmount('50.25', 6);

      expect(parsed).toBe(parseUnits('50.25', 6).toString());
    });

    it('should parse 8 decimal token amount (HEX)', () => {
      const parsed = parseTokenAmount('1000.12345678', 8);

      expect(parsed).toBe(parseUnits('1000.12345678', 8).toString());
    });

    it('should handle whole numbers', () => {
      const parsed = parseTokenAmount('42', 18);

      expect(parsed).toBe(parseUnits('42', 18).toString());
    });

    it('should handle decimal numbers', () => {
      const parsed = parseTokenAmount('0.123456789', 18);

      expect(parsed).toBe(parseUnits('0.123456789', 18).toString());
    });

    it('should handle very small amounts', () => {
      const parsed = parseTokenAmount('0.000001', 18);

      expect(parsed).toBe(parseUnits('0.000001', 18).toString());
    });

    it('should handle very large amounts', () => {
      const parsed = parseTokenAmount('1000000000', 18);

      expect(parsed).toBe(parseUnits('1000000000', 18).toString());
    });

    it('should parse amounts for different decimal tokens', () => {
      // 18 decimals
      const amount18 = parseTokenAmount('123.456', 18);
      expect(amount18).toBe(parseUnits('123.456', 18).toString());

      // 6 decimals
      const amount6 = parseTokenAmount('123.456', 6);
      expect(amount6).toBe(parseUnits('123.456', 6).toString());

      // 8 decimals
      const amount8 = parseTokenAmount('123.456', 8);
      expect(amount8).toBe(parseUnits('123.456', 8).toString());
    });

    it('should handle maximum precision for different decimals', () => {
      // Max precision for 18 decimals
      const max18 = parseTokenAmount('1.123456789012345678', 18);
      expect(max18).toBe(parseUnits('1.123456789012345678', 18).toString());

      // Max precision for 6 decimals
      const max6 = parseTokenAmount('1.123456', 6);
      expect(max6).toBe(parseUnits('1.123456', 6).toString());

      // Max precision for 8 decimals
      const max8 = parseTokenAmount('1.12345678', 8);
      expect(max8).toBe(parseUnits('1.12345678', 8).toString());
    });
  });

  describe('integration: format and parse', () => {
    it('should round-trip format and parse correctly', () => {
      const originalAmount = '100.123456';
      const decimals = 18;

      // Parse to wei
      const wei = parseTokenAmount(originalAmount, decimals);

      // Format back to human-readable
      const formatted = formatTokenBalance(wei, decimals, 6);

      expect(formatted).toBe('100.123456');
    });

    it('should handle round-trip for different decimal values', () => {
      // 6 decimals (USDC)
      const usdc = parseTokenAmount('50.25', 6);
      const usdcFormatted = formatTokenBalance(usdc, 6, 2);
      expect(usdcFormatted).toBe('50.25');

      // 8 decimals (HEX)
      const hex = parseTokenAmount('1000.12', 8);
      const hexFormatted = formatTokenBalance(hex, 8, 2);
      expect(hexFormatted).toBe('1000.12');

      // 18 decimals (standard)
      const standard = parseTokenAmount('999.99', 18);
      const standardFormatted = formatTokenBalance(standard, 18, 2);
      expect(standardFormatted).toBe('999.99');
    });

    it('should handle precision loss gracefully', () => {
      const originalAmount = '100.123456789';
      const decimals = 18;

      // Parse to wei
      const wei = parseTokenAmount(originalAmount, decimals);

      // Format with limited display decimals
      const formatted = formatTokenBalance(wei, decimals, 4);

      // Should be rounded
      expect(formatted).toBe('100.1235');
    });

    it('should handle very small amounts in round-trip', () => {
      const small = parseTokenAmount('0.000001', 18);
      const formatted = formatTokenBalance(small, 18, 6);
      expect(formatted).toBe('0.000001');
    });

    it('should handle very large amounts in round-trip', () => {
      const large = parseTokenAmount('1000000.123', 18);
      const formatted = formatTokenBalance(large, 18, 3);
      expect(formatted).toBe('1000000.123');
    });
  });
});
