// Global utility functions for the enhanced UI
window.setMaxAmount = function() {
    const balanceElement = document.getElementById('wallet-balance');
    const amountInput = document.getElementById('send-amount');
    
    if (balanceElement && amountInput) {
        const currentBalance = parseFloat(balanceElement.textContent) || 0;
        // Leave a small amount for gas fees (0.001 PLS)
        const maxAmount = Math.max(0, currentBalance - 0.001);
        amountInput.value = maxAmount.toFixed(6);
    }
};

// Format large numbers with appropriate suffixes
window.formatNumber = function(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
};

// Enhanced copy functionality
window.copyToClipboard = async function(text, feedbackElement) {
    try {
        await navigator.clipboard.writeText(text);
        if (feedbackElement) {
            const original = feedbackElement.textContent;
            feedbackElement.textContent = 'Copied!';
            feedbackElement.className += ' copy-feedback-success';
            setTimeout(() => {
                feedbackElement.textContent = original;
                feedbackElement.className = feedbackElement.className.replace(' copy-feedback-success', '');
            }, 1500);
        }
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

// Enhanced QR code functionality (placeholder for future implementation)
window.generateQRCode = function(address) {
    // This would integrate with a QR code library in the future
    console.log('QR code generation for:', address);
    // For now, just copy the address
    return copyToClipboard(address);
};
