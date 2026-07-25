/**
 * popup/render/txParams.js
 *
 * Renders decoded transaction calldata for the approval screen.
 *
 * SECURITY: every value here comes from decoding calldata a dApp supplied, so it is
 * attacker-controlled. A `string` parameter in particular can hold arbitrary text.
 * The previous implementation returned HTML strings and was correct only because each
 * of its eight branches remembered to call escapeHtml - one missed branch would have
 * been an injection on the approval screen, the highest-consequence screen in the
 * wallet. These builders return DOM nodes, so no branch can get it wrong.
 *
 * Display output is intentionally identical to the previous string version.
 */

import { ethers } from 'ethers';
import { h, frag } from '../lib/html.js';

const DIM_HINT_STYLE = 'color: var(--terminal-dim); font-size: 9px;';
const PARAM_BOX_STYLE =
  'margin-bottom: 12px; padding: 8px; background: var(--terminal-bg); ' +
  'border: 1px solid var(--terminal-border); border-radius: 4px;';
const PARAM_HEADER_STYLE = 'display: flex; justify-content: space-between; margin-bottom: 4px;';
const PARAM_NAME_STYLE = 'font-size: 10px; color: var(--terminal-dim);';
const PARAM_TYPE_STYLE =
  'font-size: 9px; color: var(--terminal-dim); font-family: var(--font-mono);';
const PARAM_VALUE_STYLE =
  'font-size: 10px; font-family: var(--font-mono); word-break: break-all;';

// Values longer than these get truncated with a "(N chars)" hint.
const BYTES_PREVIEW_LENGTH = 66;
const STRING_PREVIEW_LENGTH = 50;
const JSON_PREVIEW_LENGTH = 100;

/**
 * Formats a decoded parameter value as DOM.
 * @param {any} value - Decoded value (attacker-controlled)
 * @param {string} type - Solidity type name
 * @returns {Node} A node or fragment safe to append
 */
export function formatParameterValue(value, type) {
  try {
    return buildValue(value, type);
  } catch (error) {
    console.error('Error formatting parameter value:', error);
    return document.createTextNode(String(value));
  }
}

function buildValue(value, type) {
  // Arrays: "[i]: <value>" per element, separated by line breaks
  if (typeof type === 'string' && type.includes('[]') && Array.isArray(value)) {
    const elementType = type.replace('[]', '');
    const parts = [];
    value.forEach((element, index) => {
      if (index > 0) parts.push(h('br'));
      parts.push(`[${index}]: `, buildValue(element, elementType));
    });
    return frag(parts);
  }

  if (type === 'address') {
    const address = String(value);
    return h('span', {
      title: address,
      style: 'cursor: help;',
      text: `${address.slice(0, 6)}...${address.slice(-4)}`
    });
  }

  if (typeof type === 'string' && (type.startsWith('uint') || type.startsWith('int'))) {
    return buildNumber(value);
  }

  if (type === 'bool') {
    return value
      ? h('span', { style: 'color: var(--terminal-success);', text: 'true' })
      : h('span', { style: 'color: var(--terminal-warning);', text: 'false' });
  }

  if (typeof type === 'string' && type.startsWith('bytes') && typeof value === 'string') {
    return buildTruncated(value, BYTES_PREVIEW_LENGTH);
  }

  if (type === 'string') {
    return buildTruncated(String(value), STRING_PREVIEW_LENGTH);
  }

  if (typeof value === 'object' && value !== null) {
    const json = JSON.stringify(value, null, 2);
    return json.length > JSON_PREVIEW_LENGTH
      ? h('pre', {
          style: 'font-size: 9px; overflow-x: auto;',
          text: json.slice(0, JSON_PREVIEW_LENGTH) + '...'
        })
      : h('pre', { style: 'font-size: 9px;', text: json });
  }

  return document.createTextNode(String(value));
}

// Large integers additionally show an approximate token amount, since raw wei-scale
// values are unreadable and a user approving a transfer needs the human number.
function buildNumber(value) {
  const valueStr = String(value);
  if (valueStr.length <= 18) {
    return document.createTextNode(valueStr);
  }

  try {
    const etherValue = ethers.formatEther(valueStr);
    if (parseFloat(etherValue) > 0.000001) {
      return frag([
        valueStr,
        h('br'),
        h('span', {
          style: DIM_HINT_STYLE,
          text: `(≈ ${parseFloat(etherValue).toFixed(6)} tokens)`
        })
      ]);
    }
  } catch (error) {
    // Conversion failed - fall through to the raw value
  }

  return document.createTextNode(valueStr);
}

function buildTruncated(text, previewLength) {
  if (text.length <= previewLength) {
    return document.createTextNode(text);
  }
  return frag([
    text.slice(0, previewLength) + '...',
    h('br'),
    h('span', { style: DIM_HINT_STYLE, text: `(${text.length} chars)` })
  ]);
}

/**
 * Builds one decoded-parameter box: name, solidity type, and formatted value.
 * @param {{name: string, type: string, value: any}} param
 * @returns {HTMLElement}
 */
export function paramRow(param) {
  return h('div', { style: PARAM_BOX_STYLE }, [
    h('div', { style: PARAM_HEADER_STYLE }, [
      h('span', { style: PARAM_NAME_STYLE, text: param.name }),
      h('span', { style: PARAM_TYPE_STYLE, text: param.type })
    ]),
    h('div', { style: PARAM_VALUE_STYLE }, [formatParameterValue(param.value, param.type)])
  ]);
}

/**
 * Builds the full decoded-parameter list.
 * @param {Array<{name: string, type: string, value: any}>} params
 * @returns {HTMLElement[]}
 */
export function txParamsList(params) {
  return (params || []).map(paramRow);
}
