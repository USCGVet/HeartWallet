// token-confirmation.js
let currentWindowId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Token confirmation popup loaded');
    
    // Get the current window ID for messaging
    chrome.windows.getCurrent((window) => {
        currentWindowId = window.id;
        console.log('Token confirmation window ID:', currentWindowId);
    });
    
    // Parse token data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenDataParam = urlParams.get('data');
    
    if (!tokenDataParam) {
        console.error('No token data provided in URL');
        showError('No token data provided');
        return;
    }
    
    let tokenData;
    try {
        tokenData = JSON.parse(decodeURIComponent(tokenDataParam));
        console.log('Parsed token data:', tokenData);
    } catch (error) {
        console.error('Failed to parse token data:', error);
        showError('Invalid token data');
        return;
    }
    
    // Populate the UI with token information
    populateTokenInfo(tokenData);
    
    // Set up event listeners
    document.getElementById('cancelBtn').addEventListener('click', () => {
        sendConfirmation(false);
    });
    
    document.getElementById('addBtn').addEventListener('click', () => {
        sendConfirmation(true);
    });
    
    // Handle escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            sendConfirmation(false);
        }
    });
    
    // Close window when clicked outside (optional)
    window.addEventListener('blur', () => {
        // Don't auto-close on blur as it might be annoying
        // sendConfirmation(false);
    });
});

function populateTokenInfo(tokenData) {
    try {
        // Set origin information
        const originElement = document.getElementById('requestOrigin');
        if (originElement) {
            originElement.textContent = tokenData.origin || 'Unknown source';
        }
        
        // Set token symbol
        const symbolElement = document.getElementById('tokenSymbol');
        if (symbolElement) {
            symbolElement.textContent = tokenData.symbol || 'Unknown';
        }
        
        // Set token address
        const addressElement = document.getElementById('tokenAddress');
        if (addressElement) {
            const address = tokenData.address || 'Unknown';
            // Truncate long addresses for display
            addressElement.textContent = address.length > 20 ? 
                `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 
                address;
            addressElement.title = address; // Show full address on hover
        }
        
        // Set token decimals
        const decimalsElement = document.getElementById('tokenDecimals');
        if (decimalsElement) {
            decimalsElement.textContent = tokenData.decimals?.toString() || '18';
        }
        
        // Set token type
        const typeElement = document.getElementById('tokenType');
        if (typeElement) {
            typeElement.textContent = tokenData.type || 'ERC20';
        }
          // Handle token image
        const imageElement = document.getElementById('tokenImage');
        const placeholderElement = document.getElementById('tokenPlaceholder');
        
        if (tokenData.image && tokenData.image.trim()) {
            // Set up error and load handlers before setting src
            imageElement.onerror = () => {
                imageElement.className = 'token-image-hidden';
                placeholderElement.className = 'placeholder token-placeholder-flex';
                placeholderElement.textContent = tokenData.symbol ? tokenData.symbol.charAt(0).toUpperCase() : '?';
            };
            
            imageElement.onload = () => {
                imageElement.className = 'token-image-visible';
                placeholderElement.className = 'placeholder token-placeholder-hidden';
            };
            
            // Set src after handlers are in place
            imageElement.src = tokenData.image;
        } else {
            // No image provided, show placeholder
            imageElement.className = 'token-image-hidden';
            placeholderElement.className = 'placeholder token-placeholder-flex';
            placeholderElement.textContent = tokenData.symbol ? tokenData.symbol.charAt(0).toUpperCase() : '?';
        }
        
    } catch (error) {
        console.error('Error populating token info:', error);
        showError('Error displaying token information');
    }
}

function sendConfirmation(confirmed) {
    console.log('Sending token confirmation:', confirmed);
    
    // Show loading state if confirmed
    if (confirmed) {
        showLoading(true);
    }
    
    // If windowId is not set yet, get it synchronously
    if (!currentWindowId) {
        console.warn('Window ID not set, trying to get it now...');
        chrome.windows.getCurrent((window) => {
            currentWindowId = window.id;
            performSendConfirmation(confirmed);
        });
    } else {
        performSendConfirmation(confirmed);
    }
}

function performSendConfirmation(confirmed) {
    // Send message to background script
    try {
        chrome.runtime.sendMessage({
            action: 'tokenConfirmation',
            confirmed: confirmed,
            windowId: currentWindowId || 'unknown'
        }, (response) => {
            console.log('Confirmation response:', response);
            
            // Close the popup window
            setTimeout(() => {
                window.close();
            }, confirmed ? 1000 : 100); // Slight delay if adding token to show success
        });
    } catch (error) {
        console.error('Error sending confirmation:', error);
        showError('Error communicating with wallet');
    }
}

function showError(message) {    // Hide the main content and show error
    const tokenContent = document.getElementById('tokenContent');
    const loadingState = document.getElementById('loadingState');
    
    if (tokenContent) tokenContent.className = (tokenContent.className + ' content-hidden').trim();
    if (loadingState) loadingState.className = (loadingState.className + ' content-hidden').trim();
      // Create or update error display
    let errorDiv = document.getElementById('errorState');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorState';
        errorDiv.className = 'token-error-container';
        document.querySelector('.container').appendChild(errorDiv);
    }
      // Clear existing content
    errorDiv.textContent = '';
    
    // Create error icon
    const icon = document.createElement('div');
    icon.className = 'token-error-icon';
    icon.textContent = '⚠️';
    errorDiv.appendChild(icon);
    
    // Create error title
    const title = document.createElement('div');
    title.className = 'token-error-title';
    title.textContent = 'Error';
    errorDiv.appendChild(title);
      // Create error message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'token-error-message';
    messageDiv.textContent = message;
    errorDiv.appendChild(messageDiv);
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'token-error-close-btn';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => window.close();
    errorDiv.appendChild(closeBtn);
}

function showLoading(show) {
    const tokenContent = document.getElementById('tokenContent');
    const loadingState = document.getElementById('loadingState');
    
    if (tokenContent && loadingState) {
        if (show) {
            tokenContent.className = (tokenContent.className + ' content-hidden').trim();
            loadingState.classList.add('active');
        } else {
            tokenContent.className = tokenContent.className.replace('content-hidden', '').trim();
            if (!tokenContent.className.includes('content-block')) {
                tokenContent.className = (tokenContent.className + ' content-block').trim();
            }
            loadingState.classList.remove('active');
        }
    }
}

// Handle potential errors from chrome extension APIs
chrome.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
            console.log('Extension context invalidated:', chrome.runtime.lastError.message);
        }
    });
});
