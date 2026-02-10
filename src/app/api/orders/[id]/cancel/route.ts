import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { orders, products } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import {
  createErrorResponse,
  createSuccessResponse,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

/**
 * POST /api/orders/[id]/cancel
 * Cancel an order (user can cancel their own pending/processing orders, admin can cancel any)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - strict (10/min for mutations)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { id } = await params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return createErrorResponse({
        code: ErrorCode.INVALID_ORDER_ID,
        message: "Invalid order ID",
      });
    }

    // Get the order (exclude soft-deleted)
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), isNull(orders.deletedAt)))
      .limit(1);

    if (!order) {
      return createErrorResponse({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Order not found",
      });
    }

    // Ownership check: customers can only cancel their own orders
    // Admins can cancel any order
    if (authResult.role !== "admin") {
      const isOwner =
        order.userId === authResult.userId ||
        order.customerEmail === authResult.user?.primaryEmail;

      if (!isOwner) {
        return createErrorResponse({
          code: ErrorCode.ORDER_ACCESS_DENIED,
          message: "You do not have permission to cancel this order",
        });
      }
    }

    // Check if order can be cancelled
    // Orders can only be cancelled if they are pending or processing
    if (!["pending", "processing"].includes(order.status)) {
      return createErrorResponse({
        code: ErrorCode.ORDER_CANNOT_BE_CANCELLED,
        message: `Order cannot be cancelled. Current status: ${order.status}`,
        details: {
          status: order.status,
          reason: "Only pending or processing orders can be cancelled",
        },
      });
    }

    // Check if already cancelled
    if (order.status === "cancelled") {
      return createErrorResponse({
        code: ErrorCode.ORDER_ALREADY_CANCELLED,
        message: "Order is already cancelled",
      });
    }

    // Always restore inventory on cancel — stock was deducted at order creation
    // regardless of payment status
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

      if (product && product.trackInventory) {
        await db
          .update(products)
          .set({
            stockQuantity: (product.stockQuantity || 0) + item.quantity,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(products.id, item.productId));
      }
    }

    // Update order status to cancelled
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return createSuccessResponse(
      {
        order: updatedOrder,
        message: "Order cancelled successfully",
        inventoryRestored: true,
      },
      { message: "Order cancelled successfully" }
    );
  } catch (error) {
    return handleUnexpectedError(error, "POST /api/orders/[id]/cancel");
  }
}
