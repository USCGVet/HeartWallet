// Notification Core Module - Handles user notifications and feedback
class NotificationManager {
    constructor() {
        this.notifications = new Map();
        this.notificationId = 0;
        this.container = null;
        this.init();
    }

    init() {
        // Create notification container if it doesn't exist
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    // Show a notification with auto-dismiss
    show(message, type = 'info', duration = 5000, actions = null) {
        const id = ++this.notificationId;
        const notification = this.createNotification(id, message, type, actions);
        
        this.notifications.set(id, notification);
        this.container.appendChild(notification.element);
        
        // Trigger animation
        setTimeout(() => {
            notification.element.classList.add('show');
        }, 10);
        
        // Auto-dismiss if duration is set
        if (duration > 0) {
            notification.timeout = setTimeout(() => {
                this.dismiss(id);
            }, duration);
        }
        
        return id;
    }

    // Show a persistent notification (requires manual dismiss)
    showPersistent(message, type = 'info', actions = null) {
        return this.show(message, type, 0, actions);
    }

    // Show a progress notification that can be updated
    showProgress(message, type = 'info') {
        const id = this.show(message, type, 0);
        const notification = this.notifications.get(id);
          // Add progress indicator
        const progressBar = document.createElement('div');
        progressBar.className = 'notification-progress';
        
        const progressBarInner = document.createElement('div');
        progressBarInner.className = 'progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        
        progressBarInner.appendChild(progressFill);
        progressBar.appendChild(progressBarInner);
        notification.element.appendChild(progressBar);
        
        return {
            id: id,
            updateProgress: (percent, newMessage) => this.updateProgress(id, percent, newMessage),
            updateMessage: (newMessage) => this.updateMessage(id, newMessage),
            complete: (successMessage, isSuccess = true) => this.completeProgress(id, successMessage, isSuccess),
            fail: (errorMessage) => this.completeProgress(id, errorMessage, false)
        };
    }

    // Update progress notification
    updateProgress(id, percent, message = null) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        if (message) {
            this.updateMessage(id, message);
        }
          const progressFill = notification.element.querySelector('.progress-fill');
        if (progressFill) {
            const widthPercent = Math.min(100, Math.max(0, percent)) + '%';
            progressFill.style.setProperty('--progress-width', widthPercent);
        }
    }

    // Update notification message
    updateMessage(id, message) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        const messageElement = notification.element.querySelector('.notification-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }    // Complete a progress notification
    completeProgress(id, message, isSuccess = true) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        // Update message and type
        this.updateMessage(id, message);
        notification.element.className = `notification ${isSuccess ? 'success' : 'error'} show`;
        
        // Remove progress bar
        const progressBar = notification.element.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.remove();
        }
        
