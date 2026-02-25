package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Patron;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use Try::Tiny qw( catch try );

our $VERSION = '1.0.0';

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {

        # We have to get the borrowernumber out of the stash
        my $patron = $c->stash('koha.user');
        if ( !$patron ) {
            return $c->render(
                status  => 403,
                openapi => { error => 'Authentication required' }
            );
        }

        my $details = { email => $patron->email };

        return $c->render( status => 200, openapi => $details );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
