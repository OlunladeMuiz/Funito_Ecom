import Stripe from "stripe";
import { env } from "../config/env";

function isPlaceholderKey(key: string) {
  return (
    key === "sk_test_change_me" ||
    key === "sk_live_change_me" ||
    key.includes("change_me")
  );
}

export const isStripeConfigured =
  env.STRIPE_SECRET_KEY.startsWith("sk_") &&
  !isPlaceholderKey(env.STRIPE_SECRET_KEY);

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});
