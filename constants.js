// constants.js - Shared constants and configurations for HeartWallet

// Default network configurations
const DEFAULT_NETWORKS = [
    {
        name: 'PulseChain',
        rpcUrl: 'https://rpc.pulsechain.com',
        chainId: 369,
        symbol: 'PLS',
        explorer: 'https://otter.pulsechain.com'
    },
    {
        name: 'PulseChain Testnet v4',
        rpcUrl: 'https://rpc.v4.testnet.pulsechain.com',
        chainId: 943,
        symbol: 'tPLS',
        explorer: 'https://scan.v4.testnet.pulsechain.com'
    }
];

// Default settings
const DEFAULT_CHAIN_ID = 943; // Default to Testnet V4

// Timeout configurations
const TIMEOUTS = {
    CONNECTION_REQUEST: 120000, // 2 minutes for connection requests
    REGULAR_REQUEST: 30000,     // 30 seconds for regular requests
    TEMP_STORAGE: 300000        // 5 minutes for temporary storage
};

// UI notification styles - centralized to eliminate duplication
const NOTIFICATION_STYLES = {
    position: 'fixed',
    bottom: '60px',
    right: '20px',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '4px',
    zIndex: '1000',
    opacity: '0.9'
};

// UI notification color scheme - centralized theme
const NOTIFICATION_COLORS = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3',
    network: '#b33a3a'
};

// Common UI selectors to avoid hardcoding throughout the app
const UI_SELECTORS = {
    networkSymbol: '.network-symbol',
    connectionIndicator: '#connection-indicator'
};

// Form validation patterns
const VALIDATION_PATTERNS = {
    url: /^https?:\/\/.+/,
    chainId: /^\d+$/,
    required: ['name', 'rpcUrl', 'chainId', 'symbol']
};

// Shared utility functions for common operations
const UTILS = {
    // Create network option element
    createNetworkOption: (network) => {
        const option = document.createElement('option');
        option.value = network.chainId;
        option.textContent = `${network.name} (${network.symbol})`;
        return option;
    },
    
    // Format address display
    formatAddress: (address, prefixLength = 5, suffixLength = 5) => {
        if (!address) return '';
        return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
    },
    
    // Validate network configuration
    validateNetwork: (network) => {
        const missing = VALIDATION_PATTERNS.required.filter(field => !network[field]);
        if (missing.length > 0) {
            throw new Error(`Missing required network details: ${missing.join(', ')}`);
        }
        if (!VALIDATION_PATTERNS.chainId.test(network.chainId.toString())) {
            throw new Error('Chain ID must be a valid number');
        }
        if (!VALIDATION_PATTERNS.url.test(network.rpcUrl)) {
            throw new Error('RPC URL must be a valid URL');
        }
    }
};

// Export for non-module contexts
if (typeof window !== 'undefined') {
    window.HeartWalletConstants = {
        DEFAULT_NETWORKS,
        DEFAULT_CHAIN_ID,
        TIMEOUTS,
        NOTIFICATION_STYLES,
        NOTIFICATION_COLORS,
        UI_SELECTORS,
        VALIDATION_PATTERNS,
        UTILS
    };
}
