import { notFound } from "next/navigation";
import { CRICKET_BATS } from "@/lib/data/products";
import { ProductDetailClient } from "./product-detail-client";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  // Find product by ID
  const product = CRICKET_BATS.find((p) => p.id === Number(id));

  // If product doesn't exist, show 404
  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
