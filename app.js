// Heart Wallet - Main Application (Refactored)
// This is the new simplified main application file

class HeartWalletApp {
    constructor() {
        this.storage = chrome.storage.local;
        this.secureMemory = new Map();
        
        // Initialize managers with correct class names
        console.log('Initializing HeartWallet components...');
        
        try {
            this.walletCore = new WalletCore(this.storage, this.secureMemory);
            console.log('✓ WalletCore initialized');
            
            this.uiManager = new UIManager();
            console.log('✓ UIManager initialized');
            
            this.networkCore = new NetworkCore(this.storage, (isConnected, networkName) => {
                this.uiManager.updateConnectionIndicator(isConnected, networkName);
            });
            console.log('✓ NetworkCore initialized');
            
            this.authManager = new AuthManager(this.storage, this.secureMemory, this.walletCore);
            console.log('✓ AuthManager initialized');
            
            this.transactionManager = new TransactionManager(this.networkCore, this.walletCore);
            console.log('✓ TransactionManager initialized');
              this.tokenManager = new TokenManager(this.networkCore, this.walletCore);
            console.log('✓ TokenManager initialized');
            
            this.contractManager = new ContractManager(this.networkCore, this.walletCore, this.storage);
            console.log('✓ ContractManager initialized');
            
            this.notificationManager = new NotificationManager();
            console.log('✓ NotificationManager initialized');
            
        } catch (error) {
            console.error('Error initializing components:', error);
            throw error;
        }
        
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Initialize UI first
            this.uiManager.initialize();
              // Initialize network
            await this.networkCore.initialize();
            
            // Setup authentication activity tracking
            this.authManager.setupActivityTracking();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Check if wallet exists and show appropriate screen
            await this.checkWalletStatus();
            
            // Load default tokens
            await this.tokenManager.loadDefaultTokens();
            
            // Initialize contract manager
            await this.contractManager.initialize();
            
            // Wait for send token modal to load
            await this.waitForSendTokenModal();
            
            this.isInitialized = true;
            console.log('Heart Wallet initialized successfully');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.uiManager.showStatus('Failed to initialize wallet', 'error');
        }
    }
    
    async waitForSendTokenModal() {
        // Wait for the send token modal to be loaded
        let attempts = 0;
        const maxAttempts = 20; // Increased attempts
        
        while (attempts < maxAttempts) {
            if (document.getElementById('send-token-modal')) {
                console.log('Send token modal loaded successfully');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100)); // Faster checks
            attempts++;
        }
        
        console.warn('Send token modal failed to load after', maxAttempts, 'attempts');
    }    async checkWalletStatus() {
        // Debug wallet status
        console.log('=== WALLET STATUS DEBUG ===');
        console.log('WalletCore initialized:', !!this.walletCore);
        console.log('AuthManager initialized:', !!this.authManager);
        
        // First check if there's an active session in the background
        try {
            const sessionStatus = await chrome.runtime.sendMessage({ action: 'checkSession' });
            console.log('Session status from background:', sessionStatus);
            
            if (sessionStatus && sessionStatus.active && sessionStatus.address) {
                // Session is active, restore wallet state
                console.log('Active session found, restoring wallet state');
                this.walletCore.setCurrentAddress(sessionStatus.address);
                this.authManager.isAuthenticated = true;
                this.uiManager.showWalletDashboard();
                this.uiManager.updateWalletDisplay(sessionStatus.address, sessionStatus.balance || '0');
                
                // Load token balances
                await this.updateTokenBalances();
                return;
            }
        } catch (error) {
            console.error('Error checking session status:', error);
        }
        
        const hasWallets = await this.walletCore.hasWallets(); // Corrected: hasWallet to hasWallets
        console.log('checkWalletStatus: Has wallets?', hasWallets);
        
        if (!hasWallets) {
            this.uiManager.showWalletSetup();
        } else if (this.authManager.isLoggedIn()) {
            await this.showDashboard();
        } else {
            this.uiManager.showLoginSection();
        }
    }

    setupEventListeners() {
        // Wallet creation
        const generateBtn = document.getElementById('generate-wallet');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleCreateWallet());
        }        // Wallet import
        const importSeedBtn = document.getElementById('import-seed');
        if (importSeedBtn) {
            console.log('app.js: Found button with ID "import-seed". Attaching listener.'); // MODIFIED: Added log
            importSeedBtn.addEventListener('click', async () => {
                console.log('app.js: Import Seed button clicked (event listener in app.js fired)'); // MODIFIED: Clarified log
                await this.handleImportSeed();
            });
        } else {
            // This button may not exist in all screens, only warn if we're on the import screen
            const importForm = document.getElementById('import-wallet-form');
            if (importForm && !importForm.classList.contains('hidden')) {
                console.warn('app.js: Button with ID "import-seed" NOT FOUND on import screen.');
            }
        }const importKeyBtn = document.getElementById('import-key');
        if (importKeyBtn) {
            importKeyBtn.addEventListener('click', async () => {
                console.log('app.js: Import Key button clicked (from setupEventListeners)');
                await this.handleImportKey();
            });
        }

        // Import wallet button (main form)
        const importWalletBtn = document.getElementById('import-wallet-btn');
        if (importWalletBtn) {
            console.log('app.js: Found button with ID "import-wallet-btn". Attaching listener.');
            importWalletBtn.addEventListener('click', async () => {
                console.log('app.js: Import Wallet button clicked');
                await this.handleImportWallet();
            });
        } else {
            console.warn('app.js: Button with ID "import-wallet-btn" NOT FOUND during setupEventListeners.');
        }

        // Login
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        // Alternative login button names that might exist
        const unlockBtn = document.getElementById('unlock-wallet');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => this.handleLogin());
        }

        // Logout
        const logoutBtn = document.getElementById('logout-wallet-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }        // Send transaction
        const sendBtn = document.getElementById('send-transaction');
        if (sendBtn) {
            console.log('Send button found, adding event listener');
            sendBtn.addEventListener('click', () => {
                console.log('Send button clicked!');
                this.handleSendTransaction();
            });
        } else {
            console.warn('Send button not found');
        }

        // Alternative send button
        const sendBtnAlt = document.getElementById('send-btn');
        if (sendBtnAlt) {
            sendBtnAlt.addEventListener('click', () => this.handleSendTransaction());
        }

        // Network switching
        const networkSelects = ['network-select', 'settings-network-select', 'footer-network-select'];
        networkSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', (e) => this.handleNetworkChange(e.target.value));
            }        });

        // Balance refresh button
        const refreshBtn = document.getElementById('refresh-balance');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateBalance(true)); // Show notification for manual refresh
        }

        // Close settings button (if it exists independently)
        const closeSettingsBtn = document.getElementById('close-settings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.handleSettingsClose());
        }

        // Enter key handling for password fields
        const passwordFields = ['new-password', 'confirm-password', 'import-password', 'login-password'];
        passwordFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleEnterKey(fieldId);
                    }
                });
            }
        });        // Add new wallet from seed in settings
        const addWalletSeedBtn = document.getElementById('add-wallet-seed');
        if (addWalletSeedBtn) {
            console.log('app.js: Found button with ID "add-wallet-seed". Attaching listener.'); // MODIFIED: Added log
            addWalletSeedBtn.addEventListener('click', async () => {
                console.log('app.js: Add Wallet (Seed) button in settings clicked (event listener in app.js fired)'); // MODIFIED: Clarified log
                await this.handleAddWalletFromSeed();
            });
        } else {
            console.warn('app.js: Button with ID "add-wallet-seed" NOT FOUND during setupEventListeners.'); // MODIFIED: Added warning
        }        // Add new wallet from private key in settings
        const addWalletKeyBtn = document.getElementById('add-wallet-key');
        if (addWalletKeyBtn) {
            console.log('app.js: Found button with ID "add-wallet-key". Attaching listener.');
            addWalletKeyBtn.addEventListener('click', async () => {
                console.log('app.js: Add Wallet (Private Key) button in settings clicked');
                await this.handleAddWalletFromPrivateKey();
            });
        } else {
            console.warn('app.js: Button with ID "add-wallet-key" NOT FOUND during setupEventListeners.');        }

        // Connected Sites buttons
        const refreshSitesBtn = document.getElementById('refresh-connected-sites');
        if (refreshSitesBtn) {
            refreshSitesBtn.addEventListener('click', () => this.loadConnectedSites());
        }

        const disconnectAllBtn = document.getElementById('disconnect-all-sites');
        if (disconnectAllBtn) {
            disconnectAllBtn.addEventListener('click', () => this.disconnectAllSites());
        }

        // Contract Interaction buttons
        const addContractBtn = document.getElementById('add-contract');
        if (addContractBtn) {
            addContractBtn.addEventListener('click', () => this.handleAddContract());
        }

        const refreshContractBtn = document.getElementById('refresh-contract-list');
        if (refreshContractBtn) {
            refreshContractBtn.addEventListener('click', () => this.loadContractList());
        }

        // Token Management buttons
        const addCustomTokenBtn = document.getElementById('add-custom-token');
        if (addCustomTokenBtn) {
            console.log('Found add-custom-token button, adding event listener');
            addCustomTokenBtn.addEventListener('click', () => {
                console.log('Add custom token button clicked');
                this.handleAddCustomToken();
            });
        } else {
            console.warn('add-custom-token button not found during setupEventListeners');
        }

        const autoDetectTokenBtn = document.getElementById('auto-detect-token');
        if (autoDetectTokenBtn) {
            console.log('Found auto-detect-token button, adding event listener');
            autoDetectTokenBtn.addEventListener('click', () => {
                console.log('Auto detect token button clicked');
                this.handleAutoDetectToken();
            });
        } else {
            console.warn('auto-detect-token button not found during setupEventListeners');
        }

        const refreshTokenListBtn = document.getElementById('refresh-token-list');
        if (refreshTokenListBtn) {
            console.log('Found refresh-token-list button, adding event listener');
            refreshTokenListBtn.addEventListener('click', () => {
                console.log('Refresh token list button clicked');
                this.loadTokenList();
            });
        } else {
            console.warn('refresh-token-list button not found during setupEventListeners');
        }

        // Setup tab switching for wallet import methods in settings
        const seedPhraseTab = document.getElementById('seed-phrase-tab');
        const privateKeyTab = document.getElementById('private-key-tab');
        const seedPhraseImportTab = document.getElementById('seed-phrase-import-tab');
        const privateKeyImportTab = document.getElementById('private-key-import-tab');
        
        if (seedPhraseTab && privateKeyTab && seedPhraseImportTab && privateKeyImportTab) {
            seedPhraseTab.addEventListener('click', () => {
                seedPhraseTab.classList.add('active');
                privateKeyTab.classList.remove('active');
                seedPhraseImportTab.classList.remove('hidden');
                privateKeyImportTab.classList.add('hidden');
            });
            
            privateKeyTab.addEventListener('click', () => {
                privateKeyTab.classList.add('active');
                seedPhraseTab.classList.remove('active');
                privateKeyImportTab.classList.remove('hidden');
                seedPhraseImportTab.classList.add('hidden');
            });
        }

        // PRC-20 Token toggle functionality
        const tokenToggle = document.getElementById('toggle-tokens');
        if (tokenToggle) {
            tokenToggle.addEventListener('click', () => {
                const tokenContainer = document.getElementById('token-list-container');
                if (tokenContainer) {
                    tokenContainer.classList.toggle('hidden');
                    
                    // Update chevron icon direction
                    const chevron = tokenToggle.querySelector('i.fa-chevron-down, i.fa-chevron-up');
                    if (chevron) {
                        if (tokenContainer.classList.contains('hidden')) {
                            chevron.className = 'fas fa-chevron-down';
                        } else {
                            chevron.className = 'fas fa-chevron-up';
                        }
                    }
                }
            });
        }        // Auto-load token list when PRC-20 settings section is opened
        const settingsGroups = document.querySelectorAll('details.settings-group');
        settingsGroups.forEach(details => {
            const summary = details.querySelector('summary');
            if (summary && summary.textContent.includes('PRC-20 Token Management')) {
                details.addEventListener('toggle', () => {
                    if (details.open) {
                        console.log('PRC-20 Token Management section opened, loading token list');
                        this.loadTokenList();
                    }
                });
            }
        });
        
        // Settings button - hook into settings opening
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                // Use a small delay to ensure the settings panel is visible before loading tokens
                setTimeout(() => this.handleSettingsOpen(), 100);
            });
        }
    }

    handleEnterKey(fieldId) {
        switch (fieldId) {
            case 'login-password':
                this.handleLogin();
                break;
            case 'new-password':
            case 'confirm-password':
                this.handleCreateWallet();
                break;
            case 'import-password':
                const activeForm = document.querySelector('.wallet-form:not(.hidden)');
                if (activeForm && activeForm.id === 'import-wallet-form') {
                    if (document.getElementById('seed-phrase') && document.getElementById('seed-phrase').value) {
                        this.handleImportSeed();
                    } else if (document.getElementById('private-key') && document.getElementById('private-key').value) {
                        this.handleImportKey();
                    }
                }
                break;
        }
    }    async handleCreateWallet() {
        try {
            const password = document.getElementById('new-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;

            if (!password || !confirmPassword) {
                this.notificationManager.show('Please enter and confirm your password', 'error');
                return;
            }

            if (password !== confirmPassword) {
                this.notificationManager.show('Passwords do not match', 'error');
                return;
            }

            const validation = await this.authManager.validatePassword(password);
            if (!validation.valid) {
                this.notificationManager.show(validation.error, 'error');
                return;
            }

            this.uiManager.disableButton('generate-wallet');
            
            // Show progress notification for wallet creation
            const createProgress = this.notificationManager.showProgress('Creating new wallet...', 'info');
            createProgress.updateProgress(25, 'Generating secure seed phrase...');

            const result = await this.walletCore.createWallet(password);
            
            createProgress.updateProgress(75, 'Encrypting wallet data...');
            
            this.uiManager.displaySeedPhrase(result.seedPhrase);
            
            createProgress.complete('Wallet created successfully!', true);
            
            // Show additional notification about saving seed phrase
            this.notificationManager.show(
                'Important: Please save your seed phrase in a secure location. You\'ll need it to recover your wallet.',
                'warning',
                10000
            );
            
            // Auto-login after creation
            await this.authManager.login(password);
            setTimeout(() => this.showDashboard(), 3000);

        } catch (error) {
            console.error('Error creating wallet:', error);
            this.notificationManager.show('Failed to create wallet: ' + error.message, 'error');
        } finally {
            this.uiManager.enableButton('generate-wallet');
        }
    }    async handleImportSeed() {
        console.log('app.js: handleImportSeed function started.');
        const passwordField = document.getElementById('import-password');
        const seedPhraseField = document.getElementById('seed-phrase');

        if (!passwordField || !seedPhraseField) {
            console.error('app.js: handleImportSeed - Password or seed phrase field not found.');
            this.notificationManager.show('Error: UI elements missing for import.', 'error');
            return;
        }

        const password = passwordField.value?.trim();
        const seedPhrase = seedPhraseField.value?.trim();

        if (!seedPhrase || !password) {
            this.notificationManager.show('Please enter both seed phrase and password', 'error');
            return;
        }

        // Validate seed phrase format
        if (!ethers.Mnemonic.isValidMnemonic(seedPhrase)) {
            this.notificationManager.show('Invalid seed phrase format. Please check the words and try again.', 'error');
            return;
        }

        // Validate password
        const validation = await this.authManager.validatePassword(password);
        if (!validation.valid) {
            this.notificationManager.show(validation.error, 'error');
            return;
        }

        try {
            this.uiManager.disableButton('import-seed');
            
            // Show progress notification for wallet import
            const importProgress = this.notificationManager.showProgress('Importing wallet from seed phrase...', 'info');
            importProgress.updateProgress(25, 'Validating seed phrase...');
            
            await this.walletCore.importFromSeedPhrase(seedPhrase, password);
            
            importProgress.updateProgress(75, 'Logging into wallet...');
            await this.authManager.login(password);
            
            importProgress.complete('Wallet imported successfully!', true);
              // Show wallet imported notification
            const currentWallet = this.walletCore.getCurrentWallet();
            if (currentWallet) {
                this.notificationManager.walletImported(currentWallet.address);
            }
            
            // Debug storage after successful wallet import
            // Removed log that exposed wallet address
            
            await this.showDashboard();

        } catch (error) {
            console.error('Error importing wallet from seed:', error);
            this.notificationManager.show('Failed to import wallet: ' + error.message, 'error');
        } finally {
            this.uiManager.enableButton('import-seed');
        }
    }    async handleImportKey() {
        try {
            const privateKey = document.getElementById('private-key')?.value?.trim();
            const password = document.getElementById('import-password')?.value;

            if (!privateKey || !password) {
                this.notificationManager.show('Please enter both private key and password', 'error');
                return;
            }

            const validation = await this.authManager.validatePassword(password);
            if (!validation.valid) {
                this.notificationManager.show(validation.error, 'error');
                return;
            }

            this.uiManager.disableButton('import-key');
            
            // Show progress notification for wallet import
            const importProgress = this.notificationManager.showProgress('Importing wallet from private key...', 'info');
            importProgress.updateProgress(25, 'Validating private key...');

            await this.walletCore.importFromPrivateKey(privateKey, password);
            
            importProgress.updateProgress(75, 'Logging into wallet...');
            await this.authManager.login(password);
            
            importProgress.complete('Wallet imported successfully!', true);
            
            // Show wallet imported notification
            const currentWallet = this.walletCore.getCurrentWallet();
            if (currentWallet) {
                this.notificationManager.walletImported(currentWallet.address);
            }
            
            await this.showDashboard();

        } catch (error) {
            console.error('Error importing wallet from key:', error);
            this.notificationManager.show('Failed to import wallet: ' + error.message, 'error');
        } finally {
            this.uiManager.enableButton('import-key');
        }
    }async handleImportWallet() {
        try {
            console.log('app.js: handleImportWallet function started.');
            
            const seedPhraseField = document.getElementById('seed-phrase');
            const passwordField = document.getElementById('import-password');

            if (!seedPhraseField || !passwordField) {
                console.error('app.js: handleImportWallet - Required form fields not found.');
                this.notificationManager.show('Error: Import form fields missing.', 'error');
                return;
            }

            const seedPhrase = seedPhraseField.value?.trim();
            const password = passwordField.value;

            if (!seedPhrase || !password) {
                this.notificationManager.show('Please enter both seed phrase and password', 'error');
                return;
            }

            // Validate password
            const validation = await this.authManager.validatePassword(password);
            if (!validation.valid) {
                this.notificationManager.show(validation.error, 'error');
                return;
            }

            this.uiManager.disableButton('import-wallet-btn');
            
            // Show progress notification for wallet import
            const importProgress = this.notificationManager.showProgress('Importing wallet...', 'info');
            importProgress.updateProgress(25, 'Validating seed phrase...');

            console.log('app.js: Attempting to import wallet from seed phrase');
            await this.walletCore.importFromSeedPhrase(seedPhrase, password);
            
            importProgress.updateProgress(75, 'Logging into wallet...');
            console.log('app.js: Wallet imported, attempting login');
            await this.authManager.login(password);
            
            importProgress.complete('Wallet imported successfully!', true);
            
            // Show wallet imported notification
            const currentWallet = this.walletCore.getCurrentWallet();
            if (currentWallet) {
                this.notificationManager.walletImported(currentWallet.address);
            }
            
            console.log('app.js: Login successful, showing dashboard');
            await this.showDashboard();

        } catch (error) {
            console.error('Error importing wallet:', error);
            this.notificationManager.show('Failed to import wallet: ' + error.message, 'error');
        } finally {
            this.uiManager.enableButton('import-wallet-btn');
        }
    }    async handleLogin() {
        try {
            console.log('handleLogin: Starting login process...');
            
            // Debug wallet status before login attempt
            console.log('Login attempt - AuthManager available:', !!this.authManager);
            
            const password = document.getElementById('login-password')?.value;

        if (!password) {
            this.notificationManager.show('Please enter your password', 'error');
            return;
        }

        this.uiManager.disableButton('login-btn'); // Use the actual button ID
        this.uiManager.disableButton('unlock-wallet'); // Alternative button

        // Show progress notification for wallet unlock
        const unlockProgress = this.notificationManager.showProgress('Unlocking wallet...', 'info');
        unlockProgress.updateProgress(25, 'Decrypting wallet data...');

        await this.authManager.login(password);
        
        // Get the current wallet AFTER login
        const currentWallet = this.walletCore.getCurrentWallet();
        
        if (currentWallet) {
            // Make sure the session timeout is properly set
            const securitySettings = await this.storage.get(['securitySettings']);
            const autoLogoutMinutes = securitySettings?.securitySettings?.autoLogoutMinutes || 5;
            const sessionTimeout = autoLogoutMinutes * 60 * 1000;
            
            // Notify background about login with proper timeout
            await chrome.runtime.sendMessage({
                action: "loginWallet",
                address: currentWallet.address,
                sessionTimeout: sessionTimeout,
                decryptedKey: currentWallet.privateKey
            });
            
            unlockProgress.updateProgress(75, 'Loading wallet dashboard...');
            await this.showDashboard();
            
            unlockProgress.complete('Wallet unlocked successfully!', true);
            
            // Don't show duplicate wallet unlocked notification
            // this.notificationManager.walletUnlocked(currentWallet.address);
        } else {
            throw new Error('No wallet found after login');
        }

    } catch (error) {
        console.error('Error logging in:', error);
        this.notificationManager.show('Invalid password', 'error');
    } finally {
        this.uiManager.enableButton('login-btn');
        this.uiManager.enableButton('unlock-wallet');
    }
}

    async handleWalletSelectionChange(selectedWalletId) {
        try {
            console.log('User selected wallet for login:', selectedWalletId);
            
            // Switch the active wallet before login attempt
            const currentActiveWalletId = await this.walletCore.getActiveWalletId();
            if (currentActiveWalletId !== selectedWalletId) {
                console.log('Switching active wallet from', currentActiveWalletId, 'to', selectedWalletId);
                await this.walletCore.switchActiveWallet(selectedWalletId);
                this.uiManager.showStatus('Switched to selected wallet. Please enter your password.', 'info');
            }
        } catch (error) {
            console.error('Error switching wallet for login:', error);
            this.uiManager.showStatus('Error switching wallet: ' + error.message, 'error');
        }
    }    handleLogout() {
        this.authManager.logout();
        this.uiManager.showLoginSection();
        this.uiManager.clearInputs();
        
        // Show wallet locked notification
        this.notificationManager.walletLocked();
    }async handleSendTransaction() {
        console.log('handleSendTransaction called'); // Debug log
        console.log('Components check:', {
            transactionManager: !!this.transactionManager,
            networkCore: !!this.networkCore,
            walletCore: !!this.walletCore,
            uiManager: !!this.uiManager,
            notificationManager: !!this.notificationManager
        });
        
        // Check UI state
        const walletDashboard = document.getElementById('wallet-dashboard');
        const sendButton = document.getElementById('send-transaction');
        console.log('UI state check:', {
            dashboardVisible: walletDashboard && !walletDashboard.classList.contains('hidden'),
            sendButtonExists: !!sendButton,
            sendButtonDisabled: sendButton ? sendButton.disabled : 'N/A',
            sendButtonVisible: sendButton ? sendButton.style.display !== 'none' : 'N/A'
        });
        
        let progressNotification = null;
        
        try {
            const recipient = document.getElementById('recipient-address')?.value?.trim();
            const amount = document.getElementById('send-amount')?.value?.trim();
            console.log('Recipient:', recipient, 'Amount:', amount); // Debug log

            if (!recipient || !amount) {
                this.notificationManager.show('Please enter recipient address and amount', 'error');
                return;
            }

            console.log('Validating address...'); // Debug log
            if (!this.transactionManager.validateAddress(recipient)) {
                this.notificationManager.show('Invalid recipient address', 'error');
                return;
            }

            console.log('Getting wallet and balance...'); // Debug log
            const currentWallet = this.walletCore.getCurrentWallet();
            if (!currentWallet) {
                this.notificationManager.show('No wallet available. Please unlock your wallet first.', 'error');
                return;
            }

            const balance = await this.networkCore.getBalance(currentWallet.address);
            console.log('Current balance:', balance); // Debug log
            
            const validation = this.transactionManager.validateAmount(amount, balance);
            
            if (!validation.valid) {
                this.notificationManager.show(validation.error, 'error');
                return;
            }            console.log('Starting transaction...'); // Debug log
            this.uiManager.disableButton('send-transaction');
            
            // Show progress notification for blockchain operation
            progressNotification = this.notificationManager.blockchainOperation('send');

            progressNotification.updateProgress(25, 'Creating transaction...');

            const result = await this.transactionManager.sendTransaction(recipient, amount);
            console.log('Transaction result:', result); // Debug log

            progressNotification.updateProgress(75, 'Transaction submitted to PulseChain...');

            // Show transaction submitted notification
            this.notificationManager.transactionSubmitted(result.hash, 'PulseChain');
            
            // Complete the progress notification
            progressNotification.complete('Transaction sent successfully!', true);
            
            this.uiManager.clearInputs();
            
            // Wait for confirmation in background
            this.waitForTransactionConfirmation(result.hash);
            
            // Update balance after a delay
            setTimeout(() => this.updateBalance(), 5000);        } catch (error) {
            console.error('Error sending transaction:', error);
            
            if (progressNotification) {
                progressNotification.complete('Transaction failed: ' + error.message, false);
            } else {
                this.notificationManager.transactionFailed(error);
            }
        } finally {
            console.log('Re-enabling buttons...'); // Debug log
            this.uiManager.enableButton('send-transaction');
        }
    }

    /**
     * Wait for transaction confirmation and show notification
     * @param {string} txHash - Transaction hash to monitor
     */
    async waitForTransactionConfirmation(txHash) {
        try {
            if (!this.networkCore.provider) {
                console.warn('No provider available for transaction confirmation monitoring');
                return;
            }

            console.log(`Monitoring transaction confirmation for ${txHash}`);
            
            // Wait for transaction confirmation (1 confirmation)
            const receipt = await this.networkCore.provider.waitForTransaction(txHash, 1);
            
            if (receipt) {
                console.log('Transaction confirmed:', receipt);
                
                // Show confirmation notification
                const currentNetwork = this.networkCore.getCurrentNetwork();
                const networkName = currentNetwork?.name || 'PulseChain';
                this.notificationManager.transactionConfirmed(txHash, networkName, receipt.confirmations || 1);
                
                // Refresh balance after confirmation
                await this.updateBalance();
            }
        } catch (error) {
            console.error('Error monitoring transaction confirmation:', error);
            // Don't show error notification here as the transaction might still be pending
            // The user already got notification that transaction was submitted
        }
    }

    /**
     * Handle token transfer with notification system
     */
    async handleSendToken(tokenAddress, recipientAddress, amount) {
        let progressNotification = null;
        
        try {
            const wallet = this.walletCore.getCurrentWallet();
            if (!wallet) {
                this.notificationManager.show('Please unlock your wallet first', 'error', 5000);
                return;
            }

            // Validate inputs
            if (!tokenAddress || !recipientAddress || !amount) {
                this.notificationManager.show('Please enter token address, recipient address, and amount', 'error', 5000);
                return;
            }

            if (!ethers.isAddress(recipientAddress)) {
                this.notificationManager.show('Please enter a valid recipient address', 'error', 5000);
                return;
            }

            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                this.notificationManager.show('Please enter a valid positive amount', 'error', 5000);
                return;
            }

            // Get token info
            const tokenInfo = this.tokenManager.getTokenList().get(tokenAddress.toLowerCase());
            if (!tokenInfo) {
                this.notificationManager.show('Token not found in your token list', 'error', 5000);
                return;
            }            // Show progress notification for token transaction
            progressNotification = this.notificationManager.blockchainOperation('token-transfer');

            progressNotification.updateProgress(25, `Preparing ${tokenInfo.symbol} transfer...`);// Check token balance
            const tokenBalance = await this.tokenManager.getTokenBalance(tokenAddress, wallet.address);
            if (parseFloat(tokenBalance) < numericAmount) {
                progressNotification.complete(`Insufficient ${tokenInfo.symbol} balance`, false);
                return;
            }

            progressNotification.updateProgress(75, `Sending ${tokenInfo.symbol} transaction...`);

            // Send token
            const result = await this.tokenManager.sendToken(tokenAddress, recipientAddress, amount);
            
            // Show transaction submitted notification
            this.notificationManager.transactionSubmitted(result.hash, 'PulseChain', {
                type: 'token',
                symbol: tokenInfo.symbol,
                amount: amount,
                recipient: recipientAddress
            });              // Complete the progress notification
            progressNotification.complete(`${tokenInfo.symbol} sent successfully!`, true);
            
            // Wait for confirmation in background
            this.waitForTransactionConfirmation(result.hash);
            
            // Update token balances after delay
            setTimeout(() => this.updateTokenBalances(), 5000);
            
        } catch (error) {
            console.error('Error sending token:', error);
              if (progressNotification) {
                progressNotification.complete('Token transfer failed: ' + error.message, false);
            } else {
                this.notificationManager.tokenTransferFailed(error, tokenInfo?.symbol || 'Token', amount);
            }
        }
    }

    /**
     * Handle adding a new token with notification system
     */
    async handleAddToken(tokenAddress, symbol = null, decimals = null) {
        let progressNotification = null;
        
        try {
            if (!tokenAddress) {
                this.notificationManager.show('Please enter a token contract address', 'error', 5000);
                return;
            }

            if (!ethers.isAddress(tokenAddress)) {
                this.notificationManager.show('Please enter a valid token contract address', 'error', 5000);
                return;
            }            // Show progress notification for adding token
            progressNotification = this.notificationManager.showProgress('Adding token...', 'info');            const tokenInfo = await this.tokenManager.addToken(tokenAddress, symbol, decimals);            
            progressNotification.complete('Token added successfully!', true);
            
            // Show token added notification
            this.notificationManager.tokenAdded(tokenInfo.symbol, tokenInfo.address);
            
            // Update token balances
            await this.updateTokenBalances();
            
        } catch (error) {
            console.error('Error adding token:', error);              if (progressNotification) {
                progressNotification.complete('Failed to add token: ' + error.message, false);
            } else {
                this.notificationManager.show('Failed to add token: ' + error.message, 'error', 6000);
            }
        }
    }

    /**
     * Handle removing a token with notification system
     */
    async handleRemoveToken(tokenAddress) {
        try {
            if (!tokenAddress) {
                this.notificationManager.show('Please select a token to remove', 'error', 5000);
                return;
            }

            const tokenInfo = this.tokenManager.getTokenList().get(tokenAddress.toLowerCase());
            const tokenSymbol = tokenInfo ? tokenInfo.symbol : 'Token';

            const success = this.tokenManager.removeToken(tokenAddress);
            
            if (success) {
                this.notificationManager.tokenRemoved(tokenSymbol, tokenAddress);
                
                // Update token balances
                await this.updateTokenBalances();
            } else {
                this.notificationManager.show('Token not found in list', 'error', 5000);
            }
            
        } catch (error) {
            console.error('Error removing token:', error);
            this.notificationManager.show('Failed to remove token: ' + error.message, 'error', 6000);
        }
    }

    async handleAddWalletFromSeed() {
        console.log('app.js: handleAddWalletFromSeed function started.');
        
        // Get the correct field IDs from the settings form
        const passwordField = document.getElementById('new-wallet-password-seed');
        const seedPhraseField = document.getElementById('new-wallet-seed-phrase');
        const nameField = document.getElementById('new-wallet-name-seed');

        if (!passwordField || !seedPhraseField) {
            console.error('app.js: handleAddWalletFromSeed - Password or seed phrase field not found in settings.');
            this.notificationManager.show('Error: Import form fields missing.', 'error');
            return;
        }

        const password = passwordField.value?.trim();
        const seedPhrase = seedPhraseField.value?.trim();
        const walletName = nameField?.value?.trim();

        if (!seedPhrase || !password) {
            this.notificationManager.show('Please enter both seed phrase and password.', 'error');
            return;
        }

        // Validate seed phrase format
        if (!ethers.Mnemonic.isValidMnemonic(seedPhrase)) {
            this.notificationManager.show('Invalid seed phrase format. Please check the words and try again.', 'error');
            return;
        }

        // Validate password strength
        const passwordValidation = await this.authManager.validatePassword(password);
        if (!passwordValidation.valid) {
            this.notificationManager.show(passwordValidation.error || 'Password is not strong enough.', 'error');
            return;
        }

        try {
            this.uiManager.disableButton('add-wallet-seed');
            
            // Show progress notification for wallet import
            const importProgress = this.notificationManager.showProgress('Adding wallet from seed phrase...', 'info');
            importProgress.updateProgress(25, 'Validating seed phrase...');
            
            const result = await this.walletCore.importFromSeedPhrase(seedPhrase, password, walletName);
            
            importProgress.updateProgress(75, 'Saving wallet data...');
            await this.loadWalletList();
            
            importProgress.complete('Wallet added successfully!', true);
            
            // Show wallet added notification with address
            if (result && result.address) {
                this.notificationManager.walletAdded(result.address);
            }
            
            this.uiManager.clearInputs(['new-wallet-seed-phrase', 'new-wallet-password-seed', 'new-wallet-name-seed']);
              // Show additional info notification
            this.notificationManager.show(
                'Wallet is now active. You can close settings and log in with this wallet.',
                'info',
                5000
            );
            
            console.log('Wallet added from seed successfully');

        } catch (error) {
            console.error('handleAddWalletFromSeed: Error adding wallet from seed:', error);
            this.notificationManager.show('Failed to add wallet: ' + error.message, 'error');
        } finally {
            this.uiManager.enableButton('add-wallet-seed');
        }
    }    async handleAddWalletFromPrivateKey() {
        try {
            console.log("handleAddWalletFromPrivateKey: Attempting to add wallet from private key.");
            
            const privateKey = document.getElementById('new-wallet-private-key')?.value?.trim();
            const password = document.getElementById('new-wallet-password-key')?.value?.trim();
            const walletName = document.getElementById('new-wallet-name-key')?.value?.trim();

            if (!privateKey || !password) {
                this.notificationManager.show('Please enter both private key and password.', 'error');
                return;
            }
            
            // Add password validation
            const passwordValidation = await this.authManager.validatePassword(password);
            if (!passwordValidation.valid) {
                this.notificationManager.show(passwordValidation.error || 'Password is not strong enough.', 'error');
                return;
            }

            this.uiManager.disableButton('add-wallet-key');
            
            // Show progress notification for wallet import
            const importProgress = this.notificationManager.showProgress('Adding wallet from private key...', 'info');
            importProgress.updateProgress(25, 'Validating private key...');
            
            const result = await this.walletCore.importFromPrivateKey(privateKey, password, walletName);
            
            importProgress.updateProgress(75, 'Saving wallet data...');
            await this.loadWalletList();
            
            importProgress.complete('Wallet added successfully!', true);
            
            // Show wallet added notification with address
            if (result && result.address) {
                this.notificationManager.walletAdded(result.address);
            }
            
            this.uiManager.clearInputs(['new-wallet-private-key', 'new-wallet-password-key', 'new-wallet-name-key']);
            
            // Show additional info notification
            this.notificationManager.show(
                'Wallet is now active. You can close settings and log in with this wallet.',
                'info',
                5000
            );

        } catch (error) {
            console.error('handleAddWalletFromPrivateKey: Error adding wallet from private key:', error);
            this.notificationManager.show('Failed to add wallet: ' + error.message, 'error');
        } finally {
            this.uiManager.enableButton('add-wallet-key');
        }
    }    async handleNetworkChange(networkKey) {
        try {
            console.log('Handling network change to:', networkKey);
            
            if (!this.networkCore) {
                throw new Error('NetworkCore not initialized');
            }
            
            if (!this.networkCore.switchNetwork) {
                throw new Error('NetworkCore.switchNetwork method not available');
            }
            
            // Get the current network before switching
            const previousNetwork = await this.networkCore.getCurrentNetwork();
            
            // Show progress notification for network switching
            const networkProgress = this.notificationManager.showProgress('Switching network...', 'info');
            networkProgress.updateProgress(50, 'Connecting to new network...');
            
            await this.networkCore.switchNetwork(networkKey);
            
            networkProgress.updateProgress(50, 'Loading tokens for new network...');
            // Reload tokens for the new network
            await this.tokenManager.loadTokensFromStorage();
            
            networkProgress.updateProgress(75, 'Updating wallet balance...');
            await this.updateBalance();
            
            // Update token balances for new network
            await this.updateTokenBalances();
            
            const currentNetwork = await this.networkCore.getCurrentNetwork();
            networkProgress.complete(`Connected to ${currentNetwork?.name || 'network'}`, true);
            
            // Show network switched notification
            if (previousNetwork && currentNetwork) {
                this.notificationManager.networkSwitched(previousNetwork.name, currentNetwork.name);
            }
            
            // Update all network select dropdowns to reflect the change
            const networkSelects = ['network-select', 'settings-network-select', 'footer-network-select'];
            networkSelects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select && select.value !== networkKey) {
                    select.value = networkKey;
                }
            });
            
        } catch (error) {
            console.error('Error switching network:', error);
            this.notificationManager.show(`Failed to switch network: ${error.message}`, 'error');
        }
    }    async showDashboard() {
        this.uiManager.showWalletDashboard();
        await this.updateBalance();
        this.uiManager.clearInputs();
        
        // Ensure tokens are loaded and displayed
        await this.tokenManager.loadDefaultTokens();
        await this.updateTokenBalances();
        
        // Pre-load token list in background for faster settings display
        setTimeout(() => {
            console.log('Pre-loading token list for settings');
            this.loadTokenList();
        }, 1000);
    }async updateBalance(showNotification = false) {
        try {
            const wallet = this.walletCore.getCurrentWallet();
            if (!wallet) return;

            let progressNotification = null;
            if (showNotification) {
                // Only show notification if explicitly requested
                progressNotification = this.notificationManager.showProgress('Refreshing wallet balance...', 'info');
            }

            const balance = await this.networkCore.getBalance(wallet.address);
            this.uiManager.updateWalletDisplay(wallet.address, balance);
            
            const currentNetwork = this.networkCore.getCurrentNetwork();
            const symbol = currentNetwork?.symbol || 'PLS';
            
            if (progressNotification) {
                // Complete progress with balance info (single notification)
                progressNotification.complete(`Balance updated: ${parseFloat(balance).toFixed(4)} ${symbol}`, true);
            }
            
            // Update token balances
            await this.updateTokenBalances(showNotification);
            
        } catch (error) {
            console.error('Error updating balance:', error);
            if (showNotification) {
                this.notificationManager.show('Failed to refresh wallet balance. Please try again.', 'error', 6000);
            }
        }
    }async updateTokenBalances(showNotification = false) {
        try {            const wallet = this.walletCore.getCurrentWallet();
            if (!wallet) return;

            let progressNotification = null;
            if (showNotification) {
                // Only show notification if explicitly requested
                progressNotification = this.notificationManager.showProgress('Refreshing token balances...', 'info');
            }

            // Debug: Check how many tokens are in the token manager
            const tokenListSize = this.tokenManager.getTokenList().size;
            console.log(`updateTokenBalances: Found ${tokenListSize} tokens in token manager`);

            const tokenBalances = await this.tokenManager.updateAllTokenBalances(wallet.address);
            
            // Debug: Check the token balances result
            console.log('updateTokenBalances: Token balances result:', tokenBalances);
            
            // Count tokens with non-zero balances
            let tokenCount = 0;
            for (const [address, tokenInfo] of tokenBalances) {
                if (parseFloat(tokenInfo.balance) > 0) {
                    tokenCount++;
                }
            }
              
            if (progressNotification) {
                // Complete progress with token count info (single notification)
                const message = tokenCount > 0 
                    ? `Token balances updated: ${tokenCount} token${tokenCount === 1 ? '' : 's'} with balance`
                    : `Token balances updated: ${tokenBalances.size} token${tokenBalances.size === 1 ? '' : 's'} added (none with balance)`;
                
                progressNotification.complete(message, true);
            }
            
            // Update token display in UI
            this.renderTokensInDashboard(tokenBalances);
            
            console.log('Token balances:', tokenBalances);
            
        } catch (error) {
            console.error('Error updating token balances:', error);
            if (showNotification) {
                this.notificationManager.show('Failed to refresh token balances', 'error', 6000);
            }
        }
    }    /**
     * Render tokens in the main wallet dashboard
     */
    renderTokensInDashboard(tokenBalances) {
        console.log('renderTokensInDashboard called with:', tokenBalances);
        
        const tokenListContainer = document.getElementById('token-list');
        if (!tokenListContainer) {
            console.error('Token list container not found in dashboard');
            return;
        }

        // Clear existing tokens except the no-tokens message
        const existingTokens = tokenListContainer.querySelectorAll('.token-item');
        console.log(`Clearing ${existingTokens.length} existing token elements`);
        existingTokens.forEach(token => token.remove());

        const noTokensMessage = tokenListContainer.querySelector('.no-tokens');
          // Filter tokens with balance > 0 or all tokens if user wants to see them
        const tokensToShow = [];
        for (const [address, tokenInfo] of tokenBalances) {
            // Show all added tokens, regardless of balance
            tokensToShow.push(tokenInfo);
        }        if (tokensToShow.length === 0) {
            console.log('No tokens to show, displaying no-tokens message');
            // Show no tokens message
            if (noTokensMessage) {
                noTokensMessage.style.display = 'block';
            }
        } else {
            console.log(`Showing ${tokensToShow.length} tokens:`);
            tokensToShow.forEach((token, index) => {
                console.log(`Token ${index + 1}: ${token.symbol} (${token.address}) - Balance: ${token.balance}`);
            });
            
            // Hide no tokens message
            if (noTokensMessage) {
                noTokensMessage.style.display = 'none';
            }

            // Create and append token elements
            tokensToShow.forEach(tokenInfo => {
                const tokenElement = this.createDashboardTokenElement(tokenInfo);
                console.log('Created token element for:', tokenInfo.symbol);
                tokenListContainer.appendChild(tokenElement);
            });
        }
        
        // If we have tokens, make sure the container is visible
        if (tokensToShow.length > 0) {
            const tokenContainer = document.getElementById('token-list-container');
            if (tokenContainer && tokenContainer.classList.contains('hidden')) {
                tokenContainer.classList.remove('hidden');
                // Update chevron to up arrow
                const chevron = document.querySelector('#toggle-tokens i');
                if (chevron) {
                    chevron.className = 'fas fa-chevron-up';
                }
            }
        }
        
        // Update the token header to show count (distinguish between total tokens and tokens with balance)
        const tokenHeader = document.getElementById('toggle-tokens');
        const tokenContainer = document.getElementById('token-list-container');
        
        if (tokenHeader) {
            const headerText = tokenHeader.querySelector('h4');
            if (headerText) {
                const tokensWithBalance = tokensToShow.filter(token => parseFloat(token.balance) > 0).length;
                if (tokensWithBalance > 0) {
                    headerText.innerHTML = `PRC-20 Tokens (${tokensWithBalance}/${tokensToShow.length} with balance) <i class="fas fa-chevron-down"></i>`;
                } else {
                    headerText.innerHTML = `PRC-20 Tokens (${tokensToShow.length} added) <i class="fas fa-chevron-down"></i>`;
                }
            }
            
            // Automatically expand token section if there are tokens
            if (tokenContainer && tokensToShow.length > 0) {
                tokenContainer.classList.remove('hidden');
                const chevron = tokenHeader.querySelector('i');
                if (chevron) {
                    chevron.className = 'fas fa-chevron-up';
                }
            }
        }
    }

    /**
     * Create a token element for the dashboard display
     */
    createDashboardTokenElement(tokenInfo) {
        const tokenItem = document.createElement('div');
        tokenItem.className = 'token-item';
        
        // Create token icon
        const tokenIcon = document.createElement('div');
        tokenIcon.className = 'token-icon';
        tokenIcon.textContent = tokenInfo.symbol ? tokenInfo.symbol.substring(0, 3).toUpperCase() : '?';
        
        // Create token details container
        const tokenDetails = document.createElement('div');
        tokenDetails.className = 'token-details';
        
        // Create token name/symbol
        const tokenName = document.createElement('span');
        tokenName.className = 'token-name';
        tokenName.textContent = `${tokenInfo.name || tokenInfo.symbol || 'Unknown'}`;
        
        // Create token balance
        const tokenBalance = document.createElement('span');
        tokenBalance.className = 'token-balance';
          // Format balance nicely
        const balance = parseFloat(tokenInfo.balance);
        if (balance > 0) {
            if (balance >= 1000000) {
                tokenBalance.textContent = `${(balance / 1000000).toFixed(2)}M ${tokenInfo.symbol}`;
            } else if (balance >= 1000) {
                tokenBalance.textContent = `${(balance / 1000).toFixed(2)}K ${tokenInfo.symbol}`;
            } else if (balance >= 1) {
                tokenBalance.textContent = `${balance.toFixed(2)} ${tokenInfo.symbol}`;
            } else {
                tokenBalance.textContent = `${balance.toFixed(6)} ${tokenInfo.symbol}`;
            }
            tokenBalance.style.color = '#000'; // Normal color for balance
        } else {
            tokenBalance.textContent = `0.00 ${tokenInfo.symbol}`;
            tokenBalance.style.color = '#666'; // Muted color for zero balance
        }
        
        tokenDetails.appendChild(tokenName);
        tokenDetails.appendChild(tokenBalance);
        
        tokenItem.appendChild(tokenIcon);
        tokenItem.appendChild(tokenDetails);
        
        // Add click handler for token send functionality
        tokenItem.addEventListener('click', async () => {
            console.log(`Clicked on token: ${tokenInfo.symbol} (${tokenInfo.address})`);
            await this.openTokenSendModal(tokenInfo);
        });        return tokenItem;
    }    /**
     * Handle closing the settings panel
     */
    handleSettingsClose() {
        this.uiManager.toggleSettings();
    }    /**
     * Handle opening the settings panel
     */
    async handleSettingsOpen() {
        console.log('Settings opened, loading all settings data...');
        
        // Load wallet list for settings
        console.log('Loading wallet list...');
        try {
            const wallets = await this.walletCore.getWalletList();
            const activeWalletId = await this.walletCore.getActiveWalletId();
            console.log('Settings: Retrieved wallets:', wallets);
            console.log('Settings: Active wallet ID:', activeWalletId);
            
            // Render the wallet list in settings
            this.uiManager.renderWalletListSettings(wallets, activeWalletId, this);
        } catch (error) {
            console.error('Error loading wallet list for settings:', error);
            this.uiManager.showStatus('Failed to load wallet list', 'error');
        }
        
        // Load token list
        console.log('Loading token list...');
        await this.loadTokenList();
        
        // Load connected sites
        console.log('Loading connected sites...');
        await this.loadConnectedSites();
        
        // Load contracts if section is open
        const contractSection = document.querySelector('details.settings-group summary');
        if (contractSection && contractSection.textContent.includes('Contract Interaction')) {
            await this.loadContractList();
        }
    }

    /**
     * Handle adding a custom token from the settings form
     */
    async handleAddCustomToken() {
        try {
            const addressInput = document.getElementById('new-token-address');
            const symbolInput = document.getElementById('new-token-symbol');
            const decimalsInput = document.getElementById('new-token-decimals');
            
            if (!addressInput || !symbolInput || !decimalsInput) {
                this.notificationManager.show('Token form elements not found', 'error');
                return;
            }

            const address = addressInput.value.trim();
            const symbol = symbolInput.value.trim();
            const decimals = parseInt(decimalsInput.value) || 18;

            if (!address) {
                this.notificationManager.show('Please enter a token contract address', 'error');
                return;
            }

            // Add the token using the existing handleAddToken method
            await this.handleAddToken(address, symbol || null, decimals);
            
            // Clear the form
            addressInput.value = '';
            symbolInput.value = '';
            decimalsInput.value = '18';
            
            // Refresh the token list in settings
            await this.loadTokenList();
            
        } catch (error) {
            console.error('Error adding custom token:', error);
            this.notificationManager.show('Failed to add token: ' + error.message, 'error');
        }
    }

    /**
     * Handle auto-detecting token information from contract address
     */
    async handleAutoDetectToken() {
        try {
            const addressInput = document.getElementById('new-token-address');
            
            if (!addressInput) {
                this.notificationManager.show('Token address input not found', 'error');
                return;
            }

            const address = addressInput.value.trim();
            
            if (!address) {
                this.notificationManager.show('Please enter a token contract address first', 'error');
                return;
            }

            if (!ethers.isAddress(address)) {
                this.notificationManager.show('Please enter a valid contract address', 'error');
                return;
            }

            // Show progress
            const progressNotification = this.notificationManager.showProgress('Auto-detecting token info...', 'info');

            try {
                // Use the token manager to get token info
                const provider = this.networkCore.getProvider();
                const contract = new ethers.Contract(address, this.tokenManager.getTokenABI(), provider);
                
                const [name, symbol, decimals] = await Promise.all([
                    contract.name(),
                    contract.symbol(),
                    contract.decimals()
                ]);

                // Fill in the form
                const symbolInput = document.getElementById('new-token-symbol');
                const decimalsInput = document.getElementById('new-token-decimals');
                
                if (symbolInput) symbolInput.value = symbol;
                if (decimalsInput) decimalsInput.value = decimals.toString();

                progressNotification.complete(`Auto-detected: ${name} (${symbol})`, true);
                
            } catch (error) {
                progressNotification.complete('Failed to auto-detect token info', false);
                throw error;
            }
            
        } catch (error) {
            console.error('Error auto-detecting token:', error);
            this.notificationManager.show('Failed to auto-detect token info: ' + error.message, 'error');
        }
    }

    /**
     * Load and display the token list in settings
     */    async loadTokenList() {
        const loadingElement = document.getElementById('token-list-loading');
        const noTokensElement = document.getElementById('no-tokens-message');
        
        try {
            console.log('loadTokenList: Starting to load token list');
            
            const tokenListContainer = document.getElementById('settings-token-list');
            
            if (!tokenListContainer) {
                console.error('Token list container not found in settings');
                return;
            }            // Show loading and hide no-tokens message
            if (loadingElement) {
                loadingElement.classList.remove('hidden');
                loadingElement.style.display = 'block'; // Force display
                console.log('loadTokenList: Showing loading spinner');
            }
            if (noTokensElement) {
                noTokensElement.classList.add('hidden');
                noTokensElement.style.display = 'none'; // Force hide
            }

            // Clear existing tokens except loading/no-tokens messages
            const existingTokens = tokenListContainer.querySelectorAll('.token-item');
            console.log(`loadTokenList: Clearing ${existingTokens.length} existing token elements`);
            existingTokens.forEach(token => token.remove());

            // Get token list from token manager
            const tokenList = this.tokenManager.getTokenList();
            console.log(`loadTokenList: Found ${tokenList.size} tokens in token manager`);
              if (tokenList.size === 0) {
                // Show no tokens message, hide loading
                if (loadingElement) {
                    loadingElement.classList.add('hidden');
                    loadingElement.style.display = 'none'; // Force hide
                    console.log('loadTokenList: Hiding loading spinner (no tokens)');
                }
                if (noTokensElement) {
                    noTokensElement.classList.remove('hidden');
                    noTokensElement.style.display = 'block'; // Force display
                    console.log('loadTokenList: Showing no-tokens message');
                }
                return;
            }

            // Create token elements for settings
            console.log('loadTokenList: Creating token elements for settings');
            for (const [address, tokenInfo] of tokenList) {
                const tokenElement = this.createSettingsTokenElement(tokenInfo);
                tokenListContainer.appendChild(tokenElement);
                console.log(`loadTokenList: Added token element for ${tokenInfo.symbol}`);
            }            // Hide loading, tokens are now displayed
            if (loadingElement) {
                loadingElement.classList.add('hidden');
                loadingElement.style.display = 'none'; // Force hide
                console.log('loadTokenList: Hiding loading spinner (tokens loaded)');
                console.log('loadTokenList: Loading element classes:', loadingElement.className);
                console.log('loadTokenList: Loading element style.display:', loadingElement.style.display);
            }
            
        } catch (error) {
            console.error('Error loading token list:', error);
              // Always hide loading spinner on error
            if (loadingElement) {
                loadingElement.classList.add('hidden');
                loadingElement.style.display = 'none'; // Force hide
                console.log('loadTokenList: Hiding loading spinner (error)');
            }
            
            this.notificationManager.show('Failed to load token list', 'error');
        }
    }

    /**
     * Create a token element for the settings token list
     */
    createSettingsTokenElement(tokenInfo) {
        const tokenItem = document.createElement('div');
        tokenItem.className = 'token-item';
        
        // Token icon
        const tokenIcon = document.createElement('div');
        tokenIcon.className = 'token-icon';
        tokenIcon.textContent = tokenInfo.symbol ? tokenInfo.symbol.substring(0, 3).toUpperCase() : '?';
        
        // Token details
        const tokenDetails = document.createElement('div');
        tokenDetails.className = 'token-details';
        
        const tokenName = document.createElement('div');
        tokenName.className = 'token-name';
        tokenName.textContent = `${tokenInfo.name || tokenInfo.symbol || 'Unknown'}`;
        
        const tokenAddress = document.createElement('div');
        tokenAddress.className = 'token-address';
        tokenAddress.textContent = tokenInfo.address;
        
        const tokenMeta = document.createElement('div');
        tokenMeta.className = 'token-meta';
        tokenMeta.textContent = `Decimals: ${tokenInfo.decimals}`;
        
        tokenDetails.appendChild(tokenName);
        tokenDetails.appendChild(tokenAddress);
        tokenDetails.appendChild(tokenMeta);
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-token-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.title = 'Remove token';
        removeBtn.addEventListener('click', async () => {
            if (confirm(`Remove ${tokenInfo.symbol || 'this token'} from your token list?`)) {
                await this.handleRemoveToken(tokenInfo.address);
                await this.loadTokenList(); // Refresh the list
            }
        });
        
        tokenItem.appendChild(tokenIcon);
        tokenItem.appendChild(tokenDetails);
        tokenItem.appendChild(removeBtn);
        
        return tokenItem;
    }
    
