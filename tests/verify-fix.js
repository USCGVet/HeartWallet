// Quick verification that private key exposure is fixed
console.log('🔍 Verifying private key security fix...\n');

// Force a refresh of the wallet object
if (typeof app !== 'undefined' && app.walletCore) {
    const wallet = app.walletCore.getCurrentWallet();
    
    if (wallet) {
        console.log('Wallet object properties:');
        console.log('- address:', wallet.address ? '✅ Present' : '❌ Missing');
        console.log('- getAddress:', typeof wallet.getAddress === 'function' ? '✅ Function exists' : '❌ Missing');
        console.log('- privateKey:', wallet.privateKey ? '❌ EXPOSED!' : '✅ Not present');
        console.log('- _signingKey:', wallet._signingKey ? '❌ EXPOSED!' : '✅ Not present');
        
        // Check all properties
        const allProps = Object.keys(wallet);
        console.log('\nAll wallet properties:', allProps);
        
        // Check for any suspicious properties
        const suspicious = allProps.filter(prop => 
            prop.toLowerCase().includes('private') || 
            prop.toLowerCase().includes('key') ||
            prop.toLowerCase().includes('mnemonic') ||
            prop.toLowerCase().includes('seed')
        );
        
        if (suspicious.length > 0) {
            console.log('\n⚠️  Suspicious properties found:', suspicious);
        } else {
            console.log('\n✅ No suspicious properties found!');
        }
        
        // Verify it's a session wallet
        const isSessionWallet = wallet.hasOwnProperty('address') && 
                               wallet.hasOwnProperty('getAddress') && 
                               Object.keys(wallet).length <= 3; // Should only have minimal properties
        
        console.log('\nIs session wallet:', isSessionWallet ? '✅ Yes' : '❌ No (has extra properties)');
    } else {
        console.log('No wallet currently loaded');
    }
} else {
    console.log('App not available');
}

console.log('\n🏁 Verification complete!');