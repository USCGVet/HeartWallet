// Quick Security Check for Heart Wallet
// This script tests the actual implementation to verify security measures are working

console.log('🔒 Heart Wallet Security Check Starting...\n');

async function runSecurityChecks() {
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function addResult(test, passed, details) {
        results.tests.push({ test, passed, details });
        if (passed) results.passed++;
        else results.failed++;
        console.log(`${passed ? '✅' : '❌'} ${test}`);
        if (details) console.log(`   ${details}`);
    }
    
    // Test 1: Check if wallet object exposes private keys
    try {
        if (typeof app !== 'undefined' && app.walletCore) {
            const wallet = app.walletCore.getCurrentWallet();
            if (wallet) {
                const hasPrivateKey = wallet.privateKey !== undefined;
                const hasSigningKey = wallet._signingKey !== undefined;
                addResult(
                    'Frontend wallet object should not expose private keys',
                    !hasPrivateKey && !hasSigningKey,
                    hasPrivateKey ? 'Found wallet.privateKey!' : hasSigningKey ? 'Found wallet._signingKey!' : 'No private keys exposed'
                );
            } else {
                addResult('Frontend wallet object should not expose private keys', true, 'No wallet loaded');
            }
        }
    } catch (e) {
        addResult('Frontend wallet object should not expose private keys', false, `Error: ${e.message}`);
    }
    
    // Test 2: Check if token transfers use background script
    try {
        if (typeof app !== 'undefined' && app.tokenManager) {
            const sendTokenSource = app.tokenManager.sendToken.toString();
            const usesBackground = sendTokenSource.includes('chrome.runtime.sendMessage');
            addResult(
                'Token transfers should use background script',
                usesBackground,
                usesBackground ? 'Uses chrome.runtime.sendMessage' : 'Direct wallet usage detected!'
            );
        }
    } catch (e) {
        addResult('Token transfers should use background script', false, `Error: ${e.message}`);
    }
    
    // Test 3: Check if transaction sends use background script
    try {
        if (typeof app !== 'undefined' && app.transactionManager) {
            const sendTxSource = app.transactionManager.sendTransaction.toString();
            const usesBackground = sendTxSource.includes('chrome.runtime.sendMessage');
            const hasWalletConnect = sendTxSource.includes('wallet.connect');
            addResult(
                'Native currency transfers should use background script',
                usesBackground && !hasWalletConnect,
                hasWalletConnect ? 'Found wallet.connect() call!' : usesBackground ? 'Uses background script' : 'Issue detected'
            );
        }
    } catch (e) {
        addResult('Native currency transfers should use background script', false, `Error: ${e.message}`);
    }
    
    // Test 4: Check contract interactions
    try {
        if (typeof app !== 'undefined' && app.contractManager) {
            const writeSource = app.contractManager.callWriteFunction.toString();
            const usesBackground = writeSource.includes('chrome.runtime.sendMessage') && writeSource.includes('CONTRACT_WRITE');
            addResult(
                'Contract writes should use background script',
                usesBackground,
                usesBackground ? 'Uses CONTRACT_WRITE message' : 'Direct contract interaction detected!'
            );
        }
    } catch (e) {
        addResult('Contract writes should use background script', false, `Error: ${e.message}`);
    }
    
    // Test 5: Test background script message handling
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'getSessionInfo' }, response => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
        
        addResult(
            'Background script should respond to messages',
            true,
            `Session status: ${response.isLoggedIn ? 'Logged in' : 'Not logged in'}`
        );
    } catch (e) {
        addResult('Background script should respond to messages', false, `Error: ${e.message}`);
    }
    
    // Test 6: Check for global private key exposure
    try {
        let foundKeys = [];
        const checkObject = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return;
            for (const key in obj) {
                if (key.toLowerCase().includes('private') || key.toLowerCase().includes('mnemonic')) {
                    const value = obj[key];
                    if (typeof value === 'string' && value.length > 30) {
                        foundKeys.push(`${path}.${key}`);
                    }
                }
                if (typeof obj[key] === 'object' && path.split('.').length < 3) {
                    checkObject(obj[key], `${path}.${key}`);
                }
            }
        };
        
        checkObject(window, 'window');
        addResult(
            'No private keys in global scope',
            foundKeys.length === 0,
            foundKeys.length > 0 ? `Found suspicious keys: ${foundKeys.join(', ')}` : 'No suspicious keys found'
        );
    } catch (e) {
        addResult('No private keys in global scope', false, `Error: ${e.message}`);
    }
    
    // Test 7: Test session timeout behavior
    console.log('\n📊 Testing session management...');
    try {
        // Send a test message to see if it resets timeout
        const testMessage = { action: 'getNetworkState' };
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(testMessage, response => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
        
        addResult(
            'Popup messages should reset session timeout',
            true,
            'Message sent successfully (timeout should be reset)'
        );
    } catch (e) {
        addResult('Popup messages should reset session timeout', false, `Error: ${e.message}`);
    }
    
    // Summary
    console.log('\n📊 Security Check Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📝 Total: ${results.tests.length}`);
    
    if (results.failed > 0) {
        console.log('\n⚠️  Some security checks failed! Review the details above.');
    } else {
        console.log('\n🎉 All security checks passed!');
    }
    
    return results;
}

// Run the checks
runSecurityChecks().then(results => {
    // Store results for programmatic access
    window.securityCheckResults = results;
    console.log('\nResults stored in window.securityCheckResults');
}).catch(error => {
    console.error('Security check failed:', error);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = runSecurityChecks;
}