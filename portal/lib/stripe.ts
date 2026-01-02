import Stripe from 'stripe';

// Fallback to a dummy key during build time if environment variable is missing
// The actual key will be injected at runtime by Docker/System
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_build_time_placeholder";

export const stripe = new Stripe(stripeKey, {
  // @ts-ignore - The Stripe SDK types are strict about API versions. 
  // We use the latest or allow the SDK to default if possible, but here we explicit it.
  // Using 'as any' to avoid build breaks when SDK updates.
  apiVersion: '2025-01-27.acacia', 
  typescript: true,
});
