CREATE TABLE `artist_capabilities` (
	`id` text PRIMARY KEY NOT NULL,
	`artist_id` text NOT NULL,
	`medium` text NOT NULL,
	`max_size_tier` text DEFAULT 'XL' NOT NULL,
	`allows_xxl` integer DEFAULT false NOT NULL,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`bio_short` text DEFAULT '' NOT NULL,
	`bio_long` text,
	`is_active` integer DEFAULT true NOT NULL,
	`availability_status` text DEFAULT 'open' NOT NULL,
	`accepts_rush` integer DEFAULT false NOT NULL,
	`community_slots_enabled` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artists_slug_unique` ON `artists` (`slug`);--> statement-breakpoint
CREATE TABLE `commission_files` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`object_key` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `commission_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`public_id` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`requested_artist_id` text,
	`assigned_artist_id` text,
	`is_community_supported` integer DEFAULT false NOT NULL,
	`form_json` text NOT NULL,
	`pricing_json` text NOT NULL,
	`client_name` text NOT NULL,
	`client_email` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commission_requests_public_id_unique` ON `commission_requests` (`public_id`);--> statement-breakpoint
CREATE TABLE `gallery_items` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`artist_id` text NOT NULL,
	`title` text NOT NULL,
	`year` integer,
	`medium` text NOT NULL,
	`size_tier` text NOT NULL,
	`dimensions` text,
	`detail_level` text NOT NULL,
	`background_level` text NOT NULL,
	`status` text DEFAULT 'commission_example' NOT NULL,
	`price_cents` integer,
	`image_key` text NOT NULL,
	`prefill_json` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gallery_items_slug_unique` ON `gallery_items` (`slug`);