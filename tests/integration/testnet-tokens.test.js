/**
 * tests/integration/testnet-tokens.test.js
 *
 * Integration tests for ERC-20 token operations on PulseChain Testnet V4
 * Tests token balance fetching, transfers, and approvals
 *
 * ⚠️ REQUIRES: Test Heart Token contract deployed on testnet
 * ⚠️ REQUIRES: Wallets to have test token balance
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ethers } from 'ethers';

// ERC-20 ABI (minimal for testing)
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// Testnet configuration
const TESTNET_CONFIG = {
  chainId: 943,
  rpcUrl: 'https://rpc.v4.testnet.pulsechain.com'
};

// Testnet wallets
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

// You'll need to add your test Heart Token contract address here
// Leave empty to skip token tests if not available
const TEST_TOKEN_ADDRESS = ''; // TODO: Add test Heart Token address

describe('Testnet Token Integration Tests', () => {
  let provider;
  let wallet1;
  let wallet2;
  let tokenContract;
  let hasTokenContract = false;

  beforeAll(async () => {
    provider = new ethers.JsonRpcProvider(TESTNET_CONFIG.rpcUrl);

    // Create wallet instances
    wallet1 = new ethers.Wallet(TESTNET_WALLETS.wallet1.privateKey, provider);
    wallet2 = new ethers.Wallet(TESTNET_WALLETS.wallet2.privateKey, provider);

    // Check if token contract address is configured
    if (TEST_TOKEN_ADDRESS && TEST_TOKEN_ADDRESS !== '') {
      hasTokenContract = true;
      tokenContract = new ethers.Contract(TEST_TOKEN_ADDRESS, ERC20_ABI, wallet1);
      console.log(`Token contract: ${TEST_TOKEN_ADDRESS}`);
    } else {
      console.warn('⚠️ No test token address configured - token tests will be skipped');
      console.warn('To enable token tests, set TEST_TOKEN_ADDRESS in testnet-tokens.test.js');
    }
  });

  describe('Token Contract Info', () => {
    it('should fetch token name', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const name = await tokenContract.name();
      expect(name).toBeDefined();
      expect(name.length).toBeGreaterThan(0);

      console.log(`Token name: ${name}`);
    });

    it('should fetch token symbol', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const symbol = await tokenContract.symbol();
      expect(symbol).toBeDefined();
      expect(symbol.length).toBeGreaterThan(0);

      console.log(`Token symbol: ${symbol}`);
    });

    it('should fetch token decimals', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const decimals = await tokenContract.decimals();
      expect(decimals).toBeTypeOf('bigint');
      expect(Number(decimals)).toBeGreaterThanOrEqual(0);
      expect(Number(decimals)).toBeLessThanOrEqual(18);

      console.log(`Token decimals: ${decimals}`);
    });

    it('should fetch total supply', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const totalSupply = await tokenContract.totalSupply();
      expect(totalSupply).toBeTypeOf('bigint');
      expect(totalSupply).toBeGreaterThan(0n);

      const decimals = await tokenContract.decimals();
      const formattedSupply = ethers.formatUnits(totalSupply, decimals);

      console.log(`Total supply: ${formattedSupply}`);
    });
  });

  describe('Token Balance Queries', () => {
    it('should fetch token balance for wallet 1', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const balance = await tokenContract.balanceOf(wallet1.address);
      expect(balance).toBeTypeOf('bigint');

      const decimals = await tokenContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);

      console.log(`Wallet 1 token balance: ${formattedBalance}`);
    });

    it('should fetch token balance for wallet 2', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const balance = await tokenContract.balanceOf(wallet2.address);
      expect(balance).toBeTypeOf('bigint');

      const decimals = await tokenContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);

      console.log(`Wallet 2 token balance: ${formattedBalance}`);
    });
  });

  describe('Token Transfer Encoding', () => {
    it('should encode transfer transaction data', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits('0.001', decimals); // 0.001 tokens

      // Encode transfer function call
      const data = tokenContract.interface.encodeFunctionData('transfer', [
        wallet2.address,
        amount
      ]);

      expect(data).toBeDefined();
      expect(data).toMatch(/^0xa9059cbb/); // transfer function selector
      expect(data.length).toBe(138); // 4 bytes selector + 32 bytes address + 32 bytes amount

      console.log('✅ Transfer data encoded correctly');
    });

    it('should decode transfer transaction data', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits('0.001', decimals);

      // Encode
      const data = tokenContract.interface.encodeFunctionData('transfer', [
        wallet2.address,
        amount
      ]);

      // Decode
      const decoded = tokenContract.interface.decodeFunctionData('transfer', data);

      expect(decoded[0].toLowerCase()).toBe(wallet2.address.toLowerCase());
      expect(decoded[1]).toBe(amount);

      console.log('✅ Transfer data decoded correctly');
    });
  });

  describe('Token Approval Encoding', () => {
    it('should encode approve transaction data', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits('1', decimals);

      const data = tokenContract.interface.encodeFunctionData('approve', [
        wallet2.address,
        amount
      ]);

      expect(data).toBeDefined();
      expect(data).toMatch(/^0x095ea7b3/); // approve function selector

      console.log('✅ Approve data encoded correctly');
    });

    it('should query allowance', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const allowance = await tokenContract.allowance(wallet1.address, wallet2.address);
      expect(allowance).toBeTypeOf('bigint');

      const decimals = await tokenContract.decimals();
      const formattedAllowance = ethers.formatUnits(allowance, decimals);

      console.log(`Current allowance: ${formattedAllowance}`);
    });
  });

  describe('Token Transfer Simulation', () => {
    it('should estimate gas for token transfer', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const balance = await tokenContract.balanceOf(wallet1.address);

      if (balance === 0n) {
        console.warn('⚠️ Wallet 1 has no tokens - skipping gas estimation');
        return;
      }

      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits('0.001', decimals);

      if (amount > balance) {
        console.warn('⚠️ Insufficient token balance - skipping gas estimation');
        return;
      }

      const gasEstimate = await tokenContract.transfer.estimateGas(wallet2.address, amount);

      expect(gasEstimate).toBeTypeOf('bigint');
      expect(gasEstimate).toBeGreaterThan(21000n); // More than simple ETH transfer

      console.log(`Gas estimate for token transfer: ${gasEstimate.toString()}`);
    });
  });

  describe('Real Token Transfer', () => {
    it('should transfer tiny amount of tokens', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const balance = await tokenContract.balanceOf(wallet1.address);

      if (balance === 0n) {
        console.warn('⚠️ Wallet 1 has no tokens - skipping transfer test');
        return;
      }

      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits('0.001', decimals); // 0.001 tokens

      if (amount > balance) {
        console.warn('⚠️ Insufficient token balance - skipping transfer test');
        return;
      }

      // Get initial balances
      const initialBalance1 = await tokenContract.balanceOf(wallet1.address);
      const initialBalance2 = await tokenContract.balanceOf(wallet2.address);

      console.log(`Initial balance 1: ${ethers.formatUnits(initialBalance1, decimals)}`);
      console.log(`Initial balance 2: ${ethers.formatUnits(initialBalance2, decimals)}`);

      // Execute transfer
      const tx = await tokenContract.transfer(wallet2.address, amount);
      console.log(`📤 Token transfer sent: ${tx.hash}`);

      const receipt = await tx.wait();

      expect(receipt.status).toBe(1);
      console.log(`✅ Token transfer confirmed in block ${receipt.blockNumber}`);

      // Verify balances changed
      const finalBalance1 = await tokenContract.balanceOf(wallet1.address);
      const finalBalance2 = await tokenContract.balanceOf(wallet2.address);

      expect(finalBalance1).toBe(initialBalance1 - amount);
      expect(finalBalance2).toBe(initialBalance2 + amount);

      console.log(`Final balance 1: ${ethers.formatUnits(finalBalance1, decimals)}`);
      console.log(`Final balance 2: ${ethers.formatUnits(finalBalance2, decimals)}`);
    }, 60000); // 60 second timeout
  });

  describe('Event Parsing', () => {
    it('should parse Transfer events', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      // Get recent Transfer events
      const filter = tokenContract.filters.Transfer(wallet1.address);
      const events = await tokenContract.queryFilter(filter, -1000); // Last 1000 blocks

      console.log(`Found ${events.length} Transfer events from wallet 1`);

      if (events.length > 0) {
        const event = events[0];
        expect(event.args.from.toLowerCase()).toBe(wallet1.address.toLowerCase());
        expect(event.args.value).toBeTypeOf('bigint');

        console.log(`Latest transfer: ${event.args.value.toString()} to ${event.args.to}`);
      }
    });
  });

  describe('Token Contract Code Validation', () => {
    it('should verify contract has code', async () => {
      if (!hasTokenContract) {
        console.log('⏭️  Skipped: No token contract configured');
        return;
      }

      const code = await provider.getCode(TEST_TOKEN_ADDRESS);

      expect(code).not.toBe('0x'); // Has code
      expect(code.length).toBeGreaterThan(10);

      console.log(`Contract code length: ${code.length} characters`);
    });

    it('should detect non-contract addresses', async () => {
      // EOA should have no code
      const code = await provider.getCode(wallet1.address);

      expect(code).toBe('0x');

      console.log('✅ EOA correctly has no code');
    });
  });
});
