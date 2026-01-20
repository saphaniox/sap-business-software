/**
 * Currency Utilities for SAP Business Management Software
 * Provides multi-currency support for international businesses
 */

// Supported currencies
export const CURRENCIES = [
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'UGX', position: 'before' },
  { code: 'USD', name: 'US Dollar', symbol: '$', position: 'before' },
  { code: 'EUR', name: 'Euro', symbol: '€', position: 'before' },
  { code: 'GBP', name: 'British Pound', symbol: '£', position: 'before' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KES', position: 'before' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TZS', position: 'before' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RWF', position: 'before' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', position: 'before' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', position: 'before' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', position: 'before' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', position: 'before' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', position: 'before' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', position: 'before' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', position: 'before' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', position: 'before' },
];

// Default currency
export const DEFAULT_CURRENCY = 'UGX';

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode) {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency ? currency.symbol : currencyCode;
}

/**
 * Get currency details
 */
export function getCurrencyDetails(currencyCode) {
  return CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
}

/**
 * Format amount with currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - Currency code (e.g., 'UGX', 'USD')
 * @param {boolean} includeSymbol - Whether to include currency symbol
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY, includeSymbol = true) {
  if (!amount && amount !== 0) return includeSymbol ? `${getCurrencySymbol(currencyCode)} 0` : '0';
  
  const currency = getCurrencyDetails(currencyCode);
  const formatted = Number(amount).toLocaleString();
  
  if (!includeSymbol) return formatted;
  
  // Special formatting for UGX and similar currencies
  if (['UGX', 'KES', 'TZS', 'RWF', 'AED', 'SAR'].includes(currencyCode)) {
    return `${currency.symbol} ${formatted}`;
  }
  
  // Default formatting for USD, EUR, etc.
  return `${currency.symbol}${formatted}`;
}

/**
 * Parse formatted currency string to number
 */
export function parseCurrency(currencyString) {
  if (typeof currencyString === 'number') return currencyString;
  if (!currencyString) return 0;
  
  // Remove currency symbols and spaces
  const cleaned = currencyString.toString().replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Get currency input placeholder
 */
export function getCurrencyPlaceholder(currencyCode = DEFAULT_CURRENCY) {
  const currency = getCurrencyDetails(currencyCode);
  
  if (['UGX', 'KES', 'TZS', 'RWF'].includes(currencyCode)) {
    return `${currency.symbol} 50,000`;
  } else if (currencyCode === 'USD') {
    return `${currency.symbol}100`;
  } else if (currencyCode === 'EUR') {
    return `${currency.symbol}100`;
  } else if (currencyCode === 'GBP') {
    return `${currency.symbol}100`;
  }
  
  return `${currency.symbol} 100`;
}

/**
 * Validate currency amount
 */
export function isValidAmount(amount) {
  if (!amount && amount !== 0) return false;
  const num = typeof amount === 'string' ? parseCurrency(amount) : amount;
  return !isNaN(num) && num >= 0;
}

export default {
  CURRENCIES,
  DEFAULT_CURRENCY,
  getCurrencySymbol,
  getCurrencyDetails,
  formatCurrency,
  parseCurrency,
  getCurrencyPlaceholder,
  isValidAmount
};
