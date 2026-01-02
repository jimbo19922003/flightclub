import { prisma } from "@/lib/prisma";
import { MaintenanceSchedule, MaintenanceLog, Aircraft } from "@prisma/client";
import { addMonths } from "date-fns";

export type MaintenanceStatus = {
  scheduleId: string;
  name: string;
  status: "OK" | "DUE" | "OVERDUE" | "WARNING";
  hoursRemaining?: number;
  daysRemaining?: number;
};

export async function getAircraftMaintenanceStatus(aircraftId: string): Promise<MaintenanceStatus[]> {
  const aircraft = await prisma.aircraft.findUnique({
    where: { id: aircraftId },
    include: { schedules: true }
  });

  if (!aircraft) return [];

  const statuses: MaintenanceStatus[] = [];

  for (const schedule of aircraft.schedules) {
    let status: "OK" | "DUE" | "OVERDUE" | "WARNING" = "OK";
    let hoursRemaining = undefined;
    let daysRemaining = undefined;

    // Check Hours
    if (schedule.intervalHours && schedule.lastPerformedHours) {
      const nextDueHours = schedule.lastPerformedHours + schedule.intervalHours;
      hoursRemaining = nextDueHours - aircraft.currentHobbs;
      
      if (hoursRemaining < 0) status = "OVERDUE";
      else if (hoursRemaining < 5) status = "WARNING"; // Warn within 5 hours
    }

    // Check Date (Months)
    if (schedule.intervalMonths && schedule.lastPerformed) {
      const nextDueDate = addMonths(schedule.lastPerformed, schedule.intervalMonths);
      const diffTime = nextDueDate.getTime() - new Date().getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysRemaining < 0) {
        status = "OVERDUE";
      } else if (daysRemaining < 30) {
        // If hours check was OK, but date is close, upgrade to warning/overdue
        if (status === "OK") status = "WARNING"; 
      }
    }

    statuses.push({
      scheduleId: schedule.id,
      name: schedule.name,
      status,
      hoursRemaining,
      daysRemaining
    });
  }

  return statuses;
}
