// Wallet Core Module - Handles wallet creation, import, management
class WalletCore {
    constructor(storage, secureMemory) {
        this.storage = storage;
        this.secureMemory = secureMemory;
        this.walletListName = 'walletList';
        this.activeWalletIdName = 'activeWalletId';
    }    async _getWalletList() {
        const result = await this.storage.get([this.walletListName]);
        const walletList = result[this.walletListName] || [];
        // Removed sensitive logs
        return walletList;
    }

    async _saveWalletList(walletList) {
        await this.storage.set({ [this.walletListName]: walletList });
    }

    async _setActiveWalletId(walletId) {
        if (walletId === null) {
            // Properly remove the activeWalletId from storage when no wallets remain
            await this.storage.remove([this.activeWalletIdName]);
            this.secureMemory.delete('activeWalletAddress');
        } else {
            await this.storage.set({ [this.activeWalletIdName]: walletId });
        }
        if (walletId) {
            const walletData = await this.storage.get([walletId]);
            if (walletData && walletData[walletId]) {
                 // Store address of active wallet for quick access if needed elsewhere
                 // Extract address from encrypted JSON without decrypting
                const encryptedJson = JSON.parse(walletData[walletId]);
                const address = encryptedJson.address;
                // Ensure address has 0x prefix
                const formattedAddress = address.startsWith('0x') ? address : '0x' + address;
                this.secureMemory.set('activeWalletAddress', formattedAddress);
            }
        } else {
            this.secureMemory.delete('activeWalletAddress');
        }
    }

    async getActiveWalletId() {
        const result = await this.storage.get([this.activeWalletIdName]);
        return result[this.activeWalletIdName];
    }

    async addWallet(type, data, password, walletName = null) {
        try {
            console.log(`addWallet: Called with type=${type}, walletName=${walletName}`); // Added log
            let newWallet;
            if (type === 'seed') {
                newWallet = ethers.Wallet.fromPhrase(data);
            } else if (type === 'privateKey') {
                newWallet = new ethers.Wallet(data); // Assuming data is the private key string
            } else {
                console.error("addWallet: Invalid wallet type specified:", type); // Added log
                throw new Error('Invalid wallet type specified.');
            }
            // Removed log that exposed wallet address

            const encryptedJson = await newWallet.encrypt(password);
            console.log("addWallet: Wallet encrypted."); // Added log
            const walletId = `wallet_${newWallet.address.toLowerCase()}`;
            console.log("addWallet: Generated walletId:", walletId); // Added log
            
            const walletList = await this._getWalletList();
            // Removed log that exposed wallet list
            if (walletList.some(w => w.id === walletId || w.address.toLowerCase() === newWallet.address.toLowerCase())) {
                console.warn("addWallet: Wallet with this address already exists.", newWallet.address); // Added log
                throw new Error('Wallet with this address already exists.');
            }

            const defaultName = walletName || `Wallet ${walletList.length + 1} (${newWallet.address.substring(0, 6)}...)`;
            const walletEntry = {
                id: walletId,
                address: newWallet.address,
                name: defaultName,
                createdAt: new Date().toISOString()
            };
            // Removed log that exposed wallet entry details

            await this.storage.set({ [walletId]: encryptedJson });
            console.log("addWallet: Encrypted JSON saved to storage for walletId:", walletId); // Added log
            
            walletList.push(walletEntry);            await this._saveWalletList(walletList);
            console.log("addWallet: Updated walletList saved:", walletList); // Added log

            // Always set newly added wallet as active to make login easier
            await this._setActiveWalletId(walletId);
            console.log("addWallet: Set new wallet as active:", walletId); // Added log
            
            // Create a session wallet without private key
            const sessionWallet = {
                address: newWallet.address,
                getAddress: () => newWallet.address
            };
            this.secureMemory.set('currentWallet', sessionWallet);
            console.log("addWallet: Session wallet object set to secureMemory ('currentWallet')."); // Added log
            
            // Store additional metadata in vault if available
            if (typeof VaultUtils !== 'undefined') {
                await VaultUtils.storeWalletMetadata(walletId, {
                    name: defaultName,
                    type: type,
                    createdAt: new Date().toISOString(),
                    lastBackup: null,
                    notes: ''
                });
            }

            // Clear private key from newWallet before returning
            const seedPhrase = type === 'seed' ? data : newWallet.mnemonic?.phrase;
            if (newWallet._signingKey) {
                newWallet._signingKey = null;
            }

            return { wallet: sessionWallet, walletEntry, seedPhrase: seedPhrase };

        } catch (error) {
            console.error(`addWallet: Error adding wallet from ${type}:`, error); // Modified log
            throw error; // Re-throw the error to be caught by the caller
        }
    }

