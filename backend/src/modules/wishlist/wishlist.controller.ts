import { Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/auth";
import { getParamString } from "../../utils/params";

const addWishlistSchema = z.object({
  productId: z.string().uuid(),
});

export async function listWishlist(req: AuthRequest, res: Response) {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.userId },
    include: {
      product: {
        include: { images: true, category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(items);
}

export async function addToWishlist(req: AuthRequest, res: Response) {
  const parsed = addWishlistSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { productId } = parsed.data;

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: req.userId!, productId } },
  });
  if (existing) {
    return res.status(409).json({ message: "Product already in wishlist" });
  }

  const item = await prisma.wishlist.create({
    data: {
      userId: req.userId!,
      productId,
    },
    include: {
      product: {
        include: { images: true, category: true },
      },
    },
  });

  return res.status(201).json(item);
}

export async function removeFromWishlist(req: AuthRequest, res: Response) {
  const productId = getParamString(req, "productId");
  if (!productId) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: req.userId!, productId } },
  });
  if (!existing) {
    return res.status(404).json({ message: "Item not in wishlist" });
  }

  await prisma.wishlist.delete({
    where: { userId_productId: { userId: req.userId!, productId } },
  });

  return res.json({ message: "Removed from wishlist" });
}

export async function checkWishlist(req: AuthRequest, res: Response) {
  const productId = getParamString(req, "productId");
  if (!productId) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const item = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: req.userId!, productId } },
  });

  return res.json({ inWishlist: !!item });
}
