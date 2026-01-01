"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAircraft(formData: FormData) {
  const registration = formData.get("registration") as string;
  const make = formData.get("make") as string;
  const model = formData.get("model") as string;
  const year = parseInt(formData.get("year") as string);
  const hourlyRate = parseFloat(formData.get("hourlyRate") as string);
  const currentHobbs = parseFloat(formData.get("currentHobbs") as string);
  const currentTach = parseFloat(formData.get("currentTach") as string);
  
  await prisma.aircraft.create({
    data: {
      registration,
      make,
      model,
      year,
      hourlyRate,
      currentHobbs,
      currentTach,
      status: "AVAILABLE"
    }
  });

  revalidatePath("/aircraft");
  redirect("/aircraft");
}
