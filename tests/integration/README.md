# Integration Tests

Integration tests for HeartWallet using real testnet wallets and transactions on PulseChain Testnet V4.

## Overview

Unlike unit tests which use mocks, these integration tests:
- ✅ Connect to **real PulseChain Testnet V4 RPC**
- ✅ Use **real private keys** from testnetWallet.txt
- ✅ Send **real transactions** on testnet (small amounts only)
- ✅ Test **real token interactions** with ERC-20 contracts
- ✅ Verify **actual blockchain behavior**

## Requirements

### 1. Testnet Funds

The integration tests require the testnet wallets to have:
- **tPLS balance**: At least 0.01 tPLS for transaction tests
- **Test tokens**: Optional, for token transfer tests

**Get testnet tPLS:**
- PulseChain Testnet V4 Faucet: https://faucet.v4.testnet.pulsechain.com/

### 2. Network Access

- Internet connection to access PulseChain Testnet V4 RPC
- RPC endpoints:
  - Primary: `https://rpc.v4.testnet.pulsechain.com`
  - Fallback: `https://pulsechain-testnet-rpc.publicnode.com`

### 3. Test Token Contract (Optional)

For token tests, you need to configure the test Heart Token address:

1. Open `tests/integration/testnet-tokens.test.js`
2. Find line ~27: `const TEST_TOKEN_ADDRESS = '';`
3. Add your test token contract address:
   ```javascript
   const TEST_TOKEN_ADDRESS = '0xYourTestTokenAddressHere';
   ```

If no token address is configured, token tests will be skipped.

## Running Tests

### Run All Tests (Unit + Integration)
```bash
npm test
```

### Run Only Unit Tests (Fast, No Network)
```bash
npm run test:unit
```

### Run Only Integration Tests (Slow, Requires Network)
```bash
npm run test:integration
# or
npm run test:testnet
```

### Run Specific Integration Test File
```bash
npx vitest run tests/integration/testnet-transactions.test.js
npx vitest run tests/integration/testnet-tokens.test.js
```

## Test Files

### `testnet-transactions.test.js`
Tests basic wallet and transaction functionality:
- ✅ Balance queries
- ✅ Transaction signing
- ✅ Message signing (EIP-191)
- ✅ Typed data signing (EIP-712)
- ✅ Real transaction sending (0.0001 tPLS)
- ✅ Gas estimation
- ✅ Nonce management
- ✅ Transaction replacement (speed up)
- ✅ Transaction cancellation
- ✅ Address validation
- ✅ Error handling

### `testnet-tokens.test.js`
Tests ERC-20 token functionality:
- ✅ Token contract info (name, symbol, decimals)
- ✅ Token balance queries
- ✅ Transfer encoding/decoding
- ✅ Approve encoding
- ✅ Allowance queries
- ✅ Gas estimation for token transfers
- ✅ Real token transfers (0.001 tokens)
- ✅ Event parsing
- ✅ Contract code validation

## Expected Results

### All Tests Passing
```
✓ tests/integration/testnet-transactions.test.js (35)
✓ tests/integration/testnet-tokens.test.js (18)

Test Files  2 passed (2)
Tests  53 passed (53)
```

### Some Tests Skipped (Expected)
If wallets have insufficient balance or no token address is configured:
```
⚠️ Wallet 1 balance (0.005 tPLS) is below 0.01 tPLS
Some transaction tests may be skipped

⏭️  Skipped: No token contract configured
```

This is normal and expected.

## Test Wallets

The integration tests use wallets from `testnetWallet.txt`:

**Wallet 1:**
- Address: `0x1D06308A5E8aA43A89b572CAF1b9265Fd4AfEaEb`
- Used for: Sending transactions, token transfers

**Wallet 2:**
- Address: `0x2cDdEb56F899987f4C8de276fABC73b9ae6cAb18`
- Used for: Receiving transactions

**⚠️ SECURITY:**
- These are **TESTNET ONLY** wallets
- **NEVER** use these private keys on mainnet
- **NEVER** send real mainnet funds to these addresses

## Transaction Amounts

All transactions use **tiny amounts** to preserve testnet funds:
- `0.0001 tPLS` - Minimum test transaction
- `0.001 tPLS` - Small test transaction
- `0.001 tokens` - Token transfer amount

## Network Configuration

- **Network**: PulseChain Testnet V4
- **Chain ID**: 943
- **Block Explorer**: https://scan.v4.testnet.pulsechain.com/

View test transactions:
- Wallet 1: https://scan.v4.testnet.pulsechain.com/address/0x1D06308A5E8aA43A89b572CAF1b9265Fd4AfEaEb
- Wallet 2: https://scan.v4.testnet.pulsechain.com/address/0x2cDdEb56F899987f4C8de276fABC73b9ae6cAb18

## Troubleshooting

### "Failed to connect to testnet"
- Check internet connection
- Verify RPC endpoints are accessible
- Try a different RPC endpoint

### "Insufficient balance for transaction test"
- Get more tPLS from faucet: https://faucet.v4.testnet.pulsechain.com/
- Need at least 0.01 tPLS to run all tests

### "No token contract configured"
- This is expected if you haven't set up test tokens
- Token tests will be skipped automatically
- To enable: Add token address to `testnet-tokens.test.js`

### Tests timeout
- Network might be congested
- Increase timeout in test (default 60 seconds)
- Check block explorer to see if transactions confirmed

### RPC errors
- Try alternative RPC endpoint
- Check if testnet is experiencing issues
- Wait a few minutes and retry

## Best Practices

1. **Run unit tests first** - They're fast and don't require network
   ```bash
   npm run test:unit
   ```

2. **Run integration tests periodically** - They're slower but test real behavior
   ```bash
   npm run test:integration
   ```

3. **Check testnet balance** before running integration tests
   ```bash
   # View balance on block explorer
   https://scan.v4.testnet.pulsechain.com/address/0x1D06308A5E8aA43A89b572CAF1b9265Fd4AfEaEb
   ```

4. **Don't spam the network** - Integration tests send real transactions
   - Each test run costs gas
   - Be respectful of testnet resources

5. **Keep testnet wallet funded** - Refill when balance gets low
   - Faucet: https://faucet.v4.testnet.pulsechain.com/

## Adding New Integration Tests

To add new integration tests:

1. Create new test file in `tests/integration/`
2. Import ethers and use real provider:
   ```javascript
   import { ethers } from 'ethers';
   const provider = new ethers.JsonRpcProvider('https://rpc.v4.testnet.pulsechain.com');
   ```

3. Use testnet wallet private keys:
   ```javascript
   const wallet = new ethers.Wallet('0x215b3e18...', provider);
   ```

4. Add cleanup/rollback if needed
5. Use small amounts to preserve testnet funds
6. Add proper timeout for network operations (60s recommended)

## CI/CD Considerations

For continuous integration:
- Integration tests can be run in CI if testnet RPC is accessible
- May want to skip on some CI runs to save time
- Ensure testnet wallets remain funded
- Consider caching RPC responses to reduce load
- Add retry logic for flaky network issues

## Security Notes

- ✅ Safe to commit testnet private keys (these are public test wallets)
- ❌ **NEVER** commit mainnet private keys
- ❌ **NEVER** use testnet keys on mainnet
- ✅ Keep testnetWallet.txt in repo for reproducibility
- ✅ Document which wallets are testnet vs mainnet clearly

---

**Questions or issues?**
- Check existing test output for clues
- View transactions on block explorer
- Contact: uscg_vet@protonmail.com
