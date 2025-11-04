# Adding Default Tokens to HeartWallet

This guide shows you how to add a new default (pre-configured) token to HeartWallet.

## Prerequisites

You need the following information about the token:
- **Contract Address**: The token's smart contract address (e.g., `0x2b591e99afe9f32eaa6214f7b7629768c40eeb39`)
- **Symbol**: Token symbol (e.g., `HEX`, `PLSX`, `INC`)
- **Name**: Full token name (e.g., `HEX`, `PulseX`, `Incentive`)
- **Decimals**: Token decimals (usually 18, but can be 8 or other values)
- **Logo Image**: A logo file (PNG or SVG format)
- **Home URL** (optional): Token's homepage or official website
- **DexScreener URL** (optional): DexScreener chart URL for the token

## Step 1: Add the Logo File

1. Download or obtain the token's logo image
2. Save it to `assets/logos/` with a descriptive name
   - Example: `assets/logos/savant-192.png`
   - Example: `assets/logos/inc.svg`
   - Recommended formats: PNG or SVG
   - SVG is preferred for crisp rendering at any size

## Step 2: Update `src/core/tokens.js`

Add the token to the appropriate network in the `DEFAULT_TOKENS` object:

```javascript
export const DEFAULT_TOKENS = {
  pulsechain: {
    // ... existing tokens ...

    'YOUR_SYMBOL': {
      name: 'Token Name',
      symbol: 'YOUR_SYMBOL',
      address: '0xYourContractAddress',
      decimals: 18,
      logo: 'your-logo.png',  // or .svg
      homeUrl: 'https://yourtoken.io',  // optional
      dexScreenerUrl: 'https://dexscreener.com/pulsechain/0xpooladdress'  // optional
    }
  },
  // ... other networks ...
};
```

**Example:**
```javascript
'Ricky': {
  name: 'Ricky',
  symbol: 'Ricky',
  address: '0x79FC0E1d3EC00d81E5423DcC01A617b0e1245c2B',
  decimals: 18,
  logo: 'ricky.jpg',
  homeUrl: 'https://truthbehindrichardheart.com/',
  dexScreenerUrl: 'https://dexscreener.com/pulsechain/0xbfe5ae40bbca74878419ad7d7e115a30ccfc62f1'
}
```

**Location:** Around line 14-88 in `src/core/tokens.js`

## Step 3: Update `vite.config.js`

Add the logo file to the build copy list so it gets copied to `dist/` during build:

```javascript
// Copy logos folder
mkdirSync('dist/assets/logos', { recursive: true });
copyFileSync('assets/logos/hex.png', 'dist/assets/logos/hex.png');
copyFileSync('assets/logos/pls.png', 'dist/assets/logos/pls.png');
copyFileSync('assets/logos/plsx.png', 'dist/assets/logos/plsx.png');
copyFileSync('assets/logos/heart.png', 'dist/assets/logos/heart.png');
copyFileSync('assets/logos/eth.png', 'dist/assets/logos/eth.png');
copyFileSync('assets/logos/inc.svg', 'dist/assets/logos/inc.svg');
copyFileSync('assets/logos/savant-192.png', 'dist/assets/logos/savant-192.png');
copyFileSync('assets/logos/hexrewards-1000.png', 'dist/assets/logos/hexrewards-1000.png');
copyFileSync('assets/logos/tkr.svg', 'dist/assets/logos/tkr.svg');
copyFileSync('assets/logos/jdai.svg', 'dist/assets/logos/jdai.svg');
copyFileSync('assets/logos/ricky.jpg', 'dist/assets/logos/ricky.jpg');
copyFileSync('assets/logos/your-logo.png', 'dist/assets/logos/your-logo.png');  // ADD THIS
```

**Location:** Around line 47-61 in `vite.config.js`

## Step 4: Update `manifest.json`

Add the logo to the `web_accessible_resources` array so the extension can access it:

```json
"web_accessible_resources": [
  {
    "resources": [
      "inpage.js",
      "assets/logos/hex.png",
      "assets/logos/plsx.png",
      "assets/logos/inc.svg",
      "assets/logos/savant-192.png",
      "assets/logos/hexrewards-1000.png",
      "assets/logos/tkr.svg",
      "assets/logos/jdai.svg",
      "assets/logos/ricky.jpg",
      "assets/logos/pls.png",
      "assets/logos/heart.png",
      "assets/logos/eth.png",
      "assets/logos/your-logo.png"
    ],
    "matches": ["<all_urls>"]
  }
]
```

**Location:** Around line 28-47 in `manifest.json`

## Step 5: Update `src/core/priceOracle.js` (For USD Price Display)

If you want the token to show USD prices, add it to the price oracle configuration:

### Add to PULSEX_PAIRS (line ~18-32)
```javascript
const PULSEX_PAIRS = {
  pulsechain: {
    'PLS_DAI': '0xE56043671df55dE5CDf8459710433C10324DE0aE',
    'HEX_PLS': '0xf1F4ee610b2bAbB05C635F726eF8B0C568c8dc65',
    // ... other pairs ...
    'YOUR_SYMBOL_PLS': '0xYourPulseXPoolAddress'  // ADD THIS
  }
};
```

