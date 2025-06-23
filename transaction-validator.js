/**
 * Transaction Validator and Simulator
 * Provides security checks and simulation for transactions before signing
 */

class TransactionValidator {
    constructor() {
        // Known malicious addresses (in production, this would be fetched from a security API)
        this.blacklistedAddresses = new Set([
            // Add known scam addresses here
        ]);
        
        // Token standards ABIs for decoding
        this.ERC20_TRANSFER_SIGNATURE = '0xa9059cbb'; // transfer(address,uint256)
        this.ERC20_APPROVE_SIGNATURE = '0x095ea7b3'; // approve(address,uint256)
        this.ERC721_SAFE_TRANSFER_SIGNATURE = '0x42842e0e'; // safeTransferFrom(address,address,uint256)
        
        // Warning thresholds
        this.HIGH_VALUE_THRESHOLD = 1; // 1 ETH
        this.VERY_HIGH_VALUE_THRESHOLD = 10; // 10 ETH
        
        // Gas limit thresholds
        this.NORMAL_TRANSFER_GAS = 21000;
        this.HIGH_GAS_WARNING = 500000;
    }
    
    /**
     * Validate transaction parameters
     * @param {object} transaction - Transaction to validate
     * @param {object} context - Additional context (wallet balance, etc.)
     * @returns {object} Validation result with warnings and errors
     */
    async validateTransaction(transaction, context = {}) {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            risks: [],
            summary: {}
        };
        
        // Basic parameter validation
        this.validateBasicParams(transaction, result);
        
        // Address validation
        await this.validateAddresses(transaction, result);
        
        // Value validation
        this.validateValue(transaction, context, result);
        
        // Gas validation
        this.validateGas(transaction, result);
        
        // Data validation (for contract interactions)
        if (transaction.data && transaction.data !== '0x') {
            await this.validateContractInteraction(transaction, result);
        }
        
        // Calculate risk score
        result.riskScore = this.calculateRiskScore(result);
        
