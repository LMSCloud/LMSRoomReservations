package TestHelper;

use Modern::Perl;

use C4::Context ();
use SQL::Abstract ();

use Koha::Plugin::Com::LMSCloud::RoomReservations;

my $plugin = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my %TABLE = (
    rooms                 => $plugin->get_qualified_table_name('rooms'),
    bookings              => $plugin->get_qualified_table_name('bookings'),
    equipment             => $plugin->get_qualified_table_name('equipment'),
    rooms_equipment       => $plugin->get_qualified_table_name('rooms_equipment'),
    open_hours            => $plugin->get_qualified_table_name('open_hours'),
    bookings_equipment    => $plugin->get_qualified_table_name('bookings_equipment'),
    open_hours_deviations => $plugin->get_qualified_table_name('open_hours_deviations'),
    deviation_branches    => $plugin->get_qualified_table_name('deviation_branches'),
    deviation_rooms       => $plugin->get_qualified_table_name('deviation_rooms'),
);

sub table_name {
    my ($name) = @_;
    return $TABLE{$name};
}

sub plugin { return $plugin }

sub setup_tables {
    my $dbh = C4::Context->dbh;

    _drop_tables($dbh);

    my @create_stmts = (
        # rooms
        qq{CREATE TABLE $TABLE{rooms} (
            `roomid` INT NOT NULL AUTO_INCREMENT,
            `roomnumber` VARCHAR(20) NOT NULL,
            `maxcapacity` INT NOT NULL,
            `description` TEXT,
            `color` VARCHAR(7),
            `image` TEXT,
            `branch` VARCHAR(255),
            `maxbookabletime` INT,
            PRIMARY KEY (roomid)
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci},

        # bookings
        qq{CREATE TABLE $TABLE{bookings} (
            `bookingid` INT NOT NULL AUTO_INCREMENT,
            `borrowernumber` INT NOT NULL,
            `roomid` INT NOT NULL,
            `start` DATETIME NOT NULL,
            `end` DATETIME NOT NULL,
            `blackedout` TINYINT(1) NOT NULL DEFAULT 0,
            `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `purpose_of_use` VARCHAR(255),
            PRIMARY KEY (bookingid),
            CONSTRAINT lmsr_v4_calendar_icfk FOREIGN KEY (roomid) REFERENCES $TABLE{rooms}(roomid),
            CONSTRAINT lmsr_v4_calendar_ibfk FOREIGN KEY (borrowernumber) REFERENCES borrowers(borrowernumber) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci},

        # open_hours
        qq{CREATE TABLE $TABLE{open_hours} (
            `openid` INT NOT NULL AUTO_INCREMENT,
            `day` INT NOT NULL,
            `start` TIME NOT NULL,
            `end` TIME NOT NULL,
            `branch` VARCHAR(255),
            PRIMARY KEY (openid)
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci},

        # equipment
        qq{CREATE TABLE $TABLE{equipment} (
            `equipmentid` INT NOT NULL AUTO_INCREMENT,
            `equipmentname` VARCHAR(20) NOT NULL,
            `description` TEXT DEFAULT NULL,
            `image` TEXT DEFAULT NULL,
            `maxbookabletime` INT DEFAULT NULL,
            PRIMARY KEY (equipmentid)
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci},

        # rooms_equipment
        qq{CREATE TABLE $TABLE{rooms_equipment} (
            `roomid` INT NOT NULL,
            `equipmentid` INT NOT NULL,
            `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (roomid, equipmentid),
            CONSTRAINT lmsr_v4_roomequipment_iafk FOREIGN KEY (roomid) REFERENCES $TABLE{rooms}(roomid) ON DELETE CASCADE,
            CONSTRAINT lmsr_v4_roomequipment_ibfk FOREIGN KEY (equipmentid) REFERENCES $TABLE{equipment}(equipmentid) ON DELETE CASCADE
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci},

        # bookings_equipment
        qq{CREATE TABLE $TABLE{bookings_equipment} (
            `bookingid` INT NOT NULL,
            `equipmentid` INT NOT NULL,
            `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (bookingid, equipmentid),
            CONSTRAINT lmsr_v4_bookings_equipment_iafk FOREIGN KEY (bookingid) REFERENCES $TABLE{bookings}(bookingid) ON DELETE CASCADE,
            CONSTRAINT lmsr_v4_bookings_equipment_ibfk FOREIGN KEY (equipmentid) REFERENCES $TABLE{equipment}(equipmentid) ON DELETE CASCADE
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci},

        # open_hours_deviations
        qq{CREATE TABLE $TABLE{open_hours_deviations} (
            `deviationid` INT NOT NULL AUTO_INCREMENT,
            `isblackout` TINYINT(1) NOT NULL DEFAULT 0,
            `start` DATETIME NOT NULL,
            `end` DATETIME NOT NULL,
            `recurrencetype` ENUM('none', 'daily', 'weekdays', 'weekly', 'monthly') DEFAULT 'none',
            `recurrencedays` VARCHAR(20) DEFAULT NULL,
            `recurrenceuntil` DATE DEFAULT NULL,
            `rrule` TEXT DEFAULT NULL,
            `description` TEXT DEFAULT NULL,
            `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`deviationid`)
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci},

        # deviation_branches
        qq{CREATE TABLE $TABLE{deviation_branches} (
            `deviationid` INT NOT NULL,
            `branch` VARCHAR(255) NOT NULL,
            `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`deviationid`, `branch`),
            CONSTRAINT lmsr_v4_deviation_branches_iafk FOREIGN KEY (`deviationid`) REFERENCES $TABLE{open_hours_deviations}(`deviationid`) ON DELETE CASCADE
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci},

        # deviation_rooms
        qq{CREATE TABLE $TABLE{deviation_rooms} (
            `deviationid` INT NOT NULL,
            `roomid` INT NOT NULL,
            `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`deviationid`, `roomid`),
            CONSTRAINT lmsr_v4_deviation_rooms_iafk FOREIGN KEY (`deviationid`) REFERENCES $TABLE{open_hours_deviations}(`deviationid`) ON DELETE CASCADE,
            CONSTRAINT lmsr_v4_deviation_rooms_ibfk FOREIGN KEY (`roomid`) REFERENCES $TABLE{rooms}(`roomid`) ON DELETE CASCADE
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci},
    );

    for my $stmt (@create_stmts) {
        $dbh->do($stmt) or die "Failed to create table: " . $dbh->errstr;
    }

    return 1;
}

sub teardown_tables {
    my $dbh = C4::Context->dbh;
    _drop_tables($dbh);
    return 1;
}

sub _drop_tables {
    my ($dbh) = @_;

    my @drops = (
        "DROP TABLE IF EXISTS $TABLE{bookings_equipment}",
        "DROP TABLE IF EXISTS $TABLE{deviation_rooms}",
        "DROP TABLE IF EXISTS $TABLE{deviation_branches}",
        "DROP TABLE IF EXISTS $TABLE{open_hours_deviations}",
        "DROP TABLE IF EXISTS $TABLE{rooms_equipment}",
        "DROP TABLE IF EXISTS $TABLE{equipment}",
        "DROP TABLE IF EXISTS $TABLE{open_hours}",
        "DROP TABLE IF EXISTS $TABLE{bookings}",
        "DROP TABLE IF EXISTS $TABLE{rooms}",
    );

    for my $stmt (@drops) {
        $dbh->do($stmt) or die "Failed to drop table: " . $dbh->errstr;
    }

    return 1;
}

sub insert_room {
    my (%args) = @_;

    my $dbh = C4::Context->dbh;
    my $sql = SQL::Abstract->new;

    my ( $stmt, @bind ) = $sql->insert( $TABLE{rooms}, \%args );
    $dbh->do( $stmt, undef, @bind ) or die $dbh->errstr;

    my $id = $dbh->last_insert_id( undef, undef, $TABLE{rooms}, 'roomid' );
    return { %args, roomid => $id };
}

sub insert_equipment {
    my (%args) = @_;

    my $dbh = C4::Context->dbh;
    my $sql = SQL::Abstract->new;

    my ( $stmt, @bind ) = $sql->insert( $TABLE{equipment}, \%args );
    $dbh->do( $stmt, undef, @bind ) or die $dbh->errstr;

    my $id = $dbh->last_insert_id( undef, undef, $TABLE{equipment}, 'equipmentid' );
    return { %args, equipmentid => $id };
}

sub insert_open_hours {
    my (%args) = @_;

    my $dbh = C4::Context->dbh;
    my $sql = SQL::Abstract->new;

    my ( $stmt, @bind ) = $sql->insert( $TABLE{open_hours}, \%args );
    $dbh->do( $stmt, undef, @bind ) or die $dbh->errstr;

    my $id = $dbh->last_insert_id( undef, undef, $TABLE{open_hours}, 'openid' );
    return { %args, openid => $id };
}

sub insert_booking {
    my (%args) = @_;

    my $dbh = C4::Context->dbh;
    my $sql = SQL::Abstract->new;

    my ( $stmt, @bind ) = $sql->insert( $TABLE{bookings}, \%args );
    $dbh->do( $stmt, undef, @bind ) or die $dbh->errstr;

    my $id = $dbh->last_insert_id( undef, undef, $TABLE{bookings}, 'bookingid' );
    return { %args, bookingid => $id };
}

sub insert_rooms_equipment {
    my (%args) = @_;

    my $dbh = C4::Context->dbh;
    my $sql = SQL::Abstract->new;

    my ( $stmt, @bind ) = $sql->insert( $TABLE{rooms_equipment}, \%args );
    $dbh->do( $stmt, undef, @bind ) or die $dbh->errstr;

    return \%args;
}

sub insert_bookings_equipment {
    my (%args) = @_;

    my $dbh = C4::Context->dbh;
    my $sql = SQL::Abstract->new;

    my ( $stmt, @bind ) = $sql->insert( $TABLE{bookings_equipment}, \%args );
    $dbh->do( $stmt, undef, @bind ) or die $dbh->errstr;

    return \%args;
}

sub insert_setting {
    my (%args) = @_;
    $plugin->store_data( { $args{setting} => $args{value} } );
    return \%args;
}

sub delete_setting {
    my ($key) = @_;

    my $dbh = C4::Context->dbh;
    $dbh->do(
        q{DELETE FROM plugin_data WHERE plugin_class = ? AND plugin_key = ?},
        undef,
        'Koha::Plugin::Com::LMSCloud::RoomReservations',
        $key
    );

    return 1;
}

1;
