-- Optional fixed-slot booking per room. `slot_length` (minutes) turns a room
-- into slot mode: bookings must match a generated slot instead of a free start
-- time and duration. NULL/0 keeps the room in free mode (current behaviour).
-- `slot_start` is an optional time-of-day anchor for slot generation; NULL
-- aligns slots to that weekday's opening time.
ALTER TABLE { { rooms } }
    ADD COLUMN IF NOT EXISTS `slot_length` INT NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `slot_start` TIME NULL DEFAULT NULL;
