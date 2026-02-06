import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { wishlists } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";
import { requireAuth, isOwnerOrAdmin } from "@/lib/auth-helpers";

// DELETE - Remove product from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  const userId = authResult.userId;

  try {
    const { id } = await params;
    const wishlistId = Number.parseInt(id);

    if (Number.isNaN(wishlistId)) {
      return NextResponse.json(
        { error: "Invalid wishlist item ID" },
        { status: 400 }
      );
    }

    // Delete from wishlist (only if it belongs to the user)
    const deleted = await db
      .delete(wishlists)
      .where(and(eq(wishlists.id, wishlistId), eq(wishlists.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Wishlist item not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
