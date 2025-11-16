# 🔐 Security Policy & Best Practices

## ⚠️ IMPORTANT DISCLAIMER

**THIS WALLET IS UNAUDITED SOFTWARE. USE AT YOUR OWN RISK.**

- ❌ This wallet has **NOT** been professionally audited by a third-party security firm
- ⚠️ It may contain bugs or vulnerabilities that could lead to loss of funds
- 💰 **DO NOT** store large amounts or life savings
- 🔐 For significant holdings, we **strongly recommend** using a hardware wallet
- 🛡️ We recommend using this wallet primarily for testnet, learning, or small daily transactions

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

### 2. **AES-256-GCM Double Encryption**
- **Storage layer**: Wallets encrypted with PBKDF2 + AES-256-GCM before saving to Chrome storage
- **Session layer**: In-memory encryption using Web Crypto API with non-extractable keys
- **Unique IVs**: Every encryption operation uses cryptographically secure random initialization vectors
- **No plaintext keys**: Private keys never stored or kept in plaintext anywhere

### 3. **Strong Password Requirements**
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

### 4. **Transaction Security Protections**
- **Gas limit maximum**: 10M gas per transaction (prevents fee scam attacks)
- **Gas price validation**: User-configurable maximum (default 1000 Gwei)
- **eth_sign disabled by default**: Prevents blind signing attacks
- **Transaction validation**: All parameters sanitized and validated
- **Origin validation**: Secure postMessage with specific origins
- **One-time approval tokens**: Each approval can only be used once
- **Clear transaction display**: Shows recipient, amount, gas fees before approval

### 5. **Auto-Lock Timer**
- Automatically locks wallet after inactivity (configurable: 5, 15, 30, or 60 minutes)
- Default: 15 minutes
- Requires password re-entry after lock
- Sessions cleared when service worker terminates
- Protects against unauthorized access if you leave your computer

### 6. **Anti-Brute Force Protection**
- Maximum 5 failed password attempts
- 30-minute lockout period after exceeding limit
- Attempt counter persists across sessions
- Protects against automated password cracking

### 7. **Seed Phrase Verification**
- During wallet creation, you must verify 3 random words from your seed phrase
- Words selected using cryptographically secure random
- Ensures you've actually written down your backup before proceeding
- Reduces risk of losing funds due to missing backup

### 8. **Live Gas Price Tracking**
All transaction signing screens fetch live network gas prices:
- **dApp approvals**: Shows current network conditions
- **Send transactions**: Slow/Normal/Fast options based on live prices
- **Speed up transaction**: Recommends current price + 10% buffer
- **Cancel transaction**: Shows current network price comparison
- Helps users make informed decisions and avoid overpaying

### 9. **RPC Reliability & Failover**
- **Multiple RPC endpoints** per network with automatic failover
- **Health tracking**: Blacklists failing endpoints, auto-recovers when available
- **99%+ uptime**: Continues working even if primary RPC servers fail
- **Transparent failover**: Users experience no interruption

### 10. **XSS & Injection Protection**
- All user input sanitized before display
- Error messages stripped of HTML and scripts
- HTML escaping for all dynamic content
- Protects against code injection through token names, addresses, or error messages

### 11. **Browser Isolation**
- Extension runs in isolated Chrome environment
- Private keys never leave your computer
- DApps cannot directly access your keys
- Content scripts properly isolated from web pages
- Secure message passing architecture

### 12. **Multi-Wallet Management**
- Support for up to 10 wallets
- Each wallet independently encrypted
- Separate iteration count tracking per wallet
- Safe migration from older encryption formats

### 13. **Modern Wallet Detection (EIP-6963)**
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
   - Hot wallet (HeartWallet) for small daily transactions (<$500)
   - Cold wallet (hardware) for long-term storage of significant holdings
   - Never keep all funds in one place
   - Separate wallets for different purposes (trading, holding, etc.)

8. **Monitor Your Transactions**
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

---

## 🎯 Recommended Use Cases

### ✅ Good For:
- **Testnet development and testing**
- **Learning about Web3 and crypto**
- **Small daily transactions** (<$500)
- **DApp interaction** with small amounts
- **Developer tools and experimentation**
- **Airdrops and NFT minting** (small amounts)

### ⚠️ Use With Caution:
- **Moderate amounts** ($500-$2000) you can afford to lose
- **Active trading** (use with extra vigilance)
- **Production DApps** (audit contract first)
- **New tokens** (be wary of scams)

### ❌ NOT Recommended For:
- **Life savings or retirement funds** - use hardware wallet
- **Significant holdings** (>$2000) - use hardware wallet
- **Business/company funds** - use enterprise solutions
- **Non-technical family members** - too complex
- **Long-term cold storage** - use hardware wallet

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

**Self-Assessment: A (9/10)**

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

**For production use with significant funds, we recommend a professional audit.**

---

**Remember: In crypto, YOU are the bank. There's no "forgot password" button, no customer service to call, and no way to reverse transactions. Take security seriously.**

🔐 Stay safe, and may your keys be secure!
