/**
 * popup.js
 *
 * UI controller for HeartWallet popup
 */

// Import polyfills first (required for Ledger libraries)
import '../polyfills.js';

import {
  importFromMnemonic,
  importFromPrivateKey,
  unlockWallet,
  walletExists,
  exportPrivateKey,
  exportMnemonic,
  deleteWallet,
  migrateToMultiWallet,
  getAllWallets,
  getActiveWallet,
  setActiveWallet,
  addWallet,
  renameWallet,
  exportPrivateKeyForWallet,
  exportMnemonicForWallet,
  addLedgerWallet
} from '../core/wallet.js';
import { save, load } from '../core/storage.js';
import { shortenAddress } from '../core/validation.js';
import * as rpc from '../core/rpc.js';
import { ethers } from 'ethers';
import QRCode from 'qrcode';
import * as tokens from '../core/tokens.js';
import { decodeTransaction } from '../core/contractDecoder.js';
import { fetchTokenPrices, getTokenValueUSD, formatUSD } from '../core/priceOracle.js';
import * as erc20 from '../core/erc20.js';
import * as ledger from '../core/ledger.js';

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} HTML-safe text
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitizes error messages for safe display in alerts and UI
 * Removes HTML tags, scripts, and limits length
 * @param {string} message - Error message to sanitize
 * @returns {string} Sanitized message
 */
function sanitizeError(message) {
  if (typeof message !== 'string') return 'Unknown error';
  
  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove script-like content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Limit length to prevent DoS
  if (sanitized.length > 300) {
    sanitized = sanitized.substring(0, 297) + '...';
  }
  
  return sanitized || 'Unknown error';
}

/**
 * Hash a privacy PIN using SHA-256
 * Note: This is for view-only protection, not for securing private keys.
 * The actual wallet encryption uses Argon2id which is much stronger.
 * @param {string} pin - The PIN to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
async function hashPrivacyPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'HeartWallet-PrivacyMode-Salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// STATE
// ============================================================================

// ===== STATE =====
let currentState = {
  isUnlocked: false,
  address: null,
  balance: '0',
  network: 'pulsechain', // Default to PulseChain Mainnet
  sessionToken: null, // Session token for authenticated operations (stored in memory only)
  settings: {
    autoLockMinutes: 15,
    showTestNetworks: true,
    decimalPlaces: 8,
    theme: 'high-contrast',
    maxGasPriceGwei: 1000, // Maximum gas price in Gwei (default 1000)
    allowEthSign: false, // Allow dangerous eth_sign method (disabled by default for security)
    enableLedger: false, // Enable Ledger hardware wallet support (opt-in)
    enableTrezor: false, // Enable Trezor hardware wallet support (opt-in, not yet implemented)
    privacyMode: false // When enabled, requires password to view dashboard (hides balances/addresses)
  },
  networkSettings: null, // Will be loaded from storage or use defaults
  lastActivityTime: null, // Track last activity for auto-lock
  tokenPrices: null, // Token prices in USD (cached from PulseX)
  currentTokenDetails: null, // Currently viewing token details
  ledger: {
    addresses: [], // List of addresses fetched from Ledger
    selectedIndex: null, // Selected account index
    selectedAddress: null, // Selected address
    selectedPath: null, // Selected derivation path
    currentPage: 0 // Current page for address pagination (5 addresses per page)
  }
};

// Auto-lock timer
let autoLockTimer = null;

// Rate limiting for password attempts
const RATE_LIMIT_KEY = 'password_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Network names for display
const NETWORK_NAMES = {
  'pulsechainTestnet': 'PulseChain Testnet V4',
  'pulsechain': 'PulseChain Mainnet',
  'ethereum': 'Ethereum Mainnet',
  'sepolia': 'Sepolia Testnet'
};

const BLOCK_EXPLORERS = {
  'pulsechainTestnet': {
    base: 'https://scan.v4.testnet.pulsechain.com',
    tx: '/tx/{hash}',
    address: '/address/{address}',
    token: '/token/{address}'
  },
  'pulsechain': {
    base: 'https://scan.mypinata.cloud/ipfs/bafybeienxyoyrhn5tswclvd3gdjy5mtkkwmu37aqtml6onbf7xnb3o22pe/',
    tx: '#/tx/{hash}',
    address: '#/address/{address}',
    token: '#/token/{address}'
  },
  'ethereum': {
    base: 'https://etherscan.io',
    tx: '/tx/{hash}',
    address: '/address/{address}',
    token: '/token/{address}'
  },
  'sepolia': {
    base: 'https://sepolia.etherscan.io',
    tx: '/tx/{hash}',
    address: '/address/{address}',
    token: '/token/{address}'
  }
};

/**
 * Build explorer URL for a specific type
 * @param {string} network - Network key
 * @param {string} type - URL type ('tx', 'address', 'token')
 * @param {string} value - The hash or address value
 * @returns {string} Complete explorer URL
 */
function getExplorerUrl(network, type, value) {
  const explorer = BLOCK_EXPLORERS[network];
  if (!explorer) return '';

  const pattern = explorer[type];
  if (!pattern) return '';

  return explorer.base + pattern.replace(`{${type === 'tx' ? 'hash' : 'address'}}`, value);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  // Check if this is a connection approval request
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  const origin = urlParams.get('origin');
  const requestId = urlParams.get('requestId');

  if (action === 'connect' && origin && requestId) {
    // Show connection approval screen
    await handleConnectionApprovalScreen(origin, requestId);
    return;
  }

  if (action === 'transaction' && requestId) {
    // Show transaction approval screen
    setupEventListeners(); // Set up event listeners first
    await handleTransactionApprovalScreen(requestId);
    return;
  }

  if (action === 'addToken' && requestId) {
    // Show token add approval screen
    await handleTokenAddApprovalScreen(requestId);
    return;
  }

  if (action === 'sign' && requestId) {
    // Show message signing approval screen
    await handleMessageSignApprovalScreen(requestId);
    return;
  }

  if (action === 'signTyped' && requestId) {
    // Show typed data signing approval screen
    await handleTypedDataSignApprovalScreen(requestId);
    return;
  }

  if (action === 'ledger') {
    // Show Ledger connection screen in dedicated window
    await loadSettings();
    await loadNetwork();
    applyTheme();
    setupEventListeners();
    updateNetworkDisplays();
    updateHardwareWalletButtons();
    initLedgerScreen();
    showScreen('screen-ledger');
    return;
  }

  if (action === 'reconnectLedger') {
    // Reconnect to Ledger device (re-grant WebHID permissions)
    const walletId = urlParams.get('walletId');
    await loadSettings();
    await loadNetwork();
    applyTheme();
    await handleReconnectLedgerScreen(walletId);
    return;
  }

  // Normal popup flow
  // Run migration first (converts old single-wallet to multi-wallet format)
  await migrateToMultiWallet();

  await loadSettings();
  await loadNetwork();
  applyTheme();
  await checkWalletStatus();
  setupEventListeners();
  updateNetworkDisplays();
  updateHardwareWalletButtons(); // Show/hide hardware wallet buttons based on settings

  // Listen for wallet changes (e.g., when Ledger wallet added from another window)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.wallets) {
      // If we're on the manage wallets screen, refresh the list
      const manageWalletsScreen = document.getElementById('screen-manage-wallets');
      if (manageWalletsScreen && !manageWalletsScreen.classList.contains('hidden')) {
        renderWalletList();
      }
    }
  });
});

// ===== SCREEN NAVIGATION =====
function showScreen(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('[id^="screen-"]');
  screens.forEach(screen => screen.classList.add('hidden'));

  // Show requested screen
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
    // Scroll to top when showing new screen
    window.scrollTo(0, 0);
  }
}

async function checkWalletStatus() {
  const exists = await walletExists();

  if (!exists) {
    // No wallet - show setup screen
    showScreen('screen-setup');
  } else {
    // Check if active wallet is a hardware wallet
    const activeWallet = await getActiveWallet();

    if (activeWallet && activeWallet.isHardwareWallet) {
      // Hardware wallet - check if privacy mode is enabled
      if (currentState.settings.privacyMode) {
        // Privacy mode enabled - require password to view dashboard
        showScreen('screen-unlock');
      } else {
        // Privacy mode disabled - go straight to dashboard
        currentState.address = activeWallet.address;
        currentState.isUnlocked = true;
        currentState.isHardwareWallet = true;
        showScreen('screen-dashboard');
        updateDashboard();
      }
    } else {
      // Software wallet - check if privacy mode is enabled
      if (currentState.settings.privacyMode) {
        // Privacy mode enabled - require password to unlock
        showScreen('screen-unlock');
      } else {
        // Privacy mode disabled - go straight to dashboard (password only needed for signing)
        currentState.address = activeWallet.address;
        currentState.isUnlocked = true;
        currentState.isHardwareWallet = false;
        showScreen('screen-dashboard');
        updateDashboard();
      }
    }
  }
}

// ===== SETTINGS =====
async function loadSettings() {
  const saved = await load('settings');
  if (saved) {
    currentState.settings = { ...currentState.settings, ...saved };
  }

  // Load network settings
  const networkSettings = await load('networkSettings');
  if (networkSettings) {
    currentState.networkSettings = networkSettings;
  }
}

async function saveSettings() {
  await save('settings', currentState.settings);
}

async function loadNetwork() {
  const saved = await load('currentNetwork');
  if (saved) {
    currentState.network = saved;
  }
}

async function saveNetwork() {
  await save('currentNetwork', currentState.network);
}

function applyTheme() {
  // Remove all theme classes
  document.body.classList.remove('theme-high-contrast', 'theme-professional', 'theme-amber', 'theme-cga', 'theme-classic', 'theme-heart');

  // Apply current theme
  if (currentState.settings.theme !== 'high-contrast') {
    document.body.classList.add(`theme-${currentState.settings.theme}`);
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Setup screen
  document.getElementById('btn-create-wallet')?.addEventListener('click', async () => {
    await generateNewMnemonic();
    updateNetworkDisplays();
    showScreen('screen-create');
  });

  document.getElementById('btn-import-wallet')?.addEventListener('click', () => {
    updateNetworkDisplays();
    showScreen('screen-import');
  });

  // Network selection on setup screen
  document.getElementById('network-select-setup')?.addEventListener('change', (e) => {
    currentState.network = e.target.value;
    saveNetwork();
    updateNetworkDisplays();
  });

  // Create wallet screen
  document.getElementById('chk-saved-mnemonic')?.addEventListener('change', (e) => {
    const passwordCreate = document.getElementById('password-create').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const btn = document.getElementById('btn-create-submit');

    btn.disabled = !(e.target.checked && passwordCreate && passwordConfirm && passwordCreate === passwordConfirm);
  });

  ['password-create', 'password-confirm'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      const checked = document.getElementById('chk-saved-mnemonic').checked;
      const passwordCreate = document.getElementById('password-create').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      const btn = document.getElementById('btn-create-submit');

      btn.disabled = !(checked && passwordCreate && passwordConfirm && passwordCreate === passwordConfirm);
    });
  });

  document.getElementById('btn-create-submit')?.addEventListener('click', handleCreateWallet);
  document.getElementById('btn-cancel-create')?.addEventListener('click', () => showScreen('screen-setup'));
  document.getElementById('btn-back-from-create')?.addEventListener('click', () => showScreen('screen-setup'));

  // Import wallet screen
  document.getElementById('import-method')?.addEventListener('change', (e) => {
    const mnemonicGroup = document.getElementById('import-mnemonic-group');
    const privatekeyGroup = document.getElementById('import-privatekey-group');

    if (e.target.value === 'mnemonic') {
      mnemonicGroup.classList.remove('hidden');
      privatekeyGroup.classList.add('hidden');
    } else {
      mnemonicGroup.classList.add('hidden');
      privatekeyGroup.classList.remove('hidden');
    }
  });

  document.getElementById('btn-import-submit')?.addEventListener('click', handleImportWallet);
  document.getElementById('btn-cancel-import')?.addEventListener('click', () => showScreen('screen-setup'));
  document.getElementById('btn-back-from-import')?.addEventListener('click', () => showScreen('screen-setup'));

  // Ledger wallet screen - open in new TAB (WebHID requires full page, not popup)
  document.getElementById('btn-connect-ledger')?.addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/popup/popup.html?action=ledger')
    });
  });
  document.getElementById('btn-connect-ledger-multi')?.addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/popup/popup.html?action=ledger')
    });
  });
  document.getElementById('btn-back-from-ledger')?.addEventListener('click', handleBackFromLedger);
  document.getElementById('btn-ledger-connect')?.addEventListener('click', handleLedgerConnect);
  document.getElementById('btn-ledger-load-more')?.addEventListener('click', handleLedgerLoadMore);
  document.getElementById('btn-ledger-add')?.addEventListener('click', handleLedgerAdd);
  document.getElementById('btn-ledger-cancel')?.addEventListener('click', () => {
    // Check if opened in dedicated window
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'ledger') {
      window.close();
    } else {
      showScreen('screen-setup');
    }
  });

  // Unlock screen
  document.getElementById('btn-unlock')?.addEventListener('click', handleUnlock);
  document.getElementById('password-unlock')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  });

  // Custom network dropdown
  const networkSelectCustom = document.getElementById('network-select-custom');
  const networkDropdownMenu = document.getElementById('network-dropdown-menu');

  // Initialize dropdown option logos
  document.querySelectorAll('.network-option img').forEach(img => {
    const logoFile = img.getAttribute('data-logo');
    if (logoFile) {
      img.src = chrome.runtime.getURL(`assets/logos/${logoFile}`);
    }
  });

  // Toggle dropdown
  networkSelectCustom?.addEventListener('click', (e) => {
    e.stopPropagation();
    networkDropdownMenu.classList.toggle('hidden');
  });

  // Handle option selection
  document.querySelectorAll('.network-option').forEach(option => {
    option.addEventListener('click', async (e) => {
      e.stopPropagation();
      const network = option.getAttribute('data-network');
      const networkText = option.querySelector('span').textContent;

      currentState.network = network;
      document.getElementById('network-selected-text').textContent = networkText;
      networkDropdownMenu.classList.add('hidden');

      saveNetwork();
      updateNetworkDisplays();
      await fetchBalance();
    });

    // Hover effect - bold text
    option.addEventListener('mouseenter', () => {
      option.querySelector('span').style.fontWeight = 'bold';
    });
    option.addEventListener('mouseleave', () => {
      option.querySelector('span').style.fontWeight = 'normal';
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    networkDropdownMenu?.classList.add('hidden');
  });

  document.getElementById('wallet-select')?.addEventListener('change', async (e) => {
    const selectedWalletId = e.target.value;
    if (selectedWalletId) {
      try {
        await setActiveWallet(selectedWalletId);
        const wallet = await getActiveWallet();
        currentState.address = wallet.address;
        await updateDashboard();
      } catch (error) {
        alert('Error switching wallet: ' + sanitizeError(error.message));
      }
    }
  });

  document.getElementById('btn-lock')?.addEventListener('click', handleLock);
  document.getElementById('btn-refresh')?.addEventListener('click', async () => {
    await updateDashboard();
  });
  document.getElementById('btn-settings')?.addEventListener('click', async () => {
    await loadSettingsToUI();
    showScreen('screen-settings');
  });

  document.getElementById('btn-network-settings')?.addEventListener('click', () => {
    loadNetworkSettingsToUI();
    showScreen('screen-network-settings');
  });

  document.getElementById('btn-back-from-network-settings')?.addEventListener('click', () => {
    showScreen('screen-settings');
  });

  document.getElementById('btn-save-network-settings')?.addEventListener('click', async () => {
    await saveNetworkSettings();
  });

  document.getElementById('btn-reset-network-settings')?.addEventListener('click', () => {
    if (confirm('Reset all network settings to defaults?')) {
      resetNetworkSettingsToDefaults();
    }
  });
  document.getElementById('btn-copy-address')?.addEventListener('click', handleCopyAddress);
  document.getElementById('btn-send')?.addEventListener('click', showSendScreen);
  document.getElementById('btn-receive')?.addEventListener('click', showReceiveScreen);
  document.getElementById('btn-tokens')?.addEventListener('click', showTokensScreen);
  document.getElementById('btn-tx-history')?.addEventListener('click', showTransactionHistory);

  // Send screen
  document.getElementById('btn-back-from-send')?.addEventListener('click', () => {
    showScreen('screen-dashboard');
    updateDashboard();
  });
  document.getElementById('btn-confirm-send')?.addEventListener('click', handleSendTransaction);
  document.getElementById('btn-cancel-send')?.addEventListener('click', () => showScreen('screen-dashboard'));
  document.getElementById('btn-send-max')?.addEventListener('click', handleSendMax);
  document.getElementById('send-asset-select')?.addEventListener('change', handleAssetChange);

  // Receive screen
  document.getElementById('btn-back-from-receive')?.addEventListener('click', () => showScreen('screen-dashboard'));
  document.getElementById('btn-copy-receive-address')?.addEventListener('click', handleCopyReceiveAddress);

  // Tokens screen
  document.getElementById('btn-back-from-tokens')?.addEventListener('click', () => showScreen('screen-dashboard'));
  document.getElementById('btn-add-custom-token')?.addEventListener('click', showAddTokenModal);

  // Token Details screen
  document.getElementById('btn-back-from-token-details')?.addEventListener('click', async () => {
    showScreen('screen-tokens');
    await renderTokensScreen();
  });
  document.getElementById('token-details-copy-address')?.addEventListener('click', handleCopyTokenDetailsAddress);
  document.getElementById('btn-token-send-max')?.addEventListener('click', handleTokenSendMax);
  document.getElementById('btn-token-send')?.addEventListener('click', handleTokenSend);
  document.getElementById('token-details-enable-toggle')?.addEventListener('change', handleTokenEnableToggle);

  // Transaction History
  document.getElementById('pending-tx-indicator')?.addEventListener('click', showTransactionHistory);
  document.getElementById('btn-back-from-tx-history')?.addEventListener('click', () => showScreen('screen-dashboard'));
  document.getElementById('filter-all-txs')?.addEventListener('click', () => renderTransactionHistory('all'));
  document.getElementById('filter-pending-txs')?.addEventListener('click', () => renderTransactionHistory('pending'));
  document.getElementById('filter-confirmed-txs')?.addEventListener('click', () => renderTransactionHistory('confirmed'));
  document.getElementById('btn-clear-tx-history')?.addEventListener('click', handleClearTransactionHistory);

  // Transaction Details
  document.getElementById('btn-back-from-tx-details')?.addEventListener('click', () => showScreen('screen-tx-history'));
  document.getElementById('btn-copy-tx-hash')?.addEventListener('click', async () => {
    const hash = document.getElementById('tx-detail-hash').textContent;
    try {
      await navigator.clipboard.writeText(hash);
      const btn = document.getElementById('btn-copy-tx-hash');
      const originalText = btn.textContent;
      btn.textContent = 'COPIED!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    } catch (error) {
      alert('Failed to copy hash');
    }
  });
  document.getElementById('btn-speed-up-tx')?.addEventListener('click', handleSpeedUpTransaction);
  document.getElementById('btn-cancel-tx')?.addEventListener('click', handleCancelTransaction);
  document.getElementById('btn-refresh-tx-status')?.addEventListener('click', refreshTransactionStatus);

  // Speed-up transaction modal
  document.getElementById('btn-close-speed-up-modal')?.addEventListener('click', () => {
    document.getElementById('modal-speed-up-tx').classList.add('hidden');
  });
  document.getElementById('btn-cancel-speed-up')?.addEventListener('click', () => {
    document.getElementById('modal-speed-up-tx').classList.add('hidden');
  });
  document.getElementById('btn-confirm-speed-up')?.addEventListener('click', confirmSpeedUp);
  document.getElementById('btn-refresh-gas-price')?.addEventListener('click', refreshGasPrices);

  // Cancel transaction modal
  document.getElementById('btn-close-cancel-modal')?.addEventListener('click', () => {
    document.getElementById('modal-cancel-tx').classList.add('hidden');
  });
  document.getElementById('btn-close-cancel')?.addEventListener('click', () => {
    document.getElementById('modal-cancel-tx').classList.add('hidden');
  });
  document.getElementById('btn-confirm-cancel')?.addEventListener('click', confirmCancelTransaction);
  document.getElementById('btn-refresh-cancel-gas-price')?.addEventListener('click', refreshCancelGasPrices);

  // Gas price refresh buttons
  document.getElementById('btn-refresh-approval-gas')?.addEventListener('click', refreshApprovalGasPrice);
  document.getElementById('btn-refresh-send-gas')?.addEventListener('click', refreshSendGasPrice);
  document.getElementById('btn-refresh-token-gas')?.addEventListener('click', refreshTokenGasPrice);

  // Add token modal
  document.getElementById('btn-close-add-token')?.addEventListener('click', () => {
    document.getElementById('modal-add-token').classList.add('hidden');
  });
  document.getElementById('btn-cancel-add-token')?.addEventListener('click', () => {
    document.getElementById('modal-add-token').classList.add('hidden');
  });
  document.getElementById('btn-confirm-add-token')?.addEventListener('click', handleAddCustomToken);
  document.getElementById('input-token-address')?.addEventListener('input', handleTokenAddressInput);

  // Settings screen
  document.getElementById('btn-back-from-settings')?.addEventListener('click', () => showScreen('screen-dashboard'));
  document.getElementById('setting-theme')?.addEventListener('change', (e) => {
    currentState.settings.theme = e.target.value;
    applyTheme();
    saveSettings();
  });
  document.getElementById('setting-decimals')?.addEventListener('change', (e) => {
    currentState.settings.decimalPlaces = parseInt(e.target.value);
    saveSettings();
    updateBalanceDisplay();
  });
  document.getElementById('setting-autolock')?.addEventListener('change', (e) => {
    currentState.settings.autoLockMinutes = parseInt(e.target.value);
    saveSettings();
  });
  document.getElementById('setting-max-gas-price')?.addEventListener('change', (e) => {
    const value = parseFloat(e.target.value);
    // Validate: must be positive number
    if (isNaN(value) || value <= 0) {
      alert('Gas price must be a positive number');
      e.target.value = currentState.settings.maxGasPriceGwei || 1000;
      return;
    }
    // Validate: reasonable maximum (100,000 Gwei = 0.0001 ETH per gas)
    if (value > 100000) {
      const confirmed = confirm(
        'Warning: Setting max gas price above 100,000 Gwei is extremely high.\n\n' +
        'This could allow massive transaction fees.\n\n' +
        'Are you sure you want to set it to ' + value + ' Gwei?'
      );
      if (!confirmed) {
        e.target.value = currentState.settings.maxGasPriceGwei || 1000;
        return;
      }
    }
    currentState.settings.maxGasPriceGwei = value;
    saveSettings();
  });
  document.getElementById('setting-show-testnets')?.addEventListener('change', (e) => {
    currentState.settings.showTestNetworks = e.target.checked;
    saveSettings();
    updateNetworkSelector();
  });
  document.getElementById('setting-allow-eth-sign')?.addEventListener('change', (e) => {
    // If trying to enable, show strong warning
    if (e.target.checked) {
      const confirmed = confirm(
        '⚠️ DANGER: ENABLE eth_sign?\n\n' +
        'eth_sign is a DEPRECATED and DANGEROUS signing method.\n\n' +
        'Malicious sites can use it to sign transactions that could drain your entire wallet.\n\n' +
        'This method should ONLY be enabled if:\n' +
        '• You fully trust the site requesting it\n' +
        '• You understand what data is being signed\n' +
        '• The site cannot use personal_sign instead\n\n' +
        'Do you want to enable this dangerous method?'
      );

      if (!confirmed) {
        // User cancelled, revert the checkbox
        e.target.checked = false;
        return;
      }
    }

    currentState.settings.allowEthSign = e.target.checked;
    saveSettings();
  });
  document.getElementById('setting-enable-ledger')?.addEventListener('change', (e) => {
    currentState.settings.enableLedger = e.target.checked;
    saveSettings();
    updateHardwareWalletButtons(); // Show/hide Ledger buttons
  });
  document.getElementById('setting-enable-trezor')?.addEventListener('change', (e) => {
    currentState.settings.enableTrezor = e.target.checked;
    saveSettings();
    updateHardwareWalletButtons(); // Show/hide Trezor buttons
  });
  document.getElementById('setting-privacy-mode')?.addEventListener('change', async (e) => {
    currentState.settings.privacyMode = e.target.checked;
    saveSettings();
    updateLockButtonVisibility(); // Show/hide lock button based on privacy mode
    await updatePrivacyPinSetupVisibility(); // Show/hide privacy PIN setup for hardware-only users
  });

  // Privacy PIN save button
  document.getElementById('btn-save-privacy-pin')?.addEventListener('click', async () => {
    const pin = document.getElementById('privacy-pin-input').value;
    const confirmPin = document.getElementById('privacy-pin-confirm').value;
    const statusEl = document.getElementById('privacy-pin-status');

    if (!pin || pin.length < 4) {
      statusEl.textContent = 'PIN must be at least 4 characters';
      statusEl.style.color = 'var(--terminal-error)';
      return;
    }

    if (pin !== confirmPin) {
      statusEl.textContent = 'PINs do not match';
      statusEl.style.color = 'var(--terminal-error)';
      return;
    }

    try {
      const hash = await hashPrivacyPin(pin);
      await save('privacyPinHash', hash);
      statusEl.textContent = 'Privacy PIN saved successfully!';
      statusEl.style.color = 'var(--terminal-success)';

      // Clear inputs
      document.getElementById('privacy-pin-input').value = '';
      document.getElementById('privacy-pin-confirm').value = '';
    } catch (error) {
      statusEl.textContent = 'Error saving PIN: ' + sanitizeError(error.message);
      statusEl.style.color = 'var(--terminal-error)';
    }
  });
  document.getElementById('btn-view-seed')?.addEventListener('click', handleViewSeed);
  document.getElementById('btn-export-key')?.addEventListener('click', handleExportKey);
  document.getElementById('btn-use-current-gas-price')?.addEventListener('click', handleUseCurrentGasPrice);

  // Password prompt modal
  document.getElementById('btn-password-prompt-confirm')?.addEventListener('click', () => {
    const password = document.getElementById('password-prompt-input').value;
    if (password) {
      // Don't close modal here - let the calling code handle it after showing progress
      if (passwordPromptResolve) {
        passwordPromptResolve(password);
        passwordPromptResolve = null;
      }
    }
  });

  document.getElementById('btn-password-prompt-cancel')?.addEventListener('click', () => {
    closePasswordPrompt(null);
  });

  document.getElementById('btn-close-password-prompt')?.addEventListener('click', () => {
    closePasswordPrompt(null);
  });

  document.getElementById('password-prompt-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const password = document.getElementById('password-prompt-input').value;
      if (password) {
        closePasswordPrompt(password);
      }
    }
  });

  // Display secret modal
  document.getElementById('btn-close-display-secret')?.addEventListener('click', closeSecretModal);
  document.getElementById('btn-close-display-secret-btn')?.addEventListener('click', closeSecretModal);

  document.getElementById('btn-copy-secret')?.addEventListener('click', async () => {
    const secret = document.getElementById('display-secret-content').textContent;
    try {
      await navigator.clipboard.writeText(secret);
      const btn = document.getElementById('btn-copy-secret');
      const originalText = btn.textContent;
      btn.textContent = 'COPIED!';
      btn.classList.add('text-success');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('text-success');
      }, 2000);
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  });

  // Multi-wallet management
  document.getElementById('btn-manage-wallets')?.addEventListener('click', handleManageWallets);
  document.getElementById('btn-back-from-manage-wallets')?.addEventListener('click', () => showScreen('screen-settings'));

  // Add wallet buttons
  document.getElementById('btn-create-new-wallet-multi')?.addEventListener('click', showAddWalletModal);
  document.getElementById('btn-import-wallet-multi')?.addEventListener('click', showAddWalletModal);

  // Add wallet modal - option selection
  document.getElementById('add-wallet-option-create')?.addEventListener('click', () => {
    document.getElementById('modal-add-wallet').classList.add('hidden');
    generateNewMnemonicMulti();
    document.getElementById('modal-create-wallet-multi').classList.remove('hidden');
  });

  document.getElementById('add-wallet-option-mnemonic')?.addEventListener('click', () => {
    document.getElementById('modal-add-wallet').classList.add('hidden');
    document.getElementById('modal-import-seed-multi').classList.remove('hidden');
  });

  document.getElementById('add-wallet-option-privatekey')?.addEventListener('click', () => {
    document.getElementById('modal-add-wallet').classList.add('hidden');
    document.getElementById('modal-import-key-multi').classList.remove('hidden');
  });

  document.getElementById('btn-close-add-wallet')?.addEventListener('click', () => {
    document.getElementById('modal-add-wallet').classList.add('hidden');
  });

  // Create wallet multi modal
  document.getElementById('btn-confirm-create-wallet-multi')?.addEventListener('click', handleCreateNewWalletMulti);
  document.getElementById('btn-cancel-create-wallet-multi')?.addEventListener('click', () => {
    document.getElementById('modal-create-wallet-multi').classList.add('hidden');
    document.getElementById('input-new-wallet-nickname').value = '';
    document.getElementById('verify-word-1-multi').value = '';
    document.getElementById('verify-word-2-multi').value = '';
    document.getElementById('verify-word-3-multi').value = '';
    document.getElementById('verification-error-multi').classList.add('hidden');
  });
  document.getElementById('btn-close-create-wallet-multi')?.addEventListener('click', () => {
    document.getElementById('modal-create-wallet-multi').classList.add('hidden');
    document.getElementById('input-new-wallet-nickname').value = '';
    document.getElementById('verify-word-1-multi').value = '';
    document.getElementById('verify-word-2-multi').value = '';
    document.getElementById('verify-word-3-multi').value = '';
    document.getElementById('verification-error-multi').classList.add('hidden');
  });

  // Import seed multi modal
  document.getElementById('btn-confirm-import-seed-multi')?.addEventListener('click', handleImportSeedMulti);
  document.getElementById('btn-cancel-import-seed-multi')?.addEventListener('click', () => {
    document.getElementById('modal-import-seed-multi').classList.add('hidden');
    document.getElementById('input-import-seed-nickname').value = '';
    document.getElementById('input-import-seed-phrase').value = '';
  });
  document.getElementById('btn-close-import-seed-multi')?.addEventListener('click', () => {
    document.getElementById('modal-import-seed-multi').classList.add('hidden');
    document.getElementById('input-import-seed-nickname').value = '';
    document.getElementById('input-import-seed-phrase').value = '';
  });

  // Import private key multi modal
  document.getElementById('btn-confirm-import-key-multi')?.addEventListener('click', handleImportKeyMulti);
  document.getElementById('btn-cancel-import-key-multi')?.addEventListener('click', () => {
    document.getElementById('modal-import-key-multi').classList.add('hidden');
    document.getElementById('input-import-key-nickname').value = '';
    document.getElementById('input-import-private-key').value = '';
  });
  document.getElementById('btn-close-import-key-multi')?.addEventListener('click', () => {
    document.getElementById('modal-import-key-multi').classList.add('hidden');
    document.getElementById('input-import-key-nickname').value = '';
    document.getElementById('input-import-private-key').value = '';
  });

  // Rename wallet modal
  document.getElementById('btn-confirm-rename-wallet')?.addEventListener('click', handleRenameWalletConfirm);
  document.getElementById('btn-cancel-rename-wallet')?.addEventListener('click', () => {
    document.getElementById('modal-rename-wallet').classList.add('hidden');
    currentRenameWalletId = null;
  });
  document.getElementById('btn-close-rename-wallet')?.addEventListener('click', () => {
    document.getElementById('modal-rename-wallet').classList.add('hidden');
    currentRenameWalletId = null;
  });

  // Transaction success modal
  document.getElementById('btn-close-tx-success')?.addEventListener('click', () => {
    document.getElementById('modal-tx-success').classList.add('hidden');
  });
  document.getElementById('btn-ok-tx-success')?.addEventListener('click', () => {
    document.getElementById('modal-tx-success').classList.add('hidden');
  });
  document.getElementById('btn-copy-tx-hash')?.addEventListener('click', async () => {
    try {
      const txHash = document.getElementById('tx-success-hash').textContent;
      await navigator.clipboard.writeText(txHash);
      const btn = document.getElementById('btn-copy-tx-hash');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    } catch (error) {
      alert('Failed to copy transaction hash');
    }
  });

  // Transaction Status Buttons (in approval popup)
  document.getElementById('btn-tx-status-explorer')?.addEventListener('click', () => {
    if (!txStatusCurrentHash) return;
    const url = getExplorerUrl(currentState.network, 'tx', txStatusCurrentHash);
    chrome.tabs.create({ url });
  });

  document.getElementById('btn-close-tx-status')?.addEventListener('click', () => {
    console.log('🫀 Close button clicked');
    if (txStatusPollInterval) {
      clearInterval(txStatusPollInterval);
      txStatusPollInterval = null;
    }
    window.close();
  });

  document.getElementById('btn-tx-status-speed-up')?.addEventListener('click', async () => {
    if (!txStatusCurrentHash || !txStatusCurrentAddress) return;

    try {
      // Get transaction details
      const txResponse = await chrome.runtime.sendMessage({
        type: 'GET_TX_BY_HASH',
        address: txStatusCurrentAddress,
        txHash: txStatusCurrentHash
      });

      if (!txResponse.success || !txResponse.transaction) {
        alert('Could not load transaction details');
        return;
      }

      const tx = txResponse.transaction;

      // Store state for modal
      speedUpModalState.txHash = txStatusCurrentHash;
      speedUpModalState.address = txStatusCurrentAddress;
      speedUpModalState.network = tx.network;
      speedUpModalState.originalGasPrice = tx.gasPrice;

      // Show modal and load gas prices
      document.getElementById('modal-speed-up-tx').classList.remove('hidden');
      await refreshGasPrices();

    } catch (error) {
      console.error('Error opening speed-up modal:', error);
      alert('Error loading gas prices');
    }
  });

  document.getElementById('btn-tx-status-cancel')?.addEventListener('click', async () => {
    if (!txStatusCurrentHash || !txStatusCurrentAddress) return;

    try {
      // Get transaction details
      const txResponse = await chrome.runtime.sendMessage({
        type: 'GET_TX_BY_HASH',
        address: txStatusCurrentAddress,
        txHash: txStatusCurrentHash
      });

      if (!txResponse.success || !txResponse.transaction) {
        alert('Could not load transaction details');
        return;
      }

      const tx = txResponse.transaction;

      // Store state for modal
      cancelModalState.txHash = txStatusCurrentHash;
      cancelModalState.address = txStatusCurrentAddress;
      cancelModalState.network = tx.network;
      cancelModalState.originalGasPrice = tx.gasPrice;

      // Show modal and load gas prices
      document.getElementById('modal-cancel-tx').classList.remove('hidden');
      await refreshCancelGasPrices();
    } catch (error) {
      console.error('Error opening cancel modal:', error);
      alert('Error loading gas prices');
    }
  });

  // Global activity tracking for auto-lock
  document.addEventListener('click', resetActivityTimer);
  document.addEventListener('keypress', resetActivityTimer);
  document.addEventListener('scroll', resetActivityTimer);
}

