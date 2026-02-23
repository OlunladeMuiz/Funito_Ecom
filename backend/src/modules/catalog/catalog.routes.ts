import { Router } from "express";
import {
  listCategories,
  listProducts,
  getProduct,
} from "./catalog.controller";

export const catalogRouter = Router();

catalogRouter.get("/products", listProducts);
catalogRouter.get("/products/:id", getProduct);
catalogRouter.get("/categories", listCategories);
