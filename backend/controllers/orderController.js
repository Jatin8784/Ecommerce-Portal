import ErrorHandler from "../middleware/errorMiddlewares.js";
import { catchAsyncErrors } from "../middleware/catchAsyncError.js";
import database from "../database/db.js";
import { createRazorpayOrder } from "../utils/createRazorpayOrder.js";

export const placeNewOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    full_name,
    state,
    city,
    country,
    address,
    pincode,
    phone,
    payment_method = "Online",
  } = req.body;

  let { orderedItems } = req.body;

  if (typeof orderedItems === "string") {
    orderedItems = JSON.parse(orderedItems);
  }

  if (
    !full_name ||
    !state ||
    !city ||
    !country ||
    !address ||
    !pincode ||
    !phone
  ) {
    return next(
      new ErrorHandler("Please Provide complete shipping details.", 400),
    );
  }

  if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
    return next(new ErrorHandler("No items in cart.", 400));
  }

  const items = orderedItems;

  const productIds = items.map((item) => item.product.id);
  const { rows: products } = await database.query(
    `SELECT id, price, stock, name FROM products WHERE id = ANY($1::uuid[])`,
    [productIds],
  );

  let total_price = 0;
  const values = [];
  const placeholders = [];

  items.forEach((item, index) => {
    const product = products.find((p) => p.id === item.product.id);

    if (!product) {
      return next(
        new ErrorHandler(`Product not found for ID: ${item.product.id}`, 404),
      );
    }

    if (item.quantity > product.stock) {
      return next(
        new ErrorHandler(
          `Only ${product.stock} units available for ${product.name}`,
          400,
        ),
      );
    }

    const itemTotal = product.price * item.quantity;
    total_price += itemTotal;

    values.push(
      null,
      product.id,
      item.quantity,
      product.price,
      item.product.images[0].url || "",
      product.name,
    );

    const offset = index * 6;

    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${
        offset + 5
      }, $${offset + 6})`,
    );
  });

  const tax_price = 0.18;
  const shipping_price = total_price >= 50 ? 0 : 2;
  total_price = Math.round(
    total_price + total_price * tax_price + shipping_price,
  );

  const orderResult = await database.query(
    `INSERT INTO orders(buyer_id, total_price, tax_price, shipping_price, payment_method) VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [req.user.id, total_price, tax_price, shipping_price, payment_method],
  );

  const orderId = orderResult.rows[0].id;

  for (let i = 0; i < values.length; i += 6) {
    values[i] = orderId;
  }

  await database.query(
    `INSERT INTO order_items (order_id, product_id, quantity, price, image, title)
   VALUES ${placeholders.join(", ")}
   RETURNING *`,
    values,
  );

  await database.query(
    `INSERT INTO shipping_info (order_id, full_name, state, city, country, address, pincode, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [orderId, full_name, state, city, country, address, pincode, phone],
  );

  if (payment_method === "COD") {
    await database.query(
      "INSERT INTO payments (order_id, payment_type, payment_status) VALUES($1, $2, $3)",
      [orderId, "COD", "Pending"],
    );

    return res.status(200).json({
      success: true,
      message: "Order Placed Successfully via Cash On Delivery.",
      orderId,
      total_price,
    });
  }

  const paymentResponse = await createRazorpayOrder(orderId, total_price);

  if (!paymentResponse.success) {
    return next(new ErrorHandler("Payment setup failed: " + paymentResponse.message, 500));
  }

  res.status(200).json({
    success: true,
    message: "Order Placed Successfully. Proceed to Payment.",
    orderId,
    razorpayOrderId: paymentResponse.razorpayOrder.id,
    amount: paymentResponse.razorpayOrder.amount,
    currency: paymentResponse.razorpayOrder.currency,
    total_price,
  });
});

export const fetchSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const result = await database.query(
    `
    SELECT 
    o.*, 
    COALESCE(
        json_agg(
            json_build_object(
                'order_item_id', oi.id,
                'order_id', oi.order_id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price,
                'image', oi.image,
                'title', oi.title
            )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'
    ) AS order_items,
    json_build_object(
        'full_name', s.full_name,
        'state', s.state,
        'city', s.city,
        'country', s.country,
        'address', s.address,
        'pincode', s.pincode,
        'phone', s.phone
    ) AS shipping_info
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN shipping_info s ON o.id = s.order_id
    WHERE o.id = $1  -- Changed from buyer_id to id and removed paid_at check
    GROUP BY o.id, s.id;
    `,
    [orderId],
  );

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order fetched.",
    order: result.rows[0],
  });
});

export const fetchMyOrders = catchAsyncErrors(async (req, res, next) => {
  const result = await database.query(
    `
    SELECT o.*, COALESCE(
    json_agg(
      json_build_object(
          'order_item_id', oi.id,
                'order_id', oi.order_id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price,
                'image', oi.image,
                'title', oi.title
      ) 
    ) FILTER (WHERE oi.id IS NOT NULL), '[]'
    ) AS order_items,
       json_build_object(
        'full_name', s.full_name,
        'state', s.state,
        'city', s.city,
        'country', s.country,
        'address', s.address,
        'pincode', s.pincode,
        'phone', s.phone
    ) AS shipping_info 
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN shipping_info s ON o.id = s.order_id
      WHERE o.buyer_id = $1
      GROUP BY o.id, s.id
      ORDER BY o.created_at DESC
        `,
    [req.user.id],
  );

  res.status(200).json({
    success: true,
    message: "All your orders are fetched.",
    myOrders: result.rows,
  });
});

export const fetchAllOrders = catchAsyncErrors(async (req, res, next) => {
  const result = await database.query(`
    SELECT o.*,
    COALESCE(json_agg(
      json_build_object(
        'order_item_id', oi.id,
        'order_id', oi.order_id,
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'image', oi.image,
        'title', oi.title
      )
    ) FILTER (WHERE oi.id IS NOT NULL), '[]' ) AS order_items, 
    json_build_object(
        'full_name', s.full_name,
        'state', s.state,
        'city', s.city,
        'country', s.country,
        'address', s.address,
        'pincode', s.pincode,
        'phone', s.phone 
    ) AS shipping_info
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN shipping_info s ON o.id = s.order_id
     GROUP BY o.id, s.id
     ORDER BY o.created_at DESC
    `);

  res.status(200).json({
    success: true,
    orders: result.rows,
  });
});

export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const { orderId } = req.params;

  const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

  const exactStatus = validStatuses.find(
    (s) => s.toLowerCase() === status.toLowerCase(),
  );

  if (!exactStatus) {
    return next(new ErrorHandler("Invalid status provided.", 400));
  }

  const result = await database.query(
    `UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *`,
    [exactStatus, orderId],
  );

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Order not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order status updated.",
    updatedOrder: result.rows[0],
  });
});

export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const result = await database.query(
    `DELETE FROM orders WHERE id = $1 RETURNING *`,
    [orderId],
  );

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Invalid order ID.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order deleted.",
    order: result.rows[0],
  });
});