// ===== WALLET CREATION =====
let generatedMnemonic = '';
let verificationWords = []; // Array of {index, word} for verification

async function generateNewMnemonic() {
  try {
    // Import ethers to generate mnemonic
    const { ethers } = await import('ethers');

    // Generate a random wallet to get the mnemonic
    const randomWallet = ethers.Wallet.createRandom();
    generatedMnemonic = randomWallet.mnemonic.phrase;

    // Display the mnemonic
    document.getElementById('mnemonic-display').textContent = generatedMnemonic;

    // Set up verification (ask for 3 random words using cryptographically secure random)
    const words = generatedMnemonic.split(' ');
    const randomBytes = new Uint8Array(3);
    crypto.getRandomValues(randomBytes);
    const indices = [
      randomBytes[0] % 4, // Word 1-4
      4 + (randomBytes[1] % 4), // Word 5-8
      8 + (randomBytes[2] % 4) // Word 9-12
    ];

    verificationWords = indices.map(i => ({ index: i, word: words[i] }));

    // Update the UI with the random indices
    document.getElementById('verify-word-1-num').textContent = (verificationWords[0].index + 1);
    document.getElementById('verify-word-2-num').textContent = (verificationWords[1].index + 1);
    document.getElementById('verify-word-3-num').textContent = (verificationWords[2].index + 1);

    // Clear the verification inputs
    document.getElementById('verify-word-1').value = '';
    document.getElementById('verify-word-2').value = '';
    document.getElementById('verify-word-3').value = '';
    document.getElementById('verification-error').classList.add('hidden');
  } catch (error) {
    console.error('Error generating mnemonic:', error);
    document.getElementById('mnemonic-display').textContent = 'Error generating mnemonic. Please try again.';
  }
}

