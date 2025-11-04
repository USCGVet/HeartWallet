# 🔐 Security Policy & Best Practices

## ⚠️ IMPORTANT DISCLAIMER

**THIS WALLET IS UNAUDITED SOFTWARE. USE AT YOUR OWN RISK.**

- ✅ This wallet has **NOT** been professionally audited by a third-party security firm
- ⚠️ It may contain bugs or vulnerabilities that could lead to loss of funds
- 💰 **DO NOT** store large amounts or life savings
- 🔐 For significant holdings, we **strongly recommend** using a hardware wallet
- 🛡️ We recommend using this wallet primarily for testnet, learning, or small daily transactions

**NO LIABILITY:** The authors and contributors accept no responsibility for any losses, damages, or theft of funds. By using this software, you acknowledge and accept all risks.

---

## 🛡️ Security Features

HeartWallet implements multiple layers of security to protect your funds:

### 1. **Military-Grade Encryption**
- **Triple-layer encryption**: Private keys are encrypted with both ethers.js keystore (Scrypt KDF, 65,536 iterations) AND an additional AES-GCM layer
- **256-bit encryption keys** derived using PBKDF2 with 100,000 iterations
- **Unique initialization vectors** for every encryption operation using cryptographically secure random
- Keys never stored in plaintext - not on disk, not in memory
- Session passwords encrypted in memory using Web Crypto API with non-extractable keys

