"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { ProductsGrid } from "@/components/products-grid";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import type { CategoryInfo } from "@/lib/data/categories";
import type { Product } from "@/lib/data/products";

interface CategoryPageClientProps {
  categoryInfo: CategoryInfo;
  products: Product[];
}

export function CategoryPageClient({ categoryInfo, products }: CategoryPageClientProps) {
  const router = useRouter();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

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
        <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              All {categoryInfo.name}
            </h2>
            <p className="text-lg text-muted-foreground">
              {products.length} products available
            </p>
          </div>
          
          {cartCount > 0 && (
            <Button 
              size="lg"
              onClick={() => router.push("/checkout")}
              className="w-full sm:w-auto"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Proceed to Checkout ({cartCount})
            </Button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              No products available in this category yet.
            </p>
          </div>
        ) : (
          <ProductsGrid products={products} />
        )}
        
        {/* Sticky Checkout Button for Mobile */}
        {cartCount > 0 && (
          <div className="fixed bottom-4 left-4 right-4 sm:hidden z-50">
            <Button 
              size="lg"
              onClick={() => router.push("/checkout")}
              className="w-full shadow-lg"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Proceed to Checkout ({cartCount} items)
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
