-- Add inventory management fields to products table
ALTER TABLE "products" ADD COLUMN "sku" text UNIQUE;
ALTER TABLE "products" ADD COLUMN "stock_quantity" integer NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "low_stock_threshold" integer NOT NULL DEFAULT 10;
ALTER TABLE "products" ADD COLUMN "track_inventory" boolean NOT NULL DEFAULT true;
