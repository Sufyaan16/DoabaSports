import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CRICKET_BATS } from "@/lib/data/products";
import { ProductsList } from "./products-list";
import { ProductsBulkActions } from "./bulk-actions";

export default async function AdminProductsPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

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
          <ProductsBulkActions products={CRICKET_BATS} />
          <Link href="/admin/products/new">
            <Button>Add New Product</Button>
          </Link>
        </div>
      </div>

      <ProductsList products={CRICKET_BATS} />
    </div>
  );
}
