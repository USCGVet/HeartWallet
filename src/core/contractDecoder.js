/**
 * Contract Decoder Service
 * Multi-layer ABI fetching and transaction decoding
 *
 * Fallback chain:
 * 1. Local cache (instant)
 * 2. PulseScan API (verified contracts)
 * 3. Sourcify full match (decentralized verification)
 * 4. Sourcify partial match (similar contracts)
 * 5. 4byte directory (function signatures only)
 */

import { ethers } from 'ethers';

// Cache configuration
const ABI_CACHE_KEY_PREFIX = 'abi_cache_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_ENTRIES = 100; // Maximum number of cached ABIs (LRU eviction)

// Common function signatures for instant recognition
const COMMON_FUNCTIONS = {
  '0x095ea7b3': { name: 'approve', description: 'Approve token spending', category: 'token' },
  '0xa9059cbb': { name: 'transfer', description: 'Transfer tokens', category: 'token' },
  '0x23b872dd': { name: 'transferFrom', description: 'Transfer tokens from address', category: 'token' },
  '0x38ed1739': { name: 'swapExactTokensForTokens', description: 'Swap exact tokens for tokens', category: 'dex' },
  '0x7ff36ab5': { name: 'swapExactETHForTokens', description: 'Swap exact ETH for tokens', category: 'dex' },
  '0x18cbafe5': { name: 'swapExactTokensForETH', description: 'Swap exact tokens for ETH', category: 'dex' },
  '0xfb3bdb41': { name: 'swapETHForExactTokens', description: 'Swap ETH for exact tokens', category: 'dex' },
  '0x8803dbee': { name: 'swapTokensForExactTokens', description: 'Swap tokens for exact tokens', category: 'dex' },
  '0x40c10f19': { name: 'mint', description: 'Mint tokens', category: 'token' },
  '0x42966c68': { name: 'burn', description: 'Burn tokens', category: 'token' },
  '0xa694fc3a': { name: 'stake', description: 'Stake tokens', category: 'defi' },
  '0x2e1a7d4d': { name: 'withdraw', description: 'Withdraw tokens', category: 'defi' },
  '0xb6b55f25': { name: 'deposit', description: 'Deposit tokens', category: 'defi' },
  '0x3ccfd60b': { name: 'withdraw', description: 'Withdraw', category: 'defi' }
};

// Block explorer URLs by chain
const EXPLORER_URLS = {
  369: 'https://scan.mypinata.cloud/ipfs/bafybeienxyoyrhn5tswclvd3gdjy5mtkkwmu37aqtml6onbf7xnb3o22pe',
  943: 'https://scan.v4.testnet.pulsechain.com',
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io'
};

/**
 * Get ABI from local cache (updates lastAccessed for LRU tracking)
 */
function getCachedABI(address, chainId) {
  try {
    const key = `${ABI_CACHE_KEY_PREFIX}${chainId}_${address.toLowerCase()}`;
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const data = JSON.parse(cached);

    // Check if cache is still valid
    if (Date.now() - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }

    // Update lastAccessed timestamp for LRU tracking
    data.lastAccessed = Date.now();
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // Ignore write errors for lastAccessed update
    }

    return data.abi;
  } catch (error) {
    console.error('Error reading ABI cache:', error);
    return null;
  }
}

/**
 * Get all ABI cache entries with their metadata
 * @returns {Array<{key: string, timestamp: number, lastAccessed: number}>}
 */
function getAllCacheEntries() {
  const entries = [];
  const keys = Object.keys(localStorage);

  for (const key of keys) {
    if (key.startsWith(ABI_CACHE_KEY_PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        entries.push({
          key,
          timestamp: data.timestamp || 0,
          lastAccessed: data.lastAccessed || data.timestamp || 0
        });
      } catch (e) {
        // Invalid entry, mark for cleanup
        entries.push({ key, timestamp: 0, lastAccessed: 0 });
      }
    }
  }

  return entries;
}

/**
 * Enforce LRU cache limit by removing oldest accessed entries
 */
function enforceCacheLimit() {
  const entries = getAllCacheEntries();

  if (entries.length <= MAX_CACHE_ENTRIES) {
    return; // Under limit, no eviction needed
  }

  // Sort by lastAccessed (oldest first)
  entries.sort((a, b) => a.lastAccessed - b.lastAccessed);

  // Remove oldest entries until we're under the limit
  const toRemove = entries.length - MAX_CACHE_ENTRIES;
  for (let i = 0; i < toRemove; i++) {
    localStorage.removeItem(entries[i].key);
    console.log(`🫀 LRU evicted ABI cache: ${entries[i].key}`);
  }
}

