// Custom password prompt modal that shows password as dots/asterisks
class PasswordPromptModal {
    static async prompt(message = 'Please enter your password:', title = 'Password Required') {
        return new Promise((resolve) => {
            // Create modal overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay password-prompt-overlay';
            
            // Create modal content
            const modal = document.createElement('div');
            modal.className = 'password-prompt-modal';
            
            const modalHTML = `
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    <div class="password-input-container">
                        <input type="password" id="passwordPromptInput" class="password-prompt-input" placeholder="Enter password" autofocus autocomplete="off">
                        <button type="button" class="toggle-password-visibility" id="togglePasswordBtn">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="passwordPromptCancel">Cancel</button>
                    <button class="btn btn-primary" id="passwordPromptConfirm">Confirm</button>
                </div>
            `;
            
            modal.innerHTML = modalHTML;
            modalOverlay.appendChild(modal);
            document.body.appendChild(modalOverlay);
            
            // Get elements
            const input = document.getElementById('passwordPromptInput');
            const confirmBtn = document.getElementById('passwordPromptConfirm');
            const cancelBtn = document.getElementById('passwordPromptCancel');
            const toggleBtn = document.getElementById('togglePasswordBtn');
            
            // Focus input
            setTimeout(() => input.focus(), 100);
            
            // Toggle password visibility
            let isPasswordVisible = false;
            toggleBtn.addEventListener('click', () => {
                isPasswordVisible = !isPasswordVisible;
                input.type = isPasswordVisible ? 'text' : 'password';
                toggleBtn.innerHTML = isPasswordVisible ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
            });
            
            // Handle confirm
            const handleConfirm = () => {
                const password = input.value;
                document.body.removeChild(modalOverlay);
                resolve(password || null);
            };
            
            // Handle cancel
            const handleCancel = () => {
                document.body.removeChild(modalOverlay);
                resolve(null);
            };
            
            // Event listeners
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            
            // Enter key to confirm
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });
            
            // Escape key to cancel
            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', escapeHandler);
                    handleCancel();
                }
            });
            
            // Click overlay to cancel
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    handleCancel();
                }
            });
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordPromptModal;
}