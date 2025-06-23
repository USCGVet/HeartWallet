// HeartWallet Settings Page JavaScript

console.log('=== SETTINGS.JS LOADING ===');

// Initialize wallet core for settings page
let walletCore = null;
let storage = chrome.storage.local;
let secureMemory = new Map();

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== SETTINGS PAGE DOMContentLoaded FIRED ===');
    console.log('Settings page loaded');
    console.log('WalletCore available?', typeof WalletCore);
    console.log('ethers available?', typeof ethers);
    
    // Initialize wallet core
    try {
        walletCore = new WalletCore(storage, secureMemory);
        console.log('✓ WalletCore initialized in settings');
    } catch (error) {
        console.error('Failed to initialize WalletCore in settings:', error);
    }
      // Initialize settings page
    initializeSettings();
    loadTokenList();
    loadConnectedSites();    
    // Try loading wallet list immediately
    console.log('=== ABOUT TO CALL IMMEDIATE WALLET LIST LOAD ===');
    console.log('Attempting immediate wallet list load...');
    loadWalletList();
    
      // Add a small delay to ensure everything is loaded
    setTimeout(() => {
        console.log('=== ABOUT TO CALL DELAYED WALLET LIST LOAD ===');
        console.log('Attempting to load wallet list...');
        loadWalletList(); // Add wallet list loading
    }, 500);// Event listeners
    document.getElementById('saveSessionTimeout').addEventListener('click', saveSessionTimeout);
    // Token management handled by app.js - removing duplicate event listeners
    // document.getElementById('refreshTokens').addEventListener('click', loadTokenList);
    // document.getElementById('addTokenForm').addEventListener('submit', handleAddToken);
    document.getElementById('disconnectAllSites').addEventListener('click', disconnectAllSites);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    
    // Wallet management event listeners
    document.getElementById('refreshWallets').addEventListener('click', loadWalletList);
    document.getElementById('debugWallets').addEventListener('click', debugWalletStorage);
});

// Initialize settings with stored values
function initializeSettings() {
    // Load current session timeout setting
    chrome.storage.local.get(['sessionTimeout'], (result) => {
        if (result.sessionTimeout) {
            const timeoutInMinutes = result.sessionTimeout / 60000; // Convert from ms to minutes
            document.getElementById('sessionTimeout').value = timeoutInMinutes;
        }
    });
}

// Save session timeout setting
function saveSessionTimeout() {
    const timeoutMinutes = parseInt(document.getElementById('sessionTimeout').value);
    
    if (isNaN(timeoutMinutes) || timeoutMinutes < 1 || timeoutMinutes > 1440) {
        alert('Please enter a valid timeout between 1 and 1440 minutes.');
        return;
    }
    
    const timeoutMs = timeoutMinutes * 60000; // Convert to milliseconds
    
    // Send message to background script to update session timeout
    chrome.runtime.sendMessage({
        action: 'updateSessionTimeout',
        sessionTimeout: timeoutMs
    }, (response) => {
        if (response && response.status === 'success') {
            showNotification('Session timeout updated successfully!', 'success');
        } else {
            showNotification('Failed to update session timeout.', 'error');
        }
    });
}

// Wallet Management Functions

// Load and display wallet list
async function loadWalletList() {
    console.log('=== LOADING WALLET LIST ===');
    console.log('Loading wallet list...');
    console.log('WalletCore instance:', walletCore);
    console.log('WalletCore type:', typeof walletCore);
    
    if (!walletCore) {
        console.error('WalletCore not initialized');
        const walletList = document.getElementById('walletList');
        if (walletList) {
            walletList.innerHTML = '<div class="no-wallets">WalletCore not initialized. Please try refreshing the page.</div>';
        }
        return;
    }
    
    try {
        console.log('Calling walletCore.getWalletList()...');
        const wallets = await walletCore.getWalletList();
        console.log('Wallets retrieved:', wallets);
        console.log('Wallets type:', typeof wallets);
        console.log('Wallets array length:', Array.isArray(wallets) ? wallets.length : 'not an array');
        displayWalletList(wallets);
    } catch (error) {
        console.error('Error loading wallet list:', error);
        console.error('Error stack:', error.stack);
        showNotification('Failed to load wallets', 'error');
        const walletList = document.getElementById('walletList');
        if (walletList) {
            walletList.innerHTML = '<div class="no-wallets">Error loading wallets. Check console for details.</div>';
        }
    }
    console.log('=== WALLET LIST LOADING COMPLETE ===');
}

