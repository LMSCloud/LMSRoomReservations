package Koha::Plugin::Com::LMSCloud::RoomReservations;

## It's good practice to use Modern::Perl
use Modern::Perl;
use utf8;
use 5.032;

## Required for all plugins
use base qw(Koha::Plugins::Base);

## We will also need to include any Koha libraries we want to access
use C4::Context ();

use Koha::DateUtils qw( dt_from_string );

use Carp       qw( carp croak );
use English    qw( -no_match_vars );
use Mojo::JSON qw( decode_json );
use Try::Tiny  qw( catch try );

use Koha::Plugin::Com::LMSCloud::Util::MigrationHelper ();

## Here we set our plugin version
our $VERSION         = "4.8.0";
our $MINIMUM_VERSION = '21.05';

## Here is our metadata, some keys are required, some are optional
our $metadata = {
    name            => 'LMSRoomReservations',
    author          => 'LMSCloud GmbH',
    date_authored   => '2009-01-27',
    date_updated    => "2024-03-01",
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
        <script src="/api/v1/contrib/roomreservations/static/assets/patronsBookings.js" defer></script>
    JS
}

## If your plugin needs to add some javascript in the staff intranet, you'll want
## to return that javascript here. Don't forget to wrap your javascript in
## <script> tags. By not adding them automatically for you, you'll have a
## chance to include other javascript files if necessary.
sub intranet_js {
    my ($self) = @_;

    return <<~'JS';
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

    if ( exists $operations->{$op} ) {
        $operations->{$op}->();
    }

    return $self->output_html( $template->output() );
}

## This is the 'install' method. Any database tables or other setup that should
## be done when the plugin if first installed should be executed in this method.
## The installation method should always return true if the installation succeeded
## or false if it failed.
sub install() {
    my ( $self, $args ) = @_;

    my $file       = __FILE__;
    my $bundle_dir = $file;
    $bundle_dir =~ s/[.]pm$//smx;

    my $bundle_path = $bundle_dir;

    return try {
        my $migration_helper = Koha::Plugin::Com::LMSCloud::Util::MigrationHelper->new(
            {   table_name_mappings => {
                    rooms                  => $self->get_qualified_table_name('rooms'),
                    rooms_idx              => $self->get_qualified_table_name('rooms_idx'),
                    bookings               => $self->get_qualified_table_name('bookings'),
                    bookings_idx           => $self->get_qualified_table_name('bookings_idx'),
                    equipment              => $self->get_qualified_table_name('equipment'),
                    equipment_idx          => $self->get_qualified_table_name('equipment_idx'),
                    rooms_equipment        => $self->get_qualified_table_name('rooms_equipment'),
                    rooms_equipment_idx    => $self->get_qualified_table_name('rooms_equipment_idx'),
                    open_hours             => $self->get_qualified_table_name('open_hours'),
                    open_hours_idx         => $self->get_qualified_table_name('open_hours_idx'),
                    bookings_equipment     => $self->get_qualified_table_name('bookings_equipment'),
                    bookings_equipment_idx => $self->get_qualified_table_name('bookings_equipment_idx'),
                },
                bundle_path => $bundle_path,
            }
        );

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

        my $is_success = $migration_helper->install( { plugin => $self } );
        if ( !$is_success ) {
            croak 'Migration failed';
        }

        return 1;
    }
    catch {
        my $error = $_;
        carp "INSTALL ERROR: $error";

        return 0;
    };
}

## This is the 'upgrade' method. It will be triggered when a newer version of a
## plugin is installed over an existing older version of a plugin
sub upgrade {
    my ( $self, $args ) = @_;

    # We have to go the manual route because $self->bundle_path is undef at this point
    my $file       = __FILE__;
    my $bundle_dir = $file;
    $bundle_dir =~ s/[.]pm$//smx;

    my $bundle_path = $bundle_dir;

    return try {
        my $migration_helper = Koha::Plugin::Com::LMSCloud::Util::MigrationHelper->new(
            {   table_name_mappings => {
                    rooms                  => $self->get_qualified_table_name('rooms'),
                    rooms_idx              => $self->get_qualified_table_name('rooms_idx'),
                    bookings               => $self->get_qualified_table_name('bookings'),
                    bookings_idx           => $self->get_qualified_table_name('bookings_idx'),
                    equipment              => $self->get_qualified_table_name('equipment'),
                    equipment_idx          => $self->get_qualified_table_name('equipment_idx'),
                    rooms_equipment        => $self->get_qualified_table_name('rooms_equipment'),
                    rooms_equipment_idx    => $self->get_qualified_table_name('rooms_equipment_idx'),
                    open_hours             => $self->get_qualified_table_name('open_hours'),
                    open_hours_idx         => $self->get_qualified_table_name('open_hours_idx'),
                    bookings_equipment     => $self->get_qualified_table_name('bookings_equipment'),
                    bookings_equipment_idx => $self->get_qualified_table_name('bookings_equipment_idx'),
                },
                bundle_path => $bundle_path,
            }
        );

        my $is_success = $migration_helper->upgrade( { plugin => $self } );
        if ( !$is_success ) {
            croak 'Migration failed';
        }

        my $dt = dt_from_string();
        $self->store_data( { last_upgraded => $dt->ymd(q{-}) . q{ } . $dt->hms(q{:}) } );

        return 1;
    }
    catch {
        my $error = $_;
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
