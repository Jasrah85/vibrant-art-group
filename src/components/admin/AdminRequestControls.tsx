"use client";

import { useState } from "react";

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

export default function AdminRequestControls(props: {
  requestId: string;
  initialStatus: string;
  initialAssignedArtistId: string | null;
  initialAdminNotes: string;
  artists: ArtistRow[];
}) {
  const [status, setStatus] = useState(props.initialStatus);
  const [assignedArtistId, setAssignedArtistId] = useState<string>(props.initialAssignedArtistId ?? "");
  const [adminNotes, setAdminNotes] = useState(props.initialAdminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (e: any) {
      setError(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
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
    </section>
  );
}