async function handleCreateWallet() {
  const password = document.getElementById('password-create').value;
  const passwordConfirm = document.getElementById('password-confirm').value;
  const errorDiv = document.getElementById('create-error');
  const verificationErrorDiv = document.getElementById('verification-error');

  // Validate
  if (password !== passwordConfirm) {
    errorDiv.textContent = 'Passwords do not match';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Ensure we have a mnemonic
  if (!generatedMnemonic) {
    errorDiv.textContent = 'No mnemonic generated. Please go back and try again.';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Verify seed phrase words
  const word1 = document.getElementById('verify-word-1').value.trim().toLowerCase();
  const word2 = document.getElementById('verify-word-2').value.trim().toLowerCase();
  const word3 = document.getElementById('verify-word-3').value.trim().toLowerCase();

  if (!word1 || !word2 || !word3) {
    verificationErrorDiv.textContent = 'Please enter all verification words to confirm you have backed up your seed phrase.';
    verificationErrorDiv.classList.remove('hidden');
    return;
  }

  if (word1 !== verificationWords[0].word.toLowerCase() ||
      word2 !== verificationWords[1].word.toLowerCase() ||
      word3 !== verificationWords[2].word.toLowerCase()) {
    verificationErrorDiv.textContent = 'Verification words do not match. Please double-check your seed phrase backup.';
    verificationErrorDiv.classList.remove('hidden');
    return;
  }

  const progressContainer = document.getElementById('create-progress-container');
  const progressBar = document.getElementById('create-progress-bar');
  const progressText = document.getElementById('create-progress-text');
  const createBtn = document.getElementById('btn-create-submit');

  try {
    errorDiv.classList.add('hidden');
    verificationErrorDiv.classList.add('hidden');

    // Disable button and show progress bar
    createBtn.disabled = true;
    if (progressContainer) {
      progressContainer.classList.remove('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = '0%';
    }

    let lastDisplayedPercentage = 0;

    // Import wallet from the mnemonic we already generated
    const { address } = await importFromMnemonic(generatedMnemonic, password, (progress) => {
      const percentage = Math.round(progress * 100);
      if (percentage !== lastDisplayedPercentage) {
        lastDisplayedPercentage = percentage;
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
      }
    });

    // Hide progress bar
    if (progressContainer) {
      progressContainer.classList.add('hidden');
    }

    // Success! Navigate to dashboard
    alert('Wallet created successfully!');
    currentState.address = address;
    currentState.isUnlocked = true;
    currentState.lastActivityTime = Date.now();

    // Start auto-lock timer
    startAutoLockTimer();

    // Clear the generated mnemonic from memory for security
    generatedMnemonic = '';
    verificationWords = [];

    showScreen('screen-dashboard');
    updateDashboard();
  } catch (error) {
    // Hide progress bar and re-enable button
    if (progressContainer) {
      progressContainer.classList.add('hidden');
    }
    createBtn.disabled = false;

    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}

// ===== WALLET IMPORT =====
async function handleImportWallet() {
  const method = document.getElementById('import-method').value;
  const password = document.getElementById('password-import').value;
  const passwordConfirm = document.getElementById('password-import-confirm').value;
  const errorDiv = document.getElementById('import-error');

  // Validate
  if (password !== passwordConfirm) {
    errorDiv.textContent = 'Passwords do not match';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Get progress bar elements
  const progressContainer = document.getElementById('import-progress-container');
  const progressBar = document.getElementById('import-progress-bar');
  const progressText = document.getElementById('import-progress-text');

  try {
    errorDiv.classList.add('hidden');

    // Show progress bar
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';

    // Progress callback with throttling
    let lastDisplayedPercentage = 0;
    const onProgress = (progress) => {
      const percentage = Math.round(progress * 100);
      if (percentage !== lastDisplayedPercentage) {
        lastDisplayedPercentage = percentage;
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
      }
    };

    let address;
    if (method === 'mnemonic') {
      const mnemonic = document.getElementById('import-mnemonic').value;
      const result = await importFromMnemonic(mnemonic, password, { onProgress });
      address = result.address;
    } else {
      const privateKey = document.getElementById('import-privatekey').value;
      const result = await importFromPrivateKey(privateKey, password, { onProgress });
      address = result.address;
    }

    // Hide progress bar
    progressContainer.classList.add('hidden');

    // Success!
    alert('Wallet imported successfully!');
    currentState.address = address;
    currentState.isUnlocked = true;
    showScreen('screen-dashboard');
    updateDashboard();
  } catch (error) {
    // Hide progress bar on error
    progressContainer.classList.add('hidden');

    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}

// ===== LEDGER WALLET =====
/**
 * Initialize Ledger connection screen
 */
function initLedgerScreen() {
  // Reset Ledger state
  currentState.ledger = {
    addresses: [],
    selectedIndex: null,
    selectedAddress: null,
    selectedPath: null,
    currentPage: 0
  };

  // Check if WebHID is supported
  if (!ledger.isLedgerSupported()) {
    const errorDiv = document.getElementById('ledger-support-error');
    errorDiv.textContent = 'Your browser does not support hardware wallets. Please use a Chromium-based browser (Chrome, Edge, Brave).';
    errorDiv.classList.remove('hidden');
    document.getElementById('btn-ledger-connect').disabled = true;
    return;
  }

  // Reset UI state
  document.getElementById('ledger-support-error').classList.add('hidden');
  document.getElementById('ledger-step-connect').classList.remove('hidden');
  document.getElementById('ledger-step-loading').classList.add('hidden');
  document.getElementById('ledger-step-addresses').classList.add('hidden');
  document.getElementById('ledger-step-confirm').classList.add('hidden');
  document.getElementById('ledger-buttons').classList.add('hidden');
  document.getElementById('ledger-error').classList.add('hidden');
  document.getElementById('btn-ledger-connect').disabled = false;
}

/**
 * Handle Ledger device connection and fetch addresses
 */
async function handleLedgerConnect() {
  const errorDiv = document.getElementById('ledger-error');

  try {
    errorDiv.classList.add('hidden');

    // Show loading state
    document.getElementById('ledger-step-connect').classList.add('hidden');
    document.getElementById('ledger-step-loading').classList.remove('hidden');

    // Fetch first 5 addresses from Ledger
    const addresses = await ledger.getAddresses(5, 0);

    currentState.ledger.addresses = addresses;
    currentState.ledger.currentPage = 0;

    // Hide loading, show address list
    document.getElementById('ledger-step-loading').classList.add('hidden');
    document.getElementById('ledger-step-addresses').classList.remove('hidden');

    // Render address list
    renderLedgerAddresses();

  } catch (error) {
    console.error('Ledger connection error:', error);

    // Hide loading
    document.getElementById('ledger-step-loading').classList.add('hidden');
    document.getElementById('ledger-step-connect').classList.remove('hidden');

    // Show error
    errorDiv.textContent = error.message || 'Failed to connect to Ledger device';
    errorDiv.classList.remove('hidden');
  }
}

/**
 * Load more addresses from Ledger (pagination)
 */
async function handleLedgerLoadMore() {
  const errorDiv = document.getElementById('ledger-error');
  const loadMoreBtn = document.getElementById('btn-ledger-load-more');

  try {
    errorDiv.classList.add('hidden');
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'LOADING...';

    // Fetch next 5 addresses
    const nextPage = currentState.ledger.currentPage + 1;
    const startIndex = nextPage * 5;
    const moreAddresses = await ledger.getAddresses(5, startIndex);

    // Add to address list
    currentState.ledger.addresses = [...currentState.ledger.addresses, ...moreAddresses];
    currentState.ledger.currentPage = nextPage;

    // Re-render address list
    renderLedgerAddresses();

    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'LOAD MORE ADDRESSES';

  } catch (error) {
    console.error('Ledger load more error:', error);

    errorDiv.textContent = error.message || 'Failed to load more addresses';
    errorDiv.classList.remove('hidden');

    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'LOAD MORE ADDRESSES';
  }
}

/**
 * Render Ledger address list with radio buttons
 */
function renderLedgerAddresses() {
  const listContainer = document.getElementById('ledger-address-list');
  listContainer.innerHTML = '';

  currentState.ledger.addresses.forEach((addr) => {
    const item = document.createElement('div');
    item.className = 'panel';
    item.style.cssText = 'margin-bottom: 8px; cursor: pointer; padding: 8px;';

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <input type="radio" name="ledger-address" value="${addr.index}"
               id="ledger-addr-${addr.index}" style="cursor: pointer; flex-shrink: 0; width: 16px; height: 16px; margin: 0;">
        <label for="ledger-addr-${addr.index}" style="flex: 1; cursor: pointer; font-size: 11px; margin: 0;">
          <div style="color: var(--terminal-text); margin-bottom: 4px;">
            <strong>Account ${addr.index}</strong>
          </div>
          <div style="color: var(--terminal-dim); font-size: 10px; word-break: break-all;">
            ${escapeHtml(addr.address)}
          </div>
          <div style="color: var(--terminal-dim); font-size: 9px; margin-top: 2px;">
            ${escapeHtml(addr.path)}
          </div>
        </label>
      </div>
    `;

    // Make entire panel clickable
    item.addEventListener('click', () => {
      document.getElementById(`ledger-addr-${addr.index}`).checked = true;
      handleLedgerAddressSelect(addr);
    });

    listContainer.appendChild(item);
  });
}

/**
 * Handle address selection
 */
function handleLedgerAddressSelect(addr) {
  currentState.ledger.selectedIndex = addr.index;
  currentState.ledger.selectedAddress = addr.address;
  currentState.ledger.selectedPath = addr.path;

  // Show confirmation step
  document.getElementById('ledger-step-confirm').classList.remove('hidden');
  document.getElementById('ledger-buttons').classList.remove('hidden');

  // Update selected address display
  document.getElementById('ledger-selected-address').textContent = addr.address;
  document.getElementById('ledger-selected-index').textContent = addr.index;
  document.getElementById('ledger-selected-path').textContent = addr.path;

  // Set default nickname
  document.getElementById('ledger-nickname').value = `Ledger ${addr.index + 1}`;
}

/**
 * Add selected Ledger wallet
 */
async function handleLedgerAdd() {
  const errorDiv = document.getElementById('ledger-error');
  const addBtn = document.getElementById('btn-ledger-add');

  if (!currentState.ledger.selectedAddress) {
    errorDiv.textContent = 'Please select an address first';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Get password for authentication
  const password = document.getElementById('ledger-password').value;

  try {
    errorDiv.classList.add('hidden');
    addBtn.disabled = true;
    addBtn.textContent = 'ADDING...';

    // Check if this is the first wallet or additional wallet
    const wallets = await getAllWallets();
    const hasExistingWallets = wallets.walletList && wallets.walletList.length > 0;

    if (hasExistingWallets) {
      // Verify password by attempting to unlock existing wallet
      if (!password) {
        throw new Error('Password required to add wallet');
      }

      // Verify password is correct
      try {
        await unlockWallet(password);
      } catch (unlockError) {
        throw new Error('Invalid password');
      }
    } else {
      // First wallet - require password to be set
      if (!password) {
        throw new Error('Please create a password for HeartWallet');
      }

      // Validate password strength
      if (password.length < 12) {
        throw new Error('Password must be at least 12 characters');
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(password)) {
        throw new Error('Password must contain at least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw new Error('Password must contain at least one special character');
      }
    }

    const nickname = document.getElementById('ledger-nickname').value.trim() ||
                     `Ledger ${currentState.ledger.selectedIndex + 1}`;

    // Add Ledger wallet (password verified)
    await addLedgerWallet(
      currentState.ledger.selectedAddress,
      currentState.ledger.selectedIndex,
      currentState.ledger.selectedPath,
      nickname
    );

    // Success!
    alert('Ledger wallet added successfully!');

    // Check if opened in dedicated window (has action=ledger parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const isStandaloneWindow = urlParams.get('action') === 'ledger';

    if (isStandaloneWindow) {
      // Opened as dedicated tab/window - close it
      chrome.tabs.getCurrent((tab) => {
        if (tab) {
          chrome.tabs.remove(tab.id);
        } else {
          window.close();
        }
      });
    } else {
      // Opened in normal popup - navigate based on wallet count
      const wallets = await getAllWallets();
      if (wallets.walletList.length === 1) {
        // First wallet - go to dashboard
        currentState.address = currentState.ledger.selectedAddress;
        currentState.isUnlocked = true; // Hardware wallets don't need unlock
        showScreen('screen-dashboard');
        updateDashboard();
      } else {
        // Additional wallet - go back to manage wallets
        showScreen('screen-manage-wallets');
        await handleManageWallets();
      }
    }

    addBtn.disabled = false;
    addBtn.textContent = 'ADD LEDGER WALLET';

  } catch (error) {
    console.error('Error adding Ledger wallet:', error);
    errorDiv.textContent = error.message || 'Failed to add Ledger wallet';
    errorDiv.classList.remove('hidden');

    addBtn.disabled = false;
    addBtn.textContent = 'ADD LEDGER WALLET';
  }
}

/**
 * Handle Ledger reconnection screen
 */
async function handleReconnectLedgerScreen(walletId) {
  // Create simple reconnection UI with button (user gesture required for WebHID)
  document.body.innerHTML = `
    <div style="padding: 24px; font-family: var(--font-mono); text-align: center;">
      <h2 style="margin-bottom: 24px;">Reconnect Ledger Device</h2>
      <div id="reconnect-status" style="margin-bottom: 24px;">
        <p style="font-size: 14px; margin-bottom: 16px;">Ready to reconnect your Ledger</p>
        <p style="font-size: 12px; color: var(--terminal-dim); margin-bottom: 24px;">
          Make sure your Ledger is:<br>
          1. Connected via USB<br>
          2. Unlocked (PIN entered)<br>
          3. Ethereum app is open
        </p>
        <button id="btn-connect-ledger-now" class="btn-primary" style="padding: 12px 24px; font-size: 14px;">
          CONNECT TO LEDGER
        </button>
      </div>
      <div id="reconnect-error" class="hidden" style="color: var(--terminal-danger); margin-top: 16px;"></div>
    </div>
  `;

  // Add click handler (user gesture triggers WebHID permission)
  document.getElementById('btn-connect-ledger-now').addEventListener('click', async () => {
    const statusDiv = document.getElementById('reconnect-status');
    const errorDiv = document.getElementById('reconnect-error');

    statusDiv.innerHTML = `
      <p style="font-size: 14px; margin-bottom: 16px;">Connecting to your Ledger device...</p>
      <p style="font-size: 12px; color: var(--terminal-dim);">Select your Ledger from the browser popup</p>
    `;
    errorDiv.classList.add('hidden');

    try {
      // Attempt to connect to Ledger (this will trigger WebHID permission prompt)
      const transport = await ledger.connectLedger();

      // Connection successful - close transport and show success
      await transport.close();

      statusDiv.innerHTML = `
        <p style="font-size: 16px; color: var(--terminal-success); margin-bottom: 16px;">✅ Ledger Connected Successfully!</p>
        <p style="font-size: 12px; color: var(--terminal-dim);">You can now use your Ledger with HeartWallet</p>
        <p style="font-size: 12px; color: var(--terminal-dim); margin-top: 12px;">This tab will close in 2 seconds...</p>
      `;

      // Close tab after 2 seconds
      setTimeout(() => {
        chrome.tabs.getCurrent((tab) => {
          if (tab) {
            chrome.tabs.remove(tab.id);
          }
        });
      }, 2000);

    } catch (error) {
      console.error('Error reconnecting to Ledger:', error);
      statusDiv.innerHTML = `
        <button id="btn-retry-connect" class="btn-primary" style="padding: 12px 24px; font-size: 14px; margin-top: 16px;">
          TRY AGAIN
        </button>
        <button id="btn-close-tab" class="btn-secondary" style="padding: 12px 24px; font-size: 14px; margin-top: 16px; margin-left: 8px;">
          CLOSE
        </button>
      `;
      errorDiv.textContent = `Failed to connect: ${error.message}`;
      errorDiv.classList.remove('hidden');

      // Add retry handler
      document.getElementById('btn-retry-connect')?.addEventListener('click', () => {
        location.reload();
      });

      // Add close handler
      document.getElementById('btn-close-tab')?.addEventListener('click', () => {
        chrome.tabs.getCurrent((tab) => {
          if (tab) {
            chrome.tabs.remove(tab.id);
          }
        });
      });
    }
  });
}

/**
 * Handle back button from Ledger screen
 */
function handleBackFromLedger() {
  // Check if opened in dedicated tab/window
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'ledger') {
    // Close tab if possible, otherwise close window
    chrome.tabs.getCurrent((tab) => {
      if (tab) {
        chrome.tabs.remove(tab.id);
      } else {
        window.close();
      }
    });
    return;
  }

  // Determine where to go back to in normal popup
  const wallets = getAllWallets();
  wallets.then(w => {
    if (w.walletList && w.walletList.length > 0) {
      // Has existing wallets - go to manage wallets
      showScreen('screen-manage-wallets');
    } else {
      // No wallets yet - go to setup
      showScreen('screen-setup');
    }
  });
}

// ===== UNLOCK =====
async function handleUnlock() {
  const password = document.getElementById('password-unlock').value;
  const errorDiv = document.getElementById('unlock-error');
  const unlockBtn = document.getElementById('btn-unlock');
  const passwordInput = document.getElementById('password-unlock');
  const progressContainer = document.getElementById('unlock-progress-container');
  const progressBar = document.getElementById('unlock-progress-bar');
  const progressText = document.getElementById('unlock-progress-text');

  // Disable UI immediately to prevent multiple clicks
  unlockBtn.disabled = true;
  passwordInput.disabled = true;
  const originalBtnText = unlockBtn.textContent;
  unlockBtn.textContent = 'UNLOCKING...';

  // Show progress bar
  if (progressContainer) {
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
  }

  // Check if locked out due to too many failed attempts
  const lockoutInfo = await checkRateLimitLockout();
  if (lockoutInfo.isLockedOut) {
    const remainingMinutes = Math.ceil(lockoutInfo.remainingMs / 1000 / 60);
    errorDiv.textContent = `Too many failed attempts. Please wait ${remainingMinutes} minute(s) before trying again.`;
    errorDiv.classList.remove('hidden');

    // Re-enable UI and hide progress bar
    unlockBtn.disabled = false;
    passwordInput.disabled = false;
    unlockBtn.textContent = originalBtnText;
    if (progressContainer) {
      progressContainer.classList.add('hidden');
    }
    return;
  }

  // Check if active wallet is hardware wallet and privacy mode is enabled
  const activeWallet = await getActiveWallet();
  const isHardwareWallet = activeWallet && activeWallet.isHardwareWallet;
  const privacyModeEnabled = currentState.settings.privacyMode;

  // For hardware wallet with privacy mode: verify password against any software wallet
  // or stored privacy PIN (if user has no software wallets)
  if (isHardwareWallet && privacyModeEnabled) {
    try {
      errorDiv.classList.add('hidden');

      // Try to verify password by unlocking any software wallet
      const allWallets = await getAllWallets();
      const softwareWallet = allWallets.find(w => !w.isHardwareWallet);

      if (softwareWallet) {
        // Verify password by attempting to unlock a software wallet
        await unlockWallet(password, { walletId: softwareWallet.id });
      } else {
        // No software wallets - check stored privacy PIN
        const storedPrivacyHash = await load('privacyPinHash');
        if (!storedPrivacyHash) {
          // No privacy PIN set - prompt user to set one
          errorDiv.textContent = 'No password set. Please add a software wallet or set up privacy PIN in settings.';
          errorDiv.classList.remove('hidden');
          unlockBtn.disabled = false;
          passwordInput.disabled = false;
          unlockBtn.textContent = originalBtnText;
          if (progressContainer) progressContainer.classList.add('hidden');
          return;
        }

        // Verify against stored privacy PIN hash (simple hash for view-only protection)
        const inputHash = await hashPrivacyPin(password);
        if (inputHash !== storedPrivacyHash) {
          throw new Error('Incorrect password');
        }
      }

      // Success! Clear failed attempts
      await clearFailedAttempts();

      currentState.isUnlocked = true;
      currentState.address = activeWallet.address;
      currentState.isHardwareWallet = true;
      currentState.lastActivityTime = Date.now();

      // Start auto-lock timer for privacy mode
      startAutoLockTimer();

      // Re-enable UI and hide progress bar
      unlockBtn.disabled = false;
      passwordInput.disabled = false;
      unlockBtn.textContent = originalBtnText;
      if (progressContainer) progressContainer.classList.add('hidden');

      showScreen('screen-dashboard');
      updateDashboard();
      return;

    } catch (error) {
      // Record failed attempt
      await recordFailedAttempt();

      const newLockoutInfo = await checkRateLimitLockout();
      if (newLockoutInfo.isLockedOut) {
        const remainingMinutes = Math.ceil(newLockoutInfo.remainingMs / 1000 / 60);
        errorDiv.textContent = `Too many failed attempts (${MAX_ATTEMPTS}). Wallet locked for ${remainingMinutes} minutes.`;
      } else {
        const attemptsLeft = MAX_ATTEMPTS - newLockoutInfo.attempts;
        errorDiv.textContent = `${error.message} (${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining)`;
      }
      errorDiv.classList.remove('hidden');

      unlockBtn.disabled = false;
      passwordInput.disabled = false;
      unlockBtn.textContent = originalBtnText;
      if (progressContainer) progressContainer.classList.add('hidden');
      return;
    }
  }

  try {
    errorDiv.classList.add('hidden');

    // Track last displayed percentage to throttle UI updates
    let lastDisplayedPercentage = 0;

    // Unlock wallet with auto-upgrade notification and progress tracking
    const { address, signer, upgraded, versionBefore, versionAfter, paramsBefore, paramsAfter } = await unlockWallet(password, {
      onProgress: (progress) => {
        // Update progress bar (progress is 0.0 to 1.0)
        const percentage = Math.round(progress * 100);

        // Only update UI when percentage actually changes (throttle updates)
        if (percentage !== lastDisplayedPercentage) {
          lastDisplayedPercentage = percentage;

          if (progressBar) {
            progressBar.style.width = `${percentage}%`;
          }
          if (progressText) {
            progressText.textContent = `${percentage}%`;
          }
        }
      },
      onUpgradeStart: (info) => {
        // Handle both version upgrades and parameter upgrades
        const isVersionUpgrade = info.versionBefore < 3;
        const upgradeType = isVersionUpgrade ? 'version' : 'parameters';
        const targetLabel = info.paramsAfter?.label || `${info.paramsAfter?.iterations} iterations`;

        console.log(`🔐 Auto-upgrading wallet ${upgradeType}: v${info.versionBefore} → v${info.versionAfter} (${targetLabel})`);

        // Show visual feedback in UI
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message info';
        statusDiv.textContent = `🔐 Upgrading wallet security to Argon2id (${targetLabel})...`;
        errorDiv.parentElement.insertBefore(statusDiv, errorDiv);
        setTimeout(() => statusDiv.remove(), 3000);
      }
    });

    // Show upgrade completion message if wallet was upgraded
    if (upgraded) {
      const beforeLabel = paramsBefore ? `v${versionBefore} (${paramsBefore.label || 'Legacy'})` : `v${versionBefore} (Legacy)`;
      const afterLabel = `v${versionAfter} (${paramsAfter.label})`;
      console.log(`✅ Wallet upgraded: ${beforeLabel} → ${afterLabel}`);
      const statusDiv = document.createElement('div');
      statusDiv.className = 'status-message success';
      statusDiv.textContent = `✅ Security upgraded to ${paramsAfter.label}`;
      errorDiv.parentElement.insertBefore(statusDiv, errorDiv);
      setTimeout(() => statusDiv.remove(), 5000);
    }

    // Success! Clear failed attempts
    await clearFailedAttempts();

    // Create session token in service worker
    const activeWallet = await getActiveWallet();
    const durationMs = currentState.settings.autoLockMinutes * 60 * 1000;
    const sessionResponse = await chrome.runtime.sendMessage({
      type: 'CREATE_SESSION',
      password,
      walletId: activeWallet.id,
      durationMs
    });

    if (!sessionResponse.success) {
      throw new Error('Failed to create session');
    }

    currentState.isUnlocked = true;
    currentState.address = address;
    currentState.sessionToken = sessionResponse.sessionToken;
    currentState.lastActivityTime = Date.now();

    // Start auto-lock timer
    startAutoLockTimer();

    // Re-enable UI and hide progress bar before switching screens
    unlockBtn.disabled = false;
    passwordInput.disabled = false;
    unlockBtn.textContent = originalBtnText;
    if (progressContainer) {
      progressContainer.classList.add('hidden');
    }

    showScreen('screen-dashboard');
    updateDashboard();
  } catch (error) {
    // Record failed attempt
    await recordFailedAttempt();

    // Check if now locked out
    const newLockoutInfo = await checkRateLimitLockout();
    if (newLockoutInfo.isLockedOut) {
      const remainingMinutes = Math.ceil(newLockoutInfo.remainingMs / 1000 / 60);
      errorDiv.textContent = `Too many failed attempts (${MAX_ATTEMPTS}). Wallet locked for ${remainingMinutes} minutes.`;
    } else {
      const attemptsLeft = MAX_ATTEMPTS - newLockoutInfo.attempts;
      errorDiv.textContent = `${error.message} (${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining)`;
    }
    errorDiv.classList.remove('hidden');

    // Re-enable UI and hide progress bar
    unlockBtn.disabled = false;
    passwordInput.disabled = false;
    unlockBtn.textContent = originalBtnText;
    if (progressContainer) {
      progressContainer.classList.add('hidden');
    }
  }
}

// ===== LOCK =====
async function handleLock() {
  // Invalidate session in service worker
  if (currentState.sessionToken) {
    await chrome.runtime.sendMessage({
      type: 'INVALIDATE_SESSION',
      sessionToken: currentState.sessionToken
    });
  }

  currentState.isUnlocked = false;
  currentState.address = null;
  currentState.sessionToken = null;
  currentState.lastActivityTime = null;
  stopAutoLockTimer();
  showScreen('screen-unlock');
}

// ===== AUTO-LOCK TIMER =====
function startAutoLockTimer() {
  stopAutoLockTimer(); // Clear any existing timer

  const checkInterval = 10000; // Check every 10 seconds

  autoLockTimer = setInterval(() => {
    if (!currentState.isUnlocked || !currentState.lastActivityTime) {
      stopAutoLockTimer();
      return;
    }

    const idleTime = Date.now() - currentState.lastActivityTime;
    const autoLockMs = currentState.settings.autoLockMinutes * 60 * 1000;

    if (idleTime >= autoLockMs) {
      // Auto-locking wallet
      handleLock();
    }
  }, checkInterval);
}

function stopAutoLockTimer() {
  if (autoLockTimer) {
    clearInterval(autoLockTimer);
    autoLockTimer = null;
  }
}

function resetActivityTimer() {
  if (currentState.isUnlocked) {
    currentState.lastActivityTime = Date.now();
  }
}

// ===== RATE LIMITING =====
async function recordFailedAttempt() {
  const data = await load(RATE_LIMIT_KEY) || { attempts: 0, firstAttemptTime: Date.now() };

  // If first attempt or attempts have expired, reset
  const timeSinceFirst = Date.now() - data.firstAttemptTime;
  if (data.attempts === 0 || timeSinceFirst > LOCKOUT_DURATION_MS) {
    data.attempts = 1;
    data.firstAttemptTime = Date.now();
  } else {
    data.attempts += 1;
  }

  await save(RATE_LIMIT_KEY, data);
}

async function checkRateLimitLockout() {
  const data = await load(RATE_LIMIT_KEY);

  if (!data || data.attempts === 0) {
    return { isLockedOut: false, attempts: 0, remainingMs: 0 };
  }

  const timeSinceFirst = Date.now() - data.firstAttemptTime;

  // If lockout period has expired, clear attempts
  if (timeSinceFirst > LOCKOUT_DURATION_MS) {
    await clearFailedAttempts();
    return { isLockedOut: false, attempts: 0, remainingMs: 0 };
  }

  // Check if locked out
  if (data.attempts >= MAX_ATTEMPTS) {
    const remainingMs = LOCKOUT_DURATION_MS - timeSinceFirst;
    return { isLockedOut: true, attempts: data.attempts, remainingMs };
  }

  return { isLockedOut: false, attempts: data.attempts, remainingMs: 0 };
}

async function clearFailedAttempts() {
  await save(RATE_LIMIT_KEY, { attempts: 0, firstAttemptTime: 0 });
}

// ===== DASHBOARD =====
async function updateDashboard() {
  // Update address display
  const addressEl = document.getElementById('wallet-address');
  if (addressEl && currentState.address) {
    addressEl.textContent = shortenAddress(currentState.address);
  }

  // Fetch and update balance
  await fetchBalance();

  // Fetch and update token prices (async, don't block dashboard load)
  fetchAndUpdatePrices();

  // Update network selector
  updateNetworkSelector();
  updateNetworkDisplays();

  // Update wallet selector
  await updateWalletSelector();

  // Update pending transaction indicator
  await updatePendingTxIndicator();

  // Update lock button visibility based on privacy mode
  updateLockButtonVisibility();
}

// Update wallet selector dropdown
async function updateWalletSelector() {
  const walletSelect = document.getElementById('wallet-select');
  if (!walletSelect) return;

  const walletsData = await getAllWallets();

  if (walletsData.walletList.length === 0) {
    walletSelect.innerHTML = '<option value="">No wallets</option>';
    return;
  }

  walletSelect.innerHTML = '';

  walletsData.walletList.forEach(wallet => {
    const option = document.createElement('option');
    option.value = wallet.id;
    option.textContent = wallet.nickname || 'Unnamed Wallet';

    if (wallet.id === walletsData.activeWalletId) {
      option.selected = true;
    }

    walletSelect.appendChild(option);
  });
}

// Update network displays across all screens
function updateNetworkDisplays() {
  const networkName = NETWORK_NAMES[currentState.network] || 'Unknown Network';

  // Setup screen selector
  const setupSelect = document.getElementById('network-select-setup');
  if (setupSelect) {
    setupSelect.value = currentState.network;
  }

  // Create screen display
  const createDisplay = document.getElementById('network-display-create');
  if (createDisplay) {
    createDisplay.textContent = networkName;
  }

  // Import screen display
  const importDisplay = document.getElementById('network-display-import');
  if (importDisplay) {
    importDisplay.textContent = networkName;
  }

  // Dashboard custom dropdown
  const networkSelectedText = document.getElementById('network-selected-text');
  if (networkSelectedText) {
    networkSelectedText.textContent = networkName;
  }

  // Update network selector logo
  const selectorLogoEl = document.getElementById('network-selector-logo');
  if (selectorLogoEl) {
    const networkLogos = {
      'pulsechainTestnet': 'pls.png',
      'pulsechain': 'pls.png',
      'ethereum': 'eth.png',
      'sepolia': 'eth.png'
    };

    const logoFile = networkLogos[currentState.network];
    if (logoFile) {
      selectorLogoEl.src = chrome.runtime.getURL(`assets/logos/${logoFile}`);
      selectorLogoEl.style.display = 'block';
    } else {
      selectorLogoEl.style.display = 'none';
    }
  }
}

async function fetchBalance() {
  if (!currentState.address) {
    currentState.balance = '0';
    updateBalanceDisplay();
    return;
  }

  try {
    const balanceWei = await rpc.getBalance(currentState.network, currentState.address);
    currentState.balance = rpc.formatBalance(balanceWei, currentState.settings.decimalPlaces);
    updateBalanceDisplay();
  } catch (error) {
    console.error('Error fetching balance:', error);
    // Keep previous balance on error
    updateBalanceDisplay();
  }
}

/**
 * Formats a balance string with commas and returns display + tooltip values
 * @param {string} balanceString - Balance as string (e.g., "1234.5678")
 * @param {number} fullDecimals - Full precision decimals (default 18)
 * @returns {{display: string, tooltip: string}}
 */
function formatBalanceWithCommas(balanceString, fullDecimals = 18) {
  const balance = parseFloat(balanceString);
  if (isNaN(balance)) {
    return { display: balanceString, tooltip: balanceString };
  }

  // Display value (keep current decimals, add commas)
  const parts = balanceString.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const displayValue = parts.join('.');

  // Full precision value with commas
  const fullPrecision = balance.toFixed(fullDecimals);
  const fullParts = fullPrecision.split('.');
  fullParts[0] = fullParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fullValue = fullParts.join('.');

  return {
    display: displayValue,
    tooltip: `Full precision: ${fullValue}`
  };
}

function updateBalanceDisplay() {
  const balanceEl = document.getElementById('balance-amount');
  if (balanceEl) {
    const decimals = currentState.settings.decimalPlaces;
    const balance = parseFloat(currentState.balance);

    // Format with commas for readability
    const formatted = balance.toFixed(decimals);
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const displayValue = parts.join('.');

    balanceEl.textContent = displayValue;

    // Set tooltip with full precision (18 decimals) and commas
    const fullPrecision = balance.toFixed(18);
    const fullParts = fullPrecision.split('.');
    fullParts[0] = fullParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const fullValue = fullParts.join('.');
    balanceEl.title = `Full precision: ${fullValue}`;
  }

  // Update balance symbol based on network
  const symbolEl = document.getElementById('balance-symbol');
  if (symbolEl) {
    const symbols = {
      'pulsechainTestnet': 'tPLS',
      'pulsechain': 'PLS',
      'ethereum': 'ETH',
      'sepolia': 'SEP'
    };
    symbolEl.textContent = symbols[currentState.network] || 'TOKEN';
  }

  // Update USD value if prices are available
  const usdEl = document.getElementById('balance-usd');
  if (usdEl && currentState.tokenPrices) {
    const tokenSymbol = currentState.network === 'pulsechainTestnet' ? 'PLS' :
                       currentState.network === 'pulsechain' ? 'PLS' :
                       currentState.network === 'ethereum' ? 'ETH' : 'PLS';

    // Convert balance to wei (string with 18 decimals)
    const balanceWei = ethers.parseEther(currentState.balance.toString()).toString();
    const usdValue = getTokenValueUSD(tokenSymbol, balanceWei, 18, currentState.tokenPrices);

    if (usdValue !== null) {
      usdEl.textContent = formatUSD(usdValue);
      usdEl.style.color = 'var(--terminal-fg-dim)';
    } else {
      usdEl.textContent = '—';
      usdEl.style.color = 'var(--terminal-fg-dim)';
    }
  } else if (usdEl) {
    usdEl.textContent = '—';
  }

  // Update network logo
  const logoEl = document.getElementById('network-logo');
  if (logoEl) {
    const networkLogos = {
      'pulsechainTestnet': 'pls.png',
      'pulsechain': 'pls.png',
      'ethereum': 'eth.png',
      'sepolia': 'eth.png'
    };

    const logoFile = networkLogos[currentState.network];
    if (logoFile) {
      logoEl.src = chrome.runtime.getURL(`assets/logos/${logoFile}`);
      logoEl.style.display = 'block';
    } else {
      logoEl.style.display = 'none';
    }
  }
}

/**
 * Fetch token prices from PulseX and update display
 */
async function fetchAndUpdatePrices() {
  // Only fetch prices for PulseChain networks
  if (currentState.network !== 'pulsechain' && currentState.network !== 'pulsechainTestnet') {
    console.log('🫀 Price fetching not supported for', currentState.network);
    return;
  }

  // Show loading indicator
  const loadingEl = document.getElementById('price-loading');
  const usdEl = document.getElementById('balance-usd');
  if (loadingEl && usdEl) {
    usdEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
  }

  try {
    const provider = await rpc.getProvider(currentState.network);
    const prices = await fetchTokenPrices(provider, currentState.network === 'pulsechainTestnet' ? 'pulsechain' : currentState.network);

    if (prices) {
      currentState.tokenPrices = prices;
      updateBalanceDisplay(); // Refresh display with USD values
      // Prices updated
    }
  } catch (error) {
    console.error('Error fetching token prices:', error);
  } finally {
    // Hide loading indicator
    if (loadingEl && usdEl) {
      loadingEl.classList.add('hidden');
      usdEl.classList.remove('hidden');
    }
  }
}

function updateNetworkSelector() {
  // If test networks are hidden, hide testnet options in custom dropdown
  const options = document.querySelectorAll('.network-option');
  options.forEach(option => {
    const network = option.getAttribute('data-network');
    const isTestnet = network.includes('Testnet') || network === 'sepolia';
    if (isTestnet && !currentState.settings.showTestNetworks) {
      option.style.display = 'none';
    } else {
      option.style.display = 'flex';
    }
  });
}

// ===== SEND =====
async function showSendScreen() {
  // Populate send screen with current wallet info
  document.getElementById('send-from-address').textContent = currentState.address || '0x0000...0000';

  // Populate asset selector with native + tokens
  const assetSelect = document.getElementById('send-asset-select');
  const symbols = {
    'pulsechainTestnet': 'tPLS',
    'pulsechain': 'PLS',
    'ethereum': 'ETH',
    'sepolia': 'SEP'
  };

  let options = `<option value="native">Native (${symbols[currentState.network] || 'TOKEN'})</option>`;

  const allTokens = await tokens.getAllTokens(currentState.network);
  for (const token of allTokens) {
    options += `<option value="${escapeHtml(token.address)}">${escapeHtml(token.symbol)}</option>`;
  }

  assetSelect.innerHTML = options;

  // Set initial balance with formatting
  const balanceEl = document.getElementById('send-available-balance');
  const formatted = formatBalanceWithCommas(currentState.balance, 18);
  balanceEl.textContent = formatted.display;
  balanceEl.title = formatted.tooltip;
  document.getElementById('send-balance-symbol').textContent = symbols[currentState.network] || 'TOKEN';

  // Clear form
  document.getElementById('send-to-address').value = '';
  document.getElementById('send-amount').value = '';
  document.getElementById('send-password').value = '';
  document.getElementById('send-error').classList.add('hidden');

  // Reset send button state (in case it was disabled from previous transaction)
  const sendBtn = document.getElementById('btn-confirm-send');
  sendBtn.disabled = false;
  sendBtn.style.opacity = '1';
  sendBtn.style.cursor = 'pointer';
  sendBtn.textContent = 'SEND';

  // Hide password field for hardware wallets
  const activeWallet = await getActiveWallet();
  const passwordPanel = document.getElementById('send-password-panel');
  if (activeWallet && activeWallet.isHardwareWallet) {
    passwordPanel.classList.add('hidden');
  } else {
    passwordPanel.classList.remove('hidden');
  }

  // Show form and hide status section (reset state)
  document.getElementById('send-form').classList.remove('hidden');
  document.getElementById('send-status-section').classList.add('hidden');

  showScreen('screen-send');

  // Populate gas prices and nonce
  const symbol = symbols[currentState.network] || 'TOKEN';
  const txRequest = {
    from: currentState.address,
    to: currentState.address, // Dummy for estimation
    value: '0x0'
  };
  await populateSendGasPrices(currentState.network, txRequest, symbol);

  // Fetch and display nonce
  try {
    const nonceHex = await rpc.getTransactionCount(currentState.network, currentState.address, 'pending');
    const nonce = parseInt(nonceHex, 16);
    document.getElementById('send-current-nonce').textContent = nonce;
  } catch (error) {
    console.error('Error fetching nonce:', error);
    document.getElementById('send-current-nonce').textContent = 'Error';
  }

  // Setup custom nonce checkbox
  const customNonceCheckbox = document.getElementById('send-custom-nonce-checkbox');
  const customNonceContainer = document.getElementById('send-custom-nonce-input-container');
  customNonceCheckbox.checked = false;
  customNonceContainer.classList.add('hidden');

  // Remove old listener if exists and add new one
  const newCheckbox = customNonceCheckbox.cloneNode(true);
  customNonceCheckbox.parentNode.replaceChild(newCheckbox, customNonceCheckbox);

  document.getElementById('send-custom-nonce-checkbox').addEventListener('change', (e) => {
    if (e.target.checked) {
      customNonceContainer.classList.remove('hidden');
      const currentNonce = document.getElementById('send-current-nonce').textContent;
      if (currentNonce !== '--' && currentNonce !== 'Error') {
        document.getElementById('send-custom-nonce').value = currentNonce;
      }
    } else {
      customNonceContainer.classList.add('hidden');
    }
  });
}

async function handleAssetChange() {
  const assetSelect = document.getElementById('send-asset-select');
  const selectedValue = assetSelect.value;

  const symbols = {
    'pulsechainTestnet': 'tPLS',
    'pulsechain': 'PLS',
    'ethereum': 'ETH',
    'sepolia': 'SEP'
  };

  const balanceEl = document.getElementById('send-available-balance');

  if (selectedValue === 'native') {
    const formatted = formatBalanceWithCommas(currentState.balance, 18);
    balanceEl.textContent = formatted.display;
    balanceEl.title = formatted.tooltip;
    document.getElementById('send-balance-symbol').textContent = symbols[currentState.network] || 'TOKEN';
  } else {
    // Get token balance
    try {
      const allTokens = await tokens.getAllTokens(currentState.network);
      const token = allTokens.find(t => t.address === selectedValue);

      if (token) {
        const balanceWei = await erc20.getTokenBalance(currentState.network, token.address, currentState.address);
        const rawBalance = erc20.formatTokenBalance(balanceWei, token.decimals, 4);
        const formatted = formatBalanceWithCommas(rawBalance, token.decimals);
        balanceEl.textContent = formatted.display;
        balanceEl.title = formatted.tooltip;
        document.getElementById('send-balance-symbol').textContent = token.symbol;
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  }
}

async function handleSendMax() {
  // Set amount to available balance (minus estimated gas fee)
  const balance = parseFloat(currentState.balance);
  if (balance <= 0) return;

  try {
    // Get current gas price selection from SEND screen
    const selectedSpeed = document.querySelector('input[name="send-gas-speed"]:checked')?.value;

    let gweiText;
    if (selectedSpeed === 'slow') {
      gweiText = document.getElementById('send-gas-slow-price').textContent;
    } else if (selectedSpeed === 'fast') {
      gweiText = document.getElementById('send-gas-fast-price').textContent;
    } else {
      gweiText = document.getElementById('send-gas-normal-price').textContent;
    }

    const gwei = parseFloat(gweiText);
    let gasPrice = null;
    if (gwei && gwei > 0) {
      gasPrice = ethers.parseUnits(gwei.toString(), 'gwei');
    }

    // Get estimated gas from SEND screen (default to 21000 for simple transfer)
    const estimatedGasEl = document.getElementById('send-estimated-gas');
    const estimatedGas = estimatedGasEl && estimatedGasEl.textContent && estimatedGasEl.textContent !== '--'
      ? BigInt(estimatedGasEl.textContent.replace(/[^\d]/g, ''))  // Remove any non-digit characters like "(default)"
      : 21000n;

    // Calculate gas fee in PLS
    let gasFeeInPLS = 0;
    if (gasPrice) {
      // gasPrice is in wei, convert to PLS (wei / 10^18)
      const gasFeeWei = gasPrice * estimatedGas;
      gasFeeInPLS = parseFloat(ethers.formatEther(gasFeeWei));
    } else {
      // Fallback: use rough estimate if no gas price selected yet
      gasFeeInPLS = 0.05; // More conservative estimate
    }

    // Calculate max sendable amount
    const maxSend = Math.max(0, balance - gasFeeInPLS);

    // Set the amount with proper precision
    document.getElementById('send-amount').value = maxSend.toFixed(18).replace(/\.?0+$/, '');
  } catch (error) {
    console.error('Error calculating max send amount:', error);
    // Fallback to simple estimate
    const maxSend = Math.max(0, balance - 0.05);
    document.getElementById('send-amount').value = maxSend.toString();
  }
}

async function handleSendTransaction() {
  const toAddress = document.getElementById('send-to-address').value.trim();
  const amount = document.getElementById('send-amount').value.trim();
  const password = document.getElementById('send-password').value;
  const assetSelect = document.getElementById('send-asset-select');
  const selectedAsset = assetSelect.value;
  const errorEl = document.getElementById('send-error');

  const symbols = {
    'pulsechainTestnet': 'tPLS',
    'pulsechain': 'PLS',
    'ethereum': 'ETH',
    'sepolia': 'SEP'
  };

  // Check if active wallet is hardware wallet
  const activeWallet = await getActiveWallet();
  const isHardwareWallet = activeWallet && activeWallet.isHardwareWallet;

  // Validate inputs (password not required for hardware wallets)
  if (!toAddress || !amount) {
    errorEl.textContent = 'Please fill in all fields';
    errorEl.classList.remove('hidden');
    return;
  }

  if (!isHardwareWallet && !password) {
    errorEl.textContent = 'Please enter your password';
    errorEl.classList.remove('hidden');
    return;
  }

  // Validate address format
  if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    errorEl.textContent = 'Invalid recipient address';
    errorEl.classList.remove('hidden');
    return;
  }

  // Validate amount
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    errorEl.textContent = 'Invalid amount';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    errorEl.classList.add('hidden');

    // Disable send button to prevent double-clicking
    const sendBtn = document.getElementById('btn-confirm-send');
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
    sendBtn.style.cursor = 'not-allowed';

    // Get selected gas price
    const gasPrice = getSelectedSendGasPrice();

    // Get custom nonce if provided
    const customNonceCheckbox = document.getElementById('send-custom-nonce-checkbox');
    const customNonceInput = document.getElementById('send-custom-nonce');
    let customNonce = null;
    if (customNonceCheckbox.checked && customNonceInput.value) {
      customNonce = parseInt(customNonceInput.value);
      if (isNaN(customNonce) || customNonce < 0) {
        throw new Error('Invalid custom nonce');
      }
    }

    // Get provider
    const provider = await rpc.getProvider(currentState.network);

    let signer, connectedSigner;

    if (isHardwareWallet) {
      // Hardware wallet - no password unlock needed
      // Signer will be created differently for Ledger
      errorEl.textContent = 'Please confirm transaction on your Ledger device...';
      errorEl.classList.remove('hidden');
    } else {
      // Software wallet - unlock with password and auto-upgrade if needed
      // Show progress bar
      const progressContainer = document.getElementById('send-progress-container');
      const progressBar = document.getElementById('send-progress-bar');
      const progressText = document.getElementById('send-progress-text');

      progressContainer.classList.remove('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = '0%';

      let lastDisplayedPercentage = 0;
      const unlockResult = await unlockWallet(password, {
        onProgress: (progress) => {
          const percentage = Math.round(progress * 100);
          if (percentage !== lastDisplayedPercentage) {
            lastDisplayedPercentage = percentage;
            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (progressText) progressText.textContent = `${percentage}%`;
          }
        },
        onUpgradeStart: (info) => {
          const isVersionUpgrade = info.versionBefore < 3;
          const upgradeType = isVersionUpgrade ? 'version' : 'parameters';
          const targetLabel = info.paramsAfter?.label || `${info.paramsAfter?.iterations} iterations`;

          console.log(`🔐 Auto-upgrading wallet ${upgradeType}: v${info.versionBefore} → v${info.versionAfter} (${targetLabel})`);
          const statusDiv = document.createElement('div');
          statusDiv.className = 'status-message info';
          statusDiv.textContent = `🔐 Upgrading wallet security to Argon2id (${targetLabel})...`;
          errorEl.parentElement.insertBefore(statusDiv, errorEl);
          setTimeout(() => statusDiv.remove(), 3000);
        }
      });

      // Hide progress bar
      progressContainer.classList.add('hidden');

      signer = unlockResult.signer;
      if (unlockResult.upgraded) {
        const beforeLabel = unlockResult.paramsBefore
          ? `v${unlockResult.versionBefore} (${unlockResult.paramsBefore.label || 'Legacy'})`
          : `v${unlockResult.versionBefore} (Legacy)`;
        const afterLabel = `v${unlockResult.versionAfter} (${unlockResult.paramsAfter.label})`;
        console.log(`✅ Wallet upgraded: ${beforeLabel} → ${afterLabel}`);
      }
      connectedSigner = signer.connect(provider);
    }

    let txResponse, symbol;

    if (selectedAsset === 'native') {
      // Send native currency
      const tx = {
        to: toAddress,
        value: ethers.parseEther(amount)
      };

      // Add gas price if selected
      if (gasPrice) {
        tx.gasPrice = gasPrice;
      }

      // Add custom nonce if provided
      if (customNonce !== null) {
        tx.nonce = customNonce;
      }

      if (isHardwareWallet) {
        // Ledger wallet - need to populate full transaction details
        const chainIdMap = {
          'pulsechain': 369,
          'pulsechainTestnet': 943,
          'ethereum': 1,
          'sepolia': 11155111
        };

        // Add chain ID
        tx.chainId = chainIdMap[currentState.network] || 943;

        // Add from address for gas estimation
        tx.from = currentState.address;

        // Get nonce if not custom
        if (tx.nonce === undefined) {
          const nonceHex = await rpc.getTransactionCount(currentState.network, currentState.address, 'pending');
          tx.nonce = parseInt(nonceHex, 16);
        }

        // Use pre-estimated gas if available (important for "Send Max" to avoid circular dependency)
        const estimatedGasEl = document.getElementById('send-estimated-gas');
        if (estimatedGasEl && estimatedGasEl.textContent && estimatedGasEl.textContent !== '--') {
          // Use the gas we already estimated when the user entered the recipient address
          tx.gasLimit = BigInt(estimatedGasEl.textContent.replace(/[^\d]/g, ''));
        } else {
          // Fallback: estimate gas limit
          tx.gasLimit = await provider.estimateGas(tx);
        }

        // Remove 'from' field before signing
        delete tx.from;

        // Sign and broadcast
        const signedTx = await ledger.signTransaction(activeWallet.accountIndex, tx);
        txResponse = await provider.broadcastTransaction(signedTx);
      } else {
        // Software wallet - use signer
        txResponse = await connectedSigner.sendTransaction(tx);
      }
      symbol = symbols[currentState.network] || 'tokens';
    } else {
      // Send token
      const allTokens = await tokens.getAllTokens(currentState.network);
      const token = allTokens.find(t => t.address === selectedAsset);

      if (!token) {
        throw new Error('Token not found');
      }

      const amountWei = erc20.parseTokenAmount(amount, token.decimals);

      // For token transfers, we need to pass gas options to the transfer function
      const txOptions = {};
      if (gasPrice) {
        txOptions.gasPrice = gasPrice;
      }
      if (customNonce !== null) {
        txOptions.nonce = customNonce;
      }

      if (isHardwareWallet) {
        // Ledger wallet - build contract call transaction
        const tokenContract = new ethers.Contract(
          token.address,
          ['function transfer(address to, uint256 amount) returns (bool)'],
          provider
        );

        // Build the transaction
        const unsignedTx = await tokenContract.transfer.populateTransaction(toAddress, amountWei);
        const tx = {
          ...unsignedTx,
          ...txOptions,
          from: currentState.address  // Required for gas estimation
        };

        // Add chain ID
        const chainIdMap = {
          'pulsechain': 369,
          'pulsechainTestnet': 943,
          'ethereum': 1,
          'sepolia': 11155111
        };
        tx.chainId = chainIdMap[currentState.network] || 943;

        // Get nonce if not custom
        if (tx.nonce === undefined) {
          const nonceHex = await rpc.getTransactionCount(currentState.network, currentState.address, 'pending');
          tx.nonce = parseInt(nonceHex, 16);
        }

        // Estimate gas limit if not set
        if (!tx.gasLimit) {
          // Use pre-estimated gas if available (important for "Send Max" to avoid circular dependency)
          const estimatedGasEl = document.getElementById('send-estimated-gas');
          if (estimatedGasEl && estimatedGasEl.textContent && estimatedGasEl.textContent !== '--') {
            tx.gasLimit = BigInt(estimatedGasEl.textContent.replace(/[^\d]/g, ''));
          } else {
            tx.gasLimit = await provider.estimateGas(tx);
          }
        }

        // Remove 'from' field before signing (Ledger will add it)
        delete tx.from;

        // Sign with Ledger and broadcast
        const signedTx = await ledger.signTransaction(activeWallet.accountIndex, tx);
        txResponse = await provider.broadcastTransaction(signedTx);
      } else {
        // Software wallet - use signer
        const tokenContract = new ethers.Contract(
          token.address,
          ['function transfer(address to, uint256 amount) returns (bool)'],
          connectedSigner
        );
        txResponse = await tokenContract.transfer(toAddress, amountWei, txOptions);
      }
      symbol = token.symbol;
    }

    // Save transaction to history and start monitoring
    await chrome.runtime.sendMessage({
      type: 'SAVE_AND_MONITOR_TX',
      address: currentState.address,
      transaction: {
        hash: txResponse.hash,
        timestamp: Date.now(),
        from: currentState.address,
        to: toAddress,
        value: selectedAsset === 'native' ? ethers.parseEther(amount).toString() : '0',
        gasPrice: gasPrice || (await txResponse.provider.getFeeData()).gasPrice.toString(),
        nonce: txResponse.nonce,
        network: currentState.network,
        status: 'pending',
        blockNumber: null,
        type: selectedAsset === 'native' ? 'send' : 'token'
      }
    });

    // Send desktop notification
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
        title: 'Transaction Sent',
        message: `Sending ${amount} ${symbol} to ${toAddress.slice(0, 10)}...`,
        priority: 2
      });
    }

    // Show transaction status screen
    await showSendTransactionStatus(txResponse.hash, currentState.network, amount, symbol);

  } catch (error) {
    console.error('Send transaction error:', error);

    // Provide user-friendly error messages
    let errorMessage;
    if (error.message.includes('incorrect password')) {
      errorMessage = 'Incorrect password';
    } else if (error.message.includes('Blind signing') || error.message.includes('Contract data')) {
      // Ledger requires enabling contract data for token/contract interactions
      errorMessage = `Ledger Setting Required:

1. On your Ledger device, open the Ethereum app
2. Press both buttons on "Settings"
3. Find "Contract data" or "Blind signing"
4. Enable it (press both buttons to toggle ON)
5. Exit settings and try again

This allows your Ledger to sign smart contract transactions (token transfers, swaps, etc.)`;
    } else {
      errorMessage = 'Transaction failed: ' + error.message;
    }

    errorEl.textContent = errorMessage;
    errorEl.classList.remove('hidden');

    // Re-enable send button on error
    const sendBtn = document.getElementById('btn-confirm-send');
    sendBtn.disabled = false;
    sendBtn.style.opacity = '1';
    sendBtn.style.cursor = 'pointer';
  }
}

function showTransactionSuccessModal(txHash) {
  document.getElementById('tx-success-hash').textContent = txHash;
  document.getElementById('modal-tx-success').classList.remove('hidden');
}

async function waitForTransactionConfirmation(txHash, amount, symbol) {
  try {
    const provider = await rpc.getProvider(currentState.network);

    // Wait for transaction to be mined (1 confirmation)
    const receipt = await provider.waitForTransaction(txHash, 1);

    if (receipt && receipt.status === 1) {
      // Transaction confirmed successfully
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
          title: 'Transaction Confirmed',
          message: `${amount} ${symbol} transfer confirmed on-chain!`,
          priority: 2
        });
      }

      // Auto-refresh balance
      await fetchBalance();
    } else {
      // Transaction failed
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
          title: 'Transaction Failed',
          message: 'Transaction was reverted or failed on-chain',
          priority: 2
        });
      }
    }
  } catch (error) {
    console.error('Error waiting for confirmation:', error);
  }
}

// ===== RECEIVE =====
async function showReceiveScreen() {
  const address = currentState.address;

  // Update address display
  document.getElementById('receive-address').textContent = address;

  // Update network info
  const networkNames = {
    'pulsechainTestnet': 'PulseChain Testnet V4',
    'pulsechain': 'PulseChain Mainnet',
    'ethereum': 'Ethereum Mainnet',
    'sepolia': 'Sepolia Testnet'
  };
  const symbols = {
    'pulsechainTestnet': 'tPLS',
    'pulsechain': 'PLS',
    'ethereum': 'ETH',
    'sepolia': 'SEP'
  };
  document.getElementById('receive-network-name').textContent = networkNames[currentState.network] || 'Unknown Network';
  document.getElementById('receive-network-symbol').textContent = symbols[currentState.network] || 'TOKEN';

  // Generate QR code
  try {
    const canvas = document.getElementById('receive-qr-canvas');
    await QRCode.toCanvas(canvas, address, {
      width: 200,
      margin: 2,
      color: {
        dark: getComputedStyle(document.body).getPropertyValue('--terminal-fg').trim(),
        light: getComputedStyle(document.body).getPropertyValue('--terminal-bg').trim()
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
  }

  showScreen('screen-receive');
}

async function handleCopyReceiveAddress() {
  try {
    await navigator.clipboard.writeText(currentState.address);
    const btn = document.getElementById('btn-copy-receive-address');
    const originalText = btn.textContent;
    btn.textContent = 'COPIED!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (error) {
    alert('Failed to copy address');
  }
}

// ===== TOKENS =====
async function showTokensScreen() {
  // Switch to screen first so user sees loading indicator
  showScreen('screen-tokens');

  // Small delay to ensure screen is visible before starting render
  await new Promise(resolve => setTimeout(resolve, 10));

  // Now render tokens (loading indicator will be visible)
  await renderTokensScreen();
}

async function renderTokensScreen() {
  const network = currentState.network;

  // Show loading, hide panels
  const loadingEl = document.getElementById('tokens-loading');
  const defaultPanel = document.getElementById('default-tokens-panel');
  const customPanel = document.getElementById('custom-tokens-panel');

  if (loadingEl) loadingEl.classList.remove('hidden');
  if (defaultPanel) defaultPanel.classList.add('hidden');
  if (customPanel) customPanel.classList.add('hidden');

  try {
    // Render default tokens
    await renderDefaultTokens(network);

    // Render custom tokens
    await renderCustomTokens(network);
  } finally {
    // Hide loading, show panels
    if (loadingEl) loadingEl.classList.add('hidden');
    if (defaultPanel) defaultPanel.classList.remove('hidden');
    if (customPanel) customPanel.classList.remove('hidden');
  }
}

async function renderDefaultTokens(network) {
  const defaultTokensEl = document.getElementById('default-tokens-list');
  const networkDefaults = tokens.DEFAULT_TOKENS[network] || {};
  const enabledDefaults = await tokens.getEnabledDefaultTokens(network);

  if (Object.keys(networkDefaults).length === 0) {
    defaultTokensEl.innerHTML = '<p class="text-center text-dim" style="font-size: 11px; padding: 16px;">No default tokens for this network</p>';
    return;
  }

  let html = '';
  for (const symbol in networkDefaults) {
    const token = networkDefaults[symbol];
    const isEnabled = enabledDefaults.includes(symbol);

    // Fetch balance if enabled
    let balanceText = '-';
    let balanceTooltip = '';
    let usdValue = null;
    if (isEnabled && currentState.address) {
      try {
        const balanceWei = await erc20.getTokenBalance(network, token.address, currentState.address);
        const rawBalance = erc20.formatTokenBalance(balanceWei, token.decimals, 4);
        const formatted = formatBalanceWithCommas(rawBalance, token.decimals);
        balanceText = formatted.display;
        balanceTooltip = formatted.tooltip;

        // Calculate USD value if prices available
        if (currentState.tokenPrices) {
          usdValue = getTokenValueUSD(symbol, balanceWei, token.decimals, currentState.tokenPrices);
        }
      } catch (error) {
        balanceText = 'Error';
      }
    }

    const logoUrl = token.logo ? chrome.runtime.getURL(`assets/logos/${token.logo}`) : '';

    html += `
      <div class="token-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 8px; border-bottom: 1px solid var(--terminal-border);">
        ${token.logo ?
          (token.homeUrl ?
            `<img src="${logoUrl}" alt="${escapeHtml(token.symbol)}" style="width: 32px; height: 32px; margin-right: 12px; border-radius: 50%; cursor: pointer;" class="token-logo-link" data-url="${token.homeUrl}" title="Visit ${escapeHtml(token.name)} homepage" />` :
            `<img src="${logoUrl}" alt="${escapeHtml(token.symbol)}" style="width: 32px; height: 32px; margin-right: 12px; border-radius: 50%;" />`) :
          '<div style="width: 32px; height: 32px; margin-right: 12px; background: var(--terminal-border); border-radius: 50%;"></div>'}
        <div style="flex: 1;">
          <p style="font-size: 15px; font-weight: bold;">${escapeHtml(token.symbol)}</p>
          <p class="text-dim ${token.dexScreenerUrl ? 'token-name-link' : ''}" style="font-size: 13px; ${token.dexScreenerUrl ? 'cursor: pointer; text-decoration: underline;' : ''}" ${token.dexScreenerUrl ? `data-url="${token.dexScreenerUrl}" title="View ${escapeHtml(token.name)} on DexScreener"` : ''}>${escapeHtml(token.name)}</p>
          <p class="text-dim" style="font-size: 11px; font-family: var(--font-mono); display: flex; align-items: center; gap: 4px;">
            <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis;">${token.address}</span>
            <button class="copy-address-btn" data-address="${token.address}" style="background: none; border: none; color: var(--terminal-accent); cursor: pointer; font-size: 11px; padding: 2px 4px;" title="Copy contract address">📋</button>
          </p>
          ${isEnabled ? `
            <p class="text-dim" style="font-size: 13px; cursor: help;" title="${balanceTooltip}">Balance: ${balanceText}</p>
            ${usdValue !== null ? `<p class="text-dim" style="font-size: 12px; margin-top: 2px;">${formatUSD(usdValue)}</p>` : ''}
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; margin-left: 8px;">
          <button class="view-token-details-btn" data-token-symbol="${symbol}" data-is-default="true" style="background: var(--terminal-accent); border: none; color: #000; cursor: pointer; font-size: 18px; padding: 4px 8px; border-radius: 4px;" title="View token details">ℹ️</button>
        </div>
      </div>
    `;
  }

  defaultTokensEl.innerHTML = html;

  // Add event listeners for view details buttons
  defaultTokensEl.querySelectorAll('.view-token-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const symbol = e.target.dataset.tokenSymbol;
      const isDefault = e.target.dataset.isDefault === 'true';
      showTokenDetails(symbol, isDefault);
    });
  });

  // Add event listeners for copy address buttons
  defaultTokensEl.querySelectorAll('.copy-address-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const address = e.target.dataset.address;
      try {
        await navigator.clipboard.writeText(address);
        const originalText = e.target.textContent;
        e.target.textContent = '✓';
        setTimeout(() => {
          e.target.textContent = originalText;
        }, 1000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    });
  });

  // Add event listeners for logo clicks (open homepage)
  defaultTokensEl.querySelectorAll('.token-logo-link').forEach(img => {
    img.addEventListener('click', (e) => {
      const url = e.target.dataset.url;
      chrome.tabs.create({ url });
    });
  });

  // Add event listeners for name clicks (open DexScreener)
  defaultTokensEl.querySelectorAll('.token-name-link').forEach(p => {
    p.addEventListener('click', (e) => {
      const url = e.currentTarget.dataset.url;
      if (url) {
        chrome.tabs.create({ url });
      }
    });
  });
}

async function renderCustomTokens(network) {
  const customTokensEl = document.getElementById('custom-tokens-list');
  const customTokens = await tokens.getCustomTokens(network);

  if (customTokens.length === 0) {
    customTokensEl.innerHTML = '<p class="text-center text-dim" style="font-size: 11px; padding: 16px;">No custom tokens added</p>';
    return;
  }

  let html = '';
  for (const token of customTokens) {
    // Fetch balance
    let balanceText = '-';
    let balanceTooltip = '';
    let usdValue = null;
    if (currentState.address) {
      try {
        const balanceWei = await erc20.getTokenBalance(network, token.address, currentState.address);
        const rawBalance = erc20.formatTokenBalance(balanceWei, token.decimals, 4);
        const formatted = formatBalanceWithCommas(rawBalance, token.decimals);
        balanceText = formatted.display;
        balanceTooltip = formatted.tooltip;

        // Calculate USD value if prices available and token is known
        if (currentState.tokenPrices) {
          usdValue = getTokenValueUSD(token.symbol, balanceWei, token.decimals, currentState.tokenPrices);
        }
      } catch (error) {
        balanceText = 'Error';
      }
    }

    const logoUrl = token.logo ? chrome.runtime.getURL(`assets/logos/${token.logo}`) : '';

    html += `
      <div class="token-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 8px; border-bottom: 1px solid var(--terminal-border);">
        ${token.logo ?
          (token.homeUrl ?
            `<img src="${logoUrl}" alt="${escapeHtml(token.symbol)}" style="width: 32px; height: 32px; margin-right: 12px; border-radius: 50%; cursor: pointer;" class="token-logo-link" data-url="${token.homeUrl}" title="Visit ${escapeHtml(token.name)} homepage" />` :
            `<img src="${logoUrl}" alt="${escapeHtml(token.symbol)}" style="width: 32px; height: 32px; margin-right: 12px; border-radius: 50%;" />`) :
          '<div style="width: 32px; height: 32px; margin-right: 12px; background: var(--terminal-border); border-radius: 50%;"></div>'}
        <div style="flex: 1;">
          <p style="font-size: 15px; font-weight: bold;">${escapeHtml(token.symbol)}</p>
          <p class="text-dim ${token.dexScreenerUrl ? 'token-name-link' : ''}" style="font-size: 13px; ${token.dexScreenerUrl ? 'cursor: pointer; text-decoration: underline;' : ''}" ${token.dexScreenerUrl ? `data-url="${token.dexScreenerUrl}" title="View ${escapeHtml(token.name)} on DexScreener"` : ''}>${escapeHtml(token.name)}</p>
          <p class="text-dim" style="font-size: 11px; font-family: var(--font-mono); display: flex; align-items: center; gap: 4px;">
            <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis;">${token.address}</span>
            <button class="copy-address-btn" data-address="${token.address}" style="background: none; border: none; color: var(--terminal-accent); cursor: pointer; font-size: 11px; padding: 2px 4px;" title="Copy contract address">📋</button>
          </p>
          <p class="text-dim" style="font-size: 13px; cursor: help;" title="${balanceTooltip}">Balance: ${balanceText}</p>
          ${usdValue !== null ? `<p class="text-dim" style="font-size: 12px; margin-top: 2px;">${formatUSD(usdValue)}</p>` : ''}
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; align-items: center; margin-left: 8px; min-width: 80px;">
          <button class="view-token-details-btn" data-token-symbol="${token.symbol}" data-is-default="false" data-token-address="${token.address}" style="background: var(--terminal-accent); border: none; color: #000; cursor: pointer; font-size: 18px; padding: 4px 8px; border-radius: 4px;" title="View token details">ℹ️</button>
          <button class="btn-danger btn-small remove-token-btn" data-token-address="${token.address}" style="width: 100%; font-size: 9px; padding: 2px 4px;">REMOVE</button>
        </div>
      </div>
    `;
  }

  customTokensEl.innerHTML = html;

  // Add event listeners for view details buttons
  customTokensEl.querySelectorAll('.view-token-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const symbol = e.target.dataset.tokenSymbol;
      const isDefault = e.target.dataset.isDefault === 'true';
      const address = e.target.dataset.tokenAddress;
      showTokenDetails(symbol, isDefault, address);
    });
  });

  // Add event listeners for remove buttons
  customTokensEl.querySelectorAll('.remove-token-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const address = e.target.dataset.tokenAddress;
      if (confirm('Remove this token from your list?')) {
        await tokens.removeCustomToken(network, address);
        await renderTokensScreen();
      }
    });
  });

  // Add event listeners for copy address buttons
  customTokensEl.querySelectorAll('.copy-address-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const address = e.target.dataset.address;
      try {
        await navigator.clipboard.writeText(address);
        const originalText = e.target.textContent;
        e.target.textContent = '✓';
        setTimeout(() => {
          e.target.textContent = originalText;
        }, 1000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    });
  });

  // Add event listeners for logo clicks (open homepage)
  customTokensEl.querySelectorAll('.token-logo-link').forEach(img => {
    img.addEventListener('click', (e) => {
      const url = e.target.dataset.url;
      chrome.tabs.create({ url });
    });
  });

  // Add event listeners for name clicks (open DexScreener)
  customTokensEl.querySelectorAll('.token-name-link').forEach(p => {
    p.addEventListener('click', (e) => {
      const url = e.currentTarget.dataset.url;
      if (url) {
        chrome.tabs.create({ url });
      }
    });
  });
}

