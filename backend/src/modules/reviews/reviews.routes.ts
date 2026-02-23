import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReview,
} from "./reviews.controller";

export const reviewsRouter = Router();

// Public routes
reviewsRouter.get("/products/:productId", getProductReviews);

// Authenticated routes
reviewsRouter.get("/products/:productId/mine", requireAuth, getMyReview);
reviewsRouter.post("/products/:productId", requireAuth, createReview);
reviewsRouter.put("/products/:productId", requireAuth, updateReview);
reviewsRouter.delete("/products/:productId", requireAuth, deleteReview);
