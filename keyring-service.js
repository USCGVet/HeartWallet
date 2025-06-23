/**
 * Keyring Service - Manages wallet keys securely without exposing private keys
 * Inspired by Rabby's keyring architecture but simplified for Heart Wallet
 */

class KeyringService {
    constructor() {
        this.keyrings = [];
        this.encryptor = null;
        this.password = null; // Temporary password storage for current operation only
    }
    
    /**
     * Storage helper - uses chrome.storage.local in extension context
     */
    async getStorage(key) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([key], (result) => {
                    resolve(result[key]);
                });
            } else {
                // Fallback for testing
                resolve(null);
            }
        });
    }
    
    /**
     * Storage helper - uses chrome.storage.local in extension context
     */
    async setStorage(key, value) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const data = {};
                data[key] = value;
                chrome.storage.local.set(data, () => {
                    resolve();
                });
            } else {
                // Fallback for testing
                resolve();
            }
        });
    }
    
    /**
     * Initialize the keyring service with encryption
     * @param {string} password - User's password
     */
    async initialize(password) {
        // Generate or retrieve salt
        const saltData = await this.getStorage('keyring-salt');
        let salt;
        
        if (!saltData) {
            salt = CryptoUtils.generateSalt();
            await this.setStorage('keyring-salt', Array.from(salt));
        } else {
            salt = new Uint8Array(saltData);
        }
        
        // Derive encryption key
        this.encryptor = await CryptoUtils.deriveKey(password, salt);
        
        // Load existing keyrings
        await this.loadKeyrings();
    }
    
    /**
     * Creates a new wallet keyring
     * @param {string} type - Type of wallet (private-key, mnemonic, etc.)
     * @param {object} opts - Options for wallet creation
     * @returns {Promise<string>} Wallet address
     */
    async createKeyring(type, opts = {}) {
        let keyring;
        
        switch (type) {
            case 'private-key':
                keyring = new PrivateKeyKeyring();
                break;
            case 'mnemonic':
                keyring = new MnemonicKeyring();
                break;
            default:
                throw new Error('Unknown keyring type');
        }
        
        // Initialize the keyring
        await keyring.initialize(opts);
        
        // Add to our keyrings
        this.keyrings.push(keyring);
        
        // Persist encrypted
        await this.persistKeyrings();
        
        return keyring.getAccounts()[0];
    }
    
    /**
     * Signs a transaction without exposing the private key
     * @param {string} address - Wallet address
     * @param {object} transaction - Transaction to sign
     * @returns {Promise<string>} Signed transaction
     */
    async signTransaction(address, transaction) {
        const keyring = this.getKeyringForAddress(address);
        if (!keyring) {
            throw new Error('No keyring found for address');
        }
        
        // Sign in a secure context
        let signedTx;
        try {
            signedTx = await keyring.signTransaction(address, transaction);
        } finally {
            // Ensure any temporary key material is cleared
            keyring.clearTempData();
        }
        
        return signedTx;
    }
    
    /**
     * Signs a message
     * @param {string} address - Wallet address
     * @param {string} message - Message to sign
     * @returns {Promise<string>} Signature
     */
    async signMessage(address, message) {
        const keyring = this.getKeyringForAddress(address);
        if (!keyring) {
            throw new Error('No keyring found for address');
        }
        
        let signature;
        try {
            signature = await keyring.signMessage(address, message);
        } finally {
            keyring.clearTempData();
        }
        
        return signature;
    }
    
    /**
     * Gets keyring for a specific address
     * @param {string} address - Wallet address
     * @returns {Keyring} Keyring instance
     */
    getKeyringForAddress(address) {
        return this.keyrings.find(keyring => 
            keyring.getAccounts().some(acc => 
                acc.toLowerCase() === address.toLowerCase()
            )
        );
    }
    
    /**
     * Loads encrypted keyrings from storage
     */
    async loadKeyrings() {
        const encryptedData = await this.getStorage('encrypted-keyrings');
        if (!encryptedData) {
            this.keyrings = [];
            return;
        }
        
        // Decrypt keyrings data
        const { encrypted, iv } = encryptedData;
        const decrypted = await CryptoUtils.decryptWithKey(
            new Uint8Array(encrypted).buffer,
            this.encryptor,
            new Uint8Array(iv)
        );
        
        const keyringsData = JSON.parse(decrypted);
        
        // Restore keyrings
        this.keyrings = [];
        for (const data of keyringsData) {
            let keyring;
            switch (data.type) {
                case 'private-key':
                    keyring = new PrivateKeyKeyring();
                    break;
                case 'mnemonic':
                    keyring = new MnemonicKeyring();
                    break;
                default:
                    continue;
            }
            
            await keyring.deserialize(data.data);
            this.keyrings.push(keyring);
        }
    }
    
    /**
     * Persists encrypted keyrings to storage
     */
    async persistKeyrings() {
        // Serialize all keyrings
        const keyringsData = await Promise.all(
            this.keyrings.map(async (keyring) => ({
                type: keyring.type,
                data: await keyring.serialize()
            }))
        );
        
        // Encrypt the data
        const dataStr = JSON.stringify(keyringsData);
        const { encrypted, iv } = await CryptoUtils.encryptWithKey(dataStr, this.encryptor);
        
        // Store encrypted
        await this.setStorage('encrypted-keyrings', {
            encrypted: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv)
        });
    }
    
    /**
     * Clears all sensitive data from memory
     */
    clearMemory() {
        this.keyrings.forEach(keyring => keyring.clearTempData());
        this.encryptor = null;
        this.password = null;
    }
    
    /**
     * Gets all wallet addresses
     * @returns {string[]} Array of addresses
     */
    getAccounts() {
        return this.keyrings.flatMap(keyring => keyring.getAccounts());
    }
}

