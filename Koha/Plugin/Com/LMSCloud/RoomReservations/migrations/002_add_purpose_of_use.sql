ALTER TABLE { { bookings } }
ADD COLUMN IF NOT EXISTS `purpose_of_use` VARCHAR(255) COMMENT 'an optional string of text for communication between staff and patrons';