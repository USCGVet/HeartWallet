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
        console.log("_getWalletList: Storage result:", result);
        console.log("_getWalletList: Returning wallet list:", walletList);
        return walletList;
    }

    async _saveWalletList(walletList) {
        await this.storage.set({ [this.walletListName]: walletList });
    }

    async _setActiveWalletId(walletId) {        await this.storage.set({ [this.activeWalletIdName]: walletId });
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
            console.log("addWallet: ethers.Wallet object created, address:", newWallet.address); // Added log

            const encryptedJson = await newWallet.encrypt(password);
            console.log("addWallet: Wallet encrypted."); // Added log
            const walletId = `wallet_${newWallet.address.toLowerCase()}`;
            console.log("addWallet: Generated walletId:", walletId); // Added log
            
            const walletList = await this._getWalletList();
            console.log("addWallet: Current walletList:", walletList); // Added log
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
            console.log("addWallet: Created walletEntry:", walletEntry); // Added log

            await this.storage.set({ [walletId]: encryptedJson });
            console.log("addWallet: Encrypted JSON saved to storage for walletId:", walletId); // Added log
            
            walletList.push(walletEntry);            await this._saveWalletList(walletList);
            console.log("addWallet: Updated walletList saved:", walletList); // Added log

            // Always set newly added wallet as active to make login easier
            await this._setActiveWalletId(walletId);
            console.log("addWallet: Set new wallet as active:", walletId); // Added log
            
            this.secureMemory.set('currentWallet', newWallet);
            console.log("addWallet: New wallet object set to secureMemory ('currentWallet')."); // Added log

            return { wallet: newWallet, walletEntry, seedPhrase: type === 'seed' ? data : newWallet.mnemonic?.phrase };

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
                    console.log('Encrypted data for first wallet:', encryptedWallet); // Added log
                    if (!encryptedWallet) throw new Error('Encrypted data for the first wallet not found.');
                    
                    const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password);
                    this.secureMemory.set('currentWallet', wallet);
                    await this._setActiveWalletId(firstWalletId); // Set it as active
                    this.secureMemory.set('activeWalletAddress', wallet.address);
                    return wallet;
                }
                throw new Error('No active wallet set and no wallets found to unlock.');
            }

            const result = await this.storage.get([activeWalletId]);
            console.log('Storage result for active wallet ID:', result); // Added log
            const encryptedWallet = result[activeWalletId];
            console.log('Encrypted data for active wallet ID ' + activeWalletId + ':', encryptedWallet); // Added log

            if (!encryptedWallet) {
                throw new Error('Active wallet data not found. It might have been removed.');
            }
            
            const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password);
            this.secureMemory.set('currentWallet', wallet);
            // Ensure activeWalletAddress is also set in secureMemory
            this.secureMemory.set('activeWalletAddress', wallet.address);
            return wallet;
        } catch (error) {
            console.error('Error unlocking wallet:', error);
            this.secureMemory.delete('currentWallet'); // Clear any partially set wallet
            this.secureMemory.delete('activeWalletAddress');
            throw error;
        }
    }

    getCurrentWallet() {
        return this.secureMemory.get('currentWallet');
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
            const result = await this.storage.get([walletId]);
            const encryptedWallet = result[walletId];
            
            if (!encryptedWallet) {
                throw new Error('Wallet data not found');
            }
            
            const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password);
            return wallet.privateKey;
            
        } catch (error) {
            console.error('Error exporting private key:', error);
            throw error;
        }
    }
    
    // Set current address for session restoration
    setCurrentAddress(address) {
        console.log('Setting current address for session:', address);
        // Create a minimal wallet object for UI operations
        const sessionWallet = {
            address: address,
            // We don't have the private key here, it stays in background
            getAddress: () => address
        };
        this.secureMemory.set('currentWallet', sessionWallet);
    }
}
