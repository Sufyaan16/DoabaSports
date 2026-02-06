import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { wishlists } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";
import { requireAuth } from "@/lib/auth-helpers";

// GET - Check if product is in user's wishlist
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        isInWishlist: false,
      });
    }

    const userId = user.id;
    const { productId } = await params;
    const productIdNum = Number.parseInt(productId);

    if (Number.isNaN(productIdNum)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const wishlistItem = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.productId, productIdNum)
        )
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      isInWishlist: wishlistItem.length > 0,
      wishlistId: wishlistItem[0]?.id || null,
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json(
      { error: "Failed to check wishlist" },
      { status: 500 }
    );
  }
}