/**
 * Clean up expired cache entries
 * Should be called periodically to prevent unbounded growth
 */
export function cleanupExpiredCache() {
  const entries = getAllCacheEntries();
  const now = Date.now();
  let cleaned = 0;

  for (const entry of entries) {
    if (now - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(entry.key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🫀 Cleaned ${cleaned} expired ABI cache entries`);
  }

  return cleaned;
}

/**
 * Save ABI to local cache with LRU eviction
 */
function cacheABI(address, chainId, abi, source) {
  try {
    // Enforce cache limit before adding new entry
    enforceCacheLimit();

    const key = `${ABI_CACHE_KEY_PREFIX}${chainId}_${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify({
      abi,
      source,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    }));
  } catch (error) {
    // Handle quota exceeded error by cleaning cache
    if (error.name === 'QuotaExceededError') {
      console.warn('🫀 localStorage quota exceeded, cleaning cache...');
      cleanupExpiredCache();
      enforceCacheLimit();
      // Retry once after cleanup
      try {
        const key = `${ABI_CACHE_KEY_PREFIX}${chainId}_${address.toLowerCase()}`;
        localStorage.setItem(key, JSON.stringify({
          abi,
          source,
          timestamp: Date.now(),
          lastAccessed: Date.now()
        }));
      } catch (retryError) {
        console.error('Error caching ABI after cleanup:', retryError);
      }
    } else {
      console.error('Error caching ABI:', error);
    }
  }
}

/**
 * Fetch ABI from PulseScan (BlockScout)
 */
async function fetchFromPulseScan(address, chainId) {
  try {
    const baseUrl = chainId === 369
      ? 'https://api.scan.pulsechain.com'
      : chainId === 943
      ? 'https://scan.v4.testnet.pulsechain.com'
      : null;

    if (!baseUrl) return null;

    const url = `${baseUrl}/api?module=contract&action=getabi&address=${address}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1" && data.result && data.result !== "Contract source code not verified") {
      return {
        abi: JSON.parse(data.result),
        source: 'pulsescan',
        verified: true
      };
    }

    return null;
  } catch (error) {
    console.error('PulseScan fetch error:', error);
    return null;
  }
}

/**
 * Fetch ABI from Sourcify
 */
async function fetchFromSourcify(address, chainId, matchType = 'full_match') {
  try {
    const url = `https://repo.sourcify.dev/contracts/${matchType}/${chainId}/${address}/metadata.json`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const metadata = await response.json();

    if (metadata.output && metadata.output.abi) {
      return {
        abi: metadata.output.abi,
        source: `sourcify_${matchType}`,
        verified: true
      };
    }

    return null;
  } catch (error) {
    console.error(`Sourcify ${matchType} fetch error:`, error);
    return null;
  }
}

/**
 * Fetch function signature from 4byte directory
 */
async function fetch4byteSignature(selector) {
  try {
    const url = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${selector}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].text_signature;
    }

    return null;
  } catch (error) {
    console.error('4byte fetch error:', error);
    return null;
  }
}

/**
 * Get contract ABI with multi-layer fallback
 */
export async function getContractABI(address, chainId = 369) {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  // Layer 1: Check cache
  const cached = getCachedABI(address, chainId);
  if (cached) {
    console.log('🫀 ABI loaded from cache');
    return { abi: cached, source: 'cache', verified: true };
  }

  console.log('🫀 Fetching ABI for', address);

  // Layer 2: Try PulseScan
  const pulseScanResult = await fetchFromPulseScan(address, chainId);
  if (pulseScanResult) {
    console.log('🫀 ABI found on PulseScan');
    cacheABI(address, chainId, pulseScanResult.abi, pulseScanResult.source);
    return pulseScanResult;
  }

  // Layer 3: Try Sourcify full match
  const sourcifyFullResult = await fetchFromSourcify(address, chainId, 'full_match');
  if (sourcifyFullResult) {
    console.log('🫀 ABI found on Sourcify (full match)');
    cacheABI(address, chainId, sourcifyFullResult.abi, sourcifyFullResult.source);
    return sourcifyFullResult;
  }

  // Layer 4: Try Sourcify partial match
  const sourcifyPartialResult = await fetchFromSourcify(address, chainId, 'partial_match');
  if (sourcifyPartialResult) {
    console.log('🫀 ABI found on Sourcify (partial match)');
    cacheABI(address, chainId, sourcifyPartialResult.abi, sourcifyPartialResult.source);
    return sourcifyPartialResult;
  }

  console.log('🫀 No ABI found for contract');
  return null;
}

