package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Patron::Bookings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use Try::Tiny     qw( catch try );
use SQL::Abstract ();

our $VERSION = '1.0.0';

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

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
        my ( $stmt, @bind ) = $sql->select( $BOOKINGS_TABLE, [ 'bookingid', 'roomid', 'start', 'end', 'purpose_of_use' ], { borrowernumber => $borrower->borrowernumber } );
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
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my $id = $c->param('id');

        # We have to get the borrowernumber out of the stash
        my $borrower = $c->stash('koha.user');
        if ( !$borrower ) {
            return $c->render(
                status  => 403,
                openapi => { error => 'You are not allowed to view this page' }
            );
        }

        my ( $stmt, @bind ) = $sql->delete( $BOOKINGS_TABLE, { bookingid => $id } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render( status => 204, openapi => q{} );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
