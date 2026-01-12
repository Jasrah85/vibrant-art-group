ALTER TABLE `commission_requests` ADD `admin_notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `commission_requests` ADD `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL;