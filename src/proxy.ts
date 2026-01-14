// src/proxy.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthenticatedRequest = NextRequest & {
  auth?: {
    user?: {
      email?: string | null;
    };
  };
};

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

export default auth((req: NextRequest) => {
  const request = req as AuthenticatedRequest;

  const url = request.nextUrl;
  const pathname = url.pathname;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const email = request.auth?.user?.email ?? null;

  if (!request.auth || !isAllowedAdmin(email)) {
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
