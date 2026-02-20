import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { refundRequests, orders, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import { resolveRefundRequestSchema } from "@/lib/validations/order";
import {
  createErrorResponse,
  handleZodError,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";
import { invalidateNamespace } from "@/lib/cache";

/**
 * PATCH /api/admin/refund-requests/[id]
 * Approve or reject a refund request (admin only)
 *
 * On approval:
 * - If the order was paid via Stripe → issue Stripe refund
 * - Restore inventory
 * - Update order status to refunded
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { id } = await params;
    const requestId = Number(id);

    if (Number.isNaN(requestId)) {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: "Invalid refund request ID",
      });
    }

    const body = await request.json();

    const validation = resolveRefundRequestSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const { status, adminNotes } = validation.data;

    // Get the refund request
    const [refundRequest] = await db
      .select()
      .from(refundRequests)
      .where(eq(refundRequests.id, requestId))
      .limit(1);

    if (!refundRequest) {
      return createErrorResponse({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Refund request not found",
      });
    }

    // Only pending requests can be resolved
    if (refundRequest.status !== "pending") {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: `Refund request has already been ${refundRequest.status}`,
      });
    }

    // Get the associated order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, refundRequest.orderId))
      .limit(1);

    if (!order) {
      return createErrorResponse({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Associated order not found",
      });
    }

    const now = new Date().toISOString();

    // ── REJECTED ──
    if (status === "rejected") {
      const [updated] = await db
        .update(refundRequests)
        .set({
          status: "rejected",
          adminNotes: adminNotes || null,
          resolvedBy: authResult.userId,
          resolvedAt: now,
          updatedAt: now,
        })
        .where(eq(refundRequests.id, requestId))
        .returning();

      return NextResponse.json({
        refundRequest: updated,
        message: "Refund request rejected",
      });
    }

    // ── APPROVED ──
    let stripeRefundId: string | null = null;
    const refundAmount = Number.parseFloat(order.total);

    // If paid via Stripe, issue the refund through Stripe
    if (order.paymentMethod === "stripe" && order.stripePaymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          amount: Math.round(refundAmount * 100), // cents
          reason: "requested_by_customer",
        });

        stripeRefundId = refund.id;
        console.log(`✅ Stripe refund created: ${refund.id} for order ${order.orderNumber}`);
      } catch (stripeError) {
        console.error(`❌ Stripe refund failed for order ${order.orderNumber}:`, stripeError);
        return createErrorResponse({
          code: ErrorCode.EXTERNAL_SERVICE_ERROR,
          message: "Failed to process Stripe refund. Please try again.",
        });
      }
    }

    // Restore inventory
    const orderItems = order.items as Array<{
      productId: number;
      quantity: number;
    }>;

    for (const item of orderItems) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (product?.trackInventory) {
        await db
          .update(products)
          .set({
            stockQuantity: (product.stockQuantity || 0) + item.quantity,
            updatedAt: now,
          })
          .where(eq(products.id, item.productId));
      }
    }

    // Update order status
    await db
      .update(orders)
      .set({
        status: "refunded",
        paymentStatus: "refunded",
        notes: order.notes
          ? `${order.notes}\n\n[REFUND APPROVED] ${adminNotes || "Approved by admin"}`
          : `[REFUND APPROVED] ${adminNotes || "Approved by admin"}`,
        updatedAt: now,
      })
      .where(eq(orders.id, order.id));

    // Invalidate product cache after stock restoration
    await invalidateNamespace("products");

    // Update refund request
    const [updated] = await db
      .update(refundRequests)
      .set({
        status: "completed",
        adminNotes: adminNotes || null,
        resolvedBy: authResult.userId,
        stripeRefundId,
        refundAmount: refundAmount.toString(),
        resolvedAt: now,
        updatedAt: now,
      })
      .where(eq(refundRequests.id, requestId))
      .returning();

    return NextResponse.json({
      refundRequest: updated,
      stripeRefundId,
      refundAmount,
      inventoryRestored: true,
      message: "Refund approved and processed successfully",
    });
  } catch (error) {
    return handleUnexpectedError(error, "PATCH /api/admin/refund-requests/[id]");
  }
}
