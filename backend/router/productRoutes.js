import express from "express";
import {
  createProduct,
  fetchAllProducts,
  updateProduct,
  deleteProduct,
  fetchSingleProduct,
  postProductReview,
  deleteReview,
  fetchAIFilteredProducts,
} from "../controllers/productController.js";
import {
  authorizedRoles,
  isAuthenticatedUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/admin/create",
  isAuthenticatedUser,
  authorizedRoles("Admin"),
  createProduct
);
router.get("/", fetchAllProducts);
router.get("/singleProduct/:productId", fetchSingleProduct);
router.put(
  "/post-new/review/:productId",
  isAuthenticatedUser,
  postProductReview
);
router.delete("/delete/review/:productId", isAuthenticatedUser, deleteReview);
router.put(
  "/admin/update/:productId",
  isAuthenticatedUser,
  authorizedRoles("Admin"),
  updateProduct
);
router.delete(
  "/admin/delete/:productId",
  isAuthenticatedUser,
  authorizedRoles("Admin"),
  deleteProduct
);
router.post("/ai-search", isAuthenticatedUser, fetchAIFilteredProducts);

export default router;
