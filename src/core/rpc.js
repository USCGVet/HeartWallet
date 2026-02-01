/**
 * core/rpc.js
 *
 * RPC provider for blockchain interaction with automatic failover
 */

import { ethers } from 'ethers';

// Default Network RPC endpoints - Multiple endpoints per network for redundancy
// These are the fallback defaults; user-configured priorities are loaded from storage
const DEFAULT_RPC_ENDPOINTS = {
  'pulsechainTestnet': [
    'https://rpc.v4.testnet.pulsechain.com',
    'https://rpc-testnet-pulsechain.g4mm4.io'
  ],
  'pulsechain': [
    'https://pulsechain-rpc.publicnode.com',
    'https://pulsechain.publicnode.com',
    'https://rpc-pulsechain.g4mm4.io',
    'https://rpc.pulsechain.com'
  ],
  'ethereum': [
    'https://ethereum.publicnode.com',
    'https://rpc.ankr.com/eth',
    'https://cloudflare-eth.com',
    'https://eth.llamarpc.com'
  ],
  'sepolia': [
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia.publicnode.com',
    'https://rpc.ankr.com/eth_sepolia'
  ]
};

// User-configured RPC priorities (loaded from storage)
let userRpcPriorities = null;

// Cached providers per network
const providers = {};

/**
 * Loads user-configured RPC priorities from storage
 * @returns {Promise<Object|null>}
 */
async function loadUserRpcPriorities() {
  if (userRpcPriorities !== null) {
    return userRpcPriorities;
  }

  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const result = await chrome.storage.local.get('rpcPriorities');
      userRpcPriorities = result.rpcPriorities || {};
      return userRpcPriorities;
    }
  } catch (error) {
    console.warn('Could not load RPC priorities from storage:', error);
  }

  userRpcPriorities = {};
  return userRpcPriorities;
}

/**
 * Gets the RPC endpoints for a network (user-configured or defaults)
 * @param {string} network - Network key
 * @returns {Promise<string[]>}
 */
async function getRpcEndpoints(network) {
  const priorities = await loadUserRpcPriorities();

  // Use user-configured priorities if available, otherwise defaults
  if (priorities[network] && priorities[network].length > 0) {
    return priorities[network];
  }

  return DEFAULT_RPC_ENDPOINTS[network] || [];
}

/**
 * Updates RPC priorities for a network (called from popup)
 * @param {string} network - Network key
 * @param {string[]} priorities - Ordered list of RPC URLs
 */
export function updateRpcPriorities(network, priorities) {
  if (!userRpcPriorities) {
    userRpcPriorities = {};
  }
  userRpcPriorities[network] = priorities;

  // Clear cached provider for this network to force reconnection with new priority
  delete providers[network];
}

// Track failed endpoints to avoid repeated failures
const endpointHealth = new Map(); // endpoint -> { failures: number, lastCheck: timestamp, blacklisted: boolean }

// Health check configuration
const HEALTH_CONFIG = {
  MAX_FAILURES: 3,              // Blacklist after 3 failures
  BLACKLIST_DURATION: 300000,   // 5 minutes blacklist
  HEALTH_CHECK_TIMEOUT: 5000,   // 5 second timeout for health checks
  RETRY_DELAY: 1000             // 1 second delay between endpoint attempts
};

/**
 * Records an endpoint failure for health tracking
 * @param {string} endpoint - RPC endpoint URL
 */
function recordEndpointFailure(endpoint) {
  const health = endpointHealth.get(endpoint) || { failures: 0, lastCheck: Date.now(), blacklisted: false };
  health.failures++;
  health.lastCheck = Date.now();
  
  if (health.failures >= HEALTH_CONFIG.MAX_FAILURES) {
    health.blacklisted = true;
    console.warn(`🫀 RPC endpoint blacklisted after ${health.failures} failures: ${endpoint}`);
    
    // Auto-recover after blacklist duration
    setTimeout(() => {
      const currentHealth = endpointHealth.get(endpoint);
      if (currentHealth) {
        currentHealth.blacklisted = false;
        currentHealth.failures = 0;
        console.log(`🫀 RPC endpoint recovered from blacklist: ${endpoint}`);
      }
    }, HEALTH_CONFIG.BLACKLIST_DURATION);
  }
  
  endpointHealth.set(endpoint, health);
}

