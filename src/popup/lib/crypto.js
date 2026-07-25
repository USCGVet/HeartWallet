/**
 * popup/lib/crypto.js
 *
 * Small crypto helpers used by the popup UI.
 */

// Fixed salt for the privacy PIN hash. A per-install random salt would be better
// practice, but this hash only gates whether balances are visible on screen - it is
// not protecting key material - and changing it would lock out existing users' PINs.
const PRIVACY_PIN_SALT = 'HeartWallet-PrivacyMode-Salt';

/**
 * Hash a privacy PIN using SHA-256.
 *
 * Note: this is for view-only protection, not for securing private keys. The actual
 * wallet encryption uses Argon2id, which is far stronger. A PIN is short enough to
 * brute force offline, so treat this as a screen guard only.
 *
 * @param {string} pin - The PIN to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function hashPrivacyPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + PRIVACY_PIN_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
