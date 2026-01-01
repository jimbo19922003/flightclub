"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMaintenanceLog(formData: FormData) {
  const aircraftId = formData.get("aircraftId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const date = new Date(formData.get("date") as string);
  const type = formData.get("type") as "ANNUAL" | "ONE_HUNDRED_HOUR" | "OIL_CHANGE" | "REPAIR" | "UPGRADE" | "AD_COMPLIANCE";
  const cost = formData.get("cost") ? parseFloat(formData.get("cost") as string) : null;
  const performedBy = formData.get("performedBy") as string;
  
  // Create Log
  await prisma.maintenanceLog.create({
    data: {
      aircraftId,
      title,
      description,
      date,
      type,
      cost,
      performedBy
    }
  });

  // Update Aircraft Status triggers if needed (basic logic)
  if (type === 'ANNUAL') {
      const nextAnnual = new Date(date);
      nextAnnual.setFullYear(nextAnnual.getFullYear() + 1);
      
      await prisma.aircraft.update({
          where: { id: aircraftId },
          data: { nextAnnual }
      });
  } else if (type === 'OIL_CHANGE') {
      // Fetch current tach to update next oil change
      const aircraft = await prisma.aircraft.findUnique({ where: { id: aircraftId }});
      if (aircraft) {
           await prisma.aircraft.update({
              where: { id: aircraftId },
              data: { nextOilChange: aircraft.currentTach + 50 }
          });
      }
  }

  revalidatePath("/maintenance");
  redirect("/maintenance");
}