/**
 * Base Keyring class
 */
class BaseKeyring {
    constructor() {
        this.type = 'base';
        this.tempData = null;
    }
    
    /**
     * Clears temporary sensitive data
     */
    clearTempData() {
        if (this.tempData instanceof Uint8Array) {
            CryptoUtils.secureErase(this.tempData);
        }
        this.tempData = null;
    }
    
    // Methods to be implemented by subclasses
    async initialize(opts) {
        throw new Error('Not implemented');
    }
    
    async serialize() {
        throw new Error('Not implemented');
    }
    
    async deserialize(data) {
        throw new Error('Not implemented');
    }
    
    getAccounts() {
        throw new Error('Not implemented');
    }
    
    async signTransaction(address, transaction) {
        throw new Error('Not implemented');
    }
    
    async signMessage(address, message) {
        throw new Error('Not implemented');
    }
}

/**
 * Private Key Keyring - Handles imported private keys
 */
class PrivateKeyKeyring extends BaseKeyring {
    constructor() {
        super();
        this.type = 'private-key';
        this.wallets = [];
    }
    
    async initialize(opts) {
        if (opts.privateKey) {
            // Store encrypted wallet data, not the key itself
            const wallet = new ethers.Wallet(opts.privateKey);
            const encryptedJson = await wallet.encrypt(opts.password || '');
            
            this.wallets.push({
                address: wallet.address,
                encryptedJson: encryptedJson
            });
            
            // Clear the private key from the wallet object
            wallet._signingKey = null;
        }
    }
    
    async serialize() {
        return {
            wallets: this.wallets
        };
    }
    
    async deserialize(data) {
        this.wallets = data.wallets || [];
    }
    
    getAccounts() {
        return this.wallets.map(w => w.address);
    }
    
    async signTransaction(address, transaction) {
        const walletData = this.wallets.find(w => 
            w.address.toLowerCase() === address.toLowerCase()
        );
        
        if (!walletData) {
            throw new Error('Address not found in keyring');
        }
        
        // Decrypt wallet temporarily for signing
        let wallet = null;
        try {
            // This is where we would need the password temporarily
            // In practice, this would be passed in or retrieved securely
            wallet = await ethers.Wallet.fromEncryptedJson(
                walletData.encryptedJson,
                '' // Password would be provided here
            );
            
            const signedTx = await wallet.signTransaction(transaction);
            
            return signedTx;
        } finally {
            // Clear the wallet
            if (wallet && wallet._signingKey) {
                wallet._signingKey = null;
            }
            wallet = null;
        }
    }
    
    async signMessage(address, message) {
        const walletData = this.wallets.find(w => 
            w.address.toLowerCase() === address.toLowerCase()
        );
        
        if (!walletData) {
            throw new Error('Address not found in keyring');
        }
        
        let wallet = null;
        try {
            wallet = await ethers.Wallet.fromEncryptedJson(
                walletData.encryptedJson,
                '' // Password would be provided here
            );
            
            const signature = await wallet.signMessage(message);
            
            return signature;
        } finally {
            if (wallet && wallet._signingKey) {
                wallet._signingKey = null;
            }
            wallet = null;
        }
    }
}

/**
 * Mnemonic Keyring - Handles HD wallets
 */
class MnemonicKeyring extends BaseKeyring {
    constructor() {
        super();
        this.type = 'mnemonic';
        this.encryptedMnemonic = null;
        this.accounts = [];
        this.hdPath = "m/44'/60'/0'/0/"; // Ethereum HD path
    }
    
    async initialize(opts) {
        let mnemonic;
        
        if (opts.mnemonic) {
            mnemonic = opts.mnemonic;
        } else {
            // Generate new mnemonic
            const wallet = ethers.Wallet.createRandom();
            mnemonic = wallet.mnemonic.phrase;
        }
        
        // Encrypt mnemonic for storage
        const salt = CryptoUtils.generateSalt();
        const key = await CryptoUtils.deriveKey(opts.password || '', salt);
        const { encrypted, iv } = await CryptoUtils.encryptWithKey(mnemonic, key);
        
        this.encryptedMnemonic = {
            encrypted: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv),
            salt: Array.from(salt)
        };
        
        // Generate first account
        await this.addAccount(0);
    }
    
    async addAccount(index) {
        // This would decrypt mnemonic temporarily to derive account
        // For now, we'll store the account address
        const hdNode = ethers.utils.HDNode.fromMnemonic(''); // Would use decrypted mnemonic
        const account = hdNode.derivePath(this.hdPath + index);
        
        this.accounts.push({
            address: account.address,
            index: index
        });
        
        return account.address;
    }
    
    async serialize() {
        return {
            encryptedMnemonic: this.encryptedMnemonic,
            accounts: this.accounts,
            hdPath: this.hdPath
        };
    }
    
    async deserialize(data) {
        this.encryptedMnemonic = data.encryptedMnemonic;
        this.accounts = data.accounts || [];
        this.hdPath = data.hdPath || "m/44'/60'/0'/0/";
    }
    
    getAccounts() {
        return this.accounts.map(a => a.address);
    }
    
    async signTransaction(address, transaction) {
        // Implementation would decrypt mnemonic, derive key, sign, and clear
        throw new Error('Not implemented yet');
    }
    
    async signMessage(address, message) {
        // Implementation would decrypt mnemonic, derive key, sign, and clear
        throw new Error('Not implemented yet');
    }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KeyringService, PrivateKeyKeyring, MnemonicKeyring };
}