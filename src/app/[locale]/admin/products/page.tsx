import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { auth } from "@/shared/lib/auth";
import { getAdminProducts } from "@/features/admin/queries";
import { DeleteProductButton } from "@/features/admin/components/DeleteProductButton";
import { storeConfig } from "@/shared/config/store.config";
import { Link } from "@/shared/i18n/navigation";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  const t = await getTranslations("AdminProducts");
  const products = await getAdminProducts();

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: storeConfig.currency,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
            {t("total", { count: products.length })}
          </span>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            {t("addNew")}
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4 text-start font-medium">{t("image")}</th>
              <th className="px-6 py-4 text-start font-medium">{t("name")}</th>
              <th className="px-6 py-4 text-start font-medium">
                {t("category")}
              </th>
              <th className="px-6 py-4 text-start font-medium">{t("price")}</th>
              <th className="px-6 py-4 text-start font-medium">{t("status")}</th>
              <th className="px-6 py-4 text-end font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatMoney(Number(product.price))}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isAvailable
                        ? t("available")
                        : t("unavailable")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={t("edit")}
                        title={t("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton id={product.id} />
                    </div>
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
