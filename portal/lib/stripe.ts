import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore - The Stripe SDK types are strict about API versions. 
  // We use the latest or allow the SDK to default if possible, but here we explicit it.
  // Using 'as any' to avoid build breaks when SDK updates.
  apiVersion: '2025-01-27.acacia', 
  typescript: true,
});
