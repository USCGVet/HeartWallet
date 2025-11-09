/**
 * tests/unit/tokens.test.js
 *
 * Unit tests for token management functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCustomTokens,
  getEnabledDefaultTokens,
  getAllTokens,
  addCustomToken,
  removeCustomToken,
  toggleDefaultToken,
  isDefaultTokenEnabled,
  DEFAULT_TOKENS
} from '../../src/core/tokens.js';
import * as storage from '../../src/core/storage.js';
import * as erc20 from '../../src/core/erc20.js';

// Mock the storage module
vi.mock('../../src/core/storage.js', () => ({
  load: vi.fn(),
  save: vi.fn()
}));

// Mock the erc20 module
vi.mock('../../src/core/erc20.js', () => ({
  validateTokenContract: vi.fn(),
  getTokenMetadata: vi.fn()
}));

describe('tokens.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCustomTokens', () => {
    it('should return custom tokens from storage', async () => {
      const mockTokens = [
        { address: '0x123...', symbol: 'TEST', decimals: 18 }
      ];
      storage.load.mockResolvedValue(mockTokens);

      const result = await getCustomTokens('pulsechain');

      expect(storage.load).toHaveBeenCalledWith('custom_tokens_pulsechain');
      expect(result).toEqual(mockTokens);
    });

    it('should return empty array when no tokens stored', async () => {
      storage.load.mockResolvedValue(null);

      const result = await getCustomTokens('pulsechain');

      expect(result).toEqual([]);
    });

    it('should handle different networks', async () => {
      storage.load.mockResolvedValue([]);

      await getCustomTokens('ethereum');
      expect(storage.load).toHaveBeenCalledWith('custom_tokens_ethereum');

      await getCustomTokens('sepolia');
      expect(storage.load).toHaveBeenCalledWith('custom_tokens_sepolia');
    });
  });

  describe('getEnabledDefaultTokens', () => {
    it('should return enabled tokens from storage', async () => {
      const enabledTokens = ['HEX', 'PLSX'];
      storage.load.mockResolvedValue(enabledTokens);

      const result = await getEnabledDefaultTokens('pulsechain');

      expect(storage.load).toHaveBeenCalledWith('enabled_default_tokens_pulsechain');
      expect(result).toEqual(enabledTokens);
    });

    it('should return all default tokens when nothing stored', async () => {
      storage.load.mockResolvedValue(null);

      const result = await getEnabledDefaultTokens('pulsechain');

      // Should return all default token symbols for pulsechain
      expect(result).toEqual(Object.keys(DEFAULT_TOKENS.pulsechain));
    });

    it('should return default tokens for ethereum network', async () => {
      storage.load.mockResolvedValue(null);

      const result = await getEnabledDefaultTokens('ethereum');

      // Ethereum now has HEX as a default token
      expect(result).toEqual(['HEX']);
    });
  });

  describe('getAllTokens', () => {
    it('should combine default and custom tokens', async () => {
      const customTokens = [
        { address: '0x123...', symbol: 'CUSTOM', decimals: 18 }
      ];
      const enabledDefaults = ['HEX', 'PLSX'];

      storage.load
        .mockResolvedValueOnce(customTokens) // getCustomTokens
        .mockResolvedValueOnce(enabledDefaults); // getEnabledDefaultTokens

      const result = await getAllTokens('pulsechain');

      // Should have 2 default tokens + 1 custom token
      expect(result.length).toBe(3);

      // Default tokens should have isDefault flag
      const hexToken = result.find(t => t.symbol === 'HEX');
      expect(hexToken).toBeDefined();
      expect(hexToken.isDefault).toBe(true);

      // Custom token should not have isDefault flag
      const customToken = result.find(t => t.symbol === 'CUSTOM');
      expect(customToken).toBeDefined();
      expect(customToken.isDefault).toBeUndefined();
    });

    it('should return only custom tokens when no defaults enabled', async () => {
      const customTokens = [
        { address: '0x123...', symbol: 'CUSTOM', decimals: 18 }
      ];

      storage.load
        .mockResolvedValueOnce(customTokens) // getCustomTokens
        .mockResolvedValueOnce([]); // getEnabledDefaultTokens (empty)

      const result = await getAllTokens('pulsechain');

      expect(result.length).toBe(1);
      expect(result[0].symbol).toBe('CUSTOM');
    });

    it('should return only default tokens when no custom tokens', async () => {
      storage.load
        .mockResolvedValueOnce(null) // getCustomTokens (no custom)
        .mockResolvedValueOnce(['HEX']); // getEnabledDefaultTokens

      const result = await getAllTokens('pulsechain');

      expect(result.length).toBe(1);
      expect(result[0].symbol).toBe('HEX');
      expect(result[0].isDefault).toBe(true);
    });

    it('should handle ethereum network with default HEX token', async () => {
      storage.load
        .mockResolvedValueOnce(null) // no custom tokens
        .mockResolvedValueOnce(null); // no enabled defaults stored

      const result = await getAllTokens('ethereum');

      // Ethereum now has HEX as a default token
      expect(result.length).toBe(1);
      expect(result[0].symbol).toBe('HEX');
      expect(result[0].isDefault).toBe(true);
    });
  });

  describe('addCustomToken', () => {
    const validAddress = '0x1234567890123456789012345678901234567890';

    beforeEach(() => {
      storage.load.mockResolvedValue([]); // No existing custom tokens
      erc20.validateTokenContract.mockResolvedValue(true);
      erc20.getTokenMetadata.mockResolvedValue({
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18
      });
    });

    it('should add a valid custom token', async () => {
      const token = await addCustomToken('pulsechain', validAddress);

      expect(token).toMatchObject({
        address: validAddress,
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        logo: null,
        isDefault: false
      });
      expect(token.addedAt).toBeGreaterThan(0);

      expect(erc20.validateTokenContract).toHaveBeenCalledWith('pulsechain', validAddress);
      expect(erc20.getTokenMetadata).toHaveBeenCalledWith('pulsechain', validAddress);
      expect(storage.save).toHaveBeenCalledWith(
        'custom_tokens_pulsechain',
        expect.arrayContaining([expect.objectContaining({ symbol: 'TEST' })])
      );
    });

    it('should trim address and validate format', async () => {
      const addressWithSpaces = '  ' + validAddress + '  ';

      await addCustomToken('pulsechain', addressWithSpaces);

      expect(erc20.validateTokenContract).toHaveBeenCalledWith('pulsechain', validAddress);
    });

    it('should reject invalid address format (missing 0x)', async () => {
      await expect(addCustomToken('pulsechain', '1234567890123456789012345678901234567890'))
        .rejects.toThrow('Invalid token address format');
    });

    it('should reject invalid address format (wrong length)', async () => {
      await expect(addCustomToken('pulsechain', '0x1234'))
        .rejects.toThrow('Invalid token address format');
    });

    it('should reject default tokens', async () => {
      const hexAddress = '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39'; // HEX token

      await expect(addCustomToken('pulsechain', hexAddress))
        .rejects.toThrow('This is a default token (HEX)');
    });

    it('should reject when token already exists', async () => {
      const existingTokens = [
        { address: validAddress, symbol: 'EXISTING', decimals: 18 }
      ];
      storage.load.mockResolvedValue(existingTokens);

      await expect(addCustomToken('pulsechain', validAddress))
        .rejects.toThrow('Token already added');
    });

    it('should be case-insensitive when checking duplicates', async () => {
      const existingTokens = [
        { address: validAddress.toLowerCase(), symbol: 'EXISTING', decimals: 18 }
      ];
      storage.load.mockResolvedValue(existingTokens);

      // Use a mix of uppercase/lowercase (still valid length and format)
      const mixedCaseAddress = '0x' + validAddress.slice(2).toLowerCase().split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c).join('');

      await expect(addCustomToken('pulsechain', mixedCaseAddress))
        .rejects.toThrow('Token already added');
    });

    it('should reject when token limit reached', async () => {
      // Create 20 tokens (MAX_TOKENS_PER_NETWORK)
      const tokens = Array(20).fill(null).map((_, i) => ({
        address: `0x${i.toString().padStart(40, '0')}`,
        symbol: `TOKEN${i}`,
        decimals: 18
      }));
      storage.load.mockResolvedValue(tokens);

      await expect(addCustomToken('pulsechain', validAddress))
        .rejects.toThrow('Maximum 20 custom tokens per network');
    });

    it('should reject when contract validation fails', async () => {
      erc20.validateTokenContract.mockResolvedValue(false);

      await expect(addCustomToken('pulsechain', validAddress))
        .rejects.toThrow('Invalid ERC-20 token contract');
    });

    it('should propagate metadata fetch errors', async () => {
      erc20.getTokenMetadata.mockRejectedValue(new Error('Network error'));

      await expect(addCustomToken('pulsechain', validAddress))
        .rejects.toThrow('Network error');
    });
  });

  describe('removeCustomToken', () => {
    const token1 = { address: '0x1234567890123456789012345678901234567890', symbol: 'TEST1' };
    const token2 = { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', symbol: 'TEST2' };

    it('should remove a custom token', async () => {
      storage.load.mockResolvedValue([token1, token2]);

      await removeCustomToken('pulsechain', token1.address);

      expect(storage.save).toHaveBeenCalledWith(
        'custom_tokens_pulsechain',
        [token2]
      );
    });

    it('should be case-insensitive when removing', async () => {
      storage.load.mockResolvedValue([token1, token2]);

      await removeCustomToken('pulsechain', token1.address.toUpperCase());

      expect(storage.save).toHaveBeenCalledWith(
        'custom_tokens_pulsechain',
        [token2]
      );
    });

    it('should do nothing if token not found', async () => {
      storage.load.mockResolvedValue([token1]);

      await removeCustomToken('pulsechain', token2.address);

      // Should still save (even though nothing changed)
      expect(storage.save).toHaveBeenCalledWith(
        'custom_tokens_pulsechain',
        [token1]
      );
    });

    it('should handle removing from empty list', async () => {
      storage.load.mockResolvedValue([]);

      await removeCustomToken('pulsechain', token1.address);

      expect(storage.save).toHaveBeenCalledWith(
        'custom_tokens_pulsechain',
        []
      );
    });
  });

  describe('toggleDefaultToken', () => {
    it('should enable a disabled token', async () => {
      storage.load.mockResolvedValue(['HEX']); // Only HEX enabled

      await toggleDefaultToken('pulsechain', 'PLSX', true);

      expect(storage.save).toHaveBeenCalledWith(
        'enabled_default_tokens_pulsechain',
        ['HEX', 'PLSX']
      );
    });

    it('should disable an enabled token', async () => {
      storage.load.mockResolvedValue(['HEX', 'PLSX', 'INC']);

      await toggleDefaultToken('pulsechain', 'PLSX', false);

      expect(storage.save).toHaveBeenCalledWith(
        'enabled_default_tokens_pulsechain',
        ['HEX', 'INC']
      );
    });

    it('should do nothing when enabling already enabled token', async () => {
      storage.load.mockResolvedValue(['HEX', 'PLSX']);

      await toggleDefaultToken('pulsechain', 'HEX', true);

      // Should not call save
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('should handle disabling non-existent token', async () => {
      storage.load.mockResolvedValue(['HEX']);

      await toggleDefaultToken('pulsechain', 'PLSX', false);

      // Should save empty result (PLSX wasn't in list anyway)
      expect(storage.save).toHaveBeenCalledWith(
        'enabled_default_tokens_pulsechain',
        ['HEX']
      );
    });

    it('should work with initially empty list', async () => {
      storage.load.mockResolvedValue([]);

      await toggleDefaultToken('pulsechain', 'HEX', true);

      expect(storage.save).toHaveBeenCalledWith(
        'enabled_default_tokens_pulsechain',
        ['HEX']
      );
    });
  });

  describe('isDefaultTokenEnabled', () => {
    it('should return true for enabled token', async () => {
      storage.load.mockResolvedValue(['HEX', 'PLSX']);

      const result = await isDefaultTokenEnabled('pulsechain', 'HEX');

      expect(result).toBe(true);
    });

    it('should return false for disabled token', async () => {
      storage.load.mockResolvedValue(['HEX']);

      const result = await isDefaultTokenEnabled('pulsechain', 'PLSX');

      expect(result).toBe(false);
    });

    it('should return true when all defaults enabled (null storage)', async () => {
      storage.load.mockResolvedValue(null);

      const result = await isDefaultTokenEnabled('pulsechain', 'HEX');

      // When null, all defaults are enabled
      expect(result).toBe(true);
    });

    it('should return false for non-existent token', async () => {
      storage.load.mockResolvedValue(['HEX']);

      const result = await isDefaultTokenEnabled('pulsechain', 'NONEXISTENT');

      expect(result).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should handle complete add/remove workflow', async () => {
      const tokenAddress = '0x1234567890123456789012345678901234567890';

      // Setup mocks
      storage.load.mockResolvedValue([]);
      erc20.validateTokenContract.mockResolvedValue(true);
      erc20.getTokenMetadata.mockResolvedValue({
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18
      });

      // Add token
      const addedToken = await addCustomToken('pulsechain', tokenAddress);
      expect(addedToken.symbol).toBe('TEST');

      // Simulate storage having the token now
      storage.load.mockResolvedValue([addedToken]);

      // Remove token
      await removeCustomToken('pulsechain', tokenAddress);

      expect(storage.save).toHaveBeenLastCalledWith(
        'custom_tokens_pulsechain',
        []
      );
    });

    it('should handle default token enable/disable workflow', async () => {
      storage.load.mockResolvedValue(['HEX', 'PLSX']);

      // Check enabled
      let enabled = await isDefaultTokenEnabled('pulsechain', 'HEX');
      expect(enabled).toBe(true);

      // Disable
      await toggleDefaultToken('pulsechain', 'HEX', false);
      expect(storage.save).toHaveBeenCalledWith(
        'enabled_default_tokens_pulsechain',
        ['PLSX']
      );

      // Simulate storage updated
      storage.load.mockResolvedValue(['PLSX']);

      // Check disabled
      enabled = await isDefaultTokenEnabled('pulsechain', 'HEX');
      expect(enabled).toBe(false);

      // Re-enable
      await toggleDefaultToken('pulsechain', 'HEX', true);
      expect(storage.save).toHaveBeenLastCalledWith(
        'enabled_default_tokens_pulsechain',
        ['PLSX', 'HEX']
      );
    });

    it('should properly combine tokens from multiple sources', async () => {
      const customTokens = [
        { address: '0x123...', symbol: 'CUSTOM1', decimals: 18 },
        { address: '0x456...', symbol: 'CUSTOM2', decimals: 6 }
      ];
      const enabledDefaults = ['HEX', 'INC'];

      storage.load
        .mockResolvedValueOnce(customTokens)
        .mockResolvedValueOnce(enabledDefaults);

      const allTokens = await getAllTokens('pulsechain');

      // Should have 2 defaults + 2 custom = 4 total
      expect(allTokens.length).toBe(4);

      // Verify default tokens have isDefault flag
      const defaultTokens = allTokens.filter(t => t.isDefault);
      expect(defaultTokens.length).toBe(2);
      expect(defaultTokens.map(t => t.symbol)).toEqual(expect.arrayContaining(['HEX', 'INC']));

      // Verify custom tokens don't have isDefault flag
      const customTokensResult = allTokens.filter(t => !t.isDefault);
      expect(customTokensResult.length).toBe(2);
      expect(customTokensResult.map(t => t.symbol)).toEqual(expect.arrayContaining(['CUSTOM1', 'CUSTOM2']));
    });
  });
});
