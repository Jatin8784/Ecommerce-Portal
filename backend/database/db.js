import pkg from "pg";
import { config } from "dotenv";

config({ path: "./config/config.env" });

const { Client } = pkg;

const database = new Client({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

try {
  await database.connect();
  console.log("✅ Connected to PostgreSQL");
} catch (error) {
  console.error("❌ DB Connection Error:", error.message);
  process.exit(1);
}

export default database;
