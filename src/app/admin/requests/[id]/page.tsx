import { db } from "@/lib/db";
import { commissionRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getArtists } from "@/lib/db/queries";
import ActivityTimeline from "./ActivityTimeline";
import AdminRequestControls from "@/components/admin/AdminRequestControls";

export const dynamic = "force-dynamic";

export default async function AdminRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [rows, artists] = await Promise.all([
    db.select().from(commissionRequests).where(eq(commissionRequests.id, id)).limit(1),
    getArtists(),
  ]);

  const req = rows[0];
  if (!req) return notFound();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-semibold">{req.publicId}</h1>
      <div className="mt-2 text-sm text-muted-foreground">
        {req.clientName} • {req.clientEmail} • {req.status}
      </div>
<ActivityTimeline requestId={id} />
      <div className="mt-6">
        <AdminRequestControls
          requestId={req.id}
          initialStatus={req.status}
          initialAssignedArtistId={req.assignedArtistId}
          initialAdminNotes={req.adminNotes ?? ""}
          artists={artists.map((a) => ({ id: a.id, displayName: a.displayName }))}
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Form</h2>
      <pre className="mt-2 overflow-auto rounded-xl border bg-muted p-4 text-xs">
        {JSON.stringify(JSON.parse(req.formJson ?? "{}"), null, 2)}
      </pre>

      <h2 className="mt-8 text-lg font-semibold">Estimate</h2>
      <pre className="mt-2 overflow-auto rounded-xl border bg-muted p-4 text-xs">
        {JSON.stringify(JSON.parse(req.pricingJson ?? "{}"), null, 2)}
      </pre>
    </main>
  );
}
