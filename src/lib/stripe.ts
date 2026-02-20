import Stripe from "stripe";

/**
 * Lazy Stripe singleton — only instantiated when first called.
 *
 * Requires STRIPE_SECRET_KEY in environment variables.
 * The publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) is used client-side only.
 */

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}
