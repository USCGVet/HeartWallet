/**
 * tests/unit/popup-format.test.js
 *
 * Unit tests for the popup's formatting and network helpers, extracted out of
 * popup.js so they can actually be imported and tested.
 */

import { describe, it, expect } from 'vitest';
import { parseUnits } from 'ethers';
import {
  formatGweiSmart,
  formatBalanceWithCommas,
  withCommas
} from '../../src/popup/lib/format.js';
import {
  getExplorerUrl,
  getNetworkSymbol,
  getNetworkName,
  NETWORK_NAMES
} from '../../src/popup/lib/networks.js';

describe('popup/lib/format.js', () => {
  describe('withCommas', () => {
    it('should group thousands', () => {
      expect(withCommas(1000)).toBe('1,000');
      expect(withCommas(1234567)).toBe('1,234,567');
    });

    it('should leave short numbers alone', () => {
      expect(withCommas(0)).toBe('0');
      expect(withCommas(999)).toBe('999');
    });
  });

  describe('formatGweiSmart', () => {
    it('should show no decimals for PulseChain-scale prices (millions of Gwei)', () => {
      // 2,500,000 Gwei
      expect(formatGweiSmart(parseUnits('2500000', 9))).toBe('2,500,000');
    });

    it('should show no decimals for thousands of Gwei', () => {
      expect(formatGweiSmart(parseUnits('1500', 9))).toBe('1,500');
    });

    it('should show 2 decimals for normal Gwei', () => {
      expect(formatGweiSmart(parseUnits('25.5', 9))).toBe('25.50');
    });

    it('should show 3 decimals for sub-Gwei', () => {
      expect(formatGweiSmart(parseUnits('0.05', 9))).toBe('0.050');
    });

    it('should show 6 decimals for very low values', () => {
      expect(formatGweiSmart(1000n)).toBe('0.000001');
    });

    it('should accept bigint, string and number input', () => {
      const wei = parseUnits('25', 9);
      expect(formatGweiSmart(wei)).toBe('25.00');
      expect(formatGweiSmart(wei.toString())).toBe('25.00');
      expect(formatGweiSmart(Number(wei))).toBe('25.00');
    });

    it('should use commas, never a locale-specific separator', () => {
      // The formatted value is parsed back elsewhere, so a '.' group separator
      // would corrupt it. Guard against a toLocaleString regression.
      const out = formatGweiSmart(parseUnits('1234567', 9));
      expect(out).toBe('1,234,567');
      expect(out).not.toContain('.');
    });

    it('should handle zero', () => {
      expect(formatGweiSmart(0n)).toBe('0.000000');
    });
  });

  describe('formatBalanceWithCommas', () => {
    it('should add commas to the integer part and keep the decimals', () => {
      const out = formatBalanceWithCommas('1234567.8912', 18);
      expect(out.display).toBe('1,234,567.8912');
    });

    it('should build a full-precision tooltip', () => {
      const out = formatBalanceWithCommas('1000.5', 8);
      expect(out.tooltip).toBe('Full precision: 1,000.50000000');
    });

    it('should pass through unparseable input unchanged', () => {
      const out = formatBalanceWithCommas('not-a-number');
      expect(out.display).toBe('not-a-number');
      expect(out.tooltip).toBe('not-a-number');
    });

    it('should handle integers with no decimal point', () => {
      expect(formatBalanceWithCommas('5000', 2).display).toBe('5,000');
    });

    it('should handle zero', () => {
      expect(formatBalanceWithCommas('0', 2).display).toBe('0');
    });
  });
});

describe('popup/lib/networks.js', () => {
  describe('getNetworkSymbol', () => {
    it('should return the native symbol per network', () => {
      expect(getNetworkSymbol('pulsechain')).toBe('PLS');
      expect(getNetworkSymbol('pulsechainTestnet')).toBe('tPLS');
      expect(getNetworkSymbol('ethereum')).toBe('ETH');
      expect(getNetworkSymbol('sepolia')).toBe('SepoliaETH');
    });

    it('should default to ETH for unknown networks', () => {
      expect(getNetworkSymbol('nope')).toBe('ETH');
      expect(getNetworkSymbol(undefined)).toBe('ETH');
    });
  });

  describe('getNetworkName', () => {
    it('should match the NETWORK_NAMES table', () => {
      // These were duplicated tables in popup.js before extraction; this pins
      // that they cannot drift apart again.
      for (const [key, name] of Object.entries(NETWORK_NAMES)) {
        expect(getNetworkName(key)).toBe(name);
      }
    });

    it('should fall back to the raw key when unknown', () => {
      expect(getNetworkName('someFutureChain')).toBe('someFutureChain');
    });
  });

  describe('getExplorerUrl', () => {
    const HASH = '0xabc123';
    const ADDR = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    it('should build tx URLs', () => {
      expect(getExplorerUrl('ethereum', 'tx', HASH))
        .toBe('https://etherscan.io/tx/0xabc123');
    });

    it('should build address URLs', () => {
      expect(getExplorerUrl('sepolia', 'address', ADDR))
        .toBe(`https://sepolia.etherscan.io/address/${ADDR}`);
    });

    it('should build token URLs', () => {
      expect(getExplorerUrl('pulsechainTestnet', 'token', ADDR))
        .toBe(`https://scan.v4.testnet.pulsechain.com/token/${ADDR}`);
    });

    it('should handle the hash-routed PulseChain explorer', () => {
      expect(getExplorerUrl('pulsechain', 'tx', HASH)).toContain('#/tx/0xabc123');
    });

    it('should return empty string for unknown network or type', () => {
      expect(getExplorerUrl('nope', 'tx', HASH)).toBe('');
      expect(getExplorerUrl('ethereum', 'nope', HASH)).toBe('');
    });
  });
});
