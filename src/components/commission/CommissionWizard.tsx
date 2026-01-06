"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { calculateEstimate } from "@/lib/pricing/calc";
import { formatRangeUsd, formatUsd } from "@/lib/pricing/display";

type ArtistRow = {
  id: string;
  slug: string;
  displayName: string;
  availabilityStatus: string;
  acceptsRush: boolean;
  bioShort: string;
};

const FormSchema = z.object({
  requestedArtistId: z.string().optional(),

  medium: z.string().min(1),
  sizeTier: z.string().min(1),
  detailLevel: z.string().min(1),
  backgroundLevel: z.string().min(1),

  // REQUIRED boolean with default
  rush: z.boolean().default(false),

  // REQUIRED strings with defaults
  subject: z.string().default(""),
  notes: z.string().default(""),

  clientName: z.string().min(1, "Name is required"),
  clientEmail: z.string().email("Valid email required"),
});


type FormValues = z.infer<typeof FormSchema>;

export default function CommissionWizard({
  artists,
  prefill,
}: {
  artists: ArtistRow[];
  prefill: null | {
    medium?: string;
    sizeTier?: string;
    detailLevel?: string;
    backgroundLevel?: string;
    suggestedArtistId?: string;
    notes?: string;
  };
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        requestedArtistId: prefill?.suggestedArtistId ?? "",
        medium: prefill?.medium ?? "colored_pencil",
        sizeTier: prefill?.sizeTier ?? "S",
        detailLevel: prefill?.detailLevel ?? "DETAILED",
        backgroundLevel: prefill?.backgroundLevel ?? "NONE",
        rush: false,
        subject: "",
        notes: prefill?.notes ?? "",
        clientName: "",
        clientEmail: "",
    },
    mode: "onBlur",
    });

  const values = form.watch();

  const estimate = useMemo(() => {
    try {
      return calculateEstimate({
        medium: values.medium as any,
        sizeTier: values.sizeTier as any,
        detailLevel: values.detailLevel as any,
        backgroundLevel: values.backgroundLevel as any,
        rush: values.rush,
      });
    } catch {
      return null;
    }
  }, [values.medium, values.sizeTier, values.detailLevel, values.backgroundLevel, values.rush]);

  const selectedArtist = useMemo(() => {
    if (!values.requestedArtistId) return null;
    return artists.find((a) => a.id === values.requestedArtistId) ?? null;
  }, [artists, values.requestedArtistId]);

  async function onSubmit(v: FormValues) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          requestedArtistId: v.requestedArtistId || null,
          isCommunitySupported: false,
          files: [], // uploads later
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json?.error ?? "Submission failed");
        setSubmitting(false);
        return;
      }

      router.push(`/commission/success?ref=${encodeURIComponent(json.publicId)}`);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const StepNav = (
    <div className="flex items-center gap-2 text-sm">
      <div className={`rounded-full px-3 py-1 ${step === 1 ? "bg-black text-white" : "border"}`}>1. Options</div>
      <div className={`rounded-full px-3 py-1 ${step === 2 ? "bg-black text-white" : "border"}`}>2. Details</div>
      <div className={`rounded-full px-3 py-1 ${step === 3 ? "bg-black text-white" : "border"}`}>3. Contact</div>
      <div className={`rounded-full px-3 py-1 ${step === 4 ? "bg-black text-white" : "border"}`}>4. Review</div>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="rounded-2xl border p-5">
        {StepNav}

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
          {step === 1 && (
            <section className="space-y-4">
              <div>
                <label className="text-sm font-medium">Preferred artist (optional)</label>
                <select
                  className="mt-1 w-full rounded-lg border p-2"
                  {...form.register("requestedArtistId")}
                >
                  <option value="">Match me to the best fit</option>
                  {artists.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.displayName} ({a.availabilityStatus})
                    </option>
                  ))}
                </select>

                {selectedArtist ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {selectedArtist.bioShort}
                    {selectedArtist.acceptsRush ? " • Rush may be available" : ""}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Medium</label>
                  <select className="mt-1 w-full rounded-lg border p-2" {...form.register("medium")}>
                    <option value="colored_pencil">Colored pencil</option>
                    <option value="graphite">Graphite</option>
                    <option value="charcoal">Charcoal</option>
                    <option value="watercolor">Watercolor</option>
                    <option value="acrylic">Acrylic</option>
                    <option value="clay_small">Clay sculpture (small)</option>
                    <option value="wood_small">Woodworking (small)</option>
                    <option value="metal_small">Metalworking (small)</option>
                    <option value="3d_print_existing">3D print (existing design)</option>
                    <option value="3d_design_print">3D design + print</option>
                    <option value="sublimation_design">Sublimation-ready design</option>
                    <option value="sublimation_printed_sheet">Sublimation printed sheet</option>
                    <option value="heat_transfer_finished_item">Heat-transfer finished item (limited)</option>
                    <option value="mural">Mural (review required)</option>
                    <option value="custom_shoes_clothing">Custom shoes/clothing (review required)</option>
                    <option value="mailbox_paint">Mailbox painting (review required)</option>
                    <option value="bottle_art">Bottle art (review required)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Size</label>
                  <select className="mt-1 w-full rounded-lg border p-2" {...form.register("sizeTier")}>
                    <option value="XS">XS (keepsake)</option>
                    <option value="S">S (8×10 / 8.5×11)</option>
                    <option value="M">M (11×14 / 12×16)</option>
                    <option value="L">L (16×20 / 18×24)</option>
                    <option value="XL">XL (24×36 / ~2×3 ft)</option>
                    <option value="XXL">XXL (2×4 ft+ — review)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Detail level</label>
                  <select className="mt-1 w-full rounded-lg border p-2" {...form.register("detailLevel")}>
                    <option value="MINIMAL">Minimal</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="DETAILED">Detailed</option>
                    <option value="HIGH">Highly detailed</option>
                    <option value="PHOTO">Photorealistic / intricate</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Background</label>
                  <select className="mt-1 w-full rounded-lg border p-2" {...form.register("backgroundLevel")}>
                    <option value="NONE">None / flat</option>
                    <option value="ABSTRACT">Abstract / textural</option>
                    <option value="SIMPLE">Simple context</option>
                    <option value="FULL">Full environment</option>
                    <option value="COMPLEX">Complex scene</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("rush")} />
                Time-sensitive (rush may apply or may be declined)
              </label>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject / what you want</label>
                <input className="mt-1 w-full rounded-lg border p-2" {...form.register("subject")} placeholder="Example: portrait of my dog, fantasy landscape, memorial piece..." />
              </div>

              <div>
                <label className="text-sm font-medium">Notes & specifics</label>
                <textarea
                  className="mt-1 w-full rounded-lg border p-2"
                  rows={7}
                  {...form.register("notes")}
                  placeholder="Include any important details: style, colors, pose, text to include, story behind it, reference notes, etc."
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  Uploads come next (we’ll add secure file upload after the core flow is stable).
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Your name</label>
                  <input className="mt-1 w-full rounded-lg border p-2" {...form.register("clientName")} />
                  {form.formState.errors.clientName ? (
                    <div className="mt-1 text-xs text-red-600">{form.formState.errors.clientName.message}</div>
                  ) : null}
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input className="mt-1 w-full rounded-lg border p-2" {...form.register("clientEmail")} />
                  {form.formState.errors.clientEmail ? (
                    <div className="mt-1 text-xs text-red-600">{form.formState.errors.clientEmail.message}</div>
                  ) : null}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Submitting this request does not commit you to a purchase. The artist will confirm details and a final quote before any payment is requested.
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4">
              <div className="rounded-xl border p-4 text-sm">
                <div className="font-medium">Review</div>
                <div className="mt-2 grid gap-1 text-muted-foreground">
                  <div><span className="text-foreground">Medium:</span> {values.medium}</div>
                  <div><span className="text-foreground">Size:</span> {values.sizeTier}</div>
                  <div><span className="text-foreground">Detail:</span> {values.detailLevel}</div>
                  <div><span className="text-foreground">Background:</span> {values.backgroundLevel}</div>
                  <div><span className="text-foreground">Rush:</span> {values.rush ? "Yes" : "No"}</div>
                  <div><span className="text-foreground">Artist:</span> {selectedArtist ? selectedArtist.displayName : "Match me to best fit"}</div>
                </div>
              </div>

              {submitError ? (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </div>
              ) : null}
            </section>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || submitting}
            >
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                className="rounded-lg bg-black px-4 py-2 text-white"
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                disabled={submitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit request"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Pricing Preview Sidebar */}
      <aside className="rounded-2xl border p-5">
        <div className="text-sm font-medium">Estimated Cost</div>

        {!estimate ? (
          <div className="mt-3 text-sm text-muted-foreground">Select options to see an estimate.</div>
        ) : estimate.reviewRequired ? (
          <div className="mt-3 text-sm text-muted-foreground">
            This request requires artist review for pricing (size/medium).
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="text-2xl font-semibold">
              {formatRangeUsd(estimate.low, estimate.high)}
            </div>
            <div className="text-sm text-muted-foreground">
              Estimated deposit after approval:{" "}
              <span className="text-foreground">
                {formatRangeUsd(estimate.depositLow, estimate.depositHigh)}
              </span>{" "}
              ({Math.round(estimate.depositPct * 100)}%)
            </div>
            <div className="text-xs text-muted-foreground">
              Estimates are based on typical scope and may be adjusted after the artist reviews the request.
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
          Payment is requested only after the artist confirms details and provides a final quote.
        </div>
      </aside>
    </div>
  );
}
