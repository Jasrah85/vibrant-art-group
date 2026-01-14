// src/app/auth/signin/page.tsx
import { Suspense } from "react";
import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <Suspense fallback={null}>
      <SignInClient hasGoogle={hasGoogle} />
    </Suspense>
  );
}
