/**
 * popup/render/txHistoryRow.js
 *
 * Builds a transaction history row.
 *
 * Values here originate from the wallet's own history store and RPC responses rather
 * than from a dApp, so this was the lowest-risk of the string-built renderers. It is
 * converted for the same reason as the others: while the pattern exists anywhere, every
 * future edit has to remember to escape, and the next value added to a row may not be
 * as trustworthy as today's.
 *
 * Unlike the token and wallet renderers, this one keeps its data-tx-hash and
 * data-refresh-tx attributes: the history list uses event delegation wired once in
 * setupTransactionHistoryEventDelegation(), which is the right design for a long list.
 * setAttribute makes the values inert regardless of content.
 */

import { ethers } from 'ethers';
import { h } from '../lib/html.js';
import { getNetworkSymbol } from '../lib/networks.js';

const STATUS_ICONS = {
  pending: '⏳',
  confirmed: '✅'
};
const FAILED_ICON = '❌';

const STATUS_COLORS = {
  pending: 'var(--terminal-warning)',
  confirmed: '#44ff44'
};
const FAILED_COLOR = '#ff4444';

const HEADER_STYLE =
  'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';
const LINE_STYLE = 'font-size: 10px; margin-bottom: 4px;';
const LAST_LINE_STYLE = 'font-size: 10px;';
const REFRESH_BTN_STYLE = 'font-size: 9px; padding: 4px 8px; margin-left: 8px;';

/**
 * @param {Object} tx - Transaction history entry
 * @returns {HTMLElement}
 */
export function txHistoryRow(tx) {
  const status = tx.status;
  const icon = STATUS_ICONS[status] || FAILED_ICON;
  const color = STATUS_COLORS[status] || FAILED_COLOR;

  const valueEth = safeFormat(() => ethers.formatEther(tx.value || '0'), '0.0');
  const gasGwei = safeFormat(() => ethers.formatUnits(tx.gasPrice || '0', 'gwei'), '0');
  const hash = String(tx.hash || '');

  return h(
    'div',
    {
      class: 'panel mb-2',
      style: `padding: 12px; cursor: pointer; border-color: ${color};`,
      dataset: { txHash: hash }
    },
    [
      h('div', { style: HEADER_STYLE }, [
        h('div', { style: 'display: flex; align-items: center;' }, [
          h('span', {
            style: `color: ${color}; font-size: 14px;`,
            text: `${icon} ${String(status || '').toUpperCase()}`
          }),
          status === 'pending'
            ? h('button', {
                class: 'btn-small',
                style: REFRESH_BTN_STYLE,
                dataset: { refreshTx: hash },
                text: '🔄 Refresh'
              })
            : null
        ]),
        h('span', {
          class: 'text-dim',
          style: 'font-size: 10px;',
          text: new Date(tx.timestamp).toLocaleString()
        })
      ]),
      h('p', {
        class: 'text-dim',
        style: LINE_STYLE,
        text: `Hash: ${hash.slice(0, 20)}...`
      }),
      h('p', {
        class: 'text-dim',
        style: LINE_STYLE,
        text: `Value: ${valueEth} ${getNetworkSymbol(tx.network)}`
      }),
      h('p', {
        class: 'text-dim',
        style: LAST_LINE_STYLE,
        text: `Gas: ${gasGwei} Gwei • Nonce: ${tx.nonce}`
      })
    ]
  );
}

// A malformed stored value should not take down the whole history list.
function safeFormat(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    return fallback;
  }
}

/**
 * A centered dim message, used for the history list's empty/loading/error states.
 * @param {string} message
 * @returns {HTMLElement}
 */
export function txHistoryMessage(message) {
  return h('p', { class: 'text-center text-dim', text: message });
}
