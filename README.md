# HeartWallet v2.0.2

**Developer:** USCG_Vet
**Contact:** uscg_vet@protonmail.com

**Independent cryptocurrency wallet for PulseChain & Ethereum**

HeartWallet is a lightweight, secure Chrome extension wallet built for the PulseChain and Ethereum ecosystems. No gatekeepers, no tracking, just a simple wallet that works.

## ⚠️ IMPORTANT SECURITY NOTICE

**THIS WALLET IS UNAUDITED SOFTWARE. USE AT YOUR OWN RISK.**

- ❌ This wallet has NOT been professionally audited
- ⚠️ DO NOT store large amounts or life savings
- 🔐 For significant holdings, use a Ledger hardware wallet (now supported!)
- 📚 Read [SECURITY.md](SECURITY.md) before using

**By using this software, you accept all risks. The authors are not liable for any losses.**

## Features

### ✅ Core Wallet Features
- **Multi-wallet support** - Manage up to 10 wallets with custom nicknames
- **Ledger hardware wallet support** - Connect Ledger Nano S/X/S Plus via WebHID for maximum security
- **Create new wallet** with 12-word seed phrase
- **Import wallet** from seed phrase or private key
- **Future-proof encryption** - Argon2id with HKDF-based independent key derivation and automatic parameter scaling through 2040
- **Secure Chrome local storage** - AES-256-GCM double-encrypted at rest
- **Lock/unlock functionality** with password
- **5 visual themes** (High Contrast, Professional, Amber, CGA, Classic Green)
- **Configurable decimal display** (2, 4, 6, 8, 18)
- **Export seed phrase and private key** (password protected)

### 🔐 Security Features
- **Memory-hard Argon2id encryption** - GPU/ASIC-resistant with automatic parameter scaling (256 MiB in 2025, scaling to 1 GiB by 2037)
- **HKDF-based independent keys** - Cryptographically independent Layer 1 (ethers.js scrypt) and Layer 2 (AES-256-GCM) encryption
- **Automatic security upgrades** - Parameters strengthen every 3 years through 2040 to stay ahead of hardware evolution
- **Strong password requirements** - 20+ chars recommended, mixed case, numbers, special chars
- **Auto-lock timer** - Automatically locks after configured inactivity period (15 min default)
- **Rate limiting** - 5 failed password attempts = 30 minute lockout
- **Seed phrase verification** - Must verify 3 random words during wallet creation
- **Password prompts** for all sensitive operations
- **eth_sign protection** - Disabled by default (prevents blind signing attacks)
- **Gas limit protection** - Maximum 10M gas (prevents fee scam attacks)
- **Transaction validation** - All parameters checked before signing
- **Origin validation** - Secure postMessage with specific origins
- **Connection required for chain access** - Sites you haven't approved cannot read
  chain data through your wallet, so they can't use it as a free RPC proxy or learn
  your RPC endpoint. Only `eth_chainId`, `net_version` and `eth_accounts` are public
  (needed for wallet detection)
- **Untrusted token metadata is sanitized** - A token contract's `name()`/`symbol()`
  are attacker-controlled, so they're stripped of control and bidi characters, length
  bounded, and HTML-escaped before display

### 🌐 Web3 & DApp Features
- **Full EIP-1193 provider** - Compatible with all Web3 DApps
- **EIP-6963 wallet detection** - Works with Web3Modal, WalletConnect, and modern dApps
- **Transaction signing** with live gas price control (Slow/Normal/Fast/Custom)
- **Transaction management** - Speed up or cancel pending transactions
- **Message signing (EIP-191)** - personal_sign and eth_sign support
- **Typed data signing (EIP-712)** - signTypedData v3/v4 for permits and meta-transactions
- **Contract interaction** - Decode contract calls and send transactions
- **Network switching** - PulseChain, Ethereum, Sepolia, PulseChain Testnet
- **Connection management** - Approve/reject site connections, manage connected sites
- **Event support** - accountsChanged, chainChanged, connect, disconnect
- **Gas estimation** - Automatic gas limit calculation with RPC fallback

