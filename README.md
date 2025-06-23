# HeartWallet - Chrome Extension for PulseChain

A secure, user-friendly Chrome extension wallet for PulseChain and PRC-20 tokens.

## Features

- 🔐 **Secure Wallet Management**: Create and import wallets using seed phrases or private keys
- 💰 **PulseChain Native**: Built specifically for PulseChain (PLS) transactions
- 🪙 **PRC-20 Token Support**: Manage and send PRC-20 tokens
- 🌐 **Web3 Integration**: Connect to dApps with MetaMask-like functionality
- 🔄 **Multi-Wallet Support**: Manage multiple wallets in one extension
- 🔒 **Session Management**: Configurable auto-logout for security
- 📊 **Transaction History**: Track your transaction history
- 🎨 **Clean UI**: Intuitive and responsive user interface

## Installation

### From Source
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the project directory

### From Chrome Web Store
(Coming soon)

## Security Features

- Private keys are encrypted using ethers.js encryption
- Session-based authentication with configurable timeout
- Secure password requirements (uppercase, lowercase, numbers, 8+ chars)
- Chrome storage API for secure data storage
- Transaction confirmation popups with human-readable details

## Development

### Prerequisites
- Chrome browser
- Basic knowledge of Chrome extension development
- Node.js (for future build processes)

### Project Structure
```
heartwallet/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for background tasks
├── app.js                # Main application logic
├── index.html            # Popup UI
├── wallet-core.js        # Wallet management
├── network-core.js       # Network interactions
├── token-core.js         # Token management
├── transaction-core.js   # Transaction handling
└── styles.css           # UI styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Your chosen license]

## Support

For support, please open an issue on GitHub.

## Disclaimer

This wallet is provided as-is. Always ensure you have backups of your seed phrases and private keys. Never share your private keys or seed phrases with anyone.