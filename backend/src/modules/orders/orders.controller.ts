import { Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { isStripeConfigured, stripe } from "../../lib/stripe";
import { AuthRequest } from "../../middleware/auth";
import { getParamString } from "../../utils/params";

const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid().optional(),
});

const CHECKOUT_ADDRESS_CUTOFF = new Date("2026-03-15T00:00:00Z");

export async function checkout(req: AuthRequest, res: Response) {
  if (!isStripeConfigured) {
    return res.status(503).json({
      message:
        "Payments are not configured. Set STRIPE_SECRET_KEY in backend/.env to a valid Stripe secret key.",
    });
  }

  const parsed = checkoutSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    const shippingAddressIdIssue = parsed.error.issues.find(
      (issue) => issue.path[0] === "shippingAddressId"
    );
    if (shippingAddressIdIssue) {
      return res.status(400).json({ message: "Invalid shippingAddressId" });
    }
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    let deprecatedFallbackUsed = false;
    let shippingAddressId = parsed.data.shippingAddressId;

    if (shippingAddressId) {
      const address = await prisma.address.findFirst({
        where: { id: shippingAddressId, userId: req.userId },
      });

      if (!address) {
        return res.status(400).json({ message: "Shipping address not found" });
      }
    } else if (new Date() >= CHECKOUT_ADDRESS_CUTOFF) {
      return res.status(400).json({ message: "shippingAddressId is required" });
    } else {
      const defaultAddress = await prisma.address.findFirst({
        where: { userId: req.userId, isDefault: true },
      });

      if (!defaultAddress) {
        return res.status(400).json({
          message:
            "shippingAddressId is required (no default address found for fallback)",
        });
      }

      shippingAddressId = defaultAddress.id;
      deprecatedFallbackUsed = true;
      res.set(
        "Warning",
        '299 - "Checkout without shippingAddressId is deprecated and will stop working after 2026-03-15"'
      );
    }

    const cart = await prisma.cart.findFirst({
      where: { userId: req.userId },
      include: { 
        items: {
          include: { product: true }
        }
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Stock validation - check all items have sufficient stock
    const insufficientStock = cart.items.filter(
      (item) => !item.product || item.product.stock < item.quantity
    );
    if (insufficientStock.length > 0) {
      return res.status(400).json({
        message: "Insufficient stock for some items",
        items: insufficientStock.map((item) => ({
          productId: item.productId,
          requested: item.quantity,
          available: item.product?.stock ?? 0,
        })),
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const tax = 0;
    const shippingFee = 0;
    const discount = 0;
    const total = subtotal + tax + shippingFee - discount;

    if (!shippingAddressId) {
      return res.status(400).json({ message: "shippingAddressId is required" });
    }

    const effectiveShippingAddressId = shippingAddressId;
    let intent: Awaited<ReturnType<typeof stripe.paymentIntents.create>>;
    try {
      intent = await stripe.paymentIntents.create({
        amount: Math.round(total), // Stripe requires integer amount
        currency: "ngn",
        metadata: {
          userId: req.userId!,
          shippingAddressId: effectiveShippingAddressId,
        },
      });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      const details =
        stripeError instanceof Error ? stripeError.message : "Unknown Stripe error";
      return res.status(502).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Failed to initialize payment"
            : `Failed to initialize payment: ${details}`,
      });
    }

    if (!intent.client_secret) {
      console.error("Stripe error: payment intent missing client_secret", intent.id);
      return res
        .status(502)
        .json({ message: "Payment provider returned an invalid intent" });
    }

    try {
      const order = await prisma.$transaction(async (tx) => {
        // Decrement stock for all items
        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const created = await tx.order.create({
          data: {
            userId: req.userId!,
            subtotal,
            tax,
            shippingFee,
            discount,
            total,
            stripePaymentIntentId: intent.id,
            shippingAddressId: effectiveShippingAddressId,
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            },
          },
          include: { 
            items: {
              include: {
                product: { select: { id: true, name: true, images: true } }
              }
            }
          },
        });

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return created;
      });

      return res.json({
        orderId: order.id,
        clientSecret: intent.client_secret,
        deprecatedFallbackUsed,
      });
    } catch (error) {
      try {
        await stripe.paymentIntents.cancel(intent.id);
      } catch (cancelError) {
        console.error(
          `Failed to cancel payment intent ${intent.id} after checkout failure:`,
          cancelError
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Failed to process checkout" });
  }
}

export async function listOrders(req: AuthRequest, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: { 
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(orders);
}

export async function getOrder(req: AuthRequest, res: Response) {
  const id = getParamString(req, "id");
  if (!id) {
    return res.status(400).json({ message: "Invalid order id" });
  }

  const order = await prisma.order.findFirst({
    where: { id, userId: req.userId },
    include: { 
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: true } }
        }
      },
      shippingAddress: true
    },
  });
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  return res.json(order);
}
