-- Ensure bookings follow borrower merges by cascading deletions/updates
ALTER TABLE { { bookings } }
    DROP FOREIGN KEY IF EXISTS lmsr_v4_calendar_ibfk;

ALTER TABLE { { bookings } }
    ADD CONSTRAINT lmsr_v4_calendar_ibfk FOREIGN KEY IF NOT EXISTS (borrowernumber)
        REFERENCES borrowers(borrowernumber)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
