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

// Mock atob/btoa if not available
if (typeof atob === 'undefined') {
  global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
}
if (typeof btoa === 'undefined') {
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
