export function newCommissionEmail(params: {
  publicId: string;
  clientName: string;
  clientEmail: string;
  summary: string;
  adminUrl: string;
}) {
  const { publicId, clientName, clientEmail, summary, adminUrl } = params;

  return {
    subject: `New commission request: ${publicId}`,
    html: `
      <h2>New Commission Request</h2>
      <p><b>Reference:</b> ${publicId}</p>
      <p><b>Client:</b> ${clientName} (${clientEmail})</p>
      <p><b>Summary:</b> ${summary}</p>
      <p><a href="${adminUrl}">View in admin</a></p>
    `,
  };
}
