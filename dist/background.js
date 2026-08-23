import { l as load, s as save, a as getAddress, H as getBytes, i as isAddress, N as updateRpcPriorities, g as getProvider, u as unlockWallet, O as secureCleanup, P as secureCleanupSigner, Q as getRawTransaction, R as broadcastToAllRpcs, E as getGasPriceRecommendations, d as getActiveWallet, x as getEip1559Fees, U as getTransactionByHash, V as getTransactionReceipt, W as sendRawTransaction, y as getGasPrice, F as estimateGas, X as call, t as getTransactionCount, q as getBalance, Y as getBlockByNumber, Z as getBlockNumber } from "./rpc.js";
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
  const txEntry = {
    hash: txData.hash,
    timestamp: txData.timestamp || Date.now(),
    from: txData.from.toLowerCase(),
    to: txData.to ? txData.to.toLowerCase() : null,
    value: txData.value || "0",
    data: txData.data || "0x",
    gasPrice: txData.gasPrice,
    gasLimit: txData.gasLimit,
    nonce: txData.nonce,
    network: txData.network,
    status: txData.status || TX_STATUS.PENDING,
    blockNumber: txData.blockNumber || null,
    type: txData.type || TX_TYPES.CONTRACT
  };
  if (txData.maxFeePerGas) {
    txEntry.maxFeePerGas = txData.maxFeePerGas;
  }
  if (txData.maxPriorityFeePerGas) {
    txEntry.maxPriorityFeePerGas = txData.maxPriorityFeePerGas;
  }
  history[addressLower].transactions.unshift(txEntry);
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
  if (txRequest.gasLimit !== void 0 && txRequest.gasLimit !== null) {
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
  if (txRequest.gasPrice !== void 0 && txRequest.gasPrice !== null) {
    if (!isValidHexValue(txRequest.gasPrice)) {
      errors.push('Invalid transaction: "gasPrice" field must be a valid hex string');
    } else {
      try {
        const gasPrice = BigInt(txRequest.gasPrice);
        if (gasPrice < 0n) {
          errors.push('Invalid transaction: "gasPrice" cannot be negative');
        } else if (maxGasPriceGwei !== null && gasPrice > BigInt(maxGasPriceGwei) * BigInt("1000000000")) {
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
async function personalSign(signer, message) {
  if (!signer || typeof signer.signMessage !== "function") {
    throw new Error("Invalid signer provided");
  }
  if (!message) {
    throw new Error("Message is required");
  }
  try {
    let messageToSign = message;
    if (typeof message === "string" && message.startsWith("0x")) {
      try {
        messageToSign = getBytes(message);
      } catch {
        messageToSign = message;
      }
    }
    const signature = await signer.signMessage(messageToSign);
    return signature;
  } catch (error) {
    throw new Error(`Failed to sign message: ${error.message}`);
  }
}
async function signTypedData(signer, typedData) {
  if (!signer || typeof signer.signTypedData !== "function") {
    throw new Error("Invalid signer provided");
  }
  if (!typedData) {
    throw new Error("Typed data is required");
  }
  if (!typedData.domain || !typedData.types || !typedData.message) {
    throw new Error("Invalid EIP-712 typed data: missing domain, types, or message");
  }
  try {
    let primaryType = typedData.primaryType;
    if (!primaryType) {
      const typeNames = Object.keys(typedData.types).filter((t) => t !== "EIP712Domain");
      if (typeNames.length === 1) {
        primaryType = typeNames[0];
      } else {
        throw new Error("Cannot infer primaryType - please specify it explicitly");
      }
    }
    if (!typedData.types[primaryType]) {
      throw new Error(`Primary type "${primaryType}" not found in types definition`);
    }
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
function validateSignRequest(method, params) {
  if (!method || !params || !Array.isArray(params)) {
    return { valid: false, error: "Invalid request format" };
  }
  switch (method) {
    case "personal_sign":
    case "eth_sign":
      if (params.length < 2) {
        return { valid: false, error: "Missing required parameters" };
      }
      const message = params[0];
      const address = params[1];
      if (!message) {
        return { valid: false, error: "Message is empty" };
      }
      if (!address || !isAddress(address)) {
        return { valid: false, error: "Invalid address" };
      }
      const sanitizedMessage = typeof message === "string" ? message : String(message);
      return {
        valid: true,
        sanitized: {
          message: sanitizedMessage,
          address: getAddress(address)
          // Normalize to checksum address
        }
      };
    case "eth_signTypedData":
    case "eth_signTypedData_v3":
    case "eth_signTypedData_v4":
      if (params.length < 2) {
        return { valid: false, error: "Missing required parameters" };
      }
      const addr = params[0];
      let typedData = params[1];
      if (!addr || !isAddress(addr)) {
        return { valid: false, error: "Invalid address" };
      }
      if (typeof typedData === "string") {
        try {
          typedData = JSON.parse(typedData);
        } catch {
          return { valid: false, error: "Invalid typed data format" };
        }
      }
      if (!typedData || typeof typedData !== "object") {
        return { valid: false, error: "Typed data must be an object" };
      }
      if (!typedData.domain || !typedData.types || !typedData.message) {
        return { valid: false, error: "Typed data missing required fields (domain, types, message)" };
      }
      return {
        valid: true,
        sanitized: {
          address: getAddress(addr),
          typedData
        }
      };
    default:
      return { valid: false, error: `Unsupported signing method: ${method}` };
  }
}
const CHAIN_IDS = {
  "pulsechainTestnet": "0x3af",
  // 943
  "pulsechain": "0x171",
  // 369
  "ethereum": "0x1",
  // 1
  "sepolia": "0xaa36a7"
  // 11155111
};
const DEFAULT_NETWORK = "pulsechain";
const NETWORK_NAMES = {
  "pulsechainTestnet": "PulseChain Testnet V4",
  "pulsechain": "PulseChain Mainnet",
  "ethereum": "Ethereum Mainnet",
  "sepolia": "Sepolia Testnet"
};
const CHAIN_ID_TO_NETWORK = {
  "0x3af": "pulsechainTestnet",
  "0x171": "pulsechain",
  "0x1": "ethereum",
  "0xaa36a7": "sepolia"
};
const CONNECTED_SITES_KEY = "connected_sites";
const pendingConnections = /* @__PURE__ */ new Map();
const pendingChainSwitches = /* @__PURE__ */ new Map();
const SIGNING_LOG_KEY = "signing_audit_log";
const MAX_SIGNING_LOG_ENTRIES = 100;
async function logSigningOperation(entry) {
  try {
    const logEntry = {
      ...entry,
      timestamp: Date.now(),
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    };
    const existingLog = await load(SIGNING_LOG_KEY) || [];
    existingLog.unshift(logEntry);
    if (existingLog.length > MAX_SIGNING_LOG_ENTRIES) {
      existingLog.length = MAX_SIGNING_LOG_ENTRIES;
    }
    await save(SIGNING_LOG_KEY, existingLog);
    const icon = entry.success ? "✅" : "❌";
    console.log(`🫀 ${icon} Signing audit: ${entry.type} from ${entry.origin} - ${entry.success ? "SUCCESS" : "FAILED"}`);
  } catch (error) {
    console.error("🫀 Error logging signing operation:", error);
  }
}
async function getSigningAuditLog() {
  return await load(SIGNING_LOG_KEY) || [];
}
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
async function createSession(password, walletId, durationMs = 9e5) {
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
async function getConnectedSite(origin) {
  const sites = await getConnectedSites();
  return sites[origin] || null;
}
async function getAuthorizedAccounts(origin) {
  const site = await getConnectedSite(origin);
  const wallet = await getActiveWallet();
  if (!site || !wallet?.address) {
    return [];
  }
  const authorizedAccounts = Array.isArray(site.accounts) ? site.accounts : [];
  const activeAddress = wallet.address.toLowerCase();
  const isAuthorized = authorizedAccounts.some(
    (account) => typeof account === "string" && account.toLowerCase() === activeAddress
  );
  return isAuthorized ? [wallet.address] : [];
}
async function isSiteConnected(origin) {
  const accounts = await getAuthorizedAccounts(origin);
  return accounts.length > 0;
}
async function addConnectedSite(origin, accounts) {
  const sites = await getConnectedSites();
  const existingAccounts = Array.isArray(sites[origin]?.accounts) ? sites[origin].accounts : [];
  const mergedAccounts = [...existingAccounts];
  for (const account of accounts || []) {
    if (typeof account === "string" && !mergedAccounts.some((existing) => existing.toLowerCase() === account.toLowerCase())) {
      mergedAccounts.push(account);
    }
  }
  sites[origin] = {
    accounts: mergedAccounts,
    connectedAt: sites[origin]?.connectedAt || Date.now(),
    lastConnectedAt: Date.now()
  };
  await save(CONNECTED_SITES_KEY, sites);
}
async function removeConnectedSite(origin) {
  const sites = await getConnectedSites();
  delete sites[origin];
  await save(CONNECTED_SITES_KEY, sites);
}
async function notifyAccountsChanged() {
  const sites = await getConnectedSites();
  const wallet = await getActiveWallet();
  const activeAddress = wallet?.address || null;
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.id || !tab.url) {
        return;
      }
      let origin;
      try {
        origin = new URL(tab.url).origin;
      } catch {
        return;
      }
      const site = sites[origin];
      const accounts = site && activeAddress && Array.isArray(site.accounts) && site.accounts.some((account) => typeof account === "string" && account.toLowerCase() === activeAddress.toLowerCase()) ? [activeAddress] : [];
      chrome.tabs.sendMessage(tab.id, {
        type: "ACCOUNTS_CHANGED",
        accounts
      }).catch(() => {
      });
    });
  });
}
function notifyChainChanged(chainId) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {
        type: "CHAIN_CHANGED",
        chainId
      }).catch(() => {
      });
    });
  });
}
async function getCurrentChainId() {
  const network = await load("currentNetwork");
  return CHAIN_IDS[network || DEFAULT_NETWORK];
}
const PUBLIC_METHODS = /* @__PURE__ */ new Set([
  "eth_chainId",
  "net_version",
  "eth_accounts",
  "eth_requestAccounts"
]);
function userRejection(message) {
  const err = new Error(message);
  err.code = 4001;
  return err;
}
async function handleWalletRequest(message, sender) {
  const { method, params } = message;
  let origin;
  try {
    origin = new URL(sender.url).origin;
  } catch {
    console.warn("🫀 SECURITY: Rejecting wallet request with undeterminable origin:", sender?.url);
    return { error: { code: 4100, message: "Unauthorized: could not determine request origin" } };
  }
  if (!PUBLIC_METHODS.has(method) && !await isSiteConnected(origin)) {
    return { error: { code: 4100, message: "Not authorized. Please connect your wallet first." } };
  }
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
        return await handleSwitchChain(params, origin);
      case "wallet_addEthereumChain":
        return await handleAddChain(params, origin);
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
        return await handleSendRawTransaction(params, origin);
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
      case "personal_sign":
      case "eth_sign":
        return await handlePersonalSign(params, origin, method);
      case "eth_signTypedData":
      case "eth_signTypedData_v3":
      case "eth_signTypedData_v4":
        return await handleSignTypedData(params, origin, method);
      default:
        return { error: { code: -32601, message: `Method ${method} not supported` } };
    }
  } catch (error) {
    console.error("🫀 Error handling request:", error);
    return { error: { code: error.code || -32603, message: error.message } };
  }
}
async function handleRequestAccounts(origin, tab) {
  if (await isSiteConnected(origin)) {
    const accounts = await getAuthorizedAccounts(origin);
    if (accounts.length > 0) {
      return { result: accounts };
    }
  }
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    pendingConnections.set(requestId, { resolve, reject, origin, tabId: tab?.id });
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
  const accounts = await getAuthorizedAccounts(origin);
  if (accounts.length > 0) {
    return { result: accounts };
  }
  return { result: [] };
}
async function handleChainId() {
  const chainId = await getCurrentChainId();
  return { result: chainId };
}
async function handleSwitchChain(params, origin) {
  if (!params || !params[0] || !params[0].chainId) {
    return { error: { code: -32602, message: "Invalid params" } };
  }
  if (origin && !await isSiteConnected(origin)) {
    return { error: { code: 4100, message: "Unauthorized: site not connected. Call eth_requestAccounts first." } };
  }
  const requestedChainId = String(params[0].chainId).toLowerCase();
  const networkKey = CHAIN_ID_TO_NETWORK[requestedChainId];
  if (!networkKey) {
    return {
      error: {
        code: 4902,
        message: "Unrecognized chain ID. Try adding the chain using wallet_addEthereumChain."
      }
    };
  }
  const currentNetwork = await getCurrentNetwork();
  if (currentNetwork === networkKey) {
    return { result: null };
  }
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const approvalToken = generateApprovalToken();
    processedApprovals.set(approvalToken, {
      timestamp: Date.now(),
      requestId,
      used: false
    });
    pendingChainSwitches.set(requestId, {
      resolve,
      reject,
      origin,
      networkKey,
      chainId: CHAIN_IDS[networkKey],
      approvalToken
    });
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=switchChain&requestId=${requestId}`),
      type: "popup",
      width: 400,
      height: 520
    });
    setTimeout(() => {
      if (pendingChainSwitches.has(requestId)) {
        pendingChainSwitches.delete(requestId);
        reject(new Error("Chain switch request timeout"));
      }
    }, 3e5);
  });
}
async function handleAddChain(params, origin) {
  if (!params || !params[0] || !params[0].chainId) {
    return { error: { code: -32602, message: "Invalid params" } };
  }
  if (origin && !await isSiteConnected(origin)) {
    return { error: { code: 4100, message: "Unauthorized: site not connected. Call eth_requestAccounts first." } };
  }
  const chainInfo = params[0];
  console.log("🫀 Request to add chain:", chainInfo);
  const requestedChainId = String(chainInfo.chainId).toLowerCase();
  if (CHAIN_ID_TO_NETWORK[requestedChainId]) {
    return await handleSwitchChain([{ chainId: requestedChainId }], origin);
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
      await notifyAccountsChanged();
      resolve({ result: [wallet.address] });
      return { success: true };
    } else {
      reject(new Error("No active wallet"));
      return { success: false, error: "No active wallet" };
    }
  } else {
    reject(userRejection("User rejected connection"));
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
async function handleChainSwitchApproval(requestId, approved) {
  if (!pendingChainSwitches.has(requestId)) {
    return { success: false, error: "Request not found or expired" };
  }
  const { resolve, reject, networkKey, chainId, approvalToken } = pendingChainSwitches.get(requestId);
  if (!validateAndUseApprovalToken(approvalToken)) {
    pendingChainSwitches.delete(requestId);
    reject(new Error("Invalid or already used approval token - possible replay attack"));
    return { success: false, error: "Invalid approval token" };
  }
  pendingChainSwitches.delete(requestId);
  if (!approved) {
    reject(userRejection("User rejected chain switch"));
    return { success: false, error: "User rejected" };
  }
  await save("currentNetwork", networkKey);
  notifyChainChanged(chainId);
  resolve({ result: null });
  return { success: true, chainId, networkName: NETWORK_NAMES[networkKey] };
}
async function getChainSwitchRequest(requestId) {
  if (!pendingChainSwitches.has(requestId)) {
    return { success: false, error: "Request not found" };
  }
  const { origin, networkKey, chainId } = pendingChainSwitches.get(requestId);
  const currentNetwork = await getCurrentNetwork();
  return {
    success: true,
    origin,
    chainId,
    networkKey,
    networkName: NETWORK_NAMES[networkKey] || networkKey,
    currentNetworkName: NETWORK_NAMES[currentNetwork] || currentNetwork
  };
}
async function getCurrentNetwork() {
  const network = await load("currentNetwork");
  return network || DEFAULT_NETWORK;
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
async function handleSendRawTransaction(params, origin) {
  if (!params || !params[0]) {
    return { error: { code: -32602, message: "Missing signed transaction parameter" } };
  }
  if (origin && !await isSiteConnected(origin)) {
    return { error: { code: 4100, message: "Unauthorized: site not connected. Call eth_requestAccounts first." } };
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
const pendingSignRequests = /* @__PURE__ */ new Map();
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
  approval.used = true;
  approval.usedAt = Date.now();
  const age = Date.now() - approval.timestamp;
  if (age > REPLAY_PROTECTION_CONFIG.APPROVAL_TIMEOUT) {
    console.warn("🫀 Approval token expired");
    processedApprovals.delete(approvalToken);
    return false;
  }
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
const LAST_GOOD_GAS_PRICE_KEY = "last_good_gas_price";
async function resolveMaxGasPriceGwei(network) {
  try {
    const currentGasPrice = await getGasPrice(network);
    const gwei = Number(BigInt(currentGasPrice)) / 1e9;
    if (Number.isFinite(gwei) && gwei > 0) {
      const cache2 = await load(LAST_GOOD_GAS_PRICE_KEY) || {};
      cache2[network] = { gwei, observedAt: Date.now() };
      await save(LAST_GOOD_GAS_PRICE_KEY, cache2);
      return { maxGasPriceGwei: Math.max(Math.ceil(gwei * 3), 100), source: "live" };
    }
  } catch (error) {
    console.warn("🫀 Gas price fetch failed, falling back to last known price:", error);
  }
  const cache = await load(LAST_GOOD_GAS_PRICE_KEY) || {};
  const cached = cache[network];
  if (cached && Number.isFinite(cached.gwei) && cached.gwei > 0) {
    return { maxGasPriceGwei: Math.max(Math.ceil(cached.gwei * 6), 100), source: "cached" };
  }
  return { maxGasPriceGwei: null, source: "unknown" };
}
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
  const currentNetwork = await load("currentNetwork") || DEFAULT_NETWORK;
  const { maxGasPriceGwei, source: gasCapSource } = await resolveMaxGasPriceGwei(currentNetwork);
  if (gasCapSource !== "live") {
    console.warn(`🫀 Gas price cap derived from ${gasCapSource} price (RPC unavailable)`);
  }
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
    const requestId = crypto.randomUUID();
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
        decrementPendingCount(origin);
        reject(new Error("Transaction request timeout"));
      }
    }, 3e5);
  });
}
async function handleTransactionApproval(requestId, approved, sessionToken, gasPrice, customNonce, txHash, txDetails = null) {
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
    reject(userRejection("User rejected transaction"));
    return { success: false, error: "User rejected" };
  }
  try {
    if (txHash) {
      const walletType = txDetails ? "software" : "hardware";
      console.log(`🫀 ${walletType} wallet transaction already broadcast:`, txHash);
      const activeWallet = await getActiveWallet();
      const network = await getCurrentNetwork();
      const historyEntry = {
        hash: txHash,
        timestamp: Date.now(),
        from: activeWallet.address,
        to: txDetails?.to || txRequest.to || null,
        value: txDetails?.value || txRequest.value || "0",
        data: txDetails?.data || txRequest.data || "0x",
        gasPrice: txDetails?.gasPrice || "0",
        gasLimit: txDetails?.gasLimit || txRequest.gasLimit || txRequest.gas || null,
        nonce: txDetails?.nonce ?? null,
        network,
        status: TX_STATUS.PENDING,
        blockNumber: null,
        type: TX_TYPES.CONTRACT
      };
      if (txDetails?.maxFeePerGas) {
        historyEntry.maxFeePerGas = txDetails.maxFeePerGas;
      }
      if (txDetails?.maxPriorityFeePerGas) {
        historyEntry.maxPriorityFeePerGas = txDetails.maxPriorityFeePerGas;
      }
      await addTxToHistory(activeWallet.address, historyEntry);
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
        title: "Transaction Sent",
        message: `Transaction sent: ${txHash.slice(0, 20)}...`,
        priority: 2
      });
      const provider = await getProvider(network);
      waitForConfirmation({ hash: txHash }, provider, activeWallet.address);
      await logSigningOperation({
        type: "transaction",
        address: activeWallet.address,
        origin,
        method: "eth_sendTransaction",
        success: true,
        txHash,
        walletType
      });
      resolve({ result: txHash });
      return { success: true, txHash };
    }
    let password = await validateSession(sessionToken);
    let signer = null;
    let connectedSigner = null;
    try {
      const unlockResult = await unlockWallet(password, {
        onUpgradeStart: (info) => {
          console.log(`🔐 Auto-upgrading wallet encryption: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()} iterations`);
          chrome.notifications.create({
            type: "basic",
            iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
            title: "🔐 Security Upgrade in Progress",
            message: `Upgrading wallet encryption to ${info.recommendedIterations.toLocaleString()} iterations for enhanced security...`,
            priority: 2
          });
        }
      });
      signer = unlockResult.signer;
      const { upgraded, iterationsBefore, iterationsAfter } = unlockResult;
      if (upgraded) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
          title: "✅ Security Upgrade Complete",
          message: `Wallet encryption upgraded: ${iterationsBefore.toLocaleString()} → ${iterationsAfter.toLocaleString()} iterations`,
          priority: 2
        });
      }
      const network = await getCurrentNetwork();
      const provider = await getProvider(network);
      connectedSigner = signer.connect(provider);
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
      try {
        const fees = await getEip1559Fees(network, gasPrice || null);
        txToSend.maxFeePerGas = fees.maxFeePerGas;
        txToSend.maxPriorityFeePerGas = fees.maxPriorityFeePerGas;
      } catch (error) {
        console.warn("EIP-1559 fee calc failed, falling back to provider fee data:", error);
        const fd = await provider.getFeeData();
        if (fd.maxFeePerGas) {
          txToSend.maxFeePerGas = fd.maxFeePerGas;
          txToSend.maxPriorityFeePerGas = fd.maxPriorityFeePerGas ?? fd.maxFeePerGas / 10n;
        } else if (fd.gasPrice) {
          txToSend.gasPrice = fd.gasPrice;
        }
      }
      const tx = await connectedSigner.sendTransaction(txToSend);
      await addTxToHistory(signer.address, {
        hash: tx.hash,
        timestamp: Date.now(),
        from: signer.address,
        to: txRequest.to || null,
        value: txRequest.value || "0",
        data: tx.data || "0x",
        gasPrice: tx.gasPrice ? tx.gasPrice.toString() : tx.maxFeePerGas ? tx.maxFeePerGas.toString() : "0",
        maxFeePerGas: tx.maxFeePerGas ? tx.maxFeePerGas.toString() : void 0,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? tx.maxPriorityFeePerGas.toString() : void 0,
        gasLimit: tx.gasLimit ? tx.gasLimit.toString() : null,
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
      await logSigningOperation({
        type: "transaction",
        address: signer.address,
        origin,
        method: "eth_sendTransaction",
        success: true,
        txHash: tx.hash,
        walletType: "software"
      });
      resolve({ result: tx.hash });
      return { success: true, txHash: tx.hash };
    } finally {
      if (password) {
        const tempObj = { password };
        secureCleanup(tempObj, ["password"]);
        password = null;
      }
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
    console.error("🫀 Transaction error:", error);
    const sanitizedError = sanitizeErrorMessage(error.message);
    await logSigningOperation({
      type: "transaction",
      address: "unknown",
      origin,
      method: "eth_sendTransaction",
      success: false,
      error: sanitizedError,
      walletType: "software"
    });
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
  if (typeof options.address !== "string" || !isAddress(options.address)) {
    return { error: { code: -32602, message: "Token address is not a valid address" } };
  }
  if (typeof options.symbol !== "string") {
    return { error: { code: -32602, message: "Token symbol must be a string" } };
  }
  const symbol = options.symbol.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g, "").trim().slice(0, 16);
  if (!symbol) {
    return { error: { code: -32602, message: "Token symbol is empty or invalid" } };
  }
  const decimals = Number(options.decimals ?? 18);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) {
    return { error: { code: -32602, message: "Token decimals out of range" } };
  }
  let image = null;
  if (typeof options.image === "string" && options.image.length <= 2048) {
    try {
      if (new URL(options.image).protocol === "https:") {
        image = options.image;
      }
    } catch {
    }
  }
  const tokenInfo = {
    address: options.address.toLowerCase(),
    symbol,
    decimals,
    image
  };
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
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
    reject(userRejection("User rejected token"));
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
async function handleSpeedUpTransaction(address, originalTxHash, sessionToken, gasPriceMultiplier = 1.2, customGasPrice = null) {
  let password = null;
  let signer = null;
  let wallet = null;
  try {
    password = await validateSession(sessionToken);
    const originalTx = await getTxByHash(address, originalTxHash);
    if (!originalTx) {
      return { success: false, error: "Transaction not found" };
    }
    if (originalTx.status !== TX_STATUS.PENDING) {
      return { success: false, error: "Transaction is not pending" };
    }
    const unlockResult = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
    signer = unlockResult.signer;
    const walletAddress = await signer.getAddress();
    if (walletAddress.toLowerCase() !== address.toLowerCase()) {
      console.error("🫀 Address mismatch in speed-up: wallet address does not match request");
      return { success: false, error: "Wallet address mismatch" };
    }
    if (originalTx.from && originalTx.from.toLowerCase() !== walletAddress.toLowerCase()) {
      console.error("🫀 Transaction ownership check failed: transaction does not belong to this wallet");
      return { success: false, error: "Transaction does not belong to this wallet" };
    }
    const network = originalTx.network;
    const provider = await getProvider(network);
    wallet = signer.connect(provider);
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
          console.log("🫀 Detected EIP-1559 transaction from blockchain:", {
            maxFeePerGas: onChainMaxFeePerGas?.toString(),
            maxPriorityFeePerGas: onChainMaxPriorityFeePerGas?.toString()
          });
        }
      }
    } catch (fetchErr) {
      console.warn("🫀 Could not fetch original tx from blockchain:", fetchErr.message);
    }
    const replacementTx = {
      to: originalTx.to,
      value: originalTx.value,
      data: originalTx.data || "0x",
      nonce: originalTx.nonce
    };
    if (originalTx.gasLimit) {
      replacementTx.gasLimit = originalTx.gasLimit;
    }
    let newGasPrice = null;
    let newMaxFeePerGas = null;
    let newMaxPriorityFeePerGas = null;
    if (isEIP1559) {
      const bumpMultiplier = 1125n;
      const bumpDivisor = 1000n;
      const originalMaxFee = onChainMaxFeePerGas || BigInt(originalTx.maxFeePerGas || originalTx.gasPrice || "0");
      const originalPriorityFee = onChainMaxPriorityFeePerGas || BigInt(originalTx.maxPriorityFeePerGas || "0");
      if (customGasPrice) {
        const customFee = BigInt(customGasPrice);
        const minPriorityFee = originalPriorityFee * bumpMultiplier / bumpDivisor;
        const priorityFee = minPriorityFee > 0n ? minPriorityFee : 1000000000n;
        newMaxFeePerGas = customFee;
        newMaxPriorityFeePerGas = priorityFee < customFee ? priorityFee : customFee;
      } else {
        newMaxFeePerGas = originalMaxFee * bumpMultiplier / bumpDivisor;
        newMaxPriorityFeePerGas = originalPriorityFee * bumpMultiplier / bumpDivisor;
        if (newMaxPriorityFeePerGas < 1000000000n) {
          newMaxPriorityFeePerGas = 1000000000n;
        }
      }
      replacementTx.maxFeePerGas = newMaxFeePerGas;
      replacementTx.maxPriorityFeePerGas = newMaxPriorityFeePerGas;
      console.log("🫀 EIP-1559 speed-up:", {
        originalMaxFee: originalMaxFee.toString(),
        originalPriorityFee: originalPriorityFee.toString(),
        newMaxFee: newMaxFeePerGas.toString(),
        newPriorityFee: newMaxPriorityFeePerGas.toString()
      });
    } else {
      if (customGasPrice) {
        newGasPrice = BigInt(customGasPrice);
      } else {
        const originalGasPrice = BigInt(originalTx.gasPrice);
        newGasPrice = originalGasPrice * BigInt(Math.floor(gasPriceMultiplier * 100)) / BigInt(100);
      }
      replacementTx.gasPrice = newGasPrice;
    }
    const tx = await wallet.sendTransaction(replacementTx);
    const historyEntry = {
      hash: tx.hash,
      timestamp: Date.now(),
      from: address,
      to: originalTx.to,
      value: originalTx.value,
      data: originalTx.data || "0x",
      gasPrice: newGasPrice ? newGasPrice.toString() : newMaxFeePerGas ? newMaxFeePerGas.toString() : originalTx.gasPrice,
      gasLimit: originalTx.gasLimit,
      nonce: originalTx.nonce,
      network,
      status: TX_STATUS.PENDING,
      blockNumber: null,
      type: originalTx.type
    };
    if (newMaxFeePerGas) {
      historyEntry.maxFeePerGas = newMaxFeePerGas.toString();
    }
    if (newMaxPriorityFeePerGas) {
      historyEntry.maxPriorityFeePerGas = newMaxPriorityFeePerGas.toString();
    }
    await addTxToHistory(address, historyEntry);
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
  } finally {
    if (password) {
      const tempObj = { password };
      secureCleanup(tempObj, ["password"]);
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
async function handleCancelTransaction(address, originalTxHash, sessionToken, customGasPrice = null) {
  let password = null;
  let signer = null;
  let wallet = null;
  try {
    password = await validateSession(sessionToken);
    const originalTx = await getTxByHash(address, originalTxHash);
    if (!originalTx) {
      return { success: false, error: "Transaction not found" };
    }
    if (originalTx.status !== TX_STATUS.PENDING) {
      return { success: false, error: "Transaction is not pending" };
    }
    const unlockResult = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
    signer = unlockResult.signer;
    const walletAddress = await signer.getAddress();
    if (walletAddress.toLowerCase() !== address.toLowerCase()) {
      console.error("🫀 Address mismatch in cancel: wallet address does not match request");
      return { success: false, error: "Wallet address mismatch" };
    }
    if (originalTx.from && originalTx.from.toLowerCase() !== walletAddress.toLowerCase()) {
      console.error("🫀 Transaction ownership check failed: transaction does not belong to this wallet");
      return { success: false, error: "Transaction does not belong to this wallet" };
    }
    const network = originalTx.network;
    const provider = await getProvider(network);
    wallet = signer.connect(provider);
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
          console.log("🫀 Detected EIP-1559 transaction from blockchain for cancel");
        }
      }
    } catch (fetchErr) {
      console.warn("🫀 Could not fetch original tx from blockchain:", fetchErr.message);
    }
    const cancelTx = {
      to: address,
      // Send to self
      value: "0",
      // Zero value
      data: "0x",
      // Empty data
      nonce: originalTx.nonce,
      gasLimit: 21e3
      // Standard gas limit for simple ETH transfer
    };
    let newGasPrice = null;
    let newMaxFeePerGas = null;
    let newMaxPriorityFeePerGas = null;
    if (isEIP1559) {
      const bumpMultiplier = 1125n;
      const bumpDivisor = 1000n;
      const originalMaxFee = onChainMaxFeePerGas || BigInt(originalTx.maxFeePerGas || originalTx.gasPrice || "0");
      const originalPriorityFee = onChainMaxPriorityFeePerGas || BigInt(originalTx.maxPriorityFeePerGas || "0");
      if (customGasPrice) {
        const customFee = BigInt(customGasPrice);
        const minPriorityFee = originalPriorityFee * bumpMultiplier / bumpDivisor;
        const priorityFee = minPriorityFee > 0n ? minPriorityFee : 1000000000n;
        newMaxFeePerGas = customFee;
        newMaxPriorityFeePerGas = priorityFee < customFee ? priorityFee : customFee;
      } else {
        newMaxFeePerGas = originalMaxFee * bumpMultiplier / bumpDivisor;
        newMaxPriorityFeePerGas = originalPriorityFee * bumpMultiplier / bumpDivisor;
        if (newMaxPriorityFeePerGas < 1000000000n) {
          newMaxPriorityFeePerGas = 1000000000n;
        }
      }
      cancelTx.maxFeePerGas = newMaxFeePerGas;
      cancelTx.maxPriorityFeePerGas = newMaxPriorityFeePerGas;
      console.log("🫀 EIP-1559 cancel:", {
        originalMaxFee: originalMaxFee.toString(),
        originalPriorityFee: originalPriorityFee.toString(),
        newMaxFee: newMaxFeePerGas.toString(),
        newPriorityFee: newMaxPriorityFeePerGas.toString()
      });
    } else {
      if (customGasPrice) {
        newGasPrice = BigInt(customGasPrice);
      } else {
        const originalGasPrice = BigInt(originalTx.gasPrice);
        newGasPrice = originalGasPrice * BigInt(120) / BigInt(100);
      }
      cancelTx.gasPrice = newGasPrice;
    }
    const tx = await wallet.sendTransaction(cancelTx);
    const historyEntry = {
      hash: tx.hash,
      timestamp: Date.now(),
      from: address,
      to: address,
      value: "0",
      data: "0x",
      gasPrice: newGasPrice ? newGasPrice.toString() : newMaxFeePerGas ? newMaxFeePerGas.toString() : originalTx.gasPrice,
      gasLimit: "21000",
      nonce: originalTx.nonce,
      network,
      status: TX_STATUS.PENDING,
      blockNumber: null,
      type: "send"
    };
    if (newMaxFeePerGas) {
      historyEntry.maxFeePerGas = newMaxFeePerGas.toString();
    }
    if (newMaxPriorityFeePerGas) {
      historyEntry.maxPriorityFeePerGas = newMaxPriorityFeePerGas.toString();
    }
    await addTxToHistory(address, historyEntry);
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
  } finally {
    if (password) {
      const tempObj = { password };
      secureCleanup(tempObj, ["password"]);
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
async function getCurrentNetworkGasPrice(network) {
  try {
    const recommendations = await getGasPriceRecommendations(network);
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
    console.error("🫀 Error fetching current gas price:", error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  }
}
async function refreshTransactionStatus(address, txHash, network) {
  try {
    console.log(`🫀 Refreshing tx status: ${txHash} on ${network}`);
    const provider = await getProvider(network);
    const receipt = await provider.getTransactionReceipt(txHash);
    console.log(`🫀 Receipt for ${txHash.slice(0, 10)}...:`, receipt ? "found" : "null");
    if (!receipt) {
      const tx = await provider.getTransaction(txHash);
      console.log(`🫀 Mempool tx for ${txHash.slice(0, 10)}...:`, tx ? "found" : "null");
      if (!tx) {
        console.log(`🫀 Transaction ${txHash.slice(0, 10)}... was DROPPED - marking as failed`);
        await updateTxStatus(
          address,
          txHash,
          TX_STATUS.FAILED,
          null
        );
        return {
          success: true,
          status: "dropped",
          message: "Transaction was dropped from mempool (not confirmed, no longer pending)"
        };
      }
      console.log(`🫀 Transaction ${txHash.slice(0, 10)}... still in mempool`);
      return {
        success: true,
        status: "pending",
        message: "Transaction is still pending on the blockchain"
      };
    }
    let newStatus;
    if (receipt.status === 1) {
      newStatus = TX_STATUS.CONFIRMED;
    } else {
      newStatus = TX_STATUS.FAILED;
    }
    await updateTxStatus(
      address,
      txHash,
      newStatus,
      receipt.blockNumber
    );
    return {
      success: true,
      status: newStatus,
      blockNumber: receipt.blockNumber,
      message: newStatus === TX_STATUS.CONFIRMED ? "Transaction confirmed on blockchain" : "Transaction failed on blockchain"
    };
  } catch (error) {
    console.error("🫀 Error refreshing transaction status:", error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  }
}
async function rebroadcastTransaction(txHash, network) {
  try {
    console.log(`🫀 Rebroadcasting transaction: ${txHash} to all ${network} RPCs`);
    let rawTx = await getRawTransaction(network, txHash);
    if (!rawTx) {
      const provider = await getProvider(network);
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        return {
          success: false,
          error: "Transaction not found in mempool - it may have been dropped or already confirmed"
        };
      }
      try {
        const rawResult = await provider.send("eth_getRawTransactionByHash", [txHash]);
        if (rawResult) {
          rawTx = rawResult;
        }
      } catch (e) {
        console.warn("Could not get raw transaction via RPC:", e.message);
      }
      if (!rawTx) {
        return {
          success: false,
          error: "Cannot get raw transaction data. The RPC nodes may not support this operation."
        };
      }
    }
    const results = await broadcastToAllRpcs(network, rawTx);
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
        error: "Failed to broadcast to any RPC",
        failures: results.failures
      };
    }
  } catch (error) {
    console.error("🫀 Error rebroadcasting transaction:", error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  }
}
const monitoringTransactions = /* @__PURE__ */ new Set();
async function waitForConfirmation(tx, provider, address) {
  const txHash = tx.hash;
  if (monitoringTransactions.has(txHash)) {
    console.log(`🫀 Transaction ${txHash.slice(0, 10)}... already being monitored`);
    return;
  }
  monitoringTransactions.add(txHash);
  const POLL_INTERVAL = 15 * 1e3;
  const MAX_RETRIES = 40;
  try {
    let receipt = null;
    let retries = 0;
    while (!receipt && retries < MAX_RETRIES) {
      try {
        receipt = await provider.getTransactionReceipt(txHash);
        if (receipt) break;
      } catch (rpcError) {
        console.warn(`🫀 RPC error checking tx ${txHash.slice(0, 10)}..., retrying:`, rpcError.message);
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      retries++;
    }
    if (!receipt) {
      console.warn(`🫀 Transaction ${txHash.slice(0, 10)}... confirmation timed out after ${MAX_RETRIES} attempts`);
      return;
    }
    if (receipt.status === 1) {
      await updateTxStatus(
        address,
        txHash,
        TX_STATUS.CONFIRMED,
        receipt.blockNumber
      );
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
        title: "Transaction Confirmed",
        message: `Transaction confirmed in block ${receipt.blockNumber}`,
        priority: 2
      });
    } else {
      await updateTxStatus(
        address,
        txHash,
        TX_STATUS.FAILED,
        receipt.blockNumber
      );
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
        title: "Transaction Failed",
        message: "Transaction was reverted on-chain",
        priority: 2
      });
    }
  } catch (error) {
    console.error("🫀 Error in confirmation monitoring:", error);
  } finally {
    monitoringTransactions.delete(txHash);
  }
}
async function handlePersonalSign(params, origin, method) {
  if (!await isSiteConnected(origin)) {
    return { error: { code: 4100, message: "Not authorized. Please connect your wallet first." } };
  }
  const validation = validateSignRequest(method, params);
  if (!validation.valid) {
    console.warn("🫀 Invalid sign request from origin:", origin, validation.error);
    return {
      error: {
        code: -32602,
        message: "Invalid sign request: " + sanitizeErrorMessage(validation.error)
      }
    };
  }
  const { message, address } = validation.sanitized;
  if (method === "eth_sign") {
    const settings = await load("settings");
    const allowEthSign = settings?.allowEthSign || false;
    if (!allowEthSign) {
      console.warn("🫀 eth_sign request blocked (disabled in settings):", origin);
      return {
        error: {
          code: 4100,
          message: "eth_sign is disabled for security. Use personal_sign instead, or enable eth_sign in wallet settings."
        }
      };
    }
    console.warn("⚠️ eth_sign request approved by settings from:", origin);
  }
  const wallet = await getActiveWallet();
  if (!wallet || wallet.address.toLowerCase() !== address.toLowerCase()) {
    return {
      error: {
        code: 4100,
        message: "Requested address does not match connected account"
      }
    };
  }
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
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
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=sign&requestId=${requestId}&method=${method}`),
      type: "popup",
      width: 400,
      height: 600
    });
    setTimeout(() => {
      if (pendingSignRequests.has(requestId)) {
        pendingSignRequests.delete(requestId);
        reject(new Error("Sign request timeout"));
      }
    }, 3e5);
  });
}
async function handleSignTypedData(params, origin, method) {
  if (!await isSiteConnected(origin)) {
    return { error: { code: 4100, message: "Not authorized. Please connect your wallet first." } };
  }
  const validation = validateSignRequest(method, params);
  if (!validation.valid) {
    console.warn("🫀 Invalid sign typed data request from origin:", origin, validation.error);
    return {
      error: {
        code: -32602,
        message: "Invalid sign request: " + sanitizeErrorMessage(validation.error)
      }
    };
  }
  const { address, typedData } = validation.sanitized;
  const wallet = await getActiveWallet();
  if (!wallet || wallet.address.toLowerCase() !== address.toLowerCase()) {
    return {
      error: {
        code: 4100,
        message: "Requested address does not match connected account"
      }
    };
  }
  const domainChainId = typedData?.domain?.chainId;
  if (domainChainId !== void 0 && domainChainId !== null) {
    let requestedChain;
    try {
      requestedChain = BigInt(domainChainId);
    } catch {
      return { error: { code: -32602, message: "Invalid typed data domain chainId" } };
    }
    const currentChainId = BigInt(await getCurrentChainId());
    if (requestedChain !== currentChainId) {
      return {
        error: {
          code: -32602,
          message: `Typed data domain chainId ${requestedChain} does not match the active chain ${currentChainId}`
        }
      };
    }
  }
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
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
    chrome.windows.create({
      url: chrome.runtime.getURL(`src/popup/popup.html?action=signTyped&requestId=${requestId}&method=${method}`),
      type: "popup",
      width: 400,
      height: 650
    });
    setTimeout(() => {
      if (pendingSignRequests.has(requestId)) {
        pendingSignRequests.delete(requestId);
        reject(new Error("Sign request timeout"));
      }
    }, 3e5);
  });
}
async function handleSignApproval(requestId, approved, sessionToken) {
  if (!pendingSignRequests.has(requestId)) {
    return { success: false, error: "Request not found or expired" };
  }
  const { resolve, reject, origin, method, signRequest, approvalToken } = pendingSignRequests.get(requestId);
  if (!validateAndUseApprovalToken(approvalToken)) {
    pendingSignRequests.delete(requestId);
    reject(new Error("Invalid or already used approval token - possible replay attack"));
    return { success: false, error: "Invalid approval token" };
  }
  pendingSignRequests.delete(requestId);
  if (!approved) {
    reject(userRejection("User rejected the request"));
    return { success: false, error: "User rejected" };
  }
  let password = null;
  let signer = null;
  try {
    password = await validateSession(sessionToken);
    const unlockResult = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
    signer = unlockResult.signer;
    let signature;
    if (method === "personal_sign" || method === "eth_sign") {
      signature = await personalSign(signer, signRequest.message);
    } else if (method.startsWith("eth_signTypedData")) {
      signature = await signTypedData(signer, signRequest.typedData);
    } else {
      throw new Error(`Unsupported signing method: ${method}`);
    }
    const signerAddress = await signer.getAddress();
    await logSigningOperation({
      type: method.startsWith("eth_signTypedData") ? "typed_data" : "personal_sign",
      address: signerAddress,
      origin,
      method,
      success: true,
      walletType: "software"
    });
    console.log("🫀 Message signed for origin:", origin);
    resolve({ result: signature });
    return { success: true, signature };
  } catch (error) {
    console.error("🫀 Error signing message:", error);
    await logSigningOperation({
      type: method.startsWith("eth_signTypedData") ? "typed_data" : "personal_sign",
      address: signRequest.address || "unknown",
      origin,
      method,
      success: false,
      error: error.message,
      walletType: "software"
    });
    reject(error);
    return { success: false, error: error.message };
  } finally {
    if (password) {
      const tempObj = { password };
      secureCleanup(tempObj, ["password"]);
      password = null;
    }
    if (signer) {
      secureCleanupSigner(signer);
      signer = null;
    }
  }
}
async function handleLedgerSignApproval(requestId, approved, signature) {
  if (!pendingSignRequests.has(requestId)) {
    return { success: false, error: "Request not found or expired" };
  }
  const { resolve, reject, origin, method, signRequest, approvalToken } = pendingSignRequests.get(requestId);
  if (!validateAndUseApprovalToken(approvalToken)) {
    pendingSignRequests.delete(requestId);
    reject(new Error("Invalid or already used approval token"));
    return { success: false, error: "Invalid approval token" };
  }
  pendingSignRequests.delete(requestId);
  if (!approved) {
    reject(userRejection("User rejected the request"));
    return { success: false, error: "User rejected" };
  }
  try {
    await logSigningOperation({
      type: method && method.startsWith("eth_signTypedData") ? "typed_data" : "personal_sign",
      address: signRequest?.address || "ledger",
      origin,
      method: method || "personal_sign",
      success: true,
      walletType: "hardware"
    });
    console.log("🫀 Ledger message signed for origin:", origin);
    resolve({ result: signature });
    return { success: true, signature };
  } catch (error) {
    console.error("🫀 Error processing Ledger signature:", error);
    await logSigningOperation({
      type: method && method.startsWith("eth_signTypedData") ? "typed_data" : "personal_sign",
      address: signRequest?.address || "ledger",
      origin,
      method: method || "personal_sign",
      success: false,
      error: error.message,
      walletType: "hardware"
    });
    reject(error);
    return { success: false, error: error.message };
  }
}
function getSignRequest(requestId) {
  const entry = pendingSignRequests.get(requestId);
  if (!entry) return null;
  const { origin, method, signRequest } = entry;
  return { origin, method, signRequest };
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const PRIVILEGED_MESSAGES = /* @__PURE__ */ new Set([
    "CONNECTION_APPROVAL",
    "TRANSACTION_APPROVAL",
    "SIGN_APPROVAL",
    "SIGN_APPROVAL_LEDGER",
    "TOKEN_ADD_APPROVAL",
    "CHAIN_SWITCH_APPROVAL",
    "CREATE_SESSION",
    "INVALIDATE_SESSION",
    "INVALIDATE_ALL_SESSIONS",
    "DISCONNECT_SITE",
    "SAVE_TX",
    "SAVE_AND_MONITOR_TX",
    "CLEAR_TX_HISTORY",
    "SPEED_UP_TX",
    "CANCEL_TX",
    "SPEED_UP_TX_COMPLETE",
    "CANCEL_TX_COMPLETE",
    "GET_SIGNING_AUDIT_LOG",
    "GET_TX_HISTORY",
    "GET_PENDING_TX_COUNT",
    "GET_PENDING_TXS",
    "GET_TX_BY_HASH",
    "REFRESH_TX_STATUS",
    "REBROADCAST_TX",
    "GET_CURRENT_GAS_PRICE",
    "ACTIVE_WALLET_CHANGED",
    "NETWORK_CHANGED",
    "GET_CONNECTION_REQUEST",
    "GET_CONNECTED_SITES",
    "GET_TRANSACTION_REQUEST",
    "GET_SIGN_REQUEST",
    "GET_TOKEN_ADD_REQUEST",
    "GET_CHAIN_SWITCH_REQUEST"
  ]);
  const extensionOrigin = `chrome-extension://${chrome.runtime.id}/`;
  const isFromExtensionPage = typeof sender.url === "string" && sender.url.startsWith(extensionOrigin);
  if (PRIVILEGED_MESSAGES.has(message.type) && !isFromExtensionPage) {
    console.warn("🫀 SECURITY: Blocked privileged message from content script:", message.type, sender.url);
    sendResponse({ success: false, error: "Unauthorized: privileged messages must come from extension pages" });
    return true;
  }
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
          await notifyAccountsChanged();
          sendResponse({ success: true });
          break;
        case "ACTIVE_WALLET_CHANGED":
          await notifyAccountsChanged();
          sendResponse({ success: true });
          break;
        case "NETWORK_CHANGED": {
          const newChainId = CHAIN_IDS[message.network];
          if (newChainId) {
            notifyChainChanged(newChainId);
          }
          sendResponse({ success: true });
          break;
        }
        case "TRANSACTION_APPROVAL":
          const txApprovalResult = await handleTransactionApproval(message.requestId, message.approved, message.sessionToken, message.gasPrice, message.customNonce, message.txHash, message.txDetails);
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
        case "CHAIN_SWITCH_APPROVAL":
          const chainSwitchResult = await handleChainSwitchApproval(message.requestId, message.approved);
          sendResponse(chainSwitchResult);
          break;
        case "SIGN_APPROVAL":
          const signApprovalResult = await handleSignApproval(
            message.requestId,
            message.approved,
            message.sessionToken
          );
          console.log("🫀 Sending sign approval response:", signApprovalResult);
          sendResponse(signApprovalResult);
          break;
        case "SIGN_APPROVAL_LEDGER":
          const ledgerSignResult = await handleLedgerSignApproval(
            message.requestId,
            message.approved,
            message.signature
          );
          console.log("🫀 Sending Ledger sign approval response:", ledgerSignResult);
          sendResponse(ledgerSignResult);
          break;
        case "GET_SIGN_REQUEST":
          const signRequestInfo = getSignRequest(message.requestId);
          console.log("🫀 Sending sign request info:", signRequestInfo);
          sendResponse(signRequestInfo);
          break;
        case "GET_TOKEN_ADD_REQUEST":
          const tokenRequestInfo = getTokenAddRequest(message.requestId);
          console.log("🫀 Sending token add request info:", tokenRequestInfo);
          sendResponse(tokenRequestInfo);
          break;
        case "GET_CHAIN_SWITCH_REQUEST":
          const chainSwitchInfo = await getChainSwitchRequest(message.requestId);
          sendResponse(chainSwitchInfo);
          break;
        // Signing Audit Log
        case "GET_SIGNING_AUDIT_LOG":
          const signingLog = await getSigningAuditLog();
          sendResponse({ success: true, log: signingLog });
          break;
        // Transaction History
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
        case "SAVE_TX":
          await addTxToHistory(message.address, message.transaction);
          sendResponse({ success: true });
          break;
        case "SAVE_AND_MONITOR_TX":
          await addTxToHistory(message.address, message.transaction);
          (async () => {
            try {
              const network = message.transaction.network || DEFAULT_NETWORK;
              const provider = await getProvider(network);
              const tx = { hash: message.transaction.hash };
              await waitForConfirmation(tx, provider, message.address);
            } catch (error) {
              console.error("Error monitoring transaction:", error);
            }
          })();
          sendResponse({ success: true });
          break;
        case "CLEAR_TX_HISTORY":
          await clearTxHistory(message.address);
          sendResponse({ success: true });
          break;
        case "GET_CURRENT_GAS_PRICE":
          const gasPriceResult = await getCurrentNetworkGasPrice(message.network);
          sendResponse(gasPriceResult);
          break;
        case "REFRESH_TX_STATUS":
          const refreshResult = await refreshTransactionStatus(
            message.address,
            message.txHash,
            message.network
          );
          sendResponse(refreshResult);
          break;
        case "REBROADCAST_TX":
          const rebroadcastResult = await rebroadcastTransaction(
            message.txHash,
            message.network
          );
          sendResponse(rebroadcastResult);
          break;
        case "SPEED_UP_TX":
          const speedUpResult = await handleSpeedUpTransaction(
            message.address,
            message.txHash,
            message.sessionToken,
            message.gasPriceMultiplier || 1.2,
            message.customGasPrice || null
          );
          sendResponse(speedUpResult);
          break;
        case "CANCEL_TX":
          const cancelResult = await handleCancelTransaction(
            message.address,
            message.txHash,
            message.sessionToken,
            message.customGasPrice || null
          );
          sendResponse(cancelResult);
          break;
        case "SPEED_UP_TX_COMPLETE":
          try {
            const network = await getCurrentNetwork();
            const historyEntry = {
              hash: message.newTxHash,
              timestamp: Date.now(),
              from: message.address,
              to: message.txDetails.to,
              value: message.txDetails.value,
              data: message.txDetails.data || "0x",
              gasPrice: message.txDetails.gasPrice,
              gasLimit: message.txDetails.gasLimit,
              nonce: message.txDetails.nonce,
              network,
              status: TX_STATUS.PENDING,
              blockNumber: null,
              type: TX_TYPES.CONTRACT
            };
            if (message.txDetails.maxFeePerGas) {
              historyEntry.maxFeePerGas = message.txDetails.maxFeePerGas;
            }
            if (message.txDetails.maxPriorityFeePerGas) {
              historyEntry.maxPriorityFeePerGas = message.txDetails.maxPriorityFeePerGas;
            }
            await addTxToHistory(message.address, historyEntry);
            await updateTxStatus(message.address, message.originalTxHash, TX_STATUS.FAILED, null);
            const provider = await getProvider(network);
            waitForConfirmation({ hash: message.newTxHash }, provider, message.address);
            chrome.notifications.create({
              type: "basic",
              iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
              title: "Transaction Sped Up",
              message: `New TX: ${message.newTxHash.slice(0, 20)}...`,
              priority: 2
            });
            sendResponse({ success: true, txHash: message.newTxHash });
          } catch (error) {
            console.error("Error saving speed-up transaction:", error);
            sendResponse({ success: false, error: error.message });
          }
          break;
        case "CANCEL_TX_COMPLETE":
          try {
            const network = await getCurrentNetwork();
            const cancelHistoryEntry = {
              hash: message.newTxHash,
              timestamp: Date.now(),
              from: message.address,
              to: message.address,
              value: "0",
              data: "0x",
              gasPrice: message.txDetails.gasPrice,
              gasLimit: "21000",
              nonce: message.txDetails.nonce,
              network,
              status: TX_STATUS.PENDING,
              blockNumber: null,
              type: "send"
            };
            if (message.txDetails.maxFeePerGas) {
              cancelHistoryEntry.maxFeePerGas = message.txDetails.maxFeePerGas;
            }
            if (message.txDetails.maxPriorityFeePerGas) {
              cancelHistoryEntry.maxPriorityFeePerGas = message.txDetails.maxPriorityFeePerGas;
            }
            await addTxToHistory(message.address, cancelHistoryEntry);
            await updateTxStatus(message.address, message.originalTxHash, TX_STATUS.FAILED, null);
            const provider = await getProvider(network);
            waitForConfirmation({ hash: message.newTxHash }, provider, message.address);
            chrome.notifications.create({
              type: "basic",
              iconUrl: chrome.runtime.getURL("assets/icons/icon-128.png"),
              title: "Transaction Cancelled",
              message: "Cancellation transaction sent",
              priority: 2
            });
            sendResponse({ success: true, txHash: message.newTxHash });
          } catch (error) {
            console.error("Error saving cancel transaction:", error);
            sendResponse({ success: false, error: error.message });
          }
          break;
        case "UPDATE_RPC_PRIORITIES":
          if (message.network && message.priorities) {
            updateRpcPriorities(message.network, message.priorities);
            console.log(`🫀 Updated RPC priorities for ${message.network}`);
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: "Missing network or priorities" });
          }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRBbGxIaXN0b3J5KCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBsb2FkKFRYX0hJU1RPUllfS0VZKTtcclxuICByZXR1cm4gaGlzdG9yeSB8fCB7fTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpIHtcclxuICBhd2FpdCBzYXZlKFRYX0hJU1RPUllfS0VZLCBoaXN0b3J5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgYSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgdHhEYXRhKSB7XHJcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRUeEhpc3RvcnlTZXR0aW5ncygpO1xyXG4gIGlmICghc2V0dGluZ3MuZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuOyAvLyBIaXN0b3J5IGRpc2FibGVkXHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBhZGRyZXNzIGhpc3RvcnkgaWYgZG9lc24ndCBleGlzdFxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0gPSB7IHRyYW5zYWN0aW9uczogW10gfTtcclxuICB9XHJcblxyXG4gIC8vIEFkZCBuZXcgdHJhbnNhY3Rpb24gYXQgYmVnaW5uaW5nIChuZXdlc3QgZmlyc3QpXHJcbiAgY29uc3QgdHhFbnRyeSA9IHtcclxuICAgIGhhc2g6IHR4RGF0YS5oYXNoLFxyXG4gICAgdGltZXN0YW1wOiB0eERhdGEudGltZXN0YW1wIHx8IERhdGUubm93KCksXHJcbiAgICBmcm9tOiB0eERhdGEuZnJvbS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgdG86IHR4RGF0YS50byA/IHR4RGF0YS50by50b0xvd2VyQ2FzZSgpIDogbnVsbCxcclxuICAgIHZhbHVlOiB0eERhdGEudmFsdWUgfHwgJzAnLFxyXG4gICAgZGF0YTogdHhEYXRhLmRhdGEgfHwgJzB4JyxcclxuICAgIGdhc1ByaWNlOiB0eERhdGEuZ2FzUHJpY2UsXHJcbiAgICBnYXNMaW1pdDogdHhEYXRhLmdhc0xpbWl0LFxyXG4gICAgbm9uY2U6IHR4RGF0YS5ub25jZSxcclxuICAgIG5ldHdvcms6IHR4RGF0YS5uZXR3b3JrLFxyXG4gICAgc3RhdHVzOiB0eERhdGEuc3RhdHVzIHx8IFRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgYmxvY2tOdW1iZXI6IHR4RGF0YS5ibG9ja051bWJlciB8fCBudWxsLFxyXG4gICAgdHlwZTogdHhEYXRhLnR5cGUgfHwgVFhfVFlQRVMuQ09OVFJBQ1RcclxuICB9O1xyXG5cclxuICAvLyBTdG9yZSBFSVAtMTU1OSBmaWVsZHMgaWYgcHJlc2VudCAoZm9yIHByb3BlciBzcGVlZC11cC9jYW5jZWwpXHJcbiAgaWYgKHR4RGF0YS5tYXhGZWVQZXJHYXMpIHtcclxuICAgIHR4RW50cnkubWF4RmVlUGVyR2FzID0gdHhEYXRhLm1heEZlZVBlckdhcztcclxuICB9XHJcbiAgaWYgKHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgdHhFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICB9XHJcblxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMudW5zaGlmdCh0eEVudHJ5KTtcclxuXHJcbiAgLy8gRW5mb3JjZSBtYXggbGltaXQgKEZJRk8gLSByZW1vdmUgb2xkZXN0KVxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLmxlbmd0aCA+IE1BWF9UWFNfUEVSX0FERFJFU1MpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgPSBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLnNsaWNlKDAsIE1BWF9UWFNfUEVSX0FERFJFU1MpO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZUFsbEhpc3RvcnkoaGlzdG9yeSk7XHJcbiAgLy8gVHJhbnNhY3Rpb24gYWRkZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIHN0YXR1cywgYmxvY2tOdW1iZXIgPSBudWxsKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eEluZGV4ID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5maW5kSW5kZXgoXHJcbiAgICB0eCA9PiB0eC5oYXNoLnRvTG93ZXJDYXNlKCkgPT09IHR4SGFzaC50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuXHJcbiAgaWYgKHR4SW5kZXggPT09IC0xKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLnN0YXR1cyA9IHN0YXR1cztcclxuICBpZiAoYmxvY2tOdW1iZXIgIT09IG51bGwpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnNbdHhJbmRleF0uYmxvY2tOdW1iZXIgPSBibG9ja051bWJlcjtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbnMgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhzKGFkZHJlc3MpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maWx0ZXIodHggPT4gdHguc3RhdHVzID09PSBUWF9TVEFUVVMuUEVORElORyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbiBjb3VudCBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdUeENvdW50KGFkZHJlc3MpIHtcclxuICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKTtcclxuICByZXR1cm4gcGVuZGluZ1R4cy5sZW5ndGg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFR4QnlIYXNoKGFkZHJlc3MsIHR4SGFzaCkge1xyXG4gIGNvbnN0IHR4cyA9IGF3YWl0IGdldFR4SGlzdG9yeShhZGRyZXNzKTtcclxuICByZXR1cm4gdHhzLmZpbmQodHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyVHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKGhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgZGVsZXRlIGhpc3RvcnlbYWRkcmVzc0xvd2VyXTtcclxuICAgIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbiAgfVxyXG59XHJcblxyXG4iLCIvKipcclxuICogY29yZS90eFZhbGlkYXRpb24uanNcclxuICpcclxuICogVHJhbnNhY3Rpb24gdmFsaWRhdGlvbiB1dGlsaXRpZXMgZm9yIHNlY3VyaXR5XHJcbiAqIFZhbGlkYXRlcyBhbGwgdHJhbnNhY3Rpb24gcGFyYW1ldGVycyBiZWZvcmUgcHJvY2Vzc2luZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgdHJhbnNhY3Rpb24gcmVxdWVzdCBmcm9tIGEgZEFwcFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHhSZXF1ZXN0IC0gVHJhbnNhY3Rpb24gcmVxdWVzdCBvYmplY3RcclxuICogQHBhcmFtIHtudW1iZXJ8bnVsbH0gbWF4R2FzUHJpY2VHd2VpIC0gTWF4aW11bSBhbGxvd2VkIGdhcyBwcmljZSBpbiBHd2VpIChkZWZhdWx0IDEwMDApLlxyXG4gKiAgICAgICAgUGFzcyBudWxsIHRvIHNraXAgdGhlIGdhcyBwcmljZSBib3VuZCBlbnRpcmVseSAtIG9ubHkgYXBwcm9wcmlhdGUgd2hlbiB0aGVcclxuICogICAgICAgIGNhbGxlciBnZW51aW5lbHkgY2Fubm90IGRldGVybWluZSB0aGUgbmV0d29yayBwcmljZSwgc2luY2UgdGhlIGFsdGVybmF0aXZlIGlzXHJcbiAqICAgICAgICBhbiBhcmJpdHJhcnkgaW52ZW50ZWQgY29uc3RhbnQuXHJcbiAqIEByZXR1cm5zIHt7IHZhbGlkOiBib29sZWFuLCBlcnJvcnM6IHN0cmluZ1tdLCBzYW5pdGl6ZWQ6IE9iamVjdCB9fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0KHR4UmVxdWVzdCwgbWF4R2FzUHJpY2VHd2VpID0gMTAwMCkge1xyXG4gIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gIGNvbnN0IHNhbml0aXplZCA9IHt9O1xyXG5cclxuICAvLyBWYWxpZGF0ZSAndG8nIGFkZHJlc3MgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QudG8gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudG8gIT09IG51bGwpIHtcclxuICAgIGlmICh0eXBlb2YgdHhSZXF1ZXN0LnRvICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC50bykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTm9ybWFsaXplIHRvIGNoZWNrc3VtIGFkZHJlc3NcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQudG8gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QudG8pO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2Zyb20nIGFkZHJlc3MgaWYgcHJlc2VudCAoc2hvdWxkIG1hdGNoIHdhbGxldCBhZGRyZXNzKVxyXG4gIGlmICh0eFJlcXVlc3QuZnJvbSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5mcm9tICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5mcm9tICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleEFkZHJlc3ModHhSZXF1ZXN0LmZyb20pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQuZnJvbSA9IGV0aGVycy5nZXRBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3ZhbHVlJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QudmFsdWUgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudmFsdWUgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC52YWx1ZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB2YWx1ZUJpZ0ludCA9IEJpZ0ludCh0eFJlcXVlc3QudmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZUJpZ0ludCA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQudmFsdWUgPSB0eFJlcXVlc3QudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHNhbml0aXplZC52YWx1ZSA9ICcweDAnOyAvLyBEZWZhdWx0IHRvIDBcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdkYXRhJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5kYXRhICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5kYXRhICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleERhdGEodHhSZXF1ZXN0LmRhdGEpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImRhdGFcIiBmaWVsZCBtdXN0IGJlIHZhbGlkIGhleCBkYXRhJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzYW5pdGl6ZWQuZGF0YSA9IHR4UmVxdWVzdC5kYXRhO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQuZGF0YSA9ICcweCc7IC8vIERlZmF1bHQgdG8gZW1wdHkgZGF0YVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2dhcycgb3IgJ2dhc0xpbWl0JyBmaWVsZFxyXG4gIC8vIFNFQ1VSSVRZOiBSZWFzb25hYmxlIG1heGltdW0gaXMgMTBNIGdhcyB0byBwcmV2ZW50IGZlZSBzY2Ftc1xyXG4gIC8vIE1vc3QgdHJhbnNhY3Rpb25zOiAyMWstMjAwayBnYXMuIENvbXBsZXggRGVGaTogMjAway0xTSBnYXMuXHJcbiAgLy8gRXRoZXJldW0vUHVsc2VDaGFpbiBibG9jayBsaW1pdCBpcyB+MzBNLCBidXQgc2luZ2xlIFRYIHJhcmVseSBuZWVkcyA+MTBNXHJcbiAgaWYgKHR4UmVxdWVzdC5nYXMgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNMaW1pdCA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzKTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBsb3cgKG1pbmltdW0gMjEwMDApJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnYXNMaW1pdCA+IDEwMDAwMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgbGltaXQgdG9vIGhpZ2ggKG1heGltdW0gMTAwMDAwMDApLiBNb3N0IHRyYW5zYWN0aW9ucyBuZWVkIDwxTSBnYXMuJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXMgPSB0eFJlcXVlc3QuZ2FzO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzTGltaXQgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzTGltaXQgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5nYXNMaW1pdCkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNMaW1pdCA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzTGltaXQpO1xyXG4gICAgICAgIGlmIChnYXNMaW1pdCA8IDIxMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAxMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGhpZ2ggKG1heGltdW0gMTAwMDAwMDApLiBNb3N0IHRyYW5zYWN0aW9ucyBuZWVkIDwxTSBnYXMuJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNMaW1pdCA9IHR4UmVxdWVzdC5nYXNMaW1pdDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdnYXNQcmljZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzUHJpY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzUHJpY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5nYXNQcmljZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNQcmljZSA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzUHJpY2UpO1xyXG4gICAgICAgIGlmIChnYXNQcmljZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNQcmljZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobWF4R2FzUHJpY2VHd2VpICE9PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICBnYXNQcmljZSA+IEJpZ0ludChtYXhHYXNQcmljZUd3ZWkpICogQmlnSW50KCcxMDAwMDAwMDAwJykpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKGBJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZXhjZWVkcyBtYXhpbXVtIG9mICR7bWF4R2FzUHJpY2VHd2VpfSBHd2VpYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNQcmljZSA9IHR4UmVxdWVzdC5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdub25jZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5ub25jZSkgJiYgdHlwZW9mIHR4UmVxdWVzdC5ub25jZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIG9yIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJyBcclxuICAgICAgICAgID8gQmlnSW50KHR4UmVxdWVzdC5ub25jZSkgXHJcbiAgICAgICAgICA6IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpO1xyXG4gICAgICAgIGlmIChub25jZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9uY2UgPiBCaWdJbnQoJzkwMDcxOTkyNTQ3NDA5OTEnKSkgeyAvLyBKYXZhU2NyaXB0IHNhZmUgaW50ZWdlciBtYXhcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgdW5yZWFzb25hYmx5IGhpZ2gnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLm5vbmNlID0gdHhSZXF1ZXN0Lm5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gbXVzdCBoYXZlIGVpdGhlciAndG8nIG9yICdkYXRhJyAoY29udHJhY3QgY3JlYXRpb24pXHJcbiAgaWYgKCFzYW5pdGl6ZWQudG8gJiYgKCFzYW5pdGl6ZWQuZGF0YSB8fCBzYW5pdGl6ZWQuZGF0YSA9PT0gJzB4JykpIHtcclxuICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBtdXN0IGhhdmUgXCJ0b1wiIGFkZHJlc3Mgb3IgXCJkYXRhXCIgZm9yIGNvbnRyYWN0IGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnMsXHJcbiAgICBzYW5pdGl6ZWRcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIEV0aGVyZXVtIGFkZHJlc3MgKGhleCBmb3JtYXQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhZGRyZXNzIC0gQWRkcmVzcyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhBZGRyZXNzKGFkZHJlc3MpIHtcclxuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSA0MiBjaGFyYWN0ZXJzOiAweCArIDQwIGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdezQwfSQvLnRlc3QoYWRkcmVzcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBoZXggdmFsdWUgKGZvciBhbW91bnRzLCBnYXMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEhleCB2YWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBzdGFydCB3aXRoIDB4IGFuZCBjb250YWluIG9ubHkgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0rJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaGV4IGRhdGEgKGZvciB0cmFuc2FjdGlvbiBkYXRhIGZpZWxkKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIEhleCBkYXRhIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleERhdGEoZGF0YSkge1xyXG4gIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDB4IG9yIDB4IGZvbGxvd2VkIGJ5IGV2ZW4gbnVtYmVyIG9mIGhleCBkaWdpdHNcclxuICBpZiAoZGF0YSA9PT0gJzB4JykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSokLy50ZXN0KGRhdGEpICYmIGRhdGEubGVuZ3RoICUgMiA9PT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBhbiBlcnJvciBtZXNzYWdlIGZvciBzYWZlIGRpc3BsYXlcclxuICogUmVtb3ZlcyBhbnkgSFRNTCwgc2NyaXB0cywgYW5kIGNvbnRyb2wgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUVycm9yTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiA1MDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgNDk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGNvcmUvc2lnbmluZy5qc1xyXG4gKlxyXG4gKiBNZXNzYWdlIHNpZ25pbmcgZnVuY3Rpb25hbGl0eSBmb3IgRUlQLTE5MSBhbmQgRUlQLTcxMlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogU2lnbnMgYSBtZXNzYWdlIHVzaW5nIEVJUC0xOTEgKHBlcnNvbmFsX3NpZ24pXHJcbiAqIFRoaXMgcHJlcGVuZHMgXCJcXHgxOUV0aGVyZXVtIFNpZ25lZCBNZXNzYWdlOlxcblwiICsgbGVuKG1lc3NhZ2UpIHRvIHRoZSBtZXNzYWdlXHJcbiAqIGJlZm9yZSBzaWduaW5nLCB3aGljaCBwcmV2ZW50cyBzaWduaW5nIGFyYml0cmFyeSB0cmFuc2FjdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBzaWduIChoZXggc3RyaW5nIG9yIFVURi04IHN0cmluZylcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBlcnNvbmFsU2lnbihzaWduZXIsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25NZXNzYWdlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWQsIGRlY29kZSBpdCBmaXJzdFxyXG4gICAgLy8gZXRoZXJzLmpzIHNpZ25NZXNzYWdlIGV4cGVjdHMgYSBzdHJpbmcgb3IgVWludDhBcnJheVxyXG4gICAgbGV0IG1lc3NhZ2VUb1NpZ24gPSBtZXNzYWdlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIC8vIEhleCBwYXlsb2FkOiBzaWduIHRoZSByYXcgYnl0ZXMuIGRBcHBzIHJlY292ZXIgdGhlIGFkZHJlc3MgYWdhaW5zdCB0aGVcclxuICAgICAgLy8gYnl0ZXMsIHNvIHNpZ25pbmcgdGhlIGhleCBzdHJpbmcncyBBU0NJSSBjaGFyYWN0ZXJzIChvciBhbnl0aGluZyBlbHNlKVxyXG4gICAgICAvLyBwcm9kdWNlcyBhIHNpZ25hdHVyZSB0aGF0IG5ldmVyIHZlcmlmaWVzLiBGb3IgdmFsaWQgVVRGLTggcGF5bG9hZHMgdGhlXHJcbiAgICAgIC8vIHNpZ25hdHVyZSBvdmVyIHRoZSBieXRlcyBpcyBpZGVudGljYWwgdG8gb25lIG92ZXIgdGhlIGRlY29kZWQgc3RyaW5nLlxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIG1lc3NhZ2VUb1NpZ24gPSBldGhlcnMuZ2V0Qnl0ZXMobWVzc2FnZSk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIE5vdCBhY3R1YWxseSB2YWxpZCBoZXgg4oCUIHNpZ24gdGhlIGxpdGVyYWwgc3RyaW5nXHJcbiAgICAgICAgbWVzc2FnZVRvU2lnbiA9IG1lc3NhZ2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTaWduIHRoZSBtZXNzYWdlIChldGhlcnMuanMgYXV0b21hdGljYWxseSBhcHBsaWVzIEVJUC0xOTEgZm9ybWF0KVxyXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2lnbmVyLnNpZ25NZXNzYWdlKG1lc3NhZ2VUb1NpZ24pO1xyXG5cclxuICAgIHJldHVybiBzaWduYXR1cmU7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHNpZ24gbWVzc2FnZTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFNpZ25zIHR5cGVkIGRhdGEgdXNpbmcgRUlQLTcxMlxyXG4gKiBVc2VkIGJ5IGRBcHBzIGZvciBzdHJ1Y3R1cmVkIGRhdGEgc2lnbmluZyAocGVybWl0cywgbWV0YS10cmFuc2FjdGlvbnMsIGV0Yy4pXHJcbiAqXHJcbiAqIEBwYXJhbSB7ZXRoZXJzLldhbGxldH0gc2lnbmVyIC0gV2FsbGV0IGluc3RhbmNlIHRvIHNpZ24gd2l0aFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHlwZWREYXRhIC0gRUlQLTcxMiB0eXBlZCBkYXRhIG9iamVjdCB3aXRoIGRvbWFpbiwgdHlwZXMsIGFuZCBtZXNzYWdlXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFNpZ25hdHVyZSAoMHgtcHJlZml4ZWQgaGV4IHN0cmluZylcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduVHlwZWREYXRhKHNpZ25lciwgdHlwZWREYXRhKSB7XHJcbiAgaWYgKCFzaWduZXIgfHwgdHlwZW9mIHNpZ25lci5zaWduVHlwZWREYXRhICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIXR5cGVkRGF0YSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdUeXBlZCBkYXRhIGlzIHJlcXVpcmVkJyk7XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSB0eXBlZCBkYXRhIHN0cnVjdHVyZVxyXG4gIGlmICghdHlwZWREYXRhLmRvbWFpbiB8fCAhdHlwZWREYXRhLnR5cGVzIHx8ICF0eXBlZERhdGEubWVzc2FnZSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEVJUC03MTIgdHlwZWQgZGF0YTogbWlzc2luZyBkb21haW4sIHR5cGVzLCBvciBtZXNzYWdlJyk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gRXh0cmFjdCBwcmltYXJ5VHlwZSAoaWYgbm90IHByb3ZpZGVkLCB0cnkgdG8gaW5mZXIgaXQpXHJcbiAgICBsZXQgcHJpbWFyeVR5cGUgPSB0eXBlZERhdGEucHJpbWFyeVR5cGU7XHJcblxyXG4gICAgaWYgKCFwcmltYXJ5VHlwZSkge1xyXG4gICAgICAvLyBUcnkgdG8gaW5mZXIgcHJpbWFyeSB0eXBlIGZyb20gdHlwZXMgb2JqZWN0XHJcbiAgICAgIC8vIEl0J3MgdGhlIHR5cGUgdGhhdCdzIG5vdCBcIkVJUDcxMkRvbWFpblwiXHJcbiAgICAgIGNvbnN0IHR5cGVOYW1lcyA9IE9iamVjdC5rZXlzKHR5cGVkRGF0YS50eXBlcykuZmlsdGVyKHQgPT4gdCAhPT0gJ0VJUDcxMkRvbWFpbicpO1xyXG4gICAgICBpZiAodHlwZU5hbWVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIHByaW1hcnlUeXBlID0gdHlwZU5hbWVzWzBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGluZmVyIHByaW1hcnlUeXBlIC0gcGxlYXNlIHNwZWNpZnkgaXQgZXhwbGljaXRseScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgdGhhdCBwcmltYXJ5VHlwZSBleGlzdHMgaW4gdHlwZXNcclxuICAgIGlmICghdHlwZWREYXRhLnR5cGVzW3ByaW1hcnlUeXBlXSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByaW1hcnkgdHlwZSBcIiR7cHJpbWFyeVR5cGV9XCIgbm90IGZvdW5kIGluIHR5cGVzIGRlZmluaXRpb25gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaWduIHVzaW5nIGV0aGVycy5qcyBzaWduVHlwZWREYXRhXHJcbiAgICAvLyBldGhlcnMgdjYgdXNlczogc2lnblR5cGVkRGF0YShkb21haW4sIHR5cGVzLCB2YWx1ZSlcclxuICAgIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IHNpZ25lci5zaWduVHlwZWREYXRhKFxyXG4gICAgICB0eXBlZERhdGEuZG9tYWluLFxyXG4gICAgICB0eXBlZERhdGEudHlwZXMsXHJcbiAgICAgIHR5cGVkRGF0YS5tZXNzYWdlXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBzaWduYXR1cmU7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHNpZ24gdHlwZWQgZGF0YTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhIG1lc3NhZ2Ugc2lnbmluZyByZXF1ZXN0XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgLSBSUEMgbWV0aG9kIChwZXJzb25hbF9zaWduLCBldGhfc2lnblR5cGVkRGF0YV92NCwgZXRjLilcclxuICogQHBhcmFtIHtBcnJheX0gcGFyYW1zIC0gUlBDIHBhcmFtZXRlcnNcclxuICogQHJldHVybnMge09iamVjdH0geyB2YWxpZDogYm9vbGVhbiwgZXJyb3I/OiBzdHJpbmcsIHNhbml0aXplZD86IE9iamVjdCB9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTaWduUmVxdWVzdChtZXRob2QsIHBhcmFtcykge1xyXG4gIGlmICghbWV0aG9kIHx8ICFwYXJhbXMgfHwgIUFycmF5LmlzQXJyYXkocGFyYW1zKSkge1xyXG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcmVxdWVzdCBmb3JtYXQnIH07XHJcbiAgfVxyXG5cclxuICBzd2l0Y2ggKG1ldGhvZCkge1xyXG4gICAgY2FzZSAncGVyc29uYWxfc2lnbic6XHJcbiAgICBjYXNlICdldGhfc2lnbic6IC8vIE5vdGU6IGV0aF9zaWduIGlzIGRhbmdlcm91cyBhbmQgc2hvdWxkIHNob3cgc3Ryb25nIHdhcm5pbmdcclxuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVycycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbWVzc2FnZSA9IHBhcmFtc1swXTtcclxuICAgICAgY29uc3QgYWRkcmVzcyA9IHBhcmFtc1sxXTtcclxuXHJcbiAgICAgIGlmICghbWVzc2FnZSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNZXNzYWdlIGlzIGVtcHR5JyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWFkZHJlc3MgfHwgIWV0aGVycy5pc0FkZHJlc3MoYWRkcmVzcykpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhZGRyZXNzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTYW5pdGl6ZSBtZXNzYWdlIChjb252ZXJ0IHRvIHN0cmluZyBpZiBuZWVkZWQpXHJcbiAgICAgIGNvbnN0IHNhbml0aXplZE1lc3NhZ2UgPSB0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgPyBtZXNzYWdlIDogU3RyaW5nKG1lc3NhZ2UpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB2YWxpZDogdHJ1ZSxcclxuICAgICAgICBzYW5pdGl6ZWQ6IHtcclxuICAgICAgICAgIG1lc3NhZ2U6IHNhbml0aXplZE1lc3NhZ2UsXHJcbiAgICAgICAgICBhZGRyZXNzOiBldGhlcnMuZ2V0QWRkcmVzcyhhZGRyZXNzKSAvLyBOb3JtYWxpemUgdG8gY2hlY2tzdW0gYWRkcmVzc1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YSc6XHJcbiAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92Myc6XHJcbiAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92NCc6XHJcbiAgICAgIGlmIChwYXJhbXMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlcnMnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGFkZHIgPSBwYXJhbXNbMF07XHJcbiAgICAgIGxldCB0eXBlZERhdGEgPSBwYXJhbXNbMV07XHJcblxyXG4gICAgICBpZiAoIWFkZHIgfHwgIWV0aGVycy5pc0FkZHJlc3MoYWRkcikpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhZGRyZXNzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQYXJzZSB0eXBlZCBkYXRhIGlmIGl0J3MgYSBzdHJpbmdcclxuICAgICAgaWYgKHR5cGVvZiB0eXBlZERhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHR5cGVkRGF0YSA9IEpTT04ucGFyc2UodHlwZWREYXRhKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHR5cGVkIGRhdGEgZm9ybWF0JyB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVmFsaWRhdGUgdHlwZWQgZGF0YSBzdHJ1Y3R1cmVcclxuICAgICAgaWYgKCF0eXBlZERhdGEgfHwgdHlwZW9mIHR5cGVkRGF0YSAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnVHlwZWQgZGF0YSBtdXN0IGJlIGFuIG9iamVjdCcgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF0eXBlZERhdGEuZG9tYWluIHx8ICF0eXBlZERhdGEudHlwZXMgfHwgIXR5cGVkRGF0YS5tZXNzYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1R5cGVkIGRhdGEgbWlzc2luZyByZXF1aXJlZCBmaWVsZHMgKGRvbWFpbiwgdHlwZXMsIG1lc3NhZ2UpJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHNhbml0aXplZDoge1xyXG4gICAgICAgICAgYWRkcmVzczogZXRoZXJzLmdldEFkZHJlc3MoYWRkciksXHJcbiAgICAgICAgICB0eXBlZERhdGE6IHR5cGVkRGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgVW5zdXBwb3J0ZWQgc2lnbmluZyBtZXRob2Q6ICR7bWV0aG9kfWAgfTtcclxuICB9XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBiYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzXHJcbiAqXHJcbiAqIEJhY2tncm91bmQgc2VydmljZSB3b3JrZXIgZm9yIEhlYXJ0V2FsbGV0XHJcbiAqIEhhbmRsZXMgUlBDIHJlcXVlc3RzIGZyb20gZEFwcHMgYW5kIG1hbmFnZXMgd2FsbGV0IHN0YXRlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZ2V0QWN0aXZlV2FsbGV0LCB1bmxvY2tXYWxsZXQsIHNlY3VyZUNsZWFudXAsIHNlY3VyZUNsZWFudXBTaWduZXIgfSBmcm9tICcuLi9jb3JlL3dhbGxldC5qcyc7XHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuLi9jb3JlL3N0b3JhZ2UuanMnO1xyXG5pbXBvcnQgKiBhcyBycGMgZnJvbSAnLi4vY29yZS9ycGMuanMnO1xyXG5pbXBvcnQgKiBhcyB0eEhpc3RvcnkgZnJvbSAnLi4vY29yZS90eEhpc3RvcnkuanMnO1xyXG5pbXBvcnQgeyB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCwgc2FuaXRpemVFcnJvck1lc3NhZ2UgfSBmcm9tICcuLi9jb3JlL3R4VmFsaWRhdGlvbi5qcyc7XHJcbmltcG9ydCB7IHBlcnNvbmFsU2lnbiwgc2lnblR5cGVkRGF0YSwgdmFsaWRhdGVTaWduUmVxdWVzdCB9IGZyb20gJy4uL2NvcmUvc2lnbmluZy5qcyc7XHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vLyBTZXJ2aWNlIHdvcmtlciBsb2FkZWRcclxuXHJcbi8vIE5ldHdvcmsgY2hhaW4gSURzXHJcbi8vIExvd2VyY2FzZSBoZXg6IGRBcHBzIGNvbXBhcmUgZXRoX2NoYWluSWQvY2hhaW5DaGFuZ2VkIHZhbHVlcyBhcyBzdHJpbmdzXHJcbi8vIGFnYWluc3QgbG93ZXJjYXNlIHJlZ2lzdHJpZXMgKE1ldGFNYXNrIGNvbnZlbnRpb24pLCBzbyAnMHgzQUYnIHJlYWRzIGFzIGFcclxuLy8gZGlmZmVyZW50IGNoYWluIHRoYW4gJzB4M2FmJyB0byB0aGVtLlxyXG5jb25zdCBDSEFJTl9JRFMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJzB4M2FmJywgLy8gOTQzXHJcbiAgJ3B1bHNlY2hhaW4nOiAnMHgxNzEnLCAvLyAzNjlcclxuICAnZXRoZXJldW0nOiAnMHgxJywgLy8gMVxyXG4gICdzZXBvbGlhJzogJzB4YWEzNmE3JyAvLyAxMTE1NTExMVxyXG59O1xyXG5cclxuLy8gRmFsbGJhY2sgd2hlbiB0aGUgdXNlciBoYXMgbmV2ZXIgc3dpdGNoZWQgbmV0d29ya3MuIE11c3QgbWF0Y2ggdGhlIHBvcHVwJ3NcclxuLy8gaW5pdGlhbCBjdXJyZW50U3RhdGUubmV0d29yaywgb3IgdGhlIFVJIGFuZCB0aGUgZEFwcC1mYWNpbmcgQVBJIGRpc2FncmVlXHJcbi8vIGFib3V0IHdoaWNoIGNoYWluIGlzIGFjdGl2ZSBvbiBhIGZyZXNoIHByb2ZpbGUuXHJcbmNvbnN0IERFRkFVTFRfTkVUV09SSyA9ICdwdWxzZWNoYWluJztcclxuXHJcbmNvbnN0IE5FVFdPUktfTkFNRVMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ1B1bHNlQ2hhaW4gVGVzdG5ldCBWNCcsXHJcbiAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG59O1xyXG5cclxuY29uc3QgQ0hBSU5fSURfVE9fTkVUV09SSyA9IHtcclxuICAnMHgzYWYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICcweDE3MSc6ICdwdWxzZWNoYWluJyxcclxuICAnMHgxJzogJ2V0aGVyZXVtJyxcclxuICAnMHhhYTM2YTcnOiAnc2Vwb2xpYSdcclxufTtcclxuXHJcbi8vIFN0b3JhZ2Uga2V5c1xyXG5jb25zdCBDT05ORUNURURfU0lURVNfS0VZID0gJ2Nvbm5lY3RlZF9zaXRlcyc7XHJcblxyXG4vLyBQZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdHMgKG9yaWdpbiAtPiB7IHJlc29sdmUsIHJlamVjdCwgdGFiSWQgfSlcclxuY29uc3QgcGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyBjaGFpbiBzd2l0Y2ggcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBuZXR3b3JrS2V5LCBjaGFpbklkLCBhcHByb3ZhbFRva2VuIH0pXHJcbmNvbnN0IHBlbmRpbmdDaGFpblN3aXRjaGVzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gU0lHTklORyBBVURJVCBMT0cgPT09PT1cclxuLy8gU3RvcmVzIHJlY2VudCBzaWduaW5nIG9wZXJhdGlvbnMgZm9yIHNlY3VyaXR5IGF1ZGl0aW5nIChpbi1tZW1vcnksIGNsZWFyZWQgb24gc2VydmljZSB3b3JrZXIgcmVzdGFydClcclxuY29uc3QgU0lHTklOR19MT0dfS0VZID0gJ3NpZ25pbmdfYXVkaXRfbG9nJztcclxuY29uc3QgTUFYX1NJR05JTkdfTE9HX0VOVFJJRVMgPSAxMDA7XHJcblxyXG4vKipcclxuICogTG9nIGEgc2lnbmluZyBvcGVyYXRpb24gZm9yIGF1ZGl0IHB1cnBvc2VzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIExvZyBlbnRyeSBkZXRhaWxzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRyeS50eXBlIC0gVHlwZSBvZiBzaWduaW5nICh0cmFuc2FjdGlvbiwgcGVyc29uYWxfc2lnbiwgdHlwZWRfZGF0YSlcclxuICogQHBhcmFtIHtzdHJpbmd9IGVudHJ5LmFkZHJlc3MgLSBXYWxsZXQgYWRkcmVzcyB0aGF0IHNpZ25lZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkub3JpZ2luIC0gZEFwcCBvcmlnaW4gdGhhdCByZXF1ZXN0ZWQgdGhlIHNpZ25hdHVyZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkubWV0aG9kIC0gUlBDIG1ldGhvZCB1c2VkXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW50cnkuc3VjY2VzcyAtIFdoZXRoZXIgc2lnbmluZyBzdWNjZWVkZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS50eEhhc2hdIC0gVHJhbnNhY3Rpb24gaGFzaCAoZm9yIHRyYW5zYWN0aW9ucylcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS5lcnJvcl0gLSBFcnJvciBtZXNzYWdlIChpZiBmYWlsZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBsb2dTaWduaW5nT3BlcmF0aW9uKGVudHJ5KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGxvZ0VudHJ5ID0ge1xyXG4gICAgICAuLi5lbnRyeSxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdldCBleGlzdGluZyBsb2dcclxuICAgIGNvbnN0IGV4aXN0aW5nTG9nID0gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEFkZCBuZXcgZW50cnkgYXQgdGhlIGJlZ2lubmluZ1xyXG4gICAgZXhpc3RpbmdMb2cudW5zaGlmdChsb2dFbnRyeSk7XHJcblxyXG4gICAgLy8gVHJpbSB0byBtYXggZW50cmllc1xyXG4gICAgaWYgKGV4aXN0aW5nTG9nLmxlbmd0aCA+IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTKSB7XHJcbiAgICAgIGV4aXN0aW5nTG9nLmxlbmd0aCA9IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgbG9nXHJcbiAgICBhd2FpdCBzYXZlKFNJR05JTkdfTE9HX0tFWSwgZXhpc3RpbmdMb2cpO1xyXG5cclxuICAgIC8vIEFsc28gbG9nIHRvIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAgY29uc3QgaWNvbiA9IGVudHJ5LnN1Y2Nlc3MgPyAn4pyFJyA6ICfinYwnO1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgJHtpY29ufSBTaWduaW5nIGF1ZGl0OiAke2VudHJ5LnR5cGV9IGZyb20gJHtlbnRyeS5vcmlnaW59IC0gJHtlbnRyeS5zdWNjZXNzID8gJ1NVQ0NFU1MnIDogJ0ZBSUxFRCd9YCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIERvbid0IGxldCBsb2dnaW5nIGZhaWx1cmVzIGFmZmVjdCBzaWduaW5nIG9wZXJhdGlvbnNcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgbG9nZ2luZyBzaWduaW5nIG9wZXJhdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHNpZ25pbmcgYXVkaXQgbG9nXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gQXJyYXkgb2YgbG9nIGVudHJpZXNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNpZ25pbmdBdWRpdExvZygpIHtcclxuICByZXR1cm4gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG59XHJcblxyXG4vLyA9PT09PSBTRVNTSU9OIE1BTkFHRU1FTlQgPT09PT1cclxuLy8gU2Vzc2lvbiB0b2tlbnMgc3RvcmVkIGluIG1lbW9yeSAoY2xlYXJlZCB3aGVuIHNlcnZpY2Ugd29ya2VyIHRlcm1pbmF0ZXMpXHJcbi8vIFNFQ1VSSVRZIE5PVEU6IFNlcnZpY2Ugd29ya2VycyBjYW4gYmUgdGVybWluYXRlZCBieSBDaHJvbWUgYXQgYW55IHRpbWUsIHdoaWNoIGNsZWFycyBhbGxcclxuLy8gc2Vzc2lvbiBkYXRhLiBUaGlzIGlzIGludGVudGlvbmFsIC0gd2UgZG9uJ3Qgd2FudCBwYXNzd29yZHMgcGVyc2lzdGluZyBsb25nZXIgdGhhbiBuZWVkZWQuXHJcbi8vIFNlc3Npb25zIGFyZSBlbmNyeXB0ZWQgaW4gbWVtb3J5IGFzIGFuIGFkZGl0aW9uYWwgc2VjdXJpdHkgbGF5ZXIuXHJcbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpOyAvLyBzZXNzaW9uVG9rZW4gLT4geyBlbmNyeXB0ZWRQYXNzd29yZCwgd2FsbGV0SWQsIGV4cGlyZXNBdCwgc2FsdCB9XHJcblxyXG4vLyBTZXNzaW9uIGVuY3J5cHRpb24ga2V5IChyZWdlbmVyYXRlZCBvbiBzZXJ2aWNlIHdvcmtlciBzdGFydClcclxubGV0IHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHNlc3Npb24gZW5jcnlwdGlvbiBrZXkgdXNpbmcgV2ViIENyeXB0byBBUElcclxuICogS2V5IGlzIHJlZ2VuZXJhdGVkIGVhY2ggdGltZSBzZXJ2aWNlIHdvcmtlciBzdGFydHMgKG1lbW9yeSBvbmx5LCBuZXZlciBwZXJzaXN0ZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKSB7XHJcbiAgaWYgKCFzZXNzaW9uRW5jcnlwdGlvbktleSkge1xyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gMjU2LWJpdCBrZXkgZm9yIEFFUy1HQ00gZW5jcnlwdGlvblxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcclxuICAgICAgZmFsc2UsIC8vIE5vdCBleHRyYWN0YWJsZVxyXG4gICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY3J5cHRzIHBhc3N3b3JkIGZvciBzZXNzaW9uIHN0b3JhZ2UgdXNpbmcgQUVTLUdDTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBQYXNzd29yZCB0byBlbmNyeXB0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtlbmNyeXB0ZWQ6IEFycmF5QnVmZmVyLCBpdjogVWludDhBcnJheX0+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCkge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICBjb25zdCBwYXNzd29yZERhdGEgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcbiAgXHJcbiAgLy8gR2VuZXJhdGUgcmFuZG9tIElWIGZvciB0aGlzIGVuY3J5cHRpb25cclxuICAvLyBTRUNVUklUWTogSVYgdW5pcXVlbmVzcyBpcyBjcnlwdG9ncmFwaGljYWxseSBndWFyYW50ZWVkIGJ5IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKVxyXG4gIC8vIHdoaWNoIHVzZXMgdGhlIGJyb3dzZXIncyBDU1BSTkcgKENyeXB0b2dyYXBoaWNhbGx5IFNlY3VyZSBQc2V1ZG8tUmFuZG9tIE51bWJlciBHZW5lcmF0b3IpXHJcbiAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7XHJcbiAgXHJcbiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIHBhc3N3b3JkRGF0YVxyXG4gICk7XHJcbiAgXHJcbiAgcmV0dXJuIHsgZW5jcnlwdGVkLCBpdiB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVjcnlwdHMgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkIC0gRW5jcnlwdGVkIHBhc3N3b3JkIGRhdGFcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBpdiAtIEluaXRpYWxpemF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oZW5jcnlwdGVkLCBpdikge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIFxyXG4gIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBlbmNyeXB0ZWRcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuICByZXR1cm4gZGVjb2Rlci5kZWNvZGUoZGVjcnlwdGVkKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlc3Npb24gdG9rZW5cclxuZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBuZXcgc2Vzc2lvblxyXG4vLyBTRUNVUklUWTogRGVmYXVsdCBzZXNzaW9uIGR1cmF0aW9uIHJlZHVjZWQgdG8gMTUgbWludXRlcyB0byBtaW5pbWl6ZSBwYXNzd29yZCBleHBvc3VyZSBpbiBtZW1vcnlcclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihwYXNzd29yZCwgd2FsbGV0SWQsIGR1cmF0aW9uTXMgPSA5MDAwMDApIHsgLy8gRGVmYXVsdCAxNSBtaW51dGVzICh3YXMgMSBob3VyKVxyXG4gIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGdlbmVyYXRlU2Vzc2lvblRva2VuKCk7XHJcbiAgY29uc3QgZXhwaXJlc0F0ID0gRGF0ZS5ub3coKSArIGR1cmF0aW9uTXM7XHJcbiAgXHJcbiAgLy8gRW5jcnlwdCBwYXNzd29yZCBiZWZvcmUgc3RvcmluZyBpbiBtZW1vcnlcclxuICBjb25zdCB7IGVuY3J5cHRlZCwgaXYgfSA9IGF3YWl0IGVuY3J5cHRQYXNzd29yZEZvclNlc3Npb24ocGFzc3dvcmQpO1xyXG5cclxuICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvblRva2VuLCB7XHJcbiAgICBlbmNyeXB0ZWRQYXNzd29yZDogZW5jcnlwdGVkLFxyXG4gICAgaXY6IGl2LFxyXG4gICAgd2FsbGV0SWQsXHJcbiAgICBleHBpcmVzQXRcclxuICB9KTtcclxuXHJcbiAgLy8gQXV0by1jbGVhbnVwIGV4cGlyZWQgc2Vzc2lvblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvblRva2VuKTtcclxuICAgICAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgICAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZXNzaW9uIGV4cGlyZWQgYW5kIHJlbW92ZWQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIGR1cmF0aW9uTXMpO1xyXG5cclxuICAvLyBTZXNzaW9uIGNyZWF0ZWRcclxuICByZXR1cm4gc2Vzc2lvblRva2VuO1xyXG59XHJcblxyXG4vLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCByZXR1cm4gZGVjcnlwdGVkIHBhc3N3b3JkXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXNlc3Npb25Ub2tlbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBzZXNzaW9uIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcblxyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG9yIGV4cGlyZWQgc2Vzc2lvbicpO1xyXG4gIH1cclxuXHJcbiAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZXNzaW9uIGV4cGlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIERlY3J5cHQgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICByZXR1cm4gYXdhaXQgZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oc2Vzc2lvbi5lbmNyeXB0ZWRQYXNzd29yZCwgc2Vzc2lvbi5pdik7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgc2Vzc2lvblxyXG5mdW5jdGlvbiBpbnZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25Ub2tlbikpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgLy8gU2Vzc2lvbiBpbnZhbGlkYXRlZFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gSW52YWxpZGF0ZSBhbGwgc2Vzc2lvbnNcclxuZnVuY3Rpb24gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCkge1xyXG4gIGNvbnN0IGNvdW50ID0gYWN0aXZlU2Vzc2lvbnMuc2l6ZTtcclxuICBhY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xyXG4gIC8vIEFsbCBzZXNzaW9ucyBpbnZhbGlkYXRlZFxyXG4gIHJldHVybiBjb3VudDtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBleHRlbnNpb24gaW5zdGFsbGF0aW9uXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBpbnN0YWxsZWQnKTtcclxufSk7XHJcblxyXG4vLyBHZXQgY29ubmVjdGVkIHNpdGVzIGZyb20gc3RvcmFnZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlcygpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGxvYWQoQ09OTkVDVEVEX1NJVEVTX0tFWSk7XHJcbiAgcmV0dXJuIHNpdGVzIHx8IHt9O1xyXG59XHJcblxyXG4vLyBHZXQgYSBjb25uZWN0ZWQgc2l0ZSBlbnRyeVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlKG9yaWdpbikge1xyXG4gIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICByZXR1cm4gc2l0ZXNbb3JpZ2luXSB8fCBudWxsO1xyXG59XHJcblxyXG4vLyBHZXQgdGhlIGN1cnJlbnRseSBhdXRob3JpemVkIGFjY291bnQgZm9yIGEgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRBdXRob3JpemVkQWNjb3VudHMob3JpZ2luKSB7XHJcbiAgY29uc3Qgc2l0ZSA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGUob3JpZ2luKTtcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuXHJcbiAgaWYgKCFzaXRlIHx8ICF3YWxsZXQ/LmFkZHJlc3MpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGF1dGhvcml6ZWRBY2NvdW50cyA9IEFycmF5LmlzQXJyYXkoc2l0ZS5hY2NvdW50cykgPyBzaXRlLmFjY291bnRzIDogW107XHJcbiAgY29uc3QgYWN0aXZlQWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgaXNBdXRob3JpemVkID0gYXV0aG9yaXplZEFjY291bnRzLnNvbWUoXHJcbiAgICBhY2NvdW50ID0+IHR5cGVvZiBhY2NvdW50ID09PSAnc3RyaW5nJyAmJiBhY2NvdW50LnRvTG93ZXJDYXNlKCkgPT09IGFjdGl2ZUFkZHJlc3NcclxuICApO1xyXG5cclxuICByZXR1cm4gaXNBdXRob3JpemVkID8gW3dhbGxldC5hZGRyZXNzXSA6IFtdO1xyXG59XHJcblxyXG4vLyBDaGVjayBpZiBhIHNpdGUgaXMgY29ubmVjdGVkXHJcbmFzeW5jIGZ1bmN0aW9uIGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pIHtcclxuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGdldEF1dGhvcml6ZWRBY2NvdW50cyhvcmlnaW4pO1xyXG4gIHJldHVybiBhY2NvdW50cy5sZW5ndGggPiAwO1xyXG59XHJcblxyXG4vLyBBZGQgYSBjb25uZWN0ZWQgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiBhZGRDb25uZWN0ZWRTaXRlKG9yaWdpbiwgYWNjb3VudHMpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgY29uc3QgZXhpc3RpbmdBY2NvdW50cyA9IEFycmF5LmlzQXJyYXkoc2l0ZXNbb3JpZ2luXT8uYWNjb3VudHMpID8gc2l0ZXNbb3JpZ2luXS5hY2NvdW50cyA6IFtdO1xyXG4gIGNvbnN0IG1lcmdlZEFjY291bnRzID0gWy4uLmV4aXN0aW5nQWNjb3VudHNdO1xyXG5cclxuICBmb3IgKGNvbnN0IGFjY291bnQgb2YgYWNjb3VudHMgfHwgW10pIHtcclxuICAgIGlmIChcclxuICAgICAgdHlwZW9mIGFjY291bnQgPT09ICdzdHJpbmcnICYmXHJcbiAgICAgICFtZXJnZWRBY2NvdW50cy5zb21lKGV4aXN0aW5nID0+IGV4aXN0aW5nLnRvTG93ZXJDYXNlKCkgPT09IGFjY291bnQudG9Mb3dlckNhc2UoKSlcclxuICAgICkge1xyXG4gICAgICBtZXJnZWRBY2NvdW50cy5wdXNoKGFjY291bnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2l0ZXNbb3JpZ2luXSA9IHtcclxuICAgIGFjY291bnRzOiBtZXJnZWRBY2NvdW50cyxcclxuICAgIGNvbm5lY3RlZEF0OiBzaXRlc1tvcmlnaW5dPy5jb25uZWN0ZWRBdCB8fCBEYXRlLm5vdygpLFxyXG4gICAgbGFzdENvbm5lY3RlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuICBhd2FpdCBzYXZlKENPTk5FQ1RFRF9TSVRFU19LRVksIHNpdGVzKTtcclxufVxyXG5cclxuLy8gUmVtb3ZlIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ29ubmVjdGVkU2l0ZShvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgZGVsZXRlIHNpdGVzW29yaWdpbl07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIE5vdGlmeSB0YWJzIHdoZW4gdGhlIGFjdGl2ZSBhdXRob3JpemVkIGFjY291bnQgY2hhbmdlc1xyXG5hc3luYyBmdW5jdGlvbiBub3RpZnlBY2NvdW50c0NoYW5nZWQoKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGNvbnN0IGFjdGl2ZUFkZHJlc3MgPSB3YWxsZXQ/LmFkZHJlc3MgfHwgbnVsbDtcclxuXHJcbiAgY2hyb21lLnRhYnMucXVlcnkoe30sICh0YWJzKSA9PiB7XHJcbiAgICB0YWJzLmZvckVhY2goKHRhYikgPT4ge1xyXG4gICAgICBpZiAoIXRhYi5pZCB8fCAhdGFiLnVybCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IG9yaWdpbjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBvcmlnaW4gPSBuZXcgVVJMKHRhYi51cmwpLm9yaWdpbjtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBzaXRlID0gc2l0ZXNbb3JpZ2luXTtcclxuICAgICAgY29uc3QgYWNjb3VudHMgPSAoXHJcbiAgICAgICAgc2l0ZSAmJlxyXG4gICAgICAgIGFjdGl2ZUFkZHJlc3MgJiZcclxuICAgICAgICBBcnJheS5pc0FycmF5KHNpdGUuYWNjb3VudHMpICYmXHJcbiAgICAgICAgc2l0ZS5hY2NvdW50cy5zb21lKGFjY291bnQgPT4gdHlwZW9mIGFjY291bnQgPT09ICdzdHJpbmcnICYmIGFjY291bnQudG9Mb3dlckNhc2UoKSA9PT0gYWN0aXZlQWRkcmVzcy50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICApID8gW2FjdGl2ZUFkZHJlc3NdIDogW107XHJcblxyXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHtcclxuICAgICAgICB0eXBlOiAnQUNDT1VOVFNfQ0hBTkdFRCcsXHJcbiAgICAgICAgYWNjb3VudHNcclxuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIC8vIFRhYiBtaWdodCBub3QgaGF2ZSBjb250ZW50IHNjcmlwdCwgaWdub3JlIGVycm9yXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIE5vdGlmeSB0YWJzIHdoZW4gdGhlIG5ldHdvcmsgY2hhbmdlc1xyXG5mdW5jdGlvbiBub3RpZnlDaGFpbkNoYW5nZWQoY2hhaW5JZCkge1xyXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCAodGFicykgPT4ge1xyXG4gICAgdGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xyXG4gICAgICAgIHR5cGU6ICdDSEFJTl9DSEFOR0VEJyxcclxuICAgICAgICBjaGFpbklkXHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQsIGlnbm9yZSBlcnJvclxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGNoYWluIElEXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFpbklkKCkge1xyXG4gIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpO1xyXG4gIHJldHVybiBDSEFJTl9JRFNbbmV0d29yayB8fCBERUZBVUxUX05FVFdPUktdO1xyXG59XHJcblxyXG4vLyBTRUNVUklUWTogTWV0aG9kcyBhbnkgc2l0ZSBtYXkgY2FsbCB3aXRob3V0IGFuIGFwcHJvdmVkIGNvbm5lY3Rpb24uXHJcbi8vIEV2ZXJ5dGhpbmcgZWxzZSAtIGluY2x1ZGluZyByZWFkLW9ubHkgY2hhaW4gcXVlcmllcyAtIHJlcXVpcmVzIGEgY29ubmVjdGlvbiwgc28gYVxyXG4vLyBwYWdlIHRoZSB1c2VyIG5ldmVyIGFwcHJvdmVkIGNhbm5vdCB1c2UgdGhlIHdhbGxldCBhcyBhIGZyZWUgUlBDIHByb3h5ICh3aGljaFxyXG4vLyBsZWFrcyB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgZW5kcG9pbnQgYW5kIElQKSBvciBwcm9iZSBjaGFpbiBzdGF0ZSB0aHJvdWdoIHRoZW0uXHJcbi8vXHJcbi8vIGV0aF9jaGFpbklkL25ldF92ZXJzaW9uIHN0YXkgcHVibGljIGJlY2F1c2UgRUlQLTExOTMgd2FsbGV0IGRldGVjdGlvbiByZWFkcyB0aGVtXHJcbi8vIGJlZm9yZSBjb25uZWN0aW5nOyBldGhfYWNjb3VudHMgaXMgcHVibGljIGJlY2F1c2UgaXQgYWxyZWFkeSByZXR1cm5zIFtdIGZvciBhblxyXG4vLyB1bmNvbm5lY3RlZCBzaXRlOyBldGhfcmVxdWVzdEFjY291bnRzIElTIHRoZSBjb25uZWN0aW9uIHJlcXVlc3QuXHJcbmNvbnN0IFBVQkxJQ19NRVRIT0RTID0gbmV3IFNldChbXHJcbiAgJ2V0aF9jaGFpbklkJyxcclxuICAnbmV0X3ZlcnNpb24nLFxyXG4gICdldGhfYWNjb3VudHMnLFxyXG4gICdldGhfcmVxdWVzdEFjY291bnRzJ1xyXG5dKTtcclxuXHJcbi8vIEVJUC0xMTkzOiBjb2RlIDQwMDEgPSB1c2VyIHJlamVjdGVkIHRoZSByZXF1ZXN0LiBkQXBwcyBicmFuY2ggb24gdGhpcyBjb2RlXHJcbi8vIHRvIHNob3cgYSBxdWlldCBcImNhbmNlbGxlZFwiIHN0YXRlIGluc3RlYWQgb2YgYW4gZXJyb3IsIHNvIHJlamVjdGlvbnMgbXVzdFxyXG4vLyBjYXJyeSBpdCBhbGwgdGhlIHdheSBiYWNrIHRvIHRoZSBwYWdlLlxyXG5mdW5jdGlvbiB1c2VyUmVqZWN0aW9uKG1lc3NhZ2UpIHtcclxuICBjb25zdCBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgZXJyLmNvZGUgPSA0MDAxO1xyXG4gIHJldHVybiBlcnI7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXQgcmVxdWVzdHMgZnJvbSBjb250ZW50IHNjcmlwdHNcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlV2FsbGV0UmVxdWVzdChtZXNzYWdlLCBzZW5kZXIpIHtcclxuICBjb25zdCB7IG1ldGhvZCwgcGFyYW1zIH0gPSBtZXNzYWdlO1xyXG5cclxuICAvLyBTRUNVUklUWTogR2V0IG9yaWdpbiBmcm9tIENocm9tZSBBUEksIG5vdCBtZXNzYWdlIHBheWxvYWQgKHByZXZlbnRzIHNwb29maW5nKS5cclxuICAvLyBJZiB3ZSBjYW5ub3QgZGV0ZXJtaW5lIGFuIG9yaWdpbiB3ZSBjYW5ub3QgbWFrZSBhbiBhdXRob3JpemF0aW9uIGRlY2lzaW9uLCBzbyByZWZ1c2UuXHJcbiAgbGV0IG9yaWdpbjtcclxuICB0cnkge1xyXG4gICAgb3JpZ2luID0gbmV3IFVSTChzZW5kZXIudXJsKS5vcmlnaW47XHJcbiAgfSBjYXRjaCB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgU0VDVVJJVFk6IFJlamVjdGluZyB3YWxsZXQgcmVxdWVzdCB3aXRoIHVuZGV0ZXJtaW5hYmxlIG9yaWdpbjonLCBzZW5kZXI/LnVybCk7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBjb3VsZCBub3QgZGV0ZXJtaW5lIHJlcXVlc3Qgb3JpZ2luJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogU2luZ2xlIGNob2tlIHBvaW50IGZvciB0aGUgY29ubmVjdGlvbiByZXF1aXJlbWVudCwgc28gYSBuZXdseSBhZGRlZFxyXG4gIC8vIG1ldGhvZCBjYW5ub3QgYWNjaWRlbnRhbGx5IHNoaXAgd2l0aG91dCBhbiBhdXRob3JpemF0aW9uIGNoZWNrLlxyXG4gIGlmICghUFVCTElDX01FVEhPRFMuaGFzKG1ldGhvZCkgJiYgIShhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGluZyB3YWxsZXQgcmVxdWVzdFxyXG5cclxuICB0cnkge1xyXG4gICAgc3dpdGNoIChtZXRob2QpIHtcclxuICAgICAgY2FzZSAnZXRoX3JlcXVlc3RBY2NvdW50cyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHNlbmRlci50YWIpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2FjY291bnRzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQWNjb3VudHMob3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9jaGFpbklkJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQ2hhaW5JZCgpO1xyXG5cclxuICAgICAgY2FzZSAnbmV0X3ZlcnNpb24nOlxyXG4gICAgICAgIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBoYW5kbGVDaGFpbklkKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgcmVzdWx0OiBwYXJzZUludChjaGFpbklkLnJlc3VsdCwgMTYpLnRvU3RyaW5nKCkgfTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF9zd2l0Y2hFdGhlcmV1bUNoYWluJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU3dpdGNoQ2hhaW4ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBZGRDaGFpbihwYXJhbXMsIG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICd3YWxsZXRfd2F0Y2hBc3NldCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVdhdGNoQXNzZXQocGFyYW1zLCBvcmlnaW4sIHNlbmRlci50YWIpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2Jsb2NrTnVtYmVyJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQmxvY2tOdW1iZXIoKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCbG9ja0J5TnVtYmVyJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmxvY2tCeU51bWJlcihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldEJhbGFuY2UnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25Db3VudCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uQ291bnQocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9jYWxsJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQ2FsbChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2VzdGltYXRlR2FzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlRXN0aW1hdGVHYXMocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nYXNQcmljZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdhc1ByaWNlKCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2VuZFRyYW5zYWN0aW9uJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2VuZFRyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9zZW5kUmF3VHJhbnNhY3Rpb24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTZW5kUmF3VHJhbnNhY3Rpb24ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uQnlIYXNoJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25CeUhhc2gocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRMb2dzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0TG9ncyhwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldENvZGUnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRDb2RlKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmxvY2tCeUhhc2gnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCbG9ja0J5SGFzaChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAncGVyc29uYWxfc2lnbic6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlUGVyc29uYWxTaWduKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGEnOlxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92Myc6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2lnblR5cGVkRGF0YShwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKTtcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAxLCBtZXNzYWdlOiBgTWV0aG9kICR7bWV0aG9kfSBub3Qgc3VwcG9ydGVkYCB9IH07XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgaGFuZGxpbmcgcmVxdWVzdDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiBlcnJvci5jb2RlIHx8IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3JlcXVlc3RBY2NvdW50cyAtIFJlcXVlc3QgcGVybWlzc2lvbiB0byBjb25uZWN0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHRhYikge1xyXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgY29ubmVjdGVkXHJcbiAgaWYgKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGdldEF1dGhvcml6ZWRBY2NvdW50cyhvcmlnaW4pO1xyXG4gICAgaWYgKGFjY291bnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBhY2NvdW50cyB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcbiAgICBwZW5kaW5nQ29ubmVjdGlvbnMuc2V0KHJlcXVlc3RJZCwgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdGFiSWQ6IHRhYj8uaWQgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1jb25uZWN0Jm9yaWdpbj0ke2VuY29kZVVSSUNvbXBvbmVudChvcmlnaW4pfSZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nQ29ubmVjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nQ29ubmVjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ29ubmVjdGlvbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfYWNjb3VudHMgLSBHZXQgY29ubmVjdGVkIGFjY291bnRzXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFjY291bnRzKG9yaWdpbikge1xyXG4gIC8vIE9ubHkgcmV0dXJuIGFjY291bnRzIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgY29uc3QgYWNjb3VudHMgPSBhd2FpdCBnZXRBdXRob3JpemVkQWNjb3VudHMob3JpZ2luKTtcclxuICBpZiAoYWNjb3VudHMubGVuZ3RoID4gMCkge1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBhY2NvdW50cyB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBbXSB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2NoYWluSWQgLSBHZXQgY3VycmVudCBjaGFpbiBJRFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDaGFpbklkKCkge1xyXG4gIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBnZXRDdXJyZW50Q2hhaW5JZCgpO1xyXG4gIHJldHVybiB7IHJlc3VsdDogY2hhaW5JZCB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4gLSBTd2l0Y2ggdG8gYSBkaWZmZXJlbnQgbmV0d29ya1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0gfHwgIXBhcmFtc1swXS5jaGFpbklkKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHBhcmFtcycgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IFJlcXVpcmUgc2l0ZSBjb25uZWN0aW9uIGJlZm9yZSBhbGxvd2luZyBjaGFpbiBzd2l0Y2hcclxuICBpZiAob3JpZ2luICYmICEoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBzaXRlIG5vdCBjb25uZWN0ZWQuIENhbGwgZXRoX3JlcXVlc3RBY2NvdW50cyBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHJlcXVlc3RlZENoYWluSWQgPSBTdHJpbmcocGFyYW1zWzBdLmNoYWluSWQpLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgbmV0d29ya0tleSA9IENIQUlOX0lEX1RPX05FVFdPUktbcmVxdWVzdGVkQ2hhaW5JZF07XHJcblxyXG4gIGlmICghbmV0d29ya0tleSkge1xyXG4gICAgLy8gQ2hhaW4gbm90IHN1cHBvcnRlZCAtIHJldHVybiBlcnJvciBjb2RlIDQ5MDIgc28gZEFwcCBjYW4gY2FsbCB3YWxsZXRfYWRkRXRoZXJldW1DaGFpblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0OTAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdVbnJlY29nbml6ZWQgY2hhaW4gSUQuIFRyeSBhZGRpbmcgdGhlIGNoYWluIHVzaW5nIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluLidcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGN1cnJlbnROZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICBpZiAoY3VycmVudE5ldHdvcmsgPT09IG5ldHdvcmtLZXkpIHtcclxuICAgIHJldHVybiB7IHJlc3VsdDogbnVsbCB9O1xyXG4gIH1cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIGJlZm9yZSBzd2l0Y2hpbmcgbmV0d29ya3NcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuXHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICBwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBuZXR3b3JrS2V5LFxyXG4gICAgICBjaGFpbklkOiBDSEFJTl9JRFNbbmV0d29ya0tleV0sXHJcbiAgICAgIGFwcHJvdmFsVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249c3dpdGNoQ2hhaW4mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDUyMFxyXG4gICAgfSk7XHJcblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdDaGFpblN3aXRjaGVzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NoYWluIHN3aXRjaCByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXRfYWRkRXRoZXJldW1DaGFpbiAtIEFkZCBhIG5ldyBuZXR3b3JrIChzaW1wbGlmaWVkIHZlcnNpb24pXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFkZENoYWluKHBhcmFtcywgb3JpZ2luKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSB8fCAhcGFyYW1zWzBdLmNoYWluSWQpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogUmVxdWlyZSBzaXRlIGNvbm5lY3Rpb24gYmVmb3JlIGFsbG93aW5nIGNoYWluIGFkZC9zd2l0Y2hcclxuICBpZiAob3JpZ2luICYmICEoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBzaXRlIG5vdCBjb25uZWN0ZWQuIENhbGwgZXRoX3JlcXVlc3RBY2NvdW50cyBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNoYWluSW5mbyA9IHBhcmFtc1swXTtcclxuICBjb25zb2xlLmxvZygn8J+rgCBSZXF1ZXN0IHRvIGFkZCBjaGFpbjonLCBjaGFpbkluZm8pO1xyXG5cclxuICAvLyBGb3Igbm93LCBvbmx5IHN1cHBvcnQgb3VyIHByZWRlZmluZWQgY2hhaW5zIChoZXggY2hhaW4gSURzIGFyZVxyXG4gIC8vIGNhc2UtaW5zZW5zaXRpdmUgcGVyIEVJUC02OTUsIHNvIG5vcm1hbGl6ZSBiZWZvcmUgdGhlIGxvb2t1cClcclxuICBjb25zdCByZXF1ZXN0ZWRDaGFpbklkID0gU3RyaW5nKGNoYWluSW5mby5jaGFpbklkKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmIChDSEFJTl9JRF9UT19ORVRXT1JLW3JlcXVlc3RlZENoYWluSWRdKSB7XHJcbiAgICAvLyBDaGFpbiBpcyBhbHJlYWR5IHN1cHBvcnRlZCwganVzdCBzd2l0Y2ggdG8gaXRcclxuICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihbeyBjaGFpbklkOiByZXF1ZXN0ZWRDaGFpbklkIH1dLCBvcmlnaW4pO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3VzdG9tIGNoYWlucyBub3Qgc3VwcG9ydGVkIHlldFxyXG4gIHJldHVybiB7XHJcbiAgICBlcnJvcjoge1xyXG4gICAgICBjb2RlOiAtMzI2MDMsXHJcbiAgICAgIG1lc3NhZ2U6ICdBZGRpbmcgY3VzdG9tIGNoYWlucyBub3Qgc3VwcG9ydGVkIHlldC4gT25seSBQdWxzZUNoYWluIGFuZCBFdGhlcmV1bSBuZXR3b3JrcyBhcmUgc3VwcG9ydGVkLidcclxuICAgIH1cclxuICB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgY29ubmVjdGlvbiBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nQ29ubmVjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luIH0gPSBwZW5kaW5nQ29ubmVjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgcGVuZGluZ0Nvbm5lY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoYXBwcm92ZWQpIHtcclxuICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgaWYgKHdhbGxldCAmJiB3YWxsZXQuYWRkcmVzcykge1xyXG4gICAgICAvLyBTYXZlIGNvbm5lY3RlZCBzaXRlXHJcbiAgICAgIGF3YWl0IGFkZENvbm5lY3RlZFNpdGUob3JpZ2luLCBbd2FsbGV0LmFkZHJlc3NdKTtcclxuICAgICAgYXdhaXQgbm90aWZ5QWNjb3VudHNDaGFuZ2VkKCk7XHJcblxyXG4gICAgICAvLyBSZXNvbHZlIHRoZSBwZW5kaW5nIHByb21pc2VcclxuICAgICAgcmVzb2x2ZSh7IHJlc3VsdDogW3dhbGxldC5hZGRyZXNzXSB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ05vIGFjdGl2ZSB3YWxsZXQnKSk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIGFjdGl2ZSB3YWxsZXQnIH07XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHJlamVjdCh1c2VyUmVqZWN0aW9uKCdVc2VyIHJlamVjdGVkIGNvbm5lY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGNvbm5lY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRDb25uZWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiB9ID0gcGVuZGluZ0Nvbm5lY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgY2hhaW4gc3dpdGNoIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhaW5Td2l0Y2hBcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBuZXR3b3JrS2V5LCBjaGFpbklkLCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdDaGFpblN3aXRjaGVzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdDaGFpblN3aXRjaGVzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QodXNlclJlamVjdGlvbignVXNlciByZWplY3RlZCBjaGFpbiBzd2l0Y2gnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZSgnY3VycmVudE5ldHdvcmsnLCBuZXR3b3JrS2V5KTtcclxuICBub3RpZnlDaGFpbkNoYW5nZWQoY2hhaW5JZCk7XHJcbiAgcmVzb2x2ZSh7IHJlc3VsdDogbnVsbCB9KTtcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBjaGFpbklkLCBuZXR3b3JrTmFtZTogTkVUV09SS19OQU1FU1tuZXR3b3JrS2V5XSB9O1xyXG59XHJcblxyXG4vLyBHZXQgY2hhaW4gc3dpdGNoIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q2hhaW5Td2l0Y2hSZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmICghcGVuZGluZ0NoYWluU3dpdGNoZXMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBvcmlnaW4sIG5ldHdvcmtLZXksIGNoYWluSWQgfSA9IHBlbmRpbmdDaGFpblN3aXRjaGVzLmdldChyZXF1ZXN0SWQpO1xyXG4gIGNvbnN0IGN1cnJlbnROZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICBvcmlnaW4sXHJcbiAgICBjaGFpbklkLFxyXG4gICAgbmV0d29ya0tleSxcclxuICAgIG5ldHdvcmtOYW1lOiBORVRXT1JLX05BTUVTW25ldHdvcmtLZXldIHx8IG5ldHdvcmtLZXksXHJcbiAgICBjdXJyZW50TmV0d29ya05hbWU6IE5FVFdPUktfTkFNRVNbY3VycmVudE5ldHdvcmtdIHx8IGN1cnJlbnROZXR3b3JrXHJcbiAgfTtcclxufVxyXG5cclxuLy8gR2V0IGN1cnJlbnQgbmV0d29yayBrZXlcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudE5ldHdvcmsoKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgcmV0dXJuIG5ldHdvcmsgfHwgREVGQVVMVF9ORVRXT1JLO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2Jsb2NrTnVtYmVyIC0gR2V0IGN1cnJlbnQgYmxvY2sgbnVtYmVyXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJsb2NrTnVtYmVyKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gYXdhaXQgcnBjLmdldEJsb2NrTnVtYmVyKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9ja051bWJlciB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCbG9ja0J5TnVtYmVyIC0gR2V0IGJsb2NrIGJ5IG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgbnVtYmVyIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgaW5jbHVkZVRyYW5zYWN0aW9ucyA9IHBhcmFtc1sxXSB8fCBmYWxzZTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBycGMuZ2V0QmxvY2tCeU51bWJlcihuZXR3b3JrLCBibG9ja051bWJlciwgaW5jbHVkZVRyYW5zYWN0aW9ucyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgbnVtYmVyOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldEJhbGFuY2UgLSBHZXQgYmFsYW5jZSBmb3IgYW4gYWRkcmVzc1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBiYWxhbmNlID0gYXdhaXQgcnBjLmdldEJhbGFuY2UobmV0d29yaywgYWRkcmVzcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJhbGFuY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQ291bnQgLSBHZXQgdHJhbnNhY3Rpb24gY291bnQgKG5vbmNlKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBjb3VudCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb3VudCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGNvdW50OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dhc1ByaWNlIC0gR2V0IGN1cnJlbnQgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdhc1ByaWNlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXNQcmljZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9lc3RpbWF0ZUdhcyAtIEVzdGltYXRlIGdhcyBmb3IgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgZ2FzID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGdhcyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jYWxsIC0gRXhlY3V0ZSBhIHJlYWQtb25seSBjYWxsXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbGwocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJwYy5jYWxsKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXhlY3V0aW5nIGNhbGw6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFJhd1RyYW5zYWN0aW9uIC0gU2VuZCBhIHByZS1zaWduZWQgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBzaWduZWQgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogUmVxdWlyZSBzaXRlIGNvbm5lY3Rpb24gYmVmb3JlIGFsbG93aW5nIHJhdyB0cmFuc2FjdGlvbiBicm9hZGNhc3RcclxuICBpZiAob3JpZ2luICYmICEoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBzaXRlIG5vdCBjb25uZWN0ZWQuIENhbGwgZXRoX3JlcXVlc3RBY2NvdW50cyBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzaWduZWRUeCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgdHhIYXNoID0gYXdhaXQgcnBjLnNlbmRSYXdUcmFuc2FjdGlvbihuZXR3b3JrLCBzaWduZWRUeCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHR4SGFzaCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzZW5kaW5nIHJhdyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvblJlY2VpcHQgLSBHZXQgdHJhbnNhY3Rpb24gcmVjZWlwdFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvblJlY2VpcHQocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBoYXNoIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHR4SGFzaCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvblJlY2VpcHQobmV0d29yaywgdHhIYXNoKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogcmVjZWlwdCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIHJlY2VpcHQ6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0VHJhbnNhY3Rpb25CeUhhc2ggLSBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkJ5SGFzaChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgdHhIYXNoID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkJ5SGFzaChuZXR3b3JrLCB0eEhhc2gpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiB0eCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGJ5IGhhc2g6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldExvZ3MocGFyYW1zKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCBsb2dzID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldExvZ3MnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBsb2dzIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgbG9nczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0Q29kZShwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGFkZHJlc3MgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGNvZGUgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0Q29kZScsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGNvZGUgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBjb2RlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5SGFzaChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGJsb2NrIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGJsb2NrID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldEJsb2NrQnlIYXNoJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogYmxvY2sgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBibG9jayBieSBoYXNoOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBQZW5kaW5nIHRyYW5zYWN0aW9uIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiB9KVxyXG5jb25zdCBwZW5kaW5nVHJhbnNhY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyB0b2tlbiBhZGQgcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0b2tlbkluZm8gfSlcclxuY29uc3QgcGVuZGluZ1Rva2VuUmVxdWVzdHMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyBQZW5kaW5nIG1lc3NhZ2Ugc2lnbmluZyByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHNpZ25SZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0pXHJcbmNvbnN0IHBlbmRpbmdTaWduUmVxdWVzdHMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyA9PT09PSBSQVRFIExJTUlUSU5HID09PT09XHJcbi8vIFByZXZlbnRzIG1hbGljaW91cyBkQXBwcyBmcm9tIHNwYW1taW5nIHRyYW5zYWN0aW9uIGFwcHJvdmFsIHJlcXVlc3RzXHJcbmNvbnN0IHJhdGVMaW1pdE1hcCA9IG5ldyBNYXAoKTsgLy8gb3JpZ2luIC0+IHsgY291bnQsIHdpbmRvd1N0YXJ0LCBwZW5kaW5nQ291bnQgfVxyXG5cclxuY29uc3QgUkFURV9MSU1JVF9DT05GSUcgPSB7XHJcbiAgTUFYX1BFTkRJTkdfUkVRVUVTVFM6IDUsIC8vIE1heCBwZW5kaW5nIHJlcXVlc3RzIHBlciBvcmlnaW5cclxuICBNQVhfUkVRVUVTVFNfUEVSX1dJTkRPVzogMjAsIC8vIE1heCB0b3RhbCByZXF1ZXN0cyBwZXIgdGltZSB3aW5kb3dcclxuICBUSU1FX1dJTkRPV19NUzogNjAwMDAgLy8gMSBtaW51dGUgd2luZG93XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIGFuIG9yaWdpbiBoYXMgZXhjZWVkZWQgcmF0ZSBsaW1pdHNcclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gY2hlY2tcclxuICogQHJldHVybnMge3sgYWxsb3dlZDogYm9vbGVhbiwgcmVhc29uPzogc3RyaW5nIH19XHJcbiAqL1xyXG5mdW5jdGlvbiBjaGVja1JhdGVMaW1pdChvcmlnaW4pIHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIFxyXG4gIC8vIEdldCBvciBjcmVhdGUgcmF0ZSBsaW1pdCBlbnRyeSBmb3IgdGhpcyBvcmlnaW5cclxuICBpZiAoIXJhdGVMaW1pdE1hcC5oYXMob3JpZ2luKSkge1xyXG4gICAgcmF0ZUxpbWl0TWFwLnNldChvcmlnaW4sIHtcclxuICAgICAgY291bnQ6IDAsXHJcbiAgICAgIHdpbmRvd1N0YXJ0OiBub3csXHJcbiAgICAgIHBlbmRpbmdDb3VudDogMFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBcclxuICAvLyBSZXNldCB3aW5kb3cgaWYgZXhwaXJlZFxyXG4gIGlmIChub3cgLSBsaW1pdERhdGEud2luZG93U3RhcnQgPiBSQVRFX0xJTUlUX0NPTkZJRy5USU1FX1dJTkRPV19NUykge1xyXG4gICAgbGltaXREYXRhLmNvdW50ID0gMDtcclxuICAgIGxpbWl0RGF0YS53aW5kb3dTdGFydCA9IG5vdztcclxuICB9XHJcbiAgXHJcbiAgLy8gQ2hlY2sgcGVuZGluZyByZXF1ZXN0cyBsaW1pdFxyXG4gIGlmIChsaW1pdERhdGEucGVuZGluZ0NvdW50ID49IFJBVEVfTElNSVRfQ09ORklHLk1BWF9QRU5ESU5HX1JFUVVFU1RTKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhbGxvd2VkOiBmYWxzZSxcclxuICAgICAgcmVhc29uOiBgVG9vIG1hbnkgcGVuZGluZyByZXF1ZXN0cy4gTWF4aW11bSAke1JBVEVfTElNSVRfQ09ORklHLk1BWF9QRU5ESU5HX1JFUVVFU1RTfSBwZW5kaW5nIHJlcXVlc3RzIGFsbG93ZWQuYFxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgLy8gQ2hlY2sgdG90YWwgcmVxdWVzdHMgaW4gd2luZG93XHJcbiAgaWYgKGxpbWl0RGF0YS5jb3VudCA+PSBSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUkVRVUVTVFNfUEVSX1dJTkRPVykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYWxsb3dlZDogZmFsc2UsXHJcbiAgICAgIHJlYXNvbjogYFJhdGUgbGltaXQgZXhjZWVkZWQuIE1heGltdW0gJHtSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUkVRVUVTVFNfUEVSX1dJTkRPV30gcmVxdWVzdHMgcGVyIG1pbnV0ZS5gXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICByZXR1cm4geyBhbGxvd2VkOiB0cnVlIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbmNyZW1lbnRzIHJhdGUgbGltaXQgY291bnRlcnMgZm9yIGFuIG9yaWdpblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBpbmNyZW1lbnRcclxuICovXHJcbmZ1bmN0aW9uIGluY3JlbWVudFJhdGVMaW1pdChvcmlnaW4pIHtcclxuICBjb25zdCBsaW1pdERhdGEgPSByYXRlTGltaXRNYXAuZ2V0KG9yaWdpbik7XHJcbiAgaWYgKGxpbWl0RGF0YSkge1xyXG4gICAgbGltaXREYXRhLmNvdW50Kys7XHJcbiAgICBsaW1pdERhdGEucGVuZGluZ0NvdW50Kys7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRGVjcmVtZW50cyBwZW5kaW5nIGNvdW50ZXIgd2hlbiByZXF1ZXN0IGlzIHJlc29sdmVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGRlY3JlbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gZGVjcmVtZW50UGVuZGluZ0NvdW50KG9yaWdpbikge1xyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBpZiAobGltaXREYXRhICYmIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQgPiAwKSB7XHJcbiAgICBsaW1pdERhdGEucGVuZGluZ0NvdW50LS07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBDbGVhbiB1cCBvbGQgcmF0ZSBsaW1pdCBlbnRyaWVzIGV2ZXJ5IDUgbWludXRlc1xyXG5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBmb3IgKGNvbnN0IFtvcmlnaW4sIGRhdGFdIG9mIHJhdGVMaW1pdE1hcC5lbnRyaWVzKCkpIHtcclxuICAgIGlmIChub3cgLSBkYXRhLndpbmRvd1N0YXJ0ID4gUkFURV9MSU1JVF9DT05GSUcuVElNRV9XSU5ET1dfTVMgKiA1ICYmIGRhdGEucGVuZGluZ0NvdW50ID09PSAwKSB7XHJcbiAgICAgIHJhdGVMaW1pdE1hcC5kZWxldGUob3JpZ2luKTtcclxuICAgIH1cclxuICB9XHJcbn0sIDMwMDAwMCk7XHJcblxyXG4vLyA9PT09PSBUUkFOU0FDVElPTiBSRVBMQVkgUFJPVEVDVElPTiA9PT09PVxyXG4vLyBQcmV2ZW50cyB0aGUgc2FtZSB0cmFuc2FjdGlvbiBhcHByb3ZhbCBmcm9tIGJlaW5nIHVzZWQgbXVsdGlwbGUgdGltZXNcclxuY29uc3QgcHJvY2Vzc2VkQXBwcm92YWxzID0gbmV3IE1hcCgpOyAvLyBhcHByb3ZhbFRva2VuIC0+IHsgdGltZXN0YW1wLCB0eEhhc2gsIHVzZWQ6IHRydWUgfVxyXG5cclxuY29uc3QgUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHID0ge1xyXG4gIEFQUFJPVkFMX1RJTUVPVVQ6IDMwMDAwMCwgLy8gNSBtaW51dGVzIC0gYXBwcm92YWwgZXhwaXJlcyBhZnRlciB0aGlzXHJcbiAgQ0xFQU5VUF9JTlRFUlZBTDogNjAwMDAgICAvLyAxIG1pbnV0ZSAtIGNsZWFuIHVwIG9sZCBhcHByb3ZhbHNcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW5cclxuICogQHJldHVybnMge3N0cmluZ30gVW5pcXVlIGFwcHJvdmFsIHRva2VuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYW5kIG1hcmtzIGFuIGFwcHJvdmFsIHRva2VuIGFzIHVzZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IGFwcHJvdmFsVG9rZW4gLSBUb2tlbiB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWxpZCBhbmQgbm90IHlldCB1c2VkXHJcbiAqL1xyXG5mdW5jdGlvbiB2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikge1xyXG4gIGlmICghYXBwcm92YWxUb2tlbikge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIE5vIGFwcHJvdmFsIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBjb25zdCBhcHByb3ZhbCA9IHByb2Nlc3NlZEFwcHJvdmFscy5nZXQoYXBwcm92YWxUb2tlbik7XHJcblxyXG4gIGlmICghYXBwcm92YWwpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBVbmtub3duIGFwcHJvdmFsIHRva2VuJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBNYXJrIGFzIHVzZWQgSU1NRURJQVRFTFkgdG8gcHJldmVudCByYWNlIGNvbmRpdGlvbnMuXHJcbiAgLy8gQW55IGNvbmN1cnJlbnQgY2FsbCB3aWxsIHNlZSB1c2VkPXRydWUgYW5kIGJhaWwgb3V0LlxyXG4gIGlmIChhcHByb3ZhbC51c2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQXBwcm92YWwgdG9rZW4gYWxyZWFkeSB1c2VkIC0gcHJldmVudGluZyByZXBsYXkgYXR0YWNrJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGFwcHJvdmFsLnVzZWQgPSB0cnVlO1xyXG4gIGFwcHJvdmFsLnVzZWRBdCA9IERhdGUubm93KCk7XHJcblxyXG4gIC8vIENoZWNrIGlmIGFwcHJvdmFsIGhhcyBleHBpcmVkXHJcbiAgY29uc3QgYWdlID0gRGF0ZS5ub3coKSAtIGFwcHJvdmFsLnRpbWVzdGFtcDtcclxuICBpZiAoYWdlID4gUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkFQUFJPVkFMX1RJTUVPVVQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBBcHByb3ZhbCB0b2tlbiBleHBpcmVkJyk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKGFwcHJvdmFsVG9rZW4pO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgQXBwcm92YWwgdG9rZW4gdmFsaWRhdGVkIGFuZCBtYXJrZWQgYXMgdXNlZCcpO1xyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLy8gQ2xlYW4gdXAgb2xkIHByb2Nlc3NlZCBhcHByb3ZhbHMgZXZlcnkgbWludXRlXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW3Rva2VuLCBhcHByb3ZhbF0gb2YgcHJvY2Vzc2VkQXBwcm92YWxzLmVudHJpZXMoKSkge1xyXG4gICAgY29uc3QgYWdlID0gbm93IC0gYXBwcm92YWwudGltZXN0YW1wO1xyXG4gICAgaWYgKGFnZSA+IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5BUFBST1ZBTF9USU1FT1VUICogMikge1xyXG4gICAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKHRva2VuKTtcclxuICAgIH1cclxuICB9XHJcbn0sIFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5DTEVBTlVQX0lOVEVSVkFMKTtcclxuXHJcbi8vIExhc3QgZ2FzIHByaWNlIGFjdHVhbGx5IG9ic2VydmVkIHBlciBuZXR3b3JrLCBzbyB0aGUgc2FuaXR5IGNhcCBiZWxvdyBjYW4gZGVncmFkZVxyXG4vLyB0byBhIHJlYWwgYm91bmQgaW5zdGVhZCBvZiBzd2l0Y2hpbmcgb2ZmIHdoZW5ldmVyIHRoZSBSUEMgaXMgYnJpZWZseSB1bnJlYWNoYWJsZS5cclxuY29uc3QgTEFTVF9HT09EX0dBU19QUklDRV9LRVkgPSAnbGFzdF9nb29kX2dhc19wcmljZSc7XHJcblxyXG4vKipcclxuICogUmVzb2x2ZXMgdGhlIG1heGltdW0gZ2FzIHByaWNlIGEgZEFwcCBtYXkgcmVxdWVzdCwgaW4gR3dlaS5cclxuICpcclxuICogU0VDVVJJVFk6IHRoaXMgdXNlZCB0byBmYWxsIGJhY2sgdG8gMTAsMDAwLDAwMCBHd2VpIChcImVzc2VudGlhbGx5IG5vIGxpbWl0XCIpIHRoZVxyXG4gKiBtb21lbnQgdGhlIFJQQyBjYWxsIGZhaWxlZCwgd2hpY2ggc3dpdGNoZWQgdGhlIGNoZWNrIG9mZiBleGFjdGx5IHdoZW4gdGhlIG5ldHdvcmtcclxuICogd2FzIGZsYWt5LiBJbnN0ZWFkLCByZW1lbWJlciB0aGUgbGFzdCBwcmljZSB3ZSBhY3R1YWxseSBzYXcgb24gdGhpcyBuZXR3b3JrIGFuZFxyXG4gKiBkZXJpdmUgdGhlIGZhbGxiYWNrIGZyb20gdGhhdC5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IG5ldHdvcmsgLSBOZXR3b3JrIGtleVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7bWF4R2FzUHJpY2VHd2VpOiBudW1iZXJ8bnVsbCwgc291cmNlOiAnbGl2ZSd8J2NhY2hlZCd8J3Vua25vd24nfT59XHJcbiAqICAgICAgICAgIG1heEdhc1ByaWNlR3dlaSBpcyBudWxsIG9ubHkgd2hlbiBubyBwcmljZSBoYXMgZXZlciBiZWVuIG9ic2VydmVkIGZvciB0aGVcclxuICogICAgICAgICAgbmV0d29yaywgbWVhbmluZyB0aGVyZSBpcyBubyBob25lc3QgYmFzaXMgZm9yIGEgYm91bmQuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlTWF4R2FzUHJpY2VHd2VpKG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgY3VycmVudEdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgY29uc3QgZ3dlaSA9IE51bWJlcihCaWdJbnQoY3VycmVudEdhc1ByaWNlKSkgLyAxZTk7XHJcblxyXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZShnd2VpKSAmJiBnd2VpID4gMCkge1xyXG4gICAgICBjb25zdCBjYWNoZSA9IChhd2FpdCBsb2FkKExBU1RfR09PRF9HQVNfUFJJQ0VfS0VZKSkgfHwge307XHJcbiAgICAgIGNhY2hlW25ldHdvcmtdID0geyBnd2VpLCBvYnNlcnZlZEF0OiBEYXRlLm5vdygpIH07XHJcbiAgICAgIGF3YWl0IHNhdmUoTEFTVF9HT09EX0dBU19QUklDRV9LRVksIGNhY2hlKTtcclxuXHJcbiAgICAgIC8vIDN4IHRoZSBsaXZlIHByaWNlIGFic29yYnMgbm9ybWFsIHZvbGF0aWxpdHk7IGZsb29yIG9mIDEwMCBHd2VpIGtlZXBzXHJcbiAgICAgIC8vIHZlcnkgY2hlYXAgbmV0d29ya3MgZnJvbSBwcm9kdWNpbmcgYW4gYWJzdXJkbHkgdGlnaHQgY2FwLlxyXG4gICAgICByZXR1cm4geyBtYXhHYXNQcmljZUd3ZWk6IE1hdGgubWF4KE1hdGguY2VpbChnd2VpICogMyksIDEwMCksIHNvdXJjZTogJ2xpdmUnIH07XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBHYXMgcHJpY2UgZmV0Y2ggZmFpbGVkLCBmYWxsaW5nIGJhY2sgdG8gbGFzdCBrbm93biBwcmljZTonLCBlcnJvcik7XHJcbiAgfVxyXG5cclxuICBjb25zdCBjYWNoZSA9IChhd2FpdCBsb2FkKExBU1RfR09PRF9HQVNfUFJJQ0VfS0VZKSkgfHwge307XHJcbiAgY29uc3QgY2FjaGVkID0gY2FjaGVbbmV0d29ya107XHJcbiAgaWYgKGNhY2hlZCAmJiBOdW1iZXIuaXNGaW5pdGUoY2FjaGVkLmd3ZWkpICYmIGNhY2hlZC5nd2VpID4gMCkge1xyXG4gICAgLy8gTG9vc2VyIG11bHRpcGxpZXIgdGhhbiB0aGUgbGl2ZSBwYXRoLCBzaW5jZSBhIGNhY2hlZCBwcmljZSBtYXkgYmUgc3RhbGUgLVxyXG4gICAgLy8gc3RpbGwgYSBmaW5pdGUgYm91bmQgcmF0aGVyIHRoYW4gbm9uZSBhdCBhbGwuXHJcbiAgICByZXR1cm4geyBtYXhHYXNQcmljZUd3ZWk6IE1hdGgubWF4KE1hdGguY2VpbChjYWNoZWQuZ3dlaSAqIDYpLCAxMDApLCBzb3VyY2U6ICdjYWNoZWQnIH07XHJcbiAgfVxyXG5cclxuICAvLyBObyBsaXZlIHByaWNlIGFuZCBub3RoaW5nIGNhY2hlZDogd2UgaGF2ZSBubyBiYXNpcyBmb3IgYSBudW1lcmljIGJvdW5kLCBhbmRcclxuICAvLyBpbnZlbnRpbmcgb25lIHdvdWxkIGp1c3QgYmUgYW4gYXJiaXRyYXJ5IGNvbnN0YW50LiBOb3RlIHRoYXQgYSBkQXBwLXN1cHBsaWVkXHJcbiAgLy8gZ2FzUHJpY2UgaXMgZGlzY2FyZGVkIGJlZm9yZSBzaWduaW5nIChzZWUgdHhUb1NlbmQgYmVsb3cpIC0gdGhlIGZlZSBhY3R1YWxseVxyXG4gIC8vIHVzZWQgaXMgY29tcHV0ZWQgYnkgdGhlIHdhbGxldCBmcm9tIHRoZSBuZXR3b3JrIGJhc2UgZmVlIC0gc28gdGhpcyBjaGVjayBpcyBhXHJcbiAgLy8gcmVxdWVzdC1zYW5pdHkgZmlsdGVyLCBub3QgdGhlIGNvbnRyb2wgb24gd2hhdCB0aGUgdXNlciBlbmRzIHVwIHBheWluZy5cclxuICByZXR1cm4geyBtYXhHYXNQcmljZUd3ZWk6IG51bGwsIHNvdXJjZTogJ3Vua25vd24nIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFRyYW5zYWN0aW9uIC0gU2lnbiBhbmQgc2VuZCBhIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogQ2hlY2sgcmF0ZSBsaW1pdCB0byBwcmV2ZW50IHNwYW1cclxuICBjb25zdCByYXRlTGltaXRDaGVjayA9IGNoZWNrUmF0ZUxpbWl0KG9yaWdpbik7XHJcbiAgaWYgKCFyYXRlTGltaXRDaGVjay5hbGxvd2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgUmF0ZSBsaW1pdCBleGNlZWRlZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MjAwLCBtZXNzYWdlOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShyYXRlTGltaXRDaGVjay5yZWFzb24pIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHR4UmVxdWVzdCA9IHBhcmFtc1swXTtcclxuXHJcbiAgLy8gR2V0IGN1cnJlbnQgbmV0d29yayBmcm9tIHN0b3JhZ2VcclxuICBjb25zdCBjdXJyZW50TmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJykgfHwgREVGQVVMVF9ORVRXT1JLO1xyXG5cclxuICAvLyBTYW5pdHktYm91bmQgdGhlIGdhcyBwcmljZSB0aGUgZEFwcCBhc2tlZCBmb3IsIHJlbGF0aXZlIHRvIHRoZSBsaXZlIG5ldHdvcmsgcHJpY2UuXHJcbiAgY29uc3QgeyBtYXhHYXNQcmljZUd3ZWksIHNvdXJjZTogZ2FzQ2FwU291cmNlIH0gPSBhd2FpdCByZXNvbHZlTWF4R2FzUHJpY2VHd2VpKGN1cnJlbnROZXR3b3JrKTtcclxuICBpZiAoZ2FzQ2FwU291cmNlICE9PSAnbGl2ZScpIHtcclxuICAgIGNvbnNvbGUud2Fybihg8J+rgCBHYXMgcHJpY2UgY2FwIGRlcml2ZWQgZnJvbSAke2dhc0NhcFNvdXJjZX0gcHJpY2UgKFJQQyB1bmF2YWlsYWJsZSlgKTtcclxuICB9XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBDb21wcmVoZW5zaXZlIHRyYW5zYWN0aW9uIHZhbGlkYXRpb25cclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVUcmFuc2FjdGlvblJlcXVlc3QodHhSZXF1ZXN0LCBtYXhHYXNQcmljZUd3ZWkpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgdHJhbnNhY3Rpb24gZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9ycyk7XHJcbiAgICByZXR1cm4geyBcclxuICAgICAgZXJyb3I6IHsgXHJcbiAgICAgICAgY29kZTogLTMyNjAyLCBcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCB0cmFuc2FjdGlvbjogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3JzLmpvaW4oJzsgJykpIFxyXG4gICAgICB9IFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIFVzZSBzYW5pdGl6ZWQgdHJhbnNhY3Rpb24gcGFyYW1ldGVyc1xyXG4gIGNvbnN0IHNhbml0aXplZFR4ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIEluY3JlbWVudCByYXRlIGxpbWl0IGNvdW50ZXJcclxuICBpbmNyZW1lbnRSYXRlTGltaXQob3JpZ2luKTtcclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcblxyXG4gICAgLy8gU0VDVVJJVFk6IEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIFN0b3JlIHNhbml0aXplZCB0cmFuc2FjdGlvbiBpbnN0ZWFkIG9mIG9yaWdpbmFsIHJlcXVlc3RcclxuICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuc2V0KHJlcXVlc3RJZCwgeyBcclxuICAgICAgcmVzb2x2ZSwgXHJcbiAgICAgIHJlamVjdCwgXHJcbiAgICAgIG9yaWdpbiwgXHJcbiAgICAgIHR4UmVxdWVzdDogc2FuaXRpemVkVHgsXHJcbiAgICAgIGFwcHJvdmFsVG9rZW4gIC8vIEluY2x1ZGUgdG9rZW4gZm9yIHZhbGlkYXRpb25cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249dHJhbnNhY3Rpb24mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgZGVjcmVtZW50UGVuZGluZ0NvdW50KG9yaWdpbik7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVHJhbnNhY3Rpb24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgdHJhbnNhY3Rpb24gYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNlc3Npb25Ub2tlbiwgZ2FzUHJpY2UsIGN1c3RvbU5vbmNlLCB0eEhhc2gsIHR4RGV0YWlscyA9IG51bGwpIHtcclxuICBpZiAoIXBlbmRpbmdUcmFuc2FjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0eFJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdUcmFuc2FjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBWYWxpZGF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiB0byBwcmV2ZW50IHJlcGxheSBhdHRhY2tzXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nVHJhbnNhY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICAvLyBEZWNyZW1lbnQgcGVuZGluZyBjb3VudGVyIChyZXF1ZXN0IGNvbXBsZXRlZClcclxuICBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KHVzZXJSZWplY3Rpb24oJ1VzZXIgcmVqZWN0ZWQgdHJhbnNhY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIHR4SGFzaCBpcyBwcm92aWRlZCwgdHJhbnNhY3Rpb24gd2FzIGFscmVhZHkgc2lnbmVkIGFuZCBicm9hZGNhc3QgaW4gdGhlIHBvcHVwXHJcbiAgICAvLyAoYnkgaGFyZHdhcmUgd2FsbGV0IE9SIHNvZnR3YXJlIHdhbGxldCkuIEp1c3Qgc2F2ZSB0byBoaXN0b3J5IGFuZCByZXNvbHZlLlxyXG4gICAgaWYgKHR4SGFzaCkge1xyXG4gICAgICBjb25zdCB3YWxsZXRUeXBlID0gdHhEZXRhaWxzID8gJ3NvZnR3YXJlJyA6ICdoYXJkd2FyZSc7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDwn6uAICR7d2FsbGV0VHlwZX0gd2FsbGV0IHRyYW5zYWN0aW9uIGFscmVhZHkgYnJvYWRjYXN0OmAsIHR4SGFzaCk7XHJcblxyXG4gICAgICAvLyBHZXQgYWN0aXZlIHdhbGxldCBmb3Igc2F2aW5nIHRvIGhpc3RvcnlcclxuICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG5cclxuICAgICAgLy8gU2F2ZSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5ICh1c2UgdHhEZXRhaWxzIGlmIHByb3ZpZGVkIGZvciBhY2N1cmF0ZSBkYXRhKVxyXG4gICAgICBjb25zdCBoaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgICAgaGFzaDogdHhIYXNoLFxyXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgICBmcm9tOiBhY3RpdmVXYWxsZXQuYWRkcmVzcyxcclxuICAgICAgICB0bzogdHhEZXRhaWxzPy50byB8fCB0eFJlcXVlc3QudG8gfHwgbnVsbCxcclxuICAgICAgICB2YWx1ZTogdHhEZXRhaWxzPy52YWx1ZSB8fCB0eFJlcXVlc3QudmFsdWUgfHwgJzAnLFxyXG4gICAgICAgIGRhdGE6IHR4RGV0YWlscz8uZGF0YSB8fCB0eFJlcXVlc3QuZGF0YSB8fCAnMHgnLFxyXG4gICAgICAgIGdhc1ByaWNlOiB0eERldGFpbHM/Lmdhc1ByaWNlIHx8ICcwJyxcclxuICAgICAgICBnYXNMaW1pdDogdHhEZXRhaWxzPy5nYXNMaW1pdCB8fCB0eFJlcXVlc3QuZ2FzTGltaXQgfHwgdHhSZXF1ZXN0LmdhcyB8fCBudWxsLFxyXG4gICAgICAgIG5vbmNlOiB0eERldGFpbHM/Lm5vbmNlID8/IG51bGwsXHJcbiAgICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICB0eXBlOiB0eEhpc3RvcnkuVFhfVFlQRVMuQ09OVFJBQ1RcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEluY2x1ZGUgRUlQLTE1NTkgZmllbGRzIGlmIHByb3ZpZGVkIChuZWVkZWQgZm9yIHNwZWVkLXVwL2NhbmNlbClcclxuICAgICAgaWYgKHR4RGV0YWlscz8ubWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgaGlzdG9yeUVudHJ5Lm1heEZlZVBlckdhcyA9IHR4RGV0YWlscy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR4RGV0YWlscz8ubWF4UHJpb3JpdHlGZWVQZXJHYXMpIHtcclxuICAgICAgICBoaXN0b3J5RW50cnkubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSB0eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShhY3RpdmVXYWxsZXQuYWRkcmVzcywgaGlzdG9yeUVudHJ5KTtcclxuXHJcbiAgICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU2VudCcsXHJcbiAgICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIHNlbnQ6ICR7dHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5gLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gU3RhcnQgbW9uaXRvcmluZyB0cmFuc2FjdGlvbiBmb3IgY29uZmlybWF0aW9uXHJcbiAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHsgaGFzaDogdHhIYXNoIH0sIHByb3ZpZGVyLCBhY3RpdmVXYWxsZXQuYWRkcmVzcyk7XHJcblxyXG4gICAgICAvLyBMb2cgc3VjY2Vzc2Z1bCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgICB0eXBlOiAndHJhbnNhY3Rpb24nLFxyXG4gICAgICAgIGFkZHJlc3M6IGFjdGl2ZVdhbGxldC5hZGRyZXNzLFxyXG4gICAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICAgIG1ldGhvZDogJ2V0aF9zZW5kVHJhbnNhY3Rpb24nLFxyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgdHhIYXNoOiB0eEhhc2gsXHJcbiAgICAgICAgd2FsbGV0VHlwZTogd2FsbGV0VHlwZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFJlc29sdmUgd2l0aCB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgICAgIHJlc29sdmUoeyByZXN1bHQ6IHR4SGFzaCB9KTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU29mdHdhcmUgd2FsbGV0IGZsb3cgLSB2YWxpZGF0ZSBzZXNzaW9uIGFuZCBnZXQgcGFzc3dvcmQgKG5vdyBhc3luYylcclxuICAgIGxldCBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG4gICAgbGV0IHNpZ25lciA9IG51bGw7XHJcbiAgICBsZXQgY29ubmVjdGVkU2lnbmVyID0gbnVsbDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgLy8gVW5sb2NrIHdhbGxldCB3aXRoIGF1dG8tdXBncmFkZSBub3RpZmljYXRpb25cclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICAvLyBOb3RpZnkgdXNlciB0aGF0IHdhbGxldCBlbmNyeXB0aW9uIGlzIGJlaW5nIHVwZ3JhZGVkXHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0IGVuY3J5cHRpb246ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYCk7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAn8J+UkCBTZWN1cml0eSBVcGdyYWRlIGluIFByb2dyZXNzJyxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBVcGdyYWRpbmcgd2FsbGV0IGVuY3J5cHRpb24gdG8gJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zIGZvciBlbmhhbmNlZCBzZWN1cml0eS4uLmAsXHJcbiAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG4gICAgY29uc3QgeyB1cGdyYWRlZCwgaXRlcmF0aW9uc0JlZm9yZSwgaXRlcmF0aW9uc0FmdGVyIH0gPSB1bmxvY2tSZXN1bHQ7XHJcblxyXG4gICAgLy8gU2hvdyBjb21wbGV0aW9uIG5vdGlmaWNhdGlvbiBpZiB1cGdyYWRlIG9jY3VycmVkXHJcbiAgICBpZiAodXBncmFkZWQpIHtcclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAn4pyFIFNlY3VyaXR5IFVwZ3JhZGUgQ29tcGxldGUnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBXYWxsZXQgZW5jcnlwdGlvbiB1cGdyYWRlZDogJHtpdGVyYXRpb25zQmVmb3JlLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2l0ZXJhdGlvbnNBZnRlci50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgY3VycmVudCBuZXR3b3JrXHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG5cclxuICAgIC8vIENvbm5lY3Qgc2lnbmVyIHRvIHByb3ZpZGVyXHJcbiAgICBjb25uZWN0ZWRTaWduZXIgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gUHJlcGFyZSB0cmFuc2FjdGlvbiAtIGNyZWF0ZSBhIGNsZWFuIGNvcHkgd2l0aCBvbmx5IG5lY2Vzc2FyeSBmaWVsZHNcclxuICAgIGNvbnN0IHR4VG9TZW5kID0ge1xyXG4gICAgICB0bzogdHhSZXF1ZXN0LnRvLFxyXG4gICAgICB2YWx1ZTogdHhSZXF1ZXN0LnZhbHVlIHx8ICcweDAnLFxyXG4gICAgICBkYXRhOiB0eFJlcXVlc3QuZGF0YSB8fCAnMHgnXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE5vbmNlIGhhbmRsaW5nIHByaW9yaXR5OlxyXG4gICAgLy8gMS4gVXNlci1wcm92aWRlZCBjdXN0b20gbm9uY2UgKGZvciByZXBsYWNpbmcgc3R1Y2sgdHJhbnNhY3Rpb25zKVxyXG4gICAgLy8gMi4gREFwcC1wcm92aWRlZCBub25jZSAodmFsaWRhdGVkKVxyXG4gICAgLy8gMy4gQXV0by1mZXRjaCBieSBldGhlcnMuanNcclxuICAgIGlmIChjdXN0b21Ob25jZSAhPT0gdW5kZWZpbmVkICYmIGN1c3RvbU5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIFVzZXIgbWFudWFsbHkgc2V0IG5vbmNlIChlLmcuLCB0byByZXBsYWNlIHN0dWNrIHRyYW5zYWN0aW9uKVxyXG4gICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHNpZ25lci5hZGRyZXNzLCAncGVuZGluZycpO1xyXG5cclxuICAgICAgaWYgKGN1c3RvbU5vbmNlIDwgY3VycmVudE5vbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDdXN0b20gbm9uY2UgJHtjdXN0b21Ob25jZX0gaXMgbGVzcyB0aGFuIGN1cnJlbnQgbm9uY2UgJHtjdXJyZW50Tm9uY2V9LiBUaGlzIG1heSBmYWlsIHVubGVzcyB5b3UncmUgcmVwbGFjaW5nIGEgcGVuZGluZyB0cmFuc2FjdGlvbi5gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHhUb1NlbmQubm9uY2UgPSBjdXN0b21Ob25jZTtcclxuICAgICAgLy8gVXNpbmcgY3VzdG9tIG5vbmNlXHJcbiAgICB9IGVsc2UgaWYgKHR4UmVxdWVzdC5ub25jZSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5ub25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBTRUNVUklUWTogVmFsaWRhdGUgbm9uY2UgaWYgcHJvdmlkZWQgYnkgREFwcFxyXG4gICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHNpZ25lci5hZGRyZXNzLCAncGVuZGluZycpO1xyXG4gICAgICBjb25zdCBwcm92aWRlZE5vbmNlID0gdHlwZW9mIHR4UmVxdWVzdC5ub25jZSA9PT0gJ3N0cmluZydcclxuICAgICAgICA/IHBhcnNlSW50KHR4UmVxdWVzdC5ub25jZSwgMTYpXHJcbiAgICAgICAgOiB0eFJlcXVlc3Qubm9uY2U7XHJcblxyXG4gICAgICAvLyBOb25jZSBtdXN0IGJlID49IGN1cnJlbnQgcGVuZGluZyBub25jZVxyXG4gICAgICBpZiAocHJvdmlkZWROb25jZSA8IGN1cnJlbnROb25jZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBub25jZTogJHtwcm92aWRlZE5vbmNlfSBpcyBsZXNzIHRoYW4gY3VycmVudCBub25jZSAke2N1cnJlbnROb25jZX1gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHhUb1NlbmQubm9uY2UgPSBwcm92aWRlZE5vbmNlO1xyXG4gICAgICAvLyBVc2luZyBEQXBwLXByb3ZpZGVkIG5vbmNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBJZiBubyBub25jZSBwcm92aWRlZCwgZXRoZXJzLmpzIHdpbGwgZmV0Y2ggdGhlIGNvcnJlY3Qgb25lIGF1dG9tYXRpY2FsbHlcclxuICAgICAgLy8gQXV0by1mZXRjaGluZyBub25jZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIERBcHAgcHJvdmlkZWQgYSBnYXMgbGltaXQsIHVzZSBpdC4gT3RoZXJ3aXNlIGxldCBldGhlcnMgZXN0aW1hdGUuXHJcbiAgICBpZiAodHhSZXF1ZXN0LmdhcyB8fCB0eFJlcXVlc3QuZ2FzTGltaXQpIHtcclxuICAgICAgdHhUb1NlbmQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzIHx8IHR4UmVxdWVzdC5nYXNMaW1pdDtcclxuICAgICAgLy8gVXNpbmcgcHJvdmlkZWQgZ2FzIGxpbWl0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRUlQLTE1NTkgZmVlczogdXNlIGEgZ2VuZXJvdXMgbWF4RmVlUGVyR2FzIGNhcCBzbyBQdWxzZUNoYWluJ3Mgdm9sYXRpbGUgYmFzZSBmZWVcclxuICAgIC8vIGNhbm5vdCBzdHJhbmQgdGhlIHRyYW5zYWN0aW9uIChvbmx5IHRoZSBhY3R1YWwgYmFzZSBmZWUgKyB0aXAgaXMgY2hhcmdlZCwgc28gdGhlXHJcbiAgICAvLyBoaWdoIGNhcCBjb3N0cyBub3RoaW5nIGV4dHJhKS4gQW55IFVJLXNlbGVjdGVkIGBnYXNQcmljZWAgaXMgaG9ub3JlZCBhcyBhIGZsb29yLlxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZmVlcyA9IGF3YWl0IHJwYy5nZXRFaXAxNTU5RmVlcyhuZXR3b3JrLCBnYXNQcmljZSB8fCBudWxsKTtcclxuICAgICAgdHhUb1NlbmQubWF4RmVlUGVyR2FzID0gZmVlcy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgIHR4VG9TZW5kLm1heFByaW9yaXR5RmVlUGVyR2FzID0gZmVlcy5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignRUlQLTE1NTkgZmVlIGNhbGMgZmFpbGVkLCBmYWxsaW5nIGJhY2sgdG8gcHJvdmlkZXIgZmVlIGRhdGE6JywgZXJyb3IpO1xyXG4gICAgICBjb25zdCBmZCA9IGF3YWl0IHByb3ZpZGVyLmdldEZlZURhdGEoKTtcclxuICAgICAgaWYgKGZkLm1heEZlZVBlckdhcykge1xyXG4gICAgICAgIHR4VG9TZW5kLm1heEZlZVBlckdhcyA9IGZkLm1heEZlZVBlckdhcztcclxuICAgICAgICB0eFRvU2VuZC5tYXhQcmlvcml0eUZlZVBlckdhcyA9IGZkLm1heFByaW9yaXR5RmVlUGVyR2FzID8/IChmZC5tYXhGZWVQZXJHYXMgLyAxMG4pO1xyXG4gICAgICB9IGVsc2UgaWYgKGZkLmdhc1ByaWNlKSB7XHJcbiAgICAgICAgdHhUb1NlbmQuZ2FzUHJpY2UgPSBmZC5nYXNQcmljZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNlbmQgdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgY29ubmVjdGVkU2lnbmVyLnNlbmRUcmFuc2FjdGlvbih0eFRvU2VuZCk7XHJcblxyXG4gICAgLy8gVHJhbnNhY3Rpb24gc2VudFxyXG5cclxuICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSAobmV0d29yayB2YXJpYWJsZSBhbHJlYWR5IGRlZmluZWQgYWJvdmUpXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3Rvcnkoc2lnbmVyLmFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBzaWduZXIuYWRkcmVzcyxcclxuICAgICAgdG86IHR4UmVxdWVzdC50byB8fCBudWxsLFxyXG4gICAgICB2YWx1ZTogdHhSZXF1ZXN0LnZhbHVlIHx8ICcwJyxcclxuICAgICAgZGF0YTogdHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogdHguZ2FzUHJpY2UgPyB0eC5nYXNQcmljZS50b1N0cmluZygpIDogKHR4Lm1heEZlZVBlckdhcyA/IHR4Lm1heEZlZVBlckdhcy50b1N0cmluZygpIDogJzAnKSxcclxuICAgICAgbWF4RmVlUGVyR2FzOiB0eC5tYXhGZWVQZXJHYXMgPyB0eC5tYXhGZWVQZXJHYXMudG9TdHJpbmcoKSA6IHVuZGVmaW5lZCxcclxuICAgICAgbWF4UHJpb3JpdHlGZWVQZXJHYXM6IHR4Lm1heFByaW9yaXR5RmVlUGVyR2FzID8gdHgubWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKSA6IHVuZGVmaW5lZCxcclxuICAgICAgZ2FzTGltaXQ6IHR4Lmdhc0xpbWl0ID8gdHguZ2FzTGltaXQudG9TdHJpbmcoKSA6IG51bGwsXHJcbiAgICAgIG5vbmNlOiB0eC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiB0eEhpc3RvcnkuVFhfVFlQRVMuQ09OVFJBQ1RcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNlbnQnLFxyXG4gICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gc2VudDogJHt0eC5oYXNoLnNsaWNlKDAsIDIwKX0uLi5gLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uIGluIGJhY2tncm91bmRcclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBzaWduZXIuYWRkcmVzcyk7XHJcblxyXG4gICAgLy8gTG9nIHN1Y2Nlc3NmdWwgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiAndHJhbnNhY3Rpb24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduZXIuYWRkcmVzcyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogJ2V0aF9zZW5kVHJhbnNhY3Rpb24nLFxyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICB0eEhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFJlc29sdmUgd2l0aCB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiB0eC5oYXNoIH0pO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCB9O1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICAgIC8vIE92ZXJ3cml0ZSBwYXNzd29yZCB3aXRoIGdhcmJhZ2UgYmVmb3JlIGRlcmVmZXJlbmNpbmdcclxuICAgICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgICAgcGFzc3dvcmQgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDbGVhbiB1cCBzaWduZXIncyBwcml2YXRlIGtleVxyXG4gICAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICAgIHNpZ25lciA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGNvbm5lY3RlZFNpZ25lcikge1xyXG4gICAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoY29ubmVjdGVkU2lnbmVyKTtcclxuICAgICAgICBjb25uZWN0ZWRTaWduZXIgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVHJhbnNhY3Rpb24gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgY29uc3Qgc2FuaXRpemVkRXJyb3IgPSBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKTtcclxuXHJcbiAgICAvLyBMb2cgZmFpbGVkIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogJ3RyYW5zYWN0aW9uJyxcclxuICAgICAgYWRkcmVzczogJ3Vua25vd24nLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiAnZXRoX3NlbmRUcmFuc2FjdGlvbicsXHJcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICBlcnJvcjogc2FuaXRpemVkRXJyb3IsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIHJlamVjdChuZXcgRXJyb3Ioc2FuaXRpemVkRXJyb3IpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVkRXJyb3IgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCB0cmFuc2FjdGlvbiByZXF1ZXN0IGRldGFpbHMgZm9yIHBvcHVwXHJcbmZ1bmN0aW9uIGdldFRyYW5zYWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4sIHR4UmVxdWVzdCB9ID0gcGVuZGluZ1RyYW5zYWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiwgdHhSZXF1ZXN0IH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3dhdGNoQXNzZXQgLSBBZGQgY3VzdG9tIHRva2VuIChFSVAtNzQ3KVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVXYXRjaEFzc2V0KHBhcmFtcywgb3JpZ2luLCB0YWIpIHtcclxuICAvLyBSZWNlaXZlZCB3YWxsZXRfd2F0Y2hBc3NldCByZXF1ZXN0XHJcblxyXG4gIC8vIFZhbGlkYXRlIHBhcmFtcyBzdHJ1Y3R1cmVcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zLnR5cGUgfHwgIXBhcmFtcy5vcHRpb25zKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHBhcmFtczogbXVzdCBpbmNsdWRlIHR5cGUgYW5kIG9wdGlvbnMnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgdHlwZSwgb3B0aW9ucyB9ID0gcGFyYW1zO1xyXG5cclxuICAvLyBPbmx5IHN1cHBvcnQgRVJDMjAvUFJDMjAgdG9rZW5zXHJcbiAgaWYgKHR5cGUudG9VcHBlckNhc2UoKSAhPT0gJ0VSQzIwJykge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnT25seSBFUkMyMC9QUkMyMCB0b2tlbnMgYXJlIHN1cHBvcnRlZCcgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgdG9rZW4gZmllbGRzXHJcbiAgaWYgKCFvcHRpb25zLmFkZHJlc3MgfHwgIW9wdGlvbnMuc3ltYm9sKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdUb2tlbiBtdXN0IGhhdmUgYWRkcmVzcyBhbmQgc3ltYm9sJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogZXZlcnkgZmllbGQgaGVyZSBpcyBkQXBwLWNvbnRyb2xsZWQgYW5kIGdldHMgc2hvd24gb24gYW4gYXBwcm92YWxcclxuICAvLyBzY3JlZW4sIHNvIHZhbGlkYXRlL2JvdW5kIGFsbCBvZiBpdC4gQW4gdW5ib3VuZGVkIHN5bWJvbCBjYW4gcHVzaCB0aGUgcmVhbFxyXG4gIC8vIG9yaWdpbiBhbmQgYWRkcmVzcyBvdXQgb2YgdmlldzsgYW4gYXJiaXRyYXJ5IGltYWdlIFVSTCBib3RoIGJlYWNvbnMgdGhlIHVzZXInc1xyXG4gIC8vIElQIGFuZCBsZXRzIGEgc2NhbSB0b2tlbiB3ZWFyIGEgbGVnaXRpbWF0ZSB0b2tlbidzIGxvZ28uXHJcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmFkZHJlc3MgIT09ICdzdHJpbmcnIHx8ICFldGhlcnMuaXNBZGRyZXNzKG9wdGlvbnMuYWRkcmVzcykpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ1Rva2VuIGFkZHJlc3MgaXMgbm90IGEgdmFsaWQgYWRkcmVzcycgfSB9O1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBvcHRpb25zLnN5bWJvbCAhPT0gJ3N0cmluZycpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ1Rva2VuIHN5bWJvbCBtdXN0IGJlIGEgc3RyaW5nJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBzeW1ib2wgPSBvcHRpb25zLnN5bWJvbFxyXG4gICAgLnJlcGxhY2UoL1tcXHUwMDAwLVxcdTAwMUZcXHUwMDdGLVxcdTAwOUZdL2csICcnKVxyXG4gICAgLnJlcGxhY2UoL1tcXHUyMDBCLVxcdTIwMEZcXHUyMDJBLVxcdTIwMkVcXHUyMDYwLVxcdTIwNjRcXHUyMDY2LVxcdTIwNjlcXHVGRUZGXS9nLCAnJylcclxuICAgIC50cmltKClcclxuICAgIC5zbGljZSgwLCAxNik7XHJcbiAgaWYgKCFzeW1ib2wpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ1Rva2VuIHN5bWJvbCBpcyBlbXB0eSBvciBpbnZhbGlkJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBkZWNpbWFscyA9IE51bWJlcihvcHRpb25zLmRlY2ltYWxzID8/IDE4KTtcclxuICBpZiAoIU51bWJlci5pc0ludGVnZXIoZGVjaW1hbHMpIHx8IGRlY2ltYWxzIDwgMCB8fCBkZWNpbWFscyA+IDM2KSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdUb2tlbiBkZWNpbWFscyBvdXQgb2YgcmFuZ2UnIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIE9ubHkgYWxsb3cgaHR0cHMgaW1hZ2UgVVJMcywgYW5kIGNhcCB0aGUgbGVuZ3RoLiBBbnl0aGluZyBlbHNlIGlzIGRyb3BwZWRcclxuICAvLyByYXRoZXIgdGhhbiByZWplY3RlZCwgc28gYSBiYWQgaW1hZ2UgZG9lcyBub3QgYmxvY2sgYW4gb3RoZXJ3aXNlIHZhbGlkIHJlcXVlc3QuXHJcbiAgbGV0IGltYWdlID0gbnVsbDtcclxuICBpZiAodHlwZW9mIG9wdGlvbnMuaW1hZ2UgPT09ICdzdHJpbmcnICYmIG9wdGlvbnMuaW1hZ2UubGVuZ3RoIDw9IDIwNDgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmIChuZXcgVVJMKG9wdGlvbnMuaW1hZ2UpLnByb3RvY29sID09PSAnaHR0cHM6Jykge1xyXG4gICAgICAgIGltYWdlID0gb3B0aW9ucy5pbWFnZTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8vIE5vdCBhIHBhcnNlYWJsZSBVUkwgLSBkcm9wIGl0XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCB0b2tlbkluZm8gPSB7XHJcbiAgICBhZGRyZXNzOiBvcHRpb25zLmFkZHJlc3MudG9Mb3dlckNhc2UoKSxcclxuICAgIHN5bWJvbCxcclxuICAgIGRlY2ltYWxzLFxyXG4gICAgaW1hZ2VcclxuICB9O1xyXG5cclxuICAvLyBSZXF1ZXN0aW5nIHRvIGFkZCB0b2tlblxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuICAgIHBlbmRpbmdUb2tlblJlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRva2VuSW5mbyB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPWFkZFRva2VuJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA1MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVG9rZW4gYWRkIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHRva2VuIGFkZCBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuQWRkQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCkge1xyXG4gIGlmICghcGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgdG9rZW5JbmZvIH0gPSBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KHVzZXJSZWplY3Rpb24oJ1VzZXIgcmVqZWN0ZWQgdG9rZW4nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFRva2VuIGFwcHJvdmVkIC0gcmV0dXJuIHRydWUgKHdhbGxldF93YXRjaEFzc2V0IHJldHVybnMgYm9vbGVhbilcclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHRydWUgfSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0b2tlbkluZm8gfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBUb2tlbiBhZGQgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCB0b2tlbiBhZGQgcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRUb2tlbkFkZFJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdG9rZW5JbmZvIH0gPSBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiwgdG9rZW5JbmZvIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBTcGVlZCB1cCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gYnkgcmVwbGFjaW5nIGl0IHdpdGggaGlnaGVyIGdhcyBwcmljZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24oYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHNlc3Npb25Ub2tlbiwgZ2FzUHJpY2VNdWx0aXBsaWVyID0gMS4yLCBjdXN0b21HYXNQcmljZSA9IG51bGwpIHtcclxuICBsZXQgcGFzc3dvcmQgPSBudWxsO1xyXG4gIGxldCBzaWduZXIgPSBudWxsO1xyXG4gIGxldCB3YWxsZXQgPSBudWxsO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVmFsaWRhdGUgc2Vzc2lvbiAobm93IGFzeW5jKVxyXG4gICAgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBHZXQgb3JpZ2luYWwgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUeCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICBpZiAoIW9yaWdpbmFsVHgpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gbm90IGZvdW5kJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcmlnaW5hbFR4LnN0YXR1cyAhPT0gdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGlzIG5vdCBwZW5kaW5nJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCB3YWxsZXQgYW5kIHVubG9jayAoYXV0by11cGdyYWRlIGlmIG5lZWRlZClcclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcblxyXG4gICAgLy8gU0VDVVJJVFk6IFZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYmVsb25ncyB0byB0aGlzIHdhbGxldFxyXG4gICAgY29uc3Qgd2FsbGV0QWRkcmVzcyA9IGF3YWl0IHNpZ25lci5nZXRBZGRyZXNzKCk7XHJcbiAgICBpZiAod2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBBZGRyZXNzIG1pc21hdGNoIGluIHNwZWVkLXVwOiB3YWxsZXQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCByZXF1ZXN0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1dhbGxldCBhZGRyZXNzIG1pc21hdGNoJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFZlcmlmeSBvcmlnaW5hbCB0cmFuc2FjdGlvbiBpcyBmcm9tIHRoaXMgd2FsbGV0XHJcbiAgICBpZiAob3JpZ2luYWxUeC5mcm9tICYmIG9yaWdpbmFsVHguZnJvbS50b0xvd2VyQ2FzZSgpICE9PSB3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBUcmFuc2FjdGlvbiBvd25lcnNoaXAgY2hlY2sgZmFpbGVkOiB0cmFuc2FjdGlvbiBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyB3YWxsZXQnKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgYWN0dWFsIHRyYW5zYWN0aW9uIGZyb20gYmxvY2tjaGFpbiB0byBjaGVjayBpdHMgdHlwZVxyXG4gICAgLy8gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBvbGRlciB0cmFuc2FjdGlvbnMgaW4gaGlzdG9yeSBtYXkgbm90IGhhdmUgRUlQLTE1NTkgZmllbGRzIHN0b3JlZFxyXG4gICAgbGV0IGlzRUlQMTU1OSA9IG9yaWdpbmFsVHgubWF4RmVlUGVyR2FzIHx8IG9yaWdpbmFsVHgubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICBsZXQgb25DaGFpbk1heEZlZVBlckdhcyA9IG51bGw7XHJcbiAgICBsZXQgb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzID0gbnVsbDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBvbkNoYWluVHggPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbihvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICAgIGlmIChvbkNoYWluVHgpIHtcclxuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIEVJUC0xNTU5ICh0eXBlIDIpXHJcbiAgICAgICAgaWYgKG9uQ2hhaW5UeC50eXBlID09PSAyIHx8IG9uQ2hhaW5UeC5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICAgIGlzRUlQMTU1OSA9IHRydWU7XHJcbiAgICAgICAgICBvbkNoYWluTWF4RmVlUGVyR2FzID0gb25DaGFpblR4Lm1heEZlZVBlckdhcztcclxuICAgICAgICAgIG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyA9IG9uQ2hhaW5UeC5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIERldGVjdGVkIEVJUC0xNTU5IHRyYW5zYWN0aW9uIGZyb20gYmxvY2tjaGFpbjonLCB7XHJcbiAgICAgICAgICAgIG1heEZlZVBlckdhczogb25DaGFpbk1heEZlZVBlckdhcz8udG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgbWF4UHJpb3JpdHlGZWVQZXJHYXM6IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcz8udG9TdHJpbmcoKVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChmZXRjaEVycikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQ291bGQgbm90IGZldGNoIG9yaWdpbmFsIHR4IGZyb20gYmxvY2tjaGFpbjonLCBmZXRjaEVyci5tZXNzYWdlKTtcclxuICAgICAgLy8gQ29udGludWUgd2l0aCB3aGF0IHdlIGhhdmUgZnJvbSBoaXN0b3J5XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHdpdGggc2FtZSBub25jZSwgZGF0YSwgYW5kIGdhc0xpbWl0XHJcbiAgICBjb25zdCByZXBsYWNlbWVudFR4ID0ge1xyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIGRhdGE6IG9yaWdpbmFsVHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBJbmNsdWRlIGdhc0xpbWl0IGlmIGl0IHdhcyBpbiB0aGUgb3JpZ2luYWwgdHJhbnNhY3Rpb25cclxuICAgIGlmIChvcmlnaW5hbFR4Lmdhc0xpbWl0KSB7XHJcbiAgICAgIHJlcGxhY2VtZW50VHguZ2FzTGltaXQgPSBvcmlnaW5hbFR4Lmdhc0xpbWl0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZvciBzdG9yaW5nIGluIGhpc3RvcnlcclxuICAgIGxldCBuZXdHYXNQcmljZSA9IG51bGw7XHJcbiAgICBsZXQgbmV3TWF4RmVlUGVyR2FzID0gbnVsbDtcclxuICAgIGxldCBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IG51bGw7XHJcblxyXG4gICAgaWYgKGlzRUlQMTU1OSkge1xyXG4gICAgICAvLyBFSVAtMTU1OTogTXVzdCBidW1wIEJPVEggbWF4RmVlUGVyR2FzIGFuZCBtYXhQcmlvcml0eUZlZVBlckdhcyBieSBhdCBsZWFzdCAxMCVcclxuICAgICAgLy8gVXNpbmcgMTIuNSUgYnVtcCB0byBlbnN1cmUgYWNjZXB0YW5jZSAoc2FtZSBhcyBFdGhlcmV1bSBkZWZhdWx0KVxyXG4gICAgICBjb25zdCBidW1wTXVsdGlwbGllciA9IDExMjVuOyAvLyAxMTIuNSUgPSAxLjEyNXhcclxuICAgICAgY29uc3QgYnVtcERpdmlzb3IgPSAxMDAwbjtcclxuXHJcbiAgICAgIC8vIFVzZSBvbi1jaGFpbiB2YWx1ZXMgaWYgYXZhaWxhYmxlIChtb3JlIGFjY3VyYXRlKSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBoaXN0b3J5XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsTWF4RmVlID0gb25DaGFpbk1heEZlZVBlckdhcyB8fCBCaWdJbnQob3JpZ2luYWxUeC5tYXhGZWVQZXJHYXMgfHwgb3JpZ2luYWxUeC5nYXNQcmljZSB8fCAnMCcpO1xyXG4gICAgICBjb25zdCBvcmlnaW5hbFByaW9yaXR5RmVlID0gb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzIHx8IEJpZ0ludChvcmlnaW5hbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzIHx8ICcwJyk7XHJcblxyXG4gICAgICBpZiAoY3VzdG9tR2FzUHJpY2UpIHtcclxuICAgICAgICAvLyBDdXN0b20gZ2FzIHByaWNlOiB1c2UgaXQgZm9yIG1heEZlZVBlckdhcywgY2FsY3VsYXRlIHByaW9yaXR5IGZlZVxyXG4gICAgICAgIGNvbnN0IGN1c3RvbUZlZSA9IEJpZ0ludChjdXN0b21HYXNQcmljZSk7XHJcbiAgICAgICAgLy8gUHJpb3JpdHkgZmVlIHNob3VsZCBiZSBhdCBsZWFzdCAxMi41JSBoaWdoZXIgdGhhbiBvcmlnaW5hbFxyXG4gICAgICAgIGNvbnN0IG1pblByaW9yaXR5RmVlID0gKG9yaWdpbmFsUHJpb3JpdHlGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuICAgICAgICAvLyBVc2UgYXQgbGVhc3QgMSBHd2VpIGZvciBwcmlvcml0eSBmZWUgaWYgbm90IHNldFxyXG4gICAgICAgIGNvbnN0IHByaW9yaXR5RmVlID0gbWluUHJpb3JpdHlGZWUgPiAwbiA/IG1pblByaW9yaXR5RmVlIDogMTAwMDAwMDAwMG47XHJcblxyXG4gICAgICAgIG5ld01heEZlZVBlckdhcyA9IGN1c3RvbUZlZTtcclxuICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IHByaW9yaXR5RmVlIDwgY3VzdG9tRmVlID8gcHJpb3JpdHlGZWUgOiBjdXN0b21GZWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGJ1bXBlZCBmZWVzICgxMi41JSBoaWdoZXIpXHJcbiAgICAgICAgbmV3TWF4RmVlUGVyR2FzID0gKG9yaWdpbmFsTWF4RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSAob3JpZ2luYWxQcmlvcml0eUZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG5cclxuICAgICAgICAvLyBFbnN1cmUgcHJpb3JpdHkgZmVlIGlzIGF0IGxlYXN0IDEgR3dlaVxyXG4gICAgICAgIGlmIChuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA8IDEwMDAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IDEwMDAwMDAwMDBuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmVwbGFjZW1lbnRUeC5tYXhGZWVQZXJHYXMgPSBuZXdNYXhGZWVQZXJHYXM7XHJcbiAgICAgIHJlcGxhY2VtZW50VHgubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBuZXdNYXhQcmlvcml0eUZlZVBlckdhcztcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn6uAIEVJUC0xNTU5IHNwZWVkLXVwOicsIHtcclxuICAgICAgICBvcmlnaW5hbE1heEZlZTogb3JpZ2luYWxNYXhGZWUudG9TdHJpbmcoKSxcclxuICAgICAgICBvcmlnaW5hbFByaW9yaXR5RmVlOiBvcmlnaW5hbFByaW9yaXR5RmVlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbmV3TWF4RmVlOiBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKSxcclxuICAgICAgICBuZXdQcmlvcml0eUZlZTogbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIExlZ2FjeSB0cmFuc2FjdGlvbjogdXNlIGdhc1ByaWNlXHJcbiAgICAgIGlmIChjdXN0b21HYXNQcmljZSkge1xyXG4gICAgICAgIC8vIFVzZSBjdXN0b20gZ2FzIHByaWNlIHByb3ZpZGVkIGJ5IHVzZXJcclxuICAgICAgICBuZXdHYXNQcmljZSA9IEJpZ0ludChjdXN0b21HYXNQcmljZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGZyb20gbXVsdGlwbGllciAoMS4yeCBvZiBvcmlnaW5hbCBieSBkZWZhdWx0KVxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsR2FzUHJpY2UgPSBCaWdJbnQob3JpZ2luYWxUeC5nYXNQcmljZSk7XHJcbiAgICAgICAgbmV3R2FzUHJpY2UgPSAob3JpZ2luYWxHYXNQcmljZSAqIEJpZ0ludChNYXRoLmZsb29yKGdhc1ByaWNlTXVsdGlwbGllciAqIDEwMCkpKSAvIEJpZ0ludCgxMDApO1xyXG4gICAgICB9XHJcbiAgICAgIHJlcGxhY2VtZW50VHguZ2FzUHJpY2UgPSBuZXdHYXNQcmljZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTcGVlZGluZyB1cCB0cmFuc2FjdGlvblxyXG5cclxuICAgIC8vIFNlbmQgcmVwbGFjZW1lbnQgdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgd2FsbGV0LnNlbmRUcmFuc2FjdGlvbihyZXBsYWNlbWVudFR4KTtcclxuXHJcbiAgICAvLyBTYXZlIG5ldyB0cmFuc2FjdGlvbiB0byBoaXN0b3J5IChpbmNsdWRlIEVJUC0xNTU5IGZpZWxkcyBpZiBhcHBsaWNhYmxlKVxyXG4gICAgY29uc3QgaGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICBoYXNoOiB0eC5oYXNoLFxyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIGZyb206IGFkZHJlc3MsXHJcbiAgICAgIHRvOiBvcmlnaW5hbFR4LnRvLFxyXG4gICAgICB2YWx1ZTogb3JpZ2luYWxUeC52YWx1ZSxcclxuICAgICAgZGF0YTogb3JpZ2luYWxUeC5kYXRhIHx8ICcweCcsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZSA/IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCkgOiAobmV3TWF4RmVlUGVyR2FzID8gbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCkgOiBvcmlnaW5hbFR4Lmdhc1ByaWNlKSxcclxuICAgICAgZ2FzTGltaXQ6IG9yaWdpbmFsVHguZ2FzTGltaXQsXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6IG9yaWdpbmFsVHgudHlwZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBZGQgRUlQLTE1NTkgZmllbGRzIGlmIHRoaXMgd2FzIGFuIEVJUC0xNTU5IHRyYW5zYWN0aW9uXHJcbiAgICBpZiAobmV3TWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgIGhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIGlmIChuZXdNYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICBoaXN0b3J5RW50cnkubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBuZXdNYXhQcmlvcml0eUZlZVBlckdhcy50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShhZGRyZXNzLCBoaXN0b3J5RW50cnkpO1xyXG5cclxuICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgcmVwbGFjZWQvZmFpbGVkXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAvLyBTZW5kIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU3BlZCBVcCcsXHJcbiAgICAgIG1lc3NhZ2U6IGBSZXBsYWNlbWVudCB0cmFuc2FjdGlvbiBzZW50IHdpdGggJHtNYXRoLmZsb29yKGdhc1ByaWNlTXVsdGlwbGllciAqIDEwMCl9JSBnYXMgcHJpY2VgLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcyk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiB0eC5oYXNoLCBuZXdHYXNQcmljZTogbmV3R2FzUHJpY2UudG9TdHJpbmcoKSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICBwYXNzd29yZCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgc2lnbmVyID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmICh3YWxsZXQpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcih3YWxsZXQpO1xyXG4gICAgICB3YWxsZXQgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gQ2FuY2VsIGEgcGVuZGluZyB0cmFuc2FjdGlvbiBieSByZXBsYWNpbmcgaXQgd2l0aCBhIHplcm8tdmFsdWUgdHggdG8gc2VsZlxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbihhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgc2Vzc2lvblRva2VuLCBjdXN0b21HYXNQcmljZSA9IG51bGwpIHtcclxuICBsZXQgcGFzc3dvcmQgPSBudWxsO1xyXG4gIGxldCBzaWduZXIgPSBudWxsO1xyXG4gIGxldCB3YWxsZXQgPSBudWxsO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVmFsaWRhdGUgc2Vzc2lvbiAobm93IGFzeW5jKVxyXG4gICAgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBHZXQgb3JpZ2luYWwgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUeCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICBpZiAoIW9yaWdpbmFsVHgpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gbm90IGZvdW5kJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcmlnaW5hbFR4LnN0YXR1cyAhPT0gdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGlzIG5vdCBwZW5kaW5nJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCB3YWxsZXQgYW5kIHVubG9jayAoYXV0by11cGdyYWRlIGlmIG5lZWRlZClcclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcblxyXG4gICAgLy8gU0VDVVJJVFk6IFZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYmVsb25ncyB0byB0aGlzIHdhbGxldFxyXG4gICAgY29uc3Qgd2FsbGV0QWRkcmVzcyA9IGF3YWl0IHNpZ25lci5nZXRBZGRyZXNzKCk7XHJcbiAgICBpZiAod2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBBZGRyZXNzIG1pc21hdGNoIGluIGNhbmNlbDogd2FsbGV0IGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggcmVxdWVzdCcpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdXYWxsZXQgYWRkcmVzcyBtaXNtYXRjaCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgb3JpZ2luYWwgdHJhbnNhY3Rpb24gaXMgZnJvbSB0aGlzIHdhbGxldFxyXG4gICAgaWYgKG9yaWdpbmFsVHguZnJvbSAmJiBvcmlnaW5hbFR4LmZyb20udG9Mb3dlckNhc2UoKSAhPT0gd2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVHJhbnNhY3Rpb24gb3duZXJzaGlwIGNoZWNrIGZhaWxlZDogdHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIHdhbGxldCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgbmV0d29yayBhbmQgY3JlYXRlIHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyXHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3JpZ2luYWxUeC5uZXR3b3JrO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICB3YWxsZXQgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIGFjdHVhbCB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW4gdG8gY2hlY2sgaXRzIHR5cGVcclxuICAgIGxldCBpc0VJUDE1NTkgPSBvcmlnaW5hbFR4Lm1heEZlZVBlckdhcyB8fCBvcmlnaW5hbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhGZWVQZXJHYXMgPSBudWxsO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyA9IG51bGw7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgb25DaGFpblR4ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb24ob3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgICBpZiAob25DaGFpblR4KSB7XHJcbiAgICAgICAgaWYgKG9uQ2hhaW5UeC50eXBlID09PSAyIHx8IG9uQ2hhaW5UeC5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICAgIGlzRUlQMTU1OSA9IHRydWU7XHJcbiAgICAgICAgICBvbkNoYWluTWF4RmVlUGVyR2FzID0gb25DaGFpblR4Lm1heEZlZVBlckdhcztcclxuICAgICAgICAgIG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyA9IG9uQ2hhaW5UeC5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIERldGVjdGVkIEVJUC0xNTU5IHRyYW5zYWN0aW9uIGZyb20gYmxvY2tjaGFpbiBmb3IgY2FuY2VsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChmZXRjaEVycikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQ291bGQgbm90IGZldGNoIG9yaWdpbmFsIHR4IGZyb20gYmxvY2tjaGFpbjonLCBmZXRjaEVyci5tZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIChzZW5kIDAgdG8gc2VsZiB3aXRoIHNhbWUgbm9uY2UpXHJcbiAgICBjb25zdCBjYW5jZWxUeCA9IHtcclxuICAgICAgdG86IGFkZHJlc3MsICAvLyBTZW5kIHRvIHNlbGZcclxuICAgICAgdmFsdWU6ICcwJywgICAvLyBaZXJvIHZhbHVlXHJcbiAgICAgIGRhdGE6ICcweCcsICAgLy8gRW1wdHkgZGF0YVxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgZ2FzTGltaXQ6IDIxMDAwICAvLyBTdGFuZGFyZCBnYXMgbGltaXQgZm9yIHNpbXBsZSBFVEggdHJhbnNmZXJcclxuICAgIH07XHJcblxyXG4gICAgLy8gRm9yIHN0b3JpbmcgaW4gaGlzdG9yeVxyXG4gICAgbGV0IG5ld0dhc1ByaWNlID0gbnVsbDtcclxuICAgIGxldCBuZXdNYXhGZWVQZXJHYXMgPSBudWxsO1xyXG4gICAgbGV0IG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gbnVsbDtcclxuXHJcbiAgICBpZiAoaXNFSVAxNTU5KSB7XHJcbiAgICAgIC8vIEVJUC0xNTU5OiBNdXN0IGJ1bXAgQk9USCBtYXhGZWVQZXJHYXMgYW5kIG1heFByaW9yaXR5RmVlUGVyR2FzIGJ5IGF0IGxlYXN0IDEwJVxyXG4gICAgICBjb25zdCBidW1wTXVsdGlwbGllciA9IDExMjVuOyAvLyAxMTIuNSVcclxuICAgICAgY29uc3QgYnVtcERpdmlzb3IgPSAxMDAwbjtcclxuXHJcbiAgICAgIC8vIFVzZSBvbi1jaGFpbiB2YWx1ZXMgaWYgYXZhaWxhYmxlXHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsTWF4RmVlID0gb25DaGFpbk1heEZlZVBlckdhcyB8fCBCaWdJbnQob3JpZ2luYWxUeC5tYXhGZWVQZXJHYXMgfHwgb3JpZ2luYWxUeC5nYXNQcmljZSB8fCAnMCcpO1xyXG4gICAgICBjb25zdCBvcmlnaW5hbFByaW9yaXR5RmVlID0gb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzIHx8IEJpZ0ludChvcmlnaW5hbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzIHx8ICcwJyk7XHJcblxyXG4gICAgICBpZiAoY3VzdG9tR2FzUHJpY2UpIHtcclxuICAgICAgICAvLyBDdXN0b20gZ2FzIHByaWNlOiB1c2UgaXQgZm9yIG1heEZlZVBlckdhc1xyXG4gICAgICAgIGNvbnN0IGN1c3RvbUZlZSA9IEJpZ0ludChjdXN0b21HYXNQcmljZSk7XHJcbiAgICAgICAgY29uc3QgbWluUHJpb3JpdHlGZWUgPSAob3JpZ2luYWxQcmlvcml0eUZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG4gICAgICAgIGNvbnN0IHByaW9yaXR5RmVlID0gbWluUHJpb3JpdHlGZWUgPiAwbiA/IG1pblByaW9yaXR5RmVlIDogMTAwMDAwMDAwMG47XHJcblxyXG4gICAgICAgIG5ld01heEZlZVBlckdhcyA9IGN1c3RvbUZlZTtcclxuICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IHByaW9yaXR5RmVlIDwgY3VzdG9tRmVlID8gcHJpb3JpdHlGZWUgOiBjdXN0b21GZWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGJ1bXBlZCBmZWVzXHJcbiAgICAgICAgbmV3TWF4RmVlUGVyR2FzID0gKG9yaWdpbmFsTWF4RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSAob3JpZ2luYWxQcmlvcml0eUZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG5cclxuICAgICAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPCAxMDAwMDAwMDAwbikge1xyXG4gICAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSAxMDAwMDAwMDAwbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNhbmNlbFR4Lm1heEZlZVBlckdhcyA9IG5ld01heEZlZVBlckdhcztcclxuICAgICAgY2FuY2VsVHgubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBuZXdNYXhQcmlvcml0eUZlZVBlckdhcztcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn6uAIEVJUC0xNTU5IGNhbmNlbDonLCB7XHJcbiAgICAgICAgb3JpZ2luYWxNYXhGZWU6IG9yaWdpbmFsTWF4RmVlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgb3JpZ2luYWxQcmlvcml0eUZlZTogb3JpZ2luYWxQcmlvcml0eUZlZS50b1N0cmluZygpLFxyXG4gICAgICAgIG5ld01heEZlZTogbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbmV3UHJpb3JpdHlGZWU6IG5ld01heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKClcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBMZWdhY3kgdHJhbnNhY3Rpb25cclxuICAgICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgICAgbmV3R2FzUHJpY2UgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsR2FzUHJpY2UgPSBCaWdJbnQob3JpZ2luYWxUeC5nYXNQcmljZSk7XHJcbiAgICAgICAgbmV3R2FzUHJpY2UgPSAob3JpZ2luYWxHYXNQcmljZSAqIEJpZ0ludCgxMjApKSAvIEJpZ0ludCgxMDApO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbmNlbFR4Lmdhc1ByaWNlID0gbmV3R2FzUHJpY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FuY2VsbGluZyB0cmFuc2FjdGlvblxyXG5cclxuICAgIC8vIFNlbmQgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHdhbGxldC5zZW5kVHJhbnNhY3Rpb24oY2FuY2VsVHgpO1xyXG5cclxuICAgIC8vIFNhdmUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnlcclxuICAgIGNvbnN0IGhpc3RvcnlFbnRyeSA9IHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogYWRkcmVzcyxcclxuICAgICAgdmFsdWU6ICcwJyxcclxuICAgICAgZGF0YTogJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlID8gbmV3R2FzUHJpY2UudG9TdHJpbmcoKSA6IChuZXdNYXhGZWVQZXJHYXMgPyBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKSA6IG9yaWdpbmFsVHguZ2FzUHJpY2UpLFxyXG4gICAgICBnYXNMaW1pdDogJzIxMDAwJyxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogJ3NlbmQnXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChuZXdNYXhGZWVQZXJHYXMpIHtcclxuICAgICAgaGlzdG9yeUVudHJ5Lm1heEZlZVBlckdhcyA9IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5ld01heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgIGhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG5ld01heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIGhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyBmYWlsZWRcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBDYW5jZWxsZWQnLFxyXG4gICAgICBtZXNzYWdlOiAnQ2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHNlbnQnLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcyk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiB0eC5oYXNoIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIC8vIFNFQ1VSSVRZOiBDbGVhbiB1cCBzZW5zaXRpdmUgZGF0YSBmcm9tIG1lbW9yeVxyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNvbnN0IHRlbXBPYmogPSB7IHBhc3N3b3JkIH07XHJcbiAgICAgIHNlY3VyZUNsZWFudXAodGVtcE9iaiwgWydwYXNzd29yZCddKTtcclxuICAgICAgcGFzc3dvcmQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHNpZ25lcikge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHNpZ25lcik7XHJcbiAgICAgIHNpZ25lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAod2FsbGV0KSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIod2FsbGV0KTtcclxuICAgICAgd2FsbGV0ID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBjdXJyZW50IG5ldHdvcmsgZ2FzIHByaWNlIChmb3Igc3BlZWQtdXAgVUkpXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnROZXR3b3JrR2FzUHJpY2UobmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBHZXQgZnVsbCBnYXMgcHJpY2UgcmVjb21tZW5kYXRpb25zIGJhc2VkIG9uIGZlZSBoaXN0b3J5XHJcbiAgICBjb25zdCByZWNvbW1lbmRhdGlvbnMgPSBhd2FpdCBycGMuZ2V0R2FzUHJpY2VSZWNvbW1lbmRhdGlvbnMobmV0d29yayk7XHJcblxyXG4gICAgLy8gVXNlIFwiZmFzdFwiIHRpZXIgYXMgdGhlIHJlY29tbWVuZGVkIHNwZWVkLXVwIHByaWNlXHJcbiAgICBjb25zdCBmYXN0UHJpY2UgPSBCaWdJbnQocmVjb21tZW5kYXRpb25zLmZhc3QubWF4RmVlUGVyR2FzKTtcclxuICAgIGNvbnN0IGluc3RhbnRQcmljZSA9IEJpZ0ludChyZWNvbW1lbmRhdGlvbnMuaW5zdGFudC5tYXhGZWVQZXJHYXMpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIGdhc1ByaWNlOiBmYXN0UHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgZ2FzUHJpY2VHd2VpOiAoTnVtYmVyKGZhc3RQcmljZSkgLyAxZTkpLnRvRml4ZWQoMiksXHJcbiAgICAgIHJlY29tbWVuZGF0aW9uczoge1xyXG4gICAgICAgIHNsb3c6IHJlY29tbWVuZGF0aW9ucy5zbG93Lm1heEZlZVBlckdhcyxcclxuICAgICAgICBub3JtYWw6IHJlY29tbWVuZGF0aW9ucy5ub3JtYWwubWF4RmVlUGVyR2FzLFxyXG4gICAgICAgIGZhc3Q6IHJlY29tbWVuZGF0aW9ucy5mYXN0Lm1heEZlZVBlckdhcyxcclxuICAgICAgICBpbnN0YW50OiByZWNvbW1lbmRhdGlvbnMuaW5zdGFudC5tYXhGZWVQZXJHYXNcclxuICAgICAgfSxcclxuICAgICAgaW5zdGFudFByaWNlOiBpbnN0YW50UHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgaW5zdGFudFByaWNlR3dlaTogKE51bWJlcihpbnN0YW50UHJpY2UpIC8gMWU5KS50b0ZpeGVkKDIpXHJcbiAgICB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGZldGNoaW5nIGN1cnJlbnQgZ2FzIHByaWNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFJlZnJlc2ggdHJhbnNhY3Rpb24gc3RhdHVzIGZyb20gYmxvY2tjaGFpblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoVHJhbnNhY3Rpb25TdGF0dXMoYWRkcmVzcywgdHhIYXNoLCBuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFJlZnJlc2hpbmcgdHggc3RhdHVzOiAke3R4SGFzaH0gb24gJHtuZXR3b3JrfWApO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcblxyXG4gICAgLy8gR2V0IHRyYW5zYWN0aW9uIHJlY2VpcHQgZnJvbSBibG9ja2NoYWluXHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0KHR4SGFzaCk7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBSZWNlaXB0IGZvciAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uOmAsIHJlY2VpcHQgPyAnZm91bmQnIDogJ251bGwnKTtcclxuXHJcbiAgICBpZiAoIXJlY2VpcHQpIHtcclxuICAgICAgLy8gTm8gcmVjZWlwdCAtIGNoZWNrIGlmIHRyYW5zYWN0aW9uIGlzIHN0aWxsIGluIG1lbXBvb2xcclxuICAgICAgY29uc3QgdHggPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbih0eEhhc2gpO1xyXG4gICAgICBjb25zb2xlLmxvZyhg8J+rgCBNZW1wb29sIHR4IGZvciAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uOmAsIHR4ID8gJ2ZvdW5kJyA6ICdudWxsJyk7XHJcblxyXG4gICAgICBpZiAoIXR4KSB7XHJcbiAgICAgICAgLy8gVHJhbnNhY3Rpb24gbm90IGluIG1lbXBvb2wgYW5kIG5vIHJlY2VpcHQgPSBkcm9wcGVkL2V2aWN0ZWRcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+rgCBUcmFuc2FjdGlvbiAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uIHdhcyBEUk9QUEVEIC0gbWFya2luZyBhcyBmYWlsZWRgKTtcclxuICAgICAgICAvLyBNYXJrIGFzIGZhaWxlZCBpbiBsb2NhbCBoaXN0b3J5XHJcbiAgICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICAgIHR4SGFzaCxcclxuICAgICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELFxyXG4gICAgICAgICAgbnVsbFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgc3RhdHVzOiAnZHJvcHBlZCcsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gd2FzIGRyb3BwZWQgZnJvbSBtZW1wb29sIChub3QgY29uZmlybWVkLCBubyBsb25nZXIgcGVuZGluZyknXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJhbnNhY3Rpb24gZXhpc3RzIGluIG1lbXBvb2wsIHN0aWxsIHBlbmRpbmdcclxuICAgICAgY29uc29sZS5sb2coYPCfq4AgVHJhbnNhY3Rpb24gJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiBzdGlsbCBpbiBtZW1wb29sYCk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcclxuICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gaXMgc3RpbGwgcGVuZGluZyBvbiB0aGUgYmxvY2tjaGFpbidcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUcmFuc2FjdGlvbiBoYXMgYmVlbiBtaW5lZFxyXG4gICAgbGV0IG5ld1N0YXR1cztcclxuICAgIGlmIChyZWNlaXB0LnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICBuZXdTdGF0dXMgPSB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5ld1N0YXR1cyA9IHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVEO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBsb2NhbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgIGFkZHJlc3MsXHJcbiAgICAgIHR4SGFzaCxcclxuICAgICAgbmV3U3RhdHVzLFxyXG4gICAgICByZWNlaXB0LmJsb2NrTnVtYmVyXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxyXG4gICAgICBibG9ja051bWJlcjogcmVjZWlwdC5ibG9ja051bWJlcixcclxuICAgICAgbWVzc2FnZTogbmV3U3RhdHVzID09PSB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRFxyXG4gICAgICAgID8gJ1RyYW5zYWN0aW9uIGNvbmZpcm1lZCBvbiBibG9ja2NoYWluJ1xyXG4gICAgICAgIDogJ1RyYW5zYWN0aW9uIGZhaWxlZCBvbiBibG9ja2NoYWluJ1xyXG4gICAgfTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgcmVmcmVzaGluZyB0cmFuc2FjdGlvbiBzdGF0dXM6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVicm9hZGNhc3QgYSBwZW5kaW5nIHRyYW5zYWN0aW9uIHRvIGFsbCBjb25maWd1cmVkIFJQQ3NcclxuYXN5bmMgZnVuY3Rpb24gcmVicm9hZGNhc3RUcmFuc2FjdGlvbih0eEhhc2gsIG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgUmVicm9hZGNhc3RpbmcgdHJhbnNhY3Rpb246ICR7dHhIYXNofSB0byBhbGwgJHtuZXR3b3JrfSBSUENzYCk7XHJcblxyXG4gICAgLy8gRmlyc3QsIHRyeSB0byBnZXQgdGhlIHJhdyB0cmFuc2FjdGlvblxyXG4gICAgbGV0IHJhd1R4ID0gYXdhaXQgcnBjLmdldFJhd1RyYW5zYWN0aW9uKG5ldHdvcmssIHR4SGFzaCk7XHJcblxyXG4gICAgaWYgKCFyYXdUeCkge1xyXG4gICAgICAvLyBJZiBnZXRSYXdUcmFuc2FjdGlvbiBub3Qgc3VwcG9ydGVkLCB3ZSBuZWVkIHRvIHJlY29uc3RydWN0IGZyb20gdHggZGF0YVxyXG4gICAgICAvLyBHZXQgdGhlIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgIGNvbnN0IHR4ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb24odHhIYXNoKTtcclxuXHJcbiAgICAgIGlmICghdHgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCBpbiBtZW1wb29sIC0gaXQgbWF5IGhhdmUgYmVlbiBkcm9wcGVkIG9yIGFscmVhZHkgY29uZmlybWVkJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEdldCB0aGUgcmF3IHNlcmlhbGl6ZWQgdHJhbnNhY3Rpb24gZnJvbSB0aGUgcHJvdmlkZXJcclxuICAgICAgLy8gZXRoZXJzIHY2IGRvZXNuJ3QgZXhwb3NlIHJhdyB0eCBkaXJlY3RseSwgc28gd2UgdXNlIGEgd29ya2Fyb3VuZFxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIC8vIFRyeSBkaXJlY3QgUlBDIGNhbGwgdG8gZ2V0IHJhdyB0eFxyXG4gICAgICAgIGNvbnN0IHJhd1Jlc3VsdCA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRSYXdUcmFuc2FjdGlvbkJ5SGFzaCcsIFt0eEhhc2hdKTtcclxuICAgICAgICBpZiAocmF3UmVzdWx0KSB7XHJcbiAgICAgICAgICByYXdUeCA9IHJhd1Jlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBnZXQgcmF3IHRyYW5zYWN0aW9uIHZpYSBSUEM6JywgZS5tZXNzYWdlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFyYXdUeCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgIGVycm9yOiAnQ2Fubm90IGdldCByYXcgdHJhbnNhY3Rpb24gZGF0YS4gVGhlIFJQQyBub2RlcyBtYXkgbm90IHN1cHBvcnQgdGhpcyBvcGVyYXRpb24uJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBCcm9hZGNhc3QgdG8gYWxsIFJQQ3NcclxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBycGMuYnJvYWRjYXN0VG9BbGxScGNzKG5ldHdvcmssIHJhd1R4KTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBSZWJyb2FkY2FzdCByZXN1bHRzIC0gU3VjY2Vzc2VzOiAke3Jlc3VsdHMuc3VjY2Vzc2VzLmxlbmd0aH0sIEZhaWx1cmVzOiAke3Jlc3VsdHMuZmFpbHVyZXMubGVuZ3RofWApO1xyXG5cclxuICAgIGlmIChyZXN1bHRzLnN1Y2Nlc3Nlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gYnJvYWRjYXN0IHRvICR7cmVzdWx0cy5zdWNjZXNzZXMubGVuZ3RofSBSUEMocylgLFxyXG4gICAgICAgIHN1Y2Nlc3NlczogcmVzdWx0cy5zdWNjZXNzZXMsXHJcbiAgICAgICAgZmFpbHVyZXM6IHJlc3VsdHMuZmFpbHVyZXNcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gYnJvYWRjYXN0IHRvIGFueSBSUEMnLFxyXG4gICAgICAgIGZhaWx1cmVzOiByZXN1bHRzLmZhaWx1cmVzXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHJlYnJvYWRjYXN0aW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFRyYWNrIHRyYW5zYWN0aW9ucyBiZWluZyBtb25pdG9yZWQgdG8gcHJldmVudCBkdXBsaWNhdGVzXHJcbmNvbnN0IG1vbml0b3JpbmdUcmFuc2FjdGlvbnMgPSBuZXcgU2V0KCk7XHJcblxyXG4vLyBXYWl0IGZvciB0cmFuc2FjdGlvbiBjb25maXJtYXRpb24gd2l0aCB0aW1lb3V0IGFuZCByZXRyeVxyXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcykge1xyXG4gIGNvbnN0IHR4SGFzaCA9IHR4Lmhhc2g7XHJcblxyXG4gIC8vIFByZXZlbnQgZHVwbGljYXRlIG1vbml0b3JpbmdcclxuICBpZiAobW9uaXRvcmluZ1RyYW5zYWN0aW9ucy5oYXModHhIYXNoKSkge1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgVHJhbnNhY3Rpb24gJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiBhbHJlYWR5IGJlaW5nIG1vbml0b3JlZGApO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBtb25pdG9yaW5nVHJhbnNhY3Rpb25zLmFkZCh0eEhhc2gpO1xyXG5cclxuICBjb25zdCBQT0xMX0lOVEVSVkFMID0gMTUgKiAxMDAwOyAvLyAxNSBzZWNvbmRzXHJcbiAgY29uc3QgTUFYX1JFVFJJRVMgPSA0MDsgLy8gNDAgKiAxNXMgPSAxMCBtaW51dGVzXHJcblxyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVjZWlwdCA9IG51bGw7XHJcbiAgICBsZXQgcmV0cmllcyA9IDA7XHJcblxyXG4gICAgLy8gUG9sbCBmb3IgcmVjZWlwdCB3aXRoIHRpbWVvdXRcclxuICAgIHdoaWxlICghcmVjZWlwdCAmJiByZXRyaWVzIDwgTUFYX1JFVFJJRVMpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZWNlaXB0ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0KHR4SGFzaCk7XHJcbiAgICAgICAgaWYgKHJlY2VpcHQpIGJyZWFrO1xyXG4gICAgICB9IGNhdGNoIChycGNFcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2Fybihg8J+rgCBSUEMgZXJyb3IgY2hlY2tpbmcgdHggJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiwgcmV0cnlpbmc6YCwgcnBjRXJyb3IubWVzc2FnZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdhaXQgYmVmb3JlIG5leHQgcG9sbFxyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgUE9MTF9JTlRFUlZBTCkpO1xyXG4gICAgICByZXRyaWVzKys7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyZWNlaXB0KSB7XHJcbiAgICAgIGNvbnNvbGUud2Fybihg8J+rgCBUcmFuc2FjdGlvbiAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uIGNvbmZpcm1hdGlvbiB0aW1lZCBvdXQgYWZ0ZXIgJHtNQVhfUkVUUklFU30gYXR0ZW1wdHNgKTtcclxuICAgICAgLy8gRG9uJ3QgbWFyayBhcyBmYWlsZWQgLSBpdCBtaWdodCBzdGlsbCBiZSBwZW5kaW5nIGluIG1lbXBvb2xcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZWNlaXB0LnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBjb25maXJtZWQgc3VjY2Vzc2Z1bGx5XHJcbiAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgICBhZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaCxcclxuICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRCxcclxuICAgICAgICByZWNlaXB0LmJsb2NrTnVtYmVyXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBDb25maXJtZWQnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBjb25maXJtZWQgaW4gYmxvY2sgJHtyZWNlaXB0LmJsb2NrTnVtYmVyfWAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiByZXZlcnRlZCAoc3RhdHVzID09PSAwKVxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICB0eEhhc2gsXHJcbiAgICAgICAgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsXHJcbiAgICAgICAgcmVjZWlwdC5ibG9ja051bWJlclxyXG4gICAgICApO1xyXG5cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gRmFpbGVkJyxcclxuICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gd2FzIHJldmVydGVkIG9uLWNoYWluJyxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBpbiBjb25maXJtYXRpb24gbW9uaXRvcmluZzonLCBlcnJvcik7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIC8vIEFsd2F5cyBjbGVhbiB1cCB0cmFja2luZ1xyXG4gICAgbW9uaXRvcmluZ1RyYW5zYWN0aW9ucy5kZWxldGUodHhIYXNoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IE1FU1NBR0UgU0lHTklORyBIQU5ETEVSUyA9PT09PVxyXG5cclxuLy8gSGFuZGxlIHBlcnNvbmFsX3NpZ24gKEVJUC0xOTEpIC0gU2lnbiBhIG1lc3NhZ2VcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUGVyc29uYWxTaWduKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpIHtcclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBzaWduIHJlcXVlc3RcclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVTaWduUmVxdWVzdChtZXRob2QsIHBhcmFtcyk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCBzaWduIHJlcXVlc3QgZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogLTMyNjAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3IpXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IG1lc3NhZ2UsIGFkZHJlc3MgfSA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBTRUNVUklUWTogQ2hlY2sgaWYgZXRoX3NpZ24gaXMgYWxsb3dlZCAoZGlzYWJsZWQgYnkgZGVmYXVsdClcclxuICBpZiAobWV0aG9kID09PSAnZXRoX3NpZ24nKSB7XHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoJ3NldHRpbmdzJyk7XHJcbiAgICBjb25zdCBhbGxvd0V0aFNpZ24gPSBzZXR0aW5ncz8uYWxsb3dFdGhTaWduIHx8IGZhbHNlO1xyXG5cclxuICAgIGlmICghYWxsb3dFdGhTaWduKSB7XHJcbiAgICAgIGNvbnNvbGUud2Fybign8J+rgCBldGhfc2lnbiByZXF1ZXN0IGJsb2NrZWQgKGRpc2FibGVkIGluIHNldHRpbmdzKTonLCBvcmlnaW4pO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ2V0aF9zaWduIGlzIGRpc2FibGVkIGZvciBzZWN1cml0eS4gVXNlIHBlcnNvbmFsX3NpZ24gaW5zdGVhZCwgb3IgZW5hYmxlIGV0aF9zaWduIGluIHdhbGxldCBzZXR0aW5ncy4nXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvZyB3YXJuaW5nIHdoZW4gZXRoX3NpZ24gaXMgdXNlZCAoZXZlbiB3aGVuIGVuYWJsZWQpXHJcbiAgICBjb25zb2xlLndhcm4oJ+KaoO+4jyBldGhfc2lnbiByZXF1ZXN0IGFwcHJvdmVkIGJ5IHNldHRpbmdzIGZyb206Jywgb3JpZ2luKTtcclxuICB9XHJcblxyXG4gIC8vIFZlcmlmeSB0aGUgYWRkcmVzcyBtYXRjaGVzIHRoZSBjb25uZWN0ZWQgYWNjb3VudFxyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICghd2FsbGV0IHx8IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0ZWQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCBjb25uZWN0ZWQgYWNjb3VudCdcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBtZXRob2QsXHJcbiAgICAgIHNpZ25SZXF1ZXN0OiB7IG1lc3NhZ2UsIGFkZHJlc3MgfSxcclxuICAgICAgYXBwcm92YWxUb2tlblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1zaWduJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH0mbWV0aG9kPSR7bWV0aG9kfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignU2lnbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2lnblR5cGVkRGF0YSAoRUlQLTcxMikgLSBTaWduIHR5cGVkIGRhdGFcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnblR5cGVkRGF0YShwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKSB7XHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgc2lnbiByZXF1ZXN0XHJcbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlU2lnblJlcXVlc3QobWV0aG9kLCBwYXJhbXMpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgc2lnbiB0eXBlZCBkYXRhIHJlcXVlc3QgZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogLTMyNjAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3IpXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IGFkZHJlc3MsIHR5cGVkRGF0YSB9ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIFZlcmlmeSB0aGUgYWRkcmVzcyBtYXRjaGVzIHRoZSBjb25uZWN0ZWQgYWNjb3VudFxyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICghd2FsbGV0IHx8IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0ZWQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCBjb25uZWN0ZWQgYWNjb3VudCdcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiByZWZ1c2UgYSB0eXBlZC1kYXRhIGRvbWFpbiBib3VuZCB0byBhIGRpZmZlcmVudCBjaGFpbi4gQVxyXG4gIC8vIHNpZ25hdHVyZSB3aG9zZSBkb21haW4gc2F5cyBjaGFpbklkIDEgYXV0aG9yaXplcyBhY3Rpb25zIG9uIEV0aGVyZXVtXHJcbiAgLy8gbWFpbm5ldCByZWdhcmRsZXNzIG9mIHdoaWNoIG5ldHdvcmsgdGhlIHVzZXIgYmVsaWV2ZXMgdGhleSBhcmUgb24uXHJcbiAgY29uc3QgZG9tYWluQ2hhaW5JZCA9IHR5cGVkRGF0YT8uZG9tYWluPy5jaGFpbklkO1xyXG4gIGlmIChkb21haW5DaGFpbklkICE9PSB1bmRlZmluZWQgJiYgZG9tYWluQ2hhaW5JZCAhPT0gbnVsbCkge1xyXG4gICAgbGV0IHJlcXVlc3RlZENoYWluO1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmVxdWVzdGVkQ2hhaW4gPSBCaWdJbnQoZG9tYWluQ2hhaW5JZCk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCB0eXBlZCBkYXRhIGRvbWFpbiBjaGFpbklkJyB9IH07XHJcbiAgICB9XHJcbiAgICBjb25zdCBjdXJyZW50Q2hhaW5JZCA9IEJpZ0ludChhd2FpdCBnZXRDdXJyZW50Q2hhaW5JZCgpKTtcclxuICAgIGlmIChyZXF1ZXN0ZWRDaGFpbiAhPT0gY3VycmVudENoYWluSWQpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBlcnJvcjoge1xyXG4gICAgICAgICAgY29kZTogLTMyNjAyLFxyXG4gICAgICAgICAgbWVzc2FnZTogYFR5cGVkIGRhdGEgZG9tYWluIGNoYWluSWQgJHtyZXF1ZXN0ZWRDaGFpbn0gZG9lcyBub3QgbWF0Y2ggdGhlIGFjdGl2ZSBjaGFpbiAke2N1cnJlbnRDaGFpbklkfWBcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiBmb3IgcmVwbGF5IHByb3RlY3Rpb25cclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5zZXQoYXBwcm92YWxUb2tlbiwge1xyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgdXNlZDogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuc2V0KHJlcXVlc3RJZCwge1xyXG4gICAgICByZXNvbHZlLFxyXG4gICAgICByZWplY3QsXHJcbiAgICAgIG9yaWdpbixcclxuICAgICAgbWV0aG9kLFxyXG4gICAgICBzaWduUmVxdWVzdDogeyB0eXBlZERhdGEsIGFkZHJlc3MgfSxcclxuICAgICAgYXBwcm92YWxUb2tlblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1zaWduVHlwZWQmcmVxdWVzdElkPSR7cmVxdWVzdElkfSZtZXRob2Q9JHttZXRob2R9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjUwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nU2lnblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdTaWduIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIG1lc3NhZ2Ugc2lnbmluZyBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNpZ25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkLCBzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nU2lnblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG5cclxuICAvLyBWYWxpZGF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiB0byBwcmV2ZW50IHJlcGxheSBhdHRhY2tzXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdJbnZhbGlkIG9yIGFscmVhZHkgdXNlZCBhcHByb3ZhbCB0b2tlbiAtIHBvc3NpYmxlIHJlcGxheSBhdHRhY2snKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFwcHJvdmFsIHRva2VuJyB9O1xyXG4gIH1cclxuXHJcbiAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KHVzZXJSZWplY3Rpb24oJ1VzZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgbGV0IHBhc3N3b3JkID0gbnVsbDtcclxuICBsZXQgc2lnbmVyID0gbnVsbDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gYW5kIGdldCBwYXNzd29yZFxyXG4gICAgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IChhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkKVxyXG4gICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2lnbmVyID0gdW5sb2NrUmVzdWx0LnNpZ25lcjtcclxuXHJcbiAgICBsZXQgc2lnbmF0dXJlO1xyXG5cclxuICAgIC8vIFNpZ24gYmFzZWQgb24gbWV0aG9kXHJcbiAgICBpZiAobWV0aG9kID09PSAncGVyc29uYWxfc2lnbicgfHwgbWV0aG9kID09PSAnZXRoX3NpZ24nKSB7XHJcbiAgICAgIHNpZ25hdHVyZSA9IGF3YWl0IHBlcnNvbmFsU2lnbihzaWduZXIsIHNpZ25SZXF1ZXN0Lm1lc3NhZ2UpO1xyXG4gICAgfSBlbHNlIGlmIChtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSkge1xyXG4gICAgICBzaWduYXR1cmUgPSBhd2FpdCBzaWduVHlwZWREYXRhKHNpZ25lciwgc2lnblJlcXVlc3QudHlwZWREYXRhKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgc2lnbmluZyBtZXRob2Q6ICR7bWV0aG9kfWApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvZyBzdWNjZXNzZnVsIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBjb25zdCBzaWduZXJBZGRyZXNzID0gYXdhaXQgc2lnbmVyLmdldEFkZHJlc3MoKTtcclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnbmVyQWRkcmVzcyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTaWduYXR1cmUgZ2VuZXJhdGVkIHN1Y2Nlc3NmdWxseVxyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgTWVzc2FnZSBzaWduZWQgZm9yIG9yaWdpbjonLCBvcmlnaW4pO1xyXG5cclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHNpZ25hdHVyZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHNpZ25hdHVyZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHNpZ25pbmcgbWVzc2FnZTonLCBlcnJvcik7XHJcblxyXG4gICAgLy8gTG9nIGZhaWxlZCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpID8gJ3R5cGVkX2RhdGEnIDogJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduUmVxdWVzdC5hZGRyZXNzIHx8ICd1bmtub3duJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIHJlamVjdChlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICBwYXNzd29yZCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgc2lnbmVyID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgTGVkZ2VyIHNpZ25hdHVyZSBhcHByb3ZhbCAocHJlLXNpZ25lZCBpbiBwb3B1cClcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxlZGdlclNpZ25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkLCBzaWduYXR1cmUpIHtcclxuICBpZiAoIXBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nU2lnblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG5cclxuICAvLyBWYWxpZGF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlblxyXG4gIGlmICghdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pKSB7XHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFwcHJvdmFsIHRva2VuJyB9O1xyXG4gIH1cclxuXHJcbiAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KHVzZXJSZWplY3Rpb24oJ1VzZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIExvZyBzdWNjZXNzZnVsIExlZGdlciBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZCAmJiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnblJlcXVlc3Q/LmFkZHJlc3MgfHwgJ2xlZGdlcicsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCB8fCAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdoYXJkd2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNpZ25hdHVyZSBhbHJlYWR5IGNyZWF0ZWQgYnkgTGVkZ2VyIGluIHBvcHVwIC0ganVzdCBwYXNzIGl0IHRocm91Z2hcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIExlZGdlciBtZXNzYWdlIHNpZ25lZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiBzaWduYXR1cmUgfSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBzaWduYXR1cmUgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBwcm9jZXNzaW5nIExlZGdlciBzaWduYXR1cmU6JywgZXJyb3IpO1xyXG5cclxuICAgIC8vIExvZyBmYWlsZWQgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiBtZXRob2QgJiYgbWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykgPyAndHlwZWRfZGF0YScgOiAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIGFkZHJlc3M6IHNpZ25SZXF1ZXN0Py5hZGRyZXNzIHx8ICdsZWRnZXInLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiBtZXRob2QgfHwgJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdoYXJkd2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIHJlamVjdChlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBzaWduIHJlcXVlc3QgZGV0YWlscyAoZm9yIHBvcHVwKVxyXG5mdW5jdGlvbiBnZXRTaWduUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBjb25zdCBlbnRyeSA9IHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgaWYgKCFlbnRyeSkgcmV0dXJuIG51bGw7XHJcbiAgLy8gT25seSBzaGlwIGRpc3BsYXkgZGF0YSB0byB0aGUgcG9wdXAgLSB0aGUgbGl2ZSByZXNvbHZlL3JlamVjdCBmdW5jdGlvbnNcclxuICAvLyBhbmQgdGhlIG9uZS10aW1lIGFwcHJvdmFsVG9rZW4gc3RheSBpbiB0aGUgYmFja2dyb3VuZFxyXG4gIGNvbnN0IHsgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0IH0gPSBlbnRyeTtcclxuICByZXR1cm4geyBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QgfTtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0cyBhbmQgcG9wdXBcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIC8vIFJlY2VpdmVkIG1lc3NhZ2VcclxuXHJcbiAgLy8gU0VDVVJJVFk6IERlZmluZSBtZXNzYWdlIHR5cGVzIHRoYXQgYXJlIHByaXZpbGVnZWQgKHBvcHVwLW9ubHkpLlxyXG4gIC8vIFRoZXNlIG11c3QgTk9UIGJlIGNhbGxhYmxlIGZyb20gY29udGVudCBzY3JpcHRzICh3aGljaCBydW4gb24gYXJiaXRyYXJ5IHdlYiBwYWdlcykuXHJcbiAgLy8gQXBwcm92YWwgcG9wdXBzIGFyZSBvcGVuZWQgdmlhIGNocm9tZS53aW5kb3dzLmNyZWF0ZSwgc28gdGhleSBkbyBoYXZlIHNlbmRlci50YWIg4oCUXHJcbiAgLy8gZGlzdGluZ3Vpc2ggdGhlbSBmcm9tIGNvbnRlbnQgc2NyaXB0cyBieSBjaGVja2luZyBzZW5kZXIudXJsIGFnYWluc3Qgb3VyIGV4dGVuc2lvbiBvcmlnaW4uXHJcbiAgY29uc3QgUFJJVklMRUdFRF9NRVNTQUdFUyA9IG5ldyBTZXQoW1xyXG4gICAgJ0NPTk5FQ1RJT05fQVBQUk9WQUwnLCAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnLCAnU0lHTl9BUFBST1ZBTCcsICdTSUdOX0FQUFJPVkFMX0xFREdFUicsXHJcbiAgICAnVE9LRU5fQUREX0FQUFJPVkFMJywgJ0NIQUlOX1NXSVRDSF9BUFBST1ZBTCcsICdDUkVBVEVfU0VTU0lPTicsICdJTlZBTElEQVRFX1NFU1NJT04nLCAnSU5WQUxJREFURV9BTExfU0VTU0lPTlMnLFxyXG4gICAgJ0RJU0NPTk5FQ1RfU0lURScsICdTQVZFX1RYJywgJ1NBVkVfQU5EX01PTklUT1JfVFgnLCAnQ0xFQVJfVFhfSElTVE9SWScsXHJcbiAgICAnU1BFRURfVVBfVFgnLCAnQ0FOQ0VMX1RYJywgJ1NQRUVEX1VQX1RYX0NPTVBMRVRFJywgJ0NBTkNFTF9UWF9DT01QTEVURScsXHJcbiAgICAnR0VUX1NJR05JTkdfQVVESVRfTE9HJywgJ0dFVF9UWF9ISVNUT1JZJywgJ0dFVF9QRU5ESU5HX1RYX0NPVU5UJywgJ0dFVF9QRU5ESU5HX1RYUycsXHJcbiAgICAnR0VUX1RYX0JZX0hBU0gnLCAnUkVGUkVTSF9UWF9TVEFUVVMnLCAnUkVCUk9BRENBU1RfVFgnLCAnR0VUX0NVUlJFTlRfR0FTX1BSSUNFJywgJ0FDVElWRV9XQUxMRVRfQ0hBTkdFRCcsXHJcbiAgICAnTkVUV09SS19DSEFOR0VEJyxcclxuICAgICdHRVRfQ09OTkVDVElPTl9SRVFVRVNUJywgJ0dFVF9DT05ORUNURURfU0lURVMnLCAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnLFxyXG4gICAgJ0dFVF9TSUdOX1JFUVVFU1QnLCAnR0VUX1RPS0VOX0FERF9SRVFVRVNUJywgJ0dFVF9DSEFJTl9TV0lUQ0hfUkVRVUVTVCdcclxuICBdKTtcclxuXHJcbiAgY29uc3QgZXh0ZW5zaW9uT3JpZ2luID0gYGNocm9tZS1leHRlbnNpb246Ly8ke2Nocm9tZS5ydW50aW1lLmlkfS9gO1xyXG4gIGNvbnN0IGlzRnJvbUV4dGVuc2lvblBhZ2UgPSB0eXBlb2Ygc2VuZGVyLnVybCA9PT0gJ3N0cmluZycgJiYgc2VuZGVyLnVybC5zdGFydHNXaXRoKGV4dGVuc2lvbk9yaWdpbik7XHJcblxyXG4gIGlmIChQUklWSUxFR0VEX01FU1NBR0VTLmhhcyhtZXNzYWdlLnR5cGUpICYmICFpc0Zyb21FeHRlbnNpb25QYWdlKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgU0VDVVJJVFk6IEJsb2NrZWQgcHJpdmlsZWdlZCBtZXNzYWdlIGZyb20gY29udGVudCBzY3JpcHQ6JywgbWVzc2FnZS50eXBlLCBzZW5kZXIudXJsKTtcclxuICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VuYXV0aG9yaXplZDogcHJpdmlsZWdlZCBtZXNzYWdlcyBtdXN0IGNvbWUgZnJvbSBleHRlbnNpb24gcGFnZXMnIH0pO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcclxuICAgICAgICBjYXNlICdXQUxMRVRfUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVXYWxsZXRSZXF1ZXN0KG1lc3NhZ2UsIHNlbmRlcik7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDT05ORUNUSU9OX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IGFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgYXBwcm92YWwgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShhcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NPTk5FQ1RJT05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCByZXF1ZXN0SW5mbyA9IGdldENvbm5lY3Rpb25SZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgY29ubmVjdGlvbiByZXF1ZXN0IGluZm9cclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NPTk5FQ1RFRF9TSVRFUyc6XHJcbiAgICAgICAgICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIGNvbm5lY3RlZCBzaXRlcycpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgc2l0ZXMgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnRElTQ09OTkVDVF9TSVRFJzpcclxuICAgICAgICAgIGF3YWl0IHJlbW92ZUNvbm5lY3RlZFNpdGUobWVzc2FnZS5vcmlnaW4pO1xyXG4gICAgICAgICAgYXdhaXQgbm90aWZ5QWNjb3VudHNDaGFuZ2VkKCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGRpc2Nvbm5lY3QgY29uZmlybWF0aW9uXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0FDVElWRV9XQUxMRVRfQ0hBTkdFRCc6XHJcbiAgICAgICAgICBhd2FpdCBub3RpZnlBY2NvdW50c0NoYW5nZWQoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnTkVUV09SS19DSEFOR0VEJzoge1xyXG4gICAgICAgICAgLy8gVXNlciBzd2l0Y2hlZCBuZXR3b3JrcyBpbiB0aGUgcG9wdXAgVUk7IHRlbGwgY29ubmVjdGVkIGRBcHBzXHJcbiAgICAgICAgICBjb25zdCBuZXdDaGFpbklkID0gQ0hBSU5fSURTW21lc3NhZ2UubmV0d29ya107XHJcbiAgICAgICAgICBpZiAobmV3Q2hhaW5JZCkge1xyXG4gICAgICAgICAgICBub3RpZnlDaGFpbkNoYW5nZWQobmV3Q2hhaW5JZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlICdUUkFOU0FDVElPTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCB0eEFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlVHJhbnNhY3Rpb25BcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCwgbWVzc2FnZS5zZXNzaW9uVG9rZW4sIG1lc3NhZ2UuZ2FzUHJpY2UsIG1lc3NhZ2UuY3VzdG9tTm9uY2UsIG1lc3NhZ2UudHhIYXNoLCBtZXNzYWdlLnR4RGV0YWlscyk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIHRyYW5zYWN0aW9uIGFwcHJvdmFsIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodHhBcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ1JFQVRFX1NFU1NJT04nOlxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvblRva2VuID0gYXdhaXQgY3JlYXRlU2Vzc2lvbihtZXNzYWdlLnBhc3N3b3JkLCBtZXNzYWdlLndhbGxldElkLCBtZXNzYWdlLmR1cmF0aW9uTXMpO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBzZXNzaW9uVG9rZW4gfSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnSU5WQUxJREFURV9TRVNTSU9OJzpcclxuICAgICAgICAgIGNvbnN0IGludmFsaWRhdGVkID0gaW52YWxpZGF0ZVNlc3Npb24obWVzc2FnZS5zZXNzaW9uVG9rZW4pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogaW52YWxpZGF0ZWQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnSU5WQUxJREFURV9BTExfU0VTU0lPTlMnOlxyXG4gICAgICAgICAgY29uc3QgY291bnQgPSBpbnZhbGlkYXRlQWxsU2Vzc2lvbnMoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGNvdW50IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9UUkFOU0FDVElPTl9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHR4UmVxdWVzdEluZm8gPSBnZXRUcmFuc2FjdGlvblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0cmFuc2FjdGlvbiByZXF1ZXN0IGluZm86JywgdHhSZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodHhSZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVE9LRU5fQUREX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHRva2VuQXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgdG9rZW4gYWRkIGFwcHJvdmFsIHJlc3BvbnNlOicsIHRva2VuQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHRva2VuQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NIQUlOX1NXSVRDSF9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCBjaGFpblN3aXRjaFJlc3VsdCA9IGF3YWl0IGhhbmRsZUNoYWluU3dpdGNoQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGNoYWluU3dpdGNoUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTSUdOX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHNpZ25BcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVNpZ25BcHByb3ZhbChcclxuICAgICAgICAgICAgbWVzc2FnZS5yZXF1ZXN0SWQsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYXBwcm92ZWQsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2Vzc2lvblRva2VuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBzaWduIGFwcHJvdmFsIHJlc3BvbnNlOicsIHNpZ25BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoc2lnbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTSUdOX0FQUFJPVkFMX0xFREdFUic6XHJcbiAgICAgICAgICBjb25zdCBsZWRnZXJTaWduUmVzdWx0ID0gYXdhaXQgaGFuZGxlTGVkZ2VyU2lnbkFwcHJvdmFsKFxyXG4gICAgICAgICAgICBtZXNzYWdlLnJlcXVlc3RJZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5hcHByb3ZlZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zaWduYXR1cmVcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIExlZGdlciBzaWduIGFwcHJvdmFsIHJlc3BvbnNlOicsIGxlZGdlclNpZ25SZXN1bHQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGxlZGdlclNpZ25SZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9TSUdOX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnblJlcXVlc3RJbmZvID0gZ2V0U2lnblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBzaWduIHJlcXVlc3QgaW5mbzonLCBzaWduUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNpZ25SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RPS0VOX0FERF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHRva2VuUmVxdWVzdEluZm8gPSBnZXRUb2tlbkFkZFJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgcmVxdWVzdCBpbmZvOicsIHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DSEFJTl9TV0lUQ0hfUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCBjaGFpblN3aXRjaEluZm8gPSBhd2FpdCBnZXRDaGFpblN3aXRjaFJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGNoYWluU3dpdGNoSW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy8gU2lnbmluZyBBdWRpdCBMb2dcclxuICAgICAgICBjYXNlICdHRVRfU0lHTklOR19BVURJVF9MT0cnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnbmluZ0xvZyA9IGF3YWl0IGdldFNpZ25pbmdBdWRpdExvZygpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgbG9nOiBzaWduaW5nTG9nIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zYWN0aW9uIEhpc3RvcnlcclxuICAgICAgICBjYXNlICdHRVRfVFhfSElTVE9SWSc6XHJcbiAgICAgICAgICBjb25zdCB0eEhpc3RvcnlMaXN0ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4SGlzdG9yeShtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHJhbnNhY3Rpb25zOiB0eEhpc3RvcnlMaXN0IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9QRU5ESU5HX1RYX0NPVU5UJzpcclxuICAgICAgICAgIGNvbnN0IHBlbmRpbmdDb3VudCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhDb3VudChtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQ6IHBlbmRpbmdDb3VudCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfUEVORElOR19UWFMnOlxyXG4gICAgICAgICAgY29uc3QgcGVuZGluZ1R4cyA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhzKG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbnM6IHBlbmRpbmdUeHMgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RYX0JZX0hBU0gnOlxyXG4gICAgICAgICAgY29uc3QgdHhEZXRhaWwgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2gobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnR4SGFzaCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbjogdHhEZXRhaWwgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0FWRV9UWCc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnRyYW5zYWN0aW9uKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0FWRV9BTkRfTU9OSVRPUl9UWCc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnRyYW5zYWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAvLyBTdGFydCBtb25pdG9yaW5nIGZvciBjb25maXJtYXRpb24gaW4gYmFja2dyb3VuZFxyXG4gICAgICAgICAgKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gbWVzc2FnZS50cmFuc2FjdGlvbi5uZXR3b3JrIHx8IERFRkFVTFRfTkVUV09SSztcclxuICAgICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgICAgICAgICBjb25zdCB0eCA9IHsgaGFzaDogbWVzc2FnZS50cmFuc2FjdGlvbi5oYXNoIH07XHJcbiAgICAgICAgICAgICAgYXdhaXQgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbW9uaXRvcmluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDTEVBUl9UWF9ISVNUT1JZJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5jbGVhclR4SGlzdG9yeShtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ1VSUkVOVF9HQVNfUFJJQ0UnOlxyXG4gICAgICAgICAgY29uc3QgZ2FzUHJpY2VSZXN1bHQgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29ya0dhc1ByaWNlKG1lc3NhZ2UubmV0d29yayk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoZ2FzUHJpY2VSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1JFRlJFU0hfVFhfU1RBVFVTJzpcclxuICAgICAgICAgIGNvbnN0IHJlZnJlc2hSZXN1bHQgPSBhd2FpdCByZWZyZXNoVHJhbnNhY3Rpb25TdGF0dXMoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UubmV0d29ya1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZWZyZXNoUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdSRUJST0FEQ0FTVF9UWCc6XHJcbiAgICAgICAgICBjb25zdCByZWJyb2FkY2FzdFJlc3VsdCA9IGF3YWl0IHJlYnJvYWRjYXN0VHJhbnNhY3Rpb24oXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLm5ldHdvcmtcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVicm9hZGNhc3RSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NQRUVEX1VQX1RYJzpcclxuICAgICAgICAgIGNvbnN0IHNwZWVkVXBSZXN1bHQgPSBhd2FpdCBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24oXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2Vzc2lvblRva2VuLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmdhc1ByaWNlTXVsdGlwbGllciB8fCAxLjIsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuY3VzdG9tR2FzUHJpY2UgfHwgbnVsbFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzcGVlZFVwUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDQU5DRUxfVFgnOlxyXG4gICAgICAgICAgY29uc3QgY2FuY2VsUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2Vzc2lvblRva2VuLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmN1c3RvbUdhc1ByaWNlIHx8IG51bGxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoY2FuY2VsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTUEVFRF9VUF9UWF9DT01QTEVURSc6XHJcbiAgICAgICAgICAvLyBUcmFuc2FjdGlvbiB3YXMgYWxyZWFkeSBzaWduZWQgYW5kIGJyb2FkY2FzdCBpbiBwb3B1cCAtIGp1c3Qgc2F2ZSB0byBoaXN0b3J5XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgbmV3IHRyYW5zYWN0aW9uIHRvIGhpc3RvcnlcclxuICAgICAgICAgICAgY29uc3QgaGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICAgICAgICAgIGhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoLFxyXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgICAgICAgICBmcm9tOiBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgdG86IG1lc3NhZ2UudHhEZXRhaWxzLnRvLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBtZXNzYWdlLnR4RGV0YWlscy52YWx1ZSxcclxuICAgICAgICAgICAgICBkYXRhOiBtZXNzYWdlLnR4RGV0YWlscy5kYXRhIHx8ICcweCcsXHJcbiAgICAgICAgICAgICAgZ2FzUHJpY2U6IG1lc3NhZ2UudHhEZXRhaWxzLmdhc1ByaWNlLFxyXG4gICAgICAgICAgICAgIGdhc0xpbWl0OiBtZXNzYWdlLnR4RGV0YWlscy5nYXNMaW1pdCxcclxuICAgICAgICAgICAgICBub25jZTogbWVzc2FnZS50eERldGFpbHMubm9uY2UsXHJcbiAgICAgICAgICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgICAgICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICAgICAgICB0eXBlOiB0eEhpc3RvcnkuVFhfVFlQRVMuQ09OVFJBQ1RcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICAgICAgICBoaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4RmVlUGVyR2FzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR4RGV0YWlscy5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBoaXN0b3J5RW50cnkpO1xyXG5cclxuICAgICAgICAgICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyByZXBsYWNlZFxyXG4gICAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLm9yaWdpbmFsVHhIYXNoLCB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCwgbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFydCBtb25pdG9yaW5nIG5ldyB0cmFuc2FjdGlvblxyXG4gICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgICAgICAgd2FpdEZvckNvbmZpcm1hdGlvbih7IGhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoIH0sIHByb3ZpZGVyLCBtZXNzYWdlLmFkZHJlc3MpO1xyXG5cclxuICAgICAgICAgICAgLy8gTm90aWZpY2F0aW9uXHJcbiAgICAgICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNwZWQgVXAnLFxyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IGBOZXcgVFg6ICR7bWVzc2FnZS5uZXdUeEhhc2guc2xpY2UoMCwgMjApfS4uLmAsXHJcbiAgICAgICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoIH0pO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2F2aW5nIHNwZWVkLXVwIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NBTkNFTF9UWF9DT01QTEVURSc6XHJcbiAgICAgICAgICAvLyBDYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gd2FzIGFscmVhZHkgc2lnbmVkIGFuZCBicm9hZGNhc3QgaW4gcG9wdXAgLSBqdXN0IHNhdmUgdG8gaGlzdG9yeVxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTYXZlIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAgICAgICAgICAgIGNvbnN0IGNhbmNlbEhpc3RvcnlFbnRyeSA9IHtcclxuICAgICAgICAgICAgICBoYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCxcclxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgICAgICAgZnJvbTogbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICAgIHRvOiBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgdmFsdWU6ICcwJyxcclxuICAgICAgICAgICAgICBkYXRhOiAnMHgnLFxyXG4gICAgICAgICAgICAgIGdhc1ByaWNlOiBtZXNzYWdlLnR4RGV0YWlscy5nYXNQcmljZSxcclxuICAgICAgICAgICAgICBnYXNMaW1pdDogJzIxMDAwJyxcclxuICAgICAgICAgICAgICBub25jZTogbWVzc2FnZS50eERldGFpbHMubm9uY2UsXHJcbiAgICAgICAgICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgICAgICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICAgICAgICB0eXBlOiAnc2VuZCdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICAgICAgICBjYW5jZWxIaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4RmVlUGVyR2FzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR4RGV0YWlscy5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBjYW5jZWxIaXN0b3J5RW50cnkpO1xyXG5cclxuICAgICAgICAgICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyBjYW5jZWxsZWQvZmFpbGVkXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2Uub3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uXHJcbiAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICAgICAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHsgaGFzaDogbWVzc2FnZS5uZXdUeEhhc2ggfSwgcHJvdmlkZXIsIG1lc3NhZ2UuYWRkcmVzcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZmljYXRpb25cclxuICAgICAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ2FuY2VsbGVkJyxcclxuICAgICAgICAgICAgICBtZXNzYWdlOiAnQ2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHNlbnQnLFxyXG4gICAgICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCB9KTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNhdmluZyBjYW5jZWwgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVVBEQVRFX1JQQ19QUklPUklUSUVTJzpcclxuICAgICAgICAgIC8vIFVwZGF0ZSBSUEMgcHJpb3JpdGllcyBpbiB0aGUgcnBjIG1vZHVsZVxyXG4gICAgICAgICAgaWYgKG1lc3NhZ2UubmV0d29yayAmJiBtZXNzYWdlLnByaW9yaXRpZXMpIHtcclxuICAgICAgICAgICAgcnBjLnVwZGF0ZVJwY1ByaW9yaXRpZXMobWVzc2FnZS5uZXR3b3JrLCBtZXNzYWdlLnByaW9yaXRpZXMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg8J+rgCBVcGRhdGVkIFJQQyBwcmlvcml0aWVzIGZvciAke21lc3NhZ2UubmV0d29ya31gKTtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgbmV0d29yayBvciBwcmlvcml0aWVzJyB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgVW5rbm93biBtZXNzYWdlIHR5cGU6JywgbWVzc2FnZS50eXBlKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Vua25vd24gbWVzc2FnZSB0eXBlJyB9KTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBoYW5kbGluZyBtZXNzYWdlOicsIGVycm9yKTtcclxuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgfVxyXG4gIH0pKCk7XHJcblxyXG4gIHJldHVybiB0cnVlOyAvLyBLZWVwIG1lc3NhZ2UgY2hhbm5lbCBvcGVuIGZvciBhc3luYyByZXNwb25zZVxyXG59KTtcclxuXHJcbmNvbnNvbGUubG9nKCfwn6uAIEhlYXJ0V2FsbGV0IHNlcnZpY2Ugd29ya2VyIHJlYWR5Jyk7XHJcbiJdLCJuYW1lcyI6WyJldGhlcnMuZ2V0QWRkcmVzcyIsImV0aGVycy5nZXRCeXRlcyIsImV0aGVycy5pc0FkZHJlc3MiLCJycGMuZ2V0QmxvY2tOdW1iZXIiLCJycGMuZ2V0QmxvY2tCeU51bWJlciIsInJwYy5nZXRCYWxhbmNlIiwicnBjLmdldFRyYW5zYWN0aW9uQ291bnQiLCJycGMuZ2V0R2FzUHJpY2UiLCJycGMuZXN0aW1hdGVHYXMiLCJycGMuY2FsbCIsInJwYy5zZW5kUmF3VHJhbnNhY3Rpb24iLCJycGMuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0IiwicnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoIiwicnBjLmdldFByb3ZpZGVyIiwiY2FjaGUiLCJ0eEhpc3RvcnkuVFhfU1RBVFVTIiwidHhIaXN0b3J5LlRYX1RZUEVTIiwidHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5IiwicnBjLmdldEVpcDE1NTlGZWVzIiwidHhIaXN0b3J5LmdldFR4QnlIYXNoIiwidHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzIiwicnBjLmdldEdhc1ByaWNlUmVjb21tZW5kYXRpb25zIiwicnBjLmdldFJhd1RyYW5zYWN0aW9uIiwicnBjLmJyb2FkY2FzdFRvQWxsUnBjcyIsInR4SGlzdG9yeS5nZXRUeEhpc3RvcnkiLCJ0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4Q291bnQiLCJ0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4cyIsInR4SGlzdG9yeS5jbGVhclR4SGlzdG9yeSIsInJwYy51cGRhdGVScGNQcmlvcml0aWVzIl0sIm1hcHBpbmdzIjoiO0FBUUEsTUFBTSxpQkFBaUI7QUFDdkIsTUFB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
