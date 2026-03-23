import pkg from "pg";
const { Client } = pkg;

// This script will read from your local Postgres and copy it safely into your new Render Postgres!
const localUrl = "postgresql://postgres:Jatin@2006@localhost:8000/mern_ecommerce";
const remoteUrl = "postgresql://ecommerce_db_2er6_user:2k47nqifd6hATvQzvk5i114nC3vWgLSP@dpg-d70enf95pdvs7395tno0-a.virginia-postgres.render.com/ecommerce_db_2er6";

const localDb = new Client({ connectionString: localUrl });
const remoteDb = new Client({ 
    connectionString: remoteUrl, 
    ssl: { rejectUnauthorized: false } 
});

// We list tables in the exact order they need to be inserted to respect foreign keys!
const tables = [
    "users", 
    "products", 
    "product_reviews", 
    "orders", 
    "order_items", 
    "shipping_info", 
    "payments"
];

async function migrate() {
  console.log("⏳ Connecting to both databases...");
  await localDb.connect();
  await remoteDb.connect();
  console.log("✅ Custom Migration Started!");

  for (const table of tables) {
    try {
      const { rows } = await localDb.query(`SELECT * FROM ${table}`);
      console.log(`\n➡️  Found ${rows.length} rows in local '${table}'... Migrating to Render...`);
      
      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);

      for (const row of rows) {
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const colNames = columns.map(c => `"${c}"`).join(", ");
        
        // We use ON CONFLICT DO NOTHING so it won't crash if you run it twice
        await remoteDb.query(
          `INSERT INTO ${table} (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
      }
      console.log(`✅ Success for ${table}`);
    } catch (e) {
      console.error(`❌ Failed migrating ${table}:`, e.message);
    }
  }

  console.log("\n🎉 Database Migration Complete!");
  localDb.end();
  remoteDb.end();
}

migrate();
