/**
 * core/validation.js
 *
 * Input validation and sanitization functions
 */

import { ethers } from 'ethers';

/**
 * Validates Ethereum address
 * @param {string} address
 * @returns {boolean}
 */
export function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Validates mnemonic phrase (BIP39)
 * @param {string} mnemonic
 * @returns {boolean}
 */
export function isValidMnemonic(mnemonic) {
  try {
    // Trim and normalize whitespace
    const cleaned = mnemonic.trim().replace(/\s+/g, ' ');

    // Check if it's a valid mnemonic using ethers
    return ethers.Mnemonic.isValidMnemonic(cleaned);
  } catch {
    return false;
  }
}

/**
 * Validates private key (hex format)
 * @param {string} privateKey
 * @returns {boolean}
 */
export function isValidPrivateKey(privateKey) {
  try {
    // Remove 0x prefix if present
    const key = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;

    // Check if it's valid hex and correct length (66 chars with 0x, or 64 without)
    if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
      return false;
    }

    // Try to create a wallet with it
    new ethers.Wallet(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates password strength
 * Requirements:
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 *
 * @param {string} password
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*, etc.)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Shortens address for display (0x1234...5678)
 * @param {string} address
 * @param {number} chars - Characters to show on each side
 * @returns {string}
 */
export function shortenAddress(address, chars = 4) {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
