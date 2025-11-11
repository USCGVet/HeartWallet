import { l as load, s as save, G as getAddress, A as getBytes, B as toUtf8String, i as isAddress, g as getProvider, u as unlockWallet, b as getActiveWallet, H as getTransactionByHash, I as getTransactionReceipt, J as sendRawTransaction, x as getGasPrice, y as estimateGas, K as call, n as getTransactionCount, j as getBalance, L as getBlockByNumber, M as getBlockNumber } from "./rpc.js";
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
    const { signer } = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
      }
    });
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
    const provider = await getProvider(network);
    const feeData = await provider.getFeeData();
    if (!feeData.gasPrice) {
      return { success: false, error: "Could not fetch gas price" };
    }
    return {
      success: true,
      gasPrice: feeData.gasPrice.toString(),
      gasPriceGwei: (Number(feeData.gasPrice) / 1e9).toFixed(2)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvdHhIaXN0b3J5LmpzIiwiLi4vc3JjL2NvcmUvdHhWYWxpZGF0aW9uLmpzIiwiLi4vc3JjL2NvcmUvc2lnbmluZy5qcyIsIi4uL3NyYy9iYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUcmFuc2FjdGlvbiBIaXN0b3J5IE1hbmFnZW1lbnRcclxuICogU3RvcmVzIHRyYW5zYWN0aW9uIGhpc3RvcnkgbG9jYWxseSBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxyXG4gKiBNYXggMjAgdHJhbnNhY3Rpb25zIHBlciBhZGRyZXNzIChGSUZPKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuL3N0b3JhZ2UuanMnO1xyXG5cclxuY29uc3QgVFhfSElTVE9SWV9LRVkgPSAndHhIaXN0b3J5X3YxJztcclxuY29uc3QgVFhfSElTVE9SWV9TRVRUSU5HU19LRVkgPSAndHhIaXN0b3J5U2V0dGluZ3MnO1xyXG5jb25zdCBNQVhfVFhTX1BFUl9BRERSRVNTID0gMjA7XHJcblxyXG4vLyBUcmFuc2FjdGlvbiB0eXBlc1xyXG5leHBvcnQgY29uc3QgVFhfVFlQRVMgPSB7XHJcbiAgU0VORDogJ3NlbmQnLCAgICAgICAgICAgLy8gTmF0aXZlIHRva2VuIHRyYW5zZmVyXHJcbiAgQ09OVFJBQ1Q6ICdjb250cmFjdCcsICAgLy8gQ29udHJhY3QgaW50ZXJhY3Rpb25cclxuICBUT0tFTjogJ3Rva2VuJyAgICAgICAgICAvLyBFUkMyMCB0b2tlbiB0cmFuc2ZlclxyXG59O1xyXG5cclxuLy8gVHJhbnNhY3Rpb24gc3RhdHVzZXNcclxuZXhwb3J0IGNvbnN0IFRYX1NUQVRVUyA9IHtcclxuICBQRU5ESU5HOiAncGVuZGluZycsXHJcbiAgQ09ORklSTUVEOiAnY29uZmlybWVkJyxcclxuICBGQUlMRUQ6ICdmYWlsZWQnXHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEhpc3RvcnlTZXR0aW5ncygpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGxvYWQoVFhfSElTVE9SWV9TRVRUSU5HU19LRVkpO1xyXG4gIHJldHVybiBzZXR0aW5ncyB8fCB7XHJcbiAgICBlbmFibGVkOiB0cnVlLCAgICAgIC8vIFRyYWNrIHRyYW5zYWN0aW9uIGhpc3RvcnlcclxuICAgIGNsZWFyT25Mb2NrOiBmYWxzZSAgLy8gRG9uJ3QgY2xlYXIgb24gd2FsbGV0IGxvY2tcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRyYW5zYWN0aW9uIGhpc3Rvcnkgc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVUeEhpc3RvcnlTZXR0aW5ncyhzZXR0aW5ncykge1xyXG4gIGF3YWl0IHNhdmUoVFhfSElTVE9SWV9TRVRUSU5HU19LRVksIHNldHRpbmdzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBhbGwgdHJhbnNhY3Rpb24gaGlzdG9yeVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QWxsSGlzdG9yeSgpIHtcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgbG9hZChUWF9ISVNUT1JZX0tFWSk7XHJcbiAgcmV0dXJuIGhpc3RvcnkgfHwge307XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYXZlIGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KSB7XHJcbiAgYXdhaXQgc2F2ZShUWF9ISVNUT1JZX0tFWSwgaGlzdG9yeSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdHJhbnNhY3Rpb24gaGlzdG9yeSBmb3IgYSBzcGVjaWZpYyBhZGRyZXNzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VHhIaXN0b3J5KGFkZHJlc3MpIHtcclxuICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGdldFR4SGlzdG9yeVNldHRpbmdzKCk7XHJcbiAgaWYgKCFzZXR0aW5ncy5lbmFibGVkKSB7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgZ2V0QWxsSGlzdG9yeSgpO1xyXG4gIGNvbnN0IGFkZHJlc3NMb3dlciA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCFoaXN0b3J5W2FkZHJlc3NMb3dlcl0pIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIHJldHVybiBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zIHx8IFtdO1xyXG59XHJcblxyXG4vKipcclxuICogQWRkIGEgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIHR4RGF0YSkge1xyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0VHhIaXN0b3J5U2V0dGluZ3MoKTtcclxuICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgIHJldHVybjsgLy8gSGlzdG9yeSBkaXNhYmxlZFxyXG4gIH1cclxuXHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIC8vIEluaXRpYWxpemUgYWRkcmVzcyBoaXN0b3J5IGlmIGRvZXNuJ3QgZXhpc3RcclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgaGlzdG9yeVthZGRyZXNzTG93ZXJdID0geyB0cmFuc2FjdGlvbnM6IFtdIH07XHJcbiAgfVxyXG5cclxuICAvLyBBZGQgbmV3IHRyYW5zYWN0aW9uIGF0IGJlZ2lubmluZyAobmV3ZXN0IGZpcnN0KVxyXG4gIGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMudW5zaGlmdCh7XHJcbiAgICBoYXNoOiB0eERhdGEuaGFzaCxcclxuICAgIHRpbWVzdGFtcDogdHhEYXRhLnRpbWVzdGFtcCB8fCBEYXRlLm5vdygpLFxyXG4gICAgZnJvbTogdHhEYXRhLmZyb20udG9Mb3dlckNhc2UoKSxcclxuICAgIHRvOiB0eERhdGEudG8gPyB0eERhdGEudG8udG9Mb3dlckNhc2UoKSA6IG51bGwsXHJcbiAgICB2YWx1ZTogdHhEYXRhLnZhbHVlIHx8ICcwJyxcclxuICAgIGRhdGE6IHR4RGF0YS5kYXRhIHx8ICcweCcsXHJcbiAgICBnYXNQcmljZTogdHhEYXRhLmdhc1ByaWNlLFxyXG4gICAgZ2FzTGltaXQ6IHR4RGF0YS5nYXNMaW1pdCxcclxuICAgIG5vbmNlOiB0eERhdGEubm9uY2UsXHJcbiAgICBuZXR3b3JrOiB0eERhdGEubmV0d29yayxcclxuICAgIHN0YXR1czogdHhEYXRhLnN0YXR1cyB8fCBUWF9TVEFUVVMuUEVORElORyxcclxuICAgIGJsb2NrTnVtYmVyOiB0eERhdGEuYmxvY2tOdW1iZXIgfHwgbnVsbCxcclxuICAgIHR5cGU6IHR4RGF0YS50eXBlIHx8IFRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgfSk7XHJcblxyXG4gIC8vIEVuZm9yY2UgbWF4IGxpbWl0IChGSUZPIC0gcmVtb3ZlIG9sZGVzdClcclxuICBpZiAoaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5sZW5ndGggPiBNQVhfVFhTX1BFUl9BRERSRVNTKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zID0gaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9ucy5zbGljZSgwLCBNQVhfVFhTX1BFUl9BRERSRVNTKTtcclxuICB9XHJcblxyXG4gIGF3YWl0IHNhdmVBbGxIaXN0b3J5KGhpc3RvcnkpO1xyXG4gIC8vIFRyYW5zYWN0aW9uIGFkZGVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdHJhbnNhY3Rpb24gc3RhdHVzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVHhTdGF0dXMoYWRkcmVzcywgdHhIYXNoLCBzdGF0dXMsIGJsb2NrTnVtYmVyID0gbnVsbCkge1xyXG4gIGNvbnN0IGhpc3RvcnkgPSBhd2FpdCBnZXRBbGxIaXN0b3J5KCk7XHJcbiAgY29uc3QgYWRkcmVzc0xvd2VyID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBpZiAoIWhpc3RvcnlbYWRkcmVzc0xvd2VyXSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdHhJbmRleCA9IGhpc3RvcnlbYWRkcmVzc0xvd2VyXS50cmFuc2FjdGlvbnMuZmluZEluZGV4KFxyXG4gICAgdHggPT4gdHguaGFzaC50b0xvd2VyQ2FzZSgpID09PSB0eEhhc2gudG9Mb3dlckNhc2UoKVxyXG4gICk7XHJcblxyXG4gIGlmICh0eEluZGV4ID09PSAtMSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaGlzdG9yeVthZGRyZXNzTG93ZXJdLnRyYW5zYWN0aW9uc1t0eEluZGV4XS5zdGF0dXMgPSBzdGF0dXM7XHJcbiAgaWYgKGJsb2NrTnVtYmVyICE9PSBudWxsKSB7XHJcbiAgICBoaXN0b3J5W2FkZHJlc3NMb3dlcl0udHJhbnNhY3Rpb25zW3R4SW5kZXhdLmJsb2NrTnVtYmVyID0gYmxvY2tOdW1iZXI7XHJcbiAgfVxyXG5cclxuICBhd2FpdCBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KTtcclxuICAvLyBUcmFuc2FjdGlvbiBzdGF0dXMgdXBkYXRlZFxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHBlbmRpbmcgdHJhbnNhY3Rpb25zIGZvciBhbiBhZGRyZXNzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVuZGluZ1R4cyhhZGRyZXNzKSB7XHJcbiAgY29uc3QgdHhzID0gYXdhaXQgZ2V0VHhIaXN0b3J5KGFkZHJlc3MpO1xyXG4gIHJldHVybiB0eHMuZmlsdGVyKHR4ID0+IHR4LnN0YXR1cyA9PT0gVFhfU1RBVFVTLlBFTkRJTkcpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHBlbmRpbmcgdHJhbnNhY3Rpb24gY291bnQgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nVHhDb3VudChhZGRyZXNzKSB7XHJcbiAgY29uc3QgcGVuZGluZ1R4cyA9IGF3YWl0IGdldFBlbmRpbmdUeHMoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHBlbmRpbmdUeHMubGVuZ3RoO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRyYW5zYWN0aW9uIGJ5IGhhc2hcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUeEJ5SGFzaChhZGRyZXNzLCB0eEhhc2gpIHtcclxuICBjb25zdCB0eHMgPSBhd2FpdCBnZXRUeEhpc3RvcnkoYWRkcmVzcyk7XHJcbiAgcmV0dXJuIHR4cy5maW5kKHR4ID0+IHR4Lmhhc2gudG9Mb3dlckNhc2UoKSA9PT0gdHhIYXNoLnRvTG93ZXJDYXNlKCkpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2xlYXIgYWxsIHRyYW5zYWN0aW9uIGhpc3RvcnkgZm9yIGFuIGFkZHJlc3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclR4SGlzdG9yeShhZGRyZXNzKSB7XHJcbiAgY29uc3QgaGlzdG9yeSA9IGF3YWl0IGdldEFsbEhpc3RvcnkoKTtcclxuICBjb25zdCBhZGRyZXNzTG93ZXIgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gIGlmIChoaXN0b3J5W2FkZHJlc3NMb3dlcl0pIHtcclxuICAgIGRlbGV0ZSBoaXN0b3J5W2FkZHJlc3NMb3dlcl07XHJcbiAgICBhd2FpdCBzYXZlQWxsSGlzdG9yeShoaXN0b3J5KTtcclxuICAgIC8vIFRyYW5zYWN0aW9uIGhpc3RvcnkgY2xlYXJlZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENsZWFyIGFsbCB0cmFuc2FjdGlvbiBoaXN0b3J5IChhbGwgYWRkcmVzc2VzKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQWxsVHhIaXN0b3J5KCkge1xyXG4gIGF3YWl0IHNhdmUoVFhfSElTVE9SWV9LRVksIHt9KTtcclxuICAvLyBBbGwgdHJhbnNhY3Rpb24gaGlzdG9yeSBjbGVhcmVkXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeHBvcnQgdHJhbnNhY3Rpb24gaGlzdG9yeSBhcyBKU09OIChmb3IgZGVidWdnaW5nKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFR4SGlzdG9yeShhZGRyZXNzKSB7XHJcbiAgY29uc3QgdHhzID0gYXdhaXQgZ2V0VHhIaXN0b3J5KGFkZHJlc3MpO1xyXG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh0eHMsIG51bGwsIDIpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBjb3JlL3R4VmFsaWRhdGlvbi5qc1xyXG4gKlxyXG4gKiBUcmFuc2FjdGlvbiB2YWxpZGF0aW9uIHV0aWxpdGllcyBmb3Igc2VjdXJpdHlcclxuICogVmFsaWRhdGVzIGFsbCB0cmFuc2FjdGlvbiBwYXJhbWV0ZXJzIGJlZm9yZSBwcm9jZXNzaW5nXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSB0cmFuc2FjdGlvbiByZXF1ZXN0IGZyb20gYSBkQXBwXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eFJlcXVlc3QgLSBUcmFuc2FjdGlvbiByZXF1ZXN0IG9iamVjdFxyXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4R2FzUHJpY2VHd2VpIC0gTWF4aW11bSBhbGxvd2VkIGdhcyBwcmljZSBpbiBHd2VpIChkZWZhdWx0IDEwMDApXHJcbiAqIEByZXR1cm5zIHt7IHZhbGlkOiBib29sZWFuLCBlcnJvcnM6IHN0cmluZ1tdLCBzYW5pdGl6ZWQ6IE9iamVjdCB9fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVHJhbnNhY3Rpb25SZXF1ZXN0KHR4UmVxdWVzdCwgbWF4R2FzUHJpY2VHd2VpID0gMTAwMCkge1xyXG4gIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gIGNvbnN0IHNhbml0aXplZCA9IHt9O1xyXG5cclxuICAvLyBWYWxpZGF0ZSAndG8nIGFkZHJlc3MgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3QudG8gIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudG8gIT09IG51bGwpIHtcclxuICAgIGlmICh0eXBlb2YgdHhSZXF1ZXN0LnRvICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRIZXhBZGRyZXNzKHR4UmVxdWVzdC50bykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidG9cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTm9ybWFsaXplIHRvIGNoZWNrc3VtIGFkZHJlc3NcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQudG8gPSBldGhlcnMuZ2V0QWRkcmVzcyh0eFJlcXVlc3QudG8pO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ0b1wiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2Zyb20nIGFkZHJlc3MgaWYgcHJlc2VudCAoc2hvdWxkIG1hdGNoIHdhbGxldCBhZGRyZXNzKVxyXG4gIGlmICh0eFJlcXVlc3QuZnJvbSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5mcm9tICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5mcm9tICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJmcm9tXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleEFkZHJlc3ModHhSZXF1ZXN0LmZyb20pKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImZyb21cIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgRXRoZXJldW0gYWRkcmVzcycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzYW5pdGl6ZWQuZnJvbSA9IGV0aGVycy5nZXRBZGRyZXNzKHR4UmVxdWVzdC5mcm9tKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZnJvbVwiIGZpZWxkIGlzIG5vdCBhIHZhbGlkIGFkZHJlc3MnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ3ZhbHVlJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QudmFsdWUgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3QudmFsdWUgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC52YWx1ZSkpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwidmFsdWVcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgaGV4IHN0cmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB2YWx1ZUJpZ0ludCA9IEJpZ0ludCh0eFJlcXVlc3QudmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZUJpZ0ludCA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQudmFsdWUgPSB0eFJlcXVlc3QudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJ2YWx1ZVwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHNhbml0aXplZC52YWx1ZSA9ICcweDAnOyAvLyBEZWZhdWx0IHRvIDBcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdkYXRhJyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5kYXRhICE9PSBudWxsKSB7XHJcbiAgICBpZiAodHlwZW9mIHR4UmVxdWVzdC5kYXRhICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJkYXRhXCIgZmllbGQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgfSBlbHNlIGlmICghaXNWYWxpZEhleERhdGEodHhSZXF1ZXN0LmRhdGEpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImRhdGFcIiBmaWVsZCBtdXN0IGJlIHZhbGlkIGhleCBkYXRhJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzYW5pdGl6ZWQuZGF0YSA9IHR4UmVxdWVzdC5kYXRhO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBzYW5pdGl6ZWQuZGF0YSA9ICcweCc7IC8vIERlZmF1bHQgdG8gZW1wdHkgZGF0YVxyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgJ2dhcycgb3IgJ2dhc0xpbWl0JyBmaWVsZFxyXG4gIGlmICh0eFJlcXVlc3QuZ2FzICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0LmdhcyAhPT0gbnVsbCkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGV4VmFsdWUodHhSZXF1ZXN0LmdhcykpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhcyk7XHJcbiAgICAgICAgaWYgKGdhc0xpbWl0IDwgMjEwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNcIiBsaW1pdCB0b28gbG93IChtaW5pbXVtIDIxMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FzTGltaXQgPiAzMDAwMDAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGxpbWl0IHRvbyBoaWdoIChtYXhpbXVtIDMwMDAwMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzID0gdHhSZXF1ZXN0LmdhcztcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1wiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc0xpbWl0ICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzTGltaXQpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzTGltaXQgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc0xpbWl0KTtcclxuICAgICAgICBpZiAoZ2FzTGltaXQgPCAyMTAwMG4pIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc0xpbWl0XCIgdG9vIGxvdyAobWluaW11bSAyMTAwMCknKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc0xpbWl0ID4gMzAwMDAwMDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIHRvbyBoaWdoIChtYXhpbXVtIDMwMDAwMDAwKScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzYW5pdGl6ZWQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzTGltaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJnYXNMaW1pdFwiIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBWYWxpZGF0ZSAnZ2FzUHJpY2UnIGZpZWxkIGlmIHByZXNlbnRcclxuICBpZiAodHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSB1bmRlZmluZWQgJiYgdHhSZXF1ZXN0Lmdhc1ByaWNlICE9PSBudWxsKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZXhWYWx1ZSh0eFJlcXVlc3QuZ2FzUHJpY2UpKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZmllbGQgbXVzdCBiZSBhIHZhbGlkIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ2FzUHJpY2UgPSBCaWdJbnQodHhSZXF1ZXN0Lmdhc1ByaWNlKTtcclxuICAgICAgICBjb25zdCBtYXhHYXNQcmljZVdlaSA9IEJpZ0ludChtYXhHYXNQcmljZUd3ZWkpICogQmlnSW50KCcxMDAwMDAwMDAwJyk7IC8vIENvbnZlcnQgR3dlaSB0byBXZWlcclxuICAgICAgICBpZiAoZ2FzUHJpY2UgPCAwbikge1xyXG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwiZ2FzUHJpY2VcIiBjYW5ub3QgYmUgbmVnYXRpdmUnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGdhc1ByaWNlID4gbWF4R2FzUHJpY2VXZWkpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKGBJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgZXhjZWVkcyBtYXhpbXVtIG9mICR7bWF4R2FzUHJpY2VHd2VpfSBHd2VpYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNhbml0aXplZC5nYXNQcmljZSA9IHR4UmVxdWVzdC5nYXNQcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcImdhc1ByaWNlXCIgaXMgbm90IGEgdmFsaWQgbnVtYmVyJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlICdub25jZScgZmllbGQgaWYgcHJlc2VudFxyXG4gIGlmICh0eFJlcXVlc3Qubm9uY2UgIT09IHVuZGVmaW5lZCAmJiB0eFJlcXVlc3Qubm9uY2UgIT09IG51bGwpIHtcclxuICAgIGlmICghaXNWYWxpZEhleFZhbHVlKHR4UmVxdWVzdC5ub25jZSkgJiYgdHlwZW9mIHR4UmVxdWVzdC5ub25jZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBmaWVsZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIG9yIGhleCBzdHJpbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0eXBlb2YgdHhSZXF1ZXN0Lm5vbmNlID09PSAnc3RyaW5nJyBcclxuICAgICAgICAgID8gQmlnSW50KHR4UmVxdWVzdC5ub25jZSkgXHJcbiAgICAgICAgICA6IEJpZ0ludCh0eFJlcXVlc3Qubm9uY2UpO1xyXG4gICAgICAgIGlmIChub25jZSA8IDBuKSB7XHJcbiAgICAgICAgICBlcnJvcnMucHVzaCgnSW52YWxpZCB0cmFuc2FjdGlvbjogXCJub25jZVwiIGNhbm5vdCBiZSBuZWdhdGl2ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9uY2UgPiBCaWdJbnQoJzkwMDcxOTkyNTQ3NDA5OTEnKSkgeyAvLyBKYXZhU2NyaXB0IHNhZmUgaW50ZWdlciBtYXhcclxuICAgICAgICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBcIm5vbmNlXCIgaXMgdW5yZWFzb25hYmx5IGhpZ2gnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2FuaXRpemVkLm5vbmNlID0gdHhSZXF1ZXN0Lm5vbmNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goJ0ludmFsaWQgdHJhbnNhY3Rpb246IFwibm9uY2VcIiBpcyBub3QgYSB2YWxpZCBudW1iZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJhbnNhY3Rpb24gbXVzdCBoYXZlIGVpdGhlciAndG8nIG9yICdkYXRhJyAoY29udHJhY3QgY3JlYXRpb24pXHJcbiAgaWYgKCFzYW5pdGl6ZWQudG8gJiYgKCFzYW5pdGl6ZWQuZGF0YSB8fCBzYW5pdGl6ZWQuZGF0YSA9PT0gJzB4JykpIHtcclxuICAgIGVycm9ycy5wdXNoKCdJbnZhbGlkIHRyYW5zYWN0aW9uOiBtdXN0IGhhdmUgXCJ0b1wiIGFkZHJlc3Mgb3IgXCJkYXRhXCIgZm9yIGNvbnRyYWN0IGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnMsXHJcbiAgICBzYW5pdGl6ZWRcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIEV0aGVyZXVtIGFkZHJlc3MgKGhleCBmb3JtYXQpXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhZGRyZXNzIC0gQWRkcmVzcyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhBZGRyZXNzKGFkZHJlc3MpIHtcclxuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBiZSA0MiBjaGFyYWN0ZXJzOiAweCArIDQwIGhleCBkaWdpdHNcclxuICByZXR1cm4gL14weFswLTlhLWZBLUZdezQwfSQvLnRlc3QoYWRkcmVzcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBoZXggdmFsdWUgKGZvciBhbW91bnRzLCBnYXMsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEhleCB2YWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZXhWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBzdGFydCB3aXRoIDB4IGFuZCBjb250YWluIG9ubHkgaGV4IGRpZ2l0c1xyXG4gIHJldHVybiAvXjB4WzAtOWEtZkEtRl0rJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaGV4IGRhdGEgKGZvciB0cmFuc2FjdGlvbiBkYXRhIGZpZWxkKVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIEhleCBkYXRhIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZEhleERhdGEoZGF0YSkge1xyXG4gIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcclxuICAvLyBNdXN0IGJlIDB4IG9yIDB4IGZvbGxvd2VkIGJ5IGV2ZW4gbnVtYmVyIG9mIGhleCBkaWdpdHNcclxuICBpZiAoZGF0YSA9PT0gJzB4JykgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIC9eMHhbMC05YS1mQS1GXSokLy50ZXN0KGRhdGEpICYmIGRhdGEubGVuZ3RoICUgMiA9PT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBhbiBlcnJvciBtZXNzYWdlIGZvciBzYWZlIGRpc3BsYXlcclxuICogUmVtb3ZlcyBhbnkgSFRNTCwgc2NyaXB0cywgYW5kIGNvbnRyb2wgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUVycm9yTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgcmV0dXJuICdVbmtub3duIGVycm9yJztcclxuICBcclxuICAvLyBSZW1vdmUgbnVsbCBieXRlcyBhbmQgY29udHJvbCBjaGFyYWN0ZXJzIChleGNlcHQgbmV3bGluZXMgYW5kIHRhYnMpXHJcbiAgbGV0IHNhbml0aXplZCA9IG1lc3NhZ2UucmVwbGFjZSgvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0ZdL2csICcnKTtcclxuICBcclxuICAvLyBSZW1vdmUgSFRNTCB0YWdzXHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xyXG4gIFxyXG4gIC8vIFJlbW92ZSBzY3JpcHQtbGlrZSBjb250ZW50XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJyk7XHJcbiAgc2FuaXRpemVkID0gc2FuaXRpemVkLnJlcGxhY2UoL29uXFx3K1xccyo9L2dpLCAnJyk7XHJcbiAgXHJcbiAgLy8gTGltaXQgbGVuZ3RoIHRvIHByZXZlbnQgRG9TXHJcbiAgaWYgKHNhbml0aXplZC5sZW5ndGggPiA1MDApIHtcclxuICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5zdWJzdHJpbmcoMCwgNDk3KSArICcuLi4nO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gc2FuaXRpemVkIHx8ICdVbmtub3duIGVycm9yJztcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyB1c2VyIGlucHV0IGZvciBzYWZlIGRpc3BsYXkgKHByZXZlbnRzIFhTUylcclxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0IC0gVXNlciBpbnB1dCB0byBzYW5pdGl6ZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBTYW5pdGl6ZWQgaW5wdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVVzZXJJbnB1dChpbnB1dCkge1xyXG4gIGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSByZXR1cm4gJyc7XHJcbiAgXHJcbiAgLy8gQ3JlYXRlIGEgdGV4dCBub2RlIGFuZCBleHRyYWN0IHRoZSBlc2NhcGVkIHRleHRcclxuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBkaXYudGV4dENvbnRlbnQgPSBpbnB1dDtcclxuICByZXR1cm4gZGl2LmlubmVySFRNTDtcclxufVxyXG4iLCIvKipcclxuICogY29yZS9zaWduaW5nLmpzXHJcbiAqXHJcbiAqIE1lc3NhZ2Ugc2lnbmluZyBmdW5jdGlvbmFsaXR5IGZvciBFSVAtMTkxIGFuZCBFSVAtNzEyXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcclxuXHJcbi8qKlxyXG4gKiBTaWducyBhIG1lc3NhZ2UgdXNpbmcgRUlQLTE5MSAocGVyc29uYWxfc2lnbilcclxuICogVGhpcyBwcmVwZW5kcyBcIlxceDE5RXRoZXJldW0gU2lnbmVkIE1lc3NhZ2U6XFxuXCIgKyBsZW4obWVzc2FnZSkgdG8gdGhlIG1lc3NhZ2VcclxuICogYmVmb3JlIHNpZ25pbmcsIHdoaWNoIHByZXZlbnRzIHNpZ25pbmcgYXJiaXRyYXJ5IHRyYW5zYWN0aW9uc1xyXG4gKlxyXG4gKiBAcGFyYW0ge2V0aGVycy5XYWxsZXR9IHNpZ25lciAtIFdhbGxldCBpbnN0YW5jZSB0byBzaWduIHdpdGhcclxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHNpZ24gKGhleCBzdHJpbmcgb3IgVVRGLTggc3RyaW5nKVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBTaWduYXR1cmUgKDB4LXByZWZpeGVkIGhleCBzdHJpbmcpXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGVyc29uYWxTaWduKHNpZ25lciwgbWVzc2FnZSkge1xyXG4gIGlmICghc2lnbmVyIHx8IHR5cGVvZiBzaWduZXIuc2lnbk1lc3NhZ2UgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaWduZXIgcHJvdmlkZWQnKTtcclxuICB9XHJcblxyXG4gIGlmICghbWVzc2FnZSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdNZXNzYWdlIGlzIHJlcXVpcmVkJyk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gSWYgbWVzc2FnZSBpcyBoZXgtZW5jb2RlZCwgZGVjb2RlIGl0IGZpcnN0XHJcbiAgICAvLyBldGhlcnMuanMgc2lnbk1lc3NhZ2UgZXhwZWN0cyBhIHN0cmluZyBvciBVaW50OEFycmF5XHJcbiAgICBsZXQgbWVzc2FnZVRvU2lnbiA9IG1lc3NhZ2U7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyAmJiBtZXNzYWdlLnN0YXJ0c1dpdGgoJzB4JykpIHtcclxuICAgICAgLy8gSXQncyBhIGhleCBzdHJpbmcsIGNvbnZlcnQgdG8gVVRGLThcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBUcnkgdG8gZGVjb2RlIGFzIGhleFxyXG4gICAgICAgIGNvbnN0IGJ5dGVzID0gZXRoZXJzLmdldEJ5dGVzKG1lc3NhZ2UpO1xyXG4gICAgICAgIG1lc3NhZ2VUb1NpZ24gPSBldGhlcnMudG9VdGY4U3RyaW5nKGJ5dGVzKTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgLy8gSWYgZGVjb2RpbmcgZmFpbHMsIHVzZSB0aGUgaGV4IHN0cmluZyBhcy1pc1xyXG4gICAgICAgIC8vIGV0aGVycyB3aWxsIGhhbmRsZSBpdFxyXG4gICAgICAgIG1lc3NhZ2VUb1NpZ24gPSBtZXNzYWdlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2lnbiB0aGUgbWVzc2FnZSAoZXRoZXJzLmpzIGF1dG9tYXRpY2FsbHkgYXBwbGllcyBFSVAtMTkxIGZvcm1hdClcclxuICAgIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IHNpZ25lci5zaWduTWVzc2FnZShtZXNzYWdlVG9TaWduKTtcclxuXHJcbiAgICByZXR1cm4gc2lnbmF0dXJlO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBzaWduIG1lc3NhZ2U6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaWducyB0eXBlZCBkYXRhIHVzaW5nIEVJUC03MTJcclxuICogVXNlZCBieSBkQXBwcyBmb3Igc3RydWN0dXJlZCBkYXRhIHNpZ25pbmcgKHBlcm1pdHMsIG1ldGEtdHJhbnNhY3Rpb25zLCBldGMuKVxyXG4gKlxyXG4gKiBAcGFyYW0ge2V0aGVycy5XYWxsZXR9IHNpZ25lciAtIFdhbGxldCBpbnN0YW5jZSB0byBzaWduIHdpdGhcclxuICogQHBhcmFtIHtPYmplY3R9IHR5cGVkRGF0YSAtIEVJUC03MTIgdHlwZWQgZGF0YSBvYmplY3Qgd2l0aCBkb21haW4sIHR5cGVzLCBhbmQgbWVzc2FnZVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBTaWduYXR1cmUgKDB4LXByZWZpeGVkIGhleCBzdHJpbmcpXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2lnblR5cGVkRGF0YShzaWduZXIsIHR5cGVkRGF0YSkge1xyXG4gIGlmICghc2lnbmVyIHx8IHR5cGVvZiBzaWduZXIuc2lnblR5cGVkRGF0YSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHNpZ25lciBwcm92aWRlZCcpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCF0eXBlZERhdGEpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignVHlwZWQgZGF0YSBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgdHlwZWQgZGF0YSBzdHJ1Y3R1cmVcclxuICBpZiAoIXR5cGVkRGF0YS5kb21haW4gfHwgIXR5cGVkRGF0YS50eXBlcyB8fCAhdHlwZWREYXRhLm1lc3NhZ2UpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBFSVAtNzEyIHR5cGVkIGRhdGE6IG1pc3NpbmcgZG9tYWluLCB0eXBlcywgb3IgbWVzc2FnZScpO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIEV4dHJhY3QgcHJpbWFyeVR5cGUgKGlmIG5vdCBwcm92aWRlZCwgdHJ5IHRvIGluZmVyIGl0KVxyXG4gICAgbGV0IHByaW1hcnlUeXBlID0gdHlwZWREYXRhLnByaW1hcnlUeXBlO1xyXG5cclxuICAgIGlmICghcHJpbWFyeVR5cGUpIHtcclxuICAgICAgLy8gVHJ5IHRvIGluZmVyIHByaW1hcnkgdHlwZSBmcm9tIHR5cGVzIG9iamVjdFxyXG4gICAgICAvLyBJdCdzIHRoZSB0eXBlIHRoYXQncyBub3QgXCJFSVA3MTJEb21haW5cIlxyXG4gICAgICBjb25zdCB0eXBlTmFtZXMgPSBPYmplY3Qua2V5cyh0eXBlZERhdGEudHlwZXMpLmZpbHRlcih0ID0+IHQgIT09ICdFSVA3MTJEb21haW4nKTtcclxuICAgICAgaWYgKHR5cGVOYW1lcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICBwcmltYXJ5VHlwZSA9IHR5cGVOYW1lc1swXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBpbmZlciBwcmltYXJ5VHlwZSAtIHBsZWFzZSBzcGVjaWZ5IGl0IGV4cGxpY2l0bHknKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFZhbGlkYXRlIHRoYXQgcHJpbWFyeVR5cGUgZXhpc3RzIGluIHR5cGVzXHJcbiAgICBpZiAoIXR5cGVkRGF0YS50eXBlc1twcmltYXJ5VHlwZV0pIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcmltYXJ5IHR5cGUgXCIke3ByaW1hcnlUeXBlfVwiIG5vdCBmb3VuZCBpbiB0eXBlcyBkZWZpbml0aW9uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2lnbiB1c2luZyBldGhlcnMuanMgc2lnblR5cGVkRGF0YVxyXG4gICAgLy8gZXRoZXJzIHY2IHVzZXM6IHNpZ25UeXBlZERhdGEoZG9tYWluLCB0eXBlcywgdmFsdWUpXHJcbiAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBzaWduZXIuc2lnblR5cGVkRGF0YShcclxuICAgICAgdHlwZWREYXRhLmRvbWFpbixcclxuICAgICAgdHlwZWREYXRhLnR5cGVzLFxyXG4gICAgICB0eXBlZERhdGEubWVzc2FnZVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gc2lnbmF0dXJlO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBzaWduIHR5cGVkIGRhdGE6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBtZXNzYWdlIHNpZ25pbmcgcmVxdWVzdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kIC0gUlBDIG1ldGhvZCAocGVyc29uYWxfc2lnbiwgZXRoX3NpZ25UeXBlZERhdGFfdjQsIGV0Yy4pXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBhcmFtcyAtIFJQQyBwYXJhbWV0ZXJzXHJcbiAqIEByZXR1cm5zIHtPYmplY3R9IHsgdmFsaWQ6IGJvb2xlYW4sIGVycm9yPzogc3RyaW5nLCBzYW5pdGl6ZWQ/OiBPYmplY3QgfVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2lnblJlcXVlc3QobWV0aG9kLCBwYXJhbXMpIHtcclxuICBpZiAoIW1ldGhvZCB8fCAhcGFyYW1zIHx8ICFBcnJheS5pc0FycmF5KHBhcmFtcykpIHtcclxuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHJlcXVlc3QgZm9ybWF0JyB9O1xyXG4gIH1cclxuXHJcbiAgc3dpdGNoIChtZXRob2QpIHtcclxuICAgIGNhc2UgJ3BlcnNvbmFsX3NpZ24nOlxyXG4gICAgY2FzZSAnZXRoX3NpZ24nOiAvLyBOb3RlOiBldGhfc2lnbiBpcyBkYW5nZXJvdXMgYW5kIHNob3VsZCBzaG93IHN0cm9uZyB3YXJuaW5nXHJcbiAgICAgIGlmIChwYXJhbXMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNaXNzaW5nIHJlcXVpcmVkIHBhcmFtZXRlcnMnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBwYXJhbXNbMF07XHJcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBwYXJhbXNbMV07XHJcblxyXG4gICAgICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnTWVzc2FnZSBpcyBlbXB0eScgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFhZGRyZXNzIHx8ICFldGhlcnMuaXNBZGRyZXNzKGFkZHJlc3MpKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYWRkcmVzcycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2FuaXRpemUgbWVzc2FnZSAoY29udmVydCB0byBzdHJpbmcgaWYgbmVlZGVkKVxyXG4gICAgICBjb25zdCBzYW5pdGl6ZWRNZXNzYWdlID0gdHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnID8gbWVzc2FnZSA6IFN0cmluZyhtZXNzYWdlKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsaWQ6IHRydWUsXHJcbiAgICAgICAgc2FuaXRpemVkOiB7XHJcbiAgICAgICAgICBtZXNzYWdlOiBzYW5pdGl6ZWRNZXNzYWdlLFxyXG4gICAgICAgICAgYWRkcmVzczogZXRoZXJzLmdldEFkZHJlc3MoYWRkcmVzcykgLy8gTm9ybWFsaXplIHRvIGNoZWNrc3VtIGFkZHJlc3NcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGEnOlxyXG4gICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGFfdjMnOlxyXG4gICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGFfdjQnOlxyXG4gICAgICBpZiAocGFyYW1zLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXJzJyB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhZGRyID0gcGFyYW1zWzBdO1xyXG4gICAgICBsZXQgdHlwZWREYXRhID0gcGFyYW1zWzFdO1xyXG5cclxuICAgICAgaWYgKCFhZGRyIHx8ICFldGhlcnMuaXNBZGRyZXNzKGFkZHIpKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYWRkcmVzcycgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUGFyc2UgdHlwZWQgZGF0YSBpZiBpdCdzIGEgc3RyaW5nXHJcbiAgICAgIGlmICh0eXBlb2YgdHlwZWREYXRhID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB0eXBlZERhdGEgPSBKU09OLnBhcnNlKHR5cGVkRGF0YSk7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCB0eXBlZCBkYXRhIGZvcm1hdCcgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFZhbGlkYXRlIHR5cGVkIGRhdGEgc3RydWN0dXJlXHJcbiAgICAgIGlmICghdHlwZWREYXRhIHx8IHR5cGVvZiB0eXBlZERhdGEgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1R5cGVkIGRhdGEgbXVzdCBiZSBhbiBvYmplY3QnIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghdHlwZWREYXRhLmRvbWFpbiB8fCAhdHlwZWREYXRhLnR5cGVzIHx8ICF0eXBlZERhdGEubWVzc2FnZSkge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6ICdUeXBlZCBkYXRhIG1pc3NpbmcgcmVxdWlyZWQgZmllbGRzIChkb21haW4sIHR5cGVzLCBtZXNzYWdlKScgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB2YWxpZDogdHJ1ZSxcclxuICAgICAgICBzYW5pdGl6ZWQ6IHtcclxuICAgICAgICAgIGFkZHJlc3M6IGV0aGVycy5nZXRBZGRyZXNzKGFkZHIpLFxyXG4gICAgICAgICAgdHlwZWREYXRhOiB0eXBlZERhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYFVuc3VwcG9ydGVkIHNpZ25pbmcgbWV0aG9kOiAke21ldGhvZH1gIH07XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0cyBhIG1lc3NhZ2UgZm9yIGRpc3BsYXkgaW4gdGhlIFVJXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHtudW1iZXJ9IG1heExlbmd0aCAtIE1heGltdW0gZGlzcGxheSBsZW5ndGhcclxuICogQHJldHVybnMge3N0cmluZ30gRm9ybWF0dGVkIG1lc3NhZ2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlRm9yRGlzcGxheShtZXNzYWdlLCBtYXhMZW5ndGggPSA1MDApIHtcclxuICBpZiAoIW1lc3NhZ2UpIHJldHVybiAnJztcclxuXHJcbiAgbGV0IGRpc3BsYXlNZXNzYWdlID0gbWVzc2FnZTtcclxuXHJcbiAgLy8gSWYgaXQncyBhIGhleCBzdHJpbmcsIHRyeSB0byBkZWNvZGUgaXRcclxuICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnICYmIG1lc3NhZ2Uuc3RhcnRzV2l0aCgnMHgnKSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYnl0ZXMgPSBldGhlcnMuZ2V0Qnl0ZXMobWVzc2FnZSk7XHJcbiAgICAgIGNvbnN0IGRlY29kZWQgPSBldGhlcnMudG9VdGY4U3RyaW5nKGJ5dGVzKTtcclxuICAgICAgLy8gT25seSB1c2UgZGVjb2RlZCBpZiBpdCBsb29rcyBsaWtlIHJlYWRhYmxlIHRleHRcclxuICAgICAgaWYgKC9eW1xceDIwLVxceDdFXFxzXSskLy50ZXN0KGRlY29kZWQpKSB7XHJcbiAgICAgICAgZGlzcGxheU1lc3NhZ2UgPSBkZWNvZGVkO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgLy8gS2VlcCBhcyBoZXggaWYgZGVjb2RpbmcgZmFpbHNcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFRydW5jYXRlIGlmIHRvbyBsb25nXHJcbiAgaWYgKGRpc3BsYXlNZXNzYWdlLmxlbmd0aCA+IG1heExlbmd0aCkge1xyXG4gICAgcmV0dXJuIGRpc3BsYXlNZXNzYWdlLnN1YnN0cmluZygwLCBtYXhMZW5ndGgpICsgJy4uLic7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZGlzcGxheU1lc3NhZ2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3JtYXRzIHR5cGVkIGRhdGEgZm9yIGRpc3BsYXkgaW4gdGhlIFVJXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZERhdGEgLSBFSVAtNzEyIHR5cGVkIGRhdGFcclxuICogQHJldHVybnMge3N0cmluZ30gSHVtYW4tcmVhZGFibGUgZm9ybWF0dGVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFR5cGVkRGF0YUZvckRpc3BsYXkodHlwZWREYXRhKSB7XHJcbiAgaWYgKCF0eXBlZERhdGEpIHJldHVybiAnJztcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIENyZWF0ZSBhIHNpbXBsaWZpZWQgdmlldyBvZiB0aGUgdHlwZWQgZGF0YVxyXG4gICAgY29uc3QgZGlzcGxheSA9IHtcclxuICAgICAgZG9tYWluOiB0eXBlZERhdGEuZG9tYWluLFxyXG4gICAgICBwcmltYXJ5VHlwZTogdHlwZWREYXRhLnByaW1hcnlUeXBlIHx8ICdVbmtub3duJyxcclxuICAgICAgbWVzc2FnZTogdHlwZWREYXRhLm1lc3NhZ2VcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRpc3BsYXksIG51bGwsIDIpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHR5cGVkRGF0YSwgbnVsbCwgMik7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBiYWNrZ3JvdW5kL3NlcnZpY2Utd29ya2VyLmpzXHJcbiAqXHJcbiAqIEJhY2tncm91bmQgc2VydmljZSB3b3JrZXIgZm9yIEhlYXJ0V2FsbGV0XHJcbiAqIEhhbmRsZXMgUlBDIHJlcXVlc3RzIGZyb20gZEFwcHMgYW5kIG1hbmFnZXMgd2FsbGV0IHN0YXRlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZ2V0QWN0aXZlV2FsbGV0LCB1bmxvY2tXYWxsZXQgfSBmcm9tICcuLi9jb3JlL3dhbGxldC5qcyc7XHJcbmltcG9ydCB7IGxvYWQsIHNhdmUgfSBmcm9tICcuLi9jb3JlL3N0b3JhZ2UuanMnO1xyXG5pbXBvcnQgKiBhcyBycGMgZnJvbSAnLi4vY29yZS9ycGMuanMnO1xyXG5pbXBvcnQgKiBhcyB0eEhpc3RvcnkgZnJvbSAnLi4vY29yZS90eEhpc3RvcnkuanMnO1xyXG5pbXBvcnQgeyB2YWxpZGF0ZVRyYW5zYWN0aW9uUmVxdWVzdCwgc2FuaXRpemVFcnJvck1lc3NhZ2UgfSBmcm9tICcuLi9jb3JlL3R4VmFsaWRhdGlvbi5qcyc7XHJcbmltcG9ydCB7IHBlcnNvbmFsU2lnbiwgc2lnblR5cGVkRGF0YSwgdmFsaWRhdGVTaWduUmVxdWVzdCB9IGZyb20gJy4uL2NvcmUvc2lnbmluZy5qcyc7XHJcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XHJcblxyXG4vLyBTZXJ2aWNlIHdvcmtlciBsb2FkZWRcclxuXHJcbi8vIE5ldHdvcmsgY2hhaW4gSURzXHJcbmNvbnN0IENIQUlOX0lEUyA9IHtcclxuICAncHVsc2VjaGFpblRlc3RuZXQnOiAnMHgzQUYnLCAvLyA5NDNcclxuICAncHVsc2VjaGFpbic6ICcweDE3MScsIC8vIDM2OVxyXG4gICdldGhlcmV1bSc6ICcweDEnLCAvLyAxXHJcbiAgJ3NlcG9saWEnOiAnMHhBQTM2QTcnIC8vIDExMTU1MTExXHJcbn07XHJcblxyXG4vLyBTdG9yYWdlIGtleXNcclxuY29uc3QgQ09OTkVDVEVEX1NJVEVTX0tFWSA9ICdjb25uZWN0ZWRfc2l0ZXMnO1xyXG5cclxuLy8gUGVuZGluZyBjb25uZWN0aW9uIHJlcXVlc3RzIChvcmlnaW4gLT4geyByZXNvbHZlLCByZWplY3QsIHRhYklkIH0pXHJcbmNvbnN0IHBlbmRpbmdDb25uZWN0aW9ucyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vID09PT09IFNFU1NJT04gTUFOQUdFTUVOVCA9PT09PVxyXG4vLyBTZXNzaW9uIHRva2VucyBzdG9yZWQgaW4gbWVtb3J5IChjbGVhcmVkIHdoZW4gc2VydmljZSB3b3JrZXIgdGVybWluYXRlcylcclxuLy8gU0VDVVJJVFkgTk9URTogU2VydmljZSB3b3JrZXJzIGNhbiBiZSB0ZXJtaW5hdGVkIGJ5IENocm9tZSBhdCBhbnkgdGltZSwgd2hpY2ggY2xlYXJzIGFsbFxyXG4vLyBzZXNzaW9uIGRhdGEuIFRoaXMgaXMgaW50ZW50aW9uYWwgLSB3ZSBkb24ndCB3YW50IHBhc3N3b3JkcyBwZXJzaXN0aW5nIGxvbmdlciB0aGFuIG5lZWRlZC5cclxuLy8gU2Vzc2lvbnMgYXJlIGVuY3J5cHRlZCBpbiBtZW1vcnkgYXMgYW4gYWRkaXRpb25hbCBzZWN1cml0eSBsYXllci5cclxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwKCk7IC8vIHNlc3Npb25Ub2tlbiAtPiB7IGVuY3J5cHRlZFBhc3N3b3JkLCB3YWxsZXRJZCwgZXhwaXJlc0F0LCBzYWx0IH1cclxuXHJcbi8vIFNlc3Npb24gZW5jcnlwdGlvbiBrZXkgKHJlZ2VuZXJhdGVkIG9uIHNlcnZpY2Ugd29ya2VyIHN0YXJ0KVxyXG5sZXQgc2Vzc2lvbkVuY3J5cHRpb25LZXkgPSBudWxsO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemUgc2Vzc2lvbiBlbmNyeXB0aW9uIGtleSB1c2luZyBXZWIgQ3J5cHRvIEFQSVxyXG4gKiBLZXkgaXMgcmVnZW5lcmF0ZWQgZWFjaCB0aW1lIHNlcnZpY2Ugd29ya2VyIHN0YXJ0cyAobWVtb3J5IG9ubHksIG5ldmVyIHBlcnNpc3RlZClcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGluaXRTZXNzaW9uRW5jcnlwdGlvbigpIHtcclxuICBpZiAoIXNlc3Npb25FbmNyeXB0aW9uS2V5KSB7XHJcbiAgICAvLyBHZW5lcmF0ZSBhIHJhbmRvbSAyNTYtYml0IGtleSBmb3IgQUVTLUdDTSBlbmNyeXB0aW9uXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXHJcbiAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxyXG4gICAgICBmYWxzZSwgLy8gTm90IGV4dHJhY3RhYmxlXHJcbiAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRW5jcnlwdHMgcGFzc3dvcmQgZm9yIHNlc3Npb24gc3RvcmFnZSB1c2luZyBBRVMtR0NNXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFBhc3N3b3JkIHRvIGVuY3J5cHRcclxuICogQHJldHVybnMge1Byb21pc2U8e2VuY3J5cHRlZDogQXJyYXlCdWZmZXIsIGl2OiBVaW50OEFycmF5fT59XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBlbmNyeXB0UGFzc3dvcmRGb3JTZXNzaW9uKHBhc3N3b3JkKSB7XHJcbiAgYXdhaXQgaW5pdFNlc3Npb25FbmNyeXB0aW9uKCk7XHJcbiAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xyXG4gIGNvbnN0IHBhc3N3b3JkRGF0YSA9IGVuY29kZXIuZW5jb2RlKHBhc3N3b3JkKTtcclxuICBcclxuICAvLyBHZW5lcmF0ZSByYW5kb20gSVYgZm9yIHRoaXMgZW5jcnlwdGlvblxyXG4gIC8vIFNFQ1VSSVRZOiBJViB1bmlxdWVuZXNzIGlzIGNyeXB0b2dyYXBoaWNhbGx5IGd1YXJhbnRlZWQgYnkgY3J5cHRvLmdldFJhbmRvbVZhbHVlcygpXHJcbiAgLy8gd2hpY2ggdXNlcyB0aGUgYnJvd3NlcidzIENTUFJORyAoQ3J5cHRvZ3JhcGhpY2FsbHkgU2VjdXJlIFBzZXVkby1SYW5kb20gTnVtYmVyIEdlbmVyYXRvcilcclxuICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMTIpKTtcclxuICBcclxuICBjb25zdCBlbmNyeXB0ZWQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXHJcbiAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcclxuICAgIHNlc3Npb25FbmNyeXB0aW9uS2V5LFxyXG4gICAgcGFzc3dvcmREYXRhXHJcbiAgKTtcclxuICBcclxuICByZXR1cm4geyBlbmNyeXB0ZWQsIGl2IH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWNyeXB0cyBwYXNzd29yZCBmcm9tIHNlc3Npb24gc3RvcmFnZVxyXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBlbmNyeXB0ZWQgLSBFbmNyeXB0ZWQgcGFzc3dvcmQgZGF0YVxyXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGl2IC0gSW5pdGlhbGl6YXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0UGFzc3dvcmRGcm9tU2Vzc2lvbihlbmNyeXB0ZWQsIGl2KSB7XHJcbiAgYXdhaXQgaW5pdFNlc3Npb25FbmNyeXB0aW9uKCk7XHJcbiAgXHJcbiAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxyXG4gICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXHJcbiAgICBzZXNzaW9uRW5jcnlwdGlvbktleSxcclxuICAgIGVuY3J5cHRlZFxyXG4gICk7XHJcbiAgXHJcbiAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xyXG4gIHJldHVybiBkZWNvZGVyLmRlY29kZShkZWNyeXB0ZWQpO1xyXG59XHJcblxyXG4vLyBHZW5lcmF0ZSBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgc2Vzc2lvbiB0b2tlblxyXG5mdW5jdGlvbiBnZW5lcmF0ZVNlc3Npb25Ub2tlbigpIHtcclxuICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KDMyKTtcclxuICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcclxuICByZXR1cm4gQXJyYXkuZnJvbShhcnJheSwgYnl0ZSA9PiBieXRlLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcclxufVxyXG5cclxuLy8gQ3JlYXRlIG5ldyBzZXNzaW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNlc3Npb24ocGFzc3dvcmQsIHdhbGxldElkLCBkdXJhdGlvbk1zID0gMzYwMDAwMCkgeyAvLyBEZWZhdWx0IDEgaG91clxyXG4gIGNvbnN0IHNlc3Npb25Ub2tlbiA9IGdlbmVyYXRlU2Vzc2lvblRva2VuKCk7XHJcbiAgY29uc3QgZXhwaXJlc0F0ID0gRGF0ZS5ub3coKSArIGR1cmF0aW9uTXM7XHJcbiAgXHJcbiAgLy8gRW5jcnlwdCBwYXNzd29yZCBiZWZvcmUgc3RvcmluZyBpbiBtZW1vcnlcclxuICBjb25zdCB7IGVuY3J5cHRlZCwgaXYgfSA9IGF3YWl0IGVuY3J5cHRQYXNzd29yZEZvclNlc3Npb24ocGFzc3dvcmQpO1xyXG5cclxuICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvblRva2VuLCB7XHJcbiAgICBlbmNyeXB0ZWRQYXNzd29yZDogZW5jcnlwdGVkLFxyXG4gICAgaXY6IGl2LFxyXG4gICAgd2FsbGV0SWQsXHJcbiAgICBleHBpcmVzQXRcclxuICB9KTtcclxuXHJcbiAgLy8gQXV0by1jbGVhbnVwIGV4cGlyZWQgc2Vzc2lvblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgaWYgKGFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uVG9rZW4pKSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvblRva2VuKTtcclxuICAgICAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgICAgICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvblRva2VuKTtcclxuICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZXNzaW9uIGV4cGlyZWQgYW5kIHJlbW92ZWQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIGR1cmF0aW9uTXMpO1xyXG5cclxuICAvLyBTZXNzaW9uIGNyZWF0ZWRcclxuICByZXR1cm4gc2Vzc2lvblRva2VuO1xyXG59XHJcblxyXG4vLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCByZXR1cm4gZGVjcnlwdGVkIHBhc3N3b3JkXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoIXNlc3Npb25Ub2tlbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBzZXNzaW9uIHRva2VuIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25Ub2tlbik7XHJcblxyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG9yIGV4cGlyZWQgc2Vzc2lvbicpO1xyXG4gIH1cclxuXHJcbiAgaWYgKERhdGUubm93KCkgPj0gc2Vzc2lvbi5leHBpcmVzQXQpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZXNzaW9uIGV4cGlyZWQnKTtcclxuICB9XHJcblxyXG4gIC8vIERlY3J5cHQgcGFzc3dvcmQgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcclxuICByZXR1cm4gYXdhaXQgZGVjcnlwdFBhc3N3b3JkRnJvbVNlc3Npb24oc2Vzc2lvbi5lbmNyeXB0ZWRQYXNzd29yZCwgc2Vzc2lvbi5pdik7XHJcbn1cclxuXHJcbi8vIEludmFsaWRhdGUgc2Vzc2lvblxyXG5mdW5jdGlvbiBpbnZhbGlkYXRlU2Vzc2lvbihzZXNzaW9uVG9rZW4pIHtcclxuICBpZiAoYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25Ub2tlbikpIHtcclxuICAgIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uVG9rZW4pO1xyXG4gICAgLy8gU2Vzc2lvbiBpbnZhbGlkYXRlZFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gSW52YWxpZGF0ZSBhbGwgc2Vzc2lvbnNcclxuZnVuY3Rpb24gaW52YWxpZGF0ZUFsbFNlc3Npb25zKCkge1xyXG4gIGNvbnN0IGNvdW50ID0gYWN0aXZlU2Vzc2lvbnMuc2l6ZTtcclxuICBhY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xyXG4gIC8vIEFsbCBzZXNzaW9ucyBpbnZhbGlkYXRlZFxyXG4gIHJldHVybiBjb3VudDtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBleHRlbnNpb24gaW5zdGFsbGF0aW9uXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+rgCBIZWFydFdhbGxldCBpbnN0YWxsZWQnKTtcclxufSk7XHJcblxyXG4vLyBHZXQgY29ubmVjdGVkIHNpdGVzIGZyb20gc3RvcmFnZVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDb25uZWN0ZWRTaXRlcygpIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGxvYWQoQ09OTkVDVEVEX1NJVEVTX0tFWSk7XHJcbiAgcmV0dXJuIHNpdGVzIHx8IHt9O1xyXG59XHJcblxyXG4vLyBDaGVjayBpZiBhIHNpdGUgaXMgY29ubmVjdGVkXHJcbmFzeW5jIGZ1bmN0aW9uIGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgcmV0dXJuICEhc2l0ZXNbb3JpZ2luXTtcclxufVxyXG5cclxuLy8gQWRkIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gYWRkQ29ubmVjdGVkU2l0ZShvcmlnaW4sIGFjY291bnRzKSB7XHJcbiAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gIHNpdGVzW29yaWdpbl0gPSB7XHJcbiAgICBhY2NvdW50cyxcclxuICAgIGNvbm5lY3RlZEF0OiBEYXRlLm5vdygpXHJcbiAgfTtcclxuICBhd2FpdCBzYXZlKENPTk5FQ1RFRF9TSVRFU19LRVksIHNpdGVzKTtcclxufVxyXG5cclxuLy8gUmVtb3ZlIGEgY29ubmVjdGVkIHNpdGVcclxuYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQ29ubmVjdGVkU2l0ZShvcmlnaW4pIHtcclxuICBjb25zdCBzaXRlcyA9IGF3YWl0IGdldENvbm5lY3RlZFNpdGVzKCk7XHJcbiAgZGVsZXRlIHNpdGVzW29yaWdpbl07XHJcbiAgYXdhaXQgc2F2ZShDT05ORUNURURfU0lURVNfS0VZLCBzaXRlcyk7XHJcbn1cclxuXHJcbi8vIEdldCBjdXJyZW50IG5ldHdvcmsgY2hhaW4gSURcclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudENoYWluSWQoKSB7XHJcbiAgY29uc3QgbmV0d29yayA9IGF3YWl0IGxvYWQoJ2N1cnJlbnROZXR3b3JrJyk7XHJcbiAgcmV0dXJuIENIQUlOX0lEU1tuZXR3b3JrIHx8ICdwdWxzZWNoYWluVGVzdG5ldCddO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0IHJlcXVlc3RzIGZyb20gY29udGVudCBzY3JpcHRzXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVdhbGxldFJlcXVlc3QobWVzc2FnZSwgc2VuZGVyKSB7XHJcbiAgY29uc3QgeyBtZXRob2QsIHBhcmFtcyB9ID0gbWVzc2FnZTtcclxuXHJcbiAgLy8gU0VDVVJJVFk6IEdldCBvcmlnaW4gZnJvbSBDaHJvbWUgQVBJLCBub3QgbWVzc2FnZSBwYXlsb2FkIChwcmV2ZW50cyBzcG9vZmluZylcclxuICBjb25zdCB1cmwgPSBuZXcgVVJMKHNlbmRlci51cmwpO1xyXG4gIGNvbnN0IG9yaWdpbiA9IHVybC5vcmlnaW47XHJcblxyXG4gIC8vIEhhbmRsaW5nIHdhbGxldCByZXF1ZXN0XHJcblxyXG4gIHRyeSB7XHJcbiAgICBzd2l0Y2ggKG1ldGhvZCkge1xyXG4gICAgICBjYXNlICdldGhfcmVxdWVzdEFjY291bnRzJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlUmVxdWVzdEFjY291bnRzKG9yaWdpbiwgc2VuZGVyLnRhYik7XHJcblxyXG4gICAgICBjYXNlICdldGhfYWNjb3VudHMnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBY2NvdW50cyhvcmlnaW4pO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2NoYWluSWQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVDaGFpbklkKCk7XHJcblxyXG4gICAgICBjYXNlICduZXRfdmVyc2lvbic6XHJcbiAgICAgICAgY29uc3QgY2hhaW5JZCA9IGF3YWl0IGhhbmRsZUNoYWluSWQoKTtcclxuICAgICAgICByZXR1cm4geyByZXN1bHQ6IHBhcnNlSW50KGNoYWluSWQucmVzdWx0LCAxNikudG9TdHJpbmcoKSB9O1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVBZGRDaGFpbihwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnd2FsbGV0X3dhdGNoQXNzZXQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVXYXRjaEFzc2V0KHBhcmFtcywgb3JpZ2luLCBzZW5kZXIudGFiKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9ibG9ja051bWJlcic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUJsb2NrTnVtYmVyKCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0QmxvY2tCeU51bWJlcic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJsb2NrQnlOdW1iZXIocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCYWxhbmNlJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0QmFsYW5jZShwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldFRyYW5zYWN0aW9uQ291bnQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfY2FsbCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUNhbGwocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9lc3RpbWF0ZUdhcyc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUVzdGltYXRlR2FzKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2FzUHJpY2UnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHYXNQcmljZSgpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX3NlbmRUcmFuc2FjdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbik7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2VuZFJhd1RyYW5zYWN0aW9uJzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25SZWNlaXB0JzpcclxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlR2V0VHJhbnNhY3Rpb25SZWNlaXB0KHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0VHJhbnNhY3Rpb25CeUhhc2gnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRUcmFuc2FjdGlvbkJ5SGFzaChwYXJhbXMpO1xyXG5cclxuICAgICAgY2FzZSAnZXRoX2dldExvZ3MnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVHZXRMb2dzKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdldGhfZ2V0Q29kZSc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldENvZGUocGFyYW1zKTtcclxuXHJcbiAgICAgIGNhc2UgJ2V0aF9nZXRCbG9ja0J5SGFzaCc6XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZUdldEJsb2NrQnlIYXNoKHBhcmFtcyk7XHJcblxyXG4gICAgICBjYXNlICdwZXJzb25hbF9zaWduJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ24nOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVQZXJzb25hbFNpZ24ocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCk7XHJcblxyXG4gICAgICBjYXNlICdldGhfc2lnblR5cGVkRGF0YSc6XHJcbiAgICAgIGNhc2UgJ2V0aF9zaWduVHlwZWREYXRhX3YzJzpcclxuICAgICAgY2FzZSAnZXRoX3NpZ25UeXBlZERhdGFfdjQnOlxyXG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVTaWduVHlwZWREYXRhKHBhcmFtcywgb3JpZ2luLCBtZXRob2QpO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDEsIG1lc3NhZ2U6IGBNZXRob2QgJHttZXRob2R9IG5vdCBzdXBwb3J0ZWRgIH0gfTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBoYW5kbGluZyByZXF1ZXN0OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX3JlcXVlc3RBY2NvdW50cyAtIFJlcXVlc3QgcGVybWlzc2lvbiB0byBjb25uZWN0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3RBY2NvdW50cyhvcmlnaW4sIHRhYikge1xyXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgY29ubmVjdGVkXHJcbiAgaWYgKGF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBnZXRBY3RpdmVXYWxsZXQoKTtcclxuICAgIGlmICh3YWxsZXQgJiYgd2FsbGV0LmFkZHJlc3MpIHtcclxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBbd2FsbGV0LmFkZHJlc3NdIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBOZWVkIHVzZXIgYXBwcm92YWwgLSBjcmVhdGUgYSBwZW5kaW5nIHJlcXVlc3RcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgcmVxdWVzdElkID0gRGF0ZS5ub3coKS50b1N0cmluZygpO1xyXG4gICAgcGVuZGluZ0Nvbm5lY3Rpb25zLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRhYklkOiB0YWI/LmlkIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249Y29ubmVjdCZvcmlnaW49JHtlbmNvZGVVUklDb21wb25lbnQob3JpZ2luKX0mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICAgICAgcGVuZGluZ0Nvbm5lY3Rpb25zLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2FjY291bnRzIC0gR2V0IGNvbm5lY3RlZCBhY2NvdW50c1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBY2NvdW50cyhvcmlnaW4pIHtcclxuICAvLyBPbmx5IHJldHVybiBhY2NvdW50cyBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmIChhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIHJldHVybiB7IHJlc3VsdDogW3dhbGxldC5hZGRyZXNzXSB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgcmVzdWx0OiBbXSB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2NoYWluSWQgLSBHZXQgY3VycmVudCBjaGFpbiBJRFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDaGFpbklkKCkge1xyXG4gIGNvbnN0IGNoYWluSWQgPSBhd2FpdCBnZXRDdXJyZW50Q2hhaW5JZCgpO1xyXG4gIHJldHVybiB7IHJlc3VsdDogY2hhaW5JZCB9O1xyXG59XHJcblxyXG4vLyBIYW5kbGUgd2FsbGV0X3N3aXRjaEV0aGVyZXVtQ2hhaW4gLSBTd2l0Y2ggdG8gYSBkaWZmZXJlbnQgbmV0d29ya1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTd2l0Y2hDaGFpbihwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdIHx8ICFwYXJhbXNbMF0uY2hhaW5JZCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXMnIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHJlcXVlc3RlZENoYWluSWQgPSBwYXJhbXNbMF0uY2hhaW5JZDtcclxuICAvLyBTd2l0Y2hpbmcgY2hhaW5cclxuXHJcbiAgLy8gRmluZCBtYXRjaGluZyBuZXR3b3JrXHJcbiAgY29uc3QgbmV0d29ya01hcCA9IHtcclxuICAgICcweDNhZic6ICdwdWxzZWNoYWluVGVzdG5ldCcsXHJcbiAgICAnMHgzQUYnOiAncHVsc2VjaGFpblRlc3RuZXQnLFxyXG4gICAgJzB4MTcxJzogJ3B1bHNlY2hhaW4nLFxyXG4gICAgJzB4MSc6ICdldGhlcmV1bScsXHJcbiAgICAnMHhhYTM2YTcnOiAnc2Vwb2xpYScsXHJcbiAgICAnMHhBQTM2QTcnOiAnc2Vwb2xpYSdcclxuICB9O1xyXG5cclxuICBjb25zdCBuZXR3b3JrS2V5ID0gbmV0d29ya01hcFtyZXF1ZXN0ZWRDaGFpbklkXTtcclxuXHJcbiAgaWYgKCFuZXR3b3JrS2V5KSB7XHJcbiAgICAvLyBDaGFpbiBub3Qgc3VwcG9ydGVkIC0gcmV0dXJuIGVycm9yIGNvZGUgNDkwMiBzbyBkQXBwIGNhbiBjYWxsIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlcnJvcjoge1xyXG4gICAgICAgIGNvZGU6IDQ5MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ1VucmVjb2duaXplZCBjaGFpbiBJRC4gVHJ5IGFkZGluZyB0aGUgY2hhaW4gdXNpbmcgd2FsbGV0X2FkZEV0aGVyZXVtQ2hhaW4uJ1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIGN1cnJlbnQgbmV0d29ya1xyXG4gIGF3YWl0IHNhdmUoJ2N1cnJlbnROZXR3b3JrJywgbmV0d29ya0tleSk7XHJcblxyXG4gIC8vIE5vdGlmeSBhbGwgdGFicyBhYm91dCBjaGFpbiBjaGFuZ2VcclxuICBjb25zdCBuZXdDaGFpbklkID0gQ0hBSU5fSURTW25ldHdvcmtLZXldO1xyXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCAodGFicykgPT4ge1xyXG4gICAgdGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xyXG4gICAgICAgIHR5cGU6ICdDSEFJTl9DSEFOR0VEJyxcclxuICAgICAgICBjaGFpbklkOiBuZXdDaGFpbklkXHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQsIGlnbm9yZSBlcnJvclxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4geyByZXN1bHQ6IG51bGwgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF9hZGRFdGhlcmV1bUNoYWluIC0gQWRkIGEgbmV3IG5ldHdvcmsgKHNpbXBsaWZpZWQgdmVyc2lvbilcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWRkQ2hhaW4ocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSB8fCAhcGFyYW1zWzBdLmNoYWluSWQpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ0ludmFsaWQgcGFyYW1zJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBjaGFpbkluZm8gPSBwYXJhbXNbMF07XHJcbiAgY29uc29sZS5sb2coJ/Cfq4AgUmVxdWVzdCB0byBhZGQgY2hhaW46JywgY2hhaW5JbmZvKTtcclxuXHJcbiAgLy8gRm9yIG5vdywgb25seSBzdXBwb3J0IG91ciBwcmVkZWZpbmVkIGNoYWluc1xyXG4gIC8vIENoZWNrIGlmIGl0J3Mgb25lIG9mIG91ciBzdXBwb3J0ZWQgY2hhaW5zXHJcbiAgY29uc3Qgc3VwcG9ydGVkQ2hhaW5zID0ge1xyXG4gICAgJzB4M2FmJzogdHJ1ZSxcclxuICAgICcweDNBRic6IHRydWUsXHJcbiAgICAnMHgxNzEnOiB0cnVlLFxyXG4gICAgJzB4MSc6IHRydWUsXHJcbiAgICAnMHhhYTM2YTcnOiB0cnVlLFxyXG4gICAgJzB4QUEzNkE3JzogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIGlmIChzdXBwb3J0ZWRDaGFpbnNbY2hhaW5JbmZvLmNoYWluSWRdKSB7XHJcbiAgICAvLyBDaGFpbiBpcyBhbHJlYWR5IHN1cHBvcnRlZCwganVzdCBzd2l0Y2ggdG8gaXRcclxuICAgIHJldHVybiBhd2FpdCBoYW5kbGVTd2l0Y2hDaGFpbihbeyBjaGFpbklkOiBjaGFpbkluZm8uY2hhaW5JZCB9XSk7XHJcbiAgfVxyXG5cclxuICAvLyBDdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0XHJcbiAgcmV0dXJuIHtcclxuICAgIGVycm9yOiB7XHJcbiAgICAgIGNvZGU6IC0zMjYwMyxcclxuICAgICAgbWVzc2FnZTogJ0FkZGluZyBjdXN0b20gY2hhaW5zIG5vdCBzdXBwb3J0ZWQgeWV0LiBPbmx5IFB1bHNlQ2hhaW4gYW5kIEV0aGVyZXVtIG5ldHdvcmtzIGFyZSBzdXBwb3J0ZWQuJ1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBjb25uZWN0aW9uIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29ubmVjdGlvbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQpIHtcclxuICBpZiAoIXBlbmRpbmdDb25uZWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4gfSA9IHBlbmRpbmdDb25uZWN0aW9ucy5nZXQocmVxdWVzdElkKTtcclxuICBwZW5kaW5nQ29ubmVjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmIChhcHByb3ZlZCkge1xyXG4gICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgZ2V0QWN0aXZlV2FsbGV0KCk7XHJcbiAgICBpZiAod2FsbGV0ICYmIHdhbGxldC5hZGRyZXNzKSB7XHJcbiAgICAgIC8vIFNhdmUgY29ubmVjdGVkIHNpdGVcclxuICAgICAgYXdhaXQgYWRkQ29ubmVjdGVkU2l0ZShvcmlnaW4sIFt3YWxsZXQuYWRkcmVzc10pO1xyXG5cclxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcGVuZGluZyBwcm9taXNlXHJcbiAgICAgIHJlc29sdmUoeyByZXN1bHQ6IFt3YWxsZXQuYWRkcmVzc10gfSk7XHJcblxyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZWplY3QobmV3IEVycm9yKCdObyBhY3RpdmUgd2FsbGV0JykpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBhY3RpdmUgd2FsbGV0JyB9O1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIGNvbm5lY3Rpb24nKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0IGNvbm5lY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRDb25uZWN0aW9uUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICBpZiAocGVuZGluZ0Nvbm5lY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiB9ID0gcGVuZGluZ0Nvbm5lY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgb3JpZ2luIH07XHJcbiAgfVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcXVlc3Qgbm90IGZvdW5kJyB9O1xyXG59XHJcblxyXG4vLyBHZXQgY3VycmVudCBuZXR3b3JrIGtleVxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50TmV0d29yaygpIHtcclxuICBjb25zdCBuZXR3b3JrID0gYXdhaXQgbG9hZCgnY3VycmVudE5ldHdvcmsnKTtcclxuICByZXR1cm4gbmV0d29yayB8fCAncHVsc2VjaGFpblRlc3RuZXQnO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2Jsb2NrTnVtYmVyIC0gR2V0IGN1cnJlbnQgYmxvY2sgbnVtYmVyXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJsb2NrTnVtYmVyKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gYXdhaXQgcnBjLmdldEJsb2NrTnVtYmVyKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9ja051bWJlciB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIG51bWJlcjonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRCbG9ja0J5TnVtYmVyIC0gR2V0IGJsb2NrIGJ5IG51bWJlclxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCbG9ja0J5TnVtYmVyKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgbnVtYmVyIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJsb2NrTnVtYmVyID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgaW5jbHVkZVRyYW5zYWN0aW9ucyA9IHBhcmFtc1sxXSB8fCBmYWxzZTtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBycGMuZ2V0QmxvY2tCeU51bWJlcihuZXR3b3JrLCBibG9ja051bWJlciwgaW5jbHVkZVRyYW5zYWN0aW9ucyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJsb2NrIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmxvY2sgYnkgbnVtYmVyOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldEJhbGFuY2UgLSBHZXQgYmFsYW5jZSBmb3IgYW4gYWRkcmVzc1xyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRCYWxhbmNlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBiYWxhbmNlID0gYXdhaXQgcnBjLmdldEJhbGFuY2UobmV0d29yaywgYWRkcmVzcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGJhbGFuY2UgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBiYWxhbmNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uQ291bnQgLSBHZXQgdHJhbnNhY3Rpb24gY291bnQgKG5vbmNlKVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUcmFuc2FjdGlvbkNvdW50KHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBjb3VudCA9IGF3YWl0IHJwYy5nZXRUcmFuc2FjdGlvbkNvdW50KG5ldHdvcmssIGFkZHJlc3MpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBjb3VudCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGNvdW50OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dhc1ByaWNlIC0gR2V0IGN1cnJlbnQgZ2FzIHByaWNlXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdhc1ByaWNlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IGdhc1ByaWNlID0gYXdhaXQgcnBjLmdldEdhc1ByaWNlKG5ldHdvcmspO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBnYXNQcmljZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGdhcyBwcmljZTonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9lc3RpbWF0ZUdhcyAtIEVzdGltYXRlIGdhcyBmb3IgYSB0cmFuc2FjdGlvblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVFc3RpbWF0ZUdhcyhwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29yaygpO1xyXG4gICAgY29uc3QgZ2FzID0gYXdhaXQgcnBjLmVzdGltYXRlR2FzKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGdhcyB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9jYWxsIC0gRXhlY3V0ZSBhIHJlYWQtb25seSBjYWxsXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbGwocGFyYW1zKSB7XHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtc1swXSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnTWlzc2luZyB0cmFuc2FjdGlvbiBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJwYy5jYWxsKG5ldHdvcmssIHBhcmFtc1swXSk7XHJcbiAgICByZXR1cm4geyByZXN1bHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZXhlY3V0aW5nIGNhbGw6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFJhd1RyYW5zYWN0aW9uIC0gU2VuZCBhIHByZS1zaWduZWQgdHJhbnNhY3Rpb25cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VuZFJhd1RyYW5zYWN0aW9uKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3Npbmcgc2lnbmVkIHRyYW5zYWN0aW9uIHBhcmFtZXRlcicgfSB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNpZ25lZFR4ID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBhd2FpdCBycGMuc2VuZFJhd1RyYW5zYWN0aW9uKG5ldHdvcmssIHNpZ25lZFR4KTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogdHhIYXNoIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgcmF3IHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBIYW5kbGUgZXRoX2dldFRyYW5zYWN0aW9uUmVjZWlwdCAtIEdldCB0cmFuc2FjdGlvbiByZWNlaXB0XHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uUmVjZWlwdChwYXJhbXMpIHtcclxuICBpZiAoIXBhcmFtcyB8fCAhcGFyYW1zWzBdKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDIsIG1lc3NhZ2U6ICdNaXNzaW5nIHRyYW5zYWN0aW9uIGhhc2ggcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgdHhIYXNoID0gcGFyYW1zWzBdO1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uUmVjZWlwdChuZXR3b3JrLCB0eEhhc2gpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiByZWNlaXB0IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gcmVjZWlwdDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGV0aF9nZXRUcmFuc2FjdGlvbkJ5SGFzaCAtIEdldCB0cmFuc2FjdGlvbiBieSBoYXNoXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFRyYW5zYWN0aW9uQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB0eEhhc2ggPSBwYXJhbXNbMF07XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHR4ID0gYXdhaXQgcnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoKG5ldHdvcmssIHR4SGFzaCk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IHR4IH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gYnkgaGFzaDonLCBlcnJvcik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiAtMzI2MDMsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfSB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0TG9ncyhwYXJhbXMpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGdldEN1cnJlbnROZXR3b3JrKCk7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGxvZ3MgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0TG9ncycsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4geyByZXN1bHQ6IGxvZ3MgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBsb2dzOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IH07XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRDb2RlKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYWRkcmVzcyBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgY29kZSA9IGF3YWl0IHByb3ZpZGVyLnNlbmQoJ2V0aF9nZXRDb2RlJywgcGFyYW1zKTtcclxuICAgIHJldHVybiB7IHJlc3VsdDogY29kZSB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGNvZGU6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEJsb2NrQnlIYXNoKHBhcmFtcykge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgYmxvY2sgaGFzaCBwYXJhbWV0ZXInIH0gfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBwcm92aWRlci5zZW5kKCdldGhfZ2V0QmxvY2tCeUhhc2gnLCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBibG9jayB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGJsb2NrIGJ5IGhhc2g6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAzLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIH0gfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFBlbmRpbmcgdHJhbnNhY3Rpb24gcmVxdWVzdHMgKHJlcXVlc3RJZCAtPiB7IHJlc29sdmUsIHJlamVjdCwgb3JpZ2luIH0pXHJcbmNvbnN0IHBlbmRpbmdUcmFuc2FjdGlvbnMgPSBuZXcgTWFwKCk7XHJcblxyXG4vLyBQZW5kaW5nIHRva2VuIGFkZCByZXF1ZXN0cyAocmVxdWVzdElkIC0+IHsgcmVzb2x2ZSwgcmVqZWN0LCBvcmlnaW4sIHRva2VuSW5mbyB9KVxyXG5jb25zdCBwZW5kaW5nVG9rZW5SZXF1ZXN0cyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vIFBlbmRpbmcgbWVzc2FnZSBzaWduaW5nIHJlcXVlc3RzIChyZXF1ZXN0SWQgLT4geyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgc2lnblJlcXVlc3QsIGFwcHJvdmFsVG9rZW4gfSlcclxuY29uc3QgcGVuZGluZ1NpZ25SZXF1ZXN0cyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vID09PT09IFJBVEUgTElNSVRJTkcgPT09PT1cclxuLy8gUHJldmVudHMgbWFsaWNpb3VzIGRBcHBzIGZyb20gc3BhbW1pbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVxdWVzdHNcclxuY29uc3QgcmF0ZUxpbWl0TWFwID0gbmV3IE1hcCgpOyAvLyBvcmlnaW4gLT4geyBjb3VudCwgd2luZG93U3RhcnQsIHBlbmRpbmdDb3VudCB9XHJcblxyXG5jb25zdCBSQVRFX0xJTUlUX0NPTkZJRyA9IHtcclxuICBNQVhfUEVORElOR19SRVFVRVNUUzogNSwgLy8gTWF4IHBlbmRpbmcgcmVxdWVzdHMgcGVyIG9yaWdpblxyXG4gIE1BWF9SRVFVRVNUU19QRVJfV0lORE9XOiAyMCwgLy8gTWF4IHRvdGFsIHJlcXVlc3RzIHBlciB0aW1lIHdpbmRvd1xyXG4gIFRJTUVfV0lORE9XX01TOiA2MDAwMCAvLyAxIG1pbnV0ZSB3aW5kb3dcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYW4gb3JpZ2luIGhhcyBleGNlZWRlZCByYXRlIGxpbWl0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luIC0gVGhlIG9yaWdpbiB0byBjaGVja1xyXG4gKiBAcmV0dXJucyB7eyBhbGxvd2VkOiBib29sZWFuLCByZWFzb24/OiBzdHJpbmcgfX1cclxuICovXHJcbmZ1bmN0aW9uIGNoZWNrUmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgXHJcbiAgLy8gR2V0IG9yIGNyZWF0ZSByYXRlIGxpbWl0IGVudHJ5IGZvciB0aGlzIG9yaWdpblxyXG4gIGlmICghcmF0ZUxpbWl0TWFwLmhhcyhvcmlnaW4pKSB7XHJcbiAgICByYXRlTGltaXRNYXAuc2V0KG9yaWdpbiwge1xyXG4gICAgICBjb3VudDogMCxcclxuICAgICAgd2luZG93U3RhcnQ6IG5vdyxcclxuICAgICAgcGVuZGluZ0NvdW50OiAwXHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIFxyXG4gIC8vIFJlc2V0IHdpbmRvdyBpZiBleHBpcmVkXHJcbiAgaWYgKG5vdyAtIGxpbWl0RGF0YS53aW5kb3dTdGFydCA+IFJBVEVfTElNSVRfQ09ORklHLlRJTUVfV0lORE9XX01TKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQgPSAwO1xyXG4gICAgbGltaXREYXRhLndpbmRvd1N0YXJ0ID0gbm93O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayBwZW5kaW5nIHJlcXVlc3RzIGxpbWl0XHJcbiAgaWYgKGxpbWl0RGF0YS5wZW5kaW5nQ291bnQgPj0gUkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFMpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFsbG93ZWQ6IGZhbHNlLFxyXG4gICAgICByZWFzb246IGBUb28gbWFueSBwZW5kaW5nIHJlcXVlc3RzLiBNYXhpbXVtICR7UkFURV9MSU1JVF9DT05GSUcuTUFYX1BFTkRJTkdfUkVRVUVTVFN9IHBlbmRpbmcgcmVxdWVzdHMgYWxsb3dlZC5gXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICAvLyBDaGVjayB0b3RhbCByZXF1ZXN0cyBpbiB3aW5kb3dcclxuICBpZiAobGltaXREYXRhLmNvdW50ID49IFJBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhbGxvd2VkOiBmYWxzZSxcclxuICAgICAgcmVhc29uOiBgUmF0ZSBsaW1pdCBleGNlZWRlZC4gTWF4aW11bSAke1JBVEVfTElNSVRfQ09ORklHLk1BWF9SRVFVRVNUU19QRVJfV0lORE9XfSByZXF1ZXN0cyBwZXIgbWludXRlLmBcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHJldHVybiB7IGFsbG93ZWQ6IHRydWUgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluY3JlbWVudHMgcmF0ZSBsaW1pdCBjb3VudGVycyBmb3IgYW4gb3JpZ2luXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW4gLSBUaGUgb3JpZ2luIHRvIGluY3JlbWVudFxyXG4gKi9cclxuZnVuY3Rpb24gaW5jcmVtZW50UmF0ZUxpbWl0KG9yaWdpbikge1xyXG4gIGNvbnN0IGxpbWl0RGF0YSA9IHJhdGVMaW1pdE1hcC5nZXQob3JpZ2luKTtcclxuICBpZiAobGltaXREYXRhKSB7XHJcbiAgICBsaW1pdERhdGEuY291bnQrKztcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQrKztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWNyZW1lbnRzIHBlbmRpbmcgY291bnRlciB3aGVuIHJlcXVlc3QgaXMgcmVzb2x2ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbiAtIFRoZSBvcmlnaW4gdG8gZGVjcmVtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKSB7XHJcbiAgY29uc3QgbGltaXREYXRhID0gcmF0ZUxpbWl0TWFwLmdldChvcmlnaW4pO1xyXG4gIGlmIChsaW1pdERhdGEgJiYgbGltaXREYXRhLnBlbmRpbmdDb3VudCA+IDApIHtcclxuICAgIGxpbWl0RGF0YS5wZW5kaW5nQ291bnQtLTtcclxuICB9XHJcbn1cclxuXHJcbi8vIENsZWFuIHVwIG9sZCByYXRlIGxpbWl0IGVudHJpZXMgZXZlcnkgNSBtaW51dGVzXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW29yaWdpbiwgZGF0YV0gb2YgcmF0ZUxpbWl0TWFwLmVudHJpZXMoKSkge1xyXG4gICAgaWYgKG5vdyAtIGRhdGEud2luZG93U3RhcnQgPiBSQVRFX0xJTUlUX0NPTkZJRy5USU1FX1dJTkRPV19NUyAqIDUgJiYgZGF0YS5wZW5kaW5nQ291bnQgPT09IDApIHtcclxuICAgICAgcmF0ZUxpbWl0TWFwLmRlbGV0ZShvcmlnaW4pO1xyXG4gICAgfVxyXG4gIH1cclxufSwgMzAwMDAwKTtcclxuXHJcbi8vID09PT09IFRSQU5TQUNUSU9OIFJFUExBWSBQUk9URUNUSU9OID09PT09XHJcbi8vIFByZXZlbnRzIHRoZSBzYW1lIHRyYW5zYWN0aW9uIGFwcHJvdmFsIGZyb20gYmVpbmcgdXNlZCBtdWx0aXBsZSB0aW1lc1xyXG5jb25zdCBwcm9jZXNzZWRBcHByb3ZhbHMgPSBuZXcgTWFwKCk7IC8vIGFwcHJvdmFsVG9rZW4gLT4geyB0aW1lc3RhbXAsIHR4SGFzaCwgdXNlZDogdHJ1ZSB9XHJcblxyXG5jb25zdCBSRVBMQVlfUFJPVEVDVElPTl9DT05GSUcgPSB7XHJcbiAgQVBQUk9WQUxfVElNRU9VVDogMzAwMDAwLCAvLyA1IG1pbnV0ZXMgLSBhcHByb3ZhbCBleHBpcmVzIGFmdGVyIHRoaXNcclxuICBDTEVBTlVQX0lOVEVSVkFMOiA2MDAwMCAgIC8vIDEgbWludXRlIC0gY2xlYW4gdXAgb2xkIGFwcHJvdmFsc1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlblxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBVbmlxdWUgYXBwcm92YWwgdG9rZW5cclxuICovXHJcbmZ1bmN0aW9uIGdlbmVyYXRlQXBwcm92YWxUb2tlbigpIHtcclxuICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KDMyKTtcclxuICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcclxuICByZXR1cm4gQXJyYXkuZnJvbShhcnJheSwgYnl0ZSA9PiBieXRlLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhbmQgbWFya3MgYW4gYXBwcm92YWwgdG9rZW4gYXMgdXNlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBwcm92YWxUb2tlbiAtIFRva2VuIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbGlkIGFuZCBub3QgeWV0IHVzZWRcclxuICovXHJcbmZ1bmN0aW9uIHZhbGlkYXRlQW5kVXNlQXBwcm92YWxUb2tlbihhcHByb3ZhbFRva2VuKSB7XHJcbiAgaWYgKCFhcHByb3ZhbFRva2VuKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgTm8gYXBwcm92YWwgdG9rZW4gcHJvdmlkZWQnKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgYXBwcm92YWwgPSBwcm9jZXNzZWRBcHByb3ZhbHMuZ2V0KGFwcHJvdmFsVG9rZW4pO1xyXG4gIFxyXG4gIGlmICghYXBwcm92YWwpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBVbmtub3duIGFwcHJvdmFsIHRva2VuJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIGlmIChhcHByb3ZhbC51c2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgQXBwcm92YWwgdG9rZW4gYWxyZWFkeSB1c2VkIC0gcHJldmVudGluZyByZXBsYXkgYXR0YWNrJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIENoZWNrIGlmIGFwcHJvdmFsIGhhcyBleHBpcmVkXHJcbiAgY29uc3QgYWdlID0gRGF0ZS5ub3coKSAtIGFwcHJvdmFsLnRpbWVzdGFtcDtcclxuICBpZiAoYWdlID4gUkVQTEFZX1BST1RFQ1RJT05fQ09ORklHLkFQUFJPVkFMX1RJTUVPVVQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBBcHByb3ZhbCB0b2tlbiBleHBpcmVkJyk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKGFwcHJvdmFsVG9rZW4pO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBcclxuICAvLyBNYXJrIGFzIHVzZWRcclxuICBhcHByb3ZhbC51c2VkID0gdHJ1ZTtcclxuICBhcHByb3ZhbC51c2VkQXQgPSBEYXRlLm5vdygpO1xyXG4gIGNvbnNvbGUubG9nKCfwn6uAIEFwcHJvdmFsIHRva2VuIHZhbGlkYXRlZCBhbmQgbWFya2VkIGFzIHVzZWQnKTtcclxuICBcclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLy8gQ2xlYW4gdXAgb2xkIHByb2Nlc3NlZCBhcHByb3ZhbHMgZXZlcnkgbWludXRlXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gIGZvciAoY29uc3QgW3Rva2VuLCBhcHByb3ZhbF0gb2YgcHJvY2Vzc2VkQXBwcm92YWxzLmVudHJpZXMoKSkge1xyXG4gICAgY29uc3QgYWdlID0gbm93IC0gYXBwcm92YWwudGltZXN0YW1wO1xyXG4gICAgaWYgKGFnZSA+IFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5BUFBST1ZBTF9USU1FT1VUICogMikge1xyXG4gICAgICBwcm9jZXNzZWRBcHByb3ZhbHMuZGVsZXRlKHRva2VuKTtcclxuICAgIH1cclxuICB9XHJcbn0sIFJFUExBWV9QUk9URUNUSU9OX0NPTkZJRy5DTEVBTlVQX0lOVEVSVkFMKTtcclxuXHJcbi8vIEhhbmRsZSBldGhfc2VuZFRyYW5zYWN0aW9uIC0gU2lnbiBhbmQgc2VuZCBhIHRyYW5zYWN0aW9uXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlbmRUcmFuc2FjdGlvbihwYXJhbXMsIG9yaWdpbikge1xyXG4gIGlmICghcGFyYW1zIHx8ICFwYXJhbXNbMF0pIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ01pc3NpbmcgdHJhbnNhY3Rpb24gcGFyYW1ldGVyJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiBzaXRlIGlzIGNvbm5lY3RlZFxyXG4gIGlmICghYXdhaXQgaXNTaXRlQ29ubmVjdGVkKG9yaWdpbikpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IDQxMDAsIG1lc3NhZ2U6ICdOb3QgYXV0aG9yaXplZC4gUGxlYXNlIGNvbm5lY3QgeW91ciB3YWxsZXQgZmlyc3QuJyB9IH07XHJcbiAgfVxyXG5cclxuICAvLyBTRUNVUklUWTogQ2hlY2sgcmF0ZSBsaW1pdCB0byBwcmV2ZW50IHNwYW1cclxuICBjb25zdCByYXRlTGltaXRDaGVjayA9IGNoZWNrUmF0ZUxpbWl0KG9yaWdpbik7XHJcbiAgaWYgKCFyYXRlTGltaXRDaGVjay5hbGxvd2VkKSB7XHJcbiAgICBjb25zb2xlLndhcm4oJ/Cfq4AgUmF0ZSBsaW1pdCBleGNlZWRlZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MjAwLCBtZXNzYWdlOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShyYXRlTGltaXRDaGVjay5yZWFzb24pIH0gfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHR4UmVxdWVzdCA9IHBhcmFtc1swXTtcclxuXHJcbiAgLy8gTG9hZCBzZXR0aW5ncyB0byBnZXQgbWF4IGdhcyBwcmljZVxyXG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgbG9hZCgnc2V0dGluZ3MnKTtcclxuICBjb25zdCBtYXhHYXNQcmljZUd3ZWkgPSBzZXR0aW5ncz8ubWF4R2FzUHJpY2VHd2VpIHx8IDEwMDA7XHJcblxyXG4gIC8vIFNFQ1VSSVRZOiBDb21wcmVoZW5zaXZlIHRyYW5zYWN0aW9uIHZhbGlkYXRpb25cclxuICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVUcmFuc2FjdGlvblJlcXVlc3QodHhSZXF1ZXN0LCBtYXhHYXNQcmljZUd3ZWkpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgdHJhbnNhY3Rpb24gZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9ycyk7XHJcbiAgICByZXR1cm4geyBcclxuICAgICAgZXJyb3I6IHsgXHJcbiAgICAgICAgY29kZTogLTMyNjAyLCBcclxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCB0cmFuc2FjdGlvbjogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3JzLmpvaW4oJzsgJykpIFxyXG4gICAgICB9IFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIFVzZSBzYW5pdGl6ZWQgdHJhbnNhY3Rpb24gcGFyYW1ldGVyc1xyXG4gIGNvbnN0IHNhbml0aXplZFR4ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIEluY3JlbWVudCByYXRlIGxpbWl0IGNvdW50ZXJcclxuICBpbmNyZW1lbnRSYXRlTGltaXQob3JpZ2luKTtcclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IERhdGUubm93KCkudG9TdHJpbmcoKTtcclxuICAgIFxyXG4gICAgLy8gU0VDVVJJVFk6IEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIFN0b3JlIHNhbml0aXplZCB0cmFuc2FjdGlvbiBpbnN0ZWFkIG9mIG9yaWdpbmFsIHJlcXVlc3RcclxuICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuc2V0KHJlcXVlc3RJZCwgeyBcclxuICAgICAgcmVzb2x2ZSwgXHJcbiAgICAgIHJlamVjdCwgXHJcbiAgICAgIG9yaWdpbiwgXHJcbiAgICAgIHR4UmVxdWVzdDogc2FuaXRpemVkVHgsXHJcbiAgICAgIGFwcHJvdmFsVG9rZW4gIC8vIEluY2x1ZGUgdG9rZW4gZm9yIHZhbGlkYXRpb25cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249dHJhbnNhY3Rpb24mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1RyYW5zYWN0aW9ucy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVHJhbnNhY3Rpb24gcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgdHJhbnNhY3Rpb24gYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUcmFuc2FjdGlvbkFwcHJvdmFsKHJlcXVlc3RJZCwgYXBwcm92ZWQsIHNlc3Npb25Ub2tlbiwgZ2FzUHJpY2UsIGN1c3RvbU5vbmNlKSB7XHJcbiAgaWYgKCFwZW5kaW5nVHJhbnNhY3Rpb25zLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdHhSZXF1ZXN0LCBhcHByb3ZhbFRva2VuIH0gPSBwZW5kaW5nVHJhbnNhY3Rpb25zLmdldChyZXF1ZXN0SWQpO1xyXG4gIFxyXG4gIC8vIFNFQ1VSSVRZOiBWYWxpZGF0ZSBvbmUtdGltZSBhcHByb3ZhbCB0b2tlbiB0byBwcmV2ZW50IHJlcGxheSBhdHRhY2tzXHJcbiAgaWYgKCF2YWxpZGF0ZUFuZFVzZUFwcHJvdmFsVG9rZW4oYXBwcm92YWxUb2tlbikpIHtcclxuICAgIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICBkZWNyZW1lbnRQZW5kaW5nQ291bnQob3JpZ2luKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgb3IgYWxyZWFkeSB1c2VkIGFwcHJvdmFsIHRva2VuIC0gcG9zc2libGUgcmVwbGF5IGF0dGFjaycpKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgYXBwcm92YWwgdG9rZW4nIH07XHJcbiAgfVxyXG4gIFxyXG4gIHBlbmRpbmdUcmFuc2FjdGlvbnMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIC8vIERlY3JlbWVudCBwZW5kaW5nIGNvdW50ZXIgKHJlcXVlc3QgY29tcGxldGVkKVxyXG4gIGRlY3JlbWVudFBlbmRpbmdDb3VudChvcmlnaW4pO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRyYW5zYWN0aW9uJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBWYWxpZGF0ZSBzZXNzaW9uIGFuZCBnZXQgcGFzc3dvcmQgKG5vdyBhc3luYylcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gVW5sb2NrIHdhbGxldCB3aXRoIGF1dG8tdXBncmFkZSBub3RpZmljYXRpb25cclxuICAgIGNvbnN0IHsgc2lnbmVyLCB1cGdyYWRlZCwgaXRlcmF0aW9uc0JlZm9yZSwgaXRlcmF0aW9uc0FmdGVyIH0gPSBhd2FpdCB1bmxvY2tXYWxsZXQocGFzc3dvcmQsIHtcclxuICAgICAgb25VcGdyYWRlU3RhcnQ6IChpbmZvKSA9PiB7XHJcbiAgICAgICAgLy8gTm90aWZ5IHVzZXIgdGhhdCB3YWxsZXQgZW5jcnlwdGlvbiBpcyBiZWluZyB1cGdyYWRlZFxyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldCBlbmNyeXB0aW9uOiAke2luZm8uY3VycmVudEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0g4oaSICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9uc2ApO1xyXG4gICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgICB0aXRsZTogJ/CflJAgU2VjdXJpdHkgVXBncmFkZSBpbiBQcm9ncmVzcycsXHJcbiAgICAgICAgICBtZXNzYWdlOiBgVXBncmFkaW5nIHdhbGxldCBlbmNyeXB0aW9uIHRvICR7aW5mby5yZWNvbW1lbmRlZEl0ZXJhdGlvbnMudG9Mb2NhbGVTdHJpbmcoKX0gaXRlcmF0aW9ucyBmb3IgZW5oYW5jZWQgc2VjdXJpdHkuLi5gLFxyXG4gICAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2hvdyBjb21wbGV0aW9uIG5vdGlmaWNhdGlvbiBpZiB1cGdyYWRlIG9jY3VycmVkXHJcbiAgICBpZiAodXBncmFkZWQpIHtcclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAn4pyFIFNlY3VyaXR5IFVwZ3JhZGUgQ29tcGxldGUnLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBXYWxsZXQgZW5jcnlwdGlvbiB1cGdyYWRlZDogJHtpdGVyYXRpb25zQmVmb3JlLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2l0ZXJhdGlvbnNBZnRlci50b0xvY2FsZVN0cmluZygpfSBpdGVyYXRpb25zYCxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgY3VycmVudCBuZXR3b3JrXHJcbiAgICBjb25zdCBuZXR3b3JrID0gYXdhaXQgZ2V0Q3VycmVudE5ldHdvcmsoKTtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG5cclxuICAgIC8vIENvbm5lY3Qgc2lnbmVyIHRvIHByb3ZpZGVyXHJcbiAgICBjb25zdCBjb25uZWN0ZWRTaWduZXIgPSBzaWduZXIuY29ubmVjdChwcm92aWRlcik7XHJcblxyXG4gICAgLy8gUHJlcGFyZSB0cmFuc2FjdGlvbiAtIGNyZWF0ZSBhIGNsZWFuIGNvcHkgd2l0aCBvbmx5IG5lY2Vzc2FyeSBmaWVsZHNcclxuICAgIGNvbnN0IHR4VG9TZW5kID0ge1xyXG4gICAgICB0bzogdHhSZXF1ZXN0LnRvLFxyXG4gICAgICB2YWx1ZTogdHhSZXF1ZXN0LnZhbHVlIHx8ICcweDAnLFxyXG4gICAgICBkYXRhOiB0eFJlcXVlc3QuZGF0YSB8fCAnMHgnXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE5vbmNlIGhhbmRsaW5nIHByaW9yaXR5OlxyXG4gICAgLy8gMS4gVXNlci1wcm92aWRlZCBjdXN0b20gbm9uY2UgKGZvciByZXBsYWNpbmcgc3R1Y2sgdHJhbnNhY3Rpb25zKVxyXG4gICAgLy8gMi4gREFwcC1wcm92aWRlZCBub25jZSAodmFsaWRhdGVkKVxyXG4gICAgLy8gMy4gQXV0by1mZXRjaCBieSBldGhlcnMuanNcclxuICAgIGlmIChjdXN0b21Ob25jZSAhPT0gdW5kZWZpbmVkICYmIGN1c3RvbU5vbmNlICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIFVzZXIgbWFudWFsbHkgc2V0IG5vbmNlIChlLmcuLCB0byByZXBsYWNlIHN0dWNrIHRyYW5zYWN0aW9uKVxyXG4gICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHNpZ25lci5hZGRyZXNzLCAncGVuZGluZycpO1xyXG5cclxuICAgICAgaWYgKGN1c3RvbU5vbmNlIDwgY3VycmVudE5vbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDdXN0b20gbm9uY2UgJHtjdXN0b21Ob25jZX0gaXMgbGVzcyB0aGFuIGN1cnJlbnQgbm9uY2UgJHtjdXJyZW50Tm9uY2V9LiBUaGlzIG1heSBmYWlsIHVubGVzcyB5b3UncmUgcmVwbGFjaW5nIGEgcGVuZGluZyB0cmFuc2FjdGlvbi5gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHhUb1NlbmQubm9uY2UgPSBjdXN0b21Ob25jZTtcclxuICAgICAgLy8gVXNpbmcgY3VzdG9tIG5vbmNlXHJcbiAgICB9IGVsc2UgaWYgKHR4UmVxdWVzdC5ub25jZSAhPT0gdW5kZWZpbmVkICYmIHR4UmVxdWVzdC5ub25jZSAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBTRUNVUklUWTogVmFsaWRhdGUgbm9uY2UgaWYgcHJvdmlkZWQgYnkgREFwcFxyXG4gICAgICBjb25zdCBjdXJyZW50Tm9uY2UgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvbkNvdW50KHNpZ25lci5hZGRyZXNzLCAncGVuZGluZycpO1xyXG4gICAgICBjb25zdCBwcm92aWRlZE5vbmNlID0gdHlwZW9mIHR4UmVxdWVzdC5ub25jZSA9PT0gJ3N0cmluZydcclxuICAgICAgICA/IHBhcnNlSW50KHR4UmVxdWVzdC5ub25jZSwgMTYpXHJcbiAgICAgICAgOiB0eFJlcXVlc3Qubm9uY2U7XHJcblxyXG4gICAgICAvLyBOb25jZSBtdXN0IGJlID49IGN1cnJlbnQgcGVuZGluZyBub25jZVxyXG4gICAgICBpZiAocHJvdmlkZWROb25jZSA8IGN1cnJlbnROb25jZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBub25jZTogJHtwcm92aWRlZE5vbmNlfSBpcyBsZXNzIHRoYW4gY3VycmVudCBub25jZSAke2N1cnJlbnROb25jZX1gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHhUb1NlbmQubm9uY2UgPSBwcm92aWRlZE5vbmNlO1xyXG4gICAgICAvLyBVc2luZyBEQXBwLXByb3ZpZGVkIG5vbmNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBJZiBubyBub25jZSBwcm92aWRlZCwgZXRoZXJzLmpzIHdpbGwgZmV0Y2ggdGhlIGNvcnJlY3Qgb25lIGF1dG9tYXRpY2FsbHlcclxuICAgICAgLy8gQXV0by1mZXRjaGluZyBub25jZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIERBcHAgcHJvdmlkZWQgYSBnYXMgbGltaXQsIHVzZSBpdC4gT3RoZXJ3aXNlIGxldCBldGhlcnMgZXN0aW1hdGUuXHJcbiAgICBpZiAodHhSZXF1ZXN0LmdhcyB8fCB0eFJlcXVlc3QuZ2FzTGltaXQpIHtcclxuICAgICAgdHhUb1NlbmQuZ2FzTGltaXQgPSB0eFJlcXVlc3QuZ2FzIHx8IHR4UmVxdWVzdC5nYXNMaW1pdDtcclxuICAgICAgLy8gVXNpbmcgcHJvdmlkZWQgZ2FzIGxpbWl0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXBwbHkgdXNlci1zZWxlY3RlZCBnYXMgcHJpY2UgaWYgcHJvdmlkZWQsIG9yIHVzZSBuZXR3b3JrIGdhcyBwcmljZSB3aXRoIG11bHRpcGxpZXJcclxuICAgIGlmIChnYXNQcmljZSkge1xyXG4gICAgICAvLyBVc2UgbGVnYWN5IGdhc1ByaWNlICh3b3JrcyBvbiBhbGwgbmV0d29ya3MgaW5jbHVkaW5nIFB1bHNlQ2hhaW4pXHJcbiAgICAgIHR4VG9TZW5kLmdhc1ByaWNlID0gZ2FzUHJpY2U7XHJcbiAgICAgIC8vIFVzaW5nIGN1c3RvbSBnYXMgcHJpY2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEZldGNoIGN1cnJlbnQgbmV0d29yayBnYXMgcHJpY2UgYW5kIGFwcGx5IDEuMnggbXVsdGlwbGllciBmb3IgZmFzdGVyIGNvbmZpcm1hdGlvblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IG5ldHdvcmtHYXNQcmljZSA9IGF3YWl0IHByb3ZpZGVyLmdldEZlZURhdGEoKTtcclxuICAgICAgICBpZiAobmV0d29ya0dhc1ByaWNlLmdhc1ByaWNlKSB7XHJcbiAgICAgICAgICBjb25zdCBtdWx0aXBsaWVkR2FzUHJpY2UgPSAobmV0d29ya0dhc1ByaWNlLmdhc1ByaWNlICogQmlnSW50KDEyMCkpIC8gQmlnSW50KDEwMCk7XHJcbiAgICAgICAgICB0eFRvU2VuZC5nYXNQcmljZSA9IG11bHRpcGxpZWRHYXNQcmljZTtcclxuICAgICAgICAgIC8vIFVzaW5nIG5ldHdvcmsgZ2FzIHByaWNlIHdpdGggbXVsdGlwbGllclxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAvLyBBdXRvLWNhbGN1bGF0aW5nIGdhcyBwcmljZVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2VuZCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgdHggPSBhd2FpdCBjb25uZWN0ZWRTaWduZXIuc2VuZFRyYW5zYWN0aW9uKHR4VG9TZW5kKTtcclxuXHJcbiAgICAvLyBUcmFuc2FjdGlvbiBzZW50XHJcblxyXG4gICAgLy8gU2F2ZSB0cmFuc2FjdGlvbiB0byBoaXN0b3J5IChuZXR3b3JrIHZhcmlhYmxlIGFscmVhZHkgZGVmaW5lZCBhYm92ZSlcclxuICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShzaWduZXIuYWRkcmVzcywge1xyXG4gICAgICBoYXNoOiB0eC5oYXNoLFxyXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgIGZyb206IHNpZ25lci5hZGRyZXNzLFxyXG4gICAgICB0bzogdHhSZXF1ZXN0LnRvIHx8IG51bGwsXHJcbiAgICAgIHZhbHVlOiB0eFJlcXVlc3QudmFsdWUgfHwgJzAnLFxyXG4gICAgICBkYXRhOiB0eC5kYXRhIHx8ICcweCcsXHJcbiAgICAgIGdhc1ByaWNlOiB0eC5nYXNQcmljZSA/IHR4Lmdhc1ByaWNlLnRvU3RyaW5nKCkgOiAnMCcsXHJcbiAgICAgIGdhc0xpbWl0OiB0eC5nYXNMaW1pdCA/IHR4Lmdhc0xpbWl0LnRvU3RyaW5nKCkgOiBudWxsLFxyXG4gICAgICBub25jZTogdHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogdHhIaXN0b3J5LlRYX1RZUEVTLkNPTlRSQUNUXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZW5kIGRlc2t0b3Agbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTZW50JyxcclxuICAgICAgbWVzc2FnZTogYFRyYW5zYWN0aW9uIHNlbnQ6ICR7dHguaGFzaC5zbGljZSgwLCAyMCl9Li4uYCxcclxuICAgICAgcHJpb3JpdHk6IDJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIGNvbmZpcm1hdGlvbiBpbiBiYWNrZ3JvdW5kXHJcbiAgICB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgc2lnbmVyLmFkZHJlc3MpO1xyXG5cclxuICAgIC8vIFJlc29sdmUgd2l0aCB0cmFuc2FjdGlvbiBoYXNoXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiB0eC5oYXNoIH0pO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHR4SGFzaDogdHguaGFzaCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIFRyYW5zYWN0aW9uIGVycm9yOicsIGVycm9yKTtcclxuICAgIGNvbnN0IHNhbml0aXplZEVycm9yID0gc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSk7XHJcbiAgICByZWplY3QobmV3IEVycm9yKHNhbml0aXplZEVycm9yKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHNhbml0aXplZEVycm9yIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgdHJhbnNhY3Rpb24gcmVxdWVzdCBkZXRhaWxzIGZvciBwb3B1cFxyXG5mdW5jdGlvbiBnZXRUcmFuc2FjdGlvblJlcXVlc3QocmVxdWVzdElkKSB7XHJcbiAgaWYgKHBlbmRpbmdUcmFuc2FjdGlvbnMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgIGNvbnN0IHsgb3JpZ2luLCB0eFJlcXVlc3QgfSA9IHBlbmRpbmdUcmFuc2FjdGlvbnMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBvcmlnaW4sIHR4UmVxdWVzdCB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gSGFuZGxlIHdhbGxldF93YXRjaEFzc2V0IC0gQWRkIGN1c3RvbSB0b2tlbiAoRUlQLTc0NylcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlV2F0Y2hBc3NldChwYXJhbXMsIG9yaWdpbiwgdGFiKSB7XHJcbiAgLy8gUmVjZWl2ZWQgd2FsbGV0X3dhdGNoQXNzZXQgcmVxdWVzdFxyXG5cclxuICAvLyBWYWxpZGF0ZSBwYXJhbXMgc3RydWN0dXJlXHJcbiAgaWYgKCFwYXJhbXMgfHwgIXBhcmFtcy50eXBlIHx8ICFwYXJhbXMub3B0aW9ucykge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnSW52YWxpZCBwYXJhbXM6IG11c3QgaW5jbHVkZSB0eXBlIGFuZCBvcHRpb25zJyB9IH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IHR5cGUsIG9wdGlvbnMgfSA9IHBhcmFtcztcclxuXHJcbiAgLy8gT25seSBzdXBwb3J0IEVSQzIwL1BSQzIwIHRva2Vuc1xyXG4gIGlmICh0eXBlLnRvVXBwZXJDYXNlKCkgIT09ICdFUkMyMCcpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiB7IGNvZGU6IC0zMjYwMiwgbWVzc2FnZTogJ09ubHkgRVJDMjAvUFJDMjAgdG9rZW5zIGFyZSBzdXBwb3J0ZWQnIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHJlcXVpcmVkIHRva2VuIGZpZWxkc1xyXG4gIGlmICghb3B0aW9ucy5hZGRyZXNzIHx8ICFvcHRpb25zLnN5bWJvbCkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogLTMyNjAyLCBtZXNzYWdlOiAnVG9rZW4gbXVzdCBoYXZlIGFkZHJlc3MgYW5kIHN5bWJvbCcgfSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdG9rZW5JbmZvID0ge1xyXG4gICAgYWRkcmVzczogb3B0aW9ucy5hZGRyZXNzLnRvTG93ZXJDYXNlKCksXHJcbiAgICBzeW1ib2w6IG9wdGlvbnMuc3ltYm9sLFxyXG4gICAgZGVjaW1hbHM6IG9wdGlvbnMuZGVjaW1hbHMgfHwgMTgsXHJcbiAgICBpbWFnZTogb3B0aW9ucy5pbWFnZSB8fCBudWxsXHJcbiAgfTtcclxuXHJcbiAgLy8gUmVxdWVzdGluZyB0byBhZGQgdG9rZW5cclxuXHJcbiAgLy8gTmVlZCB1c2VyIGFwcHJvdmFsIC0gY3JlYXRlIGEgcGVuZGluZyByZXF1ZXN0XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IERhdGUubm93KCkudG9TdHJpbmcoKSArICdfdG9rZW4nO1xyXG4gICAgcGVuZGluZ1Rva2VuUmVxdWVzdHMuc2V0KHJlcXVlc3RJZCwgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgdG9rZW5JbmZvIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249YWRkVG9rZW4mcmVxdWVzdElkPSR7cmVxdWVzdElkfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDUwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1Rva2VuUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICBwZW5kaW5nVG9rZW5SZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdUb2tlbiBhZGQgcmVxdWVzdCB0aW1lb3V0JykpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMDApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBIYW5kbGUgdG9rZW4gYWRkIGFwcHJvdmFsIGZyb20gcG9wdXBcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVG9rZW5BZGRBcHByb3ZhbChyZXF1ZXN0SWQsIGFwcHJvdmVkKSB7XHJcbiAgaWYgKCFwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVxdWVzdCBub3QgZm91bmQgb3IgZXhwaXJlZCcgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0LCB0b2tlbkluZm8gfSA9IHBlbmRpbmdUb2tlblJlcXVlc3RzLmdldChyZXF1ZXN0SWQpO1xyXG4gIHBlbmRpbmdUb2tlblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG5cclxuICBpZiAoIWFwcHJvdmVkKSB7XHJcbiAgICByZWplY3QobmV3IEVycm9yKCdVc2VyIHJlamVjdGVkIHRva2VuJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVXNlciByZWplY3RlZCcgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBUb2tlbiBhcHByb3ZlZCAtIHJldHVybiB0cnVlICh3YWxsZXRfd2F0Y2hBc3NldCByZXR1cm5zIGJvb2xlYW4pXHJcbiAgICByZXNvbHZlKHsgcmVzdWx0OiB0cnVlIH0pO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgdG9rZW5JbmZvIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgVG9rZW4gYWRkIGVycm9yOicsIGVycm9yKTtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHZXQgdG9rZW4gYWRkIHJlcXVlc3QgZGV0YWlscyBmb3IgcG9wdXBcclxuZnVuY3Rpb24gZ2V0VG9rZW5BZGRSZXF1ZXN0KHJlcXVlc3RJZCkge1xyXG4gIGlmIChwZW5kaW5nVG9rZW5SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4sIHRva2VuSW5mbyB9ID0gcGVuZGluZ1Rva2VuUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBvcmlnaW4sIHRva2VuSW5mbyB9O1xyXG4gIH1cclxuICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCcgfTtcclxufVxyXG5cclxuLy8gU3BlZWQgdXAgYSBwZW5kaW5nIHRyYW5zYWN0aW9uIGJ5IHJlcGxhY2luZyBpdCB3aXRoIGhpZ2hlciBnYXMgcHJpY2VcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCBzZXNzaW9uVG9rZW4sIGdhc1ByaWNlTXVsdGlwbGllciA9IDEuMiwgY3VzdG9tR2FzUHJpY2UgPSBudWxsKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2sgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB7IHNpZ25lciB9ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgbmV3IGdhcyBwcmljZVxyXG4gICAgbGV0IG5ld0dhc1ByaWNlO1xyXG4gICAgaWYgKGN1c3RvbUdhc1ByaWNlKSB7XHJcbiAgICAgIC8vIFVzZSBjdXN0b20gZ2FzIHByaWNlIHByb3ZpZGVkIGJ5IHVzZXJcclxuICAgICAgbmV3R2FzUHJpY2UgPSBCaWdJbnQoY3VzdG9tR2FzUHJpY2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gQ2FsY3VsYXRlIGZyb20gbXVsdGlwbGllciAoMS4yeCBvZiBvcmlnaW5hbCBieSBkZWZhdWx0KVxyXG4gICAgICBjb25zdCBvcmlnaW5hbEdhc1ByaWNlID0gQmlnSW50KG9yaWdpbmFsVHguZ2FzUHJpY2UpO1xyXG4gICAgICBuZXdHYXNQcmljZSA9IChvcmlnaW5hbEdhc1ByaWNlICogQmlnSW50KE1hdGguZmxvb3IoZ2FzUHJpY2VNdWx0aXBsaWVyICogMTAwKSkpIC8gQmlnSW50KDEwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHdpdGggc2FtZSBub25jZSwgZGF0YSwgYW5kIGdhc0xpbWl0XHJcbiAgICBjb25zdCByZXBsYWNlbWVudFR4ID0ge1xyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIGRhdGE6IG9yaWdpbmFsVHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBub25jZTogb3JpZ2luYWxUeC5ub25jZSxcclxuICAgICAgZ2FzUHJpY2U6IG5ld0dhc1ByaWNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEluY2x1ZGUgZ2FzTGltaXQgaWYgaXQgd2FzIGluIHRoZSBvcmlnaW5hbCB0cmFuc2FjdGlvblxyXG4gICAgaWYgKG9yaWdpbmFsVHguZ2FzTGltaXQpIHtcclxuICAgICAgcmVwbGFjZW1lbnRUeC5nYXNMaW1pdCA9IG9yaWdpbmFsVHguZ2FzTGltaXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3BlZWRpbmcgdXAgdHJhbnNhY3Rpb25cclxuXHJcbiAgICAvLyBTZW5kIHJlcGxhY2VtZW50IHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHdhbGxldC5zZW5kVHJhbnNhY3Rpb24ocmVwbGFjZW1lbnRUeCk7XHJcblxyXG4gICAgLy8gU2F2ZSBuZXcgdHJhbnNhY3Rpb24gdG8gaGlzdG9yeVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5KGFkZHJlc3MsIHtcclxuICAgICAgaGFzaDogdHguaGFzaCxcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICBmcm9tOiBhZGRyZXNzLFxyXG4gICAgICB0bzogb3JpZ2luYWxUeC50byxcclxuICAgICAgdmFsdWU6IG9yaWdpbmFsVHgudmFsdWUsXHJcbiAgICAgIGRhdGE6IG9yaWdpbmFsVHguZGF0YSB8fCAnMHgnLFxyXG4gICAgICBnYXNQcmljZTogbmV3R2FzUHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgZ2FzTGltaXQ6IG9yaWdpbmFsVHguZ2FzTGltaXQsXHJcbiAgICAgIG5vbmNlOiBvcmlnaW5hbFR4Lm5vbmNlLFxyXG4gICAgICBuZXR3b3JrOiBuZXR3b3JrLFxyXG4gICAgICBzdGF0dXM6IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORyxcclxuICAgICAgYmxvY2tOdW1iZXI6IG51bGwsXHJcbiAgICAgIHR5cGU6IG9yaWdpbmFsVHgudHlwZVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFyayBvcmlnaW5hbCB0cmFuc2FjdGlvbiBhcyByZXBsYWNlZC9mYWlsZWRcclxuICAgIGF3YWl0IHR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyhhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgdHhIaXN0b3J5LlRYX1NUQVRVUy5GQUlMRUQsIG51bGwpO1xyXG5cclxuICAgIC8vIFNlbmQgbm90aWZpY2F0aW9uXHJcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICBpY29uVXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ2Fzc2V0cy9pY29ucy9pY29uLTEyOC5wbmcnKSxcclxuICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBTcGVkIFVwJyxcclxuICAgICAgbWVzc2FnZTogYFJlcGxhY2VtZW50IHRyYW5zYWN0aW9uIHNlbnQgd2l0aCAke01hdGguZmxvb3IoZ2FzUHJpY2VNdWx0aXBsaWVyICogMTAwKX0lIGdhcyBwcmljZWAsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb25cclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2gsIG5ld0dhc1ByaWNlOiBuZXdHYXNQcmljZS50b1N0cmluZygpIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igc3BlZWRpbmcgdXAgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBzYW5pdGl6ZUVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gQ2FuY2VsIGEgcGVuZGluZyB0cmFuc2FjdGlvbiBieSByZXBsYWNpbmcgaXQgd2l0aCBhIHplcm8tdmFsdWUgdHggdG8gc2VsZlxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDYW5jZWxUcmFuc2FjdGlvbihhZGRyZXNzLCBvcmlnaW5hbFR4SGFzaCwgc2Vzc2lvblRva2VuKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gKG5vdyBhc3luYylcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gYXdhaXQgdmFsaWRhdGVTZXNzaW9uKHNlc3Npb25Ub2tlbik7XHJcblxyXG4gICAgLy8gR2V0IG9yaWdpbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcclxuICAgIGNvbnN0IG9yaWdpbmFsVHggPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhCeUhhc2goYWRkcmVzcywgb3JpZ2luYWxUeEhhc2gpO1xyXG4gICAgaWYgKCFvcmlnaW5hbFR4KSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3JpZ2luYWxUeC5zdGF0dXMgIT09IHR4SGlzdG9yeS5UWF9TVEFUVVMuUEVORElORykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUcmFuc2FjdGlvbiBpcyBub3QgcGVuZGluZycgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgd2FsbGV0IGFuZCB1bmxvY2sgKGF1dG8tdXBncmFkZSBpZiBuZWVkZWQpXHJcbiAgICBjb25zdCB7IHNpZ25lciB9ID0gYXdhaXQgdW5sb2NrV2FsbGV0KHBhc3N3b3JkLCB7XHJcbiAgICAgIG9uVXBncmFkZVN0YXJ0OiAoaW5mbykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SQIEF1dG8tdXBncmFkaW5nIHdhbGxldDogJHtpbmZvLmN1cnJlbnRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9IOKGkiAke2luZm8ucmVjb21tZW5kZWRJdGVyYXRpb25zLnRvTG9jYWxlU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdldCBuZXR3b3JrIGFuZCBjcmVhdGUgcHJvdmlkZXIgd2l0aCBhdXRvbWF0aWMgZmFpbG92ZXJcclxuICAgIGNvbnN0IG5ldHdvcmsgPSBvcmlnaW5hbFR4Lm5ldHdvcms7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IHdhbGxldCA9IHNpZ25lci5jb25uZWN0KHByb3ZpZGVyKTtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgbmV3IGdhcyBwcmljZSAoMS4yeCBvZiBvcmlnaW5hbCB0byBlbnN1cmUgaXQgZ2V0cyBtaW5lZCBmaXJzdClcclxuICAgIGNvbnN0IG9yaWdpbmFsR2FzUHJpY2UgPSBCaWdJbnQob3JpZ2luYWxUeC5nYXNQcmljZSk7XHJcbiAgICBjb25zdCBuZXdHYXNQcmljZSA9IChvcmlnaW5hbEdhc1ByaWNlICogQmlnSW50KDEyMCkpIC8gQmlnSW50KDEwMCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNhbmNlbGxhdGlvbiB0cmFuc2FjdGlvbiAoc2VuZCAwIHRvIHNlbGYgd2l0aCBzYW1lIG5vbmNlKVxyXG4gICAgY29uc3QgY2FuY2VsVHggPSB7XHJcbiAgICAgIHRvOiBhZGRyZXNzLCAgLy8gU2VuZCB0byBzZWxmXHJcbiAgICAgIHZhbHVlOiAnMCcsICAgLy8gWmVybyB2YWx1ZVxyXG4gICAgICBkYXRhOiAnMHgnLCAgIC8vIEVtcHR5IGRhdGFcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZSxcclxuICAgICAgZ2FzTGltaXQ6IDIxMDAwICAvLyBTdGFuZGFyZCBnYXMgbGltaXQgZm9yIHNpbXBsZSBFVEggdHJhbnNmZXJcclxuICAgIH07XHJcblxyXG4gICAgLy8gQ2FuY2VsbGluZyB0cmFuc2FjdGlvblxyXG5cclxuICAgIC8vIFNlbmQgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uXHJcbiAgICBjb25zdCB0eCA9IGF3YWl0IHdhbGxldC5zZW5kVHJhbnNhY3Rpb24oY2FuY2VsVHgpO1xyXG5cclxuICAgIC8vIFNhdmUgY2FuY2VsbGF0aW9uIHRyYW5zYWN0aW9uIHRvIGhpc3RvcnlcclxuICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShhZGRyZXNzLCB7XHJcbiAgICAgIGhhc2g6IHR4Lmhhc2gsXHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgZnJvbTogYWRkcmVzcyxcclxuICAgICAgdG86IGFkZHJlc3MsXHJcbiAgICAgIHZhbHVlOiAnMCcsXHJcbiAgICAgIGRhdGE6ICcweCcsXHJcbiAgICAgIGdhc1ByaWNlOiBuZXdHYXNQcmljZS50b1N0cmluZygpLFxyXG4gICAgICBnYXNMaW1pdDogJzIxMDAwJyxcclxuICAgICAgbm9uY2U6IG9yaWdpbmFsVHgubm9uY2UsXHJcbiAgICAgIG5ldHdvcms6IG5ldHdvcmssXHJcbiAgICAgIHN0YXR1czogdHhIaXN0b3J5LlRYX1NUQVRVUy5QRU5ESU5HLFxyXG4gICAgICBibG9ja051bWJlcjogbnVsbCxcclxuICAgICAgdHlwZTogJ3NlbmQnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYXJrIG9yaWdpbmFsIHRyYW5zYWN0aW9uIGFzIGZhaWxlZFxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKGFkZHJlc3MsIG9yaWdpbmFsVHhIYXNoLCB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRCwgbnVsbCk7XHJcblxyXG4gICAgLy8gU2VuZCBub3RpZmljYXRpb25cclxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICB0aXRsZTogJ1RyYW5zYWN0aW9uIENhbmNlbGxlZCcsXHJcbiAgICAgIG1lc3NhZ2U6ICdDYW5jZWxsYXRpb24gdHJhbnNhY3Rpb24gc2VudCcsXHJcbiAgICAgIHByaW9yaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXYWl0IGZvciBjb25maXJtYXRpb25cclxuICAgIHdhaXRGb3JDb25maXJtYXRpb24odHgsIHByb3ZpZGVyLCBhZGRyZXNzKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCB0eEhhc2g6IHR4Lmhhc2ggfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciBjYW5jZWxsaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBjdXJyZW50IG5ldHdvcmsgZ2FzIHByaWNlIChmb3Igc3BlZWQtdXAgVUkpXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnROZXR3b3JrR2FzUHJpY2UobmV0d29yaykge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgIGNvbnN0IGZlZURhdGEgPSBhd2FpdCBwcm92aWRlci5nZXRGZWVEYXRhKCk7XHJcblxyXG4gICAgaWYgKCFmZWVEYXRhLmdhc1ByaWNlKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0NvdWxkIG5vdCBmZXRjaCBnYXMgcHJpY2UnIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgZ2FzUHJpY2U6IGZlZURhdGEuZ2FzUHJpY2UudG9TdHJpbmcoKSxcclxuICAgICAgZ2FzUHJpY2VHd2VpOiAoTnVtYmVyKGZlZURhdGEuZ2FzUHJpY2UpIC8gMWU5KS50b0ZpeGVkKDIpXHJcbiAgICB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGZldGNoaW5nIGN1cnJlbnQgZ2FzIHByaWNlOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFJlZnJlc2ggdHJhbnNhY3Rpb24gc3RhdHVzIGZyb20gYmxvY2tjaGFpblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoVHJhbnNhY3Rpb25TdGF0dXMoYWRkcmVzcywgdHhIYXNoLCBuZXR3b3JrKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHByb3ZpZGVyID0gYXdhaXQgcnBjLmdldFByb3ZpZGVyKG5ldHdvcmspO1xyXG5cclxuICAgIC8vIEdldCB0cmFuc2FjdGlvbiByZWNlaXB0IGZyb20gYmxvY2tjaGFpblxyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLmdldFRyYW5zYWN0aW9uUmVjZWlwdCh0eEhhc2gpO1xyXG5cclxuICAgIGlmICghcmVjZWlwdCkge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBzdGlsbCBwZW5kaW5nIChub3QgbWluZWQgeWV0KVxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXHJcbiAgICAgICAgbWVzc2FnZTogJ1RyYW5zYWN0aW9uIGlzIHN0aWxsIHBlbmRpbmcgb24gdGhlIGJsb2NrY2hhaW4nXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVHJhbnNhY3Rpb24gaGFzIGJlZW4gbWluZWRcclxuICAgIGxldCBuZXdTdGF0dXM7XHJcbiAgICBpZiAocmVjZWlwdC5zdGF0dXMgPT09IDEpIHtcclxuICAgICAgbmV3U3RhdHVzID0gdHhIaXN0b3J5LlRYX1NUQVRVUy5DT05GSVJNRUQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuZXdTdGF0dXMgPSB0eEhpc3RvcnkuVFhfU1RBVFVTLkZBSUxFRDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgbG9jYWwgdHJhbnNhY3Rpb24gaGlzdG9yeVxyXG4gICAgYXdhaXQgdHhIaXN0b3J5LnVwZGF0ZVR4U3RhdHVzKFxyXG4gICAgICBhZGRyZXNzLFxyXG4gICAgICB0eEhhc2gsXHJcbiAgICAgIG5ld1N0YXR1cyxcclxuICAgICAgcmVjZWlwdC5ibG9ja051bWJlclxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICBzdGF0dXM6IG5ld1N0YXR1cyxcclxuICAgICAgYmxvY2tOdW1iZXI6IHJlY2VpcHQuYmxvY2tOdW1iZXIsXHJcbiAgICAgIG1lc3NhZ2U6IG5ld1N0YXR1cyA9PT0gdHhIaXN0b3J5LlRYX1NUQVRVUy5DT05GSVJNRURcclxuICAgICAgICA/ICdUcmFuc2FjdGlvbiBjb25maXJtZWQgb24gYmxvY2tjaGFpbidcclxuICAgICAgICA6ICdUcmFuc2FjdGlvbiBmYWlsZWQgb24gYmxvY2tjaGFpbidcclxuICAgIH07XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIHJlZnJlc2hpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFdhaXQgZm9yIHRyYW5zYWN0aW9uIGNvbmZpcm1hdGlvblxyXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yQ29uZmlybWF0aW9uKHR4LCBwcm92aWRlciwgYWRkcmVzcykge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBXYWl0aW5nIGZvciBjb25maXJtYXRpb25cclxuXHJcbiAgICAvLyBXYWl0IGZvciAxIGNvbmZpcm1hdGlvblxyXG4gICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHByb3ZpZGVyLndhaXRGb3JUcmFuc2FjdGlvbih0eC5oYXNoLCAxKTtcclxuXHJcbiAgICBpZiAocmVjZWlwdCAmJiByZWNlaXB0LnN0YXR1cyA9PT0gMSkge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBjb25maXJtZWRcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXMgaW4gaGlzdG9yeVxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICB0eC5oYXNoLFxyXG4gICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuQ09ORklSTUVELFxyXG4gICAgICAgIHJlY2VpcHQuYmxvY2tOdW1iZXJcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFNlbmQgc3VjY2VzcyBub3RpZmljYXRpb25cclxuICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHtcclxuICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgIGljb25Vcmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnYXNzZXRzL2ljb25zL2ljb24tMTI4LnBuZycpLFxyXG4gICAgICAgIHRpdGxlOiAnVHJhbnNhY3Rpb24gQ29uZmlybWVkJyxcclxuICAgICAgICBtZXNzYWdlOiBgVHJhbnNhY3Rpb24gY29uZmlybWVkIG9uLWNoYWluIWAsXHJcbiAgICAgICAgcHJpb3JpdHk6IDJcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmFuc2FjdGlvbiBmYWlsZWRcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0cmFuc2FjdGlvbiBzdGF0dXMgaW4gaGlzdG9yeVxyXG4gICAgICBhd2FpdCB0eEhpc3RvcnkudXBkYXRlVHhTdGF0dXMoXHJcbiAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICB0eC5oYXNoLFxyXG4gICAgICAgIHR4SGlzdG9yeS5UWF9TVEFUVVMuRkFJTEVELFxyXG4gICAgICAgIHJlY2VpcHQgPyByZWNlaXB0LmJsb2NrTnVtYmVyIDogbnVsbFxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gU2VuZCBmYWlsdXJlIG5vdGlmaWNhdGlvblxyXG4gICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgIHR5cGU6ICdiYXNpYycsXHJcbiAgICAgICAgaWNvblVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdhc3NldHMvaWNvbnMvaWNvbi0xMjgucG5nJyksXHJcbiAgICAgICAgdGl0bGU6ICdUcmFuc2FjdGlvbiBGYWlsZWQnLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdUcmFuc2FjdGlvbiB3YXMgcmV2ZXJ0ZWQgb3IgZmFpbGVkJyxcclxuICAgICAgICBwcmlvcml0eTogMlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign8J+rgCBFcnJvciB3YWl0aW5nIGZvciBjb25maXJtYXRpb246JywgZXJyb3IpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT0gTUVTU0FHRSBTSUdOSU5HIEhBTkRMRVJTID09PT09XHJcblxyXG4vLyBIYW5kbGUgcGVyc29uYWxfc2lnbiAoRUlQLTE5MSkgLSBTaWduIGEgbWVzc2FnZVxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVQZXJzb25hbFNpZ24ocGFyYW1zLCBvcmlnaW4sIG1ldGhvZCkge1xyXG4gIC8vIENoZWNrIGlmIHNpdGUgaXMgY29ubmVjdGVkXHJcbiAgaWYgKCFhd2FpdCBpc1NpdGVDb25uZWN0ZWQob3JpZ2luKSkge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogNDEwMCwgbWVzc2FnZTogJ05vdCBhdXRob3JpemVkLiBQbGVhc2UgY29ubmVjdCB5b3VyIHdhbGxldCBmaXJzdC4nIH0gfTtcclxuICB9XHJcblxyXG4gIC8vIFZhbGlkYXRlIHNpZ24gcmVxdWVzdFxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZVNpZ25SZXF1ZXN0KG1ldGhvZCwgcGFyYW1zKTtcclxuICBpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcclxuICAgIGNvbnNvbGUud2Fybign8J+rgCBJbnZhbGlkIHNpZ24gcmVxdWVzdCBmcm9tIG9yaWdpbjonLCBvcmlnaW4sIHZhbGlkYXRpb24uZXJyb3IpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiAtMzI2MDIsXHJcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgc2lnbiByZXF1ZXN0OiAnICsgc2FuaXRpemVFcnJvck1lc3NhZ2UodmFsaWRhdGlvbi5lcnJvcilcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHsgbWVzc2FnZSwgYWRkcmVzcyB9ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIFZlcmlmeSB0aGUgYWRkcmVzcyBtYXRjaGVzIHRoZSBjb25uZWN0ZWQgYWNjb3VudFxyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICghd2FsbGV0IHx8IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0ZWQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCBjb25uZWN0ZWQgYWNjb3VudCdcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCkgKyAnX3NpZ24nO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIG9uZS10aW1lIGFwcHJvdmFsIHRva2VuIGZvciByZXBsYXkgcHJvdGVjdGlvblxyXG4gICAgY29uc3QgYXBwcm92YWxUb2tlbiA9IGdlbmVyYXRlQXBwcm92YWxUb2tlbigpO1xyXG4gICAgcHJvY2Vzc2VkQXBwcm92YWxzLnNldChhcHByb3ZhbFRva2VuLCB7XHJcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgcmVxdWVzdElkLFxyXG4gICAgICB1c2VkOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgcGVuZGluZ1NpZ25SZXF1ZXN0cy5zZXQocmVxdWVzdElkLCB7XHJcbiAgICAgIHJlc29sdmUsXHJcbiAgICAgIHJlamVjdCxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgICBtZXRob2QsXHJcbiAgICAgIHNpZ25SZXF1ZXN0OiB7IG1lc3NhZ2UsIGFkZHJlc3MgfSxcclxuICAgICAgYXBwcm92YWxUb2tlblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3BlbiBhcHByb3ZhbCBwb3B1cFxyXG4gICAgY2hyb21lLndpbmRvd3MuY3JlYXRlKHtcclxuICAgICAgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoYHNyYy9wb3B1cC9wb3B1cC5odG1sP2FjdGlvbj1zaWduJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH0mbWV0aG9kPSR7bWV0aG9kfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignU2lnbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBldGhfc2lnblR5cGVkRGF0YSAoRUlQLTcxMikgLSBTaWduIHR5cGVkIGRhdGFcclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnblR5cGVkRGF0YShwYXJhbXMsIG9yaWdpbiwgbWV0aG9kKSB7XHJcbiAgLy8gQ2hlY2sgaWYgc2l0ZSBpcyBjb25uZWN0ZWRcclxuICBpZiAoIWF3YWl0IGlzU2l0ZUNvbm5lY3RlZChvcmlnaW4pKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogeyBjb2RlOiA0MTAwLCBtZXNzYWdlOiAnTm90IGF1dGhvcml6ZWQuIFBsZWFzZSBjb25uZWN0IHlvdXIgd2FsbGV0IGZpcnN0LicgfSB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmFsaWRhdGUgc2lnbiByZXF1ZXN0XHJcbiAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlU2lnblJlcXVlc3QobWV0aG9kLCBwYXJhbXMpO1xyXG4gIGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xyXG4gICAgY29uc29sZS53YXJuKCfwn6uAIEludmFsaWQgc2lnbiB0eXBlZCBkYXRhIHJlcXVlc3QgZnJvbSBvcmlnaW46Jywgb3JpZ2luLCB2YWxpZGF0aW9uLmVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgY29kZTogLTMyNjAyLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHNpZ24gcmVxdWVzdDogJyArIHNhbml0aXplRXJyb3JNZXNzYWdlKHZhbGlkYXRpb24uZXJyb3IpXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IGFkZHJlc3MsIHR5cGVkRGF0YSB9ID0gdmFsaWRhdGlvbi5zYW5pdGl6ZWQ7XHJcblxyXG4gIC8vIFZlcmlmeSB0aGUgYWRkcmVzcyBtYXRjaGVzIHRoZSBjb25uZWN0ZWQgYWNjb3VudFxyXG4gIGNvbnN0IHdhbGxldCA9IGF3YWl0IGdldEFjdGl2ZVdhbGxldCgpO1xyXG4gIGlmICghd2FsbGV0IHx8IHdhbGxldC5hZGRyZXNzLnRvTG93ZXJDYXNlKCkgIT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZXJyb3I6IHtcclxuICAgICAgICBjb2RlOiA0MTAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0ZWQgYWRkcmVzcyBkb2VzIG5vdCBtYXRjaCBjb25uZWN0ZWQgYWNjb3VudCdcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIE5lZWQgdXNlciBhcHByb3ZhbCAtIGNyZWF0ZSBhIHBlbmRpbmcgcmVxdWVzdFxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCkgKyAnX3NpZ25UeXBlZCc7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gZm9yIHJlcGxheSBwcm90ZWN0aW9uXHJcbiAgICBjb25zdCBhcHByb3ZhbFRva2VuID0gZ2VuZXJhdGVBcHByb3ZhbFRva2VuKCk7XHJcbiAgICBwcm9jZXNzZWRBcHByb3ZhbHMuc2V0KGFwcHJvdmFsVG9rZW4sIHtcclxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZWQ6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHtcclxuICAgICAgcmVzb2x2ZSxcclxuICAgICAgcmVqZWN0LFxyXG4gICAgICBvcmlnaW4sXHJcbiAgICAgIG1ldGhvZCxcclxuICAgICAgc2lnblJlcXVlc3Q6IHsgdHlwZWREYXRhLCBhZGRyZXNzIH0sXHJcbiAgICAgIGFwcHJvdmFsVG9rZW5cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9wZW4gYXBwcm92YWwgcG9wdXBcclxuICAgIGNocm9tZS53aW5kb3dzLmNyZWF0ZSh7XHJcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBzcmMvcG9wdXAvcG9wdXAuaHRtbD9hY3Rpb249c2lnblR5cGVkJnJlcXVlc3RJZD0ke3JlcXVlc3RJZH0mbWV0aG9kPSR7bWV0aG9kfWApLFxyXG4gICAgICB0eXBlOiAncG9wdXAnLFxyXG4gICAgICB3aWR0aDogNDAwLFxyXG4gICAgICBoZWlnaHQ6IDY1MFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGltZW91dCBhZnRlciA1IG1pbnV0ZXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAocGVuZGluZ1NpZ25SZXF1ZXN0cy5oYXMocmVxdWVzdElkKSkge1xyXG4gICAgICAgIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignU2lnbiByZXF1ZXN0IHRpbWVvdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBtZXNzYWdlIHNpZ25pbmcgYXBwcm92YWwgZnJvbSBwb3B1cFxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTaWduQXBwcm92YWwocmVxdWVzdElkLCBhcHByb3ZlZCwgc2Vzc2lvblRva2VuKSB7XHJcbiAgaWYgKCFwZW5kaW5nU2lnblJlcXVlc3RzLmhhcyhyZXF1ZXN0SWQpKSB7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdSZXF1ZXN0IG5vdCBmb3VuZCBvciBleHBpcmVkJyB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIG9yaWdpbiwgbWV0aG9kLCBzaWduUmVxdWVzdCwgYXBwcm92YWxUb2tlbiB9ID0gcGVuZGluZ1NpZ25SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgb25lLXRpbWUgYXBwcm92YWwgdG9rZW4gdG8gcHJldmVudCByZXBsYXkgYXR0YWNrc1xyXG4gIGlmICghdmFsaWRhdGVBbmRVc2VBcHByb3ZhbFRva2VuKGFwcHJvdmFsVG9rZW4pKSB7XHJcbiAgICBwZW5kaW5nU2lnblJlcXVlc3RzLmRlbGV0ZShyZXF1ZXN0SWQpO1xyXG4gICAgcmVqZWN0KG5ldyBFcnJvcignSW52YWxpZCBvciBhbHJlYWR5IHVzZWQgYXBwcm92YWwgdG9rZW4gLSBwb3NzaWJsZSByZXBsYXkgYXR0YWNrJykpO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBhcHByb3ZhbCB0b2tlbicgfTtcclxuICB9XHJcblxyXG4gIHBlbmRpbmdTaWduUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gIGlmICghYXBwcm92ZWQpIHtcclxuICAgIHJlamVjdChuZXcgRXJyb3IoJ1VzZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QnKSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVc2VyIHJlamVjdGVkJyB9O1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIFZhbGlkYXRlIHNlc3Npb24gYW5kIGdldCBwYXNzd29yZFxyXG4gICAgY29uc3QgcGFzc3dvcmQgPSBhd2FpdCB2YWxpZGF0ZVNlc3Npb24oc2Vzc2lvblRva2VuKTtcclxuXHJcbiAgICAvLyBVbmxvY2sgd2FsbGV0IChhdXRvLXVwZ3JhZGUgaWYgbmVlZGVkKVxyXG4gICAgY29uc3QgeyBzaWduZXIgfSA9IGF3YWl0IHVubG9ja1dhbGxldChwYXNzd29yZCwge1xyXG4gICAgICBvblVwZ3JhZGVTdGFydDogKGluZm8pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhg8J+UkCBBdXRvLXVwZ3JhZGluZyB3YWxsZXQ6ICR7aW5mby5jdXJyZW50SXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfSDihpIgJHtpbmZvLnJlY29tbWVuZGVkSXRlcmF0aW9ucy50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgc2lnbmF0dXJlO1xyXG5cclxuICAgIC8vIFNpZ24gYmFzZWQgb24gbWV0aG9kXHJcbiAgICBpZiAobWV0aG9kID09PSAncGVyc29uYWxfc2lnbicgfHwgbWV0aG9kID09PSAnZXRoX3NpZ24nKSB7XHJcbiAgICAgIHNpZ25hdHVyZSA9IGF3YWl0IHBlcnNvbmFsU2lnbihzaWduZXIsIHNpZ25SZXF1ZXN0Lm1lc3NhZ2UpO1xyXG4gICAgfSBlbHNlIGlmIChtZXRob2Quc3RhcnRzV2l0aCgnZXRoX3NpZ25UeXBlZERhdGEnKSkge1xyXG4gICAgICBzaWduYXR1cmUgPSBhd2FpdCBzaWduVHlwZWREYXRhKHNpZ25lciwgc2lnblJlcXVlc3QudHlwZWREYXRhKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgc2lnbmluZyBtZXRob2Q6ICR7bWV0aG9kfWApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ25hdHVyZSBnZW5lcmF0ZWQgc3VjY2Vzc2Z1bGx5XHJcbiAgICBjb25zb2xlLmxvZygn8J+rgCBNZXNzYWdlIHNpZ25lZCBmb3Igb3JpZ2luOicsIG9yaWdpbik7XHJcblxyXG4gICAgcmVzb2x2ZSh7IHJlc3VsdDogc2lnbmF0dXJlIH0pO1xyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgc2lnbmF0dXJlIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ/Cfq4AgRXJyb3Igc2lnbmluZyBtZXNzYWdlOicsIGVycm9yKTtcclxuICAgIHJlamVjdChlcnJvcik7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEdldCBzaWduIHJlcXVlc3QgZGV0YWlscyAoZm9yIHBvcHVwKVxyXG5mdW5jdGlvbiBnZXRTaWduUmVxdWVzdChyZXF1ZXN0SWQpIHtcclxuICByZXR1cm4gcGVuZGluZ1NpZ25SZXF1ZXN0cy5nZXQocmVxdWVzdElkKTtcclxufVxyXG5cclxuLy8gTGlzdGVuIGZvciBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0cyBhbmQgcG9wdXBcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIC8vIFJlY2VpdmVkIG1lc3NhZ2VcclxuXHJcbiAgKGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnV0FMTEVUX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaGFuZGxlV2FsbGV0UmVxdWVzdChtZXNzYWdlLCBzZW5kZXIpO1xyXG4gICAgICAgICAgLy8gU2VuZGluZyByZXNwb25zZVxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ09OTkVDVElPTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCBhcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZUNvbm5lY3Rpb25BcHByb3ZhbChtZXNzYWdlLnJlcXVlc3RJZCwgbWVzc2FnZS5hcHByb3ZlZCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGFwcHJvdmFsIHJlc3BvbnNlXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoYXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DT05ORUNUSU9OX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgcmVxdWVzdEluZm8gPSBnZXRDb25uZWN0aW9uUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICAvLyBTZW5kaW5nIGNvbm5lY3Rpb24gcmVxdWVzdCBpbmZvXHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UocmVxdWVzdEluZm8pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9DT05ORUNURURfU0lURVMnOlxyXG4gICAgICAgICAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBnZXRDb25uZWN0ZWRTaXRlcygpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyBjb25uZWN0ZWQgc2l0ZXMnKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNpdGVzIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0RJU0NPTk5FQ1RfU0lURSc6XHJcbiAgICAgICAgICBhd2FpdCByZW1vdmVDb25uZWN0ZWRTaXRlKG1lc3NhZ2Uub3JpZ2luKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgZGlzY29ubmVjdCBjb25maXJtYXRpb25cclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnVFJBTlNBQ1RJT05fQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgdHhBcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVRyYW5zYWN0aW9uQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQsIG1lc3NhZ2Uuc2Vzc2lvblRva2VuLCBtZXNzYWdlLmdhc1ByaWNlLCBtZXNzYWdlLmN1c3RvbU5vbmNlKTtcclxuICAgICAgICAgIC8vIFNlbmRpbmcgdHJhbnNhY3Rpb24gYXBwcm92YWwgcmVzcG9uc2VcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eEFwcHJvdmFsUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDUkVBVEVfU0VTU0lPTic6XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uVG9rZW4gPSBhd2FpdCBjcmVhdGVTZXNzaW9uKG1lc3NhZ2UucGFzc3dvcmQsIG1lc3NhZ2Uud2FsbGV0SWQsIG1lc3NhZ2UuZHVyYXRpb25Ncyk7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNlc3Npb25Ub2tlbiB9KTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX1NFU1NJT04nOlxyXG4gICAgICAgICAgY29uc3QgaW52YWxpZGF0ZWQgPSBpbnZhbGlkYXRlU2Vzc2lvbihtZXNzYWdlLnNlc3Npb25Ub2tlbik7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBpbnZhbGlkYXRlZCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJTlZBTElEQVRFX0FMTF9TRVNTSU9OUyc6XHJcbiAgICAgICAgICBjb25zdCBjb3VudCA9IGludmFsaWRhdGVBbGxTZXNzaW9ucygpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgY291bnQgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1RSQU5TQUNUSU9OX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgdHhSZXF1ZXN0SW5mbyA9IGdldFRyYW5zYWN0aW9uUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRyYW5zYWN0aW9uIHJlcXVlc3QgaW5mbzonLCB0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh0eFJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdUT0tFTl9BRERfQVBQUk9WQUwnOlxyXG4gICAgICAgICAgY29uc3QgdG9rZW5BcHByb3ZhbFJlc3VsdCA9IGF3YWl0IGhhbmRsZVRva2VuQWRkQXBwcm92YWwobWVzc2FnZS5yZXF1ZXN0SWQsIG1lc3NhZ2UuYXBwcm92ZWQpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ/Cfq4AgU2VuZGluZyB0b2tlbiBhZGQgYXBwcm92YWwgcmVzcG9uc2U6JywgdG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodG9rZW5BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnU0lHTl9BUFBST1ZBTCc6XHJcbiAgICAgICAgICBjb25zdCBzaWduQXBwcm92YWxSZXN1bHQgPSBhd2FpdCBoYW5kbGVTaWduQXBwcm92YWwoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UucmVxdWVzdElkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFwcHJvdmVkLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNlc3Npb25Ub2tlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn6uAIFNlbmRpbmcgc2lnbiBhcHByb3ZhbCByZXNwb25zZTonLCBzaWduQXBwcm92YWxSZXN1bHQpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHNpZ25BcHByb3ZhbFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1NJR05fUkVRVUVTVCc6XHJcbiAgICAgICAgICBjb25zdCBzaWduUmVxdWVzdEluZm8gPSBnZXRTaWduUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHNpZ24gcmVxdWVzdCBpbmZvOicsIHNpZ25SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoc2lnblJlcXVlc3RJbmZvKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVE9LRU5fQUREX1JFUVVFU1QnOlxyXG4gICAgICAgICAgY29uc3QgdG9rZW5SZXF1ZXN0SW5mbyA9IGdldFRva2VuQWRkUmVxdWVzdChtZXNzYWdlLnJlcXVlc3RJZCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBTZW5kaW5nIHRva2VuIGFkZCByZXF1ZXN0IGluZm86JywgdG9rZW5SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UodG9rZW5SZXF1ZXN0SW5mbyk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy8gVHJhbnNhY3Rpb24gSGlzdG9yeVxyXG4gICAgICAgIGNhc2UgJ0dFVF9UWF9ISVNUT1JZJzpcclxuICAgICAgICAgIGNvbnN0IHR4SGlzdG9yeUxpc3QgPSBhd2FpdCB0eEhpc3RvcnkuZ2V0VHhIaXN0b3J5KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCB0cmFuc2FjdGlvbnM6IHR4SGlzdG9yeUxpc3QgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnR0VUX1BFTkRJTkdfVFhfQ09VTlQnOlxyXG4gICAgICAgICAgY29uc3QgcGVuZGluZ0NvdW50ID0gYXdhaXQgdHhIaXN0b3J5LmdldFBlbmRpbmdUeENvdW50KG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBjb3VudDogcGVuZGluZ0NvdW50IH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ0dFVF9QRU5ESU5HX1RYUyc6XHJcbiAgICAgICAgICBjb25zdCBwZW5kaW5nVHhzID0gYXdhaXQgdHhIaXN0b3J5LmdldFBlbmRpbmdUeHMobWVzc2FnZS5hZGRyZXNzKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uczogcGVuZGluZ1R4cyB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfVFhfQllfSEFTSCc6XHJcbiAgICAgICAgICBjb25zdCB0eERldGFpbCA9IGF3YWl0IHR4SGlzdG9yeS5nZXRUeEJ5SGFzaChtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHhIYXNoKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHRyYW5zYWN0aW9uOiB0eERldGFpbCB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTQVZFX1RYJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHJhbnNhY3Rpb24pO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTQVZFX0FORF9NT05JVE9SX1RYJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5hZGRUeFRvSGlzdG9yeShtZXNzYWdlLmFkZHJlc3MsIG1lc3NhZ2UudHJhbnNhY3Rpb24pO1xyXG5cclxuICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgZm9yIGNvbmZpcm1hdGlvbiBpbiBiYWNrZ3JvdW5kXHJcbiAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBtZXNzYWdlLnRyYW5zYWN0aW9uLm5ldHdvcmsgfHwgJ3B1bHNlY2hhaW5UZXN0bmV0JztcclxuICAgICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IGF3YWl0IHJwYy5nZXRQcm92aWRlcihuZXR3b3JrKTtcclxuICAgICAgICAgICAgICBjb25zdCB0eCA9IHsgaGFzaDogbWVzc2FnZS50cmFuc2FjdGlvbi5oYXNoIH07XHJcbiAgICAgICAgICAgICAgYXdhaXQgd2FpdEZvckNvbmZpcm1hdGlvbih0eCwgcHJvdmlkZXIsIG1lc3NhZ2UuYWRkcmVzcyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbW9uaXRvcmluZyB0cmFuc2FjdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdDTEVBUl9UWF9ISVNUT1JZJzpcclxuICAgICAgICAgIGF3YWl0IHR4SGlzdG9yeS5jbGVhclR4SGlzdG9yeShtZXNzYWdlLmFkZHJlc3MpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdHRVRfQ1VSUkVOVF9HQVNfUFJJQ0UnOlxyXG4gICAgICAgICAgY29uc3QgZ2FzUHJpY2VSZXN1bHQgPSBhd2FpdCBnZXRDdXJyZW50TmV0d29ya0dhc1ByaWNlKG1lc3NhZ2UubmV0d29yayk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoZ2FzUHJpY2VSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ1JFRlJFU0hfVFhfU1RBVFVTJzpcclxuICAgICAgICAgIGNvbnN0IHJlZnJlc2hSZXN1bHQgPSBhd2FpdCByZWZyZXNoVHJhbnNhY3Rpb25TdGF0dXMoXHJcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkcmVzcyxcclxuICAgICAgICAgICAgbWVzc2FnZS50eEhhc2gsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UubmV0d29ya1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShyZWZyZXNoUmVzdWx0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdTUEVFRF9VUF9UWCc6XHJcbiAgICAgICAgICBjb25zdCBzcGVlZFVwUmVzdWx0ID0gYXdhaXQgaGFuZGxlU3BlZWRVcFRyYW5zYWN0aW9uKFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNlc3Npb25Ub2tlbixcclxuICAgICAgICAgICAgbWVzc2FnZS5nYXNQcmljZU11bHRpcGxpZXIgfHwgMS4yLFxyXG4gICAgICAgICAgICBtZXNzYWdlLmN1c3RvbUdhc1ByaWNlIHx8IG51bGxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoc3BlZWRVcFJlc3VsdCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnQ0FOQ0VMX1RYJzpcclxuICAgICAgICAgIGNvbnN0IGNhbmNlbFJlc3VsdCA9IGF3YWl0IGhhbmRsZUNhbmNlbFRyYW5zYWN0aW9uKFxyXG4gICAgICAgICAgICBtZXNzYWdlLmFkZHJlc3MsXHJcbiAgICAgICAgICAgIG1lc3NhZ2UudHhIYXNoLFxyXG4gICAgICAgICAgICBtZXNzYWdlLnNlc3Npb25Ub2tlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShjYW5jZWxSZXN1bHQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+rgCBVbmtub3duIG1lc3NhZ2UgdHlwZTonLCBtZXNzYWdlLnR5cGUpO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5rbm93biBtZXNzYWdlIHR5cGUnIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn6uAIEVycm9yIGhhbmRsaW5nIG1lc3NhZ2U6JywgZXJyb3IpO1xyXG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICB9XHJcbiAgfSkoKTtcclxuXHJcbiAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlXHJcbn0pO1xyXG5cclxuY29uc29sZS5sb2coJ/Cfq4AgSGVhcnRXYWxsZXQgc2VydmljZSB3b3JrZXIgcmVhZHknKTtcclxuIl0sIm5hbWVzIjpbImV0aGVycy5nZXRBZGRyZXNzIiwiZXRoZXJzLmdldEJ5dGVzIiwiZXRoZXJzLnRvVXRmOFN0cmluZyIsImV0aGVycy5pc0FkZHJlc3MiLCJycGMuZ2V0QmxvY2tOdW1iZXIiLCJycGMuZ2V0QmxvY2tCeU51bWJlciIsInJwYy5nZXRCYWxhbmNlIiwicnBjLmdldFRyYW5zYWN0aW9uQ291bnQiLCJycGMuZ2V0R2FzUHJpY2UiLCJycGMuZXN0aW1hdGVHYXMiLCJycGMuY2FsbCIsInJwYy5zZW5kUmF3VHJhbnNhY3Rpb24iLCJycGMuZ2V0VHJhbnNhY3Rpb25SZWNlaXB0IiwicnBjLmdldFRyYW5zYWN0aW9uQnlIYXNoIiwicnBjLmdldFByb3ZpZGVyIiwidHhIaXN0b3J5LmFkZFR4VG9IaXN0b3J5IiwidHhIaXN0b3J5LlRYX1NUQVRVUyIsInR4SGlzdG9yeS5UWF9UWVBFUyIsInR4SGlzdG9yeS5nZXRUeEJ5SGFzaCIsInR4SGlzdG9yeS51cGRhdGVUeFN0YXR1cyIsInR4SGlzdG9yeS5nZXRUeEhpc3RvcnkiLCJ0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4Q291bnQiLCJ0eEhpc3RvcnkuZ2V0UGVuZGluZ1R4cyIsInR4SGlzdG9yeS5jbGVhclR4SGlzdG9yeSJdLCJtYXBwaW5ncyI6IjtBQVFBLE1BQU0saUJBQWlCO0FBQ3ZCLE1BQU0sMEJBQTBCO0FBQ2hDLE1BQU0sc0JBQXNCO0FBR3JCLE1BQU0sV0FBVztBQUFBLEVBRXRCLFVBQVU7QUFFWjtBQUdPLE1BQU0sWUFBWTtBQUFBLEVBQ3ZCLFNBQVM7QUFBQSxFQUNULFdBQVc7QUFBQSxFQUNYLFFBQVE7QUFDVjtBQUtPLGVBQWUsdUJBQXVCO0FBQzNDLFFBQU0sV0FBVyxNQUFNLEtBQUssdUJBQXVCO0FBQ25ELFNBQU8sWUFBWTtBQUFBLElBQ2pCLFNBQVM7QUFBQTtBQUFBLElBQ1QsYUFBYTtBQUFBO0FBQUEsRUFDakI7QUFDQTtBQVlBLGVBQWUsZ0JBQWdCO0FBQzdCLFFBQU0sVUFBVSxNQUFNLEtBQUssY0FBYztBQUN6QyxTQUFPLFdBQVcsQ0FBQTtBQUNwQjtBQUtBLGVBQWUsZUFBZSxTQUFTO0FBQ3JDLFFBQU0sS0FBSyxnQkFBZ0IsT0FBTztBQUNwQztBQUtPLGVBQWUsYUFBYSxTQUFTO0FBQzFDLFFBQU0sV0FBVyxNQUFNO0FBQ3ZCLE1BQUksQ0FBQyxTQUFTLFNBQVM7QUFDckIsV0FBTztFQUNUO0FBRUEsUUFBTSxVQUFVLE1BQU07QUFDdEIsUUFBTSxlQUFlLFFBQVE7QUFFN0IsTUFBSSxDQUFDLFFBQVEsWUFBWSxHQUFHO0FBQzFCLFdBQU87RUFDVDtBQUVBLFNBQU8sUUFBUSxZQUFZLEVBQUUsZ0JBQWdCLENBQUE7QUFDL0M7QUFLTyxlQUFlLGVBQWUsU0FBUyxRQUFRO0FB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
