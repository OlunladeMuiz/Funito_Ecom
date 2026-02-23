import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  listWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from "./wishlist.controller";

export const wishlistRouter = Router();

wishlistRouter.get("/", requireAuth, listWishlist);
wishlistRouter.post("/", requireAuth, addToWishlist);
wishlistRouter.get("/:productId/check", requireAuth, checkWishlist);
wishlistRouter.delete("/:productId", requireAuth, removeFromWishlist);
