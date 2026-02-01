"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Product } from "@/lib/data/products";
import { StockBadge } from "@/components/stock-badge";
import Swal from "sweetalert2";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductsListProps {
  products: Product[];
}

export function ProductsList({ products: initialProducts }: ProductsListProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "price-asc" | "price-desc" | "name">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.price.sale || a.price.regular) - (b.price.sale || b.price.regular);
        case "price-desc":
          return (b.price.sale || b.price.regular) - (a.price.sale || a.price.regular);
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
        default:
          return b.id - a.id; // Assuming higher ID means newer
      }
    });

    return filtered;
  }, [products, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handleDelete = async (productId: number, productName: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${productName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete product");
        }

        // Remove from local state
        setProducts(products.filter((p) => p.id !== productId));

        await Swal.fire({
          title: "Deleted!",
          text: `${productName} has been deleted.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh the page to get updated data
        router.refresh();
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete product. Please try again.",
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
                placeholder="Search products..."
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
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Products ({filteredAndSortedProducts.length})</CardTitle>
          <CardDescription>
            {searchQuery && `Showing results for "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found. Try adjusting your search.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image.src}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.company} • {product.category}
                        </p>
                        {product.sku && (
                          <p className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {product.trackInventory && (
                        <StockBadge
                          stockQuantity={product.stockQuantity || 0}
                          lowStockThreshold={product.lowStockThreshold || 10}
                          trackInventory={product.trackInventory}
                        />
                      )}
                      <div className="text-right">
                        <p className="font-semibold">
                          ${product.price.sale || product.price.regular}
                        </p>
                        {product.price.sale && (
                          <p className="text-sm text-muted-foreground line-through">
                            ${product.price.regular}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          Delete
                        </Button>
                      </div>
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