### 2. **Strong Password Requirements**
Enforced minimum password strength:
- ✅ Minimum 12 characters
- ✅ At least 1 uppercase letter
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character (!@#$%^&*, etc.)

**Example of a strong password:**
```
MyW4ll3t!2024$Secure#Pulse
```

### 3. **Auto-Lock Timer**
- Automatically locks wallet after 15 minutes of inactivity (configurable)
- Requires password re-entry after lock
- Sessions cleared when service worker terminates (by design)
- Protects against unauthorized access if you leave your computer

### 4. **Anti-Brute Force Protection**
- Maximum 5 failed password attempts
- 30-minute lockout period after exceeding limit
- Attempt counter persists across sessions
- Protects against automated password cracking

### 5. **Seed Phrase Verification**
- During wallet creation, you must verify 3 random words from your seed phrase
- Words selected using cryptographically secure random
- Ensures you've actually written down your backup before proceeding
- Reduces risk of losing funds due to missing backup

### 6. **Comprehensive Transaction Security**
- **Input validation**: All transaction parameters validated before processing
- **One-time approval tokens**: Each approval can only be used once (prevents replay attacks)
- **Rate limiting**: Protects against transaction spam from malicious dApps
- **Origin verification**: Uses Chrome's secure sender API (cannot be spoofed)
- **Clear display** of recipient address, amount, and gas fees
- **Password required** for every transaction

### 7. **RPC Reliability & Failover**
- **Multiple RPC endpoints** per network with automatic failover
- **Health tracking**: Blacklists failing endpoints, auto-recovers when available
- **99%+ uptime**: Continues working even if primary RPC servers fail
- **Transparent failover**: Users experience no interruption

### 8. **XSS & Injection Protection**
- All user input sanitized before display
- Error messages stripped of HTML and scripts
- HTML escaping for all dynamic content
- Protects against code injection through token names, addresses, or error messages

### 9. **Browser Isolation**
- Extension runs in isolated Chrome environment
- Private keys never leave your computer
- DApps cannot directly access your keys
- Content scripts properly isolated from web pages
- Secure message passing architecture

### 10. **Multi-Wallet Management**
- Support for up to 10 wallets
- Each wallet independently encrypted
- Separate encryption version tracking for future upgrades
- Safe migration from older formats

---

## 📋 Best Practices

### ✅ DO:

1. **Use a Strong, Unique Password**
   - 20+ characters recommended
   - Use a passphrase: `correct-horse-battery-staple-pulsechain-2024`
   - Never reuse passwords from other services

2. **Backup Your Seed Phrase Properly**
   - Write it down on paper (not digitally)
   - Store in multiple secure locations (safe deposit box, home safe, trusted family member)
   - Never store it on your computer, phone, cloud storage, or email
   - Test your backup by importing it in a test environment

3. **Verify Everything Before Confirming**
   - Double-check recipient addresses
   - Verify amounts and gas prices
   - Be suspicious of urgency or pressure

4. **Keep Software Updated**
   - Update your browser regularly
   - Keep your operating system patched
   - Update HeartWallet when new versions are released

5. **Practice Good Computer Hygiene**
   - Use antivirus software and keep it updated
   - Don't download pirated software or visit sketchy websites
   - Be cautious with browser extensions (they can access wallet data)

6. **Start Small**
   - Test with testnet funds first
   - Send small amounts initially
   - Only increase amounts once you're comfortable

7. **Use Multiple Wallets**
   - Hot wallet (HeartWallet) for small daily transactions
   - Cold wallet (hardware) for long-term storage of significant holdings
   - Never keep all funds in one place

### ❌ DON'T:

1. **Never Share Your Seed Phrase or Private Key**
   - No legitimate service will ever ask for it
   - Anyone with your seed phrase can steal ALL your funds
   - This includes "support" requests via DM, email, or pop-ups

2. **Never Store Seeds Digitally**
   - Don't save in notes apps, password managers, or cloud storage
   - Don't take photos of your seed phrase
   - Don't email it to yourself

3. **Never Use Weak Passwords**
   - "Password1!" is terrible (even though it meets minimum requirements)
   - "123456789012" is terrible
   - Dictionary words alone are terrible

4. **Never Click Suspicious Links**
   - Verify URLs manually (check for typos: pulsechainn.com vs pulsechain.com)
   - Bookmark legitimate sites
   - Be wary of Unicode/homograph attacks (рulsechain.com uses Cyrillic 'р')

5. **Never Approve Transactions You Don't Understand**
   - If a DApp requests something confusing, reject it
   - Research before approving unlimited token allowances
   - When in doubt, ask for help

6. **Never Use on Compromised Computers**
   - Public computers / internet cafes: **NEVER**
   - Work computers: **NOT RECOMMENDED**
   - Shared computers: **NOT RECOMMENDED**

---

## 🎯 Recommended Use Cases

### ✅ Good For:
- **Testnet development and testing**
- **Learning about Web3 and crypto**
- **Small daily transactions**
- **DApp interaction** with small amounts
- **Developer tools and experimentation**

### ⚠️ Use With Caution:
- **Moderate amounts** you can afford to lose
- **Active trading** (use with extra vigilance)
- **Production DApps** (audit first)

### ❌ NOT Recommended For:
- **Life savings or retirement funds**
- **Significant holdings** - use hardware wallet
- **Business/company funds** - use enterprise solutions
- **Non-technical family members** - too complex

---

## 🚨 What To Do If Compromised

If you suspect your wallet has been compromised:

1. **Act Immediately**
   - Open wallet and send all funds to a new, secure wallet
   - Do NOT hesitate - seconds matter

2. **Create New Wallet**
   - Generate completely new seed phrase
   - Use different, stronger password
   - Never reuse the compromised wallet

3. **Investigate**
   - Run antivirus scan
   - Check browser extensions
   - Review recent downloads and websites visited
   - Consider reformatting computer if malware suspected

4. **Learn**
   - Identify how compromise occurred
   - Implement better security practices
   - Share learnings with community (anonymously)

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

We will acknowledge receipt within 48 hours and work on a fix as priority.

---

## 📚 Additional Resources

- **Ethereum Security Best Practices**: https://consensys.github.io/smart-contract-best-practices/
- **Common Crypto Scams**: https://support.metamask.io/hc/en-us/articles/4412217077403
- **Phishing Directory**: https://cryptoscamdb.org/

---

## ⚖️ License & Warranty

THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**You are solely responsible for:**
- Securing your password and seed phrase
- Verifying transaction details before approval
- Understanding the risks of cryptocurrency
- Any losses that may occur

---

**Remember: In crypto, YOU are the bank. There's no "forgot password" button, no customer service to call, and no way to reverse transactions. Take security seriously.**
