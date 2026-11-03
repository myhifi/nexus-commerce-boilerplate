import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStorefrontProducts } from "@/features/products/queries";
import { ProductCard } from "@/features/products/components/ProductCard";

type Props = {
  params: Promise<{ locale: string }>;
};

// SEO Metadata
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Shop" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Shop");
  
  // Fetch data from our Step 1 query
  const products = await getStorefrontProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {t("kicker")}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <p className="text-lg text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}
    </main>
  );
}