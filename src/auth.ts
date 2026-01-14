// src/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";

function allowedEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedAdmin(email?: string | null) {
  if (!email) return false;
  return allowedEmails().includes(email.toLowerCase());
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  // IMPORTANT for production:
  // NextAuth v4 reads NEXTAUTH_SECRET by default.
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  providers: [
    // Enable Google only if env vars exist (so you can defer it safely)
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),

    // Email magic link, but we send via Resend (no SMTP needed)
    EmailProvider({
      from: process.env.EMAIL_FROM,
      maxAge: 60 * 30, // 30 minutes

      async sendVerificationRequest({ identifier, url }) {
        // identifier is the email
        if (!isAllowedAdmin(identifier)) {
          // Fail closed silently (don’t leak allowlist membership)
          return;
        }

        if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
        if (!process.env.EMAIL_FROM) throw new Error("Missing EMAIL_FROM");

        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: [identifier],
          subject: "Sign in to Vibrant Art Group Admin",
          html: `
            <div style="font-family: ui-sans-serif, system-ui; line-height:1.5">
              <p>Click the link below to sign in:</p>
              <p><a href="${url}">Sign in</a></p>
              <p style="color:#666;font-size:12px;margin-top:24px">
                If you did not request this email, you can ignore it.
              </p>
            </div>
          `,
        });
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      return isAllowedAdmin(user.email);
    },
    async session({ session }) {
      // convenience flag
      (session as any).isAdmin = isAllowedAdmin(session.user?.email);
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
};
