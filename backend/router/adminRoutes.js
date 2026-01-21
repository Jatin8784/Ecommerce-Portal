import express from "express";
import {
  getAllUsers,
  deleteUser,
  dashboardStats,
} from "../controllers/adminController.js";
import {
  authorizedRoles,
  isAuthenticatedUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/getallusers",
  isAuthenticatedUser,
  authorizedRoles("Admin"),
  getAllUsers
); // Dashboard

router.delete(
  "/delete/:id",
  isAuthenticatedUser,
  authorizedRoles("Admin"),
  deleteUser
);

router.get(
  "/fetch/dashboard-stats",
  isAuthenticatedUser,
  authorizedRoles("Admin"),
  dashboardStats
);

export default router;
