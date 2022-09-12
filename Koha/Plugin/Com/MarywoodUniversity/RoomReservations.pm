package Koha::Plugin::Com::MarywoodUniversity::RoomReservations;

use 5.010;

use Modern::Perl;

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
use Koha::DateUtils;
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

use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Bookings;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Equipment;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Limits;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Misc;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Rooms;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Times;

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
my $self = new('Koha::Plugin::Com::MarywoodUniversity::RoomReservations');
my $cgi  = $self->{'cgi'};

my $locale = C4::Languages::getlanguage($cgi);
$locale = substr $locale, 0, 2;
local $ENV{'LANGUAGE'} = $locale;
setlocale Locale::Messages::LC_ALL(), q{};
textdomain q{com.marywooduniversity.roomreservations};

my $locale_path = abs_path( $self->mbf_path('translations') );
bindtextdomain q{com.marywooduniversity.roomreservations} => $locale_path;

our $METADATA = {
    name            => get_translation('Room Reservations Plugin'),
    author          => 'Lee Jamison, Paul Derscheid @ LMSCloud GmbH',
    description     => get_translation('This plugin provides a room reservation solution on both intranet and OPAC interfaces.'),
    date_authored   => '2017-05-08',
    date_updated    => '1900-01-01',
    minimum_version => '21.05.14.000',
    maximum_version => undef,
};

our $VALID;    # used to check if booking still valid prior to insertion of new booking

sub new {
    my ( $class, $args ) = @_;

    ## We need to add our metadata here so our base class can access it
    $args->{'metadata'}              = $METADATA;
    $args->{'metadata'}->{'version'} = $VERSION;
    $args->{'metadata'}->{'class'}   = $class;

    ## Here, we call the 'new' method for our base class
    ## This runs some additional magic and checking
    ## and returns our actual $self
    my $self = $class->SUPER::new($args);

    return $self;
}

## NOTE: install() uses an array of double-q commands and
## a for loop of dbh statement execution in order to
## prevent MySQL syntax errors triggered from multiple
## $dbh->do statements

## the first double-q command uses a compound
## DROP TABLE IF EXISTS statement to prevent
## a MySQL syntax error
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
              `branch` VARCHAR(255) -- branch that contains the room
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
              `created` TIMESTAMP DEFAULT NULL, -- creation date
              `updated_at` TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP, -- date on which a booking has been updated
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
    );

    if ( !defined $original_version ) {    # clean install

        # Add required IntranetUserJS entry to place
        # reservations for a patron from circulation.pl
        my $IntranetUserJS = C4::Context->preference('IntranetUserJS');

        $IntranetUserJS =~ s/\/\* JS for Koha RoomReservation Plugin.*End of JS for Koha RoomReservation Plugin \*\///smxg;

        $IntranetUserJS .= <<~"EOF";
            /* JS for Koha RoomReservation Plugin
            This JS was added automatically by installing the RoomReservation plugin
            Please do not modify */

            \$(document).ready(function() {
                var buttonText = "
        EOF

        $IntranetUserJS .= get_translation('Reserve room as patron') . q{";};
        $IntranetUserJS .= <<~"EOF";
                var data = \$("div.patroninfo h5").html();

                if (typeof borrowernumber !== 'undefined') {
                    if (data) {
                        var regExp = /\(([^)]+)\)/;
                        var matches = regExp.exec(data);
                        if (matches) {
                            var cardnumber = matches[1];
                            \$('<a id="bookAsButton" target="_blank" class="btn btn-default btn-sm" href="/cgi-bin/koha/plugins/run.pl?class=Koha::Plugin::Com::MarywoodUniversity::RoomReservations&method=bookas&borrowernumber=' + borrowernumber + '"><i class="fa fa-search"></i>&nbsp;' + buttonText + '</a>').insertAfter(\$('#addnewmessageLabel'));
                        }
                    }
                }
            });

            /* End of JS for Koha RoomReservation Plugin */
        EOF

        C4::Context->set_preference( 'IntranetUserJS', $IntranetUserJS );

        for (@installer_statements) {
            my $sth = C4::Context->dbh->prepare($_);
            $sth->execute or croak C4::Context->dbh->errstr;
        }
    }
    else {    # upgrade
        if ( $original_version eq '1.1.15' ) {

            # do nothing..no database changes
        }
    }

    my $statement = <<~'EOF';
        INSERT IGNORE INTO letter ( module, code, branchcode, name, is_html, title, message_transport_type, lang, content ) VALUES (
            'members', 'ROOM_RESERVATION', "", "Raumreservierungsbenachrichtigung", 1, "Reservierung eines Raumes", "email", "default", 
            "<h2>Ihre Raumreservierung wurde bestätigt</h2>
            <hr>
            <h3>Ihre Angaben</h3>
            <span>Name: [% user %]</span><br>
            <span>Raum: [% room %]</span><br>
            <span>Von: [% from %]</span><br>
            <span>Name: [% to %]</span>
            <hr>
            <h3>Ihre gebuchte Ausstattung</h3>
            <span>[% booked_equipment %]</span>
            <hr>
            <h3>Zeitpunkt der Bestätigung</h3>
            <span>[% confirmed_timestamp %]</span>"
        );
    EOF

    C4::Context->dbh->do($statement);

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

    return 1;
}

