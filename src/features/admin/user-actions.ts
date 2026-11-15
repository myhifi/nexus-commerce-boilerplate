"use server";

import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/shared/lib/auth";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "STAFF"]),
  isActive: z.boolean().default(true),
});

export type UserActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  fields?: Record<string, string | boolean>;
};

export async function createUser(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const locale = (formData.get("locale") as string) || "en";
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on",
  };
  const fields = {
    name: typeof rawData.name === "string" ? rawData.name : "",
    email: typeof rawData.email === "string" ? rawData.email : "",
    role: typeof rawData.role === "string" ? rawData.role : "",
    isActive: rawData.isActive,
  };

  const validated = userSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: "Please check the form for errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
      fields,
    };
  }

  if (!validated.data.password) {
    return {
      success: false,
      error: "Password is required for new users.",
      fields,
    };
  }

  try {
    const passwordHash = await bcrypt.hash(validated.data.password, 10);
    
    await prisma.user.create({
      data: {
        name: validated.data.name,
        email: validated.data.email,
        passwordHash,
        role: validated.data.role,
        isActive: validated.data.isActive,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return {
      success: false,
      error: "Failed to create user. Email might already be in use.",
      fields,
    };
  }

  revalidatePath("/admin/users");
  redirect(`/${locale}/admin/users`);
}

export async function updateUser(
  id: string,
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await auth();
  const locale = (formData.get("locale") as string) || "en";
  
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on",
  };
  const fields = {
    name: typeof rawData.name === "string" ? rawData.name : "",
    email: typeof rawData.email === "string" ? rawData.email : "",
    role: typeof rawData.role === "string" ? rawData.role : "",
    isActive: rawData.isActive,
  };

  const validated = userSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: "Please check the form for errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
      fields,
    };
  }

  const userToUpdate = await prisma.user.findUnique({ where: { id } });
  if (!userToUpdate) {
    return { success: false, error: "User not found.", fields };
  }
  const isSelf =
    session?.user?.id === id ||
    session?.user?.email === userToUpdate.email;

  // Safety: Cannot demote yourself
  if (isSelf && validated.data.role !== "ADMIN") {
    return {
      success: false,
      error: "You cannot change your own role.",
      fields,
    };
  }

  // Safety: Cannot disable yourself
  if (isSelf && !validated.data.isActive) {
    return {
      success: false,
      error: "You cannot disable your own account.",
      fields,
    };
  }

  try {
    type UserUpdatePayload = {
      name: string;
      email: string;
      role: "ADMIN" | "STAFF";
      isActive: boolean;
      passwordHash?: string;
    };

    const dataToUpdate: UserUpdatePayload = {
      name: validated.data.name,
      email: validated.data.email,
      role: validated.data.role,
      isActive: validated.data.isActive,
    };

    // Only hash and update password if provided
    if (validated.data.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(validated.data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "Failed to update user.", fields };
  }

  revalidatePath("/admin/users");
  redirect(`/${locale}/admin/users`);
}

export async function deleteUser(id: string) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unable to verify your account." };
  }

  try {
    const userToDelete = await prisma.user.findUnique({ where: { id } });

    if (!userToDelete) {
      return { success: false, error: "User not found." };
    }

    const isSelf =
      session.user.id === id || session.user.email === userToDelete.email;
    if (isSelf) {
      return { success: false, error: "You cannot delete your own account." };
    }

    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Failed to delete user." };
  }
}