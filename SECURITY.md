# 🔐 Security Policy & Best Practices

## ⚠️ IMPORTANT DISCLAIMER

**THIS WALLET IS UNAUDITED SOFTWARE. USE AT YOUR OWN RISK.**

- ❌ This wallet has **NOT** been professionally audited by a third-party security firm
- ⚠️ It may contain bugs or vulnerabilities that could lead to loss of funds
- 💰 **DO NOT** store large amounts or life savings in software wallets
- 🔐 For significant holdings, use **Ledger hardware wallet support** (now built-in!)
- 🛡️ Software wallets recommended primarily for testnet, learning, or small daily transactions
- ✅ **Ledger integration** provides maximum security for larger amounts while maintaining full dApp compatibility

**NO LIABILITY:** The authors and contributors accept no responsibility for any losses, damages, or theft of funds. By using this software, you acknowledge and accept all risks.

---

## 🛡️ Security Features

HeartWallet implements multiple layers of security to protect your funds:

### 1. **Future-Proof PBKDF2 Auto-Upgrade System**
- **1,094,000 iterations** in 2025 (increases automatically each year)
- **Auto-upgrade on unlock**: Wallets automatically upgrade to current security standards
- **Prevents future GPU attacks**: Iteration count scales with Moore's Law predictions
- **No user action required**: Upgrades happen transparently when you unlock
- **Minimum floor**: 1.094M iterations enforced even if system clock is manipulated
- **Version tracking**: Each wallet tracks its iteration count for efficiency

**How it works:**
- 2025: 1.094M iterations (current)
- 2026: 1.477M iterations
- 2030: 4.907M iterations
- Maximum: 5M iterations (performance cap)

This ensures your wallet remains secure against future hardware improvements.

### 2. **Ledger Hardware Wallet Support (Maximum Security)**
- **Private keys never leave device**: All signing happens on the Ledger hardware
- **Physical confirmation**: Every transaction requires manual approval on device screen
- **PIN protection**: Device locked with PIN, 3 failed attempts wipes the device
- **Full dApp support**: Use your Ledger with any Web3 dApp through HeartWallet
- **Multi-account**: Import multiple addresses from same Ledger device
- **No password required**: Device security replaces password authentication
- **WebHID integration**: Direct browser communication without additional software
- **Contract data verification**: See transaction details on device before approval
- **Industry standard**: Ledger is the most trusted hardware wallet manufacturer

**Supported Devices:**
- Ledger Nano S Plus (recommended)
- Ledger Nano X
- Ledger Nano S (legacy)

**Security Benefits:**
- 🔐 **Attack resistance**: Even if your computer is compromised, attacker cannot access private keys
- 🛡️ **Malware immunity**: Keyloggers, screen recorders, and trojans cannot steal your keys
- ✅ **Transaction verification**: See exactly what you're signing on the device screen
- 🚫 **Physical security**: Would-be attacker needs physical access + PIN to steal funds
- 💪 **Best practice compliance**: Meets institutional and professional security standards

**This is the MOST SECURE way to use HeartWallet for significant holdings.**

### 3. **AES-256-GCM Double Encryption (Software Wallets)**
- **Storage layer**: Wallets encrypted with PBKDF2 + AES-256-GCM before saving to Chrome storage
- **Session layer**: In-memory encryption using Web Crypto API with non-extractable keys
- **Unique IVs**: Every encryption operation uses cryptographically secure random initialization vectors
- **No plaintext keys**: Private keys never stored or kept in plaintext anywhere

