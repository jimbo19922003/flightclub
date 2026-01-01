"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateClubSettings(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as "EQUITY" | "NON_PROFIT" | "COMMERCIAL";
  const homeAirport = formData.get("homeAirport") as string;
  const currency = formData.get("currency") as string;
  const timezone = formData.get("timezone") as string;
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
        homeAirport,
        currency,
        timezone,
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
        homeAirport,
        currency,
        timezone,
        monthlyDues,
        billingCycleDay,
        maxReservationsPerUser,
        maxReservationDays,
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

    await prisma.membershipTier.create({
        data: {
            name,
            monthlyDues,
            maxReservations,
            maxDaysPerReservation,
            bookingWindowDays,
            hourlyRateDiscount
        }
    });
    
    revalidatePath("/settings");
}

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

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
