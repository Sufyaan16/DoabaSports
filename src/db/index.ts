import assert from "node:assert";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import "dotenv/config";

assert(process.env.DATABASE_URL, "YOu need a database url");

export const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql, { schema });

export default db;
