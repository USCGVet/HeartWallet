/**
 * core/tokens.js
 *
 * Token management and storage
 */

import { load, save } from './storage.js';
import { getTokenMetadata, validateTokenContract } from './erc20.js';

// Maximum custom tokens per network
const MAX_TOKENS_PER_NETWORK = 20;

// Default/preset tokens (can be easily added/removed by user)
export const DEFAULT_TOKENS = {
  pulsechain: {
    'HEX': {
      name: 'HEX',
      symbol: 'HEX',
      address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
      decimals: 8,
      logo: 'hex.png',
      homeUrl: 'https://hex.com',
      dexScreenerUrl: 'https://dexscreener.com/pulsechain/0xf1f4ee610b2babb05c635f726ef8b0c568c8dc65'
    },
    'PLSX': {
      name: 'PulseX',
      symbol: 'PLSX',
      address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
      decimals: 18,
      logo: 'plsx.png',
      homeUrl: 'https://pulsex.com',
      dexScreenerUrl: 'https://dexscreener.com/pulsechain/0x1b45b9148791d3a104184cd5dfe5ce57193a3ee9'
    },
    'INC': {
      name: 'Incentive',
      symbol: 'INC',
      address: '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d',
      decimals: 18,
      logo: 'inc.svg',
      homeUrl: 'https://incentivetoken.io',
      dexScreenerUrl: 'https://dexscreener.com/pulsechain/0xf808bb6265e9ca27002c0a04562bf50d4fe37eaa'
    },
    'Savant': {
      name: 'Savant',
      symbol: 'Savant',
      address: '0xf16e17e4a01bf99B0A03Fd3Ab697bC87906e1809',
      decimals: 18,
      logo: 'savant-192.png',
      homeUrl: 'https://uscgvet.github.io/Savant/trade.html',
      dexScreenerUrl: 'https://dexscreener.com/pulsechain/0xaaa8894584aaf0092372f0c753769a50f6060742'
    },
    'HXR': {
      name: 'HexRewards',
      symbol: 'HXR',
      address: '0xCfCb89f00576A775d9f81961A37ba7DCf12C7d9B',
      decimals: 18,
      logo: 'hexrewards-1000.png',
      homeUrl: 'https://uscgvet.github.io/HexRewards/',
      dexScreenerUrl: 'https://dexscreener.com/pulsechain/0xd5a8de033c8697ceaa844ca596cc7583c4f8f612'
    },
    'TKR': {
      name: 'Taker',
      symbol: 'TKR',
      address: '0xd9e59020089916A8EfA7Dd0B605d55219D72dB7B',
      decimals: 18,
      logo: 'tkr.svg',
      homeUrl: 'https://uscgvet.github.io/jdai-dapp/',
      dexScreenerUrl: 'https://dexscreener.com/pulsechain/0x205c6d44d84e82606e4e921f87b51b71ba85f0f0'
    },
    'JDAI': {
      name: 'JDAI Unstablecoin',
      symbol: 'JDAI',
      address: '0x1610E75C9b48BF550137820452dE4049bB22bB72',
      decimals: 18,
      logo: 'jdai.svg',
      homeUrl: 'https://uscgvet.github.io/jdai-dapp/',
      dexScreenerUrl: 'https://dexscreener.com/pulsechain/0x70658Ce6D6C09acdE646F6ea9C57Ba64f4Dc350f'
    },
    'Ricky': {
      name: 'Ricky',
      symbol: 'Ricky',
      address: '0x79FC0E1d3EC00d81E5423DcC01A617b0e1245c2B',
      decimals: 18,
      logo: 'ricky.jpg',
      homeUrl: 'https://truthbehindrichardheart.com/',
      dexScreenerUrl: 'https://dexscreener.com/pulsechain/0xbfe5ae40bbca74878419ad7d7e115a30ccfc62f1'
    }
  },
  pulsechainTestnet: {
    'HEART': {
      name: 'HeartToken',
      symbol: 'HEART',
      address: '0x735742D8e5Fa35c165deeed4560Dd91A15BA1aB2',
      decimals: 18,
      logo: 'heart.png'
    }
  },
  ethereum: {},
  sepolia: {}
};

/**
 * Gets storage key for custom tokens
 * @param {string} network - Network key
 * @returns {string}
 */
function getStorageKey(network) {
  return `custom_tokens_${network}`;
}

/**
 * Gets storage key for enabled default tokens
 * @param {string} network - Network key
 * @returns {string}
 */
function getDefaultTokensKey(network) {
  return `enabled_default_tokens_${network}`;
}

