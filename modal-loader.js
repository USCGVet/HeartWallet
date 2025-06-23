// Load send token modal HTML
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(chrome.runtime.getURL('send-token-modal.html'));
        const html = await response.text();
        const container = document.getElementById('send-token-modal-container');
        if (container) {
            container.innerHTML = html;
            console.log('Send token modal loaded successfully');
            
            // Verify modal is in DOM
            const modal = document.getElementById('send-token-modal');
            if (modal) {
                console.log('Send token modal found in DOM:', modal);
                console.log('Modal children:', modal.children.length);
            } else {
                console.error('Send token modal not found after loading');
            }
        } else {
            console.error('Send token modal container not found');
        }
    } catch (error) {
        console.error('Failed to load send token modal:', error);
    }
});