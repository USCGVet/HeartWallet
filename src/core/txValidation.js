/**
 * core/txValidation.js
 *
 * Transaction validation utilities for security
 * Validates all transaction parameters before processing
 */

import { ethers } from 'ethers';

/**
 * Validates a transaction request from a dApp
 * @param {Object} txRequest - Transaction request object
 * @param {number} maxGasPriceGwei - Maximum allowed gas price in Gwei (default 1000)
 * @returns {{ valid: boolean, errors: string[], sanitized: Object }}
 */
export function validateTransactionRequest(txRequest, maxGasPriceGwei = 1000) {
  const errors = [];
  const sanitized = {};

  // Validate 'to' address if present
  if (txRequest.to !== undefined && txRequest.to !== null) {
    if (typeof txRequest.to !== 'string') {
      errors.push('Invalid transaction: "to" field must be a string');
    } else if (!isValidHexAddress(txRequest.to)) {
      errors.push('Invalid transaction: "to" field must be a valid Ethereum address');
    } else {
      // Normalize to checksum address
      try {
        sanitized.to = ethers.getAddress(txRequest.to);
      } catch {
        errors.push('Invalid transaction: "to" field is not a valid address');
      }
    }
  }

  // Validate 'from' address if present (should match wallet address)
  if (txRequest.from !== undefined && txRequest.from !== null) {
    if (typeof txRequest.from !== 'string') {
      errors.push('Invalid transaction: "from" field must be a string');
    } else if (!isValidHexAddress(txRequest.from)) {
      errors.push('Invalid transaction: "from" field must be a valid Ethereum address');
    } else {
      try {
        sanitized.from = ethers.getAddress(txRequest.from);
      } catch {
        errors.push('Invalid transaction: "from" field is not a valid address');
      }
    }
  }

  // Validate 'value' field
  if (txRequest.value !== undefined && txRequest.value !== null) {
    if (!isValidHexValue(txRequest.value)) {
      errors.push('Invalid transaction: "value" field must be a valid hex string');
    } else {
      try {
        const valueBigInt = BigInt(txRequest.value);
        if (valueBigInt < 0n) {
          errors.push('Invalid transaction: "value" cannot be negative');
        } else {
          sanitized.value = txRequest.value;
        }
      } catch {
        errors.push('Invalid transaction: "value" is not a valid number');
      }
    }
  } else {
    sanitized.value = '0x0'; // Default to 0
  }

  // Validate 'data' field
  if (txRequest.data !== undefined && txRequest.data !== null) {
    if (typeof txRequest.data !== 'string') {
      errors.push('Invalid transaction: "data" field must be a string');
    } else if (!isValidHexData(txRequest.data)) {
      errors.push('Invalid transaction: "data" field must be valid hex data');
    } else {
      sanitized.data = txRequest.data;
    }
  } else {
    sanitized.data = '0x'; // Default to empty data
  }

  // Validate 'gas' or 'gasLimit' field
  // SECURITY: Reasonable maximum is 10M gas to prevent fee scams
  // Most transactions: 21k-200k gas. Complex DeFi: 200k-1M gas.
  // Ethereum/PulseChain block limit is ~30M, but single TX rarely needs >10M
  if (txRequest.gas !== undefined && txRequest.gas !== null) {
    if (!isValidHexValue(txRequest.gas)) {
      errors.push('Invalid transaction: "gas" field must be a valid hex string');
    } else {
      try {
        const gasLimit = BigInt(txRequest.gas);
        if (gasLimit < 21000n) {
          errors.push('Invalid transaction: "gas" limit too low (minimum 21000)');
        } else if (gasLimit > 10000000n) {
          errors.push('Invalid transaction: "gas" limit too high (maximum 10000000). Most transactions need <1M gas.');
        } else {
          sanitized.gas = txRequest.gas;
        }
      } catch {
        errors.push('Invalid transaction: "gas" is not a valid number');
      }
    }
  }

  if (txRequest.gasLimit !== undefined && txRequest.gasLimit !== null) {
    if (!isValidHexValue(txRequest.gasLimit)) {
      errors.push('Invalid transaction: "gasLimit" field must be a valid hex string');
    } else {
      try {
        const gasLimit = BigInt(txRequest.gasLimit);
        if (gasLimit < 21000n) {
          errors.push('Invalid transaction: "gasLimit" too low (minimum 21000)');
        } else if (gasLimit > 10000000n) {
          errors.push('Invalid transaction: "gasLimit" too high (maximum 10000000). Most transactions need <1M gas.');
        } else {
          sanitized.gasLimit = txRequest.gasLimit;
        }
      } catch {
        errors.push('Invalid transaction: "gasLimit" is not a valid number');
      }
    }
  }

  // Validate 'gasPrice' field if present
  if (txRequest.gasPrice !== undefined && txRequest.gasPrice !== null) {
    if (!isValidHexValue(txRequest.gasPrice)) {
      errors.push('Invalid transaction: "gasPrice" field must be a valid hex string');
    } else {
      try {
        const gasPrice = BigInt(txRequest.gasPrice);
        const maxGasPriceWei = BigInt(maxGasPriceGwei) * BigInt('1000000000'); // Convert Gwei to Wei
        if (gasPrice < 0n) {
          errors.push('Invalid transaction: "gasPrice" cannot be negative');
        } else if (gasPrice > maxGasPriceWei) {
          errors.push(`Invalid transaction: "gasPrice" exceeds maximum of ${maxGasPriceGwei} Gwei`);
        } else {
          sanitized.gasPrice = txRequest.gasPrice;
        }
      } catch {
        errors.push('Invalid transaction: "gasPrice" is not a valid number');
      }
    }
  }

  // Validate 'nonce' field if present
  if (txRequest.nonce !== undefined && txRequest.nonce !== null) {
    if (!isValidHexValue(txRequest.nonce) && typeof txRequest.nonce !== 'number') {
      errors.push('Invalid transaction: "nonce" field must be a valid number or hex string');
    } else {
      try {
        const nonce = typeof txRequest.nonce === 'string' 
          ? BigInt(txRequest.nonce) 
          : BigInt(txRequest.nonce);
        if (nonce < 0n) {
          errors.push('Invalid transaction: "nonce" cannot be negative');
        } else if (nonce > BigInt('9007199254740991')) { // JavaScript safe integer max
          errors.push('Invalid transaction: "nonce" is unreasonably high');
        } else {
          sanitized.nonce = txRequest.nonce;
        }
      } catch {
        errors.push('Invalid transaction: "nonce" is not a valid number');
      }
    }
  }

  // Transaction must have either 'to' or 'data' (contract creation)
  if (!sanitized.to && (!sanitized.data || sanitized.data === '0x')) {
    errors.push('Invalid transaction: must have "to" address or "data" for contract creation');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validates an Ethereum address (hex format)
 * @param {string} address - Address to validate
 * @returns {boolean}
 */
function isValidHexAddress(address) {
  if (typeof address !== 'string') return false;
  // Must be 42 characters: 0x + 40 hex digits
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Validates a hex value (for amounts, gas, etc.)
 * @param {string} value - Hex value to validate
 * @returns {boolean}
 */
function isValidHexValue(value) {
  if (typeof value !== 'string') return false;
  // Must start with 0x and contain only hex digits
  return /^0x[0-9a-fA-F]+$/.test(value);
}

/**
 * Validates hex data (for transaction data field)
 * @param {string} data - Hex data to validate
 * @returns {boolean}
 */
function isValidHexData(data) {
  if (typeof data !== 'string') return false;
  // Must be 0x or 0x followed by even number of hex digits
  if (data === '0x') return true;
  return /^0x[0-9a-fA-F]*$/.test(data) && data.length % 2 === 0;
}

/**
 * Sanitizes an error message for safe display
 * Removes any HTML, scripts, and control characters
 * @param {string} message - Error message to sanitize
 * @returns {string} Sanitized message
 */
export function sanitizeErrorMessage(message) {
  if (typeof message !== 'string') return 'Unknown error';
  
  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove script-like content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Limit length to prevent DoS
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 497) + '...';
  }
  
  return sanitized || 'Unknown error';
}

/**
 * Sanitizes user input for safe display (prevents XSS)
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeUserInput(input) {
  if (typeof input !== 'string') return '';
  
  // Create a text node and extract the escaped text
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
