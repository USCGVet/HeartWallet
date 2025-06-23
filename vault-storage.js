/**
 * Vault Storage System
 * Provides an additional encryption layer for sensitive data storage
 * All data is encrypted with a vault key derived from the user's password
 */

class VaultStorage {
    constructor() {
        this.VAULT_VERSION = 1;
        this.VAULT_KEY = 'heart-wallet-vault';
        this.vaultKey = null;
        this.isUnlocked = false;
        
        // Encryption parameters
        this.SALT_LENGTH = 32;
        this.IV_LENGTH = 12; // For AES-GCM
        this.KEY_DERIVATION_ITERATIONS = 100000;
        
        // Data categories for organized storage
        this.categories = {
            WALLETS: 'wallets',
            SETTINGS: 'settings',
            TOKENS: 'tokens',
            CONTACTS: 'contacts',
            PERMISSIONS: 'permissions'
        };
    }
    
    /**
     * Initialize vault with master password
     * @param {string} password - Master password
     * @returns {Promise<boolean>} Success status
     */
    async initialize(password) {
        try {
            // Check if vault exists
            const vaultExists = await this.vaultExists();
            
            if (vaultExists) {
                // Try to unlock existing vault
                return await this.unlock(password);
            } else {
                // Create new vault
                return await this.createVault(password);
            }
        } catch (error) {
            console.error('Vault initialization error:', error);
            return false;
        }
    }
    
    /**
     * Create a new vault
     * @param {string} password - Master password
     * @returns {Promise<boolean>} Success status
     */
    async createVault(password) {
        try {
            // Generate vault salt
            const vaultSalt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
            
            // Derive vault key
            this.vaultKey = await this.deriveVaultKey(password, vaultSalt);
            
            // Create vault metadata
            const metadata = {
                version: this.VAULT_VERSION,
                created: Date.now(),
                salt: Array.from(vaultSalt),
                categories: {}
            };
            
            // Initialize categories
            for (const category of Object.values(this.categories)) {
                metadata.categories[category] = {
                    count: 0,
                    lastModified: Date.now()
                };
            }
            
            // Encrypt and store metadata
            const encryptedMetadata = await this.encryptData(metadata);
            await this.storageSet(`${this.VAULT_KEY}-metadata`, encryptedMetadata);
            
            this.isUnlocked = true;
            return true;
        } catch (error) {
            console.error('Vault creation error:', error);
            return false;
        }
    }
    
    /**
     * Unlock existing vault
     * @param {string} password - Master password
     * @returns {Promise<boolean>} Success status
     */
    async unlock(password) {
        try {
            // Get vault metadata
            const encryptedMetadata = await this.storageGet(`${this.VAULT_KEY}-metadata`);
            if (!encryptedMetadata) {
                throw new Error('Vault metadata not found');
            }
            
            // Extract salt from encrypted metadata
            const salt = new Uint8Array(encryptedMetadata.salt);
            
            // Derive vault key
            this.vaultKey = await this.deriveVaultKey(password, salt);
            
            // Try to decrypt metadata to verify password
            const metadata = await this.decryptData(encryptedMetadata);
            
            if (!metadata || metadata.version !== this.VAULT_VERSION) {
                throw new Error('Invalid vault or version mismatch');
            }
            
            this.isUnlocked = true;
            return true;
        } catch (error) {
            // Invalid password or corrupted vault
            this.vaultKey = null;
            this.isUnlocked = false;
            return false;
        }
    }
    
    /**
     * Lock the vault
     */
    lock() {
        if (this.vaultKey) {
            // Clear vault key from memory
            CryptoUtils.secureErase(this.vaultKey);
            this.vaultKey = null;
        }
        this.isUnlocked = false;
    }
    
    /**
     * Store data in vault
     * @param {string} category - Data category
     * @param {string} key - Item key
     * @param {any} data - Data to store
     * @returns {Promise<boolean>} Success status
     */
    async store(category, key, data) {
        if (!this.isUnlocked || !this.vaultKey) {
            throw new Error('Vault is locked');
        }
        
        if (!Object.values(this.categories).includes(category)) {
            throw new Error('Invalid category');
        }
        
        try {
            // Encrypt data
            const encrypted = await this.encryptData(data);
            
            // Store encrypted data
            const storageKey = `${this.VAULT_KEY}-${category}-${key}`;
            await this.storageSet(storageKey, encrypted);
            
            // Update metadata
            await this.updateMetadata(category, 'store');
            
            return true;
        } catch (error) {
            console.error('Vault store error:', error);
            return false;
        }
    }
    
    /**
     * Retrieve data from vault
     * @param {string} category - Data category
     * @param {string} key - Item key
     * @returns {Promise<any>} Decrypted data or null
     */
    async retrieve(category, key) {
        if (!this.isUnlocked || !this.vaultKey) {
            throw new Error('Vault is locked');
        }
        
        try {
            // Get encrypted data
            const storageKey = `${this.VAULT_KEY}-${category}-${key}`;
            const encrypted = await this.storageGet(storageKey);
            
            if (!encrypted) {
                return null;
            }
            
            // Decrypt data
            return await this.decryptData(encrypted);
        } catch (error) {
            console.error('Vault retrieve error:', error);
            return null;
        }
    }
    