### 4. **Strong Password Requirements (Software Wallets)**
Enforced minimum password strength:
- ✅ Minimum 12 characters (20+ recommended)
- ✅ At least 1 uppercase letter
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character (!@#$%^&*, etc.)

**Example strong passwords:**
```
MyW4ll3t!2024$Secure#Pulse          (Good - 27 chars)
correct-horse-battery-staple-2025!  (Better - 37 chars)
I-Love-PulseChain-369-Forever!      (Better - 30 chars)
```

### 5. **Transaction Security Protections**
- **Gas limit maximum**: 10M gas per transaction (prevents fee scam attacks)
- **Gas price validation**: User-configurable maximum (default 1000 Gwei)
- **eth_sign disabled by default**: Prevents blind signing attacks
- **Transaction validation**: All parameters sanitized and validated
- **Origin validation**: Secure postMessage with specific origins
- **One-time approval tokens**: Each approval can only be used once
- **Clear transaction display**: Shows recipient, amount, gas fees before approval

### 6. **Auto-Lock Timer**
- Automatically locks wallet after inactivity (configurable: 5, 15, 30, or 60 minutes)
- Default: 15 minutes
- Requires password re-entry after lock
- Sessions cleared when service worker terminates
- Protects against unauthorized access if you leave your computer

### 7. **Anti-Brute Force Protection**
- Maximum 5 failed password attempts
- 30-minute lockout period after exceeding limit
- Attempt counter persists across sessions
- Protects against automated password cracking

### 8. **Seed Phrase Verification**
- During wallet creation, you must verify 3 random words from your seed phrase
- Words selected using cryptographically secure random
- Ensures you've actually written down your backup before proceeding
- Reduces risk of losing funds due to missing backup

### 9. **Live Gas Price Tracking**
All transaction signing screens fetch live network gas prices:
- **dApp approvals**: Shows current network conditions
- **Send transactions**: Slow/Normal/Fast options based on live prices
- **Speed up transaction**: Recommends current price + 10% buffer
- **Cancel transaction**: Shows current network price comparison
- Helps users make informed decisions and avoid overpaying

### 10. **RPC Reliability & Failover**
- **Multiple RPC endpoints** per network with automatic failover
- **Health tracking**: Blacklists failing endpoints, auto-recovers when available
- **99%+ uptime**: Continues working even if primary RPC servers fail
- **Transparent failover**: Users experience no interruption

### 11. **XSS & Injection Protection**
- All user input sanitized before display
- Error messages stripped of HTML and scripts
- HTML escaping for all dynamic content
- Protects against code injection through token names, addresses, or error messages

### 12. **Browser Isolation**
- Extension runs in isolated Chrome environment
- Private keys never leave your computer
- DApps cannot directly access your keys
- Content scripts properly isolated from web pages
- Secure message passing architecture

### 13. **Multi-Wallet Management**
- Support for up to 10 wallets
- Each wallet independently encrypted
- Separate iteration count tracking per wallet
- Safe migration from older encryption formats

### 14. **Modern Wallet Detection (EIP-6963)**
- Announces wallet to dApps using modern standard
- Compatible with Web3Modal, WalletConnect, Reown
- Works alongside other wallets (MetaMask, Rabby, etc.)
- Provides wallet metadata for better UX

---

## 📋 Best Practices

### ✅ DO:

1. **Use a Strong, Unique Password**
   - 20+ characters recommended (minimum 12)
   - Use a passphrase: `correct-horse-battery-staple-pulsechain-2025`
   - Never reuse passwords from other services
   - Consider a password manager for generating strong passwords

2. **Backup Your Seed Phrase Properly**
   - Write it down on paper (not digitally)
   - Store in multiple secure locations (safe deposit box, home safe, trusted family member)
   - Never store it on your computer, phone, cloud storage, or email
   - Test your backup by importing it in a test environment
   - Consider metal backup plates for fire/water resistance

3. **Verify Everything Before Confirming**
   - Double-check recipient addresses (check first 6 and last 4 characters)
   - Verify amounts and gas prices
   - Be suspicious of urgency or pressure
   - Send a small test transaction first for large amounts

4. **Keep Software Updated**
   - Update your browser regularly
   - Keep your operating system patched
   - Update HeartWallet when new versions are released
   - Enable automatic updates for OS and browser

5. **Practice Good Computer Hygiene**
   - Use antivirus software and keep it updated
   - Don't download pirated software or visit sketchy websites
   - Be cautious with browser extensions (they can access wallet data)
   - Use a dedicated browser profile for crypto activities

6. **Start Small**
   - Test with testnet funds first (PulseChain Testnet V4)
   - Send small amounts initially
   - Only increase amounts once you're comfortable
   - Never risk more than you can afford to lose

7. **Use Multiple Wallets**
   - Hot wallet (HeartWallet software) for small daily transactions (<$500)
   - Hardware wallet (Ledger via HeartWallet) for significant holdings
   - Never keep all funds in one place
   - Separate wallets for different purposes (trading, holding, etc.)

8. **Use Ledger for Significant Holdings**
   - Connect your Ledger Nano S/X/S Plus to HeartWallet for maximum security
   - Enable "Contract Data" in Ethereum app settings for token transfers
   - Always verify transaction details on Ledger screen before approving
   - Keep Ledger firmware updated
   - Store recovery phrase securely (never enter it anywhere except the device itself)
   - Use PIN protection and never share your PIN

9. **Monitor Your Transactions**
   - Check transaction history regularly
   - Use block explorers to verify confirmations
   - Watch for unexpected transactions
   - Set up alerts for large transactions (using explorer services)

### ❌ DON'T:

1. **Never Share Your Seed Phrase or Private Key**
   - No legitimate service will EVER ask for it
   - Anyone with your seed phrase can steal ALL your funds instantly
   - This includes "support" requests via DM, email, or pop-ups
   - Even the HeartWallet developer (USCG_Vet) will never ask for it

2. **Never Store Seeds Digitally**
   - Don't save in notes apps, password managers, or cloud storage
   - Don't take photos of your seed phrase
   - Don't email it to yourself
   - Don't store in browser autofill
   - Don't text it to anyone

3. **Never Use Weak Passwords**
   - "Password1!" is terrible (even though it meets minimum requirements)
   - "123456789012" is terrible
   - Dictionary words alone are terrible
   - Your birthday, pet name, or common phrases are terrible

4. **Never Click Suspicious Links**
   - Verify URLs manually (check for typos: pulsechainn.com vs pulsechain.com)
   - Bookmark legitimate sites
   - Be wary of Unicode/homograph attacks (рulsechain.com uses Cyrillic 'р')
   - Hover over links to see real destination before clicking

5. **Never Approve Transactions You Don't Understand**
   - If a DApp requests something confusing, reject it
   - Research before approving unlimited token allowances
   - Be especially careful with eth_sign (blind signing)
   - When in doubt, ask for help in community channels

6. **Never Use on Compromised Computers**
   - Public computers / internet cafes: **NEVER**
   - Work computers: **NOT RECOMMENDED**
   - Shared computers: **NOT RECOMMENDED**
   - Computers with pirated software: **NEVER**

7. **Never Enable eth_sign Unless Absolutely Necessary**
   - eth_sign allows blind signing (you can't see what you're signing)
   - Malicious dApps can trick you into signing away all funds
   - Only enable if you understand the risks
   - Disable it immediately after use

8. **Never Approve Transactions on Ledger Without Verification**
   - ALWAYS read transaction details on Ledger screen before approving
   - Verify recipient address matches what you expect
   - Verify amount matches what you intend to send
   - If transaction details look wrong or unclear, REJECT on device
   - Never blindly approve transactions just because HeartWallet requested it

---

## 🎯 Recommended Use Cases

### ✅ Good For (Software Wallets):
- **Testnet development and testing**
- **Learning about Web3 and crypto**
- **Small daily transactions** (<$500)
- **DApp interaction** with small amounts
- **Developer tools and experimentation**
- **Airdrops and NFT minting** (small amounts)

### 🔐 BEST FOR (Ledger Hardware Wallets):
- **Significant holdings** ($2000+) - Maximum security
- **Life savings** - Industry-standard protection
- **Long-term storage** - Cold storage security
- **Active trading** with large amounts - Secure signing
- **Business/company funds** - Professional-grade security
- **Production DApps** with significant value - Verified signing
- **Any amount you cannot afford to lose** - Hardware protection

### ⚠️ Use With Caution (Software Wallets):
- **Moderate amounts** ($500-$2000) you can afford to lose
- **Active trading** (consider Ledger instead)
- **Production DApps** (audit contract first, or use Ledger)
- **New tokens** (be wary of scams)

### ❌ NOT Recommended:
- **Software wallets for life savings** - Use Ledger instead
- **Software wallets for retirement funds** - Use Ledger instead
- **Non-technical family members** - Consider simpler solutions
- **Storing private keys digitally** - Use Ledger for hardware security

---

## 🚨 What To Do If Compromised

If you suspect your wallet has been compromised:

1. **Act Immediately - Seconds Matter**
   - Open wallet and send all funds to a new, secure wallet
   - Do NOT hesitate - attackers can drain funds in seconds
   - Send to a hardware wallet or exchange if possible

2. **Create New Wallet**
   - Generate completely new seed phrase
   - Use different, stronger password
   - Never reuse the compromised wallet
   - Delete old wallet from HeartWallet

3. **Investigate**
   - Run antivirus scan (Malwarebytes recommended)
   - Check browser extensions (remove suspicious ones)
   - Review recent downloads and websites visited
   - Check for keyloggers or screen capture malware
   - Consider reformatting computer if malware suspected

4. **Learn & Share**
   - Identify how compromise occurred
   - Implement better security practices
   - Share learnings with community (anonymously)
   - Help others avoid same mistake

5. **Monitor**
   - Watch the compromised address for activity
   - Track stolen funds on block explorer
   - Report to relevant authorities if significant amount
   - Share attacker address with community warning services

---

## 🐛 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. **DO NOT** discuss publicly before a fix is available
3. **DO** email: **uscg_vet@protonmail.com**
4. Include:
   - Detailed description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)
   - Your PGP key for encrypted communication (optional)