### 💰 Token & Transaction Features
- **Native tokens** - PLS, ETH with full send/receive
- **Default tokens** - HEX, PLSX, INC, TKR, JDAI pre-configured for PulseChain
- **Custom tokens** - Add any ERC-20/PRC-20 token by address
- **Token management** - Enable/disable, view balances
- **Transaction history** - View all past transactions with status tracking
- **Transaction details** - See decoded contract interactions
- **Explorer integration** - View transactions on block explorers

## Installation

### Development Install

1. **Clone or navigate to the project**
   ```bash
   cd /path/to/HeartWallet
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
   - Select the `dist/` folder

## Development

### Project Structure

```
HeartWallet-v3/
├── src/
│   ├── popup/
│   │   ├── popup.html          # Main UI
│   │   ├── popup.js            # UI controller
│   │   └── terminal.css        # Terminal theme styles
│   ├── core/
│   │   ├── wallet.js           # Wallet operations & Argon2id auto-upgrade
│   │   ├── ledger.js           # Ledger hardware wallet integration
│   │   ├── storage.js          # Encrypted storage
│   │   ├── txValidation.js     # Transaction validation
│   │   └── signing.js          # Message signing
│   ├── background/
│   │   ├── service-worker.js   # Background script
│   │   ├── rpc.js              # RPC provider with failover
│   │   └── txHistory.js        # Transaction tracking
│   └── content/
│       ├── content-script.js   # Content script bridge
│       └── inpage-provider.js  # window.ethereum provider (EIP-1193 + EIP-6963)
├── tests/                      # Unit tests (Vitest)
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

# Run tests
npm test

