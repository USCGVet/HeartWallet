// Test export private key functionality
console.log('🔑 Testing export private key functionality...\n');

async function testExportPrivateKey() {
    try {
        // First check if we have any wallets
        const walletList = await new Promise(resolve => {
            chrome.storage.local.get(['walletList'], result => {
                resolve(result.walletList || []);
            });
        });
        
        console.log('Found wallets:', walletList.length);
        if (walletList.length === 0) {
            console.log('❌ No wallets found. Please create a wallet first.');
            return;
        }
        
        // Display wallet list
        console.log('\nAvailable wallets:');
        walletList.forEach((wallet, index) => {
            console.log(`${index + 1}. ${wallet.address} (${wallet.name})`);
            console.log(`   ID: ${wallet.id}`);
        });
        
        // Test with the first wallet
        const testWallet = walletList[0];
        console.log(`\nTesting with wallet: ${testWallet.address}`);
        console.log(`Wallet ID: ${testWallet.id}`);
        
        // Check if the wallet data exists
        const walletData = await new Promise(resolve => {
            chrome.storage.local.get([testWallet.id], result => {
                resolve(result[testWallet.id]);
            });
        });
        
        if (!walletData) {
            console.log('❌ Wallet data not found in storage!');
            return;
        }
        
        console.log('✅ Wallet data found in storage');
        console.log('Encrypted data length:', walletData.length);
        
        // Test export with wrong password first
        console.log('\nTesting with wrong password...');
        try {
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'exportPrivateKey',
                    walletId: testWallet.id,
                    password: 'wrong_password_123'
                }, response => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && !response.success) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                });
            });
            console.log('❌ Should have failed with wrong password!');
        } catch (error) {
            console.log('✅ Correctly rejected wrong password:', error.message);
        }
        
        // Now prompt for the real password
        const password = prompt('Enter the correct password for testing:');
        if (!password) {
            console.log('Test cancelled - no password provided');
            return;
        }
        
        console.log('\nTesting with provided password...');
        try {
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'exportPrivateKey',
                    walletId: testWallet.id,
                    password: password
                }, response => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && !response.success) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                });
            });
            
            if (response.success && response.privateKey) {
                console.log('✅ Private key exported successfully!');
                console.log('Private key starts with:', response.privateKey.substring(0, 10) + '...');
                console.log('Private key length:', response.privateKey.length);
                
                // Verify it's a valid private key format
                if (response.privateKey.startsWith('0x') && response.privateKey.length === 66) {
                    console.log('✅ Private key format is valid');
                } else {
                    console.log('⚠️  Private key format may be incorrect');
                }
            } else {
                console.log('❌ Failed to export private key');
            }
        } catch (error) {
            console.log('❌ Error exporting private key:', error.message);
            
            // Check if it's because wallet is locked
            const sessionInfo = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: 'getSessionInfo' }, resolve);
            });
            console.log('Session status:', sessionInfo.isLoggedIn ? 'Logged in' : 'Not logged in');
            
            if (!sessionInfo.isLoggedIn) {
                console.log('💡 Tip: Make sure you are logged in before exporting private key');
            }
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
console.log('Starting test...\n');
testExportPrivateKey().then(() => {
    console.log('\n🏁 Test complete!');
});