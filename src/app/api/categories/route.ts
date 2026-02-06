import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { categories } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { createCategorySchema } from "@/lib/validations/category";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/auth-helpers";
import { getOrSet, CACHE_TTL, invalidateNamespace } from "@/lib/cache";
import {
  createErrorResponse,
  handleZodError,
  handleDatabaseError,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

// GET all categories (with pagination)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    
    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return createErrorResponse({
        code: ErrorCode.INVALID_QUERY_PARAMS,
        message: "Invalid pagination parameters",
        details: { page: "Must be >= 1", limit: "Must be 1-100" },
      });
    }

    // Create cache key
    const cacheKey = `list:${page}:${limit}`;
    
    // Try to get from cache
    const cachedResult = await getOrSet(
      "categories",
      cacheKey,
      async () => {
        const offset = (page - 1) * limit;

        // Get total count
        const [{ count: totalCount }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(categories);

        // Get paginated categories
        const allCategories = await db
          .select()
          .from(categories)
          .orderBy(desc(categories.createdAt))
          .limit(limit)
          .offset(offset);

        // Transform database categories to match frontend format
        const transformedCategories = allCategories.map((category) => ({
          slug: category.slug,
          name: category.name,
          description: category.description,
          longDescription: category.longDescription,
          image: category.image,
          imageHover: category.imageHover || undefined,
        }));

        const totalPages = Math.ceil(totalCount / limit);

        return {
          categories: transformedCategories,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        };
      },
      CACHE_TTL.CATEGORIES
    );

    return NextResponse.json(cachedResult);
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/categories");
  }
}

// POST new category
export async function POST(request: NextRequest) {
  // Protect route - admin only
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const body = await request.json();

    // Validate request body
    const validated = createCategorySchema.safeParse(body);
    
    if (!validated.success) {
      return handleZodError(validated.error);
    }

    const validatedData = validated.data;

    const newCategory = await db
      .insert(categories)
      .values({
        slug: validatedData.slug,
        name: validatedData.name,
        description: validatedData.description,
        longDescription: validatedData.longDescription,
        image: validatedData.image,
        imageHover: validatedData.imageHover || null,
      })
      .returning();

    // Invalidate categories cache
    await invalidateNamespace("categories");

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    if (error && typeof error === "object" && "code" in error) {
      return handleDatabaseError(error, "POST /api/categories");
    }
    return handleUnexpectedError(error, "POST /api/categories");
  }
}