We will:
- Acknowledge receipt within 48 hours
- Work on a fix as priority
- Credit you in release notes (if desired)
- Not disclose until fix is deployed

---

## 📚 Additional Resources

### Security Guides
- **Ethereum Security Best Practices**: https://consensys.github.io/smart-contract-best-practices/
- **Common Crypto Scams**: https://support.metamask.io/hc/en-us/articles/4412217077403
- **Phishing Directory**: https://cryptoscamdb.org/

### PulseChain Resources
- **Official Site**: https://pulsechain.com/
- **Block Explorer**: https://scan.pulsechain.com/
- **Community**: https://t.me/PulsechainCom

### Educational
- **OWASP Password Guidelines**: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- **EIP-1193 Standard**: https://eips.ethereum.org/EIPS/eip-1193
- **EIP-6963 Wallet Detection**: https://eips.ethereum.org/EIPS/eip-6963

---

## ⚖️ License & Warranty

THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**You are solely responsible for:**
- Securing your password and seed phrase
- Verifying transaction details before approval
- Understanding the risks of cryptocurrency
- Any losses that may occur
- Your own due diligence

---

## 🔐 Security Rating

### Software Wallet Mode: **A- (8.5/10)**

**Strengths:**
- ✅ Future-proof PBKDF2 auto-upgrade (1.094M iterations)
- ✅ AES-256-GCM double encryption
- ✅ Gas limit protection (10M max)
- ✅ eth_sign disabled by default
- ✅ Live gas price tracking
- ✅ Transaction validation
- ✅ Auto-lock timer
- ✅ Rate limiting

