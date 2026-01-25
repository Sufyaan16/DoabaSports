import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CATEGORY_INFO } from "@/lib/data/categories";
import { CategoriesList } from "./categories-list";
import { CategoriesBulkActions } from "./bulk-actions";

export default async function AdminCategoriesPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  const categories = Object.values(CATEGORY_INFO);

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your categories here
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <CategoriesBulkActions categories={categories} />
          <Link href="/admin/categories/new">
            <Button>Add New Category</Button>
          </Link>
        </div>
      </div>

      <CategoriesList categories={categories} />
    </div>
  );
}
