// src/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "@auth/core/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { db } from "@/lib/db";
import {
  authUsers,
  authAccounts,
  authSessions,
  authVerificationTokens,
} from "@/lib/db/schema";

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

const providers: any[] = [
  // Resend magic links (works with iCloud/Gmail/etc.)
  Resend({
    apiKey: process.env.RESEND_API_KEY!,
    from: process.env.EMAIL_FROM!,
  }),
];

// Add Google only if you set env vars (so local/dev won’t crash)
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
  }),

  providers,

  callbacks: {
    async signIn({ user }) {
      return isAllowedAdmin(user.email);
    },
    async session({ session }) {
      (session as any).isAdmin = isAllowedAdmin(session.user?.email);
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});
