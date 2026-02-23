import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../lib/stripe", () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      cancel: vi.fn(),
    },
  },
}));

import { app } from "../app";
import { prisma } from "../lib/prisma";
import { stripe } from "../lib/stripe";
import { env } from "../config/env";
import { hashPassword } from "../utils/password";

function createAccessToken(userId: string, role: "USER" | "ADMIN" = "USER") {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
}

async function createUser(email: string) {
  return prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword("password123"),
      role: "USER",
    },
  });
}

async function createAddress(userId: string, isDefault = false) {
  return prisma.address.create({
    data: {
      userId,
      label: "Home",
      line1: "123 Test Street",
      city: "Lagos",
      state: "LA",
      zip: "100001",
      country: "NG",
      isDefault,
    },
  });
}

async function seedCart(userId: string) {
  const product = await prisma.product.create({
    data: {
      name: "Chair",
      slug: "chair",
      price: 25000,
      stock: 10,
      isActive: true,
      images: {
        create: [{ url: "https://example.com/chair.jpg", sortOrder: 0 }],
      },
    },
  });

  const cart = await prisma.cart.create({
    data: { userId },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product.id,
      quantity: 2,
      unitPrice: 25000,
    },
  });

  return { cart, product };
}

describe("Orders API", () => {
  const createPaymentIntentMock = stripe.paymentIntents
    .create as unknown as ReturnType<typeof vi.fn>;
  const cancelPaymentIntentMock = stripe.paymentIntents
    .cancel as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-14T00:00:00Z"));
    createPaymentIntentMock.mockReset();
    cancelPaymentIntentMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fails checkout when cart is empty", async () => {
    const user = await createUser("orders-empty@example.com");
    const token = createAccessToken(user.id);
    const address = await createAddress(user.id, true);

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ shippingAddressId: address.id });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Cart is empty");
  });

  it("fails checkout for invalid payload", async () => {
    const user = await createUser("orders-invalid-payload@example.com");
    const token = createAccessToken(user.id);

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ shippingAddressId: "not-a-uuid" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid shippingAddressId");
  });

  it("fails checkout when shipping address is not owned by user", async () => {
    const user = await createUser("orders-owner@example.com");
    const otherUser = await createUser("orders-other@example.com");
    const token = createAccessToken(user.id);
    const otherAddress = await createAddress(otherUser.id, true);
    await seedCart(user.id);

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ shippingAddressId: otherAddress.id });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Shipping address not found");
  });

  it("succeeds with explicit valid shippingAddressId and clears cart", async () => {
    const user = await createUser("orders-success@example.com");
    const token = createAccessToken(user.id);
    const address = await createAddress(user.id, true);
    const { cart } = await seedCart(user.id);

    createPaymentIntentMock.mockResolvedValue({
      id: "pi_success",
      client_secret: "cs_success",
    });

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ shippingAddressId: address.id });

    expect(res.status).toBe(200);
    expect(res.body.orderId).toBeTruthy();
    expect(res.body.clientSecret).toBe("cs_success");
    expect(res.body.deprecatedFallbackUsed).toBe(false);

    const order = await prisma.order.findUnique({
      where: { id: res.body.orderId },
      include: { items: true },
    });
    expect(order).not.toBeNull();
    expect(order?.shippingAddressId).toBe(address.id);
    expect(order?.stripePaymentIntentId).toBe("pi_success");
    expect(order?.items.length).toBe(1);

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });
    expect(cartItems.length).toBe(0);
  });

  it("allows transition fallback to default address before cutoff and emits warning", async () => {
    const user = await createUser("orders-fallback@example.com");
    const token = createAccessToken(user.id);
    const defaultAddress = await createAddress(user.id, true);
    await seedCart(user.id);

    createPaymentIntentMock.mockResolvedValue({
      id: "pi_fallback",
      client_secret: "cs_fallback",
    });

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.deprecatedFallbackUsed).toBe(true);
    expect(res.headers.warning).toContain("deprecated");

    const order = await prisma.order.findUnique({
      where: { id: res.body.orderId },
    });
    expect(order?.shippingAddressId).toBe(defaultAddress.id);
  });

  it("fails fallback before cutoff when no default address exists", async () => {
    const user = await createUser("orders-no-default@example.com");
    const token = createAccessToken(user.id);
    await createAddress(user.id, false);
    await seedCart(user.id);

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "shippingAddressId is required (no default address found for fallback)"
    );
  });

  it("requires shippingAddressId after cutoff", async () => {
    vi.setSystemTime(new Date("2026-03-16T00:00:00Z"));

    const user = await createUser("orders-post-cutoff@example.com");
    const token = createAccessToken(user.id);
    await createAddress(user.id, true);
    await seedCart(user.id);

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("shippingAddressId is required");
  });

  it("fails checkout when stripe intent creation fails and does not create order", async () => {
    const user = await createUser("orders-stripe-fail@example.com");
    const token = createAccessToken(user.id);
    const address = await createAddress(user.id, true);
    await seedCart(user.id);

    createPaymentIntentMock.mockRejectedValue(new Error("stripe unavailable"));

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ shippingAddressId: address.id });

    expect(res.status).toBe(502);
    expect(res.body.message).toBe("Failed to initialize payment");

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
    });
    expect(orders.length).toBe(0);
  });
});