// Display wallet list in the UI
function displayWalletList(wallets) {
    console.log('=== DISPLAYING WALLET LIST ===');
    console.log('displayWalletList called with:', wallets);
    const walletList = document.getElementById('walletList');
    console.log('walletList element:', walletList);
    console.log('walletList element found:', !!walletList);
    
    if (!walletList) {
        console.error('Wallet list container not found in DOM');
        return;
    }
    
    console.log('Clearing existing wallet list content...');
    walletList.innerHTML = '';
    
    if (!wallets || wallets.length === 0) {
        console.log('No wallets found, showing no-wallets message');
        walletList.innerHTML = '<div class="no-wallets">No wallets found.</div>';
        return;
    }
    
    console.log('Rendering', wallets.length, 'wallets');
    wallets.forEach((wallet, index) => {
        console.log(`Rendering wallet ${index}:`, wallet);
        const walletItem = document.createElement('div');
        walletItem.className = 'wallet-item';
        console.log('Created wallet item div with class:', walletItem.className);
        
        // Create wallet info container
        const walletInfo = document.createElement('div');
        walletInfo.className = 'wallet-info';
        
        // Create wallet icon/placeholder
        const walletIcon = document.createElement('div');
        walletIcon.className = 'wallet-icon';
        walletIcon.innerHTML = '<i class="fas fa-wallet"></i>';
        walletInfo.appendChild(walletIcon);
        
        // Create wallet details
        const walletDetails = document.createElement('div');
        walletDetails.className = 'wallet-details';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'wallet-name';
        nameDiv.textContent = wallet.name || 'Unnamed Wallet';
        walletDetails.appendChild(nameDiv);
        
        const addressDiv = document.createElement('div');
        addressDiv.className = 'wallet-address';
        addressDiv.textContent = wallet.address;
        walletDetails.appendChild(addressDiv);
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'wallet-meta';
        metaDiv.textContent = `Created: ${new Date(wallet.createdAt).toLocaleDateString()}`;
        walletDetails.appendChild(metaDiv);
        
        walletInfo.appendChild(walletDetails);
        walletItem.appendChild(walletInfo);
        
        // Create wallet actions
        const walletActions = document.createElement('div');
        walletActions.className = 'wallet-actions';
        
        // Export Private Key button
        const exportBtn = document.createElement('button');
        exportBtn.className = 'export-key-btn';
        exportBtn.innerHTML = '<i class="fas fa-key"></i> Export Private Key';
        exportBtn.onclick = () => exportPrivateKey(wallet.id, wallet.address);
        walletActions.appendChild(exportBtn);
        
        walletItem.appendChild(walletActions);
        walletList.appendChild(walletItem);
        
        console.log(`Wallet item ${index} added to DOM`);
    });
    
    console.log('All wallets rendered successfully');
    console.log('Final walletList innerHTML length:', walletList.innerHTML.length);
    console.log('=== WALLET LIST DISPLAY COMPLETE ===');
}

