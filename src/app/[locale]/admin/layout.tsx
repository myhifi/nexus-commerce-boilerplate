import { getTranslations } from "next-intl/server";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import { SidebarLinks } from "@/features/admin/components/SidebarLinks";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("AdminLayout");

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Admin Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-e border-border bg-card md:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
          <span className="text-lg font-bold text-foreground">{t("brand")}</span>
        </div>
        
        {/* Dynamic Navigation */}
        <div className="flex-1 overflow-y-auto">
          <SidebarLinks />
        </div>

        {/* Logout Button */}
        <div className="shrink-0 border-t border-border p-4">
          <form action={logoutAction}>
            <button 
              type="submit" 
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> {t("signOut")}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}