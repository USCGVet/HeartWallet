document.addEventListener('DOMContentLoaded', async () => {
    // Get request details from URL parameters
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('requestId');
    const origin = params.get('origin');
    const isReconnection = params.get('reconnection') === 'true';
    
    // UI elements
    const originDisplay = document.getElementById('origin-display');
    const activeWallet = document.getElementById('active-wallet');
    const unlockSection = document.getElementById('unlock-section');
    const walletPassword = document.getElementById('wallet-password');
    const unlockBtn = document.getElementById('unlock-btn');
    const unlockError = document.getElementById('unlock-error');
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const alternativeUnlock = document.getElementById('alternative-unlock');
    const errorMessage = document.getElementById('error-message');
    
    // Display site origin
    originDisplay.textContent = origin || 'Unknown origin';
    
    // State variables
    let isProcessingUnlock = false;
    let isCheckingStatus = false;
    let userIsTyping = false;
    let statusCheckTimer = null;
    
    // Check if ethers.js is available
    if (!window.ethers) {
        console.error('Ethers library not available');
        showError('Wallet library could not be loaded. Please reload the extension.');
    }
    
    // Initialize UI based on connection type
    initializeUI();
    
    // Check wallet status only once on load
    await checkWalletStatus();
    
    // Add event listeners
    unlockBtn.addEventListener('click', handleUnlock);
    
    // Track when user is typing to prevent refreshes
    walletPassword.addEventListener('focus', () => {
        userIsTyping = true;
    });
    
    walletPassword.addEventListener('blur', () => {
        userIsTyping = false;
    });
    
    walletPassword.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleUnlock();
    });
    
    approveBtn.addEventListener('click', handleApprove);
    rejectBtn.addEventListener('click', handleReject);
    
    // Initialize UI based on connection type
    function initializeUI() {
        if (isReconnection) {
            // This is a reconnection - update UI text and behavior
            document.querySelector('h2').textContent = 'Reconnect Wallet';
            document.querySelector('.connection-container p').textContent = 'This site was previously connected to your wallet. Please unlock your wallet to reconnect:';
              // Update warning text for reconnection
            const warningElement = document.querySelector('.warning');
            // Clear existing content
            warningElement.textContent = '';
            
            // Create icon element
            const icon = document.createElement('i');
            icon.className = 'fas fa-info-circle';
            warningElement.appendChild(icon);            
            // Add text content
            warningElement.appendChild(document.createTextNode(' This site was previously authorized. Unlocking your wallet will automatically reconnect.'));
            
            warningElement.className = 'connection-warning';
            
            // Hide connect/reject buttons initially for reconnections
            approveBtn.className = approveBtn.className + ' element-hidden';
            rejectBtn.textContent = 'Cancel';
            
            // Show unlock section immediately for reconnections
            unlockSection.className = unlockSection.className.replace('element-hidden', '') + ' element-block';
            unlockSection.querySelector('h3').textContent = 'Unlock to Reconnect';
            unlockSection.querySelector('p').textContent = 'Enter your wallet password to reconnect to this site.';
        }
    }

    // Check wallet status only once on load
    async function checkWalletStatus() {
        // Don't check status if user is typing or if we're already checking
        if (userIsTyping || isCheckingStatus || isProcessingUnlock) {
            return;
        }
        
        isCheckingStatus = true;
        
        try {
            const response = await chrome.runtime.sendMessage({ action: "getSessionInfo" });
            
            if (response && response.isLoggedIn && response.walletData) {
                // Wallet is logged in - don't change UI if user is typing
                const address = response.walletData.address;
                const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
                
                // Only update if not typing
                if (!userIsTyping) {                    activeWallet.textContent = shortAddress;
                    
                    // Enable approve button
                    approveBtn.disabled = false;
                    unlockSection.className = unlockSection.className + ' element-hidden';
                    alternativeUnlock.className = alternativeUnlock.className + ' element-hidden';
                }
            } else {
                // Wallet is not logged in - but don't change UI if user is typing
                if (!userIsTyping) {
                    activeWallet.textContent = 'Wallet locked - please unlock first';
                    activeWallet.classList.add('wallet-locked');
                    
                    // Show unlock section
                    unlockSection.className = unlockSection.className.replace('element-hidden', '') + ' element-block';
                    alternativeUnlock.className = alternativeUnlock.className.replace('element-hidden', '') + ' element-block';
                    
                    // Disable approve button
                    approveBtn.disabled = true;
                    
                    // Focus on password field for better UX
                    walletPassword.focus();
                }
            }
        } catch (error) {
            console.error('Error checking wallet status:', error);
            if (!userIsTyping) {
                showError('Failed to check wallet status. Please try again.');
            }
        } finally {
            isCheckingStatus = false;
        }
    }    // Handle wallet unlock
    async function handleUnlock() {
        const password = walletPassword.value;
          if (!password) {
            unlockError.textContent = 'Please enter your password';
            unlockError.className = unlockError.className + ' unlock-error-visible';
            return;
        }
        
        // Prevent multiple unlock attempts
        if (isProcessingUnlock) {
            return;
        }
        
        isProcessingUnlock = true;
          // Show loading state
        unlockBtn.disabled = true;
        unlockBtn.textContent = '';
        const loadingSpan = document.createElement('span');
        loadingSpan.className = 'loading';
        unlockBtn.appendChild(loadingSpan);
        unlockBtn.appendChild(document.createTextNode(' Unlocking...'));
        unlockError.className = unlockError.className.replace(' unlock-error-visible', '');
        
        try {
            // Send unlock request to background script to use the new wallet system
            const response = await chrome.runtime.sendMessage({
                action: 'unlockWallet',
                password: password
            });
            
            if (response && response.success && response.walletData) {
                // Update UI to show logged-in state
                const address = response.walletData.address;
                const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
                
                activeWallet.textContent = shortAddress;
                activeWallet.classList.remove('wallet-locked');
                approveBtn.disabled = false;
                unlockSection.className = unlockSection.className + ' element-hidden';
                alternativeUnlock.className = alternativeUnlock.className + ' element-hidden';
                
                walletPassword.value = '';
                
                // Show success message
                unlockBtn.textContent = 'Unlocked!';
                unlockBtn.style.backgroundColor = '#28a745';
                
                // Focus on approve button for better UX
                if (!isReconnection) {
                    approveBtn.focus();
                }
                  // For reconnections, automatically approve the connection after unlocking
                if (isReconnection) {
                    console.log('Wallet unlocked for reconnection, auto-approving...');
                    unlockBtn.textContent = '';
                    const reconnectSpan = document.createElement('span');
                    reconnectSpan.className = 'loading';
                    unlockBtn.appendChild(reconnectSpan);
                    unlockBtn.appendChild(document.createTextNode(' Reconnecting...'));
                    
                    // Send approval automatically for reconnections
                    const approvalResponse = await chrome.runtime.sendMessage({
                        action: 'connection_response',
                        requestId: requestId,
                        approved: true
                    });
                    
                    if (approvalResponse && approvalResponse.success) {
                        window.close();
                    } else {
                        throw new Error(approvalResponse?.error || 'Reconnection failed');
                    }
                }
                
            } else {
                throw new Error(response?.error || 'Failed to unlock wallet');
            }
            
        } catch (error) {
            console.error('Unlock error:', error);            unlockError.textContent = error.message || 'Failed to unlock wallet';
            unlockError.className = unlockError.className + ' unlock-error-visible';
        } finally {
            // Reset button state
            unlockBtn.disabled = false;
            unlockBtn.textContent = 'Unlock Wallet';
            isProcessingUnlock = false;
        }
    }
      // Handle connection approval
    async function handleApprove() {
        approveBtn.disabled = true;
        approveBtn.textContent = '';
        const connectSpan = document.createElement('span');
        connectSpan.className = 'loading';
        approveBtn.appendChild(connectSpan);
        approveBtn.appendChild(document.createTextNode(' Connecting...'));
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'connection_response',
                requestId: requestId,
                approved: true
            });
            
            if (response && response.success) {
                window.close();
            } else {
                throw new Error(response?.error || 'Connection approval failed');
            }
        } catch (error) {
            console.error('Approval error:', error);
            showError('Connection approval failed: ' + (error.message || 'Unknown error'));
            approveBtn.disabled = false;
            approveBtn.textContent = 'Connect';
        }
    }
    
    // Handle connection rejection
    async function handleReject() {
        rejectBtn.disabled = true;
        
        try {
            await chrome.runtime.sendMessage({
                action: 'connection_response',
                requestId: requestId,
                approved: false
            });
        } catch (error) {
            console.error('Rejection error:', error);
        } finally {
            // Close the popup regardless of success/failure
            window.close();
        }
    }    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = errorMessage.className + ' unlock-error-visible';
    }
});
