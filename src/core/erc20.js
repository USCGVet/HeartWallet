/**
 * core/erc20.js
 *
 * ERC-20 token contract interface
 */

import { ethers } from 'ethers';
import { getProvider } from './rpc.js';

// Standard ERC-20 ABI (minimal interface we need)
const ERC20_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',

  // Write functions
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

/**
 * Gets an ERC-20 contract instance
 * @param {string} network - Network key
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<ethers.Contract>} Contract instance
 */
export async function getTokenContract(network, tokenAddress) {
  const provider = await getProvider(network);
  return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
}

// SECURITY: name()/symbol() are attacker-controlled strings - a malicious token
// contract can return arbitrary text (markup, control characters, megabytes of it).
// These values get persisted and rendered in the wallet UI, so bound and clean them
// at the point of ingestion rather than trusting every downstream render site.
const MAX_TOKEN_NAME_LENGTH = 64;
const MAX_TOKEN_SYMBOL_LENGTH = 16;

/**
 * Cleans a contract-supplied metadata string: strips control characters
 * (including bidi overrides used for display spoofing) and caps the length.
 * @param {any} value - Raw value returned by the contract
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Safe, bounded string
 */
export function sanitizeTokenString(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value
    // C0 controls + DEL + C1 controls
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // zero-width / bidi overrides / invisible formatting (display-spoofing chars)
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Fetches token metadata (name, symbol, decimals)
 * @param {string} network - Network key
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<{name: string, symbol: string, decimals: number}>}
 */
export async function getTokenMetadata(network, tokenAddress) {
  try {
    const contract = await getTokenContract(network, tokenAddress);

    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals()
    ]);

    // SECURITY: never propagate raw contract-supplied strings
    const safeName = sanitizeTokenString(name, MAX_TOKEN_NAME_LENGTH);
    const safeSymbol = sanitizeTokenString(symbol, MAX_TOKEN_SYMBOL_LENGTH);

    if (!safeSymbol) {
      throw new Error('Token symbol is empty or invalid');
    }

    // decimals must be a sane uint8; reject nonsense so formatting can't be broken
    const safeDecimals = Number(decimals);
    if (!Number.isInteger(safeDecimals) || safeDecimals < 0 || safeDecimals > 36) {
      throw new Error('Token decimals out of range');
    }

    return { name: safeName || safeSymbol, symbol: safeSymbol, decimals: safeDecimals };
  } catch (error) {
    throw new Error(`Failed to fetch token metadata: ${error.message}`);
  }
}

/**
 * Gets token balance for an address
 * @param {string} network - Network key
 * @param {string} tokenAddress - Token contract address
 * @param {string} accountAddress - Account address to check
 * @returns {Promise<string>} Balance in wei (as string)
 */
export async function getTokenBalance(network, tokenAddress, accountAddress) {
  try {
    const contract = await getTokenContract(network, tokenAddress);
    const balance = await contract.balanceOf(accountAddress);
    return balance.toString();
  } catch (error) {
    throw new Error(`Failed to get token balance: ${error.message}`);
  }
}

/**
 * Formats token balance from wei to human-readable
 * @param {string} balanceWei - Balance in wei
 * @param {number} decimals - Token decimals
 * @param {number} displayDecimals - Number of decimals to display (default 4)
 * @returns {string} Formatted balance
 */
export function formatTokenBalance(balanceWei, decimals, displayDecimals = 4) {
  try {
    const balance = ethers.formatUnits(balanceWei, decimals);
    const num = parseFloat(balance);
    return num.toFixed(displayDecimals);
  } catch (error) {
    return '0.0000';
  }
}

/**
 * Parses human-readable amount to wei
 * @param {string} amount - Human-readable amount
 * @param {number} decimals - Token decimals
 * @returns {string} Amount in wei
 */
export function parseTokenAmount(amount, decimals) {
  return ethers.parseUnits(amount, decimals).toString();
}

/**
 * Validates if an address is a valid ERC-20 token contract
 * @param {string} network - Network key
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<boolean>} True if valid ERC-20 contract
 */
export async function validateTokenContract(network, tokenAddress) {
  try {
    // Check if address is valid
    if (!ethers.isAddress(tokenAddress)) {
      return false;
    }

    // Try to fetch basic metadata
    await getTokenMetadata(network, tokenAddress);
    return true;
  } catch (error) {
    return false;
  }
}
