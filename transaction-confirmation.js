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
            console.log('Requesting transaction details for requestId:', this.requestId);
            const response = await chrome.runtime.sendMessage({
                action: 'getTransactionRequest',
                requestId: this.requestId
            });

            console.log('Received response:', response);
            
            if (!response || !response.success) {
                console.error('Failed response:', response);
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
            document.getElementById('loading-section').classList.add('hidden');
            document.getElementById('transaction-content').classList.remove('hidden');
            document.getElementById('transaction-content').classList.add('show');
            
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
        console.log('Transaction params:', this.txParams);
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
            document.getElementById('contract-interaction').classList.remove('hidden');
            document.getElementById('contract-interaction').classList.add('flex');
            document.getElementById('data-row').classList.remove('hidden');
            document.getElementById('data-row').classList.add('flex');
            
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
        
        // Format to 6 decimal places and round up
        const gasCostNumber = parseFloat(gasCostFormatted);
        const roundedGasCost = Math.ceil(gasCostNumber * 1000000) / 1000000;
        const formattedGasCost = roundedGasCost.toFixed(6);
        
        const symbol = this.networkConfig?.symbol || 'PLS';
        document.getElementById(`gas-${speed}`).textContent = `${formattedGasCost} ${symbol}`;
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
        
        const totalFormatted = ethers.formatEther(total);
        // Format to 6 decimal places and round up
        const totalNumber = parseFloat(totalFormatted);
        const roundedTotal = Math.ceil(totalNumber * 1000000) / 1000000;
        const formattedTotal = roundedTotal.toFixed(6);
        
        const symbol = this.networkConfig?.symbol || 'PLS';
        document.getElementById('total-amount').textContent = `${formattedTotal} ${symbol}`;
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
                '0x8803dbee': 'swapTokensForExactTokens',
                '0x40c10f19': 'mint'  // mint(address,uint256)
            };
            
            const selector = data.substring(0, 10);
            const functionName = selectors[selector];
            
            if (functionName) {
                // Create decoded info section
                const decodedSection = document.createElement('div');
                decodedSection.className = 'decoded-section';
                
                const title = document.createElement('div');
                title.className = 'decoded-title';
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
                    details.className = 'decoded-details';
                    details.innerHTML = `
                        <div><strong>Action:</strong> Token Approval</div>
                        <div><strong>Token:</strong> ${tokenInfo ? `${tokenInfo.symbol} (${tokenInfo.name})` : this.formatAddress(to)}</div>
                        <div><strong>Spender:</strong> ${this.formatAddress(spender)}</div>
                        <div><strong>Amount:</strong> ${isInfinite ? '🚨 UNLIMITED' : ethers.formatUnits(amountBN, tokenInfo?.decimals || 18) + ' ' + (tokenInfo?.symbol || 'tokens')}</div>
                    `;
                    decodedSection.appendChild(details);
                    
                    // Add warning for infinite approval
                    if (isInfinite) {
                        const warning = document.createElement('div');
                        warning.className = 'decoded-warning';
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
                    details.className = 'decoded-details';
                    details.innerHTML = `
                        <div><strong>Action:</strong> Token Transfer</div>
                        <div><strong>Token:</strong> ${tokenInfo ? `${tokenInfo.symbol} (${tokenInfo.name})` : this.formatAddress(to)}</div>
                        <div><strong>To:</strong> ${this.formatAddress(recipient)}</div>
                        <div><strong>Amount:</strong> ${ethers.formatUnits(amountBN, tokenInfo?.decimals || 18)} ${tokenInfo?.symbol || 'tokens'}</div>
                    `;
                    decodedSection.appendChild(details);
                    
                } else if (functionName === 'mint') {
                    // Decode mint(address to, uint256 amount)
                    const recipient = '0x' + data.substring(34, 74);
                    const amount = '0x' + data.substring(74, 138);
                    const amountBN = BigInt(amount);
                    
                    // Debug logging
                    console.log('Mint transaction debug:', {
                        rawHex: amount,
                        amountBN: amountBN.toString(),
                        dataLength: data.length,
                        fullData: data
                    });
                    
                    const tokenInfo = await this.getTokenInfo(to);
                    
                    // Check if amount looks like a raw token count (no decimals applied)
                    // If the amount is less than 10^6 and the token has decimals, it might be a raw count
                    let displayAmount;
                    const decimals = tokenInfo?.decimals || 18;
                    
                    if (amountBN < BigInt(10**6) && decimals > 0) {
                        // This might be a raw token count, show both interpretations
                        const rawCount = amountBN.toString();
                        const withDecimals = ethers.formatUnits(amountBN, decimals);
                        
                        // If the formatted amount is extremely small, likely the DApp meant raw tokens
                        if (parseFloat(withDecimals) < 0.000001) {
                            displayAmount = `${rawCount} ${tokenInfo?.symbol || 'tokens'} (raw amount)`;
                        } else {
                            displayAmount = `${withDecimals} ${tokenInfo?.symbol || 'tokens'}`;
                        }
                    } else {
                        displayAmount = `${ethers.formatUnits(amountBN, decimals)} ${tokenInfo?.symbol || 'tokens'}`;
                    }
                    
                    const details = document.createElement('div');
                    details.className = 'decoded-details';
                    details.innerHTML = `
                        <div><strong>Action:</strong> Mint New Tokens</div>
                        <div><strong>Token:</strong> ${tokenInfo ? `${tokenInfo.symbol} (${tokenInfo.name})` : this.formatAddress(to)}</div>
                        <div><strong>Recipient:</strong> ${this.formatAddress(recipient)}</div>
                        <div><strong>Amount:</strong> ${displayAmount}</div>
                    `;
                    decodedSection.appendChild(details);
                    
                    // Add warning for minting
                    const warning = document.createElement('div');
                    warning.className = 'decoded-note';
                    warning.innerHTML = '<strong>⚠️ Note:</strong> This will create new tokens and increase the total supply.';
                    decodedSection.appendChild(warning);
                    
                } else if (functionName.includes('swap')) {
                    const details = document.createElement('div');
                    details.className = 'decoded-details';
                    details.innerHTML = `
                        <div><strong>Action:</strong> Token Swap</div>
                        <div><strong>Router:</strong> ${this.formatAddress(to)}</div>
                        <div><strong>Type:</strong> ${functionName}</div>
                        <div class="swap-details">Complex swap parameters - verify amounts carefully</div>
                    `;
                    decodedSection.appendChild(details);
                } else {
                    const details = document.createElement('div');
                    details.className = 'decoded-details';
                    details.innerHTML = `
                        <div><strong>Function:</strong> ${functionName}</div>
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
            document.getElementById('warning-section').classList.remove('hidden');
            document.getElementById('warning-section').classList.add('show');
            document.getElementById('warning-message').textContent = warnings.join('. ');
        }
    }

    displayValidationResults() {
        const section = document.getElementById('validation-section');
        const header = document.getElementById('validation-header');
        const status = document.getElementById('validation-status');
        const indicator = document.getElementById('risk-indicator');
        const issues = document.getElementById('validation-issues');
        
        section.classList.remove('hidden');
        section.classList.add('show');
        
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
                <span class="issue-icon issue-icon-error">
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
                    <span class="issue-icon ${risk.severity === 'CRITICAL' ? 'issue-icon-critical' : 'issue-icon-warning'}">
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
                <span class="issue-icon issue-icon-warning">
                    <i class="fas fa-info-circle"></i>
                </span>
                <span>${SecurityUtils.escapeHtml(warning)}</span>
            `;
            issues.appendChild(issue);
        }
        
        // Special handling for token approvals
        if (this.validation.summary?.type === 'Token Approval') {
            const approvalWarning = document.createElement('div');
            approvalWarning.className = 'approval-warning';
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
        
        section.classList.remove('hidden');
        section.classList.add('show');
        
        if (this.simulation.success) {
            result.innerHTML = `
                <div class="simulation-success">
                    <i class="fas fa-check-circle"></i>
                    Transaction simulation successful
                </div>
                <div class="simulation-gas-estimate">
                    Estimated gas: ${this.simulation.gasEstimate ? parseInt(this.simulation.gasEstimate).toLocaleString() : 'Unknown'}
                </div>
            `;
        } else {
            result.innerHTML = `
                <div class="simulation-error">
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
                // Show success message
                document.getElementById('loading-section').classList.remove('hidden');
                document.getElementById('loading-section').classList.add('show');
                document.getElementById('transaction-content').classList.add('hidden');
                document.getElementById('loading-section').innerHTML = `
                    <div class="transaction-success">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3 class="success-title">Transaction Sent!</h3>
                        <p class="success-label">Transaction hash:</p>
                        <p class="success-hash">
                            ${response.txHash}
                        </p>
                        <p class="success-note">
                            You'll receive a notification when the transaction is confirmed.
                        </p>
                    </div>
                `;
                
                // Close window after showing success
                setTimeout(() => {
                    window.close();
                }, 3000);
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
            <div class="error-message">
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