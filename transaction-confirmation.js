// Transaction Confirmation Logic
class TransactionConfirmation {
    constructor() {
        this.requestId = null;
        this.origin = null;
        this.txParams = null;
        this.selectedGasSpeed = 'standard';
        this.gasPrice = null;
        this.networkConfig = null;
        
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
        
        // Load transaction details
        await this.loadTransactionDetails();
    }

    setupEventListeners() {
        // Reject button
        document.getElementById('reject-btn').addEventListener('click', () => {
            this.rejectTransaction();
        });

        // Confirm button
        document.getElementById('confirm-btn').addEventListener('click', () => {
            this.confirmTransaction();
        });

        // Gas option selection
        document.querySelectorAll('.gas-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectGasOption(e.target.closest('.gas-option').dataset.speed);
            });
        });
    }

    async loadTransactionDetails() {
        try {
            // Request transaction details from background
            const response = await chrome.runtime.sendMessage({
                action: 'getTransactionRequest',
                requestId: this.requestId
            });

            if (!response || !response.success) {
                throw new Error('Failed to load transaction details');
            }

            this.txParams = response.request.params;
            this.networkConfig = response.networkConfig;
            this.validation = response.request.validation;
            this.simulation = response.request.simulation;
            
            // Display origin
            document.getElementById('site-origin').textContent = this.origin;
            
            // Display transaction details
            await this.displayTransactionDetails();
            
            // Display validation results
            if (this.validation) {
                this.displayValidationResults();
            }
            
            // Display simulation results
            if (this.simulation) {
                this.displaySimulationResults();
            }
            
            // Load gas prices
            await this.loadGasPrices();
            
            // Hide loading, show content
            document.getElementById('loading-section').style.display = 'none';
            document.getElementById('transaction-content').style.display = 'block';
            
            // Enable confirm button only if validation passed or user overrides
            const shouldEnableConfirm = !this.validation || this.validation.valid || this.validation.riskScore < 80;
            document.getElementById('confirm-btn').disabled = !shouldEnableConfirm;
            
        } catch (error) {
            console.error('Error loading transaction:', error);
            this.showError('Failed to load transaction details');
        }
    }

    async displayTransactionDetails() {
        // From address
        const fromAddress = this.txParams.from || await this.getWalletAddress();
        document.getElementById('from-address').textContent = this.formatAddress(fromAddress);
        
        // To address
        const toAddress = this.txParams.to;
        document.getElementById('to-address').textContent = this.formatAddress(toAddress);
        
        // Amount
        const value = this.txParams.value || '0x0';
        const amountInWei = BigInt(value);
        const amountInEther = ethers.formatEther(amountInWei);
        
        const symbol = this.networkConfig?.symbol || 'PLS';
        document.getElementById('amount-value').textContent = `${amountInEther} ${symbol}`;
        
        // Show USD value if available (you'd need a price feed for this)
        // document.getElementById('amount-usd').textContent = `≈ $${usdValue}`;
        
        // Check if it's a contract interaction
        if (this.txParams.data && this.txParams.data !== '0x') {
            document.getElementById('contract-interaction').style.display = 'flex';
            document.getElementById('data-row').style.display = 'flex';
            
            // Try to decode the transaction
            await this.decodeTransaction();
        }
        
        // Gas limit
        const gasLimit = this.txParams.gas || '0x5208'; // Default 21000 for simple transfer
        document.getElementById('gas-limit').textContent = parseInt(gasLimit, 16).toLocaleString();
        
        // Check for warnings
        this.checkWarnings(amountInEther);
    }

    formatAddress(address) {
        if (!address) return 'Unknown';
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    }

    async getWalletAddress() {
        const response = await chrome.runtime.sendMessage({ action: 'getWalletAddress' });
        return response?.address || '0x0000...0000';
    }

    async loadGasPrices() {
        try {
            // Get current gas prices from network
            const response = await chrome.runtime.sendMessage({ action: 'getGasPrice' });
            
            if (response && response.gasPrice) {
                const baseGasPrice = BigInt(response.gasPrice);
                
                // Calculate different speed options
                const standardPrice = baseGasPrice;
                const fastPrice = (baseGasPrice * 120n) / 100n; // 20% more
                const instantPrice = (baseGasPrice * 150n) / 100n; // 50% more
                
                // Display prices
                this.displayGasOption('standard', standardPrice);
                this.displayGasOption('fast', fastPrice);
                this.displayGasOption('instant', instantPrice);
                
                // Set initial gas price
                this.gasPrice = standardPrice.toString();
                
                // Update total
                this.updateTotal();
            }
        } catch (error) {
            console.error('Error loading gas prices:', error);
        }
    }

    displayGasOption(speed, price) {
        const gasLimit = parseInt(this.txParams.gas || '0x5208', 16);
        const gasCost = (BigInt(price) * BigInt(gasLimit)) / BigInt(10**18);
        const gasCostFormatted = ethers.formatEther(BigInt(price) * BigInt(gasLimit));
        
        const symbol = this.networkConfig?.symbol || 'PLS';
        document.getElementById(`gas-${speed}`).textContent = `${gasCostFormatted} ${symbol}`;
    }

    selectGasOption(speed) {
        // Update UI
        document.querySelectorAll('.gas-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-speed="${speed}"]`).classList.add('selected');
        
        this.selectedGasSpeed = speed;
        
        // Update gas price based on selection
        const baseGasPrice = this.gasPrice;
        if (speed === 'fast') {
            this.gasPrice = ((BigInt(baseGasPrice) * 120n) / 100n).toString();
        } else if (speed === 'instant') {
            this.gasPrice = ((BigInt(baseGasPrice) * 150n) / 100n).toString();
        }
        
        this.updateTotal();
    }

    updateTotal() {
        const value = BigInt(this.txParams.value || '0x0');
        const gasLimit = BigInt(this.txParams.gas || '0x5208');
        const gasPrice = BigInt(this.gasPrice || '0x0');
        
        const gasCost = gasLimit * gasPrice;
        const total = value + gasCost;
        
        const symbol = this.networkConfig?.symbol || 'PLS';
        document.getElementById('total-amount').textContent = `${ethers.formatEther(total)} ${symbol}`;
    }

    async decodeTransaction() {
        try {
            const data = this.txParams.data;
            const to = this.txParams.to;
            
            // Common function selectors
            const selectors = {
                '0x095ea7b3': 'approve',
                '0xa9059cbb': 'transfer',
                '0x23b872dd': 'transferFrom',
                '0x39509351': 'increaseAllowance',
                '0xa457c2d7': 'decreaseAllowance',
                '0x7ff36ab5': 'swapExactETHForTokens',
                '0x18cbafe5': 'swapExactTokensForETH',
                '0x38ed1739': 'swapExactTokensForTokens',
                '0xfb3bdb41': 'swapETHForExactTokens',
                '0x4a25d94a': 'swapTokensForExactETH',
                '0x8803dbee': 'swapTokensForExactTokens'
            };
            
            const selector = data.substring(0, 10);
            const functionName = selectors[selector];
            
            if (functionName) {
                // Create decoded info section
                const decodedSection = document.createElement('div');
                decodedSection.style.cssText = `
                    background: #e8f5e9;
                    border: 1px solid #4caf50;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                `;
                
                const title = document.createElement('div');
                title.style.cssText = 'font-weight: bold; margin-bottom: 10px; color: #2e7d32;';
                title.textContent = '✓ Decoded Transaction';
                decodedSection.appendChild(title);
                
                // Decode based on function
                if (functionName === 'approve') {
                    // Decode approve(address spender, uint256 amount)
                    const spender = '0x' + data.substring(34, 74);
                    const amount = '0x' + data.substring(74, 138);
                    const amountBN = BigInt(amount);
                    
                    // Check if it's an infinite approval
                    const isInfinite = amountBN === ethers.MaxUint256;
                    
                    // Try to get token info
                    const tokenInfo = await this.getTokenInfo(to);
                    
                    const details = document.createElement('div');
                    details.innerHTML = `
                        <div style="margin-bottom: 8px;"><strong>Action:</strong> Token Approval</div>
                        <div style="margin-bottom: 8px;"><strong>Token:</strong> ${tokenInfo ? `${tokenInfo.symbol} (${tokenInfo.name})` : this.formatAddress(to)}</div>
                        <div style="margin-bottom: 8px;"><strong>Spender:</strong> ${this.formatAddress(spender)}</div>
                        <div style="margin-bottom: 8px;"><strong>Amount:</strong> ${isInfinite ? '🚨 UNLIMITED' : ethers.formatUnits(amountBN, tokenInfo?.decimals || 18) + ' ' + (tokenInfo?.symbol || 'tokens')}</div>
                    `;
                    decodedSection.appendChild(details);
                    
                    // Add warning for infinite approval
                    if (isInfinite) {
                        const warning = document.createElement('div');
                        warning.style.cssText = `
                            background: #ffebee;
                            border: 1px solid #f44336;
                            padding: 10px;
                            border-radius: 6px;
                            margin-top: 10px;
                            color: #c62828;
                        `;
                        warning.innerHTML = '<strong>⚠️ Warning:</strong> This grants UNLIMITED access to your tokens. The spender can take ALL your tokens at any time.';
                        decodedSection.appendChild(warning);
                    }
                    
                } else if (functionName === 'transfer') {
                    // Decode transfer(address to, uint256 amount)
                    const recipient = '0x' + data.substring(34, 74);
                    const amount = '0x' + data.substring(74, 138);
                    const amountBN = BigInt(amount);
                    
                    const tokenInfo = await this.getTokenInfo(to);
                    
                    const details = document.createElement('div');
                    details.innerHTML = `
                        <div style="margin-bottom: 8px;"><strong>Action:</strong> Token Transfer</div>
                        <div style="margin-bottom: 8px;"><strong>Token:</strong> ${tokenInfo ? `${tokenInfo.symbol} (${tokenInfo.name})` : this.formatAddress(to)}</div>
                        <div style="margin-bottom: 8px;"><strong>To:</strong> ${this.formatAddress(recipient)}</div>
                        <div style="margin-bottom: 8px;"><strong>Amount:</strong> ${ethers.formatUnits(amountBN, tokenInfo?.decimals || 18)} ${tokenInfo?.symbol || 'tokens'}</div>
                    `;
                    decodedSection.appendChild(details);
                    
                } else if (functionName.includes('swap')) {
                    const details = document.createElement('div');
                    details.innerHTML = `
                        <div style="margin-bottom: 8px;"><strong>Action:</strong> Token Swap</div>
                        <div style="margin-bottom: 8px;"><strong>Router:</strong> ${this.formatAddress(to)}</div>
                        <div style="margin-bottom: 8px;"><strong>Type:</strong> ${functionName}</div>
                        <div style="color: #666; font-size: 0.9rem;">Complex swap parameters - verify amounts carefully</div>
                    `;
                    decodedSection.appendChild(details);
                } else {
                    const details = document.createElement('div');
                    details.innerHTML = `
                        <div style="margin-bottom: 8px;"><strong>Function:</strong> ${functionName}</div>
                    `;
                    decodedSection.appendChild(details);
                }
                
                // Insert after amount section
                const amountSection = document.querySelector('.amount-section');
                amountSection.parentNode.insertBefore(decodedSection, amountSection.nextSibling);
                
            } else {
                // Unknown function - show raw data
                document.getElementById('tx-data').textContent = data.substring(0, 100) + '...';
            }
            
        } catch (error) {
            console.error('Error decoding transaction:', error);
            // Fallback to showing raw data
            const dataPreview = this.txParams.data.substring(0, 100) + '...';
            document.getElementById('tx-data').textContent = dataPreview;
        }
    }
    
    async getTokenInfo(address) {
        try {
            // Try to get token info from background
            const response = await chrome.runtime.sendMessage({
                action: 'getTokenInfo',
                address: address
            });
            
            if (response && response.success) {
                return response.tokenInfo;
            }
            
            // If not in our token list, try to fetch from contract
            const tokenResponse = await chrome.runtime.sendMessage({
                action: 'fetchTokenInfo',
                address: address
            });
            
            return tokenResponse?.tokenInfo || null;
            
        } catch (error) {
            console.error('Error getting token info:', error);
            return null;
        }
    }

    checkWarnings(amount) {
        const warnings = [];
        
        // Check for high value transaction
        const amountNum = parseFloat(amount);
        if (amountNum > 1000) {
            warnings.push('This is a high value transaction');
        }
        
        // Check for contract interaction with value
        if (this.txParams.data && this.txParams.data !== '0x' && this.txParams.value && this.txParams.value !== '0x0') {
            warnings.push('This transaction sends value to a contract');
        }
        
        // Display warnings
        if (warnings.length > 0) {
            document.getElementById('warning-section').style.display = 'block';
            document.getElementById('warning-message').textContent = warnings.join('. ');
        }
    }

    displayValidationResults() {
        const section = document.getElementById('validation-section');
        const header = document.getElementById('validation-header');
        const status = document.getElementById('validation-status');
        const indicator = document.getElementById('risk-indicator');
        const issues = document.getElementById('validation-issues');
        
        section.style.display = 'block';
        
        // Set header based on validation status
        if (!this.validation.valid) {
            header.className = 'validation-header validation-danger';
            status.textContent = 'Transaction Failed Validation';
            indicator.className = 'risk-indicator risk-critical';
        } else if (this.validation.riskScore >= 60) {
            header.className = 'validation-header validation-warning';
            status.textContent = 'High Risk Transaction';
            indicator.className = 'risk-indicator risk-high';
        } else if (this.validation.riskScore >= 20) {
            header.className = 'validation-header validation-warning';
            status.textContent = 'Medium Risk Transaction';
            indicator.className = 'risk-indicator risk-medium';
        } else {
            header.className = 'validation-header validation-safe';
            status.textContent = 'Transaction Appears Safe';
            indicator.className = 'risk-indicator risk-minimal';
        }
        
        // Clear previous issues
        issues.innerHTML = '';
        
        // Display errors
        for (const error of this.validation.errors || []) {
            const issue = document.createElement('div');
            issue.className = 'validation-issue';
            issue.innerHTML = `
                <span class="issue-icon" style="color: #f44336;">
                    <i class="fas fa-times-circle"></i>
                </span>
                <span>${SecurityUtils.escapeHtml(error)}</span>
            `;
            issues.appendChild(issue);
        }
        
        // Display high/critical risks
        for (const risk of this.validation.risks || []) {
            if (risk.severity === 'HIGH' || risk.severity === 'CRITICAL') {
                const issue = document.createElement('div');
                issue.className = 'validation-issue';
                issue.innerHTML = `
                    <span class="issue-icon" style="color: ${risk.severity === 'CRITICAL' ? '#f44336' : '#ff9800'};">
                        <i class="fas fa-exclamation-triangle"></i>
                    </span>
                    <span>${SecurityUtils.escapeHtml(risk.message)}</span>
                `;
                issues.appendChild(issue);
            }
        }
        
        // Display warnings
        for (const warning of this.validation.warnings || []) {
            const issue = document.createElement('div');
            issue.className = 'validation-issue';
            issue.innerHTML = `
                <span class="issue-icon" style="color: #ff9800;">
                    <i class="fas fa-info-circle"></i>
                </span>
                <span>${SecurityUtils.escapeHtml(warning)}</span>
            `;
            issues.appendChild(issue);
        }
        
        // Special handling for token approvals
        if (this.validation.summary?.type === 'Token Approval') {
            const approvalWarning = document.createElement('div');
            approvalWarning.style.cssText = `
                background: #fff3e0;
                border: 1px solid #ff9800;
                padding: 12px;
                border-radius: 6px;
                margin-top: 10px;
                font-size: 0.9rem;
            `;
            approvalWarning.innerHTML = `
                <strong>Token Approval Request:</strong><br>
                This transaction will allow another address to spend your tokens. 
                Only approve if you trust the spender and understand the risks.
            `;
            issues.appendChild(approvalWarning);
        }
    }
    
    displaySimulationResults() {
        const section = document.getElementById('simulation-section');
        const result = document.getElementById('simulation-result');
        
        if (!this.simulation) return;
        
        section.style.display = 'block';
        
        if (this.simulation.success) {
            result.innerHTML = `
                <div style="color: #2e7d32;">
                    <i class="fas fa-check-circle"></i>
                    Transaction simulation successful
                </div>
                <div style="margin-top: 8px; font-size: 0.85rem; color: #666;">
                    Estimated gas: ${this.simulation.gasEstimate ? parseInt(this.simulation.gasEstimate).toLocaleString() : 'Unknown'}
                </div>
            `;
        } else {
            result.innerHTML = `
                <div style="color: #d32f2f;">
                    <i class="fas fa-times-circle"></i>
                    Transaction would fail: ${SecurityUtils.escapeHtml(this.simulation.error || 'Unknown error')}
                </div>
            `;
            
            // Disable confirm button if simulation failed
            document.getElementById('confirm-btn').disabled = true;
        }
    }
    
    async confirmTransaction() {
        try {
            // Disable buttons
            document.getElementById('confirm-btn').disabled = true;
            document.getElementById('reject-btn').disabled = true;
            document.getElementById('confirm-btn').textContent = 'Processing...';
            
            // Update transaction with gas price
            const updatedTx = {
                ...this.txParams,
                gasPrice: '0x' + BigInt(this.gasPrice).toString(16)
            };
            
            // Send confirmation to background
            const response = await chrome.runtime.sendMessage({
                action: 'confirmTransaction',
                requestId: this.requestId,
                transaction: updatedTx
            });
            
            if (response && response.success) {
                // Close window after short delay
                setTimeout(() => {
                    window.close();
                }, 1000);
            } else {
                throw new Error(response?.error || 'Transaction failed');
            }
            
        } catch (error) {
            console.error('Error confirming transaction:', error);
            alert('Transaction failed: ' + error.message);
            
            // Re-enable buttons
            document.getElementById('confirm-btn').disabled = false;
            document.getElementById('reject-btn').disabled = false;
            document.getElementById('confirm-btn').textContent = 'Confirm';
        }
    }

    rejectTransaction() {
        chrome.runtime.sendMessage({
            action: 'rejectTransaction',
            requestId: this.requestId
        });
        
        window.close();
    }

    showError(message) {
        document.getElementById('loading-section').innerHTML = `
            <div style="color: #f44336; padding: 20px;">
                <h3>Error</h3>
                <p>${SecurityUtils.escapeHtml(message)}</p>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TransactionConfirmation();
});