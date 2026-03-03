package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Settings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use List::Util qw( any );
use Try::Tiny  qw( catch try );

our $VERSION = '1.0.0';

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my @ALLOWED_SETTINGS = qw(
    default_max_booking_time
    enforce_email_notification
    calendar_default_view
    calendar_year_drill_target
    calendar_year_density_mode
    calendar_primary_color
);

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my @settings;
        for my $key (@ALLOWED_SETTINGS) {
            push @settings, { setting => $key, value => $self->retrieve_data($key) };
        }
        return $c->render( status => 200, openapi => \@settings );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $setting = $c->param('setting');

        if ( !any { $_ eq $setting } @ALLOWED_SETTINGS ) {
            return $c->render(
                status  => 401,
                openapi => {
                    error       => 'Unauthorized',
                    description => 'You are not authorized to access this value'
                }
            );
        }

        my $value = $self->retrieve_data($setting);

        return $c->render(
            status  => 200,
            openapi => { setting => $setting, value => $value }
        );
    }
    catch {
        $c->unhandled_exception($_);
    }
}

1;
