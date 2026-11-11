import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { Package, ShoppingCart, Settings, LogOut } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("AdminLayout");

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Admin Sidebar - No forced full height, hugs the content */}
      <aside className="sticky top-0 hidden h-fit min-h-screen w-64 flex-col border-e border-border bg-card md:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
          <span className="text-lg font-bold text-foreground">{t("brand")}</span>
        </div>
        
        {/* Navigation - Removed flex-1 so it doesn't push the logout button down */}
        <nav className="space-y-1 p-4">
          <Link href="/admin/orders" className="flex items-center gap-3 rounded-lg bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
            <ShoppingCart className="h-4 w-4" /> {t("orders")}
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
            <Package className="h-4 w-4" /> {t("products")}
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
            <Settings className="h-4 w-4" /> {t("settings")}
          </Link>
        </nav>

        {/* Logout Button - Now sits right below the links */}
        <div className="mt-4 border-t border-border p-4">
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