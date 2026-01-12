import Link from "next/link";
import { db } from "@/lib/db";
import { commissionRequests } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const rows = await db
    .select({
      id: commissionRequests.id,
      publicId: commissionRequests.publicId,
      status: commissionRequests.status,
      clientName: commissionRequests.clientName,
      clientEmail: commissionRequests.clientEmail,
      createdAt: commissionRequests.createdAt,
    })
    .from(commissionRequests)
    .orderBy(desc(commissionRequests.createdAt))
    .limit(50);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-semibold">Commission Requests</h1>

      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <Link
            key={r.id}
            href={`/admin/requests/${r.id}`}
            className="block card card-hover p-8 md:p-10"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{r.publicId}</div>
              <div className="text-xs text-muted-foreground">{r.status}</div>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {r.clientName} • {r.clientEmail}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
