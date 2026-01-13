// app/api/admin/requests/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { commissionRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  isMeaningfulNotesUpdate,
  logCommissionEvent,
  summarizeAssignmentChange,
  summarizeStatusChange,
} from "@/lib/commission/events";

const PatchSchema = z.object({
  status: z.string().min(1),
  assignedArtistId: z.string().nullable(),
  adminNotes: z.string().optional().default(""),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // <-- important
) {
  const { id: requestId } = await ctx.params; // <-- important

  if (!requestId) {
    return NextResponse.json({ error: "Missing request id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const next = parsed.data;

  // Load current state
  const existing = await db
    .select({
      id: commissionRequests.id,
      status: commissionRequests.status,
      assignedArtistId: commissionRequests.assignedArtistId,
      adminNotes: commissionRequests.adminNotes,
    })
    .from(commissionRequests)
    .where(eq(commissionRequests.id, requestId))
    .limit(1);

  const current = existing[0];
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Perform update (timestamp_ms expects Date)
  await db
    .update(commissionRequests)
    .set({
      status: next.status,
      assignedArtistId: next.assignedArtistId ?? null,
      adminNotes: next.adminNotes ?? "",
      updatedAt: new Date(),
    })
    .where(eq(commissionRequests.id, requestId));

  // Event logging (best effort)
  try {
    if (current.status !== next.status) {
      await logCommissionEvent({
        requestId,
        type: "status_changed",
        actor: "admin",
        summary: summarizeStatusChange(current.status, next.status),
        data: { from: current.status, to: next.status },
      });
    }

    if (current.assignedArtistId !== (next.assignedArtistId ?? null)) {
      const summary = summarizeAssignmentChange(
        current.assignedArtistId,
        next.assignedArtistId ?? null
      );
      if (summary) {
        await logCommissionEvent({
          requestId,
          type: "assignment_changed",
          actor: "admin",
          summary,
          data: { from: current.assignedArtistId, to: next.assignedArtistId ?? null },
        });
      }
    }

    if (isMeaningfulNotesUpdate(current.adminNotes ?? "", next.adminNotes ?? "")) {
  const prev = (current.adminNotes ?? "").trim();
  const nxt = (next.adminNotes ?? "").trim();

  await logCommissionEvent({
    requestId,
    type: "admin_notes_updated",
    actor: "admin",
    summary: "Internal notes updated",
    data: {
      previousLength: prev.length,
      nextLength: nxt.length,
      previousPreview: prev.slice(0, 160),
      nextPreview: nxt.slice(0, 160),
    },
  });
}

  } catch {
    // swallow event errors
  }

  return NextResponse.json({ ok: true });
}
