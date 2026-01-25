"use client";

import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { productsToCSV, parseProductsCSV, downloadCSV } from "@/lib/csv-utils";
import { Product } from "@/lib/data/products";
import Swal from "sweetalert2";
import { useRef } from "react";

interface BulkActionsProps {
  products: Product[];
  onImport?: (products: Partial<Product>[]) => void;
}

export function ProductsBulkActions({ products, onImport }: BulkActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const csv = productsToCSV(products);
    downloadCSV(csv, `products-export-${Date.now()}.csv`);
    
    Swal.fire({
      title: "Exported!",
      text: `${products.length} products have been exported to CSV.`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith(".csv")) {
      Swal.fire({
        title: "Invalid File",
        text: "Please upload a CSV file.",
        icon: "error",
      });
      return;
    }

    try {
      const content = await file.text();
      const importedProducts = parseProductsCSV(content);

      if (importedProducts.length === 0) {
        Swal.fire({
          title: "No Data",
          text: "The CSV file is empty or invalid.",
          icon: "warning",
        });
        return;
      }

      // Show confirmation
      const result = await Swal.fire({
        title: "Confirm Import",
        html: `
          <p>You are about to import <strong>${importedProducts.length}</strong> products.</p>
          <p class="text-sm text-gray-600 mt-2">This will add new products to your store.</p>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Import Products",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#10b981",
      });

      if (result.isConfirmed) {
        // Call onImport callback if provided
        onImport?.(importedProducts);

        // Show success message
        await Swal.fire({
          title: "Import Successful!",
          html: `
            <p><strong>${importedProducts.length}</strong> products have been imported successfully.</p>
            <div class="mt-4 p-4 bg-gray-50 rounded-lg text-left">
              <p class="text-sm font-semibold mb-2">Imported Products:</p>
              <ul class="text-sm text-gray-700 space-y-1 max-h-40 overflow-y-auto">
                ${importedProducts.slice(0, 10).map(p => `<li>• ${p.name}</li>`).join("")}
                ${importedProducts.length > 10 ? `<li class="font-semibold">... and ${importedProducts.length - 10} more</li>` : ""}
              </ul>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Done",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Import Failed",
        text: "There was an error importing the CSV file. Please check the format and try again.",
        icon: "error",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" onClick={handleImportClick}>
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
