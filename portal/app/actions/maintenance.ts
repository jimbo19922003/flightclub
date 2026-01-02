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

  // Also update recurring schedules if they match
  const aircraft = await prisma.aircraft.findUnique({ 
      where: { id: aircraftId },
      include: { schedules: true } 
  });

  if (aircraft) {
      for (const schedule of aircraft.schedules) {
          // Heuristic: If schedule name matches log type, update it
          // In a real app, user would explicitly link log to schedule
          if (schedule.name.toLowerCase().includes(title.toLowerCase()) || 
              (type === 'OIL_CHANGE' && schedule.name.toLowerCase().includes('oil')) ||
              (type === 'ANNUAL' && schedule.name.toLowerCase().includes('annual'))) {
              
              await prisma.maintenanceSchedule.update({
                  where: { id: schedule.id },
                  data: {
                      lastPerformed: date,
                      lastPerformedHours: aircraft.currentHobbs // Use current hobbs at time of logging
                  }
              });
          }
      }
  }

  revalidatePath("/maintenance");
  redirect("/maintenance");
}

export async function createMaintenanceSchedule(formData: FormData) {
    const aircraftId = formData.get("aircraftId") as string;
    const name = formData.get("name") as string;
    const intervalHours = formData.get("intervalHours") ? parseFloat(formData.get("intervalHours") as string) : null;
    const intervalMonths = formData.get("intervalMonths") ? parseInt(formData.get("intervalMonths") as string) : null;
    const lastPerformedHours = formData.get("lastPerformedHours") ? parseFloat(formData.get("lastPerformedHours") as string) : null;
    const lastPerformedDate = formData.get("lastPerformedDate") ? new Date(formData.get("lastPerformedDate") as string) : null;

    await prisma.maintenanceSchedule.create({
        data: {
            aircraftId,
            name,
            intervalHours,
            intervalMonths,
            lastPerformedHours,
            lastPerformed: lastPerformedDate
        }
    });

    revalidatePath(`/aircraft/${aircraftId}/maintenance`);
}

export async function deleteMaintenanceSchedule(scheduleId: string, aircraftId: string) {
    await prisma.maintenanceSchedule.delete({
        where: { id: scheduleId }
    });
    revalidatePath(`/aircraft/${aircraftId}/maintenance`);
}
