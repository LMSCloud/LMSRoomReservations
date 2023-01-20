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

my $BOOKINGS_TABLE           = $self ? $self->get_qualified_table_name('bookings')           : undef;
my $OPEN_HOURS_TABLE         = $self ? $self->get_qualified_table_name('open_hours')         : undef;
my $ROOMS_TABLE              = $self ? $self->get_qualified_table_name('rooms')              : undef;
my $BOOKINGS_EQUIPMENT_TABLE = $self ? $self->get_qualified_table_name('bookings_equipment') : undef;

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
        my $booking_id = $c->validation->param('booking_id');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->delete( $BOOKINGS_TABLE, { bookingid => $booking_id } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render(
            status  => 204,
            openapi => q{},
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub _check_and_save_booking {
    my ( $body, $c, $booking_id ) = @_;

    my $dbh = C4::Context->dbh;
    $dbh->begin_work;    # start transaction

    my $sql = SQL::Abstract->new;

    if ( !_is_bookable_time( $body->{'roomid'}, $body->{'start'}, $body->{'end'} ) ) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => 'The booking exceeds the maximum allowed time for the room.' } );
    }

    if ( !_is_open_during_booking_time( $body->{'start'}, $body->{'end'} ) ) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => 'The institution is closed during the selected time frame.' } );
    }

    if ( _has_conflicting_booking( $body->{'roomid'}, $body->{'start'}, $body->{'end'}, $booking_id ) ) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => 'There is a conflicting booking.' } );
    }

    try {
        my $booking = {
            borrowernumber => $body->{'borrowernumber'},
            roomid         => $body->{'roomid'},
            start          => $body->{'start'},
            end            => $body->{'end'},
            blackedout     => $body->{'blackedout'} || 0
        };

        my ( $stmt, @bind ) =
            defined $booking_id
            ? $sql->update( $BOOKINGS_TABLE, $booking, { bookingid => $booking_id } )
            : $sql->insert( $BOOKINGS_TABLE, $booking );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $new_booking_id = $sth->last_insert_id();
        if ( defined $body->{'equipment'} && scalar $body->{'equipment'} > 0 ) {
            foreach my $item ( @{ $body->{'equipment'} } ) {
                my ( $stmt, @bind ) = $sql->insert(
                    $BOOKINGS_EQUIPMENT_TABLE,
                    {   bookingid   => $new_booking_id,
                        equipmentid => $item,
                    }
                );
                my $sth = $dbh->prepare($stmt);
                $sth->execute(@bind);
            }
        }

        $dbh->commit;    # commit transaction
        return $c->render( status => defined $booking_id ? 200 : 201, openapi => $body );
    }
    catch {
        $dbh->rollback;
        $c->unhandled_exception($_);
    };
}

sub _is_bookable_time {
    my ( $room_id, $start_time, $end_time ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # Get the maxbookabletime for the room
    my ( $where, @bind ) = $sql->where( { roomid => $room_id } );
    my $room_query = "SELECT maxbookabletime FROM $ROOMS_TABLE $where";
    my $room_sth   = $dbh->prepare($room_query);
    $room_sth->execute(@bind);
    my ($max_bookable_time) = $room_sth->fetchrow_array;

    # Check if the difference between start and end times exceeds the maxbookabletime
    my $_start_time = Time::Piece->strptime( $start_time, '%Y-%m-%dT%H:%M' );
    my $_end_time   = Time::Piece->strptime( $end_time,   '%Y-%m-%dT%H:%M' );
    my $duration    = ( $_end_time - $_start_time )->minutes || $self->retrieve_data('default_max_booking_time');

    return $duration <= $max_bookable_time;
}

sub _is_open_during_booking_time {
    my ( $start_time, $end_time ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # Time::Piece starts weeks on Sundays. To get around that, we use the wday method and
    # subtract one from the return value (1 = Sunday, 1..7) and pick the respective entry
    # from the conversion array to stay in the german/european notation.
    use constant {
        MONDAY    => 0,
        TUESDAY   => 1,
        WEDNESDAY => 2,
        THURSDAY  => 3,
        FRIDAY    => 4,
        SATURDAY  => 5,
        SUNDAY    => 6,
    };
    my @wday_conversion_arr = ( SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY );
    my ( $where, @bind ) = $sql->where(
        {   -and => [
                day   => $wday_conversion_arr[ Time::Piece->strptime( $start_time, '%Y-%m-%dT%H:%M' )->wday - 1 ],
                start => { '<=' => Time::Piece->strptime( $end_time,   '%Y-%m-%dT%H:%M' )->hms },
                end   => { '>=' => Time::Piece->strptime( $start_time, '%Y-%m-%dT%H:%M' )->hms },
            ]
        }
    );
    my $open_hours_query = "SELECT COUNT(*) FROM $OPEN_HOURS_TABLE $where";
    my $open_hours_sth   = $dbh->prepare($open_hours_query);
    $open_hours_sth->execute(@bind);
    my ($open_hours_count) = $open_hours_sth->fetchrow_array;

    return $open_hours_count > 0;
}

sub _has_conflicting_booking {
    my ( $room_id, $start_time, $end_time, $booking_id ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    my ( $where, @bind ) = $sql->where(
        {   roomid => $room_id,
            -and   => [
                start => { '<=' => $end_time },
                end   => { '>=' => $start_time },
            ]
        }
    );
    $where .= ' AND bookingid != ?' and push @bind, $booking_id if $booking_id;
    my $check_query = "SELECT COUNT(*) FROM $BOOKINGS_TABLE $where";
    my $check_sth   = $dbh->prepare($check_query);
    $check_sth->execute(@bind);
    my ($conflict_count) = $check_sth->fetchrow_array;

    return $conflict_count > 0;
}

1;
