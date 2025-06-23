// ui-utils.js - Shared UI utility functions for HeartWallet

// Show notification utility - uses centralized constants
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    const constants = window.HeartWalletConstants;
    
    // Use centralized styles and colors
    const styles = constants?.NOTIFICATION_STYLES || {
        position: 'fixed',
        bottom: '60px',
        right: '20px',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '4px',
        zIndex: '1000',
        opacity: '0.9'
    };    // Apply base styles
    Object.assign(notification.style, styles);
    
    // Use CSS classes instead of inline styles
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove notification after duration
    setTimeout(() => {
        notification.className += ' notification-fadeout';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, duration);
}

// Update network symbol displays - uses centralized selector
function updateNetworkSymbols(symbol) {
    const selector = window.HeartWalletConstants?.UI_SELECTORS?.networkSymbol || '.network-symbol';
    document.querySelectorAll(selector).forEach(el => {
        el.textContent = symbol;
    });
}

// Populate dropdown options - uses centralized utility
function populateDropdown(dropdown, networks) {
    dropdown.innerHTML = '';
    const createOption = window.HeartWalletConstants?.UTILS?.createNetworkOption || 
        ((network) => {
            const option = document.createElement('option');
            option.value = network.chainId;
            option.textContent = `${network.name} (${network.symbol})`;
            return option;
        });
    
    networks.forEach(network => {
        dropdown.appendChild(createOption(network));
    });
}

// Update multiple dropdowns with the same networks
function updateNetworkDropdowns(networks, ...dropdowns) {
    dropdowns.forEach(dropdown => {
        if (dropdown) {
            populateDropdown(dropdown, networks);
        }
    });
}

// Update form elements with network data
function updateNetworkForm(network, formElements) {
    if (!formElements || !network) return;
    
    const updates = {
        networkName: network.name,
        rpcUrl: network.rpcUrl,
        chainId: network.chainId,
        networkSymbol: network.symbol,
        explorerUrl: network.explorer || ''
    };
    
    Object.entries(updates).forEach(([key, value]) => {
        if (formElements[key]) {
            formElements[key].value = value;
        }
    });
}

// Validate network inputs - uses centralized validation
function validateNetworkInputs(networkDetails) {
    // Use centralized validation if available, otherwise fallback
    const centralizedValidator = window.HeartWalletConstants?.UTILS?.validateNetwork;
    if (centralizedValidator) {
        return centralizedValidator(networkDetails);
    }
    
    // Fallback validation
    const required = ['name', 'rpcUrl', 'chainId', 'symbol'];
    const missing = required.filter(field => !networkDetails[field]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required network details: ${missing.join(', ')}`);
    }
    
    if (isNaN(parseInt(networkDetails.chainId))) {
        throw new Error('Chain ID must be a valid number');
    }
    
    try {
        new URL(networkDetails.rpcUrl);
    } catch {
        throw new Error('RPC URL must be a valid URL');
    }
}

// Format address display - utility function to avoid duplication
function formatAddress(address, prefixLength = 5, suffixLength = 5) {
    const centralizedFormatter = window.HeartWalletConstants?.UTILS?.formatAddress;
    if (centralizedFormatter) {
        return centralizedFormatter(address, prefixLength, suffixLength);
    }
    
    // Fallback formatting
    if (!address) return '';
    return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

// Export utilities
window.UIUtils = {
    showNotification,
    updateNetworkSymbols,
    populateDropdown,
    updateNetworkDropdowns,
    updateNetworkForm,
    validateNetworkInputs,
    formatAddress
};
