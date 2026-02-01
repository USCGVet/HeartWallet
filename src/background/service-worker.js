/**
 * background/service-worker.js
 *
 * Background service worker for HeartWallet
 * Handles RPC requests from dApps and manages wallet state
 */

import { getActiveWallet, unlockWallet, secureCleanup, secureCleanupSigner } from '../core/wallet.js';
import { load, save } from '../core/storage.js';
import * as rpc from '../core/rpc.js';
import * as txHistory from '../core/txHistory.js';
import { validateTransactionRequest, sanitizeErrorMessage } from '../core/txValidation.js';
import { personalSign, signTypedData, validateSignRequest } from '../core/signing.js';
import { ethers } from 'ethers';

// Service worker loaded

// Network chain IDs
const CHAIN_IDS = {
  'pulsechainTestnet': '0x3AF', // 943
  'pulsechain': '0x171', // 369
  'ethereum': '0x1', // 1
  'sepolia': '0xAA36A7' // 11155111
};

// Storage keys
const CONNECTED_SITES_KEY = 'connected_sites';

// Pending connection requests (origin -> { resolve, reject, tabId })
const pendingConnections = new Map();

// ===== SIGNING AUDIT LOG =====
// Stores recent signing operations for security auditing (in-memory, cleared on service worker restart)
const SIGNING_LOG_KEY = 'signing_audit_log';
const MAX_SIGNING_LOG_ENTRIES = 100;

/**
 * Log a signing operation for audit purposes
 * @param {Object} entry - Log entry details
 * @param {string} entry.type - Type of signing (transaction, personal_sign, typed_data)
 * @param {string} entry.address - Wallet address that signed
 * @param {string} entry.origin - dApp origin that requested the signature
 * @param {string} entry.method - RPC method used
 * @param {boolean} entry.success - Whether signing succeeded
 * @param {string} [entry.txHash] - Transaction hash (for transactions)
 * @param {string} [entry.error] - Error message (if failed)
 */
async function logSigningOperation(entry) {
  try {
    const logEntry = {
      ...entry,
      timestamp: Date.now(),
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    };

    // Get existing log
    const existingLog = await load(SIGNING_LOG_KEY) || [];

    // Add new entry at the beginning
    existingLog.unshift(logEntry);

    // Trim to max entries
    if (existingLog.length > MAX_SIGNING_LOG_ENTRIES) {
      existingLog.length = MAX_SIGNING_LOG_ENTRIES;
    }

    // Save log
    await save(SIGNING_LOG_KEY, existingLog);

    // Also log to console for debugging
    const icon = entry.success ? '✅' : '❌';
    console.log(`🫀 ${icon} Signing audit: ${entry.type} from ${entry.origin} - ${entry.success ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    // Don't let logging failures affect signing operations
    console.error('🫀 Error logging signing operation:', error);
  }
}

/**
 * Get signing audit log
 * @returns {Promise<Array>} Array of log entries
 */
async function getSigningAuditLog() {
  return await load(SIGNING_LOG_KEY) || [];
}

// ===== SESSION MANAGEMENT =====
// Session tokens stored in memory (cleared when service worker terminates)
// SECURITY NOTE: Service workers can be terminated by Chrome at any time, which clears all
// session data. This is intentional - we don't want passwords persisting longer than needed.
// Sessions are encrypted in memory as an additional security layer.
const activeSessions = new Map(); // sessionToken -> { encryptedPassword, walletId, expiresAt, salt }

// Session encryption key (regenerated on service worker start)
let sessionEncryptionKey = null;

/**
 * Initialize session encryption key using Web Crypto API
 * Key is regenerated each time service worker starts (memory only, never persisted)
 */
async function initSessionEncryption() {
  if (!sessionEncryptionKey) {
    // Generate a random 256-bit key for AES-GCM encryption
    sessionEncryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false, // Not extractable
      ['encrypt', 'decrypt']
    );
  }
}

/**
 * Encrypts password for session storage using AES-GCM
 * @param {string} password - Password to encrypt
 * @returns {Promise<{encrypted: ArrayBuffer, iv: Uint8Array}>}
 */
async function encryptPasswordForSession(password) {
  await initSessionEncryption();
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Generate random IV for this encryption
  // SECURITY: IV uniqueness is cryptographically guaranteed by crypto.getRandomValues()
  // which uses the browser's CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sessionEncryptionKey,
    passwordData
  );
  
  return { encrypted, iv };
}

/**
 * Decrypts password from session storage
 * @param {ArrayBuffer} encrypted - Encrypted password data
 * @param {Uint8Array} iv - Initialization vector
 * @returns {Promise<string>}
 */
async function decryptPasswordFromSession(encrypted, iv) {
  await initSessionEncryption();
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    sessionEncryptionKey,
    encrypted
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Generate cryptographically secure session token
function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Create new session
// SECURITY: Default session duration reduced to 15 minutes to minimize password exposure in memory
async function createSession(password, walletId, durationMs = 900000) { // Default 15 minutes (was 1 hour)
  const sessionToken = generateSessionToken();
  const expiresAt = Date.now() + durationMs;
  
  // Encrypt password before storing in memory
  const { encrypted, iv } = await encryptPasswordForSession(password);

  activeSessions.set(sessionToken, {
    encryptedPassword: encrypted,
    iv: iv,
    walletId,
    expiresAt
  });

  // Auto-cleanup expired session
  setTimeout(() => {
    if (activeSessions.has(sessionToken)) {
      const session = activeSessions.get(sessionToken);
      if (Date.now() >= session.expiresAt) {
        activeSessions.delete(sessionToken);
        console.log('🫀 Session expired and removed');
      }
    }
  }, durationMs);

  // Session created
  return sessionToken;
}

// Validate session and return decrypted password
async function validateSession(sessionToken) {
  if (!sessionToken) {
    throw new Error('No session token provided');
  }

  const session = activeSessions.get(sessionToken);

  if (!session) {
    throw new Error('Invalid or expired session');
  }

  if (Date.now() >= session.expiresAt) {
    activeSessions.delete(sessionToken);
    throw new Error('Session expired');
  }

  // Decrypt password from session storage
  return await decryptPasswordFromSession(session.encryptedPassword, session.iv);
}

// Invalidate session
function invalidateSession(sessionToken) {
  if (activeSessions.has(sessionToken)) {
    activeSessions.delete(sessionToken);
    // Session invalidated
    return true;
  }
  return false;
}

// Invalidate all sessions
function invalidateAllSessions() {
  const count = activeSessions.size;
  activeSessions.clear();
  // All sessions invalidated
  return count;
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('🫀 HeartWallet installed');
});

// Get connected sites from storage
async function getConnectedSites() {
  const sites = await load(CONNECTED_SITES_KEY);
  return sites || {};
}

// Check if a site is connected
async function isSiteConnected(origin) {
  const sites = await getConnectedSites();
  return !!sites[origin];
}

// Add a connected site
async function addConnectedSite(origin, accounts) {
  const sites = await getConnectedSites();
  sites[origin] = {
    accounts,
    connectedAt: Date.now()
  };
  await save(CONNECTED_SITES_KEY, sites);
}

// Remove a connected site
async function removeConnectedSite(origin) {
  const sites = await getConnectedSites();
  delete sites[origin];
  await save(CONNECTED_SITES_KEY, sites);
}

// Get current network chain ID
async function getCurrentChainId() {
  const network = await load('currentNetwork');
  return CHAIN_IDS[network || 'pulsechainTestnet'];
}

// Handle wallet requests from content scripts
async function handleWalletRequest(message, sender) {
  const { method, params } = message;

  // SECURITY: Get origin from Chrome API, not message payload (prevents spoofing)
  const url = new URL(sender.url);
  const origin = url.origin;

  // Handling wallet request

  try {
    switch (method) {
      case 'eth_requestAccounts':
        return await handleRequestAccounts(origin, sender.tab);

      case 'eth_accounts':
        return await handleAccounts(origin);

      case 'eth_chainId':
        return await handleChainId();

      case 'net_version':
        const chainId = await handleChainId();
        return { result: parseInt(chainId.result, 16).toString() };

      case 'wallet_switchEthereumChain':
        return await handleSwitchChain(params);

      case 'wallet_addEthereumChain':
        return await handleAddChain(params);

      case 'wallet_watchAsset':
        return await handleWatchAsset(params, origin, sender.tab);

      case 'eth_blockNumber':
        return await handleBlockNumber();

      case 'eth_getBlockByNumber':
        return await handleGetBlockByNumber(params);

      case 'eth_getBalance':
        return await handleGetBalance(params);

      case 'eth_getTransactionCount':
        return await handleGetTransactionCount(params);

      case 'eth_call':
        return await handleCall(params);

      case 'eth_estimateGas':
        return await handleEstimateGas(params);

      case 'eth_gasPrice':
        return await handleGasPrice();

      case 'eth_sendTransaction':
        return await handleSendTransaction(params, origin);

      case 'eth_sendRawTransaction':
        return await handleSendRawTransaction(params);

      case 'eth_getTransactionReceipt':
        return await handleGetTransactionReceipt(params);

      case 'eth_getTransactionByHash':
        return await handleGetTransactionByHash(params);

      case 'eth_getLogs':
        return await handleGetLogs(params);

      case 'eth_getCode':
        return await handleGetCode(params);

      case 'eth_getBlockByHash':
        return await handleGetBlockByHash(params);

      case 'personal_sign':
      case 'eth_sign':
        return await handlePersonalSign(params, origin, method);

      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        return await handleSignTypedData(params, origin, method);

      default:
        return { error: { code: -32601, message: `Method ${method} not supported` } };
    }
  } catch (error) {
    console.error('🫀 Error handling request:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_requestAccounts - Request permission to connect
async function handleRequestAccounts(origin, tab) {
  // Check if already connected
  if (await isSiteConnected(origin)) {
    const wallet = await getActiveWallet();
    if (wallet && wallet.address) {
      return { result: [wallet.address] };
    }
  }

  // Need user approval - create a pending request
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString();
    pendingConnections.set(requestId, { resolve, reject, origin, tabId: tab?.id });

    // Open approval popup
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=connect&origin=${encodeURIComponent(origin)}&requestId=${requestId}`),
      type: 'popup',
      width: 400,
      height: 600
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      if (pendingConnections.has(requestId)) {
        pendingConnections.delete(requestId);
        reject(new Error('Connection request timeout'));
      }
    }, 300000);
  });
}

