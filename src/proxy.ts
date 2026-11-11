import createMiddleware from "next-intl/middleware";
import { routing } from "./shared/i18n/routing";
import NextAuth from "next-auth";
import { authConfig } from "./shared/lib/auth.config";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdminRoute = req.nextUrl.pathname.includes("/admin");
  const isLoginRoute = req.nextUrl.pathname.includes("/admin/login");

  // 1. Protection Logic: Block unauthenticated access to /admin
  if (isAdminRoute && !isLoginRoute && !isLoggedIn) {
    // Extract the locale from the URL (e.g., /en/admin -> en)
    const locale = req.nextUrl.pathname.split("/")[1] || "en";
    const loginUrl = new URL(`/${locale}/admin/login`, req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }

  // 2. If logged in and visiting login page, redirect to admin dashboard
  if (isLoginRoute && isLoggedIn) {
    const locale = req.nextUrl.pathname.split("/")[1] || "en";
    const dashboardUrl = new URL(`/${locale}/admin/orders`, req.nextUrl.origin);
    return Response.redirect(dashboardUrl);
  }

  // 3. Continue with next-intl routing for everything else
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/", "/(ar|en)/:path*"],
};