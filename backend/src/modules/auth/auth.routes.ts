import { Router } from "express";
import {
  login,
  logout,
  refresh,
  signup,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
