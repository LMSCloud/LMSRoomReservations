#!/usr/bin/perl

# Don't forget to backup
# mysqldump koha_<INSTANCE> bookings booking_rooms booking_opening_hours booking_equipment booking_room_equipment booking_bookings_equipment > backup_before_roomreservations_v4_migration$(date +%Y-%m-%d_%H-%M-%S).sql

use Modern::Perl;
use utf8;
use English qw( -no_match_vars );
use Carp;
use Array::Utils qw(array_minus);
use Module::Load::Conditional qw(can_load);
use Module::Load qw(load);

# use Data::Dumper;

use C4::Context;

BEGIN {
    my $pluginsdir = C4::Context->config('pluginsdir');
    my @pluginsdir = ref($pluginsdir) eq 'ARRAY' ? @{$pluginsdir} : $pluginsdir;
    push @INC, array_minus( @pluginsdir, @INC );
    pop @INC if $INC[-1] eq q{.};
}

our $VERSION = '1.0.0';

# print Dumper( \@INC );

my $self         = undef;
my $plugin_class = 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations';
if ( can_load( modules => { $plugin_class => undef }, nocache => 1 ) ) {
    $self = $plugin_class->new(
        {   enable_plugins => $self->{'enable_plugins'}

                # loads even if plugins are disabled
                # FIXME: is this for testing without bothering to mock config?
        }
    );
}

if ( !$self ) {
    say 'Execution failed: Room Reservations plugin not found.' or croak $ERRNO;
    exit;
}

my $dbh = C4::Context->dbh;

my $ROOMS                  = $self->get_qualified_table_name('rooms');
my $ROOMS_IDX              = $self->get_qualified_table_name('rooms_idx');
my $BOOKINGS               = $self->get_qualified_table_name('bookings');
my $BOOKINGS_IDX           = $self->get_qualified_table_name('bookings_idx');
my $EQUIPMENT              = $self->get_qualified_table_name('equipment');
my $EQUIPMENT_IDX          = $self->get_qualified_table_name('equipment_idx');
my $ROOMS_EQUIPMENT        = $self->get_qualified_table_name('rooms_equipment');
my $ROOMS_EQUIPMENT_IDX    = $self->get_qualified_table_name('rooms_equipment_idx');
my $OPEN_HOURS             = $self->get_qualified_table_name('open_hours');
my $OPEN_HOURS_IDX         = $self->get_qualified_table_name('open_hours_idx');
my $BOOKINGS_EQUIPMENT     = $self->get_qualified_table_name('bookings_equipment');
my $BOOKINGS_EQUIPMENT_IDX = $self->get_qualified_table_name('bookings_equipment_idx');

$ROOMS                  =~ s/marywooduniversity/lmscloud/;
$ROOMS_IDX              =~ s/marywooduniversity/lmscloud/;
$BOOKINGS               =~ s/marywooduniversity/lmscloud/;
$BOOKINGS_IDX           =~ s/marywooduniversity/lmscloud/;
$EQUIPMENT              =~ s/marywooduniversity/lmscloud/;
$EQUIPMENT_IDX          =~ s/marywooduniversity/lmscloud/;
$ROOMS_EQUIPMENT        =~ s/marywooduniversity/lmscloud/;
$ROOMS_EQUIPMENT_IDX    =~ s/marywooduniversity/lmscloud/;
$OPEN_HOURS             =~ s/marywooduniversity/lmscloud/;
$OPEN_HOURS_IDX         =~ s/marywooduniversity/lmscloud/;
$BOOKINGS_EQUIPMENT     =~ s/marywooduniversity/lmscloud/;
$BOOKINGS_EQUIPMENT_IDX =~ s/marywooduniversity/lmscloud/;

