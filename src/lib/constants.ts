/**
 * Shared business constants — single source of truth
 * Used by both client (checkout UI) and server (price calculator, order API)
 */

/** Tax rate applied to order subtotals (8% = 0.08) */
export const TAX_RATE = 0.08;

/** Human-readable tax label for UI display */
export const TAX_LABEL = "Tax (8%)";

/** Flat shipping cost in USD (0 if cart is empty) */
export const SHIPPING_COST = 15;

/** Default currency code */
export const CURRENCY = "USD";

/** Default shipping country */
export const SHIPPING_COUNTRY = "USA";

/** Available payment methods */
export const PAYMENT_METHODS = ["cod", "stripe"] as const;
export type PaymentMethodType = (typeof PAYMENT_METHODS)[number];

/** Default payment method */
export const DEFAULT_PAYMENT_METHOD: PaymentMethodType = "cod";
