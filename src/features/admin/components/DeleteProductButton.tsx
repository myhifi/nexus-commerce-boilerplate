"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProduct } from "@/features/admin/product-actions";

export function DeleteProductButton({ id }: { id: string }) {
  const t = useTranslations("AdminProducts");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;

    setIsDeleting(true);
    try {
      const result = await deleteProduct(id);
      if (!result.success) {
        window.alert(result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={t("delete")}
      className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
      title={t("delete")}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
