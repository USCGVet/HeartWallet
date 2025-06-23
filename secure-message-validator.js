/**
 * Secure Message Validator
 * Provides origin validation and message integrity checks
 */

class SecureMessageValidator {
    constructor() {
        // Allowed message types
        this.allowedMethods = new Set([
            'eth_accounts',
            'eth_requestAccounts',
            'eth_sendTransaction',
            'personal_sign',
            'eth_signTypedData',
            'eth_signTypedData_v3',
            'eth_signTypedData_v4',
            'eth_chainId',
            'wallet_switchEthereumChain',
            'wallet_addEthereumChain',
            'wallet_watchAsset',
            'eth_getBalance',
            'eth_getTransactionCount',
            'eth_estimateGas',
            'eth_gasPrice',
            'eth_getBlockByNumber',
            'eth_call'
        ]);
        
        // Rate limiting map
        this.rateLimits = new Map();
        this.RATE_LIMIT_WINDOW = 60000; // 1 minute
        this.MAX_REQUESTS_PER_WINDOW = 30;
    }
    
    /**
     * Validate origin against whitelist/blacklist
     * @param {string} origin - Origin to validate
     * @returns {boolean} Whether origin is valid
     */
    validateOrigin(origin) {
        // Basic validation
        if (!origin || typeof origin !== 'string') {
            return false;
        }
        
        // Parse origin
        let url;
        try {
            url = new URL(origin);
        } catch {
            return false;
        }
        
        // Block non-HTTPS origins in production (allow localhost for dev)
        if (url.protocol !== 'https:' && 
            url.hostname !== 'localhost' && 
            url.hostname !== '127.0.0.1') {
            console.warn('Blocked non-HTTPS origin:', origin);
            return false;
        }
        
        // Block known malicious patterns
        const maliciousPatterns = [
            /phishing/i,
            /fake.*wallet/i,
            /wallet.*stealer/i,
            /crypto.*scam/i
        ];
        
        for (const pattern of maliciousPatterns) {
            if (pattern.test(origin)) {
                console.error('Blocked malicious origin:', origin);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Validate message structure and content
     * @param {object} message - Message to validate
     * @returns {object} Validation result
     */
    validateMessage(message) {
        // Check basic structure
        if (!message || typeof message !== 'object') {
            return { valid: false, error: 'Invalid message structure' };
        }
        
        if (!message.method || typeof message.method !== 'string') {
            return { valid: false, error: 'Missing or invalid method' };
        }
        
        // Check if method is allowed
        if (!this.allowedMethods.has(message.method)) {
            return { valid: false, error: `Method not allowed: ${message.method}` };
        }
        
        // Validate specific method parameters
        const paramValidation = this.validateMethodParams(message.method, message.params);
        if (!paramValidation.valid) {
            return paramValidation;
        }
        
        return { valid: true };
    }
    
    /**
     * Validate parameters for specific methods
     * @param {string} method - Method name
     * @param {any} params - Method parameters
     * @returns {object} Validation result
     */
    validateMethodParams(method, params) {
        switch (method) {
            case 'eth_sendTransaction':
                if (!Array.isArray(params) || params.length === 0) {
                    return { valid: false, error: 'Invalid transaction parameters' };
                }
                const tx = params[0];
                if (!tx || typeof tx !== 'object') {
                    return { valid: false, error: 'Invalid transaction object' };
                }
                if (!tx.to || !this.isValidAddress(tx.to)) {
                    return { valid: false, error: 'Invalid recipient address' };
                }
                break;
                
            case 'personal_sign':
                if (!Array.isArray(params) || params.length < 2) {
                    return { valid: false, error: 'Invalid parameters for personal_sign' };
                }
                if (!this.isValidAddress(params[1])) {
                    return { valid: false, error: 'Invalid signing address' };
                }
                break;
                
            case 'wallet_switchEthereumChain':
            case 'wallet_addEthereumChain':
                if (!Array.isArray(params) || params.length === 0) {
                    return { valid: false, error: 'Invalid chain parameters' };
                }
                break;
        }
        
        return { valid: true };
    }
    
    /**
     * Check if address is valid Ethereum address
     * @param {string} address - Address to validate
     * @returns {boolean} Whether address is valid
     */
    isValidAddress(address) {
        if (!address || typeof address !== 'string') {
            return false;
        }
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    
    /**
     * Check rate limiting for origin
     * @param {string} origin - Origin to check
     * @returns {boolean} Whether request is allowed
     */
    checkRateLimit(origin) {
        const now = Date.now();
        const windowStart = now - this.RATE_LIMIT_WINDOW;
        
        // Get or create rate limit entry
        if (!this.rateLimits.has(origin)) {
            this.rateLimits.set(origin, []);
        }
        
        const requests = this.rateLimits.get(origin);
        
        // Remove old requests outside window
        const recentRequests = requests.filter(timestamp => timestamp > windowStart);
        this.rateLimits.set(origin, recentRequests);
        
        // Check if limit exceeded
        if (recentRequests.length >= this.MAX_REQUESTS_PER_WINDOW) {
            console.warn(`Rate limit exceeded for origin: ${origin}`);
            return false;
        }
        
        // Add current request
        recentRequests.push(now);
        
        return true;
    }
    
    /**
     * Generate message ID with timestamp
     * @returns {string} Unique message ID
     */
    generateMessageId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
    
    /**
     * Sign message for integrity (simplified version)
     * In production, use proper HMAC or similar
     * @param {object} message - Message to sign
     * @param {string} secret - Secret key
     * @returns {string} Message signature
     */
    async signMessage(message, secret) {
        const messageStr = JSON.stringify(message);
        const encoder = new TextEncoder();
        const data = encoder.encode(messageStr + secret);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureMessageValidator;
}