package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Patron::Bookings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use Try::Tiny;
use JSON;
use SQL::Abstract;
use Locale::TextDomain ( 'com.lmscloud.roomreservations', undef );
use Locale::Messages qw(:locale_h :libintl_h bind_textdomain_filter);
use POSIX qw(setlocale);
use Encode;

use C4::Context;

our $VERSION = '1.0.0';

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();

my $BOOKINGS_TABLE           = $self ? $self->get_qualified_table_name('bookings')           : undef;
my $BOOKINGS_EQUIPMENT_TABLE = $self ? $self->get_qualified_table_name('bookings_equipment') : undef;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        # We have to get the borrowernumber out of the stash
        my $borrower = $c->stash('koha.user');
        if ( !$borrower ) {
            return $c->render(
                status  => 403,
                openapi => { error => 'You are not allowed to view this page' }
            );
        }

        # We get all bookings associated with the supplied borrowernumber
        my ( $stmt, @bind ) = $sql->select(
            $BOOKINGS_TABLE, [ 'roomid', 'start', 'end' ],
            { borrowernumber => $borrower->borrowernumber }
        );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $bookings = $sth->fetchall_arrayref( {} );
        if ( !$bookings ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'No entries found for borrowernumber' }
            );
        }

        return $c->render( status => 200, openapi => $bookings );
    } catch {
        $c->unhandled_exception($_);
    };
}

1;
