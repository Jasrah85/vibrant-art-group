import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { commissionRequests } from "@/lib/db/schema";
import { calculateEstimate } from "@/lib/pricing/calc";
import { resend } from "@/lib/email/resend";
import { newCommissionEmail } from "@/lib/email/templates";

const CommissionPayload = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),

  requestedArtistId: z.string().optional().nullable(),
  isCommunitySupported: z.boolean().default(false),

  // pricing inputs
  medium: z.string(),
  sizeTier: z.string(),
  detailLevel: z.string(),
  backgroundLevel: z.string(),
  rush: z.boolean().optional().default(false),

  // freeform details
  subject: z.string().optional().default(""),
  notes: z.string().optional().default(""),

  // uploads later
  files: z.array(
    z.object({
      objectKey: z.string(),
      originalName: z.string(),
      contentType: z.string(),
      sizeBytes: z.number(),
    })
  ).optional().default([]),
});

function makePublicId(): string {
  return `VAG-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CommissionPayload.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // server-authoritative estimate
  const estimate = calculateEstimate({
    medium: data.medium as any,
    sizeTier: data.sizeTier as any,
    detailLevel: data.detailLevel as any,
    backgroundLevel: data.backgroundLevel as any,
    rush: data.rush,
  });

  const id = crypto.randomUUID();
  const publicId = makePublicId();

  const formJson = JSON.stringify({
    requestedArtistId: data.requestedArtistId,
    isCommunitySupported: data.isCommunitySupported,
    medium: data.medium,
    sizeTier: data.sizeTier,
    detailLevel: data.detailLevel,
    backgroundLevel: data.backgroundLevel,
    rush: data.rush,
    subject: data.subject,
    notes: data.notes,
  });

  const pricingJson = JSON.stringify(estimate);

  await db.insert(commissionRequests).values({
    id,
    publicId,
    status: "new",
    requestedArtistId: data.requestedArtistId ?? null,
    assignedArtistId: null,
    isCommunitySupported: data.isCommunitySupported,
    formJson,
    pricingJson,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
  });

  // email notify (best-effort)
  try {
    const adminUrl = `${process.env.APP_URL}/admin/requests/${id}`;
    const summary = `${data.medium}, ${data.sizeTier}, ${data.detailLevel}, bg:${data.backgroundLevel}${data.rush ? ", rush" : ""}`;

    const tpl = newCommissionEmail({
      publicId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      summary,
      adminUrl,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [process.env.ADMIN_NOTIFY_EMAIL!],
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch {
    // ignore email errors for now
  }

  return NextResponse.json({ ok: true, id, publicId, estimate });
}
