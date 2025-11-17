/**
 * Browser polyfills for Node.js APIs
 * Required for Ledger hardware wallet libraries
 */

import { Buffer } from 'buffer';

// Make Buffer available globally for Ledger libraries
window.Buffer = Buffer;
globalThis.Buffer = Buffer;
