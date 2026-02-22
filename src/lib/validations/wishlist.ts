import { z } from "zod";

// Wishlist POST body schema
export const addToWishlistSchema = z.object({
  productId: z
    .number({ error: "Product ID is required" })
    .int({ message: "Product ID must be an integer" })
    .positive({ message: "Product ID must be positive" }),
  notes: z
    .string()
    .max(500, { message: "Notes must not exceed 500 characters" })
    .optional()
    .nullable(),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
