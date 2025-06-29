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

// Import security utilities and keyring service
try {
  importScripts('crypto-utils.js', 'keyring-service.js', 'session-manager.js', 'transaction-validator.js', 'vault-storage.js');
  console.log('Security utilities loaded in background script');
} catch (error) {
  console.error('Failed to load security utilities in background script:', error);
}

// Network Configurations
const networkConfigs = {
  // PulseChain Mainnet
  369: {
    networkName: "PulseChain",
    rpcUrl: "https://rpc.pulsechain.com",
    chainId: 369,
    currencySymbol: "PLS",
    blockExplorer: "https://scan.mypinata.cloud/ipfs/bafybeidn64pd2u525lmoipjl4nh3ooa2imd7huionjsdepdsphl5slfowy/"
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

// Session state management - NOW PER-ORIGIN
let globalWalletUnlocked = false; // Global wallet unlock state
let walletData = null; // Holds address, lastLogin etc.
// REMOVED: ephemeralDecryptedKey - Private keys now handled by KeyringService
let currentChainId = DEFAULT_CHAIN_ID; // Track the active network

// Permission types will be imported from session-manager.js
// PERMISSIONS global variable is defined in session-manager.js

// Initialize services
let keyringService = null;
let sessionManager = null;
let secureMemory = null;
let transactionValidator = null;
let vaultStorage = null;

// Delay initialization to ensure all scripts are loaded
setTimeout(() => {
  try {
    secureMemory = new SecureMemory();
    sessionManager = new SessionManager();
    transactionValidator = new TransactionValidator();
    vaultStorage = new VaultStorage();
    console.log('Services initialized: session manager, transaction validator, vault storage');
    console.log('PERMISSIONS available:', typeof PERMISSIONS !== 'undefined');
    
    // Try to restore session from session storage
    tryRestoreSession();
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}, 100);

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
let sessionTimeoutDuration = 30 * 60 * 1000; // Default 30 minutes
const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // Keep default reference

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
    globalWalletUnlocked = false;
    // Clear all origin sessions when wallet locks
    if (sessionManager) {
      sessionManager.clearAll();
    }
    walletData = null;
    // Clear keyring service
    if (keyringService) {
        keyringService.clearMemory();
        keyringService = null;
    }
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
    
    // Clear session storage completely
    if (chrome.storage.session) {
      chrome.storage.session.clear()
        .then(() => console.log("Session storage cleared completely"))
        .catch(err => console.error("Error clearing session storage:", err));
    }
}

// Helper to clear session after timeout
function startSessionTimeout() {
  clearTimeout(sessionTimeoutId); // Clear existing timer if any
  if (globalWalletUnlocked) { // Only start timer if session is active
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
  if (globalWalletUnlocked) {
    // console.log("Resetting session timeout."); // Can be noisy, enable if needed
    startSessionTimeout(); // Restart the timer with the current duration
  }
}

// Save session metadata AND current chainId
function saveState() {
  const stateToSave = {};
  if (globalWalletUnlocked && walletData) {
    stateToSave.sessionData = {
      active: true,
      data: walletData,
    };
    
    // Also save to session storage for better persistence
    if (chrome.storage.session) {
      chrome.storage.session.set({
        walletUnlocked: true,
        walletAddress: walletData.address,
        lastActivity: Date.now()
      }).catch(err => console.error("Error saving to session storage:", err));
    }
  } else {
    // Ensure sessionData is removed if not active
    chrome.storage.local.remove('sessionData');
    
    // Clear session storage
    if (chrome.storage.session) {
      chrome.storage.session.remove(['walletUnlocked', 'walletAddress', 'lastActivity'])
        .catch(err => console.error("Error clearing session storage:", err));
    }
  }
  // Always save the current chain ID
  stateToSave.currentChainId = currentChainId;

  chrome.storage.local.set(stateToSave, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving state:", chrome.runtime.lastError.message);
    }
  });
}

// Try to restore session from session storage (for Manifest V3 service worker restarts)
async function tryRestoreSession() {
  if (!chrome.storage.session) {
    console.log("Session storage not available");
    return;
  }
  
  try {
    const sessionData = await chrome.storage.session.get(['walletUnlocked', 'walletAddress', 'lastActivity']);
    
    if (sessionData.walletUnlocked && sessionData.walletAddress && sessionData.lastActivity) {
      const timeSinceLastActivity = Date.now() - sessionData.lastActivity;
      
      // Check if session is still valid (within timeout period)
      if (timeSinceLastActivity < sessionTimeoutDuration) {
        console.log("Restoring active session from session storage");
        
        // Restore wallet data
        walletData = { address: sessionData.walletAddress };
        globalWalletUnlocked = true;
        
        // Restart timeout with remaining time
        const remainingTime = sessionTimeoutDuration - timeSinceLastActivity;
        sessionTimeoutId = setTimeout(() => {
          console.log("Session timeout reached after restore - logging out wallet internally.");
          logoutWalletInternal();
        }, remainingTime);
        
        console.log(`Session restored, timeout in ${remainingTime / 60000} minutes`);
      } else {
        console.log("Session expired, not restoring");
        // Clear expired session data
        await chrome.storage.session.remove(['walletUnlocked', 'walletAddress', 'lastActivity']);
      }
    }
  } catch (error) {
    console.error("Error restoring session:", error);
  }
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
      // DO NOT set globalWalletUnlocked = true here.
    } else {
        console.log("No valid session metadata found in storage to restore.");
        walletData = null;
    }
  });
}

