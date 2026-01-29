import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";
import db from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Product } from "@/lib/data/products";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  // Fetch product from database
  const dbProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)))
    .limit(1);

  // If product doesn't exist, show 404
  if (!dbProduct || dbProduct.length === 0) {
    notFound();
  }

  // Transform to frontend format
  const p = dbProduct[0];
  const product: Product = {
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
  };

  return <ProductDetailClient product={product} />;
}
