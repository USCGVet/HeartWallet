/**
 * popup/lib/networks.js
 *
 * Network display names, native symbols, and block explorer URL construction.
 *
 * Consolidated from popup.js, which had the network-name map duplicated in both a
 * NETWORK_NAMES constant and a getNetworkName() function with its own copy of the
 * same table.
 */

// Network names for display
export const NETWORK_NAMES = {
  'pulsechainTestnet': 'PulseChain Testnet V4',
  'pulsechain': 'PulseChain Mainnet',
  'ethereum': 'Ethereum Mainnet',
  'sepolia': 'Sepolia Testnet'
};

// Native token symbol per network
export const NETWORK_SYMBOLS = {
  'pulsechain': 'PLS',
  'pulsechainTestnet': 'tPLS',
  'ethereum': 'ETH',
  'sepolia': 'SepoliaETH'
};

export const BLOCK_EXPLORERS = {
  'pulsechainTestnet': {
    base: 'https://scan.v4.testnet.pulsechain.com',
    tx: '/tx/{hash}',
    address: '/address/{address}',
    token: '/token/{address}'
  },
  'pulsechain': {
    base: 'https://scan.mypinata.cloud/ipfs/bafybeienxyoyrhn5tswclvd3gdjy5mtkkwmu37aqtml6onbf7xnb3o22pe/',
    tx: '#/tx/{hash}',
    address: '#/address/{address}',
    token: '#/token/{address}'
  },
  'ethereum': {
    base: 'https://etherscan.io',
    tx: '/tx/{hash}',
    address: '/address/{address}',
    token: '/token/{address}'
  },
  'sepolia': {
    base: 'https://sepolia.etherscan.io',
    tx: '/tx/{hash}',
    address: '/address/{address}',
    token: '/token/{address}'
  }
};

/**
 * Build explorer URL for a specific type
 * @param {string} network - Network key
 * @param {string} type - URL type ('tx', 'address', 'token')
 * @param {string} value - The hash or address value
 * @returns {string} Complete explorer URL, or '' if the network/type is unknown
 */
export function getExplorerUrl(network, type, value) {
  const explorer = BLOCK_EXPLORERS[network];
  if (!explorer) return '';

  const pattern = explorer[type];
  if (!pattern) return '';

  return explorer.base + pattern.replace(`{${type === 'tx' ? 'hash' : 'address'}}`, value);
}

/**
 * Native token symbol for a network, defaulting to ETH for unknown networks.
 * @param {string} network - Network key
 * @returns {string}
 */
export function getNetworkSymbol(network) {
  return NETWORK_SYMBOLS[network] || 'ETH';
}

/**
 * Human-readable network name, falling back to the raw key when unknown.
 * @param {string} network - Network key
 * @returns {string}
 */
export function getNetworkName(network) {
  return NETWORK_NAMES[network] || network;
}
