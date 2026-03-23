import pkg from "pg";
const { Client } = pkg;

const localUrl = "postgresql://postgres:Jatin@2006@localhost:8000/mern_ecommerce";
const remoteUrl = "postgresql://ecommerce_db_2er6_user:2k47nqifd6hATvQzvk5i114nC3vWgLSP@dpg-d70enf95pdvs7395tno0-a.virginia-postgres.render.com/ecommerce_db_2er6";

const localDb = new Client({ connectionString: localUrl });
const remoteDb = new Client({ 
    connectionString: remoteUrl, 
    ssl: { rejectUnauthorized: false } 
});

// The exact table names in your project
const tables = [
    "users", 
    "products", 
    "reviews",        // Fixed name from product_reviews to reviews
    "orders", 
    "order_items", 
    "shipping_info", 
    "payments"
];

async function migrate() {
  console.log("⏳ Connecting to both databases...");
  await localDb.connect();
  await remoteDb.connect();
  console.log("✅ Ready! Starting secure data migration...");

  for (const table of tables) {
    try {
      const { rows } = await localDb.query(`SELECT * FROM ${table}`);
      console.log(`\n➡️  Found ${rows.length} rows in local '${table}'... Migrating...`);
      
      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);

      for (const row of rows) {
        // Fix for "invalid input syntax for type json"
        const values = Object.values(row).map(val => {
            // If the value is an array or an object (like images JSONB), stringify it!
            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
                return JSON.stringify(val);
            }
            return val;
        });

        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const colNames = columns.map(c => `"${c}"`).join(", ");
        
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
