/**
 * tests/unit/popup-txParams.test.js
 *
 * Unit tests for decoded-calldata rendering on the transaction approval screen.
 *
 * Every value here is attacker-controlled: it comes from decoding calldata a dApp
 * supplied. A `string` parameter can hold arbitrary text. This is the
 * highest-consequence screen in the wallet, so these tests pin that no parameter value
 * can produce markup, and that the display formatting still matches what the previous
 * string-building implementation produced.
 */

import { describe, it, expect } from 'vitest';
import { parseUnits } from 'ethers';
import { formatParameterValue, paramRow, txParamsList } from '../../src/popup/render/txParams.js';

// Renders a node into a container so we can assert on text and structure
function render(node) {
  const box = document.createElement('div');
  box.appendChild(node);
  return box;
}

const ADDRESS = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

describe('popup/render/txParams.js', () => {
  describe('formatParameterValue - display behaviour', () => {
    it('should shorten addresses and keep the full value in the title', () => {
      const box = render(formatParameterValue(ADDRESS, 'address'));
      const span = box.querySelector('span');
      expect(span.textContent).toBe('0x5aAe...eAed');
      expect(span.getAttribute('title')).toBe(ADDRESS);
    });

    it('should render small integers plainly', () => {
      expect(render(formatParameterValue('12345', 'uint256')).textContent).toBe('12345');
    });

    it('should add a token approximation for large integers', () => {
      const wei = parseUnits('2.5', 18).toString();
      const text = render(formatParameterValue(wei, 'uint256')).textContent;
      expect(text).toContain(wei);
      expect(text).toContain('2.500000 tokens');
    });

    it('should not add an approximation for dust-scale large integers', () => {
      // 19 digits but below the 0.000001 display threshold
      const text = render(formatParameterValue('1000000000000', 'uint256')).textContent;
      expect(text).not.toContain('tokens');
    });

    it('should render booleans with success/warning colouring', () => {
      const t = render(formatParameterValue(true, 'bool')).querySelector('span');
      const f = render(formatParameterValue(false, 'bool')).querySelector('span');
      expect(t.textContent).toBe('true');
      expect(t.getAttribute('style')).toContain('success');
      expect(f.textContent).toBe('false');
      expect(f.getAttribute('style')).toContain('warning');
    });

    it('should truncate long strings with a character count', () => {
      const long = 'a'.repeat(120);
      const text = render(formatParameterValue(long, 'string')).textContent;
      expect(text).toContain('a'.repeat(50) + '...');
      expect(text).toContain('(120 chars)');
    });

    it('should render short strings in full', () => {
      expect(render(formatParameterValue('hello', 'string')).textContent).toBe('hello');
    });

    it('should truncate long bytes with a character count', () => {
      const long = '0x' + 'ab'.repeat(60);
      const text = render(formatParameterValue(long, 'bytes')).textContent;
      expect(text).toContain('(122 chars)');
    });

    it('should index array elements', () => {
      const text = render(formatParameterValue(['1', '2', '3'], 'uint256[]')).textContent;
      expect(text).toContain('[0]: 1');
      expect(text).toContain('[1]: 2');
      expect(text).toContain('[2]: 3');
    });

    it('should format addresses inside arrays', () => {
      const box = render(formatParameterValue([ADDRESS], 'address[]'));
      expect(box.querySelector('span').getAttribute('title')).toBe(ADDRESS);
    });

    it('should render objects as JSON in a pre block', () => {
      const box = render(formatParameterValue({ a: 1 }, 'tuple'));
      expect(box.querySelector('pre')).not.toBeNull();
      expect(box.textContent).toContain('"a": 1');
    });

    it('should truncate long JSON', () => {
      const big = {};
      for (let i = 0; i < 50; i++) big['key' + i] = i;
      const text = render(formatParameterValue(big, 'tuple')).textContent;
      expect(text.endsWith('...')).toBe(true);
    });

    it('should fall back to string conversion for unknown types', () => {
      expect(render(formatParameterValue(42, 'weird')).textContent).toBe('42');
    });
  });

  describe('SECURITY: attacker-controlled parameter values', () => {
    it('should render a markup string parameter as inert text', () => {
      const evil = '<img src=x onerror=alert(1)>';
      const box = render(formatParameterValue(evil, 'string'));
      expect(box.querySelector('img')).toBeNull();
      expect(box.textContent).toBe(evil);
    });

    it('should render a script payload as inert text', () => {
      const evil = '<script>alert(1)</script>';
      const box = render(formatParameterValue(evil, 'string'));
      expect(box.querySelector('script')).toBeNull();
      expect(box.textContent).toBe(evil);
    });

    it('should not let a quote-laden value create attributes', () => {
      const box = render(formatParameterValue('" onmouseover="alert(1)', 'string'));
      for (const el of box.querySelectorAll('*')) {
        expect(el.getAttributeNames()).not.toContain('onmouseover');
      }
    });

    it('should keep a hostile address value inside the title attribute', () => {
      const evil = '"><b>x</b>';
      const box = render(formatParameterValue(evil, 'address'));
      expect(box.querySelector('b')).toBeNull();
      expect(box.querySelector('span').getAttribute('title')).toBe(evil);
    });

    it('should render markup inside array elements as text', () => {
      const box = render(formatParameterValue(['<b>a</b>', '<i>b</i>'], 'string[]'));
      expect(box.querySelector('b')).toBeNull();
      expect(box.querySelector('i')).toBeNull();
    });

    it('should render a markup parameter name and type as text', () => {
      const box = render(paramRow({
        name: '<b>evil</b>',
        type: '<i>uint256</i>',
        value: '1'
      }));
      expect(box.querySelector('b')).toBeNull();
      expect(box.querySelector('i')).toBeNull();
      expect(box.textContent).toContain('<b>evil</b>');
    });

    it('should not throw on a type that is not a string', () => {
      expect(() => formatParameterValue('x', undefined)).not.toThrow();
      expect(() => formatParameterValue('x', null)).not.toThrow();
    });
  });

  describe('txParamsList', () => {
    it('should build one box per parameter', () => {
      const rows = txParamsList([
        { name: 'to', type: 'address', value: ADDRESS },
        { name: 'amount', type: 'uint256', value: '100' }
      ]);
      expect(rows).toHaveLength(2);
      expect(rows[0].textContent).toContain('to');
      expect(rows[1].textContent).toContain('amount');
      expect(rows[1].textContent).toContain('100');
    });

    it('should return an empty list for missing params', () => {
      expect(txParamsList(undefined)).toEqual([]);
      expect(txParamsList([])).toEqual([]);
    });
  });
});
