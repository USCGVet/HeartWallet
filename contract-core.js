// Contract Core Module - Handles generic contract interactions
class ContractManager {
    constructor(networkCore, walletCore, storage) {
        this.networkCore = networkCore;
        this.walletCore = walletCore;
        this.storage = storage;
        this.contracts = new Map(); // contractAddress -> contract info
        this.storageKey = 'heartWallet_contracts';
    }

    async initialize() {
        await this.loadContracts();
    }

    async addContract(address, name, abi) {
        try {
            // Validate address
            if (!ethers.isAddress(address)) {
                throw new Error('Invalid contract address');
            }

            // Parse ABI if it's a string
            const parsedAbi = typeof abi === 'string' ? JSON.parse(abi) : abi;

            // Create contract instance
            const provider = this.networkCore.getProvider();
            const contract = new ethers.Contract(address, parsedAbi, provider);

            // Store contract info
            const contractInfo = {
                address: address.toLowerCase(),
                name: name || `Contract ${address.substring(0, 6)}...`,
                abi: parsedAbi,
                addedAt: Date.now()
            };

            this.contracts.set(address.toLowerCase(), contractInfo);
            await this.saveContracts();

            return contractInfo;
        } catch (error) {
            console.error('Error adding contract:', error);
            throw error;
        }
    }

    async removeContract(address) {
        const success = this.contracts.delete(address.toLowerCase());
        if (success) {
            await this.saveContracts();
        }
        return success;
    }

    async callReadFunction(contractAddress, functionName, params = []) {
        try {
            const contractInfo = this.contracts.get(contractAddress.toLowerCase());
            if (!contractInfo) {
                throw new Error('Contract not found');
            }

            const provider = this.networkCore.getProvider();
            const contract = new ethers.Contract(contractAddress, contractInfo.abi, provider);

            // Call the function
            const result = await contract[functionName](...params);
            
            return result;
        } catch (error) {
            console.error('Error calling read function:', error);
            throw error;
        }
    }

    async callWriteFunction(contractAddress, functionName, params = [], value = '0') {
        try {
            const wallet = this.walletCore.getCurrentWallet();
            if (!wallet) {
                throw new Error('No wallet available');
            }

            const contractInfo = this.contracts.get(contractAddress.toLowerCase());
            if (!contractInfo) {
                throw new Error('Contract not found');
            }

            const provider = this.networkCore.getProvider();
            const connectedWallet = wallet.connect(provider);
            const contract = new ethers.Contract(contractAddress, contractInfo.abi, connectedWallet);

            // Prepare transaction options
            const txOptions = {};
            if (value !== '0') {
                txOptions.value = ethers.parseEther(value);
            }

            // Call the function
            const tx = await contract[functionName](...params, txOptions);
            
            return {
                hash: tx.hash,
                transaction: tx
            };
        } catch (error) {
            console.error('Error calling write function:', error);
            throw error;
        }
    }

    async estimateGas(contractAddress, functionName, params = [], value = '0') {
        try {
            const wallet = this.walletCore.getCurrentWallet();
            if (!wallet) {
                throw new Error('No wallet available');
            }

            const contractInfo = this.contracts.get(contractAddress.toLowerCase());
            if (!contractInfo) {
                throw new Error('Contract not found');
            }

            const provider = this.networkCore.getProvider();
            const connectedWallet = wallet.connect(provider);
            const contract = new ethers.Contract(contractAddress, contractInfo.abi, connectedWallet);

            // Prepare transaction options
            const txOptions = {};
            if (value !== '0') {
                txOptions.value = ethers.parseEther(value);
            }

            // Estimate gas
            const gasEstimate = await contract[functionName].estimateGas(...params, txOptions);
            
            return gasEstimate.toString();
        } catch (error) {
            console.error('Error estimating gas:', error);
            throw error;
        }
    }

    getContract(address) {
        return this.contracts.get(address.toLowerCase());
    }

    getAllContracts() {
        return Array.from(this.contracts.values());
    }

    getContractFunctions(address) {
        const contractInfo = this.contracts.get(address.toLowerCase());
        if (!contractInfo) {
            return { read: [], write: [], payable: [] };
        }

        const functions = {
            read: [],
            write: [],
            payable: []
        };

        // Parse ABI to categorize functions
        contractInfo.abi.forEach(item => {
            if (item.type === 'function') {
                const func = {
                    name: item.name,
                    inputs: item.inputs || [],
                    outputs: item.outputs || [],
                    stateMutability: item.stateMutability || 'nonpayable'
                };

                if (item.stateMutability === 'view' || item.stateMutability === 'pure') {
                    functions.read.push(func);
                } else if (item.stateMutability === 'payable') {
                    functions.payable.push(func);
                } else {
                    functions.write.push(func);
                }
            }
        });

        return functions;
    }

    async saveContracts() {
        try {
            const contractsArray = Array.from(this.contracts.entries()).map(([address, info]) => ({
                address,
                name: info.name,
                abi: info.abi,
                addedAt: info.addedAt
            }));

            await this.storage.set({ [this.storageKey]: contractsArray });
            console.log('Saved contracts to storage');
        } catch (error) {
            console.error('Error saving contracts:', error);
        }
    }

    async loadContracts() {
        try {
            const result = await this.storage.get([this.storageKey]);
            const contractsArray = result[this.storageKey] || [];

            console.log('Loading contracts from storage:', contractsArray.length);

            for (const contractData of contractsArray) {
                this.contracts.set(contractData.address.toLowerCase(), {
                    address: contractData.address,
                    name: contractData.name,
                    abi: contractData.abi,
                    addedAt: contractData.addedAt
                });
            }

            console.log(`Loaded ${this.contracts.size} contracts from storage`);
        } catch (error) {
            console.error('Error loading contracts:', error);
        }
    }

    // Helper method to encode function data
    encodeFunctionData(contractAddress, functionName, params = []) {
        const contractInfo = this.contracts.get(contractAddress.toLowerCase());
        if (!contractInfo) {
            throw new Error('Contract not found');
        }

        const iface = new ethers.Interface(contractInfo.abi);
        return iface.encodeFunctionData(functionName, params);
    }

    // Helper method to decode function result
    decodeFunctionResult(contractAddress, functionName, data) {
        const contractInfo = this.contracts.get(contractAddress.toLowerCase());
        if (!contractInfo) {
            throw new Error('Contract not found');
        }

        const iface = new ethers.Interface(contractInfo.abi);
        return iface.decodeFunctionResult(functionName, data);
    }
}