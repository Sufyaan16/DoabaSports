import { z } from "zod";
import { priceSchema, currencySchema, slugSchema, pageSchema, limitSchema, searchQuerySchema } from "./common";

// Product badge schema
const productBadgeSchema = z.object({
  text: z.string().min(1, "Badge text is required").max(20, "Badge text must be 20 characters or less"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use hex #RRGGBB)").optional(),
});

// Product image schema
const productImageSchema = z.object({
  src: z.string().url("Invalid image URL"),
  alt: z.string().min(1, "Image alt text is required").max(200, "Alt text must be 200 characters or less"),
});

// Base product fields
const baseProductSchema = z.object({
  name: z.string()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be 200 characters or less"),
  company: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be 100 characters or less"),
  category: z.string()
    .min(1, "Category is required")
    .max(100, "Category must be 100 characters or less"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1000 characters or less"),
  priceRegular: priceSchema,
  priceSale: priceSchema.optional(),
  priceCurrency: currencySchema,
  imageSrc: z.string().url("Invalid image URL"),
  imageAlt: z.string()
    .min(1, "Image alt text is required")
    .max(200, "Alt text must be 200 characters or less"),
  imageHoverSrc: z.string().url("Invalid hover image URL").optional().nullable(),
  imageHoverAlt: z.string()
    .max(200, "Hover alt text must be 200 characters or less")
    .optional()
    .nullable(),
  badgeText: z.string()
    .min(1)
    .max(20, "Badge text must be 20 characters or less")
    .optional()
    .nullable(),
  badgeBackgroundColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use hex #RRGGBB)")
    .optional()
    .nullable(),
  
  // Inventory Management
  sku: z.string()
    .max(100, "SKU must be 100 characters or less")
    .optional()
    .nullable(),
  stockQuantity: z.coerce.number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative")
    .default(0),
  lowStockThreshold: z.coerce.number()
    .int("Low stock threshold must be an integer")
    .min(0, "Low stock threshold cannot be negative")
    .default(10),
  trackInventory: z.boolean().default(true),
});

// Create product schema (all fields required except optional ones)
export const createProductSchema = baseProductSchema.refine(
  (data) => {
    // If priceSale exists, it must be less than priceRegular
    if (data.priceSale !== undefined && data.priceSale !== null) {
      return data.priceSale < data.priceRegular;
    }
    return true;
  },
  {
    message: "Sale price must be less than regular price",
    path: ["priceSale"],
  }
);

// Update product schema (all fields optional)
export const updateProductSchema = baseProductSchema.partial().refine(
  (data) => {
    // If both prices exist, validate sale < regular
    if (data.priceSale !== undefined && data.priceRegular !== undefined) {
      return data.priceSale < data.priceRegular;
    }
    return true;
  },
  {
    message: "Sale price must be less than regular price",
    path: ["priceSale"],
  }
);

// Query parameters for filtering products
export const productQuerySchema = z.object({
  category: slugSchema.optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  search: searchQuerySchema,
  page: pageSchema,
  limit: limitSchema,
  sortBy: z.enum(["newest", "price-low", "price-high", "name-asc", "name-desc"]).default("newest"),
});

// Type exports
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
