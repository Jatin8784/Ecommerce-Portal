import pkg from "pg";
const { Client } = pkg;

const dbUrl = process.env.DATABASE_URL;

// Render internal database URLs (e.g., dpg-xyz-a) do NOT support SSL.
// External URLs (e.g., from Neon, Supabase, or Render External) DO require SSL.
const isRenderInternal = dbUrl && dbUrl.includes("@dpg-") && !dbUrl.includes(".render.com");

const database = new Client({
  connectionString:
    dbUrl ||
    "postgresql://postgres:Jatin@2006@localhost:8000/mern_ecommerce",
  ssl: (dbUrl && !isRenderInternal) ? { rejectUnauthorized: false } : false,
});

try {
  await database.connect();
  console.log("✅ Connected to PostgreSQL");
} catch (error) {
  console.error("❌ DB Connection Error:", error); // Logs full error instead of just message
  process.exit(1);
}

export default database;
