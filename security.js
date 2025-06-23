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

// Secure memory handling
const secureMemory = {
    // Clear sensitive data from variables
    clearData: (variable) => {
        if (typeof variable === 'string') {
            // Attempt to overwrite (effectiveness varies in JS)
            variable = ''.padStart(variable.length, '\0');
            return '';
        } else if (Array.isArray(variable)) {
            variable.fill(null, 0, variable.length); // Fill with null
            variable.length = 0;
            return variable;
        } else if (variable instanceof Uint8Array) {
            variable.fill(0);
            return variable;
        } else if (typeof variable === 'object' && variable !== null) {
            Object.keys(variable).forEach(key => {
                // Check if property is configurable before deleting
                const descriptor = Object.getOwnPropertyDescriptor(variable, key);
                if (descriptor && descriptor.configurable) {
                    secureMemory.clearData(variable[key]);
                    try {
                        delete variable[key];
                    } catch (e) {
                        // If deletion fails (e.g., non-configurable), try setting to null
                        variable[key] = null;
                    }
                } else {
                    // If not configurable, just try to nullify
                     variable[key] = null;
                }
            });
            // Attempt to freeze the object to prevent further modification? Might be too aggressive.
            return variable;
        }
        // For primitive types other than string, just return null/undefined
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