package Koha::Plugin::Com::MarywoodUniversity::RoomReservations;

use 5.010;

use Modern::Perl;
use feature 'signatures';

use base qw(Koha::Plugins::Base);

use strict;
use warnings;
use utf8;
use Modern::Perl;
use English qw( -no_match_vars );

use Carp;
use Cwd qw( abs_path cwd );
use File::Basename qw( dirname );
use MIME::Base64;
use MIME::QuotedPrint;
use Mail::Sendmail;
use POSIX 'strftime';
use Mojo::JSON qw(decode_json);

use C4::Auth;
use C4::Context;
use C4::Output;
use C4::Languages;
use C4::Letters;
use Koha::DateUtils qw( dt_from_string output_pref);
use Koha::Email;
use Koha::Patrons;
use Encode;
use Readonly;
use DateTime;
use experimental qw( switch );

use Locale::Messages;
Locale::Messages->select_package('gettext_pp');

use Locale::Messages qw(:locale_h :libintl_h);
use POSIX qw(setlocale);

use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Bookings;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Equipment;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Limits;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Misc;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Rooms;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Times;

our $VERSION = '{VERSION}';

## Table names and associated MySQL indexes
our $ROOMS_TABLE              = 'booking_rooms';
our $ROOMS_INDEX              = 'bookingrooms_idx';
our $BOOKINGS_TABLE           = 'bookings';
our $BOOKINGS_INDEX           = 'bookingbookings_idx';
our $EQUIPMENT_TABLE          = 'booking_equipment';
our $EQUIPMENT_INDEX          = 'bookingequipment_idx';
our $ROOMEQUIPMENT_TABLE      = 'booking_room_equipment';
our $ROOMEQUIPMENT_INDEX      = 'bookingroomequipment_idx';
our $OPENING_HOURS_TABLE      = 'booking_opening_hours';
our $OPENING_HOURS_INDEX      = 'booking_opening_idx';
our $BOOKINGS_EQUIPMENT_TABLE = 'booking_bookings_equipment';
our $BOOKINGS_EQUIPMENT_INDEX = 'booking_bookings_equipment_idx';

# set locale settings for gettext
my $self = Koha::Plugin::Com::MarywoodUniversity::RoomReservations->new();
my $cgi  = $self->{'cgi'};

my $locale = C4::Languages::getlanguage($cgi);
$locale = substr $locale, 0, 2;
local $ENV{'LANGUAGE'} = $locale;
setlocale Locale::Messages::LC_ALL(), q{};
textdomain q{com.marywooduniversity.roomreservations};

my $locale_path = abs_path( $self->mbf_path('translations') );
bindtextdomain q{com.marywooduniversity.roomreservations} => $locale_path;

our $METADATA = {
    name            => 'LMSRoomReservations',
    author          => 'Lee Jamison; Tobias Engelke & Paul Derscheid @ LMSCloud GmbH',
    description     => get_translation('This plugin provides a room reservation solution on both intranet and OPAC interfaces.'),
    date_authored   => '2017-05-08',
    date_updated    => '1900-01-01',
    minimum_version => '21.05.14.000',
    maximum_version => undef,
};

our $VALID;    # used to check if booking still valid prior to insertion of new booking

sub new {
    my ( $class, $args ) = @_;

    $args->{'metadata'}              = $METADATA;
    $args->{'metadata'}->{'version'} = $VERSION;
    $args->{'metadata'}->{'class'}   = $class;

    my $self = $class->SUPER::new($args);

    return $self;
}

