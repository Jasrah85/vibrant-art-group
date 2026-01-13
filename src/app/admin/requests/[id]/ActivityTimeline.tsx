// src/app/admin/requests/[id]/ActivityTimeline.tsx
import { db } from "@/lib/db";
import { artists, commissionEvents } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

function formatWhen(value: Date | number) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badgeFor(actor: string) {
  if (actor === "client") return "Client";
  if (actor === "admin") return "Admin";
  return "System";
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export default async function ActivityTimeline({ requestId }: { requestId: string }) {
  const events = await db
    .select()
    .from(commissionEvents)
    .where(eq(commissionEvents.requestId, requestId))
    .orderBy(desc(commissionEvents.createdAt))
    .limit(200);

  const artistIds = Array.from(
    new Set(
      events.flatMap((e) => {
        if (!e.dataJson) return [];
        const data = safeParseJson(e.dataJson);
        if (!data) return [];
        const ids: string[] = [];
        if (data?.from) ids.push(data.from);
        if (data?.to) ids.push(data.to);
        return ids.filter(Boolean);
      })
    )
  );

  const artistRows =
    artistIds.length > 0
      ? await db
          .select({ id: artists.id, name: artists.displayName })
          .from(artists)
          .where(inArray(artists.id, artistIds))
      : [];

  const artistNameById = new Map(artistRows.map((a) => [a.id, a.name]));

  return (
    <section className="rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Activity</h2>
        <div className="text-xs text-muted-foreground">
          {events.length} event{events.length === 1 ? "" : "s"}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="mt-4 text-sm text-muted-foreground">No activity recorded yet.</div>
      ) : (
        <ol className="mt-4 space-y-3">
          {events.map((e) => {
            const data = e.dataJson ? safeParseJson(e.dataJson) : null;

            const isAssignment = e.type === "assignment_changed" && data;
            const fromName =
              isAssignment && data?.from ? artistNameById.get(data.from) ?? data.from : null;
            const toName =
              isAssignment && data?.to ? artistNameById.get(data.to) ?? data.to : null;

            return (
              <li key={e.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                      {badgeFor(e.actor)}
                    </span>
                    <div className="text-sm font-medium">{e.summary}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatWhen(e.createdAt)}</div>
                </div>

                {/* ✅ Friendly assignment line */}
                {isAssignment ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {fromName ? `From: ${fromName}` : "From: Unassigned"} →{" "}
                    {toName ? `To: ${toName}` : "To: Unassigned"}
                  </div>
                ) : null}

                {/* Existing details block */}
                {e.dataJson ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-muted-foreground">Details</summary>
                    <pre className="mt-2 overflow-auto rounded-lg border bg-muted/30 p-3 text-xs">
                      {data ? JSON.stringify(data, null, 2) : e.dataJson}
                    </pre>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
