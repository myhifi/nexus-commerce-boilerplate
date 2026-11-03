"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { storeConfig } from "@/shared/config/store.config";
import { useCartStore } from "@/features/cart/store";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  hasModifiers: boolean;
};

type Props = {
  product: ProductCardData;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: Props) {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);

  const displayName =
    locale === "en" && product.nameEn ? product.nameEn : product.name;

  const basePriceNum = Number(product.price);
  const requiresSelection = product.hasVariants || product.hasModifiers;
  const detailHref = `/${locale}/products/${product.slug}`;

  const formattedPrice = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: storeConfig.currency,
    minimumFractionDigits: 2,
  }).format(basePriceNum);

  const handleQuickAdd = () => {
    addItem({
      productId: product.id,
      productName: displayName,
      productSlug: product.slug,
      imageUrl: product.imageUrl ?? undefined,
      variantId: null,
      variantName: null,
      unitBasePrice: basePriceNum,
      modifiers: [],
      quantity: 1,
    });
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-md">
      <Link
        href={detailHref}
        className="relative aspect-square overflow-hidden bg-neutral-100"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={displayName}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}

        {product.isFeatured && (
          <span className="absolute top-3 inset-s-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">
            ★
          </span>
        )}

        {!product.isAvailable && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
            {t("unavailable")}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link
          href={detailHref}
          className="line-clamp-1 text-base font-semibold text-neutral-900 hover:underline"
        >
          {displayName}
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span
            className="text-lg font-bold"
            style={{ color: storeConfig.branding.primaryColor }}
          >
            {product.hasVariants
              ? t("fromPrice", { price: formattedPrice })
              : formattedPrice}
          </span>

          {requiresSelection ? (
            <Link
              href={detailHref}
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
            >
              {t("viewOptions")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!product.isAvailable}
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("addToCart")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}