import { getArtists } from "@/lib/db/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-semibold">Artists</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Meet the artists in Vibrant Art Group.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {artists.map((a) => (
          <Link
            key={a.id}
            href={`/artists/${a.slug}`}
            className="rounded-xl border p-4 hover:bg-muted/40"
          >
            <div className="text-lg font-medium">{a.displayName}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {a.bioShort || "—"}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Status: {a.availabilityStatus}
              {a.acceptsRush ? " • Rush available" : ""}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
