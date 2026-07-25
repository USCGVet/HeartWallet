/**
 * popup/render/walletCard.js
 *
 * Builds a card for the manage-wallets list.
 *
 * The nickname is user-supplied. That makes injection here self-inflicted rather than
 * remote, which is lower severity - but a nickname is also the thing a user reads to
 * confirm *which* wallet they are about to export or delete, so it must render as
 * exactly the text they typed and nothing else.
 *
 * Action buttons carry per-card closures instead of data-wallet-id/data-action pairs
 * read back out of the DOM.
 */

import { h } from '../lib/html.js';

const HEADER_STYLE =
  'display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;';
const NAME_STYLE = 'font-weight: bold; font-size: 14px; margin-bottom: 4px;';
const ACTIVE_BADGE_STYLE = 'font-size: 11px; margin-left: 8px;';
const ADDRESS_STYLE = 'font-size: 11px; font-family: var(--font-mono); word-break: break-all;';
const META_STYLE = 'font-size: 10px; margin-top: 4px;';
const RECONNECT_BTN_STYLE =
  'border-color: var(--terminal-info); color: var(--terminal-info); white-space: nowrap;';

/**
 * @param {Object} wallet - Wallet record
 * @param {Object} opts
 * @param {boolean} opts.isActive - Whether this is the active wallet
 * @param {Function} [opts.onSwitch] - Called with (walletId)
 * @param {Function} [opts.onReconnect] - Called with (walletId, wallet)
 * @param {Function} [opts.onRename] - Called with (walletId, nickname)
 * @param {Function} [opts.onExport] - Called with (walletId)
 * @param {Function} [opts.onDelete] - Called with (walletId)
 * @returns {HTMLElement}
 */
export function walletCard(wallet, opts = {}) {
  const { isActive, onSwitch, onReconnect, onRename, onExport, onDelete } = opts;

  const card = h('div', { class: 'panel mb-2' }, [
    h('div', { style: HEADER_STYLE }, [
      h('div', { style: 'flex: 1;' }, [
        h('div', { style: NAME_STYLE }, [
          `${isActive ? '✓ ' : ''}${wallet.nickname || 'Unnamed Wallet'}`,
          isActive
            ? h('span', { class: 'text-success', style: ACTIVE_BADGE_STYLE, text: '[ACTIVE]' })
            : null
        ]),
        h('div', {
          class: 'text-dim',
          style: ADDRESS_STYLE,
          text: wallet.address || 'Address not loaded'
        }),
        h('div', { class: 'text-dim', style: META_STYLE, text: describeWallet(wallet) })
      ])
    ]),
    h('div', { class: 'button-group', style: 'gap: 6px;' }, [
      !isActive
        ? h('button', {
            class: 'btn btn-small',
            text: 'SWITCH',
            onClick: onSwitch ? () => onSwitch(wallet.id) : null
          })
        : null,
      wallet.isHardwareWallet
        ? h('button', {
            class: 'btn btn-small',
            style: RECONNECT_BTN_STYLE,
            text: 'CONNECT',
            onClick: onReconnect ? () => onReconnect(wallet.id, wallet) : null
          })
        : null,
      h('button', {
        class: 'btn btn-small',
        text: 'RENAME',
        onClick: onRename ? () => onRename(wallet.id, wallet.nickname) : null
      }),
      !wallet.isHardwareWallet
        ? h('button', {
            class: 'btn btn-small',
            text: 'EXPORT',
            onClick: onExport ? () => onExport(wallet.id) : null
          })
        : null,
      h('button', {
        class: 'btn btn-danger btn-small',
        text: 'DELETE',
        onClick: onDelete ? () => onDelete(wallet.id) : null
      })
    ])
  ]);

  if (isActive) {
    card.style.borderColor = 'var(--terminal-success)';
    card.style.borderWidth = '2px';
  }

  return card;
}

function describeWallet(wallet) {
  const kind = wallet.isHardwareWallet
    ? `🔐 ${String(wallet.hardwareType || '').toUpperCase()} Hardware Wallet`
    : wallet.importMethod === 'create'
      ? 'Created'
      : 'Imported';

  return `${kind} • ${new Date(wallet.createdAt).toLocaleDateString()}`;
}
