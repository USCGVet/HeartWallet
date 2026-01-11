/**
 * tests/setup.js
 *
 * Test setup and Chrome API mocks
 *
 * PERFORMANCE: Mocks expensive crypto operations for fast test execution
 * - Argon2id worker: Returns instant mock result (no 256MB memory allocation)
 * - PBKDF2: Uses Node.js native (faster than browser)
 */

import { vi } from 'vitest';

// ===== MOCK ARGON2 WORKER =====
// The real Argon2id uses 256MB memory and takes 2-5 seconds per operation.
// For tests, we mock it to return a deterministic result instantly.
// This tests the integration logic without the expensive computation.
vi.mock('../src/workers/argon2-worker.js?worker', () => {
  return {
    default: class MockArgon2Worker {
      constructor() {
        this.onmessage = null;
        this.onerror = null;
      }

      postMessage(data) {
        // Simulate async worker response
        setTimeout(() => {
          if (this.onmessage) {
            // Generate deterministic mock result based on password + salt
            // This ensures same inputs = same outputs (like real Argon2id)
            const { password, salt } = data;
            const mockResult = new Uint8Array(32);

            // Simple deterministic fill based on password
            const encoder = new TextEncoder();
            const pwBytes = encoder.encode(password);
            for (let i = 0; i < 32; i++) {
              mockResult[i] = (pwBytes[i % pwBytes.length] + salt[i % salt.length] + i) % 256;
            }

            // Send progress then complete (mimics real worker)
            this.onmessage({ data: { type: 'progress', progress: 0.5 } });
            this.onmessage({ data: { type: 'complete', result: Array.from(mockResult) } });
          }
        }, 1); // 1ms delay to simulate async
      }

      terminate() {
        // No-op for mock
      }
    }
  };
});

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
