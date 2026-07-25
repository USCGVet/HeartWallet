/**
 * tests/unit/popup-tokenRow.test.js
 *
 * Unit tests for the token list row renderer.
 *
 * The vulnerability fixed in cc8b9fa lived exactly here: a token contract returns any
 * name()/symbol() it likes, and the row markup interpolated the symbol into
 * data-token-symbol="..." unescaped. These tests pin that attacker-controlled metadata
 * cannot produce markup, attributes, or navigable javascript: URLs.
 */

import { describe, it, expect, vi } from 'vitest';
import { tokenRow, emptyTokenList } from '../../src/popup/render/tokenRow.js';

const BENIGN = {
  symbol: 'HEX',
  name: 'HEX Token',
  address: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  logoUrl: 'chrome-extension://abc/assets/logos/hex.png'
};

describe('popup/render/tokenRow.js', () => {
  describe('benign rendering', () => {
    it('should render symbol, name and address as text', () => {
      const row = tokenRow(BENIGN);
      expect(row.textContent).toContain('HEX');
      expect(row.textContent).toContain('HEX Token');
      expect(row.textContent).toContain(BENIGN.address);
    });

    it('should show the balance line only when a balance is given', () => {
      expect(tokenRow(BENIGN).textContent).not.toContain('Balance:');
      const withBalance = tokenRow(BENIGN, { balanceText: '1,234.5' });
      expect(withBalance.textContent).toContain('Balance: 1,234.5');
    });

    it('should show the USD line only when given', () => {
      expect(tokenRow(BENIGN, { balanceText: '1' }).textContent).not.toContain('$');
      expect(tokenRow(BENIGN, { balanceText: '1', usdText: '$42.00' }).textContent)
        .toContain('$42.00');
    });

    it('should render the logo when a URL is given, else a placeholder', () => {
      expect(tokenRow(BENIGN).querySelector('img')).not.toBeNull();
      expect(tokenRow({ ...BENIGN, logoUrl: '' }).querySelector('img')).toBeNull();
    });

    it('should render only an info button by default', () => {
      const row = tokenRow(BENIGN);
      expect(row.querySelector('.view-token-details-btn')).not.toBeNull();
      expect(row.querySelector('.remove-token-btn')).toBeNull();
    });

    it('should render a remove button when requested', () => {
      const row = tokenRow(BENIGN, { actions: 'info+remove' });
      expect(row.querySelector('.remove-token-btn')).not.toBeNull();
    });
  });

  describe('handlers', () => {
    it('should call onViewDetails when the info button is clicked', () => {
      const onViewDetails = vi.fn();
      tokenRow(BENIGN, { onViewDetails }).querySelector('.view-token-details-btn').click();
      expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should pass the address and button to onCopyAddress', () => {
      const onCopyAddress = vi.fn();
      const row = tokenRow(BENIGN, { onCopyAddress });
      const btn = row.querySelector('.copy-address-btn');
      btn.click();
      expect(onCopyAddress).toHaveBeenCalledWith(BENIGN.address, btn);
    });

    it('should pass the address to onRemove', () => {
      const onRemove = vi.fn();
      const row = tokenRow(BENIGN, { actions: 'info+remove', onRemove });
      row.querySelector('.remove-token-btn').click();
      expect(onRemove).toHaveBeenCalledWith(BENIGN.address);
    });

    it('should open homeUrl from the logo and dexScreenerUrl from the name', () => {
      const onOpenUrl = vi.fn();
      const row = tokenRow(
        { ...BENIGN, homeUrl: 'https://hex.com', dexScreenerUrl: 'https://dexscreener.com/x' },
        { onOpenUrl }
      );
      row.querySelector('.token-logo-link').click();
      expect(onOpenUrl).toHaveBeenCalledWith('https://hex.com');
      row.querySelector('.token-name-link').click();
      expect(onOpenUrl).toHaveBeenCalledWith('https://dexscreener.com/x');
    });

    it('should not mark the logo or name clickable without a URL', () => {
      const row = tokenRow(BENIGN, { onOpenUrl: vi.fn() });
      expect(row.querySelector('.token-logo-link')).toBeNull();
      expect(row.querySelector('.token-name-link')).toBeNull();
    });
  });

  describe('SECURITY: attacker-controlled token metadata', () => {
    // The original exploit: symbol() returning this broke out of
    // data-token-symbol="..." and injected arbitrary markup into the popup.
    const ATTRIBUTE_BREAKOUT = '" data-x="y';

    it('should not create extra attributes from a quote-laden symbol', () => {
      const row = tokenRow({ ...BENIGN, symbol: ATTRIBUTE_BREAKOUT });
      for (const el of [row, ...row.querySelectorAll('*')]) {
        expect(el.getAttributeNames()).not.toContain('data-x');
      }
    });

    it('should render a markup symbol as inert text', () => {
      const evil = '<img src=x onerror=alert(1)>';
      const row = tokenRow({ ...BENIGN, symbol: evil });
      expect(row.textContent).toContain(evil);
      // No element was created from the payload (the real logo img is absent here)
      expect(tokenRow({ ...BENIGN, symbol: evil, logoUrl: '' }).querySelector('img'))
        .toBeNull();
    });

    it('should render a markup name as inert text', () => {
      const row = tokenRow({ ...BENIGN, logoUrl: '', name: '<script>alert(1)</script>' });
      expect(row.querySelector('script')).toBeNull();
      expect(row.textContent).toContain('<script>alert(1)</script>');
    });

    it('should not inject via the address field', () => {
      const row = tokenRow({ ...BENIGN, logoUrl: '', address: '"><b>x</b>' });
      expect(row.querySelector('b')).toBeNull();
      expect(row.textContent).toContain('"><b>x</b>');
    });

    it('should drop a javascript: logo URL', () => {
      const row = tokenRow({ ...BENIGN, logoUrl: 'javascript:alert(1)' });
      const img = row.querySelector('img');
      expect(img).not.toBeNull();
      expect(img.hasAttribute('src')).toBe(false);
    });

    it('should keep a hostile symbol out of the details handler payload', () => {
      // The handler is a closure over the original value, so no DOM round-trip can
      // corrupt or re-parse it.
      const onViewDetails = vi.fn();
      const row = tokenRow({ ...BENIGN, symbol: ATTRIBUTE_BREAKOUT }, { onViewDetails });
      row.querySelector('.view-token-details-btn').click();
      expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should not emit a data-token-symbol attribute at all', () => {
      // The injectable attribute is gone; wiring is by closure now.
      const row = tokenRow(BENIGN, { onViewDetails: vi.fn() });
      const all = [row, ...row.querySelectorAll('*')];
      expect(all.some(el => el.hasAttribute('data-token-symbol'))).toBe(false);
    });

    it('should survive missing name and symbol without throwing', () => {
      const row = tokenRow({ address: BENIGN.address, symbol: '', logoUrl: '' });
      expect(row).toBeTruthy();
    });
  });

  describe('emptyTokenList', () => {
    it('should render the message as text', () => {
      const el = emptyTokenList('No custom tokens added');
      expect(el.textContent).toBe('No custom tokens added');
      expect(el.className).toContain('text-dim');
    });

    it('should not parse markup in the message', () => {
      expect(emptyTokenList('<b>x</b>').querySelector('b')).toBeNull();
    });
  });
});
