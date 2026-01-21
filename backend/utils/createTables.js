import createUserTable from "../models/userTable.js";
import createProductsTable from "../models/productTable.js";
import createShippingInfoTable from "../models/shippinginfoTable.js";
import createProductReviewsTable from "../models/productReviewsTable.js";
import createPaymentsTable from "../models/paymentsTable.js";
import createOrdersTable from "../models/ordersTable.js";
import createOrderItemTable from "../models/orderItemsTable.js";

export default async function createTables() {
  try {
    await createUserTable();
    await createProductsTable();
    await createProductReviewsTable();
    await createOrdersTable();
    await createOrderItemTable();
    await createShippingInfoTable();
    await createPaymentsTable();
    console.log("All Tables Created Successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  }
}
