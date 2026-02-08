import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { orders } from "@/db/schema";
import { desc, eq, and, or, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import {
  createErrorResponse,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

/**
 * GET /api/orders/my-orders
 * Fetch orders for the currently authenticated user
 */
export async function GET(request: NextRequest) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - moderate (60/min for viewing own orders)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const user = authResult.user;

    // Match orders by userId (new orders) OR by email (legacy orders)
    // Also exclude soft-deleted orders
    const userOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          isNull(orders.deletedAt),
          or(
            eq(orders.userId, authResult.userId),
            user?.primaryEmail
              ? eq(orders.customerEmail, user.primaryEmail)
              : undefined
          )
        )
      )
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      orders: userOrders,
      count: userOrders.length,
    });
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/orders/my-orders");
  }
}
