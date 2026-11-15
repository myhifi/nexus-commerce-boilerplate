"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteUser } from "@/features/admin/user-actions";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteUserButton({ id, isSelf }: { id: string; isSelf: boolean }) {
  const t = useTranslations("AdminUsers");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isSelf) {
      alert(t("errorSelfDelete"));
      return;
    }
    if (!confirm(t("deleteConfirm"))) return;
    setIsDeleting(true);
    const result = await deleteUser(id);
    if (!result.success) {
      alert(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting || isSelf}
      className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
      title={t("delete")}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}