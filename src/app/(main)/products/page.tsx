import { ProductsPageClient } from "./products-page-client";
import db from "@/db";
import { products, categories } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import type { Product } from "@/lib/data/products";
import type { CategoryInfo } from "@/lib/data/categories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse our complete range of premium cricket bats, protective gear, accessories, and apparel. Find the perfect equipment for your game.",
};

const INITIAL_PRODUCTS_LIMIT = 12;

export default async function ProductsPage() {
  // Fetch initial products with limit for pagination
  const dbProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.id))
    .limit(INITIAL_PRODUCTS_LIMIT);

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products);

  // Fetch categories from database
  const dbCategories = await db.select().from(categories).orderBy(desc(categories.id));

  // Transform products to frontend format
  const transformedProducts: Product[] = dbProducts.map((p) => ({
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

  // Transform categories to frontend format
  const transformedCategories: CategoryInfo[] = dbCategories.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    longDescription: c.longDescription,
    image: c.image,
    imageHover: c.imageHover || undefined,
  }));

  return (
    <ProductsPageClient 
      initialProducts={transformedProducts} 
      categories={transformedCategories}
      totalCount={totalCount}
    />
  );
}
