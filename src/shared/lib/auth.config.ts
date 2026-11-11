import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/en/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.includes("/admin");
      const isOnLogin = nextUrl.pathname.includes("/admin/login");

      if (isOnAdmin && !isOnLogin) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;