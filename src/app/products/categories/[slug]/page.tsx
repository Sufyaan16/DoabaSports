import { notFound } from "next/navigation";
import { CRICKET_BATS } from "@/lib/data/products";
import { getCategoryBySlug } from "@/lib/data/categories";
import { ProductsGrid } from "@/components/products-grid";

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
    <div className="min-h-screen">
      {/* Category Banner */}
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        <img
          src={categoryInfo.image}
          alt={categoryInfo.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
              {categoryInfo.name}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto">
              {categoryInfo.longDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            All {categoryInfo.name}
          </h2>
          <p className="text-lg text-muted-foreground">
            {categoryProducts.length} products available
          </p>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              No products available in this category yet.
            </p>
          </div>
        ) : (
          <ProductsGrid products={categoryProducts} />
        )}
      </section>
    </div>
  );
}
