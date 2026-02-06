import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateCategorySchema } from "@/lib/validations/category";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/auth-helpers";
import { getOrSet, CACHE_TTL, deleteFromCache, invalidateNamespace } from "@/lib/cache";
import {
  createErrorResponse,
  handleZodError,
  handleDatabaseError,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const cachedResult = await getOrSet(
      "categories",
      `detail:${slug}`,
      async () => {
        const category = await db
          .select()
          .from(categories)
          .where(eq(categories.slug, slug))
          .limit(1);

        if (category.length === 0) {
          return null;
        }

        // Transform to frontend format
        return {
          slug: category[0].slug,
          name: category[0].name,
          description: category[0].description,
          longDescription: category[0].longDescription,
          image: category[0].image,
          imageHover: category[0].imageHover || undefined,
        };
      },
      CACHE_TTL.CATEGORIES
    );

    if (!cachedResult) {
      return createErrorResponse({
        code: ErrorCode.CATEGORY_NOT_FOUND,
        message: "Category not found",
        details: { slug },
      });
    }

    return NextResponse.json(cachedResult);
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/categories/[slug]");
  }
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Protect route - admin only
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const { slug } = await params;
    const body = await request.json();

    // Validate request body
    const validated = updateCategorySchema.safeParse(body);
    
    if (!validated.success) {
      return handleZodError(validated.error);
    }

    const validatedData = validated.data;

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.longDescription !== undefined) updateData.longDescription = validatedData.longDescription;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;
    if (validatedData.imageHover !== undefined) updateData.imageHover = validatedData.imageHover || null;

    const updated = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.slug, slug))
      .returning();

    if (updated.length === 0) {
      return createErrorResponse({
        code: ErrorCode.CATEGORY_NOT_FOUND,
        message: "Category not found",
        details: { slug },
      });
    }

    // Invalidate category cache
    await deleteFromCache("categories", `detail:${slug}`);
    await invalidateNamespace("categories");

    return NextResponse.json(updated[0]);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    if (error && typeof error === "object" && "code" in error) {
      return handleDatabaseError(error, "PUT /api/categories/[slug]");
    }
    return handleUnexpectedError(error, "PUT /api/categories/[slug]");
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Protect route - admin only
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const { slug } = await params;
    const deleted = await db
      .delete(categories)
      .where(eq(categories.slug, slug))
      .returning();

    if (deleted.length === 0) {
      return createErrorResponse({
        code: ErrorCode.CATEGORY_NOT_FOUND,
        message: "Category not found",
        details: { slug },
      });
    }

    // Invalidate category cache
    await deleteFromCache("categories", `detail:${slug}`);
    await invalidateNamespace("categories");

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      return handleDatabaseError(error, "DELETE /api/categories/[slug]");
    }
    return handleUnexpectedError(error, "DELETE /api/categories/[slug]");
  }
}
