import { NextResponse } from "next/server";
import db from "@/db/index";
import { orders, products } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { updateOrderSchema } from "@/lib/validations/order";
import { requireAuth, requireAdmin } from "@/lib/auth-helpers";
import {
  createErrorResponse,
  createSuccessResponse,
  handleZodError,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

// GET single order by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route - authenticated users can view their own orders
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
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

    // Only fetch non-deleted orders
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

    // Ownership check: customers can only view their own orders
    // Admins can view any order
    if (authResult.role !== "admin") {
      const isOwner =
        order.userId === authResult.userId ||
        order.customerEmail === authResult.user?.primaryEmail;

      if (!isOwner) {
        return createErrorResponse({
          code: ErrorCode.ORDER_ACCESS_DENIED,
          message: "You do not have permission to view this order",
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/orders/[id]");
  }
}

// PUT update order (status, tracking, etc.) - Admin only
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route - admin only (updating order status)
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
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

    const body = await request.json();

    // Validate request body
    const validationResult = updateOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const validatedData = validationResult.data;

    // Only update non-deleted orders
    const updatedOrder = await db
      .update(orders)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(orders.id, orderId), isNull(orders.deletedAt)))
      .returning();

    if (!updatedOrder || updatedOrder.length === 0) {
      return createErrorResponse({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Order not found",
      });
    }

    return createSuccessResponse(updatedOrder[0], {
      message: "Order updated successfully",
    });
  } catch (error) {
    return handleUnexpectedError(error, "PUT /api/orders/[id]");
  }
}

// DELETE order - Soft delete + restore stock
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route - admin only
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
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

    // Get the order first to check if it exists and is not already deleted
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

    // Prevent deleting delivered + paid orders (financial records)
    if (order.status === "delivered" && order.paymentStatus === "paid") {
      return createErrorResponse({
        code: ErrorCode.ORDER_CANNOT_BE_DELETED,
        message: "Delivered and paid orders cannot be deleted. Use refund instead.",
        details: { status: order.status, paymentStatus: order.paymentStatus },
      });
    }

    // Restore stock for non-cancelled/non-refunded orders
    if (!["cancelled", "refunded"].includes(order.status)) {
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
    }

    // Soft-delete: set deletedAt instead of removing from DB
    const [deletedOrder] = await db
      .update(orders)
      .set({
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: order.notes
          ? `${order.notes}\n\n[DELETED] Soft-deleted by admin ${authResult.userId}`
          : `[DELETED] Soft-deleted by admin ${authResult.userId}`,
      })
      .where(eq(orders.id, orderId))
      .returning();

    return createSuccessResponse(
      {
        message: "Order deleted successfully",
        orderId: deletedOrder.id,
        orderNumber: deletedOrder.orderNumber,
        stockRestored: !["cancelled", "refunded"].includes(order.status),
      },
      { message: "Order deleted successfully" }
    );
  } catch (error) {
    return handleUnexpectedError(error, "DELETE /api/orders/[id]");
  }
}
