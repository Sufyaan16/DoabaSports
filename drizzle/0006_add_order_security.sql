-- Add userId to orders for ownership tracking
ALTER TABLE "orders" ADD COLUMN "user_id" text;

-- Add soft-delete column
ALTER TABLE "orders" ADD COLUMN "deleted_at" timestamp;

-- Backfill userId from customerEmail where possible
-- (existing orders won't have userId, but new ones will)

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_customer_email" ON "orders" ("customer_email");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "idx_orders_order_number" ON "orders" ("order_number");
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products" ("category");
CREATE INDEX IF NOT EXISTS "idx_wishlists_user_id" ON "wishlists" ("user_id");
