import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Transform to frontend format
    const transformed = {
      id: product[0].id,
      name: product[0].name,
      company: product[0].company,
      category: product[0].category,
      image: {
        src: product[0].imageSrc,
        alt: product[0].imageAlt,
      },
      imageHover: product[0].imageHoverSrc ? {
        src: product[0].imageHoverSrc,
        alt: product[0].imageHoverAlt || `${product[0].name} - Alternate View`,
      } : undefined,
      description: product[0].description,
      price: {
        regular: parseFloat(product[0].priceRegular),
        sale: product[0].priceSale ? parseFloat(product[0].priceSale) : undefined,
        currency: product[0].priceCurrency,
      },
      badge: product[0].badgeText ? {
        text: product[0].badgeText,
        backgroundColor: product[0].badgeBackgroundColor || undefined,
      } : undefined,
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db
      .update(products)
      .set({
        name: body.name,
        company: body.company,
        category: body.category,
        imageSrc: body.imageSrc,
        imageAlt: body.imageAlt || body.name,
        imageHoverSrc: body.imageHoverSrc || null,
        imageHoverAlt: body.imageHoverAlt || null,
        description: body.description,
        priceRegular: body.priceRegular.toString(),
        priceSale: body.priceSale ? body.priceSale.toString() : null,
        priceCurrency: body.priceCurrency || "USD",
        badgeText: body.badgeText || null,
        badgeBackgroundColor: body.badgeBackgroundColor || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
