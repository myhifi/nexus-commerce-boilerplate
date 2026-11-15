"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import type { CategoryActionState } from "@/features/admin/category-actions";

type Category = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  displayOrder: number;
};

type Props = {
  category?: Category;
  action: (prevState: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;
};

const initialState: CategoryActionState = { success: false };

export function CategoryForm({ category, action }: Props) {
  const t = useTranslations("AdminCategories");
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isEdit = !!category;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/categories"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("backToCategories")}
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? t("editTitle") : t("createTitle")}
        </h1>
      </div>

      <form action={formAction} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <input type="hidden" name="locale" value={locale} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">{t("nameLabel")}</label>
            <input
              id="name"
              name="name"
              defaultValue={category?.name}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {state.fieldErrors?.name && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="nameEn" className="mb-1 block text-sm font-medium">{t("nameEnLabel")}</label>
            <input
              id="nameEn"
              name="nameEn"
              defaultValue={category?.nameEn || ""}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium">{t("slugLabel")}</label>
            <input
              id="slug"
              name="slug"
              defaultValue={category?.slug}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {state.fieldErrors?.slug && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.slug}</p>}
          </div>
          <div>
            <label htmlFor="displayOrder" className="mb-1 block text-sm font-medium">{t("orderLabel")}</label>
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              defaultValue={category?.displayOrder ?? 0}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">{t("descriptionLabel")}</label>
          <textarea
            id="description"
            name="description"
            defaultValue={category?.description || ""}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {state.error && (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Link
            href="/admin/categories"
            className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {t("cancel")}
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? t("saveChanges") : t("createCategory")}
          </button>
        </div>
      </form>
    </div>
  );
}