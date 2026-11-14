import Stripe from "stripe";
import { env } from "@/shared/env";

// By omitting apiVersion, Stripe defaults to the account's configured version.
// This prevents hardcoded version strings from breaking TypeScript builds on updates.
export const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  typescript: true,
});