"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPaymentIntent(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { user: true }
    });

    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status === 'PAID') throw new Error("Invoice already paid");

    // Create a PaymentIntent with the order amount and currency
    // Amount is in cents
    const amountInCents = Math.round(invoice.amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        metadata: {
            invoiceId: invoice.id,
            userId: invoice.userId
        },
        automatic_payment_methods: {
            enabled: true,
        },
    });

    // Save the client secret or payment intent ID to the invoice (optional, but good for tracking)
    await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            stripePaymentIntentId: paymentIntent.id
        }
    });

    return { clientSecret: paymentIntent.client_secret };
}

export async function generateMonthlyInvoices() {
  const settings = await prisma.clubSettings.findFirst();
  const monthlyDues = settings?.monthlyDues || 0.0;
  
  // 1. Get all active members
  const members = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' }, status: 'ACTIVE' }, 
      include: { membershipTier: true }
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // Due in 14 days

  for (const member of members) {
      // Use Tier dues if available, else Global dues
      const duesAmount = member.membershipTier?.monthlyDues ?? monthlyDues;
      
      if (duesAmount > 0) {
          await prisma.invoice.create({
              data: {
                  userId: member.id,
                  amount: duesAmount,
                  dueDate: dueDate,
                  status: 'SENT',
                  description: `Monthly Dues - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                  items: {
                      create: [
                          {
                              description: `Monthly Membership Dues ${member.membershipTier ? `(${member.membershipTier.name})` : ''}`,
                              quantity: 1,
                              unitPrice: duesAmount,
                              amount: duesAmount
                          }
                      ]
                  }
              }
          });
          
          // Update balance
          await prisma.user.update({
              where: { id: member.id },
              data: { balance: { increment: duesAmount } }
          });
      }
  }

  revalidatePath("/billing");
}
