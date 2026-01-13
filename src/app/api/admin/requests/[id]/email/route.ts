// src/app/api/admin/requests/[id]/email/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { commissionRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { resend } from "@/lib/email/resend";
import { buildClientEmail } from "@/lib/email/clientTemplates";
import { logCommissionEvent } from "@/lib/commission/events";

const BodySchema = z.object({
  template: z.enum(["clarification", "quote", "deposit"]),
  message: z.string().min(1),

  // optional — you can wire inputs later
  quoteCents: z.number().int().positive().optional(),
  depositCents: z.number().int().positive().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: requestId } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { template, message, quoteCents, depositCents } = parsed.data;

  const rows = await db
    .select({
      id: commissionRequests.id,
      publicId: commissionRequests.publicId,
      clientName: commissionRequests.clientName,
      clientEmail: commissionRequests.clientEmail,
    })
    .from(commissionRequests)
    .where(eq(commissionRequests.id, requestId))
    .limit(1);

  const reqRow = rows[0];
  if (!reqRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tpl = buildClientEmail({
    template,
    publicId: reqRow.publicId,
    clientName: reqRow.clientName,
    message,
    quoteCents,
    depositCents,
  });

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [reqRow.clientEmail],
      subject: tpl.subject,
      html: tpl.html,
    });

    await logCommissionEvent({
      requestId,
      type: "email_sent",
      actor: "admin",
      summary: `Client email sent: ${template}`,
      data: {
        template,
        provider: "resend",
        to: reqRow.clientEmail,
        subject: tpl.subject,
        result,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await logCommissionEvent({
      requestId,
      type: "email_failed",
      actor: "admin",
      summary: `Client email failed: ${template}`,
      data: {
        template,
        provider: "resend",
        to: reqRow.clientEmail,
        subject: tpl.subject,
        message: err?.message ?? String(err),
      },
    });

    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
