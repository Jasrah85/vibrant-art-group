"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ArtistRow = {
  id: string;
  displayName: string;
};

const STATUSES = [
  { value: "new", label: "New" },
  { value: "needs_clarification", label: "Needs clarification" },
  { value: "approved_quote", label: "Approved quote" },
  { value: "deposit_requested", label: "Deposit requested" },
  { value: "in_progress", label: "In progress" },
  { value: "ready_for_final", label: "Ready for final payment" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
] as const;

type EmailTemplateKey = "clarification" | "quote" | "deposit";

export default function AdminRequestControls(props: {
  requestId: string;
  initialStatus: string;
  initialAssignedArtistId: string | null;
  initialAdminNotes: string;
  artists: ArtistRow[];
}) {
  const router = useRouter();

  const [status, setStatus] = useState(props.initialStatus);
  const [assignedArtistId, setAssignedArtistId] = useState<string>(
    props.initialAssignedArtistId ?? ""
  );
  const [adminNotes, setAdminNotes] = useState(props.initialAdminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email client UI state
  const [emailOpen, setEmailOpen] = useState<EmailTemplateKey | null>(null);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`/api/admin/requests/${props.requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          assignedArtistId: assignedArtistId ? assignedArtistId : null,
          adminNotes,
        }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setError(json?.error ?? `Failed to save (${res.status})`);
        return;
      }

      if (json?.ok !== true) {
        setError(json?.error ?? "Failed to save");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 1200);

      // Refresh to show latest events in ActivityTimeline
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function templateLabel(t: EmailTemplateKey) {
    if (t === "clarification") return "Request clarification";
    if (t === "quote") return "Send quote";
    return "Deposit request";
  }

  function defaultMessageFor(t: EmailTemplateKey) {
    if (t === "clarification") {
      return (
        "Thanks for your request! I have a quick question before we can quote it:\n\n" +
        "- \n\n" +
        "Once I have that, I’ll send pricing + timeline."
      );
    }
    if (t === "quote") {
      return (
        "Here’s your quote and timeline:\n\n" +
        "- Quote: \n" +
        "- Estimated turnaround: \n\n" +
        "If you’d like to proceed, reply here and we’ll send the deposit details."
      );
    }
    return (
      "To begin work, we request a deposit:\n\n" +
      "- Deposit amount: \n\n" +
      "Once received, we’ll schedule the work and confirm milestones."
    );
  }

  async function sendClientEmail(template: EmailTemplateKey) {
    setEmailSending(true);
    setEmailError(null);

    try {
      const res = await fetch(`/api/admin/requests/${props.requestId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          message: emailMessage,
          // Optional later:
          // quoteCents: ...
          // depositCents: ...
        }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setEmailError(json?.error ?? `Failed to send (${res.status})`);
        return;
      }

      if (json?.ok !== true) {
        setEmailError(json?.error ?? "Failed to send");
        return;
      }

      setEmailOpen(null);
      setEmailMessage("");
      router.refresh(); // so ActivityTimeline shows the new email event
    } catch (e: any) {
      setEmailError(e?.message ?? "Failed to send");
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <section className="rounded-2xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Workflow</h2>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn btn-primary disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            className="mt-1 w-full rounded-lg border p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Assigned artist</label>
          <select
            className="mt-1 w-full rounded-lg border p-2"
            value={assignedArtistId}
            onChange={(e) => setAssignedArtistId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {props.artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium">Internal notes (admin only)</label>
        <textarea
          className="mt-1 w-full rounded-lg border p-2"
          rows={6}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Notes for the team: clarifications needed, quote breakdown, deadlines, client vibe, etc."
        />
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Email client panel */}
      <div className="mt-6 rounded-2xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Email client</h3>
          <span className="text-xs text-muted-foreground">
            Logs to Activity
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
            disabled={saving || emailSending}
            onClick={() => {
              setEmailError(null);
              setEmailOpen("clarification");
              setEmailMessage(defaultMessageFor("clarification"));
            }}
          >
            Request clarification
          </button>

          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
            disabled={saving || emailSending}
            onClick={() => {
              setEmailError(null);
              setEmailOpen("quote");
              setEmailMessage(defaultMessageFor("quote"));
            }}
          >
            Send quote
          </button>

          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
            disabled={saving || emailSending}
            onClick={() => {
              setEmailError(null);
              setEmailOpen("deposit");
              setEmailMessage(defaultMessageFor("deposit"));
            }}
          >
            Deposit request
          </button>
        </div>

        {emailOpen ? (
          <div className="mt-4 space-y-3">
            <div className="text-xs text-muted-foreground">
              Template: <span className="font-medium">{templateLabel(emailOpen)}</span>
            </div>

            <textarea
              className="min-h-[140px] w-full rounded-xl border bg-background p-3 text-sm"
              placeholder="Write a message to the client..."
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
            />

            {emailError ? (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {emailError}
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl bg-foreground px-3 py-2 text-sm text-background disabled:opacity-50"
                disabled={emailSending || emailMessage.trim().length === 0}
                onClick={() => sendClientEmail(emailOpen)}
              >
                {emailSending ? "Sending..." : "Send"}
              </button>

              <button
                type="button"
                className="rounded-xl border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                disabled={emailSending}
                onClick={() => {
                  setEmailOpen(null);
                  setEmailError(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
