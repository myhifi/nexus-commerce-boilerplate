"use server";

import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameEn: z.string().optional(),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens only"),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type ProductActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// 1. Create Product
export async function createProduct(
  prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const locale = (formData.get("locale") as string) || "en";
  const rawData = {
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl"),
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  };

  const validated = productSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: "Please check the form for errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.product.create({
      data: validated.data,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, error: "Failed to create product. Slug might be taken." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/${locale}/admin/products`); // Redirect on success with locale
}

// 2. Update Product
export async function updateProduct(
  id: string,
  prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const locale = (formData.get("locale") as string) || "en";
  const rawData = {
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl"),
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  };

  const validated = productSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: "Please check the form for errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: validated.data,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, error: "Failed to update product." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/products/${validated.data.slug}`);
  redirect(`/${locale}/admin/products`);
}

// 3. Delete Product
export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, error: "Cannot delete product. It may be linked to existing orders." };
  }
}