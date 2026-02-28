/**
 * tests/unit/txHistory.test.js
 *
 * Unit tests for transaction history management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTxHistorySettings,
  getTxHistory,
  addTxToHistory,
  updateTxStatus,
  getPendingTxs,
  getPendingTxCount,
  getTxByHash,
  clearTxHistory,
  TX_TYPES,
  TX_STATUS
} from '../../src/core/txHistory.js';

const TEST_ADDRESS = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
const TEST_TX_HASH = '0xabc123def456789012345678901234567890123456789012345678901234abcd';

// Helper to set up chrome storage mock with data
function mockStorage(data = {}) {
  const store = { ...data };
  chrome.storage.local.get.mockImplementation((keys) => {
    if (keys === null) return Promise.resolve({ ...store });
    if (typeof keys === 'string') return Promise.resolve({ [keys]: store[keys] });
    if (Array.isArray(keys)) {
      const result = {};
      keys.forEach(k => { if (store[k] !== undefined) result[k] = store[k]; });
      return Promise.resolve(result);
    }
    return Promise.resolve({});
  });
  chrome.storage.local.set.mockImplementation((items) => {
    Object.assign(store, items);
    return Promise.resolve();
  });
  chrome.storage.local.remove.mockImplementation((keys) => {
    const keysArr = Array.isArray(keys) ? keys : [keys];
    keysArr.forEach(k => delete store[k]);
    return Promise.resolve();
  });
  return store;
}

function makeTx(overrides = {}) {
  return {
    hash: TEST_TX_HASH,
    from: TEST_ADDRESS,
    to: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
    value: '0x1',
    network: 'pulsechain',
    status: TX_STATUS.PENDING,
    type: TX_TYPES.SEND,
    timestamp: Date.now(),
    ...overrides
  };
}

describe('txHistory.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTxHistorySettings', () => {
    it('should return defaults when no settings saved', async () => {
      mockStorage({});
      const settings = await getTxHistorySettings();
      expect(settings.enabled).toBe(true);
      expect(settings.clearOnLock).toBe(false);
    });

    it('should return saved settings', async () => {
      mockStorage({ txHistorySettings: { enabled: false, clearOnLock: true } });
      const settings = await getTxHistorySettings();
      expect(settings.enabled).toBe(false);
      expect(settings.clearOnLock).toBe(true);
    });
  });

  describe('addTxToHistory + getTxHistory', () => {
    it('should add a transaction and retrieve it', async () => {
      const store = mockStorage({});
      const tx = makeTx();

      await addTxToHistory(TEST_ADDRESS, tx);
      const history = await getTxHistory(TEST_ADDRESS);

      expect(history).toHaveLength(1);
      expect(history[0].hash).toBe(TEST_TX_HASH);
      expect(history[0].status).toBe(TX_STATUS.PENDING);
    });

    it('should store newest first', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx({ hash: '0xfirst' }));
      await addTxToHistory(TEST_ADDRESS, makeTx({ hash: '0xsecond' }));

      const history = await getTxHistory(TEST_ADDRESS);
      expect(history[0].hash).toBe('0xsecond');
      expect(history[1].hash).toBe('0xfirst');
    });

    it('should enforce max 20 transactions per address', async () => {
      const store = mockStorage({});
      for (let i = 0; i < 25; i++) {
        await addTxToHistory(TEST_ADDRESS, makeTx({ hash: `0x${i.toString().padStart(64, '0')}` }));
      }
      const history = await getTxHistory(TEST_ADDRESS);
      expect(history.length).toBeLessThanOrEqual(20);
    });

    it('should normalize address to lowercase', async () => {
      const store = mockStorage({});
      await addTxToHistory('0xAABB' + '00'.repeat(18), makeTx());
      // Retrieve with different case
      const history = await getTxHistory('0xaabb' + '00'.repeat(18));
      expect(history).toHaveLength(1);
    });

    it('should not add when history is disabled', async () => {
      mockStorage({ txHistorySettings: { enabled: false, clearOnLock: false } });
      await addTxToHistory(TEST_ADDRESS, makeTx());
      const history = await getTxHistory(TEST_ADDRESS);
      expect(history).toHaveLength(0);
    });

    it('should store EIP-1559 fields when present', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx({
        maxFeePerGas: '0x1234',
        maxPriorityFeePerGas: '0x5678'
      }));
      const history = await getTxHistory(TEST_ADDRESS);
      expect(history[0].maxFeePerGas).toBe('0x1234');
      expect(history[0].maxPriorityFeePerGas).toBe('0x5678');
    });
  });

  describe('updateTxStatus', () => {
    it('should update status of existing transaction', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx());
      await updateTxStatus(TEST_ADDRESS, TEST_TX_HASH, TX_STATUS.CONFIRMED, 12345);

      const history = await getTxHistory(TEST_ADDRESS);
      expect(history[0].status).toBe(TX_STATUS.CONFIRMED);
      expect(history[0].blockNumber).toBe(12345);
    });

    it('should handle case-insensitive hash matching', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx({ hash: '0xABCDEF' }));
      await updateTxStatus(TEST_ADDRESS, '0xabcdef', TX_STATUS.FAILED);

      const history = await getTxHistory(TEST_ADDRESS);
      expect(history[0].status).toBe(TX_STATUS.FAILED);
    });

    it('should silently do nothing for unknown address', async () => {
      mockStorage({});
      // Should not throw
      await updateTxStatus('0x0000000000000000000000000000000000000000', TEST_TX_HASH, TX_STATUS.CONFIRMED);
    });

    it('should silently do nothing for unknown hash', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx());
      await updateTxStatus(TEST_ADDRESS, '0xunknownhash', TX_STATUS.CONFIRMED);
      // Original should be unchanged
      const history = await getTxHistory(TEST_ADDRESS);
      expect(history[0].status).toBe(TX_STATUS.PENDING);
    });
  });

  describe('getPendingTxs / getPendingTxCount', () => {
    it('should return only pending transactions', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx({ hash: '0x01', status: TX_STATUS.PENDING }));
      await addTxToHistory(TEST_ADDRESS, makeTx({ hash: '0x02', status: TX_STATUS.CONFIRMED }));
      await addTxToHistory(TEST_ADDRESS, makeTx({ hash: '0x03', status: TX_STATUS.PENDING }));

      // Need to manually set confirmed status since addTxToHistory always adds as its given status
      await updateTxStatus(TEST_ADDRESS, '0x02', TX_STATUS.CONFIRMED);

      const pending = await getPendingTxs(TEST_ADDRESS);
      expect(pending.length).toBe(2);
      expect(pending.every(tx => tx.status === TX_STATUS.PENDING)).toBe(true);
    });

    it('should return correct pending count', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx({ hash: '0x01' }));
      await addTxToHistory(TEST_ADDRESS, makeTx({ hash: '0x02' }));

      const count = await getPendingTxCount(TEST_ADDRESS);
      expect(count).toBe(2);
    });

    it('should return 0 for address with no transactions', async () => {
      mockStorage({});
      const count = await getPendingTxCount(TEST_ADDRESS);
      expect(count).toBe(0);
    });
  });

  describe('getTxByHash', () => {
    it('should find transaction by hash', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx());

      const tx = await getTxByHash(TEST_ADDRESS, TEST_TX_HASH);
      expect(tx).toBeDefined();
      expect(tx.hash).toBe(TEST_TX_HASH);
    });

    it('should be case-insensitive', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx({ hash: '0xABCD' }));

      const tx = await getTxByHash(TEST_ADDRESS, '0xabcd');
      expect(tx).toBeDefined();
    });

    it('should return undefined for unknown hash', async () => {
      mockStorage({});
      const tx = await getTxByHash(TEST_ADDRESS, '0xnonexistent');
      expect(tx).toBeUndefined();
    });
  });

  describe('clearTxHistory', () => {
    it('should clear history for specific address', async () => {
      const store = mockStorage({});
      await addTxToHistory(TEST_ADDRESS, makeTx());
      await clearTxHistory(TEST_ADDRESS);

      const history = await getTxHistory(TEST_ADDRESS);
      expect(history).toHaveLength(0);
    });

    it('should not throw for address with no history', async () => {
      mockStorage({});
      await clearTxHistory('0x0000000000000000000000000000000000000000');
      // Should not throw
    });
  });

  describe('TX_TYPES and TX_STATUS constants', () => {
    it('should export expected types', () => {
      expect(TX_TYPES.SEND).toBe('send');
      expect(TX_TYPES.CONTRACT).toBe('contract');
      expect(TX_TYPES.TOKEN).toBe('token');
    });

    it('should export expected statuses', () => {
      expect(TX_STATUS.PENDING).toBe('pending');
      expect(TX_STATUS.CONFIRMED).toBe('confirmed');
      expect(TX_STATUS.FAILED).toBe('failed');
    });
  });
});
