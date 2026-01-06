import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const artists = sqliteTable("artists", {
  id: text("id").primaryKey(), // use crypto.randomUUID() in app code
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),

  bioShort: text("bio_short").notNull().default(""),
  bioLong: text("bio_long"), // optional

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  availabilityStatus: text("availability_status").notNull().default("open"), // open|limited|closed
  acceptsRush: integer("accepts_rush", { mode: "boolean" }).notNull().default(false),
  communitySlotsEnabled: integer("community_slots_enabled", { mode: "boolean" }).notNull().default(false),

  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
});

export const artistCapabilities = sqliteTable("artist_capabilities", {
  id: text("id").primaryKey(),
  artistId: text("artist_id").notNull(), // FK in app logic (SQLite doesn’t enforce by default)
  medium: text("medium").notNull(),      // e.g. "watercolor", "acrylic"
  maxSizeTier: text("max_size_tier").notNull().default("XL"), // XS|S|M|L|XL|XXL
  allowsXXL: integer("allows_xxl", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
});

export const galleryItems = sqliteTable("gallery_items", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  artistId: text("artist_id").notNull(),

  title: text("title").notNull(),
  year: integer("year"),
  medium: text("medium").notNull(),
  sizeTier: text("size_tier").notNull(),
  dimensions: text("dimensions"), // "18x24" etc

  detailLevel: text("detail_level").notNull(),         // MINIMAL|MODERATE|DETAILED|HIGH|PHOTO
  backgroundLevel: text("background_level").notNull(), // NONE|ABSTRACT|SIMPLE|FULL|COMPLEX

  status: text("status").notNull().default("commission_example"), // available|sold|commission_example
  priceCents: integer("price_cents"),

  imageKey: text("image_key").notNull(), // R2 object key (or URL later)

  // Optional override for “request similar”
  prefillJson: text("prefill_json"), // JSON string

  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
});

export const commissionRequests = sqliteTable("commission_requests", {
  id: text("id").primaryKey(),
  publicId: text("public_id").notNull().unique(), // e.g. VAG-8F3K2

  status: text("status").notNull().default("new"),
  requestedArtistId: text("requested_artist_id"),
  assignedArtistId: text("assigned_artist_id"),

  isCommunitySupported: integer("is_community_supported", { mode: "boolean" })
    .notNull()
    .default(false),

  // Wizard answers + pricing calculations stored as JSON strings
  formJson: text("form_json").notNull(),
  pricingJson: text("pricing_json").notNull(),

  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),

  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
});

export const commissionFiles = sqliteTable("commission_files", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull(),

  objectKey: text("object_key").notNull(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),

  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
});
