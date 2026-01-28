import { NextRequest, NextResponse } from "next/server";
import  db  from "@/db";
import { carts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";
import { z } from "zod";
import {
  updateCartSchema,
  updateCartItemSchema,
  MAX_CART_ITEMS,
  MAX_ITEM_QUANTITY,
} from "@/lib/validations/cart";
// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, user.id))
      .limit(1);

    if (userCart.length === 0) {
      // Create empty cart for user
      const [newCart] = await db
        .insert(carts)
        .values({ userId: user.id, items: [] })
        .returning();
      
      return NextResponse.json(newCart);
    }

    return NextResponse.json(userCart[0]);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST /api/cart - Update entire cart (for merging guest cart)
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = updateCartSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items } = validationResult.data;

    // Check if cart exists
    const existingCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, user.id))
      .limit(1);

    if (existingCart.length === 0) {
      // Create new cart
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: user.id,
          items: items || [],
        })
        .returning();
      
      return NextResponse.json(newCart);
    }

    // Update existing cart
    const [updatedCart] = await db
      .update(carts)
      .set({
        items: items || [],
        updatedAt: new Date().toISOString(),
      })
      .where(eq(carts.userId, user.id))
      .returning();

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Add/update item in cart
export async function PUT(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    // Validate request body
    const validationResult = updateCartItemSchema.safeParse({ productId, quantity });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Get current cart
    const existingCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, user.id))
      .limit(1);

    let currentItems = existingCart.length > 0 ? existingCart[0].items : [];

    // Update or add item
    const itemIndex = currentItems.findIndex((item: any) => item.productId === validatedData.productId);
    
    if (validatedData.quantity <= 0) {
      // Remove item if quantity is 0 or negative
      currentItems = currentItems.filter((item: any) => item.productId !== validatedData.productId);
    } else if (itemIndex >= 0) {
      // Update existing item
      currentItems[itemIndex] = { productId: validatedData.productId, quantity: validatedData.quantity };
    } else {
      // Add new item - check cart item limit
      if (currentItems.length >= MAX_CART_ITEMS) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: { items: [`Cart cannot contain more than ${MAX_CART_ITEMS} items`] },
          },
          { status: 400 }
        );
      }
      currentItems.push({ productId: validatedData.productId, quantity: validatedData.quantity });
    }

    if (existingCart.length === 0) {
      // Create new cart
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: user.id,
          items: currentItems,
        })
        .returning();
      
      return NextResponse.json(newCart);
    }

    // Update existing cart
    const [updatedCart] = await db
      .update(carts)
      .set({
        items: currentItems,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(carts.userId, user.id))
      .returning();

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE() {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [updatedCart] = await db
      .update(carts)
      .set({
        items: [],
        updatedAt: new Date().toISOString(),
      })
      .where(eq(carts.userId, user.id))
      .returning();

    if (!updatedCart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