/**
 * Gets all custom tokens for a network
 * @param {string} network - Network key
 * @returns {Promise<Array>}
 */
export async function getCustomTokens(network) {
  const key = getStorageKey(network);
  const tokens = await load(key);
  return tokens || [];
}

/**
 * Gets enabled default tokens for a network
 * @param {string} network - Network key
 * @returns {Promise<Array<string>>} Array of enabled default token symbols
 */
export async function getEnabledDefaultTokens(network) {
  const key = getDefaultTokensKey(network);
  const enabled = await load(key);
  // If nothing stored, all defaults are enabled
  if (!enabled) {
    return Object.keys(DEFAULT_TOKENS[network] || {});
  }
  return enabled;
}

/**
 * Gets all tokens (default + custom) for a network
 * @param {string} network - Network key
 * @returns {Promise<Array>}
 */
export async function getAllTokens(network) {
  const customTokens = await getCustomTokens(network);
  const enabledDefaults = await getEnabledDefaultTokens(network);

  const defaultTokens = [];
  const networkDefaults = DEFAULT_TOKENS[network] || {};

  for (const symbol of enabledDefaults) {
    if (networkDefaults[symbol]) {
      defaultTokens.push({
        ...networkDefaults[symbol],
        isDefault: true
      });
    }
  }

  return [...defaultTokens, ...customTokens];
}

/**
 * Adds a custom token
 * @param {string} network - Network key
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<Object>} Added token object
 * @throws {Error} If token limit reached, invalid address, or already exists
 */
export async function addCustomToken(network, tokenAddress) {
  // Validate address format
  tokenAddress = tokenAddress.trim();
  if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
    throw new Error('Invalid token address format');
  }

  // Check if it's a default token
  const networkDefaults = DEFAULT_TOKENS[network] || {};
  for (const symbol in networkDefaults) {
    if (networkDefaults[symbol].address.toLowerCase() === tokenAddress.toLowerCase()) {
      throw new Error(`This is a default token (${symbol}). Use the default tokens list instead.`);
    }
  }

  // Get current custom tokens
  const customTokens = await getCustomTokens(network);

  // Check limit
  if (customTokens.length >= MAX_TOKENS_PER_NETWORK) {
    throw new Error(`Maximum ${MAX_TOKENS_PER_NETWORK} custom tokens per network`);
  }

  // Check if already exists
  const exists = customTokens.find(
    t => t.address.toLowerCase() === tokenAddress.toLowerCase()
  );
  if (exists) {
    throw new Error('Token already added');
  }

  // Validate contract and fetch metadata
  const isValid = await validateTokenContract(network, tokenAddress);
  if (!isValid) {
    throw new Error('Invalid ERC-20 token contract');
  }

  const metadata = await getTokenMetadata(network, tokenAddress);

  // Create token entry
  const token = {
    address: tokenAddress,
    name: metadata.name,
    symbol: metadata.symbol,
    decimals: metadata.decimals,
    logo: null,
    isDefault: false,
    addedAt: Date.now()
  };

  // Add to list
  customTokens.push(token);

  // Save
  const key = getStorageKey(network);
  await save(key, customTokens);

  return token;
}

/**
 * Removes a custom token
 * @param {string} network - Network key
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<void>}
 */
export async function removeCustomToken(network, tokenAddress) {
  const customTokens = await getCustomTokens(network);

  const filtered = customTokens.filter(
    t => t.address.toLowerCase() !== tokenAddress.toLowerCase()
  );

  const key = getStorageKey(network);
  await save(key, filtered);
}

/**
 * Toggles a default token on/off
 * @param {string} network - Network key
 * @param {string} symbol - Token symbol
 * @param {boolean} enabled - Enable or disable
 * @returns {Promise<void>}
 */
export async function toggleDefaultToken(network, symbol, enabled) {
  const enabledTokens = await getEnabledDefaultTokens(network);

  let updated;
  if (enabled) {
    // Add if not already in list
    if (!enabledTokens.includes(symbol)) {
      updated = [...enabledTokens, symbol];
    } else {
      return; // Already enabled
    }
  } else {
    // Remove from list
    updated = enabledTokens.filter(s => s !== symbol);
  }

  const key = getDefaultTokensKey(network);
  await save(key, updated);
}

/**
 * Checks if a default token is enabled
 * @param {string} network - Network key
 * @param {string} symbol - Token symbol
 * @returns {Promise<boolean>}
 */
export async function isDefaultTokenEnabled(network, symbol) {
  const enabled = await getEnabledDefaultTokens(network);
  return enabled.includes(symbol);
}