/**
     * Handle exporting private key for a wallet
     */
    async handleExportPrivateKey(walletId, walletAddress) {
        // First, ask for confirmation
        if (!confirm(`Are you sure you want to export the private key for wallet ${walletAddress.substring(0, 10)}...?\n\nWARNING: Keep your private key secure! Anyone with access to it can control your wallet.`)) {
            return;
        }
        
        // Ask for password
        const password = prompt('Please enter your wallet password to export the private key:');
        if (!password) {
            return;
        }
        
        try {
            // Use wallet core to export private key
            const privateKey = await this.walletCore.exportPrivateKey(walletId, password);
            
            // Display the private key in a modal
            this.showPrivateKeyModal(privateKey, walletAddress);
            
        } catch (error) {
            console.error('Error exporting private key:', error);
            if (error.message.includes('password') || error.message.includes('invalid')) {
                this.uiManager.showStatus('Incorrect password', 'error');
            } else {
                this.uiManager.showStatus('Failed to export private key', 'error');
            }
        }
    }

    /**
     * Show private key in a modal dialog
     */
    showPrivateKeyModal(privateKey, walletAddress) {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'modal-content large';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h2><i class="fas fa-key"></i> Private Key Export</h2>
            <p>Wallet: ${walletAddress}</p>
        `;
        modal.appendChild(modalHeader);
        
        // Security warning
        const warningDiv = document.createElement('div');
        warningDiv.className = 'modal-security-warning';
        warningDiv.innerHTML = `
            <strong>⚠️ SECURITY WARNING</strong>
            <ul>
                <li>Never share your private key with anyone</li>
                <li>Store it securely offline</li>
                <li>Anyone with this key can control your wallet</li>
                <li>Clear your clipboard after copying</li>
            </ul>
        `;
        modal.appendChild(warningDiv);
        
        // Info section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'modal-info-section';
        infoDiv.innerHTML = `
            <strong>Wallet Address:</strong>
            <div class="modal-address-display">${walletAddress}</div>
        `;
        modal.appendChild(infoDiv);
        
        // Private key container
        const keyContainer = document.createElement('div');
        keyContainer.className = 'modal-private-key-container';
        
        const keyLabel = document.createElement('strong');
        keyLabel.textContent = 'Private Key:';
        keyContainer.appendChild(keyLabel);
        
        const keyDisplay = document.createElement('div');
        keyDisplay.className = 'modal-private-key-display';
        keyDisplay.textContent = privateKey;
        keyContainer.appendChild(keyDisplay);
        
        modal.appendChild(keyContainer);
        
        // Buttons
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'modal-buttons';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'modal-button copy';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(privateKey).then(() => {
                this.uiManager.showStatus('Private key copied to clipboard', 'success');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard';
                }, 2000);
            }).catch(() => {
                this.uiManager.showStatus('Failed to copy to clipboard', 'error');
            });
        };
        buttonsDiv.appendChild(copyBtn);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-button secondary';
        closeBtn.innerHTML = '<i class="fas fa-times"></i> Close';
        closeBtn.onclick = () => {
            document.body.removeChild(modalOverlay);
        };
        buttonsDiv.appendChild(closeBtn);
        
        modal.appendChild(buttonsDiv);
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    /**
     * Handle switching to a different wallet
     */
    async handleSwitchWallet(walletId) {
        try {
            console.log('Switching to wallet:', walletId);
            
            // First check if we need to authenticate
            const isLoggedIn = this.authManager.isLoggedIn();
            if (!isLoggedIn) {
                this.notificationManager.show('Please login first to switch wallets', 'error');
                this.uiManager.showLoginSection();
                return;
            }
            
            // Show progress notification
            const progressNotification = this.notificationManager.showProgress('Switching wallet...', 'info');
            
            // Set the active wallet
            await this.walletCore.switchActiveWallet(walletId);
            
            progressNotification.updateProgress(50, 'Loading wallet data...');
            
            // Get the new active wallet
            const wallet = this.walletCore.getCurrentWallet();
            if (!wallet) {
                throw new Error('Failed to switch wallet');
            }
            
            // Update UI
            this.uiManager.updateWalletDisplay(wallet.address, '0');
            
            progressNotification.updateProgress(75, 'Refreshing balance...');
            
            // Update balance
            await this.updateBalance();
            
            progressNotification.complete('Wallet switched successfully', true);
            
            // Show dashboard
            this.showDashboard();
            
        } catch (error) {
            console.error('Error switching wallet:', error);
            this.notificationManager.show('Failed to switch wallet: ' + error.message, 'error');
        }
    }
    
    /**
     * Handle removing a wallet
     */
    async handleRemoveWallet(walletId) {
        try {
            console.log('Removing wallet:', walletId);
            
            // Get wallet info before removal
            const walletList = await this.walletCore.getWalletList();
            const walletToRemove = walletList.find(w => w.id === walletId);
            
            if (!walletToRemove) {
                throw new Error('Wallet not found');
            }
            
            // Confirm removal
            const confirmRemove = confirm(`Are you sure you want to remove wallet ${walletToRemove.address}?\n\nMake sure you have backed up your seed phrase or private key!`);
            
            if (!confirmRemove) {
                return;
            }
            
            // Show progress notification
            const progressNotification = this.notificationManager.showProgress('Removing wallet...', 'info');
            
            // Remove the wallet
            const success = await this.walletCore.removeWallet(walletId);
            
            if (!success) {
                throw new Error('Failed to remove wallet');
            }
            
            progressNotification.complete('Wallet removed successfully', true);
            
            // Show wallet removed notification
            this.notificationManager.walletRemoved(walletToRemove.address);
            
            // Reload wallet list
            await this.loadWalletList();
            
            // If this was the active wallet, show login section
            const currentWallet = this.walletCore.getCurrentWallet();
            if (!currentWallet) {
                this.uiManager.showLoginSection();
            }
            
        } catch (error) {
            console.error('Error removing wallet:', error);
            this.notificationManager.show('Failed to remove wallet: ' + error.message, 'error');
        }
    }
    
    /**
     * Load and display the wallet list
     */
    async loadWalletList() {
        try {
            const walletList = await this.walletCore.getWalletList();
            console.log('Loaded wallet list:', walletList);
            
            // Update wallet selector in login section
            const walletSelector = document.getElementById('wallet-selector');
            if (walletSelector) {
                walletSelector.innerHTML = '';
                
                if (walletList.length === 0) {
                    const option = document.createElement('option');
                    option.textContent = 'No wallets found';
                    option.disabled = true;
                    walletSelector.appendChild(option);
                } else {
                    walletList.forEach(wallet => {
                        const option = document.createElement('option');
                        option.value = wallet.id;
                        option.textContent = `${wallet.name || 'Wallet'} (${wallet.address.substring(0, 6)}...${wallet.address.substring(38)})`;
                        walletSelector.appendChild(option);
                    });
                }
            }
            
            // Update wallet list in settings if it's open
            const settingsPanel = document.getElementById('settings-section');
            if (settingsPanel && !settingsPanel.classList.contains('hidden')) {
                const activeWalletId = await this.walletCore.getActiveWalletId();
                this.uiManager.renderWalletListSettings(walletList, activeWalletId, this);
            }
            
        } catch (error) {
            console.error('Error loading wallet list:', error);
            this.notificationManager.show('Failed to load wallet list', 'error');
        }
    }

    /**
     * Handle adding a new contract
     */
    async handleAddContract() {
        try {
            const address = document.getElementById('new-contract-address')?.value?.trim();
            const name = document.getElementById('new-contract-name')?.value?.trim();
            const abi = document.getElementById('new-contract-abi')?.value?.trim();

            if (!address) {
                this.notificationManager.show('Please enter a contract address', 'error');
                return;
            }

            if (!abi) {
                this.notificationManager.show('Please enter the contract ABI', 'error');
                return;
            }

            // Validate address format
            if (!ethers.isAddress(address)) {
                this.notificationManager.show('Invalid contract address format', 'error');
                return;
            }

            // Validate ABI format
            try {
                JSON.parse(abi);
            } catch (e) {
                this.notificationManager.show('Invalid ABI format. Please paste valid JSON', 'error');
                return;
            }

            // Show progress
            const progressNotification = this.notificationManager.showProgress('Adding contract...', 'info');
            
            // Add the contract
            const contractInfo = await this.contractManager.addContract(address, name, abi);
            
            progressNotification.complete('Contract added successfully!', true);
            
            // Clear inputs
            this.uiManager.clearInputs(['new-contract-address', 'new-contract-name', 'new-contract-abi']);
            
            // Reload contract list
            await this.loadContractList();
            
        } catch (error) {
            console.error('Error adding contract:', error);
            this.notificationManager.show('Failed to add contract: ' + error.message, 'error');
        }
    }

    /**
     * Load and display contract list
     */
    async loadContractList() {
        try {
            const contracts = this.contractManager.getAllContracts();
            const listContainer = document.getElementById('contract-list');
            
            if (!listContainer) return;

            if (contracts.length === 0) {
                listContainer.innerHTML = `
                    <div class="no-contracts" id="no-contracts-message">
                        <p>No contracts added yet</p>
                        <small>Add smart contract addresses and ABIs to interact with them.</small>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = '';
            
            contracts.forEach(contract => {
                const contractElement = this.createContractElement(contract);
                listContainer.appendChild(contractElement);
            });
            
        } catch (error) {
            console.error('Error loading contract list:', error);
            this.notificationManager.show('Failed to load contracts', 'error');
        }
    }

    /**
     * Create a contract element for the list
     */
    createContractElement(contract) {
        const div = document.createElement('div');
        div.className = 'contract-item';
        div.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.3s;
        `;

        const infoDiv = document.createElement('div');
        infoDiv.style.flex = '1';
        
        const nameDiv = document.createElement('div');
        nameDiv.style.fontWeight = 'bold';
        nameDiv.textContent = contract.name;
        
        const addressDiv = document.createElement('div');
        addressDiv.style.cssText = 'font-size: 0.85rem; color: #666; font-family: monospace;';
        addressDiv.textContent = `${contract.address.substring(0, 6)}...${contract.address.substring(38)}`;
        
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(addressDiv);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'display: flex; gap: 10px;';
        
        // Interact button
        const interactBtn = document.createElement('button');
        interactBtn.className = 'secondary-btn';
        interactBtn.style.cssText = 'padding: 6px 12px; font-size: 0.85rem;';
        interactBtn.innerHTML = '<i class="fas fa-play"></i> Interact';
        interactBtn.onclick = (e) => {
            e.stopPropagation();
            this.openContractInteraction(contract.address);
        };
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'danger-btn';
        removeBtn.style.cssText = 'padding: 6px 12px; font-size: 0.85rem;';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.onclick = async (e) => {
            e.stopPropagation();
            if (confirm(`Remove contract ${contract.name}?`)) {
                await this.contractManager.removeContract(contract.address);
                await this.loadContractList();
                this.notificationManager.show('Contract removed', 'info');
            }
        };
        
        actionsDiv.appendChild(interactBtn);
        actionsDiv.appendChild(removeBtn);
        
        div.appendChild(infoDiv);
        div.appendChild(actionsDiv);
        
        // Add hover effect
        div.onmouseenter = () => {
            div.style.borderColor = '#6b413f';
            div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        };
        div.onmouseleave = () => {
            div.style.borderColor = '#ddd';
            div.style.boxShadow = 'none';
        };
        
        return div;
    }

    /**
     * Open contract interaction window
     */
    openContractInteraction(contractAddress) {
        const url = chrome.runtime.getURL(`contract-interaction.html?address=${contractAddress}`);
        chrome.windows.create({
            url: url,
            type: 'popup',
            width: 800,
            height: 600
        });
    }

    /**
     * Handle settings opening to load contracts
     */
    
    // Connected Sites Management
    async loadConnectedSites() {
        console.log('Loading connected sites...');
        chrome.runtime.sendMessage({ action: 'getConnectedSites' }, (response) => {
            if (response && response.success) {
                console.log('Connected sites loaded:', response.sites);
                this.displayConnectedSites(response.sites);
            } else {
                console.error('Failed to load connected sites:', response);
                // Show empty state if there's an error
                this.displayConnectedSites({});
            }
        });
    }
    
    displayConnectedSites(sites) {
        const sitesList = document.getElementById('connected-sites-list');
        const loadingDiv = document.getElementById('connected-sites-loading');
        const noSitesDiv = document.getElementById('no-connected-sites');
        
        if (!sitesList) return;
        
        // Hide loading
        if (loadingDiv) {
            loadingDiv.classList.add('hidden');
        }
        
        // Clear existing content in the list
        sitesList.innerHTML = '';
        
        if (!sites || Object.keys(sites).length === 0) {
            // Show no sites message
            if (noSitesDiv) {
                noSitesDiv.classList.remove('hidden');
            }
            return;
        }
        
        // Hide no sites message
        if (noSitesDiv) {
            noSitesDiv.classList.add('hidden');
        }
        
        Object.entries(sites).forEach(([origin, siteData]) => {
            const siteItem = document.createElement('div');
            siteItem.className = 'connected-site-item';
            siteItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                margin-bottom: 8px;
            `;
            
            const siteInfo = document.createElement('div');
            siteInfo.className = 'site-info';
            siteInfo.style.flex = '1';
            
            const originDiv = document.createElement('div');
            originDiv.className = 'site-origin';
            originDiv.style.cssText = 'font-weight: bold; margin-bottom: 4px;';
            originDiv.textContent = origin;
            siteInfo.appendChild(originDiv);
            
            const addressDiv = document.createElement('div');
            addressDiv.className = 'site-address';
            addressDiv.style.cssText = 'font-size: 0.85rem; color: #666; font-family: monospace;';
            const address = siteData.walletAddress || siteData.address || 'Unknown';
            addressDiv.textContent = `${address.substring(0, 6)}...${address.substring(38)}`;
            siteInfo.appendChild(addressDiv);
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'site-date';
            dateDiv.style.cssText = 'font-size: 0.8rem; color: #888; margin-top: 4px;';
            const connectedTime = siteData.connectedAt || siteData.dateConnected || Date.now();
            dateDiv.textContent = `Connected: ${new Date(connectedTime).toLocaleDateString()}`;
            siteInfo.appendChild(dateDiv);
            
            // Show network if available
            if (siteData.networkName || siteData.chainId) {
                const networkDiv = document.createElement('div');
                networkDiv.className = 'site-network';
                networkDiv.style.cssText = 'font-size: 0.8rem; color: #666; margin-top: 2px;';
                networkDiv.textContent = `Network: ${siteData.networkName || `Chain ID ${siteData.chainId}`}`;
                siteInfo.appendChild(networkDiv);
            }
            
            siteItem.appendChild(siteInfo);
            
            // Create disconnect button
            const disconnectBtn = document.createElement('button');
            disconnectBtn.className = 'disconnect-site-btn danger-btn';
            disconnectBtn.style.cssText = 'padding: 6px 12px; font-size: 0.85rem;';
            disconnectBtn.innerHTML = '<i class="fas fa-unlink"></i> Disconnect';
            disconnectBtn.onclick = () => this.disconnectSite(origin);
            siteItem.appendChild(disconnectBtn);
            
            sitesList.appendChild(siteItem);
        });
    }
    
    async disconnectSite(origin) {
        if (!confirm(`Disconnect from ${origin}?`)) {
            return;
        }
        
        chrome.runtime.sendMessage({ 
            action: 'disconnectSite', 
            origin: origin 
        }, (response) => {
            if (response && response.success) {
                this.loadConnectedSites(); // Reload the list
                NotificationCore.show(`Disconnected from ${origin}`, 'success');
            } else {
                NotificationCore.show('Failed to disconnect site.', 'error');
            }
        });
    }
    
    async disconnectAllSites() {
        if (!confirm('Disconnect from all connected sites? This action cannot be undone.')) {
            return;
        }
        
        chrome.runtime.sendMessage({ action: 'disconnectAllSites' }, (response) => {
            if (response && response.success) {
                this.loadConnectedSites(); // Reload the list
                NotificationCore.show('Disconnected from all sites.', 'success');
            } else {
                NotificationCore.show('Failed to disconnect all sites.', 'error');
            }
        });
    }
    
    async loadTokenList() {
        try {
            // Ensure tokens are loaded from storage first
            await this.tokenManager.loadTokensFromStorage();
            
            const tokens = await this.tokenManager.getAllTokens();
            const tokenList = document.getElementById('settings-token-list');
            
            if (!tokenList) return;
            
            tokenList.innerHTML = '';
            
            if (tokens.length === 0) {
                tokenList.innerHTML = '<div class="no-tokens">No custom tokens added yet.</div>';
                return;
            }
            
            tokens.forEach(token => {
                const tokenElement = this.createTokenElement(token);
                tokenList.appendChild(tokenElement);
            });
            
        } catch (error) {
            console.error('Error loading token list:', error);
        }
    }
    
    createTokenElement(token) {
        const tokenItem = document.createElement('div');
        tokenItem.className = 'token-item';
        tokenItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 8px;
        `;
        
        const tokenInfo = document.createElement('div');
        tokenInfo.className = 'token-info';
        tokenInfo.style.cssText = 'display: flex; align-items: center; gap: 12px;';
        
        // Token icon or placeholder
        if (token.image) {
            const tokenIcon = document.createElement('img');
            tokenIcon.src = token.image;
            tokenIcon.alt = token.symbol;
            tokenIcon.className = 'token-icon';
            tokenIcon.style.cssText = 'width: 32px; height: 32px; border-radius: 50%;';
            tokenInfo.appendChild(tokenIcon);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'token-icon-placeholder';
            placeholder.style.cssText = `
                width: 32px; 
                height: 32px; 
                border-radius: 50%; 
                background: #f0f0f0; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-weight: bold;
                color: #666;
            `;
            placeholder.textContent = token.symbol.charAt(0);
            tokenInfo.appendChild(placeholder);
        }
        
        // Token details
        const tokenDetails = document.createElement('div');
        tokenDetails.className = 'token-details';
        
        const tokenName = document.createElement('div');
        tokenName.style.fontWeight = 'bold';
        tokenName.textContent = token.name;
        
        const tokenSymbol = document.createElement('div');
        tokenSymbol.style.cssText = 'font-size: 0.85rem; color: #666;';
        tokenSymbol.textContent = `${token.symbol} • ${token.decimals} decimals`;
        
        tokenDetails.appendChild(tokenName);
        tokenDetails.appendChild(tokenSymbol);
        tokenInfo.appendChild(tokenDetails);
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'danger-btn';
        removeBtn.style.cssText = 'padding: 6px 12px; font-size: 0.85rem;';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.onclick = async () => {
            if (confirm(`Remove ${token.name} (${token.symbol})?`)) {
                await this.tokenManager.removeToken(token.address);
                await this.loadTokenList();
                NotificationCore.show('Token removed', 'info');
            }
        };
        
        tokenItem.appendChild(tokenInfo);
        tokenItem.appendChild(removeBtn);
        
        return tokenItem;
    }

    /**
     * Open token send modal
     */
    async openTokenSendModal(tokenInfo) {
        console.log('Opening send modal for token:', tokenInfo);
        
        // Wait for modal to load if it's not ready yet
        let modal = document.getElementById('send-token-modal');
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!modal && attempts < maxAttempts) {
            console.log(`Modal not loaded yet, attempt ${attempts + 1}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, 200));
            modal = document.getElementById('send-token-modal');
            attempts++;
        }
        
        if (!modal) {
            console.error('Send token modal still not found after', attempts, 'attempts');
            // Try to load it manually
            try {
                const response = await fetch(chrome.runtime.getURL('send-token-modal.html'));
                const html = await response.text();
                const container = document.getElementById('send-token-modal-container');
                if (container) {
                    container.innerHTML = html;
                    console.log('Manually loaded send token modal');
                    modal = document.getElementById('send-token-modal');
                }
            } catch (error) {
                console.error('Failed to manually load modal:', error);
            }
            
            if (!modal) {
                this.notificationManager.show('Unable to open send dialog. Please refresh and try again.', 'error');
                return;
            }
        }
        
        // Reset form
        this.resetTokenSendForm();
        
        // Update modal with token info
        document.getElementById('modal-token-symbol').textContent = tokenInfo.symbol;
        document.getElementById('modal-token-symbol-amount').textContent = tokenInfo.symbol;
        document.getElementById('modal-token-icon').textContent = tokenInfo.symbol.substring(0, 3).toUpperCase();
        document.getElementById('modal-token-balance').textContent = tokenInfo.balance || '0.00';
        
        // Store current token info for later use
        this.currentSendToken = tokenInfo;
        
        // Show modal
        modal.classList.remove('hidden');
        console.log('Modal shown, classes:', modal.className);
        console.log('Modal computed style display:', window.getComputedStyle(modal).display);
        console.log('Modal children:', modal.children.length);
        
        // Set up event listeners if not already set
        this.setupTokenSendModalListeners();
        
        // Estimate gas
        this.estimateTokenSendGas();
    }
    
    /**
     * Set up token send modal event listeners
     */
    setupTokenSendModalListeners() {
        // Only set up once
        if (this.tokenSendListenersSetup) return;
        
        const modal = document.getElementById('send-token-modal');
        const overlay = modal.querySelector('.modal-overlay');
        const closeBtn = document.getElementById('close-send-token-modal');
        const cancelBtn = document.getElementById('cancel-token-send');
        const confirmBtn = document.getElementById('confirm-token-send');
        const maxBtn = document.getElementById('token-send-max');
        const recipientInput = document.getElementById('token-recipient-address');
        const amountInput = document.getElementById('token-send-amount');
        
        // Close modal handlers
        const closeModal = () => {
            modal.classList.add('hidden');
            this.resetTokenSendForm();
        };
        
        overlay.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Max button
        maxBtn.addEventListener('click', () => {
            if (this.currentSendToken) {
                amountInput.value = this.currentSendToken.balance || '0';
                this.updateTokenSendSummary();
            }
        });
        
        // Input validation
        recipientInput.addEventListener('input', () => {
            this.validateTokenSendForm();
            this.updateTokenSendSummary();
        });
        
        amountInput.addEventListener('input', () => {
            this.validateTokenSendForm();
            this.updateTokenSendSummary();
        });
        
        // Confirm send
        confirmBtn.addEventListener('click', async () => {
            await this.handleTokenSendConfirm();
        });
        
        this.tokenSendListenersSetup = true;
    }
    
    /**
     * Reset token send form
     */
    resetTokenSendForm() {
        document.getElementById('token-recipient-address').value = '';
        document.getElementById('token-send-amount').value = '';
        document.getElementById('confirm-token-send').disabled = true;
        document.getElementById('token-send-summary').classList.add('hidden');
        document.getElementById('token-gas-estimate').textContent = 'Calculating...';
    }
    
    /**
     * Validate token send form
     */
    validateTokenSendForm() {
        const recipientInput = document.getElementById('token-recipient-address');
        const amountInput = document.getElementById('token-send-amount');
        const confirmBtn = document.getElementById('confirm-token-send');
        
        const recipient = recipientInput.value.trim();
        const amount = amountInput.value.trim();
        
        let isValid = true;
        
        // Validate recipient address
        if (!recipient || !ethers.isAddress(recipient)) {
            isValid = false;
        }
        
        // Validate amount
        const amountNum = parseFloat(amount);
        if (!amount || isNaN(amountNum) || amountNum <= 0) {
            isValid = false;
        }
        
        // Check if amount exceeds balance
        if (this.currentSendToken && amountNum > parseFloat(this.currentSendToken.balance)) {
            isValid = false;
        }
        
        confirmBtn.disabled = !isValid;
        return isValid;
    }
    
    /**
     * Update token send summary
     */
    updateTokenSendSummary() {
        const recipient = document.getElementById('token-recipient-address').value.trim();
        const amount = document.getElementById('token-send-amount').value.trim();
        const summary = document.getElementById('token-send-summary');
        
        if (recipient && amount && ethers.isAddress(recipient) && parseFloat(amount) > 0) {
            document.getElementById('summary-amount').textContent = 
                `${amount} ${this.currentSendToken.symbol}`;
            document.getElementById('summary-recipient').textContent = 
                `${recipient.substring(0, 6)}...${recipient.substring(38)}`;
            summary.classList.remove('hidden');
        } else {
            summary.classList.add('hidden');
        }
    }
    
    /**
     * Estimate gas for token send
     */
    async estimateTokenSendGas() {
        try {
            const gasEstimateEl = document.getElementById('token-gas-estimate');
            gasEstimateEl.textContent = 'Calculating...';
            
            // Get current gas price
            const provider = this.networkCore.getProvider();
            const feeData = await provider.getFeeData();
            const gasPrice = feeData.gasPrice;
            
            // Estimate gas for token transfer (usually around 65,000)
            const estimatedGas = 65000n;
            const gasCost = gasPrice * estimatedGas;
            
            const network = this.networkCore.getCurrentNetwork();
            const symbol = network?.symbol || 'PLS';
            
            gasEstimateEl.textContent = `~${ethers.formatEther(gasCost)} ${symbol}`;
        } catch (error) {
            console.error('Error estimating gas:', error);
            document.getElementById('token-gas-estimate').textContent = 'Unable to estimate';
        }
    }
    
    /**
     * Handle token send confirmation
     */
    async handleTokenSendConfirm() {
        const recipient = document.getElementById('token-recipient-address').value.trim();
        const amount = document.getElementById('token-send-amount').value.trim();
        
        if (!this.validateTokenSendForm()) {
            this.notificationManager.show('Please check your input', 'error');
            return;
        }
        
        // Close modal
        document.getElementById('send-token-modal').classList.add('hidden');
        
        // Send token using existing method
        await this.handleSendToken(
            this.currentSendToken.address,
            recipient,
            amount
        );
        
        // Reset form
        this.resetTokenSendForm();
    }

    // ...existing code...
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.app = new HeartWalletApp();
        await window.app.initialize();
    } catch (error) {
        console.error('Failed to initialize Heart Wallet:', error);
    }
});

// Handle any connection events from content script
chrome.runtime.onMessage?.addListener((message, sender, sendResponse) => {
    if (message.type === 'WALLET_REQUEST' && window.app) {
        // Handle wallet connection requests
        console.log('Wallet request received:', message);
        sendResponse({ success: true });
    }
});
