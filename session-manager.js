/**
 * Session Manager - Handles per-origin session isolation
 * Ensures that each origin has its own isolated session and permissions
 */

class SessionManager {
    constructor() {
        // Map of origin -> session data
        this.sessions = new Map();
        
        // Map of origin -> permission data
        this.permissions = new Map();
        
        // Default session configuration
        this.DEFAULT_SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
        this.MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
        
        // Session cleanup interval
        this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 60000);
    }
    
    /**
     * Create or get session for origin
     * @param {string} origin - Origin requesting session
     * @param {object} options - Session options
     * @returns {object} Session object
     */
    createSession(origin, options = {}) {
        if (!origin || typeof origin !== 'string') {
            throw new Error('Invalid origin');
        }
        
        // Validate origin format
        try {
            new URL(origin);
        } catch {
            throw new Error('Invalid origin format');
        }
        
        const now = Date.now();
        const duration = Math.min(
            options.duration || this.DEFAULT_SESSION_DURATION,
            this.MAX_SESSION_DURATION
        );
        
        const session = {
            id: this.generateSessionId(),
            origin: origin,
            createdAt: now,
            expiresAt: now + duration,
            lastActivity: now,
            isActive: true,
            permissions: new Set(),
            metadata: options.metadata || {}
        };
        
        this.sessions.set(origin, session);
        
        return {
            id: session.id,
            origin: session.origin,
            expiresAt: session.expiresAt
        };
    }
    
    /**
     * Get session for origin
     * @param {string} origin - Origin to get session for
     * @returns {object|null} Session object or null
     */
    getSession(origin) {
        const session = this.sessions.get(origin);
        
        if (!session) {
            return null;
        }
        
        // Check if session is expired
        if (Date.now() > session.expiresAt) {
            this.endSession(origin);
            return null;
        }
        
        // Update last activity
        session.lastActivity = Date.now();
        
        return session;
    }
    
    /**
     * Check if origin has active session
     * @param {string} origin - Origin to check
     * @returns {boolean} Whether session is active
     */
    hasActiveSession(origin) {
        const session = this.getSession(origin);
        return session !== null && session.isActive;
    }
    
    /**
     * End session for origin
     * @param {string} origin - Origin to end session for
     */
    endSession(origin) {
        const session = this.sessions.get(origin);
        
        if (session) {
            session.isActive = false;
            this.sessions.delete(origin);
            
            // Also clear permissions
            this.permissions.delete(origin);
        }
    }
    
    /**
     * Extend session duration
     * @param {string} origin - Origin to extend session for
     * @param {number} additionalTime - Additional time in milliseconds
     */
    extendSession(origin, additionalTime) {
        const session = this.getSession(origin);
        
        if (!session) {
            throw new Error('No active session for origin');
        }
        
        const newExpiry = session.expiresAt + additionalTime;
        const maxExpiry = session.createdAt + this.MAX_SESSION_DURATION;
        
        session.expiresAt = Math.min(newExpiry, maxExpiry);
        session.lastActivity = Date.now();
    }
    
    /**
     * Add permission for origin
     * @param {string} origin - Origin to add permission for
     * @param {string} permission - Permission to add
     * @param {object} options - Permission options
     */
    addPermission(origin, permission, options = {}) {
        const session = this.getSession(origin);
        
        if (!session) {
            throw new Error('No active session for origin');
        }
        
        if (!this.permissions.has(origin)) {
            this.permissions.set(origin, new Map());
        }
        
        const originPermissions = this.permissions.get(origin);
        originPermissions.set(permission, {
            granted: true,
            grantedAt: Date.now(),
            options: options
        });
        
        session.permissions.add(permission);
    }
    
    /**
     * Check if origin has permission
     * @param {string} origin - Origin to check
     * @param {string} permission - Permission to check
     * @returns {boolean} Whether permission is granted
     */
    hasPermission(origin, permission) {
        const session = this.getSession(origin);
        
        if (!session || !session.isActive) {
            return false;
        }
        
        const originPermissions = this.permissions.get(origin);
        
        if (!originPermissions) {
            return false;
        }
        
        const perm = originPermissions.get(permission);
        return perm && perm.granted;
    }
    
    /**
     * Get all permissions for origin
     * @param {string} origin - Origin to get permissions for
     * @returns {Array} Array of permissions
     */
    getPermissions(origin) {
        const session = this.getSession(origin);
        
        if (!session) {
            return [];
        }
        
        return Array.from(session.permissions);
    }
    
    /**
     * Revoke permission for origin
     * @param {string} origin - Origin to revoke permission for
     * @param {string} permission - Permission to revoke
     */
    revokePermission(origin, permission) {
        const session = this.sessions.get(origin);
        const originPermissions = this.permissions.get(origin);
        
        if (session) {
            session.permissions.delete(permission);
        }
        
        if (originPermissions) {
            originPermissions.delete(permission);
        }
    }
    
    /**
     * Get all active sessions
     * @returns {Array} Array of session info
     */
    getActiveSessions() {
        const activeSessions = [];
        
        for (const [origin, session] of this.sessions.entries()) {
            if (session.isActive && Date.now() <= session.expiresAt) {
                activeSessions.push({
                    origin: origin,
                    createdAt: session.createdAt,
                    expiresAt: session.expiresAt,
                    permissions: Array.from(session.permissions)
                });
            }
        }
        
        return activeSessions;
    }
    
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions() {
        const now = Date.now();
        
        for (const [origin, session] of this.sessions.entries()) {
            if (now > session.expiresAt || !session.isActive) {
                this.endSession(origin);
            }
        }
    }
    
    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
    
    /**
     * Clear all sessions and permissions
     */
    clearAll() {
        this.sessions.clear();
        this.permissions.clear();
    }
    
    /**
     * Destroy session manager
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clearAll();
    }
}

// Permission types - make available globally for service worker
if (typeof PERMISSIONS === 'undefined') {
    var PERMISSIONS = {
        ACCOUNTS: 'eth_accounts',
        SIGN_MESSAGE: 'personal_sign',
        SIGN_TYPED_DATA: 'eth_signTypedData',
        SEND_TRANSACTION: 'eth_sendTransaction',
        SWITCH_CHAIN: 'wallet_switchEthereumChain',
        ADD_CHAIN: 'wallet_addEthereumChain',
        WATCH_ASSET: 'wallet_watchAsset'
    };
}