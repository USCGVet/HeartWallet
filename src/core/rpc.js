/**
 * core/rpc.js
 *
 * RPC provider for blockchain interaction with automatic failover
 */

import { ethers } from 'ethers';

// Network RPC endpoints - Multiple endpoints per network for redundancy
const RPC_ENDPOINTS = {
  'pulsechainTestnet': [
    'https://rpc.v4.testnet.pulsechain.com',
    'https://rpc-testnet-pulsechain.g4mm4.io'
  ],
  'pulsechain': [
    'https://rpc.pulsechain.com',
    'https://pulsechain-rpc.publicnode.com',
    'https://rpc-pulsechain.g4mm4.io',
    'https://pulsechain.publicnode.com'
  ],
  'ethereum': [
    'https://eth.llamarpc.com',
    'https://ethereum.publicnode.com',
    'https://rpc.ankr.com/eth',
    'https://cloudflare-eth.com'
  ],
  'sepolia': [
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia.publicnode.com',
    'https://rpc.ankr.com/eth_sepolia'
  ]
};

// Cached providers per network
const providers = {};

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
 * Performs a health check on an RPC endpoint
 * @param {string} endpoint - RPC endpoint URL
 * @returns {Promise<boolean>} True if healthy
 */
async function checkEndpointHealth(endpoint) {
  try {
    const provider = new ethers.JsonRpcProvider(endpoint);
    
    // Race the health check against timeout
    const healthCheckPromise = provider.getBlockNumber();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), HEALTH_CONFIG.HEALTH_CHECK_TIMEOUT)
    );
    
    await Promise.race([healthCheckPromise, timeoutPromise]);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets or creates an RPC provider for a network with automatic failover
 * @param {string} network - Network key (e.g., 'pulsechainTestnet')
 * @returns {Promise<ethers.JsonRpcProvider>}
 */
export async function getProvider(network) {
  const endpoints = RPC_ENDPOINTS[network];
  
  if (!endpoints) {
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
 * Gets recent transactions for an address
 * NOTE: This is a placeholder that returns empty array.
 * Scanning blocks via RPC is too expensive (would make 100+ requests).
 * Proper transaction history requires an indexer/block explorer API.
 * @param {string} network - Network key
 * @param {string} address - Ethereum address
 * @param {number} limit - Maximum number of transactions to return (default 3)
 * @param {number} blocksToScan - Number of recent blocks to scan (default 50)
 * @returns {Promise<Array>} Array of transaction objects
 */
export async function getRecentTransactions(network, address, limit = 3, blocksToScan = 50) {
  // Transaction history disabled to avoid excessive RPC calls
  // Would require scanning hundreds/thousands of blocks
  // Users can view transactions on block explorer instead
  return [];

  /* ORIGINAL IMPLEMENTATION - DISABLED DUE TO EXCESSIVE RPC CALLS
  try {
    const provider = getProvider(network);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - blocksToScan);

    const transactions = [];
    const addressLower = address.toLowerCase();

    // This would make blocksToScan RPC requests!
    for (let i = currentBlock; i >= fromBlock && transactions.length < limit; i--) {
      try {
        const block = await provider.getBlock(i, true);
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (transactions.length >= limit) break;
            if (tx.from?.toLowerCase() === addressLower || tx.to?.toLowerCase() === addressLower) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value.toString(),
                blockNumber: tx.blockNumber,
                timestamp: block.timestamp,
                type: tx.from?.toLowerCase() === addressLower ? 'sent' : 'received'
              });
            }
          }
        }
      } catch (blockError) {
        console.error(`Error loading block ${i}:`, blockError);
      }
    }
    return transactions;
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
  */
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

