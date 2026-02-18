import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { refundRequests, orders } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import {
  createErrorResponse,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

/**
 * GET /api/admin/refund-requests
 * List all refund requests (admin only)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
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
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // pending, approved, rejected, completed
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    // Build condition
    const condition = status ? eq(refundRequests.status, status) : undefined;

    // Count
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(refundRequests)
      .where(condition);

    // Get requests with order info
    const requests = await db
      .select({
        id: refundRequests.id,
        orderId: refundRequests.orderId,
        orderNumber: refundRequests.orderNumber,
        userId: refundRequests.userId,
        reason: refundRequests.reason,
        status: refundRequests.status,
        adminNotes: refundRequests.adminNotes,
        resolvedBy: refundRequests.resolvedBy,
        stripeRefundId: refundRequests.stripeRefundId,
        refundAmount: refundRequests.refundAmount,
        createdAt: refundRequests.createdAt,
        updatedAt: refundRequests.updatedAt,
        resolvedAt: refundRequests.resolvedAt,
        // Order details
        orderTotal: orders.total,
        orderStatus: orders.status,
        orderPaymentStatus: orders.paymentStatus,
        orderPaymentMethod: orders.paymentMethod,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
      })
      .from(refundRequests)
      .leftJoin(orders, eq(refundRequests.orderId, orders.id))
      .where(condition)
      .orderBy(desc(refundRequests.createdAt))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      refundRequests: requests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/admin/refund-requests");
  }
}