        return result;
    }
    
    /**
     * Validate basic transaction parameters
     */
    validateBasicParams(tx, result) {
        // Check 'to' address
        if (!tx.to || !this.isValidAddress(tx.to)) {
            result.valid = false;
            result.errors.push('Invalid recipient address');
            return;
        }
        
        // Check 'from' address
        if (!tx.from || !this.isValidAddress(tx.from)) {
            result.valid = false;
            result.errors.push('Invalid sender address');
            return;
        }
        
        // Check if sending to self
        if (tx.from.toLowerCase() === tx.to.toLowerCase()) {
            result.warnings.push('Sending to same address');
        }
    }
    
    /**
     * Validate addresses for security issues
     */
    async validateAddresses(tx, result) {
        const toAddress = tx.to.toLowerCase();
        
        // Check blacklist
        if (this.blacklistedAddresses.has(toAddress)) {
            result.valid = false;
            result.errors.push('Recipient address is blacklisted as malicious');
            result.risks.push({
                type: 'BLACKLISTED_ADDRESS',
                severity: 'CRITICAL',
                message: 'This address is known to be associated with scams'
            });
            return;
        }
        
        // Check if contract (basic check - in production, check on-chain)
        if (tx.data && tx.data !== '0x' && (!tx.value || tx.value === '0x0')) {
            result.summary.type = 'Contract Interaction';
        } else {
            result.summary.type = 'ETH Transfer';
        }
        
        // Check for zero address
        if (toAddress === '0x0000000000000000000000000000000000000000') {
            result.valid = false;
            result.errors.push('Cannot send to zero address');
        }
    }
    
    /**
     * Validate transaction value
     */
    validateValue(tx, context, result) {
        if (!tx.value) {
            tx.value = '0x0';
        }
        
        try {
            const valueWei = BigInt(tx.value);
            const valueEth = Number(valueWei) / 1e18;
            
            result.summary.value = valueEth;
            result.summary.valueFormatted = `${valueEth.toFixed(6)} ETH`;
            
            // Check if value exceeds balance
            if (context.balance) {
                const balanceWei = BigInt(context.balance);
                if (valueWei > balanceWei) {
                    result.valid = false;
                    result.errors.push('Insufficient balance');
                }
            }
            
            // Warn for high values
            if (valueEth >= this.VERY_HIGH_VALUE_THRESHOLD) {
                result.warnings.push(`Very high value transfer: ${valueEth} ETH`);
                result.risks.push({
                    type: 'VERY_HIGH_VALUE',
                    severity: 'HIGH',
                    message: `Transferring ${valueEth} ETH - please double-check the amount`
                });
            } else if (valueEth >= this.HIGH_VALUE_THRESHOLD) {
                result.warnings.push(`High value transfer: ${valueEth} ETH`);
                result.risks.push({
                    type: 'HIGH_VALUE',
                    severity: 'MEDIUM',
                    message: `Transferring ${valueEth} ETH`
                });
            }
        } catch (error) {
            result.valid = false;
            result.errors.push('Invalid transaction value');
        }
    }
    
    /**
     * Validate gas parameters
     */
    validateGas(tx, result) {
        // Validate gas limit
        if (tx.gasLimit || tx.gas) {
            const gasLimit = Number(tx.gasLimit || tx.gas);
            
            if (gasLimit < this.NORMAL_TRANSFER_GAS) {
                result.warnings.push('Gas limit may be too low');
            } else if (gasLimit > this.HIGH_GAS_WARNING) {
                result.warnings.push('Unusually high gas limit');
                result.risks.push({
                    type: 'HIGH_GAS_LIMIT',
                    severity: 'LOW',
                    message: 'Transaction has unusually high gas limit'
                });
            }
            
            result.summary.gasLimit = gasLimit;
        }
        
        // Validate gas price
        if (tx.gasPrice) {
            const gasPriceGwei = Number(BigInt(tx.gasPrice)) / 1e9;
            result.summary.gasPriceGwei = gasPriceGwei;
            
            if (gasPriceGwei > 500) {
                result.warnings.push(`Very high gas price: ${gasPriceGwei} Gwei`);
            }
        }
        
        // Check max fee for EIP-1559
        if (tx.maxFeePerGas && tx.maxPriorityFeePerGas) {
            const maxFeeGwei = Number(BigInt(tx.maxFeePerGas)) / 1e9;
            result.summary.maxFeeGwei = maxFeeGwei;
            
            if (maxFeeGwei > 500) {
                result.warnings.push(`Very high max fee: ${maxFeeGwei} Gwei`);
            }
        }
    }
    
    /**
     * Validate contract interaction
     */
    async validateContractInteraction(tx, result) {
        const data = tx.data;
        
        if (!data || data === '0x') {
            return;
        }
        
        // Get method signature (first 4 bytes)
        const methodSig = data.slice(0, 10);
        
        // Decode known methods
        switch (methodSig) {
            case this.ERC20_TRANSFER_SIGNATURE:
                this.decodeERC20Transfer(data, result);
                break;
                
            case this.ERC20_APPROVE_SIGNATURE:
                this.decodeERC20Approve(data, tx, result);
                break;
                
            case this.ERC721_SAFE_TRANSFER_SIGNATURE:
                result.summary.type = 'NFT Transfer';
                result.summary.method = 'safeTransferFrom';
                break;
                
            default:
                result.summary.type = 'Contract Interaction';
                result.summary.method = 'Unknown Method';
                result.warnings.push('Interacting with unknown contract method');
                result.risks.push({
                    type: 'UNKNOWN_METHOD',
                    severity: 'MEDIUM',
                    message: 'Contract method is not recognized'
                });
        }
        
        result.summary.dataSize = (data.length - 2) / 2; // bytes
    }
    
    /**
     * Decode ERC20 transfer
     */
    decodeERC20Transfer(data, result) {
        try {
            // Remove '0x' and method signature
            const params = data.slice(10);
            
            // Decode recipient (32 bytes, but address is 20 bytes)
            const recipient = '0x' + params.slice(24, 64);
            
            // Decode amount (32 bytes)
            const amount = BigInt('0x' + params.slice(64, 128));
            
            result.summary.type = 'Token Transfer';
            result.summary.method = 'transfer';
            result.summary.recipient = recipient;
            result.summary.tokenAmount = amount.toString();
            
        } catch (error) {
            result.warnings.push('Failed to decode token transfer');
        }
    }
    
    /**
     * Decode ERC20 approve
     */
    decodeERC20Approve(data, tx, result) {
        try {
            // Remove '0x' and method signature
            const params = data.slice(10);
            
            // Decode spender (32 bytes, but address is 20 bytes)
            const spender = '0x' + params.slice(24, 64);
            
            // Decode amount (32 bytes)
            const amount = BigInt('0x' + params.slice(64, 128));
            
            result.summary.type = 'Token Approval';
            result.summary.method = 'approve';
            result.summary.spender = spender;
            result.summary.approvalAmount = amount.toString();
            
            // Check for unlimited approval
            const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
            if (amount === MAX_UINT256) {
                result.warnings.push('Unlimited token approval requested');
                result.risks.push({
                    type: 'UNLIMITED_APPROVAL',
                    severity: 'HIGH',
                    message: 'Granting unlimited spending approval for tokens'
                });
            }
            
            // Warn about approvals in general
            result.risks.push({
                type: 'TOKEN_APPROVAL',
                severity: 'MEDIUM',
                message: `Allowing ${spender} to spend tokens on your behalf`
            });
            
        } catch (error) {
            result.warnings.push('Failed to decode token approval');
        }
    }
    
    /**
     * Simulate transaction (basic simulation without chain state)
     */
    async simulateTransaction(transaction, provider) {
        const simulation = {
            success: null,
            error: null,
            gasEstimate: null,
            effects: []
        };
        
        try {
            // Estimate gas (this also validates the transaction would succeed)
            const gasEstimate = await provider.estimateGas(transaction);
            simulation.gasEstimate = gasEstimate.toString();
            simulation.success = true;
            
            // Detect common effects
            if (transaction.value && transaction.value !== '0x0') {
                simulation.effects.push({
                    type: 'ETH_TRANSFER',
                    from: transaction.from,
                    to: transaction.to,
                    value: transaction.value
                });
            }
            
            // For contract interactions, we can't simulate without more infrastructure
            if (transaction.data && transaction.data !== '0x') {
                simulation.effects.push({
                    type: 'CONTRACT_INTERACTION',
                    contract: transaction.to,
                    data: transaction.data
                });
            }
            
        } catch (error) {
            simulation.success = false;
            simulation.error = error.message;
            
            // Parse common errors
            if (error.message.includes('insufficient funds')) {
                simulation.error = 'Insufficient funds for transaction';
            } else if (error.message.includes('reverted')) {
                simulation.error = 'Transaction would fail (contract reverted)';
            }
        }
        
        return simulation;
    }
    
    /**
     * Calculate overall risk score
     */
    calculateRiskScore(validationResult) {
        let score = 0;
        
        // Critical issues
        if (!validationResult.valid) {
            return 100; // Maximum risk
        }
        
        // Count risks by severity
        for (const risk of validationResult.risks) {
            switch (risk.severity) {
                case 'CRITICAL':
                    score += 40;
                    break;
                case 'HIGH':
                    score += 25;
                    break;
                case 'MEDIUM':
                    score += 15;
                    break;
                case 'LOW':
                    score += 5;
                    break;
            }
        }
        
        // Add points for warnings
        score += validationResult.warnings.length * 5;
        
        return Math.min(score, 100); // Cap at 100
    }
    
    /**
     * Check if address is valid
     */
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    
    /**
     * Format validation result for display
     */
    formatValidationResult(result) {
        const formatted = {
            status: result.valid ? 'SAFE' : 'DANGEROUS',
            riskLevel: this.getRiskLevel(result.riskScore),
            summary: result.summary,
            issues: []
        };
        
        // Add errors as critical issues
        for (const error of result.errors) {
            formatted.issues.push({
                type: 'ERROR',
                message: error
            });
        }
        
        // Add high/critical risks
        for (const risk of result.risks) {
            if (risk.severity === 'HIGH' || risk.severity === 'CRITICAL') {
                formatted.issues.push({
                    type: 'RISK',
                    severity: risk.severity,
                    message: risk.message
                });
            }
        }
        
        // Add warnings
        for (const warning of result.warnings) {
            formatted.issues.push({
                type: 'WARNING',
                message: warning
            });
        }
        
        return formatted;
    }
    
    /**
     * Get risk level from score
     */
    getRiskLevel(score) {
        if (score >= 80) return 'CRITICAL';
        if (score >= 60) return 'HIGH';
        if (score >= 40) return 'MEDIUM';
        if (score >= 20) return 'LOW';
        return 'MINIMAL';
    }
}

// Class is available globally in service worker context