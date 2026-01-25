import { notFound } from "next/navigation";
import { CRICKET_BATS } from "@/lib/data/products";
import { getCategoryBySlug } from "@/lib/data/categories";
import { CategoryPageClient } from "@/app/products/categories/[slug]/category-page-client";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  // Get category info
  const categoryInfo = getCategoryBySlug(slug);
  
  // If category doesn't exist, show 404
  if (!categoryInfo) {
    notFound();
  }

  // Filter products by category
  const categoryProducts = CRICKET_BATS.filter(
    (product) => product.category === slug
  );

  return (
    <CategoryPageClient 
      categoryInfo={categoryInfo}
      products={categoryProducts}
    />
  );
}
