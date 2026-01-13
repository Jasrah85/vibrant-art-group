// src/lib/email/clientTemplates.ts
export type ClientEmailTemplateKey = "clarification" | "quote" | "deposit";

export function buildClientEmail(args: {
  template: ClientEmailTemplateKey;
  publicId: string;
  clientName: string;
  message: string;
  quoteCents?: number;
  depositCents?: number;
}) {
  const greeting = `Hi ${args.clientName || "there"},`;

  const footer = `
    <p style="margin-top:24px;color:#666;font-size:12px">
      — Vibrant Art Group<br/>
      Reference: <strong>${escapeHtml(args.publicId)}</strong>
    </p>
  `;

  if (args.template === "clarification") {
    return {
      subject: `Quick question about your commission (${args.publicId})`,
      html: `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system; line-height:1.5">
          <p>${greeting}</p>
          <p>Thanks for your commission request! We have a quick clarification before we can quote it:</p>
          <p style="white-space:pre-wrap">${escapeHtml(args.message)}</p>
          ${footer}
        </div>
      `,
    };
  }

  if (args.template === "quote") {
    const dollars = args.quoteCents != null ? (args.quoteCents / 100).toFixed(2) : null;
    return {
      subject: `Quote for your commission (${args.publicId})`,
      html: `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system; line-height:1.5">
          <p>${greeting}</p>
          <p>Here’s your quote for the commission request <strong>${escapeHtml(args.publicId)}</strong>:</p>
          ${dollars ? `<p><strong>$${dollars}</strong></p>` : ""}
          <p style="white-space:pre-wrap">${escapeHtml(args.message)}</p>
          ${footer}
        </div>
      `,
    };
  }

  // deposit
  const dep = args.depositCents != null ? (args.depositCents / 100).toFixed(2) : null;
  return {
    subject: `Deposit request for your commission (${args.publicId})`,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system; line-height:1.5">
        <p>${greeting}</p>
        <p>To begin work on <strong>${escapeHtml(args.publicId)}</strong>, we request a deposit:</p>
        ${dep ? `<p><strong>$${dep}</strong></p>` : ""}
        <p style="white-space:pre-wrap">${escapeHtml(args.message)}</p>
        ${footer}
      </div>
    `,
  };
}

function escapeHtml(input: string) {
  return (input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
