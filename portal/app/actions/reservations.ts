"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createReservation(formData: FormData) {
  const userId = formData.get("userId") as string;
  const aircraftId = formData.get("aircraftId") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const notes = formData.get("notes") as string;

  // 1. Fetch User and their Tier
  const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { membershipTier: true } 
  });

  if (!user) throw new Error("User not found");

  // 2. Fetch Global Settings
  const settings = await prisma.clubSettings.findFirst();

  // 3. Determine Limits (Tier overrides Global)
  const maxRes = user.membershipTier?.maxReservations ?? settings?.maxReservationsPerUser ?? 3;
  const maxDays = user.membershipTier?.maxDaysPerReservation ?? settings?.maxReservationDays ?? 3;
  const bookingWindow = user.membershipTier?.bookingWindowDays ?? 90;

  // 4. Validate Booking Window
  const maxBookingDate = new Date();
  maxBookingDate.setDate(maxBookingDate.getDate() + bookingWindow);
  if (startTime > maxBookingDate) {
      throw new Error(`Reservation is outside of booking window (${bookingWindow} days).`);
  }

  // 5. Validate Duration
  const durationDays = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24);
  if (durationDays > maxDays) {
      throw new Error(`Reservation exceeds maximum duration of ${maxDays} days.`);
  }

  // 6. Validate Max Active Reservations
  const activeReservations = await prisma.reservation.count({
      where: {
          userId: userId,
          startTime: { gte: new Date() }
      }
  });

  if (activeReservations >= maxRes) {
      throw new Error(`User has reached maximum active reservations (${maxRes}).`);
  }

  // 7. Validate Aircraft Availability (Basic Overlap Check)
  const conflicting = await prisma.reservation.findFirst({
      where: {
          aircraftId: aircraftId,
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
          notes
      }
  });

  revalidatePath("/reservations");
  redirect("/reservations");
}
