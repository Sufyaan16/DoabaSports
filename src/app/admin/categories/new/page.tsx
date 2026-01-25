import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewCategoryForm } from "./new-category-form";
import { CategoriesBulkActions } from "../bulk-actions";
import { CATEGORY_INFO } from "@/lib/data/categories";

export default async function NewCategoryPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  const categories = Object.values(CATEGORY_INFO);

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-1">Add New Category</h1>
            <p className="text-sm text-muted-foreground">
              Create a new category or import bulk categories
            </p>
          </div>
        </div>
        <CategoriesBulkActions categories={categories} />
      </div>

      <NewCategoryForm />
    </div>
  );
}
