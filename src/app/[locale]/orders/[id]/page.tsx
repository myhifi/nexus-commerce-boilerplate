import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getOrderById } from "@/features/checkout/queries";
import { storeConfig } from "@/shared/config/store.config";
import { CheckCircle2, Home, Package, Truck } from "lucide-react";
import { Link } from "@/shared/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tracking" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function OrderTrackingPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Tracking");
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: storeConfig.currency,
    }).format(amount);

  const statuses = ["PENDING", "PAID", "PREPARING", "READY", "DELIVERED"];
  const statusIndex = statuses.indexOf(order.status);
  const currentIndex = statusIndex === -1 ? 0 : statusIndex;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
        <h1 className="text-3xl font-bold text-foreground">{t("detailTitle")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("orderIdLabel")}: <span className="font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
        </p>
      </div>

      <div className="mb-12 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="relative flex justify-between">
          <div className="absolute left-0 right-0 top-1/2 -z-10 h-1 -translate-y-1/2 bg-muted" />
          {statuses.map((status, index) => {
            const isCompleted = index <= currentIndex;
            const translationKey = `status${status.charAt(0)}${status.slice(1).toLowerCase()}` as
              | "statusPending"
              | "statusPaid"
              | "statusPreparing"
              | "statusReady"
              | "statusDelivered";

            return (
              <div key={status} className="flex flex-col items-center gap-2 bg-card px-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index === 0 && <Package className="h-4 w-4" />}
                  {index === 2 && <Package className="h-4 w-4" />}
                  {index === 3 && <Truck className="h-4 w-4" />}
                  {index === 4 && <Home className="h-4 w-4" />}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t(translationKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-bold text-foreground">{t("deliveryInfoLabel")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{order.shippingAddress}</p>
          <p className="text-sm text-muted-foreground">{order.guestPhone}</p>
        </div>

        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between p-6">
              <div>
                <p className="font-medium text-foreground">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span className="font-medium text-foreground">
                {formatMoney(Number(item.priceAtOrder) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-border bg-muted p-6">
          <div className="flex justify-between text-lg font-bold text-foreground">
            <span>{t("totalLabel")}</span>
            <span>{formatMoney(Number(order.totalAmount))}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="text-sm font-medium text-accent hover:underline">
          {t("backToSearch")}
        </Link>
      </div>
    </main>
  );
}