// Network Core Module - Handles network management and switching
class NetworkCore {
    constructor(storage, updateConnectionIndicator) {
        this.storage = storage;
        this.updateConnectionIndicator = updateConnectionIndicator;
        this.currentNetwork = null;
        this.provider = null;
    }

    async initialize() {
        await this.loadSavedNetwork();
        await this.setupNetworkSettings();
    }    async loadSavedNetwork() {
        try {
            console.log('NetworkCore: Loading saved network...');
            
            const result = await this.storage.get(['selectedNetwork']);
            const savedNetwork = result.selectedNetwork;
            console.log('NetworkCore: Saved network from storage:', savedNetwork);
            
            // Get available networks
            const savedNetworks = await this.getSavedNetworks();
            
            if (savedNetworks.length === 0) {
                throw new Error('No networks available');
            }
            
            const defaultNetwork = savedNetworks[0]; // Use first network as default
            
            if (savedNetwork && this.findNetworkByKey(savedNetworks, savedNetwork)) {
                console.log('NetworkCore: Using saved network:', savedNetwork);
                this.currentNetwork = savedNetwork;
            } else {
                console.log('NetworkCore: Using default network:', defaultNetwork.chainId);
                this.currentNetwork = defaultNetwork.chainId;
            }
            
            await this.switchNetwork(this.currentNetwork);
        } catch (error) {
            console.error('NetworkCore: Error loading saved network:', error);
            // Fallback to testnet
            this.currentNetwork = 943;
            try {
                await this.switchNetwork(this.currentNetwork);
            } catch (fallbackError) {
                console.error('NetworkCore: Even fallback network failed:', fallbackError);
            }
        }
    }async getSavedNetworks() {
        try {
            const result = await this.storage.get(['networks']);
            let networks = result.networks;
            
            // If no saved networks, use default networks
            if (!networks || networks.length === 0) {
                console.log('NetworkCore: No saved networks found, using defaults');
                networks = window.HeartWalletConstants?.DEFAULT_NETWORKS || [];
                
                // Save default networks for future use
                if (networks.length > 0) {
                    await this.storage.set({networks: networks});
                }
            }
            
            console.log('NetworkCore: Using networks:', networks.map(n => ({name: n.name, chainId: n.chainId})));
            return networks;
        } catch (error) {
            console.error('NetworkCore: Error getting saved networks:', error);
            const defaultNetworks = window.HeartWalletConstants?.DEFAULT_NETWORKS || [];
            console.log('NetworkCore: Falling back to default networks:', defaultNetworks);
            return defaultNetworks;
        }
    }findNetworkByKey(networks, key) {
        // Convert key to number if it's a string that represents a number
        const numericKey = isNaN(key) ? key : parseInt(key);
        
        return networks.find(network => 
            network.chainId === key || 
            network.chainId === numericKey ||
            network.name === key ||
            network.symbol === key
        );
    }    async switchNetwork(networkKey) {
        try {
            console.log('NetworkCore: Attempting to switch to network:', networkKey);
            
            const savedNetworks = await this.getSavedNetworks();
            console.log('NetworkCore: Available networks:', savedNetworks.map(n => ({name: n.name, chainId: n.chainId})));
            
            const network = this.findNetworkByKey(savedNetworks, networkKey);
            
            if (!network) {
                console.error('NetworkCore: Network not found. Available networks:', savedNetworks);
                throw new Error(`Network ${networkKey} not found. Available networks: ${savedNetworks.map(n => n.name + ' (' + n.chainId + ')').join(', ')}`);
            }

            console.log('NetworkCore: Found network:', network);
            this.provider = new ethers.JsonRpcProvider(network.rpcUrl);
            this.currentNetwork = network.chainId;
            
            await this.storage.set({selectedNetwork: network.chainId});
            
            // Test the connection
            try {
                await this.provider.getBlockNumber();
                console.log('NetworkCore: Successfully connected to', network.name);
            } catch (connError) {
                console.warn('NetworkCore: Network switched but connection test failed:', connError.message);
            }
            
            // Update UI
            if (this.updateConnectionIndicator) {
                this.updateConnectionIndicator(true, network.name);
            }
            
            // Notify background script of network change
            try {
                await chrome.runtime.sendMessage({
                    action: 'networkChanged',
                    chainId: network.chainId,
                    networkName: network.name,
                    rpcUrl: network.rpcUrl
                });
                console.log('NetworkCore: Notified background script of network change');
            } catch (error) {
                console.error('NetworkCore: Failed to notify background script:', error);
            }
            
            return this.provider;
        } catch (error) {
            console.error('NetworkCore: Error switching network:', error);
            if (this.updateConnectionIndicator) {
                this.updateConnectionIndicator(false);
            }
            throw error;
        }
    }async getCurrentNetwork() {
        const savedNetworks = await this.getSavedNetworks();
        return this.findNetworkByKey(savedNetworks, this.currentNetwork);
    }

    getCurrentNetworkKey() {
        return this.currentNetwork;
    }

    getProvider() {
        return this.provider;
    }

    async setupNetworkSettings() {
        // Populate network selectors
        const selectors = ['network-select', 'settings-network-select', 'footer-network-select'];
        const savedNetworks = await this.getSavedNetworks();
        
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            if (select) {
                select.innerHTML = '';
                savedNetworks.forEach(network => {
                    const option = document.createElement('option');
                    option.value = network.chainId;
                    option.textContent = network.name;
                    if (network.chainId === this.currentNetwork) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        });
    }

    async testConnection() {
        try {
            if (!this.provider) {
                throw new Error('No provider available');
            }
            
            await this.provider.getBlockNumber();
            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    async getBalance(address) {
        try {
            if (!this.provider) {
                throw new Error('No provider available');
            }
            
            const balance = await this.provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }

    async getGasPrice() {
        try {
            if (!this.provider) {
                throw new Error('No provider available');
            }
            
            const feeData = await this.provider.getFeeData();
            return feeData.gasPrice;
        } catch (error) {
            console.error('Error getting gas price:', error);
            return ethers.parseUnits('20', 'gwei'); // fallback
        }
    }
}
