import { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";
import { env } from "../../config/env";
import crypto from "crypto";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getExpiryFromToken(token: string) {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(decoded.exp * 1000);
}

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getExpiryFromToken(refreshToken),
    },
  });

  return res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getExpiryFromToken(refreshToken),
    },
  });

  return res.json({
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
  });
}

export async function refresh(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { refreshToken } = parsed.data;

  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      sub: string;
    };
    const tokenHash = hashToken(refreshToken);

    const stored = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true },
    });
    const newAccessToken = signAccessToken(
      payload.sub,
      user?.role ?? "USER"
    );
    const newRefreshToken = signRefreshToken(payload.sub);

    await prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: getExpiryFromToken(newRefreshToken),
      },
    });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { refreshToken } = parsed.data;
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return res.json({ message: "Logged out" });
}
