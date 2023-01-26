package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Settings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context;
use Try::Tiny;
use JSON;
use SQL::Abstract;

our $VERSION = '1.0.0';

my $self = undef;
if ( Koha::Plugin::Com::LMSCloud::RoomReservations->can('new') ) {
    $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $setting = $c->validation->param('setting');

        if ( $setting ne 'default_max_booking_time' ) {
            return $c->render(
                status  => 401,
                openapi => {
                    error       => 'Unauthorized',
                    description => 'You are not authorized to access this value'
                }
            );
        }

        my $value = $self->retrieve_data($setting);

        return $c->render( status => 200, openapi => { setting => $setting, value => $value } );
    }
    catch {
        $c->unhandled_exception($_);
    }
}

1;
