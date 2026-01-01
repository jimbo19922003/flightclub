"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateMonthlyInvoices() {
  const settings = await prisma.clubSettings.findFirst();
  const monthlyDues = settings?.monthlyDues || 0.0;
  
  // 1. Get all active members
  const members = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } }, // Simple filter for now
      include: { 
          flightLogs: {
              where: {
                  // In a real app, this would be filtered by the previous month or unbilled logs
                  // For demo, we just grab logs that haven't been invoiced (logic simplified)
                  createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
              }
          }
      }
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // Due in 14 days

  for (const member of members) {
      // Check if they already have a draft invoice for this month? (Skipped for simplicity)

      // Calculate Flight Costs
      let totalFlightCost = 0;
      // In a real app, we would sum up unbilled flight logs.
      // member.flightLogs.forEach(log => totalFlightCost += log.cost);

      const totalAmount = monthlyDues + totalFlightCost;

      if (totalAmount > 0) {
          await prisma.invoice.create({
              data: {
                  userId: member.id,
                  amount: totalAmount,
                  dueDate: dueDate,
                  status: 'DRAFT',
                  description: `Monthly Invoice - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                  items: {
                      create: [
                          {
                              description: "Monthly Membership Dues",
                              quantity: 1,
                              unitPrice: monthlyDues,
                              amount: monthlyDues
                          },
                          // Flight costs would be added here as items
                      ]
                  }
              }
          });
      }
  }

  revalidatePath("/billing");
}
