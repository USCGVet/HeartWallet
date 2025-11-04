import { l as load, s as save, E as getAddress, u as unlockWallet, g as getProvider, b as getActiveWallet, F as getTransactionByHash, G as getTransactionReceipt, H as sendRawTransaction, x as getGasPrice, y as estimateGas, I as call, z as getTransactionCount, j as getBalance, J as getBlockByNumber, K as getBlockNumber } from "./rpc.js";
const TX_HISTORY_KEY = "txHistory_v1";
const TX_HISTORY_SETTINGS_KEY = "txHistorySettings";
const MAX_TXS_PER_ADDRESS = 20;
const TX_TYPES = {
  CONTRACT: "contract"
};
const TX_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  FAILED: "failed"
};
async function getTxHistorySettings() {
  const settings = await load(TX_HISTORY_SETTINGS_KEY);
  return settings || {
    enabled: true,
    // Track transaction history
    clearOnLock: false
    // Don't clear on wallet lock
  };
}
async function getAllHistory() {
  const history = await load(TX_HISTORY_KEY);
  return history || {};
}
async function saveAllHistory(history) {
  await save(TX_HISTORY_KEY, history);
}
async function getTxHistory(address) {
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
async function addTxToHistory(address, txData) {
  const settings = await getTxHistorySettings();
  if (!settings.enabled) {
    return;
  }
  const history = await getAllHistory();
  const addressLower = address.toLowerCase();
  if (!history[addressLower]) {
    history[addressLower] = { transactions: [] };
  }
  history[addressLower].transactions.unshift({
    hash: txData.hash,
    timestamp: txData.timestamp || Date.now(),
    from: txData.from.toLowerCase(),
    to: txData.to ? txData.to.toLowerCase() : null,
    value: txData.value || "0",
    gasPrice: txData.gasPrice,
    nonce: txData.nonce,
    network: txData.network,
    status: txData.status || TX_STATUS.PENDING,
    blockNumber: txData.blockNumber || null,
    type: txData.type || TX_TYPES.CONTRACT
  });
  if (history[addressLower].transactions.length > MAX_TXS_PER_ADDRESS) {
    history[addressLower].transactions = history[addressLower].transactions.slice(0, MAX_TXS_PER_ADDRESS);
  }
  await saveAllHistory(history);
}
async function updateTxStatus(address, txHash, status, blockNumber = null) {
  const history = await getAllHistory();
  const addressLower = address.toLowerCase();
  if (!history[addressLower]) {
    return;
  }
  const txIndex = history[addressLower].transactions.findIndex(
    (tx) => tx.hash.toLowerCase() === txHash.toLowerCase()
  );
  if (txIndex === -1) {
    return;
  }
  history[addressLower].transactions[txIndex].status = status;
  if (blockNumber !== null) {
    history[addressLower].transactions[txIndex].blockNumber = blockNumber;
  }
  await saveAllHistory(history);
}
async function getPendingTxs(address) {
  const txs = await getTxHistory(address);
  return txs.filter((tx) => tx.status === TX_STATUS.PENDING);
}
async function getPendingTxCount(address) {
  const pendingTxs = await getPendingTxs(address);
  return pendingTxs.length;
}
async function getTxByHash(address, txHash) {
  const txs = await getTxHistory(address);
  return txs.find((tx) => tx.hash.toLowerCase() === txHash.toLowerCase());
}
async function clearTxHistory(address) {
  const history = await getAllHistory();
  const addressLower = address.toLowerCase();
  if (history[addressLower]) {
    delete history[addressLower];
    await saveAllHistory(history);
  }
}
function validateTransactionRequest(txRequest, maxGasPriceGwei = 1e3) {
  const errors = [];
  const sanitized = {};
  if (txRequest.to !== void 0 && txRequest.to !== null) {
    if (typeof txRequest.to !== "string") {
      errors.push('Invalid transaction: "to" field must be a string');
    } else if (!isValidHexAddress(txRequest.to)) {
      errors.push('Invalid transaction: "to" field must be a valid Ethereum address');
    } else {
      try {
        sanitized.to = getAddress(txRequest.to);
      } catch {
        errors.push('Invalid transaction: "to" field is not a valid address');
      }
    }
  }
  if (txRequest.from !== void 0 && txRequest.from !== null) {
    if (typeof txRequest.from !== "string") {
      errors.push('Invalid transaction: "from" field must be a string');
    } else if (!isValidHexAddress(txRequest.from)) {
      errors.push('Invalid transaction: "from" field must be a valid Ethereum address');
    } else {
      try {
        sanitized.from = getAddress(txRequest.from);
      } catch {
        errors.push('Invalid transaction: "from" field is not a valid address');
      }
    }
  }
  if (txRequest.value !== void 0 && txRequest.value !== null) {
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
    sanitized.value = "0x0";
  }
  if (txRequest.data !== void 0 && txRequest.data !== null) {
    if (typeof txRequest.data !== "string") {
      errors.push('Invalid transaction: "data" field must be a string');
    } else if (!isValidHexData(txRequest.data)) {
      errors.push('Invalid transaction: "data" field must be valid hex data');
    } else {
      sanitized.data = txRequest.data;
    }
  } else {
    sanitized.data = "0x";
  }
  if (txRequest.gas !== void 0 && txRequest.gas !== null) {
    if (!isValidHexValue(txRequest.gas)) {
      errors.push('Invalid transaction: "gas" field must be a valid hex string');
    } else {
      try {
        const gasLimit = BigInt(txRequest.gas);
        if (gasLimit < 21000n) {
          errors.push('Invalid transaction: "gas" limit too low (minimum 21000)');
        } else if (gasLimit > 30000000n) {
          errors.push('Invalid transaction: "gas" limit too high (maximum 30000000)');
        } else {
          sanitized.gas = txRequest.gas;
        }
      } catch {
        errors.push('Invalid transaction: "gas" is not a valid number');
      }
    }
  }
  if (txRequest.gasLimit !== void 0 && txRequest.gasLimit !== null) {
    if (!isValidHexValue(txRequest.gasLimit)) {
      errors.push('Invalid transaction: "gasLimit" field must be a valid hex string');
    } else {
      try {
        const gasLimit = BigInt(txRequest.gasLimit);
        if (gasLimit < 21000n) {
          errors.push('Invalid transaction: "gasLimit" too low (minimum 21000)');
        } else if (gasLimit > 30000000n) {
          errors.push('Invalid transaction: "gasLimit" too high (maximum 30000000)');
        } else {
          sanitized.gasLimit = txRequest.gasLimit;
        }
      } catch {
        errors.push('Invalid transaction: "gasLimit" is not a valid number');
      }
    }
  }
  if (txRequest.gasPrice !== void 0 && txRequest.gasPrice !== null) {
    if (!isValidHexValue(txRequest.gasPrice)) {
      errors.push('Invalid transaction: "gasPrice" field must be a valid hex string');
    } else {
      try {
        const gasPrice = BigInt(txRequest.gasPrice);
        const maxGasPriceWei = BigInt(maxGasPriceGwei) * BigInt("1000000000");
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
  if (txRequest.nonce !== void 0 && txRequest.nonce !== null) {
    if (!isValidHexValue(txRequest.nonce) && typeof txRequest.nonce !== "number") {
      errors.push('Invalid transaction: "nonce" field must be a valid number or hex string');
    } else {
      try {
        const nonce = typeof txRequest.nonce === "string" ? BigInt(txRequest.nonce) : BigInt(txRequest.nonce);
        if (nonce < 0n) {
          errors.push('Invalid transaction: "nonce" cannot be negative');
        } else if (nonce > BigInt("9007199254740991")) {
          errors.push('Invalid transaction: "nonce" is unreasonably high');
        } else {
          sanitized.nonce = txRequest.nonce;
        }
      } catch {
        errors.push('Invalid transaction: "nonce" is not a valid number');
      }
    }
  }
  if (!sanitized.to && (!sanitized.data || sanitized.data === "0x")) {
    errors.push('Invalid transaction: must have "to" address or "data" for contract creation');
  }
  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}
function isValidHexAddress(address) {
  if (typeof address !== "string") return false;
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}
function isValidHexValue(value) {
  if (typeof value !== "string") return false;
  return /^0x[0-9a-fA-F]+$/.test(value);
}
function isValidHexData(data) {
  if (typeof data !== "string") return false;
  if (data === "0x") return true;
  return /^0x[0-9a-fA-F]*$/.test(data) && data.length % 2 === 0;
}
function sanitizeErrorMessage(message) {
  if (typeof message !== "string") return "Unknown error";
  let sanitized = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 497) + "...";
  }
  return sanitized || "Unknown error";
}
const CHAIN_IDS = {
  "pulsechainTestnet": "0x3AF",
  // 943
  "pulsechain": "0x171",
  // 369
  "ethereum": "0x1",
  // 1
  "sepolia": "0xAA36A7"
  // 11155111
};
const CONNECTED_SITES_KEY = "connected_sites";
const pendingConnections = /* @__PURE__ */ new Map();
const activeSessions = /* @__PURE__ */ new Map();
let sessionEncryptionKey = null;
async function initSessionEncryption() {
  if (!sessionEncryptionKey) {
    sessionEncryptionKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      // Not extractable
      ["encrypt", "decrypt"]
    );
  }
}
async function encryptPasswordForSession(password) {
  await initSessionEncryption();
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sessionEncryptionKey,
    passwordData
  );
  return { encrypted, iv };
}
async function decryptPasswordFromSession(encrypted, iv) {
  await initSessionEncryption();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    sessionEncryptionKey,
    encrypted
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function createSession(password, walletId, durationMs = 36e5) {
  const sessionToken = generateSessionToken();
  const expiresAt = Date.now() + durationMs;
  const { encrypted, iv } = await encryptPasswordForSession(password);
  activeSessions.set(sessionToken, {
    encryptedPassword: encrypted,
    iv,
    walletId,
    expiresAt
  });
  setTimeout(() => {
    if (activeSessions.has(sessionToken)) {
      const session = activeSessions.get(sessionToken);
      if (Date.now() >= session.expiresAt) {
        activeSessions.delete(sessionToken);
        console.log("🫀 Session expired and removed");
      }
    }
  }, durationMs);
  return sessionToken;
}
async function validateSession(sessionToken) {
  if (!sessionToken) {
    throw new Error("No session token provided");
  }
  const session = activeSessions.get(sessionToken);
  if (!session) {
    throw new Error("Invalid or expired session");
  }
  if (Date.now() >= session.expiresAt) {
    activeSessions.delete(sessionToken);
    throw new Error("Session expired");
  }
  return await decryptPasswordFromSession(session.encryptedPassword, session.iv);
}
function invalidateSession(sessionToken) {
  if (activeSessions.has(sessionToken)) {
    activeSessions.delete(sessionToken);
    return true;
  }
  return false;
}
function invalidateAllSessions() {
  const count = activeSessions.size;
  activeSessions.clear();
  return count;
}
chrome.runtime.onInstalled.addListener(() => {
  console.log("🫀 HeartWallet installed");
});
async function getConnectedSites() {
  const sites = await load(CONNECTED_SITES_KEY);
  return sites || {};
}
async function isSiteConnected(origin) {
  const sites = await getConnectedSites();
  return !!sites[origin];
}
async function addConnectedSite(origin, accounts) {
  const sites = await getConnectedSites();
  sites[origin] = {
    accounts,
    connectedAt: Date.now()
  };
  await save(CONNECTED_SITES_KEY, sites);
}
async function removeConnectedSite(origin) {
  const sites = await getConnectedSites();
  delete sites[origin];
  await save(CONNECTED_SITES_KEY, sites);
}
async function getCurrentChainId() {
  const network = await load("currentNetwork");
  return CHAIN_IDS[network || "pulsechainTestnet"];
}
async function handleWalletRequest(message, sender) {
  const { method, params } = message;
  const url = new URL(sender.url);
  const origin = url.origin;
  try {
    switch (method) {
      case "eth_requestAccounts":
        return await handleRequestAccounts(origin, sender.tab);
      case "eth_accounts":
        return await handleAccounts(origin);
      case "eth_chainId":
        return await handleChainId();
      case "net_version":
        const chainId = await handleChainId();
        return { result: parseInt(chainId.result, 16).toString() };
      case "wallet_switchEthereumChain":
        return await handleSwitchChain(params);
      case "wallet_addEthereumChain":
        return await handleAddChain(params);
      case "wallet_watchAsset":
        return await handleWatchAsset(params, origin, sender.tab);
      case "eth_blockNumber":
        return await handleBlockNumber();
      case "eth_getBlockByNumber":
        return await handleGetBlockByNumber(params);
      case "eth_getBalance":
        return await handleGetBalance(params);
      case "eth_getTransactionCount":
        return await handleGetTransactionCount(params);
      case "eth_call":
        return await handleCall(params);
      case "eth_estimateGas":
        return await handleEstimateGas(params);
      case "eth_gasPrice":
        return await handleGasPrice();
      case "eth_sendTransaction":
        return await handleSendTransaction(params, origin);
      case "eth_sendRawTransaction":
        return await handleSendRawTransaction(params);
      case "eth_getTransactionReceipt":
        return await handleGetTransactionReceipt(params);
      case "eth_getTransactionByHash":
        return await handleGetTransactionByHash(params);
      case "eth_getLogs":
        return await handleGetLogs(params);
      case "eth_getCode":
        return await handleGetCode(params);
      case "eth_getBlockByHash":
        return await handleGetBlockByHash(params);
      default:
        return { error: { code: -32601, message: `Method ${method} not supported` } };
    }
  } catch (error) {
    console.error("🫀 Error handling request:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleRequestAccounts(origin, tab) {
  if (await isSiteConnected(origin)) {
    const wallet = await getActiveWallet();
    if (wallet && wallet.address) {
      return { result: [wallet.address] };
    }
  }
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString();
    pendingConnections.set(requestId, { resolve, reject, origin, tabId: tab == null ? void 0 : tab.id });
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=connect&origin=${encodeURIComponent(origin)}&requestId=${requestId}`),
      type: "popup",
      width: 400,
      height: 600
    });
    setTimeout(() => {
      if (pendingConnections.has(requestId)) {
        pendingConnections.delete(requestId);
        reject(new Error("Connection request timeout"));
      }
    }, 3e5);
  });
}
async function handleAccounts(origin) {
  if (await isSiteConnected(origin)) {
    const wallet = await getActiveWallet();
    if (wallet && wallet.address) {
      return { result: [wallet.address] };
    }
  }
  return { result: [] };
}
async function handleChainId() {
  const chainId = await getCurrentChainId();
  return { result: chainId };
}
async function handleSwitchChain(params) {
  if (!params || !params[0] || !params[0].chainId) {
    return { error: { code: -32602, message: "Invalid params" } };
  }
  const requestedChainId = params[0].chainId;
  const networkMap = {
    "0x3af": "pulsechainTestnet",
    "0x3AF": "pulsechainTestnet",
    "0x171": "pulsechain",
    "0x1": "ethereum",
    "0xaa36a7": "sepolia",
    "0xAA36A7": "sepolia"
  };
  const networkKey = networkMap[requestedChainId];
  if (!networkKey) {
    return {
      error: {
        code: 4902,
        message: "Unrecognized chain ID. Try adding the chain using wallet_addEthereumChain."
      }
    };
  }
  await save("currentNetwork", networkKey);
  const newChainId = CHAIN_IDS[networkKey];
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {
        type: "CHAIN_CHANGED",
        chainId: newChainId
      }).catch(() => {
      });
    });
  });
  return { result: null };
}
async function handleAddChain(params) {
  if (!params || !params[0] || !params[0].chainId) {
    return { error: { code: -32602, message: "Invalid params" } };
  }
  const chainInfo = params[0];
  console.log("🫀 Request to add chain:", chainInfo);
  const supportedChains = {
    "0x3af": true,
    "0x3AF": true,
    "0x171": true,
    "0x1": true,
    "0xaa36a7": true,
    "0xAA36A7": true
  };
  if (supportedChains[chainInfo.chainId]) {
    return await handleSwitchChain([{ chainId: chainInfo.chainId }]);
  }
  return {
    error: {
      code: -32603,
      message: "Adding custom chains not supported yet. Only PulseChain and Ethereum networks are supported."
    }
  };
}
async function handleConnectionApproval(requestId, approved) {
  if (!pendingConnections.has(requestId)) {
    return { success: false, error: "Request not found or expired" };
  }
  const { resolve, reject, origin } = pendingConnections.get(requestId);
  pendingConnections.delete(requestId);
  if (approved) {
    const wallet = await getActiveWallet();
    if (wallet && wallet.address) {
      await addConnectedSite(origin, [wallet.address]);
      resolve({ result: [wallet.address] });
      return { success: true };
    } else {
      reject(new Error("No active wallet"));
      return { success: false, error: "No active wallet" };
    }
  } else {
    reject(new Error("User rejected connection"));
    return { success: false, error: "User rejected" };
  }
}
function getConnectionRequest(requestId) {
  if (pendingConnections.has(requestId)) {
    const { origin } = pendingConnections.get(requestId);
    return { success: true, origin };
  }
  return { success: false, error: "Request not found" };
}
async function getCurrentNetwork() {
  const network = await load("currentNetwork");
  return network || "pulsechainTestnet";
}
async function handleBlockNumber() {
  try {
    const network = await getCurrentNetwork();
    const blockNumber = await getBlockNumber(network);
    return { result: blockNumber };
  } catch (error) {
    console.error("Error getting block number:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleGetBlockByNumber(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing block number parameter" } };
  }
  try {
    const blockNumber = params[0];
    const includeTransactions = params[1] || false;
    const network = await getCurrentNetwork();
    const block = await getBlockByNumber(network, blockNumber, includeTransactions);
    return { result: block };
  } catch (error) {
    console.error("Error getting block by number:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleGetBalance(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing address parameter" } };
  }
  try {
    const address = params[0];
    const network = await getCurrentNetwork();
    const balance = await getBalance(network, address);
    return { result: balance };
  } catch (error) {
    console.error("Error getting balance:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleGetTransactionCount(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing address parameter" } };
  }
  try {
    const address = params[0];
    const network = await getCurrentNetwork();
    const count = await getTransactionCount(network, address);
    return { result: count };
  } catch (error) {
    console.error("Error getting transaction count:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleGasPrice() {
  try {
    const network = await getCurrentNetwork();
    const gasPrice = await getGasPrice(network);
    return { result: gasPrice };
  } catch (error) {
    console.error("Error getting gas price:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleEstimateGas(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing transaction parameter" } };
  }
  try {
    const network = await getCurrentNetwork();
    const gas = await estimateGas(network, params[0]);
    return { result: gas };
  } catch (error) {
    console.error("Error estimating gas:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleCall(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing transaction parameter" } };
  }
  try {
    const network = await getCurrentNetwork();
    const result = await call(network, params[0]);
    return { result };
  } catch (error) {
    console.error("Error executing call:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleSendRawTransaction(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing signed transaction parameter" } };
  }
  try {
    const signedTx = params[0];
    const network = await getCurrentNetwork();
    const txHash = await sendRawTransaction(network, signedTx);
    return { result: txHash };
  } catch (error) {
    console.error("Error sending raw transaction:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleGetTransactionReceipt(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing transaction hash parameter" } };
  }
  try {
    const txHash = params[0];
    const network = await getCurrentNetwork();
    const receipt = await getTransactionReceipt(network, txHash);
    return { result: receipt };
  } catch (error) {
    console.error("Error getting transaction receipt:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleGetTransactionByHash(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing transaction hash parameter" } };
  }
  try {
    const txHash = params[0];
    const network = await getCurrentNetwork();
    const tx = await getTransactionByHash(network, txHash);
    return { result: tx };
  } catch (error) {
    console.error("Error getting transaction by hash:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleGetLogs(params) {
  try {
    const network = await getCurrentNetwork();
    const provider = await getProvider(network);
    const logs = await provider.send("eth_getLogs", params);
    return { result: logs };
  } catch (error) {
    console.error("Error getting logs:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleGetCode(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing address parameter" } };
  }
  try {
    const network = await getCurrentNetwork();
    const provider = await getProvider(network);
    const code = await provider.send("eth_getCode", params);
    return { result: code };
  } catch (error) {
    console.error("Error getting code:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
async function handleGetBlockByHash(params) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing block hash parameter" } };
  }
  try {
    const network = await getCurrentNetwork();
    const provider = await getProvider(network);
    const block = await provider.send("eth_getBlockByHash", params);
    return { result: block };
  } catch (error) {
    console.error("Error getting block by hash:", error);
    return { error: { code: -32603, message: error.message } };
  }
}
const pendingTransactions = /* @__PURE__ */ new Map();
const pendingTokenRequests = /* @__PURE__ */ new Map();
const rateLimitMap = /* @__PURE__ */ new Map();
const RATE_LIMIT_CONFIG = {
  MAX_PENDING_REQUESTS: 5,
  // Max pending requests per origin
  MAX_REQUESTS_PER_WINDOW: 20,
  // Max total requests per time window
  TIME_WINDOW_MS: 6e4
  // 1 minute window
};
function checkRateLimit(origin) {
  const now = Date.now();
  if (!rateLimitMap.has(origin)) {
    rateLimitMap.set(origin, {
      count: 0,
      windowStart: now,
      pendingCount: 0
    });
  }
  const limitData = rateLimitMap.get(origin);
  if (now - limitData.windowStart > RATE_LIMIT_CONFIG.TIME_WINDOW_MS) {
    limitData.count = 0;
    limitData.windowStart = now;
  }
  if (limitData.pendingCount >= RATE_LIMIT_CONFIG.MAX_PENDING_REQUESTS) {
    return {
      allowed: false,
      reason: `Too many pending requests. Maximum ${RATE_LIMIT_CONFIG.MAX_PENDING_REQUESTS} pending requests allowed.`
    };
  }
  if (limitData.count >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      reason: `Rate limit exceeded. Maximum ${RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_WINDOW} requests per minute.`
    };
  }
  return { allowed: true };
}
function incrementRateLimit(origin) {
  const limitData = rateLimitMap.get(origin);
  if (limitData) {
    limitData.count++;
    limitData.pendingCount++;
  }
}
function decrementPendingCount(origin) {
  const limitData = rateLimitMap.get(origin);
  if (limitData && limitData.pendingCount > 0) {
    limitData.pendingCount--;
  }
}
setInterval(() => {
  const now = Date.now();
  for (const [origin, data] of rateLimitMap.entries()) {
    if (now - data.windowStart > RATE_LIMIT_CONFIG.TIME_WINDOW_MS * 5 && data.pendingCount === 0) {
      rateLimitMap.delete(origin);
    }
  }
}, 3e5);
const processedApprovals = /* @__PURE__ */ new Map();
const REPLAY_PROTECTION_CONFIG = {
  APPROVAL_TIMEOUT: 3e5,
  // 5 minutes - approval expires after this
  CLEANUP_INTERVAL: 6e4
  // 1 minute - clean up old approvals
};
function generateApprovalToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function validateAndUseApprovalToken(approvalToken) {
  if (!approvalToken) {
    console.warn("🫀 No approval token provided");
    return false;
  }
  const approval = processedApprovals.get(approvalToken);
  if (!approval) {
    console.warn("🫀 Unknown approval token");
    return false;
  }
  if (approval.used) {
    console.warn("🫀 Approval token already used - preventing replay attack");
    return false;
  }
  const age = Date.now() - approval.timestamp;
  if (age > REPLAY_PROTECTION_CONFIG.APPROVAL_TIMEOUT) {
    console.warn("🫀 Approval token expired");
    processedApprovals.delete(approvalToken);
    return false;
  }
  approval.used = true;
  approval.usedAt = Date.now();
  console.log("🫀 Approval token validated and marked as used");
  return true;
}
setInterval(() => {
  const now = Date.now();
  for (const [token, approval] of processedApprovals.entries()) {
    const age = now - approval.timestamp;
    if (age > REPLAY_PROTECTION_CONFIG.APPROVAL_TIMEOUT * 2) {
      processedApprovals.delete(token);
    }
  }
}, REPLAY_PROTECTION_CONFIG.CLEANUP_INTERVAL);
async function handleSendTransaction(params, origin) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing transaction parameter" } };
  }
  if (!await isSiteConnected(origin)) {
    return { error: { code: 4100, message: "Not authorized. Please connect your wallet first." } };
  }
  const rateLimitCheck = checkRateLimit(origin);
  if (!rateLimitCheck.allowed) {
    console.warn("🫀 Rate limit exceeded for origin:", origin);
    return { error: { code: 4200, message: sanitizeErrorMessage(rateLimitCheck.reason) } };
  }
  const txRequest = params[0];
  const settings = await load("settings");
  const maxGasPriceGwei = (settings == null ? void 0 : settings.maxGasPriceGwei) || 1e3;
  const validation = validateTransactionRequest(txRequest, maxGasPriceGwei);
  if (!validation.valid) {
    console.warn("🫀 Invalid transaction from origin:", origin, validation.errors);
    return {
      error: {
        code: -32602,
        message: "Invalid transaction: " + sanitizeErrorMessage(validation.errors.join("; "))
      }
    };
  }
  const sanitizedTx = validation.sanitized;
  incrementRateLimit(origin);
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString();
    const approvalToken = generateApprovalToken();
    processedApprovals.set(approvalToken, {
      timestamp: Date.now(),
      requestId,
      used: false
    });
    pendingTransactions.set(requestId, {
      resolve,
      reject,
      origin,
      txRequest: sanitizedTx,
      approvalToken
      // Include token for validation
    });
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=transaction&requestId=${requestId}`),
      type: "popup",
      width: 400,
      height: 600
    });
    setTimeout(() => {
      if (pendingTransactions.has(requestId)) {
        pendingTransactions.delete(requestId);
        reject(new Error("Transaction request timeout"));
      }
    }, 3e5);
  });
}
async function handleTransactionApproval(requestId, approved, sessionToken, gasPrice, customNonce) {
  if (!pendingTransactions.has(requestId)) {
    return { success: false, error: "Request not found or expired" };
  }
  const { resolve, reject, origin, txRequest, approvalToken } = pendingTransactions.get(requestId);
  if (!validateAndUseApprovalToken(approvalToken)) {
    pendingTransactions.delete(requestId);
    decrementPendingCount(origin);
    reject(new Error("Invalid or already used approval token - possible replay attack"));
    return { success: false, error: "Invalid approval token" };
  }
  pendingTransactions.delete(requestId);
  decrementPendingCount(origin);
  if (!approved) {
    reject(new Error("User rejected transaction"));
    return { success: false, error: "User rejected" };
  }
  try {
    const password = await validateSession(sessionToken);
    const { signer } = await unlockWallet(password);
    const network = await getCurrentNetwork();
    const provider = await getProvider(network);
    const connectedSigner = signer.connect(provider);
    const txToSend = {
      to: txRequest.to,
      value: txRequest.value || "0x0",
      data: txRequest.data || "0x"
    };
    if (customNonce !== void 0 && customNonce !== null) {
      const currentNonce = await provider.getTransactionCount(signer.address, "pending");
      if (customNonce < currentNonce) {
        throw new Error(`Custom nonce ${customNonce} is less than current nonce ${currentNonce}. This may fail unless you're replacing a pending transaction.`);
      }
      txToSend.nonce = customNonce;
    } else if (txRequest.nonce !== void 0 && txRequest.nonce !== null) {
      const currentNonce = await provider.getTransactionCount(signer.address, "pending");
      const providedNonce = typeof txRequest.nonce === "string" ? parseInt(txRequest.nonce, 16) : txRequest.nonce;
      if (providedNonce < currentNonce) {
        throw new Error(`Invalid nonce: ${providedNonce} is less than current nonce ${currentNonce}`);
      }
      txToSend.nonce = providedNonce;
    } else {
    }
    if (txRequest.gas || txRequest.gasLimit) {
      txToSend.gasLimit = txRequest.gas || txRequest.gasLimit;
    }
    if (gasPrice) {
      txToSend.gasPrice = gasPrice;
    } else {
      try {
        const networkGasPrice = await provider.getFeeData();
        if (networkGasPrice.gasPrice) {
          const multipliedGasPrice = networkGasPrice.gasPrice * BigInt(120) / BigInt(100);
          txToSend.gasPrice = multipliedGasPrice;
        }
      } catch (error) {
      }
    }
    const tx = await connectedSigner.sendTransaction(txToSend);
    await addTxToHistory(signer.address, {
      hash: tx.hash,
      timestamp: Date.now(),
      from: signer.address,
      to: txRequest.to || null,
      value: txRequest.value || "0",
      gasPrice: tx.gasPrice ? tx.gasPrice.toString() : "0",
      nonce: tx.nonce,
      network,
      status: TX_STATUS.PENDING,
      blockNumber: null,
      type: TX_TYPES.CONTRACT
    });
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
      title: "Transaction Sent",
      message: `Transaction sent: ${tx.hash.slice(0, 20)}...`,
      priority: 2
    });
    waitForConfirmation(tx, provider, signer.address);
    resolve({ result: tx.hash });
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("🫀 Transaction error:", error);
    const sanitizedError = sanitizeErrorMessage(error.message);
    reject(new Error(sanitizedError));
    return { success: false, error: sanitizedError };
  }
}
function getTransactionRequest(requestId) {
  if (pendingTransactions.has(requestId)) {
    const { origin, txRequest } = pendingTransactions.get(requestId);
    return { success: true, origin, txRequest };
  }
  return { success: false, error: "Request not found" };
}
async function handleWatchAsset(params, origin, tab) {
  if (!params || !params.type || !params.options) {
    return { error: { code: -32602, message: "Invalid params: must include type and options" } };
  }
  const { type, options } = params;
  if (type.toUpperCase() !== "ERC20") {
    return { error: { code: -32602, message: "Only ERC20/PRC20 tokens are supported" } };
  }
  if (!options.address || !options.symbol) {
    return { error: { code: -32602, message: "Token must have address and symbol" } };
  }
  const tokenInfo = {
    address: options.address.toLowerCase(),
    symbol: options.symbol,
    decimals: options.decimals || 18,
    image: options.image || null
  };
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString() + "_token";
    pendingTokenRequests.set(requestId, { resolve, reject, origin, tokenInfo });
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=addToken&requestId=${requestId}`),
      type: "popup",
      width: 400,
      height: 500
    });
    setTimeout(() => {
      if (pendingTokenRequests.has(requestId)) {
        pendingTokenRequests.delete(requestId);
        reject(new Error("Token add request timeout"));
      }
    }, 3e5);
  });
}
async function handleTokenAddApproval(requestId, approved) {
  if (!pendingTokenRequests.has(requestId)) {
    return { success: false, error: "Request not found or expired" };
  }
  const { resolve, reject, tokenInfo } = pendingTokenRequests.get(requestId);
  pendingTokenRequests.delete(requestId);
  if (!approved) {
    reject(new Error("User rejected token"));
    return { success: false, error: "User rejected" };
  }
  try {
    resolve({ result: true });
    return { success: true, tokenInfo };
  } catch (error) {
    console.error("🫀 Token add error:", error);
    reject(new Error(error.message));
    return { success: false, error: error.message };
  }
}
function getTokenAddRequest(requestId) {
  if (pendingTokenRequests.has(requestId)) {
    const { origin, tokenInfo } = pendingTokenRequests.get(requestId);
    return { success: true, origin, tokenInfo };
  }
  return { success: false, error: "Request not found" };
}
async function handleSpeedUpTransaction(address, originalTxHash, sessionToken, gasPriceMultiplier = 1.2) {
  try {
    const password = await validateSession(sessionToken);
    const originalTx = await getTxByHash(address, originalTxHash);
    if (!originalTx) {
      return { success: false, error: "Transaction not found" };
    }
    if (originalTx.status !== TX_STATUS.PENDING) {
      return { success: false, error: "Transaction is not pending" };
    }
    const { signer } = await unlockWallet(password);
    const network = originalTx.network;
    const provider = await getProvider(network);
    const wallet = signer.connect(provider);
    const originalGasPrice = BigInt(originalTx.gasPrice);
    const newGasPrice = originalGasPrice * BigInt(Math.floor(gasPriceMultiplier * 100)) / BigInt(100);
    const replacementTx = {
      to: originalTx.to,
      value: originalTx.value,
      nonce: originalTx.nonce,
      gasPrice: newGasPrice
    };
    const tx = await wallet.sendTransaction(replacementTx);
    await addTxToHistory(address, {
      hash: tx.hash,
      timestamp: Date.now(),
      from: address,
      to: originalTx.to,
      value: originalTx.value,
      gasPrice: newGasPrice.toString(),
      nonce: originalTx.nonce,
      network,
      status: TX_STATUS.PENDING,
      blockNumber: null,
      type: originalTx.type
    });
    await updateTxStatus(address, originalTxHash, TX_STATUS.FAILED, null);
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
      title: "Transaction Sped Up",
      message: `Replacement transaction sent with ${Math.floor(gasPriceMultiplier * 100)}% gas price`,
      priority: 2
    });
    waitForConfirmation(tx, provider, address);
    return { success: true, txHash: tx.hash, newGasPrice: newGasPrice.toString() };
  } catch (error) {
    console.error("🫀 Error speeding up transaction:", error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  }
}
async function handleCancelTransaction(address, originalTxHash, sessionToken) {
  try {
    const password = await validateSession(sessionToken);
    const originalTx = await getTxByHash(address, originalTxHash);
    if (!originalTx) {
      return { success: false, error: "Transaction not found" };
    }
    if (originalTx.status !== TX_STATUS.PENDING) {
      return { success: false, error: "Transaction is not pending" };
    }
    const { signer } = await unlockWallet(password);
    const network = originalTx.network;
    const provider = await getProvider(network);
    const wallet = signer.connect(provider);
    const originalGasPrice = BigInt(originalTx.gasPrice);
    const newGasPrice = originalGasPrice * BigInt(120) / BigInt(100);
    const cancelTx = {
      to: address,
      // Send to self
      value: "0",
      // Zero value
      nonce: originalTx.nonce,
      gasPrice: newGasPrice
    };
    const tx = await wallet.sendTransaction(cancelTx);
    await addTxToHistory(address, {
      hash: tx.hash,
      timestamp: Date.now(),
      from: address,
      to: address,
      value: "0",
      gasPrice: newGasPrice.toString(),
      nonce: originalTx.nonce,
      network,
      status: TX_STATUS.PENDING,
      blockNumber: null,
      type: "send"
    });
    await updateTxStatus(address, originalTxHash, TX_STATUS.FAILED, null);
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
      title: "Transaction Cancelled",
      message: "Cancellation transaction sent",
      priority: 2
    });
    waitForConfirmation(tx, provider, address);
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("🫀 Error cancelling transaction:", error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  }
}
async function waitForConfirmation(tx, provider, address) {
  try {
    const receipt = await provider.waitForTransaction(tx.hash, 1);
    if (receipt && receipt.status === 1) {
      await updateTxStatus(
        address,
        tx.hash,
        TX_STATUS.CONFIRMED,
        receipt.blockNumber
      );
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
        title: "Transaction Confirmed",
        message: `Transaction confirmed on-chain!`,
        priority: 2
      });
    } else {
      await updateTxStatus(
        address,
        tx.hash,
        TX_STATUS.FAILED,
        receipt ? receipt.blockNumber : null
      );
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
        title: "Transaction Failed",
        message: "Transaction was reverted or failed",
        priority: 2
      });
    }
  } catch (error) {
    console.error("🫀 Error waiting for confirmation:", error);
  }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case "WALLET_REQUEST":
          const result = await handleWalletRequest(message, sender);
          sendResponse(result);
          break;
        case "CONNECTION_APPROVAL":
          const approvalResult = await handleConnectionApproval(message.requestId, message.approved);
          sendResponse(approvalResult);
          break;
        case "GET_CONNECTION_REQUEST":
          const requestInfo = getConnectionRequest(message.requestId);
          sendResponse(requestInfo);
          break;
        case "GET_CONNECTED_SITES":
          const sites = await getConnectedSites();
          console.log("🫀 Sending connected sites");
          sendResponse({ success: true, sites });
          break;
        case "DISCONNECT_SITE":
          await removeConnectedSite(message.origin);
          sendResponse({ success: true });
          break;
        case "TRANSACTION_APPROVAL":
          const txApprovalResult = await handleTransactionApproval(message.requestId, message.approved, message.sessionToken, message.gasPrice, message.customNonce);
          sendResponse(txApprovalResult);
          break;
        case "CREATE_SESSION":
          try {
            const sessionToken = await createSession(message.password, message.walletId, message.durationMs);
            sendResponse({ success: true, sessionToken });
          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
          break;
        case "INVALIDATE_SESSION":
          const invalidated = invalidateSession(message.sessionToken);
          sendResponse({ success: invalidated });
          break;
        case "INVALIDATE_ALL_SESSIONS":
          const count = invalidateAllSessions();
          sendResponse({ success: true, count });
          break;
        case "GET_TRANSACTION_REQUEST":
          const txRequestInfo = getTransactionRequest(message.requestId);
          console.log("🫀 Sending transaction request info:", txRequestInfo);
          sendResponse(txRequestInfo);
          break;
        case "TOKEN_ADD_APPROVAL":
          const tokenApprovalResult = await handleTokenAddApproval(message.requestId, message.approved);
          console.log("🫀 Sending token add approval response:", tokenApprovalResult);
          sendResponse(tokenApprovalResult);
          break;
        case "GET_TOKEN_ADD_REQUEST":
          const tokenRequestInfo = getTokenAddRequest(message.requestId);
          console.log("🫀 Sending token add request info:", tokenRequestInfo);
          sendResponse(tokenRequestInfo);
          break;
        case "GET_TX_HISTORY":
          const txHistoryList = await getTxHistory(message.address);
          sendResponse({ success: true, transactions: txHistoryList });
          break;
        case "GET_PENDING_TX_COUNT":
          const pendingCount = await getPendingTxCount(message.address);
          sendResponse({ success: true, count: pendingCount });
          break;
        case "GET_PENDING_TXS":
          const pendingTxs = await getPendingTxs(message.address);
          sendResponse({ success: true, transactions: pendingTxs });
          break;
        case "GET_TX_BY_HASH":
          const txDetail = await getTxByHash(message.address, message.txHash);
          sendResponse({ success: true, transaction: txDetail });
          break;
        case "CLEAR_TX_HISTORY":
          await clearTxHistory(message.address);
          sendResponse({ success: true });
          break;
        case "SPEED_UP_TX":
          const speedUpResult = await handleSpeedUpTransaction(
            message.address,
            message.txHash,
            message.sessionToken,
            message.gasPriceMultiplier || 1.2
          );
          sendResponse(speedUpResult);
          break;
        case "CANCEL_TX":
          const cancelResult = await handleCancelTransaction(
            message.address,
            message.txHash,
            message.sessionToken
          );
          sendResponse(cancelResult);
          break;
        default:
          console.log("🫀 Unknown message type:", message.type);
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (error) {
      console.error("🫀 Error handling message:", error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  return true;
});
console.log("🫀 HeartWallet service worker ready");
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2JhY2tncm91bmQvc2VydmljZS13b3JrZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFRyYW5zYWN0aW9uIEhpc3RvcnkgTWFuYWdlbWVudFxyXG4gKiBTdG9yZXMgdHJhbnNhY3Rpb24gaGlzdG9yeSBsb2NhbGx5IGluIGNocm9tZS5zdG9yYWdlLmxvY2FsXHJcbiAqIE1heCAyMCB0cmFuc2FjdGlvbnMgcGVyIGFkZHJlc3MgKEZJRk8pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4vc3RvcmFnZS5qcyc7XHJcblxyXG5jb25zdCBUWF9ISVNUT1JZX0tFWSA9ICd0eEhpc3RvcnlfdjEnO1xyXG5jb25zdCBUWF9ISVNUT1JZX1NFVFRJTkdTX0tFWSA9ICd0eEhpc3RvcnlTZXR0aW5ncyc7XHJcbmNvbnN0IE1BWF9UWFNfUEVSX0FERFJFU1MgPSAyMDtcclxuXHJcbi8vIFRyYW5zYWN0aW9uIHR5cGVzXHJcbmV4cG9ydCBjb25zdCBUWF9UWVBFUyA9IHtcclxuICBTRU5EOiAnc2VuZCcsICAgICAgICAgICAvLyBOYXRpdmUgdG9rZW4gdHJhbnNmZXJcclxuICBDT05UUkFDVDogJ2NvbnRyYWN0JywgICAvLyBDb250cmFjdCBpbnRlcmFjdGlvblxyXG4gIFRPS0VOOiAndG9rZW4nICAgICAgICAgIC8vIEVSQzIwIHRva2VuIHRyYW5zZmVyXHJcbn07XHJcblxyXG4vLyBUcmFuc2FjdGlvbiBzdGF0dXNlc1xyXG5leHBvcnQgY29uc3QgVFhfU1RBVFVTID0ge1xyXG4gIFBFTkRJTkc6ICdwZW5kaW5nJyxcclxuICBDT05GSVJNRUQ6ICdjb25maXJtZWQnLFxyXG4gIEZBSUxFRDogJ2ZhaWxlZCdcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gaGlzdG9yeSBzZXR0aW5nc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFR4SGlzdG9yeVNldHRpbmdzKCkge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgbG9hZChUWF9ISVNUT1JZX1NFVFRJTkdTX0tFWSk7XHJcbiAgcmV0dXJuIHNldHRpbmdzIHx8IHtcclxuICAgIGVuYWJsZWQ6IHRydWUsICAgICAgLy8gVHJhY2sgdHJhbnNhY3Rpb24gaGlzdG9yeVxyXG4gICAgY2xlYXJPbkxvY2s6IGZhbHNlICAvLyBEb24ndCBjbGVhciBvbiB3YWxsZXQgbG9ja1xyXG4gIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdHJhbnNhY3Rpb24gaGlzdG9yeSBzZXR0aW5nc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVR4SGlzdG9yeVNldHRpbmdzKHNldHRpbmdzKSB7XHJcbiAgYXdhaXQgc2F2ZShUWF9ISVNUT1JZX1NFVFRJTkdTX0tFWSwgc2V0dGluZ3MpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRBbGxIaXN0b3J5KCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBsb2FkKFRYX0hJU1RPUllfS0VZKTtcclxuICByZXR1cm4gaGlzdG9yeSB8fCB7fTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpIHtcclxuICBhd2FpdCBzYXZlKFRYX0hJU1RPUllfS0VZLCBoaXN0b3J5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgYSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgdHhEYXRhKSB7XHJcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRUeEhpc3RvcnlTZXR0aW5ncygpO1xyXG4gIGlmICghc2V0dGluZ3MuZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuOyAvLyBIaXN0b3J5IGRpc2FibGVkXHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBhZGRyZXNzIGhpc3RvcnkgaWYgZG9lc24ndCBleGlzdFxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0gPSB7IHRyYW5zYWN0aW9uczogW10gfTtcclxuICB9XHJcblxyXG4gIC8vIEFkZCBuZXcgdHJhbnNhY3Rpb24gYXQgYmVnaW5uaW5nIChuZXdlc3QgZmlyc3QpXHJcbiAgaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy51bnNoaWZ0KHtcclxuICAgIGhhc2g6IHR4RGF0YS5oYXNoLFxyXG4gICAgdGltZXN0YW1wOiB0eERhdGEudGltZXN0YW1wIHx8IERhdGUubm93KCksXHJcbiAgICBmcm9tOiB0eERhdGEuZnJvbS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgdG86IHR4RGF0YS50byA/IHR4RGF0YS50by50b0xvd2VyQ2FzZSgpIDogbnVsbCxcclxuICAgIHZhbHVlOiB0eERhdGEudmFsdWUgfHwgJzAnLFxyXG4gICAgZ2FzUHJpY2U6IHR4RGF0YS5nYXNQcmljZSxcclxuICAgIG5vbmNlOiB0eERhdGEubm9uY2UsXHJcbiAgICBuZXR3b3JrOiB0eERhdGEubmV0d29yayxcclxuICAgIHN0YXR1czogdHhEYXRhLnN0YXR1cyB8fCBUWF9TVEFUVVMuUEVORElORyxcclxuICAgIGJsb2NrTnVtYmVyOiB0eERhdGEuYmxvY2tOdW1iZXIgfHwgbnVsbCxcclxuICAgIHR5cGU6IHR4RGF0YS50eXBlIHx8IFRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgfSk7XHJcblxyXG4gIC8vIEVuZm9yY2UgbWF4IGxpbWl0IChGSUZPIC0gcmVtb3ZlIG9sZGVzdClcclxuICBpZiAoaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5sZW5ndGggPiBNQVhfVFhTX1BFUl9BRERSRVNTKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5zbGljZSgwLCBNQVhfVFhTX1BFUl9BRERSRVNTKTtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIGFkZGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdHJhbnNhY3Rpb24gc3RhdHVzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgdHhIYXNoLCBzdGF0dXMsIGJsb2NrTnVtYmVyID0gbnVsbCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdHhJbmRleCA9IGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMuZmluZEluZGV4KFxyXG4gICAgdHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKVxyXG4gICk7XHJcblxyXG4gIGlmICh0eEluZGV4ID09PSAtMSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9uc1t0eEluZGV4XS5zdGF0dXMgPSBzdGF0dXM7XHJcbiAgaWYgKGJsb2NrTnVtYmVyICE9PSBudWxsKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLmJsb2NrTnVtYmVyID0gYmxvY2tOdW1iZXI7XHJcbiAgfVxyXG5cclxuICBhd2FpdCBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KTtcclxuICAvLyBUcmFuc2FjdGlvbiBzdGF0dXMgdXBkYXRlZFxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHBlbmRpbmcgdHJhbnNhY3Rpb25zIGZvciBhbiBhZGRyZXNzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKSB7XHJcbiAgY29uc3QgdHhzID0gYXdhaXQgZ2V0VHhIaXN0b3J5KGFkZHJlc3MpO1xyXG4gIHJldHVybiB0eHMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gVFhfU1RBVFVTLlBFTkRJTkcpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHBlbmRpbmcgdHJhbnNhY3Rpb24gY291bnQgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhDb3VudChhZGRyZXNzKSB7XHJcbiAgY29uc3QgcGVuZGluZ1R4cyA9IGF3YWl0IGdldFBlbmRpbmdUeHMoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHBlbmRpbmdUeHMubGVuZ3RoO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGJ5IGhhc2hcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEJ5SGFzaChhZGRyZXNzLCB0eEhhc2gpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maW5kKHR4ID0+IHR4Lmhhc2gudG9Mb3dlckNhc2UoKSA9PT0gdHhIYXNoLnRvTG93ZXJDYXNlKCkpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2xlYXIgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnkgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclR4SGlzdG9yeShhZGRyZXNzKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0pIHtcclxuICAgIGRlbGV0ZSBoaXN0b3J5W2FkZHJlc3NMb3dlcl07XHJcbiAgICBhd2FpdCBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KTtcclxuICAgIC8vIFRyYW5zYWN0aW9uIGhpc3RvcnkgY2xlYXJlZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENsZWFyIGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5IChhbGwgYWRkcmVzc2VzKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQWxsVHhIaXN0b3J5KCkge1xyXG4gIGF3YWl0IHNhdmUoVFhfSElTVE9SWV9LRVksIHt9KTtcclxuICAvLyBBbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeHBvcnQgdHJhbnNhY3Rpb24gaGlzdG9yeSBhcyBKU09OIChmb3IgZGVidWdnaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFR4SGlzdG9yeShhZGRyZXNzKSB7XHJcbiAgY29uc3QgdHhzID0gYXdhaXQgZ2V0VHhIaXN0b3J5KGFkZHJlc3MpO1xyXG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh0eHMsIG51bGwsIDIpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBjb3JlL3R4VmFsaWRhdGlvbi5qc1xyXG4gKlxyXG4gKiBUcmFuc2FjdGlvbiB2YWxpZGF0aW9uIHV0aWxpdGllcyBmb3Igc2VjdXJpdHlcclxuICogVmFsaWRhdGVzIGFsbCB0cmFuc2FjdGlvbiBwYXJhbWV0ZXJzIGJlZm9yZSBwcm9jZXNzaW5nXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSB0cmFuc2FjdGlvbiByZXF1ZXN0IGZyb20gYSBkQXBwXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eFJlcXVlc3QgLSBUcmFuc2FjdGlvbiByZXF1ZXN0IG9iamVjdFxyXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4R2FzUHJpY2VHd2VpIC0gTWF4aW11bSBhbGxvd2VkIGdhcyBwcmljZSBpbiBHd2VpIChkZWZhdWx0IDEwMDApXHJcbiAqIEByZXR1cm5zIHt7IHZhbGlkOiBib29sZWFuLCBlcnJvcnM6IHN0cmluZ1tdLCBzYW5pdGl6ZWQ6IE9iamVjdCB9fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0KHR4UmVxdWVzdCwgbWF4R2FzUHJpY2VHd2VpID0gMTAwMCkge1xyXG4gIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gIGNvbnN0IHNhbml0aXplZCA9IHt9O1xyXG5cclxuICAvLyBWYWxpZGF0ZSAndG8nIGFkZHJlc3MgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QudG8gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudG8gIT09IG51bGwpIHtcclxuICAgIGlmICh0eXBlb2YgdHhSZXF1ZXN0LnRvICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC50bykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTm9ybWFsaXplIHRvIGNoZWNrc3VtIGFkZHJlc3NcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQudG8gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QudG8pO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2Zyb20nIGFkZHJlc3MgaWYgcHJlc2VudCAoc2hvdWxkIG1hdGNoIHdhbGxldCBhZGRyZXNzKVxyXG4gIGlmICh0eFJlcXVlc3QuZnJvbSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5mcm9tICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5mcm9tICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleEFkZHJlc3ModHhSZXF1ZXN0LmZyb20pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQuZnJvbSA9IGV0aGVycy5nZXRBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3ZhbHVlJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QudmFsdWUgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudmFsdWUgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC52YWx1ZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB2YWx1ZUJpZ0ludCA9IEJpZ0ludCh0eFJlcXVlc3QudmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZUJpZ0ludCA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQudmFsdWUgPSB0eFJlcXVlc3QudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHNhbml0aXplZC52YWx1ZSA9ICcweDAnOyAvLyBEZWZhdWx0IHRvIDBcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdkYXRhJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5kYXRhICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5kYXRhICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleERhdGEodHhSZXF1ZXN0LmRhdGEpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImRhdGFcIiBmaWVsZCBtdXN0IGJlIHZhbGlkIGhleCBkYXRhJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzYW5pdGl6ZWQuZGF0YSA9IHR4UmVxdWVzdC5kYXRhO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQuZGF0YSA9ICcweCc7IC8vIERlZmF1bHQgdG8gZW1wdHkgZGF0YVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2dhcycgb3IgJ2dhc0xpbWl0JyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LmdhcyAhPT0gbnVsbCkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGV4VmFsdWUodHhSZXF1ZXN0LmdhcykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhcyk7XHJcbiAgICAgICAgaWYgKGdhc0xpbWl0IDwgMjEwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBsaW1pdCB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAzMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBoaWdoIChtYXhpbXVtIDMwMDAwMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzID0gdHhSZXF1ZXN0LmdhcztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzTGltaXQpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc0xpbWl0KTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGxvdyAobWluaW11bSAyMTAwMCknKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc0xpbWl0ID4gMzAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIHRvbyBoaWdoIChtYXhpbXVtIDMwMDAwMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzTGltaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZ2FzUHJpY2UnIGZpZWxkIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzUHJpY2UpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzUHJpY2UgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc1ByaWNlKTtcclxuICAgICAgICBjb25zdCBtYXhHYXNQcmljZVdlaSA9IEJpZ0ludChtYXhHYXNQcmljZUd3ZWkpICogQmlnSW50KCcxMDAwMDAwMDAwJyk7IC8vIENvbnZlcnQgR3dlaSB0byBXZWlcclxuICAgICAgICBpZiAoZ2FzUHJpY2UgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc1ByaWNlID4gbWF4R2FzUHJpY2VXZWkpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKGBJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZXhjZWVkcyBtYXhpbXVtIG9mICR7bWF4R2FzUHJpY2VHd2VpfSBHd2VpYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNQcmljZSA9IHR4UmVxdWVzdC5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdub25jZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5ub25jZSkgJiYgdHlwZW9mIHR4UmVxdWVzdC5ub25jZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIG9yIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJyBcclxuICAgICAgICAgID8gQmlnSW50KHR4UmVxdWVzdC5ub25jZSkgXHJcbiAgICAgICAgICA6IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpO1xyXG4gICAgICAgIGlmIChub25jZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9uY2UgPiBCaWdJbnQoJzkwMDcxOTkyNTQ3NDA5OTEnKSkgeyAvLyBKYXZhU2NyaXB0IHNhZmUgaW50ZWdlciBtYXhcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgdW5yZWFzb25hYmx5IGhpZ2gnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLm5vbmNlID0gdHhSZXF1ZXN0Lm5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gbXVzdCBoYXZlIGVpdGhlciAndG8nIG9yICdkYXRhJyAoY29udHJhY3QgY3JlYXRpb24pXHJcbiAgaWYgKCFzYW5pdGl6ZWQudG8gJiYgKCFzYW5pdGl6ZWQuZGF0YSB8fCBzYW5pdGl6ZWQuZGF0YSA9PT0gJzB4JykpIHtcclxuICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBtdXN0IGhhdmUgXCJ0b1wiIGFkZHJlc3Mgb3IgXCJkYXRhXCIgZm9yIGNvbnRyYWN0IGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnMsXHJcbiAgICBzYW5pdGl6ZWRcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIEV0aGVyZXVtIGFkZHJlc3MgKGhleCBmb3JtYXQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhZGRyZXNzIC0gQWRkcmVzcyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhBZGRyZXNzKGFkZHJlc3MpIHtcclxuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSA0MiBjaGFyYWN0ZXJzOiAweCArIDQwIGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdezQwfSQvLnRlc3QoYWRkcmVzcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBoZXggdmFsdWUgKGZvciBhbW91bnRzLCBnYXMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEhleCB2YWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBzdGFydCB3aXRoIDB4IGFuZCBjb250YWluIG9ubHkgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0rJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaGV4IGRhdGEgKGZvciB0cmFuc2FjdGlvbiBkYXRhIGZpZWxkKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIEhleCBkYXRhIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleERhdGEoZGF0YSkge1xyXG4gIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDB4IG9yIDB4IGZvbGxvd2VkIGJ5IGV2ZW4gbnVtYmVyIG9mIGhleCBkaWdpdHNcclxuICBpZiAoZGF0YSA9PT0gJzB4JykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSokLy50ZXN0KGRhdGEpICYmIGRhdGEubGVuZ3RoICUgMiA9PT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBhbiBlcnJvciBtZXNzYWdlIGZvciBzYWZlIGRpc3BsYXlcclxuICogUmVtb3ZlcyBhbnkgSFRNTCwgc2NyaXB0cywgYW5kIGNvbnRyb2wgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUVycm9yTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiA1MDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgNDk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyB1c2VyIGlucHV0IGZvciBzYWZlIGRpc3BsYXkgKHByZXZlbnRzIFhTUylcclxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0IC0gVXNlciBpbnB1dCB0byBzYW5pdGl6ZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBTYW5pdGl6ZWQgaW5wdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVVzZXJJbnB1dChpbnB1dCkge1xyXG4gIGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSByZXR1cm4gJyc7XHJcbiAgXHJcbiAgLy8gQ3JlYXRlIGEgdGV4dCBub2RlIGFuZCBleHRyYWN0IHRoZSBlc2NhcGVkIHRleHRcclxuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBkaXYudGV4dENvbnRlbnQgPSBpbnB1dDtcclxuICByZXR1cm4gZGl2LmlubmVySFRNTDtcclxufVxyXG4iLCIvKipcclxuICogYmFja2dyb3VuZC9zZXJ2aWNlLXdvcmtlci5qc1xyXG4gKlxyXG4gKiBCYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyIGZvciBIZWFydFdhbGxldFxyXG4gKiBIYW5kbGVzIFJQQyByZXF1ZXN0cyBmcm9tIGRBcHBzIGFuZCBtYW5hZ2VzIHdhbGxldCBzdGF0ZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGdldEFjdGl2ZVdhbGxldCwgdW5sb2NrV2FsbGV0IH0gZnJvbSAnLi4vY29yZS93YWxsZXQuanMnO1xyXG5pbXBvcnQgeyBsb2FkLCBzYXZlIH0gZnJvbSAnLi4vY29yZS9zdG9yYWdlLmpzJztcclxuaW1wb3J0ICogYXMgcnBjIGZyb20gJy4uL2NvcmUvcnBjLmpzJztcclxuaW1wb3J0ICogYXMgdHhIaXN0b3J5IGZyb20gJy4uL2NvcmUvdHhIaXN0b3J5LmpzJztcclxuaW1wb3J0IHsgdmFsaWRhdGVUcmFuc2FjdGlvblJlcXVlc3QsIHNhbml0aXplRXJyb3JNZXNzYWdlIH0gZnJvbSAnLi4vY29yZS90eFZhbGlkYXRpb24uanMnO1xyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5cclxuLy8gU2VydmljZSB3b3JrZXIgbG9hZGVkXHJcblxyXG4vLyBOZXR3b3JrIGNoYWluIElEc1xyXG5jb25zdCBDSEFJTl9JRFMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJzB4M0FGJywgLy8gOTQzXHJcbiAgJ3B1bHNlY2hhaW4nOiAnMHgxNzEnLCAvLyAzNjlcclxuICAnZXRoZXJldW0nOiAnMHgxJywgLy8gMVxyXG4gICdzZXBvbGlhJzogJzB4QUEzNkE3JyAvLyAxMTE1NTExMVxyXG59O1xyXG5cclxuLy8gU3RvcmFnZSBrZXlzXHJcbmNvbnN0IENPTk5FQ1RFRF9TSVRFU19LRVkgPSAnY29ubmVjdGVkX3NpdGVzJztcclxuXHJcbi8vIFBlbmRpbmcgY29ubmVjdGlvbiByZXF1ZXN0cyAob3JpZ2luIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCB0YWJJZCB9KVxyXG5jb25zdCBwZW5kaW5nQ29ubmVjdGlvbnMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyA9PT09PSBTRVNTSU9OIE1BTkFHRU1FTlQgPT09PT1cclxuLy8gU2Vzc2lvbiB0b2tlbnMgc3RvcmVkIGluIG1lbW9yeSAoY2xlYXJlZCB3aGVuIHNlcnZpY2Ugd29ya2VyIHRlcm1pbmF0ZXMpXHJcbi8vIFNFQ1VSSVRZIE5PVEU6IFNlcnZpY2Ugd29ya2VycyBjYW4gYmUgdGVybWluYXRlZCBieSBDaHJvbWUgYXQgYW55IHRpbWUsIHdoaWNoIGNsZWFycyBhbGxcclxuLy8gc2Vzc2lvbiBkYXRhLiBUaGlzIGlzIGludGVudGlvbmFsIC0gd2UgZG9uJ3Qgd2FudCBwYXNzd29yZHMgcGVyc2lzdGluZyBsb25nZXIgdGhhbiBuZWVkZWQuXHJcbi8vIFNlc3Npb25zIGFyZSBlbmNyeXB0ZWQgaW4gbWVtb3J5IGFzIGFuIGFkZGl0aW9uYWwgc2VjdXJpdHkgbGF5ZXIuXHJcbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpOyAvLyBzZXNzaW9uVG9rZW4gLT4geyBlbmNyeXB0ZWRQYXNzd29yZCwgd2FsbGV0SWQsIGV4cGlyZXNBdCwgc2FsdCB9XHJcblxyXG4vLyBTZXNzaW9uIGVuY3J5cHRpb24ga2V5IChyZWdlbmVyYXRlZCBvbiBzZXJ2aWNlIHdvcmtlciBzdGFydClcclxubGV0IHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHNlc3Npb24gZW5jcnlwdGlvbiBrZXkgdXNpbmcgV2ViIENyeXB0byBBUElcclxuICogS2V5IGlzIHJlZ2VuZXJhdGVkIGVhY2ggdGltZSBzZXJ2aWNlIHdvcmtlciBzdGFydHMgKG1lbW9yeSBvbmx5LCBuZXZlciBwZXJzaXN0ZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKSB7XHJcbiAgaWYgKCFzZXNzaW9uRW5jcnlwdGlvbktleSkge1xyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gMjU2LWJpdCBrZXkgZm9yIEFFUy1HQ00gZW5jcnlwdGlvblxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcclxuICAgICAgZmFsc2UsIC8vIE5vdCBleHRyYWN0YWJsZVxyXG4gICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY3J5cHRzIHBhc3N3b3JkIGZvciBzZXNzaW9uIHN0b3JhZ2UgdXNpbmcgQUVTLUdDTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBQYXNzd29yZCB0byBlbmNyeXB0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtlbmNyeXB0ZWQ6IEFycmF5QnVmZmVyLCBpdjogVWludDhBcnJheX0+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCkge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICBjb25zdCBwYXNzd29yZERhdGEgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcbiAgXHJcbiAgLy8gR2VuZXJhdGUgcmFuZG9tIElWIGZvciB0aGlzIGVuY3J5cHRpb25cclxuICAvLyBTRUNVUklUWTogSVYgdW5pcXVlbmVzcyBpcyBjcnlwdG9ncmFwaGljYWxseSBndWFyYW50ZWVkIGJ5IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKVxyXG4gIC8vIHdoaWNoIHVzZXMgdGhlIGJyb3dzZXIncyBDU1BSTkcgKENyeXB0b2dyYXBoaWNhbGx5IFNlY3VyZSBQc2V1ZG8tUmFuZG9tIE51bWJlciBHZW5lcmF0b3IpXHJcbiAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7XHJcbiAgXHJcbiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIHBhc3N3b3JkRGF0YVxyXG4gICk7XHJcbiAgXHJcbiAgcmV0dXJuIHsgZW5jcnlwdGVkLCBpdiB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVjcnlwdHMgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkIC0gRW5jcnlwdGVkIHBhc3N3b3JkIGRhdGFcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBpdiAtIEluaXRpYWxpemF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oZW5jcnlwdGVkLCBpdikge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIFxyXG4gIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBlbmNyeXB0ZWRcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuICByZXR1cm4gZGVjb2Rlci5kZWNvZGUoZGVjcnlwdGVkKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlc3Npb24gdG9rZW5cclxuZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBuZXcgc2Vzc2lvblxyXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVTZXNzaW9uKHBhc3N3b3JkLCB3YWxsZXRJZCwgZHVyYXRpb25NcyA9IDM2MDAwMDApIHsgLy8gRGVmYXVsdCAxIGhvdXJcclxuICBjb25zdCBzZXNzaW9uVG9rZW4gPSBnZW5lcmF0ZVNlc3Npb25Ub2tlbigpO1xyXG4gIGNvbnN0IGV4cGlyZXNBdCA9IERhdGUubm93KCkgKyBkdXJhdGlvbk1zO1xyXG4gIFxyXG4gIC8vIEVuY3J5cHQgcGFzc3dvcmQgYmVmb3JlIHN0b3JpbmcgaW4gbWVtb3J5XHJcbiAgY29uc3QgeyBlbmNyeXB0ZWQsIGl2IH0gPSBhd2FpdCBlbmNyeXB0UGFzc3dvcmRGb3JTZXNzaW9uKHBhc3N3b3JkKTtcclxuXHJcbiAgYWN0aXZlU2Vzc2lvbnMuc2V0KHNlc3Npb25Ub2tlbiwge1xyXG4gICAgZW5jcnlwdGVkUGFzc3dvcmQ6IGVuY3J5cHRlZCxcclxuICAgIGl2OiBpdixcclxuICAgIHdhbGxldElkLFxyXG4gICAgZXhwaXJlc0F0XHJcbiAgfSk7XHJcblxyXG4gIC8vIEF1dG8tY2xlYW51cCBleHBpcmVkIHNlc3Npb25cclxuICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIGlmIChhY3RpdmVTZXNzaW9ucy5oYXMoc2Vzc2lvblRva2VuKSkge1xyXG4gICAgICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcbiAgICAgIGlmIChEYXRlLm5vdygpID49IHNlc3Npb24uZXhwaXJlc0F0KSB7XHJcbiAgICAgICAgYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25Ub2tlbik7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2Vzc2lvbiBleHBpcmVkIGFuZCByZW1vdmVkJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LCBkdXJhdGlvbk1zKTtcclxuXHJcbiAgLy8gU2Vzc2lvbiBjcmVhdGVkXHJcbiAgcmV0dXJuIHNlc3Npb25Ub2tlbjtcclxufVxyXG5cclxuLy8gVmFsaWRhdGUgc2Vzc2lvbiBhbmQgcmV0dXJuIGRlY3J5cHRlZCBwYXNzd29yZFxyXG5hc3luYyBmdW5jdGlvbiB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKSB7XHJcbiAgaWYgKCFzZXNzaW9uVG9rZW4pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTm8gc2Vzc2lvbiB0b2tlbiBwcm92aWRlZCcpO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uVG9rZW4pO1xyXG5cclxuICBpZiAoIXNlc3Npb24pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBvciBleHBpcmVkIHNlc3Npb24nKTtcclxuICB9XHJcblxyXG4gIGlmIChEYXRlLm5vdygpID49IHNlc3Npb24uZXhwaXJlc0F0KSB7XHJcbiAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgIHRocm93IG5ldyBFcnJvcignU2Vzc2lvbiBleHBpcmVkJyk7XHJcbiAgfVxyXG5cclxuICAvLyBEZWNyeXB0IHBhc3N3b3JkIGZyb20gc2Vzc2lvbiBzdG9yYWdlXHJcbiAgcmV0dXJuIGF3YWl0IGRlY3J5cHRQYXNzd29yZEZyb21TZXNzaW9uKHNlc3Npb24uZW5jcnlwdGVkUGFzc3dvcmQsIHNlc3Npb24uaXYpO1xyXG59XHJcblxyXG4vLyBJbnZhbGlkYXRlIHNlc3Npb25cclxuZnVuY3Rpb24gaW52YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKSB7XHJcbiAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgIC8vIFNlc3Npb24gaW52YWxpZGF0ZWRcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgYWxsIHNlc3Npb25zXHJcbmZ1bmN0aW9uIGludmFsaWRhdGVBbGxTZXNzaW9ucygpIHtcclxuICBjb25zdCBjb3VudCA9IGFjdGl2ZVNlc3Npb25zLnNpemU7XHJcbiAgYWN0aXZlU2Vzc2lvbnMuY2xlYXIoKTtcclxuICAvLyBBbGwgc2Vzc2lvbnMgaW52YWxpZGF0ZWRcclxuICByZXR1cm4gY291bnQ7XHJcbn1cclxuXHJcbi8vIExpc3RlbiBmb3IgZXh0ZW5zaW9uIGluc3RhbGxhdGlvblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgSGVhcnRXYWxsZXQgaW5zdGFsbGVkJyk7XHJcbn0pO1xyXG5cclxuLy8gR2V0IGNvbm5lY3RlZCBzaXRlcyBmcm9tIHN0b3JhZ2VcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q29ubmVjdGVkU2l0ZXMoKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBsb2FkKENPTk5FQ1RFRF9TSVRFU19LRVkpO1xyXG4gIHJldHVybiBzaXRlcyB8fCB7fTtcclxufVxyXG5cclxuLy8gQ2hlY2sgaWYgYSBzaXRlIGlzIGNvbm5lY3RlZFxyXG5hc3luYyBmdW5jdGlvbiBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIHJldHVybiAhIXNpdGVzW29yaWdpbl07XHJcbn1cclxuXHJcbi8vIEFkZCBhIGNvbm5lY3RlZCBzaXRlXHJcbmFzeW5jIGZ1bmN0aW9uIGFkZENvbm5lY3RlZFNpdGUob3JpZ2luLCBhY2NvdW50cykge1xyXG4gIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICBzaXRlc1tvcmlnaW5dID0ge1xyXG4gICAgYWNjb3VudHMsXHJcbiAgICBjb25uZWN0ZWRBdDogRGF0ZS5ub3coKVxyXG4gIH07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIFJlbW92ZSBhIGNvbm5lY3RlZCBzaXRlXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbW92ZUNvbm5lY3RlZFNpdGUob3JpZ2luKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIGRlbGV0ZSBzaXRlc1tvcmlnaW5dO1xyXG4gIGF3YWl0IHNhdmUoQ09OTkVDVEVEX1NJVEVTX0tFWSwgc2l0ZXMpO1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGNoYWluIElEXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFpbklkKCkge1xyXG4gIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpO1xyXG4gIHJldHVybiBDSEFJTl9JRFNbbmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnXTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldCByZXF1ZXN0cyBmcm9tIGNvbnRlbnQgc2NyaXB0c1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVXYWxsZXRSZXF1ZXN0KG1lc3NhZ2UsIHNlbmRlcikge1xyXG4gIGNvbnN0IHsgbWV0aG9kLCBwYXJhbXMgfSA9IG1lc3NhZ2U7XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBHZXQgb3JpZ2luIGZyb20gQ2hyb21lIEFQSSwgbm90IG1lc3NhZ2UgcGF5bG9hZCAocHJldmVudHMgc3Bvb2ZpbmcpXHJcbiAgY29uc3QgdXJsID0gbmV3IFVSTChzZW5kZXIudXJsKTtcclxuICBjb25zdCBvcmlnaW4gPSB1cmwub3JpZ2luO1xyXG5cclxuICAvLyBIYW5kbGluZyB3YWxsZXQgcmVxdWVzdFxyXG5cclxuICB0cnkge1xyXG4gICAgc3dpdGNoIChtZXRob2QpIHtcclxuICAgICAgY2FzZSAnZXRoX3JlcXVlc3RBY2NvdW50cyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHNlbmRlci50YWIpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2FjY291bnRzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQWNjb3VudHMob3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9jaGFpbklkJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQ2hhaW5JZCgpO1xyXG5cclxuICAgICAgY2FzZSAnbmV0X3ZlcnNpb24nOlxyXG4gICAgICAgIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBoYW5kbGVDaGFpbklkKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgcmVzdWx0OiBwYXJzZUludChjaGFpbklkLnJlc3VsdCwgMTYpLnRvU3RyaW5nKCkgfTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF9zd2l0Y2hFdGhlcmV1bUNoYWluJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU3dpdGNoQ2hhaW4ocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF9hZGRFdGhlcmV1bUNoYWluJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQWRkQ2hhaW4ocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF93YXRjaEFzc2V0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlV2F0Y2hBc3NldChwYXJhbXMsIG9yaWdpbiwgc2VuZGVyLnRhYik7XHJcblxyXG4gICAgICBjYXNlICdldGhfYmxvY2tOdW1iZXInOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVCbG9ja051bWJlcigpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldEJsb2NrQnlOdW1iZXInOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmFsYW5jZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJhbGFuY2UocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRUcmFuc2FjdGlvbkNvdW50JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25Db3VudChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2NhbGwnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVDYWxsKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZXN0aW1hdGVHYXMnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dhc1ByaWNlJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2FzUHJpY2UoKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9zZW5kVHJhbnNhY3Rpb24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTZW5kVHJhbnNhY3Rpb24ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NlbmRSYXdUcmFuc2FjdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNlbmRSYXdUcmFuc2FjdGlvbihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uQnlIYXNoJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25CeUhhc2gocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRMb2dzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0TG9ncyhwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldENvZGUnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRDb2RlKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmxvY2tCeUhhc2gnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCbG9ja0J5SGFzaChwYXJhbXMpO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDEsIG1lc3NhZ2U6IGBNZXRob2QgJHttZXRob2R9IG5vdCBzdXBwb3J0ZWRgIH0gfTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBoYW5kbGluZyByZXF1ZXN0OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3JlcXVlc3RBY2NvdW50cyAtIFJlcXVlc3QgcGVybWlzc2lvbiB0byBjb25uZWN0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHRhYikge1xyXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgY29ubmVjdGVkXHJcbiAgaWYgKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBbd2FsbGV0LmFkZHJlc3NdIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpO1xyXG4gICAgcGVuZGluZ0Nvbm5lY3Rpb25zLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRhYklkOiB0YWI/LmlkIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249Y29ubmVjdCZvcmlnaW49JHtlbmNvZGVVUklDb21wb25lbnQob3JpZ2luKX0mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ0Nvbm5lY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2FjY291bnRzIC0gR2V0IGNvbm5lY3RlZCBhY2NvdW50c1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBY2NvdW50cyhvcmlnaW4pIHtcclxuICAvLyBPbmx5IHJldHVybiBhY2NvdW50cyBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmIChhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIHJldHVybiB7IHJlc3VsdDogW3dhbGxldC5hZGRyZXNzXSB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBbXSB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2NoYWluSWQgLSBHZXQgY3VycmVudCBjaGFpbiBJRFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDaGFpbklkKCkge1xyXG4gIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBnZXRDdXJyZW50Q2hhaW5JZCgpO1xyXG4gIHJldHVybiB7IHJlc3VsdDogY2hhaW5JZCB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4gLSBTd2l0Y2ggdG8gYSBkaWZmZXJlbnQgbmV0d29ya1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdIHx8ICFwYXJhbXNbMF0uY2hhaW5JZCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXMnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHJlcXVlc3RlZENoYWluSWQgPSBwYXJhbXNbMF0uY2hhaW5JZDtcclxuICAvLyBTd2l0Y2hpbmcgY2hhaW5cclxuXHJcbiAgLy8gRmluZCBtYXRjaGluZyBuZXR3b3JrXHJcbiAgY29uc3QgbmV0d29ya01hcCA9IHtcclxuICAgICcweDNhZic6ICdwdWxzZWNoYWluVGVzdG5ldCcsXHJcbiAgICAnMHgzQUYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICAgJzB4MTcxJzogJ3B1bHNlY2hhaW4nLFxyXG4gICAgJzB4MSc6ICdldGhlcmV1bScsXHJcbiAgICAnMHhhYTM2YTcnOiAnc2Vwb2xpYScsXHJcbiAgICAnMHhBQTM2QTcnOiAnc2Vwb2xpYSdcclxuICB9O1xyXG5cclxuICBjb25zdCBuZXR3b3JrS2V5ID0gbmV0d29ya01hcFtyZXF1ZXN0ZWRDaGFpbklkXTtcclxuXHJcbiAgaWYgKCFuZXR3b3JrS2V5KSB7XHJcbiAgICAvLyBDaGFpbiBub3Qgc3VwcG9ydGVkIC0gcmV0dXJuIGVycm9yIGNvZGUgNDkwMiBzbyBkQXBwIGNhbiBjYWxsIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IDQ5MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ1VucmVjb2duaXplZCBjaGFpbiBJRC4gVHJ5IGFkZGluZyB0aGUgY2hhaW4gdXNpbmcgd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4uJ1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIGN1cnJlbnQgbmV0d29ya1xyXG4gIGF3YWl0IHNhdmUoJ2N1cnJlbnROZXR3b3JrJywgbmV0d29ya0tleSk7XHJcblxyXG4gIC8vIE5vdGlmeSBhbGwgdGFicyBhYm91dCBjaGFpbiBjaGFuZ2VcclxuICBjb25zdCBuZXdDaGFpbklkID0gQ0hBSU5fSURTW25ldHdvcmtLZXldO1xyXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCAodGFicykgPT4ge1xyXG4gICAgdGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xyXG4gICAgICAgIHR5cGU6ICdDSEFJTl9DSEFOR0VEJyxcclxuICAgICAgICBjaGFpbklkOiBuZXdDaGFpbklkXHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQsIGlnbm9yZSBlcnJvclxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4geyByZXN1bHQ6IG51bGwgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluIC0gQWRkIGEgbmV3IG5ldHdvcmsgKHNpbXBsaWZpZWQgdmVyc2lvbilcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWRkQ2hhaW4ocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSB8fCAhcGFyYW1zWzBdLmNoYWluSWQpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBjaGFpbkluZm8gPSBwYXJhbXNbMF07XHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgUmVxdWVzdCB0byBhZGQgY2hhaW46JywgY2hhaW5JbmZvKTtcclxuXHJcbiAgLy8gRm9yIG5vdywgb25seSBzdXBwb3J0IG91ciBwcmVkZWZpbmVkIGNoYWluc1xyXG4gIC8vIENoZWNrIGlmIGl0J3Mgb25lIG9mIG91ciBzdXBwb3J0ZWQgY2hhaW5zXHJcbiAgY29uc3Qgc3VwcG9ydGVkQ2hhaW5zID0ge1xyXG4gICAgJzB4M2FmJzogdHJ1ZSxcclxuICAgICcweDNBRic6IHRydWUsXHJcbiAgICAnMHgxNzEnOiB0cnVlLFxyXG4gICAgJzB4MSc6IHRydWUsXHJcbiAgICAnMHhhYTM2YTcnOiB0cnVlLFxyXG4gICAgJzB4QUEzNkE3JzogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIGlmIChzdXBwb3J0ZWRDaGFpbnNbY2hhaW5JbmZvLmNoYWluSWRdKSB7XHJcbiAgICAvLyBDaGFpbiBpcyBhbHJlYWR5IHN1cHBvcnRlZCwganVzdCBzd2l0Y2ggdG8gaXRcclxuICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihbeyBjaGFpbklkOiBjaGFpbkluZm8uY2hhaW5JZCB9XSk7XHJcbiAgfVxyXG5cclxuICAvLyBDdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0XHJcbiAgcmV0dXJuIHtcclxuICAgIGVycm9yOiB7XHJcbiAgICAgIGNvZGU6IC0zMjYwMyxcclxuICAgICAgbWVzc2FnZTogJ0FkZGluZyBjdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0LiBPbmx5IFB1bHNlQ2hhaW4gYW5kIEV0aGVyZXVtIG5ldHdvcmtzIGFyZSBzdXBwb3J0ZWQuJ1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBjb25uZWN0aW9uIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQpIHtcclxuICBpZiAoIXBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4gfSA9IHBlbmRpbmdDb25uZWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICBwZW5kaW5nQ29ubmVjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmIChhcHByb3ZlZCkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIC8vIFNhdmUgY29ubmVjdGVkIHNpdGVcclxuICAgICAgYXdhaXQgYWRkQ29ubmVjdGVkU2l0ZShvcmlnaW4sIFt3YWxsZXQuYWRkcmVzc10pO1xyXG5cclxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcGVuZGluZyBwcm9taXNlXHJcbiAgICAgIHJlc29sdmUoeyByZXN1bHQ6IFt3YWxsZXQuYWRkcmVzc10gfSk7XHJcblxyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZWplY3QobmV3IEVycm9yKCdObyBhY3RpdmUgd2FsbGV0JykpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBhY3RpdmUgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIGNvbm5lY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGNvbm5lY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRDb25uZWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiB9ID0gcGVuZGluZ0Nvbm5lY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGtleVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50TmV0d29yaygpIHtcclxuICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKTtcclxuICByZXR1cm4gbmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2Jsb2NrTnVtYmVyIC0gR2V0IGN1cnJlbnQgYmxvY2sgbnVtYmVyXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJsb2NrTnVtYmVyKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gYXdhaXQgcnBjLmdldEJsb2NrTnVtYmVyKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9ja051bWJlciB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCbG9ja0J5TnVtYmVyIC0gR2V0IGJsb2NrIGJ5IG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgbnVtYmVyIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgaW5jbHVkZVRyYW5zYWN0aW9ucyA9IHBhcmFtc1sxXSB8fCBmYWxzZTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBycGMuZ2V0QmxvY2tCeU51bWJlcihuZXR3b3JrLCBibG9ja051bWJlciwgaW5jbHVkZVRyYW5zYWN0aW9ucyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgbnVtYmVyOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldEJhbGFuY2UgLSBHZXQgYmFsYW5jZSBmb3IgYW4gYWRkcmVzc1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBiYWxhbmNlID0gYXdhaXQgcnBjLmdldEJhbGFuY2UobmV0d29yaywgYWRkcmVzcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJhbGFuY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQ291bnQgLSBHZXQgdHJhbnNhY3Rpb24gY291bnQgKG5vbmNlKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBjb3VudCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb3VudCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGNvdW50OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dhc1ByaWNlIC0gR2V0IGN1cnJlbnQgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdhc1ByaWNlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXNQcmljZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9lc3RpbWF0ZUdhcyAtIEVzdGltYXRlIGdhcyBmb3IgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgZ2FzID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGdhcyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jYWxsIC0gRXhlY3V0ZSBhIHJlYWQtb25seSBjYWxsXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbGwocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJwYy5jYWxsKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXhlY3V0aW5nIGNhbGw6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFJhd1RyYW5zYWN0aW9uIC0gU2VuZCBhIHByZS1zaWduZWQgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3Npbmcgc2lnbmVkIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNpZ25lZFR4ID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBhd2FpdCBycGMuc2VuZFJhd1RyYW5zYWN0aW9uKG5ldHdvcmssIHNpZ25lZFR4KTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogdHhIYXNoIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgcmF3IHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCAtIEdldCB0cmFuc2FjdGlvbiByZWNlaXB0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgdHhIYXNoID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uUmVjZWlwdChuZXR3b3JrLCB0eEhhc2gpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiByZWNlaXB0IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gcmVjZWlwdDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvbkJ5SGFzaCAtIEdldCB0cmFuc2FjdGlvbiBieSBoYXNoXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoKG5ldHdvcmssIHR4SGFzaCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHR4IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gYnkgaGFzaDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0TG9ncyhwYXJhbXMpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGxvZ3MgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0TG9ncycsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGxvZ3MgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBsb2dzOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRDb2RlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgY29kZSA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRDb2RlJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogY29kZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGNvZGU6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEJsb2NrQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0QmxvY2tCeUhhc2gnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9jayB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIGJ5IGhhc2g6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFBlbmRpbmcgdHJhbnNhY3Rpb24gcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luIH0pXHJcbmNvbnN0IHBlbmRpbmdUcmFuc2FjdGlvbnMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyBQZW5kaW5nIHRva2VuIGFkZCByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRva2VuSW5mbyB9KVxyXG5jb25zdCBwZW5kaW5nVG9rZW5SZXF1ZXN0cyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vID09PT09IFJBVEUgTElNSVRJTkcgPT09PT1cclxuLy8gUHJldmVudHMgbWFsaWNpb3VzIGRBcHBzIGZyb20gc3BhbW1pbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVxdWVzdHNcclxuY29uc3QgcmF0ZUxpbWl0TWFwID0gbmV3IE1hcCgpOyAvLyBvcmlnaW4gLT4geyBjb3VudCwgd2luZG93U3RhcnQsIHBlbmRpbmdDb3VudCB9XHJcblxyXG5jb25zdCBSQVRFX0xJTUlUX0NPTkZJRyA9IHtcclxuICBNQVhfUEVORElOR19SRVFVRVNUUzogNSwgLy8gTWF4IHBlbmRpbmcgcmVxdWVzdHMgcGVyIG9yaWdpblxyXG4gIE1BWF9SRVFVRVNUU19QRVJfV0lORE9XOiAyMCwgLy8gTWF4IHRvdGFsIHJlcXVlc3RzIHBlciB0aW1lIHdpbmRvd1xyXG4gIFRJTUVfV0lORE9XX01TOiA2MDAwMCAvLyAxIG1pbnV0ZSB3aW5kb3dcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYW4gb3JpZ2luIGhhcyBleGNlZWRlZCByYXRlIGxpbWl0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBjaGVja1xyXG4gKiBAcmV0dXJucyB7eyBhbGxvd2VkOiBib29sZWFuLCByZWFzb24/OiBzdHJpbmcgfX1cclxuICovXHJcbmZ1bmN0aW9uIGNoZWNrUmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgXHJcbiAgLy8gR2V0IG9yIGNyZWF0ZSByYXRlIGxpbWl0IGVudHJ5IGZvciB0aGlzIG9yaWdpblxyXG4gIGlmICghcmF0ZUxpbWl0TWFwLmhhcyhvcmlnaW4pKSB7XHJcbiAgICByYXRlTGltaXRNYXAuc2V0KG9yaWdpbiwge1xyXG4gICAgICBjb3VudDogMCxcclxuICAgICAgd2luZG93U3RhcnQ6IG5vdyxcclxuICAgICAgcGVuZGluZ0NvdW50OiAwXHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIFxyXG4gIC8vIFJlc2V0IHdpbmRvdyBpZiBleHBpcmVkXHJcbiAgaWYgKG5vdyAtIGxpbWl0RGF0YS53aW5kb3dTdGFydCA+IFJBVEVfTElNSVRfQ09ORklHLlRJTUVfV0lORE9XX01TKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQgPSAwO1xyXG4gICAgbGltaXREYXRhLndpbmRvd1N0YXJ0ID0gbm93O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayBwZW5kaW5nIHJlcXVlc3RzIGxpbWl0XHJcbiAgaWYgKGxpbWl0RGF0YS5wZW5kaW5nQ291bnQgPj0gUkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFMpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFsbG93ZWQ6IGZhbHNlLFxyXG4gICAgICByZWFzb246IGBUb28gbWFueSBwZW5kaW5nIHJlcXVlc3RzLiBNYXhpbXVtICR7UkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFN9IHBlbmRpbmcgcmVxdWVzdHMgYWxsb3dlZC5gXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayB0b3RhbCByZXF1ZXN0cyBpbiB3aW5kb3dcclxuICBpZiAobGltaXREYXRhLmNvdW50ID49IFJBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhbGxvd2VkOiBmYWxzZSxcclxuICAgICAgcmVhc29uOiBgUmF0ZSBsaW1pdCBleGNlZWRlZC4gTWF4aW11bSAke1JBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XfSByZXF1ZXN0cyBwZXIgbWludXRlLmBcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHJldHVybiB7IGFsbG93ZWQ6IHRydWUgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluY3JlbWVudHMgcmF0ZSBsaW1pdCBjb3VudGVycyBmb3IgYW4gb3JpZ2luXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGluY3JlbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gaW5jcmVtZW50UmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBpZiAobGltaXREYXRhKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQrKztcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQrKztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWNyZW1lbnRzIHBlbmRpbmcgY291bnRlciB3aGVuIHJlcXVlc3QgaXMgcmVzb2x2ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gZGVjcmVtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKSB7XHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIGlmIChsaW1pdERhdGEgJiYgbGltaXREYXRhLnBlbmRpbmdDb3VudCA+IDApIHtcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQtLTtcclxuICB9XHJcbn1cclxuXHJcbi8vIENsZWFuIHVwIG9sZCByYXRlIGxpbWl0IGVudHJpZXMgZXZlcnkgNSBtaW51dGVzXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW29yaWdpbiwgZGF0YV0gb2YgcmF0ZUxpbWl0TWFwLmVudHJpZXMoKSkge1xyXG4gICAgaWYgKG5vdyAtIGRhdGEud2luZG93U3RhcnQgPiBSQVRFX0xJTUlUX0NPTkZJRy5USU1FX1dJTkRPV19NUyAqIDUgJiYgZGF0YS5wZW5kaW5nQ291bnQgPT09IDApIHtcclxuICAgICAgcmF0ZUxpbWl0TWFwLmRlbGV0ZShvcmlnaW4pO1xyXG4gICAgfVxyXG4gIH1cclxufSwgMzAwMDAwKTtcclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIFJFUExBWSBQUk9URUNUSU9OID09PT09XHJcbi8vIFByZXZlbnRzIHRoZSBzYW1lIHRyYW5zYWN0aW9uIGFwcHJvdmFsIGZyb20gYmVpbmcgdXNlZCBtdWx0aXBsZSB0aW1lc1xyXG5jb25zdCBwcm9jZXNzZWRBcHByb3ZhbHMgPSBuZXcgTWFwKCk7IC8vIGFwcHJvdmFsVG9rZW4gLT4geyB0aW1lc3RhbXAsIHR4SGFzaCwgdXNlZDogdHJ1ZSB9XHJcblxyXG5jb25zdCBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcgPSB7XHJcbiAgQVBQUk9WQUxfVElNRU9VVDogMzAwMDAwLCAvLyA1IG1pbnV0ZXMgLSBhcHByb3ZhbCBleHBpcmVzIGFmdGVyIHRoaXNcclxuICBDTEVBTlVQX0lOVEVSVkFMOiA2MDAwMCAgIC8vIDEgbWludXRlIC0gY2xlYW4gdXAgb2xkIGFwcHJvdmFsc1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlblxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBVbmlxdWUgYXBwcm92YWwgdG9rZW5cclxuICovXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQXBwcm92YWxUb2tlbigpIHtcclxuICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KDMyKTtcclxuICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcclxuICByZXR1cm4gQXJyYXkuZnJvbShhcnJheSwgYnl0ZSA9PiBieXRlLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhbmQgbWFya3MgYW4gYXBwcm92YWwgdG9rZW4gYXMgdXNlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBwcm92YWxUb2tlbiAtIFRva2VuIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbGlkIGFuZCBub3QgeWV0IHVzZWRcclxuICovXHJcbmZ1bmN0aW9uIHZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSB7XHJcbiAgaWYgKCFhcHByb3ZhbFRva2VuKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgTm8gYXBwcm92YWwgdG9rZW4gcHJvdmlkZWQnKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgYXBwcm92YWwgPSBwcm9jZXNzZWRBcHByb3ZhbHMuZ2V0KGFwcHJvdmFsVG9rZW4pO1xyXG4gIFxyXG4gIGlmICghYXBwcm92YWwpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBVbmtub3duIGFwcHJvdmFsIHRva2VuJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIGlmIChhcHByb3ZhbC51c2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQXBwcm92YWwgdG9rZW4gYWxyZWFkeSB1c2VkIC0gcHJldmVudGluZyByZXBsYXkgYXR0YWNrJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIGlmIGFwcHJvdmFsIGhhcyBleHBpcmVkXHJcbiAgY29uc3QgYWdlID0gRGF0ZS5ub3coKSAtIGFwcHJvdmFsLnRpbWVzdGFtcDtcclxuICBpZiAoYWdlID4gUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkFQUFJPVkFMX1RJTUVPVVQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBBcHByb3ZhbCB0b2tlbiBleHBpcmVkJyk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKGFwcHJvdmFsVG9rZW4pO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBcclxuICAvLyBNYXJrIGFzIHVzZWRcclxuICBhcHByb3ZhbC51c2VkID0gdHJ1ZTtcclxuICBhcHByb3ZhbC51c2VkQXQgPSBEYXRlLm5vdygpO1xyXG4gIGNvbnNvbGUubG9nKCfwn6uAIEFwcHJvdmFsIHRva2VuIHZhbGlkYXRlZCBhbmQgbWFya2VkIGFzIHVzZWQnKTtcclxuICBcclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLy8gQ2xlYW4gdXAgb2xkIHByb2Nlc3NlZCBhcHByb3ZhbHMgZXZlcnkgbWludXRlXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW3Rva2VuLCBhcHByb3ZhbF0gb2YgcHJvY2Vzc2VkQXBwcm92YWxzLmVudHJpZXMoKSkge1xyXG4gICAgY29uc3QgYWdlID0gbm93IC0gYXBwcm92YWwudGltZXN0YW1wO1xyXG4gICAgaWYgKGFnZSA+IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5BUFBST1ZBTF9USU1FT1VUICogMikge1xyXG4gICAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKHRva2VuKTtcclxuICAgIH1cclxuICB9XHJcbn0sIFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5DTEVBTlVQX0lOVEVSVkFMKTtcclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFRyYW5zYWN0aW9uIC0gU2lnbiBhbmQgc2VuZCBhIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogQ2hlY2sgcmF0ZSBsaW1pdCB0byBwcmV2ZW50IHNwYW1cclxuICBjb25zdCByYXRlTGltaXRDaGVjayA9IGNoZWNrUmF0ZUxpbWl0KG9yaWdpbik7XHJcbiAgaWYgKCFyYXRlTGltaXRDaGVjay5hbGxvd2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgUmF0ZSBsaW1pdCBleGNlZWRlZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MjAwLCBtZXNzYWdlOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShyYXRlTGltaXRDaGVjay5yZWFzb24pIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHR4UmVxdWVzdCA9IHBhcmFtc1swXTtcclxuXHJcbiAgLy8gTG9hZCBzZXR0aW5ncyB0byBnZXQgbWF4IGdhcyBwcmljZVxyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgbG9hZCgnc2V0dGluZ3MnKTtcclxuICBjb25zdCBtYXhHYXNQcmljZUd3ZWkgPSBzZXR0aW5ncz8ubWF4R2FzUHJpY2VHd2VpIHx8IDEwMDA7XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBDb21wcmVoZW5zaXZlIHRyYW5zYWN0aW9uIHZhbGlkYXRpb25cclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVUcmFuc2FjdGlvblJlcXVlc3QodHhSZXF1ZXN0LCBtYXhHYXNQcmljZUd3ZWkpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgdHJhbnNhY3Rpb24gZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9ycyk7XHJcbiAgICByZXR1cm4geyBcclxuICAgICAgZXJyb3I6IHsgXHJcbiAgICAgICAgY29kZTogLTMyNjAyLCBcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCB0cmFuc2FjdGlvbjogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3JzLmpvaW4oJzsgJykpIFxyXG4gICAgICB9IFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIFVzZSBzYW5pdGl6ZWQgdHJhbnNhY3Rpb24gcGFyYW1ldGVyc1xyXG4gIGNvbnN0IHNhbml0aXplZFR4ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIEluY3JlbWVudCByYXRlIGxpbWl0IGNvdW50ZXJcclxuICBpbmNyZW1lbnRSYXRlTGltaXQob3JpZ2luKTtcclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IERhdGUubm93KCkudG9TdHJpbmcoKTtcclxuICAgIFxyXG4gICAgLy8gU0VDVVJJVFk6IEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIFN0b3JlIHNhbml0aXplZCB0cmFuc2FjdGlvbiBpbnN0ZWFkIG9mIG9yaWdpbmFsIHJlcXVlc3RcclxuICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuc2V0KHJlcXVlc3RJZCwgeyBcclxuICAgICAgcmVzb2x2ZSwgXHJcbiAgICAgIHJlamVjdCwgXHJcbiAgICAgIG9yaWdpbiwgXHJcbiAgICAgIHR4UmVxdWVzdDogc2FuaXRpemVkVHgsXHJcbiAgICAgIGFwcHJvdmFsVG9rZW4gIC8vIEluY2x1ZGUgdG9rZW4gZm9yIHZhbGlkYXRpb25cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249dHJhbnNhY3Rpb24mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVHJhbnNhY3Rpb24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgdHJhbnNhY3Rpb24gYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNlc3Npb25Ub2tlbiwgZ2FzUHJpY2UsIGN1c3RvbU5vbmNlKSB7XHJcbiAgaWYgKCFwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdHhSZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nVHJhbnNhY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gIFxyXG4gIC8vIFNFQ1VSSVRZOiBWYWxpZGF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiB0byBwcmV2ZW50IHJlcGxheSBhdHRhY2tzXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG4gIFxyXG4gIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIERlY3JlbWVudCBwZW5kaW5nIGNvdW50ZXIgKHJlcXVlc3QgY29tcGxldGVkKVxyXG4gIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRyYW5zYWN0aW9uJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCBnZXQgcGFzc3dvcmQgKG5vdyBhc3luYylcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gVW5sb2NrIHdhbGxldFxyXG4gICAgY29uc3QgeyBzaWduZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCk7XHJcblxyXG4gICAgLy8gR2V0IGN1cnJlbnQgbmV0d29ya1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBDb25uZWN0IHNpZ25lciB0byBwcm92aWRlclxyXG4gICAgY29uc3QgY29ubmVjdGVkU2lnbmVyID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIFByZXBhcmUgdHJhbnNhY3Rpb24gLSBjcmVhdGUgYSBjbGVhbiBjb3B5IHdpdGggb25seSBuZWNlc3NhcnkgZmllbGRzXHJcbiAgICBjb25zdCB0eFRvU2VuZCA9IHtcclxuICAgICAgdG86IHR4UmVxdWVzdC50byxcclxuICAgICAgdmFsdWU6IHR4UmVxdWVzdC52YWx1ZSB8fCAnMHgwJyxcclxuICAgICAgZGF0YTogdHhSZXF1ZXN0LmRhdGEgfHwgJzB4J1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBOb25jZSBoYW5kbGluZyBwcmlvcml0eTpcclxuICAgIC8vIDEuIFVzZXItcHJvdmlkZWQgY3VzdG9tIG5vbmNlIChmb3IgcmVwbGFjaW5nIHN0dWNrIHRyYW5zYWN0aW9ucylcclxuICAgIC8vIDIuIERBcHAtcHJvdmlkZWQgbm9uY2UgKHZhbGlkYXRlZClcclxuICAgIC8vIDMuIEF1dG8tZmV0Y2ggYnkgZXRoZXJzLmpzXHJcbiAgICBpZiAoY3VzdG9tTm9uY2UgIT09IHVuZGVmaW5lZCAmJiBjdXN0b21Ob25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBVc2VyIG1hbnVhbGx5IHNldCBub25jZSAoZS5nLiwgdG8gcmVwbGFjZSBzdHVjayB0cmFuc2FjdGlvbilcclxuICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25Db3VudChzaWduZXIuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuXHJcbiAgICAgIGlmIChjdXN0b21Ob25jZSA8IGN1cnJlbnROb25jZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ3VzdG9tIG5vbmNlICR7Y3VzdG9tTm9uY2V9IGlzIGxlc3MgdGhhbiBjdXJyZW50IG5vbmNlICR7Y3VycmVudE5vbmNlfS4gVGhpcyBtYXkgZmFpbCB1bmxlc3MgeW91J3JlIHJlcGxhY2luZyBhIHBlbmRpbmcgdHJhbnNhY3Rpb24uYCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR4VG9TZW5kLm5vbmNlID0gY3VzdG9tTm9uY2U7XHJcbiAgICAgIC8vIFVzaW5nIGN1c3RvbSBub25jZVxyXG4gICAgfSBlbHNlIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgLy8gU0VDVVJJVFk6IFZhbGlkYXRlIG5vbmNlIGlmIHByb3ZpZGVkIGJ5IERBcHBcclxuICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25Db3VudChzaWduZXIuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgICAgY29uc3QgcHJvdmlkZWROb25jZSA9IHR5cGVvZiB0eFJlcXVlc3Qubm9uY2UgPT09ICdzdHJpbmcnXHJcbiAgICAgICAgPyBwYXJzZUludCh0eFJlcXVlc3Qubm9uY2UsIDE2KVxyXG4gICAgICAgIDogdHhSZXF1ZXN0Lm5vbmNlO1xyXG5cclxuICAgICAgLy8gTm9uY2UgbXVzdCBiZSA+PSBjdXJyZW50IHBlbmRpbmcgbm9uY2VcclxuICAgICAgaWYgKHByb3ZpZGVkTm9uY2UgPCBjdXJyZW50Tm9uY2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgbm9uY2U6ICR7cHJvdmlkZWROb25jZX0gaXMgbGVzcyB0aGFuIGN1cnJlbnQgbm9uY2UgJHtjdXJyZW50Tm9uY2V9YCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR4VG9TZW5kLm5vbmNlID0gcHJvdmlkZWROb25jZTtcclxuICAgICAgLy8gVXNpbmcgREFwcC1wcm92aWRlZCBub25jZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gSWYgbm8gbm9uY2UgcHJvdmlkZWQsIGV0aGVycy5qcyB3aWxsIGZldGNoIHRoZSBjb3JyZWN0IG9uZSBhdXRvbWF0aWNhbGx5XHJcbiAgICAgIC8vIEF1dG8tZmV0Y2hpbmcgbm9uY2VcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBEQXBwIHByb3ZpZGVkIGEgZ2FzIGxpbWl0LCB1c2UgaXQuIE90aGVyd2lzZSBsZXQgZXRoZXJzIGVzdGltYXRlLlxyXG4gICAgaWYgKHR4UmVxdWVzdC5nYXMgfHwgdHhSZXF1ZXN0Lmdhc0xpbWl0KSB7XHJcbiAgICAgIHR4VG9TZW5kLmdhc0xpbWl0ID0gdHhSZXF1ZXN0LmdhcyB8fCB0eFJlcXVlc3QuZ2FzTGltaXQ7XHJcbiAgICAgIC8vIFVzaW5nIHByb3ZpZGVkIGdhcyBsaW1pdFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFwcGx5IHVzZXItc2VsZWN0ZWQgZ2FzIHByaWNlIGlmIHByb3ZpZGVkLCBvciB1c2UgbmV0d29yayBnYXMgcHJpY2Ugd2l0aCBtdWx0aXBsaWVyXHJcbiAgICBpZiAoZ2FzUHJpY2UpIHtcclxuICAgICAgLy8gVXNlIGxlZ2FjeSBnYXNQcmljZSAod29ya3Mgb24gYWxsIG5ldHdvcmtzIGluY2x1ZGluZyBQdWxzZUNoYWluKVxyXG4gICAgICB0eFRvU2VuZC5nYXNQcmljZSA9IGdhc1ByaWNlO1xyXG4gICAgICAvLyBVc2luZyBjdXN0b20gZ2FzIHByaWNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBGZXRjaCBjdXJyZW50IG5ldHdvcmsgZ2FzIHByaWNlIGFuZCBhcHBseSAxLjJ4IG11bHRpcGxpZXIgZm9yIGZhc3RlciBjb25maXJtYXRpb25cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBuZXR3b3JrR2FzUHJpY2UgPSBhd2FpdCBwcm92aWRlci5nZXRGZWVEYXRhKCk7XHJcbiAgICAgICAgaWYgKG5ldHdvcmtHYXNQcmljZS5nYXNQcmljZSkge1xyXG4gICAgICAgICAgY29uc3QgbXVsdGlwbGllZEdhc1ByaWNlID0gKG5ldHdvcmtHYXNQcmljZS5nYXNQcmljZSAqIEJpZ0ludCgxMjApKSAvIEJpZ0ludCgxMDApO1xyXG4gICAgICAgICAgdHhUb1NlbmQuZ2FzUHJpY2UgPSBtdWx0aXBsaWVkR2FzUHJpY2U7XHJcbiAgICAgICAgICAvLyBVc2luZyBuZXR3b3JrIGdhcyBwcmljZSB3aXRoIG11bHRpcGxpZXJcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgLy8gQXV0by1jYWxjdWxhdGluZyBnYXMgcHJpY2VcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNlbmQgdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgY29ubmVjdGVkU2lnbmVyLnNlbmRUcmFuc2FjdGlvbih0eFRvU2VuZCk7XHJcblxyXG4gICAgLy8gVHJhbnNhY3Rpb24gc2VudFxyXG5cclxuICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSAobmV0d29yayB2YXJpYWJsZSBhbHJlYWR5IGRlZmluZWQgYWJvdmUpXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3Rvcnkoc2lnbmVyLmFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBzaWduZXIuYWRkcmVzcyxcclxuICAgICAgdG86IHR4UmVxdWVzdC50byB8fCBudWxsLFxyXG4gICAgICB2YWx1ZTogdHhSZXF1ZXN0LnZhbHVlIHx8ICcwJyxcclxuICAgICAgZ2FzUHJpY2U6IHR4Lmdhc1ByaWNlID8gdHguZ2FzUHJpY2UudG9TdHJpbmcoKSA6ICcwJyxcclxuICAgICAgbm9uY2U6IHR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6IHR4SGlzdG9yeS5UWF9UWVBFUy5DT05UUkFDVFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2VuZCBkZXNrdG9wIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU2VudCcsXHJcbiAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBzZW50OiAke3R4Lmhhc2guc2xpY2UoMCwgMjApfS4uLmAsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb24gaW4gYmFja2dyb3VuZFxyXG4gICAgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIHNpZ25lci5hZGRyZXNzKTtcclxuXHJcbiAgICAvLyBSZXNvbHZlIHdpdGggdHJhbnNhY3Rpb24gaGFzaFxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogdHguaGFzaCB9KTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2ggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBUcmFuc2FjdGlvbiBlcnJvcjonLCBlcnJvcik7XHJcbiAgICBjb25zdCBzYW5pdGl6ZWRFcnJvciA9IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcihzYW5pdGl6ZWRFcnJvcikpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZWRFcnJvciB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHRyYW5zYWN0aW9uIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0VHJhbnNhY3Rpb25SZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmIChwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdHhSZXF1ZXN0IH0gPSBwZW5kaW5nVHJhbnNhY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luLCB0eFJlcXVlc3QgfTtcclxuICB9XHJcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQnIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXRfd2F0Y2hBc3NldCAtIEFkZCBjdXN0b20gdG9rZW4gKEVJUC03NDcpXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVdhdGNoQXNzZXQocGFyYW1zLCBvcmlnaW4sIHRhYikge1xyXG4gIC8vIFJlY2VpdmVkIHdhbGxldF93YXRjaEFzc2V0IHJlcXVlc3RcclxuXHJcbiAgLy8gVmFsaWRhdGUgcGFyYW1zIHN0cnVjdHVyZVxyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXMudHlwZSB8fCAhcGFyYW1zLm9wdGlvbnMpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zOiBtdXN0IGluY2x1ZGUgdHlwZSBhbmQgb3B0aW9ucycgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyB0eXBlLCBvcHRpb25zIH0gPSBwYXJhbXM7XHJcblxyXG4gIC8vIE9ubHkgc3VwcG9ydCBFUkMyMC9QUkMyMCB0b2tlbnNcclxuICBpZiAodHlwZS50b1VwcGVyQ2FzZSgpICE9PSAnRVJDMjAnKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdPbmx5IEVSQzIwL1BSQzIwIHRva2VucyBhcmUgc3VwcG9ydGVkJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSByZXF1aXJlZCB0b2tlbiBmaWVsZHNcclxuICBpZiAoIW9wdGlvbnMuYWRkcmVzcyB8fCAhb3B0aW9ucy5zeW1ib2wpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ1Rva2VuIG11c3QgaGF2ZSBhZGRyZXNzIGFuZCBzeW1ib2wnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VuSW5mbyA9IHtcclxuICAgIGFkZHJlc3M6IG9wdGlvbnMuYWRkcmVzcy50b0xvd2VyQ2FzZSgpLFxyXG4gICAgc3ltYm9sOiBvcHRpb25zLnN5bWJvbCxcclxuICAgIGRlY2ltYWxzOiBvcHRpb25zLmRlY2ltYWxzIHx8IDE4LFxyXG4gICAgaW1hZ2U6IG9wdGlvbnMuaW1hZ2UgfHwgbnVsbFxyXG4gIH07XHJcblxyXG4gIC8vIFJlcXVlc3RpbmcgdG8gYWRkIHRva2VuXHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCkgKyAnX3Rva2VuJztcclxuICAgIHBlbmRpbmdUb2tlblJlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRva2VuSW5mbyB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPWFkZFRva2VuJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA1MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVG9rZW4gYWRkIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHRva2VuIGFkZCBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuQWRkQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCkge1xyXG4gIGlmICghcGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgdG9rZW5JbmZvIH0gPSBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCB0b2tlbicpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVG9rZW4gYXBwcm92ZWQgLSByZXR1cm4gdHJ1ZSAod2FsbGV0X3dhdGNoQXNzZXQgcmV0dXJucyBib29sZWFuKVxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogdHJ1ZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHRva2VuSW5mbyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRva2VuIGFkZCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICByZWplY3QobmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHRva2VuIGFkZCByZXF1ZXN0IGRldGFpbHMgZm9yIHBvcHVwXHJcbmZ1bmN0aW9uIGdldFRva2VuQWRkUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0b2tlbkluZm8gfSA9IHBlbmRpbmdUb2tlblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luLCB0b2tlbkluZm8gfTtcclxuICB9XHJcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQnIH07XHJcbn1cclxuXHJcbi8vIFNwZWVkIHVwIGEgcGVuZGluZyB0cmFuc2FjdGlvbiBieSByZXBsYWNpbmcgaXQgd2l0aCBoaWdoZXIgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbihhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgc2Vzc2lvblRva2VuLCBnYXNQcmljZU11bHRpcGxpZXIgPSAxLjIpIHtcclxuICB0cnkge1xyXG4gICAgLy8gVmFsaWRhdGUgc2Vzc2lvbiAobm93IGFzeW5jKVxyXG4gICAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBHZXQgb3JpZ2luYWwgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUeCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICBpZiAoIW9yaWdpbmFsVHgpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gbm90IGZvdW5kJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcmlnaW5hbFR4LnN0YXR1cyAhPT0gdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGlzIG5vdCBwZW5kaW5nJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCB3YWxsZXQgYW5kIHVubG9ja1xyXG4gICAgY29uc3QgeyBzaWduZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCk7XHJcblxyXG4gICAgLy8gR2V0IG5ldHdvcmsgYW5kIGNyZWF0ZSBwcm92aWRlciB3aXRoIGF1dG9tYXRpYyBmYWlsb3ZlclxyXG4gICAgY29uc3QgbmV0d29yayA9IG9yaWdpbmFsVHgubmV0d29yaztcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBuZXcgZ2FzIHByaWNlICgxLjJ4IG9mIG9yaWdpbmFsIGJ5IGRlZmF1bHQpXHJcbiAgICBjb25zdCBvcmlnaW5hbEdhc1ByaWNlID0gQmlnSW50KG9yaWdpbmFsVHguZ2FzUHJpY2UpO1xyXG4gICAgY29uc3QgbmV3R2FzUHJpY2UgPSAob3JpZ2luYWxHYXNQcmljZSAqIEJpZ0ludChNYXRoLmZsb29yKGdhc1ByaWNlTXVsdGlwbGllciAqIDEwMCkpKSAvIEJpZ0ludCgxMDApO1xyXG5cclxuICAgIC8vIENyZWF0ZSByZXBsYWNlbWVudCB0cmFuc2FjdGlvbiB3aXRoIHNhbWUgbm9uY2VcclxuICAgIGNvbnN0IHJlcGxhY2VtZW50VHggPSB7XHJcbiAgICAgIHRvOiBvcmlnaW5hbFR4LnRvLFxyXG4gICAgICB2YWx1ZTogb3JpZ2luYWxUeC52YWx1ZSxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTcGVlZGluZyB1cCB0cmFuc2FjdGlvblxyXG5cclxuICAgIC8vIFNlbmQgcmVwbGFjZW1lbnQgdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgd2FsbGV0LnNlbmRUcmFuc2FjdGlvbihyZXBsYWNlbWVudFR4KTtcclxuXHJcbiAgICAvLyBTYXZlIG5ldyB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywge1xyXG4gICAgICBoYXNoOiB0eC5oYXNoLFxyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIGZyb206IGFkZHJlc3MsXHJcbiAgICAgIHRvOiBvcmlnaW5hbFR4LnRvLFxyXG4gICAgICB2YWx1ZTogb3JpZ2luYWxUeC52YWx1ZSxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6IG9yaWdpbmFsVHgudHlwZVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyByZXBsYWNlZC9mYWlsZWRcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTcGVkIFVwJyxcclxuICAgICAgbWVzc2FnZTogYFJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHNlbnQgd2l0aCAke01hdGguZmxvb3IoZ2FzUHJpY2VNdWx0aXBsaWVyICogMTAwKX0lIGdhcyBwcmljZWAsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb25cclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2gsIG5ld0dhc1ByaWNlOiBuZXdHYXNQcmljZS50b1N0cmluZygpIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gQ2FuY2VsIGEgcGVuZGluZyB0cmFuc2FjdGlvbiBieSByZXBsYWNpbmcgaXQgd2l0aCBhIHplcm8tdmFsdWUgdHggdG8gc2VsZlxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbihhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgc2Vzc2lvblRva2VuKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2tcclxuICAgIGNvbnN0IHsgc2lnbmVyIH0gPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQpO1xyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgbmV3IGdhcyBwcmljZSAoMS4yeCBvZiBvcmlnaW5hbCB0byBlbnN1cmUgaXQgZ2V0cyBtaW5lZCBmaXJzdClcclxuICAgIGNvbnN0IG9yaWdpbmFsR2FzUHJpY2UgPSBCaWdJbnQob3JpZ2luYWxUeC5nYXNQcmljZSk7XHJcbiAgICBjb25zdCBuZXdHYXNQcmljZSA9IChvcmlnaW5hbEdhc1ByaWNlICogQmlnSW50KDEyMCkpIC8gQmlnSW50KDEwMCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiAoc2VuZCAwIHRvIHNlbGYgd2l0aCBzYW1lIG5vbmNlKVxyXG4gICAgY29uc3QgY2FuY2VsVHggPSB7XHJcbiAgICAgIHRvOiBhZGRyZXNzLCAgLy8gU2VuZCB0byBzZWxmXHJcbiAgICAgIHZhbHVlOiAnMCcsICAgLy8gWmVybyB2YWx1ZVxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENhbmNlbGxpbmcgdHJhbnNhY3Rpb25cclxuXHJcbiAgICAvLyBTZW5kIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgdHggPSBhd2FpdCB3YWxsZXQuc2VuZFRyYW5zYWN0aW9uKGNhbmNlbFR4KTtcclxuXHJcbiAgICAvLyBTYXZlIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywge1xyXG4gICAgICBoYXNoOiB0eC5oYXNoLFxyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIGZyb206IGFkZHJlc3MsXHJcbiAgICAgIHRvOiBhZGRyZXNzLFxyXG4gICAgICB2YWx1ZTogJzAnLFxyXG4gICAgICBnYXNQcmljZTogbmV3R2FzUHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogJ3NlbmQnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIGZhaWxlZFxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCwgbnVsbCk7XHJcblxyXG4gICAgLy8gU2VuZCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENhbmNlbGxlZCcsXHJcbiAgICAgIG1lc3NhZ2U6ICdDYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gc2VudCcsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb25cclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2ggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFdhaXQgZm9yIHRyYW5zYWN0aW9uIGNvbmZpcm1hdGlvblxyXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBXYWl0aW5nIGZvciBjb25maXJtYXRpb25cclxuXHJcbiAgICAvLyBXYWl0IGZvciAxIGNvbmZpcm1hdGlvblxyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLndhaXRGb3JUcmFuc2FjdGlvbih0eC5oYXNoLCAxKTtcclxuXHJcbiAgICBpZiAocmVjZWlwdCAmJiByZWNlaXB0LnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBjb25maXJtZWRcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXMgaW4gaGlzdG9yeVxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICB0eC5oYXNoLFxyXG4gICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVELFxyXG4gICAgICAgIHJlY2VpcHQuYmxvY2tOdW1iZXJcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFNlbmQgc3VjY2VzcyBub3RpZmljYXRpb25cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ29uZmlybWVkJyxcclxuICAgICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gY29uZmlybWVkIG9uLWNoYWluIWAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBmYWlsZWRcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXMgaW4gaGlzdG9yeVxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICB0eC5oYXNoLFxyXG4gICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELFxyXG4gICAgICAgIHJlY2VpcHQgPyByZWNlaXB0LmJsb2NrTnVtYmVyIDogbnVsbFxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gU2VuZCBmYWlsdXJlIG5vdGlmaWNhdGlvblxyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBGYWlsZWQnLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiB3YXMgcmV2ZXJ0ZWQgb3IgZmFpbGVkJyxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciB3YWl0aW5nIGZvciBjb25maXJtYXRpb246JywgZXJyb3IpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0cyBhbmQgcG9wdXBcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIC8vIFJlY2VpdmVkIG1lc3NhZ2VcclxuXHJcbiAgKGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnV0FMTEVUX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaGFuZGxlV2FsbGV0UmVxdWVzdChtZXNzYWdlLCBzZW5kZXIpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyByZXNwb25zZVxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ09OTkVDVElPTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCBhcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGFwcHJvdmFsIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoYXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DT05ORUNUSU9OX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgcmVxdWVzdEluZm8gPSBnZXRDb25uZWN0aW9uUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdCBpbmZvXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DT05ORUNURURfU0lURVMnOlxyXG4gICAgICAgICAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBjb25uZWN0ZWQgc2l0ZXMnKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNpdGVzIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0RJU0NPTk5FQ1RfU0lURSc6XHJcbiAgICAgICAgICBhd2FpdCByZW1vdmVDb25uZWN0ZWRTaXRlKG1lc3NhZ2Uub3JpZ2luKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgZGlzY29ubmVjdCBjb25maXJtYXRpb25cclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgdHhBcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQsIG1lc3NhZ2Uuc2Vzc2lvblRva2VuLCBtZXNzYWdlLmdhc1ByaWNlLCBtZXNzYWdlLmN1c3RvbU5vbmNlKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eEFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDUkVBVEVfU0VTU0lPTic6XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uVG9rZW4gPSBhd2FpdCBjcmVhdGVTZXNzaW9uKG1lc3NhZ2UucGFzc3dvcmQsIG1lc3NhZ2Uud2FsbGV0SWQsIG1lc3NhZ2UuZHVyYXRpb25Ncyk7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNlc3Npb25Ub2tlbiB9KTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX1NFU1NJT04nOlxyXG4gICAgICAgICAgY29uc3QgaW52YWxpZGF0ZWQgPSBpbnZhbGlkYXRlU2Vzc2lvbihtZXNzYWdlLnNlc3Npb25Ub2tlbik7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBpbnZhbGlkYXRlZCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX0FMTF9TRVNTSU9OUyc6XHJcbiAgICAgICAgICBjb25zdCBjb3VudCA9IGludmFsaWRhdGVBbGxTZXNzaW9ucygpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgdHhSZXF1ZXN0SW5mbyA9IGdldFRyYW5zYWN0aW9uUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRyYW5zYWN0aW9uIHJlcXVlc3QgaW5mbzonLCB0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdUT0tFTl9BRERfQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgdG9rZW5BcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVRva2VuQWRkQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgYXBwcm92YWwgcmVzcG9uc2U6JywgdG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RPS0VOX0FERF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHRva2VuUmVxdWVzdEluZm8gPSBnZXRUb2tlbkFkZFJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgcmVxdWVzdCBpbmZvOicsIHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zYWN0aW9uIEhpc3RvcnlcclxuICAgICAgICBjYXNlICdHRVRfVFhfSElTVE9SWSc6XHJcbiAgICAgICAgICBjb25zdCB0eEhpc3RvcnlMaXN0ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4SGlzdG9yeShtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHJhbnNhY3Rpb25zOiB0eEhpc3RvcnlMaXN0IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9QRU5ESU5HX1RYX0NPVU5UJzpcclxuICAgICAgICAgIGNvbnN0IHBlbmRpbmdDb3VudCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhDb3VudChtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQ6IHBlbmRpbmdDb3VudCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfUEVORElOR19UWFMnOlxyXG4gICAgICAgICAgY29uc3QgcGVuZGluZ1R4cyA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhzKG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbnM6IHBlbmRpbmdUeHMgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RYX0JZX0hBU0gnOlxyXG4gICAgICAgICAgY29uc3QgdHhEZXRhaWwgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2gobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnR4SGFzaCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbjogdHhEZXRhaWwgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0xFQVJfVFhfSElTVE9SWSc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuY2xlYXJUeEhpc3RvcnkobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU1BFRURfVVBfVFgnOlxyXG4gICAgICAgICAgY29uc3Qgc3BlZWRVcFJlc3VsdCA9IGF3YWl0IGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuZ2FzUHJpY2VNdWx0aXBsaWVyIHx8IDEuMlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzcGVlZFVwUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDQU5DRUxfVFgnOlxyXG4gICAgICAgICAgY29uc3QgY2FuY2VsUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2Vzc2lvblRva2VuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGNhbmNlbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFVua25vd24gbWVzc2FnZSB0eXBlOicsIG1lc3NhZ2UudHlwZSk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmtub3duIG1lc3NhZ2UgdHlwZScgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgaGFuZGxpbmcgbWVzc2FnZTonLCBlcnJvcik7XHJcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgIH1cclxuICB9KSgpO1xyXG5cclxuICByZXR1cm4gdHJ1ZTsgLy8gS2VlcCBtZXNzYWdlIGNoYW5uZWwgb3BlbiBmb3IgYXN5bmMgcmVzcG9uc2VcclxufSk7XHJcblxyXG5jb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBzZXJ2aWNlIHdvcmtlciByZWFkeScpO1xyXG4iXSwibmFtZXMiOlsiZXRoZXJzLmdldEFkZHJlc3MiLCJycGMuZ2V0QmxvY2tOdW1iZXIiLCJycGMuZ2V0QmxvY2tCeU51bWJlciIsInJwYy5nZXRCYWxhbmNlIiwicnBjLmdldFRyYW5zYWN0aW9uQ291bnQiLCJycGMuZ2V0R2FzUHJpY2UiLCJycGMuZXN0aW1hdGVHYXMiLCJycGMuY2FsbCIsInJwYy5zZW5kUmF3VHJhbnNhY3Rpb24iLCJycGMuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0IiwicnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoIiwicnBjLmdldFByb3ZpZGVyIiwidHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5IiwidHhIaXN0b3J5LlRYX1NUQVRVUyIsInR4SGlzdG9yeS5UWF9UWVBFUyIsInR4SGlzdG9yeS5nZXRUeEJ5SGFzaCIsInR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyIsInR4SGlzdG9yeS5nZXRUeEhpc3RvcnkiLCJ0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4Q291bnQiLCJ0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4cyIsInR4SGlzdG9yeS5jbGVhclR4SGlzdG9yeSJdLCJtYXBwaW5ncyI6IjtBQVFBLE1BQU0saUJBQWlCO0FBQ3ZCLE1BQU0sMEJBQTBCO0FBQ2hDLE1BQU0sc0JBQXNCO0FBR3JCLE1BQU0sV0FBVztBQUFBLEVBRXRCLFVBQVU7QUFFWjtBQUdPLE1BQU0sWUFBWTtBQUFBLEVBQ3ZCLFNBQVM7QUFBQSxFQUNULFdBQVc7QUFBQSxFQUNYLFFBQVE7QUFDVjtBQUtPLGVBQWUsdUJBQXVCO0FBQzNDLFFBQU0sV0FBVyxNQUFNLEtBQUssdUJBQXVCO0FBQ25ELFNBQU8sWUFBWTtBQUFBLElBQ2pCLFNBQVM7QUFBQTtBQUFBLElBQ1QsYUFBYTtBQUFBO0FBQUEsRUFDakI7QUFDQTtBQVlBLGVBQWUsZ0JBQWdCO0FBQzdCLFFBQU0sVUFBVSxNQUFNLEtBQUssY0FBYztBQUN6QyxTQUFPLFdBQVcsQ0FBQTtBQUNwQjtBQUtBLGVBQWUsZUFBZSxTQUFTO0FBQ3JDLFFBQU0sS0FBSyxnQkFBZ0IsT0FBTztBQUNwQztBQUtPLGVBQWUsYUFBYSxTQUFTO0FBQzFDLFFBQU0sV0FBVyxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxTQUFTLFNBQVM7QUFDckIsV0FBTztFQUNUO0FBRUEsUUFBTSxVQUFVLE1BQU07QUFDdEIs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
