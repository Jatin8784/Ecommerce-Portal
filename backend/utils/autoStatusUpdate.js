import database from "../database/db.js";

/**
 * Automatically advances order statuses based on time elapsed since creation.
 * - Processing -> Shipped: After 24 hours
 * - Shipped -> Delivered: After 72 hours
 */
export const triggerAutoStatusUpdate = async () => {
    try {
        // Advance orders from 'Processing' to 'Shipped' after 24 hours
        await database.query(`
            UPDATE orders 
            SET order_status = 'Shipped' 
            WHERE order_status = 'Processing' 
            AND created_at <= NOW() - INTERVAL '24 hours'
        `);

        // Advance orders from 'Shipped' (or lingering 'Processing') to 'Delivered' after 72 hours
        await database.query(`
            UPDATE orders 
            SET order_status = 'Delivered' 
            WHERE (order_status = 'Shipped' OR order_status = 'Processing')
            AND order_status != 'Cancelled'
            AND created_at <= NOW() - INTERVAL '72 hours'
        `);
        
    } catch (error) {
        console.error("Error in triggerAutoStatusUpdate:", error);
    }
};
