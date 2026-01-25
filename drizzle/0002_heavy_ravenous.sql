CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"long_description" text NOT NULL,
	"image" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text NOT NULL,
	"category" text NOT NULL,
	"image_src" text NOT NULL,
	"image_alt" text NOT NULL,
	"description" text NOT NULL,
	"price_regular" numeric(10, 2) NOT NULL,
	"price_sale" numeric(10, 2),
	"price_currency" text DEFAULT 'USD' NOT NULL,
	"badge_text" text,
	"badge_background_color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "articles" CASCADE;