// Helper function for internal logout
function logoutWalletInternal() {
  // Removed log mentioning key clearing
  globalWalletUnlocked = false;
  // Clear all origin sessions when wallet locks
  if (sessionManager) {
    sessionManager.clearAll();
  }
  // Clear wallet data to ensure clean logout
  walletData = null;
  
  // Clear keyring service memory
  if (keyringService) {
      keyringService.clearMemory();
  }
  
  // Lock vault storage
  if (vaultStorage) {
      vaultStorage.lock();
  }
  
  // Clear any temporary data in secure memory
  if (secureMemory) {
      secureMemory.clear();
  }
  clearTimeout(sessionTimeoutId);
  sessionTimeoutId = null;
  
  // Clear session storage explicitly before saving state
  if (chrome.storage.session) {
    chrome.storage.session.clear()
      .then(() => console.log("Session storage cleared on logout"))
      .catch(err => console.error("Error clearing session storage on logout:", err));
  }
  
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

    // For content script messages, check per-origin session
    if (isFromContentScript && sender.origin) {
        const originSession = sessionManager.getSession(sender.origin);
        if (originSession && originSession.isActive) {
            // Extend session on activity
            sessionManager.extendSession(sender.origin, 60000); // Extend by 1 minute
        }
    }
    
    // For popup messages, reset the global wallet session timeout
    if (isFromPopup && globalWalletUnlocked) {
        resetSessionTimeout();
    }

    // --- Handle Messages from Content Script (dApp requests) ---
    if (isFromContentScript) {
      const { id, method, params } = message.payload;
    console.log(`Background: Received dApp request - Method: ${method}, ID: ${id}, Params:`, params);
    console.log(`Background: Sender info:`, { 
      origin: sender.origin, 
      url: sender.url, 
      tab: sender.tab,
      frameId: sender.frameId 
    });
    const currentNetwork = networkConfigs[currentChainId]; // Get current network config

    // Ensure we have a provider before handling RPC methods
    ensureProvider();
    
    // Declare origin once for the entire switch statement
    // For content scripts, sender.origin contains the origin, sender.tab contains tab info
    const origin = sender.origin || (sender.tab && new URL(sender.tab.url).origin) || sender.url;
    console.log(`Background: Extracted origin: ${origin}`);
    
    switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
            console.log(`Background: Processing ${method}...`);
            
            // Check if wallet is globally unlocked first
            if (globalWalletUnlocked && walletData && walletData.address) {
                // Check per-origin session
                const hasOriginSession = sessionManager.hasActiveSession(origin);
                
                if (method === 'eth_requestAccounts') {
                    if (!hasOriginSession) {
                        // Check if site was previously connected
                        const connectedSites = await new Promise(resolve => {
                            chrome.storage.local.get('connectedSites', (data) => {
                                resolve(data.connectedSites || {});
                            });
                        });
                        
                        const siteData = connectedSites[origin];
                        
                        if (siteData) {
                            // Site was previously connected, just create session
                            console.log(`Background: Site ${origin} was previously connected, auto-approving...`);
                            sessionManager.createSession(origin, { duration: 30 * 60 * 1000 }); // 30 min session
                            sessionManager.addPermission(origin, PERMISSIONS.ACCOUNTS);
                            sendResponse({ id, result: [walletData.address] });
                        } else {
                            // New site connection - need approval
                            console.log(`Background: New site ${origin} requesting connection, showing approval popup...`);
                            
                            // If we don't have tab info, we need to query for the active tab
                            if (!sender.tab || !sender.tab.id) {
                                console.log('Background: No tab info from sender, querying active tab...');
                                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                    if (tabs && tabs.length > 0) {
                                        const activeTab = tabs[0];
                                        console.log('Background: Found active tab:', activeTab);
                                        try {
                                            createConnectionRequest(id, activeTab, sendResponse);
                                        } catch (error) {
                                            console.error('Error creating connection request:', error);
                                            sendResponse({ id, error: { code: -32603, message: 'Failed to create connection request: ' + error.message } });
                                        }
                                    } else {
                                        console.error('Background: No active tab found');
                                        sendResponse({ id, error: { code: -32603, message: 'Could not determine requesting tab' } });
                                    }
                                });
                                return true; // Keep the connection open for async response
                            } else {
                                try {
                                    createConnectionRequest(id, sender.tab, sendResponse);
                                    return true; // Keep the connection open for async response
                                } catch (error) {
                                    console.error('Error creating connection request:', error);
                                    sendResponse({ id, error: { code: -32603, message: 'Failed to create connection request: ' + error.message } });
                                    return;
                                }
                            }
                        }
                    } else {
                        // Session already exists, just return address
                        sendResponse({ id, result: [walletData.address] });
                    }
                } else {
                    // For eth_accounts, check if origin has permission
                    if (hasOriginSession && sessionManager.hasPermission(origin, PERMISSIONS.ACCOUNTS)) {
                        const isConnected = await isSiteConnected(origin, walletData.address);
                        if (isConnected) {
                            updateSiteLastAccessed(origin);
                            sendResponse({ id, result: [walletData.address] });
                        } else {
                            console.log(`Background: Site ${origin} is not connected, returning empty array`);
                            sendResponse({ id, result: [] });
                        }
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
                    console.log(`Background: Tab info:`, sender.tab);
                    
                    // If we don't have tab info, we need to query for the active tab
                    if (!sender.tab || !sender.tab.id) {
                        console.log('Background: No tab info from sender, querying active tab...');
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            if (tabs && tabs.length > 0) {
                                const activeTab = tabs[0];
                                console.log('Background: Found active tab:', activeTab);
                                try {
                                    createReconnectionRequest(id, activeTab, sendResponse, siteData);
                                } catch (error) {
                                    console.error('Error creating reconnection request:', error);
                                    sendResponse({ id, error: { code: -32603, message: 'Failed to create connection request: ' + error.message } });
                                }
                            } else {
                                console.error('Background: No active tab found');
                                sendResponse({ id, error: { code: -32603, message: 'Could not determine requesting tab' } });
                            }
                        });
                        return true; // Keep the connection open for async response
                    } else {
                        try {
                            createReconnectionRequest(id, sender.tab, sendResponse, siteData);
                            return true; // Keep the connection open for async response
                        } catch (error) {
                            console.error('Error creating reconnection request:', error);
                            sendResponse({ id, error: { code: -32603, message: 'Failed to create connection request: ' + error.message } });
                            return;
                        }
                    }
                } else if (siteData && method === 'eth_accounts') {
                    // For eth_accounts, return empty array when session is inactive even for connected sites
                    console.log(`Background: Site ${origin} is connected but session inactive, returning empty array`);
                    sendResponse({ id, result: [] });
                } else if (!siteData && method === 'eth_requestAccounts') {
                    // Site not previously connected, create new connection request
                    console.log(`Background: Site ${origin} not previously connected, creating connection request...`);
                    console.log(`Background: Tab info:`, sender.tab);
                    
                    // If we don't have tab info, we need to query for the active tab
                    if (!sender.tab || !sender.tab.id) {
                        console.log('Background: No tab info from sender, querying active tab...');
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            if (tabs && tabs.length > 0) {
                                const activeTab = tabs[0];
                                console.log('Background: Found active tab:', activeTab);
                                try {
                                    createConnectionRequest(id, activeTab, sendResponse);
                                } catch (error) {
                                    console.error('Error creating connection request:', error);
                                    sendResponse({ id, error: { code: -32603, message: 'Failed to create connection request: ' + error.message } });
                                }
                            } else {
                                console.error('Background: No active tab found');
                                sendResponse({ id, error: { code: -32603, message: 'Could not determine requesting tab' } });
                            }
                        });
                        return true; // Keep the connection open for async response
                    } else {
                        try {
                            createConnectionRequest(id, sender.tab, sendResponse);
                            return true; // Keep the connection open for async response
                        } catch (error) {
                            console.error('Error creating connection request:', error);
                            sendResponse({ id, error: { code: -32603, message: 'Failed to create connection request: ' + error.message } });
                            return;
                        }
                    }
                } else {
                    // eth_accounts for unconnected site
                    console.log(`Background: Site ${origin} not connected and session inactive, returning empty array`);
                    sendResponse({ id, result: [] });
                }
            }
            break;

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
            if (!globalWalletUnlocked) {
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
            
            // Add from address if not specified
            if (!txParams.from) {
                txParams.from = walletData.address;
            }
            
            // Add chainId if not specified
            if (!txParams.chainId) {
                txParams.chainId = currentChainId;
            } else {
                // Validate that transaction chainId matches current network
                const txChainId = parseInt(txParams.chainId);
                if (txChainId !== currentChainId) {
                    sendResponse({
                        error: `Network mismatch: Transaction is for chain ${txChainId} but wallet is on chain ${currentChainId}. Please switch networks.`
                    });
                    return true;
                }
            }
            
            // Validate transaction
            let validationResult = null;
            let simulationResult = null;
            
            try {
                // Get wallet balance for validation context
                const balance = await provider.getBalance(walletData.address);
                const context = {
                    balance: balance.toString(),
                    chainId: currentChainId
                };
                
                // Validate transaction parameters
                validationResult = await transactionValidator.validateTransaction(txParams, context);
                
                // Simulate transaction if validation passed
                if (validationResult.valid && provider) {
                    simulationResult = await transactionValidator.simulateTransaction(txParams, provider);
                }
            } catch (error) {
                console.error('Transaction validation error:', error);
                // Continue even if validation fails - let user decide
            }
            
            // Create transaction confirmation request with validation results
            // Generate a unique request ID for internal tracking
            const requestId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const confirmationRequest = {
                requestId: requestId,  // Unique ID for tracking
                id: id,                // Original JSON-RPC ID for response
                method: method,
                params: txParams,
                origin: origin,
                timestamp: Date.now(),
                validation: validationResult,
                simulation: simulationResult
            };
            
            // Show transaction confirmation popup
            showTransactionConfirmationPopup(confirmationRequest, sendResponse);
            return true;
            
        case 'personal_sign':
            console.log(`Background: Processing ${method}...`);
            
            // Check if wallet is unlocked
            if (!globalWalletUnlocked) {
                sendResponse({ 
                    id, 
                    error: { code: 4100, message: 'Wallet is locked. Please unlock your wallet first.' }
                });
                return true;
            }
            
            // Check per-origin session and permission
            if (!sessionManager.hasActiveSession(origin)) {
                sendResponse({ 
                    id, 
                    error: { code: 4100, message: 'No active session. Please connect first.' }
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
            
            // Check if origin has permission to sign messages
            if (!sessionManager.hasPermission(origin, PERMISSIONS.SIGN_MESSAGE)) {
                // Add note that permission will be requested in popup
                console.log(`Origin ${origin} doesn't have message signing permission yet`);
            }
            
            // Create message signing request
            const signingRequest = {
                id: id,
                method: method,
                message: messageToSign,
                address: signingAddress,
                origin: origin,
                timestamp: Date.now(),
                needsPermission: !sessionManager.hasPermission(origin, PERMISSIONS.SIGN_MESSAGE)
            };
            
            // Show message signing popup (will handle permission request)
            showMessageSigningPopup(signingRequest, sendResponse);
            return true;
            
        case 'eth_blockNumber':
        case 'eth_getBlockByNumber':
        case 'eth_getBlockByHash':
        case 'eth_getTransactionByHash':
        case 'eth_getTransactionReceipt':
        case 'eth_gasPrice':
        case 'eth_getStorageAt':
        case 'eth_getTransactionCount':
        case 'net_version':
        case 'eth_getLogs':
            // These are read-only methods that don't require wallet to be unlocked
            console.log(`Background: Processing read-only method ${method}...`);
            ensureProvider();
            
            if (!provider) {
                sendResponse({ 
                    id, 
                    error: { code: -32603, message: 'Provider not available' }
                });
                return true;
            }
            
            (async () => {
                try {
                    const result = await provider.send(method, params || []);
                    sendResponse({ id, result });
                } catch (error) {
                    console.error(`Error calling ${method}:`, error);
                    sendResponse({ 
                        id, 
                        error: { 
                            code: error.code || -32603, 
                            message: error.message || `Failed to execute ${method}` 
                        }
                    });
                }
            })();
            return true;

        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4':
            console.log(`Background: Processing ${method}...`);
            
            // Check if wallet is unlocked
            if (!globalWalletUnlocked) {
                sendResponse({ 
                    id, 
                    error: { code: 4100, message: 'Wallet is locked. Please unlock your wallet first.' }
                });
                return true;
            }
            
            // Check per-origin session
            if (!sessionManager.hasActiveSession(origin)) {
                sendResponse({ 
                    id, 
                    error: { code: 4100, message: 'No active session. Please connect first.' }
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
            
            // List of methods that require wallet to be unlocked
            const methodsRequiringWallet = [
                'eth_sendTransaction',
                'eth_sendRawTransaction',
                'eth_sign',
                'personal_sign',
                'eth_signTypedData',
                'eth_signTypedData_v3',
                'eth_signTypedData_v4',
                'eth_accounts',
                'eth_requestAccounts'
            ];
            
            // Check if this method requires wallet to be unlocked
            const requiresWallet = methodsRequiringWallet.some(m => method.startsWith(m));
            
            // Ensure provider is available
            ensureProvider();
            
            // If provider exists and either wallet is unlocked or method doesn't require wallet
            if (provider && (!requiresWallet || globalWalletUnlocked)) {
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
                                code: error.code || -32601, 
                                message: error.message || `Method not supported: ${method}` 
                            }
                        });
                    }
                })();
                return true;
            }
            
            if (requiresWallet && !globalWalletUnlocked) {
                sendResponse({ 
                    id, 
                    error: { 
                        code: 4100, 
                        message: 'Wallet is locked. Please unlock your wallet first.' 
                    }
                });
            } else {
                sendResponse({ 
                    id, 
                    error: { 
                        code: -32601, 
                        message: `Method not found or not supported: ${method}` 
                    }
                });
            }
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
        case "reportActivity":
            // Update activity timestamp to prevent auto-lock
            console.log("Activity reported from UI");
            resetSessionTimeout();
            
            // Update session storage with new activity time
            if (chrome.storage.session && globalWalletUnlocked) {
              chrome.storage.session.set({
                walletUnlocked: true,
                walletAddress: walletData?.address,
                lastActivity: Date.now()
              }).catch(err => console.error("Error updating activity in session storage:", err));
            }
            
            sendResponse({ status: "success" });
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
            isLoggedIn: globalWalletUnlocked
          });
          break;

        case "loginWallet":
          console.log("Processing loginWallet message...");
          globalWalletUnlocked = true; // Wallet is unlocked globally
          walletData = {
            address: message.address,
            lastLogin: new Date().toISOString()
          };
          // Initialize keyring service with password instead of storing key
          if (!keyringService) {
              keyringService = new KeyringService();
          }
          await keyringService.initialize(message.password);
          
          // Add the current wallet to keyring if we have encryptedWallet
          if (message.encryptedWallet) {
              await keyringService.addEncryptedWallet(message.encryptedWallet, message.password);
          }
          
          // Initialize vault storage with same password
          if (!vaultStorage) {
              vaultStorage = new VaultStorage();
          }
          const vaultInitialized = await vaultStorage.initialize(message.password);
          if (!vaultInitialized) {
              console.warn('Failed to initialize vault storage');
          }

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


          // Key management now handled by keyring service
          if (keyringService) {
              console.log("Keyring service initialized successfully");
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
          break;
          
        case "getSessionInfo":
          console.log("Processing getSessionInfo message...");
          // Return current state - crucial for popup initialization
          sendResponse({
            isLoggedIn: globalWalletUnlocked, // Reflects if background *thinks* it's logged in
            walletData: walletData // Contains address etc. if available
          });
          break;
          
        case "getOriginSessions":
          console.log("Processing getOriginSessions message...");
          // Return all active per-origin sessions
          const activeSessions = sessionManager.getActiveSessions();
          sendResponse({
            status: "success",
            sessions: activeSessions,
            globalUnlocked: globalWalletUnlocked
          });
          break;
          
        case "revokeOriginPermission":
          console.log("Processing revokeOriginPermission message...");
          if (message.origin && message.permission) {
            sessionManager.revokePermission(message.origin, message.permission);
            sendResponse({
              status: "success",
              message: `Permission ${message.permission} revoked for ${message.origin}`
            });
          } else {
            sendResponse({
              status: "error",
              message: "Origin and permission required"
            });
          }
          break;
          
        case "endOriginSession":
          console.log("Processing endOriginSession message...");
          if (message.origin) {
            sessionManager.endSession(message.origin);
            // Also remove from connected sites
            await removeConnectedSite(message.origin);
            sendResponse({
              status: "success",
              message: `Session ended for ${message.origin}`
            });
          } else {
            sendResponse({
              status: "error",
              message: "Origin required"
            });
          }
          break;
          
        case "vaultStore":
          console.log("Processing vaultStore message...");
          if (!vaultStorage || !vaultStorage.isUnlocked) {
            sendResponse({
              status: "error",
              message: "Vault is locked"
            });
            break;
          }
          
          try {
            const success = await vaultStorage.store(
              message.category,
              message.key,
              message.data
            );
            sendResponse({
              status: success ? "success" : "error",
              message: success ? "Data stored in vault" : "Failed to store data"
            });
          } catch (error) {
            sendResponse({
              status: "error",
              message: error.message
            });
          }
          break;
          
        case "vaultRetrieve":
          console.log("Processing vaultRetrieve message...");
          if (!vaultStorage || !vaultStorage.isUnlocked) {
            sendResponse({
              status: "error",
              message: "Vault is locked"
            });
            break;
          }
          
          try {
            const data = await vaultStorage.retrieve(
              message.category,
              message.key
            );
            sendResponse({
              status: "success",
              data: data
            });
          } catch (error) {
            sendResponse({
              status: "error",
              message: error.message
            });
          }
          break;
          
        case "vaultList":
          console.log("Processing vaultList message...");
          if (!vaultStorage || !vaultStorage.isUnlocked) {
            sendResponse({
              status: "error",
              message: "Vault is locked"
            });
            break;
          }
          
          try {
            const keys = await vaultStorage.listKeys(message.category);
            sendResponse({
              status: "success",
              keys: keys
            });
          } catch (error) {
            sendResponse({
              status: "error",
              message: error.message
            });
          }
          break;
          
        case "vaultExport":
          console.log("Processing vaultExport message...");
          if (!vaultStorage || !vaultStorage.isUnlocked) {
            sendResponse({
              status: "error",
              message: "Vault is locked"
            });
            break;
          }
          
          try {
            const exportData = await vaultStorage.export();
            sendResponse({
              status: "success",
              export: exportData
            });
          } catch (error) {
            sendResponse({
              status: "error",
              message: error.message
            });
          }
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
            globalWalletUnlocked = true;
            walletData = {
              address: wallet.address,
              lastLogin: new Date().toISOString()
            };
            // Initialize keyring service instead of storing private key
            if (!keyringService) {
                keyringService = new KeyringService();
            }
            await keyringService.initialize(message.password);
            
            // Add the wallet to keyring
            await keyringService.addEncryptedWallet(encryptedWallet, message.password);
            
            // Initialize vault storage
            if (!vaultStorage) {
                vaultStorage = new VaultStorage();
            }
            const vaultUnlocked = await vaultStorage.initialize(message.password);
            if (!vaultUnlocked) {
                console.warn('Failed to unlock vault storage');
            }
            
            // Clear the wallet object immediately
            if (wallet._signingKey) {
                wallet._signingKey = null;
            }
            
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
            if (globalWalletUnlocked && walletData && walletData.address) {
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
          // Session must be active but we don't return keys anymore
          if (globalWalletUnlocked) {
              // Return success without exposing any keys
              sendResponse({ success: true, message: "Session active" });
          } else {
              sendResponse({ success: false, message: "Session expired. Please login again." });
          }
          break;

        // Handle updates to the session timeout duration from settings
        case "updateSessionTimeout":
            console.log("Processing updateSessionTimeout message...");
            if (message.sessionTimeout && typeof message.sessionTimeout === 'number' && message.sessionTimeout > 0) {
                sessionTimeoutDuration = message.sessionTimeout;
                console.log(`Session timeout duration updated to ${sessionTimeoutDuration / 60000} minutes.`);
                // If a session is currently active, reset the timer with the new duration
                if (globalWalletUnlocked) {
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
              const shouldApprove = approved || (request.isReconnection && globalWalletUnlocked && walletData && walletData.address);
              
              if (shouldApprove && walletData && walletData.address) {
                // Approved or auto-approved reconnection - store/update the connected site and return the address
                // Removed log that exposed wallet address and origin
                storeConnectedSite(request.origin, walletData.address);
                
                // Get the stored callback and send approval
                const callback = pendingConnectionCallbacks.get(requestId);
                if (callback) {
                  try {
                    callback({
                      id: requestId,
                      result: [walletData.address]
                    });
                  } catch (e) {
                    console.error('Error sending approval response:', e);
                  }
                  pendingConnectionCallbacks.delete(requestId);
                }
                
                // Also send message to tabs for compatibility
                const responseChannel = `response_${requestId}_${Date.now()}`;
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
                // Get the stored callback and send rejection
                const callback = pendingConnectionCallbacks.get(requestId);
                if (callback) {
                  try {
                    callback({
                      id: requestId,
                      error: { code: 4001, message: 'User rejected the request.' }
                    });
                  } catch (e) {
                    console.error('Error sending rejection response:', e);
                  }
                  pendingConnectionCallbacks.delete(requestId);
                }
                
                // Also send rejection to all tabs for compatibility
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
          
          if (!confirmTxRequest) {
            sendResponse({ success: false, error: 'Request not found' });
            break;
          }
          
          // Handle transaction confirmation
          (async () => {
              try {
                if (!globalWalletUnlocked) {
                  throw new Error('Wallet not unlocked');
                }
                
                // Grant permission for this origin if first time (skip for wallet-initiated)
                if (confirmTxRequest.origin !== 'Heart Wallet' && 
                    !sessionManager.hasPermission(confirmTxRequest.origin, PERMISSIONS.SEND_TRANSACTION)) {
                  sessionManager.addPermission(confirmTxRequest.origin, PERMISSIONS.SEND_TRANSACTION);
                }
                
                // Use keyring service to sign and send
                if (!keyringService) {
                  throw new Error('Keyring service not initialized');
                }
                
                // Prepare transaction with all necessary fields
                const txToSign = {
                  ...confirmTxRequest.params,
                  from: message.transaction.from || confirmTxRequest.params.from,
                  chainId: message.transaction.chainId || confirmTxRequest.params.chainId || currentChainId
                };
                
                // Validate chainId matches current network
                const txChainId = parseInt(txToSign.chainId);
                if (txChainId !== currentChainId) {
                  sendResponse({
                    success: false,
                    error: `Network mismatch: Transaction is for chain ${txChainId} but wallet is on chain ${currentChainId}. Please switch networks.`
                  });
                  return true;
                }
                
                // Get the current nonce if not provided
                if (!txToSign.nonce && txToSign.nonce !== 0) {
                  const nonce = await provider.getTransactionCount(txToSign.from, 'latest');
                  const pendingNonce = await provider.getTransactionCount(txToSign.from, 'pending');
                  
                  // Log if there might be stuck transactions
                  if (pendingNonce > nonce) {
                    console.warn(`Possible stuck transactions detected! Latest nonce: ${nonce}, Pending nonce: ${pendingNonce}`);
                  }
                  
                  txToSign.nonce = nonce;
                }
                
                // Estimate gas if not provided
                if (!txToSign.gasLimit && !txToSign.gas) {
                  const gasEstimate = await provider.estimateGas(txToSign);
                  txToSign.gasLimit = gasEstimate;
                }
                
                // Get gas price if not provided
                if (!txToSign.gasPrice && !txToSign.maxFeePerGas) {
                  const feeData = await provider.getFeeData();
                  txToSign.gasPrice = feeData.gasPrice;
                }
                
                // First sign the transaction
                const signedTx = await keyringService.signTransaction(
                  txToSign.from,
                  txToSign
                );
                
                // Then send it via provider
                const txResponse = await provider.broadcastTransaction(signedTx);
                
                // Send success response to dApp if it has a callback
                if (confirmTxRequest.sendResponse) {
                  confirmTxRequest.sendResponse({
                    id: confirmTxRequest.id,
                    result: txResponse.hash
                  });
                }
                
                // Clean up
                activeTransactionRequests.delete(message.requestId);
                
                // Show notification for transaction sent
                chrome.notifications.create(`tx_sent_${txResponse.hash}`, {
                  type: 'basic',
                  iconUrl: chrome.runtime.getURL('images/icon128.png'),
                  title: 'Transaction Sent',
                  message: `Transaction ${txResponse.hash.substring(0, 10)}... has been sent to the network`,
                  priority: 2
                });
                
                // Send message to popup for UI update
                chrome.runtime.sendMessage({
                  type: 'transaction_update',
                  txHash: txResponse.hash,
                  status: 'sent',
                  from: txToSign.from,
                  origin: confirmTxRequest.origin
                }).catch(() => {
                  // Popup might be closed, ignore error
                });
                
                // For wallet-initiated transactions, send confirmation result
                if (confirmTxRequest.origin === 'Heart Wallet') {
                  chrome.runtime.sendMessage({
                    action: 'transactionConfirmationResult',
                    requestId: message.requestId,
                    confirmed: true,
                    txParams: message.transaction,
                    txHash: txResponse.hash
                  }).catch(() => {
                    // App might be closed, ignore error
                  });
                }
                
                // Monitor transaction for completion
                monitorTransaction(txResponse.hash, txToSign.from, confirmTxRequest.origin);
                
                sendResponse({ success: true, txHash: txResponse.hash });
              } catch (error) {
                console.error('Error sending transaction:', error);
                
                // Send error response to dApp if it has a callback
                if (confirmTxRequest && confirmTxRequest.sendResponse) {
                  confirmTxRequest.sendResponse({
                    id: confirmTxRequest.id,
                    error: { code: -32603, message: error.message }
                  });
                }
                
                // Show error notification
                chrome.notifications.create('tx_error', {
                  type: 'basic',
                  iconUrl: chrome.runtime.getURL('images/icon128.png'),
                  title: 'Transaction Failed',
                  message: `Failed to send transaction: ${error.message}`,
                  priority: 2
                });
                
                sendResponse({ success: false, error: error.message });
              }
            })();
          return true; // Async response
          
        case 'rejectTransaction':
          console.log('Processing rejectTransaction:', message.requestId);
          const rejectTxRequest = activeTransactionRequests.get(message.requestId);
          if (rejectTxRequest && rejectTxRequest.sendResponse) {
            rejectTxRequest.sendResponse({
              id: rejectTxRequest.id,
              error: { code: 4001, message: 'User rejected the transaction' }
            });
            activeTransactionRequests.delete(message.requestId);
          } else if (rejectTxRequest && rejectTxRequest.origin === 'Heart Wallet') {
            // For wallet-initiated transactions, send rejection result
            chrome.runtime.sendMessage({
              action: 'transactionConfirmationResult',
              requestId: message.requestId,
              confirmed: false,
              error: 'User rejected the transaction'
            }).catch(() => {
              // App might be closed, ignore error
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
                if (!globalWalletUnlocked) {
                  throw new Error('Wallet not unlocked');
                }
                
                // Grant permission for this origin if needed
                if (confirmSignRequest.needsPermission) {
                  sessionManager.addPermission(confirmSignRequest.origin, PERMISSIONS.SIGN_MESSAGE);
                }
                
                // Use keyring service to sign
                if (!keyringService) {
                  throw new Error('Keyring service not initialized');
                }
                
                const signature = await keyringService.signMessage(
                  confirmSignRequest.address,
                  confirmSignRequest.message
                );
                
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
                if (!globalWalletUnlocked) {
                  throw new Error('Wallet not unlocked');
                }
                
                // Use keyring service to sign typed data
                if (!keyringService) {
                  throw new Error('Keyring service not initialized');
                }
                
                const typedData = typeof confirmTypedRequest.typedData === 'string' ?
                  JSON.parse(confirmTypedRequest.typedData) : confirmTypedRequest.typedData;
                
                // For now, we need to get the wallet from keyring to sign typed data
                // This is a temporary solution until keyring service supports typed data signing
                const wallet = await keyringService.getWalletForSigning(confirmTypedRequest.address);
                const signature = await wallet.signTypedData(
                  typedData.domain,
                  typedData.types,
                  typedData.message
                );
                // Clear wallet after use
                if (wallet._signingKey) {
                  wallet._signingKey = null;
                }
                
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
              const currentProvider = ensureProvider();
              if (!currentProvider) {
                throw new Error('Provider not available');
              }
              const feeData = await currentProvider.getFeeData();
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
              // Ensure provider is initialized
              const currentProvider = ensureProvider();
              if (!currentProvider) {
                throw new Error('Provider not available');
              }
              
              // Create a contract instance to fetch token info
              const tokenContract = new ethers.Contract(
                message.address,
                ['function name() view returns (string)',
                 'function symbol() view returns (string)', 
                 'function decimals() view returns (uint8)'],
                currentProvider
              );
              
              const [name, symbol, decimals] = await Promise.all([
                tokenContract.name(),
                tokenContract.symbol(),
                tokenContract.decimals()
              ]);
              
              sendResponse({
                success: true,
                tokenInfo: { 
                  name: name.toString(), 
                  symbol: symbol.toString(), 
                  decimals: Number(decimals)
                }
              });
            } catch (error) {
              console.error('Error fetching token info:', error);
              sendResponse({ 
                success: false, 
                error: error.message || 'Failed to fetch token info' 
              });
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
          (async () => {
            try {
              if (!globalWalletUnlocked) {
                throw new Error('Wallet not unlocked');
              }
              
              if (!keyringService) {
                throw new Error('Keyring service not initialized');
              }
              
              const provider = new ethers.JsonRpcProvider(networkConfigs[currentChainId].rpcUrl);
              
              // Get the current nonce
              const nonce = await provider.getTransactionCount(walletData.address, 'latest');
              
              // Encode the contract function call
              const contractInterface = new ethers.Interface(message.abi || []);
              const data = contractInterface.encodeFunctionData(
                message.functionName, 
                message.params || []
              );
              
              // Prepare transaction
              const transaction = {
                to: message.contractAddress,
                from: walletData.address,
                data: data,
                value: message.value && message.value !== '0' ? 
                  ethers.parseEther(message.value).toString() : '0x0',
                chainId: message.chainId || currentChainId,
                nonce: nonce
              };
              
              // Validate chainId matches current network
              const txChainId = parseInt(transaction.chainId);
              if (txChainId !== currentChainId) {
                throw new Error(`Network mismatch: Transaction is for chain ${txChainId} but wallet is on chain ${currentChainId}. Please switch networks.`);
              }
              
              // Estimate gas
              const gasEstimate = await provider.estimateGas(transaction);
              transaction.gasLimit = gasEstimate;
              
              // Get current gas price
              const feeData = await provider.getFeeData();
              transaction.gasPrice = feeData.gasPrice;
              
              // Sign transaction using keyring service
              const signedTx = await keyringService.signTransaction(
                walletData.address,
                transaction
              );
              
              // Send the signed transaction
              const txResponse = await provider.broadcastTransaction(signedTx);
              
              sendResponse({ success: true, hash: txResponse.hash });
            } catch (error) {
              console.error('Error calling write function:', error);
              sendResponse({ success: false, error: error.message });
            }
          })();
          return true; // Async response
          
        case "exportPrivateKey":
          console.log("Processing exportPrivateKey request...");
          (async () => {
            try {
              // Verify password
              if (!message.password) {
                throw new Error('Password required for private key export');
              }
              
              // Verify wallet ID
              if (!message.walletId) {
                throw new Error('Wallet ID required for private key export');
              }
              
              // Get encrypted wallet data for the specified wallet
              const walletData = await new Promise(resolve => {
                chrome.storage.local.get([message.walletId], result => {
                  resolve(result[message.walletId]);
                });
              });
              
              if (!walletData) {
                throw new Error('Wallet data not found');
              }
              
              // Try to decrypt with provided password
              const wallet = await ethers.Wallet.fromEncryptedJson(walletData, message.password);
              const privateKey = wallet.privateKey;
              
              // Clear wallet immediately
              if (wallet._signingKey) {
                wallet._signingKey = null;
              }
              
              sendResponse({ success: true, privateKey: privateKey });
            } catch (error) {
              console.error('Error exporting private key:', error);
              if (error.message.includes('invalid password')) {
                sendResponse({ success: false, error: 'Invalid password' });
              } else {
                sendResponse({ success: false, error: error.message });
              }
            }
          })();
          return true; // Async response
          
        case 'prepareTransactionConfirmation':
          console.log('Processing prepareTransactionConfirmation:', message);
          // Store transaction request for confirmation popup
          const walletTxRequest = {
            requestId: message.requestId,
            id: message.requestId,
            params: message.txParams,
            type: message.type,
            origin: message.origin,
            timestamp: Date.now(),
            validation: { valid: true, riskScore: 0 }, // No special validation for wallet-initiated transfers
            simulation: null
          };
          
          activeTransactionRequests.set(message.requestId, walletTxRequest);
          
          sendResponse({ success: true });
          break;
          
        case "sendTransaction":
          // This case is deprecated - transactions are sent via confirmTransaction
          console.log("sendTransaction called but should use confirmTransaction instead");
          sendResponse({ success: false, error: 'Please use transaction confirmation flow' });
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

// Track response callbacks for pending connection requests
const pendingConnectionCallbacks = new Map();

// Function to create a reconnection request (for previously connected sites)
function createReconnectionRequest(requestId, tab, sendResponseCallback, siteData) {
  if (!tab || !tab.url) {
    console.error('Background: Cannot create reconnection request - no tab information');
    sendResponseCallback({
      id: requestId,
      error: { code: -32603, message: 'Invalid request context - no tab information' }
    });
    return;
  }
  
  const origin = new URL(tab.url).origin;
  console.log(`Background: Creating reconnection request for origin: ${origin}, requestId: ${requestId}, tab:`, tab);
  
  // Check if there's already an active connection request for this origin
  const existingRequest = activeConnectionRequests.get(origin);
  if (existingRequest) {
    // If the request is less than 2 seconds old, don't open a new popup
    const now = Date.now();
    if (now - existingRequest.timestamp < 2000) {
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
  
  // Store the callback in memory (can't be serialized to storage)
  pendingConnectionCallbacks.set(requestId, sendResponseCallback);
  
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
  if (!tab || !tab.url) {
    console.error('Background: Cannot create connection request - no tab information');
    sendResponseCallback({
      id: requestId,
      error: { code: -32603, message: 'Invalid request context - no tab information' }
    });
    return;
  }
  
  const origin = new URL(tab.url).origin;
  console.log(`Background: Creating connection request for origin: ${origin}, requestId: ${requestId}, tab:`, tab);
  
  // Check if there's already an active connection request for this origin
  const existingRequest = activeConnectionRequests.get(origin);
  if (existingRequest) {
    // If the request is less than 2 seconds old, don't open a new popup
    const now = Date.now();
    if (now - existingRequest.timestamp < 2000) {
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
  
  // Store the callback in memory (can't be serialized to storage)
  pendingConnectionCallbacks.set(requestId, sendResponseCallback);
  
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
        
        // Get the stored callback and send rejection
        const callback = pendingConnectionCallbacks.get(requestId);
        if (callback) {
          try {
            callback({
              id: requestId,
              error: { code: 4001, message: 'Request timeout. User failed to approve.' }
            });
          } catch (e) {
            console.log('Unable to respond to timed-out request:', e);
          }
          pendingConnectionCallbacks.delete(requestId);
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
            
            // Send rejection response to the dApp since window was closed without approval
            chrome.storage.local.get('pendingRequests', (data) => {
              const pendingRequests = data.pendingRequests || {};
              const requestId = activeRequest.id;
              
              // Check if this request is still pending (not already responded to)
              if (pendingRequests[requestId]) {
                console.log(`Sending rejection for closed window request ${requestId}`);
                
                // Clean up the pending request
                delete pendingRequests[requestId];
                chrome.storage.local.set({ pendingRequests });
                
                // Get the stored callback and send rejection
                const callback = pendingConnectionCallbacks.get(requestId);
                if (callback) {
                  try {
                    callback({
                      id: requestId,
                      error: { code: 4001, message: 'User rejected the request' }
                    });
                  } catch (e) {
                    console.error('Error sending rejection response:', e);
                  }
                  pendingConnectionCallbacks.delete(requestId);
                }
              }
            });
            
            // Clean up active request tracking
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
    
    if (globalWalletUnlocked && sessionTimeoutDuration > 0) {
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
    if (globalWalletUnlocked && sessionTimeoutDuration > 0) {
        console.log("Resetting session timeout");
        startSessionTimeout();
    }
}

// Show transaction confirmation popup
function showTransactionConfirmationPopup(request, sendResponseCallback) {
  console.log('Background: Opening transaction confirmation popup for request:', request.requestId);
  
  // Store the request for the popup to access
  activeTransactionRequests.set(request.requestId, {
    ...request,
    sendResponse: sendResponseCallback
  });
  
  // Create popup URL with transaction data
  const popupURL = chrome.runtime.getURL('transaction-confirmation.html') + 
    `?requestId=${request.requestId}&origin=${encodeURIComponent(request.origin)}`;
  
  chrome.windows.create({
    url: popupURL,
    type: 'popup',
    width: 450,
    height: 650,
    focused: true
  }, (window) => {
    console.log('Transaction confirmation popup opened:', window.id);
    
    // Set timeout for auto-rejection
    setTimeout(() => {
      if (activeTransactionRequests.has(request.requestId)) {
        activeTransactionRequests.delete(request.requestId);
        try {
          sendResponseCallback({
            id: request.id,  // Use original JSON-RPC ID for response
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

// Map to track pending transactions for status monitoring
const pendingTransactions = new Map();

// Monitor transaction status
async function monitorTransaction(txHash, from, origin) {
  console.log('Monitoring transaction:', txHash);
  
  // Store transaction details
  pendingTransactions.set(txHash, {
    hash: txHash,
    from: from,
    origin: origin,
    timestamp: Date.now(),
    status: 'pending'
  });
  
  // Also store in chrome storage for persistence
  chrome.storage.local.get(['transactionHistory'], (result) => {
    // Handle both old array format and new object format
    let history = result.transactionHistory || {};
    
    // Convert old array format to new object format if needed
    if (Array.isArray(history)) {
      const newHistory = {};
      if (history.length > 0 && from) {
        newHistory[from] = history;
      }
      history = newHistory;
    }
    
    // Get or create array for this address
    const addressHistory = history[from] || [];
    
    // Add new transaction
    addressHistory.unshift({
      hash: txHash,
      from: from,
      to: '', // Will be filled in later
      origin: origin,
      timestamp: Date.now(),
      status: 'pending',
      chainId: currentChainId
    });
    
    // Keep only last 50 transactions for this address
    if (addressHistory.length > 50) {
      addressHistory.length = 50;
    }
    
    // Update history for this address
    history[from] = addressHistory;
    
    chrome.storage.local.set({ transactionHistory: history });
  });
  
  try {
    const currentProvider = ensureProvider();
    if (!currentProvider) {
      throw new Error('Provider not available');
    }
    
    // Poll for transaction receipt
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5 second intervals
    
    const checkTransaction = async () => {
      attempts++;
      
      try {
        const receipt = await currentProvider.getTransactionReceipt(txHash);
        
        if (receipt) {
          // Transaction confirmed
          const success = receipt.status === 1;
          
          // Update pending transaction
          const txData = pendingTransactions.get(txHash);
          if (txData) {
            txData.status = success ? 'confirmed' : 'failed';
            txData.receipt = receipt;
          }
          
          // Show notification
          chrome.notifications.create(`tx_confirmed_${txHash}`, {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('images/icon128.png'),
            title: success ? 'Transaction Confirmed' : 'Transaction Failed',
            message: success 
              ? `Transaction ${txHash.substring(0, 10)}... has been confirmed!`
              : `Transaction ${txHash.substring(0, 10)}... has failed.`,
            priority: 2
          });
          
          // Send message to popup for UI update
          chrome.runtime.sendMessage({
            type: 'transaction_update',
            txHash: txHash,
            status: success ? 'confirmed' : 'failed',
            from: from,
            origin: origin
          }).catch(() => {
            // Popup might be closed, ignore error
          });
          
          // Update storage
          chrome.storage.local.get(['transactionHistory'], (result) => {
            // Handle both old array format and new object format
            let history = result.transactionHistory || {};
            
            // Convert old array format to new object format if needed
            if (Array.isArray(history)) {
              const newHistory = {};
              if (history.length > 0 && from) {
                newHistory[from] = history;
              }
              history = newHistory;
            }
            
            // Update transaction status for the correct address
            if (history[from]) {
              const addressHistory = history[from];
              const txIndex = addressHistory.findIndex(tx => tx.hash === txHash);
              if (txIndex !== -1) {
                addressHistory[txIndex].status = success ? 'confirmed' : 'failed';
                addressHistory[txIndex].blockNumber = receipt.blockNumber;
                history[from] = addressHistory;
                chrome.storage.local.set({ transactionHistory: history });
              }
            }
          });
          
          // Remove from pending after a delay
          setTimeout(() => {
            pendingTransactions.delete(txHash);
          }, 30000); // Keep for 30 seconds after confirmation
          
        } else if (attempts < maxAttempts) {
          // Continue polling
          setTimeout(checkTransaction, 5000); // Check every 5 seconds
        } else {
          // Timeout - transaction took too long
          console.warn('Transaction monitoring timeout for:', txHash);
          
          // Show timeout notification
          chrome.notifications.create(`tx_timeout_${txHash}`, {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('images/icon128.png'),
            title: 'Transaction Timeout',
            message: `Transaction ${txHash.substring(0, 10)}... is taking longer than expected. Check a block explorer for status.`,
            priority: 1
          });
          
          // Update status
          const txData = pendingTransactions.get(txHash);
          if (txData) {
            txData.status = 'timeout';
          }
          
          // Clean up
          setTimeout(() => {
            pendingTransactions.delete(txHash);
          }, 60000); // Remove after 1 minute
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        
        // Retry if we haven't hit max attempts
        if (attempts < maxAttempts) {
          setTimeout(checkTransaction, 5000);
        }
      }
    };
    
    // Start checking after a short delay
    setTimeout(checkTransaction, 3000);
    
  } catch (error) {
    console.error('Error monitoring transaction:', error);
    
    // Show error notification
    chrome.notifications.create(`tx_error_${txHash}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('images/icon128.png'),
      title: 'Transaction Monitoring Error',
      message: `Unable to monitor transaction ${txHash.substring(0, 10)}...`,
      priority: 1
    });
  }
}
