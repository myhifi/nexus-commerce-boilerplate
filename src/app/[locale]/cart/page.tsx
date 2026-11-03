import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartClient } from "./CartClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cart" });

  return {
    title: t("title"),
    robots: { index: false, follow: false }, // SEO: Don't index cart pages
  };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CartClient />;
}