package Koha::Plugin::Com::LMSCloud::RoomReservations;

## It's good practice to use Modern::Perl
use Modern::Perl;
use utf8;
use English qw( -no_match_vars );
use 5.032;
use Carp;

## Required for all plugins
use base qw(Koha::Plugins::Base);

## We will also need to include any Koha libraries we want to access
use C4::Auth;
use C4::Context;

use Koha::Account::Lines;
use Koha::Account;
use Koha::DateUtils qw(dt_from_string);
use Koha::Libraries;
use Koha::Patron::Categories;
use Koha::Patron;

use Cwd qw(abs_path);
use LWP::UserAgent;
use MARC::Record;
use Mojo::JSON qw(decode_json);
use URI::Escape qw(uri_unescape);
use Try::Tiny;

## Here we set our plugin version
our $VERSION         = "{VERSION}";
our $MINIMUM_VERSION = "{MINIMUM_VERSION}";

## Here is our metadata, some keys are required, some are optional
our $metadata = {
    name            => 'LMSRoomReservations',
    author          => 'Paul Derscheid @ LMSCloud GmbH',
    date_authored   => '2009-01-27',
    date_updated    => "1900-01-01",
    minimum_version => $MINIMUM_VERSION,
    maximum_version => undef,
    version         => $VERSION,
    description     => 'This plugin allows you to manage bookable spaces in your institution.',
};

## This is the minimum code required for a plugin's 'new' method
## More can be added, but none should be removed
sub new {
    my ( $class, $args ) = @_;

    ## We need to add our metadata here so our base class can access it
    $args->{'metadata'} = $metadata;
    $args->{'metadata'}->{'class'} = $class;

    ## Here, we call the 'new' method for our base class
    ## This runs some additional magic and checking
    ## and returns our actual $self
    my $self = $class->SUPER::new($args);

    return $self;
}

## The existance of a 'tool' subroutine means the plugin is capable
## of running a tool. The difference between a tool and a report is
## primarily semantic, but in general any plugin that modifies the
## Koha database should be considered a tool
sub tool {
    my ( $self, $args ) = @_;

    my $template;
    my $cgi = $self->{'cgi'};
    my $op  = $cgi->param('op') || q{};

    my $operations = {
        q{} => sub {
            $template = $self->get_template( { file => 'views/tool/bookings.tt' } );
            $template->param( op => $op, );
        },
        q{open-hours} => sub {
            $template = $self->get_template( { file => 'views/tool/open-hours.tt' } );
            $template->param( op => $op, );
        },
    };

    $operations->{$op}->() if exists $operations->{$op};

    return $self->output_html( $template->output() );
}

sub opac_js {
    my ($self) = @_;

    return <<~'JS';
        <script>
            const userMenuUl = document.querySelector("#usermenu > #menu > ul");
            if (userMenuUl) {
                fetch("/api/v1/contrib/roomreservations/static/dist/main.js")
                    .then((response) => response.text())
                    .then((text) => {
                        const script = document.createElement("script");
                        script.text = text;
                        document.body.appendChild(script);
                        return Promise.resolve();
                    })
                    .then(() => {
                        const translationHandler = new RoomReservationBundle.TranslationHandler();
                        const roomReservationsMenuEntry = document.createElement("li");
                        roomReservationsMenuEntry.innerHTML = `
                                    <a href="#"> ${translationHandler.templateTranslations.heading} </a>
                                `;
                        userMenuUl.appendChild(roomReservationsMenuEntry);
                        roomReservationsMenuEntry.addEventListener("click", () => {
                            Array.from(userMenuUl.children).forEach((element) => {
                                element.classList.remove("active");
                            });
                            roomReservationsMenuEntry.classList.add("active");
                            const mainContent = document.querySelector(".maincontent");
                            mainContent.innerHTML = `
                                        <h1>${translationHandler.templateTranslations.heading}</h1>
                                        <p>${translationHandler.templateTranslations.info}</p>
                                        <p>${translationHandler.templateTranslations.loading}</p>
                                    `;
                            const responses = Promise.all([
                                fetch("/api/v1/contrib/roomreservations/public/patrons_bookings"),
                                fetch("/api/v1/contrib/roomreservations/public/rooms"),
                            ]);
                            responses
                                .then(([patronsBookings, rooms]) =>
                                    Promise.all([patronsBookings.json(), rooms.json()])
                                )
                                .then(([patronsBookings, rooms]) => {
                                    mainContent.innerHTML = `
                                                <h1>${
                                                translationHandler
                                                    .templateTranslations.heading
                                                }</h1>
                                                <p>${
                                                translationHandler
                                                    .templateTranslations.info
                                                }</p>
                                                <table class="table table-striped table-bordered table-responsive-sm">
                                                    <thead>
                                                    <tr>
                                                        <th>${
                                                        translationHandler
                                                            .templateTranslations.room
                                                        }</th>
                                                        <th>${
                                                        translationHandler
                                                            .templateTranslations.start
                                                        }</th>
                                                        <th>${
                                                        translationHandler
                                                            .templateTranslations.end
                                                        }</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    ${patronsBookings
                                                    .map(
                                                        (booking) => `
                                                        <tr>
                                                            <td>${
                                                            rooms.find(
                                                                (room) =>
                                                                room.roomid ===
                                                                booking.roomid
                                                            ).roomnumber
                                                            }</td>
                                                            <td>${translationHandler.convertToFormat(
                                                            booking.start,
                                                            "datetime"
                                                            )}</td>
                                                            <td>${translationHandler.convertToFormat(
                                                            booking.end,
                                                            "datetime"
                                                            )}</td>
                                                            </tr>`
                                                    )
                                                    .join("")} </tbody> </table> `;
                                });
                        });
                    });
            }
        </script>
    JS
}

