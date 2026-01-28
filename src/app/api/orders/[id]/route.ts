import { NextResponse } from "next/server";
import db from "@/db/index";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { updateOrderSchema } from "@/lib/validations/order";

// GET single order by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(id)))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order[0]);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT update order (status, tracking, etc.)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = updateOrderSchema.safeParse(body);
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

    const updatedOrder = await db
      .update(orders)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orders.id, Number(id)))
      .returning();

    if (!updatedOrder || updatedOrder.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder[0]);
  } catch (error) {
    console.error("Error updating order:", error);
    
    // Check if it's a Zod error
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
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedOrder = await db
      .delete(orders)
      .where(eq(orders.id, Number(id)))
      .returning();

    if (!deletedOrder || deletedOrder.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
