// Security utilities for Heart Wallet

// Chrome Storage API wrapper
const secureStorage = {
    // Store data securely using chrome.storage.local
    setItem: async (key, value) => {
        return new Promise((resolve, reject) => {
            try {
                const data = {};
                data[key] = value;
                chrome.storage.local.set(data, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Storage Error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                // Fallback for non-extension context (testing?)
                console.warn("Chrome storage API not available, using localStorage.");
                localStorage.setItem(key, JSON.stringify(value)); // Ensure value is stringified for localStorage
                resolve();
            }
        });
    },

    // Retrieve data from chrome.storage.local
    getItem: async (key) => {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.get([key], (result) => {
                    if (chrome.runtime.lastError) {
                        console.error("Storage Error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result[key]);
                    }
                });
            } catch (error) {
                console.warn("Chrome storage API not available, using localStorage.");
                const item = localStorage.getItem(key);
                resolve(item ? JSON.parse(item) : undefined); // Parse item from localStorage
            }
        });
    },

    // Remove data from chrome.storage.local
    removeItem: async (key) => {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.remove(key, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Storage Error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                console.warn("Chrome storage API not available, using localStorage.");
                localStorage.removeItem(key);
                resolve();
            }
        });
    },

    // Clear all data from storage
    clear: async () => {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.clear(() => {
                    if (chrome.runtime.lastError) {
                        console.error("Storage Error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                console.warn("Chrome storage API not available, using localStorage.");
                localStorage.clear();
                resolve();
            }
        });
    }
};

// Enhanced secure memory handling with proper clearing
const secureMemory = {
    // Clear sensitive data from variables
    clearData: (variable) => {
        if (typeof variable === 'string') {
            // Strings are immutable in JS, can't truly clear them
            // Best practice: use Uint8Array for sensitive data instead
            return '';
        } else if (Array.isArray(variable)) {
            // For arrays, clear each element then reset
            variable.forEach((item, index) => {
                if (item instanceof Uint8Array) {
                    crypto.getRandomValues(item); // Overwrite with random
                    item.fill(0); // Then zeros
                }
                variable[index] = null;
            });
            variable.length = 0;
            return variable;
        } else if (variable instanceof Uint8Array) {
            // Proper secure clearing for typed arrays
            crypto.getRandomValues(variable); // Overwrite with random
            variable.fill(0); // Then with zeros
            return variable;
        } else if (variable instanceof ArrayBuffer) {
            // Clear ArrayBuffer through a view
            const view = new Uint8Array(variable);
            crypto.getRandomValues(view);
            view.fill(0);
            return variable;
        } else if (typeof variable === 'object' && variable !== null) {
            Object.keys(variable).forEach(key => {
                const descriptor = Object.getOwnPropertyDescriptor(variable, key);
                if (descriptor && descriptor.configurable) {
                    secureMemory.clearData(variable[key]);
                    try {
                        delete variable[key];
                    } catch (e) {
                        variable[key] = null;
                    }
                } else {
                    variable[key] = null;
                }
            });
            return variable;
        }
        return null;
    },
    
    // Temporary storage with auto-clearing
    tempStore: (data, timeoutMs = 300000) => { // Default 5 minutes
        const id = Math.random().toString(36).substring(2);
        let store = { data, id }; // Use let so it can be nulled

        const timeoutHandle = setTimeout(() => {
            if (store) {
                secureMemory.clearData(store.data);
                store.data = null;
                store = null; // Nullify the outer reference too
                console.log(`Temporary data cleared for id: ${id}`);
            }
        }, timeoutMs);

        return {
            id,
            getData: () => store ? store.data : null,
            clear: () => {
                clearTimeout(timeoutHandle); // Clear the scheduled timeout
                if (store) {
                    secureMemory.clearData(store.data);
                    store.data = null;
                    store = null; // Nullify the outer reference
                    console.log(`Temporary data manually cleared for id: ${id}`);
                }
            }
        };
    }
};

// Export only the needed security modules
window.securityUtils = {
    storage: secureStorage,
    secureMemory: secureMemory
};