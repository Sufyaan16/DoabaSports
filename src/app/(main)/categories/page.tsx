import { CategoryBanner } from "@/components/category-banner";
import { CategoryCards } from "@/components/category-cards";
import db from "@/db";
import { categories } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { CategoryInfo } from "@/lib/data/categories";

export default async function CategoriesPage() {
  // Fetch categories from database
  const dbCategories = await db.select().from(categories).orderBy(desc(categories.id));

  // Transform to frontend format
  const transformedCategories: CategoryInfo[] = dbCategories.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    longDescription: c.longDescription,
    image: c.image,
    imageHover: c.imageHover || undefined,
  }));

  return (
    <div className="min-h-screen">
      <CategoryBanner />
      <CategoryCards categories={transformedCategories} />
    </div>
  );
}
