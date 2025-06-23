// Transaction Core Module - Handles transaction creation and management
class TransactionManager {
    constructor(networkCore, walletCore) {
        this.networkCore = networkCore;
        this.walletCore = walletCore;
    }

    async sendTransaction(recipientAddress, amount, gasLimit = 21000) {
        try {
            const wallet = this.walletCore.getCurrentWallet();
            if (!wallet) {
                throw new Error('No wallet available');
            }

            const provider = this.networkCore.getProvider();
            if (!provider) {
                throw new Error('No network provider available');
            }

            const connectedWallet = wallet.connect(provider);
            
            // Get current gas price
            const gasPrice = await this.networkCore.getGasPrice();
            
            // Create transaction
            const transaction = {
                to: recipientAddress,
                value: ethers.parseEther(amount.toString()),
                gasLimit: gasLimit,
                gasPrice: gasPrice
            };

            // Send transaction
            const tx = await connectedWallet.sendTransaction(transaction);
            
            return {
                hash: tx.hash,
                transaction: tx
            };
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    }    async estimateGas(recipientAddress, amount) {
        try {
            const wallet = this.walletCore.getCurrentWallet();
            const provider = this.networkCore.getProvider();
            
            if (!wallet || !provider) {
                throw new Error('Wallet or provider not available');
            }

            const transaction = {
                to: recipientAddress,
                value: ethers.parseEther(amount.toString()),
                from: wallet.address
            };

            const estimatedGas = await provider.estimateGas(transaction);
            return estimatedGas;
        } catch (error) {
            console.error('Error estimating gas:', error);
            return 21000n; // fallback gas limit
        }
    }    async getTransactionReceipt(txHash) {
        try {
            const provider = this.networkCore.getProvider();
            if (!provider) {
                throw new Error('No provider available');
            }

            return await provider.getTransactionReceipt(txHash);
        } catch (error) {
            console.error('Error getting transaction receipt:', error);
            throw error;
        }
    }

    async waitForTransaction(txHash, confirmations = 1) {        try {
            const provider = this.networkCore.getProvider();
            if (!provider) {
                throw new Error('No provider available');
            }

            return await provider.waitForTransaction(txHash, confirmations);
        } catch (error) {
            console.error('Error waiting for transaction:', error);
            throw error;
        }
    }

    validateAddress(address) {
        try {
            return ethers.isAddress(address);
        } catch (error) {
            return false;
        }
    }

    validateAmount(amount, balance) {
        try {
            const amountBN = ethers.parseEther(amount.toString());
            const balanceBN = ethers.parseEther(balance.toString());
            
            if (amountBN <= 0n) {
                return { valid: false, error: 'Amount must be greater than 0' };
            }
            
            if (amountBN > balanceBN) {
                return { valid: false, error: 'Insufficient balance' };
            }
            
            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'Invalid amount format' };
        }
    }

    formatTransactionForDisplay(tx) {
        return {
            hash: tx.hash,
            to: tx.to,
            value: ethers.formatEther(tx.value || '0'),
            gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : '0',
            gasLimit: tx.gasLimit ? tx.gasLimit.toString() : '0'
        };
    }
}
