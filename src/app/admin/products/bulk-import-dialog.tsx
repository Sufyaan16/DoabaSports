"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ImageUp,
  ArrowRight,
  Download,
} from "lucide-react";
import { parseProductsCSV, productsToCSV, downloadCSV } from "@/lib/csv-utils";
import { createProductSchema } from "@/lib/validations/product";
import type { Product } from "@/lib/data/products";

// Valid categories
const VALID_CATEGORIES = [
  "cricketbats",
  "cricketgear",
  "cricketaccessories",
  "cricketgloves",
  "tapballbats",
  "cricketbags",
] as const;

type RowStatus =
  | "pending"
  | "validating"
  | "valid"
  | "invalid"
  | "uploading-image"
  | "saving"
  | "success"
  | "error";

interface ImportRow {
  index: number;
  raw: Partial<Product>;
  status: RowStatus;
  errors: string[];
  cloudinaryUrl?: string;
  savedId?: number;
}

/**
 * Validate a single parsed CSV row against the product schema.
 * Returns an array of human-readable error strings.
 */
function validateRow(row: Partial<Product>): string[] {
  const errors: string[] = [];

  if (!row.name || row.name.trim().length < 2) {
    errors.push("Name is required (min 2 characters)");
  }
  if (!row.company || row.company.trim().length < 2) {
    errors.push("Company is required (min 2 characters)");
  }
  if (!row.category) {
    errors.push("Category is required");
  } else if (
    !VALID_CATEGORIES.includes(row.category as (typeof VALID_CATEGORIES)[number])
  ) {
    errors.push(
      `Invalid category "${row.category}". Valid: ${VALID_CATEGORIES.join(", ")}`
    );
  }
  if (!row.description || row.description.trim().length < 10) {
    errors.push("Description is required (min 10 characters)");
  }
  if (!row.price?.regular || row.price.regular <= 0) {
    errors.push("Regular price must be positive");
  }
  if (
    row.price?.sale !== undefined &&
    row.price?.sale !== null &&
    row.price.sale >= (row.price?.regular || 0)
  ) {
    errors.push("Sale price must be less than regular price");
  }
  if (!row.image?.src) {
    errors.push("Image URL is required");
  }

  return errors;
}

/**
 * Upload an image URL to Cloudinary via the /api/upload-url endpoint.
 * Falls back to returning the original URL if it's already a Cloudinary URL.
 */
async function uploadImageToCloudinary(imageUrl: string): Promise<string> {
  // Already on Cloudinary — skip
  if (imageUrl.includes("res.cloudinary.com")) {
    return imageUrl;
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!res.ok) {
    // If upload-by-URL fails, just return original URL
    // (the product API accepts any valid URL)
    return imageUrl;
  }

  const data = await res.json();
  return data.data?.url || imageUrl;
}

/**
 * Save a single validated product row to the database via POST /api/products.
 */
async function saveProductToDb(row: Partial<Product>, cloudinaryUrl: string) {
  const body = {
    name: row.name,
    company: row.company,
    category: row.category,
    description: row.description,
    priceRegular: row.price?.regular || 0,
    priceSale: row.price?.sale || undefined,
    priceCurrency: row.price?.currency || "USD",
    imageSrc: cloudinaryUrl,
    imageAlt: row.image?.alt || row.name || "",
    badgeText: row.badge?.text || null,
    badgeBackgroundColor: row.badge?.backgroundColor || null,
    galleryImages: [],
    stockQuantity: 0,
    lowStockThreshold: 10,
    trackInventory: true,
  };

  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error?.message || data.message || "Failed to create product");
  }

  return res.json();
}