sub install() {
    my ( $self, $args ) = @_;

    my $original_version = $self->retrieve_data('plugin_version');    # is this a new install or an upgrade?

    my @installer_statements = (
        qq{DROP TABLE IF EXISTS $BOOKINGS_TABLE, $ROOMEQUIPMENT_TABLE, $EQUIPMENT_TABLE, $ROOMS_TABLE, $OPENING_HOURS_TABLE},
        <<~"EOF",
            CREATE TABLE $ROOMS_TABLE (
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
        qq{CREATE INDEX $ROOMS_INDEX ON $ROOMS_TABLE(roomid);},
        <<~"EOF",
            CREATE TABLE $BOOKINGS_TABLE (
              `bookingid` INT NOT NULL AUTO_INCREMENT,
              `borrowernumber` INT NOT NULL, -- foreign key; borrowers table
              `roomid` INT NOT NULL, -- foreign key; $ROOMS_TABLE table
              `start` DATETIME NOT NULL, -- start date/time of booking
              `end` DATETIME NOT NULL, -- end date/time of booking
              `blackedout` TINYINT(1) NOT NULL DEFAULT 0, -- shows blackouts if true
              `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- creation date
              `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- date on which a booking has been updated
              PRIMARY KEY (bookingid),
              CONSTRAINT calendar_icfk FOREIGN KEY (roomid) REFERENCES $ROOMS_TABLE(roomid),
              CONSTRAINT calendar_ibfk FOREIGN KEY (borrowernumber) REFERENCES borrowers(borrowernumber)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
        qq{CREATE INDEX $BOOKINGS_INDEX ON $BOOKINGS_TABLE(borrowernumber, roomid);},
        <<~"EOF",
            CREATE TABLE $OPENING_HOURS_TABLE (
              `openid` INT NOT NULL AUTO_INCREMENT,
              `day` INT NOT NULL,
              `start` TIME NOT NULL, -- start date/time of opening hours
              `end` TIME NOT NULL, -- end date/time of opening hours
              PRIMARY KEY (openid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
        qq{CREATE INDEX $OPENING_HOURS_INDEX ON $OPENING_HOURS_TABLE(openid);},
        <<~"EOF",
            CREATE TABLE $EQUIPMENT_TABLE (
              `equipmentid` INT NOT NULL AUTO_INCREMENT,
              `equipmentname` VARCHAR(20) NOT NULL,
              PRIMARY KEY (equipmentid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
        qq{CREATE INDEX $EQUIPMENT_INDEX ON $EQUIPMENT_TABLE(equipmentid);},
        <<~"EOF",
            CREATE TABLE $ROOMEQUIPMENT_TABLE (
              `roomid` INT NOT NULL,
              `equipmentid` INT NOT NULL,
              PRIMARY KEY (roomid, equipmentid),
              CONSTRAINT roomequipment_iafk FOREIGN KEY (roomid) REFERENCES $ROOMS_TABLE(roomid),
              CONSTRAINT roomequipment_ibfk FOREIGN KEY (equipmentid) REFERENCES $EQUIPMENT_TABLE(equipmentid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
        qq{CREATE INDEX $ROOMEQUIPMENT_INDEX ON $ROOMEQUIPMENT_TABLE(roomid, equipmentid);},
        <<~"EOF",
            CREATE TABLE $BOOKINGS_EQUIPMENT_TABLE (
                `bookingid` INT NOT NULL,
                `equipmentid` INT NOT NULL,
                PRIMARY KEY (bookingid, equipmentid),
                CONSTRAINT bookings_equipment_iafk FOREIGN KEY (bookingid) REFERENCES $BOOKINGS_TABLE(bookingid) ON DELETE CASCADE,
                CONSTRAINT bookings_equipment_ibfk FOREIGN KEY (equipmentid) REFERENCES $EQUIPMENT_TABLE(equipmentid) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        EOF
        qq{CREATE INDEX $BOOKINGS_EQUIPMENT_INDEX ON $BOOKINGS_EQUIPMENT_TABLE(bookingid, equipmentid);},
        qq{INSERT INTO $EQUIPMENT_TABLE (equipmentname) VALUES ('none');},
        <<~'EOF',
            INSERT IGNORE INTO letter ( module, code, branchcode, name, is_html, title, message_transport_type, lang, content ) VALUES (
                'members', 'ROOM_RESERVATION', "", "Raumreservierungsbenachrichtigung", 1, "Reservierung eines Raumes", "email", "default", 
                "<h2>Ihre Raumreservierung wurde bestaetigt</h2>
                <hr>
                <h3>Ihre Angaben</h3>
                <span>Name: [% user %]</span><br>
                <span>Raum: [% room %]</span><br>
                <span>Von: [% from %]</span><br>
                <span>Bis: [% to %]</span>
                <hr>
                <h3>Ihre gebuchte Ausstattung</h3>
                <span>[% booked_equipment %]</span>
                <hr>
                <h3>Zeitpunkt der Bestaetigung</h3>
                <span>[% confirmed_timestamp %]</span>"
            );
        EOF
        <<~'EOF',
            INSERT IGNORE INTO letter ( module, code, branchcode, name, is_html, title, message_transport_type, lang, content ) VALUES (
                'members', 'ROOM_CANCELLATION', "", "Raumreservierungsstornierungsbenachrichtigung", 1, "Stornierung der Reservierung eines Raumes", "email", "default",
                "<h2>Ihre Raumreservierung wurde storniert</h2>
                <p>Es tut uns Leid, Sie darueber informieren zu muessen, dass Ihre Reservierung storniert werden musste.</p>
                <hr>
                <h3>Ihre Angaben</h3>
                <span>Raum: [% room %]</span><br>
                <span>Von: [% from %]</span><br>
                <span>Bis: [% to %]</span>"
            );
        EOF
    );

    if ( !defined $original_version ) {    # clean install
        for (@installer_statements) {
            my $sth = C4::Context->dbh->prepare($_);
            $sth->execute or croak C4::Context->dbh->errstr;
        }
    }

    $self->store_data( { plugin_version => $VERSION } );    # used when upgrading to newer version

    return 1;
}

sub intranet_head {
    my ($self) = @_;

    return;
}

sub intranet_js {
    my ($self) = @_;

    my $current_plugin_version = $self->retrieve_data('plugin_version');
    return qq{<script>console.log('RoomReservations plugin loaded. Version $current_plugin_version');</script>};
}

sub upgrade {
    my ( $self, $args ) = @_;

    my $column_color_exists = C4::Context->dbh->do(qq{SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$ROOMS_TABLE' AND COLUMN_NAME = 'color';});
    if ( $column_color_exists eq '0E0' ) {
        my $rv_color = C4::Context->dbh->do(qq{ALTER TABLE $ROOMS_TABLE ADD COLUMN color VARCHAR(7);});
    }

    my $column_image_exists = C4::Context->dbh->do(qq{SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$ROOMS_TABLE' AND COLUMN_NAME = 'image';});
    if ( $column_image_exists eq '0E0' ) {
        my $rv_image = C4::Context->dbh->do(qq{ALTER TABLE $ROOMS_TABLE ADD COLUMN image TEXT;});
    }

    my $column_created_exists = C4::Context->dbh->do(qq{SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$BOOKINGS_TABLE' AND COLUMN_NAME = 'created';});
    if ( $column_created_exists eq '0E0' ) {
        my $rv_created = C4::Context->dbh->do(qq{ALTER TABLE $BOOKINGS_TABLE ADD COLUMN created TIMESTAMP NULL;});
    }

    my $column_updated_at_exists = C4::Context->dbh->do(qq{SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$BOOKINGS_TABLE' AND COLUMN_NAME = 'updated_at';});
    if ( $column_updated_at_exists eq '0E0' ) {
        my $rv_updated_at = C4::Context->dbh->do(qq{ALTER TABLE $BOOKINGS_TABLE ADD COLUMN updated_at TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP;});
    }

    my $table_bookings_equipment_exists = C4::Context->dbh->do(qq{SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$BOOKINGS_EQUIPMENT_TABLE';});
    if ( $table_bookings_equipment_exists eq '0E0' ) {
        my @statements = (
            <<~"EOF",
                CREATE TABLE $BOOKINGS_EQUIPMENT_TABLE (
                    `bookingid` INT NOT NULL, 
                    `equipmentid` INT NOT NULL, 
                    PRIMARY KEY (bookingid, equipmentid), 
                    CONSTRAINT bookings_equipment_iafk FOREIGN KEY (bookingid) REFERENCES $BOOKINGS_TABLE(bookingid) ON DELETE CASCADE,
                    CONSTRAINT bookings_equipment_ibfk FOREIGN KEY (equipmentid) REFERENCES $EQUIPMENT_TABLE(equipmentid) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
            EOF
            qq{CREATE INDEX $BOOKINGS_EQUIPMENT_INDEX ON $BOOKINGS_EQUIPMENT_TABLE(bookingid, equipmentid);}
        );

        for my $statement (@statements) {
            my $sth = C4::Context->dbh->prepare($statement);
            $sth->execute or croak C4::Context->dbh->errstr;
        }
    }

    my $column_branch_exists = C4::Context->dbh->do(qq{SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$ROOMS_TABLE' AND COLUMN_NAME = 'branch';});
    if ( $column_branch_exists eq '0E0' ) {
        my $rv_branch = C4::Context->dbh->do(qq{ALTER TABLE $ROOMS_TABLE ADD COLUMN branch VARCHAR(255);});
    }

    my $column_max_bookable_time_exists = C4::Context->dbh->do(qq{SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$ROOMS_TABLE' AND COLUMN_NAME = 'maxbookabletime';});
    if ( $column_max_bookable_time_exists eq '0E0' ) {
        my $rv_max_bookable_time = C4::Context->dbh->do(qq{ALTER TABLE $ROOMS_TABLE ADD COLUMN maxbookabletime INT;});
    }

    return 1;
}

sub uninstall() {
    my ( $self, $args ) = @_;

    my @uninstaller_statements = (
        qq{DROP TABLE IF EXISTS $BOOKINGS_EQUIPMENT_TABLE;},
        qq{DROP TABLE IF EXISTS $ROOMEQUIPMENT_TABLE;},
        qq{DROP TABLE IF EXISTS $EQUIPMENT_TABLE;},
        qq{DROP TABLE IF EXISTS $BOOKINGS_TABLE;},
        qq{DROP TABLE IF EXISTS $ROOMS_TABLE;},
    );

    for (@uninstaller_statements) {
        my $sth = C4::Context->dbh->prepare($_);
        $sth->execute or croak C4::Context->dbh->errstr;
    }

    return 1;
}

sub api_routes {
    my ( $self, $args ) = @_;

    my $spec_str = $self->mbf_read('openapi.json');
    my $spec     = decode_json($spec_str);

    return $spec;
}

sub static_routes {
    my ( $self, $args ) = @_;

    my $spec_str = $self->mbf_read('staticapi.json');
    my $spec     = decode_json($spec_str);

    return $spec;
}

sub api_namespace {
    my ($self) = @_;

    return 'roomreservations';
}

sub bookas {
    my ( $self, $args ) = @_;

    $cgi = $self->{'cgi'};

    my $template       = $self->get_template( { file => 'bookas.tt' } );
    my $borrowernumber = $cgi->param('borrowernumber');

    my $member           = Koha::Patrons->find($borrowernumber);
    my $member_firstname = $member->firstname;
    my $member_surname   = $member->surname;
    my $member_email     = $member->email;

    my $submitButton = $cgi->param('confirmationSubmit') || q{};

    my $op = $cgi->param('op') || q{};

    if ( $submitButton eq 'Start over' ) {
        $op = q{};
    }

    $template->param(
        op             => $op,
        borrowernumber => $borrowernumber,
        firstname      => $member_firstname,
        surname        => $member_surname,
        email          => $member_email,
        language       => C4::Languages::getlanguage($cgi) || 'en',
        mbf_path       => abs_path( $self->mbf_path('translations') ),
    );

    my $operations = {
        q{} => sub {
            $template->param(
                available_room_equipment => load_all_equipment(),
                all_room_capacities      => load_all_max_capacities(),
            );
        },
        q{availability-search-results} => sub {
            my $start_date = $cgi->param('availability-search-start-date');
            my $start_time = $cgi->param('availability-search-start-time');
            my $end_date   = $cgi->param('availability-search-end-date');
            my $end_time   = $cgi->param('availability-search-end-time');

            # replaces '/' with '-' and re-arranges date format from MM-DD-YYYY to YYYY-MM-DD
            $start_date =~ s{/}{-}g;
            $end_date   =~ s{/}{-}g;
            $start_date =~ s{(\d\d)-(\d\d)-(\d\d\d\d)}{$3-$1-$2}g;
            $end_date   =~ s{(\d\d)-(\d\d)-(\d\d\d\d)}{$3-$1-$2}g;

            # generates DateTime objects from strings
            my $event_start = dt_from_string("$start_date $start_time");
            my $event_end   = dt_from_string("$end_date $end_time");

            # formats DateTime objects for display
            my $displayed_event_start = output_pref( { dt => $event_start, dateformat => 'us', timeformat => '12hr' } );
            my $displayed_event_end   = output_pref( { dt => $event_end,   dateformat => 'us', timeformat => '12hr' } );

            # gets available rooms and checks if any are available
            my $room_capacity     = $cgi->param('availability-search-room-capacity');
            my @equipment         = $cgi->param('availability-search-selected-equipment') || ();
            my $availableRooms    = get_available_rooms( "$start_date" . 'T' . "$start_time", "$end_date" . 'T' . "$end_time", $room_capacity, \@equipment );
            my $roomsAreAvailable = are_any_rooms_available($availableRooms);

            # passes information to the template
            $template->param(
                available_rooms     => $availableRooms,
                are_rooms_available => $roomsAreAvailable,
                displayed_start     => $displayed_event_start,
                displayed_end       => $displayed_event_end,
                event_start_time    => $event_start,
                event_end_time      => $event_end,
            );

        },
        q{room-selection-confirmation} => sub {
            my $selected_id     = $cgi->param('selected-room-id');
            my $displayed_start = $cgi->param('displayed-start');
            my $displayed_end   = $cgi->param('displayed-end');
            my $event_start     = $cgi->param('event-start-time');
            my $event_end       = $cgi->param('event-end-time');

            $template->param(
                op                  => $op,
                current_user        => "$member_firstname $member_surname",
                current_user_email  => $member_email,
                selected_room_id    => $selected_id,
                selected_room_no    => get_room_number_by_id($selected_id),
                displayed_time      => "$displayed_start - $displayed_end",
                selected_start_time => $event_start,
                selected_end_time   => $event_end,
                displayed_start     => $displayed_start,
                displayed_end       => $displayed_end,
            );
        },
        q{reservations-confirmed} => sub {
            my $room_id   = $cgi->param('confirmed-room-id');
            my $start     = $cgi->param('confirmed-start');
            my $end       = $cgi->param('confirmed-end');
            my $send_copy = $cgi->param('send-confirmation-copy');

            $VALID = pre_booking_availability_check( $room_id, $start, $end );

            if ($VALID) {
                add_booking( $borrowernumber, $room_id, $start, $end );
            }
            else {
                $template->param( invalid_booking => 1, );
            }

            if ( $send_copy eq '1' && $VALID ) {

                my $timestamp = get_current_timestamp();
                my $patron    = Koha::Patrons->find($borrowernumber);

                my $letter = C4::Letters::GetPreparedLetter(
                    module                 => 'members',
                    letter_code            => 'ROOM_RESERVATION',
                    lang                   => $patron->lang,
                    message_transport_type => 'email',
                    substitute             => {
                        user                => scalar $cgi->param('confirmed-user'),
                        room                => scalar $cgi->param('confirmed-roomnumber'),
                        from                => scalar $cgi->param('confirmed-displayed-start'),
                        to                  => scalar $cgi->param('confirmed-displayed-end'),
                        confirmed_timestamp => $timestamp,
                    },
                );

                C4::Letters::EnqueueLetter(
                    {   letter                 => $letter,
                        borrowernumber         => $borrowernumber,
                        branchcode             => $patron->branchcode,
                        message_transport_type => 'email',
                    }
                );
            }
        }
    };

    $operations->{$op}->() if exists $operations->{$op};

    return $cgi->header( -type => 'text/html', -charset => 'utf-8' ) . $template->output();
}

sub tool {
    my ( $self, $args ) = @_;

    $cgi = $self->{'cgi'};
    my $template = $self->get_template( { file => 'tool.tt' } );
    $template->param(
        language => C4::Languages::getlanguage($cgi) || 'en',
        mbf_path => abs_path( $self->mbf_path('translations') ),
    );

    my $op          = $cgi->param('op') || q{};
    my $tool_action = $cgi->param('tool_actions_selection');

    # used for manage blackouts
    my $manage_blackouts_submit  = $cgi->param('manage-blackouts-submit')  || q{};    # delete existing blackout
    my $submit_full_blackout     = $cgi->param('submit-full-blackout')     || q{};    # add full day blackout(s)
    my $submit_partial_blackout  = $cgi->param('submit-partial-blackout')  || q{};    # add partial-day blackout
    my $submit_opening_hours     = $cgi->param('submit-opening-hours')     || q{};    # add partial-day blackout
    my $submit_opening_hours_del = $cgi->param('submit-opening-hours-del') || q{};    # add partial-day blackout

    my $operations = {
        q{action-selected} => sub {
            my $tool_actions = {
                'action-manage-reservations' => sub {
                    $template->param(
                        op        => 'manage-reservations',
                        bookings  => get_all_bookings(),
                        equipment => load_all_equipment(),
                        rooms     => get_all_room_numbers(),
                    );
                },
                'action-manage-blackouts' => sub {
                    $template->param(
                        op            => 'manage-blackouts',
                        blackouts     => get_all_blackout_bookings(),
                        current_rooms => get_current_room_numbers(),
                    );
                },
                'action-manage-openings' => sub {
                    $template->param(
                        deleted       => -1,
                        op            => 'manage-openings',
                        opening_hours => get_opening_hours(1),
                    );
                }
            };

            $tool_actions->{$tool_action}->() if exists $tool_actions->{$tool_action};
        },
        q{manage-openings} => sub {
            if ( $submit_opening_hours_del ne q{} ) {
                Readonly my $VALUE_DELETED => -1;
                my $selected   = $cgi->param('manage-openings-action');
                my $selectedId = $cgi->param('manage-openings-id');
                my $deleted    = $VALUE_DELETED;

                if ( $selected eq 'delete' ) {
                    $deleted = delete_opening_hours_by_id($selectedId);
                }

                my $opening_hours = get_opening_hours(1);

                $template->param(
                    deleted       => $deleted,
                    op            => 'manage-openings',
                    opening_hours => $opening_hours,
                );
            }

            if ( $submit_opening_hours ne q{} ) {
                my $starttime = $cgi->param('opening-from');
                my $endtime   = $cgi->param('opening-to');

                my @days = $cgi->param('weekdays');

                add_opening_hours( \@days, $starttime, $endtime );

                my $opening_hours = get_opening_hours(1);

                $template->param(
                    op            => $op,
                    opening_hours => $opening_hours,
                );
            }
        },
        q{manage-reservations} => sub {
            my $selected    = $cgi->param('manage-bookings-action');
            my $selected_id = $cgi->param('manage-bookings-id');

            if ( $selected eq 'delete' ) {

                my $deleted   = delete_booking_by_id($selected_id);
                my $bookings  = get_all_bookings();
                my $equipment = load_all_equipment();
                my $rooms     = get_all_room_numbers();

                if ( $deleted == 0 ) {
                    $template->param(
                        deleted   => 1,
                        bookings  => $bookings,
                        equipment => $equipment,
                        rooms     => $rooms,

                    );
                }
                else {
                    $template->param(
                        deleted   => 0,
                        bookings  => $bookings,
                        equipment => $equipment,
                        rooms     => $rooms,

                    );
                }
            }

            if ( $selected eq 'edit' ) {

                my $bookings  = get_all_bookings();
                my $equipment = load_all_equipment();
                my $rooms     = get_all_room_numbers();

                my $updated_roomid    = $cgi->param('edited-booking-roomnumber');
                my $updated_start     = $cgi->param('edited-booking-start');
                my $updated_end       = $cgi->param('edited-booking-end');
                my $updated_equipment = $cgi->param('edited-booking-equipment');
                my $booking_id        = $cgi->param('edited-booking-id');

                my @updated_equipment = $updated_equipment ? split /,/smx, $updated_equipment : q{};

                my $updated = update_booking_by_id(
                    {   roomid    => $updated_roomid,
                        start     => $updated_start,
                        end       => $updated_end,
                        equipment => \@updated_equipment,
                        bookingid => $booking_id,
                    }
                );

                $bookings = get_all_bookings();

                $template->param(
                    bookings  => $bookings,
                    equipment => $equipment,
                    rooms     => $rooms,
                );
            }

            $template->param( op => $op );
        },
        q{manage-blackouts} => sub {
            if ( $manage_blackouts_submit ne q{} ) {

                #TODO: delete the selected blackout

                my $bookingid = $cgi->param('manage-blackouts-id');

                delete_booking_by_id($bookingid);

                my $blackouts = get_all_blackout_bookings();
                my $rooms     = get_current_room_numbers();

                $template->param(
                    op            => $op,
                    blackouts     => $blackouts,
                    current_rooms => $rooms,
                );
            }

            if ( $submit_full_blackout ne q{} ) {
                my $blackout_start_date = $cgi->param('blackout-start-date');
                my $blackout_end_date   = $cgi->param('blackout-end-date');
                my @rooms               = $cgi->multi_param('current-room-blackout');

                my $start_date = $blackout_start_date . ' 00:00:00';
                my $end_date   = $blackout_end_date . ' 23:59:59';

                my $current_user = C4::Context->userenv->{'number'};

                if ( $rooms[0] eq '0' ) {

                    my $room_ids = get_all_room_ids();    # IDs of all rooms in rooms table

                    my @room_IDs = @{$room_ids};

                    for my $item (@room_IDs) {
                        for my $key ( keys %{$item} ) {
                            add_blackout_booking( $current_user, $item->{$key}, $start_date, $end_date );
                        }
                    }
                }
                else {
                    for my $room (@rooms) {
                        add_blackout_booking( $current_user, $room, $start_date, $end_date );
                    }
                }

                my $blackouts     = get_all_blackout_bookings();
                my $current_rooms = get_current_room_numbers();

                $template->param(
                    op            => $op,
                    blackouts     => $blackouts,
                    current_rooms => $current_rooms,
                );
            }

            if ( $submit_partial_blackout ne q{} ) {
                my $blackout_date = $cgi->param('blackout-date');
                my $start_time    = $cgi->param('blackout-start-time');
                my $end_time      = $cgi->param('blackout-end-time');
                my @rooms         = $cgi->multi_param('current-room-blackout');

                #$blackout_date = sprintf '%3$04d-%02d-%02d', split m:/:, $blackout_date;

                my $start = $blackout_date . " $start_time";
                my $end   = $blackout_date . " $end_time";

                my $current_user = C4::Context->userenv->{'number'};

                if ( $rooms[0] eq '0' ) {

                    my $room_ids = get_all_room_ids();    # IDs of all rooms in rooms table

                    my @room_IDs = @{$room_ids};

                    for my $item (@room_IDs) {
                        for my $key ( keys %{$item} ) {
                            add_blackout_booking( $current_user, $item->{$key}, $start, $end );
                        }
                    }
                }
                else {
                    for my $room (@rooms) {
                        add_blackout_booking( $current_user, $room, $start, $end );
                    }
                }

                my $blackouts     = get_all_blackout_bookings();
                my $current_rooms = get_current_room_numbers();

                $template->param(
                    op            => $op,
                    blackouts     => $blackouts,
                    current_rooms => $current_rooms,
                );
            }
        }
    };

    $operations->{$op}->() if exists $operations->{$op};

    return print $cgi->header( -type => 'text/html', -charset => 'utf-8' ) . $template->output();

}

sub configure {
    my ( $self, $args ) = @_;

    $cgi = $self->{'cgi'};

    my $template;
    my $op = $cgi->param('op') || q{};

    my $operations = {
        q{} => sub {
            $template = $self->get_template( { file => 'views/configuration/default.tt' } );

            my $restricted_patron_categories = get_restricted_patron_categories();
            my $patron_categories            = get_patron_categories();

            $template->param(
                op                           => $op,
                default_max_booking_time     => $self->retrieve_data('default_max_booking_time'),
                daily_reservation_limit      => $self->retrieve_data('daily_reservation_limit'),
                restricted_patron_categories => $restricted_patron_categories,
                patron_categories            => sub {
                    my $params    = shift;
                    my %cmp_table = map  { $_->{'categorycode'} => 1 } @{ $params->{'cmp_with'} };
                    my @diff      = grep { not exists $cmp_table{ $_->{'categorycode'} } } @{ $params->{'cmp_on'} };
                    return \@diff;
                }
                    ->( { cmp_with => $restricted_patron_categories, cmp_on => $patron_categories } ),
                restrict_message => $self->retrieve_data('restrict_message'),
            );
        },
        q{restrict-daily-reservations-per-patron} => sub {
            if ( ( scalar $cgi->param('limit-submitted') || q{} ) eq '1' ) { $self->store_data( { count_limit => scalar $cgi->param('reservations-limit-field') } ); }

            my $current_limit = $self->retrieve_data('count_limit');

            if ( $current_limit eq '0' ) {
                $current_limit = q{};
            }

            $template = $self->get_template( { file => 'views/configuration/restrict_daily_reservations_per_patron.tt' } );
            $template->param(
                op                    => $op,
                count_limit           => $current_limit,
                restricted_categories => get_restricted_patron_categories(),
                categories            => get_patron_categories(),
                restrict_message      => $self->retrieve_data('restricted_message'),

            );
        },
        q{restrict-categories} => sub {
            if ( ( scalar $cgi->param('restrict-categories-submitted') || q{} ) eq '1' ) {
                my @restricted_categories_to_clear = $cgi->multi_param('currently-restricted-category');

                if ( scalar(@restricted_categories_to_clear) > 0 ) {
                    clear_patron_category_restriction( \@restricted_categories_to_clear );
                }
                else {
                    clear_patron_category_restriction(undef);
                }

                for my $category ( $cgi->multi_param('patron-category') ) {
                    my %cat_hash;
                    $cat_hash{qq(rcat_$category)} = $category;

                    while ( my ( $key, $value ) = each %cat_hash ) {
                        $self->store_data( { $key => $value } );
                    }
                }

                $self->store_data( { restricted_message => scalar $cgi->param('restricted-message') } );
            }

            $template = $self->get_template( { file => 'views/configuration/restrict_categories.tt' } );
            $template->param(
                op                    => $op,
                restricted_categories => get_restricted_patron_categories(),
                categories            => get_patron_categories(),
                restrict_message      => scalar $self->retrieve_data('restricted_message'),
            );
        },
        q{rooms} => sub {
            $template = $self->get_template( { file => 'views/configuration/rooms.tt' } );
            $template->param(
                op    => $op,
                rooms => get_all_room_numbers(),
            );
        },
        q{equipment} => sub {
            $template = $self->get_template( { file => 'views/configuration/equipment.tt' } );
            $template->param(
                op        => $op,
                equipment => load_all_equipment(),
            );
        },
        q{restrictions} => sub {
            $template = $self->get_template( { file => 'views/configuration/restrictions.tt' } );
            $template->param(
                op                      => $op,
                all_available_equipment => load_all_equipment(),
            );
        }
    };

    $operations->{$op}->() if exists $operations->{$op};

    $template->param(
        language => C4::Languages::getlanguage($cgi) || 'en',
        mbf_path => abs_path( $self->mbf_path('translations') ),
    );

    return print $cgi->header( -type => 'text/html', -charset => 'utf-8' ) . $template->output();

}

1;
