import { Hero3 } from "@/components/hero3";
import { ProductCarousel } from "@/components/product-carousel";
import { StatsCounter } from "@/components/stats-counter";
import { InteractiveCategories } from "@/components/interactive-categories";
import { TrustMarquee } from "@/components/trust-marquee";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { BestSellers } from "@/components/best-sellers";
import { InstagramFeed } from "@/components/instagram-feed";
import db from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { Product } from "@/lib/data/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doaba Sports — Premium Cricket Equipment & Accessories",
  description:
    " Shop premium cricket bats, equipment, accessories, and apparel at Doaba Sports. Free COD shipping and dedicated customer support.",
};

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
    gallery: (p.galleryImages as string[]) || [],
  }));

  return (
    <>
      <Hero3 className="mx-20"/>
      <TrustMarquee />
      <StatsCounter />
      <ProductCarousel products={transformedProducts} />
      <InteractiveCategories />
      <BestSellers products={transformedProducts} />
      <TestimonialsCarousel />
      <InstagramFeed />
    </>
  );
}
