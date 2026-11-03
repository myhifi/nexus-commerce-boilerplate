"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { storeConfig } from "@/shared/config/store.config";
import type { BusinessType } from "@/shared/config/store.config";
import { useCartStore } from "@/features/cart/store";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { cn } from "@/shared/lib/utils";

/* ----------------------------------------------------------------
 * SSR-safe client detection.
 * ---------------------------------------------------------------- */
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}

type NavLink = {
  href: string;
  labelKey: "shop" | "menu" | "reserve";
};

const RETAIL_LINKS: NavLink[] = [{ href: "/shop", labelKey: "shop" }];

const RESTAURANT_LINKS: NavLink[] = [
  { href: "/menu", labelKey: "menu" },
  { href: "/reserve", labelKey: "reserve" },
];

type NavbarProps = {
  businessType: BusinessType;
};

export function Navbar({ businessType }: NavbarProps) {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isClient = useIsClient();

  /* Zustand persist rehydrates from localStorage before the first paint.
     Defer the badge value until client-side to avoid hydration mismatch. */
  const itemCount = useCartStore((s) => s.getItemCount());
  const displayCount = isClient ? itemCount : 0;

  const links =
    businessType === "RESTAURANT" ? RESTAURANT_LINKS : RETAIL_LINKS;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav
        aria-label={t("primaryNavigation")}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Brand */}
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          {storeConfig.branding.name}
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden w-40 md:block">
            <LanguageSwitcher />
          </div>

          <Link
            href="/cart"
            aria-label={t("cartAriaLabel", { count: displayCount })}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {displayCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -inset-e-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground"
              >
                {displayCount > 99 ? "99+" : displayCount}
              </span>
            )}
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileOpen ? t("closeMenu") : t("openMenu")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <MenuIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-border bg-background md:hidden"
        >
          <ul className="space-y-1 px-4 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-muted text-accent"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <LanguageSwitcher />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}