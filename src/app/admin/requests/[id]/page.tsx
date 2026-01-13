// src/app/admin/requests/[id]/page.tsx
import { db } from "@/lib/db";
import { commissionRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getArtists } from "@/lib/db/queries";
import ActivityTimeline from "./ActivityTimeline";
import AdminRequestControls from "@/components/admin/AdminRequestControls";

export const dynamic = "force-dynamic";

function safeParseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default async function AdminRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [rows, artists] = await Promise.all([
    db
      .select()
      .from(commissionRequests)
      .where(eq(commissionRequests.id, id))
      .limit(1),
    getArtists(),
  ]);

  const req = rows[0];
  if (!req) return notFound();

  const formObj = safeParseJson(req.formJson, {});
  const pricingObj = safeParseJson(req.pricingJson, {});

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{req.publicId}</h1>
          <div className="mt-2 text-sm text-muted-foreground">
            {req.clientName} • {req.clientEmail} • {req.status}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT: timeline + request JSON */}
        <section className="space-y-6">
          <ActivityTimeline requestId={req.id} />

          <div>
            <h2 className="text-lg font-semibold">Form</h2>
            <pre className="mt-2 overflow-auto rounded-xl border bg-muted p-4 text-xs">
              {JSON.stringify(formObj, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Estimate</h2>
            <pre className="mt-2 overflow-auto rounded-xl border bg-muted p-4 text-xs">
              {JSON.stringify(pricingObj, null, 2)}
            </pre>
          </div>
        </section>

        {/* RIGHT: admin controls */}
        <aside className="space-y-6">
          <AdminRequestControls
            requestId={req.id}
            initialStatus={req.status}
            initialAssignedArtistId={req.assignedArtistId}
            initialAdminNotes={req.adminNotes ?? ""}
            artists={artists.map((a) => ({ id: a.id, displayName: a.displayName }))}
          />
        </aside>
      </div>
    </main>
  );
}
