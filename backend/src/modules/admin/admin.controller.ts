import path from "path";
import { Request } from "express";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "djipok287",
  api_key: process.env.CLOUDINARY_API_KEY || "876321583237872",
  api_secret: process.env.CLOUDINARY_API_SECRET || "kNHQB1IDB9-HG1QoGCkIKB9yQdU",
});
// POST /admin/products/upload-image
export async function uploadProductImage(req: Request, res: Response) {
  const file = (req as any).file as { path: string; originalname: string } | undefined;
  if (!file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "products",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "auto" }
      ]
    });
    // Optionally, delete the local file after upload
    try { fs.unlinkSync(file.path); } catch {}
    return res.json({ url: result.secure_url });
  } catch (err) {
    return res.status(500).json({ message: "Image upload failed", error: (err as any)?.message });
  }
}
// Reviews management
export async function listAllReviews(req: AuthRequest, res: Response) {
  const reviews = await prisma.review.findMany({
    include: {
      product: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(reviews);
}

export async function deleteReview(req: AuthRequest, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid review id" });
  }
  await prisma.review.delete({ where: { id } });
  return res.json({ message: "Review deleted" });
}

export async function updateReview(req: AuthRequest, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid review id" });
  }
  const { rating, comment } = req.body;
  const review = await prisma.review.update({
    where: { id },
    data: {
      rating: typeof rating === "number" ? rating : undefined,
      comment: typeof comment === "string" ? comment : undefined,
    },
  });
  return res.json(review);
}
import { Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/auth";
import { getParamString } from "../../utils/params";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().positive(),
  originalPrice: z.number().int().positive().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  categoryId: z.string().uuid().nullable().optional(),
  images: z.array(z.string().url()).optional(),
});

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELED"]),
});

// Dashboard stats
export async function getDashboardStats(req: AuthRequest, res: Response) {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    recentOrders,
    revenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  return res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenue._sum.total ?? 0,
    recentOrders,
  });
}

// Products CRUD
export async function listAllProducts(req: AuthRequest, res: Response) {
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json(products);
}

export async function createProduct(req: AuthRequest, res: Response) {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const { images, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      images: images
        ? { create: images.map((url, i) => ({ url, sortOrder: i })) }
        : undefined,
    },
    include: { images: true, category: true },
  });

  return res.status(201).json(product);
}

export async function updateProduct(req: AuthRequest, res: Response) {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const { images, ...data } = parsed.data;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      images: images
        ? {
            deleteMany: {},
            create: images.map((url, i) => ({ url, sortOrder: i })),
          }
        : undefined,
    },
    include: { images: true, category: true },
  });

  return res.json(product);
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  await prisma.product.delete({ where: { id } });
  return res.json({ message: "Product deleted" });
}

// Categories CRUD
export async function listAllCategories(req: AuthRequest, res: Response) {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return res.json(categories);
}

export async function createCategory(req: AuthRequest, res: Response) {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const category = await prisma.category.create({ data: parsed.data });
  return res.status(201).json(category);
}

export async function updateCategory(req: AuthRequest, res: Response) {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid category id" });
  }

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });
  return res.json(category);
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid category id" });
  }
  await prisma.category.delete({ where: { id } });
  return res.json({ message: "Category deleted" });
}

// Orders management
export async function listAllOrders(req: AuthRequest, res: Response) {
  const status = req.query.status?.toString();

  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(orders);
}

export async function getOrderDetails(req: AuthRequest, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid order id" });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: { include: { product: { include: { images: true } } } },
      shippingAddress: true,
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json(order);
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  const parsed = orderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid order id" });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  return res.json(order);
}

// Users management
export async function listAllUsers(req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(users);
}

export async function getUserDetails(req: AuthRequest, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      addresses: true,
      orders: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(user);
}
