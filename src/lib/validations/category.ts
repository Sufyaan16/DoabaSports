import { z } from "zod";

// Shared category slug regex pattern
const CATEGORY_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Base category fields
const baseCategorySchema = z.object({
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be 100 characters or less")
    .regex(CATEGORY_SLUG_REGEX, "Slug must be lowercase with hyphens only (e.g., 'category-name')"),
  name: z.string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be 100 characters or less"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be 500 characters or less"),
  longDescription: z.string()
    .min(20, "Long description must be at least 20 characters")
    .max(2000, "Long description must be 2000 characters or less"),
  image: z.string().url("Invalid image URL"),
  imageHover: z.string().url("Invalid hover image URL").optional(),
});

// Create category schema (all fields required except optional ones)
export const createCategorySchema = baseCategorySchema;

// Update category schema (all fields optional)
export const updateCategorySchema = baseCategorySchema.partial();

// Category slug parameter validation
export const categorySlugSchema = z.string()
  .min(2, "Category slug must be at least 2 characters")
  .max(100)
  .regex(CATEGORY_SLUG_REGEX, "Invalid category slug format");

// Type exports
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
