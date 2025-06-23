// background.js
console.log("Heart Wallet background script initialized");
console.log("Background script loaded at:", new Date().toISOString());

// Import ethers.js for wallet operations
try {
  importScripts('ethers.umd.min.js');
  console.log('Ethers.js loaded in background script');
} catch (error) {
  console.error('Failed to load ethers.js in background script:', error);
}

// Network Configurations
const networkConfigs = {
  // PulseChain Mainnet (Example - Verify details if needed)
  369: {
    networkName: "PulseChain",
    rpcUrl: "https://rpc.pulsechain.com",
    chainId: 369,
    currencySymbol: "PLS",
    blockExplorer: "https://otter.PulseChain.com"
  },
  // PulseChain Testnet V4
  943: {
    networkName: "PulseChain Testnet V4",
    rpcUrl: "https://rpc.v4.testnet.pulsechain.com",
    chainId: 943,
    currencySymbol: "tPLS",
    blockExplorer: "https://scan.v4.testnet.pulsechain.com"
  }
};

// Global provider instance
let provider = null;

// Default network if none is stored
const DEFAULT_CHAIN_ID = 943; // Default to Testnet V4 for now

// Session state management
let walletSessionActive = false;
let walletData = null; // Holds address, lastLogin etc.
let ephemeralDecryptedKey = null;
let currentChainId = DEFAULT_CHAIN_ID; // Track the active network
let sessionTimeout = null;
let sessionStartTime = null;
let sessionDuration = 5 * 60 * 1000; // 5 minutes default

// Initialize provider for current network
function initializeProvider() {
  try {
    const currentNetwork = networkConfigs[currentChainId];
    if (!currentNetwork || !currentNetwork.rpcUrl) {
      console.error("Cannot initialize provider: Invalid network configuration");
      return null;
    }
    
    // If we have ethers available in the background context
    if (typeof ethers !== 'undefined' && ethers.JsonRpcProvider) {
      console.log(`Initializing provider for ${currentNetwork.networkName} (${currentNetwork.rpcUrl})`);
      return new ethers.JsonRpcProvider(currentNetwork.rpcUrl);
    } else {
      // Fallback to a simple fetch-based provider implementation
      console.warn("Ethers library not available in background context. Using fallback provider.");
      return {
        async call(transaction, blockTag = "latest") {
          return await jsonRpcRequest(currentNetwork.rpcUrl, "eth_call", [transaction, blockTag]);
        },
        async estimateGas(transaction) {
          return await jsonRpcRequest(currentNetwork.rpcUrl, "eth_estimateGas", [transaction]);
        },
        async getBalance(address, blockTag = "latest") {
          return await jsonRpcRequest(currentNetwork.rpcUrl, "eth_getBalance", [address, blockTag]);
        },
        async getCode(address, blockTag = "latest") {
          return await jsonRpcRequest(currentNetwork.rpcUrl, "eth_getCode", [address, blockTag]);
        },
        async getBlockNumber() {
          return await jsonRpcRequest(currentNetwork.rpcUrl, "eth_blockNumber", []);
        },
        async send(method, params) {
          return await jsonRpcRequest(currentNetwork.rpcUrl, method, params);
        },
        removeAllListeners() {
          // No-op for our simple provider
        }
      };
    }
  } catch (error) {
    console.error("Error initializing provider:", error);
    return null;
  }
}

