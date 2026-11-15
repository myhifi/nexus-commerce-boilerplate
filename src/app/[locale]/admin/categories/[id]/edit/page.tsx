import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { updateCategory } from "@/features/admin/category-actions";
import { CategoryForm } from "@/features/admin/components/CategoryForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  const updateActionWithId = updateCategory.bind(null, category.id);

  return (
    <CategoryForm 
      category={category} 
      action={updateActionWithId} 
    />
  );
}