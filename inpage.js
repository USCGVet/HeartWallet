// This script is injected into the page context to provide window.ethereum.

class HeartWalletProvider {
    constructor() {
        this.isHeartWallet = true; // Identify our provider
        this._listeners = new Map();
        this._nextRequestId = 1;
        this._pendingRequests = new Map();

        // Listen for responses relayed from the background script
        window.addEventListener('message', (event) => {
            if (event.source === window && event.data && event.data.target === 'inpage' && event.data.responseFor === 'heartwallet') {
                const { id, error, result } = event.data.payload;
                const pending = this._pendingRequests.get(id);
                if (pending) {
                    this._pendingRequests.delete(id);
                    if (error) {
                        console.debug('HeartWallet: Received error response:', error);
                        
                        // Special handling for connection errors
                        if (error.code === 4001 && pending.method === 'eth_requestAccounts' && 
                           (error.message.includes('checking your connection') || error.message.includes('try again'))) {
                            // For connection requests with a temporary error, re-try after a delay
                            console.log('HeartWallet: Connection in progress, retrying request...');
                            setTimeout(() => {
                                this.request({ method: 'eth_requestAccounts' })
                                    .then(pending.resolve)
                                    .catch(pending.reject);
                            }, 1500);
                            return;
                        }
                        
                        pending.reject(new Error(error.message || 'Request failed'));
                    } else {
                        console.debug('HeartWallet: Received successful response:', result);
                        pending.resolve(result);
                    }
                } else {
                    console.debug('HeartWallet: Received response for unknown request id:', id);
                }
            }
            
            // Handle events pushed from background (like accountsChanged, chainChanged)
            if (event.source === window && event.data && event.data.target === 'inpage' && event.data.eventFor === 'heartwallet') {
                 const { eventName, params } = event.data.payload;
                 this.emit(eventName, params);
            }
        });

        console.log('HeartWallet provider injected.');
    }

    // --- EIP-1193 Methods ---

    async request({ method, params }) {
        console.debug(`HeartWallet Inpage: Request received - Method: ${method}, Params:`, params);
        
        // Special handling for eth_requestAccounts - provide more feedback
        if (method === 'eth_requestAccounts') {
            console.log('HeartWallet Inpage: eth_requestAccounts requested by dApp.');
        }
        
        const id = this._nextRequestId++;
        const payload = { id, method, params };
        
        return new Promise((resolve, reject) => {
            // Store method in the request object for easier debugging
            this._pendingRequests.set(id, { 
                resolve, 
                reject, 
                timestamp: Date.now(),
                method 
            });

            // Send request to content script, which relays to background
            window.postMessage({
                target: 'contentscript', // Target the content script
                requestFor: 'heartwallet',
                payload: payload
            }, window.location.origin);

            // Set timeout for requests to avoid hanging dApps
            // Use a longer timeout for connection requests
            const isConnectionRequest = method === 'eth_requestAccounts' || method === 'eth_accounts';
            const timeout = isConnectionRequest ? 120000 : 30000; // 2 minutes for connections
            
            setTimeout(() => {
                if (this._pendingRequests.has(id)) {
                    const pendingRequest = this._pendingRequests.get(id);
                    this._pendingRequests.delete(id);
                    console.warn(`HeartWallet: Request ${id} (${pendingRequest.method}) timed out after ${(Date.now() - pendingRequest.timestamp)/1000}s`);
                    reject(new Error(`Request timed out after ${timeout/1000} seconds: ${method}`));
                }
            }, timeout);
        });
    }

    // --- Event Emitter Methods ---

    on(eventName, listener) {
        if (!this._listeners.has(eventName)) {
            this._listeners.set(eventName, []);
        }
        this._listeners.get(eventName).push(listener);
        // TODO: Notify background script if it needs to know about listeners? (e.g., for accountsChanged)
        if (eventName === 'accountsChanged') {
             window.postMessage({ target: 'contentscript', requestFor: 'heartwallet', payload: { method: '_heartWallet_listeningAccountsChanged' } }, window.location.origin);
        }
         if (eventName === 'chainChanged') {
             window.postMessage({ target: 'contentscript', requestFor: 'heartwallet', payload: { method: '_heartWallet_listeningChainChanged' } }, window.location.origin);
        }
    }

    removeListener(eventName, listener) {
        if (this._listeners.has(eventName)) {
            const eventListeners = this._listeners.get(eventName);
            const index = eventListeners.indexOf(listener);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
        // TODO: Notify background if listeners are removed?
    }

    emit(eventName, ...args) {
        if (this._listeners.has(eventName)) {
            this._listeners.get(eventName).forEach(listener => {
                try {
                    listener(...args);
                } catch (err) {
                    console.error(`HeartWallet: Error in listener for ${eventName}:`, err);
                }
            });
        }
    }

    // --- Deprecated / Non-Standard ---
    // Some dApps might still use these, provide basic implementations

    isConnected() {
        // In MV3, the connection is effectively always "on" from the dApp's perspective,
        // but the ability to perform actions depends on the background script state.
        // Returning true is generally expected.
        return true;
    }

    // Deprecated: Use request({ method: 'eth_requestAccounts' })
    async enable() {
        console.warn('HeartWallet: enable() is deprecated. Use request({ method: "eth_requestAccounts" }) instead.');
        return this.request({ method: 'eth_requestAccounts' });
    }

    // Deprecated: Use request({ method: 'eth_sendTransaction', params: [...] })
    async send(methodOrPayload, paramsOrCallback) {
         console.warn('HeartWallet: send() is deprecated. Use request() instead.');
         if (typeof methodOrPayload === 'string') {
             // EIP-1193 style send(method, params)
             return this.request({ method: methodOrPayload, params: paramsOrCallback });
         } else if (typeof methodOrPayload === 'object' && methodOrPayload !== null) {
             // Legacy JSON-RPC style send(payload, callback)
             const { method, params, id } = methodOrPayload;
             const promise = this.request({ method, params });
             if (typeof paramsOrCallback === 'function') {
                 // Handle legacy callback
                 promise.then(result => paramsOrCallback(null, { id, jsonrpc: '2.0', result }))
                        .catch(error => paramsOrCallback(error, null));
                 return; // Don't return promise if callback is used
             }
             return promise;
         }
         return Promise.reject(new Error('Invalid arguments to send()'));
    }

     // Deprecated: Use request()
    async sendAsync(payload, callback) {
        console.warn('HeartWallet: sendAsync() is deprecated. Use request() instead.');
        const { method, params, id } = payload;
        this.request({ method, params })
            .then(result => callback(null, { id, jsonrpc: '2.0', result }))
            .catch(error => callback(error, null));
    }
}

// Inject the provider
if (typeof window.ethereum === 'undefined') {
    window.ethereum = new HeartWalletProvider();
    console.log("HeartWallet provider assigned to window.ethereum");

    // Optional: Dispatch an event to notify dApps that the provider is ready
    // Some dApps listen for this instead of just checking window.ethereum periodically
    window.dispatchEvent(new Event('ethereum#initialized'));

} else {
    // Handle cases where another provider might already exist (e.g., MetaMask)
    // Simple approach: Don't overwrite, just log.
    // Advanced: Could create a multi-provider EIP-6963 setup.
    if (!window.ethereum.isHeartWallet) {
         console.warn("HeartWallet: Another Ethereum provider (window.ethereum) already exists. HeartWallet provider not injected to avoid conflict.");
         // TODO: Implement EIP-6963 for multi-provider discovery if desired.
    } else {
         console.debug("HeartWallet: window.ethereum already seems to be our provider.");
    }
}
