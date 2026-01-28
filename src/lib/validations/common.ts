import { z } from "zod";

// Common reusable schemas
export const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .email({ message: "Invalid email address" });

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })
  .optional()
  .or(z.literal(""));

export const nameSchema = z
  .string()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(100, { message: "Name must not exceed 100 characters" });

export const addressSchema = z
  .string()
  .min(5, { message: "Address must be at least 5 characters" })
  .max(200, { message: "Address must not exceed 200 characters" });

export const citySchema = z
  .string()
  .min(2, { message: "City must be at least 2 characters" })
  .max(100, { message: "City must not exceed 100 characters" });

export const stateSchema = z
  .string()
  .min(2, { message: "State must be at least 2 characters" })
  .max(50, { message: "State must not exceed 50 characters" });

export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, { message: "Invalid ZIP code format (e.g., 12345 or 12345-6789)" });

export const currencySchema = z.enum(["USD", "EUR", "GBP", "CAD"], {
  message: "Invalid currency",
});

export const positiveNumberSchema = z
  .number()
  .positive({ message: "Must be a positive number" });

export const priceSchema = z
  .number()
  .positive({ message: "Price must be positive" })
  .refine(
    (val) => Math.abs(Math.round(val * 100) - val * 100) < 0.001,
    { message: "Price can have at most 2 decimal places" }
  );

// ID validation
export const idSchema = z.coerce
  .number()
  .int({ message: "ID must be an integer" })
  .positive({ message: "ID must be positive" });

// Slug validation
export const slugSchema = z
  .string()
  .min(1, { message: "Slug is required" })
  .max(100, { message: "Slug must not exceed 100 characters" })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Invalid slug format (use lowercase-with-hyphens)" });

// Pagination schemas
export const pageSchema = z.coerce
  .number()
  .int({ message: "Page must be an integer" })
  .min(1, { message: "Page must be at least 1" })
  .default(1);

export const limitSchema = z.coerce
  .number()
  .int({ message: "Limit must be an integer" })
  .min(1, { message: "Limit must be at least 1" })
  .max(100, { message: "Limit must not exceed 100" })
  .default(10);

// Search query validation
export const searchQuerySchema = z
  .string()
  .max(200, { message: "Search query must not exceed 200 characters" })
  .optional();
