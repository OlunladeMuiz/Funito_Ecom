import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export function signAccessToken(userId: string, role: string) {
  const options: SignOptions = {
    subject: userId,
    expiresIn: env.JWT_ACCESS_TTL as SignOptions["expiresIn"],
  };
  return jwt.sign({ role }, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(userId: string) {
  const options: SignOptions = {
    subject: userId,
    expiresIn: env.JWT_REFRESH_TTL as SignOptions["expiresIn"],
  };
  return jwt.sign({}, env.JWT_REFRESH_SECRET, options);
}
