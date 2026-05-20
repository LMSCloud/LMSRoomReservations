-- Soft-delete rooms instead of removing them, so historical bookings keep
-- resolving to the room they reference. Existing rows default to NULL,
-- meaning "active".
ALTER TABLE { { rooms } }
    ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL;
