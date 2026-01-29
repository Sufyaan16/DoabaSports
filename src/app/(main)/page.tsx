import { Hero3 } from "@/components/hero3";
import { WikiCard } from "@/components/ui/wiki-card";
import { ProductCarousel } from "@/components/product-carousel";
import db from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { Product } from "@/lib/data/products";

export default async function Home() {
  // Fetch featured products from database
  const dbProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.id))
    .limit(8);

  // Transform to frontend format
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

  return (
    <>
      <Hero3 className="mx-20"/>
      <ProductCarousel products={transformedProducts} />
    </>
  );
}
