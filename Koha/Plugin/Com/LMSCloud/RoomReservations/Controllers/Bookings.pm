package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Bookings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context;
use Try::Tiny;
use JSON;

our $VERSION = '1.0.0';

my $self = undef;
if ( Koha::Plugin::Com::LMSCloud::RoomReservations->can('new') ) {
    $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();
}

my $BOOKINGS_TABLE = $self ? $self->get_qualified_table_name('bookings') : undef;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $query = "SELECT * FROM $BOOKINGS_TABLE";
        my $sth   = $dbh->prepare($query);
        $sth->execute();

        my $bookings = $sth->fetchall_arrayref( {} );

        return $c->render( status => 200, openapi => $bookings );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $json = $c->req->body;
        my $body = from_json($json);

        my $dbh = C4::Context->dbh;

        my $query = "INSERT INTO $BOOKINGS_TABLE (borrowernumber, roomid, start, end) VALUES (?, ?, ?, ?)";
        my $sth   = $dbh->prepare($query);

        for my $booking ( $body->@* ) {
            $sth->execute( $booking->{'borrowernumber'}, $booking->{'roomid'}, $booking->{'start'}, $booking->{'end'} );
        }

        return $c->render( status => 201, openapi => $body );

    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $booking_id = $c->validation->param('booking_id');
        my $query      = "SELECT * FROM $BOOKINGS_TABLE WHERE bookingid = ?";
        my $sth        = $dbh->prepare($query);
        $sth->execute($booking_id);

        my $booking = $sth->fetchrow_hashref;
        if ( !$booking ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'No entry found for id' }
            );
        }

        return $c->render( status => 200, openapi => $booking );
    }
    catch {
        $c->unhandled_exception($_);
    }
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $booking_id = $c->validation->param('booking_id');

        my $dbh = C4::Context->dbh;

        my $query = "SELECT * FROM $BOOKINGS_TABLE WHERE bookingid = ?";
        my $sth   = $dbh->prepare($query);
        $sth->execute($booking_id);

        my $booking = $sth->fetchrow_hashref();
        if ( !$booking ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        my $new_booking = $c->validation->param('body');
        $query = "UPDATE $BOOKINGS_TABLE SET roomid = ?, start = ?, end = ? WHERE bookingid = ?";
        $sth   = $dbh->prepare($query);
        $sth->execute( $new_booking->{'roomid'}, $new_booking->{'start'}, $new_booking->{'end'}, $booking_id );

        return $c->render( status => 201, openapi => { $new_booking->%*, bookingid => $booking_id } );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $json = $c->req->body;
        my $body = from_json($json);

        my $query = "DELETE FROM $BOOKINGS_TABLE WHERE bookingid = ?";
        my $sth   = $dbh->prepare($query);

        for my $booking ( $body->@* ) {
            $sth->execute( $booking->{'bookingid'} );
        }

        return $c->render(
            status  => 200,
            openapi => $body
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
