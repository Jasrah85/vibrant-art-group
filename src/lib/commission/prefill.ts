import { getGalleryItemBySlug } from "@/lib/db/queries";

export type CommissionPrefill = {
  medium?: string;
  sizeTier?: string;
  detailLevel?: string;
  backgroundLevel?: string;
  suggestedArtistId?: string;
  notes?: string;
};

export async function getCommissionPrefillFromGallerySlug(
  gallerySlug: string
): Promise<CommissionPrefill | null> {
  const slug = gallerySlug?.trim();
  if (!slug) return null;

  const item = await getGalleryItemBySlug(slug);
  if (!item) return null;

  const prefill = item.prefillJson ? safeJsonParse(item.prefillJson) : null;

  return {
    medium: (prefill?.preferredMedium as string) ?? item.medium,
    sizeTier: (prefill?.sizeTier as string) ?? item.sizeTier,
    detailLevel: (prefill?.detailLevel as string) ?? item.detailLevel,
    backgroundLevel: (prefill?.backgroundLevel as string) ?? item.backgroundLevel,
    suggestedArtistId: (prefill?.suggestedArtistId as string) ?? item.artistId,
    notes: (prefill?.notes as string) ?? `Inspired by: ${item.title}`,
  };
}

function safeJsonParse(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
