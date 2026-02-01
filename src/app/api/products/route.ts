import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { products } from "@/db/schema";
import { desc, eq, sql, like, or, and, SQL } from "drizzle-orm";
import { createProductSchema, productQuerySchema } from "@/lib/validations/product";
import { ZodError } from "zod";

// GET all products (with pagination and filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validate query parameters
    const queryValidation = productQuerySchema.safeParse({
      category: searchParams.get("category") || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 12,
      sortBy: searchParams.get("sortBy") || "newest",
    });

    if (!queryValidation.success) {
      const errors = queryValidation.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Invalid query parameters", details: errors },
        { status: 400 }
      );
    }

    const { category, search, page, limit, sortBy } = queryValidation.data;
    
    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: SQL[] = [];
    
    if (category) {
      conditions.push(eq(products.category, category));
    }
    
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.company, `%${search}%`),
          like(products.description, `%${search}%`)
        )!
      );
    }

    // Build order by clause based on sortBy
    let orderByClause;
    switch (sortBy) {
      case "price-low":
        orderByClause = sql`CAST(${products.priceRegular} AS DECIMAL) ASC`;
        break;
      case "price-high":
        orderByClause = sql`CAST(${products.priceRegular} AS DECIMAL) DESC`;
        break;
      case "name-asc":
        orderByClause = sql`${products.name} ASC`;
        break;
      case "name-desc":
        orderByClause = sql`${products.name} DESC`;
        break;
      case "newest":
      default:
        orderByClause = desc(products.id);
        break;
    }

    // Get total count for pagination
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    // Get paginated products
    const allProducts = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

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
      // Inventory Management
      sku: product.sku || undefined,
      stockQuantity: product.stockQuantity || 0,
      lowStockThreshold: product.lowStockThreshold || 10,
      trackInventory: product.trackInventory !== false,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      }
    });
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
        // Inventory Management
        sku: validatedData.sku || null,
        stockQuantity: validatedData.stockQuantity || 0,
        lowStockThreshold: validatedData.lowStockThreshold || 10,
        trackInventory: validatedData.trackInventory !== false,
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
