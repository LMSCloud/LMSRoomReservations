-- Allow equipment to be retired without cascading away its history on
-- bookings_equipment. Existing rows default to active.
ALTER TABLE { { equipment } }
    ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL;
