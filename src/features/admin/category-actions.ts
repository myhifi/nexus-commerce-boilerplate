"use server";

import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameEn: z.string().optional(),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens only"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().default(0),
});

export type CategoryActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createCategory(
  prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const locale = (formData.get("locale") as string) || "en";
  const rawData = {
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    displayOrder: formData.get("displayOrder") || 0,
  };

  const validated = categorySchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: "Please check the form for errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.category.create({
      data: validated.data,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "Failed to create category. Slug might be taken." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/${locale}/admin/categories`);
}

export async function updateCategory(
  id: string,
  prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const locale = (formData.get("locale") as string) || "en";
  const rawData = {
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    displayOrder: formData.get("displayOrder") || 0,
  };

  const validated = categorySchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: "Please check the form for errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: validated.data,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "Failed to update category." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/${locale}/admin/categories`);
}

export async function deleteCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (category && category._count.products > 0) {
      return {
        success: false,
        error:
          "Cannot delete category. It currently contains products. Please move or delete those products first.",
      };
    }

    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return {
      success: false,
      error: "Cannot delete category. An unexpected error occurred.",
    };
  }
}