// ===== TOKEN DETAILS SCREEN =====
async function showTokenDetails(symbol, isDefault, customAddress = null) {
  const network = currentState.network;

  // Get token data
  let tokenData;
  if (isDefault) {
    tokenData = tokens.DEFAULT_TOKENS[network][symbol];
  } else {
    // Find in custom tokens
    const customTokens = await tokens.getCustomTokens(network);
    tokenData = customTokens.find(t => t.address.toLowerCase() === customAddress.toLowerCase());
  }

  if (!tokenData) {
    console.error('Token not found:', symbol);
    return;
  }

  // Store current token in state
  currentState.currentTokenDetails = {
    ...tokenData,
    symbol,
    isDefault
  };

  // Update title
  document.getElementById('token-details-title').textContent = symbol.toUpperCase();

  // Update token info
  document.getElementById('token-details-name').textContent = tokenData.name;
  document.getElementById('token-details-symbol').textContent = symbol;

  // Update logo
  const logoContainer = document.getElementById('token-details-logo-container');
  if (tokenData.logo) {
    const logoUrl = chrome.runtime.getURL(`assets/logos/${tokenData.logo}`);
    logoContainer.innerHTML = `<img src="${logoUrl}" alt="${symbol}" style="width: 48px; height: 48px; border-radius: 50%;" />`;
  } else {
    logoContainer.innerHTML = '<div style="width: 48px; height: 48px; background: var(--terminal-border); border-radius: 50%;"></div>';
  }

  // Fetch and update balance
  try {
    const balanceWei = await erc20.getTokenBalance(network, tokenData.address, currentState.address);
    const balanceFormatted = erc20.formatTokenBalance(balanceWei, tokenData.decimals, 8);
    document.getElementById('token-details-balance').textContent = balanceFormatted;

    // Update USD value
    if (currentState.tokenPrices && currentState.tokenPrices[symbol]) {
      const usdValue = getTokenValueUSD(symbol, balanceWei, tokenData.decimals, currentState.tokenPrices);
      document.getElementById('token-details-balance-usd').textContent = formatUSD(usdValue);
    } else {
      document.getElementById('token-details-balance-usd').textContent = '—';
    }
  } catch (error) {
    console.error('Error fetching token balance:', error);
    document.getElementById('token-details-balance').textContent = 'Error';
    document.getElementById('token-details-balance-usd').textContent = '—';
  }

  // Update price
  if (currentState.tokenPrices && currentState.tokenPrices[symbol]) {
    document.getElementById('token-details-price').textContent = formatUSD(currentState.tokenPrices[symbol]);
  } else {
    document.getElementById('token-details-price').textContent = '—';
  }

  // Update links
  const homeLink = document.getElementById('token-details-home-link');
  if (tokenData.homeUrl) {
    homeLink.href = tokenData.homeUrl;
    homeLink.classList.remove('hidden');
  } else {
    homeLink.classList.add('hidden');
  }

  const dexLink = document.getElementById('token-details-dex-link');
  if (tokenData.dexScreenerUrl) {
    dexLink.href = tokenData.dexScreenerUrl;
    dexLink.classList.remove('hidden');
  } else {
    dexLink.classList.add('hidden');
  }

  // Sourcify link
  const chainId = network === 'pulsechain' ? 369 : network === 'pulsechainTestnet' ? 943 : 1;
  const sourcifyLink = document.getElementById('token-details-sourcify-link');
  sourcifyLink.href = `https://repo.sourcify.dev/${chainId}/${tokenData.address}`;

  // Contract address
  const shortAddress = `${tokenData.address.slice(0, 6)}...${tokenData.address.slice(-4)}`;
  document.getElementById('token-details-address-short').textContent = shortAddress;

  // Management panel (show only for default tokens)
  const managementPanel = document.getElementById('token-details-management-panel');
  if (isDefault) {
    managementPanel.classList.remove('hidden');

    // Set toggle state
    const enableToggle = document.getElementById('token-details-enable-toggle');
    const enableLabel = document.getElementById('token-details-enable-label');
    const enabledTokens = await tokens.getEnabledDefaultTokens(network);
    const isTokenEnabled = enabledTokens.includes(symbol);

    enableToggle.checked = isTokenEnabled;
    enableLabel.textContent = isTokenEnabled ? 'Enabled' : 'Disabled';
  } else {
    managementPanel.classList.add('hidden');
  }

  // Clear send form
  document.getElementById('token-details-recipient').value = '';
  document.getElementById('token-details-amount').value = '';
  document.getElementById('token-details-password').value = '';
  document.getElementById('token-details-send-error').classList.add('hidden');

  // Hide password panel for hardware wallets
  const activeWallet = await getActiveWallet();
  const passwordPanel = document.querySelector('#token-send-form .panel:has(#token-details-password)');
  if (activeWallet && activeWallet.isHardwareWallet) {
    passwordPanel.style.display = 'none';
  } else {
    passwordPanel.style.display = 'block';
  }

  // Show form and hide status section (reset state)
  document.getElementById('token-send-form').classList.remove('hidden');
  document.getElementById('token-send-status-section').classList.add('hidden');

  // Show screen
  showScreen('screen-token-details');

  // Populate gas prices and nonce
  const networkSymbols = {
    'pulsechainTestnet': 'tPLS',
    'pulsechain': 'PLS',
    'ethereum': 'ETH',
    'sepolia': 'SEP'
  };
  const networkSymbol = networkSymbols[network] || 'TOKEN';

  // Create a token transfer transaction for gas estimation
  const provider = await rpc.getProvider(network);
  const tokenContract = new ethers.Contract(
    tokenData.address,
    ['function transfer(address to, uint256 amount) returns (bool)'],
    provider
  );
  const dummyAmount = ethers.parseUnits('1', tokenData.decimals);
  const txRequest = {
    from: currentState.address,
    to: tokenData.address,
    data: tokenContract.interface.encodeFunctionData('transfer', [currentState.address, dummyAmount])
  };

  await populateTokenGasPrices(network, txRequest, networkSymbol);

  // Fetch and display nonce
  try {
    const nonceHex = await rpc.getTransactionCount(network, currentState.address, 'pending');
    const nonce = parseInt(nonceHex, 16);
    document.getElementById('token-current-nonce').textContent = nonce;
  } catch (error) {
    console.error('Error fetching nonce:', error);
    document.getElementById('token-current-nonce').textContent = 'Error';
  }

  // Setup custom nonce checkbox
  const customNonceCheckbox = document.getElementById('token-custom-nonce-checkbox');
  const customNonceContainer = document.getElementById('token-custom-nonce-input-container');
  customNonceCheckbox.checked = false;
  customNonceContainer.classList.add('hidden');

  // Remove old listener if exists and add new one
  const newCheckbox = customNonceCheckbox.cloneNode(true);
  customNonceCheckbox.parentNode.replaceChild(newCheckbox, customNonceCheckbox);

  document.getElementById('token-custom-nonce-checkbox').addEventListener('change', (e) => {
    if (e.target.checked) {
      customNonceContainer.classList.remove('hidden');
      const currentNonce = document.getElementById('token-current-nonce').textContent;
      if (currentNonce !== '--' && currentNonce !== 'Error') {
        document.getElementById('token-custom-nonce').value = currentNonce;
      }
    } else {
      customNonceContainer.classList.add('hidden');
    }
  });
}

function handleCopyTokenDetailsAddress() {
  const tokenData = currentState.currentTokenDetails;
  if (!tokenData) return;

  navigator.clipboard.writeText(tokenData.address).then(() => {
    const btn = document.getElementById('token-details-copy-address');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>✓</span><span>Copied!</span>';
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2000);
  });
}

async function handleTokenSendMax() {
  const tokenData = currentState.currentTokenDetails;
  if (!tokenData) return;

  try {
    const balanceWei = await erc20.getTokenBalance(currentState.network, tokenData.address, currentState.address);
    const balanceFormatted = erc20.formatTokenBalance(balanceWei, tokenData.decimals, 18);
    document.getElementById('token-details-amount').value = balanceFormatted;
  } catch (error) {
    console.error('Error getting max balance:', error);
  }
}

async function handleTokenSend() {
  const tokenData = currentState.currentTokenDetails;
  if (!tokenData) return;

  const recipient = document.getElementById('token-details-recipient').value.trim();
  const amount = document.getElementById('token-details-amount').value.trim();
  const password = document.getElementById('token-details-password').value;
  const errorEl = document.getElementById('token-details-send-error');

  // Clear previous errors
  errorEl.classList.add('hidden');

  // Check if this is a hardware wallet
  const activeWallet = await getActiveWallet();
  const isHardwareWallet = activeWallet && activeWallet.isHardwareWallet;

  // Validate inputs
  if (!recipient || !amount) {
    errorEl.textContent = 'Please fill all fields';
    errorEl.classList.remove('hidden');
    return;
  }

  // Validate password for software wallets only
  if (!isHardwareWallet && !password) {
    errorEl.textContent = 'Please enter your password';
    errorEl.classList.remove('hidden');
    return;
  }

  if (!recipient.startsWith('0x') || recipient.length !== 42) {
    errorEl.textContent = 'Invalid recipient address';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    // Disable send button to prevent double-clicking
    const sendBtn = document.getElementById('btn-token-send');
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
    sendBtn.style.cursor = 'not-allowed';

    const amountBN = ethers.parseUnits(amount, tokenData.decimals);

    // Check balance
    const balanceWei = await erc20.getTokenBalance(currentState.network, tokenData.address, currentState.address);
    if (amountBN > balanceWei) {
      errorEl.textContent = 'Insufficient balance';
      errorEl.classList.remove('hidden');
      // Re-enable button on validation error
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
      sendBtn.style.cursor = 'pointer';
      return;
    }

    // Get selected gas price
    const gasPrice = getSelectedTokenGasPrice();

    // Get custom nonce if provided
    const customNonceCheckbox = document.getElementById('token-custom-nonce-checkbox');
    const customNonceInput = document.getElementById('token-custom-nonce');
    let customNonce = null;
    if (customNonceCheckbox.checked && customNonceInput.value) {
      customNonce = parseInt(customNonceInput.value);
      if (isNaN(customNonce) || customNonce < 0) {
        throw new Error('Invalid custom nonce');
      }
    }

    // Get provider with automatic failover
    const provider = await rpc.getProvider(currentState.network);

    let txResponse;

    if (isHardwareWallet) {
      // Hardware wallet (Ledger) flow
      const tokenContract = new ethers.Contract(
        tokenData.address,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        provider
      );

      // Build the transaction
      const unsignedTx = await tokenContract.transfer.populateTransaction(recipient, amountBN);
      const tx = {
        ...unsignedTx,
        from: currentState.address  // Required for gas estimation
      };

      // Add chain ID
      const chainIdMap = {
        'pulsechain': 369,
        'pulsechainTestnet': 943,
        'ethereum': 1,
        'sepolia': 11155111
      };
      tx.chainId = chainIdMap[currentState.network] || 943;

      // Add gas price
      if (gasPrice) {
        tx.gasPrice = gasPrice;
      }

      // Get nonce if not custom
      if (customNonce !== null) {
        tx.nonce = customNonce;
      } else {
        const nonceHex = await rpc.getTransactionCount(currentState.network, currentState.address, 'pending');
        tx.nonce = parseInt(nonceHex, 16);
      }

      // Estimate gas limit if not set
      if (!tx.gasLimit) {
        tx.gasLimit = await provider.estimateGas(tx);
      }

      // Remove 'from' field before signing (Ledger will add it)
      delete tx.from;

      // Sign with Ledger and broadcast
      const signedTx = await ledger.signTransaction(activeWallet.accountIndex, tx);
      txResponse = await provider.broadcastTransaction(signedTx);

    } else {
      // Software wallet flow
      // Show progress bar
      const progressContainer = document.getElementById('token-send-progress-container');
      const progressBar = document.getElementById('token-send-progress-bar');
      const progressText = document.getElementById('token-send-progress-text');

      progressContainer.classList.remove('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = '0%';

      let signer;
      try {
        let lastDisplayedPercentage = 0;
        const unlockResult = await unlockWallet(password, {
          onProgress: (progress) => {
            const percentage = Math.round(progress * 100);
            if (percentage !== lastDisplayedPercentage) {
              lastDisplayedPercentage = percentage;
              if (progressBar) progressBar.style.width = `${percentage}%`;
              if (progressText) progressText.textContent = `${percentage}%`;
            }
          },
          onUpgradeStart: (info) => {
            console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
          }
        });

        // Hide progress bar
        progressContainer.classList.add('hidden');

        signer = unlockResult.signer;

        if (unlockResult.upgraded) {
          console.log(`✅ Wallet upgraded: ${unlockResult.iterationsBefore.toLocaleString()} → ${unlockResult.iterationsAfter.toLocaleString()}`);
        }
      } catch (err) {
        // Hide progress bar on error
        progressContainer.classList.add('hidden');

        errorEl.textContent = err.message || 'Incorrect password';
        errorEl.classList.remove('hidden');
        // Re-enable button on password error
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
        sendBtn.style.cursor = 'pointer';
        return;
      }

      const connectedSigner = signer.connect(provider);

      // Send token with gas options
      const tokenContract = new ethers.Contract(
        tokenData.address,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        connectedSigner
      );

      const txOptions = {};
      if (gasPrice) {
        txOptions.gasPrice = gasPrice;
      }
      if (customNonce !== null) {
        txOptions.nonce = customNonce;
      }

      txResponse = await tokenContract.transfer(recipient, amountBN, txOptions);
    }

    // Save transaction to history and start monitoring
    await chrome.runtime.sendMessage({
      type: 'SAVE_AND_MONITOR_TX',
      address: currentState.address,
      transaction: {
        hash: txResponse.hash,
        timestamp: Date.now(),
        from: currentState.address,
        to: recipient,
        value: '0',
        gasPrice: gasPrice ? gasPrice.toString() : (await txResponse.provider.getFeeData()).gasPrice.toString(),
        nonce: txResponse.nonce,
        network: currentState.network,
        status: 'pending',
        blockNumber: null,
        type: 'token'
      }
    });

    // Send desktop notification
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
        title: 'Transaction Sent',
        message: `Sending ${amount} ${tokenData.symbol} to ${recipient.slice(0, 10)}...`,
        priority: 2
      });
    }

    // Show transaction status screen
    await showTokenSendTransactionStatus(txResponse.hash, currentState.network, amount, tokenData.symbol);

  } catch (error) {
    console.error('Error sending token:', error);

    // Provide user-friendly error messages
    let errorMessage;
    if (error.message.includes('incorrect password')) {
      errorMessage = 'Incorrect password';
    } else if (error.message.includes('Blind signing') || error.message.includes('Contract data')) {
      // Ledger requires enabling contract data for token/contract interactions
      errorMessage = `Ledger Setting Required:

1. On your Ledger device, open the Ethereum app
2. Press both buttons on "Settings"
3. Find "Contract data" or "Blind signing"
4. Enable it (press both buttons to toggle ON)
5. Exit settings and try again

This allows your Ledger to sign smart contract transactions (token transfers, swaps, etc.)`;
    } else {
      errorMessage = 'Transaction failed: ' + error.message;
    }

    errorEl.textContent = errorMessage;
    errorEl.classList.remove('hidden');

    // Re-enable send button on error
    const sendBtn = document.getElementById('btn-token-send');
    sendBtn.disabled = false;
    sendBtn.style.opacity = '1';
    sendBtn.style.cursor = 'pointer';
  }
}

