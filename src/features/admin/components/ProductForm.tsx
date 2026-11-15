"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import type { ProductActionState } from "@/features/admin/product-actions";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  descriptionEn: string | null;
  price: string | number;
  categoryId: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
};

type Props = {
  categories: Category[];
  product?: Product; // If provided, we are in "Edit" mode
  action: (prevState: ProductActionState, formData: FormData) => Promise<ProductActionState>;
};

const initialState: ProductActionState = { success: false };

export function ProductForm({ categories, product, action }: Props) {
  const t = useTranslations("AdminProducts");
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isEdit = !!product;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("backToProducts")}
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? t("editTitle") : t("createTitle")}
        </h1>
      </div>

      <form action={formAction} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <input type="hidden" name="locale" value={locale} />
        {/* Name & English Name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">{t("nameLabel")}</label>
            <input
              id="name"
              name="name"
              defaultValue={product?.name}
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
              defaultValue={product?.nameEn || ""}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Slug & Category */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium">{t("slugLabel")}</label>
            <input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {state.fieldErrors?.slug && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.slug}</p>}
          </div>
          <div>
            <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">{t("categoryLabel")}</label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId || ""}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="" disabled>{t("selectCategory")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Image URL */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium">{t("priceLabel")}</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.price.toString()}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {state.fieldErrors?.price && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.price}</p>}
          </div>
          <div>
            <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium">{t("imageUrlLabel")}</label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={product?.imageUrl || ""}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {state.fieldErrors?.imageUrl && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.imageUrl}</p>}
          </div>
        </div>

        {/* Descriptions */}
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">{t("descriptionLabel")}</label>
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description || ""}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label htmlFor="descriptionEn" className="mb-1 block text-sm font-medium">{t("descriptionEnLabel")}</label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            defaultValue={product?.descriptionEn || ""}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Toggles */}
        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={product?.isAvailable ?? true}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm font-medium">{t("availableLabel")}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product?.isFeatured ?? false}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm font-medium">{t("featuredLabel")}</span>
          </label>
        </div>

        {/* Form Error */}
        {state.error && (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Link
            href="/admin/products"
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
            {isEdit ? t("saveChanges") : t("createProduct")}
          </button>
        </div>
      </form>
    </div>
  );
}