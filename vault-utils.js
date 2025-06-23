/**
 * Vault Utilities
 * Helper functions for using the vault storage in UI components
 */

class VaultUtils {
    /**
     * Store sensitive data in vault
     * @param {string} category - Vault category
     * @param {string} key - Item key
     * @param {any} data - Data to store
     * @returns {Promise<boolean>} Success status
     */
    static async storeInVault(category, key, data) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'vaultStore',
                category: category,
                key: key,
                data: data
            });
            
            return response.status === 'success';
        } catch (error) {
            console.error('Failed to store in vault:', error);
            return false;
        }
    }
    
    /**
     * Retrieve data from vault
     * @param {string} category - Vault category
     * @param {string} key - Item key
     * @returns {Promise<any>} Retrieved data or null
     */
    static async retrieveFromVault(category, key) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'vaultRetrieve',
                category: category,
                key: key
            });
            
            if (response.status === 'success') {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Failed to retrieve from vault:', error);
            return null;
        }
    }
    
    /**
     * List all keys in a category
     * @param {string} category - Vault category
     * @returns {Promise<string[]>} Array of keys
     */
    static async listVaultKeys(category) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'vaultList',
                category: category
            });
            
            if (response.status === 'success') {
                return response.keys;
            }
            return [];
        } catch (error) {
            console.error('Failed to list vault keys:', error);
            return [];
        }
    }
    
    /**
     * Export entire vault (encrypted)
     * @returns {Promise<object|null>} Encrypted vault export
     */
    static async exportVault() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'vaultExport'
            });
            
            if (response.status === 'success') {
                return response.export;
            }
            return null;
        } catch (error) {
            console.error('Failed to export vault:', error);
            return null;
        }
    }
    
    // Convenience methods for specific data types
    
    /**
     * Store wallet metadata securely
     * @param {string} walletId - Wallet identifier
     * @param {object} metadata - Wallet metadata
     */
    static async storeWalletMetadata(walletId, metadata) {
        return await this.storeInVault('wallets', walletId, metadata);
    }
    
    /**
     * Get wallet metadata
     * @param {string} walletId - Wallet identifier
     */
    static async getWalletMetadata(walletId) {
        return await this.retrieveFromVault('wallets', walletId);
    }
    
    /**
     * Store token information
     * @param {string} tokenAddress - Token contract address
     * @param {object} tokenInfo - Token information
     */
    static async storeToken(tokenAddress, tokenInfo) {
        return await this.storeInVault('tokens', tokenAddress.toLowerCase(), tokenInfo);
    }
    
    /**
     * Get token information
     * @param {string} tokenAddress - Token contract address
     */
    static async getToken(tokenAddress) {
        return await this.retrieveFromVault('tokens', tokenAddress.toLowerCase());
    }
    
    /**
     * Store contact
     * @param {string} address - Contact address
     * @param {object} contactInfo - Contact information
     */
    static async storeContact(address, contactInfo) {
        return await this.storeInVault('contacts', address.toLowerCase(), contactInfo);
    }
    
    /**
     * Get contact
     * @param {string} address - Contact address
     */
    static async getContact(address) {
        return await this.retrieveFromVault('contacts', address.toLowerCase());
    }
    
    /**
     * Get all contacts
     * @returns {Promise<object[]>} Array of contacts
     */
    static async getAllContacts() {
        const keys = await this.listVaultKeys('contacts');
        const contacts = [];
        
        for (const key of keys) {
            const contact = await this.getContact(key);
            if (contact) {
                contacts.push({ address: key, ...contact });
            }
        }
        
        return contacts;
    }
    
    /**
     * Store sensitive setting
     * @param {string} settingKey - Setting key
     * @param {any} value - Setting value
     */
    static async storeSetting(settingKey, value) {
        return await this.storeInVault('settings', settingKey, value);
    }
    
    /**
     * Get sensitive setting
     * @param {string} settingKey - Setting key
     */
    static async getSetting(settingKey) {
        return await this.retrieveFromVault('settings', settingKey);
    }
}

// Export for use in UI
window.VaultUtils = VaultUtils;