/**
 * core/ledger.js
 *
 * Ledger Hardware Wallet Integration
 * Security-first implementation for Ledger Nano S/X/S Plus
 *
 * Uses WebHID for Chrome extension compatibility
 */

import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import Eth from '@ledgerhq/hw-app-eth';
import { ethers } from 'ethers';

// Standard Ethereum derivation paths (BIP44)
// m/44'/60'/0'/0/x where x is the account index
const DERIVATION_PATH_BASE = "44'/60'/0'/0";

/**
 * Check if browser supports WebHID (required for Ledger)
 * @returns {boolean}
 */
export function isLedgerSupported() {
  return 'hid' in navigator;
}

/**
 * Check if any Ledger device is connected
 * @returns {Promise<boolean>}
 */
export async function isLedgerConnected() {
  try {
    const devices = await TransportWebHID.list();
    return devices.length > 0;
  } catch (error) {
    console.error('Error checking Ledger connection:', error);
    return false;
  }
}

/**
 * Request permission and connect to Ledger device
 * This will show browser's HID device picker
 * @returns {Promise<TransportWebHID>}
 */
export async function connectLedger() {
  try {
    // This will prompt user to select their Ledger device
    const transport = await TransportWebHID.create();
    return transport;
  } catch (error) {
    console.error('Error connecting to Ledger:', error);

    // Common error messages
    if (error.message.includes('No device selected')) {
      throw new Error('No Ledger device selected. Please select your Ledger from the list.');
    } else if (error.message.includes('already open')) {
      throw new Error('Ledger is already connected in another application. Please close other apps.');
    } else if (error.message.includes('0x6804')) {
      throw new Error('Please unlock your Ledger and open the Ethereum app.');
    } else if (error.message.includes('0x6985')) {
      throw new Error('Action rejected on Ledger device.');
    }

    throw new Error(`Ledger connection failed: ${error.message}`);
  }
}

/**
 * Get Ethereum address from Ledger at specific account index
 * @param {number} accountIndex - Account index (0, 1, 2, ...)
 * @param {boolean} verify - Show address on Ledger screen for verification
 * @returns {Promise<{address: string, publicKey: string, chainCode: string}>}
 */
export async function getAddress(accountIndex = 0, verify = false) {
  let transport = null;

  try {
    // Connect to Ledger
    transport = await connectLedger();
    const eth = new Eth(transport);

    // Get address at derivation path
    const path = `${DERIVATION_PATH_BASE}/${accountIndex}`;
    const result = await eth.getAddress(path, verify);

    return {
      address: ethers.getAddress(result.address), // Checksummed address
      publicKey: result.publicKey,
      chainCode: result.chainCode,
      derivationPath: path
    };
  } catch (error) {
    console.error('Error getting Ledger address:', error);
    throw error;
  } finally {
    if (transport) {
      await transport.close();
    }
  }
}

/**
 * Get multiple addresses from Ledger
 * @param {number} count - Number of addresses to retrieve
 * @param {number} startIndex - Starting account index
 * @returns {Promise<Array<{address: string, index: number, path: string}>>}
 */
export async function getAddresses(count = 5, startIndex = 0) {
  let transport = null;

  try {
    transport = await connectLedger();
    const eth = new Eth(transport);

    const addresses = [];

    for (let i = 0; i < count; i++) {
      const accountIndex = startIndex + i;
      const path = `${DERIVATION_PATH_BASE}/${accountIndex}`;
      const result = await eth.getAddress(path, false);

      addresses.push({
        address: ethers.getAddress(result.address),
        index: accountIndex,
        path: path
      });
    }

    return addresses;
  } catch (error) {
    console.error('Error getting Ledger addresses:', error);
    throw error;
  } finally {
    if (transport) {
      await transport.close();
    }
  }
}

/**
 * Sign a transaction with Ledger
 * SECURITY: Transaction is displayed on Ledger screen for user verification
 * @param {number} accountIndex - Account index to sign with
 * @param {Object} transaction - Ethers transaction object
 * @returns {Promise<string>} Signed transaction hex string
 */
export async function signTransaction(accountIndex, transaction) {
  let transport = null;

  try {
    // Connect to Ledger
    transport = await connectLedger();
    const eth = new Eth(transport);

    // Build derivation path
    const path = `${DERIVATION_PATH_BASE}/${accountIndex}`;

    // Serialize unsigned transaction for Ledger
    const unsignedTx = ethers.Transaction.from(transaction);
    const serializedTx = unsignedTx.unsignedSerialized;

    // Remove '0x' prefix if present
    const txHex = serializedTx.startsWith('0x') ? serializedTx.slice(2) : serializedTx;

    // Sign with Ledger
    // User must approve on device screen
    // Pass null as resolution to disable automatic resolution (we handle transaction details in UI)
    const signature = await eth.signTransaction(path, txHex, null);

    // Parse signature (v, r, s)
    const sig = {
      v: parseInt(signature.v, 16),
      r: '0x' + signature.r,
      s: '0x' + signature.s
    };

    // Create signed transaction
    const signedTx = ethers.Transaction.from({
      ...transaction,
      signature: sig
    });

    return signedTx.serialized;
  } catch (error) {
    console.error('Error signing transaction with Ledger:', error);

    if (error.message.includes('0x6985')) {
      throw new Error('Transaction rejected on Ledger device');
    } else if (error.message.includes('0x6804')) {
      throw new Error('Please unlock Ledger and open Ethereum app');
    } else if (error.message.includes('0x6a80')) {
      throw new Error('Blind signing not enabled on Ledger. Enable in Ethereum app settings.');
    }

    throw error;
  } finally {
    if (transport) {
      await transport.close();
    }
  }
}

