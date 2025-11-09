import { l as load, s as save, G as getAddress, x as getBytes, y as toUtf8String, i as isAddress, u as unlockWallet, g as getProvider, b as getActiveWallet, H as getTransactionByHash, I as getTransactionReceipt, J as sendRawTransaction, z as getGasPrice, A as estimateGas, K as call, B as getTransactionCount, j as getBalance, L as getBlockByNumber, M as getBlockNumber } from "./rpc.js";
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
    const { signer } = await unlockWallet(password);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeEhpc3RvcnlTZXR0aW5ncyhzZXR0aW5ncykge1xyXG4gIGF3YWl0IHNhdmUoVFhfSElTVE9SWV9TRVRUSU5HU19LRVksIHNldHRpbmdzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QWxsSGlzdG9yeSgpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgbG9hZChUWF9ISVNUT1JZX0tFWSk7XHJcbiAgcmV0dXJuIGhpc3RvcnkgfHwge307XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYXZlIGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KSB7XHJcbiAgYXdhaXQgc2F2ZShUWF9ISVNUT1JZX0tFWSwgaGlzdG9yeSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYSBzcGVjaWZpYyBhZGRyZXNzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGdldFR4SGlzdG9yeVNldHRpbmdzKCk7XHJcbiAgaWYgKCFzZXR0aW5ncy5lbmFibGVkKSB7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCFoaXN0b3J5W2FkZHJlc3NMb3dlcl0pIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIHJldHVybiBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zIHx8IFtdO1xyXG59XHJcblxyXG4vKipcclxuICogQWRkIGEgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIHR4RGF0YSkge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybjsgLy8gSGlzdG9yeSBkaXNhYmxlZFxyXG4gIH1cclxuXHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIC8vIEluaXRpYWxpemUgYWRkcmVzcyBoaXN0b3J5IGlmIGRvZXNuJ3QgZXhpc3RcclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgaGlzdG9yeVthZGRyZXNzTG93ZXJdID0geyB0cmFuc2FjdGlvbnM6IFtdIH07XHJcbiAgfVxyXG5cclxuICAvLyBBZGQgbmV3IHRyYW5zYWN0aW9uIGF0IGJlZ2lubmluZyAobmV3ZXN0IGZpcnN0KVxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMudW5zaGlmdCh7XHJcbiAgICBoYXNoOiB0eERhdGEuaGFzaCxcclxuICAgIHRpbWVzdGFtcDogdHhEYXRhLnRpbWVzdGFtcCB8fCBEYXRlLm5vdygpLFxyXG4gICAgZnJvbTogdHhEYXRhLmZyb20udG9Mb3dlckNhc2UoKSxcclxuICAgIHRvOiB0eERhdGEudG8gPyB0eERhdGEudG8udG9Mb3dlckNhc2UoKSA6IG51bGwsXHJcbiAgICB2YWx1ZTogdHhEYXRhLnZhbHVlIHx8ICcwJyxcclxuICAgIGdhc1ByaWNlOiB0eERhdGEuZ2FzUHJpY2UsXHJcbiAgICBub25jZTogdHhEYXRhLm5vbmNlLFxyXG4gICAgbmV0d29yazogdHhEYXRhLm5ldHdvcmssXHJcbiAgICBzdGF0dXM6IHR4RGF0YS5zdGF0dXMgfHwgVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICBibG9ja051bWJlcjogdHhEYXRhLmJsb2NrTnVtYmVyIHx8IG51bGwsXHJcbiAgICB0eXBlOiB0eERhdGEudHlwZSB8fCBUWF9UWVBFUy5DT05UUkFDVFxyXG4gIH0pO1xyXG5cclxuICAvLyBFbmZvcmNlIG1heCBsaW1pdCAoRklGTyAtIHJlbW92ZSBvbGRlc3QpXHJcbiAgaWYgKGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMubGVuZ3RoID4gTUFYX1RYU19QRVJfQUREUkVTUykge1xyXG4gICAgaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucyA9IGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMuc2xpY2UoMCwgTUFYX1RYU19QRVJfQUREUkVTUyk7XHJcbiAgfVxyXG5cclxuICBhd2FpdCBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KTtcclxuICAvLyBUcmFuc2FjdGlvbiBhZGRlZFxyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRyYW5zYWN0aW9uIHN0YXR1c1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVR4U3RhdHVzKGFkZHJlc3MsIHR4SGFzaCwgc3RhdHVzLCBibG9ja051bWJlciA9IG51bGwpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCFoaXN0b3J5W2FkZHJlc3NMb3dlcl0pIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGNvbnN0IHR4SW5kZXggPSBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zLmZpbmRJbmRleChcclxuICAgIHR4ID0+IHR4Lmhhc2gudG9Mb3dlckNhc2UoKSA9PT0gdHhIYXNoLnRvTG93ZXJDYXNlKClcclxuICApO1xyXG5cclxuICBpZiAodHhJbmRleCA9PT0gLTEpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnNbdHhJbmRleF0uc3RhdHVzID0gc3RhdHVzO1xyXG4gIGlmIChibG9ja051bWJlciAhPT0gbnVsbCkge1xyXG4gICAgaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9uc1t0eEluZGV4XS5ibG9ja051bWJlciA9IGJsb2NrTnVtYmVyO1xyXG4gIH1cclxuXHJcbiAgYXdhaXQgc2F2ZUFsbEhpc3RvcnkoaGlzdG9yeSk7XHJcbiAgLy8gVHJhbnNhY3Rpb24gc3RhdHVzIHVwZGF0ZWRcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBwZW5kaW5nIHRyYW5zYWN0aW9ucyBmb3IgYW4gYWRkcmVzc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdUeHMoYWRkcmVzcykge1xyXG4gIGNvbnN0IHR4cyA9IGF3YWl0IGdldFR4SGlzdG9yeShhZGRyZXNzKTtcclxuICByZXR1cm4gdHhzLmZpbHRlcih0eCA9PiB0eC5zdGF0dXMgPT09IFRYX1NUQVRVUy5QRU5ESU5HKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBwZW5kaW5nIHRyYW5zYWN0aW9uIGNvdW50IGZvciBhbiBhZGRyZXNzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVuZGluZ1R4Q291bnQoYWRkcmVzcykge1xyXG4gIGNvbnN0IHBlbmRpbmdUeHMgPSBhd2FpdCBnZXRQZW5kaW5nVHhzKGFkZHJlc3MpO1xyXG4gIHJldHVybiBwZW5kaW5nVHhzLmxlbmd0aDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0cmFuc2FjdGlvbiBieSBoYXNoXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VHhCeUhhc2goYWRkcmVzcywgdHhIYXNoKSB7XHJcbiAgY29uc3QgdHhzID0gYXdhaXQgZ2V0VHhIaXN0b3J5KGFkZHJlc3MpO1xyXG4gIHJldHVybiB0eHMuZmluZCh0eCA9PiB0eC5oYXNoLnRvTG93ZXJDYXNlKCkgPT09IHR4SGFzaC50b0xvd2VyQ2FzZSgpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENsZWFyIGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5IGZvciBhbiBhZGRyZXNzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoaGlzdG9yeVthZGRyZXNzTG93ZXJdKSB7XHJcbiAgICBkZWxldGUgaGlzdG9yeVthZGRyZXNzTG93ZXJdO1xyXG4gICAgYXdhaXQgc2F2ZUFsbEhpc3RvcnkoaGlzdG9yeSk7XHJcbiAgICAvLyBUcmFuc2FjdGlvbiBoaXN0b3J5IGNsZWFyZWRcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGVhciBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSAoYWxsIGFkZHJlc3NlcylcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckFsbFR4SGlzdG9yeSgpIHtcclxuICBhd2FpdCBzYXZlKFRYX0hJU1RPUllfS0VZLCB7fSk7XHJcbiAgLy8gQWxsIHRyYW5zYWN0aW9uIGhpc3RvcnkgY2xlYXJlZFxyXG59XHJcblxyXG4vKipcclxuICogRXhwb3J0IHRyYW5zYWN0aW9uIGhpc3RvcnkgYXMgSlNPTiAoZm9yIGRlYnVnZ2luZylcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRUeEhpc3RvcnkoYWRkcmVzcykge1xyXG4gIGNvbnN0IHR4cyA9IGF3YWl0IGdldFR4SGlzdG9yeShhZGRyZXNzKTtcclxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodHhzLCBudWxsLCAyKTtcclxufVxyXG4iLCIvKipcclxuICogY29yZS90eFZhbGlkYXRpb24uanNcclxuICpcclxuICogVHJhbnNhY3Rpb24gdmFsaWRhdGlvbiB1dGlsaXRpZXMgZm9yIHNlY3VyaXR5XHJcbiAqIFZhbGlkYXRlcyBhbGwgdHJhbnNhY3Rpb24gcGFyYW1ldGVycyBiZWZvcmUgcHJvY2Vzc2luZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgdHJhbnNhY3Rpb24gcmVxdWVzdCBmcm9tIGEgZEFwcFxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHhSZXF1ZXN0IC0gVHJhbnNhY3Rpb24gcmVxdWVzdCBvYmplY3RcclxuICogQHBhcmFtIHtudW1iZXJ9IG1heEdhc1ByaWNlR3dlaSAtIE1heGltdW0gYWxsb3dlZCBnYXMgcHJpY2UgaW4gR3dlaSAoZGVmYXVsdCAxMDAwKVxyXG4gKiBAcmV0dXJucyB7eyB2YWxpZDogYm9vbGVhbiwgZXJyb3JzOiBzdHJpbmdbXSwgc2FuaXRpemVkOiBPYmplY3QgfX1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCh0eFJlcXVlc3QsIG1heEdhc1ByaWNlR3dlaSA9IDEwMDApIHtcclxuICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICBjb25zdCBzYW5pdGl6ZWQgPSB7fTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3RvJyBhZGRyZXNzIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0LnRvICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnRvICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC50byAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkSGV4QWRkcmVzcyh0eFJlcXVlc3QudG8pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInRvXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLnRvID0gZXRoZXJzLmdldEFkZHJlc3ModHhSZXF1ZXN0LnRvKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdmcm9tJyBhZGRyZXNzIGlmIHByZXNlbnQgKHNob3VsZCBtYXRjaCB3YWxsZXQgYWRkcmVzcylcclxuICBpZiAodHhSZXF1ZXN0LmZyb20gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZnJvbSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZnJvbSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIEV0aGVyZXVtIGFkZHJlc3MnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2FuaXRpemVkLmZyb20gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QuZnJvbSk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBpcyBub3QgYSB2YWxpZCBhZGRyZXNzJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICd2YWx1ZScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LnZhbHVlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LnZhbHVlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QudmFsdWUpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcInZhbHVlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWVCaWdJbnQgPSBCaWdJbnQodHhSZXF1ZXN0LnZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWVCaWdJbnQgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLnZhbHVlID0gdHhSZXF1ZXN0LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQudmFsdWUgPSAnMHgwJzsgLy8gRGVmYXVsdCB0byAwXHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZGF0YScgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LmRhdGEgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QuZGF0YSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0eFJlcXVlc3QuZGF0YSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZGF0YVwiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhEYXRhKHR4UmVxdWVzdC5kYXRhKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSB2YWxpZCBoZXggZGF0YScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2FuaXRpemVkLmRhdGEgPSB0eFJlcXVlc3QuZGF0YTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgc2FuaXRpemVkLmRhdGEgPSAnMHgnOyAvLyBEZWZhdWx0IHRvIGVtcHR5IGRhdGFcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdnYXMnIG9yICdnYXNMaW1pdCcgZmllbGRcclxuICBpZiAodHhSZXF1ZXN0LmdhcyAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5nYXMgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5nYXMpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGZpZWxkIG11c3QgYmUgYSB2YWxpZCBoZXggc3RyaW5nJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGdhc0xpbWl0ID0gQmlnSW50KHR4UmVxdWVzdC5nYXMpO1xyXG4gICAgICAgIGlmIChnYXNMaW1pdCA8IDIxMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgbGltaXQgdG9vIGxvdyAobWluaW11bSAyMTAwMCknKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc0xpbWl0ID4gMzAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBsaW1pdCB0b28gaGlnaCAobWF4aW11bSAzMDAwMDAwMCknKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLmdhcyA9IHR4UmVxdWVzdC5nYXM7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKHR4UmVxdWVzdC5nYXNMaW1pdCAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5nYXNMaW1pdCAhPT0gbnVsbCkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGV4VmFsdWUodHhSZXF1ZXN0Lmdhc0xpbWl0KSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIGZpZWxkIG11c3QgYmUgYSB2YWxpZCBoZXggc3RyaW5nJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGdhc0xpbWl0ID0gQmlnSW50KHR4UmVxdWVzdC5nYXNMaW1pdCk7XHJcbiAgICAgICAgaWYgKGdhc0xpbWl0IDwgMjEwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIHRvbyBsb3cgKG1pbmltdW0gMjEwMDApJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnYXNMaW1pdCA+IDMwMDAwMDAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiB0b28gaGlnaCAobWF4aW11bSAzMDAwMDAwMCknKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLmdhc0xpbWl0ID0gdHhSZXF1ZXN0Lmdhc0xpbWl0O1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzTGltaXRcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2dhc1ByaWNlJyBmaWVsZCBpZiBwcmVzZW50XHJcbiAgaWYgKHR4UmVxdWVzdC5nYXNQcmljZSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5nYXNQcmljZSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGV4VmFsdWUodHhSZXF1ZXN0Lmdhc1ByaWNlKSkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNQcmljZVwiIGZpZWxkIG11c3QgYmUgYSB2YWxpZCBoZXggc3RyaW5nJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGdhc1ByaWNlID0gQmlnSW50KHR4UmVxdWVzdC5nYXNQcmljZSk7XHJcbiAgICAgICAgY29uc3QgbWF4R2FzUHJpY2VXZWkgPSBCaWdJbnQobWF4R2FzUHJpY2VHd2VpKSAqIEJpZ0ludCgnMTAwMDAwMDAwMCcpOyAvLyBDb252ZXJ0IEd3ZWkgdG8gV2VpXHJcbiAgICAgICAgaWYgKGdhc1ByaWNlIDwgMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgY2Fubm90IGJlIG5lZ2F0aXZlJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnYXNQcmljZSA+IG1heEdhc1ByaWNlV2VpKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaChgSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNQcmljZVwiIGV4Y2VlZHMgbWF4aW11bSBvZiAke21heEdhc1ByaWNlR3dlaX0gR3dlaWApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzUHJpY2UgPSB0eFJlcXVlc3QuZ2FzUHJpY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNQcmljZVwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnbm9uY2UnIGZpZWxkIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0Lm5vbmNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lm5vbmNlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3Qubm9uY2UpICYmIHR5cGVvZiB0eFJlcXVlc3Qubm9uY2UgIT09ICdudW1iZXInKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIG51bWJlciBvciBoZXggc3RyaW5nJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IG5vbmNlID0gdHlwZW9mIHR4UmVxdWVzdC5ub25jZSA9PT0gJ3N0cmluZycgXHJcbiAgICAgICAgICA/IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpIFxyXG4gICAgICAgICAgOiBCaWdJbnQodHhSZXF1ZXN0Lm5vbmNlKTtcclxuICAgICAgICBpZiAobm9uY2UgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG5vbmNlID4gQmlnSW50KCc5MDA3MTk5MjU0NzQwOTkxJykpIHsgLy8gSmF2YVNjcmlwdCBzYWZlIGludGVnZXIgbWF4XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGlzIHVucmVhc29uYWJseSBoaWdoJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5ub25jZSA9IHR4UmVxdWVzdC5ub25jZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFRyYW5zYWN0aW9uIG11c3QgaGF2ZSBlaXRoZXIgJ3RvJyBvciAnZGF0YScgKGNvbnRyYWN0IGNyZWF0aW9uKVxyXG4gIGlmICghc2FuaXRpemVkLnRvICYmICghc2FuaXRpemVkLmRhdGEgfHwgc2FuaXRpemVkLmRhdGEgPT09ICcweCcpKSB7XHJcbiAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogbXVzdCBoYXZlIFwidG9cIiBhZGRyZXNzIG9yIFwiZGF0YVwiIGZvciBjb250cmFjdCBjcmVhdGlvbicpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLFxyXG4gICAgZXJyb3JzLFxyXG4gICAgc2FuaXRpemVkXHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhbiBFdGhlcmV1bSBhZGRyZXNzIChoZXggZm9ybWF0KVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYWRkcmVzcyAtIEFkZHJlc3MgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBpc1ZhbGlkSGV4QWRkcmVzcyhhZGRyZXNzKSB7XHJcbiAgaWYgKHR5cGVvZiBhZGRyZXNzICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIE11c3QgYmUgNDIgY2hhcmFjdGVyczogMHggKyA0MCBoZXggZGlnaXRzXHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXXs0MH0kLy50ZXN0KGFkZHJlc3MpO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgaGV4IHZhbHVlIChmb3IgYW1vdW50cywgZ2FzLCBldGMuKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBIZXggdmFsdWUgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBpc1ZhbGlkSGV4VmFsdWUodmFsdWUpIHtcclxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIE11c3Qgc3RhcnQgd2l0aCAweCBhbmQgY29udGFpbiBvbmx5IGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdKyQvLnRlc3QodmFsdWUpO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGhleCBkYXRhIChmb3IgdHJhbnNhY3Rpb24gZGF0YSBmaWVsZClcclxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBIZXggZGF0YSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhEYXRhKGRhdGEpIHtcclxuICBpZiAodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSAweCBvciAweCBmb2xsb3dlZCBieSBldmVuIG51bWJlciBvZiBoZXggZGlnaXRzXHJcbiAgaWYgKGRhdGEgPT09ICcweCcpIHJldHVybiB0cnVlO1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0qJC8udGVzdChkYXRhKSAmJiBkYXRhLmxlbmd0aCAlIDIgPT09IDA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdGl6ZXMgYW4gZXJyb3IgbWVzc2FnZSBmb3Igc2FmZSBkaXNwbGF5XHJcbiAqIFJlbW92ZXMgYW55IEhUTUwsIHNjcmlwdHMsIGFuZCBjb250cm9sIGNoYXJhY3RlcnNcclxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBFcnJvciBtZXNzYWdlIHRvIHNhbml0aXplXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFNhbml0aXplZCBtZXNzYWdlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVFcnJvck1lc3NhZ2UobWVzc2FnZSkge1xyXG4gIGlmICh0eXBlb2YgbWVzc2FnZSAhPT0gJ3N0cmluZycpIHJldHVybiAnVW5rbm93biBlcnJvcic7XHJcbiAgXHJcbiAgLy8gUmVtb3ZlIG51bGwgYnl0ZXMgYW5kIGNvbnRyb2wgY2hhcmFjdGVycyAoZXhjZXB0IG5ld2xpbmVzIGFuZCB0YWJzKVxyXG4gIGxldCBzYW5pdGl6ZWQgPSBtZXNzYWdlLnJlcGxhY2UoL1tcXHgwMC1cXHgwOFxceDBCXFx4MENcXHgwRS1cXHgxRlxceDdGXS9nLCAnJyk7XHJcbiAgXHJcbiAgLy8gUmVtb3ZlIEhUTUwgdGFnc1xyXG4gIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKC88W14+XSo+L2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgc2NyaXB0LWxpa2UgY29udGVudFxyXG4gIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKC9qYXZhc2NyaXB0Oi9naSwgJycpO1xyXG4gIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKC9vblxcdytcXHMqPS9naSwgJycpO1xyXG4gIFxyXG4gIC8vIExpbWl0IGxlbmd0aCB0byBwcmV2ZW50IERvU1xyXG4gIGlmIChzYW5pdGl6ZWQubGVuZ3RoID4gNTAwKSB7XHJcbiAgICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZWQuc3Vic3RyaW5nKDAsIDQ5NykgKyAnLi4uJztcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIHNhbml0aXplZCB8fCAnVW5rbm93biBlcnJvcic7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdGl6ZXMgdXNlciBpbnB1dCBmb3Igc2FmZSBkaXNwbGF5IChwcmV2ZW50cyBYU1MpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCAtIFVzZXIgaW5wdXQgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIGlucHV0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVVc2VySW5wdXQoaW5wdXQpIHtcclxuICBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykgcmV0dXJuICcnO1xyXG4gIFxyXG4gIC8vIENyZWF0ZSBhIHRleHQgbm9kZSBhbmQgZXh0cmFjdCB0aGUgZXNjYXBlZCB0ZXh0XHJcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgZGl2LnRleHRDb250ZW50ID0gaW5wdXQ7XHJcbiAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XHJcbn1cclxuIiwiLyoqXHJcbiAqIGNvcmUvc2lnbmluZy5qc1xyXG4gKlxyXG4gKiBNZXNzYWdlIHNpZ25pbmcgZnVuY3Rpb25hbGl0eSBmb3IgRUlQLTE5MSBhbmQgRUlQLTcxMlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vKipcclxuICogU2lnbnMgYSBtZXNzYWdlIHVzaW5nIEVJUC0xOTEgKHBlcnNvbmFsX3NpZ24pXHJcbiAqIFRoaXMgcHJlcGVuZHMgXCJcXHgxOUV0aGVyZXVtIFNpZ25lZCBNZXNzYWdlOlxcblwiICsgbGVuKG1lc3NhZ2UpIHRvIHRoZSBtZXNzYWdlXHJcbiAqIGJlZm9yZSBzaWduaW5nLCB3aGljaCBwcmV2ZW50cyBzaWduaW5nIGFyYml0cmFyeSB0cmFuc2FjdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBzaWduIChoZXggc3RyaW5nIG9yIFVURi04IHN0cmluZylcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBlcnNvbmFsU2lnbihzaWduZXIsIG1lc3NhZ2UpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25NZXNzYWdlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2lnbmVyIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIElmIG1lc3NhZ2UgaXMgaGV4LWVuY29kZWQsIGRlY29kZSBpdCBmaXJzdFxyXG4gICAgLy8gZXRoZXJzLmpzIHNpZ25NZXNzYWdlIGV4cGVjdHMgYSBzdHJpbmcgb3IgVWludDhBcnJheVxyXG4gICAgbGV0IG1lc3NhZ2VUb1NpZ24gPSBtZXNzYWdlO1xyXG5cclxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5zdGFydHNXaXRoKCcweCcpKSB7XHJcbiAgICAgIC8vIEl0J3MgYSBoZXggc3RyaW5nLCBjb252ZXJ0IHRvIFVURi04XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gVHJ5IHRvIGRlY29kZSBhcyBoZXhcclxuICAgICAgICBjb25zdCBieXRlcyA9IGV0aGVycy5nZXRCeXRlcyhtZXNzYWdlKTtcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIElmIGRlY29kaW5nIGZhaWxzLCB1c2UgdGhlIGhleCBzdHJpbmcgYXMtaXNcclxuICAgICAgICAvLyBldGhlcnMgd2lsbCBoYW5kbGUgaXRcclxuICAgICAgICBtZXNzYWdlVG9TaWduID0gbWVzc2FnZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdGhlIG1lc3NhZ2UgKGV0aGVycy5qcyBhdXRvbWF0aWNhbGx5IGFwcGxpZXMgRUlQLTE5MSBmb3JtYXQpXHJcbiAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBzaWduZXIuc2lnbk1lc3NhZ2UobWVzc2FnZVRvU2lnbik7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiBtZXNzYWdlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2lnbnMgdHlwZWQgZGF0YSB1c2luZyBFSVAtNzEyXHJcbiAqIFVzZWQgYnkgZEFwcHMgZm9yIHN0cnVjdHVyZWQgZGF0YSBzaWduaW5nIChwZXJtaXRzLCBtZXRhLXRyYW5zYWN0aW9ucywgZXRjLilcclxuICpcclxuICogQHBhcmFtIHtldGhlcnMuV2FsbGV0fSBzaWduZXIgLSBXYWxsZXQgaW5zdGFuY2UgdG8gc2lnbiB3aXRoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZERhdGEgLSBFSVAtNzEyIHR5cGVkIGRhdGEgb2JqZWN0IHdpdGggZG9tYWluLCB0eXBlcywgYW5kIG1lc3NhZ2VcclxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gU2lnbmF0dXJlICgweC1wcmVmaXhlZCBoZXggc3RyaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25UeXBlZERhdGEoc2lnbmVyLCB0eXBlZERhdGEpIHtcclxuICBpZiAoIXNpZ25lciB8fCB0eXBlb2Ygc2lnbmVyLnNpZ25UeXBlZERhdGEgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaWduZXIgcHJvdmlkZWQnKTtcclxuICB9XHJcblxyXG4gIGlmICghdHlwZWREYXRhKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1R5cGVkIGRhdGEgaXMgcmVxdWlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHR5cGVkIGRhdGEgc3RydWN0dXJlXHJcbiAgaWYgKCF0eXBlZERhdGEuZG9tYWluIHx8ICF0eXBlZERhdGEudHlwZXMgfHwgIXR5cGVkRGF0YS5tZXNzYWdlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgRUlQLTcxMiB0eXBlZCBkYXRhOiBtaXNzaW5nIGRvbWFpbiwgdHlwZXMsIG9yIG1lc3NhZ2UnKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBFeHRyYWN0IHByaW1hcnlUeXBlIChpZiBub3QgcHJvdmlkZWQsIHRyeSB0byBpbmZlciBpdClcclxuICAgIGxldCBwcmltYXJ5VHlwZSA9IHR5cGVkRGF0YS5wcmltYXJ5VHlwZTtcclxuXHJcbiAgICBpZiAoIXByaW1hcnlUeXBlKSB7XHJcbiAgICAgIC8vIFRyeSB0byBpbmZlciBwcmltYXJ5IHR5cGUgZnJvbSB0eXBlcyBvYmplY3RcclxuICAgICAgLy8gSXQncyB0aGUgdHlwZSB0aGF0J3Mgbm90IFwiRUlQNzEyRG9tYWluXCJcclxuICAgICAgY29uc3QgdHlwZU5hbWVzID0gT2JqZWN0LmtleXModHlwZWREYXRhLnR5cGVzKS5maWx0ZXIodCA9PiB0ICE9PSAnRUlQNzEyRG9tYWluJyk7XHJcbiAgICAgIGlmICh0eXBlTmFtZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgcHJpbWFyeVR5cGUgPSB0eXBlTmFtZXNbMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgaW5mZXIgcHJpbWFyeVR5cGUgLSBwbGVhc2Ugc3BlY2lmeSBpdCBleHBsaWNpdGx5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBWYWxpZGF0ZSB0aGF0IHByaW1hcnlUeXBlIGV4aXN0cyBpbiB0eXBlc1xyXG4gICAgaWYgKCF0eXBlZERhdGEudHlwZXNbcHJpbWFyeVR5cGVdKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJpbWFyeSB0eXBlIFwiJHtwcmltYXJ5VHlwZX1cIiBub3QgZm91bmQgaW4gdHlwZXMgZGVmaW5pdGlvbmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ24gdXNpbmcgZXRoZXJzLmpzIHNpZ25UeXBlZERhdGFcclxuICAgIC8vIGV0aGVycyB2NiB1c2VzOiBzaWduVHlwZWREYXRhKGRvbWFpbiwgdHlwZXMsIHZhbHVlKVxyXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2lnbmVyLnNpZ25UeXBlZERhdGEoXHJcbiAgICAgIHR5cGVkRGF0YS5kb21haW4sXHJcbiAgICAgIHR5cGVkRGF0YS50eXBlcyxcclxuICAgICAgdHlwZWREYXRhLm1lc3NhZ2VcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2lnbiB0eXBlZCBkYXRhOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGEgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAtIFJQQyBtZXRob2QgKHBlcnNvbmFsX3NpZ24sIGV0aF9zaWduVHlwZWREYXRhX3Y0LCBldGMuKVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwYXJhbXMgLSBSUEMgcGFyYW1ldGVyc1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSB7IHZhbGlkOiBib29sZWFuLCBlcnJvcj86IHN0cmluZywgc2FuaXRpemVkPzogT2JqZWN0IH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKSB7XHJcbiAgaWYgKCFtZXRob2QgfHwgIXBhcmFtcyB8fCAhQXJyYXkuaXNBcnJheShwYXJhbXMpKSB7XHJcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCByZXF1ZXN0IGZvcm1hdCcgfTtcclxuICB9XHJcblxyXG4gIHN3aXRjaCAobWV0aG9kKSB7XHJcbiAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduJzogLy8gTm90ZTogZXRoX3NpZ24gaXMgZGFuZ2Vyb3VzIGFuZCBzaG91bGQgc2hvdyBzdHJvbmcgd2FybmluZ1xyXG4gICAgICBpZiAocGFyYW1zLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXJzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtZXNzYWdlID0gcGFyYW1zWzBdO1xyXG4gICAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzFdO1xyXG5cclxuICAgICAgaWYgKCFtZXNzYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01lc3NhZ2UgaXMgZW1wdHknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYWRkcmVzcyB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyZXNzKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhbml0aXplIG1lc3NhZ2UgKGNvbnZlcnQgdG8gc3RyaW5nIGlmIG5lZWRlZClcclxuICAgICAgY29uc3Qgc2FuaXRpemVkTWVzc2FnZSA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IG1lc3NhZ2UgOiBTdHJpbmcobWVzc2FnZSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHNhbml0aXplZDoge1xyXG4gICAgICAgICAgbWVzc2FnZTogc2FuaXRpemVkTWVzc2FnZSxcclxuICAgICAgICAgIGFkZHJlc3M6IGV0aGVycy5nZXRBZGRyZXNzKGFkZHJlc3MpIC8vIE5vcm1hbGl6ZSB0byBjaGVja3N1bSBhZGRyZXNzXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVycycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYWRkciA9IHBhcmFtc1swXTtcclxuICAgICAgbGV0IHR5cGVkRGF0YSA9IHBhcmFtc1sxXTtcclxuXHJcbiAgICAgIGlmICghYWRkciB8fCAhZXRoZXJzLmlzQWRkcmVzcyhhZGRyKSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFkZHJlc3MnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBhcnNlIHR5cGVkIGRhdGEgaWYgaXQncyBhIHN0cmluZ1xyXG4gICAgICBpZiAodHlwZW9mIHR5cGVkRGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdHlwZWREYXRhID0gSlNPTi5wYXJzZSh0eXBlZERhdGEpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgdHlwZWQgZGF0YSBmb3JtYXQnIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWYWxpZGF0ZSB0eXBlZCBkYXRhIHN0cnVjdHVyZVxyXG4gICAgICBpZiAoIXR5cGVkRGF0YSB8fCB0eXBlb2YgdHlwZWREYXRhICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdUeXBlZCBkYXRhIG11c3QgYmUgYW4gb2JqZWN0JyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXR5cGVkRGF0YS5kb21haW4gfHwgIXR5cGVkRGF0YS50eXBlcyB8fCAhdHlwZWREYXRhLm1lc3NhZ2UpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnVHlwZWQgZGF0YSBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyAoZG9tYWluLCB0eXBlcywgbWVzc2FnZSknIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsaWQ6IHRydWUsXHJcbiAgICAgICAgc2FuaXRpemVkOiB7XHJcbiAgICAgICAgICBhZGRyZXNzOiBldGhlcnMuZ2V0QWRkcmVzcyhhZGRyKSxcclxuICAgICAgICAgIHR5cGVkRGF0YTogdHlwZWREYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGBVbnN1cHBvcnRlZCBzaWduaW5nIG1ldGhvZDogJHttZXRob2R9YCB9O1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvcm1hdHMgYSBtZXNzYWdlIGZvciBkaXNwbGF5IGluIHRoZSBVSVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBtYXhMZW5ndGggLSBNYXhpbXVtIGRpc3BsYXkgbGVuZ3RoXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEZvcm1hdHRlZCBtZXNzYWdlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZUZvckRpc3BsYXkobWVzc2FnZSwgbWF4TGVuZ3RoID0gNTAwKSB7XHJcbiAgaWYgKCFtZXNzYWdlKSByZXR1cm4gJyc7XHJcblxyXG4gIGxldCBkaXNwbGF5TWVzc2FnZSA9IG1lc3NhZ2U7XHJcblxyXG4gIC8vIElmIGl0J3MgYSBoZXggc3RyaW5nLCB0cnkgdG8gZGVjb2RlIGl0XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyAmJiBtZXNzYWdlLnN0YXJ0c1dpdGgoJzB4JykpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGJ5dGVzID0gZXRoZXJzLmdldEJ5dGVzKG1lc3NhZ2UpO1xyXG4gICAgICBjb25zdCBkZWNvZGVkID0gZXRoZXJzLnRvVXRmOFN0cmluZyhieXRlcyk7XHJcbiAgICAgIC8vIE9ubHkgdXNlIGRlY29kZWQgaWYgaXQgbG9va3MgbGlrZSByZWFkYWJsZSB0ZXh0XHJcbiAgICAgIGlmICgvXltcXHgyMC1cXHg3RVxcc10rJC8udGVzdChkZWNvZGVkKSkge1xyXG4gICAgICAgIGRpc3BsYXlNZXNzYWdlID0gZGVjb2RlZDtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8vIEtlZXAgYXMgaGV4IGlmIGRlY29kaW5nIGZhaWxzXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBUcnVuY2F0ZSBpZiB0b28gbG9uZ1xyXG4gIGlmIChkaXNwbGF5TWVzc2FnZS5sZW5ndGggPiBtYXhMZW5ndGgpIHtcclxuICAgIHJldHVybiBkaXNwbGF5TWVzc2FnZS5zdWJzdHJpbmcoMCwgbWF4TGVuZ3RoKSArICcuLi4nO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGRpc3BsYXlNZXNzYWdlO1xyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0cyB0eXBlZCBkYXRhIGZvciBkaXNwbGF5IGluIHRoZSBVSVxyXG4gKiBAcGFyYW0ge09iamVjdH0gdHlwZWREYXRhIC0gRUlQLTcxMiB0eXBlZCBkYXRhXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEh1bWFuLXJlYWRhYmxlIGZvcm1hdHRlZCBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUeXBlZERhdGFGb3JEaXNwbGF5KHR5cGVkRGF0YSkge1xyXG4gIGlmICghdHlwZWREYXRhKSByZXR1cm4gJyc7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBDcmVhdGUgYSBzaW1wbGlmaWVkIHZpZXcgb2YgdGhlIHR5cGVkIGRhdGFcclxuICAgIGNvbnN0IGRpc3BsYXkgPSB7XHJcbiAgICAgIGRvbWFpbjogdHlwZWREYXRhLmRvbWFpbixcclxuICAgICAgcHJpbWFyeVR5cGU6IHR5cGVkRGF0YS5wcmltYXJ5VHlwZSB8fCAnVW5rbm93bicsXHJcbiAgICAgIG1lc3NhZ2U6IHR5cGVkRGF0YS5tZXNzYWdlXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkaXNwbGF5LCBudWxsLCAyKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0eXBlZERhdGEsIG51bGwsIDIpO1xyXG4gIH1cclxufVxyXG4iLCIvKipcclxuICogYmFja2dyb3VuZC9zZXJ2aWNlLXdvcmtlci5qc1xyXG4gKlxyXG4gKiBCYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyIGZvciBIZWFydFdhbGxldFxyXG4gKiBIYW5kbGVzIFJQQyByZXF1ZXN0cyBmcm9tIGRBcHBzIGFuZCBtYW5hZ2VzIHdhbGxldCBzdGF0ZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGdldEFjdGl2ZVdhbGxldCwgdW5sb2NrV2FsbGV0IH0gZnJvbSAnLi4vY29yZS93YWxsZXQuanMnO1xyXG5pbXBvcnQgeyBsb2FkLCBzYXZlIH0gZnJvbSAnLi4vY29yZS9zdG9yYWdlLmpzJztcclxuaW1wb3J0ICogYXMgcnBjIGZyb20gJy4uL2NvcmUvcnBjLmpzJztcclxuaW1wb3J0ICogYXMgdHhIaXN0b3J5IGZyb20gJy4uL2NvcmUvdHhIaXN0b3J5LmpzJztcclxuaW1wb3J0IHsgdmFsaWRhdGVUcmFuc2FjdGlvblJlcXVlc3QsIHNhbml0aXplRXJyb3JNZXNzYWdlIH0gZnJvbSAnLi4vY29yZS90eFZhbGlkYXRpb24uanMnO1xyXG5pbXBvcnQgeyBwZXJzb25hbFNpZ24sIHNpZ25UeXBlZERhdGEsIHZhbGlkYXRlU2lnblJlcXVlc3QgfSBmcm9tICcuLi9jb3JlL3NpZ25pbmcuanMnO1xyXG5pbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xyXG5cclxuLy8gU2VydmljZSB3b3JrZXIgbG9hZGVkXHJcblxyXG4vLyBOZXR3b3JrIGNoYWluIElEc1xyXG5jb25zdCBDSEFJTl9JRFMgPSB7XHJcbiAgJ3B1bHNlY2hhaW5UZXN0bmV0JzogJzB4M0FGJywgLy8gOTQzXHJcbiAgJ3B1bHNlY2hhaW4nOiAnMHgxNzEnLCAvLyAzNjlcclxuICAnZXRoZXJldW0nOiAnMHgxJywgLy8gMVxyXG4gICdzZXBvbGlhJzogJzB4QUEzNkE3JyAvLyAxMTE1NTExMVxyXG59O1xyXG5cclxuLy8gU3RvcmFnZSBrZXlzXHJcbmNvbnN0IENPTk5FQ1RFRF9TSVRFU19LRVkgPSAnY29ubmVjdGVkX3NpdGVzJztcclxuXHJcbi8vIFBlbmRpbmcgY29ubmVjdGlvbiByZXF1ZXN0cyAob3JpZ2luIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCB0YWJJZCB9KVxyXG5jb25zdCBwZW5kaW5nQ29ubmVjdGlvbnMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyA9PT09PSBTRVNTSU9OIE1BTkFHRU1FTlQgPT09PT1cclxuLy8gU2Vzc2lvbiB0b2tlbnMgc3RvcmVkIGluIG1lbW9yeSAoY2xlYXJlZCB3aGVuIHNlcnZpY2Ugd29ya2VyIHRlcm1pbmF0ZXMpXHJcbi8vIFNFQ1VSSVRZIE5PVEU6IFNlcnZpY2Ugd29ya2VycyBjYW4gYmUgdGVybWluYXRlZCBieSBDaHJvbWUgYXQgYW55IHRpbWUsIHdoaWNoIGNsZWFycyBhbGxcclxuLy8gc2Vzc2lvbiBkYXRhLiBUaGlzIGlzIGludGVudGlvbmFsIC0gd2UgZG9uJ3Qgd2FudCBwYXNzd29yZHMgcGVyc2lzdGluZyBsb25nZXIgdGhhbiBuZWVkZWQuXHJcbi8vIFNlc3Npb25zIGFyZSBlbmNyeXB0ZWQgaW4gbWVtb3J5IGFzIGFuIGFkZGl0aW9uYWwgc2VjdXJpdHkgbGF5ZXIuXHJcbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpOyAvLyBzZXNzaW9uVG9rZW4gLT4geyBlbmNyeXB0ZWRQYXNzd29yZCwgd2FsbGV0SWQsIGV4cGlyZXNBdCwgc2FsdCB9XHJcblxyXG4vLyBTZXNzaW9uIGVuY3J5cHRpb24ga2V5IChyZWdlbmVyYXRlZCBvbiBzZXJ2aWNlIHdvcmtlciBzdGFydClcclxubGV0IHNlc3Npb25FbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIHNlc3Npb24gZW5jcnlwdGlvbiBrZXkgdXNpbmcgV2ViIENyeXB0byBBUElcclxuICogS2V5IGlzIHJlZ2VuZXJhdGVkIGVhY2ggdGltZSBzZXJ2aWNlIHdvcmtlciBzdGFydHMgKG1lbW9yeSBvbmx5LCBuZXZlciBwZXJzaXN0ZWQpXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBpbml0U2Vzc2lvbkVuY3J5cHRpb24oKSB7XHJcbiAgaWYgKCFzZXNzaW9uRW5jcnlwdGlvbktleSkge1xyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gMjU2LWJpdCBrZXkgZm9yIEFFUy1HQ00gZW5jcnlwdGlvblxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcclxuICAgICAgZmFsc2UsIC8vIE5vdCBleHRyYWN0YWJsZVxyXG4gICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEVuY3J5cHRzIHBhc3N3b3JkIGZvciBzZXNzaW9uIHN0b3JhZ2UgdXNpbmcgQUVTLUdDTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBQYXNzd29yZCB0byBlbmNyeXB0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtlbmNyeXB0ZWQ6IEFycmF5QnVmZmVyLCBpdjogVWludDhBcnJheX0+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFBhc3N3b3JkRm9yU2Vzc2lvbihwYXNzd29yZCkge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICBjb25zdCBwYXNzd29yZERhdGEgPSBlbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcbiAgXHJcbiAgLy8gR2VuZXJhdGUgcmFuZG9tIElWIGZvciB0aGlzIGVuY3J5cHRpb25cclxuICAvLyBTRUNVUklUWTogSVYgdW5pcXVlbmVzcyBpcyBjcnlwdG9ncmFwaGljYWxseSBndWFyYW50ZWVkIGJ5IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKVxyXG4gIC8vIHdoaWNoIHVzZXMgdGhlIGJyb3dzZXIncyBDU1BSTkcgKENyeXB0b2dyYXBoaWNhbGx5IFNlY3VyZSBQc2V1ZG8tUmFuZG9tIE51bWJlciBHZW5lcmF0b3IpXHJcbiAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7XHJcbiAgXHJcbiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIHBhc3N3b3JkRGF0YVxyXG4gICk7XHJcbiAgXHJcbiAgcmV0dXJuIHsgZW5jcnlwdGVkLCBpdiB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVjcnlwdHMgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkIC0gRW5jcnlwdGVkIHBhc3N3b3JkIGRhdGFcclxuICogQHBhcmFtIHtVaW50OEFycmF5fSBpdiAtIEluaXRpYWxpemF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oZW5jcnlwdGVkLCBpdikge1xyXG4gIGF3YWl0IGluaXRTZXNzaW9uRW5jcnlwdGlvbigpO1xyXG4gIFxyXG4gIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcclxuICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxyXG4gICAgc2Vzc2lvbkVuY3J5cHRpb25LZXksXHJcbiAgICBlbmNyeXB0ZWRcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuICByZXR1cm4gZGVjb2Rlci5kZWNvZGUoZGVjcnlwdGVkKTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlc3Npb24gdG9rZW5cclxuZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBuZXcgc2Vzc2lvblxyXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVTZXNzaW9uKHBhc3N3b3JkLCB3YWxsZXRJZCwgZHVyYXRpb25NcyA9IDM2MDAwMDApIHsgLy8gRGVmYXVsdCAxIGhvdXJcclxuICBjb25zdCBzZXNzaW9uVG9rZW4gPSBnZW5lcmF0ZVNlc3Npb25Ub2tlbigpO1xyXG4gIGNvbnN0IGV4cGlyZXNBdCA9IERhdGUubm93KCkgKyBkdXJhdGlvbk1zO1xyXG4gIFxyXG4gIC8vIEVuY3J5cHQgcGFzc3dvcmQgYmVmb3JlIHN0b3JpbmcgaW4gbWVtb3J5XHJcbiAgY29uc3QgeyBlbmNyeXB0ZWQsIGl2IH0gPSBhd2FpdCBlbmNyeXB0UGFzc3dvcmRGb3JTZXNzaW9uKHBhc3N3b3JkKTtcclxuXHJcbiAgYWN0aXZlU2Vzc2lvbnMuc2V0KHNlc3Npb25Ub2tlbiwge1xyXG4gICAgZW5jcnlwdGVkUGFzc3dvcmQ6IGVuY3J5cHRlZCxcclxuICAgIGl2OiBpdixcclxuICAgIHdhbGxldElkLFxyXG4gICAgZXhwaXJlc0F0XHJcbiAgfSk7XHJcblxyXG4gIC8vIEF1dG8tY2xlYW51cCBleHBpcmVkIHNlc3Npb25cclxuICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIGlmIChhY3RpdmVTZXNzaW9ucy5oYXMoc2Vzc2lvblRva2VuKSkge1xyXG4gICAgICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcbiAgICAgIGlmIChEYXRlLm5vdygpID49IHNlc3Npb24uZXhwaXJlc0F0KSB7XHJcbiAgICAgICAgYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25Ub2tlbik7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2Vzc2lvbiBleHBpcmVkIGFuZCByZW1vdmVkJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LCBkdXJhdGlvbk1zKTtcclxuXHJcbiAgLy8gU2Vzc2lvbiBjcmVhdGVkXHJcbiAgcmV0dXJuIHNlc3Npb25Ub2tlbjtcclxufVxyXG5cclxuLy8gVmFsaWRhdGUgc2Vzc2lvbiBhbmQgcmV0dXJuIGRlY3J5cHRlZCBwYXNzd29yZFxyXG5hc3luYyBmdW5jdGlvbiB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKSB7XHJcbiAgaWYgKCFzZXNzaW9uVG9rZW4pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTm8gc2Vzc2lvbiB0b2tlbiBwcm92aWRlZCcpO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uVG9rZW4pO1xyXG5cclxuICBpZiAoIXNlc3Npb24pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBvciBleHBpcmVkIHNlc3Npb24nKTtcclxuICB9XHJcblxyXG4gIGlmIChEYXRlLm5vdygpID49IHNlc3Npb24uZXhwaXJlc0F0KSB7XHJcbiAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgIHRocm93IG5ldyBFcnJvcignU2Vzc2lvbiBleHBpcmVkJyk7XHJcbiAgfVxyXG5cclxuICAvLyBEZWNyeXB0IHBhc3N3b3JkIGZyb20gc2Vzc2lvbiBzdG9yYWdlXHJcbiAgcmV0dXJuIGF3YWl0IGRlY3J5cHRQYXNzd29yZEZyb21TZXNzaW9uKHNlc3Npb24uZW5jcnlwdGVkUGFzc3dvcmQsIHNlc3Npb24uaXYpO1xyXG59XHJcblxyXG4vLyBJbnZhbGlkYXRlIHNlc3Npb25cclxuZnVuY3Rpb24gaW52YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKSB7XHJcbiAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgIC8vIFNlc3Npb24gaW52YWxpZGF0ZWRcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgYWxsIHNlc3Npb25zXHJcbmZ1bmN0aW9uIGludmFsaWRhdGVBbGxTZXNzaW9ucygpIHtcclxuICBjb25zdCBjb3VudCA9IGFjdGl2ZVNlc3Npb25zLnNpemU7XHJcbiAgYWN0aXZlU2Vzc2lvbnMuY2xlYXIoKTtcclxuICAvLyBBbGwgc2Vzc2lvbnMgaW52YWxpZGF0ZWRcclxuICByZXR1cm4gY291bnQ7XHJcbn1cclxuXHJcbi8vIExpc3RlbiBmb3IgZXh0ZW5zaW9uIGluc3RhbGxhdGlvblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgSGVhcnRXYWxsZXQgaW5zdGFsbGVkJyk7XHJcbn0pO1xyXG5cclxuLy8gR2V0IGNvbm5lY3RlZCBzaXRlcyBmcm9tIHN0b3JhZ2VcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q29ubmVjdGVkU2l0ZXMoKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBsb2FkKENPTk5FQ1RFRF9TSVRFU19LRVkpO1xyXG4gIHJldHVybiBzaXRlcyB8fCB7fTtcclxufVxyXG5cclxuLy8gQ2hlY2sgaWYgYSBzaXRlIGlzIGNvbm5lY3RlZFxyXG5hc3luYyBmdW5jdGlvbiBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIHJldHVybiAhIXNpdGVzW29yaWdpbl07XHJcbn1cclxuXHJcbi8vIEFkZCBhIGNvbm5lY3RlZCBzaXRlXHJcbmFzeW5jIGZ1bmN0aW9uIGFkZENvbm5lY3RlZFNpdGUob3JpZ2luLCBhY2NvdW50cykge1xyXG4gIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICBzaXRlc1tvcmlnaW5dID0ge1xyXG4gICAgYWNjb3VudHMsXHJcbiAgICBjb25uZWN0ZWRBdDogRGF0ZS5ub3coKVxyXG4gIH07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIFJlbW92ZSBhIGNvbm5lY3RlZCBzaXRlXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbW92ZUNvbm5lY3RlZFNpdGUob3JpZ2luKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIGRlbGV0ZSBzaXRlc1tvcmlnaW5dO1xyXG4gIGF3YWl0IHNhdmUoQ09OTkVDVEVEX1NJVEVTX0tFWSwgc2l0ZXMpO1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGNoYWluIElEXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRDaGFpbklkKCkge1xyXG4gIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBsb2FkKCdjdXJyZW50TmV0d29yaycpO1xyXG4gIHJldHVybiBDSEFJTl9JRFNbbmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnXTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldCByZXF1ZXN0cyBmcm9tIGNvbnRlbnQgc2NyaXB0c1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVXYWxsZXRSZXF1ZXN0KG1lc3NhZ2UsIHNlbmRlcikge1xyXG4gIGNvbnN0IHsgbWV0aG9kLCBwYXJhbXMgfSA9IG1lc3NhZ2U7XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBHZXQgb3JpZ2luIGZyb20gQ2hyb21lIEFQSSwgbm90IG1lc3NhZ2UgcGF5bG9hZCAocHJldmVudHMgc3Bvb2ZpbmcpXHJcbiAgY29uc3QgdXJsID0gbmV3IFVSTChzZW5kZXIudXJsKTtcclxuICBjb25zdCBvcmlnaW4gPSB1cmwub3JpZ2luO1xyXG5cclxuICAvLyBIYW5kbGluZyB3YWxsZXQgcmVxdWVzdFxyXG5cclxuICB0cnkge1xyXG4gICAgc3dpdGNoIChtZXRob2QpIHtcclxuICAgICAgY2FzZSAnZXRoX3JlcXVlc3RBY2NvdW50cyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHNlbmRlci50YWIpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2FjY291bnRzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQWNjb3VudHMob3JpZ2luKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9jaGFpbklkJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQ2hhaW5JZCgpO1xyXG5cclxuICAgICAgY2FzZSAnbmV0X3ZlcnNpb24nOlxyXG4gICAgICAgIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBoYW5kbGVDaGFpbklkKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgcmVzdWx0OiBwYXJzZUludChjaGFpbklkLnJlc3VsdCwgMTYpLnRvU3RyaW5nKCkgfTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF9zd2l0Y2hFdGhlcmV1bUNoYWluJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU3dpdGNoQ2hhaW4ocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF9hZGRFdGhlcmV1bUNoYWluJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlQWRkQ2hhaW4ocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ3dhbGxldF93YXRjaEFzc2V0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlV2F0Y2hBc3NldChwYXJhbXMsIG9yaWdpbiwgc2VuZGVyLnRhYik7XHJcblxyXG4gICAgICBjYXNlICdldGhfYmxvY2tOdW1iZXInOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVCbG9ja051bWJlcigpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldEJsb2NrQnlOdW1iZXInOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmFsYW5jZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJhbGFuY2UocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRUcmFuc2FjdGlvbkNvdW50JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25Db3VudChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2NhbGwnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVDYWxsKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZXN0aW1hdGVHYXMnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dhc1ByaWNlJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2FzUHJpY2UoKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9zZW5kVHJhbnNhY3Rpb24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTZW5kVHJhbnNhY3Rpb24ocGFyYW1zLCBvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NlbmRSYXdUcmFuc2FjdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNlbmRSYXdUcmFuc2FjdGlvbihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uQnlIYXNoJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25CeUhhc2gocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRMb2dzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0TG9ncyhwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldENvZGUnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRDb2RlKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmxvY2tCeUhhc2gnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRCbG9ja0J5SGFzaChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAncGVyc29uYWxfc2lnbic6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlUGVyc29uYWxTaWduKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGEnOlxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YV92Myc6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3Y0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2lnblR5cGVkRGF0YShwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKTtcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAxLCBtZXNzYWdlOiBgTWV0aG9kICR7bWV0aG9kfSBub3Qgc3VwcG9ydGVkYCB9IH07XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgaGFuZGxpbmcgcmVxdWVzdDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9yZXF1ZXN0QWNjb3VudHMgLSBSZXF1ZXN0IHBlcm1pc3Npb24gdG8gY29ubmVjdFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0QWNjb3VudHMob3JpZ2luLCB0YWIpIHtcclxuICAvLyBDaGVjayBpZiBhbHJlYWR5IGNvbm5lY3RlZFxyXG4gIGlmIChhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIHJldHVybiB7IHJlc3VsdDogW3dhbGxldC5hZGRyZXNzXSB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IERhdGUubm93KCkudG9TdHJpbmcoKTtcclxuICAgIHBlbmRpbmdDb25uZWN0aW9ucy5zZXQocmVxdWVzdElkLCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0YWJJZDogdGFiPy5pZCB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPWNvbm5lY3Qmb3JpZ2luPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG9yaWdpbil9JnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdDb25uZWN0aW9ucy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdDb25uZWN0aW9uIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9hY2NvdW50cyAtIEdldCBjb25uZWN0ZWQgYWNjb3VudHNcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWNjb3VudHMob3JpZ2luKSB7XHJcbiAgLy8gT25seSByZXR1cm4gYWNjb3VudHMgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgaWYgKHdhbGxldCAmJiB3YWxsZXQuYWRkcmVzcykge1xyXG4gICAgICByZXR1cm4geyByZXN1bHQ6IFt3YWxsZXQuYWRkcmVzc10gfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IHJlc3VsdDogW10gfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jaGFpbklkIC0gR2V0IGN1cnJlbnQgY2hhaW4gSURcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhaW5JZCgpIHtcclxuICBjb25zdCBjaGFpbklkID0gYXdhaXQgZ2V0Q3VycmVudENoYWluSWQoKTtcclxuICByZXR1cm4geyByZXN1bHQ6IGNoYWluSWQgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF9zd2l0Y2hFdGhlcmV1bUNoYWluIC0gU3dpdGNoIHRvIGEgZGlmZmVyZW50IG5ldHdvcmtcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3dpdGNoQ2hhaW4ocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSB8fCAhcGFyYW1zWzBdLmNoYWluSWQpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCByZXF1ZXN0ZWRDaGFpbklkID0gcGFyYW1zWzBdLmNoYWluSWQ7XHJcbiAgLy8gU3dpdGNoaW5nIGNoYWluXHJcblxyXG4gIC8vIEZpbmQgbWF0Y2hpbmcgbmV0d29ya1xyXG4gIGNvbnN0IG5ldHdvcmtNYXAgPSB7XHJcbiAgICAnMHgzYWYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICAgJzB4M0FGJzogJ3B1bHNlY2hhaW5UZXN0bmV0JyxcclxuICAgICcweDE3MSc6ICdwdWxzZWNoYWluJyxcclxuICAgICcweDEnOiAnZXRoZXJldW0nLFxyXG4gICAgJzB4YWEzNmE3JzogJ3NlcG9saWEnLFxyXG4gICAgJzB4QUEzNkE3JzogJ3NlcG9saWEnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbmV0d29ya0tleSA9IG5ldHdvcmtNYXBbcmVxdWVzdGVkQ2hhaW5JZF07XHJcblxyXG4gIGlmICghbmV0d29ya0tleSkge1xyXG4gICAgLy8gQ2hhaW4gbm90IHN1cHBvcnRlZCAtIHJldHVybiBlcnJvciBjb2RlIDQ5MDIgc28gZEFwcCBjYW4gY2FsbCB3YWxsZXRfYWRkRXRoZXJldW1DaGFpblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0OTAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdVbnJlY29nbml6ZWQgY2hhaW4gSUQuIFRyeSBhZGRpbmcgdGhlIGNoYWluIHVzaW5nIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluLidcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSBjdXJyZW50IG5ldHdvcmtcclxuICBhd2FpdCBzYXZlKCdjdXJyZW50TmV0d29yaycsIG5ldHdvcmtLZXkpO1xyXG5cclxuICAvLyBOb3RpZnkgYWxsIHRhYnMgYWJvdXQgY2hhaW4gY2hhbmdlXHJcbiAgY29uc3QgbmV3Q2hhaW5JZCA9IENIQUlOX0lEU1tuZXR3b3JrS2V5XTtcclxuICBjaHJvbWUudGFicy5xdWVyeSh7fSwgKHRhYnMpID0+IHtcclxuICAgIHRhYnMuZm9yRWFjaCh0YWIgPT4ge1xyXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHtcclxuICAgICAgICB0eXBlOiAnQ0hBSU5fQ0hBTkdFRCcsXHJcbiAgICAgICAgY2hhaW5JZDogbmV3Q2hhaW5JZFxyXG4gICAgICB9KS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgICAgLy8gVGFiIG1pZ2h0IG5vdCBoYXZlIGNvbnRlbnQgc2NyaXB0LCBpZ25vcmUgZXJyb3JcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBudWxsIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB3YWxsZXRfYWRkRXRoZXJldW1DaGFpbiAtIEFkZCBhIG5ldyBuZXR3b3JrIChzaW1wbGlmaWVkIHZlcnNpb24pXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFkZENoYWluKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0gfHwgIXBhcmFtc1swXS5jaGFpbklkKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHBhcmFtcycgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY2hhaW5JbmZvID0gcGFyYW1zWzBdO1xyXG4gIGNvbnNvbGUubG9nKCfwn6uAIFJlcXVlc3QgdG8gYWRkIGNoYWluOicsIGNoYWluSW5mbyk7XHJcblxyXG4gIC8vIEZvciBub3csIG9ubHkgc3VwcG9ydCBvdXIgcHJlZGVmaW5lZCBjaGFpbnNcclxuICAvLyBDaGVjayBpZiBpdCdzIG9uZSBvZiBvdXIgc3VwcG9ydGVkIGNoYWluc1xyXG4gIGNvbnN0IHN1cHBvcnRlZENoYWlucyA9IHtcclxuICAgICcweDNhZic6IHRydWUsXHJcbiAgICAnMHgzQUYnOiB0cnVlLFxyXG4gICAgJzB4MTcxJzogdHJ1ZSxcclxuICAgICcweDEnOiB0cnVlLFxyXG4gICAgJzB4YWEzNmE3JzogdHJ1ZSxcclxuICAgICcweEFBMzZBNyc6IHRydWVcclxuICB9O1xyXG5cclxuICBpZiAoc3VwcG9ydGVkQ2hhaW5zW2NoYWluSW5mby5jaGFpbklkXSkge1xyXG4gICAgLy8gQ2hhaW4gaXMgYWxyZWFkeSBzdXBwb3J0ZWQsIGp1c3Qgc3dpdGNoIHRvIGl0XHJcbiAgICByZXR1cm4gYXdhaXQgaGFuZGxlU3dpdGNoQ2hhaW4oW3sgY2hhaW5JZDogY2hhaW5JbmZvLmNoYWluSWQgfV0pO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3VzdG9tIGNoYWlucyBub3Qgc3VwcG9ydGVkIHlldFxyXG4gIHJldHVybiB7XHJcbiAgICBlcnJvcjoge1xyXG4gICAgICBjb2RlOiAtMzI2MDMsXHJcbiAgICAgIG1lc3NhZ2U6ICdBZGRpbmcgY3VzdG9tIGNoYWlucyBub3Qgc3VwcG9ydGVkIHlldC4gT25seSBQdWxzZUNoYWluIGFuZCBFdGhlcmV1bSBuZXR3b3JrcyBhcmUgc3VwcG9ydGVkLidcclxuICAgIH1cclxuICB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgY29ubmVjdGlvbiBhcHByb3ZhbCBmcm9tIHBvcHVwXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nQ29ubmVjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kIG9yIGV4cGlyZWQnIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luIH0gPSBwZW5kaW5nQ29ubmVjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgcGVuZGluZ0Nvbm5lY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoYXBwcm92ZWQpIHtcclxuICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gICAgaWYgKHdhbGxldCAmJiB3YWxsZXQuYWRkcmVzcykge1xyXG4gICAgICAvLyBTYXZlIGNvbm5lY3RlZCBzaXRlXHJcbiAgICAgIGF3YWl0IGFkZENvbm5lY3RlZFNpdGUob3JpZ2luLCBbd2FsbGV0LmFkZHJlc3NdKTtcclxuXHJcbiAgICAgIC8vIFJlc29sdmUgdGhlIHBlbmRpbmcgcHJvbWlzZVxyXG4gICAgICByZXNvbHZlKHsgcmVzdWx0OiBbd2FsbGV0LmFkZHJlc3NdIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVqZWN0KG5ldyBFcnJvcignTm8gYWN0aXZlIHdhbGxldCcpKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gYWN0aXZlIHdhbGxldCcgfTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCBjb25uZWN0aW9uJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBjb25uZWN0aW9uIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0Q29ubmVjdGlvblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4gfSA9IHBlbmRpbmdDb25uZWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gR2V0IGN1cnJlbnQgbmV0d29yayBrZXlcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudE5ldHdvcmsoKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgcmV0dXJuIG5ldHdvcmsgfHwgJ3B1bHNlY2hhaW5UZXN0bmV0JztcclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9ibG9ja051bWJlciAtIEdldCBjdXJyZW50IGJsb2NrIG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVCbG9ja051bWJlcigpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBibG9ja051bWJlciA9IGF3YWl0IHJwYy5nZXRCbG9ja051bWJlcihuZXR3b3JrKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogYmxvY2tOdW1iZXIgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBibG9jayBudW1iZXI6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0QmxvY2tCeU51bWJlciAtIEdldCBibG9jayBieSBudW1iZXJcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QmxvY2tCeU51bWJlcihwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGJsb2NrIG51bWJlciBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBibG9ja051bWJlciA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IGluY2x1ZGVUcmFuc2FjdGlvbnMgPSBwYXJhbXNbMV0gfHwgZmFsc2U7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrID0gYXdhaXQgcnBjLmdldEJsb2NrQnlOdW1iZXIobmV0d29yaywgYmxvY2tOdW1iZXIsIGluY2x1ZGVUcmFuc2FjdGlvbnMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9jayB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIGJ5IG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCYWxhbmNlIC0gR2V0IGJhbGFuY2UgZm9yIGFuIGFkZHJlc3NcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QmFsYW5jZShwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGFkZHJlc3MgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYWRkcmVzcyA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmFsYW5jZSA9IGF3YWl0IHJwYy5nZXRCYWxhbmNlKG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBiYWxhbmNlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmFsYW5jZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvbkNvdW50IC0gR2V0IHRyYW5zYWN0aW9uIGNvdW50IChub25jZSlcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VHJhbnNhY3Rpb25Db3VudChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGFkZHJlc3MgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgYWRkcmVzcyA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgY291bnQgPSBhd2FpdCBycGMuZ2V0VHJhbnNhY3Rpb25Db3VudChuZXR3b3JrLCBhZGRyZXNzKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogY291bnQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2FjdGlvbiBjb3VudDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nYXNQcmljZSAtIEdldCBjdXJyZW50IGdhcyBwcmljZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHYXNQcmljZSgpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBnYXNQcmljZSA9IGF3YWl0IHJwYy5nZXRHYXNQcmljZShuZXR3b3JrKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogZ2FzUHJpY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBnYXMgcHJpY2U6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZXN0aW1hdGVHYXMgLSBFc3RpbWF0ZSBnYXMgZm9yIGEgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXN0aW1hdGVHYXMocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhcyA9IGF3YWl0IHJwYy5lc3RpbWF0ZUdhcyhuZXR3b3JrLCBwYXJhbXNbMF0pO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXMgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXN0aW1hdGluZyBnYXM6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfY2FsbCAtIEV4ZWN1dGUgYSByZWFkLW9ubHkgY2FsbFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDYWxsKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBycGMuY2FsbChuZXR3b3JrLCBwYXJhbXNbMF0pO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGV4ZWN1dGluZyBjYWxsOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NlbmRSYXdUcmFuc2FjdGlvbiAtIFNlbmQgYSBwcmUtc2lnbmVkIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRSYXdUcmFuc2FjdGlvbihwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHNpZ25lZCB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzaWduZWRUeCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgdHhIYXNoID0gYXdhaXQgcnBjLnNlbmRSYXdUcmFuc2FjdGlvbihuZXR3b3JrLCBzaWduZWRUeCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHR4SGFzaCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzZW5kaW5nIHJhdyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvblJlY2VpcHQgLSBHZXQgdHJhbnNhY3Rpb24gcmVjZWlwdFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvblJlY2VpcHQocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBoYXNoIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHR4SGFzaCA9IHBhcmFtc1swXTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvblJlY2VpcHQobmV0d29yaywgdHhIYXNoKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogcmVjZWlwdCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIHJlY2VpcHQ6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfZ2V0VHJhbnNhY3Rpb25CeUhhc2ggLSBHZXQgdHJhbnNhY3Rpb24gYnkgaGFzaFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkJ5SGFzaChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgdHhIYXNoID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkJ5SGFzaChuZXR3b3JrLCB0eEhhc2gpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiB0eCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGJ5IGhhc2g6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldExvZ3MocGFyYW1zKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCBsb2dzID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldExvZ3MnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBsb2dzIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgbG9nczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0Q29kZShwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGFkZHJlc3MgcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGNvZGUgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0Q29kZScsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGNvZGUgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBjb2RlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5SGFzaChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIGJsb2NrIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGJsb2NrID0gYXdhaXQgcHJvdmlkZXIuc2VuZCgnZXRoX2dldEJsb2NrQnlIYXNoJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogYmxvY2sgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBibG9jayBieSBoYXNoOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBQZW5kaW5nIHRyYW5zYWN0aW9uIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiB9KVxyXG5jb25zdCBwZW5kaW5nVHJhbnNhY3Rpb25zID0gbmV3IE1hcCgpO1xyXG5cclxuLy8gUGVuZGluZyB0b2tlbiBhZGQgcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0b2tlbkluZm8gfSlcclxuY29uc3QgcGVuZGluZ1Rva2VuUmVxdWVzdHMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyBQZW5kaW5nIG1lc3NhZ2Ugc2lnbmluZyByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHNpZ25SZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0pXHJcbmNvbnN0IHBlbmRpbmdTaWduUmVxdWVzdHMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyA9PT09PSBSQVRFIExJTUlUSU5HID09PT09XHJcbi8vIFByZXZlbnRzIG1hbGljaW91cyBkQXBwcyBmcm9tIHNwYW1taW5nIHRyYW5zYWN0aW9uIGFwcHJvdmFsIHJlcXVlc3RzXHJcbmNvbnN0IHJhdGVMaW1pdE1hcCA9IG5ldyBNYXAoKTsgLy8gb3JpZ2luIC0+IHsgY291bnQsIHdpbmRvd1N0YXJ0LCBwZW5kaW5nQ291bnQgfVxyXG5cclxuY29uc3QgUkFURV9MSU1JVF9DT05GSUcgPSB7XHJcbiAgTUFYX1BFTkRJTkdfUkVRVUVTVFM6IDUsIC8vIE1heCBwZW5kaW5nIHJlcXVlc3RzIHBlciBvcmlnaW5cclxuICBNQVhfUkVRVUVTVFNfUEVSX1dJTkRPVzogMjAsIC8vIE1heCB0b3RhbCByZXF1ZXN0cyBwZXIgdGltZSB3aW5kb3dcclxuICBUSU1FX1dJTkRPV19NUzogNjAwMDAgLy8gMSBtaW51dGUgd2luZG93XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIGFuIG9yaWdpbiBoYXMgZXhjZWVkZWQgcmF0ZSBsaW1pdHNcclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gY2hlY2tcclxuICogQHJldHVybnMge3sgYWxsb3dlZDogYm9vbGVhbiwgcmVhc29uPzogc3RyaW5nIH19XHJcbiAqL1xyXG5mdW5jdGlvbiBjaGVja1JhdGVMaW1pdChvcmlnaW4pIHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIFxyXG4gIC8vIEdldCBvciBjcmVhdGUgcmF0ZSBsaW1pdCBlbnRyeSBmb3IgdGhpcyBvcmlnaW5cclxuICBpZiAoIXJhdGVMaW1pdE1hcC5oYXMob3JpZ2luKSkge1xyXG4gICAgcmF0ZUxpbWl0TWFwLnNldChvcmlnaW4sIHtcclxuICAgICAgY291bnQ6IDAsXHJcbiAgICAgIHdpbmRvd1N0YXJ0OiBub3csXHJcbiAgICAgIHBlbmRpbmdDb3VudDogMFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBcclxuICAvLyBSZXNldCB3aW5kb3cgaWYgZXhwaXJlZFxyXG4gIGlmIChub3cgLSBsaW1pdERhdGEud2luZG93U3RhcnQgPiBSQVRFX0xJTUlUX0NPTkZJRy5USU1FX1dJTkRPV19NUykge1xyXG4gICAgbGltaXREYXRhLmNvdW50ID0gMDtcclxuICAgIGxpbWl0RGF0YS53aW5kb3dTdGFydCA9IG5vdztcclxuICB9XHJcbiAgXHJcbiAgLy8gQ2hlY2sgcGVuZGluZyByZXF1ZXN0cyBsaW1pdFxyXG4gIGlmIChsaW1pdERhdGEucGVuZGluZ0NvdW50ID49IFJBVEVfTElNSVRfQ09ORklHLk1BWF9QRU5ESU5HX1JFUVVFU1RTKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhbGxvd2VkOiBmYWxzZSxcclxuICAgICAgcmVhc29uOiBgVG9vIG1hbnkgcGVuZGluZyByZXF1ZXN0cy4gTWF4aW11bSAke1JBVEVfTElNSVRfQ09ORklHLk1BWF9QRU5ESU5HX1JFUVVFU1RTfSBwZW5kaW5nIHJlcXVlc3RzIGFsbG93ZWQuYFxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgLy8gQ2hlY2sgdG90YWwgcmVxdWVzdHMgaW4gd2luZG93XHJcbiAgaWYgKGxpbWl0RGF0YS5jb3VudCA+PSBSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUkVRVUVTVFNfUEVSX1dJTkRPVykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYWxsb3dlZDogZmFsc2UsXHJcbiAgICAgIHJlYXNvbjogYFJhdGUgbGltaXQgZXhjZWVkZWQuIE1heGltdW0gJHtSQVRFX0xJTUlUX0NPTkZJRy5NQVhfUkVRVUVTVFNfUEVSX1dJTkRPV30gcmVxdWVzdHMgcGVyIG1pbnV0ZS5gXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICByZXR1cm4geyBhbGxvd2VkOiB0cnVlIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbmNyZW1lbnRzIHJhdGUgbGltaXQgY291bnRlcnMgZm9yIGFuIG9yaWdpblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBpbmNyZW1lbnRcclxuICovXHJcbmZ1bmN0aW9uIGluY3JlbWVudFJhdGVMaW1pdChvcmlnaW4pIHtcclxuICBjb25zdCBsaW1pdERhdGEgPSByYXRlTGltaXRNYXAuZ2V0KG9yaWdpbik7XHJcbiAgaWYgKGxpbWl0RGF0YSkge1xyXG4gICAgbGltaXREYXRhLmNvdW50Kys7XHJcbiAgICBsaW1pdERhdGEucGVuZGluZ0NvdW50Kys7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRGVjcmVtZW50cyBwZW5kaW5nIGNvdW50ZXIgd2hlbiByZXF1ZXN0IGlzIHJlc29sdmVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGRlY3JlbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gZGVjcmVtZW50UGVuZGluZ0NvdW50KG9yaWdpbikge1xyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBpZiAobGltaXREYXRhICYmIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQgPiAwKSB7XHJcbiAgICBsaW1pdERhdGEucGVuZGluZ0NvdW50LS07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBDbGVhbiB1cCBvbGQgcmF0ZSBsaW1pdCBlbnRyaWVzIGV2ZXJ5IDUgbWludXRlc1xyXG5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBmb3IgKGNvbnN0IFtvcmlnaW4sIGRhdGFdIG9mIHJhdGVMaW1pdE1hcC5lbnRyaWVzKCkpIHtcclxuICAgIGlmIChub3cgLSBkYXRhLndpbmRvd1N0YXJ0ID4gUkFURV9MSU1JVF9DT05GSUcuVElNRV9XSU5ET1dfTVMgKiA1ICYmIGRhdGEucGVuZGluZ0NvdW50ID09PSAwKSB7XHJcbiAgICAgIHJhdGVMaW1pdE1hcC5kZWxldGUob3JpZ2luKTtcclxuICAgIH1cclxuICB9XHJcbn0sIDMwMDAwMCk7XHJcblxyXG4vLyA9PT09PSBUUkFOU0FDVElPTiBSRVBMQVkgUFJPVEVDVElPTiA9PT09PVxyXG4vLyBQcmV2ZW50cyB0aGUgc2FtZSB0cmFuc2FjdGlvbiBhcHByb3ZhbCBmcm9tIGJlaW5nIHVzZWQgbXVsdGlwbGUgdGltZXNcclxuY29uc3QgcHJvY2Vzc2VkQXBwcm92YWxzID0gbmV3IE1hcCgpOyAvLyBhcHByb3ZhbFRva2VuIC0+IHsgdGltZXN0YW1wLCB0eEhhc2gsIHVzZWQ6IHRydWUgfVxyXG5cclxuY29uc3QgUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHID0ge1xyXG4gIEFQUFJPVkFMX1RJTUVPVVQ6IDMwMDAwMCwgLy8gNSBtaW51dGVzIC0gYXBwcm92YWwgZXhwaXJlcyBhZnRlciB0aGlzXHJcbiAgQ0xFQU5VUF9JTlRFUlZBTDogNjAwMDAgICAvLyAxIG1pbnV0ZSAtIGNsZWFuIHVwIG9sZCBhcHByb3ZhbHNcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW5cclxuICogQHJldHVybnMge3N0cmluZ30gVW5pcXVlIGFwcHJvdmFsIHRva2VuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKSB7XHJcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XHJcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oYXJyYXksIGJ5dGUgPT4gYnl0ZS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYW5kIG1hcmtzIGFuIGFwcHJvdmFsIHRva2VuIGFzIHVzZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IGFwcHJvdmFsVG9rZW4gLSBUb2tlbiB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWxpZCBhbmQgbm90IHlldCB1c2VkXHJcbiAqL1xyXG5mdW5jdGlvbiB2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikge1xyXG4gIGlmICghYXBwcm92YWxUb2tlbikge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIE5vIGFwcHJvdmFsIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IGFwcHJvdmFsID0gcHJvY2Vzc2VkQXBwcm92YWxzLmdldChhcHByb3ZhbFRva2VuKTtcclxuICBcclxuICBpZiAoIWFwcHJvdmFsKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgVW5rbm93biBhcHByb3ZhbCB0b2tlbicpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBcclxuICBpZiAoYXBwcm92YWwudXNlZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEFwcHJvdmFsIHRva2VuIGFscmVhZHkgdXNlZCAtIHByZXZlbnRpbmcgcmVwbGF5IGF0dGFjaycpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayBpZiBhcHByb3ZhbCBoYXMgZXhwaXJlZFxyXG4gIGNvbnN0IGFnZSA9IERhdGUubm93KCkgLSBhcHByb3ZhbC50aW1lc3RhbXA7XHJcbiAgaWYgKGFnZSA+IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5BUFBST1ZBTF9USU1FT1VUKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQXBwcm92YWwgdG9rZW4gZXhwaXJlZCcpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLmRlbGV0ZShhcHByb3ZhbFRva2VuKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgLy8gTWFyayBhcyB1c2VkXHJcbiAgYXBwcm92YWwudXNlZCA9IHRydWU7XHJcbiAgYXBwcm92YWwudXNlZEF0ID0gRGF0ZS5ub3coKTtcclxuICBjb25zb2xlLmxvZygn8J+rgCBBcHByb3ZhbCB0b2tlbiB2YWxpZGF0ZWQgYW5kIG1hcmtlZCBhcyB1c2VkJyk7XHJcbiAgXHJcbiAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbi8vIENsZWFuIHVwIG9sZCBwcm9jZXNzZWQgYXBwcm92YWxzIGV2ZXJ5IG1pbnV0ZVxyXG5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICBmb3IgKGNvbnN0IFt0b2tlbiwgYXBwcm92YWxdIG9mIHByb2Nlc3NlZEFwcHJvdmFscy5lbnRyaWVzKCkpIHtcclxuICAgIGNvbnN0IGFnZSA9IG5vdyAtIGFwcHJvdmFsLnRpbWVzdGFtcDtcclxuICAgIGlmIChhZ2UgPiBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcuQVBQUk9WQUxfVElNRU9VVCAqIDIpIHtcclxuICAgICAgcHJvY2Vzc2VkQXBwcm92YWxzLmRlbGV0ZSh0b2tlbik7XHJcbiAgICB9XHJcbiAgfVxyXG59LCBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcuQ0xFQU5VUF9JTlRFUlZBTCk7XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NlbmRUcmFuc2FjdGlvbiAtIFNpZ24gYW5kIHNlbmQgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZW5kVHJhbnNhY3Rpb24ocGFyYW1zLCBvcmlnaW4pIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gU0VDVVJJVFk6IENoZWNrIHJhdGUgbGltaXQgdG8gcHJldmVudCBzcGFtXHJcbiAgY29uc3QgcmF0ZUxpbWl0Q2hlY2sgPSBjaGVja1JhdGVMaW1pdChvcmlnaW4pO1xyXG4gIGlmICghcmF0ZUxpbWl0Q2hlY2suYWxsb3dlZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIFJhdGUgbGltaXQgZXhjZWVkZWQgZm9yIG9yaWdpbjonLCBvcmlnaW4pO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDIwMCwgbWVzc2FnZTogc2FuaXRpemVFcnJvck1lc3NhZ2UocmF0ZUxpbWl0Q2hlY2sucmVhc29uKSB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB0eFJlcXVlc3QgPSBwYXJhbXNbMF07XHJcblxyXG4gIC8vIExvYWQgc2V0dGluZ3MgdG8gZ2V0IG1heCBnYXMgcHJpY2VcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoJ3NldHRpbmdzJyk7XHJcbiAgY29uc3QgbWF4R2FzUHJpY2VHd2VpID0gc2V0dGluZ3M/Lm1heEdhc1ByaWNlR3dlaSB8fCAxMDAwO1xyXG5cclxuICAvLyBTRUNVUklUWTogQ29tcHJlaGVuc2l2ZSB0cmFuc2FjdGlvbiB2YWxpZGF0aW9uXHJcbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0KHR4UmVxdWVzdCwgbWF4R2FzUHJpY2VHd2VpKTtcclxuICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBJbnZhbGlkIHRyYW5zYWN0aW9uIGZyb20gb3JpZ2luOicsIG9yaWdpbiwgdmFsaWRhdGlvbi5lcnJvcnMpO1xyXG4gICAgcmV0dXJuIHsgXHJcbiAgICAgIGVycm9yOiB7IFxyXG4gICAgICAgIGNvZGU6IC0zMjYwMiwgXHJcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgdHJhbnNhY3Rpb246ICcgKyBzYW5pdGl6ZUVycm9yTWVzc2FnZSh2YWxpZGF0aW9uLmVycm9ycy5qb2luKCc7ICcpKSBcclxuICAgICAgfSBcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBVc2Ugc2FuaXRpemVkIHRyYW5zYWN0aW9uIHBhcmFtZXRlcnNcclxuICBjb25zdCBzYW5pdGl6ZWRUeCA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBJbmNyZW1lbnQgcmF0ZSBsaW1pdCBjb3VudGVyXHJcbiAgaW5jcmVtZW50UmF0ZUxpbWl0KG9yaWdpbik7XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCk7XHJcbiAgICBcclxuICAgIC8vIFNFQ1VSSVRZOiBHZW5lcmF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiBmb3IgcmVwbGF5IHByb3RlY3Rpb25cclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5zZXQoYXBwcm92YWxUb2tlbiwge1xyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgdXNlZDogZmFsc2VcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyBTdG9yZSBzYW5pdGl6ZWQgdHJhbnNhY3Rpb24gaW5zdGVhZCBvZiBvcmlnaW5hbCByZXF1ZXN0XHJcbiAgICBwZW5kaW5nVHJhbnNhY3Rpb25zLnNldChyZXF1ZXN0SWQsIHsgXHJcbiAgICAgIHJlc29sdmUsIFxyXG4gICAgICByZWplY3QsIFxyXG4gICAgICBvcmlnaW4sIFxyXG4gICAgICB0eFJlcXVlc3Q6IHNhbml0aXplZFR4LFxyXG4gICAgICBhcHByb3ZhbFRva2VuICAvLyBJbmNsdWRlIHRva2VuIGZvciB2YWxpZGF0aW9uXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXRyYW5zYWN0aW9uJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdUcmFuc2FjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nVHJhbnNhY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1RyYW5zYWN0aW9uIHJlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDAwKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHRyYW5zYWN0aW9uIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVHJhbnNhY3Rpb25BcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkLCBzZXNzaW9uVG9rZW4sIGdhc1ByaWNlLCBjdXN0b21Ob25jZSkge1xyXG4gIGlmICghcGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHR4UmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1RyYW5zYWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICBcclxuICAvLyBTRUNVUklUWTogVmFsaWRhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gdG8gcHJldmVudCByZXBsYXkgYXR0YWNrc1xyXG4gIGlmICghdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pKSB7XHJcbiAgICBwZW5kaW5nVHJhbnNhY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgZGVjcmVtZW50UGVuZGluZ0NvdW50KG9yaWdpbik7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdJbnZhbGlkIG9yIGFscmVhZHkgdXNlZCBhcHByb3ZhbCB0b2tlbiAtIHBvc3NpYmxlIHJlcGxheSBhdHRhY2snKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGFwcHJvdmFsIHRva2VuJyB9O1xyXG4gIH1cclxuICBcclxuICBwZW5kaW5nVHJhbnNhY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICAvLyBEZWNyZW1lbnQgcGVuZGluZyBjb3VudGVyIChyZXF1ZXN0IGNvbXBsZXRlZClcclxuICBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKTtcclxuXHJcbiAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignVXNlciByZWplY3RlZCB0cmFuc2FjdGlvbicpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1VzZXIgcmVqZWN0ZWQnIH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVmFsaWRhdGUgc2Vzc2lvbiBhbmQgZ2V0IHBhc3N3b3JkIChub3cgYXN5bmMpXHJcbiAgICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG5cclxuICAgIC8vIFVubG9jayB3YWxsZXRcclxuICAgIGNvbnN0IHsgc2lnbmVyIH0gPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQpO1xyXG5cclxuICAgIC8vIEdldCBjdXJyZW50IG5ldHdvcmtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcblxyXG4gICAgLy8gQ29ubmVjdCBzaWduZXIgdG8gcHJvdmlkZXJcclxuICAgIGNvbnN0IGNvbm5lY3RlZFNpZ25lciA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRyYW5zYWN0aW9uIC0gY3JlYXRlIGEgY2xlYW4gY29weSB3aXRoIG9ubHkgbmVjZXNzYXJ5IGZpZWxkc1xyXG4gICAgY29uc3QgdHhUb1NlbmQgPSB7XHJcbiAgICAgIHRvOiB0eFJlcXVlc3QudG8sXHJcbiAgICAgIHZhbHVlOiB0eFJlcXVlc3QudmFsdWUgfHwgJzB4MCcsXHJcbiAgICAgIGRhdGE6IHR4UmVxdWVzdC5kYXRhIHx8ICcweCdcclxuICAgIH07XHJcblxyXG4gICAgLy8gTm9uY2UgaGFuZGxpbmcgcHJpb3JpdHk6XHJcbiAgICAvLyAxLiBVc2VyLXByb3ZpZGVkIGN1c3RvbSBub25jZSAoZm9yIHJlcGxhY2luZyBzdHVjayB0cmFuc2FjdGlvbnMpXHJcbiAgICAvLyAyLiBEQXBwLXByb3ZpZGVkIG5vbmNlICh2YWxpZGF0ZWQpXHJcbiAgICAvLyAzLiBBdXRvLWZldGNoIGJ5IGV0aGVycy5qc1xyXG4gICAgaWYgKGN1c3RvbU5vbmNlICE9PSB1bmRlZmluZWQgJiYgY3VzdG9tTm9uY2UgIT09IG51bGwpIHtcclxuICAgICAgLy8gVXNlciBtYW51YWxseSBzZXQgbm9uY2UgKGUuZy4sIHRvIHJlcGxhY2Ugc3R1Y2sgdHJhbnNhY3Rpb24pXHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uQ291bnQoc2lnbmVyLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcblxyXG4gICAgICBpZiAoY3VzdG9tTm9uY2UgPCBjdXJyZW50Tm9uY2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEN1c3RvbSBub25jZSAke2N1c3RvbU5vbmNlfSBpcyBsZXNzIHRoYW4gY3VycmVudCBub25jZSAke2N1cnJlbnROb25jZX0uIFRoaXMgbWF5IGZhaWwgdW5sZXNzIHlvdSdyZSByZXBsYWNpbmcgYSBwZW5kaW5nIHRyYW5zYWN0aW9uLmApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eFRvU2VuZC5ub25jZSA9IGN1c3RvbU5vbmNlO1xyXG4gICAgICAvLyBVc2luZyBjdXN0b20gbm9uY2VcclxuICAgIH0gZWxzZSBpZiAodHhSZXF1ZXN0Lm5vbmNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lm5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIFNFQ1VSSVRZOiBWYWxpZGF0ZSBub25jZSBpZiBwcm92aWRlZCBieSBEQXBwXHJcbiAgICAgIGNvbnN0IGN1cnJlbnROb25jZSA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uQ291bnQoc2lnbmVyLmFkZHJlc3MsICdwZW5kaW5nJyk7XHJcbiAgICAgIGNvbnN0IHByb3ZpZGVkTm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJ1xyXG4gICAgICAgID8gcGFyc2VJbnQodHhSZXF1ZXN0Lm5vbmNlLCAxNilcclxuICAgICAgICA6IHR4UmVxdWVzdC5ub25jZTtcclxuXHJcbiAgICAgIC8vIE5vbmNlIG11c3QgYmUgPj0gY3VycmVudCBwZW5kaW5nIG5vbmNlXHJcbiAgICAgIGlmIChwcm92aWRlZE5vbmNlIDwgY3VycmVudE5vbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG5vbmNlOiAke3Byb3ZpZGVkTm9uY2V9IGlzIGxlc3MgdGhhbiBjdXJyZW50IG5vbmNlICR7Y3VycmVudE5vbmNlfWApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eFRvU2VuZC5ub25jZSA9IHByb3ZpZGVkTm9uY2U7XHJcbiAgICAgIC8vIFVzaW5nIERBcHAtcHJvdmlkZWQgbm9uY2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIG5vIG5vbmNlIHByb3ZpZGVkLCBldGhlcnMuanMgd2lsbCBmZXRjaCB0aGUgY29ycmVjdCBvbmUgYXV0b21hdGljYWxseVxyXG4gICAgICAvLyBBdXRvLWZldGNoaW5nIG5vbmNlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgREFwcCBwcm92aWRlZCBhIGdhcyBsaW1pdCwgdXNlIGl0LiBPdGhlcndpc2UgbGV0IGV0aGVycyBlc3RpbWF0ZS5cclxuICAgIGlmICh0eFJlcXVlc3QuZ2FzIHx8IHR4UmVxdWVzdC5nYXNMaW1pdCkge1xyXG4gICAgICB0eFRvU2VuZC5nYXNMaW1pdCA9IHR4UmVxdWVzdC5nYXMgfHwgdHhSZXF1ZXN0Lmdhc0xpbWl0O1xyXG4gICAgICAvLyBVc2luZyBwcm92aWRlZCBnYXMgbGltaXRcclxuICAgIH1cclxuXHJcbiAgICAvLyBBcHBseSB1c2VyLXNlbGVjdGVkIGdhcyBwcmljZSBpZiBwcm92aWRlZCwgb3IgdXNlIG5ldHdvcmsgZ2FzIHByaWNlIHdpdGggbXVsdGlwbGllclxyXG4gICAgaWYgKGdhc1ByaWNlKSB7XHJcbiAgICAgIC8vIFVzZSBsZWdhY3kgZ2FzUHJpY2UgKHdvcmtzIG9uIGFsbCBuZXR3b3JrcyBpbmNsdWRpbmcgUHVsc2VDaGFpbilcclxuICAgICAgdHhUb1NlbmQuZ2FzUHJpY2UgPSBnYXNQcmljZTtcclxuICAgICAgLy8gVXNpbmcgY3VzdG9tIGdhcyBwcmljZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gRmV0Y2ggY3VycmVudCBuZXR3b3JrIGdhcyBwcmljZSBhbmQgYXBwbHkgMS4yeCBtdWx0aXBsaWVyIGZvciBmYXN0ZXIgY29uZmlybWF0aW9uXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbmV0d29ya0dhc1ByaWNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0RmVlRGF0YSgpO1xyXG4gICAgICAgIGlmIChuZXR3b3JrR2FzUHJpY2UuZ2FzUHJpY2UpIHtcclxuICAgICAgICAgIGNvbnN0IG11bHRpcGxpZWRHYXNQcmljZSA9IChuZXR3b3JrR2FzUHJpY2UuZ2FzUHJpY2UgKiBCaWdJbnQoMTIwKSkgLyBCaWdJbnQoMTAwKTtcclxuICAgICAgICAgIHR4VG9TZW5kLmdhc1ByaWNlID0gbXVsdGlwbGllZEdhc1ByaWNlO1xyXG4gICAgICAgICAgLy8gVXNpbmcgbmV0d29yayBnYXMgcHJpY2Ugd2l0aCBtdWx0aXBsaWVyXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIC8vIEF1dG8tY2FsY3VsYXRpbmcgZ2FzIHByaWNlXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTZW5kIHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IGNvbm5lY3RlZFNpZ25lci5zZW5kVHJhbnNhY3Rpb24odHhUb1NlbmQpO1xyXG5cclxuICAgIC8vIFRyYW5zYWN0aW9uIHNlbnRcclxuXHJcbiAgICAvLyBTYXZlIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnkgKG5ldHdvcmsgdmFyaWFibGUgYWxyZWFkeSBkZWZpbmVkIGFib3ZlKVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KHNpZ25lci5hZGRyZXNzLCB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogc2lnbmVyLmFkZHJlc3MsXHJcbiAgICAgIHRvOiB0eFJlcXVlc3QudG8gfHwgbnVsbCxcclxuICAgICAgdmFsdWU6IHR4UmVxdWVzdC52YWx1ZSB8fCAnMCcsXHJcbiAgICAgIGdhc1ByaWNlOiB0eC5nYXNQcmljZSA/IHR4Lmdhc1ByaWNlLnRvU3RyaW5nKCkgOiAnMCcsXHJcbiAgICAgIG5vbmNlOiB0eC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiB0eEhpc3RvcnkuVFhfVFlQRVMuQ09OVFJBQ1RcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNlbmQgZGVza3RvcCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIFNlbnQnLFxyXG4gICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gc2VudDogJHt0eC5oYXNoLnNsaWNlKDAsIDIwKX0uLi5gLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uIGluIGJhY2tncm91bmRcclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBzaWduZXIuYWRkcmVzcyk7XHJcblxyXG4gICAgLy8gUmVzb2x2ZSB3aXRoIHRyYW5zYWN0aW9uIGhhc2hcclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHR4Lmhhc2ggfSk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiB0eC5oYXNoIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVHJhbnNhY3Rpb24gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgY29uc3Qgc2FuaXRpemVkRXJyb3IgPSBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3Ioc2FuaXRpemVkRXJyb3IpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVkRXJyb3IgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCB0cmFuc2FjdGlvbiByZXF1ZXN0IGRldGFpbHMgZm9yIHBvcHVwXHJcbmZ1bmN0aW9uIGdldFRyYW5zYWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4sIHR4UmVxdWVzdCB9ID0gcGVuZGluZ1RyYW5zYWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiwgdHhSZXF1ZXN0IH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3dhdGNoQXNzZXQgLSBBZGQgY3VzdG9tIHRva2VuIChFSVAtNzQ3KVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVXYXRjaEFzc2V0KHBhcmFtcywgb3JpZ2luLCB0YWIpIHtcclxuICAvLyBSZWNlaXZlZCB3YWxsZXRfd2F0Y2hBc3NldCByZXF1ZXN0XHJcblxyXG4gIC8vIFZhbGlkYXRlIHBhcmFtcyBzdHJ1Y3R1cmVcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zLnR5cGUgfHwgIXBhcmFtcy5vcHRpb25zKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdJbnZhbGlkIHBhcmFtczogbXVzdCBpbmNsdWRlIHR5cGUgYW5kIG9wdGlvbnMnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgdHlwZSwgb3B0aW9ucyB9ID0gcGFyYW1zO1xyXG5cclxuICAvLyBPbmx5IHN1cHBvcnQgRVJDMjAvUFJDMjAgdG9rZW5zXHJcbiAgaWYgKHR5cGUudG9VcHBlckNhc2UoKSAhPT0gJ0VSQzIwJykge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnT25seSBFUkMyMC9QUkMyMCB0b2tlbnMgYXJlIHN1cHBvcnRlZCcgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgdG9rZW4gZmllbGRzXHJcbiAgaWYgKCFvcHRpb25zLmFkZHJlc3MgfHwgIW9wdGlvbnMuc3ltYm9sKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdUb2tlbiBtdXN0IGhhdmUgYWRkcmVzcyBhbmQgc3ltYm9sJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB0b2tlbkluZm8gPSB7XHJcbiAgICBhZGRyZXNzOiBvcHRpb25zLmFkZHJlc3MudG9Mb3dlckNhc2UoKSxcclxuICAgIHN5bWJvbDogb3B0aW9ucy5zeW1ib2wsXHJcbiAgICBkZWNpbWFsczogb3B0aW9ucy5kZWNpbWFscyB8fCAxOCxcclxuICAgIGltYWdlOiBvcHRpb25zLmltYWdlIHx8IG51bGxcclxuICB9O1xyXG5cclxuICAvLyBSZXF1ZXN0aW5nIHRvIGFkZCB0b2tlblxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpICsgJ190b2tlbic7XHJcbiAgICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luLCB0b2tlbkluZm8gfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1hZGRUb2tlbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9YCksXHJcbiAgICAgIHR5cGU6ICdwb3B1cCcsXHJcbiAgICAgIHdpZHRoOiA0MDAsXHJcbiAgICAgIGhlaWdodDogNTAwXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaW1lb3V0IGFmdGVyIDUgbWludXRlc1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdUb2tlblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1Rva2VuIGFkZCByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSB0b2tlbiBhZGQgYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQpIHtcclxuICBpZiAoIXBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIHRva2VuSW5mbyB9ID0gcGVuZGluZ1Rva2VuUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdG9rZW4nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFRva2VuIGFwcHJvdmVkIC0gcmV0dXJuIHRydWUgKHdhbGxldF93YXRjaEFzc2V0IHJldHVybnMgYm9vbGVhbilcclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHRydWUgfSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0b2tlbkluZm8gfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBUb2tlbiBhZGQgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCB0b2tlbiBhZGQgcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRUb2tlbkFkZFJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdUb2tlblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiwgdG9rZW5JbmZvIH0gPSBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG9yaWdpbiwgdG9rZW5JbmZvIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBTcGVlZCB1cCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gYnkgcmVwbGFjaW5nIGl0IHdpdGggaGlnaGVyIGdhcyBwcmljZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTcGVlZFVwVHJhbnNhY3Rpb24oYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHNlc3Npb25Ub2tlbiwgZ2FzUHJpY2VNdWx0aXBsaWVyID0gMS4yKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2tcclxuICAgIGNvbnN0IHsgc2lnbmVyIH0gPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQpO1xyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgbmV3IGdhcyBwcmljZSAoMS4yeCBvZiBvcmlnaW5hbCBieSBkZWZhdWx0KVxyXG4gICAgY29uc3Qgb3JpZ2luYWxHYXNQcmljZSA9IEJpZ0ludChvcmlnaW5hbFR4Lmdhc1ByaWNlKTtcclxuICAgIGNvbnN0IG5ld0dhc1ByaWNlID0gKG9yaWdpbmFsR2FzUHJpY2UgKiBCaWdJbnQoTWF0aC5mbG9vcihnYXNQcmljZU11bHRpcGxpZXIgKiAxMDApKSkgLyBCaWdJbnQoMTAwKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgcmVwbGFjZW1lbnQgdHJhbnNhY3Rpb24gd2l0aCBzYW1lIG5vbmNlXHJcbiAgICBjb25zdCByZXBsYWNlbWVudFR4ID0ge1xyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBnYXNQcmljZTogbmV3R2FzUHJpY2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gU3BlZWRpbmcgdXAgdHJhbnNhY3Rpb25cclxuXHJcbiAgICAvLyBTZW5kIHJlcGxhY2VtZW50IHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHdhbGxldC5zZW5kVHJhbnNhY3Rpb24ocmVwbGFjZW1lbnRUeCk7XHJcblxyXG4gICAgLy8gU2F2ZSBuZXcgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZS50b1N0cmluZygpLFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgbmV0d29yazogbmV0d29yayxcclxuICAgICAgc3RhdHVzOiB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcsXHJcbiAgICAgIGJsb2NrTnVtYmVyOiBudWxsLFxyXG4gICAgICB0eXBlOiBvcmlnaW5hbFR4LnR5cGVcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1hcmsgb3JpZ2luYWwgdHJhbnNhY3Rpb24gYXMgcmVwbGFjZWQvZmFpbGVkXHJcbiAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELCBudWxsKTtcclxuXHJcbiAgICAvLyBTZW5kIG5vdGlmaWNhdGlvblxyXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gU3BlZCBVcCcsXHJcbiAgICAgIG1lc3NhZ2U6IGBSZXBsYWNlbWVudCB0cmFuc2FjdGlvbiBzZW50IHdpdGggJHtNYXRoLmZsb29yKGdhc1ByaWNlTXVsdGlwbGllciAqIDEwMCl9JSBnYXMgcHJpY2VgLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcyk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiB0eC5oYXNoLCBuZXdHYXNQcmljZTogbmV3R2FzUHJpY2UudG9TdHJpbmcoKSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHNwZWVkaW5nIHVwIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIENhbmNlbCBhIHBlbmRpbmcgdHJhbnNhY3Rpb24gYnkgcmVwbGFjaW5nIGl0IHdpdGggYSB6ZXJvLXZhbHVlIHR4IHRvIHNlbGZcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gsIHNlc3Npb25Ub2tlbikge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIChub3cgYXN5bmMpXHJcbiAgICBjb25zdCBwYXNzd29yZCA9IGF3YWl0IHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pO1xyXG5cclxuICAgIC8vIEdldCBvcmlnaW5hbCB0cmFuc2FjdGlvbiBkZXRhaWxzXHJcbiAgICBjb25zdCBvcmlnaW5hbFR4ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4QnlIYXNoKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoKTtcclxuICAgIGlmICghb3JpZ2luYWxUeCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBub3QgZm91bmQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9yaWdpbmFsVHguc3RhdHVzICE9PSB0eEhpc3RvcnkuVFhfU1RBVFVTLlBFTkRJTkcpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVHJhbnNhY3Rpb24gaXMgbm90IHBlbmRpbmcnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHdhbGxldCBhbmQgdW5sb2NrXHJcbiAgICBjb25zdCB7IHNpZ25lciB9ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkKTtcclxuXHJcbiAgICAvLyBHZXQgbmV0d29yayBhbmQgY3JlYXRlIHByb3ZpZGVyIHdpdGggYXV0b21hdGljIGZhaWxvdmVyXHJcbiAgICBjb25zdCBuZXR3b3JrID0gb3JpZ2luYWxUeC5uZXR3b3JrO1xyXG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBycGMuZ2V0UHJvdmlkZXIobmV0d29yayk7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIG5ldyBnYXMgcHJpY2UgKDEuMnggb2Ygb3JpZ2luYWwgdG8gZW5zdXJlIGl0IGdldHMgbWluZWQgZmlyc3QpXHJcbiAgICBjb25zdCBvcmlnaW5hbEdhc1ByaWNlID0gQmlnSW50KG9yaWdpbmFsVHguZ2FzUHJpY2UpO1xyXG4gICAgY29uc3QgbmV3R2FzUHJpY2UgPSAob3JpZ2luYWxHYXNQcmljZSAqIEJpZ0ludCgxMjApKSAvIEJpZ0ludCgxMDApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gKHNlbmQgMCB0byBzZWxmIHdpdGggc2FtZSBub25jZSlcclxuICAgIGNvbnN0IGNhbmNlbFR4ID0ge1xyXG4gICAgICB0bzogYWRkcmVzcywgIC8vIFNlbmQgdG8gc2VsZlxyXG4gICAgICB2YWx1ZTogJzAnLCAgIC8vIFplcm8gdmFsdWVcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDYW5jZWxsaW5nIHRyYW5zYWN0aW9uXHJcblxyXG4gICAgLy8gU2VuZCBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb25cclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgd2FsbGV0LnNlbmRUcmFuc2FjdGlvbihjYW5jZWxUeCk7XHJcblxyXG4gICAgLy8gU2F2ZSBjYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogYWRkcmVzcyxcclxuICAgICAgdmFsdWU6ICcwJyxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlLnRvU3RyaW5nKCksXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6ICdzZW5kJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyBmYWlsZWRcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBDYW5jZWxsZWQnLFxyXG4gICAgICBtZXNzYWdlOiAnQ2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHNlbnQnLFxyXG4gICAgICBwcmlvcml0eTogMlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgY29uZmlybWF0aW9uXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcyk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiB0eC5oYXNoIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgY2FuY2VsbGluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBXYWl0IGZvciB0cmFuc2FjdGlvbiBjb25maXJtYXRpb25cclxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIGFkZHJlc3MpIHtcclxuICB0cnkge1xyXG4gICAgLy8gV2FpdGluZyBmb3IgY29uZmlybWF0aW9uXHJcblxyXG4gICAgLy8gV2FpdCBmb3IgMSBjb25maXJtYXRpb25cclxuICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci53YWl0Rm9yVHJhbnNhY3Rpb24odHguaGFzaCwgMSk7XHJcblxyXG4gICAgaWYgKHJlY2VpcHQgJiYgcmVjZWlwdC5zdGF0dXMgPT09IDEpIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gY29uZmlybWVkXHJcblxyXG4gICAgICAvLyBVcGRhdGUgdHJhbnNhY3Rpb24gc3RhdHVzIGluIGhpc3RvcnlcclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgdHguaGFzaCxcclxuICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkNPTkZJUk1FRCxcclxuICAgICAgICByZWNlaXB0LmJsb2NrTnVtYmVyXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBTZW5kIHN1Y2Nlc3Mgbm90aWZpY2F0aW9uXHJcbiAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgdHlwZTogJ2Jhc2ljJyxcclxuICAgICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENvbmZpcm1lZCcsXHJcbiAgICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIGNvbmZpcm1lZCBvbi1jaGFpbiFgLFxyXG4gICAgICAgIHByaW9yaXR5OiAyXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVHJhbnNhY3Rpb24gZmFpbGVkXHJcblxyXG4gICAgICAvLyBVcGRhdGUgdHJhbnNhY3Rpb24gc3RhdHVzIGluIGhpc3RvcnlcclxuICAgICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgdHguaGFzaCxcclxuICAgICAgICB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCxcclxuICAgICAgICByZWNlaXB0ID8gcmVjZWlwdC5ibG9ja051bWJlciA6IG51bGxcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFNlbmQgZmFpbHVyZSBub3RpZmljYXRpb25cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gRmFpbGVkJyxcclxuICAgICAgICBtZXNzYWdlOiAnVHJhbnNhY3Rpb24gd2FzIHJldmVydGVkIG9yIGZhaWxlZCcsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igd2FpdGluZyBmb3IgY29uZmlybWF0aW9uOicsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09IE1FU1NBR0UgU0lHTklORyBIQU5ETEVSUyA9PT09PVxyXG5cclxuLy8gSGFuZGxlIHBlcnNvbmFsX3NpZ24gKEVJUC0xOTEpIC0gU2lnbiBhIG1lc3NhZ2VcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUGVyc29uYWxTaWduKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpIHtcclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSBzaWduIHJlcXVlc3RcclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVTaWduUmVxdWVzdChtZXRob2QsIHBhcmFtcyk7XHJcbiAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgSW52YWxpZCBzaWduIHJlcXVlc3QgZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogLTMyNjAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3IpXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IG1lc3NhZ2UsIGFkZHJlc3MgfSA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBWZXJpZnkgdGhlIGFkZHJlc3MgbWF0Y2hlcyB0aGUgY29ubmVjdGVkIGFjY291bnRcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAoIXdhbGxldCB8fCB3YWxsZXQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICBtZXNzYWdlOiAnUmVxdWVzdGVkIGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggY29ubmVjdGVkIGFjY291bnQnXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpICsgJ19zaWduJztcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiBmb3IgcmVwbGF5IHByb3RlY3Rpb25cclxuICAgIGNvbnN0IGFwcHJvdmFsVG9rZW4gPSBnZW5lcmF0ZUFwcHJvdmFsVG9rZW4oKTtcclxuICAgIHByb2Nlc3NlZEFwcHJvdmFscy5zZXQoYXBwcm92YWxUb2tlbiwge1xyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIHJlcXVlc3RJZCxcclxuICAgICAgdXNlZDogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuc2V0KHJlcXVlc3RJZCwge1xyXG4gICAgICByZXNvbHZlLFxyXG4gICAgICByZWplY3QsXHJcbiAgICAgIG9yaWdpbixcclxuICAgICAgbWV0aG9kLFxyXG4gICAgICBzaWduUmVxdWVzdDogeyBtZXNzYWdlLCBhZGRyZXNzIH0sXHJcbiAgICAgIGFwcHJvdmFsVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249c2lnbiZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9Jm1ldGhvZD0ke21ldGhvZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2MDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NpZ24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3NpZ25UeXBlZERhdGEgKEVJUC03MTIpIC0gU2lnbiB0eXBlZCBkYXRhXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNpZ25UeXBlZERhdGEocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCkge1xyXG4gIC8vIENoZWNrIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKCFhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ05vdCBhdXRob3JpemVkLiBQbGVhc2UgY29ubmVjdCB5b3VyIHdhbGxldCBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHNpZ24gcmVxdWVzdFxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKTtcclxuICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBJbnZhbGlkIHNpZ24gdHlwZWQgZGF0YSByZXF1ZXN0IGZyb20gb3JpZ2luOicsIG9yaWdpbiwgdmFsaWRhdGlvbi5lcnJvcik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IC0zMjYwMixcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBzaWduIHJlcXVlc3Q6ICcgKyBzYW5pdGl6ZUVycm9yTWVzc2FnZSh2YWxpZGF0aW9uLmVycm9yKVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBhZGRyZXNzLCB0eXBlZERhdGEgfSA9IHZhbGlkYXRpb24uc2FuaXRpemVkO1xyXG5cclxuICAvLyBWZXJpZnkgdGhlIGFkZHJlc3MgbWF0Y2hlcyB0aGUgY29ubmVjdGVkIGFjY291bnRcclxuICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICBpZiAoIXdhbGxldCB8fCB3YWxsZXQuYWRkcmVzcy50b0xvd2VyQ2FzZSgpICE9PSBhZGRyZXNzLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogNDEwMCxcclxuICAgICAgICBtZXNzYWdlOiAnUmVxdWVzdGVkIGFkZHJlc3MgZG9lcyBub3QgbWF0Y2ggY29ubmVjdGVkIGFjY291bnQnXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpICsgJ19zaWduVHlwZWQnO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBtZXRob2QsXHJcbiAgICAgIHNpZ25SZXF1ZXN0OiB7IHR5cGVkRGF0YSwgYWRkcmVzcyB9LFxyXG4gICAgICBhcHByb3ZhbFRva2VuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPcGVuIGFwcHJvdmFsIHBvcHVwXHJcbiAgICBjaHJvbWUud2luZG93cy5jcmVhdGUoe1xyXG4gICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChgc3JjL3BvcHVwL3BvcHVwLmh0bWw/YWN0aW9uPXNpZ25UeXBlZCZyZXF1ZXN0SWQ9JHtyZXF1ZXN0SWR9Jm1ldGhvZD0ke21ldGhvZH1gKSxcclxuICAgICAgdHlwZTogJ3BvcHVwJyxcclxuICAgICAgd2lkdGg6IDQwMCxcclxuICAgICAgaGVpZ2h0OiA2NTBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRpbWVvdXQgYWZ0ZXIgNSBtaW51dGVzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHBlbmRpbmdTaWduUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1NpZ24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgbWVzc2FnZSBzaWduaW5nIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNlc3Npb25Ub2tlbikge1xyXG4gIGlmICghcGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIG1ldGhvZCwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSA9IHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIFZhbGlkYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIHRvIHByZXZlbnQgcmVwbGF5IGF0dGFja3NcclxuICBpZiAoIXZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSkge1xyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG5cclxuICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRoZSByZXF1ZXN0JykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCBnZXQgcGFzc3dvcmRcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gVW5sb2NrIHdhbGxldFxyXG4gICAgY29uc3QgeyBzaWduZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCk7XHJcblxyXG4gICAgbGV0IHNpZ25hdHVyZTtcclxuXHJcbiAgICAvLyBTaWduIGJhc2VkIG9uIG1ldGhvZFxyXG4gICAgaWYgKG1ldGhvZCA9PT0gJ3BlcnNvbmFsX3NpZ24nIHx8IG1ldGhvZCA9PT0gJ2V0aF9zaWduJykge1xyXG4gICAgICBzaWduYXR1cmUgPSBhd2FpdCBwZXJzb25hbFNpZ24oc2lnbmVyLCBzaWduUmVxdWVzdC5tZXNzYWdlKTtcclxuICAgIH0gZWxzZSBpZiAobWV0aG9kLnN0YXJ0c1dpdGgoJ2V0aF9zaWduVHlwZWREYXRhJykpIHtcclxuICAgICAgc2lnbmF0dXJlID0gYXdhaXQgc2lnblR5cGVkRGF0YShzaWduZXIsIHNpZ25SZXF1ZXN0LnR5cGVkRGF0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHNpZ25pbmcgbWV0aG9kOiAke21ldGhvZH1gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaWduYXR1cmUgZ2VuZXJhdGVkIHN1Y2Nlc3NmdWxseVxyXG4gICAgY29uc29sZS5sb2coJ/Cfq4AgTWVzc2FnZSBzaWduZWQgZm9yIG9yaWdpbjonLCBvcmlnaW4pO1xyXG5cclxuICAgIHJlc29sdmUoeyByZXN1bHQ6IHNpZ25hdHVyZSB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHNpZ25hdHVyZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHNpZ25pbmcgbWVzc2FnZTonLCBlcnJvcik7XHJcbiAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgc2lnbiByZXF1ZXN0IGRldGFpbHMgKGZvciBwb3B1cClcclxuZnVuY3Rpb24gZ2V0U2lnblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgcmV0dXJuIHBlbmRpbmdTaWduUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbn1cclxuXHJcbi8vIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSBjb250ZW50IHNjcmlwdHMgYW5kIHBvcHVwXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAvLyBSZWNlaXZlZCBtZXNzYWdlXHJcblxyXG4gIChhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ1dBTExFVF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZVdhbGxldFJlcXVlc3QobWVzc2FnZSwgc2VuZGVyKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0NPTk5FQ1RJT05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgYXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVDb25uZWN0aW9uQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyBhcHByb3ZhbCByZXNwb25zZVxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ09OTkVDVElPTl9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHJlcXVlc3RJbmZvID0gZ2V0Q29ubmVjdGlvblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyBjb25uZWN0aW9uIHJlcXVlc3QgaW5mb1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ09OTkVDVEVEX1NJVEVTJzpcclxuICAgICAgICAgIGNvbnN0IHNpdGVzID0gYXdhaXQgZ2V0Q29ubmVjdGVkU2l0ZXMoKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgY29ubmVjdGVkIHNpdGVzJyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBzaXRlcyB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdESVNDT05ORUNUX1NJVEUnOlxyXG4gICAgICAgICAgYXdhaXQgcmVtb3ZlQ29ubmVjdGVkU2l0ZShtZXNzYWdlLm9yaWdpbik7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGRpc2Nvbm5lY3QgY29uZmlybWF0aW9uXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1RSQU5TQUNUSU9OX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHR4QXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkLCBtZXNzYWdlLnNlc3Npb25Ub2tlbiwgbWVzc2FnZS5nYXNQcmljZSwgbWVzc2FnZS5jdXN0b21Ob25jZSk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIHRyYW5zYWN0aW9uIGFwcHJvdmFsIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodHhBcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ1JFQVRFX1NFU1NJT04nOlxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvblRva2VuID0gYXdhaXQgY3JlYXRlU2Vzc2lvbihtZXNzYWdlLnBhc3N3b3JkLCBtZXNzYWdlLndhbGxldElkLCBtZXNzYWdlLmR1cmF0aW9uTXMpO1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBzZXNzaW9uVG9rZW4gfSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnSU5WQUxJREFURV9TRVNTSU9OJzpcclxuICAgICAgICAgIGNvbnN0IGludmFsaWRhdGVkID0gaW52YWxpZGF0ZVNlc3Npb24obWVzc2FnZS5zZXNzaW9uVG9rZW4pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogaW52YWxpZGF0ZWQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnSU5WQUxJREFURV9BTExfU0VTU0lPTlMnOlxyXG4gICAgICAgICAgY29uc3QgY291bnQgPSBpbnZhbGlkYXRlQWxsU2Vzc2lvbnMoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGNvdW50IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9UUkFOU0FDVElPTl9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHR4UmVxdWVzdEluZm8gPSBnZXRUcmFuc2FjdGlvblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0cmFuc2FjdGlvbiByZXF1ZXN0IGluZm86JywgdHhSZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodHhSZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVE9LRU5fQUREX0FQUFJPVkFMJzpcclxuICAgICAgICAgIGNvbnN0IHRva2VuQXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVUb2tlbkFkZEFwcHJvdmFsKG1lc3NhZ2UucmVxdWVzdElkLCBtZXNzYWdlLmFwcHJvdmVkKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgdG9rZW4gYWRkIGFwcHJvdmFsIHJlc3BvbnNlOicsIHRva2VuQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHRva2VuQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1NJR05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnbkFwcHJvdmFsUmVzdWx0ID0gYXdhaXQgaGFuZGxlU2lnbkFwcHJvdmFsKFxyXG4gICAgICAgICAgICBtZXNzYWdlLnJlcXVlc3RJZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5hcHByb3ZlZCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHNpZ24gYXBwcm92YWwgcmVzcG9uc2U6Jywgc2lnbkFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzaWduQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9TSUdOX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3Qgc2lnblJlcXVlc3RJbmZvID0gZ2V0U2lnblJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBzaWduIHJlcXVlc3QgaW5mbzonLCBzaWduUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNpZ25SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RPS0VOX0FERF9SRVFVRVNUJzpcclxuICAgICAgICAgIGNvbnN0IHRva2VuUmVxdWVzdEluZm8gPSBnZXRUb2tlbkFkZFJlcXVlc3QobWVzc2FnZS5yZXF1ZXN0SWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgcmVxdWVzdCBpbmZvOicsIHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHRva2VuUmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zYWN0aW9uIEhpc3RvcnlcclxuICAgICAgICBjYXNlICdHRVRfVFhfSElTVE9SWSc6XHJcbiAgICAgICAgICBjb25zdCB0eEhpc3RvcnlMaXN0ID0gYXdhaXQgdHhIaXN0b3J5LmdldFR4SGlzdG9yeShtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgdHJhbnNhY3Rpb25zOiB0eEhpc3RvcnlMaXN0IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9QRU5ESU5HX1RYX0NPVU5UJzpcclxuICAgICAgICAgIGNvbnN0IHBlbmRpbmdDb3VudCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhDb3VudChtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQ6IHBlbmRpbmdDb3VudCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfUEVORElOR19UWFMnOlxyXG4gICAgICAgICAgY29uc3QgcGVuZGluZ1R4cyA9IGF3YWl0IHR4SGlzdG9yeS5nZXRQZW5kaW5nVHhzKG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbnM6IHBlbmRpbmdUeHMgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RYX0JZX0hBU0gnOlxyXG4gICAgICAgICAgY29uc3QgdHhEZXRhaWwgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2gobWVzc2FnZS5hZGRyZXNzLCBtZXNzYWdlLnR4SGFzaCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbjogdHhEZXRhaWwgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0xFQVJfVFhfSElTVE9SWSc6XHJcbiAgICAgICAgICBhd2FpdCB0eEhpc3RvcnkuY2xlYXJUeEhpc3RvcnkobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU1BFRURfVVBfVFgnOlxyXG4gICAgICAgICAgY29uc3Qgc3BlZWRVcFJlc3VsdCA9IGF3YWl0IGhhbmRsZVNwZWVkVXBUcmFuc2FjdGlvbihcclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnR4SGFzaCxcclxuICAgICAgICAgICAgbWVzc2FnZS5zZXNzaW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuZ2FzUHJpY2VNdWx0aXBsaWVyIHx8IDEuMlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzcGVlZFVwUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDQU5DRUxfVFgnOlxyXG4gICAgICAgICAgY29uc3QgY2FuY2VsUmVzdWx0ID0gYXdhaXQgaGFuZGxlQ2FuY2VsVHJhbnNhY3Rpb24oXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2Vzc2lvblRva2VuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKGNhbmNlbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFVua25vd24gbWVzc2FnZSB0eXBlOicsIG1lc3NhZ2UudHlwZSk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmtub3duIG1lc3NhZ2UgdHlwZScgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3IgaGFuZGxpbmcgbWVzc2FnZTonLCBlcnJvcik7XHJcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgIH1cclxuICB9KSgpO1xyXG5cclxuICByZXR1cm4gdHJ1ZTsgLy8gS2VlcCBtZXNzYWdlIGNoYW5uZWwgb3BlbiBmb3IgYXN5bmMgcmVzcG9uc2VcclxufSk7XHJcblxyXG5jb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBzZXJ2aWNlIHdvcmtlciByZWFkeScpO1xyXG4iXSwibmFtZXMiOlsiZXRoZXJzLmdldEFkZHJlc3MiLCJldGhlcnMuZ2V0Qnl0ZXMiLCJldGhlcnMudG9VdGY4U3RyaW5nIiwiZXRoZXJzLmlzQWRkcmVzcyIsInJwYy5nZXRCbG9ja051bWJlciIsInJwYy5nZXRCbG9ja0J5TnVtYmVyIiwicnBjLmdldEJhbGFuY2UiLCJycGMuZ2V0VHJhbnNhY3Rpb25Db3VudCIsInJwYy5nZXRHYXNQcmljZSIsInJwYy5lc3RpbWF0ZUdhcyIsInJwYy5jYWxsIiwicnBjLnNlbmRSYXdUcmFuc2FjdGlvbiIsInJwYy5nZXRUcmFuc2FjdGlvblJlY2VpcHQiLCJycGMuZ2V0VHJhbnNhY3Rpb25CeUhhc2giLCJycGMuZ2V0UHJvdmlkZXIiLCJ0eEhpc3RvcnkuYWRkVHhUb0hpc3RvcnkiLCJ0eEhpc3RvcnkuVFhfU1RBVFVTIiwidHhIaXN0b3J5LlRYX1RZUEVTIiwidHhIaXN0b3J5LmdldFR4QnlIYXNoIiwidHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzIiwidHhIaXN0b3J5LmdldFR4SGlzdG9yeSIsInR4SGlzdG9yeS5nZXRQZW5kaW5nVHhDb3VudCIsInR4SGlzdG9yeS5nZXRQZW5kaW5nVHhzIiwidHhIaXN0b3J5LmNsZWFyVHhIaXN0b3J5Il0sIm1hcHBpbmdzIjoiO0FBUUEsTUFBTSxpQkFBaUI7QUFDdkIsTUFBTSwwQkFBMEI7QUFDaEMsTUFBTSxzQkFBc0I7QUFHckIsTUFBTSxXQUFXO0FBQUEsRUFFdEIsVUFBVTtBQUVaO0FBR08sTUFBTSxZQUFZO0FBQUEsRUFDdkIsU0FBUztBQUFBLEVBQ1QsV0FBVztBQUFBLEVBQ1gsUUFBUTtBQUNWO0FBS08sZUFBZSx1QkFBdUI7QUFDM0MsUUFBTSxXQUFXLE1BQU0sS0FBSyx1QkFBdUI7QUFDbkQsU0FBTyxZQUFZO0FBQUEsSUFDakIsU0FBUztBQUFBO0FBQUEsSUFDVCxhQUFhO0FBQUE7QUFBQSxFQUNqQjtBQUNBO0FBWUEsZUFBZSxnQkFBZ0I7QUFDN0IsUUFBTSxVQUFVLE1BQU0sS0FBSyxjQUFjO0FBQ3pDLFNBQU8sV0FBVyxDQUFBO0FBQ3BCO0FBS0EsZUFBZSxlQUFlLFNBQVM7QUFDckMsUUFBTSxLQUFLLGdCQUFnQixPQUFPO0FBQ3BDO0FBS08sZUFBZSxhQUFhLFNBQVM7QUFDMUMsUUFBTSxXQUFXLE1BQU07QUFDdkIsTUFBSSxDQUFDLFNBQVMsU0FBUztBQUNyQixXQUFPO0VBQ1Q7QUFFQSxRQUFNLFVBQVUsTUFBTTtBQUN0QixRQUFNLGVBQWUsUUFBUTtBQUU3QixNQUFJLENBQUMsUUFBUSxZQUFZLEdBQUc7QUFDMUIsV0FBTztFQUNUO0FBRUEsU0FBTyxRQUFRLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQTtBQUMvQztBQUtPLGVBQWUsZUFBZSxTQUFTLFFBQVE7QUFDcEQsUUFBTSxXQUFXLE1BQU07QUFDdkIsTUFBSSxDQUFDLFNBQVMsU0FBUztBQUNyQjtBQUFBLEVBQ0Y7QUFF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
