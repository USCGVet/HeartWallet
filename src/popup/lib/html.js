/**
 * popup/lib/html.js
 *
 * Escaping and safe DOM construction for the popup UI.
 *
 * WHY THIS MODULE EXISTS
 * The popup historically built its UI by concatenating HTML strings and assigning
 * them to innerHTML. That pattern mixes trusted markup with untrusted values in the
 * same string, so safety depends on remembering to escape every interpolation - and
 * a single miss is an injection. A malicious ERC-20 contract controls its own
 * name()/symbol(), so "untrusted" includes token metadata, not just dApp input.
 *
 * Prefer the builders below (`h`, `frag`, `replaceChildren`) over innerHTML: they set
 * text via textContent and attributes via setAttribute, neither of which parses
 * markup, so injection is structurally impossible rather than merely escaped.
 */

/**
 * Escapes HTML special characters.
 *
 * SECURITY: Escapes quotes as well as angle brackets. A previous implementation used
 * a textContent -> innerHTML round-trip, which escapes & < > but NOT quotes, because
 * the HTML serializer only escapes quotes when serializing attribute values, not text
 * nodes. That left every `attr="${escapeHtml(x)}"` interpolation open to attribute
 * injection. Safe in text positions too: &quot;/&#39; render as " and '.
 *
 * Only needed when building HTML strings. Code using `h()` does not need it.
 *
 * @param {string} text - Text to escape
 * @returns {string} HTML-safe text, usable in both text and quoted-attribute contexts
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes error messages for safe display in alerts and UI.
 * Removes HTML tags, scripts, and limits length.
 * @param {string} message - Error message to sanitize
 * @returns {string} Sanitized message
 */
export function sanitizeError(message) {
  if (typeof message !== 'string') return 'Unknown error';

  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove script-like content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Limit length to prevent DoS
  if (sanitized.length > 300) {
    sanitized = sanitized.substring(0, 297) + '...';
  }

  return sanitized || 'Unknown error';
}

// URL schemes allowed in href/src attributes. Anything else - notably javascript:
// and data: - is dropped, since those are the two that turn a link into script or
// let untrusted content masquerade as a local asset.
const SAFE_URL_SCHEMES = new Set(['http:', 'https:', 'chrome-extension:']);

/**
 * Returns the URL if its scheme is safe to put in an href/src, otherwise null.
 * Relative URLs are permitted (resolved against the extension page itself).
 * @param {string} url
 * @returns {string|null}
 */
export function safeUrl(url) {
  if (typeof url !== 'string' || url === '') return null;

  // A leading slash or bare path cannot carry a scheme, so it is safe as-is.
  // Reject anything containing a colon before the first slash - that is a scheme.
  // Browsers strip ASCII tab/newline (and other control chars) from URLs before
  // parsing the scheme - "java\tscript:" parses as javascript: - so the scheme
  // must be detected against the same stripped form, not the raw string.
  const stripped = url.replace(/[\u0000-\u0020]/g, '');
  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(stripped);
  if (!schemeMatch) return url;

  return SAFE_URL_SCHEMES.has(schemeMatch[1].toLowerCase() + ':') ? url : null;
}

/**
 * Creates an element without ever parsing markup.
 *
 * Text is set via textContent and attributes via setAttribute, so any value - token
 * symbols, dApp origins, decoded calldata - is inert regardless of content.
 *
 * @param {string} tag - Tag name
 * @param {Object} [props] - Attributes and special keys:
 *        `text` sets textContent; `class` sets className; `dataset` sets data-*
 *        entries; `on<Event>` with a function value adds a listener; `href`/`src`
 *        are scheme-checked. Null/undefined values are skipped.
 * @param {Array<Node|string>|Node|string} [children] - Child nodes; strings become text
 * @returns {HTMLElement}
 */
export function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props || {})) {
    if (value === null || value === undefined) continue;

    if (key === 'text') {
      node.textContent = String(value);
    } else if (key === 'class') {
      node.className = String(value);
    } else if (key === 'dataset') {
      for (const [dataKey, dataValue] of Object.entries(value)) {
        if (dataValue === null || dataValue === undefined) continue;
        node.dataset[dataKey] = String(dataValue);
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'href' || key === 'src') {
      const url = safeUrl(String(value));
      if (url !== null) node.setAttribute(key, url);
    } else {
      node.setAttribute(key, String(value));
    }
  }

  appendChildren(node, children);
  return node;
}

/**
 * Builds a DocumentFragment from a list of nodes/strings, for appending many
 * siblings in one operation.
 * @param {Array<Node|string>} children
 * @returns {DocumentFragment}
 */
export function frag(children = []) {
  const fragment = document.createDocumentFragment();
  appendChildren(fragment, children);
  return fragment;
}

/**
 * Replaces all children of a node. The DOM equivalent of `el.innerHTML = ...`,
 * without the markup parsing.
 * @param {Node} node - Node to empty and refill
 * @param {Array<Node|string>|Node|string} children
 * @returns {Node} The same node, for chaining
 */
export function replaceChildren(node, children = []) {
  if (!node) return node;
  while (node.firstChild) node.removeChild(node.firstChild);
  appendChildren(node, children);
  return node;
}

function appendChildren(parent, children) {
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    parent.appendChild(
      typeof child === 'string' || typeof child === 'number'
        ? document.createTextNode(String(child))
        : child
    );
  }
}
