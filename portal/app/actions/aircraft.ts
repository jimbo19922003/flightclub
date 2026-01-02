"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AircraftStatus, AircraftRateType } from "@prisma/client";

export async function createAircraft(formData: FormData) {
  try {
    const registration = formData.get("registration") as string;
    const make = formData.get("make") as string;
    const model = formData.get("model") as string;
    const year = parseInt(formData.get("year") as string);
    const hourlyRate = parseFloat(formData.get("hourlyRate") as string);
    const rateType = formData.get("rateType") as AircraftRateType || "WET";
    const currentHobbs = parseFloat(formData.get("currentHobbs") as string);
    const currentTach = parseFloat(formData.get("currentTach") as string);
    const icaoHex = formData.get("icaoHex") as string || null;

    await prisma.aircraft.create({
      data: {
        registration,
        make,
        model,
        year,
        hourlyRate,
        rateType,
        currentHobbs,
        currentTach,
        icaoHex,
        status: "AVAILABLE"
      }
    });
  } catch (error) {
    console.error("Failed to create aircraft:", error);
    throw error;
  }

  revalidatePath("/aircraft");
  redirect("/aircraft");
}

export async function updateAircraft(id: string, formData: FormData) {
  try {
    const registration = formData.get("registration") as string;
    const make = formData.get("make") as string;
    const model = formData.get("model") as string;
    const year = parseInt(formData.get("year") as string);
    const hourlyRate = parseFloat(formData.get("hourlyRate") as string);
    const rateType = formData.get("rateType") as AircraftRateType;
    const currentHobbs = parseFloat(formData.get("currentHobbs") as string);
    const currentTach = parseFloat(formData.get("currentTach") as string);
    const icaoHex = formData.get("icaoHex") as string || null;
    const statusRaw = formData.get("status") as string;
    
    // Validate status
    let status: AircraftStatus = AircraftStatus.AVAILABLE;
    if (Object.values(AircraftStatus).includes(statusRaw as AircraftStatus)) {
        status = statusRaw as AircraftStatus;
    }

    if (isNaN(year) || isNaN(hourlyRate) || isNaN(currentHobbs) || isNaN(currentTach)) {
        throw new Error("Invalid numeric input");
    }

    await prisma.aircraft.update({
      where: { id },
      data: {
        registration,
        make,
        model,
        year,
        hourlyRate,
        rateType,
        currentHobbs,
        currentTach,
        icaoHex,
        status
      }
    });
  } catch (error) {
    console.error("Failed to update aircraft:", error);
    throw error;
  }

  revalidatePath(`/aircraft/${id}`);
  revalidatePath("/aircraft");
  redirect(`/aircraft/${id}`);
}
