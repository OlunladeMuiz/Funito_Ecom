import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";

export async function webhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) {
    return res.status(400).send("Missing signature");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return res.status(400).send("Invalid signature");
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { paymentStatus: "PAID", status: "PAID" },
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { paymentStatus: "FAILED" },
    });
  }

  return res.json({ received: true });
}
