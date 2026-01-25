import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewProductForm } from "./new-product-form";
import { ProductsBulkActions } from "../bulk-actions";
import { CRICKET_BATS } from "@/lib/data/products";

export default async function NewProductPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-1">Add New Product</h1>
            <p className="text-sm text-muted-foreground">
              Create a new product or import bulk products
            </p>
          </div>
        </div>
        <ProductsBulkActions products={CRICKET_BATS} />
      </div>

      <NewProductForm />
    </div>
  );
}
