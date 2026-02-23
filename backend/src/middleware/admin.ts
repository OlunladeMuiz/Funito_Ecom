import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}
