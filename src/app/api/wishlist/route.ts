import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { wishlists, products } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import { handleUnexpectedError, createErrorResponse, handleZodError, ErrorCode } from "@/lib/errors";
import { addToWishlistSchema } from "@/lib/validations/wishlist";

// GET - Fetch user's wishlist (with pagination)
export async function GET(req: NextRequest) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - moderate (60/min)
  const ipAddress = getIpAddress(req);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  const userId = authResult.userId;

  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (page < 1 || limit < 1 || limit > 50) {
      return createErrorResponse({
        code: ErrorCode.INVALID_QUERY_PARAMS,
        message: "Invalid pagination parameters",
        details: { page: "Must be >= 1", limit: "Must be 1-50" },
      });
    }

    const offset = (page - 1) * limit;

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishlists)
      .where(eq(wishlists.userId, userId));

    // Fetch paginated wishlist with product details
    const userWishlist = await db
      .select({
        wishlist: wishlists,
        product: products,
      })
      .from(wishlists)
      .leftJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.addedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: userWishlist.map((item: { wishlist: typeof wishlists.$inferSelect; product: typeof products.$inferSelect | null }) => ({
        id: item.wishlist.id,
        productId: item.wishlist.productId,
        addedAt: item.wishlist.addedAt,
        notes: item.wishlist.notes,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          company: item.product.company,
          category: item.product.category,
          image: {
            src: item.product.imageSrc,
            alt: item.product.imageAlt,
          },
          description: item.product.description,
          price: {
            regular: item.product.priceRegular && !isNaN(parseFloat(item.product.priceRegular)) ? parseFloat(item.product.priceRegular) : 0,
            sale: item.product.priceSale && !isNaN(parseFloat(item.product.priceSale)) ? parseFloat(item.product.priceSale) : undefined,
            currency: item.product.priceCurrency,
          },
          badge: item.product.badgeText ? {
            text: item.product.badgeText,
            backgroundColor: item.product.badgeBackgroundColor || undefined,
          } : undefined,
          gallery: (item.product.galleryImages as string[]) || [],
          sku: item.product.sku || undefined,
          stockQuantity: item.product.stockQuantity || 0,
          lowStockThreshold: item.product.lowStockThreshold || 10,
          trackInventory: item.product.trackInventory !== false,
        } : null,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/wishlist");
  }
}

// POST - Add product to wishlist
export async function POST(req: NextRequest) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - strict (10/min for mutations)
  const ipAddress = getIpAddress(req);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  const userId = authResult.userId;

  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return createErrorResponse({
        code: ErrorCode.MALFORMED_JSON,
        message: "Malformed JSON in request body",
      });
    }
    
    // Validate request body with Zod
    const validationResult = addToWishlistSchema.safeParse(body);
    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const { productId, notes } = validationResult.data;

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return createErrorResponse({
        code: ErrorCode.PRODUCT_NOT_FOUND,
      });
    }

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlists)
      .where(
        and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
      )
      .limit(1);

    if (existing.length > 0) {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_DUPLICATE,
        message: "Product already in wishlist",
      });
    }

    // Add to wishlist
    try {
      const [newWishlistItem] = await db
        .insert(wishlists)
        .values({
          userId,
          productId,
          notes: notes || null,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: "Added to wishlist",
        data: newWishlistItem,
      });
    } catch (insertError: any) {
      // Check for unique constraint violation
      if (insertError.code === '23505' || insertError.constraint?.includes('unique')) {
        // Fetch and return the existing wishlist item
        const [existingItem] = await db
          .select()
          .from(wishlists)
          .where(
            and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
          )
          .limit(1);
        
        return createErrorResponse({
          code: ErrorCode.VALIDATION_DUPLICATE,
          message: "Product already in wishlist",
          details: { existingItem },
        });
      }
      throw insertError;
    }
  } catch (error) {
    return handleUnexpectedError(error, "POST /api/wishlist");
  }
}