**Limitations:**
- ⚠️ No professional security audit
- ⚠️ Browser extension environment (less secure than hardware)
- ⚠️ Depends on Chrome security model
- ⚠️ No multi-signature support
- ⚠️ No social recovery

### Hardware Wallet Mode (Ledger): **A+ (9.5/10)**

**Strengths:**
- ✅ **ALL software wallet strengths PLUS:**
- ✅ **Private keys never leave hardware device**
- ✅ **Physical transaction verification on device screen**
- ✅ **PIN protection with auto-wipe after 3 failed attempts**
- ✅ **Malware immunity** (even compromised computer cannot steal keys)
- ✅ **Industry-standard hardware security** (Ledger trusted by millions)
- ✅ **Full dApp support** with hardware-level security
- ✅ **Attack resistance** against keyloggers, screen recorders, trojans
- ✅ **Meets professional/institutional security standards**

**Remaining Limitations:**
- ⚠️ HeartWallet integration code not professionally audited
- ⚠️ No multi-signature support
- ⚠️ Requires WebHID browser support (Chrome/Brave)

**Recommendation:**
- **Software wallets**: Good for small amounts, testing, and learning
- **Ledger integration**: STRONGLY RECOMMENDED for any significant holdings

---

**Remember: In crypto, YOU are the bank. There's no "forgot password" button, no customer service to call, and no way to reverse transactions. Take security seriously.**

🔐 Stay safe, and may your keys be secure!
