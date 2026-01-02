"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

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

export async function updateMember(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  // Basic security: only admins can update users (or self update - simplistic check)
  if (!session || (session.user.role !== 'ADMIN' && session.user.id !== id)) {
      throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as "MEMBER" | "ADMIN" | "INSTRUCTOR" | "MECHANIC";
  const shareSize = parseFloat(formData.get("shareSize") as string);
  const password = formData.get("password") as string;

  const data: any = {
      name,
      email,
      role,
      shareSize
  };

  if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
  }

  await prisma.user.update({
      where: { id },
      data
  });

  revalidatePath(`/members/${id}`);
  revalidatePath("/members");
  redirect("/members");
}
