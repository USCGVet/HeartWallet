/**
 * Security Utilities for HeartWallet
 * Provides functions for safe HTML handling and XSS prevention
 */

/**
 * Escapes HTML characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    if (typeof text !== 'string') {
        return text;
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Creates a safe DOM element with escaped text content
 * @param {string} tagName - The tag name for the element
 * @param {string} textContent - The text content to set (will be escaped)
 * @param {string} className - Optional CSS class name
 * @returns {HTMLElement} - The created element
 */
function createSafeElement(tagName, textContent = '', className = '') {
    const element = document.createElement(tagName);
    if (textContent) {
        element.textContent = textContent;
    }
    if (className) {
        element.className = className;
    }
    return element;
}

/**
 * Safely sets innerHTML with escaped content
 * @param {HTMLElement} element - The element to update
 * @param {string} htmlContent - The HTML content (should already be escaped)
 */
function setSafeInnerHTML(element, htmlContent) {
    element.innerHTML = htmlContent;
}

/**
 * Creates a safe HTML template with escaped user data
 * @param {string} template - The HTML template with placeholders
 * @param {Object} data - The data to insert (will be escaped)
 * @returns {string} - The safe HTML string
 */
function createSafeTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(placeholder, escapeHtml(value));
    }
    return result;
}

/**
 * Safely clears the content of an element
 * @param {HTMLElement} element - The element to clear
 */
function safeClearContent(element) {
    element.textContent = '';
}

// Export functions for both module and global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        createSafeElement,
        setSafeInnerHTML,
        createSafeTemplate,
        safeClearContent
    };
} else {
    // Make functions available globally
    window.SecurityUtils = {
        escapeHtml,
        createSafeElement,
        setSafeInnerHTML,
        createSafeTemplate,
        safeClearContent
    };
}
