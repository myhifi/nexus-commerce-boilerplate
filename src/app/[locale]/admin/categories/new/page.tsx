import { createCategory } from "@/features/admin/category-actions";
import { CategoryForm } from "@/features/admin/components/CategoryForm";

export default function NewCategoryPage() {
  return <CategoryForm action={createCategory} />;
}