# Build and test
npm run build && npm test
```

### Tech Stack

- **Language**: Vanilla JavaScript (ES6+)
- **Crypto Library**: ethers.js v6
- **Build Tool**: Vite
- **Testing**: Vitest
- **Extension**: Chrome Manifest V3
- **Storage**: Chrome Storage API (AES-256-GCM encrypted)

## Usage

### First Time Setup

1. Click the HeartWallet icon in your browser
2. Choose "CREATE NEW WALLET", "IMPORT EXISTING WALLET", or "ADD LEDGER"
3. If creating:
   - Write down your 12-word seed phrase (NEVER share this!)
   - Create a strong password (20+ characters recommended)
   - Verify 3 random words from your seed phrase
   - Check the confirmation box
   - Click "CREATE WALLET"
4. If importing:
   - Enter your 12-word seed phrase or private key
   - Create a password to encrypt the wallet
   - Click "IMPORT WALLET"
5. If adding Ledger:
   - Make sure your Ledger device is connected and unlocked
   - Open the Ethereum app on your Ledger
   - Select your Ledger from the browser's device picker
   - Choose which address(es) to import
   - No password needed - your Ledger handles all signing!

### Unlocking Your Wallet

- Enter your password
- Click "UNLOCK"
- Wallet auto-locks after configured inactivity period

### Sending Transactions

1. Click "Send" on the dashboard
2. Enter recipient address
3. Enter amount (or click "Send Max" to send all available balance minus gas)
4. Choose gas speed (Slow/Normal/Fast/Custom)
5. Review transaction details
6. Confirm with password (or approve on Ledger device for hardware wallets)

### Managing Transactions

**Pending transactions can be:**
- **Sped Up** - Increase gas price to confirm faster
- **Cancelled** - Replace with 0-value transaction to yourself

Both options show live network gas prices to help you make informed decisions.

### Gas & Fees

HeartWallet sends **EIP-1559** transactions (type 2) on all networks.

- **The wallet computes the fee, not the dApp.** A `gasPrice` supplied in a dApp's
  `eth_sendTransaction` request is validated and then discarded — the fee actually
  used is derived by the wallet from the network's current base fee. This means a
  dApp cannot talk the wallet into an inflated fee.
- **`maxFeePerGas` is deliberately generous** (`baseFee * 4 + tip`). PulseChain's base
  fee can move several-fold within a minute, and a tight cap gets transactions
  stranded — un-includable once the base fee rises above it. The network only ever
  charges the actual base fee plus the tip, so a high cap costs nothing extra.
- **A dApp's requested gas price is sanity-bounded** at 3x the live network price
  (floor of 100 Gwei). If the RPC is unreachable, the bound falls back to 6x the last
  price observed on that network rather than switching off.
- **Gas limit is capped at 10,000,000** per transaction, which blocks fee-drain scams
  that request an absurd limit. Most transfers need 21k–200k; complex DeFi 200k–1M.

### Hardware Wallet Support

HeartWallet supports **Ledger Nano S, Ledger Nano X, and Ledger Nano S Plus** via WebHID.

**Features:**
- 🔐 **Maximum security** - Private keys never leave your Ledger device
- 📱 **Full dApp support** - Use your Ledger with any Web3 dApp
- 💸 **Send & receive** - Both native tokens (PLS, ETH) and ERC-20/PRC-20 tokens
- 🔄 **Multiple accounts** - Import multiple addresses from the same Ledger
- 🚫 **No passwords** - All signing happens on your device

**Requirements:**
- Chrome/Brave browser (WebHID support required)
- Ledger device with latest firmware
- Ethereum app installed on your Ledger
- **Enable "Contract Data"** in Ethereum app settings for token transfers and dApp interactions

**Note:** When using dApps with Ledger, you'll need to approve each transaction on your device. This is a security feature to prevent unauthorized transactions.

### Settings

Access settings from the dashboard (⚙ icon):
- **Auto-lock**: Set timeout (5, 15, 30, or 60 minutes)
- **Privacy mode**: Require a PIN to view the dashboard (hides balances/addresses)
- **Decimal places**: Choose display precision (2, 4, 6, 8, or 18)
- **Theme**: Select visual theme
- **Show test networks**: Toggle testnet visibility
- **Allow eth_sign**: Enable dangerous blind signing (disabled by default)
- **Enable Ledger / Trezor**: Opt in to hardware wallet support (Trezor not yet implemented)
- **Export seed/key**: View your seed phrase or private key

**Note:** There is no manual "Max Gas Price" setting. The gas price a dApp is allowed
to request is bounded automatically at 3x the current network price (see
[Gas & Fees](#gas--fees) below), so there is no number for you to tune.

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

- ✅ **Memory-hard Argon2id encryption** - GPU/ASIC-resistant with automatic parameter scaling through 2040
- ✅ **HKDF-based independent keys** - Two cryptographically independent encryption layers
- ✅ **AES-256-GCM double encryption** - Session + storage encryption
- ✅ **Strong password requirements** - 12+ chars minimum, 20+ recommended
- ✅ **Auto-lock timer** - Locks after inactivity (configurable)
- ✅ **Rate limiting** - 5 attempts max, 30 min lockout
- ✅ **Seed verification** - Must confirm 3 random words on creation
- ✅ **Gas limit protection** - Maximum 10M gas per transaction
- ✅ **eth_sign protection** - Disabled by default with warnings
- ✅ **Transaction validation** - All parameters sanitized
- ✅ **Never transmits private keys** - All operations local
- ✅ **Open source** - Fully auditable code

### 📚 Read the Full Security Guide

**IMPORTANT:** Before using HeartWallet with real funds, please read:

👉 **[SECURITY.md](SECURITY.md)** - Comprehensive security guide including:
- Detailed security features explanation
- Argon2id encryption architecture and parameter scaling roadmap
- HKDF-based independent key derivation
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
- Keep wallet software updated

❌ **DON'T:**
- Store seed phrases digitally
- Use weak passwords
- Share seed phrase with anyone (NO ONE!)
- Store significant holdings - use hardware wallet
- Enable eth_sign unless absolutely necessary

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
- TKR (Taker)
- JDAI (Gold tracking stablecoin)

### Ethereum
- USDT
- USDC

*Token list curated by trusted community member*

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

See [ADDING_DEFAULT_TOKENS.md](ADDING_DEFAULT_TOKENS.md) for adding new default tokens.

## Disclaimer

This is alpha software. Use at your own risk. Always test with small amounts first. Never invest more than you can afford to lose. Not financial advice.

---

Built with ♥ for the PulseChain community
