import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import db from "@/db/index";
import { orders, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getResend } from "@/lib/resend";
import OrderConfirmationEmail from "@/emails/order-confirmation";
import { invalidateNamespace } from "@/lib/cache";
import { Redis } from "@upstash/redis";
import type Stripe from "stripe";

/**
 * Stripe Webhook Handler
 *
 * Receives events from Stripe and updates order state accordingly.
 * CRITICAL: This route must receive the raw body for signature verification.
 *
 * Events handled:
 * - checkout.session.completed → Mark order paid, deduct stock, send email
 * - checkout.session.expired   → Mark order failed, clean up
 */

// Disable Next.js body parsing — we need the raw body for Stripe signature verification
export const dynamic = "force-dynamic";

// Redis-backed webhook dedup (works across serverless instances)
let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

/**
 * Check if a webhook event has already been processed.
 * Uses Redis SET NX with 48h TTL — returns true if this is a NEW event.
 */
async function markEventProcessed(eventId: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return true; // If Redis unavailable, allow processing (DB-level check is the fallback)
  try {
    // SET NX returns "OK" if key was set (new event), null if key already exists (duplicate)
    const result = await r.set(`stripe:webhook:${eventId}`, "1", { nx: true, ex: 48 * 60 * 60 });
    return result === "OK";
  } catch {
    return true; // Fail open — DB-level idempotency check is the backstop
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ Stripe webhook: Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("❌ Stripe webhook: STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Stripe webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  console.log(`📨 Stripe webhook received: ${event.type} (${event.id})`);

  // Check for duplicate events using Redis (works across serverless instances)
  const isNewEvent = await markEventProcessed(event.id);
  if (!isNewEvent) {
    console.log(`ℹ️ Duplicate webhook event ${event.id} — skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`❌ Stripe webhook handler error for ${event.type}:`, error);
    // Return 200 anyway — Stripe retries on 5xx, and we don't want infinite retries
    // for bugs in our handler logic. The error is logged for investigation.
    return NextResponse.json({ received: true, error: "Handler error logged" });
  }

  return NextResponse.json({ received: true });
}

/**
 * Handle successful checkout — mark order paid, deduct stock, send confirmation email
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const orderNumber = session.metadata?.orderNumber;

  if (!orderId) {
    console.error("❌ checkout.session.completed: Missing orderId in metadata");
    return;
  }

  // Fetch the order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number.parseInt(orderId)))
    .limit(1);

  if (!order) {
    console.error(`❌ checkout.session.completed: Order ${orderId} not found`);
    return;
  }

  // Idempotency check — don't process twice
  if (order.paymentStatus === "paid") {
    console.log(`ℹ️ Order ${orderNumber} already marked as paid — skipping`);
    return;
  }

  // Update order with payment confirmation
  await db
    .update(orders)
    .set({
      paymentStatus: "paid",
      stripePaymentIntentId: session.payment_intent as string,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, order.id));

  console.log(`✅ Order ${orderNumber} marked as paid`);

  // Deduct stock
  const items = order.items as Array<{
    productId: number;
    productName: string;
    quantity: number;
  }>;

  for (const item of items) {
    if (item.productId) {
      await db
        .update(products)
        .set({
          stockQuantity: sql`GREATEST(0, ${products.stockQuantity} - ${item.quantity})`,
        })
        .where(eq(products.id, item.productId));
    }
  }

  console.log(`✅ Stock deducted for order ${orderNumber}`);

  // Invalidate product cache after stock deduction
  await invalidateNamespace("products");

  // Send confirmation email
  try {
    const resend = getResend();
    if (resend) {
      const orderItems = order.items as Array<{
        productName: string;
        productImage: string;
        quantity: number;
        price: number;
        total: number;
      }>;

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "orders@yourdomain.com",
        to: order.customerEmail,
        subject: `Payment Confirmed - ${order.orderNumber}`,
        react: OrderConfirmationEmail({
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          orderDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          items: orderItems.map((item) => ({
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          subtotal: Number.parseFloat(order.subtotal),
          tax: Number.parseFloat(order.tax),
          shippingCost: Number.parseFloat(order.shippingCost),
          total: Number.parseFloat(order.total),
          shippingAddress: order.shippingAddress,
          shippingCity: order.shippingCity,
          shippingState: order.shippingState,
          shippingZip: order.shippingZip,
        }),
      });
      console.log(`✅ Confirmation email sent for order ${orderNumber}`);
    }
  } catch (emailError) {
    console.error(`❌ Failed to send confirmation email for order ${orderNumber}:`, emailError);
  }
}

/**
 * Handle expired checkout session — mark order as failed
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const orderNumber = session.metadata?.orderNumber;

  if (!orderId) {
    console.error("❌ checkout.session.expired: Missing orderId in metadata");
    return;
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number.parseInt(orderId)))
    .limit(1);

  if (!order) {
    console.error(`❌ checkout.session.expired: Order ${orderId} not found`);
    return;
  }

  // Only update if still awaiting — don't overwrite paid/refunded orders
  if (order.paymentStatus !== "awaiting") {
    console.log(`ℹ️ Order ${orderNumber} payment status is "${order.paymentStatus}" — skipping expiry`);
    return;
  }

  await db
    .update(orders)
    .set({
      paymentStatus: "failed",
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, order.id));

  console.log(`⏰ Order ${orderNumber} expired — marked as cancelled/failed`);
}
