-- Add open_hours_deviations table for managing special hours and blackout periods
CREATE TABLE { { open_hours_deviations } } (
    `deviationid` INT NOT NULL AUTO_INCREMENT,
    `isblackout` TINYINT(1) NOT NULL DEFAULT 0,
    -- whether this is a blackout (1) or special hours (0)
    `start` DATETIME NOT NULL,
    -- start of the deviation period
    `end` DATETIME NOT NULL,
    -- end of the deviation period
    `recurrencetype` ENUM('none', 'daily', 'weekdays', 'weekly', 'monthly') DEFAULT 'none',
    -- type of recurrence pattern (future: may support rrule for RFC 5545 compliance)
    `recurrencedays` VARCHAR(20) DEFAULT NULL,
    -- days of week for weekly recurrence (0=Mon, 6=Sun), comma-separated, e.g., "0,2,4"
    `recurrenceuntil` DATE DEFAULT NULL,
    -- end date for recurring deviations (inclusive)
    `rrule` TEXT DEFAULT NULL,
    -- future: RFC 5545 iCalendar RRule for complex recurrence patterns
    `description` TEXT DEFAULT NULL,
    -- human-readable description of the deviation
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- creation timestamp
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- date on which a deviation has been updated
    PRIMARY KEY (`deviationid`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

CREATE INDEX { { deviations_idx } } ON { { open_hours_deviations } }(`start`, `end`);

-- Junction table for branch associations
-- If no entries exist for a deviation, it applies to all branches
CREATE TABLE { { deviation_branches } } (
    `deviationid` INT NOT NULL,
    `branch` VARCHAR(255) NOT NULL,
    -- branch code from branches table
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- creation date of the relation
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- date on which a relation has been updated
    PRIMARY KEY (`deviationid`, `branch`),
    CONSTRAINT lmsr_v4_deviation_branches_iafk FOREIGN KEY (`deviationid`) REFERENCES { { open_hours_deviations } }(`deviationid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

CREATE INDEX { { deviation_branches_idx } } ON { { deviation_branches } }(`deviationid`, `branch`);

-- Junction table for room associations
-- If no entries exist for a deviation, it applies to all rooms (within specified branches if any)
CREATE TABLE { { deviation_rooms } } (
    `deviationid` INT NOT NULL,
    `roomid` INT NOT NULL,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- creation date of the relation
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- date on which a relation has been updated
    PRIMARY KEY (`deviationid`, `roomid`),
    CONSTRAINT lmsr_v4_deviation_rooms_iafk FOREIGN KEY (`deviationid`) REFERENCES { { open_hours_deviations } }(`deviationid`) ON DELETE CASCADE,
    CONSTRAINT lmsr_v4_deviation_rooms_ibfk FOREIGN KEY (`roomid`) REFERENCES { { rooms } }(`roomid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;

CREATE INDEX { { deviation_rooms_idx } } ON { { deviation_rooms } }(`deviationid`, `roomid`);