/**
 * Records an endpoint success for health tracking
 * @param {string} endpoint - RPC endpoint URL
 */
function recordEndpointSuccess(endpoint) {
  const health = endpointHealth.get(endpoint) || { failures: 0, lastCheck: Date.now(), blacklisted: false };
  health.failures = Math.max(0, health.failures - 1); // Gradually reduce failure count
  health.lastCheck = Date.now();
  endpointHealth.set(endpoint, health);
}

/**
 * Checks if an endpoint is blacklisted
 * @param {string} endpoint - RPC endpoint URL
 * @returns {boolean}
 */
function isEndpointBlacklisted(endpoint) {
  const health = endpointHealth.get(endpoint);
  return health?.blacklisted || false;
}
/**
 * Gets or creates an RPC provider for a network with automatic failover
 * @param {string} network - Network key (e.g., 'pulsechainTestnet')
 * @returns {Promise<ethers.JsonRpcProvider>}
 */
export async function getProvider(network) {
  // Get endpoints from user config or defaults
  const endpoints = await getRpcEndpoints(network);

  if (!endpoints || endpoints.length === 0) {
    throw new Error(`Unknown network: ${network}`);
  }

  // If we have a cached working provider, return it
  if (providers[network]) {
    try {
      // Quick health check on cached provider
      await providers[network].getBlockNumber();
      return providers[network];
    } catch (error) {
      console.warn(`🫀 Cached provider failed for ${network}, trying failover...`);
      delete providers[network]; // Clear failed provider
    }
  }
  
  // Try each endpoint until one works
  const endpointsList = Array.isArray(endpoints) ? endpoints : [endpoints];
  
  for (let i = 0; i < endpointsList.length; i++) {
    const endpoint = endpointsList[i];
    
    // Skip blacklisted endpoints
    if (isEndpointBlacklisted(endpoint)) {
      console.warn(`🫀 Skipping blacklisted endpoint: ${endpoint}`);
      continue;
    }
    
    try {
      console.log(`🫀 Trying RPC endpoint (${i + 1}/${endpointsList.length}): ${endpoint}`);
      
      // Create provider and test it
      const provider = new ethers.JsonRpcProvider(endpoint);
      
      // Verify it works with a quick call
      await provider.getBlockNumber();
      
      // Success! Cache and return
      providers[network] = provider;
      recordEndpointSuccess(endpoint);
      console.log(`🫀 Connected to RPC: ${endpoint}`);
      return provider;
      
    } catch (error) {
      console.error(`🫀 RPC endpoint failed: ${endpoint}`, error.message);
      recordEndpointFailure(endpoint);
      
      // Add delay before trying next endpoint (except on last attempt)
      if (i < endpointsList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, HEALTH_CONFIG.RETRY_DELAY));
      }
    }
  }
  
  // All endpoints failed
  throw new Error(`All RPC endpoints failed for network: ${network}. Please check your internet connection.`);
}

/**
 * Validates RPC response format based on method
 * @param {string} method - RPC method name
 * @param {any} result - RPC response result
 * @returns {{ valid: boolean, error?: string }}
 */
function validateRPCResponse(method, result) {
  // Null/undefined is valid for some methods (e.g., pending tx receipt)
  if (result === null || result === undefined) {
    const nullAllowedMethods = [
      'eth_getTransactionReceipt',
      'eth_getTransactionByHash',
      'eth_getBlockByNumber',
      'eth_getBlockByHash'
    ];
    if (nullAllowedMethods.includes(method)) {
      return { valid: true };
    }
  }

  switch (method) {
    case 'eth_blockNumber':
    case 'eth_gasPrice':
    case 'eth_getBalance':
    case 'eth_getTransactionCount':
    case 'eth_estimateGas':
      // These should return hex strings
      if (typeof result !== 'string' || !result.startsWith('0x')) {
        return { valid: false, error: `${method} expected hex string, got: ${typeof result}` };
      }
      // Validate it's a valid hex number
      if (!/^0x[0-9a-fA-F]*$/.test(result)) {
        return { valid: false, error: `${method} returned invalid hex: ${result}` };
      }
      break;

    case 'eth_sendRawTransaction':
    case 'eth_call':
      // Should return hex string (tx hash or call result)
      if (typeof result !== 'string' || !result.startsWith('0x')) {
        return { valid: false, error: `${method} expected hex string, got: ${typeof result}` };
      }
      break;

    case 'eth_chainId':
      // Should be hex string chain ID
      if (typeof result !== 'string' || !result.startsWith('0x')) {
        return { valid: false, error: `eth_chainId expected hex string, got: ${typeof result}` };
      }
      break;

    case 'eth_getBlockByNumber':
    case 'eth_getBlockByHash':
      // Should be object with required fields or null
      if (result !== null) {
        if (typeof result !== 'object') {
          return { valid: false, error: `${method} expected object, got: ${typeof result}` };
        }
        if (!result.number || !result.hash) {
          return { valid: false, error: `${method} missing required fields (number, hash)` };
        }
      }
      break;

    case 'eth_getTransactionReceipt':
      // Should be object with status field or null
      if (result !== null) {
        if (typeof result !== 'object') {
          return { valid: false, error: `${method} expected object, got: ${typeof result}` };
        }
        if (result.status === undefined) {
          return { valid: false, error: `${method} missing status field` };
        }
      }
      break;

    case 'eth_getTransactionByHash':
      // Should be object or null
      if (result !== null && typeof result !== 'object') {
        return { valid: false, error: `${method} expected object, got: ${typeof result}` };
      }
      break;
  }

  return { valid: true };
}

/**
 * Makes a raw RPC call with automatic failover and response validation
 * @param {string} network - Network key
 * @param {string} method - RPC method name
 * @param {Array} params - RPC parameters
 * @returns {Promise<any>} RPC result
 */
export async function rpcCall(network, method, params = []) {
  const provider = await getProvider(network);
  const result = await provider.send(method, params);

  // Validate response format
  const validation = validateRPCResponse(method, result);
  if (!validation.valid) {
    console.error(`🫀 RPC response validation failed: ${validation.error}`);
    throw new Error(`Invalid RPC response: ${validation.error}`);
  }

  return result;
}

/**
 * Gets balance for an address
 * @param {string} network - Network key
 * @param {string} address - Ethereum address
 * @returns {Promise<string>} Balance in wei (hex string)
 */
export async function getBalance(network, address) {
  return await rpcCall(network, 'eth_getBalance', [address, 'latest']);
}

/**
 * Gets transaction count (nonce) for an address
 * @param {string} network - Network key
 * @param {string} address - Ethereum address
 * @returns {Promise<string>} Transaction count (hex string)
 */
export async function getTransactionCount(network, address) {
  return await rpcCall(network, 'eth_getTransactionCount', [address, 'latest']);
}

/**
 * Gets current gas price
 * @param {string} network - Network key
 * @returns {Promise<string>} Gas price in wei (hex string)
 */
export async function getGasPrice(network) {
  return await rpcCall(network, 'eth_gasPrice', []);
}

/**
 * Gets the current base fee from the latest block (EIP-1559)
 * This is more accurate than eth_gasPrice for determining minimum required gas
 * @param {string} network - Network key
 * @returns {Promise<string>} Base fee per gas in wei (hex string)
 */
