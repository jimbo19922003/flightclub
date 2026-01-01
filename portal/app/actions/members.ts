"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMember(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as "MEMBER" | "ADMIN" | "INSTRUCTOR" | "MECHANIC";
  const shareSize = parseFloat(formData.get("shareSize") as string);
  
  await prisma.user.create({
    data: {
      name,
      email,
      role,
      shareSize
    }
  });

  revalidatePath("/members");
  redirect("/members");
}
