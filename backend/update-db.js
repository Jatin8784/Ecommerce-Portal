import database from "./database/db.js";

async function updateDb() {
  try {
    console.log("⏳ Updating users table...");
    
    // Add google_id column if it doesn't exist
    await database.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) UNIQUE DEFAULT NULL
    `);
    
    // Make password column nullable
    await database.query(`
      ALTER TABLE users 
      ALTER COLUMN password DROP NOT NULL
    `);
    
    console.log("✅ Database updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating database:", error);
    process.exit(1);
  }
}

updateDb();
