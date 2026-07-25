/**
 * popup/lib/format.js
 *
 * Number and balance formatting for display. Pure functions - no DOM, no chrome APIs.
 */

/**
 * Formats gas price in Gwei with appropriate precision based on magnitude.
 * PulseChain uses very high gas prices (millions of Gwei), Ethereum uses low (< 100 Gwei).
 *
 * Always uses a comma as the thousand separator rather than toLocaleString(), because
 * the formatted value gets parsed back elsewhere and a locale that uses '.' as the
 * group separator would corrupt it.
 *
 * @param {bigint|string|number} weiValue - Gas price in wei
 * @returns {string} Formatted Gwei string
 */
export function formatGweiSmart(weiValue) {
  const wei = typeof weiValue === 'bigint' ? weiValue : BigInt(weiValue);
  const gwei = Number(wei) / 1e9;

  if (gwei >= 1000) {
    // Thousands or millions of Gwei (PulseChain) - no decimals
    return withCommas(Math.round(gwei));
  } else if (gwei >= 1) {
    return gwei.toFixed(2);
  } else if (gwei >= 0.001) {
    return gwei.toFixed(3);
  }
  return gwei.toFixed(6);
}

/**
 * Adds comma thousand separators to the integer part of a number.
 * @param {number|string} value
 * @returns {string}
 */
export function withCommas(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formats a balance for display with comma separators, plus a full-precision tooltip.
 * @param {string} balanceString - Balance as a decimal string
 * @param {number} [fullDecimals=18] - Decimals to show in the tooltip
 * @returns {{display: string, tooltip: string}}
 */
export function formatBalanceWithCommas(balanceString, fullDecimals = 18) {
  const balance = parseFloat(balanceString);
  if (isNaN(balance)) {
    return { display: balanceString, tooltip: balanceString };
  }

  // Display value (keep current decimals, add commas)
  const parts = String(balanceString).split('.');
  parts[0] = withCommas(parts[0]);
  const displayValue = parts.join('.');

  // Full precision value with commas
  const fullParts = balance.toFixed(fullDecimals).split('.');
  fullParts[0] = withCommas(fullParts[0]);
  const fullValue = fullParts.join('.');

  return {
    display: displayValue,
    tooltip: `Full precision: ${fullValue}`
  };
}
