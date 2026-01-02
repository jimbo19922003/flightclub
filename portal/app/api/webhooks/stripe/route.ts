import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.PaymentIntent;

  if (event.type === "payment_intent.succeeded") {
    const invoiceId = session.metadata.invoiceId;
    const userId = session.metadata.userId;

    if (invoiceId) {
        // 1. Mark Invoice as PAID
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'PAID',
                paidAt: new Date()
            }
        });

        // 2. Decrement User Balance
        // We assume the balance tracks "Amount Owed", so paying reduces it.
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (invoice && userId) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    balance: { decrement: invoice.amount }
                }
            });
        }
    }
  }

  return new NextResponse(null, { status: 200 });
}
