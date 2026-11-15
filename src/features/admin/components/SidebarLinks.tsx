"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { ShoppingCart, Package, Layers, Users, Settings } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function SidebarLinks() {
  const t = useTranslations("AdminLayout");
  const pathname = usePathname();

  const links = [
    { href: "/admin/orders", label: t("orders"), icon: ShoppingCart },
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/categories", label: t("categories"), icon: Layers },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <nav className="space-y-1 p-4">
      {links.map((link) => {
        const Icon = link.icon;
        // Check if current path matches or is a sub-path (e.g., /admin/users/new)
        const isActive = pathname.startsWith(link.href);
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}