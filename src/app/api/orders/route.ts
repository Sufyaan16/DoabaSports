import { NextResponse } from "next/server";
import db from "@/db/index";
import { orders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createOrderSchema } from "@/lib/validations/order";

// GET all orders
export async function GET() {
  try {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    return NextResponse.json(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST new order
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createOrderSchema.safeParse(body);
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

    // Check for order number uniqueness
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, validatedData.orderNumber))
      .limit(1);

    if (existingOrder.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: { orderNumber: ["Order number already exists"] },
        },
        { status: 400 }
      );
    }

    try {
      const newOrder = await db
        .insert(orders)
        .values({
          ...validatedData,
          subtotal: validatedData.subtotal.toString(),
          tax: validatedData.tax.toString(),
          shippingCost: validatedData.shippingCost.toString(),
          total: validatedData.total.toString(),
        })
        .returning();

      return NextResponse.json(newOrder[0], { status: 201 });
    } catch (insertError: any) {
      // Handle database unique constraint violation for orderNumber
      if (insertError?.code === '23505' || insertError?.constraint?.includes('order_number')) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: { orderNumber: ["Order number already exists"] },
          },
          { status: 400 }
        );
      }
      throw insertError;
    }
  } catch (error) {
    console.error("Error creating order:", error);
    
    // Check if it's a Zod error that somehow wasn't caught
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
