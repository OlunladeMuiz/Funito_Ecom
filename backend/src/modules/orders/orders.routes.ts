import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { checkout, listOrders, getOrder } from "./orders.controller";

export const ordersRouter = Router();

ordersRouter.post("/checkout", requireAuth, checkout);
ordersRouter.get("/", requireAuth, listOrders);
ordersRouter.get("/:id", requireAuth, getOrder);
