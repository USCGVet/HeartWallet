# HeartWallet v2.0


**Developer:** USCG_Vet
**Contact:** uscg_vet@protonmail.com

**Independent cryptocurrency wallet for PulseChain & Ethereum**

HeartWallet is a lightweight, secure Chrome extension wallet built for the PulseChain and Ethereum ecosystems. No gatekeepers, no tracking, just a simple wallet that works.

## ⚠️ IMPORTANT SECURITY NOTICE

**THIS WALLET IS UNAUDITED SOFTWARE. USE AT YOUR OWN RISK.**

- ❌ This wallet has NOT been professionally audited
- ⚠️ DO NOT store large amounts or life savings
- 🔐 For significant holdings, use a hardware wallet
- 📚 Read [SECURITY.md](SECURITY.md) before using

**By using this software, you accept all risks. The authors are not liable for any losses.**

## Features

### ✅ Core Wallet Features
- **Multi-wallet support** - Manage up to 10 wallets with custom nicknames
- **Create new wallet** with 12-word seed phrase
- **Import wallet** from seed phrase or private key
- **Password-protected encryption** using Web3 Secret Storage V3 (Scrypt + AES-128-CTR)
- **Secure Chrome local storage** - encrypted at rest
- **Lock/unlock functionality** with password
- **5 visual themes** (High Contrast, Professional, Amber, CGA, Classic Green)
- **Configurable decimal display** (2, 4, 6, 8, 18)
- **Export seed phrase and private key** (password protected)

### 🔐 Security Features
- **Strong password requirements** - 12+ chars, uppercase, lowercase, number, special character
- **Auto-lock timer** - Automatically locks after configured inactivity period (15 min default)
- **Rate limiting** - 5 failed password attempts = 30 minute lockout
- **Seed phrase verification** - Must verify 3 random words during wallet creation
- **Password prompts** for all sensitive operations

### 🌐 Web3 & DApp Features
- **Full EIP-1193 provider** - Compatible with all Web3 DApps
- **Transaction signing** with gas price control (Slow/Normal/Fast/Custom)
- **Contract interaction** - Call contract functions and send transactions
- **Network switching** - PulseChain, Ethereum, Sepolia, PulseChain Testnet
- **Connection management** - Approve/reject site connections
- **Event support** - accountsChanged, chainChanged
- **Gas estimation** - Automatic gas limit calculation

### 💰 Token Support
- **Native tokens** - PLS, ETH with full send/receive
- **Default tokens** - HEX, PLSX, INC pre-configured for PulseChain
- **Custom tokens** - Add any ERC-20/PRC-20 token by address
- **Token management** - Enable/disable, view balances

## Installation

### Development Install

