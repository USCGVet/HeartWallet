// Token Core Module - Handles PRC-20 token functionality
class TokenManager {
    constructor(networkCore, walletCore) {
        this.networkCore = networkCore;
        this.walletCore = walletCore;
        this.tokenList = new Map();
        this.storageKey = 'heartWallet_tokens';
    }

    // Full ERC-20/PRC-20 Token ABI
    getTokenABI() {
        return [
            // Read functions
            "function balanceOf(address owner) view returns (uint256)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            
            // Write functions
            "function transfer(address to, uint256 amount) returns (bool)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function transferFrom(address from, address to, uint256 amount) returns (bool)",
            
            // Events
            "event Transfer(address indexed from, address indexed to, uint256 value)",
            "event Approval(address indexed owner, address indexed spender, uint256 value)"
        ];
    }    async addToken(tokenAddress, symbol, decimals) {
        try {
            const provider = this.networkCore.getProvider();
            const contract = new ethers.Contract(tokenAddress, this.getTokenABI(), provider);
            
            // Verify it's a valid token contract
            const name = await contract.name();
            const tokenSymbol = symbol || await contract.symbol();
            const tokenDecimals = decimals || await contract.decimals();
            
            const tokenInfo = {
                address: tokenAddress,
                name: name,
                symbol: tokenSymbol,
                decimals: tokenDecimals,
                contract: contract
            };
            
            this.tokenList.set(tokenAddress.toLowerCase(), tokenInfo);
            
            // Save to storage
            await this.saveTokensToStorage();
            
            return tokenInfo;
        } catch (error) {
            console.error('Error adding token:', error);
            throw error;
        }
    }

    async getTokenBalance(tokenAddress, walletAddress) {
        try {
            const tokenInfo = this.tokenList.get(tokenAddress.toLowerCase());
            if (!tokenInfo) {
                throw new Error('Token not found in list');
            }
            
            const balance = await tokenInfo.contract.balanceOf(walletAddress);
            return ethers.formatUnits(balance, tokenInfo.decimals);
        } catch (error) {
            console.error('Error getting token balance:', error);
            return '0';
        }
    }

    async sendToken(tokenAddress, recipientAddress, amount) {
        try {            const wallet = this.walletCore.getCurrentWallet();
            if (!wallet) {
                throw new Error('No wallet available');
            }

            const provider = this.networkCore.getProvider();
            const connectedWallet = wallet.connect(provider);
            
            const tokenInfo = this.tokenList.get(tokenAddress.toLowerCase());
            if (!tokenInfo) {
                throw new Error('Token not found in list');
            }
            
            const contract = new ethers.Contract(tokenAddress, this.getTokenABI(), connectedWallet);
            const amountBN = ethers.parseUnits(amount.toString(), tokenInfo.decimals);
            
            const tx = await contract.transfer(recipientAddress, amountBN);
            
            return {
                hash: tx.hash,
                transaction: tx
            };
        } catch (error) {
            console.error('Error sending token:', error);
            throw error;
        }
    }

    async approveToken(tokenAddress, spenderAddress, amount) {
        try {
            const wallet = this.walletCore.getCurrentWallet();
            if (!wallet) {
                throw new Error('No wallet available');
            }

            const provider = this.networkCore.getProvider();
            const connectedWallet = wallet.connect(provider);
            
            const tokenInfo = this.tokenList.get(tokenAddress.toLowerCase());
            if (!tokenInfo) {
                throw new Error('Token not found in list');
            }
            
            const contract = new ethers.Contract(tokenAddress, this.getTokenABI(), connectedWallet);
            const amountBN = amount === 'unlimited' ? 
                ethers.MaxUint256 : 
                ethers.parseUnits(amount.toString(), tokenInfo.decimals);
            
            const tx = await contract.approve(spenderAddress, amountBN);
            
            return {
                hash: tx.hash,
                transaction: tx
            };
        } catch (error) {
            console.error('Error approving token:', error);
            throw error;
        }
    }

    async getAllowance(tokenAddress, ownerAddress, spenderAddress) {
        try {
            const tokenInfo = this.tokenList.get(tokenAddress.toLowerCase());
            if (!tokenInfo) {
                throw new Error('Token not found in list');
            }
            
            const allowance = await tokenInfo.contract.allowance(ownerAddress, spenderAddress);
            return ethers.formatUnits(allowance, tokenInfo.decimals);
        } catch (error) {
            console.error('Error getting allowance:', error);
            return '0';
        }
    }

