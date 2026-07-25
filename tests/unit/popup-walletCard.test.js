/**
 * tests/unit/popup-walletCard.test.js
 *
 * Unit tests for the manage-wallets card renderer.
 *
 * A nickname is user-supplied, so injection here is self-inflicted rather than remote.
 * It still matters: the nickname is what a user reads to confirm which wallet they are
 * about to export or delete, so it must render as exactly the typed text.
 */

import { describe, it, expect, vi } from 'vitest';
import { walletCard } from '../../src/popup/render/walletCard.js';

const SOFTWARE_WALLET = {
  id: 'w1',
  nickname: 'Daily Driver',
  address: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
  importMethod: 'create',
  createdAt: 1700000000000,
  isHardwareWallet: false
};

const LEDGER_WALLET = {
  ...SOFTWARE_WALLET,
  id: 'w2',
  nickname: 'Cold Storage',
  isHardwareWallet: true,
  hardwareType: 'ledger'
};

function buttonLabels(card) {
  return [...card.querySelectorAll('button')].map(b => b.textContent);
}

describe('popup/render/walletCard.js', () => {
  describe('content', () => {
    it('should show nickname and address', () => {
      const card = walletCard(SOFTWARE_WALLET, { isActive: false });
      expect(card.textContent).toContain('Daily Driver');
      expect(card.textContent).toContain(SOFTWARE_WALLET.address);
    });

    it('should fall back to placeholders when fields are missing', () => {
      const card = walletCard({ ...SOFTWARE_WALLET, nickname: '', address: '' }, {});
      expect(card.textContent).toContain('Unnamed Wallet');
      expect(card.textContent).toContain('Address not loaded');
    });

    it('should mark the active wallet', () => {
      const card = walletCard(SOFTWARE_WALLET, { isActive: true });
      expect(card.textContent).toContain('✓');
      expect(card.textContent).toContain('[ACTIVE]');
      expect(card.style.borderColor).toBeTruthy();
    });

    it('should not mark an inactive wallet', () => {
      const card = walletCard(SOFTWARE_WALLET, { isActive: false });
      expect(card.textContent).not.toContain('[ACTIVE]');
    });

    it('should describe a created software wallet', () => {
      expect(walletCard(SOFTWARE_WALLET, {}).textContent).toContain('Created');
    });

    it('should describe an imported software wallet', () => {
      const card = walletCard({ ...SOFTWARE_WALLET, importMethod: 'import' }, {});
      expect(card.textContent).toContain('Imported');
    });

    it('should describe a hardware wallet with its type uppercased', () => {
      expect(walletCard(LEDGER_WALLET, {}).textContent).toContain('LEDGER Hardware Wallet');
    });

    it('should tolerate a hardware wallet with no type', () => {
      const card = walletCard({ ...LEDGER_WALLET, hardwareType: undefined }, {});
      expect(card.textContent).toContain('Hardware Wallet');
    });
  });

  describe('action buttons', () => {
    it('should show SWITCH only when inactive', () => {
      expect(buttonLabels(walletCard(SOFTWARE_WALLET, { isActive: false }))).toContain('SWITCH');
      expect(buttonLabels(walletCard(SOFTWARE_WALLET, { isActive: true }))).not.toContain('SWITCH');
    });

    it('should show EXPORT only for software wallets', () => {
      expect(buttonLabels(walletCard(SOFTWARE_WALLET, {}))).toContain('EXPORT');
      expect(buttonLabels(walletCard(LEDGER_WALLET, {}))).not.toContain('EXPORT');
    });

    it('should show CONNECT only for hardware wallets', () => {
      expect(buttonLabels(walletCard(LEDGER_WALLET, {}))).toContain('CONNECT');
      expect(buttonLabels(walletCard(SOFTWARE_WALLET, {}))).not.toContain('CONNECT');
    });

    it('should always show RENAME and DELETE', () => {
      for (const w of [SOFTWARE_WALLET, LEDGER_WALLET]) {
        const labels = buttonLabels(walletCard(w, { isActive: true }));
        expect(labels).toContain('RENAME');
        expect(labels).toContain('DELETE');
      }
    });
  });

  describe('handlers', () => {
    function clickByLabel(card, label) {
      [...card.querySelectorAll('button')].find(b => b.textContent === label).click();
    }

    it('should pass the wallet id to switch, export and delete', () => {
      const onSwitch = vi.fn(), onExport = vi.fn(), onDelete = vi.fn();
      const card = walletCard(SOFTWARE_WALLET, { isActive: false, onSwitch, onExport, onDelete });
      clickByLabel(card, 'SWITCH');
      clickByLabel(card, 'EXPORT');
      clickByLabel(card, 'DELETE');
      expect(onSwitch).toHaveBeenCalledWith('w1');
      expect(onExport).toHaveBeenCalledWith('w1');
      expect(onDelete).toHaveBeenCalledWith('w1');
    });

    it('should pass id and nickname to rename', () => {
      const onRename = vi.fn();
      clickByLabel(walletCard(SOFTWARE_WALLET, { onRename }), 'RENAME');
      expect(onRename).toHaveBeenCalledWith('w1', 'Daily Driver');
    });

    it('should pass id and the wallet object to reconnect', () => {
      const onReconnect = vi.fn();
      clickByLabel(walletCard(LEDGER_WALLET, { onReconnect }), 'CONNECT');
      expect(onReconnect).toHaveBeenCalledWith('w2', LEDGER_WALLET);
    });

    it('should not throw when handlers are omitted', () => {
      const card = walletCard(SOFTWARE_WALLET, { isActive: false });
      expect(() => clickByLabel(card, 'DELETE')).not.toThrow();
    });
  });

  describe('SECURITY: nickname is user-supplied text', () => {
    it('should render a markup nickname as inert text', () => {
      const evil = '<img src=x onerror=alert(1)>';
      const card = walletCard({ ...SOFTWARE_WALLET, nickname: evil }, {});
      expect(card.querySelector('img')).toBeNull();
      expect(card.textContent).toContain(evil);
    });

    it('should not create attributes from a quote-laden nickname', () => {
      const card = walletCard({ ...SOFTWARE_WALLET, nickname: '" data-x="y' }, {});
      for (const el of [card, ...card.querySelectorAll('*')]) {
        expect(el.getAttributeNames()).not.toContain('data-x');
      }
    });

    it('should not emit data-wallet-id or data-action attributes', () => {
      // Wiring is by closure now, so there is no id round-trip through the DOM.
      const card = walletCard(SOFTWARE_WALLET, { isActive: false, onSwitch: vi.fn() });
      const all = [card, ...card.querySelectorAll('*')];
      expect(all.some(el => el.hasAttribute('data-wallet-id'))).toBe(false);
      expect(all.some(el => el.hasAttribute('data-action'))).toBe(false);
    });

    it('should render a markup address as inert text', () => {
      const card = walletCard({ ...SOFTWARE_WALLET, address: '<b>x</b>' }, {});
      expect(card.querySelector('b')).toBeNull();
    });
  });
});