// Handle eth_accounts - Get connected accounts
async function handleAccounts(origin) {
  // Only return accounts if site is connected
  if (await isSiteConnected(origin)) {
    const wallet = await getActiveWallet();
    if (wallet && wallet.address) {
      return { result: [wallet.address] };
    }
  }

  return { result: [] };
}

// Handle eth_chainId - Get current chain ID
async function handleChainId() {
  const chainId = await getCurrentChainId();
  return { result: chainId };
}

// Handle wallet_switchEthereumChain - Switch to a different network
async function handleSwitchChain(params) {
  if (!params || !params[0] || !params[0].chainId) {
    return { error: { code: -32602, message: 'Invalid params' } };
  }

  const requestedChainId = params[0].chainId;
  // Switching chain

  // Find matching network
  const networkMap = {
    '0x3af': 'pulsechainTestnet',
    '0x3AF': 'pulsechainTestnet',
    '0x171': 'pulsechain',
    '0x1': 'ethereum',
    '0xaa36a7': 'sepolia',
    '0xAA36A7': 'sepolia'
  };

  const networkKey = networkMap[requestedChainId];

  if (!networkKey) {
    // Chain not supported - return error code 4902 so dApp can call wallet_addEthereumChain
    return {
      error: {
        code: 4902,
        message: 'Unrecognized chain ID. Try adding the chain using wallet_addEthereumChain.'
      }
    };
  }

  // Update current network
  await save('currentNetwork', networkKey);

  // Notify all tabs about chain change
  const newChainId = CHAIN_IDS[networkKey];
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'CHAIN_CHANGED',
        chainId: newChainId
      }).catch(() => {
        // Tab might not have content script, ignore error
      });
    });
  });

  return { result: null };
}

// Handle wallet_addEthereumChain - Add a new network (simplified version)
async function handleAddChain(params) {
  if (!params || !params[0] || !params[0].chainId) {
    return { error: { code: -32602, message: 'Invalid params' } };
  }

  const chainInfo = params[0];
  console.log('🫀 Request to add chain:', chainInfo);

  // For now, only support our predefined chains
  // Check if it's one of our supported chains
  const supportedChains = {
    '0x3af': true,
    '0x3AF': true,
    '0x171': true,
    '0x1': true,
    '0xaa36a7': true,
    '0xAA36A7': true
  };

  if (supportedChains[chainInfo.chainId]) {
    // Chain is already supported, just switch to it
    return await handleSwitchChain([{ chainId: chainInfo.chainId }]);
  }

  // Custom chains not supported yet
  return {
    error: {
      code: -32603,
      message: 'Adding custom chains not supported yet. Only PulseChain and Ethereum networks are supported.'
    }
  };
}

// Handle connection approval from popup
async function handleConnectionApproval(requestId, approved) {
  if (!pendingConnections.has(requestId)) {
    return { success: false, error: 'Request not found or expired' };
  }

  const { resolve, reject, origin } = pendingConnections.get(requestId);
  pendingConnections.delete(requestId);

  if (approved) {
    const wallet = await getActiveWallet();
    if (wallet && wallet.address) {
      // Save connected site
      await addConnectedSite(origin, [wallet.address]);

      // Resolve the pending promise
      resolve({ result: [wallet.address] });

      return { success: true };
    } else {
      reject(new Error('No active wallet'));
      return { success: false, error: 'No active wallet' };
    }
  } else {
    reject(new Error('User rejected connection'));
    return { success: false, error: 'User rejected' };
  }
}

// Get connection request details for popup
function getConnectionRequest(requestId) {
  if (pendingConnections.has(requestId)) {
    const { origin } = pendingConnections.get(requestId);
    return { success: true, origin };
  }
  return { success: false, error: 'Request not found' };
}

// Get current network key
async function getCurrentNetwork() {
  const network = await load('currentNetwork');
  return network || 'pulsechainTestnet';
}

