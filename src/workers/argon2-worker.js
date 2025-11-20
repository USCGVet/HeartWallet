/**
 * argon2-worker.js
 *
 * Web Worker for Argon2id key derivation
 * Runs in separate thread to prevent UI blocking
 */

import { argon2idAsync } from '@noble/hashes/argon2.js';

/**
 * Listen for messages from main thread
 * Expected message format: { password, salt, params }
 */
self.onmessage = async (e) => {
  const { password, salt, params } = e.data;

  try {
    // Convert password string to Uint8Array
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    // Convert salt from array to Uint8Array if needed
    const saltBytes = new Uint8Array(salt);

    // Run Argon2id computation with progress callbacks
    const result = await argon2idAsync(
      passwordBytes,
      saltBytes,
      {
        m: params.memory,
        t: params.iterations,
        p: params.parallelism || 1,
        dkLen: 32,
        asyncTick: 5, // Yield every 5ms (doesn't block UI since we're in worker)
        onProgress: (progress) => {
          // Send progress updates back to main thread
          self.postMessage({
            type: 'progress',
            progress: progress
          });
        }
      }
    );

    // Send result back to main thread
    self.postMessage({
      type: 'complete',
      result: Array.from(result) // Convert Uint8Array to regular array for postMessage
    });

  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};