1. **Clone or navigate to the project**
   ```bash
   cd D:/HeartWallet/
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `.../HeartWallet/dist/` folder

## Development

### Project Structure

```
HeartWallet-v2/
├── src/
│   ├── popup/
│   │   ├── popup.html          # Main UI
│   │   ├── popup.js            # UI controller
│   │   └── terminal.css        # Terminal theme styles
│   ├── core/
│   │   ├── wallet.js           # Wallet operations
│   │   ├── storage.js          # Encrypted storage
│   │   └── validation.js       # Input validation
│   ├── background/
│   │   └── service-worker.js   # Background script
│   └── content/
│       ├── content-script.js   # Content script
│       └── inpage-provider.js  # window.ethereum provider
├── dist/                       # Built extension (generated)
├── manifest.json               # Chrome extension manifest
├── package.json                # Dependencies
└── vite.config.js              # Build configuration
```

### Build Commands

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

### Tech Stack

- **Language**: Vanilla JavaScript (ES6+)
- **Crypto Library**: ethers.js v6
- **Build Tool**: Vite
- **Extension**: Chrome Manifest V3
- **Storage**: Chrome Storage API (encrypted)

## Usage

### First Time Setup

1. Click the HeartWallet icon in your browser
2. Choose "CREATE NEW WALLET" or "IMPORT EXISTING WALLET"
3. If creating:
   - Write down your 12-word seed phrase
   - Create a strong password
   - Check the confirmation box
   - Click "CREATE WALLET"
4. If importing:
   - Enter your 12-word seed phrase or private key
   - Create a password to encrypt the wallet
   - Click "IMPORT WALLET"

### Unlocking Your Wallet

- Enter your password
- Click "UNLOCK"

### Settings

Access settings from the dashboard (⚙ icon):
- **Auto-lock**: Set timeout (5, 15, 30, or 60 minutes)
- **Decimal places**: Choose display precision (2, 4, 6, 8, or 18)
- **Theme**: Select visual theme
- **Show test networks**: Toggle testnet visibility
- **Export seed/key**: View your seed phrase or private key

## Themes

HeartWallet includes 5 unique visual themes:

1. **High Contrast** (Default) - Bright green on black for maximum readability
2. **Professional** - Modern dark blue with sans-serif font
3. **Amber** - Classic amber monitor aesthetic
4. **CGA** - IBM CGA white on blue retro theme
5. **Classic Green** - Dim green terminal theme

## Security

### 🔐 Security Features

HeartWallet implements multiple layers of security:

- ✅ **Strong encryption** - Web3 Secret Storage V3 (Scrypt + AES-128-CTR)
- ✅ **Password requirements** - 12+ chars, mixed case, numbers, special chars
- ✅ **Auto-lock timer** - Locks after inactivity (configurable)
- ✅ **Rate limiting** - 5 attempts max, 30 min lockout
- ✅ **Seed verification** - Must confirm 3 random words on creation
- ✅ **Never transmits private keys** - All operations local
- ✅ **Open source** - Fully auditable code

### 📚 Read the Full Security Guide

**IMPORTANT:** Before using HeartWallet with real funds, please read:

👉 **[SECURITY.md](SECURITY.md)** - Comprehensive security guide including:
- Detailed security features explanation
- Best practices (what to do and NOT do)
- Recommended use cases
- What to do if compromised
- Password examples and tips

### Quick Security Tips

✅ **DO:**
- Use 20+ character passwords
- Write seed phrase on paper, store safely
- Verify all addresses before sending
- Start with testnet/small amounts

❌ **DON'T:**
- Store seed phrases digitally
- Use weak passwords
- Share seed phrase with anyone (NO ONE!)
- Store significant holdings or life savings - use hardware wallet

## Networks Supported

### Mainnet
- **PulseChain** (Chain ID: 369)
- **Ethereum** (Chain ID: 1)

### Testnet
- **PulseChain Testnet V4** (Chain ID: 943)
- **Sepolia** (Chain ID: 11155111)

## Default Tokens

### PulseChain
- HEX
- PLSX (PulseX)
- INC (Incentive)

### Ethereum
- USDT
- USDC

*Token list curated by trusted community member*

## Roadmap

### Phase 2: Transactions (Next)
- Send native tokens (PLS/ETH)
- Gas estimation
- Transaction confirmation UI
- Balance display

### Phase 3: Token Support
- ERC-20/PRC-20 token support
- Add custom tokens
- Token balance display
- Send tokens

### Phase 4: Web3 Integration
- dApp connection
- Transaction requests from dApps
- Message signing (EIP-191, EIP-712)
- Account/chain change events

### Phase 5: Polish
- Transaction history
- Connected sites management
- Enhanced error handling
- Comprehensive testing

## Philosophy

HeartWallet is built on the principle that **trust is personal**.

There's no such thing as "trustless" - you either trust the developer who wrote the code, the maintainer who curates the token list, or the people running the infrastructure. HeartWallet is maintained by a trusted PulseChain community member who values integrity and transparency above all else.

We don't gatekeep networks. We don't track users. We don't inject ads. We just build a wallet that works.

## License

MIT License - See LICENSE file

## Support

**GitHub**: https://github.com/USCGVet/HeartWallet
**Issues**: Report bugs via GitHub Issues
**Telegram**: https://t.me/USCG_Vet_Chat
**X (Twitter)**: https://x.com/uscgvet5555
**Email**: uscg_vet@protonmail.com

## Contributing

This is a community project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Disclaimer

This is alpha software. Use at your own risk. Always test with small amounts first. Never invest more than you can afford to lose. Not financial advice.

---

Built with ♥ for the PulseChain community
