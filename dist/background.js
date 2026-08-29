import { l as load, s as save, a as getAddress, H as getBytes, i as isAddress, N as updateRpcPriorities, g as getProvider, u as unlockWallet, O as getBaseFee, P as sendTransactionResilient, Q as secureCleanup, R as secureCleanupSigner, U as getRawTransaction, V as broadcastToAllRpcs, E as getGasPriceRecommendations, d as getActiveWallet, x as getEip1559Fees, W as getTransactionByHash, X as getTransactionReceipt, y as getGasPrice, F as estimateGas, Y as call, t as getTransactionCount, q as getBalance, Z as getBlockByNumber, _ as getBlockNumber } from "./rpc.js";
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
    const results = await broadcastToAllRpcs(network, signedTx);
    if (!results.successes || results.successes.length === 0) {
      const detail = (results.failures || []).map((f) => f.error).join(" | ");
      return { error: { code: -32603, message: `Broadcast failed on all RPC endpoints: ${detail}` } };
    }
    return { result: results.txHash };
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
        const dappMaxFee = txRequest.maxFeePerGas ? BigInt(txRequest.maxFeePerGas) : 0n;
        const uiFloor = gasPrice ? BigInt(gasPrice) : 0n;
        const preferred = dappMaxFee > uiFloor ? dappMaxFee : uiFloor;
        const fees = await getEip1559Fees(network, preferred > 0n ? preferred : null);
        txToSend.maxFeePerGas = fees.maxFeePerGas;
        txToSend.maxPriorityFeePerGas = fees.maxPriorityFeePerGas;
        const dappTip = txRequest.maxPriorityFeePerGas ? BigInt(txRequest.maxPriorityFeePerGas) : 0n;
        if (dappTip > txToSend.maxPriorityFeePerGas) {
          txToSend.maxPriorityFeePerGas = dappTip > txToSend.maxFeePerGas ? txToSend.maxFeePerGas : dappTip;
        }
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
      const tx = await sendTransactionResilient(connectedSigner, network, txToSend);
      console.log(`🫀 Transaction ${tx.hash} broadcast to ${tx.accepted.length} endpoint(s)`);
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
      let currentBaseFee = 0n;
      try {
        currentBaseFee = BigInt(await getBaseFee(network));
      } catch (feeErr) {
        console.warn("🫀 Could not read live base fee for speed-up, using bump only:", feeErr.message);
      }
      const tipFloor = currentBaseFee / 20n;
      const capFloor = currentBaseFee * 4n + tipFloor;
      if (customGasPrice) {
        const customFee = BigInt(customGasPrice);
        const minReplacementFee = originalMaxFee * bumpMultiplier / bumpDivisor;
        newMaxFeePerGas = customFee > minReplacementFee ? customFee : minReplacementFee;
        const bumped = originalPriorityFee * bumpMultiplier / bumpDivisor;
        newMaxPriorityFeePerGas = bumped > tipFloor ? bumped : tipFloor;
      } else {
        newMaxFeePerGas = originalMaxFee * bumpMultiplier / bumpDivisor;
        newMaxPriorityFeePerGas = originalPriorityFee * bumpMultiplier / bumpDivisor;
        if (newMaxPriorityFeePerGas < tipFloor) newMaxPriorityFeePerGas = tipFloor;
        if (newMaxFeePerGas < capFloor) newMaxFeePerGas = capFloor;
      }
      if (newMaxPriorityFeePerGas > newMaxFeePerGas) {
        newMaxPriorityFeePerGas = newMaxFeePerGas;
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
    const tx = await sendTransactionResilient(wallet, network, replacementTx);
    console.log(`🫀 Speed-up ${tx.hash} broadcast to ${tx.accepted.length} endpoint(s)`);
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
      let currentBaseFee = 0n;
      try {
        currentBaseFee = BigInt(await getBaseFee(network));
      } catch (feeErr) {
        console.warn("🫀 Could not read live base fee for cancel, using bump only:", feeErr.message);
      }
      const tipFloor = currentBaseFee / 20n;
      const capFloor = currentBaseFee * 4n + tipFloor;
      if (customGasPrice) {
        const customFee = BigInt(customGasPrice);
        const bumped = originalPriorityFee * bumpMultiplier / bumpDivisor;
        const priorityFee = bumped > tipFloor ? bumped : tipFloor;
        newMaxFeePerGas = customFee;
        newMaxPriorityFeePerGas = priorityFee < customFee ? priorityFee : customFee;
      } else {
        newMaxFeePerGas = originalMaxFee * bumpMultiplier / bumpDivisor;
        newMaxPriorityFeePerGas = originalPriorityFee * bumpMultiplier / bumpDivisor;
        if (newMaxPriorityFeePerGas < tipFloor) newMaxPriorityFeePerGas = tipFloor;
        if (newMaxFeePerGas < capFloor) newMaxFeePerGas = capFloor;
      }
      if (newMaxPriorityFeePerGas > newMaxFeePerGas) {
        newMaxPriorityFeePerGas = newMaxFeePerGas;
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
    const tx = await sendTransactionResilient(wallet, network, cancelTx);
    console.log(`🫀 Cancel ${tx.hash} broadcast to ${tx.accepted.length} endpoint(s)`);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRBbGxIaXN0b3J5KCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBsb2FkKFRYX0hJU1RPUllfS0VZKTtcclxuICByZXR1cm4gaGlzdG9yeSB8fCB7fTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpIHtcclxuICBhd2FpdCBzYXZlKFRYX0hJU1RPUllfS0VZLCBoaXN0b3J5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgYSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgdHhEYXRhKSB7XHJcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRUeEhpc3RvcnlTZXR0aW5ncygpO1xyXG4gIGlmICghc2V0dGluZ3MuZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuOyAvLyBIaXN0b3J5IGRpc2FibGVkXHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBhZGRyZXNzIGhpc3RvcnkgaWYgZG9lc24ndCBleGlzdFxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0gPSB7IHRyYW5zYWN0aW9uczogW10gfTtcclxuICB9XHJcblxyXG4gIC8vIEFkZCBuZXcgdHJhbnNhY3Rpb24gYXQgYmVnaW5uaW5nIChuZXdlc3QgZmlyc3QpXHJcbiAgY29uc3QgdHhFbnRyeSA9IHtcclxuICAgIGhhc2g6IHR4RGF0YS5oYXNoLFxyXG4gICAgdGltZXN0YW1wOiB0eERhdGEudGltZXN0YW1wIHx8IERhdGUubm93KCksXHJcbiAgICBmcm9tOiB0eERhdGEuZnJvbS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgdG86IHR4RGF0YS50byA/IHR4RGF0YS50by50b0xvd2VyQ2FzZSgpIDogbnVsbCxcclxuICAgIHZhbHVlOiB0eERhdGEudmFsdWUgfHwgJzAnLFxyXG4gICAgZGF0YTogdHhEYXRhLmRhdGEgfHwgJzB4JyxcclxuICAgIGdhc1ByaWNlOiB0eERhdGEuZ2FzUHJpY2UsXHJcbiAgICBnYXNMaW1pdDogdHhEYXRhLmdhc0xpbWl0LFxyXG4gICAgbm9uY2U6IHR4RGF0YS5ub25jZSxcclxuICAgIG5ldHdvcms6IHR4RGF0YS5uZXR3b3JrLFxyXG4gICAgc3RhdHVzOiB0eERhdGEuc3RhdHVzIHx8IFRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgYmxvY2tOdW1iZXI6IHR4RGF0YS5ibG9ja051bWJlciB8fCBudWxsLFxyXG4gICAgdHlwZTogdHhEYXRhLnR5cGUgfHwgVFhfVFlQRVMuQ09OVFJBQ1RcclxuICB9O1xyXG5cclxuICAvLyBTdG9yZSBFSVAtMTU1OSBmaWVsZHMgaWYgcHJlc2VudCAoZm9yIHByb3BlciBzcGVlZC11cC9jYW5jZWwpXHJcbiAgaWYgKHR4RGF0YS5tYXhGZWVQZXJHYXMpIHtcclxuICAgIHR4RW50cnkubWF4RmVlUGVyR2FzID0gdHhEYXRhLm1heEZlZVBlckdhcztcclxuICB9XHJcbiAgaWYgKHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgdHhFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICB9XHJcblxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMudW5zaGlmdCh0eEVudHJ5KTtcclxuXHJcbiAgLy8gRW5mb3JjZSBtYXggbGltaXQgKEZJRk8gLSByZW1vdmUgb2xkZXN0KVxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLmxlbmd0aCA+IE1BWF9UWFNfUEVSX0FERFJFU1MpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgPSBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLnNsaWNlKDAsIE1BWF9UWFNfUEVSX0FERFJFU1MpO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZUFsbEhpc3RvcnkoaGlzdG9yeSk7XHJcbiAgLy8gVHJhbnNhY3Rpb24gYWRkZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIHN0YXR1cywgYmxvY2tOdW1iZXIgPSBudWxsKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eEluZGV4ID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5maW5kSW5kZXgoXHJcbiAgICB0eCA9PiB0eC5oYXNoLnRvTG93ZXJDYXNlKCkgPT09IHR4SGFzaC50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuXHJcbiAgaWYgKHR4SW5kZXggPT09IC0xKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLnN0YXR1cyA9IHN0YXR1cztcclxuICBpZiAoYmxvY2tOdW1iZXIgIT09IG51bGwpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnNbdHhJbmRleF0uYmxvY2tOdW1iZXIgPSBibG9ja051bWJlcjtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbnMgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhzKGFkZHJlc3MpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maWx0ZXIodHggPT4gdHguc3RhdHVzID09PSBUWF9TVEFUVVMuUEVORElORyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbiBjb3VudCBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdUeENvdW50KGFkZHJlc3MpIHtcclxuICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKTtcclxuICByZXR1cm4gcGVuZGluZ1R4cy5sZW5ndGg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFR4QnlIYXNoKGFkZHJlc3MsIHR4SGFzaCkge1xyXG4gIGNvbnN0IHR4cyA9IGF3YWl0IGdldFR4SGlzdG9yeShhZGRyZXNzKTtcclxuICByZXR1cm4gdHhzLmZpbmQodHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyVHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKGhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgZGVsZXRlIGhpc3RvcnlbYWRkcmVzc0xvd2VyXTtcclxuICAgIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbiAgfVxyXG59XHJcblxyXG4iLCIvKipcclxuICogY29yZS90eFZhbGlkYXRpb24uanNcclxuICpcclxuICogVHJhbnNhY3Rpb24gdmFsaWRhdGlvbiB1dGlsaXRpZXMgZm9yIHNlY3VyaXR5XHJcbiAqIFZhbGlkYXRlcyBhbGwgdHJhbnNhY3Rpb24gcGFyYW1ldGVycyBiZWZvcmUgcHJvY2Vzc2luZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgdHJhbnNhY3Rpb24gcmVxdWVzdCBmcm9tIGEgZEFwcFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHhSZXF1ZXN0IC0gVHJhbnNhY3Rpb24gcmVxdWVzdCBvYmplY3RcclxuICogQHBhcmFtIHtudW1iZXJ8bnVsbH0gbWF4R2FzUHJpY2VHd2VpIC0gTWF4aW11bSBhbGxvd2VkIGdhcyBwcmljZSBpbiBHd2VpIChkZWZhdWx0IDEwMDApLlxyXG4gKiAgICAgICAgUGFzcyBudWxsIHRvIHNraXAgdGhlIGdhcyBwcmljZSBib3VuZCBlbnRpcmVseSAtIG9ubHkgYXBwcm9wcmlhdGUgd2hlbiB0aGVcclxuICogICAgICAgIGNhbGxlciBnZW51aW5lbHkgY2Fubm90IGRldGVybWluZSB0aGUgbmV0d29yayBwcmljZSwgc2luY2UgdGhlIGFsdGVybmF0aXZlIGlzXHJcbiAqICAgICAgICBhbiBhcmJpdHJhcnkgaW52ZW50ZWQgY29uc3RhbnQuXHJcbiAqIEByZXR1cm5zIHt7IHZhbGlkOiBib29sZWFuLCBlcnJvcnM6IHN0cmluZ1tdLCBzYW5pdGl6ZWQ6IE9iamVjdCB9fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0KHR4UmVxdWVzdCwgbWF4R2FzUHJpY2VHd2VpID0gMTAwMCkge1xyXG4gIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gIGNvbnN0IHNhbml0aXplZCA9IHt9O1xyXG5cclxuICAvLyBWYWxpZGF0ZSAndG8nIGFkZHJlc3MgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QudG8gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudG8gIT09IG51bGwpIHtcclxuICAgIGlmICh0eXBlb2YgdHhSZXF1ZXN0LnRvICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC50bykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTm9ybWFsaXplIHRvIGNoZWNrc3VtIGFkZHJlc3NcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQudG8gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QudG8pO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2Zyb20nIGFkZHJlc3MgaWYgcHJlc2VudCAoc2hvdWxkIG1hdGNoIHdhbGxldCBhZGRyZXNzKVxyXG4gIGlmICh0eFJlcXVlc3QuZnJvbSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5mcm9tICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5mcm9tICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleEFkZHJlc3ModHhSZXF1ZXN0LmZyb20pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQuZnJvbSA9IGV0aGVycy5nZXRBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3ZhbHVlJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QudmFsdWUgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudmFsdWUgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC52YWx1ZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB2YWx1ZUJpZ0ludCA9IEJpZ0ludCh0eFJlcXVlc3QudmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZUJpZ0ludCA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQudmFsdWUgPSB0eFJlcXVlc3QudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHNhbml0aXplZC52YWx1ZSA9ICcweDAnOyAvLyBEZWZhdWx0IHRvIDBcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdkYXRhJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5kYXRhICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5kYXRhICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleERhdGEodHhSZXF1ZXN0LmRhdGEpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImRhdGFcIiBmaWVsZCBtdXN0IGJlIHZhbGlkIGhleCBkYXRhJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzYW5pdGl6ZWQuZGF0YSA9IHR4UmVxdWVzdC5kYXRhO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQuZGF0YSA9ICcweCc7IC8vIERlZmF1bHQgdG8gZW1wdHkgZGF0YVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2dhcycgb3IgJ2dhc0xpbWl0JyBmaWVsZFxyXG4gIC8vIFNFQ1VSSVRZOiBSZWFzb25hYmxlIG1heGltdW0gaXMgMTBNIGdhcyB0byBwcmV2ZW50IGZlZSBzY2Ftc1xyXG4gIC8vIE1vc3QgdHJhbnNhY3Rpb25zOiAyMWstMjAwayBnYXMuIENvbXBsZXggRGVGaTogMjAway0xTSBnYXMuXHJcbiAgLy8gRXRoZXJldW0vUHVsc2VDaGFpbiBibG9jayBsaW1pdCBpcyB+MzBNLCBidXQgc2luZ2xlIFRYIHJhcmVseSBuZWVkcyA+MTBNXHJcbiAgaWYgKHR4UmVxdWVzdC5nYXMgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNMaW1pdCA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzKTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBsb3cgKG1pbmltdW0gMjEwMDApJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnYXNMaW1pdCA+IDEwMDAwMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgbGltaXQgdG9vIGhpZ2ggKG1heGltdW0gMTAwMDAwMDApLiBNb3N0IHRyYW5zYWN0aW9ucyBuZWVkIDwxTSBnYXMuJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXMgPSB0eFJlcXVlc3QuZ2FzO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzTGltaXQgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzTGltaXQgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5nYXNMaW1pdCkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNMaW1pdCA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzTGltaXQpO1xyXG4gICAgICAgIGlmIChnYXNMaW1pdCA8IDIxMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAxMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGhpZ2ggKG1heGltdW0gMTAwMDAwMDApLiBNb3N0IHRyYW5zYWN0aW9ucyBuZWVkIDwxTSBnYXMuJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNMaW1pdCA9IHR4UmVxdWVzdC5nYXNMaW1pdDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdnYXNQcmljZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzUHJpY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzUHJpY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5nYXNQcmljZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNQcmljZSA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzUHJpY2UpO1xyXG4gICAgICAgIGlmIChnYXNQcmljZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNQcmljZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobWF4R2FzUHJpY2VHd2VpICE9PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICBnYXNQcmljZSA+IEJpZ0ludChtYXhHYXNQcmljZUd3ZWkpICogQmlnSW50KCcxMDAwMDAwMDAwJykpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKGBJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZXhjZWVkcyBtYXhpbXVtIG9mICR7bWF4R2FzUHJpY2VHd2VpfSBHd2VpYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNQcmljZSA9IHR4UmVxdWVzdC5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdub25jZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5ub25jZSkgJiYgdHlwZW9mIHR4UmVxdWVzdC5ub25jZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIG9yIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJyBcclxuICAgICAgICAgID8gQmlnSW50KHR4UmVxdWVzdC5ub25jZSkgXHJcbiAgICAgICAgICA6IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpO1xyXG4gICAgICAgIGlmIChub25jZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9uY2UgPiBCaWdJbnQoJzkwMDcxOTkyNTQ3NDA5OTEnKSkgeyAvLyBKYXZhU2NyaXB0IHNhZmUgaW50ZWdlciBtYXhcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgdW5yZWFzb25hYmx5IGhpZ2gnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLm5vbmNlID0gdHhSZXF1ZXN0Lm5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gbXVzdCBoYXZlIGVpdGhlciAndG8nIG9yICdkYXRhJyAoY29udHJhY3QgY3JlYXRpb24pXHJcbiAgaWYgKCFzYW5pdGl6ZWQudG8gJiYgKCFzYW5pdGl6ZWQuZGF0YSB8fCBzYW5pdGl6ZWQuZGF0YSA9PT0gJzB4JykpIHtcclxuICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBtdXN0IGhhdmUgXCJ0b1wiIGFkZHJlc3Mgb3IgXCJkYXRhXCIgZm9yIGNvbnRyYWN0IGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnMsXHJcbiAgICBzYW5pdGl6ZWRcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIEV0aGVyZXVtIGFkZHJlc3MgKGhleCBmb3JtYXQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhZGRyZXNzIC0gQWRkcmVzcyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhBZGRyZXNzKGFkZHJlc3MpIHtcclxuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSA0MiBjaGFyYWN0ZXJzOiAweCArIDQwIGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdezQwfSQvLnRlc3QoYWRkcmVzcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBoZXggdmFsdWUgKGZvciBhbW91bnRzLCBnYXMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEhleCB2YWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBzdGFydCB3aXRoIDB4IGFuZCBjb250YWluIG9ubHkgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0rJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaGV4IGRhdGEgKGZvciB0cmFuc2FjdGlvbiBkYXRhIGZpZWxkKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIEhleCBkYXRhIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleERhdGEoZGF0YSkge1xyXG4gIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDB4IG9yIDB4IGZvbGxvd2VkIGJ5IGV2ZW4gbnVtYmVyIG9mIGhleCBkaWdpdHNcclxuICBpZiAoZGF0YSA9PT0gJzB4JykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSokLy50ZXN0KGRhdGEpICYmIGRhdGEubGVuZ3RoICUgMiA9PT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBhbiBlcnJvciBtZXNzYWdlIGZvciBzYWZlIGRpc3BsYXlcclxuICogUmVtb3ZlcyBhbnkgSFRNTCwgc2NyaXB0cywgYW5kIGNvbnRyb2wgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUVycm9yTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiA1MDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgNDk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGNvcmUvc2lnbmluZy5qc1xyXG4gKlxyXG4gKiBNZXNzYWdlIHNpZ25pbmcgZnVuY3Rpb25hbGl0eSBmb3IgRUlQLTE5MSBhbmQgRUlQLTcxMlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogU2lnbnMgYSBtZXNzYWdlIHVzaW5nIEVJUC0xOTEgKHBlcnNvbmFsX3NpZ24pXHJcbiAqIFRoaXMgcHJlcGVuZHMgXCJcXHgxOUV0aGVyZXVtIFNpZ25lZCBNZXNzYWdlOlxcblwiICsgbGVuKG1lc3NhZ2UpIHRvIHRoZSBtZXNzYWdlXHJcbiAqIGJlZm9yZSBzaWduaW5nLCB3aGljaCBwcmV2ZW50cyBzaWduaW5nIGFyYml0cmFyeSB0cmFuc2FjdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBzaWduIChoZXggc3RyaW5nIG9yIFVURi04IHN0cmluZylcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBlcnNvbmFsU2lnbihzaWduZXIsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25NZXNzYWdlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWQsIGRlY29kZSBpdCBmaXJzdFxyXG4gICAgLy8gZXRoZXJzLmpzIHNpZ25NZXNzYWdlIGV4cGVjdHMgYSBzdHJpbmcgb3IgVWludDhBcnJheVxyXG4gICAgbGV0IG1lc3NhZ2VUb1NpZ24gPSBtZXNzYWdlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIC8vIEhleCBwYXlsb2FkOiBzaWduIHRoZSByYXcgYnl0ZXMuIGRBcHBzIHJlY292ZXIgdGhlIGFkZHJlc3MgYWdhaW5zdCB0aGVcclxuICAgICAgLy8gYnl0ZXMsIHNvIHNpZ25pbmcgdGhlIGhleCBzdHJpbmcncyBBU0NJSSBjaGFyYWN0ZXJzIChvciBhbnl0aGluZyBlbHNlKVxyXG4gICAgICAvLyBwcm9kdWNlcyBhIHNpZ25hdHVyZSB0aGF0IG5ldmVyIHZlcmlmaWVzLiBGb3IgdmFsaWQgVVRGLTggcGF5bG9hZHMgdGhlXHJcbiAgICAgIC8vIHNpZ25hdHVyZSBvdmVyIHRoZSBieXRlcyBpcyBpZGVudGljYWwgdG8gb25lIG92ZXIgdGhlIGRlY29kZWQgc3RyaW5nLlxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIG1lc3NhZ2VUb1NpZ24gPSBldGhlcnMuZ2V0Qnl0ZXMobWVzc2FnZSk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIE5vdCBhY3R1YWxseSB2YWxpZCBoZXgg4oCUIHNpZ24gdGhlIGxpdGVyYWwgc3RyaW5nXHJcbiAgICAgICAgbWVzc2FnZVRvU2lnbiA9IG1lc3NhZ2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTaWduIHRoZSBtZXNzYWdlIChldGhlcnMuanMgYXV0b21hdGljYWxseSBhcHBsaWVzIEVJUC0xOTEgZm9ybWF0KVxyXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2lnbmVyLnNpZ25NZXNzYWdlKG1lc3NhZ2VUb1NpZ24pO1xyXG5cclxuICAgIHJldHVybiBzaWduYXR1cmU7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHNpZ24gbWVzc2FnZTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFNpZ25zIHR5cGVkIGRhdGEgdXNpbmcgRUlQLTcxMlxyXG4gKiBVc2VkIGJ5IGRBcHBzIGZvciBzdHJ1Y3R1cmVkIGRhdGEgc2lnbmluZyAocGVybWl0cywgbWV0YS10cmFuc2FjdGlvbnMsIGV0Yy4pXHJcbiAqXHJcbiAqIEBwYXJhbSB7ZXRoZXJzLldhbGxldH0gc2lnbmVyIC0gV2FsbGV0IGluc3RhbmNlIHRvIHNpZ24gd2l0aFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHlwZWREYXRhIC0gRUlQLTcxMiB0eXBlZCBkYXRhIG9iamVjdCB3aXRoIGRvbWFpbiwgdHlwZXMsIGFuZCBtZXNzYWdlXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFNpZ25hdHVyZSAoMHgtcHJlZml4ZWQgaGV4IHN0cmluZylcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduVHlwZWREYXRhKHNpZ25lciwgdHlwZWREYXRhKSB7XHJcbiAgaWYgKCFzaWduZXIgfHwgdHlwZW9mIHNpZ25lci5zaWduVHlwZWREYXRhICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIXR5cGVkRGF0YSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdUeXBlZCBkYXRhIGlzIHJlcXVpcmVkJyk7XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSB0eXBlZCBkYXRhIHN0cnVjdHVyZVxyXG4gIGlmICghdHlwZWREYXRhLmRvbWFpbiB8fCAhdHlwZWREYXRhLnR5cGVzIHx8ICF0eXBlZERhdGEubWVzc2FnZSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEVJUC03MTIgdHlwZWQgZGF0YTogbWlzc2luZyBkb21haW4sIHR5cGVzLCBvciBtZXNzYWdlJyk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gRXh0cmFjdCBwcmltYXJ5VHlwZSAoaWYgbm90IHByb3ZpZGVkLCB0cnkgdG8gaW5mZXIgaXQpXHJcbiAgICBsZXQgcHJpbWFyeVR5cGUgPSB0eXBlZERhdGEucHJpbWFyeVR5cGU7XHJcblxyXG4gICAgaWYgKCFwcmltYXJ5VHlwZSkge1xyXG4gICAgICAvLyBUcnkgdG8gaW5mZXIgcHJpbWFyeSB0eXBlIGZyb20gdHlwZXMgb2JqZWN0XHJcbiAgICAgIC8vIEl0J3MgdGhlIHR5cGUgdGhhdCdzIG5vdCBcIkVJUDcxMkRvbWFpblwiXHJcbiAgICAgIGNvbnN0IHR5cGVOYW1lcyA9IE9iamVjdC5rZXlzKHR5cGVkRGF0YS50eXBlcykuZmlsdGVyKHQgPT4gdCAhPT0gJ0VJUDcxMkRvbWFpbicpO1xyXG4gICAgICBpZiAodHlwZU5hbWVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIHByaW1hcnlUeXBlID0gdHlwZU5hbWVzWzBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGluZmVyIHByaW1hcnlUeXBlIC0gcGxlYXNlIHNwZWNpZnkgaXQgZXhwbGljaXRseScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgdGhhdCBwcmltYXJ5VHlwZSBleGlzdHMgaW4gdHlwZXNcclxuICAgIGlmICghdHlwZWREYXRhLnR5cGVzW3ByaW1hcnlUeXBlXSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByaW1hcnkgdHlwZSBcIiR7cHJpbWFyeVR5cGV9XCIgbm90IGZvdW5kIGluIHR5cGVzIGRlZmluaXRpb25gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaWduIHVzaW5nIGV0aGVycy5qcyBzaWduVHlwZWREYXRhXHJcbiAgICAvLyBldGhlcnMgdjYgdXNlczogc2lnblR5cGVkRGF0YShkb21haW4sIHR5cGVzLCB2YWx1ZSlcclxuICAgIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IHNpZ25lci5zaWduVHlwZWREYXRhKFxyXG4gICAgICB0eXBlZERhdGEuZG9tYWluLFxyXG4gICAgICB0eXBlZERhdGEudHlwZXMsXHJcbiAgICAgIHR5cGVkRGF0YS5tZXNzYWdlXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBzaWduYXR1cmU7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHNpZ24gdHlwZWQgZGF0YTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhIG1lc3NhZ2Ugc2lnbmluZyByZXF1ZXN0XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgLSBSUEMgbWV0aG9kIChwZXJzb25hbF9zaWduLCBldGhfc2lnblR5cGVkRGF0YV92NCwgZXRjLilcclxuICogQHBhcmFtIHtBcnJheX0gcGFyYW1zIC0gUlBDIHBhcmFtZXRlcnNcclxuICogQHJldHVybnMge09iamVjdH0geyB2YWxpZDogYm9vbGVhbiwgZXJyb3I/OiBzdHJpbmcsIHNhbml0aXplZD86IE9iamVjdCB9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTaWduUmVxdWVzdChtZXRob2QsIHBhcmFtcykge1xyXG4gIGlmICghbWV0aG9kIHx8ICFwYXJhbXMgfHwgIUFycmF5LmlzQXJyYXkocGFyYW1zKSkge1xyXG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcmVxdWVzdCBmb3JtYXQnIH07XHJcbiAgfVxyXG5cclxuICBzd2l0Y2ggKG1ldGhvZCkge1xyXG4gICAgY2FzZSAncGVyc29uYWxfc2lnbic6XHJcbiAgICBjYXNlICdldGhfc2lnbic6IC8vIE5vdGU6IGV0aF9zaWduIGlzIGRhbmdlcm91cyBhbmQgc2hvdWxkIHNob3cgc3Ryb25nIHdhcm5pbmdcclxuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVycycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbWVzc2FnZSA9IHBhcmFtc1swXTtcclxuICAgICAgY29uc3QgYWRkcmVzcyA9IHBhcmFtc1sxXTtcclxuXHJcbiAgICAgIGlmICghbWVzc2FnZSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNZXNzYWdlIGlzIGVtcHR5JyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWFkZHJlc3MgfHwgIWV0aGVycy5pc0FkZHJlc3MoYWRkcmVzcykpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhZGRyZXNzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTYW5pdGl6ZSBtZXNzYWdlIChjb252ZXJ0IHRvIHN0cmluZyBpZiBuZWVkZWQpXHJcbiAgICAgIGNvbnN0IHNhbml0aXplZE1lc3NhZ2UgPSB0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgPyBtZXNzYWdlIDogU3RyaW5nKG1lc3NhZ2UpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB2YWxpZDogdHJ1ZSxcclxuICAgICAgICBzYW5pdGl6ZWQ6IHtcclxuICAgICAgICAgIG1lc3NhZ2U6IHNhbml0aXplZE1lc3NhZ2UsXHJcbiAgICAgICAgICBhZGRyZXNzOiBldGhlcnMuZ2V0QWRkcmVzcyhhZGRyZXNzKSAvLyBOb3JtYWxpemUgdG8gY2hlY2tzdW0gYWRkcmVzc1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YSc6XHJcbiAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92Myc6XHJcbiAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92NCc6XHJcbiAgICAgIGlmIChwYXJhbXMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlcnMnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGFkZHIgPSBwYXJhbXNbMF07XHJcbiAgICAgIGxldCB0eXBlZERhdGEgPSBwYXJhbXNbMV07XHJcblxyXG4gICAgICBpZiAoIWFkZHIgfHwgIWV0aGVycy5pc0FkZHJlc3MoYWRkcikpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhZGRyZXNzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQYXJzZSB0eXBlZCBkYXRhIGlmIGl0J3MgYSBzdHJpbmdcclxuICAgICAgaWYgKHR5cGVvZiB0eXBlZERhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHR5cGVkRGF0YSA9IEpTT04ucGFyc2UodHlwZWREYXRhKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHR5cGVkIGRhdGEgZm9ybWF0JyB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVmFsaWRhdGUgdHlwZWQgZGF0YSBzdHJ1Y3R1cmVcclxuICAgICAgaWYgKCF0eXBlZERhdGEgfHwgdHlwZW9mIHR5cGVkRGF0YSAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnVHlwZWQgZGF0YSBtdXN0IGJlIGFuIG9iamVjdCcgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF0eXBlZERhdGEuZG9tYWluIHx8ICF0eXBlZERhdGEudHlwZXMgfHwgIXR5cGVkRGF0YS5tZXNzYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1R5cGVkIGRhdGEgbWlzc2luZyByZXF1aXJlZCBmaWVsZHMgKGRvbWFpbiwgdHlwZXMsIG1lc3NhZ2UpJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHNhbml0aXplZDoge1xyXG4gICAgICAgICAgYWRkcmVzczogZXRoZXJzLmdldEFkZHJlc3MoYWRkciksXHJcbiAgICAgICAgICB0eXBlZERhdGE6IHR5cGVkRGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgVW5zdXBwb3J0ZWQgc2lnbmluZyBtZXRob2Q6ICR7bWV0aG9kfWAgfTtcclxuICB9XHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBiYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzXHJcbiAqXHJcbiAqIEJhY2tncm91bmQgc2VydmljZSB3b3JrZXIgZm9yIEhlYXJ0V2FsbGV0XHJcbiAqIEhhbmRsZXMgUlBDIHJlcXVlc3RzIGZyb20gZEFwcHMgYW5kIG1hbmFnZXMgd2FsbGV0IHN0YXRlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZ2V0QWN0aXZlV2FsbGV0LCB1bmxvY2tXYWxsZXQsIHNlY3VyZUNsZWFudXAsIHNlY3VyZUNsZWFudXBTaWduZXIgfSBmcm9tICcuLi9jb3JlL3dhbGxldC5qcyc7XHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuLi9jb3JlL3N0b3JhZ2UuanMnO1xyXG5pbXBvcnQgKiBhcyBycGMgZnJvbSAnLi4vY29yZS9ycGMuanMnO1xyXG5pbXBvcnQgKiBhcyB0eEhpc3RvcnkgZnJvbSAnLi4vY29yZS90eEhpc3RvcnkuanMnO1xyXG5pbXBvcnQgeyB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCwgc2FuaXRpemVFcnJvck1lc3NhZ2UgfSBmcm9tICcuLi9jb3JlL3R4VmFsaWRhdGlvbi5qcyc7XHJcbmltcG9ydCB7IHBlcnNvbmFsU2lnbiwgc2lnblR5cGVkRGF0YSwgdmFsaWRhdGVTaWduUmVxdWVzdCB9IGZyb20gJy4uL2NvcmUvc2lnbmluZy5qcyc7XHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vLyBTZXJ2aWNlIHdvcmtlciBsb2FkZWRcclxuXHJcbi8vIE5ldHdvcmsgY2hhaW4gSURzXHJcbi8vIExvd2VyY2FzZSBoZXg6IGRBcHBzIGNvbXBhcmUgZXRoX2NoYWluSWQvY2hhaW5DaGFuZ2VkIHZhbHVlcyBhcyBzdHJpbmdzXHJcbi8vIGFnYWluc3QgbG93ZXJjYXNlIHJlZ2lzdHJpZXMgKE1ldGFNYXNrIGNvbnZlbnRpb24pLCBzbyAnMHgzQUYnIHJlYWRzIGFzIGFcclxuLy8gZGlmZmVyZW50IGNoYWluIHRoYW4gJzB4M2FmJyB0byB0aGVtLlxyXG5jb25zdCBDSEFJTl9JRFMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJzB4M2FmJywgLy8gOTQzXHJcbiAgJ3B1bHNlY2hhaW4nOiAnMHgxNzEnLCAvLyAzNjlcclxuICAnZXRoZXJldW0nOiAnMHgxJywgLy8gMVxyXG4gICdzZXBvbGlhJzogJzB4YWEzNmE3JyAvLyAxMTE1NTExMVxyXG59O1xyXG5cclxuLy8gRmFsbGJhY2sgd2hlbiB0aGUgdXNlciBoYXMgbmV2ZXIgc3dpdGNoZWQgbmV0d29ya3MuIE11c3QgbWF0Y2ggdGhlIHBvcHVwJ3NcclxuLy8gaW5pdGlhbCBjdXJyZW50U3RhdGUubmV0d29yaywgb3IgdGhlIFVJIGFuZCB0aGUgZEFwcC1mYWNpbmcgQVBJIGRpc2FncmVlXHJcbi8vIGFib3V0IHdoaWNoIGNoYWluIGlzIGFjdGl2ZSBvbiBhIGZyZXNoIHByb2ZpbGUuXHJcbmNvbnN0IERFRkFVTFRfTkVUV09SSyA9ICdwdWxzZWNoYWluJztcclxuXHJcbmNvbnN0IE5FVFdPUktfTkFNRVMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ1B1bHNlQ2hhaW4gVGVzdG5ldCBWNCcsXHJcbiAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG59O1xyXG5cclxuY29uc3QgQ0hBSU5fSURfVE9fTkVUV09SSyA9IHtcclxuICAnMHgzYWYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICcweDE3MSc6ICdwdWxzZWNoYWluJyxcclxuICAnMHgxJzogJ2V0aGVyZXVtJyxcclxuICAnMHhhYTM2YTcnOiAnc2Vwb2xpYSdcclxufTtcclxuXHJcbi8vIFN0b3JhZ2Uga2V5c1xyXG5jb25zdCBDT05ORUNURURfU0lURVNfS0VZID0gJ2Nvbm5lY3RlZF9zaXRlcyc7XHJcblxyXG4vLyBQZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdHMgKG9yaWdpbiAtPiB7IHJlc29sdmUsIHJlamVjdCwgdGFiSWQgfSlcclxuY29uc3QgcGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyBjaGFpbiBzd2l0Y2ggcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBuZXR3b3JrS2V5LCBjaGFpbklkLCBhcHByb3ZhbFRva2VuIH0pXHJcbmNvbnN0IHBlbmRpbmdDaGFpblN3aXRjaGVzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gU0lHTklORyBBVURJVCBMT0cgPT09PT1cclxuLy8gU3RvcmVzIHJlY2VudCBzaWduaW5nIG9wZXJhdGlvbnMgZm9yIHNlY3VyaXR5IGF1ZGl0aW5nIChpbi1tZW1vcnksIGNsZWFyZWQgb24gc2VydmljZSB3b3JrZXIgcmVzdGFydClcclxuY29uc3QgU0lHTklOR19MT0dfS0VZID0gJ3NpZ25pbmdfYXVkaXRfbG9nJztcclxuY29uc3QgTUFYX1NJR05JTkdfTE9HX0VOVFJJRVMgPSAxMDA7XHJcblxyXG4vKipcclxuICogTG9nIGEgc2lnbmluZyBvcGVyYXRpb24gZm9yIGF1ZGl0IHB1cnBvc2VzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIExvZyBlbnRyeSBkZXRhaWxzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRyeS50eXBlIC0gVHlwZSBvZiBzaWduaW5nICh0cmFuc2FjdGlvbiwgcGVyc29uYWxfc2lnbiwgdHlwZWRfZGF0YSlcclxuICogQHBhcmFtIHtzdHJpbmd9IGVudHJ5LmFkZHJlc3MgLSBXYWxsZXQgYWRkcmVzcyB0aGF0IHNpZ25lZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkub3JpZ2luIC0gZEFwcCBvcmlnaW4gdGhhdCByZXF1ZXN0ZWQgdGhlIHNpZ25hdHVyZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkubWV0aG9kIC0gUlBDIG1ldGhvZCB1c2VkXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW50cnkuc3VjY2VzcyAtIFdoZXRoZXIgc2lnbmluZyBzdWNjZWVkZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS50eEhhc2hdIC0gVHJhbnNhY3Rpb24gaGFzaCAoZm9yIHRyYW5zYWN0aW9ucylcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS5lcnJvcl0gLSBFcnJvciBtZXNzYWdlIChpZiBmYWlsZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBsb2dTaWduaW5nT3BlcmF0aW9uKGVudHJ5KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGxvZ0VudHJ5ID0ge1xyXG4gICAgICAuLi5lbnRyeSxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdldCBleGlzdGluZyBsb2dcclxuICAgIGNvbnN0IGV4aXN0aW5nTG9nID0gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEFkZCBuZXcgZW50cnkgYXQgdGhlIGJlZ2lubmluZ1xyXG4gICAgZXhpc3RpbmdMb2cudW5zaGlmdChsb2dFbnRyeSk7XHJcblxyXG4gICAgLy8gVHJpbSB0byBtYXggZW50cmllc1xyXG4gICAgaWYgKGV4aXN0aW5nTG9nLmxlbmd0aCA+IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTKSB7XHJcbiAgICAgIGV4aXN0aW5nTG9nLmxlbmd0aCA9IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgbG9nXHJcbiAgICBhd2FpdCBzYXZlKFNJR05JTkdfTE9HX0tFWSwgZXhpc3RpbmdMb2cpO1xyXG5cclxuICAgIC8vIEFsc28gbG9nIHRvIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAgY29uc3QgaWNvbiA9IGVudHJ5LnN1Y2Nlc3MgPyAn4pyFJyA6ICfinYwnO1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgJHtpY29ufSBTaWduaW5nIGF1ZGl0OiAke2VudHJ5LnR5cGV9IGZyb20gJHtlbnRyeS5vcmlnaW59IC0gJHtlbnRyeS5zdWNjZXNzID8gJ1NVQ0NFU1MnIDogJ0ZBSUxFRCd9YCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIERvbid0IGxldCBsb2dnaW5nIGZhaWx1cmVzIGFmZmVjdCBzaWduaW5nIG9wZXJhdGlvbnNcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgbG9nZ2luZyBzaWduaW5nIG9wZXJhdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHNpZ25pbmcgYXVkaXQgbG9nXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gQXJyYXkgb2YgbG9nIGVudHJpZXNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNpZ25pbmdBdWRpdExvZygpIHtcclxuICByZXR1cm4gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG59XHJcblxyXG4vLyA9PT09PSBTRVNTSU9OIE1BTkFHRU1FTlQgPT09PT1cclxuLy8gU2Vzc2lvbiB0b2tlbnMgc3RvcmVkIGluIG1lbW9yeSAoY2xlYXJlZCB3aGVuIHNlcnZpY2Ugd29ya2VyIHRlcm1pbmF0ZXMpXHJcbi8vIFNFQ1VSSVRZIE5PVEU6IFNlcnZpY2Ugd29ya2VycyBjYW4gYmUgdGVybWluYXRlZCBieSBDaHJvbWUgYXQgYW55IHRpbWUsIHdoaWNoIGNsZWFycyBhbGxcclxuLy8gc2Vzc2lvbiBkYXRhLiBUaGlzIGlzIGludGVudGlvbmFsIC0gd2UgZG9uJ3Qgd2FudCBwYXNzd29yZHMgcGVyc2lzdGluZyBsb25nZXIgdGhhbiBuZWVkZWQuXHJcbi8vIFNlc3Npb25zIGFyZSBlbmNyeXB0ZWQgaW4gbWVtb3J5IGFzIGFuIGFkZGl0aW9uYWwgc2VjdXJpdHkgbGF5ZXIuXHJcbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpOyAvLyBzZXNzaW9uVG9rZW4gLT4geyBlbmNyeXB0ZWRQYXNzd29yZCwgd2FsbGV0SWQsIGV4cGlyZXNBdCwgc2FsdCB9XHJcblxyXG4vLyBTZXNzaW9uIGVuY3J5cHRpb24ga2V5IChyZWdlbmVyYXRlZCBvbiBzZXJ2aWNlIHdvcmtlciBzdGFydClcclxubGV0IHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHNlc3Npb24gZW5jcnlwdGlvbiBrZXkgdXNpbmcgV2ViIENyeXB0byBBUElcclxuICogS2V5IGlzIHJlZ2VuZXJhdGVkIGVhY2ggdGltZSBzZXJ2aWNlIHdvcmtlciBzdGFydHMgKG1lbW9yeSBvbmx5LCBuZXZlciBwZXJzaXN0ZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKSB7XHJcbiAgaWYgKCFzZXNzaW9uRW5jcnlwdGlvbktleSkge1xyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gMjU2LWJpdCBrZXkgZm9yIEFFUy1HQ00gZW5jcnlwdGlvblxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcclxuICAgICAgZmFsc2UsIC8vIE5vdCBleHRyYWN0YWJsZVxyXG4gICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY3J5cHRzIHBhc3N3b3JkIGZvciBzZXNzaW9uIHN0b3JhZ2UgdXNpbmcgQUVTLUdDTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBQYXNzd29yZCB0byBlbmNyeXB0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtlbmNyeXB0ZWQ6IEFycmF5QnVmZmVyLCBpdjogVWludDhBcnJheX0+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCkge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICBjb25zdCBwYXNzd29yZERhdGEgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcbiAgXHJcbiAgLy8gR2VuZXJhdGUgcmFuZG9tIElWIGZvciB0aGlzIGVuY3J5cHRpb25cclxuICAvLyBTRUNVUklUWTogSVYgdW5pcXVlbmVzcyBpcyBjcnlwdG9ncmFwaGljYWxseSBndWFyYW50ZWVkIGJ5IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKVxyXG4gIC8vIHdoaWNoIHVzZXMgdGhlIGJyb3dzZXIncyBDU1BSTkcgKENyeXB0b2dyYXBoaWNhbGx5IFNlY3VyZSBQc2V1ZG8tUmFuZG9tIE51bWJlciBHZW5lcmF0b3IpXHJcbiAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7XHJcbiAgXHJcbiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIHBhc3N3b3JkRGF0YVxyXG4gICk7XHJcbiAgXHJcbiAgcmV0dXJuIHsgZW5jcnlwdGVkLCBpdiB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVjcnlwdHMgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkIC0gRW5jcnlwdGVkIHBhc3N3b3JkIGRhdGFcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBpdiAtIEluaXRpYWxpemF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oZW5jcnlwdGVkLCBpdikge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIFxyXG4gIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBlbmNyeXB0ZWRcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuICByZXR1cm4gZGVjb2Rlci5kZWNvZGUoZGVjcnlwdGVkKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlc3Npb24gdG9rZW5cclxuZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBuZXcgc2Vzc2lvblxyXG4vLyBTRUNVUklUWTogRGVmYXVsdCBzZXNzaW9uIGR1cmF0aW9uIHJlZHVjZWQgdG8gMTUgbWludXRlcyB0byBtaW5pbWl6ZSBwYXNzd29yZCBleHBvc3VyZSBpbiBtZW1vcnlcclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihwYXNzd29yZCwgd2FsbGV0SWQsIGR1cmF0aW9uTXMgPSA5MDAwMDApIHsgLy8gRGVmYXVsdCAxNSBtaW51dGVzICh3YXMgMSBob3VyKVxyXG4gIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGdlbmVyYXRlU2Vzc2lvblRva2VuKCk7XHJcbiAgY29uc3QgZXhwaXJlc0F0ID0gRGF0ZS5ub3coKSArIGR1cmF0aW9uTXM7XHJcbiAgXHJcbiAgLy8gRW5jcnlwdCBwYXNzd29yZCBiZWZvcmUgc3RvcmluZyBpbiBtZW1vcnlcclxuICBjb25zdCB7IGVuY3J5cHRlZCwgaXYgfSA9IGF3YWl0IGVuY3J5cHRQYXNzd29yZEZvclNlc3Npb24ocGFzc3dvcmQpO1xyXG5cclxuICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvblRva2VuLCB7XHJcbiAgICBlbmNyeXB0ZWRQYXNzd29yZDogZW5jcnlwdGVkLFxyXG4gICAgaXY6IGl2LFxyXG4gICAgd2FsbGV0SWQsXHJcbiAgICBleHBpcmVzQXRcclxuICB9KTtcclxuXHJcbiAgLy8gQXV0by1jbGVhbnVwIGV4cGlyZWQgc2Vzc2lvblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvblRva2VuKTtcclxuICAgICAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgICAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZXNzaW9uIGV4cGlyZWQgYW5kIHJlbW92ZWQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIGR1cmF0aW9uTXMpO1xyXG5cclxuICAvLyBTZXNzaW9uIGNyZWF0ZWRcclxuICByZXR1cm4gc2Vzc2lvblRva2VuO1xyXG59XHJcblxyXG4vLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCByZXR1cm4gZGVjcnlwdGVkIHBhc3N3b3JkXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXNlc3Npb25Ub2tlbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBzZXNzaW9uIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcblxyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG9yIGV4cGlyZWQgc2Vzc2lvbicpO1xyXG4gIH1cclxuXHJcbiAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZXNzaW9uIGV4cGlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIERlY3J5cHQgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICByZXR1cm4gYXdhaXQgZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oc2Vzc2lvbi5lbmNyeXB0ZWRQYXNzd29yZCwgc2Vzc2lvbi5pdik7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgc2Vzc2lvblxyXG5mdW5jdGlvbiBpbnZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25Ub2tlbikpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgLy8gU2Vzc2lvbiBpbnZhbGlkYXRlZFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gSW52YWxpZGF0ZSBhbGwgc2Vzc2lvbnNcclxuZnVuY3Rpb24gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCkge1xyXG4gIGNvbnN0IGNvdW50ID0gYWN0aXZlU2Vzc2lvbnMuc2l6ZTtcclxuICBhY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xyXG4gIC8vIEFsbCBzZXNzaW9ucyBpbnZhbGlkYXRlZFxyXG4gIHJldHVybiBjb3VudDtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBleHRlbnNpb24gaW5zdGFsbGF0aW9uXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBpbnN0YWxsZWQnKTtcclxufSk7XHJcblxyXG4vLyBHZXQgY29ubmVjdGVkIHNpdGVzIGZyb20gc3RvcmFnZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlcygpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGxvYWQoQ09OTkVDVEVEX1NJVEVTX0tFWSk7XHJcbiAgcmV0dXJuIHNpdGVzIHx8IHt9O1xyXG59XHJcblxyXG4vLyBHZXQgYSBjb25uZWN0ZWQgc2l0ZSBlbnRyeVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlKG9yaWdpbikge1xyXG4gIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICByZXR1cm4gc2l0ZXNbb3JpZ2luXSB8fCBudWxsO1xyXG59XHJcblxyXG4vLyBHZXQgdGhlIGN1cnJlbnRseSBhdXRob3JpemVkIGFjY291bnQgZm9yIGEgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRBdXRob3JpemVkQWNjb3VudHMob3JpZ2luKSB7XHJcbiAgY29uc3Qgc2l0ZSA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGUob3JpZ2luKTtcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuXHJcbiAgaWYgKCFzaXRlIHx8ICF3YWxsZXQ/LmFkZHJlc3MpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGF1dGhvcml6ZWRBY2NvdW50cyA9IEFycmF5LmlzQXJyYXkoc2l0ZS5hY2NvdW50cykgPyBzaXRlLmFjY291bnRzIDogW107XHJcbiAgY29uc3QgYWN0aXZlQWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgaXNBdXRob3JpemVkID0gYXV0aG9yaXplZEFjY291bnRzLnNvbWUoXHJcbiAgICBhY2NvdW50ID0+IHR5cGVvZiBhY2NvdW50ID09PSAnc3RyaW5nJyAmJiBhY2NvdW50LnRvTG93ZXJDYXNlKCkgPT09IGFjdGl2ZUFkZHJlc3NcclxuICApO1xyXG5cclxuICByZXR1cm4gaXNBdXRob3JpemVkID8gW3dhbGxldC5hZGRyZXNzXSA6IFtdO1xyXG59XHJcblxyXG4vLyBDaGVjayBpZiBhIHNpdGUgaXMgY29ubmVjdGVkXHJcbmFzeW5jIGZ1bmN0aW9uIGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pIHtcclxuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGdldEF1dGhvcml6ZWRBY2NvdW50cyhvcmlnaW4pO1xyXG4gIHJldHVybiBhY2NvdW50cy5sZW5ndGggPiAwO1xyXG59XHJcblxyXG4vLyBBZGQgYSBjb25uZWN0ZWQgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiBhZGRDb25uZWN0ZWRTaXRlKG9yaWdpbiwgYWNjb3VudHMpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgY29uc3QgZXhpc3RpbmdBY2NvdW50cyA9IEFycmF5LmlzQXJyYXkoc2l0ZXNbb3JpZ2luXT8uYWNjb3VudHMpID8gc2l0ZXNbb3JpZ2luXS5hY2NvdW50cyA6IFtdO1xyXG4gIGNvbnN0IG1lcmdlZEFjY291bnRzID0gWy4uLmV4aXN0aW5nQWNjb3VudHNdO1xyXG5cclxuICBmb3IgKGNvbnN0IGFjY291bnQgb2YgYWNjb3VudHMgfHwgW10pIHtcclxuICAgIGlmIChcclxuICAgICAgdHlwZW9mIGFjY291bnQgPT09ICdzdHJpbmcnICYmXHJcbiAgICAgICFtZXJnZWRBY2NvdW50cy5zb21lKGV4aXN0aW5nID0+IGV4aXN0aW5nLnRvTG93ZXJDYXNlKCkgPT09IGFjY291bnQudG9Mb3dlckNhc2UoKSlcclxuICAgICkge1xyXG4gICAgICBtZXJnZWRBY2NvdW50cy5wdXNoKGFjY291bnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2l0ZXNbb3JpZ2luXSA9IHtcclxuICAgIGFjY291bnRzOiBtZXJnZWRBY2NvdW50cyxcclxuICAgIGNvbm5lY3RlZEF0OiBzaXRlc1tvcmlnaW5dPy5jb25uZWN0ZWRBdCB8fCBEYXRlLm5vdygpLFxyXG4gICAgbGFzdENvbm5lY3RlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuICBhd2FpdCBzYXZlKENPTk5FQ1RFRF9TSVRFU19LRVksIHNpdGVzKTtcclxufVxyXG5cclxuLy8gUmVtb3ZlIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ29ubmVjdGVkU2l0ZShvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgZGVsZXRlIHNpdGVzW29yaWdpbl07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIE5vdGlmeSB0YWJzIHdoZW4gdGhlIGFjdGl2ZSBhdXRob3JpemVkIGFjY291bnQgY2hhbmdlc1xyXG5hc3luYyBmdW5jdGlvbiBub3RpZnlBY2NvdW50c0NoYW5nZWQoKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGNvbnN0IGFjdGl2ZUFkZHJlc3MgPSB3YWxsZXQ/LmFkZHJlc3MgfHwgbnVsbDtcclxuXHJcbiAgY2hyb21lLnRhYnMucXVlcnkoe30sICh0YWJzKSA9PiB7XHJcbiAgICB0YWJzLmZvckVhY2goKHRhYikgPT4ge1xyXG4gICAgICBpZiAoIXRhYi5pZCB8fCAhdGFiLnVybCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IG9yaWdpbjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBvcmlnaW4gPSBuZXcgVVJMKHRhYi51cmwpLm9yaWdpbjtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBzaXRlID0gc2l0ZXNbb3JpZ2luXTtcclxuICAgICAgY29uc3QgYWNjb3VudHMgPSAoXHJcbiAgICAgICAgc2l0ZSAmJlxyXG4gICAgICAgIGFjdGl2ZUFkZHJlc3MgJiZcclxuICAgICAgICBBcnJheS5pc0FycmF5KHNpdGUuYWNjb3VudHMpICYmXHJcbiAgICAgICAgc2l0ZS5hY2NvdW50cy5zb21lKGFjY291bnQgPT4gdHlwZW9mIGFjY291bnQgPT09ICdzdHJpbmcnICYmIGFjY291bnQudG9Mb3dlckNhc2UoKSA9PT0gYWN0aXZlQWRkcmVzcy50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICApID8gW2FjdGl2ZUFkZHJlc3NdIDogW107XHJcblxyXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHtcclxuICAgICAgICB0eXBlOiAnQUNDT1VOVFNfQ0hBTkdFRCcsXHJcbiAgICAgICAgYWNjb3VudHNcclxuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIC8vIFRhYiBtaWdodCBub3QgaGF2ZSBjb250ZW50IHNjcmlwdCwgaWdub3JlIGVycm9yXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIE5vdGlmeSB0YWJzIHdoZW4gdGhlIG5ldHdvcmsgY2hhbmdlc1xyXG5mdW5jdGlvbiBub3RpZnlDaGFpbkNoYW5nZWQoY2hhaW5JZCkge1xyXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCAodGFicykgPT4ge1xyXG4gICAgdGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xyXG4gICAgICAgIHR5cGU6ICdDSEFJTl9DSEFOR0VEJyxcclxuICAgICAgICBjaGFpbklkXHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQsIGlnbm9yZSBlcnJvclxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGNoYWluIElEXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFpbklkKCkge1xyXG4gIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpO1xyXG4gIHJldHVybiBDSEFJTl9JRFNbbmV0d29yayB8fCBERUZBVUxUX05FVFdPUktdO1xyXG59XHJcblxyXG4vLyBTRUNVUklUWTogTWV0aG9kcyBhbnkgc2l0ZSBtYXkgY2FsbCB3aXRob3V0IGFuIGFwcHJvdmVkIGNvbm5lY3Rpb24uXHJcbi8vIEV2ZXJ5dGhpbmcgZWxzZSAtIGluY2x1ZGluZyByZWFkLW9ubHkgY2hhaW4gcXVlcmllcyAtIHJlcXVpcmVzIGEgY29ubmVjdGlvbiwgc28gYVxyXG4vLyBwYWdlIHRoZSB1c2VyIG5ldmVyIGFwcHJvdmVkIGNhbm5vdCB1c2UgdGhlIHdhbGxldCBhcyBhIGZyZWUgUlBDIHByb3h5ICh3aGljaFxyXG4vLyBsZWFrcyB0aGUgdXNlcidzIGNvbmZpZ3VyZWQgZW5kcG9pbnQgYW5kIElQKSBvciBwcm9iZSBjaGFpbiBzdGF0ZSB0aHJvdWdoIHRoZW0uXHJcbi8vXHJcbi8vIGV0aF9jaGFpbklkL25ldF92ZXJzaW9uIHN0YXkgcHVibGljIGJlY2F1c2UgRUlQLTExOTMgd2FsbGV0IGRldGVjdGlvbiByZWFkcyB0aGVtXHJcbi8vIGJlZm9yZSBjb25uZWN0aW5nOyBldGhfYWNjb3VudHMgaXMgcHVibGljIGJlY2F1c2UgaXQgYWxyZWFkeSByZXR1cm5zIFtdIGZvciBhblxyXG4vLyB1bmNvbm5lY3RlZCBzaXRlOyBldGhfcmVxdWVzdEFjY291bnRzIElTIHRoZSBjb25uZWN0aW9uIHJlcXVlc3QuXHJcbmNvbnN0IFBVQkxJQ19NRVRIT0RTID0gbmV3IFNldChbXHJcbiAgJ2V0aF9jaGFpbklkJyxcclxuICAnbmV0X3ZlcnNpb24nLFxyXG4gICdldGhfYWNjb3VudHMnLFxyXG4gICdldGhfcmVxdWVzdEFjY291bnRzJ1xyXG5dKTtcclxuXHJcbi8vIEVJUC0xMTkzOiBjb2RlIDQwMDEgPSB1c2VyIHJlamVjdGVkIHRoZSByZXF1ZXN0LiBkQXBwcyBicmFuY2ggb24gdGhpcyBjb2RlXHJcbi8vIHRvIHNob3cgYSBxdWlldCBcImNhbmNlbGxlZFwiIHN0YXRlIGluc3RlYWQgb2YgYW4gZXJyb3IsIHNvIHJlamVjdGlvbnMgbXVzdFxyXG4vLyBjYXJyeSBpdCBhbGwgdGhlIHdheSBiYWNrIHRvIHRoZSBwYWdlLlxyXG5mdW5jdGlvbiB1c2VyUmVqZWN0aW9uKG1lc3NhZ2UpIHtcclxuICBjb25zdCBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgZXJyLmNvZGUgPSA0MDAxO1xyXG4gIHJldHVybiBlcnI7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXQgcmVxdWVzdHMgZnJvbSBjb250ZW50IHNjcmlwdHNcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlV2FsbGV0UmVxdWVzdChtZXNzYWdlLCBzZW5kZXIpIHtcclxuICBjb25zdCB7IG1ldGhvZCwgcGFyYW1zIH0gPSBtZXNzYWdlO1xyXG5cclxuICAvLyBTRUNVUklUWTogR2V0IG9yaWdpbiBmcm9tIENocm9tZSBBUEksIG5vdCBtZXNzYWdlIHBheWxvYWQgKHByZXZlbnRzIHNwb29maW5nKS5cclxuICAvLyBJZiB3ZSBjYW5ub3QgZGV0ZXJtaW5lIGFuIG9yaWdpbiB3ZSBjYW5ub3QgbWFrZSBhbiBhdXRob3JpemF0aW9uIGRlY2lzaW9uLCBzbyByZWZ1c2UuXHJcbiAgbGV0IG9yaWdpbjtcclxuICB0cnkge1xyXG4gICAgb3JpZ2luID0gbmV3IFVSTChzZW5kZXIudXJsKS5vcmlnaW47XHJcbiAgfSBjYXRjaCB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgU0VDVVJJVFk6IFJlamVjdGluZyB3YWxsZXQgcmVxdWVzdCB3aXRoIHVuZGV0ZXJtaW5hYmxlIG9yaWdpbjonLCBzZW5kZXI/LnVybCk7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBjb3VsZCBub3QgZGV0ZXJtaW5lIHJlcXVlc3Qgb3JpZ2luJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogU2luZ2xlIGNob2tlIHBvaW50IGZvciB0aGUgY29ubmVjdGlvbiByZXF1aXJlbWVudCwgc28gYSBuZXdseSBhZGRlZFxyXG4gIC8vIG1ldGhvZCBjYW5ub3QgYWNjaWRlbnRhbGx5IHNoaXAgd2l0aG91dCBhbiBhdXRob3JpemF0aW9uIGNoZWNrLlxyXG4gIGlmICghUFVCTElDX01FVEhPRFMuaGFzKG1ldGhvZCkgJiYgIShhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGluZyB3YWxsZXQgcmVxdWVzdFxyXG5cclxuICB0cnkge1xyXG4gICAgc3dpdGNoIChtZXRob2QpIHtcclxuICAgICAgY2FzZSAnZXRoX3JlcXVlc3RBY2NvdW50cyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHNlbmRlci50YWIpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2FjY291bnRzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQWNjb3VudHMob3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9jaGFpbklkJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQ2hhaW5JZCgpO1xyXG5cclxuICAgICAgY2FzZSAnbmV0X3ZlcnNpb24nOlxyXG4gICAgICAgIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBoYW5kbGVDaGFpbklkKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgcmVzdWx0OiBwYXJzZUludChjaGFpbklkLnJlc3VsdCwgMTYpLnRvU3RyaW5nKCkgfTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF9zd2l0Y2hFdGhlcmV1bUNoYWluJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU3dpdGNoQ2hhaW4ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBZGRDaGFpbihwYXJhbXMsIG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICd3YWxsZXRfd2F0Y2hBc3NldCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVdhdGNoQXNzZXQocGFyYW1zLCBvcmlnaW4sIHNlbmRlci50YWIpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2Jsb2NrTnVtYmVyJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQmxvY2tOdW1iZXIoKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCbG9ja0J5TnVtYmVyJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmxvY2tCeU51bWJlcihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldEJhbGFuY2UnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25Db3VudCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uQ291bnQocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9jYWxsJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQ2FsbChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2VzdGltYXRlR2FzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlRXN0aW1hdGVHYXMocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nYXNQcmljZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdhc1ByaWNlKCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2VuZFRyYW5zYWN0aW9uJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2VuZFRyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9zZW5kUmF3VHJhbnNhY3Rpb24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTZW5kUmF3VHJhbnNhY3Rpb24ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uQnlIYXNoJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25CeUhhc2gocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRMb2dzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0TG9ncyhwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldENvZGUnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRDb2RlKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmxvY2tCeUhhc2gnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCbG9ja0J5SGFzaChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAncGVyc29uYWxfc2lnbic6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlUGVyc29uYWxTaWduKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGEnOlxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92Myc6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2lnblR5cGVkRGF0YShwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKTtcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAxLCBtZXNzYWdlOiBgTWV0aG9kICR7bWV0aG9kfSBub3Qgc3VwcG9ydGVkYCB9IH07XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgaGFuZGxpbmcgcmVxdWVzdDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiBlcnJvci5jb2RlIHx8IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3JlcXVlc3RBY2NvdW50cyAtIFJlcXVlc3QgcGVybWlzc2lvbiB0byBjb25uZWN0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHRhYikge1xyXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgY29ubmVjdGVkXHJcbiAgaWYgKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGdldEF1dGhvcml6ZWRBY2NvdW50cyhvcmlnaW4pO1xyXG4gICAgaWYgKGFjY291bnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBhY2NvdW50cyB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcbiAgICBwZW5kaW5nQ29ubmVjdGlvbnMuc2V0KHJlcXVlc3RJZCwgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdGFiSWQ6IHRhYj8uaWQgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1jb25uZWN0Jm9yaWdpbj0ke2VuY29kZVVSSUNvbXBvbmVudChvcmlnaW4pfSZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nQ29ubmVjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nQ29ubmVjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ29ubmVjdGlvbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfYWNjb3VudHMgLSBHZXQgY29ubmVjdGVkIGFjY291bnRzXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFjY291bnRzKG9yaWdpbikge1xyXG4gIC8vIE9ubHkgcmV0dXJuIGFjY291bnRzIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgY29uc3QgYWNjb3VudHMgPSBhd2FpdCBnZXRBdXRob3JpemVkQWNjb3VudHMob3JpZ2luKTtcclxuICBpZiAoYWNjb3VudHMubGVuZ3RoID4gMCkge1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBhY2NvdW50cyB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBbXSB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2NoYWluSWQgLSBHZXQgY3VycmVudCBjaGFpbiBJRFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDaGFpbklkKCkge1xyXG4gIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBnZXRDdXJyZW50Q2hhaW5JZCgpO1xyXG4gIHJldHVybiB7IHJlc3VsdDogY2hhaW5JZCB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4gLSBTd2l0Y2ggdG8gYSBkaWZmZXJlbnQgbmV0d29ya1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0gfHwgIXBhcmFtc1swXS5jaGFpbklkKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHBhcmFtcycgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IFJlcXVpcmUgc2l0ZSBjb25uZWN0aW9uIGJlZm9yZSBhbGxvd2luZyBjaGFpbiBzd2l0Y2hcclxuICBpZiAob3JpZ2luICYmICEoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBzaXRlIG5vdCBjb25uZWN0ZWQuIENhbGwgZXRoX3JlcXVlc3RBY2NvdW50cyBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHJlcXVlc3RlZENoYWluSWQgPSBTdHJpbmcocGFyYW1zWzBdLmNoYWluSWQpLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgbmV0d29ya0tleSA9IENIQUlOX0lEX1RPX05FVFdPUktbcmVxdWVzdGVkQ2hhaW5JZF07XHJcblxyXG4gIGlmICghbmV0d29ya0tleSkge1xyXG4gICAgLy8gQ2hhaW4gbm90IHN1cHBvcnRlZCAtIHJldHVybiBlcnJvciBjb2RlIDQ5MDIgc28gZEFwcCBjYW4gY2FsbCB3YWxsZXRfYWRkRXRoZXJldW1DaGFpblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0OTAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdVbnJlY29nbml6ZWQgY2hhaW4gSUQuIFRyeSBhZGRpbmcgdGhlIGNoYWluIHVzaW5nIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluLidcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGN1cnJlbnROZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICBpZiAoY3VycmVudE5ldHdvcmsgPT09IG5ldHdvcmtLZXkpIHtcclxuICAgIHJldHVybiB7IHJlc3VsdDogbnVsbCB9O1xyXG4gIH1cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIGJlZm9yZSBzd2l0Y2hpbmcgbmV0d29ya3NcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuXHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICBwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBuZXR3b3JrS2V5LFxyXG4gICAgICBjaGFpbklkOiBDSEFJTl9JRFNbbmV0d29ya0tleV0sXHJcbiAgICAgIGFwcHJvdmFsVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249c3dpdGNoQ2hhaW4mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDUyMFxyXG4gICAgfSk7XHJcblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdDaGFpblN3aXRjaGVzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NoYWluIHN3aXRjaCByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXRfYWRkRXRoZXJldW1DaGFpbiAtIEFkZCBhIG5ldyBuZXR3b3JrIChzaW1wbGlmaWVkIHZlcnNpb24pXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFkZENoYWluKHBhcmFtcywgb3JpZ2luKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSB8fCAhcGFyYW1zWzBdLmNoYWluSWQpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogUmVxdWlyZSBzaXRlIGNvbm5lY3Rpb24gYmVmb3JlIGFsbG93aW5nIGNoYWluIGFkZC9zd2l0Y2hcclxuICBpZiAob3JpZ2luICYmICEoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBzaXRlIG5vdCBjb25uZWN0ZWQuIENhbGwgZXRoX3JlcXVlc3RBY2NvdW50cyBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNoYWluSW5mbyA9IHBhcmFtc1swXTtcclxuICBjb25zb2xlLmxvZygn8J+rgCBSZXF1ZXN0IHRvIGFkZCBjaGFpbjonLCBjaGFpbkluZm8pO1xyXG5cclxuICAvLyBGb3Igbm93LCBvbmx5IHN1cHBvcnQgb3VyIHByZWRlZmluZWQgY2hhaW5zIChoZXggY2hhaW4gSURzIGFyZVxyXG4gIC8vIGNhc2UtaW5zZW5zaXRpdmUgcGVyIEVJUC02OTUsIHNvIG5vcm1hbGl6ZSBiZWZvcmUgdGhlIGxvb2t1cClcclxuICBjb25zdCByZXF1ZXN0ZWRDaGFpbklkID0gU3RyaW5nKGNoYWluSW5mby5jaGFpbklkKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmIChDSEFJTl9JRF9UT19ORVRXT1JLW3JlcXVlc3RlZENoYWluSWRdKSB7XHJcbiAgICAvLyBDaGFpbiBpcyBhbHJlYWR5IHN1cHBvcnRlZCwganVzdCBzd2l0Y2ggdG8gaXRcclxuICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihbeyBjaGFpbklkOiByZXF1ZXN0ZWRDaGFpbklkIH1dLCBvcmlnaW4pO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3VzdG9tIGNoYWlucyBub3Qgc3VwcG9ydGVkIHlldFxyXG4gIHJldHVybiB7XHJcbiAgICBlcnJvcjoge1xyXG4gICAgICBjb2RlOiAtMzI2MDMsXHJcbiAgICAgIG1lc3NhZ2U6ICdBZGRpbmcgY3VzdG9tIGNoYWlucyBub3Qgc3VwcG9ydGVkIHlldC4gT25seSBQdWxzZUNoYWluIGFuZCBFdGhlcmV1bSBuZXR3b3JrcyBhcmUgc3VwcG9ydGVkLidcclxuICAgIH1cclxuICB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgY29ubmVjdGlvbiBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nQ29ubmVjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luIH0gPSBwZW5kaW5nQ29ubmVjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgcGVuZGluZ0Nvbm5lY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoYXBwcm92ZWQpIHtcclxuICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgaWYgKHdhbGxldCAmJiB3YWxsZXQuYWRkcmVzcykge1xyXG4gICAgICAvLyBTYXZlIGNvbm5lY3RlZCBzaXRlXHJcbiAgICAgIGF3YWl0IGFkZENvbm5lY3RlZFNpdGUob3JpZ2luLCBbd2FsbGV0LmFkZHJlc3NdKTtcclxuICAgICAgYXdhaXQgbm90aWZ5QWNjb3VudHNDaGFuZ2VkKCk7XHJcblxyXG4gICAgICAvLyBSZXNvbHZlIHRoZSBwZW5kaW5nIHByb21pc2VcclxuICAgICAgcmVzb2x2ZSh7IHJlc3VsdDogW3dhbGxldC5hZGRyZXNzXSB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ05vIGFjdGl2ZSB3YWxsZXQnKSk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIGFjdGl2ZSB3YWxsZXQnIH07XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHJlamVjdCh1c2VyUmVqZWN0aW9uKCdVc2VyIHJlamVjdGVkIGNvbm5lY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGNvbm5lY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRDb25uZWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiB9ID0gcGVuZGluZ0Nvbm5lY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgY2hhaW4gc3dpdGNoIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhaW5Td2l0Y2hBcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBuZXR3b3JrS2V5LCBjaGFpbklkLCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdDaGFpblN3aXRjaGVzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdDaGFpblN3aXRjaGVzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QodXNlclJlamVjdGlvbignVXNlciByZWplY3RlZCBjaGFpbiBzd2l0Y2gnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZSgnY3VycmVudE5ldHdvcmsnLCBuZXR3b3JrS2V5KTtcclxuICBub3RpZnlDaGFpbkNoYW5nZWQoY2hhaW5JZCk7XHJcbiAgcmVzb2x2ZSh7IHJlc3VsdDogbnVsbCB9KTtcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBjaGFpbklkLCBuZXR3b3JrTmFtZTogTkVUV09SS19OQU1FU1tuZXR3b3JrS2V5XSB9O1xyXG59XHJcblxyXG4vLyBHZXQgY2hhaW4gc3dpdGNoIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q2hhaW5Td2l0Y2hSZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmICghcGVuZGluZ0NoYWluU3dpdGNoZXMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBvcmlnaW4sIG5ldHdvcmtLZXksIGNoYWluSWQgfSA9IHBlbmRpbmdDaGFpblN3aXRjaGVzLmdldChyZXF1ZXN0SWQpO1xyXG4gIGNvbnN0IGN1cnJlbnROZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICBvcmlnaW4sXHJcbiAgICBjaGFpbklkLFxyXG4gICAgbmV0d29ya0tleSxcclxuICAgIG5ldHdvcmtOYW1lOiBORVRXT1JLX05BTUVTW25ldHdvcmtLZXldIHx8IG5ldHdvcmtLZXksXHJcbiAgICBjdXJyZW50TmV0d29ya05hbWU6IE5FVFdPUktfTkFNRVNbY3VycmVudE5ldHdvcmtdIHx8IGN1cnJlbnROZXR3b3JrXHJcbiAgfTtcclxufVxyXG5cclxuLy8gR2V0IGN1cnJlbnQgbmV0d29yayBrZXlcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudE5ldHdvcmsoKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgcmV0dXJuIG5ldHdvcmsgfHwgREVGQVVMVF9ORVRXT1JLO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2Jsb2NrTnVtYmVyIC0gR2V0IGN1cnJlbnQgYmxvY2sgbnVtYmVyXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJsb2NrTnVtYmVyKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gYXdhaXQgcnBjLmdldEJsb2NrTnVtYmVyKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9ja051bWJlciB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCbG9ja0J5TnVtYmVyIC0gR2V0IGJsb2NrIGJ5IG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgbnVtYmVyIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgaW5jbHVkZVRyYW5zYWN0aW9ucyA9IHBhcmFtc1sxXSB8fCBmYWxzZTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBycGMuZ2V0QmxvY2tCeU51bWJlcihuZXR3b3JrLCBibG9ja051bWJlciwgaW5jbHVkZVRyYW5zYWN0aW9ucyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgbnVtYmVyOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldEJhbGFuY2UgLSBHZXQgYmFsYW5jZSBmb3IgYW4gYWRkcmVzc1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBiYWxhbmNlID0gYXdhaXQgcnBjLmdldEJhbGFuY2UobmV0d29yaywgYWRkcmVzcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJhbGFuY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQ291bnQgLSBHZXQgdHJhbnNhY3Rpb24gY291bnQgKG5vbmNlKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBjb3VudCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb3VudCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGNvdW50OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dhc1ByaWNlIC0gR2V0IGN1cnJlbnQgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdhc1ByaWNlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXNQcmljZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9lc3RpbWF0ZUdhcyAtIEVzdGltYXRlIGdhcyBmb3IgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgZ2FzID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGdhcyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jYWxsIC0gRXhlY3V0ZSBhIHJlYWQtb25seSBjYWxsXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbGwocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJwYy5jYWxsKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXhlY3V0aW5nIGNhbGw6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFJhd1RyYW5zYWN0aW9uIC0gU2VuZCBhIHByZS1zaWduZWQgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBzaWduZWQgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogUmVxdWlyZSBzaXRlIGNvbm5lY3Rpb24gYmVmb3JlIGFsbG93aW5nIHJhdyB0cmFuc2FjdGlvbiBicm9hZGNhc3RcclxuICBpZiAob3JpZ2luICYmICEoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBzaXRlIG5vdCBjb25uZWN0ZWQuIENhbGwgZXRoX3JlcXVlc3RBY2NvdW50cyBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzaWduZWRUeCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgLy8gRmFuIG91dCB0byBBTEwgZW5kcG9pbnRzIOKAlCBhIHNpbmdsZSBibGFja2hvbGluZyBnYXRld2F5IG11c3Qgbm90IHN0cmFuZCB0aGUgdHguXHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcnBjLmJyb2FkY2FzdFRvQWxsUnBjcyhuZXR3b3JrLCBzaWduZWRUeCk7XHJcbiAgICBpZiAoIXJlc3VsdHMuc3VjY2Vzc2VzIHx8IHJlc3VsdHMuc3VjY2Vzc2VzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjb25zdCBkZXRhaWwgPSAocmVzdWx0cy5mYWlsdXJlcyB8fCBbXSkubWFwKChmKSA9PiBmLmVycm9yKS5qb2luKCcgfCAnKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBgQnJvYWRjYXN0IGZhaWxlZCBvbiBhbGwgUlBDIGVuZHBvaW50czogJHtkZXRhaWx9YCB9IH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHJlc3VsdHMudHhIYXNoIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgcmF3IHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCAtIEdldCB0cmFuc2FjdGlvbiByZWNlaXB0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgdHhIYXNoID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uUmVjZWlwdChuZXR3b3JrLCB0eEhhc2gpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiByZWNlaXB0IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gcmVjZWlwdDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvbkJ5SGFzaCAtIEdldCB0cmFuc2FjdGlvbiBieSBoYXNoXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoKG5ldHdvcmssIHR4SGFzaCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHR4IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gYnkgaGFzaDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0TG9ncyhwYXJhbXMpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGxvZ3MgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0TG9ncycsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGxvZ3MgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBsb2dzOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRDb2RlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgY29kZSA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRDb2RlJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogY29kZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGNvZGU6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEJsb2NrQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0QmxvY2tCeUhhc2gnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9jayB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIGJ5IGhhc2g6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFBlbmRpbmcgdHJhbnNhY3Rpb24gcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luIH0pXHJcbmNvbnN0IHBlbmRpbmdUcmFuc2FjdGlvbnMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyBQZW5kaW5nIHRva2VuIGFkZCByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRva2VuSW5mbyB9KVxyXG5jb25zdCBwZW5kaW5nVG9rZW5SZXF1ZXN0cyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vIFBlbmRpbmcgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSlcclxuY29uc3QgcGVuZGluZ1NpZ25SZXF1ZXN0cyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vID09PT09IFJBVEUgTElNSVRJTkcgPT09PT1cclxuLy8gUHJldmVudHMgbWFsaWNpb3VzIGRBcHBzIGZyb20gc3BhbW1pbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVxdWVzdHNcclxuY29uc3QgcmF0ZUxpbWl0TWFwID0gbmV3IE1hcCgpOyAvLyBvcmlnaW4gLT4geyBjb3VudCwgd2luZG93U3RhcnQsIHBlbmRpbmdDb3VudCB9XHJcblxyXG5jb25zdCBSQVRFX0xJTUlUX0NPTkZJRyA9IHtcclxuICBNQVhfUEVORElOR19SRVFVRVNUUzogNSwgLy8gTWF4IHBlbmRpbmcgcmVxdWVzdHMgcGVyIG9yaWdpblxyXG4gIE1BWF9SRVFVRVNUU19QRVJfV0lORE9XOiAyMCwgLy8gTWF4IHRvdGFsIHJlcXVlc3RzIHBlciB0aW1lIHdpbmRvd1xyXG4gIFRJTUVfV0lORE9XX01TOiA2MDAwMCAvLyAxIG1pbnV0ZSB3aW5kb3dcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYW4gb3JpZ2luIGhhcyBleGNlZWRlZCByYXRlIGxpbWl0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBjaGVja1xyXG4gKiBAcmV0dXJucyB7eyBhbGxvd2VkOiBib29sZWFuLCByZWFzb24/OiBzdHJpbmcgfX1cclxuICovXHJcbmZ1bmN0aW9uIGNoZWNrUmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgXHJcbiAgLy8gR2V0IG9yIGNyZWF0ZSByYXRlIGxpbWl0IGVudHJ5IGZvciB0aGlzIG9yaWdpblxyXG4gIGlmICghcmF0ZUxpbWl0TWFwLmhhcyhvcmlnaW4pKSB7XHJcbiAgICByYXRlTGltaXRNYXAuc2V0KG9yaWdpbiwge1xyXG4gICAgICBjb3VudDogMCxcclxuICAgICAgd2luZG93U3RhcnQ6IG5vdyxcclxuICAgICAgcGVuZGluZ0NvdW50OiAwXHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIFxyXG4gIC8vIFJlc2V0IHdpbmRvdyBpZiBleHBpcmVkXHJcbiAgaWYgKG5vdyAtIGxpbWl0RGF0YS53aW5kb3dTdGFydCA+IFJBVEVfTElNSVRfQ09ORklHLlRJTUVfV0lORE9XX01TKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQgPSAwO1xyXG4gICAgbGltaXREYXRhLndpbmRvd1N0YXJ0ID0gbm93O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayBwZW5kaW5nIHJlcXVlc3RzIGxpbWl0XHJcbiAgaWYgKGxpbWl0RGF0YS5wZW5kaW5nQ291bnQgPj0gUkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFMpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFsbG93ZWQ6IGZhbHNlLFxyXG4gICAgICByZWFzb246IGBUb28gbWFueSBwZW5kaW5nIHJlcXVlc3RzLiBNYXhpbXVtICR7UkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFN9IHBlbmRpbmcgcmVxdWVzdHMgYWxsb3dlZC5gXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayB0b3RhbCByZXF1ZXN0cyBpbiB3aW5kb3dcclxuICBpZiAobGltaXREYXRhLmNvdW50ID49IFJBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhbGxvd2VkOiBmYWxzZSxcclxuICAgICAgcmVhc29uOiBgUmF0ZSBsaW1pdCBleGNlZWRlZC4gTWF4aW11bSAke1JBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XfSByZXF1ZXN0cyBwZXIgbWludXRlLmBcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHJldHVybiB7IGFsbG93ZWQ6IHRydWUgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluY3JlbWVudHMgcmF0ZSBsaW1pdCBjb3VudGVycyBmb3IgYW4gb3JpZ2luXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGluY3JlbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gaW5jcmVtZW50UmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBpZiAobGltaXREYXRhKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQrKztcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQrKztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWNyZW1lbnRzIHBlbmRpbmcgY291bnRlciB3aGVuIHJlcXVlc3QgaXMgcmVzb2x2ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gZGVjcmVtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKSB7XHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIGlmIChsaW1pdERhdGEgJiYgbGltaXREYXRhLnBlbmRpbmdDb3VudCA+IDApIHtcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQtLTtcclxuICB9XHJcbn1cclxuXHJcbi8vIENsZWFuIHVwIG9sZCByYXRlIGxpbWl0IGVudHJpZXMgZXZlcnkgNSBtaW51dGVzXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW29yaWdpbiwgZGF0YV0gb2YgcmF0ZUxpbWl0TWFwLmVudHJpZXMoKSkge1xyXG4gICAgaWYgKG5vdyAtIGRhdGEud2luZG93U3RhcnQgPiBSQVRFX0xJTUlUX0NPTkZJRy5USU1FX1dJTkRPV19NUyAqIDUgJiYgZGF0YS5wZW5kaW5nQ291bnQgPT09IDApIHtcclxuICAgICAgcmF0ZUxpbWl0TWFwLmRlbGV0ZShvcmlnaW4pO1xyXG4gICAgfVxyXG4gIH1cclxufSwgMzAwMDAwKTtcclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIFJFUExBWSBQUk9URUNUSU9OID09PT09XHJcbi8vIFByZXZlbnRzIHRoZSBzYW1lIHRyYW5zYWN0aW9uIGFwcHJvdmFsIGZyb20gYmVpbmcgdXNlZCBtdWx0aXBsZSB0aW1lc1xyXG5jb25zdCBwcm9jZXNzZWRBcHByb3ZhbHMgPSBuZXcgTWFwKCk7IC8vIGFwcHJvdmFsVG9rZW4gLT4geyB0aW1lc3RhbXAsIHR4SGFzaCwgdXNlZDogdHJ1ZSB9XHJcblxyXG5jb25zdCBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcgPSB7XHJcbiAgQVBQUk9WQUxfVElNRU9VVDogMzAwMDAwLCAvLyA1IG1pbnV0ZXMgLSBhcHByb3ZhbCBleHBpcmVzIGFmdGVyIHRoaXNcclxuICBDTEVBTlVQX0lOVEVSVkFMOiA2MDAwMCAgIC8vIDEgbWludXRlIC0gY2xlYW4gdXAgb2xkIGFwcHJvdmFsc1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlblxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBVbmlxdWUgYXBwcm92YWwgdG9rZW5cclxuICovXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQXBwcm92YWxUb2tlbigpIHtcclxuICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KDMyKTtcclxuICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcclxuICByZXR1cm4gQXJyYXkuZnJvbShhcnJheSwgYnl0ZSA9PiBieXRlLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhbmQgbWFya3MgYW4gYXBwcm92YWwgdG9rZW4gYXMgdXNlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBwcm92YWxUb2tlbiAtIFRva2VuIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbGlkIGFuZCBub3QgeWV0IHVzZWRcclxuICovXHJcbmZ1bmN0aW9uIHZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSB7XHJcbiAgaWYgKCFhcHByb3ZhbFRva2VuKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgTm8gYXBwcm92YWwgdG9rZW4gcHJvdmlkZWQnKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGFwcHJvdmFsID0gcHJvY2Vzc2VkQXBwcm92YWxzLmdldChhcHByb3ZhbFRva2VuKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZhbCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIFVua25vd24gYXBwcm92YWwgdG9rZW4nKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIE1hcmsgYXMgdXNlZCBJTU1FRElBVEVMWSB0byBwcmV2ZW50IHJhY2UgY29uZGl0aW9ucy5cclxuICAvLyBBbnkgY29uY3VycmVudCBjYWxsIHdpbGwgc2VlIHVzZWQ9dHJ1ZSBhbmQgYmFpbCBvdXQuXHJcbiAgaWYgKGFwcHJvdmFsLnVzZWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBBcHByb3ZhbCB0b2tlbiBhbHJlYWR5IHVzZWQgLSBwcmV2ZW50aW5nIHJlcGxheSBhdHRhY2snKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgYXBwcm92YWwudXNlZCA9IHRydWU7XHJcbiAgYXBwcm92YWwudXNlZEF0ID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgYXBwcm92YWwgaGFzIGV4cGlyZWRcclxuICBjb25zdCBhZ2UgPSBEYXRlLm5vdygpIC0gYXBwcm92YWwudGltZXN0YW1wO1xyXG4gIGlmIChhZ2UgPiBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcuQVBQUk9WQUxfVElNRU9VVCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEFwcHJvdmFsIHRva2VuIGV4cGlyZWQnKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5kZWxldGUoYXBwcm92YWxUb2tlbik7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBjb25zb2xlLmxvZygn8J+rgCBBcHByb3ZhbCB0b2tlbiB2YWxpZGF0ZWQgYW5kIG1hcmtlZCBhcyB1c2VkJyk7XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vLyBDbGVhbiB1cCBvbGQgcHJvY2Vzc2VkIGFwcHJvdmFscyBldmVyeSBtaW51dGVcclxuc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgZm9yIChjb25zdCBbdG9rZW4sIGFwcHJvdmFsXSBvZiBwcm9jZXNzZWRBcHByb3ZhbHMuZW50cmllcygpKSB7XHJcbiAgICBjb25zdCBhZ2UgPSBub3cgLSBhcHByb3ZhbC50aW1lc3RhbXA7XHJcbiAgICBpZiAoYWdlID4gUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkFQUFJPVkFMX1RJTUVPVVQgKiAyKSB7XHJcbiAgICAgIHByb2Nlc3NlZEFwcHJvdmFscy5kZWxldGUodG9rZW4pO1xyXG4gICAgfVxyXG4gIH1cclxufSwgUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkNMRUFOVVBfSU5URVJWQUwpO1xyXG5cclxuLy8gTGFzdCBnYXMgcHJpY2UgYWN0dWFsbHkgb2JzZXJ2ZWQgcGVyIG5ldHdvcmssIHNvIHRoZSBzYW5pdHkgY2FwIGJlbG93IGNhbiBkZWdyYWRlXHJcbi8vIHRvIGEgcmVhbCBib3VuZCBpbnN0ZWFkIG9mIHN3aXRjaGluZyBvZmYgd2hlbmV2ZXIgdGhlIFJQQyBpcyBicmllZmx5IHVucmVhY2hhYmxlLlxyXG5jb25zdCBMQVNUX0dPT0RfR0FTX1BSSUNFX0tFWSA9ICdsYXN0X2dvb2RfZ2FzX3ByaWNlJztcclxuXHJcbi8qKlxyXG4gKiBSZXNvbHZlcyB0aGUgbWF4aW11bSBnYXMgcHJpY2UgYSBkQXBwIG1heSByZXF1ZXN0LCBpbiBHd2VpLlxyXG4gKlxyXG4gKiBTRUNVUklUWTogdGhpcyB1c2VkIHRvIGZhbGwgYmFjayB0byAxMCwwMDAsMDAwIEd3ZWkgKFwiZXNzZW50aWFsbHkgbm8gbGltaXRcIikgdGhlXHJcbiAqIG1vbWVudCB0aGUgUlBDIGNhbGwgZmFpbGVkLCB3aGljaCBzd2l0Y2hlZCB0aGUgY2hlY2sgb2ZmIGV4YWN0bHkgd2hlbiB0aGUgbmV0d29ya1xyXG4gKiB3YXMgZmxha3kuIEluc3RlYWQsIHJlbWVtYmVyIHRoZSBsYXN0IHByaWNlIHdlIGFjdHVhbGx5IHNhdyBvbiB0aGlzIG5ldHdvcmsgYW5kXHJcbiAqIGRlcml2ZSB0aGUgZmFsbGJhY2sgZnJvbSB0aGF0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV0d29yayAtIE5ldHdvcmsga2V5XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHttYXhHYXNQcmljZUd3ZWk6IG51bWJlcnxudWxsLCBzb3VyY2U6ICdsaXZlJ3wnY2FjaGVkJ3wndW5rbm93bid9Pn1cclxuICogICAgICAgICAgbWF4R2FzUHJpY2VHd2VpIGlzIG51bGwgb25seSB3aGVuIG5vIHByaWNlIGhhcyBldmVyIGJlZW4gb2JzZXJ2ZWQgZm9yIHRoZVxyXG4gKiAgICAgICAgICBuZXR3b3JrLCBtZWFuaW5nIHRoZXJlIGlzIG5vIGhvbmVzdCBiYXNpcyBmb3IgYSBib3VuZC5cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHJlc29sdmVNYXhHYXNQcmljZUd3ZWkobmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjdXJyZW50R2FzUHJpY2UgPSBhd2FpdCBycGMuZ2V0R2FzUHJpY2UobmV0d29yayk7XHJcbiAgICBjb25zdCBnd2VpID0gTnVtYmVyKEJpZ0ludChjdXJyZW50R2FzUHJpY2UpKSAvIDFlOTtcclxuXHJcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKGd3ZWkpICYmIGd3ZWkgPiAwKSB7XHJcbiAgICAgIGNvbnN0IGNhY2hlID0gKGF3YWl0IGxvYWQoTEFTVF9HT09EX0dBU19QUklDRV9LRVkpKSB8fCB7fTtcclxuICAgICAgY2FjaGVbbmV0d29ya10gPSB7IGd3ZWksIG9ic2VydmVkQXQ6IERhdGUubm93KCkgfTtcclxuICAgICAgYXdhaXQgc2F2ZShMQVNUX0dPT0RfR0FTX1BSSUNFX0tFWSwgY2FjaGUpO1xyXG5cclxuICAgICAgLy8gM3ggdGhlIGxpdmUgcHJpY2UgYWJzb3JicyBub3JtYWwgdm9sYXRpbGl0eTsgZmxvb3Igb2YgMTAwIEd3ZWkga2VlcHNcclxuICAgICAgLy8gdmVyeSBjaGVhcCBuZXR3b3JrcyBmcm9tIHByb2R1Y2luZyBhbiBhYnN1cmRseSB0aWdodCBjYXAuXHJcbiAgICAgIHJldHVybiB7IG1heEdhc1ByaWNlR3dlaTogTWF0aC5tYXgoTWF0aC5jZWlsKGd3ZWkgKiAzKSwgMTAwKSwgc291cmNlOiAnbGl2ZScgfTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEdhcyBwcmljZSBmZXRjaCBmYWlsZWQsIGZhbGxpbmcgYmFjayB0byBsYXN0IGtub3duIHByaWNlOicsIGVycm9yKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNhY2hlID0gKGF3YWl0IGxvYWQoTEFTVF9HT09EX0dBU19QUklDRV9LRVkpKSB8fCB7fTtcclxuICBjb25zdCBjYWNoZWQgPSBjYWNoZVtuZXR3b3JrXTtcclxuICBpZiAoY2FjaGVkICYmIE51bWJlci5pc0Zpbml0ZShjYWNoZWQuZ3dlaSkgJiYgY2FjaGVkLmd3ZWkgPiAwKSB7XHJcbiAgICAvLyBMb29zZXIgbXVsdGlwbGllciB0aGFuIHRoZSBsaXZlIHBhdGgsIHNpbmNlIGEgY2FjaGVkIHByaWNlIG1heSBiZSBzdGFsZSAtXHJcbiAgICAvLyBzdGlsbCBhIGZpbml0ZSBib3VuZCByYXRoZXIgdGhhbiBub25lIGF0IGFsbC5cclxuICAgIHJldHVybiB7IG1heEdhc1ByaWNlR3dlaTogTWF0aC5tYXgoTWF0aC5jZWlsKGNhY2hlZC5nd2VpICogNiksIDEwMCksIHNvdXJjZTogJ2NhY2hlZCcgfTtcclxuICB9XHJcblxyXG4gIC8vIE5vIGxpdmUgcHJpY2UgYW5kIG5vdGhpbmcgY2FjaGVkOiB3ZSBoYXZlIG5vIGJhc2lzIGZvciBhIG51bWVyaWMgYm91bmQsIGFuZFxyXG4gIC8vIGludmVudGluZyBvbmUgd291bGQganVzdCBiZSBhbiBhcmJpdHJhcnkgY29uc3RhbnQuIE5vdGUgdGhhdCBhIGRBcHAtc3VwcGxpZWRcclxuICAvLyBnYXNQcmljZSBpcyBkaXNjYXJkZWQgYmVmb3JlIHNpZ25pbmcgKHNlZSB0eFRvU2VuZCBiZWxvdykgLSB0aGUgZmVlIGFjdHVhbGx5XHJcbiAgLy8gdXNlZCBpcyBjb21wdXRlZCBieSB0aGUgd2FsbGV0IGZyb20gdGhlIG5ldHdvcmsgYmFzZSBmZWUgLSBzbyB0aGlzIGNoZWNrIGlzIGFcclxuICAvLyByZXF1ZXN0LXNhbml0eSBmaWx0ZXIsIG5vdCB0aGUgY29udHJvbCBvbiB3aGF0IHRoZSB1c2VyIGVuZHMgdXAgcGF5aW5nLlxyXG4gIHJldHVybiB7IG1heEdhc1ByaWNlR3dlaTogbnVsbCwgc291cmNlOiAndW5rbm93bicgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9zZW5kVHJhbnNhY3Rpb24gLSBTaWduIGFuZCBzZW5kIGEgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFRyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKCFhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ05vdCBhdXRob3JpemVkLiBQbGVhc2UgY29ubmVjdCB5b3VyIHdhbGxldCBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBDaGVjayByYXRlIGxpbWl0IHRvIHByZXZlbnQgc3BhbVxyXG4gIGNvbnN0IHJhdGVMaW1pdENoZWNrID0gY2hlY2tSYXRlTGltaXQob3JpZ2luKTtcclxuICBpZiAoIXJhdGVMaW1pdENoZWNrLmFsbG93ZWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBSYXRlIGxpbWl0IGV4Y2VlZGVkIGZvciBvcmlnaW46Jywgb3JpZ2luKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQyMDAsIG1lc3NhZ2U6IHNhbml0aXplRXJyb3JNZXNzYWdlKHJhdGVMaW1pdENoZWNrLnJlYXNvbikgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdHhSZXF1ZXN0ID0gcGFyYW1zWzBdO1xyXG5cclxuICAvLyBHZXQgY3VycmVudCBuZXR3b3JrIGZyb20gc3RvcmFnZVxyXG4gIGNvbnN0IGN1cnJlbnROZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKSB8fCBERUZBVUxUX05FVFdPUks7XHJcblxyXG4gIC8vIFNhbml0eS1ib3VuZCB0aGUgZ2FzIHByaWNlIHRoZSBkQXBwIGFza2VkIGZvciwgcmVsYXRpdmUgdG8gdGhlIGxpdmUgbmV0d29yayBwcmljZS5cclxuICBjb25zdCB7IG1heEdhc1ByaWNlR3dlaSwgc291cmNlOiBnYXNDYXBTb3VyY2UgfSA9IGF3YWl0IHJlc29sdmVNYXhHYXNQcmljZUd3ZWkoY3VycmVudE5ldHdvcmspO1xyXG4gIGlmIChnYXNDYXBTb3VyY2UgIT09ICdsaXZlJykge1xyXG4gICAgY29uc29sZS53YXJuKGDwn6uAIEdhcyBwcmljZSBjYXAgZGVyaXZlZCBmcm9tICR7Z2FzQ2FwU291cmNlfSBwcmljZSAoUlBDIHVuYXZhaWxhYmxlKWApO1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IENvbXByZWhlbnNpdmUgdHJhbnNhY3Rpb24gdmFsaWRhdGlvblxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCB0cmFuc2FjdGlvbiBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3JzKTtcclxuICAgIHJldHVybiB7IFxyXG4gICAgICBlcnJvcjogeyBcclxuICAgICAgICBjb2RlOiAtMzI2MDIsIFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHRyYW5zYWN0aW9uOiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcnMuam9pbignOyAnKSkgXHJcbiAgICAgIH0gXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVXNlIHNhbml0aXplZCB0cmFuc2FjdGlvbiBwYXJhbWV0ZXJzXHJcbiAgY29uc3Qgc2FuaXRpemVkVHggPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gSW5jcmVtZW50IHJhdGUgbGltaXQgY291bnRlclxyXG4gIGluY3JlbWVudFJhdGVMaW1pdChvcmlnaW4pO1xyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuXHJcbiAgICAvLyBTRUNVUklUWTogR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gU3RvcmUgc2FuaXRpemVkIHRyYW5zYWN0aW9uIGluc3RlYWQgb2Ygb3JpZ2luYWwgcmVxdWVzdFxyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5zZXQocmVxdWVzdElkLCB7IFxyXG4gICAgICByZXNvbHZlLCBcclxuICAgICAgcmVqZWN0LCBcclxuICAgICAgb3JpZ2luLCBcclxuICAgICAgdHhSZXF1ZXN0OiBzYW5pdGl6ZWRUeCxcclxuICAgICAgYXBwcm92YWxUb2tlbiAgLy8gSW5jbHVkZSB0b2tlbiBmb3IgdmFsaWRhdGlvblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj10cmFuc2FjdGlvbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdUcmFuc2FjdGlvbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB0cmFuc2FjdGlvbiBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2Vzc2lvblRva2VuLCBnYXNQcmljZSwgY3VzdG9tTm9uY2UsIHR4SGFzaCwgdHhEZXRhaWxzID0gbnVsbCkge1xyXG4gIGlmICghcGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHR4UmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1RyYW5zYWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIERlY3JlbWVudCBwZW5kaW5nIGNvdW50ZXIgKHJlcXVlc3QgY29tcGxldGVkKVxyXG4gIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QodXNlclJlamVjdGlvbignVXNlciByZWplY3RlZCB0cmFuc2FjdGlvbicpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gSWYgdHhIYXNoIGlzIHByb3ZpZGVkLCB0cmFuc2FjdGlvbiB3YXMgYWxyZWFkeSBzaWduZWQgYW5kIGJyb2FkY2FzdCBpbiB0aGUgcG9wdXBcclxuICAgIC8vIChieSBoYXJkd2FyZSB3YWxsZXQgT1Igc29mdHdhcmUgd2FsbGV0KS4gSnVzdCBzYXZlIHRvIGhpc3RvcnkgYW5kIHJlc29sdmUuXHJcbiAgICBpZiAodHhIYXNoKSB7XHJcbiAgICAgIGNvbnN0IHdhbGxldFR5cGUgPSB0eERldGFpbHMgPyAnc29mdHdhcmUnIDogJ2hhcmR3YXJlJztcclxuICAgICAgY29uc29sZS5sb2coYPCfq4AgJHt3YWxsZXRUeXBlfSB3YWxsZXQgdHJhbnNhY3Rpb24gYWxyZWFkeSBicm9hZGNhc3Q6YCwgdHhIYXNoKTtcclxuXHJcbiAgICAgIC8vIEdldCBhY3RpdmUgd2FsbGV0IGZvciBzYXZpbmcgdG8gaGlzdG9yeVxyXG4gICAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcblxyXG4gICAgICAvLyBTYXZlIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnkgKHVzZSB0eERldGFpbHMgaWYgcHJvdmlkZWQgZm9yIGFjY3VyYXRlIGRhdGEpXHJcbiAgICAgIGNvbnN0IGhpc3RvcnlFbnRyeSA9IHtcclxuICAgICAgICBoYXNoOiB0eEhhc2gsXHJcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgIGZyb206IGFjdGl2ZVdhbGxldC5hZGRyZXNzLFxyXG4gICAgICAgIHRvOiB0eERldGFpbHM/LnRvIHx8IHR4UmVxdWVzdC50byB8fCBudWxsLFxyXG4gICAgICAgIHZhbHVlOiB0eERldGFpbHM/LnZhbHVlIHx8IHR4UmVxdWVzdC52YWx1ZSB8fCAnMCcsXHJcbiAgICAgICAgZGF0YTogdHhEZXRhaWxzPy5kYXRhIHx8IHR4UmVxdWVzdC5kYXRhIHx8ICcweCcsXHJcbiAgICAgICAgZ2FzUHJpY2U6IHR4RGV0YWlscz8uZ2FzUHJpY2UgfHwgJzAnLFxyXG4gICAgICAgIGdhc0xpbWl0OiB0eERldGFpbHM/Lmdhc0xpbWl0IHx8IHR4UmVxdWVzdC5nYXNMaW1pdCB8fCB0eFJlcXVlc3QuZ2FzIHx8IG51bGwsXHJcbiAgICAgICAgbm9uY2U6IHR4RGV0YWlscz8ubm9uY2UgPz8gbnVsbCxcclxuICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICAgIHR5cGU6IHR4SGlzdG9yeS5UWF9UWVBFUy5DT05UUkFDVFxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gSW5jbHVkZSBFSVAtMTU1OSBmaWVsZHMgaWYgcHJvdmlkZWQgKG5lZWRlZCBmb3Igc3BlZWQtdXAvY2FuY2VsKVxyXG4gICAgICBpZiAodHhEZXRhaWxzPy5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICBoaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gdHhEZXRhaWxzLm1heEZlZVBlckdhcztcclxuICAgICAgfVxyXG4gICAgICBpZiAodHhEZXRhaWxzPy5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICAgIGhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IHR4RGV0YWlscy5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgICAgfVxyXG5cclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFjdGl2ZVdhbGxldC5hZGRyZXNzLCBoaXN0b3J5RW50cnkpO1xyXG5cclxuICAgICAgLy8gU2VuZCBkZXNrdG9wIG5vdGlmaWNhdGlvblxyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gc2VudDogJHt0eEhhc2guc2xpY2UoMCwgMjApfS4uLmAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBTdGFydCBtb25pdG9yaW5nIHRyYW5zYWN0aW9uIGZvciBjb25maXJtYXRpb25cclxuICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgIHdhaXRGb3JDb25maXJtYXRpb24oeyBoYXNoOiB0eEhhc2ggfSwgcHJvdmlkZXIsIGFjdGl2ZVdhbGxldC5hZGRyZXNzKTtcclxuXHJcbiAgICAgIC8vIExvZyBzdWNjZXNzZnVsIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICAgIHR5cGU6ICd0cmFuc2FjdGlvbicsXHJcbiAgICAgICAgYWRkcmVzczogYWN0aXZlV2FsbGV0LmFkZHJlc3MsXHJcbiAgICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgICAgbWV0aG9kOiAnZXRoX3NlbmRUcmFuc2FjdGlvbicsXHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICB0eEhhc2g6IHR4SGFzaCxcclxuICAgICAgICB3YWxsZXRUeXBlOiB3YWxsZXRUeXBlXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gUmVzb2x2ZSB3aXRoIHRyYW5zYWN0aW9uIGhhc2hcclxuICAgICAgcmVzb2x2ZSh7IHJlc3VsdDogdHhIYXNoIH0pO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2ggfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTb2Z0d2FyZSB3YWxsZXQgZmxvdyAtIHZhbGlkYXRlIHNlc3Npb24gYW5kIGdldCBwYXNzd29yZCAobm93IGFzeW5jKVxyXG4gICAgbGV0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcbiAgICBsZXQgc2lnbmVyID0gbnVsbDtcclxuICAgIGxldCBjb25uZWN0ZWRTaWduZXIgPSBudWxsO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IHdpdGggYXV0by11cGdyYWRlIG5vdGlmaWNhdGlvblxyXG4gICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIC8vIE5vdGlmeSB1c2VyIHRoYXQgd2FsbGV0IGVuY3J5cHRpb24gaXMgYmVpbmcgdXBncmFkZWRcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQgZW5jcnlwdGlvbjogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnNgKTtcclxuICAgICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgICAgdGl0bGU6ICfwn5SQIFNlY3VyaXR5IFVwZ3JhZGUgaW4gUHJvZ3Jlc3MnLFxyXG4gICAgICAgICAgbWVzc2FnZTogYFVwZ3JhZGluZyB3YWxsZXQgZW5jcnlwdGlvbiB0byAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnMgZm9yIGVuaGFuY2VkIHNlY3VyaXR5Li4uYCxcclxuICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcbiAgICBjb25zdCB7IHVwZ3JhZGVkLCBpdGVyYXRpb25zQmVmb3JlLCBpdGVyYXRpb25zQWZ0ZXIgfSA9IHVubG9ja1Jlc3VsdDtcclxuXHJcbiAgICAvLyBTaG93IGNvbXBsZXRpb24gbm90aWZpY2F0aW9uIGlmIHVwZ3JhZGUgb2NjdXJyZWRcclxuICAgIGlmICh1cGdyYWRlZCkge1xyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICfinIUgU2VjdXJpdHkgVXBncmFkZSBDb21wbGV0ZScsXHJcbiAgICAgICAgbWVzc2FnZTogYFdhbGxldCBlbmNyeXB0aW9uIHVwZ3JhZGVkOiAke2l0ZXJhdGlvbnNCZWZvcmUudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aXRlcmF0aW9uc0FmdGVyLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnNgLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBjdXJyZW50IG5ldHdvcmtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcblxyXG4gICAgLy8gQ29ubmVjdCBzaWduZXIgdG8gcHJvdmlkZXJcclxuICAgIGNvbm5lY3RlZFNpZ25lciA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRyYW5zYWN0aW9uIC0gY3JlYXRlIGEgY2xlYW4gY29weSB3aXRoIG9ubHkgbmVjZXNzYXJ5IGZpZWxkc1xyXG4gICAgY29uc3QgdHhUb1NlbmQgPSB7XHJcbiAgICAgIHRvOiB0eFJlcXVlc3QudG8sXHJcbiAgICAgIHZhbHVlOiB0eFJlcXVlc3QudmFsdWUgfHwgJzB4MCcsXHJcbiAgICAgIGRhdGE6IHR4UmVxdWVzdC5kYXRhIHx8ICcweCdcclxuICAgIH07XHJcblxyXG4gICAgLy8gTm9uY2UgaGFuZGxpbmcgcHJpb3JpdHk6XHJcbiAgICAvLyAxLiBVc2VyLXByb3ZpZGVkIGN1c3RvbSBub25jZSAoZm9yIHJlcGxhY2luZyBzdHVjayB0cmFuc2FjdGlvbnMpXHJcbiAgICAvLyAyLiBEQXBwLXByb3ZpZGVkIG5vbmNlICh2YWxpZGF0ZWQpXHJcbiAgICAvLyAzLiBBdXRvLWZldGNoIGJ5IGV0aGVycy5qc1xyXG4gICAgaWYgKGN1c3RvbU5vbmNlICE9PSB1bmRlZmluZWQgJiYgY3VzdG9tTm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgLy8gVXNlciBtYW51YWxseSBzZXQgbm9uY2UgKGUuZy4sIHRvIHJlcGxhY2Ugc3R1Y2sgdHJhbnNhY3Rpb24pXHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uQ291bnQoc2lnbmVyLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcblxyXG4gICAgICBpZiAoY3VzdG9tTm9uY2UgPCBjdXJyZW50Tm9uY2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEN1c3RvbSBub25jZSAke2N1c3RvbU5vbmNlfSBpcyBsZXNzIHRoYW4gY3VycmVudCBub25jZSAke2N1cnJlbnROb25jZX0uIFRoaXMgbWF5IGZhaWwgdW5sZXNzIHlvdSdyZSByZXBsYWNpbmcgYSBwZW5kaW5nIHRyYW5zYWN0aW9uLmApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eFRvU2VuZC5ub25jZSA9IGN1c3RvbU5vbmNlO1xyXG4gICAgICAvLyBVc2luZyBjdXN0b20gbm9uY2VcclxuICAgIH0gZWxzZSBpZiAodHhSZXF1ZXN0Lm5vbmNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lm5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIFNFQ1VSSVRZOiBWYWxpZGF0ZSBub25jZSBpZiBwcm92aWRlZCBieSBEQXBwXHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uQ291bnQoc2lnbmVyLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcbiAgICAgIGNvbnN0IHByb3ZpZGVkTm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJ1xyXG4gICAgICAgID8gcGFyc2VJbnQodHhSZXF1ZXN0Lm5vbmNlLCAxNilcclxuICAgICAgICA6IHR4UmVxdWVzdC5ub25jZTtcclxuXHJcbiAgICAgIC8vIE5vbmNlIG11c3QgYmUgPj0gY3VycmVudCBwZW5kaW5nIG5vbmNlXHJcbiAgICAgIGlmIChwcm92aWRlZE5vbmNlIDwgY3VycmVudE5vbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG5vbmNlOiAke3Byb3ZpZGVkTm9uY2V9IGlzIGxlc3MgdGhhbiBjdXJyZW50IG5vbmNlICR7Y3VycmVudE5vbmNlfWApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eFRvU2VuZC5ub25jZSA9IHByb3ZpZGVkTm9uY2U7XHJcbiAgICAgIC8vIFVzaW5nIERBcHAtcHJvdmlkZWQgbm9uY2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIG5vIG5vbmNlIHByb3ZpZGVkLCBldGhlcnMuanMgd2lsbCBmZXRjaCB0aGUgY29ycmVjdCBvbmUgYXV0b21hdGljYWxseVxyXG4gICAgICAvLyBBdXRvLWZldGNoaW5nIG5vbmNlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgREFwcCBwcm92aWRlZCBhIGdhcyBsaW1pdCwgdXNlIGl0LiBPdGhlcndpc2UgbGV0IGV0aGVycyBlc3RpbWF0ZS5cclxuICAgIGlmICh0eFJlcXVlc3QuZ2FzIHx8IHR4UmVxdWVzdC5nYXNMaW1pdCkge1xyXG4gICAgICB0eFRvU2VuZC5nYXNMaW1pdCA9IHR4UmVxdWVzdC5nYXMgfHwgdHhSZXF1ZXN0Lmdhc0xpbWl0O1xyXG4gICAgICAvLyBVc2luZyBwcm92aWRlZCBnYXMgbGltaXRcclxuICAgIH1cclxuXHJcbiAgICAvLyBFSVAtMTU1OSBmZWVzOiB1c2UgYSBnZW5lcm91cyBtYXhGZWVQZXJHYXMgY2FwIHNvIFB1bHNlQ2hhaW4ncyB2b2xhdGlsZSBiYXNlIGZlZVxyXG4gICAgLy8gY2Fubm90IHN0cmFuZCB0aGUgdHJhbnNhY3Rpb24gKG9ubHkgdGhlIGFjdHVhbCBiYXNlIGZlZSArIHRpcCBpcyBjaGFyZ2VkLCBzbyB0aGVcclxuICAgIC8vIGhpZ2ggY2FwIGNvc3RzIG5vdGhpbmcgZXh0cmEpLiBBbnkgVUktc2VsZWN0ZWQgYGdhc1ByaWNlYCBpcyBob25vcmVkIGFzIGEgZmxvb3IsXHJcbiAgICAvLyBhcyBpcyBhIGhpZ2hlciBjYXAgdGhlIGRBcHAgYXNrZWQgZm9yIOKAlCBhIGRBcHAgdGhhdCBkZWxpYmVyYXRlbHkgcmFpc2VzIGl0cyBmZWVzXHJcbiAgICAvLyBmb3IgYW4gdXJnZW50IHRyYW5zYWN0aW9uIHNob3VsZCBub3QgYmUgc2lsZW50bHkgY2FwcGVkIGJhY2sgZG93biB0byBvdXIgZXN0aW1hdGUuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBkYXBwTWF4RmVlID0gdHhSZXF1ZXN0Lm1heEZlZVBlckdhcyA/IEJpZ0ludCh0eFJlcXVlc3QubWF4RmVlUGVyR2FzKSA6IDBuO1xyXG4gICAgICBjb25zdCB1aUZsb29yID0gZ2FzUHJpY2UgPyBCaWdJbnQoZ2FzUHJpY2UpIDogMG47XHJcbiAgICAgIGNvbnN0IHByZWZlcnJlZCA9IGRhcHBNYXhGZWUgPiB1aUZsb29yID8gZGFwcE1heEZlZSA6IHVpRmxvb3I7XHJcblxyXG4gICAgICBjb25zdCBmZWVzID0gYXdhaXQgcnBjLmdldEVpcDE1NTlGZWVzKG5ldHdvcmssIHByZWZlcnJlZCA+IDBuID8gcHJlZmVycmVkIDogbnVsbCk7XHJcbiAgICAgIHR4VG9TZW5kLm1heEZlZVBlckdhcyA9IGZlZXMubWF4RmVlUGVyR2FzO1xyXG4gICAgICB0eFRvU2VuZC5tYXhQcmlvcml0eUZlZVBlckdhcyA9IGZlZXMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcblxyXG4gICAgICAvLyBIb25vciBhIGhpZ2hlciBkQXBwLXJlcXVlc3RlZCB0aXAgdG9vIChzdGlsbCBjbGFtcGVkIHRvIG1heEZlZVBlckdhcykuXHJcbiAgICAgIGNvbnN0IGRhcHBUaXAgPSB0eFJlcXVlc3QubWF4UHJpb3JpdHlGZWVQZXJHYXMgPyBCaWdJbnQodHhSZXF1ZXN0Lm1heFByaW9yaXR5RmVlUGVyR2FzKSA6IDBuO1xyXG4gICAgICBpZiAoZGFwcFRpcCA+IHR4VG9TZW5kLm1heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgdHhUb1NlbmQubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBkYXBwVGlwID4gdHhUb1NlbmQubWF4RmVlUGVyR2FzXHJcbiAgICAgICAgICA/IHR4VG9TZW5kLm1heEZlZVBlckdhc1xyXG4gICAgICAgICAgOiBkYXBwVGlwO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ0VJUC0xNTU5IGZlZSBjYWxjIGZhaWxlZCwgZmFsbGluZyBiYWNrIHRvIHByb3ZpZGVyIGZlZSBkYXRhOicsIGVycm9yKTtcclxuICAgICAgY29uc3QgZmQgPSBhd2FpdCBwcm92aWRlci5nZXRGZWVEYXRhKCk7XHJcbiAgICAgIGlmIChmZC5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICB0eFRvU2VuZC5tYXhGZWVQZXJHYXMgPSBmZC5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgdHhUb1NlbmQubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBmZC5tYXhQcmlvcml0eUZlZVBlckdhcyA/PyAoZmQubWF4RmVlUGVyR2FzIC8gMTBuKTtcclxuICAgICAgfSBlbHNlIGlmIChmZC5nYXNQcmljZSkge1xyXG4gICAgICAgIHR4VG9TZW5kLmdhc1ByaWNlID0gZmQuZ2FzUHJpY2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTaWduIGxvY2FsbHkgYW5kIGJyb2FkY2FzdCB0byBFVkVSWSBoZWFsdGh5IGVuZHBvaW50IHJhdGhlciB0aGFuIHRydXN0aW5nIG9uZS5cclxuICAgIC8vIEEgc2luZ2xlIGVuZHBvaW50IGNhbiBhY2NlcHQgYSB0cmFuc2FjdGlvbiBhbmQgdGhlbiBmYWlsIHRvIGdvc3NpcCBpdDogdGhlIGhhc2ggaXNcclxuICAgIC8vIHZhbGlkLCB0aGUgbm9uY2Ugc3RheXMgZnJlZSwgYW5kIHRoZSB0cmFuc2FjdGlvbiBzaWxlbnRseSBhZ2VzIG91dCBvZiB0aGUgbWVtcG9vbFxyXG4gICAgLy8gd2hpbGUgdGhlIFVJIHdhaXRzIGZvcmV2ZXIgb24gYSBjb25maXJtYXRpb24gdGhhdCBjYW4gbmV2ZXIgY29tZS5cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgcnBjLnNlbmRUcmFuc2FjdGlvblJlc2lsaWVudChjb25uZWN0ZWRTaWduZXIsIG5ldHdvcmssIHR4VG9TZW5kKTtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFRyYW5zYWN0aW9uICR7dHguaGFzaH0gYnJvYWRjYXN0IHRvICR7dHguYWNjZXB0ZWQubGVuZ3RofSBlbmRwb2ludChzKWApO1xyXG5cclxuICAgIC8vIFRyYW5zYWN0aW9uIHNlbnRcclxuXHJcbiAgICAvLyBTYXZlIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnkgKG5ldHdvcmsgdmFyaWFibGUgYWxyZWFkeSBkZWZpbmVkIGFib3ZlKVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KHNpZ25lci5hZGRyZXNzLCB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogc2lnbmVyLmFkZHJlc3MsXHJcbiAgICAgIHRvOiB0eFJlcXVlc3QudG8gfHwgbnVsbCxcclxuICAgICAgdmFsdWU6IHR4UmVxdWVzdC52YWx1ZSB8fCAnMCcsXHJcbiAgICAgIGRhdGE6IHR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IHR4Lmdhc1ByaWNlID8gdHguZ2FzUHJpY2UudG9TdHJpbmcoKSA6ICh0eC5tYXhGZWVQZXJHYXMgPyB0eC5tYXhGZWVQZXJHYXMudG9TdHJpbmcoKSA6ICcwJyksXHJcbiAgICAgIG1heEZlZVBlckdhczogdHgubWF4RmVlUGVyR2FzID8gdHgubWF4RmVlUGVyR2FzLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQsXHJcbiAgICAgIG1heFByaW9yaXR5RmVlUGVyR2FzOiB0eC5tYXhQcmlvcml0eUZlZVBlckdhcyA/IHR4Lm1heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQsXHJcbiAgICAgIGdhc0xpbWl0OiB0eC5nYXNMaW1pdCA/IHR4Lmdhc0xpbWl0LnRvU3RyaW5nKCkgOiBudWxsLFxyXG4gICAgICBub25jZTogdHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogdHhIaXN0b3J5LlRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZW5kIGRlc2t0b3Agbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIHNlbnQ6ICR7dHguaGFzaC5zbGljZSgwLCAyMCl9Li4uYCxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvbiBpbiBiYWNrZ3JvdW5kXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgc2lnbmVyLmFkZHJlc3MpO1xyXG5cclxuICAgIC8vIExvZyBzdWNjZXNzZnVsIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogJ3RyYW5zYWN0aW9uJyxcclxuICAgICAgYWRkcmVzczogc2lnbmVyLmFkZHJlc3MsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6ICdldGhfc2VuZFRyYW5zYWN0aW9uJyxcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgdHhIYXNoOiB0eC5oYXNoLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZXNvbHZlIHdpdGggdHJhbnNhY3Rpb24gaGFzaFxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogdHguaGFzaCB9KTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2ggfTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIC8vIFNFQ1VSSVRZOiBDbGVhbiB1cCBzZW5zaXRpdmUgZGF0YSBmcm9tIG1lbW9yeVxyXG4gICAgICAvLyBPdmVyd3JpdGUgcGFzc3dvcmQgd2l0aCBnYXJiYWdlIGJlZm9yZSBkZXJlZmVyZW5jaW5nXHJcbiAgICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICAgIGNvbnN0IHRlbXBPYmogPSB7IHBhc3N3b3JkIH07XHJcbiAgICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2xlYW4gdXAgc2lnbmVyJ3MgcHJpdmF0ZSBrZXlcclxuICAgICAgaWYgKHNpZ25lcikge1xyXG4gICAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjb25uZWN0ZWRTaWduZXIpIHtcclxuICAgICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKGNvbm5lY3RlZFNpZ25lcik7XHJcbiAgICAgICAgY29ubmVjdGVkU2lnbmVyID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRyYW5zYWN0aW9uIGVycm9yOicsIGVycm9yKTtcclxuICAgIGNvbnN0IHNhbml0aXplZEVycm9yID0gc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSk7XHJcblxyXG4gICAgLy8gTG9nIGZhaWxlZCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6ICd0cmFuc2FjdGlvbicsXHJcbiAgICAgIGFkZHJlc3M6ICd1bmtub3duJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogJ2V0aF9zZW5kVHJhbnNhY3Rpb24nLFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgZXJyb3I6IHNhbml0aXplZEVycm9yLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICByZWplY3QobmV3IEVycm9yKHNhbml0aXplZEVycm9yKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplZEVycm9yIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgdHJhbnNhY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRUcmFuc2FjdGlvblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdUcmFuc2FjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0eFJlcXVlc3QgfSA9IHBlbmRpbmdUcmFuc2FjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBvcmlnaW4sIHR4UmVxdWVzdCB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF93YXRjaEFzc2V0IC0gQWRkIGN1c3RvbSB0b2tlbiAoRUlQLTc0NylcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlV2F0Y2hBc3NldChwYXJhbXMsIG9yaWdpbiwgdGFiKSB7XHJcbiAgLy8gUmVjZWl2ZWQgd2FsbGV0X3dhdGNoQXNzZXQgcmVxdWVzdFxyXG5cclxuICAvLyBWYWxpZGF0ZSBwYXJhbXMgc3RydWN0dXJlXHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtcy50eXBlIHx8ICFwYXJhbXMub3B0aW9ucykge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXM6IG11c3QgaW5jbHVkZSB0eXBlIGFuZCBvcHRpb25zJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHR5cGUsIG9wdGlvbnMgfSA9IHBhcmFtcztcclxuXHJcbiAgLy8gT25seSBzdXBwb3J0IEVSQzIwL1BSQzIwIHRva2Vuc1xyXG4gIGlmICh0eXBlLnRvVXBwZXJDYXNlKCkgIT09ICdFUkMyMCcpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ09ubHkgRVJDMjAvUFJDMjAgdG9rZW5zIGFyZSBzdXBwb3J0ZWQnIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHJlcXVpcmVkIHRva2VuIGZpZWxkc1xyXG4gIGlmICghb3B0aW9ucy5hZGRyZXNzIHx8ICFvcHRpb25zLnN5bWJvbCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnVG9rZW4gbXVzdCBoYXZlIGFkZHJlc3MgYW5kIHN5bWJvbCcgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IGV2ZXJ5IGZpZWxkIGhlcmUgaXMgZEFwcC1jb250cm9sbGVkIGFuZCBnZXRzIHNob3duIG9uIGFuIGFwcHJvdmFsXHJcbiAgLy8gc2NyZWVuLCBzbyB2YWxpZGF0ZS9ib3VuZCBhbGwgb2YgaXQuIEFuIHVuYm91bmRlZCBzeW1ib2wgY2FuIHB1c2ggdGhlIHJlYWxcclxuICAvLyBvcmlnaW4gYW5kIGFkZHJlc3Mgb3V0IG9mIHZpZXc7IGFuIGFyYml0cmFyeSBpbWFnZSBVUkwgYm90aCBiZWFjb25zIHRoZSB1c2VyJ3NcclxuICAvLyBJUCBhbmQgbGV0cyBhIHNjYW0gdG9rZW4gd2VhciBhIGxlZ2l0aW1hdGUgdG9rZW4ncyBsb2dvLlxyXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5hZGRyZXNzICE9PSAnc3RyaW5nJyB8fCAhZXRoZXJzLmlzQWRkcmVzcyhvcHRpb25zLmFkZHJlc3MpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdUb2tlbiBhZGRyZXNzIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnIH0gfTtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5zeW1ib2wgIT09ICdzdHJpbmcnKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdUb2tlbiBzeW1ib2wgbXVzdCBiZSBhIHN0cmluZycgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc3ltYm9sID0gb3B0aW9ucy5zeW1ib2xcclxuICAgIC5yZXBsYWNlKC9bXFx1MDAwMC1cXHUwMDFGXFx1MDA3Ri1cXHUwMDlGXS9nLCAnJylcclxuICAgIC5yZXBsYWNlKC9bXFx1MjAwQi1cXHUyMDBGXFx1MjAyQS1cXHUyMDJFXFx1MjA2MC1cXHUyMDY0XFx1MjA2Ni1cXHUyMDY5XFx1RkVGRl0vZywgJycpXHJcbiAgICAudHJpbSgpXHJcbiAgICAuc2xpY2UoMCwgMTYpO1xyXG4gIGlmICghc3ltYm9sKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdUb2tlbiBzeW1ib2wgaXMgZW1wdHkgb3IgaW52YWxpZCcgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGVjaW1hbHMgPSBOdW1iZXIob3B0aW9ucy5kZWNpbWFscyA/PyAxOCk7XHJcbiAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGRlY2ltYWxzKSB8fCBkZWNpbWFscyA8IDAgfHwgZGVjaW1hbHMgPiAzNikge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnVG9rZW4gZGVjaW1hbHMgb3V0IG9mIHJhbmdlJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBPbmx5IGFsbG93IGh0dHBzIGltYWdlIFVSTHMsIGFuZCBjYXAgdGhlIGxlbmd0aC4gQW55dGhpbmcgZWxzZSBpcyBkcm9wcGVkXHJcbiAgLy8gcmF0aGVyIHRoYW4gcmVqZWN0ZWQsIHNvIGEgYmFkIGltYWdlIGRvZXMgbm90IGJsb2NrIGFuIG90aGVyd2lzZSB2YWxpZCByZXF1ZXN0LlxyXG4gIGxldCBpbWFnZSA9IG51bGw7XHJcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmltYWdlID09PSAnc3RyaW5nJyAmJiBvcHRpb25zLmltYWdlLmxlbmd0aCA8PSAyMDQ4KSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAobmV3IFVSTChvcHRpb25zLmltYWdlKS5wcm90b2NvbCA9PT0gJ2h0dHBzOicpIHtcclxuICAgICAgICBpbWFnZSA9IG9wdGlvbnMuaW1hZ2U7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvLyBOb3QgYSBwYXJzZWFibGUgVVJMIC0gZHJvcCBpdFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgdG9rZW5JbmZvID0ge1xyXG4gICAgYWRkcmVzczogb3B0aW9ucy5hZGRyZXNzLnRvTG93ZXJDYXNlKCksXHJcbiAgICBzeW1ib2wsXHJcbiAgICBkZWNpbWFscyxcclxuICAgIGltYWdlXHJcbiAgfTtcclxuXHJcbiAgLy8gUmVxdWVzdGluZyB0byBhZGQgdG9rZW5cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcbiAgICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0b2tlbkluZm8gfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1hZGRUb2tlbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNTAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdUb2tlblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1Rva2VuIGFkZCByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB0b2tlbiBhZGQgYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQpIHtcclxuICBpZiAoIXBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIHRva2VuSW5mbyB9ID0gcGVuZGluZ1Rva2VuUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdCh1c2VyUmVqZWN0aW9uKCdVc2VyIHJlamVjdGVkIHRva2VuJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBUb2tlbiBhcHByb3ZlZCAtIHJldHVybiB0cnVlICh3YWxsZXRfd2F0Y2hBc3NldCByZXR1cm5zIGJvb2xlYW4pXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiB0cnVlIH0pO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdG9rZW5JbmZvIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVG9rZW4gYWRkIGVycm9yOicsIGVycm9yKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgdG9rZW4gYWRkIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0VG9rZW5BZGRSZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmIChwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4sIHRva2VuSW5mbyB9ID0gcGVuZGluZ1Rva2VuUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBvcmlnaW4sIHRva2VuSW5mbyB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gU3BlZWQgdXAgYSBwZW5kaW5nIHRyYW5zYWN0aW9uIGJ5IHJlcGxhY2luZyBpdCB3aXRoIGhpZ2hlciBnYXMgcHJpY2VcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCBzZXNzaW9uVG9rZW4sIGdhc1ByaWNlTXVsdGlwbGllciA9IDEuMiwgY3VzdG9tR2FzUHJpY2UgPSBudWxsKSB7XHJcbiAgbGV0IHBhc3N3b3JkID0gbnVsbDtcclxuICBsZXQgc2lnbmVyID0gbnVsbDtcclxuICBsZXQgd2FsbGV0ID0gbnVsbDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2sgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB1bmxvY2tSZXN1bHQgPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG5cclxuICAgIC8vIFNFQ1VSSVRZOiBWZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGJlbG9uZ3MgdG8gdGhpcyB3YWxsZXRcclxuICAgIGNvbnN0IHdhbGxldEFkZHJlc3MgPSBhd2FpdCBzaWduZXIuZ2V0QWRkcmVzcygpO1xyXG4gICAgaWYgKHdhbGxldEFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgQWRkcmVzcyBtaXNtYXRjaCBpbiBzcGVlZC11cDogd2FsbGV0IGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggcmVxdWVzdCcpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdXYWxsZXQgYWRkcmVzcyBtaXNtYXRjaCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgb3JpZ2luYWwgdHJhbnNhY3Rpb24gaXMgZnJvbSB0aGlzIHdhbGxldFxyXG4gICAgaWYgKG9yaWdpbmFsVHguZnJvbSAmJiBvcmlnaW5hbFR4LmZyb20udG9Mb3dlckNhc2UoKSAhPT0gd2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVHJhbnNhY3Rpb24gb3duZXJzaGlwIGNoZWNrIGZhaWxlZDogdHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIHdhbGxldCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgbmV0d29yayBhbmQgY3JlYXRlIHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyXHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3JpZ2luYWxUeC5uZXR3b3JrO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICB3YWxsZXQgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIGFjdHVhbCB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW4gdG8gY2hlY2sgaXRzIHR5cGVcclxuICAgIC8vIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2Ugb2xkZXIgdHJhbnNhY3Rpb25zIGluIGhpc3RvcnkgbWF5IG5vdCBoYXZlIEVJUC0xNTU5IGZpZWxkcyBzdG9yZWRcclxuICAgIGxldCBpc0VJUDE1NTkgPSBvcmlnaW5hbFR4Lm1heEZlZVBlckdhcyB8fCBvcmlnaW5hbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhGZWVQZXJHYXMgPSBudWxsO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyA9IG51bGw7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgb25DaGFpblR4ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb24ob3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgICBpZiAob25DaGFpblR4KSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBFSVAtMTU1OSAodHlwZSAyKVxyXG4gICAgICAgIGlmIChvbkNoYWluVHgudHlwZSA9PT0gMiB8fCBvbkNoYWluVHgubWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICBpc0VJUDE1NTkgPSB0cnVlO1xyXG4gICAgICAgICAgb25DaGFpbk1heEZlZVBlckdhcyA9IG9uQ2hhaW5UeC5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBvbkNoYWluVHgubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBEZXRlY3RlZCBFSVAtMTU1OSB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW46Jywge1xyXG4gICAgICAgICAgICBtYXhGZWVQZXJHYXM6IG9uQ2hhaW5NYXhGZWVQZXJHYXM/LnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIG1heFByaW9yaXR5RmVlUGVyR2FzOiBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXM/LnRvU3RyaW5nKClcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZmV0Y2hFcnIpIHtcclxuICAgICAgY29uc29sZS53YXJuKCfwn6uAIENvdWxkIG5vdCBmZXRjaCBvcmlnaW5hbCB0eCBmcm9tIGJsb2NrY2hhaW46JywgZmV0Y2hFcnIubWVzc2FnZSk7XHJcbiAgICAgIC8vIENvbnRpbnVlIHdpdGggd2hhdCB3ZSBoYXZlIGZyb20gaGlzdG9yeVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSByZXBsYWNlbWVudCB0cmFuc2FjdGlvbiB3aXRoIHNhbWUgbm9uY2UsIGRhdGEsIGFuZCBnYXNMaW1pdFxyXG4gICAgY29uc3QgcmVwbGFjZW1lbnRUeCA9IHtcclxuICAgICAgdG86IG9yaWdpbmFsVHgudG8sXHJcbiAgICAgIHZhbHVlOiBvcmlnaW5hbFR4LnZhbHVlLFxyXG4gICAgICBkYXRhOiBvcmlnaW5hbFR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5jbHVkZSBnYXNMaW1pdCBpZiBpdCB3YXMgaW4gdGhlIG9yaWdpbmFsIHRyYW5zYWN0aW9uXHJcbiAgICBpZiAob3JpZ2luYWxUeC5nYXNMaW1pdCkge1xyXG4gICAgICByZXBsYWNlbWVudFR4Lmdhc0xpbWl0ID0gb3JpZ2luYWxUeC5nYXNMaW1pdDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3Igc3RvcmluZyBpbiBoaXN0b3J5XHJcbiAgICBsZXQgbmV3R2FzUHJpY2UgPSBudWxsO1xyXG4gICAgbGV0IG5ld01heEZlZVBlckdhcyA9IG51bGw7XHJcbiAgICBsZXQgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBudWxsO1xyXG5cclxuICAgIGlmIChpc0VJUDE1NTkpIHtcclxuICAgICAgLy8gRUlQLTE1NTk6IE11c3QgYnVtcCBCT1RIIG1heEZlZVBlckdhcyBhbmQgbWF4UHJpb3JpdHlGZWVQZXJHYXMgYnkgYXQgbGVhc3QgMTAlXHJcbiAgICAgIC8vIFVzaW5nIDEyLjUlIGJ1bXAgdG8gZW5zdXJlIGFjY2VwdGFuY2UgKHNhbWUgYXMgRXRoZXJldW0gZGVmYXVsdClcclxuICAgICAgY29uc3QgYnVtcE11bHRpcGxpZXIgPSAxMTI1bjsgLy8gMTEyLjUlID0gMS4xMjV4XHJcbiAgICAgIGNvbnN0IGJ1bXBEaXZpc29yID0gMTAwMG47XHJcblxyXG4gICAgICAvLyBVc2Ugb24tY2hhaW4gdmFsdWVzIGlmIGF2YWlsYWJsZSAobW9yZSBhY2N1cmF0ZSksIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gaGlzdG9yeVxyXG4gICAgICBjb25zdCBvcmlnaW5hbE1heEZlZSA9IG9uQ2hhaW5NYXhGZWVQZXJHYXMgfHwgQmlnSW50KG9yaWdpbmFsVHgubWF4RmVlUGVyR2FzIHx8IG9yaWdpbmFsVHguZ2FzUHJpY2UgfHwgJzAnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxQcmlvcml0eUZlZSA9IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyB8fCBCaWdJbnQob3JpZ2luYWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcyB8fCAnMCcpO1xyXG5cclxuICAgICAgLy8gRmVlIGZsb29ycyBtdXN0IGJlIHJlbGF0aXZlIHRvIHRoZSBMSVZFIGJhc2UgZmVlLCBub3QgYWJzb2x1dGUuIEEgaGFyZGNvZGVkIDEgR3dlaVxyXG4gICAgICAvLyB0aXAgaXMgbWVhbmluZ2xlc3Mgb24gUHVsc2VDaGFpbiwgd2hlcmUgdGhlIGJhc2UgZmVlIHJ1bnMgfjEsMDAwLDAwMCBHd2VpIOKAlCBhbmQgaWZcclxuICAgICAgLy8gdGhlIGJhc2UgZmVlIGhhcyBjbGltYmVkIHNpbmNlIHRoZSBvcmlnaW5hbCB3YXMgc2lnbmVkLCBhIDEyLjUlIGJ1bXAgb24gYSBub3ctc3RhbGVcclxuICAgICAgLy8gY2FwIGNhbiBzdGlsbCBiZSB1bm1pbmFibGUuIEJvdGggZmxvb3JzIGJlbG93IGFyZSBkZXJpdmVkIGZyb20gdGhlIGN1cnJlbnQgYmFzZSBmZWUuXHJcbiAgICAgIGxldCBjdXJyZW50QmFzZUZlZSA9IDBuO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGN1cnJlbnRCYXNlRmVlID0gQmlnSW50KGF3YWl0IHJwYy5nZXRCYXNlRmVlKG5ldHdvcmspKTtcclxuICAgICAgfSBjYXRjaCAoZmVlRXJyKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCfwn6uAIENvdWxkIG5vdCByZWFkIGxpdmUgYmFzZSBmZWUgZm9yIHNwZWVkLXVwLCB1c2luZyBidW1wIG9ubHk6JywgZmVlRXJyLm1lc3NhZ2UpO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHRpcEZsb29yID0gY3VycmVudEJhc2VGZWUgLyAyMG47ICAgICAgICAgIC8vIDUlIG9mIGJhc2UgZmVlXHJcbiAgICAgIGNvbnN0IGNhcEZsb29yID0gY3VycmVudEJhc2VGZWUgKiA0biArIHRpcEZsb29yOyAvLyBzYW1lIGdlbmVyb3VzIGNhcCBhcyBhIGZyZXNoIHNlbmRcclxuXHJcbiAgICAgIGlmIChjdXN0b21HYXNQcmljZSkge1xyXG4gICAgICAgIC8vIEN1c3RvbSBnYXMgcHJpY2U6IHVzZSBpdCBmb3IgbWF4RmVlUGVyR2FzLCBidXQgbmV2ZXIgQkVMT1cgdGhlIHJlcGxhY2VtZW50XHJcbiAgICAgICAgLy8gdGhyZXNob2xkIOKAlCBhIG5vZGUgc3RpbGwgaG9sZGluZyB0aGUgb3JpZ2luYWwgcmVqZWN0cyBhbiB1bmRlci1wcmljZWRcclxuICAgICAgICAvLyByZXBsYWNlbWVudCBvdXRyaWdodCAoXCJyZXBsYWNlbWVudCB0cmFuc2FjdGlvbiB1bmRlcnByaWNlZFwiKSwgc28gYSBzcGVlZC11cFxyXG4gICAgICAgIC8vIHRoYXQgbG93ZXJzIHRoZSBjYXAgc2lsZW50bHkgZmFpbHMgdG8gcmVwbGFjZSBhbnl0aGluZy5cclxuICAgICAgICBjb25zdCBjdXN0b21GZWUgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgICAgIGNvbnN0IG1pblJlcGxhY2VtZW50RmVlID0gKG9yaWdpbmFsTWF4RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgbmV3TWF4RmVlUGVyR2FzID0gY3VzdG9tRmVlID4gbWluUmVwbGFjZW1lbnRGZWUgPyBjdXN0b21GZWUgOiBtaW5SZXBsYWNlbWVudEZlZTtcclxuXHJcbiAgICAgICAgLy8gUHJpb3JpdHkgZmVlOiBhdCBsZWFzdCAxMi41JSBvdmVyIHRoZSBvcmlnaW5hbCwgbmV2ZXIgYmVsb3cgdGhlIGxpdmUgZmxvb3IuXHJcbiAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IE5PVCBjbGFtcGVkIHVwIHRvIHRoZSBjYXAg4oCUIHRpcCA9PSBjYXAgbWVhbnMgcGF5aW5nIHRoZSBmdWxsIGNhcFxyXG4gICAgICAgIC8vIG9uIGV2ZXJ5IGJsb2NrLCBhbmQgaXQgaXMgc2VsZi1wZXJwZXR1YXRpbmcgYWNyb3NzIHN1Y2Nlc3NpdmUgc3BlZWQtdXBzLlxyXG4gICAgICAgIGNvbnN0IGJ1bXBlZCA9IChvcmlnaW5hbFByaW9yaXR5RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBidW1wZWQgPiB0aXBGbG9vciA/IGJ1bXBlZCA6IHRpcEZsb29yO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBidW1wZWQgZmVlcyAoMTIuNSUgaGlnaGVyKSwgdGhlbiByYWlzZSB0byB0aGUgbGl2ZS1iYXNlLWZlZSBmbG9vcnNcclxuICAgICAgICBuZXdNYXhGZWVQZXJHYXMgPSAob3JpZ2luYWxNYXhGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IChvcmlnaW5hbFByaW9yaXR5RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcblxyXG4gICAgICAgIGlmIChuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA8IHRpcEZsb29yKSBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IHRpcEZsb29yO1xyXG4gICAgICAgIGlmIChuZXdNYXhGZWVQZXJHYXMgPCBjYXBGbG9vcikgbmV3TWF4RmVlUGVyR2FzID0gY2FwRmxvb3I7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEludmFyaWFudDogdGhlIHRpcCBjYW4gbmV2ZXIgZXhjZWVkIHRoZSBjYXAuXHJcbiAgICAgIGlmIChuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA+IG5ld01heEZlZVBlckdhcykge1xyXG4gICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gbmV3TWF4RmVlUGVyR2FzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXBsYWNlbWVudFR4Lm1heEZlZVBlckdhcyA9IG5ld01heEZlZVBlckdhcztcclxuICAgICAgcmVwbGFjZW1lbnRUeC5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG5ld01heFByaW9yaXR5RmVlUGVyR2FzO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coJ/Cfq4AgRUlQLTE1NTkgc3BlZWQtdXA6Jywge1xyXG4gICAgICAgIG9yaWdpbmFsTWF4RmVlOiBvcmlnaW5hbE1heEZlZS50b1N0cmluZygpLFxyXG4gICAgICAgIG9yaWdpbmFsUHJpb3JpdHlGZWU6IG9yaWdpbmFsUHJpb3JpdHlGZWUudG9TdHJpbmcoKSxcclxuICAgICAgICBuZXdNYXhGZWU6IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpLFxyXG4gICAgICAgIG5ld1ByaW9yaXR5RmVlOiBuZXdNYXhQcmlvcml0eUZlZVBlckdhcy50b1N0cmluZygpXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTGVnYWN5IHRyYW5zYWN0aW9uOiB1c2UgZ2FzUHJpY2VcclxuICAgICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgICAgLy8gVXNlIGN1c3RvbSBnYXMgcHJpY2UgcHJvdmlkZWQgYnkgdXNlclxyXG4gICAgICAgIG5ld0dhc1ByaWNlID0gQmlnSW50KGN1c3RvbUdhc1ByaWNlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgZnJvbSBtdWx0aXBsaWVyICgxLjJ4IG9mIG9yaWdpbmFsIGJ5IGRlZmF1bHQpXHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxHYXNQcmljZSA9IEJpZ0ludChvcmlnaW5hbFR4Lmdhc1ByaWNlKTtcclxuICAgICAgICBuZXdHYXNQcmljZSA9IChvcmlnaW5hbEdhc1ByaWNlICogQmlnSW50KE1hdGguZmxvb3IoZ2FzUHJpY2VNdWx0aXBsaWVyICogMTAwKSkpIC8gQmlnSW50KDEwMCk7XHJcbiAgICAgIH1cclxuICAgICAgcmVwbGFjZW1lbnRUeC5nYXNQcmljZSA9IG5ld0dhc1ByaWNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uXHJcblxyXG4gICAgLy8gU2VuZCByZXBsYWNlbWVudCB0cmFuc2FjdGlvbiDigJQgYnJvYWRjYXN0IHdpZGUsIHNpbmNlIGEgc3BlZWQtdXAgaXMgb2Z0ZW4gbmVlZGVkXHJcbiAgICAvLyBwcmVjaXNlbHkgYmVjYXVzZSB0aGUgZmlyc3QgYXR0ZW1wdCBmYWlsZWQgdG8gcHJvcGFnYXRlIGZyb20gYSBzaW5nbGUgZW5kcG9pbnQuXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHJwYy5zZW5kVHJhbnNhY3Rpb25SZXNpbGllbnQod2FsbGV0LCBuZXR3b3JrLCByZXBsYWNlbWVudFR4KTtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFNwZWVkLXVwICR7dHguaGFzaH0gYnJvYWRjYXN0IHRvICR7dHguYWNjZXB0ZWQubGVuZ3RofSBlbmRwb2ludChzKWApO1xyXG5cclxuICAgIC8vIFNhdmUgbmV3IHRyYW5zYWN0aW9uIHRvIGhpc3RvcnkgKGluY2x1ZGUgRUlQLTE1NTkgZmllbGRzIGlmIGFwcGxpY2FibGUpXHJcbiAgICBjb25zdCBoaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogYWRkcmVzcyxcclxuICAgICAgdG86IG9yaWdpbmFsVHgudG8sXHJcbiAgICAgIHZhbHVlOiBvcmlnaW5hbFR4LnZhbHVlLFxyXG4gICAgICBkYXRhOiBvcmlnaW5hbFR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlID8gbmV3R2FzUHJpY2UudG9TdHJpbmcoKSA6IChuZXdNYXhGZWVQZXJHYXMgPyBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKSA6IG9yaWdpbmFsVHguZ2FzUHJpY2UpLFxyXG4gICAgICBnYXNMaW1pdDogb3JpZ2luYWxUeC5nYXNMaW1pdCxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogb3JpZ2luYWxUeC50eXBlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEFkZCBFSVAtMTU1OSBmaWVsZHMgaWYgdGhpcyB3YXMgYW4gRUlQLTE1NTkgdHJhbnNhY3Rpb25cclxuICAgIGlmIChuZXdNYXhGZWVQZXJHYXMpIHtcclxuICAgICAgaGlzdG9yeUVudHJ5Lm1heEZlZVBlckdhcyA9IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5ld01heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgIGhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG5ld01heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIGhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyByZXBsYWNlZC9mYWlsZWRcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTcGVkIFVwJyxcclxuICAgICAgbWVzc2FnZTogYFJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHNlbnQgd2l0aCAke01hdGguZmxvb3IoZ2FzUHJpY2VNdWx0aXBsaWVyICogMTAwKX0lIGdhcyBwcmljZWAsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb25cclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2gsIG5ld0dhc1ByaWNlOiBuZXdHYXNQcmljZS50b1N0cmluZygpIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBTRUNVUklUWTogQ2xlYW4gdXAgc2Vuc2l0aXZlIGRhdGEgZnJvbSBtZW1vcnlcclxuICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICBjb25zdCB0ZW1wT2JqID0geyBwYXNzd29yZCB9O1xyXG4gICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChzaWduZXIpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHdhbGxldCkge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHdhbGxldCk7XHJcbiAgICAgIHdhbGxldCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBDYW5jZWwgYSBwZW5kaW5nIHRyYW5zYWN0aW9uIGJ5IHJlcGxhY2luZyBpdCB3aXRoIGEgemVyby12YWx1ZSB0eCB0byBzZWxmXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbmNlbFRyYW5zYWN0aW9uKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCBzZXNzaW9uVG9rZW4sIGN1c3RvbUdhc1ByaWNlID0gbnVsbCkge1xyXG4gIGxldCBwYXNzd29yZCA9IG51bGw7XHJcbiAgbGV0IHNpZ25lciA9IG51bGw7XHJcbiAgbGV0IHdhbGxldCA9IG51bGw7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIChub3cgYXN5bmMpXHJcbiAgICBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG5cclxuICAgIC8vIEdldCBvcmlnaW5hbCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICBjb25zdCBvcmlnaW5hbFR4ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4QnlIYXNoKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoKTtcclxuICAgIGlmICghb3JpZ2luYWxUeCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBub3QgZm91bmQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9yaWdpbmFsVHguc3RhdHVzICE9PSB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gaXMgbm90IHBlbmRpbmcnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHdhbGxldCBhbmQgdW5sb2NrIChhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkKVxyXG4gICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2lnbmVyID0gdW5sb2NrUmVzdWx0LnNpZ25lcjtcclxuXHJcbiAgICAvLyBTRUNVUklUWTogVmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBiZWxvbmdzIHRvIHRoaXMgd2FsbGV0XHJcbiAgICBjb25zdCB3YWxsZXRBZGRyZXNzID0gYXdhaXQgc2lnbmVyLmdldEFkZHJlc3MoKTtcclxuICAgIGlmICh3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEFkZHJlc3MgbWlzbWF0Y2ggaW4gY2FuY2VsOiB3YWxsZXQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCByZXF1ZXN0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1dhbGxldCBhZGRyZXNzIG1pc21hdGNoJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFZlcmlmeSBvcmlnaW5hbCB0cmFuc2FjdGlvbiBpcyBmcm9tIHRoaXMgd2FsbGV0XHJcbiAgICBpZiAob3JpZ2luYWxUeC5mcm9tICYmIG9yaWdpbmFsVHguZnJvbS50b0xvd2VyQ2FzZSgpICE9PSB3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBUcmFuc2FjdGlvbiBvd25lcnNoaXAgY2hlY2sgZmFpbGVkOiB0cmFuc2FjdGlvbiBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyB3YWxsZXQnKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgYWN0dWFsIHRyYW5zYWN0aW9uIGZyb20gYmxvY2tjaGFpbiB0byBjaGVjayBpdHMgdHlwZVxyXG4gICAgbGV0IGlzRUlQMTU1OSA9IG9yaWdpbmFsVHgubWF4RmVlUGVyR2FzIHx8IG9yaWdpbmFsVHgubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICBsZXQgb25DaGFpbk1heEZlZVBlckdhcyA9IG51bGw7XHJcbiAgICBsZXQgb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzID0gbnVsbDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBvbkNoYWluVHggPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbihvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICAgIGlmIChvbkNoYWluVHgpIHtcclxuICAgICAgICBpZiAob25DaGFpblR4LnR5cGUgPT09IDIgfHwgb25DaGFpblR4Lm1heEZlZVBlckdhcykge1xyXG4gICAgICAgICAgaXNFSVAxNTU5ID0gdHJ1ZTtcclxuICAgICAgICAgIG9uQ2hhaW5NYXhGZWVQZXJHYXMgPSBvbkNoYWluVHgubWF4RmVlUGVyR2FzO1xyXG4gICAgICAgICAgb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzID0gb25DaGFpblR4Lm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgRGV0ZWN0ZWQgRUlQLTE1NTkgdHJhbnNhY3Rpb24gZnJvbSBibG9ja2NoYWluIGZvciBjYW5jZWwnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGZldGNoRXJyKSB7XHJcbiAgICAgIGNvbnNvbGUud2Fybign8J+rgCBDb3VsZCBub3QgZmV0Y2ggb3JpZ2luYWwgdHggZnJvbSBibG9ja2NoYWluOicsIGZldGNoRXJyLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gKHNlbmQgMCB0byBzZWxmIHdpdGggc2FtZSBub25jZSlcclxuICAgIGNvbnN0IGNhbmNlbFR4ID0ge1xyXG4gICAgICB0bzogYWRkcmVzcywgIC8vIFNlbmQgdG8gc2VsZlxyXG4gICAgICB2YWx1ZTogJzAnLCAgIC8vIFplcm8gdmFsdWVcclxuICAgICAgZGF0YTogJzB4JywgICAvLyBFbXB0eSBkYXRhXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBnYXNMaW1pdDogMjEwMDAgIC8vIFN0YW5kYXJkIGdhcyBsaW1pdCBmb3Igc2ltcGxlIEVUSCB0cmFuc2ZlclxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBGb3Igc3RvcmluZyBpbiBoaXN0b3J5XHJcbiAgICBsZXQgbmV3R2FzUHJpY2UgPSBudWxsO1xyXG4gICAgbGV0IG5ld01heEZlZVBlckdhcyA9IG51bGw7XHJcbiAgICBsZXQgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBudWxsO1xyXG5cclxuICAgIGlmIChpc0VJUDE1NTkpIHtcclxuICAgICAgLy8gRUlQLTE1NTk6IE11c3QgYnVtcCBCT1RIIG1heEZlZVBlckdhcyBhbmQgbWF4UHJpb3JpdHlGZWVQZXJHYXMgYnkgYXQgbGVhc3QgMTAlXHJcbiAgICAgIGNvbnN0IGJ1bXBNdWx0aXBsaWVyID0gMTEyNW47IC8vIDExMi41JVxyXG4gICAgICBjb25zdCBidW1wRGl2aXNvciA9IDEwMDBuO1xyXG5cclxuICAgICAgLy8gVXNlIG9uLWNoYWluIHZhbHVlcyBpZiBhdmFpbGFibGVcclxuICAgICAgY29uc3Qgb3JpZ2luYWxNYXhGZWUgPSBvbkNoYWluTWF4RmVlUGVyR2FzIHx8IEJpZ0ludChvcmlnaW5hbFR4Lm1heEZlZVBlckdhcyB8fCBvcmlnaW5hbFR4Lmdhc1ByaWNlIHx8ICcwJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsUHJpb3JpdHlGZWUgPSBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgfHwgQmlnSW50KG9yaWdpbmFsVHgubWF4UHJpb3JpdHlGZWVQZXJHYXMgfHwgJzAnKTtcclxuXHJcbiAgICAgIC8vIEZsb29ycyBkZXJpdmVkIGZyb20gdGhlIGxpdmUgYmFzZSBmZWUg4oCUIGEgY2FuY2VsIHRoYXQgY2FuJ3QgYmUgbWluZWQgaXMgd29yc2VcclxuICAgICAgLy8gdGhhbiB1c2VsZXNzLCBzaW5jZSB0aGUgdXNlciBiZWxpZXZlcyB0aGUgb3JpZ2luYWwgd2FzIHJlcGxhY2VkLlxyXG4gICAgICBsZXQgY3VycmVudEJhc2VGZWUgPSAwbjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjdXJyZW50QmFzZUZlZSA9IEJpZ0ludChhd2FpdCBycGMuZ2V0QmFzZUZlZShuZXR3b3JrKSk7XHJcbiAgICAgIH0gY2F0Y2ggKGZlZUVycikge1xyXG4gICAgICAgIGNvbnNvbGUud2Fybign8J+rgCBDb3VsZCBub3QgcmVhZCBsaXZlIGJhc2UgZmVlIGZvciBjYW5jZWwsIHVzaW5nIGJ1bXAgb25seTonLCBmZWVFcnIubWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgdGlwRmxvb3IgPSBjdXJyZW50QmFzZUZlZSAvIDIwbjtcclxuICAgICAgY29uc3QgY2FwRmxvb3IgPSBjdXJyZW50QmFzZUZlZSAqIDRuICsgdGlwRmxvb3I7XHJcblxyXG4gICAgICBpZiAoY3VzdG9tR2FzUHJpY2UpIHtcclxuICAgICAgICAvLyBDdXN0b20gZ2FzIHByaWNlOiB1c2UgaXQgZm9yIG1heEZlZVBlckdhc1xyXG4gICAgICAgIGNvbnN0IGN1c3RvbUZlZSA9IEJpZ0ludChjdXN0b21HYXNQcmljZSk7XHJcbiAgICAgICAgY29uc3QgYnVtcGVkID0gKG9yaWdpbmFsUHJpb3JpdHlGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuICAgICAgICBjb25zdCBwcmlvcml0eUZlZSA9IGJ1bXBlZCA+IHRpcEZsb29yID8gYnVtcGVkIDogdGlwRmxvb3I7XHJcblxyXG4gICAgICAgIG5ld01heEZlZVBlckdhcyA9IGN1c3RvbUZlZTtcclxuICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IHByaW9yaXR5RmVlIDwgY3VzdG9tRmVlID8gcHJpb3JpdHlGZWUgOiBjdXN0b21GZWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGJ1bXBlZCBmZWVzXHJcbiAgICAgICAgbmV3TWF4RmVlUGVyR2FzID0gKG9yaWdpbmFsTWF4RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSAob3JpZ2luYWxQcmlvcml0eUZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG5cclxuICAgICAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPCB0aXBGbG9vcikgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSB0aXBGbG9vcjtcclxuICAgICAgICBpZiAobmV3TWF4RmVlUGVyR2FzIDwgY2FwRmxvb3IpIG5ld01heEZlZVBlckdhcyA9IGNhcEZsb29yO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPiBuZXdNYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IG5ld01heEZlZVBlckdhcztcclxuICAgICAgfVxyXG5cclxuICAgICAgY2FuY2VsVHgubWF4RmVlUGVyR2FzID0gbmV3TWF4RmVlUGVyR2FzO1xyXG4gICAgICBjYW5jZWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG5ld01heFByaW9yaXR5RmVlUGVyR2FzO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coJ/Cfq4AgRUlQLTE1NTkgY2FuY2VsOicsIHtcclxuICAgICAgICBvcmlnaW5hbE1heEZlZTogb3JpZ2luYWxNYXhGZWUudG9TdHJpbmcoKSxcclxuICAgICAgICBvcmlnaW5hbFByaW9yaXR5RmVlOiBvcmlnaW5hbFByaW9yaXR5RmVlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbmV3TWF4RmVlOiBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKSxcclxuICAgICAgICBuZXdQcmlvcml0eUZlZTogbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIExlZ2FjeSB0cmFuc2FjdGlvblxyXG4gICAgICBpZiAoY3VzdG9tR2FzUHJpY2UpIHtcclxuICAgICAgICBuZXdHYXNQcmljZSA9IEJpZ0ludChjdXN0b21HYXNQcmljZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxHYXNQcmljZSA9IEJpZ0ludChvcmlnaW5hbFR4Lmdhc1ByaWNlKTtcclxuICAgICAgICBuZXdHYXNQcmljZSA9IChvcmlnaW5hbEdhc1ByaWNlICogQmlnSW50KDEyMCkpIC8gQmlnSW50KDEwMCk7XHJcbiAgICAgIH1cclxuICAgICAgY2FuY2VsVHguZ2FzUHJpY2UgPSBuZXdHYXNQcmljZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYW5jZWxsaW5nIHRyYW5zYWN0aW9uXHJcblxyXG4gICAgLy8gU2VuZCBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24g4oCUIGJyb2FkY2FzdCB3aWRlIGZvciB0aGUgc2FtZSByZWFzb24gYXMgc3BlZWQtdXAuXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHJwYy5zZW5kVHJhbnNhY3Rpb25SZXNpbGllbnQod2FsbGV0LCBuZXR3b3JrLCBjYW5jZWxUeCk7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBDYW5jZWwgJHt0eC5oYXNofSBicm9hZGNhc3QgdG8gJHt0eC5hY2NlcHRlZC5sZW5ndGh9IGVuZHBvaW50KHMpYCk7XHJcblxyXG4gICAgLy8gU2F2ZSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgY29uc3QgaGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICBoYXNoOiB0eC5oYXNoLFxyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIGZyb206IGFkZHJlc3MsXHJcbiAgICAgIHRvOiBhZGRyZXNzLFxyXG4gICAgICB2YWx1ZTogJzAnLFxyXG4gICAgICBkYXRhOiAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogbmV3R2FzUHJpY2UgPyBuZXdHYXNQcmljZS50b1N0cmluZygpIDogKG5ld01heEZlZVBlckdhcyA/IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpIDogb3JpZ2luYWxUeC5nYXNQcmljZSksXHJcbiAgICAgIGdhc0xpbWl0OiAnMjEwMDAnLFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiAnc2VuZCdcclxuICAgIH07XHJcblxyXG4gICAgaWYgKG5ld01heEZlZVBlckdhcykge1xyXG4gICAgICBoaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMpIHtcclxuICAgICAgaGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgaGlzdG9yeUVudHJ5KTtcclxuXHJcbiAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIGZhaWxlZFxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCwgbnVsbCk7XHJcblxyXG4gICAgLy8gU2VuZCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENhbmNlbGxlZCcsXHJcbiAgICAgIG1lc3NhZ2U6ICdDYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gc2VudCcsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb25cclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2ggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICBwYXNzd29yZCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgc2lnbmVyID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmICh3YWxsZXQpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcih3YWxsZXQpO1xyXG4gICAgICB3YWxsZXQgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGN1cnJlbnQgbmV0d29yayBnYXMgcHJpY2UgKGZvciBzcGVlZC11cCBVSSlcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudE5ldHdvcmtHYXNQcmljZShuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEdldCBmdWxsIGdhcyBwcmljZSByZWNvbW1lbmRhdGlvbnMgYmFzZWQgb24gZmVlIGhpc3RvcnlcclxuICAgIGNvbnN0IHJlY29tbWVuZGF0aW9ucyA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZVJlY29tbWVuZGF0aW9ucyhuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBVc2UgXCJmYXN0XCIgdGllciBhcyB0aGUgcmVjb21tZW5kZWQgc3BlZWQtdXAgcHJpY2VcclxuICAgIGNvbnN0IGZhc3RQcmljZSA9IEJpZ0ludChyZWNvbW1lbmRhdGlvbnMuZmFzdC5tYXhGZWVQZXJHYXMpO1xyXG4gICAgY29uc3QgaW5zdGFudFByaWNlID0gQmlnSW50KHJlY29tbWVuZGF0aW9ucy5pbnN0YW50Lm1heEZlZVBlckdhcyk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgZ2FzUHJpY2U6IGZhc3RQcmljZS50b1N0cmluZygpLFxyXG4gICAgICBnYXNQcmljZUd3ZWk6IChOdW1iZXIoZmFzdFByaWNlKSAvIDFlOSkudG9GaXhlZCgyKSxcclxuICAgICAgcmVjb21tZW5kYXRpb25zOiB7XHJcbiAgICAgICAgc2xvdzogcmVjb21tZW5kYXRpb25zLnNsb3cubWF4RmVlUGVyR2FzLFxyXG4gICAgICAgIG5vcm1hbDogcmVjb21tZW5kYXRpb25zLm5vcm1hbC5tYXhGZWVQZXJHYXMsXHJcbiAgICAgICAgZmFzdDogcmVjb21tZW5kYXRpb25zLmZhc3QubWF4RmVlUGVyR2FzLFxyXG4gICAgICAgIGluc3RhbnQ6IHJlY29tbWVuZGF0aW9ucy5pbnN0YW50Lm1heEZlZVBlckdhc1xyXG4gICAgICB9LFxyXG4gICAgICBpbnN0YW50UHJpY2U6IGluc3RhbnRQcmljZS50b1N0cmluZygpLFxyXG4gICAgICBpbnN0YW50UHJpY2VHd2VpOiAoTnVtYmVyKGluc3RhbnRQcmljZSkgLyAxZTkpLnRvRml4ZWQoMilcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgZmV0Y2hpbmcgY3VycmVudCBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVmcmVzaCB0cmFuc2FjdGlvbiBzdGF0dXMgZnJvbSBibG9ja2NoYWluXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hUcmFuc2FjdGlvblN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgUmVmcmVzaGluZyB0eCBzdGF0dXM6ICR7dHhIYXNofSBvbiAke25ldHdvcmt9YCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBHZXQgdHJhbnNhY3Rpb24gcmVjZWlwdCBmcm9tIGJsb2NrY2hhaW5cclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvblJlY2VpcHQodHhIYXNoKTtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFJlY2VpcHQgZm9yICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi46YCwgcmVjZWlwdCA/ICdmb3VuZCcgOiAnbnVsbCcpO1xyXG5cclxuICAgIGlmICghcmVjZWlwdCkge1xyXG4gICAgICAvLyBObyByZWNlaXB0IC0gY2hlY2sgaWYgdHJhbnNhY3Rpb24gaXMgc3RpbGwgaW4gbWVtcG9vbFxyXG4gICAgICBjb25zdCB0eCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uKHR4SGFzaCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDwn6uAIE1lbXBvb2wgdHggZm9yICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi46YCwgdHggPyAnZm91bmQnIDogJ251bGwnKTtcclxuXHJcbiAgICAgIGlmICghdHgpIHtcclxuICAgICAgICAvLyBUcmFuc2FjdGlvbiBub3QgaW4gbWVtcG9vbCBhbmQgbm8gcmVjZWlwdCA9IGRyb3BwZWQvZXZpY3RlZFxyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn6uAIFRyYW5zYWN0aW9uICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4gd2FzIERST1BQRUQgLSBtYXJraW5nIGFzIGZhaWxlZGApO1xyXG4gICAgICAgIC8vIE1hcmsgYXMgZmFpbGVkIGluIGxvY2FsIGhpc3RvcnlcclxuICAgICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgICBhZGRyZXNzLFxyXG4gICAgICAgICAgdHhIYXNoLFxyXG4gICAgICAgICAgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsXHJcbiAgICAgICAgICBudWxsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICBzdGF0dXM6ICdkcm9wcGVkJyxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiB3YXMgZHJvcHBlZCBmcm9tIG1lbXBvb2wgKG5vdCBjb25maXJtZWQsIG5vIGxvbmdlciBwZW5kaW5nKSdcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBleGlzdHMgaW4gbWVtcG9vbCwgc3RpbGwgcGVuZGluZ1xyXG4gICAgICBjb25zb2xlLmxvZyhg8J+rgCBUcmFuc2FjdGlvbiAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uIHN0aWxsIGluIG1lbXBvb2xgKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiBpcyBzdGlsbCBwZW5kaW5nIG9uIHRoZSBibG9ja2NoYWluJ1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRyYW5zYWN0aW9uIGhhcyBiZWVuIG1pbmVkXHJcbiAgICBsZXQgbmV3U3RhdHVzO1xyXG4gICAgaWYgKHJlY2VpcHQuc3RhdHVzID09PSAxKSB7XHJcbiAgICAgIG5ld1N0YXR1cyA9IHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVEO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmV3U3RhdHVzID0gdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIGxvY2FsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgYWRkcmVzcyxcclxuICAgICAgdHhIYXNoLFxyXG4gICAgICBuZXdTdGF0dXMsXHJcbiAgICAgIHJlY2VpcHQuYmxvY2tOdW1iZXJcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgc3RhdHVzOiBuZXdTdGF0dXMsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiByZWNlaXB0LmJsb2NrTnVtYmVyLFxyXG4gICAgICBtZXNzYWdlOiBuZXdTdGF0dXMgPT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVEXHJcbiAgICAgICAgPyAnVHJhbnNhY3Rpb24gY29uZmlybWVkIG9uIGJsb2NrY2hhaW4nXHJcbiAgICAgICAgOiAnVHJhbnNhY3Rpb24gZmFpbGVkIG9uIGJsb2NrY2hhaW4nXHJcbiAgICB9O1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciByZWZyZXNoaW5nIHRyYW5zYWN0aW9uIHN0YXR1czonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBSZWJyb2FkY2FzdCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gdG8gYWxsIGNvbmZpZ3VyZWQgUlBDc1xyXG5hc3luYyBmdW5jdGlvbiByZWJyb2FkY2FzdFRyYW5zYWN0aW9uKHR4SGFzaCwgbmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBSZWJyb2FkY2FzdGluZyB0cmFuc2FjdGlvbjogJHt0eEhhc2h9IHRvIGFsbCAke25ldHdvcmt9IFJQQ3NgKTtcclxuXHJcbiAgICAvLyBGaXJzdCwgdHJ5IHRvIGdldCB0aGUgcmF3IHRyYW5zYWN0aW9uXHJcbiAgICBsZXQgcmF3VHggPSBhd2FpdCBycGMuZ2V0UmF3VHJhbnNhY3Rpb24obmV0d29yaywgdHhIYXNoKTtcclxuXHJcbiAgICBpZiAoIXJhd1R4KSB7XHJcbiAgICAgIC8vIElmIGdldFJhd1RyYW5zYWN0aW9uIG5vdCBzdXBwb3J0ZWQsIHdlIG5lZWQgdG8gcmVjb25zdHJ1Y3QgZnJvbSB0eCBkYXRhXHJcbiAgICAgIC8vIEdldCB0aGUgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgY29uc3QgdHggPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbih0eEhhc2gpO1xyXG5cclxuICAgICAgaWYgKCF0eCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgIGVycm9yOiAnVHJhbnNhY3Rpb24gbm90IGZvdW5kIGluIG1lbXBvb2wgLSBpdCBtYXkgaGF2ZSBiZWVuIGRyb3BwZWQgb3IgYWxyZWFkeSBjb25maXJtZWQnXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR2V0IHRoZSByYXcgc2VyaWFsaXplZCB0cmFuc2FjdGlvbiBmcm9tIHRoZSBwcm92aWRlclxyXG4gICAgICAvLyBldGhlcnMgdjYgZG9lc24ndCBleHBvc2UgcmF3IHR4IGRpcmVjdGx5LCBzbyB3ZSB1c2UgYSB3b3JrYXJvdW5kXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gVHJ5IGRpcmVjdCBSUEMgY2FsbCB0byBnZXQgcmF3IHR4XHJcbiAgICAgICAgY29uc3QgcmF3UmVzdWx0ID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldFJhd1RyYW5zYWN0aW9uQnlIYXNoJywgW3R4SGFzaF0pO1xyXG4gICAgICAgIGlmIChyYXdSZXN1bHQpIHtcclxuICAgICAgICAgIHJhd1R4ID0gcmF3UmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGdldCByYXcgdHJhbnNhY3Rpb24gdmlhIFJQQzonLCBlLm1lc3NhZ2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXJhd1R4KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6ICdDYW5ub3QgZ2V0IHJhdyB0cmFuc2FjdGlvbiBkYXRhLiBUaGUgUlBDIG5vZGVzIG1heSBub3Qgc3VwcG9ydCB0aGlzIG9wZXJhdGlvbi4nXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJyb2FkY2FzdCB0byBhbGwgUlBDc1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHJwYy5icm9hZGNhc3RUb0FsbFJwY3MobmV0d29yaywgcmF3VHgpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFJlYnJvYWRjYXN0IHJlc3VsdHMgLSBTdWNjZXNzZXM6ICR7cmVzdWx0cy5zdWNjZXNzZXMubGVuZ3RofSwgRmFpbHVyZXM6ICR7cmVzdWx0cy5mYWlsdXJlcy5sZW5ndGh9YCk7XHJcblxyXG4gICAgaWYgKHJlc3VsdHMuc3VjY2Vzc2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBicm9hZGNhc3QgdG8gJHtyZXN1bHRzLnN1Y2Nlc3Nlcy5sZW5ndGh9IFJQQyhzKWAsXHJcbiAgICAgICAgc3VjY2Vzc2VzOiByZXN1bHRzLnN1Y2Nlc3NlcyxcclxuICAgICAgICBmYWlsdXJlczogcmVzdWx0cy5mYWlsdXJlc1xyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byBicm9hZGNhc3QgdG8gYW55IFJQQycsXHJcbiAgICAgICAgZmFpbHVyZXM6IHJlc3VsdHMuZmFpbHVyZXNcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgcmVicm9hZGNhc3RpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gVHJhY2sgdHJhbnNhY3Rpb25zIGJlaW5nIG1vbml0b3JlZCB0byBwcmV2ZW50IGR1cGxpY2F0ZXNcclxuY29uc3QgbW9uaXRvcmluZ1RyYW5zYWN0aW9ucyA9IG5ldyBTZXQoKTtcclxuXHJcbi8vIFdhaXQgZm9yIHRyYW5zYWN0aW9uIGNvbmZpcm1hdGlvbiB3aXRoIHRpbWVvdXQgYW5kIHJldHJ5XHJcbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKSB7XHJcbiAgY29uc3QgdHhIYXNoID0gdHguaGFzaDtcclxuXHJcbiAgLy8gUHJldmVudCBkdXBsaWNhdGUgbW9uaXRvcmluZ1xyXG4gIGlmIChtb25pdG9yaW5nVHJhbnNhY3Rpb25zLmhhcyh0eEhhc2gpKSB7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBUcmFuc2FjdGlvbiAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uIGFscmVhZHkgYmVpbmcgbW9uaXRvcmVkYCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIG1vbml0b3JpbmdUcmFuc2FjdGlvbnMuYWRkKHR4SGFzaCk7XHJcblxyXG4gIGNvbnN0IFBPTExfSU5URVJWQUwgPSAxNSAqIDEwMDA7IC8vIDE1IHNlY29uZHNcclxuICBjb25zdCBNQVhfUkVUUklFUyA9IDQwOyAvLyA0MCAqIDE1cyA9IDEwIG1pbnV0ZXNcclxuXHJcbiAgdHJ5IHtcclxuICAgIGxldCByZWNlaXB0ID0gbnVsbDtcclxuICAgIGxldCByZXRyaWVzID0gMDtcclxuXHJcbiAgICAvLyBQb2xsIGZvciByZWNlaXB0IHdpdGggdGltZW91dFxyXG4gICAgd2hpbGUgKCFyZWNlaXB0ICYmIHJldHJpZXMgPCBNQVhfUkVUUklFUykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvblJlY2VpcHQodHhIYXNoKTtcclxuICAgICAgICBpZiAocmVjZWlwdCkgYnJlYWs7XHJcbiAgICAgIH0gY2F0Y2ggKHJwY0Vycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGDwn6uAIFJQQyBlcnJvciBjaGVja2luZyB0eCAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uLCByZXRyeWluZzpgLCBycGNFcnJvci5tZXNzYWdlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2FpdCBiZWZvcmUgbmV4dCBwb2xsXHJcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBQT0xMX0lOVEVSVkFMKSk7XHJcbiAgICAgIHJldHJpZXMrKztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlY2VpcHQpIHtcclxuICAgICAgY29uc29sZS53YXJuKGDwn6uAIFRyYW5zYWN0aW9uICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4gY29uZmlybWF0aW9uIHRpbWVkIG91dCBhZnRlciAke01BWF9SRVRSSUVTfSBhdHRlbXB0c2ApO1xyXG4gICAgICAvLyBEb24ndCBtYXJrIGFzIGZhaWxlZCAtIGl0IG1pZ2h0IHN0aWxsIGJlIHBlbmRpbmcgaW4gbWVtcG9vbFxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlY2VpcHQuc3RhdHVzID09PSAxKSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBzdWNjZXNzZnVsbHlcclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoLFxyXG4gICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVELFxyXG4gICAgICAgIHJlY2VpcHQuYmxvY2tOdW1iZXJcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENvbmZpcm1lZCcsXHJcbiAgICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBpbiBibG9jayAke3JlY2VpcHQuYmxvY2tOdW1iZXJ9YCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIHJldmVydGVkIChzdGF0dXMgPT09IDApXHJcbiAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgICBhZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaCxcclxuICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCxcclxuICAgICAgICByZWNlaXB0LmJsb2NrTnVtYmVyXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBGYWlsZWQnLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiB3YXMgcmV2ZXJ0ZWQgb24tY2hhaW4nLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGluIGNvbmZpcm1hdGlvbiBtb25pdG9yaW5nOicsIGVycm9yKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gQWx3YXlzIGNsZWFuIHVwIHRyYWNraW5nXHJcbiAgICBtb25pdG9yaW5nVHJhbnNhY3Rpb25zLmRlbGV0ZSh0eEhhc2gpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gTUVTU0FHRSBTSUdOSU5HIEhBTkRMRVJTID09PT09XHJcblxyXG4vLyBIYW5kbGUgcGVyc29uYWxfc2lnbiAoRUlQLTE5MSkgLSBTaWduIGEgbWVzc2FnZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVQZXJzb25hbFNpZ24ocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCkge1xyXG4gIC8vIENoZWNrIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKCFhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ05vdCBhdXRob3JpemVkLiBQbGVhc2UgY29ubmVjdCB5b3VyIHdhbGxldCBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHNpZ24gcmVxdWVzdFxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKTtcclxuICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBJbnZhbGlkIHNpZ24gcmVxdWVzdCBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3IpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiAtMzI2MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcilcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgbWVzc2FnZSwgYWRkcmVzcyB9ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBDaGVjayBpZiBldGhfc2lnbiBpcyBhbGxvd2VkIChkaXNhYmxlZCBieSBkZWZhdWx0KVxyXG4gIGlmIChtZXRob2QgPT09ICdldGhfc2lnbicpIHtcclxuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgbG9hZCgnc2V0dGluZ3MnKTtcclxuICAgIGNvbnN0IGFsbG93RXRoU2lnbiA9IHNldHRpbmdzPy5hbGxvd0V0aFNpZ24gfHwgZmFsc2U7XHJcblxyXG4gICAgaWYgKCFhbGxvd0V0aFNpZ24pIHtcclxuICAgICAgY29uc29sZS53YXJuKCfwn6uAIGV0aF9zaWduIHJlcXVlc3QgYmxvY2tlZCAoZGlzYWJsZWQgaW4gc2V0dGluZ3MpOicsIG9yaWdpbik7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZXJyb3I6IHtcclxuICAgICAgICAgIGNvZGU6IDQxMDAsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnZXRoX3NpZ24gaXMgZGlzYWJsZWQgZm9yIHNlY3VyaXR5LiBVc2UgcGVyc29uYWxfc2lnbiBpbnN0ZWFkLCBvciBlbmFibGUgZXRoX3NpZ24gaW4gd2FsbGV0IHNldHRpbmdzLidcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTG9nIHdhcm5pbmcgd2hlbiBldGhfc2lnbiBpcyB1c2VkIChldmVuIHdoZW4gZW5hYmxlZClcclxuICAgIGNvbnNvbGUud2Fybign4pqg77iPIGV0aF9zaWduIHJlcXVlc3QgYXBwcm92ZWQgYnkgc2V0dGluZ3MgZnJvbTonLCBvcmlnaW4pO1xyXG4gIH1cclxuXHJcbiAgLy8gVmVyaWZ5IHRoZSBhZGRyZXNzIG1hdGNoZXMgdGhlIGNvbm5lY3RlZCBhY2NvdW50XHJcbiAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgaWYgKCF3YWxsZXQgfHwgd2FsbGV0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IDQxMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ1JlcXVlc3RlZCBhZGRyZXNzIGRvZXMgbm90IG1hdGNoIGNvbm5lY3RlZCBhY2NvdW50J1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHtcclxuICAgICAgcmVzb2x2ZSxcclxuICAgICAgcmVqZWN0LFxyXG4gICAgICBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZCxcclxuICAgICAgc2lnblJlcXVlc3Q6IHsgbWVzc2FnZSwgYWRkcmVzcyB9LFxyXG4gICAgICBhcHByb3ZhbFRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXNpZ24mcmVxdWVzdElkPSR7cmVxdWVzdElkfSZtZXRob2Q9JHttZXRob2R9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nU2lnblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdTaWduIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9zaWduVHlwZWREYXRhIChFSVAtNzEyKSAtIFNpZ24gdHlwZWQgZGF0YVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTaWduVHlwZWREYXRhKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpIHtcclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBzaWduIHJlcXVlc3RcclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVTaWduUmVxdWVzdChtZXRob2QsIHBhcmFtcyk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCBzaWduIHR5cGVkIGRhdGEgcmVxdWVzdCBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3IpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiAtMzI2MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcilcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgYWRkcmVzcywgdHlwZWREYXRhIH0gPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gVmVyaWZ5IHRoZSBhZGRyZXNzIG1hdGNoZXMgdGhlIGNvbm5lY3RlZCBhY2NvdW50XHJcbiAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgaWYgKCF3YWxsZXQgfHwgd2FsbGV0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IDQxMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ1JlcXVlc3RlZCBhZGRyZXNzIGRvZXMgbm90IG1hdGNoIGNvbm5lY3RlZCBhY2NvdW50J1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IHJlZnVzZSBhIHR5cGVkLWRhdGEgZG9tYWluIGJvdW5kIHRvIGEgZGlmZmVyZW50IGNoYWluLiBBXHJcbiAgLy8gc2lnbmF0dXJlIHdob3NlIGRvbWFpbiBzYXlzIGNoYWluSWQgMSBhdXRob3JpemVzIGFjdGlvbnMgb24gRXRoZXJldW1cclxuICAvLyBtYWlubmV0IHJlZ2FyZGxlc3Mgb2Ygd2hpY2ggbmV0d29yayB0aGUgdXNlciBiZWxpZXZlcyB0aGV5IGFyZSBvbi5cclxuICBjb25zdCBkb21haW5DaGFpbklkID0gdHlwZWREYXRhPy5kb21haW4/LmNoYWluSWQ7XHJcbiAgaWYgKGRvbWFpbkNoYWluSWQgIT09IHVuZGVmaW5lZCAmJiBkb21haW5DaGFpbklkICE9PSBudWxsKSB7XHJcbiAgICBsZXQgcmVxdWVzdGVkQ2hhaW47XHJcbiAgICB0cnkge1xyXG4gICAgICByZXF1ZXN0ZWRDaGFpbiA9IEJpZ0ludChkb21haW5DaGFpbklkKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHR5cGVkIGRhdGEgZG9tYWluIGNoYWluSWQnIH0gfTtcclxuICAgIH1cclxuICAgIGNvbnN0IGN1cnJlbnRDaGFpbklkID0gQmlnSW50KGF3YWl0IGdldEN1cnJlbnRDaGFpbklkKCkpO1xyXG4gICAgaWYgKHJlcXVlc3RlZENoYWluICE9PSBjdXJyZW50Q2hhaW5JZCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgICBjb2RlOiAtMzI2MDIsXHJcbiAgICAgICAgICBtZXNzYWdlOiBgVHlwZWQgZGF0YSBkb21haW4gY2hhaW5JZCAke3JlcXVlc3RlZENoYWlufSBkb2VzIG5vdCBtYXRjaCB0aGUgYWN0aXZlIGNoYWluICR7Y3VycmVudENoYWluSWR9YFxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBtZXRob2QsXHJcbiAgICAgIHNpZ25SZXF1ZXN0OiB7IHR5cGVkRGF0YSwgYWRkcmVzcyB9LFxyXG4gICAgICBhcHByb3ZhbFRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXNpZ25UeXBlZCZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9Jm1ldGhvZD0ke21ldGhvZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2NTBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NpZ24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgbWVzc2FnZSBzaWduaW5nIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNlc3Npb25Ub2tlbikge1xyXG4gIGlmICghcGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QodXNlclJlamVjdGlvbignVXNlciByZWplY3RlZCB0aGUgcmVxdWVzdCcpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICBsZXQgcGFzc3dvcmQgPSBudWxsO1xyXG4gIGxldCBzaWduZXIgPSBudWxsO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVmFsaWRhdGUgc2Vzc2lvbiBhbmQgZ2V0IHBhc3N3b3JkXHJcbiAgICBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG5cclxuICAgIC8vIFVubG9jayB3YWxsZXQgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB1bmxvY2tSZXN1bHQgPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG5cclxuICAgIGxldCBzaWduYXR1cmU7XHJcblxyXG4gICAgLy8gU2lnbiBiYXNlZCBvbiBtZXRob2RcclxuICAgIGlmIChtZXRob2QgPT09ICdwZXJzb25hbF9zaWduJyB8fCBtZXRob2QgPT09ICdldGhfc2lnbicpIHtcclxuICAgICAgc2lnbmF0dXJlID0gYXdhaXQgcGVyc29uYWxTaWduKHNpZ25lciwgc2lnblJlcXVlc3QubWVzc2FnZSk7XHJcbiAgICB9IGVsc2UgaWYgKG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpKSB7XHJcbiAgICAgIHNpZ25hdHVyZSA9IGF3YWl0IHNpZ25UeXBlZERhdGEoc2lnbmVyLCBzaWduUmVxdWVzdC50eXBlZERhdGEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBzaWduaW5nIG1ldGhvZDogJHttZXRob2R9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTG9nIHN1Y2Nlc3NmdWwgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGNvbnN0IHNpZ25lckFkZHJlc3MgPSBhd2FpdCBzaWduZXIuZ2V0QWRkcmVzcygpO1xyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpID8gJ3R5cGVkX2RhdGEnIDogJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduZXJBZGRyZXNzLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNpZ25hdHVyZSBnZW5lcmF0ZWQgc3VjY2Vzc2Z1bGx5XHJcbiAgICBjb25zb2xlLmxvZygn8J+rgCBNZXNzYWdlIHNpZ25lZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcblxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogc2lnbmF0dXJlIH0pO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgc2lnbmF0dXJlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igc2lnbmluZyBtZXNzYWdlOicsIGVycm9yKTtcclxuXHJcbiAgICAvLyBMb2cgZmFpbGVkIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogbWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykgPyAndHlwZWRfZGF0YScgOiAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIGFkZHJlc3M6IHNpZ25SZXF1ZXN0LmFkZHJlc3MgfHwgJ3Vua25vd24nLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ3NvZnR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVqZWN0KGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBTRUNVUklUWTogQ2xlYW4gdXAgc2Vuc2l0aXZlIGRhdGEgZnJvbSBtZW1vcnlcclxuICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICBjb25zdCB0ZW1wT2JqID0geyBwYXNzd29yZCB9O1xyXG4gICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChzaWduZXIpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEhhbmRsZSBMZWRnZXIgc2lnbmF0dXJlIGFwcHJvdmFsIChwcmUtc2lnbmVkIGluIHBvcHVwKVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTGVkZ2VyU2lnbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNpZ25hdHVyZSkge1xyXG4gIGlmICghcGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdJbnZhbGlkIG9yIGFscmVhZHkgdXNlZCBhcHByb3ZhbCB0b2tlbicpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QodXNlclJlamVjdGlvbignVXNlciByZWplY3RlZCB0aGUgcmVxdWVzdCcpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gTG9nIHN1Y2Nlc3NmdWwgTGVkZ2VyIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogbWV0aG9kICYmIG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpID8gJ3R5cGVkX2RhdGEnIDogJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduUmVxdWVzdD8uYWRkcmVzcyB8fCAnbGVkZ2VyJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kIHx8ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ2hhcmR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2lnbmF0dXJlIGFscmVhZHkgY3JlYXRlZCBieSBMZWRnZXIgaW4gcG9wdXAgLSBqdXN0IHBhc3MgaXQgdGhyb3VnaFxyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgTGVkZ2VyIG1lc3NhZ2Ugc2lnbmVkIGZvciBvcmlnaW46Jywgb3JpZ2luKTtcclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHNpZ25hdHVyZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHNpZ25hdHVyZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHByb2Nlc3NpbmcgTGVkZ2VyIHNpZ25hdHVyZTonLCBlcnJvcik7XHJcblxyXG4gICAgLy8gTG9nIGZhaWxlZCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZCAmJiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnblJlcXVlc3Q/LmFkZHJlc3MgfHwgJ2xlZGdlcicsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCB8fCAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ2hhcmR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVqZWN0KGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHNpZ24gcmVxdWVzdCBkZXRhaWxzIChmb3IgcG9wdXApXHJcbmZ1bmN0aW9uIGdldFNpZ25SZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGNvbnN0IGVudHJ5ID0gcGVuZGluZ1NpZ25SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuICBpZiAoIWVudHJ5KSByZXR1cm4gbnVsbDtcclxuICAvLyBPbmx5IHNoaXAgZGlzcGxheSBkYXRhIHRvIHRoZSBwb3B1cCAtIHRoZSBsaXZlIHJlc29sdmUvcmVqZWN0IGZ1bmN0aW9uc1xyXG4gIC8vIGFuZCB0aGUgb25lLXRpbWUgYXBwcm92YWxUb2tlbiBzdGF5IGluIHRoZSBiYWNrZ3JvdW5kXHJcbiAgY29uc3QgeyBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QgfSA9IGVudHJ5O1xyXG4gIHJldHVybiB7IG9yaWdpbiwgbWV0aG9kLCBzaWduUmVxdWVzdCB9O1xyXG59XHJcblxyXG4vLyBMaXN0ZW4gZm9yIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRzIGFuZCBwb3B1cFxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgLy8gUmVjZWl2ZWQgbWVzc2FnZVxyXG5cclxuICAvLyBTRUNVUklUWTogRGVmaW5lIG1lc3NhZ2UgdHlwZXMgdGhhdCBhcmUgcHJpdmlsZWdlZCAocG9wdXAtb25seSkuXHJcbiAgLy8gVGhlc2UgbXVzdCBOT1QgYmUgY2FsbGFibGUgZnJvbSBjb250ZW50IHNjcmlwdHMgKHdoaWNoIHJ1biBvbiBhcmJpdHJhcnkgd2ViIHBhZ2VzKS5cclxuICAvLyBBcHByb3ZhbCBwb3B1cHMgYXJlIG9wZW5lZCB2aWEgY2hyb21lLndpbmRvd3MuY3JlYXRlLCBzbyB0aGV5IGRvIGhhdmUgc2VuZGVyLnRhYiDigJRcclxuICAvLyBkaXN0aW5ndWlzaCB0aGVtIGZyb20gY29udGVudCBzY3JpcHRzIGJ5IGNoZWNraW5nIHNlbmRlci51cmwgYWdhaW5zdCBvdXIgZXh0ZW5zaW9uIG9yaWdpbi5cclxuICBjb25zdCBQUklWSUxFR0VEX01FU1NBR0VTID0gbmV3IFNldChbXHJcbiAgICAnQ09OTkVDVElPTl9BUFBST1ZBTCcsICdUUkFOU0FDVElPTl9BUFBST1ZBTCcsICdTSUdOX0FQUFJPVkFMJywgJ1NJR05fQVBQUk9WQUxfTEVER0VSJyxcclxuICAgICdUT0tFTl9BRERfQVBQUk9WQUwnLCAnQ0hBSU5fU1dJVENIX0FQUFJPVkFMJywgJ0NSRUFURV9TRVNTSU9OJywgJ0lOVkFMSURBVEVfU0VTU0lPTicsICdJTlZBTElEQVRFX0FMTF9TRVNTSU9OUycsXHJcbiAgICAnRElTQ09OTkVDVF9TSVRFJywgJ1NBVkVfVFgnLCAnU0FWRV9BTkRfTU9OSVRPUl9UWCcsICdDTEVBUl9UWF9ISVNUT1JZJyxcclxuICAgICdTUEVFRF9VUF9UWCcsICdDQU5DRUxfVFgnLCAnU1BFRURfVVBfVFhfQ09NUExFVEUnLCAnQ0FOQ0VMX1RYX0NPTVBMRVRFJyxcclxuICAgICdHRVRfU0lHTklOR19BVURJVF9MT0cnLCAnR0VUX1RYX0hJU1RPUlknLCAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnLCAnR0VUX1BFTkRJTkdfVFhTJyxcclxuICAgICdHRVRfVFhfQllfSEFTSCcsICdSRUZSRVNIX1RYX1NUQVRVUycsICdSRUJST0FEQ0FTVF9UWCcsICdHRVRfQ1VSUkVOVF9HQVNfUFJJQ0UnLCAnQUNUSVZFX1dBTExFVF9DSEFOR0VEJyxcclxuICAgICdORVRXT1JLX0NIQU5HRUQnLFxyXG4gICAgJ0dFVF9DT05ORUNUSU9OX1JFUVVFU1QnLCAnR0VUX0NPTk5FQ1RFRF9TSVRFUycsICdHRVRfVFJBTlNBQ1RJT05fUkVRVUVTVCcsXHJcbiAgICAnR0VUX1NJR05fUkVRVUVTVCcsICdHRVRfVE9LRU5fQUREX1JFUVVFU1QnLCAnR0VUX0NIQUlOX1NXSVRDSF9SRVFVRVNUJ1xyXG4gIF0pO1xyXG5cclxuICBjb25zdCBleHRlbnNpb25PcmlnaW4gPSBgY2hyb21lLWV4dGVuc2lvbjovLyR7Y2hyb21lLnJ1bnRpbWUuaWR9L2A7XHJcbiAgY29uc3QgaXNGcm9tRXh0ZW5zaW9uUGFnZSA9IHR5cGVvZiBzZW5kZXIudXJsID09PSAnc3RyaW5nJyAmJiBzZW5kZXIudXJsLnN0YXJ0c1dpdGgoZXh0ZW5zaW9uT3JpZ2luKTtcclxuXHJcbiAgaWYgKFBSSVZJTEVHRURfTUVTU0FHRVMuaGFzKG1lc3NhZ2UudHlwZSkgJiYgIWlzRnJvbUV4dGVuc2lvblBhZ2UpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBTRUNVUklUWTogQmxvY2tlZCBwcml2aWxlZ2VkIG1lc3NhZ2UgZnJvbSBjb250ZW50IHNjcmlwdDonLCBtZXNzYWdlLnR5cGUsIHNlbmRlci51cmwpO1xyXG4gICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5hdXRob3JpemVkOiBwcml2aWxlZ2VkIG1lc3NhZ2VzIG11c3QgY29tZSBmcm9tIGV4dGVuc2lvbiBwYWdlcycgfSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIChhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ1dBTExFVF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZVdhbGxldFJlcXVlc3QobWVzc2FnZSwgc2VuZGVyKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NPTk5FQ1RJT05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgYXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyBhcHByb3ZhbCByZXNwb25zZVxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ09OTkVDVElPTl9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHJlcXVlc3RJbmZvID0gZ2V0Q29ubmVjdGlvblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyBjb25uZWN0aW9uIHJlcXVlc3QgaW5mb1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ09OTkVDVEVEX1NJVEVTJzpcclxuICAgICAgICAgIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgY29ubmVjdGVkIHNpdGVzJyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBzaXRlcyB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdESVNDT05ORUNUX1NJVEUnOlxyXG4gICAgICAgICAgYXdhaXQgcmVtb3ZlQ29ubmVjdGVkU2l0ZShtZXNzYWdlLm9yaWdpbik7XHJcbiAgICAgICAgICBhd2FpdCBub3RpZnlBY2NvdW50c0NoYW5nZWQoKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgZGlzY29ubmVjdCBjb25maXJtYXRpb25cclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQUNUSVZFX1dBTExFVF9DSEFOR0VEJzpcclxuICAgICAgICAgIGF3YWl0IG5vdGlmeUFjY291bnRzQ2hhbmdlZCgpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdORVRXT1JLX0NIQU5HRUQnOiB7XHJcbiAgICAgICAgICAvLyBVc2VyIHN3aXRjaGVkIG5ldHdvcmtzIGluIHRoZSBwb3B1cCBVSTsgdGVsbCBjb25uZWN0ZWQgZEFwcHNcclxuICAgICAgICAgIGNvbnN0IG5ld0NoYWluSWQgPSBDSEFJTl9JRFNbbWVzc2FnZS5uZXR3b3JrXTtcclxuICAgICAgICAgIGlmIChuZXdDaGFpbklkKSB7XHJcbiAgICAgICAgICAgIG5vdGlmeUNoYWluQ2hhbmdlZChuZXdDaGFpbklkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgJ1RSQU5TQUNUSU9OX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHR4QXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkLCBtZXNzYWdlLnNlc3Npb25Ub2tlbiwgbWVzc2FnZS5nYXNQcmljZSwgbWVzc2FnZS5jdXN0b21Ob25jZSwgbWVzc2FnZS50eEhhc2gsIG1lc3NhZ2UudHhEZXRhaWxzKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eEFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDUkVBVEVfU0VTU0lPTic6XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uVG9rZW4gPSBhd2FpdCBjcmVhdGVTZXNzaW9uKG1lc3NhZ2UucGFzc3dvcmQsIG1lc3NhZ2Uud2FsbGV0SWQsIG1lc3NhZ2UuZHVyYXRpb25Ncyk7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNlc3Npb25Ub2tlbiB9KTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX1NFU1NJT04nOlxyXG4gICAgICAgICAgY29uc3QgaW52YWxpZGF0ZWQgPSBpbnZhbGlkYXRlU2Vzc2lvbihtZXNzYWdlLnNlc3Npb25Ub2tlbik7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBpbnZhbGlkYXRlZCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX0FMTF9TRVNTSU9OUyc6XHJcbiAgICAgICAgICBjb25zdCBjb3VudCA9IGludmFsaWRhdGVBbGxTZXNzaW9ucygpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgdHhSZXF1ZXN0SW5mbyA9IGdldFRyYW5zYWN0aW9uUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRyYW5zYWN0aW9uIHJlcXVlc3QgaW5mbzonLCB0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdUT0tFTl9BRERfQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgdG9rZW5BcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVRva2VuQWRkQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgYXBwcm92YWwgcmVzcG9uc2U6JywgdG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0hBSU5fU1dJVENIX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IGNoYWluU3dpdGNoUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ2hhaW5Td2l0Y2hBcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoY2hhaW5Td2l0Y2hSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NJR05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnbkFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlU2lnbkFwcHJvdmFsKFxyXG4gICAgICAgICAgICBtZXNzYWdlLnJlcXVlc3RJZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5hcHByb3ZlZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHNpZ24gYXBwcm92YWwgcmVzcG9uc2U6Jywgc2lnbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzaWduQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NJR05fQVBQUk9WQUxfTEVER0VSJzpcclxuICAgICAgICAgIGNvbnN0IGxlZGdlclNpZ25SZXN1bHQgPSBhd2FpdCBoYW5kbGVMZWRnZXJTaWduQXBwcm92YWwoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UucmVxdWVzdElkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFwcHJvdmVkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNpZ25hdHVyZVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgTGVkZ2VyIHNpZ24gYXBwcm92YWwgcmVzcG9uc2U6JywgbGVkZ2VyU2lnblJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UobGVkZ2VyU2lnblJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1NJR05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCBzaWduUmVxdWVzdEluZm8gPSBnZXRTaWduUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHNpZ24gcmVxdWVzdCBpbmZvOicsIHNpZ25SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoc2lnblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVE9LRU5fQUREX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgdG9rZW5SZXF1ZXN0SW5mbyA9IGdldFRva2VuQWRkUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRva2VuIGFkZCByZXF1ZXN0IGluZm86JywgdG9rZW5SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodG9rZW5SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NIQUlOX1NXSVRDSF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IGNoYWluU3dpdGNoSW5mbyA9IGF3YWl0IGdldENoYWluU3dpdGNoUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoY2hhaW5Td2l0Y2hJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAvLyBTaWduaW5nIEF1ZGl0IExvZ1xyXG4gICAgICAgIGNhc2UgJ0dFVF9TSUdOSU5HX0FVRElUX0xPRyc6XHJcbiAgICAgICAgICBjb25zdCBzaWduaW5nTG9nID0gYXdhaXQgZ2V0U2lnbmluZ0F1ZGl0TG9nKCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBsb2c6IHNpZ25pbmdMb2cgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy8gVHJhbnNhY3Rpb24gSGlzdG9yeVxyXG4gICAgICAgIGNhc2UgJ0dFVF9UWF9ISVNUT1JZJzpcclxuICAgICAgICAgIGNvbnN0IHR4SGlzdG9yeUxpc3QgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhIaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbnM6IHR4SGlzdG9yeUxpc3QgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnOlxyXG4gICAgICAgICAgY29uc3QgcGVuZGluZ0NvdW50ID0gYXdhaXQgdHhIaXN0b3J5LmdldFBlbmRpbmdUeENvdW50KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBjb3VudDogcGVuZGluZ0NvdW50IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9QRU5ESU5HX1RYUyc6XHJcbiAgICAgICAgICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgdHhIaXN0b3J5LmdldFBlbmRpbmdUeHMobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uczogcGVuZGluZ1R4cyB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVFhfQllfSEFTSCc6XHJcbiAgICAgICAgICBjb25zdCB0eERldGFpbCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHhIYXNoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uOiB0eERldGFpbCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTQVZFX1RYJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHJhbnNhY3Rpb24pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTQVZFX0FORF9NT05JVE9SX1RYJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHJhbnNhY3Rpb24pO1xyXG5cclxuICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgZm9yIGNvbmZpcm1hdGlvbiBpbiBiYWNrZ3JvdW5kXHJcbiAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBtZXNzYWdlLnRyYW5zYWN0aW9uLm5ldHdvcmsgfHwgREVGQVVMVF9ORVRXT1JLO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHR4ID0geyBoYXNoOiBtZXNzYWdlLnRyYW5zYWN0aW9uLmhhc2ggfTtcclxuICAgICAgICAgICAgICBhd2FpdCB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgbWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBtb25pdG9yaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NMRUFSX1RYX0hJU1RPUlknOlxyXG4gICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LmNsZWFyVHhIaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DVVJSRU5UX0dBU19QUklDRSc6XHJcbiAgICAgICAgICBjb25zdCBnYXNQcmljZVJlc3VsdCA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrR2FzUHJpY2UobWVzc2FnZS5uZXR3b3JrKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShnYXNQcmljZVJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnUkVGUkVTSF9UWF9TVEFUVVMnOlxyXG4gICAgICAgICAgY29uc3QgcmVmcmVzaFJlc3VsdCA9IGF3YWl0IHJlZnJlc2hUcmFuc2FjdGlvblN0YXR1cyhcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5uZXR3b3JrXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlZnJlc2hSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1JFQlJPQURDQVNUX1RYJzpcclxuICAgICAgICAgIGNvbnN0IHJlYnJvYWRjYXN0UmVzdWx0ID0gYXdhaXQgcmVicm9hZGNhc3RUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UubmV0d29ya1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZWJyb2FkY2FzdFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU1BFRURfVVBfVFgnOlxyXG4gICAgICAgICAgY29uc3Qgc3BlZWRVcFJlc3VsdCA9IGF3YWl0IGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuZ2FzUHJpY2VNdWx0aXBsaWVyIHx8IDEuMixcclxuICAgICAgICAgICAgbWVzc2FnZS5jdXN0b21HYXNQcmljZSB8fCBudWxsXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNwZWVkVXBSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NBTkNFTF9UWCc6XHJcbiAgICAgICAgICBjb25zdCBjYW5jZWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuY3VzdG9tR2FzUHJpY2UgfHwgbnVsbFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShjYW5jZWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NQRUVEX1VQX1RYX0NPTVBMRVRFJzpcclxuICAgICAgICAgIC8vIFRyYW5zYWN0aW9uIHdhcyBhbHJlYWR5IHNpZ25lZCBhbmQgYnJvYWRjYXN0IGluIHBvcHVwIC0ganVzdCBzYXZlIHRvIGhpc3RvcnlcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2F2ZSBuZXcgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgICAgICAgICBjb25zdCBoaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgICAgICAgICAgaGFzaDogbWVzc2FnZS5uZXdUeEhhc2gsXHJcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICAgIGZyb206IG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgICB0bzogbWVzc2FnZS50eERldGFpbHMudG8sXHJcbiAgICAgICAgICAgICAgdmFsdWU6IG1lc3NhZ2UudHhEZXRhaWxzLnZhbHVlLFxyXG4gICAgICAgICAgICAgIGRhdGE6IG1lc3NhZ2UudHhEZXRhaWxzLmRhdGEgfHwgJzB4JyxcclxuICAgICAgICAgICAgICBnYXNQcmljZTogbWVzc2FnZS50eERldGFpbHMuZ2FzUHJpY2UsXHJcbiAgICAgICAgICAgICAgZ2FzTGltaXQ6IG1lc3NhZ2UudHhEZXRhaWxzLmdhc0xpbWl0LFxyXG4gICAgICAgICAgICAgIG5vbmNlOiBtZXNzYWdlLnR4RGV0YWlscy5ub25jZSxcclxuICAgICAgICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICAgICAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICAgICAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICAgICAgICAgIHR5cGU6IHR4SGlzdG9yeS5UWF9UWVBFUy5DT05UUkFDVFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heEZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICAgICAgaGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIGhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgICAgICAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIHJlcGxhY2VkXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2Uub3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgbmV3IHRyYW5zYWN0aW9uXHJcbiAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICAgICAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHsgaGFzaDogbWVzc2FnZS5uZXdUeEhhc2ggfSwgcHJvdmlkZXIsIG1lc3NhZ2UuYWRkcmVzcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZmljYXRpb25cclxuICAgICAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU3BlZCBVcCcsXHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogYE5ldyBUWDogJHttZXNzYWdlLm5ld1R4SGFzaC5zbGljZSgwLCAyMCl9Li4uYCxcclxuICAgICAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogbWVzc2FnZS5uZXdUeEhhc2ggfSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzYXZpbmcgc3BlZWQtdXAgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0FOQ0VMX1RYX0NPTVBMRVRFJzpcclxuICAgICAgICAgIC8vIENhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiB3YXMgYWxyZWFkeSBzaWduZWQgYW5kIGJyb2FkY2FzdCBpbiBwb3B1cCAtIGp1c3Qgc2F2ZSB0byBoaXN0b3J5XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnlcclxuICAgICAgICAgICAgY29uc3QgY2FuY2VsSGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICAgICAgICAgIGhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoLFxyXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgICAgICAgICBmcm9tOiBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgdG86IG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgICB2YWx1ZTogJzAnLFxyXG4gICAgICAgICAgICAgIGRhdGE6ICcweCcsXHJcbiAgICAgICAgICAgICAgZ2FzUHJpY2U6IG1lc3NhZ2UudHhEZXRhaWxzLmdhc1ByaWNlLFxyXG4gICAgICAgICAgICAgIGdhc0xpbWl0OiAnMjEwMDAnLFxyXG4gICAgICAgICAgICAgIG5vbmNlOiBtZXNzYWdlLnR4RGV0YWlscy5ub25jZSxcclxuICAgICAgICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICAgICAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICAgICAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdzZW5kJ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heEZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsSGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIGNhbmNlbEhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgICAgICAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIGNhbmNlbGxlZC9mYWlsZWRcclxuICAgICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS5vcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3RhcnQgbW9uaXRvcmluZyBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb25cclxuICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgICAgICAgIHdhaXRGb3JDb25maXJtYXRpb24oeyBoYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCB9LCBwcm92aWRlciwgbWVzc2FnZS5hZGRyZXNzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE5vdGlmaWNhdGlvblxyXG4gICAgICAgICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBDYW5jZWxsZWQnLFxyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdDYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gc2VudCcsXHJcbiAgICAgICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoIH0pO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2F2aW5nIGNhbmNlbCB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdVUERBVEVfUlBDX1BSSU9SSVRJRVMnOlxyXG4gICAgICAgICAgLy8gVXBkYXRlIFJQQyBwcmlvcml0aWVzIGluIHRoZSBycGMgbW9kdWxlXHJcbiAgICAgICAgICBpZiAobWVzc2FnZS5uZXR3b3JrICYmIG1lc3NhZ2UucHJpb3JpdGllcykge1xyXG4gICAgICAgICAgICBycGMudXBkYXRlUnBjUHJpb3JpdGllcyhtZXNzYWdlLm5ldHdvcmssIG1lc3NhZ2UucHJpb3JpdGllcyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDwn6uAIFVwZGF0ZWQgUlBDIHByaW9yaXRpZXMgZm9yICR7bWVzc2FnZS5uZXR3b3JrfWApO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTWlzc2luZyBuZXR3b3JrIG9yIHByaW9yaXRpZXMnIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBVbmtub3duIG1lc3NhZ2UgdHlwZTonLCBtZXNzYWdlLnR5cGUpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5rbm93biBtZXNzYWdlIHR5cGUnIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGhhbmRsaW5nIG1lc3NhZ2U6JywgZXJyb3IpO1xyXG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICB9XHJcbiAgfSkoKTtcclxuXHJcbiAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlXHJcbn0pO1xyXG5cclxuY29uc29sZS5sb2coJ/Cfq4AgSGVhcnRXYWxsZXQgc2VydmljZSB3b3JrZXIgcmVhZHknKTtcclxuIl0sIm5hbWVzIjpbImV0aGVycy5nZXRBZGRyZXNzIiwiZXRoZXJzLmdldEJ5dGVzIiwiZXRoZXJzLmlzQWRkcmVzcyIsInJwYy5nZXRCbG9ja051bWJlciIsInJwYy5nZXRCbG9ja0J5TnVtYmVyIiwicnBjLmdldEJhbGFuY2UiLCJycGMuZ2V0VHJhbnNhY3Rpb25Db3VudCIsInJwYy5nZXRHYXNQcmljZSIsInJwYy5lc3RpbWF0ZUdhcyIsInJwYy5jYWxsIiwicnBjLmJyb2FkY2FzdFRvQWxsUnBjcyIsInJwYy5nZXRUcmFuc2FjdGlvblJlY2VpcHQiLCJycGMuZ2V0VHJhbnNhY3Rpb25CeUhhc2giLCJycGMuZ2V0UHJvdmlkZXIiLCJjYWNoZSIsInR4SGlzdG9yeS5UWF9TVEFUVVMiLCJ0eEhpc3RvcnkuVFhfVFlQRVMiLCJ0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkiLCJycGMuZ2V0RWlwMTU1OUZlZXMiLCJycGMuc2VuZFRyYW5zYWN0aW9uUmVzaWxpZW50IiwidHhIaXN0b3J5LmdldFR4QnlIYXNoIiwicnBjLmdldEJhc2VGZWUiLCJ0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMiLCJycGMuZ2V0R2FzUHJpY2VSZWNvbW1lbmRhdGlvbnMiLCJycGMuZ2V0UmF3VHJhbnNhY3Rpb24iLCJ0eEhpc3RvcnkuZ2V0VHhIaXN0b3J5IiwidHhIaXN0b3J5LmdldFBlbmRpbmdUeENvdW50IiwidHhIaXN0b3J5LmdldFBlbmRpbmdUeHMiLCJ0eEhpc3RvcnkuY2xlYXJUeEhpc3RvcnkiLCJycGMudXBkYXRlUnBjUHJpb3JpdGllcyJdLCJtYXBwaW5ncyI6IjtBQVFBLE1BQU0saUJBQWlCO0FBQ3ZCLE1BQU0sMEJBQTBCO0FBQ2hDLE1BQU0sc0JBQXNCO0FBR3JCLE1BQU0sV0FBVztBQUFBLEVBRXRCLFVBQVU7QUFFWjtBQUdPLE1BQU0sWUFBWTtBQUFBLEVBQ3ZCLFNBQVM7QUFBQSxFQUNULFdBQVc7QUFBQSxFQUNYLFFBQVE7QUFDVjtBQUtPLGVBQWUsdUJBQXVCO0FBQzNDLFFBQU0sV0FBVyxNQUFNLEtBQUssdUJBQXVCO0FBQ25ELFNBQU8sWUFBWTtBQUFBLElBQ2pCLFNBQVM7QUFBQTtBQUFBLElBQ1QsYUFBYTtBQUFBO0FBQUEsRUFDakI7QUFDQTtBQUtBLGVBQWUsZ0JBQWdCO0FBQzdC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
