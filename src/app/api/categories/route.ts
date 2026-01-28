import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { categories } from "@/db/schema";
import { desc } from "drizzle-orm";
import { createCategorySchema } from "@/lib/validations/category";
import { ZodError } from "zod";

// GET all categories
export async function GET() {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(desc(categories.createdAt));

    // Transform database categories to match frontend format
    const transformedCategories = allCategories.map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
      longDescription: category.longDescription,
      image: category.image,
      imageHover: category.imageHover || undefined,
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = createCategorySchema.safeParse(body);
    
    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
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

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
