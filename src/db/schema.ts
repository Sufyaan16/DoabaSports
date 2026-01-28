import { boolean, decimal, integer, pgTable, serial, text, timestamp, json } from "drizzle-orm/pg-core";

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description").notNull(),
  image: text("image").notNull(),
  imageHover: text("image_hover"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// Products Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  category: text("category").notNull(), // References categories.slug
  imageSrc: text("image_src").notNull(),
  imageAlt: text("image_alt").notNull(),
  imageHoverSrc: text("image_hover_src"),
  imageHoverAlt: text("image_hover_alt"),
  description: text("description").notNull(),
  priceRegular: decimal("price_regular", { precision: 10, scale: 2 }).notNull(),
  priceSale: decimal("price_sale", { precision: 10, scale: 2 }),
  priceCurrency: text("price_currency").notNull().default("USD"),
  badgeText: text("badge_text"),
  badgeBackgroundColor: text("badge_background_color"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  
  // Customer Information
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  
  // Shipping Address
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingZip: text("shipping_zip").notNull(),
  shippingCountry: text("shipping_country").notNull().default("USA"),
  
  // Order Items (stored as JSON array)
  items: json("items").notNull().$type<Array<{
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    total: number;
  }>>(),
  
  // Order Financial Details
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0.00"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  
  // Order Status and Management
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled, refunded
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid, paid, refunded, failed
  paymentMethod: text("payment_method"), // credit_card, paypal, cod, etc
  
  // Additional Information
  notes: text("notes"),
  trackingNumber: text("tracking_number"),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  shippedAt: timestamp("shipped_at", { mode: "string" }),
  deliveredAt: timestamp("delivered_at", { mode: "string" }),
});

// Cart Table
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // StackAuth user ID
  items: json("items").notNull().$type<Array<{
    productId: number;
    quantity: number;
  }>>().default([]),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

const schema = { categories, products, orders, carts };

export default schema;

// Type exports
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
