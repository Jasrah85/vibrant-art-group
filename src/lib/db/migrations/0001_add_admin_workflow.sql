ALTER TABLE commission_requests ADD COLUMN admin_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE commission_requests ADD COLUMN updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000);
