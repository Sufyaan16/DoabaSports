import { notFound } from "next/navigation";
import { CategoryPageClient } from "./category-page-client";
import db from "@/db";
import { categories, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CategoryInfo } from "@/lib/data/categories";
import type { Product } from "@/lib/data/products";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  // Fetch category from database
  const dbCategory = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  // If category doesn't exist, show 404
  if (!dbCategory || dbCategory.length === 0) {
    notFound();
  }

  // Transform category to frontend format
  const c = dbCategory[0];
  const categoryInfo: CategoryInfo = {
    slug: c.slug,
    name: c.name,
    description: c.description,
    longDescription: c.longDescription,
    image: c.image,
    imageHover: c.imageHover || undefined,
  };

  // Fetch products for this category
  const dbProducts = await db
    .select()
    .from(products)
    .where(eq(products.category, slug));

  // Transform products to frontend format
  const categoryProducts: Product[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    company: p.company,
    category: p.category,
    image: {
      src: p.imageSrc,
      alt: p.imageAlt,
    },
    imageHover: p.imageHoverSrc
      ? {
          src: p.imageHoverSrc,
          alt: p.imageHoverAlt || "",
        }
      : undefined,
    description: p.description,
    price: {
      regular: parseFloat(p.priceRegular),
      sale: p.priceSale ? parseFloat(p.priceSale) : undefined,
      currency: p.priceCurrency,
    },
    badge: p.badgeText
      ? {
          text: p.badgeText,
          backgroundColor: p.badgeBackgroundColor || undefined,
        }
      : undefined,
  }));

  return (
    <CategoryPageClient 
      categoryInfo={categoryInfo}
      products={categoryProducts}
    />
  );
}
