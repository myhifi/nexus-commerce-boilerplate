"use client";

import { useActionState, useEffect, useSyncExternalStore } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { useCartStore } from "@/features/cart/store";
import { createOrder, type CheckoutState } from "@/features/checkout/actions";
import { storeConfig } from "@/shared/config/store.config";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";

/* ----------------------------------------------------------------
 * SSR-safe client detection (prevents hydration mismatch)
 * ---------------------------------------------------------------- */
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const useIsClient = () => useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

const initialState: CheckoutState = { success: false };

export function CheckoutForm() {
  const t = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const locale = useLocale();
  const router = useRouter();
  
  // 1. Hooks must be called at the top level
  const hasMounted = useIsClient();
  const [state, formAction, isPending] = useActionState(createOrder, initialState);
  
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  // 2. Clear the cart ONLY after a successful order creation
  useEffect(() => {
    if (state.success && state.orderId) {
      clearCart();
    }
  }, [state.success, state.orderId, clearCart]);

  // 3. Prevent rendering on the server to avoid hydration issues with Zustand
  if (!hasMounted) return null;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: storeConfig.currency,
    }).format(amount);

  // Empty Cart Guard
  if (items.length === 0 && !state.success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("errorEmptyCart")}</h1>
        <Link href="/shop" className="mt-4 inline-block text-accent hover:underline">
          {tCart("continueShopping")}
        </Link>
      </div>
    );
  }

  // Success State
  if (state.success && state.orderId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
        <CheckCircle2 className="mb-4 h-16 w-16 text-success" />
        <h1 className="mb-2 text-3xl font-bold text-foreground">{t("successTitle")}</h1>
        <p className="mb-8 text-muted-foreground">
          {t("successMessage", { orderId: state.orderId.slice(0, 8).toUpperCase() })}
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          {tCart("continueShopping")}
        </button>
      </div>
    );
  }

  // Map items to a simple format for the server action
  const cartPayload = items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId,
    quantity: i.quantity,
  }));

  return (
    <div>
      <Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {t("backToCart")}
      </Link>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Left Side: Form */}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="mb-8 text-muted-foreground">{t("subtitle")}</p>

          <form action={formAction} className="space-y-4">
            {/* Hidden input to pass cart data to server action securely */}
            <input type="hidden" name="items" value={JSON.stringify(cartPayload)} />

            <div>
              <label htmlFor="guestName" className="mb-1 block text-sm font-medium text-foreground">{t("name")}</label>
              <input
                id="guestName"
                type="text"
                name="guestName"
                required
                placeholder={t("namePlaceholder")}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            
            <div>
              <label htmlFor="guestEmail" className="mb-1 block text-sm font-medium text-foreground">{t("email")}</label>
              <input
                id="guestEmail"
                type="email"
                name="guestEmail"
                required
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="guestPhone" className="mb-1 block text-sm font-medium text-foreground">{t("phone")}</label>
              <input
                id="guestPhone"
                type="tel"
                name="guestPhone"
                required
                placeholder={t("phonePlaceholder")}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="shippingAddress" className="mb-1 block text-sm font-medium text-foreground">{t("address")}</label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                required
                rows={3}
                placeholder={t("addressPlaceholder")}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-accent py-3 font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-50"
            >
              {isPending ? t("submitting") : t("submit")}
            </button>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div>
          <div className="rounded-xl border border-border bg-muted p-6">
            <h2 className="mb-6 text-lg font-bold text-foreground">{tCart("summary")}</h2>
            <ul className="mb-6 space-y-4">
              {items.map((item) => (
                <li key={item.lineId} className="flex justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-background">
                       {item.imageUrl && (
                         <Image src={item.imageUrl} alt={item.productName} fill sizes="48px" className="object-cover" />
                       )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{formatMoney(item.unitTotal * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-bold text-foreground">
                <span>{tCart("subtotal")}</span>
                <span>{formatMoney(getSubtotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}