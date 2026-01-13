// lib/commission/events.ts
import "server-only";

import { db } from "@/lib/db";
import { commissionEvents } from "@/lib/db/schema";

type Actor = "system" | "admin" | "client";

export async function logCommissionEvent(args: {
  requestId: string;
  type: string;
  actor: Actor;
  summary: string;
  data?: unknown;
  createdAtMs?: number; // optional ms epoch
}) {
  const id = crypto.randomUUID();
  const createdAt = args.createdAtMs ? new Date(args.createdAtMs) : new Date();

  await db.insert(commissionEvents).values({
    id,
    requestId: args.requestId,
    type: args.type,
    actor: args.actor,
    summary: args.summary,
    dataJson: args.data ? JSON.stringify(args.data) : null,
    createdAt,
  });

  return { id };
}

export function isMeaningfulNotesUpdate(prev: string, next: string) {
  return (prev ?? "").trim() !== (next ?? "").trim();
}

export function summarizeStatusChange(prev: string, next: string) {
  return `Status changed: ${prev} → ${next}`;
}

export function summarizeAssignmentChange(
  prevArtistId: string | null,
  nextArtistId: string | null
) {
  const prevLabel = prevArtistId ? "assigned" : "unassigned";
  const nextLabel = nextArtistId ? "assigned" : "unassigned";
  if (prevArtistId === nextArtistId) return null;
  return `Assignment changed: ${prevLabel} → ${nextLabel}`;
}
