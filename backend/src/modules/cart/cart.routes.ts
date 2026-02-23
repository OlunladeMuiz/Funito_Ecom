import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  addItem,
  getCart,
  removeItem,
  updateItem,
} from "./cart.controller";

export const cartRouter = Router();

cartRouter.get("/", requireAuth, getCart);
cartRouter.post("/items", requireAuth, addItem);
cartRouter.put("/items/:id", requireAuth, updateItem);
cartRouter.delete("/items/:id", requireAuth, removeItem);
