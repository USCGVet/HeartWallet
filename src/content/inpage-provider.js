/**
 * content/inpage-provider.js
 *
 * EIP-1193 compatible Ethereum provider injected into web pages as window.ethereum
 */

class HeartWalletProvider {
  constructor() {
    this.isHeartWallet = true;
    this.isMetaMask = true; // For compatibility with dApps that check for MetaMask
    this._selectedAddress = null;
    this._chainId = null;
    this._isConnected = false;
    this._networkVersion = null;

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
      window.postMessage({
        target: 'heartwallet-contentscript',
        type: 'WALLET_REQUEST',
        requestId,
        method,
        params
      }, '*');

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

  // Provider injected

  // Announce to the page that the provider is ready
  window.dispatchEvent(new Event('ethereum#initialized'));
} else {
  console.warn('⚠️ window.ethereum already exists, HeartWallet not injected');
}