// Export private key for a wallet
async function exportPrivateKey(walletId, walletAddress) {
    console.log('[Settings] exportPrivateKey called with:', { walletId, walletAddress });
    
    // First, ask for confirmation
    if (!confirm(`Are you sure you want to export the private key for wallet ${walletAddress.substring(0, 10)}...?\n\nWARNING: Keep your private key secure! Anyone with access to it can control your wallet.`)) {
        console.log('[Settings] Export cancelled by user');
        return;
    }
    
    // Ask for password using custom modal
    const password = await PasswordPromptModal.prompt(
        'Please enter your wallet password to export the private key:',
        'Export Private Key'
    );
    if (!password) {
        console.log('[Settings] No password provided');
        return;
    }
    
    console.log('[Settings] Password provided, attempting export...');
    
    try {
        // Use wallet core to export private key
        const privateKey = await walletCore.exportPrivateKey(walletId, password);
        console.log('[Settings] Private key exported successfully, length:', privateKey?.length);
        
        // Display the private key in a modal
        showPrivateKeyModal(privateKey, walletAddress);
        console.log('[Settings] Modal should be displayed');
        
    } catch (error) {
        console.error('[Settings] Error exporting private key:', error);
        if (error.message.includes('password') || error.message.includes('invalid')) {
            showNotification('Incorrect password', 'error');
        } else {
            showNotification('Failed to export private key: ' + error.message, 'error');
        }
    }
}

// Show private key in a modal dialog
function showPrivateKeyModal(privateKey, walletAddress) {
    console.log('[Settings] showPrivateKeyModal called with privateKey length:', privateKey?.length);
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'private-key-modal';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `
        <h3><i class="fas fa-key"></i> Private Key Export</h3>
        <button class="modal-close" onclick="closePrivateKeyModal()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = `
        <div class="warning-box">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>WARNING:</strong> Keep this private key secure! Anyone with access to it can control your wallet.
        </div>
        
        <div class="wallet-info-modal">
            <label>Wallet Address:</label>
            <div class="address-display">${walletAddress}</div>
        </div>
        
        <div class="private-key-section">
            <label>Private Key:</label>
            <div class="private-key-display">
                <input type="text" id="privateKeyInput" value="${privateKey}" readonly>
                <button id="copyPrivateKey" class="copy-btn">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        </div>
        
        <div class="modal-actions">
            <button onclick="closePrivateKeyModal()" class="close-modal-btn">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    modal.appendChild(modalHeader);
    modal.appendChild(modalBody);
    modalOverlay.appendChild(modal);
    
    // Add to page
    document.body.appendChild(modalOverlay);
    console.log('[Settings] Modal added to document.body');
    
    // Add copy functionality
    document.getElementById('copyPrivateKey').addEventListener('click', function() {
        const input = document.getElementById('privateKeyInput');
        input.select();
        document.execCommand('copy');
        showNotification('Private key copied to clipboard', 'success');
    });
    
    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closePrivateKeyModal();
        }
    });
    
    // Store reference for closing
    window.currentPrivateKeyModal = modalOverlay;
}

// Close private key modal
function closePrivateKeyModal() {
    if (window.currentPrivateKeyModal) {
        document.body.removeChild(window.currentPrivateKeyModal);
        window.currentPrivateKeyModal = null;
    }
}

// Token Management Functions

// Load and display token list
function loadTokenList() {
    console.log('Loading token list...');
    
    // Get manually added tokens from localStorage
    const manualTokens = getManualTokens();
    
    // Get tokens added via wallet_watchAsset from background script
    chrome.runtime.sendMessage({ action: 'getStoredTokens' }, (response) => {
        const watchedTokens = response && response.success ? response.tokens : [];
        
        // Combine both sets of tokens
        const allTokens = [...manualTokens, ...watchedTokens];
        
        // Remove duplicates based on address
        const uniqueTokens = allTokens.filter((token, index, arr) => 
            arr.findIndex(t => t.address.toLowerCase() === token.address.toLowerCase()) === index
        );
        
        displayTokenList(uniqueTokens);
    });
}

// Get manually added tokens from localStorage
function getManualTokens() {
    try {
        const stored = localStorage.getItem('heartWallet_customTokens');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading manual tokens:', error);
        return [];
    }
}

