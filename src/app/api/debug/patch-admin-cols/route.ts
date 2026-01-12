import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST() {
  const results: Record<string, any> = {};

  // ⚠️ DEV ONLY. Delete after running once.

  try {
    await db.run(sql`
      ALTER TABLE commission_requests
      ADD COLUMN admin_notes TEXT NOT NULL DEFAULT '';
    `);
    results.admin_notes = "added";
  } catch (e: any) {
    results.admin_notes = { skipped_or_failed: e?.message ?? String(e) };
  }

  try {
    // Use a plain integer default first (most compatible), then backfill + enforce in app.
    await db.run(sql`
      ALTER TABLE commission_requests
      ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;
    `);
    results.updated_at = "added";
  } catch (e: any) {
    results.updated_at = { skipped_or_failed: e?.message ?? String(e) };
  }

  // Backfill updated_at for existing rows
  try {
    await db.run(sql`
      UPDATE commission_requests
      SET updated_at = CAST(unixepoch() * 1000 AS INTEGER)
      WHERE updated_at = 0;
    `);
    results.updated_at_backfill = "done";
  } catch (e: any) {
    results.updated_at_backfill = { failed: e?.message ?? String(e) };
  }

  return NextResponse.json({ ok: true, results });
}
