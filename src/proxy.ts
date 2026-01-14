// src/proxy.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

function allowedEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedAdmin(email: string | null | undefined) {
  if (!email) return false;
  return allowedEmails().includes(email.toLowerCase());
}

export default auth((req) => {
  const url = req.nextUrl;
  const pathname = url.pathname;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminRoute) return NextResponse.next();

  const email = req.auth?.user?.email ?? null;

  if (!req.auth || !isAllowedAdmin(email)) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/auth/signin";
    redirectUrl.searchParams.set("callbackUrl", url.toString());
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
