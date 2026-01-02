"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateReservationRequest } from "@/lib/scheduling";

export async function createReservation(formData: FormData) {
  const userId = formData.get("userId") as string;
  const aircraftId = formData.get("aircraftId") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const notes = formData.get("notes") as string;

  // 1. Run Comprehensive Rules Engine
  const validation = await validateReservationRequest(userId, startTime, endTime);
  
  if (!validation.allowed) {
      // In a real app, we might return this error to the UI state.
      // For now, we throw, which might trigger an error boundary or generic error.
      throw new Error(validation.reason || "Reservation not allowed.");
  }

  // 2. Validate Aircraft Availability (Double check specifically for aircraft overlap, 
  // as the rules engine focuses on User permissions)
  const conflicting = await prisma.reservation.findFirst({
      where: {
          aircraftId: aircraftId,
          status: { not: "CANCELLED" },
          OR: [
              { startTime: { lt: endTime }, endTime: { gt: startTime } } // Overlaps
          ]
      }
  });

  if (conflicting) {
      throw new Error("Aircraft is already reserved for this time slot.");
  }

  await prisma.reservation.create({
      data: {
          userId,
          aircraftId,
          startTime,
          endTime,
          type: 'FLIGHT',
          notes,
          status: 'CONFIRMED'
      }
  });

  revalidatePath("/reservations");
  redirect("/reservations");
}