export function BulkImportDialog() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "review" | "importing" | "done">("upload");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  // ─── Step 1: Parse CSV ─────────────────────────────────
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".csv")) {
        const { default: Swal } = await import("sweetalert2");
        Swal.fire({ title: "Invalid File", text: "Please upload a .csv file.", icon: "error" });
        return;
      }

      const content = await file.text();
      const parsed = parseProductsCSV(content);

      if (parsed.length === 0) {
        const { default: Swal } = await import("sweetalert2");
        Swal.fire({ title: "Empty File", text: "No products found in the CSV.", icon: "warning" });
        return;
      }

      // Validate every row instantly
      const importRows: ImportRow[] = parsed.map((raw, i) => {
        const errors = validateRow(raw);
        return {
          index: i,
          raw,
          status: errors.length > 0 ? "invalid" : "valid",
          errors,
        };
      });

      setRows(importRows);
      setStep("review");

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  // ─── Step 2: Start Import ──────────────────────────────
  const validRows = rows.filter((r) => r.status === "valid" || r.status === "success");
  const invalidRows = rows.filter((r) => r.status === "invalid");

  const handleStartImport = useCallback(async () => {
    const toImport = rows.filter((r) => r.status === "valid");
    if (toImport.length === 0) return;

    setStep("importing");
    setImportProgress({ current: 0, total: toImport.length });

    for (let i = 0; i < toImport.length; i++) {
      const row = toImport[i];
      const rowIndex = row.index;

      try {
        // Phase A — Upload image to Cloudinary
        setRows((prev) =>
          prev.map((r) => (r.index === rowIndex ? { ...r, status: "uploading-image" } : r))
        );

        const cloudinaryUrl = await uploadImageToCloudinary(row.raw.image?.src || "");

        // Phase B — Save to DB
        setRows((prev) =>
          prev.map((r) =>
            r.index === rowIndex ? { ...r, status: "saving", cloudinaryUrl } : r
          )
        );

        const saved = await saveProductToDb(row.raw, cloudinaryUrl);

        setRows((prev) =>
          prev.map((r) =>
            r.index === rowIndex
              ? { ...r, status: "success", savedId: saved.id, cloudinaryUrl }
              : r
          )
        );
      } catch (err: any) {
        setRows((prev) =>
          prev.map((r) =>
            r.index === rowIndex
              ? { ...r, status: "error", errors: [err.message || "Unknown error"] }
              : r
          )
        );
      }

      setImportProgress({ current: i + 1, total: toImport.length });
    }

    setStep("done");
  }, [rows]);

  // ─── Reset ──────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setRows([]);
    setStep("upload");
    setImportProgress({ current: 0, total: 0 });
  }, []);

  const handleClose = useCallback(() => {
    if (step === "done") {
      router.refresh();
    }
    setOpen(false);
    // Reset after dialog fade out
    setTimeout(handleReset, 300);
  }, [step, router, handleReset]);

  // ─── Download sample CSV ───────────────────────────────
  const handleDownloadSample = useCallback(() => {
    const sampleProducts: Product[] = [
      {
        id: 0,
        name: "Sample Bat Pro",
        company: "Ihsan",
        category: "cricketbats",
        image: { src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80", alt: "Sample Bat" },
        description: "A high-quality English willow cricket bat with premium handle grip.",
        price: { regular: 249, sale: 199, currency: "USD" },
        badge: { text: "Sale" },
      },
    ];
    const csv = productsToCSV(sampleProducts);
    downloadCSV(csv, "products-sample.csv");
  }, []);

  // ─── Status icon helper ────────────────────────────────
  const statusIcon = (status: RowStatus) => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "invalid":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "uploading-image":
        return <ImageUp className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "saving":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
  };

  const statusLabel = (status: RowStatus) => {
    switch (status) {
      case "valid":
        return "Ready";
      case "invalid":
        return "Has errors";
      case "uploading-image":
        return "Uploading image…";
      case "saving":
        return "Saving…";
      case "success":
        return "Imported";
      case "error":
        return "Failed";
      default:
        return "Pending";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple products at once. Images will be
            uploaded to Cloudinary automatically.
          </DialogDescription>
        </DialogHeader>

        {/* ── Upload Step ── */}
        {step === "upload" && (
          <div className="flex flex-col items-center gap-6 py-10">
            <div
              className="w-full max-w-md border-2 border-dashed border-muted-foreground/40 rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer hover:border-primary/60 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
            >
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Click to upload CSV</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or drag &amp; drop your file here
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <Button variant="link" size="sm" onClick={handleDownloadSample}>
              <Download className="mr-2 h-4 w-4" />
              Download sample CSV
            </Button>

            <div className="w-full max-w-md text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-sm">Required CSV columns:</p>
              <p>ID, Name, Company, Category, Description, Regular Price, Sale Price, Currency, Image URL, Badge Text, Badge Color</p>
              <p className="mt-2">
                <span className="font-medium text-foreground">Valid categories: </span>
                {VALID_CATEGORIES.join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* ── Review Step ── */}
        {step === "review" && (
          <div className="flex flex-col gap-4 min-h-0">
            {/* Summary bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {rows.length} total
              </Badge>
              <Badge className="bg-green-600 text-sm px-3 py-1">
                {validRows.length} ready
              </Badge>
              {invalidRows.length > 0 && (
                <Badge variant="destructive" className="text-sm px-3 py-1">
                  {invalidRows.length} errors
                </Badge>
              )}
            </div>

            {invalidRows.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p>
                  {invalidRows.length} row(s) have validation errors and will be
                  skipped. Fix them in your CSV and re-upload, or proceed to import
                  only the valid rows.
                </p>
              </div>
            )}

            <Separator />

            {/* Row list */}
            <ScrollArea className="flex-1 max-h-[40vh] pr-2">
              <div className="space-y-2">
                {rows.map((row) => (
                  <div
                    key={row.index}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                      row.status === "invalid"
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border"
                    }`}
                  >
                    <div className="mt-0.5">{statusIcon(row.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {row.raw.name || "(unnamed)"}
                        <span className="ml-2 text-muted-foreground font-normal">
                          {row.raw.company}
                        </span>
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {row.raw.category} · ${row.raw.price?.regular ?? 0}
                        {row.raw.price?.sale ? ` → $${row.raw.price.sale}` : ""}
                      </p>
                      {row.errors.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-destructive text-xs">
                          {row.errors.map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Badge
                      variant={row.status === "invalid" ? "destructive" : "secondary"}
                      className="shrink-0 text-xs"
                    >
                      {statusLabel(row.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={handleReset}>
                Upload Different File
              </Button>
              <Button
                onClick={handleStartImport}
                disabled={validRows.length === 0}
              >
                Import {validRows.length} Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Importing Step ── */}
        {step === "importing" && (
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="font-medium">
                Importing… {importProgress.current}/{importProgress.total}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${importProgress.total ? (importProgress.current / importProgress.total) * 100 : 0}%`,
                }}
              />
            </div>

            <ScrollArea className="flex-1 max-h-[40vh] pr-2">
              <div className="space-y-2">
                {rows
                  .filter(
                    (r) =>
                      r.status !== "invalid" && r.status !== "valid" && r.status !== "pending"
                  )
                  .map((row) => (
                    <div
                      key={row.index}
                      className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                    >
                      {statusIcon(row.status)}
                      <p className="flex-1 truncate font-medium">
                        {row.raw.name}
                      </p>
                      <Badge
                        variant={
                          row.status === "success"
                            ? "default"
                            : row.status === "error"
                              ? "destructive"
                              : "secondary"
                        }
                        className={`text-xs shrink-0 ${row.status === "success" ? "bg-green-600" : ""}`}
                      >
                        {statusLabel(row.status)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ── Done Step ── */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-6 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <div className="text-center">
              <h3 className="text-xl font-semibold">Import Complete</h3>
              <p className="text-muted-foreground mt-1">
                {rows.filter((r) => r.status === "success").length} of{" "}
                {rows.filter((r) => r.status !== "invalid").length} products imported
                successfully.
              </p>
              {rows.filter((r) => r.status === "error").length > 0 && (
                <p className="text-destructive text-sm mt-2">
                  {rows.filter((r) => r.status === "error").length} failed — check
                  the details below.
                </p>
              )}
            </div>

            {/* Failed rows summary */}
            {rows.filter((r) => r.status === "error").length > 0 && (
              <ScrollArea className="w-full max-h-[20vh] pr-2">
                <div className="space-y-2">
                  {rows
                    .filter((r) => r.status === "error")
                    .map((row) => (
                      <div
                        key={row.index}
                        className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
                      >
                        <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">{row.raw.name}</p>
                          <p className="text-destructive text-xs">
                            {row.errors.join("; ")}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}

            <Button onClick={handleClose}>Close &amp; Refresh</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
