# Test Environment Setup Notes

## Current Status

The comprehensive wallet encryption test suite (`wallet-pbkdf2.test.js`) provides full coverage of:
- Argon2id parameter recommendations and automatic scaling
- Wallet creation/import with current parameters
- Auto-upgrade logic for older wallets
- Export operations (skip upgrade to prevent re-encryption during export)
- Multi-wallet management
- Concurrency control
- Error handling
- Full wallet lifecycle

## Test Environment Configuration

### Crypto API Compatibility

The test environment uses happy-dom with custom crypto function overrides to ensure compatibility between Node.js and ethers.js:

1. **happy-dom environment** configured in `vitest.config.js`
2. **Crypto function overrides** in `tests/setup.js`:
   - `randomBytes.register()` - Returns proper Uint8Array from crypto.getRandomValues
   - `sha256.register()` - Wraps Node.js createHash() with Uint8Array output
   - `sha512.register()` - Wraps Node.js createHash() with Uint8Array output
   - `pbkdf2.register()` - Wraps Node.js pbkdf2Sync() with Uint8Array output
   - `computeHmac.register()` - Wraps Node.js createHmac() with Uint8Array output

This ensures all cryptographic operations return proper Uint8Arrays instead of Buffers, maintaining compatibility with ethers.js in the test environment.

## Running Tests

```bash
# Run all tests
npm test

# Run only wallet encryption tests
npm test -- tests/unit/wallet-pbkdf2.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Test Coverage

### Unit Tests
- `getCurrentRecommendedIterations()` - All milestone years + interpolation
- Wallet creation with current Argon2id parameters
- Wallet import (mnemonic + private key)
- Security info API
- Password validation

### Integration Tests
- Auto-upgrade on unlock (when parameters are outdated)
- Export operations skip upgrade correctly
- Multi-wallet management
- Concurrent unlock attempts (race condition prevention)
- Full lifecycle: create → export → delete → re-import

### Regression Tests
- Backward compatibility with existing wallets
- No upgrade when already current
- Proper error handling for all scenarios
- Wallet limit enforcement
- Duplicate address prevention

## Expected Test Results

```
Argon2id Parameter Recommendations
 ✓ getCurrentRecommendedIterations()
   ✓ should return exact milestone values
   ✓ should cap at maximum parameters
   ✓ should interpolate between milestones
   ✓ should handle years before first milestone
   ✓ should default to current year

Wallet Creation with Current Parameters
 ✓ should create wallet with current recommended parameters
 ✓ should track lastSecurityUpgrade timestamp

Wallet Import with Current Parameters
 ✓ should import from mnemonic with current parameters
 ✓ should import from private key with current parameters

Auto-Upgrade on Unlock
 ✓ should NOT upgrade wallet that already has current parameters
 ✓ should call onUpgradeStart callback when upgrade occurs

Export Operations Skip Upgrade
 ✓ should export private key without triggering upgrade
 ✓ should export mnemonic without triggering upgrade
 ✓ should export mnemonic for specific wallet without upgrade
 ✓ should return null for mnemonic if wallet was imported from private key

Multi-Wallet Management
 ✓ should support multiple wallets with independent parameter tracking
 ✓ should enforce maximum wallet limit of 10
 ✓ should prevent duplicate addresses

Security Information
 ✓ should provide security info for wallet
 ✓ should indicate upgrade needed for old wallets

Password Validation
 ✓ should reject weak passwords
 ✓ should accept strong passwords

Wallet Lifecycle
 ✓ should create, unlock, and delete wallet
 ✓ should switch active wallet
 ✓ should rename wallet
 ✓ should reject empty nickname
 ✓ should reject too long nickname

Error Handling
 ✓ should throw on incorrect password
 ✓ should throw when no wallet exists
 ✓ should throw on invalid mnemonic
 ✓ should throw on invalid private key
 ✓ should throw on wallet not found for rename
 ✓ should throw on wallet not found for delete
 ✓ should throw on wallet not found for security info

Concurrency Control
 ✓ should handle concurrent unlock attempts gracefully

Integration: Create, Import, Export, Delete
 ✓ should complete full wallet lifecycle

Test Files  1 passed (1)
Tests       35 passed (35)
Duration    ~5s
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Run Tests
  run: npm test

- name: Generate Coverage
  run: npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Encryption Architecture

HeartWallet uses a two-layer encryption system:

1. **Argon2id Key Derivation** - Memory-hard algorithm (256 MiB default) resistant to GPU/ASIC attacks
2. **HKDF Key Separation** - Derives cryptographically independent keys for each encryption layer
3. **AES-256-GCM** - Industry-standard authenticated encryption for data at rest

Parameters automatically scale every 3 years through 2040 to maintain security as hardware evolves.

See [SECURITY.md](../../SECURITY.md) for complete encryption architecture documentation.
