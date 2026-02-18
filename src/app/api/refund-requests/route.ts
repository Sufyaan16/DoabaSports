import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { refundRequests, orders } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import { createRefundRequestSchema } from "@/lib/validations/order";
import {
  createErrorResponse,
  handleZodError,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

/**
 * GET /api/refund-requests
 * List the current user's refund requests
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const userRequests = await db
      .select()
      .from(refundRequests)
      .where(eq(refundRequests.userId, authResult.userId))
      .orderBy(desc(refundRequests.createdAt));

    return NextResponse.json({ refundRequests: userRequests });
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/refund-requests");
  }
}

/**
 * POST /api/refund-requests
 * Submit a refund request for an order
 */
export async function POST(request: Request) {
  const authResult = await requireAuth();
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
    const body = await request.json();

    // Validate input
    const validation = createRefundRequestSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const { orderNumber, reason } = validation.data;

    // Find the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
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
        message: "You can only request refunds for your own orders",
      });
    }

    // Check if the order is eligible for refund
    if (order.paymentStatus !== "paid") {
      return createErrorResponse({
        code: ErrorCode.ORDER_NOT_PAID,
        message: `Cannot request refund: payment status is "${order.paymentStatus}"`,
      });
    }

    if (order.status === "refunded" || order.status === "cancelled") {
      return createErrorResponse({
        code: ErrorCode.ORDER_ALREADY_REFUNDED,
        message: "This order has already been refunded or cancelled",
      });
    }

    // Check if there's already a pending refund request for this order
    const [existingRequest] = await db
      .select()
      .from(refundRequests)
      .where(
        and(
          eq(refundRequests.orderId, order.id),
          eq(refundRequests.status, "pending")
        )
      )
      .limit(1);

    if (existingRequest) {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_DUPLICATE,
        message: "A refund request is already pending for this order",
      });
    }

    // Create the refund request
    const [newRequest] = await db
      .insert(refundRequests)
      .values({
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: authResult.userId,
        reason,
        status: "pending",
      })
      .returning();

    return NextResponse.json(
      {
        refundRequest: newRequest,
        message: "Refund request submitted successfully. Our team will review it shortly.",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleUnexpectedError(error, "POST /api/refund-requests");
  }
}
