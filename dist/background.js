import { l as load, s as save, a as getAddress, H as getBytes, J as toUtf8String, i as isAddress, N as updateRpcPriorities, g as getProvider, u as unlockWallet, O as secureCleanup, P as secureCleanupSigner, Q as getRawTransaction, R as broadcastToAllRpcs, E as getGasPriceRecommendations, d as getActiveWallet, x as getEip1559Fees, U as getTransactionByHash, V as getTransactionReceipt, W as sendRawTransaction, y as getGasPrice, F as estimateGas, X as call, t as getTransactionCount, q as getBalance, Y as getBlockByNumber, Z as getBlockNumber } from "./rpc.js";
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
        const bytes = getBytes(message);
        messageToSign = toUtf8String(bytes);
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
  "pulsechainTestnet": "0x3AF",
  // 943
  "pulsechain": "0x171",
  // 369
  "ethereum": "0x1",
  // 1
  "sepolia": "0xAA36A7"
  // 11155111
};
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
  return CHAIN_IDS[network || "pulsechainTestnet"];
}
const PUBLIC_METHODS = /* @__PURE__ */ new Set([
  "eth_chainId",
  "net_version",
  "eth_accounts",
  "eth_requestAccounts"
]);
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
    return { error: { code: -32603, message: error.message } };
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
  const supportedChains = {
    "0x3af": true,
    "0x3AF": true,
    "0x171": true,
    "0x1": true,
    "0xaa36a7": true,
    "0xAA36A7": true
  };
  if (supportedChains[chainInfo.chainId]) {
    return await handleSwitchChain([{ chainId: chainInfo.chainId }], origin);
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
    reject(new Error("User rejected chain switch"));
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
  const currentNetwork = await load("currentNetwork") || "pulsechain";
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
    reject(new Error("User rejected transaction"));
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
    reject(new Error("User rejected the request"));
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
    reject(new Error("User rejected the request"));
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
  return pendingSignRequests.get(requestId);
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
              const network = message.transaction.network || "pulsechainTestnet";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRBbGxIaXN0b3J5KCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBsb2FkKFRYX0hJU1RPUllfS0VZKTtcclxuICByZXR1cm4gaGlzdG9yeSB8fCB7fTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpIHtcclxuICBhd2FpdCBzYXZlKFRYX0hJU1RPUllfS0VZLCBoaXN0b3J5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgYSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgdHhEYXRhKSB7XHJcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRUeEhpc3RvcnlTZXR0aW5ncygpO1xyXG4gIGlmICghc2V0dGluZ3MuZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuOyAvLyBIaXN0b3J5IGRpc2FibGVkXHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBhZGRyZXNzIGhpc3RvcnkgaWYgZG9lc24ndCBleGlzdFxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0gPSB7IHRyYW5zYWN0aW9uczogW10gfTtcclxuICB9XHJcblxyXG4gIC8vIEFkZCBuZXcgdHJhbnNhY3Rpb24gYXQgYmVnaW5uaW5nIChuZXdlc3QgZmlyc3QpXHJcbiAgY29uc3QgdHhFbnRyeSA9IHtcclxuICAgIGhhc2g6IHR4RGF0YS5oYXNoLFxyXG4gICAgdGltZXN0YW1wOiB0eERhdGEudGltZXN0YW1wIHx8IERhdGUubm93KCksXHJcbiAgICBmcm9tOiB0eERhdGEuZnJvbS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgdG86IHR4RGF0YS50byA/IHR4RGF0YS50by50b0xvd2VyQ2FzZSgpIDogbnVsbCxcclxuICAgIHZhbHVlOiB0eERhdGEudmFsdWUgfHwgJzAnLFxyXG4gICAgZGF0YTogdHhEYXRhLmRhdGEgfHwgJzB4JyxcclxuICAgIGdhc1ByaWNlOiB0eERhdGEuZ2FzUHJpY2UsXHJcbiAgICBnYXNMaW1pdDogdHhEYXRhLmdhc0xpbWl0LFxyXG4gICAgbm9uY2U6IHR4RGF0YS5ub25jZSxcclxuICAgIG5ldHdvcms6IHR4RGF0YS5uZXR3b3JrLFxyXG4gICAgc3RhdHVzOiB0eERhdGEuc3RhdHVzIHx8IFRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgYmxvY2tOdW1iZXI6IHR4RGF0YS5ibG9ja051bWJlciB8fCBudWxsLFxyXG4gICAgdHlwZTogdHhEYXRhLnR5cGUgfHwgVFhfVFlQRVMuQ09OVFJBQ1RcclxuICB9O1xyXG5cclxuICAvLyBTdG9yZSBFSVAtMTU1OSBmaWVsZHMgaWYgcHJlc2VudCAoZm9yIHByb3BlciBzcGVlZC11cC9jYW5jZWwpXHJcbiAgaWYgKHR4RGF0YS5tYXhGZWVQZXJHYXMpIHtcclxuICAgIHR4RW50cnkubWF4RmVlUGVyR2FzID0gdHhEYXRhLm1heEZlZVBlckdhcztcclxuICB9XHJcbiAgaWYgKHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgdHhFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICB9XHJcblxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMudW5zaGlmdCh0eEVudHJ5KTtcclxuXHJcbiAgLy8gRW5mb3JjZSBtYXggbGltaXQgKEZJRk8gLSByZW1vdmUgb2xkZXN0KVxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLmxlbmd0aCA+IE1BWF9UWFNfUEVSX0FERFJFU1MpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgPSBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLnNsaWNlKDAsIE1BWF9UWFNfUEVSX0FERFJFU1MpO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZUFsbEhpc3RvcnkoaGlzdG9yeSk7XHJcbiAgLy8gVHJhbnNhY3Rpb24gYWRkZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIHN0YXR1cywgYmxvY2tOdW1iZXIgPSBudWxsKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eEluZGV4ID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5maW5kSW5kZXgoXHJcbiAgICB0eCA9PiB0eC5oYXNoLnRvTG93ZXJDYXNlKCkgPT09IHR4SGFzaC50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuXHJcbiAgaWYgKHR4SW5kZXggPT09IC0xKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLnN0YXR1cyA9IHN0YXR1cztcclxuICBpZiAoYmxvY2tOdW1iZXIgIT09IG51bGwpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnNbdHhJbmRleF0uYmxvY2tOdW1iZXIgPSBibG9ja051bWJlcjtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbnMgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhzKGFkZHJlc3MpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maWx0ZXIodHggPT4gdHguc3RhdHVzID09PSBUWF9TVEFUVVMuUEVORElORyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbiBjb3VudCBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdUeENvdW50KGFkZHJlc3MpIHtcclxuICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKTtcclxuICByZXR1cm4gcGVuZGluZ1R4cy5sZW5ndGg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFR4QnlIYXNoKGFkZHJlc3MsIHR4SGFzaCkge1xyXG4gIGNvbnN0IHR4cyA9IGF3YWl0IGdldFR4SGlzdG9yeShhZGRyZXNzKTtcclxuICByZXR1cm4gdHhzLmZpbmQodHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyVHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKGhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgZGVsZXRlIGhpc3RvcnlbYWRkcmVzc0xvd2VyXTtcclxuICAgIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbiAgfVxyXG59XHJcblxyXG4iLCIvKipcclxuICogY29yZS90eFZhbGlkYXRpb24uanNcclxuICpcclxuICogVHJhbnNhY3Rpb24gdmFsaWRhdGlvbiB1dGlsaXRpZXMgZm9yIHNlY3VyaXR5XHJcbiAqIFZhbGlkYXRlcyBhbGwgdHJhbnNhY3Rpb24gcGFyYW1ldGVycyBiZWZvcmUgcHJvY2Vzc2luZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgdHJhbnNhY3Rpb24gcmVxdWVzdCBmcm9tIGEgZEFwcFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHhSZXF1ZXN0IC0gVHJhbnNhY3Rpb24gcmVxdWVzdCBvYmplY3RcclxuICogQHBhcmFtIHtudW1iZXJ8bnVsbH0gbWF4R2FzUHJpY2VHd2VpIC0gTWF4aW11bSBhbGxvd2VkIGdhcyBwcmljZSBpbiBHd2VpIChkZWZhdWx0IDEwMDApLlxyXG4gKiAgICAgICAgUGFzcyBudWxsIHRvIHNraXAgdGhlIGdhcyBwcmljZSBib3VuZCBlbnRpcmVseSAtIG9ubHkgYXBwcm9wcmlhdGUgd2hlbiB0aGVcclxuICogICAgICAgIGNhbGxlciBnZW51aW5lbHkgY2Fubm90IGRldGVybWluZSB0aGUgbmV0d29yayBwcmljZSwgc2luY2UgdGhlIGFsdGVybmF0aXZlIGlzXHJcbiAqICAgICAgICBhbiBhcmJpdHJhcnkgaW52ZW50ZWQgY29uc3RhbnQuXHJcbiAqIEByZXR1cm5zIHt7IHZhbGlkOiBib29sZWFuLCBlcnJvcnM6IHN0cmluZ1tdLCBzYW5pdGl6ZWQ6IE9iamVjdCB9fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0KHR4UmVxdWVzdCwgbWF4R2FzUHJpY2VHd2VpID0gMTAwMCkge1xyXG4gIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gIGNvbnN0IHNhbml0aXplZCA9IHt9O1xyXG5cclxuICAvLyBWYWxpZGF0ZSAndG8nIGFkZHJlc3MgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QudG8gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudG8gIT09IG51bGwpIHtcclxuICAgIGlmICh0eXBlb2YgdHhSZXF1ZXN0LnRvICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC50bykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTm9ybWFsaXplIHRvIGNoZWNrc3VtIGFkZHJlc3NcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQudG8gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QudG8pO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2Zyb20nIGFkZHJlc3MgaWYgcHJlc2VudCAoc2hvdWxkIG1hdGNoIHdhbGxldCBhZGRyZXNzKVxyXG4gIGlmICh0eFJlcXVlc3QuZnJvbSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5mcm9tICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5mcm9tICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleEFkZHJlc3ModHhSZXF1ZXN0LmZyb20pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQuZnJvbSA9IGV0aGVycy5nZXRBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3ZhbHVlJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QudmFsdWUgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudmFsdWUgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC52YWx1ZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB2YWx1ZUJpZ0ludCA9IEJpZ0ludCh0eFJlcXVlc3QudmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZUJpZ0ludCA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQudmFsdWUgPSB0eFJlcXVlc3QudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHNhbml0aXplZC52YWx1ZSA9ICcweDAnOyAvLyBEZWZhdWx0IHRvIDBcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdkYXRhJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5kYXRhICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5kYXRhICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleERhdGEodHhSZXF1ZXN0LmRhdGEpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImRhdGFcIiBmaWVsZCBtdXN0IGJlIHZhbGlkIGhleCBkYXRhJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzYW5pdGl6ZWQuZGF0YSA9IHR4UmVxdWVzdC5kYXRhO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQuZGF0YSA9ICcweCc7IC8vIERlZmF1bHQgdG8gZW1wdHkgZGF0YVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2dhcycgb3IgJ2dhc0xpbWl0JyBmaWVsZFxyXG4gIC8vIFNFQ1VSSVRZOiBSZWFzb25hYmxlIG1heGltdW0gaXMgMTBNIGdhcyB0byBwcmV2ZW50IGZlZSBzY2Ftc1xyXG4gIC8vIE1vc3QgdHJhbnNhY3Rpb25zOiAyMWstMjAwayBnYXMuIENvbXBsZXggRGVGaTogMjAway0xTSBnYXMuXHJcbiAgLy8gRXRoZXJldW0vUHVsc2VDaGFpbiBibG9jayBsaW1pdCBpcyB+MzBNLCBidXQgc2luZ2xlIFRYIHJhcmVseSBuZWVkcyA+MTBNXHJcbiAgaWYgKHR4UmVxdWVzdC5nYXMgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNMaW1pdCA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzKTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBsb3cgKG1pbmltdW0gMjEwMDApJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnYXNMaW1pdCA+IDEwMDAwMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgbGltaXQgdG9vIGhpZ2ggKG1heGltdW0gMTAwMDAwMDApLiBNb3N0IHRyYW5zYWN0aW9ucyBuZWVkIDwxTSBnYXMuJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXMgPSB0eFJlcXVlc3QuZ2FzO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzTGltaXQgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzTGltaXQgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5nYXNMaW1pdCkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNMaW1pdCA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzTGltaXQpO1xyXG4gICAgICAgIGlmIChnYXNMaW1pdCA8IDIxMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAxMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGhpZ2ggKG1heGltdW0gMTAwMDAwMDApLiBNb3N0IHRyYW5zYWN0aW9ucyBuZWVkIDwxTSBnYXMuJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNMaW1pdCA9IHR4UmVxdWVzdC5nYXNMaW1pdDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdnYXNQcmljZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzUHJpY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzUHJpY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5nYXNQcmljZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNQcmljZSA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzUHJpY2UpO1xyXG4gICAgICAgIGlmIChnYXNQcmljZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNQcmljZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobWF4R2FzUHJpY2VHd2VpICE9PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICBnYXNQcmljZSA+IEJpZ0ludChtYXhHYXNQcmljZUd3ZWkpICogQmlnSW50KCcxMDAwMDAwMDAwJykpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKGBJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZXhjZWVkcyBtYXhpbXVtIG9mICR7bWF4R2FzUHJpY2VHd2VpfSBHd2VpYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNQcmljZSA9IHR4UmVxdWVzdC5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdub25jZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5ub25jZSkgJiYgdHlwZW9mIHR4UmVxdWVzdC5ub25jZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIG9yIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJyBcclxuICAgICAgICAgID8gQmlnSW50KHR4UmVxdWVzdC5ub25jZSkgXHJcbiAgICAgICAgICA6IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpO1xyXG4gICAgICAgIGlmIChub25jZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9uY2UgPiBCaWdJbnQoJzkwMDcxOTkyNTQ3NDA5OTEnKSkgeyAvLyBKYXZhU2NyaXB0IHNhZmUgaW50ZWdlciBtYXhcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgdW5yZWFzb25hYmx5IGhpZ2gnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLm5vbmNlID0gdHhSZXF1ZXN0Lm5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gbXVzdCBoYXZlIGVpdGhlciAndG8nIG9yICdkYXRhJyAoY29udHJhY3QgY3JlYXRpb24pXHJcbiAgaWYgKCFzYW5pdGl6ZWQudG8gJiYgKCFzYW5pdGl6ZWQuZGF0YSB8fCBzYW5pdGl6ZWQuZGF0YSA9PT0gJzB4JykpIHtcclxuICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBtdXN0IGhhdmUgXCJ0b1wiIGFkZHJlc3Mgb3IgXCJkYXRhXCIgZm9yIGNvbnRyYWN0IGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnMsXHJcbiAgICBzYW5pdGl6ZWRcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIEV0aGVyZXVtIGFkZHJlc3MgKGhleCBmb3JtYXQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhZGRyZXNzIC0gQWRkcmVzcyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhBZGRyZXNzKGFkZHJlc3MpIHtcclxuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSA0MiBjaGFyYWN0ZXJzOiAweCArIDQwIGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdezQwfSQvLnRlc3QoYWRkcmVzcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBoZXggdmFsdWUgKGZvciBhbW91bnRzLCBnYXMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEhleCB2YWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBzdGFydCB3aXRoIDB4IGFuZCBjb250YWluIG9ubHkgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0rJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaGV4IGRhdGEgKGZvciB0cmFuc2FjdGlvbiBkYXRhIGZpZWxkKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIEhleCBkYXRhIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleERhdGEoZGF0YSkge1xyXG4gIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDB4IG9yIDB4IGZvbGxvd2VkIGJ5IGV2ZW4gbnVtYmVyIG9mIGhleCBkaWdpdHNcclxuICBpZiAoZGF0YSA9PT0gJzB4JykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSokLy50ZXN0KGRhdGEpICYmIGRhdGEubGVuZ3RoICUgMiA9PT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBhbiBlcnJvciBtZXNzYWdlIGZvciBzYWZlIGRpc3BsYXlcclxuICogUmVtb3ZlcyBhbnkgSFRNTCwgc2NyaXB0cywgYW5kIGNvbnRyb2wgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUVycm9yTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiA1MDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgNDk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGNvcmUvc2lnbmluZy5qc1xyXG4gKlxyXG4gKiBNZXNzYWdlIHNpZ25pbmcgZnVuY3Rpb25hbGl0eSBmb3IgRUlQLTE5MSBhbmQgRUlQLTcxMlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogU2lnbnMgYSBtZXNzYWdlIHVzaW5nIEVJUC0xOTEgKHBlcnNvbmFsX3NpZ24pXHJcbiAqIFRoaXMgcHJlcGVuZHMgXCJcXHgxOUV0aGVyZXVtIFNpZ25lZCBNZXNzYWdlOlxcblwiICsgbGVuKG1lc3NhZ2UpIHRvIHRoZSBtZXNzYWdlXHJcbiAqIGJlZm9yZSBzaWduaW5nLCB3aGljaCBwcmV2ZW50cyBzaWduaW5nIGFyYml0cmFyeSB0cmFuc2FjdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBzaWduIChoZXggc3RyaW5nIG9yIFVURi04IHN0cmluZylcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBlcnNvbmFsU2lnbihzaWduZXIsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25NZXNzYWdlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWQsIGRlY29kZSBpdCBmaXJzdFxyXG4gICAgLy8gZXRoZXJzLmpzIHNpZ25NZXNzYWdlIGV4cGVjdHMgYSBzdHJpbmcgb3IgVWludDhBcnJheVxyXG4gICAgbGV0IG1lc3NhZ2VUb1NpZ24gPSBtZXNzYWdlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIC8vIEl0J3MgYSBoZXggc3RyaW5nLCBjb252ZXJ0IHRvIFVURi04XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gVHJ5IHRvIGRlY29kZSBhcyBoZXhcclxuICAgICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIElmIGRlY29kaW5nIGZhaWxzLCB1c2UgdGhlIGhleCBzdHJpbmcgYXMtaXNcclxuICAgICAgICAvLyBldGhlcnMgd2lsbCBoYW5kbGUgaXRcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gbWVzc2FnZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdGhlIG1lc3NhZ2UgKGV0aGVycy5qcyBhdXRvbWF0aWNhbGx5IGFwcGxpZXMgRUlQLTE5MSBmb3JtYXQpXHJcbiAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBzaWduZXIuc2lnbk1lc3NhZ2UobWVzc2FnZVRvU2lnbik7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiBtZXNzYWdlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2lnbnMgdHlwZWQgZGF0YSB1c2luZyBFSVAtNzEyXHJcbiAqIFVzZWQgYnkgZEFwcHMgZm9yIHN0cnVjdHVyZWQgZGF0YSBzaWduaW5nIChwZXJtaXRzLCBtZXRhLXRyYW5zYWN0aW9ucywgZXRjLilcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZERhdGEgLSBFSVAtNzEyIHR5cGVkIGRhdGEgb2JqZWN0IHdpdGggZG9tYWluLCB0eXBlcywgYW5kIG1lc3NhZ2VcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25UeXBlZERhdGEoc2lnbmVyLCB0eXBlZERhdGEpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25UeXBlZERhdGEgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaWduZXIgcHJvdmlkZWQnKTtcclxuICB9XHJcblxyXG4gIGlmICghdHlwZWREYXRhKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1R5cGVkIGRhdGEgaXMgcmVxdWlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHR5cGVkIGRhdGEgc3RydWN0dXJlXHJcbiAgaWYgKCF0eXBlZERhdGEuZG9tYWluIHx8ICF0eXBlZERhdGEudHlwZXMgfHwgIXR5cGVkRGF0YS5tZXNzYWdlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgRUlQLTcxMiB0eXBlZCBkYXRhOiBtaXNzaW5nIGRvbWFpbiwgdHlwZXMsIG9yIG1lc3NhZ2UnKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBFeHRyYWN0IHByaW1hcnlUeXBlIChpZiBub3QgcHJvdmlkZWQsIHRyeSB0byBpbmZlciBpdClcclxuICAgIGxldCBwcmltYXJ5VHlwZSA9IHR5cGVkRGF0YS5wcmltYXJ5VHlwZTtcclxuXHJcbiAgICBpZiAoIXByaW1hcnlUeXBlKSB7XHJcbiAgICAgIC8vIFRyeSB0byBpbmZlciBwcmltYXJ5IHR5cGUgZnJvbSB0eXBlcyBvYmplY3RcclxuICAgICAgLy8gSXQncyB0aGUgdHlwZSB0aGF0J3Mgbm90IFwiRUlQNzEyRG9tYWluXCJcclxuICAgICAgY29uc3QgdHlwZU5hbWVzID0gT2JqZWN0LmtleXModHlwZWREYXRhLnR5cGVzKS5maWx0ZXIodCA9PiB0ICE9PSAnRUlQNzEyRG9tYWluJyk7XHJcbiAgICAgIGlmICh0eXBlTmFtZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgcHJpbWFyeVR5cGUgPSB0eXBlTmFtZXNbMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgaW5mZXIgcHJpbWFyeVR5cGUgLSBwbGVhc2Ugc3BlY2lmeSBpdCBleHBsaWNpdGx5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBWYWxpZGF0ZSB0aGF0IHByaW1hcnlUeXBlIGV4aXN0cyBpbiB0eXBlc1xyXG4gICAgaWYgKCF0eXBlZERhdGEudHlwZXNbcHJpbWFyeVR5cGVdKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJpbWFyeSB0eXBlIFwiJHtwcmltYXJ5VHlwZX1cIiBub3QgZm91bmQgaW4gdHlwZXMgZGVmaW5pdGlvbmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdXNpbmcgZXRoZXJzLmpzIHNpZ25UeXBlZERhdGFcclxuICAgIC8vIGV0aGVycyB2NiB1c2VzOiBzaWduVHlwZWREYXRhKGRvbWFpbiwgdHlwZXMsIHZhbHVlKVxyXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2lnbmVyLnNpZ25UeXBlZERhdGEoXHJcbiAgICAgIHR5cGVkRGF0YS5kb21haW4sXHJcbiAgICAgIHR5cGVkRGF0YS50eXBlcyxcclxuICAgICAgdHlwZWREYXRhLm1lc3NhZ2VcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiB0eXBlZCBkYXRhOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAtIFJQQyBtZXRob2QgKHBlcnNvbmFsX3NpZ24sIGV0aF9zaWduVHlwZWREYXRhX3Y0LCBldGMuKVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwYXJhbXMgLSBSUEMgcGFyYW1ldGVyc1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSB7IHZhbGlkOiBib29sZWFuLCBlcnJvcj86IHN0cmluZywgc2FuaXRpemVkPzogT2JqZWN0IH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKSB7XHJcbiAgaWYgKCFtZXRob2QgfHwgIXBhcmFtcyB8fCAhQXJyYXkuaXNBcnJheShwYXJhbXMpKSB7XHJcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCByZXF1ZXN0IGZvcm1hdCcgfTtcclxuICB9XHJcblxyXG4gIHN3aXRjaCAobWV0aG9kKSB7XHJcbiAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduJzogLy8gTm90ZTogZXRoX3NpZ24gaXMgZGFuZ2Vyb3VzIGFuZCBzaG91bGQgc2hvdyBzdHJvbmcgd2FybmluZ1xyXG4gICAgICBpZiAocGFyYW1zLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXJzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtZXNzYWdlID0gcGFyYW1zWzBdO1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzFdO1xyXG5cclxuICAgICAgaWYgKCFtZXNzYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01lc3NhZ2UgaXMgZW1wdHknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYWRkcmVzcyB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyZXNzKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhbml0aXplIG1lc3NhZ2UgKGNvbnZlcnQgdG8gc3RyaW5nIGlmIG5lZWRlZClcclxuICAgICAgY29uc3Qgc2FuaXRpemVkTWVzc2FnZSA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IG1lc3NhZ2UgOiBTdHJpbmcobWVzc2FnZSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHNhbml0aXplZDoge1xyXG4gICAgICAgICAgbWVzc2FnZTogc2FuaXRpemVkTWVzc2FnZSxcclxuICAgICAgICAgIGFkZHJlc3M6IGV0aGVycy5nZXRBZGRyZXNzKGFkZHJlc3MpIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVycycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYWRkciA9IHBhcmFtc1swXTtcclxuICAgICAgbGV0IHR5cGVkRGF0YSA9IHBhcmFtc1sxXTtcclxuXHJcbiAgICAgIGlmICghYWRkciB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBhcnNlIHR5cGVkIGRhdGEgaWYgaXQncyBhIHN0cmluZ1xyXG4gICAgICBpZiAodHlwZW9mIHR5cGVkRGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdHlwZWREYXRhID0gSlNPTi5wYXJzZSh0eXBlZERhdGEpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgdHlwZWQgZGF0YSBmb3JtYXQnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWYWxpZGF0ZSB0eXBlZCBkYXRhIHN0cnVjdHVyZVxyXG4gICAgICBpZiAoIXR5cGVkRGF0YSB8fCB0eXBlb2YgdHlwZWREYXRhICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdUeXBlZCBkYXRhIG11c3QgYmUgYW4gb2JqZWN0JyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXR5cGVkRGF0YS5kb21haW4gfHwgIXR5cGVkRGF0YS50eXBlcyB8fCAhdHlwZWREYXRhLm1lc3NhZ2UpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnVHlwZWQgZGF0YSBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyAoZG9tYWluLCB0eXBlcywgbWVzc2FnZSknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsaWQ6IHRydWUsXHJcbiAgICAgICAgc2FuaXRpemVkOiB7XHJcbiAgICAgICAgICBhZGRyZXNzOiBldGhlcnMuZ2V0QWRkcmVzcyhhZGRyKSxcclxuICAgICAgICAgIHR5cGVkRGF0YTogdHlwZWREYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBVbnN1cHBvcnRlZCBzaWduaW5nIG1ldGhvZDogJHttZXRob2R9YCB9O1xyXG4gIH1cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGJhY2tncm91bmQvc2VydmljZS13b3JrZXIuanNcclxuICpcclxuICogQmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlciBmb3IgSGVhcnRXYWxsZXRcclxuICogSGFuZGxlcyBSUEMgcmVxdWVzdHMgZnJvbSBkQXBwcyBhbmQgbWFuYWdlcyB3YWxsZXQgc3RhdGVcclxuICovXHJcblxyXG5pbXBvcnQgeyBnZXRBY3RpdmVXYWxsZXQsIHVubG9ja1dhbGxldCwgc2VjdXJlQ2xlYW51cCwgc2VjdXJlQ2xlYW51cFNpZ25lciB9IGZyb20gJy4uL2NvcmUvd2FsbGV0LmpzJztcclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4uL2NvcmUvc3RvcmFnZS5qcyc7XHJcbmltcG9ydCAqIGFzIHJwYyBmcm9tICcuLi9jb3JlL3JwYy5qcyc7XHJcbmltcG9ydCAqIGFzIHR4SGlzdG9yeSBmcm9tICcuLi9jb3JlL3R4SGlzdG9yeS5qcyc7XHJcbmltcG9ydCB7IHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0LCBzYW5pdGl6ZUVycm9yTWVzc2FnZSB9IGZyb20gJy4uL2NvcmUvdHhWYWxpZGF0aW9uLmpzJztcclxuaW1wb3J0IHsgcGVyc29uYWxTaWduLCBzaWduVHlwZWREYXRhLCB2YWxpZGF0ZVNpZ25SZXF1ZXN0IH0gZnJvbSAnLi4vY29yZS9zaWduaW5nLmpzJztcclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8vIFNlcnZpY2Ugd29ya2VyIGxvYWRlZFxyXG5cclxuLy8gTmV0d29yayBjaGFpbiBJRHNcclxuY29uc3QgQ0hBSU5fSURTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6ICcweDNBRicsIC8vIDk0M1xyXG4gICdwdWxzZWNoYWluJzogJzB4MTcxJywgLy8gMzY5XHJcbiAgJ2V0aGVyZXVtJzogJzB4MScsIC8vIDFcclxuICAnc2Vwb2xpYSc6ICcweEFBMzZBNycgLy8gMTExNTUxMTFcclxufTtcclxuXHJcbmNvbnN0IE5FVFdPUktfTkFNRVMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ1B1bHNlQ2hhaW4gVGVzdG5ldCBWNCcsXHJcbiAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG59O1xyXG5cclxuY29uc3QgQ0hBSU5fSURfVE9fTkVUV09SSyA9IHtcclxuICAnMHgzYWYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICcweDE3MSc6ICdwdWxzZWNoYWluJyxcclxuICAnMHgxJzogJ2V0aGVyZXVtJyxcclxuICAnMHhhYTM2YTcnOiAnc2Vwb2xpYSdcclxufTtcclxuXHJcbi8vIFN0b3JhZ2Uga2V5c1xyXG5jb25zdCBDT05ORUNURURfU0lURVNfS0VZID0gJ2Nvbm5lY3RlZF9zaXRlcyc7XHJcblxyXG4vLyBQZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdHMgKG9yaWdpbiAtPiB7IHJlc29sdmUsIHJlamVjdCwgdGFiSWQgfSlcclxuY29uc3QgcGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyBjaGFpbiBzd2l0Y2ggcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBuZXR3b3JrS2V5LCBjaGFpbklkLCBhcHByb3ZhbFRva2VuIH0pXHJcbmNvbnN0IHBlbmRpbmdDaGFpblN3aXRjaGVzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gU0lHTklORyBBVURJVCBMT0cgPT09PT1cclxuLy8gU3RvcmVzIHJlY2VudCBzaWduaW5nIG9wZXJhdGlvbnMgZm9yIHNlY3VyaXR5IGF1ZGl0aW5nIChpbi1tZW1vcnksIGNsZWFyZWQgb24gc2VydmljZSB3b3JrZXIgcmVzdGFydClcclxuY29uc3QgU0lHTklOR19MT0dfS0VZID0gJ3NpZ25pbmdfYXVkaXRfbG9nJztcclxuY29uc3QgTUFYX1NJR05JTkdfTE9HX0VOVFJJRVMgPSAxMDA7XHJcblxyXG4vKipcclxuICogTG9nIGEgc2lnbmluZyBvcGVyYXRpb24gZm9yIGF1ZGl0IHB1cnBvc2VzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIExvZyBlbnRyeSBkZXRhaWxzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRyeS50eXBlIC0gVHlwZSBvZiBzaWduaW5nICh0cmFuc2FjdGlvbiwgcGVyc29uYWxfc2lnbiwgdHlwZWRfZGF0YSlcclxuICogQHBhcmFtIHtzdHJpbmd9IGVudHJ5LmFkZHJlc3MgLSBXYWxsZXQgYWRkcmVzcyB0aGF0IHNpZ25lZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkub3JpZ2luIC0gZEFwcCBvcmlnaW4gdGhhdCByZXF1ZXN0ZWQgdGhlIHNpZ25hdHVyZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkubWV0aG9kIC0gUlBDIG1ldGhvZCB1c2VkXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW50cnkuc3VjY2VzcyAtIFdoZXRoZXIgc2lnbmluZyBzdWNjZWVkZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS50eEhhc2hdIC0gVHJhbnNhY3Rpb24gaGFzaCAoZm9yIHRyYW5zYWN0aW9ucylcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS5lcnJvcl0gLSBFcnJvciBtZXNzYWdlIChpZiBmYWlsZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBsb2dTaWduaW5nT3BlcmF0aW9uKGVudHJ5KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGxvZ0VudHJ5ID0ge1xyXG4gICAgICAuLi5lbnRyeSxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdldCBleGlzdGluZyBsb2dcclxuICAgIGNvbnN0IGV4aXN0aW5nTG9nID0gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEFkZCBuZXcgZW50cnkgYXQgdGhlIGJlZ2lubmluZ1xyXG4gICAgZXhpc3RpbmdMb2cudW5zaGlmdChsb2dFbnRyeSk7XHJcblxyXG4gICAgLy8gVHJpbSB0byBtYXggZW50cmllc1xyXG4gICAgaWYgKGV4aXN0aW5nTG9nLmxlbmd0aCA+IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTKSB7XHJcbiAgICAgIGV4aXN0aW5nTG9nLmxlbmd0aCA9IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgbG9nXHJcbiAgICBhd2FpdCBzYXZlKFNJR05JTkdfTE9HX0tFWSwgZXhpc3RpbmdMb2cpO1xyXG5cclxuICAgIC8vIEFsc28gbG9nIHRvIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAgY29uc3QgaWNvbiA9IGVudHJ5LnN1Y2Nlc3MgPyAn4pyFJyA6ICfinYwnO1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgJHtpY29ufSBTaWduaW5nIGF1ZGl0OiAke2VudHJ5LnR5cGV9IGZyb20gJHtlbnRyeS5vcmlnaW59IC0gJHtlbnRyeS5zdWNjZXNzID8gJ1NVQ0NFU1MnIDogJ0ZBSUxFRCd9YCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIERvbid0IGxldCBsb2dnaW5nIGZhaWx1cmVzIGFmZmVjdCBzaWduaW5nIG9wZXJhdGlvbnNcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgbG9nZ2luZyBzaWduaW5nIG9wZXJhdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHNpZ25pbmcgYXVkaXQgbG9nXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gQXJyYXkgb2YgbG9nIGVudHJpZXNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNpZ25pbmdBdWRpdExvZygpIHtcclxuICByZXR1cm4gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG59XHJcblxyXG4vLyA9PT09PSBTRVNTSU9OIE1BTkFHRU1FTlQgPT09PT1cclxuLy8gU2Vzc2lvbiB0b2tlbnMgc3RvcmVkIGluIG1lbW9yeSAoY2xlYXJlZCB3aGVuIHNlcnZpY2Ugd29ya2VyIHRlcm1pbmF0ZXMpXHJcbi8vIFNFQ1VSSVRZIE5PVEU6IFNlcnZpY2Ugd29ya2VycyBjYW4gYmUgdGVybWluYXRlZCBieSBDaHJvbWUgYXQgYW55IHRpbWUsIHdoaWNoIGNsZWFycyBhbGxcclxuLy8gc2Vzc2lvbiBkYXRhLiBUaGlzIGlzIGludGVudGlvbmFsIC0gd2UgZG9uJ3Qgd2FudCBwYXNzd29yZHMgcGVyc2lzdGluZyBsb25nZXIgdGhhbiBuZWVkZWQuXHJcbi8vIFNlc3Npb25zIGFyZSBlbmNyeXB0ZWQgaW4gbWVtb3J5IGFzIGFuIGFkZGl0aW9uYWwgc2VjdXJpdHkgbGF5ZXIuXHJcbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpOyAvLyBzZXNzaW9uVG9rZW4gLT4geyBlbmNyeXB0ZWRQYXNzd29yZCwgd2FsbGV0SWQsIGV4cGlyZXNBdCwgc2FsdCB9XHJcblxyXG4vLyBTZXNzaW9uIGVuY3J5cHRpb24ga2V5IChyZWdlbmVyYXRlZCBvbiBzZXJ2aWNlIHdvcmtlciBzdGFydClcclxubGV0IHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHNlc3Npb24gZW5jcnlwdGlvbiBrZXkgdXNpbmcgV2ViIENyeXB0byBBUElcclxuICogS2V5IGlzIHJlZ2VuZXJhdGVkIGVhY2ggdGltZSBzZXJ2aWNlIHdvcmtlciBzdGFydHMgKG1lbW9yeSBvbmx5LCBuZXZlciBwZXJzaXN0ZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKSB7XHJcbiAgaWYgKCFzZXNzaW9uRW5jcnlwdGlvbktleSkge1xyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gMjU2LWJpdCBrZXkgZm9yIEFFUy1HQ00gZW5jcnlwdGlvblxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcclxuICAgICAgZmFsc2UsIC8vIE5vdCBleHRyYWN0YWJsZVxyXG4gICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY3J5cHRzIHBhc3N3b3JkIGZvciBzZXNzaW9uIHN0b3JhZ2UgdXNpbmcgQUVTLUdDTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBQYXNzd29yZCB0byBlbmNyeXB0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtlbmNyeXB0ZWQ6IEFycmF5QnVmZmVyLCBpdjogVWludDhBcnJheX0+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCkge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICBjb25zdCBwYXNzd29yZERhdGEgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcbiAgXHJcbiAgLy8gR2VuZXJhdGUgcmFuZG9tIElWIGZvciB0aGlzIGVuY3J5cHRpb25cclxuICAvLyBTRUNVUklUWTogSVYgdW5pcXVlbmVzcyBpcyBjcnlwdG9ncmFwaGljYWxseSBndWFyYW50ZWVkIGJ5IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKVxyXG4gIC8vIHdoaWNoIHVzZXMgdGhlIGJyb3dzZXIncyBDU1BSTkcgKENyeXB0b2dyYXBoaWNhbGx5IFNlY3VyZSBQc2V1ZG8tUmFuZG9tIE51bWJlciBHZW5lcmF0b3IpXHJcbiAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7XHJcbiAgXHJcbiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIHBhc3N3b3JkRGF0YVxyXG4gICk7XHJcbiAgXHJcbiAgcmV0dXJuIHsgZW5jcnlwdGVkLCBpdiB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVjcnlwdHMgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkIC0gRW5jcnlwdGVkIHBhc3N3b3JkIGRhdGFcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBpdiAtIEluaXRpYWxpemF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oZW5jcnlwdGVkLCBpdikge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIFxyXG4gIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBlbmNyeXB0ZWRcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuICByZXR1cm4gZGVjb2Rlci5kZWNvZGUoZGVjcnlwdGVkKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlc3Npb24gdG9rZW5cclxuZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBuZXcgc2Vzc2lvblxyXG4vLyBTRUNVUklUWTogRGVmYXVsdCBzZXNzaW9uIGR1cmF0aW9uIHJlZHVjZWQgdG8gMTUgbWludXRlcyB0byBtaW5pbWl6ZSBwYXNzd29yZCBleHBvc3VyZSBpbiBtZW1vcnlcclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihwYXNzd29yZCwgd2FsbGV0SWQsIGR1cmF0aW9uTXMgPSA5MDAwMDApIHsgLy8gRGVmYXVsdCAxNSBtaW51dGVzICh3YXMgMSBob3VyKVxyXG4gIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGdlbmVyYXRlU2Vzc2lvblRva2VuKCk7XHJcbiAgY29uc3QgZXhwaXJlc0F0ID0gRGF0ZS5ub3coKSArIGR1cmF0aW9uTXM7XHJcbiAgXHJcbiAgLy8gRW5jcnlwdCBwYXNzd29yZCBiZWZvcmUgc3RvcmluZyBpbiBtZW1vcnlcclxuICBjb25zdCB7IGVuY3J5cHRlZCwgaXYgfSA9IGF3YWl0IGVuY3J5cHRQYXNzd29yZEZvclNlc3Npb24ocGFzc3dvcmQpO1xyXG5cclxuICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvblRva2VuLCB7XHJcbiAgICBlbmNyeXB0ZWRQYXNzd29yZDogZW5jcnlwdGVkLFxyXG4gICAgaXY6IGl2LFxyXG4gICAgd2FsbGV0SWQsXHJcbiAgICBleHBpcmVzQXRcclxuICB9KTtcclxuXHJcbiAgLy8gQXV0by1jbGVhbnVwIGV4cGlyZWQgc2Vzc2lvblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvblRva2VuKTtcclxuICAgICAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgICAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZXNzaW9uIGV4cGlyZWQgYW5kIHJlbW92ZWQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIGR1cmF0aW9uTXMpO1xyXG5cclxuICAvLyBTZXNzaW9uIGNyZWF0ZWRcclxuICByZXR1cm4gc2Vzc2lvblRva2VuO1xyXG59XHJcblxyXG4vLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCByZXR1cm4gZGVjcnlwdGVkIHBhc3N3b3JkXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXNlc3Npb25Ub2tlbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBzZXNzaW9uIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcblxyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG9yIGV4cGlyZWQgc2Vzc2lvbicpO1xyXG4gIH1cclxuXHJcbiAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZXNzaW9uIGV4cGlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIERlY3J5cHQgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICByZXR1cm4gYXdhaXQgZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oc2Vzc2lvbi5lbmNyeXB0ZWRQYXNzd29yZCwgc2Vzc2lvbi5pdik7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgc2Vzc2lvblxyXG5mdW5jdGlvbiBpbnZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25Ub2tlbikpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgLy8gU2Vzc2lvbiBpbnZhbGlkYXRlZFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gSW52YWxpZGF0ZSBhbGwgc2Vzc2lvbnNcclxuZnVuY3Rpb24gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCkge1xyXG4gIGNvbnN0IGNvdW50ID0gYWN0aXZlU2Vzc2lvbnMuc2l6ZTtcclxuICBhY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xyXG4gIC8vIEFsbCBzZXNzaW9ucyBpbnZhbGlkYXRlZFxyXG4gIHJldHVybiBjb3VudDtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBleHRlbnNpb24gaW5zdGFsbGF0aW9uXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBpbnN0YWxsZWQnKTtcclxufSk7XHJcblxyXG4vLyBHZXQgY29ubmVjdGVkIHNpdGVzIGZyb20gc3RvcmFnZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlcygpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGxvYWQoQ09OTkVDVEVEX1NJVEVTX0tFWSk7XHJcbiAgcmV0dXJuIHNpdGVzIHx8IHt9O1xyXG59XHJcblxyXG4vLyBHZXQgYSBjb25uZWN0ZWQgc2l0ZSBlbnRyeVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlKG9yaWdpbikge1xyXG4gIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICByZXR1cm4gc2l0ZXNbb3JpZ2luXSB8fCBudWxsO1xyXG59XHJcblxyXG4vLyBHZXQgdGhlIGN1cnJlbnRseSBhdXRob3JpemVkIGFjY291bnQgZm9yIGEgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRBdXRob3JpemVkQWNjb3VudHMob3JpZ2luKSB7XHJcbiAgY29uc3Qgc2l0ZSA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGUob3JpZ2luKTtcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuXHJcbiAgaWYgKCFzaXRlIHx8ICF3YWxsZXQ/LmFkZHJlc3MpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGF1dGhvcml6ZWRBY2NvdW50cyA9IEFycmF5LmlzQXJyYXkoc2l0ZS5hY2NvdW50cykgPyBzaXRlLmFjY291bnRzIDogW107XHJcbiAgY29uc3QgYWN0aXZlQWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgaXNBdXRob3JpemVkID0gYXV0aG9yaXplZEFjY291bnRzLnNvbWUoXHJcbiAgICBhY2NvdW50ID0+IHR5cGVvZiBhY2NvdW50ID09PSAnc3RyaW5nJyAmJiBhY2NvdW50LnRvTG93ZXJDYXNlKCkgPT09IGFjdGl2ZUFkZHJlc3NcclxuICApO1xyXG5cclxuICByZXR1cm4gaXNBdXRob3JpemVkID8gW3dhbGxldC5hZGRyZXNzXSA6IFtdO1xyXG59XHJcblxyXG4vLyBDaGVjayBpZiBhIHNpdGUgaXMgY29ubmVjdGVkXHJcbmFzeW5jIGZ1bmN0aW9uIGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pIHtcclxuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGdldEF1dGhvcml6ZWRBY2NvdW50cyhvcmlnaW4pO1xyXG4gIHJldHVybiBhY2NvdW50cy5sZW5ndGggPiAwO1xyXG59XHJcblxyXG4vLyBBZGQgYSBjb25uZWN0ZWQgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiBhZGRDb25uZWN0ZWRTaXRlKG9yaWdpbiwgYWNjb3VudHMpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgY29uc3QgZXhpc3RpbmdBY2NvdW50cyA9IEFycmF5LmlzQXJyYXkoc2l0ZXNbb3JpZ2luXT8uYWNjb3VudHMpID8gc2l0ZXNbb3JpZ2luXS5hY2NvdW50cyA6IFtdO1xyXG4gIGNvbnN0IG1lcmdlZEFjY291bnRzID0gWy4uLmV4aXN0aW5nQWNjb3VudHNdO1xyXG5cclxuICBmb3IgKGNvbnN0IGFjY291bnQgb2YgYWNjb3VudHMgfHwgW10pIHtcclxuICAgIGlmIChcclxuICAgICAgdHlwZW9mIGFjY291bnQgPT09ICdzdHJpbmcnICYmXHJcbiAgICAgICFtZXJnZWRBY2NvdW50cy5zb21lKGV4aXN0aW5nID0+IGV4aXN0aW5nLnRvTG93ZXJDYXNlKCkgPT09IGFjY291bnQudG9Mb3dlckNhc2UoKSlcclxuICAgICkge1xyXG4gICAgICBtZXJnZWRBY2NvdW50cy5wdXNoKGFjY291bnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2l0ZXNbb3JpZ2luXSA9IHtcclxuICAgIGFjY291bnRzOiBtZXJnZWRBY2NvdW50cyxcclxuICAgIGNvbm5lY3RlZEF0OiBzaXRlc1tvcmlnaW5dPy5jb25uZWN0ZWRBdCB8fCBEYXRlLm5vdygpLFxyXG4gICAgbGFzdENvbm5lY3RlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuICBhd2FpdCBzYXZlKENPTk5FQ1RFRF9TSVRFU19LRVksIHNpdGVzKTtcclxufVxyXG5cclxuLy8gUmVtb3ZlIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ29ubmVjdGVkU2l0ZShvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgZGVsZXRlIHNpdGVzW29yaWdpbl07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIE5vdGlmeSB0YWJzIHdoZW4gdGhlIGFjdGl2ZSBhdXRob3JpemVkIGFjY291bnQgY2hhbmdlc1xyXG5hc3luYyBmdW5jdGlvbiBub3RpZnlBY2NvdW50c0NoYW5nZWQoKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGNvbnN0IGFjdGl2ZUFkZHJlc3MgPSB3YWxsZXQ/LmFkZHJlc3MgfHwgbnVsbDtcclxuXHJcbiAgY2hyb21lLnRhYnMucXVlcnkoe30sICh0YWJzKSA9PiB7XHJcbiAgICB0YWJzLmZvckVhY2goKHRhYikgPT4ge1xyXG4gICAgICBpZiAoIXRhYi5pZCB8fCAhdGFiLnVybCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IG9yaWdpbjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBvcmlnaW4gPSBuZXcgVVJMKHRhYi51cmwpLm9yaWdpbjtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBzaXRlID0gc2l0ZXNbb3JpZ2luXTtcclxuICAgICAgY29uc3QgYWNjb3VudHMgPSAoXHJcbiAgICAgICAgc2l0ZSAmJlxyXG4gICAgICAgIGFjdGl2ZUFkZHJlc3MgJiZcclxuICAgICAgICBBcnJheS5pc0FycmF5KHNpdGUuYWNjb3VudHMpICYmXHJcbiAgICAgICAgc2l0ZS5hY2NvdW50cy5zb21lKGFjY291bnQgPT4gdHlwZW9mIGFjY291bnQgPT09ICdzdHJpbmcnICYmIGFjY291bnQudG9Mb3dlckNhc2UoKSA9PT0gYWN0aXZlQWRkcmVzcy50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICApID8gW2FjdGl2ZUFkZHJlc3NdIDogW107XHJcblxyXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHtcclxuICAgICAgICB0eXBlOiAnQUNDT1VOVFNfQ0hBTkdFRCcsXHJcbiAgICAgICAgYWNjb3VudHNcclxuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIC8vIFRhYiBtaWdodCBub3QgaGF2ZSBjb250ZW50IHNjcmlwdCwgaWdub3JlIGVycm9yXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIE5vdGlmeSB0YWJzIHdoZW4gdGhlIG5ldHdvcmsgY2hhbmdlc1xyXG5mdW5jdGlvbiBub3RpZnlDaGFpbkNoYW5nZWQoY2hhaW5JZCkge1xyXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCAodGFicykgPT4ge1xyXG4gICAgdGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xyXG4gICAgICAgIHR5cGU6ICdDSEFJTl9DSEFOR0VEJyxcclxuICAgICAgICBjaGFpbklkXHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQsIGlnbm9yZSBlcnJvclxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGNoYWluIElEXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFpbklkKCkge1xyXG4gIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpO1xyXG4gIHJldHVybiBDSEFJTl9JRFNbbmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnXTtcclxufVxyXG5cclxuLy8gU0VDVVJJVFk6IE1ldGhvZHMgYW55IHNpdGUgbWF5IGNhbGwgd2l0aG91dCBhbiBhcHByb3ZlZCBjb25uZWN0aW9uLlxyXG4vLyBFdmVyeXRoaW5nIGVsc2UgLSBpbmNsdWRpbmcgcmVhZC1vbmx5IGNoYWluIHF1ZXJpZXMgLSByZXF1aXJlcyBhIGNvbm5lY3Rpb24sIHNvIGFcclxuLy8gcGFnZSB0aGUgdXNlciBuZXZlciBhcHByb3ZlZCBjYW5ub3QgdXNlIHRoZSB3YWxsZXQgYXMgYSBmcmVlIFJQQyBwcm94eSAod2hpY2hcclxuLy8gbGVha3MgdGhlIHVzZXIncyBjb25maWd1cmVkIGVuZHBvaW50IGFuZCBJUCkgb3IgcHJvYmUgY2hhaW4gc3RhdGUgdGhyb3VnaCB0aGVtLlxyXG4vL1xyXG4vLyBldGhfY2hhaW5JZC9uZXRfdmVyc2lvbiBzdGF5IHB1YmxpYyBiZWNhdXNlIEVJUC0xMTkzIHdhbGxldCBkZXRlY3Rpb24gcmVhZHMgdGhlbVxyXG4vLyBiZWZvcmUgY29ubmVjdGluZzsgZXRoX2FjY291bnRzIGlzIHB1YmxpYyBiZWNhdXNlIGl0IGFscmVhZHkgcmV0dXJucyBbXSBmb3IgYW5cclxuLy8gdW5jb25uZWN0ZWQgc2l0ZTsgZXRoX3JlcXVlc3RBY2NvdW50cyBJUyB0aGUgY29ubmVjdGlvbiByZXF1ZXN0LlxyXG5jb25zdCBQVUJMSUNfTUVUSE9EUyA9IG5ldyBTZXQoW1xyXG4gICdldGhfY2hhaW5JZCcsXHJcbiAgJ25ldF92ZXJzaW9uJyxcclxuICAnZXRoX2FjY291bnRzJyxcclxuICAnZXRoX3JlcXVlc3RBY2NvdW50cydcclxuXSk7XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0IHJlcXVlc3RzIGZyb20gY29udGVudCBzY3JpcHRzXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVdhbGxldFJlcXVlc3QobWVzc2FnZSwgc2VuZGVyKSB7XHJcbiAgY29uc3QgeyBtZXRob2QsIHBhcmFtcyB9ID0gbWVzc2FnZTtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IEdldCBvcmlnaW4gZnJvbSBDaHJvbWUgQVBJLCBub3QgbWVzc2FnZSBwYXlsb2FkIChwcmV2ZW50cyBzcG9vZmluZykuXHJcbiAgLy8gSWYgd2UgY2Fubm90IGRldGVybWluZSBhbiBvcmlnaW4gd2UgY2Fubm90IG1ha2UgYW4gYXV0aG9yaXphdGlvbiBkZWNpc2lvbiwgc28gcmVmdXNlLlxyXG4gIGxldCBvcmlnaW47XHJcbiAgdHJ5IHtcclxuICAgIG9yaWdpbiA9IG5ldyBVUkwoc2VuZGVyLnVybCkub3JpZ2luO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIFNFQ1VSSVRZOiBSZWplY3Rpbmcgd2FsbGV0IHJlcXVlc3Qgd2l0aCB1bmRldGVybWluYWJsZSBvcmlnaW46Jywgc2VuZGVyPy51cmwpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ1VuYXV0aG9yaXplZDogY291bGQgbm90IGRldGVybWluZSByZXF1ZXN0IG9yaWdpbicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IFNpbmdsZSBjaG9rZSBwb2ludCBmb3IgdGhlIGNvbm5lY3Rpb24gcmVxdWlyZW1lbnQsIHNvIGEgbmV3bHkgYWRkZWRcclxuICAvLyBtZXRob2QgY2Fubm90IGFjY2lkZW50YWxseSBzaGlwIHdpdGhvdXQgYW4gYXV0aG9yaXphdGlvbiBjaGVjay5cclxuICBpZiAoIVBVQkxJQ19NRVRIT0RTLmhhcyhtZXRob2QpICYmICEoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxpbmcgd2FsbGV0IHJlcXVlc3RcclxuXHJcbiAgdHJ5IHtcclxuICAgIHN3aXRjaCAobWV0aG9kKSB7XHJcbiAgICAgIGNhc2UgJ2V0aF9yZXF1ZXN0QWNjb3VudHMnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVSZXF1ZXN0QWNjb3VudHMob3JpZ2luLCBzZW5kZXIudGFiKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9hY2NvdW50cyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUFjY291bnRzKG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICdldGhfY2hhaW5JZCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUNoYWluSWQoKTtcclxuXHJcbiAgICAgIGNhc2UgJ25ldF92ZXJzaW9uJzpcclxuICAgICAgICBjb25zdCBjaGFpbklkID0gYXdhaXQgaGFuZGxlQ2hhaW5JZCgpO1xyXG4gICAgICAgIHJldHVybiB7IHJlc3VsdDogcGFyc2VJbnQoY2hhaW5JZC5yZXN1bHQsIDE2KS50b1N0cmluZygpIH07XHJcblxyXG4gICAgICBjYXNlICd3YWxsZXRfc3dpdGNoRXRoZXJldW1DaGFpbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVN3aXRjaENoYWluKHBhcmFtcywgb3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF9hZGRFdGhlcmV1bUNoYWluJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQWRkQ2hhaW4ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X3dhdGNoQXNzZXQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVXYXRjaEFzc2V0KHBhcmFtcywgb3JpZ2luLCBzZW5kZXIudGFiKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9ibG9ja051bWJlcic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUJsb2NrTnVtYmVyKCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmxvY2tCeU51bWJlcic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJsb2NrQnlOdW1iZXIocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCYWxhbmNlJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmFsYW5jZShwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uQ291bnQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfY2FsbCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUNhbGwocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9lc3RpbWF0ZUdhcyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUVzdGltYXRlR2FzKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2FzUHJpY2UnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHYXNQcmljZSgpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NlbmRUcmFuc2FjdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2VuZFJhd1RyYW5zYWN0aW9uJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRUcmFuc2FjdGlvblJlY2VpcHQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvblJlY2VpcHQocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRUcmFuc2FjdGlvbkJ5SGFzaCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uQnlIYXNoKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0TG9ncyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldExvZ3MocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRDb2RlJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0Q29kZShwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldEJsb2NrQnlIYXNoJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmxvY2tCeUhhc2gocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ3BlcnNvbmFsX3NpZ24nOlxyXG4gICAgICBjYXNlICdldGhfc2lnbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVBlcnNvbmFsU2lnbihwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGFfdjMnOlxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92NCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNpZ25UeXBlZERhdGEocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCk7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMSwgbWVzc2FnZTogYE1ldGhvZCAke21ldGhvZH0gbm90IHN1cHBvcnRlZGAgfSB9O1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGhhbmRsaW5nIHJlcXVlc3Q6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfcmVxdWVzdEFjY291bnRzIC0gUmVxdWVzdCBwZXJtaXNzaW9uIHRvIGNvbm5lY3RcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVxdWVzdEFjY291bnRzKG9yaWdpbiwgdGFiKSB7XHJcbiAgLy8gQ2hlY2sgaWYgYWxyZWFkeSBjb25uZWN0ZWRcclxuICBpZiAoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIGNvbnN0IGFjY291bnRzID0gYXdhaXQgZ2V0QXV0aG9yaXplZEFjY291bnRzKG9yaWdpbik7XHJcbiAgICBpZiAoYWNjb3VudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICByZXR1cm4geyByZXN1bHQ6IGFjY291bnRzIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuICAgIHBlbmRpbmdDb25uZWN0aW9ucy5zZXQocmVxdWVzdElkLCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0YWJJZDogdGFiPy5pZCB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPWNvbm5lY3Qmb3JpZ2luPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG9yaWdpbil9JnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdDb25uZWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdDb25uZWN0aW9uIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9hY2NvdW50cyAtIEdldCBjb25uZWN0ZWQgYWNjb3VudHNcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWNjb3VudHMob3JpZ2luKSB7XHJcbiAgLy8gT25seSByZXR1cm4gYWNjb3VudHMgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGdldEF1dGhvcml6ZWRBY2NvdW50cyhvcmlnaW4pO1xyXG4gIGlmIChhY2NvdW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGFjY291bnRzIH07XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyByZXN1bHQ6IFtdIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfY2hhaW5JZCAtIEdldCBjdXJyZW50IGNoYWluIElEXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNoYWluSWQoKSB7XHJcbiAgY29uc3QgY2hhaW5JZCA9IGF3YWl0IGdldEN1cnJlbnRDaGFpbklkKCk7XHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBjaGFpbklkIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXRfc3dpdGNoRXRoZXJldW1DaGFpbiAtIFN3aXRjaCB0byBhIGRpZmZlcmVudCBuZXR3b3JrXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN3aXRjaENoYWluKHBhcmFtcywgb3JpZ2luKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSB8fCAhcGFyYW1zWzBdLmNoYWluSWQpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogUmVxdWlyZSBzaXRlIGNvbm5lY3Rpb24gYmVmb3JlIGFsbG93aW5nIGNoYWluIHN3aXRjaFxyXG4gIGlmIChvcmlnaW4gJiYgIShhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdVbmF1dGhvcml6ZWQ6IHNpdGUgbm90IGNvbm5lY3RlZC4gQ2FsbCBldGhfcmVxdWVzdEFjY291bnRzIGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcmVxdWVzdGVkQ2hhaW5JZCA9IFN0cmluZyhwYXJhbXNbMF0uY2hhaW5JZCkudG9Mb3dlckNhc2UoKTtcclxuICBjb25zdCBuZXR3b3JrS2V5ID0gQ0hBSU5fSURfVE9fTkVUV09SS1tyZXF1ZXN0ZWRDaGFpbklkXTtcclxuXHJcbiAgaWYgKCFuZXR3b3JrS2V5KSB7XHJcbiAgICAvLyBDaGFpbiBub3Qgc3VwcG9ydGVkIC0gcmV0dXJuIGVycm9yIGNvZGUgNDkwMiBzbyBkQXBwIGNhbiBjYWxsIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IDQ5MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ1VucmVjb2duaXplZCBjaGFpbiBJRC4gVHJ5IGFkZGluZyB0aGUgY2hhaW4gdXNpbmcgd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4uJ1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY3VycmVudE5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gIGlmIChjdXJyZW50TmV0d29yayA9PT0gbmV0d29ya0tleSkge1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBudWxsIH07XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgYmVmb3JlIHN3aXRjaGluZyBuZXR3b3Jrc1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG5cclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5zZXQoYXBwcm92YWxUb2tlbiwge1xyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgdXNlZDogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIHBlbmRpbmdDaGFpblN3aXRjaGVzLnNldChyZXF1ZXN0SWQsIHtcclxuICAgICAgcmVzb2x2ZSxcclxuICAgICAgcmVqZWN0LFxyXG4gICAgICBvcmlnaW4sXHJcbiAgICAgIG5ldHdvcmtLZXksXHJcbiAgICAgIGNoYWluSWQ6IENIQUlOX0lEU1tuZXR3b3JrS2V5XSxcclxuICAgICAgYXBwcm92YWxUb2tlblxyXG4gICAgfSk7XHJcblxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1zd2l0Y2hDaGFpbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNTIwXHJcbiAgICB9KTtcclxuXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdDaGFpblN3aXRjaGVzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ0NoYWluU3dpdGNoZXMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2hhaW4gc3dpdGNoIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluIC0gQWRkIGEgbmV3IG5ldHdvcmsgKHNpbXBsaWZpZWQgdmVyc2lvbilcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWRkQ2hhaW4ocGFyYW1zLCBvcmlnaW4pIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdIHx8ICFwYXJhbXNbMF0uY2hhaW5JZCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXMnIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBSZXF1aXJlIHNpdGUgY29ubmVjdGlvbiBiZWZvcmUgYWxsb3dpbmcgY2hhaW4gYWRkL3N3aXRjaFxyXG4gIGlmIChvcmlnaW4gJiYgIShhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdVbmF1dGhvcml6ZWQ6IHNpdGUgbm90IGNvbm5lY3RlZC4gQ2FsbCBldGhfcmVxdWVzdEFjY291bnRzIGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY2hhaW5JbmZvID0gcGFyYW1zWzBdO1xyXG4gIGNvbnNvbGUubG9nKCfwn6uAIFJlcXVlc3QgdG8gYWRkIGNoYWluOicsIGNoYWluSW5mbyk7XHJcblxyXG4gIC8vIEZvciBub3csIG9ubHkgc3VwcG9ydCBvdXIgcHJlZGVmaW5lZCBjaGFpbnNcclxuICAvLyBDaGVjayBpZiBpdCdzIG9uZSBvZiBvdXIgc3VwcG9ydGVkIGNoYWluc1xyXG4gIGNvbnN0IHN1cHBvcnRlZENoYWlucyA9IHtcclxuICAgICcweDNhZic6IHRydWUsXHJcbiAgICAnMHgzQUYnOiB0cnVlLFxyXG4gICAgJzB4MTcxJzogdHJ1ZSxcclxuICAgICcweDEnOiB0cnVlLFxyXG4gICAgJzB4YWEzNmE3JzogdHJ1ZSxcclxuICAgICcweEFBMzZBNyc6IHRydWVcclxuICB9O1xyXG5cclxuICBpZiAoc3VwcG9ydGVkQ2hhaW5zW2NoYWluSW5mby5jaGFpbklkXSkge1xyXG4gICAgLy8gQ2hhaW4gaXMgYWxyZWFkeSBzdXBwb3J0ZWQsIGp1c3Qgc3dpdGNoIHRvIGl0XHJcbiAgICByZXR1cm4gYXdhaXQgaGFuZGxlU3dpdGNoQ2hhaW4oW3sgY2hhaW5JZDogY2hhaW5JbmZvLmNoYWluSWQgfV0sIG9yaWdpbik7XHJcbiAgfVxyXG5cclxuICAvLyBDdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0XHJcbiAgcmV0dXJuIHtcclxuICAgIGVycm9yOiB7XHJcbiAgICAgIGNvZGU6IC0zMjYwMyxcclxuICAgICAgbWVzc2FnZTogJ0FkZGluZyBjdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0LiBPbmx5IFB1bHNlQ2hhaW4gYW5kIEV0aGVyZXVtIG5ldHdvcmtzIGFyZSBzdXBwb3J0ZWQuJ1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBjb25uZWN0aW9uIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQpIHtcclxuICBpZiAoIXBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4gfSA9IHBlbmRpbmdDb25uZWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICBwZW5kaW5nQ29ubmVjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmIChhcHByb3ZlZCkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIC8vIFNhdmUgY29ubmVjdGVkIHNpdGVcclxuICAgICAgYXdhaXQgYWRkQ29ubmVjdGVkU2l0ZShvcmlnaW4sIFt3YWxsZXQuYWRkcmVzc10pO1xyXG4gICAgICBhd2FpdCBub3RpZnlBY2NvdW50c0NoYW5nZWQoKTtcclxuXHJcbiAgICAgIC8vIFJlc29sdmUgdGhlIHBlbmRpbmcgcHJvbWlzZVxyXG4gICAgICByZXNvbHZlKHsgcmVzdWx0OiBbd2FsbGV0LmFkZHJlc3NdIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVqZWN0KG5ldyBFcnJvcignTm8gYWN0aXZlIHdhbGxldCcpKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gYWN0aXZlIHdhbGxldCcgfTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCBjb25uZWN0aW9uJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBjb25uZWN0aW9uIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0Q29ubmVjdGlvblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4gfSA9IHBlbmRpbmdDb25uZWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGNoYWluIHN3aXRjaCBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNoYWluU3dpdGNoQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCkge1xyXG4gIGlmICghcGVuZGluZ0NoYWluU3dpdGNoZXMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgbmV0d29ya0tleSwgY2hhaW5JZCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ0NoYWluU3dpdGNoZXMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pKSB7XHJcbiAgICBwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCBjaGFpbiBzd2l0Y2gnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZSgnY3VycmVudE5ldHdvcmsnLCBuZXR3b3JrS2V5KTtcclxuICBub3RpZnlDaGFpbkNoYW5nZWQoY2hhaW5JZCk7XHJcbiAgcmVzb2x2ZSh7IHJlc3VsdDogbnVsbCB9KTtcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBjaGFpbklkLCBuZXR3b3JrTmFtZTogTkVUV09SS19OQU1FU1tuZXR3b3JrS2V5XSB9O1xyXG59XHJcblxyXG4vLyBHZXQgY2hhaW4gc3dpdGNoIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q2hhaW5Td2l0Y2hSZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmICghcGVuZGluZ0NoYWluU3dpdGNoZXMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBvcmlnaW4sIG5ldHdvcmtLZXksIGNoYWluSWQgfSA9IHBlbmRpbmdDaGFpblN3aXRjaGVzLmdldChyZXF1ZXN0SWQpO1xyXG4gIGNvbnN0IGN1cnJlbnROZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICBvcmlnaW4sXHJcbiAgICBjaGFpbklkLFxyXG4gICAgbmV0d29ya0tleSxcclxuICAgIG5ldHdvcmtOYW1lOiBORVRXT1JLX05BTUVTW25ldHdvcmtLZXldIHx8IG5ldHdvcmtLZXksXHJcbiAgICBjdXJyZW50TmV0d29ya05hbWU6IE5FVFdPUktfTkFNRVNbY3VycmVudE5ldHdvcmtdIHx8IGN1cnJlbnROZXR3b3JrXHJcbiAgfTtcclxufVxyXG5cclxuLy8gR2V0IGN1cnJlbnQgbmV0d29yayBrZXlcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudE5ldHdvcmsoKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgcmV0dXJuIG5ldHdvcmsgfHwgJ3B1bHNlY2hhaW5UZXN0bmV0JztcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9ibG9ja051bWJlciAtIEdldCBjdXJyZW50IGJsb2NrIG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVCbG9ja051bWJlcigpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBibG9ja051bWJlciA9IGF3YWl0IHJwYy5nZXRCbG9ja051bWJlcihuZXR3b3JrKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogYmxvY2tOdW1iZXIgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBibG9jayBudW1iZXI6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0QmxvY2tCeU51bWJlciAtIEdldCBibG9jayBieSBudW1iZXJcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QmxvY2tCeU51bWJlcihwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGJsb2NrIG51bWJlciBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBibG9ja051bWJlciA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IGluY2x1ZGVUcmFuc2FjdGlvbnMgPSBwYXJhbXNbMV0gfHwgZmFsc2U7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrID0gYXdhaXQgcnBjLmdldEJsb2NrQnlOdW1iZXIobmV0d29yaywgYmxvY2tOdW1iZXIsIGluY2x1ZGVUcmFuc2FjdGlvbnMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9jayB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIGJ5IG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCYWxhbmNlIC0gR2V0IGJhbGFuY2UgZm9yIGFuIGFkZHJlc3NcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QmFsYW5jZShwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGFkZHJlc3MgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYWRkcmVzcyA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IGF3YWl0IHJwYy5nZXRCYWxhbmNlKG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBiYWxhbmNlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmFsYW5jZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvbkNvdW50IC0gR2V0IHRyYW5zYWN0aW9uIGNvdW50IChub25jZSlcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VHJhbnNhY3Rpb25Db3VudChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGFkZHJlc3MgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYWRkcmVzcyA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgY291bnQgPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25Db3VudChuZXR3b3JrLCBhZGRyZXNzKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogY291bnQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2FjdGlvbiBjb3VudDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nYXNQcmljZSAtIEdldCBjdXJyZW50IGdhcyBwcmljZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHYXNQcmljZSgpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBnYXNQcmljZSA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogZ2FzUHJpY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZXN0aW1hdGVHYXMgLSBFc3RpbWF0ZSBnYXMgZm9yIGEgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXN0aW1hdGVHYXMocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhcyA9IGF3YWl0IHJwYy5lc3RpbWF0ZUdhcyhuZXR3b3JrLCBwYXJhbXNbMF0pO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXMgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXN0aW1hdGluZyBnYXM6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfY2FsbCAtIEV4ZWN1dGUgYSByZWFkLW9ubHkgY2FsbFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDYWxsKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBycGMuY2FsbChuZXR3b3JrLCBwYXJhbXNbMF0pO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGV4ZWN1dGluZyBjYWxsOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NlbmRSYXdUcmFuc2FjdGlvbiAtIFNlbmQgYSBwcmUtc2lnbmVkIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRSYXdUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3Npbmcgc2lnbmVkIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IFJlcXVpcmUgc2l0ZSBjb25uZWN0aW9uIGJlZm9yZSBhbGxvd2luZyByYXcgdHJhbnNhY3Rpb24gYnJvYWRjYXN0XHJcbiAgaWYgKG9yaWdpbiAmJiAhKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ1VuYXV0aG9yaXplZDogc2l0ZSBub3QgY29ubmVjdGVkLiBDYWxsIGV0aF9yZXF1ZXN0QWNjb3VudHMgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2lnbmVkVHggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHR4SGFzaCA9IGF3YWl0IHJwYy5zZW5kUmF3VHJhbnNhY3Rpb24obmV0d29yaywgc2lnbmVkVHgpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiB0eEhhc2ggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igc2VuZGluZyByYXcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0VHJhbnNhY3Rpb25SZWNlaXB0IC0gR2V0IHRyYW5zYWN0aW9uIHJlY2VpcHRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VHJhbnNhY3Rpb25SZWNlaXB0KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0KG5ldHdvcmssIHR4SGFzaCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHJlY2VpcHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2FjdGlvbiByZWNlaXB0OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQnlIYXNoIC0gR2V0IHRyYW5zYWN0aW9uIGJ5IGhhc2hcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VHJhbnNhY3Rpb25CeUhhc2gocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBoYXNoIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHR4SGFzaCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgdHggPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25CeUhhc2gobmV0d29yaywgdHhIYXNoKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogdHggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2FjdGlvbiBieSBoYXNoOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRMb2dzKHBhcmFtcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgbG9ncyA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRMb2dzJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogbG9ncyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGxvZ3M6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldENvZGUocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBhZGRyZXNzIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCBjb2RlID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldENvZGUnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb2RlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgY29kZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QmxvY2tCeUhhc2gocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBibG9jayBoYXNoIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCBibG9jayA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRCbG9ja0J5SGFzaCcsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgaGFzaDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gUGVuZGluZyB0cmFuc2FjdGlvbiByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4gfSlcclxuY29uc3QgcGVuZGluZ1RyYW5zYWN0aW9ucyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vIFBlbmRpbmcgdG9rZW4gYWRkIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdG9rZW5JbmZvIH0pXHJcbmNvbnN0IHBlbmRpbmdUb2tlblJlcXVlc3RzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyBtZXNzYWdlIHNpZ25pbmcgcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBzaWduUmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9KVxyXG5jb25zdCBwZW5kaW5nU2lnblJlcXVlc3RzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gUkFURSBMSU1JVElORyA9PT09PVxyXG4vLyBQcmV2ZW50cyBtYWxpY2lvdXMgZEFwcHMgZnJvbSBzcGFtbWluZyB0cmFuc2FjdGlvbiBhcHByb3ZhbCByZXF1ZXN0c1xyXG5jb25zdCByYXRlTGltaXRNYXAgPSBuZXcgTWFwKCk7IC8vIG9yaWdpbiAtPiB7IGNvdW50LCB3aW5kb3dTdGFydCwgcGVuZGluZ0NvdW50IH1cclxuXHJcbmNvbnN0IFJBVEVfTElNSVRfQ09ORklHID0ge1xyXG4gIE1BWF9QRU5ESU5HX1JFUVVFU1RTOiA1LCAvLyBNYXggcGVuZGluZyByZXF1ZXN0cyBwZXIgb3JpZ2luXHJcbiAgTUFYX1JFUVVFU1RTX1BFUl9XSU5ET1c6IDIwLCAvLyBNYXggdG90YWwgcmVxdWVzdHMgcGVyIHRpbWUgd2luZG93XHJcbiAgVElNRV9XSU5ET1dfTVM6IDYwMDAwIC8vIDEgbWludXRlIHdpbmRvd1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhbiBvcmlnaW4gaGFzIGV4Y2VlZGVkIHJhdGUgbGltaXRzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGNoZWNrXHJcbiAqIEByZXR1cm5zIHt7IGFsbG93ZWQ6IGJvb2xlYW4sIHJlYXNvbj86IHN0cmluZyB9fVxyXG4gKi9cclxuZnVuY3Rpb24gY2hlY2tSYXRlTGltaXQob3JpZ2luKSB7XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBcclxuICAvLyBHZXQgb3IgY3JlYXRlIHJhdGUgbGltaXQgZW50cnkgZm9yIHRoaXMgb3JpZ2luXHJcbiAgaWYgKCFyYXRlTGltaXRNYXAuaGFzKG9yaWdpbikpIHtcclxuICAgIHJhdGVMaW1pdE1hcC5zZXQob3JpZ2luLCB7XHJcbiAgICAgIGNvdW50OiAwLFxyXG4gICAgICB3aW5kb3dTdGFydDogbm93LFxyXG4gICAgICBwZW5kaW5nQ291bnQ6IDBcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBjb25zdCBsaW1pdERhdGEgPSByYXRlTGltaXRNYXAuZ2V0KG9yaWdpbik7XHJcbiAgXHJcbiAgLy8gUmVzZXQgd2luZG93IGlmIGV4cGlyZWRcclxuICBpZiAobm93IC0gbGltaXREYXRhLndpbmRvd1N0YXJ0ID4gUkFURV9MSU1JVF9DT05GSUcuVElNRV9XSU5ET1dfTVMpIHtcclxuICAgIGxpbWl0RGF0YS5jb3VudCA9IDA7XHJcbiAgICBsaW1pdERhdGEud2luZG93U3RhcnQgPSBub3c7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIHBlbmRpbmcgcmVxdWVzdHMgbGltaXRcclxuICBpZiAobGltaXREYXRhLnBlbmRpbmdDb3VudCA+PSBSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUEVORElOR19SRVFVRVNUUykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYWxsb3dlZDogZmFsc2UsXHJcbiAgICAgIHJlYXNvbjogYFRvbyBtYW55IHBlbmRpbmcgcmVxdWVzdHMuIE1heGltdW0gJHtSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUEVORElOR19SRVFVRVNUU30gcGVuZGluZyByZXF1ZXN0cyBhbGxvd2VkLmBcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIHRvdGFsIHJlcXVlc3RzIGluIHdpbmRvd1xyXG4gIGlmIChsaW1pdERhdGEuY291bnQgPj0gUkFURV9MSU1JVF9DT05GSUcuTUFYX1JFUVVFU1RTX1BFUl9XSU5ET1cpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFsbG93ZWQ6IGZhbHNlLFxyXG4gICAgICByZWFzb246IGBSYXRlIGxpbWl0IGV4Y2VlZGVkLiBNYXhpbXVtICR7UkFURV9MSU1JVF9DT05GSUcuTUFYX1JFUVVFU1RTX1BFUl9XSU5ET1d9IHJlcXVlc3RzIHBlciBtaW51dGUuYFxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIHsgYWxsb3dlZDogdHJ1ZSB9O1xyXG59XHJcblxyXG4vKipcclxuICogSW5jcmVtZW50cyByYXRlIGxpbWl0IGNvdW50ZXJzIGZvciBhbiBvcmlnaW5cclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gaW5jcmVtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBpbmNyZW1lbnRSYXRlTGltaXQob3JpZ2luKSB7XHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIGlmIChsaW1pdERhdGEpIHtcclxuICAgIGxpbWl0RGF0YS5jb3VudCsrO1xyXG4gICAgbGltaXREYXRhLnBlbmRpbmdDb3VudCsrO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIERlY3JlbWVudHMgcGVuZGluZyBjb3VudGVyIHdoZW4gcmVxdWVzdCBpcyByZXNvbHZlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBkZWNyZW1lbnRcclxuICovXHJcbmZ1bmN0aW9uIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pIHtcclxuICBjb25zdCBsaW1pdERhdGEgPSByYXRlTGltaXRNYXAuZ2V0KG9yaWdpbik7XHJcbiAgaWYgKGxpbWl0RGF0YSAmJiBsaW1pdERhdGEucGVuZGluZ0NvdW50ID4gMCkge1xyXG4gICAgbGltaXREYXRhLnBlbmRpbmdDb3VudC0tO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQ2xlYW4gdXAgb2xkIHJhdGUgbGltaXQgZW50cmllcyBldmVyeSA1IG1pbnV0ZXNcclxuc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgZm9yIChjb25zdCBbb3JpZ2luLCBkYXRhXSBvZiByYXRlTGltaXRNYXAuZW50cmllcygpKSB7XHJcbiAgICBpZiAobm93IC0gZGF0YS53aW5kb3dTdGFydCA+IFJBVEVfTElNSVRfQ09ORklHLlRJTUVfV0lORE9XX01TICogNSAmJiBkYXRhLnBlbmRpbmdDb3VudCA9PT0gMCkge1xyXG4gICAgICByYXRlTGltaXRNYXAuZGVsZXRlKG9yaWdpbik7XHJcbiAgICB9XHJcbiAgfVxyXG59LCAzMDAwMDApO1xyXG5cclxuLy8gPT09PT0gVFJBTlNBQ1RJT04gUkVQTEFZIFBST1RFQ1RJT04gPT09PT1cclxuLy8gUHJldmVudHMgdGhlIHNhbWUgdHJhbnNhY3Rpb24gYXBwcm92YWwgZnJvbSBiZWluZyB1c2VkIG11bHRpcGxlIHRpbWVzXHJcbmNvbnN0IHByb2Nlc3NlZEFwcHJvdmFscyA9IG5ldyBNYXAoKTsgLy8gYXBwcm92YWxUb2tlbiAtPiB7IHRpbWVzdGFtcCwgdHhIYXNoLCB1c2VkOiB0cnVlIH1cclxuXHJcbmNvbnN0IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRyA9IHtcclxuICBBUFBST1ZBTF9USU1FT1VUOiAzMDAwMDAsIC8vIDUgbWludXRlcyAtIGFwcHJvdmFsIGV4cGlyZXMgYWZ0ZXIgdGhpc1xyXG4gIENMRUFOVVBfSU5URVJWQUw6IDYwMDAwICAgLy8gMSBtaW51dGUgLSBjbGVhbiB1cCBvbGQgYXBwcm92YWxzXHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFVuaXF1ZSBhcHByb3ZhbCB0b2tlblxyXG4gKi9cclxuZnVuY3Rpb24gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCkge1xyXG4gIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoMzIpO1xyXG4gIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyYXkpO1xyXG4gIHJldHVybiBBcnJheS5mcm9tKGFycmF5LCBieXRlID0+IGJ5dGUudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuZCBtYXJrcyBhbiBhcHByb3ZhbCB0b2tlbiBhcyB1c2VkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhcHByb3ZhbFRva2VuIC0gVG9rZW4gdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsaWQgYW5kIG5vdCB5ZXQgdXNlZFxyXG4gKi9cclxuZnVuY3Rpb24gdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pIHtcclxuICBpZiAoIWFwcHJvdmFsVG9rZW4pIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBObyBhcHByb3ZhbCB0b2tlbiBwcm92aWRlZCcpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYXBwcm92YWwgPSBwcm9jZXNzZWRBcHByb3ZhbHMuZ2V0KGFwcHJvdmFsVG9rZW4pO1xyXG5cclxuICBpZiAoIWFwcHJvdmFsKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgVW5rbm93biBhcHByb3ZhbCB0b2tlbicpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gTWFyayBhcyB1c2VkIElNTUVESUFURUxZIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zLlxyXG4gIC8vIEFueSBjb25jdXJyZW50IGNhbGwgd2lsbCBzZWUgdXNlZD10cnVlIGFuZCBiYWlsIG91dC5cclxuICBpZiAoYXBwcm92YWwudXNlZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEFwcHJvdmFsIHRva2VuIGFscmVhZHkgdXNlZCAtIHByZXZlbnRpbmcgcmVwbGF5IGF0dGFjaycpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBhcHByb3ZhbC51c2VkID0gdHJ1ZTtcclxuICBhcHByb3ZhbC51c2VkQXQgPSBEYXRlLm5vdygpO1xyXG5cclxuICAvLyBDaGVjayBpZiBhcHByb3ZhbCBoYXMgZXhwaXJlZFxyXG4gIGNvbnN0IGFnZSA9IERhdGUubm93KCkgLSBhcHByb3ZhbC50aW1lc3RhbXA7XHJcbiAgaWYgKGFnZSA+IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5BUFBST1ZBTF9USU1FT1VUKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQXBwcm92YWwgdG9rZW4gZXhwaXJlZCcpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLmRlbGV0ZShhcHByb3ZhbFRva2VuKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKCfwn6uAIEFwcHJvdmFsIHRva2VuIHZhbGlkYXRlZCBhbmQgbWFya2VkIGFzIHVzZWQnKTtcclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbi8vIENsZWFuIHVwIG9sZCBwcm9jZXNzZWQgYXBwcm92YWxzIGV2ZXJ5IG1pbnV0ZVxyXG5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBmb3IgKGNvbnN0IFt0b2tlbiwgYXBwcm92YWxdIG9mIHByb2Nlc3NlZEFwcHJvdmFscy5lbnRyaWVzKCkpIHtcclxuICAgIGNvbnN0IGFnZSA9IG5vdyAtIGFwcHJvdmFsLnRpbWVzdGFtcDtcclxuICAgIGlmIChhZ2UgPiBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcuQVBQUk9WQUxfVElNRU9VVCAqIDIpIHtcclxuICAgICAgcHJvY2Vzc2VkQXBwcm92YWxzLmRlbGV0ZSh0b2tlbik7XHJcbiAgICB9XHJcbiAgfVxyXG59LCBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcuQ0xFQU5VUF9JTlRFUlZBTCk7XHJcblxyXG4vLyBMYXN0IGdhcyBwcmljZSBhY3R1YWxseSBvYnNlcnZlZCBwZXIgbmV0d29yaywgc28gdGhlIHNhbml0eSBjYXAgYmVsb3cgY2FuIGRlZ3JhZGVcclxuLy8gdG8gYSByZWFsIGJvdW5kIGluc3RlYWQgb2Ygc3dpdGNoaW5nIG9mZiB3aGVuZXZlciB0aGUgUlBDIGlzIGJyaWVmbHkgdW5yZWFjaGFibGUuXHJcbmNvbnN0IExBU1RfR09PRF9HQVNfUFJJQ0VfS0VZID0gJ2xhc3RfZ29vZF9nYXNfcHJpY2UnO1xyXG5cclxuLyoqXHJcbiAqIFJlc29sdmVzIHRoZSBtYXhpbXVtIGdhcyBwcmljZSBhIGRBcHAgbWF5IHJlcXVlc3QsIGluIEd3ZWkuXHJcbiAqXHJcbiAqIFNFQ1VSSVRZOiB0aGlzIHVzZWQgdG8gZmFsbCBiYWNrIHRvIDEwLDAwMCwwMDAgR3dlaSAoXCJlc3NlbnRpYWxseSBubyBsaW1pdFwiKSB0aGVcclxuICogbW9tZW50IHRoZSBSUEMgY2FsbCBmYWlsZWQsIHdoaWNoIHN3aXRjaGVkIHRoZSBjaGVjayBvZmYgZXhhY3RseSB3aGVuIHRoZSBuZXR3b3JrXHJcbiAqIHdhcyBmbGFreS4gSW5zdGVhZCwgcmVtZW1iZXIgdGhlIGxhc3QgcHJpY2Ugd2UgYWN0dWFsbHkgc2F3IG9uIHRoaXMgbmV0d29yayBhbmRcclxuICogZGVyaXZlIHRoZSBmYWxsYmFjayBmcm9tIHRoYXQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuZXR3b3JrIC0gTmV0d29yayBrZXlcclxuICogQHJldHVybnMge1Byb21pc2U8e21heEdhc1ByaWNlR3dlaTogbnVtYmVyfG51bGwsIHNvdXJjZTogJ2xpdmUnfCdjYWNoZWQnfCd1bmtub3duJ30+fVxyXG4gKiAgICAgICAgICBtYXhHYXNQcmljZUd3ZWkgaXMgbnVsbCBvbmx5IHdoZW4gbm8gcHJpY2UgaGFzIGV2ZXIgYmVlbiBvYnNlcnZlZCBmb3IgdGhlXHJcbiAqICAgICAgICAgIG5ldHdvcmssIG1lYW5pbmcgdGhlcmUgaXMgbm8gaG9uZXN0IGJhc2lzIGZvciBhIGJvdW5kLlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZU1heEdhc1ByaWNlR3dlaShuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGN1cnJlbnRHYXNQcmljZSA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIGNvbnN0IGd3ZWkgPSBOdW1iZXIoQmlnSW50KGN1cnJlbnRHYXNQcmljZSkpIC8gMWU5O1xyXG5cclxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUoZ3dlaSkgJiYgZ3dlaSA+IDApIHtcclxuICAgICAgY29uc3QgY2FjaGUgPSAoYXdhaXQgbG9hZChMQVNUX0dPT0RfR0FTX1BSSUNFX0tFWSkpIHx8IHt9O1xyXG4gICAgICBjYWNoZVtuZXR3b3JrXSA9IHsgZ3dlaSwgb2JzZXJ2ZWRBdDogRGF0ZS5ub3coKSB9O1xyXG4gICAgICBhd2FpdCBzYXZlKExBU1RfR09PRF9HQVNfUFJJQ0VfS0VZLCBjYWNoZSk7XHJcblxyXG4gICAgICAvLyAzeCB0aGUgbGl2ZSBwcmljZSBhYnNvcmJzIG5vcm1hbCB2b2xhdGlsaXR5OyBmbG9vciBvZiAxMDAgR3dlaSBrZWVwc1xyXG4gICAgICAvLyB2ZXJ5IGNoZWFwIG5ldHdvcmtzIGZyb20gcHJvZHVjaW5nIGFuIGFic3VyZGx5IHRpZ2h0IGNhcC5cclxuICAgICAgcmV0dXJuIHsgbWF4R2FzUHJpY2VHd2VpOiBNYXRoLm1heChNYXRoLmNlaWwoZ3dlaSAqIDMpLCAxMDApLCBzb3VyY2U6ICdsaXZlJyB9O1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgR2FzIHByaWNlIGZldGNoIGZhaWxlZCwgZmFsbGluZyBiYWNrIHRvIGxhc3Qga25vd24gcHJpY2U6JywgZXJyb3IpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY2FjaGUgPSAoYXdhaXQgbG9hZChMQVNUX0dPT0RfR0FTX1BSSUNFX0tFWSkpIHx8IHt9O1xyXG4gIGNvbnN0IGNhY2hlZCA9IGNhY2hlW25ldHdvcmtdO1xyXG4gIGlmIChjYWNoZWQgJiYgTnVtYmVyLmlzRmluaXRlKGNhY2hlZC5nd2VpKSAmJiBjYWNoZWQuZ3dlaSA+IDApIHtcclxuICAgIC8vIExvb3NlciBtdWx0aXBsaWVyIHRoYW4gdGhlIGxpdmUgcGF0aCwgc2luY2UgYSBjYWNoZWQgcHJpY2UgbWF5IGJlIHN0YWxlIC1cclxuICAgIC8vIHN0aWxsIGEgZmluaXRlIGJvdW5kIHJhdGhlciB0aGFuIG5vbmUgYXQgYWxsLlxyXG4gICAgcmV0dXJuIHsgbWF4R2FzUHJpY2VHd2VpOiBNYXRoLm1heChNYXRoLmNlaWwoY2FjaGVkLmd3ZWkgKiA2KSwgMTAwKSwgc291cmNlOiAnY2FjaGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgLy8gTm8gbGl2ZSBwcmljZSBhbmQgbm90aGluZyBjYWNoZWQ6IHdlIGhhdmUgbm8gYmFzaXMgZm9yIGEgbnVtZXJpYyBib3VuZCwgYW5kXHJcbiAgLy8gaW52ZW50aW5nIG9uZSB3b3VsZCBqdXN0IGJlIGFuIGFyYml0cmFyeSBjb25zdGFudC4gTm90ZSB0aGF0IGEgZEFwcC1zdXBwbGllZFxyXG4gIC8vIGdhc1ByaWNlIGlzIGRpc2NhcmRlZCBiZWZvcmUgc2lnbmluZyAoc2VlIHR4VG9TZW5kIGJlbG93KSAtIHRoZSBmZWUgYWN0dWFsbHlcclxuICAvLyB1c2VkIGlzIGNvbXB1dGVkIGJ5IHRoZSB3YWxsZXQgZnJvbSB0aGUgbmV0d29yayBiYXNlIGZlZSAtIHNvIHRoaXMgY2hlY2sgaXMgYVxyXG4gIC8vIHJlcXVlc3Qtc2FuaXR5IGZpbHRlciwgbm90IHRoZSBjb250cm9sIG9uIHdoYXQgdGhlIHVzZXIgZW5kcyB1cCBwYXlpbmcuXHJcbiAgcmV0dXJuIHsgbWF4R2FzUHJpY2VHd2VpOiBudWxsLCBzb3VyY2U6ICd1bmtub3duJyB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NlbmRUcmFuc2FjdGlvbiAtIFNpZ24gYW5kIHNlbmQgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZW5kVHJhbnNhY3Rpb24ocGFyYW1zLCBvcmlnaW4pIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IENoZWNrIHJhdGUgbGltaXQgdG8gcHJldmVudCBzcGFtXHJcbiAgY29uc3QgcmF0ZUxpbWl0Q2hlY2sgPSBjaGVja1JhdGVMaW1pdChvcmlnaW4pO1xyXG4gIGlmICghcmF0ZUxpbWl0Q2hlY2suYWxsb3dlZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIFJhdGUgbGltaXQgZXhjZWVkZWQgZm9yIG9yaWdpbjonLCBvcmlnaW4pO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDIwMCwgbWVzc2FnZTogc2FuaXRpemVFcnJvck1lc3NhZ2UocmF0ZUxpbWl0Q2hlY2sucmVhc29uKSB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eFJlcXVlc3QgPSBwYXJhbXNbMF07XHJcblxyXG4gIC8vIEdldCBjdXJyZW50IG5ldHdvcmsgZnJvbSBzdG9yYWdlXHJcbiAgY29uc3QgY3VycmVudE5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpIHx8ICdwdWxzZWNoYWluJztcclxuXHJcbiAgLy8gU2FuaXR5LWJvdW5kIHRoZSBnYXMgcHJpY2UgdGhlIGRBcHAgYXNrZWQgZm9yLCByZWxhdGl2ZSB0byB0aGUgbGl2ZSBuZXR3b3JrIHByaWNlLlxyXG4gIGNvbnN0IHsgbWF4R2FzUHJpY2VHd2VpLCBzb3VyY2U6IGdhc0NhcFNvdXJjZSB9ID0gYXdhaXQgcmVzb2x2ZU1heEdhc1ByaWNlR3dlaShjdXJyZW50TmV0d29yayk7XHJcbiAgaWYgKGdhc0NhcFNvdXJjZSAhPT0gJ2xpdmUnKSB7XHJcbiAgICBjb25zb2xlLndhcm4oYPCfq4AgR2FzIHByaWNlIGNhcCBkZXJpdmVkIGZyb20gJHtnYXNDYXBTb3VyY2V9IHByaWNlIChSUEMgdW5hdmFpbGFibGUpYCk7XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogQ29tcHJlaGVuc2l2ZSB0cmFuc2FjdGlvbiB2YWxpZGF0aW9uXHJcbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0KHR4UmVxdWVzdCwgbWF4R2FzUHJpY2VHd2VpKTtcclxuICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBJbnZhbGlkIHRyYW5zYWN0aW9uIGZyb20gb3JpZ2luOicsIG9yaWdpbiwgdmFsaWRhdGlvbi5lcnJvcnMpO1xyXG4gICAgcmV0dXJuIHsgXHJcbiAgICAgIGVycm9yOiB7IFxyXG4gICAgICAgIGNvZGU6IC0zMjYwMiwgXHJcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgdHJhbnNhY3Rpb246ICcgKyBzYW5pdGl6ZUVycm9yTWVzc2FnZSh2YWxpZGF0aW9uLmVycm9ycy5qb2luKCc7ICcpKSBcclxuICAgICAgfSBcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBVc2Ugc2FuaXRpemVkIHRyYW5zYWN0aW9uIHBhcmFtZXRlcnNcclxuICBjb25zdCBzYW5pdGl6ZWRUeCA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBJbmNyZW1lbnQgcmF0ZSBsaW1pdCBjb3VudGVyXHJcbiAgaW5jcmVtZW50UmF0ZUxpbWl0KG9yaWdpbik7XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xyXG5cclxuICAgIC8vIFNFQ1VSSVRZOiBHZW5lcmF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiBmb3IgcmVwbGF5IHByb3RlY3Rpb25cclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5zZXQoYXBwcm92YWxUb2tlbiwge1xyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgdXNlZDogZmFsc2VcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyBTdG9yZSBzYW5pdGl6ZWQgdHJhbnNhY3Rpb24gaW5zdGVhZCBvZiBvcmlnaW5hbCByZXF1ZXN0XHJcbiAgICBwZW5kaW5nVHJhbnNhY3Rpb25zLnNldChyZXF1ZXN0SWQsIHsgXHJcbiAgICAgIHJlc29sdmUsIFxyXG4gICAgICByZWplY3QsIFxyXG4gICAgICBvcmlnaW4sIFxyXG4gICAgICB0eFJlcXVlc3Q6IHNhbml0aXplZFR4LFxyXG4gICAgICBhcHByb3ZhbFRva2VuICAvLyBJbmNsdWRlIHRva2VuIGZvciB2YWxpZGF0aW9uXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXRyYW5zYWN0aW9uJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdUcmFuc2FjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nVHJhbnNhY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1RyYW5zYWN0aW9uIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHRyYW5zYWN0aW9uIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVHJhbnNhY3Rpb25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkLCBzZXNzaW9uVG9rZW4sIGdhc1ByaWNlLCBjdXN0b21Ob25jZSwgdHhIYXNoLCB0eERldGFpbHMgPSBudWxsKSB7XHJcbiAgaWYgKCFwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdHhSZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nVHJhbnNhY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG5cclxuICAvLyBTRUNVUklUWTogVmFsaWRhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gdG8gcHJldmVudCByZXBsYXkgYXR0YWNrc1xyXG4gIGlmICghdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pKSB7XHJcbiAgICBwZW5kaW5nVHJhbnNhY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgZGVjcmVtZW50UGVuZGluZ0NvdW50KG9yaWdpbik7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdJbnZhbGlkIG9yIGFscmVhZHkgdXNlZCBhcHByb3ZhbCB0b2tlbiAtIHBvc3NpYmxlIHJlcGxheSBhdHRhY2snKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFwcHJvdmFsIHRva2VuJyB9O1xyXG4gIH1cclxuXHJcbiAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gRGVjcmVtZW50IHBlbmRpbmcgY291bnRlciAocmVxdWVzdCBjb21wbGV0ZWQpXHJcbiAgZGVjcmVtZW50UGVuZGluZ0NvdW50KG9yaWdpbik7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdHJhbnNhY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIHR4SGFzaCBpcyBwcm92aWRlZCwgdHJhbnNhY3Rpb24gd2FzIGFscmVhZHkgc2lnbmVkIGFuZCBicm9hZGNhc3QgaW4gdGhlIHBvcHVwXHJcbiAgICAvLyAoYnkgaGFyZHdhcmUgd2FsbGV0IE9SIHNvZnR3YXJlIHdhbGxldCkuIEp1c3Qgc2F2ZSB0byBoaXN0b3J5IGFuZCByZXNvbHZlLlxyXG4gICAgaWYgKHR4SGFzaCkge1xyXG4gICAgICBjb25zdCB3YWxsZXRUeXBlID0gdHhEZXRhaWxzID8gJ3NvZnR3YXJlJyA6ICdoYXJkd2FyZSc7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDwn6uAICR7d2FsbGV0VHlwZX0gd2FsbGV0IHRyYW5zYWN0aW9uIGFscmVhZHkgYnJvYWRjYXN0OmAsIHR4SGFzaCk7XHJcblxyXG4gICAgICAvLyBHZXQgYWN0aXZlIHdhbGxldCBmb3Igc2F2aW5nIHRvIGhpc3RvcnlcclxuICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG5cclxuICAgICAgLy8gU2F2ZSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5ICh1c2UgdHhEZXRhaWxzIGlmIHByb3ZpZGVkIGZvciBhY2N1cmF0ZSBkYXRhKVxyXG4gICAgICBjb25zdCBoaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgICAgaGFzaDogdHhIYXNoLFxyXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgICBmcm9tOiBhY3RpdmVXYWxsZXQuYWRkcmVzcyxcclxuICAgICAgICB0bzogdHhEZXRhaWxzPy50byB8fCB0eFJlcXVlc3QudG8gfHwgbnVsbCxcclxuICAgICAgICB2YWx1ZTogdHhEZXRhaWxzPy52YWx1ZSB8fCB0eFJlcXVlc3QudmFsdWUgfHwgJzAnLFxyXG4gICAgICAgIGRhdGE6IHR4RGV0YWlscz8uZGF0YSB8fCB0eFJlcXVlc3QuZGF0YSB8fCAnMHgnLFxyXG4gICAgICAgIGdhc1ByaWNlOiB0eERldGFpbHM/Lmdhc1ByaWNlIHx8ICcwJyxcclxuICAgICAgICBnYXNMaW1pdDogdHhEZXRhaWxzPy5nYXNMaW1pdCB8fCB0eFJlcXVlc3QuZ2FzTGltaXQgfHwgdHhSZXF1ZXN0LmdhcyB8fCBudWxsLFxyXG4gICAgICAgIG5vbmNlOiB0eERldGFpbHM/Lm5vbmNlID8/IG51bGwsXHJcbiAgICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICB0eXBlOiB0eEhpc3RvcnkuVFhfVFlQRVMuQ09OVFJBQ1RcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEluY2x1ZGUgRUlQLTE1NTkgZmllbGRzIGlmIHByb3ZpZGVkIChuZWVkZWQgZm9yIHNwZWVkLXVwL2NhbmNlbClcclxuICAgICAgaWYgKHR4RGV0YWlscz8ubWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgaGlzdG9yeUVudHJ5Lm1heEZlZVBlckdhcyA9IHR4RGV0YWlscy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR4RGV0YWlscz8ubWF4UHJpb3JpdHlGZWVQZXJHYXMpIHtcclxuICAgICAgICBoaXN0b3J5RW50cnkubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSB0eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShhY3RpdmVXYWxsZXQuYWRkcmVzcywgaGlzdG9yeUVudHJ5KTtcclxuXHJcbiAgICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU2VudCcsXHJcbiAgICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIHNlbnQ6ICR7dHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5gLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gU3RhcnQgbW9uaXRvcmluZyB0cmFuc2FjdGlvbiBmb3IgY29uZmlybWF0aW9uXHJcbiAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHsgaGFzaDogdHhIYXNoIH0sIHByb3ZpZGVyLCBhY3RpdmVXYWxsZXQuYWRkcmVzcyk7XHJcblxyXG4gICAgICAvLyBMb2cgc3VjY2Vzc2Z1bCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgICB0eXBlOiAndHJhbnNhY3Rpb24nLFxyXG4gICAgICAgIGFkZHJlc3M6IGFjdGl2ZVdhbGxldC5hZGRyZXNzLFxyXG4gICAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICAgIG1ldGhvZDogJ2V0aF9zZW5kVHJhbnNhY3Rpb24nLFxyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgdHhIYXNoOiB0eEhhc2gsXHJcbiAgICAgICAgd2FsbGV0VHlwZTogd2FsbGV0VHlwZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFJlc29sdmUgd2l0aCB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgICAgIHJlc29sdmUoeyByZXN1bHQ6IHR4SGFzaCB9KTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU29mdHdhcmUgd2FsbGV0IGZsb3cgLSB2YWxpZGF0ZSBzZXNzaW9uIGFuZCBnZXQgcGFzc3dvcmQgKG5vdyBhc3luYylcclxuICAgIGxldCBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG4gICAgbGV0IHNpZ25lciA9IG51bGw7XHJcbiAgICBsZXQgY29ubmVjdGVkU2lnbmVyID0gbnVsbDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgLy8gVW5sb2NrIHdhbGxldCB3aXRoIGF1dG8tdXBncmFkZSBub3RpZmljYXRpb25cclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICAvLyBOb3RpZnkgdXNlciB0aGF0IHdhbGxldCBlbmNyeXB0aW9uIGlzIGJlaW5nIHVwZ3JhZGVkXHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0IGVuY3J5cHRpb246ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYCk7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAn8J+UkCBTZWN1cml0eSBVcGdyYWRlIGluIFByb2dyZXNzJyxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBVcGdyYWRpbmcgd2FsbGV0IGVuY3J5cHRpb24gdG8gJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zIGZvciBlbmhhbmNlZCBzZWN1cml0eS4uLmAsXHJcbiAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG4gICAgY29uc3QgeyB1cGdyYWRlZCwgaXRlcmF0aW9uc0JlZm9yZSwgaXRlcmF0aW9uc0FmdGVyIH0gPSB1bmxvY2tSZXN1bHQ7XHJcblxyXG4gICAgLy8gU2hvdyBjb21wbGV0aW9uIG5vdGlmaWNhdGlvbiBpZiB1cGdyYWRlIG9jY3VycmVkXHJcbiAgICBpZiAodXBncmFkZWQpIHtcclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAn4pyFIFNlY3VyaXR5IFVwZ3JhZGUgQ29tcGxldGUnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBXYWxsZXQgZW5jcnlwdGlvbiB1cGdyYWRlZDogJHtpdGVyYXRpb25zQmVmb3JlLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2l0ZXJhdGlvbnNBZnRlci50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgY3VycmVudCBuZXR3b3JrXHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG5cclxuICAgIC8vIENvbm5lY3Qgc2lnbmVyIHRvIHByb3ZpZGVyXHJcbiAgICBjb25uZWN0ZWRTaWduZXIgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gUHJlcGFyZSB0cmFuc2FjdGlvbiAtIGNyZWF0ZSBhIGNsZWFuIGNvcHkgd2l0aCBvbmx5IG5lY2Vzc2FyeSBmaWVsZHNcclxuICAgIGNvbnN0IHR4VG9TZW5kID0ge1xyXG4gICAgICB0bzogdHhSZXF1ZXN0LnRvLFxyXG4gICAgICB2YWx1ZTogdHhSZXF1ZXN0LnZhbHVlIHx8ICcweDAnLFxyXG4gICAgICBkYXRhOiB0eFJlcXVlc3QuZGF0YSB8fCAnMHgnXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE5vbmNlIGhhbmRsaW5nIHByaW9yaXR5OlxyXG4gICAgLy8gMS4gVXNlci1wcm92aWRlZCBjdXN0b20gbm9uY2UgKGZvciByZXBsYWNpbmcgc3R1Y2sgdHJhbnNhY3Rpb25zKVxyXG4gICAgLy8gMi4gREFwcC1wcm92aWRlZCBub25jZSAodmFsaWRhdGVkKVxyXG4gICAgLy8gMy4gQXV0by1mZXRjaCBieSBldGhlcnMuanNcclxuICAgIGlmIChjdXN0b21Ob25jZSAhPT0gdW5kZWZpbmVkICYmIGN1c3RvbU5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIFVzZXIgbWFudWFsbHkgc2V0IG5vbmNlIChlLmcuLCB0byByZXBsYWNlIHN0dWNrIHRyYW5zYWN0aW9uKVxyXG4gICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHNpZ25lci5hZGRyZXNzLCAncGVuZGluZycpO1xyXG5cclxuICAgICAgaWYgKGN1c3RvbU5vbmNlIDwgY3VycmVudE5vbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDdXN0b20gbm9uY2UgJHtjdXN0b21Ob25jZX0gaXMgbGVzcyB0aGFuIGN1cnJlbnQgbm9uY2UgJHtjdXJyZW50Tm9uY2V9LiBUaGlzIG1heSBmYWlsIHVubGVzcyB5b3UncmUgcmVwbGFjaW5nIGEgcGVuZGluZyB0cmFuc2FjdGlvbi5gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHhUb1NlbmQubm9uY2UgPSBjdXN0b21Ob25jZTtcclxuICAgICAgLy8gVXNpbmcgY3VzdG9tIG5vbmNlXHJcbiAgICB9IGVsc2UgaWYgKHR4UmVxdWVzdC5ub25jZSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5ub25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBTRUNVUklUWTogVmFsaWRhdGUgbm9uY2UgaWYgcHJvdmlkZWQgYnkgREFwcFxyXG4gICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHNpZ25lci5hZGRyZXNzLCAncGVuZGluZycpO1xyXG4gICAgICBjb25zdCBwcm92aWRlZE5vbmNlID0gdHlwZW9mIHR4UmVxdWVzdC5ub25jZSA9PT0gJ3N0cmluZydcclxuICAgICAgICA/IHBhcnNlSW50KHR4UmVxdWVzdC5ub25jZSwgMTYpXHJcbiAgICAgICAgOiB0eFJlcXVlc3Qubm9uY2U7XHJcblxyXG4gICAgICAvLyBOb25jZSBtdXN0IGJlID49IGN1cnJlbnQgcGVuZGluZyBub25jZVxyXG4gICAgICBpZiAocHJvdmlkZWROb25jZSA8IGN1cnJlbnROb25jZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBub25jZTogJHtwcm92aWRlZE5vbmNlfSBpcyBsZXNzIHRoYW4gY3VycmVudCBub25jZSAke2N1cnJlbnROb25jZX1gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHhUb1NlbmQubm9uY2UgPSBwcm92aWRlZE5vbmNlO1xyXG4gICAgICAvLyBVc2luZyBEQXBwLXByb3ZpZGVkIG5vbmNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBJZiBubyBub25jZSBwcm92aWRlZCwgZXRoZXJzLmpzIHdpbGwgZmV0Y2ggdGhlIGNvcnJlY3Qgb25lIGF1dG9tYXRpY2FsbHlcclxuICAgICAgLy8gQXV0by1mZXRjaGluZyBub25jZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIERBcHAgcHJvdmlkZWQgYSBnYXMgbGltaXQsIHVzZSBpdC4gT3RoZXJ3aXNlIGxldCBldGhlcnMgZXN0aW1hdGUuXHJcbiAgICBpZiAodHhSZXF1ZXN0LmdhcyB8fCB0eFJlcXVlc3QuZ2FzTGltaXQpIHtcclxuICAgICAgdHhUb1NlbmQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzIHx8IHR4UmVxdWVzdC5nYXNMaW1pdDtcclxuICAgICAgLy8gVXNpbmcgcHJvdmlkZWQgZ2FzIGxpbWl0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRUlQLTE1NTkgZmVlczogdXNlIGEgZ2VuZXJvdXMgbWF4RmVlUGVyR2FzIGNhcCBzbyBQdWxzZUNoYWluJ3Mgdm9sYXRpbGUgYmFzZSBmZWVcclxuICAgIC8vIGNhbm5vdCBzdHJhbmQgdGhlIHRyYW5zYWN0aW9uIChvbmx5IHRoZSBhY3R1YWwgYmFzZSBmZWUgKyB0aXAgaXMgY2hhcmdlZCwgc28gdGhlXHJcbiAgICAvLyBoaWdoIGNhcCBjb3N0cyBub3RoaW5nIGV4dHJhKS4gQW55IFVJLXNlbGVjdGVkIGBnYXNQcmljZWAgaXMgaG9ub3JlZCBhcyBhIGZsb29yLlxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZmVlcyA9IGF3YWl0IHJwYy5nZXRFaXAxNTU5RmVlcyhuZXR3b3JrLCBnYXNQcmljZSB8fCBudWxsKTtcclxuICAgICAgdHhUb1NlbmQubWF4RmVlUGVyR2FzID0gZmVlcy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgIHR4VG9TZW5kLm1heFByaW9yaXR5RmVlUGVyR2FzID0gZmVlcy5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignRUlQLTE1NTkgZmVlIGNhbGMgZmFpbGVkLCBmYWxsaW5nIGJhY2sgdG8gcHJvdmlkZXIgZmVlIGRhdGE6JywgZXJyb3IpO1xyXG4gICAgICBjb25zdCBmZCA9IGF3YWl0IHByb3ZpZGVyLmdldEZlZURhdGEoKTtcclxuICAgICAgaWYgKGZkLm1heEZlZVBlckdhcykge1xyXG4gICAgICAgIHR4VG9TZW5kLm1heEZlZVBlckdhcyA9IGZkLm1heEZlZVBlckdhcztcclxuICAgICAgICB0eFRvU2VuZC5tYXhQcmlvcml0eUZlZVBlckdhcyA9IGZkLm1heFByaW9yaXR5RmVlUGVyR2FzID8/IChmZC5tYXhGZWVQZXJHYXMgLyAxMG4pO1xyXG4gICAgICB9IGVsc2UgaWYgKGZkLmdhc1ByaWNlKSB7XHJcbiAgICAgICAgdHhUb1NlbmQuZ2FzUHJpY2UgPSBmZC5nYXNQcmljZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNlbmQgdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgY29ubmVjdGVkU2lnbmVyLnNlbmRUcmFuc2FjdGlvbih0eFRvU2VuZCk7XHJcblxyXG4gICAgLy8gVHJhbnNhY3Rpb24gc2VudFxyXG5cclxuICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSAobmV0d29yayB2YXJpYWJsZSBhbHJlYWR5IGRlZmluZWQgYWJvdmUpXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3Rvcnkoc2lnbmVyLmFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBzaWduZXIuYWRkcmVzcyxcclxuICAgICAgdG86IHR4UmVxdWVzdC50byB8fCBudWxsLFxyXG4gICAgICB2YWx1ZTogdHhSZXF1ZXN0LnZhbHVlIHx8ICcwJyxcclxuICAgICAgZGF0YTogdHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogdHguZ2FzUHJpY2UgPyB0eC5nYXNQcmljZS50b1N0cmluZygpIDogKHR4Lm1heEZlZVBlckdhcyA/IHR4Lm1heEZlZVBlckdhcy50b1N0cmluZygpIDogJzAnKSxcclxuICAgICAgbWF4RmVlUGVyR2FzOiB0eC5tYXhGZWVQZXJHYXMgPyB0eC5tYXhGZWVQZXJHYXMudG9TdHJpbmcoKSA6IHVuZGVmaW5lZCxcclxuICAgICAgbWF4UHJpb3JpdHlGZWVQZXJHYXM6IHR4Lm1heFByaW9yaXR5RmVlUGVyR2FzID8gdHgubWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKSA6IHVuZGVmaW5lZCxcclxuICAgICAgZ2FzTGltaXQ6IHR4Lmdhc0xpbWl0ID8gdHguZ2FzTGltaXQudG9TdHJpbmcoKSA6IG51bGwsXHJcbiAgICAgIG5vbmNlOiB0eC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiB0eEhpc3RvcnkuVFhfVFlQRVMuQ09OVFJBQ1RcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNlbnQnLFxyXG4gICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gc2VudDogJHt0eC5oYXNoLnNsaWNlKDAsIDIwKX0uLi5gLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uIGluIGJhY2tncm91bmRcclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBzaWduZXIuYWRkcmVzcyk7XHJcblxyXG4gICAgLy8gTG9nIHN1Y2Nlc3NmdWwgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiAndHJhbnNhY3Rpb24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduZXIuYWRkcmVzcyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogJ2V0aF9zZW5kVHJhbnNhY3Rpb24nLFxyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICB0eEhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFJlc29sdmUgd2l0aCB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiB0eC5oYXNoIH0pO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCB9O1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICAgIC8vIE92ZXJ3cml0ZSBwYXNzd29yZCB3aXRoIGdhcmJhZ2UgYmVmb3JlIGRlcmVmZXJlbmNpbmdcclxuICAgICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgICAgcGFzc3dvcmQgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDbGVhbiB1cCBzaWduZXIncyBwcml2YXRlIGtleVxyXG4gICAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICAgIHNpZ25lciA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGNvbm5lY3RlZFNpZ25lcikge1xyXG4gICAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoY29ubmVjdGVkU2lnbmVyKTtcclxuICAgICAgICBjb25uZWN0ZWRTaWduZXIgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVHJhbnNhY3Rpb24gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgY29uc3Qgc2FuaXRpemVkRXJyb3IgPSBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKTtcclxuXHJcbiAgICAvLyBMb2cgZmFpbGVkIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogJ3RyYW5zYWN0aW9uJyxcclxuICAgICAgYWRkcmVzczogJ3Vua25vd24nLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiAnZXRoX3NlbmRUcmFuc2FjdGlvbicsXHJcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICBlcnJvcjogc2FuaXRpemVkRXJyb3IsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIHJlamVjdChuZXcgRXJyb3Ioc2FuaXRpemVkRXJyb3IpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVkRXJyb3IgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCB0cmFuc2FjdGlvbiByZXF1ZXN0IGRldGFpbHMgZm9yIHBvcHVwXHJcbmZ1bmN0aW9uIGdldFRyYW5zYWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4sIHR4UmVxdWVzdCB9ID0gcGVuZGluZ1RyYW5zYWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiwgdHhSZXF1ZXN0IH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3dhdGNoQXNzZXQgLSBBZGQgY3VzdG9tIHRva2VuIChFSVAtNzQ3KVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVXYXRjaEFzc2V0KHBhcmFtcywgb3JpZ2luLCB0YWIpIHtcclxuICAvLyBSZWNlaXZlZCB3YWxsZXRfd2F0Y2hBc3NldCByZXF1ZXN0XHJcblxyXG4gIC8vIFZhbGlkYXRlIHBhcmFtcyBzdHJ1Y3R1cmVcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zLnR5cGUgfHwgIXBhcmFtcy5vcHRpb25zKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHBhcmFtczogbXVzdCBpbmNsdWRlIHR5cGUgYW5kIG9wdGlvbnMnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgdHlwZSwgb3B0aW9ucyB9ID0gcGFyYW1zO1xyXG5cclxuICAvLyBPbmx5IHN1cHBvcnQgRVJDMjAvUFJDMjAgdG9rZW5zXHJcbiAgaWYgKHR5cGUudG9VcHBlckNhc2UoKSAhPT0gJ0VSQzIwJykge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnT25seSBFUkMyMC9QUkMyMCB0b2tlbnMgYXJlIHN1cHBvcnRlZCcgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgdG9rZW4gZmllbGRzXHJcbiAgaWYgKCFvcHRpb25zLmFkZHJlc3MgfHwgIW9wdGlvbnMuc3ltYm9sKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdUb2tlbiBtdXN0IGhhdmUgYWRkcmVzcyBhbmQgc3ltYm9sJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogZXZlcnkgZmllbGQgaGVyZSBpcyBkQXBwLWNvbnRyb2xsZWQgYW5kIGdldHMgc2hvd24gb24gYW4gYXBwcm92YWxcclxuICAvLyBzY3JlZW4sIHNvIHZhbGlkYXRlL2JvdW5kIGFsbCBvZiBpdC4gQW4gdW5ib3VuZGVkIHN5bWJvbCBjYW4gcHVzaCB0aGUgcmVhbFxyXG4gIC8vIG9yaWdpbiBhbmQgYWRkcmVzcyBvdXQgb2YgdmlldzsgYW4gYXJiaXRyYXJ5IGltYWdlIFVSTCBib3RoIGJlYWNvbnMgdGhlIHVzZXInc1xyXG4gIC8vIElQIGFuZCBsZXRzIGEgc2NhbSB0b2tlbiB3ZWFyIGEgbGVnaXRpbWF0ZSB0b2tlbidzIGxvZ28uXHJcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmFkZHJlc3MgIT09ICdzdHJpbmcnIHx8ICFldGhlcnMuaXNBZGRyZXNzKG9wdGlvbnMuYWRkcmVzcykpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ1Rva2VuIGFkZHJlc3MgaXMgbm90IGEgdmFsaWQgYWRkcmVzcycgfSB9O1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBvcHRpb25zLnN5bWJvbCAhPT0gJ3N0cmluZycpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ1Rva2VuIHN5bWJvbCBtdXN0IGJlIGEgc3RyaW5nJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBzeW1ib2wgPSBvcHRpb25zLnN5bWJvbFxyXG4gICAgLnJlcGxhY2UoL1tcXHUwMDAwLVxcdTAwMUZcXHUwMDdGLVxcdTAwOUZdL2csICcnKVxyXG4gICAgLnJlcGxhY2UoL1tcXHUyMDBCLVxcdTIwMEZcXHUyMDJBLVxcdTIwMkVcXHUyMDYwLVxcdTIwNjRcXHUyMDY2LVxcdTIwNjlcXHVGRUZGXS9nLCAnJylcclxuICAgIC50cmltKClcclxuICAgIC5zbGljZSgwLCAxNik7XHJcbiAgaWYgKCFzeW1ib2wpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ1Rva2VuIHN5bWJvbCBpcyBlbXB0eSBvciBpbnZhbGlkJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBkZWNpbWFscyA9IE51bWJlcihvcHRpb25zLmRlY2ltYWxzID8/IDE4KTtcclxuICBpZiAoIU51bWJlci5pc0ludGVnZXIoZGVjaW1hbHMpIHx8IGRlY2ltYWxzIDwgMCB8fCBkZWNpbWFscyA+IDM2KSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdUb2tlbiBkZWNpbWFscyBvdXQgb2YgcmFuZ2UnIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIE9ubHkgYWxsb3cgaHR0cHMgaW1hZ2UgVVJMcywgYW5kIGNhcCB0aGUgbGVuZ3RoLiBBbnl0aGluZyBlbHNlIGlzIGRyb3BwZWRcclxuICAvLyByYXRoZXIgdGhhbiByZWplY3RlZCwgc28gYSBiYWQgaW1hZ2UgZG9lcyBub3QgYmxvY2sgYW4gb3RoZXJ3aXNlIHZhbGlkIHJlcXVlc3QuXHJcbiAgbGV0IGltYWdlID0gbnVsbDtcclxuICBpZiAodHlwZW9mIG9wdGlvbnMuaW1hZ2UgPT09ICdzdHJpbmcnICYmIG9wdGlvbnMuaW1hZ2UubGVuZ3RoIDw9IDIwNDgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmIChuZXcgVVJMKG9wdGlvbnMuaW1hZ2UpLnByb3RvY29sID09PSAnaHR0cHM6Jykge1xyXG4gICAgICAgIGltYWdlID0gb3B0aW9ucy5pbWFnZTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8vIE5vdCBhIHBhcnNlYWJsZSBVUkwgLSBkcm9wIGl0XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCB0b2tlbkluZm8gPSB7XHJcbiAgICBhZGRyZXNzOiBvcHRpb25zLmFkZHJlc3MudG9Mb3dlckNhc2UoKSxcclxuICAgIHN5bWJvbCxcclxuICAgIGRlY2ltYWxzLFxyXG4gICAgaW1hZ2VcclxuICB9O1xyXG5cclxuICAvLyBSZXF1ZXN0aW5nIHRvIGFkZCB0b2tlblxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuICAgIHBlbmRpbmdUb2tlblJlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRva2VuSW5mbyB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPWFkZFRva2VuJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA1MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVG9rZW4gYWRkIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHRva2VuIGFkZCBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuQWRkQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCkge1xyXG4gIGlmICghcGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgdG9rZW5JbmZvIH0gPSBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCB0b2tlbicpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVG9rZW4gYXBwcm92ZWQgLSByZXR1cm4gdHJ1ZSAod2FsbGV0X3dhdGNoQXNzZXQgcmV0dXJucyBib29sZWFuKVxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogdHJ1ZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHRva2VuSW5mbyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRva2VuIGFkZCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICByZWplY3QobmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHRva2VuIGFkZCByZXF1ZXN0IGRldGFpbHMgZm9yIHBvcHVwXHJcbmZ1bmN0aW9uIGdldFRva2VuQWRkUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0b2tlbkluZm8gfSA9IHBlbmRpbmdUb2tlblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luLCB0b2tlbkluZm8gfTtcclxuICB9XHJcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQnIH07XHJcbn1cclxuXHJcbi8vIFNwZWVkIHVwIGEgcGVuZGluZyB0cmFuc2FjdGlvbiBieSByZXBsYWNpbmcgaXQgd2l0aCBoaWdoZXIgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbihhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgc2Vzc2lvblRva2VuLCBnYXNQcmljZU11bHRpcGxpZXIgPSAxLjIsIGN1c3RvbUdhc1ByaWNlID0gbnVsbCkge1xyXG4gIGxldCBwYXNzd29yZCA9IG51bGw7XHJcbiAgbGV0IHNpZ25lciA9IG51bGw7XHJcbiAgbGV0IHdhbGxldCA9IG51bGw7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIChub3cgYXN5bmMpXHJcbiAgICBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG5cclxuICAgIC8vIEdldCBvcmlnaW5hbCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICBjb25zdCBvcmlnaW5hbFR4ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4QnlIYXNoKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoKTtcclxuICAgIGlmICghb3JpZ2luYWxUeCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBub3QgZm91bmQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9yaWdpbmFsVHguc3RhdHVzICE9PSB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gaXMgbm90IHBlbmRpbmcnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHdhbGxldCBhbmQgdW5sb2NrIChhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkKVxyXG4gICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2lnbmVyID0gdW5sb2NrUmVzdWx0LnNpZ25lcjtcclxuXHJcbiAgICAvLyBTRUNVUklUWTogVmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBiZWxvbmdzIHRvIHRoaXMgd2FsbGV0XHJcbiAgICBjb25zdCB3YWxsZXRBZGRyZXNzID0gYXdhaXQgc2lnbmVyLmdldEFkZHJlc3MoKTtcclxuICAgIGlmICh3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEFkZHJlc3MgbWlzbWF0Y2ggaW4gc3BlZWQtdXA6IHdhbGxldCBhZGRyZXNzIGRvZXMgbm90IG1hdGNoIHJlcXVlc3QnKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnV2FsbGV0IGFkZHJlc3MgbWlzbWF0Y2gnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVmVyaWZ5IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGlzIGZyb20gdGhpcyB3YWxsZXRcclxuICAgIGlmIChvcmlnaW5hbFR4LmZyb20gJiYgb3JpZ2luYWxUeC5mcm9tLnRvTG93ZXJDYXNlKCkgIT09IHdhbGxldEFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRyYW5zYWN0aW9uIG93bmVyc2hpcCBjaGVjayBmYWlsZWQ6IHRyYW5zYWN0aW9uIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIHdhbGxldCcpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyB3YWxsZXQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IG5ldHdvcmsgYW5kIGNyZWF0ZSBwcm92aWRlciB3aXRoIGF1dG9tYXRpYyBmYWlsb3ZlclxyXG4gICAgY29uc3QgbmV0d29yayA9IG9yaWdpbmFsVHgubmV0d29yaztcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgd2FsbGV0ID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBhY3R1YWwgdHJhbnNhY3Rpb24gZnJvbSBibG9ja2NoYWluIHRvIGNoZWNrIGl0cyB0eXBlXHJcbiAgICAvLyBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIG9sZGVyIHRyYW5zYWN0aW9ucyBpbiBoaXN0b3J5IG1heSBub3QgaGF2ZSBFSVAtMTU1OSBmaWVsZHMgc3RvcmVkXHJcbiAgICBsZXQgaXNFSVAxNTU5ID0gb3JpZ2luYWxUeC5tYXhGZWVQZXJHYXMgfHwgb3JpZ2luYWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgIGxldCBvbkNoYWluTWF4RmVlUGVyR2FzID0gbnVsbDtcclxuICAgIGxldCBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBudWxsO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IG9uQ2hhaW5UeCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uKG9yaWdpbmFsVHhIYXNoKTtcclxuICAgICAgaWYgKG9uQ2hhaW5UeCkge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgRUlQLTE1NTkgKHR5cGUgMilcclxuICAgICAgICBpZiAob25DaGFpblR4LnR5cGUgPT09IDIgfHwgb25DaGFpblR4Lm1heEZlZVBlckdhcykge1xyXG4gICAgICAgICAgaXNFSVAxNTU5ID0gdHJ1ZTtcclxuICAgICAgICAgIG9uQ2hhaW5NYXhGZWVQZXJHYXMgPSBvbkNoYWluVHgubWF4RmVlUGVyR2FzO1xyXG4gICAgICAgICAgb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzID0gb25DaGFpblR4Lm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgRGV0ZWN0ZWQgRUlQLTE1NTkgdHJhbnNhY3Rpb24gZnJvbSBibG9ja2NoYWluOicsIHtcclxuICAgICAgICAgICAgbWF4RmVlUGVyR2FzOiBvbkNoYWluTWF4RmVlUGVyR2FzPy50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBtYXhQcmlvcml0eUZlZVBlckdhczogb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzPy50b1N0cmluZygpXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGZldGNoRXJyKSB7XHJcbiAgICAgIGNvbnNvbGUud2Fybign8J+rgCBDb3VsZCBub3QgZmV0Y2ggb3JpZ2luYWwgdHggZnJvbSBibG9ja2NoYWluOicsIGZldGNoRXJyLm1lc3NhZ2UpO1xyXG4gICAgICAvLyBDb250aW51ZSB3aXRoIHdoYXQgd2UgaGF2ZSBmcm9tIGhpc3RvcnlcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgcmVwbGFjZW1lbnQgdHJhbnNhY3Rpb24gd2l0aCBzYW1lIG5vbmNlLCBkYXRhLCBhbmQgZ2FzTGltaXRcclxuICAgIGNvbnN0IHJlcGxhY2VtZW50VHggPSB7XHJcbiAgICAgIHRvOiBvcmlnaW5hbFR4LnRvLFxyXG4gICAgICB2YWx1ZTogb3JpZ2luYWxUeC52YWx1ZSxcclxuICAgICAgZGF0YTogb3JpZ2luYWxUeC5kYXRhIHx8ICcweCcsXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEluY2x1ZGUgZ2FzTGltaXQgaWYgaXQgd2FzIGluIHRoZSBvcmlnaW5hbCB0cmFuc2FjdGlvblxyXG4gICAgaWYgKG9yaWdpbmFsVHguZ2FzTGltaXQpIHtcclxuICAgICAgcmVwbGFjZW1lbnRUeC5nYXNMaW1pdCA9IG9yaWdpbmFsVHguZ2FzTGltaXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRm9yIHN0b3JpbmcgaW4gaGlzdG9yeVxyXG4gICAgbGV0IG5ld0dhc1ByaWNlID0gbnVsbDtcclxuICAgIGxldCBuZXdNYXhGZWVQZXJHYXMgPSBudWxsO1xyXG4gICAgbGV0IG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gbnVsbDtcclxuXHJcbiAgICBpZiAoaXNFSVAxNTU5KSB7XHJcbiAgICAgIC8vIEVJUC0xNTU5OiBNdXN0IGJ1bXAgQk9USCBtYXhGZWVQZXJHYXMgYW5kIG1heFByaW9yaXR5RmVlUGVyR2FzIGJ5IGF0IGxlYXN0IDEwJVxyXG4gICAgICAvLyBVc2luZyAxMi41JSBidW1wIHRvIGVuc3VyZSBhY2NlcHRhbmNlIChzYW1lIGFzIEV0aGVyZXVtIGRlZmF1bHQpXHJcbiAgICAgIGNvbnN0IGJ1bXBNdWx0aXBsaWVyID0gMTEyNW47IC8vIDExMi41JSA9IDEuMTI1eFxyXG4gICAgICBjb25zdCBidW1wRGl2aXNvciA9IDEwMDBuO1xyXG5cclxuICAgICAgLy8gVXNlIG9uLWNoYWluIHZhbHVlcyBpZiBhdmFpbGFibGUgKG1vcmUgYWNjdXJhdGUpLCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGhpc3RvcnlcclxuICAgICAgY29uc3Qgb3JpZ2luYWxNYXhGZWUgPSBvbkNoYWluTWF4RmVlUGVyR2FzIHx8IEJpZ0ludChvcmlnaW5hbFR4Lm1heEZlZVBlckdhcyB8fCBvcmlnaW5hbFR4Lmdhc1ByaWNlIHx8ICcwJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsUHJpb3JpdHlGZWUgPSBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgfHwgQmlnSW50KG9yaWdpbmFsVHgubWF4UHJpb3JpdHlGZWVQZXJHYXMgfHwgJzAnKTtcclxuXHJcbiAgICAgIGlmIChjdXN0b21HYXNQcmljZSkge1xyXG4gICAgICAgIC8vIEN1c3RvbSBnYXMgcHJpY2U6IHVzZSBpdCBmb3IgbWF4RmVlUGVyR2FzLCBjYWxjdWxhdGUgcHJpb3JpdHkgZmVlXHJcbiAgICAgICAgY29uc3QgY3VzdG9tRmVlID0gQmlnSW50KGN1c3RvbUdhc1ByaWNlKTtcclxuICAgICAgICAvLyBQcmlvcml0eSBmZWUgc2hvdWxkIGJlIGF0IGxlYXN0IDEyLjUlIGhpZ2hlciB0aGFuIG9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgbWluUHJpb3JpdHlGZWUgPSAob3JpZ2luYWxQcmlvcml0eUZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG4gICAgICAgIC8vIFVzZSBhdCBsZWFzdCAxIEd3ZWkgZm9yIHByaW9yaXR5IGZlZSBpZiBub3Qgc2V0XHJcbiAgICAgICAgY29uc3QgcHJpb3JpdHlGZWUgPSBtaW5Qcmlvcml0eUZlZSA+IDBuID8gbWluUHJpb3JpdHlGZWUgOiAxMDAwMDAwMDAwbjtcclxuXHJcbiAgICAgICAgbmV3TWF4RmVlUGVyR2FzID0gY3VzdG9tRmVlO1xyXG4gICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gcHJpb3JpdHlGZWUgPCBjdXN0b21GZWUgPyBwcmlvcml0eUZlZSA6IGN1c3RvbUZlZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgYnVtcGVkIGZlZXMgKDEyLjUlIGhpZ2hlcilcclxuICAgICAgICBuZXdNYXhGZWVQZXJHYXMgPSAob3JpZ2luYWxNYXhGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IChvcmlnaW5hbFByaW9yaXR5RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcblxyXG4gICAgICAgIC8vIEVuc3VyZSBwcmlvcml0eSBmZWUgaXMgYXQgbGVhc3QgMSBHd2VpXHJcbiAgICAgICAgaWYgKG5ld01heFByaW9yaXR5RmVlUGVyR2FzIDwgMTAwMDAwMDAwMG4pIHtcclxuICAgICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gMTAwMDAwMDAwMG47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXBsYWNlbWVudFR4Lm1heEZlZVBlckdhcyA9IG5ld01heEZlZVBlckdhcztcclxuICAgICAgcmVwbGFjZW1lbnRUeC5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG5ld01heFByaW9yaXR5RmVlUGVyR2FzO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coJ/Cfq4AgRUlQLTE1NTkgc3BlZWQtdXA6Jywge1xyXG4gICAgICAgIG9yaWdpbmFsTWF4RmVlOiBvcmlnaW5hbE1heEZlZS50b1N0cmluZygpLFxyXG4gICAgICAgIG9yaWdpbmFsUHJpb3JpdHlGZWU6IG9yaWdpbmFsUHJpb3JpdHlGZWUudG9TdHJpbmcoKSxcclxuICAgICAgICBuZXdNYXhGZWU6IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpLFxyXG4gICAgICAgIG5ld1ByaW9yaXR5RmVlOiBuZXdNYXhQcmlvcml0eUZlZVBlckdhcy50b1N0cmluZygpXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTGVnYWN5IHRyYW5zYWN0aW9uOiB1c2UgZ2FzUHJpY2VcclxuICAgICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgICAgLy8gVXNlIGN1c3RvbSBnYXMgcHJpY2UgcHJvdmlkZWQgYnkgdXNlclxyXG4gICAgICAgIG5ld0dhc1ByaWNlID0gQmlnSW50KGN1c3RvbUdhc1ByaWNlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgZnJvbSBtdWx0aXBsaWVyICgxLjJ4IG9mIG9yaWdpbmFsIGJ5IGRlZmF1bHQpXHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxHYXNQcmljZSA9IEJpZ0ludChvcmlnaW5hbFR4Lmdhc1ByaWNlKTtcclxuICAgICAgICBuZXdHYXNQcmljZSA9IChvcmlnaW5hbEdhc1ByaWNlICogQmlnSW50KE1hdGguZmxvb3IoZ2FzUHJpY2VNdWx0aXBsaWVyICogMTAwKSkpIC8gQmlnSW50KDEwMCk7XHJcbiAgICAgIH1cclxuICAgICAgcmVwbGFjZW1lbnRUeC5nYXNQcmljZSA9IG5ld0dhc1ByaWNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uXHJcblxyXG4gICAgLy8gU2VuZCByZXBsYWNlbWVudCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgdHggPSBhd2FpdCB3YWxsZXQuc2VuZFRyYW5zYWN0aW9uKHJlcGxhY2VtZW50VHgpO1xyXG5cclxuICAgIC8vIFNhdmUgbmV3IHRyYW5zYWN0aW9uIHRvIGhpc3RvcnkgKGluY2x1ZGUgRUlQLTE1NTkgZmllbGRzIGlmIGFwcGxpY2FibGUpXHJcbiAgICBjb25zdCBoaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogYWRkcmVzcyxcclxuICAgICAgdG86IG9yaWdpbmFsVHgudG8sXHJcbiAgICAgIHZhbHVlOiBvcmlnaW5hbFR4LnZhbHVlLFxyXG4gICAgICBkYXRhOiBvcmlnaW5hbFR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlID8gbmV3R2FzUHJpY2UudG9TdHJpbmcoKSA6IChuZXdNYXhGZWVQZXJHYXMgPyBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKSA6IG9yaWdpbmFsVHguZ2FzUHJpY2UpLFxyXG4gICAgICBnYXNMaW1pdDogb3JpZ2luYWxUeC5nYXNMaW1pdCxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogb3JpZ2luYWxUeC50eXBlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEFkZCBFSVAtMTU1OSBmaWVsZHMgaWYgdGhpcyB3YXMgYW4gRUlQLTE1NTkgdHJhbnNhY3Rpb25cclxuICAgIGlmIChuZXdNYXhGZWVQZXJHYXMpIHtcclxuICAgICAgaGlzdG9yeUVudHJ5Lm1heEZlZVBlckdhcyA9IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5ld01heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgIGhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG5ld01heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIGhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyByZXBsYWNlZC9mYWlsZWRcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTcGVkIFVwJyxcclxuICAgICAgbWVzc2FnZTogYFJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHNlbnQgd2l0aCAke01hdGguZmxvb3IoZ2FzUHJpY2VNdWx0aXBsaWVyICogMTAwKX0lIGdhcyBwcmljZWAsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb25cclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2gsIG5ld0dhc1ByaWNlOiBuZXdHYXNQcmljZS50b1N0cmluZygpIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBTRUNVUklUWTogQ2xlYW4gdXAgc2Vuc2l0aXZlIGRhdGEgZnJvbSBtZW1vcnlcclxuICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICBjb25zdCB0ZW1wT2JqID0geyBwYXNzd29yZCB9O1xyXG4gICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChzaWduZXIpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHdhbGxldCkge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHdhbGxldCk7XHJcbiAgICAgIHdhbGxldCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBDYW5jZWwgYSBwZW5kaW5nIHRyYW5zYWN0aW9uIGJ5IHJlcGxhY2luZyBpdCB3aXRoIGEgemVyby12YWx1ZSB0eCB0byBzZWxmXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbmNlbFRyYW5zYWN0aW9uKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCBzZXNzaW9uVG9rZW4sIGN1c3RvbUdhc1ByaWNlID0gbnVsbCkge1xyXG4gIGxldCBwYXNzd29yZCA9IG51bGw7XHJcbiAgbGV0IHNpZ25lciA9IG51bGw7XHJcbiAgbGV0IHdhbGxldCA9IG51bGw7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIChub3cgYXN5bmMpXHJcbiAgICBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG5cclxuICAgIC8vIEdldCBvcmlnaW5hbCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICBjb25zdCBvcmlnaW5hbFR4ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4QnlIYXNoKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoKTtcclxuICAgIGlmICghb3JpZ2luYWxUeCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBub3QgZm91bmQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9yaWdpbmFsVHguc3RhdHVzICE9PSB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gaXMgbm90IHBlbmRpbmcnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHdhbGxldCBhbmQgdW5sb2NrIChhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkKVxyXG4gICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2lnbmVyID0gdW5sb2NrUmVzdWx0LnNpZ25lcjtcclxuXHJcbiAgICAvLyBTRUNVUklUWTogVmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBiZWxvbmdzIHRvIHRoaXMgd2FsbGV0XHJcbiAgICBjb25zdCB3YWxsZXRBZGRyZXNzID0gYXdhaXQgc2lnbmVyLmdldEFkZHJlc3MoKTtcclxuICAgIGlmICh3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEFkZHJlc3MgbWlzbWF0Y2ggaW4gY2FuY2VsOiB3YWxsZXQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCByZXF1ZXN0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1dhbGxldCBhZGRyZXNzIG1pc21hdGNoJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFZlcmlmeSBvcmlnaW5hbCB0cmFuc2FjdGlvbiBpcyBmcm9tIHRoaXMgd2FsbGV0XHJcbiAgICBpZiAob3JpZ2luYWxUeC5mcm9tICYmIG9yaWdpbmFsVHguZnJvbS50b0xvd2VyQ2FzZSgpICE9PSB3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBUcmFuc2FjdGlvbiBvd25lcnNoaXAgY2hlY2sgZmFpbGVkOiB0cmFuc2FjdGlvbiBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyB3YWxsZXQnKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgYWN0dWFsIHRyYW5zYWN0aW9uIGZyb20gYmxvY2tjaGFpbiB0byBjaGVjayBpdHMgdHlwZVxyXG4gICAgbGV0IGlzRUlQMTU1OSA9IG9yaWdpbmFsVHgubWF4RmVlUGVyR2FzIHx8IG9yaWdpbmFsVHgubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICBsZXQgb25DaGFpbk1heEZlZVBlckdhcyA9IG51bGw7XHJcbiAgICBsZXQgb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzID0gbnVsbDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBvbkNoYWluVHggPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbihvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICAgIGlmIChvbkNoYWluVHgpIHtcclxuICAgICAgICBpZiAob25DaGFpblR4LnR5cGUgPT09IDIgfHwgb25DaGFpblR4Lm1heEZlZVBlckdhcykge1xyXG4gICAgICAgICAgaXNFSVAxNTU5ID0gdHJ1ZTtcclxuICAgICAgICAgIG9uQ2hhaW5NYXhGZWVQZXJHYXMgPSBvbkNoYWluVHgubWF4RmVlUGVyR2FzO1xyXG4gICAgICAgICAgb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzID0gb25DaGFpblR4Lm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgRGV0ZWN0ZWQgRUlQLTE1NTkgdHJhbnNhY3Rpb24gZnJvbSBibG9ja2NoYWluIGZvciBjYW5jZWwnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGZldGNoRXJyKSB7XHJcbiAgICAgIGNvbnNvbGUud2Fybign8J+rgCBDb3VsZCBub3QgZmV0Y2ggb3JpZ2luYWwgdHggZnJvbSBibG9ja2NoYWluOicsIGZldGNoRXJyLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gKHNlbmQgMCB0byBzZWxmIHdpdGggc2FtZSBub25jZSlcclxuICAgIGNvbnN0IGNhbmNlbFR4ID0ge1xyXG4gICAgICB0bzogYWRkcmVzcywgIC8vIFNlbmQgdG8gc2VsZlxyXG4gICAgICB2YWx1ZTogJzAnLCAgIC8vIFplcm8gdmFsdWVcclxuICAgICAgZGF0YTogJzB4JywgICAvLyBFbXB0eSBkYXRhXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBnYXNMaW1pdDogMjEwMDAgIC8vIFN0YW5kYXJkIGdhcyBsaW1pdCBmb3Igc2ltcGxlIEVUSCB0cmFuc2ZlclxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBGb3Igc3RvcmluZyBpbiBoaXN0b3J5XHJcbiAgICBsZXQgbmV3R2FzUHJpY2UgPSBudWxsO1xyXG4gICAgbGV0IG5ld01heEZlZVBlckdhcyA9IG51bGw7XHJcbiAgICBsZXQgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBudWxsO1xyXG5cclxuICAgIGlmIChpc0VJUDE1NTkpIHtcclxuICAgICAgLy8gRUlQLTE1NTk6IE11c3QgYnVtcCBCT1RIIG1heEZlZVBlckdhcyBhbmQgbWF4UHJpb3JpdHlGZWVQZXJHYXMgYnkgYXQgbGVhc3QgMTAlXHJcbiAgICAgIGNvbnN0IGJ1bXBNdWx0aXBsaWVyID0gMTEyNW47IC8vIDExMi41JVxyXG4gICAgICBjb25zdCBidW1wRGl2aXNvciA9IDEwMDBuO1xyXG5cclxuICAgICAgLy8gVXNlIG9uLWNoYWluIHZhbHVlcyBpZiBhdmFpbGFibGVcclxuICAgICAgY29uc3Qgb3JpZ2luYWxNYXhGZWUgPSBvbkNoYWluTWF4RmVlUGVyR2FzIHx8IEJpZ0ludChvcmlnaW5hbFR4Lm1heEZlZVBlckdhcyB8fCBvcmlnaW5hbFR4Lmdhc1ByaWNlIHx8ICcwJyk7XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsUHJpb3JpdHlGZWUgPSBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgfHwgQmlnSW50KG9yaWdpbmFsVHgubWF4UHJpb3JpdHlGZWVQZXJHYXMgfHwgJzAnKTtcclxuXHJcbiAgICAgIGlmIChjdXN0b21HYXNQcmljZSkge1xyXG4gICAgICAgIC8vIEN1c3RvbSBnYXMgcHJpY2U6IHVzZSBpdCBmb3IgbWF4RmVlUGVyR2FzXHJcbiAgICAgICAgY29uc3QgY3VzdG9tRmVlID0gQmlnSW50KGN1c3RvbUdhc1ByaWNlKTtcclxuICAgICAgICBjb25zdCBtaW5Qcmlvcml0eUZlZSA9IChvcmlnaW5hbFByaW9yaXR5RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgY29uc3QgcHJpb3JpdHlGZWUgPSBtaW5Qcmlvcml0eUZlZSA+IDBuID8gbWluUHJpb3JpdHlGZWUgOiAxMDAwMDAwMDAwbjtcclxuXHJcbiAgICAgICAgbmV3TWF4RmVlUGVyR2FzID0gY3VzdG9tRmVlO1xyXG4gICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gcHJpb3JpdHlGZWUgPCBjdXN0b21GZWUgPyBwcmlvcml0eUZlZSA6IGN1c3RvbUZlZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgYnVtcGVkIGZlZXNcclxuICAgICAgICBuZXdNYXhGZWVQZXJHYXMgPSAob3JpZ2luYWxNYXhGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IChvcmlnaW5hbFByaW9yaXR5RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcblxyXG4gICAgICAgIGlmIChuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA8IDEwMDAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IDEwMDAwMDAwMDBuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY2FuY2VsVHgubWF4RmVlUGVyR2FzID0gbmV3TWF4RmVlUGVyR2FzO1xyXG4gICAgICBjYW5jZWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG5ld01heFByaW9yaXR5RmVlUGVyR2FzO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coJ/Cfq4AgRUlQLTE1NTkgY2FuY2VsOicsIHtcclxuICAgICAgICBvcmlnaW5hbE1heEZlZTogb3JpZ2luYWxNYXhGZWUudG9TdHJpbmcoKSxcclxuICAgICAgICBvcmlnaW5hbFByaW9yaXR5RmVlOiBvcmlnaW5hbFByaW9yaXR5RmVlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbmV3TWF4RmVlOiBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKSxcclxuICAgICAgICBuZXdQcmlvcml0eUZlZTogbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIExlZ2FjeSB0cmFuc2FjdGlvblxyXG4gICAgICBpZiAoY3VzdG9tR2FzUHJpY2UpIHtcclxuICAgICAgICBuZXdHYXNQcmljZSA9IEJpZ0ludChjdXN0b21HYXNQcmljZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxHYXNQcmljZSA9IEJpZ0ludChvcmlnaW5hbFR4Lmdhc1ByaWNlKTtcclxuICAgICAgICBuZXdHYXNQcmljZSA9IChvcmlnaW5hbEdhc1ByaWNlICogQmlnSW50KDEyMCkpIC8gQmlnSW50KDEwMCk7XHJcbiAgICAgIH1cclxuICAgICAgY2FuY2VsVHguZ2FzUHJpY2UgPSBuZXdHYXNQcmljZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYW5jZWxsaW5nIHRyYW5zYWN0aW9uXHJcblxyXG4gICAgLy8gU2VuZCBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgd2FsbGV0LnNlbmRUcmFuc2FjdGlvbihjYW5jZWxUeCk7XHJcblxyXG4gICAgLy8gU2F2ZSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgY29uc3QgaGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICBoYXNoOiB0eC5oYXNoLFxyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIGZyb206IGFkZHJlc3MsXHJcbiAgICAgIHRvOiBhZGRyZXNzLFxyXG4gICAgICB2YWx1ZTogJzAnLFxyXG4gICAgICBkYXRhOiAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogbmV3R2FzUHJpY2UgPyBuZXdHYXNQcmljZS50b1N0cmluZygpIDogKG5ld01heEZlZVBlckdhcyA/IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpIDogb3JpZ2luYWxUeC5nYXNQcmljZSksXHJcbiAgICAgIGdhc0xpbWl0OiAnMjEwMDAnLFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiAnc2VuZCdcclxuICAgIH07XHJcblxyXG4gICAgaWYgKG5ld01heEZlZVBlckdhcykge1xyXG4gICAgICBoaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMpIHtcclxuICAgICAgaGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgaGlzdG9yeUVudHJ5KTtcclxuXHJcbiAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIGZhaWxlZFxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCwgbnVsbCk7XHJcblxyXG4gICAgLy8gU2VuZCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENhbmNlbGxlZCcsXHJcbiAgICAgIG1lc3NhZ2U6ICdDYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gc2VudCcsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb25cclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2ggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICBwYXNzd29yZCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgc2lnbmVyID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmICh3YWxsZXQpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcih3YWxsZXQpO1xyXG4gICAgICB3YWxsZXQgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGN1cnJlbnQgbmV0d29yayBnYXMgcHJpY2UgKGZvciBzcGVlZC11cCBVSSlcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudE5ldHdvcmtHYXNQcmljZShuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEdldCBmdWxsIGdhcyBwcmljZSByZWNvbW1lbmRhdGlvbnMgYmFzZWQgb24gZmVlIGhpc3RvcnlcclxuICAgIGNvbnN0IHJlY29tbWVuZGF0aW9ucyA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZVJlY29tbWVuZGF0aW9ucyhuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBVc2UgXCJmYXN0XCIgdGllciBhcyB0aGUgcmVjb21tZW5kZWQgc3BlZWQtdXAgcHJpY2VcclxuICAgIGNvbnN0IGZhc3RQcmljZSA9IEJpZ0ludChyZWNvbW1lbmRhdGlvbnMuZmFzdC5tYXhGZWVQZXJHYXMpO1xyXG4gICAgY29uc3QgaW5zdGFudFByaWNlID0gQmlnSW50KHJlY29tbWVuZGF0aW9ucy5pbnN0YW50Lm1heEZlZVBlckdhcyk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgZ2FzUHJpY2U6IGZhc3RQcmljZS50b1N0cmluZygpLFxyXG4gICAgICBnYXNQcmljZUd3ZWk6IChOdW1iZXIoZmFzdFByaWNlKSAvIDFlOSkudG9GaXhlZCgyKSxcclxuICAgICAgcmVjb21tZW5kYXRpb25zOiB7XHJcbiAgICAgICAgc2xvdzogcmVjb21tZW5kYXRpb25zLnNsb3cubWF4RmVlUGVyR2FzLFxyXG4gICAgICAgIG5vcm1hbDogcmVjb21tZW5kYXRpb25zLm5vcm1hbC5tYXhGZWVQZXJHYXMsXHJcbiAgICAgICAgZmFzdDogcmVjb21tZW5kYXRpb25zLmZhc3QubWF4RmVlUGVyR2FzLFxyXG4gICAgICAgIGluc3RhbnQ6IHJlY29tbWVuZGF0aW9ucy5pbnN0YW50Lm1heEZlZVBlckdhc1xyXG4gICAgICB9LFxyXG4gICAgICBpbnN0YW50UHJpY2U6IGluc3RhbnRQcmljZS50b1N0cmluZygpLFxyXG4gICAgICBpbnN0YW50UHJpY2VHd2VpOiAoTnVtYmVyKGluc3RhbnRQcmljZSkgLyAxZTkpLnRvRml4ZWQoMilcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgZmV0Y2hpbmcgY3VycmVudCBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVmcmVzaCB0cmFuc2FjdGlvbiBzdGF0dXMgZnJvbSBibG9ja2NoYWluXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hUcmFuc2FjdGlvblN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgUmVmcmVzaGluZyB0eCBzdGF0dXM6ICR7dHhIYXNofSBvbiAke25ldHdvcmt9YCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBHZXQgdHJhbnNhY3Rpb24gcmVjZWlwdCBmcm9tIGJsb2NrY2hhaW5cclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvblJlY2VpcHQodHhIYXNoKTtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFJlY2VpcHQgZm9yICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi46YCwgcmVjZWlwdCA/ICdmb3VuZCcgOiAnbnVsbCcpO1xyXG5cclxuICAgIGlmICghcmVjZWlwdCkge1xyXG4gICAgICAvLyBObyByZWNlaXB0IC0gY2hlY2sgaWYgdHJhbnNhY3Rpb24gaXMgc3RpbGwgaW4gbWVtcG9vbFxyXG4gICAgICBjb25zdCB0eCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uKHR4SGFzaCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDwn6uAIE1lbXBvb2wgdHggZm9yICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi46YCwgdHggPyAnZm91bmQnIDogJ251bGwnKTtcclxuXHJcbiAgICAgIGlmICghdHgpIHtcclxuICAgICAgICAvLyBUcmFuc2FjdGlvbiBub3QgaW4gbWVtcG9vbCBhbmQgbm8gcmVjZWlwdCA9IGRyb3BwZWQvZXZpY3RlZFxyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn6uAIFRyYW5zYWN0aW9uICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4gd2FzIERST1BQRUQgLSBtYXJraW5nIGFzIGZhaWxlZGApO1xyXG4gICAgICAgIC8vIE1hcmsgYXMgZmFpbGVkIGluIGxvY2FsIGhpc3RvcnlcclxuICAgICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgICBhZGRyZXNzLFxyXG4gICAgICAgICAgdHhIYXNoLFxyXG4gICAgICAgICAgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsXHJcbiAgICAgICAgICBudWxsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICBzdGF0dXM6ICdkcm9wcGVkJyxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiB3YXMgZHJvcHBlZCBmcm9tIG1lbXBvb2wgKG5vdCBjb25maXJtZWQsIG5vIGxvbmdlciBwZW5kaW5nKSdcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBleGlzdHMgaW4gbWVtcG9vbCwgc3RpbGwgcGVuZGluZ1xyXG4gICAgICBjb25zb2xlLmxvZyhg8J+rgCBUcmFuc2FjdGlvbiAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uIHN0aWxsIGluIG1lbXBvb2xgKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiBpcyBzdGlsbCBwZW5kaW5nIG9uIHRoZSBibG9ja2NoYWluJ1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRyYW5zYWN0aW9uIGhhcyBiZWVuIG1pbmVkXHJcbiAgICBsZXQgbmV3U3RhdHVzO1xyXG4gICAgaWYgKHJlY2VpcHQuc3RhdHVzID09PSAxKSB7XHJcbiAgICAgIG5ld1N0YXR1cyA9IHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVEO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmV3U3RhdHVzID0gdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIGxvY2FsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgYWRkcmVzcyxcclxuICAgICAgdHhIYXNoLFxyXG4gICAgICBuZXdTdGF0dXMsXHJcbiAgICAgIHJlY2VpcHQuYmxvY2tOdW1iZXJcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgc3RhdHVzOiBuZXdTdGF0dXMsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiByZWNlaXB0LmJsb2NrTnVtYmVyLFxyXG4gICAgICBtZXNzYWdlOiBuZXdTdGF0dXMgPT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVEXHJcbiAgICAgICAgPyAnVHJhbnNhY3Rpb24gY29uZmlybWVkIG9uIGJsb2NrY2hhaW4nXHJcbiAgICAgICAgOiAnVHJhbnNhY3Rpb24gZmFpbGVkIG9uIGJsb2NrY2hhaW4nXHJcbiAgICB9O1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciByZWZyZXNoaW5nIHRyYW5zYWN0aW9uIHN0YXR1czonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBSZWJyb2FkY2FzdCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gdG8gYWxsIGNvbmZpZ3VyZWQgUlBDc1xyXG5hc3luYyBmdW5jdGlvbiByZWJyb2FkY2FzdFRyYW5zYWN0aW9uKHR4SGFzaCwgbmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBSZWJyb2FkY2FzdGluZyB0cmFuc2FjdGlvbjogJHt0eEhhc2h9IHRvIGFsbCAke25ldHdvcmt9IFJQQ3NgKTtcclxuXHJcbiAgICAvLyBGaXJzdCwgdHJ5IHRvIGdldCB0aGUgcmF3IHRyYW5zYWN0aW9uXHJcbiAgICBsZXQgcmF3VHggPSBhd2FpdCBycGMuZ2V0UmF3VHJhbnNhY3Rpb24obmV0d29yaywgdHhIYXNoKTtcclxuXHJcbiAgICBpZiAoIXJhd1R4KSB7XHJcbiAgICAgIC8vIElmIGdldFJhd1RyYW5zYWN0aW9uIG5vdCBzdXBwb3J0ZWQsIHdlIG5lZWQgdG8gcmVjb25zdHJ1Y3QgZnJvbSB0eCBkYXRhXHJcbiAgICAgIC8vIEdldCB0aGUgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgY29uc3QgdHggPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbih0eEhhc2gpO1xyXG5cclxuICAgICAgaWYgKCF0eCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgIGVycm9yOiAnVHJhbnNhY3Rpb24gbm90IGZvdW5kIGluIG1lbXBvb2wgLSBpdCBtYXkgaGF2ZSBiZWVuIGRyb3BwZWQgb3IgYWxyZWFkeSBjb25maXJtZWQnXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR2V0IHRoZSByYXcgc2VyaWFsaXplZCB0cmFuc2FjdGlvbiBmcm9tIHRoZSBwcm92aWRlclxyXG4gICAgICAvLyBldGhlcnMgdjYgZG9lc24ndCBleHBvc2UgcmF3IHR4IGRpcmVjdGx5LCBzbyB3ZSB1c2UgYSB3b3JrYXJvdW5kXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gVHJ5IGRpcmVjdCBSUEMgY2FsbCB0byBnZXQgcmF3IHR4XHJcbiAgICAgICAgY29uc3QgcmF3UmVzdWx0ID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldFJhd1RyYW5zYWN0aW9uQnlIYXNoJywgW3R4SGFzaF0pO1xyXG4gICAgICAgIGlmIChyYXdSZXN1bHQpIHtcclxuICAgICAgICAgIHJhd1R4ID0gcmF3UmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGdldCByYXcgdHJhbnNhY3Rpb24gdmlhIFJQQzonLCBlLm1lc3NhZ2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXJhd1R4KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6ICdDYW5ub3QgZ2V0IHJhdyB0cmFuc2FjdGlvbiBkYXRhLiBUaGUgUlBDIG5vZGVzIG1heSBub3Qgc3VwcG9ydCB0aGlzIG9wZXJhdGlvbi4nXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJyb2FkY2FzdCB0byBhbGwgUlBDc1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHJwYy5icm9hZGNhc3RUb0FsbFJwY3MobmV0d29yaywgcmF3VHgpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFJlYnJvYWRjYXN0IHJlc3VsdHMgLSBTdWNjZXNzZXM6ICR7cmVzdWx0cy5zdWNjZXNzZXMubGVuZ3RofSwgRmFpbHVyZXM6ICR7cmVzdWx0cy5mYWlsdXJlcy5sZW5ndGh9YCk7XHJcblxyXG4gICAgaWYgKHJlc3VsdHMuc3VjY2Vzc2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBicm9hZGNhc3QgdG8gJHtyZXN1bHRzLnN1Y2Nlc3Nlcy5sZW5ndGh9IFJQQyhzKWAsXHJcbiAgICAgICAgc3VjY2Vzc2VzOiByZXN1bHRzLnN1Y2Nlc3NlcyxcclxuICAgICAgICBmYWlsdXJlczogcmVzdWx0cy5mYWlsdXJlc1xyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byBicm9hZGNhc3QgdG8gYW55IFJQQycsXHJcbiAgICAgICAgZmFpbHVyZXM6IHJlc3VsdHMuZmFpbHVyZXNcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgcmVicm9hZGNhc3RpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gVHJhY2sgdHJhbnNhY3Rpb25zIGJlaW5nIG1vbml0b3JlZCB0byBwcmV2ZW50IGR1cGxpY2F0ZXNcclxuY29uc3QgbW9uaXRvcmluZ1RyYW5zYWN0aW9ucyA9IG5ldyBTZXQoKTtcclxuXHJcbi8vIFdhaXQgZm9yIHRyYW5zYWN0aW9uIGNvbmZpcm1hdGlvbiB3aXRoIHRpbWVvdXQgYW5kIHJldHJ5XHJcbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKSB7XHJcbiAgY29uc3QgdHhIYXNoID0gdHguaGFzaDtcclxuXHJcbiAgLy8gUHJldmVudCBkdXBsaWNhdGUgbW9uaXRvcmluZ1xyXG4gIGlmIChtb25pdG9yaW5nVHJhbnNhY3Rpb25zLmhhcyh0eEhhc2gpKSB7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBUcmFuc2FjdGlvbiAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uIGFscmVhZHkgYmVpbmcgbW9uaXRvcmVkYCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIG1vbml0b3JpbmdUcmFuc2FjdGlvbnMuYWRkKHR4SGFzaCk7XHJcblxyXG4gIGNvbnN0IFBPTExfSU5URVJWQUwgPSAxNSAqIDEwMDA7IC8vIDE1IHNlY29uZHNcclxuICBjb25zdCBNQVhfUkVUUklFUyA9IDQwOyAvLyA0MCAqIDE1cyA9IDEwIG1pbnV0ZXNcclxuXHJcbiAgdHJ5IHtcclxuICAgIGxldCByZWNlaXB0ID0gbnVsbDtcclxuICAgIGxldCByZXRyaWVzID0gMDtcclxuXHJcbiAgICAvLyBQb2xsIGZvciByZWNlaXB0IHdpdGggdGltZW91dFxyXG4gICAgd2hpbGUgKCFyZWNlaXB0ICYmIHJldHJpZXMgPCBNQVhfUkVUUklFUykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvblJlY2VpcHQodHhIYXNoKTtcclxuICAgICAgICBpZiAocmVjZWlwdCkgYnJlYWs7XHJcbiAgICAgIH0gY2F0Y2ggKHJwY0Vycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGDwn6uAIFJQQyBlcnJvciBjaGVja2luZyB0eCAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uLCByZXRyeWluZzpgLCBycGNFcnJvci5tZXNzYWdlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2FpdCBiZWZvcmUgbmV4dCBwb2xsXHJcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBQT0xMX0lOVEVSVkFMKSk7XHJcbiAgICAgIHJldHJpZXMrKztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlY2VpcHQpIHtcclxuICAgICAgY29uc29sZS53YXJuKGDwn6uAIFRyYW5zYWN0aW9uICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4gY29uZmlybWF0aW9uIHRpbWVkIG91dCBhZnRlciAke01BWF9SRVRSSUVTfSBhdHRlbXB0c2ApO1xyXG4gICAgICAvLyBEb24ndCBtYXJrIGFzIGZhaWxlZCAtIGl0IG1pZ2h0IHN0aWxsIGJlIHBlbmRpbmcgaW4gbWVtcG9vbFxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlY2VpcHQuc3RhdHVzID09PSAxKSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBzdWNjZXNzZnVsbHlcclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoLFxyXG4gICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVELFxyXG4gICAgICAgIHJlY2VpcHQuYmxvY2tOdW1iZXJcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENvbmZpcm1lZCcsXHJcbiAgICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBpbiBibG9jayAke3JlY2VpcHQuYmxvY2tOdW1iZXJ9YCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIHJldmVydGVkIChzdGF0dXMgPT09IDApXHJcbiAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgICBhZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaCxcclxuICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCxcclxuICAgICAgICByZWNlaXB0LmJsb2NrTnVtYmVyXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBGYWlsZWQnLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiB3YXMgcmV2ZXJ0ZWQgb24tY2hhaW4nLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGluIGNvbmZpcm1hdGlvbiBtb25pdG9yaW5nOicsIGVycm9yKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gQWx3YXlzIGNsZWFuIHVwIHRyYWNraW5nXHJcbiAgICBtb25pdG9yaW5nVHJhbnNhY3Rpb25zLmRlbGV0ZSh0eEhhc2gpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gTUVTU0FHRSBTSUdOSU5HIEhBTkRMRVJTID09PT09XHJcblxyXG4vLyBIYW5kbGUgcGVyc29uYWxfc2lnbiAoRUlQLTE5MSkgLSBTaWduIGEgbWVzc2FnZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVQZXJzb25hbFNpZ24ocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCkge1xyXG4gIC8vIENoZWNrIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKCFhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ05vdCBhdXRob3JpemVkLiBQbGVhc2UgY29ubmVjdCB5b3VyIHdhbGxldCBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHNpZ24gcmVxdWVzdFxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKTtcclxuICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBJbnZhbGlkIHNpZ24gcmVxdWVzdCBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3IpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiAtMzI2MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcilcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgbWVzc2FnZSwgYWRkcmVzcyB9ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBDaGVjayBpZiBldGhfc2lnbiBpcyBhbGxvd2VkIChkaXNhYmxlZCBieSBkZWZhdWx0KVxyXG4gIGlmIChtZXRob2QgPT09ICdldGhfc2lnbicpIHtcclxuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgbG9hZCgnc2V0dGluZ3MnKTtcclxuICAgIGNvbnN0IGFsbG93RXRoU2lnbiA9IHNldHRpbmdzPy5hbGxvd0V0aFNpZ24gfHwgZmFsc2U7XHJcblxyXG4gICAgaWYgKCFhbGxvd0V0aFNpZ24pIHtcclxuICAgICAgY29uc29sZS53YXJuKCfwn6uAIGV0aF9zaWduIHJlcXVlc3QgYmxvY2tlZCAoZGlzYWJsZWQgaW4gc2V0dGluZ3MpOicsIG9yaWdpbik7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZXJyb3I6IHtcclxuICAgICAgICAgIGNvZGU6IDQxMDAsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnZXRoX3NpZ24gaXMgZGlzYWJsZWQgZm9yIHNlY3VyaXR5LiBVc2UgcGVyc29uYWxfc2lnbiBpbnN0ZWFkLCBvciBlbmFibGUgZXRoX3NpZ24gaW4gd2FsbGV0IHNldHRpbmdzLidcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTG9nIHdhcm5pbmcgd2hlbiBldGhfc2lnbiBpcyB1c2VkIChldmVuIHdoZW4gZW5hYmxlZClcclxuICAgIGNvbnNvbGUud2Fybign4pqg77iPIGV0aF9zaWduIHJlcXVlc3QgYXBwcm92ZWQgYnkgc2V0dGluZ3MgZnJvbTonLCBvcmlnaW4pO1xyXG4gIH1cclxuXHJcbiAgLy8gVmVyaWZ5IHRoZSBhZGRyZXNzIG1hdGNoZXMgdGhlIGNvbm5lY3RlZCBhY2NvdW50XHJcbiAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgaWYgKCF3YWxsZXQgfHwgd2FsbGV0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IDQxMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ1JlcXVlc3RlZCBhZGRyZXNzIGRvZXMgbm90IG1hdGNoIGNvbm5lY3RlZCBhY2NvdW50J1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHtcclxuICAgICAgcmVzb2x2ZSxcclxuICAgICAgcmVqZWN0LFxyXG4gICAgICBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZCxcclxuICAgICAgc2lnblJlcXVlc3Q6IHsgbWVzc2FnZSwgYWRkcmVzcyB9LFxyXG4gICAgICBhcHByb3ZhbFRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXNpZ24mcmVxdWVzdElkPSR7cmVxdWVzdElkfSZtZXRob2Q9JHttZXRob2R9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nU2lnblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdTaWduIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9zaWduVHlwZWREYXRhIChFSVAtNzEyKSAtIFNpZ24gdHlwZWQgZGF0YVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTaWduVHlwZWREYXRhKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpIHtcclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBzaWduIHJlcXVlc3RcclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVTaWduUmVxdWVzdChtZXRob2QsIHBhcmFtcyk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCBzaWduIHR5cGVkIGRhdGEgcmVxdWVzdCBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3IpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiAtMzI2MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcilcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgYWRkcmVzcywgdHlwZWREYXRhIH0gPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gVmVyaWZ5IHRoZSBhZGRyZXNzIG1hdGNoZXMgdGhlIGNvbm5lY3RlZCBhY2NvdW50XHJcbiAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgaWYgKCF3YWxsZXQgfHwgd2FsbGV0LmFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IDQxMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ1JlcXVlc3RlZCBhZGRyZXNzIGRvZXMgbm90IG1hdGNoIGNvbm5lY3RlZCBhY2NvdW50J1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHtcclxuICAgICAgcmVzb2x2ZSxcclxuICAgICAgcmVqZWN0LFxyXG4gICAgICBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZCxcclxuICAgICAgc2lnblJlcXVlc3Q6IHsgdHlwZWREYXRhLCBhZGRyZXNzIH0sXHJcbiAgICAgIGFwcHJvdmFsVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249c2lnblR5cGVkJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH0mbWV0aG9kPSR7bWV0aG9kfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDY1MFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignU2lnbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBtZXNzYWdlIHNpZ25pbmcgYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTaWduQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2Vzc2lvblRva2VuKSB7XHJcbiAgaWYgKCFwZW5kaW5nU2lnblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgbWV0aG9kLCBzaWduUmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1NpZ25SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gdG8gcHJldmVudCByZXBsYXkgYXR0YWNrc1xyXG4gIGlmICghdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pKSB7XHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgbGV0IHBhc3N3b3JkID0gbnVsbDtcclxuICBsZXQgc2lnbmVyID0gbnVsbDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gYW5kIGdldCBwYXNzd29yZFxyXG4gICAgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IChhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkKVxyXG4gICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2lnbmVyID0gdW5sb2NrUmVzdWx0LnNpZ25lcjtcclxuXHJcbiAgICBsZXQgc2lnbmF0dXJlO1xyXG5cclxuICAgIC8vIFNpZ24gYmFzZWQgb24gbWV0aG9kXHJcbiAgICBpZiAobWV0aG9kID09PSAncGVyc29uYWxfc2lnbicgfHwgbWV0aG9kID09PSAnZXRoX3NpZ24nKSB7XHJcbiAgICAgIHNpZ25hdHVyZSA9IGF3YWl0IHBlcnNvbmFsU2lnbihzaWduZXIsIHNpZ25SZXF1ZXN0Lm1lc3NhZ2UpO1xyXG4gICAgfSBlbHNlIGlmIChtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSkge1xyXG4gICAgICBzaWduYXR1cmUgPSBhd2FpdCBzaWduVHlwZWREYXRhKHNpZ25lciwgc2lnblJlcXVlc3QudHlwZWREYXRhKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgc2lnbmluZyBtZXRob2Q6ICR7bWV0aG9kfWApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvZyBzdWNjZXNzZnVsIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBjb25zdCBzaWduZXJBZGRyZXNzID0gYXdhaXQgc2lnbmVyLmdldEFkZHJlc3MoKTtcclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnbmVyQWRkcmVzcyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTaWduYXR1cmUgZ2VuZXJhdGVkIHN1Y2Nlc3NmdWxseVxyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgTWVzc2FnZSBzaWduZWQgZm9yIG9yaWdpbjonLCBvcmlnaW4pO1xyXG5cclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHNpZ25hdHVyZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHNpZ25hdHVyZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHNpZ25pbmcgbWVzc2FnZTonLCBlcnJvcik7XHJcblxyXG4gICAgLy8gTG9nIGZhaWxlZCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpID8gJ3R5cGVkX2RhdGEnIDogJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduUmVxdWVzdC5hZGRyZXNzIHx8ICd1bmtub3duJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIHJlamVjdChlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICBwYXNzd29yZCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgc2lnbmVyID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgTGVkZ2VyIHNpZ25hdHVyZSBhcHByb3ZhbCAocHJlLXNpZ25lZCBpbiBwb3B1cClcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxlZGdlclNpZ25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkLCBzaWduYXR1cmUpIHtcclxuICBpZiAoIXBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nU2lnblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG5cclxuICAvLyBWYWxpZGF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlblxyXG4gIGlmICghdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pKSB7XHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFwcHJvdmFsIHRva2VuJyB9O1xyXG4gIH1cclxuXHJcbiAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCB0aGUgcmVxdWVzdCcpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gTG9nIHN1Y2Nlc3NmdWwgTGVkZ2VyIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogbWV0aG9kICYmIG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpID8gJ3R5cGVkX2RhdGEnIDogJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduUmVxdWVzdD8uYWRkcmVzcyB8fCAnbGVkZ2VyJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kIHx8ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ2hhcmR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2lnbmF0dXJlIGFscmVhZHkgY3JlYXRlZCBieSBMZWRnZXIgaW4gcG9wdXAgLSBqdXN0IHBhc3MgaXQgdGhyb3VnaFxyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgTGVkZ2VyIG1lc3NhZ2Ugc2lnbmVkIGZvciBvcmlnaW46Jywgb3JpZ2luKTtcclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHNpZ25hdHVyZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHNpZ25hdHVyZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHByb2Nlc3NpbmcgTGVkZ2VyIHNpZ25hdHVyZTonLCBlcnJvcik7XHJcblxyXG4gICAgLy8gTG9nIGZhaWxlZCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZCAmJiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnblJlcXVlc3Q/LmFkZHJlc3MgfHwgJ2xlZGdlcicsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCB8fCAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ2hhcmR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVqZWN0KGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHNpZ24gcmVxdWVzdCBkZXRhaWxzIChmb3IgcG9wdXApXHJcbmZ1bmN0aW9uIGdldFNpZ25SZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIHJldHVybiBwZW5kaW5nU2lnblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG59XHJcblxyXG4vLyBMaXN0ZW4gZm9yIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRzIGFuZCBwb3B1cFxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgLy8gUmVjZWl2ZWQgbWVzc2FnZVxyXG5cclxuICAvLyBTRUNVUklUWTogRGVmaW5lIG1lc3NhZ2UgdHlwZXMgdGhhdCBhcmUgcHJpdmlsZWdlZCAocG9wdXAtb25seSkuXHJcbiAgLy8gVGhlc2UgbXVzdCBOT1QgYmUgY2FsbGFibGUgZnJvbSBjb250ZW50IHNjcmlwdHMgKHdoaWNoIHJ1biBvbiBhcmJpdHJhcnkgd2ViIHBhZ2VzKS5cclxuICAvLyBBcHByb3ZhbCBwb3B1cHMgYXJlIG9wZW5lZCB2aWEgY2hyb21lLndpbmRvd3MuY3JlYXRlLCBzbyB0aGV5IGRvIGhhdmUgc2VuZGVyLnRhYiDigJRcclxuICAvLyBkaXN0aW5ndWlzaCB0aGVtIGZyb20gY29udGVudCBzY3JpcHRzIGJ5IGNoZWNraW5nIHNlbmRlci51cmwgYWdhaW5zdCBvdXIgZXh0ZW5zaW9uIG9yaWdpbi5cclxuICBjb25zdCBQUklWSUxFR0VEX01FU1NBR0VTID0gbmV3IFNldChbXHJcbiAgICAnQ09OTkVDVElPTl9BUFBST1ZBTCcsICdUUkFOU0FDVElPTl9BUFBST1ZBTCcsICdTSUdOX0FQUFJPVkFMJywgJ1NJR05fQVBQUk9WQUxfTEVER0VSJyxcclxuICAgICdUT0tFTl9BRERfQVBQUk9WQUwnLCAnQ0hBSU5fU1dJVENIX0FQUFJPVkFMJywgJ0NSRUFURV9TRVNTSU9OJywgJ0lOVkFMSURBVEVfU0VTU0lPTicsICdJTlZBTElEQVRFX0FMTF9TRVNTSU9OUycsXHJcbiAgICAnRElTQ09OTkVDVF9TSVRFJywgJ1NBVkVfVFgnLCAnU0FWRV9BTkRfTU9OSVRPUl9UWCcsICdDTEVBUl9UWF9ISVNUT1JZJyxcclxuICAgICdTUEVFRF9VUF9UWCcsICdDQU5DRUxfVFgnLCAnU1BFRURfVVBfVFhfQ09NUExFVEUnLCAnQ0FOQ0VMX1RYX0NPTVBMRVRFJyxcclxuICAgICdHRVRfU0lHTklOR19BVURJVF9MT0cnLCAnR0VUX1RYX0hJU1RPUlknLCAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnLCAnR0VUX1BFTkRJTkdfVFhTJyxcclxuICAgICdHRVRfVFhfQllfSEFTSCcsICdSRUZSRVNIX1RYX1NUQVRVUycsICdSRUJST0FEQ0FTVF9UWCcsICdHRVRfQ1VSUkVOVF9HQVNfUFJJQ0UnLCAnQUNUSVZFX1dBTExFVF9DSEFOR0VEJyxcclxuICAgICdHRVRfQ09OTkVDVElPTl9SRVFVRVNUJywgJ0dFVF9DT05ORUNURURfU0lURVMnLCAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnLFxyXG4gICAgJ0dFVF9TSUdOX1JFUVVFU1QnLCAnR0VUX1RPS0VOX0FERF9SRVFVRVNUJywgJ0dFVF9DSEFJTl9TV0lUQ0hfUkVRVUVTVCdcclxuICBdKTtcclxuXHJcbiAgY29uc3QgZXh0ZW5zaW9uT3JpZ2luID0gYGNocm9tZS1leHRlbnNpb246Ly8ke2Nocm9tZS5ydW50aW1lLmlkfS9gO1xyXG4gIGNvbnN0IGlzRnJvbUV4dGVuc2lvblBhZ2UgPSB0eXBlb2Ygc2VuZGVyLnVybCA9PT0gJ3N0cmluZycgJiYgc2VuZGVyLnVybC5zdGFydHNXaXRoKGV4dGVuc2lvbk9yaWdpbik7XHJcblxyXG4gIGlmIChQUklWSUxFR0VEX01FU1NBR0VTLmhhcyhtZXNzYWdlLnR5cGUpICYmICFpc0Zyb21FeHRlbnNpb25QYWdlKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgU0VDVVJJVFk6IEJsb2NrZWQgcHJpdmlsZWdlZCBtZXNzYWdlIGZyb20gY29udGVudCBzY3JpcHQ6JywgbWVzc2FnZS50eXBlLCBzZW5kZXIudXJsKTtcclxuICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VuYXV0aG9yaXplZDogcHJpdmlsZWdlZCBtZXNzYWdlcyBtdXN0IGNvbWUgZnJvbSBleHRlbnNpb24gcGFnZXMnIH0pO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcclxuICAgICAgICBjYXNlICdXQUxMRVRfUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVXYWxsZXRSZXF1ZXN0KG1lc3NhZ2UsIHNlbmRlcik7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDT05ORUNUSU9OX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IGFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgYXBwcm92YWwgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShhcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NPTk5FQ1RJT05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCByZXF1ZXN0SW5mbyA9IGdldENvbm5lY3Rpb25SZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgY29ubmVjdGlvbiByZXF1ZXN0IGluZm9cclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NPTk5FQ1RFRF9TSVRFUyc6XHJcbiAgICAgICAgICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIGNvbm5lY3RlZCBzaXRlcycpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgc2l0ZXMgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnRElTQ09OTkVDVF9TSVRFJzpcclxuICAgICAgICAgIGF3YWl0IHJlbW92ZUNvbm5lY3RlZFNpdGUobWVzc2FnZS5vcmlnaW4pO1xyXG4gICAgICAgICAgYXdhaXQgbm90aWZ5QWNjb3VudHNDaGFuZ2VkKCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGRpc2Nvbm5lY3QgY29uZmlybWF0aW9uXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0FDVElWRV9XQUxMRVRfQ0hBTkdFRCc6XHJcbiAgICAgICAgICBhd2FpdCBub3RpZnlBY2NvdW50c0NoYW5nZWQoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgdHhBcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQsIG1lc3NhZ2Uuc2Vzc2lvblRva2VuLCBtZXNzYWdlLmdhc1ByaWNlLCBtZXNzYWdlLmN1c3RvbU5vbmNlLCBtZXNzYWdlLnR4SGFzaCwgbWVzc2FnZS50eERldGFpbHMpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyB0cmFuc2FjdGlvbiBhcHByb3ZhbCByZXNwb25zZVxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHR4QXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NSRUFURV9TRVNTSU9OJzpcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGF3YWl0IGNyZWF0ZVNlc3Npb24obWVzc2FnZS5wYXNzd29yZCwgbWVzc2FnZS53YWxsZXRJZCwgbWVzc2FnZS5kdXJhdGlvbk1zKTtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgc2Vzc2lvblRva2VuIH0pO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0lOVkFMSURBVEVfU0VTU0lPTic6XHJcbiAgICAgICAgICBjb25zdCBpbnZhbGlkYXRlZCA9IGludmFsaWRhdGVTZXNzaW9uKG1lc3NhZ2Uuc2Vzc2lvblRva2VuKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGludmFsaWRhdGVkIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0lOVkFMSURBVEVfQUxMX1NFU1NJT05TJzpcclxuICAgICAgICAgIGNvbnN0IGNvdW50ID0gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBjb3VudCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVFJBTlNBQ1RJT05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCB0eFJlcXVlc3RJbmZvID0gZ2V0VHJhbnNhY3Rpb25SZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgdHJhbnNhY3Rpb24gcmVxdWVzdCBpbmZvOicsIHR4UmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHR4UmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1RPS0VOX0FERF9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCB0b2tlbkFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlVG9rZW5BZGRBcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRva2VuIGFkZCBhcHByb3ZhbCByZXNwb25zZTonLCB0b2tlbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0b2tlbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDSEFJTl9TV0lUQ0hfQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgY2hhaW5Td2l0Y2hSZXN1bHQgPSBhd2FpdCBoYW5kbGVDaGFpblN3aXRjaEFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShjaGFpblN3aXRjaFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0lHTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCBzaWduQXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVTaWduQXBwcm92YWwoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UucmVxdWVzdElkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFwcHJvdmVkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNlc3Npb25Ub2tlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgc2lnbiBhcHByb3ZhbCByZXNwb25zZTonLCBzaWduQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNpZ25BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0lHTl9BUFBST1ZBTF9MRURHRVInOlxyXG4gICAgICAgICAgY29uc3QgbGVkZ2VyU2lnblJlc3VsdCA9IGF3YWl0IGhhbmRsZUxlZGdlclNpZ25BcHByb3ZhbChcclxuICAgICAgICAgICAgbWVzc2FnZS5yZXF1ZXN0SWQsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYXBwcm92ZWQsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2lnbmF0dXJlXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBMZWRnZXIgc2lnbiBhcHByb3ZhbCByZXNwb25zZTonLCBsZWRnZXJTaWduUmVzdWx0KTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShsZWRnZXJTaWduUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfU0lHTl9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHNpZ25SZXF1ZXN0SW5mbyA9IGdldFNpZ25SZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgc2lnbiByZXF1ZXN0IGluZm86Jywgc2lnblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzaWduUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9UT0tFTl9BRERfUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCB0b2tlblJlcXVlc3RJbmZvID0gZ2V0VG9rZW5BZGRSZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgdG9rZW4gYWRkIHJlcXVlc3QgaW5mbzonLCB0b2tlblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0b2tlblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ0hBSU5fU1dJVENIX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgY2hhaW5Td2l0Y2hJbmZvID0gYXdhaXQgZ2V0Q2hhaW5Td2l0Y2hSZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShjaGFpblN3aXRjaEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vIFNpZ25pbmcgQXVkaXQgTG9nXHJcbiAgICAgICAgY2FzZSAnR0VUX1NJR05JTkdfQVVESVRfTE9HJzpcclxuICAgICAgICAgIGNvbnN0IHNpZ25pbmdMb2cgPSBhd2FpdCBnZXRTaWduaW5nQXVkaXRMb2coKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGxvZzogc2lnbmluZ0xvZyB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAvLyBUcmFuc2FjdGlvbiBIaXN0b3J5XHJcbiAgICAgICAgY2FzZSAnR0VUX1RYX0hJU1RPUlknOlxyXG4gICAgICAgICAgY29uc3QgdHhIaXN0b3J5TGlzdCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEhpc3RvcnkobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uczogdHhIaXN0b3J5TGlzdCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfUEVORElOR19UWF9DT1VOVCc6XHJcbiAgICAgICAgICBjb25zdCBwZW5kaW5nQ291bnQgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4Q291bnQobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGNvdW50OiBwZW5kaW5nQ291bnQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1BFTkRJTkdfVFhTJzpcclxuICAgICAgICAgIGNvbnN0IHBlbmRpbmdUeHMgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4cyhtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHJhbnNhY3Rpb25zOiBwZW5kaW5nVHhzIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9UWF9CWV9IQVNIJzpcclxuICAgICAgICAgIGNvbnN0IHR4RGV0YWlsID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4QnlIYXNoKG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS50eEhhc2gpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHJhbnNhY3Rpb246IHR4RGV0YWlsIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NBVkVfVFgnOlxyXG4gICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS50cmFuc2FjdGlvbik7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NBVkVfQU5EX01PTklUT1JfVFgnOlxyXG4gICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS50cmFuc2FjdGlvbik7XHJcblxyXG4gICAgICAgICAgLy8gU3RhcnQgbW9uaXRvcmluZyBmb3IgY29uZmlybWF0aW9uIGluIGJhY2tncm91bmRcclxuICAgICAgICAgIChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbmV0d29yayA9IG1lc3NhZ2UudHJhbnNhY3Rpb24ubmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHR4ID0geyBoYXNoOiBtZXNzYWdlLnRyYW5zYWN0aW9uLmhhc2ggfTtcclxuICAgICAgICAgICAgICBhd2FpdCB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgbWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBtb25pdG9yaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NMRUFSX1RYX0hJU1RPUlknOlxyXG4gICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LmNsZWFyVHhIaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DVVJSRU5UX0dBU19QUklDRSc6XHJcbiAgICAgICAgICBjb25zdCBnYXNQcmljZVJlc3VsdCA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrR2FzUHJpY2UobWVzc2FnZS5uZXR3b3JrKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShnYXNQcmljZVJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnUkVGUkVTSF9UWF9TVEFUVVMnOlxyXG4gICAgICAgICAgY29uc3QgcmVmcmVzaFJlc3VsdCA9IGF3YWl0IHJlZnJlc2hUcmFuc2FjdGlvblN0YXR1cyhcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5uZXR3b3JrXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlZnJlc2hSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1JFQlJPQURDQVNUX1RYJzpcclxuICAgICAgICAgIGNvbnN0IHJlYnJvYWRjYXN0UmVzdWx0ID0gYXdhaXQgcmVicm9hZGNhc3RUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UubmV0d29ya1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZWJyb2FkY2FzdFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU1BFRURfVVBfVFgnOlxyXG4gICAgICAgICAgY29uc3Qgc3BlZWRVcFJlc3VsdCA9IGF3YWl0IGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuZ2FzUHJpY2VNdWx0aXBsaWVyIHx8IDEuMixcclxuICAgICAgICAgICAgbWVzc2FnZS5jdXN0b21HYXNQcmljZSB8fCBudWxsXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNwZWVkVXBSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NBTkNFTF9UWCc6XHJcbiAgICAgICAgICBjb25zdCBjYW5jZWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuY3VzdG9tR2FzUHJpY2UgfHwgbnVsbFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShjYW5jZWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NQRUVEX1VQX1RYX0NPTVBMRVRFJzpcclxuICAgICAgICAgIC8vIFRyYW5zYWN0aW9uIHdhcyBhbHJlYWR5IHNpZ25lZCBhbmQgYnJvYWRjYXN0IGluIHBvcHVwIC0ganVzdCBzYXZlIHRvIGhpc3RvcnlcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2F2ZSBuZXcgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgICAgICAgICBjb25zdCBoaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgICAgICAgICAgaGFzaDogbWVzc2FnZS5uZXdUeEhhc2gsXHJcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICAgIGZyb206IG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgICB0bzogbWVzc2FnZS50eERldGFpbHMudG8sXHJcbiAgICAgICAgICAgICAgdmFsdWU6IG1lc3NhZ2UudHhEZXRhaWxzLnZhbHVlLFxyXG4gICAgICAgICAgICAgIGRhdGE6IG1lc3NhZ2UudHhEZXRhaWxzLmRhdGEgfHwgJzB4JyxcclxuICAgICAgICAgICAgICBnYXNQcmljZTogbWVzc2FnZS50eERldGFpbHMuZ2FzUHJpY2UsXHJcbiAgICAgICAgICAgICAgZ2FzTGltaXQ6IG1lc3NhZ2UudHhEZXRhaWxzLmdhc0xpbWl0LFxyXG4gICAgICAgICAgICAgIG5vbmNlOiBtZXNzYWdlLnR4RGV0YWlscy5ub25jZSxcclxuICAgICAgICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICAgICAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICAgICAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICAgICAgICAgIHR5cGU6IHR4SGlzdG9yeS5UWF9UWVBFUy5DT05UUkFDVFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heEZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICAgICAgaGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIGhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgICAgICAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIHJlcGxhY2VkXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2Uub3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgbmV3IHRyYW5zYWN0aW9uXHJcbiAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICAgICAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHsgaGFzaDogbWVzc2FnZS5uZXdUeEhhc2ggfSwgcHJvdmlkZXIsIG1lc3NhZ2UuYWRkcmVzcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZmljYXRpb25cclxuICAgICAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU3BlZCBVcCcsXHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogYE5ldyBUWDogJHttZXNzYWdlLm5ld1R4SGFzaC5zbGljZSgwLCAyMCl9Li4uYCxcclxuICAgICAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogbWVzc2FnZS5uZXdUeEhhc2ggfSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzYXZpbmcgc3BlZWQtdXAgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0FOQ0VMX1RYX0NPTVBMRVRFJzpcclxuICAgICAgICAgIC8vIENhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiB3YXMgYWxyZWFkeSBzaWduZWQgYW5kIGJyb2FkY2FzdCBpbiBwb3B1cCAtIGp1c3Qgc2F2ZSB0byBoaXN0b3J5XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnlcclxuICAgICAgICAgICAgY29uc3QgY2FuY2VsSGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICAgICAgICAgIGhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoLFxyXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgICAgICAgICBmcm9tOiBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgdG86IG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgICB2YWx1ZTogJzAnLFxyXG4gICAgICAgICAgICAgIGRhdGE6ICcweCcsXHJcbiAgICAgICAgICAgICAgZ2FzUHJpY2U6IG1lc3NhZ2UudHhEZXRhaWxzLmdhc1ByaWNlLFxyXG4gICAgICAgICAgICAgIGdhc0xpbWl0OiAnMjEwMDAnLFxyXG4gICAgICAgICAgICAgIG5vbmNlOiBtZXNzYWdlLnR4RGV0YWlscy5ub25jZSxcclxuICAgICAgICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICAgICAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICAgICAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdzZW5kJ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heEZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsSGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIGNhbmNlbEhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgICAgICAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIGNhbmNlbGxlZC9mYWlsZWRcclxuICAgICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS5vcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3RhcnQgbW9uaXRvcmluZyBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb25cclxuICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgICAgICAgIHdhaXRGb3JDb25maXJtYXRpb24oeyBoYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCB9LCBwcm92aWRlciwgbWVzc2FnZS5hZGRyZXNzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE5vdGlmaWNhdGlvblxyXG4gICAgICAgICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBDYW5jZWxsZWQnLFxyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdDYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gc2VudCcsXHJcbiAgICAgICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoIH0pO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2F2aW5nIGNhbmNlbCB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdVUERBVEVfUlBDX1BSSU9SSVRJRVMnOlxyXG4gICAgICAgICAgLy8gVXBkYXRlIFJQQyBwcmlvcml0aWVzIGluIHRoZSBycGMgbW9kdWxlXHJcbiAgICAgICAgICBpZiAobWVzc2FnZS5uZXR3b3JrICYmIG1lc3NhZ2UucHJpb3JpdGllcykge1xyXG4gICAgICAgICAgICBycGMudXBkYXRlUnBjUHJpb3JpdGllcyhtZXNzYWdlLm5ldHdvcmssIG1lc3NhZ2UucHJpb3JpdGllcyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDwn6uAIFVwZGF0ZWQgUlBDIHByaW9yaXRpZXMgZm9yICR7bWVzc2FnZS5uZXR3b3JrfWApO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTWlzc2luZyBuZXR3b3JrIG9yIHByaW9yaXRpZXMnIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBVbmtub3duIG1lc3NhZ2UgdHlwZTonLCBtZXNzYWdlLnR5cGUpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5rbm93biBtZXNzYWdlIHR5cGUnIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGhhbmRsaW5nIG1lc3NhZ2U6JywgZXJyb3IpO1xyXG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICB9XHJcbiAgfSkoKTtcclxuXHJcbiAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlXHJcbn0pO1xyXG5cclxuY29uc29sZS5sb2coJ/Cfq4AgSGVhcnRXYWxsZXQgc2VydmljZSB3b3JrZXIgcmVhZHknKTtcclxuIl0sIm5hbWVzIjpbImV0aGVycy5nZXRBZGRyZXNzIiwiZXRoZXJzLmdldEJ5dGVzIiwiZXRoZXJzLnRvVXRmOFN0cmluZyIsImV0aGVycy5pc0FkZHJlc3MiLCJycGMuZ2V0QmxvY2tOdW1iZXIiLCJycGMuZ2V0QmxvY2tCeU51bWJlciIsInJwYy5nZXRCYWxhbmNlIiwicnBjLmdldFRyYW5zYWN0aW9uQ291bnQiLCJycGMuZ2V0R2FzUHJpY2UiLCJycGMuZXN0aW1hdGVHYXMiLCJycGMuY2FsbCIsInJwYy5zZW5kUmF3VHJhbnNhY3Rpb24iLCJycGMuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0IiwicnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoIiwicnBjLmdldFByb3ZpZGVyIiwiY2FjaGUiLCJ0eEhpc3RvcnkuVFhfU1RBVFVTIiwidHhIaXN0b3J5LlRYX1RZUEVTIiwidHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5IiwicnBjLmdldEVpcDE1NTlGZWVzIiwidHhIaXN0b3J5LmdldFR4QnlIYXNoIiwidHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzIiwicnBjLmdldEdhc1ByaWNlUmVjb21tZW5kYXRpb25zIiwicnBjLmdldFJhd1RyYW5zYWN0aW9uIiwicnBjLmJyb2FkY2FzdFRvQWxsUnBjcyIsInR4SGlzdG9yeS5nZXRUeEhpc3RvcnkiLCJ0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4Q291bnQiLCJ0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4cyIsInR4SGlzdG9yeS5jbGVhclR4SGlzdG9yeSIsInJwYy51cGRhdGVScGNQcmlvcml0aWVzIl0sIm1hcHBpbmdzIjoiO0FBUUEsTUFBTSxpQkFBaUI7QUFDdkIsTUFBTSwwQkFBMEI7QUFDaEMsTUFBTSxzQkFBc0I7QUFHckIsTUFBTSxXQUFXO0FBQUEsRUFFdEIsVUFBVTtBQUVaO0FBR08sTUFBTSxZQUFZO0FBQUEsRUFDdkIsU0FBUztBQUFBLEVBQ1QsV0FBVztBQUFBLEVBQ1gsUUFBUTtBQUNWO0FBS08sZUFBZSx1QkFBdUI7QUFDM0MsUUFBTSxXQUFXLE1BQU0sS0FBSyx1QkFBdUI7QUFDbkQsU0FBTyxZQUFZO0FBQUEsSUFDakIsU0FBUztBQUFBO0FBQUEsSUFDVCxhQUFhO0FBQUE7QUFBQSxFQUNqQjtBQUNBO0FBS0EsZUFBZSxnQkFBZ0I7QUFDN0IsUUFBTSxVQUFVLE1BQU0sS0FBSyxjQUFjO0FBQ3pDLFNBQU8sV0FBVyxDQUFBO0FBQ3BCO0FBS0EsZUFBZSxlQUFlLFNBQVM7QUFDckMsUUFBTSxLQUFLLGdCQUFnQixPQUFPO0FBQ3BDO0FBS08sZUFBZSxhQUFhLFNBQVM7QUFDMUMsUUFBTSxXQUFXLE1BQU07QUFDdkIsTUFBSSxDQUFDLFNBQVMsU0FBUztBQUNyQixXQUFPO0VBQ1Q7QUFFQSxRQUFNLFVBQVUsTUFBTTtBQUN0QixRQUFNLGVBQWUsUUFBUTtBQUU3QixNQUFJLENBQUMsUUFBUSxZQUFZLEdBQUc7QUFDMUIsV0FBTztFQUNUO0FBRUEsU0FBTyxRQUFRLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQTtBQUMvQztBQUtPLGVBQWUsZUFBZSxTQUFTLFFBQVE7QUFDcEQsUUFBTSxXQUFXLE1BQU07QUFD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
