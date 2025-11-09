/**
 * tests/setup.js
 *
 * Test setup and Chrome API mocks
 */

import { vi } from 'vitest';

// Mock Chrome Storage API
global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys) => {
        return Promise.resolve({});
      }),
      set: vi.fn((items) => {
        return Promise.resolve();
      }),
      remove: vi.fn((keys) => {
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        return Promise.resolve();
      })
    },
    sync: {
      get: vi.fn(),
      set: vi.fn()
    }
  },
  runtime: {
    lastError: null,
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn()
    }
  },
  notifications: {
    create: vi.fn()
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn()
  }
};

// Mock Web Crypto API (for Node.js environment)
if (typeof crypto === 'undefined') {
  const { webcrypto } = await import('crypto');
  global.crypto = webcrypto;
}

// Wrap crypto.subtle.digest to ensure it returns proper ArrayBuffer (not Buffer)
if (global.crypto && global.crypto.subtle) {
  const originalDigest = global.crypto.subtle.digest.bind(global.crypto.subtle);
  global.crypto.subtle.digest = async function(algorithm, data) {
    const result = await originalDigest(algorithm, data);
    // Ensure result is a true ArrayBuffer, not a Buffer
    if (result instanceof Buffer || result.constructor.name === 'Buffer') {
      return new Uint8Array(result).buffer;
    }
    return result;
  };
}

// Override crypto.getRandomValues to ensure it returns Uint8Array (not Buffer)
// This fixes compatibility with ethers.js which expects Uint8Array
const originalGetRandomValues = global.crypto.getRandomValues.bind(global.crypto);
global.crypto.getRandomValues = function(array) {
  const result = originalGetRandomValues(array);
  // Always create a new Uint8Array to ensure it's not a Buffer
  // Node.js crypto.getRandomValues can return Buffer-backed typed arrays
  if (result && result.buffer) {
    const newArray = new Uint8Array(result.length);
    newArray.set(result);
    return newArray;
  }
  return result;
};

// Override ethers.js crypto functions to return proper Uint8Array (not Buffer)
// Import and register after crypto setup
(async () => {
  const { createHash, createHmac, pbkdf2Sync } = await import('crypto');
  const { randomBytes, sha256, sha512, pbkdf2, computeHmac } = await import('ethers');

  // Override randomBytes
  randomBytes.register((length) => {
    const bytes = new Uint8Array(length);
    global.crypto.getRandomValues(bytes);
    return bytes;
  });

  // Override sha256 to return Uint8Array instead of Buffer
  sha256.register((data) => {
    const buffer = createHash('sha256').update(data).digest();
    return new Uint8Array(buffer);
  });

  // Override sha512 to return Uint8Array instead of Buffer
  sha512.register((data) => {
    const buffer = createHash('sha512').update(data).digest();
    return new Uint8Array(buffer);
  });

  // Override pbkdf2 to return Uint8Array instead of Buffer
  pbkdf2.register((password, salt, iterations, keylen, algo) => {
    const buffer = pbkdf2Sync(password, salt, iterations, keylen, algo);
    return new Uint8Array(buffer);
  });

  // Override computeHmac to return Uint8Array instead of Buffer
  computeHmac.register((algorithm, key, data) => {
    const buffer = createHmac(algorithm, key).update(data).digest();
    return new Uint8Array(buffer);
  });
})();

// Mock atob/btoa if not available
if (typeof atob === 'undefined') {
  global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
}
if (typeof btoa === 'undefined') {
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
