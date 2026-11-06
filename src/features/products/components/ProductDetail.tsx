"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { storeConfig } from "@/shared/config/store.config";
import { useCartStore, type CartModifier } from "@/features/cart/store";
import { Link } from "@/shared/i18n/navigation";

type Variant = {
  id: string;
  name: string;
  price: string;
  stock: number;
};

type Modifier = {
  id: string;
  name: string;
  priceDelta: string;
};

type ModifierGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  modifiers: Modifier[];
};

type ProductDetailData = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  basePrice: string;
  variants: Variant[];
  modifierGroups: ModifierGroup[];
};

type Props = {
  product: ProductDetailData;
};

export function ProductDetail({ product }: Props) {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);

  const hasVariants = product.variants.length > 0;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    hasVariants ? product.variants[0].id : null,
  );
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, string[]>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const displayName =
    locale === "en" && product.nameEn ? product.nameEn : product.name;
  const displayDescription =
    locale === "en" && product.descriptionEn
      ? product.descriptionEn
      : product.description;

  const selectedVariant = hasVariants
    ? product.variants.find((v) => v.id === selectedVariantId) ?? null
    : null;

  const unitBasePrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product.basePrice);

  // React Compiler handles memoization, no need for useMemo here.
  const selectedModifiersFlat: CartModifier[] = [];
  for (const group of product.modifierGroups) {
    const ids = selectedModifiers[group.id] ?? [];
    for (const modId of ids) {
      const mod = group.modifiers.find((m) => m.id === modId);
      if (mod) {
        selectedModifiersFlat.push({
          modifierId: mod.id,
          groupId: group.id,
          name: mod.name,
          priceDelta: Number(mod.priceDelta),
        });
      }
    }
  }

  const unitTotal =
    unitBasePrice +
    selectedModifiersFlat.reduce((sum, m) => sum + m.priceDelta, 0);

  let validationError: string | null = null;
  for (const group of product.modifierGroups) {
    const selected = selectedModifiers[group.id]?.length ?? 0;
    if (selected < group.minSelect) {
      validationError = t("selectRequiredModifiers", {
        group: group.name,
        count: group.minSelect,
      });
      break;
    }
  }

  const formattedUnitPrice = formatMoney(unitTotal);
  const formattedLineTotal = formatMoney(unitTotal * quantity);

  function formatMoney(amount: number): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: storeConfig.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function toggleModifier(group: ModifierGroup, modifierId: string) {
    setError(null);
    setAdded(false);
    setSelectedModifiers((prev) => {
      const current = prev[group.id] ?? [];
      let next: string[];

      if (group.maxSelect === 1) {
        next = current.includes(modifierId) ? [] : [modifierId];
      } else if (current.includes(modifierId)) {
        next = current.filter((id) => id !== modifierId);
      } else if (current.length < group.maxSelect) {
        next = [...current, modifierId];
      } else {
        next = [...current.slice(1), modifierId];
      }

      return { ...prev, [group.id]: next };
    });
  }

  function handleAddToCart() {
    if (validationError) {
      setError(validationError);
      return;
    }

    addItem({
      productId: product.id,
      productName: displayName,
      productSlug: product.slug,
      imageUrl: product.imageUrl ?? undefined,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      unitBasePrice,
      modifiers: selectedModifiersFlat,
      quantity,
    });

    setAdded(true);
    setQuantity(1);
    setError(null);
    setTimeout(() => setAdded(false), 2000);
  }

  const canAdd = product.isAvailable && !validationError;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("backToShop")}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={displayName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-16 w-16" />
            </div>
          )}
          {!product.isAvailable && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
              {t("unavailable")}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {displayName}
          </h1>

          {displayDescription && (
            <p className="mt-2 text-muted-foreground">{displayDescription}</p>
          )}

          <div className="mt-4 text-2xl font-bold text-accent">
            {formattedUnitPrice}
          </div>

          {/* Variants */}
          {hasVariants && (
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("selectVariant")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  const isOutOfStock = v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={isOutOfStock}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-background text-foreground hover:border-accent"
                      } ${isOutOfStock ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      {v.name} — {formatMoney(Number(v.price))}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Modifiers */}
          {product.modifierGroups.map((group) => {
            const selectedCount = selectedModifiers[group.id]?.length ?? 0;
            const isSingle = group.maxSelect === 1;

            return (
              <section key={group.id} className="mt-6">
                <h2 className="mb-2 flex flex-wrap items-baseline gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>{group.name}</span>
                  <span className="text-xs font-normal normal-case text-muted-foreground">
                    {group.minSelect > 0
                      ? t("requiredCount", { count: group.minSelect })
                      : t("optional")}
                    {group.maxSelect > 1 &&
                      ` · ${t("maxCount", { count: group.maxSelect })}`}
                  </span>
                </h2>
                <div className="space-y-2">
                  {group.modifiers.map((m) => {
                    const isChecked =
                      selectedModifiers[group.id]?.includes(m.id) ?? false;
                    const delta = Number(m.priceDelta);

                    return (
                      <label
                        key={m.id}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-4 py-2 transition-colors hover:border-accent"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type={isSingle ? "radio" : "checkbox"}
                            name={group.id}
                            checked={isChecked}
                            onChange={() => toggleModifier(group, m.id)}
                            className="h-4 w-4 accent-accent"
                          />
                          <span className="text-sm text-foreground">
                            {m.name}
                          </span>
                        </div>
                        {delta > 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{formatMoney(delta)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
                {group.minSelect > 0 && selectedCount < group.minSelect && (
                  <p className="mt-1 text-xs text-warning">
                    {t("selectedOfRequired", {
                      selected: selectedCount,
                      required: group.minSelect,
                    })}
                  </p>
                )}
              </section>
            );
          })}

          {/* Actions */}
          <div className="mt-auto pt-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-full border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-s-full px-4 py-2 text-lg hover:bg-muted disabled:opacity-40"
                  aria-label={t("decreaseQuantity")}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="min-w-10 text-center text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="rounded-e-full px-4 py-2 text-lg hover:bg-muted"
                  aria-label={t("increaseQuantity")}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAdd}
                className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {!product.isAvailable
                  ? t("unavailable")
                  : added
                    ? t("added")
                    : `${t("addToCart")} · ${formattedLineTotal}`}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}