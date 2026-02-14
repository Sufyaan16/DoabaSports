import { NextResponse, NextRequest } from "next/server";
import db from "@/db/index";
import { orders, products } from "@/db/schema";
import { desc, eq, sql, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { createOrderSchema } from "@/lib/validations/order";
import { getResend } from "@/lib/resend";
import OrderConfirmationEmail from "@/emails/order-confirmation";
import { requireAuth, requireAdmin } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import { calculateOrderPrices } from "@/lib/price-calculator";
import { TAX_RATE } from "@/lib/constants";
import {
  createErrorResponse,
  handleZodError,
  handleDatabaseError,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

// GET all orders (with pagination)
export async function GET(request: NextRequest) {
  // Protect route - admin only (viewing all orders)
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - moderate (60/min for admins)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    
    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return createErrorResponse({
        code: ErrorCode.INVALID_QUERY_PARAMS,
        message: "Invalid pagination parameters",
        details: { page: "Must be >= 1", limit: "Must be 1-100" },
      });
    }

    const offset = (page - 1) * limit;

    // Get total count (always exclude soft-deleted orders)
    const countCondition = status
      ? and(isNull(orders.deletedAt), eq(orders.status, status as any))
      : isNull(orders.deletedAt);

    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(countCondition);

    // Get paginated orders (exclude soft-deleted)
    const queryCondition = status
      ? and(isNull(orders.deletedAt), eq(orders.status, status as any))
      : isNull(orders.deletedAt);

    const allOrders = await db
      .select()
      .from(orders)
      .where(queryCondition)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      orders: allOrders,
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
    return handleUnexpectedError(error, "GET /api/orders");
  }
}

// POST new order
export async function POST(request: Request) {
  // Protect route - authenticated users can create orders
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - strict (10/min for creating orders)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const body = await request.json();

    // Validate request body shape
    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const validatedData = validationResult.data;

    // ========================================
    // SERVER-SIDE ORDER NUMBER GENERATION
    // Never trust client-generated order numbers!
    // ========================================
    const serverOrderNumber = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // ========================================
    // SERVER-SIDE PRICE RECALCULATION
    // NEVER trust client-provided prices!
    // ========================================
    const orderItems = validatedData.items.map(item => ({
      productId: item.productId!,
      quantity: item.quantity,
    }));

    const priceCalculation = await calculateOrderPrices(
      orderItems,
      TAX_RATE,
      validatedData.shippingCost
    );

    // Check if calculation failed
    if ("error" in priceCalculation) {
      // Map calculation errors to appropriate error codes
      const errorCode = priceCalculation.error.includes("not found")
        ? ErrorCode.PRODUCT_NOT_FOUND
        : priceCalculation.error.includes("stock")
        ? ErrorCode.PRODUCT_INSUFFICIENT_STOCK
        : ErrorCode.VALIDATION_FAILED;

      return createErrorResponse({
        code: errorCode,
        message: priceCalculation.error,
        details: priceCalculation.details,
      });
    }

    // Log price discrepancy for fraud detection
    const clientTotal = validatedData.total;
    const serverTotal = priceCalculation.total;
    if (Math.abs(clientTotal - serverTotal) > 0.01) {
      console.warn(
        "⚠️ Price mismatch detected!",
        {
          userId: authResult.userId,
          clientTotal,
          serverTotal,
          difference: clientTotal - serverTotal,
        }
      );
    }

    // Use SERVER-CALCULATED prices, not client prices
    const finalOrderData = {
      ...validatedData,
      orderNumber: serverOrderNumber, // Server-generated, not client
      userId: authResult.userId, // Track who placed this order
      items: priceCalculation.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      subtotal: priceCalculation.subtotal,
      tax: priceCalculation.tax,
      shippingCost: priceCalculation.shippingCost,
      total: priceCalculation.total,
    };

    // Check for order number uniqueness
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, serverOrderNumber))
      .limit(1);

    if (existingOrder.length > 0) {
      return createErrorResponse({
        code: ErrorCode.ORDER_ALREADY_EXISTS,
        details: { orderNumber: serverOrderNumber },
      });
    }

    try {
      // ========================================
      // Verify stock, insert order, then deduct stock
      // (neon-http driver does not support db.transaction())
      // ========================================

      // 1. Re-verify stock before inserting
      for (const item of finalOrderData.items) {
        if (item.productId) {
          const [product] = await db
            .select({
              id: products.id,
              stockQuantity: products.stockQuantity,
              trackInventory: products.trackInventory,
              name: products.name,
            })
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          if (product?.trackInventory) {
            const available = product.stockQuantity || 0;
            if (available < item.quantity) {
              return createErrorResponse({
                code: ErrorCode.PRODUCT_INSUFFICIENT_STOCK,
                message: `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${available}`,
              });
            }
          }
        }
      }

      // 2. Insert the order
      const [newOrder] = await db
        .insert(orders)
        .values({
          ...finalOrderData,
          subtotal: finalOrderData.subtotal.toString(),
          tax: finalOrderData.tax.toString(),
          shippingCost: finalOrderData.shippingCost.toString(),
          total: finalOrderData.total.toString(),
        })
        .returning();

      // 3. Deduct stock
      for (const item of finalOrderData.items) {
        if (item.productId) {
          await db
            .update(products)
            .set({
              stockQuantity: sql`GREATEST(0, ${products.stockQuantity} - ${item.quantity})`,
            })
            .where(eq(products.id, item.productId));
        }
      }

      // Send order confirmation email
      try {
        const resend = getResend();
        if (resend) {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'orders@yourdomain.com',
            to: validatedData.customerEmail,
            subject: `Order Confirmation - ${serverOrderNumber}`,
            react: OrderConfirmationEmail({
              customerName: validatedData.customerName,
              orderNumber: serverOrderNumber,
              orderDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              items: finalOrderData.items.map((item) => ({
                productName: item.productName,
                productImage: item.productImage,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
              })),
              subtotal: finalOrderData.subtotal,
              tax: finalOrderData.tax,
              shippingCost: finalOrderData.shippingCost,
              total: finalOrderData.total,
              shippingAddress: validatedData.shippingAddress,
              shippingCity: validatedData.shippingCity,
              shippingState: validatedData.shippingState,
              shippingZip: validatedData.shippingZip,
            }),
          });
          console.log('✅ Order confirmation email sent to:', validatedData.customerEmail);
        }
      } catch (emailError) {
        // Log email error but don't fail the order creation
        console.error('❌ Failed to send order confirmation email:', emailError);
      }

      return NextResponse.json(newOrder, { status: 201 });
    } catch (insertError: any) {
      // Handle database unique constraint violation for orderNumber
      if (insertError?.code === '23505' || insertError?.constraint?.includes('order_number')) {
        return createErrorResponse({
          code: ErrorCode.ORDER_ALREADY_EXISTS,
          details: { orderNumber: serverOrderNumber },
        });
      }
      throw insertError;
    }
  } catch (error) {
    // Check if it's a Zod error that somehow wasn't caught
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }
    
    // Check for database errors
    if (error && typeof error === "object" && "code" in error) {
      return handleDatabaseError(error, "POST /api/orders");
    }
    
    return handleUnexpectedError(error, "POST /api/orders");
  }
}