    /**
     * Delete data from vault
     * @param {string} category - Data category
     * @param {string} key - Item key
     * @returns {Promise<boolean>} Success status
     */
    async delete(category, key) {
        if (!this.isUnlocked || !this.vaultKey) {
            throw new Error('Vault is locked');
        }
        
        try {
            const storageKey = `${this.VAULT_KEY}-${category}-${key}`;
            await this.storageRemove(storageKey);
            
            // Update metadata
            await this.updateMetadata(category, 'delete');
            
            return true;
        } catch (error) {
            console.error('Vault delete error:', error);
            return false;
        }
    }
    
    /**
     * List all keys in a category
     * @param {string} category - Data category
     * @returns {Promise<string[]>} Array of keys
     */
    async listKeys(category) {
        if (!this.isUnlocked || !this.vaultKey) {
            throw new Error('Vault is locked');
        }
        
        try {
            const prefix = `${this.VAULT_KEY}-${category}-`;
            const allKeys = await this.storageGetAllKeys();
            
            return allKeys
                .filter(key => key.startsWith(prefix))
                .map(key => key.substring(prefix.length));
        } catch (error) {
            console.error('Vault list error:', error);
            return [];
        }
    }
    
    /**
     * Export vault data (encrypted)
     * @returns {Promise<object>} Encrypted vault export
     */
    async export() {
        if (!this.isUnlocked || !this.vaultKey) {
            throw new Error('Vault is locked');
        }
        
        try {
            const exportData = {
                version: this.VAULT_VERSION,
                exported: Date.now(),
                data: {}
            };
            
            // Export all categories
            for (const category of Object.values(this.categories)) {
                exportData.data[category] = {};
                const keys = await this.listKeys(category);
                
                for (const key of keys) {
                    const data = await this.retrieve(category, key);
                    if (data !== null) {
                        exportData.data[category][key] = data;
                    }
                }
            }
            
            // Encrypt entire export with a new key
            const exportSalt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
            const exportKey = await this.deriveExportKey(exportSalt);
            const encryptedExport = await this.encryptDataWithKey(exportData, exportKey);
            
            // Clear export key
            CryptoUtils.secureErase(exportKey);
            
            return {
                vault: encryptedExport,
                salt: Array.from(exportSalt)
            };
        } catch (error) {
            console.error('Vault export error:', error);
            throw error;
        }
    }
    
    /**
     * Derive vault key from password
     * @private
     */
    async deriveVaultKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits']
        );
        
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.KEY_DERIVATION_ITERATIONS,
                hash: 'SHA-256'
            },
            passwordKey,
            256 // 32 bytes
        );
        
        return new Uint8Array(derivedBits);
    }
    
    /**
     * Derive export key
     * @private
     */
    async deriveExportKey(salt) {
        // Use vault key to derive export key
        const exportPassword = Array.from(this.vaultKey).map(b => String.fromCharCode(b)).join('');
        return await this.deriveVaultKey(exportPassword, salt);
    }
    
    /**
     * Encrypt data with vault key
     * @private
     */
    async encryptData(data) {
        const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        const key = await crypto.subtle.importKey(
            'raw',
            this.vaultKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            dataBuffer
        );
        
        return {
            data: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv),
            salt: Array.from(new Uint8Array(this.SALT_LENGTH)) // Include for metadata
        };
    }
    
    /**
     * Decrypt data with vault key
     * @private
     */
    async decryptData(encryptedObj) {
        const iv = new Uint8Array(encryptedObj.iv);
        const data = new Uint8Array(encryptedObj.data);
        
        const key = await crypto.subtle.importKey(
            'raw',
            this.vaultKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );
        
        const decoder = new TextDecoder();
        const jsonStr = decoder.decode(decrypted);
        return JSON.parse(jsonStr);
    }
    
    /**
     * Encrypt with specific key
     * @private
     */
    async encryptDataWithKey(data, key) {
        const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            cryptoKey,
            dataBuffer
        );
        
        return {
            data: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv)
        };
    }
    
    /**
     * Update vault metadata
     * @private
     */
    async updateMetadata(category, operation) {
        try {
            const encryptedMetadata = await this.storageGet(`${this.VAULT_KEY}-metadata`);
            const metadata = await this.decryptData(encryptedMetadata);
            
            if (!metadata.categories[category]) {
                metadata.categories[category] = { count: 0 };
            }
            
            if (operation === 'store') {
                metadata.categories[category].count++;
            } else if (operation === 'delete') {
                metadata.categories[category].count = Math.max(0, metadata.categories[category].count - 1);
            }
            
            metadata.categories[category].lastModified = Date.now();
            
            const encrypted = await this.encryptData(metadata);
            await this.storageSet(`${this.VAULT_KEY}-metadata`, encrypted);
        } catch (error) {
            console.error('Metadata update error:', error);
        }
    }
    
    /**
     * Check if vault exists
     * @private
     */
    async vaultExists() {
        const metadata = await this.storageGet(`${this.VAULT_KEY}-metadata`);
        return metadata !== null;
    }
    
    /**
     * Storage operations (using chrome.storage.local)
     * @private
     */
    async storageGet(key) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get([key], (result) => {
                    resolve(result[key] || null);
                });
            } else {
                resolve(null);
            }
        });
    }
    
    async storageSet(key, value) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const data = {};
                data[key] = value;
                chrome.storage.local.set(data, () => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
    
    async storageRemove(key) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.remove(key, () => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
    
    async storageGetAllKeys() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get(null, (items) => {
                    resolve(Object.keys(items));
                });
            } else {
                resolve([]);
            }
        });
    }
}

// Class is available globally in service worker context