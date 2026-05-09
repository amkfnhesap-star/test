import { loadStripe } from "@stripe/stripe-js";

let stripePromise: ReturnType<typeof loadStripe>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}

export const PLATFORM_FEE_PERCENT = 0.1;

export function calculateFees(price: number) {
  const platformFee = Math.round(price * PLATFORM_FEE_PERCENT * 100) / 100;
  const total = price + platformFee;
  return { price, platformFee, total };
}
