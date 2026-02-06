import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateCategorySchema } from "@/lib/validations/category";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/auth-helpers";

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Transform to frontend format
    const transformed = {
      slug: category[0].slug,
      name: category[0].name,
      description: category[0].description,
      longDescription: category[0].longDescription,
      image: category[0].image,
      imageHover: category[0].imageHover || undefined,
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
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
      const errors = validated.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
