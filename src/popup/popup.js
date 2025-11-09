/**
 * popup.js
 *
 * UI controller for HeartWallet popup
 */

import {
  createWallet,
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
  exportMnemonicForWallet
} from '../core/wallet.js';
import { save, load } from '../core/storage.js';
import { shortenAddress } from '../core/validation.js';
import * as rpc from '../core/rpc.js';
import { ethers } from 'ethers';
import QRCode from 'qrcode';
import * as tokens from '../core/tokens.js';
import { fetchTokenPrices, getTokenValueUSD, formatUSD } from '../core/priceOracle.js';
import * as erc20 from '../core/erc20.js';

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
    maxGasPriceGwei: 1000 // Maximum gas price in Gwei (default 1000)
  },
  networkSettings: null, // Will be loaded from storage or use defaults
  lastActivityTime: null, // Track last activity for auto-lock
  tokenPrices: null, // Token prices in USD (cached from PulseX)
  currentTokenDetails: null // Currently viewing token details
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

  // Normal popup flow
  // Run migration first (converts old single-wallet to multi-wallet format)
  await migrateToMultiWallet();

  await loadSettings();
  await loadNetwork();
  applyTheme();
  await checkWalletStatus();
  setupEventListeners();
  updateNetworkDisplays();
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
    // Wallet exists - show unlock screen
    showScreen('screen-unlock');
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
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    loadSettingsToUI();
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
    currentState.settings.maxGasPriceGwei = parseInt(e.target.value);
    saveSettings();
  });
  document.getElementById('setting-show-testnets')?.addEventListener('change', (e) => {
    currentState.settings.showTestNetworks = e.target.checked;
    saveSettings();
    updateNetworkSelector();
  });
  document.getElementById('btn-view-seed')?.addEventListener('click', handleViewSeed);
  document.getElementById('btn-export-key')?.addEventListener('click', handleExportKey);

  // Password prompt modal
  document.getElementById('btn-password-prompt-confirm')?.addEventListener('click', () => {
    const password = document.getElementById('password-prompt-input').value;
    if (password) {
      closePasswordPrompt(password);
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

    const password = await showPasswordPrompt('Speed Up Transaction', 'Enter your password to speed up this transaction with higher gas price (1.2x)');
    if (!password) return;

    try {
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

      const response = await chrome.runtime.sendMessage({
        type: 'SPEED_UP_TX',
        address: txStatusCurrentAddress,
        txHash: txStatusCurrentHash,
        sessionToken: sessionResponse.sessionToken,
        gasPriceMultiplier: 1.2
      });

      if (response.success) {
        alert(`Transaction sped up!\nNew TX: ${response.txHash.slice(0, 20)}...\n\nThe window will now close.`);
        if (txStatusPollInterval) {
          clearInterval(txStatusPollInterval);
        }
        window.close();
      } else {
        alert('Error speeding up transaction: ' + sanitizeError(response.error));
      }
    } catch (error) {
      alert('Error: ' + sanitizeError(error.message));
    }
  });

  document.getElementById('btn-tx-status-cancel')?.addEventListener('click', async () => {
    if (!txStatusCurrentHash || !txStatusCurrentAddress) return;

    const password = await showPasswordPrompt('Cancel Transaction', 'Enter your password to cancel this transaction by sending a 0-value replacement');
    if (!password) return;

    try {
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

      const response = await chrome.runtime.sendMessage({
        type: 'CANCEL_TX',
        address: txStatusCurrentAddress,
        txHash: txStatusCurrentHash,
        sessionToken: sessionResponse.sessionToken
      });

      if (response.success) {
        alert(`Transaction cancelled!\nCancellation TX: ${response.txHash.slice(0, 20)}...\n\nThe window will now close.`);
        if (txStatusPollInterval) {
          clearInterval(txStatusPollInterval);
        }
        window.close();
      } else {
        alert('Error cancelling transaction: ' + sanitizeError(response.error));
      }
    } catch (error) {
      alert('Error: ' + sanitizeError(error.message));
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

  try {
    errorDiv.classList.add('hidden');
    verificationErrorDiv.classList.add('hidden');

    // Import wallet from the mnemonic we already generated
    const { address } = await importFromMnemonic(generatedMnemonic, password);

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

  try {
    errorDiv.classList.add('hidden');

    let address;
    if (method === 'mnemonic') {
      const mnemonic = document.getElementById('import-mnemonic').value;
      const result = await importFromMnemonic(mnemonic, password);
      address = result.address;
    } else {
      const privateKey = document.getElementById('import-privatekey').value;
      const result = await importFromPrivateKey(privateKey, password);
      address = result.address;
    }

    // Success!
    alert('Wallet imported successfully!');
    currentState.address = address;
    currentState.isUnlocked = true;
    showScreen('screen-dashboard');
    updateDashboard();
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}

// ===== UNLOCK =====
async function handleUnlock() {
  const password = document.getElementById('password-unlock').value;
  const errorDiv = document.getElementById('unlock-error');

  // Check if locked out due to too many failed attempts
  const lockoutInfo = await checkRateLimitLockout();
  if (lockoutInfo.isLockedOut) {
    const remainingMinutes = Math.ceil(lockoutInfo.remainingMs / 1000 / 60);
    errorDiv.textContent = `Too many failed attempts. Please wait ${remainingMinutes} minute(s) before trying again.`;
    errorDiv.classList.remove('hidden');
    return;
  }

  try {
    errorDiv.classList.add('hidden');

    // Unlock wallet with auto-upgrade notification
    const { address, signer, upgraded, iterationsBefore, iterationsAfter } = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet encryption: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()} iterations`);
        // Show visual feedback in UI
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message info';
        statusDiv.textContent = `🔐 Upgrading wallet security to ${info.recommendedIterations.toLocaleString()} iterations...`;
        errorDiv.parentElement.insertBefore(statusDiv, errorDiv);
        setTimeout(() => statusDiv.remove(), 3000);
      }
    });

    // Show upgrade completion message if wallet was upgraded
    if (upgraded) {
      console.log(`✅ Wallet upgraded: ${iterationsBefore.toLocaleString()} → ${iterationsAfter.toLocaleString()} iterations`);
      const statusDiv = document.createElement('div');
      statusDiv.className = 'status-message success';
      statusDiv.textContent = `✅ Security upgraded: ${iterationsBefore.toLocaleString()} → ${iterationsAfter.toLocaleString()} iterations`;
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
}

async function updateRecentTransactions() {
  const txListEl = document.getElementById('tx-list');
  if (!txListEl || !currentState.address) return;

  // Show loading state
  txListEl.innerHTML = '<p class="text-center text-dim">Loading transactions...</p>';

  try {
    const transactions = await rpc.getRecentTransactions(currentState.network, currentState.address, 3, 1000);

    if (transactions.length === 0) {
      txListEl.innerHTML = '<p class="text-center text-dim">No recent transactions</p>';
      return;
    }

    let html = '';

    for (const tx of transactions) {
      const valueEth = ethers.formatEther(tx.value);
      const formatted = formatBalanceWithCommas(valueEth, 18);
      const date = new Date(tx.timestamp * 1000).toLocaleDateString();
      const type = tx.type === 'sent' ? '→' : '←';
      const typeColor = tx.type === 'sent' ? '#ff4444' : '#44ff44';
      const explorerUrl = getExplorerUrl(currentState.network, 'tx', tx.hash);

      html += `
        <div style="padding: 8px; border-bottom: 1px solid var(--terminal-border); font-size: 11px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: ${typeColor};">${type} ${tx.type === 'sent' ? 'Sent' : 'Received'}</span>
            <span class="text-dim">${date}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold;" title="${formatted.tooltip}">${formatted.display}</span>
            <a href="${explorerUrl}" target="_blank" style="color: var(--terminal-green); text-decoration: none; font-size: 10px;">VIEW →</a>
          </div>
        </div>
      `;
    }

    txListEl.innerHTML = html;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    txListEl.innerHTML = '<p class="text-center text-dim">Error loading transactions</p>';
  }
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

  showScreen('screen-send');
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

function handleSendMax() {
  // Set amount to available balance (minus estimated gas)
  // For simplicity, we'll just set to current balance
  // User should leave some for gas
  const balance = parseFloat(currentState.balance);
  if (balance > 0) {
    // Leave a bit for gas (rough estimate: 0.001 for simple transfer)
    const maxSend = Math.max(0, balance - 0.001);
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

  // Validate inputs
  if (!toAddress || !amount || !password) {
    errorEl.textContent = 'Please fill in all fields';
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

    // Unlock wallet with password and auto-upgrade if needed
    const { signer, upgraded, iterationsBefore, iterationsAfter } = await unlockWallet(password, {
      onUpgradeStart: (info) => {
        console.log(`🔐 Auto-upgrading wallet: ${info.currentIterations.toLocaleString()} → ${info.recommendedIterations.toLocaleString()}`);
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message info';
        statusDiv.textContent = '🔐 Upgrading wallet security...';
        errorEl.parentElement.insertBefore(statusDiv, errorEl);
        setTimeout(() => statusDiv.remove(), 3000);
      }
    });

    if (upgraded) {
      console.log(`✅ Wallet upgraded: ${iterationsBefore.toLocaleString()} → ${iterationsAfter.toLocaleString()}`);
    }

    // Get provider with automatic failover and connect signer
    const provider = await rpc.getProvider(currentState.network);
    const connectedSigner = signer.connect(provider);

    let txResponse, symbol;

    if (selectedAsset === 'native') {
      // Send native currency
      const tx = {
        to: toAddress,
        value: ethers.parseEther(amount)
      };
      txResponse = await connectedSigner.sendTransaction(tx);
      symbol = symbols[currentState.network] || 'tokens';
    } else {
      // Send token
      const allTokens = await tokens.getAllTokens(currentState.network);
      const token = allTokens.find(t => t.address === selectedAsset);

      if (!token) {
        throw new Error('Token not found');
      }

      const amountWei = erc20.parseTokenAmount(amount, token.decimals);
      txResponse = await erc20.transferToken(connectedSigner, token.address, toAddress, amountWei);
      symbol = token.symbol;
    }

    // Show success modal with tx hash
    showTransactionSuccessModal(txResponse.hash);

    // Send desktop notification
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
        title: 'Transaction Sent',
        message: `Sent ${amount} ${symbol} to ${toAddress.slice(0, 10)}...`,
        priority: 2
      });
    }

    // Return to dashboard
    showScreen('screen-dashboard');

    // Wait for transaction confirmation in background
    waitForTransactionConfirmation(txResponse.hash, amount, symbol);

  } catch (error) {
    console.error('Send transaction error:', error);
    errorEl.textContent = error.message.includes('incorrect password')
      ? 'Incorrect password'
      : 'Transaction failed: ' + error.message;
    errorEl.classList.remove('hidden');
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

  // Show screen
  showScreen('screen-token-details');
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

  // Validate inputs
  if (!recipient || !amount || !password) {
    errorEl.textContent = 'Please fill all fields';
    errorEl.classList.remove('hidden');
    return;
  }

  if (!recipient.startsWith('0x') || recipient.length !== 42) {
    errorEl.textContent = 'Invalid recipient address';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    const amountBN = ethers.parseUnits(amount, tokenData.decimals);

    // Check balance
    const balanceWei = await erc20.getTokenBalance(currentState.network, tokenData.address, currentState.address);
    if (amountBN > balanceWei) {
      errorEl.textContent = 'Insufficient balance';
      errorEl.classList.remove('hidden');
      return;
    }

    // Decrypt wallet
    const encryptedWallet = await load('encrypted_wallet');
    if (!encryptedWallet) {
      errorEl.textContent = 'Wallet not found';
      errorEl.classList.remove('hidden');
      return;
    }

    let decryptedWallet;
    try {
      decryptedWallet = await wallet.decryptWallet(encryptedWallet, password);
    } catch (err) {
      errorEl.textContent = 'Incorrect password';
      errorEl.classList.remove('hidden');
      return;
    }

    // Get the current wallet index
    const walletIndex = currentState.walletIndex || 0;
    const walletInstance = decryptedWallet.wallets[walletIndex];

    // Create signer with automatic RPC failover
    const provider = await rpc.getProvider(currentState.network);
    const signer = new ethers.Wallet(walletInstance.privateKey, provider);

    // Send token
    const tx = await erc20.transferToken(
      signer,
      tokenData.address,
      recipient,
      amountBN.toString()
    );

    // Wait for transaction to be sent
    const receipt = await tx.wait();

    // Clear form
    document.getElementById('token-details-recipient').value = '';
    document.getElementById('token-details-amount').value = '';
    document.getElementById('token-details-password').value = '';

    // Show success and go back
    alert(`Transaction sent!\n\nTx Hash: ${tx.hash}`);
    showScreen('screen-tokens');

  } catch (error) {
    console.error('Error sending token:', error);
    errorEl.textContent = error.message || 'Transaction failed';
    errorEl.classList.remove('hidden');
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
function loadSettingsToUI() {
  document.getElementById('setting-autolock').value = currentState.settings.autoLockMinutes;
  document.getElementById('setting-decimals').value = currentState.settings.decimalPlaces;
  document.getElementById('setting-theme').value = currentState.settings.theme;
  document.getElementById('setting-show-testnets').checked = currentState.settings.showTestNetworks;
  document.getElementById('setting-max-gas-price').value = currentState.settings.maxGasPriceGwei || 1000;
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
            ${wallet.importMethod === 'create' ? 'Created' : 'Imported'} • ${new Date(wallet.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div class="button-group" style="gap: 6px;">
        ${!isActive ? `<button class="btn btn-small" data-wallet-id="${wallet.id}" data-action="switch">SWITCH</button>` : ''}
        <button class="btn btn-small" data-wallet-id="${wallet.id}" data-action="rename">RENAME</button>
        <button class="btn btn-small" data-wallet-id="${wallet.id}" data-action="export">EXPORT</button>
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

  try {
    await addWallet('create', {}, password, nickname || null);

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

  try {
    await addWallet('mnemonic', { mnemonic }, password, nickname || null);

    // Clear form
    document.getElementById('input-import-seed-nickname').value = '';
    document.getElementById('input-import-seed-phrase').value = '';

    // Refresh wallet list
    await renderWalletList();

    alert('Wallet imported successfully!');
  } catch (error) {
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

  try {
    await addWallet('privatekey', { privateKey }, password, nickname || null);

    // Clear form
    document.getElementById('input-import-key-nickname').value = '';
    document.getElementById('input-import-private-key').value = '';

    // Refresh wallet list
    await renderWalletList();

    alert('Wallet imported successfully!');
  } catch (error) {
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
  const confirmed = confirm(
    '⚠️ WARNING ⚠️\n\n' +
    'You are about to DELETE this wallet!\n\n' +
    'This action is PERMANENT and CANNOT be undone.\n\n' +
    'Make sure you have written down your seed phrase or private key.\n\n' +
    'Do you want to continue?'
  );

  if (!confirmed) return;

  const password = await showPasswordPrompt('Delete Wallet', 'Enter your password to delete this wallet');

  if (!password) return;

  try {
    await deleteWallet(walletId, password);
    closePasswordPrompt();

    // Refresh wallet list
    await renderWalletList();

    // If we deleted all wallets, go back to setup
    const walletsData = await getAllWallets();
    if (walletsData.walletList.length === 0) {
      currentState.isUnlocked = false;
      currentState.address = null;
      showScreen('screen-setup');
    }

    alert('Wallet deleted successfully!');
  } catch (error) {
    alert('Error deleting wallet: ' + error.message);
  }
}

// Export seed/key for a specific wallet
async function handleExportForWallet(walletId) {
  const password = await showPasswordPrompt('Export Wallet', 'Enter your password to export wallet secrets');

  if (!password) return;

  try {
    // Try to get mnemonic first
    const mnemonic = await exportMnemonicForWallet(walletId, password);

    if (mnemonic) {
      showSecretModal('Seed Phrase', mnemonic);
    } else {
      // No mnemonic, show private key
      const privateKey = await exportPrivateKeyForWallet(walletId, password);
      showSecretModal('Private Key', privateKey);
    }

    closePasswordPrompt();
  } catch (error) {
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
  try {
    // Fetch current gas price from RPC
    const gasPriceHex = await rpc.getGasPrice(network);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;

    // Calculate slow (80%), normal (100%), fast (150%)
    const slowGwei = (gasPriceGwei * 0.8).toFixed(2);
    const normalGwei = gasPriceGwei.toFixed(2);
    const fastGwei = (gasPriceGwei * 1.5).toFixed(2);

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

    // Show data section if there's contract data
    if (txRequest.data && txRequest.data !== '0x') {
      document.getElementById('tx-data-section').classList.remove('hidden');
      document.getElementById('tx-data').textContent = txRequest.data;
    } else {
      document.getElementById('tx-data-section').classList.add('hidden');
    }

    // Show the transaction approval screen
    showScreen('screen-transaction-approval');

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

        // Create a temporary session for this transaction using the entered password
        // This validates the password without passing it for the actual transaction
        const activeWallet = await getActiveWallet();
        const tempSessionResponse = await chrome.runtime.sendMessage({
          type: 'CREATE_SESSION',
          password,
          walletId: activeWallet.id,
          durationMs: 60000 // 1 minute temporary session
        });

        if (!tempSessionResponse.success) {
          throw new Error('Invalid password');
        }

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

    // Populate sign details
    document.getElementById('sign-site-origin').textContent = origin;
    document.getElementById('sign-address').textContent = address;

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

    // Setup approve button
    document.getElementById('btn-approve-sign').addEventListener('click', async () => {
      const approveBtn = document.getElementById('btn-approve-sign');
      const password = document.getElementById('sign-password').value;
      const errorEl = document.getElementById('sign-error');

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

        // Create a temporary session for this signing using the entered password
        const activeWallet = await getActiveWallet();
        const tempSessionResponse = await chrome.runtime.sendMessage({
          type: 'CREATE_SESSION',
          password,
          walletId: activeWallet.id,
          durationMs: 60000 // 1 minute temporary session
        });

        if (!tempSessionResponse.success) {
          throw new Error('Invalid password');
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

        // Create a temporary session for this signing using the entered password
        const activeWallet = await getActiveWallet();
        const tempSessionResponse = await chrome.runtime.sendMessage({
          type: 'CREATE_SESSION',
          password,
          walletId: activeWallet.id,
          durationMs: 60000 // 1 minute temporary session
        });

        if (!tempSessionResponse.success) {
          throw new Error('Invalid password');
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

      html += `
        <div class="panel mb-2" style="padding: 12px; cursor: pointer; border-color: ${statusColor};" data-tx-hash="${tx.hash}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: ${statusColor}; font-size: 14px;">${statusIcon} ${tx.status.toUpperCase()}</span>
            <span class="text-dim" style="font-size: 10px;">${date}</span>
          </div>
          <p class="text-dim" style="font-size: 10px; margin-bottom: 4px;">Hash: ${tx.hash.slice(0, 20)}...</p>
          <p class="text-dim" style="font-size: 10px; margin-bottom: 4px;">Value: ${valueEth} ${getNetworkSymbol(tx.network)}</p>
          <p class="text-dim" style="font-size: 10px;">Gas: ${gasGwei} Gwei • Nonce: ${tx.nonce}</p>
        </div>
      `;
    }

    listEl.innerHTML = html;

    // Add click handlers
    listEl.querySelectorAll('[data-tx-hash]').forEach(el => {
      el.addEventListener('click', () => {
        const txHash = el.dataset.txHash;
        showTransactionDetails(txHash);
      });
    });

  } catch (error) {
    console.error('Error loading transaction history:', error);
    listEl.innerHTML = '<p class="text-center text-dim">Error loading transactions</p>';
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

async function handleSpeedUpTransaction() {
  if (!currentState.address || !currentState.currentTxHash) return;

  const password = await showPasswordPrompt('Speed Up Transaction', 'Enter your password to speed up this transaction with higher gas price (1.2x)');
  if (!password) return;

  try {
    // Create temporary session
    const activeWallet = await getActiveWallet();
    const sessionResponse = await chrome.runtime.sendMessage({
      type: 'CREATE_SESSION',
      password: password,
      walletId: activeWallet.id,
      durationMs: 60000 // 1 minute temp session
    });

    if (!sessionResponse.success) {
      alert('Invalid password');
      return;
    }

    // Speed up transaction
    const response = await chrome.runtime.sendMessage({
      type: 'SPEED_UP_TX',
      address: currentState.address,
      txHash: currentState.currentTxHash,
      sessionToken: sessionResponse.sessionToken,
      gasPriceMultiplier: 1.2
    });

    if (response.success) {
      alert(`Transaction sped up!\nNew TX: ${response.txHash.slice(0, 20)}...`);
      // Refresh the transaction details
      showTransactionDetails(response.txHash);
    } else {
      alert('Error speeding up transaction: ' + response.error);
    }

  } catch (error) {
    console.error('Error speeding up transaction:', error);
    alert('Error speeding up transaction');
  }
}

async function handleCancelTransaction() {
  if (!currentState.address || !currentState.currentTxHash) return;

  if (!confirm('Cancel this transaction? A cancellation transaction will be sent.')) {
    return;
  }

  const password = await showPasswordPrompt('Cancel Transaction', 'Enter your password to cancel this transaction by sending a 0-value replacement');
  if (!password) return;

  try {
    // Create temporary session
    const activeWallet = await getActiveWallet();
    const sessionResponse = await chrome.runtime.sendMessage({
      type: 'CREATE_SESSION',
      password: password,
      walletId: activeWallet.id,
      durationMs: 60000 // 1 minute temp session
    });

    if (!sessionResponse.success) {
      alert('Invalid password');
      return;
    }

    // Cancel transaction
    const response = await chrome.runtime.sendMessage({
      type: 'CANCEL_TX',
      address: currentState.address,
      txHash: currentState.currentTxHash,
      sessionToken: sessionResponse.sessionToken
    });

    if (response.success) {
      alert(`Transaction cancelled!\nCancellation TX: ${response.txHash.slice(0, 20)}...`);
      // Refresh to show cancellation transaction
      showTransactionDetails(response.txHash);
    } else {
      alert('Error cancelling transaction: ' + response.error);
    }

  } catch (error) {
    console.error('Error cancelling transaction:', error);
    alert('Error cancelling transaction');
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

async function showTransactionStatus(txHash, address, requestId) {
  // Showing transaction status

  // Store current transaction hash and address
  txStatusCurrentHash = txHash;
  txStatusCurrentAddress = address;

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
        console.warn('🫀 Transaction not found in storage:', txHash);
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
