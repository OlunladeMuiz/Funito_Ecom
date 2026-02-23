import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/auth";
import { getParamString } from "../../utils/params";

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

// Get all reviews for a product (public)
export async function getProductReviews(req: Request, res: Response) {
  const productId = getParamString(req, "productId");
  if (!productId) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0;

  return res.json({
    reviews,
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length,
  });
}

// Create a review (authenticated)
export async function createReview(req: AuthRequest, res: Response) {
  const productId = getParamString(req, "productId");
  if (!productId) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Check if user already reviewed this product
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.userId!, productId } },
  });
  if (existing) {
    return res.status(409).json({ message: "You already reviewed this product" });
  }

  // Optional: Check if user purchased the product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: req.userId, paymentStatus: "PAID" },
    },
  });

  const review = await prisma.review.create({
    data: {
      userId: req.userId!,
      productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return res.status(201).json({
    ...review,
    verified: !!hasPurchased,
  });
}

// Update own review
export async function updateReview(req: AuthRequest, res: Response) {
  const productId = getParamString(req, "productId");
  if (!productId) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const parsed = updateReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.userId!, productId } },
  });
  if (!existing) {
    return res.status(404).json({ message: "Review not found" });
  }

  const review = await prisma.review.update({
    where: { userId_productId: { userId: req.userId!, productId } },
    data: parsed.data,
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return res.json(review);
}

// Delete own review
export async function deleteReview(req: AuthRequest, res: Response) {
  const productId = getParamString(req, "productId");
  if (!productId) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.userId!, productId } },
  });
  if (!existing) {
    return res.status(404).json({ message: "Review not found" });
  }

  await prisma.review.delete({
    where: { userId_productId: { userId: req.userId!, productId } },
  });

  return res.json({ message: "Review deleted" });
}

// Get user's own review for a product
export async function getMyReview(req: AuthRequest, res: Response) {
  const productId = getParamString(req, "productId");
  if (!productId) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const review = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.userId!, productId } },
  });

  return res.json(review);
}
