import { l as load, s as save, a as getAddress, L as getBytes, M as toUtf8String, i as isAddress, N as updateRpcPriorities, g as getProvider, u as unlockWallet, O as secureCleanup, P as secureCleanupSigner, Q as getRawTransaction, R as broadcastToAllRpcs, H as getGasPriceRecommendations, c as getActiveWallet, x as getEip1559Fees, U as getTransactionByHash, V as getTransactionReceipt, W as sendRawTransaction, y as getGasPrice, J as estimateGas, X as call, r as getTransactionCount, o as getBalance, Y as getBlockByNumber, Z as getBlockNumber } from "./rpc.js";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRBbGxIaXN0b3J5KCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBsb2FkKFRYX0hJU1RPUllfS0VZKTtcclxuICByZXR1cm4gaGlzdG9yeSB8fCB7fTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpIHtcclxuICBhd2FpdCBzYXZlKFRYX0hJU1RPUllfS0VZLCBoaXN0b3J5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgfHwgW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGQgYSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHhUb0hpc3RvcnkoYWRkcmVzcywgdHhEYXRhKSB7XHJcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRUeEhpc3RvcnlTZXR0aW5ncygpO1xyXG4gIGlmICghc2V0dGluZ3MuZW5hYmxlZCkge1xyXG4gICAgcmV0dXJuOyAvLyBIaXN0b3J5IGRpc2FibGVkXHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBhZGRyZXNzIGhpc3RvcnkgaWYgZG9lc24ndCBleGlzdFxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0gPSB7IHRyYW5zYWN0aW9uczogW10gfTtcclxuICB9XHJcblxyXG4gIC8vIEFkZCBuZXcgdHJhbnNhY3Rpb24gYXQgYmVnaW5uaW5nIChuZXdlc3QgZmlyc3QpXHJcbiAgY29uc3QgdHhFbnRyeSA9IHtcclxuICAgIGhhc2g6IHR4RGF0YS5oYXNoLFxyXG4gICAgdGltZXN0YW1wOiB0eERhdGEudGltZXN0YW1wIHx8IERhdGUubm93KCksXHJcbiAgICBmcm9tOiB0eERhdGEuZnJvbS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgdG86IHR4RGF0YS50byA/IHR4RGF0YS50by50b0xvd2VyQ2FzZSgpIDogbnVsbCxcclxuICAgIHZhbHVlOiB0eERhdGEudmFsdWUgfHwgJzAnLFxyXG4gICAgZGF0YTogdHhEYXRhLmRhdGEgfHwgJzB4JyxcclxuICAgIGdhc1ByaWNlOiB0eERhdGEuZ2FzUHJpY2UsXHJcbiAgICBnYXNMaW1pdDogdHhEYXRhLmdhc0xpbWl0LFxyXG4gICAgbm9uY2U6IHR4RGF0YS5ub25jZSxcclxuICAgIG5ldHdvcms6IHR4RGF0YS5uZXR3b3JrLFxyXG4gICAgc3RhdHVzOiB0eERhdGEuc3RhdHVzIHx8IFRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgYmxvY2tOdW1iZXI6IHR4RGF0YS5ibG9ja051bWJlciB8fCBudWxsLFxyXG4gICAgdHlwZTogdHhEYXRhLnR5cGUgfHwgVFhfVFlQRVMuQ09OVFJBQ1RcclxuICB9O1xyXG5cclxuICAvLyBTdG9yZSBFSVAtMTU1OSBmaWVsZHMgaWYgcHJlc2VudCAoZm9yIHByb3BlciBzcGVlZC11cC9jYW5jZWwpXHJcbiAgaWYgKHR4RGF0YS5tYXhGZWVQZXJHYXMpIHtcclxuICAgIHR4RW50cnkubWF4RmVlUGVyR2FzID0gdHhEYXRhLm1heEZlZVBlckdhcztcclxuICB9XHJcbiAgaWYgKHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgdHhFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IHR4RGF0YS5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICB9XHJcblxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMudW5zaGlmdCh0eEVudHJ5KTtcclxuXHJcbiAgLy8gRW5mb3JjZSBtYXggbGltaXQgKEZJRk8gLSByZW1vdmUgb2xkZXN0KVxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLmxlbmd0aCA+IE1BWF9UWFNfUEVSX0FERFJFU1MpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMgPSBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLnNsaWNlKDAsIE1BWF9UWFNfUEVSX0FERFJFU1MpO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZUFsbEhpc3RvcnkoaGlzdG9yeSk7XHJcbiAgLy8gVHJhbnNhY3Rpb24gYWRkZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIHN0YXR1cywgYmxvY2tOdW1iZXIgPSBudWxsKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmICghaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eEluZGV4ID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5maW5kSW5kZXgoXHJcbiAgICB0eCA9PiB0eC5oYXNoLnRvTG93ZXJDYXNlKCkgPT09IHR4SGFzaC50b0xvd2VyQ2FzZSgpXHJcbiAgKTtcclxuXHJcbiAgaWYgKHR4SW5kZXggPT09IC0xKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLnN0YXR1cyA9IHN0YXR1cztcclxuICBpZiAoYmxvY2tOdW1iZXIgIT09IG51bGwpIHtcclxuICAgIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnNbdHhJbmRleF0uYmxvY2tOdW1iZXIgPSBibG9ja051bWJlcjtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIHN0YXR1cyB1cGRhdGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbnMgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhzKGFkZHJlc3MpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maWx0ZXIodHggPT4gdHguc3RhdHVzID09PSBUWF9TVEFUVVMuUEVORElORyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgcGVuZGluZyB0cmFuc2FjdGlvbiBjb3VudCBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdUeENvdW50KGFkZHJlc3MpIHtcclxuICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKTtcclxuICByZXR1cm4gcGVuZGluZ1R4cy5sZW5ndGg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFR4QnlIYXNoKGFkZHJlc3MsIHR4SGFzaCkge1xyXG4gIGNvbnN0IHR4cyA9IGF3YWl0IGdldFR4SGlzdG9yeShhZGRyZXNzKTtcclxuICByZXR1cm4gdHhzLmZpbmQodHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyVHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKGhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgZGVsZXRlIGhpc3RvcnlbYWRkcmVzc0xvd2VyXTtcclxuICAgIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbiAgfVxyXG59XHJcblxyXG4iLCIvKipcclxuICogY29yZS90eFZhbGlkYXRpb24uanNcclxuICpcclxuICogVHJhbnNhY3Rpb24gdmFsaWRhdGlvbiB1dGlsaXRpZXMgZm9yIHNlY3VyaXR5XHJcbiAqIFZhbGlkYXRlcyBhbGwgdHJhbnNhY3Rpb24gcGFyYW1ldGVycyBiZWZvcmUgcHJvY2Vzc2luZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgdHJhbnNhY3Rpb24gcmVxdWVzdCBmcm9tIGEgZEFwcFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHhSZXF1ZXN0IC0gVHJhbnNhY3Rpb24gcmVxdWVzdCBvYmplY3RcclxuICogQHBhcmFtIHtudW1iZXJ9IG1heEdhc1ByaWNlR3dlaSAtIE1heGltdW0gYWxsb3dlZCBnYXMgcHJpY2UgaW4gR3dlaSAoZGVmYXVsdCAxMDAwKVxyXG4gKiBAcmV0dXJucyB7eyB2YWxpZDogYm9vbGVhbiwgZXJyb3JzOiBzdHJpbmdbXSwgc2FuaXRpemVkOiBPYmplY3QgfX1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSA9IDEwMDApIHtcclxuICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICBjb25zdCBzYW5pdGl6ZWQgPSB7fTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3RvJyBhZGRyZXNzIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0LnRvICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnRvICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC50byAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkSGV4QWRkcmVzcyh0eFJlcXVlc3QudG8pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInRvXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLnRvID0gZXRoZXJzLmdldEFkZHJlc3ModHhSZXF1ZXN0LnRvKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdmcm9tJyBhZGRyZXNzIGlmIHByZXNlbnQgKHNob3VsZCBtYXRjaCB3YWxsZXQgYWRkcmVzcylcclxuICBpZiAodHhSZXF1ZXN0LmZyb20gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZnJvbSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZnJvbSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLmZyb20gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QuZnJvbSk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICd2YWx1ZScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LnZhbHVlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnZhbHVlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QudmFsdWUpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInZhbHVlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWVCaWdJbnQgPSBCaWdJbnQodHhSZXF1ZXN0LnZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWVCaWdJbnQgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLnZhbHVlID0gdHhSZXF1ZXN0LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQudmFsdWUgPSAnMHgwJzsgLy8gRGVmYXVsdCB0byAwXHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZGF0YScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LmRhdGEgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZGF0YSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZGF0YSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZGF0YVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhEYXRhKHR4UmVxdWVzdC5kYXRhKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSB2YWxpZCBoZXggZGF0YScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2FuaXRpemVkLmRhdGEgPSB0eFJlcXVlc3QuZGF0YTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgc2FuaXRpemVkLmRhdGEgPSAnMHgnOyAvLyBEZWZhdWx0IHRvIGVtcHR5IGRhdGFcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdnYXMnIG9yICdnYXNMaW1pdCcgZmllbGRcclxuICAvLyBTRUNVUklUWTogUmVhc29uYWJsZSBtYXhpbXVtIGlzIDEwTSBnYXMgdG8gcHJldmVudCBmZWUgc2NhbXNcclxuICAvLyBNb3N0IHRyYW5zYWN0aW9uczogMjFrLTIwMGsgZ2FzLiBDb21wbGV4IERlRmk6IDIwMGstMU0gZ2FzLlxyXG4gIC8vIEV0aGVyZXVtL1B1bHNlQ2hhaW4gYmxvY2sgbGltaXQgaXMgfjMwTSwgYnV0IHNpbmdsZSBUWCByYXJlbHkgbmVlZHMgPjEwTVxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LmdhcyAhPT0gbnVsbCkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGV4VmFsdWUodHhSZXF1ZXN0LmdhcykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhcyk7XHJcbiAgICAgICAgaWYgKGdhc0xpbWl0IDwgMjEwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBsaW1pdCB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAxMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBoaWdoIChtYXhpbXVtIDEwMDAwMDAwKS4gTW9zdCB0cmFuc2FjdGlvbnMgbmVlZCA8MU0gZ2FzLicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzID0gdHhSZXF1ZXN0LmdhcztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzTGltaXQpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc0xpbWl0KTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGxvdyAobWluaW11bSAyMTAwMCknKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc0xpbWl0ID4gMTAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIHRvbyBoaWdoIChtYXhpbXVtIDEwMDAwMDAwKS4gTW9zdCB0cmFuc2FjdGlvbnMgbmVlZCA8MU0gZ2FzLicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzTGltaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZ2FzUHJpY2UnIGZpZWxkIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzUHJpY2UpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzUHJpY2UgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc1ByaWNlKTtcclxuICAgICAgICBjb25zdCBtYXhHYXNQcmljZVdlaSA9IEJpZ0ludChtYXhHYXNQcmljZUd3ZWkpICogQmlnSW50KCcxMDAwMDAwMDAwJyk7IC8vIENvbnZlcnQgR3dlaSB0byBXZWlcclxuICAgICAgICBpZiAoZ2FzUHJpY2UgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc1ByaWNlID4gbWF4R2FzUHJpY2VXZWkpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKGBJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZXhjZWVkcyBtYXhpbXVtIG9mICR7bWF4R2FzUHJpY2VHd2VpfSBHd2VpYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNQcmljZSA9IHR4UmVxdWVzdC5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdub25jZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5ub25jZSkgJiYgdHlwZW9mIHR4UmVxdWVzdC5ub25jZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIG9yIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJyBcclxuICAgICAgICAgID8gQmlnSW50KHR4UmVxdWVzdC5ub25jZSkgXHJcbiAgICAgICAgICA6IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpO1xyXG4gICAgICAgIGlmIChub25jZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9uY2UgPiBCaWdJbnQoJzkwMDcxOTkyNTQ3NDA5OTEnKSkgeyAvLyBKYXZhU2NyaXB0IHNhZmUgaW50ZWdlciBtYXhcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgdW5yZWFzb25hYmx5IGhpZ2gnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLm5vbmNlID0gdHhSZXF1ZXN0Lm5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gbXVzdCBoYXZlIGVpdGhlciAndG8nIG9yICdkYXRhJyAoY29udHJhY3QgY3JlYXRpb24pXHJcbiAgaWYgKCFzYW5pdGl6ZWQudG8gJiYgKCFzYW5pdGl6ZWQuZGF0YSB8fCBzYW5pdGl6ZWQuZGF0YSA9PT0gJzB4JykpIHtcclxuICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBtdXN0IGhhdmUgXCJ0b1wiIGFkZHJlc3Mgb3IgXCJkYXRhXCIgZm9yIGNvbnRyYWN0IGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnMsXHJcbiAgICBzYW5pdGl6ZWRcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIEV0aGVyZXVtIGFkZHJlc3MgKGhleCBmb3JtYXQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhZGRyZXNzIC0gQWRkcmVzcyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhBZGRyZXNzKGFkZHJlc3MpIHtcclxuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSA0MiBjaGFyYWN0ZXJzOiAweCArIDQwIGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdezQwfSQvLnRlc3QoYWRkcmVzcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBoZXggdmFsdWUgKGZvciBhbW91bnRzLCBnYXMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEhleCB2YWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBzdGFydCB3aXRoIDB4IGFuZCBjb250YWluIG9ubHkgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0rJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaGV4IGRhdGEgKGZvciB0cmFuc2FjdGlvbiBkYXRhIGZpZWxkKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIEhleCBkYXRhIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleERhdGEoZGF0YSkge1xyXG4gIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDB4IG9yIDB4IGZvbGxvd2VkIGJ5IGV2ZW4gbnVtYmVyIG9mIGhleCBkaWdpdHNcclxuICBpZiAoZGF0YSA9PT0gJzB4JykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSokLy50ZXN0KGRhdGEpICYmIGRhdGEubGVuZ3RoICUgMiA9PT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBhbiBlcnJvciBtZXNzYWdlIGZvciBzYWZlIGRpc3BsYXlcclxuICogUmVtb3ZlcyBhbnkgSFRNTCwgc2NyaXB0cywgYW5kIGNvbnRyb2wgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUVycm9yTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiA1MDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgNDk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGNvcmUvc2lnbmluZy5qc1xyXG4gKlxyXG4gKiBNZXNzYWdlIHNpZ25pbmcgZnVuY3Rpb25hbGl0eSBmb3IgRUlQLTE5MSBhbmQgRUlQLTcxMlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogU2lnbnMgYSBtZXNzYWdlIHVzaW5nIEVJUC0xOTEgKHBlcnNvbmFsX3NpZ24pXHJcbiAqIFRoaXMgcHJlcGVuZHMgXCJcXHgxOUV0aGVyZXVtIFNpZ25lZCBNZXNzYWdlOlxcblwiICsgbGVuKG1lc3NhZ2UpIHRvIHRoZSBtZXNzYWdlXHJcbiAqIGJlZm9yZSBzaWduaW5nLCB3aGljaCBwcmV2ZW50cyBzaWduaW5nIGFyYml0cmFyeSB0cmFuc2FjdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBzaWduIChoZXggc3RyaW5nIG9yIFVURi04IHN0cmluZylcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBlcnNvbmFsU2lnbihzaWduZXIsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25NZXNzYWdlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWQsIGRlY29kZSBpdCBmaXJzdFxyXG4gICAgLy8gZXRoZXJzLmpzIHNpZ25NZXNzYWdlIGV4cGVjdHMgYSBzdHJpbmcgb3IgVWludDhBcnJheVxyXG4gICAgbGV0IG1lc3NhZ2VUb1NpZ24gPSBtZXNzYWdlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIC8vIEl0J3MgYSBoZXggc3RyaW5nLCBjb252ZXJ0IHRvIFVURi04XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gVHJ5IHRvIGRlY29kZSBhcyBoZXhcclxuICAgICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIElmIGRlY29kaW5nIGZhaWxzLCB1c2UgdGhlIGhleCBzdHJpbmcgYXMtaXNcclxuICAgICAgICAvLyBldGhlcnMgd2lsbCBoYW5kbGUgaXRcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gbWVzc2FnZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdGhlIG1lc3NhZ2UgKGV0aGVycy5qcyBhdXRvbWF0aWNhbGx5IGFwcGxpZXMgRUlQLTE5MSBmb3JtYXQpXHJcbiAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBzaWduZXIuc2lnbk1lc3NhZ2UobWVzc2FnZVRvU2lnbik7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiBtZXNzYWdlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2lnbnMgdHlwZWQgZGF0YSB1c2luZyBFSVAtNzEyXHJcbiAqIFVzZWQgYnkgZEFwcHMgZm9yIHN0cnVjdHVyZWQgZGF0YSBzaWduaW5nIChwZXJtaXRzLCBtZXRhLXRyYW5zYWN0aW9ucywgZXRjLilcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZERhdGEgLSBFSVAtNzEyIHR5cGVkIGRhdGEgb2JqZWN0IHdpdGggZG9tYWluLCB0eXBlcywgYW5kIG1lc3NhZ2VcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25UeXBlZERhdGEoc2lnbmVyLCB0eXBlZERhdGEpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25UeXBlZERhdGEgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaWduZXIgcHJvdmlkZWQnKTtcclxuICB9XHJcblxyXG4gIGlmICghdHlwZWREYXRhKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1R5cGVkIGRhdGEgaXMgcmVxdWlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHR5cGVkIGRhdGEgc3RydWN0dXJlXHJcbiAgaWYgKCF0eXBlZERhdGEuZG9tYWluIHx8ICF0eXBlZERhdGEudHlwZXMgfHwgIXR5cGVkRGF0YS5tZXNzYWdlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgRUlQLTcxMiB0eXBlZCBkYXRhOiBtaXNzaW5nIGRvbWFpbiwgdHlwZXMsIG9yIG1lc3NhZ2UnKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBFeHRyYWN0IHByaW1hcnlUeXBlIChpZiBub3QgcHJvdmlkZWQsIHRyeSB0byBpbmZlciBpdClcclxuICAgIGxldCBwcmltYXJ5VHlwZSA9IHR5cGVkRGF0YS5wcmltYXJ5VHlwZTtcclxuXHJcbiAgICBpZiAoIXByaW1hcnlUeXBlKSB7XHJcbiAgICAgIC8vIFRyeSB0byBpbmZlciBwcmltYXJ5IHR5cGUgZnJvbSB0eXBlcyBvYmplY3RcclxuICAgICAgLy8gSXQncyB0aGUgdHlwZSB0aGF0J3Mgbm90IFwiRUlQNzEyRG9tYWluXCJcclxuICAgICAgY29uc3QgdHlwZU5hbWVzID0gT2JqZWN0LmtleXModHlwZWREYXRhLnR5cGVzKS5maWx0ZXIodCA9PiB0ICE9PSAnRUlQNzEyRG9tYWluJyk7XHJcbiAgICAgIGlmICh0eXBlTmFtZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgcHJpbWFyeVR5cGUgPSB0eXBlTmFtZXNbMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgaW5mZXIgcHJpbWFyeVR5cGUgLSBwbGVhc2Ugc3BlY2lmeSBpdCBleHBsaWNpdGx5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBWYWxpZGF0ZSB0aGF0IHByaW1hcnlUeXBlIGV4aXN0cyBpbiB0eXBlc1xyXG4gICAgaWYgKCF0eXBlZERhdGEudHlwZXNbcHJpbWFyeVR5cGVdKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJpbWFyeSB0eXBlIFwiJHtwcmltYXJ5VHlwZX1cIiBub3QgZm91bmQgaW4gdHlwZXMgZGVmaW5pdGlvbmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdXNpbmcgZXRoZXJzLmpzIHNpZ25UeXBlZERhdGFcclxuICAgIC8vIGV0aGVycyB2NiB1c2VzOiBzaWduVHlwZWREYXRhKGRvbWFpbiwgdHlwZXMsIHZhbHVlKVxyXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2lnbmVyLnNpZ25UeXBlZERhdGEoXHJcbiAgICAgIHR5cGVkRGF0YS5kb21haW4sXHJcbiAgICAgIHR5cGVkRGF0YS50eXBlcyxcclxuICAgICAgdHlwZWREYXRhLm1lc3NhZ2VcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiB0eXBlZCBkYXRhOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAtIFJQQyBtZXRob2QgKHBlcnNvbmFsX3NpZ24sIGV0aF9zaWduVHlwZWREYXRhX3Y0LCBldGMuKVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwYXJhbXMgLSBSUEMgcGFyYW1ldGVyc1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSB7IHZhbGlkOiBib29sZWFuLCBlcnJvcj86IHN0cmluZywgc2FuaXRpemVkPzogT2JqZWN0IH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKSB7XHJcbiAgaWYgKCFtZXRob2QgfHwgIXBhcmFtcyB8fCAhQXJyYXkuaXNBcnJheShwYXJhbXMpKSB7XHJcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCByZXF1ZXN0IGZvcm1hdCcgfTtcclxuICB9XHJcblxyXG4gIHN3aXRjaCAobWV0aG9kKSB7XHJcbiAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduJzogLy8gTm90ZTogZXRoX3NpZ24gaXMgZGFuZ2Vyb3VzIGFuZCBzaG91bGQgc2hvdyBzdHJvbmcgd2FybmluZ1xyXG4gICAgICBpZiAocGFyYW1zLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXJzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtZXNzYWdlID0gcGFyYW1zWzBdO1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzFdO1xyXG5cclxuICAgICAgaWYgKCFtZXNzYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01lc3NhZ2UgaXMgZW1wdHknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYWRkcmVzcyB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyZXNzKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhbml0aXplIG1lc3NhZ2UgKGNvbnZlcnQgdG8gc3RyaW5nIGlmIG5lZWRlZClcclxuICAgICAgY29uc3Qgc2FuaXRpemVkTWVzc2FnZSA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IG1lc3NhZ2UgOiBTdHJpbmcobWVzc2FnZSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHNhbml0aXplZDoge1xyXG4gICAgICAgICAgbWVzc2FnZTogc2FuaXRpemVkTWVzc2FnZSxcclxuICAgICAgICAgIGFkZHJlc3M6IGV0aGVycy5nZXRBZGRyZXNzKGFkZHJlc3MpIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVycycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYWRkciA9IHBhcmFtc1swXTtcclxuICAgICAgbGV0IHR5cGVkRGF0YSA9IHBhcmFtc1sxXTtcclxuXHJcbiAgICAgIGlmICghYWRkciB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBhcnNlIHR5cGVkIGRhdGEgaWYgaXQncyBhIHN0cmluZ1xyXG4gICAgICBpZiAodHlwZW9mIHR5cGVkRGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdHlwZWREYXRhID0gSlNPTi5wYXJzZSh0eXBlZERhdGEpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgdHlwZWQgZGF0YSBmb3JtYXQnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWYWxpZGF0ZSB0eXBlZCBkYXRhIHN0cnVjdHVyZVxyXG4gICAgICBpZiAoIXR5cGVkRGF0YSB8fCB0eXBlb2YgdHlwZWREYXRhICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdUeXBlZCBkYXRhIG11c3QgYmUgYW4gb2JqZWN0JyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXR5cGVkRGF0YS5kb21haW4gfHwgIXR5cGVkRGF0YS50eXBlcyB8fCAhdHlwZWREYXRhLm1lc3NhZ2UpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnVHlwZWQgZGF0YSBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyAoZG9tYWluLCB0eXBlcywgbWVzc2FnZSknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsaWQ6IHRydWUsXHJcbiAgICAgICAgc2FuaXRpemVkOiB7XHJcbiAgICAgICAgICBhZGRyZXNzOiBldGhlcnMuZ2V0QWRkcmVzcyhhZGRyKSxcclxuICAgICAgICAgIHR5cGVkRGF0YTogdHlwZWREYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBVbnN1cHBvcnRlZCBzaWduaW5nIG1ldGhvZDogJHttZXRob2R9YCB9O1xyXG4gIH1cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIGJhY2tncm91bmQvc2VydmljZS13b3JrZXIuanNcclxuICpcclxuICogQmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlciBmb3IgSGVhcnRXYWxsZXRcclxuICogSGFuZGxlcyBSUEMgcmVxdWVzdHMgZnJvbSBkQXBwcyBhbmQgbWFuYWdlcyB3YWxsZXQgc3RhdGVcclxuICovXHJcblxyXG5pbXBvcnQgeyBnZXRBY3RpdmVXYWxsZXQsIHVubG9ja1dhbGxldCwgc2VjdXJlQ2xlYW51cCwgc2VjdXJlQ2xlYW51cFNpZ25lciB9IGZyb20gJy4uL2NvcmUvd2FsbGV0LmpzJztcclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4uL2NvcmUvc3RvcmFnZS5qcyc7XHJcbmltcG9ydCAqIGFzIHJwYyBmcm9tICcuLi9jb3JlL3JwYy5qcyc7XHJcbmltcG9ydCAqIGFzIHR4SGlzdG9yeSBmcm9tICcuLi9jb3JlL3R4SGlzdG9yeS5qcyc7XHJcbmltcG9ydCB7IHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0LCBzYW5pdGl6ZUVycm9yTWVzc2FnZSB9IGZyb20gJy4uL2NvcmUvdHhWYWxpZGF0aW9uLmpzJztcclxuaW1wb3J0IHsgcGVyc29uYWxTaWduLCBzaWduVHlwZWREYXRhLCB2YWxpZGF0ZVNpZ25SZXF1ZXN0IH0gZnJvbSAnLi4vY29yZS9zaWduaW5nLmpzJztcclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8vIFNlcnZpY2Ugd29ya2VyIGxvYWRlZFxyXG5cclxuLy8gTmV0d29yayBjaGFpbiBJRHNcclxuY29uc3QgQ0hBSU5fSURTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6ICcweDNBRicsIC8vIDk0M1xyXG4gICdwdWxzZWNoYWluJzogJzB4MTcxJywgLy8gMzY5XHJcbiAgJ2V0aGVyZXVtJzogJzB4MScsIC8vIDFcclxuICAnc2Vwb2xpYSc6ICcweEFBMzZBNycgLy8gMTExNTUxMTFcclxufTtcclxuXHJcbmNvbnN0IE5FVFdPUktfTkFNRVMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJ1B1bHNlQ2hhaW4gVGVzdG5ldCBWNCcsXHJcbiAgJ3B1bHNlY2hhaW4nOiAnUHVsc2VDaGFpbiBNYWlubmV0JyxcclxuICAnZXRoZXJldW0nOiAnRXRoZXJldW0gTWFpbm5ldCcsXHJcbiAgJ3NlcG9saWEnOiAnU2Vwb2xpYSBUZXN0bmV0J1xyXG59O1xyXG5cclxuY29uc3QgQ0hBSU5fSURfVE9fTkVUV09SSyA9IHtcclxuICAnMHgzYWYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICcweDE3MSc6ICdwdWxzZWNoYWluJyxcclxuICAnMHgxJzogJ2V0aGVyZXVtJyxcclxuICAnMHhhYTM2YTcnOiAnc2Vwb2xpYSdcclxufTtcclxuXHJcbi8vIFN0b3JhZ2Uga2V5c1xyXG5jb25zdCBDT05ORUNURURfU0lURVNfS0VZID0gJ2Nvbm5lY3RlZF9zaXRlcyc7XHJcblxyXG4vLyBQZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdHMgKG9yaWdpbiAtPiB7IHJlc29sdmUsIHJlamVjdCwgdGFiSWQgfSlcclxuY29uc3QgcGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyBjaGFpbiBzd2l0Y2ggcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBuZXR3b3JrS2V5LCBjaGFpbklkLCBhcHByb3ZhbFRva2VuIH0pXHJcbmNvbnN0IHBlbmRpbmdDaGFpblN3aXRjaGVzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gU0lHTklORyBBVURJVCBMT0cgPT09PT1cclxuLy8gU3RvcmVzIHJlY2VudCBzaWduaW5nIG9wZXJhdGlvbnMgZm9yIHNlY3VyaXR5IGF1ZGl0aW5nIChpbi1tZW1vcnksIGNsZWFyZWQgb24gc2VydmljZSB3b3JrZXIgcmVzdGFydClcclxuY29uc3QgU0lHTklOR19MT0dfS0VZID0gJ3NpZ25pbmdfYXVkaXRfbG9nJztcclxuY29uc3QgTUFYX1NJR05JTkdfTE9HX0VOVFJJRVMgPSAxMDA7XHJcblxyXG4vKipcclxuICogTG9nIGEgc2lnbmluZyBvcGVyYXRpb24gZm9yIGF1ZGl0IHB1cnBvc2VzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIExvZyBlbnRyeSBkZXRhaWxzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRyeS50eXBlIC0gVHlwZSBvZiBzaWduaW5nICh0cmFuc2FjdGlvbiwgcGVyc29uYWxfc2lnbiwgdHlwZWRfZGF0YSlcclxuICogQHBhcmFtIHtzdHJpbmd9IGVudHJ5LmFkZHJlc3MgLSBXYWxsZXQgYWRkcmVzcyB0aGF0IHNpZ25lZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkub3JpZ2luIC0gZEFwcCBvcmlnaW4gdGhhdCByZXF1ZXN0ZWQgdGhlIHNpZ25hdHVyZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50cnkubWV0aG9kIC0gUlBDIG1ldGhvZCB1c2VkXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW50cnkuc3VjY2VzcyAtIFdoZXRoZXIgc2lnbmluZyBzdWNjZWVkZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS50eEhhc2hdIC0gVHJhbnNhY3Rpb24gaGFzaCAoZm9yIHRyYW5zYWN0aW9ucylcclxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeS5lcnJvcl0gLSBFcnJvciBtZXNzYWdlIChpZiBmYWlsZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBsb2dTaWduaW5nT3BlcmF0aW9uKGVudHJ5KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGxvZ0VudHJ5ID0ge1xyXG4gICAgICAuLi5lbnRyeSxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdldCBleGlzdGluZyBsb2dcclxuICAgIGNvbnN0IGV4aXN0aW5nTG9nID0gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEFkZCBuZXcgZW50cnkgYXQgdGhlIGJlZ2lubmluZ1xyXG4gICAgZXhpc3RpbmdMb2cudW5zaGlmdChsb2dFbnRyeSk7XHJcblxyXG4gICAgLy8gVHJpbSB0byBtYXggZW50cmllc1xyXG4gICAgaWYgKGV4aXN0aW5nTG9nLmxlbmd0aCA+IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTKSB7XHJcbiAgICAgIGV4aXN0aW5nTG9nLmxlbmd0aCA9IE1BWF9TSUdOSU5HX0xPR19FTlRSSUVTO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgbG9nXHJcbiAgICBhd2FpdCBzYXZlKFNJR05JTkdfTE9HX0tFWSwgZXhpc3RpbmdMb2cpO1xyXG5cclxuICAgIC8vIEFsc28gbG9nIHRvIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAgY29uc3QgaWNvbiA9IGVudHJ5LnN1Y2Nlc3MgPyAn4pyFJyA6ICfinYwnO1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgJHtpY29ufSBTaWduaW5nIGF1ZGl0OiAke2VudHJ5LnR5cGV9IGZyb20gJHtlbnRyeS5vcmlnaW59IC0gJHtlbnRyeS5zdWNjZXNzID8gJ1NVQ0NFU1MnIDogJ0ZBSUxFRCd9YCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIERvbid0IGxldCBsb2dnaW5nIGZhaWx1cmVzIGFmZmVjdCBzaWduaW5nIG9wZXJhdGlvbnNcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgbG9nZ2luZyBzaWduaW5nIG9wZXJhdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHNpZ25pbmcgYXVkaXQgbG9nXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gQXJyYXkgb2YgbG9nIGVudHJpZXNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNpZ25pbmdBdWRpdExvZygpIHtcclxuICByZXR1cm4gYXdhaXQgbG9hZChTSUdOSU5HX0xPR19LRVkpIHx8IFtdO1xyXG59XHJcblxyXG4vLyA9PT09PSBTRVNTSU9OIE1BTkFHRU1FTlQgPT09PT1cclxuLy8gU2Vzc2lvbiB0b2tlbnMgc3RvcmVkIGluIG1lbW9yeSAoY2xlYXJlZCB3aGVuIHNlcnZpY2Ugd29ya2VyIHRlcm1pbmF0ZXMpXHJcbi8vIFNFQ1VSSVRZIE5PVEU6IFNlcnZpY2Ugd29ya2VycyBjYW4gYmUgdGVybWluYXRlZCBieSBDaHJvbWUgYXQgYW55IHRpbWUsIHdoaWNoIGNsZWFycyBhbGxcclxuLy8gc2Vzc2lvbiBkYXRhLiBUaGlzIGlzIGludGVudGlvbmFsIC0gd2UgZG9uJ3Qgd2FudCBwYXNzd29yZHMgcGVyc2lzdGluZyBsb25nZXIgdGhhbiBuZWVkZWQuXHJcbi8vIFNlc3Npb25zIGFyZSBlbmNyeXB0ZWQgaW4gbWVtb3J5IGFzIGFuIGFkZGl0aW9uYWwgc2VjdXJpdHkgbGF5ZXIuXHJcbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpOyAvLyBzZXNzaW9uVG9rZW4gLT4geyBlbmNyeXB0ZWRQYXNzd29yZCwgd2FsbGV0SWQsIGV4cGlyZXNBdCwgc2FsdCB9XHJcblxyXG4vLyBTZXNzaW9uIGVuY3J5cHRpb24ga2V5IChyZWdlbmVyYXRlZCBvbiBzZXJ2aWNlIHdvcmtlciBzdGFydClcclxubGV0IHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHNlc3Npb24gZW5jcnlwdGlvbiBrZXkgdXNpbmcgV2ViIENyeXB0byBBUElcclxuICogS2V5IGlzIHJlZ2VuZXJhdGVkIGVhY2ggdGltZSBzZXJ2aWNlIHdvcmtlciBzdGFydHMgKG1lbW9yeSBvbmx5LCBuZXZlciBwZXJzaXN0ZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKSB7XHJcbiAgaWYgKCFzZXNzaW9uRW5jcnlwdGlvbktleSkge1xyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gMjU2LWJpdCBrZXkgZm9yIEFFUy1HQ00gZW5jcnlwdGlvblxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcclxuICAgICAgZmFsc2UsIC8vIE5vdCBleHRyYWN0YWJsZVxyXG4gICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY3J5cHRzIHBhc3N3b3JkIGZvciBzZXNzaW9uIHN0b3JhZ2UgdXNpbmcgQUVTLUdDTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBQYXNzd29yZCB0byBlbmNyeXB0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtlbmNyeXB0ZWQ6IEFycmF5QnVmZmVyLCBpdjogVWludDhBcnJheX0+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCkge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICBjb25zdCBwYXNzd29yZERhdGEgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcbiAgXHJcbiAgLy8gR2VuZXJhdGUgcmFuZG9tIElWIGZvciB0aGlzIGVuY3J5cHRpb25cclxuICAvLyBTRUNVUklUWTogSVYgdW5pcXVlbmVzcyBpcyBjcnlwdG9ncmFwaGljYWxseSBndWFyYW50ZWVkIGJ5IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKVxyXG4gIC8vIHdoaWNoIHVzZXMgdGhlIGJyb3dzZXIncyBDU1BSTkcgKENyeXB0b2dyYXBoaWNhbGx5IFNlY3VyZSBQc2V1ZG8tUmFuZG9tIE51bWJlciBHZW5lcmF0b3IpXHJcbiAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7XHJcbiAgXHJcbiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIHBhc3N3b3JkRGF0YVxyXG4gICk7XHJcbiAgXHJcbiAgcmV0dXJuIHsgZW5jcnlwdGVkLCBpdiB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVjcnlwdHMgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkIC0gRW5jcnlwdGVkIHBhc3N3b3JkIGRhdGFcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBpdiAtIEluaXRpYWxpemF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oZW5jcnlwdGVkLCBpdikge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIFxyXG4gIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBlbmNyeXB0ZWRcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuICByZXR1cm4gZGVjb2Rlci5kZWNvZGUoZGVjcnlwdGVkKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlc3Npb24gdG9rZW5cclxuZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBuZXcgc2Vzc2lvblxyXG4vLyBTRUNVUklUWTogRGVmYXVsdCBzZXNzaW9uIGR1cmF0aW9uIHJlZHVjZWQgdG8gMTUgbWludXRlcyB0byBtaW5pbWl6ZSBwYXNzd29yZCBleHBvc3VyZSBpbiBtZW1vcnlcclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihwYXNzd29yZCwgd2FsbGV0SWQsIGR1cmF0aW9uTXMgPSA5MDAwMDApIHsgLy8gRGVmYXVsdCAxNSBtaW51dGVzICh3YXMgMSBob3VyKVxyXG4gIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGdlbmVyYXRlU2Vzc2lvblRva2VuKCk7XHJcbiAgY29uc3QgZXhwaXJlc0F0ID0gRGF0ZS5ub3coKSArIGR1cmF0aW9uTXM7XHJcbiAgXHJcbiAgLy8gRW5jcnlwdCBwYXNzd29yZCBiZWZvcmUgc3RvcmluZyBpbiBtZW1vcnlcclxuICBjb25zdCB7IGVuY3J5cHRlZCwgaXYgfSA9IGF3YWl0IGVuY3J5cHRQYXNzd29yZEZvclNlc3Npb24ocGFzc3dvcmQpO1xyXG5cclxuICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvblRva2VuLCB7XHJcbiAgICBlbmNyeXB0ZWRQYXNzd29yZDogZW5jcnlwdGVkLFxyXG4gICAgaXY6IGl2LFxyXG4gICAgd2FsbGV0SWQsXHJcbiAgICBleHBpcmVzQXRcclxuICB9KTtcclxuXHJcbiAgLy8gQXV0by1jbGVhbnVwIGV4cGlyZWQgc2Vzc2lvblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvblRva2VuKTtcclxuICAgICAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgICAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZXNzaW9uIGV4cGlyZWQgYW5kIHJlbW92ZWQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIGR1cmF0aW9uTXMpO1xyXG5cclxuICAvLyBTZXNzaW9uIGNyZWF0ZWRcclxuICByZXR1cm4gc2Vzc2lvblRva2VuO1xyXG59XHJcblxyXG4vLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCByZXR1cm4gZGVjcnlwdGVkIHBhc3N3b3JkXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXNlc3Npb25Ub2tlbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBzZXNzaW9uIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcblxyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG9yIGV4cGlyZWQgc2Vzc2lvbicpO1xyXG4gIH1cclxuXHJcbiAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZXNzaW9uIGV4cGlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIERlY3J5cHQgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICByZXR1cm4gYXdhaXQgZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oc2Vzc2lvbi5lbmNyeXB0ZWRQYXNzd29yZCwgc2Vzc2lvbi5pdik7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgc2Vzc2lvblxyXG5mdW5jdGlvbiBpbnZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25Ub2tlbikpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgLy8gU2Vzc2lvbiBpbnZhbGlkYXRlZFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gSW52YWxpZGF0ZSBhbGwgc2Vzc2lvbnNcclxuZnVuY3Rpb24gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCkge1xyXG4gIGNvbnN0IGNvdW50ID0gYWN0aXZlU2Vzc2lvbnMuc2l6ZTtcclxuICBhY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xyXG4gIC8vIEFsbCBzZXNzaW9ucyBpbnZhbGlkYXRlZFxyXG4gIHJldHVybiBjb3VudDtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBleHRlbnNpb24gaW5zdGFsbGF0aW9uXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBpbnN0YWxsZWQnKTtcclxufSk7XHJcblxyXG4vLyBHZXQgY29ubmVjdGVkIHNpdGVzIGZyb20gc3RvcmFnZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlcygpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGxvYWQoQ09OTkVDVEVEX1NJVEVTX0tFWSk7XHJcbiAgcmV0dXJuIHNpdGVzIHx8IHt9O1xyXG59XHJcblxyXG4vLyBHZXQgYSBjb25uZWN0ZWQgc2l0ZSBlbnRyeVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlKG9yaWdpbikge1xyXG4gIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICByZXR1cm4gc2l0ZXNbb3JpZ2luXSB8fCBudWxsO1xyXG59XHJcblxyXG4vLyBHZXQgdGhlIGN1cnJlbnRseSBhdXRob3JpemVkIGFjY291bnQgZm9yIGEgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRBdXRob3JpemVkQWNjb3VudHMob3JpZ2luKSB7XHJcbiAgY29uc3Qgc2l0ZSA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGUob3JpZ2luKTtcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuXHJcbiAgaWYgKCFzaXRlIHx8ICF3YWxsZXQ/LmFkZHJlc3MpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGF1dGhvcml6ZWRBY2NvdW50cyA9IEFycmF5LmlzQXJyYXkoc2l0ZS5hY2NvdW50cykgPyBzaXRlLmFjY291bnRzIDogW107XHJcbiAgY29uc3QgYWN0aXZlQWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcbiAgY29uc3QgaXNBdXRob3JpemVkID0gYXV0aG9yaXplZEFjY291bnRzLnNvbWUoXHJcbiAgICBhY2NvdW50ID0+IHR5cGVvZiBhY2NvdW50ID09PSAnc3RyaW5nJyAmJiBhY2NvdW50LnRvTG93ZXJDYXNlKCkgPT09IGFjdGl2ZUFkZHJlc3NcclxuICApO1xyXG5cclxuICByZXR1cm4gaXNBdXRob3JpemVkID8gW3dhbGxldC5hZGRyZXNzXSA6IFtdO1xyXG59XHJcblxyXG4vLyBDaGVjayBpZiBhIHNpdGUgaXMgY29ubmVjdGVkXHJcbmFzeW5jIGZ1bmN0aW9uIGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pIHtcclxuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGdldEF1dGhvcml6ZWRBY2NvdW50cyhvcmlnaW4pO1xyXG4gIHJldHVybiBhY2NvdW50cy5sZW5ndGggPiAwO1xyXG59XHJcblxyXG4vLyBBZGQgYSBjb25uZWN0ZWQgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiBhZGRDb25uZWN0ZWRTaXRlKG9yaWdpbiwgYWNjb3VudHMpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgY29uc3QgZXhpc3RpbmdBY2NvdW50cyA9IEFycmF5LmlzQXJyYXkoc2l0ZXNbb3JpZ2luXT8uYWNjb3VudHMpID8gc2l0ZXNbb3JpZ2luXS5hY2NvdW50cyA6IFtdO1xyXG4gIGNvbnN0IG1lcmdlZEFjY291bnRzID0gWy4uLmV4aXN0aW5nQWNjb3VudHNdO1xyXG5cclxuICBmb3IgKGNvbnN0IGFjY291bnQgb2YgYWNjb3VudHMgfHwgW10pIHtcclxuICAgIGlmIChcclxuICAgICAgdHlwZW9mIGFjY291bnQgPT09ICdzdHJpbmcnICYmXHJcbiAgICAgICFtZXJnZWRBY2NvdW50cy5zb21lKGV4aXN0aW5nID0+IGV4aXN0aW5nLnRvTG93ZXJDYXNlKCkgPT09IGFjY291bnQudG9Mb3dlckNhc2UoKSlcclxuICAgICkge1xyXG4gICAgICBtZXJnZWRBY2NvdW50cy5wdXNoKGFjY291bnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2l0ZXNbb3JpZ2luXSA9IHtcclxuICAgIGFjY291bnRzOiBtZXJnZWRBY2NvdW50cyxcclxuICAgIGNvbm5lY3RlZEF0OiBzaXRlc1tvcmlnaW5dPy5jb25uZWN0ZWRBdCB8fCBEYXRlLm5vdygpLFxyXG4gICAgbGFzdENvbm5lY3RlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuICBhd2FpdCBzYXZlKENPTk5FQ1RFRF9TSVRFU19LRVksIHNpdGVzKTtcclxufVxyXG5cclxuLy8gUmVtb3ZlIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ29ubmVjdGVkU2l0ZShvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgZGVsZXRlIHNpdGVzW29yaWdpbl07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIE5vdGlmeSB0YWJzIHdoZW4gdGhlIGFjdGl2ZSBhdXRob3JpemVkIGFjY291bnQgY2hhbmdlc1xyXG5hc3luYyBmdW5jdGlvbiBub3RpZnlBY2NvdW50c0NoYW5nZWQoKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGNvbnN0IGFjdGl2ZUFkZHJlc3MgPSB3YWxsZXQ/LmFkZHJlc3MgfHwgbnVsbDtcclxuXHJcbiAgY2hyb21lLnRhYnMucXVlcnkoe30sICh0YWJzKSA9PiB7XHJcbiAgICB0YWJzLmZvckVhY2goKHRhYikgPT4ge1xyXG4gICAgICBpZiAoIXRhYi5pZCB8fCAhdGFiLnVybCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IG9yaWdpbjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBvcmlnaW4gPSBuZXcgVVJMKHRhYi51cmwpLm9yaWdpbjtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBzaXRlID0gc2l0ZXNbb3JpZ2luXTtcclxuICAgICAgY29uc3QgYWNjb3VudHMgPSAoXHJcbiAgICAgICAgc2l0ZSAmJlxyXG4gICAgICAgIGFjdGl2ZUFkZHJlc3MgJiZcclxuICAgICAgICBBcnJheS5pc0FycmF5KHNpdGUuYWNjb3VudHMpICYmXHJcbiAgICAgICAgc2l0ZS5hY2NvdW50cy5zb21lKGFjY291bnQgPT4gdHlwZW9mIGFjY291bnQgPT09ICdzdHJpbmcnICYmIGFjY291bnQudG9Mb3dlckNhc2UoKSA9PT0gYWN0aXZlQWRkcmVzcy50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICApID8gW2FjdGl2ZUFkZHJlc3NdIDogW107XHJcblxyXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHtcclxuICAgICAgICB0eXBlOiAnQUNDT1VOVFNfQ0hBTkdFRCcsXHJcbiAgICAgICAgYWNjb3VudHNcclxuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIC8vIFRhYiBtaWdodCBub3QgaGF2ZSBjb250ZW50IHNjcmlwdCwgaWdub3JlIGVycm9yXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIE5vdGlmeSB0YWJzIHdoZW4gdGhlIG5ldHdvcmsgY2hhbmdlc1xyXG5mdW5jdGlvbiBub3RpZnlDaGFpbkNoYW5nZWQoY2hhaW5JZCkge1xyXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCAodGFicykgPT4ge1xyXG4gICAgdGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xyXG4gICAgICAgIHR5cGU6ICdDSEFJTl9DSEFOR0VEJyxcclxuICAgICAgICBjaGFpbklkXHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQsIGlnbm9yZSBlcnJvclxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGNoYWluIElEXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFpbklkKCkge1xyXG4gIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpO1xyXG4gIHJldHVybiBDSEFJTl9JRFNbbmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnXTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldCByZXF1ZXN0cyBmcm9tIGNvbnRlbnQgc2NyaXB0c1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVXYWxsZXRSZXF1ZXN0KG1lc3NhZ2UsIHNlbmRlcikge1xyXG4gIGNvbnN0IHsgbWV0aG9kLCBwYXJhbXMgfSA9IG1lc3NhZ2U7XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBHZXQgb3JpZ2luIGZyb20gQ2hyb21lIEFQSSwgbm90IG1lc3NhZ2UgcGF5bG9hZCAocHJldmVudHMgc3Bvb2ZpbmcpXHJcbiAgY29uc3QgdXJsID0gbmV3IFVSTChzZW5kZXIudXJsKTtcclxuICBjb25zdCBvcmlnaW4gPSB1cmwub3JpZ2luO1xyXG5cclxuICAvLyBIYW5kbGluZyB3YWxsZXQgcmVxdWVzdFxyXG5cclxuICB0cnkge1xyXG4gICAgc3dpdGNoIChtZXRob2QpIHtcclxuICAgICAgY2FzZSAnZXRoX3JlcXVlc3RBY2NvdW50cyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHNlbmRlci50YWIpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2FjY291bnRzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQWNjb3VudHMob3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9jaGFpbklkJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQ2hhaW5JZCgpO1xyXG5cclxuICAgICAgY2FzZSAnbmV0X3ZlcnNpb24nOlxyXG4gICAgICAgIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBoYW5kbGVDaGFpbklkKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgcmVzdWx0OiBwYXJzZUludChjaGFpbklkLnJlc3VsdCwgMTYpLnRvU3RyaW5nKCkgfTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF9zd2l0Y2hFdGhlcmV1bUNoYWluJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU3dpdGNoQ2hhaW4ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBZGRDaGFpbihwYXJhbXMsIG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICd3YWxsZXRfd2F0Y2hBc3NldCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVdhdGNoQXNzZXQocGFyYW1zLCBvcmlnaW4sIHNlbmRlci50YWIpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2Jsb2NrTnVtYmVyJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQmxvY2tOdW1iZXIoKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCbG9ja0J5TnVtYmVyJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmxvY2tCeU51bWJlcihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldEJhbGFuY2UnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25Db3VudCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uQ291bnQocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9jYWxsJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQ2FsbChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2VzdGltYXRlR2FzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlRXN0aW1hdGVHYXMocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nYXNQcmljZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdhc1ByaWNlKCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2VuZFRyYW5zYWN0aW9uJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2VuZFRyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9zZW5kUmF3VHJhbnNhY3Rpb24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTZW5kUmF3VHJhbnNhY3Rpb24ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uQnlIYXNoJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25CeUhhc2gocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRMb2dzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0TG9ncyhwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldENvZGUnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRDb2RlKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmxvY2tCeUhhc2gnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCbG9ja0J5SGFzaChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAncGVyc29uYWxfc2lnbic6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlUGVyc29uYWxTaWduKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGEnOlxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92Myc6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2lnblR5cGVkRGF0YShwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKTtcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAxLCBtZXNzYWdlOiBgTWV0aG9kICR7bWV0aG9kfSBub3Qgc3VwcG9ydGVkYCB9IH07XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgaGFuZGxpbmcgcmVxdWVzdDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9yZXF1ZXN0QWNjb3VudHMgLSBSZXF1ZXN0IHBlcm1pc3Npb24gdG8gY29ubmVjdFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0QWNjb3VudHMob3JpZ2luLCB0YWIpIHtcclxuICAvLyBDaGVjayBpZiBhbHJlYWR5IGNvbm5lY3RlZFxyXG4gIGlmIChhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgY29uc3QgYWNjb3VudHMgPSBhd2FpdCBnZXRBdXRob3JpemVkQWNjb3VudHMob3JpZ2luKTtcclxuICAgIGlmIChhY2NvdW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHJldHVybiB7IHJlc3VsdDogYWNjb3VudHMgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xyXG4gICAgcGVuZGluZ0Nvbm5lY3Rpb25zLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRhYklkOiB0YWI/LmlkIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249Y29ubmVjdCZvcmlnaW49JHtlbmNvZGVVUklDb21wb25lbnQob3JpZ2luKX0mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ0Nvbm5lY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2FjY291bnRzIC0gR2V0IGNvbm5lY3RlZCBhY2NvdW50c1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBY2NvdW50cyhvcmlnaW4pIHtcclxuICAvLyBPbmx5IHJldHVybiBhY2NvdW50cyBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGNvbnN0IGFjY291bnRzID0gYXdhaXQgZ2V0QXV0aG9yaXplZEFjY291bnRzKG9yaWdpbik7XHJcbiAgaWYgKGFjY291bnRzLmxlbmd0aCA+IDApIHtcclxuICAgIHJldHVybiB7IHJlc3VsdDogYWNjb3VudHMgfTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IHJlc3VsdDogW10gfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jaGFpbklkIC0gR2V0IGN1cnJlbnQgY2hhaW4gSURcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhaW5JZCgpIHtcclxuICBjb25zdCBjaGFpbklkID0gYXdhaXQgZ2V0Q3VycmVudENoYWluSWQoKTtcclxuICByZXR1cm4geyByZXN1bHQ6IGNoYWluSWQgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF9zd2l0Y2hFdGhlcmV1bUNoYWluIC0gU3dpdGNoIHRvIGEgZGlmZmVyZW50IG5ldHdvcmtcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3dpdGNoQ2hhaW4ocGFyYW1zLCBvcmlnaW4pIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdIHx8ICFwYXJhbXNbMF0uY2hhaW5JZCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXMnIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBSZXF1aXJlIHNpdGUgY29ubmVjdGlvbiBiZWZvcmUgYWxsb3dpbmcgY2hhaW4gc3dpdGNoXHJcbiAgaWYgKG9yaWdpbiAmJiAhKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ1VuYXV0aG9yaXplZDogc2l0ZSBub3QgY29ubmVjdGVkLiBDYWxsIGV0aF9yZXF1ZXN0QWNjb3VudHMgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCByZXF1ZXN0ZWRDaGFpbklkID0gU3RyaW5nKHBhcmFtc1swXS5jaGFpbklkKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IG5ldHdvcmtLZXkgPSBDSEFJTl9JRF9UT19ORVRXT1JLW3JlcXVlc3RlZENoYWluSWRdO1xyXG5cclxuICBpZiAoIW5ldHdvcmtLZXkpIHtcclxuICAgIC8vIENoYWluIG5vdCBzdXBwb3J0ZWQgLSByZXR1cm4gZXJyb3IgY29kZSA0OTAyIHNvIGRBcHAgY2FuIGNhbGwgd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDkwMixcclxuICAgICAgICBtZXNzYWdlOiAnVW5yZWNvZ25pemVkIGNoYWluIElELiBUcnkgYWRkaW5nIHRoZSBjaGFpbiB1c2luZyB3YWxsZXRfYWRkRXRoZXJldW1DaGFpbi4nXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBjdXJyZW50TmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgaWYgKGN1cnJlbnROZXR3b3JrID09PSBuZXR3b3JrS2V5KSB7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IG51bGwgfTtcclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCBiZWZvcmUgc3dpdGNoaW5nIG5ldHdvcmtzXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcblxyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ0NoYWluU3dpdGNoZXMuc2V0KHJlcXVlc3RJZCwge1xyXG4gICAgICByZXNvbHZlLFxyXG4gICAgICByZWplY3QsXHJcbiAgICAgIG9yaWdpbixcclxuICAgICAgbmV0d29ya0tleSxcclxuICAgICAgY2hhaW5JZDogQ0hBSU5fSURTW25ldHdvcmtLZXldLFxyXG4gICAgICBhcHByb3ZhbFRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXN3aXRjaENoYWluJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA1MjBcclxuICAgIH0pO1xyXG5cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ0NoYWluU3dpdGNoZXMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdDaGFpbiBzd2l0Y2ggcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4gLSBBZGQgYSBuZXcgbmV0d29yayAoc2ltcGxpZmllZCB2ZXJzaW9uKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBZGRDaGFpbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0gfHwgIXBhcmFtc1swXS5jaGFpbklkKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHBhcmFtcycgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IFJlcXVpcmUgc2l0ZSBjb25uZWN0aW9uIGJlZm9yZSBhbGxvd2luZyBjaGFpbiBhZGQvc3dpdGNoXHJcbiAgaWYgKG9yaWdpbiAmJiAhKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ1VuYXV0aG9yaXplZDogc2l0ZSBub3QgY29ubmVjdGVkLiBDYWxsIGV0aF9yZXF1ZXN0QWNjb3VudHMgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBjaGFpbkluZm8gPSBwYXJhbXNbMF07XHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgUmVxdWVzdCB0byBhZGQgY2hhaW46JywgY2hhaW5JbmZvKTtcclxuXHJcbiAgLy8gRm9yIG5vdywgb25seSBzdXBwb3J0IG91ciBwcmVkZWZpbmVkIGNoYWluc1xyXG4gIC8vIENoZWNrIGlmIGl0J3Mgb25lIG9mIG91ciBzdXBwb3J0ZWQgY2hhaW5zXHJcbiAgY29uc3Qgc3VwcG9ydGVkQ2hhaW5zID0ge1xyXG4gICAgJzB4M2FmJzogdHJ1ZSxcclxuICAgICcweDNBRic6IHRydWUsXHJcbiAgICAnMHgxNzEnOiB0cnVlLFxyXG4gICAgJzB4MSc6IHRydWUsXHJcbiAgICAnMHhhYTM2YTcnOiB0cnVlLFxyXG4gICAgJzB4QUEzNkE3JzogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIGlmIChzdXBwb3J0ZWRDaGFpbnNbY2hhaW5JbmZvLmNoYWluSWRdKSB7XHJcbiAgICAvLyBDaGFpbiBpcyBhbHJlYWR5IHN1cHBvcnRlZCwganVzdCBzd2l0Y2ggdG8gaXRcclxuICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihbeyBjaGFpbklkOiBjaGFpbkluZm8uY2hhaW5JZCB9XSwgb3JpZ2luKTtcclxuICB9XHJcblxyXG4gIC8vIEN1c3RvbSBjaGFpbnMgbm90IHN1cHBvcnRlZCB5ZXRcclxuICByZXR1cm4ge1xyXG4gICAgZXJyb3I6IHtcclxuICAgICAgY29kZTogLTMyNjAzLFxyXG4gICAgICBtZXNzYWdlOiAnQWRkaW5nIGN1c3RvbSBjaGFpbnMgbm90IHN1cHBvcnRlZCB5ZXQuIE9ubHkgUHVsc2VDaGFpbiBhbmQgRXRoZXJldW0gbmV0d29ya3MgYXJlIHN1cHBvcnRlZC4nXHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGNvbm5lY3Rpb24gYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCkge1xyXG4gIGlmICghcGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiB9ID0gcGVuZGluZ0Nvbm5lY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gIHBlbmRpbmdDb25uZWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKGFwcHJvdmVkKSB7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgICAgLy8gU2F2ZSBjb25uZWN0ZWQgc2l0ZVxyXG4gICAgICBhd2FpdCBhZGRDb25uZWN0ZWRTaXRlKG9yaWdpbiwgW3dhbGxldC5hZGRyZXNzXSk7XHJcbiAgICAgIGF3YWl0IG5vdGlmeUFjY291bnRzQ2hhbmdlZCgpO1xyXG5cclxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcGVuZGluZyBwcm9taXNlXHJcbiAgICAgIHJlc29sdmUoeyByZXN1bHQ6IFt3YWxsZXQuYWRkcmVzc10gfSk7XHJcblxyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZWplY3QobmV3IEVycm9yKCdObyBhY3RpdmUgd2FsbGV0JykpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBhY3RpdmUgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIGNvbm5lY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGNvbm5lY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRDb25uZWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiB9ID0gcGVuZGluZ0Nvbm5lY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgY2hhaW4gc3dpdGNoIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhaW5Td2l0Y2hBcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBuZXR3b3JrS2V5LCBjaGFpbklkLCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdDaGFpblN3aXRjaGVzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdDaGFpblN3aXRjaGVzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIGNoYWluIHN3aXRjaCcpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICBhd2FpdCBzYXZlKCdjdXJyZW50TmV0d29yaycsIG5ldHdvcmtLZXkpO1xyXG4gIG5vdGlmeUNoYWluQ2hhbmdlZChjaGFpbklkKTtcclxuICByZXNvbHZlKHsgcmVzdWx0OiBudWxsIH0pO1xyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGNoYWluSWQsIG5ldHdvcmtOYW1lOiBORVRXT1JLX05BTUVTW25ldHdvcmtLZXldIH07XHJcbn1cclxuXHJcbi8vIEdldCBjaGFpbiBzd2l0Y2ggcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBnZXRDaGFpblN3aXRjaFJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKCFwZW5kaW5nQ2hhaW5Td2l0Y2hlcy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IG9yaWdpbiwgbmV0d29ya0tleSwgY2hhaW5JZCB9ID0gcGVuZGluZ0NoYWluU3dpdGNoZXMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgY29uc3QgY3VycmVudE5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc3VjY2VzczogdHJ1ZSxcclxuICAgIG9yaWdpbixcclxuICAgIGNoYWluSWQsXHJcbiAgICBuZXR3b3JrS2V5LFxyXG4gICAgbmV0d29ya05hbWU6IE5FVFdPUktfTkFNRVNbbmV0d29ya0tleV0gfHwgbmV0d29ya0tleSxcclxuICAgIGN1cnJlbnROZXR3b3JrTmFtZTogTkVUV09SS19OQU1FU1tjdXJyZW50TmV0d29ya10gfHwgY3VycmVudE5ldHdvcmtcclxuICB9O1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGtleVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50TmV0d29yaygpIHtcclxuICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKTtcclxuICByZXR1cm4gbmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2Jsb2NrTnVtYmVyIC0gR2V0IGN1cnJlbnQgYmxvY2sgbnVtYmVyXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJsb2NrTnVtYmVyKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gYXdhaXQgcnBjLmdldEJsb2NrTnVtYmVyKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9ja051bWJlciB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCbG9ja0J5TnVtYmVyIC0gR2V0IGJsb2NrIGJ5IG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgbnVtYmVyIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgaW5jbHVkZVRyYW5zYWN0aW9ucyA9IHBhcmFtc1sxXSB8fCBmYWxzZTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBycGMuZ2V0QmxvY2tCeU51bWJlcihuZXR3b3JrLCBibG9ja051bWJlciwgaW5jbHVkZVRyYW5zYWN0aW9ucyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgbnVtYmVyOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldEJhbGFuY2UgLSBHZXQgYmFsYW5jZSBmb3IgYW4gYWRkcmVzc1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBiYWxhbmNlID0gYXdhaXQgcnBjLmdldEJhbGFuY2UobmV0d29yaywgYWRkcmVzcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJhbGFuY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQ291bnQgLSBHZXQgdHJhbnNhY3Rpb24gY291bnQgKG5vbmNlKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBjb3VudCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb3VudCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGNvdW50OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dhc1ByaWNlIC0gR2V0IGN1cnJlbnQgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdhc1ByaWNlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXNQcmljZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9lc3RpbWF0ZUdhcyAtIEVzdGltYXRlIGdhcyBmb3IgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgZ2FzID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGdhcyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jYWxsIC0gRXhlY3V0ZSBhIHJlYWQtb25seSBjYWxsXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbGwocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJwYy5jYWxsKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXhlY3V0aW5nIGNhbGw6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFJhd1RyYW5zYWN0aW9uIC0gU2VuZCBhIHByZS1zaWduZWQgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBzaWduZWQgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogUmVxdWlyZSBzaXRlIGNvbm5lY3Rpb24gYmVmb3JlIGFsbG93aW5nIHJhdyB0cmFuc2FjdGlvbiBicm9hZGNhc3RcclxuICBpZiAob3JpZ2luICYmICEoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnVW5hdXRob3JpemVkOiBzaXRlIG5vdCBjb25uZWN0ZWQuIENhbGwgZXRoX3JlcXVlc3RBY2NvdW50cyBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzaWduZWRUeCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgdHhIYXNoID0gYXdhaXQgcnBjLnNlbmRSYXdUcmFuc2FjdGlvbihuZXR3b3JrLCBzaWduZWRUeCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHR4SGFzaCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzZW5kaW5nIHJhdyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvblJlY2VpcHQgLSBHZXQgdHJhbnNhY3Rpb24gcmVjZWlwdFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvblJlY2VpcHQocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBoYXNoIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHR4SGFzaCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvblJlY2VpcHQobmV0d29yaywgdHhIYXNoKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogcmVjZWlwdCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIHJlY2VpcHQ6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0VHJhbnNhY3Rpb25CeUhhc2ggLSBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkJ5SGFzaChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgdHhIYXNoID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkJ5SGFzaChuZXR3b3JrLCB0eEhhc2gpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiB0eCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGJ5IGhhc2g6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldExvZ3MocGFyYW1zKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCBsb2dzID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldExvZ3MnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBsb2dzIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgbG9nczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0Q29kZShwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGFkZHJlc3MgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGNvZGUgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0Q29kZScsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGNvZGUgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBjb2RlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5SGFzaChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGJsb2NrIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGJsb2NrID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldEJsb2NrQnlIYXNoJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogYmxvY2sgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBibG9jayBieSBoYXNoOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBQZW5kaW5nIHRyYW5zYWN0aW9uIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiB9KVxyXG5jb25zdCBwZW5kaW5nVHJhbnNhY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyB0b2tlbiBhZGQgcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0b2tlbkluZm8gfSlcclxuY29uc3QgcGVuZGluZ1Rva2VuUmVxdWVzdHMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyBQZW5kaW5nIG1lc3NhZ2Ugc2lnbmluZyByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHNpZ25SZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0pXHJcbmNvbnN0IHBlbmRpbmdTaWduUmVxdWVzdHMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyA9PT09PSBSQVRFIExJTUlUSU5HID09PT09XHJcbi8vIFByZXZlbnRzIG1hbGljaW91cyBkQXBwcyBmcm9tIHNwYW1taW5nIHRyYW5zYWN0aW9uIGFwcHJvdmFsIHJlcXVlc3RzXHJcbmNvbnN0IHJhdGVMaW1pdE1hcCA9IG5ldyBNYXAoKTsgLy8gb3JpZ2luIC0+IHsgY291bnQsIHdpbmRvd1N0YXJ0LCBwZW5kaW5nQ291bnQgfVxyXG5cclxuY29uc3QgUkFURV9MSU1JVF9DT05GSUcgPSB7XHJcbiAgTUFYX1BFTkRJTkdfUkVRVUVTVFM6IDUsIC8vIE1heCBwZW5kaW5nIHJlcXVlc3RzIHBlciBvcmlnaW5cclxuICBNQVhfUkVRVUVTVFNfUEVSX1dJTkRPVzogMjAsIC8vIE1heCB0b3RhbCByZXF1ZXN0cyBwZXIgdGltZSB3aW5kb3dcclxuICBUSU1FX1dJTkRPV19NUzogNjAwMDAgLy8gMSBtaW51dGUgd2luZG93XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIGFuIG9yaWdpbiBoYXMgZXhjZWVkZWQgcmF0ZSBsaW1pdHNcclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gY2hlY2tcclxuICogQHJldHVybnMge3sgYWxsb3dlZDogYm9vbGVhbiwgcmVhc29uPzogc3RyaW5nIH19XHJcbiAqL1xyXG5mdW5jdGlvbiBjaGVja1JhdGVMaW1pdChvcmlnaW4pIHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIFxyXG4gIC8vIEdldCBvciBjcmVhdGUgcmF0ZSBsaW1pdCBlbnRyeSBmb3IgdGhpcyBvcmlnaW5cclxuICBpZiAoIXJhdGVMaW1pdE1hcC5oYXMob3JpZ2luKSkge1xyXG4gICAgcmF0ZUxpbWl0TWFwLnNldChvcmlnaW4sIHtcclxuICAgICAgY291bnQ6IDAsXHJcbiAgICAgIHdpbmRvd1N0YXJ0OiBub3csXHJcbiAgICAgIHBlbmRpbmdDb3VudDogMFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBcclxuICAvLyBSZXNldCB3aW5kb3cgaWYgZXhwaXJlZFxyXG4gIGlmIChub3cgLSBsaW1pdERhdGEud2luZG93U3RhcnQgPiBSQVRFX0xJTUlUX0NPTkZJRy5USU1FX1dJTkRPV19NUykge1xyXG4gICAgbGltaXREYXRhLmNvdW50ID0gMDtcclxuICAgIGxpbWl0RGF0YS53aW5kb3dTdGFydCA9IG5vdztcclxuICB9XHJcbiAgXHJcbiAgLy8gQ2hlY2sgcGVuZGluZyByZXF1ZXN0cyBsaW1pdFxyXG4gIGlmIChsaW1pdERhdGEucGVuZGluZ0NvdW50ID49IFJBVEVfTElNSVRfQ09ORklHLk1BWF9QRU5ESU5HX1JFUVVFU1RTKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhbGxvd2VkOiBmYWxzZSxcclxuICAgICAgcmVhc29uOiBgVG9vIG1hbnkgcGVuZGluZyByZXF1ZXN0cy4gTWF4aW11bSAke1JBVEVfTElNSVRfQ09ORklHLk1BWF9QRU5ESU5HX1JFUVVFU1RTfSBwZW5kaW5nIHJlcXVlc3RzIGFsbG93ZWQuYFxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgLy8gQ2hlY2sgdG90YWwgcmVxdWVzdHMgaW4gd2luZG93XHJcbiAgaWYgKGxpbWl0RGF0YS5jb3VudCA+PSBSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUkVRVUVTVFNfUEVSX1dJTkRPVykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYWxsb3dlZDogZmFsc2UsXHJcbiAgICAgIHJlYXNvbjogYFJhdGUgbGltaXQgZXhjZWVkZWQuIE1heGltdW0gJHtSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUkVRVUVTVFNfUEVSX1dJTkRPV30gcmVxdWVzdHMgcGVyIG1pbnV0ZS5gXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICByZXR1cm4geyBhbGxvd2VkOiB0cnVlIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbmNyZW1lbnRzIHJhdGUgbGltaXQgY291bnRlcnMgZm9yIGFuIG9yaWdpblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBpbmNyZW1lbnRcclxuICovXHJcbmZ1bmN0aW9uIGluY3JlbWVudFJhdGVMaW1pdChvcmlnaW4pIHtcclxuICBjb25zdCBsaW1pdERhdGEgPSByYXRlTGltaXRNYXAuZ2V0KG9yaWdpbik7XHJcbiAgaWYgKGxpbWl0RGF0YSkge1xyXG4gICAgbGltaXREYXRhLmNvdW50Kys7XHJcbiAgICBsaW1pdERhdGEucGVuZGluZ0NvdW50Kys7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRGVjcmVtZW50cyBwZW5kaW5nIGNvdW50ZXIgd2hlbiByZXF1ZXN0IGlzIHJlc29sdmVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGRlY3JlbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gZGVjcmVtZW50UGVuZGluZ0NvdW50KG9yaWdpbikge1xyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBpZiAobGltaXREYXRhICYmIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQgPiAwKSB7XHJcbiAgICBsaW1pdERhdGEucGVuZGluZ0NvdW50LS07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBDbGVhbiB1cCBvbGQgcmF0ZSBsaW1pdCBlbnRyaWVzIGV2ZXJ5IDUgbWludXRlc1xyXG5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBmb3IgKGNvbnN0IFtvcmlnaW4sIGRhdGFdIG9mIHJhdGVMaW1pdE1hcC5lbnRyaWVzKCkpIHtcclxuICAgIGlmIChub3cgLSBkYXRhLndpbmRvd1N0YXJ0ID4gUkFURV9MSU1JVF9DT05GSUcuVElNRV9XSU5ET1dfTVMgKiA1ICYmIGRhdGEucGVuZGluZ0NvdW50ID09PSAwKSB7XHJcbiAgICAgIHJhdGVMaW1pdE1hcC5kZWxldGUob3JpZ2luKTtcclxuICAgIH1cclxuICB9XHJcbn0sIDMwMDAwMCk7XHJcblxyXG4vLyA9PT09PSBUUkFOU0FDVElPTiBSRVBMQVkgUFJPVEVDVElPTiA9PT09PVxyXG4vLyBQcmV2ZW50cyB0aGUgc2FtZSB0cmFuc2FjdGlvbiBhcHByb3ZhbCBmcm9tIGJlaW5nIHVzZWQgbXVsdGlwbGUgdGltZXNcclxuY29uc3QgcHJvY2Vzc2VkQXBwcm92YWxzID0gbmV3IE1hcCgpOyAvLyBhcHByb3ZhbFRva2VuIC0+IHsgdGltZXN0YW1wLCB0eEhhc2gsIHVzZWQ6IHRydWUgfVxyXG5cclxuY29uc3QgUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHID0ge1xyXG4gIEFQUFJPVkFMX1RJTUVPVVQ6IDMwMDAwMCwgLy8gNSBtaW51dGVzIC0gYXBwcm92YWwgZXhwaXJlcyBhZnRlciB0aGlzXHJcbiAgQ0xFQU5VUF9JTlRFUlZBTDogNjAwMDAgICAvLyAxIG1pbnV0ZSAtIGNsZWFuIHVwIG9sZCBhcHByb3ZhbHNcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW5cclxuICogQHJldHVybnMge3N0cmluZ30gVW5pcXVlIGFwcHJvdmFsIHRva2VuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYW5kIG1hcmtzIGFuIGFwcHJvdmFsIHRva2VuIGFzIHVzZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IGFwcHJvdmFsVG9rZW4gLSBUb2tlbiB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWxpZCBhbmQgbm90IHlldCB1c2VkXHJcbiAqL1xyXG5mdW5jdGlvbiB2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikge1xyXG4gIGlmICghYXBwcm92YWxUb2tlbikge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIE5vIGFwcHJvdmFsIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBjb25zdCBhcHByb3ZhbCA9IHByb2Nlc3NlZEFwcHJvdmFscy5nZXQoYXBwcm92YWxUb2tlbik7XHJcblxyXG4gIGlmICghYXBwcm92YWwpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBVbmtub3duIGFwcHJvdmFsIHRva2VuJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBNYXJrIGFzIHVzZWQgSU1NRURJQVRFTFkgdG8gcHJldmVudCByYWNlIGNvbmRpdGlvbnMuXHJcbiAgLy8gQW55IGNvbmN1cnJlbnQgY2FsbCB3aWxsIHNlZSB1c2VkPXRydWUgYW5kIGJhaWwgb3V0LlxyXG4gIGlmIChhcHByb3ZhbC51c2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQXBwcm92YWwgdG9rZW4gYWxyZWFkeSB1c2VkIC0gcHJldmVudGluZyByZXBsYXkgYXR0YWNrJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGFwcHJvdmFsLnVzZWQgPSB0cnVlO1xyXG4gIGFwcHJvdmFsLnVzZWRBdCA9IERhdGUubm93KCk7XHJcblxyXG4gIC8vIENoZWNrIGlmIGFwcHJvdmFsIGhhcyBleHBpcmVkXHJcbiAgY29uc3QgYWdlID0gRGF0ZS5ub3coKSAtIGFwcHJvdmFsLnRpbWVzdGFtcDtcclxuICBpZiAoYWdlID4gUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkFQUFJPVkFMX1RJTUVPVVQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBBcHByb3ZhbCB0b2tlbiBleHBpcmVkJyk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKGFwcHJvdmFsVG9rZW4pO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgQXBwcm92YWwgdG9rZW4gdmFsaWRhdGVkIGFuZCBtYXJrZWQgYXMgdXNlZCcpO1xyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLy8gQ2xlYW4gdXAgb2xkIHByb2Nlc3NlZCBhcHByb3ZhbHMgZXZlcnkgbWludXRlXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW3Rva2VuLCBhcHByb3ZhbF0gb2YgcHJvY2Vzc2VkQXBwcm92YWxzLmVudHJpZXMoKSkge1xyXG4gICAgY29uc3QgYWdlID0gbm93IC0gYXBwcm92YWwudGltZXN0YW1wO1xyXG4gICAgaWYgKGFnZSA+IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5BUFBST1ZBTF9USU1FT1VUICogMikge1xyXG4gICAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKHRva2VuKTtcclxuICAgIH1cclxuICB9XHJcbn0sIFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5DTEVBTlVQX0lOVEVSVkFMKTtcclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFRyYW5zYWN0aW9uIC0gU2lnbiBhbmQgc2VuZCBhIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogQ2hlY2sgcmF0ZSBsaW1pdCB0byBwcmV2ZW50IHNwYW1cclxuICBjb25zdCByYXRlTGltaXRDaGVjayA9IGNoZWNrUmF0ZUxpbWl0KG9yaWdpbik7XHJcbiAgaWYgKCFyYXRlTGltaXRDaGVjay5hbGxvd2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgUmF0ZSBsaW1pdCBleGNlZWRlZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MjAwLCBtZXNzYWdlOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShyYXRlTGltaXRDaGVjay5yZWFzb24pIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHR4UmVxdWVzdCA9IHBhcmFtc1swXTtcclxuXHJcbiAgLy8gR2V0IGN1cnJlbnQgbmV0d29yayBmcm9tIHN0b3JhZ2VcclxuICBjb25zdCBjdXJyZW50TmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJykgfHwgJ3B1bHNlY2hhaW4nO1xyXG5cclxuICAvLyBEeW5hbWljYWxseSBmZXRjaCBjdXJyZW50IGdhcyBwcmljZSBhbmQgdXNlIDN4IGFzIG1heCAodG8gYWxsb3cgZm9yIHZvbGF0aWxpdHkpXHJcbiAgbGV0IG1heEdhc1ByaWNlR3dlaTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgY3VycmVudEdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKGN1cnJlbnROZXR3b3JrKTtcclxuICAgIGNvbnN0IGN1cnJlbnRHYXNQcmljZUd3ZWkgPSBOdW1iZXIoQmlnSW50KGN1cnJlbnRHYXNQcmljZSkpIC8gMWU5O1xyXG4gICAgLy8gVXNlIDN4IGN1cnJlbnQgcHJpY2UgYXMgbWF4IHRvIGFsbG93IGZvciBuZXR3b3JrIHZvbGF0aWxpdHlcclxuICAgIG1heEdhc1ByaWNlR3dlaSA9IE1hdGguY2VpbChjdXJyZW50R2FzUHJpY2VHd2VpICogMyk7XHJcbiAgICAvLyBFbnN1cmUgbWluaW11bSBvZiAxMDAgR3dlaSBmb3IgdmVyeSBsb3cgZ2FzIG5ldHdvcmtzXHJcbiAgICBtYXhHYXNQcmljZUd3ZWkgPSBNYXRoLm1heChtYXhHYXNQcmljZUd3ZWksIDEwMCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUud2FybignRmFpbGVkIHRvIGZldGNoIGdhcyBwcmljZSwgdXNpbmcgaGlnaCBkZWZhdWx0OicsIGVycm9yKTtcclxuICAgIC8vIElmIHdlIGNhbid0IGZldGNoIGdhcyBwcmljZSwgdXNlIGEgdmVyeSBoaWdoIGRlZmF1bHQgdG8gYXZvaWQgYmxvY2tpbmcgdHJhbnNhY3Rpb25zXHJcbiAgICBtYXhHYXNQcmljZUd3ZWkgPSAxMDAwMDAwMDsgLy8gMTBNIEd3ZWkgLSBlc3NlbnRpYWxseSBubyBsaW1pdFxyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IENvbXByZWhlbnNpdmUgdHJhbnNhY3Rpb24gdmFsaWRhdGlvblxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCB0cmFuc2FjdGlvbiBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3JzKTtcclxuICAgIHJldHVybiB7IFxyXG4gICAgICBlcnJvcjogeyBcclxuICAgICAgICBjb2RlOiAtMzI2MDIsIFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHRyYW5zYWN0aW9uOiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcnMuam9pbignOyAnKSkgXHJcbiAgICAgIH0gXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVXNlIHNhbml0aXplZCB0cmFuc2FjdGlvbiBwYXJhbWV0ZXJzXHJcbiAgY29uc3Qgc2FuaXRpemVkVHggPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gSW5jcmVtZW50IHJhdGUgbGltaXQgY291bnRlclxyXG4gIGluY3JlbWVudFJhdGVMaW1pdChvcmlnaW4pO1xyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuXHJcbiAgICAvLyBTRUNVUklUWTogR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gU3RvcmUgc2FuaXRpemVkIHRyYW5zYWN0aW9uIGluc3RlYWQgb2Ygb3JpZ2luYWwgcmVxdWVzdFxyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5zZXQocmVxdWVzdElkLCB7IFxyXG4gICAgICByZXNvbHZlLCBcclxuICAgICAgcmVqZWN0LCBcclxuICAgICAgb3JpZ2luLCBcclxuICAgICAgdHhSZXF1ZXN0OiBzYW5pdGl6ZWRUeCxcclxuICAgICAgYXBwcm92YWxUb2tlbiAgLy8gSW5jbHVkZSB0b2tlbiBmb3IgdmFsaWRhdGlvblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj10cmFuc2FjdGlvbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdUcmFuc2FjdGlvbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB0cmFuc2FjdGlvbiBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2Vzc2lvblRva2VuLCBnYXNQcmljZSwgY3VzdG9tTm9uY2UsIHR4SGFzaCwgdHhEZXRhaWxzID0gbnVsbCkge1xyXG4gIGlmICghcGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHR4UmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1RyYW5zYWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIERlY3JlbWVudCBwZW5kaW5nIGNvdW50ZXIgKHJlcXVlc3QgY29tcGxldGVkKVxyXG4gIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRyYW5zYWN0aW9uJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBJZiB0eEhhc2ggaXMgcHJvdmlkZWQsIHRyYW5zYWN0aW9uIHdhcyBhbHJlYWR5IHNpZ25lZCBhbmQgYnJvYWRjYXN0IGluIHRoZSBwb3B1cFxyXG4gICAgLy8gKGJ5IGhhcmR3YXJlIHdhbGxldCBPUiBzb2Z0d2FyZSB3YWxsZXQpLiBKdXN0IHNhdmUgdG8gaGlzdG9yeSBhbmQgcmVzb2x2ZS5cclxuICAgIGlmICh0eEhhc2gpIHtcclxuICAgICAgY29uc3Qgd2FsbGV0VHlwZSA9IHR4RGV0YWlscyA/ICdzb2Z0d2FyZScgOiAnaGFyZHdhcmUnO1xyXG4gICAgICBjb25zb2xlLmxvZyhg8J+rgCAke3dhbGxldFR5cGV9IHdhbGxldCB0cmFuc2FjdGlvbiBhbHJlYWR5IGJyb2FkY2FzdDpgLCB0eEhhc2gpO1xyXG5cclxuICAgICAgLy8gR2V0IGFjdGl2ZSB3YWxsZXQgZm9yIHNhdmluZyB0byBoaXN0b3J5XHJcbiAgICAgIGNvbnN0IGFjdGl2ZVdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSAodXNlIHR4RGV0YWlscyBpZiBwcm92aWRlZCBmb3IgYWNjdXJhdGUgZGF0YSlcclxuICAgICAgY29uc3QgaGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICAgIGhhc2g6IHR4SGFzaCxcclxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgZnJvbTogYWN0aXZlV2FsbGV0LmFkZHJlc3MsXHJcbiAgICAgICAgdG86IHR4RGV0YWlscz8udG8gfHwgdHhSZXF1ZXN0LnRvIHx8IG51bGwsXHJcbiAgICAgICAgdmFsdWU6IHR4RGV0YWlscz8udmFsdWUgfHwgdHhSZXF1ZXN0LnZhbHVlIHx8ICcwJyxcclxuICAgICAgICBkYXRhOiB0eERldGFpbHM/LmRhdGEgfHwgdHhSZXF1ZXN0LmRhdGEgfHwgJzB4JyxcclxuICAgICAgICBnYXNQcmljZTogdHhEZXRhaWxzPy5nYXNQcmljZSB8fCAnMCcsXHJcbiAgICAgICAgZ2FzTGltaXQ6IHR4RGV0YWlscz8uZ2FzTGltaXQgfHwgdHhSZXF1ZXN0Lmdhc0xpbWl0IHx8IHR4UmVxdWVzdC5nYXMgfHwgbnVsbCxcclxuICAgICAgICBub25jZTogdHhEZXRhaWxzPy5ub25jZSA/PyBudWxsLFxyXG4gICAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgICAgdHlwZTogdHhIaXN0b3J5LlRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBJbmNsdWRlIEVJUC0xNTU5IGZpZWxkcyBpZiBwcm92aWRlZCAobmVlZGVkIGZvciBzcGVlZC11cC9jYW5jZWwpXHJcbiAgICAgIGlmICh0eERldGFpbHM/Lm1heEZlZVBlckdhcykge1xyXG4gICAgICAgIGhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSB0eERldGFpbHMubWF4RmVlUGVyR2FzO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eERldGFpbHM/Lm1heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgICAgaGlzdG9yeUVudHJ5Lm1heFByaW9yaXR5RmVlUGVyR2FzID0gdHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkoYWN0aXZlV2FsbGV0LmFkZHJlc3MsIGhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgICAvLyBTZW5kIGRlc2t0b3Agbm90aWZpY2F0aW9uXHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNlbnQnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBzZW50OiAke3R4SGFzaC5zbGljZSgwLCAyMCl9Li4uYCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgdHJhbnNhY3Rpb24gZm9yIGNvbmZpcm1hdGlvblxyXG4gICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgd2FpdEZvckNvbmZpcm1hdGlvbih7IGhhc2g6IHR4SGFzaCB9LCBwcm92aWRlciwgYWN0aXZlV2FsbGV0LmFkZHJlc3MpO1xyXG5cclxuICAgICAgLy8gTG9nIHN1Y2Nlc3NmdWwgc2lnbmluZyBvcGVyYXRpb25cclxuICAgICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgICAgdHlwZTogJ3RyYW5zYWN0aW9uJyxcclxuICAgICAgICBhZGRyZXNzOiBhY3RpdmVXYWxsZXQuYWRkcmVzcyxcclxuICAgICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgICBtZXRob2Q6ICdldGhfc2VuZFRyYW5zYWN0aW9uJyxcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIHR4SGFzaDogdHhIYXNoLFxyXG4gICAgICAgIHdhbGxldFR5cGU6IHdhbGxldFR5cGVcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBSZXNvbHZlIHdpdGggdHJhbnNhY3Rpb24gaGFzaFxyXG4gICAgICByZXNvbHZlKHsgcmVzdWx0OiB0eEhhc2ggfSk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaCB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNvZnR3YXJlIHdhbGxldCBmbG93IC0gdmFsaWRhdGUgc2Vzc2lvbiBhbmQgZ2V0IHBhc3N3b3JkIChub3cgYXN5bmMpXHJcbiAgICBsZXQgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuICAgIGxldCBzaWduZXIgPSBudWxsO1xyXG4gICAgbGV0IGNvbm5lY3RlZFNpZ25lciA9IG51bGw7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgIC8vIFVubG9jayB3YWxsZXQgd2l0aCBhdXRvLXVwZ3JhZGUgbm90aWZpY2F0aW9uXHJcbiAgICBjb25zdCB1bmxvY2tSZXN1bHQgPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgLy8gTm90aWZ5IHVzZXIgdGhhdCB3YWxsZXQgZW5jcnlwdGlvbiBpcyBiZWluZyB1cGdyYWRlZFxyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldCBlbmNyeXB0aW9uOiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9uc2ApO1xyXG4gICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICB0aXRsZTogJ/CflJAgU2VjdXJpdHkgVXBncmFkZSBpbiBQcm9ncmVzcycsXHJcbiAgICAgICAgICBtZXNzYWdlOiBgVXBncmFkaW5nIHdhbGxldCBlbmNyeXB0aW9uIHRvICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9ucyBmb3IgZW5oYW5jZWQgc2VjdXJpdHkuLi5gLFxyXG4gICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgc2lnbmVyID0gdW5sb2NrUmVzdWx0LnNpZ25lcjtcclxuICAgIGNvbnN0IHsgdXBncmFkZWQsIGl0ZXJhdGlvbnNCZWZvcmUsIGl0ZXJhdGlvbnNBZnRlciB9ID0gdW5sb2NrUmVzdWx0O1xyXG5cclxuICAgIC8vIFNob3cgY29tcGxldGlvbiBub3RpZmljYXRpb24gaWYgdXBncmFkZSBvY2N1cnJlZFxyXG4gICAgaWYgKHVwZ3JhZGVkKSB7XHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ+KchSBTZWN1cml0eSBVcGdyYWRlIENvbXBsZXRlJyxcclxuICAgICAgICBtZXNzYWdlOiBgV2FsbGV0IGVuY3J5cHRpb24gdXBncmFkZWQ6ICR7aXRlcmF0aW9uc0JlZm9yZS50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpdGVyYXRpb25zQWZ0ZXIudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9uc2AsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IGN1cnJlbnQgbmV0d29ya1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuXHJcbiAgICAvLyBDb25uZWN0IHNpZ25lciB0byBwcm92aWRlclxyXG4gICAgY29ubmVjdGVkU2lnbmVyID0gc2lnbmVyLmNvbm5lY3QocHJvdmlkZXIpO1xyXG5cclxuICAgIC8vIFByZXBhcmUgdHJhbnNhY3Rpb24gLSBjcmVhdGUgYSBjbGVhbiBjb3B5IHdpdGggb25seSBuZWNlc3NhcnkgZmllbGRzXHJcbiAgICBjb25zdCB0eFRvU2VuZCA9IHtcclxuICAgICAgdG86IHR4UmVxdWVzdC50byxcclxuICAgICAgdmFsdWU6IHR4UmVxdWVzdC52YWx1ZSB8fCAnMHgwJyxcclxuICAgICAgZGF0YTogdHhSZXF1ZXN0LmRhdGEgfHwgJzB4J1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBOb25jZSBoYW5kbGluZyBwcmlvcml0eTpcclxuICAgIC8vIDEuIFVzZXItcHJvdmlkZWQgY3VzdG9tIG5vbmNlIChmb3IgcmVwbGFjaW5nIHN0dWNrIHRyYW5zYWN0aW9ucylcclxuICAgIC8vIDIuIERBcHAtcHJvdmlkZWQgbm9uY2UgKHZhbGlkYXRlZClcclxuICAgIC8vIDMuIEF1dG8tZmV0Y2ggYnkgZXRoZXJzLmpzXHJcbiAgICBpZiAoY3VzdG9tTm9uY2UgIT09IHVuZGVmaW5lZCAmJiBjdXN0b21Ob25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBVc2VyIG1hbnVhbGx5IHNldCBub25jZSAoZS5nLiwgdG8gcmVwbGFjZSBzdHVjayB0cmFuc2FjdGlvbilcclxuICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25Db3VudChzaWduZXIuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuXHJcbiAgICAgIGlmIChjdXN0b21Ob25jZSA8IGN1cnJlbnROb25jZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ3VzdG9tIG5vbmNlICR7Y3VzdG9tTm9uY2V9IGlzIGxlc3MgdGhhbiBjdXJyZW50IG5vbmNlICR7Y3VycmVudE5vbmNlfS4gVGhpcyBtYXkgZmFpbCB1bmxlc3MgeW91J3JlIHJlcGxhY2luZyBhIHBlbmRpbmcgdHJhbnNhY3Rpb24uYCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR4VG9TZW5kLm5vbmNlID0gY3VzdG9tTm9uY2U7XHJcbiAgICAgIC8vIFVzaW5nIGN1c3RvbSBub25jZVxyXG4gICAgfSBlbHNlIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgLy8gU0VDVVJJVFk6IFZhbGlkYXRlIG5vbmNlIGlmIHByb3ZpZGVkIGJ5IERBcHBcclxuICAgICAgY29uc3QgY3VycmVudE5vbmNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25Db3VudChzaWduZXIuYWRkcmVzcywgJ3BlbmRpbmcnKTtcclxuICAgICAgY29uc3QgcHJvdmlkZWROb25jZSA9IHR5cGVvZiB0eFJlcXVlc3Qubm9uY2UgPT09ICdzdHJpbmcnXHJcbiAgICAgICAgPyBwYXJzZUludCh0eFJlcXVlc3Qubm9uY2UsIDE2KVxyXG4gICAgICAgIDogdHhSZXF1ZXN0Lm5vbmNlO1xyXG5cclxuICAgICAgLy8gTm9uY2UgbXVzdCBiZSA+PSBjdXJyZW50IHBlbmRpbmcgbm9uY2VcclxuICAgICAgaWYgKHByb3ZpZGVkTm9uY2UgPCBjdXJyZW50Tm9uY2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgbm9uY2U6ICR7cHJvdmlkZWROb25jZX0gaXMgbGVzcyB0aGFuIGN1cnJlbnQgbm9uY2UgJHtjdXJyZW50Tm9uY2V9YCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR4VG9TZW5kLm5vbmNlID0gcHJvdmlkZWROb25jZTtcclxuICAgICAgLy8gVXNpbmcgREFwcC1wcm92aWRlZCBub25jZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gSWYgbm8gbm9uY2UgcHJvdmlkZWQsIGV0aGVycy5qcyB3aWxsIGZldGNoIHRoZSBjb3JyZWN0IG9uZSBhdXRvbWF0aWNhbGx5XHJcbiAgICAgIC8vIEF1dG8tZmV0Y2hpbmcgbm9uY2VcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBEQXBwIHByb3ZpZGVkIGEgZ2FzIGxpbWl0LCB1c2UgaXQuIE90aGVyd2lzZSBsZXQgZXRoZXJzIGVzdGltYXRlLlxyXG4gICAgaWYgKHR4UmVxdWVzdC5nYXMgfHwgdHhSZXF1ZXN0Lmdhc0xpbWl0KSB7XHJcbiAgICAgIHR4VG9TZW5kLmdhc0xpbWl0ID0gdHhSZXF1ZXN0LmdhcyB8fCB0eFJlcXVlc3QuZ2FzTGltaXQ7XHJcbiAgICAgIC8vIFVzaW5nIHByb3ZpZGVkIGdhcyBsaW1pdFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEVJUC0xNTU5IGZlZXM6IHVzZSBhIGdlbmVyb3VzIG1heEZlZVBlckdhcyBjYXAgc28gUHVsc2VDaGFpbidzIHZvbGF0aWxlIGJhc2UgZmVlXHJcbiAgICAvLyBjYW5ub3Qgc3RyYW5kIHRoZSB0cmFuc2FjdGlvbiAob25seSB0aGUgYWN0dWFsIGJhc2UgZmVlICsgdGlwIGlzIGNoYXJnZWQsIHNvIHRoZVxyXG4gICAgLy8gaGlnaCBjYXAgY29zdHMgbm90aGluZyBleHRyYSkuIEFueSBVSS1zZWxlY3RlZCBgZ2FzUHJpY2VgIGlzIGhvbm9yZWQgYXMgYSBmbG9vci5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZlZXMgPSBhd2FpdCBycGMuZ2V0RWlwMTU1OUZlZXMobmV0d29yaywgZ2FzUHJpY2UgfHwgbnVsbCk7XHJcbiAgICAgIHR4VG9TZW5kLm1heEZlZVBlckdhcyA9IGZlZXMubWF4RmVlUGVyR2FzO1xyXG4gICAgICB0eFRvU2VuZC5tYXhQcmlvcml0eUZlZVBlckdhcyA9IGZlZXMubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ0VJUC0xNTU5IGZlZSBjYWxjIGZhaWxlZCwgZmFsbGluZyBiYWNrIHRvIHByb3ZpZGVyIGZlZSBkYXRhOicsIGVycm9yKTtcclxuICAgICAgY29uc3QgZmQgPSBhd2FpdCBwcm92aWRlci5nZXRGZWVEYXRhKCk7XHJcbiAgICAgIGlmIChmZC5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICB0eFRvU2VuZC5tYXhGZWVQZXJHYXMgPSBmZC5tYXhGZWVQZXJHYXM7XHJcbiAgICAgICAgdHhUb1NlbmQubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBmZC5tYXhQcmlvcml0eUZlZVBlckdhcyA/PyAoZmQubWF4RmVlUGVyR2FzIC8gMTBuKTtcclxuICAgICAgfSBlbHNlIGlmIChmZC5nYXNQcmljZSkge1xyXG4gICAgICAgIHR4VG9TZW5kLmdhc1ByaWNlID0gZmQuZ2FzUHJpY2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTZW5kIHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IGNvbm5lY3RlZFNpZ25lci5zZW5kVHJhbnNhY3Rpb24odHhUb1NlbmQpO1xyXG5cclxuICAgIC8vIFRyYW5zYWN0aW9uIHNlbnRcclxuXHJcbiAgICAvLyBTYXZlIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnkgKG5ldHdvcmsgdmFyaWFibGUgYWxyZWFkeSBkZWZpbmVkIGFib3ZlKVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KHNpZ25lci5hZGRyZXNzLCB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogc2lnbmVyLmFkZHJlc3MsXHJcbiAgICAgIHRvOiB0eFJlcXVlc3QudG8gfHwgbnVsbCxcclxuICAgICAgdmFsdWU6IHR4UmVxdWVzdC52YWx1ZSB8fCAnMCcsXHJcbiAgICAgIGRhdGE6IHR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IHR4Lmdhc1ByaWNlID8gdHguZ2FzUHJpY2UudG9TdHJpbmcoKSA6ICh0eC5tYXhGZWVQZXJHYXMgPyB0eC5tYXhGZWVQZXJHYXMudG9TdHJpbmcoKSA6ICcwJyksXHJcbiAgICAgIG1heEZlZVBlckdhczogdHgubWF4RmVlUGVyR2FzID8gdHgubWF4RmVlUGVyR2FzLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQsXHJcbiAgICAgIG1heFByaW9yaXR5RmVlUGVyR2FzOiB0eC5tYXhQcmlvcml0eUZlZVBlckdhcyA/IHR4Lm1heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQsXHJcbiAgICAgIGdhc0xpbWl0OiB0eC5nYXNMaW1pdCA/IHR4Lmdhc0xpbWl0LnRvU3RyaW5nKCkgOiBudWxsLFxyXG4gICAgICBub25jZTogdHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogdHhIaXN0b3J5LlRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZW5kIGRlc2t0b3Agbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIHNlbnQ6ICR7dHguaGFzaC5zbGljZSgwLCAyMCl9Li4uYCxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvbiBpbiBiYWNrZ3JvdW5kXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgc2lnbmVyLmFkZHJlc3MpO1xyXG5cclxuICAgIC8vIExvZyBzdWNjZXNzZnVsIHNpZ25pbmcgb3BlcmF0aW9uXHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogJ3RyYW5zYWN0aW9uJyxcclxuICAgICAgYWRkcmVzczogc2lnbmVyLmFkZHJlc3MsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6ICdldGhfc2VuZFRyYW5zYWN0aW9uJyxcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgdHhIYXNoOiB0eC5oYXNoLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZXNvbHZlIHdpdGggdHJhbnNhY3Rpb24gaGFzaFxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogdHguaGFzaCB9KTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2ggfTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIC8vIFNFQ1VSSVRZOiBDbGVhbiB1cCBzZW5zaXRpdmUgZGF0YSBmcm9tIG1lbW9yeVxyXG4gICAgICAvLyBPdmVyd3JpdGUgcGFzc3dvcmQgd2l0aCBnYXJiYWdlIGJlZm9yZSBkZXJlZmVyZW5jaW5nXHJcbiAgICAgIGlmIChwYXNzd29yZCkge1xyXG4gICAgICAgIGNvbnN0IHRlbXBPYmogPSB7IHBhc3N3b3JkIH07XHJcbiAgICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICAgIHBhc3N3b3JkID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2xlYW4gdXAgc2lnbmVyJ3MgcHJpdmF0ZSBrZXlcclxuICAgICAgaWYgKHNpZ25lcikge1xyXG4gICAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgICBzaWduZXIgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjb25uZWN0ZWRTaWduZXIpIHtcclxuICAgICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKGNvbm5lY3RlZFNpZ25lcik7XHJcbiAgICAgICAgY29ubmVjdGVkU2lnbmVyID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRyYW5zYWN0aW9uIGVycm9yOicsIGVycm9yKTtcclxuICAgIGNvbnN0IHNhbml0aXplZEVycm9yID0gc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSk7XHJcblxyXG4gICAgLy8gTG9nIGZhaWxlZCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6ICd0cmFuc2FjdGlvbicsXHJcbiAgICAgIGFkZHJlc3M6ICd1bmtub3duJyxcclxuICAgICAgb3JpZ2luOiBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZDogJ2V0aF9zZW5kVHJhbnNhY3Rpb24nLFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgZXJyb3I6IHNhbml0aXplZEVycm9yLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICByZWplY3QobmV3IEVycm9yKHNhbml0aXplZEVycm9yKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplZEVycm9yIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgdHJhbnNhY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRUcmFuc2FjdGlvblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdUcmFuc2FjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0eFJlcXVlc3QgfSA9IHBlbmRpbmdUcmFuc2FjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBvcmlnaW4sIHR4UmVxdWVzdCB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF93YXRjaEFzc2V0IC0gQWRkIGN1c3RvbSB0b2tlbiAoRUlQLTc0NylcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlV2F0Y2hBc3NldChwYXJhbXMsIG9yaWdpbiwgdGFiKSB7XHJcbiAgLy8gUmVjZWl2ZWQgd2FsbGV0X3dhdGNoQXNzZXQgcmVxdWVzdFxyXG5cclxuICAvLyBWYWxpZGF0ZSBwYXJhbXMgc3RydWN0dXJlXHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtcy50eXBlIHx8ICFwYXJhbXMub3B0aW9ucykge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXM6IG11c3QgaW5jbHVkZSB0eXBlIGFuZCBvcHRpb25zJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHR5cGUsIG9wdGlvbnMgfSA9IHBhcmFtcztcclxuXHJcbiAgLy8gT25seSBzdXBwb3J0IEVSQzIwL1BSQzIwIHRva2Vuc1xyXG4gIGlmICh0eXBlLnRvVXBwZXJDYXNlKCkgIT09ICdFUkMyMCcpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ09ubHkgRVJDMjAvUFJDMjAgdG9rZW5zIGFyZSBzdXBwb3J0ZWQnIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHJlcXVpcmVkIHRva2VuIGZpZWxkc1xyXG4gIGlmICghb3B0aW9ucy5hZGRyZXNzIHx8ICFvcHRpb25zLnN5bWJvbCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnVG9rZW4gbXVzdCBoYXZlIGFkZHJlc3MgYW5kIHN5bWJvbCcgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdG9rZW5JbmZvID0ge1xyXG4gICAgYWRkcmVzczogb3B0aW9ucy5hZGRyZXNzLnRvTG93ZXJDYXNlKCksXHJcbiAgICBzeW1ib2w6IG9wdGlvbnMuc3ltYm9sLFxyXG4gICAgZGVjaW1hbHM6IG9wdGlvbnMuZGVjaW1hbHMgfHwgMTgsXHJcbiAgICBpbWFnZTogb3B0aW9ucy5pbWFnZSB8fCBudWxsXHJcbiAgfTtcclxuXHJcbiAgLy8gUmVxdWVzdGluZyB0byBhZGQgdG9rZW5cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XHJcbiAgICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0b2tlbkluZm8gfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1hZGRUb2tlbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNTAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdUb2tlblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1Rva2VuIGFkZCByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB0b2tlbiBhZGQgYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQpIHtcclxuICBpZiAoIXBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIHRva2VuSW5mbyB9ID0gcGVuZGluZ1Rva2VuUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdG9rZW4nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFRva2VuIGFwcHJvdmVkIC0gcmV0dXJuIHRydWUgKHdhbGxldF93YXRjaEFzc2V0IHJldHVybnMgYm9vbGVhbilcclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHRydWUgfSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0b2tlbkluZm8gfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBUb2tlbiBhZGQgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCB0b2tlbiBhZGQgcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRUb2tlbkFkZFJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdG9rZW5JbmZvIH0gPSBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiwgdG9rZW5JbmZvIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBTcGVlZCB1cCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gYnkgcmVwbGFjaW5nIGl0IHdpdGggaGlnaGVyIGdhcyBwcmljZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24oYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHNlc3Npb25Ub2tlbiwgZ2FzUHJpY2VNdWx0aXBsaWVyID0gMS4yLCBjdXN0b21HYXNQcmljZSA9IG51bGwpIHtcclxuICBsZXQgcGFzc3dvcmQgPSBudWxsO1xyXG4gIGxldCBzaWduZXIgPSBudWxsO1xyXG4gIGxldCB3YWxsZXQgPSBudWxsO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVmFsaWRhdGUgc2Vzc2lvbiAobm93IGFzeW5jKVxyXG4gICAgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBHZXQgb3JpZ2luYWwgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUeCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICBpZiAoIW9yaWdpbmFsVHgpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gbm90IGZvdW5kJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcmlnaW5hbFR4LnN0YXR1cyAhPT0gdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGlzIG5vdCBwZW5kaW5nJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCB3YWxsZXQgYW5kIHVubG9jayAoYXV0by11cGdyYWRlIGlmIG5lZWRlZClcclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcblxyXG4gICAgLy8gU0VDVVJJVFk6IFZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYmVsb25ncyB0byB0aGlzIHdhbGxldFxyXG4gICAgY29uc3Qgd2FsbGV0QWRkcmVzcyA9IGF3YWl0IHNpZ25lci5nZXRBZGRyZXNzKCk7XHJcbiAgICBpZiAod2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBBZGRyZXNzIG1pc21hdGNoIGluIHNwZWVkLXVwOiB3YWxsZXQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCByZXF1ZXN0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1dhbGxldCBhZGRyZXNzIG1pc21hdGNoJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFZlcmlmeSBvcmlnaW5hbCB0cmFuc2FjdGlvbiBpcyBmcm9tIHRoaXMgd2FsbGV0XHJcbiAgICBpZiAob3JpZ2luYWxUeC5mcm9tICYmIG9yaWdpbmFsVHguZnJvbS50b0xvd2VyQ2FzZSgpICE9PSB3YWxsZXRBZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBUcmFuc2FjdGlvbiBvd25lcnNoaXAgY2hlY2sgZmFpbGVkOiB0cmFuc2FjdGlvbiBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyB3YWxsZXQnKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgYWN0dWFsIHRyYW5zYWN0aW9uIGZyb20gYmxvY2tjaGFpbiB0byBjaGVjayBpdHMgdHlwZVxyXG4gICAgLy8gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBvbGRlciB0cmFuc2FjdGlvbnMgaW4gaGlzdG9yeSBtYXkgbm90IGhhdmUgRUlQLTE1NTkgZmllbGRzIHN0b3JlZFxyXG4gICAgbGV0IGlzRUlQMTU1OSA9IG9yaWdpbmFsVHgubWF4RmVlUGVyR2FzIHx8IG9yaWdpbmFsVHgubWF4UHJpb3JpdHlGZWVQZXJHYXM7XHJcbiAgICBsZXQgb25DaGFpbk1heEZlZVBlckdhcyA9IG51bGw7XHJcbiAgICBsZXQgb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzID0gbnVsbDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBvbkNoYWluVHggPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbihvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICAgIGlmIChvbkNoYWluVHgpIHtcclxuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIEVJUC0xNTU5ICh0eXBlIDIpXHJcbiAgICAgICAgaWYgKG9uQ2hhaW5UeC50eXBlID09PSAyIHx8IG9uQ2hhaW5UeC5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICAgIGlzRUlQMTU1OSA9IHRydWU7XHJcbiAgICAgICAgICBvbkNoYWluTWF4RmVlUGVyR2FzID0gb25DaGFpblR4Lm1heEZlZVBlckdhcztcclxuICAgICAgICAgIG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyA9IG9uQ2hhaW5UeC5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIERldGVjdGVkIEVJUC0xNTU5IHRyYW5zYWN0aW9uIGZyb20gYmxvY2tjaGFpbjonLCB7XHJcbiAgICAgICAgICAgIG1heEZlZVBlckdhczogb25DaGFpbk1heEZlZVBlckdhcz8udG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgbWF4UHJpb3JpdHlGZWVQZXJHYXM6IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcz8udG9TdHJpbmcoKVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChmZXRjaEVycikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQ291bGQgbm90IGZldGNoIG9yaWdpbmFsIHR4IGZyb20gYmxvY2tjaGFpbjonLCBmZXRjaEVyci5tZXNzYWdlKTtcclxuICAgICAgLy8gQ29udGludWUgd2l0aCB3aGF0IHdlIGhhdmUgZnJvbSBoaXN0b3J5XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHdpdGggc2FtZSBub25jZSwgZGF0YSwgYW5kIGdhc0xpbWl0XHJcbiAgICBjb25zdCByZXBsYWNlbWVudFR4ID0ge1xyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIGRhdGE6IG9yaWdpbmFsVHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBJbmNsdWRlIGdhc0xpbWl0IGlmIGl0IHdhcyBpbiB0aGUgb3JpZ2luYWwgdHJhbnNhY3Rpb25cclxuICAgIGlmIChvcmlnaW5hbFR4Lmdhc0xpbWl0KSB7XHJcbiAgICAgIHJlcGxhY2VtZW50VHguZ2FzTGltaXQgPSBvcmlnaW5hbFR4Lmdhc0xpbWl0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZvciBzdG9yaW5nIGluIGhpc3RvcnlcclxuICAgIGxldCBuZXdHYXNQcmljZSA9IG51bGw7XHJcbiAgICBsZXQgbmV3TWF4RmVlUGVyR2FzID0gbnVsbDtcclxuICAgIGxldCBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IG51bGw7XHJcblxyXG4gICAgaWYgKGlzRUlQMTU1OSkge1xyXG4gICAgICAvLyBFSVAtMTU1OTogTXVzdCBidW1wIEJPVEggbWF4RmVlUGVyR2FzIGFuZCBtYXhQcmlvcml0eUZlZVBlckdhcyBieSBhdCBsZWFzdCAxMCVcclxuICAgICAgLy8gVXNpbmcgMTIuNSUgYnVtcCB0byBlbnN1cmUgYWNjZXB0YW5jZSAoc2FtZSBhcyBFdGhlcmV1bSBkZWZhdWx0KVxyXG4gICAgICBjb25zdCBidW1wTXVsdGlwbGllciA9IDExMjVuOyAvLyAxMTIuNSUgPSAxLjEyNXhcclxuICAgICAgY29uc3QgYnVtcERpdmlzb3IgPSAxMDAwbjtcclxuXHJcbiAgICAgIC8vIFVzZSBvbi1jaGFpbiB2YWx1ZXMgaWYgYXZhaWxhYmxlIChtb3JlIGFjY3VyYXRlKSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBoaXN0b3J5XHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsTWF4RmVlID0gb25DaGFpbk1heEZlZVBlckdhcyB8fCBCaWdJbnQob3JpZ2luYWxUeC5tYXhGZWVQZXJHYXMgfHwgb3JpZ2luYWxUeC5nYXNQcmljZSB8fCAnMCcpO1xyXG4gICAgICBjb25zdCBvcmlnaW5hbFByaW9yaXR5RmVlID0gb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzIHx8IEJpZ0ludChvcmlnaW5hbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzIHx8ICcwJyk7XHJcblxyXG4gICAgICBpZiAoY3VzdG9tR2FzUHJpY2UpIHtcclxuICAgICAgICAvLyBDdXN0b20gZ2FzIHByaWNlOiB1c2UgaXQgZm9yIG1heEZlZVBlckdhcywgY2FsY3VsYXRlIHByaW9yaXR5IGZlZVxyXG4gICAgICAgIGNvbnN0IGN1c3RvbUZlZSA9IEJpZ0ludChjdXN0b21HYXNQcmljZSk7XHJcbiAgICAgICAgLy8gUHJpb3JpdHkgZmVlIHNob3VsZCBiZSBhdCBsZWFzdCAxMi41JSBoaWdoZXIgdGhhbiBvcmlnaW5hbFxyXG4gICAgICAgIGNvbnN0IG1pblByaW9yaXR5RmVlID0gKG9yaWdpbmFsUHJpb3JpdHlGZWUgKiBidW1wTXVsdGlwbGllcikgLyBidW1wRGl2aXNvcjtcclxuICAgICAgICAvLyBVc2UgYXQgbGVhc3QgMSBHd2VpIGZvciBwcmlvcml0eSBmZWUgaWYgbm90IHNldFxyXG4gICAgICAgIGNvbnN0IHByaW9yaXR5RmVlID0gbWluUHJpb3JpdHlGZWUgPiAwbiA/IG1pblByaW9yaXR5RmVlIDogMTAwMDAwMDAwMG47XHJcblxyXG4gICAgICAgIG5ld01heEZlZVBlckdhcyA9IGN1c3RvbUZlZTtcclxuICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IHByaW9yaXR5RmVlIDwgY3VzdG9tRmVlID8gcHJpb3JpdHlGZWUgOiBjdXN0b21GZWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGJ1bXBlZCBmZWVzICgxMi41JSBoaWdoZXIpXHJcbiAgICAgICAgbmV3TWF4RmVlUGVyR2FzID0gKG9yaWdpbmFsTWF4RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSAob3JpZ2luYWxQcmlvcml0eUZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG5cclxuICAgICAgICAvLyBFbnN1cmUgcHJpb3JpdHkgZmVlIGlzIGF0IGxlYXN0IDEgR3dlaVxyXG4gICAgICAgIGlmIChuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA8IDEwMDAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IDEwMDAwMDAwMDBuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmVwbGFjZW1lbnRUeC5tYXhGZWVQZXJHYXMgPSBuZXdNYXhGZWVQZXJHYXM7XHJcbiAgICAgIHJlcGxhY2VtZW50VHgubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBuZXdNYXhQcmlvcml0eUZlZVBlckdhcztcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn6uAIEVJUC0xNTU5IHNwZWVkLXVwOicsIHtcclxuICAgICAgICBvcmlnaW5hbE1heEZlZTogb3JpZ2luYWxNYXhGZWUudG9TdHJpbmcoKSxcclxuICAgICAgICBvcmlnaW5hbFByaW9yaXR5RmVlOiBvcmlnaW5hbFByaW9yaXR5RmVlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbmV3TWF4RmVlOiBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKSxcclxuICAgICAgICBuZXdQcmlvcml0eUZlZTogbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIExlZ2FjeSB0cmFuc2FjdGlvbjogdXNlIGdhc1ByaWNlXHJcbiAgICAgIGlmIChjdXN0b21HYXNQcmljZSkge1xyXG4gICAgICAgIC8vIFVzZSBjdXN0b20gZ2FzIHByaWNlIHByb3ZpZGVkIGJ5IHVzZXJcclxuICAgICAgICBuZXdHYXNQcmljZSA9IEJpZ0ludChjdXN0b21HYXNQcmljZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGZyb20gbXVsdGlwbGllciAoMS4yeCBvZiBvcmlnaW5hbCBieSBkZWZhdWx0KVxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsR2FzUHJpY2UgPSBCaWdJbnQob3JpZ2luYWxUeC5nYXNQcmljZSk7XHJcbiAgICAgICAgbmV3R2FzUHJpY2UgPSAob3JpZ2luYWxHYXNQcmljZSAqIEJpZ0ludChNYXRoLmZsb29yKGdhc1ByaWNlTXVsdGlwbGllciAqIDEwMCkpKSAvIEJpZ0ludCgxMDApO1xyXG4gICAgICB9XHJcbiAgICAgIHJlcGxhY2VtZW50VHguZ2FzUHJpY2UgPSBuZXdHYXNQcmljZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTcGVlZGluZyB1cCB0cmFuc2FjdGlvblxyXG5cclxuICAgIC8vIFNlbmQgcmVwbGFjZW1lbnQgdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgd2FsbGV0LnNlbmRUcmFuc2FjdGlvbihyZXBsYWNlbWVudFR4KTtcclxuXHJcbiAgICAvLyBTYXZlIG5ldyB0cmFuc2FjdGlvbiB0byBoaXN0b3J5IChpbmNsdWRlIEVJUC0xNTU5IGZpZWxkcyBpZiBhcHBsaWNhYmxlKVxyXG4gICAgY29uc3QgaGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICBoYXNoOiB0eC5oYXNoLFxyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIGZyb206IGFkZHJlc3MsXHJcbiAgICAgIHRvOiBvcmlnaW5hbFR4LnRvLFxyXG4gICAgICB2YWx1ZTogb3JpZ2luYWxUeC52YWx1ZSxcclxuICAgICAgZGF0YTogb3JpZ2luYWxUeC5kYXRhIHx8ICcweCcsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZSA/IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCkgOiAobmV3TWF4RmVlUGVyR2FzID8gbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCkgOiBvcmlnaW5hbFR4Lmdhc1ByaWNlKSxcclxuICAgICAgZ2FzTGltaXQ6IG9yaWdpbmFsVHguZ2FzTGltaXQsXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6IG9yaWdpbmFsVHgudHlwZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBZGQgRUlQLTE1NTkgZmllbGRzIGlmIHRoaXMgd2FzIGFuIEVJUC0xNTU5IHRyYW5zYWN0aW9uXHJcbiAgICBpZiAobmV3TWF4RmVlUGVyR2FzKSB7XHJcbiAgICAgIGhpc3RvcnlFbnRyeS5tYXhGZWVQZXJHYXMgPSBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIGlmIChuZXdNYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICBoaXN0b3J5RW50cnkubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBuZXdNYXhQcmlvcml0eUZlZVBlckdhcy50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShhZGRyZXNzLCBoaXN0b3J5RW50cnkpO1xyXG5cclxuICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgcmVwbGFjZWQvZmFpbGVkXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAvLyBTZW5kIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU3BlZCBVcCcsXHJcbiAgICAgIG1lc3NhZ2U6IGBSZXBsYWNlbWVudCB0cmFuc2FjdGlvbiBzZW50IHdpdGggJHtNYXRoLmZsb29yKGdhc1ByaWNlTXVsdGlwbGllciAqIDEwMCl9JSBnYXMgcHJpY2VgLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcyk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiB0eC5oYXNoLCBuZXdHYXNQcmljZTogbmV3R2FzUHJpY2UudG9TdHJpbmcoKSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgLy8gU0VDVVJJVFk6IENsZWFuIHVwIHNlbnNpdGl2ZSBkYXRhIGZyb20gbWVtb3J5XHJcbiAgICBpZiAocGFzc3dvcmQpIHtcclxuICAgICAgY29uc3QgdGVtcE9iaiA9IHsgcGFzc3dvcmQgfTtcclxuICAgICAgc2VjdXJlQ2xlYW51cCh0ZW1wT2JqLCBbJ3Bhc3N3b3JkJ10pO1xyXG4gICAgICBwYXNzd29yZCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoc2lnbmVyKSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIoc2lnbmVyKTtcclxuICAgICAgc2lnbmVyID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmICh3YWxsZXQpIHtcclxuICAgICAgc2VjdXJlQ2xlYW51cFNpZ25lcih3YWxsZXQpO1xyXG4gICAgICB3YWxsZXQgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gQ2FuY2VsIGEgcGVuZGluZyB0cmFuc2FjdGlvbiBieSByZXBsYWNpbmcgaXQgd2l0aCBhIHplcm8tdmFsdWUgdHggdG8gc2VsZlxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbihhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgc2Vzc2lvblRva2VuLCBjdXN0b21HYXNQcmljZSA9IG51bGwpIHtcclxuICBsZXQgcGFzc3dvcmQgPSBudWxsO1xyXG4gIGxldCBzaWduZXIgPSBudWxsO1xyXG4gIGxldCB3YWxsZXQgPSBudWxsO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVmFsaWRhdGUgc2Vzc2lvbiAobm93IGFzeW5jKVxyXG4gICAgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBHZXQgb3JpZ2luYWwgdHJhbnNhY3Rpb24gZGV0YWlsc1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUeCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCk7XHJcbiAgICBpZiAoIW9yaWdpbmFsVHgpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gbm90IGZvdW5kJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcmlnaW5hbFR4LnN0YXR1cyAhPT0gdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGlzIG5vdCBwZW5kaW5nJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCB3YWxsZXQgYW5kIHVubG9jayAoYXV0by11cGdyYWRlIGlmIG5lZWRlZClcclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcblxyXG4gICAgLy8gU0VDVVJJVFk6IFZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYmVsb25ncyB0byB0aGlzIHdhbGxldFxyXG4gICAgY29uc3Qgd2FsbGV0QWRkcmVzcyA9IGF3YWl0IHNpZ25lci5nZXRBZGRyZXNzKCk7XHJcbiAgICBpZiAod2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBBZGRyZXNzIG1pc21hdGNoIGluIGNhbmNlbDogd2FsbGV0IGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggcmVxdWVzdCcpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdXYWxsZXQgYWRkcmVzcyBtaXNtYXRjaCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgb3JpZ2luYWwgdHJhbnNhY3Rpb24gaXMgZnJvbSB0aGlzIHdhbGxldFxyXG4gICAgaWYgKG9yaWdpbmFsVHguZnJvbSAmJiBvcmlnaW5hbFR4LmZyb20udG9Mb3dlckNhc2UoKSAhPT0gd2FsbGV0QWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVHJhbnNhY3Rpb24gb3duZXJzaGlwIGNoZWNrIGZhaWxlZDogdHJhbnNhY3Rpb24gZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgd2FsbGV0Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIHdhbGxldCcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgbmV0d29yayBhbmQgY3JlYXRlIHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyXHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3JpZ2luYWxUeC5uZXR3b3JrO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICB3YWxsZXQgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIGFjdHVhbCB0cmFuc2FjdGlvbiBmcm9tIGJsb2NrY2hhaW4gdG8gY2hlY2sgaXRzIHR5cGVcclxuICAgIGxldCBpc0VJUDE1NTkgPSBvcmlnaW5hbFR4Lm1heEZlZVBlckdhcyB8fCBvcmlnaW5hbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhGZWVQZXJHYXMgPSBudWxsO1xyXG4gICAgbGV0IG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyA9IG51bGw7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgb25DaGFpblR4ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb24ob3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgICBpZiAob25DaGFpblR4KSB7XHJcbiAgICAgICAgaWYgKG9uQ2hhaW5UeC50eXBlID09PSAyIHx8IG9uQ2hhaW5UeC5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICAgIGlzRUlQMTU1OSA9IHRydWU7XHJcbiAgICAgICAgICBvbkNoYWluTWF4RmVlUGVyR2FzID0gb25DaGFpblR4Lm1heEZlZVBlckdhcztcclxuICAgICAgICAgIG9uQ2hhaW5NYXhQcmlvcml0eUZlZVBlckdhcyA9IG9uQ2hhaW5UeC5tYXhQcmlvcml0eUZlZVBlckdhcztcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIERldGVjdGVkIEVJUC0xNTU5IHRyYW5zYWN0aW9uIGZyb20gYmxvY2tjaGFpbiBmb3IgY2FuY2VsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChmZXRjaEVycikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQ291bGQgbm90IGZldGNoIG9yaWdpbmFsIHR4IGZyb20gYmxvY2tjaGFpbjonLCBmZXRjaEVyci5tZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIChzZW5kIDAgdG8gc2VsZiB3aXRoIHNhbWUgbm9uY2UpXHJcbiAgICBjb25zdCBjYW5jZWxUeCA9IHtcclxuICAgICAgdG86IGFkZHJlc3MsICAvLyBTZW5kIHRvIHNlbGZcclxuICAgICAgdmFsdWU6ICcwJywgICAvLyBaZXJvIHZhbHVlXHJcbiAgICAgIGRhdGE6ICcweCcsICAgLy8gRW1wdHkgZGF0YVxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgZ2FzTGltaXQ6IDIxMDAwICAvLyBTdGFuZGFyZCBnYXMgbGltaXQgZm9yIHNpbXBsZSBFVEggdHJhbnNmZXJcclxuICAgIH07XHJcblxyXG4gICAgLy8gRm9yIHN0b3JpbmcgaW4gaGlzdG9yeVxyXG4gICAgbGV0IG5ld0dhc1ByaWNlID0gbnVsbDtcclxuICAgIGxldCBuZXdNYXhGZWVQZXJHYXMgPSBudWxsO1xyXG4gICAgbGV0IG5ld01heFByaW9yaXR5RmVlUGVyR2FzID0gbnVsbDtcclxuXHJcbiAgICBpZiAoaXNFSVAxNTU5KSB7XHJcbiAgICAgIC8vIEVJUC0xNTU5OiBNdXN0IGJ1bXAgQk9USCBtYXhGZWVQZXJHYXMgYW5kIG1heFByaW9yaXR5RmVlUGVyR2FzIGJ5IGF0IGxlYXN0IDEwJVxyXG4gICAgICBjb25zdCBidW1wTXVsdGlwbGllciA9IDExMjVuOyAvLyAxMTIuNSVcclxuICAgICAgY29uc3QgYnVtcERpdmlzb3IgPSAxMDAwbjtcclxuXHJcbiAgICAgIC8vIFVzZSBvbi1jaGFpbiB2YWx1ZXMgaWYgYXZhaWxhYmxlXHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsTWF4RmVlID0gb25DaGFpbk1heEZlZVBlckdhcyB8fCBCaWdJbnQob3JpZ2luYWxUeC5tYXhGZWVQZXJHYXMgfHwgb3JpZ2luYWxUeC5nYXNQcmljZSB8fCAnMCcpO1xyXG4gICAgICBjb25zdCBvcmlnaW5hbFByaW9yaXR5RmVlID0gb25DaGFpbk1heFByaW9yaXR5RmVlUGVyR2FzIHx8IEJpZ0ludChvcmlnaW5hbFR4Lm1heFByaW9yaXR5RmVlUGVyR2FzIHx8ICcwJyk7XHJcblxyXG4gICAgICBpZiAoY3VzdG9tR2FzUHJpY2UpIHtcclxuICAgICAgICAvLyBDdXN0b20gZ2FzIHByaWNlOiB1c2UgaXQgZm9yIG1heEZlZVBlckdhc1xyXG4gICAgICAgIGNvbnN0IGN1c3RvbUZlZSA9IEJpZ0ludChjdXN0b21HYXNQcmljZSk7XHJcbiAgICAgICAgY29uc3QgbWluUHJpb3JpdHlGZWUgPSAob3JpZ2luYWxQcmlvcml0eUZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG4gICAgICAgIGNvbnN0IHByaW9yaXR5RmVlID0gbWluUHJpb3JpdHlGZWUgPiAwbiA/IG1pblByaW9yaXR5RmVlIDogMTAwMDAwMDAwMG47XHJcblxyXG4gICAgICAgIG5ld01heEZlZVBlckdhcyA9IGN1c3RvbUZlZTtcclxuICAgICAgICBuZXdNYXhQcmlvcml0eUZlZVBlckdhcyA9IHByaW9yaXR5RmVlIDwgY3VzdG9tRmVlID8gcHJpb3JpdHlGZWUgOiBjdXN0b21GZWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGJ1bXBlZCBmZWVzXHJcbiAgICAgICAgbmV3TWF4RmVlUGVyR2FzID0gKG9yaWdpbmFsTWF4RmVlICogYnVtcE11bHRpcGxpZXIpIC8gYnVtcERpdmlzb3I7XHJcbiAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSAob3JpZ2luYWxQcmlvcml0eUZlZSAqIGJ1bXBNdWx0aXBsaWVyKSAvIGJ1bXBEaXZpc29yO1xyXG5cclxuICAgICAgICBpZiAobmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPCAxMDAwMDAwMDAwbikge1xyXG4gICAgICAgICAgbmV3TWF4UHJpb3JpdHlGZWVQZXJHYXMgPSAxMDAwMDAwMDAwbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNhbmNlbFR4Lm1heEZlZVBlckdhcyA9IG5ld01heEZlZVBlckdhcztcclxuICAgICAgY2FuY2VsVHgubWF4UHJpb3JpdHlGZWVQZXJHYXMgPSBuZXdNYXhQcmlvcml0eUZlZVBlckdhcztcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn6uAIEVJUC0xNTU5IGNhbmNlbDonLCB7XHJcbiAgICAgICAgb3JpZ2luYWxNYXhGZWU6IG9yaWdpbmFsTWF4RmVlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgb3JpZ2luYWxQcmlvcml0eUZlZTogb3JpZ2luYWxQcmlvcml0eUZlZS50b1N0cmluZygpLFxyXG4gICAgICAgIG5ld01heEZlZTogbmV3TWF4RmVlUGVyR2FzLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbmV3UHJpb3JpdHlGZWU6IG5ld01heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKClcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBMZWdhY3kgdHJhbnNhY3Rpb25cclxuICAgICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgICAgbmV3R2FzUHJpY2UgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsR2FzUHJpY2UgPSBCaWdJbnQob3JpZ2luYWxUeC5nYXNQcmljZSk7XHJcbiAgICAgICAgbmV3R2FzUHJpY2UgPSAob3JpZ2luYWxHYXNQcmljZSAqIEJpZ0ludCgxMjApKSAvIEJpZ0ludCgxMDApO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbmNlbFR4Lmdhc1ByaWNlID0gbmV3R2FzUHJpY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FuY2VsbGluZyB0cmFuc2FjdGlvblxyXG5cclxuICAgIC8vIFNlbmQgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHdhbGxldC5zZW5kVHJhbnNhY3Rpb24oY2FuY2VsVHgpO1xyXG5cclxuICAgIC8vIFNhdmUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnlcclxuICAgIGNvbnN0IGhpc3RvcnlFbnRyeSA9IHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogYWRkcmVzcyxcclxuICAgICAgdmFsdWU6ICcwJyxcclxuICAgICAgZGF0YTogJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlID8gbmV3R2FzUHJpY2UudG9TdHJpbmcoKSA6IChuZXdNYXhGZWVQZXJHYXMgPyBuZXdNYXhGZWVQZXJHYXMudG9TdHJpbmcoKSA6IG9yaWdpbmFsVHguZ2FzUHJpY2UpLFxyXG4gICAgICBnYXNMaW1pdDogJzIxMDAwJyxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogJ3NlbmQnXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChuZXdNYXhGZWVQZXJHYXMpIHtcclxuICAgICAgaGlzdG9yeUVudHJ5Lm1heEZlZVBlckdhcyA9IG5ld01heEZlZVBlckdhcy50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5ld01heFByaW9yaXR5RmVlUGVyR2FzKSB7XHJcbiAgICAgIGhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG5ld01heFByaW9yaXR5RmVlUGVyR2FzLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIGhpc3RvcnlFbnRyeSk7XHJcblxyXG4gICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyBmYWlsZWRcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBDYW5jZWxsZWQnLFxyXG4gICAgICBtZXNzYWdlOiAnQ2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHNlbnQnLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcyk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiB0eC5oYXNoIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIC8vIFNFQ1VSSVRZOiBDbGVhbiB1cCBzZW5zaXRpdmUgZGF0YSBmcm9tIG1lbW9yeVxyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNvbnN0IHRlbXBPYmogPSB7IHBhc3N3b3JkIH07XHJcbiAgICAgIHNlY3VyZUNsZWFudXAodGVtcE9iaiwgWydwYXNzd29yZCddKTtcclxuICAgICAgcGFzc3dvcmQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHNpZ25lcikge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHNpZ25lcik7XHJcbiAgICAgIHNpZ25lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAod2FsbGV0KSB7XHJcbiAgICAgIHNlY3VyZUNsZWFudXBTaWduZXIod2FsbGV0KTtcclxuICAgICAgd2FsbGV0ID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBjdXJyZW50IG5ldHdvcmsgZ2FzIHByaWNlIChmb3Igc3BlZWQtdXAgVUkpXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnROZXR3b3JrR2FzUHJpY2UobmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBHZXQgZnVsbCBnYXMgcHJpY2UgcmVjb21tZW5kYXRpb25zIGJhc2VkIG9uIGZlZSBoaXN0b3J5XHJcbiAgICBjb25zdCByZWNvbW1lbmRhdGlvbnMgPSBhd2FpdCBycGMuZ2V0R2FzUHJpY2VSZWNvbW1lbmRhdGlvbnMobmV0d29yayk7XHJcblxyXG4gICAgLy8gVXNlIFwiZmFzdFwiIHRpZXIgYXMgdGhlIHJlY29tbWVuZGVkIHNwZWVkLXVwIHByaWNlXHJcbiAgICBjb25zdCBmYXN0UHJpY2UgPSBCaWdJbnQocmVjb21tZW5kYXRpb25zLmZhc3QubWF4RmVlUGVyR2FzKTtcclxuICAgIGNvbnN0IGluc3RhbnRQcmljZSA9IEJpZ0ludChyZWNvbW1lbmRhdGlvbnMuaW5zdGFudC5tYXhGZWVQZXJHYXMpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIGdhc1ByaWNlOiBmYXN0UHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgZ2FzUHJpY2VHd2VpOiAoTnVtYmVyKGZhc3RQcmljZSkgLyAxZTkpLnRvRml4ZWQoMiksXHJcbiAgICAgIHJlY29tbWVuZGF0aW9uczoge1xyXG4gICAgICAgIHNsb3c6IHJlY29tbWVuZGF0aW9ucy5zbG93Lm1heEZlZVBlckdhcyxcclxuICAgICAgICBub3JtYWw6IHJlY29tbWVuZGF0aW9ucy5ub3JtYWwubWF4RmVlUGVyR2FzLFxyXG4gICAgICAgIGZhc3Q6IHJlY29tbWVuZGF0aW9ucy5mYXN0Lm1heEZlZVBlckdhcyxcclxuICAgICAgICBpbnN0YW50OiByZWNvbW1lbmRhdGlvbnMuaW5zdGFudC5tYXhGZWVQZXJHYXNcclxuICAgICAgfSxcclxuICAgICAgaW5zdGFudFByaWNlOiBpbnN0YW50UHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgaW5zdGFudFByaWNlR3dlaTogKE51bWJlcihpbnN0YW50UHJpY2UpIC8gMWU5KS50b0ZpeGVkKDIpXHJcbiAgICB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGZldGNoaW5nIGN1cnJlbnQgZ2FzIHByaWNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFJlZnJlc2ggdHJhbnNhY3Rpb24gc3RhdHVzIGZyb20gYmxvY2tjaGFpblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoVHJhbnNhY3Rpb25TdGF0dXMoYWRkcmVzcywgdHhIYXNoLCBuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnNvbGUubG9nKGDwn6uAIFJlZnJlc2hpbmcgdHggc3RhdHVzOiAke3R4SGFzaH0gb24gJHtuZXR3b3JrfWApO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcblxyXG4gICAgLy8gR2V0IHRyYW5zYWN0aW9uIHJlY2VpcHQgZnJvbSBibG9ja2NoYWluXHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0KHR4SGFzaCk7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBSZWNlaXB0IGZvciAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uOmAsIHJlY2VpcHQgPyAnZm91bmQnIDogJ251bGwnKTtcclxuXHJcbiAgICBpZiAoIXJlY2VpcHQpIHtcclxuICAgICAgLy8gTm8gcmVjZWlwdCAtIGNoZWNrIGlmIHRyYW5zYWN0aW9uIGlzIHN0aWxsIGluIG1lbXBvb2xcclxuICAgICAgY29uc3QgdHggPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbih0eEhhc2gpO1xyXG4gICAgICBjb25zb2xlLmxvZyhg8J+rgCBNZW1wb29sIHR4IGZvciAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uOmAsIHR4ID8gJ2ZvdW5kJyA6ICdudWxsJyk7XHJcblxyXG4gICAgICBpZiAoIXR4KSB7XHJcbiAgICAgICAgLy8gVHJhbnNhY3Rpb24gbm90IGluIG1lbXBvb2wgYW5kIG5vIHJlY2VpcHQgPSBkcm9wcGVkL2V2aWN0ZWRcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+rgCBUcmFuc2FjdGlvbiAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uIHdhcyBEUk9QUEVEIC0gbWFya2luZyBhcyBmYWlsZWRgKTtcclxuICAgICAgICAvLyBNYXJrIGFzIGZhaWxlZCBpbiBsb2NhbCBoaXN0b3J5XHJcbiAgICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICAgIHR4SGFzaCxcclxuICAgICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELFxyXG4gICAgICAgICAgbnVsbFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgc3RhdHVzOiAnZHJvcHBlZCcsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gd2FzIGRyb3BwZWQgZnJvbSBtZW1wb29sIChub3QgY29uZmlybWVkLCBubyBsb25nZXIgcGVuZGluZyknXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJhbnNhY3Rpb24gZXhpc3RzIGluIG1lbXBvb2wsIHN0aWxsIHBlbmRpbmdcclxuICAgICAgY29uc29sZS5sb2coYPCfq4AgVHJhbnNhY3Rpb24gJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiBzdGlsbCBpbiBtZW1wb29sYCk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcclxuICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gaXMgc3RpbGwgcGVuZGluZyBvbiB0aGUgYmxvY2tjaGFpbidcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUcmFuc2FjdGlvbiBoYXMgYmVlbiBtaW5lZFxyXG4gICAgbGV0IG5ld1N0YXR1cztcclxuICAgIGlmIChyZWNlaXB0LnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICBuZXdTdGF0dXMgPSB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5ld1N0YXR1cyA9IHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVEO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBsb2NhbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgIGFkZHJlc3MsXHJcbiAgICAgIHR4SGFzaCxcclxuICAgICAgbmV3U3RhdHVzLFxyXG4gICAgICByZWNlaXB0LmJsb2NrTnVtYmVyXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxyXG4gICAgICBibG9ja051bWJlcjogcmVjZWlwdC5ibG9ja051bWJlcixcclxuICAgICAgbWVzc2FnZTogbmV3U3RhdHVzID09PSB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRFxyXG4gICAgICAgID8gJ1RyYW5zYWN0aW9uIGNvbmZpcm1lZCBvbiBibG9ja2NoYWluJ1xyXG4gICAgICAgIDogJ1RyYW5zYWN0aW9uIGZhaWxlZCBvbiBibG9ja2NoYWluJ1xyXG4gICAgfTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgcmVmcmVzaGluZyB0cmFuc2FjdGlvbiBzdGF0dXM6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVicm9hZGNhc3QgYSBwZW5kaW5nIHRyYW5zYWN0aW9uIHRvIGFsbCBjb25maWd1cmVkIFJQQ3NcclxuYXN5bmMgZnVuY3Rpb24gcmVicm9hZGNhc3RUcmFuc2FjdGlvbih0eEhhc2gsIG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgUmVicm9hZGNhc3RpbmcgdHJhbnNhY3Rpb246ICR7dHhIYXNofSB0byBhbGwgJHtuZXR3b3JrfSBSUENzYCk7XHJcblxyXG4gICAgLy8gRmlyc3QsIHRyeSB0byBnZXQgdGhlIHJhdyB0cmFuc2FjdGlvblxyXG4gICAgbGV0IHJhd1R4ID0gYXdhaXQgcnBjLmdldFJhd1RyYW5zYWN0aW9uKG5ldHdvcmssIHR4SGFzaCk7XHJcblxyXG4gICAgaWYgKCFyYXdUeCkge1xyXG4gICAgICAvLyBJZiBnZXRSYXdUcmFuc2FjdGlvbiBub3Qgc3VwcG9ydGVkLCB3ZSBuZWVkIHRvIHJlY29uc3RydWN0IGZyb20gdHggZGF0YVxyXG4gICAgICAvLyBHZXQgdGhlIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgIGNvbnN0IHR4ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb24odHhIYXNoKTtcclxuXHJcbiAgICAgIGlmICghdHgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCBpbiBtZW1wb29sIC0gaXQgbWF5IGhhdmUgYmVlbiBkcm9wcGVkIG9yIGFscmVhZHkgY29uZmlybWVkJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEdldCB0aGUgcmF3IHNlcmlhbGl6ZWQgdHJhbnNhY3Rpb24gZnJvbSB0aGUgcHJvdmlkZXJcclxuICAgICAgLy8gZXRoZXJzIHY2IGRvZXNuJ3QgZXhwb3NlIHJhdyB0eCBkaXJlY3RseSwgc28gd2UgdXNlIGEgd29ya2Fyb3VuZFxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIC8vIFRyeSBkaXJlY3QgUlBDIGNhbGwgdG8gZ2V0IHJhdyB0eFxyXG4gICAgICAgIGNvbnN0IHJhd1Jlc3VsdCA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRSYXdUcmFuc2FjdGlvbkJ5SGFzaCcsIFt0eEhhc2hdKTtcclxuICAgICAgICBpZiAocmF3UmVzdWx0KSB7XHJcbiAgICAgICAgICByYXdUeCA9IHJhd1Jlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBnZXQgcmF3IHRyYW5zYWN0aW9uIHZpYSBSUEM6JywgZS5tZXNzYWdlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFyYXdUeCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgIGVycm9yOiAnQ2Fubm90IGdldCByYXcgdHJhbnNhY3Rpb24gZGF0YS4gVGhlIFJQQyBub2RlcyBtYXkgbm90IHN1cHBvcnQgdGhpcyBvcGVyYXRpb24uJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBCcm9hZGNhc3QgdG8gYWxsIFJQQ3NcclxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBycGMuYnJvYWRjYXN0VG9BbGxScGNzKG5ldHdvcmssIHJhd1R4KTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhg8J+rgCBSZWJyb2FkY2FzdCByZXN1bHRzIC0gU3VjY2Vzc2VzOiAke3Jlc3VsdHMuc3VjY2Vzc2VzLmxlbmd0aH0sIEZhaWx1cmVzOiAke3Jlc3VsdHMuZmFpbHVyZXMubGVuZ3RofWApO1xyXG5cclxuICAgIGlmIChyZXN1bHRzLnN1Y2Nlc3Nlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gYnJvYWRjYXN0IHRvICR7cmVzdWx0cy5zdWNjZXNzZXMubGVuZ3RofSBSUEMocylgLFxyXG4gICAgICAgIHN1Y2Nlc3NlczogcmVzdWx0cy5zdWNjZXNzZXMsXHJcbiAgICAgICAgZmFpbHVyZXM6IHJlc3VsdHMuZmFpbHVyZXNcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gYnJvYWRjYXN0IHRvIGFueSBSUEMnLFxyXG4gICAgICAgIGZhaWx1cmVzOiByZXN1bHRzLmZhaWx1cmVzXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHJlYnJvYWRjYXN0aW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFRyYWNrIHRyYW5zYWN0aW9ucyBiZWluZyBtb25pdG9yZWQgdG8gcHJldmVudCBkdXBsaWNhdGVzXHJcbmNvbnN0IG1vbml0b3JpbmdUcmFuc2FjdGlvbnMgPSBuZXcgU2V0KCk7XHJcblxyXG4vLyBXYWl0IGZvciB0cmFuc2FjdGlvbiBjb25maXJtYXRpb24gd2l0aCB0aW1lb3V0IGFuZCByZXRyeVxyXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcykge1xyXG4gIGNvbnN0IHR4SGFzaCA9IHR4Lmhhc2g7XHJcblxyXG4gIC8vIFByZXZlbnQgZHVwbGljYXRlIG1vbml0b3JpbmdcclxuICBpZiAobW9uaXRvcmluZ1RyYW5zYWN0aW9ucy5oYXModHhIYXNoKSkge1xyXG4gICAgY29uc29sZS5sb2coYPCfq4AgVHJhbnNhY3Rpb24gJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiBhbHJlYWR5IGJlaW5nIG1vbml0b3JlZGApO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBtb25pdG9yaW5nVHJhbnNhY3Rpb25zLmFkZCh0eEhhc2gpO1xyXG5cclxuICBjb25zdCBQT0xMX0lOVEVSVkFMID0gMTUgKiAxMDAwOyAvLyAxNSBzZWNvbmRzXHJcbiAgY29uc3QgTUFYX1JFVFJJRVMgPSA0MDsgLy8gNDAgKiAxNXMgPSAxMCBtaW51dGVzXHJcblxyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVjZWlwdCA9IG51bGw7XHJcbiAgICBsZXQgcmV0cmllcyA9IDA7XHJcblxyXG4gICAgLy8gUG9sbCBmb3IgcmVjZWlwdCB3aXRoIHRpbWVvdXRcclxuICAgIHdoaWxlICghcmVjZWlwdCAmJiByZXRyaWVzIDwgTUFYX1JFVFJJRVMpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZWNlaXB0ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0KHR4SGFzaCk7XHJcbiAgICAgICAgaWYgKHJlY2VpcHQpIGJyZWFrO1xyXG4gICAgICB9IGNhdGNoIChycGNFcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2Fybihg8J+rgCBSUEMgZXJyb3IgY2hlY2tpbmcgdHggJHt0eEhhc2guc2xpY2UoMCwgMTApfS4uLiwgcmV0cnlpbmc6YCwgcnBjRXJyb3IubWVzc2FnZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdhaXQgYmVmb3JlIG5leHQgcG9sbFxyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgUE9MTF9JTlRFUlZBTCkpO1xyXG4gICAgICByZXRyaWVzKys7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyZWNlaXB0KSB7XHJcbiAgICAgIGNvbnNvbGUud2Fybihg8J+rgCBUcmFuc2FjdGlvbiAke3R4SGFzaC5zbGljZSgwLCAxMCl9Li4uIGNvbmZpcm1hdGlvbiB0aW1lZCBvdXQgYWZ0ZXIgJHtNQVhfUkVUUklFU30gYXR0ZW1wdHNgKTtcclxuICAgICAgLy8gRG9uJ3QgbWFyayBhcyBmYWlsZWQgLSBpdCBtaWdodCBzdGlsbCBiZSBwZW5kaW5nIGluIG1lbXBvb2xcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZWNlaXB0LnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBjb25maXJtZWQgc3VjY2Vzc2Z1bGx5XHJcbiAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgICBhZGRyZXNzLFxyXG4gICAgICAgIHR4SGFzaCxcclxuICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRCxcclxuICAgICAgICByZWNlaXB0LmJsb2NrTnVtYmVyXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBDb25maXJtZWQnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBjb25maXJtZWQgaW4gYmxvY2sgJHtyZWNlaXB0LmJsb2NrTnVtYmVyfWAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiByZXZlcnRlZCAoc3RhdHVzID09PSAwKVxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICB0eEhhc2gsXHJcbiAgICAgICAgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsXHJcbiAgICAgICAgcmVjZWlwdC5ibG9ja051bWJlclxyXG4gICAgICApO1xyXG5cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gRmFpbGVkJyxcclxuICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gd2FzIHJldmVydGVkIG9uLWNoYWluJyxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBpbiBjb25maXJtYXRpb24gbW9uaXRvcmluZzonLCBlcnJvcik7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIC8vIEFsd2F5cyBjbGVhbiB1cCB0cmFja2luZ1xyXG4gICAgbW9uaXRvcmluZ1RyYW5zYWN0aW9ucy5kZWxldGUodHhIYXNoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IE1FU1NBR0UgU0lHTklORyBIQU5ETEVSUyA9PT09PVxyXG5cclxuLy8gSGFuZGxlIHBlcnNvbmFsX3NpZ24gKEVJUC0xOTEpIC0gU2lnbiBhIG1lc3NhZ2VcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUGVyc29uYWxTaWduKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpIHtcclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBzaWduIHJlcXVlc3RcclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVTaWduUmVxdWVzdChtZXRob2QsIHBhcmFtcyk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCBzaWduIHJlcXVlc3QgZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogLTMyNjAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3IpXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IG1lc3NhZ2UsIGFkZHJlc3MgfSA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBTRUNVUklUWTogQ2hlY2sgaWYgZXRoX3NpZ24gaXMgYWxsb3dlZCAoZGlzYWJsZWQgYnkgZGVmYXVsdClcclxuICBpZiAobWV0aG9kID09PSAnZXRoX3NpZ24nKSB7XHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoJ3NldHRpbmdzJyk7XHJcbiAgICBjb25zdCBhbGxvd0V0aFNpZ24gPSBzZXR0aW5ncz8uYWxsb3dFdGhTaWduIHx8IGZhbHNlO1xyXG5cclxuICAgIGlmICghYWxsb3dFdGhTaWduKSB7XHJcbiAgICAgIGNvbnNvbGUud2Fybign8J+rgCBldGhfc2lnbiByZXF1ZXN0IGJsb2NrZWQgKGRpc2FibGVkIGluIHNldHRpbmdzKTonLCBvcmlnaW4pO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ2V0aF9zaWduIGlzIGRpc2FibGVkIGZvciBzZWN1cml0eS4gVXNlIHBlcnNvbmFsX3NpZ24gaW5zdGVhZCwgb3IgZW5hYmxlIGV0aF9zaWduIGluIHdhbGxldCBzZXR0aW5ncy4nXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvZyB3YXJuaW5nIHdoZW4gZXRoX3NpZ24gaXMgdXNlZCAoZXZlbiB3aGVuIGVuYWJsZWQpXHJcbiAgICBjb25zb2xlLndhcm4oJ+KaoO+4jyBldGhfc2lnbiByZXF1ZXN0IGFwcHJvdmVkIGJ5IHNldHRpbmdzIGZyb206Jywgb3JpZ2luKTtcclxuICB9XHJcblxyXG4gIC8vIFZlcmlmeSB0aGUgYWRkcmVzcyBtYXRjaGVzIHRoZSBjb25uZWN0ZWQgYWNjb3VudFxyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICghd2FsbGV0IHx8IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0ZWQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCBjb25uZWN0ZWQgYWNjb3VudCdcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBtZXRob2QsXHJcbiAgICAgIHNpZ25SZXF1ZXN0OiB7IG1lc3NhZ2UsIGFkZHJlc3MgfSxcclxuICAgICAgYXBwcm92YWxUb2tlblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1zaWduJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH0mbWV0aG9kPSR7bWV0aG9kfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignU2lnbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2lnblR5cGVkRGF0YSAoRUlQLTcxMikgLSBTaWduIHR5cGVkIGRhdGFcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnblR5cGVkRGF0YShwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKSB7XHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgc2lnbiByZXF1ZXN0XHJcbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlU2lnblJlcXVlc3QobWV0aG9kLCBwYXJhbXMpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgc2lnbiB0eXBlZCBkYXRhIHJlcXVlc3QgZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogLTMyNjAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3IpXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IGFkZHJlc3MsIHR5cGVkRGF0YSB9ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIFZlcmlmeSB0aGUgYWRkcmVzcyBtYXRjaGVzIHRoZSBjb25uZWN0ZWQgYWNjb3VudFxyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICghd2FsbGV0IHx8IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0ZWQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCBjb25uZWN0ZWQgYWNjb3VudCdcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBtZXRob2QsXHJcbiAgICAgIHNpZ25SZXF1ZXN0OiB7IHR5cGVkRGF0YSwgYWRkcmVzcyB9LFxyXG4gICAgICBhcHByb3ZhbFRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXNpZ25UeXBlZCZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9Jm1ldGhvZD0ke21ldGhvZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2NTBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NpZ24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgbWVzc2FnZSBzaWduaW5nIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNlc3Npb25Ub2tlbikge1xyXG4gIGlmICghcGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRoZSByZXF1ZXN0JykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIGxldCBwYXNzd29yZCA9IG51bGw7XHJcbiAgbGV0IHNpZ25lciA9IG51bGw7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCBnZXQgcGFzc3dvcmRcclxuICAgIHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gVW5sb2NrIHdhbGxldCAoYXV0by11cGdyYWRlIGlmIG5lZWRlZClcclxuICAgIGNvbnN0IHVubG9ja1Jlc3VsdCA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNpZ25lciA9IHVubG9ja1Jlc3VsdC5zaWduZXI7XHJcblxyXG4gICAgbGV0IHNpZ25hdHVyZTtcclxuXHJcbiAgICAvLyBTaWduIGJhc2VkIG9uIG1ldGhvZFxyXG4gICAgaWYgKG1ldGhvZCA9PT0gJ3BlcnNvbmFsX3NpZ24nIHx8IG1ldGhvZCA9PT0gJ2V0aF9zaWduJykge1xyXG4gICAgICBzaWduYXR1cmUgPSBhd2FpdCBwZXJzb25hbFNpZ24oc2lnbmVyLCBzaWduUmVxdWVzdC5tZXNzYWdlKTtcclxuICAgIH0gZWxzZSBpZiAobWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykpIHtcclxuICAgICAgc2lnbmF0dXJlID0gYXdhaXQgc2lnblR5cGVkRGF0YShzaWduZXIsIHNpZ25SZXF1ZXN0LnR5cGVkRGF0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHNpZ25pbmcgbWV0aG9kOiAke21ldGhvZH1gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2cgc3VjY2Vzc2Z1bCBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgY29uc3Qgc2lnbmVyQWRkcmVzcyA9IGF3YWl0IHNpZ25lci5nZXRBZGRyZXNzKCk7XHJcbiAgICBhd2FpdCBsb2dTaWduaW5nT3BlcmF0aW9uKHtcclxuICAgICAgdHlwZTogbWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykgPyAndHlwZWRfZGF0YScgOiAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIGFkZHJlc3M6IHNpZ25lckFkZHJlc3MsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgd2FsbGV0VHlwZTogJ3NvZnR3YXJlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2lnbmF0dXJlIGdlbmVyYXRlZCBzdWNjZXNzZnVsbHlcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIE1lc3NhZ2Ugc2lnbmVkIGZvciBvcmlnaW46Jywgb3JpZ2luKTtcclxuXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiBzaWduYXR1cmUgfSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBzaWduYXR1cmUgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBzaWduaW5nIG1lc3NhZ2U6JywgZXJyb3IpO1xyXG5cclxuICAgIC8vIExvZyBmYWlsZWQgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnblJlcXVlc3QuYWRkcmVzcyB8fCAndW5rbm93bicsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlLFxyXG4gICAgICB3YWxsZXRUeXBlOiAnc29mdHdhcmUnXHJcbiAgICB9KTtcclxuXHJcbiAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIC8vIFNFQ1VSSVRZOiBDbGVhbiB1cCBzZW5zaXRpdmUgZGF0YSBmcm9tIG1lbW9yeVxyXG4gICAgaWYgKHBhc3N3b3JkKSB7XHJcbiAgICAgIGNvbnN0IHRlbXBPYmogPSB7IHBhc3N3b3JkIH07XHJcbiAgICAgIHNlY3VyZUNsZWFudXAodGVtcE9iaiwgWydwYXNzd29yZCddKTtcclxuICAgICAgcGFzc3dvcmQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHNpZ25lcikge1xyXG4gICAgICBzZWN1cmVDbGVhbnVwU2lnbmVyKHNpZ25lcik7XHJcbiAgICAgIHNpZ25lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogSGFuZGxlIExlZGdlciBzaWduYXR1cmUgYXBwcm92YWwgKHByZS1zaWduZWQgaW4gcG9wdXApXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMZWRnZXJTaWduQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2lnbmF0dXJlKSB7XHJcbiAgaWYgKCFwZW5kaW5nU2lnblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgbWV0aG9kLCBzaWduUmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1NpZ25SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW5cclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIExvZyBzdWNjZXNzZnVsIExlZGdlciBzaWduaW5nIG9wZXJhdGlvblxyXG4gICAgYXdhaXQgbG9nU2lnbmluZ09wZXJhdGlvbih7XHJcbiAgICAgIHR5cGU6IG1ldGhvZCAmJiBtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSA/ICd0eXBlZF9kYXRhJyA6ICdwZXJzb25hbF9zaWduJyxcclxuICAgICAgYWRkcmVzczogc2lnblJlcXVlc3Q/LmFkZHJlc3MgfHwgJ2xlZGdlcicsXHJcbiAgICAgIG9yaWdpbjogb3JpZ2luLFxyXG4gICAgICBtZXRob2Q6IG1ldGhvZCB8fCAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdoYXJkd2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNpZ25hdHVyZSBhbHJlYWR5IGNyZWF0ZWQgYnkgTGVkZ2VyIGluIHBvcHVwIC0ganVzdCBwYXNzIGl0IHRocm91Z2hcclxuICAgIGNvbnNvbGUubG9nKCfwn6uAIExlZGdlciBtZXNzYWdlIHNpZ25lZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiBzaWduYXR1cmUgfSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBzaWduYXR1cmUgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBwcm9jZXNzaW5nIExlZGdlciBzaWduYXR1cmU6JywgZXJyb3IpO1xyXG5cclxuICAgIC8vIExvZyBmYWlsZWQgc2lnbmluZyBvcGVyYXRpb25cclxuICAgIGF3YWl0IGxvZ1NpZ25pbmdPcGVyYXRpb24oe1xyXG4gICAgICB0eXBlOiBtZXRob2QgJiYgbWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykgPyAndHlwZWRfZGF0YScgOiAncGVyc29uYWxfc2lnbicsXHJcbiAgICAgIGFkZHJlc3M6IHNpZ25SZXF1ZXN0Py5hZGRyZXNzIHx8ICdsZWRnZXInLFxyXG4gICAgICBvcmlnaW46IG9yaWdpbixcclxuICAgICAgbWV0aG9kOiBtZXRob2QgfHwgJ3BlcnNvbmFsX3NpZ24nLFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXHJcbiAgICAgIHdhbGxldFR5cGU6ICdoYXJkd2FyZSdcclxuICAgIH0pO1xyXG5cclxuICAgIHJlamVjdChlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBzaWduIHJlcXVlc3QgZGV0YWlscyAoZm9yIHBvcHVwKVxyXG5mdW5jdGlvbiBnZXRTaWduUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICByZXR1cm4gcGVuZGluZ1NpZ25SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0cyBhbmQgcG9wdXBcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIC8vIFJlY2VpdmVkIG1lc3NhZ2VcclxuXHJcbiAgLy8gU0VDVVJJVFk6IERlZmluZSBtZXNzYWdlIHR5cGVzIHRoYXQgYXJlIHByaXZpbGVnZWQgKHBvcHVwLW9ubHkpLlxyXG4gIC8vIFRoZXNlIG11c3QgTk9UIGJlIGNhbGxhYmxlIGZyb20gY29udGVudCBzY3JpcHRzICh3aGljaCBydW4gb24gYXJiaXRyYXJ5IHdlYiBwYWdlcykuXHJcbiAgLy8gQXBwcm92YWwgcG9wdXBzIGFyZSBvcGVuZWQgdmlhIGNocm9tZS53aW5kb3dzLmNyZWF0ZSwgc28gdGhleSBkbyBoYXZlIHNlbmRlci50YWIg4oCUXHJcbiAgLy8gZGlzdGluZ3Vpc2ggdGhlbSBmcm9tIGNvbnRlbnQgc2NyaXB0cyBieSBjaGVja2luZyBzZW5kZXIudXJsIGFnYWluc3Qgb3VyIGV4dGVuc2lvbiBvcmlnaW4uXHJcbiAgY29uc3QgUFJJVklMRUdFRF9NRVNTQUdFUyA9IG5ldyBTZXQoW1xyXG4gICAgJ0NPTk5FQ1RJT05fQVBQUk9WQUwnLCAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnLCAnU0lHTl9BUFBST1ZBTCcsICdTSUdOX0FQUFJPVkFMX0xFREdFUicsXHJcbiAgICAnVE9LRU5fQUREX0FQUFJPVkFMJywgJ0NIQUlOX1NXSVRDSF9BUFBST1ZBTCcsICdDUkVBVEVfU0VTU0lPTicsICdJTlZBTElEQVRFX1NFU1NJT04nLCAnSU5WQUxJREFURV9BTExfU0VTU0lPTlMnLFxyXG4gICAgJ0RJU0NPTk5FQ1RfU0lURScsICdTQVZFX1RYJywgJ1NBVkVfQU5EX01PTklUT1JfVFgnLCAnQ0xFQVJfVFhfSElTVE9SWScsXHJcbiAgICAnU1BFRURfVVBfVFgnLCAnQ0FOQ0VMX1RYJywgJ1NQRUVEX1VQX1RYX0NPTVBMRVRFJywgJ0NBTkNFTF9UWF9DT01QTEVURScsXHJcbiAgICAnR0VUX1NJR05JTkdfQVVESVRfTE9HJywgJ0dFVF9UWF9ISVNUT1JZJywgJ0dFVF9QRU5ESU5HX1RYX0NPVU5UJywgJ0dFVF9QRU5ESU5HX1RYUycsXHJcbiAgICAnR0VUX1RYX0JZX0hBU0gnLCAnUkVGUkVTSF9UWF9TVEFUVVMnLCAnUkVCUk9BRENBU1RfVFgnLCAnR0VUX0NVUlJFTlRfR0FTX1BSSUNFJywgJ0FDVElWRV9XQUxMRVRfQ0hBTkdFRCcsXHJcbiAgICAnR0VUX0NPTk5FQ1RJT05fUkVRVUVTVCcsICdHRVRfQ09OTkVDVEVEX1NJVEVTJywgJ0dFVF9UUkFOU0FDVElPTl9SRVFVRVNUJyxcclxuICAgICdHRVRfU0lHTl9SRVFVRVNUJywgJ0dFVF9UT0tFTl9BRERfUkVRVUVTVCcsICdHRVRfQ0hBSU5fU1dJVENIX1JFUVVFU1QnXHJcbiAgXSk7XHJcblxyXG4gIGNvbnN0IGV4dGVuc2lvbk9yaWdpbiA9IGBjaHJvbWUtZXh0ZW5zaW9uOi8vJHtjaHJvbWUucnVudGltZS5pZH0vYDtcclxuICBjb25zdCBpc0Zyb21FeHRlbnNpb25QYWdlID0gdHlwZW9mIHNlbmRlci51cmwgPT09ICdzdHJpbmcnICYmIHNlbmRlci51cmwuc3RhcnRzV2l0aChleHRlbnNpb25PcmlnaW4pO1xyXG5cclxuICBpZiAoUFJJVklMRUdFRF9NRVNTQUdFUy5oYXMobWVzc2FnZS50eXBlKSAmJiAhaXNGcm9tRXh0ZW5zaW9uUGFnZSkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIFNFQ1VSSVRZOiBCbG9ja2VkIHByaXZpbGVnZWQgbWVzc2FnZSBmcm9tIGNvbnRlbnQgc2NyaXB0OicsIG1lc3NhZ2UudHlwZSwgc2VuZGVyLnVybCk7XHJcbiAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmF1dGhvcml6ZWQ6IHByaXZpbGVnZWQgbWVzc2FnZXMgbXVzdCBjb21lIGZyb20gZXh0ZW5zaW9uIHBhZ2VzJyB9KTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgKGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnV0FMTEVUX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaGFuZGxlV2FsbGV0UmVxdWVzdChtZXNzYWdlLCBzZW5kZXIpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyByZXNwb25zZVxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ09OTkVDVElPTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCBhcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGFwcHJvdmFsIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoYXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DT05ORUNUSU9OX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgcmVxdWVzdEluZm8gPSBnZXRDb25uZWN0aW9uUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdCBpbmZvXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DT05ORUNURURfU0lURVMnOlxyXG4gICAgICAgICAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBjb25uZWN0ZWQgc2l0ZXMnKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNpdGVzIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0RJU0NPTk5FQ1RfU0lURSc6XHJcbiAgICAgICAgICBhd2FpdCByZW1vdmVDb25uZWN0ZWRTaXRlKG1lc3NhZ2Uub3JpZ2luKTtcclxuICAgICAgICAgIGF3YWl0IG5vdGlmeUFjY291bnRzQ2hhbmdlZCgpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyBkaXNjb25uZWN0IGNvbmZpcm1hdGlvblxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdBQ1RJVkVfV0FMTEVUX0NIQU5HRUQnOlxyXG4gICAgICAgICAgYXdhaXQgbm90aWZ5QWNjb3VudHNDaGFuZ2VkKCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1RSQU5TQUNUSU9OX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHR4QXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkLCBtZXNzYWdlLnNlc3Npb25Ub2tlbiwgbWVzc2FnZS5nYXNQcmljZSwgbWVzc2FnZS5jdXN0b21Ob25jZSwgbWVzc2FnZS50eEhhc2gsIG1lc3NhZ2UudHhEZXRhaWxzKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eEFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDUkVBVEVfU0VTU0lPTic6XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uVG9rZW4gPSBhd2FpdCBjcmVhdGVTZXNzaW9uKG1lc3NhZ2UucGFzc3dvcmQsIG1lc3NhZ2Uud2FsbGV0SWQsIG1lc3NhZ2UuZHVyYXRpb25Ncyk7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNlc3Npb25Ub2tlbiB9KTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX1NFU1NJT04nOlxyXG4gICAgICAgICAgY29uc3QgaW52YWxpZGF0ZWQgPSBpbnZhbGlkYXRlU2Vzc2lvbihtZXNzYWdlLnNlc3Npb25Ub2tlbik7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBpbnZhbGlkYXRlZCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX0FMTF9TRVNTSU9OUyc6XHJcbiAgICAgICAgICBjb25zdCBjb3VudCA9IGludmFsaWRhdGVBbGxTZXNzaW9ucygpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgdHhSZXF1ZXN0SW5mbyA9IGdldFRyYW5zYWN0aW9uUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRyYW5zYWN0aW9uIHJlcXVlc3QgaW5mbzonLCB0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdUT0tFTl9BRERfQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgdG9rZW5BcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVRva2VuQWRkQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgYXBwcm92YWwgcmVzcG9uc2U6JywgdG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0hBSU5fU1dJVENIX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IGNoYWluU3dpdGNoUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ2hhaW5Td2l0Y2hBcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoY2hhaW5Td2l0Y2hSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NJR05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnbkFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlU2lnbkFwcHJvdmFsKFxyXG4gICAgICAgICAgICBtZXNzYWdlLnJlcXVlc3RJZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5hcHByb3ZlZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHNpZ24gYXBwcm92YWwgcmVzcG9uc2U6Jywgc2lnbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzaWduQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NJR05fQVBQUk9WQUxfTEVER0VSJzpcclxuICAgICAgICAgIGNvbnN0IGxlZGdlclNpZ25SZXN1bHQgPSBhd2FpdCBoYW5kbGVMZWRnZXJTaWduQXBwcm92YWwoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UucmVxdWVzdElkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFwcHJvdmVkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNpZ25hdHVyZVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgTGVkZ2VyIHNpZ24gYXBwcm92YWwgcmVzcG9uc2U6JywgbGVkZ2VyU2lnblJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UobGVkZ2VyU2lnblJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1NJR05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCBzaWduUmVxdWVzdEluZm8gPSBnZXRTaWduUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHNpZ24gcmVxdWVzdCBpbmZvOicsIHNpZ25SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoc2lnblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVE9LRU5fQUREX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgdG9rZW5SZXF1ZXN0SW5mbyA9IGdldFRva2VuQWRkUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRva2VuIGFkZCByZXF1ZXN0IGluZm86JywgdG9rZW5SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodG9rZW5SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NIQUlOX1NXSVRDSF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IGNoYWluU3dpdGNoSW5mbyA9IGF3YWl0IGdldENoYWluU3dpdGNoUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoY2hhaW5Td2l0Y2hJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAvLyBTaWduaW5nIEF1ZGl0IExvZ1xyXG4gICAgICAgIGNhc2UgJ0dFVF9TSUdOSU5HX0FVRElUX0xPRyc6XHJcbiAgICAgICAgICBjb25zdCBzaWduaW5nTG9nID0gYXdhaXQgZ2V0U2lnbmluZ0F1ZGl0TG9nKCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBsb2c6IHNpZ25pbmdMb2cgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy8gVHJhbnNhY3Rpb24gSGlzdG9yeVxyXG4gICAgICAgIGNhc2UgJ0dFVF9UWF9ISVNUT1JZJzpcclxuICAgICAgICAgIGNvbnN0IHR4SGlzdG9yeUxpc3QgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhIaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbnM6IHR4SGlzdG9yeUxpc3QgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnOlxyXG4gICAgICAgICAgY29uc3QgcGVuZGluZ0NvdW50ID0gYXdhaXQgdHhIaXN0b3J5LmdldFBlbmRpbmdUeENvdW50KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBjb3VudDogcGVuZGluZ0NvdW50IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9QRU5ESU5HX1RYUyc6XHJcbiAgICAgICAgICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgdHhIaXN0b3J5LmdldFBlbmRpbmdUeHMobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uczogcGVuZGluZ1R4cyB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVFhfQllfSEFTSCc6XHJcbiAgICAgICAgICBjb25zdCB0eERldGFpbCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHhIYXNoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uOiB0eERldGFpbCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTQVZFX1RYJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHJhbnNhY3Rpb24pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTQVZFX0FORF9NT05JVE9SX1RYJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHJhbnNhY3Rpb24pO1xyXG5cclxuICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgZm9yIGNvbmZpcm1hdGlvbiBpbiBiYWNrZ3JvdW5kXHJcbiAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBtZXNzYWdlLnRyYW5zYWN0aW9uLm5ldHdvcmsgfHwgJ3B1bHNlY2hhaW5UZXN0bmV0JztcclxuICAgICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgICAgICAgICBjb25zdCB0eCA9IHsgaGFzaDogbWVzc2FnZS50cmFuc2FjdGlvbi5oYXNoIH07XHJcbiAgICAgICAgICAgICAgYXdhaXQgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbW9uaXRvcmluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDTEVBUl9UWF9ISVNUT1JZJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5jbGVhclR4SGlzdG9yeShtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ1VSUkVOVF9HQVNfUFJJQ0UnOlxyXG4gICAgICAgICAgY29uc3QgZ2FzUHJpY2VSZXN1bHQgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29ya0dhc1ByaWNlKG1lc3NhZ2UubmV0d29yayk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoZ2FzUHJpY2VSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1JFRlJFU0hfVFhfU1RBVFVTJzpcclxuICAgICAgICAgIGNvbnN0IHJlZnJlc2hSZXN1bHQgPSBhd2FpdCByZWZyZXNoVHJhbnNhY3Rpb25TdGF0dXMoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UubmV0d29ya1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZWZyZXNoUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdSRUJST0FEQ0FTVF9UWCc6XHJcbiAgICAgICAgICBjb25zdCByZWJyb2FkY2FzdFJlc3VsdCA9IGF3YWl0IHJlYnJvYWRjYXN0VHJhbnNhY3Rpb24oXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLm5ldHdvcmtcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVicm9hZGNhc3RSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NQRUVEX1VQX1RYJzpcclxuICAgICAgICAgIGNvbnN0IHNwZWVkVXBSZXN1bHQgPSBhd2FpdCBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24oXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2Vzc2lvblRva2VuLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmdhc1ByaWNlTXVsdGlwbGllciB8fCAxLjIsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuY3VzdG9tR2FzUHJpY2UgfHwgbnVsbFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzcGVlZFVwUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDQU5DRUxfVFgnOlxyXG4gICAgICAgICAgY29uc3QgY2FuY2VsUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2Vzc2lvblRva2VuLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmN1c3RvbUdhc1ByaWNlIHx8IG51bGxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoY2FuY2VsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTUEVFRF9VUF9UWF9DT01QTEVURSc6XHJcbiAgICAgICAgICAvLyBUcmFuc2FjdGlvbiB3YXMgYWxyZWFkeSBzaWduZWQgYW5kIGJyb2FkY2FzdCBpbiBwb3B1cCAtIGp1c3Qgc2F2ZSB0byBoaXN0b3J5XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgbmV3IHRyYW5zYWN0aW9uIHRvIGhpc3RvcnlcclxuICAgICAgICAgICAgY29uc3QgaGlzdG9yeUVudHJ5ID0ge1xyXG4gICAgICAgICAgICAgIGhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoLFxyXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgICAgICAgICBmcm9tOiBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgdG86IG1lc3NhZ2UudHhEZXRhaWxzLnRvLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBtZXNzYWdlLnR4RGV0YWlscy52YWx1ZSxcclxuICAgICAgICAgICAgICBkYXRhOiBtZXNzYWdlLnR4RGV0YWlscy5kYXRhIHx8ICcweCcsXHJcbiAgICAgICAgICAgICAgZ2FzUHJpY2U6IG1lc3NhZ2UudHhEZXRhaWxzLmdhc1ByaWNlLFxyXG4gICAgICAgICAgICAgIGdhc0xpbWl0OiBtZXNzYWdlLnR4RGV0YWlscy5nYXNMaW1pdCxcclxuICAgICAgICAgICAgICBub25jZTogbWVzc2FnZS50eERldGFpbHMubm9uY2UsXHJcbiAgICAgICAgICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgICAgICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICAgICAgICB0eXBlOiB0eEhpc3RvcnkuVFhfVFlQRVMuQ09OVFJBQ1RcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICAgICAgICBoaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4RmVlUGVyR2FzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR4RGV0YWlscy5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBoaXN0b3J5RW50cnkpO1xyXG5cclxuICAgICAgICAgICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyByZXBsYWNlZFxyXG4gICAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLm9yaWdpbmFsVHhIYXNoLCB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCwgbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFydCBtb25pdG9yaW5nIG5ldyB0cmFuc2FjdGlvblxyXG4gICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgICAgICAgd2FpdEZvckNvbmZpcm1hdGlvbih7IGhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoIH0sIHByb3ZpZGVyLCBtZXNzYWdlLmFkZHJlc3MpO1xyXG5cclxuICAgICAgICAgICAgLy8gTm90aWZpY2F0aW9uXHJcbiAgICAgICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNwZWQgVXAnLFxyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IGBOZXcgVFg6ICR7bWVzc2FnZS5uZXdUeEhhc2guc2xpY2UoMCwgMjApfS4uLmAsXHJcbiAgICAgICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IG1lc3NhZ2UubmV3VHhIYXNoIH0pO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2F2aW5nIHNwZWVkLXVwIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NBTkNFTF9UWF9DT01QTEVURSc6XHJcbiAgICAgICAgICAvLyBDYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gd2FzIGFscmVhZHkgc2lnbmVkIGFuZCBicm9hZGNhc3QgaW4gcG9wdXAgLSBqdXN0IHNhdmUgdG8gaGlzdG9yeVxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTYXZlIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiB0byBoaXN0b3J5XHJcbiAgICAgICAgICAgIGNvbnN0IGNhbmNlbEhpc3RvcnlFbnRyeSA9IHtcclxuICAgICAgICAgICAgICBoYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCxcclxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgICAgICAgZnJvbTogbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICAgIHRvOiBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgdmFsdWU6ICcwJyxcclxuICAgICAgICAgICAgICBkYXRhOiAnMHgnLFxyXG4gICAgICAgICAgICAgIGdhc1ByaWNlOiBtZXNzYWdlLnR4RGV0YWlscy5nYXNQcmljZSxcclxuICAgICAgICAgICAgICBnYXNMaW1pdDogJzIxMDAwJyxcclxuICAgICAgICAgICAgICBub25jZTogbWVzc2FnZS50eERldGFpbHMubm9uY2UsXHJcbiAgICAgICAgICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgICAgICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgICAgICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgICAgICAgICB0eXBlOiAnc2VuZCdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR4RGV0YWlscy5tYXhGZWVQZXJHYXMpIHtcclxuICAgICAgICAgICAgICBjYW5jZWxIaXN0b3J5RW50cnkubWF4RmVlUGVyR2FzID0gbWVzc2FnZS50eERldGFpbHMubWF4RmVlUGVyR2FzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR4RGV0YWlscy5tYXhQcmlvcml0eUZlZVBlckdhcykge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEhpc3RvcnlFbnRyeS5tYXhQcmlvcml0eUZlZVBlckdhcyA9IG1lc3NhZ2UudHhEZXRhaWxzLm1heFByaW9yaXR5RmVlUGVyR2FzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBjYW5jZWxIaXN0b3J5RW50cnkpO1xyXG5cclxuICAgICAgICAgICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyBjYW5jZWxsZWQvZmFpbGVkXHJcbiAgICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2Uub3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uXHJcbiAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgICAgICAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHsgaGFzaDogbWVzc2FnZS5uZXdUeEhhc2ggfSwgcHJvdmlkZXIsIG1lc3NhZ2UuYWRkcmVzcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZmljYXRpb25cclxuICAgICAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ2FuY2VsbGVkJyxcclxuICAgICAgICAgICAgICBtZXNzYWdlOiAnQ2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHNlbnQnLFxyXG4gICAgICAgICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiBtZXNzYWdlLm5ld1R4SGFzaCB9KTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNhdmluZyBjYW5jZWwgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVVBEQVRFX1JQQ19QUklPUklUSUVTJzpcclxuICAgICAgICAgIC8vIFVwZGF0ZSBSUEMgcHJpb3JpdGllcyBpbiB0aGUgcnBjIG1vZHVsZVxyXG4gICAgICAgICAgaWYgKG1lc3NhZ2UubmV0d29yayAmJiBtZXNzYWdlLnByaW9yaXRpZXMpIHtcclxuICAgICAgICAgICAgcnBjLnVwZGF0ZVJwY1ByaW9yaXRpZXMobWVzc2FnZS5uZXR3b3JrLCBtZXNzYWdlLnByaW9yaXRpZXMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg8J+rgCBVcGRhdGVkIFJQQyBwcmlvcml0aWVzIGZvciAke21lc3NhZ2UubmV0d29ya31gKTtcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgbmV0d29yayBvciBwcmlvcml0aWVzJyB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgVW5rbm93biBtZXNzYWdlIHR5cGU6JywgbWVzc2FnZS50eXBlKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Vua25vd24gbWVzc2FnZSB0eXBlJyB9KTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBoYW5kbGluZyBtZXNzYWdlOicsIGVycm9yKTtcclxuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgfVxyXG4gIH0pKCk7XHJcblxyXG4gIHJldHVybiB0cnVlOyAvLyBLZWVwIG1lc3NhZ2UgY2hhbm5lbCBvcGVuIGZvciBhc3luYyByZXNwb25zZVxyXG59KTtcclxuXHJcbmNvbnNvbGUubG9nKCfwn6uAIEhlYXJ0V2FsbGV0IHNlcnZpY2Ugd29ya2VyIHJlYWR5Jyk7XHJcbiJdLCJuYW1lcyI6WyJldGhlcnMuZ2V0QWRkcmVzcyIsImV0aGVycy5nZXRCeXRlcyIsImV0aGVycy50b1V0ZjhTdHJpbmciLCJldGhlcnMuaXNBZGRyZXNzIiwicnBjLmdldEJsb2NrTnVtYmVyIiwicnBjLmdldEJsb2NrQnlOdW1iZXIiLCJycGMuZ2V0QmFsYW5jZSIsInJwYy5nZXRUcmFuc2FjdGlvbkNvdW50IiwicnBjLmdldEdhc1ByaWNlIiwicnBjLmVzdGltYXRlR2FzIiwicnBjLmNhbGwiLCJycGMuc2VuZFJhd1RyYW5zYWN0aW9uIiwicnBjLmdldFRyYW5zYWN0aW9uUmVjZWlwdCIsInJwYy5nZXRUcmFuc2FjdGlvbkJ5SGFzaCIsInJwYy5nZXRQcm92aWRlciIsInR4SGlzdG9yeS5UWF9TVEFUVVMiLCJ0eEhpc3RvcnkuVFhfVFlQRVMiLCJ0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkiLCJycGMuZ2V0RWlwMTU1OUZlZXMiLCJ0eEhpc3RvcnkuZ2V0VHhCeUhhc2giLCJ0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMiLCJycGMuZ2V0R2FzUHJpY2VSZWNvbW1lbmRhdGlvbnMiLCJycGMuZ2V0UmF3VHJhbnNhY3Rpb24iLCJycGMuYnJvYWRjYXN0VG9BbGxScGNzIiwidHhIaXN0b3J5LmdldFR4SGlzdG9yeSIsInR4SGlzdG9yeS5nZXRQZW5kaW5nVHhDb3VudCIsInR4SGlzdG9yeS5nZXRQZW5kaW5nVHhzIiwidHhIaXN0b3J5LmNsZWFyVHhIaXN0b3J5IiwicnBjLnVwZGF0ZVJwY1ByaW9yaXRpZXMiXSwibWFwcGluZ3MiOiI7QUFRQSxNQUFNLGlCQUFpQjtBQUN2QixNQUFNLDBCQUEwQjtBQUNoQyxNQUFNLHNCQUFzQjtBQUdyQixNQUFNLFdBQVc7QUFBQSxFQUV0QixVQUFVO0FBRVo7QUFHTyxNQUFNLFlBQVk7QUFBQSxFQUN2QixTQUFTO0FBQUEsRUFDVCxXQUFXO0FBQUEsRUFDWCxRQUFRO0FBQ1Y7QUFLTyxlQUFlLHVCQUF1QjtBQUMzQyxRQUFNLFdBQVcsTUFBTSxLQUFLLHVCQUF1QjtBQUNuRCxTQUFPLFlBQVk7QUFBQSxJQUNqQixTQUFTO0FBQUE7QUFBQSxJQUNULGFBQWE7QUFBQTtBQUFBLEVBQ2pCO0FBQ0E7QUFLQSxlQUFlLGdCQUFnQjtBQUM3QixRQUFNLFVBQVUsTUFBTSxLQUFLLGNBQWM7QUFDekMsU0FBTyxXQUFXLENBQUE7QUFDcEI7QUFLQSxlQUFlLGVBQWUsU0FBUztBQUNyQyxRQUFNLEtBQUssZ0JBQWdCLE9BQU87QUFDcEM7QUFLTyxlQUFlLGFBQWEsU0FBUztBQUMxQyxRQUFNLFdBQVcsTUFBTTtBQUN2QixNQUFJLENBQUMsU0FBUyxTQUFTO0FBQ3JCLFdBQU87RUFDVDtBQUVBLFFBQU0sVUFBVSxNQUFNO0FBQ3RCLFFBQU0sZUFBZSxRQUFRO0FBRTdCLE1BQUksQ0FBQyxRQUFRLFlBQVksR0FBRztBQUMxQixXQUFPO0VBQ1Q7QUFFQSxTQUFPLFFBQVEsWUFBWSxFQUFFLGdCQUFnQixDQUFBO0FBQy9DO0FBS08sZUFBZSxlQUFlLFNBQVMsUUFBUTtBQUNwRCxRQUFNLFdBQVcs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