// Handle eth_blockNumber - Get current block number
async function handleBlockNumber() {
  try {
    const network = await getCurrentNetwork();
    const blockNumber = await rpc.getBlockNumber(network);
    return { result: blockNumber };
  } catch (error) {
    console.error('Error getting block number:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_getBlockByNumber - Get block by number
async function handleGetBlockByNumber(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing block number parameter' } };
  }

  try {
    const blockNumber = params[0];
    const includeTransactions = params[1] || false;
    const network = await getCurrentNetwork();
    const block = await rpc.getBlockByNumber(network, blockNumber, includeTransactions);
    return { result: block };
  } catch (error) {
    console.error('Error getting block by number:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_getBalance - Get balance for an address
async function handleGetBalance(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing address parameter' } };
  }

  try {
    const address = params[0];
    const network = await getCurrentNetwork();
    const balance = await rpc.getBalance(network, address);
    return { result: balance };
  } catch (error) {
    console.error('Error getting balance:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_getTransactionCount - Get transaction count (nonce)
async function handleGetTransactionCount(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing address parameter' } };
  }

  try {
    const address = params[0];
    const network = await getCurrentNetwork();
    const count = await rpc.getTransactionCount(network, address);
    return { result: count };
  } catch (error) {
    console.error('Error getting transaction count:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_gasPrice - Get current gas price
async function handleGasPrice() {
  try {
    const network = await getCurrentNetwork();
    const gasPrice = await rpc.getGasPrice(network);
    return { result: gasPrice };
  } catch (error) {
    console.error('Error getting gas price:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_estimateGas - Estimate gas for a transaction
async function handleEstimateGas(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing transaction parameter' } };
  }

  try {
    const network = await getCurrentNetwork();
    const gas = await rpc.estimateGas(network, params[0]);
    return { result: gas };
  } catch (error) {
    console.error('Error estimating gas:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_call - Execute a read-only call
async function handleCall(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing transaction parameter' } };
  }

  try {
    const network = await getCurrentNetwork();
    const result = await rpc.call(network, params[0]);
    return { result };
  } catch (error) {
    console.error('Error executing call:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_sendRawTransaction - Send a pre-signed transaction
async function handleSendRawTransaction(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing signed transaction parameter' } };
  }

  try {
    const signedTx = params[0];
    const network = await getCurrentNetwork();
    const txHash = await rpc.sendRawTransaction(network, signedTx);
    return { result: txHash };
  } catch (error) {
    console.error('Error sending raw transaction:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_getTransactionReceipt - Get transaction receipt
async function handleGetTransactionReceipt(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing transaction hash parameter' } };
  }

  try {
    const txHash = params[0];
    const network = await getCurrentNetwork();
    const receipt = await rpc.getTransactionReceipt(network, txHash);
    return { result: receipt };
  } catch (error) {
    console.error('Error getting transaction receipt:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Handle eth_getTransactionByHash - Get transaction by hash
async function handleGetTransactionByHash(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing transaction hash parameter' } };
  }

  try {
    const txHash = params[0];
    const network = await getCurrentNetwork();
    const tx = await rpc.getTransactionByHash(network, txHash);
    return { result: tx };
  } catch (error) {
    console.error('Error getting transaction by hash:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

async function handleGetLogs(params) {
  try {
    const network = await getCurrentNetwork();
    const provider = await rpc.getProvider(network);
    const logs = await provider.send('eth_getLogs', params);
    return { result: logs };
  } catch (error) {
    console.error('Error getting logs:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

async function handleGetCode(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing address parameter' } };
  }

  try {
    const network = await getCurrentNetwork();
    const provider = await rpc.getProvider(network);
    const code = await provider.send('eth_getCode', params);
    return { result: code };
  } catch (error) {
    console.error('Error getting code:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

async function handleGetBlockByHash(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing block hash parameter' } };
  }

  try {
    const network = await getCurrentNetwork();
    const provider = await rpc.getProvider(network);
    const block = await provider.send('eth_getBlockByHash', params);
    return { result: block };
  } catch (error) {
    console.error('Error getting block by hash:', error);
    return { error: { code: -32603, message: error.message } };
  }
}

// Pending transaction requests (requestId -> { resolve, reject, origin })
const pendingTransactions = new Map();

// Pending token add requests (requestId -> { resolve, reject, origin, tokenInfo })
const pendingTokenRequests = new Map();

// Pending message signing requests (requestId -> { resolve, reject, origin, signRequest, approvalToken })
const pendingSignRequests = new Map();

// ===== RATE LIMITING =====
// Prevents malicious dApps from spamming transaction approval requests
const rateLimitMap = new Map(); // origin -> { count, windowStart, pendingCount }

const RATE_LIMIT_CONFIG = {
  MAX_PENDING_REQUESTS: 5, // Max pending requests per origin
  MAX_REQUESTS_PER_WINDOW: 20, // Max total requests per time window
  TIME_WINDOW_MS: 60000 // 1 minute window
};

/**
 * Checks if an origin has exceeded rate limits
 * @param {string} origin - The origin to check
 * @returns {{ allowed: boolean, reason?: string }}
 */
function checkRateLimit(origin) {
  const now = Date.now();
  
  // Get or create rate limit entry for this origin
  if (!rateLimitMap.has(origin)) {
    rateLimitMap.set(origin, {
      count: 0,
      windowStart: now,
      pendingCount: 0
    });
  }
  
  const limitData = rateLimitMap.get(origin);
  
  // Reset window if expired
  if (now - limitData.windowStart > RATE_LIMIT_CONFIG.TIME_WINDOW_MS) {
    limitData.count = 0;
    limitData.windowStart = now;
  }
  
  // Check pending requests limit
  if (limitData.pendingCount >= RATE_LIMIT_CONFIG.MAX_PENDING_REQUESTS) {
    return {
      allowed: false,
      reason: `Too many pending requests. Maximum ${RATE_LIMIT_CONFIG.MAX_PENDING_REQUESTS} pending requests allowed.`
    };
  }
  
  // Check total requests in window
  if (limitData.count >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      reason: `Rate limit exceeded. Maximum ${RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_WINDOW} requests per minute.`
    };
  }
  
  return { allowed: true };
}

/**
 * Increments rate limit counters for an origin
 * @param {string} origin - The origin to increment
 */
function incrementRateLimit(origin) {
  const limitData = rateLimitMap.get(origin);
  if (limitData) {
    limitData.count++;
    limitData.pendingCount++;
  }
}

/**
 * Decrements pending counter when request is resolved
 * @param {string} origin - The origin to decrement
 */
function decrementPendingCount(origin) {
  const limitData = rateLimitMap.get(origin);
  if (limitData && limitData.pendingCount > 0) {
    limitData.pendingCount--;
  }
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [origin, data] of rateLimitMap.entries()) {
    if (now - data.windowStart > RATE_LIMIT_CONFIG.TIME_WINDOW_MS * 5 && data.pendingCount === 0) {
      rateLimitMap.delete(origin);
    }
  }
}, 300000);

// ===== TRANSACTION REPLAY PROTECTION =====
// Prevents the same transaction approval from being used multiple times
const processedApprovals = new Map(); // approvalToken -> { timestamp, txHash, used: true }

const REPLAY_PROTECTION_CONFIG = {
  APPROVAL_TIMEOUT: 300000, // 5 minutes - approval expires after this
  CLEANUP_INTERVAL: 60000   // 1 minute - clean up old approvals
};

/**
 * Generates a cryptographically secure one-time approval token
 * @returns {string} Unique approval token
 */
function generateApprovalToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates and marks an approval token as used
 * @param {string} approvalToken - Token to validate
 * @returns {boolean} True if valid and not yet used
 */
function validateAndUseApprovalToken(approvalToken) {
  if (!approvalToken) {
    console.warn('🫀 No approval token provided');
    return false;
  }
  
  const approval = processedApprovals.get(approvalToken);
  
  if (!approval) {
    console.warn('🫀 Unknown approval token');
    return false;
  }
  
  if (approval.used) {
    console.warn('🫀 Approval token already used - preventing replay attack');
    return false;
  }
  
  // Check if approval has expired
  const age = Date.now() - approval.timestamp;
  if (age > REPLAY_PROTECTION_CONFIG.APPROVAL_TIMEOUT) {
    console.warn('🫀 Approval token expired');
    processedApprovals.delete(approvalToken);
    return false;
  }
  
  // Mark as used
  approval.used = true;
  approval.usedAt = Date.now();
  console.log('🫀 Approval token validated and marked as used');
  
  return true;
}

// Clean up old processed approvals every minute
setInterval(() => {
  const now = Date.now();
  for (const [token, approval] of processedApprovals.entries()) {
    const age = now - approval.timestamp;
    if (age > REPLAY_PROTECTION_CONFIG.APPROVAL_TIMEOUT * 2) {
      processedApprovals.delete(token);
    }
  }
}, REPLAY_PROTECTION_CONFIG.CLEANUP_INTERVAL);

// Handle eth_sendTransaction - Sign and send a transaction
async function handleSendTransaction(params, origin) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: 'Missing transaction parameter' } };
  }

  // Check if site is connected
  if (!await isSiteConnected(origin)) {
    return { error: { code: 4100, message: 'Not authorized. Please connect your wallet first.' } };
  }

  // SECURITY: Check rate limit to prevent spam
  const rateLimitCheck = checkRateLimit(origin);
  if (!rateLimitCheck.allowed) {
    console.warn('🫀 Rate limit exceeded for origin:', origin);
    return { error: { code: 4200, message: sanitizeErrorMessage(rateLimitCheck.reason) } };
  }

  const txRequest = params[0];

  // Get current network from storage
  const currentNetwork = await load('currentNetwork') || 'pulsechain';

  // Dynamically fetch current gas price and use 3x as max (to allow for volatility)
  let maxGasPriceGwei;
  try {
    const currentGasPrice = await rpc.getGasPrice(currentNetwork);
    const currentGasPriceGwei = Number(BigInt(currentGasPrice)) / 1e9;
    // Use 3x current price as max to allow for network volatility
    maxGasPriceGwei = Math.ceil(currentGasPriceGwei * 3);
    // Ensure minimum of 100 Gwei for very low gas networks
    maxGasPriceGwei = Math.max(maxGasPriceGwei, 100);
  } catch (error) {
    console.warn('Failed to fetch gas price, using high default:', error);
    // If we can't fetch gas price, use a very high default to avoid blocking transactions
    maxGasPriceGwei = 10000000; // 10M Gwei - essentially no limit
  }

  // SECURITY: Comprehensive transaction validation
  const validation = validateTransactionRequest(txRequest, maxGasPriceGwei);
  if (!validation.valid) {
    console.warn('🫀 Invalid transaction from origin:', origin, validation.errors);
    return { 
      error: { 
        code: -32602, 
        message: 'Invalid transaction: ' + sanitizeErrorMessage(validation.errors.join('; ')) 
      } 
    };
  }

  // Use sanitized transaction parameters
  const sanitizedTx = validation.sanitized;

  // Increment rate limit counter
  incrementRateLimit(origin);

  // Need user approval - create a pending request
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString();
    
    // SECURITY: Generate one-time approval token for replay protection
    const approvalToken = generateApprovalToken();
    processedApprovals.set(approvalToken, {
      timestamp: Date.now(),
      requestId,
      used: false
    });
    
    // Store sanitized transaction instead of original request
    pendingTransactions.set(requestId, { 
      resolve, 
      reject, 
      origin, 
      txRequest: sanitizedTx,
      approvalToken  // Include token for validation
    });

    // Open approval popup
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=transaction&requestId=${requestId}`),
      type: 'popup',
      width: 400,
      height: 600
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      if (pendingTransactions.has(requestId)) {
        pendingTransactions.delete(requestId);
        reject(new Error('Transaction request timeout'));
      }
    }, 300000);
  });
}

// Handle transaction approval from popup
async function handleTransactionApproval(requestId, approved, sessionToken, gasPrice, customNonce, txHash, txDetails = null) {
  if (!pendingTransactions.has(requestId)) {
    return { success: false, error: 'Request not found or expired' };
  }

  const { resolve, reject, origin, txRequest, approvalToken } = pendingTransactions.get(requestId);

  // SECURITY: Validate one-time approval token to prevent replay attacks
  if (!validateAndUseApprovalToken(approvalToken)) {
    pendingTransactions.delete(requestId);
    decrementPendingCount(origin);
    reject(new Error('Invalid or already used approval token - possible replay attack'));
    return { success: false, error: 'Invalid approval token' };
  }

  pendingTransactions.delete(requestId);

  // Decrement pending counter (request completed)
  decrementPendingCount(origin);

  if (!approved) {
    reject(new Error('User rejected transaction'));
    return { success: false, error: 'User rejected' };
  }

  try {
    // If txHash is provided, transaction was already signed and broadcast in the popup
    // (by hardware wallet OR software wallet). Just save to history and resolve.
    if (txHash) {
      const walletType = txDetails ? 'software' : 'hardware';
      console.log(`🫀 ${walletType} wallet transaction already broadcast:`, txHash);

      // Get active wallet for saving to history
      const activeWallet = await getActiveWallet();
      const network = await getCurrentNetwork();

      // Save transaction to history (use txDetails if provided for accurate data)
      const historyEntry = {
        hash: txHash,
        timestamp: Date.now(),
        from: activeWallet.address,
        to: txDetails?.to || txRequest.to || null,
        value: txDetails?.value || txRequest.value || '0',
        data: txDetails?.data || txRequest.data || '0x',
        gasPrice: txDetails?.gasPrice || '0',
        gasLimit: txDetails?.gasLimit || txRequest.gasLimit || txRequest.gas || null,
        nonce: txDetails?.nonce ?? null,
        network: network,
        status: txHistory.TX_STATUS.PENDING,
        blockNumber: null,
        type: txHistory.TX_TYPES.CONTRACT
      };

      // Include EIP-1559 fields if provided (needed for speed-up/cancel)
      if (txDetails?.maxFeePerGas) {
        historyEntry.maxFeePerGas = txDetails.maxFeePerGas;
      }
      if (txDetails?.maxPriorityFeePerGas) {
        historyEntry.maxPriorityFeePerGas = txDetails.maxPriorityFeePerGas;
      }

      await txHistory.addTxToHistory(activeWallet.address, historyEntry);

      // Send desktop notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
        title: 'Transaction Sent',
        message: `Transaction sent: ${txHash.slice(0, 20)}...`,
        priority: 2
      });

      // Start monitoring transaction for confirmation
      const provider = await rpc.getProvider(network);
      waitForConfirmation({ hash: txHash }, provider, activeWallet.address);

      // Log successful signing operation
      await logSigningOperation({
        type: 'transaction',
        address: activeWallet.address,
        origin: origin,
        method: 'eth_sendTransaction',
        success: true,
        txHash: txHash,
        walletType: walletType
      });

      // Resolve with transaction hash
      resolve({ result: txHash });
      return { success: true, txHash };
    }

    // Software wallet flow - validate session and get password (now async)
    let password = await validateSession(sessionToken);
    let signer = null;
    let connectedSigner = null;

    try {
    // Unlock wallet with auto-upgrade notification
    const unlockResult = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        // Notify user that wallet encryption is being upgraded
        console.log(`🔐 Auto-upgrading wallet encryption: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()} iterations`);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
          title: '🔐 Security Upgrade in Progress',
          message: `Upgrading wallet encryption to ${info.recommendedIterations.toLocaleString()} iterations for enhanced security...`,
          priority: 2
        });
      }
    });

    signer = unlockResult.signer;
    const { upgraded, iterationsBefore, iterationsAfter } = unlockResult;

    // Show completion notification if upgrade occurred
    if (upgraded) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
        title: '✅ Security Upgrade Complete',
        message: `Wallet encryption upgraded: ${iterationsBefore.toLocaleString()} → ${iterationsAfter.toLocaleString()} iterations`,
        priority: 2
      });
    }

    // Get current network
    const network = await getCurrentNetwork();
    const provider = await rpc.getProvider(network);

    // Connect signer to provider
    connectedSigner = signer.connect(provider);

    // Prepare transaction - create a clean copy with only necessary fields
    const txToSend = {
      to: txRequest.to,
      value: txRequest.value || '0x0',
      data: txRequest.data || '0x'
    };

    // Nonce handling priority:
    // 1. User-provided custom nonce (for replacing stuck transactions)
    // 2. DApp-provided nonce (validated)
    // 3. Auto-fetch by ethers.js
    if (customNonce !== undefined && customNonce !== null) {
      // User manually set nonce (e.g., to replace stuck transaction)
      const currentNonce = await provider.getTransactionCount(signer.address, 'pending');

      if (customNonce < currentNonce) {
        throw new Error(`Custom nonce ${customNonce} is less than current nonce ${currentNonce}. This may fail unless you're replacing a pending transaction.`);
      }

      txToSend.nonce = customNonce;
      // Using custom nonce
    } else if (txRequest.nonce !== undefined && txRequest.nonce !== null) {
      // SECURITY: Validate nonce if provided by DApp
      const currentNonce = await provider.getTransactionCount(signer.address, 'pending');
      const providedNonce = typeof txRequest.nonce === 'string'
        ? parseInt(txRequest.nonce, 16)
        : txRequest.nonce;

      // Nonce must be >= current pending nonce
      if (providedNonce < currentNonce) {
        throw new Error(`Invalid nonce: ${providedNonce} is less than current nonce ${currentNonce}`);
      }

      txToSend.nonce = providedNonce;
      // Using DApp-provided nonce
    } else {
      // If no nonce provided, ethers.js will fetch the correct one automatically
      // Auto-fetching nonce
    }

    // If DApp provided a gas limit, use it. Otherwise let ethers estimate.
    if (txRequest.gas || txRequest.gasLimit) {
      txToSend.gasLimit = txRequest.gas || txRequest.gasLimit;
      // Using provided gas limit
    }

    // Apply user-selected gas price if provided, or use safe network gas price
    if (gasPrice) {
      // Use user-selected gas price from UI
      txToSend.gasPrice = gasPrice;
      // Using custom gas price
    } else {
      // Fallback: Fetch safe gas price (base fee * 2) to prevent stuck transactions
      try {
        const safeGasPriceHex = await rpc.getSafeGasPrice(network);
        txToSend.gasPrice = BigInt(safeGasPriceHex);
        // Using safe gas price from base fee
      } catch (error) {
        console.warn('Error getting safe gas price, using provider fallback:', error);
        // Last resort fallback to provider
        const networkGasPrice = await provider.getFeeData();
        if (networkGasPrice.gasPrice) {
          txToSend.gasPrice = networkGasPrice.gasPrice;
        }
      }
    }

    // Send transaction
    const tx = await connectedSigner.sendTransaction(txToSend);

    // Transaction sent

    // Save transaction to history (network variable already defined above)
    await txHistory.addTxToHistory(signer.address, {
      hash: tx.hash,
      timestamp: Date.now(),
      from: signer.address,
      to: txRequest.to || null,
      value: txRequest.value || '0',
      data: tx.data || '0x',
      gasPrice: tx.gasPrice ? tx.gasPrice.toString() : '0',
      gasLimit: tx.gasLimit ? tx.gasLimit.toString() : null,
      nonce: tx.nonce,
      network: network,
      status: txHistory.TX_STATUS.PENDING,
      blockNumber: null,
      type: txHistory.TX_TYPES.CONTRACT
    });

    // Send desktop notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
      title: 'Transaction Sent',
      message: `Transaction sent: ${tx.hash.slice(0, 20)}...`,
      priority: 2
    });

    // Wait for confirmation in background
    waitForConfirmation(tx, provider, signer.address);

    // Log successful signing operation
    await logSigningOperation({
      type: 'transaction',
      address: signer.address,
      origin: origin,
      method: 'eth_sendTransaction',
      success: true,
      txHash: tx.hash,
      walletType: 'software'
    });

    // Resolve with transaction hash
    resolve({ result: tx.hash });

    return { success: true, txHash: tx.hash };
    } finally {
      // SECURITY: Clean up sensitive data from memory
      // Overwrite password with garbage before dereferencing
      if (password) {
        const tempObj = { password };
        secureCleanup(tempObj, ['password']);
        password = null;
      }

      // Clean up signer's private key
      if (signer) {
        secureCleanupSigner(signer);
        signer = null;
      }
      if (connectedSigner) {
        secureCleanupSigner(connectedSigner);
        connectedSigner = null;
      }
    }
  } catch (error) {
    console.error('🫀 Transaction error:', error);
    const sanitizedError = sanitizeErrorMessage(error.message);

    // Log failed signing operation
    await logSigningOperation({
      type: 'transaction',
      address: 'unknown',
      origin: origin,
      method: 'eth_sendTransaction',
      success: false,
      error: sanitizedError,
      walletType: 'software'
    });

    reject(new Error(sanitizedError));
    return { success: false, error: sanitizedError };
  }
}

// Get transaction request details for popup
function getTransactionRequest(requestId) {
  if (pendingTransactions.has(requestId)) {
    const { origin, txRequest } = pendingTransactions.get(requestId);
    return { success: true, origin, txRequest };
  }
  return { success: false, error: 'Request not found' };
}

// Handle wallet_watchAsset - Add custom token (EIP-747)
async function handleWatchAsset(params, origin, tab) {
  // Received wallet_watchAsset request

  // Validate params structure
  if (!params || !params.type || !params.options) {
    return { error: { code: -32602, message: 'Invalid params: must include type and options' } };
  }

  const { type, options } = params;

  // Only support ERC20/PRC20 tokens
  if (type.toUpperCase() !== 'ERC20') {
    return { error: { code: -32602, message: 'Only ERC20/PRC20 tokens are supported' } };
  }

  // Validate required token fields
  if (!options.address || !options.symbol) {
    return { error: { code: -32602, message: 'Token must have address and symbol' } };
  }

  const tokenInfo = {
    address: options.address.toLowerCase(),
    symbol: options.symbol,
    decimals: options.decimals || 18,
    image: options.image || null
  };

  // Requesting to add token

  // Need user approval - create a pending request
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString() + '_token';
    pendingTokenRequests.set(requestId, { resolve, reject, origin, tokenInfo });

    // Open approval popup
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=addToken&requestId=${requestId}`),
      type: 'popup',
      width: 400,
      height: 500
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      if (pendingTokenRequests.has(requestId)) {
        pendingTokenRequests.delete(requestId);
        reject(new Error('Token add request timeout'));
      }
    }, 300000);
  });
}

// Handle token add approval from popup
async function handleTokenAddApproval(requestId, approved) {
  if (!pendingTokenRequests.has(requestId)) {
    return { success: false, error: 'Request not found or expired' };
  }

  const { resolve, reject, tokenInfo } = pendingTokenRequests.get(requestId);
  pendingTokenRequests.delete(requestId);

  if (!approved) {
    reject(new Error('User rejected token'));
    return { success: false, error: 'User rejected' };
  }

  try {
    // Token approved - return true (wallet_watchAsset returns boolean)
    resolve({ result: true });
    return { success: true, tokenInfo };
  } catch (error) {
    console.error('🫀 Token add error:', error);
    reject(new Error(error.message));
    return { success: false, error: error.message };
  }
}

// Get token add request details for popup
function getTokenAddRequest(requestId) {
  if (pendingTokenRequests.has(requestId)) {
    const { origin, tokenInfo } = pendingTokenRequests.get(requestId);
    return { success: true, origin, tokenInfo };
  }
  return { success: false, error: 'Request not found' };
}

// Speed up a pending transaction by replacing it with higher gas price
async function handleSpeedUpTransaction(address, originalTxHash, sessionToken, gasPriceMultiplier = 1.2, customGasPrice = null) {
  let password = null;
  let signer = null;
  let wallet = null;

  try {
    // Validate session (now async)
    password = await validateSession(sessionToken);

    // Get original transaction details
    const originalTx = await txHistory.getTxByHash(address, originalTxHash);
    if (!originalTx) {
      return { success: false, error: 'Transaction not found' };
    }

    if (originalTx.status !== txHistory.TX_STATUS.PENDING) {
      return { success: false, error: 'Transaction is not pending' };
    }

    // Get wallet and unlock (auto-upgrade if needed)
    const unlockResult = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
    signer = unlockResult.signer;

    // SECURITY: Verify the transaction belongs to this wallet
    const walletAddress = await signer.getAddress();
    if (walletAddress.toLowerCase() !== address.toLowerCase()) {
      console.error('🫀 Address mismatch in speed-up: wallet address does not match request');
      return { success: false, error: 'Wallet address mismatch' };
    }

    // Verify original transaction is from this wallet
    if (originalTx.from && originalTx.from.toLowerCase() !== walletAddress.toLowerCase()) {
      console.error('🫀 Transaction ownership check failed: transaction does not belong to this wallet');
      return { success: false, error: 'Transaction does not belong to this wallet' };
    }

    // Get network and create provider with automatic failover
    const network = originalTx.network;
    const provider = await rpc.getProvider(network);
    wallet = signer.connect(provider);

    // Fetch the actual transaction from blockchain to check its type
    // This is needed because older transactions in history may not have EIP-1559 fields stored
    let isEIP1559 = originalTx.maxFeePerGas || originalTx.maxPriorityFeePerGas;
    let onChainMaxFeePerGas = null;
    let onChainMaxPriorityFeePerGas = null;

    try {
      const onChainTx = await provider.getTransaction(originalTxHash);
      if (onChainTx) {
        // Check if it's EIP-1559 (type 2)
        if (onChainTx.type === 2 || onChainTx.maxFeePerGas) {
          isEIP1559 = true;
          onChainMaxFeePerGas = onChainTx.maxFeePerGas;
          onChainMaxPriorityFeePerGas = onChainTx.maxPriorityFeePerGas;
          console.log('🫀 Detected EIP-1559 transaction from blockchain:', {
            maxFeePerGas: onChainMaxFeePerGas?.toString(),
            maxPriorityFeePerGas: onChainMaxPriorityFeePerGas?.toString()
          });
        }
      }
    } catch (fetchErr) {
      console.warn('🫀 Could not fetch original tx from blockchain:', fetchErr.message);
      // Continue with what we have from history
    }

    // Create replacement transaction with same nonce, data, and gasLimit
    const replacementTx = {
      to: originalTx.to,
      value: originalTx.value,
      data: originalTx.data || '0x',
      nonce: originalTx.nonce
    };

    // Include gasLimit if it was in the original transaction
    if (originalTx.gasLimit) {
      replacementTx.gasLimit = originalTx.gasLimit;
    }

    // For storing in history
    let newGasPrice = null;
    let newMaxFeePerGas = null;
    let newMaxPriorityFeePerGas = null;

    if (isEIP1559) {
      // EIP-1559: Must bump BOTH maxFeePerGas and maxPriorityFeePerGas by at least 10%
      // Using 12.5% bump to ensure acceptance (same as Ethereum default)
      const bumpMultiplier = 1125n; // 112.5% = 1.125x
      const bumpDivisor = 1000n;

      // Use on-chain values if available (more accurate), otherwise fall back to history
      const originalMaxFee = onChainMaxFeePerGas || BigInt(originalTx.maxFeePerGas || originalTx.gasPrice || '0');
      const originalPriorityFee = onChainMaxPriorityFeePerGas || BigInt(originalTx.maxPriorityFeePerGas || '0');

      if (customGasPrice) {
        // Custom gas price: use it for maxFeePerGas, calculate priority fee
        const customFee = BigInt(customGasPrice);
        // Priority fee should be at least 12.5% higher than original
        const minPriorityFee = (originalPriorityFee * bumpMultiplier) / bumpDivisor;
        // Use at least 1 Gwei for priority fee if not set
        const priorityFee = minPriorityFee > 0n ? minPriorityFee : 1000000000n;

        newMaxFeePerGas = customFee;
        newMaxPriorityFeePerGas = priorityFee < customFee ? priorityFee : customFee;
      } else {
        // Calculate bumped fees (12.5% higher)
        newMaxFeePerGas = (originalMaxFee * bumpMultiplier) / bumpDivisor;
        newMaxPriorityFeePerGas = (originalPriorityFee * bumpMultiplier) / bumpDivisor;

        // Ensure priority fee is at least 1 Gwei
        if (newMaxPriorityFeePerGas < 1000000000n) {
          newMaxPriorityFeePerGas = 1000000000n;
        }
      }

      replacementTx.maxFeePerGas = newMaxFeePerGas;
      replacementTx.maxPriorityFeePerGas = newMaxPriorityFeePerGas;

      console.log('🫀 EIP-1559 speed-up:', {
        originalMaxFee: originalMaxFee.toString(),
        originalPriorityFee: originalPriorityFee.toString(),
        newMaxFee: newMaxFeePerGas.toString(),
        newPriorityFee: newMaxPriorityFeePerGas.toString()
      });
    } else {
      // Legacy transaction: use gasPrice
      if (customGasPrice) {
        // Use custom gas price provided by user
        newGasPrice = BigInt(customGasPrice);
      } else {
        // Calculate from multiplier (1.2x of original by default)
        const originalGasPrice = BigInt(originalTx.gasPrice);
        newGasPrice = (originalGasPrice * BigInt(Math.floor(gasPriceMultiplier * 100))) / BigInt(100);
      }
      replacementTx.gasPrice = newGasPrice;
    }

    // Speeding up transaction

    // Send replacement transaction
    const tx = await wallet.sendTransaction(replacementTx);

    // Save new transaction to history (include EIP-1559 fields if applicable)
    const historyEntry = {
      hash: tx.hash,
      timestamp: Date.now(),
      from: address,
      to: originalTx.to,
      value: originalTx.value,
      data: originalTx.data || '0x',
      gasPrice: newGasPrice ? newGasPrice.toString() : (newMaxFeePerGas ? newMaxFeePerGas.toString() : originalTx.gasPrice),
      gasLimit: originalTx.gasLimit,
      nonce: originalTx.nonce,
      network: network,
      status: txHistory.TX_STATUS.PENDING,
      blockNumber: null,
      type: originalTx.type
    };

    // Add EIP-1559 fields if this was an EIP-1559 transaction
    if (newMaxFeePerGas) {
      historyEntry.maxFeePerGas = newMaxFeePerGas.toString();
    }
    if (newMaxPriorityFeePerGas) {
      historyEntry.maxPriorityFeePerGas = newMaxPriorityFeePerGas.toString();
    }

    await txHistory.addTxToHistory(address, historyEntry);

    // Mark original transaction as replaced/failed
    await txHistory.updateTxStatus(address, originalTxHash, txHistory.TX_STATUS.FAILED, null);

    // Send notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
      title: 'Transaction Sped Up',
      message: `Replacement transaction sent with ${Math.floor(gasPriceMultiplier * 100)}% gas price`,
      priority: 2
    });

    // Wait for confirmation
    waitForConfirmation(tx, provider, address);

    return { success: true, txHash: tx.hash, newGasPrice: newGasPrice.toString() };
  } catch (error) {
    console.error('🫀 Error speeding up transaction:', error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  } finally {
    // SECURITY: Clean up sensitive data from memory
    if (password) {
      const tempObj = { password };
      secureCleanup(tempObj, ['password']);
      password = null;
    }
    if (signer) {
      secureCleanupSigner(signer);
      signer = null;
    }
    if (wallet) {
      secureCleanupSigner(wallet);
      wallet = null;
    }
  }
}

// Cancel a pending transaction by replacing it with a zero-value tx to self
async function handleCancelTransaction(address, originalTxHash, sessionToken, customGasPrice = null) {
  let password = null;
  let signer = null;
  let wallet = null;

  try {
    // Validate session (now async)
    password = await validateSession(sessionToken);

    // Get original transaction details
    const originalTx = await txHistory.getTxByHash(address, originalTxHash);
    if (!originalTx) {
      return { success: false, error: 'Transaction not found' };
    }

    if (originalTx.status !== txHistory.TX_STATUS.PENDING) {
      return { success: false, error: 'Transaction is not pending' };
    }

    // Get wallet and unlock (auto-upgrade if needed)
    const unlockResult = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
    signer = unlockResult.signer;

    // SECURITY: Verify the transaction belongs to this wallet
    const walletAddress = await signer.getAddress();
    if (walletAddress.toLowerCase() !== address.toLowerCase()) {
      console.error('🫀 Address mismatch in cancel: wallet address does not match request');
      return { success: false, error: 'Wallet address mismatch' };
    }

    // Verify original transaction is from this wallet
    if (originalTx.from && originalTx.from.toLowerCase() !== walletAddress.toLowerCase()) {
      console.error('🫀 Transaction ownership check failed: transaction does not belong to this wallet');
      return { success: false, error: 'Transaction does not belong to this wallet' };
    }

    // Get network and create provider with automatic failover
    const network = originalTx.network;
    const provider = await rpc.getProvider(network);
    wallet = signer.connect(provider);

    // Fetch the actual transaction from blockchain to check its type
    let isEIP1559 = originalTx.maxFeePerGas || originalTx.maxPriorityFeePerGas;
    let onChainMaxFeePerGas = null;
    let onChainMaxPriorityFeePerGas = null;

    try {
      const onChainTx = await provider.getTransaction(originalTxHash);
      if (onChainTx) {
        if (onChainTx.type === 2 || onChainTx.maxFeePerGas) {
          isEIP1559 = true;
          onChainMaxFeePerGas = onChainTx.maxFeePerGas;
          onChainMaxPriorityFeePerGas = onChainTx.maxPriorityFeePerGas;
          console.log('🫀 Detected EIP-1559 transaction from blockchain for cancel');
        }
      }
    } catch (fetchErr) {
      console.warn('🫀 Could not fetch original tx from blockchain:', fetchErr.message);
    }

    // Create cancellation transaction (send 0 to self with same nonce)
    const cancelTx = {
      to: address,  // Send to self
      value: '0',   // Zero value
      data: '0x',   // Empty data
      nonce: originalTx.nonce,
      gasLimit: 21000  // Standard gas limit for simple ETH transfer
    };

    // For storing in history
    let newGasPrice = null;
    let newMaxFeePerGas = null;
    let newMaxPriorityFeePerGas = null;

    if (isEIP1559) {
      // EIP-1559: Must bump BOTH maxFeePerGas and maxPriorityFeePerGas by at least 10%
      const bumpMultiplier = 1125n; // 112.5%
      const bumpDivisor = 1000n;

      // Use on-chain values if available
      const originalMaxFee = onChainMaxFeePerGas || BigInt(originalTx.maxFeePerGas || originalTx.gasPrice || '0');
      const originalPriorityFee = onChainMaxPriorityFeePerGas || BigInt(originalTx.maxPriorityFeePerGas || '0');

      if (customGasPrice) {
        // Custom gas price: use it for maxFeePerGas
        const customFee = BigInt(customGasPrice);
        const minPriorityFee = (originalPriorityFee * bumpMultiplier) / bumpDivisor;
        const priorityFee = minPriorityFee > 0n ? minPriorityFee : 1000000000n;

        newMaxFeePerGas = customFee;
        newMaxPriorityFeePerGas = priorityFee < customFee ? priorityFee : customFee;
      } else {
        // Calculate bumped fees
        newMaxFeePerGas = (originalMaxFee * bumpMultiplier) / bumpDivisor;
        newMaxPriorityFeePerGas = (originalPriorityFee * bumpMultiplier) / bumpDivisor;

        if (newMaxPriorityFeePerGas < 1000000000n) {
          newMaxPriorityFeePerGas = 1000000000n;
        }
      }

      cancelTx.maxFeePerGas = newMaxFeePerGas;
      cancelTx.maxPriorityFeePerGas = newMaxPriorityFeePerGas;

      console.log('🫀 EIP-1559 cancel:', {
        originalMaxFee: originalMaxFee.toString(),
        originalPriorityFee: originalPriorityFee.toString(),
        newMaxFee: newMaxFeePerGas.toString(),
        newPriorityFee: newMaxPriorityFeePerGas.toString()
      });
    } else {
      // Legacy transaction
      if (customGasPrice) {
        newGasPrice = BigInt(customGasPrice);
      } else {
        const originalGasPrice = BigInt(originalTx.gasPrice);
        newGasPrice = (originalGasPrice * BigInt(120)) / BigInt(100);
      }
      cancelTx.gasPrice = newGasPrice;
    }

    // Cancelling transaction

    // Send cancellation transaction
    const tx = await wallet.sendTransaction(cancelTx);

    // Save cancellation transaction to history
    const historyEntry = {
      hash: tx.hash,
      timestamp: Date.now(),
      from: address,
      to: address,
      value: '0',
      data: '0x',
      gasPrice: newGasPrice ? newGasPrice.toString() : (newMaxFeePerGas ? newMaxFeePerGas.toString() : originalTx.gasPrice),
      gasLimit: '21000',
      nonce: originalTx.nonce,
      network: network,
      status: txHistory.TX_STATUS.PENDING,
      blockNumber: null,
      type: 'send'
    };

    if (newMaxFeePerGas) {
      historyEntry.maxFeePerGas = newMaxFeePerGas.toString();
    }
    if (newMaxPriorityFeePerGas) {
      historyEntry.maxPriorityFeePerGas = newMaxPriorityFeePerGas.toString();
    }

    await txHistory.addTxToHistory(address, historyEntry);

    // Mark original transaction as failed
    await txHistory.updateTxStatus(address, originalTxHash, txHistory.TX_STATUS.FAILED, null);

    // Send notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
      title: 'Transaction Cancelled',
      message: 'Cancellation transaction sent',
      priority: 2
    });

    // Wait for confirmation
    waitForConfirmation(tx, provider, address);

    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('🫀 Error cancelling transaction:', error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  } finally {
    // SECURITY: Clean up sensitive data from memory
    if (password) {
      const tempObj = { password };
      secureCleanup(tempObj, ['password']);
      password = null;
    }
    if (signer) {
      secureCleanupSigner(signer);
      signer = null;
    }
    if (wallet) {
      secureCleanupSigner(wallet);
      wallet = null;
    }
  }
}

// Get current network gas price (for speed-up UI)
async function getCurrentNetworkGasPrice(network) {
  try {
    // Get full gas price recommendations based on fee history
    const recommendations = await rpc.getGasPriceRecommendations(network);

    // Use "fast" tier as the recommended speed-up price
    const fastPrice = BigInt(recommendations.fast.maxFeePerGas);
    const instantPrice = BigInt(recommendations.instant.maxFeePerGas);

    return {
      success: true,
      gasPrice: fastPrice.toString(),
      gasPriceGwei: (Number(fastPrice) / 1e9).toFixed(2),
      recommendations: {
        slow: recommendations.slow.maxFeePerGas,
        normal: recommendations.normal.maxFeePerGas,
        fast: recommendations.fast.maxFeePerGas,
        instant: recommendations.instant.maxFeePerGas
      },
      instantPrice: instantPrice.toString(),
      instantPriceGwei: (Number(instantPrice) / 1e9).toFixed(2)
    };
  } catch (error) {
    console.error('🫀 Error fetching current gas price:', error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  }
}

// Refresh transaction status from blockchain
async function refreshTransactionStatus(address, txHash, network) {
  try {
    console.log(`🫀 Refreshing tx status: ${txHash} on ${network}`);
    const provider = await rpc.getProvider(network);

    // Get transaction receipt from blockchain
    const receipt = await provider.getTransactionReceipt(txHash);
    console.log(`🫀 Receipt for ${txHash.slice(0, 10)}...:`, receipt ? 'found' : 'null');

    if (!receipt) {
      // No receipt - check if transaction is still in mempool
      const tx = await provider.getTransaction(txHash);
      console.log(`🫀 Mempool tx for ${txHash.slice(0, 10)}...:`, tx ? 'found' : 'null');

      if (!tx) {
        // Transaction not in mempool and no receipt = dropped/evicted
        console.log(`🫀 Transaction ${txHash.slice(0, 10)}... was DROPPED - marking as failed`);
        // Mark as failed in local history
        await txHistory.updateTxStatus(
          address,
          txHash,
          txHistory.TX_STATUS.FAILED,
          null
        );

        return {
          success: true,
          status: 'dropped',
          message: 'Transaction was dropped from mempool (not confirmed, no longer pending)'
        };
      }

      // Transaction exists in mempool, still pending
      console.log(`🫀 Transaction ${txHash.slice(0, 10)}... still in mempool`);
      return {
        success: true,
        status: 'pending',
        message: 'Transaction is still pending on the blockchain'
      };
    }

    // Transaction has been mined
    let newStatus;
    if (receipt.status === 1) {
      newStatus = txHistory.TX_STATUS.CONFIRMED;
    } else {
      newStatus = txHistory.TX_STATUS.FAILED;
    }

    // Update local transaction history
    await txHistory.updateTxStatus(
      address,
      txHash,
      newStatus,
      receipt.blockNumber
    );

    return {
      success: true,
      status: newStatus,
      blockNumber: receipt.blockNumber,
      message: newStatus === txHistory.TX_STATUS.CONFIRMED
        ? 'Transaction confirmed on blockchain'
        : 'Transaction failed on blockchain'
    };

  } catch (error) {
    console.error('🫀 Error refreshing transaction status:', error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  }
}

// Rebroadcast a pending transaction to all configured RPCs
async function rebroadcastTransaction(txHash, network) {
  try {
    console.log(`🫀 Rebroadcasting transaction: ${txHash} to all ${network} RPCs`);

    // First, try to get the raw transaction
    let rawTx = await rpc.getRawTransaction(network, txHash);

    if (!rawTx) {
      // If getRawTransaction not supported, we need to reconstruct from tx data
      // Get the transaction details
      const provider = await rpc.getProvider(network);
      const tx = await provider.getTransaction(txHash);

      if (!tx) {
        return {
          success: false,
          error: 'Transaction not found in mempool - it may have been dropped or already confirmed'
        };
      }

      // Get the raw serialized transaction from the provider
      // ethers v6 doesn't expose raw tx directly, so we use a workaround
      try {
        // Try direct RPC call to get raw tx
        const rawResult = await provider.send('eth_getRawTransactionByHash', [txHash]);
        if (rawResult) {
          rawTx = rawResult;
        }
      } catch (e) {
        console.warn('Could not get raw transaction via RPC:', e.message);
      }

      if (!rawTx) {
        return {
          success: false,
          error: 'Cannot get raw transaction data. The RPC nodes may not support this operation.'
        };
      }
    }

    // Broadcast to all RPCs
    const results = await rpc.broadcastToAllRpcs(network, rawTx);

    console.log(`🫀 Rebroadcast results - Successes: ${results.successes.length}, Failures: ${results.failures.length}`);

    if (results.successes.length > 0) {
      return {
        success: true,
        message: `Transaction broadcast to ${results.successes.length} RPC(s)`,
        successes: results.successes,
        failures: results.failures
      };
    } else {
      return {
        success: false,
        error: 'Failed to broadcast to any RPC',
        failures: results.failures
      };
    }

  } catch (error) {
    console.error('🫀 Error rebroadcasting transaction:', error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  }
}

// Track transactions being monitored to prevent duplicates
const monitoringTransactions = new Set();

// Wait for transaction confirmation with timeout and retry
async function waitForConfirmation(tx, provider, address) {
  const txHash = tx.hash;

  // Prevent duplicate monitoring
  if (monitoringTransactions.has(txHash)) {
    console.log(`🫀 Transaction ${txHash.slice(0, 10)}... already being monitored`);
    return;
  }
  monitoringTransactions.add(txHash);

  const POLL_INTERVAL = 15 * 1000; // 15 seconds
  const MAX_RETRIES = 40; // 40 * 15s = 10 minutes

  try {
    let receipt = null;
    let retries = 0;

    // Poll for receipt with timeout
    while (!receipt && retries < MAX_RETRIES) {
      try {
        receipt = await provider.getTransactionReceipt(txHash);
        if (receipt) break;
      } catch (rpcError) {
        console.warn(`🫀 RPC error checking tx ${txHash.slice(0, 10)}..., retrying:`, rpcError.message);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      retries++;
    }

    if (!receipt) {
      console.warn(`🫀 Transaction ${txHash.slice(0, 10)}... confirmation timed out after ${MAX_RETRIES} attempts`);
      // Don't mark as failed - it might still be pending in mempool
      return;
    }

    if (receipt.status === 1) {
      // Transaction confirmed successfully
      await txHistory.updateTxStatus(
        address,
        txHash,
        txHistory.TX_STATUS.CONFIRMED,
        receipt.blockNumber
      );

      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
        title: 'Transaction Confirmed',
        message: `Transaction confirmed in block ${receipt.blockNumber}`,
        priority: 2
      });
    } else {
      // Transaction reverted (status === 0)
      await txHistory.updateTxStatus(
        address,
        txHash,
        txHistory.TX_STATUS.FAILED,
        receipt.blockNumber
      );

      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
        title: 'Transaction Failed',
        message: 'Transaction was reverted on-chain',
        priority: 2
      });
    }
  } catch (error) {
    console.error('🫀 Error in confirmation monitoring:', error);
  } finally {
    // Always clean up tracking
    monitoringTransactions.delete(txHash);
  }
}

// ===== MESSAGE SIGNING HANDLERS =====

// Handle personal_sign (EIP-191) - Sign a message
async function handlePersonalSign(params, origin, method) {
  // Check if site is connected
  if (!await isSiteConnected(origin)) {
    return { error: { code: 4100, message: 'Not authorized. Please connect your wallet first.' } };
  }

  // Validate sign request
  const validation = validateSignRequest(method, params);
  if (!validation.valid) {
    console.warn('🫀 Invalid sign request from origin:', origin, validation.error);
    return {
      error: {
        code: -32602,
        message: 'Invalid sign request: ' + sanitizeErrorMessage(validation.error)
      }
    };
  }

  const { message, address } = validation.sanitized;

  // SECURITY: Check if eth_sign is allowed (disabled by default)
  if (method === 'eth_sign') {
    const settings = await load('settings');
    const allowEthSign = settings?.allowEthSign || false;

    if (!allowEthSign) {
      console.warn('🫀 eth_sign request blocked (disabled in settings):', origin);
      return {
        error: {
          code: 4100,
          message: 'eth_sign is disabled for security. Use personal_sign instead, or enable eth_sign in wallet settings.'
        }
      };
    }

    // Log warning when eth_sign is used (even when enabled)
    console.warn('⚠️ eth_sign request approved by settings from:', origin);
  }

  // Verify the address matches the connected account
  const wallet = await getActiveWallet();
  if (!wallet || wallet.address.toLowerCase() !== address.toLowerCase()) {
    return {
      error: {
        code: 4100,
        message: 'Requested address does not match connected account'
      }
    };
  }

  // Need user approval - create a pending request
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString() + '_sign';

    // Generate one-time approval token for replay protection
    const approvalToken = generateApprovalToken();
    processedApprovals.set(approvalToken, {
      timestamp: Date.now(),
      requestId,
      used: false
    });

    pendingSignRequests.set(requestId, {
      resolve,
      reject,
      origin,
      method,
      signRequest: { message, address },
      approvalToken
    });

    // Open approval popup
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=sign&requestId=${requestId}&method=${method}`),
      type: 'popup',
      width: 400,
      height: 600
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      if (pendingSignRequests.has(requestId)) {
        pendingSignRequests.delete(requestId);
        reject(new Error('Sign request timeout'));
      }
    }, 300000);
  });
}

// Handle eth_signTypedData (EIP-712) - Sign typed data
async function handleSignTypedData(params, origin, method) {
  // Check if site is connected
  if (!await isSiteConnected(origin)) {
    return { error: { code: 4100, message: 'Not authorized. Please connect your wallet first.' } };
  }

  // Validate sign request
  const validation = validateSignRequest(method, params);
  if (!validation.valid) {
    console.warn('🫀 Invalid sign typed data request from origin:', origin, validation.error);
    return {
      error: {
        code: -32602,
        message: 'Invalid sign request: ' + sanitizeErrorMessage(validation.error)
      }
    };
  }

  const { address, typedData } = validation.sanitized;

  // Verify the address matches the connected account
  const wallet = await getActiveWallet();
  if (!wallet || wallet.address.toLowerCase() !== address.toLowerCase()) {
    return {
      error: {
        code: 4100,
        message: 'Requested address does not match connected account'
      }
    };
  }

  // Need user approval - create a pending request
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString() + '_signTyped';

    // Generate one-time approval token for replay protection
    const approvalToken = generateApprovalToken();
    processedApprovals.set(approvalToken, {
      timestamp: Date.now(),
      requestId,
      used: false
    });

    pendingSignRequests.set(requestId, {
      resolve,
      reject,
      origin,
      method,
      signRequest: { typedData, address },
      approvalToken
    });

    // Open approval popup
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=signTyped&requestId=${requestId}&method=${method}`),
      type: 'popup',
      width: 400,
      height: 650
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      if (pendingSignRequests.has(requestId)) {
        pendingSignRequests.delete(requestId);
        reject(new Error('Sign request timeout'));
      }
    }, 300000);
  });
}

// Handle message signing approval from popup
async function handleSignApproval(requestId, approved, sessionToken) {
  if (!pendingSignRequests.has(requestId)) {
    return { success: false, error: 'Request not found or expired' };
  }

  const { resolve, reject, origin, method, signRequest, approvalToken } = pendingSignRequests.get(requestId);

  // Validate one-time approval token to prevent replay attacks
  if (!validateAndUseApprovalToken(approvalToken)) {
    pendingSignRequests.delete(requestId);
    reject(new Error('Invalid or already used approval token - possible replay attack'));
    return { success: false, error: 'Invalid approval token' };
  }

  pendingSignRequests.delete(requestId);

  if (!approved) {
    reject(new Error('User rejected the request'));
    return { success: false, error: 'User rejected' };
  }

  let password = null;
  let signer = null;

  try {
    // Validate session and get password
    password = await validateSession(sessionToken);

    // Unlock wallet (auto-upgrade if needed)
    const unlockResult = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
    signer = unlockResult.signer;

    let signature;

    // Sign based on method
    if (method === 'personal_sign' || method === 'eth_sign') {
      signature = await personalSign(signer, signRequest.message);
    } else if (method.startsWith('eth_signTypedData')) {
      signature = await signTypedData(signer, signRequest.typedData);
    } else {
      throw new Error(`Unsupported signing method: ${method}`);
    }

    // Log successful signing operation
    const signerAddress = await signer.getAddress();
    await logSigningOperation({
      type: method.startsWith('eth_signTypedData') ? 'typed_data' : 'personal_sign',
      address: signerAddress,
      origin: origin,
      method: method,
      success: true,
      walletType: 'software'
    });

    // Signature generated successfully
    console.log('🫀 Message signed for origin:', origin);

    resolve({ result: signature });
    return { success: true, signature };
  } catch (error) {
    console.error('🫀 Error signing message:', error);

    // Log failed signing operation
    await logSigningOperation({
      type: method.startsWith('eth_signTypedData') ? 'typed_data' : 'personal_sign',
      address: signRequest.address || 'unknown',
      origin: origin,
      method: method,
      success: false,
      error: error.message,
      walletType: 'software'
    });

    reject(error);
    return { success: false, error: error.message };
  } finally {
    // SECURITY: Clean up sensitive data from memory
    if (password) {
      const tempObj = { password };
      secureCleanup(tempObj, ['password']);
      password = null;
    }
    if (signer) {
      secureCleanupSigner(signer);
      signer = null;
    }
  }
}

/**
 * Handle Ledger signature approval (pre-signed in popup)
 */
async function handleLedgerSignApproval(requestId, approved, signature) {
  if (!pendingSignRequests.has(requestId)) {
    return { success: false, error: 'Request not found or expired' };
  }

  const { resolve, reject, origin, method, signRequest, approvalToken } = pendingSignRequests.get(requestId);

  // Validate one-time approval token
  if (!validateAndUseApprovalToken(approvalToken)) {
    pendingSignRequests.delete(requestId);
    reject(new Error('Invalid or already used approval token'));
    return { success: false, error: 'Invalid approval token' };
  }

  pendingSignRequests.delete(requestId);

  if (!approved) {
    reject(new Error('User rejected the request'));
    return { success: false, error: 'User rejected' };
  }

  try {
    // Log successful Ledger signing operation
    await logSigningOperation({
      type: method && method.startsWith('eth_signTypedData') ? 'typed_data' : 'personal_sign',
      address: signRequest?.address || 'ledger',
      origin: origin,
      method: method || 'personal_sign',
      success: true,
      walletType: 'hardware'
    });

    // Signature already created by Ledger in popup - just pass it through
    console.log('🫀 Ledger message signed for origin:', origin);
    resolve({ result: signature });
    return { success: true, signature };
  } catch (error) {
    console.error('🫀 Error processing Ledger signature:', error);

    // Log failed signing operation
    await logSigningOperation({
      type: method && method.startsWith('eth_signTypedData') ? 'typed_data' : 'personal_sign',
      address: signRequest?.address || 'ledger',
      origin: origin,
      method: method || 'personal_sign',
      success: false,
      error: error.message,
      walletType: 'hardware'
    });

    reject(error);
    return { success: false, error: error.message };
  }
}

// Get sign request details (for popup)
function getSignRequest(requestId) {
  return pendingSignRequests.get(requestId);
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Received message

  (async () => {
    try {
      switch (message.type) {
        case 'WALLET_REQUEST':
          const result = await handleWalletRequest(message, sender);
          // Sending response
          sendResponse(result);
          break;

        case 'CONNECTION_APPROVAL':
          const approvalResult = await handleConnectionApproval(message.requestId, message.approved);
          // Sending approval response
          sendResponse(approvalResult);
          break;

        case 'GET_CONNECTION_REQUEST':
          const requestInfo = getConnectionRequest(message.requestId);
          // Sending connection request info
          sendResponse(requestInfo);
          break;

        case 'GET_CONNECTED_SITES':
          const sites = await getConnectedSites();
          console.log('🫀 Sending connected sites');
          sendResponse({ success: true, sites });
          break;

        case 'DISCONNECT_SITE':
          await removeConnectedSite(message.origin);
          // Sending disconnect confirmation
          sendResponse({ success: true });
          break;

        case 'TRANSACTION_APPROVAL':
          const txApprovalResult = await handleTransactionApproval(message.requestId, message.approved, message.sessionToken, message.gasPrice, message.customNonce, message.txHash, message.txDetails);
          // Sending transaction approval response
          sendResponse(txApprovalResult);
          break;

        case 'CREATE_SESSION':
          try {
            const sessionToken = await createSession(message.password, message.walletId, message.durationMs);
            sendResponse({ success: true, sessionToken });
          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
          break;

        case 'INVALIDATE_SESSION':
          const invalidated = invalidateSession(message.sessionToken);
          sendResponse({ success: invalidated });
          break;

        case 'INVALIDATE_ALL_SESSIONS':
          const count = invalidateAllSessions();
          sendResponse({ success: true, count });
          break;

        case 'GET_TRANSACTION_REQUEST':
          const txRequestInfo = getTransactionRequest(message.requestId);
          console.log('🫀 Sending transaction request info:', txRequestInfo);
          sendResponse(txRequestInfo);
          break;

        case 'TOKEN_ADD_APPROVAL':
          const tokenApprovalResult = await handleTokenAddApproval(message.requestId, message.approved);
          console.log('🫀 Sending token add approval response:', tokenApprovalResult);
          sendResponse(tokenApprovalResult);
          break;

        case 'SIGN_APPROVAL':
          const signApprovalResult = await handleSignApproval(
            message.requestId,
            message.approved,
            message.sessionToken
          );
          console.log('🫀 Sending sign approval response:', signApprovalResult);
          sendResponse(signApprovalResult);
          break;

        case 'SIGN_APPROVAL_LEDGER':
          const ledgerSignResult = await handleLedgerSignApproval(
            message.requestId,
            message.approved,
            message.signature
          );
          console.log('🫀 Sending Ledger sign approval response:', ledgerSignResult);
          sendResponse(ledgerSignResult);
          break;

        case 'GET_SIGN_REQUEST':
          const signRequestInfo = getSignRequest(message.requestId);
          console.log('🫀 Sending sign request info:', signRequestInfo);
          sendResponse(signRequestInfo);
          break;

        case 'GET_TOKEN_ADD_REQUEST':
          const tokenRequestInfo = getTokenAddRequest(message.requestId);
          console.log('🫀 Sending token add request info:', tokenRequestInfo);
          sendResponse(tokenRequestInfo);
          break;

        // Signing Audit Log
        case 'GET_SIGNING_AUDIT_LOG':
          const signingLog = await getSigningAuditLog();
          sendResponse({ success: true, log: signingLog });
          break;

        // Transaction History
        case 'GET_TX_HISTORY':
          const txHistoryList = await txHistory.getTxHistory(message.address);
          sendResponse({ success: true, transactions: txHistoryList });
          break;

        case 'GET_PENDING_TX_COUNT':
          const pendingCount = await txHistory.getPendingTxCount(message.address);
          sendResponse({ success: true, count: pendingCount });
          break;

        case 'GET_PENDING_TXS':
          const pendingTxs = await txHistory.getPendingTxs(message.address);
          sendResponse({ success: true, transactions: pendingTxs });
          break;

        case 'GET_TX_BY_HASH':
          const txDetail = await txHistory.getTxByHash(message.address, message.txHash);
          sendResponse({ success: true, transaction: txDetail });
          break;

        case 'SAVE_TX':
          await txHistory.addTxToHistory(message.address, message.transaction);
          sendResponse({ success: true });
          break;

        case 'SAVE_AND_MONITOR_TX':
          await txHistory.addTxToHistory(message.address, message.transaction);

          // Start monitoring for confirmation in background
          (async () => {
            try {
              const network = message.transaction.network || 'pulsechainTestnet';
              const provider = await rpc.getProvider(network);
              const tx = { hash: message.transaction.hash };
              await waitForConfirmation(tx, provider, message.address);
            } catch (error) {
              console.error('Error monitoring transaction:', error);
            }
          })();

          sendResponse({ success: true });
          break;

        case 'CLEAR_TX_HISTORY':
          await txHistory.clearTxHistory(message.address);
          sendResponse({ success: true });
          break;

        case 'GET_CURRENT_GAS_PRICE':
          const gasPriceResult = await getCurrentNetworkGasPrice(message.network);
          sendResponse(gasPriceResult);
          break;

        case 'REFRESH_TX_STATUS':
          const refreshResult = await refreshTransactionStatus(
            message.address,
            message.txHash,
            message.network
          );
          sendResponse(refreshResult);
          break;

        case 'REBROADCAST_TX':
          const rebroadcastResult = await rebroadcastTransaction(
            message.txHash,
            message.network
          );
          sendResponse(rebroadcastResult);
          break;

        case 'SPEED_UP_TX':
          const speedUpResult = await handleSpeedUpTransaction(
            message.address,
            message.txHash,
            message.sessionToken,
            message.gasPriceMultiplier || 1.2,
            message.customGasPrice || null
          );
          sendResponse(speedUpResult);
          break;

        case 'CANCEL_TX':
          const cancelResult = await handleCancelTransaction(
            message.address,
            message.txHash,
            message.sessionToken,
            message.customGasPrice || null
          );
          sendResponse(cancelResult);
          break;

        case 'SPEED_UP_TX_COMPLETE':
          // Transaction was already signed and broadcast in popup - just save to history
          try {
            const network = await getCurrentNetwork();

            // Save new transaction to history
            const historyEntry = {
              hash: message.newTxHash,
              timestamp: Date.now(),
              from: message.address,
              to: message.txDetails.to,
              value: message.txDetails.value,
              data: message.txDetails.data || '0x',
              gasPrice: message.txDetails.gasPrice,
              gasLimit: message.txDetails.gasLimit,
              nonce: message.txDetails.nonce,
              network: network,
              status: txHistory.TX_STATUS.PENDING,
              blockNumber: null,
              type: txHistory.TX_TYPES.CONTRACT
            };

            if (message.txDetails.maxFeePerGas) {
              historyEntry.maxFeePerGas = message.txDetails.maxFeePerGas;
            }
            if (message.txDetails.maxPriorityFeePerGas) {
              historyEntry.maxPriorityFeePerGas = message.txDetails.maxPriorityFeePerGas;
            }

            await txHistory.addTxToHistory(message.address, historyEntry);

            // Mark original transaction as replaced
            await txHistory.updateTxStatus(message.address, message.originalTxHash, txHistory.TX_STATUS.FAILED, null);

            // Start monitoring new transaction
            const provider = await rpc.getProvider(network);
            waitForConfirmation({ hash: message.newTxHash }, provider, message.address);

            // Notification
            chrome.notifications.create({
              type: 'basic',
              iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
              title: 'Transaction Sped Up',
              message: `New TX: ${message.newTxHash.slice(0, 20)}...`,
              priority: 2
            });

            sendResponse({ success: true, txHash: message.newTxHash });
          } catch (error) {
            console.error('Error saving speed-up transaction:', error);
            sendResponse({ success: false, error: error.message });
          }
          break;

        case 'CANCEL_TX_COMPLETE':
          // Cancellation transaction was already signed and broadcast in popup - just save to history
          try {
            const network = await getCurrentNetwork();

            // Save cancellation transaction to history
            const cancelHistoryEntry = {
              hash: message.newTxHash,
              timestamp: Date.now(),
              from: message.address,
              to: message.address,
              value: '0',
              data: '0x',
              gasPrice: message.txDetails.gasPrice,
              gasLimit: '21000',
              nonce: message.txDetails.nonce,
              network: network,
              status: txHistory.TX_STATUS.PENDING,
              blockNumber: null,
              type: 'send'
            };

            if (message.txDetails.maxFeePerGas) {
              cancelHistoryEntry.maxFeePerGas = message.txDetails.maxFeePerGas;
            }
            if (message.txDetails.maxPriorityFeePerGas) {
              cancelHistoryEntry.maxPriorityFeePerGas = message.txDetails.maxPriorityFeePerGas;
            }

            await txHistory.addTxToHistory(message.address, cancelHistoryEntry);

            // Mark original transaction as cancelled/failed
            await txHistory.updateTxStatus(message.address, message.originalTxHash, txHistory.TX_STATUS.FAILED, null);

            // Start monitoring cancellation transaction
            const provider = await rpc.getProvider(network);
            waitForConfirmation({ hash: message.newTxHash }, provider, message.address);

            // Notification
            chrome.notifications.create({
              type: 'basic',
              iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
              title: 'Transaction Cancelled',
              message: 'Cancellation transaction sent',
              priority: 2
            });

            sendResponse({ success: true, txHash: message.newTxHash });
          } catch (error) {
            console.error('Error saving cancel transaction:', error);
            sendResponse({ success: false, error: error.message });
          }
          break;

        case 'UPDATE_RPC_PRIORITIES':
          // Update RPC priorities in the rpc module
          if (message.network && message.priorities) {
            rpc.updateRpcPriorities(message.network, message.priorities);
            console.log(`🫀 Updated RPC priorities for ${message.network}`);
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'Missing network or priorities' });
          }
          break;

        default:
          console.log('🫀 Unknown message type:', message.type);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('🫀 Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // Keep message channel open for async response
});

console.log('🫀 HeartWallet service worker ready');
