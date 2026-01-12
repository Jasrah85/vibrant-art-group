import { getGalleryItems } from "@/lib/db/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-semibold">Gallery</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Browse featured work and commission examples.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((g) => (
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
            <div className="mt-2 text-xs text-muted-foreground">
              {g.status === "available" ? "Available for purchase" : g.status === "sold" ? "Sold" : "Commission example"}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
