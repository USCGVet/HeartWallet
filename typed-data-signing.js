// Typed Data Signing Logic (EIP-712)
class TypedDataSigning {
    constructor() {
        this.requestId = null;
        this.origin = null;
        this.typedData = null;
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
            this.signTypedData();
        });
    }

    async loadSigningDetails() {
        try {
            // Request signing details from background
            const response = await chrome.runtime.sendMessage({
                action: 'getTypedDataRequest',
                requestId: this.requestId
            });

            if (!response || !response.success) {
                throw new Error('Failed to load signing details');
            }

            const request = response.request;
            this.typedData = request.typedData;
            this.address = request.address;
            
            // Display details
            document.getElementById('site-origin').textContent = this.origin;
            
            // Parse and display typed data
            this.displayTypedData();
            
            // Display signing address
            document.getElementById('signing-address').textContent = this.formatAddress(this.address);
            
            // Hide loading, show content
            document.getElementById('loading-section').style.display = 'none';
            document.getElementById('signing-content').style.display = 'block';
            
            // Enable sign button
            document.getElementById('sign-btn').disabled = false;
            
        } catch (error) {
            console.error('Error loading signing details:', error);
            this.showError('Failed to load signing request');
        }
    }

    displayTypedData() {
        try {
            const data = typeof this.typedData === 'string' ? 
                JSON.parse(this.typedData) : this.typedData;
            
            // Display domain
            if (data.domain) {
                this.displayDomain(data.domain);
            }
            
            // Display message type
            if (data.primaryType && data.types) {
                this.displayMessageType(data.primaryType, data.types);
            }
            
            // Display message content
            if (data.message) {
                this.displayMessage(data.message, data.primaryType, data.types);
                
                // Check for permit-like operations
                this.checkForPermit(data);
            }
            
        } catch (error) {
            console.error('Error parsing typed data:', error);
            // Fallback to raw display
            document.getElementById('message-content').textContent = 
                JSON.stringify(this.typedData, null, 2);
        }
    }

    displayDomain(domain) {
        const domainContent = document.getElementById('domain-content');
        domainContent.innerHTML = '';
        
        const fields = ['name', 'version', 'chainId', 'verifyingContract', 'salt'];
        
        fields.forEach(field => {
            if (domain[field] !== undefined) {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'data-field';
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'field-name';
                nameSpan.textContent = this.formatFieldName(field);
                
                const valueSpan = document.createElement('span');
                valueSpan.className = 'field-value';
                
                if (field === 'verifyingContract') {
                    valueSpan.textContent = this.formatAddress(domain[field]);
                } else if (field === 'chainId') {
                    valueSpan.textContent = this.getChainName(domain[field]);
                } else {
                    valueSpan.textContent = domain[field];
                }
                
                fieldDiv.appendChild(nameSpan);
                fieldDiv.appendChild(valueSpan);
                domainContent.appendChild(fieldDiv);
            }
        });
    }

    displayMessageType(primaryType, types) {
        const typeContent = document.getElementById('message-type');
        typeContent.textContent = primaryType;
        
        // You could expand this to show the full type structure if needed
    }

    displayMessage(message, primaryType, types) {
        const messageContent = document.getElementById('message-content');
        messageContent.innerHTML = '';
        
        this.renderObject(message, messageContent, types[primaryType]);
    }

    renderObject(obj, container, typeInfo) {
        Object.entries(obj).forEach(([key, value]) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'data-field';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'field-name';
            nameSpan.textContent = this.formatFieldName(key);
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'field-value';
            
            // Format value based on type
            if (value === null || value === undefined) {
                valueSpan.textContent = 'null';
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                // Nested object
                fieldDiv.appendChild(nameSpan);
                container.appendChild(fieldDiv);
                
                const nestedDiv = document.createElement('div');
                nestedDiv.className = 'nested-object';
                this.renderObject(value, nestedDiv);
                container.appendChild(nestedDiv);
                return;
            } else if (Array.isArray(value)) {
                valueSpan.textContent = `[${value.length} items]`;
            } else if (key.toLowerCase().includes('address') || 
                       (typeof value === 'string' && value.startsWith('0x') && value.length === 42)) {
                valueSpan.textContent = this.formatAddress(value);
            } else if (key.toLowerCase().includes('amount') || 
                       key.toLowerCase().includes('value') ||
                       key.toLowerCase() === 'deadline') {
                valueSpan.textContent = this.formatNumber(value);
            } else {
                valueSpan.textContent = value.toString();
            }
            
            fieldDiv.appendChild(nameSpan);
            fieldDiv.appendChild(valueSpan);
            container.appendChild(fieldDiv);
        });
    }

    checkForPermit(data) {
        // Check if this looks like a token permit
        const message = data.message;
        const primaryType = data.primaryType;
        
        const isPermit = 
            primaryType === 'Permit' ||
            (message && (
                message.hasOwnProperty('owner') && 
                message.hasOwnProperty('spender') && 
                message.hasOwnProperty('value')
            )) ||
            (message && (
                message.hasOwnProperty('holder') && 
                message.hasOwnProperty('spender') && 
                message.hasOwnProperty('allowed')
            ));
        
        if (isPermit) {
            document.getElementById('permit-warning').style.display = 'block';
        }
    }

    formatFieldName(name) {
        // Convert camelCase to Title Case
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    formatAddress(address) {
        if (!address) return 'Unknown';
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    }

    formatNumber(value) {
        try {
            const num = BigInt(value);
            // Check if it's likely a token amount (18 decimals)
            if (num > 1000000000000000000n) {
                return ethers.formatEther(num) + ' (wei: ' + num.toString() + ')';
            }
            return num.toString();
        } catch {
            return value.toString();
        }
    }

    getChainName(chainId) {
        const chains = {
            '1': 'Ethereum Mainnet',
            '369': 'PulseChain',
            '943': 'PulseChain Testnet v4',
            '137': 'Polygon',
            '56': 'BSC'
        };
        
        const id = chainId.toString();
        return chains[id] ? `${chains[id]} (${id})` : id;
    }

    async signTypedData() {
        try {
            // Disable buttons
            document.getElementById('sign-btn').disabled = true;
            document.getElementById('reject-btn').disabled = true;
            document.getElementById('sign-btn').textContent = 'Signing...';
            
            // Send signing confirmation to background
            const response = await chrome.runtime.sendMessage({
                action: 'confirmTypedDataSigning',
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
            console.error('Error signing typed data:', error);
            alert('Signing failed: ' + error.message);
            
            // Re-enable buttons
            document.getElementById('sign-btn').disabled = false;
            document.getElementById('reject-btn').disabled = false;
            document.getElementById('sign-btn').textContent = 'Sign';
        }
    }

    rejectSignature() {
        chrome.runtime.sendMessage({
            action: 'rejectTypedDataSigning',
            requestId: this.requestId
        });
        
        window.close();
    }

    showError(message) {
        document.getElementById('loading-section').innerHTML = `
            <div style="color: #f44336; padding: 20px;">
                <h3>Error</h3>
                <p>${SecurityUtils.escapeHtml(message)}</p>
                <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px;">Close</button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypedDataSigning();
});