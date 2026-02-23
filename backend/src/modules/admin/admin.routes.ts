
import { requireAuth } from "../../middleware/auth";
import { Router } from "express";
import { requireAdmin } from "../../middleware/admin";
// @ts-ignore
const multer = require("multer");
import path from "path";
import {
  getDashboardStats,
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listAllOrders,
  getOrderDetails,
  updateOrderStatus,
  listAllUsers,
  getUserDetails,
  listAllReviews,
  deleteReview,
  updateReview,
  uploadProductImage
} from "./admin.controller";


// Multer setup for product image uploads
const storage = multer.diskStorage({
  destination: function (_req: any, _file: any, cb: any) {
    cb(null, path.join(__dirname, '../../uploads/products'));
  },
  filename: function (_req: any, file: any, cb: any) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

export const adminRouter = Router();

// Product image upload endpoint
adminRouter.post("/products/upload-image", upload.single("image"), uploadProductImage);

// All admin routes require authentication + admin role
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// Dashboard
adminRouter.get("/dashboard", getDashboardStats);

// Products
adminRouter.get("/products", listAllProducts);
adminRouter.post("/products", createProduct);
adminRouter.put("/products/:id", updateProduct);
adminRouter.delete("/products/:id", deleteProduct);

// Categories
adminRouter.get("/categories", listAllCategories);
adminRouter.post("/categories", createCategory);
adminRouter.put("/categories/:id", updateCategory);
adminRouter.delete("/categories/:id", deleteCategory);

// Orders
adminRouter.get("/orders", listAllOrders);
adminRouter.get("/orders/:id", getOrderDetails);
adminRouter.put("/orders/:id/status", updateOrderStatus);

// Users
adminRouter.get("/users", listAllUsers);
adminRouter.get("/users/:id", getUserDetails);

// Reviews
adminRouter.get("/reviews", listAllReviews);
adminRouter.delete("/reviews/:id", deleteReview);
adminRouter.put("/reviews/:id", updateReview);