export async function getBaseFee(network) {
  try {
    const latestBlock = await rpcCall(network, 'eth_getBlockByNumber', ['latest', false]);
    if (latestBlock && latestBlock.baseFeePerGas) {
      return latestBlock.baseFeePerGas;
    }
    // Fallback to eth_gasPrice if block doesn't have baseFeePerGas (pre-EIP-1559)
    return await rpcCall(network, 'eth_gasPrice', []);
  } catch (error) {
    console.warn('Error getting base fee, falling back to eth_gasPrice:', error);
    return await rpcCall(network, 'eth_gasPrice', []);
  }
}

/**
 * Gets a safe gas price for transactions that accounts for base fee volatility
 * Returns max(eth_gasPrice, baseFee * 2) to ensure transactions get mined
 * @param {string} network - Network key
 * @returns {Promise<string>} Safe gas price in wei (hex string)
 */
export async function getSafeGasPrice(network) {
  try {
    const [gasPrice, baseFee] = await Promise.all([
      rpcCall(network, 'eth_gasPrice', []),
      getBaseFee(network)
    ]);

    const gasPriceWei = BigInt(gasPrice);
    const baseFeeWei = BigInt(baseFee);

    // Use the higher of:
    // 1. eth_gasPrice from RPC
    // 2. baseFee * 2 (to account for volatility)
    const safeGasPrice = gasPriceWei > (baseFeeWei * 2n) ? gasPriceWei : (baseFeeWei * 2n);

    return '0x' + safeGasPrice.toString(16);
  } catch (error) {
    console.warn('Error getting safe gas price, falling back to eth_gasPrice:', error);
    return await rpcCall(network, 'eth_gasPrice', []);
  }
}

/**
 * Gets fee history from recent blocks for accurate gas price estimation
 * Uses eth_feeHistory to analyze what priority fees were actually paid
 * @param {string} network - Network key
 * @param {number} blockCount - Number of recent blocks to analyze (default 20)
 * @param {number[]} percentiles - Percentiles to calculate (default [25, 50, 75, 90])
 * @returns {Promise<Object>} Fee history with base fees and priority fee percentiles
 */
export async function getFeeHistory(network, blockCount = 20, percentiles = [25, 50, 75, 90]) {
  try {
    const result = await rpcCall(network, 'eth_feeHistory', [
      '0x' + blockCount.toString(16),
      'latest',
      percentiles
    ]);

    return {
      baseFeePerGas: result.baseFeePerGas || [],
      gasUsedRatio: result.gasUsedRatio || [],
      reward: result.reward || [],
      oldestBlock: result.oldestBlock
    };
  } catch (error) {
    console.warn('eth_feeHistory not supported, falling back to basic gas price:', error);
    return null;
  }
}

/**
 * Gets tiered gas price recommendations (slow, normal, fast, instant)
 * Uses eth_feeHistory for accurate estimation on EIP-1559 networks
 * @param {string} network - Network key
 * @returns {Promise<Object>} Gas price recommendations in wei
 */
