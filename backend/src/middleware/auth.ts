import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = auth.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      sub: string;
      role: string;
    };
    req.userId = payload.sub;
    req.role = payload.role;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
