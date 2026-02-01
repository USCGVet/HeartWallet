import { l as load, s as save, a as getAddress, H as getBytes, J as toUtf8String, i as isAddress, K as updateRpcPriorities, g as getProvider, u as unlockWallet, L as secureCleanup, M as secureCleanupSigner, F as getSafeGasPrice, b as getActiveWallet, N as getTransactionByHash, O as getTransactionReceipt, P as sendRawTransaction, v as getGasPrice, G as estimateGas, Q as call, q as getTransactionCount, n as getBalance, R as getBlockByNumber, U as getBlockNumber } from "./rpc.js";
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
    data: txData.data || "0x",
    gasPrice: txData.gasPrice,
    gasLimit: txData.gasLimit,
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
const CONNECTED_SITES_KEY = "connected_sites";
const pendingConnections = /* @__PURE__ */ new Map();
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
    const wallet = await getActiveWallet();
    if (wallet && wallet.address) {
      return { result: [wallet.address] };
    }
  }
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString();
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
  const currentNetwork = await load("currentNetwork") || "pulsechain";
  let maxGasPriceGwei;
  try {
    const currentGasPrice = await getGasPrice(currentNetwork);
    const currentGasPriceGwei = Number(BigInt(currentGasPrice)) / 1e9;
    maxGasPriceGwei = Math.ceil(currentGasPriceGwei * 3);
    maxGasPriceGwei = Math.max(maxGasPriceGwei, 100);
  } catch (error) {
    console.warn("Failed to fetch gas price, using high default:", error);
    maxGasPriceGwei = 1e7;
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
async function handleTransactionApproval(requestId, approved, sessionToken, gasPrice, customNonce, txHash) {
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
      console.log("Hardware wallet transaction already broadcast:", txHash);
      const activeWallet = await getActiveWallet();
      const network = await getCurrentNetwork();
      await addTxToHistory(activeWallet.address, {
        hash: txHash,
        timestamp: Date.now(),
        from: activeWallet.address,
        to: txRequest.to || null,
        value: txRequest.value || "0",
        data: txRequest.data || "0x",
        gasPrice: "0",
        // Will be updated by transaction monitoring
        gasLimit: txRequest.gasLimit || txRequest.gas || null,
        nonce: null,
        // Will be updated by transaction monitoring
        network,
        status: TX_STATUS.PENDING,
        blockNumber: null,
        type: TX_TYPES.CONTRACT
      });
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
        walletType: "hardware"
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
      if (gasPrice) {
        txToSend.gasPrice = gasPrice;
      } else {
        try {
          const safeGasPriceHex = await getSafeGasPrice(network);
          txToSend.gasPrice = BigInt(safeGasPriceHex);
        } catch (error) {
          console.warn("Error getting safe gas price, using provider fallback:", error);
          const networkGasPrice = await provider.getFeeData();
          if (networkGasPrice.gasPrice) {
            txToSend.gasPrice = networkGasPrice.gasPrice;
          }
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
        gasPrice: tx.gasPrice ? tx.gasPrice.toString() : "0",
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
    let newGasPrice;
    if (customGasPrice) {
      newGasPrice = BigInt(customGasPrice);
    } else {
      const originalGasPrice = BigInt(originalTx.gasPrice);
      newGasPrice = originalGasPrice * BigInt(Math.floor(gasPriceMultiplier * 100)) / BigInt(100);
    }
    const replacementTx = {
      to: originalTx.to,
      value: originalTx.value,
      data: originalTx.data || "0x",
      nonce: originalTx.nonce,
      gasPrice: newGasPrice
    };
    if (originalTx.gasLimit) {
      replacementTx.gasLimit = originalTx.gasLimit;
    }
    const tx = await wallet.sendTransaction(replacementTx);
    await addTxToHistory(address, {
      hash: tx.hash,
      timestamp: Date.now(),
      from: address,
      to: originalTx.to,
      value: originalTx.value,
      data: originalTx.data || "0x",
      gasPrice: newGasPrice.toString(),
      gasLimit: originalTx.gasLimit,
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
    let newGasPrice;
    if (customGasPrice) {
      newGasPrice = BigInt(customGasPrice);
    } else {
      const originalGasPrice = BigInt(originalTx.gasPrice);
      newGasPrice = originalGasPrice * BigInt(120) / BigInt(100);
    }
    const cancelTx = {
      to: address,
      // Send to self
      value: "0",
      // Zero value
      data: "0x",
      // Empty data
      nonce: originalTx.nonce,
      gasPrice: newGasPrice,
      gasLimit: 21e3
      // Standard gas limit for simple ETH transfer
    };
    const tx = await wallet.sendTransaction(cancelTx);
    await addTxToHistory(address, {
      hash: tx.hash,
      timestamp: Date.now(),
      from: address,
      to: address,
      value: "0",
      data: "0x",
      gasPrice: newGasPrice.toString(),
      gasLimit: "21000",
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
    const safeGasPriceHex = await getSafeGasPrice(network);
    const safeGasPrice = BigInt(safeGasPriceHex);
    return {
      success: true,
      gasPrice: safeGasPrice.toString(),
      gasPriceGwei: (Number(safeGasPrice) / 1e9).toFixed(2)
    };
  } catch (error) {
    console.error("🫀 Error fetching current gas price:", error);
    return { success: false, error: sanitizeErrorMessage(error.message) };
  }
}
async function refreshTransactionStatus(address, txHash, network) {
  try {
    const provider = await getProvider(network);
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
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
    const requestId = Date.now().toString() + "_sign";
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
    const requestId = Date.now().toString() + "_signTyped";
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
          const txApprovalResult = await handleTransactionApproval(message.requestId, message.approved, message.sessionToken, message.gasPrice, message.customNonce, message.txHash);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRBbGxIaXN0b3J5KCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBsb2FkKFRYX0hJU1RPUllfS0VZKTtcclxuICByZXR1cm4gaGlzdG9yeSB8fCB7fTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpIHtcclxuICBhd2FpdCBzYXZlKFRYX0hJU1RPUllfS0VZLCBoaXN0b3J5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgYSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgdHhEYXRhKSB7XHJcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRUeEhpc3RvcnlTZXR0aW5ncygpO1xyXG4gIGlmICghc2V0dGluZ3MuZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuOyAvLyBIaXN0b3J5IGRpc2FibGVkXHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBhZGRyZXNzIGhpc3RvcnkgaWYgZG9lc24ndCBleGlzdFxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0gPSB7IHRyYW5zYWN0aW9uczogW10gfTtcclxuICB9XHJcblxyXG4gIC8vIEFkZCBuZXcgdHJhbnNhY3Rpb24gYXQgYmVnaW5uaW5nIChuZXdlc3QgZmlyc3QpXHJcbiAgaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy51bnNoaWZ0KHtcclxuICAgIGhhc2g6IHR4RGF0YS5oYXNoLFxyXG4gICAgdGltZXN0YW1wOiB0eERhdGEudGltZXN0YW1wIHx8IERhdGUubm93KCksXHJcbiAgICBmcm9tOiB0eERhdGEuZnJvbS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgdG86IHR4RGF0YS50byA/IHR4RGF0YS50by50b0xvd2VyQ2FzZSgpIDogbnVsbCxcclxuICAgIHZhbHVlOiB0eERhdGEudmFsdWUgfHwgJzAnLFxyXG4gICAgZGF0YTogdHhEYXRhLmRhdGEgfHwgJzB4JyxcclxuICAgIGdhc1ByaWNlOiB0eERhdGEuZ2FzUHJpY2UsXHJcbiAgICBnYXNMaW1pdDogdHhEYXRhLmdhc0xpbWl0LFxyXG4gICAgbm9uY2U6IHR4RGF0YS5ub25jZSxcclxuICAgIG5ldHdvcms6IHR4RGF0YS5uZXR3b3JrLFxyXG4gICAgc3RhdHVzOiB0eERhdGEuc3RhdHVzIHx8IFRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgYmxvY2tOdW1iZXI6IHR4RGF0YS5ibG9ja051bWJlciB8fCBudWxsLFxyXG4gICAgdHlwZTogdHhEYXRhLnR5cGUgfHwgVFhfVFlQRVMuQ09OVFJBQ1RcclxuICB9KTtcclxuXHJcbiAgLy8gRW5mb3JjZSBtYXggbGltaXQgKEZJRk8gLSByZW1vdmUgb2xkZXN0KVxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLmxlbmd0aCA+IE1BWF9UWFNfUEVSX0FERFJFU1MpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgPSBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLnNsaWNlKDAsIE1BWF9UWFNfUEVSX0FERFJFU1MpO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZUFsbEhpc3RvcnkoaGlzdG9yeSk7XHJcbiAgLy8gVHJhbnNhY3Rpb24gYWRkZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIHN0YXR1cywgYmxvY2tOdW1iZXIgPSBudWxsKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eEluZGV4ID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5maW5kSW5kZXgoXHJcbiAgICB0eCA9PiB0eC5oYXNoLnRvTG93ZXJDYXNlKCkgPT09IHR4SGFzaC50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuXHJcbiAgaWYgKHR4SW5kZXggPT09IC0xKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLnN0YXR1cyA9IHN0YXR1cztcclxuICBpZiAoYmxvY2tOdW1iZXIgIT09IG51bGwpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnNbdHhJbmRleF0uYmxvY2tOdW1iZXIgPSBibG9ja051bWJlcjtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbnMgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhzKGFkZHJlc3MpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maWx0ZXIodHggPT4gdHguc3RhdHVzID09PSBUWF9TVEFUVVMuUEVORElORyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbiBjb3VudCBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdUeENvdW50KGFkZHJlc3MpIHtcclxuICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKTtcclxuICByZXR1cm4gcGVuZGluZ1R4cy5sZW5ndGg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFR4QnlIYXNoKGFkZHJlc3MsIHR4SGFzaCkge1xyXG4gIGNvbnN0IHR4cyA9IGF3YWl0IGdldFR4SGlzdG9yeShhZGRyZXNzKTtcclxuICByZXR1cm4gdHhzLmZpbmQodHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyVHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKGhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgZGVsZXRlIGhpc3RvcnlbYWRkcmVzc0xvd2VyXTtcclxuICAgIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbiAgfVxyXG59XHJcblxyXG4iLCIvKipcclxuICogY29yZS90eFZhbGlkYXRpb24uanNcclxuICpcclxuICogVHJhbnNhY3Rpb24gdmFsaWRhdGlvbiB1dGlsaXRpZXMgZm9yIHNlY3VyaXR5XHJcbiAqIFZhbGlkYXRlcyBhbGwgdHJhbnNhY3Rpb24gcGFyYW1ldGVycyBiZWZvcmUgcHJvY2Vzc2luZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgdHJhbnNhY3Rpb24gcmVxdWVzdCBmcm9tIGEgZEFwcFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHhSZXF1ZXN0IC0gVHJhbnNhY3Rpb24gcmVxdWVzdCBvYmplY3RcclxuICogQHBhcmFtIHtudW1iZXJ9IG1heEdhc1ByaWNlR3dlaSAtIE1heGltdW0gYWxsb3dlZCBnYXMgcHJpY2UgaW4gR3dlaSAoZGVmYXVsdCAxMDAwKVxyXG4gKiBAcmV0dXJucyB7eyB2YWxpZDogYm9vbGVhbiwgZXJyb3JzOiBzdHJpbmdbXSwgc2FuaXRpemVkOiBPYmplY3QgfX1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSA9IDEwMDApIHtcclxuICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICBjb25zdCBzYW5pdGl6ZWQgPSB7fTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3RvJyBhZGRyZXNzIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0LnRvICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnRvICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC50byAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkSGV4QWRkcmVzcyh0eFJlcXVlc3QudG8pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInRvXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLnRvID0gZXRoZXJzLmdldEFkZHJlc3ModHhSZXF1ZXN0LnRvKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdmcm9tJyBhZGRyZXNzIGlmIHByZXNlbnQgKHNob3VsZCBtYXRjaCB3YWxsZXQgYWRkcmVzcylcclxuICBpZiAodHhSZXF1ZXN0LmZyb20gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZnJvbSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZnJvbSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLmZyb20gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QuZnJvbSk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICd2YWx1ZScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LnZhbHVlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnZhbHVlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QudmFsdWUpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInZhbHVlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWVCaWdJbnQgPSBCaWdJbnQodHhSZXF1ZXN0LnZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWVCaWdJbnQgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLnZhbHVlID0gdHhSZXF1ZXN0LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQudmFsdWUgPSAnMHgwJzsgLy8gRGVmYXVsdCB0byAwXHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZGF0YScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LmRhdGEgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZGF0YSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZGF0YSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZGF0YVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhEYXRhKHR4UmVxdWVzdC5kYXRhKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSB2YWxpZCBoZXggZGF0YScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2FuaXRpemVkLmRhdGEgPSB0eFJlcXVlc3QuZGF0YTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgc2FuaXRpemVkLmRhdGEgPSAnMHgnOyAvLyBEZWZhdWx0IHRvIGVtcHR5IGRhdGFcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdnYXMnIG9yICdnYXNMaW1pdCcgZmllbGRcclxuICAvLyBTRUNVUklUWTogUmVhc29uYWJsZSBtYXhpbXVtIGlzIDEwTSBnYXMgdG8gcHJldmVudCBmZWUgc2NhbXNcclxuICAvLyBNb3N0IHRyYW5zYWN0aW9uczogMjFrLTIwMGsgZ2FzLiBDb21wbGV4IERlRmk6IDIwMGstMU0gZ2FzLlxyXG4gIC8vIEV0aGVyZXVtL1B1bHNlQ2hhaW4gYmxvY2sgbGltaXQgaXMgfjMwTSwgYnV0IHNpbmdsZSBUWCByYXJlbHkgbmVlZHMgPjEwTVxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LmdhcyAhPT0gbnVsbCkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGV4VmFsdWUodHhSZXF1ZXN0LmdhcykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhcyk7XHJcbiAgICAgICAgaWYgKGdhc0xpbWl0IDwgMjEwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBsaW1pdCB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAxMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBoaWdoIChtYXhpbXVtIDEwMDAwMDAwKS4gTW9zdCB0cmFuc2FjdGlvbnMgbmVlZCA8MU0gZ2FzLicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzID0gdHhSZXF1ZXN0LmdhcztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzTGltaXQpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc0xpbWl0KTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGxvdyAobWluaW11bSAyMTAwMCknKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc0xpbWl0ID4gMTAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIHRvbyBoaWdoIChtYXhpbXVtIDEwMDAwMDAwKS4gTW9zdCB0cmFuc2FjdGlvbnMgbmVlZCA8MU0gZ2FzLicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzTGltaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZ2FzUHJpY2UnIGZpZWxkIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzUHJpY2UpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzUHJpY2UgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc1ByaWNlKTtcclxuICAgICAgICBjb25zdCBtYXhHYXNQcmljZVdlaSA9IEJpZ0ludChtYXhHYXNQcmljZUd3ZWkpICogQmlnSW50KCcxMDAwMDAwMDAwJyk7IC8vIENvbnZlcnQgR3dlaSB0byBXZWlcclxuICAgICAgICBpZiAoZ2FzUHJpY2UgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc1ByaWNlID4gbWF4R2FzUHJpY2VXZWkpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKGBJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZXhjZWVkcyBtYXhpbXVtIG9mICR7bWF4R2FzUHJpY2VHd2VpfSBHd2VpYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNQcmljZSA9IHR4UmVxdWVzdC5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdub25jZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5ub25jZSkgJiYgdHlwZW9mIHR4UmVxdWVzdC5ub25jZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIG9yIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJyBcclxuICAgICAgICAgID8gQmlnSW50KHR4UmVxdWVzdC5ub25jZSkgXHJcbiAgICAgICAgICA6IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpO1xyXG4gICAgICAgIGlmIChub25jZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9uY2UgPiBCaWdJbnQoJzkwMDcxOTkyNTQ3NDA5OTEnKSkgeyAvLyBKYXZhU2NyaXB0IHNhZmUgaW50ZWdlciBtYXhcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgdW5yZWFzb25hYmx5IGhpZ2gnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLm5vbmNlID0gdHhSZXF1ZXN0Lm5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gbXVzdCBoYXZlIGVpdGhlciAndG8nIG9yICdkYXRhJyAoY29udHJhY3QgY3JlYXRpb24pXHJcbiAgaWYgKCFzYW5pdGl6ZWQudG8gJiYgKCFzYW5pdGl6ZWQuZGF0YSB8fCBzYW5pdGl6ZWQuZGF0YSA9PT0gJzB4JykpIHtcclxuICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBtdXN0IGhhdmUgXCJ0b1wiIGFkZHJlc3Mgb3IgXCJkYXRhXCIgZm9yIGNvbnRyYWN0IGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnMsXHJcbiAgICBzYW5pdGl6ZWRcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIEV0aGVyZXVtIGFkZHJlc3MgKGhleCBmb3JtYXQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhZGRyZXNzIC0gQWRkcmVzcyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhBZGRyZXNzKGFkZHJlc3MpIHtcclxuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSA0MiBjaGFyYWN0ZXJzOiAweCArIDQwIGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdezQwfSQvLnRlc3QoYWRkcmVzcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBoZXggdmFsdWUgKGZvciBhbW91bnRzLCBnYXMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEhleCB2YWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBzdGFydCB3aXRoIDB4IGFuZCBjb250YWluIG9ubHkgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0rJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaGV4IGRhdGEgKGZvciB0cmFuc2FjdGlvbiBkYXRhIGZpZWxkKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIEhleCBkYXRhIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleERhdGEoZGF0YSkge1xyXG4gIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDB4IG9yIDB4IGZvbGxvd2VkIGJ5IGV2ZW4gbnVtYmVyIG9mIGhleCBkaWdpdHNcclxuICBpZiAoZGF0YSA9PT0gJzB4JykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSokLy50ZXN0KGRhdGEpICYmIGRhdGEubGVuZ3RoICUgMiA9PT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBhbiBlcnJvciBtZXNzYWdlIGZvciBzYWZlIGRpc3BsYXlcclxuICogUmVtb3ZlcyBhbnkgSFRNTCwgc2NyaXB0cywgYW5kIGNvbnRyb2wgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUVycm9yTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiA1MDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgNDk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGNvcmUvc2lnbmluZy5qc1xyXG4gKlxyXG4gKiBNZXNzYWdlIHNpZ25pbmcgZnVuY3Rpb25hbGl0eSBmb3IgRUlQLTE5MSBhbmQgRUlQLTcxMlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogU2lnbnMgYSBtZXNzYWdlIHVzaW5nIEVJUC0xOTEgKHBlcnNvbmFsX3NpZ24pXHJcbiAqIFRoaXMgcHJlcGVuZHMgXCJcXHgxOUV0aGVyZXVtIFNpZ25lZCBNZXNzYWdlOlxcblwiICsgbGVuKG1lc3NhZ2UpIHRvIHRoZSBtZXNzYWdlXHJcbiAqIGJlZm9yZSBzaWduaW5nLCB3aGljaCBwcmV2ZW50cyBzaWduaW5nIGFyYml0cmFyeSB0cmFuc2FjdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBzaWduIChoZXggc3RyaW5nIG9yIFVURi04IHN0cmluZylcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBlcnNvbmFsU2lnbihzaWduZXIsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25NZXNzYWdlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWQsIGRlY29kZSBpdCBmaXJzdFxyXG4gICAgLy8gZXRoZXJzLmpzIHNpZ25NZXNzYWdlIGV4cGVjdHMgYSBzdHJpbmcgb3IgVWludDhBcnJheVxyXG4gICAgbGV0IG1lc3NhZ2VUb1NpZ24gPSBtZXNzYWdlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIC8vIEl0J3MgYSBoZXggc3RyaW5nLCBjb252ZXJ0IHRvIFVURi04XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gVHJ5IHRvIGRlY29kZSBhcyBoZXhcclxuICAgICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIElmIGRlY29kaW5nIGZhaWxzLCB1c2UgdGhlIGhleCBzdHJpbmcgYXMtaXNcclxuICAgICAgICAvLyBldGhlcnMgd2lsbCBoYW5kbGUgaXRcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gbWVzc2FnZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdGhlIG1lc3NhZ2UgKGV0aGVycy5qcyBhdXRvbWF0aWNhbGx5IGFwcGxpZXMgRUlQLTE5MSBmb3JtYXQpXHJcbiAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBzaWduZXIuc2lnbk1lc3NhZ2UobWVzc2FnZVRvU2lnbik7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiBtZXNzYWdlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2lnbnMgdHlwZWQgZGF0YSB1c2luZyBFSVAtNzEyXHJcbiAqIFVzZWQgYnkgZEFwcHMgZm9yIHN0cnVjdHVyZWQgZGF0YSBzaWduaW5nIChwZXJtaXRzLCBtZXRhLXRyYW5zYWN0aW9ucywgZXRjLilcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZERhdGEgLSBFSVAtNzEyIHR5cGVkIGRhdGEgb2JqZWN0IHdpdGggZG9tYWluLCB0eXBlcywgYW5kIG1lc3NhZ2VcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25UeXBlZERhdGEoc2lnbmVyLCB0eXBlZERhdGEpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25UeXBlZERhdGEgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaWduZXIgcHJvdmlkZWQnKTtcclxuICB9XHJcblxyXG4gIGlmICghdHlwZWREYXRhKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1R5cGVkIGRhdGEgaXMgcmVxdWlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHR5cGVkIGRhdGEgc3RydWN0dXJlXHJcbiAgaWYgKCF0eXBlZERhdGEuZG9tYWluIHx8ICF0eXBlZERhdGEudHlwZXMgfHwgIXR5cGVkRGF0YS5tZXNzYWdlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgRUlQLTcxMiB0eXBlZCBkYXRhOiBtaXNzaW5nIGRvbWFpbiwgdHlwZXMsIG9yIG1lc3NhZ2UnKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBFeHRyYWN0IHByaW1hcnlUeXBlIChpZiBub3QgcHJvdmlkZWQsIHRyeSB0byBpbmZlciBpdClcclxuICAgIGxldCBwcmltYXJ5VHlwZSA9IHR5cGVkRGF0YS5wcmltYXJ5VHlwZTtcclxuXHJcbiAgICBpZiAoIXByaW1hcnlUeXBlKSB7XHJcbiAgICAgIC8vIFRyeSB0byBpbmZlciBwcmltYXJ5IHR5cGUgZnJvbSB0eXBlcyBvYmplY3RcclxuICAgICAgLy8gSXQncyB0aGUgdHlwZSB0aGF0J3Mgbm90IFwiRUlQNzEyRG9tYWluXCJcclxuICAgICAgY29uc3QgdHlwZU5hbWVzID0gT2JqZWN0LmtleXModHlwZWREYXRhLnR5cGVzKS5maWx0ZXIodCA9PiB0ICE9PSAnRUlQNzEyRG9tYWluJyk7XHJcbiAgICAgIGlmICh0eXBlTmFtZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgcHJpbWFyeVR5cGUgPSB0eXBlTmFtZXNbMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgaW5mZXIgcHJpbWFyeVR5cGUgLSBwbGVhc2Ugc3BlY2lmeSBpdCBleHBsaWNpdGx5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBWYWxpZGF0ZSB0aGF0IHByaW1hcnlUeXBlIGV4aXN0cyBpbiB0eXBlc1xyXG4gICAgaWYgKCF0eXBlZERhdGEudHlwZXNbcHJpbWFyeVR5cGVdKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJpbWFyeSB0eXBlIFwiJHtwcmltYXJ5VHlwZX1cIiBub3QgZm91bmQgaW4gdHlwZXMgZGVmaW5pdGlvbmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdXNpbmcgZXRoZXJzLmpzIHNpZ25UeXBlZERhdGFcclxuICAgIC8vIGV0aGVycyB2NiB1c2VzOiBzaWduVHlwZWREYXRhKGRvbWFpbiwgdHlwZXMsIHZhbHVlKVxyXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2lnbmVyLnNpZ25UeXBlZERhdGEoXHJcbiAgICAgIHR5cGVkRGF0YS5kb21haW4sXHJcbiAgICAgIHR5cGVkRGF0YS50eXBlcyxcclxuICAgICAgdHlwZWREYXRhLm1lc3NhZ2VcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiB0eXBlZCBkYXRhOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAtIFJQQyBtZXRob2QgKHBlcnNvbmFsX3NpZ24sIGV0aF9zaWduVHlwZWREYXRhX3Y0LCBldGMuKVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwYXJhbXMgLSBSUEMgcGFyYW1ldGVyc1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSB7IHZhbGlkOiBib29sZWFuLCBlcnJvcj86IHN0cmluZywgc2FuaXRpemVkPzogT2JqZWN0IH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKSB7XHJcbiAgaWYgKCFtZXRob2QgfHwgIXBhcmFtcyB8fCAhQXJyYXkuaXNBcnJheShwYXJhbXMpKSB7XHJcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCByZXF1ZXN0IGZvcm1hdCcgfTtcclxuICB9XHJcblxyXG4gIHN3aXRjaCAobWV0aG9kKSB7XHJcbiAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduJzogLy8gTm90ZTogZXRoX3NpZ24gaXMgZGFuZ2Vyb3VzIGFuZCBzaG91bGQgc2hvdyBzdHJvbmcgd2FybmluZ1xyXG4gICAgICBpZiAocGFyYW1zLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXJzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtZXNzYWdlID0gcGFyYW1zWzBdO1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzFdO1xyXG5cclxuICAgICAgaWYgKCFtZXNzYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01lc3NhZ2UgaXMgZW1wdHknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYWRkcmVzcyB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyZXNzKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhbml0aXplIG1lc3NhZ2UgKGNvbnZlcnQgdG8gc3RyaW5nIGlmIG5lZWRlZClcclxuICAgICAgY29uc3Qgc2FuaXRpemVkTWVzc2FnZSA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IG1lc3NhZ2UgOiBTdHJpbmcobWVzc2FnZSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHNhbml0aXplZDoge1xyXG4gICAgICAgICAgbWVzc2FnZTogc2FuaXRpemVkTWVzc2FnZSxcclxuICAgICAgICAgIGFkZHJlc3M6IGV0aGVycy5nZXRBZGRyZXNzKGFkZHJlc3MpIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVycycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYWRkciA9IHBhcmFtc1swXTtcclxuICAgICAgbGV0IHR5cGVkRGF0YSA9IHBhcmFtc1sxXTtcclxuXHJcbiAgICAgIGlmICghYWRkciB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBhcnNlIHR5cGVkIGRhdGEgaWYgaXQncyBhIHN0cmluZ1xyXG4gICAgICBpZiAodHlwZW9mIHR5cGVkRGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdHlwZWREYXRhID0gSlNPTi5wYXJzZSh0eXBlZERhdGEpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgdHlwZWQgZGF0YSBmb3JtYXQnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWYWxpZGF0ZSB0eXBlZCBkYXRhIHN0cnVjdHVyZVxyXG4gICAgICBpZiAoIXR5cGVkRGF0YSB8fCB0eXBlb2YgdHlwZWREYXRhICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdUeXBlZCBkYXRhIG11c3QgYmUgYW4gb2JqZWN0JyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXR5cGVkRGF0YS5kb21haW4gfHwgIXR5cGVkRGF0YS50eXBlcyB8fCAhdHlwZWREYXRhLm1lc3NhZ2UpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnVHlwZWQgZGF0YSBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyAoZG9tYWluLCB0eXBlcywgbWVzc2FnZSknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsaWQ6IHRydWUsXHJcbiAgICAgICAgc2FuaXRpemVkOiB7XHJcbiAgICAgICAgICBhZGRyZXNzOiBldGhlcnMuZ2V0QWRkcmVzcyhhZGRyKSxcclxuICAgICAgICAgIHR5cGVkRGF0YTogdHlwZWREYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBVbnN1cHBvcnRlZCBzaWduaW5nIG1ldGhvZDogJHttZXRob2R9YCB9O1xyXG4gIH1cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGJhY2tncm91bmQvc2VydmljZS13b3JrZXIuanNcclxuICpcclxuICogQmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlciBmb3IgSGVhcnRXYWxsZXRcclxuICogSGFuZGxlcyBSUEMgcmVxdWVzdHMgZnJvbSBkQXBwcyBhbmQgbWFuYWdlcyB3YWxsZXQgc3RhdGVcclxuICovXHJcblxyXG5pbXBvcnQgeyBnZXRBY3RpdmVXYWxsZXQsIHVubG9ja1dhbGxldCwgc2VjdXJlQ2xlYW51cCwgc2VjdXJlQ2xlYW51cFNpZ25lciB9IGZyb20gJy4uL2NvcmUvd2FsbGV0LmpzJztcclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4uL2NvcmUvc3RvcmFnZS5qcyc7XHJcbmltcG9ydCAqIGFzIHJwYyBmcm9tICcuLi9jb3JlL3JwYy5qcyc7XHJcbmltcG9ydCAqIGFzIHR4SGlzdG9yeSBmcm9tICcuLi9jb3JlL3R4SGlzdG9yeS5qcyc7XHJcbmltcG9ydCB7IHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0LCBzYW5pdGl6ZUVycm9yTWVzc2FnZSB9IGZyb20gJy4uL2NvcmUvdHhWYWxpZGF0aW9uLmpzJztcclxuaW1wb3J0IHsgcGVyc29uYWxTaWduLCBzaWduVHlwZWREYXRhLCB2YWxpZGF0ZVNpZ25SZXF1ZXN0IH0gZnJvbSAnLi4vY29yZS9zaWduaW5nLmpzJztcclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8vIFNlcnZpY2Ugd29ya2VyIGxvYWRlZFxyXG5cclxuLy8gTmV0d29yayBjaGFpbiBJRHNcclxuY29uc3QgQ0hBSU5fSURTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6ICcweDNBRicsIC8vIDk0M1xyXG4gICdwdWxzZWNoYWluJzogJzB4MTcxJywgLy8gMzY5XHJcbiAgJ2V0aGVyZXVtJzogJzB4MScsIC8vIDFcclxuICAnc2Vwb2xpYSc6ICcweEFBMzZBNycgLy8gMTExNTUxMTFcclxufTtcclxuXHJcbi8vIFN0b3JhZ2Uga2V5c1xyXG5jb25zdCBDT05ORUNURURfU0lURVNfS0VZID0gJ2Nvbm5lY3RlZF9zaXRlcyc7XHJcblxyXG4vLyBQZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdHMgKG9yaWdpbiAtPiB7IHJlc29sdmUsIHJlamVjdCwgdGFiSWQgfSlcclxuY29uc3QgcGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gU0lHTklORyBBVURJVCBMT0cgPT09PT1cclxuLy8gU3RvcmVzIHJlY2VudCBzaWduaW5nIG9wZXJhdGlvbnMgZm9yIHNlY3VyaXR5IGF1ZGl0aW5nIChpbi1tZW1vcnksIGNsZWFyZWQgb24gc2VydmljZSB3b3JrZXIgcmVzdGFydClcclxuY29uc3QgU0lHTklOR19MT0dfS0VZID0gJ3NpZ25pbmdfYXVkaXRfbG9nJztcclxuY29uc3QgTUFYX1NJR05JTkdfTE9HX0VOVFJJRVMgPSAxMDA7XHJcblxyXG4vKipcclxuICogTG9nIGEgc2lnbmluZyBvcGVyYXRpb24gZm9yIGF1ZGl0IHB1cnBvc2VzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIExvZyBlbnRyeSBkZXRhaWxzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRyeS50eXBlIC0gVHlwZSBvZiBzaWduaW5nICh0cmFuc2FjdGlvbiwgcGVyc29uYWxfc2lnbiwgdHlwZWRfZGF0YSlcclxuICogQHBhcmFtIHtzdHJpbmd9IGVudHJ5LmFkZHJlc3MgLSBXYWxsZXQgYWRkcmVzcyB0aGF0IHNpZ25lZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkub3JpZ2luIC0gZEFwcCBvcmlnaW4gdGhhdCByZXF1ZXN0ZWQgdGhlIHNpZ25hdHVyZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkubWV0aG9kIC0gUlBDIG1ldGhvZCB1c2VkXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW50cnkuc3VjY2VzcyAtIFdoZXRoZXIgc2lnbmluZyBzdWNjZWVkZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS50eEhhc2hdIC0gVHJhbnNhY3Rpb24gaGFzaCAoZm9yIHRyYW5zYWN0aW9ucylcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS5lcnJvcl0gLSBFcnJvciBtZXNzYWdlIChpZiBmYWlsZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBsb2dTaWduaW5nT3BlcmF0aW9uKGVudHJ5KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGxvZ0VudHJ5ID0ge1xyXG4gICAgICAuLi5lbnRyeSxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdldCBleGlzdGluZyBsb2dcclxuICAgIGNvbnN0IGV4aXN0aW5nTG9nID0gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEFkZCBuZXcgZW50cnkgYXQgdGhlIGJlZ2lubmluZ1xyXG4gICAgZXhpc3RpbmdMb2cudW5zaGlmdChsb2dFbnRyeSk7XHJcblxyXG4gICAgLy8gVHJpbSB0byBtYXggZW50cmllc1xyXG4gICAgaWYgKGV4aXN0aW5nTG9nLmxlbmd0aCA+IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTKSB7XHJcbiAgICAgIGV4aXN0aW5nTG9nLmxlbmd0aCA9IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgbG9nXHJcbiAgICBhd2FpdCBzYXZlKFNJR05JTkdfTE9HX0tFWSwgZXhpc3RpbmdMb2cpO1xyXG5cclxuICAgIC8vIEFsc28gbG9nIHRvIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAgY29uc3QgaWNvbiA9IGVudHJ5LnN1Y2Nlc3MgPyAn4pyFJyA6ICfinYwnO1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgJHtpY29ufSBTaWduaW5nIGF1ZGl0OiAke2VudHJ5LnR5cGV9IGZyb20gJHtlbnRyeS5vcmlnaW59IC0gJHtlbnRyeS5zdWNjZXNzID8gJ1NVQ0NFU1MnIDogJ0ZBSUxFRCd9YCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIERvbid0IGxldCBsb2dnaW5nIGZhaWx1cmVzIGFmZmVjdCBzaWduaW5nIG9wZXJhdGlvbnNcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgbG9nZ2luZyBzaWduaW5nIG9wZXJhdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHNpZ25pbmcgYXVkaXQgbG9nXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gQXJyYXkgb2YgbG9nIGVudHJpZXNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNpZ25pbmdBdWRpdExvZygpIHtcclxuICByZXR1cm4gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG59XHJcblxyXG4vLyA9PT09PSBTRVNTSU9OIE1BTkFHRU1FTlQgPT09PT1cclxuLy8gU2Vzc2lvbiB0b2tlbnMgc3RvcmVkIGluIG1lbW9yeSAoY2xlYXJlZCB3aGVuIHNlcnZpY2Ugd29ya2VyIHRlcm1pbmF0ZXMpXHJcbi8vIFNFQ1VSSVRZIE5PVEU6IFNlcnZpY2Ugd29ya2VycyBjYW4gYmUgdGVybWluYXRlZCBieSBDaHJvbWUgYXQgYW55IHRpbWUsIHdoaWNoIGNsZWFycyBhbGxcclxuLy8gc2Vzc2lvbiBkYXRhLiBUaGlzIGlzIGludGVudGlvbmFsIC0gd2UgZG9uJ3Qgd2FudCBwYXNzd29yZHMgcGVyc2lzdGluZyBsb25nZXIgdGhhbiBuZWVkZWQuXHJcbi8vIFNlc3Npb25zIGFyZSBlbmNyeXB0ZWQgaW4gbWVtb3J5IGFzIGFuIGFkZGl0aW9uYWwgc2VjdXJpdHkgbGF5ZXIuXHJcbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpOyAvLyBzZXNzaW9uVG9rZW4gLT4geyBlbmNyeXB0ZWRQYXNzd29yZCwgd2FsbGV0SWQsIGV4cGlyZXNBdCwgc2FsdCB9XHJcblxyXG4vLyBTZXNzaW9uIGVuY3J5cHRpb24ga2V5IChyZWdlbmVyYXRlZCBvbiBzZXJ2aWNlIHdvcmtlciBzdGFydClcclxubGV0IHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHNlc3Npb24gZW5jcnlwdGlvbiBrZXkgdXNpbmcgV2ViIENyeXB0byBBUElcclxuICogS2V5IGlzIHJlZ2VuZXJhdGVkIGVhY2ggdGltZSBzZXJ2aWNlIHdvcmtlciBzdGFydHMgKG1lbW9yeSBvbmx5LCBuZXZlciBwZXJzaXN0ZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKSB7XHJcbiAgaWYgKCFzZXNzaW9uRW5jcnlwdGlvbktleSkge1xyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gMjU2LWJpdCBrZXkgZm9yIEFFUy1HQ00gZW5jcnlwdGlvblxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcclxuICAgICAgZmFsc2UsIC8vIE5vdCBleHRyYWN0YWJsZVxyXG4gICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY3J5cHRzIHBhc3N3b3JkIGZvciBzZXNzaW9uIHN0b3JhZ2UgdXNpbmcgQUVTLUdDTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBQYXNzd29yZCB0byBlbmNyeXB0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtlbmNyeXB0ZWQ6IEFycmF5QnVmZmVyLCBpdjogVWludDhBcnJheX0+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCkge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICBjb25zdCBwYXNzd29yZERhdGEgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcbiAgXHJcbiAgLy8gR2VuZXJhdGUgcmFuZG9tIElWIGZvciB0aGlzIGVuY3J5cHRpb25cclxuICAvLyBTRUNVUklUWTogSVYgdW5pcXVlbmVzcyBpcyBjcnlwdG9ncmFwaGljYWxseSBndWFyYW50ZWVkIGJ5IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKVxyXG4gIC8vIHdoaWNoIHVzZXMgdGhlIGJyb3dzZXIncyBDU1BSTkcgKENyeXB0b2dyYXBoaWNhbGx5IFNlY3VyZSBQc2V1ZG8tUmFuZG9tIE51bWJlciBHZW5lcmF0b3IpXHJcbiAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7XHJcbiAgXHJcbiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIHBhc3N3b3JkRGF0YVxyXG4gICk7XHJcbiAgXHJcbiAgcmV0dXJuIHsgZW5jcnlwdGVkLCBpdiB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVjcnlwdHMgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkIC0gRW5jcnlwdGVkIHBhc3N3b3JkIGRhdGFcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBpdiAtIEluaXRpYWxpemF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oZW5jcnlwdGVkLCBpdikge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIFxyXG4gIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBlbmNyeXB0ZWRcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuICByZXR1cm4gZGVjb2Rlci5kZWNvZGUoZGVjcnlwdGVkKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlc3Npb24gdG9rZW5cclxuZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBuZXcgc2Vzc2lvblxyXG4vLyBTRUNVUklUWTogRGVmYXVsdCBzZXNzaW9uIGR1cmF0aW9uIHJlZHVjZWQgdG8gMTUgbWludXRlcyB0byBtaW5pbWl6ZSBwYXNzd29yZCBleHBvc3VyZSBpbiBtZW1vcnlcclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihwYXNzd29yZCwgd2FsbGV0SWQsIGR1cmF0aW9uTXMgPSA5MDAwMDApIHsgLy8gRGVmYXVsdCAxNSBtaW51dGVzICh3YXMgMSBob3VyKVxyXG4gIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGdlbmVyYXRlU2Vzc2lvblRva2VuKCk7XHJcbiAgY29uc3QgZXhwaXJlc0F0ID0gRGF0ZS5ub3coKSArIGR1cmF0aW9uTXM7XHJcbiAgXHJcbiAgLy8gRW5jcnlwdCBwYXNzd29yZCBiZWZvcmUgc3RvcmluZyBpbiBtZW1vcnlcclxuICBjb25zdCB7IGVuY3J5cHRlZCwgaXYgfSA9IGF3YWl0IGVuY3J5cHRQYXNzd29yZEZvclNlc3Npb24ocGFzc3dvcmQpO1xyXG5cclxuICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvblRva2VuLCB7XHJcbiAgICBlbmNyeXB0ZWRQYXNzd29yZDogZW5jcnlwdGVkLFxyXG4gICAgaXY6IGl2LFxyXG4gICAgd2FsbGV0SWQsXHJcbiAgICBleHBpcmVzQXRcclxuICB9KTtcclxuXHJcbiAgLy8gQXV0by1jbGVhbnVwIGV4cGlyZWQgc2Vzc2lvblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvblRva2VuKTtcclxuICAgICAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgICAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZXNzaW9uIGV4cGlyZWQgYW5kIHJlbW92ZWQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIGR1cmF0aW9uTXMpO1xyXG5cclxuICAvLyBTZXNzaW9uIGNyZWF0ZWRcclxuICByZXR1cm4gc2Vzc2lvblRva2VuO1xyXG59XHJcblxyXG4vLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCByZXR1cm4gZGVjcnlwdGVkIHBhc3N3b3JkXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXNlc3Npb25Ub2tlbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBzZXNzaW9uIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcblxyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG9yIGV4cGlyZWQgc2Vzc2lvbicpO1xyXG4gIH1cclxuXHJcbiAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZXNzaW9uIGV4cGlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIERlY3J5cHQgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICByZXR1cm4gYXdhaXQgZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oc2Vzc2lvbi5lbmNyeXB0ZWRQYXNzd29yZCwgc2Vzc2lvbi5pdik7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgc2Vzc2lvblxyXG5mdW5jdGlvbiBpbnZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25Ub2tlbikpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgLy8gU2Vzc2lvbiBpbnZhbGlkYXRlZFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gSW52YWxpZGF0ZSBhbGwgc2Vzc2lvbnNcclxuZnVuY3Rpb24gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCkge1xyXG4gIGNvbnN0IGNvdW50ID0gYWN0aXZlU2Vzc2lvbnMuc2l6ZTtcclxuICBhY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xyXG4gIC8vIEFsbCBzZXNzaW9ucyBpbnZhbGlkYXRlZFxyXG4gIHJldHVybiBjb3VudDtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBleHRlbnNpb24gaW5zdGFsbGF0aW9uXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBpbnN0YWxsZWQnKTtcclxufSk7XHJcblxyXG4vLyBHZXQgY29ubmVjdGVkIHNpdGVzIGZyb20gc3RvcmFnZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlcygpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGxvYWQoQ09OTkVDVEVEX1NJVEVTX0tFWSk7XHJcbiAgcmV0dXJuIHNpdGVzIHx8IHt9O1xyXG59XHJcblxyXG4vLyBDaGVjayBpZiBhIHNpdGUgaXMgY29ubmVjdGVkXHJcbmFzeW5jIGZ1bmN0aW9uIGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgcmV0dXJuICEhc2l0ZXNbb3JpZ2luXTtcclxufVxyXG5cclxuLy8gQWRkIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gYWRkQ29ubmVjdGVkU2l0ZShvcmlnaW4sIGFjY291bnRzKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIHNpdGVzW29yaWdpbl0gPSB7XHJcbiAgICBhY2NvdW50cyxcclxuICAgIGNvbm5lY3RlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuICBhd2FpdCBzYXZlKENPTk5FQ1RFRF9TSVRFU19LRVksIHNpdGVzKTtcclxufVxyXG5cclxuLy8gUmVtb3ZlIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ29ubmVjdGVkU2l0ZShvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgZGVsZXRlIHNpdGVzW29yaWdpbl07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIEdldCBjdXJyZW50IG5ldHdvcmsgY2hhaW4gSURcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudENoYWluSWQoKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgcmV0dXJuIENIQUlOX0lEU1tuZXR3b3JrIHx8ICdwdWxzZWNoYWluVGVzdG5ldCddO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0IHJlcXVlc3RzIGZyb20gY29udGVudCBzY3JpcHRzXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVdhbGxldFJlcXVlc3QobWVzc2FnZSwgc2VuZGVyKSB7XHJcbiAgY29uc3QgeyBtZXRob2QsIHBhcmFtcyB9ID0gbWVzc2FnZTtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IEdldCBvcmlnaW4gZnJvbSBDaHJvbWUgQVBJLCBub3QgbWVzc2FnZSBwYXlsb2FkIChwcmV2ZW50cyBzcG9vZmluZylcclxuICBjb25zdCB1cmwgPSBuZXcgVVJMKHNlbmRlci51cmwpO1xyXG4gIGNvbnN0IG9yaWdpbiA9IHVybC5vcmlnaW47XHJcblxyXG4gIC8vIEhhbmRsaW5nIHdhbGxldCByZXF1ZXN0XHJcblxyXG4gIHRyeSB7XHJcbiAgICBzd2l0Y2ggKG1ldGhvZCkge1xyXG4gICAgICBjYXNlICdldGhfcmVxdWVzdEFjY291bnRzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlUmVxdWVzdEFjY291bnRzKG9yaWdpbiwgc2VuZGVyLnRhYik7XHJcblxyXG4gICAgICBjYXNlICdldGhfYWNjb3VudHMnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBY2NvdW50cyhvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2NoYWluSWQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVDaGFpbklkKCk7XHJcblxyXG4gICAgICBjYXNlICduZXRfdmVyc2lvbic6XHJcbiAgICAgICAgY29uc3QgY2hhaW5JZCA9IGF3YWl0IGhhbmRsZUNoYWluSWQoKTtcclxuICAgICAgICByZXR1cm4geyByZXN1bHQ6IHBhcnNlSW50KGNoYWluSWQucmVzdWx0LCAxNikudG9TdHJpbmcoKSB9O1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBZGRDaGFpbihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X3dhdGNoQXNzZXQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVXYXRjaEFzc2V0KHBhcmFtcywgb3JpZ2luLCBzZW5kZXIudGFiKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9ibG9ja051bWJlcic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUJsb2NrTnVtYmVyKCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmxvY2tCeU51bWJlcic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJsb2NrQnlOdW1iZXIocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCYWxhbmNlJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmFsYW5jZShwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uQ291bnQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfY2FsbCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUNhbGwocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9lc3RpbWF0ZUdhcyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUVzdGltYXRlR2FzKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2FzUHJpY2UnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHYXNQcmljZSgpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NlbmRUcmFuc2FjdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2VuZFJhd1RyYW5zYWN0aW9uJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25SZWNlaXB0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25SZWNlaXB0KHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25CeUhhc2gnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvbkJ5SGFzaChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldExvZ3MnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRMb2dzKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0Q29kZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldENvZGUocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCbG9ja0J5SGFzaCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJsb2NrQnlIYXNoKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVQZXJzb25hbFNpZ24ocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YSc6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGFfdjQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTaWduVHlwZWREYXRhKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDEsIG1lc3NhZ2U6IGBNZXRob2QgJHttZXRob2R9IG5vdCBzdXBwb3J0ZWRgIH0gfTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBoYW5kbGluZyByZXF1ZXN0OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3JlcXVlc3RBY2NvdW50cyAtIFJlcXVlc3QgcGVybWlzc2lvbiB0byBjb25uZWN0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHRhYikge1xyXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgY29ubmVjdGVkXHJcbiAgaWYgKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBbd2FsbGV0LmFkZHJlc3NdIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpO1xyXG4gICAgcGVuZGluZ0Nvbm5lY3Rpb25zLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRhYklkOiB0YWI/LmlkIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249Y29ubmVjdCZvcmlnaW49JHtlbmNvZGVVUklDb21wb25lbnQob3JpZ2luKX0mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ0Nvbm5lY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2FjY291bnRzIC0gR2V0IGNvbm5lY3RlZCBhY2NvdW50c1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBY2NvdW50cyhvcmlnaW4pIHtcclxuICAvLyBPbmx5IHJldHVybiBhY2NvdW50cyBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmIChhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIHJldHVybiB7IHJlc3VsdDogW3dhbGxldC5hZGRyZXNzXSB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBbXSB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2NoYWluSWQgLSBHZXQgY3VycmVudCBjaGFpbiBJRFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDaGFpbklkKCkge1xyXG4gIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBnZXRDdXJyZW50Q2hhaW5JZCgpO1xyXG4gIHJldHVybiB7IHJlc3VsdDogY2hhaW5JZCB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4gLSBTd2l0Y2ggdG8gYSBkaWZmZXJlbnQgbmV0d29ya1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdIHx8ICFwYXJhbXNbMF0uY2hhaW5JZCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXMnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHJlcXVlc3RlZENoYWluSWQgPSBwYXJhbXNbMF0uY2hhaW5JZDtcclxuICAvLyBTd2l0Y2hpbmcgY2hhaW5cclxuXHJcbiAgLy8gRmluZCBtYXRjaGluZyBuZXR3b3JrXHJcbiAgY29uc3QgbmV0d29ya01hcCA9IHtcclxuICAgICcweDNhZic6ICdwdWxzZWNoYWluVGVzdG5ldCcsXHJcbiAgICAnMHgzQUYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICAgJzB4MTcxJzogJ3B1bHNlY2hhaW4nLFxyXG4gICAgJzB4MSc6ICdldGhlcmV1bScsXHJcbiAgICAnMHhhYTM2YTcnOiAnc2Vwb2xpYScsXHJcbiAgICAnMHhBQTM2QTcnOiAnc2Vwb2xpYSdcclxuICB9O1xyXG5cclxuICBjb25zdCBuZXR3b3JrS2V5ID0gbmV0d29ya01hcFtyZXF1ZXN0ZWRDaGFpbklkXTtcclxuXHJcbiAgaWYgKCFuZXR3b3JrS2V5KSB7XHJcbiAgICAvLyBDaGFpbiBub3Qgc3VwcG9ydGVkIC0gcmV0dXJuIGVycm9yIGNvZGUgNDkwMiBzbyBkQXBwIGNhbiBjYWxsIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IDQ5MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ1VucmVjb2duaXplZCBjaGFpbiBJRC4gVHJ5IGFkZGluZyB0aGUgY2hhaW4gdXNpbmcgd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4uJ1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIGN1cnJlbnQgbmV0d29ya1xyXG4gIGF3YWl0IHNhdmUoJ2N1cnJlbnROZXR3b3JrJywgbmV0d29ya0tleSk7XHJcblxyXG4gIC8vIE5vdGlmeSBhbGwgdGFicyBhYm91dCBjaGFpbiBjaGFuZ2VcclxuICBjb25zdCBuZXdDaGFpbklkID0gQ0hBSU5fSURTW25ldHdvcmtLZXldO1xyXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCAodGFicykgPT4ge1xyXG4gICAgdGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xyXG4gICAgICAgIHR5cGU6ICdDSEFJTl9DSEFOR0VEJyxcclxuICAgICAgICBjaGFpbklkOiBuZXdDaGFpbklkXHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQsIGlnbm9yZSBlcnJvclxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4geyByZXN1bHQ6IG51bGwgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluIC0gQWRkIGEgbmV3IG5ldHdvcmsgKHNpbXBsaWZpZWQgdmVyc2lvbilcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWRkQ2hhaW4ocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSB8fCAhcGFyYW1zWzBdLmNoYWluSWQpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBjaGFpbkluZm8gPSBwYXJhbXNbMF07XHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgUmVxdWVzdCB0byBhZGQgY2hhaW46JywgY2hhaW5JbmZvKTtcclxuXHJcbiAgLy8gRm9yIG5vdywgb25seSBzdXBwb3J0IG91ciBwcmVkZWZpbmVkIGNoYWluc1xyXG4gIC8vIENoZWNrIGlmIGl0J3Mgb25lIG9mIG91ciBzdXBwb3J0ZWQgY2hhaW5zXHJcbiAgY29uc3Qgc3VwcG9ydGVkQ2hhaW5zID0ge1xyXG4gICAgJzB4M2FmJzogdHJ1ZSxcclxuICAgICcweDNBRic6IHRydWUsXHJcbiAgICAnMHgxNzEnOiB0cnVlLFxyXG4gICAgJzB4MSc6IHRydWUsXHJcbiAgICAnMHhhYTM2YTcnOiB0cnVlLFxyXG4gICAgJzB4QUEzNkE3JzogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIGlmIChzdXBwb3J0ZWRDaGFpbnNbY2hhaW5JbmZvLmNoYWluSWRdKSB7XHJcbiAgICAvLyBDaGFpbiBpcyBhbHJlYWR5IHN1cHBvcnRlZCwganVzdCBzd2l0Y2ggdG8gaXRcclxuICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihbeyBjaGFpbklkOiBjaGFpbkluZm8uY2hhaW5JZCB9XSk7XHJcbiAgfVxyXG5cclxuICAvLyBDdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0XHJcbiAgcmV0dXJuIHtcclxuICAgIGVycm9yOiB7XHJcbiAgICAgIGNvZGU6IC0zMjYwMyxcclxuICAgICAgbWVzc2FnZTogJ0FkZGluZyBjdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0LiBPbmx5IFB1bHNlQ2hhaW4gYW5kIEV0aGVyZXVtIG5ldHdvcmtzIGFyZSBzdXBwb3J0ZWQuJ1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBjb25uZWN0aW9uIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQpIHtcclxuICBpZiAoIXBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4gfSA9IHBlbmRpbmdDb25uZWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICBwZW5kaW5nQ29ubmVjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmIChhcHByb3ZlZCkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIC8vIFNhdmUgY29ubmVjdGVkIHNpdGVcclxuICAgICAgYXdhaXQgYWRkQ29ubmVjdGVkU2l0ZShvcmlnaW4sIFt3YWxsZXQuYWRkcmVzc10pO1xyXG5cclxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcGVuZGluZyBwcm9taXNlXHJcbiAgICAgIHJlc29sdmUoeyByZXN1bHQ6IFt3YWxsZXQuYWRkcmVzc10gfSk7XHJcblxyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZWplY3QobmV3IEVycm9yKCdObyBhY3RpdmUgd2FsbGV0JykpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBhY3RpdmUgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIGNvbm5lY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGNvbm5lY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRDb25uZWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiB9ID0gcGVuZGluZ0Nvbm5lY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGtleVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50TmV0d29yaygpIHtcclxuICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKTtcclxuICByZXR1cm4gbmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2Jsb2NrTnVtYmVyIC0gR2V0IGN1cnJlbnQgYmxvY2sgbnVtYmVyXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJsb2NrTnVtYmVyKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gYXdhaXQgcnBjLmdldEJsb2NrTnVtYmVyKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9ja051bWJlciB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCbG9ja0J5TnVtYmVyIC0gR2V0IGJsb2NrIGJ5IG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgbnVtYmVyIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgaW5jbHVkZVRyYW5zYWN0aW9ucyA9IHBhcmFtc1sxXSB8fCBmYWxzZTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBycGMuZ2V0QmxvY2tCeU51bWJlcihuZXR3b3JrLCBibG9ja051bWJlciwgaW5jbHVkZVRyYW5zYWN0aW9ucyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgbnVtYmVyOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldEJhbGFuY2UgLSBHZXQgYmFsYW5jZSBmb3IgYW4gYWRkcmVzc1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBiYWxhbmNlID0gYXdhaXQgcnBjLmdldEJhbGFuY2UobmV0d29yaywgYWRkcmVzcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJhbGFuY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQ291bnQgLSBHZXQgdHJhbnNhY3Rpb24gY291bnQgKG5vbmNlKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBjb3VudCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb3VudCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGNvdW50OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dhc1ByaWNlIC0gR2V0IGN1cnJlbnQgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdhc1ByaWNlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXNQcmljZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9lc3RpbWF0ZUdhcyAtIEVzdGltYXRlIGdhcyBmb3IgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgZ2FzID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGdhcyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jYWxsIC0gRXhlY3V0ZSBhIHJlYWQtb25seSBjYWxsXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbGwocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJwYy5jYWxsKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXhlY3V0aW5nIGNhbGw6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFJhd1RyYW5zYWN0aW9uIC0gU2VuZCBhIHByZS1zaWduZWQgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3Npbmcgc2lnbmVkIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNpZ25lZFR4ID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBhd2FpdCBycGMuc2VuZFJhd1RyYW5zYWN0aW9uKG5ldHdvcmssIHNpZ25lZFR4KTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogdHhIYXNoIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgcmF3IHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCAtIEdldCB0cmFuc2FjdGlvbiByZWNlaXB0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgdHhIYXNoID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uUmVjZWlwdChuZXR3b3JrLCB0eEhhc2gpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiByZWNlaXB0IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gcmVjZWlwdDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvbkJ5SGFzaCAtIEdldCB0cmFuc2FjdGlvbiBieSBoYXNoXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoKG5ldHdvcmssIHR4SGFzaCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHR4IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gYnkgaGFzaDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0TG9ncyhwYXJhbXMpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGxvZ3MgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0TG9ncycsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGxvZ3MgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBsb2dzOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRDb2RlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgY29kZSA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRDb2RlJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogY29kZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGNvZGU6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEJsb2NrQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0QmxvY2tCeUhhc2gnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9jayB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIGJ5IGhhc2g6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFBlbmRpbmcgdHJhbnNhY3Rpb24gcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luIH0pXHJcbmNvbnN0IHBlbmRpbmdUcmFuc2FjdGlvbnMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyBQZW5kaW5nIHRva2VuIGFkZCByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRva2VuSW5mbyB9KVxyXG5jb25zdCBwZW5kaW5nVG9rZW5SZXF1ZXN0cyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vIFBlbmRpbmcgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSlcclxuY29uc3QgcGVuZGluZ1NpZ25SZXF1ZXN0cyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vID09PT09IFJBVEUgTElNSVRJTkcgPT09PT1cclxuLy8gUHJldmVudHMgbWFsaWNpb3VzIGRBcHBzIGZyb20gc3BhbW1pbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVxdWVzdHNcclxuY29uc3QgcmF0ZUxpbWl0TWFwID0gbmV3IE1hcCgpOyAvLyBvcmlnaW4gLT4geyBjb3VudCwgd2luZG93U3RhcnQsIHBlbmRpbmdDb3VudCB9XHJcblxyXG5jb25zdCBSQVRFX0xJTUlUX0NPTkZJRyA9IHtcclxuICBNQVhfUEVORElOR19SRVFVRVNUUzogNSwgLy8gTWF4IHBlbmRpbmcgcmVxdWVzdHMgcGVyIG9yaWdpblxyXG4gIE1BWF9SRVFVRVNUU19QRVJfV0lORE9XOiAyMCwgLy8gTWF4IHRvdGFsIHJlcXVlc3RzIHBlciB0aW1lIHdpbmRvd1xyXG4gIFRJTUVfV0lORE9XX01TOiA2MDAwMCAvLyAxIG1pbnV0ZSB3aW5kb3dcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYW4gb3JpZ2luIGhhcyBleGNlZWRlZCByYXRlIGxpbWl0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBjaGVja1xyXG4gKiBAcmV0dXJucyB7eyBhbGxvd2VkOiBib29sZWFuLCByZWFzb24/OiBzdHJpbmcgfX1cclxuICovXHJcbmZ1bmN0aW9uIGNoZWNrUmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgXHJcbiAgLy8gR2V0IG9yIGNyZWF0ZSByYXRlIGxpbWl0IGVudHJ5IGZvciB0aGlzIG9yaWdpblxyXG4gIGlmICghcmF0ZUxpbWl0TWFwLmhhcyhvcmlnaW4pKSB7XHJcbiAgICByYXRlTGltaXRNYXAuc2V0KG9yaWdpbiwge1xyXG4gICAgICBjb3VudDogMCxcclxuICAgICAgd2luZG93U3RhcnQ6IG5vdyxcclxuICAgICAgcGVuZGluZ0NvdW50OiAwXHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIFxyXG4gIC8vIFJlc2V0IHdpbmRvdyBpZiBleHBpcmVkXHJcbiAgaWYgKG5vdyAtIGxpbWl0RGF0YS53aW5kb3dTdGFydCA+IFJBVEVfTElNSVRfQ09ORklHLlRJTUVfV0lORE9XX01TKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQgPSAwO1xyXG4gICAgbGltaXREYXRhLndpbmRvd1N0YXJ0ID0gbm93O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayBwZW5kaW5nIHJlcXVlc3RzIGxpbWl0XHJcbiAgaWYgKGxpbWl0RGF0YS5wZW5kaW5nQ291bnQgPj0gUkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFMpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFsbG93ZWQ6IGZhbHNlLFxyXG4gICAgICByZWFzb246IGBUb28gbWFueSBwZW5kaW5nIHJlcXVlc3RzLiBNYXhpbXVtICR7UkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFN9IHBlbmRpbmcgcmVxdWVzdHMgYWxsb3dlZC5gXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayB0b3RhbCByZXF1ZXN0cyBpbiB3aW5kb3dcclxuICBpZiAobGltaXREYXRhLmNvdW50ID49IFJBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhbGxvd2VkOiBmYWxzZSxcclxuICAgICAgcmVhc29uOiBgUmF0ZSBsaW1pdCBleGNlZWRlZC4gTWF4aW11bSAke1JBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XfSByZXF1ZXN0cyBwZXIgbWludXRlLmBcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHJldHVybiB7IGFsbG93ZWQ6IHRydWUgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluY3JlbWVudHMgcmF0ZSBsaW1pdCBjb3VudGVycyBmb3IgYW4gb3JpZ2luXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGluY3JlbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gaW5jcmVtZW50UmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBpZiAobGltaXREYXRhKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQrKztcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQrKztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWNyZW1lbnRzIHBlbmRpbmcgY291bnRlciB3aGVuIHJlcXVlc3QgaXMgcmVzb2x2ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gZGVjcmVtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKSB7XHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIGlmIChsaW1pdERhdGEgJiYgbGltaXREYXRhLnBlbmRpbmdDb3VudCA+IDApIHtcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQtLTtcclxuICB9XHJcbn1cclxuXHJcbi8vIENsZWFuIHVwIG9sZCByYXRlIGxpbWl0IGVudHJpZXMgZXZlcnkgNSBtaW51dGVzXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW29yaWdpbiwgZGF0YV0gb2YgcmF0ZUxpbWl0TWFwLmVudHJpZXMoKSkge1xyXG4gICAgaWYgKG5vdyAtIGRhdGEud2luZG93U3RhcnQgPiBSQVRFX0xJTUlUX0NPTkZJRy5USU1FX1dJTkRPV19NUyAqIDUgJiYgZGF0YS5wZW5kaW5nQ291bnQgPT09IDApIHtcclxuICAgICAgcmF0ZUxpbWl0TWFwLmRlbGV0ZShvcmlnaW4pO1xyXG4gICAgfVxyXG4gIH1cclxufSwgMzAwMDAwKTtcclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIFJFUExBWSBQUk9URUNUSU9OID09PT09XHJcbi8vIFByZXZlbnRzIHRoZSBzYW1lIHRyYW5zYWN0aW9uIGFwcHJvdmFsIGZyb20gYmVpbmcgdXNlZCBtdWx0aXBsZSB0aW1lc1xyXG5jb25zdCBwcm9jZXNzZWRBcHByb3ZhbHMgPSBuZXcgTWFwKCk7IC8vIGFwcHJvdmFsVG9rZW4gLT4geyB0aW1lc3RhbXAsIHR4SGFzaCwgdXNlZDogdHJ1ZSB9XHJcblxyXG5jb25zdCBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcgPSB7XHJcbiAgQVBQUk9WQUxfVElNRU9VVDogMzAwMDAwLCAvLyA1IG1pbnV0ZXMgLSBhcHByb3ZhbCBleHBpcmVzIGFmdGVyIHRoaXNcclxuICBDTEVBTlVQX0lOVEVSVkFMOiA2MDAwMCAgIC8vIDEgbWludXRlIC0gY2xlYW4gdXAgb2xkIGFwcHJvdmFsc1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlblxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBVbmlxdWUgYXBwcm92YWwgdG9rZW5cclxuICovXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQXBwcm92YWxUb2tlbigpIHtcclxuICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KDMyKTtcclxuICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcclxuICByZXR1cm4gQXJyYXkuZnJvbShhcnJheSwgYnl0ZSA9PiBieXRlLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhbmQgbWFya3MgYW4gYXBwcm92YWwgdG9rZW4gYXMgdXNlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBwcm92YWxUb2tlbiAtIFRva2VuIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbGlkIGFuZCBub3QgeWV0IHVzZWRcclxuICovXHJcbmZ1bmN0aW9uIHZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSB7XHJcbiAgaWYgKCFhcHByb3ZhbFRva2VuKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgTm8gYXBwcm92YWwgdG9rZW4gcHJvdmlkZWQnKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgYXBwcm92YWwgPSBwcm9jZXNzZWRBcHByb3ZhbHMuZ2V0KGFwcHJvdmFsVG9rZW4pO1xyXG4gIFxyXG4gIGlmICghYXBwcm92YWwpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBVbmtub3duIGFwcHJvdmFsIHRva2VuJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIGlmIChhcHByb3ZhbC51c2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQXBwcm92YWwgdG9rZW4gYWxyZWFkeSB1c2VkIC0gcHJldmVudGluZyByZXBsYXkgYXR0YWNrJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIGlmIGFwcHJvdmFsIGhhcyBleHBpcmVkXHJcbiAgY29uc3QgYWdlID0gRGF0ZS5ub3coKSAtIGFwcHJvdmFsLnRpbWVzdGFtcDtcclxuICBpZiAoYWdlID4gUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkFQUFJPVkFMX1RJTUVPVVQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBBcHByb3ZhbCB0b2tlbiBleHBpcmVkJyk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKGFwcHJvdmFsVG9rZW4pO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBcclxuICAvLyBNYXJrIGFzIHVzZWRcclxuICBhcHByb3ZhbC51c2VkID0gdHJ1ZTtcclxuICBhcHByb3ZhbC51c2VkQXQgPSBEYXRlLm5vdygpO1xyXG4gIGNvbnNvbGUubG9nKCfwn6uAIEFwcHJvdmFsIHRva2VuIHZhbGlkYXRlZCBhbmQgbWFya2VkIGFzIHVzZWQnKTtcclxuICBcclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLy8gQ2xlYW4gdXAgb2xkIHByb2Nlc3NlZCBhcHByb3ZhbHMgZXZlcnkgbWludXRlXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW3Rva2VuLCBhcHByb3ZhbF0gb2YgcHJvY2Vzc2VkQXBwcm92YWxzLmVudHJpZXMoKSkge1xyXG4gICAgY29uc3QgYWdlID0gbm93IC0gYXBwcm92YWwudGltZXN0YW1wO1xyXG4gICAgaWYgKGFnZSA+IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5BUFBST1ZBTF9USU1FT1VUICogMikge1xyXG4gICAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKHRva2VuKTtcclxuICAgIH1cclxuICB9XHJcbn0sIFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5DTEVBTlVQX0lOVEVSVkFMKTtcclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFRyYW5zYWN0aW9uIC0gU2lnbiBhbmQgc2VuZCBhIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogQ2hlY2sgcmF0ZSBsaW1pdCB0byBwcmV2ZW50IHNwYW1cclxuICBjb25zdCByYXRlTGltaXRDaGVjayA9IGNoZWNrUmF0ZUxpbWl0KG9yaWdpbik7XHJcbiAgaWYgKCFyYXRlTGltaXRDaGVjay5hbGxvd2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgUmF0ZSBsaW1pdCBleGNlZWRlZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MjAwLCBtZXNzYWdlOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShyYXRlTGltaXRDaGVjay5yZWFzb24pIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHR4UmVxdWVzdCA9IHBhcmFtc1swXTtcclxuXHJcbiAgLy8gR2V0IGN1cnJlbnQgbmV0d29yayBmcm9tIHN0b3JhZ2VcclxuICBjb25zdCBjdXJyZW50TmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJykgfHwgJ3B1bHNlY2hhaW4nO1xyXG5cclxuICAvLyBEeW5hbWljYWxseSBmZXRjaCBjdXJyZW50IGdhcyBwcmljZSBhbmQgdXNlIDN4IGFzIG1heCAodG8gYWxsb3cgZm9yIHZvbGF0aWxpdHkpXHJcbiAgbGV0IG1heEdhc1ByaWNlR3dlaTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgY3VycmVudEdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKGN1cnJlbnROZXR3b3JrKTtcclxuICAgIGNvbnN0IGN1cnJlbnRHYXNQcmljZUd3ZWkgPSBOdW1iZXIoQmlnSW50KGN1cnJlbnRHYXNQcmljZSkpIC8gMWU5O1xyXG4gICAgLy8gVXNlIDN4IGN1cnJlbnQgcHJpY2UgYXMgbWF4IHRvIGFsbG93IGZvciBuZXR3b3JrIHZvbGF0aWxpdHlcclxuICAgIG1heEdhc1ByaWNlR3dlaSA9IE1hdGguY2VpbChjdXJyZW50R2FzUHJpY2VHd2VpICogMyk7XHJcbiAgICAvLyBFbnN1cmUgbWluaW11bSBvZiAxMDAgR3dlaSBmb3IgdmVyeSBsb3cgZ2FzIG5ldHdvcmtzXHJcbiAgICBtYXhHYXNQcmljZUd3ZWkgPSBNYXRoLm1heChtYXhHYXNQcmljZUd3ZWksIDEwMCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUud2FybignRmFpbGVkIHRvIGZldGNoIGdhcyBwcmljZSwgdXNpbmcgaGlnaCBkZWZhdWx0OicsIGVycm9yKTtcclxuICAgIC8vIElmIHdlIGNhbid0IGZldGNoIGdhcyBwcmljZSwgdXNlIGEgdmVyeSBoaWdoIGRlZmF1bHQgdG8gYXZvaWQgYmxvY2tpbmcgdHJhbnNhY3Rpb25zXHJcbiAgICBtYXhHYXNQcmljZUd3ZWkgPSAxMDAwMDAwMDsgLy8gMTBNIEd3ZWkgLSBlc3NlbnRpYWxseSBubyBsaW1pdFxyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IENvbXByZWhlbnNpdmUgdHJhbnNhY3Rpb24gdmFsaWRhdGlvblxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCB0cmFuc2FjdGlvbiBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3JzKTtcclxuICAgIHJldHVybiB7IFxyXG4gICAgICBlcnJvcjogeyBcclxuICAgICAgICBjb2RlOiAtMzI2MDIsIFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHRyYW5zYWN0aW9uOiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcnMuam9pbignOyAnKSkgXHJcbiAgICAgIH0gXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVXNlIHNhbml0aXplZCB0cmFuc2FjdGlvbiBwYXJhbWV0ZXJzXHJcbiAgY29uc3Qgc2FuaXRpemVkVHggPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gSW5jcmVtZW50IHJhdGUgbGltaXQgY291bnRlclxyXG4gIGluY3JlbWVudFJhdGVMaW1pdChvcmlnaW4pO1xyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpO1xyXG4gICAgXHJcbiAgICAvLyBTRUNVUklUWTogR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gU3RvcmUgc2FuaXRpemVkIHRyYW5zYWN0aW9uIGluc3RlYWQgb2Ygb3JpZ2luYWwgcmVxdWVzdFxyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5zZXQocmVxdWVzdElkLCB7IFxyXG4gICAgICByZXNvbHZlLCBcclxuICAgICAgcmVqZWN0LCBcclxuICAgICAgb3JpZ2luLCBcclxuICAgICAgdHhSZXF1ZXN0OiBzYW5pdGl6ZWRUeCxcclxuICAgICAgYXBwcm92YWxUb2tlbiAgLy8gSW5jbHVkZSB0b2tlbiBmb3IgdmFsaWRhdGlvblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj10cmFuc2FjdGlvbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdUcmFuc2FjdGlvbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB0cmFuc2FjdGlvbiBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2Vzc2lvblRva2VuLCBnYXNQcmljZSwgY3VzdG9tTm9uY2UsIHR4SGFzaCkge1xyXG4gIGlmICghcGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHR4UmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1RyYW5zYWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIERlY3JlbWVudCBwZW5kaW5nIGNvdW50ZXIgKHJlcXVlc3QgY29tcGxldGVkKVxyXG4gIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRyYW5zYWN0aW9uJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBJZiB0eEhhc2ggaXMgcHJvdmlkZWQsIGl0IG1lYW5zIHRyYW5zYWN0aW9uIHdhcyBhbHJlYWR5IHNpZ25lZCBhbmQgYnJvYWRjYXN0XHJcbiAgICAvLyBieSBhIGhhcmR3YXJlIHdhbGxldCBpbiB0aGUgcG9wdXAuIEp1c3QgcmVzb2x2ZSB3aXRoIHRoZSBoYXNoLlxyXG4gICAgaWYgKHR4SGFzaCkge1xyXG4gICAgICBjb25zb2xlLmxvZygnSGFyZHdhcmUgd2FsbGV0IHRyYW5zYWN0aW9uIGFscmVhZHkgYnJvYWRjYXN0OicsIHR4SGFzaCk7XHJcblxyXG4gICAgICAvLyBHZXQgYWN0aXZlIHdhbGxldCBmb3Igc2F2aW5nIHRvIGhpc3RvcnlcclxuICAgICAgY29uc3QgYWN0aXZlV2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG5cclxuICAgICAgLy8gU2F2ZSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShhY3RpdmVXYWxsZXQuYWRkcmVzcywge1xyXG4gICAgICAgIGhhc2g6IHR4SGFzaCxcclxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgZnJvbTogYWN0aXZlV2FsbGV0LmFkZHJlc3MsXHJcbiAgICAgICAgdG86IHR4UmVxdWVzdC50byB8fCBudWxsLFxyXG4gICAgICAgIHZhbHVlOiB0eFJlcXVlc3QudmFsdWUgfHwgJzAnLFxyXG4gICAgICAgIGRhdGE6IHR4UmVxdWVzdC5kYXRhIHx8ICcweCcsXHJcbiAgICAgICAgZ2FzUHJpY2U6ICcwJywgLy8gV2lsbCBiZSB1cGRhdGVkIGJ5IHRyYW5zYWN0aW9uIG1vbml0b3JpbmdcclxuICAgICAgICBnYXNMaW1pdDogdHhSZXF1ZXN0Lmdhc0xpbWl0IHx8IHR4UmVxdWVzdC5nYXMgfHwgbnVsbCxcclxuICAgICAgICBub25jZTogbnVsbCwgLy8gV2lsbCBiZSB1cGRhdGVkIGJ5IHRyYW5zYWN0aW9uIG1vbml0b3JpbmdcclxuICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICAgIHR5cGU6IHR4SGlzdG9yeS5UWF9UWVBFUy5DT05UUkFDVFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU2VudCcsXHJcbiAgICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIHNlbnQ6ICR7dHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5gLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gU3RhcnQgbW9uaXRvcmluZyB0cmFuc2FjdGlvbiBmb3IgY29uZmlybWF0aW9uXHJcbiAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHsgaGFzaDogdHhIYXNoIH0sIHByb3ZpZGVyLCBhY3RpdmVXYWxsZXQuYWRkcmVzcyk7XHJcblxyXG4gICAgICAvLyBMb2cgc3VjY2Vzc2Z1bCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgICB0eXBlOiAndHJhbnNhY3Rpb24nLFxyXG4gICAgICAgIGFkZHJlc3M6IGFjdGl2ZVdhbGxldC5hZGRyZXNzLFxyXG4gICAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICAgIG1ldGhvZDogJ2V0aF9zZW5kVHJhbnNhY3Rpb24nLFxyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgdHhIYXNoOiB0eEhhc2gsXHJcbiAgICAgICAgd2FsbGV0VHlwZTogJ2hhcmR3YXJlJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFJlc29sdmUgd2l0aCB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgICAgIHJlc29sdmUoeyByZXN1bHQ6IHR4SGFzaCB9KTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU29mdHdhcmUgd2FsbGV0IGZsb3cgLSB2YWxpZGF0ZSBzZXNzaW9uIGFuZCBnZXQgcGFzc3dvcmQgKG5vdyBhc3luYylcclxuICAgIGxldCBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG4gICAgbGV0IHNpZ25lciA9IG51bGw7XHJcbiAgICBsZXQgY29ubmVjdGVkU2lnbmVyID0gbnVsbDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgLy8gVW5sb2NrIHdhbGxldCB3aXRoIGF1dG8tdXBncmFkZSBub3RpZmljYXRpb25cclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICAvLyBOb3RpZnkgdXNlciB0aGF0IHdhbGxldCBlbmNyeXB0aW9uIGlzIGJlaW5nIHVwZ3JhZGVkXHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0IGVuY3J5cHRpb246ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYCk7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAn8J+UkCBTZWN1cml0eSBVcGdyYWRlIGluIFByb2dyZXNzJyxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBVcGdyYWRpbmcgd2FsbGV0IGVuY3J5cHRpb24gdG8gJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zIGZvciBlbmhhbmNlZCBzZWN1cml0eS4uLmAsXHJcbiAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG4gICAgY29uc3QgeyB1cGdyYWRlZCwgaXRlcmF0aW9uc0JlZm9yZSwgaXRlcmF0aW9uc0FmdGVyIH0gPSB1bmxvY2tSZXN1bHQ7XHJcblxyXG4gICAgLy8gU2hvdyBjb21wbGV0aW9uIG5vdGlmaWNhdGlvbiBpZiB1cGdyYWRlIG9jY3VycmVkXHJcbiAgICBpZiAodXBncmFkZWQpIHtcclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAn4pyFIFNlY3VyaXR5IFVwZ3JhZGUgQ29tcGxldGUnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBXYWxsZXQgZW5jcnlwdGlvbiB1cGdyYWRlZDogJHtpdGVyYXRpb25zQmVmb3JlLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2l0ZXJhdGlvbnNBZnRlci50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgY3VycmVudCBuZXR3b3JrXHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG5cclxuICAgIC8vIENvbm5lY3Qgc2lnbmVyIHRvIHByb3ZpZGVyXHJcbiAgICBjb25uZWN0ZWRTaWduZXIgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gUHJlcGFyZSB0cmFuc2FjdGlvbiAtIGNyZWF0ZSBhIGNsZWFuIGNvcHkgd2l0aCBvbmx5IG5lY2Vzc2FyeSBmaWVsZHNcclxuICAgIGNvbnN0IHR4VG9TZW5kID0ge1xyXG4gICAgICB0bzogdHhSZXF1ZXN0LnRvLFxyXG4gICAgICB2YWx1ZTogdHhSZXF1ZXN0LnZhbHVlIHx8ICcweDAnLFxyXG4gICAgICBkYXRhOiB0eFJlcXVlc3QuZGF0YSB8fCAnMHgnXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE5vbmNlIGhhbmRsaW5nIHByaW9yaXR5OlxyXG4gICAgLy8gMS4gVXNlci1wcm92aWRlZCBjdXN0b20gbm9uY2UgKGZvciByZXBsYWNpbmcgc3R1Y2sgdHJhbnNhY3Rpb25zKVxyXG4gICAgLy8gMi4gREFwcC1wcm92aWRlZCBub25jZSAodmFsaWRhdGVkKVxyXG4gICAgLy8gMy4gQXV0by1mZXRjaCBieSBldGhlcnMuanNcclxuICAgIGlmIChjdXN0b21Ob25jZSAhPT0gdW5kZWZpbmVkICYmIGN1c3RvbU5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIFVzZXIgbWFudWFsbHkgc2V0IG5vbmNlIChlLmcuLCB0byByZXBsYWNlIHN0dWNrIHRyYW5zYWN0aW9uKVxyXG4gICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHNpZ25lci5hZGRyZXNzLCAncGVuZGluZycpO1xyXG5cclxuICAgICAgaWYgKGN1c3RvbU5vbmNlIDwgY3VycmVudE5vbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDdXN0b20gbm9uY2UgJHtjdXN0b21Ob25jZX0gaXMgbGVzcyB0aGFuIGN1cnJlbnQgbm9uY2UgJHtjdXJyZW50Tm9uY2V9LiBUaGlzIG1heSBmYWlsIHVubGVzcyB5b3UncmUgcmVwbGFjaW5nIGEgcGVuZGluZyB0cmFuc2FjdGlvbi5gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHhUb1NlbmQubm9uY2UgPSBjdXN0b21Ob25jZTtcclxuICAgICAgLy8gVXNpbmcgY3VzdG9tIG5vbmNlXHJcbiAgICB9IGVsc2UgaWYgKHR4UmVxdWVzdC5ub25jZSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5ub25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBTRUNVUklUWTogVmFsaWRhdGUgbm9uY2UgaWYgcHJvdmlkZWQgYnkgREFwcFxyXG4gICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHNpZ25lci5hZGRyZXNzLCAncGVuZGluZycpO1xyXG4gICAgICBjb25zdCBwcm92aWRlZE5vbmNlID0gdHlwZW9mIHR4UmVxdWVzdC5ub25jZSA9PT0gJ3N0cmluZydcclxuICAgICAgICA/IHBhcnNlSW50KHR4UmVxdWVzdC5ub25jZSwgMTYpXHJcbiAgICAgICAgOiB0eFJlcXVlc3Qubm9uY2U7XHJcblxyXG4gICAgICAvLyBOb25jZSBtdXN0IGJlID49IGN1cnJlbnQgcGVuZGluZyBub25jZVxyXG4gICAgICBpZiAocHJvdmlkZWROb25jZSA8IGN1cnJlbnROb25jZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBub25jZTogJHtwcm92aWRlZE5vbmNlfSBpcyBsZXNzIHRoYW4gY3VycmVudCBub25jZSAke2N1cnJlbnROb25jZX1gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHhUb1NlbmQubm9uY2UgPSBwcm92aWRlZE5vbmNlO1xyXG4gICAgICAvLyBVc2luZyBEQXBwLXByb3ZpZGVkIG5vbmNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBJZiBubyBub25jZSBwcm92aWRlZCwgZXRoZXJzLmpzIHdpbGwgZmV0Y2ggdGhlIGNvcnJlY3Qgb25lIGF1dG9tYXRpY2FsbHlcclxuICAgICAgLy8gQXV0by1mZXRjaGluZyBub25jZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIERBcHAgcHJvdmlkZWQgYSBnYXMgbGltaXQsIHVzZSBpdC4gT3RoZXJ3aXNlIGxldCBldGhlcnMgZXN0aW1hdGUuXHJcbiAgICBpZiAodHhSZXF1ZXN0LmdhcyB8fCB0eFJlcXVlc3QuZ2FzTGltaXQpIHtcclxuICAgICAgdHhUb1NlbmQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzIHx8IHR4UmVxdWVzdC5nYXNMaW1pdDtcclxuICAgICAgLy8gVXNpbmcgcHJvdmlkZWQgZ2FzIGxpbWl0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXBwbHkgdXNlci1zZWxlY3RlZCBnYXMgcHJpY2UgaWYgcHJvdmlkZWQsIG9yIHVzZSBzYWZlIG5ldHdvcmsgZ2FzIHByaWNlXHJcbiAgICBpZiAoZ2FzUHJpY2UpIHtcclxuICAgICAgLy8gVXNlIHVzZXItc2VsZWN0ZWQgZ2FzIHByaWNlIGZyb20gVUlcclxuICAgICAgdHhUb1NlbmQuZ2FzUHJpY2UgPSBnYXNQcmljZTtcclxuICAgICAgLy8gVXNpbmcgY3VzdG9tIGdhcyBwcmljZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gRmFsbGJhY2s6IEZldGNoIHNhZmUgZ2FzIHByaWNlIChiYXNlIGZlZSAqIDIpIHRvIHByZXZlbnQgc3R1Y2sgdHJhbnNhY3Rpb25zXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgc2FmZUdhc1ByaWNlSGV4ID0gYXdhaXQgcnBjLmdldFNhZmVHYXNQcmljZShuZXR3b3JrKTtcclxuICAgICAgICB0eFRvU2VuZC5nYXNQcmljZSA9IEJpZ0ludChzYWZlR2FzUHJpY2VIZXgpO1xyXG4gICAgICAgIC8vIFVzaW5nIHNhZmUgZ2FzIHByaWNlIGZyb20gYmFzZSBmZWVcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIGdldHRpbmcgc2FmZSBnYXMgcHJpY2UsIHVzaW5nIHByb3ZpZGVyIGZhbGxiYWNrOicsIGVycm9yKTtcclxuICAgICAgICAvLyBMYXN0IHJlc29ydCBmYWxsYmFjayB0byBwcm92aWRlclxyXG4gICAgICAgIGNvbnN0IG5ldHdvcmtHYXNQcmljZSA9IGF3YWl0IHByb3ZpZGVyLmdldEZlZURhdGEoKTtcclxuICAgICAgICBpZiAobmV0d29ya0dhc1ByaWNlLmdhc1ByaWNlKSB7XHJcbiAgICAgICAgICB0eFRvU2VuZC5nYXNQcmljZSA9IG5ldHdvcmtHYXNQcmljZS5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTZW5kIHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IGNvbm5lY3RlZFNpZ25lci5zZW5kVHJhbnNhY3Rpb24odHhUb1NlbmQpO1xyXG5cclxuICAgIC8vIFRyYW5zYWN0aW9uIHNlbnRcclxuXHJcbiAgICAvLyBTYXZlIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnkgKG5ldHdvcmsgdmFyaWFibGUgYWxyZWFkeSBkZWZpbmVkIGFib3ZlKVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KHNpZ25lci5hZGRyZXNzLCB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogc2lnbmVyLmFkZHJlc3MsXHJcbiAgICAgIHRvOiB0eFJlcXVlc3QudG8gfHwgbnVsbCxcclxuICAgICAgdmFsdWU6IHR4UmVxdWVzdC52YWx1ZSB8fCAnMCcsXHJcbiAgICAgIGRhdGE6IHR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IHR4Lmdhc1ByaWNlID8gdHguZ2FzUHJpY2UudG9TdHJpbmcoKSA6ICcwJyxcclxuICAgICAgZ2FzTGltaXQ6IHR4Lmdhc0xpbWl0ID8gdHguZ2FzTGltaXQudG9TdHJpbmcoKSA6IG51bGwsXHJcbiAgICAgIG5vbmNlOiB0eC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiB0eEhpc3RvcnkuVFhfVFlQRVMuQ09OVFJBQ1RcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNlbnQnLFxyXG4gICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gc2VudDogJHt0eC5oYXNoLnNsaWNlKDAsIDIwKX0uLi5gLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uIGluIGJhY2tncm91bmRcclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBzaWduZXIuYWRkcmVzcyk7XHJcblxyXG4gICAgLy8gTG9nIHN1Y2Nlc3NmdWwgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiAndHJhbnNhY3Rpb24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduZXIuYWRkcmVzcyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogJ2V0aF9zZW5kVHJhbnNhY3Rpb24nLFxyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICB0eEhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFJlc29sdmUgd2l0aCB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiB0eC5oYXNoIH0pO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCB9O1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICAgIC8vIE92ZXJ3cml0ZSBwYXNzd29yZCB3aXRoIGdhcmJhZ2UgYmVmb3JlIGRlcmVmZXJlbmNpbmdcclxuICAgICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgICAgcGFzc3dvcmQgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDbGVhbiB1cCBzaWduZXIncyBwcml2YXRlIGtleVxyXG4gICAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICAgIHNpZ25lciA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGNvbm5lY3RlZFNpZ25lcikge1xyXG4gICAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoY29ubmVjdGVkU2lnbmVyKTtcclxuICAgICAgICBjb25uZWN0ZWRTaWduZXIgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVHJhbnNhY3Rpb24gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgY29uc3Qgc2FuaXRpemVkRXJyb3IgPSBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKTtcclxuXHJcbiAgICAvLyBMb2cgZmFpbGVkIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogJ3RyYW5zYWN0aW9uJyxcclxuICAgICAgYWRkcmVzczogJ3Vua25vd24nLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiAnZXRoX3NlbmRUcmFuc2FjdGlvbicsXHJcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICBlcnJvcjogc2FuaXRpemVkRXJyb3IsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIHJlamVjdChuZXcgRXJyb3Ioc2FuaXRpemVkRXJyb3IpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVkRXJyb3IgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCB0cmFuc2FjdGlvbiByZXF1ZXN0IGRldGFpbHMgZm9yIHBvcHVwXHJcbmZ1bmN0aW9uIGdldFRyYW5zYWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4sIHR4UmVxdWVzdCB9ID0gcGVuZGluZ1RyYW5zYWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiwgdHhSZXF1ZXN0IH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3dhdGNoQXNzZXQgLSBBZGQgY3VzdG9tIHRva2VuIChFSVAtNzQ3KVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVXYXRjaEFzc2V0KHBhcmFtcywgb3JpZ2luLCB0YWIpIHtcclxuICAvLyBSZWNlaXZlZCB3YWxsZXRfd2F0Y2hBc3NldCByZXF1ZXN0XHJcblxyXG4gIC8vIFZhbGlkYXRlIHBhcmFtcyBzdHJ1Y3R1cmVcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zLnR5cGUgfHwgIXBhcmFtcy5vcHRpb25zKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHBhcmFtczogbXVzdCBpbmNsdWRlIHR5cGUgYW5kIG9wdGlvbnMnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgdHlwZSwgb3B0aW9ucyB9ID0gcGFyYW1zO1xyXG5cclxuICAvLyBPbmx5IHN1cHBvcnQgRVJDMjAvUFJDMjAgdG9rZW5zXHJcbiAgaWYgKHR5cGUudG9VcHBlckNhc2UoKSAhPT0gJ0VSQzIwJykge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnT25seSBFUkMyMC9QUkMyMCB0b2tlbnMgYXJlIHN1cHBvcnRlZCcgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgdG9rZW4gZmllbGRzXHJcbiAgaWYgKCFvcHRpb25zLmFkZHJlc3MgfHwgIW9wdGlvbnMuc3ltYm9sKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdUb2tlbiBtdXN0IGhhdmUgYWRkcmVzcyBhbmQgc3ltYm9sJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB0b2tlbkluZm8gPSB7XHJcbiAgICBhZGRyZXNzOiBvcHRpb25zLmFkZHJlc3MudG9Mb3dlckNhc2UoKSxcclxuICAgIHN5bWJvbDogb3B0aW9ucy5zeW1ib2wsXHJcbiAgICBkZWNpbWFsczogb3B0aW9ucy5kZWNpbWFscyB8fCAxOCxcclxuICAgIGltYWdlOiBvcHRpb25zLmltYWdlIHx8IG51bGxcclxuICB9O1xyXG5cclxuICAvLyBSZXF1ZXN0aW5nIHRvIGFkZCB0b2tlblxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpICsgJ190b2tlbic7XHJcbiAgICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0b2tlbkluZm8gfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1hZGRUb2tlbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNTAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdUb2tlblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1Rva2VuIGFkZCByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB0b2tlbiBhZGQgYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQpIHtcclxuICBpZiAoIXBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIHRva2VuSW5mbyB9ID0gcGVuZGluZ1Rva2VuUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdG9rZW4nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFRva2VuIGFwcHJvdmVkIC0gcmV0dXJuIHRydWUgKHdhbGxldF93YXRjaEFzc2V0IHJldHVybnMgYm9vbGVhbilcclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHRydWUgfSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0b2tlbkluZm8gfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBUb2tlbiBhZGQgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCB0b2tlbiBhZGQgcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRUb2tlbkFkZFJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdG9rZW5JbmZvIH0gPSBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiwgdG9rZW5JbmZvIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBTcGVlZCB1cCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gYnkgcmVwbGFjaW5nIGl0IHdpdGggaGlnaGVyIGdhcyBwcmljZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24oYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHNlc3Npb25Ub2tlbiwgZ2FzUHJpY2VNdWx0aXBsaWVyID0gMS4yLCBjdXN0b21HYXNQcmljZSA9IG51bGwpIHtcclxuICBsZXQgcGFzc3dvcmQgPSBudWxsO1xyXG4gIGxldCBzaWduZXIgPSBudWxsO1xyXG4gIGxldCB3YWxsZXQgPSBudWxsO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVmFsaWRhdGUgc2Vzc2lvbiAobm93IGFzeW5jKVxyXG4gICAgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBHZXQgb3JpZ2luYWwgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUeCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICBpZiAoIW9yaWdpbmFsVHgpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gbm90IGZvdW5kJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcmlnaW5hbFR4LnN0YXR1cyAhPT0gdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGlzIG5vdCBwZW5kaW5nJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCB3YWxsZXQgYW5kIHVubG9jayAoYXV0by11cGdyYWRlIGlmIG5lZWRlZClcclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcblxyXG4gICAgLy8gU0VDVVJJVFk6IFZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYmVsb25ncyB0byB0aGlzIHdhbGxldFxyXG4gICAgY29uc3Qgd2FsbGV0QWRkcmVzcyA9IGF3YWl0IHNpZ25lci5nZXRBZGRyZXNzKCk7XHJcbiAgICBpZiAod2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBBZGRyZXNzIG1pc21hdGNoIGluIHNwZWVkLXVwOiB3YWxsZXQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCByZXF1ZXN0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1dhbGxldCBhZGRyZXNzIG1pc21hdGNoJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFZlcmlmeSBvcmlnaW5hbCB0cmFuc2FjdGlvbiBpcyBmcm9tIHRoaXMgd2FsbGV0XHJcbiAgICBpZiAob3JpZ2luYWxUeC5mcm9tICYmIG9yaWdpbmFsVHguZnJvbS50b0xvd2VyQ2FzZSgpICE9PSB3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBUcmFuc2FjdGlvbiBvd25lcnNoaXAgY2hlY2sgZmFpbGVkOiB0cmFuc2FjdGlvbiBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyB3YWxsZXQnKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgbmV3IGdhcyBwcmljZVxyXG4gICAgbGV0IG5ld0dhc1ByaWNlO1xyXG4gICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgIC8vIFVzZSBjdXN0b20gZ2FzIHByaWNlIHByb3ZpZGVkIGJ5IHVzZXJcclxuICAgICAgbmV3R2FzUHJpY2UgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gQ2FsY3VsYXRlIGZyb20gbXVsdGlwbGllciAoMS4yeCBvZiBvcmlnaW5hbCBieSBkZWZhdWx0KVxyXG4gICAgICBjb25zdCBvcmlnaW5hbEdhc1ByaWNlID0gQmlnSW50KG9yaWdpbmFsVHguZ2FzUHJpY2UpO1xyXG4gICAgICBuZXdHYXNQcmljZSA9IChvcmlnaW5hbEdhc1ByaWNlICogQmlnSW50KE1hdGguZmxvb3IoZ2FzUHJpY2VNdWx0aXBsaWVyICogMTAwKSkpIC8gQmlnSW50KDEwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHdpdGggc2FtZSBub25jZSwgZGF0YSwgYW5kIGdhc0xpbWl0XHJcbiAgICBjb25zdCByZXBsYWNlbWVudFR4ID0ge1xyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIGRhdGE6IG9yaWdpbmFsVHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEluY2x1ZGUgZ2FzTGltaXQgaWYgaXQgd2FzIGluIHRoZSBvcmlnaW5hbCB0cmFuc2FjdGlvblxyXG4gICAgaWYgKG9yaWdpbmFsVHguZ2FzTGltaXQpIHtcclxuICAgICAgcmVwbGFjZW1lbnRUeC5nYXNMaW1pdCA9IG9yaWdpbmFsVHguZ2FzTGltaXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3BlZWRpbmcgdXAgdHJhbnNhY3Rpb25cclxuXHJcbiAgICAvLyBTZW5kIHJlcGxhY2VtZW50IHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHdhbGxldC5zZW5kVHJhbnNhY3Rpb24ocmVwbGFjZW1lbnRUeCk7XHJcblxyXG4gICAgLy8gU2F2ZSBuZXcgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIGRhdGE6IG9yaWdpbmFsVHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogbmV3R2FzUHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgZ2FzTGltaXQ6IG9yaWdpbmFsVHguZ2FzTGltaXQsXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6IG9yaWdpbmFsVHgudHlwZVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyByZXBsYWNlZC9mYWlsZWRcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTcGVkIFVwJyxcclxuICAgICAgbWVzc2FnZTogYFJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHNlbnQgd2l0aCAke01hdGguZmxvb3IoZ2FzUHJpY2VNdWx0aXBsaWVyICogMTAwKX0lIGdhcyBwcmljZWAsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb25cclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2gsIG5ld0dhc1ByaWNlOiBuZXdHYXNQcmljZS50b1N0cmluZygpIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBTRUNVUklUWTogQ2xlYW4gdXAgc2Vuc2l0aXZlIGRhdGEgZnJvbSBtZW1vcnlcclxuICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICBjb25zdCB0ZW1wT2JqID0geyBwYXNzd29yZCB9O1xyXG4gICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChzaWduZXIpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHdhbGxldCkge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHdhbGxldCk7XHJcbiAgICAgIHdhbGxldCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBDYW5jZWwgYSBwZW5kaW5nIHRyYW5zYWN0aW9uIGJ5IHJlcGxhY2luZyBpdCB3aXRoIGEgemVyby12YWx1ZSB0eCB0byBzZWxmXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbmNlbFRyYW5zYWN0aW9uKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCBzZXNzaW9uVG9rZW4sIGN1c3RvbUdhc1ByaWNlID0gbnVsbCkge1xyXG4gIGxldCBwYXNzd29yZCA9IG51bGw7XHJcbiAgbGV0IHNpZ25lciA9IG51bGw7XHJcbiAgbGV0IHdhbGxldCA9IG51bGw7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIChub3cgYXN5bmMpXHJcbiAgICBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG5cclxuICAgIC8vIEdldCBvcmlnaW5hbCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICBjb25zdCBvcmlnaW5hbFR4ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4QnlIYXNoKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoKTtcclxuICAgIGlmICghb3JpZ2luYWxUeCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBub3QgZm91bmQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9yaWdpbmFsVHguc3RhdHVzICE9PSB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gaXMgbm90IHBlbmRpbmcnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHdhbGxldCBhbmQgdW5sb2NrIChhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkKVxyXG4gICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2lnbmVyID0gdW5sb2NrUmVzdWx0LnNpZ25lcjtcclxuXHJcbiAgICAvLyBTRUNVUklUWTogVmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBiZWxvbmdzIHRvIHRoaXMgd2FsbGV0XHJcbiAgICBjb25zdCB3YWxsZXRBZGRyZXNzID0gYXdhaXQgc2lnbmVyLmdldEFkZHJlc3MoKTtcclxuICAgIGlmICh3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEFkZHJlc3MgbWlzbWF0Y2ggaW4gY2FuY2VsOiB3YWxsZXQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCByZXF1ZXN0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1dhbGxldCBhZGRyZXNzIG1pc21hdGNoJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFZlcmlmeSBvcmlnaW5hbCB0cmFuc2FjdGlvbiBpcyBmcm9tIHRoaXMgd2FsbGV0XHJcbiAgICBpZiAob3JpZ2luYWxUeC5mcm9tICYmIG9yaWdpbmFsVHguZnJvbS50b0xvd2VyQ2FzZSgpICE9PSB3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBUcmFuc2FjdGlvbiBvd25lcnNoaXAgY2hlY2sgZmFpbGVkOiB0cmFuc2FjdGlvbiBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyB3YWxsZXQnKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgbmV3IGdhcyBwcmljZVxyXG4gICAgbGV0IG5ld0dhc1ByaWNlO1xyXG4gICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgIC8vIFVzZSBjdXN0b20gZ2FzIHByaWNlIHByb3ZpZGVkIGJ5IHVzZXJcclxuICAgICAgbmV3R2FzUHJpY2UgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gQ2FsY3VsYXRlIGZyb20gb3JpZ2luYWwgKDEuMnggb2Ygb3JpZ2luYWwgdG8gZW5zdXJlIGl0IGdldHMgbWluZWQgZmlyc3QpXHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsR2FzUHJpY2UgPSBCaWdJbnQob3JpZ2luYWxUeC5nYXNQcmljZSk7XHJcbiAgICAgIG5ld0dhc1ByaWNlID0gKG9yaWdpbmFsR2FzUHJpY2UgKiBCaWdJbnQoMTIwKSkgLyBCaWdJbnQoMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIChzZW5kIDAgdG8gc2VsZiB3aXRoIHNhbWUgbm9uY2UpXHJcbiAgICBjb25zdCBjYW5jZWxUeCA9IHtcclxuICAgICAgdG86IGFkZHJlc3MsICAvLyBTZW5kIHRvIHNlbGZcclxuICAgICAgdmFsdWU6ICcwJywgICAvLyBaZXJvIHZhbHVlXHJcbiAgICAgIGRhdGE6ICcweCcsICAgLy8gRW1wdHkgZGF0YVxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlLFxyXG4gICAgICBnYXNMaW1pdDogMjEwMDAgIC8vIFN0YW5kYXJkIGdhcyBsaW1pdCBmb3Igc2ltcGxlIEVUSCB0cmFuc2ZlclxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDYW5jZWxsaW5nIHRyYW5zYWN0aW9uXHJcblxyXG4gICAgLy8gU2VuZCBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgd2FsbGV0LnNlbmRUcmFuc2FjdGlvbihjYW5jZWxUeCk7XHJcblxyXG4gICAgLy8gU2F2ZSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogYWRkcmVzcyxcclxuICAgICAgdmFsdWU6ICcwJyxcclxuICAgICAgZGF0YTogJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgIGdhc0xpbWl0OiAnMjEwMDAnLFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiAnc2VuZCdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgZmFpbGVkXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAvLyBTZW5kIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ2FuY2VsbGVkJyxcclxuICAgICAgbWVzc2FnZTogJ0NhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiBzZW50JyxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvblxyXG4gICAgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGNhbmNlbGxpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBTRUNVUklUWTogQ2xlYW4gdXAgc2Vuc2l0aXZlIGRhdGEgZnJvbSBtZW1vcnlcclxuICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICBjb25zdCB0ZW1wT2JqID0geyBwYXNzd29yZCB9O1xyXG4gICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChzaWduZXIpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHdhbGxldCkge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHdhbGxldCk7XHJcbiAgICAgIHdhbGxldCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGdhcyBwcmljZSAoZm9yIHNwZWVkLXVwIFVJKVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50TmV0d29ya0dhc1ByaWNlKG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgLy8gVXNlIHNhZmUgZ2FzIHByaWNlIHRvIHByZXZlbnQgc3R1Y2sgdHJhbnNhY3Rpb25zXHJcbiAgICBjb25zdCBzYWZlR2FzUHJpY2VIZXggPSBhd2FpdCBycGMuZ2V0U2FmZUdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgY29uc3Qgc2FmZUdhc1ByaWNlID0gQmlnSW50KHNhZmVHYXNQcmljZUhleCk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgZ2FzUHJpY2U6IHNhZmVHYXNQcmljZS50b1N0cmluZygpLFxyXG4gICAgICBnYXNQcmljZUd3ZWk6IChOdW1iZXIoc2FmZUdhc1ByaWNlKSAvIDFlOSkudG9GaXhlZCgyKVxyXG4gICAgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBmZXRjaGluZyBjdXJyZW50IGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBSZWZyZXNoIHRyYW5zYWN0aW9uIHN0YXR1cyBmcm9tIGJsb2NrY2hhaW5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFRyYW5zYWN0aW9uU3RhdHVzKGFkZHJlc3MsIHR4SGFzaCwgbmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBHZXQgdHJhbnNhY3Rpb24gcmVjZWlwdCBmcm9tIGJsb2NrY2hhaW5cclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvblJlY2VpcHQodHhIYXNoKTtcclxuXHJcbiAgICBpZiAoIXJlY2VpcHQpIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gc3RpbGwgcGVuZGluZyAobm90IG1pbmVkIHlldClcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiBpcyBzdGlsbCBwZW5kaW5nIG9uIHRoZSBibG9ja2NoYWluJ1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRyYW5zYWN0aW9uIGhhcyBiZWVuIG1pbmVkXHJcbiAgICBsZXQgbmV3U3RhdHVzO1xyXG4gICAgaWYgKHJlY2VpcHQuc3RhdHVzID09PSAxKSB7XHJcbiAgICAgIG5ld1N0YXR1cyA9IHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVEO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmV3U3RhdHVzID0gdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIGxvY2FsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgYWRkcmVzcyxcclxuICAgICAgdHhIYXNoLFxyXG4gICAgICBuZXdTdGF0dXMsXHJcbiAgICAgIHJlY2VpcHQuYmxvY2tOdW1iZXJcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgc3RhdHVzOiBuZXdTdGF0dXMsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiByZWNlaXB0LmJsb2NrTnVtYmVyLFxyXG4gICAgICBtZXNzYWdlOiBuZXdTdGF0dXMgPT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVEXHJcbiAgICAgICAgPyAnVHJhbnNhY3Rpb24gY29uZmlybWVkIG9uIGJsb2NrY2hhaW4nXHJcbiAgICAgICAgOiAnVHJhbnNhY3Rpb24gZmFpbGVkIG9uIGJsb2NrY2hhaW4nXHJcbiAgICB9O1xyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciByZWZyZXNoaW5nIHRyYW5zYWN0aW9uIHN0YXR1czonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBXYWl0IGZvciB0cmFuc2FjdGlvbiBjb25maXJtYXRpb25cclxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpIHtcclxuICB0cnkge1xyXG4gICAgLy8gV2FpdGluZyBmb3IgY29uZmlybWF0aW9uXHJcblxyXG4gICAgLy8gV2FpdCBmb3IgMSBjb25maXJtYXRpb25cclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci53YWl0Rm9yVHJhbnNhY3Rpb24odHguaGFzaCwgMSk7XHJcblxyXG4gICAgaWYgKHJlY2VpcHQgJiYgcmVjZWlwdC5zdGF0dXMgPT09IDEpIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gY29uZmlybWVkXHJcblxyXG4gICAgICAvLyBVcGRhdGUgdHJhbnNhY3Rpb24gc3RhdHVzIGluIGhpc3RvcnlcclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgdHguaGFzaCxcclxuICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRCxcclxuICAgICAgICByZWNlaXB0LmJsb2NrTnVtYmVyXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBTZW5kIHN1Y2Nlc3Mgbm90aWZpY2F0aW9uXHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENvbmZpcm1lZCcsXHJcbiAgICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBvbi1jaGFpbiFgLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gZmFpbGVkXHJcblxyXG4gICAgICAvLyBVcGRhdGUgdHJhbnNhY3Rpb24gc3RhdHVzIGluIGhpc3RvcnlcclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgdHguaGFzaCxcclxuICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCxcclxuICAgICAgICByZWNlaXB0ID8gcmVjZWlwdC5ibG9ja051bWJlciA6IG51bGxcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFNlbmQgZmFpbHVyZSBub3RpZmljYXRpb25cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gRmFpbGVkJyxcclxuICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gd2FzIHJldmVydGVkIG9yIGZhaWxlZCcsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igd2FpdGluZyBmb3IgY29uZmlybWF0aW9uOicsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IE1FU1NBR0UgU0lHTklORyBIQU5ETEVSUyA9PT09PVxyXG5cclxuLy8gSGFuZGxlIHBlcnNvbmFsX3NpZ24gKEVJUC0xOTEpIC0gU2lnbiBhIG1lc3NhZ2VcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUGVyc29uYWxTaWduKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpIHtcclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBzaWduIHJlcXVlc3RcclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVTaWduUmVxdWVzdChtZXRob2QsIHBhcmFtcyk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCBzaWduIHJlcXVlc3QgZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogLTMyNjAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3IpXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IG1lc3NhZ2UsIGFkZHJlc3MgfSA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBTRUNVUklUWTogQ2hlY2sgaWYgZXRoX3NpZ24gaXMgYWxsb3dlZCAoZGlzYWJsZWQgYnkgZGVmYXVsdClcclxuICBpZiAobWV0aG9kID09PSAnZXRoX3NpZ24nKSB7XHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoJ3NldHRpbmdzJyk7XHJcbiAgICBjb25zdCBhbGxvd0V0aFNpZ24gPSBzZXR0aW5ncz8uYWxsb3dFdGhTaWduIHx8IGZhbHNlO1xyXG5cclxuICAgIGlmICghYWxsb3dFdGhTaWduKSB7XHJcbiAgICAgIGNvbnNvbGUud2Fybign8J+rgCBldGhfc2lnbiByZXF1ZXN0IGJsb2NrZWQgKGRpc2FibGVkIGluIHNldHRpbmdzKTonLCBvcmlnaW4pO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ2V0aF9zaWduIGlzIGRpc2FibGVkIGZvciBzZWN1cml0eS4gVXNlIHBlcnNvbmFsX3NpZ24gaW5zdGVhZCwgb3IgZW5hYmxlIGV0aF9zaWduIGluIHdhbGxldCBzZXR0aW5ncy4nXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvZyB3YXJuaW5nIHdoZW4gZXRoX3NpZ24gaXMgdXNlZCAoZXZlbiB3aGVuIGVuYWJsZWQpXHJcbiAgICBjb25zb2xlLndhcm4oJ+KaoO+4jyBldGhfc2lnbiByZXF1ZXN0IGFwcHJvdmVkIGJ5IHNldHRpbmdzIGZyb206Jywgb3JpZ2luKTtcclxuICB9XHJcblxyXG4gIC8vIFZlcmlmeSB0aGUgYWRkcmVzcyBtYXRjaGVzIHRoZSBjb25uZWN0ZWQgYWNjb3VudFxyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICghd2FsbGV0IHx8IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0ZWQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCBjb25uZWN0ZWQgYWNjb3VudCdcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCkgKyAnX3NpZ24nO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBtZXRob2QsXHJcbiAgICAgIHNpZ25SZXF1ZXN0OiB7IG1lc3NhZ2UsIGFkZHJlc3MgfSxcclxuICAgICAgYXBwcm92YWxUb2tlblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1zaWduJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH0mbWV0aG9kPSR7bWV0aG9kfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignU2lnbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2lnblR5cGVkRGF0YSAoRUlQLTcxMikgLSBTaWduIHR5cGVkIGRhdGFcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnblR5cGVkRGF0YShwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKSB7XHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgc2lnbiByZXF1ZXN0XHJcbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlU2lnblJlcXVlc3QobWV0aG9kLCBwYXJhbXMpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgc2lnbiB0eXBlZCBkYXRhIHJlcXVlc3QgZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogLTMyNjAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3IpXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IGFkZHJlc3MsIHR5cGVkRGF0YSB9ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIFZlcmlmeSB0aGUgYWRkcmVzcyBtYXRjaGVzIHRoZSBjb25uZWN0ZWQgYWNjb3VudFxyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICghd2FsbGV0IHx8IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0ZWQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCBjb25uZWN0ZWQgYWNjb3VudCdcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCkgKyAnX3NpZ25UeXBlZCc7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHtcclxuICAgICAgcmVzb2x2ZSxcclxuICAgICAgcmVqZWN0LFxyXG4gICAgICBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZCxcclxuICAgICAgc2lnblJlcXVlc3Q6IHsgdHlwZWREYXRhLCBhZGRyZXNzIH0sXHJcbiAgICAgIGFwcHJvdmFsVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249c2lnblR5cGVkJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH0mbWV0aG9kPSR7bWV0aG9kfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDY1MFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignU2lnbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBtZXNzYWdlIHNpZ25pbmcgYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTaWduQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2Vzc2lvblRva2VuKSB7XHJcbiAgaWYgKCFwZW5kaW5nU2lnblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgbWV0aG9kLCBzaWduUmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1NpZ25SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gdG8gcHJldmVudCByZXBsYXkgYXR0YWNrc1xyXG4gIGlmICghdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pKSB7XHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgbGV0IHBhc3N3b3JkID0gbnVsbDtcclxuICBsZXQgc2lnbmVyID0gbnVsbDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gYW5kIGdldCBwYXNzd29yZFxyXG4gICAgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IChhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkKVxyXG4gICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2lnbmVyID0gdW5sb2NrUmVzdWx0LnNpZ25lcjtcclxuXHJcbiAgICBsZXQgc2lnbmF0dXJlO1xyXG5cclxuICAgIC8vIFNpZ24gYmFzZWQgb24gbWV0aG9kXHJcbiAgICBpZiAobWV0aG9kID09PSAncGVyc29uYWxfc2lnbicgfHwgbWV0aG9kID09PSAnZXRoX3NpZ24nKSB7XHJcbiAgICAgIHNpZ25hdHVyZSA9IGF3YWl0IHBlcnNvbmFsU2lnbihzaWduZXIsIHNpZ25SZXF1ZXN0Lm1lc3NhZ2UpO1xyXG4gICAgfSBlbHNlIGlmIChtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSkge1xyXG4gICAgICBzaWduYXR1cmUgPSBhd2FpdCBzaWduVHlwZWREYXRhKHNpZ25lciwgc2lnblJlcXVlc3QudHlwZWREYXRhKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgc2lnbmluZyBtZXRob2Q6ICR7bWV0aG9kfWApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvZyBzdWNjZXNzZnVsIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBjb25zdCBzaWduZXJBZGRyZXNzID0gYXdhaXQgc2lnbmVyLmdldEFkZHJlc3MoKTtcclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnbmVyQWRkcmVzcyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTaWduYXR1cmUgZ2VuZXJhdGVkIHN1Y2Nlc3NmdWxseVxyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgTWVzc2FnZSBzaWduZWQgZm9yIG9yaWdpbjonLCBvcmlnaW4pO1xyXG5cclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHNpZ25hdHVyZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHNpZ25hdHVyZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHNpZ25pbmcgbWVzc2FnZTonLCBlcnJvcik7XHJcblxyXG4gICAgLy8gTG9nIGZhaWxlZCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpID8gJ3R5cGVkX2RhdGEnIDogJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduUmVxdWVzdC5hZGRyZXNzIHx8ICd1bmtub3duJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIHJlamVjdChlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICBwYXNzd29yZCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgc2lnbmVyID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgTGVkZ2VyIHNpZ25hdHVyZSBhcHByb3ZhbCAocHJlLXNpZ25lZCBpbiBwb3B1cClcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxlZGdlclNpZ25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkLCBzaWduYXR1cmUpIHtcclxuICBpZiAoIXBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nU2lnblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG5cclxuICAvLyBWYWxpZGF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlblxyXG4gIGlmICghdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pKSB7XHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFwcHJvdmFsIHRva2VuJyB9O1xyXG4gIH1cclxuXHJcbiAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCB0aGUgcmVxdWVzdCcpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gTG9nIHN1Y2Nlc3NmdWwgTGVkZ2VyIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogbWV0aG9kICYmIG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpID8gJ3R5cGVkX2RhdGEnIDogJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduUmVxdWVzdD8uYWRkcmVzcyB8fCAnbGVkZ2VyJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kIHx8ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ2hhcmR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2lnbmF0dXJlIGFscmVhZHkgY3JlYXRlZCBieSBMZWRnZXIgaW4gcG9wdXAgLSBqdXN0IHBhc3MgaXQgdGhyb3VnaFxyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgTGVkZ2VyIG1lc3NhZ2Ugc2lnbmVkIGZvciBvcmlnaW46Jywgb3JpZ2luKTtcclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHNpZ25hdHVyZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHNpZ25hdHVyZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHByb2Nlc3NpbmcgTGVkZ2VyIHNpZ25hdHVyZTonLCBlcnJvcik7XHJcblxyXG4gICAgLy8gTG9nIGZhaWxlZCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZCAmJiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnblJlcXVlc3Q/LmFkZHJlc3MgfHwgJ2xlZGdlcicsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCB8fCAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ2hhcmR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVqZWN0KGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHNpZ24gcmVxdWVzdCBkZXRhaWxzIChmb3IgcG9wdXApXHJcbmZ1bmN0aW9uIGdldFNpZ25SZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIHJldHVybiBwZW5kaW5nU2lnblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG59XHJcblxyXG4vLyBMaXN0ZW4gZm9yIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRzIGFuZCBwb3B1cFxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgLy8gUmVjZWl2ZWQgbWVzc2FnZVxyXG5cclxuICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcclxuICAgICAgICBjYXNlICdXQUxMRVRfUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVXYWxsZXRSZXF1ZXN0KG1lc3NhZ2UsIHNlbmRlcik7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDT05ORUNUSU9OX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IGFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgYXBwcm92YWwgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShhcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NPTk5FQ1RJT05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCByZXF1ZXN0SW5mbyA9IGdldENvbm5lY3Rpb25SZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgY29ubmVjdGlvbiByZXF1ZXN0IGluZm9cclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NPTk5FQ1RFRF9TSVRFUyc6XHJcbiAgICAgICAgICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIGNvbm5lY3RlZCBzaXRlcycpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgc2l0ZXMgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnRElTQ09OTkVDVF9TSVRFJzpcclxuICAgICAgICAgIGF3YWl0IHJlbW92ZUNvbm5lY3RlZFNpdGUobWVzc2FnZS5vcmlnaW4pO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyBkaXNjb25uZWN0IGNvbmZpcm1hdGlvblxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdUUkFOU0FDVElPTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCB0eEFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlVHJhbnNhY3Rpb25BcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCwgbWVzc2FnZS5zZXNzaW9uVG9rZW4sIG1lc3NhZ2UuZ2FzUHJpY2UsIG1lc3NhZ2UuY3VzdG9tTm9uY2UsIG1lc3NhZ2UudHhIYXNoKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eEFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDUkVBVEVfU0VTU0lPTic6XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uVG9rZW4gPSBhd2FpdCBjcmVhdGVTZXNzaW9uKG1lc3NhZ2UucGFzc3dvcmQsIG1lc3NhZ2Uud2FsbGV0SWQsIG1lc3NhZ2UuZHVyYXRpb25Ncyk7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNlc3Npb25Ub2tlbiB9KTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX1NFU1NJT04nOlxyXG4gICAgICAgICAgY29uc3QgaW52YWxpZGF0ZWQgPSBpbnZhbGlkYXRlU2Vzc2lvbihtZXNzYWdlLnNlc3Npb25Ub2tlbik7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBpbnZhbGlkYXRlZCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX0FMTF9TRVNTSU9OUyc6XHJcbiAgICAgICAgICBjb25zdCBjb3VudCA9IGludmFsaWRhdGVBbGxTZXNzaW9ucygpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgdHhSZXF1ZXN0SW5mbyA9IGdldFRyYW5zYWN0aW9uUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRyYW5zYWN0aW9uIHJlcXVlc3QgaW5mbzonLCB0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdUT0tFTl9BRERfQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgdG9rZW5BcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVRva2VuQWRkQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgYXBwcm92YWwgcmVzcG9uc2U6JywgdG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0lHTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCBzaWduQXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVTaWduQXBwcm92YWwoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UucmVxdWVzdElkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFwcHJvdmVkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNlc3Npb25Ub2tlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgc2lnbiBhcHByb3ZhbCByZXNwb25zZTonLCBzaWduQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNpZ25BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0lHTl9BUFBST1ZBTF9MRURHRVInOlxyXG4gICAgICAgICAgY29uc3QgbGVkZ2VyU2lnblJlc3VsdCA9IGF3YWl0IGhhbmRsZUxlZGdlclNpZ25BcHByb3ZhbChcclxuICAgICAgICAgICAgbWVzc2FnZS5yZXF1ZXN0SWQsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYXBwcm92ZWQsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2lnbmF0dXJlXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBMZWRnZXIgc2lnbiBhcHByb3ZhbCByZXNwb25zZTonLCBsZWRnZXJTaWduUmVzdWx0KTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShsZWRnZXJTaWduUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfU0lHTl9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHNpZ25SZXF1ZXN0SW5mbyA9IGdldFNpZ25SZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgc2lnbiByZXF1ZXN0IGluZm86Jywgc2lnblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzaWduUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9UT0tFTl9BRERfUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCB0b2tlblJlcXVlc3RJbmZvID0gZ2V0VG9rZW5BZGRSZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgdG9rZW4gYWRkIHJlcXVlc3QgaW5mbzonLCB0b2tlblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0b2tlblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAvLyBTaWduaW5nIEF1ZGl0IExvZ1xyXG4gICAgICAgIGNhc2UgJ0dFVF9TSUdOSU5HX0FVRElUX0xPRyc6XHJcbiAgICAgICAgICBjb25zdCBzaWduaW5nTG9nID0gYXdhaXQgZ2V0U2lnbmluZ0F1ZGl0TG9nKCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBsb2c6IHNpZ25pbmdMb2cgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy8gVHJhbnNhY3Rpb24gSGlzdG9yeVxyXG4gICAgICAgIGNhc2UgJ0dFVF9UWF9ISVNUT1JZJzpcclxuICAgICAgICAgIGNvbnN0IHR4SGlzdG9yeUxpc3QgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhIaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbnM6IHR4SGlzdG9yeUxpc3QgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnOlxyXG4gICAgICAgICAgY29uc3QgcGVuZGluZ0NvdW50ID0gYXdhaXQgdHhIaXN0b3J5LmdldFBlbmRpbmdUeENvdW50KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBjb3VudDogcGVuZGluZ0NvdW50IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9QRU5ESU5HX1RYUyc6XHJcbiAgICAgICAgICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgdHhIaXN0b3J5LmdldFBlbmRpbmdUeHMobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uczogcGVuZGluZ1R4cyB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVFhfQllfSEFTSCc6XHJcbiAgICAgICAgICBjb25zdCB0eERldGFpbCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHhIYXNoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uOiB0eERldGFpbCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTQVZFX1RYJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHJhbnNhY3Rpb24pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTQVZFX0FORF9NT05JVE9SX1RYJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHJhbnNhY3Rpb24pO1xyXG5cclxuICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgZm9yIGNvbmZpcm1hdGlvbiBpbiBiYWNrZ3JvdW5kXHJcbiAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBtZXNzYWdlLnRyYW5zYWN0aW9uLm5ldHdvcmsgfHwgJ3B1bHNlY2hhaW5UZXN0bmV0JztcclxuICAgICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgICAgICAgICBjb25zdCB0eCA9IHsgaGFzaDogbWVzc2FnZS50cmFuc2FjdGlvbi5oYXNoIH07XHJcbiAgICAgICAgICAgICAgYXdhaXQgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbW9uaXRvcmluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDTEVBUl9UWF9ISVNUT1JZJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5jbGVhclR4SGlzdG9yeShtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ1VSUkVOVF9HQVNfUFJJQ0UnOlxyXG4gICAgICAgICAgY29uc3QgZ2FzUHJpY2VSZXN1bHQgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29ya0dhc1ByaWNlKG1lc3NhZ2UubmV0d29yayk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoZ2FzUHJpY2VSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1JFRlJFU0hfVFhfU1RBVFVTJzpcclxuICAgICAgICAgIGNvbnN0IHJlZnJlc2hSZXN1bHQgPSBhd2FpdCByZWZyZXNoVHJhbnNhY3Rpb25TdGF0dXMoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UubmV0d29ya1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZWZyZXNoUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTUEVFRF9VUF9UWCc6XHJcbiAgICAgICAgICBjb25zdCBzcGVlZFVwUmVzdWx0ID0gYXdhaXQgaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNlc3Npb25Ub2tlbixcclxuICAgICAgICAgICAgbWVzc2FnZS5nYXNQcmljZU11bHRpcGxpZXIgfHwgMS4yLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmN1c3RvbUdhc1ByaWNlIHx8IG51bGxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoc3BlZWRVcFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0FOQ0VMX1RYJzpcclxuICAgICAgICAgIGNvbnN0IGNhbmNlbFJlc3VsdCA9IGF3YWl0IGhhbmRsZUNhbmNlbFRyYW5zYWN0aW9uKFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNlc3Npb25Ub2tlbixcclxuICAgICAgICAgICAgbWVzc2FnZS5jdXN0b21HYXNQcmljZSB8fCBudWxsXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGNhbmNlbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVVBEQVRFX1JQQ19QUklPUklUSUVTJzpcclxuICAgICAgICAgIC8vIFVwZGF0ZSBSUEMgcHJpb3JpdGllcyBpbiB0aGUgcnBjIG1vZHVsZVxyXG4gICAgICAgICAgaWYgKG1lc3NhZ2UubmV0d29yayAmJiBtZXNzYWdlLnByaW9yaXRpZXMpIHtcclxuICAgICAgICAgICAgcnBjLnVwZGF0ZVJwY1ByaW9yaXRpZXMobWVzc2FnZS5uZXR3b3JrLCBtZXNzYWdlLnByaW9yaXRpZXMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg8J+rgCBVcGRhdGVkIFJQQyBwcmlvcml0aWVzIGZvciAke21lc3NhZ2UubmV0d29ya31gKTtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgbmV0d29yayBvciBwcmlvcml0aWVzJyB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgVW5rbm93biBtZXNzYWdlIHR5cGU6JywgbWVzc2FnZS50eXBlKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Vua25vd24gbWVzc2FnZSB0eXBlJyB9KTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBoYW5kbGluZyBtZXNzYWdlOicsIGVycm9yKTtcclxuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgfVxyXG4gIH0pKCk7XHJcblxyXG4gIHJldHVybiB0cnVlOyAvLyBLZWVwIG1lc3NhZ2UgY2hhbm5lbCBvcGVuIGZvciBhc3luYyByZXNwb25zZVxyXG59KTtcclxuXHJcbmNvbnNvbGUubG9nKCfwn6uAIEhlYXJ0V2FsbGV0IHNlcnZpY2Ugd29ya2VyIHJlYWR5Jyk7XHJcbiJdLCJuYW1lcyI6WyJldGhlcnMuZ2V0QWRkcmVzcyIsImV0aGVycy5nZXRCeXRlcyIsImV0aGVycy50b1V0ZjhTdHJpbmciLCJldGhlcnMuaXNBZGRyZXNzIiwicnBjLmdldEJsb2NrTnVtYmVyIiwicnBjLmdldEJsb2NrQnlOdW1iZXIiLCJycGMuZ2V0QmFsYW5jZSIsInJwYy5nZXRUcmFuc2FjdGlvbkNvdW50IiwicnBjLmdldEdhc1ByaWNlIiwicnBjLmVzdGltYXRlR2FzIiwicnBjLmNhbGwiLCJycGMuc2VuZFJhd1RyYW5zYWN0aW9uIiwicnBjLmdldFRyYW5zYWN0aW9uUmVjZWlwdCIsInJwYy5nZXRUcmFuc2FjdGlvbkJ5SGFzaCIsInJwYy5nZXRQcm92aWRlciIsInR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeSIsInR4SGlzdG9yeS5UWF9TVEFUVVMiLCJ0eEhpc3RvcnkuVFhfVFlQRVMiLCJycGMuZ2V0U2FmZUdhc1ByaWNlIiwidHhIaXN0b3J5LmdldFR4QnlIYXNoIiwidHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzIiwidHhIaXN0b3J5LmdldFR4SGlzdG9yeSIsInR4SGlzdG9yeS5nZXRQZW5kaW5nVHhDb3VudCIsInR4SGlzdG9yeS5nZXRQZW5kaW5nVHhzIiwidHhIaXN0b3J5LmNsZWFyVHhIaXN0b3J5IiwicnBjLnVwZGF0ZVJwY1ByaW9yaXRpZXMiXSwibWFwcGluZ3MiOiI7QUFRQSxNQUFNLGlCQUFpQjtBQUN2QixNQUFNLDBCQUEwQjtBQUNoQyxNQUFNLHNCQUFzQjtBQUdyQixNQUFNLFdBQVc7QUFBQSxFQUV0QixVQUFVO0FBRVo7QUFHTyxNQUFNLFlBQVk7QUFBQSxFQUN2QixTQUFTO0FBQUEsRUFDVCxXQUFXO0FBQUEsRUFDWCxRQUFRO0FBQ1Y7QUFLTyxlQUFlLHVCQUF1QjtBQUMzQyxRQUFNLFdBQVcsTUFBTSxLQUFLLHVCQUF1QjtBQUNuRCxTQUFPLFlBQVk7QUFBQSxJQUNqQixTQUFTO0FBQUE7QUFBQSxJQUNULGFBQWE7QUFBQTtBQUFBLEVBQ2pCO0FBQ0E7QUFLQSxlQUFlLGdCQUFnQjtBQUM3QixRQUFNLFVBQVUsTUFBTSxLQUFLLGNB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