    async updateAllTokenBalances(walletAddress) {
        const balances = new Map();
        
        for (const [address, tokenInfo] of this.tokenList) {
            try {
                const balance = await this.getTokenBalance(address, walletAddress);
                balances.set(address, {
                    ...tokenInfo,
                    balance: balance
                });
            } catch (error) {
                console.error(`Error updating balance for token ${tokenInfo.symbol}:`, error);
                balances.set(address, {
                    ...tokenInfo,
                    balance: '0'
                });
            }
        }
        
        return balances;
    }

    getTokenList() {
        return this.tokenList;
    }    /**
     * Remove a token from the list and storage
     */
    removeToken(tokenAddress) {
        try {
            const success = this.tokenList.delete(tokenAddress.toLowerCase());
            if (success) {
                // Save to storage
                this.saveTokensToStorage();
            }
            return success;
        } catch (error) {
            console.error('Error removing token:', error);
            return false;
        }
    }    async loadDefaultTokens() {
        // First load any saved tokens from storage
        await this.loadTokensFromStorage();
        
        // Add some common PulseChain tokens (only if not already loaded)
        const defaultTokens = [
            // Add default tokens here as needed
            // { address: '0x...', symbol: 'TOKEN', decimals: 18 }
        ];

        for (const token of defaultTokens) {
            try {
                // Only add if not already in the list
                if (!this.tokenList.has(token.address.toLowerCase())) {
                    await this.addToken(token.address, token.symbol, token.decimals);
                }
            } catch (error) {
                console.error(`Failed to load default token ${token.symbol}:`, error);
            }
        }
    }

    validateTokenAddress(address) {
        return ethers.isAddress(address);
    }

    formatTokenAmount(amount, decimals) {
        try {
            return ethers.formatUnits(amount, decimals);
        } catch (error) {
            console.error('Error formatting token amount:', error);
            return '0';
        }
    }

    parseTokenAmount(amount, decimals) {
        try {
            return ethers.parseUnits(amount.toString(), decimals);
        } catch (error) {
            console.error('Error parsing token amount:', error);
            throw error;
        }
   }

    /**
     * Save tokens to browser storage
     */
    async saveTokensToStorage() {
        try {
            const tokensArray = Array.from(this.tokenList.entries()).map(([address, tokenInfo]) => ({
                address: address,
                name: tokenInfo.name,
                symbol: tokenInfo.symbol,
                decimals: tokenInfo.decimals
                // Don't save the contract object, we'll recreate it
            }));
            
            await chrome.storage.local.set({ [this.storageKey]: tokensArray });
            console.log('Saved tokens to storage:', tokensArray);
        } catch (error) {
            console.error('Error saving tokens to storage:', error);
        }
    }

    /**
     * Load tokens from browser storage
     */
    async loadTokensFromStorage() {
        try {
            const result = await chrome.storage.local.get([this.storageKey]);
            const tokensArray = result[this.storageKey] || [];
            
            console.log('Loading tokens from storage:', tokensArray);
            
            for (const tokenData of tokensArray) {
                try {
                    // Recreate the contract object
                    const provider = this.networkCore.getProvider();
                    const contract = new ethers.Contract(tokenData.address, this.getTokenABI(), provider);
                    
                    const tokenInfo = {
                        address: tokenData.address,
                        name: tokenData.name,
                        symbol: tokenData.symbol,
                        decimals: tokenData.decimals,
                        contract: contract
                    };
                    
                    this.tokenList.set(tokenData.address.toLowerCase(), tokenInfo);
                } catch (error) {
                    console.error(`Failed to load token ${tokenData.symbol}:`, error);
                }
            }
            
            console.log(`Loaded ${this.tokenList.size} tokens from storage`);
        } catch (error) {
            console.error('Error loading tokens from storage:', error);
        }
    }
    
    /**
     * Get all tokens
     */
    async getAllTokens() {
        // Return an array of token info without the contract objects
        const tokens = [];
        for (const [address, tokenInfo] of this.tokenList.entries()) {
            tokens.push({
                address: tokenInfo.address,
                name: tokenInfo.name,
                symbol: tokenInfo.symbol,
                decimals: tokenInfo.decimals
            });
        }
        return tokens;
    }
    
    /**
     * Remove a token from the list
     */
    async removeToken(tokenAddress) {
        try {
            const normalizedAddress = tokenAddress.toLowerCase();
            if (this.tokenList.has(normalizedAddress)) {
                this.tokenList.delete(normalizedAddress);
                await this.saveTokensToStorage();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing token:', error);
            throw error;
        }
    }
}
