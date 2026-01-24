import { CRICKET_BATS } from "@/lib/data/products";
import { ProductsGrid } from "@/components/products-grid";

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Cricket Bats</h1>
        <p className="text-lg text-muted-foreground">
          Explore our premium collection of cricket bats from top brands
        </p>
      </div>

      <ProductsGrid products={CRICKET_BATS} />
    </div>
  );
}
