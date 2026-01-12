import { getGalleryItemBySlug } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Params = { slug?: string };

// NOTE: params can be a plain object or a Promise in some Next setups.
// This makes it work either way.
export default async function GalleryItemPage({
  params,
}: {
  params: Params | Promise<Params>;
}) {
  const resolved = await Promise.resolve(params);
  const slug = resolved.slug?.trim();

  if (!slug) return notFound();

  const item = await getGalleryItemBySlug(slug);
  if (!item) return notFound();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-semibold">{item.title}</h1>

      <div className="mt-2 text-sm text-muted-foreground">
        {item.medium} • {item.sizeTier}
        {item.dimensions ? ` • ${item.dimensions}` : ""}
      </div>

      <div className="mt-6 flex gap-3">
        <Link href={`/commission/from/${item.slug}`} className="btn btn-primary">
          Request something similar
        </Link>
        <Link href="/commission" className="btn btn-secondary">
          Start a custom commission
        </Link>
      </div>
    </main>
  );
}
