import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET all products
export async function GET() {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    // Transform database products to match frontend format
    const transformedProducts = allProducts.map((product) => ({
      id: product.id,
      name: product.name,
      company: product.company,
      category: product.category,
      image: {
        src: product.imageSrc,
        alt: product.imageAlt,
      },
      imageHover: product.imageHoverSrc ? {
        src: product.imageHoverSrc,
        alt: product.imageHoverAlt || `${product.name} - Alternate View`,
      } : undefined,
      description: product.description,
      price: {
        regular: parseFloat(product.priceRegular),
        sale: product.priceSale ? parseFloat(product.priceSale) : undefined,
        currency: product.priceCurrency,
      },
      badge: product.badgeText ? {
        text: product.badgeText,
        backgroundColor: product.badgeBackgroundColor || undefined,
      } : undefined,
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProduct = await db
      .insert(products)
      .values({
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
      })
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
