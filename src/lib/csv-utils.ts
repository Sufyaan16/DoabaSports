import { Product } from "@/lib/data/products";
import { CategoryInfo } from "@/lib/data/categories";

// Convert products to CSV
export function productsToCSV(products: Product[]): string {
  const headers = [
    "ID",
    "Name",
    "Company",
    "Category",
    "Description",
    "Regular Price",
    "Sale Price",
    "Currency",
    "Image URL",
    "Badge Text",
    "Badge Color",
    "Stock Quantity",
    "Gallery Images"
  ];

  const rows = products.map((product) => [
    product.id,
    product.name,
    product.company,
    product.category,
    product.description,
    product.price.regular,
    product.price.sale || "",
    product.price.currency,
    product.image.src,
    product.badge?.text || "",
    product.badge?.backgroundColor || "",
    product.stockQuantity ?? 0,
    (product.gallery || []).join("|")
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

// Convert categories to CSV
export function categoriesToCSV(categories: CategoryInfo[]): string {
  const headers = [
    "Slug",
    "Name",
    "Description",
    "Long Description",
    "Image URL"
  ];

  const rows = categories.map((category) => [
    category.slug,
    category.name,
    category.description,
    category.longDescription,
    category.image
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

// Parse CSV to products
export function parseProductsCSV(csvContent: string): Partial<Product>[] {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const products: Partial<Product>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < 9) continue; // Skip incomplete rows

    products.push({
      id: parseInt(values[0]) || Date.now() + i,
      name: values[1],
      company: values[2],
      category: values[3],
      description: values[4],
      price: {
        regular: parseFloat(values[5]) || 0,
        sale: values[6] ? parseFloat(values[6]) : undefined,
        currency: values[7] || "USD",
      },
      image: {
        src: values[8] || "",
        alt: values[1] || "",
      },
      badge: values[9] ? {
        text: values[9],
        backgroundColor: values[10] || undefined,
      } : undefined,
      stockQuantity: values[11] ? parseInt(values[11]) || 0 : 0,
      gallery: values[12] ? values[12].split("|").map(u => u.trim()).filter(Boolean) : [],
    });
  }

  return products;
}

// Parse CSV to categories
export function parseCategoriesCSV(csvContent: string): Partial<CategoryInfo>[] {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const categories: Partial<CategoryInfo>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < 5) continue; // Skip incomplete rows

    categories.push({
      slug: values[0],
      name: values[1],
      description: values[2],
      longDescription: values[3],
      image: values[4],
    });
  }
  return categories;
}

// Helper function to parse CSV line (handles quotes)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Download CSV file
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
