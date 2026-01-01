"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateClubSettings(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as "EQUITY" | "NON_PROFIT" | "COMMERCIAL";
  const monthlyDues = parseFloat(formData.get("monthlyDues") as string);
  const billingCycleDay = parseInt(formData.get("billingCycleDay") as string);
  const maxReservationsPerUser = parseInt(formData.get("maxReservationsPerUser") as string);
  const maxReservationDays = parseInt(formData.get("maxReservationDays") as string);

  // Upsert ensures we only have one settings row (or updates the existing one)
  const settings = await prisma.clubSettings.findFirst();
  
  if (settings) {
    await prisma.clubSettings.update({
      where: { id: settings.id },
      data: {
        name,
        type,
        monthlyDues,
        billingCycleDay,
        maxReservationsPerUser,
        maxReservationDays,
      },
    });
  } else {
    await prisma.clubSettings.create({
      data: {
        name,
        type,
        monthlyDues,
        billingCycleDay,
        maxReservationsPerUser,
        maxReservationDays,
      },
    });
  }

  revalidatePath("/settings");
}
