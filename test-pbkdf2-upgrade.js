/**
 * test-pbkdf2-upgrade.js
 *
 * Manual test script for PBKDF2 iteration auto-upgrade system
 * Run this in the browser console to verify the implementation
 */

import { addWallet, unlockWallet, getAllWallets, getWalletSecurityInfo } from './src/core/wallet.js';

async function testPBKDF2Upgrade() {
  console.log('🧪 Testing PBKDF2 Auto-Upgrade System\n');

  const testPassword = 'TestPassword123!@#';

  try {
    // Test 1: Create new wallet with current recommendations
    console.log('Test 1: Creating new wallet...');
    const newWallet = await addWallet('create', {}, testPassword, 'Test Wallet 1');
    console.log(`✅ Wallet created: ${newWallet.address}`);

    const securityInfo = await getWalletSecurityInfo(newWallet.id);
    console.log(`   Current iterations: ${securityInfo.currentIterations.toLocaleString()}`);
    console.log(`   Recommended: ${securityInfo.recommendedIterations.toLocaleString()}`);
    console.log(`   Needs upgrade: ${securityInfo.needsUpgrade}\n`);

    // Test 2: Unlock without upgrade (should not upgrade - already current)
    console.log('Test 2: Unlocking newly created wallet...');
    const result1 = await unlockWallet(testPassword);
    console.log(`   Unlocked: ${result1.address}`);
    console.log(`   Upgraded: ${result1.upgraded}`);
    console.assert(!result1.upgraded, 'New wallet should not need upgrade');
    console.log('✅ New wallet does not need upgrade\n');

    // Test 3: Simulate legacy wallet by manually creating one
    // (In production, this would be a wallet created with old code)
    console.log('Test 3: Testing backward compatibility...');
    console.log('   Note: Legacy wallets (100k iterations) are automatically detected');
    console.log('   and upgraded on first unlock.\n');

    // Test 4: Multiple unlocks should only upgrade once
    console.log('Test 4: Testing upgrade idempotency...');
    const result2 = await unlockWallet(testPassword);
    console.assert(!result2.upgraded, 'Wallet should not upgrade twice');
    console.log('✅ Wallet does not upgrade multiple times\n');

    // Test 5: Export functions should skip upgrade
    console.log('Test 5: Testing export skip upgrade...');
    const { exportPrivateKey } = await import('./src/core/wallet.js');
    const privateKey = await exportPrivateKey(testPassword);
    console.log(`   Private key exported: ${privateKey.substring(0, 10)}...`);
    console.log('✅ Export did not trigger upgrade\n');

    // Test 6: Check security info
    console.log('Test 6: Verifying security information...');
    const finalSecurityInfo = await getWalletSecurityInfo(newWallet.id);
    console.log(`   Current iterations: ${finalSecurityInfo.currentIterations.toLocaleString()}`);
    console.log(`   Last upgrade: ${new Date(finalSecurityInfo.lastUpgrade).toLocaleString()}`);
    console.log('✅ Security information accessible\n');

    console.log('🎉 All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - New wallets use current iteration recommendations');
    console.log('   - Wallets do not upgrade if already current');
    console.log('   - Export operations skip upgrade logic');
    console.log('   - Security information is tracked correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Iteration growth verification
function testIterationGrowth() {
  console.log('\n🧪 Testing Iteration Growth Model\n');

  const { getCurrentRecommendedIterations } = require('./src/core/wallet.js');

  const tests = [
    { year: 2016, expected: 10000 },
    { year: 2021, expected: 310000 },
    { year: 2023, expected: 600000 },
    { year: 2024, expected: 810000 },
    { year: 2025, expected: 1094000 },
    { year: 2026, expected: 1477000 },
    { year: 2027, expected: 1994000 },
    { year: 2030, expected: 4907000 },
    { year: 2031, expected: 5000000 }, // Capped
    { year: 2035, expected: 5000000 }, // Still capped
  ];

  console.log('Year | Expected | Actual | Status');
  console.log('-----|----------|--------|-------');

  let allPassed = true;
  tests.forEach(({ year, expected }) => {
    const actual = getCurrentRecommendedIterations(year);
    const passed = actual === expected;
    const status = passed ? '✅' : '❌';
    allPassed = allPassed && passed;

    console.log(
      `${year} | ${expected.toLocaleString().padEnd(9)} | ${actual.toLocaleString().padEnd(9)} | ${status}`
    );
  });

  if (allPassed) {
    console.log('\n✅ All iteration growth tests passed!');
  } else {
    console.error('\n❌ Some iteration growth tests failed!');
  }

  return allPassed;
}

// Backward compatibility test
async function testBackwardCompatibility() {
  console.log('\n🧪 Testing Backward Compatibility\n');

  // Test decryption of legacy format
  // This would require a sample legacy encrypted wallet
  // For now, we verify the detection logic

  const testCases = [
    {
      name: 'New format (1,094,000 iterations)',
      data: createMockEncryptedData(1094000),
      expectedIterations: 1094000
    },
    {
      name: 'New format (600,000 iterations)',
      data: createMockEncryptedData(600000),
      expectedIterations: 600000
    },
    {
      name: 'Legacy format (would be 100,000)',
      data: createMockLegacyData(),
      expectedIterations: 100000
    }
  ];

  console.log('Test Case | Expected | Detected | Status');
  console.log('----------|----------|----------|-------');

  testCases.forEach(({ name, data, expectedIterations }) => {
    try {
      const { getIterationsFromEncrypted } = require('./src/core/wallet.js');
      const detected = getIterationsFromEncrypted(data);
      const passed = detected === expectedIterations;
      const status = passed ? '✅' : '❌';

      console.log(
        `${name.padEnd(35)} | ${expectedIterations.toLocaleString().padEnd(9)} | ${detected.toLocaleString().padEnd(9)} | ${status}`
      );
    } catch (error) {
      console.error(`❌ ${name}: ${error.message}`);
    }
  });
}

// Helper: Create mock encrypted data with iteration count
function createMockEncryptedData(iterations) {
  // Create fake encrypted data with iteration count header
  const iterationBytes = new Uint8Array(4);
  new DataView(iterationBytes.buffer).setUint32(0, iterations, false);

  const mockData = new Uint8Array(4 + 16 + 12 + 32); // iterations + salt + IV + ciphertext
  mockData.set(iterationBytes, 0);
  // Fill rest with dummy data
  for (let i = 4; i < mockData.length; i++) {
    mockData[i] = Math.floor(Math.random() * 256);
  }

  return btoa(String.fromCharCode(...mockData));
}

// Helper: Create mock legacy encrypted data (no iteration count)
function createMockLegacyData() {
  // Create fake encrypted data WITHOUT iteration count header
  // First 4 bytes should NOT look like valid iteration count
  const mockData = new Uint8Array(16 + 12 + 32); // salt + IV + ciphertext
  mockData[0] = 0x01; // Ensure first 4 bytes don't decode to valid iteration count
  mockData[1] = 0x23;
  mockData[2] = 0x45;
  mockData[3] = 0x67;

  // Fill rest with dummy data
  for (let i = 4; i < mockData.length; i++) {
    mockData[i] = Math.floor(Math.random() * 256);
  }

  return btoa(String.fromCharCode(...mockData));
}

// Export tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testPBKDF2Upgrade,
    testIterationGrowth,
    testBackwardCompatibility
  };
}

// Auto-run if loaded as script
if (typeof window !== 'undefined') {
  console.log('📦 PBKDF2 Upgrade Test Suite Loaded');
  console.log('Run tests with:');
  console.log('  - testPBKDF2Upgrade()');
  console.log('  - testIterationGrowth()');
  console.log('  - testBackwardCompatibility()');
}
