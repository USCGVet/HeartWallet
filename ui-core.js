// UI Core Module - Handles UI management and updates
class UIManager {
    constructor() {
        this.elements = {};
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.cacheElements();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    cacheElements() {
        // Main UI elements
        this.elements = {
            // Wallet setup
            walletSetup: document.getElementById('wallet-setup'),
            createWalletBtn: document.getElementById('create-wallet'),
            importWalletBtn: document.getElementById('import-wallet'),
            createWalletForm: document.getElementById('create-wallet-form'),
            importWalletForm: document.getElementById('import-wallet-form'),
            
            // Wallet dashboard
            walletDashboard: document.getElementById('wallet-dashboard'),
            walletAddress: document.getElementById('wallet-address'),
            walletBalance: document.getElementById('wallet-balance'),
            
            // Forms and inputs
            newPassword: document.getElementById('new-password'),
            confirmPassword: document.getElementById('confirm-password'),
            generateWalletBtn: document.getElementById('generate-wallet'),
            importPassword: document.getElementById('import-password'),
            seedPhraseInput: document.getElementById('seed-phrase'),
            privateKeyInput: document.getElementById('private-key'),
            importSeedBtn: document.getElementById('import-seed'),
            importKeyBtn: document.getElementById('import-key'),
            
            // Login
            loginSection: document.getElementById('login-section'),
            loginPassword: document.getElementById('login-password'),
            loginBtn: document.getElementById('login-btn'),
              // Send transaction
            sendSection: document.getElementById('send-section'),
            recipientAddress: document.getElementById('recipient-address'),
            sendAmount: document.getElementById('send-amount'),
            sendBtn: document.getElementById('send-transaction'),
              // Network and settings
            networkSelect: document.getElementById('network-select'),
            settingsBtn: document.getElementById('settings-btn'),
            settingsPanel: document.getElementById('settings-section'),
            
            // Seed phrase display
            seedPhraseContainer: document.getElementById('seed-phrase-container'),
            seedPhraseDisplay: document.getElementById('seed-phrase-display'),
            copySeedBtn: document.getElementById('copy-seed'),
            
            // Status and indicators
            connectionIndicator: document.getElementById('connection-indicator'),
            statusMessage: document.getElementById('status-message')
        };
    }

    setupEventListeners() {
        // Toggle forms
        if (this.elements.createWalletBtn) {
            this.elements.createWalletBtn.addEventListener('click', () => this.showCreateForm());
        }
        if (this.elements.importWalletBtn) {
            this.elements.importWalletBtn.addEventListener('click', () => this.showImportForm());
        }
        
        // Settings toggle
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.toggleSettings());
        }
          // Copy functionality
        if (this.elements.copySeedBtn) {
            this.elements.copySeedBtn.addEventListener('click', () => this.copySeedPhrase());
        }
        
