import { stackServerApp } from "@/stack/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditCategoryForm } from "./edit-category-form";
import { CATEGORY_INFO, getCategoryBySlug } from "@/lib/data/categories";

interface EditCategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  const { slug } = await params;

  // Find the category
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-1">Edit Category</h1>
          <p className="text-sm text-muted-foreground">
            Update the details for {category.name}
          </p>
        </div>
      </div>

      <EditCategoryForm category={category} />
    </div>
  );
}
