import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { wishlists, products } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";

// GET - Fetch user's wishlist
export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Fetch wishlist with product details
    const userWishlist = await db
      .select({
        wishlist: wishlists,
        product: products,
      })
      .from(wishlists)
      .leftJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.addedAt));

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
          imageHover: item.product.imageHoverSrc ? {
            src: item.product.imageHoverSrc,
            alt: item.product.imageHoverAlt || `${item.product.name} - Alternate View`,
          } : undefined,
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
          sku: item.product.sku || undefined,
          stockQuantity: item.product.stockQuantity || 0,
          lowStockThreshold: item.product.lowStockThreshold || 10,
          trackInventory: item.product.trackInventory !== false,
        } : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST - Add product to wishlist
export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userId = user.id;
    
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Malformed JSON in request body" },
        { status: 400 }
      );
    }
    
    const { productId, notes } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Product already in wishlist" },
        { status: 409 }
      );
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
        
        return NextResponse.json(
          { error: "Product already in wishlist", data: existingItem },
          { status: 409 }
        );
      }
      throw insertError;
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}
