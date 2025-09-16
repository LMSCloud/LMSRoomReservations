DROP TABLE IF EXISTS { { bookings_equipment } },
{ { rooms_equipment } },
{ { equipment } },
{ { open_hours } },
{ { bookings } },
{ { rooms } };
CREATE TABLE { { rooms } } (
    `roomid` INT NOT NULL AUTO_INCREMENT,
    `roomnumber` VARCHAR(20) NOT NULL,
    -- alphanumeric room identifier
    `maxcapacity` INT NOT NULL,
    -- maximum number of people allowed in the room
    `description` TEXT,
    -- room description to display in OPAC
    `color` VARCHAR(7),
    -- room color to display in OPAC
    `image` TEXT,
    -- room image to display in OPAC
    `branch` VARCHAR(255),
    -- branch that contains the room
    `maxbookabletime` INT,
    -- the maximum timespan for a booking on this room
    PRIMARY KEY (roomid)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;
CREATE INDEX { { rooms_idx } } ON { { rooms } }(roomid);
CREATE TABLE { { bookings } } (
    `bookingid` INT NOT NULL AUTO_INCREMENT,
    `borrowernumber` INT NOT NULL,
    -- foreign key; borrowers table
    `roomid` INT NOT NULL,
    -- foreign key; { { rooms } } table
    `start` DATETIME NOT NULL,
    -- start date/time of booking
    `end` DATETIME NOT NULL,
    -- end date/time of booking
    `blackedout` TINYINT(1) NOT NULL DEFAULT 0,
    -- shows blackouts if true
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- creation date
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- date on which a booking has been updated
    PRIMARY KEY (bookingid),
    CONSTRAINT lmsr_v4_calendar_icfk FOREIGN KEY (roomid) REFERENCES { { rooms } }(roomid),
    CONSTRAINT lmsr_v4_calendar_ibfk FOREIGN KEY (borrowernumber) REFERENCES borrowers(borrowernumber) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;
CREATE INDEX { { bookings_idx } } ON { { bookings } }(borrowernumber, roomid);
CREATE TABLE { { open_hours } } (
    `openid` INT NOT NULL AUTO_INCREMENT,
    `day` INT NOT NULL,
    `start` TIME NOT NULL,
    -- start date/time of opening hours
    `end` TIME NOT NULL,
    -- end date/time of opening hours
    `branch` VARCHAR(255),
    -- branch on which open hours apply
    PRIMARY KEY (openid)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;
CREATE INDEX { { open_hours_idx } } ON { { open_hours } }(openid);
CREATE TABLE { { equipment } } (
    `equipmentid` INT NOT NULL AUTO_INCREMENT,
    `equipmentname` VARCHAR(20) NOT NULL,
    `description` TEXT DEFAULT NULL,
    -- equipment description to display in OPAC
    `image` TEXT DEFAULT NULL,
    -- equipment image to display in OPAC
    `maxbookabletime` INT DEFAULT NULL,
    -- the maximum timespan for a booking of this item
    PRIMARY KEY (equipmentid)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;
CREATE INDEX { { equipment_idx } } ON { { equipment } }(equipmentid);
CREATE TABLE { { rooms_equipment } } (
    `roomid` INT NOT NULL,
    `equipmentid` INT NOT NULL,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- creation date of the relation
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- date on which a relation has been updated
    PRIMARY KEY (roomid, equipmentid),
    CONSTRAINT lmsr_v4_roomequipment_iafk FOREIGN KEY (roomid) REFERENCES { { rooms } }(roomid) ON DELETE CASCADE,
    CONSTRAINT lmsr_v4_roomequipment_ibfk FOREIGN KEY (equipmentid) REFERENCES { { equipment } }(equipmentid) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;
CREATE INDEX { { rooms_equipment_idx } } ON { { rooms_equipment } }(roomid, equipmentid);
CREATE TABLE { { bookings_equipment } } (
    `bookingid` INT NOT NULL,
    `equipmentid` INT NOT NULL,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- creation date of the relation
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- date on which a relation has been updated
    PRIMARY KEY (bookingid, equipmentid),
    CONSTRAINT lmsr_v4_bookings_equipment_iafk FOREIGN KEY (bookingid) REFERENCES { { bookings } }(bookingid) ON DELETE CASCADE,
    CONSTRAINT lmsr_v4_bookings_equipment_ibfk FOREIGN KEY (equipmentid) REFERENCES { { equipment } }(equipmentid) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;
CREATE INDEX { { bookings_equipment_idx } } ON { { bookings_equipment } }(bookingid, equipmentid);
