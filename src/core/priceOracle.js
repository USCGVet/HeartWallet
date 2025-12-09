/**
 * Price Oracle - Fetches token prices from PulseX liquidity pools
 * Uses on-chain reserve data to calculate real-time DEX prices
 * Privacy-preserving: only uses RPC calls, no external APIs
 */

import { ethers } from 'ethers';

// PulseX V2 Pair ABI (only getReserves function)
const PAIR_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)'
];

// Known PulseX V2 pair addresses on PulseChain mainnet
// All addresses are checksummed for ethers.js v6 compatibility
const PULSEX_PAIRS = {
  pulsechain: {
    // PLS/DAI - Price anchor for USD conversion
    'PLS_DAI': '0xE56043671df55dE5CDf8459710433C10324DE0aE', // May not exist, fallback to USDC

    // Major token pairs (all paired with WPLS)
    'HEX_PLS': '0xf1F4ee610b2bAbB05C635F726eF8B0C568c8dc65',
    'PLSX_PLS': '0x1b45b9148791d3a104184Cd5DFE5CE57193a3ee9',
    'INC_PLS': '0xf808Bb6265e9Ca27002c0A04562Bf50d4FE37EAA', // From GeckoTerminal (checksummed)
    'Savant_PLS': '0xaAA8894584aAF0092372f0C753769a50f6060742',
    'HXR_PLS': '0xD5A8de033c8697cEaa844CA596cc7583c4f8F612',
    'TKR_PLS': '0x205C6d44d84E82606E4E921f87b51b71ba85F0f0',
    'JDAI_PLS': '0x70658Ce6D6C09acdE646F6ea9C57Ba64f4Dc350f',
    'Ricky_PLS': '0xbfe5ae40bbca74878419ad7d7e115a30ccfc62f1'
  }
};

