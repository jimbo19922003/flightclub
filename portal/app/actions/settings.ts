"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function updateClubSettings(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as "EQUITY" | "NON_PROFIT" | "COMMERCIAL";
  const homeAirport = formData.get("homeAirport") as string;
  const homeAirportFuelPrice = parseFloat(formData.get("fuelPrice100LL") as string) || 0;
  const fuelPriceJetA = parseFloat(formData.get("fuelPriceJetA") as string) || 0;
  const fuelPriceUL94 = parseFloat(formData.get("fuelPriceUL94") as string) || 0;
  const currency = formData.get("currency") as string;
  const timezone = formData.get("timezone") as string;
  const monthlyDues = parseFloat(formData.get("monthlyDues") as string) || 0;
  const billingCycleDay = parseInt(formData.get("billingCycleDay") as string) || 1;
  const maxReservationsPerUser = parseInt(formData.get("maxReservationsPerUser") as string) || 3;
  const maxReservationDays = parseInt(formData.get("maxReservationDays") as string) || 7;
  const suspendOverdueDays = parseInt(formData.get("suspendOverdueDays") as string) || 10;
  const stripePublicKey = formData.get("stripePublicKey") as string;
  const stripeSecretKey = formData.get("stripeSecretKey") as string;

  // Upsert ensures we only have one settings row (or updates the existing one)
  const settings = await prisma.clubSettings.findFirst();
  
  // Ensure fuelPriceLastUpdated is not wiped out if it exists
  const fuelPriceLastUpdated = settings?.fuelPriceLastUpdated;

  if (settings) {
    await prisma.clubSettings.update({
      where: { id: settings.id },
      data: {
        name,
        type,
        homeAirport,
        fuelPrice100LL: homeAirportFuelPrice,
        fuelPriceJetA,
        fuelPriceUL94,
        fuelPriceLastUpdated,
        currency,
        timezone,
        monthlyDues,
        billingCycleDay,
        maxReservationsPerUser,
        maxReservationDays,
        suspendOverdueDays,
        stripePublicKey,
        stripeSecretKey
      },
    });
  } else {
    await prisma.clubSettings.create({
      data: {
        name,
        type,
        homeAirport,
        fuelPrice100LL: homeAirportFuelPrice || 6.50,
        fuelPriceJetA: fuelPriceJetA || 5.50,
        fuelPriceUL94: fuelPriceUL94 || 6.00,
        currency,
        timezone,
        monthlyDues,
        billingCycleDay,
        maxReservationsPerUser,
        maxReservationDays,
        suspendOverdueDays,
        stripePublicKey,
        stripeSecretKey
      },
    });
  }

  revalidatePath("/settings");
}

export async function createMembershipTier(formData: FormData) {
    const name = formData.get("name") as string;
    const monthlyDues = parseFloat(formData.get("monthlyDues") as string);
    const maxReservations = parseInt(formData.get("maxReservations") as string);
    const maxDaysPerReservation = parseInt(formData.get("maxDaysPerReservation") as string);
    const bookingWindowDays = parseInt(formData.get("bookingWindowDays") as string);
    const hourlyRateDiscount = parseFloat(formData.get("hourlyRateDiscount") as string);
    const maxWeekendDaysPerYear = formData.get("maxWeekendDaysPerYear") ? parseInt(formData.get("maxWeekendDaysPerYear") as string) : null;
    const maxTripLengthDays = parseInt(formData.get("maxTripLengthDays") as string);

    await prisma.membershipTier.create({
        data: {
            name,
            monthlyDues,
            maxReservations,
            maxDaysPerReservation,
            bookingWindowDays,
            hourlyRateDiscount,
            maxWeekendDaysPerYear,
            maxTripLengthDays
        }
    });
    
    revalidatePath("/settings");
}

export async function deleteMembershipTier(id: string) {
    // In a real app, check if users are assigned to this tier first!
    await prisma.membershipTier.delete({
        where: { id }
    });
    revalidatePath("/settings");
}

export async function updatePassword(formData: FormData) {
    const password = formData.get("password") as string;
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        throw new Error("Not authenticated");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword }
    });

    revalidatePath("/settings");
}
