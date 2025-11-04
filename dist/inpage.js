class HeartWalletProvider {
  constructor() {
    this.isHeartWallet = true;
    this.isMetaMask = true;
    this._selectedAddress = null;
    this._chainId = null;
    this._isConnected = false;
    this._networkVersion = null;
    this._events = {};
    this._nextRequestId = 1;
    this._pendingRequests = /* @__PURE__ */ new Map();
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      if (event.data.target !== "heartwallet-inpage") return;
      this._handleResponse(event.data);
    });
  }
  // EIP-1193 standard method
  async request({ method, params = [] }) {
    return new Promise((resolve, reject) => {
      const requestId = this._nextRequestId++;
      this._pendingRequests.set(requestId, { resolve, reject });
      window.postMessage({
        target: "heartwallet-contentscript",
        type: "WALLET_REQUEST",
        requestId,
        method,
        params
      }, "*");
      setTimeout(() => {
        if (this._pendingRequests.has(requestId)) {
          this._pendingRequests.delete(requestId);
          reject(new Error("Request timeout"));
        }
      }, 6e4);
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
      if (data.method === "eth_requestAccounts" || data.method === "eth_accounts") {
        if (result && result.length > 0) {
          const newAddress = result[0];
          if (this._selectedAddress !== newAddress) {
            this._selectedAddress = newAddress;
            this._isConnected = true;
            this.emit("accountsChanged", result);
            this.emit("connect", { chainId: this._chainId });
          }
        }
      } else if (data.method === "eth_chainId") {
        if (result && result !== this._chainId) {
          this._chainId = result;
          this._networkVersion = parseInt(result, 16).toString();
          this.emit("chainChanged", result);
        }
      } else if (data.method === "wallet_switchEthereumChain") {
        if (result === null) {
          resolve(result);
          this.request({ method: "eth_chainId" }).catch((err) => {
            console.error("Failed to query chain after switch:", err);
          });
          return;
        }
      }
      resolve(result);
    }
  }
  // Legacy enable method (for older dApps)
  async enable() {
    return this.request({ method: "eth_requestAccounts" });
  }
  // Legacy send method
  async send(methodOrPayload, paramsOrCallback) {
    if (typeof methodOrPayload === "string") {
      return this.request({
        method: methodOrPayload,
        params: paramsOrCallback || []
      });
    }
    if (typeof paramsOrCallback === "function") {
      this.sendAsync(methodOrPayload, paramsOrCallback);
      return;
    }
    return this.request(methodOrPayload);
  }
  // Legacy sendAsync method
  sendAsync(payload, callback) {
    this.request(payload).then((result) => callback(null, {
      id: payload.id,
      jsonrpc: "2.0",
      result
    })).catch((error) => callback(error, null));
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
    this._events[event] = this._events[event].filter((cb) => cb !== callback);
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
    this._events[event].forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error("Error in event callback:", error);
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
if (!window.ethereum) {
  window.ethereum = new HeartWalletProvider();
  window.web3 = {
    currentProvider: window.ethereum
  };
  window.dispatchEvent(new Event("ethereum#initialized"));
} else {
  console.warn("⚠️ window.ethereum already exists, HeartWallet not injected");
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wYWdlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvY29udGVudC9pbnBhZ2UtcHJvdmlkZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIGNvbnRlbnQvaW5wYWdlLXByb3ZpZGVyLmpzXHJcbiAqXHJcbiAqIEVJUC0xMTkzIGNvbXBhdGlibGUgRXRoZXJldW0gcHJvdmlkZXIgaW5qZWN0ZWQgaW50byB3ZWIgcGFnZXMgYXMgd2luZG93LmV0aGVyZXVtXHJcbiAqL1xyXG5cclxuY2xhc3MgSGVhcnRXYWxsZXRQcm92aWRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmlzSGVhcnRXYWxsZXQgPSB0cnVlO1xyXG4gICAgdGhpcy5pc01ldGFNYXNrID0gdHJ1ZTsgLy8gRm9yIGNvbXBhdGliaWxpdHkgd2l0aCBkQXBwcyB0aGF0IGNoZWNrIGZvciBNZXRhTWFza1xyXG4gICAgdGhpcy5fc2VsZWN0ZWRBZGRyZXNzID0gbnVsbDtcclxuICAgIHRoaXMuX2NoYWluSWQgPSBudWxsO1xyXG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuX25ldHdvcmtWZXJzaW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBFdmVudCBlbWl0dGVyXHJcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcclxuICAgIHRoaXMuX25leHRSZXF1ZXN0SWQgPSAxO1xyXG4gICAgdGhpcy5fcGVuZGluZ1JlcXVlc3RzID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIC8vIExpc3RlbiBmb3IgcmVzcG9uc2VzIGZyb20gY29udGVudCBzY3JpcHRcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIGlmIChldmVudC5zb3VyY2UgIT09IHdpbmRvdykgcmV0dXJuO1xyXG4gICAgICBpZiAoZXZlbnQuZGF0YS50YXJnZXQgIT09ICdoZWFydHdhbGxldC1pbnBhZ2UnKSByZXR1cm47XHJcblxyXG4gICAgICB0aGlzLl9oYW5kbGVSZXNwb25zZShldmVudC5kYXRhKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFByb3ZpZGVyIGluaXRpYWxpemVkXHJcbiAgfVxyXG5cclxuICAvLyBFSVAtMTE5MyBzdGFuZGFyZCBtZXRob2RcclxuICBhc3luYyByZXF1ZXN0KHsgbWV0aG9kLCBwYXJhbXMgPSBbXSB9KSB7XHJcbiAgICAvLyBQcm92aWRlciByZXF1ZXN0XHJcblxyXG4gICAgLy8gQ3JlYXRlIHByb21pc2UgZm9yIHRoaXMgcmVxdWVzdFxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgY29uc3QgcmVxdWVzdElkID0gdGhpcy5fbmV4dFJlcXVlc3RJZCsrO1xyXG5cclxuICAgICAgLy8gU3RvcmUgcHJvbWlzZSBjYWxsYmFja3NcclxuICAgICAgdGhpcy5fcGVuZGluZ1JlcXVlc3RzLnNldChyZXF1ZXN0SWQsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xyXG5cclxuICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIGNvbnRlbnQgc2NyaXB0XHJcbiAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgdGFyZ2V0OiAnaGVhcnR3YWxsZXQtY29udGVudHNjcmlwdCcsXHJcbiAgICAgICAgdHlwZTogJ1dBTExFVF9SRVFVRVNUJyxcclxuICAgICAgICByZXF1ZXN0SWQsXHJcbiAgICAgICAgbWV0aG9kLFxyXG4gICAgICAgIHBhcmFtc1xyXG4gICAgICB9LCAnKicpO1xyXG5cclxuICAgICAgLy8gVGltZW91dCBhZnRlciA2MCBzZWNvbmRzXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9wZW5kaW5nUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgICAgIHRoaXMuX3BlbmRpbmdSZXF1ZXN0cy5kZWxldGUocmVxdWVzdElkKTtcclxuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZW91dCcpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIDYwMDAwKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHJlc3BvbnNlIGZyb20gY29udGVudCBzY3JpcHRcclxuICBfaGFuZGxlUmVzcG9uc2UoZGF0YSkge1xyXG4gICAgY29uc3QgeyByZXF1ZXN0SWQsIHJlc3VsdCwgZXJyb3IgfSA9IGRhdGE7XHJcblxyXG4gICAgaWYgKCF0aGlzLl9wZW5kaW5nUmVxdWVzdHMuaGFzKHJlcXVlc3RJZCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLl9wZW5kaW5nUmVxdWVzdHMuZ2V0KHJlcXVlc3RJZCk7XHJcbiAgICB0aGlzLl9wZW5kaW5nUmVxdWVzdHMuZGVsZXRlKHJlcXVlc3RJZCk7XHJcblxyXG4gICAgaWYgKGVycm9yKSB7XHJcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSB8fCBlcnJvcikpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVXBkYXRlIGludGVybmFsIHN0YXRlIGJhc2VkIG9uIG1ldGhvZFxyXG4gICAgICBpZiAoZGF0YS5tZXRob2QgPT09ICdldGhfcmVxdWVzdEFjY291bnRzJyB8fCBkYXRhLm1ldGhvZCA9PT0gJ2V0aF9hY2NvdW50cycpIHtcclxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBjb25zdCBuZXdBZGRyZXNzID0gcmVzdWx0WzBdO1xyXG4gICAgICAgICAgaWYgKHRoaXMuX3NlbGVjdGVkQWRkcmVzcyAhPT0gbmV3QWRkcmVzcykge1xyXG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZEFkZHJlc3MgPSBuZXdBZGRyZXNzO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnYWNjb3VudHNDaGFuZ2VkJywgcmVzdWx0KTtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdjb25uZWN0JywgeyBjaGFpbklkOiB0aGlzLl9jaGFpbklkIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChkYXRhLm1ldGhvZCA9PT0gJ2V0aF9jaGFpbklkJykge1xyXG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0ICE9PSB0aGlzLl9jaGFpbklkKSB7XHJcbiAgICAgICAgICB0aGlzLl9jaGFpbklkID0gcmVzdWx0O1xyXG4gICAgICAgICAgdGhpcy5fbmV0d29ya1ZlcnNpb24gPSBwYXJzZUludChyZXN1bHQsIDE2KS50b1N0cmluZygpO1xyXG4gICAgICAgICAgdGhpcy5lbWl0KCdjaGFpbkNoYW5nZWQnLCByZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChkYXRhLm1ldGhvZCA9PT0gJ3dhbGxldF9zd2l0Y2hFdGhlcmV1bUNoYWluJykge1xyXG4gICAgICAgIC8vIEFmdGVyIHN1Y2Nlc3NmdWwgY2hhaW4gc3dpdGNoLCBxdWVyeSB0aGUgbmV3IGNoYWluIElEXHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRyaWdnZXIgYW5vdGhlciByZXF1ZXN0IHRoYXQgdXBkYXRlcyBfY2hhaW5JZCBhbmQgZW1pdHMgY2hhaW5DaGFuZ2VkXHJcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgLy8gUmVzb2x2ZSB0aGUgc3dpdGNoIHJlcXVlc3QgZmlyc3RcclxuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICAgIC8vIFRoZW4gcXVlcnkgdGhlIG5ldyBjaGFpbiB0byB1cGRhdGUgc3RhdGUgYW5kIGVtaXQgZXZlbnRcclxuICAgICAgICAgIHRoaXMucmVxdWVzdCh7IG1ldGhvZDogJ2V0aF9jaGFpbklkJyB9KS5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcXVlcnkgY2hhaW4gYWZ0ZXIgc3dpdGNoOicsIGVycik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybjsgLy8gRWFybHkgcmV0dXJuIHNpbmNlIHdlIGFscmVhZHkgcmVzb2x2ZWRcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIExlZ2FjeSBlbmFibGUgbWV0aG9kIChmb3Igb2xkZXIgZEFwcHMpXHJcbiAgYXN5bmMgZW5hYmxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh7IG1ldGhvZDogJ2V0aF9yZXF1ZXN0QWNjb3VudHMnIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gTGVnYWN5IHNlbmQgbWV0aG9kXHJcbiAgYXN5bmMgc2VuZChtZXRob2RPclBheWxvYWQsIHBhcmFtc09yQ2FsbGJhY2spIHtcclxuICAgIGlmICh0eXBlb2YgbWV0aG9kT3JQYXlsb2FkID09PSAnc3RyaW5nJykge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KHtcclxuICAgICAgICBtZXRob2Q6IG1ldGhvZE9yUGF5bG9hZCxcclxuICAgICAgICBwYXJhbXM6IHBhcmFtc09yQ2FsbGJhY2sgfHwgW11cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGVnYWN5IHNlbmRBc3luYyBmb3JtYXRcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zT3JDYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLnNlbmRBc3luYyhtZXRob2RPclBheWxvYWQsIHBhcmFtc09yQ2FsbGJhY2spO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXRob2RPclBheWxvYWQpO1xyXG4gIH1cclxuXHJcbiAgLy8gTGVnYWN5IHNlbmRBc3luYyBtZXRob2RcclxuICBzZW5kQXN5bmMocGF5bG9hZCwgY2FsbGJhY2spIHtcclxuICAgIHRoaXMucmVxdWVzdChwYXlsb2FkKVxyXG4gICAgICAudGhlbihyZXN1bHQgPT4gY2FsbGJhY2sobnVsbCwge1xyXG4gICAgICAgIGlkOiBwYXlsb2FkLmlkLFxyXG4gICAgICAgIGpzb25ycGM6ICcyLjAnLFxyXG4gICAgICAgIHJlc3VsdFxyXG4gICAgICB9KSlcclxuICAgICAgLmNhdGNoKGVycm9yID0+IGNhbGxiYWNrKGVycm9yLCBudWxsKSk7XHJcbiAgfVxyXG5cclxuICAvLyBFdmVudCBlbWl0dGVyIG1ldGhvZHNcclxuICBvbihldmVudCwgY2FsbGJhY2spIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkge1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZlbnRdID0gW107XHJcbiAgICB9XHJcbiAgICB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2goY2FsbGJhY2spO1xyXG4gIH1cclxuXHJcbiAgb25jZShldmVudCwgY2FsbGJhY2spIHtcclxuICAgIGNvbnN0IHdyYXBwZWRDYWxsYmFjayA9ICguLi5hcmdzKSA9PiB7XHJcbiAgICAgIGNhbGxiYWNrKC4uLmFyZ3MpO1xyXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCB3cmFwcGVkQ2FsbGJhY2spO1xyXG4gICAgfTtcclxuICAgIHRoaXMub24oZXZlbnQsIHdyYXBwZWRDYWxsYmFjayk7XHJcbiAgfVxyXG5cclxuICByZW1vdmVMaXN0ZW5lcihldmVudCwgY2FsbGJhY2spIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuO1xyXG4gICAgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IHRoaXMuX2V2ZW50c1tldmVudF0uZmlsdGVyKGNiID0+IGNiICE9PSBjYWxsYmFjayk7XHJcbiAgfVxyXG5cclxuICByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcclxuICAgIGlmIChldmVudCkge1xyXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2ZW50XTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZW1pdChldmVudCwgLi4uYXJncykge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdKSByZXR1cm47XHJcbiAgICB0aGlzLl9ldmVudHNbZXZlbnRdLmZvckVhY2goY2FsbGJhY2sgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNhbGxiYWNrKC4uLmFyZ3MpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGV2ZW50IGNhbGxiYWNrOicsIGVycm9yKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyBDb25uZWN0aW9uIHN0YXR1c1xyXG4gIGlzQ29ubmVjdGVkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2lzQ29ubmVjdGVkO1xyXG4gIH1cclxuXHJcbiAgLy8gR2V0dGVycyBmb3IgY29tcGF0aWJpbGl0eVxyXG4gIGdldCBzZWxlY3RlZEFkZHJlc3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRBZGRyZXNzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGNoYWluSWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY2hhaW5JZDtcclxuICB9XHJcblxyXG4gIGdldCBuZXR3b3JrVmVyc2lvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9uZXR3b3JrVmVyc2lvbjtcclxuICB9XHJcbn1cclxuXHJcbi8vIEluamVjdCBwcm92aWRlciBpbnRvIHdpbmRvd1xyXG5pZiAoIXdpbmRvdy5ldGhlcmV1bSkge1xyXG4gIHdpbmRvdy5ldGhlcmV1bSA9IG5ldyBIZWFydFdhbGxldFByb3ZpZGVyKCk7XHJcblxyXG4gIC8vIEFsc28gc2V0IHdpbmRvdy53ZWIzIGZvciBsZWdhY3kgZEFwcHNcclxuICB3aW5kb3cud2ViMyA9IHtcclxuICAgIGN1cnJlbnRQcm92aWRlcjogd2luZG93LmV0aGVyZXVtXHJcbiAgfTtcclxuXHJcbiAgLy8gUHJvdmlkZXIgaW5qZWN0ZWRcclxuXHJcbiAgLy8gQW5ub3VuY2UgdG8gdGhlIHBhZ2UgdGhhdCB0aGUgcHJvdmlkZXIgaXMgcmVhZHlcclxuICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2V0aGVyZXVtI2luaXRpYWxpemVkJykpO1xyXG59IGVsc2Uge1xyXG4gIGNvbnNvbGUud2Fybign4pqg77iPIHdpbmRvdy5ldGhlcmV1bSBhbHJlYWR5IGV4aXN0cywgSGVhcnRXYWxsZXQgbm90IGluamVjdGVkJyk7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE1BQU0sb0JBQW9CO0FBQUEsRUFDeEIsY0FBYztBQUNaLFNBQUssZ0JBQWdCO0FBQ3JCLFNBQUssYUFBYTtBQUNsQixTQUFLLG1CQUFtQjtBQUN4QixTQUFLLFdBQVc7QUFDaEIsU0FBSyxlQUFlO0FBQ3BCLFNBQUssa0JBQWtCO0FBR3ZCLFNBQUssVUFBVTtBQUNmLFNBQUssaUJBQWlCO0FBQ3RCLFNBQUssbUJBQW1CLG9CQUFJO0FBRzVCLFdBQU8saUJBQWlCLFdBQVcsQ0FBQyxVQUFVO0FBQzVDLFVBQUksTUFBTSxXQUFXLE9BQVE7QUFDN0IsVUFBSSxNQUFNLEtBQUssV0FBVyxxQkFBc0I7QUFFaEQsV0FBSyxnQkFBZ0IsTUFBTSxJQUFJO0FBQUEsSUFDakMsQ0FBQztBQUFBLEVBR0g7QUFBQTtBQUFBLEVBR0EsTUFBTSxRQUFRLEVBQUUsUUFBUSxTQUFTLENBQUEsRUFBRSxHQUFJO0FBSXJDLFdBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3RDLFlBQU0sWUFBWSxLQUFLO0FBR3ZCLFdBQUssaUJBQWlCLElBQUksV0FBVyxFQUFFLFNBQVMsT0FBTSxDQUFFO0FBR3hELGFBQU8sWUFBWTtBQUFBLFFBQ2pCLFFBQVE7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNSLEdBQVMsR0FB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
