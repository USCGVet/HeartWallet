/**
 * core/storage.js
 *
 * Encrypted storage wrapper for Chrome storage API
 * Handles both encrypted (for sensitive data) and unencrypted storage
 */

import { ethers } from 'ethers';

/**
 * Saves unencrypted data (for non-sensitive data)
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {Promise<void>}
 */
export async function save(key, data) {
  try {
    await chrome.storage.local.set({ [key]: data });
  } catch (error) {
    console.error('Error saving data:', error);
    throw new Error('Failed to save data');
  }
}

/**
 * Loads unencrypted data
 * @param {string} key - Storage key
 * @returns {Promise<any>} Stored data or null if not found
 */
export async function load(key) {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
  } catch (error) {
    console.error('Error loading data:', error);
    throw new Error('Failed to load data');
  }
}

/**
 * Removes item from storage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export async function remove(key) {
  try {
    await chrome.storage.local.remove(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw new Error('Failed to remove data');
  }
}

/**
 * Clears all storage (use with caution!)
 * @returns {Promise<void>}
 */
export async function clear() {
  try {
    await chrome.storage.local.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw new Error('Failed to clear storage');
  }
}

/**
 * Gets all keys in storage
 * @returns {Promise<string[]>}
 */
export async function getAllKeys() {
  try {
    const all = await chrome.storage.local.get(null);
    return Object.keys(all);
  } catch (error) {
    console.error('Error getting keys:', error);
    throw new Error('Failed to get storage keys');
  }
}
