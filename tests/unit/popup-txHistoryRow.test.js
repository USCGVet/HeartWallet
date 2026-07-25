/**
 * tests/unit/popup-txHistoryRow.test.js
 *
 * Unit tests for transaction history rows.
 *
 * These values come from the wallet's own history store and RPC responses, so this row
 * is lower-risk than the token or calldata renderers. The tests focus on display
 * correctness and on not crashing the whole list when one stored entry is malformed -
 * plus the data-* attributes the delegated click handler depends on.
 */

import { describe, it, expect } from 'vitest';
import { parseUnits, parseEther } from 'ethers';
import { txHistoryRow, txHistoryMessage } from '../../src/popup/render/txHistoryRow.js';

const BASE_TX = {
  hash: '0x' + 'ab'.repeat(32),
  status: 'confirmed',
  timestamp: 1700000000000,
  value: parseEther('1.5').toString(),
  gasPrice: parseUnits('25', 9).toString(),
  nonce: 7,
  network: 'ethereum'
};

describe('popup/render/txHistoryRow.js', () => {
  describe('display', () => {
    it('should show status, value with network symbol, gas and nonce', () => {
      const text = txHistoryRow(BASE_TX).textContent;
      expect(text).toContain('CONFIRMED');
      expect(text).toContain('Value: 1.5 ETH');
      expect(text).toContain('Gas: 25.0 Gwei');
      expect(text).toContain('Nonce: 7');
    });

    it('should truncate the hash to 20 characters', () => {
      expect(txHistoryRow(BASE_TX).textContent)
        .toContain(`Hash: ${BASE_TX.hash.slice(0, 20)}...`);
    });

    it('should use the network symbol for the network', () => {
      expect(txHistoryRow({ ...BASE_TX, network: 'pulsechain' }).textContent)
        .toContain('PLS');
      expect(txHistoryRow({ ...BASE_TX, network: 'pulsechainTestnet' }).textContent)
        .toContain('tPLS');
    });

    it('should pick the icon and colour per status', () => {
      const confirmed = txHistoryRow({ ...BASE_TX, status: 'confirmed' });
      const pending = txHistoryRow({ ...BASE_TX, status: 'pending' });
      const failed = txHistoryRow({ ...BASE_TX, status: 'failed' });

      expect(confirmed.textContent).toContain('✅');
      expect(pending.textContent).toContain('⏳');
      expect(failed.textContent).toContain('❌');

      expect(confirmed.getAttribute('style')).toContain('#44ff44');
      expect(pending.getAttribute('style')).toContain('--terminal-warning');
      expect(failed.getAttribute('style')).toContain('#ff4444');
    });

    it('should treat an unknown status as failed', () => {
      const row = txHistoryRow({ ...BASE_TX, status: 'weird' });
      expect(row.textContent).toContain('❌');
      expect(row.textContent).toContain('WEIRD');
    });
  });

  describe('refresh button', () => {
    it('should appear only for pending transactions', () => {
      expect(txHistoryRow({ ...BASE_TX, status: 'pending' })
        .querySelector('[data-refresh-tx]')).not.toBeNull();
      expect(txHistoryRow({ ...BASE_TX, status: 'confirmed' })
        .querySelector('[data-refresh-tx]')).toBeNull();
    });

    it('should carry the tx hash for the delegated handler', () => {
      const btn = txHistoryRow({ ...BASE_TX, status: 'pending' })
        .querySelector('[data-refresh-tx]');
      expect(btn.dataset.refreshTx).toBe(BASE_TX.hash);
    });
  });

  describe('delegation attributes', () => {
    it('should set data-tx-hash on the row', () => {
      // setupTransactionHistoryEventDelegation() relies on this via closest()
      expect(txHistoryRow(BASE_TX).dataset.txHash).toBe(BASE_TX.hash);
    });
  });

  describe('robustness', () => {
    it('should not throw on a malformed value', () => {
      const row = txHistoryRow({ ...BASE_TX, value: 'not-a-number' });
      expect(row.textContent).toContain('Value: 0.0');
    });

    it('should not throw on a malformed gas price', () => {
      const row = txHistoryRow({ ...BASE_TX, gasPrice: 'garbage' });
      expect(row.textContent).toContain('Gas: 0 Gwei');
    });

    it('should not throw on a missing hash', () => {
      expect(() => txHistoryRow({ ...BASE_TX, hash: undefined })).not.toThrow();
    });

    it('should not throw on a missing status', () => {
      expect(() => txHistoryRow({ ...BASE_TX, status: undefined })).not.toThrow();
    });

    it('should render a hostile hash as an inert attribute value', () => {
      const row = txHistoryRow({ ...BASE_TX, hash: '"><b>x</b>' });
      expect(row.querySelector('b')).toBeNull();
      expect(row.dataset.txHash).toBe('"><b>x</b>');
    });
  });

  describe('txHistoryMessage', () => {
    it('should render the message as centered dim text', () => {
      const el = txHistoryMessage('No transactions yet');
      expect(el.textContent).toBe('No transactions yet');
      expect(el.className).toBe('text-center text-dim');
    });
  });
});
