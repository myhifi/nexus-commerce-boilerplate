"use server";

import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

// Define all the keys the client can manage in the settings page
const SETTING_KEYS = [
  "storeName",
  "supportEmail",
  "whatsappNumber",
  "instagramUrl",
  "facebookUrl",
  "twitterUrl",
  "shippingFlatRate",
  "freeShippingThreshold",
] as const;

const settingsSchema = z.object({
  storeName: z.string().min(2, "Store name is required").max(100),
  supportEmail: z.string().email("Invalid email address"),
  whatsappNumber: z.string().min(5, "Phone number is too short"),
  instagramUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  facebookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  shippingFlatRate: z.coerce.number().nonnegative("Must be 0 or more"),
  freeShippingThreshold: z.coerce.number().nonnegative("Must be 0 or more"),
});

export type SettingsActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateSettings(
  prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const locale = (formData.get("locale") as string) || "en";
  const rawData: Record<string, unknown> = {};
  for (const key of SETTING_KEYS) {
    rawData[key] = formData.get(key) || "";
  }

  const validated = settingsSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: "Please check the form for errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // Upsert each setting individually (allows adding new keys without migrations)
    const entries = Object.entries(validated.data);

    await Promise.all(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );
  } catch (error) {
    console.error("Update settings error:", error);
    return { success: false, error: "Failed to save settings. Please try again." };
  }

  revalidateTag("store-settings", "max");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  
  redirect(`/${locale}/admin/settings?saved=true`);
}