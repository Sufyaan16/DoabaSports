import { stackServerApp } from "@/stack/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditProductForm } from "./edit-product-form";
import { CRICKET_BATS } from "@/lib/data/products";

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

  // Find the product
  const product = CRICKET_BATS.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

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
