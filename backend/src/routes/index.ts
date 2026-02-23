import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import { catalogRouter } from "../modules/catalog/catalog.routes";
import { ordersRouter } from "../modules/orders/orders.routes";
import { usersRouter } from "../modules/users/users.routes";
import { wishlistRouter } from "../modules/wishlist/wishlist.routes";
import { reviewsRouter } from "../modules/reviews/reviews.routes";

import contactRouter from "./contactRouter";
import { adminRouter } from "../modules/admin/admin.routes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/auth", authRouter);
routes.use("/cart", cartRouter);
routes.use("/orders", ordersRouter);
routes.use("/users", usersRouter);
routes.use("/wishlist", wishlistRouter);
routes.use("/reviews", reviewsRouter);
routes.use("/admin", adminRouter);

routes.use(contactRouter);
routes.use("/", catalogRouter);
