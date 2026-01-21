import express from "express";
import {
  fetchSingleOrder,
  placeNewOrder,
  fetchMyOrders,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import {
  isAuthenticatedUser,
  authorizedRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/new", isAuthenticatedUser, placeNewOrder);
router.get("/:orderId", isAuthenticatedUser, fetchSingleOrder);
router.get("/orders/me", isAuthenticatedUser, fetchMyOrders);
router.get(
  "/admin/getall",
  isAuthenticatedUser,
  authorizedRoles("Admin"),
  fetchAllOrders
);
router.put(
  "/admin/update/:orderId",
  isAuthenticatedUser,
  authorizedRoles("Admin"),
  updateOrderStatus
);
router.delete(
  "/admin/delete/:orderId",
  isAuthenticatedUser,
  authorizedRoles("Admin"),
  deleteOrder
);

export default router;
