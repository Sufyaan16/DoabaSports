import { boolean, decimal, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

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

const schema = { categories, products };

export default schema;

// Type exports
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