/**
 * Sign a message with Ledger (EIP-191 personal_sign)
 * @param {number} accountIndex - Account index to sign with
 * @param {string} message - Message to sign (hex string or UTF-8)
 * @returns {Promise<string>} Signature hex string
 */
export async function signMessage(accountIndex, message) {
  let transport = null;

  try {
    // Connect to Ledger
    transport = await connectLedger();
    const eth = new Eth(transport);

    // Build derivation path
    const path = `${DERIVATION_PATH_BASE}/${accountIndex}`;

    // Convert message to hex if needed
    let messageHex;
    if (message.startsWith('0x')) {
      messageHex = message.slice(2);
    } else {
      // UTF-8 string to hex
      messageHex = Buffer.from(message, 'utf8').toString('hex');
    }

    // Sign message on Ledger
    const signature = await eth.signPersonalMessage(path, messageHex);

    // Parse signature (v, r, s)
    const sig = {
      v: parseInt(signature.v, 10),
      r: signature.r,
      s: signature.s
    };

    // Return signature in format compatible with ethers
    return ethers.Signature.from({
      r: '0x' + sig.r,
      s: '0x' + sig.s,
      v: sig.v
    }).serialized;
  } catch (error) {
    console.error('Error signing message with Ledger:', error);

    if (error.message.includes('0x6985')) {
      throw new Error('Message signing rejected on Ledger device');
    }

    throw error;
  } finally {
    if (transport) {
      await transport.close();
    }
  }
}

/**
 * Sign typed data with Ledger (EIP-712)
 * Note: EIP-712 support varies by Ledger firmware version
 * @param {number} accountIndex - Account index to sign with
 * @param {Object} domain - EIP-712 domain
 * @param {Object} types - EIP-712 types
 * @param {Object} value - EIP-712 value
 * @returns {Promise<string>} Signature hex string
 */
export async function signTypedData(accountIndex, domain, types, value) {
  let transport = null;

  try {
    // Connect to Ledger
    transport = await connectLedger();
    const eth = new Eth(transport);

    // Build derivation path
    const path = `${DERIVATION_PATH_BASE}/${accountIndex}`;

    // Ledger EIP-712 signing
    // Note: This requires newer firmware and may not work on all devices
    const domainSeparatorHex = ethers.TypedDataEncoder.hashDomain(domain).slice(2);
    const messageHash = ethers.TypedDataEncoder.hash(domain, types, value).slice(2);

    const signature = await eth.signEIP712HashedMessage(
      path,
      domainSeparatorHex,
      messageHash
    );

    // Parse signature
    const sig = {
      v: parseInt(signature.v, 10),
      r: signature.r,
      s: signature.s
    };

    return ethers.Signature.from({
      r: '0x' + sig.r,
      s: '0x' + sig.s,
      v: sig.v
    }).serialized;
  } catch (error) {
    console.error('Error signing typed data with Ledger:', error);

    if (error.message.includes('0x6a80')) {
      // Fallback: Use personal_sign for older firmware
      console.warn('EIP-712 not supported, falling back to personal_sign');
      const hash = ethers.TypedDataEncoder.hash(domain, types, value);
      return await signMessage(accountIndex, hash);
    }

    throw error;
  } finally {
    if (transport) {
      await transport.close();
    }
  }
}

/**
 * Get Ledger app configuration (for debugging)
 * @returns {Promise<Object>}
 */
export async function getAppConfiguration() {
  let transport = null;

  try {
    transport = await connectLedger();
    const eth = new Eth(transport);

    const config = await eth.getAppConfiguration();

    return {
      arbitraryDataEnabled: config.arbitraryDataEnabled,
      erc20ProvisioningNecessary: config.erc20ProvisioningNecessary,
      starkEnabled: config.starkEnabled,
      starkv2Supported: config.starkv2Supported,
      version: config.version
    };
  } catch (error) {
    console.error('Error getting Ledger app config:', error);
    throw error;
  } finally {
    if (transport) {
      await transport.close();
    }
  }
}

/**
 * Close all open Ledger transports
 * Call this when cleaning up
 */
export async function disconnectLedger() {
  try {
    // Close all open HID connections
    await TransportWebHID.close();
  } catch (error) {
    console.error('Error disconnecting Ledger:', error);
  }
}
