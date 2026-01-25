import db, { sql } from "@/db/index";
import { categories, products } from "@/db/schema";
import { CATEGORY_INFO } from "@/lib/data/categories";
import { CRICKET_BATS } from "@/lib/data/products";

async function main() {
  try {
    console.log("🌱 Starting database seed...");

    // Truncate tables
    console.log("🧹 Truncating tables...");
    await sql.query("TRUNCATE TABLE products RESTART IDENTITY CASCADE;");
    await sql.query("TRUNCATE TABLE categories RESTART IDENTITY CASCADE;");

    // Seed categories
    console.log("🏷️  Seeding categories...");
    const categoryData = Object.values(CATEGORY_INFO).map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      longDescription: cat.longDescription,
      image: cat.image,
      imageHover: cat.imageHover || null,
    }));

    await db.insert(categories).values(categoryData);
    console.log(`✅ Inserted ${categoryData.length} categories`);

    // Seed products
    console.log("🏏 Seeding products...");
    const productData = CRICKET_BATS.map((product) => ({
      name: product.name,
      company: product.company,
      category: product.category,
      imageSrc: product.image.src,
      imageAlt: product.image.alt,
      imageHoverSrc: product.imageHover?.src || null,
      imageHoverAlt: product.imageHover?.alt || null,
      description: product.description,
      priceRegular: product.price.regular.toString(),
      priceSale: product.price.sale?.toString() || null,
      priceCurrency: product.price.currency,
      badgeText: product.badge?.text || null,
      badgeBackgroundColor: product.badge?.backgroundColor || null,
    }));

    await db.insert(products).values(productData);
    console.log(`✅ Inserted ${productData.length} products`);

    // Sync sequences
    console.log("🔄 Syncing sequences...");
    await sql.query(
      `SELECT setval(pg_get_serial_sequence('categories','id'), COALESCE((SELECT MAX(id) FROM categories), 1), true);`
    );
    await sql.query(
      `SELECT setval(pg_get_serial_sequence('products','id'), COALESCE((SELECT MAX(id) FROM products), 1), true);`
    );
    console.log("✅ Sequences synced");

    console.log("\n🎉 Database seeded successfully!");
  } catch (err) {
    console.error("💥 Seed failed:", err);
    process.exit(1);
  }
}

void main();