    async createWallet(password) {
        try {
            const randomWallet = ethers.Wallet.createRandom();
            const seedPhrase = randomWallet.mnemonic.phrase;
            // Use a default name for newly generated wallets
            const result = await this.addWallet('seed', seedPhrase, password, 'Main Wallet');
            return { wallet: result.wallet, seedPhrase: result.seedPhrase };
        } catch (error) {
            console.error('Error creating wallet:', error);
            throw error;
        }
    }

    async importFromSeedPhrase(seedPhrase, password, walletName = null) {        
        try {
            const result = await this.addWallet('seed', seedPhrase, password, walletName);
            return result.wallet;
        } catch (error) {
            // Error is already logged in addWallet
            throw error;
        }
    }

    async importFromPrivateKey(privateKey, password, walletName = null) {        
        try {
            const result = await this.addWallet('privateKey', privateKey, password, walletName);
            return result.wallet;
        } catch (error) {
            // Error is already logged in addWallet
            throw error;
        }
    }

    async unlockWallet(password) {        
        try {
            const activeWalletId = await this.getActiveWalletId();
            console.log('Attempting to unlock wallet with ID:', activeWalletId); // Added log

            if (!activeWalletId) {
                // Attempt to unlock the first wallet if no active one is set (e.g. legacy or first run)
                const walletList = await this._getWalletList();
                if (walletList.length > 0) {
                    // Try to unlock the first wallet in the list
                    const firstWalletId = walletList[0].id;
                    console.log('No active wallet ID, attempting to unlock first wallet:', firstWalletId); // Added log
                    const result = await this.storage.get([firstWalletId]);
                    console.log('Storage result for first wallet:', result); // Added log
                    const encryptedWallet = result[firstWalletId];
                    // Removed log that exposed encrypted wallet data
                    if (!encryptedWallet) throw new Error('Encrypted data for the first wallet not found.');
                    
                    const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password);
                    // Create a session wallet without private key
                    const sessionWallet = {
                        address: wallet.address,
                        getAddress: () => wallet.address
                    };
                    this.secureMemory.set('currentWallet', sessionWallet);
                    await this._setActiveWalletId(firstWalletId); // Set it as active
                    this.secureMemory.set('activeWalletAddress', wallet.address);
                    
                    // Clear the original wallet with private key
                    if (wallet._signingKey) {
                        wallet._signingKey = null;
                    }
                    
                    return sessionWallet;
                }
                throw new Error('No active wallet set and no wallets found to unlock.');
            }

            const result = await this.storage.get([activeWalletId]);
            console.log('Storage result for active wallet ID:', result); // Added log
            const encryptedWallet = result[activeWalletId];
            // Removed log that exposed encrypted wallet data

            if (!encryptedWallet) {
                throw new Error('Active wallet data not found. It might have been removed.');
            }
            
            const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password);
            // Create a session wallet without private key
            const sessionWallet = {
                address: wallet.address,
                getAddress: () => wallet.address
            };
            this.secureMemory.set('currentWallet', sessionWallet);
            // Ensure activeWalletAddress is also set in secureMemory
            this.secureMemory.set('activeWalletAddress', wallet.address);
            
            // Clear the original wallet with private key
            if (wallet._signingKey) {
                wallet._signingKey = null;
            }
            