### Add to TOKEN_ADDRESSES (line ~36-50)
```javascript
const TOKEN_ADDRESSES = {
  pulsechain: {
    WPLS: { address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', decimals: 18 },
    // ... other tokens ...
    YOUR_SYMBOL: { address: '0xYourContractAddress', decimals: 18 }  // ADD THIS
  }
};
```

**Example:**
```javascript
// In PULSEX_PAIRS:
'Ricky_PLS': '0xbfe5ae40bbca74878419ad7d7e115a30ccfc62f1'

// In TOKEN_ADDRESSES:
Ricky: { address: '0x79FC0E1d3EC00d81E5423DcC01A617b0e1245c2B', decimals: 18 }
```

**Notes:**
- The PulseX pool address is the liquidity pair contract, not the token contract
- This enables automatic USD price fetching from PulseX reserves
- If you don't add this, the token will still work but won't show USD values

## Step 6: Rebuild the Extension

Run the build command to compile all changes:

```bash
npm run build
```

This will:
- Copy the new logo to `dist/assets/logos/`
- Compile the updated token configuration
- Update the manifest

## Step 7: Test

1. Load the extension in Chrome (chrome://extensions/)
2. Switch to the network where you added the token (e.g., PulseChain)
3. Go to the Tokens screen
4. Verify the new token appears in the default tokens list
5. Test the features:
   - ✓ Logo displays correctly
   - ✓ Toggle enable/disable works
   - ✓ Balance loads (if you have any)
   - ✓ Copy address button (📋) works
   - ✓ Clicking logo opens homepage (if homeUrl provided)
   - ✓ Clicking name opens DexScreener (if dexScreenerUrl provided)

## Complete Example: Adding Ricky Token

Here's a complete example of all files modified when adding the Ricky token:

### 1. Logo File
Downloaded to: `assets/logos/ricky.jpg`

### 2. `src/core/tokens.js`
```javascript
'Ricky': {
  name: 'Ricky',
  symbol: 'Ricky',
  address: '0x79FC0E1d3EC00d81E5423DcC01A617b0e1245c2B',
  decimals: 18,
  logo: 'ricky.jpg',
  homeUrl: 'https://truthbehindrichardheart.com/',
  dexScreenerUrl: 'https://dexscreener.com/pulsechain/0xbfe5ae40bbca74878419ad7d7e115a30ccfc62f1'
}
```

### 3. `src/core/priceOracle.js`

Add to PULSEX_PAIRS:
```javascript
'Ricky_PLS': '0xbfe5ae40bbca74878419ad7d7e115a30ccfc62f1'
```

Add to TOKEN_ADDRESSES:
```javascript
Ricky: { address: '0x79FC0E1d3EC00d81E5423DcC01A617b0e1245c2B', decimals: 18 }
```

### 4. `vite.config.js`
```javascript
copyFileSync('assets/logos/ricky.jpg', 'dist/assets/logos/ricky.jpg');
```

### 5. `manifest.json`
```json
"assets/logos/ricky.jpg",
```

### 6. Build
```bash
npm run build
```

## Notes

- Default tokens are **enabled by default** when users first install the wallet
- Users can toggle them on/off in the Tokens screen
- The token list supports both default tokens and custom user-added tokens
- Maximum 20 custom tokens per network (no limit on default tokens)
- DexScreener URLs should point to the liquidity pool address, not the token contract
- Logo files can be PNG, JPG, or SVG (SVG recommended for smaller file size and scalability)
- Adding a token to `priceOracle.js` is **optional** but required for USD price display
- All token and pool addresses must be checksummed (proper capitalization) for ethers.js v6

## Finding DexScreener Pool Address

To find the correct DexScreener URL:
1. Go to https://dexscreener.com
2. Search for your token by name or contract address
3. Select the main trading pair (usually paired with PLS, WPLS, or DAI)
4. Copy the URL from the browser - it contains the pool address
5. Example: `https://dexscreener.com/pulsechain/0xd5a8de033c8697ceaa844ca596cc7583c4f8f612`
   - The pool address is: `0xd5a8de033c8697ceaa844ca596cc7583c4f8f612`

## Troubleshooting

**Logo doesn't display:**
- Check that the file exists in `assets/logos/`
- Verify the filename in `tokens.js` matches exactly (case-sensitive)
- Ensure the logo was added to `vite.config.js` and `manifest.json`
- Rebuild the extension (`npm run build`)

**Token doesn't appear:**
- Make sure you're on the correct network
- Check that the token was added to the right network object in `DEFAULT_TOKENS`
- Reload the extension in Chrome

**Balance shows "Error":**
- Verify the contract address is correct (use checksummed address)
- Check that decimals value is correct
- Ensure you're connected to the right network (Testnet vs Mainnet)

**USD price not showing:**
- Check that you added the token to `priceOracle.js` (PULSEX_PAIRS and TOKEN_ADDRESSES)
- Verify the PulseX pool address is correct
- Ensure the pool has sufficient liquidity
- Note: Only PulseChain mainnet tokens show USD prices currently