// Helper function for JSON-RPC requests (for our fallback provider)
async function jsonRpcRequest(url, method, params) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params
      })
    });

    try {
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`);
            }

            return data.result;
        } catch (error) {
            let errorMessage = error.message || 'Unknown error occurred';
            let errorCode = -32603; // Internal JSON-RPC error

            // Identify timeout errors
            if (error.name === 'AbortError' || errorMessage.includes('timeout') || 
                errorMessage.includes('timed out')) {
                errorMessage = `Request timed out: ${method}`;
                errorCode = -32000; // Server error
                console.error(`RPC timeout (${method}):`, errorMessage);
            } else if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
                errorMessage = `Network error: Unable to connect to ${url}`;
                errorCode = -32003; // Network error
                console.error(`Network error (${method}):`, errorMessage);
            } else {
                console.error(`Error in JSON-RPC request (${method}):`, error);
            }

            // Throw a structured error that can be better handled by callers
            const rpcError = new Error(errorMessage);
            rpcError.code = errorCode;
            rpcError.data = { originalError: error, method, params };
            throw rpcError;
        }
  } catch (error) {
    console.error(`Error in JSON-RPC request (${method}):`, error);
    throw error;
  }
}

// Make sure to initialize provider when needed
function ensureProvider() {
  if (!provider) {
    provider = initializeProvider();
  }
  return provider;
}

let sessionTimeoutId = null;
// Use a default timeout, can be updated via message
let sessionTimeoutDuration = 5 * 60 * 1000; // Default 5 minutes
const DEFAULT_SESSION_TIMEOUT = 5 * 60 * 1000; // Keep default reference

// Listen for extension installation or startup
chrome.runtime.onInstalled.addListener(() => {
  console.log("Heart Wallet extension installed/updated.");
  // Initialize storage on first install
  chrome.storage.local.get(['currentChainId', 'sessionData'], (result) => {
    if (!result.currentChainId) {
      chrome.storage.local.set({ currentChainId: DEFAULT_CHAIN_ID }, () => {
        console.log("Default chain ID set to:", DEFAULT_CHAIN_ID);
      });
    }
  });
  // Force login on install/update for security.
  clearSessionState(); // Clears sessionData as well
});

if (typeof chrome.runtime.onStartup !== 'undefined') {
  chrome.runtime.onStartup.addListener(() => {
    console.log("Browser startup detected.");
    // Force login on browser startup for security.
    clearSessionState();
  });
} else {
    // For non-persistent background scripts (MV3), initialize state on load
    console.log("Background script starting (MV3 Event Page context).");
    // Attempt to restore session state ONLY if the service worker is potentially restarting
    // We won't restore the ephemeral key itself, just the session metadata.
    restoreState();
}


// Helper to clear session state completely
function clearSessionState() {
    // Removed log mentioning key clearing
    walletSessionActive = false;
    walletData = null;
    ephemeralDecryptedKey = null;
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
    // Also clear any persisted session metadata from storage
    chrome.storage.local.remove('sessionData', () => {
        if (chrome.runtime.lastError) {
             console.error("Error removing session data on clear:", chrome.runtime.lastError.message);
        } else {
            console.log("Persisted session metadata removed from storage.");
        }
    });
}

// Helper to clear session after timeout
function startSessionTimeout() {
  clearTimeout(sessionTimeoutId); // Clear existing timer if any
  if (walletSessionActive) { // Only start timer if session is active
      console.log(`Starting session timeout for ${sessionTimeoutDuration / 60000} minutes.`);
      sessionTimeoutId = setTimeout(() => {
        console.log("Session timeout reached - logging out wallet internally.");
        logoutWalletInternal();
      }, sessionTimeoutDuration);
  } else {
      console.log("Session not active, timeout not started.");
  }
}

// Reset timeout on activity (e.g., message from popup)
function resetSessionTimeout() {
  if (walletSessionActive) {
    // console.log("Resetting session timeout."); // Can be noisy, enable if needed
    startSessionTimeout(); // Restart the timer with the current duration
  }
}

// Save session metadata AND current chainId
function saveState() {
  const stateToSave = {};
  if (walletSessionActive && walletData) {
    stateToSave.sessionData = {
      active: true,
      data: walletData,
    };
  } else {
    // Ensure sessionData is removed if not active
    chrome.storage.local.remove('sessionData');
  }
  // Always save the current chain ID
  stateToSave.currentChainId = currentChainId;

  chrome.storage.local.set(stateToSave, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving state:", chrome.runtime.lastError.message);
    }
  });
}

// Restore state (session metadata and current chainId)
function restoreState() {
  chrome.storage.local.get(['sessionData', 'currentChainId', 'securitySettings'], (result) => {
    if (chrome.runtime.lastError) {
        console.error("Error getting state on restore:", chrome.runtime.lastError.message);
        walletData = null;
        currentChainId = DEFAULT_CHAIN_ID;
        return;
    }

    // Restore Chain ID
    if (result.currentChainId && networkConfigs[result.currentChainId]) {
        currentChainId = result.currentChainId;
        console.log("Restored currentChainId:", currentChainId);
    } else {
        currentChainId = DEFAULT_CHAIN_ID;
        console.log("No stored chainId found or invalid, using default:", currentChainId);
        // Optionally save the default back to storage if it wasn't found
        if (!result.currentChainId) {
             chrome.storage.local.set({ currentChainId: DEFAULT_CHAIN_ID });
        }
    }

    // Initialize provider after restoring chainId
    provider = initializeProvider();
    
    // Restore security settings
    if (result.securitySettings && result.securitySettings.autoLogoutMinutes) {
      sessionTimeoutDuration = result.securitySettings.autoLogoutMinutes * 60 * 1000;
      console.log("Restored session timeout duration:", sessionTimeoutDuration / 60000, "minutes");
    }

    // Restore Session Metadata (Address etc.)
    if (result.sessionData && result.sessionData.active && result.sessionData.data) {
      console.log("Restoring session metadata (address, etc.) from storage.");
      walletData = result.sessionData.data;
      // DO NOT set walletSessionActive = true here.
    } else {
        console.log("No valid session metadata found in storage to restore.");
        walletData = null;
    }
  });
}

// Helper function for internal logout
function logoutWalletInternal() {
  // Removed log mentioning key clearing
  walletSessionActive = false;
  // Keep walletData (like address) or clear it? Let's keep it for now.
  // walletData = null;
  if (ephemeralDecryptedKey) {
      // Removed log about decrypted key
      // Attempt to securely clear - effectiveness varies in JS
      ephemeralDecryptedKey = ''.padStart(ephemeralDecryptedKey.length, '\0');
      ephemeralDecryptedKey = null;
  } else {
      // Removed log about ephemeral key
  }
  clearTimeout(sessionTimeoutId);
  sessionTimeoutId = null;
  saveState(); // Update storage to reflect logged-out state
}

// Helper function to notify content script (and thus inpage script) of chain change
function notifyChainChanged(newChainId) {
    const newChainIdHex = `0x${newChainId.toString(16)}`;
    console.log(`Background: Notifying content script of chainChanged to ${newChainIdHex}`);
    // Find connected tabs and send message (more robust than chrome.runtime.sendMessage)
    chrome.tabs.query({}, (tabs) => { // Query all tabs
        tabs.forEach(tab => {
            if (tab.id) { // Ensure tab has an ID
                chrome.tabs.sendMessage(tab.id, {
                    target: 'contentscript',
                    eventFor: 'heartwallet',
                    payload: {
                        eventName: 'chainChanged',
                        params: newChainIdHex
                    }
                }).catch(error => {
                    // Ignore errors like "Receiving end does not exist" for tabs without the content script
                    if (!error.message.includes("Receiving end does not exist")) {
                        console.warn(`Background: Error sending chainChanged to tab ${tab.id}:`, error.message);
                    }
                });
            }
        });
    });
}

// Connected Sites Management Functions
async function storeConnectedSite(origin, walletAddress) {
    console.log(`Background: Storing connected site - Origin: ${origin}, Wallet: ${walletAddress}`);
    
    try {
        const result = await chrome.storage.local.get('connectedSites');
        const connectedSites = result.connectedSites || {};
        
        // Create or update the site entry
        connectedSites[origin] = {
            origin: origin,
            walletAddress: walletAddress,
            connectedAt: Date.now(),
            lastAccessed: Date.now(),
            chainId: currentChainId,
            networkName: networkConfigs[currentChainId]?.networkName || 'Unknown'
        };
        
        await chrome.storage.local.set({ connectedSites });
        console.log(`Background: Connected site stored successfully: ${origin}`);
    } catch (error) {
        console.error('Error storing connected site:', error);
    }
}

function updateSiteLastAccessed(origin) {
    chrome.storage.local.get('connectedSites', (data) => {
        const connectedSites = data.connectedSites || {};
        
        if (connectedSites[origin]) {
            connectedSites[origin].lastAccessed = Date.now();
            chrome.storage.local.set({ connectedSites });
        }
    });
}

async function isSiteConnected(origin, walletAddress) {
    return new Promise((resolve) => {
        chrome.storage.local.get('connectedSites', (data) => {
            const connectedSites = data.connectedSites || {};
            const siteData = connectedSites[origin];
            resolve(siteData && siteData.walletAddress === walletAddress);
        });
    });
}

function getConnectedSites(callback) {
    console.log('Background: getConnectedSites called');
    chrome.storage.local.get('connectedSites', (data) => {
        const connectedSites = data.connectedSites || {};
        console.log('Background: connectedSites from storage:', connectedSites);
        // Return the full object, not just values
        callback(connectedSites);
    });
}

function disconnectSite(origin, callback) {
    chrome.storage.local.get('connectedSites', (data) => {
        const connectedSites = data.connectedSites || {};
        
        if (connectedSites[origin]) {
            delete connectedSites[origin];
            chrome.storage.local.set({ connectedSites }, () => {
                console.log(`Background: Disconnected site: ${origin}`);
                callback(true);
            });
        } else {
            callback(false);
        }
    });
}

function disconnectAllSites(callback) {
    chrome.storage.local.set({ connectedSites: {} }, () => {
        console.log('Background: All connected sites disconnected');
        callback(true);
    });
}

// Function to show token confirmation popup
function showTokenConfirmationPopup(tokenData) {
  return new Promise((resolve) => {
    // Create popup URL with token data
    const tokenDataEncoded = encodeURIComponent(JSON.stringify(tokenData));
    const popupURL = chrome.runtime.getURL('token-confirmation.html') + `?data=${tokenDataEncoded}`;
    
    chrome.windows.create({
      url: popupURL,
      type: 'popup',
      width: 400,
      height: 550,
      focused: true
    }, (window) => {
      console.log('Token confirmation popup opened:', window.id);
        // Listen for response from the popup
      const handleMessage = (message, sender, sendResponse) => {
        if (message.action === 'tokenConfirmation' && message.windowId === window.id) {
          chrome.runtime.onMessage.removeListener(handleMessage);
          sendResponse({ status: 'received' }); // Acknowledge receipt
          resolve(message.confirmed);
        }
      };
      
      chrome.runtime.onMessage.addListener(handleMessage);
      
      // Handle popup being closed without response
      chrome.windows.onRemoved.addListener(function windowClosedListener(windowId) {
        if (windowId === window.id) {
          chrome.runtime.onMessage.removeListener(handleMessage);
          chrome.windows.onRemoved.removeListener(windowClosedListener);
          resolve(false); // Default to rejection if popup is closed
        }
      });
      
      // Timeout after 2 minutes
      setTimeout(() => {
        try {
          chrome.windows.remove(window.id);
        } catch (e) {
          // Window might already be closed
        }
        chrome.runtime.onMessage.removeListener(handleMessage);
        resolve(false);
      }, 120000);
    });
  });
}

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // For async handlers, we need to wrap in an async function
  const handleMessage = async () => {
    // Determine the source of the message
    const isFromContentScript = message.target === 'background' && message.requestFor === 'heartwallet';
    const isFromPopup = message.action !== undefined; // Assuming popup uses 'action' property

    // Reset timeout on any relevant activity *if* the session is active
    if (walletSessionActive && (isFromPopup || isFromContentScript)) {
        resetSessionTimeout();
    }

    // --- Handle Messages from Content Script (dApp requests) ---
    if (isFromContentScript) {
      const { id, method, params } = message.payload;
    console.log(`Background: Received dApp request - Method: ${method}, ID: ${id}, Params:`, params);
    const currentNetwork = networkConfigs[currentChainId]; // Get current network config

    // Ensure we have a provider before handling RPC methods
    ensureProvider();
    
    // Declare origin once for the entire switch statement
    const origin = sender.origin || sender.url;
    
    switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
            console.log(`Background: Processing ${method}...`);
            
            if (walletSessionActive && walletData && walletData.address) {
                // Session is active - handle normally
                if (method === 'eth_requestAccounts') {
                    // For requestAccounts, always return address if session is active
                    // Removed log that exposed wallet address
                    // Update last accessed time if site is already connected
                    const isConnected = await isSiteConnected(origin, walletData.address);
                    if (isConnected) {
                        updateSiteLastAccessed(origin);
                    }
                    sendResponse({ id, result: [walletData.address] });
                } else {
                    // For eth_accounts, only return accounts if site is connected
                    const isConnected = await isSiteConnected(origin, walletData.address);
                    if (isConnected) {
                        // Removed log that exposed wallet address and connected site
                        updateSiteLastAccessed(origin);
                        sendResponse({ id, result: [walletData.address] });
                    } else {
                        console.log(`Background: Site ${origin} is not connected, returning empty array`);
                        sendResponse({ id, result: [] });
                    }
                }
            } else {
                // Session is inactive - check if site was previously connected
                console.log(`Background: Session inactive, checking if site ${origin} was previously connected...`);
                
                // Check if this site is in our connected sites list
                const connectedSites = await new Promise(resolve => {
                    chrome.storage.local.get('connectedSites', (data) => {
                        resolve(data.connectedSites || {});
                    });
                });
                
                const siteData = connectedSites[origin];
                  if (siteData && method === 'eth_requestAccounts') {
                    // Site was previously connected, just need to unlock wallet
                    console.log(`Background: Site ${origin} was previously connected, creating reconnection request...`);
                    createReconnectionRequest(id, sender.tab, sendResponse, siteData);
                    return true; // Keep the connection open for async response
                } else if (siteData && method === 'eth_accounts') {
                    // For eth_accounts, return empty array when session is inactive even for connected sites
                    console.log(`Background: Site ${origin} is connected but session inactive, returning empty array`);
                    sendResponse({ id, result: [] });
                } else if (!siteData && method === 'eth_requestAccounts') {
                    // Site not previously connected, create new connection request
                    console.log(`Background: Site ${origin} not previously connected, creating connection request...`);
                    createConnectionRequest(id, sender.tab, sendResponse);
                    return true; // Keep the connection open for async response
                } else {
                    // eth_accounts for unconnected site
                    console.log(`Background: Site ${origin} not connected and session inactive, returning empty array`);
                    sendResponse({ id, result: [] });
                }
            }
            return true; // Indicate async response

        case 'eth_chainId':
             console.log(`Background: Processing ${method}...`);
             const chainIdHex = `0x${currentNetwork.chainId.toString(16)}`;
             console.log(`Background: Returning current chainId: ${chainIdHex}`);
             sendResponse({ id, result: chainIdHex });
             return true; // Indicate async response

        case 'wallet_switchEthereumChain':
            console.log(`Background: Processing ${method}...`, params);
            const requestedChainIdHex = params[0]?.chainId;
            const requestedChainIdDec = parseInt(requestedChainIdHex, 16);

            if (networkConfigs[requestedChainIdDec]) {
                if (requestedChainIdDec === currentChainId) {
                    console.log(`Background: Chain ${requestedChainIdHex} is already the current chain.`);
                    sendResponse({ id, result: null }); // Success, already on the chain
                } else {
                    console.log(`Background: Switching active chain to ${requestedChainIdHex} (${requestedChainIdDec})`);
                    currentChainId = requestedChainIdDec;
                    saveState(); // Persist the new chain ID
                    notifyChainChanged(currentChainId); // Notify dApps
                    sendResponse({ id, result: null }); // Success
                }
            } else {
                console.log(`Background: Request to switch to unrecognized chain ID: ${requestedChainIdHex}. Sending error 4902.`);
                // Standard error code for unrecognized chain
                sendResponse({ id, error: { code: 4902, message: 'Unrecognized chain ID.' } });
            }
            return true; // Indicate async response        case 'wallet_addEthereumChain':
            // For now, reject adding chains as we have them pre-defined.
            // A more advanced implementation could allow adding user-defined networks.
            console.warn(`Background: ${method} called, but adding chains is not supported. DApp should use switchEthereumChain for known networks.`, params);
            sendResponse({ id, error: { code: -32601, message: 'Method not supported: Adding new chains is not enabled.' } });
            return true; // Indicate async response

        case 'wallet_watchAsset':
            console.log(`Background: Processing ${method}...`);
            console.log('Raw params received:', JSON.stringify(params, null, 2));
            
            (async () => {
                try {
                    // The DApp sends params as a direct object: { type: 'ERC20', options: {...} }
                    // Not as an array like some other methods
                    let assetParams;
                    
                    if (!params) {
                        throw new Error('No parameters provided for wallet_watchAsset');
                    }
                    
                    // Check if params has the expected structure directly
                    if (params.type && params.options) {
                        assetParams = params;
                        console.log('Using direct object params format (DApp standard)');
                    }
                    // Fallback: check if it's an array with the asset params as first element
                    else if (Array.isArray(params) && params.length > 0 && params[0].type && params[0].options) {
                        assetParams = params[0];
                        console.log('Using array params format');
                    }
                    else {
                        console.error('Invalid wallet_watchAsset parameters structure:', params);
                        throw new Error('Invalid parameters structure. Expected: { type: "ERC20", options: { address, symbol, decimals?, image? } }');
                    }
                    
                    console.log('Parsed assetParams:', JSON.stringify(assetParams, null, 2));
                    
                    // Validate asset type
                    const supportedTypes = ['ERC20', 'PRC20', 'erc20', 'prc20'];
                    if (!assetParams.type || !supportedTypes.includes(assetParams.type)) {
                        throw new Error(`Unsupported asset type: ${assetParams.type}. Supported types: ${supportedTypes.join(', ')}`);
                    }
                    
                    // Normalize the type to uppercase
                    const normalizedType = assetParams.type.toUpperCase();
                    console.log(`Asset type: ${normalizedType}`);
                    
                    // Validate required options
                    if (!assetParams.options || typeof assetParams.options !== 'object') {
                        throw new Error('Missing or invalid options object in wallet_watchAsset parameters');
                    }
                    
                    const { address, symbol, decimals, image } = assetParams.options;
                    
                    // Validate address
                    if (!address || typeof address !== 'string' || address.trim() === '') {
                        throw new Error('Token address is required and must be a non-empty string');
                    }
                    
                    // Basic Ethereum address format validation
                    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
                        throw new Error('Invalid Ethereum address format');
                    }
                    
                    // Validate symbol
                    if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
                        throw new Error('Token symbol is required and must be a non-empty string');
                    }
                    
                    // Validate decimals (optional, default to 18)
                    const tokenDecimals = decimals !== undefined ? parseInt(decimals) : 18;
                    if (isNaN(tokenDecimals) || tokenDecimals < 0 || tokenDecimals > 77) {
                        throw new Error('Token decimals must be a number between 0 and 77');
                    }
                    
                    console.log(`Validated token: ${symbol} at ${address} with ${tokenDecimals} decimals`);
                    
                    // Check if token already exists in storage
                    const storage = await new Promise(resolve => {
                        chrome.storage.local.get(['customTokens'], (data) => {
                            resolve(data.customTokens || []);
                        });
                    });
                    
                    const tokenExists = storage.some(token => 
                        token.address.toLowerCase() === address.toLowerCase()
                    );
                    
                    if (tokenExists) {
                        console.log('Background: Token already exists in wallet');
                        sendResponse({ id, result: true });
                        return;
                    }
                      // Show confirmation popup to user
                    const confirmed = await showTokenConfirmationPopup({
                        type: normalizedType,
                        address: address,
                        symbol: symbol,
                        decimals: tokenDecimals,
                        image: image || null,
                        origin: sender.origin || sender.url
                    });
                    
                    if (confirmed) {
                        // Add token to storage
                        storage.push({
                            address: address,
                            symbol: symbol,
                            decimals: tokenDecimals,
                            image: image || null,
                            type: normalizedType,
                            dateAdded: new Date().toISOString(),
                            addedBy: sender.origin || sender.url
                        });
                        
                        await new Promise(resolve => {
                            chrome.storage.local.set({ customTokens: storage }, resolve);
                        });
                        
                        console.log('Background: Token added successfully:', symbol);
                        sendResponse({ id, result: true });
                    } else {
                        console.log('Background: User rejected token addition');
                        sendResponse({ id, error: { code: 4001, message: 'User rejected the request.' } });
                    }
                    
                } catch (error) {
                    console.error('Error processing wallet_watchAsset:', error);
                    sendResponse({ 
                        id, 
                        error: { 
                            code: -32603, 
                            message: `Error adding token: ${error.message || 'Unknown error'}` 
                        }
                    });
                }
            })();
            return true;

        // Add support for eth_call - essential for reading contract data
        case 'eth_call':
            console.log(`Background: Processing ${method}...`, params);
            if (!provider) {
                console.error("Background: No provider available for eth_call");
                sendResponse({ 
                    id, 
                    error: { code: -32603, message: 'Internal JSON-RPC error: No provider available' }
                });
                return true;
            }
            
            // Forward the call to the provider
            (async () => {
                try {
                    // Params should be [callObject, blockTag]
                    if (!Array.isArray(params) || params.length < 1) {
                        throw new Error('Invalid params for eth_call');
                    }
                    
                    const callObject = params[0];
                    const blockTag = params[1] || 'latest';
                    
                    // Forward the call to the provider using ethers.js
                    const result = await provider.call(callObject, blockTag);
                    sendResponse({ id, result });
                } catch (error) {
                    console.error('Error processing eth_call:', error);
                    sendResponse({ 
                        id, 
                        error: { 
                            code: -32603, 
                            message: `Error processing eth_call: ${error.message || 'Unknown error'}` 
                        }
                    });
                }
            })();
            return true;
            
        // Add support for eth_estimateGas - needed for transactions
        case 'eth_estimateGas':
            console.log(`Background: Processing ${method}...`, params);
            if (!provider) {
                console.error("Background: No provider available for eth_estimateGas");
                sendResponse({ 
                    id, 
                    error: { code: -32603, message: 'Internal JSON-RPC error: No provider available' }
                });
                return true;
            }
            
            (async () => {
                try {
                    // Params should be [callObject]
                    if (!Array.isArray(params) || params.length < 1) {
                        throw new Error('Invalid params for eth_estimateGas');
                    }
                    
                    const callObject = params[0];
                    const result = await provider.estimateGas(callObject);
                    sendResponse({ id, result: result.toString() });
                } catch (error) {
                    console.error('Error processing eth_estimateGas:', error);
                    sendResponse({ 
                        id, 
                        error: { 
                            code: -32603, 
                            message: `Error processing eth_estimateGas: ${error.message || 'Unknown error'}` 
                        }
                    });
                }
            })();
            return true;
            
        // Add support for eth_getBalance
        case 'eth_getBalance':
            console.log(`Background: Processing ${method}...`, params);
            if (!provider) {
                console.error("Background: No provider available for eth_getBalance");
                sendResponse({ 
                    id, 
                    error: { code: -32603, message: 'Internal JSON-RPC error: No provider available' }
                });
                return true;
            }
            
            (async () => {
                try {
                    // Params should be [address, blockTag]
                    if (!Array.isArray(params) || params.length < 1) {
                        throw new Error('Invalid params for eth_getBalance');
                    }
                    
                    const address = params[0];
                    const blockTag = params[1] || 'latest';
                    
                    const balance = await provider.getBalance(address, blockTag);
                    sendResponse({ id, result: balance.toString() });
                } catch (error) {
                    console.error('Error processing eth_getBalance:', error);
                    sendResponse({ 
                        id, 
                        error: { 
                            code: -32603, 
                            message: `Error processing eth_getBalance: ${error.message || 'Unknown error'}` 
                        }
                    });
                }
            })();
            return true;
            
        // Add support for eth_getCode
        case 'eth_getCode':
            console.log(`Background: Processing ${method}...`, params);
            if (!provider) {
                console.error("Background: No provider available for eth_getCode");
                sendResponse({ 
                    id, 
                    error: { code: -32603, message: 'Internal JSON-RPC error: No provider available' }
                });
                return true;
            }
            
            (async () => {
                try {
                    // Params should be [address, blockTag]
                    if (!Array.isArray(params) || params.length < 1) {
                        throw new Error('Invalid params for eth_getCode');
                    }
                    
                    const address = params[0];
                    const blockTag = params[1] || 'latest';
                    
                    const code = await provider.getCode(address, blockTag);
                    sendResponse({ id, result: code });
                } catch (error) {
                    console.error('Error processing eth_getCode:', error);
                    sendResponse({ 
                        id, 
                        error: { 
                            code: -32603, 
                            message: `Error processing eth_getCode: ${error.message || 'Unknown error'}` 
                        }
                    });
                }
            })();
            return true;

        case 'eth_sendTransaction':
            console.log(`Background: Processing ${method}...`, params);
            
            // Check if wallet is unlocked
            if (!walletSessionActive || !ephemeralDecryptedKey) {
                sendResponse({ 
                    id, 
                    error: { code: 4100, message: 'Wallet is locked. Please unlock your wallet first.' }
                });
                return true;
            }
            
            // Validate transaction parameters
            if (!Array.isArray(params) || params.length === 0 || !params[0]) {
                sendResponse({ 
                    id, 
                    error: { code: -32602, message: 'Invalid params: Transaction object required' }
                });
                return true;
            }
            
            const txParams = params[0];
            
            // Create transaction confirmation request
            const confirmationRequest = {
                id: id,
                method: method,
                params: txParams,
                origin: origin,
                timestamp: Date.now()
            };
            
            // Show transaction confirmation popup
            showTransactionConfirmationPopup(confirmationRequest, sendResponse);
            return true;
            
        case 'personal_sign':
            console.log(`Background: Processing ${method}...`);
            
            // Check if wallet is unlocked
            if (!walletSessionActive || !ephemeralDecryptedKey) {
                sendResponse({ 
                    id, 
                    error: { code: 4100, message: 'Wallet is locked. Please unlock your wallet first.' }
                });
                return true;
            }
            
            // personal_sign params: [message, address]
            if (!Array.isArray(params) || params.length < 2) {
                sendResponse({ 
                    id, 
                    error: { code: -32602, message: 'Invalid params: message and address required' }
                });
                return true;
            }
            
            const messageToSign = params[0];
            const signingAddress = params[1];
            
            // Verify the signing address matches the wallet address
            if (signingAddress.toLowerCase() !== walletData.address.toLowerCase()) {
                sendResponse({ 
                    id, 
                    error: { code: -32602, message: 'Address mismatch: Cannot sign with different address' }
                });
                return true;
            }
            
            // Create message signing request
            const signingRequest = {
                id: id,
                method: method,
                message: messageToSign,
                address: signingAddress,
                origin: origin,
                timestamp: Date.now()
            };
            
            // Show message signing popup
            showMessageSigningPopup(signingRequest, sendResponse);
            return true;
            
        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4':
            console.log(`Background: Processing ${method}...`);
            
            // Check if wallet is unlocked
            if (!walletSessionActive || !ephemeralDecryptedKey) {
                sendResponse({ 
                    id, 
                    error: { code: 4100, message: 'Wallet is locked. Please unlock your wallet first.' }
                });
                return true;
            }
            
            // eth_signTypedData_v4 params: [address, typedData]
            if (!Array.isArray(params) || params.length < 2) {
                sendResponse({ 
                    id, 
                    error: { code: -32602, message: 'Invalid params: address and typed data required' }
                });
                return true;
            }
            
            const signerAddress = params[0];
            const typedData = params[1];
            
            // Verify the signing address matches the wallet address
            if (signerAddress.toLowerCase() !== walletData.address.toLowerCase()) {
                sendResponse({ 
                    id, 
                    error: { code: -32602, message: 'Address mismatch: Cannot sign with different address' }
                });
                return true;
            }
            
            // Create typed data signing request
            const typedDataRequest = {
                id: id,
                method: method,
                address: signerAddress,
                typedData: typeof typedData === 'string' ? JSON.parse(typedData) : typedData,
                origin: origin,
                timestamp: Date.now()
            };
            
            // Show typed data signing popup
            showTypedDataSigningPopup(typedDataRequest, sendResponse);
            return true;

        case '_heartWallet_listeningChainChanged':
        case '_heartWallet_listeningAccountsChanged':
            // These are notification methods from the inpage script when event listeners are registered
            // Just acknowledge them without forwarding to provider
            console.log(`Background: Received notification that dApp is listening for ${method.replace('_heartWallet_listening', '')}`);
            sendResponse({ id, result: true });
            return true;
            
        default:
            // For unhandled methods, log the method name but return a proper response
            console.warn(`Background: Unhandled RPC method received from dApp: ${method}`);
            
            // If provider exists, try to forward the request to the provider
            if (provider && walletSessionActive) {
                (async () => {
                    try {
                        // Use the provider's send method to forward the request
                        // This is a generic fallback for methods we haven't explicitly handled
                        const result = await provider.send(method, params || []);
                        sendResponse({ id, result });
                    } catch (error) {
                        console.error(`Error forwarding ${method} to provider:`, error);
                        sendResponse({ 
                            id, 
                            error: { 
                                code: -32601, 
                                message: `Method not supported: ${method}` 
                            }
                        });
                    }
                })();
                return true;
            }
            
            sendResponse({ id, error: { code: -32601, message: `Method not found or not supported: ${method}` }});
            return true; // Indicate async response
    }
  }

  // --- Handle Messages from Popup --- (Existing Logic + New Handlers)
  if (isFromPopup) {
      console.log("Background received popup message:", message.action);

      switch (message.action) {
        // --- Add handlers for network state and switching ---
        case "getNetworkState":
            console.log("Processing getNetworkState message...");
            sendResponse({
                availableNetworks: networkConfigs,
                currentChainId: currentChainId
            });
            break;
        case "switchNetwork":
            console.log("Processing switchNetwork message...", message.chainId);
            const requestedPopupChainId = message.chainId;
            if (networkConfigs[requestedPopupChainId]) {
                if (requestedPopupChainId !== currentChainId) {
                    console.log(`Background: Switching active chain via popup to ${requestedPopupChainId}`);
                    currentChainId = requestedPopupChainId;
                    
                    // Re-initialize provider with new network
                    if (provider) {
                        try {
                            provider.removeAllListeners();
                        } catch (e) {
                            console.warn("Error cleaning up old provider:", e);
                        }
                    }
                    provider = initializeProvider();
                    
                    saveState();
                    notifyChainChanged(currentChainId);
                    sendResponse({ status: "success", newChainId: currentChainId });
                } else {
                    console.log(`Background: Already on chain ${requestedPopupChainId}.`);
                    sendResponse({ status: "success", newChainId: currentChainId }); // No change needed
                }
            } else {
                console.error(`Background: Invalid chainId requested by popup: ${requestedPopupChainId}`);
                sendResponse({ status: "error", message: "Invalid chain ID requested." });
            }
            break;
        // --- End network handlers ---

        case "getNetworkConfig": // Keep for compatibility or specific needs?
          // Maybe deprecate this in favor of getNetworkState?
          console.warn("getNetworkConfig is deprecated, use getNetworkState");
          sendResponse({ config: networkConfigs[currentChainId] });
          break;

        case "checkWalletStatus": // This might be less useful now, superseded by getSessionInfo
          sendResponse({
            status: "success",
            isLoggedIn: walletSessionActive
          });
          break;

        case "loginWallet":
          console.log("Processing loginWallet message...");
          walletSessionActive = true;
          walletData = {
            address: message.address,
            lastLogin: new Date().toISOString()
          };
          ephemeralDecryptedKey = message.decryptedKey || null;

          let responseSent = false; // Flag to track if response has been sent

          // Update timeout duration based on message or use existing/default
          if (message.sessionTimeout && typeof message.sessionTimeout === 'number' && message.sessionTimeout > 0) {
            sessionTimeoutDuration = message.sessionTimeout;
            console.log(`Session timeout duration set via login to ${sessionTimeoutDuration / 60000} minutes.`);
            startSessionTimeout(); // Start the session timer immediately
            saveState(); // Save metadata (address etc.)
            sendResponse({
              status: "success",
              message: "Wallet session started in background (timeout from message)."
            });
            responseSent = true;
          } else {
              // If no valid timeout provided in login, check storage or use default
              chrome.storage.local.get('securitySettings', (settingsResult) => {
                  if (chrome.runtime.lastError) {
                      console.error("Error getting security settings:", chrome.runtime.lastError.message);
                      // Use default timeout on error
                      sessionTimeoutDuration = DEFAULT_SESSION_TIMEOUT;
                      console.warn(`Error fetching settings, using default timeout: ${sessionTimeoutDuration / 60000} minutes.`);
                  } else if (settingsResult.securitySettings && settingsResult.securitySettings.autoLogoutMinutes) {
                      sessionTimeoutDuration = settingsResult.securitySettings.autoLogoutMinutes * 60 * 1000;
                      console.log(`Using stored session timeout duration: ${sessionTimeoutDuration / 60000} minutes.`);
                  } else {
                      sessionTimeoutDuration = DEFAULT_SESSION_TIMEOUT;
                      console.log(`Using default session timeout duration: ${sessionTimeoutDuration / 60000} minutes.`);
                  }
                  startSessionTimeout(); // Start the session timer *after* determining duration
                  saveState(); // Save metadata (address etc.)
                  // Ensure sendResponse is called within the async callback
                  if (!responseSent) {
                      sendResponse({
                          status: "success",
                          message: "Wallet session started in background (timeout from storage/default)."
                      });
                      responseSent = true; // Mark as sent
                  }
              });
          }


          if (ephemeralDecryptedKey) {
              // Removed log about decrypted key storage
          } else {
              console.warn("Login successful, but no ephemeral key was provided or stored.");
          }

          // Return true ONLY if the response is asynchronous (i.e., we went into the else block with the storage call)
          return !responseSent;

        case "logoutWallet":
          console.log("Processing logoutWallet message...");
          logoutWalletInternal();
          sendResponse({
            status: "success",
            message: "Wallet logged out in background."
          });
          break;        case "getSessionInfo":
          console.log("Processing getSessionInfo message...");
          // Return current state - crucial for popup initialization
          sendResponse({
            isLoggedIn: walletSessionActive, // Reflects if background *thinks* it's logged in
            walletData: walletData // Contains address etc. if available
          });
          break;        case "unlockWallet":
          console.log("Processing unlockWallet message...");
          try {
            // For connection popup, we'll use a direct approach similar to the old system
            // but compatible with the new storage structure
            
            // Get the wallet list to find available wallets
            const walletListResult = await chrome.storage.local.get(['walletList']);
            const walletList = walletListResult.walletList || [];
            
            if (walletList.length === 0) {
              throw new Error('No wallets found');
            }
            
            // Get the active wallet ID or use the first wallet
            const activeWalletResult = await chrome.storage.local.get(['activeWalletId']);
            let walletId = activeWalletResult.activeWalletId;
            
            if (!walletId && walletList.length > 0) {
              walletId = walletList[0].id;
            }
            
            if (!walletId) {
              throw new Error('No wallet ID found');
            }
            
            // Get the encrypted wallet data
            const walletDataResult = await chrome.storage.local.get([walletId]);
            const encryptedWallet = walletDataResult[walletId];
            
            if (!encryptedWallet) {
              throw new Error('Wallet data not found');
            }
            
            // Decrypt the wallet using ethers.js
            const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, message.password);
            
            // Set up session
            walletSessionActive = true;
            walletData = {
              address: wallet.address,
              lastLogin: new Date().toISOString()
            };
            ephemeralDecryptedKey = wallet.privateKey;
            
            // Start session timeout and save state
            startSessionTimeout();
            saveState();
            
            // Removed log that exposed wallet address
            
            sendResponse({
              success: true,
              walletData: walletData
            });
          } catch (error) {
            console.error("Error unlocking wallet:", error);
            let errorMessage = 'Failed to unlock wallet';
            if (error.message.includes('invalid password')) {
              errorMessage = 'Incorrect password';
            } else if (error.message.includes('No wallet')) {
              errorMessage = 'No wallet found';
            }
            sendResponse({
              success: false,
              error: errorMessage
            });
          }
          break;

        case "checkSession":
          console.log("Processing checkSession message...");
          // Handle async balance fetch
          (async () => {
            if (walletSessionActive && walletData && walletData.address) {
              // Removed log that exposed wallet address
              // Get current balance if possible
              let balance = '0';
              try {
                const provider = ensureProvider();
                if (provider) {
                  const balanceWei = await provider.getBalance(walletData.address);
                  // In ethers v5 UMD, formatEther is directly on ethers object
                  balance = ethers.formatEther ? ethers.formatEther(balanceWei) : ethers.utils.formatEther(balanceWei);
                }
              } catch (error) {
                console.error("Error fetching balance:", error);
              }
              
              sendResponse({
                active: true,
                address: walletData.address,
                balance: balance,
                lastLogin: walletData.lastLogin
              });
            } else {
              console.log("No active session found");
              sendResponse({
                active: false
              });
            }
          })();
          return true; // Indicate async response
          break;

        case "getDecryptedKey":
          console.log("Processing getDecryptedKey message...");
          // IMPORTANT: Only return the key if the session is *currently* active
          if (walletSessionActive && ephemeralDecryptedKey) {
            console.log("Returning ephemeral key from background memory.");
            sendResponse({ decryptedKey: ephemeralDecryptedKey });
          } else {
            console.log("No active session or no ephemeral key available in background memory.");
            // Ensure key is null if sending null response
            if (!walletSessionActive) console.log("Reason: Session not active.");
            if (!ephemeralDecryptedKey) console.log("Reason: Key not stored or background restarted.");
            sendResponse({ decryptedKey: null });
          }
          break;

        // Handle updates to the session timeout duration from settings
        case "updateSessionTimeout":
            console.log("Processing updateSessionTimeout message...");
            if (message.sessionTimeout && typeof message.sessionTimeout === 'number' && message.sessionTimeout > 0) {
                sessionTimeoutDuration = message.sessionTimeout;
                console.log(`Session timeout duration updated to ${sessionTimeoutDuration / 60000} minutes.`);
                // If a session is currently active, reset the timer with the new duration
                if (walletSessionActive) {
                    console.log("Active session found, resetting timer with new duration.");
                    startSessionTimeout();
                }
                sendResponse({ status: "success", message: "Session timeout updated." });
            } else {
                console.warn("Invalid session timeout value received:", message.sessionTimeout);
                sendResponse({ status: "error", message: "Invalid timeout value provided." });
            }
            break;
            
        // Handle network changes from popup
        case "networkChanged":
            console.log("Processing networkChanged message...");
            const { chainId, networkName, rpcUrl } = message;
            
            // Update current network
            currentChainId = chainId;
            
            // Update network config if needed
            if (!networkConfigs[chainId]) {
                networkConfigs[chainId] = {
                    networkName: networkName,
                    rpcUrl: rpcUrl,
                    chainId: chainId,
                    currencySymbol: "ETH", // Default, should be updated
                    blockExplorer: ""
                };
            }
            
            // Reinitialize provider with new network
            provider = initializeProvider();
            
            // Notify all connected dApps about the network change
            notifyAllTabsNetworkChanged(chainId);
            
            sendResponse({ status: "success", message: "Network changed successfully." });
            break;

        // Handle connection progress notifications
        case 'connection_progress':
          const progressRequestId = message.requestId;
          console.log(`Background: Connection in progress for request ${progressRequestId}`);
          
          // Notify all tabs that this request is being processed
          // This helps prevent timeouts in the content script
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, {
                action: 'connection_in_progress',
                requestId: progressRequestId
              }).catch(e => {
                // Ignore errors for tabs that don't have content scripts
              });
            });
          });
          
          sendResponse({ success: true });
          break;        case 'connection_response':
          console.log(`Background: Processing connection_response - requestId: ${message.requestId}, approved: ${message.approved}`);
          const { requestId, approved } = message;
          
          // Retrieve the original request
          chrome.storage.local.get('pendingRequests', (data) => {
            const pendingRequests = data.pendingRequests || {};
            const request = pendingRequests[requestId];
            
            console.log('Background: Retrieved request from storage:', request);
            console.log('Background: Current walletData:', walletData);
            
            if (request) {
              // Remove from pending
              delete pendingRequests[requestId];
              chrome.storage.local.set({ pendingRequests });
              
              // Also clean up from activeConnectionRequests by origin
              for (const [origin, activeRequest] of activeConnectionRequests.entries()) {
                if (activeRequest.id === requestId) {
                  activeConnectionRequests.delete(origin);
                  break;
                }
              }
              
              // For reconnections, auto-approve if wallet is unlocked
              const shouldApprove = approved || (request.isReconnection && walletSessionActive && walletData && walletData.address);
              
              if (shouldApprove && walletData && walletData.address) {
                // Approved or auto-approved reconnection - store/update the connected site and return the address
                // Removed log that exposed wallet address and origin
                storeConnectedSite(request.origin, walletData.address);
                
                // Create a unique response channel
                const responseChannel = `response_${requestId}_${Date.now()}`;
                // Send message to all tabs to check if they're waiting for this response
                chrome.tabs.query({}, (tabs) => {
                  tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                      action: 'check_pending_request',
                      requestId: requestId,
                      responseChannel: responseChannel,
                      response: {
                        id: requestId,
                        result: [walletData.address]
                      }
                    }).catch(e => {
                      // Ignore errors for tabs that don't have content scripts
                    });
                  });
                });
                
                sendResponse({ success: true });
              } else {
                // Rejected or no wallet address
                // Similar to the approval flow, send rejection to all tabs
                chrome.tabs.query({}, (tabs) => {
                  tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                      action: 'check_pending_request',
                      requestId: requestId,
                      response: {
                        id: requestId,
                        error: { code: 4001, message: 'User rejected the request.' }
                      }
                    }).catch(e => {
                      // Ignore errors for tabs that don't have content scripts
                    });
                  });
                });
                
                sendResponse({ success: true });
              }
            } else {
              console.error('No pending request found with ID:', requestId);
              sendResponse({ success: false, error: 'Request not found' });
            }
          });
            // Return true to indicate we will respond asynchronously
          return true;

        // Connected Sites Management
        case 'getConnectedSites':
          getConnectedSites((sites) => {
            sendResponse({ success: true, sites: sites });
          });
          return true; // Async response

        case 'disconnectSite':
          const { origin } = message;
          disconnectSite(origin, (success) => {
            sendResponse({ success: success });
          });          return true; // Async response
          
        case 'disconnectAllSites':
          disconnectAllSites((success) => {
            sendResponse({ success: success });
          });
          return true; // Async response
          
        // Transaction confirmation handlers
        case 'getTransactionRequest':
          console.log('Processing getTransactionRequest:', message.requestId);
          const txRequest = activeTransactionRequests.get(message.requestId);
          if (txRequest) {
            sendResponse({
              success: true,
              request: txRequest,
              networkConfig: networkConfigs[currentChainId]
            });
          } else {
            sendResponse({ success: false, error: 'Request not found' });
          }
          break;
          
        case 'confirmTransaction':
          console.log('Processing confirmTransaction:', message.requestId);
          const confirmTxRequest = activeTransactionRequests.get(message.requestId);
          if (confirmTxRequest && confirmTxRequest.sendResponse) {
            // Send the transaction
            (async () => {
              try {
                if (!walletSessionActive || !ephemeralDecryptedKey) {
                  throw new Error('Wallet not unlocked');
                }
                
                const wallet = new ethers.Wallet(ephemeralDecryptedKey, provider);
                const tx = await wallet.sendTransaction(message.transaction);
                
                // Send success response to dApp
                confirmTxRequest.sendResponse({
                  id: confirmTxRequest.id,
                  result: tx.hash
                });
                
                // Clean up
                activeTransactionRequests.delete(message.requestId);
                
                sendResponse({ success: true, txHash: tx.hash });
              } catch (error) {
                console.error('Error sending transaction:', error);
                sendResponse({ success: false, error: error.message });
              }
            })();
            return true; // Async response
          } else {
            sendResponse({ success: false, error: 'Request not found' });
          }
          break;
          
        case 'rejectTransaction':
          console.log('Processing rejectTransaction:', message.requestId);
          const rejectTxRequest = activeTransactionRequests.get(message.requestId);
          if (rejectTxRequest && rejectTxRequest.sendResponse) {
            rejectTxRequest.sendResponse({
              id: rejectTxRequest.id,
              error: { code: 4001, message: 'User rejected the transaction' }
            });
            activeTransactionRequests.delete(message.requestId);
          }
          sendResponse({ success: true });
          break;
          
        // Message signing handlers
        case 'getSigningRequest':
          console.log('Processing getSigningRequest:', message.requestId);
          const signingRequest = activeSigningRequests.get(message.requestId);
          if (signingRequest) {
            sendResponse({
              success: true,
              request: signingRequest
            });
          } else {
            sendResponse({ success: false, error: 'Request not found' });
          }
          break;
          
        case 'confirmSigning':
          console.log('Processing confirmSigning:', message.requestId);
          const confirmSignRequest = activeSigningRequests.get(message.requestId);
          if (confirmSignRequest && confirmSignRequest.sendResponse) {
            (async () => {
              try {
                if (!walletSessionActive || !ephemeralDecryptedKey) {
                  throw new Error('Wallet not unlocked');
                }
                
                const wallet = new ethers.Wallet(ephemeralDecryptedKey);
                const signature = await wallet.signMessage(confirmSignRequest.message);
                
                confirmSignRequest.sendResponse({
                  id: confirmSignRequest.id,
                  result: signature
                });
                
                activeSigningRequests.delete(message.requestId);
                sendResponse({ success: true });
              } catch (error) {
                console.error('Error signing message:', error);
                sendResponse({ success: false, error: error.message });
              }
            })();
            return true; // Async response
          } else {
            sendResponse({ success: false, error: 'Request not found' });
          }
          break;
          
        case 'rejectSigning':
          console.log('Processing rejectSigning:', message.requestId);
          const rejectSignRequest = activeSigningRequests.get(message.requestId);
          if (rejectSignRequest && rejectSignRequest.sendResponse) {
            rejectSignRequest.sendResponse({
              id: rejectSignRequest.id,
              error: { code: 4001, message: 'User rejected the signature request' }
            });
            activeSigningRequests.delete(message.requestId);
          }
          sendResponse({ success: true });
          break;
          
        // Typed data signing handlers
        case 'getTypedDataRequest':
          console.log('Processing getTypedDataRequest:', message.requestId);
          const typedDataRequest = activeSigningRequests.get(message.requestId);
          if (typedDataRequest) {
            sendResponse({
              success: true,
              request: typedDataRequest
            });
          } else {
            sendResponse({ success: false, error: 'Request not found' });
          }
          break;
          
        case 'confirmTypedDataSigning':
          console.log('Processing confirmTypedDataSigning:', message.requestId);
          const confirmTypedRequest = activeSigningRequests.get(message.requestId);
          if (confirmTypedRequest && confirmTypedRequest.sendResponse) {
            (async () => {
              try {
                if (!walletSessionActive || !ephemeralDecryptedKey) {
                  throw new Error('Wallet not unlocked');
                }
                
                const wallet = new ethers.Wallet(ephemeralDecryptedKey);
                const typedData = typeof confirmTypedRequest.typedData === 'string' ?
                  JSON.parse(confirmTypedRequest.typedData) : confirmTypedRequest.typedData;
                
                const signature = await wallet.signTypedData(
                  typedData.domain,
                  typedData.types,
                  typedData.message
                );
                
                confirmTypedRequest.sendResponse({
                  id: confirmTypedRequest.id,
                  result: signature
                });
                
                activeSigningRequests.delete(message.requestId);
                sendResponse({ success: true });
              } catch (error) {
                console.error('Error signing typed data:', error);
                sendResponse({ success: false, error: error.message });
              }
            })();
            return true; // Async response
          } else {
            sendResponse({ success: false, error: 'Request not found' });
          }
          break;
          
        case 'rejectTypedDataSigning':
          console.log('Processing rejectTypedDataSigning:', message.requestId);
          const rejectTypedRequest = activeSigningRequests.get(message.requestId);
          if (rejectTypedRequest && rejectTypedRequest.sendResponse) {
            rejectTypedRequest.sendResponse({
              id: rejectTypedRequest.id,
              error: { code: 4001, message: 'User rejected the signature request' }
            });
            activeSigningRequests.delete(message.requestId);
          }
          sendResponse({ success: true });
          break;
          
        case 'getGasPrice':
          console.log('Processing getGasPrice');
          (async () => {
            try {
              const feeData = await provider.getFeeData();
              sendResponse({ gasPrice: feeData.gasPrice.toString() });
            } catch (error) {
              console.error('Error getting gas price:', error);
              sendResponse({ gasPrice: '0x3b9aca00' }); // Default 1 gwei
            }
          })();
          return true; // Async response
          
        case 'getWalletAddress':
          sendResponse({ address: walletData?.address || null });
          break;
          
        case 'getTokenInfo':
          console.log('Processing getTokenInfo:', message.address);
          // Check if we have this token in our stored tokens
          chrome.storage.local.get(['customTokens'], (result) => {
            const customTokens = result.customTokens || [];
            const token = customTokens.find(t => 
              t.address.toLowerCase() === message.address.toLowerCase()
            );
            if (token) {
              sendResponse({ 
                success: true, 
                tokenInfo: {
                  name: token.name,
                  symbol: token.symbol,
                  decimals: token.decimals
                }
              });
            } else {
              sendResponse({ success: false });
            }
          });
          return true; // Async response
          
        case 'fetchTokenInfo':
          console.log('Processing fetchTokenInfo:', message.address);
          (async () => {
            try {
              // Create a contract instance to fetch token info
              const tokenContract = new ethers.Contract(
                message.address,
                ['function name() view returns (string)',
                 'function symbol() view returns (string)', 
                 'function decimals() view returns (uint8)'],
                provider
              );
              
              const [name, symbol, decimals] = await Promise.all([
                tokenContract.name(),
                tokenContract.symbol(),
                tokenContract.decimals()
              ]);
              
              sendResponse({
                success: true,
                tokenInfo: { name, symbol, decimals }
              });
            } catch (error) {
              console.error('Error fetching token info:', error);
              sendResponse({ success: false });
            }
          })();
          return true; // Async response
          
        case 'getStoredTokens':
          console.log("Processing getStoredTokens message...");
          chrome.storage.local.get(['customTokens'], (result) => {
            const customTokens = result.customTokens || [];
            const tokens = [];
            
            // Convert custom tokens to token format for settings display
            for (const token of customTokens) {
              if (token.type === 'ERC20') {
                tokens.push({
                  address: token.address,
                  symbol: token.symbol,
                  decimals: token.decimals,
                  image: token.image || '',
                  source: token.addedBy ? 'wallet_watchAsset' : 'manual',
                  dateAdded: token.dateAdded
                });
              }
            }
            sendResponse({ success: true, tokens: tokens });
          });
          return true; // Async response

        case 'removeStoredToken':
          console.log("Processing removeStoredToken message...", message.address);
          chrome.storage.local.get(['customTokens'], (result) => {
            const customTokens = result.customTokens || [];
            const filteredTokens = customTokens.filter(token => 
              token.address.toLowerCase() !== message.address.toLowerCase()
            );
            
            // Check if token was actually removed
            const wasRemoved = customTokens.length !== filteredTokens.length;
            
            if (wasRemoved) {
              chrome.storage.local.set({ customTokens: filteredTokens }, () => {
                console.log('Token removed from storage:', message.address);
                sendResponse({ success: true });
              });
            } else {
              console.log('Token not found in storage:', message.address);
              sendResponse({ success: false, error: 'Token not found' });
            }
          });
          return true; // Async response

        case "tokenConfirmation":
          // This message is handled by specific popup listeners in showTokenConfirmationPopup
          // Just log that it was received and let the specific handler deal with it
          console.log("Token confirmation message received, handled by specific popup listener");
          return false; // Let other listeners handle this
          
        // Contract interaction handlers
        case "GET_CONTRACT_INFO":
          console.log("Getting contract info for:", message.address);
          try {
            // Get contract from storage
            const result = await chrome.storage.local.get(['heartWallet_contracts']);
            const contracts = result.heartWallet_contracts || [];
            const contract = contracts.find(c => c.address.toLowerCase() === message.address.toLowerCase());
            
            if (contract) {
              sendResponse({ success: true, contract });
            } else {
              sendResponse({ success: false, error: 'Contract not found' });
            }
          } catch (error) {
            console.error('Error getting contract info:', error);
            sendResponse({ success: false, error: error.message });
          }
          break;
          
        case "CONTRACT_READ":
          console.log("Executing read function:", message.functionName);
          try {
            const provider = new ethers.JsonRpcProvider(networkConfigs[currentChainId].rpcUrl);
            const contract = new ethers.Contract(message.contractAddress, message.abi || [], provider);
            
            const result = await contract[message.functionName](...(message.params || []));
            sendResponse({ success: true, result: result.toString() });
          } catch (error) {
            console.error('Error calling read function:', error);
            sendResponse({ success: false, error: error.message });
          }
          break;
          
        case "CONTRACT_WRITE":
          console.log("Executing write function:", message.functionName);
          try {
            if (!walletSessionActive || !ephemeralDecryptedKey) {
              throw new Error('Wallet not unlocked');
            }
            
            const provider = new ethers.JsonRpcProvider(networkConfigs[currentChainId].rpcUrl);
            const wallet = new ethers.Wallet(ephemeralDecryptedKey, provider);
            const contract = new ethers.Contract(message.contractAddress, message.abi || [], wallet);
            
            const txOptions = {};
            if (message.value && message.value !== '0') {
              txOptions.value = ethers.parseEther(message.value);
            }
            
            const tx = await contract[message.functionName](...(message.params || []), txOptions);
            sendResponse({ success: true, hash: tx.hash });
          } catch (error) {
            console.error('Error calling write function:', error);
            sendResponse({ success: false, error: error.message });
          }
          break;
          
        case "GET_EXPLORER_URL":
          sendResponse({ url: networkConfigs[currentChainId].blockExplorer });
          break;
          
        default:
          console.log("Unknown message action received:", message.action);
          // Indicate that the message was not handled, allows other listeners potentially
          return false;
      }
  }

  // If neither from content script nor popup (or unhandled popup action)
  if (!isFromContentScript && !isFromPopup) {
      console.log("Background received unknown message structure:", message);
  }
  // Default return for synchronous message handlers or unhandled messages
  return false;
  };

  // Call the async handler
  handleMessage().catch(error => {
    console.error('Error in message handler:', error);
    sendResponse({ error: error.message });
  });

  // Return true to indicate we'll send a response asynchronously
  return true;
});

// Track active connection popups to prevent duplicates
const activeConnectionRequests = new Map();

// Function to create a reconnection request (for previously connected sites)
function createReconnectionRequest(requestId, tab, sendResponseCallback, siteData) {
  const origin = new URL(tab?.url || "").origin;
  console.log(`Background: Creating reconnection request for origin: ${origin}, requestId: ${requestId}`);
  
  // Check if there's already an active connection request for this origin
  const existingRequest = activeConnectionRequests.get(origin);
  if (existingRequest) {
    // If the request is less than 30 seconds old, don't open a new popup
    const now = Date.now();
    if (now - existingRequest.timestamp < 30000) {
      console.log(`Background: Reconnection request from ${origin} ignored - already processing request ${existingRequest.id}`);
      
      sendResponseCallback({
        id: requestId,
        error: { 
          code: 4001, 
          message: 'Connection request is already being processed in another window.'
        }
      });
      
      if (existingRequest.windowId) {
        try {
          chrome.windows.update(existingRequest.windowId, { focused: true });
        } catch (e) {
          console.error('Failed to focus existing connection window:', e);
        }
      }
      
      return;
    } else {
      activeConnectionRequests.delete(origin);
    }
  }
  
  // Store the request for later retrieval
  const request = {
    id: requestId,
    tabId: tab?.id,
    origin: origin,
    timestamp: Date.now(),
    responseCallback: sendResponseCallback,
    isReconnection: true,
    siteData: siteData
  };
  
  // Save request to temporary storage
  chrome.storage.local.get('pendingRequests', (data) => {
    const pendingRequests = data.pendingRequests || {};
    pendingRequests[requestId] = {
      id: requestId,
      origin: request.origin,
      timestamp: request.timestamp,
      isReconnection: true,
      siteData: siteData
    };
    chrome.storage.local.set({ pendingRequests }, () => {
      console.log('Background: Stored reconnection request:', requestId, 'for origin:', request.origin);
    });
    
    // Track this as an active connection request
    activeConnectionRequests.set(origin, {
      id: requestId,
      timestamp: Date.now(),
      windowId: null
    });
    
    // Open reconnection popup
    openReconnectionPopup(request);
  });
  
  // Set a timeout to clean up if no response after 5 minutes
  setTimeout(() => {
    chrome.storage.local.get('pendingRequests', (data) => {
      if (data.pendingRequests && data.pendingRequests[requestId]) {
        delete data.pendingRequests[requestId];
        chrome.storage.local.set({ pendingRequests: data.pendingRequests });
        
        if (activeConnectionRequests.has(origin)) {
          const activeRequest = activeConnectionRequests.get(origin);
          if (activeRequest.id === requestId) {
            activeConnectionRequests.delete(origin);
          }
        }
        
        try {
          sendResponseCallback({
            id: requestId,
            error: { code: 4001, message: 'Request timeout. User failed to approve.' }
          });
        } catch (e) {
          console.log('Unable to respond to timed-out request:', e);
        }
      }
    });
  }, 5 * 60 * 1000);
}

function openReconnectionPopup(request) {
  // Create popup URL with query parameters including reconnection flag
  let popupURL = chrome.runtime.getURL('connection.html') + 
    `?requestId=${request.id}&origin=${encodeURIComponent(request.origin)}&reconnection=true`;
  
  chrome.windows.create({
    url: popupURL,
    type: 'popup',
    width: 400,
    height: 500, // Smaller height for reconnection popup
    focused: true
  }, (window) => {
    console.log('Reconnection request popup opened:', window.id);
    
    const origin = request.origin;
    if (activeConnectionRequests.has(origin)) {
      const requestData = activeConnectionRequests.get(origin);
      requestData.windowId = window.id;
      activeConnectionRequests.set(origin, requestData);
    }
  });
}

// Function to create a connection request and show popup
function createConnectionRequest(requestId, tab, sendResponseCallback) {
  const origin = new URL(tab?.url || "").origin;
  console.log(`Background: Creating connection request for origin: ${origin}, requestId: ${requestId}`);
  
  // Check if there's already an active connection request for this origin
  const existingRequest = activeConnectionRequests.get(origin);
  if (existingRequest) {
    // If the request is less than 30 seconds old, don't open a new popup
    const now = Date.now();
    if (now - existingRequest.timestamp < 30000) {
      console.log(`Background: Connection request from ${origin} ignored - already processing request ${existingRequest.id}`);
      
      // Let the dApp know we're already handling a connection request
      sendResponseCallback({
        id: requestId,
        error: { 
          code: 4001, 
          message: 'Connection request is already being processed in another window.'
        }
      });
      
      // Focus the existing popup if possible
      if (existingRequest.windowId) {
        try {
          chrome.windows.update(existingRequest.windowId, { focused: true });
        } catch (e) {
          console.error('Failed to focus existing connection window:', e);
        }
      }
      
      return;
    } else {
      // The existing request is old, clean it up
      activeConnectionRequests.delete(origin);
    }
  }
  
  // Store the request for later retrieval
  const request = {
    id: requestId,
    tabId: tab?.id,
    origin: origin,
    timestamp: Date.now(),
    responseCallback: sendResponseCallback
  };
  
  // Save request to temporary storage
  chrome.storage.local.get('pendingRequests', (data) => {
    const pendingRequests = data.pendingRequests || {};
    pendingRequests[requestId] = {
      id: requestId,
      origin: request.origin,
      timestamp: request.timestamp
    };
      chrome.storage.local.set({ pendingRequests }, () => {
      console.log('Background: Stored connection request:', requestId, 'for origin:', request.origin);
    });
    
    // Track this as an active connection request
    activeConnectionRequests.set(origin, {
      id: requestId,
      timestamp: Date.now(),
      windowId: null // Will be set after window is created
    });
    
    // Open popup for user to approve/reject the connection
    openConnectionPopup(request);
  });
  
  // Set a timeout to clean up if no response after 5 minutes
  setTimeout(() => {
    chrome.storage.local.get('pendingRequests', (data) => {
      if (data.pendingRequests && data.pendingRequests[requestId]) {
        // Remove the request and send rejection if it's still pending
        delete data.pendingRequests[requestId];
        chrome.storage.local.set({ pendingRequests: data.pendingRequests });
        
        // Also clean up from activeConnectionRequests
        if (activeConnectionRequests.has(origin)) {
          const activeRequest = activeConnectionRequests.get(origin);
          if (activeRequest.id === requestId) {
            activeConnectionRequests.delete(origin);
          }
        }
        
        try {
          // If callback is still valid, send rejection
          sendResponseCallback({
            id: requestId,
            error: { code: 4001, message: 'Request timeout. User failed to approve.' }
          });
        } catch (e) {
          console.log('Unable to respond to timed-out request:', e);
        }
      }
    });
  }, 5 * 60 * 1000); // 5 minute timeout
}

function openConnectionPopup(request) {
  // Create popup URL with query parameters
  let popupURL = chrome.runtime.getURL('connection.html') + 
    `?requestId=${request.id}&origin=${encodeURIComponent(request.origin)}`;
  
  // For MV3 with ChromeAction popup, use chrome.windows.create
  chrome.windows.create({
    url: popupURL,
    type: 'popup',
    width: 400,
    height: 600,
    focused: true
  }, (window) => {
    console.log('Connection request popup opened:', window.id);
    
    // Store the window ID for potential focusing later
    const origin = request.origin;
    if (activeConnectionRequests.has(origin)) {
      const activeRequest = activeConnectionRequests.get(origin);
      activeRequest.windowId = window.id;
      activeConnectionRequests.set(origin, activeRequest);
    }
    
    // Also track when this window is closed to clean up activeConnectionRequests
    chrome.windows.onRemoved.addListener(function windowClosedListener(windowId) {
      if (windowId === window.id) {
        // Check if this origin's active request used this window
        for (const [origin, activeRequest] of activeConnectionRequests.entries()) {
          if (activeRequest.windowId === windowId) {
            console.log(`Connection window ${windowId} closed for origin ${origin}`);
            activeConnectionRequests.delete(origin);
          }
        }
        // Remove this listener since the window is now closed
        chrome.windows.onRemoved.removeListener(windowClosedListener);
      }
    });
  });
}

// Handle connection approval/rejection from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'connection_response') {
    const { requestId, approved } = message;
    
    // Retrieve the original request
    chrome.storage.local.get('pendingRequests', (data) => {
      const pendingRequests = data.pendingRequests || {};
      const request = pendingRequests[requestId];
      
      if (request) {
        // Remove from pending
        delete pendingRequests[requestId];
        chrome.storage.local.set({ pendingRequests });
        
        // Also clean up from activeConnectionRequests by origin
        for (const [origin, activeRequest] of activeConnectionRequests.entries()) {
          if (activeRequest.id === requestId) {
            activeConnectionRequests.delete(origin);
            break;
          }
        }
        
        // Find the tab that made the request to send response
        if (approved && walletData && walletData.address) {
          // Approved - return the address
          // We need to find the original responseCallback for this request
          // Since we can't store functions in chrome storage, we need to use a messaging system
          // to send the response back to the content script
          
          // Create a unique response channel
          const responseChannel = `response_${requestId}_${Date.now()}`;
          
          // Send message to all tabs to check if they're waiting for this response
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, {
                action: 'check_pending_request',
                requestId: requestId,
                responseChannel: responseChannel,
                response: {
                  id: requestId,
                  result: [walletData.address]
                }
              }).catch(e => {
                // Ignore errors for tabs that don't have content scripts
              });
            });
          });
          
          sendResponse({ success: true });
        } else {
          // Rejected or no wallet address
          // Similar to the approval flow, send rejection to all tabs
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, {
                action: 'check_pending_request',
                requestId: requestId,
                response: {
                  id: requestId,
                  error: { code: 4001, message: 'User rejected the request.' }
                }
              }).catch(e => {
                // Ignore errors for tabs that don't have content scripts
              });
            });
          });
          
          sendResponse({ success: true });
        }
      } else {
        console.error('No pending request found with ID:', requestId);
        sendResponse({ success: false, error: 'Request not found' });
      }
    });
    
    // Return true to indicate we will respond asynchronously
    return true;
  }
    return false; // Default return for synchronous message handlers
});

// Function to migrate connected sites data to ensure proper structure
async function migrateConnectedSites() {
    try {
        const result = await chrome.storage.local.get('connectedSites');
        const connectedSites = result.connectedSites || {};
        let needsUpdate = false;
        
        // Check each site and fix missing data
        for (const [origin, siteData] of Object.entries(connectedSites)) {
            // If site data is malformed (e.g., just a string or missing required fields)
            if (typeof siteData !== 'object' || !siteData.walletAddress) {
                console.log(`Migrating malformed connected site data for ${origin}`);
                
                // Try to preserve any existing data
                const migratedData = {
                    origin: origin,
                    walletAddress: typeof siteData === 'string' ? siteData : (siteData.walletAddress || siteData.address || walletData?.address || 'Unknown'),
                    connectedAt: siteData.connectedAt || siteData.dateConnected || Date.now(),
                    lastAccessed: siteData.lastAccessed || Date.now(),
                    chainId: siteData.chainId || currentChainId,
                    networkName: siteData.networkName || networkConfigs[currentChainId]?.networkName || 'Unknown'
                };
                
                connectedSites[origin] = migratedData;
                needsUpdate = true;
            }
        }
        
        if (needsUpdate) {
            await chrome.storage.local.set({ connectedSites });
            console.log('Connected sites data migration completed');
        }
    } catch (error) {
        console.error('Error migrating connected sites:', error);
    }
}

// Restore state and initialize provider when the script loads
restoreState();

// Run migration after a short delay to ensure state is loaded
setTimeout(() => {
    migrateConnectedSites();
}, 1000);

// The session timeout should work like this:
function startSessionTimeout() {
    clearTimeout(sessionTimeoutId);
    
    if (walletSessionActive && sessionTimeoutDuration > 0) {
        console.log(`Starting session timeout for ${sessionTimeoutDuration / 60000} minutes.`);
        sessionTimeoutId = setTimeout(() => {
            console.log("Session timeout reached - logging out wallet internally.");
            logoutWalletInternal();
        }, sessionTimeoutDuration);
    }
}

// Function to notify all connected dApps about network change
function notifyAllTabsNetworkChanged(newChainId) {
    console.log(`Notifying all connected dApps about network change to chainId: ${newChainId}`);
    
    // Get all tabs and send network change event
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            // Send to content script which will forward to the dApp
            chrome.tabs.sendMessage(tab.id, {
                target: 'contentscript',
                action: 'networkChanged',
                chainId: `0x${newChainId.toString(16)}`, // Convert to hex as per EIP-3326
                networkVersion: newChainId.toString()
            }).catch(e => {
                // Ignore errors for tabs without content scripts
            });
        });
    });
}

// Reset the timer on any wallet activity
function resetSessionTimeout() {
    if (walletSessionActive && sessionTimeoutDuration > 0) {
        console.log("Resetting session timeout");
        startSessionTimeout();
    }
}

// Show transaction confirmation popup
function showTransactionConfirmationPopup(request, sendResponseCallback) {
  console.log('Background: Opening transaction confirmation popup for request:', request.id);
  
  // Store the request for the popup to access
  activeTransactionRequests.set(request.id, {
    ...request,
    sendResponse: sendResponseCallback
  });
  
  // Create popup URL with transaction data
  const popupURL = chrome.runtime.getURL('transaction-confirmation.html') + 
    `?requestId=${request.id}&origin=${encodeURIComponent(request.origin)}`;
  
  chrome.windows.create({
    url: popupURL,
    type: 'popup',
    width: 400,
    height: 600,
    focused: true
  }, (window) => {
    console.log('Transaction confirmation popup opened:', window.id);
    
    // Set timeout for auto-rejection
    setTimeout(() => {
      if (activeTransactionRequests.has(request.id)) {
        activeTransactionRequests.delete(request.id);
        try {
          sendResponseCallback({
            id: request.id,
            error: { code: 4001, message: 'User rejected the transaction' }
          });
        } catch (e) {
          console.log('Unable to respond to timed-out transaction:', e);
        }
      }
    }, 5 * 60 * 1000); // 5 minute timeout
  });
}

// Show message signing popup
function showMessageSigningPopup(request, sendResponseCallback) {
  console.log('Background: Opening message signing popup for request:', request.id);
  
  // Store the request for the popup to access
  activeSigningRequests.set(request.id, {
    ...request,
    sendResponse: sendResponseCallback
  });
  
  // Create popup URL
  const popupURL = chrome.runtime.getURL('message-signing.html') + 
    `?requestId=${request.id}&origin=${encodeURIComponent(request.origin)}`;
  
  chrome.windows.create({
    url: popupURL,
    type: 'popup',
    width: 400,
    height: 500,
    focused: true
  }, (window) => {
    console.log('Message signing popup opened:', window.id);
    
    // Set timeout for auto-rejection
    setTimeout(() => {
      if (activeSigningRequests.has(request.id)) {
        activeSigningRequests.delete(request.id);
        try {
          sendResponseCallback({
            id: request.id,
            error: { code: 4001, message: 'User rejected the signature request' }
          });
        } catch (e) {
          console.log('Unable to respond to timed-out signing request:', e);
        }
      }
    }, 5 * 60 * 1000); // 5 minute timeout
  });
}

// Show typed data signing popup
function showTypedDataSigningPopup(request, sendResponseCallback) {
  console.log('Background: Opening typed data signing popup for request:', request.id);
  
  // Store the request for the popup to access
  activeSigningRequests.set(request.id, {
    ...request,
    sendResponse: sendResponseCallback
  });
  
  // Create popup URL
  const popupURL = chrome.runtime.getURL('typed-data-signing.html') + 
    `?requestId=${request.id}&origin=${encodeURIComponent(request.origin)}`;
  
  chrome.windows.create({
    url: popupURL,
    type: 'popup',
    width: 400,
    height: 600,
    focused: true
  }, (window) => {
    console.log('Typed data signing popup opened:', window.id);
    
    // Set timeout for auto-rejection
    setTimeout(() => {
      if (activeSigningRequests.has(request.id)) {
        activeSigningRequests.delete(request.id);
        try {
          sendResponseCallback({
            id: request.id,
            error: { code: 4001, message: 'User rejected the signature request' }
          });
        } catch (e) {
          console.log('Unable to respond to timed-out signing request:', e);
        }
      }
    }, 5 * 60 * 1000); // 5 minute timeout
  });
}

// Storage for active requests
const activeTransactionRequests = new Map();
const activeSigningRequests = new Map();
