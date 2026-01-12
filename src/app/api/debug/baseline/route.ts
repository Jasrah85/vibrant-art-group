import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST() {
  // ⚠️ DEV ONLY. Delete this route after baseline.
  // This resets drizzle migration tracking so drizzle won't re-run initial create-table migrations.

  // Ensure the migrations table exists
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  // Clear it
  await db.run(sql`DELETE FROM __drizzle_migrations;`);

  return NextResponse.json({ ok: true });
}
