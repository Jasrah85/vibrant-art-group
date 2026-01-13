// app/admin/requests/[id]/ActivityTimeline.tsx
import { db } from "@/lib/db";
import { commissionEvents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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

export default async function ActivityTimeline(props: { requestId: string }) {
  const events = await db
    .select()
    .from(commissionEvents)
    .where(eq(commissionEvents.requestId, props.requestId))
    .orderBy(desc(commissionEvents.createdAt))
    .limit(200);

  return (
    <section className="rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Activity</h2>
        <div className="text-xs text-muted-foreground">
          {events.length} event{events.length === 1 ? "" : "s"}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="mt-4 text-sm text-muted-foreground">
          No activity recorded yet.
        </div>
      ) : (
        <ol className="mt-4 space-y-3">
          {events.map((e) => (
            <li key={e.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                    {badgeFor(e.actor)}
                  </span>
                  <div className="text-sm font-medium">{e.summary}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatWhen(e.createdAt)}
                </div>
              </div>

              {/* Optional: show details for debugging / richer admin insight */}
              {e.dataJson ? (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    Details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded-lg border bg-muted/30 p-3 text-xs">
                    {JSON.stringify(JSON.parse(e.dataJson), null, 2)}
                  </pre>
                </details>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
