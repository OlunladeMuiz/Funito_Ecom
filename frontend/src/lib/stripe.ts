import { loadStripe } from '@stripe/stripe-js';

// This will use the publishable key from your frontend .env file
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