async function handleTokenEnableToggle(e) {
  const tokenData = currentState.currentTokenDetails;
  if (!tokenData || !tokenData.isDefault) return;

  const isEnabled = e.target.checked;
  const label = document.getElementById('token-details-enable-label');

  // Update label
  label.textContent = isEnabled ? 'Enabled' : 'Disabled';

  // Save to storage
  await tokens.toggleDefaultToken(currentState.network, tokenData.symbol, isEnabled);

  // Note: We don't re-render the tokens screen here to avoid leaving the details page
  // The change will be reflected when the user goes back to the tokens screen
}

function showAddTokenModal() {
  document.getElementById('input-token-address').value = '';
  document.getElementById('token-preview').classList.add('hidden');
  document.getElementById('add-token-error').classList.add('hidden');
  document.getElementById('modal-add-token').classList.remove('hidden');
}

let tokenValidationTimeout;
async function handleTokenAddressInput(e) {
  const address = e.target.value.trim();
  const previewEl = document.getElementById('token-preview');
  const errorEl = document.getElementById('add-token-error');

  // Clear previous timeout
  if (tokenValidationTimeout) {
    clearTimeout(tokenValidationTimeout);
  }

  // Hide preview and error
  previewEl.classList.add('hidden');
  errorEl.classList.add('hidden');

  // Basic validation
  if (!address || address.length !== 42 || !address.startsWith('0x')) {
    return;
  }

  // Debounce the validation
  tokenValidationTimeout = setTimeout(async () => {
    try {
      const network = currentState.network;
      const metadata = await erc20.getTokenMetadata(network, address);

      // Show preview
      document.getElementById('token-preview-name').textContent = metadata.name;
      document.getElementById('token-preview-symbol').textContent = metadata.symbol;
      document.getElementById('token-preview-decimals').textContent = metadata.decimals;
      previewEl.classList.remove('hidden');
    } catch (error) {
      errorEl.textContent = 'Invalid token contract';
      errorEl.classList.remove('hidden');
    }
  }, 500);
}

async function handleAddCustomToken() {
  const address = document.getElementById('input-token-address').value.trim();
  const errorEl = document.getElementById('add-token-error');

  if (!address) {
    errorEl.textContent = 'Please enter a token address';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    errorEl.classList.add('hidden');
    await tokens.addCustomToken(currentState.network, address);

    // Close modal and refresh screen
    document.getElementById('modal-add-token').classList.add('hidden');
    await renderTokensScreen();
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.classList.remove('hidden');
  }
}

// ===== SETTINGS =====
async function loadSettingsToUI() {
  document.getElementById('setting-autolock').value = currentState.settings.autoLockMinutes;
  document.getElementById('setting-decimals').value = currentState.settings.decimalPlaces;
  document.getElementById('setting-theme').value = currentState.settings.theme;
  document.getElementById('setting-show-testnets').checked = currentState.settings.showTestNetworks;
  document.getElementById('setting-max-gas-price').value = currentState.settings.maxGasPriceGwei || 1000;
  document.getElementById('setting-allow-eth-sign').checked = currentState.settings.allowEthSign || false;
  document.getElementById('setting-enable-ledger').checked = currentState.settings.enableLedger || false;
  document.getElementById('setting-enable-trezor').checked = currentState.settings.enableTrezor || false;
  document.getElementById('setting-privacy-mode').checked = currentState.settings.privacyMode || false;

  // Fetch and display current network gas price
  fetchCurrentGasPrice();

  // Update privacy PIN setup visibility (async)
  await updatePrivacyPinSetupVisibility();
}

/**
 * Show/hide hardware wallet buttons based on settings
 */
function updateHardwareWalletButtons() {
  const enableLedger = currentState.settings.enableLedger || false;
  const enableTrezor = currentState.settings.enableTrezor || false;

  // Ledger buttons
  const ledgerButtonSetup = document.getElementById('btn-connect-ledger');
  const ledgerButtonMulti = document.getElementById('btn-connect-ledger-multi');

  if (ledgerButtonSetup) {
    ledgerButtonSetup.style.display = enableLedger ? 'block' : 'none';
  }
  if (ledgerButtonMulti) {
    ledgerButtonMulti.style.display = enableLedger ? 'inline-block' : 'none';
  }

  // Trezor buttons (for future implementation)
  // const trezorButtonSetup = document.getElementById('btn-connect-trezor');
  // const trezorButtonMulti = document.getElementById('btn-connect-trezor-multi');
  // if (trezorButtonSetup) {
  //   trezorButtonSetup.style.display = enableTrezor ? 'block' : 'none';
  // }
  // if (trezorButtonMulti) {
  //   trezorButtonMulti.style.display = enableTrezor ? 'inline-block' : 'none';
  // }
}

/**
 * Show/hide lock button based on privacy mode setting
 * When privacy mode is OFF, the lock button is hidden since there's nothing to "lock"
 * When privacy mode is ON, the lock button is shown to allow user to hide the dashboard
 */
function updateLockButtonVisibility() {
  const lockButton = document.getElementById('btn-lock');
  if (lockButton) {
    if (currentState.settings.privacyMode) {
      lockButton.style.display = 'inline-block';
      lockButton.title = 'Lock (hide dashboard)';
    } else {
      lockButton.style.display = 'none';
    }
  }
}

/**
 * Show/hide privacy PIN setup section based on wallet configuration
 * Only shown when:
 * 1. Privacy mode is enabled
 * 2. User has no software wallets (hardware-only)
 */
async function updatePrivacyPinSetupVisibility() {
  const privacyPinSetup = document.getElementById('privacy-pin-setup');
  if (!privacyPinSetup) return;

  const privacyModeEnabled = currentState.settings.privacyMode;

  if (!privacyModeEnabled) {
    privacyPinSetup.classList.add('hidden');
    return;
  }

  // Check if user has any software wallets
  const allWallets = await getAllWallets();
  const hasSoftwareWallet = allWallets.some(w => !w.isHardwareWallet);

  if (hasSoftwareWallet) {
    // User has software wallet - use that password, no need for separate PIN
    privacyPinSetup.classList.add('hidden');
  } else {
    // Hardware-only user - show privacy PIN setup
    privacyPinSetup.classList.remove('hidden');

    // Check if PIN is already set
    const storedHash = await load('privacyPinHash');
    const statusEl = document.getElementById('privacy-pin-status');
    if (storedHash && statusEl) {
      statusEl.textContent = 'Privacy PIN is set. Enter new values to change it.';
      statusEl.style.color = 'var(--terminal-dim)';
    }
  }
}

/**
 * Fetches current gas price from the network and displays it
 */
async function fetchCurrentGasPrice() {
  const labelEl = document.getElementById('current-gas-price-label');
  if (!labelEl) return;

  try {
    labelEl.textContent = 'Loading current price...';

    // Get gas price from RPC
    const gasPrice = await rpc.getGasPrice(currentState.network);

    // Convert from Wei to Gwei (1 Gwei = 1e9 Wei)
    const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice, 'gwei'));

    // Format nicely
    let displayPrice;
    if (gasPriceGwei < 0.001) {
      displayPrice = gasPriceGwei.toFixed(6); // Very low (PulseChain)
    } else if (gasPriceGwei < 1) {
      displayPrice = gasPriceGwei.toFixed(3);
    } else if (gasPriceGwei < 10) {
      displayPrice = gasPriceGwei.toFixed(2);
    } else {
      displayPrice = gasPriceGwei.toFixed(1);
    }

    const networkName = NETWORK_NAMES[currentState.network] || currentState.network;
    labelEl.textContent = `Current ${networkName} price: ${displayPrice} Gwei`;
    labelEl.style.color = 'var(--terminal-success)';
  } catch (error) {
    console.error('Error fetching gas price:', error);
    labelEl.textContent = 'Unable to fetch current price';
    labelEl.style.color = 'var(--terminal-error)';
  }
}

/**
 * Handles "USE CURRENT NETWORK PRICE" button click
 */
async function handleUseCurrentGasPrice() {
  const inputEl = document.getElementById('setting-max-gas-price');
  const labelEl = document.getElementById('current-gas-price-label');

  if (!inputEl) return;

  try {
    // Get current gas price
    const gasPrice = await rpc.getGasPrice(currentState.network);
    const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice, 'gwei'));

    // Add 20% buffer for safety (gas prices can spike)
    const bufferedPrice = gasPriceGwei * 1.2;

    // Round to reasonable precision
    let roundedPrice;
    if (bufferedPrice < 1) {
      roundedPrice = Math.ceil(bufferedPrice * 1000) / 1000; // Round to 3 decimals
    } else if (bufferedPrice < 10) {
      roundedPrice = Math.ceil(bufferedPrice * 100) / 100; // Round to 2 decimals
    } else {
      roundedPrice = Math.ceil(bufferedPrice * 10) / 10; // Round to 1 decimal
    }

    // Ensure minimum of 0.1 Gwei
    const finalPrice = Math.max(0.1, roundedPrice);

    // Update input and settings
    inputEl.value = finalPrice;
    currentState.settings.maxGasPriceGwei = finalPrice;
    saveSettings();

    // Update label to show what was set
    labelEl.textContent = `Set to ${finalPrice} Gwei (current + 20% buffer)`;
    labelEl.style.color = 'var(--terminal-success)';

    // Refresh display after 2 seconds
    setTimeout(() => fetchCurrentGasPrice(), 2000);
  } catch (error) {
    console.error('Error setting gas price:', error);
    alert('Failed to fetch current gas price. Please try again.');
  }
}

// Network Settings
const NETWORK_KEYS = ['pulsechainTestnet', 'pulsechain', 'ethereum', 'sepolia'];

function loadNetworkSettingsToUI() {
  NETWORK_KEYS.forEach(network => {
    // Load RPC endpoint
    const rpcInput = document.getElementById(`rpc-${network}`);
    if (rpcInput) {
      rpcInput.value = currentState.networkSettings?.[network]?.rpc || '';
    }

    // Load Explorer settings
    const explorerInput = document.getElementById(`explorer-${network}`);
    if (explorerInput) {
      explorerInput.value = currentState.networkSettings?.[network]?.explorerBase || '';
    }

    const txPathInput = document.getElementById(`explorer-tx-${network}`);
    if (txPathInput) {
      txPathInput.value = currentState.networkSettings?.[network]?.explorerTxPath || '';
    }

    const addrPathInput = document.getElementById(`explorer-addr-${network}`);
    if (addrPathInput) {
      addrPathInput.value = currentState.networkSettings?.[network]?.explorerAddrPath || '';
    }
  });
}

async function saveNetworkSettings() {
  const networkSettings = {};

  NETWORK_KEYS.forEach(network => {
    networkSettings[network] = {
      rpc: document.getElementById(`rpc-${network}`)?.value || '',
      explorerBase: document.getElementById(`explorer-${network}`)?.value || '',
      explorerTxPath: document.getElementById(`explorer-tx-${network}`)?.value || '',
      explorerAddrPath: document.getElementById(`explorer-addr-${network}`)?.value || ''
    };
  });

  await save('networkSettings', networkSettings);
  currentState.networkSettings = networkSettings;

  // Update runtime settings
  applyNetworkSettings();

  alert('Network settings saved! Changes will take effect on next reload.');
  showScreen('screen-settings');
}

function resetNetworkSettingsToDefaults() {
  NETWORK_KEYS.forEach(network => {
    // Reset to default RPC endpoints from rpc.js
    const defaultRPCs = {
      'pulsechainTestnet': 'https://rpc.v4.testnet.pulsechain.com',
      'pulsechain': 'https://rpc.pulsechain.com',
      'ethereum': 'https://eth.llamarpc.com',
      'sepolia': 'https://rpc.sepolia.org'
    };

    const defaultExplorers = {
      'pulsechainTestnet': {
        base: 'https://scan.v4.testnet.pulsechain.com',
        tx: '/tx/{hash}',
        addr: '/address/{address}'
      },
      'pulsechain': {
        base: 'https://scan.mypinata.cloud/ipfs/bafybeienxyoyrhn5tswclvd3gdjy5mtkkwmu37aqtml6onbf7xnb3o22pe/',
        tx: '#/tx/{hash}',
        addr: '#/address/{address}'
      },
      'ethereum': {
        base: 'https://etherscan.io',
        tx: '/tx/{hash}',
        addr: '/address/{address}'
      },
      'sepolia': {
        base: 'https://sepolia.etherscan.io',
        tx: '/tx/{hash}',
        addr: '/address/{address}'
      }
    };

    document.getElementById(`rpc-${network}`).value = defaultRPCs[network] || '';
    document.getElementById(`explorer-${network}`).value = defaultExplorers[network]?.base || '';
    document.getElementById(`explorer-tx-${network}`).value = defaultExplorers[network]?.tx || '';
    document.getElementById(`explorer-addr-${network}`).value = defaultExplorers[network]?.addr || '';
  });

  alert('Network settings reset to defaults. Click SAVE to apply.');
}

function applyNetworkSettings() {
  // This would update the runtime RPC and explorer configs
  // For now, settings take effect on reload
}

// ===== PASSWORD PROMPT MODAL =====
let passwordPromptResolve = null;

function showPasswordPrompt(title, message) {
  return new Promise((resolve) => {
    passwordPromptResolve = resolve;

    document.getElementById('password-prompt-title').textContent = title;
    document.getElementById('password-prompt-message').textContent = message;
    document.getElementById('password-prompt-input').value = '';
    document.getElementById('password-prompt-error').classList.add('hidden');
    document.getElementById('modal-password-prompt').classList.remove('hidden');

    // Focus the input
    setTimeout(() => {
      document.getElementById('password-prompt-input')?.focus();
    }, 100);
  });
}

function closePasswordPrompt(password = null) {
  document.getElementById('modal-password-prompt').classList.add('hidden');
  if (passwordPromptResolve) {
    passwordPromptResolve(password);
    passwordPromptResolve = null;
  }
}

// ===== DISPLAY SECRET MODAL =====
function showSecretModal(title, secret) {
  document.getElementById('display-secret-title').textContent = title;
  document.getElementById('display-secret-content').textContent = secret;
  document.getElementById('modal-display-secret').classList.remove('hidden');
}

function closeSecretModal() {
  document.getElementById('modal-display-secret').classList.add('hidden');
  document.getElementById('display-secret-content').textContent = '';
}

