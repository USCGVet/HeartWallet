/**
 * popup/render/tokenRow.js
 *
 * Builds a token list row as DOM nodes.
 *
 * SECURITY: a token contract controls its own name() and symbol(), so those strings
 * are attacker-controlled. This module never concatenates them into markup - text goes
 * through textContent and URLs are scheme-checked - so injection is structurally
 * impossible rather than dependent on remembering an escape at each site.
 *
 * Click handlers are per-row closures rather than data-* attributes read back from the
 * DOM. That removes the data-token-symbol round-trip entirely (the exact attribute that
 * was injectable), and avoids the e.target.dataset fragility of delegated handlers.
 *
 * Replaces the near-identical row markup that was duplicated between
 * renderDefaultTokens() and renderCustomTokens() in popup.js.
 */

import { h } from '../lib/html.js';

const ROW_STYLE =
  'display: flex; align-items: center; justify-content: space-between; ' +
  'padding: 12px 8px; border-bottom: 1px solid var(--terminal-border);';
const LOGO_STYLE = 'width: 32px; height: 32px; margin-right: 12px; border-radius: 50%;';
const LOGO_LINK_STYLE = LOGO_STYLE + ' cursor: pointer;';
const LOGO_PLACEHOLDER_STYLE =
  'width: 32px; height: 32px; margin-right: 12px; background: var(--terminal-border); border-radius: 50%;';
const SYMBOL_STYLE = 'font-size: 15px; font-weight: bold;';
const NAME_STYLE = 'font-size: 13px;';
const NAME_LINK_STYLE = NAME_STYLE + ' cursor: pointer; text-decoration: underline;';
const ADDRESS_ROW_STYLE =
  'font-size: 11px; font-family: var(--font-mono); display: flex; align-items: center; gap: 4px;';
const ADDRESS_STYLE = 'max-width: 80px; overflow: hidden; text-overflow: ellipsis;';
const COPY_BTN_STYLE =
  'background: none; border: none; color: var(--terminal-accent); cursor: pointer; ' +
  'font-size: 11px; padding: 2px 4px;';
const BALANCE_STYLE = 'font-size: 13px; cursor: help;';
const USD_STYLE = 'font-size: 12px; margin-top: 2px;';
const INFO_BTN_STYLE =
  'background: var(--terminal-accent); border: none; color: #000; cursor: pointer; ' +
  'font-size: 18px; padding: 4px 8px; border-radius: 4px;';
const REMOVE_BTN_STYLE = 'width: 100%; font-size: 9px; padding: 2px 4px;';

/**
 * @param {Object} token - Token data. `name`/`symbol` may be attacker-controlled.
 * @param {string} token.symbol
 * @param {string} [token.name]
 * @param {string} token.address
 * @param {string} [token.logoUrl] - Resolved logo URL, or falsy for a placeholder
 * @param {string} [token.homeUrl] - Clicking the logo opens this
 * @param {string} [token.dexScreenerUrl] - Clicking the name opens this
 * @param {Object} [opts]
 * @param {string} [opts.balanceText] - Omit to hide the balance line
 * @param {string} [opts.balanceTooltip]
 * @param {string} [opts.usdText] - Omit to hide the USD line
 * @param {'info'|'info+remove'} [opts.actions='info'] - Which action buttons to show
 * @param {Function} [opts.onViewDetails] - Called with no args
 * @param {Function} [opts.onCopyAddress] - Called with (address, buttonEl)
 * @param {Function} [opts.onOpenUrl] - Called with (url)
 * @param {Function} [opts.onRemove] - Called with (address)
 * @returns {HTMLElement}
 */
export function tokenRow(token, opts = {}) {
  const {
    balanceText,
    balanceTooltip,
    usdText,
    actions = 'info',
    onViewDetails,
    onCopyAddress,
    onOpenUrl,
    onRemove
  } = opts;

  const copyButton = h('button', {
    class: 'copy-address-btn',
    style: COPY_BTN_STYLE,
    title: 'Copy contract address',
    text: '📋',
    onClick: onCopyAddress ? () => onCopyAddress(token.address, copyButton) : null
  });

  const details = h('div', { style: 'flex: 1;' }, [
    h('p', { style: SYMBOL_STYLE, text: token.symbol }),
    buildName(token, onOpenUrl),
    h('p', { class: 'text-dim', style: ADDRESS_ROW_STYLE }, [
      h('span', { style: ADDRESS_STYLE, text: token.address }),
      copyButton
    ]),
    balanceText
      ? h('p', {
          class: 'text-dim',
          style: BALANCE_STYLE,
          title: balanceTooltip || null,
          text: `Balance: ${balanceText}`
        })
      : null,
    usdText ? h('p', { class: 'text-dim', style: USD_STYLE, text: usdText }) : null
  ]);

  return h('div', { class: 'token-item', style: ROW_STYLE }, [
    buildLogo(token, onOpenUrl),
    details,
    buildActions({ actions, token, onViewDetails, onRemove })
  ]);
}

function buildLogo(token, onOpenUrl) {
  if (!token.logoUrl) {
    return h('div', { style: LOGO_PLACEHOLDER_STYLE });
  }

  const clickable = Boolean(token.homeUrl && onOpenUrl);
  return h('img', {
    src: token.logoUrl,
    alt: token.symbol,
    style: clickable ? LOGO_LINK_STYLE : LOGO_STYLE,
    class: clickable ? 'token-logo-link' : null,
    title: clickable ? `Visit ${token.name || token.symbol} homepage` : null,
    onClick: clickable ? () => onOpenUrl(token.homeUrl) : null
  });
}

function buildName(token, onOpenUrl) {
  const name = token.name || '';
  const clickable = Boolean(token.dexScreenerUrl && onOpenUrl);

  return h('p', {
    class: clickable ? 'text-dim token-name-link' : 'text-dim',
    style: clickable ? NAME_LINK_STYLE : NAME_STYLE,
    title: clickable ? `View ${name} on DexScreener` : null,
    text: name,
    onClick: clickable ? () => onOpenUrl(token.dexScreenerUrl) : null
  });
}

function buildActions({ actions, token, onViewDetails, onRemove }) {
  const infoButton = h('button', {
    class: 'view-token-details-btn',
    style: INFO_BTN_STYLE,
    title: 'View token details',
    text: 'ℹ️',
    onClick: onViewDetails ? () => onViewDetails() : null
  });

  if (actions !== 'info+remove') {
    return h('div', { style: 'display: flex; align-items: center; margin-left: 8px;' }, [
      infoButton
    ]);
  }

  return h(
    'div',
    {
      style:
        'display: flex; flex-direction: column; gap: 6px; align-items: center; ' +
        'margin-left: 8px; min-width: 80px;'
    },
    [
      infoButton,
      h('button', {
        class: 'btn-danger btn-small remove-token-btn',
        style: REMOVE_BTN_STYLE,
        text: 'REMOVE',
        onClick: onRemove ? () => onRemove(token.address) : null
      })
    ]
  );
}

/**
 * Builds the "nothing here" placeholder used by both token lists.
 * @param {string} message
 * @returns {HTMLElement}
 */
export function emptyTokenList(message) {
  return h('p', {
    class: 'text-center text-dim',
    style: 'font-size: 11px; padding: 16px;',
    text: message
  });
}
