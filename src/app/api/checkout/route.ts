import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import db from "@/db/index";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import {
  createErrorResponse,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for an existing order.
 * The order must already exist (created via POST /api/orders with paymentMethod: "stripe")
 * and must have paymentStatus = "awaiting".
 *
 * Body: { orderId: number }
 * Returns: { sessionId: string, url: string }
 */
export async function POST(request: Request) {
  // Auth check
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== "number") {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: "orderId is required and must be a number",
      });
    }

    // Fetch the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return createErrorResponse({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Order not found",
      });
    }

    // Verify ownership
    if (order.userId !== authResult.userId) {
      return createErrorResponse({
        code: ErrorCode.ORDER_ACCESS_DENIED,
        message: "You are not authorized to pay for this order",
      });
    }

    // Only allow checkout for orders awaiting payment
    if (order.paymentStatus !== "awaiting") {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: `Cannot create checkout session: payment status is "${order.paymentStatus}"`,
      });
    }

    // Prevent creating duplicate sessions — if a session already exists, reuse it
    if (order.stripeSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        // If session is still open, return it
        if (existingSession.status === "open") {
          return NextResponse.json({
            sessionId: existingSession.id,
            url: existingSession.url,
          });
        }
        // Otherwise session expired — create a new one below
      } catch {
        // Session retrieval failed — create a new one
      }
    }

    // Build line items from order items
    const items = order.items as Array<{
      productId: number;
      productName: string;
      productImage: string;
      quantity: number;
      price: number;
      total: number;
    }>;

    const lineItems = items.map((item) => ({
      price_data: {
        currency: order.currency.toLowerCase(),
        product_data: {
          name: item.productName,
          images: item.productImage ? [item.productImage] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item
    const shippingCost = Number.parseFloat(order.shippingCost);
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: "Shipping",
            images: [],
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item
    const taxAmount = Number.parseFloat(order.tax);
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: "Tax",
            images: [],
          },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: order.customerEmail,
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
        userId: authResult.userId,
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${order.orderNumber}`,
      cancel_url: `${appUrl}/checkout/cancel?order=${order.orderNumber}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min expiry
    });

    // Save session ID to order
    await db
      .update(orders)
      .set({
        stripeSessionId: session.id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orders.id, order.id));

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return handleUnexpectedError(error, "POST /api/checkout");
  }
}
