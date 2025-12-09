# Privacy Policy for HeartWallet

**Effective Date:** November 16, 2025
**Last Updated:** November 16, 2025

## Introduction

HeartWallet is a self-custody cryptocurrency wallet extension for Chrome. Your privacy and security are our top priorities.

## Data Collection

**HeartWallet does NOT collect, transmit, or store any personal data on external servers.**

### What We Do NOT Collect:
- ❌ No personal information (name, email, phone, etc.)
- ❌ No wallet addresses
- ❌ No transaction history
- ❌ No private keys or seed phrases
- ❌ No browsing activity
- ❌ No analytics or tracking data
- ❌ No IP addresses
- ❌ No usage statistics
- ❌ No crash reports

### What is Stored Locally (On Your Device Only):
- ✅ **Encrypted wallet data** - Your wallet is encrypted with your password using Argon2id key derivation (256 MiB memory-hard) with HKDF-based independent keys and AES-256-GCM encryption
- ✅ **User settings** - Theme preference, decimal display, auto-lock timer, etc.
- ✅ **Transaction history** - Stored locally for your convenience
- ✅ **Connected sites** - List of websites you've authorized to connect

**All data is stored exclusively in Chrome's local storage on your device and never transmitted to any server operated by HeartWallet.**

## Third-Party Services

### RPC Providers
HeartWallet connects to blockchain networks via RPC (Remote Procedure Call) endpoints to:
- Query your wallet balance
- Fetch current gas prices
- Broadcast transactions
- Retrieve transaction status

**RPC endpoints used:**
- PulseChain: `rpc.pulsechain.com`, `rpc-pulsechain.g4mm4.io`
- Ethereum: `cloudflare-eth.com`, `rpc.ankr.com/eth`
- Sepolia: `rpc.sepolia.org`, `rpc2.sepolia.org`
- PulseChain Testnet: `rpc.v4.testnet.pulsechain.com`

**What RPC providers may see:**
- Your wallet address (when querying balance or sending transactions)
- Your IP address (standard network connection data)
- Transaction data you broadcast

**We do not control these third-party RPC providers.** Please review their respective privacy policies:
- PulseChain RPC: https://pulsechain.com/
- Cloudflare: https://www.cloudflare.com/privacypolicy/
- Ankr: https://www.ankr.com/privacy-policy/

### Block Explorers
When you click to view a transaction on a block explorer, you are redirected to:
- PulseChain: https://scan.pulsechain.com/
- Ethereum: https://etherscan.io/

These services have their own privacy policies.

## Permissions Explained

HeartWallet requests the following Chrome permissions:

### Required Permissions:
- **`storage`** - To save your encrypted wallet and settings locally on your device
- **`tabs`** - To detect when you're interacting with Web3 sites
- **`scripting`** - To inject the Ethereum provider (`window.ethereum`) into web pages so dApps can detect the wallet

### Optional Permissions:
- **`notifications`** - To show desktop notifications for transaction confirmations and security upgrades (you can disable this in Chrome settings)

**We do NOT request:**
- ❌ Access to your browsing history
- ❌ Access to all websites (only sites you explicitly connect)
- ❌ Access to your downloads or file system
- ❌ Access to your clipboard

## Data Security

### Encryption
- All wallet data is encrypted using **AES-256-GCM** (industry-standard encryption)
- Key derivation uses **Argon2id** with 256 MiB memory requirement (GPU/ASIC-resistant, with automatic parameter scaling through 2040)
- **HKDF-based independent keys** provide two-layer encryption with cryptographically separated key material
- Your password **never leaves your device**
- Private keys are **never stored in plaintext**

### Auto-Lock
- Wallet automatically locks after inactivity (default: 15 minutes)
- Locked wallets require password re-entry

### Rate Limiting
- Maximum 5 failed password attempts, then 30-minute lockout
- Prevents brute-force attacks

## Your Rights

Since HeartWallet stores all data locally on your device:
- ✅ **You own your data** - It's stored exclusively on your computer
- ✅ **You control your data** - Delete the extension to remove all data
- ✅ **No account required** - We don't create accounts or collect registration info
- ✅ **No data sharing** - We have no data to share with third parties

## Children's Privacy

HeartWallet does not knowingly collect data from anyone, including children under 13. Since we don't collect any personal data, COPPA compliance is inherent to our design.

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be posted at:
- GitHub: https://github.com/USCGVet/HeartWallet/blob/main/PRIVACY_POLICY.md

The "Last Updated" date at the top will reflect when changes were made.

## Open Source

HeartWallet is fully open source. You can review the code at:
- **GitHub Repository:** https://github.com/USCGVet/HeartWallet

This allows security researchers and developers to verify our privacy claims.

## Contact

If you have questions about this Privacy Policy, please contact:
- **Email:** uscg_vet@protonmail.com
- **GitHub Issues:** https://github.com/USCGVet/HeartWallet/issues
- **Telegram:** https://t.me/USCG_Vet_Chat
- **X (Twitter):** https://x.com/uscgvet5555

## Disclaimer

**HeartWallet is self-custody software.** You are solely responsible for:
- Securing your password and seed phrase
- Protecting your device from malware
- Verifying transaction details before approval
- Understanding the risks of cryptocurrency

**We cannot recover lost passwords or seed phrases.** If you lose them, your funds are permanently inaccessible.

## Legal

This software is provided "AS IS" without warranty of any kind. See the LICENSE file for full terms.

---

**Summary:** HeartWallet is a privacy-first wallet. We don't collect your data because we believe your financial privacy is a fundamental right. Everything stays on your device, encrypted and secure.

**Your keys, your crypto, your privacy.**