# Create the new tables
my @create_sql = (
    qq{DROP TABLE IF EXISTS $BOOKINGS_EQUIPMENT, $ROOMS_EQUIPMENT, $EQUIPMENT, $OPEN_HOURS, $BOOKINGS, $ROOMS },
    <<~"EOF",
            CREATE TABLE $ROOMS (
              `roomid` INT NOT NULL AUTO_INCREMENT,
              `roomnumber` VARCHAR(20) NOT NULL, -- alphanumeric room identifier
              `maxcapacity` INT NOT NULL, -- maximum number of people allowed in the room
              `description` TEXT, -- room description to display in OPAC
              `color` VARCHAR(7), -- room color to display in OPAC
              `image` TEXT, -- room image to display in OPAC
              `branch` VARCHAR(255), -- branch that contains the room
              `maxbookabletime` INT, -- the maximum timespan for a booking on this room
            PRIMARY KEY (roomid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
    <<~"EOF",
            CREATE TABLE $BOOKINGS (
              `bookingid` INT NOT NULL AUTO_INCREMENT,
              `borrowernumber` INT NOT NULL, -- foreign key; borrowers table
              `roomid` INT NOT NULL, -- foreign key; $ROOMS table
              `start` DATETIME NOT NULL, -- start date/time of booking
              `end` DATETIME NOT NULL, -- end date/time of booking
              `blackedout` TINYINT(1) NOT NULL DEFAULT 0, -- shows blackouts if true
              `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- creation date
              `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- date on which a booking has been updated
              PRIMARY KEY (bookingid),
              CONSTRAINT lmsr_v4_calendar_icfk FOREIGN KEY (roomid) REFERENCES $ROOMS(roomid),
              CONSTRAINT lmsr_v4_calendar_ibfk FOREIGN KEY (borrowernumber) REFERENCES borrowers(borrowernumber)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
    qq{CREATE INDEX $BOOKINGS_IDX ON $BOOKINGS(borrowernumber, roomid);},
    <<~"EOF",
            CREATE TABLE $OPEN_HOURS (
              `openid` INT NOT NULL AUTO_INCREMENT,
              `day` INT NOT NULL,
              `start` TIME NOT NULL, -- start date/time of opening hours
              `end` TIME NOT NULL, -- end date/time of opening hours
              `branch` VARCHAR(255), -- branch on which open hours apply
              PRIMARY KEY (openid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
    <<~"EOF",
            CREATE TABLE $EQUIPMENT (
              `equipmentid` INT NOT NULL AUTO_INCREMENT,
              `equipmentname` VARCHAR(20) NOT NULL,
              `description` TEXT DEFAULT NULL, -- equipment description to display in OPAC
              `image` TEXT DEFAULT NULL, -- equipment image to display in OPAC
              `maxbookabletime` INT DEFAULT NULL, -- the maximum timespan for a booking of this item
              PRIMARY KEY (equipmentid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
    <<~"EOF",
            CREATE TABLE $ROOMS_EQUIPMENT (
              `roomid` INT NOT NULL,
              `equipmentid` INT NOT NULL,
              `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- creation date of the relation
              `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- date on which a relation has been updated
              PRIMARY KEY (roomid, equipmentid),
              CONSTRAINT lmsr_v4_roomequipment_iafk FOREIGN KEY (roomid) REFERENCES $ROOMS(roomid) ON DELETE CASCADE,
              CONSTRAINT lmsr_v4_roomequipment_ibfk FOREIGN KEY (equipmentid) REFERENCES $EQUIPMENT(equipmentid) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
    qq{CREATE INDEX $ROOMS_EQUIPMENT_IDX ON $ROOMS_EQUIPMENT(roomid, equipmentid);},
    <<~"EOF",
            CREATE TABLE $BOOKINGS_EQUIPMENT (
                `bookingid` INT NOT NULL,
                `equipmentid` INT NOT NULL,
                `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- creation date of the relation
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- date on which a relation has been updated
                PRIMARY KEY (bookingid, equipmentid),
                CONSTRAINT lmsr_v4_bookings_equipment_iafk FOREIGN KEY (bookingid) REFERENCES $BOOKINGS(bookingid) ON DELETE CASCADE,
                CONSTRAINT lmsr_v4_bookings_equipment_ibfk FOREIGN KEY (equipmentid) REFERENCES $EQUIPMENT(equipmentid) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
    qq{CREATE INDEX $BOOKINGS_EQUIPMENT_IDX ON $BOOKINGS_EQUIPMENT(bookingid, equipmentid);},
);

$dbh->do($_) for @create_sql;

# Copy data from old tables to new tables
# Here we need to insert the branch that was previously the catchall
# my $copy_sql = <<"EOF";
#   INSERT INTO $OPEN_HOURS (
#     openid, day, start, end, branch
#   ) SELECT
#     openid, day, start, end, '<DEFAULT_BRANCH>' AS branch
#   FROM booking_opening_hours
# EOF
# $dbh->do($copy_sql);

$copy_sql = <<"EOF";
  INSERT INTO $ROOMS (
    roomid, roomnumber, maxcapacity, description, color, image, branch, maxbookabletime
  ) SELECT
    roomid, roomnumber, maxcapacity, description, color, image, branch, maxbookabletime
  FROM booking_rooms
EOF
$dbh->do($copy_sql);

$copy_sql = <<"EOF";
  INSERT INTO $EQUIPMENT (
    equipmentid, equipmentname
  ) SELECT
    equipmentid, equipmentname
  FROM booking_equipment
EOF
$dbh->do($copy_sql);

$copy_sql = <<"EOF";
  INSERT INTO $BOOKINGS (
    bookingid, borrowernumber, roomid, start, end, blackedout, created, updated_at
  ) SELECT
    bookingid, borrowernumber, roomid, start, end, blackedout, created, updated_at
  FROM bookings
EOF
$dbh->do($copy_sql);

$copy_sql = <<"EOF";
  INSERT INTO $ROOMS_EQUIPMENT (
    roomid, equipmentid, created, updated_at
  ) SELECT
    roomid, equipmentid, NOW(), NOW()
  FROM booking_room_equipment
EOF
$dbh->do($copy_sql);

$copy_sql = <<"EOF";
  INSERT INTO $BOOKINGS_EQUIPMENT (
    bookingid, equipmentid, created, updated_at
  ) SELECT
    bookingid, equipmentid, NOW(), NOW()
  FROM booking_bookings_equipment
EOF
$dbh->do($copy_sql);

$self->store_data(
    {   default_max_booking_time       => q{1440},
        absolute_reservation_limit     => q{20},
        daily_reservation_limit        => q{5},
        restrict_message               => q{Leider haben Sie nicht die notwendige Berechtigung, um Reservierungen vorzunehmen.},
        reply_to_address               => q{},
        remove_past_reservations_after => q{7},
    }
);

1;
