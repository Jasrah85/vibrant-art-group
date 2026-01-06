import { db } from "@/lib/db";
import { artists, galleryItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getArtists() {
  return db
    .select()
    .from(artists)
    .where(eq(artists.isActive, true))
    .orderBy(artists.displayName);
}

export async function getArtistBySlug(slug: string) {
  const clean = slug?.trim();
  if (!clean) return null;

  const rows = await db
    .select()
    .from(artists)
    .where(eq(artists.slug, clean))
    .limit(1);

  return rows[0] ?? null;
}

export async function getGalleryItems() {
  return db
    .select()
    .from(galleryItems)
    .orderBy(desc(galleryItems.createdAt));
}

export async function getGalleryItemBySlug(slug: string) {
  const clean = slug?.trim();
  if (!clean) return null;

  const rows = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.slug, clean))
    .limit(1);

  return rows[0] ?? null;
}
