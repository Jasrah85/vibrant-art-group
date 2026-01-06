import { redirect } from "next/navigation";

export default async function CommissionFromGallery({
  params,
}: {
  params: Promise<{ gallerySlug: string }>;
}) {
  const { gallerySlug } = await params;
  const slug = gallerySlug?.trim();

  if (!slug) redirect("/commission");

  redirect(`/commission?prefill=${encodeURIComponent(slug)}`);
}
