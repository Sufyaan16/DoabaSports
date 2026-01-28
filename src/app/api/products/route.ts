import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { createProductSchema, productQuerySchema } from "@/lib/validations/product";
import { ZodError } from "zod";

// GET all products (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validate query parameters
    const queryValidation = productQuerySchema.safeParse({
      category: searchParams.get("category") || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    if (!queryValidation.success) {
      const errors = queryValidation.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Invalid query parameters", details: errors },
        { status: 400 }
      );
    }

    const { category } = queryValidation.data;

    let query = db.select().from(products);

    // Apply category filter if provided
    if (category) {
      query = query.where(eq(products.category, category)) as any;
    }

    const allProducts = await query.orderBy(desc(products.createdAt));

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

    // Validate request body
    const validated = createProductSchema.safeParse(body);
    
    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const validatedData = validated.data;

    const newProduct = await db
      .insert(products)
      .values({
        name: validatedData.name,
        company: validatedData.company,
        category: validatedData.category,
        imageSrc: validatedData.imageSrc,
        imageAlt: validatedData.imageAlt,
        imageHoverSrc: validatedData.imageHoverSrc || null,
        imageHoverAlt: validatedData.imageHoverAlt || null,
        description: validatedData.description,
        priceRegular: validatedData.priceRegular.toString(),
        priceSale: validatedData.priceSale ? validatedData.priceSale.toString() : null,
        priceCurrency: validatedData.priceCurrency,
        badgeText: validatedData.badgeText || null,
        badgeBackgroundColor: validatedData.badgeBackgroundColor || null,
      })
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
