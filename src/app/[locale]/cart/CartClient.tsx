"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/shared/i18n/navigation";
import { useCartStore } from "@/features/cart/store";
import { storeConfig } from "@/shared/config/store.config";
import { Trash2 } from "lucide-react";

export function CartClient() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  
  // Use selectors for optimal React 19 performance
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = getSubtotal();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: storeConfig.currency,
    }).format(amount);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-4 text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="mb-8 text-lg text-muted-foreground">{t("empty")}</p>
        <Link
          href="/shop"
          className="inline-block rounded-lg bg-accent px-8 py-3 font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          {t("continueShopping")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-foreground">{t("title")}</h1>
      <p className="mb-8 text-muted-foreground">
        {t("itemCount", { count: totalItems })}
      </p>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Cart Items List */}
        <div className="space-y-4 md:col-span-2">
          {items.map((item) => (
            <div
              key={item.lineId}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              {/* Image */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-1 text-center text-xs text-muted-foreground">
                    {item.productName}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="font-semibold text-foreground hover:underline"
                  >
                    {item.productName}
                  </Link>
                  {item.variantName && (
                    <p className="text-sm text-muted-foreground">
                      {item.variantName}
                    </p>
                  )}
                  {item.modifiers.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      + {item.modifiers.map((m) => m.name).join(", ")}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 rounded-lg border border-border px-2 py-1">
                    <button
                      onClick={() => setQuantity(item.lineId, item.quantity - 1)}
                      className="px-2 font-bold text-muted-foreground hover:text-foreground"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                      className="px-2 font-bold text-muted-foreground hover:text-foreground"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-end">
                    <p className="font-semibold text-foreground">
                      {formatMoney(item.unitTotal * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {t("each", { price: formatMoney(item.unitTotal) })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeLine(item.lineId)}
                className="self-start p-2 text-muted-foreground transition-colors hover:text-destructive"
                aria-label={t("remove")}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-muted p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              {t("summary")}
            </h2>
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-semibold text-foreground">
                {formatMoney(subtotal)}
              </span>
            </div>
            <button className="w-full rounded-lg bg-accent py-3 font-medium text-accent-foreground transition-colors hover:bg-accent-dark">
              {t("checkout")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}