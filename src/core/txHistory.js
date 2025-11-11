/**
 * Transaction History Management
 * Stores transaction history locally in chrome.storage.local
 * Max 20 transactions per address (FIFO)
 */

import { load, save } from './storage.js';

const TX_HISTORY_KEY = 'txHistory_v1';
const TX_HISTORY_SETTINGS_KEY = 'txHistorySettings';
const MAX_TXS_PER_ADDRESS = 20;

// Transaction types
export const TX_TYPES = {
  SEND: 'send',           // Native token transfer
  CONTRACT: 'contract',   // Contract interaction
  TOKEN: 'token'          // ERC20 token transfer
};

// Transaction statuses
export const TX_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
};

/**
 * Get transaction history settings
 */
export async function getTxHistorySettings() {
  const settings = await load(TX_HISTORY_SETTINGS_KEY);
  return settings || {
    enabled: true,      // Track transaction history
    clearOnLock: false  // Don't clear on wallet lock
  };
}

/**
 * Update transaction history settings
 */
export async function updateTxHistorySettings(settings) {
  await save(TX_HISTORY_SETTINGS_KEY, settings);
}

/**
 * Get all transaction history
 */
async function getAllHistory() {
  const history = await load(TX_HISTORY_KEY);
  return history || {};
}

/**
 * Save all transaction history
 */
async function saveAllHistory(history) {
  await save(TX_HISTORY_KEY, history);
}

/**
 * Get transaction history for a specific address
 */
export async function getTxHistory(address) {
  const settings = await getTxHistorySettings();
  if (!settings.enabled) {
    return [];
  }

  const history = await getAllHistory();
  const addressLower = address.toLowerCase();

  if (!history[addressLower]) {
    return [];
  }

  return history[addressLower].transactions || [];
}

/**
 * Add a transaction to history
 */
export async function addTxToHistory(address, txData) {
  const settings = await getTxHistorySettings();
  if (!settings.enabled) {
    return; // History disabled
  }

  const history = await getAllHistory();
  const addressLower = address.toLowerCase();

  // Initialize address history if doesn't exist
  if (!history[addressLower]) {
    history[addressLower] = { transactions: [] };
  }

  // Add new transaction at beginning (newest first)
  history[addressLower].transactions.unshift({
    hash: txData.hash,
    timestamp: txData.timestamp || Date.now(),
    from: txData.from.toLowerCase(),
    to: txData.to ? txData.to.toLowerCase() : null,
    value: txData.value || '0',
    data: txData.data || '0x',
    gasPrice: txData.gasPrice,
    gasLimit: txData.gasLimit,
    nonce: txData.nonce,
    network: txData.network,
    status: txData.status || TX_STATUS.PENDING,
    blockNumber: txData.blockNumber || null,
    type: txData.type || TX_TYPES.CONTRACT
  });

  // Enforce max limit (FIFO - remove oldest)
  if (history[addressLower].transactions.length > MAX_TXS_PER_ADDRESS) {
    history[addressLower].transactions = history[addressLower].transactions.slice(0, MAX_TXS_PER_ADDRESS);
  }

  await saveAllHistory(history);
  // Transaction added
}

/**
 * Update transaction status
 */
export async function updateTxStatus(address, txHash, status, blockNumber = null) {
  const history = await getAllHistory();
  const addressLower = address.toLowerCase();

  if (!history[addressLower]) {
    return;
  }

  const txIndex = history[addressLower].transactions.findIndex(
    tx => tx.hash.toLowerCase() === txHash.toLowerCase()
  );

  if (txIndex === -1) {
    return;
  }

  history[addressLower].transactions[txIndex].status = status;
  if (blockNumber !== null) {
    history[addressLower].transactions[txIndex].blockNumber = blockNumber;
  }

  await saveAllHistory(history);
  // Transaction status updated
}

/**
 * Get pending transactions for an address
 */
export async function getPendingTxs(address) {
  const txs = await getTxHistory(address);
  return txs.filter(tx => tx.status === TX_STATUS.PENDING);
}

/**
 * Get pending transaction count for an address
 */
export async function getPendingTxCount(address) {
  const pendingTxs = await getPendingTxs(address);
  return pendingTxs.length;
}

/**
 * Get transaction by hash
 */
export async function getTxByHash(address, txHash) {
  const txs = await getTxHistory(address);
  return txs.find(tx => tx.hash.toLowerCase() === txHash.toLowerCase());
}

/**
 * Clear all transaction history for an address
 */
export async function clearTxHistory(address) {
  const history = await getAllHistory();
  const addressLower = address.toLowerCase();

  if (history[addressLower]) {
    delete history[addressLower];
    await saveAllHistory(history);
    // Transaction history cleared
  }
}

/**
 * Clear all transaction history (all addresses)
 */
export async function clearAllTxHistory() {
  await save(TX_HISTORY_KEY, {});
  // All transaction history cleared
}

/**
 * Export transaction history as JSON (for debugging)
 */
export async function exportTxHistory(address) {
  const txs = await getTxHistory(address);
  return JSON.stringify(txs, null, 2);
}