            return sessionWallet;
        } catch (error) {
            console.error('Error unlocking wallet:', error);
            this.secureMemory.delete('currentWallet'); // Clear any partially set wallet
            this.secureMemory.delete('activeWalletAddress');
            throw error;
        }
    }

    getCurrentWallet() {
        // First try to get from secure memory
        let wallet = this.secureMemory.get('currentWallet');
        
        // If not found, try to get the active wallet address
        if (!wallet) {
            const activeAddress = this.secureMemory.get('activeWalletAddress');
            if (activeAddress) {
                // Create a minimal wallet object
                wallet = {
                    address: activeAddress,
                    getAddress: () => activeAddress
                };
                // Cache it for next time
                this.secureMemory.set('currentWallet', wallet);
            }
        }
        
        return wallet;
    }    
    
    async hasWallets() { // Renamed from hasWallet
        const walletList = await this._getWalletList();
        return walletList.length > 0;
    }

    async removeWallet(walletIdToRemove) {
        let walletList = await this._getWalletList();
        const walletToRemove = walletList.find(w => w.id === walletIdToRemove);

        if (!walletToRemove) {
            throw new Error("Wallet not found for removal.");
        }

        await this.storage.remove([walletIdToRemove]);
        walletList = walletList.filter(w => w.id !== walletIdToRemove);
        await this._saveWalletList(walletList);

        const activeWalletId = await this.getActiveWalletId();
        if (activeWalletId === walletIdToRemove) {
            this.secureMemory.delete('currentWallet');
            this.secureMemory.delete('activeWalletAddress');
            if (walletList.length > 0) {
                await this._setActiveWalletId(walletList[0].id); // Set first as active
            } else {
                await this._setActiveWalletId(null); // No wallets left
            }
        }
        console.log(`Wallet ${walletIdToRemove} removed.`);
        return true;
    }

    // Clear all wallet data - useful for troubleshooting
    async clearAllWalletData() {
        console.log('Clearing all wallet data...');
        
        // Get all wallets
        const walletList = await this._getWalletList();
        
        // Remove each wallet's data
        for (const wallet of walletList) {
            await this.storage.remove([wallet.id]);
        }
        
        // Clear wallet list
        await this.storage.remove([this.walletListName]);
        
        // Clear active wallet ID
        await this.storage.remove([this.activeWalletIdName]);
        
        // Clear secure memory
        this.secureMemory.delete('currentWallet');
        this.secureMemory.delete('activeWalletAddress');
        
        console.log('All wallet data cleared');
    }

    async getStoredAddress() { // This should now return the active wallet's address
        const activeWalletId = await this.getActiveWalletId();
        if (!activeWalletId) return null;

        const walletList = await this._getWalletList();
        const activeWalletInfo = walletList.find(w => w.id === activeWalletId);
        return activeWalletInfo ? activeWalletInfo.address : null;
    }

    async getWalletList() { // Public method to get the list
        return await this._getWalletList();
    }

    async switchActiveWallet(newActiveWalletId, password = null) {
        const walletList = await this._getWalletList();
        const walletExists = walletList.some(w => w.id === newActiveWalletId);
        if (!walletExists) {
            throw new Error("Wallet to switch to does not exist.");
        }

        await this._setActiveWalletId(newActiveWalletId);
        this.secureMemory.delete('currentWallet'); // Force re-unlock for the new wallet
        this.secureMemory.delete('activeWalletAddress');
        
        console.log(`Switched active wallet to ${newActiveWalletId}. Re-login may be required.`);
        // If password is provided, attempt to unlock immediately
        if (password) {
            try {
                return await this.unlockWallet(password);
            } catch (error) {
                console.warn(`Failed to auto-unlock switched wallet ${newActiveWalletId}: ${error.message}`);
                // Do not re-throw, let the app handle the need for login
            }
        }
        return null; // Indicates wallet switched, but not unlocked
    }

    // Export private key for a specific wallet
    async exportPrivateKey(walletId, password) {
        try {
            // Export private key through background script
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'exportPrivateKey',
                    walletId: walletId,
                    password: password
                }, response => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }
                    if (response && response.success) {
                        resolve(response.privateKey);
                    } else {
                        reject(new Error(response?.error || 'Failed to export private key'));
                    }
                });
            });
        } catch (error) {
            console.error('Error exporting private key:', error);
            throw error;
        }
    }
    
    // Set current address for session restoration
    setCurrentAddress(address) {
        // Removed log that exposed wallet address
        // Create a minimal wallet object for UI operations
        const sessionWallet = {
            address: address,
            // We don't have the private key here, it stays in background
            getAddress: () => address
        };
        this.secureMemory.set('currentWallet', sessionWallet);
    }
}
