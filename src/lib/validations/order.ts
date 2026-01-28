import { z } from "zod";
import {
  emailSchema,
  phoneSchema,
  nameSchema,
  addressSchema,
  citySchema,
  stateSchema,
  zipCodeSchema,
  currencySchema,
  priceSchema,
  positiveNumberSchema,
} from "./common";

// Order item schema
export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1, { message: "Product name is required" }),
  productImage: z.string().url({ message: "Invalid product image URL" }),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
  price: priceSchema,
  total: priceSchema,
});

// Order number schema
export const orderNumberSchema = z
  .string()
  .regex(/^ORD-\d{4}-\d{6}$/, {
    message: "Invalid order number format (expected: ORD-YYYY-NNNNNN)",
  });

// Order status enum
export const orderStatusSchema = z.enum(
  ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
  {
    message: "Invalid order status",
  }
);

// Payment status enum
export const paymentStatusSchema = z.enum(
  ["unpaid", "paid", "refunded", "failed"],
  {
    message: "Invalid payment status",
  }
);

// Payment method enum
export const paymentMethodSchema = z.enum(
  ["credit_card", "debit_card", "paypal", "cod", "stripe"],
  {
    message: "Invalid payment method",
  }
);

// Create order schema (for checkout)
export const createOrderSchema = z.object({
  orderNumber: orderNumberSchema,
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  shippingAddress: addressSchema,
  shippingCity: citySchema,
  shippingState: stateSchema,
  shippingZip: zipCodeSchema,
  shippingCountry: z
    .string()
    .min(2, { message: "Country must be at least 2 characters" })
    .default("USA"),
  items: z
    .array(orderItemSchema)
    .min(1, { message: "Order must contain at least one item" }),
  subtotal: z.coerce.number().pipe(priceSchema),
  tax: z.coerce.number().pipe(priceSchema),
  shippingCost: z.coerce.number().pipe(priceSchema),
  total: z.coerce.number().pipe(priceSchema),
  currency: currencySchema.default("USD"),
  status: orderStatusSchema.default("pending"),
  paymentStatus: paymentStatusSchema.default("unpaid"),
  paymentMethod: paymentMethodSchema,
  notes: z.string().max(500, { message: "Notes must not exceed 500 characters" }).optional(),
});

// Update order schema (for admin)
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  trackingNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

// Type exports
export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
