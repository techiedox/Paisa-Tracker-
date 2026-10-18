import { CurrencyCode, NumberFormatType, DateFormatType } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AED: 'د.إ',
  CAD: 'CA$',
  AUD: 'A$',
};

/**
 * Converts standard unit (e.g. 150.50) to minor units (15050 paise/cents)
 */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts minor units (e.g. 15050 paise/cents) to standard float (150.50)
 */
export function fromMinorUnits(minorUnits: number): number {
  return minorUnits / 100;
}

/**
 * Format minor units into human-readable currency string
 */
export function formatCurrency(
  minorUnits: number,
  currency: CurrencyCode = 'INR',
  numberFormat: NumberFormatType = 'in',
  includeSymbol: boolean = true,
  hideZeroDecimals: boolean = false
): string {
  const standardValue = fromMinorUnits(minorUnits);
  const symbol = includeSymbol ? (CURRENCY_SYMBOLS[currency] || '₹') + ' ' : '';
  const isNegative = standardValue < 0;
  const absValue = Math.abs(standardValue);

  let formattedNumber = '';

  if (currency === 'INR' && numberFormat === 'in') {
    // Indian formatting (e.g. 12,34,567.89)
    const parts = absValue.toFixed(2).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    if (integerPart.length > 3) {
      const lastThree = integerPart.substring(integerPart.length - 3);
      const remaining = integerPart.substring(0, integerPart.length - 3);
      const withCommas = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
      integerPart = withCommas + ',' + lastThree;
    }

    if (hideZeroDecimals && decimalPart === '00') {
      formattedNumber = integerPart;
    } else {
      formattedNumber = `${integerPart}.${decimalPart}`;
    }
  } else {
    // Western formatting (e.g. 1,234,567.89)
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: hideZeroDecimals && absValue % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    };
    formattedNumber = absValue.toLocaleString('en-US', options);
  }

  return `${isNegative ? '-' : ''}${symbol}${formattedNumber}`;
}

/**
 * Format date string into user preferred format
 */
export function formatDate(dateString: string, format: DateFormatType = 'DD/MM/YYYY'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Format relative date (Today, Yesterday, or formatted date)
 */
export function formatRelativeDate(dateString: string, format: DateFormatType = 'DD/MM/YYYY'): string {
  if (!dateString) return '';
  const today = new Date();
  const date = new Date(dateString);
  
  const todayStr = today.toISOString().split('T')[0];
  const dateStr = date.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) {
    return 'Today';
  } else if (dateStr === yesterdayStr) {
    return 'Yesterday';
  } else {
    return formatDate(dateString, format);
  }
}

/**
 * Returns month string in 'YYYY-MM' format
 */
export function getMonthString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Returns human readable month name like "October 2026"
 */
export function getMonthDisplayName(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}
