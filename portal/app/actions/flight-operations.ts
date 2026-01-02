"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ReservationStatus } from "@prisma/client";
import { updateFuelPricesInDB } from "./fuel";

// --- CHECK IN ---

export async function checkInReservation(
  reservationId: string,
  formData: FormData
) {
  const hobbsStart = parseFloat(formData.get("hobbsStart") as string);
  const tachStart = parseFloat(formData.get("tachStart") as string);
  const startHobbsPhotoUrl = formData.get("startHobbsPhotoUrl") as string; 
  
  // Basic validation
  if (isNaN(hobbsStart) || isNaN(tachStart)) {
    throw new Error("Invalid meter readings.");
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { aircraft: true }
  });

  if (!reservation) throw new Error("Reservation not found");

  // Trigger async fuel price update (fire and forget essentially, or await if critical)
  // We do it here so it's fresh for checkout (reimbursement)
  try {
      const settings = await prisma.clubSettings.findFirst();
      if (settings?.homeAirport) {
          // Don't await strictly if we want speed, but it's fast enough
          await updateFuelPricesInDB(settings.homeAirport);
      }
  } catch (e) {
      console.error("Failed to auto-update fuel prices on check-in", e);
  }

  // Create Flight Log Entry
  await prisma.flightLog.create({
    data: {
      reservationId: reservation.id,
      userId: reservation.userId,
      aircraftId: reservation.aircraftId,
      hobbsStart,
      hobbsEnd: 0, 
      tachStart,
      tachEnd: 0, 
      flightTime: 0,
      cost: 0,
      startHobbsPhotoUrl,
      preflightComplete: true
    }
  });

  // Update Reservation Status
  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "CHECKED_OUT",
      checkInTime: new Date()
    }
  });

  // Update Aircraft Status
  await prisma.aircraft.update({
    where: { id: reservation.aircraftId },
    data: { status: "IN_USE" }
  });

  revalidatePath(`/reservations/${reservationId}`);
  redirect(`/reservations/${reservationId}/active`); 
}

// --- CHECK OUT ---

export async function checkOutReservation(
  reservationId: string,
  formData: FormData
) {
  const hobbsEnd = parseFloat(formData.get("hobbsEnd") as string);
  const tachEnd = parseFloat(formData.get("tachEnd") as string);
  const fuelGallons = parseFloat(formData.get("fuelGallons") as string || "0");
  const fuelCost = parseFloat(formData.get("fuelCost") as string || "0");
  const fuelReimbursement = parseFloat(formData.get("fuelReimbursement") as string || "0"); 
  const notes = formData.get("notes") as string;
  const endHobbsPhotoUrl = formData.get("endHobbsPhotoUrl") as string;
  const fuelReceiptUrl = formData.get("fuelReceiptUrl") as string;

  // 1. Get Reservation & Flight Log
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { flightLog: true, aircraft: true, user: { include: { membershipTier: true } } }
  });

  if (!reservation || !reservation.flightLog) throw new Error("Reservation or flight log not found");
  if (reservation.status !== "CHECKED_OUT") throw new Error("Reservation is not active");

  const log = reservation.flightLog;
  const flightTime = hobbsEnd - log.hobbsStart;
  
  // Calculate Cost
  let hourlyRate = reservation.aircraft.hourlyRate;
  if (reservation.user.membershipTier?.hourlyRateDiscount) {
    hourlyRate = hourlyRate * (1 - reservation.user.membershipTier.hourlyRateDiscount / 100);
  }
  
  const flightCost = flightTime * hourlyRate;
  const totalCost = flightCost - fuelReimbursement; // Deduct reimbursement

  // 2. Update Flight Log
  await prisma.flightLog.update({
    where: { id: log.id },
    data: {
      hobbsEnd,
      tachEnd,
      flightTime,
      cost: totalCost,
      fuelGallons,
      fuelCost,
      fuelReimbursement,
      postflightComplete: true,
      notes,
      endHobbsPhotoUrl,
      fuelReceiptUrl
    }
  });

  // 3. Update Aircraft Meters & Status
  await prisma.aircraft.update({
    where: { id: reservation.aircraftId },
    data: {
      currentHobbs: hobbsEnd,
      currentTach: tachEnd,
      status: "AVAILABLE",
    }
  });

  // 4. Update Reservation
  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "COMPLETED",
      checkOutTime: new Date()
    }
  });
  
  // 5. Create Invoice (Draft)
  await prisma.invoice.create({
    data: {
      userId: reservation.userId,
      amount: totalCost,
      status: "DRAFT", 
      dueDate: addDays(new Date(), 30), 
      description: `Flight: ${reservation.aircraft.registration} - ${flightTime.toFixed(1)} hrs`,
      items: {
        create: [
          {
            description: `Flight Time (${reservation.aircraft.registration})`,
            quantity: flightTime,
            unitPrice: hourlyRate,
            amount: flightCost
          },
          {
             description: "Fuel Reimbursement",
             quantity: 1,
             unitPrice: -fuelReimbursement,
             amount: -fuelReimbursement
          }
        ]
      }
    }
  });
  
  // 6. Update User Balance
  await prisma.user.update({
      where: { id: reservation.userId },
      data: {
          balance: { increment: totalCost }
      }
  });

  revalidatePath(`/reservations/${reservationId}`);
  redirect(`/reservations/${reservationId}/summary`);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
