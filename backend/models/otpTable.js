import database from "../database/db.js";

export default async function createOtpTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS otps (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(100) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
    await database.query(query);
    console.log("✅ Otps table created or already exists.");
  } catch (error) {
    console.error("❌ Failed to create Otps table:", error);
    process.exit(1);
  }
}
