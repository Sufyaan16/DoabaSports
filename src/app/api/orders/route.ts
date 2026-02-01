import { NextResponse } from "next/server";
import db from "@/db/index";
import { orders, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createOrderSchema } from "@/lib/validations/order";
import { resend } from "@/lib/resend";
import OrderConfirmationEmail from "@/emails/order-confirmation";

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

    // Check stock availability for all items
    for (const item of validatedData.items) {
      if (item.productId) {
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product && product.trackInventory) {
          const currentStock = product.stockQuantity || 0;
          if (currentStock < item.quantity) {
            return NextResponse.json(
              {
                error: "Insufficient stock",
                details: {
                  productName: item.productName,
                  requested: item.quantity,
                  available: currentStock,
                },
              },
              { status: 400 }
            );
          }
        }
      }
    }

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

      // Deduct stock for each item
      for (const item of validatedData.items) {
        if (item.productId) {
          const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          if (product && product.trackInventory) {
            const newStockQuantity = (product.stockQuantity || 0) - item.quantity;
            await db
              .update(products)
              .set({ stockQuantity: Math.max(0, newStockQuantity) })
              .where(eq(products.id, item.productId));
          }
        }
      }

      // Send order confirmation email
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'orders@yourdomain.com',
          to: validatedData.customerEmail,
          subject: `Order Confirmation - ${validatedData.orderNumber}`,
          react: OrderConfirmationEmail({
            customerName: validatedData.customerName,
            orderNumber: validatedData.orderNumber,
            orderDate: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            items: validatedData.items.map((item) => ({
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
            subtotal: validatedData.subtotal,
            tax: validatedData.tax,
            shippingCost: validatedData.shippingCost,
            total: validatedData.total,
            shippingAddress: validatedData.shippingAddress,
            shippingCity: validatedData.shippingCity,
            shippingState: validatedData.shippingState,
            shippingZip: validatedData.shippingZip,
          }),
        });
        console.log('✅ Order confirmation email sent to:', validatedData.customerEmail);
      } catch (emailError) {
        // Log email error but don't fail the order creation
        console.error('❌ Failed to send order confirmation email:', emailError);
      }

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
