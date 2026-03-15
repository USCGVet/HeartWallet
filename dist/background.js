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
    const wallet = await getActiveWallet();
    if (wallet && wallet.address) {
      return { result: [wallet.address] };
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
async function handleSwitchChain(params, origin) {
  if (!params || !params[0] || !params[0].chainId) {
    return { error: { code: -32602, message: "Invalid params" } };
  }
  if (origin && !await isSiteConnected(origin)) {
    return { error: { code: 4100, message: "Unauthorized: site not connected. Call eth_requestAccounts first." } };
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
    "GET_CONNECTION_REQUEST",
    "GET_CONNECTED_SITES",
    "GET_TRANSACTION_REQUEST",
    "GET_SIGN_REQUEST",
    "GET_TOKEN_ADD_REQUEST"
  ]);
  if (PRIVILEGED_MESSAGES.has(message.type) && sender.tab) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRBbGxIaXN0b3J5KCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBsb2FkKFRYX0hJU1RPUllfS0VZKTtcclxuICByZXR1cm4gaGlzdG9yeSB8fCB7fTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpIHtcclxuICBhd2FpdCBzYXZlKFRYX0hJU1RPUllfS0VZLCBoaXN0b3J5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgYSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgdHhEYXRhKSB7XHJcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRUeEhpc3RvcnlTZXR0aW5ncygpO1xyXG4gIGlmICghc2V0dGluZ3MuZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuOyAvLyBIaXN0b3J5IGRpc2FibGVkXHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBhZGRyZXNzIGhpc3RvcnkgaWYgZG9lc24ndCBleGlzdFxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0gPSB7IHRyYW5zYWN0aW9uczogW10gfTtcclxuICB9XHJcblxyXG4gIC8vIEFkZCBuZXcgdHJhbnNhY3Rpb24gYXQgYmVnaW5uaW5nIChuZXdlc3QgZmlyc3QpXHJcbiAgY29uc3QgdHhFbnRyeSA9IHtcclxuICAgIGhhc2g6IHR4RGF0YS5oYXNoLFxyXG4gICAgdGltZXN0YW1wOiB0eERhdGEudGltZXN0YW1wIHx8IERhdGUubm93KCksXHJcbiAgICBmcm9tOiB0eERhdGEuZnJvbS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgdG86IHR4RGF0YS50byA/IHR4RGF0YS50by50b0xvd2VyQ2FzZSgpIDogbnVsbCxcclxuICAgIHZhbHVlOiB0eERhdGEudmFsdWUgfHwgJzAnLFxyXG4gICAgZGF0YTogdHhEYXRhLmRhdGEgfHwgJzB4JyxcclxuICAgIGdhc1ByaWNlOiB0eERhdGEuZ2FzUHJpY2UsXHJcbiAgICBnYXNMaW1pdDogdHhEYXRhLmdhc0xpbWl0LFxyXG4gICAgbm9uY2U6IHR4RGF0YS5ub25jZSxcclxuICAgIG5ldHdvcms6IHR4RGF0YS5uZXR3b3JrLFxyXG4gICAgc3RhdHVzOiB0eERhdGEuc3RhdHVzIHx8IFRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgYmxvY2tOdW1iZXI6IHR4RGF0YS5ibG9ja051bWJlciB8fCBudWxsLFxyXG4gICAgdHlwZTogdHhEYXRhLnR5cGUgfHwgVFhfVFlQRVMuQ09OVFJBQ1RcclxuICB9O1xyXG5cclxuICAvLyBTdG9yZSBFSVAtMTU1OSBmaWVsZHMgaWYgcHJlc2VudCAoZm9yIHByb3BlciBzcGVlZC11cC9jYW5jZWwpXHJcbiAgaWYgKHR4RGF0YS5tYXhGZWVQZXJHYXMpIHtcclxuICAgIHR4RW50cnkubWF4RmVlUGVyR2FzID0gdHhEYXRhLm1heEZlZVBlckdhcztcclxuICB9XHJcbiAgaWYgKHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgdHhFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICB9XHJcblxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMudW5zaGlmdCh0eEVudHJ5KTtcclxuXHJcbiAgLy8gRW5mb3JjZSBtYXggbGltaXQgKEZJRk8gLSByZW1vdmUgb2xkZXN0KVxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLmxlbmd0aCA+IE1BWF9UWFNfUEVSX0FERFJFU1MpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgPSBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLnNsaWNlKDAsIE1BWF9UWFNfUEVSX0FERFJFU1MpO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZUFsbEhpc3RvcnkoaGlzdG9yeSk7XHJcbiAgLy8gVHJhbnNhY3Rpb24gYWRkZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIHN0YXR1cywgYmxvY2tOdW1iZXIgPSBudWxsKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eEluZGV4ID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5maW5kSW5kZXgoXHJcbiAgICB0eCA9PiB0eC5oYXNoLnRvTG93ZXJDYXNlKCkgPT09IHR4SGFzaC50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuXHJcbiAgaWYgKHR4SW5kZXggPT09IC0xKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLnN0YXR1cyA9IHN0YXR1cztcclxuICBpZiAoYmxvY2tOdW1iZXIgIT09IG51bGwpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnNbdHhJbmRleF0uYmxvY2tOdW1iZXIgPSBibG9ja051bWJlcjtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbnMgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhzKGFkZHJlc3MpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maWx0ZXIodHggPT4gdHguc3RhdHVzID09PSBUWF9TVEFUVVMuUEVORElORyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbiBjb3VudCBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdUeENvdW50KGFkZHJlc3MpIHtcclxuICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKTtcclxuICByZXR1cm4gcGVuZGluZ1R4cy5sZW5ndGg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFR4QnlIYXNoKGFkZHJlc3MsIHR4SGFzaCkge1xyXG4gIGNvbnN0IHR4cyA9IGF3YWl0IGdldFR4SGlzdG9yeShhZGRyZXNzKTtcclxuICByZXR1cm4gdHhzLmZpbmQodHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyVHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKGhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgZGVsZXRlIGhpc3RvcnlbYWRkcmVzc0xvd2VyXTtcclxuICAgIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbiAgfVxyXG59XHJcblxyXG4iLCIvKipcclxuICogY29yZS90eFZhbGlkYXRpb24uanNcclxuICpcclxuICogVHJhbnNhY3Rpb24gdmFsaWRhdGlvbiB1dGlsaXRpZXMgZm9yIHNlY3VyaXR5XHJcbiAqIFZhbGlkYXRlcyBhbGwgdHJhbnNhY3Rpb24gcGFyYW1ldGVycyBiZWZvcmUgcHJvY2Vzc2luZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgdHJhbnNhY3Rpb24gcmVxdWVzdCBmcm9tIGEgZEFwcFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHhSZXF1ZXN0IC0gVHJhbnNhY3Rpb24gcmVxdWVzdCBvYmplY3RcclxuICogQHBhcmFtIHtudW1iZXJ9IG1heEdhc1ByaWNlR3dlaSAtIE1heGltdW0gYWxsb3dlZCBnYXMgcHJpY2UgaW4gR3dlaSAoZGVmYXVsdCAxMDAwKVxyXG4gKiBAcmV0dXJucyB7eyB2YWxpZDogYm9vbGVhbiwgZXJyb3JzOiBzdHJpbmdbXSwgc2FuaXRpemVkOiBPYmplY3QgfX1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSA9IDEwMDApIHtcclxuICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICBjb25zdCBzYW5pdGl6ZWQgPSB7fTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3RvJyBhZGRyZXNzIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0LnRvICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnRvICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC50byAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkSGV4QWRkcmVzcyh0eFJlcXVlc3QudG8pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInRvXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLnRvID0gZXRoZXJzLmdldEFkZHJlc3ModHhSZXF1ZXN0LnRvKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdmcm9tJyBhZGRyZXNzIGlmIHByZXNlbnQgKHNob3VsZCBtYXRjaCB3YWxsZXQgYWRkcmVzcylcclxuICBpZiAodHhSZXF1ZXN0LmZyb20gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZnJvbSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZnJvbSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLmZyb20gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QuZnJvbSk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICd2YWx1ZScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LnZhbHVlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnZhbHVlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QudmFsdWUpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInZhbHVlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWVCaWdJbnQgPSBCaWdJbnQodHhSZXF1ZXN0LnZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWVCaWdJbnQgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLnZhbHVlID0gdHhSZXF1ZXN0LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQudmFsdWUgPSAnMHgwJzsgLy8gRGVmYXVsdCB0byAwXHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZGF0YScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LmRhdGEgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZGF0YSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZGF0YSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZGF0YVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhEYXRhKHR4UmVxdWVzdC5kYXRhKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSB2YWxpZCBoZXggZGF0YScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2FuaXRpemVkLmRhdGEgPSB0eFJlcXVlc3QuZGF0YTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgc2FuaXRpemVkLmRhdGEgPSAnMHgnOyAvLyBEZWZhdWx0IHRvIGVtcHR5IGRhdGFcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdnYXMnIG9yICdnYXNMaW1pdCcgZmllbGRcclxuICAvLyBTRUNVUklUWTogUmVhc29uYWJsZSBtYXhpbXVtIGlzIDEwTSBnYXMgdG8gcHJldmVudCBmZWUgc2NhbXNcclxuICAvLyBNb3N0IHRyYW5zYWN0aW9uczogMjFrLTIwMGsgZ2FzLiBDb21wbGV4IERlRmk6IDIwMGstMU0gZ2FzLlxyXG4gIC8vIEV0aGVyZXVtL1B1bHNlQ2hhaW4gYmxvY2sgbGltaXQgaXMgfjMwTSwgYnV0IHNpbmdsZSBUWCByYXJlbHkgbmVlZHMgPjEwTVxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LmdhcyAhPT0gbnVsbCkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGV4VmFsdWUodHhSZXF1ZXN0LmdhcykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhcyk7XHJcbiAgICAgICAgaWYgKGdhc0xpbWl0IDwgMjEwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBsaW1pdCB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAxMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBoaWdoIChtYXhpbXVtIDEwMDAwMDAwKS4gTW9zdCB0cmFuc2FjdGlvbnMgbmVlZCA8MU0gZ2FzLicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzID0gdHhSZXF1ZXN0LmdhcztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzTGltaXQpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc0xpbWl0KTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGxvdyAobWluaW11bSAyMTAwMCknKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc0xpbWl0ID4gMTAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIHRvbyBoaWdoIChtYXhpbXVtIDEwMDAwMDAwKS4gTW9zdCB0cmFuc2FjdGlvbnMgbmVlZCA8MU0gZ2FzLicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzTGltaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZ2FzUHJpY2UnIGZpZWxkIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzUHJpY2UpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzUHJpY2UgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc1ByaWNlKTtcclxuICAgICAgICBjb25zdCBtYXhHYXNQcmljZVdlaSA9IEJpZ0ludChtYXhHYXNQcmljZUd3ZWkpICogQmlnSW50KCcxMDAwMDAwMDAwJyk7IC8vIENvbnZlcnQgR3dlaSB0byBXZWlcclxuICAgICAgICBpZiAoZ2FzUHJpY2UgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc1ByaWNlID4gbWF4R2FzUHJpY2VXZWkpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKGBJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZXhjZWVkcyBtYXhpbXVtIG9mICR7bWF4R2FzUHJpY2VHd2VpfSBHd2VpYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNQcmljZSA9IHR4UmVxdWVzdC5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdub25jZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5ub25jZSkgJiYgdHlwZW9mIHR4UmVxdWVzdC5ub25jZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIG9yIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJyBcclxuICAgICAgICAgID8gQmlnSW50KHR4UmVxdWVzdC5ub25jZSkgXHJcbiAgICAgICAgICA6IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpO1xyXG4gICAgICAgIGlmIChub25jZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9uY2UgPiBCaWdJbnQoJzkwMDcxOTkyNTQ3NDA5OTEnKSkgeyAvLyBKYXZhU2NyaXB0IHNhZmUgaW50ZWdlciBtYXhcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgdW5yZWFzb25hYmx5IGhpZ2gnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLm5vbmNlID0gdHhSZXF1ZXN0Lm5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gbXVzdCBoYXZlIGVpdGhlciAndG8nIG9yICdkYXRhJyAoY29udHJhY3QgY3JlYXRpb24pXHJcbiAgaWYgKCFzYW5pdGl6ZWQudG8gJiYgKCFzYW5pdGl6ZWQuZGF0YSB8fCBzYW5pdGl6ZWQuZGF0YSA9PT0gJzB4JykpIHtcclxuICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBtdXN0IGhhdmUgXCJ0b1wiIGFkZHJlc3Mgb3IgXCJkYXRhXCIgZm9yIGNvbnRyYWN0IGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnMsXHJcbiAgICBzYW5pdGl6ZWRcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIEV0aGVyZXVtIGFkZHJlc3MgKGhleCBmb3JtYXQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhZGRyZXNzIC0gQWRkcmVzcyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhBZGRyZXNzKGFkZHJlc3MpIHtcclxuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSA0MiBjaGFyYWN0ZXJzOiAweCArIDQwIGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdezQwfSQvLnRlc3QoYWRkcmVzcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBoZXggdmFsdWUgKGZvciBhbW91bnRzLCBnYXMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEhleCB2YWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBzdGFydCB3aXRoIDB4IGFuZCBjb250YWluIG9ubHkgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0rJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaGV4IGRhdGEgKGZvciB0cmFuc2FjdGlvbiBkYXRhIGZpZWxkKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIEhleCBkYXRhIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleERhdGEoZGF0YSkge1xyXG4gIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDB4IG9yIDB4IGZvbGxvd2VkIGJ5IGV2ZW4gbnVtYmVyIG9mIGhleCBkaWdpdHNcclxuICBpZiAoZGF0YSA9PT0gJzB4JykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSokLy50ZXN0KGRhdGEpICYmIGRhdGEubGVuZ3RoICUgMiA9PT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBhbiBlcnJvciBtZXNzYWdlIGZvciBzYWZlIGRpc3BsYXlcclxuICogUmVtb3ZlcyBhbnkgSFRNTCwgc2NyaXB0cywgYW5kIGNvbnRyb2wgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUVycm9yTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiA1MDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgNDk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGNvcmUvc2lnbmluZy5qc1xyXG4gKlxyXG4gKiBNZXNzYWdlIHNpZ25pbmcgZnVuY3Rpb25hbGl0eSBmb3IgRUlQLTE5MSBhbmQgRUlQLTcxMlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogU2lnbnMgYSBtZXNzYWdlIHVzaW5nIEVJUC0xOTEgKHBlcnNvbmFsX3NpZ24pXHJcbiAqIFRoaXMgcHJlcGVuZHMgXCJcXHgxOUV0aGVyZXVtIFNpZ25lZCBNZXNzYWdlOlxcblwiICsgbGVuKG1lc3NhZ2UpIHRvIHRoZSBtZXNzYWdlXHJcbiAqIGJlZm9yZSBzaWduaW5nLCB3aGljaCBwcmV2ZW50cyBzaWduaW5nIGFyYml0cmFyeSB0cmFuc2FjdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBzaWduIChoZXggc3RyaW5nIG9yIFVURi04IHN0cmluZylcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBlcnNvbmFsU2lnbihzaWduZXIsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25NZXNzYWdlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWQsIGRlY29kZSBpdCBmaXJzdFxyXG4gICAgLy8gZXRoZXJzLmpzIHNpZ25NZXNzYWdlIGV4cGVjdHMgYSBzdHJpbmcgb3IgVWludDhBcnJheVxyXG4gICAgbGV0IG1lc3NhZ2VUb1NpZ24gPSBtZXNzYWdlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIC8vIEl0J3MgYSBoZXggc3RyaW5nLCBjb252ZXJ0IHRvIFVURi04XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gVHJ5IHRvIGRlY29kZSBhcyBoZXhcclxuICAgICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIElmIGRlY29kaW5nIGZhaWxzLCB1c2UgdGhlIGhleCBzdHJpbmcgYXMtaXNcclxuICAgICAgICAvLyBldGhlcnMgd2lsbCBoYW5kbGUgaXRcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gbWVzc2FnZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdGhlIG1lc3NhZ2UgKGV0aGVycy5qcyBhdXRvbWF0aWNhbGx5IGFwcGxpZXMgRUlQLTE5MSBmb3JtYXQpXHJcbiAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBzaWduZXIuc2lnbk1lc3NhZ2UobWVzc2FnZVRvU2lnbik7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiBtZXNzYWdlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2lnbnMgdHlwZWQgZGF0YSB1c2luZyBFSVAtNzEyXHJcbiAqIFVzZWQgYnkgZEFwcHMgZm9yIHN0cnVjdHVyZWQgZGF0YSBzaWduaW5nIChwZXJtaXRzLCBtZXRhLXRyYW5zYWN0aW9ucywgZXRjLilcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZERhdGEgLSBFSVAtNzEyIHR5cGVkIGRhdGEgb2JqZWN0IHdpdGggZG9tYWluLCB0eXBlcywgYW5kIG1lc3NhZ2VcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25UeXBlZERhdGEoc2lnbmVyLCB0eXBlZERhdGEpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25UeXBlZERhdGEgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaWduZXIgcHJvdmlkZWQnKTtcclxuICB9XHJcblxyXG4gIGlmICghdHlwZWREYXRhKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1R5cGVkIGRhdGEgaXMgcmVxdWlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHR5cGVkIGRhdGEgc3RydWN0dXJlXHJcbiAgaWYgKCF0eXBlZERhdGEuZG9tYWluIHx8ICF0eXBlZERhdGEudHlwZXMgfHwgIXR5cGVkRGF0YS5tZXNzYWdlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgRUlQLTcxMiB0eXBlZCBkYXRhOiBtaXNzaW5nIGRvbWFpbiwgdHlwZXMsIG9yIG1lc3NhZ2UnKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBFeHRyYWN0IHByaW1hcnlUeXBlIChpZiBub3QgcHJvdmlkZWQsIHRyeSB0byBpbmZlciBpdClcclxuICAgIGxldCBwcmltYXJ5VHlwZSA9IHR5cGVkRGF0YS5wcmltYXJ5VHlwZTtcclxuXHJcbiAgICBpZiAoIXByaW1hcnlUeXBlKSB7XHJcbiAgICAgIC8vIFRyeSB0byBpbmZlciBwcmltYXJ5IHR5cGUgZnJvbSB0eXBlcyBvYmplY3RcclxuICAgICAgLy8gSXQncyB0aGUgdHlwZSB0aGF0J3Mgbm90IFwiRUlQNzEyRG9tYWluXCJcclxuICAgICAgY29uc3QgdHlwZU5hbWVzID0gT2JqZWN0LmtleXModHlwZWREYXRhLnR5cGVzKS5maWx0ZXIodCA9PiB0ICE9PSAnRUlQNzEyRG9tYWluJyk7XHJcbiAgICAgIGlmICh0eXBlTmFtZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgcHJpbWFyeVR5cGUgPSB0eXBlTmFtZXNbMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgaW5mZXIgcHJpbWFyeVR5cGUgLSBwbGVhc2Ugc3BlY2lmeSBpdCBleHBsaWNpdGx5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBWYWxpZGF0ZSB0aGF0IHByaW1hcnlUeXBlIGV4aXN0cyBpbiB0eXBlc1xyXG4gICAgaWYgKCF0eXBlZERhdGEudHlwZXNbcHJpbWFyeVR5cGVdKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJpbWFyeSB0eXBlIFwiJHtwcmltYXJ5VHlwZX1cIiBub3QgZm91bmQgaW4gdHlwZXMgZGVmaW5pdGlvbmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdXNpbmcgZXRoZXJzLmpzIHNpZ25UeXBlZERhdGFcclxuICAgIC8vIGV0aGVycyB2NiB1c2VzOiBzaWduVHlwZWREYXRhKGRvbWFpbiwgdHlwZXMsIHZhbHVlKVxyXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2lnbmVyLnNpZ25UeXBlZERhdGEoXHJcbiAgICAgIHR5cGVkRGF0YS5kb21haW4sXHJcbiAgICAgIHR5cGVkRGF0YS50eXBlcyxcclxuICAgICAgdHlwZWREYXRhLm1lc3NhZ2VcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiB0eXBlZCBkYXRhOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAtIFJQQyBtZXRob2QgKHBlcnNvbmFsX3NpZ24sIGV0aF9zaWduVHlwZWREYXRhX3Y0LCBldGMuKVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwYXJhbXMgLSBSUEMgcGFyYW1ldGVyc1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSB7IHZhbGlkOiBib29sZWFuLCBlcnJvcj86IHN0cmluZywgc2FuaXRpemVkPzogT2JqZWN0IH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKSB7XHJcbiAgaWYgKCFtZXRob2QgfHwgIXBhcmFtcyB8fCAhQXJyYXkuaXNBcnJheShwYXJhbXMpKSB7XHJcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCByZXF1ZXN0IGZvcm1hdCcgfTtcclxuICB9XHJcblxyXG4gIHN3aXRjaCAobWV0aG9kKSB7XHJcbiAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduJzogLy8gTm90ZTogZXRoX3NpZ24gaXMgZGFuZ2Vyb3VzIGFuZCBzaG91bGQgc2hvdyBzdHJvbmcgd2FybmluZ1xyXG4gICAgICBpZiAocGFyYW1zLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXJzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtZXNzYWdlID0gcGFyYW1zWzBdO1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzFdO1xyXG5cclxuICAgICAgaWYgKCFtZXNzYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01lc3NhZ2UgaXMgZW1wdHknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYWRkcmVzcyB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyZXNzKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhbml0aXplIG1lc3NhZ2UgKGNvbnZlcnQgdG8gc3RyaW5nIGlmIG5lZWRlZClcclxuICAgICAgY29uc3Qgc2FuaXRpemVkTWVzc2FnZSA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IG1lc3NhZ2UgOiBTdHJpbmcobWVzc2FnZSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHNhbml0aXplZDoge1xyXG4gICAgICAgICAgbWVzc2FnZTogc2FuaXRpemVkTWVzc2FnZSxcclxuICAgICAgICAgIGFkZHJlc3M6IGV0aGVycy5nZXRBZGRyZXNzKGFkZHJlc3MpIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVycycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYWRkciA9IHBhcmFtc1swXTtcclxuICAgICAgbGV0IHR5cGVkRGF0YSA9IHBhcmFtc1sxXTtcclxuXHJcbiAgICAgIGlmICghYWRkciB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBhcnNlIHR5cGVkIGRhdGEgaWYgaXQncyBhIHN0cmluZ1xyXG4gICAgICBpZiAodHlwZW9mIHR5cGVkRGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdHlwZWREYXRhID0gSlNPTi5wYXJzZSh0eXBlZERhdGEpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgdHlwZWQgZGF0YSBmb3JtYXQnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWYWxpZGF0ZSB0eXBlZCBkYXRhIHN0cnVjdHVyZVxyXG4gICAgICBpZiAoIXR5cGVkRGF0YSB8fCB0eXBlb2YgdHlwZWREYXRhICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdUeXBlZCBkYXRhIG11c3QgYmUgYW4gb2JqZWN0JyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXR5cGVkRGF0YS5kb21haW4gfHwgIXR5cGVkRGF0YS50eXBlcyB8fCAhdHlwZWREYXRhLm1lc3NhZ2UpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnVHlwZWQgZGF0YSBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyAoZG9tYWluLCB0eXBlcywgbWVzc2FnZSknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsaWQ6IHRydWUsXHJcbiAgICAgICAgc2FuaXRpemVkOiB7XHJcbiAgICAgICAgICBhZGRyZXNzOiBldGhlcnMuZ2V0QWRkcmVzcyhhZGRyKSxcclxuICAgICAgICAgIHR5cGVkRGF0YTogdHlwZWREYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBVbnN1cHBvcnRlZCBzaWduaW5nIG1ldGhvZDogJHttZXRob2R9YCB9O1xyXG4gIH1cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGJhY2tncm91bmQvc2VydmljZS13b3JrZXIuanNcclxuICpcclxuICogQmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlciBmb3IgSGVhcnRXYWxsZXRcclxuICogSGFuZGxlcyBSUEMgcmVxdWVzdHMgZnJvbSBkQXBwcyBhbmQgbWFuYWdlcyB3YWxsZXQgc3RhdGVcclxuICovXHJcblxyXG5pbXBvcnQgeyBnZXRBY3RpdmVXYWxsZXQsIHVubG9ja1dhbGxldCwgc2VjdXJlQ2xlYW51cCwgc2VjdXJlQ2xlYW51cFNpZ25lciB9IGZyb20gJy4uL2NvcmUvd2FsbGV0LmpzJztcclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4uL2NvcmUvc3RvcmFnZS5qcyc7XHJcbmltcG9ydCAqIGFzIHJwYyBmcm9tICcuLi9jb3JlL3JwYy5qcyc7XHJcbmltcG9ydCAqIGFzIHR4SGlzdG9yeSBmcm9tICcuLi9jb3JlL3R4SGlzdG9yeS5qcyc7XHJcbmltcG9ydCB7IHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0LCBzYW5pdGl6ZUVycm9yTWVzc2FnZSB9IGZyb20gJy4uL2NvcmUvdHhWYWxpZGF0aW9uLmpzJztcclxuaW1wb3J0IHsgcGVyc29uYWxTaWduLCBzaWduVHlwZWREYXRhLCB2YWxpZGF0ZVNpZ25SZXF1ZXN0IH0gZnJvbSAnLi4vY29yZS9zaWduaW5nLmpzJztcclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8vIFNlcnZpY2Ugd29ya2VyIGxvYWRlZFxyXG5cclxuLy8gTmV0d29yayBjaGFpbiBJRHNcclxuY29uc3QgQ0hBSU5fSURTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6ICcweDNBRicsIC8vIDk0M1xyXG4gICdwdWxzZWNoYWluJzogJzB4MTcxJywgLy8gMzY5XHJcbiAgJ2V0aGVyZXVtJzogJzB4MScsIC8vIDFcclxuICAnc2Vwb2xpYSc6ICcweEFBMzZBNycgLy8gMTExNTUxMTFcclxufTtcclxuXHJcbi8vIFN0b3JhZ2Uga2V5c1xyXG5jb25zdCBDT05ORUNURURfU0lURVNfS0VZID0gJ2Nvbm5lY3RlZF9zaXRlcyc7XHJcblxyXG4vLyBQZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdHMgKG9yaWdpbiAtPiB7IHJlc29sdmUsIHJlamVjdCwgdGFiSWQgfSlcclxuY29uc3QgcGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gU0lHTklORyBBVURJVCBMT0cgPT09PT1cclxuLy8gU3RvcmVzIHJlY2VudCBzaWduaW5nIG9wZXJhdGlvbnMgZm9yIHNlY3VyaXR5IGF1ZGl0aW5nIChpbi1tZW1vcnksIGNsZWFyZWQgb24gc2VydmljZSB3b3JrZXIgcmVzdGFydClcclxuY29uc3QgU0lHTklOR19MT0dfS0VZID0gJ3NpZ25pbmdfYXVkaXRfbG9nJztcclxuY29uc3QgTUFYX1NJR05JTkdfTE9HX0VOVFJJRVMgPSAxMDA7XHJcblxyXG4vKipcclxuICogTG9nIGEgc2lnbmluZyBvcGVyYXRpb24gZm9yIGF1ZGl0IHB1cnBvc2VzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIExvZyBlbnRyeSBkZXRhaWxzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRyeS50eXBlIC0gVHlwZSBvZiBzaWduaW5nICh0cmFuc2FjdGlvbiwgcGVyc29uYWxfc2lnbiwgdHlwZWRfZGF0YSlcclxuICogQHBhcmFtIHtzdHJpbmd9IGVudHJ5LmFkZHJlc3MgLSBXYWxsZXQgYWRkcmVzcyB0aGF0IHNpZ25lZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkub3JpZ2luIC0gZEFwcCBvcmlnaW4gdGhhdCByZXF1ZXN0ZWQgdGhlIHNpZ25hdHVyZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkubWV0aG9kIC0gUlBDIG1ldGhvZCB1c2VkXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW50cnkuc3VjY2VzcyAtIFdoZXRoZXIgc2lnbmluZyBzdWNjZWVkZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS50eEhhc2hdIC0gVHJhbnNhY3Rpb24gaGFzaCAoZm9yIHRyYW5zYWN0aW9ucylcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS5lcnJvcl0gLSBFcnJvciBtZXNzYWdlIChpZiBmYWlsZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBsb2dTaWduaW5nT3BlcmF0aW9uKGVudHJ5KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGxvZ0VudHJ5ID0ge1xyXG4gICAgICAuLi5lbnRyeSxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdldCBleGlzdGluZyBsb2dcclxuICAgIGNvbnN0IGV4aXN0aW5nTG9nID0gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEFkZCBuZXcgZW50cnkgYXQgdGhlIGJlZ2lubmluZ1xyXG4gICAgZXhpc3RpbmdMb2cudW5zaGlmdChsb2dFbnRyeSk7XHJcblxyXG4gICAgLy8gVHJpbSB0byBtYXggZW50cmllc1xyXG4gICAgaWYgKGV4aXN0aW5nTG9nLmxlbmd0aCA+IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTKSB7XHJcbiAgICAgIGV4aXN0aW5nTG9nLmxlbmd0aCA9IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgbG9nXHJcbiAgICBhd2FpdCBzYXZlKFNJR05JTkdfTE9HX0tFWSwgZXhpc3RpbmdMb2cpO1xyXG5cclxuICAgIC8vIEFsc28gbG9nIHRvIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAgY29uc3QgaWNvbiA9IGVudHJ5LnN1Y2Nlc3MgPyAn4pyFJyA6ICfinYwnO1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgJHtpY29ufSBTaWduaW5nIGF1ZGl0OiAke2VudHJ5LnR5cGV9IGZyb20gJHtlbnRyeS5vcmlnaW59IC0gJHtlbnRyeS5zdWNjZXNzID8gJ1NVQ0NFU1MnIDogJ0ZBSUxFRCd9YCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIERvbid0IGxldCBsb2dnaW5nIGZhaWx1cmVzIGFmZmVjdCBzaWduaW5nIG9wZXJhdGlvbnNcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgbG9nZ2luZyBzaWduaW5nIG9wZXJhdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHNpZ25pbmcgYXVkaXQgbG9nXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gQXJyYXkgb2YgbG9nIGVudHJpZXNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNpZ25pbmdBdWRpdExvZygpIHtcclxuICByZXR1cm4gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG59XHJcblxyXG4vLyA9PT09PSBTRVNTSU9OIE1BTkFHRU1FTlQgPT09PT1cclxuLy8gU2Vzc2lvbiB0b2tlbnMgc3RvcmVkIGluIG1lbW9yeSAoY2xlYXJlZCB3aGVuIHNlcnZpY2Ugd29ya2VyIHRlcm1pbmF0ZXMpXHJcbi8vIFNFQ1VSSVRZIE5PVEU6IFNlcnZpY2Ugd29ya2VycyBjYW4gYmUgdGVybWluYXRlZCBieSBDaHJvbWUgYXQgYW55IHRpbWUsIHdoaWNoIGNsZWFycyBhbGxcclxuLy8gc2Vzc2lvbiBkYXRhLiBUaGlzIGlzIGludGVudGlvbmFsIC0gd2UgZG9uJ3Qgd2FudCBwYXNzd29yZHMgcGVyc2lzdGluZyBsb25nZXIgdGhhbiBuZWVkZWQuXHJcbi8vIFNlc3Npb25zIGFyZSBlbmNyeXB0ZWQgaW4gbWVtb3J5IGFzIGFuIGFkZGl0aW9uYWwgc2VjdXJpdHkgbGF5ZXIuXHJcbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpOyAvLyBzZXNzaW9uVG9rZW4gLT4geyBlbmNyeXB0ZWRQYXNzd29yZCwgd2FsbGV0SWQsIGV4cGlyZXNBdCwgc2FsdCB9XHJcblxyXG4vLyBTZXNzaW9uIGVuY3J5cHRpb24ga2V5IChyZWdlbmVyYXRlZCBvbiBzZXJ2aWNlIHdvcmtlciBzdGFydClcclxubGV0IHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHNlc3Npb24gZW5jcnlwdGlvbiBrZXkgdXNpbmcgV2ViIENyeXB0byBBUElcclxuICogS2V5IGlzIHJlZ2VuZXJhdGVkIGVhY2ggdGltZSBzZXJ2aWNlIHdvcmtlciBzdGFydHMgKG1lbW9yeSBvbmx5LCBuZXZlciBwZXJzaXN0ZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKSB7XHJcbiAgaWYgKCFzZXNzaW9uRW5jcnlwdGlvbktleSkge1xyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gMjU2LWJpdCBrZXkgZm9yIEFFUy1HQ00gZW5jcnlwdGlvblxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcclxuICAgICAgZmFsc2UsIC8vIE5vdCBleHRyYWN0YWJsZVxyXG4gICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY3J5cHRzIHBhc3N3b3JkIGZvciBzZXNzaW9uIHN0b3JhZ2UgdXNpbmcgQUVTLUdDTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBQYXNzd29yZCB0byBlbmNyeXB0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtlbmNyeXB0ZWQ6IEFycmF5QnVmZmVyLCBpdjogVWludDhBcnJheX0+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCkge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICBjb25zdCBwYXNzd29yZERhdGEgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcbiAgXHJcbiAgLy8gR2VuZXJhdGUgcmFuZG9tIElWIGZvciB0aGlzIGVuY3J5cHRpb25cclxuICAvLyBTRUNVUklUWTogSVYgdW5pcXVlbmVzcyBpcyBjcnlwdG9ncmFwaGljYWxseSBndWFyYW50ZWVkIGJ5IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKVxyXG4gIC8vIHdoaWNoIHVzZXMgdGhlIGJyb3dzZXIncyBDU1BSTkcgKENyeXB0b2dyYXBoaWNhbGx5IFNlY3VyZSBQc2V1ZG8tUmFuZG9tIE51bWJlciBHZW5lcmF0b3IpXHJcbiAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7XHJcbiAgXHJcbiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIHBhc3N3b3JkRGF0YVxyXG4gICk7XHJcbiAgXHJcbiAgcmV0dXJuIHsgZW5jcnlwdGVkLCBpdiB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVjcnlwdHMgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkIC0gRW5jcnlwdGVkIHBhc3N3b3JkIGRhdGFcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBpdiAtIEluaXRpYWxpemF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oZW5jcnlwdGVkLCBpdikge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIFxyXG4gIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBlbmNyeXB0ZWRcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuICByZXR1cm4gZGVjb2Rlci5kZWNvZGUoZGVjcnlwdGVkKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlc3Npb24gdG9rZW5cclxuZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBuZXcgc2Vzc2lvblxyXG4vLyBTRUNVUklUWTogRGVmYXVsdCBzZXNzaW9uIGR1cmF0aW9uIHJlZHVjZWQgdG8gMTUgbWludXRlcyB0byBtaW5pbWl6ZSBwYXNzd29yZCBleHBvc3VyZSBpbiBtZW1vcnlcclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihwYXNzd29yZCwgd2FsbGV0SWQsIGR1cmF0aW9uTXMgPSA5MDAwMDApIHsgLy8gRGVmYXVsdCAxNSBtaW51dGVzICh3YXMgMSBob3VyKVxyXG4gIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGdlbmVyYXRlU2Vzc2lvblRva2VuKCk7XHJcbiAgY29uc3QgZXhwaXJlc0F0ID0gRGF0ZS5ub3coKSArIGR1cmF0aW9uTXM7XHJcbiAgXHJcbiAgLy8gRW5jcnlwdCBwYXNzd29yZCBiZWZvcmUgc3RvcmluZyBpbiBtZW1vcnlcclxuICBjb25zdCB7IGVuY3J5cHRlZCwgaXYgfSA9IGF3YWl0IGVuY3J5cHRQYXNzd29yZEZvclNlc3Npb24ocGFzc3dvcmQpO1xyXG5cclxuICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvblRva2VuLCB7XHJcbiAgICBlbmNyeXB0ZWRQYXNzd29yZDogZW5jcnlwdGVkLFxyXG4gICAgaXY6IGl2LFxyXG4gICAgd2FsbGV0SWQsXHJcbiAgICBleHBpcmVzQXRcclxuICB9KTtcclxuXHJcbiAgLy8gQXV0by1jbGVhbnVwIGV4cGlyZWQgc2Vzc2lvblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvblRva2VuKTtcclxuICAgICAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgICAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZXNzaW9uIGV4cGlyZWQgYW5kIHJlbW92ZWQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIGR1cmF0aW9uTXMpO1xyXG5cclxuICAvLyBTZXNzaW9uIGNyZWF0ZWRcclxuICByZXR1cm4gc2Vzc2lvblRva2VuO1xyXG59XHJcblxyXG4vLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCByZXR1cm4gZGVjcnlwdGVkIHBhc3N3b3JkXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXNlc3Npb25Ub2tlbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBzZXNzaW9uIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcblxyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG9yIGV4cGlyZWQgc2Vzc2lvbicpO1xyXG4gIH1cclxuXHJcbiAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZXNzaW9uIGV4cGlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIERlY3J5cHQgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICByZXR1cm4gYXdhaXQgZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oc2Vzc2lvbi5lbmNyeXB0ZWRQYXNzd29yZCwgc2Vzc2lvbi5pdik7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgc2Vzc2lvblxyXG5mdW5jdGlvbiBpbnZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25Ub2tlbikpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgLy8gU2Vzc2lvbiBpbnZhbGlkYXRlZFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gSW52YWxpZGF0ZSBhbGwgc2Vzc2lvbnNcclxuZnVuY3Rpb24gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCkge1xyXG4gIGNvbnN0IGNvdW50ID0gYWN0aXZlU2Vzc2lvbnMuc2l6ZTtcclxuICBhY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xyXG4gIC8vIEFsbCBzZXNzaW9ucyBpbnZhbGlkYXRlZFxyXG4gIHJldHVybiBjb3VudDtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBleHRlbnNpb24gaW5zdGFsbGF0aW9uXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBpbnN0YWxsZWQnKTtcclxufSk7XHJcblxyXG4vLyBHZXQgY29ubmVjdGVkIHNpdGVzIGZyb20gc3RvcmFnZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlcygpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGxvYWQoQ09OTkVDVEVEX1NJVEVTX0tFWSk7XHJcbiAgcmV0dXJuIHNpdGVzIHx8IHt9O1xyXG59XHJcblxyXG4vLyBDaGVjayBpZiBhIHNpdGUgaXMgY29ubmVjdGVkXHJcbmFzeW5jIGZ1bmN0aW9uIGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgcmV0dXJuICEhc2l0ZXNbb3JpZ2luXTtcclxufVxyXG5cclxuLy8gQWRkIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gYWRkQ29ubmVjdGVkU2l0ZShvcmlnaW4sIGFjY291bnRzKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIHNpdGVzW29yaWdpbl0gPSB7XHJcbiAgICBhY2NvdW50cyxcclxuICAgIGNvbm5lY3RlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuICBhd2FpdCBzYXZlKENPTk5FQ1RFRF9TSVRFU19LRVksIHNpdGVzKTtcclxufVxyXG5cclxuLy8gUmVtb3ZlIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ29ubmVjdGVkU2l0ZShvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgZGVsZXRlIHNpdGVzW29yaWdpbl07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIEdldCBjdXJyZW50IG5ldHdvcmsgY2hhaW4gSURcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudENoYWluSWQoKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgcmV0dXJuIENIQUlOX0lEU1tuZXR3b3JrIHx8ICdwdWxzZWNoYWluVGVzdG5ldCddO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0IHJlcXVlc3RzIGZyb20gY29udGVudCBzY3JpcHRzXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVdhbGxldFJlcXVlc3QobWVzc2FnZSwgc2VuZGVyKSB7XHJcbiAgY29uc3QgeyBtZXRob2QsIHBhcmFtcyB9ID0gbWVzc2FnZTtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IEdldCBvcmlnaW4gZnJvbSBDaHJvbWUgQVBJLCBub3QgbWVzc2FnZSBwYXlsb2FkIChwcmV2ZW50cyBzcG9vZmluZylcclxuICBjb25zdCB1cmwgPSBuZXcgVVJMKHNlbmRlci51cmwpO1xyXG4gIGNvbnN0IG9yaWdpbiA9IHVybC5vcmlnaW47XHJcblxyXG4gIC8vIEhhbmRsaW5nIHdhbGxldCByZXF1ZXN0XHJcblxyXG4gIHRyeSB7XHJcbiAgICBzd2l0Y2ggKG1ldGhvZCkge1xyXG4gICAgICBjYXNlICdldGhfcmVxdWVzdEFjY291bnRzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlUmVxdWVzdEFjY291bnRzKG9yaWdpbiwgc2VuZGVyLnRhYik7XHJcblxyXG4gICAgICBjYXNlICdldGhfYWNjb3VudHMnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBY2NvdW50cyhvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2NoYWluSWQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVDaGFpbklkKCk7XHJcblxyXG4gICAgICBjYXNlICduZXRfdmVyc2lvbic6XHJcbiAgICAgICAgY29uc3QgY2hhaW5JZCA9IGF3YWl0IGhhbmRsZUNoYWluSWQoKTtcclxuICAgICAgICByZXR1cm4geyByZXN1bHQ6IHBhcnNlSW50KGNoYWluSWQucmVzdWx0LCAxNikudG9TdHJpbmcoKSB9O1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMsIG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICd3YWxsZXRfYWRkRXRoZXJldW1DaGFpbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUFkZENoYWluKHBhcmFtcywgb3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF93YXRjaEFzc2V0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlV2F0Y2hBc3NldChwYXJhbXMsIG9yaWdpbiwgc2VuZGVyLnRhYik7XHJcblxyXG4gICAgICBjYXNlICdldGhfYmxvY2tOdW1iZXInOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVCbG9ja051bWJlcigpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldEJsb2NrQnlOdW1iZXInOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmFsYW5jZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJhbGFuY2UocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRUcmFuc2FjdGlvbkNvdW50JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25Db3VudChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2NhbGwnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVDYWxsKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZXN0aW1hdGVHYXMnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dhc1ByaWNlJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2FzUHJpY2UoKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9zZW5kVHJhbnNhY3Rpb24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTZW5kVHJhbnNhY3Rpb24ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NlbmRSYXdUcmFuc2FjdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNlbmRSYXdUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25SZWNlaXB0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25SZWNlaXB0KHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25CeUhhc2gnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvbkJ5SGFzaChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldExvZ3MnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRMb2dzKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0Q29kZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldENvZGUocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCbG9ja0J5SGFzaCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJsb2NrQnlIYXNoKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVQZXJzb25hbFNpZ24ocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YSc6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGFfdjQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTaWduVHlwZWREYXRhKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDEsIG1lc3NhZ2U6IGBNZXRob2QgJHttZXRob2R9IG5vdCBzdXBwb3J0ZWRgIH0gfTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBoYW5kbGluZyByZXF1ZXN0OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3JlcXVlc3RBY2NvdW50cyAtIFJlcXVlc3QgcGVybWlzc2lvbiB0byBjb25uZWN0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHRhYikge1xyXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgY29ubmVjdGVkXHJcbiAgaWYgKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBbd2FsbGV0LmFkZHJlc3NdIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuICAgIHBlbmRpbmdDb25uZWN0aW9ucy5zZXQocmVxdWVzdElkLCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0YWJJZDogdGFiPy5pZCB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPWNvbm5lY3Qmb3JpZ2luPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG9yaWdpbil9JnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdDb25uZWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdDb25uZWN0aW9uIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9hY2NvdW50cyAtIEdldCBjb25uZWN0ZWQgYWNjb3VudHNcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWNjb3VudHMob3JpZ2luKSB7XHJcbiAgLy8gT25seSByZXR1cm4gYWNjb3VudHMgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgaWYgKHdhbGxldCAmJiB3YWxsZXQuYWRkcmVzcykge1xyXG4gICAgICByZXR1cm4geyByZXN1bHQ6IFt3YWxsZXQuYWRkcmVzc10gfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IHJlc3VsdDogW10gfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jaGFpbklkIC0gR2V0IGN1cnJlbnQgY2hhaW4gSURcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhaW5JZCgpIHtcclxuICBjb25zdCBjaGFpbklkID0gYXdhaXQgZ2V0Q3VycmVudENoYWluSWQoKTtcclxuICByZXR1cm4geyByZXN1bHQ6IGNoYWluSWQgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF9zd2l0Y2hFdGhlcmV1bUNoYWluIC0gU3dpdGNoIHRvIGEgZGlmZmVyZW50IG5ldHdvcmtcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3dpdGNoQ2hhaW4ocGFyYW1zLCBvcmlnaW4pIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdIHx8ICFwYXJhbXNbMF0uY2hhaW5JZCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXMnIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBSZXF1aXJlIHNpdGUgY29ubmVjdGlvbiBiZWZvcmUgYWxsb3dpbmcgY2hhaW4gc3dpdGNoXHJcbiAgaWYgKG9yaWdpbiAmJiAhKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ1VuYXV0aG9yaXplZDogc2l0ZSBub3QgY29ubmVjdGVkLiBDYWxsIGV0aF9yZXF1ZXN0QWNjb3VudHMgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCByZXF1ZXN0ZWRDaGFpbklkID0gcGFyYW1zWzBdLmNoYWluSWQ7XHJcbiAgLy8gU3dpdGNoaW5nIGNoYWluXHJcblxyXG4gIC8vIEZpbmQgbWF0Y2hpbmcgbmV0d29ya1xyXG4gIGNvbnN0IG5ldHdvcmtNYXAgPSB7XHJcbiAgICAnMHgzYWYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICAgJzB4M0FGJzogJ3B1bHNlY2hhaW5UZXN0bmV0JyxcclxuICAgICcweDE3MSc6ICdwdWxzZWNoYWluJyxcclxuICAgICcweDEnOiAnZXRoZXJldW0nLFxyXG4gICAgJzB4YWEzNmE3JzogJ3NlcG9saWEnLFxyXG4gICAgJzB4QUEzNkE3JzogJ3NlcG9saWEnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbmV0d29ya0tleSA9IG5ldHdvcmtNYXBbcmVxdWVzdGVkQ2hhaW5JZF07XHJcblxyXG4gIGlmICghbmV0d29ya0tleSkge1xyXG4gICAgLy8gQ2hhaW4gbm90IHN1cHBvcnRlZCAtIHJldHVybiBlcnJvciBjb2RlIDQ5MDIgc28gZEFwcCBjYW4gY2FsbCB3YWxsZXRfYWRkRXRoZXJldW1DaGFpblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0OTAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdVbnJlY29nbml6ZWQgY2hhaW4gSUQuIFRyeSBhZGRpbmcgdGhlIGNoYWluIHVzaW5nIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluLidcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSBjdXJyZW50IG5ldHdvcmtcclxuICBhd2FpdCBzYXZlKCdjdXJyZW50TmV0d29yaycsIG5ldHdvcmtLZXkpO1xyXG5cclxuICAvLyBOb3RpZnkgYWxsIHRhYnMgYWJvdXQgY2hhaW4gY2hhbmdlXHJcbiAgY29uc3QgbmV3Q2hhaW5JZCA9IENIQUlOX0lEU1tuZXR3b3JrS2V5XTtcclxuICBjaHJvbWUudGFicy5xdWVyeSh7fSwgKHRhYnMpID0+IHtcclxuICAgIHRhYnMuZm9yRWFjaCh0YWIgPT4ge1xyXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHtcclxuICAgICAgICB0eXBlOiAnQ0hBSU5fQ0hBTkdFRCcsXHJcbiAgICAgICAgY2hhaW5JZDogbmV3Q2hhaW5JZFxyXG4gICAgICB9KS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgICAgLy8gVGFiIG1pZ2h0IG5vdCBoYXZlIGNvbnRlbnQgc2NyaXB0LCBpZ25vcmUgZXJyb3JcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBudWxsIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXRfYWRkRXRoZXJldW1DaGFpbiAtIEFkZCBhIG5ldyBuZXR3b3JrIChzaW1wbGlmaWVkIHZlcnNpb24pXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFkZENoYWluKHBhcmFtcywgb3JpZ2luKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSB8fCAhcGFyYW1zWzBdLmNoYWluSWQpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogUmVxdWlyZSBzaXRlIGNvbm5lY3Rpb24gYmVmb3JlIGFsbG93aW5nIGNoYWluIGFkZC9zd2l0Y2hcclxuICBpZiAob3JpZ2luICYmICEoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBzaXRlIG5vdCBjb25uZWN0ZWQuIENhbGwgZXRoX3JlcXVlc3RBY2NvdW50cyBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNoYWluSW5mbyA9IHBhcmFtc1swXTtcclxuICBjb25zb2xlLmxvZygn8J+rgCBSZXF1ZXN0IHRvIGFkZCBjaGFpbjonLCBjaGFpbkluZm8pO1xyXG5cclxuICAvLyBGb3Igbm93LCBvbmx5IHN1cHBvcnQgb3VyIHByZWRlZmluZWQgY2hhaW5zXHJcbiAgLy8gQ2hlY2sgaWYgaXQncyBvbmUgb2Ygb3VyIHN1cHBvcnRlZCBjaGFpbnNcclxuICBjb25zdCBzdXBwb3J0ZWRDaGFpbnMgPSB7XHJcbiAgICAnMHgzYWYnOiB0cnVlLFxyXG4gICAgJzB4M0FGJzogdHJ1ZSxcclxuICAgICcweDE3MSc6IHRydWUsXHJcbiAgICAnMHgxJzogdHJ1ZSxcclxuICAgICcweGFhMzZhNyc6IHRydWUsXHJcbiAgICAnMHhBQTM2QTcnOiB0cnVlXHJcbiAgfTtcclxuXHJcbiAgaWYgKHN1cHBvcnRlZENoYWluc1tjaGFpbkluZm8uY2hhaW5JZF0pIHtcclxuICAgIC8vIENoYWluIGlzIGFscmVhZHkgc3VwcG9ydGVkLCBqdXN0IHN3aXRjaCB0byBpdFxyXG4gICAgcmV0dXJuIGF3YWl0IGhhbmRsZVN3aXRjaENoYWluKFt7IGNoYWluSWQ6IGNoYWluSW5mby5jaGFpbklkIH1dLCBvcmlnaW4pO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3VzdG9tIGNoYWlucyBub3Qgc3VwcG9ydGVkIHlldFxyXG4gIHJldHVybiB7XHJcbiAgICBlcnJvcjoge1xyXG4gICAgICBjb2RlOiAtMzI2MDMsXHJcbiAgICAgIG1lc3NhZ2U6ICdBZGRpbmcgY3VzdG9tIGNoYWlucyBub3Qgc3VwcG9ydGVkIHlldC4gT25seSBQdWxzZUNoYWluIGFuZCBFdGhlcmV1bSBuZXR3b3JrcyBhcmUgc3VwcG9ydGVkLidcclxuICAgIH1cclxuICB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgY29ubmVjdGlvbiBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nQ29ubmVjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luIH0gPSBwZW5kaW5nQ29ubmVjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgcGVuZGluZ0Nvbm5lY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoYXBwcm92ZWQpIHtcclxuICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgaWYgKHdhbGxldCAmJiB3YWxsZXQuYWRkcmVzcykge1xyXG4gICAgICAvLyBTYXZlIGNvbm5lY3RlZCBzaXRlXHJcbiAgICAgIGF3YWl0IGFkZENvbm5lY3RlZFNpdGUob3JpZ2luLCBbd2FsbGV0LmFkZHJlc3NdKTtcclxuXHJcbiAgICAgIC8vIFJlc29sdmUgdGhlIHBlbmRpbmcgcHJvbWlzZVxyXG4gICAgICByZXNvbHZlKHsgcmVzdWx0OiBbd2FsbGV0LmFkZHJlc3NdIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVqZWN0KG5ldyBFcnJvcignTm8gYWN0aXZlIHdhbGxldCcpKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gYWN0aXZlIHdhbGxldCcgfTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCBjb25uZWN0aW9uJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBjb25uZWN0aW9uIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0Q29ubmVjdGlvblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4gfSA9IHBlbmRpbmdDb25uZWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gR2V0IGN1cnJlbnQgbmV0d29yayBrZXlcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudE5ldHdvcmsoKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgcmV0dXJuIG5ldHdvcmsgfHwgJ3B1bHNlY2hhaW5UZXN0bmV0JztcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9ibG9ja051bWJlciAtIEdldCBjdXJyZW50IGJsb2NrIG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVCbG9ja051bWJlcigpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBibG9ja051bWJlciA9IGF3YWl0IHJwYy5nZXRCbG9ja051bWJlcihuZXR3b3JrKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogYmxvY2tOdW1iZXIgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBibG9jayBudW1iZXI6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0QmxvY2tCeU51bWJlciAtIEdldCBibG9jayBieSBudW1iZXJcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QmxvY2tCeU51bWJlcihwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGJsb2NrIG51bWJlciBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBibG9ja051bWJlciA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IGluY2x1ZGVUcmFuc2FjdGlvbnMgPSBwYXJhbXNbMV0gfHwgZmFsc2U7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrID0gYXdhaXQgcnBjLmdldEJsb2NrQnlOdW1iZXIobmV0d29yaywgYmxvY2tOdW1iZXIsIGluY2x1ZGVUcmFuc2FjdGlvbnMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9jayB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIGJ5IG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCYWxhbmNlIC0gR2V0IGJhbGFuY2UgZm9yIGFuIGFkZHJlc3NcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QmFsYW5jZShwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGFkZHJlc3MgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYWRkcmVzcyA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IGF3YWl0IHJwYy5nZXRCYWxhbmNlKG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBiYWxhbmNlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmFsYW5jZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvbkNvdW50IC0gR2V0IHRyYW5zYWN0aW9uIGNvdW50IChub25jZSlcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VHJhbnNhY3Rpb25Db3VudChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGFkZHJlc3MgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYWRkcmVzcyA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgY291bnQgPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25Db3VudChuZXR3b3JrLCBhZGRyZXNzKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogY291bnQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2FjdGlvbiBjb3VudDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nYXNQcmljZSAtIEdldCBjdXJyZW50IGdhcyBwcmljZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHYXNQcmljZSgpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBnYXNQcmljZSA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogZ2FzUHJpY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZXN0aW1hdGVHYXMgLSBFc3RpbWF0ZSBnYXMgZm9yIGEgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXN0aW1hdGVHYXMocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhcyA9IGF3YWl0IHJwYy5lc3RpbWF0ZUdhcyhuZXR3b3JrLCBwYXJhbXNbMF0pO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXMgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXN0aW1hdGluZyBnYXM6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfY2FsbCAtIEV4ZWN1dGUgYSByZWFkLW9ubHkgY2FsbFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDYWxsKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBycGMuY2FsbChuZXR3b3JrLCBwYXJhbXNbMF0pO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGV4ZWN1dGluZyBjYWxsOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NlbmRSYXdUcmFuc2FjdGlvbiAtIFNlbmQgYSBwcmUtc2lnbmVkIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRSYXdUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3Npbmcgc2lnbmVkIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IFJlcXVpcmUgc2l0ZSBjb25uZWN0aW9uIGJlZm9yZSBhbGxvd2luZyByYXcgdHJhbnNhY3Rpb24gYnJvYWRjYXN0XHJcbiAgaWYgKG9yaWdpbiAmJiAhKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ1VuYXV0aG9yaXplZDogc2l0ZSBub3QgY29ubmVjdGVkLiBDYWxsIGV0aF9yZXF1ZXN0QWNjb3VudHMgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2lnbmVkVHggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHR4SGFzaCA9IGF3YWl0IHJwYy5zZW5kUmF3VHJhbnNhY3Rpb24obmV0d29yaywgc2lnbmVkVHgpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiB0eEhhc2ggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igc2VuZGluZyByYXcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0VHJhbnNhY3Rpb25SZWNlaXB0IC0gR2V0IHRyYW5zYWN0aW9uIHJlY2VpcHRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VHJhbnNhY3Rpb25SZWNlaXB0KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0KG5ldHdvcmssIHR4SGFzaCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHJlY2VpcHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2FjdGlvbiByZWNlaXB0OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQnlIYXNoIC0gR2V0IHRyYW5zYWN0aW9uIGJ5IGhhc2hcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VHJhbnNhY3Rpb25CeUhhc2gocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBoYXNoIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHR4SGFzaCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgdHggPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25CeUhhc2gobmV0d29yaywgdHhIYXNoKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogdHggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2FjdGlvbiBieSBoYXNoOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRMb2dzKHBhcmFtcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgbG9ncyA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRMb2dzJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogbG9ncyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGxvZ3M6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldENvZGUocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBhZGRyZXNzIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCBjb2RlID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldENvZGUnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb2RlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgY29kZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QmxvY2tCeUhhc2gocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBibG9jayBoYXNoIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCBibG9jayA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRCbG9ja0J5SGFzaCcsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgaGFzaDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gUGVuZGluZyB0cmFuc2FjdGlvbiByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4gfSlcclxuY29uc3QgcGVuZGluZ1RyYW5zYWN0aW9ucyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vIFBlbmRpbmcgdG9rZW4gYWRkIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdG9rZW5JbmZvIH0pXHJcbmNvbnN0IHBlbmRpbmdUb2tlblJlcXVlc3RzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyBtZXNzYWdlIHNpZ25pbmcgcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBzaWduUmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9KVxyXG5jb25zdCBwZW5kaW5nU2lnblJlcXVlc3RzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gUkFURSBMSU1JVElORyA9PT09PVxyXG4vLyBQcmV2ZW50cyBtYWxpY2lvdXMgZEFwcHMgZnJvbSBzcGFtbWluZyB0cmFuc2FjdGlvbiBhcHByb3ZhbCByZXF1ZXN0c1xyXG5jb25zdCByYXRlTGltaXRNYXAgPSBuZXcgTWFwKCk7IC8vIG9yaWdpbiAtPiB7IGNvdW50LCB3aW5kb3dTdGFydCwgcGVuZGluZ0NvdW50IH1cclxuXHJcbmNvbnN0IFJBVEVfTElNSVRfQ09ORklHID0ge1xyXG4gIE1BWF9QRU5ESU5HX1JFUVVFU1RTOiA1LCAvLyBNYXggcGVuZGluZyByZXF1ZXN0cyBwZXIgb3JpZ2luXHJcbiAgTUFYX1JFUVVFU1RTX1BFUl9XSU5ET1c6IDIwLCAvLyBNYXggdG90YWwgcmVxdWVzdHMgcGVyIHRpbWUgd2luZG93XHJcbiAgVElNRV9XSU5ET1dfTVM6IDYwMDAwIC8vIDEgbWludXRlIHdpbmRvd1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhbiBvcmlnaW4gaGFzIGV4Y2VlZGVkIHJhdGUgbGltaXRzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGNoZWNrXHJcbiAqIEByZXR1cm5zIHt7IGFsbG93ZWQ6IGJvb2xlYW4sIHJlYXNvbj86IHN0cmluZyB9fVxyXG4gKi9cclxuZnVuY3Rpb24gY2hlY2tSYXRlTGltaXQob3JpZ2luKSB7XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBcclxuICAvLyBHZXQgb3IgY3JlYXRlIHJhdGUgbGltaXQgZW50cnkgZm9yIHRoaXMgb3JpZ2luXHJcbiAgaWYgKCFyYXRlTGltaXRNYXAuaGFzKG9yaWdpbikpIHtcclxuICAgIHJhdGVMaW1pdE1hcC5zZXQob3JpZ2luLCB7XHJcbiAgICAgIGNvdW50OiAwLFxyXG4gICAgICB3aW5kb3dTdGFydDogbm93LFxyXG4gICAgICBwZW5kaW5nQ291bnQ6IDBcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBjb25zdCBsaW1pdERhdGEgPSByYXRlTGltaXRNYXAuZ2V0KG9yaWdpbik7XHJcbiAgXHJcbiAgLy8gUmVzZXQgd2luZG93IGlmIGV4cGlyZWRcclxuICBpZiAobm93IC0gbGltaXREYXRhLndpbmRvd1N0YXJ0ID4gUkFURV9MSU1JVF9DT05GSUcuVElNRV9XSU5ET1dfTVMpIHtcclxuICAgIGxpbWl0RGF0YS5jb3VudCA9IDA7XHJcbiAgICBsaW1pdERhdGEud2luZG93U3RhcnQgPSBub3c7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIHBlbmRpbmcgcmVxdWVzdHMgbGltaXRcclxuICBpZiAobGltaXREYXRhLnBlbmRpbmdDb3VudCA+PSBSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUEVORElOR19SRVFVRVNUUykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYWxsb3dlZDogZmFsc2UsXHJcbiAgICAgIHJlYXNvbjogYFRvbyBtYW55IHBlbmRpbmcgcmVxdWVzdHMuIE1heGltdW0gJHtSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUEVORElOR19SRVFVRVNUU30gcGVuZGluZyByZXF1ZXN0cyBhbGxvd2VkLmBcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIHRvdGFsIHJlcXVlc3RzIGluIHdpbmRvd1xyXG4gIGlmIChsaW1pdERhdGEuY291bnQgPj0gUkFURV9MSU1JVF9DT05GSUcuTUFYX1JFUVVFU1RTX1BFUl9XSU5ET1cpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFsbG93ZWQ6IGZhbHNlLFxyXG4gICAgICByZWFzb246IGBSYXRlIGxpbWl0IGV4Y2VlZGVkLiBNYXhpbXVtICR7UkFURV9MSU1JVF9DT05GSUcuTUFYX1JFUVVFU1RTX1BFUl9XSU5ET1d9IHJlcXVlc3RzIHBlciBtaW51dGUuYFxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIHsgYWxsb3dlZDogdHJ1ZSB9O1xyXG59XHJcblxyXG4vKipcclxuICogSW5jcmVtZW50cyByYXRlIGxpbWl0IGNvdW50ZXJzIGZvciBhbiBvcmlnaW5cclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gaW5jcmVtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBpbmNyZW1lbnRSYXRlTGltaXQob3JpZ2luKSB7XHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIGlmIChsaW1pdERhdGEpIHtcclxuICAgIGxpbWl0RGF0YS5jb3VudCsrO1xyXG4gICAgbGltaXREYXRhLnBlbmRpbmdDb3VudCsrO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIERlY3JlbWVudHMgcGVuZGluZyBjb3VudGVyIHdoZW4gcmVxdWVzdCBpcyByZXNvbHZlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBkZWNyZW1lbnRcclxuICovXHJcbmZ1bmN0aW9uIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pIHtcclxuICBjb25zdCBsaW1pdERhdGEgPSByYXRlTGltaXRNYXAuZ2V0KG9yaWdpbik7XHJcbiAgaWYgKGxpbWl0RGF0YSAmJiBsaW1pdERhdGEucGVuZGluZ0NvdW50ID4gMCkge1xyXG4gICAgbGltaXREYXRhLnBlbmRpbmdDb3VudC0tO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQ2xlYW4gdXAgb2xkIHJhdGUgbGltaXQgZW50cmllcyBldmVyeSA1IG1pbnV0ZXNcclxuc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgZm9yIChjb25zdCBbb3JpZ2luLCBkYXRhXSBvZiByYXRlTGltaXRNYXAuZW50cmllcygpKSB7XHJcbiAgICBpZiAobm93IC0gZGF0YS53aW5kb3dTdGFydCA+IFJBVEVfTElNSVRfQ09ORklHLlRJTUVfV0lORE9XX01TICogNSAmJiBkYXRhLnBlbmRpbmdDb3VudCA9PT0gMCkge1xyXG4gICAgICByYXRlTGltaXRNYXAuZGVsZXRlKG9yaWdpbik7XHJcbiAgICB9XHJcbiAgfVxyXG59LCAzMDAwMDApO1xyXG5cclxuLy8gPT09PT0gVFJBTlNBQ1RJT04gUkVQTEFZIFBST1RFQ1RJT04gPT09PT1cclxuLy8gUHJldmVudHMgdGhlIHNhbWUgdHJhbnNhY3Rpb24gYXBwcm92YWwgZnJvbSBiZWluZyB1c2VkIG11bHRpcGxlIHRpbWVzXHJcbmNvbnN0IHByb2Nlc3NlZEFwcHJvdmFscyA9IG5ldyBNYXAoKTsgLy8gYXBwcm92YWxUb2tlbiAtPiB7IHRpbWVzdGFtcCwgdHhIYXNoLCB1c2VkOiB0cnVlIH1cclxuXHJcbmNvbnN0IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRyA9IHtcclxuICBBUFBST1ZBTF9USU1FT1VUOiAzMDAwMDAsIC8vIDUgbWludXRlcyAtIGFwcHJvdmFsIGV4cGlyZXMgYWZ0ZXIgdGhpc1xyXG4gIENMRUFOVVBfSU5URVJWQUw6IDYwMDAwICAgLy8gMSBtaW51dGUgLSBjbGVhbiB1cCBvbGQgYXBwcm92YWxzXHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFVuaXF1ZSBhcHByb3ZhbCB0b2tlblxyXG4gKi9cclxuZnVuY3Rpb24gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCkge1xyXG4gIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoMzIpO1xyXG4gIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyYXkpO1xyXG4gIHJldHVybiBBcnJheS5mcm9tKGFycmF5LCBieXRlID0+IGJ5dGUudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuZCBtYXJrcyBhbiBhcHByb3ZhbCB0b2tlbiBhcyB1c2VkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhcHByb3ZhbFRva2VuIC0gVG9rZW4gdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsaWQgYW5kIG5vdCB5ZXQgdXNlZFxyXG4gKi9cclxuZnVuY3Rpb24gdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pIHtcclxuICBpZiAoIWFwcHJvdmFsVG9rZW4pIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBObyBhcHByb3ZhbCB0b2tlbiBwcm92aWRlZCcpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYXBwcm92YWwgPSBwcm9jZXNzZWRBcHByb3ZhbHMuZ2V0KGFwcHJvdmFsVG9rZW4pO1xyXG5cclxuICBpZiAoIWFwcHJvdmFsKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgVW5rbm93biBhcHByb3ZhbCB0b2tlbicpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gTWFyayBhcyB1c2VkIElNTUVESUFURUxZIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zLlxyXG4gIC8vIEFueSBjb25jdXJyZW50IGNhbGwgd2lsbCBzZWUgdXNlZD10cnVlIGFuZCBiYWlsIG91dC5cclxuICBpZiAoYXBwcm92YWwudXNlZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEFwcHJvdmFsIHRva2VuIGFscmVhZHkgdXNlZCAtIHByZXZlbnRpbmcgcmVwbGF5IGF0dGFjaycpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBhcHByb3ZhbC51c2VkID0gdHJ1ZTtcclxuICBhcHByb3ZhbC51c2VkQXQgPSBEYXRlLm5vdygpO1xyXG5cclxuICAvLyBDaGVjayBpZiBhcHByb3ZhbCBoYXMgZXhwaXJlZFxyXG4gIGNvbnN0IGFnZSA9IERhdGUubm93KCkgLSBhcHByb3ZhbC50aW1lc3RhbXA7XHJcbiAgaWYgKGFnZSA+IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5BUFBST1ZBTF9USU1FT1VUKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQXBwcm92YWwgdG9rZW4gZXhwaXJlZCcpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLmRlbGV0ZShhcHByb3ZhbFRva2VuKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKCfwn6uAIEFwcHJvdmFsIHRva2VuIHZhbGlkYXRlZCBhbmQgbWFya2VkIGFzIHVzZWQnKTtcclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbi8vIENsZWFuIHVwIG9sZCBwcm9jZXNzZWQgYXBwcm92YWxzIGV2ZXJ5IG1pbnV0ZVxyXG5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBmb3IgKGNvbnN0IFt0b2tlbiwgYXBwcm92YWxdIG9mIHByb2Nlc3NlZEFwcHJvdmFscy5lbnRyaWVzKCkpIHtcclxuICAgIGNvbnN0IGFnZSA9IG5vdyAtIGFwcHJvdmFsLnRpbWVzdGFtcDtcclxuICAgIGlmIChhZ2UgPiBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcuQVBQUk9WQUxfVElNRU9VVCAqIDIpIHtcclxuICAgICAgcHJvY2Vzc2VkQXBwcm92YWxzLmRlbGV0ZSh0b2tlbik7XHJcbiAgICB9XHJcbiAgfVxyXG59LCBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcuQ0xFQU5VUF9JTlRFUlZBTCk7XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NlbmRUcmFuc2FjdGlvbiAtIFNpZ24gYW5kIHNlbmQgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZW5kVHJhbnNhY3Rpb24ocGFyYW1zLCBvcmlnaW4pIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IENoZWNrIHJhdGUgbGltaXQgdG8gcHJldmVudCBzcGFtXHJcbiAgY29uc3QgcmF0ZUxpbWl0Q2hlY2sgPSBjaGVja1JhdGVMaW1pdChvcmlnaW4pO1xyXG4gIGlmICghcmF0ZUxpbWl0Q2hlY2suYWxsb3dlZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIFJhdGUgbGltaXQgZXhjZWVkZWQgZm9yIG9yaWdpbjonLCBvcmlnaW4pO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDIwMCwgbWVzc2FnZTogc2FuaXRpemVFcnJvck1lc3NhZ2UocmF0ZUxpbWl0Q2hlY2sucmVhc29uKSB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eFJlcXVlc3QgPSBwYXJhbXNbMF07XHJcblxyXG4gIC8vIEdldCBjdXJyZW50IG5ldHdvcmsgZnJvbSBzdG9yYWdlXHJcbiAgY29uc3QgY3VycmVudE5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpIHx8ICdwdWxzZWNoYWluJztcclxuXHJcbiAgLy8gRHluYW1pY2FsbHkgZmV0Y2ggY3VycmVudCBnYXMgcHJpY2UgYW5kIHVzZSAzeCBhcyBtYXggKHRvIGFsbG93IGZvciB2b2xhdGlsaXR5KVxyXG4gIGxldCBtYXhHYXNQcmljZUd3ZWk7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGN1cnJlbnRHYXNQcmljZSA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShjdXJyZW50TmV0d29yayk7XHJcbiAgICBjb25zdCBjdXJyZW50R2FzUHJpY2VHd2VpID0gTnVtYmVyKEJpZ0ludChjdXJyZW50R2FzUHJpY2UpKSAvIDFlOTtcclxuICAgIC8vIFVzZSAzeCBjdXJyZW50IHByaWNlIGFzIG1heCB0byBhbGxvdyBmb3IgbmV0d29yayB2b2xhdGlsaXR5XHJcbiAgICBtYXhHYXNQcmljZUd3ZWkgPSBNYXRoLmNlaWwoY3VycmVudEdhc1ByaWNlR3dlaSAqIDMpO1xyXG4gICAgLy8gRW5zdXJlIG1pbmltdW0gb2YgMTAwIEd3ZWkgZm9yIHZlcnkgbG93IGdhcyBuZXR3b3Jrc1xyXG4gICAgbWF4R2FzUHJpY2VHd2VpID0gTWF0aC5tYXgobWF4R2FzUHJpY2VHd2VpLCAxMDApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBmZXRjaCBnYXMgcHJpY2UsIHVzaW5nIGhpZ2ggZGVmYXVsdDonLCBlcnJvcik7XHJcbiAgICAvLyBJZiB3ZSBjYW4ndCBmZXRjaCBnYXMgcHJpY2UsIHVzZSBhIHZlcnkgaGlnaCBkZWZhdWx0IHRvIGF2b2lkIGJsb2NraW5nIHRyYW5zYWN0aW9uc1xyXG4gICAgbWF4R2FzUHJpY2VHd2VpID0gMTAwMDAwMDA7IC8vIDEwTSBHd2VpIC0gZXNzZW50aWFsbHkgbm8gbGltaXRcclxuICB9XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBDb21wcmVoZW5zaXZlIHRyYW5zYWN0aW9uIHZhbGlkYXRpb25cclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVUcmFuc2FjdGlvblJlcXVlc3QodHhSZXF1ZXN0LCBtYXhHYXNQcmljZUd3ZWkpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgdHJhbnNhY3Rpb24gZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9ycyk7XHJcbiAgICByZXR1cm4geyBcclxuICAgICAgZXJyb3I6IHsgXHJcbiAgICAgICAgY29kZTogLTMyNjAyLCBcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCB0cmFuc2FjdGlvbjogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3JzLmpvaW4oJzsgJykpIFxyXG4gICAgICB9IFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIFVzZSBzYW5pdGl6ZWQgdHJhbnNhY3Rpb24gcGFyYW1ldGVyc1xyXG4gIGNvbnN0IHNhbml0aXplZFR4ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIEluY3JlbWVudCByYXRlIGxpbWl0IGNvdW50ZXJcclxuICBpbmNyZW1lbnRSYXRlTGltaXQob3JpZ2luKTtcclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcblxyXG4gICAgLy8gU0VDVVJJVFk6IEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIFN0b3JlIHNhbml0aXplZCB0cmFuc2FjdGlvbiBpbnN0ZWFkIG9mIG9yaWdpbmFsIHJlcXVlc3RcclxuICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuc2V0KHJlcXVlc3RJZCwgeyBcclxuICAgICAgcmVzb2x2ZSwgXHJcbiAgICAgIHJlamVjdCwgXHJcbiAgICAgIG9yaWdpbiwgXHJcbiAgICAgIHR4UmVxdWVzdDogc2FuaXRpemVkVHgsXHJcbiAgICAgIGFwcHJvdmFsVG9rZW4gIC8vIEluY2x1ZGUgdG9rZW4gZm9yIHZhbGlkYXRpb25cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249dHJhbnNhY3Rpb24mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgZGVjcmVtZW50UGVuZGluZ0NvdW50KG9yaWdpbik7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVHJhbnNhY3Rpb24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgdHJhbnNhY3Rpb24gYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNlc3Npb25Ub2tlbiwgZ2FzUHJpY2UsIGN1c3RvbU5vbmNlLCB0eEhhc2gsIHR4RGV0YWlscyA9IG51bGwpIHtcclxuICBpZiAoIXBlbmRpbmdUcmFuc2FjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0eFJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdUcmFuc2FjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBWYWxpZGF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiB0byBwcmV2ZW50IHJlcGxheSBhdHRhY2tzXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nVHJhbnNhY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICAvLyBEZWNyZW1lbnQgcGVuZGluZyBjb3VudGVyIChyZXF1ZXN0IGNvbXBsZXRlZClcclxuICBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCB0cmFuc2FjdGlvbicpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gSWYgdHhIYXNoIGlzIHByb3ZpZGVkLCB0cmFuc2FjdGlvbiB3YXMgYWxyZWFkeSBzaWduZWQgYW5kIGJyb2FkY2FzdCBpbiB0aGUgcG9wdXBcclxuICAgIC8vIChieSBoYXJkd2FyZSB3YWxsZXQgT1Igc29mdHdhcmUgd2FsbGV0KS4gSnVzdCBzYXZlIHRvIGhpc3RvcnkgYW5kIHJlc29sdmUuXHJcbiAgICBpZiAodHhIYXNoKSB7XHJcbiAgICAgIGNvbnN0IHdhbGxldFR5cGUgPSB0eERldGFpbHMgPyAnc29mdHdhcmUnIDogJ2hhcmR3YXJlJztcclxuICAgICAgY29uc29sZS5sb2coYPCfq4AgJHt3YWxsZXRUeXBlfSB3YWxsZXQgdHJhbnNhY3Rpb24gYWxyZWFkeSBicm9hZGNhc3Q6YCwgdHhIYXNoKTtcclxuXHJcbiAgICAgIC8vIEdldCBhY3RpdmUgd2FsbGV0IGZvciBzYXZpbmcgdG8gaGlzdG9yeVxyXG4gICAgICBjb25zdCBhY3RpdmVXYWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcblxyXG4gICAgICAvLyBTYXZlIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnkgKHVzZSB0eERldGFpbHMgaWYgcHJvdmlkZWQgZm9yIGFjY3VyYXRlIGRhdGEpXHJcbiAgICAgIGNvbnN0IGhpc3RvcnlFbnRyeSA9IHtcclxuICAgICAgICBoYXNoOiB0eEhhc2gsXHJcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgIGZyb206IGFjdGl2ZVdhbGxldC5hZGRyZXNzLFxyXG4gICAgICAgIHRvOiB0eERldGFpbHM/LnRvIHx8IHR4UmVxdWVzdC50byB8fCBudWxsLFxyXG4gICAgICAgIHZhbHVlOiB0eERldGFpbHM/LnZhbHVlIHx8IHR4UmVxdWVzdC52YWx1ZSB8fCAnMCcsXHJcbiAgICAgICAgZGF0YTogdHhEZXRhaWxzPy5kYXRhIHx8IHR4UmVxdWVzdC5kYXRhIHx8ICcweCcsXHJcbiAgICAgICAgZ2FzUHJpY2U6IHR4RGV0YWlscz8uZ2FzUHJpY2UgfHwgJzAnLFxyXG4gICAgICAgIGdhc0xpbWl0OiB0eERldGFpbHM/Lmdhc0xpbWl0IHx8IHR4UmVxdWVzdC5nYXNMaW1pdCB8fCB0eFJlcXVlc3QuZ2FzIHx8IG51bGwsXHJcbiAgICAgICAgbm9uY2U6IHR4RGV0YWlscz8ubm9uY2UgPz8gbnVsbCxcclxuICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICAgIHR5cGU6IHR4SGlzdG9yeS5UWF9UWVBFUy5DT05UUkFDVFxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gSW5jbHVkZSBFSVAtMTU1OSBmaWVsZHMgaWYgcHJvdmlkZWQgKG5lZWRlZCBmb3Igc3BlZWQtdXAvY2FuY2VsKVxyXG4gICAgICBpZiAodHhEZXRhaWxzPy5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICBoaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gdHhEZXRhaWxzLm1heEZlZVBlckdhcztcclxuICAgICAgfVxyXG4gICAgICBpZiAodHhEZXRhaWxzPy5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICAgIGhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IHR4RGV0YWlscy5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgICAgfVxyXG5cclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFjdGl2ZVdhbGxldC5hZGRyZXNzLCBoaXN0b3J5RW50cnkpO1xyXG5cclxuICAgICAgLy8gU2VuZCBkZXNrdG9wIG5vdGlmaWNhdGlvblxyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gc2VudDogJHt0eEhhc2guc2xpY2UoMCwgMjApfS4uLmAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBTdGFydCBtb25pdG9yaW5nIHRyYW5zYWN0aW9uIGZvciBjb25maXJtYXRpb25cclxuICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgIHdhaXRGb3JDb25maXJtYXRpb24oeyBoYXNoOiB0eEhhc2ggfSwgcHJvdmlkZXIsIGFjdGl2ZVdhbGxldC5hZGRyZXNzKTtcclxuXHJcbiAgICAgIC8vIExvZyBzdWNjZXNzZnVsIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICAgIHR5cGU6ICd0cmFuc2FjdGlvbicsXHJcbiAgICAgICAgYWRkcmVzczogYWN0aXZlV2FsbGV0LmFkZHJlc3MsXHJcbiAgICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgICAgbWV0aG9kOiAnZXRoX3NlbmRUcmFuc2FjdGlvbicsXHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICB0eEhhc2g6IHR4SGFzaCxcclxuICAgICAgICB3YWxsZXRUeXBlOiB3YWxsZXRUeXBlXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gUmVzb2x2ZSB3aXRoIHRyYW5zYWN0aW9uIGhhc2hcclxuICAgICAgcmVzb2x2ZSh7IHJlc3VsdDogdHhIYXNoIH0pO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2ggfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTb2Z0d2FyZSB3YWxsZXQgZmxvdyAtIHZhbGlkYXRlIHNlc3Npb24gYW5kIGdldCBwYXNzd29yZCAobm93IGFzeW5jKVxyXG4gICAgbGV0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcbiAgICBsZXQgc2lnbmVyID0gbnVsbDtcclxuICAgIGxldCBjb25uZWN0ZWRTaWduZXIgPSBudWxsO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IHdpdGggYXV0by11cGdyYWRlIG5vdGlmaWNhdGlvblxyXG4gICAgY29uc3QgdW5sb2NrUmVzdWx0ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIC8vIE5vdGlmeSB1c2VyIHRoYXQgd2FsbGV0IGVuY3J5cHRpb24gaXMgYmVpbmcgdXBncmFkZWRcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQgZW5jcnlwdGlvbjogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnNgKTtcclxuICAgICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgICAgdGl0bGU6ICfwn5SQIFNlY3VyaXR5IFVwZ3JhZGUgaW4gUHJvZ3Jlc3MnLFxyXG4gICAgICAgICAgbWVzc2FnZTogYFVwZ3JhZGluZyB3YWxsZXQgZW5jcnlwdGlvbiB0byAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnMgZm9yIGVuaGFuY2VkIHNlY3VyaXR5Li4uYCxcclxuICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcbiAgICBjb25zdCB7IHVwZ3JhZGVkLCBpdGVyYXRpb25zQmVmb3JlLCBpdGVyYXRpb25zQWZ0ZXIgfSA9IHVubG9ja1Jlc3VsdDtcclxuXHJcbiAgICAvLyBTaG93IGNvbXBsZXRpb24gbm90aWZpY2F0aW9uIGlmIHVwZ3JhZGUgb2NjdXJyZWRcclxuICAgIGlmICh1cGdyYWRlZCkge1xyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICfinIUgU2VjdXJpdHkgVXBncmFkZSBDb21wbGV0ZScsXHJcbiAgICAgICAgbWVzc2FnZTogYFdhbGxldCBlbmNyeXB0aW9uIHVwZ3JhZGVkOiAke2l0ZXJhdGlvbnNCZWZvcmUudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aXRlcmF0aW9uc0FmdGVyLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnNgLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBjdXJyZW50IG5ldHdvcmtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcblxyXG4gICAgLy8gQ29ubmVjdCBzaWduZXIgdG8gcHJvdmlkZXJcclxuICAgIGNvbm5lY3RlZFNpZ25lciA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRyYW5zYWN0aW9uIC0gY3JlYXRlIGEgY2xlYW4gY29weSB3aXRoIG9ubHkgbmVjZXNzYXJ5IGZpZWxkc1xyXG4gICAgY29uc3QgdHhUb1NlbmQgPSB7XHJcbiAgICAgIHRvOiB0eFJlcXVlc3QudG8sXHJcbiAgICAgIHZhbHVlOiB0eFJlcXVlc3QudmFsdWUgfHwgJzB4MCcsXHJcbiAgICAgIGRhdGE6IHR4UmVxdWVzdC5kYXRhIHx8ICcweCdcclxuICAgIH07XHJcblxyXG4gICAgLy8gTm9uY2UgaGFuZGxpbmcgcHJpb3JpdHk6XHJcbiAgICAvLyAxLiBVc2VyLXByb3ZpZGVkIGN1c3RvbSBub25jZSAoZm9yIHJlcGxhY2luZyBzdHVjayB0cmFuc2FjdGlvbnMpXHJcbiAgICAvLyAyLiBEQXBwLXByb3ZpZGVkIG5vbmNlICh2YWxpZGF0ZWQpXHJcbiAgICAvLyAzLiBBdXRvLWZldGNoIGJ5IGV0aGVycy5qc1xyXG4gICAgaWYgKGN1c3RvbU5vbmNlICE9PSB1bmRlZmluZWQgJiYgY3VzdG9tTm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgLy8gVXNlciBtYW51YWxseSBzZXQgbm9uY2UgKGUuZy4sIHRvIHJlcGxhY2Ugc3R1Y2sgdHJhbnNhY3Rpb24pXHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uQ291bnQoc2lnbmVyLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcblxyXG4gICAgICBpZiAoY3VzdG9tTm9uY2UgPCBjdXJyZW50Tm9uY2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEN1c3RvbSBub25jZSAke2N1c3RvbU5vbmNlfSBpcyBsZXNzIHRoYW4gY3VycmVudCBub25jZSAke2N1cnJlbnROb25jZX0uIFRoaXMgbWF5IGZhaWwgdW5sZXNzIHlvdSdyZSByZXBsYWNpbmcgYSBwZW5kaW5nIHRyYW5zYWN0aW9uLmApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eFRvU2VuZC5ub25jZSA9IGN1c3RvbU5vbmNlO1xyXG4gICAgICAvLyBVc2luZyBjdXN0b20gbm9uY2VcclxuICAgIH0gZWxzZSBpZiAodHhSZXF1ZXN0Lm5vbmNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lm5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIFNFQ1VSSVRZOiBWYWxpZGF0ZSBub25jZSBpZiBwcm92aWRlZCBieSBEQXBwXHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uQ291bnQoc2lnbmVyLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcbiAgICAgIGNvbnN0IHByb3ZpZGVkTm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJ1xyXG4gICAgICAgID8gcGFyc2VJbnQodHhSZXF1ZXN0Lm5vbmNlLCAxNilcclxuICAgICAgICA6IHR4UmVxdWVzdC5ub25jZTtcclxuXHJcbiAgICAgIC8vIE5vbmNlIG11c3QgYmUgPj0gY3VycmVudCBwZW5kaW5nIG5vbmNlXHJcbiAgICAgIGlmIChwcm92aWRlZE5vbmNlIDwgY3VycmVudE5vbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG5vbmNlOiAke3Byb3ZpZGVkTm9uY2V9IGlzIGxlc3MgdGhhbiBjdXJyZW50IG5vbmNlICR7Y3VycmVudE5vbmNlfWApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eFRvU2VuZC5ub25jZSA9IHByb3ZpZGVkTm9uY2U7XHJcbiAgICAgIC8vIFVzaW5nIERBcHAtcHJvdmlkZWQgbm9uY2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIG5vIG5vbmNlIHByb3ZpZGVkLCBldGhlcnMuanMgd2lsbCBmZXRjaCB0aGUgY29ycmVjdCBvbmUgYXV0b21hdGljYWxseVxyXG4gICAgICAvLyBBdXRvLWZldGNoaW5nIG5vbmNlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgREFwcCBwcm92aWRlZCBhIGdhcyBsaW1pdCwgdXNlIGl0LiBPdGhlcndpc2UgbGV0IGV0aGVycyBlc3RpbWF0ZS5cclxuICAgIGlmICh0eFJlcXVlc3QuZ2FzIHx8IHR4UmVxdWVzdC5nYXNMaW1pdCkge1xyXG4gICAgICB0eFRvU2VuZC5nYXNMaW1pdCA9IHR4UmVxdWVzdC5nYXMgfHwgdHhSZXF1ZXN0Lmdhc0xpbWl0O1xyXG4gICAgICAvLyBVc2luZyBwcm92aWRlZCBnYXMgbGltaXRcclxuICAgIH1cclxuXHJcbiAgICAvLyBBcHBseSB1c2VyLXNlbGVjdGVkIGdhcyBwcmljZSBpZiBwcm92aWRlZCwgb3IgdXNlIHNhZmUgbmV0d29yayBnYXMgcHJpY2VcclxuICAgIGlmIChnYXNQcmljZSkge1xyXG4gICAgICAvLyBVc2UgdXNlci1zZWxlY3RlZCBnYXMgcHJpY2UgZnJvbSBVSVxyXG4gICAgICB0eFRvU2VuZC5nYXNQcmljZSA9IGdhc1ByaWNlO1xyXG4gICAgICAvLyBVc2luZyBjdXN0b20gZ2FzIHByaWNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBGYWxsYmFjazogRmV0Y2ggc2FmZSBnYXMgcHJpY2UgKGJhc2UgZmVlICogMikgdG8gcHJldmVudCBzdHVjayB0cmFuc2FjdGlvbnNcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBzYWZlR2FzUHJpY2VIZXggPSBhd2FpdCBycGMuZ2V0U2FmZUdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgICAgIHR4VG9TZW5kLmdhc1ByaWNlID0gQmlnSW50KHNhZmVHYXNQcmljZUhleCk7XHJcbiAgICAgICAgLy8gVXNpbmcgc2FmZSBnYXMgcHJpY2UgZnJvbSBiYXNlIGZlZVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgZ2V0dGluZyBzYWZlIGdhcyBwcmljZSwgdXNpbmcgcHJvdmlkZXIgZmFsbGJhY2s6JywgZXJyb3IpO1xyXG4gICAgICAgIC8vIExhc3QgcmVzb3J0IGZhbGxiYWNrIHRvIHByb3ZpZGVyXHJcbiAgICAgICAgY29uc3QgbmV0d29ya0dhc1ByaWNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0RmVlRGF0YSgpO1xyXG4gICAgICAgIGlmIChuZXR3b3JrR2FzUHJpY2UuZ2FzUHJpY2UpIHtcclxuICAgICAgICAgIHR4VG9TZW5kLmdhc1ByaWNlID0gbmV0d29ya0dhc1ByaWNlLmdhc1ByaWNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNlbmQgdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgY29ubmVjdGVkU2lnbmVyLnNlbmRUcmFuc2FjdGlvbih0eFRvU2VuZCk7XHJcblxyXG4gICAgLy8gVHJhbnNhY3Rpb24gc2VudFxyXG5cclxuICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSAobmV0d29yayB2YXJpYWJsZSBhbHJlYWR5IGRlZmluZWQgYWJvdmUpXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3Rvcnkoc2lnbmVyLmFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBzaWduZXIuYWRkcmVzcyxcclxuICAgICAgdG86IHR4UmVxdWVzdC50byB8fCBudWxsLFxyXG4gICAgICB2YWx1ZTogdHhSZXF1ZXN0LnZhbHVlIHx8ICcwJyxcclxuICAgICAgZGF0YTogdHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogdHguZ2FzUHJpY2UgPyB0eC5nYXNQcmljZS50b1N0cmluZygpIDogJzAnLFxyXG4gICAgICBnYXNMaW1pdDogdHguZ2FzTGltaXQgPyB0eC5nYXNMaW1pdC50b1N0cmluZygpIDogbnVsbCxcclxuICAgICAgbm9uY2U6IHR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6IHR4SGlzdG9yeS5UWF9UWVBFUy5DT05UUkFDVFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2VuZCBkZXNrdG9wIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU2VudCcsXHJcbiAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBzZW50OiAke3R4Lmhhc2guc2xpY2UoMCwgMjApfS4uLmAsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb24gaW4gYmFja2dyb3VuZFxyXG4gICAgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIHNpZ25lci5hZGRyZXNzKTtcclxuXHJcbiAgICAvLyBMb2cgc3VjY2Vzc2Z1bCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6ICd0cmFuc2FjdGlvbicsXHJcbiAgICAgIGFkZHJlc3M6IHNpZ25lci5hZGRyZXNzLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiAnZXRoX3NlbmRUcmFuc2FjdGlvbicsXHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIHR4SGFzaDogdHguaGFzaCxcclxuICAgICAgd2FsbGV0VHlwZTogJ3NvZnR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUmVzb2x2ZSB3aXRoIHRyYW5zYWN0aW9uIGhhc2hcclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHR4Lmhhc2ggfSk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiB0eC5oYXNoIH07XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICAvLyBTRUNVUklUWTogQ2xlYW4gdXAgc2Vuc2l0aXZlIGRhdGEgZnJvbSBtZW1vcnlcclxuICAgICAgLy8gT3ZlcndyaXRlIHBhc3N3b3JkIHdpdGggZ2FyYmFnZSBiZWZvcmUgZGVyZWZlcmVuY2luZ1xyXG4gICAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgICBjb25zdCB0ZW1wT2JqID0geyBwYXNzd29yZCB9O1xyXG4gICAgICAgIHNlY3VyZUNsZWFudXAodGVtcE9iaiwgWydwYXNzd29yZCddKTtcclxuICAgICAgICBwYXNzd29yZCA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENsZWFuIHVwIHNpZ25lcidzIHByaXZhdGUga2V5XHJcbiAgICAgIGlmIChzaWduZXIpIHtcclxuICAgICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHNpZ25lcik7XHJcbiAgICAgICAgc2lnbmVyID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY29ubmVjdGVkU2lnbmVyKSB7XHJcbiAgICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihjb25uZWN0ZWRTaWduZXIpO1xyXG4gICAgICAgIGNvbm5lY3RlZFNpZ25lciA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBUcmFuc2FjdGlvbiBlcnJvcjonLCBlcnJvcik7XHJcbiAgICBjb25zdCBzYW5pdGl6ZWRFcnJvciA9IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpO1xyXG5cclxuICAgIC8vIExvZyBmYWlsZWQgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiAndHJhbnNhY3Rpb24nLFxyXG4gICAgICBhZGRyZXNzOiAndW5rbm93bicsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6ICdldGhfc2VuZFRyYW5zYWN0aW9uJyxcclxuICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgIGVycm9yOiBzYW5pdGl6ZWRFcnJvcixcclxuICAgICAgd2FsbGV0VHlwZTogJ3NvZnR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVqZWN0KG5ldyBFcnJvcihzYW5pdGl6ZWRFcnJvcikpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZWRFcnJvciB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHRyYW5zYWN0aW9uIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0VHJhbnNhY3Rpb25SZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmIChwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdHhSZXF1ZXN0IH0gPSBwZW5kaW5nVHJhbnNhY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luLCB0eFJlcXVlc3QgfTtcclxuICB9XHJcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQnIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXRfd2F0Y2hBc3NldCAtIEFkZCBjdXN0b20gdG9rZW4gKEVJUC03NDcpXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVdhdGNoQXNzZXQocGFyYW1zLCBvcmlnaW4sIHRhYikge1xyXG4gIC8vIFJlY2VpdmVkIHdhbGxldF93YXRjaEFzc2V0IHJlcXVlc3RcclxuXHJcbiAgLy8gVmFsaWRhdGUgcGFyYW1zIHN0cnVjdHVyZVxyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXMudHlwZSB8fCAhcGFyYW1zLm9wdGlvbnMpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zOiBtdXN0IGluY2x1ZGUgdHlwZSBhbmQgb3B0aW9ucycgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyB0eXBlLCBvcHRpb25zIH0gPSBwYXJhbXM7XHJcblxyXG4gIC8vIE9ubHkgc3VwcG9ydCBFUkMyMC9QUkMyMCB0b2tlbnNcclxuICBpZiAodHlwZS50b1VwcGVyQ2FzZSgpICE9PSAnRVJDMjAnKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdPbmx5IEVSQzIwL1BSQzIwIHRva2VucyBhcmUgc3VwcG9ydGVkJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSByZXF1aXJlZCB0b2tlbiBmaWVsZHNcclxuICBpZiAoIW9wdGlvbnMuYWRkcmVzcyB8fCAhb3B0aW9ucy5zeW1ib2wpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ1Rva2VuIG11c3QgaGF2ZSBhZGRyZXNzIGFuZCBzeW1ib2wnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VuSW5mbyA9IHtcclxuICAgIGFkZHJlc3M6IG9wdGlvbnMuYWRkcmVzcy50b0xvd2VyQ2FzZSgpLFxyXG4gICAgc3ltYm9sOiBvcHRpb25zLnN5bWJvbCxcclxuICAgIGRlY2ltYWxzOiBvcHRpb25zLmRlY2ltYWxzIHx8IDE4LFxyXG4gICAgaW1hZ2U6IG9wdGlvbnMuaW1hZ2UgfHwgbnVsbFxyXG4gIH07XHJcblxyXG4gIC8vIFJlcXVlc3RpbmcgdG8gYWRkIHRva2VuXHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xyXG4gICAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuc2V0KHJlcXVlc3RJZCwgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdG9rZW5JbmZvIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249YWRkVG9rZW4mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDUwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdUb2tlbiBhZGQgcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgdG9rZW4gYWRkIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVG9rZW5BZGRBcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCB0b2tlbkluZm8gfSA9IHBlbmRpbmdUb2tlblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG4gIHBlbmRpbmdUb2tlblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRva2VuJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBUb2tlbiBhcHByb3ZlZCAtIHJldHVybiB0cnVlICh3YWxsZXRfd2F0Y2hBc3NldCByZXR1cm5zIGJvb2xlYW4pXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiB0cnVlIH0pO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdG9rZW5JbmZvIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVG9rZW4gYWRkIGVycm9yOicsIGVycm9yKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgdG9rZW4gYWRkIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0VG9rZW5BZGRSZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmIChwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4sIHRva2VuSW5mbyB9ID0gcGVuZGluZ1Rva2VuUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBvcmlnaW4sIHRva2VuSW5mbyB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gU3BlZWQgdXAgYSBwZW5kaW5nIHRyYW5zYWN0aW9uIGJ5IHJlcGxhY2luZyBpdCB3aXRoIGhpZ2hlciBnYXMgcHJpY2VcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCBzZXNzaW9uVG9rZW4sIGdhc1ByaWNlTXVsdGlwbGllciA9IDEuMiwgY3VzdG9tR2FzUHJpY2UgPSBudWxsKSB7XHJcbiAgbGV0IHBhc3N3b3JkID0gbnVsbDtcclxuICBsZXQgc2lnbmVyID0gbnVsbDtcclxuICBsZXQgd2FsbGV0ID0gbnVsbDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2sgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB1bmxvY2tSZXN1bHQgPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG5cclxuICAgIC8vIFNFQ1VSSVRZOiBWZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGJlbG9uZ3MgdG8gdGhpcyB3YWxsZXRcclxuICAgIGNvbnN0IHdhbGxldEFkZHJlc3MgPSBhd2FpdCBzaWduZXIuZ2V0QWRkcmVzcygpO1xyXG4gICAgaWYgKHdhbGxldEFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgQWRkcmVzcyBtaXNtYXRjaCBpbiBzcGVlZC11cDogd2FsbGV0IGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggcmVxdWVzdCcpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdXYWxsZXQgYWRkcmVzcyBtaXNtYXRjaCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgb3JpZ2luYWwgdHJhbnNhY3Rpb24gaXMgZnJvbSB0aGlzIHdhbGxldFxyXG4gICAgaWYgKG9yaWdpbmFsVHguZnJvbSAmJiBvcmlnaW5hbFR4LmZyb20udG9Mb3dlckNhc2UoKSAhPT0gd2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVHJhbnNhY3Rpb24gb3duZXJzaGlwIGNoZWNrIGZhaWxlZDogdHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIHdhbGxldCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgbmV0d29yayBhbmQgY3JlYXRlIHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyXHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3JpZ2luYWxUeC5uZXR3b3JrO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICB3YWxsZXQgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIGFjdHVhbCB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW4gdG8gY2hlY2sgaXRzIHR5cGVcclxuICAgIC8vIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2Ugb2xkZXIgdHJhbnNhY3Rpb25zIGluIGhpc3RvcnkgbWF5IG5vdCBoYXZlIEVJUC0xNTU5IGZpZWxkcyBzdG9yZWRcclxuICAgIGxldCBpc0VJUDE1NTkgPSBvcmlnaW5hbFR4Lm1heEZlZVBlckdhcyB8fCBvcmlnaW5hbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhGZWVQZXJHYXMgPSBudWxsO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyA9IG51bGw7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgb25DaGFpblR4ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb24ob3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgICBpZiAob25DaGFpblR4KSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBFSVAtMTU1OSAodHlwZSAyKVxyXG4gICAgICAgIGlmIChvbkNoYWluVHgudHlwZSA9PT0gMiB8fCBvbkNoYWluVHgubWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICBpc0VJUDE1NTkgPSB0cnVlO1xyXG4gICAgICAgICAgb25DaGFpbk1heEZlZVBlckdhcyA9IG9uQ2hhaW5UeC5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBvbkNoYWluVHgubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBEZXRlY3RlZCBFSVAtMTU1OSB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW46Jywge1xyXG4gICAgICAgICAgICBtYXhGZWVQZXJHYXM6IG9uQ2hhaW5NYXhGZWVQZXJHYXM/LnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIG1heFByaW9yaXR5RmVlUGVyR2FzOiBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXM/LnRvU3RyaW5nKClcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZmV0Y2hFcnIpIHtcclxuICAgICAgY29uc29sZS53YXJuKCfwn6uAIENvdWxkIG5vdCBmZXRjaCBvcmlnaW5hbCB0eCBmcm9tIGJsb2NrY2hhaW46JywgZmV0Y2hFcnIubWVzc2FnZSk7XHJcbiAgICAgIC8vIENvbnRpbnVlIHdpdGggd2hhdCB3ZSBoYXZlIGZyb20gaGlzdG9yeVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSByZXBsYWNlbWVudCB0cmFuc2FjdGlvbiB3aXRoIHNhbWUgbm9uY2UsIGRhdGEsIGFuZCBnYXNMaW1pdFxyXG4gICAgY29uc3QgcmVwbGFjZW1lbnRUeCA9IHtcclxuICAgICAgdG86IG9yaWdpbmFsVHgudG8sXHJcbiAgICAgIHZhbHVlOiBvcmlnaW5hbFR4LnZhbHVlLFxyXG4gICAgICBkYXRhOiBvcmlnaW5hbFR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5jbHVkZSBnYXNMaW1pdCBpZiBpdCB3YXMgaW4gdGhlIG9yaWdpbmFsIHRyYW5zYWN0aW9uXHJcbiAgICBpZiAob3JpZ2luYWxUeC5nYXNMaW1pdCkge1xyXG4gICAgICByZXBsYWNlbWVudFR4Lmdhc0xpbWl0ID0gb3JpZ2luYWxUeC5nYXNMaW1pdDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3Igc3RvcmluZyBpbiBoaXN0b3J5XHJcbiAgICBsZXQgbmV3R2FzUHJpY2UgPSBudWxsO1xyXG4gICAgbGV0IG5ld01heEZlZVBlckdhcyA9IG51bGw7XHJcbiAgICBsZXQgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBudWxsO1xyXG5cclxuICAgIGlmIChpc0VJUDE1NTkpIHtcclxuICAgICAgLy8gRUlQLTE1NTk6IE11c3QgYnVtcCBCT1RIIG1heEZlZVBlckdhcyBhbmQgbWF4UHJpb3JpdHlGZWVQZXJHYXMgYnkgYXQgbGVhc3QgMTAlXHJcbiAgICAgIC8vIFVzaW5nIDEyLjUlIGJ1bXAgdG8gZW5zdXJlIGFjY2VwdGFuY2UgKHNhbWUgYXMgRXRoZXJldW0gZGVmYXVsdClcclxuICAgICAgY29uc3QgYnVtcE11bHRpcGxpZXIgPSAxMTI1bjsgLy8gMTEyLjUlID0gMS4xMjV4XHJcbiAgICAgIGNvbnN0IGJ1bXBEaXZpc29yID0gMTAwMG47XHJcblxyXG4gICAgICAvLyBVc2Ugb24tY2hhaW4gdmFsdWVzIGlmIGF2YWlsYWJsZSAobW9yZSBhY2N1cmF0ZSksIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gaGlzdG9yeVxyXG4gICAgICBjb25zdCBvcmlnaW5hbE1heEZlZSA9IG9uQ2hhaW5NYXhGZWVQZXJHYXMgfHwgQmlnSW50KG9yaWdpbmFsVHgubWF4RmVlUGVyR2FzIHx8IG9yaWdpbmFsVHguZ2FzUHJpY2UgfHwgJzAnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxQcmlvcml0eUZlZSA9IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyB8fCBCaWdJbnQob3JpZ2luYWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcyB8fCAnMCcpO1xyXG5cclxuICAgICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgICAgLy8gQ3VzdG9tIGdhcyBwcmljZTogdXNlIGl0IGZvciBtYXhGZWVQZXJHYXMsIGNhbGN1bGF0ZSBwcmlvcml0eSBmZWVcclxuICAgICAgICBjb25zdCBjdXN0b21GZWUgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgICAgIC8vIFByaW9yaXR5IGZlZSBzaG91bGQgYmUgYXQgbGVhc3QgMTIuNSUgaGlnaGVyIHRoYW4gb3JpZ2luYWxcclxuICAgICAgICBjb25zdCBtaW5Qcmlvcml0eUZlZSA9IChvcmlnaW5hbFByaW9yaXR5RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgLy8gVXNlIGF0IGxlYXN0IDEgR3dlaSBmb3IgcHJpb3JpdHkgZmVlIGlmIG5vdCBzZXRcclxuICAgICAgICBjb25zdCBwcmlvcml0eUZlZSA9IG1pblByaW9yaXR5RmVlID4gMG4gPyBtaW5Qcmlvcml0eUZlZSA6IDEwMDAwMDAwMDBuO1xyXG5cclxuICAgICAgICBuZXdNYXhGZWVQZXJHYXMgPSBjdXN0b21GZWU7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBwcmlvcml0eUZlZSA8IGN1c3RvbUZlZSA/IHByaW9yaXR5RmVlIDogY3VzdG9tRmVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBidW1wZWQgZmVlcyAoMTIuNSUgaGlnaGVyKVxyXG4gICAgICAgIG5ld01heEZlZVBlckdhcyA9IChvcmlnaW5hbE1heEZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG4gICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gKG9yaWdpbmFsUHJpb3JpdHlGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIHByaW9yaXR5IGZlZSBpcyBhdCBsZWFzdCAxIEd3ZWlcclxuICAgICAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPCAxMDAwMDAwMDAwbikge1xyXG4gICAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSAxMDAwMDAwMDAwbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcGxhY2VtZW50VHgubWF4RmVlUGVyR2FzID0gbmV3TWF4RmVlUGVyR2FzO1xyXG4gICAgICByZXBsYWNlbWVudFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygn8J+rgCBFSVAtMTU1OSBzcGVlZC11cDonLCB7XHJcbiAgICAgICAgb3JpZ2luYWxNYXhGZWU6IG9yaWdpbmFsTWF4RmVlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgb3JpZ2luYWxQcmlvcml0eUZlZTogb3JpZ2luYWxQcmlvcml0eUZlZS50b1N0cmluZygpLFxyXG4gICAgICAgIG5ld01heEZlZTogbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbmV3UHJpb3JpdHlGZWU6IG5ld01heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKClcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBMZWdhY3kgdHJhbnNhY3Rpb246IHVzZSBnYXNQcmljZVxyXG4gICAgICBpZiAoY3VzdG9tR2FzUHJpY2UpIHtcclxuICAgICAgICAvLyBVc2UgY3VzdG9tIGdhcyBwcmljZSBwcm92aWRlZCBieSB1c2VyXHJcbiAgICAgICAgbmV3R2FzUHJpY2UgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBmcm9tIG11bHRpcGxpZXIgKDEuMnggb2Ygb3JpZ2luYWwgYnkgZGVmYXVsdClcclxuICAgICAgICBjb25zdCBvcmlnaW5hbEdhc1ByaWNlID0gQmlnSW50KG9yaWdpbmFsVHguZ2FzUHJpY2UpO1xyXG4gICAgICAgIG5ld0dhc1ByaWNlID0gKG9yaWdpbmFsR2FzUHJpY2UgKiBCaWdJbnQoTWF0aC5mbG9vcihnYXNQcmljZU11bHRpcGxpZXIgKiAxMDApKSkgLyBCaWdJbnQoMTAwKTtcclxuICAgICAgfVxyXG4gICAgICByZXBsYWNlbWVudFR4Lmdhc1ByaWNlID0gbmV3R2FzUHJpY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3BlZWRpbmcgdXAgdHJhbnNhY3Rpb25cclxuXHJcbiAgICAvLyBTZW5kIHJlcGxhY2VtZW50IHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHdhbGxldC5zZW5kVHJhbnNhY3Rpb24ocmVwbGFjZW1lbnRUeCk7XHJcblxyXG4gICAgLy8gU2F2ZSBuZXcgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSAoaW5jbHVkZSBFSVAtMTU1OSBmaWVsZHMgaWYgYXBwbGljYWJsZSlcclxuICAgIGNvbnN0IGhpc3RvcnlFbnRyeSA9IHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIGRhdGE6IG9yaWdpbmFsVHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogbmV3R2FzUHJpY2UgPyBuZXdHYXNQcmljZS50b1N0cmluZygpIDogKG5ld01heEZlZVBlckdhcyA/IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpIDogb3JpZ2luYWxUeC5nYXNQcmljZSksXHJcbiAgICAgIGdhc0xpbWl0OiBvcmlnaW5hbFR4Lmdhc0xpbWl0LFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiBvcmlnaW5hbFR4LnR5cGVcclxuICAgIH07XHJcblxyXG4gICAgLy8gQWRkIEVJUC0xNTU5IGZpZWxkcyBpZiB0aGlzIHdhcyBhbiBFSVAtMTU1OSB0cmFuc2FjdGlvblxyXG4gICAgaWYgKG5ld01heEZlZVBlckdhcykge1xyXG4gICAgICBoaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMpIHtcclxuICAgICAgaGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgaGlzdG9yeUVudHJ5KTtcclxuXHJcbiAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIHJlcGxhY2VkL2ZhaWxlZFxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCwgbnVsbCk7XHJcblxyXG4gICAgLy8gU2VuZCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNwZWQgVXAnLFxyXG4gICAgICBtZXNzYWdlOiBgUmVwbGFjZW1lbnQgdHJhbnNhY3Rpb24gc2VudCB3aXRoICR7TWF0aC5mbG9vcihnYXNQcmljZU11bHRpcGxpZXIgKiAxMDApfSUgZ2FzIHByaWNlYCxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvblxyXG4gICAgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCwgbmV3R2FzUHJpY2U6IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCkgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBzcGVlZGluZyB1cCB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIC8vIFNFQ1VSSVRZOiBDbGVhbiB1cCBzZW5zaXRpdmUgZGF0YSBmcm9tIG1lbW9yeVxyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNvbnN0IHRlbXBPYmogPSB7IHBhc3N3b3JkIH07XHJcbiAgICAgIHNlY3VyZUNsZWFudXAodGVtcE9iaiwgWydwYXNzd29yZCddKTtcclxuICAgICAgcGFzc3dvcmQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHNpZ25lcikge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHNpZ25lcik7XHJcbiAgICAgIHNpZ25lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAod2FsbGV0KSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIod2FsbGV0KTtcclxuICAgICAgd2FsbGV0ID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIENhbmNlbCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gYnkgcmVwbGFjaW5nIGl0IHdpdGggYSB6ZXJvLXZhbHVlIHR4IHRvIHNlbGZcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHNlc3Npb25Ub2tlbiwgY3VzdG9tR2FzUHJpY2UgPSBudWxsKSB7XHJcbiAgbGV0IHBhc3N3b3JkID0gbnVsbDtcclxuICBsZXQgc2lnbmVyID0gbnVsbDtcclxuICBsZXQgd2FsbGV0ID0gbnVsbDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2sgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB1bmxvY2tSZXN1bHQgPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG5cclxuICAgIC8vIFNFQ1VSSVRZOiBWZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGJlbG9uZ3MgdG8gdGhpcyB3YWxsZXRcclxuICAgIGNvbnN0IHdhbGxldEFkZHJlc3MgPSBhd2FpdCBzaWduZXIuZ2V0QWRkcmVzcygpO1xyXG4gICAgaWYgKHdhbGxldEFkZHJlc3MudG9Mb3dlckNhc2UoKSAhPT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgQWRkcmVzcyBtaXNtYXRjaCBpbiBjYW5jZWw6IHdhbGxldCBhZGRyZXNzIGRvZXMgbm90IG1hdGNoIHJlcXVlc3QnKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnV2FsbGV0IGFkZHJlc3MgbWlzbWF0Y2gnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVmVyaWZ5IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGlzIGZyb20gdGhpcyB3YWxsZXRcclxuICAgIGlmIChvcmlnaW5hbFR4LmZyb20gJiYgb3JpZ2luYWxUeC5mcm9tLnRvTG93ZXJDYXNlKCkgIT09IHdhbGxldEFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRyYW5zYWN0aW9uIG93bmVyc2hpcCBjaGVjayBmYWlsZWQ6IHRyYW5zYWN0aW9uIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIHdhbGxldCcpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyB3YWxsZXQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IG5ldHdvcmsgYW5kIGNyZWF0ZSBwcm92aWRlciB3aXRoIGF1dG9tYXRpYyBmYWlsb3ZlclxyXG4gICAgY29uc3QgbmV0d29yayA9IG9yaWdpbmFsVHgubmV0d29yaztcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgd2FsbGV0ID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBhY3R1YWwgdHJhbnNhY3Rpb24gZnJvbSBibG9ja2NoYWluIHRvIGNoZWNrIGl0cyB0eXBlXHJcbiAgICBsZXQgaXNFSVAxNTU5ID0gb3JpZ2luYWxUeC5tYXhGZWVQZXJHYXMgfHwgb3JpZ2luYWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgIGxldCBvbkNoYWluTWF4RmVlUGVyR2FzID0gbnVsbDtcclxuICAgIGxldCBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBudWxsO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IG9uQ2hhaW5UeCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uKG9yaWdpbmFsVHhIYXNoKTtcclxuICAgICAgaWYgKG9uQ2hhaW5UeCkge1xyXG4gICAgICAgIGlmIChvbkNoYWluVHgudHlwZSA9PT0gMiB8fCBvbkNoYWluVHgubWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICBpc0VJUDE1NTkgPSB0cnVlO1xyXG4gICAgICAgICAgb25DaGFpbk1heEZlZVBlckdhcyA9IG9uQ2hhaW5UeC5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgICBvbkNoYWluTWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBvbkNoYWluVHgubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBEZXRlY3RlZCBFSVAtMTU1OSB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW4gZm9yIGNhbmNlbCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZmV0Y2hFcnIpIHtcclxuICAgICAgY29uc29sZS53YXJuKCfwn6uAIENvdWxkIG5vdCBmZXRjaCBvcmlnaW5hbCB0eCBmcm9tIGJsb2NrY2hhaW46JywgZmV0Y2hFcnIubWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiAoc2VuZCAwIHRvIHNlbGYgd2l0aCBzYW1lIG5vbmNlKVxyXG4gICAgY29uc3QgY2FuY2VsVHggPSB7XHJcbiAgICAgIHRvOiBhZGRyZXNzLCAgLy8gU2VuZCB0byBzZWxmXHJcbiAgICAgIHZhbHVlOiAnMCcsICAgLy8gWmVybyB2YWx1ZVxyXG4gICAgICBkYXRhOiAnMHgnLCAgIC8vIEVtcHR5IGRhdGFcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIGdhc0xpbWl0OiAyMTAwMCAgLy8gU3RhbmRhcmQgZ2FzIGxpbWl0IGZvciBzaW1wbGUgRVRIIHRyYW5zZmVyXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEZvciBzdG9yaW5nIGluIGhpc3RvcnlcclxuICAgIGxldCBuZXdHYXNQcmljZSA9IG51bGw7XHJcbiAgICBsZXQgbmV3TWF4RmVlUGVyR2FzID0gbnVsbDtcclxuICAgIGxldCBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IG51bGw7XHJcblxyXG4gICAgaWYgKGlzRUlQMTU1OSkge1xyXG4gICAgICAvLyBFSVAtMTU1OTogTXVzdCBidW1wIEJPVEggbWF4RmVlUGVyR2FzIGFuZCBtYXhQcmlvcml0eUZlZVBlckdhcyBieSBhdCBsZWFzdCAxMCVcclxuICAgICAgY29uc3QgYnVtcE11bHRpcGxpZXIgPSAxMTI1bjsgLy8gMTEyLjUlXHJcbiAgICAgIGNvbnN0IGJ1bXBEaXZpc29yID0gMTAwMG47XHJcblxyXG4gICAgICAvLyBVc2Ugb24tY2hhaW4gdmFsdWVzIGlmIGF2YWlsYWJsZVxyXG4gICAgICBjb25zdCBvcmlnaW5hbE1heEZlZSA9IG9uQ2hhaW5NYXhGZWVQZXJHYXMgfHwgQmlnSW50KG9yaWdpbmFsVHgubWF4RmVlUGVyR2FzIHx8IG9yaWdpbmFsVHguZ2FzUHJpY2UgfHwgJzAnKTtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxQcmlvcml0eUZlZSA9IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyB8fCBCaWdJbnQob3JpZ2luYWxUeC5tYXhQcmlvcml0eUZlZVBlckdhcyB8fCAnMCcpO1xyXG5cclxuICAgICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgICAgLy8gQ3VzdG9tIGdhcyBwcmljZTogdXNlIGl0IGZvciBtYXhGZWVQZXJHYXNcclxuICAgICAgICBjb25zdCBjdXN0b21GZWUgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgICAgIGNvbnN0IG1pblByaW9yaXR5RmVlID0gKG9yaWdpbmFsUHJpb3JpdHlGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuICAgICAgICBjb25zdCBwcmlvcml0eUZlZSA9IG1pblByaW9yaXR5RmVlID4gMG4gPyBtaW5Qcmlvcml0eUZlZSA6IDEwMDAwMDAwMDBuO1xyXG5cclxuICAgICAgICBuZXdNYXhGZWVQZXJHYXMgPSBjdXN0b21GZWU7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBwcmlvcml0eUZlZSA8IGN1c3RvbUZlZSA/IHByaW9yaXR5RmVlIDogY3VzdG9tRmVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBidW1wZWQgZmVlc1xyXG4gICAgICAgIG5ld01heEZlZVBlckdhcyA9IChvcmlnaW5hbE1heEZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG4gICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gKG9yaWdpbmFsUHJpb3JpdHlGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuXHJcbiAgICAgICAgaWYgKG5ld01heFByaW9yaXR5RmVlUGVyR2FzIDwgMTAwMDAwMDAwMG4pIHtcclxuICAgICAgICAgIG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gMTAwMDAwMDAwMG47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjYW5jZWxUeC5tYXhGZWVQZXJHYXMgPSBuZXdNYXhGZWVQZXJHYXM7XHJcbiAgICAgIGNhbmNlbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygn8J+rgCBFSVAtMTU1OSBjYW5jZWw6Jywge1xyXG4gICAgICAgIG9yaWdpbmFsTWF4RmVlOiBvcmlnaW5hbE1heEZlZS50b1N0cmluZygpLFxyXG4gICAgICAgIG9yaWdpbmFsUHJpb3JpdHlGZWU6IG9yaWdpbmFsUHJpb3JpdHlGZWUudG9TdHJpbmcoKSxcclxuICAgICAgICBuZXdNYXhGZWU6IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpLFxyXG4gICAgICAgIG5ld1ByaW9yaXR5RmVlOiBuZXdNYXhQcmlvcml0eUZlZVBlckdhcy50b1N0cmluZygpXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTGVnYWN5IHRyYW5zYWN0aW9uXHJcbiAgICAgIGlmIChjdXN0b21HYXNQcmljZSkge1xyXG4gICAgICAgIG5ld0dhc1ByaWNlID0gQmlnSW50KGN1c3RvbUdhc1ByaWNlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbEdhc1ByaWNlID0gQmlnSW50KG9yaWdpbmFsVHguZ2FzUHJpY2UpO1xyXG4gICAgICAgIG5ld0dhc1ByaWNlID0gKG9yaWdpbmFsR2FzUHJpY2UgKiBCaWdJbnQoMTIwKSkgLyBCaWdJbnQoMTAwKTtcclxuICAgICAgfVxyXG4gICAgICBjYW5jZWxUeC5nYXNQcmljZSA9IG5ld0dhc1ByaWNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbmNlbGxpbmcgdHJhbnNhY3Rpb25cclxuXHJcbiAgICAvLyBTZW5kIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgdHggPSBhd2FpdCB3YWxsZXQuc2VuZFRyYW5zYWN0aW9uKGNhbmNlbFR4KTtcclxuXHJcbiAgICAvLyBTYXZlIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAgICBjb25zdCBoaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogYWRkcmVzcyxcclxuICAgICAgdG86IGFkZHJlc3MsXHJcbiAgICAgIHZhbHVlOiAnMCcsXHJcbiAgICAgIGRhdGE6ICcweCcsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZSA/IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCkgOiAobmV3TWF4RmVlUGVyR2FzID8gbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCkgOiBvcmlnaW5hbFR4Lmdhc1ByaWNlKSxcclxuICAgICAgZ2FzTGltaXQ6ICcyMTAwMCcsXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6ICdzZW5kJ1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAobmV3TWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgIGhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIGlmIChuZXdNYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICBoaXN0b3J5RW50cnkubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBuZXdNYXhQcmlvcml0eUZlZVBlckdhcy50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShhZGRyZXNzLCBoaXN0b3J5RW50cnkpO1xyXG5cclxuICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgZmFpbGVkXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAvLyBTZW5kIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ2FuY2VsbGVkJyxcclxuICAgICAgbWVzc2FnZTogJ0NhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiBzZW50JyxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvblxyXG4gICAgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGNhbmNlbGxpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBTRUNVUklUWTogQ2xlYW4gdXAgc2Vuc2l0aXZlIGRhdGEgZnJvbSBtZW1vcnlcclxuICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICBjb25zdCB0ZW1wT2JqID0geyBwYXNzd29yZCB9O1xyXG4gICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChzaWduZXIpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHdhbGxldCkge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHdhbGxldCk7XHJcbiAgICAgIHdhbGxldCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGdhcyBwcmljZSAoZm9yIHNwZWVkLXVwIFVJKVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50TmV0d29ya0dhc1ByaWNlKG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgLy8gR2V0IGZ1bGwgZ2FzIHByaWNlIHJlY29tbWVuZGF0aW9ucyBiYXNlZCBvbiBmZWUgaGlzdG9yeVxyXG4gICAgY29uc3QgcmVjb21tZW5kYXRpb25zID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlUmVjb21tZW5kYXRpb25zKG5ldHdvcmspO1xyXG5cclxuICAgIC8vIFVzZSBcImZhc3RcIiB0aWVyIGFzIHRoZSByZWNvbW1lbmRlZCBzcGVlZC11cCBwcmljZVxyXG4gICAgY29uc3QgZmFzdFByaWNlID0gQmlnSW50KHJlY29tbWVuZGF0aW9ucy5mYXN0Lm1heEZlZVBlckdhcyk7XHJcbiAgICBjb25zdCBpbnN0YW50UHJpY2UgPSBCaWdJbnQocmVjb21tZW5kYXRpb25zLmluc3RhbnQubWF4RmVlUGVyR2FzKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICBnYXNQcmljZTogZmFzdFByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgIGdhc1ByaWNlR3dlaTogKE51bWJlcihmYXN0UHJpY2UpIC8gMWU5KS50b0ZpeGVkKDIpLFxyXG4gICAgICByZWNvbW1lbmRhdGlvbnM6IHtcclxuICAgICAgICBzbG93OiByZWNvbW1lbmRhdGlvbnMuc2xvdy5tYXhGZWVQZXJHYXMsXHJcbiAgICAgICAgbm9ybWFsOiByZWNvbW1lbmRhdGlvbnMubm9ybWFsLm1heEZlZVBlckdhcyxcclxuICAgICAgICBmYXN0OiByZWNvbW1lbmRhdGlvbnMuZmFzdC5tYXhGZWVQZXJHYXMsXHJcbiAgICAgICAgaW5zdGFudDogcmVjb21tZW5kYXRpb25zLmluc3RhbnQubWF4RmVlUGVyR2FzXHJcbiAgICAgIH0sXHJcbiAgICAgIGluc3RhbnRQcmljZTogaW5zdGFudFByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgIGluc3RhbnRQcmljZUd3ZWk6IChOdW1iZXIoaW5zdGFudFByaWNlKSAvIDFlOSkudG9GaXhlZCgyKVxyXG4gICAgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBmZXRjaGluZyBjdXJyZW50IGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBSZWZyZXNoIHRyYW5zYWN0aW9uIHN0YXR1cyBmcm9tIGJsb2NrY2hhaW5cclxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFRyYW5zYWN0aW9uU3RhdHVzKGFkZHJlc3MsIHR4SGFzaCwgbmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBSZWZyZXNoaW5nIHR4IHN0YXR1czogJHt0eEhhc2h9IG9uICR7bmV0d29ya31gKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG5cclxuICAgIC8vIEdldCB0cmFuc2FjdGlvbiByZWNlaXB0IGZyb20gYmxvY2tjaGFpblxyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uUmVjZWlwdCh0eEhhc2gpO1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgUmVjZWlwdCBmb3IgJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLjpgLCByZWNlaXB0ID8gJ2ZvdW5kJyA6ICdudWxsJyk7XHJcblxyXG4gICAgaWYgKCFyZWNlaXB0KSB7XHJcbiAgICAgIC8vIE5vIHJlY2VpcHQgLSBjaGVjayBpZiB0cmFuc2FjdGlvbiBpcyBzdGlsbCBpbiBtZW1wb29sXHJcbiAgICAgIGNvbnN0IHR4ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb24odHhIYXNoKTtcclxuICAgICAgY29uc29sZS5sb2coYPCfq4AgTWVtcG9vbCB0eCBmb3IgJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLjpgLCB0eCA/ICdmb3VuZCcgOiAnbnVsbCcpO1xyXG5cclxuICAgICAgaWYgKCF0eCkge1xyXG4gICAgICAgIC8vIFRyYW5zYWN0aW9uIG5vdCBpbiBtZW1wb29sIGFuZCBubyByZWNlaXB0ID0gZHJvcHBlZC9ldmljdGVkXHJcbiAgICAgICAgY29uc29sZS5sb2coYPCfq4AgVHJhbnNhY3Rpb24gJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiB3YXMgRFJPUFBFRCAtIG1hcmtpbmcgYXMgZmFpbGVkYCk7XHJcbiAgICAgICAgLy8gTWFyayBhcyBmYWlsZWQgaW4gbG9jYWwgaGlzdG9yeVxyXG4gICAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgICB0eEhhc2gsXHJcbiAgICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCxcclxuICAgICAgICAgIG51bGxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIHN0YXR1czogJ2Ryb3BwZWQnLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ1RyYW5zYWN0aW9uIHdhcyBkcm9wcGVkIGZyb20gbWVtcG9vbCAobm90IGNvbmZpcm1lZCwgbm8gbG9uZ2VyIHBlbmRpbmcpJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIGV4aXN0cyBpbiBtZW1wb29sLCBzdGlsbCBwZW5kaW5nXHJcbiAgICAgIGNvbnNvbGUubG9nKGDwn6uAIFRyYW5zYWN0aW9uICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4gc3RpbGwgaW4gbWVtcG9vbGApO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXHJcbiAgICAgICAgbWVzc2FnZTogJ1RyYW5zYWN0aW9uIGlzIHN0aWxsIHBlbmRpbmcgb24gdGhlIGJsb2NrY2hhaW4nXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGFzIGJlZW4gbWluZWRcclxuICAgIGxldCBuZXdTdGF0dXM7XHJcbiAgICBpZiAocmVjZWlwdC5zdGF0dXMgPT09IDEpIHtcclxuICAgICAgbmV3U3RhdHVzID0gdHhIaXN0b3J5LlRYX1NUQVRVUy5DT05GSVJNRUQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuZXdTdGF0dXMgPSB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgbG9jYWwgdHJhbnNhY3Rpb24gaGlzdG9yeVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICBhZGRyZXNzLFxyXG4gICAgICB0eEhhc2gsXHJcbiAgICAgIG5ld1N0YXR1cyxcclxuICAgICAgcmVjZWlwdC5ibG9ja051bWJlclxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICBzdGF0dXM6IG5ld1N0YXR1cyxcclxuICAgICAgYmxvY2tOdW1iZXI6IHJlY2VpcHQuYmxvY2tOdW1iZXIsXHJcbiAgICAgIG1lc3NhZ2U6IG5ld1N0YXR1cyA9PT0gdHhIaXN0b3J5LlRYX1NUQVRVUy5DT05GSVJNRURcclxuICAgICAgICA/ICdUcmFuc2FjdGlvbiBjb25maXJtZWQgb24gYmxvY2tjaGFpbidcclxuICAgICAgICA6ICdUcmFuc2FjdGlvbiBmYWlsZWQgb24gYmxvY2tjaGFpbidcclxuICAgIH07XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHJlZnJlc2hpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFJlYnJvYWRjYXN0IGEgcGVuZGluZyB0cmFuc2FjdGlvbiB0byBhbGwgY29uZmlndXJlZCBSUENzXHJcbmFzeW5jIGZ1bmN0aW9uIHJlYnJvYWRjYXN0VHJhbnNhY3Rpb24odHhIYXNoLCBuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFJlYnJvYWRjYXN0aW5nIHRyYW5zYWN0aW9uOiAke3R4SGFzaH0gdG8gYWxsICR7bmV0d29ya30gUlBDc2ApO1xyXG5cclxuICAgIC8vIEZpcnN0LCB0cnkgdG8gZ2V0IHRoZSByYXcgdHJhbnNhY3Rpb25cclxuICAgIGxldCByYXdUeCA9IGF3YWl0IHJwYy5nZXRSYXdUcmFuc2FjdGlvbihuZXR3b3JrLCB0eEhhc2gpO1xyXG5cclxuICAgIGlmICghcmF3VHgpIHtcclxuICAgICAgLy8gSWYgZ2V0UmF3VHJhbnNhY3Rpb24gbm90IHN1cHBvcnRlZCwgd2UgbmVlZCB0byByZWNvbnN0cnVjdCBmcm9tIHR4IGRhdGFcclxuICAgICAgLy8gR2V0IHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICBjb25zdCB0eCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uKHR4SGFzaCk7XHJcblxyXG4gICAgICBpZiAoIXR4KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6ICdUcmFuc2FjdGlvbiBub3QgZm91bmQgaW4gbWVtcG9vbCAtIGl0IG1heSBoYXZlIGJlZW4gZHJvcHBlZCBvciBhbHJlYWR5IGNvbmZpcm1lZCdcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIHJhdyBzZXJpYWxpemVkIHRyYW5zYWN0aW9uIGZyb20gdGhlIHByb3ZpZGVyXHJcbiAgICAgIC8vIGV0aGVycyB2NiBkb2Vzbid0IGV4cG9zZSByYXcgdHggZGlyZWN0bHksIHNvIHdlIHVzZSBhIHdvcmthcm91bmRcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBUcnkgZGlyZWN0IFJQQyBjYWxsIHRvIGdldCByYXcgdHhcclxuICAgICAgICBjb25zdCByYXdSZXN1bHQgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0UmF3VHJhbnNhY3Rpb25CeUhhc2gnLCBbdHhIYXNoXSk7XHJcbiAgICAgICAgaWYgKHJhd1Jlc3VsdCkge1xyXG4gICAgICAgICAgcmF3VHggPSByYXdSZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgZ2V0IHJhdyB0cmFuc2FjdGlvbiB2aWEgUlBDOicsIGUubWVzc2FnZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcmF3VHgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICBlcnJvcjogJ0Nhbm5vdCBnZXQgcmF3IHRyYW5zYWN0aW9uIGRhdGEuIFRoZSBSUEMgbm9kZXMgbWF5IG5vdCBzdXBwb3J0IHRoaXMgb3BlcmF0aW9uLidcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQnJvYWRjYXN0IHRvIGFsbCBSUENzXHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcnBjLmJyb2FkY2FzdFRvQWxsUnBjcyhuZXR3b3JrLCByYXdUeCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coYPCfq4AgUmVicm9hZGNhc3QgcmVzdWx0cyAtIFN1Y2Nlc3NlczogJHtyZXN1bHRzLnN1Y2Nlc3Nlcy5sZW5ndGh9LCBGYWlsdXJlczogJHtyZXN1bHRzLmZhaWx1cmVzLmxlbmd0aH1gKTtcclxuXHJcbiAgICBpZiAocmVzdWx0cy5zdWNjZXNzZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIGJyb2FkY2FzdCB0byAke3Jlc3VsdHMuc3VjY2Vzc2VzLmxlbmd0aH0gUlBDKHMpYCxcclxuICAgICAgICBzdWNjZXNzZXM6IHJlc3VsdHMuc3VjY2Vzc2VzLFxyXG4gICAgICAgIGZhaWx1cmVzOiByZXN1bHRzLmZhaWx1cmVzXHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIGJyb2FkY2FzdCB0byBhbnkgUlBDJyxcclxuICAgICAgICBmYWlsdXJlczogcmVzdWx0cy5mYWlsdXJlc1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciByZWJyb2FkY2FzdGluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBUcmFjayB0cmFuc2FjdGlvbnMgYmVpbmcgbW9uaXRvcmVkIHRvIHByZXZlbnQgZHVwbGljYXRlc1xyXG5jb25zdCBtb25pdG9yaW5nVHJhbnNhY3Rpb25zID0gbmV3IFNldCgpO1xyXG5cclxuLy8gV2FpdCBmb3IgdHJhbnNhY3Rpb24gY29uZmlybWF0aW9uIHdpdGggdGltZW91dCBhbmQgcmV0cnlcclxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpIHtcclxuICBjb25zdCB0eEhhc2ggPSB0eC5oYXNoO1xyXG5cclxuICAvLyBQcmV2ZW50IGR1cGxpY2F0ZSBtb25pdG9yaW5nXHJcbiAgaWYgKG1vbml0b3JpbmdUcmFuc2FjdGlvbnMuaGFzKHR4SGFzaCkpIHtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFRyYW5zYWN0aW9uICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4gYWxyZWFkeSBiZWluZyBtb25pdG9yZWRgKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgbW9uaXRvcmluZ1RyYW5zYWN0aW9ucy5hZGQodHhIYXNoKTtcclxuXHJcbiAgY29uc3QgUE9MTF9JTlRFUlZBTCA9IDE1ICogMTAwMDsgLy8gMTUgc2Vjb25kc1xyXG4gIGNvbnN0IE1BWF9SRVRSSUVTID0gNDA7IC8vIDQwICogMTVzID0gMTAgbWludXRlc1xyXG5cclxuICB0cnkge1xyXG4gICAgbGV0IHJlY2VpcHQgPSBudWxsO1xyXG4gICAgbGV0IHJldHJpZXMgPSAwO1xyXG5cclxuICAgIC8vIFBvbGwgZm9yIHJlY2VpcHQgd2l0aCB0aW1lb3V0XHJcbiAgICB3aGlsZSAoIXJlY2VpcHQgJiYgcmV0cmllcyA8IE1BWF9SRVRSSUVTKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uUmVjZWlwdCh0eEhhc2gpO1xyXG4gICAgICAgIGlmIChyZWNlaXB0KSBicmVhaztcclxuICAgICAgfSBjYXRjaCAocnBjRXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oYPCfq4AgUlBDIGVycm9yIGNoZWNraW5nIHR4ICR7dHhIYXNoLnNsaWNlKDAsIDEwKX0uLi4sIHJldHJ5aW5nOmAsIHJwY0Vycm9yLm1lc3NhZ2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBXYWl0IGJlZm9yZSBuZXh0IHBvbGxcclxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIFBPTExfSU5URVJWQUwpKTtcclxuICAgICAgcmV0cmllcysrO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmVjZWlwdCkge1xyXG4gICAgICBjb25zb2xlLndhcm4oYPCfq4AgVHJhbnNhY3Rpb24gJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiBjb25maXJtYXRpb24gdGltZWQgb3V0IGFmdGVyICR7TUFYX1JFVFJJRVN9IGF0dGVtcHRzYCk7XHJcbiAgICAgIC8vIERvbid0IG1hcmsgYXMgZmFpbGVkIC0gaXQgbWlnaHQgc3RpbGwgYmUgcGVuZGluZyBpbiBtZW1wb29sXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVjZWlwdC5zdGF0dXMgPT09IDEpIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gY29uZmlybWVkIHN1Y2Nlc3NmdWxseVxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICB0eEhhc2gsXHJcbiAgICAgICAgdHhIaXN0b3J5LlRYX1NUQVRVUy5DT05GSVJNRUQsXHJcbiAgICAgICAgcmVjZWlwdC5ibG9ja051bWJlclxyXG4gICAgICApO1xyXG5cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ29uZmlybWVkJyxcclxuICAgICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gY29uZmlybWVkIGluIGJsb2NrICR7cmVjZWlwdC5ibG9ja051bWJlcn1gLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gcmV2ZXJ0ZWQgKHN0YXR1cyA9PT0gMClcclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgdHhIYXNoLFxyXG4gICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELFxyXG4gICAgICAgIHJlY2VpcHQuYmxvY2tOdW1iZXJcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIEZhaWxlZCcsXHJcbiAgICAgICAgbWVzc2FnZTogJ1RyYW5zYWN0aW9uIHdhcyByZXZlcnRlZCBvbi1jaGFpbicsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgaW4gY29uZmlybWF0aW9uIG1vbml0b3Jpbmc6JywgZXJyb3IpO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBBbHdheXMgY2xlYW4gdXAgdHJhY2tpbmdcclxuICAgIG1vbml0b3JpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHR4SGFzaCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBNRVNTQUdFIFNJR05JTkcgSEFORExFUlMgPT09PT1cclxuXHJcbi8vIEhhbmRsZSBwZXJzb25hbF9zaWduIChFSVAtMTkxKSAtIFNpZ24gYSBtZXNzYWdlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVBlcnNvbmFsU2lnbihwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKSB7XHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgc2lnbiByZXF1ZXN0XHJcbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlU2lnblJlcXVlc3QobWV0aG9kLCBwYXJhbXMpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgc2lnbiByZXF1ZXN0IGZyb20gb3JpZ2luOicsIG9yaWdpbiwgdmFsaWRhdGlvbi5lcnJvcik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IC0zMjYwMixcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBzaWduIHJlcXVlc3Q6ICcgKyBzYW5pdGl6ZUVycm9yTWVzc2FnZSh2YWxpZGF0aW9uLmVycm9yKVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBtZXNzYWdlLCBhZGRyZXNzIH0gPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IENoZWNrIGlmIGV0aF9zaWduIGlzIGFsbG93ZWQgKGRpc2FibGVkIGJ5IGRlZmF1bHQpXHJcbiAgaWYgKG1ldGhvZCA9PT0gJ2V0aF9zaWduJykge1xyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBsb2FkKCdzZXR0aW5ncycpO1xyXG4gICAgY29uc3QgYWxsb3dFdGhTaWduID0gc2V0dGluZ3M/LmFsbG93RXRoU2lnbiB8fCBmYWxzZTtcclxuXHJcbiAgICBpZiAoIWFsbG93RXRoU2lnbikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ/Cfq4AgZXRoX3NpZ24gcmVxdWVzdCBibG9ja2VkIChkaXNhYmxlZCBpbiBzZXR0aW5ncyk6Jywgb3JpZ2luKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBlcnJvcjoge1xyXG4gICAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdldGhfc2lnbiBpcyBkaXNhYmxlZCBmb3Igc2VjdXJpdHkuIFVzZSBwZXJzb25hbF9zaWduIGluc3RlYWQsIG9yIGVuYWJsZSBldGhfc2lnbiBpbiB3YWxsZXQgc2V0dGluZ3MuJ1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2cgd2FybmluZyB3aGVuIGV0aF9zaWduIGlzIHVzZWQgKGV2ZW4gd2hlbiBlbmFibGVkKVxyXG4gICAgY29uc29sZS53YXJuKCfimqDvuI8gZXRoX3NpZ24gcmVxdWVzdCBhcHByb3ZlZCBieSBzZXR0aW5ncyBmcm9tOicsIG9yaWdpbik7XHJcbiAgfVxyXG5cclxuICAvLyBWZXJpZnkgdGhlIGFkZHJlc3MgbWF0Y2hlcyB0aGUgY29ubmVjdGVkIGFjY291bnRcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAoIXdhbGxldCB8fCB3YWxsZXQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICBtZXNzYWdlOiAnUmVxdWVzdGVkIGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggY29ubmVjdGVkIGFjY291bnQnXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiBmb3IgcmVwbGF5IHByb3RlY3Rpb25cclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5zZXQoYXBwcm92YWxUb2tlbiwge1xyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgdXNlZDogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuc2V0KHJlcXVlc3RJZCwge1xyXG4gICAgICByZXNvbHZlLFxyXG4gICAgICByZWplY3QsXHJcbiAgICAgIG9yaWdpbixcclxuICAgICAgbWV0aG9kLFxyXG4gICAgICBzaWduUmVxdWVzdDogeyBtZXNzYWdlLCBhZGRyZXNzIH0sXHJcbiAgICAgIGFwcHJvdmFsVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249c2lnbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9Jm1ldGhvZD0ke21ldGhvZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NpZ24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NpZ25UeXBlZERhdGEgKEVJUC03MTIpIC0gU2lnbiB0eXBlZCBkYXRhXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNpZ25UeXBlZERhdGEocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCkge1xyXG4gIC8vIENoZWNrIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKCFhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ05vdCBhdXRob3JpemVkLiBQbGVhc2UgY29ubmVjdCB5b3VyIHdhbGxldCBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHNpZ24gcmVxdWVzdFxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKTtcclxuICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBJbnZhbGlkIHNpZ24gdHlwZWQgZGF0YSByZXF1ZXN0IGZyb20gb3JpZ2luOicsIG9yaWdpbiwgdmFsaWRhdGlvbi5lcnJvcik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IC0zMjYwMixcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBzaWduIHJlcXVlc3Q6ICcgKyBzYW5pdGl6ZUVycm9yTWVzc2FnZSh2YWxpZGF0aW9uLmVycm9yKVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBhZGRyZXNzLCB0eXBlZERhdGEgfSA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBWZXJpZnkgdGhlIGFkZHJlc3MgbWF0Y2hlcyB0aGUgY29ubmVjdGVkIGFjY291bnRcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAoIXdhbGxldCB8fCB3YWxsZXQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICBtZXNzYWdlOiAnUmVxdWVzdGVkIGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggY29ubmVjdGVkIGFjY291bnQnXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiBmb3IgcmVwbGF5IHByb3RlY3Rpb25cclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5zZXQoYXBwcm92YWxUb2tlbiwge1xyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgdXNlZDogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuc2V0KHJlcXVlc3RJZCwge1xyXG4gICAgICByZXNvbHZlLFxyXG4gICAgICByZWplY3QsXHJcbiAgICAgIG9yaWdpbixcclxuICAgICAgbWV0aG9kLFxyXG4gICAgICBzaWduUmVxdWVzdDogeyB0eXBlZERhdGEsIGFkZHJlc3MgfSxcclxuICAgICAgYXBwcm92YWxUb2tlblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1zaWduVHlwZWQmcmVxdWVzdElkPSR7cmVxdWVzdElkfSZtZXRob2Q9JHttZXRob2R9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjUwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nU2lnblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdTaWduIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIG1lc3NhZ2Ugc2lnbmluZyBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNpZ25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkLCBzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBtZXRob2QsIHNpZ25SZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nU2lnblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG5cclxuICAvLyBWYWxpZGF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiB0byBwcmV2ZW50IHJlcGxheSBhdHRhY2tzXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdJbnZhbGlkIG9yIGFscmVhZHkgdXNlZCBhcHByb3ZhbCB0b2tlbiAtIHBvc3NpYmxlIHJlcGxheSBhdHRhY2snKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFwcHJvdmFsIHRva2VuJyB9O1xyXG4gIH1cclxuXHJcbiAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCB0aGUgcmVxdWVzdCcpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICBsZXQgcGFzc3dvcmQgPSBudWxsO1xyXG4gIGxldCBzaWduZXIgPSBudWxsO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVmFsaWRhdGUgc2Vzc2lvbiBhbmQgZ2V0IHBhc3N3b3JkXHJcbiAgICBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG5cclxuICAgIC8vIFVubG9jayB3YWxsZXQgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB1bmxvY2tSZXN1bHQgPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzaWduZXIgPSB1bmxvY2tSZXN1bHQuc2lnbmVyO1xyXG5cclxuICAgIGxldCBzaWduYXR1cmU7XHJcblxyXG4gICAgLy8gU2lnbiBiYXNlZCBvbiBtZXRob2RcclxuICAgIGlmIChtZXRob2QgPT09ICdwZXJzb25hbF9zaWduJyB8fCBtZXRob2QgPT09ICdldGhfc2lnbicpIHtcclxuICAgICAgc2lnbmF0dXJlID0gYXdhaXQgcGVyc29uYWxTaWduKHNpZ25lciwgc2lnblJlcXVlc3QubWVzc2FnZSk7XHJcbiAgICB9IGVsc2UgaWYgKG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpKSB7XHJcbiAgICAgIHNpZ25hdHVyZSA9IGF3YWl0IHNpZ25UeXBlZERhdGEoc2lnbmVyLCBzaWduUmVxdWVzdC50eXBlZERhdGEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBzaWduaW5nIG1ldGhvZDogJHttZXRob2R9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTG9nIHN1Y2Nlc3NmdWwgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGNvbnN0IHNpZ25lckFkZHJlc3MgPSBhd2FpdCBzaWduZXIuZ2V0QWRkcmVzcygpO1xyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpID8gJ3R5cGVkX2RhdGEnIDogJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduZXJBZGRyZXNzLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdzb2Z0d2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNpZ25hdHVyZSBnZW5lcmF0ZWQgc3VjY2Vzc2Z1bGx5XHJcbiAgICBjb25zb2xlLmxvZygn8J+rgCBNZXNzYWdlIHNpZ25lZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcblxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogc2lnbmF0dXJlIH0pO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgc2lnbmF0dXJlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igc2lnbmluZyBtZXNzYWdlOicsIGVycm9yKTtcclxuXHJcbiAgICAvLyBMb2cgZmFpbGVkIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogbWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykgPyAndHlwZWRfZGF0YScgOiAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIGFkZHJlc3M6IHNpZ25SZXF1ZXN0LmFkZHJlc3MgfHwgJ3Vua25vd24nLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ3NvZnR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVqZWN0KGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICAvLyBTRUNVUklUWTogQ2xlYW4gdXAgc2Vuc2l0aXZlIGRhdGEgZnJvbSBtZW1vcnlcclxuICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICBjb25zdCB0ZW1wT2JqID0geyBwYXNzd29yZCB9O1xyXG4gICAgICBzZWN1cmVDbGVhbnVwKHRlbXBPYmosIFsncGFzc3dvcmQnXSk7XHJcbiAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChzaWduZXIpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcihzaWduZXIpO1xyXG4gICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEhhbmRsZSBMZWRnZXIgc2lnbmF0dXJlIGFwcHJvdmFsIChwcmUtc2lnbmVkIGluIHBvcHVwKVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTGVkZ2VyU2lnbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNpZ25hdHVyZSkge1xyXG4gIGlmICghcGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdJbnZhbGlkIG9yIGFscmVhZHkgdXNlZCBhcHByb3ZhbCB0b2tlbicpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRoZSByZXF1ZXN0JykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBMb2cgc3VjY2Vzc2Z1bCBMZWRnZXIgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiBtZXRob2QgJiYgbWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykgPyAndHlwZWRfZGF0YScgOiAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIGFkZHJlc3M6IHNpZ25SZXF1ZXN0Py5hZGRyZXNzIHx8ICdsZWRnZXInLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiBtZXRob2QgfHwgJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnaGFyZHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTaWduYXR1cmUgYWxyZWFkeSBjcmVhdGVkIGJ5IExlZGdlciBpbiBwb3B1cCAtIGp1c3QgcGFzcyBpdCB0aHJvdWdoXHJcbiAgICBjb25zb2xlLmxvZygn8J+rgCBMZWRnZXIgbWVzc2FnZSBzaWduZWQgZm9yIG9yaWdpbjonLCBvcmlnaW4pO1xyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogc2lnbmF0dXJlIH0pO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgc2lnbmF0dXJlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgcHJvY2Vzc2luZyBMZWRnZXIgc2lnbmF0dXJlOicsIGVycm9yKTtcclxuXHJcbiAgICAvLyBMb2cgZmFpbGVkIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogbWV0aG9kICYmIG1ldGhvZC5zdGFydHNXaXRoKCdldGhfc2lnblR5cGVkRGF0YScpID8gJ3R5cGVkX2RhdGEnIDogJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBhZGRyZXNzOiBzaWduUmVxdWVzdD8uYWRkcmVzcyB8fCAnbGVkZ2VyJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogbWV0aG9kIHx8ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnaGFyZHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgc2lnbiByZXF1ZXN0IGRldGFpbHMgKGZvciBwb3B1cClcclxuZnVuY3Rpb24gZ2V0U2lnblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgcmV0dXJuIHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbn1cclxuXHJcbi8vIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSBjb250ZW50IHNjcmlwdHMgYW5kIHBvcHVwXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAvLyBSZWNlaXZlZCBtZXNzYWdlXHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBEZWZpbmUgbWVzc2FnZSB0eXBlcyB0aGF0IGFyZSBwcml2aWxlZ2VkIChwb3B1cC1vbmx5KS5cclxuICAvLyBUaGVzZSBtdXN0IE5PVCBiZSBjYWxsYWJsZSBmcm9tIGNvbnRlbnQgc2NyaXB0cyAod2hpY2ggcnVuIG9uIGFyYml0cmFyeSB3ZWIgcGFnZXMpLlxyXG4gIC8vIEV4dGVuc2lvbiBwb3B1cC9wYWdlcyBoYXZlIG5vIHNlbmRlci50YWI7IGNvbnRlbnQgc2NyaXB0cyBhbHdheXMgaGF2ZSBzZW5kZXIudGFiLlxyXG4gIGNvbnN0IFBSSVZJTEVHRURfTUVTU0FHRVMgPSBuZXcgU2V0KFtcclxuICAgICdDT05ORUNUSU9OX0FQUFJPVkFMJywgJ1RSQU5TQUNUSU9OX0FQUFJPVkFMJywgJ1NJR05fQVBQUk9WQUwnLCAnU0lHTl9BUFBST1ZBTF9MRURHRVInLFxyXG4gICAgJ1RPS0VOX0FERF9BUFBST1ZBTCcsICdDUkVBVEVfU0VTU0lPTicsICdJTlZBTElEQVRFX1NFU1NJT04nLCAnSU5WQUxJREFURV9BTExfU0VTU0lPTlMnLFxyXG4gICAgJ0RJU0NPTk5FQ1RfU0lURScsICdTQVZFX1RYJywgJ1NBVkVfQU5EX01PTklUT1JfVFgnLCAnQ0xFQVJfVFhfSElTVE9SWScsXHJcbiAgICAnU1BFRURfVVBfVFgnLCAnQ0FOQ0VMX1RYJywgJ1NQRUVEX1VQX1RYX0NPTVBMRVRFJywgJ0NBTkNFTF9UWF9DT01QTEVURScsXHJcbiAgICAnR0VUX1NJR05JTkdfQVVESVRfTE9HJywgJ0dFVF9UWF9ISVNUT1JZJywgJ0dFVF9QRU5ESU5HX1RYX0NPVU5UJywgJ0dFVF9QRU5ESU5HX1RYUycsXHJcbiAgICAnR0VUX1RYX0JZX0hBU0gnLCAnUkVGUkVTSF9UWF9TVEFUVVMnLCAnUkVCUk9BRENBU1RfVFgnLCAnR0VUX0NVUlJFTlRfR0FTX1BSSUNFJyxcclxuICAgICdHRVRfQ09OTkVDVElPTl9SRVFVRVNUJywgJ0dFVF9DT05ORUNURURfU0lURVMnLCAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnLFxyXG4gICAgJ0dFVF9TSUdOX1JFUVVFU1QnLCAnR0VUX1RPS0VOX0FERF9SRVFVRVNUJ1xyXG4gIF0pO1xyXG5cclxuICBpZiAoUFJJVklMRUdFRF9NRVNTQUdFUy5oYXMobWVzc2FnZS50eXBlKSAmJiBzZW5kZXIudGFiKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgU0VDVVJJVFk6IEJsb2NrZWQgcHJpdmlsZWdlZCBtZXNzYWdlIGZyb20gY29udGVudCBzY3JpcHQ6JywgbWVzc2FnZS50eXBlLCBzZW5kZXIudXJsKTtcclxuICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VuYXV0aG9yaXplZDogcHJpdmlsZWdlZCBtZXNzYWdlcyBtdXN0IGNvbWUgZnJvbSBleHRlbnNpb24gcGFnZXMnIH0pO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcclxuICAgICAgICBjYXNlICdXQUxMRVRfUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVXYWxsZXRSZXF1ZXN0KG1lc3NhZ2UsIHNlbmRlcik7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDT05ORUNUSU9OX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IGFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgYXBwcm92YWwgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShhcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NPTk5FQ1RJT05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCByZXF1ZXN0SW5mbyA9IGdldENvbm5lY3Rpb25SZXF1ZXN0KG1lc3NhZ2UucmVxdWVzdElkKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgY29ubmVjdGlvbiByZXF1ZXN0IGluZm9cclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NPTk5FQ1RFRF9TSVRFUyc6XHJcbiAgICAgICAgICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIGNvbm5lY3RlZCBzaXRlcycpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgc2l0ZXMgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnRElTQ09OTkVDVF9TSVRFJzpcclxuICAgICAgICAgIGF3YWl0IHJlbW92ZUNvbm5lY3RlZFNpdGUobWVzc2FnZS5vcmlnaW4pO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyBkaXNjb25uZWN0IGNvbmZpcm1hdGlvblxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdUUkFOU0FDVElPTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCB0eEFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlVHJhbnNhY3Rpb25BcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCwgbWVzc2FnZS5zZXNzaW9uVG9rZW4sIG1lc3NhZ2UuZ2FzUHJpY2UsIG1lc3NhZ2UuY3VzdG9tTm9uY2UsIG1lc3NhZ2UudHhIYXNoLCBtZXNzYWdlLnR4RGV0YWlscyk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIHRyYW5zYWN0aW9uIGFwcHJvdmFsIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodHhBcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ1JFQVRFX1NFU1NJT04nOlxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvblRva2VuID0gYXdhaXQgY3JlYXRlU2Vzc2lvbihtZXNzYWdlLnBhc3N3b3JkLCBtZXNzYWdlLndhbGxldElkLCBtZXNzYWdlLmR1cmF0aW9uTXMpO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBzZXNzaW9uVG9rZW4gfSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnSU5WQUxJREFURV9TRVNTSU9OJzpcclxuICAgICAgICAgIGNvbnN0IGludmFsaWRhdGVkID0gaW52YWxpZGF0ZVNlc3Npb24obWVzc2FnZS5zZXNzaW9uVG9rZW4pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogaW52YWxpZGF0ZWQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnSU5WQUxJREFURV9BTExfU0VTU0lPTlMnOlxyXG4gICAgICAgICAgY29uc3QgY291bnQgPSBpbnZhbGlkYXRlQWxsU2Vzc2lvbnMoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGNvdW50IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9UUkFOU0FDVElPTl9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHR4UmVxdWVzdEluZm8gPSBnZXRUcmFuc2FjdGlvblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0cmFuc2FjdGlvbiByZXF1ZXN0IGluZm86JywgdHhSZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodHhSZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVE9LRU5fQUREX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHRva2VuQXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgdG9rZW4gYWRkIGFwcHJvdmFsIHJlc3BvbnNlOicsIHRva2VuQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHRva2VuQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NJR05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnbkFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlU2lnbkFwcHJvdmFsKFxyXG4gICAgICAgICAgICBtZXNzYWdlLnJlcXVlc3RJZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5hcHByb3ZlZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHNpZ24gYXBwcm92YWwgcmVzcG9uc2U6Jywgc2lnbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzaWduQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NJR05fQVBQUk9WQUxfTEVER0VSJzpcclxuICAgICAgICAgIGNvbnN0IGxlZGdlclNpZ25SZXN1bHQgPSBhd2FpdCBoYW5kbGVMZWRnZXJTaWduQXBwcm92YWwoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UucmVxdWVzdElkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFwcHJvdmVkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNpZ25hdHVyZVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgTGVkZ2VyIHNpZ24gYXBwcm92YWwgcmVzcG9uc2U6JywgbGVkZ2VyU2lnblJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UobGVkZ2VyU2lnblJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1NJR05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCBzaWduUmVxdWVzdEluZm8gPSBnZXRTaWduUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHNpZ24gcmVxdWVzdCBpbmZvOicsIHNpZ25SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoc2lnblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVE9LRU5fQUREX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgdG9rZW5SZXF1ZXN0SW5mbyA9IGdldFRva2VuQWRkUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRva2VuIGFkZCByZXF1ZXN0IGluZm86JywgdG9rZW5SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodG9rZW5SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy8gU2lnbmluZyBBdWRpdCBMb2dcclxuICAgICAgICBjYXNlICdHRVRfU0lHTklOR19BVURJVF9MT0cnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnbmluZ0xvZyA9IGF3YWl0IGdldFNpZ25pbmdBdWRpdExvZygpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgbG9nOiBzaWduaW5nTG9nIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zYWN0aW9uIEhpc3RvcnlcclxuICAgICAgICBjYXNlICdHRVRfVFhfSElTVE9SWSc6XHJcbiAgICAgICAgICBjb25zdCB0eEhpc3RvcnlMaXN0ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4SGlzdG9yeShtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHJhbnNhY3Rpb25zOiB0eEhpc3RvcnlMaXN0IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9QRU5ESU5HX1RYX0NPVU5UJzpcclxuICAgICAgICAgIGNvbnN0IHBlbmRpbmdDb3VudCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhDb3VudChtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQ6IHBlbmRpbmdDb3VudCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfUEVORElOR19UWFMnOlxyXG4gICAgICAgICAgY29uc3QgcGVuZGluZ1R4cyA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhzKG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbnM6IHBlbmRpbmdUeHMgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RYX0JZX0hBU0gnOlxyXG4gICAgICAgICAgY29uc3QgdHhEZXRhaWwgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2gobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnR4SGFzaCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbjogdHhEZXRhaWwgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0FWRV9UWCc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnRyYW5zYWN0aW9uKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0FWRV9BTkRfTU9OSVRPUl9UWCc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnRyYW5zYWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAvLyBTdGFydCBtb25pdG9yaW5nIGZvciBjb25maXJtYXRpb24gaW4gYmFja2dyb3VuZFxyXG4gICAgICAgICAgKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gbWVzc2FnZS50cmFuc2FjdGlvbi5uZXR3b3JrIHx8ICdwdWxzZWNoYWluVGVzdG5ldCc7XHJcbiAgICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgICAgICAgICAgY29uc3QgdHggPSB7IGhhc2g6IG1lc3NhZ2UudHJhbnNhY3Rpb24uaGFzaCB9O1xyXG4gICAgICAgICAgICAgIGF3YWl0IHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG1vbml0b3JpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0xFQVJfVFhfSElTVE9SWSc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuY2xlYXJUeEhpc3RvcnkobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NVUlJFTlRfR0FTX1BSSUNFJzpcclxuICAgICAgICAgIGNvbnN0IGdhc1ByaWNlUmVzdWx0ID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmtHYXNQcmljZShtZXNzYWdlLm5ldHdvcmspO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGdhc1ByaWNlUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdSRUZSRVNIX1RYX1NUQVRVUyc6XHJcbiAgICAgICAgICBjb25zdCByZWZyZXNoUmVzdWx0ID0gYXdhaXQgcmVmcmVzaFRyYW5zYWN0aW9uU3RhdHVzKFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLm5ldHdvcmtcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVmcmVzaFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnUkVCUk9BRENBU1RfVFgnOlxyXG4gICAgICAgICAgY29uc3QgcmVicm9hZGNhc3RSZXN1bHQgPSBhd2FpdCByZWJyb2FkY2FzdFRyYW5zYWN0aW9uKFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5uZXR3b3JrXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlYnJvYWRjYXN0UmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTUEVFRF9VUF9UWCc6XHJcbiAgICAgICAgICBjb25zdCBzcGVlZFVwUmVzdWx0ID0gYXdhaXQgaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNlc3Npb25Ub2tlbixcclxuICAgICAgICAgICAgbWVzc2FnZS5nYXNQcmljZU11bHRpcGxpZXIgfHwgMS4yLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmN1c3RvbUdhc1ByaWNlIHx8IG51bGxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoc3BlZWRVcFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0FOQ0VMX1RYJzpcclxuICAgICAgICAgIGNvbnN0IGNhbmNlbFJlc3VsdCA9IGF3YWl0IGhhbmRsZUNhbmNlbFRyYW5zYWN0aW9uKFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNlc3Npb25Ub2tlbixcclxuICAgICAgICAgICAgbWVzc2FnZS5jdXN0b21HYXNQcmljZSB8fCBudWxsXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGNhbmNlbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU1BFRURfVVBfVFhfQ09NUExFVEUnOlxyXG4gICAgICAgICAgLy8gVHJhbnNhY3Rpb24gd2FzIGFscmVhZHkgc2lnbmVkIGFuZCBicm9hZGNhc3QgaW4gcG9wdXAgLSBqdXN0IHNhdmUgdG8gaGlzdG9yeVxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTYXZlIG5ldyB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAgICAgICAgICAgIGNvbnN0IGhpc3RvcnlFbnRyeSA9IHtcclxuICAgICAgICAgICAgICBoYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCxcclxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgICAgICAgZnJvbTogbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICAgIHRvOiBtZXNzYWdlLnR4RGV0YWlscy50byxcclxuICAgICAgICAgICAgICB2YWx1ZTogbWVzc2FnZS50eERldGFpbHMudmFsdWUsXHJcbiAgICAgICAgICAgICAgZGF0YTogbWVzc2FnZS50eERldGFpbHMuZGF0YSB8fCAnMHgnLFxyXG4gICAgICAgICAgICAgIGdhc1ByaWNlOiBtZXNzYWdlLnR4RGV0YWlscy5nYXNQcmljZSxcclxuICAgICAgICAgICAgICBnYXNMaW1pdDogbWVzc2FnZS50eERldGFpbHMuZ2FzTGltaXQsXHJcbiAgICAgICAgICAgICAgbm9uY2U6IG1lc3NhZ2UudHhEZXRhaWxzLm5vbmNlLFxyXG4gICAgICAgICAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgICAgICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgICAgICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgICAgICAgICAgdHlwZTogdHhIaXN0b3J5LlRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eERldGFpbHMubWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICAgICAgaGlzdG9yeUVudHJ5Lm1heEZlZVBlckdhcyA9IG1lc3NhZ2UudHhEZXRhaWxzLm1heEZlZVBlckdhcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXMpIHtcclxuICAgICAgICAgICAgICBoaXN0b3J5RW50cnkubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBtZXNzYWdlLnR4RGV0YWlscy5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcywgaGlzdG9yeUVudHJ5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgcmVwbGFjZWRcclxuICAgICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKG1lc3NhZ2UuYWRkcmVzcywgbWVzc2FnZS5vcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3RhcnQgbW9uaXRvcmluZyBuZXcgdHJhbnNhY3Rpb25cclxuICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgICAgICAgIHdhaXRGb3JDb25maXJtYXRpb24oeyBoYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCB9LCBwcm92aWRlciwgbWVzc2FnZS5hZGRyZXNzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE5vdGlmaWNhdGlvblxyXG4gICAgICAgICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTcGVkIFVwJyxcclxuICAgICAgICAgICAgICBtZXNzYWdlOiBgTmV3IFRYOiAke21lc3NhZ2UubmV3VHhIYXNoLnNsaWNlKDAsIDIwKX0uLi5gLFxyXG4gICAgICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCB9KTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNhdmluZyBzcGVlZC11cCB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDQU5DRUxfVFhfQ09NUExFVEUnOlxyXG4gICAgICAgICAgLy8gQ2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHdhcyBhbHJlYWR5IHNpZ25lZCBhbmQgYnJvYWRjYXN0IGluIHBvcHVwIC0ganVzdCBzYXZlIHRvIGhpc3RvcnlcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2F2ZSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgICAgICAgICBjb25zdCBjYW5jZWxIaXN0b3J5RW50cnkgPSB7XHJcbiAgICAgICAgICAgICAgaGFzaDogbWVzc2FnZS5uZXdUeEhhc2gsXHJcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICAgIGZyb206IG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgICB0bzogbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiAnMCcsXHJcbiAgICAgICAgICAgICAgZGF0YTogJzB4JyxcclxuICAgICAgICAgICAgICBnYXNQcmljZTogbWVzc2FnZS50eERldGFpbHMuZ2FzUHJpY2UsXHJcbiAgICAgICAgICAgICAgZ2FzTGltaXQ6ICcyMTAwMCcsXHJcbiAgICAgICAgICAgICAgbm9uY2U6IG1lc3NhZ2UudHhEZXRhaWxzLm5vbmNlLFxyXG4gICAgICAgICAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgICAgICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgICAgICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgICAgICAgICAgdHlwZTogJ3NlbmQnXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eERldGFpbHMubWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsSGlzdG9yeUVudHJ5Lm1heEZlZVBlckdhcyA9IG1lc3NhZ2UudHhEZXRhaWxzLm1heEZlZVBlckdhcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eERldGFpbHMubWF4UHJpb3JpdHlGZWVQZXJHYXMpIHtcclxuICAgICAgICAgICAgICBjYW5jZWxIaXN0b3J5RW50cnkubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBtZXNzYWdlLnR4RGV0YWlscy5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcywgY2FuY2VsSGlzdG9yeUVudHJ5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgY2FuY2VsbGVkL2ZhaWxlZFxyXG4gICAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLm9yaWdpbmFsVHhIYXNoLCB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCwgbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFydCBtb25pdG9yaW5nIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvblxyXG4gICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgICAgICAgd2FpdEZvckNvbmZpcm1hdGlvbih7IGhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoIH0sIHByb3ZpZGVyLCBtZXNzYWdlLmFkZHJlc3MpO1xyXG5cclxuICAgICAgICAgICAgLy8gTm90aWZpY2F0aW9uXHJcbiAgICAgICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENhbmNlbGxlZCcsXHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ0NhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiBzZW50JyxcclxuICAgICAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogbWVzc2FnZS5uZXdUeEhhc2ggfSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzYXZpbmcgY2FuY2VsIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1VQREFURV9SUENfUFJJT1JJVElFUyc6XHJcbiAgICAgICAgICAvLyBVcGRhdGUgUlBDIHByaW9yaXRpZXMgaW4gdGhlIHJwYyBtb2R1bGVcclxuICAgICAgICAgIGlmIChtZXNzYWdlLm5ldHdvcmsgJiYgbWVzc2FnZS5wcmlvcml0aWVzKSB7XHJcbiAgICAgICAgICAgIHJwYy51cGRhdGVScGNQcmlvcml0aWVzKG1lc3NhZ2UubmV0d29yaywgbWVzc2FnZS5wcmlvcml0aWVzKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYPCfq4AgVXBkYXRlZCBSUEMgcHJpb3JpdGllcyBmb3IgJHttZXNzYWdlLm5ldHdvcmt9YCk7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdNaXNzaW5nIG5ldHdvcmsgb3IgcHJpb3JpdGllcycgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFVua25vd24gbWVzc2FnZSB0eXBlOicsIG1lc3NhZ2UudHlwZSk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmtub3duIG1lc3NhZ2UgdHlwZScgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgaGFuZGxpbmcgbWVzc2FnZTonLCBlcnJvcik7XHJcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgIH1cclxuICB9KSgpO1xyXG5cclxuICByZXR1cm4gdHJ1ZTsgLy8gS2VlcCBtZXNzYWdlIGNoYW5uZWwgb3BlbiBmb3IgYXN5bmMgcmVzcG9uc2VcclxufSk7XHJcblxyXG5jb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBzZXJ2aWNlIHdvcmtlciByZWFkeScpO1xyXG4iXSwibmFtZXMiOlsiZXRoZXJzLmdldEFkZHJlc3MiLCJldGhlcnMuZ2V0Qnl0ZXMiLCJldGhlcnMudG9VdGY4U3RyaW5nIiwiZXRoZXJzLmlzQWRkcmVzcyIsInJwYy5nZXRCbG9ja051bWJlciIsInJwYy5nZXRCbG9ja0J5TnVtYmVyIiwicnBjLmdldEJhbGFuY2UiLCJycGMuZ2V0VHJhbnNhY3Rpb25Db3VudCIsInJwYy5nZXRHYXNQcmljZSIsInJwYy5lc3RpbWF0ZUdhcyIsInJwYy5jYWxsIiwicnBjLnNlbmRSYXdUcmFuc2FjdGlvbiIsInJwYy5nZXRUcmFuc2FjdGlvblJlY2VpcHQiLCJycGMuZ2V0VHJhbnNhY3Rpb25CeUhhc2giLCJycGMuZ2V0UHJvdmlkZXIiLCJ0eEhpc3RvcnkuVFhfU1RBVFVTIiwidHhIaXN0b3J5LlRYX1RZUEVTIiwidHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5IiwicnBjLmdldFNhZmVHYXNQcmljZSIsInR4SGlzdG9yeS5nZXRUeEJ5SGFzaCIsInR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyIsInJwYy5nZXRHYXNQcmljZVJlY29tbWVuZGF0aW9ucyIsInJwYy5nZXRSYXdUcmFuc2FjdGlvbiIsInJwYy5icm9hZGNhc3RUb0FsbFJwY3MiLCJ0eEhpc3RvcnkuZ2V0VHhIaXN0b3J5IiwidHhIaXN0b3J5LmdldFBlbmRpbmdUeENvdW50IiwidHhIaXN0b3J5LmdldFBlbmRpbmdUeHMiLCJ0eEhpc3RvcnkuY2xlYXJUeEhpc3RvcnkiLCJycGMudXBkYXRlUnBjUHJpb3JpdGllcyJd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
