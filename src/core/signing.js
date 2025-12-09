/**
 * core/signing.js
 *
 * Message signing functionality for EIP-191 and EIP-712
 */

import { ethers } from 'ethers';

/**
 * Signs a message using EIP-191 (personal_sign)
 * This prepends "\x19Ethereum Signed Message:\n" + len(message) to the message
 * before signing, which prevents signing arbitrary transactions
 *
 * @param {ethers.Wallet} signer - Wallet instance to sign with
 * @param {string} message - Message to sign (hex string or UTF-8 string)
 * @returns {Promise<string>} Signature (0x-prefixed hex string)
 */
export async function personalSign(signer, message) {
  if (!signer || typeof signer.signMessage !== 'function') {
    throw new Error('Invalid signer provided');
  }

  if (!message) {
    throw new Error('Message is required');
  }

  try {
    // If message is hex-encoded, decode it first
    // ethers.js signMessage expects a string or Uint8Array
    let messageToSign = message;

    if (typeof message === 'string' && message.startsWith('0x')) {
      // It's a hex string, convert to UTF-8
      try {
        // Try to decode as hex
        const bytes = ethers.getBytes(message);
        messageToSign = ethers.toUtf8String(bytes);
      } catch {
        // If decoding fails, use the hex string as-is
        // ethers will handle it
        messageToSign = message;
      }
    }

    // Sign the message (ethers.js automatically applies EIP-191 format)
    const signature = await signer.signMessage(messageToSign);

    return signature;
  } catch (error) {
    throw new Error(`Failed to sign message: ${error.message}`);
  }
}

/**
 * Signs typed data using EIP-712
 * Used by dApps for structured data signing (permits, meta-transactions, etc.)
 *
 * @param {ethers.Wallet} signer - Wallet instance to sign with
 * @param {Object} typedData - EIP-712 typed data object with domain, types, and message
 * @returns {Promise<string>} Signature (0x-prefixed hex string)
 */
export async function signTypedData(signer, typedData) {
  if (!signer || typeof signer.signTypedData !== 'function') {
    throw new Error('Invalid signer provided');
  }

  if (!typedData) {
    throw new Error('Typed data is required');
  }

  // Validate typed data structure
  if (!typedData.domain || !typedData.types || !typedData.message) {
    throw new Error('Invalid EIP-712 typed data: missing domain, types, or message');
  }

  try {
    // Extract primaryType (if not provided, try to infer it)
    let primaryType = typedData.primaryType;

    if (!primaryType) {
      // Try to infer primary type from types object
      // It's the type that's not "EIP712Domain"
      const typeNames = Object.keys(typedData.types).filter(t => t !== 'EIP712Domain');
      if (typeNames.length === 1) {
        primaryType = typeNames[0];
      } else {
        throw new Error('Cannot infer primaryType - please specify it explicitly');
      }
    }

    // Validate that primaryType exists in types
    if (!typedData.types[primaryType]) {
      throw new Error(`Primary type "${primaryType}" not found in types definition`);
    }

    // Sign using ethers.js signTypedData
    // ethers v6 uses: signTypedData(domain, types, value)
    const signature = await signer.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    );

    return signature;
  } catch (error) {
    throw new Error(`Failed to sign typed data: ${error.message}`);
  }
}

/**
 * Validates a message signing request
 * @param {string} method - RPC method (personal_sign, eth_signTypedData_v4, etc.)
 * @param {Array} params - RPC parameters
 * @returns {Object} { valid: boolean, error?: string, sanitized?: Object }
 */
export function validateSignRequest(method, params) {
  if (!method || !params || !Array.isArray(params)) {
    return { valid: false, error: 'Invalid request format' };
  }

  switch (method) {
    case 'personal_sign':
    case 'eth_sign': // Note: eth_sign is dangerous and should show strong warning
      if (params.length < 2) {
        return { valid: false, error: 'Missing required parameters' };
      }

      const message = params[0];
      const address = params[1];

      if (!message) {
        return { valid: false, error: 'Message is empty' };
      }

      if (!address || !ethers.isAddress(address)) {
        return { valid: false, error: 'Invalid address' };
      }

      // Sanitize message (convert to string if needed)
      const sanitizedMessage = typeof message === 'string' ? message : String(message);

      return {
        valid: true,
        sanitized: {
          message: sanitizedMessage,
          address: ethers.getAddress(address) // Normalize to checksum address
        }
      };

    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      if (params.length < 2) {
        return { valid: false, error: 'Missing required parameters' };
      }

      const addr = params[0];
      let typedData = params[1];

      if (!addr || !ethers.isAddress(addr)) {
        return { valid: false, error: 'Invalid address' };
      }

      // Parse typed data if it's a string
      if (typeof typedData === 'string') {
        try {
          typedData = JSON.parse(typedData);
        } catch {
          return { valid: false, error: 'Invalid typed data format' };
        }
      }

      // Validate typed data structure
      if (!typedData || typeof typedData !== 'object') {
        return { valid: false, error: 'Typed data must be an object' };
      }

      if (!typedData.domain || !typedData.types || !typedData.message) {
        return { valid: false, error: 'Typed data missing required fields (domain, types, message)' };
      }

      return {
        valid: true,
        sanitized: {
          address: ethers.getAddress(addr),
          typedData: typedData
        }
      };

    default:
      return { valid: false, error: `Unsupported signing method: ${method}` };
  }
}

