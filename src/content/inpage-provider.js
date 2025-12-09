/**
 * content/inpage-provider.js
 *
 * EIP-1193 compatible Ethereum provider injected into web pages as window.ethereum
 */

class HeartWalletProvider {
  constructor() {
    this.isHeartWallet = true;
    this.isMetaMask = true; // For compatibility with dApps that check for MetaMask
    this.isRabby = false; // Set to true if you want to appear as Rabby instead
    this._selectedAddress = null;
    this._chainId = null;
    this._isConnected = false;
    this._networkVersion = null;

    // MetaMask-specific properties for better compatibility
    this._metamask = {
      isUnlocked: () => Promise.resolve(true)
    };

    // Event emitter
    this._events = {};
    this._nextRequestId = 1;
    this._pendingRequests = new Map();

    // Listen for responses from content script
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (event.data.target !== 'heartwallet-inpage') return;

      this._handleResponse(event.data);
    });

    // Provider initialized
  }

  // EIP-1193 standard method
  async request({ method, params = [] }) {
    // Provider request

    // Create promise for this request
    return new Promise((resolve, reject) => {
      const requestId = this._nextRequestId++;

      // Store promise callbacks
      this._pendingRequests.set(requestId, { resolve, reject });

      // Send message to content script
      // SECURITY: Use specific origin to prevent message interception by malicious scripts
      window.postMessage({
        target: 'heartwallet-contentscript',
        type: 'WALLET_REQUEST',
        requestId,
        method,
        params
      }, window.location.origin);

      // Timeout after 60 seconds
      setTimeout(() => {
        if (this._pendingRequests.has(requestId)) {
          this._pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 60000);
    });
  }

  // Handle response from content script
  _handleResponse(data) {
    const { requestId, result, error } = data;

    if (!this._pendingRequests.has(requestId)) {
      return;
    }

    const { resolve, reject } = this._pendingRequests.get(requestId);
    this._pendingRequests.delete(requestId);

    if (error) {
      reject(new Error(error.message || error));
    } else {
      // Update internal state based on method
      if (data.method === 'eth_requestAccounts' || data.method === 'eth_accounts') {
        if (result && result.length > 0) {
          const newAddress = result[0];
          if (this._selectedAddress !== newAddress) {
            this._selectedAddress = newAddress;
            this._isConnected = true;
            this.emit('accountsChanged', result);
            this.emit('connect', { chainId: this._chainId });
          }
        }
      } else if (data.method === 'eth_chainId') {
        if (result && result !== this._chainId) {
          this._chainId = result;
          this._networkVersion = parseInt(result, 16).toString();
          this.emit('chainChanged', result);
        }
      } else if (data.method === 'wallet_switchEthereumChain') {
        // After successful chain switch, query the new chain ID
        // This will trigger another request that updates _chainId and emits chainChanged
        if (result === null) {
          // Resolve the switch request first
          resolve(result);
          // Then query the new chain to update state and emit event
          this.request({ method: 'eth_chainId' }).catch(err => {
            console.error('Failed to query chain after switch:', err);
          });
          return; // Early return since we already resolved
        }
      }

      resolve(result);
    }
  }

  // Legacy enable method (for older dApps)
  async enable() {
    return this.request({ method: 'eth_requestAccounts' });
  }

  // Legacy send method
  async send(methodOrPayload, paramsOrCallback) {
    if (typeof methodOrPayload === 'string') {
      return this.request({
        method: methodOrPayload,
        params: paramsOrCallback || []
      });
    }

    // Legacy sendAsync format
    if (typeof paramsOrCallback === 'function') {
      this.sendAsync(methodOrPayload, paramsOrCallback);
      return;
    }

    return this.request(methodOrPayload);
  }

  // Legacy sendAsync method
  sendAsync(payload, callback) {
    this.request(payload)
      .then(result => callback(null, {
        id: payload.id,
        jsonrpc: '2.0',
        result
      }))
      .catch(error => callback(error, null));
  }

  // Event emitter methods
  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(callback);
  }

  once(event, callback) {
    const wrappedCallback = (...args) => {
      callback(...args);
      this.removeListener(event, wrappedCallback);
    };
    this.on(event, wrappedCallback);
  }

  removeListener(event, callback) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(cb => cb !== callback);
  }

  removeAllListeners(event) {
    if (event) {
      delete this._events[event];
    } else {
      this._events = {};
    }
  }

  emit(event, ...args) {
    if (!this._events[event]) return;
    this._events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }

  // Connection status
  isConnected() {
    return this._isConnected;
  }

  // Getters for compatibility
  get selectedAddress() {
    return this._selectedAddress;
  }

  get chainId() {
    return this._chainId;
  }

  get networkVersion() {
    return this._networkVersion;
  }
}

// Inject provider into window
if (!window.ethereum) {
  window.ethereum = new HeartWalletProvider();

  // Also set window.web3 for legacy dApps
  window.web3 = {
    currentProvider: window.ethereum
  };

  // EIP-6963: Announce provider for modern wallet detection (Web3Modal, WalletConnect, etc.)
  // Generate cryptographically secure UUID using Web Crypto API
  const generateSecureUUID = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    // Set version (4) and variant bits per RFC 4122
    array[6] = (array[6] & 0x0f) | 0x40;
    array[8] = (array[8] & 0x3f) | 0x80;
    const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };

  const providerUUID = generateSecureUUID();

  const announceProvider = () => {
    const info = {
      uuid: providerUUID,
      name: 'HeartWallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0UwMDAzNyIvPgogIDxwYXRoIGQ9Ik0xNiA5QzEyLjY4NiA5IDEwIDExLjY4NiAxMCAxNUMxMCAyMC41MjMgMTYgMjYgMTYgMjZDMTYgMjYgMjIgMjAuNTIzIDIyIDE1QzIyIDExLjY4NiAxOS4zMTQgOSAxNiA5WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
      rdns: 'com.heartwallet'
    };

    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({ info, provider: window.ethereum })
      })
    );
  };

  // Announce immediately
  announceProvider();

  // Listen for discovery requests from dApps
  window.addEventListener('eip6963:requestProvider', (event) => {
    announceProvider();
  });

  // Legacy announcement events
  window.dispatchEvent(new Event('ethereum#initialized'));
} else {
  console.warn('⚠️ window.ethereum already exists, HeartWallet not injected');

  // Even if window.ethereum exists, try to announce via EIP-6963 as an alternative provider
  // Generate cryptographically secure UUID using Web Crypto API
  const generateSecureUUID = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    // Set version (4) and variant bits per RFC 4122
    array[6] = (array[6] & 0x0f) | 0x40;
    array[8] = (array[8] & 0x3f) | 0x80;
    const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };

  const heartWalletProvider = new HeartWalletProvider();
  const altProviderUUID = generateSecureUUID();

  const announceAlternativeProvider = () => {
    const info = {
      uuid: altProviderUUID,
      name: 'HeartWallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0UwMDAzNyIvPgogIDxwYXRoIGQ9Ik0xNiA5QzEyLjY4NiA5IDEwIDExLjY4NiAxMCAxNUMxMCAyMC41MjMgMTYgMjYgMTYgMjZDMTYgMjYgMjIgMjAuNTIzIDIyIDE1QzIyIDExLjY4NiAxOS4zMTQgOSAxNiA5WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
      rdns: 'com.heartwallet'
    };

    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({ info, provider: heartWalletProvider })
      })
    );
  };

  announceAlternativeProvider();

  window.addEventListener('eip6963:requestProvider', () => {
    announceAlternativeProvider();
  });
}