async function handleViewSeed() {
  const password = await showPasswordPrompt('View Seed Phrase', 'Enter your password to view your seed phrase');
  if (!password) return;

  const errorDiv = document.getElementById('password-prompt-error');

  try {
    const mnemonic = await exportMnemonic(password);
    closePasswordPrompt();

    if (mnemonic) {
      showSecretModal('Your Seed Phrase', mnemonic);
    } else {
      alert('This wallet was imported using a private key and has no seed phrase.');
    }
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}

async function handleExportKey() {
  const password = await showPasswordPrompt('Export Private Key', 'Enter your password to export your private key');
  if (!password) return;

  const errorDiv = document.getElementById('password-prompt-error');

  try {
    const privateKey = await exportPrivateKey(password);
    closePasswordPrompt();
    showSecretModal('Your Private Key', privateKey);
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}


// ===== MULTI-WALLET MANAGEMENT =====
let currentRenameWalletId = null;
let generatedMnemonicMulti = null;
let verificationWordsMulti = []; // Array of {index, word} for verification

// Render wallet list in manage wallets screen
async function renderWalletList() {
  const walletsData = await getAllWallets();
  const walletListDiv = document.getElementById('wallet-list');
  const walletCount = document.getElementById('wallet-count');

  walletCount.textContent = walletsData.walletList.length;

  if (walletsData.walletList.length === 0) {
    walletListDiv.innerHTML = '<p class="text-dim text-center">No wallets found</p>';
    return;
  }

  walletListDiv.innerHTML = '';

  walletsData.walletList.forEach(wallet => {
    const isActive = wallet.id === walletsData.activeWalletId;
    const walletCard = document.createElement('div');
    walletCard.className = 'panel mb-2';
    if (isActive) {
      walletCard.style.borderColor = 'var(--terminal-success)';
      walletCard.style.borderWidth = '2px';
    }

    walletCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
            ${isActive ? '✓ ' : ''}${escapeHtml(wallet.nickname || 'Unnamed Wallet')}
            ${isActive ? '<span class="text-success" style="font-size: 11px; margin-left: 8px;">[ACTIVE]</span>' : ''}
          </div>
          <div class="text-dim" style="font-size: 11px; font-family: var(--font-mono); word-break: break-all;">
            ${escapeHtml(wallet.address || 'Address not loaded')}
          </div>
          <div class="text-dim" style="font-size: 10px; margin-top: 4px;">
            ${wallet.isHardwareWallet ? `🔐 ${wallet.hardwareType.toUpperCase()} Hardware Wallet` : (wallet.importMethod === 'create' ? 'Created' : 'Imported')} • ${new Date(wallet.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div class="button-group" style="gap: 6px;">
        ${!isActive ? `<button class="btn btn-small" data-wallet-id="${wallet.id}" data-action="switch">SWITCH</button>` : ''}
        ${wallet.isHardwareWallet ? `<button class="btn btn-small" style="border-color: var(--terminal-info); color: var(--terminal-info); white-space: nowrap;" data-wallet-id="${wallet.id}" data-action="reconnect">CONNECT</button>` : ''}
        <button class="btn btn-small" data-wallet-id="${wallet.id}" data-action="rename">RENAME</button>
        ${!wallet.isHardwareWallet ? `<button class="btn btn-small" data-wallet-id="${wallet.id}" data-action="export">EXPORT</button>` : ''}
        <button class="btn btn-danger btn-small" data-wallet-id="${wallet.id}" data-action="delete">DELETE</button>
      </div>
    `;

    // Add event listeners for buttons
    const buttons = walletCard.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const walletId = btn.dataset.walletId;
        const action = btn.dataset.action;

        switch (action) {
          case 'switch':
            await handleSwitchWallet(walletId);
            break;
          case 'reconnect':
            handleReconnectLedger(walletId, wallet);
            break;
          case 'rename':
            handleRenameWalletPrompt(walletId, wallet.nickname);
            break;
          case 'export':
            await handleExportForWallet(walletId);
            break;
          case 'delete':
            await handleDeleteWalletMulti(walletId);
            break;
        }
      });
    });

    walletListDiv.appendChild(walletCard);
  });
}

// Navigate to manage wallets screen
async function handleManageWallets() {
  await renderWalletList();
  showScreen('screen-manage-wallets');
}

// Handle reconnecting to a Ledger device
function handleReconnectLedger(walletId, wallet) {
  // Open in NEW TAB (WebHID requires full page context, not popup)
  chrome.tabs.create({
    url: chrome.runtime.getURL(`src/popup/popup.html?action=reconnectLedger&walletId=${walletId}`)
  });
}

// Show add wallet modal (with 3 options)
function showAddWalletModal() {
  document.getElementById('modal-add-wallet').classList.remove('hidden');
}

// Generate mnemonic for multi-wallet creation
async function generateNewMnemonicMulti() {
  const { ethers } = await import('ethers');
  const randomWallet = ethers.Wallet.createRandom();
  generatedMnemonicMulti = randomWallet.mnemonic.phrase;
  document.getElementById('multi-mnemonic-display').textContent = generatedMnemonicMulti;

  // Set up verification (ask for 3 random words using cryptographically secure random)
  const words = generatedMnemonicMulti.split(' ');
  const randomBytes = new Uint8Array(3);
  crypto.getRandomValues(randomBytes);
  const indices = [
    randomBytes[0] % 4, // Word 1-4
    4 + (randomBytes[1] % 4), // Word 5-8
    8 + (randomBytes[2] % 4) // Word 9-12
  ];

  verificationWordsMulti = indices.map(i => ({ index: i, word: words[i] }));

  // Update UI with random indices
  document.getElementById('verify-word-1-num-multi').textContent = (verificationWordsMulti[0].index + 1);
  document.getElementById('verify-word-2-num-multi').textContent = (verificationWordsMulti[1].index + 1);
  document.getElementById('verify-word-3-num-multi').textContent = (verificationWordsMulti[2].index + 1);
}

// Handle create new wallet (multi)
async function handleCreateNewWalletMulti() {
  const nickname = document.getElementById('input-new-wallet-nickname').value.trim();
  const verificationErrorDiv = document.getElementById('verification-error-multi');

  // Verify seed phrase words
  const word1 = document.getElementById('verify-word-1-multi').value.trim().toLowerCase();
  const word2 = document.getElementById('verify-word-2-multi').value.trim().toLowerCase();
  const word3 = document.getElementById('verify-word-3-multi').value.trim().toLowerCase();

  if (!word1 || !word2 || !word3) {
    verificationErrorDiv.textContent = 'Please enter all verification words to confirm you have backed up your seed phrase.';
    verificationErrorDiv.classList.remove('hidden');
    return;
  }

  if (word1 !== verificationWordsMulti[0].word.toLowerCase() ||
      word2 !== verificationWordsMulti[1].word.toLowerCase() ||
      word3 !== verificationWordsMulti[2].word.toLowerCase()) {
    verificationErrorDiv.textContent = 'Verification words do not match. Please double-check your seed phrase backup.';
    verificationErrorDiv.classList.remove('hidden');
    return;
  }

  // Clear verification error
  verificationErrorDiv.classList.add('hidden');

  // Close modal BEFORE showing password prompt
  document.getElementById('modal-create-wallet-multi').classList.add('hidden');

  const password = await showPasswordPrompt('Enter Your Password', 'Enter your wallet password to encrypt the new wallet');

  if (!password) {
    // If cancelled, reopen the modal
    document.getElementById('modal-create-wallet-multi').classList.remove('hidden');
    return;
  }

  // Show progress bar in password prompt modal
  const progressContainer = document.getElementById('password-prompt-progress-container');
  const progressBar = document.getElementById('password-prompt-progress-bar');
  const progressText = document.getElementById('password-prompt-progress-text');
  const buttonsContainer = document.getElementById('password-prompt-buttons');

  progressContainer.classList.remove('hidden');
  buttonsContainer.classList.add('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = '0%';

  try {
    // Progress callback with throttling
    let lastDisplayedPercentage = 0;
    const onProgress = (progress) => {
      const percentage = Math.round(progress * 100);
      if (percentage !== lastDisplayedPercentage) {
        lastDisplayedPercentage = percentage;
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
      }
    };

    await addWallet('create', {}, password, nickname || null, onProgress);

    // Hide progress bar and close password prompt
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
    document.getElementById('modal-password-prompt').classList.add('hidden');

    // Clear form
    document.getElementById('input-new-wallet-nickname').value = '';
    document.getElementById('verify-word-1-multi').value = '';
    document.getElementById('verify-word-2-multi').value = '';
    document.getElementById('verify-word-3-multi').value = '';
    generatedMnemonicMulti = null;
    verificationWordsMulti = [];

    // Refresh wallet list
    await renderWalletList();

    alert('Wallet created successfully!');
  } catch (error) {
    // Hide progress bar and restore buttons
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
    document.getElementById('modal-password-prompt').classList.add('hidden');

    alert('Error creating wallet: ' + error.message);
  }
}

// Handle import from seed (multi)
async function handleImportSeedMulti() {
  const nickname = document.getElementById('input-import-seed-nickname').value.trim();
  const mnemonic = document.getElementById('input-import-seed-phrase').value.trim();
  const errorDiv = document.getElementById('import-seed-error-multi');

  errorDiv.classList.add('hidden');

  if (!mnemonic) {
    errorDiv.textContent = 'Please enter a seed phrase';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Close modal BEFORE showing password prompt
  document.getElementById('modal-import-seed-multi').classList.add('hidden');

  const password = await showPasswordPrompt('Enter Your Password', 'Enter your wallet password to encrypt the imported wallet');

  if (!password) {
    // If cancelled, reopen the modal
    document.getElementById('modal-import-seed-multi').classList.remove('hidden');
    return;
  }

  // Show progress bar in password prompt modal
  const progressContainer = document.getElementById('password-prompt-progress-container');
  const progressBar = document.getElementById('password-prompt-progress-bar');
  const progressText = document.getElementById('password-prompt-progress-text');
  const buttonsContainer = document.getElementById('password-prompt-buttons');

  progressContainer.classList.remove('hidden');
  buttonsContainer.classList.add('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = '0%';

  try {
    // Progress callback with throttling
    let lastDisplayedPercentage = 0;
    const onProgress = (progress) => {
      const percentage = Math.round(progress * 100);
      if (percentage !== lastDisplayedPercentage) {
        lastDisplayedPercentage = percentage;
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
      }
    };

    await addWallet('mnemonic', { mnemonic }, password, nickname || null, onProgress);

    // Hide progress bar and close password prompt
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
    document.getElementById('modal-password-prompt').classList.add('hidden');

    // Clear form
    document.getElementById('input-import-seed-nickname').value = '';
    document.getElementById('input-import-seed-phrase').value = '';

    // Refresh wallet list
    await renderWalletList();

    alert('Wallet imported successfully!');
  } catch (error) {
    // Hide progress bar and restore buttons
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
    document.getElementById('modal-password-prompt').classList.add('hidden');

    // Show error and reopen modal
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
    document.getElementById('modal-import-seed-multi').classList.remove('hidden');
  }
}

// Handle import from private key (multi)
async function handleImportKeyMulti() {
  const nickname = document.getElementById('input-import-key-nickname').value.trim();
  const privateKey = document.getElementById('input-import-private-key').value.trim();
  const errorDiv = document.getElementById('import-key-error-multi');

  errorDiv.classList.add('hidden');

  if (!privateKey) {
    errorDiv.textContent = 'Please enter a private key';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Close modal BEFORE showing password prompt
  document.getElementById('modal-import-key-multi').classList.add('hidden');

  const password = await showPasswordPrompt('Enter Your Password', 'Enter your wallet password to encrypt the imported wallet');

  if (!password) {
    // If cancelled, reopen the modal
    document.getElementById('modal-import-key-multi').classList.remove('hidden');
    return;
  }

  // Show progress bar in password prompt modal
  const progressContainer = document.getElementById('password-prompt-progress-container');
  const progressBar = document.getElementById('password-prompt-progress-bar');
  const progressText = document.getElementById('password-prompt-progress-text');
  const buttonsContainer = document.getElementById('password-prompt-buttons');

  progressContainer.classList.remove('hidden');
  buttonsContainer.classList.add('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = '0%';

  try {
    // Progress callback with throttling
    let lastDisplayedPercentage = 0;
    const onProgress = (progress) => {
      const percentage = Math.round(progress * 100);
      if (percentage !== lastDisplayedPercentage) {
        lastDisplayedPercentage = percentage;
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
      }
    };

    await addWallet('privatekey', { privateKey }, password, nickname || null, onProgress);

    // Hide progress bar and close password prompt
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
    document.getElementById('modal-password-prompt').classList.add('hidden');

    // Clear form
    document.getElementById('input-import-key-nickname').value = '';
    document.getElementById('input-import-private-key').value = '';

    // Refresh wallet list
    await renderWalletList();

    alert('Wallet imported successfully!');
  } catch (error) {
    // Hide progress bar and restore buttons
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
    document.getElementById('modal-password-prompt').classList.add('hidden');

    // Show error and reopen modal
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
    document.getElementById('modal-import-key-multi').classList.remove('hidden');
  }
}

// Switch to a different wallet
async function handleSwitchWallet(walletId) {
  try {
    await setActiveWallet(walletId);

    // Refresh wallet list to show new active wallet
    await renderWalletList();

    // If we're unlocked, update the dashboard
    if (currentState.isUnlocked) {
      const wallet = await getActiveWallet();
      currentState.address = wallet.address;
      updateDashboard();
    }

    alert('Switched to wallet successfully!');
  } catch (error) {
    alert('Error switching wallet: ' + error.message);
  }
}

// Show rename wallet prompt
function handleRenameWalletPrompt(walletId, currentNickname) {
  currentRenameWalletId = walletId;
  document.getElementById('input-rename-wallet-nickname').value = currentNickname || '';
  document.getElementById('modal-rename-wallet').classList.remove('hidden');
}

// Confirm rename wallet
async function handleRenameWalletConfirm() {
  const newNickname = document.getElementById('input-rename-wallet-nickname').value.trim();
  const errorDiv = document.getElementById('rename-error');

  errorDiv.classList.add('hidden');

  if (!newNickname) {
    errorDiv.textContent = 'Nickname cannot be empty';
    errorDiv.classList.remove('hidden');
    return;
  }

  try {
    await renameWallet(currentRenameWalletId, newNickname);

    // Close modal
    document.getElementById('modal-rename-wallet').classList.add('hidden');
    currentRenameWalletId = null;

    // Refresh wallet list
    await renderWalletList();

    alert('Wallet renamed successfully!');
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}

// Delete a specific wallet
async function handleDeleteWalletMulti(walletId) {
  // Check if this is a hardware wallet
  const walletsData = await getAllWallets();
  const walletToDelete = walletsData.walletList.find(w => w.id === walletId);

  if (!walletToDelete) {
    alert('Wallet not found');
    return;
  }

  const isHardwareWallet = walletToDelete.isHardwareWallet;

  const confirmed = confirm(
    '⚠️ WARNING ⚠️\n\n' +
    'You are about to DELETE this wallet!\n\n' +
    'This action is PERMANENT and CANNOT be undone.\n\n' +
    (isHardwareWallet
      ? 'You can always re-add your Ledger device later.\n\n'
      : 'Make sure you have written down your seed phrase or private key.\n\n') +
    'Do you want to continue?'
  );

  if (!confirmed) return;

  // Only ask for password if there are software wallets
  let password = '';
  if (!isHardwareWallet) {
    const hasSoftwareWallets = walletsData.walletList.some(w => !w.isHardwareWallet);

    if (hasSoftwareWallets) {
      password = await showPasswordPrompt('Delete Wallet', 'Enter your password to delete this wallet');

      if (!password) return;
    }
  }

  // Show progress bar in password prompt modal
  const progressContainer = document.getElementById('password-prompt-progress-container');
  const progressBar = document.getElementById('password-prompt-progress-bar');
  const progressText = document.getElementById('password-prompt-progress-text');
  const progressLabel = progressContainer.querySelector('.progress-label');
  const buttonsContainer = document.getElementById('password-prompt-buttons');

  progressLabel.textContent = 'Decrypting...';
  progressContainer.classList.remove('hidden');
  buttonsContainer.classList.add('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = '0%';

  try {
    // Progress callback with throttling
    let lastDisplayedPercentage = 0;
    const onProgress = (progress) => {
      const percentage = Math.round(progress * 100);
      if (percentage !== lastDisplayedPercentage) {
        lastDisplayedPercentage = percentage;
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
      }
    };

    await deleteWallet(walletId, password, { onProgress });

    // Hide progress bar and close password prompt
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
    closePasswordPrompt();

    // Refresh wallet list
    await renderWalletList();

    // If we deleted all wallets, go back to setup
    const updatedWalletsData = await getAllWallets();
    if (updatedWalletsData.walletList.length === 0) {
      currentState.isUnlocked = false;
      currentState.address = null;
      showScreen('screen-setup');
    }

    alert('Wallet deleted successfully!');
  } catch (error) {
    // Hide progress bar and restore buttons
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');

    alert('Error deleting wallet: ' + error.message);
  }
}

// Export seed/key for a specific wallet
async function handleExportForWallet(walletId) {
  const password = await showPasswordPrompt('Export Wallet', 'Enter your password to export wallet secrets');

  if (!password) return;

  // Show progress bar in password prompt modal
  const progressContainer = document.getElementById('password-prompt-progress-container');
  const progressBar = document.getElementById('password-prompt-progress-bar');
  const progressText = document.getElementById('password-prompt-progress-text');
  const progressLabel = progressContainer.querySelector('.progress-label');
  const buttonsContainer = document.getElementById('password-prompt-buttons');

  progressLabel.textContent = 'Decrypting...';
  progressContainer.classList.remove('hidden');
  buttonsContainer.classList.add('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = '0%';

  try {
    // Progress callback with throttling
    let lastDisplayedPercentage = 0;
    const onProgress = (progress) => {
      const percentage = Math.round(progress * 100);
      if (percentage !== lastDisplayedPercentage) {
        lastDisplayedPercentage = percentage;
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
      }
    };

    // Try to get mnemonic first
    const mnemonic = await exportMnemonicForWallet(walletId, password, { onProgress });

    if (mnemonic) {
      showSecretModal('Seed Phrase', mnemonic);
    } else {
      // No mnemonic, show private key
      const privateKey = await exportPrivateKeyForWallet(walletId, password, { onProgress });
      showSecretModal('Private Key', privateKey);
    }

    // Hide progress bar and close password prompt
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
    closePasswordPrompt();
  } catch (error) {
    // Hide progress bar and restore buttons
    progressContainer.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');

    alert('Error exporting wallet: ' + error.message);
  }
}

// ===== CONNECTION APPROVAL =====
async function handleConnectionApprovalScreen(origin, requestId) {
  // Load settings for theme
  await loadSettings();
  applyTheme();

  // Display the origin
  document.getElementById('connection-site-origin').textContent = origin;

  // Get active wallet address
  const wallet = await getActiveWallet();
  if (wallet && wallet.address) {
    document.getElementById('connection-wallet-address').textContent = wallet.address;
  } else {
    document.getElementById('connection-wallet-address').textContent = 'No wallet found';
  }

  // Show the connection approval screen
  showScreen('screen-connection-approval');

  // Setup approve button
  document.getElementById('btn-approve-connection').addEventListener('click', async () => {
    try {
      await chrome.runtime.sendMessage({
        type: 'CONNECTION_APPROVAL',
        requestId,
        approved: true
      });

      // Close the popup window
      window.close();
    } catch (error) {
      alert('Error approving connection: ' + sanitizeError(error.message));
    }
  });

  // Setup reject button
  document.getElementById('btn-reject-connection').addEventListener('click', async () => {
    try {
      await chrome.runtime.sendMessage({
        type: 'CONNECTION_APPROVAL',
        requestId,
        approved: false
      });

      // Close the popup window
      window.close();
    } catch (error) {
      alert('Error rejecting connection: ' + error.message);
      window.close();
    }
  });
}

// ===== TRANSACTION APPROVAL =====
// Populate gas price options
async function populateGasPrices(network, txRequest, symbol) {
  // Store params for refresh button
  gasPriceRefreshState.approval = { network, txRequest, symbol };

  try {
    // Fetch SAFE gas price from RPC (uses base fee * 2 to prevent stuck transactions)
    const gasPriceHex = await rpc.getSafeGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;

    // Calculate slow (90%), normal (100%), fast (120%)
    // Note: slow is 90% instead of 80% to ensure it's still above base fee
    const slowGwei = (gasPriceGwei * 0.9).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.2).toFixed(2);

    // Update UI
    document.getElementById('gas-slow-price').textContent = `${slowGwei} Gwei`;
    document.getElementById('gas-normal-price').textContent = `${normalGwei} Gwei`;
    document.getElementById('gas-fast-price').textContent = `${fastGwei} Gwei`;

    // Estimate gas for the transaction
    try {
      const estimatedGasHex = await rpc.estimateGas(network, txRequest);
      const estimatedGas = BigInt(estimatedGasHex);

      document.getElementById('tx-estimated-gas').textContent = estimatedGas.toString();

      // Calculate max fee based on normal gas price
      const maxFeeWei = estimatedGas * gasPriceWei;
      const maxFeeEth = ethers.formatEther(maxFeeWei.toString());
      document.getElementById('tx-max-fee').textContent = `${parseFloat(maxFeeEth).toFixed(8)} ${symbol}`;

      // Update max fee when gas price selection changes
      const updateMaxFee = () => {
        const selectedSpeed = document.querySelector('input[name="gas-speed"]:checked')?.value;
        let selectedGwei;

        if (selectedSpeed === 'slow') {
          selectedGwei = parseFloat(slowGwei);
        } else if (selectedSpeed === 'normal') {
          selectedGwei = parseFloat(normalGwei);
        } else if (selectedSpeed === 'fast') {
          selectedGwei = parseFloat(fastGwei);
        } else if (selectedSpeed === 'custom') {
          selectedGwei = parseFloat(document.getElementById('tx-custom-gas-price').value) || parseFloat(normalGwei);
        } else {
          selectedGwei = parseFloat(normalGwei);
        }

        const selectedGasPriceWei = BigInt(Math.floor(selectedGwei * 1e9));
        const selectedMaxFeeWei = estimatedGas * selectedGasPriceWei;
        const selectedMaxFeeEth = ethers.formatEther(selectedMaxFeeWei.toString());
        document.getElementById('tx-max-fee').textContent = `${parseFloat(selectedMaxFeeEth).toFixed(8)} ${symbol}`;
      };

      // Add event listeners for gas price changes
      document.querySelectorAll('input[name="gas-speed"]').forEach(radio => {
        radio.addEventListener('change', () => {
          updateMaxFee();

          // Update visual highlighting for all gas options
          document.querySelectorAll('.gas-option').forEach(label => {
            const input = label.querySelector('input[name="gas-speed"]');
            if (input && input.checked) {
              label.style.borderColor = 'var(--terminal-success)';
              label.style.borderWidth = '2px';
            } else {
              label.style.borderColor = 'var(--terminal-border)';
              label.style.borderWidth = '1px';
            }
          });

          // Show/hide custom input based on selection
          const customContainer = document.getElementById('custom-gas-input-container');
          if (radio.value === 'custom' && radio.checked) {
            customContainer.classList.remove('hidden');
            // Focus the input when custom is selected
            setTimeout(() => {
              document.getElementById('tx-custom-gas-price').focus();
            }, 100);
          } else if (customContainer) {
            customContainer.classList.add('hidden');
          }
        });
      });

      // Initialize the selected border (Normal is checked by default)
      document.querySelectorAll('.gas-option').forEach(label => {
        const input = label.querySelector('input[name="gas-speed"]');
        if (input && input.checked) {
          label.style.borderColor = 'var(--terminal-success)';
          label.style.borderWidth = '2px';
        }
      });

      // Auto-select custom radio when typing in custom gas price
      const customGasInput = document.getElementById('tx-custom-gas-price');
      customGasInput.addEventListener('input', () => {
        document.getElementById('gas-custom-radio').checked = true;
        updateMaxFee();
      });

    } catch (gasEstimateError) {
      console.error('Error estimating gas:', gasEstimateError);
      document.getElementById('tx-estimated-gas').textContent = '21000 (default)';
      document.getElementById('tx-max-fee').textContent = 'Unable to estimate';
    }

  } catch (error) {
    console.error('Error fetching gas price:', error);
    document.getElementById('gas-slow-price').textContent = 'Error';
    document.getElementById('gas-normal-price').textContent = 'Error';
    document.getElementById('gas-fast-price').textContent = 'Error';
  }
}

// Get selected gas price in wei
function getSelectedGasPrice() {
  const selectedSpeed = document.querySelector('input[name="gas-speed"]:checked')?.value;

  if (selectedSpeed === 'custom') {
    const customGwei = parseFloat(document.getElementById('tx-custom-gas-price').value);
    if (customGwei && customGwei > 0) {
      // Convert Gwei to Wei (multiply by 1e9)
      return ethers.parseUnits(customGwei.toString(), 'gwei').toString();
    }
  }

  // Get the displayed Gwei value and convert to wei
  let gweiText;
  if (selectedSpeed === 'slow') {
    gweiText = document.getElementById('gas-slow-price').textContent;
  } else if (selectedSpeed === 'fast') {
    gweiText = document.getElementById('gas-fast-price').textContent;
  } else {
    gweiText = document.getElementById('gas-normal-price').textContent;
  }

  const gwei = parseFloat(gweiText);
  if (gwei && gwei > 0) {
    return ethers.parseUnits(gwei.toString(), 'gwei').toString();
  }

  // If all else fails, return null to use default
  return null;
}

// Fetch and display current nonce for transaction
async function fetchAndDisplayNonce(address, network) {
  try {
    const nonceHex = await rpc.getTransactionCount(network, address, 'pending');
    const nonce = parseInt(nonceHex, 16);
    document.getElementById('tx-current-nonce').textContent = nonce;
    // Current nonce fetched
  } catch (error) {
    console.error('Error fetching nonce:', error);
    document.getElementById('tx-current-nonce').textContent = 'Error';
  }
}

// ===== SEND SCREEN GAS PRICE HELPERS =====

// Populate gas prices for Send screen
async function populateSendGasPrices(network, txRequest, symbol) {
  // Store params for refresh button
  gasPriceRefreshState.send = { network, txRequest, symbol };

  try {
    // Use safe gas price to prevent stuck transactions
    const gasPriceHex = await rpc.getSafeGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;

    const slowGwei = (gasPriceGwei * 0.9).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.2).toFixed(2);

    document.getElementById('send-gas-slow-price').textContent = `${slowGwei} Gwei`;
    document.getElementById('send-gas-normal-price').textContent = `${normalGwei} Gwei`;
    document.getElementById('send-gas-fast-price').textContent = `${fastGwei} Gwei`;

    try {
      const estimatedGasHex = await rpc.estimateGas(network, txRequest);
      const estimatedGas = BigInt(estimatedGasHex);

      document.getElementById('send-estimated-gas').textContent = estimatedGas.toString();

      const maxFeeWei = estimatedGas * gasPriceWei;
      const maxFeeEth = ethers.formatEther(maxFeeWei.toString());
      document.getElementById('send-max-fee').textContent = `${parseFloat(maxFeeEth).toFixed(8)} ${symbol}`;

      const updateMaxFee = () => {
        const selectedSpeed = document.querySelector('input[name="send-gas-speed"]:checked')?.value;
        let selectedGwei;

        if (selectedSpeed === 'slow') {
          selectedGwei = parseFloat(slowGwei);
        } else if (selectedSpeed === 'normal') {
          selectedGwei = parseFloat(normalGwei);
        } else if (selectedSpeed === 'fast') {
          selectedGwei = parseFloat(fastGwei);
        } else if (selectedSpeed === 'custom') {
          selectedGwei = parseFloat(document.getElementById('send-custom-gas-price').value) || parseFloat(normalGwei);
        } else {
          selectedGwei = parseFloat(normalGwei);
        }

        const selectedGasPriceWei = BigInt(Math.floor(selectedGwei * 1e9));
        const selectedMaxFeeWei = estimatedGas * selectedGasPriceWei;
        const selectedMaxFeeEth = ethers.formatEther(selectedMaxFeeWei.toString());
        document.getElementById('send-max-fee').textContent = `${parseFloat(selectedMaxFeeEth).toFixed(8)} ${symbol}`;
      };

      document.querySelectorAll('input[name="send-gas-speed"]').forEach(radio => {
        radio.addEventListener('change', () => {
          updateMaxFee();

          document.querySelectorAll('.gas-option').forEach(label => {
            const input = label.querySelector('input[name="send-gas-speed"]');
            if (input && input.checked) {
              label.style.borderColor = 'var(--terminal-success)';
              label.style.borderWidth = '2px';
            } else {
              label.style.borderColor = 'var(--terminal-border)';
              label.style.borderWidth = '1px';
            }
          });

          const customContainer = document.getElementById('send-custom-gas-input-container');
          if (radio.value === 'custom' && radio.checked) {
            customContainer.classList.remove('hidden');
            setTimeout(() => {
              document.getElementById('send-custom-gas-price').focus();
            }, 100);
          } else if (customContainer) {
            customContainer.classList.add('hidden');
          }
        });
      });

      document.querySelectorAll('.gas-option').forEach(label => {
        const input = label.querySelector('input[name="send-gas-speed"]');
        if (input && input.checked) {
          label.style.borderColor = 'var(--terminal-success)';
          label.style.borderWidth = '2px';
        }
      });

      const customGasInput = document.getElementById('send-custom-gas-price');
      customGasInput.addEventListener('input', () => {
        document.getElementById('send-gas-custom-radio').checked = true;
        updateMaxFee();
      });

    } catch (gasEstimateError) {
      console.error('Error estimating gas:', gasEstimateError);
      document.getElementById('send-estimated-gas').textContent = '21000 (default)';
      document.getElementById('send-max-fee').textContent = 'Unable to estimate';
    }

  } catch (error) {
    console.error('Error fetching gas price:', error);
    document.getElementById('send-gas-slow-price').textContent = 'Error';
    document.getElementById('send-gas-normal-price').textContent = 'Error';
    document.getElementById('send-gas-fast-price').textContent = 'Error';
  }
}

// Get selected gas price from Send screen
function getSelectedSendGasPrice() {
  const selectedSpeed = document.querySelector('input[name="send-gas-speed"]:checked')?.value;

  if (selectedSpeed === 'custom') {
    const customGwei = parseFloat(document.getElementById('send-custom-gas-price').value);
    if (customGwei && customGwei > 0) {
      return ethers.parseUnits(customGwei.toString(), 'gwei').toString();
    }
  }

  let gweiText;
  if (selectedSpeed === 'slow') {
    gweiText = document.getElementById('send-gas-slow-price').textContent;
  } else if (selectedSpeed === 'fast') {
    gweiText = document.getElementById('send-gas-fast-price').textContent;
  } else {
    gweiText = document.getElementById('send-gas-normal-price').textContent;
  }

  const gwei = parseFloat(gweiText);
  if (gwei && gwei > 0) {
    return ethers.parseUnits(gwei.toString(), 'gwei').toString();
  }

  return null;
}

// Populate gas prices for Token Send
async function populateTokenGasPrices(network, txRequest, symbol) {
  // Store params for refresh button
  gasPriceRefreshState.token = { network, txRequest, symbol };

  try {
    // Use safe gas price to prevent stuck transactions
    const gasPriceHex = await rpc.getSafeGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;

    const slowGwei = (gasPriceGwei * 0.9).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.2).toFixed(2);

    document.getElementById('token-gas-slow-price').textContent = `${slowGwei} Gwei`;
    document.getElementById('token-gas-normal-price').textContent = `${normalGwei} Gwei`;
    document.getElementById('token-gas-fast-price').textContent = `${fastGwei} Gwei`;

    try {
      const estimatedGasHex = await rpc.estimateGas(network, txRequest);
      const estimatedGas = BigInt(estimatedGasHex);

      document.getElementById('token-estimated-gas').textContent = estimatedGas.toString();

      const maxFeeWei = estimatedGas * gasPriceWei;
      const maxFeeEth = ethers.formatEther(maxFeeWei.toString());
      document.getElementById('token-max-fee').textContent = `${parseFloat(maxFeeEth).toFixed(8)} ${symbol}`;

      const updateMaxFee = () => {
        const selectedSpeed = document.querySelector('input[name="token-gas-speed"]:checked')?.value;
        let selectedGwei;

        if (selectedSpeed === 'slow') {
          selectedGwei = parseFloat(slowGwei);
        } else if (selectedSpeed === 'normal') {
          selectedGwei = parseFloat(normalGwei);
        } else if (selectedSpeed === 'fast') {
          selectedGwei = parseFloat(fastGwei);
        } else if (selectedSpeed === 'custom') {
          selectedGwei = parseFloat(document.getElementById('token-custom-gas-price').value) || parseFloat(normalGwei);
        } else {
          selectedGwei = parseFloat(normalGwei);
        }

        const selectedGasPriceWei = BigInt(Math.floor(selectedGwei * 1e9));
        const selectedMaxFeeWei = estimatedGas * selectedGasPriceWei;
        const selectedMaxFeeEth = ethers.formatEther(selectedMaxFeeWei.toString());
        document.getElementById('token-max-fee').textContent = `${parseFloat(selectedMaxFeeEth).toFixed(8)} ${symbol}`;
      };

      document.querySelectorAll('input[name="token-gas-speed"]').forEach(radio => {
        radio.addEventListener('change', () => {
          updateMaxFee();

          document.querySelectorAll('.gas-option').forEach(label => {
            const input = label.querySelector('input[name="token-gas-speed"]');
            if (input && input.checked) {
              label.style.borderColor = 'var(--terminal-success)';
              label.style.borderWidth = '2px';
            } else {
              label.style.borderColor = 'var(--terminal-border)';
              label.style.borderWidth = '1px';
            }
          });

          const customContainer = document.getElementById('token-custom-gas-input-container');
          if (radio.value === 'custom' && radio.checked) {
            customContainer.classList.remove('hidden');
            setTimeout(() => {
              document.getElementById('token-custom-gas-price').focus();
            }, 100);
          } else if (customContainer) {
            customContainer.classList.add('hidden');
          }
        });
      });

      document.querySelectorAll('.gas-option').forEach(label => {
        const input = label.querySelector('input[name="token-gas-speed"]');
        if (input && input.checked) {
          label.style.borderColor = 'var(--terminal-success)';
          label.style.borderWidth = '2px';
        }
      });

      const customGasInput = document.getElementById('token-custom-gas-price');
      customGasInput.addEventListener('input', () => {
        document.getElementById('token-gas-custom-radio').checked = true;
        updateMaxFee();
      });

    } catch (gasEstimateError) {
      console.error('Error estimating gas:', gasEstimateError);
      document.getElementById('token-estimated-gas').textContent = '65000 (default)';
      document.getElementById('token-max-fee').textContent = 'Unable to estimate';
    }

  } catch (error) {
    console.error('Error fetching gas price:', error);
    document.getElementById('token-gas-slow-price').textContent = 'Error';
    document.getElementById('token-gas-normal-price').textContent = 'Error';
    document.getElementById('token-gas-fast-price').textContent = 'Error';
  }
}

// Get selected gas price from Token Send
function getSelectedTokenGasPrice() {
  const selectedSpeed = document.querySelector('input[name="token-gas-speed"]:checked')?.value;

  if (selectedSpeed === 'custom') {
    const customGwei = parseFloat(document.getElementById('token-custom-gas-price').value);
    if (customGwei && customGwei > 0) {
      return ethers.parseUnits(customGwei.toString(), 'gwei').toString();
    }
  }

  let gweiText;
  if (selectedSpeed === 'slow') {
    gweiText = document.getElementById('token-gas-slow-price').textContent;
  } else if (selectedSpeed === 'fast') {
    gweiText = document.getElementById('token-gas-fast-price').textContent;
  } else {
    gweiText = document.getElementById('token-gas-normal-price').textContent;
  }

  const gwei = parseFloat(gweiText);
  if (gwei && gwei > 0) {
    return ethers.parseUnits(gwei.toString(), 'gwei').toString();
  }

  return null;
}

// Show transaction status for Send screen
async function showSendTransactionStatus(txHash, network, amount, symbol) {
  // Hide send form
  document.getElementById('send-form').classList.add('hidden');

  // Show status section
  const statusSection = document.getElementById('send-status-section');
  statusSection.classList.remove('hidden');

  // Populate transaction hash
  document.getElementById('send-status-hash').textContent = txHash;

  // Setup View on Explorer button
  document.getElementById('btn-send-status-explorer').onclick = () => {
    const url = getExplorerUrl(network, 'tx', txHash);
    chrome.tabs.create({ url });
  };

  // Get active wallet address
  const wallet = await getActiveWallet();
  const address = wallet?.address;

  // Poll for transaction status
  let pollInterval;
  const updateStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_TX_BY_HASH',
        address: address,
        txHash: txHash
      });

      if (response.success && response.transaction) {
        const tx = response.transaction;
        const statusMessage = document.getElementById('send-status-message');
        const statusDetails = document.getElementById('send-status-details');
        const pendingActions = document.getElementById('send-status-pending-actions');

        if (tx.status === 'confirmed') {
          statusMessage.textContent = '✅ Transaction Confirmed!';
          statusDetails.textContent = `Block: ${tx.blockNumber}`;
          statusDetails.style.color = 'var(--terminal-success)';
          pendingActions.classList.add('hidden');

          if (pollInterval) {
            clearInterval(pollInterval);
          }

          // Note: Desktop notification is sent by background service worker
          // No need to send another one here to avoid duplicates

          // Auto-close and return to dashboard after 2 seconds
          setTimeout(() => {
            showScreen('screen-dashboard');
            // Refresh dashboard
            updateDashboard();
          }, 2000);
        } else if (tx.status === 'failed') {
          statusMessage.textContent = '❌ Transaction Failed';
          statusDetails.textContent = 'The transaction was rejected or replaced';
          statusDetails.style.color = '#ff4444';
          pendingActions.classList.add('hidden');

          if (pollInterval) {
            clearInterval(pollInterval);
          }
        } else {
          statusMessage.textContent = '⏳ Waiting for confirmation...';
          statusDetails.textContent = 'This usually takes 10-30 seconds';
          statusDetails.style.color = 'var(--terminal-fg-dim)';
          pendingActions.classList.remove('hidden');
        }
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  await updateStatus();
  pollInterval = setInterval(updateStatus, 3000);

  // Setup close button
  document.getElementById('btn-close-send-status').onclick = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    showScreen('screen-dashboard');
    updateDashboard();
  };

  // Setup Speed Up button
  document.getElementById('btn-send-status-speed-up').onclick = async () => {
    // TODO: Implement speed up transaction functionality
    alert('Speed Up functionality will be implemented in a future update');
  };

  // Setup Cancel button
  document.getElementById('btn-send-status-cancel').onclick = async () => {
    try {
      // Get transaction details
      const txResponse = await chrome.runtime.sendMessage({
        type: 'GET_TX_BY_HASH',
        address: address,
        txHash: txHash
      });

      if (!txResponse.success || !txResponse.transaction) {
        alert('Could not load transaction details');
        return;
      }

      const tx = txResponse.transaction;

      // Store state for modal
      cancelModalState.txHash = txHash;
      cancelModalState.address = address;
      cancelModalState.network = tx.network;
      cancelModalState.originalGasPrice = tx.gasPrice;

      // Show modal and load gas prices
      document.getElementById('modal-cancel-tx').classList.remove('hidden');
      await refreshCancelGasPrices();
    } catch (error) {
      console.error('Error opening cancel modal:', error);
      alert('Error loading gas prices');
    }
  };
}

// Show transaction status for Token Send
async function showTokenSendTransactionStatus(txHash, network, amount, symbol) {
  // Hide token send form
  document.getElementById('token-send-form').classList.add('hidden');

  // Show status section
  const statusSection = document.getElementById('token-send-status-section');
  statusSection.classList.remove('hidden');

  // Populate transaction hash
  document.getElementById('token-send-status-hash').textContent = txHash;

  // Setup View on Explorer button
  document.getElementById('btn-token-send-status-explorer').onclick = () => {
    const url = getExplorerUrl(network, 'tx', txHash);
    chrome.tabs.create({ url });
  };

  // Get active wallet address
  const wallet = await getActiveWallet();
  const address = wallet?.address;

  // Poll for transaction status
  let pollInterval;
  const updateStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_TX_BY_HASH',
        address: address,
        txHash: txHash
      });

      if (response.success && response.transaction) {
        const tx = response.transaction;
        const statusMessage = document.getElementById('token-send-status-message');
        const statusDetails = document.getElementById('token-send-status-details');
        const pendingActions = document.getElementById('token-send-status-pending-actions');

        if (tx.status === 'confirmed') {
          statusMessage.textContent = '✅ Transaction Confirmed!';
          statusDetails.textContent = `Block: ${tx.blockNumber}`;
          statusDetails.style.color = 'var(--terminal-success)';
          pendingActions.classList.add('hidden');

          if (pollInterval) {
            clearInterval(pollInterval);
          }

          // Note: Desktop notification is sent by background service worker
          // No need to send another one here to avoid duplicates

          // Auto-close and return to tokens screen after 2 seconds
          setTimeout(() => {
            showScreen('screen-tokens');
            // Refresh tokens
            loadTokensScreen();
          }, 2000);
        } else if (tx.status === 'failed') {
          statusMessage.textContent = '❌ Transaction Failed';
          statusDetails.textContent = 'The transaction was rejected or replaced';
          statusDetails.style.color = '#ff4444';
          pendingActions.classList.add('hidden');

          if (pollInterval) {
            clearInterval(pollInterval);
          }
        } else {
          statusMessage.textContent = '⏳ Waiting for confirmation...';
          statusDetails.textContent = 'This usually takes 10-30 seconds';
          statusDetails.style.color = 'var(--terminal-fg-dim)';
          pendingActions.classList.remove('hidden');
        }
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  await updateStatus();
  pollInterval = setInterval(updateStatus, 3000);

  // Setup close button
  document.getElementById('btn-close-token-send-status').onclick = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    showScreen('screen-tokens');
    loadTokensScreen();
  };

  // Setup Speed Up button
  document.getElementById('btn-token-send-status-speed-up').onclick = async () => {
    // TODO: Implement speed up transaction functionality
    alert('Speed Up functionality will be implemented in a future update');
  };

  // Setup Cancel button
  document.getElementById('btn-token-send-status-cancel').onclick = async () => {
    try {
      // Get transaction details
      const txResponse = await chrome.runtime.sendMessage({
        type: 'GET_TX_BY_HASH',
        address: address,
        txHash: txHash
      });

      if (!txResponse.success || !txResponse.transaction) {
        alert('Could not load transaction details');
        return;
      }

      const tx = txResponse.transaction;

      // Store state for modal
      cancelModalState.txHash = txHash;
      cancelModalState.address = address;
      cancelModalState.network = tx.network;
      cancelModalState.originalGasPrice = tx.gasPrice;

      // Show modal and load gas prices
      document.getElementById('modal-cancel-tx').classList.remove('hidden');
      await refreshCancelGasPrices();
    } catch (error) {
      console.error('Error opening cancel modal:', error);
      alert('Error loading gas prices');
    }
  };
}

/**
 * Format parameter value for display based on type
 */
function formatParameterValue(value, type) {
  try {
    // Handle arrays
    if (type.includes('[]')) {
      if (Array.isArray(value)) {
        const elementType = type.replace('[]', '');
        const formattedElements = value.map((v, i) => {
          const formattedValue = formatParameterValue(v, elementType);
          return `[${i}]: ${formattedValue}`;
        });
        return formattedElements.join('<br>');
      }
    }

    // Handle addresses
    if (type === 'address') {
      const shortAddr = `${value.slice(0, 6)}...${value.slice(-4)}`;
      return `<span title="${value}" style="cursor: help;">${shortAddr}</span>`;
    }

    // Handle numbers (uint/int)
    if (type.startsWith('uint') || type.startsWith('int')) {
      const valueStr = value.toString();

      // For large numbers, try to show both raw and formatted
      if (valueStr.length > 18) {
        try {
          const etherValue = ethers.formatEther(valueStr);
          // Only show ether conversion if it makes sense (> 0.000001)
          if (parseFloat(etherValue) > 0.000001) {
            return `${valueStr}<br><span style="color: var(--terminal-dim); font-size: 9px;">(≈ ${parseFloat(etherValue).toFixed(6)} tokens)</span>`;
          }
        } catch (e) {
          // If conversion fails, just show raw
        }
      }

      return valueStr;
    }

    // Handle booleans
    if (type === 'bool') {
      return value ? '<span style="color: var(--terminal-success);">true</span>' : '<span style="color: var(--terminal-warning);">false</span>';
    }

    // Handle bytes
    if (type === 'bytes' || type.startsWith('bytes')) {
      if (typeof value === 'string') {
        if (value.length > 66) {
          return `${value.slice(0, 66)}...<br><span style="color: var(--terminal-dim); font-size: 9px;">(${value.length} chars)</span>`;
        }
        return value;
      }
    }

    // Handle strings
    if (type === 'string') {
      if (value.length > 50) {
        return `${value.slice(0, 50)}...<br><span style="color: var(--terminal-dim); font-size: 9px;">(${value.length} chars)</span>`;
      }
      return value;
    }

    // Default: convert to string
    if (typeof value === 'object' && value !== null) {
      const jsonStr = JSON.stringify(value, null, 2);
      if (jsonStr.length > 100) {
        return `<pre style="font-size: 9px; overflow-x: auto;">${jsonStr.slice(0, 100)}...</pre>`;
      }
      return `<pre style="font-size: 9px;">${jsonStr}</pre>`;
    }

    return String(value);
  } catch (error) {
    console.error('Error formatting parameter value:', error);
    return String(value);
  }
}

async function handleTransactionApprovalScreen(requestId) {
  // Load settings for theme
  await loadSettings();
  applyTheme();

  // Get transaction request details from background
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_TRANSACTION_REQUEST',
      requestId
    });

    if (!response.success) {
      alert('Transaction request not found or expired');
      window.close();
      return;
    }

    const { origin, txRequest } = response;

    // Get active wallet
    const wallet = await getActiveWallet();
    const network = await load('currentNetwork') || 'pulsechainTestnet';

    // Populate transaction details
    document.getElementById('tx-site-origin').textContent = origin;
    document.getElementById('tx-from-address').textContent = wallet?.address || '0x0000...0000';
    document.getElementById('tx-to-address').textContent = txRequest.to || 'Contract Creation';

    // Format value
    const symbols = {
      'pulsechainTestnet': 'tPLS',
      'pulsechain': 'PLS',
      'ethereum': 'ETH',
      'sepolia': 'SEP'
    };
    const symbol = symbols[network] || 'TOKEN';

    if (txRequest.value) {
      const value = ethers.formatEther(txRequest.value);
      document.getElementById('tx-value').textContent = `${value} ${symbol}`;
    } else {
      document.getElementById('tx-value').textContent = `0 ${symbol}`;
    }

    // Decode transaction data
    let decodedTx = null;
    const chainIdMap = {
      'pulsechain': 369,
      'pulsechainTestnet': 943,
      'ethereum': 1,
      'sepolia': 11155111
    };
    const chainId = chainIdMap[network] || 369;

    // Show loading state
    document.getElementById('tx-contract-info').classList.add('hidden');
    document.getElementById('tx-function-name').textContent = 'Decoding...';

    try {
      decodedTx = await decodeTransaction(txRequest, chainId);
      console.log('🫀 Decoded transaction:', decodedTx);

      // Show contract info if it's a contract interaction
      if (decodedTx && decodedTx.type !== 'transfer' && decodedTx.contract) {
        const contractInfo = document.getElementById('tx-contract-info');
        contractInfo.classList.remove('hidden');

        // Update contract address
        document.getElementById('tx-contract-address').textContent = decodedTx.contract.address;

        // Update verification badge
        if (decodedTx.contract.verified) {
          document.getElementById('tx-verified-badge').classList.remove('hidden');
          document.getElementById('tx-unverified-badge').classList.add('hidden');
          contractInfo.style.borderColor = 'var(--terminal-success)';
        } else {
          document.getElementById('tx-verified-badge').classList.add('hidden');
          document.getElementById('tx-unverified-badge').classList.remove('hidden');
          contractInfo.style.borderColor = 'var(--terminal-warning)';
        }

        // Update explorer link
        const contractLink = document.getElementById('tx-contract-link');
        contractLink.href = decodedTx.explorerUrl;

        // Update function info
        document.getElementById('tx-function-name').textContent = decodedTx.method || 'Unknown Function';
        document.getElementById('tx-function-description').textContent = decodedTx.description || 'Contract interaction';

        // Show parameters if available
        if (decodedTx.params && decodedTx.params.length > 0) {
          const paramsSection = document.getElementById('tx-params-section');
          const paramsList = document.getElementById('tx-params-list');
          paramsSection.classList.remove('hidden');

          let paramsHTML = '';
          for (const param of decodedTx.params) {
            const valueDisplay = formatParameterValue(param.value, param.type);
            paramsHTML += `
              <div style="margin-bottom: 12px; padding: 8px; background: var(--terminal-bg); border: 1px solid var(--terminal-border); border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-size: 10px; color: var(--terminal-dim);">${param.name}</span>
                  <span style="font-size: 9px; color: var(--terminal-dim); font-family: var(--font-mono);">${param.type}</span>
                </div>
                <div style="font-size: 10px; font-family: var(--font-mono); word-break: break-all;">
                  ${valueDisplay}
                </div>
              </div>
            `;
          }
          paramsList.innerHTML = paramsHTML;
        } else {
          document.getElementById('tx-params-section').classList.add('hidden');
        }
      } else {
        document.getElementById('tx-contract-info').classList.add('hidden');
      }

      // Show raw data section for advanced users
      if (txRequest.data && txRequest.data !== '0x') {
        document.getElementById('tx-data-section').classList.remove('hidden');
        document.getElementById('tx-data').textContent = txRequest.data;
      } else {
        document.getElementById('tx-data-section').classList.add('hidden');
      }

    } catch (error) {
      console.error('Error decoding transaction:', error);
      document.getElementById('tx-contract-info').classList.add('hidden');

      // Show raw data as fallback
      if (txRequest.data && txRequest.data !== '0x') {
        document.getElementById('tx-data-section').classList.remove('hidden');
        document.getElementById('tx-data').textContent = txRequest.data;
      } else {
        document.getElementById('tx-data-section').classList.add('hidden');
      }
    }

    // Show the transaction approval screen
    showScreen('screen-transaction-approval');

    // Hide password field for hardware wallets
    const isHardwareWallet = wallet && wallet.isHardwareWallet;
    const passwordGroup = document.getElementById('tx-password-group');
    if (isHardwareWallet) {
      passwordGroup.classList.add('hidden');
      // Show Ledger instruction message
      const ledgerMsg = document.createElement('div');
      ledgerMsg.className = 'panel';
      ledgerMsg.style.cssText = 'border-color: var(--terminal-info); margin-bottom: 12px;';
      ledgerMsg.innerHTML = '<p style="font-size: 11px; color: var(--terminal-info);">📱 Please confirm this transaction on your Ledger device</p>';
      passwordGroup.parentElement.insertBefore(ledgerMsg, passwordGroup);
    } else {
      passwordGroup.classList.remove('hidden');
    }

    // Fetch and populate gas price options
    await populateGasPrices(network, txRequest, symbol);

    // Fetch and display current nonce
    await fetchAndDisplayNonce(wallet.address, network);

    // Setup custom nonce checkbox
    document.getElementById('tx-custom-nonce-checkbox').addEventListener('change', (e) => {
      const container = document.getElementById('custom-nonce-input-container');
      if (e.target.checked) {
        container.classList.remove('hidden');
        // Pre-fill with current nonce
        const currentNonce = document.getElementById('tx-current-nonce').textContent;
        if (currentNonce !== '--') {
          document.getElementById('tx-custom-nonce').value = currentNonce;
        }
      } else {
        container.classList.add('hidden');
      }
    });

    // Setup approve button
    document.getElementById('btn-approve-transaction').addEventListener('click', async () => {
      const approveBtn = document.getElementById('btn-approve-transaction');
      const password = document.getElementById('tx-password').value;
      const errorEl = document.getElementById('tx-error');

      // Check if password required (software wallet only)
      if (!isHardwareWallet && !password) {
        errorEl.textContent = 'Please enter your password';
        errorEl.classList.remove('hidden');
        return;
      }

      // Disable button immediately to prevent double-clicking
      approveBtn.disabled = true;
      approveBtn.style.opacity = '0.5';
      approveBtn.style.cursor = 'not-allowed';

      try {
        errorEl.classList.add('hidden');

        // Get selected gas price
        const gasPrice = getSelectedGasPrice();

        // Get custom nonce if provided
        const customNonceCheckbox = document.getElementById('tx-custom-nonce-checkbox');
        const customNonceInput = document.getElementById('tx-custom-nonce');
        let customNonce = null;
        if (customNonceCheckbox.checked && customNonceInput.value) {
          customNonce = parseInt(customNonceInput.value);
          if (isNaN(customNonce) || customNonce < 0) {
            throw new Error('Invalid custom nonce');
          }
        }

        if (isHardwareWallet) {
          // Hardware wallet - sign with Ledger device
          approveBtn.textContent = 'WAITING FOR LEDGER...';
          errorEl.textContent = 'Please confirm transaction on your Ledger device...';
          errorEl.classList.remove('hidden');

          // Build transaction with gas options
          const tx = { ...txRequest };

          // Add chain ID
          const chainIdMap = {
            'pulsechain': 369,
            'pulsechainTestnet': 943,
            'ethereum': 1,
            'sepolia': 11155111
          };
          tx.chainId = chainIdMap[network] || 943;

          // Ensure from address is set for gas estimation
          if (!tx.from) {
            tx.from = wallet.address;
          }

          // Get provider (needed for gas price and estimation)
          const provider = await rpc.getProvider(network);

          // Set gas price - user-selected or fetch from network
          if (gasPrice) {
            tx.gasPrice = gasPrice;
          } else if (!tx.gasPrice) {
            // Fetch safe gas price if not provided
            try {
              const safeGasPriceHex = await rpc.getSafeGasPrice(network);
              tx.gasPrice = BigInt(safeGasPriceHex);
            } catch (error) {
              console.warn('Error getting safe gas price:', error);
              const feeData = await provider.getFeeData();
              if (feeData.gasPrice) {
                tx.gasPrice = feeData.gasPrice;
              }
            }
          }

          // Get nonce if not custom
          if (customNonce !== null) {
            tx.nonce = customNonce;
          } else if (tx.nonce === undefined) {
            const nonceHex = await rpc.getTransactionCount(network, wallet.address, 'pending');
            tx.nonce = parseInt(nonceHex, 16);
          }

          // Normalize gas field (dApps may use 'gas' or 'gasLimit')
          if (tx.gas && !tx.gasLimit) {
            tx.gasLimit = tx.gas;
          }

          // Estimate gas limit if not set
          if (!tx.gasLimit) {
            tx.gasLimit = await provider.estimateGas(tx);
          }

          // Clean up transaction fields for Ledger (legacy transaction format)
          delete tx.gas;  // Use gasLimit instead
          delete tx.from;  // Ledger derives from account index
          delete tx.maxFeePerGas;  // EIP-1559 field, not used in legacy
          delete tx.maxPriorityFeePerGas;  // EIP-1559 field, not used in legacy
          delete tx.type;  // Remove transaction type if present

          console.log('🫀 Ledger transaction prepared:', {
            to: tx.to,
            value: tx.value?.toString(),
            gasPrice: tx.gasPrice?.toString(),
            gasLimit: tx.gasLimit?.toString(),
            nonce: tx.nonce,
            chainId: tx.chainId,
            dataLength: tx.data?.length || 0
          });

          // Sign with Ledger
          const signedTx = await ledger.signTransaction(wallet.accountIndex, tx);

          // Broadcast
          const txResponse = await provider.broadcastTransaction(signedTx);

          // Show transaction status
          showTransactionStatus(txResponse.hash, wallet.address, requestId);

          // Notify service worker that transaction was approved
          await chrome.runtime.sendMessage({
            type: 'TRANSACTION_APPROVAL',
            requestId,
            approved: true,
            txHash: txResponse.hash
          });

        } else {
          // Software wallet - validate password with progress bar first
          const activeWallet = await getActiveWallet();

          // Show progress bar and hide error
          const progressContainer = document.getElementById('tx-approval-progress-container');
          const progressBar = document.getElementById('tx-approval-progress-bar');
          const progressText = document.getElementById('tx-approval-progress-text');

          progressContainer.classList.remove('hidden');
          progressBar.style.width = '0%';
          progressText.textContent = '0%';

          try {
            // Validate password with progress tracking
            let lastDisplayedPercentage = 0;
            await unlockWallet(password, {
              onProgress: (progress) => {
                const percentage = Math.round(progress * 100);
                if (percentage !== lastDisplayedPercentage) {
                  lastDisplayedPercentage = percentage;
                  if (progressBar) progressBar.style.width = `${percentage}%`;
                  if (progressText) progressText.textContent = `${percentage}%`;
                }
              }
            });

            // Password is valid! Hide progress bar
            progressContainer.classList.add('hidden');

            // Create session with validated password
            const tempSessionResponse = await chrome.runtime.sendMessage({
              type: 'CREATE_SESSION',
              password,
              walletId: activeWallet.id,
              durationMs: 60000 // 1 minute temporary session
            });

            if (!tempSessionResponse.success) {
              throw new Error('Failed to create session');
            }

            const response = await chrome.runtime.sendMessage({
              type: 'TRANSACTION_APPROVAL',
              requestId,
              approved: true,
              sessionToken: tempSessionResponse.sessionToken,
              gasPrice,
              customNonce
            });

            if (response.success) {
              // Hide approval form and show status section
              showTransactionStatus(response.txHash, activeWallet.address, requestId);
            } else {
              errorEl.textContent = response.error || 'Transaction failed';
              errorEl.classList.remove('hidden');
              // Re-enable button on error so user can try again
              approveBtn.disabled = false;
              approveBtn.style.opacity = '1';
              approveBtn.style.cursor = 'pointer';
            }
          } catch (unlockError) {
            // Hide progress bar on error
            progressContainer.classList.add('hidden');

            // Show error message
            errorEl.textContent = unlockError.message || 'Incorrect password';
            errorEl.classList.remove('hidden');

            // Re-enable button on error so user can try again
            approveBtn.disabled = false;
            approveBtn.style.opacity = '1';
            approveBtn.style.cursor = 'pointer';
            throw unlockError; // Re-throw to trigger outer catch
          }
        }
      } catch (error) {
        console.error('Transaction approval error:', error);

        // Provide user-friendly error messages
        let errorMessage;
        if (error.message.includes('Blind signing') || error.message.includes('Contract data')) {
          errorMessage = `Ledger Setting Required:

1. On your Ledger device, open the Ethereum app
2. Press both buttons on "Settings"
3. Find "Contract data" or "Blind signing"
4. Enable it (press both buttons to toggle ON)
5. Exit settings and try again

This allows your Ledger to sign smart contract transactions.`;
        } else if (error.message.includes('IntrinsicGas')) {
          errorMessage = 'Transaction failed: Gas limit too low. Please try again.';
        } else {
          errorMessage = error.message;
        }

        errorEl.textContent = errorMessage;
        errorEl.classList.remove('hidden');
        // Re-enable button on error so user can try again
        approveBtn.disabled = false;
        approveBtn.style.opacity = '1';
        approveBtn.style.cursor = 'pointer';
        approveBtn.textContent = 'APPROVE';
      }
    });

    // Setup reject button
    document.getElementById('btn-reject-transaction').addEventListener('click', async () => {
      try {
        await chrome.runtime.sendMessage({
          type: 'TRANSACTION_APPROVAL',
          requestId,
          approved: false
        });

        // Close the popup window
        window.close();
      } catch (error) {
        alert('Error rejecting transaction: ' + error.message);
        window.close();
      }
    });

  } catch (error) {
    alert('Error loading transaction: ' + error.message);
    window.close();
  }
}

// ===== TOKEN ADD APPROVAL =====
async function handleTokenAddApprovalScreen(requestId) {
  // Load settings for theme
  await loadSettings();
  applyTheme();

  // Get token add request details from background
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_TOKEN_ADD_REQUEST',
      requestId
    });

    if (!response.success) {
      alert('Token add request not found or expired');
      window.close();
      return;
    }

    const { origin, tokenInfo } = response;

    // Populate token details
    document.getElementById('token-site-origin').textContent = origin;
    document.getElementById('token-symbol').textContent = tokenInfo.symbol;
    document.getElementById('token-address').textContent = tokenInfo.address;
    document.getElementById('token-decimals').textContent = tokenInfo.decimals;

    // Show token image if provided
    if (tokenInfo.image) {
      document.getElementById('token-image').src = tokenInfo.image;
      document.getElementById('token-image-section').classList.remove('hidden');
    } else {
      document.getElementById('token-image-section').classList.add('hidden');
    }

    // Show the token approval screen
    showScreen('screen-add-token');

    // Setup approve button
    document.getElementById('btn-approve-token').addEventListener('click', async () => {
      const approveBtn = document.getElementById('btn-approve-token');
      const errorEl = document.getElementById('token-error');

      // Disable button immediately to prevent double-clicking
      approveBtn.disabled = true;
      approveBtn.style.opacity = '0.5';
      approveBtn.style.cursor = 'not-allowed';

      try {
        errorEl.classList.add('hidden');

        // Send approval to background
        const response = await chrome.runtime.sendMessage({
          type: 'TOKEN_ADD_APPROVAL',
          requestId,
          approved: true
        });

        if (response.success) {
          // Add the token to storage using existing token management
          const network = await load('currentNetwork') || 'pulsechainTestnet';
          await tokens.addCustomToken(network, tokenInfo.address, tokenInfo.symbol, tokenInfo.decimals);

          // Close the popup window
          window.close();
        } else {
          errorEl.textContent = response.error || 'Failed to add token';
          errorEl.classList.remove('hidden');
          // Re-enable button on error so user can try again
          approveBtn.disabled = false;
          approveBtn.style.opacity = '1';
          approveBtn.style.cursor = 'pointer';
        }
      } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
        // Re-enable button on error so user can try again
        approveBtn.disabled = false;
        approveBtn.style.opacity = '1';
        approveBtn.style.cursor = 'pointer';
      }
    });

    // Setup reject button
    document.getElementById('btn-reject-token').addEventListener('click', async () => {
      try {
        await chrome.runtime.sendMessage({
          type: 'TOKEN_ADD_APPROVAL',
          requestId,
          approved: false
        });

        // Close the popup window
        window.close();
      } catch (error) {
        alert('Error rejecting token: ' + error.message);
        window.close();
      }
    });

  } catch (error) {
    alert('Error loading token add request: ' + sanitizeError(error.message));
    window.close();
  }
}

// ===== MESSAGE SIGNING APPROVAL HANDLERS =====

async function handleMessageSignApprovalScreen(requestId) {
  // Load settings for theme
  await loadSettings();
  applyTheme();

  // Get sign request details from background
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_SIGN_REQUEST',
      requestId
    });

    if (!response || !response.origin) {
      alert('Sign request not found or expired');
      window.close();
      return;
    }

    const { origin, method, signRequest } = response;
    const { message, address } = signRequest;

    // Check if this is a hardware wallet
    const activeWallet = await getActiveWallet();
    const isHardwareWallet = activeWallet.isHardwareWallet;
    const isLedger = activeWallet.hardwareType === 'ledger';

    // Populate sign details
    document.getElementById('sign-site-origin').textContent = origin;
    document.getElementById('sign-address').textContent = address;

    // Show DANGER warning if this is eth_sign
    const ethSignWarning = document.getElementById('eth-sign-danger-warning');
    if (method === 'eth_sign') {
      ethSignWarning.classList.remove('hidden');
      console.warn('⚠️ DANGER: eth_sign request from', origin);
    } else {
      ethSignWarning.classList.add('hidden');
    }

    // Format message for display
    const messageEl = document.getElementById('sign-message-content');
    let displayMessage = message;

    // Check if message is hex-encoded
    if (typeof message === 'string' && message.startsWith('0x')) {
      document.getElementById('sign-message-hex-warning').classList.remove('hidden');
      // Try to decode if it's readable text
      try {
        const bytes = ethers.getBytes(message);
        const decoded = ethers.toUtf8String(bytes);
        if (/^[\x20-\x7E\s]+$/.test(decoded)) {
          displayMessage = decoded + '\n\n[Hex: ' + message + ']';
        }
      } catch {
        // Keep as hex if decoding fails
      }
    } else {
      document.getElementById('sign-message-hex-warning').classList.add('hidden');
    }

    messageEl.textContent = displayMessage;

    // Show the signing approval screen
    showScreen('screen-sign-message');

    // Hide/show password field based on wallet type
    const passwordGroup = document.getElementById('sign-password').closest('.form-group');
    if (isHardwareWallet && isLedger) {
      passwordGroup.classList.add('hidden');
      // Show Ledger instruction message
      const ledgerMsg = document.createElement('div');
      ledgerMsg.className = 'panel';
      ledgerMsg.style.cssText = 'border-color: var(--terminal-info); margin-bottom: 12px;';
      ledgerMsg.innerHTML = '<p style="font-size: 11px; color: var(--terminal-info);">📱 Please confirm this signature on your Ledger device</p>';
      passwordGroup.parentElement.insertBefore(ledgerMsg, passwordGroup);
    } else {
      passwordGroup.classList.remove('hidden');
    }

    // Setup approve button
    document.getElementById('btn-approve-sign').addEventListener('click', async () => {
      const approveBtn = document.getElementById('btn-approve-sign');
      const errorEl = document.getElementById('sign-error');

      // Disable button immediately to prevent double-clicking
      approveBtn.disabled = true;
      approveBtn.style.opacity = '0.5';
      approveBtn.style.cursor = 'not-allowed';

      try {
        errorEl.classList.add('hidden');

        let signature;

        if (isHardwareWallet && isLedger) {
          // Ledger signing - sign directly in popup
          approveBtn.textContent = 'WAITING FOR LEDGER...';

          try {
            signature = await ledger.signMessage(activeWallet.accountIndex, message);
          } catch (ledgerError) {
            throw new Error(`Ledger signing failed: ${ledgerError.message}`);
          }

          // Send pre-signed signature to service worker
          const response = await chrome.runtime.sendMessage({
            type: 'SIGN_APPROVAL_LEDGER',
            requestId,
            approved: true,
            signature // Pre-signed signature
          });

          if (response.success) {
            window.close();
          } else {
            throw new Error(response.error || 'Signing failed');
          }

        } else {
          // Software wallet signing - validate password with progress bar first
          const password = document.getElementById('sign-password').value;

          if (!password) {
            errorEl.textContent = 'Please enter your password';
            errorEl.classList.remove('hidden');
            approveBtn.disabled = false;
            approveBtn.style.opacity = '1';
            approveBtn.style.cursor = 'pointer';
            return;
          }

          // Show progress bar and hide error
          const progressContainer = document.getElementById('sign-progress-container');
          const progressBar = document.getElementById('sign-progress-bar');
          const progressText = document.getElementById('sign-progress-text');

          progressContainer.classList.remove('hidden');
          progressBar.style.width = '0%';
          progressText.textContent = '0%';

          try {
            // Validate password with progress tracking
            let lastDisplayedPercentage = 0;
            await unlockWallet(password, {
              onProgress: (progress) => {
                const percentage = Math.round(progress * 100);
                if (percentage !== lastDisplayedPercentage) {
                  lastDisplayedPercentage = percentage;
                  if (progressBar) progressBar.style.width = `${percentage}%`;
                  if (progressText) progressText.textContent = `${percentage}%`;
                }
              }
            });

            // Password is valid! Hide progress bar
            progressContainer.classList.add('hidden');

            // Create a temporary session for this signing using the entered password
            const tempSessionResponse = await chrome.runtime.sendMessage({
              type: 'CREATE_SESSION',
              password,
              walletId: activeWallet.id,
              durationMs: 60000 // 1 minute temporary session
            });

            if (!tempSessionResponse.success) {
              throw new Error('Failed to create session');
            }

            const response = await chrome.runtime.sendMessage({
              type: 'SIGN_APPROVAL',
              requestId,
              approved: true,
              sessionToken: tempSessionResponse.sessionToken
            });

            if (response.success) {
              // Close the popup window
              window.close();
            } else {
              errorEl.textContent = response.error || 'Signing failed';
              errorEl.classList.remove('hidden');
              // Re-enable button on error so user can try again
              approveBtn.disabled = false;
              approveBtn.style.opacity = '1';
              approveBtn.style.cursor = 'pointer';
            }
          } catch (unlockError) {
            // Hide progress bar on error
            progressContainer.classList.add('hidden');

            // Show error message
            errorEl.textContent = unlockError.message || 'Incorrect password';
            errorEl.classList.remove('hidden');

            // Re-enable button on error so user can try again
            approveBtn.disabled = false;
            approveBtn.style.opacity = '1';
            approveBtn.style.cursor = 'pointer';
            throw unlockError; // Re-throw to trigger outer catch
          }
        }
      } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
        // Re-enable button on error so user can try again
        approveBtn.disabled = false;
        approveBtn.style.opacity = '1';
        approveBtn.style.cursor = 'pointer';
        approveBtn.textContent = 'APPROVE';
      }
    });

    // Setup reject button
    document.getElementById('btn-reject-sign').addEventListener('click', async () => {
      try {
        await chrome.runtime.sendMessage({
          type: 'SIGN_APPROVAL',
          requestId,
          approved: false
        });

        // Close the popup window
        window.close();
      } catch (error) {
        alert('Error rejecting sign request: ' + error.message);
        window.close();
      }
    });

  } catch (error) {
    alert('Error loading sign request: ' + sanitizeError(error.message));
    window.close();
  }
}

async function handleTypedDataSignApprovalScreen(requestId) {
  // Load settings for theme
  await loadSettings();
  applyTheme();

  // Get sign request details from background
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_SIGN_REQUEST',
      requestId
    });

    if (!response || !response.origin) {
      alert('Sign request not found or expired');
      window.close();
      return;
    }

    const { origin, method, signRequest } = response;
    const { typedData, address } = signRequest;

    // Populate sign details
    document.getElementById('sign-typed-site-origin').textContent = origin;
    document.getElementById('sign-typed-address').textContent = address;

    // Populate domain information
    if (typedData.domain) {
      document.getElementById('sign-typed-domain-name').textContent = typedData.domain.name || 'Unknown';
      document.getElementById('sign-typed-domain-chain').textContent = typedData.domain.chainId || '--';

      if (typedData.domain.verifyingContract) {
        document.getElementById('sign-typed-domain-contract').textContent = typedData.domain.verifyingContract;
        document.getElementById('sign-typed-domain-contract-row').classList.remove('hidden');
      } else {
        document.getElementById('sign-typed-domain-contract-row').classList.add('hidden');
      }
    }

    // Format typed data for display
    const messageEl = document.getElementById('sign-typed-message-content');
    const displayData = {
      primaryType: typedData.primaryType || 'Unknown',
      message: typedData.message
    };
    messageEl.textContent = JSON.stringify(displayData, null, 2);

    // Show the signing approval screen
    showScreen('screen-sign-typed-data');

    // Setup approve button
    document.getElementById('btn-approve-sign-typed').addEventListener('click', async () => {
      const approveBtn = document.getElementById('btn-approve-sign-typed');
      const password = document.getElementById('sign-typed-password').value;
      const errorEl = document.getElementById('sign-typed-error');

      if (!password) {
        errorEl.textContent = 'Please enter your password';
        errorEl.classList.remove('hidden');
        return;
      }

      // Disable button immediately to prevent double-clicking
      approveBtn.disabled = true;
      approveBtn.style.opacity = '0.5';
      approveBtn.style.cursor = 'not-allowed';

      try {
        errorEl.classList.add('hidden');

        // Show progress bar and hide error
        const progressContainer = document.getElementById('sign-typed-progress-container');
        const progressBar = document.getElementById('sign-typed-progress-bar');
        const progressText = document.getElementById('sign-typed-progress-text');

        progressContainer.classList.remove('hidden');
        progressBar.style.width = '0%';
        progressText.textContent = '0%';

        try {
          // Validate password with progress tracking
          let lastDisplayedPercentage = 0;
          await unlockWallet(password, {
            onProgress: (progress) => {
              const percentage = Math.round(progress * 100);
              if (percentage !== lastDisplayedPercentage) {
                lastDisplayedPercentage = percentage;
                if (progressBar) progressBar.style.width = `${percentage}%`;
                if (progressText) progressText.textContent = `${percentage}%`;
              }
            }
          });

          // Password is valid! Hide progress bar
          progressContainer.classList.add('hidden');

          // Create a temporary session for this signing using the entered password
          const activeWallet = await getActiveWallet();
          const tempSessionResponse = await chrome.runtime.sendMessage({
            type: 'CREATE_SESSION',
            password,
            walletId: activeWallet.id,
            durationMs: 60000 // 1 minute temporary session
          });

          if (!tempSessionResponse.success) {
            throw new Error('Failed to create session');
          }

          const response = await chrome.runtime.sendMessage({
            type: 'SIGN_APPROVAL',
            requestId,
            approved: true,
            sessionToken: tempSessionResponse.sessionToken
          });

          if (response.success) {
            // Close the popup window
            window.close();
          } else {
            errorEl.textContent = response.error || 'Signing failed';
            errorEl.classList.remove('hidden');
            // Re-enable button on error so user can try again
            approveBtn.disabled = false;
            approveBtn.style.opacity = '1';
            approveBtn.style.cursor = 'pointer';
          }
        } catch (unlockError) {
          // Hide progress bar on error
          progressContainer.classList.add('hidden');

          // Show error message
          errorEl.textContent = unlockError.message || 'Incorrect password';
          errorEl.classList.remove('hidden');

          // Re-enable button on error so user can try again
          approveBtn.disabled = false;
          approveBtn.style.opacity = '1';
          approveBtn.style.cursor = 'pointer';
          throw unlockError; // Re-throw to trigger outer catch
        }
      } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
        // Re-enable button on error so user can try again
        approveBtn.disabled = false;
        approveBtn.style.opacity = '1';
        approveBtn.style.cursor = 'pointer';
      }
    });

    // Setup reject button
    document.getElementById('btn-reject-sign-typed').addEventListener('click', async () => {
      try {
        await chrome.runtime.sendMessage({
          type: 'SIGN_APPROVAL',
          requestId,
          approved: false
        });

        // Close the popup window
        window.close();
      } catch (error) {
        alert('Error rejecting sign request: ' + error.message);
        window.close();
      }
    });

  } catch (error) {
    alert('Error loading typed data sign request: ' + sanitizeError(error.message));
    window.close();
  }
}

// ===== TRANSACTION HISTORY =====
async function updatePendingTxIndicator() {
  if (!currentState.address) return;

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_PENDING_TX_COUNT',
      address: currentState.address
    });

    const indicator = document.getElementById('pending-tx-indicator');
    const textEl = document.getElementById('pending-tx-text');

    if (response.success && response.count > 0) {
      textEl.textContent = `⚠️ ${response.count} Pending Transaction${response.count > 1 ? 's' : ''}`;
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error checking pending transactions:', error);
  }
}

async function showTransactionHistory() {
  if (!currentState.address) return;

  showScreen('screen-tx-history');
  await renderTransactionHistory('all');
}

// Refresh transaction from the list view
async function refreshTransactionFromList(txHash) {
  if (!currentState.address) return;

  try {
    // Get transaction to get network
    const txResponse = await chrome.runtime.sendMessage({
      type: 'GET_TX_BY_HASH',
      address: currentState.address,
      txHash: txHash
    });

    if (!txResponse.success || !txResponse.transaction) {
      alert('Transaction not found');
      return;
    }

    const network = txResponse.transaction.network;

    // Refresh status from blockchain
    const refreshResponse = await chrome.runtime.sendMessage({
      type: 'REFRESH_TX_STATUS',
      address: currentState.address,
      txHash: txHash,
      network: network
    });

    if (!refreshResponse.success) {
      alert('Error: ' + refreshResponse.error);
      return;
    }

    // Show brief notification
    if (refreshResponse.status === 'confirmed') {
      alert(`✅ Transaction confirmed on block ${refreshResponse.blockNumber}!`);
    } else if (refreshResponse.status === 'failed') {
      alert('❌ Transaction failed on blockchain');
    } else {
      alert('⏳ Still pending on blockchain');
    }

    // Refresh the transaction list to show updated status
    await renderTransactionHistory(document.querySelector('[id^="filter-"][class*="active"]')?.id.replace('filter-', '').replace('-txs', '') || 'all');

  } catch (error) {
    console.error('Error refreshing transaction:', error);
    alert('Error refreshing status');
  }
}

async function renderTransactionHistory(filter = 'all') {
  const listEl = document.getElementById('tx-history-list');
  if (!currentState.address) {
    listEl.innerHTML = '<p class="text-center text-dim">No address selected</p>';
    return;
  }

  listEl.innerHTML = '<p class="text-center text-dim">Loading...</p>';

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_TX_HISTORY',
      address: currentState.address
    });

    if (!response.success || !response.transactions || response.transactions.length === 0) {
      listEl.innerHTML = '<p class="text-center text-dim">No transactions</p>';
      return;
    }

    let transactions = response.transactions;

    // Apply filter
    if (filter === 'pending') {
      transactions = transactions.filter(tx => tx.status === 'pending');
    } else if (filter === 'confirmed') {
      transactions = transactions.filter(tx => tx.status === 'confirmed');
    }

    if (transactions.length === 0) {
      listEl.innerHTML = '<p class="text-center text-dim">No transactions in this filter</p>';
      return;
    }

    let html = '';
    for (const tx of transactions) {
      const statusIcon = tx.status === 'pending' ? '⏳' :
                        tx.status === 'confirmed' ? '✅' : '❌';
      const statusColor = tx.status === 'pending' ? 'var(--terminal-warning)' :
                         tx.status === 'confirmed' ? '#44ff44' : '#ff4444';

      const date = new Date(tx.timestamp).toLocaleString();
      const valueEth = ethers.formatEther(tx.value || '0');
      const gasGwei = ethers.formatUnits(tx.gasPrice || '0', 'gwei');

      // Add refresh button for pending transactions
      const refreshButton = tx.status === 'pending'
        ? `<button class="btn-small" style="font-size: 9px; padding: 4px 8px; margin-left: 8px;" data-refresh-tx="${tx.hash}">🔄 Refresh</button>`
        : '';

      html += `
        <div class="panel mb-2" style="padding: 12px; cursor: pointer; border-color: ${statusColor};" data-tx-hash="${tx.hash}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center;">
              <span style="color: ${statusColor}; font-size: 14px;">${statusIcon} ${tx.status.toUpperCase()}</span>
              ${refreshButton}
            </div>
            <span class="text-dim" style="font-size: 10px;">${date}</span>
          </div>
          <p class="text-dim" style="font-size: 10px; margin-bottom: 4px;">Hash: ${tx.hash.slice(0, 20)}...</p>
          <p class="text-dim" style="font-size: 10px; margin-bottom: 4px;">Value: ${valueEth} ${getNetworkSymbol(tx.network)}</p>
          <p class="text-dim" style="font-size: 10px;">Gas: ${gasGwei} Gwei • Nonce: ${tx.nonce}</p>
        </div>
      `;
    }

    listEl.innerHTML = html;

    // Add click handlers for transaction items
    listEl.querySelectorAll('[data-tx-hash]').forEach(el => {
      el.addEventListener('click', () => {
        const txHash = el.dataset.txHash;
        showTransactionDetails(txHash);
      });
    });

    // Add click handlers for refresh buttons
    listEl.querySelectorAll('[data-refresh-tx]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent default button behavior
        e.stopPropagation(); // Prevent opening transaction details
        const txHash = btn.dataset.refreshTx;
        await refreshTransactionFromList(txHash);
      });
    });

  } catch (error) {
    console.error('Error loading transaction history:', error);
    listEl.innerHTML = '<p class="text-center text-dim">Error loading transactions</p>';
  }
}

// Refresh transaction status from blockchain
async function refreshTransactionStatus() {
  if (!currentState.address || !currentState.currentTxHash) return;

  const btn = document.getElementById('btn-refresh-tx-status');
  if (!btn) return;

  try {
    btn.disabled = true;
    btn.textContent = '⏳ Checking blockchain...';

    // Get current transaction to get network
    const txResponse = await chrome.runtime.sendMessage({
      type: 'GET_TX_BY_HASH',
      address: currentState.address,
      txHash: currentState.currentTxHash
    });

    if (!txResponse.success || !txResponse.transaction) {
      throw new Error('Transaction not found');
    }

    const network = txResponse.transaction.network;

    // Refresh status from blockchain
    const refreshResponse = await chrome.runtime.sendMessage({
      type: 'REFRESH_TX_STATUS',
      address: currentState.address,
      txHash: currentState.currentTxHash,
      network: network
    });

    if (!refreshResponse.success) {
      throw new Error(refreshResponse.error || 'Failed to refresh status');
    }

    // Show result message
    if (refreshResponse.status === 'pending') {
      alert('✋ Transaction is still pending on the blockchain.\n\nIt has not been mined yet.');
    } else if (refreshResponse.status === 'confirmed') {
      alert(`✅ Status updated!\n\nTransaction is CONFIRMED on block ${refreshResponse.blockNumber}`);
    } else {
      alert('❌ Status updated!\n\nTransaction FAILED on the blockchain.');
    }

    // Reload transaction details to show updated status
    await showTransactionDetails(currentState.currentTxHash);

  } catch (error) {
    console.error('Error refreshing transaction status:', error);
    alert('Error refreshing status: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🔄 REFRESH STATUS FROM BLOCKCHAIN';
  }
}

async function showTransactionDetails(txHash) {
  if (!currentState.address) return;

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_TX_BY_HASH',
      address: currentState.address,
      txHash: txHash
    });

    if (!response.success || !response.transaction) {
      alert('Transaction not found');
      return;
    }

    const tx = response.transaction;

    // Show screen
    showScreen('screen-tx-details');

    // Populate details
    const statusBadge = document.getElementById('tx-status-badge');
    const statusText = document.getElementById('tx-status-text');

    if (tx.status === 'pending') {
      statusText.textContent = '⏳ PENDING';
      statusBadge.style.borderColor = 'var(--terminal-warning)';
      statusText.style.color = 'var(--terminal-warning)';
      document.getElementById('tx-pending-actions').classList.remove('hidden');
      document.getElementById('tx-detail-block-section').classList.add('hidden');
    } else if (tx.status === 'confirmed') {
      statusText.textContent = '✅ CONFIRMED';
      statusBadge.style.borderColor = '#44ff44';
      statusText.style.color = '#44ff44';
      document.getElementById('tx-pending-actions').classList.add('hidden');
      document.getElementById('tx-detail-block-section').classList.remove('hidden');
      document.getElementById('tx-detail-block').textContent = tx.blockNumber || '--';
    } else {
      statusText.textContent = '❌ FAILED';
      statusBadge.style.borderColor = '#ff4444';
      statusText.style.color = '#ff4444';
      document.getElementById('tx-pending-actions').classList.add('hidden');
      document.getElementById('tx-detail-block-section').classList.add('hidden');
    }

    document.getElementById('tx-detail-hash').textContent = tx.hash;
    document.getElementById('tx-detail-from').textContent = tx.from;
    document.getElementById('tx-detail-to').textContent = tx.to || 'Contract Creation';
    document.getElementById('tx-detail-value').textContent = ethers.formatEther(tx.value || '0') + ' ' + getNetworkSymbol(tx.network);
    document.getElementById('tx-detail-nonce').textContent = tx.nonce;
    document.getElementById('tx-detail-gas-price').textContent = ethers.formatUnits(tx.gasPrice || '0', 'gwei') + ' Gwei';
    document.getElementById('tx-detail-network').textContent = getNetworkName(tx.network);
    document.getElementById('tx-detail-timestamp').textContent = new Date(tx.timestamp).toLocaleString();

    // Store current tx hash for speed up/cancel
    currentState.currentTxHash = tx.hash;

    // Set up explorer link
    const explorerBtn = document.getElementById('btn-view-explorer');
    explorerBtn.onclick = () => {
      const url = getExplorerUrl(tx.network, 'tx', tx.hash);
      chrome.tabs.create({ url });
    };

  } catch (error) {
    console.error('Error loading transaction details:', error);
    alert('Error loading transaction details');
  }
}

// State for gas price refresh across different forms
let gasPriceRefreshState = {
  approval: { network: null, txRequest: null, symbol: null },
  send: { network: null, txRequest: null, symbol: null },
  token: { network: null, txRequest: null, symbol: null }
};

// State for speed-up modal
let speedUpModalState = {
  txHash: null,
  address: null,
  network: null,
  originalGasPrice: null,
  currentGasPrice: null,
  recommendedGasPrice: null
};

// State for cancel transaction modal
let cancelModalState = {
  txHash: null,
  address: null,
  network: null,
  originalGasPrice: null,
  currentGasPrice: null,
  recommendedGasPrice: null
};

async function handleSpeedUpTransaction() {
  if (!currentState.address || !currentState.currentTxHash) return;

  try {
    // Get transaction details
    const txResponse = await chrome.runtime.sendMessage({
      type: 'GET_TX_BY_HASH',
      address: currentState.address,
      txHash: currentState.currentTxHash
    });

    if (!txResponse.success || !txResponse.transaction) {
      alert('Could not load transaction details');
      return;
    }

    const tx = txResponse.transaction;

    // Store state for modal
    speedUpModalState.txHash = currentState.currentTxHash;
    speedUpModalState.address = currentState.address;
    speedUpModalState.network = tx.network;
    speedUpModalState.originalGasPrice = tx.gasPrice;

    // Show modal and load gas prices
    document.getElementById('modal-speed-up-tx').classList.remove('hidden');
    await refreshGasPrices();

  } catch (error) {
    console.error('Error opening speed-up modal:', error);
    alert('Error loading gas prices');
  }
}

async function refreshGasPrices() {
  const loadingEl = document.getElementById('speed-up-loading');
  const refreshBtn = document.getElementById('btn-refresh-gas-price');

  try {
    // Show loading state
    loadingEl.classList.remove('hidden');
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⏳ Loading...';

    // Fetch current network gas price
    const gasResponse = await chrome.runtime.sendMessage({
      type: 'GET_CURRENT_GAS_PRICE',
      network: speedUpModalState.network
    });

    if (!gasResponse.success) {
      throw new Error(gasResponse.error || 'Failed to fetch gas price');
    }

    // Store current and calculate recommended (current + 10%)
    speedUpModalState.currentGasPrice = gasResponse.gasPrice;
    const currentGwei = parseFloat(gasResponse.gasPriceGwei);
    const recommendedGwei = (currentGwei * 1.1).toFixed(2);
    speedUpModalState.recommendedGasPrice = (BigInt(gasResponse.gasPrice) * BigInt(110) / BigInt(100)).toString();

    // Update UI
    const originalGwei = (Number(speedUpModalState.originalGasPrice) / 1e9).toFixed(2);
    document.getElementById('speed-up-original-gas').textContent = `${originalGwei} Gwei`;
    document.getElementById('speed-up-current-gas').textContent = `${currentGwei} Gwei`;
    document.getElementById('speed-up-recommended-gas').textContent = `${recommendedGwei} Gwei`;

    // Calculate and show comparison
    const comparison = currentGwei / parseFloat(originalGwei);
    const messageEl = document.getElementById('speed-up-comparison-message');
    if (comparison > 2) {
      messageEl.textContent = `⚠️ Network gas is ${comparison.toFixed(0)}x higher than your transaction!`;
      messageEl.style.color = 'var(--terminal-danger)';
    } else if (comparison > 1.2) {
      messageEl.textContent = `Network gas is ${comparison.toFixed(1)}x higher than your transaction`;
      messageEl.style.color = 'var(--terminal-warning)';
    } else {
      messageEl.textContent = 'Network gas is close to your transaction price';
      messageEl.style.color = 'var(--terminal-success)';
    }

  } catch (error) {
    console.error('Error refreshing gas prices:', error);
    document.getElementById('speed-up-comparison-message').textContent = `Error: ${error.message}`;
    document.getElementById('speed-up-comparison-message').style.color = 'var(--terminal-danger)';
  } finally {
    loadingEl.classList.add('hidden');
    refreshBtn.disabled = false;
    refreshBtn.textContent = '🔄 REFRESH GAS PRICE';
  }
}

async function confirmSpeedUp() {
  try {
    // Get custom gas price if provided
    const customGasInput = document.getElementById('speed-up-custom-gas').value;
    let gasPriceToUse = speedUpModalState.recommendedGasPrice;

    if (customGasInput && customGasInput.trim() !== '') {
      const customGwei = parseFloat(customGasInput);
      if (isNaN(customGwei) || customGwei <= 0) {
        alert('Invalid gas price. Please enter a positive number.');
        return;
      }
      // Convert Gwei to Wei
      gasPriceToUse = (BigInt(Math.floor(customGwei * 1e9))).toString();
    }

    // Close modal
    document.getElementById('modal-speed-up-tx').classList.add('hidden');

    // Get password
    const password = await showPasswordPrompt('Speed Up Transaction', 'Enter your password to confirm speed-up');
    if (!password) return;

    // Create temporary session
    const activeWallet = await getActiveWallet();
    const sessionResponse = await chrome.runtime.sendMessage({
      type: 'CREATE_SESSION',
      password: password,
      walletId: activeWallet.id,
      durationMs: 60000
    });

    if (!sessionResponse.success) {
      alert('Invalid password');
      return;
    }

    // Speed up transaction with custom gas price
    const response = await chrome.runtime.sendMessage({
      type: 'SPEED_UP_TX',
      address: speedUpModalState.address,
      txHash: speedUpModalState.txHash,
      sessionToken: sessionResponse.sessionToken,
      customGasPrice: gasPriceToUse
    });

    if (response.success) {
      alert(`Transaction sped up!\nNew TX: ${response.txHash.slice(0, 20)}...`);
      showTransactionDetails(response.txHash);
    } else {
      alert('Error speeding up transaction: ' + response.error);
    }

  } catch (error) {
    console.error('Error speeding up transaction:', error);
    alert('Error speeding up transaction');
  }
}

// Refresh gas prices for cancel transaction modal
async function refreshCancelGasPrices() {
  const loadingEl = document.getElementById('cancel-loading');
  const refreshBtn = document.getElementById('btn-refresh-cancel-gas-price');

  try {
    // Show loading state
    loadingEl.classList.remove('hidden');
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⏳ Loading...';

    // Fetch current network gas price
    const gasResponse = await chrome.runtime.sendMessage({
      type: 'GET_CURRENT_GAS_PRICE',
      network: cancelModalState.network
    });

    if (!gasResponse.success) {
      throw new Error(gasResponse.error || 'Failed to fetch gas price');
    }

    // Store current and calculate recommended (current + 10%)
    cancelModalState.currentGasPrice = gasResponse.gasPrice;
    const currentGwei = parseFloat(gasResponse.gasPriceGwei);
    const recommendedGwei = (currentGwei * 1.1).toFixed(2);
    cancelModalState.recommendedGasPrice = (BigInt(gasResponse.gasPrice) * BigInt(110) / BigInt(100)).toString();

    // Update UI
    const originalGwei = (Number(cancelModalState.originalGasPrice) / 1e9).toFixed(2);
    document.getElementById('cancel-original-gas').textContent = `${originalGwei} Gwei`;
    document.getElementById('cancel-current-gas').textContent = `${currentGwei} Gwei`;
    document.getElementById('cancel-recommended-gas').textContent = `${recommendedGwei} Gwei`;

    // Calculate and show comparison
    const comparison = currentGwei / parseFloat(originalGwei);
    const messageEl = document.getElementById('cancel-comparison-message');
    if (comparison > 2) {
      messageEl.textContent = `⚠️ Network gas is ${comparison.toFixed(0)}x higher than your transaction!`;
      messageEl.style.color = 'var(--terminal-danger)';
    } else if (comparison > 1.2) {
      messageEl.textContent = `Network gas is ${comparison.toFixed(1)}x higher than your transaction`;
      messageEl.style.color = 'var(--terminal-warning)';
    } else {
      messageEl.textContent = 'Network gas is close to your transaction price';
      messageEl.style.color = 'var(--terminal-success)';
    }

  } catch (error) {
    console.error('Error refreshing cancel gas prices:', error);
    document.getElementById('cancel-comparison-message').textContent = `Error: ${error.message}`;
    document.getElementById('cancel-comparison-message').style.color = 'var(--terminal-danger)';
  } finally {
    loadingEl.classList.add('hidden');
    refreshBtn.disabled = false;
    refreshBtn.textContent = '🔄 REFRESH GAS PRICE';
  }
}

// Confirm cancel transaction
async function confirmCancelTransaction() {
  try {
    // Get custom gas price if provided
    const customGasInput = document.getElementById('cancel-custom-gas').value;
    let gasPriceToUse = cancelModalState.recommendedGasPrice;

    if (customGasInput && customGasInput.trim() !== '') {
      const customGwei = parseFloat(customGasInput);
      if (isNaN(customGwei) || customGwei <= 0) {
        alert('Invalid gas price. Please enter a positive number.');
        return;
      }
      // Convert Gwei to Wei
      gasPriceToUse = (BigInt(Math.floor(customGwei * 1e9))).toString();
    }

    // Close modal
    document.getElementById('modal-cancel-tx').classList.add('hidden');

    // Get password
    const password = await showPasswordPrompt('Cancel Transaction', 'Enter your password to confirm cancellation');
    if (!password) return;

    // Create temporary session
    const activeWallet = await getActiveWallet();
    const sessionResponse = await chrome.runtime.sendMessage({
      type: 'CREATE_SESSION',
      password: password,
      walletId: activeWallet.id,
      durationMs: 60000
    });

    if (!sessionResponse.success) {
      alert('Invalid password');
      return;
    }

    // Cancel transaction with custom gas price
    const response = await chrome.runtime.sendMessage({
      type: 'CANCEL_TX',
      address: cancelModalState.address,
      txHash: cancelModalState.txHash,
      sessionToken: sessionResponse.sessionToken,
      customGasPrice: gasPriceToUse
    });

    if (response.success) {
      alert(`Transaction cancelled!\nCancellation TX: ${response.txHash.slice(0, 20)}...`);
      showTransactionDetails(response.txHash);
    } else {
      alert('Error cancelling transaction: ' + response.error);
    }

  } catch (error) {
    console.error('Error cancelling transaction:', error);
    alert('Error cancelling transaction');
  }
}

// Refresh gas prices for transaction approval screen
async function refreshApprovalGasPrice() {
  const btn = document.getElementById('btn-refresh-approval-gas');
  if (!btn || !gasPriceRefreshState.approval.network) return;

  try {
    btn.disabled = true;
    btn.textContent = '⏳ Loading...';

    const { network, txRequest, symbol } = gasPriceRefreshState.approval;
    await populateGasPrices(network, txRequest, symbol);
  } catch (error) {
    console.error('Error refreshing gas price:', error);
    alert('Error refreshing gas price');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔄 REFRESH GAS PRICE';
  }
}

// Refresh gas prices for send screen
async function refreshSendGasPrice() {
  const btn = document.getElementById('btn-refresh-send-gas');
  if (!btn || !gasPriceRefreshState.send.network) return;

  try {
    btn.disabled = true;
    btn.textContent = '⏳ Loading...';

    const { network, txRequest, symbol } = gasPriceRefreshState.send;
    await populateSendGasPrices(network, txRequest, symbol);
  } catch (error) {
    console.error('Error refreshing gas price:', error);
    alert('Error refreshing gas price');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔄 REFRESH GAS PRICE';
  }
}

// Refresh gas prices for token send screen
async function refreshTokenGasPrice() {
  const btn = document.getElementById('btn-refresh-token-gas');
  if (!btn || !gasPriceRefreshState.token.network) return;

  try {
    btn.disabled = true;
    btn.textContent = '⏳ Loading...';

    const { network, txRequest, symbol } = gasPriceRefreshState.token;
    await populateTokenGasPrices(network, txRequest, symbol);
  } catch (error) {
    console.error('Error refreshing gas price:', error);
    alert('Error refreshing gas price');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔄 REFRESH GAS PRICE';
  }
}

async function handleCancelTransaction() {
  if (!currentState.address || !currentState.currentTxHash) return;

  try {
    // Get transaction details
    const txResponse = await chrome.runtime.sendMessage({
      type: 'GET_TX_BY_HASH',
      address: currentState.address,
      txHash: currentState.currentTxHash
    });

    if (!txResponse.success || !txResponse.transaction) {
      alert('Could not load transaction details');
      return;
    }

    const tx = txResponse.transaction;

    // Store state for modal
    cancelModalState.txHash = currentState.currentTxHash;
    cancelModalState.address = currentState.address;
    cancelModalState.network = tx.network;
    cancelModalState.originalGasPrice = tx.gasPrice;

    // Show modal and load gas prices
    document.getElementById('modal-cancel-tx').classList.remove('hidden');
    await refreshCancelGasPrices();

  } catch (error) {
    console.error('Error opening cancel modal:', error);
    alert('Error loading gas prices');
  }
}

async function handleClearTransactionHistory() {
  if (!confirm('Clear all transaction history for this address? This cannot be undone.')) {
    return;
  }

  try {
    await chrome.runtime.sendMessage({
      type: 'CLEAR_TX_HISTORY',
      address: currentState.address
    });

    alert('Transaction history cleared');
    showScreen('screen-dashboard');
    await updateDashboard();
  } catch (error) {
    console.error('Error clearing transaction history:', error);
    alert('Error clearing transaction history');
  }
}

/**
 * Show transaction status after approval
 * Keeps approval window open to show tx status
 */
let txStatusPollInterval = null;
let txStatusCurrentHash = null;
let txStatusCurrentAddress = null;
let txStatusStartTime = null;

async function showTransactionStatus(txHash, address, requestId) {
  // Showing transaction status

  // Store current transaction hash and address
  txStatusCurrentHash = txHash;
  txStatusCurrentAddress = address;
  txStatusStartTime = Date.now();

  // Hide approval form
  document.getElementById('tx-approval-form').classList.add('hidden');

  // Show status section
  const statusSection = document.getElementById('tx-status-section');
  statusSection.classList.remove('hidden');

  // Populate transaction hash
  document.getElementById('tx-status-hash').textContent = txHash;

  // Poll for transaction status updates
  const updateStatus = async () => {
    try {
      // Polling transaction status
      const response = await chrome.runtime.sendMessage({
        type: 'GET_TX_BY_HASH',
        address: txStatusCurrentAddress,
        txHash: txHash
      });

      // Status poll response

      if (response.success && response.transaction) {
        const tx = response.transaction;
        // Transaction status updated

        const statusMessage = document.getElementById('tx-status-message');
        const statusDetails = document.getElementById('tx-status-details');
        const pendingActions = document.getElementById('tx-status-pending-actions');

        if (tx.status === 'confirmed') {
          // Transaction confirmed
          statusMessage.textContent = '✅ Transaction Confirmed!';
          statusDetails.textContent = `Block: ${tx.blockNumber}`;
          statusDetails.style.color = 'var(--terminal-success)';
          pendingActions.classList.add('hidden');

          // Stop polling
          if (txStatusPollInterval) {
            clearInterval(txStatusPollInterval);
            txStatusPollInterval = null;
          }

          // Auto-close after 2 seconds
          setTimeout(() => {
            window.close();
          }, 2000);
        } else if (tx.status === 'failed') {
          statusMessage.textContent = '❌ Transaction Failed';
          statusDetails.textContent = 'The transaction was rejected or replaced';
          statusDetails.style.color = '#ff4444';
          pendingActions.classList.add('hidden');

          // Stop polling
          if (txStatusPollInterval) {
            clearInterval(txStatusPollInterval);
            txStatusPollInterval = null;
          }

          // Auto-close after 2 seconds
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          // Still pending
          statusMessage.textContent = '⏳ Waiting for confirmation...';
          statusDetails.textContent = 'This usually takes 10-30 seconds';
          statusDetails.style.color = 'var(--terminal-fg-dim)';
          pendingActions.classList.remove('hidden');
        }
      } else {
        // Transaction may not be in storage yet if recently broadcast
        // Only log if polling has been running for a while
        if (txStatusPollInterval && Date.now() - txStatusStartTime > 5000) {
          console.warn('🫀 Transaction not found in storage:', txHash);
        }
      }
    } catch (error) {
      console.error('🫀 Error checking transaction status:', error);
    }
  };

  // Initial status check
  await updateStatus();

  // Poll every 3 seconds
  txStatusPollInterval = setInterval(updateStatus, 3000);
}

function getNetworkSymbol(network) {
  const symbols = {
    'pulsechain': 'PLS',
    'pulsechainTestnet': 'tPLS',
    'ethereum': 'ETH',
    'sepolia': 'SepoliaETH'
  };
  return symbols[network] || 'ETH';
}

function getNetworkName(network) {
  const names = {
    'pulsechain': 'PulseChain Mainnet',
    'pulsechainTestnet': 'PulseChain Testnet V4',
    'ethereum': 'Ethereum Mainnet',
    'sepolia': 'Sepolia Testnet'
  };
  return names[network] || network;
}

// ===== UTILITIES =====
async function handleCopyAddress() {
  try {
    await navigator.clipboard.writeText(currentState.address);
    const btn = document.getElementById('btn-copy-address');
    const originalText = btn.textContent;
    btn.textContent = 'COPIED!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (error) {
    alert('Failed to copy address');
  }
}
