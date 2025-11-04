/**
 * content/content-script.js
 *
 * Content script that bridges communication between inpage provider and background service worker
 */

// Inject the inpage provider script into the page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inpage.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Content script initialized

// Listen for messages from the inpage provider
window.addEventListener('message', async (event) => {
  // Only accept messages from same window
  if (event.source !== window) return;

  // Only handle messages meant for the content script
  if (event.data.target !== 'heartwallet-contentscript') return;

  const { type, requestId, method, params } = event.data;

  if (type !== 'WALLET_REQUEST') return;

  // Forwarding request

  try {
    // Forward request to background service worker
    const response = await chrome.runtime.sendMessage({
      type: 'WALLET_REQUEST',
      requestId,
      method,
      params,
      origin: window.location.origin
    });

    // Received response

    // SECURITY: Send response back to inpage provider with specific origin
    window.postMessage({
      target: 'heartwallet-inpage',
      requestId,
      method,
      result: response.result,
      error: response.error
    }, window.location.origin);

  } catch (error) {
    console.error('🫀 Content script error:', error);

    // Check if extension context was invalidated (happens after extension reload)
    if (error.message && error.message.includes('Extension context invalidated')) {
      console.warn('🫀 HeartWallet extension was reloaded. Please refresh this page to reconnect.');
    }

    // SECURITY: Send error back to inpage provider with specific origin
    window.postMessage({
      target: 'heartwallet-inpage',
      requestId,
      method,
      error: {
        message: error.message || 'Unknown error',
        code: -32603
      }
    }, window.location.origin);
  }
});

// Listen for events from background (account/chain changes)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ACCOUNTS_CHANGED') {
    // SECURITY: Send event with specific origin
    window.postMessage({
      target: 'heartwallet-inpage',
      type: 'EVENT',
      event: 'accountsChanged',
      data: message.accounts
    }, window.location.origin);
  } else if (message.type === 'CHAIN_CHANGED') {
    // SECURITY: Send event with specific origin
    window.postMessage({
      target: 'heartwallet-inpage',
      type: 'EVENT',
      event: 'chainChanged',
      data: message.chainId
    }, window.location.origin);
  }
});

// Content script ready
