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
  const icaoHex = formData.get("icaoHex") as string || null;
  
  await prisma.aircraft.create({
    data: {
      registration,
      make,
      model,
      year,
      hourlyRate,
      currentHobbs,
      currentTach,
      icaoHex,
      status: "AVAILABLE"
    }
  });

  revalidatePath("/aircraft");
  redirect("/aircraft");
}

export async function updateAircraft(id: string, formData: FormData) {
  const registration = formData.get("registration") as string;
  const make = formData.get("make") as string;
  const model = formData.get("model") as string;
  const year = parseInt(formData.get("year") as string);
  const hourlyRate = parseFloat(formData.get("hourlyRate") as string);
  const currentHobbs = parseFloat(formData.get("currentHobbs") as string);
  const currentTach = parseFloat(formData.get("currentTach") as string);
  const icaoHex = formData.get("icaoHex") as string || null;
  const status = formData.get("status") as any; // Cast to any to avoid enum type issues in server action for now

  await prisma.aircraft.update({
    where: { id },
    data: {
      registration,
      make,
      model,
      year,
      hourlyRate,
      currentHobbs,
      currentTach,
      icaoHex,
      status
    }
  });

  revalidatePath(`/aircraft/${id}`);
  revalidatePath("/aircraft");
  redirect(`/aircraft/${id}`);
}
