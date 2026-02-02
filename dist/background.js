import { l as load, s as save, a as getAddress, K as getBytes, L as toUtf8String, i as isAddress, M as updateRpcPriorities, g as getProvider, u as unlockWallet, N as secureCleanup, O as secureCleanupSigner, P as getRawTransaction, Q as broadcastToAllRpcs, G as getGasPriceRecommendations, c as getActiveWallet, J as getSafeGasPrice, R as getTransactionByHash, U as getTransactionReceipt, V as sendRawTransaction, x as getGasPrice, H as estimateGas, W as call, r as getTransactionCount, o as getBalance, X as getBlockByNumber, Y as getBlockNumber } from "./rpc.js";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRBbGxIaXN0b3J5KCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBsb2FkKFRYX0hJU1RPUllfS0VZKTtcclxuICByZXR1cm4gaGlzdG9yeSB8fCB7fTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpIHtcclxuICBhd2FpdCBzYXZlKFRYX0hJU1RPUllfS0VZLCBoaXN0b3J5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgYSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgdHhEYXRhKSB7XHJcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRUeEhpc3RvcnlTZXR0aW5ncygpO1xyXG4gIGlmICghc2V0dGluZ3MuZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuOyAvLyBIaXN0b3J5IGRpc2FibGVkXHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBhZGRyZXNzIGhpc3RvcnkgaWYgZG9lc24ndCBleGlzdFxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0gPSB7IHRyYW5zYWN0aW9uczogW10gfTtcclxuICB9XHJcblxyXG4gIC8vIEFkZCBuZXcgdHJhbnNhY3Rpb24gYXQgYmVnaW5uaW5nIChuZXdlc3QgZmlyc3QpXHJcbiAgY29uc3QgdHhFbnRyeSA9IHtcclxuICAgIGhhc2g6IHR4RGF0YS5oYXNoLFxyXG4gICAgdGltZXN0YW1wOiB0eERhdGEudGltZXN0YW1wIHx8IERhdGUubm93KCksXHJcbiAgICBmcm9tOiB0eERhdGEuZnJvbS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgdG86IHR4RGF0YS50byA/IHR4RGF0YS50by50b0xvd2VyQ2FzZSgpIDogbnVsbCxcclxuICAgIHZhbHVlOiB0eERhdGEudmFsdWUgfHwgJzAnLFxyXG4gICAgZGF0YTogdHhEYXRhLmRhdGEgfHwgJzB4JyxcclxuICAgIGdhc1ByaWNlOiB0eERhdGEuZ2FzUHJpY2UsXHJcbiAgICBnYXNMaW1pdDogdHhEYXRhLmdhc0xpbWl0LFxyXG4gICAgbm9uY2U6IHR4RGF0YS5ub25jZSxcclxuICAgIG5ldHdvcms6IHR4RGF0YS5uZXR3b3JrLFxyXG4gICAgc3RhdHVzOiB0eERhdGEuc3RhdHVzIHx8IFRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgYmxvY2tOdW1iZXI6IHR4RGF0YS5ibG9ja051bWJlciB8fCBudWxsLFxyXG4gICAgdHlwZTogdHhEYXRhLnR5cGUgfHwgVFhfVFlQRVMuQ09OVFJBQ1RcclxuICB9O1xyXG5cclxuICAvLyBTdG9yZSBFSVAtMTU1OSBmaWVsZHMgaWYgcHJlc2VudCAoZm9yIHByb3BlciBzcGVlZC11cC9jYW5jZWwpXHJcbiAgaWYgKHR4RGF0YS5tYXhGZWVQZXJHYXMpIHtcclxuICAgIHR4RW50cnkubWF4RmVlUGVyR2FzID0gdHhEYXRhLm1heEZlZVBlckdhcztcclxuICB9XHJcbiAgaWYgKHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgdHhFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICB9XHJcblxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMudW5zaGlmdCh0eEVudHJ5KTtcclxuXHJcbiAgLy8gRW5mb3JjZSBtYXggbGltaXQgKEZJRk8gLSByZW1vdmUgb2xkZXN0KVxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLmxlbmd0aCA+IE1BWF9UWFNfUEVSX0FERFJFU1MpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgPSBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLnNsaWNlKDAsIE1BWF9UWFNfUEVSX0FERFJFU1MpO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZUFsbEhpc3RvcnkoaGlzdG9yeSk7XHJcbiAgLy8gVHJhbnNhY3Rpb24gYWRkZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIHN0YXR1cywgYmxvY2tOdW1iZXIgPSBudWxsKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eEluZGV4ID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5maW5kSW5kZXgoXHJcbiAgICB0eCA9PiB0eC5oYXNoLnRvTG93ZXJDYXNlKCkgPT09IHR4SGFzaC50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuXHJcbiAgaWYgKHR4SW5kZXggPT09IC0xKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLnN0YXR1cyA9IHN0YXR1cztcclxuICBpZiAoYmxvY2tOdW1iZXIgIT09IG51bGwpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnNbdHhJbmRleF0uYmxvY2tOdW1iZXIgPSBibG9ja051bWJlcjtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbnMgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhzKGFkZHJlc3MpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maWx0ZXIodHggPT4gdHguc3RhdHVzID09PSBUWF9TVEFUVVMuUEVORElORyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbiBjb3VudCBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdUeENvdW50KGFkZHJlc3MpIHtcclxuICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKTtcclxuICByZXR1cm4gcGVuZGluZ1R4cy5sZW5ndGg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFR4QnlIYXNoKGFkZHJlc3MsIHR4SGFzaCkge1xyXG4gIGNvbnN0IHR4cyA9IGF3YWl0IGdldFR4SGlzdG9yeShhZGRyZXNzKTtcclxuICByZXR1cm4gdHhzLmZpbmQodHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyVHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKGhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgZGVsZXRlIGhpc3RvcnlbYWRkcmVzc0xvd2VyXTtcclxuICAgIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbiAgfVxyXG59XHJcblxyXG4iLCIvKipcclxuICogY29yZS90eFZhbGlkYXRpb24uanNcclxuICpcclxuICogVHJhbnNhY3Rpb24gdmFsaWRhdGlvbiB1dGlsaXRpZXMgZm9yIHNlY3VyaXR5XHJcbiAqIFZhbGlkYXRlcyBhbGwgdHJhbnNhY3Rpb24gcGFyYW1ldGVycyBiZWZvcmUgcHJvY2Vzc2luZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgdHJhbnNhY3Rpb24gcmVxdWVzdCBmcm9tIGEgZEFwcFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHhSZXF1ZXN0IC0gVHJhbnNhY3Rpb24gcmVxdWVzdCBvYmplY3RcclxuICogQHBhcmFtIHtudW1iZXJ9IG1heEdhc1ByaWNlR3dlaSAtIE1heGltdW0gYWxsb3dlZCBnYXMgcHJpY2UgaW4gR3dlaSAoZGVmYXVsdCAxMDAwKVxyXG4gKiBAcmV0dXJucyB7eyB2YWxpZDogYm9vbGVhbiwgZXJyb3JzOiBzdHJpbmdbXSwgc2FuaXRpemVkOiBPYmplY3QgfX1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSA9IDEwMDApIHtcclxuICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICBjb25zdCBzYW5pdGl6ZWQgPSB7fTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3RvJyBhZGRyZXNzIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0LnRvICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnRvICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC50byAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkSGV4QWRkcmVzcyh0eFJlcXVlc3QudG8pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInRvXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLnRvID0gZXRoZXJzLmdldEFkZHJlc3ModHhSZXF1ZXN0LnRvKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdmcm9tJyBhZGRyZXNzIGlmIHByZXNlbnQgKHNob3VsZCBtYXRjaCB3YWxsZXQgYWRkcmVzcylcclxuICBpZiAodHhSZXF1ZXN0LmZyb20gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZnJvbSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZnJvbSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLmZyb20gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QuZnJvbSk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICd2YWx1ZScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LnZhbHVlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnZhbHVlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QudmFsdWUpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInZhbHVlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWVCaWdJbnQgPSBCaWdJbnQodHhSZXF1ZXN0LnZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWVCaWdJbnQgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLnZhbHVlID0gdHhSZXF1ZXN0LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQudmFsdWUgPSAnMHgwJzsgLy8gRGVmYXVsdCB0byAwXHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZGF0YScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LmRhdGEgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZGF0YSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZGF0YSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZGF0YVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhEYXRhKHR4UmVxdWVzdC5kYXRhKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSB2YWxpZCBoZXggZGF0YScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2FuaXRpemVkLmRhdGEgPSB0eFJlcXVlc3QuZGF0YTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgc2FuaXRpemVkLmRhdGEgPSAnMHgnOyAvLyBEZWZhdWx0IHRvIGVtcHR5IGRhdGFcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdnYXMnIG9yICdnYXNMaW1pdCcgZmllbGRcclxuICAvLyBTRUNVUklUWTogUmVhc29uYWJsZSBtYXhpbXVtIGlzIDEwTSBnYXMgdG8gcHJldmVudCBmZWUgc2NhbXNcclxuICAvLyBNb3N0IHRyYW5zYWN0aW9uczogMjFrLTIwMGsgZ2FzLiBDb21wbGV4IERlRmk6IDIwMGstMU0gZ2FzLlxyXG4gIC8vIEV0aGVyZXVtL1B1bHNlQ2hhaW4gYmxvY2sgbGltaXQgaXMgfjMwTSwgYnV0IHNpbmdsZSBUWCByYXJlbHkgbmVlZHMgPjEwTVxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LmdhcyAhPT0gbnVsbCkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGV4VmFsdWUodHhSZXF1ZXN0LmdhcykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhcyk7XHJcbiAgICAgICAgaWYgKGdhc0xpbWl0IDwgMjEwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBsaW1pdCB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAxMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBoaWdoIChtYXhpbXVtIDEwMDAwMDAwKS4gTW9zdCB0cmFuc2FjdGlvbnMgbmVlZCA8MU0gZ2FzLicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzID0gdHhSZXF1ZXN0LmdhcztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzTGltaXQpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc0xpbWl0KTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGxvdyAobWluaW11bSAyMTAwMCknKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc0xpbWl0ID4gMTAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIHRvbyBoaWdoIChtYXhpbXVtIDEwMDAwMDAwKS4gTW9zdCB0cmFuc2FjdGlvbnMgbmVlZCA8MU0gZ2FzLicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzTGltaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZ2FzUHJpY2UnIGZpZWxkIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzUHJpY2UpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzUHJpY2UgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc1ByaWNlKTtcclxuICAgICAgICBjb25zdCBtYXhHYXNQcmljZVdlaSA9IEJpZ0ludChtYXhHYXNQcmljZUd3ZWkpICogQmlnSW50KCcxMDAwMDAwMDAwJyk7IC8vIENvbnZlcnQgR3dlaSB0byBXZWlcclxuICAgICAgICBpZiAoZ2FzUHJpY2UgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc1ByaWNlID4gbWF4R2FzUHJpY2VXZWkpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKGBJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZXhjZWVkcyBtYXhpbXVtIG9mICR7bWF4R2FzUHJpY2VHd2VpfSBHd2VpYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNQcmljZSA9IHR4UmVxdWVzdC5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdub25jZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5ub25jZSkgJiYgdHlwZW9mIHR4UmVxdWVzdC5ub25jZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIG9yIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJyBcclxuICAgICAgICAgID8gQmlnSW50KHR4UmVxdWVzdC5ub25jZSkgXHJcbiAgICAgICAgICA6IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpO1xyXG4gICAgICAgIGlmIChub25jZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9uY2UgPiBCaWdJbnQoJzkwMDcxOTkyNTQ3NDA5OTEnKSkgeyAvLyBKYXZhU2NyaXB0IHNhZmUgaW50ZWdlciBtYXhcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgdW5yZWFzb25hYmx5IGhpZ2gnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLm5vbmNlID0gdHhSZXF1ZXN0Lm5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gbXVzdCBoYXZlIGVpdGhlciAndG8nIG9yICdkYXRhJyAoY29udHJhY3QgY3JlYXRpb24pXHJcbiAgaWYgKCFzYW5pdGl6ZWQudG8gJiYgKCFzYW5pdGl6ZWQuZGF0YSB8fCBzYW5pdGl6ZWQuZGF0YSA9PT0gJzB4JykpIHtcclxuICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBtdXN0IGhhdmUgXCJ0b1wiIGFkZHJlc3Mgb3IgXCJkYXRhXCIgZm9yIGNvbnRyYWN0IGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnMsXHJcbiAgICBzYW5pdGl6ZWRcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIEV0aGVyZXVtIGFkZHJlc3MgKGhleCBmb3JtYXQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhZGRyZXNzIC0gQWRkcmVzcyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhBZGRyZXNzKGFkZHJlc3MpIHtcclxuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSA0MiBjaGFyYWN0ZXJzOiAweCArIDQwIGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdezQwfSQvLnRlc3QoYWRkcmVzcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBoZXggdmFsdWUgKGZvciBhbW91bnRzLCBnYXMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEhleCB2YWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBzdGFydCB3aXRoIDB4IGFuZCBjb250YWluIG9ubHkgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0rJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaGV4IGRhdGEgKGZvciB0cmFuc2FjdGlvbiBkYXRhIGZpZWxkKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIEhleCBkYXRhIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleERhdGEoZGF0YSkge1xyXG4gIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDB4IG9yIDB4IGZvbGxvd2VkIGJ5IGV2ZW4gbnVtYmVyIG9mIGhleCBkaWdpdHNcclxuICBpZiAoZGF0YSA9PT0gJzB4JykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSokLy50ZXN0KGRhdGEpICYmIGRhdGEubGVuZ3RoICUgMiA9PT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBhbiBlcnJvciBtZXNzYWdlIGZvciBzYWZlIGRpc3BsYXlcclxuICogUmVtb3ZlcyBhbnkgSFRNTCwgc2NyaXB0cywgYW5kIGNvbnRyb2wgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUVycm9yTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiA1MDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgNDk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGNvcmUvc2lnbmluZy5qc1xyXG4gKlxyXG4gKiBNZXNzYWdlIHNpZ25pbmcgZnVuY3Rpb25hbGl0eSBmb3IgRUlQLTE5MSBhbmQgRUlQLTcxMlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogU2lnbnMgYSBtZXNzYWdlIHVzaW5nIEVJUC0xOTEgKHBlcnNvbmFsX3NpZ24pXHJcbiAqIFRoaXMgcHJlcGVuZHMgXCJcXHgxOUV0aGVyZXVtIFNpZ25lZCBNZXNzYWdlOlxcblwiICsgbGVuKG1lc3NhZ2UpIHRvIHRoZSBtZXNzYWdlXHJcbiAqIGJlZm9yZSBzaWduaW5nLCB3aGljaCBwcmV2ZW50cyBzaWduaW5nIGFyYml0cmFyeSB0cmFuc2FjdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBzaWduIChoZXggc3RyaW5nIG9yIFVURi04IHN0cmluZylcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBlcnNvbmFsU2lnbihzaWduZXIsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25NZXNzYWdlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWQsIGRlY29kZSBpdCBmaXJzdFxyXG4gICAgLy8gZXRoZXJzLmpzIHNpZ25NZXNzYWdlIGV4cGVjdHMgYSBzdHJpbmcgb3IgVWludDhBcnJheVxyXG4gICAgbGV0IG1lc3NhZ2VUb1NpZ24gPSBtZXNzYWdlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIC8vIEl0J3MgYSBoZXggc3RyaW5nLCBjb252ZXJ0IHRvIFVURi04XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gVHJ5IHRvIGRlY29kZSBhcyBoZXhcclxuICAgICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIElmIGRlY29kaW5nIGZhaWxzLCB1c2UgdGhlIGhleCBzdHJpbmcgYXMtaXNcclxuICAgICAgICAvLyBldGhlcnMgd2lsbCBoYW5kbGUgaXRcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gbWVzc2FnZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdGhlIG1lc3NhZ2UgKGV0aGVycy5qcyBhdXRvbWF0aWNhbGx5IGFwcGxpZXMgRUlQLTE5MSBmb3JtYXQpXHJcbiAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBzaWduZXIuc2lnbk1lc3NhZ2UobWVzc2FnZVRvU2lnbik7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiBtZXNzYWdlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2lnbnMgdHlwZWQgZGF0YSB1c2luZyBFSVAtNzEyXHJcbiAqIFVzZWQgYnkgZEFwcHMgZm9yIHN0cnVjdHVyZWQgZGF0YSBzaWduaW5nIChwZXJtaXRzLCBtZXRhLXRyYW5zYWN0aW9ucywgZXRjLilcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZERhdGEgLSBFSVAtNzEyIHR5cGVkIGRhdGEgb2JqZWN0IHdpdGggZG9tYWluLCB0eXBlcywgYW5kIG1lc3NhZ2VcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25UeXBlZERhdGEoc2lnbmVyLCB0eXBlZERhdGEpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25UeXBlZERhdGEgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaWduZXIgcHJvdmlkZWQnKTtcclxuICB9XHJcblxyXG4gIGlmICghdHlwZWREYXRhKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1R5cGVkIGRhdGEgaXMgcmVxdWlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHR5cGVkIGRhdGEgc3RydWN0dXJlXHJcbiAgaWYgKCF0eXBlZERhdGEuZG9tYWluIHx8ICF0eXBlZERhdGEudHlwZXMgfHwgIXR5cGVkRGF0YS5tZXNzYWdlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgRUlQLTcxMiB0eXBlZCBkYXRhOiBtaXNzaW5nIGRvbWFpbiwgdHlwZXMsIG9yIG1lc3NhZ2UnKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBFeHRyYWN0IHByaW1hcnlUeXBlIChpZiBub3QgcHJvdmlkZWQsIHRyeSB0byBpbmZlciBpdClcclxuICAgIGxldCBwcmltYXJ5VHlwZSA9IHR5cGVkRGF0YS5wcmltYXJ5VHlwZTtcclxuXHJcbiAgICBpZiAoIXByaW1hcnlUeXBlKSB7XHJcbiAgICAgIC8vIFRyeSB0byBpbmZlciBwcmltYXJ5IHR5cGUgZnJvbSB0eXBlcyBvYmplY3RcclxuICAgICAgLy8gSXQncyB0aGUgdHlwZSB0aGF0J3Mgbm90IFwiRUlQNzEyRG9tYWluXCJcclxuICAgICAgY29uc3QgdHlwZU5hbWVzID0gT2JqZWN0LmtleXModHlwZWREYXRhLnR5cGVzKS5maWx0ZXIodCA9PiB0ICE9PSAnRUlQNzEyRG9tYWluJyk7XHJcbiAgICAgIGlmICh0eXBlTmFtZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgcHJpbWFyeVR5cGUgPSB0eXBlTmFtZXNbMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgaW5mZXIgcHJpbWFyeVR5cGUgLSBwbGVhc2Ugc3BlY2lmeSBpdCBleHBsaWNpdGx5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBWYWxpZGF0ZSB0aGF0IHByaW1hcnlUeXBlIGV4aXN0cyBpbiB0eXBlc1xyXG4gICAgaWYgKCF0eXBlZERhdGEudHlwZXNbcHJpbWFyeVR5cGVdKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJpbWFyeSB0eXBlIFwiJHtwcmltYXJ5VHlwZX1cIiBub3QgZm91bmQgaW4gdHlwZXMgZGVmaW5pdGlvbmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdXNpbmcgZXRoZXJzLmpzIHNpZ25UeXBlZERhdGFcclxuICAgIC8vIGV0aGVycyB2NiB1c2VzOiBzaWduVHlwZWREYXRhKGRvbWFpbiwgdHlwZXMsIHZhbHVlKVxyXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2lnbmVyLnNpZ25UeXBlZERhdGEoXHJcbiAgICAgIHR5cGVkRGF0YS5kb21haW4sXHJcbiAgICAgIHR5cGVkRGF0YS50eXBlcyxcclxuICAgICAgdHlwZWREYXRhLm1lc3NhZ2VcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiB0eXBlZCBkYXRhOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAtIFJQQyBtZXRob2QgKHBlcnNvbmFsX3NpZ24sIGV0aF9zaWduVHlwZWREYXRhX3Y0LCBldGMuKVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwYXJhbXMgLSBSUEMgcGFyYW1ldGVyc1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSB7IHZhbGlkOiBib29sZWFuLCBlcnJvcj86IHN0cmluZywgc2FuaXRpemVkPzogT2JqZWN0IH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKSB7XHJcbiAgaWYgKCFtZXRob2QgfHwgIXBhcmFtcyB8fCAhQXJyYXkuaXNBcnJheShwYXJhbXMpKSB7XHJcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCByZXF1ZXN0IGZvcm1hdCcgfTtcclxuICB9XHJcblxyXG4gIHN3aXRjaCAobWV0aG9kKSB7XHJcbiAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduJzogLy8gTm90ZTogZXRoX3NpZ24gaXMgZGFuZ2Vyb3VzIGFuZCBzaG91bGQgc2hvdyBzdHJvbmcgd2FybmluZ1xyXG4gICAgICBpZiAocGFyYW1zLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXJzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtZXNzYWdlID0gcGFyYW1zWzBdO1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzFdO1xyXG5cclxuICAgICAgaWYgKCFtZXNzYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01lc3NhZ2UgaXMgZW1wdHknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYWRkcmVzcyB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyZXNzKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhbml0aXplIG1lc3NhZ2UgKGNvbnZlcnQgdG8gc3RyaW5nIGlmIG5lZWRlZClcclxuICAgICAgY29uc3Qgc2FuaXRpemVkTWVzc2FnZSA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IG1lc3NhZ2UgOiBTdHJpbmcobWVzc2FnZSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHNhbml0aXplZDoge1xyXG4gICAgICAgICAgbWVzc2FnZTogc2FuaXRpemVkTWVzc2FnZSxcclxuICAgICAgICAgIGFkZHJlc3M6IGV0aGVycy5nZXRBZGRyZXNzKGFkZHJlc3MpIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVycycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYWRkciA9IHBhcmFtc1swXTtcclxuICAgICAgbGV0IHR5cGVkRGF0YSA9IHBhcmFtc1sxXTtcclxuXHJcbiAgICAgIGlmICghYWRkciB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBhcnNlIHR5cGVkIGRhdGEgaWYgaXQncyBhIHN0cmluZ1xyXG4gICAgICBpZiAodHlwZW9mIHR5cGVkRGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdHlwZWREYXRhID0gSlNPTi5wYXJzZSh0eXBlZERhdGEpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgdHlwZWQgZGF0YSBmb3JtYXQnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWYWxpZGF0ZSB0eXBlZCBkYXRhIHN0cnVjdHVyZVxyXG4gICAgICBpZiAoIXR5cGVkRGF0YSB8fCB0eXBlb2YgdHlwZWREYXRhICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdUeXBlZCBkYXRhIG11c3QgYmUgYW4gb2JqZWN0JyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXR5cGVkRGF0YS5kb21haW4gfHwgIXR5cGVkRGF0YS50eXBlcyB8fCAhdHlwZWREYXRhLm1lc3NhZ2UpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnVHlwZWQgZGF0YSBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyAoZG9tYWluLCB0eXBlcywgbWVzc2FnZSknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsaWQ6IHRydWUsXHJcbiAgICAgICAgc2FuaXRpemVkOiB7XHJcbiAgICAgICAgICBhZGRyZXNzOiBldGhlcnMuZ2V0QWRkcmVzcyhhZGRyKSxcclxuICAgICAgICAgIHR5cGVkRGF0YTogdHlwZWREYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBVbnN1cHBvcnRlZCBzaWduaW5nIG1ldGhvZDogJHttZXRob2R9YCB9O1xyXG4gIH1cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGJhY2tncm91bmQvc2VydmljZS13b3JrZXIuanNcclxuICpcclxuICogQmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlciBmb3IgSGVhcnRXYWxsZXRcclxuICogSGFuZGxlcyBSUEMgcmVxdWVzdHMgZnJvbSBkQXBwcyBhbmQgbWFuYWdlcyB3YWxsZXQgc3RhdGVcclxuICovXHJcblxyXG5pbXBvcnQgeyBnZXRBY3RpdmVXYWxsZXQsIHVubG9ja1dhbGxldCwgc2VjdXJlQ2xlYW51cCwgc2VjdXJlQ2xlYW51cFNpZ25lciB9IGZyb20gJy4uL2NvcmUvd2FsbGV0LmpzJztcclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4uL2NvcmUvc3RvcmFnZS5qcyc7XHJcbmltcG9ydCAqIGFzIHJwYyBmcm9tICcuLi9jb3JlL3JwYy5qcyc7XHJcbmltcG9ydCAqIGFzIHR4SGlzdG9yeSBmcm9tICcuLi9jb3JlL3R4SGlzdG9yeS5qcyc7XHJcbmltcG9ydCB7IHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0LCBzYW5pdGl6ZUVycm9yTWVzc2FnZSB9IGZyb20gJy4uL2NvcmUvdHhWYWxpZGF0aW9uLmpzJztcclxuaW1wb3J0IHsgcGVyc29uYWxTaWduLCBzaWduVHlwZWREYXRhLCB2YWxpZGF0ZVNpZ25SZXF1ZXN0IH0gZnJvbSAnLi4vY29yZS9zaWduaW5nLmpzJztcclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8vIFNlcnZpY2Ugd29ya2VyIGxvYWRlZFxyXG5cclxuLy8gTmV0d29yayBjaGFpbiBJRHNcclxuY29uc3QgQ0hBSU5fSURTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6ICcweDNBRicsIC8vIDk0M1xyXG4gICdwdWxzZWNoYWluJzogJzB4MTcxJywgLy8gMzY5XHJcbiAgJ2V0aGVyZXVtJzogJzB4MScsIC8vIDFcclxuICAnc2Vwb2xpYSc6ICcweEFBMzZBNycgLy8gMTExNTUxMTFcclxufTtcclxuXHJcbi8vIFN0b3JhZ2Uga2V5c1xyXG5jb25zdCBDT05ORUNURURfU0lURVNfS0VZID0gJ2Nvbm5lY3RlZF9zaXRlcyc7XHJcblxyXG4vLyBQZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdHMgKG9yaWdpbiAtPiB7IHJlc29sdmUsIHJlamVjdCwgdGFiSWQgfSlcclxuY29uc3QgcGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gU0lHTklORyBBVURJVCBMT0cgPT09PT1cclxuLy8gU3RvcmVzIHJlY2VudCBzaWduaW5nIG9wZXJhdGlvbnMgZm9yIHNlY3VyaXR5IGF1ZGl0aW5nIChpbi1tZW1vcnksIGNsZWFyZWQgb24gc2VydmljZSB3b3JrZXIgcmVzdGFydClcclxuY29uc3QgU0lHTklOR19MT0dfS0VZID0gJ3NpZ25pbmdfYXVkaXRfbG9nJztcclxuY29uc3QgTUFYX1NJR05JTkdfTE9HX0VOVFJJRVMgPSAxMDA7XHJcblxyXG4vKipcclxuICogTG9nIGEgc2lnbmluZyBvcGVyYXRpb24gZm9yIGF1ZGl0IHB1cnBvc2VzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIExvZyBlbnRyeSBkZXRhaWxzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRyeS50eXBlIC0gVHlwZSBvZiBzaWduaW5nICh0cmFuc2FjdGlvbiwgcGVyc29uYWxfc2lnbiwgdHlwZWRfZGF0YSlcclxuICogQHBhcmFtIHtzdHJpbmd9IGVudHJ5LmFkZHJlc3MgLSBXYWxsZXQgYWRkcmVzcyB0aGF0IHNpZ25lZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkub3JpZ2luIC0gZEFwcCBvcmlnaW4gdGhhdCByZXF1ZXN0ZWQgdGhlIHNpZ25hdHVyZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkubWV0aG9kIC0gUlBDIG1ldGhvZCB1c2VkXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW50cnkuc3VjY2VzcyAtIFdoZXRoZXIgc2lnbmluZyBzdWNjZWVkZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS50eEhhc2hdIC0gVHJhbnNhY3Rpb24gaGFzaCAoZm9yIHRyYW5zYWN0aW9ucylcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS5lcnJvcl0gLSBFcnJvciBtZXNzYWdlIChpZiBmYWlsZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBsb2dTaWduaW5nT3BlcmF0aW9uKGVudHJ5KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGxvZ0VudHJ5ID0ge1xyXG4gICAgICAuLi5lbnRyeSxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdldCBleGlzdGluZyBsb2dcclxuICAgIGNvbnN0IGV4aXN0aW5nTG9nID0gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEFkZCBuZXcgZW50cnkgYXQgdGhlIGJlZ2lubmluZ1xyXG4gICAgZXhpc3RpbmdMb2cudW5zaGlmdChsb2dFbnRyeSk7XHJcblxyXG4gICAgLy8gVHJpbSB0byBtYXggZW50cmllc1xyXG4gICAgaWYgKGV4aXN0aW5nTG9nLmxlbmd0aCA+IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTKSB7XHJcbiAgICAgIGV4aXN0aW5nTG9nLmxlbmd0aCA9IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgbG9nXHJcbiAgICBhd2FpdCBzYXZlKFNJR05JTkdfTE9HX0tFWSwgZXhpc3RpbmdMb2cpO1xyXG5cclxuICAgIC8vIEFsc28gbG9nIHRvIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAgY29uc3QgaWNvbiA9IGVudHJ5LnN1Y2Nlc3MgPyAn4pyFJyA6ICfinYwnO1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgJHtpY29ufSBTaWduaW5nIGF1ZGl0OiAke2VudHJ5LnR5cGV9IGZyb20gJHtlbnRyeS5vcmlnaW59IC0gJHtlbnRyeS5zdWNjZXNzID8gJ1NVQ0NFU1MnIDogJ0ZBSUxFRCd9YCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIERvbid0IGxldCBsb2dnaW5nIGZhaWx1cmVzIGFmZmVjdCBzaWduaW5nIG9wZXJhdGlvbnNcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgbG9nZ2luZyBzaWduaW5nIG9wZXJhdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHNpZ25pbmcgYXVkaXQgbG9nXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gQXJyYXkgb2YgbG9nIGVudHJpZXNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNpZ25pbmdBdWRpdExvZygpIHtcclxuICByZXR1cm4gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG59XHJcblxyXG4vLyA9PT09PSBTRVNTSU9OIE1BTkFHRU1FTlQgPT09PT1cclxuLy8gU2Vzc2lvbiB0b2tlbnMgc3RvcmVkIGluIG1lbW9yeSAoY2xlYXJlZCB3aGVuIHNlcnZpY2Ugd29ya2VyIHRlcm1pbmF0ZXMpXHJcbi8vIFNFQ1VSSVRZIE5PVEU6IFNlcnZpY2Ugd29ya2VycyBjYW4gYmUgdGVybWluYXRlZCBieSBDaHJvbWUgYXQgYW55IHRpbWUsIHdoaWNoIGNsZWFycyBhbGxcclxuLy8gc2Vzc2lvbiBkYXRhLiBUaGlzIGlzIGludGVudGlvbmFsIC0gd2UgZG9uJ3Qgd2FudCBwYXNzd29yZHMgcGVyc2lzdGluZyBsb25nZXIgdGhhbiBuZWVkZWQuXHJcbi8vIFNlc3Npb25zIGFyZSBlbmNyeXB0ZWQgaW4gbWVtb3J5IGFzIGFuIGFkZGl0aW9uYWwgc2VjdXJpdHkgbGF5ZXIuXHJcbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpOyAvLyBzZXNzaW9uVG9rZW4gLT4geyBlbmNyeXB0ZWRQYXNzd29yZCwgd2FsbGV0SWQsIGV4cGlyZXNBdCwgc2FsdCB9XHJcblxyXG4vLyBTZXNzaW9uIGVuY3J5cHRpb24ga2V5IChyZWdlbmVyYXRlZCBvbiBzZXJ2aWNlIHdvcmtlciBzdGFydClcclxubGV0IHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHNlc3Npb24gZW5jcnlwdGlvbiBrZXkgdXNpbmcgV2ViIENyeXB0byBBUElcclxuICogS2V5IGlzIHJlZ2VuZXJhdGVkIGVhY2ggdGltZSBzZXJ2aWNlIHdvcmtlciBzdGFydHMgKG1lbW9yeSBvbmx5LCBuZXZlciBwZXJzaXN0ZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKSB7XHJcbiAgaWYgKCFzZXNzaW9uRW5jcnlwdGlvbktleSkge1xyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gMjU2LWJpdCBrZXkgZm9yIEFFUy1HQ00gZW5jcnlwdGlvblxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcclxuICAgICAgZmFsc2UsIC8vIE5vdCBleHRyYWN0YWJsZVxyXG4gICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY3J5cHRzIHBhc3N3b3JkIGZvciBzZXNzaW9uIHN0b3JhZ2UgdXNpbmcgQUVTLUdDTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBQYXNzd29yZCB0byBlbmNyeXB0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtlbmNyeXB0ZWQ6IEFycmF5QnVmZmVyLCBpdjogVWludDhBcnJheX0+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCkge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICBjb25zdCBwYXNzd29yZERhdGEgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcbiAgXHJcbiAgLy8gR2VuZXJhdGUgcmFuZG9tIElWIGZvciB0aGlzIGVuY3J5cHRpb25cclxuICAvLyBTRUNVUklUWTogSVYgdW5pcXVlbmVzcyBpcyBjcnlwdG9ncmFwaGljYWxseSBndWFyYW50ZWVkIGJ5IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKVxyXG4gIC8vIHdoaWNoIHVzZXMgdGhlIGJyb3dzZXIncyBDU1BSTkcgKENyeXB0b2dyYXBoaWNhbGx5IFNlY3VyZSBQc2V1ZG8tUmFuZG9tIE51bWJlciBHZW5lcmF0b3IpXHJcbiAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7XHJcbiAgXHJcbiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIHBhc3N3b3JkRGF0YVxyXG4gICk7XHJcbiAgXHJcbiAgcmV0dXJuIHsgZW5jcnlwdGVkLCBpdiB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVjcnlwdHMgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkIC0gRW5jcnlwdGVkIHBhc3N3b3JkIGRhdGFcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBpdiAtIEluaXRpYWxpemF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oZW5jcnlwdGVkLCBpdikge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIFxyXG4gIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBlbmNyeXB0ZWRcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuICByZXR1cm4gZGVjb2Rlci5kZWNvZGUoZGVjcnlwdGVkKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlc3Npb24gdG9rZW5cclxuZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBuZXcgc2Vzc2lvblxyXG4vLyBTRUNVUklUWTogRGVmYXVsdCBzZXNzaW9uIGR1cmF0aW9uIHJlZHVjZWQgdG8gMTUgbWludXRlcyB0byBtaW5pbWl6ZSBwYXNzd29yZCBleHBvc3VyZSBpbiBtZW1vcnlcclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihwYXNzd29yZCwgd2FsbGV0SWQsIGR1cmF0aW9uTXMgPSA5MDAwMDApIHsgLy8gRGVmYXVsdCAxNSBtaW51dGVzICh3YXMgMSBob3VyKVxyXG4gIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGdlbmVyYXRlU2Vzc2lvblRva2VuKCk7XHJcbiAgY29uc3QgZXhwaXJlc0F0ID0gRGF0ZS5ub3coKSArIGR1cmF0aW9uTXM7XHJcbiAgXHJcbiAgLy8gRW5jcnlwdCBwYXNzd29yZCBiZWZvcmUgc3RvcmluZyBpbiBtZW1vcnlcclxuICBjb25zdCB7IGVuY3J5cHRlZCwgaXYgfSA9IGF3YWl0IGVuY3J5cHRQYXNzd29yZEZvclNlc3Npb24ocGFzc3dvcmQpO1xyXG5cclxuICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvblRva2VuLCB7XHJcbiAgICBlbmNyeXB0ZWRQYXNzd29yZDogZW5jcnlwdGVkLFxyXG4gICAgaXY6IGl2LFxyXG4gICAgd2FsbGV0SWQsXHJcbiAgICBleHBpcmVzQXRcclxuICB9KTtcclxuXHJcbiAgLy8gQXV0by1jbGVhbnVwIGV4cGlyZWQgc2Vzc2lvblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvblRva2VuKTtcclxuICAgICAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgICAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZXNzaW9uIGV4cGlyZWQgYW5kIHJlbW92ZWQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIGR1cmF0aW9uTXMpO1xyXG5cclxuICAvLyBTZXNzaW9uIGNyZWF0ZWRcclxuICByZXR1cm4gc2Vzc2lvblRva2VuO1xyXG59XHJcblxyXG4vLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCByZXR1cm4gZGVjcnlwdGVkIHBhc3N3b3JkXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXNlc3Npb25Ub2tlbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBzZXNzaW9uIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcblxyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG9yIGV4cGlyZWQgc2Vzc2lvbicpO1xyXG4gIH1cclxuXHJcbiAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZXNzaW9uIGV4cGlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIERlY3J5cHQgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICByZXR1cm4gYXdhaXQgZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oc2Vzc2lvbi5lbmNyeXB0ZWRQYXNzd29yZCwgc2Vzc2lvbi5pdik7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgc2Vzc2lvblxyXG5mdW5jdGlvbiBpbnZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25Ub2tlbikpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgLy8gU2Vzc2lvbiBpbnZhbGlkYXRlZFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gSW52YWxpZGF0ZSBhbGwgc2Vzc2lvbnNcclxuZnVuY3Rpb24gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCkge1xyXG4gIGNvbnN0IGNvdW50ID0gYWN0aXZlU2Vzc2lvbnMuc2l6ZTtcclxuICBhY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xyXG4gIC8vIEFsbCBzZXNzaW9ucyBpbnZhbGlkYXRlZFxyXG4gIHJldHVybiBjb3VudDtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBleHRlbnNpb24gaW5zdGFsbGF0aW9uXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBpbnN0YWxsZWQnKTtcclxufSk7XHJcblxyXG4vLyBHZXQgY29ubmVjdGVkIHNpdGVzIGZyb20gc3RvcmFnZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlcygpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGxvYWQoQ09OTkVDVEVEX1NJVEVTX0tFWSk7XHJcbiAgcmV0dXJuIHNpdGVzIHx8IHt9O1xyXG59XHJcblxyXG4vLyBDaGVjayBpZiBhIHNpdGUgaXMgY29ubmVjdGVkXHJcbmFzeW5jIGZ1bmN0aW9uIGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgcmV0dXJuICEhc2l0ZXNbb3JpZ2luXTtcclxufVxyXG5cclxuLy8gQWRkIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gYWRkQ29ubmVjdGVkU2l0ZShvcmlnaW4sIGFjY291bnRzKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIHNpdGVzW29yaWdpbl0gPSB7XHJcbiAgICBhY2NvdW50cyxcclxuICAgIGNvbm5lY3RlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuICBhd2FpdCBzYXZlKENPTk5FQ1RFRF9TSVRFU19LRVksIHNpdGVzKTtcclxufVxyXG5cclxuLy8gUmVtb3ZlIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ29ubmVjdGVkU2l0ZShvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgZGVsZXRlIHNpdGVzW29yaWdpbl07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIEdldCBjdXJyZW50IG5ldHdvcmsgY2hhaW4gSURcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudENoYWluSWQoKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgcmV0dXJuIENIQUlOX0lEU1tuZXR3b3JrIHx8ICdwdWxzZWNoYWluVGVzdG5ldCddO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0IHJlcXVlc3RzIGZyb20gY29udGVudCBzY3JpcHRzXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVdhbGxldFJlcXVlc3QobWVzc2FnZSwgc2VuZGVyKSB7XHJcbiAgY29uc3QgeyBtZXRob2QsIHBhcmFtcyB9ID0gbWVzc2FnZTtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IEdldCBvcmlnaW4gZnJvbSBDaHJvbWUgQVBJLCBub3QgbWVzc2FnZSBwYXlsb2FkIChwcmV2ZW50cyBzcG9vZmluZylcclxuICBjb25zdCB1cmwgPSBuZXcgVVJMKHNlbmRlci51cmwpO1xyXG4gIGNvbnN0IG9yaWdpbiA9IHVybC5vcmlnaW47XHJcblxyXG4gIC8vIEhhbmRsaW5nIHdhbGxldCByZXF1ZXN0XHJcblxyXG4gIHRyeSB7XHJcbiAgICBzd2l0Y2ggKG1ldGhvZCkge1xyXG4gICAgICBjYXNlICdldGhfcmVxdWVzdEFjY291bnRzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlUmVxdWVzdEFjY291bnRzKG9yaWdpbiwgc2VuZGVyLnRhYik7XHJcblxyXG4gICAgICBjYXNlICdldGhfYWNjb3VudHMnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBY2NvdW50cyhvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2NoYWluSWQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVDaGFpbklkKCk7XHJcblxyXG4gICAgICBjYXNlICduZXRfdmVyc2lvbic6XHJcbiAgICAgICAgY29uc3QgY2hhaW5JZCA9IGF3YWl0IGhhbmRsZUNoYWluSWQoKTtcclxuICAgICAgICByZXR1cm4geyByZXN1bHQ6IHBhcnNlSW50KGNoYWluSWQucmVzdWx0LCAxNikudG9TdHJpbmcoKSB9O1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBZGRDaGFpbihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X3dhdGNoQXNzZXQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVXYXRjaEFzc2V0KHBhcmFtcywgb3JpZ2luLCBzZW5kZXIudGFiKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9ibG9ja051bWJlcic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUJsb2NrTnVtYmVyKCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmxvY2tCeU51bWJlcic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJsb2NrQnlOdW1iZXIocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCYWxhbmNlJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmFsYW5jZShwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uQ291bnQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfY2FsbCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUNhbGwocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9lc3RpbWF0ZUdhcyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUVzdGltYXRlR2FzKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2FzUHJpY2UnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHYXNQcmljZSgpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NlbmRUcmFuc2FjdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2VuZFJhd1RyYW5zYWN0aW9uJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25SZWNlaXB0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25SZWNlaXB0KHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25CeUhhc2gnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvbkJ5SGFzaChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldExvZ3MnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRMb2dzKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0Q29kZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldENvZGUocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCbG9ja0J5SGFzaCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJsb2NrQnlIYXNoKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVQZXJzb25hbFNpZ24ocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YSc6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGFfdjQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTaWduVHlwZWREYXRhKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDEsIG1lc3NhZ2U6IGBNZXRob2QgJHttZXRob2R9IG5vdCBzdXBwb3J0ZWRgIH0gfTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBoYW5kbGluZyByZXF1ZXN0OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3JlcXVlc3RBY2NvdW50cyAtIFJlcXVlc3QgcGVybWlzc2lvbiB0byBjb25uZWN0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHRhYikge1xyXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgY29ubmVjdGVkXHJcbiAgaWYgKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBbd2FsbGV0LmFkZHJlc3NdIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpO1xyXG4gICAgcGVuZGluZ0Nvbm5lY3Rpb25zLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRhYklkOiB0YWI/LmlkIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249Y29ubmVjdCZvcmlnaW49JHtlbmNvZGVVUklDb21wb25lbnQob3JpZ2luKX0mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ0Nvbm5lY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2FjY291bnRzIC0gR2V0IGNvbm5lY3RlZCBhY2NvdW50c1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBY2NvdW50cyhvcmlnaW4pIHtcclxuICAvLyBPbmx5IHJldHVybiBhY2NvdW50cyBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmIChhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIHJldHVybiB7IHJlc3VsdDogW3dhbGxldC5hZGRyZXNzXSB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBbXSB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2NoYWluSWQgLSBHZXQgY3VycmVudCBjaGFpbiBJRFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDaGFpbklkKCkge1xyXG4gIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBnZXRDdXJyZW50Q2hhaW5JZCgpO1xyXG4gIHJldHVybiB7IHJlc3VsdDogY2hhaW5JZCB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4gLSBTd2l0Y2ggdG8gYSBkaWZmZXJlbnQgbmV0d29ya1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdIHx8ICFwYXJhbXNbMF0uY2hhaW5JZCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXMnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHJlcXVlc3RlZENoYWluSWQgPSBwYXJhbXNbMF0uY2hhaW5JZDtcclxuICAvLyBTd2l0Y2hpbmcgY2hhaW5cclxuXHJcbiAgLy8gRmluZCBtYXRjaGluZyBuZXR3b3JrXHJcbiAgY29uc3QgbmV0d29ya01hcCA9IHtcclxuICAgICcweDNhZic6ICdwdWxzZWNoYWluVGVzdG5ldCcsXHJcbiAgICAnMHgzQUYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICAgJzB4MTcxJzogJ3B1bHNlY2hhaW4nLFxyXG4gICAgJzB4MSc6ICdldGhlcmV1bScsXHJcbiAgICAnMHhhYTM2YTcnOiAnc2Vwb2xpYScsXHJcbiAgICAnMHhBQTM2QTcnOiAnc2Vwb2xpYSdcclxuICB9O1xyXG5cclxuICBjb25zdCBuZXR3b3JrS2V5ID0gbmV0d29ya01hcFtyZXF1ZXN0ZWRDaGFpbklkXTtcclxuXHJcbiAgaWYgKCFuZXR3b3JrS2V5KSB7XHJcbiAgICAvLyBDaGFpbiBub3Qgc3VwcG9ydGVkIC0gcmV0dXJuIGVycm9yIGNvZGUgNDkwMiBzbyBkQXBwIGNhbiBjYWxsIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IDQ5MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ1VucmVjb2duaXplZCBjaGFpbiBJRC4gVHJ5IGFkZGluZyB0aGUgY2hhaW4gdXNpbmcgd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4uJ1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIGN1cnJlbnQgbmV0d29ya1xyXG4gIGF3YWl0IHNhdmUoJ2N1cnJlbnROZXR3b3JrJywgbmV0d29ya0tleSk7XHJcblxyXG4gIC8vIE5vdGlmeSBhbGwgdGFicyBhYm91dCBjaGFpbiBjaGFuZ2VcclxuICBjb25zdCBuZXdDaGFpbklkID0gQ0hBSU5fSURTW25ldHdvcmtLZXldO1xyXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCAodGFicykgPT4ge1xyXG4gICAgdGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xyXG4gICAgICAgIHR5cGU6ICdDSEFJTl9DSEFOR0VEJyxcclxuICAgICAgICBjaGFpbklkOiBuZXdDaGFpbklkXHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQsIGlnbm9yZSBlcnJvclxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4geyByZXN1bHQ6IG51bGwgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluIC0gQWRkIGEgbmV3IG5ldHdvcmsgKHNpbXBsaWZpZWQgdmVyc2lvbilcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWRkQ2hhaW4ocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSB8fCAhcGFyYW1zWzBdLmNoYWluSWQpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBjaGFpbkluZm8gPSBwYXJhbXNbMF07XHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgUmVxdWVzdCB0byBhZGQgY2hhaW46JywgY2hhaW5JbmZvKTtcclxuXHJcbiAgLy8gRm9yIG5vdywgb25seSBzdXBwb3J0IG91ciBwcmVkZWZpbmVkIGNoYWluc1xyXG4gIC8vIENoZWNrIGlmIGl0J3Mgb25lIG9mIG91ciBzdXBwb3J0ZWQgY2hhaW5zXHJcbiAgY29uc3Qgc3VwcG9ydGVkQ2hhaW5zID0ge1xyXG4gICAgJzB4M2FmJzogdHJ1ZSxcclxuICAgICcweDNBRic6IHRydWUsXHJcbiAgICAnMHgxNzEnOiB0cnVlLFxyXG4gICAgJzB4MSc6IHRydWUsXHJcbiAgICAnMHhhYTM2YTcnOiB0cnVlLFxyXG4gICAgJzB4QUEzNkE3JzogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIGlmIChzdXBwb3J0ZWRDaGFpbnNbY2hhaW5JbmZvLmNoYWluSWRdKSB7XHJcbiAgICAvLyBDaGFpbiBpcyBhbHJlYWR5IHN1cHBvcnRlZCwganVzdCBzd2l0Y2ggdG8gaXRcclxuICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihbeyBjaGFpbklkOiBjaGFpbkluZm8uY2hhaW5JZCB9XSk7XHJcbiAgfVxyXG5cclxuICAvLyBDdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0XHJcbiAgcmV0dXJuIHtcclxuICAgIGVycm9yOiB7XHJcbiAgICAgIGNvZGU6IC0zMjYwMyxcclxuICAgICAgbWVzc2FnZTogJ0FkZGluZyBjdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0LiBPbmx5IFB1bHNlQ2hhaW4gYW5kIEV0aGVyZXVtIG5ldHdvcmtzIGFyZSBzdXBwb3J0ZWQuJ1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBjb25uZWN0aW9uIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQpIHtcclxuICBpZiAoIXBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4gfSA9IHBlbmRpbmdDb25uZWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICBwZW5kaW5nQ29ubmVjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmIChhcHByb3ZlZCkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIC8vIFNhdmUgY29ubmVjdGVkIHNpdGVcclxuICAgICAgYXdhaXQgYWRkQ29ubmVjdGVkU2l0ZShvcmlnaW4sIFt3YWxsZXQuYWRkcmVzc10pO1xyXG5cclxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcGVuZGluZyBwcm9taXNlXHJcbiAgICAgIHJlc29sdmUoeyByZXN1bHQ6IFt3YWxsZXQuYWRkcmVzc10gfSk7XHJcblxyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZWplY3QobmV3IEVycm9yKCdObyBhY3RpdmUgd2FsbGV0JykpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBhY3RpdmUgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIGNvbm5lY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGNvbm5lY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRDb25uZWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiB9ID0gcGVuZGluZ0Nvbm5lY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGtleVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50TmV0d29yaygpIHtcclxuICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKTtcclxuICByZXR1cm4gbmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2Jsb2NrTnVtYmVyIC0gR2V0IGN1cnJlbnQgYmxvY2sgbnVtYmVyXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJsb2NrTnVtYmVyKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gYXdhaXQgcnBjLmdldEJsb2NrTnVtYmVyKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9ja051bWJlciB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCbG9ja0J5TnVtYmVyIC0gR2V0IGJsb2NrIGJ5IG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgbnVtYmVyIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgaW5jbHVkZVRyYW5zYWN0aW9ucyA9IHBhcmFtc1sxXSB8fCBmYWxzZTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBycGMuZ2V0QmxvY2tCeU51bWJlcihuZXR3b3JrLCBibG9ja051bWJlciwgaW5jbHVkZVRyYW5zYWN0aW9ucyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgbnVtYmVyOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldEJhbGFuY2UgLSBHZXQgYmFsYW5jZSBmb3IgYW4gYWRkcmVzc1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBiYWxhbmNlID0gYXdhaXQgcnBjLmdldEJhbGFuY2UobmV0d29yaywgYWRkcmVzcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJhbGFuY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQ291bnQgLSBHZXQgdHJhbnNhY3Rpb24gY291bnQgKG5vbmNlKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBjb3VudCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb3VudCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGNvdW50OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dhc1ByaWNlIC0gR2V0IGN1cnJlbnQgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdhc1ByaWNlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXNQcmljZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9lc3RpbWF0ZUdhcyAtIEVzdGltYXRlIGdhcyBmb3IgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgZ2FzID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGdhcyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jYWxsIC0gRXhlY3V0ZSBhIHJlYWQtb25seSBjYWxsXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbGwocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJwYy5jYWxsKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXhlY3V0aW5nIGNhbGw6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFJhd1RyYW5zYWN0aW9uIC0gU2VuZCBhIHByZS1zaWduZWQgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3Npbmcgc2lnbmVkIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNpZ25lZFR4ID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBhd2FpdCBycGMuc2VuZFJhd1RyYW5zYWN0aW9uKG5ldHdvcmssIHNpZ25lZFR4KTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogdHhIYXNoIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgcmF3IHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCAtIEdldCB0cmFuc2FjdGlvbiByZWNlaXB0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgdHhIYXNoID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uUmVjZWlwdChuZXR3b3JrLCB0eEhhc2gpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiByZWNlaXB0IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gcmVjZWlwdDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvbkJ5SGFzaCAtIEdldCB0cmFuc2FjdGlvbiBieSBoYXNoXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoKG5ldHdvcmssIHR4SGFzaCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHR4IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gYnkgaGFzaDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0TG9ncyhwYXJhbXMpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGxvZ3MgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0TG9ncycsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGxvZ3MgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBsb2dzOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRDb2RlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgY29kZSA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRDb2RlJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogY29kZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGNvZGU6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEJsb2NrQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0QmxvY2tCeUhhc2gnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9jayB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIGJ5IGhhc2g6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFBlbmRpbmcgdHJhbnNhY3Rpb24gcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luIH0pXHJcbmNvbnN0IHBlbmRpbmdUcmFuc2FjdGlvbnMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyBQZW5kaW5nIHRva2VuIGFkZCByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRva2VuSW5mbyB9KVxyXG5jb25zdCBwZW5kaW5nVG9rZW5SZXF1ZXN0cyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vIFBlbmRpbmcgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSlcclxuY29uc3QgcGVuZGluZ1NpZ25SZXF1ZXN0cyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vID09PT09IFJBVEUgTElNSVRJTkcgPT09PT1cclxuLy8gUHJldmVudHMgbWFsaWNpb3VzIGRBcHBzIGZyb20gc3BhbW1pbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVxdWVzdHNcclxuY29uc3QgcmF0ZUxpbWl0TWFwID0gbmV3IE1hcCgpOyAvLyBvcmlnaW4gLT4geyBjb3VudCwgd2luZG93U3RhcnQsIHBlbmRpbmdDb3VudCB9XHJcblxyXG5jb25zdCBSQVRFX0xJTUlUX0NPTkZJRyA9IHtcclxuICBNQVhfUEVORElOR19SRVFVRVNUUzogNSwgLy8gTWF4IHBlbmRpbmcgcmVxdWVzdHMgcGVyIG9yaWdpblxyXG4gIE1BWF9SRVFVRVNUU19QRVJfV0lORE9XOiAyMCwgLy8gTWF4IHRvdGFsIHJlcXVlc3RzIHBlciB0aW1lIHdpbmRvd1xyXG4gIFRJTUVfV0lORE9XX01TOiA2MDAwMCAvLyAxIG1pbnV0ZSB3aW5kb3dcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYW4gb3JpZ2luIGhhcyBleGNlZWRlZCByYXRlIGxpbWl0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBjaGVja1xyXG4gKiBAcmV0dXJucyB7eyBhbGxvd2VkOiBib29sZWFuLCByZWFzb24/OiBzdHJpbmcgfX1cclxuICovXHJcbmZ1bmN0aW9uIGNoZWNrUmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgXHJcbiAgLy8gR2V0IG9yIGNyZWF0ZSByYXRlIGxpbWl0IGVudHJ5IGZvciB0aGlzIG9yaWdpblxyXG4gIGlmICghcmF0ZUxpbWl0TWFwLmhhcyhvcmlnaW4pKSB7XHJcbiAgICByYXRlTGltaXRNYXAuc2V0KG9yaWdpbiwge1xyXG4gICAgICBjb3VudDogMCxcclxuICAgICAgd2luZG93U3RhcnQ6IG5vdyxcclxuICAgICAgcGVuZGluZ0NvdW50OiAwXHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIFxyXG4gIC8vIFJlc2V0IHdpbmRvdyBpZiBleHBpcmVkXHJcbiAgaWYgKG5vdyAtIGxpbWl0RGF0YS53aW5kb3dTdGFydCA+IFJBVEVfTElNSVRfQ09ORklHLlRJTUVfV0lORE9XX01TKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQgPSAwO1xyXG4gICAgbGltaXREYXRhLndpbmRvd1N0YXJ0ID0gbm93O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayBwZW5kaW5nIHJlcXVlc3RzIGxpbWl0XHJcbiAgaWYgKGxpbWl0RGF0YS5wZW5kaW5nQ291bnQgPj0gUkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFMpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFsbG93ZWQ6IGZhbHNlLFxyXG4gICAgICByZWFzb246IGBUb28gbWFueSBwZW5kaW5nIHJlcXVlc3RzLiBNYXhpbXVtICR7UkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFN9IHBlbmRpbmcgcmVxdWVzdHMgYWxsb3dlZC5gXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayB0b3RhbCByZXF1ZXN0cyBpbiB3aW5kb3dcclxuICBpZiAobGltaXREYXRhLmNvdW50ID49IFJBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhbGxvd2VkOiBmYWxzZSxcclxuICAgICAgcmVhc29uOiBgUmF0ZSBsaW1pdCBleGNlZWRlZC4gTWF4aW11bSAke1JBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XfSByZXF1ZXN0cyBwZXIgbWludXRlLmBcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHJldHVybiB7IGFsbG93ZWQ6IHRydWUgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluY3JlbWVudHMgcmF0ZSBsaW1pdCBjb3VudGVycyBmb3IgYW4gb3JpZ2luXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGluY3JlbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gaW5jcmVtZW50UmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBpZiAobGltaXREYXRhKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQrKztcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQrKztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWNyZW1lbnRzIHBlbmRpbmcgY291bnRlciB3aGVuIHJlcXVlc3QgaXMgcmVzb2x2ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gZGVjcmVtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKSB7XHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIGlmIChsaW1pdERhdGEgJiYgbGltaXREYXRhLnBlbmRpbmdDb3VudCA+IDApIHtcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQtLTtcclxuICB9XHJcbn1cclxuXHJcbi8vIENsZWFuIHVwIG9sZCByYXRlIGxpbWl0IGVudHJpZXMgZXZlcnkgNSBtaW51dGVzXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW29yaWdpbiwgZGF0YV0gb2YgcmF0ZUxpbWl0TWFwLmVudHJpZXMoKSkge1xyXG4gICAgaWYgKG5vdyAtIGRhdGEud2luZG93U3RhcnQgPiBSQVRFX0xJTUlUX0NPTkZJRy5USU1FX1dJTkRPV19NUyAqIDUgJiYgZGF0YS5wZW5kaW5nQ291bnQgPT09IDApIHtcclxuICAgICAgcmF0ZUxpbWl0TWFwLmRlbGV0ZShvcmlnaW4pO1xyXG4gICAgfVxyXG4gIH1cclxufSwgMzAwMDAwKTtcclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIFJFUExBWSBQUk9URUNUSU9OID09PT09XHJcbi8vIFByZXZlbnRzIHRoZSBzYW1lIHRyYW5zYWN0aW9uIGFwcHJvdmFsIGZyb20gYmVpbmcgdXNlZCBtdWx0aXBsZSB0aW1lc1xyXG5jb25zdCBwcm9jZXNzZWRBcHByb3ZhbHMgPSBuZXcgTWFwKCk7IC8vIGFwcHJvdmFsVG9rZW4gLT4geyB0aW1lc3RhbXAsIHR4SGFzaCwgdXNlZDogdHJ1ZSB9XHJcblxyXG5jb25zdCBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcgPSB7XHJcbiAgQVBQUk9WQUxfVElNRU9VVDogMzAwMDAwLCAvLyA1IG1pbnV0ZXMgLSBhcHByb3ZhbCBleHBpcmVzIGFmdGVyIHRoaXNcclxuICBDTEVBTlVQX0lOVEVSVkFMOiA2MDAwMCAgIC8vIDEgbWludXRlIC0gY2xlYW4gdXAgb2xkIGFwcHJvdmFsc1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlblxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBVbmlxdWUgYXBwcm92YWwgdG9rZW5cclxuICovXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQXBwcm92YWxUb2tlbigpIHtcclxuICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KDMyKTtcclxuICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcclxuICByZXR1cm4gQXJyYXkuZnJvbShhcnJheSwgYnl0ZSA9PiBieXRlLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhbmQgbWFya3MgYW4gYXBwcm92YWwgdG9rZW4gYXMgdXNlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBwcm92YWxUb2tlbiAtIFRva2VuIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbGlkIGFuZCBub3QgeWV0IHVzZWRcclxuICovXHJcbmZ1bmN0aW9uIHZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSB7XHJcbiAgaWYgKCFhcHByb3ZhbFRva2VuKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgTm8gYXBwcm92YWwgdG9rZW4gcHJvdmlkZWQnKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgYXBwcm92YWwgPSBwcm9jZXNzZWRBcHByb3ZhbHMuZ2V0KGFwcHJvdmFsVG9rZW4pO1xyXG4gIFxyXG4gIGlmICghYXBwcm92YWwpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBVbmtub3duIGFwcHJvdmFsIHRva2VuJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIGlmIChhcHByb3ZhbC51c2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQXBwcm92YWwgdG9rZW4gYWxyZWFkeSB1c2VkIC0gcHJldmVudGluZyByZXBsYXkgYXR0YWNrJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIGlmIGFwcHJvdmFsIGhhcyBleHBpcmVkXHJcbiAgY29uc3QgYWdlID0gRGF0ZS5ub3coKSAtIGFwcHJvdmFsLnRpbWVzdGFtcDtcclxuICBpZiAoYWdlID4gUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkFQUFJPVkFMX1RJTUVPVVQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBBcHByb3ZhbCB0b2tlbiBleHBpcmVkJyk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKGFwcHJvdmFsVG9rZW4pO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBcclxuICAvLyBNYXJrIGFzIHVzZWRcclxuICBhcHByb3ZhbC51c2VkID0gdHJ1ZTtcclxuICBhcHByb3ZhbC51c2VkQXQgPSBEYXRlLm5vdygpO1xyXG4gIGNvbnNvbGUubG9nKCfwn6uAIEFwcHJvdmFsIHRva2VuIHZhbGlkYXRlZCBhbmQgbWFya2VkIGFzIHVzZWQnKTtcclxuICBcclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLy8gQ2xlYW4gdXAgb2xkIHByb2Nlc3NlZCBhcHByb3ZhbHMgZXZlcnkgbWludXRlXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW3Rva2VuLCBhcHByb3ZhbF0gb2YgcHJvY2Vzc2VkQXBwcm92YWxzLmVudHJpZXMoKSkge1xyXG4gICAgY29uc3QgYWdlID0gbm93IC0gYXBwcm92YWwudGltZXN0YW1wO1xyXG4gICAgaWYgKGFnZSA+IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5BUFBST1ZBTF9USU1FT1VUICogMikge1xyXG4gICAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKHRva2VuKTtcclxuICAgIH1cclxuICB9XHJcbn0sIFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5DTEVBTlVQX0lOVEVSVkFMKTtcclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFRyYW5zYWN0aW9uIC0gU2lnbiBhbmQgc2VuZCBhIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogQ2hlY2sgcmF0ZSBsaW1pdCB0byBwcmV2ZW50IHNwYW1cclxuICBjb25zdCByYXRlTGltaXRDaGVjayA9IGNoZWNrUmF0ZUxpbWl0KG9yaWdpbik7XHJcbiAgaWYgKCFyYXRlTGltaXRDaGVjay5hbGxvd2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgUmF0ZSBsaW1pdCBleGNlZWRlZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MjAwLCBtZXNzYWdlOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShyYXRlTGltaXRDaGVjay5yZWFzb24pIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHR4UmVxdWVzdCA9IHBhcmFtc1swXTtcclxuXHJcbiAgLy8gR2V0IGN1cnJlbnQgbmV0d29yayBmcm9tIHN0b3JhZ2VcclxuICBjb25zdCBjdXJyZW50TmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJykgfHwgJ3B1bHNlY2hhaW4nO1xyXG5cclxuICAvLyBEeW5hbWljYWxseSBmZXRjaCBjdXJyZW50IGdhcyBwcmljZSBhbmQgdXNlIDN4IGFzIG1heCAodG8gYWxsb3cgZm9yIHZvbGF0aWxpdHkpXHJcbiAgbGV0IG1heEdhc1ByaWNlR3dlaTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgY3VycmVudEdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKGN1cnJlbnROZXR3b3JrKTtcclxuICAgIGNvbnN0IGN1cnJlbnRHYXNQcmljZUd3ZWkgPSBOdW1iZXIoQmlnSW50KGN1cnJlbnRHYXNQcmljZSkpIC8gMWU5O1xyXG4gICAgLy8gVXNlIDN4IGN1cnJlbnQgcHJpY2UgYXMgbWF4IHRvIGFsbG93IGZvciBuZXR3b3JrIHZvbGF0aWxpdHlcclxuICAgIG1heEdhc1ByaWNlR3dlaSA9IE1hdGguY2VpbChjdXJyZW50R2FzUHJpY2VHd2VpICogMyk7XHJcbiAgICAvLyBFbnN1cmUgbWluaW11bSBvZiAxMDAgR3dlaSBmb3IgdmVyeSBsb3cgZ2FzIG5ldHdvcmtzXHJcbiAgICBtYXhHYXNQcmljZUd3ZWkgPSBNYXRoLm1heChtYXhHYXNQcmljZUd3ZWksIDEwMCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUud2FybignRmFpbGVkIHRvIGZldGNoIGdhcyBwcmljZSwgdXNpbmcgaGlnaCBkZWZhdWx0OicsIGVycm9yKTtcclxuICAgIC8vIElmIHdlIGNhbid0IGZldGNoIGdhcyBwcmljZSwgdXNlIGEgdmVyeSBoaWdoIGRlZmF1bHQgdG8gYXZvaWQgYmxvY2tpbmcgdHJhbnNhY3Rpb25zXHJcbiAgICBtYXhHYXNQcmljZUd3ZWkgPSAxMDAwMDAwMDsgLy8gMTBNIEd3ZWkgLSBlc3NlbnRpYWxseSBubyBsaW1pdFxyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IENvbXByZWhlbnNpdmUgdHJhbnNhY3Rpb24gdmFsaWRhdGlvblxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCB0cmFuc2FjdGlvbiBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3JzKTtcclxuICAgIHJldHVybiB7IFxyXG4gICAgICBlcnJvcjogeyBcclxuICAgICAgICBjb2RlOiAtMzI2MDIsIFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHRyYW5zYWN0aW9uOiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcnMuam9pbignOyAnKSkgXHJcbiAgICAgIH0gXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVXNlIHNhbml0aXplZCB0cmFuc2FjdGlvbiBwYXJhbWV0ZXJzXHJcbiAgY29uc3Qgc2FuaXRpemVkVHggPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gSW5jcmVtZW50IHJhdGUgbGltaXQgY291bnRlclxyXG4gIGluY3JlbWVudFJhdGVMaW1pdChvcmlnaW4pO1xyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpO1xyXG4gICAgXHJcbiAgICAvLyBTRUNVUklUWTogR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gU3RvcmUgc2FuaXRpemVkIHRyYW5zYWN0aW9uIGluc3RlYWQgb2Ygb3JpZ2luYWwgcmVxdWVzdFxyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5zZXQocmVxdWVzdElkLCB7IFxyXG4gICAgICByZXNvbHZlLCBcclxuICAgICAgcmVqZWN0LCBcclxuICAgICAgb3JpZ2luLCBcclxuICAgICAgdHhSZXF1ZXN0OiBzYW5pdGl6ZWRUeCxcclxuICAgICAgYXBwcm92YWxUb2tlbiAgLy8gSW5jbHVkZSB0b2tlbiBmb3IgdmFsaWRhdGlvblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj10cmFuc2FjdGlvbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdUcmFuc2FjdGlvbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB0cmFuc2FjdGlvbiBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2Vzc2lvblRva2VuLCBnYXNQcmljZSwgY3VzdG9tTm9uY2UsIHR4SGFzaCwgdHhEZXRhaWxzID0gbnVsbCkge1xyXG4gIGlmICghcGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHR4UmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1RyYW5zYWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIERlY3JlbWVudCBwZW5kaW5nIGNvdW50ZXIgKHJlcXVlc3QgY29tcGxldGVkKVxyXG4gIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRyYW5zYWN0aW9uJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBJZiB0eEhhc2ggaXMgcHJvdmlkZWQsIHRyYW5zYWN0aW9uIHdhcyBhbHJlYWR5IHNpZ25lZCBhbmQgYnJvYWRjYXN0IGluIHRoZSBwb3B1cFxyXG4gICAgLy8gKGJ5IGhhcmR3YXJlIHdhbGxldCBPUiBzb2Z0d2FyZSB3YWxsZXQpLiBKdXN0IHNhdmUgdG8gaGlzdG9yeSBhbmQgcmVzb2x2ZS5cclxuICAgIGlmICh0eEhhc2gpIHtcclxuICAgICAgY29uc3Qgd2FsbGV0VHlwZSA9IHR4RGV0YWlscyA/ICdzb2Z0d2FyZScgOiAnaGFyZHdhcmUnO1xyXG4gICAgICBjb25zb2xlLmxvZyhg8J+rgCAke3dhbGxldFR5cGV9IHdhbGxldCB0cmFuc2FjdGlvbiBhbHJlYWR5IGJyb2FkY2FzdDpgLCB0eEhhc2gpO1xyXG5cclxuICAgICAgLy8gR2V0IGFjdGl2ZSB3YWxsZXQgZm9yIHNhdmluZyB0byBoaXN0b3J5XHJcbiAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSAodXNlIHR4RGV0YWlscyBpZiBwcm92aWRlZCBmb3IgYWNjdXJhdGUgZGF0YSlcclxuICAgICAgY29uc3QgaGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICAgIGhhc2g6IHR4SGFzaCxcclxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgZnJvbTogYWN0aXZlV2FsbGV0LmFkZHJlc3MsXHJcbiAgICAgICAgdG86IHR4RGV0YWlscz8udG8gfHwgdHhSZXF1ZXN0LnRvIHx8IG51bGwsXHJcbiAgICAgICAgdmFsdWU6IHR4RGV0YWlscz8udmFsdWUgfHwgdHhSZXF1ZXN0LnZhbHVlIHx8ICcwJyxcclxuICAgICAgICBkYXRhOiB0eERldGFpbHM/LmRhdGEgfHwgdHhSZXF1ZXN0LmRhdGEgfHwgJzB4JyxcclxuICAgICAgICBnYXNQcmljZTogdHhEZXRhaWxzPy5nYXNQcmljZSB8fCAnMCcsXHJcbiAgICAgICAgZ2FzTGltaXQ6IHR4RGV0YWlscz8uZ2FzTGltaXQgfHwgdHhSZXF1ZXN0Lmdhc0xpbWl0IHx8IHR4UmVxdWVzdC5nYXMgfHwgbnVsbCxcclxuICAgICAgICBub25jZTogdHhEZXRhaWxzPy5ub25jZSA/PyBudWxsLFxyXG4gICAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgICAgdHlwZTogdHhIaXN0b3J5LlRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBJbmNsdWRlIEVJUC0xNTU5IGZpZWxkcyBpZiBwcm92aWRlZCAobmVlZGVkIGZvciBzcGVlZC11cC9jYW5jZWwpXHJcbiAgICAgIGlmICh0eERldGFpbHM/Lm1heEZlZVBlckdhcykge1xyXG4gICAgICAgIGhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSB0eERldGFpbHMubWF4RmVlUGVyR2FzO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eERldGFpbHM/Lm1heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgaGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gdHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkoYWN0aXZlV2FsbGV0LmFkZHJlc3MsIGhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgICAvLyBTZW5kIGRlc2t0b3Agbm90aWZpY2F0aW9uXHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNlbnQnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBzZW50OiAke3R4SGFzaC5zbGljZSgwLCAyMCl9Li4uYCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgdHJhbnNhY3Rpb24gZm9yIGNvbmZpcm1hdGlvblxyXG4gICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgd2FpdEZvckNvbmZpcm1hdGlvbih7IGhhc2g6IHR4SGFzaCB9LCBwcm92aWRlciwgYWN0aXZlV2FsbGV0LmFkZHJlc3MpO1xyXG5cclxuICAgICAgLy8gTG9nIHN1Y2Nlc3NmdWwgc2lnbmluZyBvcGVyYXRpb25cclxuICAgICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgICAgdHlwZTogJ3RyYW5zYWN0aW9uJyxcclxuICAgICAgICBhZGRyZXNzOiBhY3RpdmVXYWxsZXQuYWRkcmVzcyxcclxuICAgICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgICBtZXRob2Q6ICdldGhfc2VuZFRyYW5zYWN0aW9uJyxcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIHR4SGFzaDogdHhIYXNoLFxyXG4gICAgICAgIHdhbGxldFR5cGU6IHdhbGxldFR5cGVcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBSZXNvbHZlIHdpdGggdHJhbnNhY3Rpb24gaGFzaFxyXG4gICAgICByZXNvbHZlKHsgcmVzdWx0OiB0eEhhc2ggfSk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaCB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNvZnR3YXJlIHdhbGxldCBmbG93IC0gdmFsaWRhdGUgc2Vzc2lvbiBhbmQgZ2V0IHBhc3N3b3JkIChub3cgYXN5bmMpXHJcbiAgICBsZXQgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuICAgIGxldCBzaWduZXIgPSBudWxsO1xyXG4gICAgbGV0IGNvbm5lY3RlZFNpZ25lciA9IG51bGw7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgIC8vIFVubG9jayB3YWxsZXQgd2l0aCBhdXRvLXVwZ3JhZGUgbm90aWZpY2F0aW9uXHJcbiAgICBjb25zdCB1bmxvY2tSZXN1bHQgPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgLy8gTm90aWZ5IHVzZXIgdGhhdCB3YWxsZXQgZW5jcnlwdGlvbiBpcyBiZWluZyB1cGdyYWRlZFxyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldCBlbmNyeXB0aW9uOiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9uc2ApO1xyXG4gICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICB0aXRsZTogJ/CflJAgU2VjdXJpdHkgVXBncmFkZSBpbiBQcm9ncmVzcycsXHJcbiAgICAgICAgICBtZXNzYWdlOiBgVXBncmFkaW5nIHdhbGxldCBlbmNyeXB0aW9uIHRvICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9ucyBmb3IgZW5oYW5jZWQgc2VjdXJpdHkuLi5gLFxyXG4gICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgc2lnbmVyID0gdW5sb2NrUmVzdWx0LnNpZ25lcjtcclxuICAgIGNvbnN0IHsgdXBncmFkZWQsIGl0ZXJhdGlvbnNCZWZvcmUsIGl0ZXJhdGlvbnNBZnRlciB9ID0gdW5sb2NrUmVzdWx0O1xyXG5cclxuICAgIC8vIFNob3cgY29tcGxldGlvbiBub3RpZmljYXRpb24gaWYgdXBncmFkZSBvY2N1cnJlZFxyXG4gICAgaWYgKHVwZ3JhZGVkKSB7XHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ+KchSBTZWN1cml0eSBVcGdyYWRlIENvbXBsZXRlJyxcclxuICAgICAgICBtZXNzYWdlOiBgV2FsbGV0IGVuY3J5cHRpb24gdXBncmFkZWQ6ICR7aXRlcmF0aW9uc0JlZm9yZS50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpdGVyYXRpb25zQWZ0ZXIudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9uc2AsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IGN1cnJlbnQgbmV0d29ya1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBDb25uZWN0IHNpZ25lciB0byBwcm92aWRlclxyXG4gICAgY29ubmVjdGVkU2lnbmVyID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIFByZXBhcmUgdHJhbnNhY3Rpb24gLSBjcmVhdGUgYSBjbGVhbiBjb3B5IHdpdGggb25seSBuZWNlc3NhcnkgZmllbGRzXHJcbiAgICBjb25zdCB0eFRvU2VuZCA9IHtcclxuICAgICAgdG86IHR4UmVxdWVzdC50byxcclxuICAgICAgdmFsdWU6IHR4UmVxdWVzdC52YWx1ZSB8fCAnMHgwJyxcclxuICAgICAgZGF0YTogdHhSZXF1ZXN0LmRhdGEgfHwgJzB4J1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBOb25jZSBoYW5kbGluZyBwcmlvcml0eTpcclxuICAgIC8vIDEuIFVzZXItcHJvdmlkZWQgY3VzdG9tIG5vbmNlIChmb3IgcmVwbGFjaW5nIHN0dWNrIHRyYW5zYWN0aW9ucylcclxuICAgIC8vIDIuIERBcHAtcHJvdmlkZWQgbm9uY2UgKHZhbGlkYXRlZClcclxuICAgIC8vIDMuIEF1dG8tZmV0Y2ggYnkgZXRoZXJzLmpzXHJcbiAgICBpZiAoY3VzdG9tTm9uY2UgIT09IHVuZGVmaW5lZCAmJiBjdXN0b21Ob25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBVc2VyIG1hbnVhbGx5IHNldCBub25jZSAoZS5nLiwgdG8gcmVwbGFjZSBzdHVjayB0cmFuc2FjdGlvbilcclxuICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25Db3VudChzaWduZXIuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuXHJcbiAgICAgIGlmIChjdXN0b21Ob25jZSA8IGN1cnJlbnROb25jZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ3VzdG9tIG5vbmNlICR7Y3VzdG9tTm9uY2V9IGlzIGxlc3MgdGhhbiBjdXJyZW50IG5vbmNlICR7Y3VycmVudE5vbmNlfS4gVGhpcyBtYXkgZmFpbCB1bmxlc3MgeW91J3JlIHJlcGxhY2luZyBhIHBlbmRpbmcgdHJhbnNhY3Rpb24uYCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR4VG9TZW5kLm5vbmNlID0gY3VzdG9tTm9uY2U7XHJcbiAgICAgIC8vIFVzaW5nIGN1c3RvbSBub25jZVxyXG4gICAgfSBlbHNlIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgLy8gU0VDVVJJVFk6IFZhbGlkYXRlIG5vbmNlIGlmIHByb3ZpZGVkIGJ5IERBcHBcclxuICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25Db3VudChzaWduZXIuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgICAgY29uc3QgcHJvdmlkZWROb25jZSA9IHR5cGVvZiB0eFJlcXVlc3Qubm9uY2UgPT09ICdzdHJpbmcnXHJcbiAgICAgICAgPyBwYXJzZUludCh0eFJlcXVlc3Qubm9uY2UsIDE2KVxyXG4gICAgICAgIDogdHhSZXF1ZXN0Lm5vbmNlO1xyXG5cclxuICAgICAgLy8gTm9uY2UgbXVzdCBiZSA+PSBjdXJyZW50IHBlbmRpbmcgbm9uY2VcclxuICAgICAgaWYgKHByb3ZpZGVkTm9uY2UgPCBjdXJyZW50Tm9uY2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgbm9uY2U6ICR7cHJvdmlkZWROb25jZX0gaXMgbGVzcyB0aGFuIGN1cnJlbnQgbm9uY2UgJHtjdXJyZW50Tm9uY2V9YCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR4VG9TZW5kLm5vbmNlID0gcHJvdmlkZWROb25jZTtcclxuICAgICAgLy8gVXNpbmcgREFwcC1wcm92aWRlZCBub25jZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gSWYgbm8gbm9uY2UgcHJvdmlkZWQsIGV0aGVycy5qcyB3aWxsIGZldGNoIHRoZSBjb3JyZWN0IG9uZSBhdXRvbWF0aWNhbGx5XHJcbiAgICAgIC8vIEF1dG8tZmV0Y2hpbmcgbm9uY2VcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBEQXBwIHByb3ZpZGVkIGEgZ2FzIGxpbWl0LCB1c2UgaXQuIE90aGVyd2lzZSBsZXQgZXRoZXJzIGVzdGltYXRlLlxyXG4gICAgaWYgKHR4UmVxdWVzdC5nYXMgfHwgdHhSZXF1ZXN0Lmdhc0xpbWl0KSB7XHJcbiAgICAgIHR4VG9TZW5kLmdhc0xpbWl0ID0gdHhSZXF1ZXN0LmdhcyB8fCB0eFJlcXVlc3QuZ2FzTGltaXQ7XHJcbiAgICAgIC8vIFVzaW5nIHByb3ZpZGVkIGdhcyBsaW1pdFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFwcGx5IHVzZXItc2VsZWN0ZWQgZ2FzIHByaWNlIGlmIHByb3ZpZGVkLCBvciB1c2Ugc2FmZSBuZXR3b3JrIGdhcyBwcmljZVxyXG4gICAgaWYgKGdhc1ByaWNlKSB7XHJcbiAgICAgIC8vIFVzZSB1c2VyLXNlbGVjdGVkIGdhcyBwcmljZSBmcm9tIFVJXHJcbiAgICAgIHR4VG9TZW5kLmdhc1ByaWNlID0gZ2FzUHJpY2U7XHJcbiAgICAgIC8vIFVzaW5nIGN1c3RvbSBnYXMgcHJpY2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEZhbGxiYWNrOiBGZXRjaCBzYWZlIGdhcyBwcmljZSAoYmFzZSBmZWUgKiAyKSB0byBwcmV2ZW50IHN0dWNrIHRyYW5zYWN0aW9uc1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHNhZmVHYXNQcmljZUhleCA9IGF3YWl0IHJwYy5nZXRTYWZlR2FzUHJpY2UobmV0d29yayk7XHJcbiAgICAgICAgdHhUb1NlbmQuZ2FzUHJpY2UgPSBCaWdJbnQoc2FmZUdhc1ByaWNlSGV4KTtcclxuICAgICAgICAvLyBVc2luZyBzYWZlIGdhcyBwcmljZSBmcm9tIGJhc2UgZmVlXHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBnZXR0aW5nIHNhZmUgZ2FzIHByaWNlLCB1c2luZyBwcm92aWRlciBmYWxsYmFjazonLCBlcnJvcik7XHJcbiAgICAgICAgLy8gTGFzdCByZXNvcnQgZmFsbGJhY2sgdG8gcHJvdmlkZXJcclxuICAgICAgICBjb25zdCBuZXR3b3JrR2FzUHJpY2UgPSBhd2FpdCBwcm92aWRlci5nZXRGZWVEYXRhKCk7XHJcbiAgICAgICAgaWYgKG5ldHdvcmtHYXNQcmljZS5nYXNQcmljZSkge1xyXG4gICAgICAgICAgdHhUb1NlbmQuZ2FzUHJpY2UgPSBuZXR3b3JrR2FzUHJpY2UuZ2FzUHJpY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2VuZCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgdHggPSBhd2FpdCBjb25uZWN0ZWRTaWduZXIuc2VuZFRyYW5zYWN0aW9uKHR4VG9TZW5kKTtcclxuXHJcbiAgICAvLyBUcmFuc2FjdGlvbiBzZW50XHJcblxyXG4gICAgLy8gU2F2ZSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5IChuZXR3b3JrIHZhcmlhYmxlIGFscmVhZHkgZGVmaW5lZCBhYm92ZSlcclxuICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShzaWduZXIuYWRkcmVzcywge1xyXG4gICAgICBoYXNoOiB0eC5oYXNoLFxyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIGZyb206IHNpZ25lci5hZGRyZXNzLFxyXG4gICAgICB0bzogdHhSZXF1ZXN0LnRvIHx8IG51bGwsXHJcbiAgICAgIHZhbHVlOiB0eFJlcXVlc3QudmFsdWUgfHwgJzAnLFxyXG4gICAgICBkYXRhOiB0eC5kYXRhIHx8ICcweCcsXHJcbiAgICAgIGdhc1ByaWNlOiB0eC5nYXNQcmljZSA/IHR4Lmdhc1ByaWNlLnRvU3RyaW5nKCkgOiAnMCcsXHJcbiAgICAgIGdhc0xpbWl0OiB0eC5nYXNMaW1pdCA/IHR4Lmdhc0xpbWl0LnRvU3RyaW5nKCkgOiBudWxsLFxyXG4gICAgICBub25jZTogdHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogdHhIaXN0b3J5LlRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZW5kIGRlc2t0b3Agbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIHNlbnQ6ICR7dHguaGFzaC5zbGljZSgwLCAyMCl9Li4uYCxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvbiBpbiBiYWNrZ3JvdW5kXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgc2lnbmVyLmFkZHJlc3MpO1xyXG5cclxuICAgIC8vIExvZyBzdWNjZXNzZnVsIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogJ3RyYW5zYWN0aW9uJyxcclxuICAgICAgYWRkcmVzczogc2lnbmVyLmFkZHJlc3MsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6ICdldGhfc2VuZFRyYW5zYWN0aW9uJyxcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgdHhIYXNoOiB0eC5oYXNoLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZXNvbHZlIHdpdGggdHJhbnNhY3Rpb24gaGFzaFxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogdHguaGFzaCB9KTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2ggfTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIC8vIFNFQ1VSSVRZOiBDbGVhbiB1cCBzZW5zaXRpdmUgZGF0YSBmcm9tIG1lbW9yeVxyXG4gICAgICAvLyBPdmVyd3JpdGUgcGFzc3dvcmQgd2l0aCBnYXJiYWdlIGJlZm9yZSBkZXJlZmVyZW5jaW5nXHJcbiAgICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICAgIGNvbnN0IHRlbXBPYmogPSB7IHBhc3N3b3JkIH07XHJcbiAgICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2xlYW4gdXAgc2lnbmVyJ3MgcHJpdmF0ZSBrZXlcclxuICAgICAgaWYgKHNpZ25lcikge1xyXG4gICAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjb25uZWN0ZWRTaWduZXIpIHtcclxuICAgICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKGNvbm5lY3RlZFNpZ25lcik7XHJcbiAgICAgICAgY29ubmVjdGVkU2lnbmVyID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRyYW5zYWN0aW9uIGVycm9yOicsIGVycm9yKTtcclxuICAgIGNvbnN0IHNhbml0aXplZEVycm9yID0gc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSk7XHJcblxyXG4gICAgLy8gTG9nIGZhaWxlZCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6ICd0cmFuc2FjdGlvbicsXHJcbiAgICAgIGFkZHJlc3M6ICd1bmtub3duJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogJ2V0aF9zZW5kVHJhbnNhY3Rpb24nLFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgZXJyb3I6IHNhbml0aXplZEVycm9yLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICByZWplY3QobmV3IEVycm9yKHNhbml0aXplZEVycm9yKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplZEVycm9yIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgdHJhbnNhY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRUcmFuc2FjdGlvblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdUcmFuc2FjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0eFJlcXVlc3QgfSA9IHBlbmRpbmdUcmFuc2FjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBvcmlnaW4sIHR4UmVxdWVzdCB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF93YXRjaEFzc2V0IC0gQWRkIGN1c3RvbSB0b2tlbiAoRUlQLTc0NylcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlV2F0Y2hBc3NldChwYXJhbXMsIG9yaWdpbiwgdGFiKSB7XHJcbiAgLy8gUmVjZWl2ZWQgd2FsbGV0X3dhdGNoQXNzZXQgcmVxdWVzdFxyXG5cclxuICAvLyBWYWxpZGF0ZSBwYXJhbXMgc3RydWN0dXJlXHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtcy50eXBlIHx8ICFwYXJhbXMub3B0aW9ucykge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXM6IG11c3QgaW5jbHVkZSB0eXBlIGFuZCBvcHRpb25zJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHR5cGUsIG9wdGlvbnMgfSA9IHBhcmFtcztcclxuXHJcbiAgLy8gT25seSBzdXBwb3J0IEVSQzIwL1BSQzIwIHRva2Vuc1xyXG4gIGlmICh0eXBlLnRvVXBwZXJDYXNlKCkgIT09ICdFUkMyMCcpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ09ubHkgRVJDMjAvUFJDMjAgdG9rZW5zIGFyZSBzdXBwb3J0ZWQnIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHJlcXVpcmVkIHRva2VuIGZpZWxkc1xyXG4gIGlmICghb3B0aW9ucy5hZGRyZXNzIHx8ICFvcHRpb25zLnN5bWJvbCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnVG9rZW4gbXVzdCBoYXZlIGFkZHJlc3MgYW5kIHN5bWJvbCcgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdG9rZW5JbmZvID0ge1xyXG4gICAgYWRkcmVzczogb3B0aW9ucy5hZGRyZXNzLnRvTG93ZXJDYXNlKCksXHJcbiAgICBzeW1ib2w6IG9wdGlvbnMuc3ltYm9sLFxyXG4gICAgZGVjaW1hbHM6IG9wdGlvbnMuZGVjaW1hbHMgfHwgMTgsXHJcbiAgICBpbWFnZTogb3B0aW9ucy5pbWFnZSB8fCBudWxsXHJcbiAgfTtcclxuXHJcbiAgLy8gUmVxdWVzdGluZyB0byBhZGQgdG9rZW5cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IERhdGUubm93KCkudG9TdHJpbmcoKSArICdfdG9rZW4nO1xyXG4gICAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuc2V0KHJlcXVlc3RJZCwgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdG9rZW5JbmZvIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249YWRkVG9rZW4mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDUwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdUb2tlbiBhZGQgcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgdG9rZW4gYWRkIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVG9rZW5BZGRBcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCB0b2tlbkluZm8gfSA9IHBlbmRpbmdUb2tlblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG4gIHBlbmRpbmdUb2tlblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRva2VuJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBUb2tlbiBhcHByb3ZlZCAtIHJldHVybiB0cnVlICh3YWxsZXRfd2F0Y2hBc3NldCByZXR1cm5zIGJvb2xlYW4pXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiB0cnVlIH0pO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdG9rZW5JbmZvIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVG9rZW4gYWRkIGVycm9yOicsIGVycm9yKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgdG9rZW4gYWRkIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0VG9rZW5BZGRSZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmIChwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4sIHRva2VuSW5mbyB9ID0gcGVuZGluZ1Rva2VuUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBvcmlnaW4sIHRva2VuSW5mbyB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gU3BlZWQgdXAgYSBwZW5kaW5nIHRyYW5zYWN0aW9uIGJ5IHJlcGxhY2luZyBpdCB3aXRoIGhpZ2hlciBnYXMgcHJpY2VcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCBzZXNzaW9uVG9rZW4sIGdhc1ByaWNlTXVsdGlwbGllciA9IDEuMiwgY3VzdG9tR2FzUHJpY2UgPSBudWxsKSB7XHJcbiAgbGV0IHBhc3N3b3JkID0gbnVsbDtcclxuICBsZXQgc2lnbmVyID0gbnVsbDtcclxuICBsZXQgd2FsbGV0ID0gbnVsbDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2sgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB1bmxvY2tSZXN1bHQgPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG5cclxuICAgIC8vIFNFQ1VSSVRZOiBWZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGJlbG9uZ3MgdG8gdGhpcyB3YWxsZXRcclxuICAgIGNvbnN0IHdhbGxldEFkZHJlc3MgPSBhd2FpdCBzaWduZXIuZ2V0QWRkcmVzcygpO1xyXG4gICAgaWYgKHdhbGxldEFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgQWRkcmVzcyBtaXNtYXRjaCBpbiBzcGVlZC11cDogd2FsbGV0IGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggcmVxdWVzdCcpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdXYWxsZXQgYWRkcmVzcyBtaXNtYXRjaCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgb3JpZ2luYWwgdHJhbnNhY3Rpb24gaXMgZnJvbSB0aGlzIHdhbGxldFxyXG4gICAgaWYgKG9yaWdpbmFsVHguZnJvbSAmJiBvcmlnaW5hbFR4LmZyb20udG9Mb3dlckNhc2UoKSAhPT0gd2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVHJhbnNhY3Rpb24gb3duZXJzaGlwIGNoZWNrIGZhaWxlZDogdHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIHdhbGxldCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgbmV0d29yayBhbmQgY3JlYXRlIHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyXHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3JpZ2luYWxUeC5uZXR3b3JrO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICB3YWxsZXQgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIGFjdHVhbCB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW4gdG8gY2hlY2sgaXRzIHR5cGVcclxuICAgIC8vIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2Ugb2xkZXIgdHJhbnNhY3Rpb25zIGluIGhpc3RvcnkgbWF5IG5vdCBoYXZlIEVJUC0xNTU5IGZpZWxkcyBzdG9yZWRcclxuICAgIGxldCBpc0VJUDE1NTkgPSBvcmlnaW5hbFR4Lm1heEZlZVBlckdhcyB8fCBvcmlnaW5hbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhGZWVQZXJHYXMgPSBudWxsO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyA9IG51bGw7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgb25DaGFpblR4ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb24ob3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgICBpZiAob25DaGFpblR4KSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBFSVAtMTU1OSAodHlwZSAyKVxyXG4gICAgICAgIGlmIChvbkNoYWluVHgudHlwZSA9PT0gMiB8fCBvbkNoYWluVHgubWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICBpc0VJUDE1NTkgPSB0cnVlO1xyXG4gICAgICAgICAgb25DaGFpbk1heEZlZVBlckdhcyA9IG9uQ2hhaW5UeC5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBvbkNoYWluVHgubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBEZXRlY3RlZCBFSVAtMTU1OSB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW46Jywge1xyXG4gICAgICAgICAgICBtYXhGZWVQZXJHYXM6IG9uQ2hhaW5NYXhGZWVQZXJHYXM/LnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIG1heFByaW9yaXR5RmVlUGVyR2FzOiBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXM/LnRvU3RyaW5nKClcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZmV0Y2hFcnIpIHtcclxuICAgICAgY29uc29sZS53YXJuKCfwn6uAIENvdWxkIG5vdCBmZXRjaCBvcmlnaW5hbCB0eCBmcm9tIGJsb2NrY2hhaW46JywgZmV0Y2hFcnIubWVzc2FnZSk7XHJcbiAgICAgIC8vIENvbnRpbnVlIHdpdGggd2hhdCB3ZSBoYXZlIGZyb20gaGlzdG9yeVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSByZXBsYWNlbWVudCB0cmFuc2FjdGlvbiB3aXRoIHNhbWUgbm9uY2UsIGRhdGEsIGFuZCBnYXNMaW1pdFxyXG4gICAgY29uc3QgcmVwbGFjZW1lbnRUeCA9IHtcclxuICAgICAgdG86IG9yaWdpbmFsVHgudG8sXHJcbiAgICAgIHZhbHVlOiBvcmlnaW5hbFR4LnZhbHVlLFxyXG4gICAgICBkYXRhOiBvcmlnaW5hbFR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5jbHVkZSBnYXNMaW1pdCBpZiBpdCB3YXMgaW4gdGhlIG9yaWdpbmFsIHRyYW5zYWN0aW9uXHJcbiAgICBpZiAob3JpZ2luYWxUeC5nYXNMaW1pdCkge1xyXG4gICAgICByZXBsYWNlbWVudFR4Lmdhc0xpbWl0ID0gb3JpZ2luYWxUeC5nYXNMaW1pdDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3Igc3RvcmluZyBpbiBoaXN0b3J5XHJcbiAgICBsZXQgbmV3R2FzUHJpY2UgPSBudWxsO1xyXG4gICAgbGV0IG5ld01heEZlZVBlckdhcyA9IG51bGw7XHJcbiAgICBsZXQgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBudWxsO1xyXG5cclxuICAgIGlmIChpc0VJUDE1NTkpIHtcclxuICAgICAgLy8gRUlQLTE1NTk6IE11c3QgYnVtcCBCT1RIIG1heEZlZVBlckdhcyBhbmQgbWF4UHJpb3JpdHlGZWVQZXJHYXMgYnkgYXQgbGVhc3QgMTAlXHJcbiAgICAgIC8vIFVzaW5nIDEyLjUlIGJ1bXAgdG8gZW5zdXJlIGFjY2VwdGFuY2UgKHNhbWUgYXMgRXRoZXJldW0gZGVmYXVsdClcclxuICAgICAgY29uc3QgYnVtcE11bHRpcGxpZXIgPSAxMTI1bjsgLy8gMTEyLjUlID0gMS4xMjV4XHJcbiAgICAgIGNvbnN0IGJ1bXBEaXZpc29yID0gMTAwMG47XHJcblxyXG4gICAgICAvLyBVc2Ugb24tY2hhaW4gdmFsdWVzIGlmIGF2YWlsYWJsZSAobW9yZSBhY2N1cmF0ZSksIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gaGlzdG9yeVxyXG4gICAgICBjb25zdCBvcmlnaW5hbE1heEZlZSA9IG9uQ2hhaW5NYXhGZWVQZXJHYXMgfHwgQmlnSW50KG9yaWdpbmFsVHgubWF4RmVlUGVyR2FzIHx8IG9yaWdpbmFsVHguZ2FzUHJpY2UgfHwgJzAnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxQcmlvcml0eUZlZSA9IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyB8fCBCaWdJbnQob3JpZ2luYWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcyB8fCAnMCcpO1xyXG5cclxuICAgICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgICAgLy8gQ3VzdG9tIGdhcyBwcmljZTogdXNlIGl0IGZvciBtYXhGZWVQZXJHYXMsIGNhbGN1bGF0ZSBwcmlvcml0eSBmZWVcclxuICAgICAgICBjb25zdCBjdXN0b21GZWUgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgICAgIC8vIFByaW9yaXR5IGZlZSBzaG91bGQgYmUgYXQgbGVhc3QgMTIuNSUgaGlnaGVyIHRoYW4gb3JpZ2luYWxcclxuICAgICAgICBjb25zdCBtaW5Qcmlvcml0eUZlZSA9IChvcmlnaW5hbFByaW9yaXR5RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgLy8gVXNlIGF0IGxlYXN0IDEgR3dlaSBmb3IgcHJpb3JpdHkgZmVlIGlmIG5vdCBzZXRcclxuICAgICAgICBjb25zdCBwcmlvcml0eUZlZSA9IG1pblByaW9yaXR5RmVlID4gMG4gPyBtaW5Qcmlvcml0eUZlZSA6IDEwMDAwMDAwMDBuO1xyXG5cclxuICAgICAgICBuZXdNYXhGZWVQZXJHYXMgPSBjdXN0b21GZWU7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBwcmlvcml0eUZlZSA8IGN1c3RvbUZlZSA/IHByaW9yaXR5RmVlIDogY3VzdG9tRmVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBidW1wZWQgZmVlcyAoMTIuNSUgaGlnaGVyKVxyXG4gICAgICAgIG5ld01heEZlZVBlckdhcyA9IChvcmlnaW5hbE1heEZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG4gICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gKG9yaWdpbmFsUHJpb3JpdHlGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIHByaW9yaXR5IGZlZSBpcyBhdCBsZWFzdCAxIEd3ZWlcclxuICAgICAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPCAxMDAwMDAwMDAwbikge1xyXG4gICAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSAxMDAwMDAwMDAwbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcGxhY2VtZW50VHgubWF4RmVlUGVyR2FzID0gbmV3TWF4RmVlUGVyR2FzO1xyXG4gICAgICByZXBsYWNlbWVudFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygn8J+rgCBFSVAtMTU1OSBzcGVlZC11cDonLCB7XHJcbiAgICAgICAgb3JpZ2luYWxNYXhGZWU6IG9yaWdpbmFsTWF4RmVlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgb3JpZ2luYWxQcmlvcml0eUZlZTogb3JpZ2luYWxQcmlvcml0eUZlZS50b1N0cmluZygpLFxyXG4gICAgICAgIG5ld01heEZlZTogbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbmV3UHJpb3JpdHlGZWU6IG5ld01heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKClcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBMZWdhY3kgdHJhbnNhY3Rpb246IHVzZSBnYXNQcmljZVxyXG4gICAgICBpZiAoY3VzdG9tR2FzUHJpY2UpIHtcclxuICAgICAgICAvLyBVc2UgY3VzdG9tIGdhcyBwcmljZSBwcm92aWRlZCBieSB1c2VyXHJcbiAgICAgICAgbmV3R2FzUHJpY2UgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBmcm9tIG11bHRpcGxpZXIgKDEuMnggb2Ygb3JpZ2luYWwgYnkgZGVmYXVsdClcclxuICAgICAgICBjb25zdCBvcmlnaW5hbEdhc1ByaWNlID0gQmlnSW50KG9yaWdpbmFsVHguZ2FzUHJpY2UpO1xyXG4gICAgICAgIG5ld0dhc1ByaWNlID0gKG9yaWdpbmFsR2FzUHJpY2UgKiBCaWdJbnQoTWF0aC5mbG9vcihnYXNQcmljZU11bHRpcGxpZXIgKiAxMDApKSkgLyBCaWdJbnQoMTAwKTtcclxuICAgICAgfVxyXG4gICAgICByZXBsYWNlbWVudFR4Lmdhc1ByaWNlID0gbmV3R2FzUHJpY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3BlZWRpbmcgdXAgdHJhbnNhY3Rpb25cclxuXHJcbiAgICAvLyBTZW5kIHJlcGxhY2VtZW50IHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHdhbGxldC5zZW5kVHJhbnNhY3Rpb24ocmVwbGFjZW1lbnRUeCk7XHJcblxyXG4gICAgLy8gU2F2ZSBuZXcgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSAoaW5jbHVkZSBFSVAtMTU1OSBmaWVsZHMgaWYgYXBwbGljYWJsZSlcclxuICAgIGNvbnN0IGhpc3RvcnlFbnRyeSA9IHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIGRhdGE6IG9yaWdpbmFsVHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogbmV3R2FzUHJpY2UgPyBuZXdHYXNQcmljZS50b1N0cmluZygpIDogKG5ld01heEZlZVBlckdhcyA/IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpIDogb3JpZ2luYWxUeC5nYXNQcmljZSksXHJcbiAgICAgIGdhc0xpbWl0OiBvcmlnaW5hbFR4Lmdhc0xpbWl0LFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiBvcmlnaW5hbFR4LnR5cGVcclxuICAgIH07XHJcblxyXG4gICAgLy8gQWRkIEVJUC0xNTU5IGZpZWxkcyBpZiB0aGlzIHdhcyBhbiBFSVAtMTU1OSB0cmFuc2FjdGlvblxyXG4gICAgaWYgKG5ld01heEZlZVBlckdhcykge1xyXG4gICAgICBoaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMpIHtcclxuICAgICAgaGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgaGlzdG9yeUVudHJ5KTtcclxuXHJcbiAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIHJlcGxhY2VkL2ZhaWxlZFxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCwgbnVsbCk7XHJcblxyXG4gICAgLy8gU2VuZCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNwZWQgVXAnLFxyXG4gICAgICBtZXNzYWdlOiBgUmVwbGFjZW1lbnQgdHJhbnNhY3Rpb24gc2VudCB3aXRoICR7TWF0aC5mbG9vcihnYXNQcmljZU11bHRpcGxpZXIgKiAxMDApfSUgZ2FzIHByaWNlYCxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvblxyXG4gICAgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCwgbmV3R2FzUHJpY2U6IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCkgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBzcGVlZGluZyB1cCB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIC8vIFNFQ1VSSVRZOiBDbGVhbiB1cCBzZW5zaXRpdmUgZGF0YSBmcm9tIG1lbW9yeVxyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNvbnN0IHRlbXBPYmogPSB7IHBhc3N3b3JkIH07XHJcbiAgICAgIHNlY3VyZUNsZWFudXAodGVtcE9iaiwgWydwYXNzd29yZCddKTtcclxuICAgICAgcGFzc3dvcmQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHNpZ25lcikge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHNpZ25lcik7XHJcbiAgICAgIHNpZ25lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAod2FsbGV0KSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIod2FsbGV0KTtcclxuICAgICAgd2FsbGV0ID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIENhbmNlbCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gYnkgcmVwbGFjaW5nIGl0IHdpdGggYSB6ZXJvLXZhbHVlIHR4IHRvIHNlbGZcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHNlc3Npb25Ub2tlbiwgY3VzdG9tR2FzUHJpY2UgPSBudWxsKSB7XHJcbiAgbGV0IHBhc3N3b3JkID0gbnVsbDtcclxuICBsZXQgc2lnbmVyID0gbnVsbDtcclxuICBsZXQgd2FsbGV0ID0gbnVsbDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2sgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB1bmxvY2tSZXN1bHQgPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG5cclxuICAgIC8vIFNFQ1VSSVRZOiBWZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGJlbG9uZ3MgdG8gdGhpcyB3YWxsZXRcclxuICAgIGNvbnN0IHdhbGxldEFkZHJlc3MgPSBhd2FpdCBzaWduZXIuZ2V0QWRkcmVzcygpO1xyXG4gICAgaWYgKHdhbGxldEFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgQWRkcmVzcyBtaXNtYXRjaCBpbiBjYW5jZWw6IHdhbGxldCBhZGRyZXNzIGRvZXMgbm90IG1hdGNoIHJlcXVlc3QnKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnV2FsbGV0IGFkZHJlc3MgbWlzbWF0Y2gnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVmVyaWZ5IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGlzIGZyb20gdGhpcyB3YWxsZXRcclxuICAgIGlmIChvcmlnaW5hbFR4LmZyb20gJiYgb3JpZ2luYWxUeC5mcm9tLnRvTG93ZXJDYXNlKCkgIT09IHdhbGxldEFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRyYW5zYWN0aW9uIG93bmVyc2hpcCBjaGVjayBmYWlsZWQ6IHRyYW5zYWN0aW9uIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIHdhbGxldCcpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyB3YWxsZXQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IG5ldHdvcmsgYW5kIGNyZWF0ZSBwcm92aWRlciB3aXRoIGF1dG9tYXRpYyBmYWlsb3ZlclxyXG4gICAgY29uc3QgbmV0d29yayA9IG9yaWdpbmFsVHgubmV0d29yaztcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgd2FsbGV0ID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBhY3R1YWwgdHJhbnNhY3Rpb24gZnJvbSBibG9ja2NoYWluIHRvIGNoZWNrIGl0cyB0eXBlXHJcbiAgICBsZXQgaXNFSVAxNTU5ID0gb3JpZ2luYWxUeC5tYXhGZWVQZXJHYXMgfHwgb3JpZ2luYWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgIGxldCBvbkNoYWluTWF4RmVlUGVyR2FzID0gbnVsbDtcclxuICAgIGxldCBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBudWxsO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IG9uQ2hhaW5UeCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uKG9yaWdpbmFsVHhIYXNoKTtcclxuICAgICAgaWYgKG9uQ2hhaW5UeCkge1xyXG4gICAgICAgIGlmIChvbkNoYWluVHgudHlwZSA9PT0gMiB8fCBvbkNoYWluVHgubWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICBpc0VJUDE1NTkgPSB0cnVlO1xyXG4gICAgICAgICAgb25DaGFpbk1heEZlZVBlckdhcyA9IG9uQ2hhaW5UeC5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBvbkNoYWluVHgubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBEZXRlY3RlZCBFSVAtMTU1OSB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW4gZm9yIGNhbmNlbCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZmV0Y2hFcnIpIHtcclxuICAgICAgY29uc29sZS53YXJuKCfwn6uAIENvdWxkIG5vdCBmZXRjaCBvcmlnaW5hbCB0eCBmcm9tIGJsb2NrY2hhaW46JywgZmV0Y2hFcnIubWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiAoc2VuZCAwIHRvIHNlbGYgd2l0aCBzYW1lIG5vbmNlKVxyXG4gICAgY29uc3QgY2FuY2VsVHggPSB7XHJcbiAgICAgIHRvOiBhZGRyZXNzLCAgLy8gU2VuZCB0byBzZWxmXHJcbiAgICAgIHZhbHVlOiAnMCcsICAgLy8gWmVybyB2YWx1ZVxyXG4gICAgICBkYXRhOiAnMHgnLCAgIC8vIEVtcHR5IGRhdGFcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIGdhc0xpbWl0OiAyMTAwMCAgLy8gU3RhbmRhcmQgZ2FzIGxpbWl0IGZvciBzaW1wbGUgRVRIIHRyYW5zZmVyXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEZvciBzdG9yaW5nIGluIGhpc3RvcnlcclxuICAgIGxldCBuZXdHYXNQcmljZSA9IG51bGw7XHJcbiAgICBsZXQgbmV3TWF4RmVlUGVyR2FzID0gbnVsbDtcclxuICAgIGxldCBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IG51bGw7XHJcblxyXG4gICAgaWYgKGlzRUlQMTU1OSkge1xyXG4gICAgICAvLyBFSVAtMTU1OTogTXVzdCBidW1wIEJPVEggbWF4RmVlUGVyR2FzIGFuZCBtYXhQcmlvcml0eUZlZVBlckdhcyBieSBhdCBsZWFzdCAxMCVcclxuICAgICAgY29uc3QgYnVtcE11bHRpcGxpZXIgPSAxMTI1bjsgLy8gMTEyLjUlXHJcbiAgICAgIGNvbnN0IGJ1bXBEaXZpc29yID0gMTAwMG47XHJcblxyXG4gICAgICAvLyBVc2Ugb24tY2hhaW4gdmFsdWVzIGlmIGF2YWlsYWJsZVxyXG4gICAgICBjb25zdCBvcmlnaW5hbE1heEZlZSA9IG9uQ2hhaW5NYXhGZWVQZXJHYXMgfHwgQmlnSW50KG9yaWdpbmFsVHgubWF4RmVlUGVyR2FzIHx8IG9yaWdpbmFsVHguZ2FzUHJpY2UgfHwgJzAnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxQcmlvcml0eUZlZSA9IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyB8fCBCaWdJbnQob3JpZ2luYWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcyB8fCAnMCcpO1xyXG5cclxuICAgICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgICAgLy8gQ3VzdG9tIGdhcyBwcmljZTogdXNlIGl0IGZvciBtYXhGZWVQZXJHYXNcclxuICAgICAgICBjb25zdCBjdXN0b21GZWUgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgICAgIGNvbnN0IG1pblByaW9yaXR5RmVlID0gKG9yaWdpbmFsUHJpb3JpdHlGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuICAgICAgICBjb25zdCBwcmlvcml0eUZlZSA9IG1pblByaW9yaXR5RmVlID4gMG4gPyBtaW5Qcmlvcml0eUZlZSA6IDEwMDAwMDAwMDBuO1xyXG5cclxuICAgICAgICBuZXdNYXhGZWVQZXJHYXMgPSBjdXN0b21GZWU7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBwcmlvcml0eUZlZSA8IGN1c3RvbUZlZSA/IHByaW9yaXR5RmVlIDogY3VzdG9tRmVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBidW1wZWQgZmVlc1xyXG4gICAgICAgIG5ld01heEZlZVBlckdhcyA9IChvcmlnaW5hbE1heEZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG4gICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gKG9yaWdpbmFsUHJpb3JpdHlGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuXHJcbiAgICAgICAgaWYgKG5ld01heFByaW9yaXR5RmVlUGVyR2FzIDwgMTAwMDAwMDAwMG4pIHtcclxuICAgICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gMTAwMDAwMDAwMG47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjYW5jZWxUeC5tYXhGZWVQZXJHYXMgPSBuZXdNYXhGZWVQZXJHYXM7XHJcbiAgICAgIGNhbmNlbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygn8J+rgCBFSVAtMTU1OSBjYW5jZWw6Jywge1xyXG4gICAgICAgIG9yaWdpbmFsTWF4RmVlOiBvcmlnaW5hbE1heEZlZS50b1N0cmluZygpLFxyXG4gICAgICAgIG9yaWdpbmFsUHJpb3JpdHlGZWU6IG9yaWdpbmFsUHJpb3JpdHlGZWUudG9TdHJpbmcoKSxcclxuICAgICAgICBuZXdNYXhGZWU6IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpLFxyXG4gICAgICAgIG5ld1ByaW9yaXR5RmVlOiBuZXdNYXhQcmlvcml0eUZlZVBlckdhcy50b1N0cmluZygpXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTGVnYWN5IHRyYW5zYWN0aW9uXHJcbiAgICAgIGlmIChjdXN0b21HYXNQcmljZSkge1xyXG4gICAgICAgIG5ld0dhc1ByaWNlID0gQmlnSW50KGN1c3RvbUdhc1ByaWNlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbEdhc1ByaWNlID0gQmlnSW50KG9yaWdpbmFsVHguZ2FzUHJpY2UpO1xyXG4gICAgICAgIG5ld0dhc1ByaWNlID0gKG9yaWdpbmFsR2FzUHJpY2UgKiBCaWdJbnQoMTIwKSkgLyBCaWdJbnQoMTAwKTtcclxuICAgICAgfVxyXG4gICAgICBjYW5jZWxUeC5nYXNQcmljZSA9IG5ld0dhc1ByaWNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbmNlbGxpbmcgdHJhbnNhY3Rpb25cclxuXHJcbiAgICAvLyBTZW5kIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgdHggPSBhd2FpdCB3YWxsZXQuc2VuZFRyYW5zYWN0aW9uKGNhbmNlbFR4KTtcclxuXHJcbiAgICAvLyBTYXZlIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAgICBjb25zdCBoaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogYWRkcmVzcyxcclxuICAgICAgdG86IGFkZHJlc3MsXHJcbiAgICAgIHZhbHVlOiAnMCcsXHJcbiAgICAgIGRhdGE6ICcweCcsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZSA/IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCkgOiAobmV3TWF4RmVlUGVyR2FzID8gbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCkgOiBvcmlnaW5hbFR4Lmdhc1ByaWNlKSxcclxuICAgICAgZ2FzTGltaXQ6ICcyMTAwMCcsXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6ICdzZW5kJ1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAobmV3TWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgIGhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIGlmIChuZXdNYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICBoaXN0b3J5RW50cnkubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBuZXdNYXhQcmlvcml0eUZlZVBlckdhcy50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShhZGRyZXNzLCBoaXN0b3J5RW50cnkpO1xyXG5cclxuICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgZmFpbGVkXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAvLyBTZW5kIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ2FuY2VsbGVkJyxcclxuICAgICAgbWVzc2FnZTogJ0NhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiBzZW50JyxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvblxyXG4gICAgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGNhbmNlbGxpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBTRUNVUklUWTogQ2xlYW4gdXAgc2Vuc2l0aXZlIGRhdGEgZnJvbSBtZW1vcnlcclxuICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICBjb25zdCB0ZW1wT2JqID0geyBwYXNzd29yZCB9O1xyXG4gICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChzaWduZXIpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHdhbGxldCkge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHdhbGxldCk7XHJcbiAgICAgIHdhbGxldCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGdhcyBwcmljZSAoZm9yIHNwZWVkLXVwIFVJKVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50TmV0d29ya0dhc1ByaWNlKG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgLy8gR2V0IGZ1bGwgZ2FzIHByaWNlIHJlY29tbWVuZGF0aW9ucyBiYXNlZCBvbiBmZWUgaGlzdG9yeVxyXG4gICAgY29uc3QgcmVjb21tZW5kYXRpb25zID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlUmVjb21tZW5kYXRpb25zKG5ldHdvcmspO1xyXG5cclxuICAgIC8vIFVzZSBcImZhc3RcIiB0aWVyIGFzIHRoZSByZWNvbW1lbmRlZCBzcGVlZC11cCBwcmljZVxyXG4gICAgY29uc3QgZmFzdFByaWNlID0gQmlnSW50KHJlY29tbWVuZGF0aW9ucy5mYXN0Lm1heEZlZVBlckdhcyk7XHJcbiAgICBjb25zdCBpbnN0YW50UHJpY2UgPSBCaWdJbnQocmVjb21tZW5kYXRpb25zLmluc3RhbnQubWF4RmVlUGVyR2FzKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICBnYXNQcmljZTogZmFzdFByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgIGdhc1ByaWNlR3dlaTogKE51bWJlcihmYXN0UHJpY2UpIC8gMWU5KS50b0ZpeGVkKDIpLFxyXG4gICAgICByZWNvbW1lbmRhdGlvbnM6IHtcclxuICAgICAgICBzbG93OiByZWNvbW1lbmRhdGlvbnMuc2xvdy5tYXhGZWVQZXJHYXMsXHJcbiAgICAgICAgbm9ybWFsOiByZWNvbW1lbmRhdGlvbnMubm9ybWFsLm1heEZlZVBlckdhcyxcclxuICAgICAgICBmYXN0OiByZWNvbW1lbmRhdGlvbnMuZmFzdC5tYXhGZWVQZXJHYXMsXHJcbiAgICAgICAgaW5zdGFudDogcmVjb21tZW5kYXRpb25zLmluc3RhbnQubWF4RmVlUGVyR2FzXHJcbiAgICAgIH0sXHJcbiAgICAgIGluc3RhbnRQcmljZTogaW5zdGFudFByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgIGluc3RhbnRQcmljZUd3ZWk6IChOdW1iZXIoaW5zdGFudFByaWNlKSAvIDFlOSkudG9GaXhlZCgyKVxyXG4gICAgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBmZXRjaGluZyBjdXJyZW50IGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBSZWZyZXNoIHRyYW5zYWN0aW9uIHN0YXR1cyBmcm9tIGJsb2NrY2hhaW5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFRyYW5zYWN0aW9uU3RhdHVzKGFkZHJlc3MsIHR4SGFzaCwgbmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBSZWZyZXNoaW5nIHR4IHN0YXR1czogJHt0eEhhc2h9IG9uICR7bmV0d29ya31gKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG5cclxuICAgIC8vIEdldCB0cmFuc2FjdGlvbiByZWNlaXB0IGZyb20gYmxvY2tjaGFpblxyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uUmVjZWlwdCh0eEhhc2gpO1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgUmVjZWlwdCBmb3IgJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLjpgLCByZWNlaXB0ID8gJ2ZvdW5kJyA6ICdudWxsJyk7XHJcblxyXG4gICAgaWYgKCFyZWNlaXB0KSB7XHJcbiAgICAgIC8vIE5vIHJlY2VpcHQgLSBjaGVjayBpZiB0cmFuc2FjdGlvbiBpcyBzdGlsbCBpbiBtZW1wb29sXHJcbiAgICAgIGNvbnN0IHR4ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb24odHhIYXNoKTtcclxuICAgICAgY29uc29sZS5sb2coYPCfq4AgTWVtcG9vbCB0eCBmb3IgJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLjpgLCB0eCA/ICdmb3VuZCcgOiAnbnVsbCcpO1xyXG5cclxuICAgICAgaWYgKCF0eCkge1xyXG4gICAgICAgIC8vIFRyYW5zYWN0aW9uIG5vdCBpbiBtZW1wb29sIGFuZCBubyByZWNlaXB0ID0gZHJvcHBlZC9ldmljdGVkXHJcbiAgICAgICAgY29uc29sZS5sb2coYPCfq4AgVHJhbnNhY3Rpb24gJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiB3YXMgRFJPUFBFRCAtIG1hcmtpbmcgYXMgZmFpbGVkYCk7XHJcbiAgICAgICAgLy8gTWFyayBhcyBmYWlsZWQgaW4gbG9jYWwgaGlzdG9yeVxyXG4gICAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgICB0eEhhc2gsXHJcbiAgICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCxcclxuICAgICAgICAgIG51bGxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIHN0YXR1czogJ2Ryb3BwZWQnLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ1RyYW5zYWN0aW9uIHdhcyBkcm9wcGVkIGZyb20gbWVtcG9vbCAobm90IGNvbmZpcm1lZCwgbm8gbG9uZ2VyIHBlbmRpbmcpJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIGV4aXN0cyBpbiBtZW1wb29sLCBzdGlsbCBwZW5kaW5nXHJcbiAgICAgIGNvbnNvbGUubG9nKGDwn6uAIFRyYW5zYWN0aW9uICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4gc3RpbGwgaW4gbWVtcG9vbGApO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXHJcbiAgICAgICAgbWVzc2FnZTogJ1RyYW5zYWN0aW9uIGlzIHN0aWxsIHBlbmRpbmcgb24gdGhlIGJsb2NrY2hhaW4nXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGFzIGJlZW4gbWluZWRcclxuICAgIGxldCBuZXdTdGF0dXM7XHJcbiAgICBpZiAocmVjZWlwdC5zdGF0dXMgPT09IDEpIHtcclxuICAgICAgbmV3U3RhdHVzID0gdHhIaXN0b3J5LlRYX1NUQVRVUy5DT05GSVJNRUQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuZXdTdGF0dXMgPSB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgbG9jYWwgdHJhbnNhY3Rpb24gaGlzdG9yeVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICBhZGRyZXNzLFxyXG4gICAgICB0eEhhc2gsXHJcbiAgICAgIG5ld1N0YXR1cyxcclxuICAgICAgcmVjZWlwdC5ibG9ja051bWJlclxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICBzdGF0dXM6IG5ld1N0YXR1cyxcclxuICAgICAgYmxvY2tOdW1iZXI6IHJlY2VpcHQuYmxvY2tOdW1iZXIsXHJcbiAgICAgIG1lc3NhZ2U6IG5ld1N0YXR1cyA9PT0gdHhIaXN0b3J5LlRYX1NUQVRVUy5DT05GSVJNRURcclxuICAgICAgICA/ICdUcmFuc2FjdGlvbiBjb25maXJtZWQgb24gYmxvY2tjaGFpbidcclxuICAgICAgICA6ICdUcmFuc2FjdGlvbiBmYWlsZWQgb24gYmxvY2tjaGFpbidcclxuICAgIH07XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHJlZnJlc2hpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFJlYnJvYWRjYXN0IGEgcGVuZGluZyB0cmFuc2FjdGlvbiB0byBhbGwgY29uZmlndXJlZCBSUENzXHJcbmFzeW5jIGZ1bmN0aW9uIHJlYnJvYWRjYXN0VHJhbnNhY3Rpb24odHhIYXNoLCBuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFJlYnJvYWRjYXN0aW5nIHRyYW5zYWN0aW9uOiAke3R4SGFzaH0gdG8gYWxsICR7bmV0d29ya30gUlBDc2ApO1xyXG5cclxuICAgIC8vIEZpcnN0LCB0cnkgdG8gZ2V0IHRoZSByYXcgdHJhbnNhY3Rpb25cclxuICAgIGxldCByYXdUeCA9IGF3YWl0IHJwYy5nZXRSYXdUcmFuc2FjdGlvbihuZXR3b3JrLCB0eEhhc2gpO1xyXG5cclxuICAgIGlmICghcmF3VHgpIHtcclxuICAgICAgLy8gSWYgZ2V0UmF3VHJhbnNhY3Rpb24gbm90IHN1cHBvcnRlZCwgd2UgbmVlZCB0byByZWNvbnN0cnVjdCBmcm9tIHR4IGRhdGFcclxuICAgICAgLy8gR2V0IHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICBjb25zdCB0eCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uKHR4SGFzaCk7XHJcblxyXG4gICAgICBpZiAoIXR4KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6ICdUcmFuc2FjdGlvbiBub3QgZm91bmQgaW4gbWVtcG9vbCAtIGl0IG1heSBoYXZlIGJlZW4gZHJvcHBlZCBvciBhbHJlYWR5IGNvbmZpcm1lZCdcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIHJhdyBzZXJpYWxpemVkIHRyYW5zYWN0aW9uIGZyb20gdGhlIHByb3ZpZGVyXHJcbiAgICAgIC8vIGV0aGVycyB2NiBkb2Vzbid0IGV4cG9zZSByYXcgdHggZGlyZWN0bHksIHNvIHdlIHVzZSBhIHdvcmthcm91bmRcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBUcnkgZGlyZWN0IFJQQyBjYWxsIHRvIGdldCByYXcgdHhcclxuICAgICAgICBjb25zdCByYXdSZXN1bHQgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0UmF3VHJhbnNhY3Rpb25CeUhhc2gnLCBbdHhIYXNoXSk7XHJcbiAgICAgICAgaWYgKHJhd1Jlc3VsdCkge1xyXG4gICAgICAgICAgcmF3VHggPSByYXdSZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgZ2V0IHJhdyB0cmFuc2FjdGlvbiB2aWEgUlBDOicsIGUubWVzc2FnZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcmF3VHgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICBlcnJvcjogJ0Nhbm5vdCBnZXQgcmF3IHRyYW5zYWN0aW9uIGRhdGEuIFRoZSBSUEMgbm9kZXMgbWF5IG5vdCBzdXBwb3J0IHRoaXMgb3BlcmF0aW9uLidcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQnJvYWRjYXN0IHRvIGFsbCBSUENzXHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcnBjLmJyb2FkY2FzdFRvQWxsUnBjcyhuZXR3b3JrLCByYXdUeCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coYPCfq4AgUmVicm9hZGNhc3QgcmVzdWx0cyAtIFN1Y2Nlc3NlczogJHtyZXN1bHRzLnN1Y2Nlc3Nlcy5sZW5ndGh9LCBGYWlsdXJlczogJHtyZXN1bHRzLmZhaWx1cmVzLmxlbmd0aH1gKTtcclxuXHJcbiAgICBpZiAocmVzdWx0cy5zdWNjZXNzZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIGJyb2FkY2FzdCB0byAke3Jlc3VsdHMuc3VjY2Vzc2VzLmxlbmd0aH0gUlBDKHMpYCxcclxuICAgICAgICBzdWNjZXNzZXM6IHJlc3VsdHMuc3VjY2Vzc2VzLFxyXG4gICAgICAgIGZhaWx1cmVzOiByZXN1bHRzLmZhaWx1cmVzXHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIGJyb2FkY2FzdCB0byBhbnkgUlBDJyxcclxuICAgICAgICBmYWlsdXJlczogcmVzdWx0cy5mYWlsdXJlc1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciByZWJyb2FkY2FzdGluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBUcmFjayB0cmFuc2FjdGlvbnMgYmVpbmcgbW9uaXRvcmVkIHRvIHByZXZlbnQgZHVwbGljYXRlc1xyXG5jb25zdCBtb25pdG9yaW5nVHJhbnNhY3Rpb25zID0gbmV3IFNldCgpO1xyXG5cclxuLy8gV2FpdCBmb3IgdHJhbnNhY3Rpb24gY29uZmlybWF0aW9uIHdpdGggdGltZW91dCBhbmQgcmV0cnlcclxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpIHtcclxuICBjb25zdCB0eEhhc2ggPSB0eC5oYXNoO1xyXG5cclxuICAvLyBQcmV2ZW50IGR1cGxpY2F0ZSBtb25pdG9yaW5nXHJcbiAgaWYgKG1vbml0b3JpbmdUcmFuc2FjdGlvbnMuaGFzKHR4SGFzaCkpIHtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFRyYW5zYWN0aW9uICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4gYWxyZWFkeSBiZWluZyBtb25pdG9yZWRgKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgbW9uaXRvcmluZ1RyYW5zYWN0aW9ucy5hZGQodHhIYXNoKTtcclxuXHJcbiAgY29uc3QgUE9MTF9JTlRFUlZBTCA9IDE1ICogMTAwMDsgLy8gMTUgc2Vjb25kc1xyXG4gIGNvbnN0IE1BWF9SRVRSSUVTID0gNDA7IC8vIDQwICogMTVzID0gMTAgbWludXRlc1xyXG5cclxuICB0cnkge1xyXG4gICAgbGV0IHJlY2VpcHQgPSBudWxsO1xyXG4gICAgbGV0IHJldHJpZXMgPSAwO1xyXG5cclxuICAgIC8vIFBvbGwgZm9yIHJlY2VpcHQgd2l0aCB0aW1lb3V0XHJcbiAgICB3aGlsZSAoIXJlY2VpcHQgJiYgcmV0cmllcyA8IE1BWF9SRVRSSUVTKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uUmVjZWlwdCh0eEhhc2gpO1xyXG4gICAgICAgIGlmIChyZWNlaXB0KSBicmVhaztcclxuICAgICAgfSBjYXRjaCAocnBjRXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oYPCfq4AgUlBDIGVycm9yIGNoZWNraW5nIHR4ICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4sIHJldHJ5aW5nOmAsIHJwY0Vycm9yLm1lc3NhZ2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBXYWl0IGJlZm9yZSBuZXh0IHBvbGxcclxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIFBPTExfSU5URVJWQUwpKTtcclxuICAgICAgcmV0cmllcysrO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmVjZWlwdCkge1xyXG4gICAgICBjb25zb2xlLndhcm4oYPCfq4AgVHJhbnNhY3Rpb24gJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiBjb25maXJtYXRpb24gdGltZWQgb3V0IGFmdGVyICR7TUFYX1JFVFJJRVN9IGF0dGVtcHRzYCk7XHJcbiAgICAgIC8vIERvbid0IG1hcmsgYXMgZmFpbGVkIC0gaXQgbWlnaHQgc3RpbGwgYmUgcGVuZGluZyBpbiBtZW1wb29sXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVjZWlwdC5zdGF0dXMgPT09IDEpIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gY29uZmlybWVkIHN1Y2Nlc3NmdWxseVxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICB0eEhhc2gsXHJcbiAgICAgICAgdHhIaXN0b3J5LlRYX1NUQVRVUy5DT05GSVJNRUQsXHJcbiAgICAgICAgcmVjZWlwdC5ibG9ja051bWJlclxyXG4gICAgICApO1xyXG5cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ29uZmlybWVkJyxcclxuICAgICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gY29uZmlybWVkIGluIGJsb2NrICR7cmVjZWlwdC5ibG9ja051bWJlcn1gLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gcmV2ZXJ0ZWQgKHN0YXR1cyA9PT0gMClcclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoLFxyXG4gICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELFxyXG4gICAgICAgIHJlY2VpcHQuYmxvY2tOdW1iZXJcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIEZhaWxlZCcsXHJcbiAgICAgICAgbWVzc2FnZTogJ1RyYW5zYWN0aW9uIHdhcyByZXZlcnRlZCBvbi1jaGFpbicsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgaW4gY29uZmlybWF0aW9uIG1vbml0b3Jpbmc6JywgZXJyb3IpO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBBbHdheXMgY2xlYW4gdXAgdHJhY2tpbmdcclxuICAgIG1vbml0b3JpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHR4SGFzaCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBNRVNTQUdFIFNJR05JTkcgSEFORExFUlMgPT09PT1cclxuXHJcbi8vIEhhbmRsZSBwZXJzb25hbF9zaWduIChFSVAtMTkxKSAtIFNpZ24gYSBtZXNzYWdlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVBlcnNvbmFsU2lnbihwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKSB7XHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgc2lnbiByZXF1ZXN0XHJcbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlU2lnblJlcXVlc3QobWV0aG9kLCBwYXJhbXMpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgc2lnbiByZXF1ZXN0IGZyb20gb3JpZ2luOicsIG9yaWdpbiwgdmFsaWRhdGlvbi5lcnJvcik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IC0zMjYwMixcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBzaWduIHJlcXVlc3Q6ICcgKyBzYW5pdGl6ZUVycm9yTWVzc2FnZSh2YWxpZGF0aW9uLmVycm9yKVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBtZXNzYWdlLCBhZGRyZXNzIH0gPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IENoZWNrIGlmIGV0aF9zaWduIGlzIGFsbG93ZWQgKGRpc2FibGVkIGJ5IGRlZmF1bHQpXHJcbiAgaWYgKG1ldGhvZCA9PT0gJ2V0aF9zaWduJykge1xyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBsb2FkKCdzZXR0aW5ncycpO1xyXG4gICAgY29uc3QgYWxsb3dFdGhTaWduID0gc2V0dGluZ3M/LmFsbG93RXRoU2lnbiB8fCBmYWxzZTtcclxuXHJcbiAgICBpZiAoIWFsbG93RXRoU2lnbikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ/Cfq4AgZXRoX3NpZ24gcmVxdWVzdCBibG9ja2VkIChkaXNhYmxlZCBpbiBzZXR0aW5ncyk6Jywgb3JpZ2luKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBlcnJvcjoge1xyXG4gICAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdldGhfc2lnbiBpcyBkaXNhYmxlZCBmb3Igc2VjdXJpdHkuIFVzZSBwZXJzb25hbF9zaWduIGluc3RlYWQsIG9yIGVuYWJsZSBldGhfc2lnbiBpbiB3YWxsZXQgc2V0dGluZ3MuJ1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2cgd2FybmluZyB3aGVuIGV0aF9zaWduIGlzIHVzZWQgKGV2ZW4gd2hlbiBlbmFibGVkKVxyXG4gICAgY29uc29sZS53YXJuKCfimqDvuI8gZXRoX3NpZ24gcmVxdWVzdCBhcHByb3ZlZCBieSBzZXR0aW5ncyBmcm9tOicsIG9yaWdpbik7XHJcbiAgfVxyXG5cclxuICAvLyBWZXJpZnkgdGhlIGFkZHJlc3MgbWF0Y2hlcyB0aGUgY29ubmVjdGVkIGFjY291bnRcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAoIXdhbGxldCB8fCB3YWxsZXQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICBtZXNzYWdlOiAnUmVxdWVzdGVkIGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggY29ubmVjdGVkIGFjY291bnQnXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpICsgJ19zaWduJztcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiBmb3IgcmVwbGF5IHByb3RlY3Rpb25cclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5zZXQoYXBwcm92YWxUb2tlbiwge1xyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgdXNlZDogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuc2V0KHJlcXVlc3RJZCwge1xyXG4gICAgICByZXNvbHZlLFxyXG4gICAgICByZWplY3QsXHJcbiAgICAgIG9yaWdpbixcclxuICAgICAgbWV0aG9kLFxyXG4gICAgICBzaWduUmVxdWVzdDogeyBtZXNzYWdlLCBhZGRyZXNzIH0sXHJcbiAgICAgIGFwcHJvdmFsVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249c2lnbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9Jm1ldGhvZD0ke21ldGhvZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NpZ24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NpZ25UeXBlZERhdGEgKEVJUC03MTIpIC0gU2lnbiB0eXBlZCBkYXRhXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNpZ25UeXBlZERhdGEocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCkge1xyXG4gIC8vIENoZWNrIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKCFhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ05vdCBhdXRob3JpemVkLiBQbGVhc2UgY29ubmVjdCB5b3VyIHdhbGxldCBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHNpZ24gcmVxdWVzdFxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKTtcclxuICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBJbnZhbGlkIHNpZ24gdHlwZWQgZGF0YSByZXF1ZXN0IGZyb20gb3JpZ2luOicsIG9yaWdpbiwgdmFsaWRhdGlvbi5lcnJvcik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IC0zMjYwMixcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBzaWduIHJlcXVlc3Q6ICcgKyBzYW5pdGl6ZUVycm9yTWVzc2FnZSh2YWxpZGF0aW9uLmVycm9yKVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBhZGRyZXNzLCB0eXBlZERhdGEgfSA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBWZXJpZnkgdGhlIGFkZHJlc3MgbWF0Y2hlcyB0aGUgY29ubmVjdGVkIGFjY291bnRcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAoIXdhbGxldCB8fCB3YWxsZXQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICBtZXNzYWdlOiAnUmVxdWVzdGVkIGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggY29ubmVjdGVkIGFjY291bnQnXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpICsgJ19zaWduVHlwZWQnO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBtZXRob2QsXHJcbiAgICAgIHNpZ25SZXF1ZXN0OiB7IHR5cGVkRGF0YSwgYWRkcmVzcyB9LFxyXG4gICAgICBhcHByb3ZhbFRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXNpZ25UeXBlZCZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9Jm1ldGhvZD0ke21ldGhvZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2NTBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NpZ24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgbWVzc2FnZSBzaWduaW5nIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNlc3Npb25Ub2tlbikge1xyXG4gIGlmICghcGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRoZSByZXF1ZXN0JykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIGxldCBwYXNzd29yZCA9IG51bGw7XHJcbiAgbGV0IHNpZ25lciA9IG51bGw7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCBnZXQgcGFzc3dvcmRcclxuICAgIHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gVW5sb2NrIHdhbGxldCAoYXV0by11cGdyYWRlIGlmIG5lZWRlZClcclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcblxyXG4gICAgbGV0IHNpZ25hdHVyZTtcclxuXHJcbiAgICAvLyBTaWduIGJhc2VkIG9uIG1ldGhvZFxyXG4gICAgaWYgKG1ldGhvZCA9PT0gJ3BlcnNvbmFsX3NpZ24nIHx8IG1ldGhvZCA9PT0gJ2V0aF9zaWduJykge1xyXG4gICAgICBzaWduYXR1cmUgPSBhd2FpdCBwZXJzb25hbFNpZ24oc2lnbmVyLCBzaWduUmVxdWVzdC5tZXNzYWdlKTtcclxuICAgIH0gZWxzZSBpZiAobWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykpIHtcclxuICAgICAgc2lnbmF0dXJlID0gYXdhaXQgc2lnblR5cGVkRGF0YShzaWduZXIsIHNpZ25SZXF1ZXN0LnR5cGVkRGF0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHNpZ25pbmcgbWV0aG9kOiAke21ldGhvZH1gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2cgc3VjY2Vzc2Z1bCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgY29uc3Qgc2lnbmVyQWRkcmVzcyA9IGF3YWl0IHNpZ25lci5nZXRBZGRyZXNzKCk7XHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogbWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykgPyAndHlwZWRfZGF0YScgOiAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIGFkZHJlc3M6IHNpZ25lckFkZHJlc3MsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ3NvZnR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2lnbmF0dXJlIGdlbmVyYXRlZCBzdWNjZXNzZnVsbHlcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIE1lc3NhZ2Ugc2lnbmVkIGZvciBvcmlnaW46Jywgb3JpZ2luKTtcclxuXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiBzaWduYXR1cmUgfSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBzaWduYXR1cmUgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBzaWduaW5nIG1lc3NhZ2U6JywgZXJyb3IpO1xyXG5cclxuICAgIC8vIExvZyBmYWlsZWQgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnblJlcXVlc3QuYWRkcmVzcyB8fCAndW5rbm93bicsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIC8vIFNFQ1VSSVRZOiBDbGVhbiB1cCBzZW5zaXRpdmUgZGF0YSBmcm9tIG1lbW9yeVxyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNvbnN0IHRlbXBPYmogPSB7IHBhc3N3b3JkIH07XHJcbiAgICAgIHNlY3VyZUNsZWFudXAodGVtcE9iaiwgWydwYXNzd29yZCddKTtcclxuICAgICAgcGFzc3dvcmQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHNpZ25lcikge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHNpZ25lcik7XHJcbiAgICAgIHNpZ25lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogSGFuZGxlIExlZGdlciBzaWduYXR1cmUgYXBwcm92YWwgKHByZS1zaWduZWQgaW4gcG9wdXApXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMZWRnZXJTaWduQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2lnbmF0dXJlKSB7XHJcbiAgaWYgKCFwZW5kaW5nU2lnblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgbWV0aG9kLCBzaWduUmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1NpZ25SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW5cclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIExvZyBzdWNjZXNzZnVsIExlZGdlciBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZCAmJiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnblJlcXVlc3Q/LmFkZHJlc3MgfHwgJ2xlZGdlcicsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCB8fCAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdoYXJkd2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNpZ25hdHVyZSBhbHJlYWR5IGNyZWF0ZWQgYnkgTGVkZ2VyIGluIHBvcHVwIC0ganVzdCBwYXNzIGl0IHRocm91Z2hcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIExlZGdlciBtZXNzYWdlIHNpZ25lZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiBzaWduYXR1cmUgfSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBzaWduYXR1cmUgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBwcm9jZXNzaW5nIExlZGdlciBzaWduYXR1cmU6JywgZXJyb3IpO1xyXG5cclxuICAgIC8vIExvZyBmYWlsZWQgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiBtZXRob2QgJiYgbWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykgPyAndHlwZWRfZGF0YScgOiAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIGFkZHJlc3M6IHNpZ25SZXF1ZXN0Py5hZGRyZXNzIHx8ICdsZWRnZXInLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiBtZXRob2QgfHwgJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdoYXJkd2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIHJlamVjdChlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBzaWduIHJlcXVlc3QgZGV0YWlscyAoZm9yIHBvcHVwKVxyXG5mdW5jdGlvbiBnZXRTaWduUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICByZXR1cm4gcGVuZGluZ1NpZ25SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0cyBhbmQgcG9wdXBcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIC8vIFJlY2VpdmVkIG1lc3NhZ2VcclxuXHJcbiAgKGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnV0FMTEVUX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaGFuZGxlV2FsbGV0UmVxdWVzdChtZXNzYWdlLCBzZW5kZXIpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyByZXNwb25zZVxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ09OTkVDVElPTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCBhcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGFwcHJvdmFsIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoYXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DT05ORUNUSU9OX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgcmVxdWVzdEluZm8gPSBnZXRDb25uZWN0aW9uUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdCBpbmZvXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DT05ORUNURURfU0lURVMnOlxyXG4gICAgICAgICAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBjb25uZWN0ZWQgc2l0ZXMnKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNpdGVzIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0RJU0NPTk5FQ1RfU0lURSc6XHJcbiAgICAgICAgICBhd2FpdCByZW1vdmVDb25uZWN0ZWRTaXRlKG1lc3NhZ2Uub3JpZ2luKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgZGlzY29ubmVjdCBjb25maXJtYXRpb25cclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgdHhBcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQsIG1lc3NhZ2Uuc2Vzc2lvblRva2VuLCBtZXNzYWdlLmdhc1ByaWNlLCBtZXNzYWdlLmN1c3RvbU5vbmNlLCBtZXNzYWdlLnR4SGFzaCwgbWVzc2FnZS50eERldGFpbHMpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyB0cmFuc2FjdGlvbiBhcHByb3ZhbCByZXNwb25zZVxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHR4QXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NSRUFURV9TRVNTSU9OJzpcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGF3YWl0IGNyZWF0ZVNlc3Npb24obWVzc2FnZS5wYXNzd29yZCwgbWVzc2FnZS53YWxsZXRJZCwgbWVzc2FnZS5kdXJhdGlvbk1zKTtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgc2Vzc2lvblRva2VuIH0pO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0lOVkFMSURBVEVfU0VTU0lPTic6XHJcbiAgICAgICAgICBjb25zdCBpbnZhbGlkYXRlZCA9IGludmFsaWRhdGVTZXNzaW9uKG1lc3NhZ2Uuc2Vzc2lvblRva2VuKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGludmFsaWRhdGVkIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0lOVkFMSURBVEVfQUxMX1NFU1NJT05TJzpcclxuICAgICAgICAgIGNvbnN0IGNvdW50ID0gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBjb3VudCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVFJBTlNBQ1RJT05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCB0eFJlcXVlc3RJbmZvID0gZ2V0VHJhbnNhY3Rpb25SZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgdHJhbnNhY3Rpb24gcmVxdWVzdCBpbmZvOicsIHR4UmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHR4UmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1RPS0VOX0FERF9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCB0b2tlbkFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlVG9rZW5BZGRBcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRva2VuIGFkZCBhcHByb3ZhbCByZXNwb25zZTonLCB0b2tlbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0b2tlbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTSUdOX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHNpZ25BcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVNpZ25BcHByb3ZhbChcclxuICAgICAgICAgICAgbWVzc2FnZS5yZXF1ZXN0SWQsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYXBwcm92ZWQsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2Vzc2lvblRva2VuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBzaWduIGFwcHJvdmFsIHJlc3BvbnNlOicsIHNpZ25BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoc2lnbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTSUdOX0FQUFJPVkFMX0xFREdFUic6XHJcbiAgICAgICAgICBjb25zdCBsZWRnZXJTaWduUmVzdWx0ID0gYXdhaXQgaGFuZGxlTGVkZ2VyU2lnbkFwcHJvdmFsKFxyXG4gICAgICAgICAgICBtZXNzYWdlLnJlcXVlc3RJZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5hcHByb3ZlZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zaWduYXR1cmVcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIExlZGdlciBzaWduIGFwcHJvdmFsIHJlc3BvbnNlOicsIGxlZGdlclNpZ25SZXN1bHQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGxlZGdlclNpZ25SZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9TSUdOX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnblJlcXVlc3RJbmZvID0gZ2V0U2lnblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBzaWduIHJlcXVlc3QgaW5mbzonLCBzaWduUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNpZ25SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RPS0VOX0FERF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHRva2VuUmVxdWVzdEluZm8gPSBnZXRUb2tlbkFkZFJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgcmVxdWVzdCBpbmZvOicsIHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vIFNpZ25pbmcgQXVkaXQgTG9nXHJcbiAgICAgICAgY2FzZSAnR0VUX1NJR05JTkdfQVVESVRfTE9HJzpcclxuICAgICAgICAgIGNvbnN0IHNpZ25pbmdMb2cgPSBhd2FpdCBnZXRTaWduaW5nQXVkaXRMb2coKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGxvZzogc2lnbmluZ0xvZyB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAvLyBUcmFuc2FjdGlvbiBIaXN0b3J5XHJcbiAgICAgICAgY2FzZSAnR0VUX1RYX0hJU1RPUlknOlxyXG4gICAgICAgICAgY29uc3QgdHhIaXN0b3J5TGlzdCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEhpc3RvcnkobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uczogdHhIaXN0b3J5TGlzdCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfUEVORElOR19UWF9DT1VOVCc6XHJcbiAgICAgICAgICBjb25zdCBwZW5kaW5nQ291bnQgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4Q291bnQobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGNvdW50OiBwZW5kaW5nQ291bnQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1BFTkRJTkdfVFhTJzpcclxuICAgICAgICAgIGNvbnN0IHBlbmRpbmdUeHMgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4cyhtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHJhbnNhY3Rpb25zOiBwZW5kaW5nVHhzIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9UWF9CWV9IQVNIJzpcclxuICAgICAgICAgIGNvbnN0IHR4RGV0YWlsID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4QnlIYXNoKG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS50eEhhc2gpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHJhbnNhY3Rpb246IHR4RGV0YWlsIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NBVkVfVFgnOlxyXG4gICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS50cmFuc2FjdGlvbik7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NBVkVfQU5EX01PTklUT1JfVFgnOlxyXG4gICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS50cmFuc2FjdGlvbik7XHJcblxyXG4gICAgICAgICAgLy8gU3RhcnQgbW9uaXRvcmluZyBmb3IgY29uZmlybWF0aW9uIGluIGJhY2tncm91bmRcclxuICAgICAgICAgIChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbmV0d29yayA9IG1lc3NhZ2UudHJhbnNhY3Rpb24ubmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHR4ID0geyBoYXNoOiBtZXNzYWdlLnRyYW5zYWN0aW9uLmhhc2ggfTtcclxuICAgICAgICAgICAgICBhd2FpdCB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgbWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBtb25pdG9yaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NMRUFSX1RYX0hJU1RPUlknOlxyXG4gICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LmNsZWFyVHhIaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DVVJSRU5UX0dBU19QUklDRSc6XHJcbiAgICAgICAgICBjb25zdCBnYXNQcmljZVJlc3VsdCA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrR2FzUHJpY2UobWVzc2FnZS5uZXR3b3JrKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShnYXNQcmljZVJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnUkVGUkVTSF9UWF9TVEFUVVMnOlxyXG4gICAgICAgICAgY29uc3QgcmVmcmVzaFJlc3VsdCA9IGF3YWl0IHJlZnJlc2hUcmFuc2FjdGlvblN0YXR1cyhcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5uZXR3b3JrXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlZnJlc2hSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1JFQlJPQURDQVNUX1RYJzpcclxuICAgICAgICAgIGNvbnN0IHJlYnJvYWRjYXN0UmVzdWx0ID0gYXdhaXQgcmVicm9hZGNhc3RUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UubmV0d29ya1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZWJyb2FkY2FzdFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU1BFRURfVVBfVFgnOlxyXG4gICAgICAgICAgY29uc3Qgc3BlZWRVcFJlc3VsdCA9IGF3YWl0IGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuZ2FzUHJpY2VNdWx0aXBsaWVyIHx8IDEuMixcclxuICAgICAgICAgICAgbWVzc2FnZS5jdXN0b21HYXNQcmljZSB8fCBudWxsXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNwZWVkVXBSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NBTkNFTF9UWCc6XHJcbiAgICAgICAgICBjb25zdCBjYW5jZWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuY3VzdG9tR2FzUHJpY2UgfHwgbnVsbFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShjYW5jZWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NQRUVEX1VQX1RYX0NPTVBMRVRFJzpcclxuICAgICAgICAgIC8vIFRyYW5zYWN0aW9uIHdhcyBhbHJlYWR5IHNpZ25lZCBhbmQgYnJvYWRjYXN0IGluIHBvcHVwIC0ganVzdCBzYXZlIHRvIGhpc3RvcnlcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2F2ZSBuZXcgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgICAgICAgICBjb25zdCBoaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgICAgICAgICAgaGFzaDogbWVzc2FnZS5uZXdUeEhhc2gsXHJcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICAgIGZyb206IG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgICB0bzogbWVzc2FnZS50eERldGFpbHMudG8sXHJcbiAgICAgICAgICAgICAgdmFsdWU6IG1lc3NhZ2UudHhEZXRhaWxzLnZhbHVlLFxyXG4gICAgICAgICAgICAgIGRhdGE6IG1lc3NhZ2UudHhEZXRhaWxzLmRhdGEgfHwgJzB4JyxcclxuICAgICAgICAgICAgICBnYXNQcmljZTogbWVzc2FnZS50eERldGFpbHMuZ2FzUHJpY2UsXHJcbiAgICAgICAgICAgICAgZ2FzTGltaXQ6IG1lc3NhZ2UudHhEZXRhaWxzLmdhc0xpbWl0LFxyXG4gICAgICAgICAgICAgIG5vbmNlOiBtZXNzYWdlLnR4RGV0YWlscy5ub25jZSxcclxuICAgICAgICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICAgICAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICAgICAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICAgICAgICAgIHR5cGU6IHR4SGlzdG9yeS5UWF9UWVBFUy5DT05UUkFDVFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heEZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICAgICAgaGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIGhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgICAgICAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIHJlcGxhY2VkXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2Uub3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgbmV3IHRyYW5zYWN0aW9uXHJcbiAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICAgICAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHsgaGFzaDogbWVzc2FnZS5uZXdUeEhhc2ggfSwgcHJvdmlkZXIsIG1lc3NhZ2UuYWRkcmVzcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZmljYXRpb25cclxuICAgICAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU3BlZCBVcCcsXHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogYE5ldyBUWDogJHttZXNzYWdlLm5ld1R4SGFzaC5zbGljZSgwLCAyMCl9Li4uYCxcclxuICAgICAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogbWVzc2FnZS5uZXdUeEhhc2ggfSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzYXZpbmcgc3BlZWQtdXAgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0FOQ0VMX1RYX0NPTVBMRVRFJzpcclxuICAgICAgICAgIC8vIENhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiB3YXMgYWxyZWFkeSBzaWduZWQgYW5kIGJyb2FkY2FzdCBpbiBwb3B1cCAtIGp1c3Qgc2F2ZSB0byBoaXN0b3J5XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnlcclxuICAgICAgICAgICAgY29uc3QgY2FuY2VsSGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICAgICAgICAgIGhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoLFxyXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgICAgICAgICBmcm9tOiBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgdG86IG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgICB2YWx1ZTogJzAnLFxyXG4gICAgICAgICAgICAgIGRhdGE6ICcweCcsXHJcbiAgICAgICAgICAgICAgZ2FzUHJpY2U6IG1lc3NhZ2UudHhEZXRhaWxzLmdhc1ByaWNlLFxyXG4gICAgICAgICAgICAgIGdhc0xpbWl0OiAnMjEwMDAnLFxyXG4gICAgICAgICAgICAgIG5vbmNlOiBtZXNzYWdlLnR4RGV0YWlscy5ub25jZSxcclxuICAgICAgICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICAgICAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICAgICAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdzZW5kJ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heEZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsSGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIGNhbmNlbEhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgICAgICAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIGNhbmNlbGxlZC9mYWlsZWRcclxuICAgICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS5vcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3RhcnQgbW9uaXRvcmluZyBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb25cclxuICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgICAgICAgIHdhaXRGb3JDb25maXJtYXRpb24oeyBoYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCB9LCBwcm92aWRlciwgbWVzc2FnZS5hZGRyZXNzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE5vdGlmaWNhdGlvblxyXG4gICAgICAgICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBDYW5jZWxsZWQnLFxyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdDYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gc2VudCcsXHJcbiAgICAgICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoIH0pO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2F2aW5nIGNhbmNlbCB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdVUERBVEVfUlBDX1BSSU9SSVRJRVMnOlxyXG4gICAgICAgICAgLy8gVXBkYXRlIFJQQyBwcmlvcml0aWVzIGluIHRoZSBycGMgbW9kdWxlXHJcbiAgICAgICAgICBpZiAobWVzc2FnZS5uZXR3b3JrICYmIG1lc3NhZ2UucHJpb3JpdGllcykge1xyXG4gICAgICAgICAgICBycGMudXBkYXRlUnBjUHJpb3JpdGllcyhtZXNzYWdlLm5ldHdvcmssIG1lc3NhZ2UucHJpb3JpdGllcyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDwn6uAIFVwZGF0ZWQgUlBDIHByaW9yaXRpZXMgZm9yICR7bWVzc2FnZS5uZXR3b3JrfWApO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTWlzc2luZyBuZXR3b3JrIG9yIHByaW9yaXRpZXMnIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBVbmtub3duIG1lc3NhZ2UgdHlwZTonLCBtZXNzYWdlLnR5cGUpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5rbm93biBtZXNzYWdlIHR5cGUnIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGhhbmRsaW5nIG1lc3NhZ2U6JywgZXJyb3IpO1xyXG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICB9XHJcbiAgfSkoKTtcclxuXHJcbiAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlXHJcbn0pO1xyXG5cclxuY29uc29sZS5sb2coJ/Cfq4AgSGVhcnRXYWxsZXQgc2VydmljZSB3b3JrZXIgcmVhZHknKTtcclxuIl0sIm5hbWVzIjpbImV0aGVycy5nZXRBZGRyZXNzIiwiZXRoZXJzLmdldEJ5dGVzIiwiZXRoZXJzLnRvVXRmOFN0cmluZyIsImV0aGVycy5pc0FkZHJlc3MiLCJycGMuZ2V0QmxvY2tOdW1iZXIiLCJycGMuZ2V0QmxvY2tCeU51bWJlciIsInJwYy5nZXRCYWxhbmNlIiwicnBjLmdldFRyYW5zYWN0aW9uQ291bnQiLCJycGMuZ2V0R2FzUHJpY2UiLCJycGMuZXN0aW1hdGVHYXMiLCJycGMuY2FsbCIsInJwYy5zZW5kUmF3VHJhbnNhY3Rpb24iLCJycGMuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0IiwicnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoIiwicnBjLmdldFByb3ZpZGVyIiwidHhIaXN0b3J5LlRYX1NUQVRVUyIsInR4SGlzdG9yeS5UWF9UWVBFUyIsInR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeSIsInJwYy5nZXRTYWZlR2FzUHJpY2UiLCJ0eEhpc3RvcnkuZ2V0VHhCeUhhc2giLCJ0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMiLCJycGMuZ2V0R2FzUHJpY2VSZWNvbW1lbmRhdGlvbnMiLCJycGMuZ2V0UmF3VHJhbnNhY3Rpb24iLCJycGMuYnJvYWRjYXN0VG9BbGxScGNzIiwidHhIaXN0b3J5LmdldFR4SGlzdG9yeSIsInR4SGlzdG9yeS5nZXRQZW5kaW5nVHhDb3VudCIsInR4SGlzdG9yeS5nZXRQZW5kaW5nVHhzIiwidHhIaXN0b3J5LmNsZWFyVHhIaXN0b3J5IiwicnBjLnVwZGF0ZVJwY1ByaW9yaXRpZXMiXSwibWFwcGluZ3MiOiI7QUFRQSxNQUFNLGlCQUFpQjtBQUN2QixNQUFNLDBCQUEwQjtBQUNoQyxNQUFNLHNCQUFzQjtBQUdyQixNQUFNLFdBQVc7QUFBQSxFQUV0QixVQUFVO0FBRVo7QUFHTyxNQUFNLFlBQVk7QUFBQSxFQUN2QixTQUFTO0FBQUEsRUFDVCxXQUFXO0FBQUEsRUFDWCxRQUFRO0FBQ1Y7QUFLTyxlQUFlLHVCQUF1QjtBQUMzQyxRQUFNLFdBQVcsTUFBTSxLQUFLLHVCQUF1QjtBQUNuRCxTQUFPLFlBQVk7QUFBQSxJQUNqQixTQUFTO0FBQUE7QUFBQSxJQUNULGFBQWE7QUFBQTtBQUFBLEVBQ2pCO0FBQ0E7QUFLQSxlQUFlLGdCQUFnQjtBQUM3QixRQUFNLFVBQVUsTUFBTSxLQUFLLGNBQWM7QUFDekMsU0FBTyxXQUFXLENBQUE7QUFDcEI7QUFLQSxlQUFlLGVBQWUsU0FBUztBQUNyQyxRQUFNLEtBQUssZ0JBQWdCLE9BQU87QUFDcEM7QUFL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
