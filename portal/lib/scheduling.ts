import { prisma } from "@/lib/prisma";
import { User, Reservation, MembershipTier, ClubSettings, ReservationStatus } from "@prisma/client";
import { startOfDay, endOfDay, differenceInDays, isWeekend, addDays, isSameDay, isWithinInterval } from "date-fns";

export type BookingValidationResult = {
  allowed: boolean;
  reason?: string;
};

export async function validateReservationRequest(
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<BookingValidationResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { membershipTier: true },
  });

  if (!user) return { allowed: false, reason: "User not found." };
  if (user.status !== "ACTIVE") return { allowed: false, reason: "User account is suspended or inactive." };

  const settings = await prisma.clubSettings.findFirst();
  if (!settings) return { allowed: false, reason: "Club settings not configured." };

  const tier = user.membershipTier;
  if (!tier) return { allowed: false, reason: "User has no membership tier assigned." };

  // 1. Check for overlapping reservations (Aircraft check should be separate, but let's assume we check user overlaps here too)
  const overlapping = await prisma.reservation.findFirst({
    where: {
      userId: userId,
      status: { not: "CANCELLED" },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } }
      ]
    }
  });

  if (overlapping) return { allowed: false, reason: "You already have a reservation during this time." };

  // 2. Booking Window (How far in advance)
  const maxAdvanceDate = addDays(new Date(), tier.bookingWindowDays);
  if (endTime > maxAdvanceDate) {
    return { allowed: false, reason: `Cannot book more than ${tier.bookingWindowDays} days in advance.` };
  }

  // 3. Trip Length
  const tripLengthDays = differenceInDays(endTime, startTime) + (endTime.getDate() !== startTime.getDate() ? 1 : 0);
  const maxTrip = tier.maxTripLengthDays || settings.maxReservationDays;
  if (tripLengthDays > maxTrip) {
    return { allowed: false, reason: `Reservation exceeds maximum trip length of ${maxTrip} days.` };
  }

  // 4. Max Open Reservations
  const activeReservationsCount = await prisma.reservation.count({
    where: {
      userId: userId,
      status: { in: ["CONFIRMED", "CHECKED_OUT"] },
      endTime: { gt: new Date() }
    }
  });

  const maxOpen = tier.maxReservations || settings.maxReservationsPerUser;
  if (activeReservationsCount >= maxOpen) {
    return { allowed: false, reason: `You have reached the maximum of ${maxOpen} active reservations.` };
  }

  // 5. Weekend Limits (if applicable)
  // This is complex: need to count weekend days used this year.
  if (tier.maxWeekendDaysPerYear) {
    const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
    const currentYearEnd = new Date(new Date().getFullYear(), 11, 31);
    
    // Find all past reservations this year
    const yearReservations = await prisma.reservation.findMany({
      where: {
        userId: userId,
        status: "COMPLETED",
        startTime: { gte: currentYearStart },
        endTime: { lte: currentYearEnd }
      }
    });

    // Calculate weekend days used
    let weekendDaysUsed = 0;
    for (const res of yearReservations) {
       let d = new Date(res.startTime);
       while (d < res.endTime) {
         if (isWeekend(d)) weekendDaysUsed++;
         d = addDays(d, 1);
       }
    }

    // Add current request
    let currentRequestWeekendDays = 0;
    let d = new Date(startTime);
    while (d < endTime) {
        if (isWeekend(d)) currentRequestWeekendDays++;
        d = addDays(d, 1);
    }

    if (weekendDaysUsed + currentRequestWeekendDays > tier.maxWeekendDaysPerYear) {
        return { allowed: false, reason: `This reservation would exceed your annual weekend day limit of ${tier.maxWeekendDaysPerYear} days.` };
    }
  }

  return { allowed: true };
}
