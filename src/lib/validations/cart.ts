import { z } from "zod";
import { positiveNumberSchema, idSchema } from "./common";

// Maximum items per cart
export const MAX_CART_ITEMS = 50;
export const MAX_ITEM_QUANTITY = 99;
export const MIN_ITEM_QUANTITY = 1;

// Cart item schema
export const cartItemSchema = z.object({
  productId: idSchema,
  quantity: z
    .number()
    .int({ message: "Quantity must be an integer" })
    .min(MIN_ITEM_QUANTITY, { message: `Quantity must be at least ${MIN_ITEM_QUANTITY}` })
    .max(MAX_ITEM_QUANTITY, { message: `Quantity cannot exceed ${MAX_ITEM_QUANTITY}` }),
});

// Update entire cart (for merging)
export const updateCartSchema = z.object({
  items: z
    .array(cartItemSchema)
    .max(MAX_CART_ITEMS, { message: `Cart cannot contain more than ${MAX_CART_ITEMS} items` })
    .default([]),
});

// Update single cart item
export const updateCartItemSchema = z.object({
  productId: idSchema,
  quantity: z
    .number()
    .int({ message: "Quantity must be an integer" })
    .min(0, { message: "Quantity must be at least 0" }) // 0 to remove
    .max(MAX_ITEM_QUANTITY, { message: `Quantity cannot exceed ${MAX_ITEM_QUANTITY}` }),
});

// Type exports
export type CartItem = z.infer<typeof cartItemSchema>;
export type UpdateCart = z.infer<typeof updateCartSchema>;
export type UpdateCartItem = z.infer<typeof updateCartItemSchema>;
