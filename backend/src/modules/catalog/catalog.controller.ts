import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { getParamString } from "../../utils/params";

// Search query validation schema
const listProductsSchema = z.object({
  search: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  min: z.coerce.number().int().min(0).optional(),
  max: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listProducts(req: Request, res: Response) {
  const parsed = listProductsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid query parameters" });
  }

  const { search, category, min, max, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    name: search ? { contains: search, mode: "insensitive" as const } : undefined,
    category: category ? { slug: category } : undefined,
    price: min || max ? { gte: min || undefined, lte: max || undefined } : undefined,
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return res.json({
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getProduct(req: Request, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
}

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return res.json(categories);
}
