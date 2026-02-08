"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CategoryInfo } from "@/lib/data/categories";
import Swal from "sweetalert2";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface CategoriesListProps {
  categories: CategoryInfo[];
}

export function CategoriesList({ categories: initialCategories }: CategoriesListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
        default:
          return a.name.localeCompare(b.name); // Default alphabetical
      }
    });

    return filtered;
  }, [categories, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage);
  const paginatedCategories = filteredAndSortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handleDelete = async (categorySlug: string, categoryName: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${categoryName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/categories/${categorySlug}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete category");
        }

        // Remove from local state
        setCategories(categories.filter((c) => c.slug !== categorySlug));

        await Swal.fire({
          title: "Deleted!",
          text: `${categoryName} has been deleted.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh the page to get updated data
        router.refresh();
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete category. Please try again.",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <Card>
        <CardContent className="">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Categories ({filteredAndSortedCategories.length})</CardTitle>
          <CardDescription>
            {searchQuery && `Showing results for "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. Try adjusting your search.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedCategories.map((category) => (
                  <div
                    key={category.slug}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/categories/edit/${category.slug}`}>Edit</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.slug, category.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
