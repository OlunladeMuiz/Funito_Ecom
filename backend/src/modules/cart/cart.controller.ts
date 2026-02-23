import { Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/auth";
import { getParamString } from "../../utils/params";

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export async function getCart(req: AuthRequest, res: Response) {
  const cart = await prisma.cart.findFirst({
    where: { userId: req.userId },
    include: { 
      items: { 
        include: { 
          product: {
            include: { images: true }
          } 
        } 
      } 
    },
  });
  return res.json(cart ?? { items: [] });
}

export async function addItem(req: AuthRequest, res: Response) {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { productId, quantity } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cart =
    (await prisma.cart.findFirst({ where: { userId: req.userId } })) ??
    (await prisma.cart.create({ data: { userId: req.userId } }));

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  const unitPrice = product.originalPrice ?? product.price;

  if (existingItem) {
    const updated = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity, unitPrice },
    });
    return res.json(updated);
  }

  const created = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
      unitPrice,
    },
  });

  return res.status(201).json(created);
}

export async function updateItem(req: AuthRequest, res: Response) {
  const parsed = updateItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid cart item id" });
  }

  const item = await prisma.cartItem.update({
    where: { id },
    data: { quantity: parsed.data.quantity },
  });

  return res.json(item);
}

export async function removeItem(req: AuthRequest, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid cart item id" });
  }
  await prisma.cartItem.delete({ where: { id } });
  return res.json({ message: "Removed" });
}