export async function getGasPriceRecommendations(network) {
  try {
    // Get fee history for last 20 blocks
    const feeHistory = await getFeeHistory(network, 20, [25, 50, 75, 95]);
    const baseFee = await getBaseFee(network);
    const baseFeeWei = BigInt(baseFee);

    if (feeHistory && feeHistory.reward && feeHistory.reward.length > 0) {
      // Calculate median priority fees from fee history
      // feeHistory.reward[i] contains [25th, 50th, 75th, 95th] percentile priority fees for block i
      const priorityFees = {
        slow: [],
        normal: [],
        fast: [],
        instant: []
      };

      for (const blockRewards of feeHistory.reward) {
        if (blockRewards && blockRewards.length >= 4) {
          priorityFees.slow.push(BigInt(blockRewards[0]));     // 25th percentile
          priorityFees.normal.push(BigInt(blockRewards[1]));   // 50th percentile
          priorityFees.fast.push(BigInt(blockRewards[2]));     // 75th percentile
          priorityFees.instant.push(BigInt(blockRewards[3]));  // 95th percentile
        }
      }

      // Calculate median of each tier
      const medianPriorityFees = {};
      for (const tier of ['slow', 'normal', 'fast', 'instant']) {
        const sorted = priorityFees[tier].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
        if (sorted.length > 0) {
          const mid = Math.floor(sorted.length / 2);
          medianPriorityFees[tier] = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2n;
        } else {
          medianPriorityFees[tier] = 0n;
        }
      }

      // Calculate next block base fee (can increase by up to 12.5% per block)
      // To be safe, assume 2 blocks of 12.5% increase for fast transactions
      const nextBaseFee = baseFeeWei * 1125n / 1000n; // +12.5%
      const safeBaseFee = baseFeeWei * 1265n / 1000n; // +26.5% (2 blocks of increase)

      // maxFeePerGas = baseFee (with buffer) + priorityFee
      return {
        baseFee: baseFeeWei.toString(),
        slow: {
          maxFeePerGas: (baseFeeWei + medianPriorityFees.slow).toString(),
          maxPriorityFeePerGas: medianPriorityFees.slow.toString()
        },
        normal: {
          maxFeePerGas: (nextBaseFee + medianPriorityFees.normal).toString(),
          maxPriorityFeePerGas: medianPriorityFees.normal.toString()
        },
        fast: {
          maxFeePerGas: (safeBaseFee + medianPriorityFees.fast).toString(),
          maxPriorityFeePerGas: medianPriorityFees.fast.toString()
        },
        instant: {
          maxFeePerGas: (safeBaseFee * 125n / 100n + medianPriorityFees.instant).toString(),
          maxPriorityFeePerGas: medianPriorityFees.instant.toString()
        },
        supportsEIP1559: true
      };
    }

    // Fallback: Use eth_gasPrice with multipliers if feeHistory not available
    const gasPrice = await rpcCall(network, 'eth_gasPrice', []);
    const gasPriceWei = BigInt(gasPrice);

    return {
      baseFee: baseFeeWei.toString(),
      slow: {
        maxFeePerGas: gasPriceWei.toString(),
        maxPriorityFeePerGas: '0'
      },
      normal: {
        maxFeePerGas: (gasPriceWei * 110n / 100n).toString(),
        maxPriorityFeePerGas: '0'
      },
      fast: {
        maxFeePerGas: (gasPriceWei * 125n / 100n).toString(),
        maxPriorityFeePerGas: '0'
      },
      instant: {
        maxFeePerGas: (gasPriceWei * 150n / 100n).toString(),
        maxPriorityFeePerGas: '0'
      },
      supportsEIP1559: false
    };
  } catch (error) {
    console.error('Error getting gas price recommendations:', error);

    // Ultimate fallback
    const gasPrice = await rpcCall(network, 'eth_gasPrice', []);
    const gasPriceWei = BigInt(gasPrice);

    return {
      baseFee: gasPriceWei.toString(),
      slow: { maxFeePerGas: gasPriceWei.toString(), maxPriorityFeePerGas: '0' },
      normal: { maxFeePerGas: (gasPriceWei * 110n / 100n).toString(), maxPriorityFeePerGas: '0' },
      fast: { maxFeePerGas: (gasPriceWei * 125n / 100n).toString(), maxPriorityFeePerGas: '0' },
      instant: { maxFeePerGas: (gasPriceWei * 150n / 100n).toString(), maxPriorityFeePerGas: '0' },
      supportsEIP1559: false
    };
  }
}

/**
 * Gets current block number
 * @param {string} network - Network key
 * @returns {Promise<string>} Block number (hex string)
 */
export async function getBlockNumber(network) {
  return await rpcCall(network, 'eth_blockNumber', []);
}

/**
 * Gets a block by number
 * @param {string} network - Network key
 * @param {string} blockNumber - Block number (hex string or 'latest', 'earliest', 'pending')
 * @param {boolean} includeTransactions - Whether to include full transaction objects (default false)
 * @returns {Promise<Object>} Block object
 */
