import database from "../database/db.js";

export default async function createOrdersTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        buyer_id UUID NOT NULL,
        total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
        tax_price DECIMAL(10,2) NOT NULL CHECK (tax_price >= 0),
        shipping_price DECIMAL(10,2) NOT NULL CHECK (shipping_price >= 0),
        order_status VARCHAR(50) DEFAULT 'Processing' CHECK (
          order_status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')
        ),
        paid_at TIMESTAMP CHECK (paid_at IS NULL OR paid_at <= CURRENT_TIMESTAMP),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await database.query(query);
    console.log("✅ Orders table created or already exists.");
  } catch (error) {
    console.error("❌ Failed to create Orders table:", error);
    process.exit(1);
  }
}