// Token addresses and decimals for price routing (all checksummed)
const TOKEN_ADDRESSES = {
  pulsechain: {
    WPLS: { address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', decimals: 18 },
    DAI: { address: '0xefD766cCb38EaF1dfd701853BFCe31359239F305', decimals: 18 },
    HEX: { address: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', decimals: 8 },
    PLSX: { address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', decimals: 18 },
    INC: { address: '0x2FA878Ab3F87CC1C9737Fc071108F904c0B0C95d', decimals: 18 },
    Savant: { address: '0xf16e17e4a01bf99B0A03Fd3Ab697bC87906e1809', decimals: 18 },
    HXR: { address: '0xCfCb89f00576A775d9f81961A37ba7DCf12C7d9B', decimals: 18 },
    TKR: { address: '0xd9e59020089916A8EfA7Dd0B605d55219D72dB7B', decimals: 18 },
    JDAI: { address: '0x1610E75C9b48BF550137820452dE4049bB22bB72', decimals: 18 },
    Ricky: { address: '0x79FC0E1d3EC00d81E5423DcC01A617b0e1245c2B', decimals: 18 }
  }
};

// Price cache (5 minute expiry)
const priceCache = {
  prices: {},
  timestamp: 0,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

/**
 * Get reserves from a PulseX pair contract
 */
async function getPairReserves(provider, pairAddress) {
  try {
    const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const [reserve0, reserve1] = await pairContract.getReserves();
    const token0 = await pairContract.token0();
    const token1 = await pairContract.token1();

    return {
      reserve0: reserve0.toString(),
      reserve1: reserve1.toString(),
      token0: token0.toLowerCase(),
      token1: token1.toLowerCase()
    };
  } catch (error) {
    console.error('Error fetching pair reserves:', pairAddress, error);
    return null;
  }
}

/**
 * Calculate price of token0 in terms of token1 from reserves
 * price = reserve1 / reserve0
 */
function calculatePrice(reserve0, reserve1, decimals0 = 18, decimals1 = 18) {
  const r0 = parseFloat(ethers.formatUnits(reserve0, decimals0));
  const r1 = parseFloat(ethers.formatUnits(reserve1, decimals1));

  if (r0 === 0) return 0;
  return r1 / r0;
}

/**
 * Get PLS price in USD using HEX as intermediary
 * 1. Get HEX/PLS reserves -> HEX price in PLS
 * 2. Use known HEX USD price (~$0.01) to calculate PLS USD price
 */
async function getPLSPrice(provider) {
  try {
    // First try the DAI pair
    const daiPairAddress = PULSEX_PAIRS.pulsechain.PLS_DAI;
    const daiReserves = await getPairReserves(provider, daiPairAddress);

    if (daiReserves) {
      const tokens = TOKEN_ADDRESSES.pulsechain;
      const plsAddress = tokens.WPLS.address.toLowerCase();
      const daiAddress = tokens.DAI.address.toLowerCase();

      let plsReserve, daiReserve;
      if (daiReserves.token0 === plsAddress) {
        plsReserve = daiReserves.reserve0;
        daiReserve = daiReserves.reserve1;
      } else {
        plsReserve = daiReserves.reserve1;
        daiReserve = daiReserves.reserve0;
      }

      const plsPrice = calculatePrice(plsReserve, daiReserve, 18, 18);
      console.log('✓ PLS price from DAI pair:', plsPrice);
      return plsPrice;
    }
  } catch (error) {
    console.warn('Could not fetch PLS/DAI price, trying alternative...', error.message);
  }

  // Fallback: Calculate through HEX
  // Use CoinGecko/CoinMarketCap known HEX price as anchor
  // Or use a hardcoded reasonable estimate
  console.log('Using HEX-based price estimation as fallback');
  
  // Get HEX/PLS reserves
  const hexPairAddress = PULSEX_PAIRS.pulsechain.HEX_PLS;
  const hexReserves = await getPairReserves(provider, hexPairAddress);
  
  if (!hexReserves) {
    console.error('Could not fetch HEX/PLS reserves for price calculation');
    return null;
  }

  const tokens = TOKEN_ADDRESSES.pulsechain;
  const plsAddress = tokens.WPLS.address.toLowerCase();
  const hexAddress = tokens.HEX.address.toLowerCase();

  let plsReserve, hexReserve;
  if (hexReserves.token0 === hexAddress) {
    hexReserve = hexReserves.reserve0;
    plsReserve = hexReserves.reserve1;
  } else {
    hexReserve = hexReserves.reserve1;
    plsReserve = hexReserves.reserve0;
  }

  // Calculate HEX price in PLS
  const hexReserveFormatted = parseFloat(ethers.formatUnits(hexReserve, 8)); // HEX has 8 decimals
  const plsReserveFormatted = parseFloat(ethers.formatUnits(plsReserve, 18));
  const hexPriceInPls = plsReserveFormatted / hexReserveFormatted;

  // Use approximate HEX USD price (update this periodically or fetch from CoinGecko API)
  const hexUsdPrice = 0.01; // Approximate - adjust based on market
  
  // Calculate PLS USD price: if 1 HEX = X PLS, and 1 HEX = $0.01, then 1 PLS = $0.01 / X
  const plsUsdPrice = hexUsdPrice / hexPriceInPls;
  
  // Estimated PLS price via HEX
  
  return plsUsdPrice;
}

/**
 * Get token price in PLS from PulseX pair
 * Returns: How much PLS does 1 token cost
 */
async function getTokenPriceInPLS(provider, pairAddress, tokenAddress, tokenDecimals) {
  const reserves = await getPairReserves(provider, pairAddress);

  if (!reserves) return null;

  const plsAddress = TOKEN_ADDRESSES.pulsechain.WPLS.address.toLowerCase();
  const targetToken = tokenAddress.toLowerCase();

  // Determine which reserve is the token and which is PLS
  let tokenReserve, plsReserve;
  if (reserves.token0 === targetToken) {
    tokenReserve = reserves.reserve0;
    plsReserve = reserves.reserve1;
  } else if (reserves.token1 === targetToken) {
    tokenReserve = reserves.reserve1;
    plsReserve = reserves.reserve0;
  } else {
    console.error('Token not found in pair:', tokenAddress, pairAddress);
    return null;
  }

  // Calculate token price in PLS
  // Price of token in PLS = plsReserve / tokenReserve
  // This gives: How many PLS per 1 token
  const tokenReserveFormatted = parseFloat(ethers.formatUnits(tokenReserve, tokenDecimals));
  const plsReserveFormatted = parseFloat(ethers.formatUnits(plsReserve, 18));

  // Token reserves fetched

  if (tokenReserveFormatted === 0) return 0;

  const tokenPriceInPls = plsReserveFormatted / tokenReserveFormatted;
  // Token price calculated
  return tokenPriceInPls;
}

/**
 * Fetch all token prices in USD
 * Returns: { PLS: price, HEX: price, PLSX: price, INC: price, ... }
 */
export async function fetchTokenPrices(provider, network = 'pulsechain') {
  // Check cache first
  const now = Date.now();
  if (priceCache.prices[network] && (now - priceCache.timestamp) < priceCache.CACHE_DURATION) {
    // Using cached prices
    return priceCache.prices[network];
  }

  // Fetching fresh prices

  try {
    const prices = {};

    // Step 1: Get PLS price in USD
    const plsUsdPrice = await getPLSPrice(provider);
    if (!plsUsdPrice) {
      console.warn('Could not fetch PLS price');
      return null;
    }

    prices.PLS = plsUsdPrice;
    // PLS price fetched

    // Step 2: Get other token prices in PLS, then convert to USD
    const pairs = PULSEX_PAIRS[network];
    const tokens = TOKEN_ADDRESSES[network];

    // HEX price
    const hexPriceInPls = await getTokenPriceInPLS(provider, pairs.HEX_PLS, tokens.HEX.address, tokens.HEX.decimals);
    if (hexPriceInPls) {
      prices.HEX = hexPriceInPls * plsUsdPrice;
      // HEX price calculated
    }

    // PLSX price
    const plsxPriceInPls = await getTokenPriceInPLS(provider, pairs.PLSX_PLS, tokens.PLSX.address, tokens.PLSX.decimals);
    if (plsxPriceInPls) {
      prices.PLSX = plsxPriceInPls * plsUsdPrice;
      // PLSX price calculated
    }

    // INC price
    const incPriceInPls = await getTokenPriceInPLS(provider, pairs.INC_PLS, tokens.INC.address, tokens.INC.decimals);
    if (incPriceInPls) {
      prices.INC = incPriceInPls * plsUsdPrice;
      // INC price calculated
    }

    // Savant price
    const savantPriceInPls = await getTokenPriceInPLS(provider, pairs.Savant_PLS, tokens.Savant.address, tokens.Savant.decimals);
    if (savantPriceInPls) {
      prices.Savant = savantPriceInPls * plsUsdPrice;
      // Savant price calculated
    }

    // HXR price
    const hxrPriceInPls = await getTokenPriceInPLS(provider, pairs.HXR_PLS, tokens.HXR.address, tokens.HXR.decimals);
    if (hxrPriceInPls) {
      prices.HXR = hxrPriceInPls * plsUsdPrice;
      // HXR price calculated
    }

    // TKR price
    const tkrPriceInPls = await getTokenPriceInPLS(provider, pairs.TKR_PLS, tokens.TKR.address, tokens.TKR.decimals);
    if (tkrPriceInPls) {
      prices.TKR = tkrPriceInPls * plsUsdPrice;
      // TKR price calculated
    }

    // JDAI price
    const jdaiPriceInPls = await getTokenPriceInPLS(provider, pairs.JDAI_PLS, tokens.JDAI.address, tokens.JDAI.decimals);
    if (jdaiPriceInPls) {
      prices.JDAI = jdaiPriceInPls * plsUsdPrice;
      // JDAI price calculated
    }

    // Ricky price
    const rickyPriceInPls = await getTokenPriceInPLS(provider, pairs.Ricky_PLS, tokens.Ricky.address, tokens.Ricky.decimals);
    if (rickyPriceInPls) {
      prices.Ricky = rickyPriceInPls * plsUsdPrice;
      // Ricky price calculated
    }

    // Update cache
    priceCache.prices[network] = prices;
    priceCache.timestamp = now;

    return prices;

  } catch (error) {
    console.error('Error fetching token prices:', error);
    return null;
  }
}

/**
 * Get USD value for a token amount
 * @param {string} tokenSymbol - Token symbol (PLS, HEX, PLSX, INC, etc.)
 * @param {string} amount - Token amount as string (in base units)
 * @param {number} decimals - Token decimals
 * @param {object} prices - Price data from fetchTokenPrices()
 */
export function getTokenValueUSD(tokenSymbol, amount, decimals, prices) {
  if (!prices || !prices[tokenSymbol]) {
    return null;
  }

  const tokenAmount = parseFloat(ethers.formatUnits(amount, decimals));
  const tokenPrice = prices[tokenSymbol];

  return tokenAmount * tokenPrice;
}

/**
 * Format USD value for display
 */
export function formatUSD(value) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  } else if (value < 1) {
    return `$${value.toFixed(4)}`;
  } else if (value < 100) {
    return `$${value.toFixed(2)}`;
  } else {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