        // Setup address input click-to-copy functionality
        this.setupAddressInputClickToCopy();
    }

    showCreateForm() {
        this.hideAllForms();
        if (this.elements.createWalletForm) {
            this.elements.createWalletForm.classList.remove('hidden');
        }
    }

    showImportForm() {
        this.hideAllForms();
        if (this.elements.importWalletForm) {
            this.elements.importWalletForm.classList.remove('hidden');
        }
    }

    hideAllForms() {
        const forms = ['createWalletForm', 'importWalletForm'];
        forms.forEach(form => {
            if (this.elements[form]) {
                this.elements[form].classList.add('hidden');
            }
        });
    }

    showWalletSetup() {
        this.hideAllSections();
        if (this.elements.walletSetup) {
            this.elements.walletSetup.classList.remove('hidden');
        }
    }    showWalletDashboard() {
        console.log('Showing wallet dashboard');
        this.hideAllSections();
        if (this.elements.walletDashboard) {
            this.elements.walletDashboard.classList.remove('hidden');
            console.log('Wallet dashboard is now visible');
        } else {
            console.error('Wallet dashboard element not found');
        }
    }async showLoginSection() {
        this.hideAllSections();
        if (this.elements.loginSection) {
            this.elements.loginSection.classList.remove('hidden');
            
            // Populate wallet selector if there are multiple wallets
            if (window.app && window.app.walletCore) {
                try {
                    const wallets = await window.app.walletCore.getWalletList();
                    const activeWalletId = await window.app.walletCore.getActiveWalletId();
                    await this.populateWalletSelector(wallets, activeWalletId);
                } catch (error) {
                    console.error('Error populating wallet selector:', error);
                }
            }
        }
    }

    hideAllSections() {
        const sections = ['walletSetup', 'walletDashboard', 'loginSection'];
        sections.forEach(section => {
            if (this.elements[section]) {
                this.elements[section].classList.add('hidden');
            }
        });
    }    updateWalletDisplay(address, balance) {
        if (this.elements.walletAddress) {
            this.elements.walletAddress.textContent = this.formatAddress(address);
            // Make the main wallet address clickable
            this.makeAddressClickable(this.elements.walletAddress, address);
        }
        if (this.elements.walletBalance) {
            this.elements.walletBalance.textContent = `${parseFloat(balance).toFixed(4)} PLS`;
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    displaySeedPhrase(seedPhrase) {
        if (this.elements.seedPhraseDisplay) {
            this.elements.seedPhraseDisplay.textContent = seedPhrase;
        }
        if (this.elements.seedPhraseContainer) {
            this.elements.seedPhraseContainer.classList.remove('hidden');
        }
    }

    copySeedPhrase() {
        if (this.elements.seedPhraseDisplay) {
            const seedPhrase = this.elements.seedPhraseDisplay.textContent;
            navigator.clipboard.writeText(seedPhrase).then(() => {
                this.showStatus('Seed phrase copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Failed to copy seed phrase:', err);
                this.showStatus('Failed to copy seed phrase', 'error');
            });
        }
    }

    // Add utility function to copy address to clipboard
    copyAddress(address) {
        navigator.clipboard.writeText(address).then(() => {
            this.showStatus('Address copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy address:', err);
            this.showStatus('Failed to copy address', 'error');
        });
    }    // Add utility function to make address elements clickable
    makeAddressClickable(element, fullAddress) {
        element.className += ' clickable-address';
        element.title = `${fullAddress} (click to copy)`;
        element.addEventListener('click', () => {
            this.copyAddress(fullAddress);
        });
    }    // Add utility function to create clickable transaction hash
    createClickableHash(hash, displayText = null) {
        const hashElement = document.createElement('span');
        hashElement.textContent = displayText || hash;
        hashElement.className = 'clickable-hash';
        hashElement.title = 'Click to copy transaction hash';
        hashElement.addEventListener('click', () => {
            this.copyAddress(hash);
        });
        return hashElement;
    }    // Add utility function to create clickable address element
    createClickableAddress(address, displayText = null) {
        const addressElement = document.createElement('span');
        addressElement.textContent = displayText || this.formatAddress(address);
        addressElement.className = 'clickable-address';
        addressElement.title = `${address} (click to copy)`;
        addressElement.addEventListener('click', () => {
            this.copyAddress(address);
        });
        return addressElement;
    }

    toggleSettings() {
        if (this.elements.settingsPanel) {
            this.elements.settingsPanel.classList.toggle('hidden');
        }
    }    updateConnectionIndicator(isConnected, networkName = '') {
        if (this.elements.connectionIndicator) {
            this.elements.connectionIndicator.className = isConnected ? 
                'connection-indicator connection-indicator-connected' : 
                'connection-indicator connection-indicator-disconnected';
            this.elements.connectionIndicator.title = isConnected ? 
                `Connected to ${networkName || 'network'}` : 
                'Disconnected';
        }
    }

    updateNetworkDisplay(network) {
        // Update network selectors
        const selectors = ['network-select', 'settings-network-select', 'footer-network-select'];
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            if (select) {
                select.value = network.key || Object.keys(Networks).find(key => Networks[key] === network);
            }
        });
    }    showStatus(message, type = 'info', allowHTML = false) {
        if (this.elements.statusMessage) {
            if (allowHTML) {
                this.elements.statusMessage.innerHTML = message;
            } else {
                this.elements.statusMessage.textContent = message;
            }
            this.elements.statusMessage.className = `status-message ${type}`;
            this.elements.statusMessage.classList.remove('hidden');
            
            setTimeout(() => {
                this.elements.statusMessage.classList.add('hidden');
            }, 5000);
        } else {
            // Fallback to console if no status element
            console.log(`Status (${type}): ${message}`);
        }
    }    clearInputs(fieldIds = null) {
        if (fieldIds && Array.isArray(fieldIds)) {
            // Clear specific fields by their IDs
            fieldIds.forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element) {
                    element.value = '';
                }
            });
        } else {
            // Clear predefined inputs
            const inputs = [
                'newPassword', 'confirmPassword', 'importPassword', 
                'seedPhraseInput', 'privateKeyInput', 'loginPassword',
                'recipientAddress', 'sendAmount'
            ];
            
            inputs.forEach(inputName => {
                if (this.elements[inputName]) {
                    this.elements[inputName].value = '';
                }
            });
        }
    }    enableButton(buttonName) {
        const button = this.elements[buttonName] || document.getElementById(buttonName);
        if (button) {
            button.disabled = false;
        } else {
            // Only warn for buttons that should exist
            const criticalButtons = ['send-transaction', 'send-btn', 'refresh-balance', 'settings-btn'];
            if (criticalButtons.includes(buttonName)) {
                console.warn(`Critical button not found: ${buttonName}`);
            }
        }
    }

    disableButton(buttonName) {
        const button = this.elements[buttonName] || document.getElementById(buttonName);
        if (button) {
            button.disabled = true;
        } else {
            // Only warn for buttons that should exist
            const criticalButtons = ['send-transaction', 'send-btn', 'refresh-balance', 'settings-btn'];
            if (criticalButtons.includes(buttonName)) {
                console.warn(`Critical button not found: ${buttonName}`);
            }
        }
    }renderWalletListSettings(wallets, activeWalletId, appInstance) {
        console.log("=== RENDERING WALLET LIST IN SETTINGS ===");
        console.log("renderWalletListSettings: Received wallets:", wallets);
        console.log("renderWalletListSettings: Active wallet ID:", activeWalletId);
        
        const containerId = 'wallet-list'; // Fixed to match actual HTML ID
        const listContainer = document.getElementById(containerId);

        if (!listContainer) {
            console.error(`UI Error: Wallet list container with ID '${containerId}' not found.`);
            this.showStatus("UI error: Cannot display wallet list.", "error");
            return;
        }

        listContainer.innerHTML = ''; // Clear previous list

        if (!wallets || wallets.length === 0) {
            const noWalletsMessage = document.createElement('p');
            noWalletsMessage.textContent = 'No wallets have been added yet.';
            noWalletsMessage.className = 'no-wallets-message'; // Add a class for styling
            listContainer.appendChild(noWalletsMessage);
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'wallet-list'; // Add a class for styling the list

        wallets.forEach(wallet => {
            const li = document.createElement('li');
            li.className = 'wallet-list-item';
            if (wallet.id === activeWalletId) {
                li.classList.add('active-wallet');
            }

            const walletInfoDiv = document.createElement('div');
            walletInfoDiv.className = 'wallet-item-info';            const nameSpan = document.createElement('span');
            nameSpan.className = 'wallet-item-name';
            nameSpan.textContent = wallet.name || 'Unnamed Wallet';
            if (wallet.id === activeWalletId) {
                // Create a safe active badge element
                const activeBadge = document.createElement('span');
                activeBadge.className = 'active-badge';
                activeBadge.textContent = 'Active';
                nameSpan.appendChild(document.createTextNode(' '));
                nameSpan.appendChild(activeBadge);
            }const addressSpan = document.createElement('span');
            addressSpan.className = 'wallet-item-address';
            addressSpan.textContent = wallet.address ? `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}` : 'Address not available';
            addressSpan.title = wallet.address || '';
            
            // Make wallet address clickable if available
            if (wallet.address) {
                this.makeAddressClickable(addressSpan, wallet.address);
            }


            walletInfoDiv.appendChild(nameSpan);
            walletInfoDiv.appendChild(addressSpan);
            li.appendChild(walletInfoDiv);            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'wallet-item-actions';

            // Export Private Key Button
            const exportButton = document.createElement('button');
            exportButton.innerHTML = '🔑'; // Key symbol
            exportButton.className = 'button-export-key'; // Add a class for styling
            exportButton.title = 'Export private key';
            exportButton.addEventListener('click', async () => {
                if (appInstance && appInstance.handleExportPrivateKey) {
                    await appInstance.handleExportPrivateKey(wallet.id, wallet.address);
                }
            });
            actionsDiv.appendChild(exportButton);

            if (wallet.id !== activeWalletId) {                const switchButton = document.createElement('button');
                switchButton.innerHTML = '⇄'; // Switch symbol
                switchButton.className = 'button-switch-wallet'; // Add a class for styling
                switchButton.title = 'Switch to this wallet';
                switchButton.addEventListener('click', async () => {
                    if (appInstance && appInstance.handleSwitchWallet) {
                        await appInstance.handleSwitchWallet(wallet.id);
                    }
                });
                actionsDiv.appendChild(switchButton);
            }            const removeButton = document.createElement('button');
            removeButton.innerHTML = '🗑️'; // Trash can symbol
            removeButton.className = 'button-remove-wallet button-danger'; // Add classes for styling
            removeButton.title = 'Remove this wallet';
            removeButton.addEventListener('click', async () => {
                // It's good practice to confirm removal
                if (confirm(`Are you sure you want to remove "${wallet.name || wallet.id}"? This action cannot be undone.`)) {
                    if (appInstance && appInstance.handleRemoveWallet) {
                        await appInstance.handleRemoveWallet(wallet.id);
                    }
                }
            });
            actionsDiv.appendChild(removeButton);

            li.appendChild(actionsDiv);
            ul.appendChild(li);
        });

        listContainer.appendChild(ul);
    }

    async populateWalletSelector(wallets, activeWalletId) {
        const selector = document.getElementById('wallet-selector');
        if (!selector) {
            console.warn('Wallet selector not found in login form');
            return;
        }

        selector.innerHTML = ''; // Clear existing options

        if (!wallets || wallets.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No wallets available';
            option.disabled = true;
            selector.appendChild(option);
            return;
        }

        wallets.forEach(wallet => {
            const option = document.createElement('option');
            option.value = wallet.id;
            option.textContent = wallet.name || `Wallet ${wallet.address.substring(0, 8)}...`;
            if (wallet.id === activeWalletId) {
                option.selected = true;
            }
            selector.appendChild(option);
        });

        // Add event listener for wallet selection changes
        selector.addEventListener('change', async (e) => {
            const selectedWalletId = e.target.value;
            if (selectedWalletId && window.app && window.app.handleWalletSelectionChange) {
                await window.app.handleWalletSelectionChange(selectedWalletId);
            }
        });
    }

    // Add method to render transaction history with clickable elements
    renderTransactionHistory(transactions) {
        const transactionsList = document.getElementById('transactions-list');
        if (!transactionsList) return;

        transactionsList.innerHTML = '';

        if (!transactions || transactions.length === 0) {
            const noTransactions = document.createElement('p');
            noTransactions.className = 'no-transactions';
            noTransactions.textContent = 'No transactions yet';
            transactionsList.appendChild(noTransactions);
            return;
        }

        transactions.forEach(tx => {
            const txItem = document.createElement('div');
            txItem.className = 'transaction-item';

            // Transaction hash
            const hashDiv = document.createElement('div');
            hashDiv.className = 'transaction-hash';
            const hashLabel = document.createElement('span');
            hashLabel.textContent = 'Hash: ';
            const hashClickable = this.createClickableHash(tx.hash, this.formatAddress(tx.hash));
            hashDiv.appendChild(hashLabel);
            hashDiv.appendChild(hashClickable);

            // Transaction addresses
            const fromDiv = document.createElement('div');
            fromDiv.className = 'transaction-from';
            if (tx.from) {
                const fromLabel = document.createElement('span');
                fromLabel.textContent = 'From: ';
                const fromClickable = this.createClickableAddress(tx.from);
                fromDiv.appendChild(fromLabel);
                fromDiv.appendChild(fromClickable);
            }

            const toDiv = document.createElement('div');
            toDiv.className = 'transaction-to';
            if (tx.to) {
                const toLabel = document.createElement('span');
                toLabel.textContent = 'To: ';
                const toClickable = this.createClickableAddress(tx.to);
                toDiv.appendChild(toLabel);
                toDiv.appendChild(toClickable);
            }

            // Transaction amount and status
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'transaction-details';
            
            const amountSpan = document.createElement('span');
            amountSpan.className = 'transaction-amount';
            amountSpan.textContent = tx.value || '0 PLS';
            
            const statusSpan = document.createElement('span');
            statusSpan.className = `transaction-type ${tx.type || 'unknown'}`;
            statusSpan.textContent = tx.type || 'Unknown';

            detailsDiv.appendChild(amountSpan);
            detailsDiv.appendChild(statusSpan);

            // Add timestamp if available
            if (tx.timestamp) {
                const timestampDiv = document.createElement('div');
                timestampDiv.className = 'transaction-date';
                timestampDiv.textContent = tx.timestamp;
                txItem.appendChild(timestampDiv);
            }

            txItem.appendChild(hashDiv);
            if (tx.from) txItem.appendChild(fromDiv);
            if (tx.to) txItem.appendChild(toDiv);
            txItem.appendChild(detailsDiv);

            transactionsList.appendChild(txItem);
        });
    }

    // Add method to make form input addresses clickable when they contain valid addresses
    setupAddressInputClickToCopy() {
        const recipientInput = document.getElementById('recipient-address');
        if (recipientInput) {
            // Add a small copy button next to the input when it contains a valid address
            let copyButton = null;
              const updateCopyButton = () => {
                const address = recipientInput.value.trim();
                // Check if ethers is available and address is valid
                const isValidAddress = address && window.ethers && ethers.isAddress(address);
                  if (isValidAddress && !copyButton) {
                    // Create copy button
                    copyButton = document.createElement('button');
                    copyButton.type = 'button';
                    copyButton.innerHTML = '📋';
                    copyButton.title = 'Copy address';
                    copyButton.className = 'copy-address-btn';
                    copyButton.addEventListener('click', () => {
                        this.copyAddress(address);
                    });
                    recipientInput.parentNode.appendChild(copyButton);
                } else if (!isValidAddress && copyButton) {
                    // Remove copy button
                    copyButton.remove();
                    copyButton = null;
                }
            };
            
            recipientInput.addEventListener('input', updateCopyButton);
            recipientInput.addEventListener('paste', () => {
                setTimeout(updateCopyButton, 100); // Delay to allow paste to complete
            });
        }
    }
}