## If your plugin needs to add some javascript in the staff intranet, you'll want
## to return that javascript here. Don't forget to wrap your javascript in
## <script> tags. By not adding them automatically for you, you'll have a
## chance to include other javascript files if necessary.
sub intranet_js {
    my ($self) = @_;

    return <<~'JS';
        <script>console.log("Thanks for testing the kitchen sink plugin!");</script>
    JS
}

## If your tool is complicated enough to needs it's own setting/configuration
## you will want to add a 'configure' method to your plugin like so.
## Here I am throwing all the logic into the 'configure' method, but it could
## be split up like the 'report' method is.
sub configure {
    my ( $self, $args ) = @_;

    my $template;
    my $cgi = $self->{'cgi'};
    my $op  = $cgi->param('op') || q{};

    my $operations = {
        q{} => sub {
            $template = $self->get_template( { file => 'views/configuration/settings.tt' } );
            $template->param( op => $op, );
        },
        q{rooms} => sub {
            $template = $self->get_template( { file => 'views/configuration/rooms.tt' } );
            $template->param( op => $op, );
        },
        q{equipment} => sub {
            $template = $self->get_template( { file => 'views/configuration/equipment.tt' } );
            $template->param( op => $op, );
        },
    };

    $operations->{$op}->() if exists $operations->{$op};

    return $self->output_html( $template->output() );
}

## This is the 'install' method. Any database tables or other setup that should
## be done when the plugin if first installed should be executed in this method.
## The installation method should always return true if the installation succeeded
## or false if it failed.
sub install() {
    my ( $self, $args ) = @_;

    try {
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

        my $original_version = $self->retrieve_data('plugin_version');    # is this a new install or an upgrade?

        my @installer_statements = (
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
            qq{CREATE INDEX $ROOMS_IDX ON $ROOMS(roomid);},
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
            qq{CREATE INDEX $OPEN_HOURS_IDX ON $OPEN_HOURS(openid);},
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
            qq{CREATE INDEX $EQUIPMENT_IDX ON $EQUIPMENT(equipmentid);},
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

        if ( !defined $original_version ) {
            for (@installer_statements) {
                my $sth = C4::Context->dbh->prepare($_);
                $sth->execute;
            }
        }

        $self->store_data(
            {   plugin_version                 => $VERSION,
                default_max_booking_time       => q{},
                absolute_reservation_limit     => q{},
                daily_reservation_limit        => q{},
                restrict_message               => q{},
                reply_to_address               => q{},
                remove_past_reservations_after => q{},
            }
        );

        return 1;
    }
    catch {
        my $error = $_;
        use Data::Dumper;
        carp Dumper($error);
        carp "INSTALL ERROR: $error";

        return 0;
    };
}

## This is the 'upgrade' method. It will be triggered when a newer version of a
## plugin is installed over an existing older version of a plugin
sub upgrade {
    my ( $self, $args ) = @_;

    try {
        my $dt = dt_from_string();
        $self->store_data( { last_upgraded => $dt->ymd(q{-}) . q{ } . $dt->hms(q{:}) } );

        return 1;
    }
    catch {
        my $error = $_;
        use Data::Dumper;
        carp Dumper($error);
        carp "UPGRADE ERROR: $error";

        return 0;
    };
}

## This method will be run just before the plugin files are deleted
## when a plugin is uninstalled. It is good practice to clean up
## after ourselves!
sub uninstall() {
    my ( $self, $args ) = @_;

    my $ROOMS              = $self->get_qualified_table_name('rooms');
    my $BOOKINGS           = $self->get_qualified_table_name('bookings');
    my $EQUIPMENT          = $self->get_qualified_table_name('equipment');
    my $ROOMS_EQUIPMENT    = $self->get_qualified_table_name('rooms_equipment');
    my $OPEN_HOURS         = $self->get_qualified_table_name('open_hours');
    my $BOOKINGS_EQUIPMENT = $self->get_qualified_table_name('bookings_equipment');

    my @uninstaller_statements = (
        qq{DROP TABLE IF EXISTS $BOOKINGS_EQUIPMENT;},
        qq{DROP TABLE IF EXISTS $ROOMS_EQUIPMENT;},
        qq{DROP TABLE IF EXISTS $EQUIPMENT;},
        qq{DROP TABLE IF EXISTS $OPEN_HOURS;},
        qq{DROP TABLE IF EXISTS $BOOKINGS;},
        qq{DROP TABLE IF EXISTS $ROOMS;},
    );

    for (@uninstaller_statements) {
        my $sth = C4::Context->dbh->prepare($_);
        $sth->execute or croak C4::Context->dbh->errstr;
    }

    return 1;
}

## API methods
# If your plugin implements API routes, then the 'api_routes' method needs
# to be implemented, returning valid OpenAPI 2.0 paths serialized as a hashref.
# It is a good practice to actually write OpenAPI 2.0 path specs in JSON on the
# plugin and read it here. This allows to use the spec for mainline Koha later,
# thus making this a good prototyping tool.

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

=head3 cronjob_nightly

Plugin hook running code from a cron job

=cut

sub cronjob_nightly {
    my ($self) = @_;

    return print "Remember to clean the kitchen\n";
}

1;
