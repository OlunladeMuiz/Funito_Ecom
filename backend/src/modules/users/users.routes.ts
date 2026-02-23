import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  getProfile,
  updateProfile,
  changePassword,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "./users.controller";

export const usersRouter = Router();

// Profile routes
usersRouter.get("/profile", requireAuth, getProfile);
usersRouter.put("/profile", requireAuth, updateProfile);
usersRouter.post("/profile/password", requireAuth, changePassword);

// Address routes
usersRouter.get("/addresses", requireAuth, listAddresses);
usersRouter.post("/addresses", requireAuth, createAddress);
usersRouter.put("/addresses/:id", requireAuth, updateAddress);
usersRouter.delete("/addresses/:id", requireAuth, deleteAddress);
