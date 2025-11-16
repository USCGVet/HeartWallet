import { l as load, s as save, H as getAddress, B as getBytes, D as toUtf8String, i as isAddress, g as getProvider, u as unlockWallet, y as getSafeGasPrice, b as getActiveWallet, J as getTransactionByHash, K as getTransactionReceipt, L as sendRawTransaction, q as getGasPrice, z as estimateGas, M as call, n as getTransactionCount, j as getBalance, N as getBlockByNumber, O as getBlockNumber } from "./rpc.js";
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
  const settings = await load("settings");
  const maxGasPriceGwei = settings?.maxGasPriceGwei || 1e3;
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
    const { signer, upgraded, iterationsBefore, iterationsAfter } = await unlockWallet(password, {
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
async function handleSpeedUpTransaction(address, originalTxHash, sessionToken, gasPriceMultiplier = 1.2, customGasPrice = null) {
  try {
    const password = await validateSession(sessionToken);
    const originalTx = await getTxByHash(address, originalTxHash);
    if (!originalTx) {
      return { success: false, error: "Transaction not found" };
    }
    if (originalTx.status !== TX_STATUS.PENDING) {
      return { success: false, error: "Transaction is not pending" };
    }
    const { signer } = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
    const network = originalTx.network;
    const provider = await getProvider(network);
    const wallet = signer.connect(provider);
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
  }
}
async function handleCancelTransaction(address, originalTxHash, sessionToken, customGasPrice = null) {
  try {
    const password = await validateSession(sessionToken);
    const originalTx = await getTxByHash(address, originalTxHash);
    if (!originalTx) {
      return { success: false, error: "Transaction not found" };
    }
    if (originalTx.status !== TX_STATUS.PENDING) {
      return { success: false, error: "Transaction is not pending" };
    }
    const { signer } = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
    const network = originalTx.network;
    const provider = await getProvider(network);
    const wallet = signer.connect(provider);
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
  try {
    const password = await validateSession(sessionToken);
    const { signer } = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
    let signature;
    if (method === "personal_sign" || method === "eth_sign") {
      signature = await personalSign(signer, signRequest.message);
    } else if (method.startsWith("eth_signTypedData")) {
      signature = await signTypedData(signer, signRequest.typedData);
    } else {
      throw new Error(`Unsupported signing method: ${method}`);
    }
    console.log("🫀 Message signed for origin:", origin);
    resolve({ result: signature });
    return { success: true, signature };
  } catch (error) {
    console.error("🫀 Error signing message:", error);
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
        case "SIGN_APPROVAL":
          const signApprovalResult = await handleSignApproval(
            message.requestId,
            message.approved,
            message.sessionToken
          );
          console.log("🫀 Sending sign approval response:", signApprovalResult);
          sendResponse(signApprovalResult);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeEhpc3RvcnlTZXR0aW5ncyhzZXR0aW5ncykge1xyXG4gIGF3YWl0IHNhdmUoVFhfSElTVE9SWV9TRVRUSU5HU19LRVksIHNldHRpbmdzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QWxsSGlzdG9yeSgpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgbG9hZChUWF9ISVNUT1JZX0tFWSk7XHJcbiAgcmV0dXJuIGhpc3RvcnkgfHwge307XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYXZlIGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KSB7XHJcbiAgYXdhaXQgc2F2ZShUWF9ISVNUT1JZX0tFWSwgaGlzdG9yeSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYSBzcGVjaWZpYyBhZGRyZXNzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGdldFR4SGlzdG9yeVNldHRpbmdzKCk7XHJcbiAgaWYgKCFzZXR0aW5ncy5lbmFibGVkKSB7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCFoaXN0b3J5W2FkZHJlc3NMb3dlcl0pIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIHJldHVybiBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zIHx8IFtdO1xyXG59XHJcblxyXG4vKipcclxuICogQWRkIGEgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIHR4RGF0YSkge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybjsgLy8gSGlzdG9yeSBkaXNhYmxlZFxyXG4gIH1cclxuXHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIC8vIEluaXRpYWxpemUgYWRkcmVzcyBoaXN0b3J5IGlmIGRvZXNuJ3QgZXhpc3RcclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgaGlzdG9yeVthZGRyZXNzTG93ZXJdID0geyB0cmFuc2FjdGlvbnM6IFtdIH07XHJcbiAgfVxyXG5cclxuICAvLyBBZGQgbmV3IHRyYW5zYWN0aW9uIGF0IGJlZ2lubmluZyAobmV3ZXN0IGZpcnN0KVxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMudW5zaGlmdCh7XHJcbiAgICBoYXNoOiB0eERhdGEuaGFzaCxcclxuICAgIHRpbWVzdGFtcDogdHhEYXRhLnRpbWVzdGFtcCB8fCBEYXRlLm5vdygpLFxyXG4gICAgZnJvbTogdHhEYXRhLmZyb20udG9Mb3dlckNhc2UoKSxcclxuICAgIHRvOiB0eERhdGEudG8gPyB0eERhdGEudG8udG9Mb3dlckNhc2UoKSA6IG51bGwsXHJcbiAgICB2YWx1ZTogdHhEYXRhLnZhbHVlIHx8ICcwJyxcclxuICAgIGRhdGE6IHR4RGF0YS5kYXRhIHx8ICcweCcsXHJcbiAgICBnYXNQcmljZTogdHhEYXRhLmdhc1ByaWNlLFxyXG4gICAgZ2FzTGltaXQ6IHR4RGF0YS5nYXNMaW1pdCxcclxuICAgIG5vbmNlOiB0eERhdGEubm9uY2UsXHJcbiAgICBuZXR3b3JrOiB0eERhdGEubmV0d29yayxcclxuICAgIHN0YXR1czogdHhEYXRhLnN0YXR1cyB8fCBUWF9TVEFUVVMuUEVORElORyxcclxuICAgIGJsb2NrTnVtYmVyOiB0eERhdGEuYmxvY2tOdW1iZXIgfHwgbnVsbCxcclxuICAgIHR5cGU6IHR4RGF0YS50eXBlIHx8IFRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgfSk7XHJcblxyXG4gIC8vIEVuZm9yY2UgbWF4IGxpbWl0IChGSUZPIC0gcmVtb3ZlIG9sZGVzdClcclxuICBpZiAoaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5sZW5ndGggPiBNQVhfVFhTX1BFUl9BRERSRVNTKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5zbGljZSgwLCBNQVhfVFhTX1BFUl9BRERSRVNTKTtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIGFkZGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdHJhbnNhY3Rpb24gc3RhdHVzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgdHhIYXNoLCBzdGF0dXMsIGJsb2NrTnVtYmVyID0gbnVsbCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdHhJbmRleCA9IGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMuZmluZEluZGV4KFxyXG4gICAgdHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKVxyXG4gICk7XHJcblxyXG4gIGlmICh0eEluZGV4ID09PSAtMSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9uc1t0eEluZGV4XS5zdGF0dXMgPSBzdGF0dXM7XHJcbiAgaWYgKGJsb2NrTnVtYmVyICE9PSBudWxsKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLmJsb2NrTnVtYmVyID0gYmxvY2tOdW1iZXI7XHJcbiAgfVxyXG5cclxuICBhd2FpdCBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KTtcclxuICAvLyBUcmFuc2FjdGlvbiBzdGF0dXMgdXBkYXRlZFxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHBlbmRpbmcgdHJhbnNhY3Rpb25zIGZvciBhbiBhZGRyZXNzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKSB7XHJcbiAgY29uc3QgdHhzID0gYXdhaXQgZ2V0VHhIaXN0b3J5KGFkZHJlc3MpO1xyXG4gIHJldHVybiB0eHMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gVFhfU1RBVFVTLlBFTkRJTkcpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHBlbmRpbmcgdHJhbnNhY3Rpb24gY291bnQgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhDb3VudChhZGRyZXNzKSB7XHJcbiAgY29uc3QgcGVuZGluZ1R4cyA9IGF3YWl0IGdldFBlbmRpbmdUeHMoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHBlbmRpbmdUeHMubGVuZ3RoO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGJ5IGhhc2hcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEJ5SGFzaChhZGRyZXNzLCB0eEhhc2gpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maW5kKHR4ID0+IHR4Lmhhc2gudG9Mb3dlckNhc2UoKSA9PT0gdHhIYXNoLnRvTG93ZXJDYXNlKCkpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2xlYXIgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnkgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclR4SGlzdG9yeShhZGRyZXNzKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0pIHtcclxuICAgIGRlbGV0ZSBoaXN0b3J5W2FkZHJlc3NMb3dlcl07XHJcbiAgICBhd2FpdCBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KTtcclxuICAgIC8vIFRyYW5zYWN0aW9uIGhpc3RvcnkgY2xlYXJlZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENsZWFyIGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5IChhbGwgYWRkcmVzc2VzKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQWxsVHhIaXN0b3J5KCkge1xyXG4gIGF3YWl0IHNhdmUoVFhfSElTVE9SWV9LRVksIHt9KTtcclxuICAvLyBBbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeHBvcnQgdHJhbnNhY3Rpb24gaGlzdG9yeSBhcyBKU09OIChmb3IgZGVidWdnaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFR4SGlzdG9yeShhZGRyZXNzKSB7XHJcbiAgY29uc3QgdHhzID0gYXdhaXQgZ2V0VHhIaXN0b3J5KGFkZHJlc3MpO1xyXG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh0eHMsIG51bGwsIDIpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBjb3JlL3R4VmFsaWRhdGlvbi5qc1xyXG4gKlxyXG4gKiBUcmFuc2FjdGlvbiB2YWxpZGF0aW9uIHV0aWxpdGllcyBmb3Igc2VjdXJpdHlcclxuICogVmFsaWRhdGVzIGFsbCB0cmFuc2FjdGlvbiBwYXJhbWV0ZXJzIGJlZm9yZSBwcm9jZXNzaW5nXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSB0cmFuc2FjdGlvbiByZXF1ZXN0IGZyb20gYSBkQXBwXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eFJlcXVlc3QgLSBUcmFuc2FjdGlvbiByZXF1ZXN0IG9iamVjdFxyXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4R2FzUHJpY2VHd2VpIC0gTWF4aW11bSBhbGxvd2VkIGdhcyBwcmljZSBpbiBHd2VpIChkZWZhdWx0IDEwMDApXHJcbiAqIEByZXR1cm5zIHt7IHZhbGlkOiBib29sZWFuLCBlcnJvcnM6IHN0cmluZ1tdLCBzYW5pdGl6ZWQ6IE9iamVjdCB9fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0KHR4UmVxdWVzdCwgbWF4R2FzUHJpY2VHd2VpID0gMTAwMCkge1xyXG4gIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gIGNvbnN0IHNhbml0aXplZCA9IHt9O1xyXG5cclxuICAvLyBWYWxpZGF0ZSAndG8nIGFkZHJlc3MgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QudG8gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudG8gIT09IG51bGwpIHtcclxuICAgIGlmICh0eXBlb2YgdHhSZXF1ZXN0LnRvICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC50bykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTm9ybWFsaXplIHRvIGNoZWNrc3VtIGFkZHJlc3NcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQudG8gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QudG8pO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2Zyb20nIGFkZHJlc3MgaWYgcHJlc2VudCAoc2hvdWxkIG1hdGNoIHdhbGxldCBhZGRyZXNzKVxyXG4gIGlmICh0eFJlcXVlc3QuZnJvbSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5mcm9tICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5mcm9tICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleEFkZHJlc3ModHhSZXF1ZXN0LmZyb20pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQuZnJvbSA9IGV0aGVycy5nZXRBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3ZhbHVlJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QudmFsdWUgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudmFsdWUgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC52YWx1ZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB2YWx1ZUJpZ0ludCA9IEJpZ0ludCh0eFJlcXVlc3QudmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZUJpZ0ludCA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQudmFsdWUgPSB0eFJlcXVlc3QudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHNhbml0aXplZC52YWx1ZSA9ICcweDAnOyAvLyBEZWZhdWx0IHRvIDBcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdkYXRhJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5kYXRhICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5kYXRhICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleERhdGEodHhSZXF1ZXN0LmRhdGEpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImRhdGFcIiBmaWVsZCBtdXN0IGJlIHZhbGlkIGhleCBkYXRhJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzYW5pdGl6ZWQuZGF0YSA9IHR4UmVxdWVzdC5kYXRhO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQuZGF0YSA9ICcweCc7IC8vIERlZmF1bHQgdG8gZW1wdHkgZGF0YVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2dhcycgb3IgJ2dhc0xpbWl0JyBmaWVsZFxyXG4gIC8vIFNFQ1VSSVRZOiBSZWFzb25hYmxlIG1heGltdW0gaXMgMTBNIGdhcyB0byBwcmV2ZW50IGZlZSBzY2Ftc1xyXG4gIC8vIE1vc3QgdHJhbnNhY3Rpb25zOiAyMWstMjAwayBnYXMuIENvbXBsZXggRGVGaTogMjAway0xTSBnYXMuXHJcbiAgLy8gRXRoZXJldW0vUHVsc2VDaGFpbiBibG9jayBsaW1pdCBpcyB+MzBNLCBidXQgc2luZ2xlIFRYIHJhcmVseSBuZWVkcyA+MTBNXHJcbiAgaWYgKHR4UmVxdWVzdC5nYXMgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNMaW1pdCA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzKTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBsb3cgKG1pbmltdW0gMjEwMDApJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnYXNMaW1pdCA+IDEwMDAwMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgbGltaXQgdG9vIGhpZ2ggKG1heGltdW0gMTAwMDAwMDApLiBNb3N0IHRyYW5zYWN0aW9ucyBuZWVkIDwxTSBnYXMuJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXMgPSB0eFJlcXVlc3QuZ2FzO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzTGltaXQgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzTGltaXQgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5nYXNMaW1pdCkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNMaW1pdCA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzTGltaXQpO1xyXG4gICAgICAgIGlmIChnYXNMaW1pdCA8IDIxMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAxMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGhpZ2ggKG1heGltdW0gMTAwMDAwMDApLiBNb3N0IHRyYW5zYWN0aW9ucyBuZWVkIDwxTSBnYXMuJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNMaW1pdCA9IHR4UmVxdWVzdC5nYXNMaW1pdDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdnYXNQcmljZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzUHJpY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZ2FzUHJpY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5nYXNQcmljZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBnYXNQcmljZSA9IEJpZ0ludCh0eFJlcXVlc3QuZ2FzUHJpY2UpO1xyXG4gICAgICAgIGNvbnN0IG1heEdhc1ByaWNlV2VpID0gQmlnSW50KG1heEdhc1ByaWNlR3dlaSkgKiBCaWdJbnQoJzEwMDAwMDAwMDAnKTsgLy8gQ29udmVydCBHd2VpIHRvIFdlaVxyXG4gICAgICAgIGlmIChnYXNQcmljZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNQcmljZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzUHJpY2UgPiBtYXhHYXNQcmljZVdlaSkge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goYEludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBleGNlZWRzIG1heGltdW0gb2YgJHttYXhHYXNQcmljZUd3ZWl9IEd3ZWlgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLmdhc1ByaWNlID0gdHhSZXF1ZXN0Lmdhc1ByaWNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ25vbmNlJyBmaWVsZCBpZiBwcmVzZW50XHJcbiAgaWYgKHR4UmVxdWVzdC5ub25jZSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5ub25jZSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGV4VmFsdWUodHhSZXF1ZXN0Lm5vbmNlKSAmJiB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlICE9PSAnbnVtYmVyJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGZpZWxkIG11c3QgYmUgYSB2YWxpZCBudW1iZXIgb3IgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBub25jZSA9IHR5cGVvZiB0eFJlcXVlc3Qubm9uY2UgPT09ICdzdHJpbmcnIFxyXG4gICAgICAgICAgPyBCaWdJbnQodHhSZXF1ZXN0Lm5vbmNlKSBcclxuICAgICAgICAgIDogQmlnSW50KHR4UmVxdWVzdC5ub25jZSk7XHJcbiAgICAgICAgaWYgKG5vbmNlIDwgMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgY2Fubm90IGJlIG5lZ2F0aXZlJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChub25jZSA+IEJpZ0ludCgnOTAwNzE5OTI1NDc0MDk5MScpKSB7IC8vIEphdmFTY3JpcHQgc2FmZSBpbnRlZ2VyIG1heFxyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyB1bnJlYXNvbmFibHkgaGlnaCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQubm9uY2UgPSB0eFJlcXVlc3Qubm9uY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBUcmFuc2FjdGlvbiBtdXN0IGhhdmUgZWl0aGVyICd0bycgb3IgJ2RhdGEnIChjb250cmFjdCBjcmVhdGlvbilcclxuICBpZiAoIXNhbml0aXplZC50byAmJiAoIXNhbml0aXplZC5kYXRhIHx8IHNhbml0aXplZC5kYXRhID09PSAnMHgnKSkge1xyXG4gICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IG11c3QgaGF2ZSBcInRvXCIgYWRkcmVzcyBvciBcImRhdGFcIiBmb3IgY29udHJhY3QgY3JlYXRpb24nKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICB2YWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCxcclxuICAgIGVycm9ycyxcclxuICAgIHNhbml0aXplZFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYW4gRXRoZXJldW0gYWRkcmVzcyAoaGV4IGZvcm1hdClcclxuICogQHBhcmFtIHtzdHJpbmd9IGFkZHJlc3MgLSBBZGRyZXNzIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleEFkZHJlc3MoYWRkcmVzcykge1xyXG4gIGlmICh0eXBlb2YgYWRkcmVzcyAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDQyIGNoYXJhY3RlcnM6IDB4ICsgNDAgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl17NDB9JC8udGVzdChhZGRyZXNzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhIGhleCB2YWx1ZSAoZm9yIGFtb3VudHMsIGdhcywgZXRjLilcclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gSGV4IHZhbHVlIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleFZhbHVlKHZhbHVlKSB7XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IHN0YXJ0IHdpdGggMHggYW5kIGNvbnRhaW4gb25seSBoZXggZGlnaXRzXHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSskLy50ZXN0KHZhbHVlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBoZXggZGF0YSAoZm9yIHRyYW5zYWN0aW9uIGRhdGEgZmllbGQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhIC0gSGV4IGRhdGEgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBpc1ZhbGlkSGV4RGF0YShkYXRhKSB7XHJcbiAgaWYgKHR5cGVvZiBkYXRhICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIE11c3QgYmUgMHggb3IgMHggZm9sbG93ZWQgYnkgZXZlbiBudW1iZXIgb2YgaGV4IGRpZ2l0c1xyXG4gIGlmIChkYXRhID09PSAnMHgnKSByZXR1cm4gdHJ1ZTtcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdKiQvLnRlc3QoZGF0YSkgJiYgZGF0YS5sZW5ndGggJSAyID09PSAwO1xyXG59XHJcblxyXG4vKipcclxuICogU2FuaXRpemVzIGFuIGVycm9yIG1lc3NhZ2UgZm9yIHNhZmUgZGlzcGxheVxyXG4gKiBSZW1vdmVzIGFueSBIVE1MLCBzY3JpcHRzLCBhbmQgY29udHJvbCBjaGFyYWN0ZXJzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gRXJyb3IgbWVzc2FnZSB0byBzYW5pdGl6ZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBTYW5pdGl6ZWQgbWVzc2FnZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplRXJyb3JNZXNzYWdlKG1lc3NhZ2UpIHtcclxuICBpZiAodHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSByZXR1cm4gJ1Vua25vd24gZXJyb3InO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBudWxsIGJ5dGVzIGFuZCBjb250cm9sIGNoYXJhY3RlcnMgKGV4Y2VwdCBuZXdsaW5lcyBhbmQgdGFicylcclxuICBsZXQgc2FuaXRpemVkID0gbWVzc2FnZS5yZXBsYWNlKC9bXFx4MDAtXFx4MDhcXHgwQlxceDBDXFx4MEUtXFx4MUZcXHg3Rl0vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBIVE1MIHRhZ3NcclxuICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQucmVwbGFjZSgvPFtePl0qPi9nLCAnJyk7XHJcbiAgXHJcbiAgLy8gUmVtb3ZlIHNjcmlwdC1saWtlIGNvbnRlbnRcclxuICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQucmVwbGFjZSgvamF2YXNjcmlwdDovZ2ksICcnKTtcclxuICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQucmVwbGFjZSgvb25cXHcrXFxzKj0vZ2ksICcnKTtcclxuICBcclxuICAvLyBMaW1pdCBsZW5ndGggdG8gcHJldmVudCBEb1NcclxuICBpZiAoc2FuaXRpemVkLmxlbmd0aCA+IDUwMCkge1xyXG4gICAgc2FuaXRpemVkID0gc2FuaXRpemVkLnN1YnN0cmluZygwLCA0OTcpICsgJy4uLic7XHJcbiAgfVxyXG4gIFxyXG4gIHJldHVybiBzYW5pdGl6ZWQgfHwgJ1Vua25vd24gZXJyb3InO1xyXG59XHJcblxyXG4vKipcclxuICogU2FuaXRpemVzIHVzZXIgaW5wdXQgZm9yIHNhZmUgZGlzcGxheSAocHJldmVudHMgWFNTKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgLSBVc2VyIGlucHV0IHRvIHNhbml0aXplXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFNhbml0aXplZCBpbnB1dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplVXNlcklucHV0KGlucHV0KSB7XHJcbiAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHJldHVybiAnJztcclxuICBcclxuICAvLyBDcmVhdGUgYSB0ZXh0IG5vZGUgYW5kIGV4dHJhY3QgdGhlIGVzY2FwZWQgdGV4dFxyXG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIGRpdi50ZXh0Q29udGVudCA9IGlucHV0O1xyXG4gIHJldHVybiBkaXYuaW5uZXJIVE1MO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBjb3JlL3NpZ25pbmcuanNcclxuICpcclxuICogTWVzc2FnZSBzaWduaW5nIGZ1bmN0aW9uYWxpdHkgZm9yIEVJUC0xOTEgYW5kIEVJUC03MTJcclxuICovXHJcblxyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5cclxuLyoqXHJcbiAqIFNpZ25zIGEgbWVzc2FnZSB1c2luZyBFSVAtMTkxIChwZXJzb25hbF9zaWduKVxyXG4gKiBUaGlzIHByZXBlbmRzIFwiXFx4MTlFdGhlcmV1bSBTaWduZWQgTWVzc2FnZTpcXG5cIiArIGxlbihtZXNzYWdlKSB0byB0aGUgbWVzc2FnZVxyXG4gKiBiZWZvcmUgc2lnbmluZywgd2hpY2ggcHJldmVudHMgc2lnbmluZyBhcmJpdHJhcnkgdHJhbnNhY3Rpb25zXHJcbiAqXHJcbiAqIEBwYXJhbSB7ZXRoZXJzLldhbGxldH0gc2lnbmVyIC0gV2FsbGV0IGluc3RhbmNlIHRvIHNpZ24gd2l0aFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gc2lnbiAoaGV4IHN0cmluZyBvciBVVEYtOCBzdHJpbmcpXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFNpZ25hdHVyZSAoMHgtcHJlZml4ZWQgaGV4IHN0cmluZylcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwZXJzb25hbFNpZ24oc2lnbmVyLCBtZXNzYWdlKSB7XHJcbiAgaWYgKCFzaWduZXIgfHwgdHlwZW9mIHNpZ25lci5zaWduTWVzc2FnZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHNpZ25lciBwcm92aWRlZCcpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFtZXNzYWdlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01lc3NhZ2UgaXMgcmVxdWlyZWQnKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBJZiBtZXNzYWdlIGlzIGhleC1lbmNvZGVkLCBkZWNvZGUgaXQgZmlyc3RcclxuICAgIC8vIGV0aGVycy5qcyBzaWduTWVzc2FnZSBleHBlY3RzIGEgc3RyaW5nIG9yIFVpbnQ4QXJyYXlcclxuICAgIGxldCBtZXNzYWdlVG9TaWduID0gbWVzc2FnZTtcclxuXHJcbiAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnICYmIG1lc3NhZ2Uuc3RhcnRzV2l0aCgnMHgnKSkge1xyXG4gICAgICAvLyBJdCdzIGEgaGV4IHN0cmluZywgY29udmVydCB0byBVVEYtOFxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIC8vIFRyeSB0byBkZWNvZGUgYXMgaGV4XHJcbiAgICAgICAgY29uc3QgYnl0ZXMgPSBldGhlcnMuZ2V0Qnl0ZXMobWVzc2FnZSk7XHJcbiAgICAgICAgbWVzc2FnZVRvU2lnbiA9IGV0aGVycy50b1V0ZjhTdHJpbmcoYnl0ZXMpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICAvLyBJZiBkZWNvZGluZyBmYWlscywgdXNlIHRoZSBoZXggc3RyaW5nIGFzLWlzXHJcbiAgICAgICAgLy8gZXRoZXJzIHdpbGwgaGFuZGxlIGl0XHJcbiAgICAgICAgbWVzc2FnZVRvU2lnbiA9IG1lc3NhZ2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTaWduIHRoZSBtZXNzYWdlIChldGhlcnMuanMgYXV0b21hdGljYWxseSBhcHBsaWVzIEVJUC0xOTEgZm9ybWF0KVxyXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2lnbmVyLnNpZ25NZXNzYWdlKG1lc3NhZ2VUb1NpZ24pO1xyXG5cclxuICAgIHJldHVybiBzaWduYXR1cmU7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHNpZ24gbWVzc2FnZTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFNpZ25zIHR5cGVkIGRhdGEgdXNpbmcgRUlQLTcxMlxyXG4gKiBVc2VkIGJ5IGRBcHBzIGZvciBzdHJ1Y3R1cmVkIGRhdGEgc2lnbmluZyAocGVybWl0cywgbWV0YS10cmFuc2FjdGlvbnMsIGV0Yy4pXHJcbiAqXHJcbiAqIEBwYXJhbSB7ZXRoZXJzLldhbGxldH0gc2lnbmVyIC0gV2FsbGV0IGluc3RhbmNlIHRvIHNpZ24gd2l0aFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHlwZWREYXRhIC0gRUlQLTcxMiB0eXBlZCBkYXRhIG9iamVjdCB3aXRoIGRvbWFpbiwgdHlwZXMsIGFuZCBtZXNzYWdlXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFNpZ25hdHVyZSAoMHgtcHJlZml4ZWQgaGV4IHN0cmluZylcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduVHlwZWREYXRhKHNpZ25lciwgdHlwZWREYXRhKSB7XHJcbiAgaWYgKCFzaWduZXIgfHwgdHlwZW9mIHNpZ25lci5zaWduVHlwZWREYXRhICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIXR5cGVkRGF0YSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdUeXBlZCBkYXRhIGlzIHJlcXVpcmVkJyk7XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSB0eXBlZCBkYXRhIHN0cnVjdHVyZVxyXG4gIGlmICghdHlwZWREYXRhLmRvbWFpbiB8fCAhdHlwZWREYXRhLnR5cGVzIHx8ICF0eXBlZERhdGEubWVzc2FnZSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEVJUC03MTIgdHlwZWQgZGF0YTogbWlzc2luZyBkb21haW4sIHR5cGVzLCBvciBtZXNzYWdlJyk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gRXh0cmFjdCBwcmltYXJ5VHlwZSAoaWYgbm90IHByb3ZpZGVkLCB0cnkgdG8gaW5mZXIgaXQpXHJcbiAgICBsZXQgcHJpbWFyeVR5cGUgPSB0eXBlZERhdGEucHJpbWFyeVR5cGU7XHJcblxyXG4gICAgaWYgKCFwcmltYXJ5VHlwZSkge1xyXG4gICAgICAvLyBUcnkgdG8gaW5mZXIgcHJpbWFyeSB0eXBlIGZyb20gdHlwZXMgb2JqZWN0XHJcbiAgICAgIC8vIEl0J3MgdGhlIHR5cGUgdGhhdCdzIG5vdCBcIkVJUDcxMkRvbWFpblwiXHJcbiAgICAgIGNvbnN0IHR5cGVOYW1lcyA9IE9iamVjdC5rZXlzKHR5cGVkRGF0YS50eXBlcykuZmlsdGVyKHQgPT4gdCAhPT0gJ0VJUDcxMkRvbWFpbicpO1xyXG4gICAgICBpZiAodHlwZU5hbWVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIHByaW1hcnlUeXBlID0gdHlwZU5hbWVzWzBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGluZmVyIHByaW1hcnlUeXBlIC0gcGxlYXNlIHNwZWNpZnkgaXQgZXhwbGljaXRseScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgdGhhdCBwcmltYXJ5VHlwZSBleGlzdHMgaW4gdHlwZXNcclxuICAgIGlmICghdHlwZWREYXRhLnR5cGVzW3ByaW1hcnlUeXBlXSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByaW1hcnkgdHlwZSBcIiR7cHJpbWFyeVR5cGV9XCIgbm90IGZvdW5kIGluIHR5cGVzIGRlZmluaXRpb25gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaWduIHVzaW5nIGV0aGVycy5qcyBzaWduVHlwZWREYXRhXHJcbiAgICAvLyBldGhlcnMgdjYgdXNlczogc2lnblR5cGVkRGF0YShkb21haW4sIHR5cGVzLCB2YWx1ZSlcclxuICAgIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IHNpZ25lci5zaWduVHlwZWREYXRhKFxyXG4gICAgICB0eXBlZERhdGEuZG9tYWluLFxyXG4gICAgICB0eXBlZERhdGEudHlwZXMsXHJcbiAgICAgIHR5cGVkRGF0YS5tZXNzYWdlXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBzaWduYXR1cmU7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHNpZ24gdHlwZWQgZGF0YTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhIG1lc3NhZ2Ugc2lnbmluZyByZXF1ZXN0XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgLSBSUEMgbWV0aG9kIChwZXJzb25hbF9zaWduLCBldGhfc2lnblR5cGVkRGF0YV92NCwgZXRjLilcclxuICogQHBhcmFtIHtBcnJheX0gcGFyYW1zIC0gUlBDIHBhcmFtZXRlcnNcclxuICogQHJldHVybnMge09iamVjdH0geyB2YWxpZDogYm9vbGVhbiwgZXJyb3I/OiBzdHJpbmcsIHNhbml0aXplZD86IE9iamVjdCB9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTaWduUmVxdWVzdChtZXRob2QsIHBhcmFtcykge1xyXG4gIGlmICghbWV0aG9kIHx8ICFwYXJhbXMgfHwgIUFycmF5LmlzQXJyYXkocGFyYW1zKSkge1xyXG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcmVxdWVzdCBmb3JtYXQnIH07XHJcbiAgfVxyXG5cclxuICBzd2l0Y2ggKG1ldGhvZCkge1xyXG4gICAgY2FzZSAncGVyc29uYWxfc2lnbic6XHJcbiAgICBjYXNlICdldGhfc2lnbic6IC8vIE5vdGU6IGV0aF9zaWduIGlzIGRhbmdlcm91cyBhbmQgc2hvdWxkIHNob3cgc3Ryb25nIHdhcm5pbmdcclxuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVycycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbWVzc2FnZSA9IHBhcmFtc1swXTtcclxuICAgICAgY29uc3QgYWRkcmVzcyA9IHBhcmFtc1sxXTtcclxuXHJcbiAgICAgIGlmICghbWVzc2FnZSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNZXNzYWdlIGlzIGVtcHR5JyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWFkZHJlc3MgfHwgIWV0aGVycy5pc0FkZHJlc3MoYWRkcmVzcykpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhZGRyZXNzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTYW5pdGl6ZSBtZXNzYWdlIChjb252ZXJ0IHRvIHN0cmluZyBpZiBuZWVkZWQpXHJcbiAgICAgIGNvbnN0IHNhbml0aXplZE1lc3NhZ2UgPSB0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgPyBtZXNzYWdlIDogU3RyaW5nKG1lc3NhZ2UpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB2YWxpZDogdHJ1ZSxcclxuICAgICAgICBzYW5pdGl6ZWQ6IHtcclxuICAgICAgICAgIG1lc3NhZ2U6IHNhbml0aXplZE1lc3NhZ2UsXHJcbiAgICAgICAgICBhZGRyZXNzOiBldGhlcnMuZ2V0QWRkcmVzcyhhZGRyZXNzKSAvLyBOb3JtYWxpemUgdG8gY2hlY2tzdW0gYWRkcmVzc1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YSc6XHJcbiAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92Myc6XHJcbiAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92NCc6XHJcbiAgICAgIGlmIChwYXJhbXMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlcnMnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGFkZHIgPSBwYXJhbXNbMF07XHJcbiAgICAgIGxldCB0eXBlZERhdGEgPSBwYXJhbXNbMV07XHJcblxyXG4gICAgICBpZiAoIWFkZHIgfHwgIWV0aGVycy5pc0FkZHJlc3MoYWRkcikpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhZGRyZXNzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQYXJzZSB0eXBlZCBkYXRhIGlmIGl0J3MgYSBzdHJpbmdcclxuICAgICAgaWYgKHR5cGVvZiB0eXBlZERhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHR5cGVkRGF0YSA9IEpTT04ucGFyc2UodHlwZWREYXRhKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHR5cGVkIGRhdGEgZm9ybWF0JyB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVmFsaWRhdGUgdHlwZWQgZGF0YSBzdHJ1Y3R1cmVcclxuICAgICAgaWYgKCF0eXBlZERhdGEgfHwgdHlwZW9mIHR5cGVkRGF0YSAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnVHlwZWQgZGF0YSBtdXN0IGJlIGFuIG9iamVjdCcgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF0eXBlZERhdGEuZG9tYWluIHx8ICF0eXBlZERhdGEudHlwZXMgfHwgIXR5cGVkRGF0YS5tZXNzYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1R5cGVkIGRhdGEgbWlzc2luZyByZXF1aXJlZCBmaWVsZHMgKGRvbWFpbiwgdHlwZXMsIG1lc3NhZ2UpJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHNhbml0aXplZDoge1xyXG4gICAgICAgICAgYWRkcmVzczogZXRoZXJzLmdldEFkZHJlc3MoYWRkciksXHJcbiAgICAgICAgICB0eXBlZERhdGE6IHR5cGVkRGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBgVW5zdXBwb3J0ZWQgc2lnbmluZyBtZXRob2Q6ICR7bWV0aG9kfWAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXRzIGEgbWVzc2FnZSBmb3IgZGlzcGxheSBpbiB0aGUgVUlcclxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4TGVuZ3RoIC0gTWF4aW11bSBkaXNwbGF5IGxlbmd0aFxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBGb3JtYXR0ZWQgbWVzc2FnZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2VGb3JEaXNwbGF5KG1lc3NhZ2UsIG1heExlbmd0aCA9IDUwMCkge1xyXG4gIGlmICghbWVzc2FnZSkgcmV0dXJuICcnO1xyXG5cclxuICBsZXQgZGlzcGxheU1lc3NhZ2UgPSBtZXNzYWdlO1xyXG5cclxuICAvLyBJZiBpdCdzIGEgaGV4IHN0cmluZywgdHJ5IHRvIGRlY29kZSBpdFxyXG4gIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgY29uc3QgZGVjb2RlZCA9IGV0aGVycy50b1V0ZjhTdHJpbmcoYnl0ZXMpO1xyXG4gICAgICAvLyBPbmx5IHVzZSBkZWNvZGVkIGlmIGl0IGxvb2tzIGxpa2UgcmVhZGFibGUgdGV4dFxyXG4gICAgICBpZiAoL15bXFx4MjAtXFx4N0VcXHNdKyQvLnRlc3QoZGVjb2RlZCkpIHtcclxuICAgICAgICBkaXNwbGF5TWVzc2FnZSA9IGRlY29kZWQ7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvLyBLZWVwIGFzIGhleCBpZiBkZWNvZGluZyBmYWlsc1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJ1bmNhdGUgaWYgdG9vIGxvbmdcclxuICBpZiAoZGlzcGxheU1lc3NhZ2UubGVuZ3RoID4gbWF4TGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gZGlzcGxheU1lc3NhZ2Uuc3Vic3RyaW5nKDAsIG1heExlbmd0aCkgKyAnLi4uJztcclxuICB9XHJcblxyXG4gIHJldHVybiBkaXNwbGF5TWVzc2FnZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdHMgdHlwZWQgZGF0YSBmb3IgZGlzcGxheSBpbiB0aGUgVUlcclxuICogQHBhcmFtIHtPYmplY3R9IHR5cGVkRGF0YSAtIEVJUC03MTIgdHlwZWQgZGF0YVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBIdW1hbi1yZWFkYWJsZSBmb3JtYXR0ZWQgc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0VHlwZWREYXRhRm9yRGlzcGxheSh0eXBlZERhdGEpIHtcclxuICBpZiAoIXR5cGVkRGF0YSkgcmV0dXJuICcnO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gQ3JlYXRlIGEgc2ltcGxpZmllZCB2aWV3IG9mIHRoZSB0eXBlZCBkYXRhXHJcbiAgICBjb25zdCBkaXNwbGF5ID0ge1xyXG4gICAgICBkb21haW46IHR5cGVkRGF0YS5kb21haW4sXHJcbiAgICAgIHByaW1hcnlUeXBlOiB0eXBlZERhdGEucHJpbWFyeVR5cGUgfHwgJ1Vua25vd24nLFxyXG4gICAgICBtZXNzYWdlOiB0eXBlZERhdGEubWVzc2FnZVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGlzcGxheSwgbnVsbCwgMik7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodHlwZWREYXRhLCBudWxsLCAyKTtcclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIGJhY2tncm91bmQvc2VydmljZS13b3JrZXIuanNcclxuICpcclxuICogQmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlciBmb3IgSGVhcnRXYWxsZXRcclxuICogSGFuZGxlcyBSUEMgcmVxdWVzdHMgZnJvbSBkQXBwcyBhbmQgbWFuYWdlcyB3YWxsZXQgc3RhdGVcclxuICovXHJcblxyXG5pbXBvcnQgeyBnZXRBY3RpdmVXYWxsZXQsIHVubG9ja1dhbGxldCB9IGZyb20gJy4uL2NvcmUvd2FsbGV0LmpzJztcclxuaW1wb3J0IHsgbG9hZCwgc2F2ZSB9IGZyb20gJy4uL2NvcmUvc3RvcmFnZS5qcyc7XHJcbmltcG9ydCAqIGFzIHJwYyBmcm9tICcuLi9jb3JlL3JwYy5qcyc7XHJcbmltcG9ydCAqIGFzIHR4SGlzdG9yeSBmcm9tICcuLi9jb3JlL3R4SGlzdG9yeS5qcyc7XHJcbmltcG9ydCB7IHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0LCBzYW5pdGl6ZUVycm9yTWVzc2FnZSB9IGZyb20gJy4uL2NvcmUvdHhWYWxpZGF0aW9uLmpzJztcclxuaW1wb3J0IHsgcGVyc29uYWxTaWduLCBzaWduVHlwZWREYXRhLCB2YWxpZGF0ZVNpZ25SZXF1ZXN0IH0gZnJvbSAnLi4vY29yZS9zaWduaW5nLmpzJztcclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8vIFNlcnZpY2Ugd29ya2VyIGxvYWRlZFxyXG5cclxuLy8gTmV0d29yayBjaGFpbiBJRHNcclxuY29uc3QgQ0hBSU5fSURTID0ge1xyXG4gICdwdWxzZWNoYWluVGVzdG5ldCc6ICcweDNBRicsIC8vIDk0M1xyXG4gICdwdWxzZWNoYWluJzogJzB4MTcxJywgLy8gMzY5XHJcbiAgJ2V0aGVyZXVtJzogJzB4MScsIC8vIDFcclxuICAnc2Vwb2xpYSc6ICcweEFBMzZBNycgLy8gMTExNTUxMTFcclxufTtcclxuXHJcbi8vIFN0b3JhZ2Uga2V5c1xyXG5jb25zdCBDT05ORUNURURfU0lURVNfS0VZID0gJ2Nvbm5lY3RlZF9zaXRlcyc7XHJcblxyXG4vLyBQZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdHMgKG9yaWdpbiAtPiB7IHJlc29sdmUsIHJlamVjdCwgdGFiSWQgfSlcclxuY29uc3QgcGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gU0VTU0lPTiBNQU5BR0VNRU5UID09PT09XHJcbi8vIFNlc3Npb24gdG9rZW5zIHN0b3JlZCBpbiBtZW1vcnkgKGNsZWFyZWQgd2hlbiBzZXJ2aWNlIHdvcmtlciB0ZXJtaW5hdGVzKVxyXG4vLyBTRUNVUklUWSBOT1RFOiBTZXJ2aWNlIHdvcmtlcnMgY2FuIGJlIHRlcm1pbmF0ZWQgYnkgQ2hyb21lIGF0IGFueSB0aW1lLCB3aGljaCBjbGVhcnMgYWxsXHJcbi8vIHNlc3Npb24gZGF0YS4gVGhpcyBpcyBpbnRlbnRpb25hbCAtIHdlIGRvbid0IHdhbnQgcGFzc3dvcmRzIHBlcnNpc3RpbmcgbG9uZ2VyIHRoYW4gbmVlZGVkLlxyXG4vLyBTZXNzaW9ucyBhcmUgZW5jcnlwdGVkIGluIG1lbW9yeSBhcyBhbiBhZGRpdGlvbmFsIHNlY3VyaXR5IGxheWVyLlxyXG5jb25zdCBhY3RpdmVTZXNzaW9ucyA9IG5ldyBNYXAoKTsgLy8gc2Vzc2lvblRva2VuIC0+IHsgZW5jcnlwdGVkUGFzc3dvcmQsIHdhbGxldElkLCBleHBpcmVzQXQsIHNhbHQgfVxyXG5cclxuLy8gU2Vzc2lvbiBlbmNyeXB0aW9uIGtleSAocmVnZW5lcmF0ZWQgb24gc2VydmljZSB3b3JrZXIgc3RhcnQpXHJcbmxldCBzZXNzaW9uRW5jcnlwdGlvbktleSA9IG51bGw7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZSBzZXNzaW9uIGVuY3J5cHRpb24ga2V5IHVzaW5nIFdlYiBDcnlwdG8gQVBJXHJcbiAqIEtleSBpcyByZWdlbmVyYXRlZCBlYWNoIHRpbWUgc2VydmljZSB3b3JrZXIgc3RhcnRzIChtZW1vcnkgb25seSwgbmV2ZXIgcGVyc2lzdGVkKVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gaW5pdFNlc3Npb25FbmNyeXB0aW9uKCkge1xyXG4gIGlmICghc2Vzc2lvbkVuY3J5cHRpb25LZXkpIHtcclxuICAgIC8vIEdlbmVyYXRlIGEgcmFuZG9tIDI1Ni1iaXQga2V5IGZvciBBRVMtR0NNIGVuY3J5cHRpb25cclxuICAgIHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcclxuICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXHJcbiAgICAgIGZhbHNlLCAvLyBOb3QgZXh0cmFjdGFibGVcclxuICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFbmNyeXB0cyBwYXNzd29yZCBmb3Igc2Vzc2lvbiBzdG9yYWdlIHVzaW5nIEFFUy1HQ01cclxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gUGFzc3dvcmQgdG8gZW5jcnlwdFxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7ZW5jcnlwdGVkOiBBcnJheUJ1ZmZlciwgaXY6IFVpbnQ4QXJyYXl9Pn1cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRQYXNzd29yZEZvclNlc3Npb24ocGFzc3dvcmQpIHtcclxuICBhd2FpdCBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKTtcclxuICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XHJcbiAgY29uc3QgcGFzc3dvcmREYXRhID0gZW5jb2Rlci5lbmNvZGUocGFzc3dvcmQpO1xyXG4gIFxyXG4gIC8vIEdlbmVyYXRlIHJhbmRvbSBJViBmb3IgdGhpcyBlbmNyeXB0aW9uXHJcbiAgLy8gU0VDVVJJVFk6IElWIHVuaXF1ZW5lc3MgaXMgY3J5cHRvZ3JhcGhpY2FsbHkgZ3VhcmFudGVlZCBieSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKClcclxuICAvLyB3aGljaCB1c2VzIHRoZSBicm93c2VyJ3MgQ1NQUk5HIChDcnlwdG9ncmFwaGljYWxseSBTZWN1cmUgUHNldWRvLVJhbmRvbSBOdW1iZXIgR2VuZXJhdG9yKVxyXG4gIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxMikpO1xyXG4gIFxyXG4gIGNvbnN0IGVuY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBwYXNzd29yZERhdGFcclxuICApO1xyXG4gIFxyXG4gIHJldHVybiB7IGVuY3J5cHRlZCwgaXYgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlY3J5cHRzIHBhc3N3b3JkIGZyb20gc2Vzc2lvbiBzdG9yYWdlXHJcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGVuY3J5cHRlZCAtIEVuY3J5cHRlZCBwYXNzd29yZCBkYXRhXHJcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gaXYgLSBJbml0aWFsaXphdGlvbiB2ZWN0b3JcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRQYXNzd29yZEZyb21TZXNzaW9uKGVuY3J5cHRlZCwgaXYpIHtcclxuICBhd2FpdCBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKTtcclxuICBcclxuICBjb25zdCBkZWNyeXB0ZWQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXHJcbiAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcclxuICAgIHNlc3Npb25FbmNyeXB0aW9uS2V5LFxyXG4gICAgZW5jcnlwdGVkXHJcbiAgKTtcclxuICBcclxuICBjb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XHJcbiAgcmV0dXJuIGRlY29kZXIuZGVjb2RlKGRlY3J5cHRlZCk7XHJcbn1cclxuXHJcbi8vIEdlbmVyYXRlIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBzZXNzaW9uIHRva2VuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlU2Vzc2lvblRva2VuKCkge1xyXG4gIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoMzIpO1xyXG4gIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyYXkpO1xyXG4gIHJldHVybiBBcnJheS5mcm9tKGFycmF5LCBieXRlID0+IGJ5dGUudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xyXG59XHJcblxyXG4vLyBDcmVhdGUgbmV3IHNlc3Npb25cclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihwYXNzd29yZCwgd2FsbGV0SWQsIGR1cmF0aW9uTXMgPSAzNjAwMDAwKSB7IC8vIERlZmF1bHQgMSBob3VyXHJcbiAgY29uc3Qgc2Vzc2lvblRva2VuID0gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKTtcclxuICBjb25zdCBleHBpcmVzQXQgPSBEYXRlLm5vdygpICsgZHVyYXRpb25NcztcclxuICBcclxuICAvLyBFbmNyeXB0IHBhc3N3b3JkIGJlZm9yZSBzdG9yaW5nIGluIG1lbW9yeVxyXG4gIGNvbnN0IHsgZW5jcnlwdGVkLCBpdiB9ID0gYXdhaXQgZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCk7XHJcblxyXG4gIGFjdGl2ZVNlc3Npb25zLnNldChzZXNzaW9uVG9rZW4sIHtcclxuICAgIGVuY3J5cHRlZFBhc3N3b3JkOiBlbmNyeXB0ZWQsXHJcbiAgICBpdjogaXYsXHJcbiAgICB3YWxsZXRJZCxcclxuICAgIGV4cGlyZXNBdFxyXG4gIH0pO1xyXG5cclxuICAvLyBBdXRvLWNsZWFudXAgZXhwaXJlZCBzZXNzaW9uXHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBpZiAoYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25Ub2tlbikpIHtcclxuICAgICAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uVG9rZW4pO1xyXG4gICAgICBpZiAoRGF0ZS5ub3coKSA+PSBzZXNzaW9uLmV4cGlyZXNBdCkge1xyXG4gICAgICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlc3Npb24gZXhwaXJlZCBhbmQgcmVtb3ZlZCcpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSwgZHVyYXRpb25Ncyk7XHJcblxyXG4gIC8vIFNlc3Npb24gY3JlYXRlZFxyXG4gIHJldHVybiBzZXNzaW9uVG9rZW47XHJcbn1cclxuXHJcbi8vIFZhbGlkYXRlIHNlc3Npb24gYW5kIHJldHVybiBkZWNyeXB0ZWQgcGFzc3dvcmRcclxuYXN5bmMgZnVuY3Rpb24gdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbikge1xyXG4gIGlmICghc2Vzc2lvblRva2VuKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHNlc3Npb24gdG9rZW4gcHJvdmlkZWQnKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgaWYgKCFzZXNzaW9uKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgb3IgZXhwaXJlZCBzZXNzaW9uJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoRGF0ZS5ub3coKSA+PSBzZXNzaW9uLmV4cGlyZXNBdCkge1xyXG4gICAgYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25Ub2tlbik7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nlc3Npb24gZXhwaXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgLy8gRGVjcnlwdCBwYXNzd29yZCBmcm9tIHNlc3Npb24gc3RvcmFnZVxyXG4gIHJldHVybiBhd2FpdCBkZWNyeXB0UGFzc3dvcmRGcm9tU2Vzc2lvbihzZXNzaW9uLmVuY3J5cHRlZFBhc3N3b3JkLCBzZXNzaW9uLml2KTtcclxufVxyXG5cclxuLy8gSW52YWxpZGF0ZSBzZXNzaW9uXHJcbmZ1bmN0aW9uIGludmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbikge1xyXG4gIGlmIChhY3RpdmVTZXNzaW9ucy5oYXMoc2Vzc2lvblRva2VuKSkge1xyXG4gICAgYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25Ub2tlbik7XHJcbiAgICAvLyBTZXNzaW9uIGludmFsaWRhdGVkXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vLyBJbnZhbGlkYXRlIGFsbCBzZXNzaW9uc1xyXG5mdW5jdGlvbiBpbnZhbGlkYXRlQWxsU2Vzc2lvbnMoKSB7XHJcbiAgY29uc3QgY291bnQgPSBhY3RpdmVTZXNzaW9ucy5zaXplO1xyXG4gIGFjdGl2ZVNlc3Npb25zLmNsZWFyKCk7XHJcbiAgLy8gQWxsIHNlc3Npb25zIGludmFsaWRhdGVkXHJcbiAgcmV0dXJuIGNvdW50O1xyXG59XHJcblxyXG4vLyBMaXN0ZW4gZm9yIGV4dGVuc2lvbiBpbnN0YWxsYXRpb25cclxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKCkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKCfwn6uAIEhlYXJ0V2FsbGV0IGluc3RhbGxlZCcpO1xyXG59KTtcclxuXHJcbi8vIEdldCBjb25uZWN0ZWQgc2l0ZXMgZnJvbSBzdG9yYWdlXHJcbmFzeW5jIGZ1bmN0aW9uIGdldENvbm5lY3RlZFNpdGVzKCkge1xyXG4gIGNvbnN0IHNpdGVzID0gYXdhaXQgbG9hZChDT05ORUNURURfU0lURVNfS0VZKTtcclxuICByZXR1cm4gc2l0ZXMgfHwge307XHJcbn1cclxuXHJcbi8vIENoZWNrIGlmIGEgc2l0ZSBpcyBjb25uZWN0ZWRcclxuYXN5bmMgZnVuY3Rpb24gaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikge1xyXG4gIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICByZXR1cm4gISFzaXRlc1tvcmlnaW5dO1xyXG59XHJcblxyXG4vLyBBZGQgYSBjb25uZWN0ZWQgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiBhZGRDb25uZWN0ZWRTaXRlKG9yaWdpbiwgYWNjb3VudHMpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgc2l0ZXNbb3JpZ2luXSA9IHtcclxuICAgIGFjY291bnRzLFxyXG4gICAgY29ubmVjdGVkQXQ6IERhdGUubm93KClcclxuICB9O1xyXG4gIGF3YWl0IHNhdmUoQ09OTkVDVEVEX1NJVEVTX0tFWSwgc2l0ZXMpO1xyXG59XHJcblxyXG4vLyBSZW1vdmUgYSBjb25uZWN0ZWQgc2l0ZVxyXG5hc3luYyBmdW5jdGlvbiByZW1vdmVDb25uZWN0ZWRTaXRlKG9yaWdpbikge1xyXG4gIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICBkZWxldGUgc2l0ZXNbb3JpZ2luXTtcclxuICBhd2FpdCBzYXZlKENPTk5FQ1RFRF9TSVRFU19LRVksIHNpdGVzKTtcclxufVxyXG5cclxuLy8gR2V0IGN1cnJlbnQgbmV0d29yayBjaGFpbiBJRFxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50Q2hhaW5JZCgpIHtcclxuICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKTtcclxuICByZXR1cm4gQ0hBSU5fSURTW25ldHdvcmsgfHwgJ3B1bHNlY2hhaW5UZXN0bmV0J107XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXQgcmVxdWVzdHMgZnJvbSBjb250ZW50IHNjcmlwdHNcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlV2FsbGV0UmVxdWVzdChtZXNzYWdlLCBzZW5kZXIpIHtcclxuICBjb25zdCB7IG1ldGhvZCwgcGFyYW1zIH0gPSBtZXNzYWdlO1xyXG5cclxuICAvLyBTRUNVUklUWTogR2V0IG9yaWdpbiBmcm9tIENocm9tZSBBUEksIG5vdCBtZXNzYWdlIHBheWxvYWQgKHByZXZlbnRzIHNwb29maW5nKVxyXG4gIGNvbnN0IHVybCA9IG5ldyBVUkwoc2VuZGVyLnVybCk7XHJcbiAgY29uc3Qgb3JpZ2luID0gdXJsLm9yaWdpbjtcclxuXHJcbiAgLy8gSGFuZGxpbmcgd2FsbGV0IHJlcXVlc3RcclxuXHJcbiAgdHJ5IHtcclxuICAgIHN3aXRjaCAobWV0aG9kKSB7XHJcbiAgICAgIGNhc2UgJ2V0aF9yZXF1ZXN0QWNjb3VudHMnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVSZXF1ZXN0QWNjb3VudHMob3JpZ2luLCBzZW5kZXIudGFiKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9hY2NvdW50cyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUFjY291bnRzKG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICdldGhfY2hhaW5JZCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUNoYWluSWQoKTtcclxuXHJcbiAgICAgIGNhc2UgJ25ldF92ZXJzaW9uJzpcclxuICAgICAgICBjb25zdCBjaGFpbklkID0gYXdhaXQgaGFuZGxlQ2hhaW5JZCgpO1xyXG4gICAgICAgIHJldHVybiB7IHJlc3VsdDogcGFyc2VJbnQoY2hhaW5JZC5yZXN1bHQsIDE2KS50b1N0cmluZygpIH07XHJcblxyXG4gICAgICBjYXNlICd3YWxsZXRfc3dpdGNoRXRoZXJldW1DaGFpbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVN3aXRjaENoYWluKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICd3YWxsZXRfYWRkRXRoZXJldW1DaGFpbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUFkZENoYWluKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICd3YWxsZXRfd2F0Y2hBc3NldCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVdhdGNoQXNzZXQocGFyYW1zLCBvcmlnaW4sIHNlbmRlci50YWIpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2Jsb2NrTnVtYmVyJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQmxvY2tOdW1iZXIoKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCbG9ja0J5TnVtYmVyJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmxvY2tCeU51bWJlcihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldEJhbGFuY2UnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25Db3VudCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uQ291bnQocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9jYWxsJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQ2FsbChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2VzdGltYXRlR2FzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlRXN0aW1hdGVHYXMocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nYXNQcmljZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdhc1ByaWNlKCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2VuZFRyYW5zYWN0aW9uJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2VuZFRyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9zZW5kUmF3VHJhbnNhY3Rpb24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTZW5kUmF3VHJhbnNhY3Rpb24ocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRUcmFuc2FjdGlvblJlY2VpcHQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvblJlY2VpcHQocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRUcmFuc2FjdGlvbkJ5SGFzaCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uQnlIYXNoKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0TG9ncyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldExvZ3MocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRDb2RlJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0Q29kZShwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldEJsb2NrQnlIYXNoJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmxvY2tCeUhhc2gocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ3BlcnNvbmFsX3NpZ24nOlxyXG4gICAgICBjYXNlICdldGhfc2lnbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVBlcnNvbmFsU2lnbihwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGFfdjMnOlxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92NCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNpZ25UeXBlZERhdGEocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCk7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMSwgbWVzc2FnZTogYE1ldGhvZCAke21ldGhvZH0gbm90IHN1cHBvcnRlZGAgfSB9O1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGhhbmRsaW5nIHJlcXVlc3Q6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfcmVxdWVzdEFjY291bnRzIC0gUmVxdWVzdCBwZXJtaXNzaW9uIHRvIGNvbm5lY3RcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVxdWVzdEFjY291bnRzKG9yaWdpbiwgdGFiKSB7XHJcbiAgLy8gQ2hlY2sgaWYgYWxyZWFkeSBjb25uZWN0ZWRcclxuICBpZiAoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgaWYgKHdhbGxldCAmJiB3YWxsZXQuYWRkcmVzcykge1xyXG4gICAgICByZXR1cm4geyByZXN1bHQ6IFt3YWxsZXQuYWRkcmVzc10gfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCk7XHJcbiAgICBwZW5kaW5nQ29ubmVjdGlvbnMuc2V0KHJlcXVlc3RJZCwgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdGFiSWQ6IHRhYj8uaWQgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1jb25uZWN0Jm9yaWdpbj0ke2VuY29kZVVSSUNvbXBvbmVudChvcmlnaW4pfSZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nQ29ubmVjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nQ29ubmVjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ29ubmVjdGlvbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfYWNjb3VudHMgLSBHZXQgY29ubmVjdGVkIGFjY291bnRzXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFjY291bnRzKG9yaWdpbikge1xyXG4gIC8vIE9ubHkgcmV0dXJuIGFjY291bnRzIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBbd2FsbGV0LmFkZHJlc3NdIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyByZXN1bHQ6IFtdIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfY2hhaW5JZCAtIEdldCBjdXJyZW50IGNoYWluIElEXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNoYWluSWQoKSB7XHJcbiAgY29uc3QgY2hhaW5JZCA9IGF3YWl0IGdldEN1cnJlbnRDaGFpbklkKCk7XHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBjaGFpbklkIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXRfc3dpdGNoRXRoZXJldW1DaGFpbiAtIFN3aXRjaCB0byBhIGRpZmZlcmVudCBuZXR3b3JrXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN3aXRjaENoYWluKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0gfHwgIXBhcmFtc1swXS5jaGFpbklkKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHBhcmFtcycgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcmVxdWVzdGVkQ2hhaW5JZCA9IHBhcmFtc1swXS5jaGFpbklkO1xyXG4gIC8vIFN3aXRjaGluZyBjaGFpblxyXG5cclxuICAvLyBGaW5kIG1hdGNoaW5nIG5ldHdvcmtcclxuICBjb25zdCBuZXR3b3JrTWFwID0ge1xyXG4gICAgJzB4M2FmJzogJ3B1bHNlY2hhaW5UZXN0bmV0JyxcclxuICAgICcweDNBRic6ICdwdWxzZWNoYWluVGVzdG5ldCcsXHJcbiAgICAnMHgxNzEnOiAncHVsc2VjaGFpbicsXHJcbiAgICAnMHgxJzogJ2V0aGVyZXVtJyxcclxuICAgICcweGFhMzZhNyc6ICdzZXBvbGlhJyxcclxuICAgICcweEFBMzZBNyc6ICdzZXBvbGlhJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG5ldHdvcmtLZXkgPSBuZXR3b3JrTWFwW3JlcXVlc3RlZENoYWluSWRdO1xyXG5cclxuICBpZiAoIW5ldHdvcmtLZXkpIHtcclxuICAgIC8vIENoYWluIG5vdCBzdXBwb3J0ZWQgLSByZXR1cm4gZXJyb3IgY29kZSA0OTAyIHNvIGRBcHAgY2FuIGNhbGwgd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDkwMixcclxuICAgICAgICBtZXNzYWdlOiAnVW5yZWNvZ25pemVkIGNoYWluIElELiBUcnkgYWRkaW5nIHRoZSBjaGFpbiB1c2luZyB3YWxsZXRfYWRkRXRoZXJldW1DaGFpbi4nXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgY3VycmVudCBuZXR3b3JrXHJcbiAgYXdhaXQgc2F2ZSgnY3VycmVudE5ldHdvcmsnLCBuZXR3b3JrS2V5KTtcclxuXHJcbiAgLy8gTm90aWZ5IGFsbCB0YWJzIGFib3V0IGNoYWluIGNoYW5nZVxyXG4gIGNvbnN0IG5ld0NoYWluSWQgPSBDSEFJTl9JRFNbbmV0d29ya0tleV07XHJcbiAgY2hyb21lLnRhYnMucXVlcnkoe30sICh0YWJzKSA9PiB7XHJcbiAgICB0YWJzLmZvckVhY2godGFiID0+IHtcclxuICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7XHJcbiAgICAgICAgdHlwZTogJ0NIQUlOX0NIQU5HRUQnLFxyXG4gICAgICAgIGNoYWluSWQ6IG5ld0NoYWluSWRcclxuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIC8vIFRhYiBtaWdodCBub3QgaGF2ZSBjb250ZW50IHNjcmlwdCwgaWdub3JlIGVycm9yXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiB7IHJlc3VsdDogbnVsbCB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4gLSBBZGQgYSBuZXcgbmV0d29yayAoc2ltcGxpZmllZCB2ZXJzaW9uKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBZGRDaGFpbihwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdIHx8ICFwYXJhbXNbMF0uY2hhaW5JZCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXMnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNoYWluSW5mbyA9IHBhcmFtc1swXTtcclxuICBjb25zb2xlLmxvZygn8J+rgCBSZXF1ZXN0IHRvIGFkZCBjaGFpbjonLCBjaGFpbkluZm8pO1xyXG5cclxuICAvLyBGb3Igbm93LCBvbmx5IHN1cHBvcnQgb3VyIHByZWRlZmluZWQgY2hhaW5zXHJcbiAgLy8gQ2hlY2sgaWYgaXQncyBvbmUgb2Ygb3VyIHN1cHBvcnRlZCBjaGFpbnNcclxuICBjb25zdCBzdXBwb3J0ZWRDaGFpbnMgPSB7XHJcbiAgICAnMHgzYWYnOiB0cnVlLFxyXG4gICAgJzB4M0FGJzogdHJ1ZSxcclxuICAgICcweDE3MSc6IHRydWUsXHJcbiAgICAnMHgxJzogdHJ1ZSxcclxuICAgICcweGFhMzZhNyc6IHRydWUsXHJcbiAgICAnMHhBQTM2QTcnOiB0cnVlXHJcbiAgfTtcclxuXHJcbiAgaWYgKHN1cHBvcnRlZENoYWluc1tjaGFpbkluZm8uY2hhaW5JZF0pIHtcclxuICAgIC8vIENoYWluIGlzIGFscmVhZHkgc3VwcG9ydGVkLCBqdXN0IHN3aXRjaCB0byBpdFxyXG4gICAgcmV0dXJuIGF3YWl0IGhhbmRsZVN3aXRjaENoYWluKFt7IGNoYWluSWQ6IGNoYWluSW5mby5jaGFpbklkIH1dKTtcclxuICB9XHJcblxyXG4gIC8vIEN1c3RvbSBjaGFpbnMgbm90IHN1cHBvcnRlZCB5ZXRcclxuICByZXR1cm4ge1xyXG4gICAgZXJyb3I6IHtcclxuICAgICAgY29kZTogLTMyNjAzLFxyXG4gICAgICBtZXNzYWdlOiAnQWRkaW5nIGN1c3RvbSBjaGFpbnMgbm90IHN1cHBvcnRlZCB5ZXQuIE9ubHkgUHVsc2VDaGFpbiBhbmQgRXRoZXJldW0gbmV0d29ya3MgYXJlIHN1cHBvcnRlZC4nXHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGNvbm5lY3Rpb24gYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCkge1xyXG4gIGlmICghcGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiB9ID0gcGVuZGluZ0Nvbm5lY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gIHBlbmRpbmdDb25uZWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKGFwcHJvdmVkKSB7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgICAgLy8gU2F2ZSBjb25uZWN0ZWQgc2l0ZVxyXG4gICAgICBhd2FpdCBhZGRDb25uZWN0ZWRTaXRlKG9yaWdpbiwgW3dhbGxldC5hZGRyZXNzXSk7XHJcblxyXG4gICAgICAvLyBSZXNvbHZlIHRoZSBwZW5kaW5nIHByb21pc2VcclxuICAgICAgcmVzb2x2ZSh7IHJlc3VsdDogW3dhbGxldC5hZGRyZXNzXSB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ05vIGFjdGl2ZSB3YWxsZXQnKSk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIGFjdGl2ZSB3YWxsZXQnIH07XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgY29ubmVjdGlvbicpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgY29ubmVjdGlvbiByZXF1ZXN0IGRldGFpbHMgZm9yIHBvcHVwXHJcbmZ1bmN0aW9uIGdldENvbm5lY3Rpb25SZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmIChwZW5kaW5nQ29ubmVjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIGNvbnN0IHsgb3JpZ2luIH0gPSBwZW5kaW5nQ29ubmVjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBvcmlnaW4gfTtcclxuICB9XHJcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQnIH07XHJcbn1cclxuXHJcbi8vIEdldCBjdXJyZW50IG5ldHdvcmsga2V5XHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnROZXR3b3JrKCkge1xyXG4gIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpO1xyXG4gIHJldHVybiBuZXR3b3JrIHx8ICdwdWxzZWNoYWluVGVzdG5ldCc7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfYmxvY2tOdW1iZXIgLSBHZXQgY3VycmVudCBibG9jayBudW1iZXJcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQmxvY2tOdW1iZXIoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmxvY2tOdW1iZXIgPSBhd2FpdCBycGMuZ2V0QmxvY2tOdW1iZXIobmV0d29yayk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrTnVtYmVyIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgbnVtYmVyOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldEJsb2NrQnlOdW1iZXIgLSBHZXQgYmxvY2sgYnkgbnVtYmVyXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEJsb2NrQnlOdW1iZXIocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBibG9jayBudW1iZXIgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYmxvY2tOdW1iZXIgPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBpbmNsdWRlVHJhbnNhY3Rpb25zID0gcGFyYW1zWzFdIHx8IGZhbHNlO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBibG9jayA9IGF3YWl0IHJwYy5nZXRCbG9ja0J5TnVtYmVyKG5ldHdvcmssIGJsb2NrTnVtYmVyLCBpbmNsdWRlVHJhbnNhY3Rpb25zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogYmxvY2sgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBibG9jayBieSBudW1iZXI6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0QmFsYW5jZSAtIEdldCBiYWxhbmNlIGZvciBhbiBhZGRyZXNzXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEJhbGFuY2UocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBhZGRyZXNzIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGFkZHJlc3MgPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJhbGFuY2UgPSBhd2FpdCBycGMuZ2V0QmFsYW5jZShuZXR3b3JrLCBhZGRyZXNzKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogYmFsYW5jZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJhbGFuY2U6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0VHJhbnNhY3Rpb25Db3VudCAtIEdldCB0cmFuc2FjdGlvbiBjb3VudCAobm9uY2UpXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uQ291bnQocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBhZGRyZXNzIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGFkZHJlc3MgPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGNvdW50ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQ291bnQobmV0d29yaywgYWRkcmVzcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGNvdW50IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gY291bnQ6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2FzUHJpY2UgLSBHZXQgY3VycmVudCBnYXMgcHJpY2VcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2FzUHJpY2UoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgZ2FzUHJpY2UgPSBhd2FpdCBycGMuZ2V0R2FzUHJpY2UobmV0d29yayk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGdhc1ByaWNlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgZ2FzIHByaWNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2VzdGltYXRlR2FzIC0gRXN0aW1hdGUgZ2FzIGZvciBhIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUVzdGltYXRlR2FzKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBnYXMgPSBhd2FpdCBycGMuZXN0aW1hdGVHYXMobmV0d29yaywgcGFyYW1zWzBdKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogZ2FzIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGVzdGltYXRpbmcgZ2FzOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2NhbGwgLSBFeGVjdXRlIGEgcmVhZC1vbmx5IGNhbGxcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2FsbChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnBjLmNhbGwobmV0d29yaywgcGFyYW1zWzBdKTtcclxuICAgIHJldHVybiB7IHJlc3VsdCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBleGVjdXRpbmcgY2FsbDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9zZW5kUmF3VHJhbnNhY3Rpb24gLSBTZW5kIGEgcHJlLXNpZ25lZCB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZW5kUmF3VHJhbnNhY3Rpb24ocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBzaWduZWQgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2lnbmVkVHggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHR4SGFzaCA9IGF3YWl0IHJwYy5zZW5kUmF3VHJhbnNhY3Rpb24obmV0d29yaywgc2lnbmVkVHgpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiB0eEhhc2ggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igc2VuZGluZyByYXcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0VHJhbnNhY3Rpb25SZWNlaXB0IC0gR2V0IHRyYW5zYWN0aW9uIHJlY2VpcHRcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VHJhbnNhY3Rpb25SZWNlaXB0KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0KG5ldHdvcmssIHR4SGFzaCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHJlY2VpcHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2FjdGlvbiByZWNlaXB0OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQnlIYXNoIC0gR2V0IHRyYW5zYWN0aW9uIGJ5IGhhc2hcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VHJhbnNhY3Rpb25CeUhhc2gocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBoYXNoIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHR4SGFzaCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgdHggPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25CeUhhc2gobmV0d29yaywgdHhIYXNoKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogdHggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2FjdGlvbiBieSBoYXNoOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRMb2dzKHBhcmFtcykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgbG9ncyA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRMb2dzJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogbG9ncyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGxvZ3M6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldENvZGUocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBhZGRyZXNzIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCBjb2RlID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldENvZGUnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb2RlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgY29kZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QmxvY2tCeUhhc2gocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyBibG9jayBoYXNoIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCBibG9jayA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRCbG9ja0J5SGFzaCcsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgaGFzaDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gUGVuZGluZyB0cmFuc2FjdGlvbiByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4gfSlcclxuY29uc3QgcGVuZGluZ1RyYW5zYWN0aW9ucyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vIFBlbmRpbmcgdG9rZW4gYWRkIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdG9rZW5JbmZvIH0pXHJcbmNvbnN0IHBlbmRpbmdUb2tlblJlcXVlc3RzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyBtZXNzYWdlIHNpZ25pbmcgcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCBzaWduUmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9KVxyXG5jb25zdCBwZW5kaW5nU2lnblJlcXVlc3RzID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gPT09PT0gUkFURSBMSU1JVElORyA9PT09PVxyXG4vLyBQcmV2ZW50cyBtYWxpY2lvdXMgZEFwcHMgZnJvbSBzcGFtbWluZyB0cmFuc2FjdGlvbiBhcHByb3ZhbCByZXF1ZXN0c1xyXG5jb25zdCByYXRlTGltaXRNYXAgPSBuZXcgTWFwKCk7IC8vIG9yaWdpbiAtPiB7IGNvdW50LCB3aW5kb3dTdGFydCwgcGVuZGluZ0NvdW50IH1cclxuXHJcbmNvbnN0IFJBVEVfTElNSVRfQ09ORklHID0ge1xyXG4gIE1BWF9QRU5ESU5HX1JFUVVFU1RTOiA1LCAvLyBNYXggcGVuZGluZyByZXF1ZXN0cyBwZXIgb3JpZ2luXHJcbiAgTUFYX1JFUVVFU1RTX1BFUl9XSU5ET1c6IDIwLCAvLyBNYXggdG90YWwgcmVxdWVzdHMgcGVyIHRpbWUgd2luZG93XHJcbiAgVElNRV9XSU5ET1dfTVM6IDYwMDAwIC8vIDEgbWludXRlIHdpbmRvd1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhbiBvcmlnaW4gaGFzIGV4Y2VlZGVkIHJhdGUgbGltaXRzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGNoZWNrXHJcbiAqIEByZXR1cm5zIHt7IGFsbG93ZWQ6IGJvb2xlYW4sIHJlYXNvbj86IHN0cmluZyB9fVxyXG4gKi9cclxuZnVuY3Rpb24gY2hlY2tSYXRlTGltaXQob3JpZ2luKSB7XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBcclxuICAvLyBHZXQgb3IgY3JlYXRlIHJhdGUgbGltaXQgZW50cnkgZm9yIHRoaXMgb3JpZ2luXHJcbiAgaWYgKCFyYXRlTGltaXRNYXAuaGFzKG9yaWdpbikpIHtcclxuICAgIHJhdGVMaW1pdE1hcC5zZXQob3JpZ2luLCB7XHJcbiAgICAgIGNvdW50OiAwLFxyXG4gICAgICB3aW5kb3dTdGFydDogbm93LFxyXG4gICAgICBwZW5kaW5nQ291bnQ6IDBcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBjb25zdCBsaW1pdERhdGEgPSByYXRlTGltaXRNYXAuZ2V0KG9yaWdpbik7XHJcbiAgXHJcbiAgLy8gUmVzZXQgd2luZG93IGlmIGV4cGlyZWRcclxuICBpZiAobm93IC0gbGltaXREYXRhLndpbmRvd1N0YXJ0ID4gUkFURV9MSU1JVF9DT05GSUcuVElNRV9XSU5ET1dfTVMpIHtcclxuICAgIGxpbWl0RGF0YS5jb3VudCA9IDA7XHJcbiAgICBsaW1pdERhdGEud2luZG93U3RhcnQgPSBub3c7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIHBlbmRpbmcgcmVxdWVzdHMgbGltaXRcclxuICBpZiAobGltaXREYXRhLnBlbmRpbmdDb3VudCA+PSBSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUEVORElOR19SRVFVRVNUUykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYWxsb3dlZDogZmFsc2UsXHJcbiAgICAgIHJlYXNvbjogYFRvbyBtYW55IHBlbmRpbmcgcmVxdWVzdHMuIE1heGltdW0gJHtSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUEVORElOR19SRVFVRVNUU30gcGVuZGluZyByZXF1ZXN0cyBhbGxvd2VkLmBcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIHRvdGFsIHJlcXVlc3RzIGluIHdpbmRvd1xyXG4gIGlmIChsaW1pdERhdGEuY291bnQgPj0gUkFURV9MSU1JVF9DT05GSUcuTUFYX1JFUVVFU1RTX1BFUl9XSU5ET1cpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFsbG93ZWQ6IGZhbHNlLFxyXG4gICAgICByZWFzb246IGBSYXRlIGxpbWl0IGV4Y2VlZGVkLiBNYXhpbXVtICR7UkFURV9MSU1JVF9DT05GSUcuTUFYX1JFUVVFU1RTX1BFUl9XSU5ET1d9IHJlcXVlc3RzIHBlciBtaW51dGUuYFxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIHsgYWxsb3dlZDogdHJ1ZSB9O1xyXG59XHJcblxyXG4vKipcclxuICogSW5jcmVtZW50cyByYXRlIGxpbWl0IGNvdW50ZXJzIGZvciBhbiBvcmlnaW5cclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gaW5jcmVtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBpbmNyZW1lbnRSYXRlTGltaXQob3JpZ2luKSB7XHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIGlmIChsaW1pdERhdGEpIHtcclxuICAgIGxpbWl0RGF0YS5jb3VudCsrO1xyXG4gICAgbGltaXREYXRhLnBlbmRpbmdDb3VudCsrO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIERlY3JlbWVudHMgcGVuZGluZyBjb3VudGVyIHdoZW4gcmVxdWVzdCBpcyByZXNvbHZlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBkZWNyZW1lbnRcclxuICovXHJcbmZ1bmN0aW9uIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pIHtcclxuICBjb25zdCBsaW1pdERhdGEgPSByYXRlTGltaXRNYXAuZ2V0KG9yaWdpbik7XHJcbiAgaWYgKGxpbWl0RGF0YSAmJiBsaW1pdERhdGEucGVuZGluZ0NvdW50ID4gMCkge1xyXG4gICAgbGltaXREYXRhLnBlbmRpbmdDb3VudC0tO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQ2xlYW4gdXAgb2xkIHJhdGUgbGltaXQgZW50cmllcyBldmVyeSA1IG1pbnV0ZXNcclxuc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgZm9yIChjb25zdCBbb3JpZ2luLCBkYXRhXSBvZiByYXRlTGltaXRNYXAuZW50cmllcygpKSB7XHJcbiAgICBpZiAobm93IC0gZGF0YS53aW5kb3dTdGFydCA+IFJBVEVfTElNSVRfQ09ORklHLlRJTUVfV0lORE9XX01TICogNSAmJiBkYXRhLnBlbmRpbmdDb3VudCA9PT0gMCkge1xyXG4gICAgICByYXRlTGltaXRNYXAuZGVsZXRlKG9yaWdpbik7XHJcbiAgICB9XHJcbiAgfVxyXG59LCAzMDAwMDApO1xyXG5cclxuLy8gPT09PT0gVFJBTlNBQ1RJT04gUkVQTEFZIFBST1RFQ1RJT04gPT09PT1cclxuLy8gUHJldmVudHMgdGhlIHNhbWUgdHJhbnNhY3Rpb24gYXBwcm92YWwgZnJvbSBiZWluZyB1c2VkIG11bHRpcGxlIHRpbWVzXHJcbmNvbnN0IHByb2Nlc3NlZEFwcHJvdmFscyA9IG5ldyBNYXAoKTsgLy8gYXBwcm92YWxUb2tlbiAtPiB7IHRpbWVzdGFtcCwgdHhIYXNoLCB1c2VkOiB0cnVlIH1cclxuXHJcbmNvbnN0IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRyA9IHtcclxuICBBUFBST1ZBTF9USU1FT1VUOiAzMDAwMDAsIC8vIDUgbWludXRlcyAtIGFwcHJvdmFsIGV4cGlyZXMgYWZ0ZXIgdGhpc1xyXG4gIENMRUFOVVBfSU5URVJWQUw6IDYwMDAwICAgLy8gMSBtaW51dGUgLSBjbGVhbiB1cCBvbGQgYXBwcm92YWxzXHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFVuaXF1ZSBhcHByb3ZhbCB0b2tlblxyXG4gKi9cclxuZnVuY3Rpb24gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCkge1xyXG4gIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoMzIpO1xyXG4gIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyYXkpO1xyXG4gIHJldHVybiBBcnJheS5mcm9tKGFycmF5LCBieXRlID0+IGJ5dGUudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuZCBtYXJrcyBhbiBhcHByb3ZhbCB0b2tlbiBhcyB1c2VkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhcHByb3ZhbFRva2VuIC0gVG9rZW4gdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsaWQgYW5kIG5vdCB5ZXQgdXNlZFxyXG4gKi9cclxuZnVuY3Rpb24gdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pIHtcclxuICBpZiAoIWFwcHJvdmFsVG9rZW4pIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBObyBhcHByb3ZhbCB0b2tlbiBwcm92aWRlZCcpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBcclxuICBjb25zdCBhcHByb3ZhbCA9IHByb2Nlc3NlZEFwcHJvdmFscy5nZXQoYXBwcm92YWxUb2tlbik7XHJcbiAgXHJcbiAgaWYgKCFhcHByb3ZhbCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIFVua25vd24gYXBwcm92YWwgdG9rZW4nKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgaWYgKGFwcHJvdmFsLnVzZWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBBcHByb3ZhbCB0b2tlbiBhbHJlYWR5IHVzZWQgLSBwcmV2ZW50aW5nIHJlcGxheSBhdHRhY2snKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgLy8gQ2hlY2sgaWYgYXBwcm92YWwgaGFzIGV4cGlyZWRcclxuICBjb25zdCBhZ2UgPSBEYXRlLm5vdygpIC0gYXBwcm92YWwudGltZXN0YW1wO1xyXG4gIGlmIChhZ2UgPiBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcuQVBQUk9WQUxfVElNRU9VVCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEFwcHJvdmFsIHRva2VuIGV4cGlyZWQnKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5kZWxldGUoYXBwcm92YWxUb2tlbik7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIE1hcmsgYXMgdXNlZFxyXG4gIGFwcHJvdmFsLnVzZWQgPSB0cnVlO1xyXG4gIGFwcHJvdmFsLnVzZWRBdCA9IERhdGUubm93KCk7XHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgQXBwcm92YWwgdG9rZW4gdmFsaWRhdGVkIGFuZCBtYXJrZWQgYXMgdXNlZCcpO1xyXG4gIFxyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vLyBDbGVhbiB1cCBvbGQgcHJvY2Vzc2VkIGFwcHJvdmFscyBldmVyeSBtaW51dGVcclxuc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgZm9yIChjb25zdCBbdG9rZW4sIGFwcHJvdmFsXSBvZiBwcm9jZXNzZWRBcHByb3ZhbHMuZW50cmllcygpKSB7XHJcbiAgICBjb25zdCBhZ2UgPSBub3cgLSBhcHByb3ZhbC50aW1lc3RhbXA7XHJcbiAgICBpZiAoYWdlID4gUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkFQUFJPVkFMX1RJTUVPVVQgKiAyKSB7XHJcbiAgICAgIHByb2Nlc3NlZEFwcHJvdmFscy5kZWxldGUodG9rZW4pO1xyXG4gICAgfVxyXG4gIH1cclxufSwgUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkNMRUFOVVBfSU5URVJWQUwpO1xyXG5cclxuLy8gSGFuZGxlIGV0aF9zZW5kVHJhbnNhY3Rpb24gLSBTaWduIGFuZCBzZW5kIGEgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFRyYW5zYWN0aW9uKHBhcmFtcywgb3JpZ2luKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKCFhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ05vdCBhdXRob3JpemVkLiBQbGVhc2UgY29ubmVjdCB5b3VyIHdhbGxldCBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBDaGVjayByYXRlIGxpbWl0IHRvIHByZXZlbnQgc3BhbVxyXG4gIGNvbnN0IHJhdGVMaW1pdENoZWNrID0gY2hlY2tSYXRlTGltaXQob3JpZ2luKTtcclxuICBpZiAoIXJhdGVMaW1pdENoZWNrLmFsbG93ZWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBSYXRlIGxpbWl0IGV4Y2VlZGVkIGZvciBvcmlnaW46Jywgb3JpZ2luKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQyMDAsIG1lc3NhZ2U6IHNhbml0aXplRXJyb3JNZXNzYWdlKHJhdGVMaW1pdENoZWNrLnJlYXNvbikgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdHhSZXF1ZXN0ID0gcGFyYW1zWzBdO1xyXG5cclxuICAvLyBMb2FkIHNldHRpbmdzIHRvIGdldCBtYXggZ2FzIHByaWNlXHJcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBsb2FkKCdzZXR0aW5ncycpO1xyXG4gIGNvbnN0IG1heEdhc1ByaWNlR3dlaSA9IHNldHRpbmdzPy5tYXhHYXNQcmljZUd3ZWkgfHwgMTAwMDtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IENvbXByZWhlbnNpdmUgdHJhbnNhY3Rpb24gdmFsaWRhdGlvblxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCB0cmFuc2FjdGlvbiBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3JzKTtcclxuICAgIHJldHVybiB7IFxyXG4gICAgICBlcnJvcjogeyBcclxuICAgICAgICBjb2RlOiAtMzI2MDIsIFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHRyYW5zYWN0aW9uOiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcnMuam9pbignOyAnKSkgXHJcbiAgICAgIH0gXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVXNlIHNhbml0aXplZCB0cmFuc2FjdGlvbiBwYXJhbWV0ZXJzXHJcbiAgY29uc3Qgc2FuaXRpemVkVHggPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gSW5jcmVtZW50IHJhdGUgbGltaXQgY291bnRlclxyXG4gIGluY3JlbWVudFJhdGVMaW1pdChvcmlnaW4pO1xyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpO1xyXG4gICAgXHJcbiAgICAvLyBTRUNVUklUWTogR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gU3RvcmUgc2FuaXRpemVkIHRyYW5zYWN0aW9uIGluc3RlYWQgb2Ygb3JpZ2luYWwgcmVxdWVzdFxyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5zZXQocmVxdWVzdElkLCB7IFxyXG4gICAgICByZXNvbHZlLCBcclxuICAgICAgcmVqZWN0LCBcclxuICAgICAgb3JpZ2luLCBcclxuICAgICAgdHhSZXF1ZXN0OiBzYW5pdGl6ZWRUeCxcclxuICAgICAgYXBwcm92YWxUb2tlbiAgLy8gSW5jbHVkZSB0b2tlbiBmb3IgdmFsaWRhdGlvblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj10cmFuc2FjdGlvbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNjAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdUcmFuc2FjdGlvbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB0cmFuc2FjdGlvbiBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2Vzc2lvblRva2VuLCBnYXNQcmljZSwgY3VzdG9tTm9uY2UpIHtcclxuICBpZiAoIXBlbmRpbmdUcmFuc2FjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0eFJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdUcmFuc2FjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgXHJcbiAgLy8gU0VDVVJJVFk6IFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcbiAgXHJcbiAgcGVuZGluZ1RyYW5zYWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gRGVjcmVtZW50IHBlbmRpbmcgY291bnRlciAocmVxdWVzdCBjb21wbGV0ZWQpXHJcbiAgZGVjcmVtZW50UGVuZGluZ0NvdW50KG9yaWdpbik7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdHJhbnNhY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gYW5kIGdldCBwYXNzd29yZCAobm93IGFzeW5jKVxyXG4gICAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IHdpdGggYXV0by11cGdyYWRlIG5vdGlmaWNhdGlvblxyXG4gICAgY29uc3QgeyBzaWduZXIsIHVwZ3JhZGVkLCBpdGVyYXRpb25zQmVmb3JlLCBpdGVyYXRpb25zQWZ0ZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICAvLyBOb3RpZnkgdXNlciB0aGF0IHdhbGxldCBlbmNyeXB0aW9uIGlzIGJlaW5nIHVwZ3JhZGVkXHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0IGVuY3J5cHRpb246ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYCk7XHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICAgIHRpdGxlOiAn8J+UkCBTZWN1cml0eSBVcGdyYWRlIGluIFByb2dyZXNzJyxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBVcGdyYWRpbmcgd2FsbGV0IGVuY3J5cHRpb24gdG8gJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zIGZvciBlbmhhbmNlZCBzZWN1cml0eS4uLmAsXHJcbiAgICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTaG93IGNvbXBsZXRpb24gbm90aWZpY2F0aW9uIGlmIHVwZ3JhZGUgb2NjdXJyZWRcclxuICAgIGlmICh1cGdyYWRlZCkge1xyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICfinIUgU2VjdXJpdHkgVXBncmFkZSBDb21wbGV0ZScsXHJcbiAgICAgICAgbWVzc2FnZTogYFdhbGxldCBlbmNyeXB0aW9uIHVwZ3JhZGVkOiAke2l0ZXJhdGlvbnNCZWZvcmUudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aXRlcmF0aW9uc0FmdGVyLnRvTG9jYWxlU3RyaW5nKCl9IGl0ZXJhdGlvbnNgLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCBjdXJyZW50IG5ldHdvcmtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcblxyXG4gICAgLy8gQ29ubmVjdCBzaWduZXIgdG8gcHJvdmlkZXJcclxuICAgIGNvbnN0IGNvbm5lY3RlZFNpZ25lciA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRyYW5zYWN0aW9uIC0gY3JlYXRlIGEgY2xlYW4gY29weSB3aXRoIG9ubHkgbmVjZXNzYXJ5IGZpZWxkc1xyXG4gICAgY29uc3QgdHhUb1NlbmQgPSB7XHJcbiAgICAgIHRvOiB0eFJlcXVlc3QudG8sXHJcbiAgICAgIHZhbHVlOiB0eFJlcXVlc3QudmFsdWUgfHwgJzB4MCcsXHJcbiAgICAgIGRhdGE6IHR4UmVxdWVzdC5kYXRhIHx8ICcweCdcclxuICAgIH07XHJcblxyXG4gICAgLy8gTm9uY2UgaGFuZGxpbmcgcHJpb3JpdHk6XHJcbiAgICAvLyAxLiBVc2VyLXByb3ZpZGVkIGN1c3RvbSBub25jZSAoZm9yIHJlcGxhY2luZyBzdHVjayB0cmFuc2FjdGlvbnMpXHJcbiAgICAvLyAyLiBEQXBwLXByb3ZpZGVkIG5vbmNlICh2YWxpZGF0ZWQpXHJcbiAgICAvLyAzLiBBdXRvLWZldGNoIGJ5IGV0aGVycy5qc1xyXG4gICAgaWYgKGN1c3RvbU5vbmNlICE9PSB1bmRlZmluZWQgJiYgY3VzdG9tTm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgLy8gVXNlciBtYW51YWxseSBzZXQgbm9uY2UgKGUuZy4sIHRvIHJlcGxhY2Ugc3R1Y2sgdHJhbnNhY3Rpb24pXHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uQ291bnQoc2lnbmVyLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcblxyXG4gICAgICBpZiAoY3VzdG9tTm9uY2UgPCBjdXJyZW50Tm9uY2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEN1c3RvbSBub25jZSAke2N1c3RvbU5vbmNlfSBpcyBsZXNzIHRoYW4gY3VycmVudCBub25jZSAke2N1cnJlbnROb25jZX0uIFRoaXMgbWF5IGZhaWwgdW5sZXNzIHlvdSdyZSByZXBsYWNpbmcgYSBwZW5kaW5nIHRyYW5zYWN0aW9uLmApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eFRvU2VuZC5ub25jZSA9IGN1c3RvbU5vbmNlO1xyXG4gICAgICAvLyBVc2luZyBjdXN0b20gbm9uY2VcclxuICAgIH0gZWxzZSBpZiAodHhSZXF1ZXN0Lm5vbmNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lm5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIFNFQ1VSSVRZOiBWYWxpZGF0ZSBub25jZSBpZiBwcm92aWRlZCBieSBEQXBwXHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uQ291bnQoc2lnbmVyLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcbiAgICAgIGNvbnN0IHByb3ZpZGVkTm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJ1xyXG4gICAgICAgID8gcGFyc2VJbnQodHhSZXF1ZXN0Lm5vbmNlLCAxNilcclxuICAgICAgICA6IHR4UmVxdWVzdC5ub25jZTtcclxuXHJcbiAgICAgIC8vIE5vbmNlIG11c3QgYmUgPj0gY3VycmVudCBwZW5kaW5nIG5vbmNlXHJcbiAgICAgIGlmIChwcm92aWRlZE5vbmNlIDwgY3VycmVudE5vbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG5vbmNlOiAke3Byb3ZpZGVkTm9uY2V9IGlzIGxlc3MgdGhhbiBjdXJyZW50IG5vbmNlICR7Y3VycmVudE5vbmNlfWApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eFRvU2VuZC5ub25jZSA9IHByb3ZpZGVkTm9uY2U7XHJcbiAgICAgIC8vIFVzaW5nIERBcHAtcHJvdmlkZWQgbm9uY2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIG5vIG5vbmNlIHByb3ZpZGVkLCBldGhlcnMuanMgd2lsbCBmZXRjaCB0aGUgY29ycmVjdCBvbmUgYXV0b21hdGljYWxseVxyXG4gICAgICAvLyBBdXRvLWZldGNoaW5nIG5vbmNlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgREFwcCBwcm92aWRlZCBhIGdhcyBsaW1pdCwgdXNlIGl0LiBPdGhlcndpc2UgbGV0IGV0aGVycyBlc3RpbWF0ZS5cclxuICAgIGlmICh0eFJlcXVlc3QuZ2FzIHx8IHR4UmVxdWVzdC5nYXNMaW1pdCkge1xyXG4gICAgICB0eFRvU2VuZC5nYXNMaW1pdCA9IHR4UmVxdWVzdC5nYXMgfHwgdHhSZXF1ZXN0Lmdhc0xpbWl0O1xyXG4gICAgICAvLyBVc2luZyBwcm92aWRlZCBnYXMgbGltaXRcclxuICAgIH1cclxuXHJcbiAgICAvLyBBcHBseSB1c2VyLXNlbGVjdGVkIGdhcyBwcmljZSBpZiBwcm92aWRlZCwgb3IgdXNlIHNhZmUgbmV0d29yayBnYXMgcHJpY2VcclxuICAgIGlmIChnYXNQcmljZSkge1xyXG4gICAgICAvLyBVc2UgdXNlci1zZWxlY3RlZCBnYXMgcHJpY2UgZnJvbSBVSVxyXG4gICAgICB0eFRvU2VuZC5nYXNQcmljZSA9IGdhc1ByaWNlO1xyXG4gICAgICAvLyBVc2luZyBjdXN0b20gZ2FzIHByaWNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBGYWxsYmFjazogRmV0Y2ggc2FmZSBnYXMgcHJpY2UgKGJhc2UgZmVlICogMikgdG8gcHJldmVudCBzdHVjayB0cmFuc2FjdGlvbnNcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBzYWZlR2FzUHJpY2VIZXggPSBhd2FpdCBycGMuZ2V0U2FmZUdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgICAgIHR4VG9TZW5kLmdhc1ByaWNlID0gQmlnSW50KHNhZmVHYXNQcmljZUhleCk7XHJcbiAgICAgICAgLy8gVXNpbmcgc2FmZSBnYXMgcHJpY2UgZnJvbSBiYXNlIGZlZVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgZ2V0dGluZyBzYWZlIGdhcyBwcmljZSwgdXNpbmcgcHJvdmlkZXIgZmFsbGJhY2s6JywgZXJyb3IpO1xyXG4gICAgICAgIC8vIExhc3QgcmVzb3J0IGZhbGxiYWNrIHRvIHByb3ZpZGVyXHJcbiAgICAgICAgY29uc3QgbmV0d29ya0dhc1ByaWNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0RmVlRGF0YSgpO1xyXG4gICAgICAgIGlmIChuZXR3b3JrR2FzUHJpY2UuZ2FzUHJpY2UpIHtcclxuICAgICAgICAgIHR4VG9TZW5kLmdhc1ByaWNlID0gbmV0d29ya0dhc1ByaWNlLmdhc1ByaWNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNlbmQgdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgY29ubmVjdGVkU2lnbmVyLnNlbmRUcmFuc2FjdGlvbih0eFRvU2VuZCk7XHJcblxyXG4gICAgLy8gVHJhbnNhY3Rpb24gc2VudFxyXG5cclxuICAgIC8vIFNhdmUgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeSAobmV0d29yayB2YXJpYWJsZSBhbHJlYWR5IGRlZmluZWQgYWJvdmUpXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3Rvcnkoc2lnbmVyLmFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBzaWduZXIuYWRkcmVzcyxcclxuICAgICAgdG86IHR4UmVxdWVzdC50byB8fCBudWxsLFxyXG4gICAgICB2YWx1ZTogdHhSZXF1ZXN0LnZhbHVlIHx8ICcwJyxcclxuICAgICAgZGF0YTogdHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogdHguZ2FzUHJpY2UgPyB0eC5nYXNQcmljZS50b1N0cmluZygpIDogJzAnLFxyXG4gICAgICBnYXNMaW1pdDogdHguZ2FzTGltaXQgPyB0eC5nYXNMaW1pdC50b1N0cmluZygpIDogbnVsbCxcclxuICAgICAgbm9uY2U6IHR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6IHR4SGlzdG9yeS5UWF9UWVBFUy5DT05UUkFDVFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2VuZCBkZXNrdG9wIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU2VudCcsXHJcbiAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBzZW50OiAke3R4Lmhhc2guc2xpY2UoMCwgMjApfS4uLmAsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb24gaW4gYmFja2dyb3VuZFxyXG4gICAgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIHNpZ25lci5hZGRyZXNzKTtcclxuXHJcbiAgICAvLyBSZXNvbHZlIHdpdGggdHJhbnNhY3Rpb24gaGFzaFxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogdHguaGFzaCB9KTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2ggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBUcmFuc2FjdGlvbiBlcnJvcjonLCBlcnJvcik7XHJcbiAgICBjb25zdCBzYW5pdGl6ZWRFcnJvciA9IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcihzYW5pdGl6ZWRFcnJvcikpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZWRFcnJvciB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHRyYW5zYWN0aW9uIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0VHJhbnNhY3Rpb25SZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmIChwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdHhSZXF1ZXN0IH0gPSBwZW5kaW5nVHJhbnNhY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luLCB0eFJlcXVlc3QgfTtcclxuICB9XHJcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQnIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXRfd2F0Y2hBc3NldCAtIEFkZCBjdXN0b20gdG9rZW4gKEVJUC03NDcpXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVdhdGNoQXNzZXQocGFyYW1zLCBvcmlnaW4sIHRhYikge1xyXG4gIC8vIFJlY2VpdmVkIHdhbGxldF93YXRjaEFzc2V0IHJlcXVlc3RcclxuXHJcbiAgLy8gVmFsaWRhdGUgcGFyYW1zIHN0cnVjdHVyZVxyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXMudHlwZSB8fCAhcGFyYW1zLm9wdGlvbnMpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zOiBtdXN0IGluY2x1ZGUgdHlwZSBhbmQgb3B0aW9ucycgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyB0eXBlLCBvcHRpb25zIH0gPSBwYXJhbXM7XHJcblxyXG4gIC8vIE9ubHkgc3VwcG9ydCBFUkMyMC9QUkMyMCB0b2tlbnNcclxuICBpZiAodHlwZS50b1VwcGVyQ2FzZSgpICE9PSAnRVJDMjAnKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdPbmx5IEVSQzIwL1BSQzIwIHRva2VucyBhcmUgc3VwcG9ydGVkJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSByZXF1aXJlZCB0b2tlbiBmaWVsZHNcclxuICBpZiAoIW9wdGlvbnMuYWRkcmVzcyB8fCAhb3B0aW9ucy5zeW1ib2wpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ1Rva2VuIG11c3QgaGF2ZSBhZGRyZXNzIGFuZCBzeW1ib2wnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VuSW5mbyA9IHtcclxuICAgIGFkZHJlc3M6IG9wdGlvbnMuYWRkcmVzcy50b0xvd2VyQ2FzZSgpLFxyXG4gICAgc3ltYm9sOiBvcHRpb25zLnN5bWJvbCxcclxuICAgIGRlY2ltYWxzOiBvcHRpb25zLmRlY2ltYWxzIHx8IDE4LFxyXG4gICAgaW1hZ2U6IG9wdGlvbnMuaW1hZ2UgfHwgbnVsbFxyXG4gIH07XHJcblxyXG4gIC8vIFJlcXVlc3RpbmcgdG8gYWRkIHRva2VuXHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCkgKyAnX3Rva2VuJztcclxuICAgIHBlbmRpbmdUb2tlblJlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRva2VuSW5mbyB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPWFkZFRva2VuJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA1MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVG9rZW4gYWRkIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHRva2VuIGFkZCBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRva2VuQWRkQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCkge1xyXG4gIGlmICghcGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgdG9rZW5JbmZvIH0gPSBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCB0b2tlbicpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVG9rZW4gYXBwcm92ZWQgLSByZXR1cm4gdHJ1ZSAod2FsbGV0X3dhdGNoQXNzZXQgcmV0dXJucyBib29sZWFuKVxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogdHJ1ZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHRva2VuSW5mbyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRva2VuIGFkZCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICByZWplY3QobmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IHRva2VuIGFkZCByZXF1ZXN0IGRldGFpbHMgZm9yIHBvcHVwXHJcbmZ1bmN0aW9uIGdldFRva2VuQWRkUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0b2tlbkluZm8gfSA9IHBlbmRpbmdUb2tlblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luLCB0b2tlbkluZm8gfTtcclxuICB9XHJcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQnIH07XHJcbn1cclxuXHJcbi8vIFNwZWVkIHVwIGEgcGVuZGluZyB0cmFuc2FjdGlvbiBieSByZXBsYWNpbmcgaXQgd2l0aCBoaWdoZXIgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbihhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgc2Vzc2lvblRva2VuLCBnYXNQcmljZU11bHRpcGxpZXIgPSAxLjIsIGN1c3RvbUdhc1ByaWNlID0gbnVsbCkge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIChub3cgYXN5bmMpXHJcbiAgICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG5cclxuICAgIC8vIEdldCBvcmlnaW5hbCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICBjb25zdCBvcmlnaW5hbFR4ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4QnlIYXNoKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoKTtcclxuICAgIGlmICghb3JpZ2luYWxUeCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBub3QgZm91bmQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9yaWdpbmFsVHguc3RhdHVzICE9PSB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gaXMgbm90IHBlbmRpbmcnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHdhbGxldCBhbmQgdW5sb2NrIChhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkKVxyXG4gICAgY29uc3QgeyBzaWduZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHZXQgbmV0d29yayBhbmQgY3JlYXRlIHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyXHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3JpZ2luYWxUeC5uZXR3b3JrO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIG5ldyBnYXMgcHJpY2VcclxuICAgIGxldCBuZXdHYXNQcmljZTtcclxuICAgIGlmIChjdXN0b21HYXNQcmljZSkge1xyXG4gICAgICAvLyBVc2UgY3VzdG9tIGdhcyBwcmljZSBwcm92aWRlZCBieSB1c2VyXHJcbiAgICAgIG5ld0dhc1ByaWNlID0gQmlnSW50KGN1c3RvbUdhc1ByaWNlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENhbGN1bGF0ZSBmcm9tIG11bHRpcGxpZXIgKDEuMnggb2Ygb3JpZ2luYWwgYnkgZGVmYXVsdClcclxuICAgICAgY29uc3Qgb3JpZ2luYWxHYXNQcmljZSA9IEJpZ0ludChvcmlnaW5hbFR4Lmdhc1ByaWNlKTtcclxuICAgICAgbmV3R2FzUHJpY2UgPSAob3JpZ2luYWxHYXNQcmljZSAqIEJpZ0ludChNYXRoLmZsb29yKGdhc1ByaWNlTXVsdGlwbGllciAqIDEwMCkpKSAvIEJpZ0ludCgxMDApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSByZXBsYWNlbWVudCB0cmFuc2FjdGlvbiB3aXRoIHNhbWUgbm9uY2UsIGRhdGEsIGFuZCBnYXNMaW1pdFxyXG4gICAgY29uc3QgcmVwbGFjZW1lbnRUeCA9IHtcclxuICAgICAgdG86IG9yaWdpbmFsVHgudG8sXHJcbiAgICAgIHZhbHVlOiBvcmlnaW5hbFR4LnZhbHVlLFxyXG4gICAgICBkYXRhOiBvcmlnaW5hbFR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBJbmNsdWRlIGdhc0xpbWl0IGlmIGl0IHdhcyBpbiB0aGUgb3JpZ2luYWwgdHJhbnNhY3Rpb25cclxuICAgIGlmIChvcmlnaW5hbFR4Lmdhc0xpbWl0KSB7XHJcbiAgICAgIHJlcGxhY2VtZW50VHguZ2FzTGltaXQgPSBvcmlnaW5hbFR4Lmdhc0xpbWl0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uXHJcblxyXG4gICAgLy8gU2VuZCByZXBsYWNlbWVudCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgdHggPSBhd2FpdCB3YWxsZXQuc2VuZFRyYW5zYWN0aW9uKHJlcGxhY2VtZW50VHgpO1xyXG5cclxuICAgIC8vIFNhdmUgbmV3IHRyYW5zYWN0aW9uIHRvIGhpc3RvcnlcclxuICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShhZGRyZXNzLCB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogYWRkcmVzcyxcclxuICAgICAgdG86IG9yaWdpbmFsVHgudG8sXHJcbiAgICAgIHZhbHVlOiBvcmlnaW5hbFR4LnZhbHVlLFxyXG4gICAgICBkYXRhOiBvcmlnaW5hbFR4LmRhdGEgfHwgJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgIGdhc0xpbWl0OiBvcmlnaW5hbFR4Lmdhc0xpbWl0LFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiBvcmlnaW5hbFR4LnR5cGVcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgcmVwbGFjZWQvZmFpbGVkXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAvLyBTZW5kIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU3BlZCBVcCcsXHJcbiAgICAgIG1lc3NhZ2U6IGBSZXBsYWNlbWVudCB0cmFuc2FjdGlvbiBzZW50IHdpdGggJHtNYXRoLmZsb29yKGdhc1ByaWNlTXVsdGlwbGllciAqIDEwMCl9JSBnYXMgcHJpY2VgLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcyk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiB0eC5oYXNoLCBuZXdHYXNQcmljZTogbmV3R2FzUHJpY2UudG9TdHJpbmcoKSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIENhbmNlbCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gYnkgcmVwbGFjaW5nIGl0IHdpdGggYSB6ZXJvLXZhbHVlIHR4IHRvIHNlbGZcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHNlc3Npb25Ub2tlbiwgY3VzdG9tR2FzUHJpY2UgPSBudWxsKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2sgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB7IHNpZ25lciB9ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgbmV3IGdhcyBwcmljZVxyXG4gICAgbGV0IG5ld0dhc1ByaWNlO1xyXG4gICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgIC8vIFVzZSBjdXN0b20gZ2FzIHByaWNlIHByb3ZpZGVkIGJ5IHVzZXJcclxuICAgICAgbmV3R2FzUHJpY2UgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gQ2FsY3VsYXRlIGZyb20gb3JpZ2luYWwgKDEuMnggb2Ygb3JpZ2luYWwgdG8gZW5zdXJlIGl0IGdldHMgbWluZWQgZmlyc3QpXHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsR2FzUHJpY2UgPSBCaWdJbnQob3JpZ2luYWxUeC5nYXNQcmljZSk7XHJcbiAgICAgIG5ld0dhc1ByaWNlID0gKG9yaWdpbmFsR2FzUHJpY2UgKiBCaWdJbnQoMTIwKSkgLyBCaWdJbnQoMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIChzZW5kIDAgdG8gc2VsZiB3aXRoIHNhbWUgbm9uY2UpXHJcbiAgICBjb25zdCBjYW5jZWxUeCA9IHtcclxuICAgICAgdG86IGFkZHJlc3MsICAvLyBTZW5kIHRvIHNlbGZcclxuICAgICAgdmFsdWU6ICcwJywgICAvLyBaZXJvIHZhbHVlXHJcbiAgICAgIGRhdGE6ICcweCcsICAgLy8gRW1wdHkgZGF0YVxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlLFxyXG4gICAgICBnYXNMaW1pdDogMjEwMDAgIC8vIFN0YW5kYXJkIGdhcyBsaW1pdCBmb3Igc2ltcGxlIEVUSCB0cmFuc2ZlclxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDYW5jZWxsaW5nIHRyYW5zYWN0aW9uXHJcblxyXG4gICAgLy8gU2VuZCBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgd2FsbGV0LnNlbmRUcmFuc2FjdGlvbihjYW5jZWxUeCk7XHJcblxyXG4gICAgLy8gU2F2ZSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogYWRkcmVzcyxcclxuICAgICAgdmFsdWU6ICcwJyxcclxuICAgICAgZGF0YTogJzB4JyxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgIGdhc0xpbWl0OiAnMjEwMDAnLFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiAnc2VuZCdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgZmFpbGVkXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAvLyBTZW5kIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ2FuY2VsbGVkJyxcclxuICAgICAgbWVzc2FnZTogJ0NhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiBzZW50JyxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvblxyXG4gICAgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGNhbmNlbGxpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGN1cnJlbnQgbmV0d29yayBnYXMgcHJpY2UgKGZvciBzcGVlZC11cCBVSSlcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudE5ldHdvcmtHYXNQcmljZShuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIFVzZSBzYWZlIGdhcyBwcmljZSB0byBwcmV2ZW50IHN0dWNrIHRyYW5zYWN0aW9uc1xyXG4gICAgY29uc3Qgc2FmZUdhc1ByaWNlSGV4ID0gYXdhaXQgcnBjLmdldFNhZmVHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIGNvbnN0IHNhZmVHYXNQcmljZSA9IEJpZ0ludChzYWZlR2FzUHJpY2VIZXgpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIGdhc1ByaWNlOiBzYWZlR2FzUHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgZ2FzUHJpY2VHd2VpOiAoTnVtYmVyKHNhZmVHYXNQcmljZSkgLyAxZTkpLnRvRml4ZWQoMilcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgZmV0Y2hpbmcgY3VycmVudCBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gUmVmcmVzaCB0cmFuc2FjdGlvbiBzdGF0dXMgZnJvbSBibG9ja2NoYWluXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hUcmFuc2FjdGlvblN0YXR1cyhhZGRyZXNzLCB0eEhhc2gsIG5ldHdvcmspIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcblxyXG4gICAgLy8gR2V0IHRyYW5zYWN0aW9uIHJlY2VpcHQgZnJvbSBibG9ja2NoYWluXHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgcHJvdmlkZXIuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0KHR4SGFzaCk7XHJcblxyXG4gICAgaWYgKCFyZWNlaXB0KSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIHN0aWxsIHBlbmRpbmcgKG5vdCBtaW5lZCB5ZXQpXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcclxuICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gaXMgc3RpbGwgcGVuZGluZyBvbiB0aGUgYmxvY2tjaGFpbidcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUcmFuc2FjdGlvbiBoYXMgYmVlbiBtaW5lZFxyXG4gICAgbGV0IG5ld1N0YXR1cztcclxuICAgIGlmIChyZWNlaXB0LnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICBuZXdTdGF0dXMgPSB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5ld1N0YXR1cyA9IHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVEO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBsb2NhbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgIGFkZHJlc3MsXHJcbiAgICAgIHR4SGFzaCxcclxuICAgICAgbmV3U3RhdHVzLFxyXG4gICAgICByZWNlaXB0LmJsb2NrTnVtYmVyXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxyXG4gICAgICBibG9ja051bWJlcjogcmVjZWlwdC5ibG9ja051bWJlcixcclxuICAgICAgbWVzc2FnZTogbmV3U3RhdHVzID09PSB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRFxyXG4gICAgICAgID8gJ1RyYW5zYWN0aW9uIGNvbmZpcm1lZCBvbiBibG9ja2NoYWluJ1xyXG4gICAgICAgIDogJ1RyYW5zYWN0aW9uIGZhaWxlZCBvbiBibG9ja2NoYWluJ1xyXG4gICAgfTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgcmVmcmVzaGluZyB0cmFuc2FjdGlvbiBzdGF0dXM6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gV2FpdCBmb3IgdHJhbnNhY3Rpb24gY29uZmlybWF0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIFdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvblxyXG5cclxuICAgIC8vIFdhaXQgZm9yIDEgY29uZmlybWF0aW9uXHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgcHJvdmlkZXIud2FpdEZvclRyYW5zYWN0aW9uKHR4Lmhhc2gsIDEpO1xyXG5cclxuICAgIGlmIChyZWNlaXB0ICYmIHJlY2VpcHQuc3RhdHVzID09PSAxKSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIGNvbmZpcm1lZFxyXG5cclxuICAgICAgLy8gVXBkYXRlIHRyYW5zYWN0aW9uIHN0YXR1cyBpbiBoaXN0b3J5XHJcbiAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgICBhZGRyZXNzLFxyXG4gICAgICAgIHR4Lmhhc2gsXHJcbiAgICAgICAgdHhIaXN0b3J5LlRYX1NUQVRVUy5DT05GSVJNRUQsXHJcbiAgICAgICAgcmVjZWlwdC5ibG9ja051bWJlclxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gU2VuZCBzdWNjZXNzIG5vdGlmaWNhdGlvblxyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBDb25maXJtZWQnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBUcmFuc2FjdGlvbiBjb25maXJtZWQgb24tY2hhaW4hYCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRyYW5zYWN0aW9uIGZhaWxlZFxyXG5cclxuICAgICAgLy8gVXBkYXRlIHRyYW5zYWN0aW9uIHN0YXR1cyBpbiBoaXN0b3J5XHJcbiAgICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhcclxuICAgICAgICBhZGRyZXNzLFxyXG4gICAgICAgIHR4Lmhhc2gsXHJcbiAgICAgICAgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsXHJcbiAgICAgICAgcmVjZWlwdCA/IHJlY2VpcHQuYmxvY2tOdW1iZXIgOiBudWxsXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBTZW5kIGZhaWx1cmUgbm90aWZpY2F0aW9uXHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIEZhaWxlZCcsXHJcbiAgICAgICAgbWVzc2FnZTogJ1RyYW5zYWN0aW9uIHdhcyByZXZlcnRlZCBvciBmYWlsZWQnLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHdhaXRpbmcgZm9yIGNvbmZpcm1hdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PSBNRVNTQUdFIFNJR05JTkcgSEFORExFUlMgPT09PT1cclxuXHJcbi8vIEhhbmRsZSBwZXJzb25hbF9zaWduIChFSVAtMTkxKSAtIFNpZ24gYSBtZXNzYWdlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVBlcnNvbmFsU2lnbihwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKSB7XHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgc2lnbiByZXF1ZXN0XHJcbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlU2lnblJlcXVlc3QobWV0aG9kLCBwYXJhbXMpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgc2lnbiByZXF1ZXN0IGZyb20gb3JpZ2luOicsIG9yaWdpbiwgdmFsaWRhdGlvbi5lcnJvcik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IC0zMjYwMixcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBzaWduIHJlcXVlc3Q6ICcgKyBzYW5pdGl6ZUVycm9yTWVzc2FnZSh2YWxpZGF0aW9uLmVycm9yKVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBtZXNzYWdlLCBhZGRyZXNzIH0gPSB2YWxpZGF0aW9uLnNhbml0aXplZDtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IENoZWNrIGlmIGV0aF9zaWduIGlzIGFsbG93ZWQgKGRpc2FibGVkIGJ5IGRlZmF1bHQpXHJcbiAgaWYgKG1ldGhvZCA9PT0gJ2V0aF9zaWduJykge1xyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBsb2FkKCdzZXR0aW5ncycpO1xyXG4gICAgY29uc3QgYWxsb3dFdGhTaWduID0gc2V0dGluZ3M/LmFsbG93RXRoU2lnbiB8fCBmYWxzZTtcclxuXHJcbiAgICBpZiAoIWFsbG93RXRoU2lnbikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ/Cfq4AgZXRoX3NpZ24gcmVxdWVzdCBibG9ja2VkIChkaXNhYmxlZCBpbiBzZXR0aW5ncyk6Jywgb3JpZ2luKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBlcnJvcjoge1xyXG4gICAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdldGhfc2lnbiBpcyBkaXNhYmxlZCBmb3Igc2VjdXJpdHkuIFVzZSBwZXJzb25hbF9zaWduIGluc3RlYWQsIG9yIGVuYWJsZSBldGhfc2lnbiBpbiB3YWxsZXQgc2V0dGluZ3MuJ1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2cgd2FybmluZyB3aGVuIGV0aF9zaWduIGlzIHVzZWQgKGV2ZW4gd2hlbiBlbmFibGVkKVxyXG4gICAgY29uc29sZS53YXJuKCfimqDvuI8gZXRoX3NpZ24gcmVxdWVzdCBhcHByb3ZlZCBieSBzZXR0aW5ncyBmcm9tOicsIG9yaWdpbik7XHJcbiAgfVxyXG5cclxuICAvLyBWZXJpZnkgdGhlIGFkZHJlc3MgbWF0Y2hlcyB0aGUgY29ubmVjdGVkIGFjY291bnRcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAoIXdhbGxldCB8fCB3YWxsZXQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICBtZXNzYWdlOiAnUmVxdWVzdGVkIGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggY29ubmVjdGVkIGFjY291bnQnXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpICsgJ19zaWduJztcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiBmb3IgcmVwbGF5IHByb3RlY3Rpb25cclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5zZXQoYXBwcm92YWxUb2tlbiwge1xyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgdXNlZDogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuc2V0KHJlcXVlc3RJZCwge1xyXG4gICAgICByZXNvbHZlLFxyXG4gICAgICByZWplY3QsXHJcbiAgICAgIG9yaWdpbixcclxuICAgICAgbWV0aG9kLFxyXG4gICAgICBzaWduUmVxdWVzdDogeyBtZXNzYWdlLCBhZGRyZXNzIH0sXHJcbiAgICAgIGFwcHJvdmFsVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249c2lnbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9Jm1ldGhvZD0ke21ldGhvZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NpZ24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NpZ25UeXBlZERhdGEgKEVJUC03MTIpIC0gU2lnbiB0eXBlZCBkYXRhXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNpZ25UeXBlZERhdGEocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCkge1xyXG4gIC8vIENoZWNrIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKCFhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ05vdCBhdXRob3JpemVkLiBQbGVhc2UgY29ubmVjdCB5b3VyIHdhbGxldCBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHNpZ24gcmVxdWVzdFxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKTtcclxuICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBJbnZhbGlkIHNpZ24gdHlwZWQgZGF0YSByZXF1ZXN0IGZyb20gb3JpZ2luOicsIG9yaWdpbiwgdmFsaWRhdGlvbi5lcnJvcik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IC0zMjYwMixcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBzaWduIHJlcXVlc3Q6ICcgKyBzYW5pdGl6ZUVycm9yTWVzc2FnZSh2YWxpZGF0aW9uLmVycm9yKVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBhZGRyZXNzLCB0eXBlZERhdGEgfSA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBWZXJpZnkgdGhlIGFkZHJlc3MgbWF0Y2hlcyB0aGUgY29ubmVjdGVkIGFjY291bnRcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAoIXdhbGxldCB8fCB3YWxsZXQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICBtZXNzYWdlOiAnUmVxdWVzdGVkIGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggY29ubmVjdGVkIGFjY291bnQnXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpICsgJ19zaWduVHlwZWQnO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBtZXRob2QsXHJcbiAgICAgIHNpZ25SZXF1ZXN0OiB7IHR5cGVkRGF0YSwgYWRkcmVzcyB9LFxyXG4gICAgICBhcHByb3ZhbFRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXNpZ25UeXBlZCZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9Jm1ldGhvZD0ke21ldGhvZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2NTBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NpZ24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgbWVzc2FnZSBzaWduaW5nIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNlc3Npb25Ub2tlbikge1xyXG4gIGlmICghcGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRoZSByZXF1ZXN0JykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCBnZXQgcGFzc3dvcmRcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gVW5sb2NrIHdhbGxldCAoYXV0by11cGdyYWRlIGlmIG5lZWRlZClcclxuICAgIGNvbnN0IHsgc2lnbmVyIH0gPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCflJAgQXV0by11cGdyYWRpbmcgd2FsbGV0OiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IHNpZ25hdHVyZTtcclxuXHJcbiAgICAvLyBTaWduIGJhc2VkIG9uIG1ldGhvZFxyXG4gICAgaWYgKG1ldGhvZCA9PT0gJ3BlcnNvbmFsX3NpZ24nIHx8IG1ldGhvZCA9PT0gJ2V0aF9zaWduJykge1xyXG4gICAgICBzaWduYXR1cmUgPSBhd2FpdCBwZXJzb25hbFNpZ24oc2lnbmVyLCBzaWduUmVxdWVzdC5tZXNzYWdlKTtcclxuICAgIH0gZWxzZSBpZiAobWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykpIHtcclxuICAgICAgc2lnbmF0dXJlID0gYXdhaXQgc2lnblR5cGVkRGF0YShzaWduZXIsIHNpZ25SZXF1ZXN0LnR5cGVkRGF0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHNpZ25pbmcgbWV0aG9kOiAke21ldGhvZH1gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaWduYXR1cmUgZ2VuZXJhdGVkIHN1Y2Nlc3NmdWxseVxyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgTWVzc2FnZSBzaWduZWQgZm9yIG9yaWdpbjonLCBvcmlnaW4pO1xyXG5cclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHNpZ25hdHVyZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHNpZ25hdHVyZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHNpZ25pbmcgbWVzc2FnZTonLCBlcnJvcik7XHJcbiAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgc2lnbiByZXF1ZXN0IGRldGFpbHMgKGZvciBwb3B1cClcclxuZnVuY3Rpb24gZ2V0U2lnblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgcmV0dXJuIHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbn1cclxuXHJcbi8vIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSBjb250ZW50IHNjcmlwdHMgYW5kIHBvcHVwXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAvLyBSZWNlaXZlZCBtZXNzYWdlXHJcblxyXG4gIChhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ1dBTExFVF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZVdhbGxldFJlcXVlc3QobWVzc2FnZSwgc2VuZGVyKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NPTk5FQ1RJT05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgYXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyBhcHByb3ZhbCByZXNwb25zZVxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ09OTkVDVElPTl9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHJlcXVlc3RJbmZvID0gZ2V0Q29ubmVjdGlvblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyBjb25uZWN0aW9uIHJlcXVlc3QgaW5mb1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ09OTkVDVEVEX1NJVEVTJzpcclxuICAgICAgICAgIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgY29ubmVjdGVkIHNpdGVzJyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBzaXRlcyB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdESVNDT05ORUNUX1NJVEUnOlxyXG4gICAgICAgICAgYXdhaXQgcmVtb3ZlQ29ubmVjdGVkU2l0ZShtZXNzYWdlLm9yaWdpbik7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGRpc2Nvbm5lY3QgY29uZmlybWF0aW9uXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1RSQU5TQUNUSU9OX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHR4QXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkLCBtZXNzYWdlLnNlc3Npb25Ub2tlbiwgbWVzc2FnZS5nYXNQcmljZSwgbWVzc2FnZS5jdXN0b21Ob25jZSk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIHRyYW5zYWN0aW9uIGFwcHJvdmFsIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodHhBcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ1JFQVRFX1NFU1NJT04nOlxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvblRva2VuID0gYXdhaXQgY3JlYXRlU2Vzc2lvbihtZXNzYWdlLnBhc3N3b3JkLCBtZXNzYWdlLndhbGxldElkLCBtZXNzYWdlLmR1cmF0aW9uTXMpO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBzZXNzaW9uVG9rZW4gfSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnSU5WQUxJREFURV9TRVNTSU9OJzpcclxuICAgICAgICAgIGNvbnN0IGludmFsaWRhdGVkID0gaW52YWxpZGF0ZVNlc3Npb24obWVzc2FnZS5zZXNzaW9uVG9rZW4pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogaW52YWxpZGF0ZWQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnSU5WQUxJREFURV9BTExfU0VTU0lPTlMnOlxyXG4gICAgICAgICAgY29uc3QgY291bnQgPSBpbnZhbGlkYXRlQWxsU2Vzc2lvbnMoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGNvdW50IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9UUkFOU0FDVElPTl9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHR4UmVxdWVzdEluZm8gPSBnZXRUcmFuc2FjdGlvblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0cmFuc2FjdGlvbiByZXF1ZXN0IGluZm86JywgdHhSZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodHhSZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVE9LRU5fQUREX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHRva2VuQXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgdG9rZW4gYWRkIGFwcHJvdmFsIHJlc3BvbnNlOicsIHRva2VuQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHRva2VuQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NJR05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnbkFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlU2lnbkFwcHJvdmFsKFxyXG4gICAgICAgICAgICBtZXNzYWdlLnJlcXVlc3RJZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5hcHByb3ZlZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHNpZ24gYXBwcm92YWwgcmVzcG9uc2U6Jywgc2lnbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzaWduQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9TSUdOX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnblJlcXVlc3RJbmZvID0gZ2V0U2lnblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBzaWduIHJlcXVlc3QgaW5mbzonLCBzaWduUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNpZ25SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RPS0VOX0FERF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHRva2VuUmVxdWVzdEluZm8gPSBnZXRUb2tlbkFkZFJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgcmVxdWVzdCBpbmZvOicsIHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zYWN0aW9uIEhpc3RvcnlcclxuICAgICAgICBjYXNlICdHRVRfVFhfSElTVE9SWSc6XHJcbiAgICAgICAgICBjb25zdCB0eEhpc3RvcnlMaXN0ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4SGlzdG9yeShtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHJhbnNhY3Rpb25zOiB0eEhpc3RvcnlMaXN0IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9QRU5ESU5HX1RYX0NPVU5UJzpcclxuICAgICAgICAgIGNvbnN0IHBlbmRpbmdDb3VudCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhDb3VudChtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQ6IHBlbmRpbmdDb3VudCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfUEVORElOR19UWFMnOlxyXG4gICAgICAgICAgY29uc3QgcGVuZGluZ1R4cyA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhzKG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbnM6IHBlbmRpbmdUeHMgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RYX0JZX0hBU0gnOlxyXG4gICAgICAgICAgY29uc3QgdHhEZXRhaWwgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2gobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnR4SGFzaCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbjogdHhEZXRhaWwgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0FWRV9UWCc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnRyYW5zYWN0aW9uKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0FWRV9BTkRfTU9OSVRPUl9UWCc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnRyYW5zYWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAvLyBTdGFydCBtb25pdG9yaW5nIGZvciBjb25maXJtYXRpb24gaW4gYmFja2dyb3VuZFxyXG4gICAgICAgICAgKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gbWVzc2FnZS50cmFuc2FjdGlvbi5uZXR3b3JrIHx8ICdwdWxzZWNoYWluVGVzdG5ldCc7XHJcbiAgICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICAgICAgICAgICAgY29uc3QgdHggPSB7IGhhc2g6IG1lc3NhZ2UudHJhbnNhY3Rpb24uaGFzaCB9O1xyXG4gICAgICAgICAgICAgIGF3YWl0IHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG1vbml0b3JpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0xFQVJfVFhfSElTVE9SWSc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuY2xlYXJUeEhpc3RvcnkobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX0NVUlJFTlRfR0FTX1BSSUNFJzpcclxuICAgICAgICAgIGNvbnN0IGdhc1ByaWNlUmVzdWx0ID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmtHYXNQcmljZShtZXNzYWdlLm5ldHdvcmspO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGdhc1ByaWNlUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdSRUZSRVNIX1RYX1NUQVRVUyc6XHJcbiAgICAgICAgICBjb25zdCByZWZyZXNoUmVzdWx0ID0gYXdhaXQgcmVmcmVzaFRyYW5zYWN0aW9uU3RhdHVzKFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLm5ldHdvcmtcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVmcmVzaFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU1BFRURfVVBfVFgnOlxyXG4gICAgICAgICAgY29uc3Qgc3BlZWRVcFJlc3VsdCA9IGF3YWl0IGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuZ2FzUHJpY2VNdWx0aXBsaWVyIHx8IDEuMixcclxuICAgICAgICAgICAgbWVzc2FnZS5jdXN0b21HYXNQcmljZSB8fCBudWxsXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNwZWVkVXBSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NBTkNFTF9UWCc6XHJcbiAgICAgICAgICBjb25zdCBjYW5jZWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuY3VzdG9tR2FzUHJpY2UgfHwgbnVsbFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShjYW5jZWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBVbmtub3duIG1lc3NhZ2UgdHlwZTonLCBtZXNzYWdlLnR5cGUpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5rbm93biBtZXNzYWdlIHR5cGUnIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGhhbmRsaW5nIG1lc3NhZ2U6JywgZXJyb3IpO1xyXG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICB9XHJcbiAgfSkoKTtcclxuXHJcbiAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlXHJcbn0pO1xyXG5cclxuY29uc29sZS5sb2coJ/Cfq4AgSGVhcnRXYWxsZXQgc2VydmljZSB3b3JrZXIgcmVhZHknKTtcclxuIl0sIm5hbWVzIjpbImV0aGVycy5nZXRBZGRyZXNzIiwiZXRoZXJzLmdldEJ5dGVzIiwiZXRoZXJzLnRvVXRmOFN0cmluZyIsImV0aGVycy5pc0FkZHJlc3MiLCJycGMuZ2V0QmxvY2tOdW1iZXIiLCJycGMuZ2V0QmxvY2tCeU51bWJlciIsInJwYy5nZXRCYWxhbmNlIiwicnBjLmdldFRyYW5zYWN0aW9uQ291bnQiLCJycGMuZ2V0R2FzUHJpY2UiLCJycGMuZXN0aW1hdGVHYXMiLCJycGMuY2FsbCIsInJwYy5zZW5kUmF3VHJhbnNhY3Rpb24iLCJycGMuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0IiwicnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoIiwicnBjLmdldFByb3ZpZGVyIiwicnBjLmdldFNhZmVHYXNQcmljZSIsInR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeSIsInR4SGlzdG9yeS5UWF9TVEFUVVMiLCJ0eEhpc3RvcnkuVFhfVFlQRVMiLCJ0eEhpc3RvcnkuZ2V0VHhCeUhhc2giLCJ0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMiLCJ0eEhpc3RvcnkuZ2V0VHhIaXN0b3J5IiwidHhIaXN0b3J5LmdldFBlbmRpbmdUeENvdW50IiwidHhIaXN0b3J5LmdldFBlbmRpbmdUeHMiLCJ0eEhpc3RvcnkuY2xlYXJUeEhpc3RvcnkiXSwibWFwcGluZ3MiOiI7QUFRQSxNQUFNLGlCQUFpQjtBQUN2QixNQUFNLDBCQUEwQjtBQUNoQyxNQUFNLHNCQUFzQjtBQUdyQixNQUFNLFdBQVc7QUFBQSxFQUV0QixVQUFVO0FBRVo7QUFHTyxNQUFNLFlBQVk7QUFBQSxFQUN2QixTQUFTO0FBQUEsRUFDVCxXQUFXO0FBQUEsRUFDWCxRQUFRO0FBQ1Y7QUFLTyxlQUFlLHVCQUF1QjtBQUMzQyxRQUFNLFdBQVcsTUFBTSxLQUFLLHVCQUF1QjtBQUNuRCxTQUFPLFlBQVk7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
