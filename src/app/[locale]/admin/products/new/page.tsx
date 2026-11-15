import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { createProduct } from "@/features/admin/product-actions";
import { getAdminCategories } from "@/features/admin/queries";
import { auth } from "@/shared/lib/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewProductPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  const categories = await getAdminCategories();

  return <ProductForm categories={categories} action={createProduct} />;
}
