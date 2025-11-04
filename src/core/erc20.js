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

    return { name, symbol, decimals: Number(decimals) };
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
 * Transfers tokens
 * @param {ethers.Wallet} signer - Wallet signer
 * @param {string} tokenAddress - Token contract address
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount in wei (as string)
 * @returns {Promise<ethers.TransactionResponse>} Transaction response
 */
export async function transferToken(signer, tokenAddress, toAddress, amount) {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const tx = await contract.transfer(toAddress, amount);
    return tx;
  } catch (error) {
    throw new Error(`Failed to transfer token: ${error.message}`);
  }
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
