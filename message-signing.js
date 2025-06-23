// Message Signing Logic
class MessageSigning {
    constructor() {
        this.requestId = null;
        this.origin = null;
        this.message = null;
        this.address = null;
        
        this.init();
    }

    async init() {
        // Get parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.requestId = urlParams.get('requestId');
        this.origin = urlParams.get('origin');
        
        if (!this.requestId) {
            this.showError('Invalid request');
            return;
        }

        // Set up event listeners
        this.setupEventListeners();
        
        // Load signing details
        await this.loadSigningDetails();
    }

    setupEventListeners() {
        document.getElementById('reject-btn').addEventListener('click', () => {
            this.rejectSignature();
        });

        document.getElementById('sign-btn').addEventListener('click', () => {
            this.signMessage();
        });
    }

    async loadSigningDetails() {
        try {
            // Request signing details from background
            const response = await chrome.runtime.sendMessage({
                action: 'getSigningRequest',
                requestId: this.requestId
            });

            if (!response || !response.success) {
                throw new Error('Failed to load signing details');
            }

            const request = response.request;
            this.message = request.message;
            this.address = request.address;
            
            // Display details
            document.getElementById('site-origin').textContent = this.origin;
            
            // Display message (decode if it's hex)
            let displayMessage = this.message;
            if (this.message.startsWith('0x')) {
                try {
                    const bytes = ethers.getBytes(this.message);
                    displayMessage = ethers.toUtf8String(bytes);
                } catch (e) {
                    // If it fails to decode, show as hex
                    displayMessage = this.message;
                }
            }
            
            document.getElementById('message-content').textContent = displayMessage;
            document.getElementById('signing-address').textContent = this.formatAddress(this.address);
            
        } catch (error) {
            console.error('Error loading signing details:', error);
            this.showError('Failed to load signing request');
        }
    }

    formatAddress(address) {
        if (!address) return 'Unknown';
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    }

    async signMessage() {
        try {
            // Disable buttons
            document.getElementById('sign-btn').disabled = true;
            document.getElementById('reject-btn').disabled = true;
            document.getElementById('sign-btn').textContent = 'Signing...';
            
            // Send signing confirmation to background
            const response = await chrome.runtime.sendMessage({
                action: 'confirmSigning',
                requestId: this.requestId
            });
            
            if (response && response.success) {
                // Show success briefly then close
                document.getElementById('sign-btn').textContent = '✓ Signed';
                setTimeout(() => {
                    window.close();
                }, 1000);
            } else {
                throw new Error(response?.error || 'Signing failed');
            }
            
        } catch (error) {
            console.error('Error signing message:', error);
            alert('Signing failed: ' + error.message);
            
            // Re-enable buttons
            document.getElementById('sign-btn').disabled = false;
            document.getElementById('reject-btn').disabled = false;
            document.getElementById('sign-btn').textContent = 'Sign';
        }
    }

    rejectSignature() {
        chrome.runtime.sendMessage({
            action: 'rejectSigning',
            requestId: this.requestId
        });
        
        window.close();
    }

    showError(message) {
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h3 style="color: #f44336;">Error</h3>
                <p>${SecurityUtils.escapeHtml(message)}</p>
                <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px;">Close</button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MessageSigning();
});