// This script runs in the isolated context of the content script.
// Its primary jobs are:
// 1. Inject the inpage.js script into the actual page context.
// 2. Relay messages between the inpage script and the background script.

console.log("HeartWallet content script loaded.");

/**
 * Injects the inpage script into the page's context.
 */
function injectScript() {
    try {
        const container = document.head || document.documentElement;
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute('async', 'false');
        scriptTag.src = chrome.runtime.getURL('inpage.js'); // Get URL from web_accessible_resources
        scriptTag.onload = function() {
            // Remove the script tag after script executes to clean up DOM
            // this.remove(); // Keep it for easier debugging?
            console.log("HeartWallet inpage script injected.");
        };
        scriptTag.onerror = function(error) {
            console.error("HeartWallet: Failed to inject inpage script:", error);
        };
        container.insertBefore(scriptTag, container.children[0]);
    } catch (e) {
        console.error('HeartWallet: Injection failed:', e);
    }
}

injectScript();

// --- Message Relaying --- //

// Store pending requests
const pendingRequests = new Map();

// 1. Listen for messages FROM the inpage script (window.postMessage)
window.addEventListener('message', (event) => {
    // Only accept messages from the current window
    if (event.source !== window) {
        return;
    }

    // Check if the message is intended for us (the content script)
    if (event.data && event.data.target === 'contentscript' && event.data.requestFor === 'heartwallet') {
        const requestPayload = event.data.payload;
        console.debug('ContentScript: Received request from Inpage:', requestPayload);
        
        // Store the request for potential response later
        pendingRequests.set(requestPayload.id, {
            method: requestPayload.method,
            params: requestPayload.params,
            timestamp: Date.now()
        });

        // Use a Promise-based approach with proper error handling
        sendMessageToBackground(requestPayload)
            .then(response => {
                // Success case - relay response back to inpage script
                relayResponseToInpage(requestPayload.id, response);
            })
            .catch(error => {
                // Error case - send error back to inpage script
                console.error(`ContentScript: Error sending message to background:`, error);
                const errorMessage = error?.message || 'Communication error with wallet';
                handleMessageError(requestPayload.id, errorMessage);
            });
    }
}, false);

/**
 * Send a message to the background script with proper error handling
 */
async function sendMessageToBackground(payload) {
    try {
        // Wrap chrome.runtime.sendMessage in a promise with timeout
        const response = await Promise.race([
            new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    { target: 'background', requestFor: 'heartwallet', payload: payload },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            throw new Error(chrome.runtime.lastError.message);
                        }
                        resolve(response);
                    }
                );
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Background script timeout')), 5000)
            )
        ]);
        
        if (!response) {
            throw new Error('Empty response from background');
        }
        
        return response;    } catch (error) {
        console.warn('Background communication error:', error);
        
        // Special handling for connection requests - they should use the connection popup workflow
        if (payload.method === 'eth_requestAccounts') {
            return { 
                id: payload.id,
                error: { 
                    code: 4001, 
                    message: 'Please try again. The wallet is checking your connection request.' 
                }
            };
        }
        
        // Return a properly formatted error for all other request types instead of throwing
        return {
            id: payload.id,
            error: { 
                code: -32603, 
                message: error.message || 'Communication with wallet failed' 
            }
        };
    }
}

/**
 * Relay a response back to the inpage script
 */
function relayResponseToInpage(requestId, response) {
    // Check if the response is valid before relaying
    if (!response || (response.result === undefined && response.error === undefined)) {
        handleMessageError(requestId, 'Invalid response format from wallet');
        return;
    }
    
    // Relay the response back to the inpage script
    window.postMessage({
        target: 'inpage',
        responseFor: 'heartwallet',
        payload: response
    }, window.location.origin);
    
    // Remove from pending requests
    pendingRequests.delete(requestId);
}