        // Auto-dismiss after completion with shorter time for success, longer for errors
        const dismissTime = isSuccess ? 3000 : 6000;
        setTimeout(() => {
            this.dismiss(id);
        }, dismissTime);
    }

    // Dismiss a notification
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        // Clear timeout if exists
        if (notification.timeout) {
            clearTimeout(notification.timeout);
        }
        
        // Animate out
        notification.element.classList.remove('show');
        notification.element.classList.add('hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 300);
    }

    // Dismiss all notifications
    dismissAll() {
        this.notifications.forEach((notification, id) => {
            this.dismiss(id);
        });
    }

    // Create notification element
    createNotification(id, message, type, actions) {
        const element = document.createElement('div');
        element.className = `notification ${type}`;
        element.dataset.id = id;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        element.appendChild(messageElement);
        
        // Add action buttons if provided
        if (actions && actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'notification-actions';
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = `notification-btn ${action.type || 'default'}`;
                button.textContent = action.label;
                button.onclick = () => {
                    if (action.handler) {
                        action.handler();
                    }
                    if (action.dismiss !== false) {
                        this.dismiss(id);
                    }
                };
                actionsContainer.appendChild(button);
            });
            
            element.appendChild(actionsContainer);
        }
          // Add close button for persistent notifications
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.onclick = () => this.dismiss(id);
        element.appendChild(closeButton);
        
        return {
            element: element,
            timeout: null
        };
    }

    // Blockchain-specific notification methods
    blockchainOperation(operationType, details = {}) {
        const messages = {
            'transaction': 'Preparing transaction...',
            'approval': 'Preparing token approval...',
            'swap': 'Preparing token swap...',
            'stake': 'Preparing staking operation...',
            'unstake': 'Preparing unstaking operation...'
        };
        
        const message = messages[operationType] || 'Preparing blockchain operation...';
        
        return this.showProgress(message, 'info');
    }

    // Transaction-specific notifications
    transactionSubmitted(txHash, networkName = 'PulseChain', options = {}) {
        const actions = [
            {
                label: 'View on Explorer',
                type: 'primary',
                handler: async () => {
                    // Get the correct explorer URL from background based on current network
                    try {
                        const response = await chrome.runtime.sendMessage({ action: 'GET_EXPLORER_URL' });
                        if (response && response.url) {
                            window.open(`${response.url}#/tx/${txHash}`, '_blank');
                        }
                    } catch (error) {
                        console.error('Error opening block explorer:', error);
                    }
                },
                dismiss: false
            }
        ];
        
        return this.show(
            `Transaction submitted to ${networkName}. Hash: ${this.formatHash(txHash)}`,
            'success',
            8000,
            actions
        );
    }

    transactionConfirmed(txHash, networkName = 'PulseChain', confirmations = 1) {
        const actions = [
            {
                label: 'View on Explorer',
                type: 'primary',
                handler: async () => {
                    // Get the correct explorer URL from background based on current network
                    try {
                        const response = await chrome.runtime.sendMessage({ action: 'GET_EXPLORER_URL' });
                        if (response && response.url) {
                            window.open(`${response.url}#/tx/${txHash}`, '_blank');
                        }
                    } catch (error) {
                        console.error('Error opening block explorer:', error);
                    }
                },
                dismiss: false
            }
        ];
        
        return this.show(
            `Transaction confirmed on ${networkName}! (${confirmations} confirmation${confirmations > 1 ? 's' : ''})`,
            'success',
            6000,
            actions
        );
    }

    transactionFailed(error, txHash = null) {
        let message = 'Transaction failed: ' + (error.message || error);
        
        const actions = [];
        if (txHash) {
            message += ` Hash: ${this.formatHash(txHash)}`;
            actions.push({
                label: 'View on Explorer',
                type: 'secondary',
                handler: () => {
                    const explorerUrl = `https://scan.pulsechain.com/tx/${txHash}`;
                    window.open(explorerUrl, '_blank');
                },
                dismiss: false
            });
        }
        
        return this.show(message, 'error', 10000, actions);
    }

    // Utility methods
    formatHash(hash) {
        if (!hash) return '';
        return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    }

    // Network status notifications
    networkConnected(networkName) {
        return this.show(`Connected to ${networkName}`, 'success', 3000);
    }

    networkDisconnected(networkName) {
        return this.show(`Disconnected from ${networkName}`, 'warning', 4000);
    }

    networkSwitched(fromNetwork, toNetwork) {
        return this.show(`Switched from ${fromNetwork} to ${toNetwork}`, 'info', 4000);
    }

    // Wallet notifications
    walletUnlocked(address) {
        return this.show(`Wallet unlocked: ${this.formatHash(address)}`, 'success', 3000);
    }

    walletLocked() {
        return this.show('Wallet locked', 'info', 3000);
    }

    walletImported(address) {
        return this.show(`Wallet imported successfully: ${this.formatHash(address)}`, 'success', 4000);
    }

    walletAdded(address) {
        return this.show(`Additional wallet added: ${this.formatHash(address)}`, 'success', 4000);
    }

    walletSwitched(address) {
        return this.show(`Switched to wallet: ${this.formatHash(address)}`, 'info', 3000);
    }

    walletRemoved(address) {
        return this.show(`Wallet removed: ${this.formatHash(address)}`, 'warning', 4000);
    }

    // Token notifications
    tokenAdded(tokenSymbol, contractAddress) {
        return this.show(`${tokenSymbol} token added: ${this.formatHash(contractAddress)}`, 'success', 4000);
    }

    tokenRemoved(tokenSymbol) {
        return this.show(`${tokenSymbol} token removed from wallet`, 'warning', 3000);
    }

    tokenTransferSubmitted(amount, tokenSymbol, toAddress, txHash) {
        const actions = [
            {
                label: 'View on Explorer',
                type: 'primary',
                handler: async () => {
                    // Get the correct explorer URL from background based on current network
                    try {
                        const response = await chrome.runtime.sendMessage({ action: 'GET_EXPLORER_URL' });
                        if (response && response.url) {
                            window.open(`${response.url}#/tx/${txHash}`, '_blank');
                        }
                    } catch (error) {
                        console.error('Error opening block explorer:', error);
                    }
                },
                dismiss: false
            }
        ];
        
        return this.show(
            `${amount} ${tokenSymbol} sent to ${this.formatHash(toAddress)}. Hash: ${this.formatHash(txHash)}`,
            'success',
            8000,
            actions
        );
    }

    tokenTransferFailed(error, tokenSymbol, amount) {
        return this.show(`Failed to send ${amount} ${tokenSymbol}: ${error.message || error}`, 'error', 8000);
    }

    // Balance notifications
    balanceUpdated(token, amount) {
        return this.show(`${token} balance updated: ${amount}`, 'info', 3000);
    }
}

// Export for use in other modules
window.NotificationManager = NotificationManager;
