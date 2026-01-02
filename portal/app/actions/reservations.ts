"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ReservationType } from "@prisma/client";
import { validateReservationRequest } from "@/lib/scheduling";

export async function createReservation(formData: FormData) {
  const userId = formData.get("userId") as string;
  const aircraftId = formData.get("aircraftId") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const notes = formData.get("notes") as string;
  const type = (formData.get("type") as ReservationType) || "FLIGHT";

  if (!userId || !aircraftId || !startTime || !endTime) {
      throw new Error("Missing required fields");
  }

  // 1. Run Comprehensive Rules Engine (Skip for Maintenance)
  if (type !== 'MAINTENANCE') {
      const validation = await validateReservationRequest(userId, startTime, endTime);
      
      if (!validation.allowed) {
          throw new Error(validation.reason || "Reservation not allowed.");
      }
  }

  // 2. Validate Aircraft Availability
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
          notes,
          type,
          status: "CONFIRMED"
      }
  });

  revalidatePath("/reservations");
  redirect("/reservations");
}

export async function cancelReservation(reservationId: string) {
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { user: true }
    });
    
    if (!reservation) throw new Error("Reservation not found");
    
    // Check if can cancel (e.g. not in the past, or specific rules)
    if (new Date(reservation.startTime) < new Date() && reservation.status !== 'CANCELLED') {
         // Allow cancelling if it hasn't started essentially, but if it's in the past maybe just mark cancelled?
         // Usually can't cancel past reservations.
         // throw new Error("Cannot cancel a past reservation"); 
         // For now, let's allow it but maybe log it.
    }

    await prisma.reservation.update({
        where: { id: reservationId },
        data: {
            status: "CANCELLED"
        }
    });

    revalidatePath("/reservations");
    // return { success: true };
}
