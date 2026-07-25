/**
 * tests/unit/popup-html.test.js
 *
 * Unit tests for the popup's escaping and safe DOM construction layer.
 *
 * This code used to live inside the 8,800-line popup.js, which cannot be imported by
 * a test (DOM/chrome side effects on load) - so the wallet's most injection-prone
 * code was also its least tested. That is how the escapeHtml quote bug survived.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  escapeHtml,
  sanitizeError,
  safeUrl,
  h,
  frag,
  replaceChildren
} from '../../src/popup/lib/html.js';

describe('popup/lib/html.js', () => {
  describe('escapeHtml', () => {
    it('should escape double quotes (attribute breakout)', () => {
      expect(escapeHtml('X" onmouseover="alert(1)'))
        .toBe('X&quot; onmouseover=&quot;alert(1)');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("X' onmouseover='alert(1)"))
        .toBe('X&#39; onmouseover=&#39;alert(1)');
    });

    it('should escape angle brackets and ampersands', () => {
      expect(escapeHtml('<script>&</script>'))
        .toBe('&lt;script&gt;&amp;&lt;/script&gt;');
    });

    it('should escape the ampersand first to avoid double-encoding artifacts', () => {
      expect(escapeHtml('&lt;')).toBe('&amp;lt;');
    });

    it('should return empty string for non-string input', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(123)).toBe('');
      expect(escapeHtml({})).toBe('');
    });

    it('should leave ordinary text untouched', () => {
      expect(escapeHtml('PulseX')).toBe('PulseX');
    });
  });

  describe('sanitizeError', () => {
    it('should strip HTML tags', () => {
      expect(sanitizeError('<b>boom</b>')).toBe('boom');
    });

    it('should strip javascript: and inline handlers', () => {
      const out = sanitizeError('javascript:alert(1) onerror=alert(1)');
      expect(out).not.toContain('javascript:');
      expect(out).not.toContain('onerror=');
    });

    it('should strip control characters', () => {
      expect(sanitizeError('hello\u0000world')).toBe('helloworld');
    });

    it('should cap length at 300 characters', () => {
      const out = sanitizeError('A'.repeat(600));
      expect(out.length).toBeLessThanOrEqual(300);
      expect(out.endsWith('...')).toBe(true);
    });

    it('should fall back to Unknown error', () => {
      expect(sanitizeError('')).toBe('Unknown error');
      expect(sanitizeError(null)).toBe('Unknown error');
      expect(sanitizeError('<b></b>')).toBe('Unknown error');
    });
  });

  describe('safeUrl', () => {
    it('should allow http, https and extension URLs', () => {
      expect(safeUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
      expect(safeUrl('http://example.com')).toBe('http://example.com');
      expect(safeUrl('chrome-extension://abc/logo.png')).toBe('chrome-extension://abc/logo.png');
    });

    it('should allow relative URLs', () => {
      expect(safeUrl('assets/logos/hex.png')).toBe('assets/logos/hex.png');
      expect(safeUrl('/assets/logos/hex.png')).toBe('/assets/logos/hex.png');
    });

    it('should reject javascript: URLs regardless of case', () => {
      expect(safeUrl('javascript:alert(1)')).toBeNull();
      expect(safeUrl('JavaScript:alert(1)')).toBeNull();
      expect(safeUrl('  javascript:alert(1)')).toBeNull();
    });

    it('should reject data: URLs', () => {
      expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    });

    it('should reject empty and non-string input', () => {
      expect(safeUrl('')).toBeNull();
      expect(safeUrl(null)).toBeNull();
      expect(safeUrl(42)).toBeNull();
    });
  });

  describe('h', () => {
    it('should set text via textContent, not markup', () => {
      const node = h('span', { text: '<img src=x onerror=alert(1)>' });
      expect(node.textContent).toBe('<img src=x onerror=alert(1)>');
      expect(node.querySelector('img')).toBeNull();
      expect(node.children.length).toBe(0);
    });

    it('should keep a malicious token symbol inert in an attribute', () => {
      const evil = '" data-x="y';
      const node = h('button', { dataset: { tokenSymbol: evil } });
      // The value round-trips exactly, and creates no extra attributes
      expect(node.dataset.tokenSymbol).toBe(evil);
      expect(node.getAttributeNames().sort()).toEqual(['data-token-symbol']);
    });

    it('should set class and arbitrary attributes', () => {
      const node = h('div', { class: 'panel mb-2', title: 'a "quoted" title' });
      expect(node.className).toBe('panel mb-2');
      expect(node.getAttribute('title')).toBe('a "quoted" title');
    });

    it('should skip null and undefined values', () => {
      const node = h('div', { title: null, id: undefined, aria: 'x' });
      expect(node.hasAttribute('title')).toBe(false);
      expect(node.hasAttribute('id')).toBe(false);
      expect(node.getAttribute('aria')).toBe('x');
    });

    it('should drop unsafe href/src but keep safe ones', () => {
      expect(h('a', { href: 'javascript:alert(1)' }).hasAttribute('href')).toBe(false);
      expect(h('img', { src: 'data:text/html,x' }).hasAttribute('src')).toBe(false);
      expect(h('a', { href: 'https://example.com' }).getAttribute('href'))
        .toBe('https://example.com');
    });

    it('should attach event listeners from on* function props', () => {
      const onClick = vi.fn();
      const node = h('button', { onClick });
      node.click();
      expect(onClick).toHaveBeenCalledTimes(1);
      // The listener must not leak into an attribute
      expect(node.hasAttribute('onclick')).toBe(false);
    });

    it('should append string and node children', () => {
      const node = h('div', {}, ['plain ', h('b', { text: 'bold' })]);
      expect(node.textContent).toBe('plain bold');
      expect(node.querySelector('b').textContent).toBe('bold');
    });

    it('should skip null/false children', () => {
      const node = h('div', {}, ['a', null, false, undefined, 'b']);
      expect(node.textContent).toBe('ab');
    });

    it('should accept a single non-array child', () => {
      expect(h('div', {}, 'solo').textContent).toBe('solo');
    });
  });

  describe('frag', () => {
    it('should collect many siblings', () => {
      const f = frag([h('li', { text: '1' }), h('li', { text: '2' })]);
      const ul = h('ul');
      ul.appendChild(f);
      expect(ul.children.length).toBe(2);
      expect(ul.textContent).toBe('12');
    });
  });

  describe('replaceChildren', () => {
    it('should clear existing content before appending', () => {
      const node = h('div', {}, [h('span', { text: 'old' })]);
      replaceChildren(node, [h('span', { text: 'new' })]);
      expect(node.children.length).toBe(1);
      expect(node.textContent).toBe('new');
    });

    it('should empty the node when given nothing', () => {
      const node = h('div', {}, ['a', 'b']);
      replaceChildren(node);
      expect(node.childNodes.length).toBe(0);
    });

    it('should tolerate a null node', () => {
      expect(replaceChildren(null, ['x'])).toBeNull();
    });
  });
});
