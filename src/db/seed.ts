import db, { sql } from "@/db/index";
import { categories, products, orders } from "@/db/schema";
import { CATEGORY_INFO } from "@/lib/data/categories";
import { ALL_PRODUCTS } from "@/lib/data/products";

// Sample order data
const SAMPLE_ORDERS = [
  {
    orderNumber: "ORD-2026-000001",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    customerPhone: "+1-555-0101",
    shippingAddress: "123 Main Street, Apt 4B",
    shippingCity: "New York",
    shippingState: "NY",
    shippingZip: "10001",
    shippingCountry: "USA",
    items: [
      {
        productId: 1,
        productName: "Legend Pro Elite",
        productImage: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
        quantity: 1,
        price: 299.0,
        total: 299.0,
      },
      {
        productId: 2,
        productName: "Elite Batting Gloves",
        productImage: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
        quantity: 2,
        price: 69.0,
        total: 138.0,
      },
    ],
    subtotal: "437.00",
    tax: "35.00",
    shippingCost: "15.00",
    total: "487.00",
    currency: "USD",
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "credit_card",
    notes: "Please deliver between 9 AM - 5 PM",
    trackingNumber: "TRK123456789",
  },
  {
    orderNumber: "ORD-2026-000002",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    customerPhone: "+1-555-0102",
    shippingAddress: "456 Oak Avenue",
    shippingCity: "Los Angeles",
    shippingState: "CA",
    shippingZip: "90001",
    shippingCountry: "USA",
    items: [
      {
        productId: 3,
        productName: "Pro Kit Bag",
        productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        quantity: 1,
        price: 99.0,
        total: 99.0,
      },
    ],
    subtotal: "99.00",
    tax: "8.00",
    shippingCost: "10.00",
    total: "117.00",
    currency: "USD",
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "paypal",
    trackingNumber: "TRK987654321",
  },
  {
    orderNumber: "ORD-2026-000003",
    customerName: "Mike Johnson",
    customerEmail: "mike.j@example.com",
    customerPhone: "+1-555-0103",
    shippingAddress: "789 Pine Road",
    shippingCity: "Chicago",
    shippingState: "IL",
    shippingZip: "60601",
    shippingCountry: "USA",
    items: [
      {
        productId: 4,
        productName: "Team Jersey Set",
        productImage: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
        quantity: 3,
        price: 59.0,
        total: 177.0,
      },
      {
        productId: 5,
        productName: "Cricket Shoes",
        productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        quantity: 1,
        price: 99.0,
        total: 99.0,
      },
    ],
    subtotal: "276.00",
    tax: "22.00",
    shippingCost: "12.00",
    total: "310.00",
    currency: "USD",
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "credit_card",
  },
  {
    orderNumber: "ORD-2026-000004",
    customerName: "Sarah Williams",
    customerEmail: "sarah.w@example.com",
    customerPhone: "+1-555-0104",
    shippingAddress: "321 Elm Street",
    shippingCity: "Houston",
    shippingState: "TX",
    shippingZip: "77001",
    shippingCountry: "USA",
    items: [
      {
        productId: 1,
        productName: "Legend Pro Elite",
        productImage: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
        quantity: 1,
        price: 299.0,
        total: 299.0,
      },
    ],
    subtotal: "299.00",
    tax: "24.00",
    shippingCost: "15.00",
    total: "338.00",
    currency: "USD",
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: "cod",
    notes: "Cash on delivery",
  },
  {
    orderNumber: "ORD-2026-000005",
    customerName: "David Brown",
    customerEmail: "david.brown@example.com",
    customerPhone: "+1-555-0105",
    shippingAddress: "654 Maple Drive",
    shippingCity: "Miami",
    shippingState: "FL",
    shippingZip: "33101",
    shippingCountry: "USA",
    items: [
      {
        productId: 6,
        productName: "Leather Cricket Ball Set",
        productImage: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=800&q=80",
        quantity: 2,
        price: 69.0,
        total: 138.0,
      },
      {
        productId: 7,
        productName: "Bat Care Kit",
        productImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
        quantity: 1,
        price: 29.0,
        total: 29.0,
      },
    ],
    subtotal: "167.00",
    tax: "13.00",
    shippingCost: "10.00",
    total: "190.00",
    currency: "USD",
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "credit_card",
    notes: "Customer requested cancellation",
  },
];

async function main() {
  try {
    console.log("🌱 Starting database seed...");

    // Truncate tables
    console.log("🧹 Truncating tables...");
    await sql.query("TRUNCATE TABLE orders RESTART IDENTITY CASCADE;");
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
    }));

    await db.insert(categories).values(categoryData);
    console.log(`✅ Inserted ${categoryData.length} categories`);

    // Seed products
    console.log("🏏 Seeding products...");
    const productData = ALL_PRODUCTS.map((product) => ({
      name: product.name,
      company: product.company,
      category: product.category,
      imageSrc: product.image.src,
      imageAlt: product.image.alt,
      description: product.description,
      priceRegular: product.price.regular.toString(),
      priceSale: product.price.sale?.toString() || null,
      priceCurrency: product.price.currency,
      badgeText: product.badge?.text || null,
      badgeBackgroundColor: product.badge?.backgroundColor || null,
    }));

    await db.insert(products).values(productData);
    console.log(`✅ Inserted ${productData.length} products`);

    // Seed orders
    console.log("📦 Seeding orders...");
    await db.insert(orders).values(SAMPLE_ORDERS);
    console.log(`✅ Inserted ${SAMPLE_ORDERS.length} orders`);

    // Sync sequences
    console.log("🔄 Syncing sequences...");
    await sql.query(
      `SELECT setval(pg_get_serial_sequence('categories','id'), COALESCE((SELECT MAX(id) FROM categories), 1), true);`
    );
    await sql.query(
      `SELECT setval(pg_get_serial_sequence('products','id'), COALESCE((SELECT MAX(id) FROM products), 1), true);`
    );
    await sql.query(
      `SELECT setval(pg_get_serial_sequence('orders','id'), COALESCE((SELECT MAX(id) FROM orders), 1), true);`
    );
    console.log("✅ Sequences synced");

    console.log("\n🎉 Database seeded successfully!");
  } catch (err) {
    console.error("💥 Seed failed:", err);
    process.exit(1);
  }
}

void main();
