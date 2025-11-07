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
  validateSignRequest,
  formatMessageForDisplay,
  formatTypedDataForDisplay
} from '../../src/core/signing.js';

describe('signing.js', () => {
  let testWallet;
  let testSigner;

  beforeEach(() => {
    // Create a test wallet for signing using a fixed private key
    // This avoids issues with ethers.Wallet.createRandom() in jsdom environment
    const testPrivateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    testWallet = new ethers.Wallet(testPrivateKey);
    testSigner = testWallet;
  });

  describe('personalSign', () => {
    it('should sign a simple text message', async () => {
      const message = 'Hello, World!';
      const signature = await personalSign(testSigner, message);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/); // Valid signature format
      expect(typeof signature).toBe('string');
    });

    it('should sign a hex-encoded message', async () => {
      const message = '0x48656c6c6f'; // "Hello" in hex
      const signature = await personalSign(testSigner, message);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
    });

    it('should produce verifiable signatures', async () => {
      const message = 'Sign this message';
      const signature = await personalSign(testSigner, message);

      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      expect(recoveredAddress.toLowerCase()).toBe(testWallet.address.toLowerCase());
    });

    it('should handle empty messages', async () => {
      await expect(personalSign(testSigner, '')).rejects.toThrow('Message is required');
    });

    it('should handle null/undefined messages', async () => {
      await expect(personalSign(testSigner, null)).rejects.toThrow('Message is required');
      await expect(personalSign(testSigner, undefined)).rejects.toThrow('Message is required');
    });

    it('should reject invalid signer', async () => {
      await expect(personalSign(null, 'test')).rejects.toThrow('Invalid signer provided');
      await expect(personalSign({}, 'test')).rejects.toThrow('Invalid signer provided');
    });

    it('should handle long messages', async () => {
      const longMessage = 'a'.repeat(10000);
      const signature = await personalSign(testSigner, longMessage);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
    });

    it('should handle messages with special characters', async () => {
      const message = 'Test with émojis 🔥 and spëcial çhars!';
      const signature = await personalSign(testSigner, message);

      expect(signature).toBeDefined();
      const recoveredAddress = ethers.verifyMessage(message, signature);
      expect(recoveredAddress.toLowerCase()).toBe(testWallet.address.toLowerCase());
    });

    it('should handle binary data as hex string', async () => {
      const binaryData = '0x' + '00'.repeat(32); // 32 zero bytes
      const signature = await personalSign(testSigner, binaryData);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
    });
  });

  describe('signTypedData', () => {
    const validTypedData = {
      domain: {
        name: 'Test DApp',
        version: '1',
        chainId: 369,
        verifyingContract: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
      },
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' }
        ]
      },
      primaryType: 'Person',
      message: {
        name: 'Alice',
        wallet: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
      }
    };

    it('should sign valid typed data', async () => {
      const signature = await signTypedData(testSigner, validTypedData);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
      expect(typeof signature).toBe('string');
    });

    it('should produce verifiable typed data signatures', async () => {
      const signature = await signTypedData(testSigner, validTypedData);

      // Verify the signature
      const recoveredAddress = ethers.verifyTypedData(
        validTypedData.domain,
        validTypedData.types,
        validTypedData.message,
        signature
      );

      expect(recoveredAddress.toLowerCase()).toBe(testWallet.address.toLowerCase());
    });

    it('should reject typed data without domain', async () => {
      const invalidData = { ...validTypedData, domain: undefined };
      await expect(signTypedData(testSigner, invalidData)).rejects.toThrow('missing domain, types, or message');
    });

    it('should reject typed data without types', async () => {
      const invalidData = { ...validTypedData, types: undefined };
      await expect(signTypedData(testSigner, invalidData)).rejects.toThrow('missing domain, types, or message');
    });

    it('should reject typed data without message', async () => {
      const invalidData = { ...validTypedData, message: undefined };
      await expect(signTypedData(testSigner, invalidData)).rejects.toThrow('missing domain, types, or message');
    });

    it('should infer primaryType if not provided', async () => {
      const dataWithoutPrimaryType = {
        domain: validTypedData.domain,
        types: validTypedData.types,
        message: validTypedData.message
      };

      const signature = await signTypedData(testSigner, dataWithoutPrimaryType);
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
    });

    it('should reject invalid primaryType', async () => {
      const invalidData = {
        ...validTypedData,
        primaryType: 'NonExistent'
      };

      await expect(signTypedData(testSigner, invalidData)).rejects.toThrow('not found in types');
    });

    it('should handle complex nested types', async () => {
      const complexTypedData = {
        domain: {
          name: 'Complex DApp',
          version: '1',
          chainId: 369
        },
        types: {
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' }
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' }
          ]
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Alice',
            wallet: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
          },
          to: {
            name: 'Bob',
            wallet: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359'
          },
          contents: 'Hello, Bob!'
        }
      };

      const signature = await signTypedData(testSigner, complexTypedData);
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
    });

    it('should reject null/undefined typed data', async () => {
      await expect(signTypedData(testSigner, null)).rejects.toThrow('Typed data is required');
      await expect(signTypedData(testSigner, undefined)).rejects.toThrow('Typed data is required');
    });

    it('should reject invalid signer', async () => {
      await expect(signTypedData(null, validTypedData)).rejects.toThrow('Invalid signer provided');
      await expect(signTypedData({}, validTypedData)).rejects.toThrow('Invalid signer provided');
    });

    it('should handle EIP-712 permit signatures', async () => {
      const permitData = {
        domain: {
          name: 'MyToken',
          version: '1',
          chainId: 369,
          verifyingContract: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
        },
        types: {
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        },
        primaryType: 'Permit',
        message: {
          owner: testWallet.address,
          spender: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
          value: '1000000000000000000',
          nonce: 0,
          deadline: Math.floor(Date.now() / 1000) + 3600
        }
      };

      const signature = await signTypedData(testSigner, permitData);
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);
    });
  });

  describe('validateSignRequest', () => {
    const validAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

    describe('personal_sign validation', () => {
      it('should validate correct personal_sign request', () => {
        const result = validateSignRequest('personal_sign', ['Hello, World!', validAddress]);

        expect(result.valid).toBe(true);
        expect(result.sanitized.message).toBe('Hello, World!');
        expect(result.sanitized.address).toBe(validAddress);
      });

      it('should normalize address to checksum format', () => {
        const lowerAddress = validAddress.toLowerCase();
        const result = validateSignRequest('personal_sign', ['test', lowerAddress]);

        expect(result.valid).toBe(true);
        expect(result.sanitized.address).toBe(validAddress); // Checksummed
      });

      it('should reject missing message', () => {
        const result = validateSignRequest('personal_sign', ['', validAddress]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('empty');
      });

      it('should reject invalid address', () => {
        const result = validateSignRequest('personal_sign', ['test', '0xinvalid']);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid address');
      });

      it('should reject missing parameters', () => {
        const result = validateSignRequest('personal_sign', ['test']);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Missing required parameters');
      });

      it('should handle hex-encoded messages', () => {
        const hexMessage = '0x48656c6c6f';
        const result = validateSignRequest('personal_sign', [hexMessage, validAddress]);

        expect(result.valid).toBe(true);
        expect(result.sanitized.message).toBe(hexMessage);
      });
    });

    describe('eth_sign validation', () => {
      it('should validate eth_sign request', () => {
        const result = validateSignRequest('eth_sign', ['test message', validAddress]);

        expect(result.valid).toBe(true);
        expect(result.sanitized.message).toBe('test message');
      });
    });

    describe('eth_signTypedData validation', () => {
      const validTypedData = {
        domain: { name: 'Test', version: '1', chainId: 369 },
        types: { Person: [{ name: 'name', type: 'string' }] },
        message: { name: 'Alice' }
      };

      it('should validate correct signTypedData request', () => {
        const result = validateSignRequest('eth_signTypedData_v4', [
          validAddress,
          JSON.stringify(validTypedData)
        ]);

        expect(result.valid).toBe(true);
        expect(result.sanitized.address).toBe(validAddress);
        expect(result.sanitized.typedData).toEqual(validTypedData);
      });

      it('should accept typed data as object', () => {
        const result = validateSignRequest('eth_signTypedData_v4', [
          validAddress,
          validTypedData
        ]);

        expect(result.valid).toBe(true);
        expect(result.sanitized.typedData).toEqual(validTypedData);
      });

      it('should reject invalid JSON string', () => {
        const result = validateSignRequest('eth_signTypedData_v4', [
          validAddress,
          'invalid json'
        ]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid typed data format');
      });

      it('should reject typed data without domain', () => {
        const invalidData = { types: {}, message: {} };
        const result = validateSignRequest('eth_signTypedData_v4', [
          validAddress,
          invalidData
        ]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('missing required fields');
      });

      it('should validate all signTypedData versions', () => {
        const methods = ['eth_signTypedData', 'eth_signTypedData_v3', 'eth_signTypedData_v4'];

        methods.forEach(method => {
          const result = validateSignRequest(method, [
            validAddress,
            validTypedData
          ]);
          expect(result.valid).toBe(true);
        });
      });
    });

    describe('general validation', () => {
      it('should reject null params', () => {
        const result = validateSignRequest('personal_sign', null);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid request format');
      });

      it('should reject non-array params', () => {
        const result = validateSignRequest('personal_sign', 'not an array');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid request format');
      });

      it('should reject unsupported methods', () => {
        const result = validateSignRequest('unknown_method', ['test', validAddress]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Unsupported signing method');
      });

      it('should reject null method', () => {
        const result = validateSignRequest(null, ['test', validAddress]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid request format');
      });
    });
  });

  describe('formatMessageForDisplay', () => {
    it('should format simple text messages', () => {
      const result = formatMessageForDisplay('Hello, World!');
      expect(result).toBe('Hello, World!');
    });

    it('should decode hex-encoded text', () => {
      const hexMessage = '0x48656c6c6f'; // "Hello"
      const result = formatMessageForDisplay(hexMessage);
      expect(result).toBe('Hello');
    });

    it('should keep hex data as-is if not decodable', () => {
      const hexData = '0x1234567890abcdef';
      const result = formatMessageForDisplay(hexData);
      expect(result).toBe(hexData);
    });

    it('should truncate long messages', () => {
      const longMessage = 'a'.repeat(1000);
      const result = formatMessageForDisplay(longMessage, 100);

      expect(result.length).toBeLessThanOrEqual(103); // 100 + "..."
      expect(result).toContain('...');
    });

    it('should handle empty messages', () => {
      const result = formatMessageForDisplay('');
      expect(result).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(formatMessageForDisplay(null)).toBe('');
      expect(formatMessageForDisplay(undefined)).toBe('');
    });

    it('should preserve newlines and formatting', () => {
      const message = 'Line 1\nLine 2\nLine 3';
      const result = formatMessageForDisplay(message);
      expect(result).toBe(message);
    });

    it('should handle messages with special characters', () => {
      const message = 'Test with émojis 🔥 and spëcial!';
      const result = formatMessageForDisplay(message);
      expect(result).toBe(message);
    });

    it('should use default maxLength of 500', () => {
      const longMessage = 'a'.repeat(1000);
      const result = formatMessageForDisplay(longMessage);

      expect(result.length).toBeLessThanOrEqual(503); // 500 + "..."
    });
  });

  describe('formatTypedDataForDisplay', () => {
    it('should format typed data as JSON', () => {
      const typedData = {
        domain: { name: 'Test', version: '1' },
        primaryType: 'Person',
        message: { name: 'Alice' }
      };

      const result = formatTypedDataForDisplay(typedData);

      expect(result).toContain('Test');
      expect(result).toContain('Person');
      expect(result).toContain('Alice');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include domain, primaryType, and message', () => {
      const typedData = {
        domain: { name: 'MyDApp', chainId: 369 },
        types: { Person: [{ name: 'name', type: 'string' }] },
        primaryType: 'Person',
        message: { name: 'Bob' }
      };

      const result = formatTypedDataForDisplay(typedData);
      const parsed = JSON.parse(result);

      expect(parsed.domain).toEqual(typedData.domain);
      expect(parsed.primaryType).toBe('Person');
      expect(parsed.message).toEqual(typedData.message);
    });

    it('should handle missing primaryType', () => {
      const typedData = {
        domain: { name: 'Test' },
        types: {},
        message: {}
      };

      const result = formatTypedDataForDisplay(typedData);
      expect(result).toContain('Unknown');
    });

    it('should handle empty typed data', () => {
      const result = formatTypedDataForDisplay(null);
      expect(result).toBe('');
    });

    it('should format with proper indentation', () => {
      const typedData = {
        domain: { name: 'Test' },
        primaryType: 'Person',
        message: { name: 'Alice' }
      };

      const result = formatTypedDataForDisplay(typedData);

      // Check for proper JSON formatting (should have newlines and indentation)
      expect(result.split('\n').length).toBeGreaterThan(1);
      expect(result).toContain('  '); // Should have indentation
    });

    it('should handle complex nested structures', () => {
      const typedData = {
        domain: { name: 'Complex', version: '1', chainId: 369 },
        primaryType: 'Mail',
        message: {
          from: { name: 'Alice', wallet: '0x123...' },
          to: { name: 'Bob', wallet: '0x456...' },
          contents: 'Hello!'
        }
      };

      const result = formatTypedDataForDisplay(typedData);
      const parsed = JSON.parse(result);

      expect(parsed.message.from.name).toBe('Alice');
      expect(parsed.message.to.name).toBe('Bob');
    });
  });
});