/**
 * Decode transaction data
 */
export async function decodeTransaction(txRequest, chainId = 369) {
  const address = txRequest.to;
  const data = txRequest.data;

  // Simple ETH transfer (no data)
  if (!data || data === '0x' || data.length <= 2) {
    return {
      type: 'transfer',
      description: 'Simple Transfer',
      method: null,
      params: [],
      contract: null,
      explorerUrl: getExplorerUrl(chainId, address)
    };
  }

  const functionSelector = data.slice(0, 10);

  // Check common functions first (instant recognition)
  const commonFunc = COMMON_FUNCTIONS[functionSelector];
  if (commonFunc) {
    console.log('🫀 Recognized common function:', commonFunc.name);
  }

  // Try to get full ABI
  const abiResult = await getContractABI(address, chainId);

  if (abiResult && abiResult.abi) {
    // Full decode with ABI
    try {
      const contract = new ethers.Interface(abiResult.abi);
      const decoded = contract.parseTransaction({ data });

      return {
        type: 'contract_call',
        description: commonFunc ? commonFunc.description : 'Contract Interaction',
        method: decoded.name,
        signature: decoded.signature,
        params: formatParameters(decoded.fragment, decoded.args),
        contract: {
          address,
          verified: abiResult.verified,
          source: abiResult.source
        },
        explorerUrl: getExplorerUrl(chainId, address),
        category: commonFunc ? commonFunc.category : 'contract'
      };
    } catch (error) {
      console.error('Error decoding with ABI:', error);
    }
  }

  // Fallback to function signature lookup
  let functionSignature = null;
  if (commonFunc) {
    functionSignature = commonFunc.name;
  } else {
    functionSignature = await fetch4byteSignature(functionSelector);
  }

  if (functionSignature) {
    return {
      type: 'signature_match',
      description: commonFunc ? commonFunc.description : 'Contract Call',
      method: functionSignature,
      signature: functionSignature,
      params: [],
      contract: {
        address,
        verified: false,
        source: 'signature_only'
      },
      explorerUrl: getExplorerUrl(chainId, address),
      rawData: data,
      category: commonFunc ? commonFunc.category : 'unknown'
    };
  }

  // Last resort - unknown
  return {
    type: 'unknown',
    description: 'Unknown Contract Call',
    method: 'Unknown',
    signature: null,
    params: [],
    contract: {
      address,
      verified: false,
      source: 'unknown'
    },
    explorerUrl: getExplorerUrl(chainId, address),
    rawData: data,
    functionSelector
  };
}

/**
 * Format parameters for display
 */
function formatParameters(fragment, args) {
  const params = [];

  for (let i = 0; i < fragment.inputs.length; i++) {
    const input = fragment.inputs[i];
    const value = args[i];

    params.push({
      name: input.name || `param${i}`,
      type: input.type,
      value: formatValue(value, input.type)
    });
  }

  return params;
}

/**
 * Format value based on type
 */
function formatValue(value, type) {
  try {
    if (type.includes('[]')) {
      // Array type
      if (Array.isArray(value)) {
        return value.map(v => formatValue(v, type.replace('[]', '')));
      }
    }

    if (type.startsWith('uint') || type.startsWith('int')) {
      // Number type
      return value.toString();
    }

    if (type === 'address') {
      // Address type
      return value;
    }

    if (type === 'bool') {
      // Boolean type
      return value ? 'true' : 'false';
    }

    if (type === 'bytes' || type.startsWith('bytes')) {
      // Bytes type
      if (typeof value === 'string') {
        return value.length > 66 ? value.slice(0, 66) + '...' : value;
      }
    }

    // Default: convert to string
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return String(value);
  } catch (error) {
    console.error('Error formatting value:', error);
    return String(value);
  }
}

/**
 * Get block explorer URL
 */
function getExplorerUrl(chainId, address) {
  const baseUrl = EXPLORER_URLS[chainId] || EXPLORER_URLS[369];

  // PulseChain uses hash-based routing with IPFS explorer
  if (chainId === 369) {
    return `${baseUrl}/#/address/${address}?tab=contract`;
  }

  // Other chains use standard path-based routing
  return `${baseUrl}/address/${address}`;
}

