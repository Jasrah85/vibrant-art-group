import Link from "next/link";

export default async function CommissionSuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string } | Promise<{ ref?: string }>;
}) {
  const sp = await Promise.resolve(searchParams);
  const ref = sp.ref ?? "—";

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold">Request received</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thanks — we’ve received your commission request.
      </p>

      <div className="mt-6 rounded-xl border p-4">
        <div className="text-sm text-muted-foreground">Reference ID</div>
        <div className="mt-1 text-xl font-semibold">{ref}</div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/gallery" className="btn btn-secondary">
          Back to gallery
        </Link>
        <Link href="/commission" className="btn btn-primary">
          Submit another request
        </Link>
      </div>
    </main>
  );
}
