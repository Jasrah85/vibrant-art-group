import { getArtistBySlug, getGalleryItems } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Params = { slug?: string };

export default async function ArtistDetailPage({
  params,
}: {
  params: Params | Promise<Params>;
}) {
  const resolved = await Promise.resolve(params);
  const slug = resolved.slug?.trim();

  if (!slug) return notFound();

  const artist = await getArtistBySlug(slug);
  if (!artist) return notFound();

  const allGallery = await getGalleryItems();
  const theirWork = allGallery.filter((g) => g.artistId === artist.id);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-semibold">{artist.displayName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{artist.bioShort}</p>

      <h2 className="mt-10 text-xl font-semibold">Gallery</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {theirWork.map((g) => (
          <Link
            key={g.id}
            href={`/gallery/${g.slug}`}
            className="card card-hover p-8 md:p-10"
          >
            <div className="font-medium">{g.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {g.medium} • {g.sizeTier}
              {g.dimensions ? ` • ${g.dimensions}` : ""}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