// Helper function to handle messaging errors
function handleMessageError(requestId, errorMessage) {
    // Don't log sensitive errors to console, which could expose to webpage
    const safeMessage = errorMessage.replace(/address|key|private|secret|password/gi, '[REDACTED]');
    console.error(`ContentScript: Error in message handling: ${safeMessage}`);
    
    // Send an error response back to the inpage script
    window.postMessage({
        target: 'inpage',
        responseFor: 'heartwallet',
        payload: {
            id: requestId,
            error: { 
                code: -32603, 
                message: `Internal communication error: ${errorMessage}` 
            }
        }
    }, window.location.origin);
    
    // Remove from pending requests
    pendingRequests.delete(requestId);
}

// 2. Listen for messages FROM the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        // Check if this is a pending request check from background for connection flow
        if (message?.action === 'check_pending_request') {
            const { requestId, response } = message;
            
            // Check if we have this pending request
            if (pendingRequests.has(requestId)) {
                console.debug('ContentScript: Found pending request, relaying response:', response);
                
                // Relay the response to the inpage script
                relayResponseToInpage(requestId, response);
                
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: 'Request not found' });
            }
            return true; // Indicate we'll send response asynchronously
        }
        
        // Handle connection in progress notifications
        if (message?.action === 'connection_in_progress') {
            const { requestId } = message;
            // Just update the timestamp to prevent timeout
            if (pendingRequests.has(requestId)) {
                const request = pendingRequests.get(requestId);
                request.timestamp = Date.now(); // Reset the timer
                pendingRequests.set(requestId, request);
                console.debug(`ContentScript: Connection request ${requestId} time extended`);
            }
            sendResponse({ success: true });
            return false; // We've sent response synchronously
        }
        
        // Check if the message is intended for the inpage script (events)
        if (message?.target === 'contentscript' && message?.eventFor === 'heartwallet') {
            console.debug('ContentScript: Received event from Background:', message.payload);
            
            // Relay the event to the inpage script
            window.postMessage({
                target: 'inpage',
                eventFor: 'heartwallet',
                payload: message.payload // Should contain { eventName, params }
            }, window.location.origin);
            
            sendResponse({ success: true });
            return false; // We've sent response synchronously
        }
        
        // Handle network change notifications
        if (message?.target === 'contentscript' && message?.action === 'networkChanged') {
            console.debug('ContentScript: Received network change notification:', message);
            
            // Forward to inpage script which will emit the event to the dApp
            window.postMessage({
                target: 'inpage',
                eventFor: 'heartwallet',
                payload: {
                    eventName: 'chainChanged',
                    params: [message.chainId] // Array with hex chainId as per EIP-1193
                }
            }, window.location.origin);
            
            // Also emit the deprecated networkChanged event for compatibility
            window.postMessage({
                target: 'inpage',
                eventFor: 'heartwallet',
                payload: {
                    eventName: 'networkChanged',
                    params: [message.networkVersion] // String network version
                }
            }, window.location.origin);
            
            sendResponse({ success: true });
            return false; // We've sent response synchronously
        }
    } catch (error) {
        console.error('Error in content script message handler:', error);
        sendResponse({ success: false, error: error.message });
    }
    return false; // Default for synchronous responses
});

// Add cleanup for old pending requests with longer timeouts for specific methods
setInterval(() => {
    const now = Date.now();
    pendingRequests.forEach((request, id) => {
        // Use different timeouts based on method
        const isConnectionRequest = request.method === 'eth_requestAccounts';
        const timeout = isConnectionRequest ? 180000 : 30000; // 3 minutes for connections, 30 seconds for others
        
        if (now - request.timestamp > timeout) {
            console.warn(`ContentScript: Request ${id} (${request.method}) timed out after ${Math.round((now - request.timestamp)/1000)}s`);
            
            // Send timeout error to inpage
            window.postMessage({
                target: 'inpage',
                responseFor: 'heartwallet',
                payload: {
                    id: id,
                    error: { 
                        code: -32603, 
                        message: `Request timed out after ${Math.round(timeout/1000)} seconds` 
                    }
                }
            }, window.location.origin);
            
            pendingRequests.delete(id);
        }
    });
}, 10000); // Check every 10 seconds
