import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminCategories } from "@/features/admin/queries";
import { Link } from "@/shared/i18n/navigation";
import { Pencil } from "lucide-react";
import { DeleteCategoryButton } from "@/features/admin/components/DeleteCategoryButton";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AdminCategories");

  const categories = await getAdminCategories();
  const getDisplayName = (category: (typeof categories)[number]) =>
    locale === "en" && category.nameEn ? category.nameEn : category.name;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
            {t("total", { count: categories.length })}
          </span>
          <Link
            href="/admin/categories/new"
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
              <th className="px-6 py-4 text-start font-medium">{t("name")}</th>
              <th className="px-6 py-4 text-start font-medium">{t("slug")}</th>
              <th className="px-6 py-4 text-start font-medium">{t("order")}</th>
              <th className="px-6 py-4 text-start font-medium">{t("productsCount")}</th>
              <th className="px-6 py-4 text-end font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium text-foreground">{getDisplayName(category)}</td>
                  <td className="px-6 py-4 font-mono text-muted-foreground">{category.slug}</td>
                  <td className="px-6 py-4 text-muted-foreground">{category.displayOrder}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                      {category._count.products}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title={t("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteCategoryButton id={category.id} />
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