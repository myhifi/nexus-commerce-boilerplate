"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteCategory } from "@/features/admin/category-actions";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteCategoryButton({ id }: { id: string }) {
  const t = useTranslations("AdminCategories");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    setIsDeleting(true);
    const result = await deleteCategory(id);
    if (!result.success) {
      alert(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
      title={t("delete")}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}