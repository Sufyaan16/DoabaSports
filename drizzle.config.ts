import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import assert from "node:assert";

assert(process.env.DATABASE_URL, "You need database url");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
