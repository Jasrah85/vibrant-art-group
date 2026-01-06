import "dotenv/config";
import { db } from "../lib/db";
import { artists, galleryItems } from "../lib/db/schema";

function uuid() {
  return crypto.randomUUID();
}

function makePublicId() {
  // simple readable public id; good enough for seed
  return `VAG-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

async function main() {
  const auntId = uuid();

  await db.insert(artists).values({
    id: auntId,
    slug: "aunt-artist",
    displayName: "Your Aunt (Placeholder)",
    bioShort: "Photorealistic and fantasy illustration in multiple mediums.",
    availabilityStatus: "open",
    acceptsRush: true,
    communitySlotsEnabled: true,
    isActive: true,
  });

  await db.insert(galleryItems).values({
    id: uuid(),
    slug: "placeholder-piece-1",
    artistId: auntId,
    title: "Placeholder Piece",
    year: new Date().getFullYear(),
    medium: "colored_pencil",
    sizeTier: "S",
    dimensions: "8.5x11",
    detailLevel: "DETAILED",
    backgroundLevel: "NONE",
    status: "commission_example",
    priceCents: null,
    imageKey: "gallery/placeholders/placeholder1.jpg",
    prefillJson: JSON.stringify({
      preferredMedium: "colored_pencil",
      sizeTier: "S",
      detailLevel: "DETAILED",
      backgroundLevel: "NONE",
      suggestedArtistId: auntId,
      notes: "Inspired by this piece (placeholder).",
    }),
  });

  // Optional: create one fake commission request to test admin UI later
  // await db.insert(commissionRequests).values({ ... })

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
