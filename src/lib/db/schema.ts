// src/lib/db/schema.ts
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

  adminNotes: text("admin_notes").notNull().default(""),

  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
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

export const commissionEvents = sqliteTable("commission_events", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull(),

  // Examples: request_created, status_changed, assignment_changed, admin_notes_updated, email_sent
  type: text("type").notNull(),

  // "system" | "admin" | "client"
  actor: text("actor").notNull(),

  summary: text("summary").notNull(),

  // optional JSON payload (diffs, ids, metadata)
  dataJson: text("data_json"),

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ======================================================
// Auth.js (NextAuth v5) tables for Drizzle Adapter
// Required for email magic-link sign-in (Resend)
// ======================================================

export const authUsers = sqliteTable("auth_users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const authAccounts = sqliteTable("auth_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),

  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),

  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const authSessions = sqliteTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const authVerificationTokens = sqliteTable("auth_verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});
