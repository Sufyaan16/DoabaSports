const formatterCache = new Map<string, Intl.NumberFormat>();

/**
 * Format a number as currency using Intl.NumberFormat.
 * Caches formatters for performance.
 *
 * @example formatCurrency(599)       // "$599.00"
 * @example formatCurrency(599, "EUR") // "€599.00"
 */
export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US",
) {
  const key = `${locale}-${currency}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(locale, { style: "currency", currency }),
    );
  }
  return formatterCache.get(key)!.format(value);
}
