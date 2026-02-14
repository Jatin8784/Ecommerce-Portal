import pkg from "pg";
const { Client } = pkg;

const database = new Client({
  user: "postgres",
  host: "localhost",
  database: "mern_ecommerce",
  password: "Jatin@2006",
  port: 8000,
});

try {
  await database.connect();
  console.log("✅ Connected to PostgreSQL");
} catch (error) {
  console.error("❌ DB Connection Error:", error.message);
  process.exit(1);
}

export default database;
