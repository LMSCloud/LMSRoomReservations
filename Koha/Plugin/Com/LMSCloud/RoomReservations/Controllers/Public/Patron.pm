package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Patron;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use Try::Tiny;
use Locale::TextDomain ( 'com.lmscloud.roomreservations', undef );
use Locale::Messages qw(:locale_h :libintl_h bind_textdomain_filter);
use POSIX qw(setlocale);
use Encode;

use Koha::Patrons;

our $VERSION = '1.0.0';

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {

        # We have to get the borrowernumber out of the stash
        my $patron = $c->stash('koha.user');
        if ( !$patron ) {
            return $c->render(
                status  => 403,
                openapi => { error => 'Unauthorized' }
            );
        }

        my $details = { email => $patron->email };

        return $c->render( status => 200, openapi => $details );
    } catch {
        $c->unhandled_exception($_);
    };
}

1;
