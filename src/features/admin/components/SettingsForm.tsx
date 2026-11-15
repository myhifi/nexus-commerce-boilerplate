"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Store, Phone, Truck, CheckCircle2 } from "lucide-react";
import { updateSettings, type SettingsActionState } from "@/features/admin/settings-actions";

type Props = {
  initialSettings: Record<string, string>;
  saved: boolean;
};

const initialState: SettingsActionState = { success: false };

export function SettingsForm({ initialSettings, saved }: Props) {
  const t = useTranslations("AdminSettings");
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(updateSettings, initialState);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          {t("saved")}
        </div>
      )}

      <form action={formAction} className="space-y-8">
        <input type="hidden" name="locale" value={locale} />

        {/* Section: Store Information */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
            <Store className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">{t("storeInfo")}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="storeName" className="mb-1 block text-sm font-medium">{t("storeName")}</label>
              <input
                id="storeName"
                name="storeName"
                defaultValue={initialSettings.storeName || ""}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {state.fieldErrors?.storeName && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.storeName}</p>}
            </div>
            <div>
              <label htmlFor="supportEmail" className="mb-1 block text-sm font-medium">{t("supportEmail")}</label>
              <input
                id="supportEmail"
                name="supportEmail"
                type="email"
                defaultValue={initialSettings.supportEmail || ""}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {state.fieldErrors?.supportEmail && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.supportEmail}</p>}
            </div>
          </div>
        </div>

        {/* Section: Contact & Social */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
            <Phone className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">{t("contactSocial")}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="whatsappNumber" className="mb-1 block text-sm font-medium">{t("whatsappNumber")}</label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                defaultValue={initialSettings.whatsappNumber || ""}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="instagramUrl" className="mb-1 block text-sm font-medium">{t("instagramUrl")}</label>
              <input
                id="instagramUrl"
                name="instagramUrl"
                type="url"
                defaultValue={initialSettings.instagramUrl || ""}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="facebookUrl" className="mb-1 block text-sm font-medium">{t("facebookUrl")}</label>
              <input
                id="facebookUrl"
                name="facebookUrl"
                type="url"
                defaultValue={initialSettings.facebookUrl || ""}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="twitterUrl" className="mb-1 block text-sm font-medium">{t("twitterUrl")}</label>
              <input
                id="twitterUrl"
                name="twitterUrl"
                type="url"
                defaultValue={initialSettings.twitterUrl || ""}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Section: Shipping */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
            <Truck className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">{t("shipping")}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="shippingFlatRate" className="mb-1 block text-sm font-medium">{t("shippingFlatRate")}</label>
              <input
                id="shippingFlatRate"
                name="shippingFlatRate"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initialSettings.shippingFlatRate || "0"}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="freeShippingThreshold" className="mb-1 block text-sm font-medium">{t("freeShippingThreshold")}</label>
              <input
                id="freeShippingThreshold"
                name="freeShippingThreshold"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initialSettings.freeShippingThreshold || "0"}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-xs text-muted-foreground">{t("shippingHint")}</p>
            </div>
          </div>
        </div>

        {state.error && (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? t("saving") : t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}