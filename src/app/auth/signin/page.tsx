"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/admin/requests";
  const [email, setEmail] = useState("");
  const hasGoogle = true; // UI hint; Google button will still work only if env vars exist.

  return (
    <main className="mx-auto max-w-lg p-6">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-muted text-sm">
          Access is restricted to allowlisted emails.
        </p>

        <div className="mt-6 space-y-4">
          {hasGoogle ? (
            <button
              className="btn btn-secondary w-full"
              onClick={() => signIn("google", { callbackUrl })}
            >
              Continue with Google
            </button>
          ) : null}

          <div className="rounded-2xl border border-[var(--border)] p-4">
            <div className="text-sm font-semibold">Email magic link</div>
            <p className="mt-1 text-xs text-muted">
              Works with iCloud, Gmail, etc.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <button
                className="btn btn-primary sm:whitespace-nowrap"
                disabled={!email}
                onClick={() =>
                  // provider id is "resend" for the Resend provider
                  signIn("resend", { email, callbackUrl, redirect: true })
                }
              >
                Send link
              </button>
            </div>
          </div>

          <p className="text-xs text-muted">
            If you don’t receive the email within a minute, check spam/junk.
          </p>
        </div>
      </div>
    </main>
  );
}
