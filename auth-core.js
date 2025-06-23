// Auth Core Module - Handles authentication and session management
class AuthManager {
    constructor(storage, secureMemory, walletCore) {
        this.storage = storage;
        this.secureMemory = secureMemory;
        this.walletCore = walletCore;
        this.isAuthenticated = false;
        this.sessionTimeout = null;
    }    async login(password) {
        try {
            const wallet = await this.walletCore.unlockWallet(password);
            this.isAuthenticated = true;
            this.startSessionTimeout();
            
            return wallet;
        } catch (error) {
            console.error('Login failed:', error);
            this.isAuthenticated = false;
            throw error;
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.secureMemory.clear();
        this.clearSessionTimeout();
        
        // Clear any sensitive UI data
        this.clearSensitiveData();
    }

    isLoggedIn() {
        return this.isAuthenticated && this.walletCore.getCurrentWallet() !== null;
    }

    startSessionTimeout(minutes = 30) {
        this.clearSessionTimeout();
        
        this.sessionTimeout = setTimeout(() => {
            console.log('Session timeout reached, logging out...');
            this.logout();
            
            // Trigger UI update to show login screen
            if (window.uiManager) {
                window.uiManager.showLoginSection();
                window.uiManager.showStatus('Session expired. Please log in again.', 'warning');
            }
        }, minutes * 60 * 1000);
    }

    clearSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    }

    extendSession() {
        if (this.isAuthenticated) {
            this.startSessionTimeout();
        }
    }

    clearSensitiveData() {
        // Clear password fields
        const sensitiveFields = [
            'login-password',
            'new-password', 
            'confirm-password',
            'import-password',
            'seed-phrase',
            'private-key'
        ];
        
        sensitiveFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });
        
        // Clear seed phrase display
        const seedDisplay = document.getElementById('seed-phrase-display');
        if (seedDisplay) {
            seedDisplay.textContent = '';
        }
        
        // Hide seed phrase container
        const seedContainer = document.getElementById('seed-phrase-container');
        if (seedContainer) {
            seedContainer.classList.add('hidden');
        }
    }

    async validatePassword(password) {
        if (!password || password.length < 8) {
            return { valid: false, error: 'Password must be at least 8 characters long' };
        }
        
        // Add more password validation rules as needed
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return { 
                valid: false, 
                error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
            };
        }
        
        return { valid: true };
    }    async changePassword(oldPassword, newPassword) {
        try {
            // First verify old password by unlocking wallet
            const wallet = await this.walletCore.unlockWallet(oldPassword);
            
            // Validate new password
            const validation = await this.validatePassword(newPassword);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
              // Re-encrypt wallet with new password
            const encryptedWallet = await wallet.encrypt(newPassword);
            await this.storage.set({ 'encryptedWallet': encryptedWallet });
            
            return true;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }    async exportPrivateKey(password) {
        try {
            const wallet = await this.walletCore.unlockWallet(password);
            return wallet.privateKey;
        } catch (error) {
            console.error('Error exporting private key:', error);
            throw error;
        }
    }    async exportSeedPhrase(password) {
        try {
            const wallet = await this.walletCore.unlockWallet(password);
            if (wallet.mnemonic) {
                return wallet.mnemonic.phrase;
            } else {
                throw new Error('This wallet was not created from a seed phrase');
            }
        } catch (error) {
            console.error('Error exporting seed phrase:', error);
            throw error;
        }    }

    // Security checks
    async checkWalletIntegrity() {
        try {
            const storedAddress = await this.walletCore.getStoredAddress();
            const currentWallet = this.walletCore.getCurrentWallet();
            
            if (currentWallet && storedAddress && currentWallet.address !== storedAddress) {
                console.warn('Wallet address mismatch detected');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking wallet integrity:', error);
            return false;
        }
    }

    // Activity tracking for session management
    trackActivity() {
        this.extendSession();
    }

    setupActivityTracking() {
        const events = ['click', 'keypress', 'scroll', 'mousemove'];
        const throttledTrack = this.throttle(() => this.trackActivity(), 60000); // Track once per minute max
        
        events.forEach(event => {
            document.addEventListener(event, throttledTrack, { passive: true });
        });
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}
