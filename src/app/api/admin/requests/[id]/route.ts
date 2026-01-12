import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { commissionRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const StatusEnum = z.enum([
  "new",
  "needs_clarification",
  "approved_quote",
  "deposit_requested",
  "in_progress",
  "ready_for_final",
  "completed",
  "declined",
]);

const PatchSchema = z.object({
  status: StatusEnum.optional(),
  assignedArtistId: z.string().nullable().optional(),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, assignedArtistId, adminNotes } = parsed.data;

    const update: any = {
      // safest for SQLite timestamp_ms integer columns:
      updatedAt: Date.now(),
    };
    if (status !== undefined) update.status = status;
    if (assignedArtistId !== undefined) update.assignedArtistId = assignedArtistId;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    await db
      .update(commissionRequests)
      .set(update)
      .where(eq(commissionRequests.id, id));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
