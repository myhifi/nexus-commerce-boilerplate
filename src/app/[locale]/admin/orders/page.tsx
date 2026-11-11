import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/shared/lib/auth";
import { getAllOrders } from "@/features/admin/queries";
import { storeConfig } from "@/shared/config/store.config";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AdminOrders");

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  const orders = await getAllOrders();

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: storeConfig.currency,
    }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
          {t("total", { count: orders.length })}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4 text-start font-medium">{t("orderId")}</th>
              <th className="px-6 py-4 text-start font-medium">{t("date")}</th>
              <th className="px-6 py-4 text-start font-medium">{t("customer")}</th>
              <th className="px-6 py-4 text-start font-medium">{t("status")}</th>
              <th className="px-6 py-4 text-end font-medium">{t("totalAmount")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-mono text-xs text-foreground">
                    {order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{order.guestName}</div>
                    <div className="text-xs text-muted-foreground">{order.guestEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end font-medium text-foreground">
                    {formatMoney(Number(order.totalAmount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}