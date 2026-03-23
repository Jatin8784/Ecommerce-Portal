import pkg from "pg";
const { Client } = pkg;

const database = new Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:Jatin@2006@localhost:8000/mern_ecommerce",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

try {
  await database.connect();
  console.log("✅ Connected to PostgreSQL");
} catch (error) {
  console.error("❌ DB Connection Error:", error.message);
  process.exit(1);
}

export default database;
