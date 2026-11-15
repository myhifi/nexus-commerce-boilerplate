import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { updateProduct } from "@/features/admin/product-actions";
import {
  getAdminCategories,
  getAdminProductById,
} from "@/features/admin/queries";
import { auth } from "@/shared/lib/auth";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  const updateActionWithId = updateProduct.bind(null, product.id);
  const serializableProduct = {
    ...product,
    price: product.price.toString(),
  };

  return (
    <ProductForm
      categories={categories}
      product={serializableProduct}
      action={updateActionWithId}
    />
  );
}