sub uninstall() {
    my ( $self, $args ) = @_;

    ## The order of this list is intentional
    ## otherwise the DROP commands will fail
    ## due to foreign key constraints
    ## preventing deletion
    ##
    ## NOTE: the order of dropping is the reverse
    ## of the install() method's order

    my @uninstaller_statements = (
        qq{DROP TABLE IF EXISTS $BOOKINGS_TABLE;},
        qq{DROP TABLE IF EXISTS $ROOMEQUIPMENT_TABLE;},
        qq{DROP TABLE IF EXISTS $EQUIPMENT_TABLE;},
        qq{DROP TABLE IF EXISTS $ROOMS_TABLE;},
        qq{DROP TABLE IF EXISTS $BOOKINGS_EQUIPMENT_TABLE;},
    );

    for (@uninstaller_statements) {
        my $sth = C4::Context->dbh->prepare($_);
        $sth->execute or croak C4::Context->dbh->errstr;
    }

    my $IntranetUserJS = C4::Context->preference('IntranetUserJS');
    $IntranetUserJS =~ s/\/\* JS for Koha RoomReservation Plugin.*End of JS for Koha RoomReservation Plugin \*\///smxg;

    C4::Context->set_preference( 'IntranetUserJS', $IntranetUserJS );

    return 1;
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
    my $template = $self->get_template( { file => 'bookas.tt' } );
    $template->param(
        language => C4::Languages::getlanguage($cgi) || 'en',
        mbf_path => abs_path( $self->mbf_path('translations') ),
    );

    my $op = $cgi->param('op') || q{};

    my $borrowernumber = $cgi->param('borrowernumber');

    my $member = Koha::Patrons->find($borrowernumber);

    my $member_firstname = $member->firstname;
    my $member_surname   = $member->surname;
    my $member_email     = $member->email;

    my $submitButton = $cgi->param('confirmationSubmit') || q{};

    if ( $submitButton eq 'Start over' ) {

        $op = q{};
    }

    $template->param(
        op             => $op,
        borrowernumber => $borrowernumber,
        firstname      => $member_firstname,
        surname        => $member_surname,
        email          => $member_email,
    );

    given ($op) {
        when (q{}) {
            my $equipment = load_all_equipment();

            my $capacities = load_all_max_capacities();

            $template->param(
                available_room_equipment => $equipment,
                all_room_capacities      => $capacities,
            );
        }

        when ('availability-search-results') {
            my $start_date = $cgi->param('availability-search-start-date');
            my $start_time = $cgi->param('availability-search-start-time');

            my $end_date = $cgi->param('availability-search-end-date');
            my $end_time = $cgi->param('availability-search-end-time');

            my $room_capacity = $cgi->param('availability-search-room-capacity');

            my @equipment = $cgi->param('availability-search-selected-equipment') || ();

            my $event_start = sprintf '%s %s', $start_date, $start_time;
            my $event_end   = sprintf '%s %s', $end_date,   $end_time;

            # converts '/' to '-'
            ( my $availability_format_start_date = $start_date ) =~ s/\//\-/smxg;
            ( my $availability_format_end_date   = $end_date )   =~ s/\//\-/smxg;

            # re-arranges from MM-DD-YYYY to YYYY-MM-DD
            ( $availability_format_start_date = $availability_format_start_date ) =~ s/(\d\d)-(\d\d)-(\d\d\d\d)/$3-$1-$2/smx;
            ( $availability_format_end_date   = $availability_format_end_date )   =~ s/(\d\d)-(\d\d)-(\d\d\d\d)/$3-$1-$2/smx;

            # used exclusively for get_available_rooms -- BUG excluding T from the DATETIME start/end field returns wrong results?
            my $availability_format_start = sprintf '%sT%s', $availability_format_start_date, $start_time;
            my $availability_format_end   = sprintf '%sT%s', $availability_format_end_date,   $end_time;

            # generates a DateTime object from a string
            $event_start = dt_from_string($event_start);
            $event_end   = dt_from_string($event_end);

            my $displayed_event_start = output_pref( { dt => $event_start, dateformat => 'us', timeformat => '12hr' } );
            my $displayed_event_end   = output_pref( { dt => $event_end,   dateformat => 'us', timeformat => '12hr' } );

            my $availableRooms = get_available_rooms( $availability_format_start, $availability_format_end, $room_capacity, \@equipment );

            # boolean -- returns 1 (one) if true or 0 (zero) if false
            my $roomsAreAvailable = are_any_rooms_available($availableRooms);

            $template->param(
                available_rooms     => $availableRooms,
                are_rooms_available => $roomsAreAvailable,
                displayed_start     => $displayed_event_start,
                displayed_end       => $displayed_event_end,
                event_start_time    => $event_start,
                event_end_time      => $event_end,
            );
        }

        when ('room-selection-confirmation') {
            my $selected_id     = $cgi->param('selected-room-id');
            my $displayed_start = $cgi->param('displayed-start');
            my $displayed_end   = $cgi->param('displayed-end');
            my $event_start     = $cgi->param('event-start-time');
            my $event_end       = $cgi->param('event-end-time');

            my $displayed_event_time = "$displayed_start - $displayed_end";

            my $user = "$member_firstname $member_surname";

            my $selectedRoomNumber = get_room_number_by_id($selected_id);

            $template->param(
                op                  => $op,
                current_user        => $user,
                current_user_email  => $member_email,
                selected_room_id    => $selected_id,
                selected_room_no    => $selectedRoomNumber,
                displayed_time      => $displayed_event_time,
                selected_start_time => $event_start,
                selected_end_time   => $event_end,
                displayed_start     => $displayed_start,
                displayed_end       => $displayed_end,
            );
        }

        when ('reservation-confirmed') {
            my $roomid   = $cgi->param('confirmed-room-id');
            my $start    = $cgi->param('confirmed-start');
            my $end      = $cgi->param('confirmed-end');
            my $sendCopy = $cgi->param('send-confirmation-copy');

            #my $submitButton = $cgi->param('confirmationSubmit');
            my $user            = $cgi->param('confirmed-user');
            my $roomnumber      = $cgi->param('confirmed-roomnumber');
            my $displayed_start = $cgi->param('confirmed-displayed-start');
            my $displayed_end   = $cgi->param('confirmed-displayed-end');
            my $patronEmail     = $cgi->param('confirmed-email');

            $VALID = pre_booking_availability_check( $roomid, $start, $end );

            if ($VALID) {
                add_booking( $borrowernumber, $roomid, $start, $end );
            }
            else {
                $template->param( invalid_booking => 1, );
            }

            if ( $sendCopy eq '1' && $VALID ) {

                my $timestamp = get_current_timestamp();

                my $patron = Koha::Patrons->find($borrowernumber);

                my $letter = C4::Letters::GetPreparedLetter(
                    module                 => 'members',
                    letter_code            => 'ROOM_RESERVATION',
                    lang                   => $patron->lang,
                    message_transport_type => 'email',
                    substitute             => {
                        user                => $user,
                        room                => $roomnumber,
                        from                => $displayed_start,
                        to                  => $displayed_end,
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
    }

    print $cgi->header( -type => 'text/html', -charset => 'utf-8' );
    print $template->output();
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

    if ( $op eq 'action-selected' ) {
        given ($tool_action) {
            when ('action-manage-reservations') {
                my $bookings  = get_all_bookings();
                my $equipment = load_all_equipment();

                $template->param(
                    op        => 'manage-reservations',
                    bookings  => $bookings,
                    equipment => $equipment,
                );
            }

            when ('action-manage-blackouts') {
                my $blackouts = get_all_blackout_bookings();

                my $rooms = get_current_room_numbers();

                $template->param(
                    op            => 'manage-blackouts',
                    blackouts     => $blackouts,
                    current_rooms => $rooms,
                );
            }

            when ('action-manage-openings') {
                my $opening_hours = get_opening_hours(1);

                $template->param(
                    deleted       => -1,
                    op            => 'manage-openings',
                    opening_hours => $opening_hours,
                );
            }
        }
    }

    if ( $op eq 'manage-openings' ) {
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
    }

    if ( $op eq 'manage-reservations' ) {
        my $selected = $cgi->param('manage-bookings-action');

        my $selectedId = $cgi->param('manage-bookings-id');

        if ( $selected eq 'delete' ) {

            my $deleted   = delete_booking_by_id($selectedId);
            my $bookings  = get_all_bookings();
            my $equipment = load_all_equipment();

            if ( $deleted == 0 ) {
                $template->param(
                    deleted   => 1,
                    bookings  => $bookings,
                    equipment => $equipment,

                );
            }
            else {
                $template->param(
                    deleted   => 0,
                    bookings  => $bookings,
                    equipment => $equipment,
                );
            }
        }

        $template->param( op => $op, );
    }

    if ( $op eq 'manage-blackouts' ) {
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

    print $cgi->header( -type => 'text/html', -charset => 'utf-8' );
    print $template->output();
}

sub configure {
    my ( $self, $args ) = @_;

    $cgi = $self->{'cgi'};

    my $template = $self->get_template( { file => 'configure.tt' } );
    $template->param(
        language => C4::Languages::getlanguage($cgi) || 'en',
        mbf_path => abs_path( $self->mbf_path('translations') ),
    );

    my $op = $cgi->param('op') || q{};

    if ( $op eq q{} ) {    # Displays currently configured rooms
        $template->param();
    }

    if ( $op eq 'action-selected' ) {
        my $selected = $cgi->param('config_actions_selection');
        my $action   = q{};

        given ($selected) {
            when ('action-select-display') {
                $action = 'display-rooms';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-select-add') {
                $action = 'add-rooms';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-select-edit') {
                $action = 'edit-rooms';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-select-delete') {
                $action = 'delete-rooms';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-select-add-equipment') {
                $action = 'add-equipment';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-select-edit-equipment') {
                $action = 'edit-equipment-selection';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-select-delete-equipment') {
                $action = 'delete-equipment';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-max-future-date') {
                $action = 'max-future-date';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-max-time') {
                $action = 'max-time';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-restrict-categories') {
                $action = 'restrict-categories';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
            when ('action-restrict-daily-reservations-per-patron') {
                $action = 'restrict-daily-reservations-per-patron';
                $template->param(
                    action => $action,
                    op     => $op,
                );
            }
        }
    }

    if ( $op eq 'restrict-daily-reservations-per-patron' ) {
        my $limit = $cgi->param('limit-submitted') || q{};

        if ( $limit eq '1' ) {

            my $limit_count = $cgi->param('reservations-limit-field');

            $self->store_data( { count_limit => $limit_count } );
        }

        my $current_limit = $self->retrieve_data('count_limit');

        if ( $current_limit eq '0' ) {
            $current_limit = q{};
        }

        $template->param(
            op          => $op,
            count_limit => $current_limit,
        );
    }

    if ( $op eq 'restrict-categories' ) {
        my $submitted    = $cgi->param('restrict-categories-submitted') || q{};
        my $rest_message = $cgi->param('restricted-message');

        if ( $submitted eq '1' ) {
            my @restricted_categories_to_clear = $cgi->multi_param('currently-restricted-category');

            if ( scalar(@restricted_categories_to_clear) > 0 ) {
                clear_patron_category_restriction( \@restricted_categories_to_clear );
            }
            else {
                clear_patron_category_restriction(undef);
            }

            my @categories_to_restrict = $cgi->multi_param('patron-category');

            for my $category (@categories_to_restrict) {

                # workaround to convert string to hash ref
                my %cat_hash;
                $cat_hash{qq(rcat_$category)} = $category;

                while ( my ( $key, $value ) = each %cat_hash ) {
                    $self->store_data( { $key => $value } );
                }
            }

            # store restricted message
            $self->store_data( { restricted_message => $rest_message } );
        }

        my $restricted         = get_restricted_patron_categories();
        my $searchfield        = q||;
        my $categories         = get_patron_categories();
        my $restricted_message = $self->retrieve_data('restricted_message');

        $template->param(
            op                    => $op,
            restricted_categories => $restricted,
            categories            => $categories,
            restrict_message      => $restricted_message,
        );
    }

    if ( $op eq 'max-time' ) {
        Readonly my $HOUR_IN_MINUTES => 60;
        my $submitted = $cgi->param('max-submitted') || q{};

        if ( $submitted eq '1' ) {
            my $max_time_hours   = $cgi->param('max-time-hours-field');
            my $max_time_minutes = $cgi->param('max-time-minutes-field');
            my $max_time         = ( $max_time_hours * $HOUR_IN_MINUTES ) + $max_time_minutes;

            $self->store_data( { max_time => $max_time } );
        }

        my $max_num_time = $self->retrieve_data('max_time');

        if ( $max_num_time eq '0' ) {
            $max_num_time = q{};
        }

        $template->param(
            op       => $op,
            max_time => $max_num_time,

        );
    }

    if ( $op eq 'max-future-date' ) {
        my $submitted = $cgi->param('max-submitted') || q{};

        if ( $submitted eq '1' ) {
            my $max_days = $cgi->param('max-days-field');
            $self->store_data( { max_future_days => $max_days } );
        }

        my $max_num_days = $self->retrieve_data('max_future_days');

        if ( $max_num_days eq '0' ) {
            $max_num_days = q{};
        }

        $template->param(
            op           => $op,
            max_num_days => $max_num_days,

        );
    }

    if ( $op eq 'display-rooms' ) {
        my $roomnumbers = get_all_room_numbers();

        $template->param(
            op          => $op,
            roomnumbers => $roomnumbers,
        );
    }
    if ( $op eq 'display-rooms-detail' ) {
        my $room_id_to_display = $cgi->param('selected-displayed-room');
        my $room_details       = get_room_details_by_id($room_id_to_display);
        my $room_equipment     = get_room_equipment_by_id($room_id_to_display);

        $template->param(
            op                      => $op,
            selected_room_details   => $room_details,
            selected_room_equipment => $room_equipment,
        );
    }
    if ( $op eq 'add-rooms' ) {
        my $addedRoom = $cgi->param('added-room') || q{};

        if ( $addedRoom eq '1' ) {
            my $roomnumber         = $cgi->param('add-room-roomnumber');
            my $maxcapacity        = $cgi->param('add-room-maxcapacity');
            my $description        = $cgi->param('add-room-description');
            my $color              = $cgi->param('add-room-color');
            my $image              = $cgi->param('add-room-image');
            my $branch             = $cgi->param('add-room-branch');
            my @selected_equipment = $cgi->param('selected-equipment');

            ## pass @selectedEquipment by reference
            add_room(
                {   roomnumber         => $roomnumber,
                    maxcapacity        => $maxcapacity,
                    description        => $description,
                    color              => $color,
                    image              => $image,
                    branch             => $branch,
                    selected_equipment => \@selected_equipment
                }
            );
        }

        my $available_equipment = get_all_room_equipment_names_and_ids();
        my $room_numbers        = get_current_room_numbers();
        my $branches            = get_branches();

        $template->param(
            op                  => $op,
            available_equipment => $available_equipment,
            all_room_numbers    => $room_numbers,
            branches            => $branches,
        );
    }

    if ( $op eq 'edit-rooms' ) {
        my $editing                = $cgi->param('editing')                || q{};
        my $room_details_updated   = $cgi->param('room-details-updated')   || q{};
        my $room_equipment_updated = $cgi->param('room-equipment-updated') || q{};

        if ( $editing eq '1' ) {
            my $selected_room_id = $cgi->param('current-rooms-edit');
            $template->param( selected_room_id => $selected_room_id, );
        }

        if ( $room_details_updated eq '1' ) {
            my $room_id_to_update    = $cgi->param('room-details-updated-roomid');
            my $updated_room_number  = $cgi->param('edit-rooms-room-roomnumber');
            my $updated_description  = $cgi->param('edit-rooms-room-description');
            my $updated_max_capacity = $cgi->param('edit-rooms-room-maxcapacity');
            my $updated_color        = $cgi->param('edit-rooms-room-color');
            my $updated_image        = $cgi->param('edit-rooms-room-image');
            my $updated_branch       = $cgi->param('edit-rooms-room-branch');

            update_room_details(
                {   room_id_to_update    => $room_id_to_update,
                    updated_room_number  => $updated_room_number,
                    updated_description  => $updated_description,
                    updated_max_capacity => $updated_max_capacity,
                    updated_color        => $updated_color,
                    updated_image        => $updated_image,
                    updated_branch       => $updated_branch
                }
            );
        }

        if ( $room_equipment_updated eq '1' ) {
            my $equipment_room_id  = $cgi->param('room-equipment-updated-roomid');
            my @equipment_id_array = $cgi->param('edit-rooms-current-equipment');
            update_room_equipment( $equipment_room_id, \@equipment_id_array );
        }

        my $room_numbers = get_all_room_numbers();

        $template->param(
            op            => $op,
            current_rooms => $room_numbers,
        );
    }

    if ( $op eq 'edit-rooms-selection' ) {
        my $choice           = $cgi->param('edit-rooms-choice')  || q{};
        my $selected_room_id = $cgi->param('current-rooms-edit') || q{};
        my $edit_action      = q{};

        if ( $choice eq 'room' ) {
            $edit_action = 'edit-rooms-room';
        }

        if ( $choice eq 'equipment' ) {
            $edit_action = 'edit-rooms-equipment';
        }

        $template->param(
            op               => $op,
            edit_action      => $edit_action,
            selected_room_id => $selected_room_id,
        );
    }

    if ( $op eq 'edit-rooms-room' ) {
        my $selected_room_id = $cgi->param('selected-room-id') || q{};
        my $room_details     = load_room_details_to_edit_by_room_id($selected_room_id);
        my $branches         = get_branches();

        $template->param(
            op           => $op,
            room_details => $room_details,
            branches     => $branches,

        );
    }

    if ( $op eq 'edit-rooms-equipment' ) {
        my $selected_room_id        = $cgi->param('selected-room-id') || q{};
        my $room_details            = load_room_details_to_edit_by_room_id($selected_room_id);
        my $all_available_equipment = load_all_equipment();

        $template->param(
            op                      => $op,
            room_details            => $room_details,
            all_available_equipment => $all_available_equipment,
        );
    }

    if ( $op eq 'delete-rooms' ) {
        my $delete = $cgi->param('delete') || q{};

        if ( $delete eq '1' ) {
            my $roomIdToDelete = $cgi->param('delete-room-radio-button');
            delete_room($roomIdToDelete);
        }

        my $availableRooms        = get_all_room_numbers_and_ids_available_to_delete();
        my $areThereRoomsToDelete = are_any_rooms_available_to_delete($availableRooms);

        $template->param(
            op                        => $op,
            available_rooms           => $availableRooms,
            rooms_available_to_delete => $areThereRoomsToDelete ? 1 : 0,
        );
    }
    if ( $op eq 'add-equipment' ) {
        my $insert = $cgi->param('insert') || q{};

        if ( $insert eq '1' ) {
            my $addedEquipment = $cgi->param('add-equipment-text-field');
            ## Convert to lowercase to enforce uniformity
            $addedEquipment = lc $addedEquipment;
            ## Enclose in single quotes for DB string compatibility
            $addedEquipment = qq{'$addedEquipment'};
            add_equipment($addedEquipment);
        }

        my $availableEquipment = get_all_room_equipment_names();

        $template->param(
            op                  => $op,
            available_equipment => $availableEquipment,
        );
    }

    if ( $op eq 'delete-equipment' ) {
        my $delete = $cgi->param('delete') || q{};

        if ( $delete eq '1' ) {
            my $equipmentIdToDelete = $cgi->param('delete-equipment-radio-button');
            delete_equipment($equipmentIdToDelete);
        }

        my $availableEquipment = get_all_room_equipment_names_and_ids_available_to_delete();

        $template->param(
            op                  => $op,
            available_equipment => $availableEquipment,
        );
    }

    if ( $op eq 'edit-equipment-selection' ) {
        my $availableEquipment = get_all_room_equipment_names_and_ids();

        $template->param(
            op                  => $op,
            available_equipment => $availableEquipment,
        );
    }

    if ( $op eq 'edit-equipment' ) {

        my $edit = $cgi->param('edit') || q{};

        if ( $edit eq '1' ) {
            my $editedEquipmentId   = $cgi->param('edit-equipment-id');
            my $editedEquipmentName = $cgi->param('edit-equipment-text-field');

            ## Convert to lowercase to enforce uniformity
            $editedEquipmentName = lc $editedEquipmentName;

            ## Enclose in single quotes for DB string compatibility
            $editedEquipmentName = qq{'$editedEquipmentName'};

            update_room_equipment( $editedEquipmentId, $editedEquipmentName );

            my $availableEquipment = get_all_room_equipment_names_and_ids();

            $template->param(
                op                  => 'edit-equipment-selection',
                available_equipment => $availableEquipment,
            );
        }
        else {
            my $equipmentIdToEdit = $cgi->param('edit-equipment-radio-button');
            my $equipmentToEdit   = get_room_equipment_by_id($equipmentIdToEdit);

            $template->param(
                op                => $op,
                equipment_to_edit => $equipmentToEdit,
            );
        }
    }

    print $cgi->header( -type => 'text/html', -charset => 'utf-8' );
    print $template->output();
}

1;
