"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import type { UserActionState } from "@/features/admin/user-actions";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

type Props = {
  user?: User;
  action: (prevState: UserActionState, formData: FormData) => Promise<UserActionState>;
};

const initialState: UserActionState = { success: false };

export function UserForm({ user, action }: Props) {
  const t = useTranslations("AdminUsers");
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isEdit = !!user;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("backToUsers")}
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? t("editTitle") : t("createTitle")}
        </h1>
      </div>

      <form action={formAction} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">{t("nameLabel")}</label>
          <input
            id="name"
            name="name"
            defaultValue={
              typeof state.fields?.name === "string"
                ? state.fields.name
                : user?.name
            }
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {state.fieldErrors?.name && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">{t("emailLabel")}</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={
              typeof state.fields?.email === "string"
                ? state.fields.email
                : user?.email
            }
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {state.fieldErrors?.email && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">{t("passwordLabel")}</label>
          <input
            id="password"
            name="password"
            type="password"
            required={!isEdit}
            placeholder={isEdit ? "••••••••" : ""}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {isEdit && (
            <p className="mt-1 text-xs text-muted-foreground">{t("passwordHint")}</p>
          )}
          {state.fieldErrors?.password && <p className="mt-1 text-xs text-destructive">{state.fieldErrors.password}</p>}
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium">{t("roleLabel")}</label>
          <select
            id="role"
            name="role"
            defaultValue={
              typeof state.fields?.role === "string"
                ? state.fields.role
                : user?.role || "STAFF"
            }
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="STAFF">{t("roleStaff")}</option>
            <option value="ADMIN">{t("roleAdmin")}</option>
          </select>
        </div>

        <div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={
                typeof state.fields?.isActive === "boolean"
                  ? state.fields.isActive
                  : user?.isActive ?? true
              }
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm font-medium">{t("activeLabel")}</span>
          </label>
        </div>

        {state.error && (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Link
            href="/admin/users"
            className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {t("cancel")}
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? t("saveChanges") : t("createUser")}
          </button>
        </div>
      </form>
    </div>
  );
}