import { Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/auth";
import { hashPassword, verifyPassword } from "../../utils/password";
import { getParamString } from "../../utils/params";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

const addressSchema = z.object({
  label: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
});

// Profile
export async function getProfile(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(user);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isVerified: true,
    },
  });

  return res.json(user);
}

export async function changePassword(req: AuthRequest, res: Response) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isValid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: req.userId },
    data: { passwordHash: newHash },
  });

  return res.json({ message: "Password updated successfully" });
}

// Addresses
export async function listAddresses(req: AuthRequest, res: Response) {
  const addresses = await prisma.address.findMany({
    where: { userId: req.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return res.json(addresses);
}

export async function createAddress(req: AuthRequest, res: Response) {
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  // If this is default, unset other defaults
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.userId!,
      ...parsed.data,
    },
  });

  return res.status(201).json(address);
}

export async function updateAddress(req: AuthRequest, res: Response) {
  const parsed = addressSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid address id" });
  }

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ message: "Address not found" });
  }

  // If setting as default, unset other defaults
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.userId, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: parsed.data,
  });

  return res.json(address);
}

export async function deleteAddress(req: AuthRequest, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid address id" });
  }

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ message: "Address not found" });
  }

  await prisma.address.delete({ where: { id } });
  return res.json({ message: "Address deleted" });
}