// Save manually added tokens to localStorage
function saveManualTokens(tokens) {
    try {
        localStorage.setItem('heartWallet_customTokens', JSON.stringify(tokens));
        return true;
    } catch (error) {
        console.error('Error saving manual tokens:', error);
        return false;
    }
}

// Display token list in the UI
function displayTokenList(tokens) {
    const tokenList = document.getElementById('tokenList');
    tokenList.innerHTML = '';
    
    if (tokens.length === 0) {
        tokenList.innerHTML = '<div class="no-tokens">No custom tokens added yet.</div>';
        return;
    }
      tokens.forEach(token => {
        const tokenItem = document.createElement('div');
        tokenItem.className = 'token-item';
        
        // Create token info container
        const tokenInfo = document.createElement('div');
        tokenInfo.className = 'token-info';
        
        // Create token icon/placeholder
        if (token.image) {
            const tokenIcon = document.createElement('img');
            tokenIcon.src = token.image;
            tokenIcon.alt = SecurityUtils.escapeHtml(token.symbol);
            tokenIcon.className = 'token-icon';
            tokenInfo.appendChild(tokenIcon);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'token-icon-placeholder';
            placeholder.textContent = '?';
            tokenInfo.appendChild(placeholder);
        }
        
        // Create token details
        const tokenDetails = document.createElement('div');
        tokenDetails.className = 'token-details';
        
        const symbolDiv = document.createElement('div');
        symbolDiv.className = 'token-symbol';
        symbolDiv.textContent = token.symbol;
        tokenDetails.appendChild(symbolDiv);
        
        const addressDiv = document.createElement('div');
        addressDiv.className = 'token-address';
        addressDiv.textContent = token.address;
        tokenDetails.appendChild(addressDiv);
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'token-meta';
        metaDiv.textContent = `Decimals: ${token.decimals} ${token.source ? `• Source: ${token.source}` : '• Manual'}`;
        tokenDetails.appendChild(metaDiv);
        
        tokenInfo.appendChild(tokenDetails);
        tokenItem.appendChild(tokenInfo);
          // Create token actions
        const tokenActions = document.createElement('div');
        tokenActions.className = 'token-actions';
        
        // Always show remove button for user-added tokens
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-token-btn';
        
        // Create Font Awesome icon
        const icon = document.createElement('i');
        icon.className = 'fas fa-trash';
        removeBtn.appendChild(icon);
        
        removeBtn.onclick = () => removeToken(token.address);
        tokenActions.appendChild(removeBtn);
        
        // Show source information
        if (token.source === 'wallet_watchAsset') {
            const sourceSpan = document.createElement('span');
            sourceSpan.className = 'token-source';
            sourceSpan.textContent = 'Added via dApp';
            tokenActions.appendChild(sourceSpan);
        }
        
        tokenItem.appendChild(tokenActions);
        tokenList.appendChild(tokenItem);
    });
}

// Handle add token form submission
function handleAddToken(e) {
    e.preventDefault();
    
    const address = document.getElementById('tokenAddress').value.trim();
    const symbol = document.getElementById('tokenSymbol').value.trim();
    const decimals = parseInt(document.getElementById('tokenDecimals').value);
    const image = document.getElementById('tokenImage').value.trim();
    
    // Validate inputs
    if (!address || !symbol || isNaN(decimals)) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Validate Ethereum address format
    if (!isValidEthereumAddress(address)) {
        showNotification('Please enter a valid Ethereum address.', 'error');
        return;
    }
    
    // Add the token
    if (addToken(address, symbol, decimals, image)) {
        // Clear form
        document.getElementById('addTokenForm').reset();
        document.getElementById('tokenDecimals').value = 18; // Reset to default
        
        // Reload token list
        loadTokenList();
        
        showNotification(`Token ${symbol} added successfully!`, 'success');
    } else {
        showNotification('Failed to add token. It may already exist.', 'error');
    }
}

