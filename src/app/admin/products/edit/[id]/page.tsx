import { stackServerApp } from "@/stack/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditProductForm } from "./edit-product-form";
import db from "@/db/index";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  const { id } = await params;
  const productId = parseInt(id);

  // Fetch product from database
  const dbProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (dbProduct.length === 0) {
    notFound();
  }

  // Transform to frontend format
  const product = {
    id: dbProduct[0].id,
    name: dbProduct[0].name,
    company: dbProduct[0].company,
    category: dbProduct[0].category,
    image: {
      src: dbProduct[0].imageSrc,
      alt: dbProduct[0].imageAlt,
    },
    imageHover: dbProduct[0].imageHoverSrc ? {
      src: dbProduct[0].imageHoverSrc,
      alt: dbProduct[0].imageHoverAlt || `${dbProduct[0].name} - Alternate View`,
    } : undefined,
    description: dbProduct[0].description,
    price: {
      regular: parseFloat(dbProduct[0].priceRegular),
      sale: dbProduct[0].priceSale ? parseFloat(dbProduct[0].priceSale) : undefined,
      currency: dbProduct[0].priceCurrency,
    },
    badge: dbProduct[0].badgeText ? {
      text: dbProduct[0].badgeText,
      backgroundColor: dbProduct[0].badgeBackgroundColor || undefined,
    } : undefined,
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-1">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            Update the details for {product.name}
          </p>
        </div>
      </div>

      <EditProductForm product={product} />
    </div>
  );
}