export async function getBlockByNumber(network, blockNumber, includeTransactions = false) {
  return await rpcCall(network, 'eth_getBlockByNumber', [blockNumber, includeTransactions]);
}

/**
 * Estimates gas for a transaction
 * @param {string} network - Network key
 * @param {Object} transaction - Transaction object
 * @returns {Promise<string>} Estimated gas (hex string)
 */
export async function estimateGas(network, transaction) {
  return await rpcCall(network, 'eth_estimateGas', [transaction]);
}

/**
 * Executes a call (read-only transaction)
 * @param {string} network - Network key
 * @param {Object} transaction - Transaction object
 * @returns {Promise<string>} Call result (hex string)
 */
export async function call(network, transaction) {
  return await rpcCall(network, 'eth_call', [transaction, 'latest']);
}

/**
 * Sends a signed raw transaction
 * @param {string} network - Network key
 * @param {string} signedTx - Signed transaction (hex string)
 * @returns {Promise<string>} Transaction hash
 */
export async function sendRawTransaction(network, signedTx) {
  return await rpcCall(network, 'eth_sendRawTransaction', [signedTx]);
}

/**
 * Gets a transaction receipt
 * @param {string} network - Network key
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction receipt object
 */
export async function getTransactionReceipt(network, txHash) {
  return await rpcCall(network, 'eth_getTransactionReceipt', [txHash]);
}

/**
 * Gets a transaction by hash
 * @param {string} network - Network key
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction object
 */
export async function getTransactionByHash(network, txHash) {
  return await rpcCall(network, 'eth_getTransactionByHash', [txHash]);
}

/**
 * Formats balance from wei to human-readable string
 * @param {string} balanceWei - Balance in wei (hex string)
 * @param {number} decimals - Number of decimals to show (default 4)
 * @returns {string} Formatted balance (e.g., "1.2345")
 */
export function formatBalance(balanceWei, decimals = 4) {
  const balance = ethers.formatEther(balanceWei);
  const num = parseFloat(balance);
  return num.toFixed(decimals);
}

/**
 * Broadcasts a raw signed transaction to ALL configured RPC endpoints for a network
 * This helps ensure transaction propagation across different node pools
 * @param {string} network - Network key
 * @param {string} rawTx - Raw signed transaction hex string
 * @returns {Promise<Object>} Results from each RPC { successes: [], failures: [] }
 */
export async function broadcastToAllRpcs(network, rawTx) {
  const endpoints = await getRpcEndpoints(network);
  const results = {
    successes: [],
    failures: []
  };

  // Broadcast to all endpoints in parallel
  const promises = endpoints.map(async (endpoint) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_sendRawTransaction',
          params: [rawTx],
          id: Date.now()
        })
      });

      const data = await response.json();

      if (data.error) {
        // Some errors are expected (e.g., "already known") - these are actually successes
        const errorMsg = data.error.message || data.error;
        if (errorMsg.includes('already known') || errorMsg.includes('already in pool')) {
          results.successes.push({ endpoint, result: 'already in mempool' });
        } else {
          results.failures.push({ endpoint, error: errorMsg });
        }
      } else if (data.result) {
        results.successes.push({ endpoint, result: data.result });
      } else {
        results.failures.push({ endpoint, error: 'No result returned' });
      }
    } catch (error) {
      results.failures.push({ endpoint, error: error.message });
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Gets the raw transaction data for a pending transaction by hash
 * This can be used to rebroadcast the transaction
 * @param {string} network - Network key
 * @param {string} txHash - Transaction hash
 * @returns {Promise<string|null>} Raw transaction hex or null if not found/not pending
 */
export async function getRawTransaction(network, txHash) {
  try {
    // Try eth_getRawTransactionByHash (not all nodes support this)
    const result = await rpcCall(network, 'eth_getRawTransactionByHash', [txHash]);
    if (result) {
      return result;
    }
  } catch (error) {
    // Method not supported, try alternative approach
    console.warn('eth_getRawTransactionByHash not supported:', error.message);
  }

  return null;
}