// Add a new token
function addToken(address, symbol, decimals, image = '') {
    try {
        const manualTokens = getManualTokens();
        
        // Check if token already exists (case-insensitive)
        const exists = manualTokens.some(token => 
            token.address.toLowerCase() === address.toLowerCase()
        );
        
        if (exists) {
            return false;
        }
        
        // Create new token object
        const newToken = {
            address: address,
            symbol: symbol,
            decimals: decimals,
            image: image,
            dateAdded: new Date().toISOString()
        };
        
        // Add to list and save
        manualTokens.push(newToken);
        return saveManualTokens(manualTokens);
        
    } catch (error) {
        console.error('Error adding token:', error);
        return false;
    }
}

// Remove a token (only manually added tokens can be removed)
function removeToken(address) {
    if (!confirm('Are you sure you want to remove this token?')) {
        return;
    }
    
    console.log('Removing token from settings:', address);
    
    try {        // First, try to remove from manual tokens (localStorage)
        const manualTokens = getManualTokens();
        console.log('Manual tokens before removal:', manualTokens);
        const filteredManualTokens = manualTokens.filter(token => 
            token.address.toLowerCase() !== address.toLowerCase()
        );
        
        // Check if token was found in manual tokens
        const foundInManual = manualTokens.length !== filteredManualTokens.length;
        console.log('Found in manual tokens:', foundInManual);
        
        if (foundInManual) {
            // Token was in manual storage, remove it
            console.log('Removing token from manual storage');
            if (saveManualTokens(filteredManualTokens)) {
                loadTokenList();
                showNotification('Token removed successfully!', 'success');
                return;
            } else {
                showNotification('Failed to remove token.', 'error');
                return;
            }
        }
        
        // If not found in manual tokens, try to remove from background storage (dApp tokens)
        console.log('Token not found in manual storage, trying background storage');
        chrome.runtime.sendMessage({
            action: 'removeStoredToken',
            address: address
        }, (response) => {
            console.log('Background response for token removal:', response);
            if (response && response.success) {
                loadTokenList();
                showNotification('Token removed successfully!', 'success');
            } else {
                showNotification('Token not found in storage.', 'error');
            }
        });
        
    } catch (error) {
        console.error('Error removing token:', error);
        showNotification('Failed to remove token.', 'error');
    }
}

// Validate Ethereum address format
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Connected Sites Management

// Load connected sites
function loadConnectedSites() {
    chrome.runtime.sendMessage({ action: 'getConnectedSites' }, (response) => {
        if (response && response.success) {
            displayConnectedSites(response.sites);
        } else {
            console.error('Failed to load connected sites');
        }
    });
}

// Display connected sites
function displayConnectedSites(sites) {
    const sitesList = document.getElementById('connectedSitesList');
    sitesList.innerHTML = '';
    
    if (!sites || sites.length === 0) {
        sitesList.innerHTML = '<div class="no-sites">No connected sites.</div>';
        return;
    }
      sites.forEach(site => {
        const siteItem = document.createElement('div');
        siteItem.className = 'connected-site-item';
        
        // Create site info container
        const siteInfo = document.createElement('div');
        siteInfo.className = 'site-info';
        
        const originDiv = document.createElement('div');
        originDiv.className = 'site-origin';
        originDiv.textContent = site.origin;
        siteInfo.appendChild(originDiv);
        
        const addressDiv = document.createElement('div');
        addressDiv.className = 'site-address';
        addressDiv.textContent = site.address;
        siteInfo.appendChild(addressDiv);
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'site-date';
        dateDiv.textContent = `Connected: ${new Date(site.dateConnected).toLocaleDateString()}`;
        siteInfo.appendChild(dateDiv);
        
        siteItem.appendChild(siteInfo);
          // Create disconnect button
        const disconnectBtn = document.createElement('button');
        disconnectBtn.className = 'disconnect-site-btn';
        
        // Create Font Awesome icon
        const icon = document.createElement('i');
        icon.className = 'fas fa-unlink';
        disconnectBtn.appendChild(icon);
        
        // Add text label
        const textNode = document.createTextNode(' Disconnect');
        disconnectBtn.appendChild(textNode);
        
        disconnectBtn.onclick = () => disconnectSite(site.origin);
        siteItem.appendChild(disconnectBtn);
        
        sitesList.appendChild(siteItem);
    });
}

