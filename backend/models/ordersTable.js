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
        payment_method VARCHAR(50) DEFAULT 'Online' CHECK (
          payment_method IN ('COD', 'Online')
        ),
        paid_at TIMESTAMP CHECK (paid_at IS NULL OR paid_at <= CURRENT_TIMESTAMP),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await database.query(query);
    
    // Auto-migration: Update CHECK constraint for payment_method
    try {
      await database.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;`);
      await database.query(`ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('COD', 'Online'));`);
    } catch (err) {
      console.log("Hint: Payment method constraint might already be updated.");
    }

    console.log("✅ Orders table updated successfully.");
  } catch (error) {
    console.error("❌ Failed to create Orders table:", error);
    process.exit(1);
  }
}
