import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDashboardStats } from "@/features/admin/queries";
import { storeConfig } from "@/shared/config/store.config";
import { Link } from "@/shared/i18n/navigation";
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import Image from "next/image";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AdminDashboard");

  const { stats, recentOrders, topProducts, weeklyRevenue } = await getDashboardStats();

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: storeConfig.currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const getDisplayName = (product: { name: string; nameEn: string | null }) => 
    locale === "en" && product.nameEn ? product.nameEn : product.name;

  // Calculate max value for the CSS chart scaling
  const maxRevenue = Math.max(...weeklyRevenue);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("revenue")}</p>
              <h3 className="text-2xl font-bold text-foreground">{formatMoney(stats.totalRevenue)}</h3>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("orders")}</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("products")}</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.totalProducts}</h3>
            </div>
          </div>
        </div>

        {/* Staff */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("staff")}</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.totalUsers}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Weekly Revenue Chart (Pure CSS) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("weeklyRevenue")}</h2>
              <p className="text-xs text-muted-foreground">{t("chartMockHint")}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          
          <div className="flex h-64 items-end gap-4">
            {weeklyRevenue.map((amount, index) => {
              const heightPercent = (amount / maxRevenue) * 100;
              return (
                <div key={index} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 items-end justify-center rounded-t-md bg-muted/30 transition-colors hover:bg-muted/50">
                    <div 
                      className="w-full rounded-t-md bg-accent transition-all duration-500 group-hover:bg-accent-dark" 
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    {/* Tooltip on hover */}
                    <span className="absolute -top-8 hidden rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                      {formatMoney(amount)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Day {index + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-foreground">{t("topProducts")}</h2>
          <ul className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noProducts")}</p>
            ) : (
              topProducts.map((product, i) => (
                <li key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {product.imageUrl && (
                        <Image src={product.imageUrl} alt={product.name} fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="line-clamp-1 text-sm font-medium text-foreground">
                        {getDisplayName(product)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("sold", { count: product.totalSold })}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-lg font-bold text-foreground">{t("recentOrders")}</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            {t("viewAll")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
        <table className="w-full text-start text-sm">
          <tbody className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-center text-muted-foreground">{t("noOrders")}</td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-mono text-xs text-foreground">
                    {order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{order.guestName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.status === "PAID" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
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