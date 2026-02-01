import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductsList } from "./products-list";
import { ProductsBulkActions } from "./bulk-actions";
import db from "@/db/index";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function AdminProductsPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  // Fetch products from database
  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  // Transform database products to match frontend format
  const transformedProducts = allProducts.map((product) => ({
    id: product.id,
    name: product.name,
    company: product.company,
    category: product.category,
    image: {
      src: product.imageSrc,
      alt: product.imageAlt,
    },
    imageHover: product.imageHoverSrc ? {
      src: product.imageHoverSrc,
      alt: product.imageHoverAlt || `${product.name} - Alternate View`,
    } : undefined,
    description: product.description,
    price: {
      regular: parseFloat(product.priceRegular),
      sale: product.priceSale ? parseFloat(product.priceSale) : undefined,
      currency: product.priceCurrency,
    },
    badge: product.badgeText ? {
      text: product.badgeText,
      backgroundColor: product.badgeBackgroundColor || undefined,
    } : undefined,
    // Inventory Management
    sku: product.sku || undefined,
    stockQuantity: product.stockQuantity || 0,
    lowStockThreshold: product.lowStockThreshold || 10,
    trackInventory: product.trackInventory !== false,
  }));

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your products here
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ProductsBulkActions products={transformedProducts} />
          <Link href="/admin/products/new">
            <Button>Add New Product</Button>
          </Link>
        </div>
      </div>

      <ProductsList products={transformedProducts} />
    </div>
  );
}
