import { getArtists } from "@/lib/db/queries";
import { getCommissionPrefillFromGallerySlug } from "@/lib/commission/prefill";
import CommissionWizard from "@/components/commission/CommissionWizard";

export const dynamic = "force-dynamic";

export default async function CommissionPage({
  searchParams,
}: {
  searchParams: { prefill?: string } | Promise<{ prefill?: string }>;
}) {
  const sp = await Promise.resolve(searchParams);
  const prefillSlug = sp.prefill?.trim();

  const [artists, prefill] = await Promise.all([
    getArtists(),
    prefillSlug ? getCommissionPrefillFromGallerySlug(prefillSlug) : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-semibold">Commission Request</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Share your idea and we’ll confirm details before any payment is requested.
      </p>

      <div className="mt-8">
        <CommissionWizard artists={artists} prefill={prefill} />
      </div>
    </main>
  );
}
