import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateProductSchema } from "@/lib/validations/product";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  createErrorResponse,
  handleZodError,
  handleDatabaseError,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";
import { getOrSet, CACHE_TTL, deleteFromCache, invalidateNamespace } from "@/lib/cache";

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to get from cache
    const product = await getOrSet(
      "products",
      `detail:${id}`,
      async () => {
        const result = await db
          .select()
          .from(products)
          .where(eq(products.id, parseInt(id)))
          .limit(1);
        
        return result;
      },
      CACHE_TTL.PRODUCT_DETAIL
    );

    if (product.length === 0) {
      return createErrorResponse({
        code: ErrorCode.PRODUCT_NOT_FOUND,
      });
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
      // Inventory Management
      sku: product[0].sku || undefined,
      stockQuantity: product[0].stockQuantity || 0,
      lowStockThreshold: product[0].lowStockThreshold || 10,
      trackInventory: product[0].trackInventory !== false,
    };

    return NextResponse.json(transformed);
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/products/[id]");
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route - admin only
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validated = updateProductSchema.safeParse(body);
    
    if (!validated.success) {
      return handleZodError(validated.error);
    }

    const validatedData = validated.data;

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.company !== undefined) updateData.company = validatedData.company;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.imageSrc !== undefined) updateData.imageSrc = validatedData.imageSrc;
    if (validatedData.imageAlt !== undefined) updateData.imageAlt = validatedData.imageAlt;
    if (validatedData.imageHoverSrc !== undefined) updateData.imageHoverSrc = validatedData.imageHoverSrc || null;
    if (validatedData.imageHoverAlt !== undefined) updateData.imageHoverAlt = validatedData.imageHoverAlt || null;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.priceRegular !== undefined) updateData.priceRegular = validatedData.priceRegular.toString();
    if (validatedData.priceSale !== undefined) updateData.priceSale = validatedData.priceSale ? validatedData.priceSale.toString() : null;
    if (validatedData.priceCurrency !== undefined) updateData.priceCurrency = validatedData.priceCurrency;
    if (validatedData.badgeText !== undefined) updateData.badgeText = validatedData.badgeText || null;
    if (validatedData.badgeBackgroundColor !== undefined) updateData.badgeBackgroundColor = validatedData.badgeBackgroundColor || null;
    // Inventory Management
    if (validatedData.sku !== undefined) updateData.sku = validatedData.sku || null;
    if (validatedData.stockQuantity !== undefined) updateData.stockQuantity = validatedData.stockQuantity;
    if (validatedData.lowStockThreshold !== undefined) updateData.lowStockThreshold = validatedData.lowStockThreshold;
    if (validatedData.trackInventory !== undefined) updateData.trackInventory = validatedData.trackInventory;

    const updated = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return createErrorResponse({
        code: ErrorCode.PRODUCT_NOT_FOUND,
      });
    }

    // Invalidate cache for this product and list
    await deleteFromCache("products", `detail:${id}`);
    await invalidateNamespace("products");

    return NextResponse.json(updated[0]);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      return handleDatabaseError(error, "PUT /api/products/[id]");
    }
    return handleUnexpectedError(error, "PUT /api/products/[id]");
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route - admin only
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const { id } = await params;
    const deleted = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return createErrorResponse({
        code: ErrorCode.PRODUCT_NOT_FOUND,
      });
    }

    // Invalidate cache for this product and list
    await deleteFromCache("products", `detail:${id}`);
    await invalidateNamespace("products");

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      return handleDatabaseError(error, "DELETE /api/products/[id]");
    }
    return handleUnexpectedError(error, "DELETE /api/products/[id]");
  }
}