// Disconnect a specific site
function disconnectSite(origin) {
    if (!confirm(`Disconnect from ${origin}?`)) {
        return;
    }
    
    chrome.runtime.sendMessage({ 
        action: 'disconnectSite', 
        origin: origin 
    }, (response) => {
        if (response && response.success) {
            loadConnectedSites(); // Reload the list
            showNotification(`Disconnected from ${origin}`, 'success');
        } else {
            showNotification('Failed to disconnect site.', 'error');
        }
    });
}

// Disconnect all sites
function disconnectAllSites() {
    if (!confirm('Disconnect from all connected sites? This action cannot be undone.')) {
        return;
    }
    
    chrome.runtime.sendMessage({ action: 'disconnectAllSites' }, (response) => {
        if (response && response.success) {
            loadConnectedSites(); // Reload the list
            showNotification('Disconnected from all sites.', 'success');
        } else {
            showNotification('Failed to disconnect all sites.', 'error');        }
    });
}

// Debug function to check wallet storage
async function debugWalletStorage() {
    console.log('=== WALLET STORAGE DEBUG ===');
    
    try {
        // Check if WalletCore is available
        console.log('WalletCore available?', typeof WalletCore);
        console.log('ethers available?', typeof ethers);
        console.log('walletCore instance:', walletCore);
        
        if (!walletCore) {
            console.error('WalletCore not initialized');
            alert('WalletCore not initialized. Check console for details.');
            return;
        }
        
        // Get all storage data
        chrome.storage.local.get(null, (items) => {
            console.log('=== ALL STORAGE DATA ===');
            console.log('Total items in storage:', Object.keys(items).length);
            console.log('All storage keys:', Object.keys(items));
            console.log('Full storage data:', items);
            
            // Look for wallet-related keys
            const walletKeys = Object.keys(items).filter(key => 
                key.includes('wallet') || key.includes('Wallet')
            );
            console.log('Wallet-related keys:', walletKeys);
            
            // Check walletList specifically
            if (items.walletList) {
                console.log('walletList found:', items.walletList);
                console.log('Number of wallets:', items.walletList.length);
            } else {
                console.log('walletList NOT found in storage');
            }
            
            // Check activeWalletId
            if (items.activeWalletId) {
                console.log('activeWalletId:', items.activeWalletId);
            } else {
                console.log('activeWalletId NOT found');
            }
            
            alert(`Storage Debug Complete! Found ${Object.keys(items).length} total items, ${walletKeys.length} wallet-related keys. Check console for details.`);
        });
        
        // Test WalletCore methods
        console.log('=== TESTING WALLETCORE METHODS ===');
        const wallets = await walletCore.getWalletList();
        console.log('getWalletList() result:', wallets);
        console.log('Number of wallets returned:', wallets.length);
        
        const activeId = await walletCore.getActiveWalletId();
        console.log('getActiveWalletId() result:', activeId);
        
    } catch (error) {
        console.error('Error in debugWalletStorage:', error);
        alert(`Debug error: ${error.message}`);
    }
    
    console.log('=== END WALLET STORAGE DEBUG ===');
}

// Utility Functions

// Show notification to user
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Close settings page
function closeSettings() {
    if (window.close) {
        window.close();
    } else {
        // If window.close() doesn't work (some browsers block it)
        history.back();
    }
}
