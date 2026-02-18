import Stripe from "stripe";

/**
 * Stripe SDK singleton — reused across all server-side API routes.
 *
 * Requires STRIPE_SECRET_KEY in environment variables.
 * The publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) is used client-side only.
 */

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});
