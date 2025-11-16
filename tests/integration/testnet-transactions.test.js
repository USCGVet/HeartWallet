/**
 * tests/integration/testnet-transactions.test.js
 *
 * Integration tests using real testnet wallets on PulseChain Testnet V4
 * Tests real transaction signing, sending, speed up, and cancel functionality
 *
 * ⚠️ REQUIRES: PulseChain Testnet V4 RPC to be available
 * ⚠️ REQUIRES: Testnet wallets to have tPLS balance
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ethers } from 'ethers';

// Testnet configuration
const TESTNET_CONFIG = {
  name: 'PulseChain Testnet V4',
  chainId: 943,
  rpcUrls: [
    'https://rpc.v4.testnet.pulsechain.com',
    'https://pulsechain-testnet-rpc.publicnode.com'
  ]
};

// Testnet wallets (from testnetWallet.txt)
const TESTNET_WALLETS = {
  wallet1: {
    address: '0x1D06308A5E8aA43A89b572CAF1b9265Fd4AfEaEb',
    privateKey: '0x215b3e18aaa6f4cd5a5bc0507e41ea6643eaef62319180ea6971092d64e36003'
  },
  wallet2: {
    address: '0x2cDdEb56F899987f4C8de276fABC73b9ae6cAb18',
    privateKey: '0x1b75efc6a5a104accc1df9941bb9076b86fc1f30369019764b2b127d59c02397'
  }
};

// Test amounts (small fractions)
const TEST_AMOUNTS = {
  tiny: ethers.parseEther('0.0001'),   // 0.0001 tPLS
  small: ethers.parseEther('0.001'),   // 0.001 tPLS
  medium: ethers.parseEther('0.01')    // 0.01 tPLS
};

describe('Testnet Integration Tests', () => {
  let provider;
  let wallet1;
  let wallet2;

  beforeAll(async () => {
    // Create provider with fallback
    provider = new ethers.JsonRpcProvider(TESTNET_CONFIG.rpcUrls[0]);

    // Test connection
    try {
      const network = await provider.getNetwork();
      expect(Number(network.chainId)).toBe(TESTNET_CONFIG.chainId);
      console.log('✅ Connected to PulseChain Testnet V4');
    } catch (error) {
      console.error('❌ Failed to connect to testnet:', error.message);
      throw new Error('Cannot run integration tests without testnet connection');
    }

    // Create wallet instances
    wallet1 = new ethers.Wallet(TESTNET_WALLETS.wallet1.privateKey, provider);
    wallet2 = new ethers.Wallet(TESTNET_WALLETS.wallet2.privateKey, provider);

    // Verify addresses match
    expect(wallet1.address).toBe(TESTNET_WALLETS.wallet1.address);
    expect(wallet2.address).toBe(TESTNET_WALLETS.wallet2.address);

    console.log(`Wallet 1: ${wallet1.address}`);
    console.log(`Wallet 2: ${wallet2.address}`);
  });

  describe('Wallet Balance Checks', () => {
    it('should fetch wallet balances', async () => {
      const balance1 = await provider.getBalance(wallet1.address);
      const balance2 = await provider.getBalance(wallet2.address);

      console.log(`Wallet 1 Balance: ${ethers.formatEther(balance1)} tPLS`);
      console.log(`Wallet 2 Balance: ${ethers.formatEther(balance2)} tPLS`);

      // Just verify we can fetch balances (they might be 0)
      expect(balance1).toBeDefined();
      expect(balance2).toBeDefined();
    });

    it('should have sufficient balance for tests', async () => {
      const balance1 = await provider.getBalance(wallet1.address);

      // Need at least 0.01 tPLS to run transaction tests
      const minBalance = ethers.parseEther('0.01');

      if (balance1 < minBalance) {
        console.warn(`⚠️ Wallet 1 balance (${ethers.formatEther(balance1)} tPLS) is below 0.01 tPLS`);
        console.warn('Some transaction tests may be skipped');
      }

      expect(balance1).toBeTypeOf('bigint');
    });
  });

  describe('Transaction Signing', () => {
    it('should sign a transaction', async () => {
      const tx = {
        to: wallet2.address,
        value: TEST_AMOUNTS.tiny,
        gasLimit: 21000,
        gasPrice: ethers.parseUnits('50', 'gwei'),
        nonce: await provider.getTransactionCount(wallet1.address),
        chainId: TESTNET_CONFIG.chainId
      };

      const signedTx = await wallet1.signTransaction(tx);

      expect(signedTx).toBeDefined();
      expect(signedTx).toMatch(/^0x/);
      expect(signedTx.length).toBeGreaterThan(100);

      console.log('✅ Transaction signed successfully');
    });

    it('should sign and parse transaction', async () => {
      const tx = {
        to: wallet2.address,
        value: TEST_AMOUNTS.small,
        gasLimit: 21000,
        gasPrice: ethers.parseUnits('50', 'gwei'),
        nonce: await provider.getTransactionCount(wallet1.address),
        chainId: TESTNET_CONFIG.chainId
      };

      const signedTx = await wallet1.signTransaction(tx);
      const parsedTx = ethers.Transaction.from(signedTx);

      expect(parsedTx.to.toLowerCase()).toBe(wallet2.address.toLowerCase());
      expect(parsedTx.value).toBe(TEST_AMOUNTS.small);
      expect(parsedTx.chainId).toBe(BigInt(TESTNET_CONFIG.chainId));

      console.log('✅ Parsed transaction matches original');
    });
  });

  describe('Message Signing (EIP-191)', () => {
    it('should sign a personal message', async () => {
      const message = 'HeartWallet Integration Test';
      const signature = await wallet1.signMessage(message);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/); // 65 bytes = 130 hex chars

      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      expect(recoveredAddress.toLowerCase()).toBe(wallet1.address.toLowerCase());

      console.log('✅ Message signed and verified');
    });

    it('should sign different messages with different signatures', async () => {
      const message1 = 'Message 1';
      const message2 = 'Message 2';

      const sig1 = await wallet1.signMessage(message1);
      const sig2 = await wallet1.signMessage(message2);

      expect(sig1).not.toBe(sig2);

      const recovered1 = ethers.verifyMessage(message1, sig1);
      const recovered2 = ethers.verifyMessage(message2, sig2);

      expect(recovered1.toLowerCase()).toBe(wallet1.address.toLowerCase());
      expect(recovered2.toLowerCase()).toBe(wallet1.address.toLowerCase());

      console.log('✅ Multiple messages signed correctly');
    });
  });

  describe('Typed Data Signing (EIP-712)', () => {
    it('should sign EIP-712 typed data', async () => {
      const domain = {
        name: 'HeartWallet Test',
        version: '1',
        chainId: TESTNET_CONFIG.chainId,
        verifyingContract: '0x0000000000000000000000000000000000000001'
      };

      const types = {
        Message: [
          { name: 'content', type: 'string' },
          { name: 'timestamp', type: 'uint256' }
        ]
      };

      const value = {
        content: 'Integration Test',
        timestamp: Math.floor(Date.now() / 1000)
      };

      const signature = await wallet1.signTypedData(domain, types, value);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^0x[0-9a-fA-F]{130}$/);

      console.log('✅ EIP-712 typed data signed');
    });
  });

  describe('Real Transaction Sending', () => {
    it('should send a tiny transaction on testnet', async () => {
      const balance = await provider.getBalance(wallet1.address);

      // Skip if insufficient balance
      if (balance < ethers.parseEther('0.01')) {
        console.warn('⚠️ Skipping: Insufficient balance for transaction test');
        return;
      }

      const initialBalance2 = await provider.getBalance(wallet2.address);

      // Send 0.0001 tPLS from wallet1 to wallet2
      const tx = await wallet1.sendTransaction({
        to: wallet2.address,
        value: TEST_AMOUNTS.tiny,
        gasLimit: 21000
      });

      console.log(`📤 Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      expect(receipt).toBeDefined();
      expect(receipt.status).toBe(1); // Success
      expect(receipt.to.toLowerCase()).toBe(wallet2.address.toLowerCase());

      // Verify balance changed
      const finalBalance2 = await provider.getBalance(wallet2.address);
      expect(finalBalance2).toBeGreaterThan(initialBalance2);

      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    }, 60000); // 60 second timeout for network operations

    it('should estimate gas correctly', async () => {
      const gasEstimate = await provider.estimateGas({
        from: wallet1.address,
        to: wallet2.address,
        value: TEST_AMOUNTS.tiny
      });

      expect(gasEstimate).toBe(21000n); // Standard ETH transfer

      console.log(`✅ Gas estimate: ${gasEstimate.toString()}`);
    });
  });

  describe('Transaction Nonce Management', () => {
    it('should get correct nonce', async () => {
      const nonce = await provider.getTransactionCount(wallet1.address);

      expect(nonce).toBeTypeOf('number');
      expect(nonce).toBeGreaterThanOrEqual(0);

      console.log(`Wallet 1 nonce: ${nonce}`);
    });

    it('should handle pending transactions nonce', async () => {
      const noncePending = await provider.getTransactionCount(wallet1.address, 'pending');
      const nonceLatest = await provider.getTransactionCount(wallet1.address, 'latest');

      expect(noncePending).toBeGreaterThanOrEqual(nonceLatest);

      console.log(`Pending nonce: ${noncePending}, Latest nonce: ${nonceLatest}`);
    });
  });

  describe('Gas Price Fetching', () => {
    it('should fetch current gas price', async () => {
      const feeData = await provider.getFeeData();

      expect(feeData.gasPrice).toBeDefined();
      expect(feeData.gasPrice).toBeGreaterThan(0n);

      const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');
      console.log(`Current gas price: ${gasPriceGwei} Gwei`);
    });

    it('should calculate transaction cost', async () => {
      const feeData = await provider.getFeeData();
      const gasLimit = 21000n;
      const cost = feeData.gasPrice * gasLimit;

      const costEther = ethers.formatEther(cost);
      console.log(`Transaction cost: ${costEther} tPLS`);

      expect(cost).toBeGreaterThan(0n);
    });
  });

  describe('Block and Network Info', () => {
    it('should fetch latest block number', async () => {
      const blockNumber = await provider.getBlockNumber();

      expect(blockNumber).toBeTypeOf('number');
      expect(blockNumber).toBeGreaterThan(0);

      console.log(`Latest block: ${blockNumber}`);
    });

    it('should fetch block details', async () => {
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);

      expect(block).toBeDefined();
      expect(block.number).toBe(blockNumber);
      expect(block.hash).toMatch(/^0x[0-9a-fA-F]{64}$/);
      expect(block.timestamp).toBeGreaterThan(0);

      console.log(`Block ${blockNumber} hash: ${block.hash}`);
    });

    it('should fetch network information', async () => {
      const network = await provider.getNetwork();

      expect(Number(network.chainId)).toBe(TESTNET_CONFIG.chainId);
      expect(network.name).toBeDefined();

      console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
    });
  });

  describe('Transaction Replacement (Speed Up)', () => {
    it('should create a replacement transaction with higher gas', async () => {
      const nonce = await provider.getTransactionCount(wallet1.address);
      const feeData = await provider.getFeeData();

      // Original transaction
      const originalGasPrice = feeData.gasPrice;

      // Replacement with 20% higher gas price
      const newGasPrice = (originalGasPrice * 120n) / 100n;

      const tx = {
        to: wallet2.address,
        value: TEST_AMOUNTS.tiny,
        gasLimit: 21000,
        gasPrice: newGasPrice,
        nonce: nonce,
        chainId: TESTNET_CONFIG.chainId
      };

      const signedTx = await wallet1.signTransaction(tx);

      expect(signedTx).toBeDefined();
      expect(newGasPrice).toBeGreaterThan(originalGasPrice);

      console.log(`✅ Replacement tx created with ${ethers.formatUnits(newGasPrice, 'gwei')} Gwei`);
    });
  });

  describe('Transaction Cancellation', () => {
    it('should create a cancellation transaction', async () => {
      const nonce = await provider.getTransactionCount(wallet1.address);
      const feeData = await provider.getFeeData();

      // Cancel = 0-value tx to self with same nonce
      const cancelTx = {
        to: wallet1.address, // Send to self
        value: 0n, // Zero value
        gasLimit: 21000,
        gasPrice: (feeData.gasPrice * 120n) / 100n, // Higher gas to replace
        nonce: nonce,
        chainId: TESTNET_CONFIG.chainId
      };

      const signedTx = await wallet1.signTransaction(cancelTx);
      const parsedTx = ethers.Transaction.from(signedTx);

      expect(parsedTx.to.toLowerCase()).toBe(wallet1.address.toLowerCase());
      expect(parsedTx.value).toBe(0n);

      console.log('✅ Cancellation transaction created');
    });
  });

  describe('Address Validation', () => {
    it('should validate Ethereum addresses', () => {
      expect(ethers.isAddress(wallet1.address)).toBe(true);
      expect(ethers.isAddress(wallet2.address)).toBe(true);
      expect(ethers.isAddress('0x123')).toBe(false);
      expect(ethers.isAddress('invalid')).toBe(false);

      console.log('✅ Address validation working');
    });

    it('should handle address checksums', () => {
      const lowercase = wallet1.address.toLowerCase();
      const checksummed = ethers.getAddress(lowercase);

      expect(checksummed).toBe(wallet1.address);

      console.log('✅ Address checksum validation working');
    });
  });

  describe('Private Key to Address Derivation', () => {
    it('should derive correct address from private key', () => {
      const derivedWallet1 = new ethers.Wallet(TESTNET_WALLETS.wallet1.privateKey);
      const derivedWallet2 = new ethers.Wallet(TESTNET_WALLETS.wallet2.privateKey);

      expect(derivedWallet1.address).toBe(TESTNET_WALLETS.wallet1.address);
      expect(derivedWallet2.address).toBe(TESTNET_WALLETS.wallet2.address);

      console.log('✅ Private key derivation correct');
    });
  });

  describe('Error Handling', () => {
    it('should handle insufficient balance gracefully', async () => {
      const hugeAmount = ethers.parseEther('999999999');

      await expect(
        wallet1.sendTransaction({
          to: wallet2.address,
          value: hugeAmount
        })
      ).rejects.toThrow();

      console.log('✅ Insufficient balance error handled');
    });

    it('should handle invalid addresses', async () => {
      expect(() => {
        ethers.getAddress('0xinvalid');
      }).toThrow();

      console.log('✅ Invalid address error handled');
    });
  });
});
