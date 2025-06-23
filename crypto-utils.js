/**
 * Cryptographic utilities for secure key derivation and memory management
 * Implements PBKDF2 for password-based encryption and secure memory handling
 */

class CryptoUtils {
    static PBKDF2_ITERATIONS = 100000; // Rabby uses 5000, but 100k is more secure
    static SALT_LENGTH = 32; // 256 bits
    static KEY_LENGTH = 32; // 256 bits
    
    /**
     * Derives a key from password using PBKDF2
     * @param {string} password - User password
     * @param {Uint8Array} salt - Salt for key derivation
     * @returns {Promise<CryptoKey>} Derived key for encryption
     */
    static async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        
        // Import password as key material
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        // Derive encryption key using PBKDF2
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            passwordKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }
    
    /**
     * Generates a random salt
     * @returns {Uint8Array} Random salt
     */
    static generateSalt() {
        return crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    }
    
    /**
     * Encrypts data using AES-GCM with derived key
     * @param {string} data - Data to encrypt
     * @param {CryptoKey} key - Encryption key
     * @returns {Promise<{encrypted: ArrayBuffer, iv: Uint8Array}>}
     */
    static async encryptWithKey(data, key) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM requires 12 bytes
        
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            dataBuffer
        );
        
        return { encrypted, iv };
    }
    
    /**
     * Decrypts data using AES-GCM with derived key
     * @param {ArrayBuffer} encrypted - Encrypted data
     * @param {CryptoKey} key - Decryption key
     * @param {Uint8Array} iv - Initialization vector
     * @returns {Promise<string>} Decrypted data
     */
    static async decryptWithKey(encrypted, key, iv) {
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encrypted
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }
    
    /**
     * Securely clears sensitive data from memory
     * @param {Uint8Array|ArrayBuffer} data - Data to clear
     */
    static secureErase(data) {
        if (data instanceof ArrayBuffer) {
            const view = new Uint8Array(data);
            crypto.getRandomValues(view); // Overwrite with random
            view.fill(0); // Then with zeros
        } else if (data instanceof Uint8Array) {
            crypto.getRandomValues(data); // Overwrite with random
            data.fill(0); // Then with zeros
        }
    }
    
    /**
     * Creates a secure wrapper for sensitive string data
     * Converts string to Uint8Array for better memory control
     */
    static createSecureString(str) {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    }
    
    /**
     * Reads a secure string
     * @param {Uint8Array} secureData - Secure string data
     * @returns {string} Original string
     */
    static readSecureString(secureData) {
        const decoder = new TextDecoder();
        return decoder.decode(secureData);
    }
}

// Enhanced secure memory storage that properly clears data
class SecureMemory {
    constructor() {
        this.data = new Map();
    }
    
    /**
     * Stores sensitive data with automatic cleanup
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(key, value, ttl = null) {
        // If it's a string, convert to secure format
        if (typeof value === 'string') {
            value = CryptoUtils.createSecureString(value);
        }
        
        const entry = {
            value,
            timeout: null
        };
        
        // Set auto-cleanup if TTL specified
        if (ttl) {
            entry.timeout = setTimeout(() => {
                this.delete(key);
            }, ttl);
        }
        
        // Clear any existing data for this key
        if (this.data.has(key)) {
            this.delete(key);
        }
        
        this.data.set(key, entry);
    }
    
    /**
     * Gets data without exposing the secure storage
     * @param {string} key - Storage key
     * @returns {any} Stored value or null
     */
    get(key) {
        const entry = this.data.get(key);
        if (!entry) return null;
        
        // If it's a Uint8Array, return a copy to prevent external modification
        if (entry.value instanceof Uint8Array) {
            return new Uint8Array(entry.value);
        }
        
        return entry.value;
    }
    
    /**
     * Securely deletes data
     * @param {string} key - Storage key
     */
    delete(key) {
        const entry = this.data.get(key);
        if (!entry) return;
        
        // Clear timeout if exists
        if (entry.timeout) {
            clearTimeout(entry.timeout);
        }
        
        // Securely erase the value
        if (entry.value instanceof Uint8Array || entry.value instanceof ArrayBuffer) {
            CryptoUtils.secureErase(entry.value);
        }
        
        this.data.delete(key);
    }
    
    /**
     * Clears all stored data securely
     */
    clear() {
        for (const key of this.data.keys()) {
            this.delete(key);
        }
    }
}

// Classes are available globally in service worker context