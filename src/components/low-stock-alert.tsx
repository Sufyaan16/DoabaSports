"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import Link from "next/link";

interface LowStockProduct {
  id: number;
  name: string;
  sku: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
}

export function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        const lowStock = data.products.filter(
          (product: any) =>
            product.trackInventory &&
            product.stockQuantity <= product.lowStockThreshold
        );
        setLowStockProducts(lowStock);
      }
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (lowStockProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Alerts
          </CardTitle>
          <CardDescription>All products are well stocked</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No products are currently low on stock.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Stock Alerts
          <Badge variant="secondary" className="ml-auto">
            {lowStockProducts.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Products that need restocking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/edit/${product.id}`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{product.name}</p>
                {product.sku && (
                  <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={product.stockQuantity === 0 ? "destructive" : "secondary"}
                  className={
                    product.stockQuantity === 0
                      ? ""
                      : "bg-orange-100 text-orange-800"
                  }
                >
                  {product.stockQuantity === 0
                    ? "Out of Stock"
                    : `${product.stockQuantity} left`}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
