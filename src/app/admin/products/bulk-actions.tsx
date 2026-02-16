"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { productsToCSV, downloadCSV } from "@/lib/csv-utils";
import { Product } from "@/lib/data/products";
import { BulkImportDialog } from "./bulk-import-dialog";

interface BulkActionsProps {
  products: Product[];
}

export function ProductsBulkActions({ products }: BulkActionsProps) {
  const handleExport = async () => {
    const csv = productsToCSV(products);
    downloadCSV(csv, `products-export-${Date.now()}.csv`);

    const { default: Swal } = await import("sweetalert2");
    Swal.fire({
      title: "Exported!",
      text: `${products.length} products have been exported to CSV.`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <BulkImportDialog />
    </div>
  );
}
