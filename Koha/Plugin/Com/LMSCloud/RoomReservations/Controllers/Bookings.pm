package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Bookings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context;
use Try::Tiny;
use JSON;
use SQL::Abstract;
use Time::Piece;

our $VERSION = '1.0.0';

my $self = undef;
if ( Koha::Plugin::Com::LMSCloud::RoomReservations->can('new') ) {
    $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();
}

my $BOOKINGS_TABLE   = $self ? $self->get_qualified_table_name('bookings')   : undef;
my $OPEN_HOURS_TABLE = $self ? $self->get_qualified_table_name('open_hours') : undef;
my $ROOMS_TABLE      = $self ? $self->get_qualified_table_name('rooms')      : undef;

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

        return _check_and_save_booking( $body, $c );
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
    };
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $booking_id = $c->validation->param('booking_id');

        my $json = $c->req->body;
        my $body = from_json($json);

        return _check_and_save_booking( $body, $c, $booking_id );
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

sub _check_and_save_booking {
    my ( $body, $c, $booking_id ) = @_;

    #TODO: Also check against open_hours table and max bookable time for room if set, otherwise default

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;
    $dbh->begin_work;    # start transaction

    # Get the maxbookabletime for the room in the booking
    my ( $max_bookable_time_where, @max_bookable_time_bind ) = $sql->where( { roomid => $body->{'roomid'} } );
    my $room_query = "SELECT maxbookabletime FROM $ROOMS_TABLE $max_bookable_time_where";
    my $room_sth   = $dbh->prepare($room_query);
    $room_sth->execute(@max_bookable_time_bind);
    my ($max_bookable_time) = $room_sth->fetchrow_array;

    # Check if the difference between start and end times exceeds the maxbookabletime
    my $start_time = Time::Piece->strptime( $body->{'start'}, '%Y-%m-%dT%H:%M' );
    my $end_time   = Time::Piece->strptime( $body->{'end'},   '%Y-%m-%dT%H:%M' );
    my $duration   = ( $end_time - $start_time )->minutes;

    if ( $duration > $max_bookable_time ) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => 'The booking exceeds the maximum allowed time for the room.' } );
    }

    my ( $where, @bind ) = $sql->where(
        {   roomid => $body->{'roomid'},
            -and   => [
                start => { '<=' => $body->{'end'} },
                end   => { '>=' => $body->{'start'} },
            ]
        }
    );
    $where .= ' AND bookingid != ?' and push @bind, $booking_id if $booking_id;
    my $check_query = "SELECT COUNT(*) FROM $BOOKINGS_TABLE $where";
    my $check_sth   = $dbh->prepare($check_query);
    $check_sth->execute(@bind);
    my ($count) = $check_sth->fetchrow_array;

    if ( $count > 0 ) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => 'A booking already exists in the selected time frame.' } );
    }

    try {
        my ( $query, $sth );
        if ( defined $booking_id ) {
            my ( $stmt, @bind ) = $sql->update(
                $BOOKINGS_TABLE,
                {   borrowernumber => $body->{'borrowernumber'},
                    roomid         => $body->{'roomid'},
                    start          => $body->{'start'},
                    end            => $body->{'end'},
                    blackedout     => $body->{'blackedout'} || 0
                },
                { bookingid => $booking_id }
            );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);
        }
        else {
            my ( $stmt, @bind ) = $sql->insert(
                $BOOKINGS_TABLE,
                {   borrowernumber => $body->{'borrowernumber'},
                    roomid         => $body->{'roomid'},
                    start          => $body->{'start'},
                    end            => $body->{'end'},
                    blackedout     => $body->{'blackedout'} || 0
                }
            );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);
        }

        $dbh->commit;    # commit transaction
        return $c->render( status => ( defined $booking_id ) ? 200 : 201, openapi => $body );
    }
    catch {
        $dbh->rollback;
        $c->unhandled_exception($_);
    };
}

1;
