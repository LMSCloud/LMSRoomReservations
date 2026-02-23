package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Bookings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use File::Basename qw( dirname );
use List::Util     qw( reduce );
use Readonly       qw( Readonly );
use SQL::Abstract  ();
use Time::Piece    ();
use Time::Seconds  qw( ONE_DAY );
use Try::Tiny      qw( catch try );

use Koha::Plugin::Com::LMSCloud::RoomReservations::Checks qw(
    is_allowed_to_book
    is_bookable_time
    is_open_during_booking_time
    has_conflicting_booking
    has_reached_reservation_limit
);
use Koha::Plugin::Com::LMSCloud::RoomReservations::Actions qw(
    send_email_confirmation
);
use Koha::Plugin::Com::LMSCloud::Util::I18N qw( __ );

our $VERSION = '1.0.0';

Readonly my $CONSTANTS => {
    HTTP_OK      => 200,
    HTTP_CREATED => 201,
};

my $i18n = Koha::Plugin::Com::LMSCloud::Util::I18N->new( 'com.lmscloud.roomreservations', dirname(__FILE__) . '/../locales/' );
my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $BOOKINGS_TABLE           = $self ? $self->get_qualified_table_name('bookings')           : undef;
my $BOOKINGS_EQUIPMENT_TABLE = $self ? $self->get_qualified_table_name('bookings_equipment') : undef;
my $EQUIPMENT_TABLE          = $self ? $self->get_qualified_table_name('equipment')          : undef;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $BOOKINGS_TABLE, q{*}, undef, { -asc => 'start' } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $bookings = $sth->fetchall_arrayref( {} );

        # We filter out bookings whose date is in the past by subtracting
        # the date of the booking in seconds from the current date and check
        # whether the delta is smaller than the number of days specified in the
        # remove_past_reservations_after setting multiplied by seconds in one day.
        # If the test passes the booking doesn't lie behind the cutoff date.
        my $cutoff_days = $self->retrieve_data('remove_past_reservations_after') || 0;
        if ( $cutoff_days > 0 ) {
            $bookings = [
                grep {
                    my $booking_date = Time::Piece->strptime( $_->{'start'},         '%Y-%m-%d' );
                    my $cutoff_date  = Time::Piece->strptime( Time::Piece->new->ymd, '%Y-%m-%d' );
                    $cutoff_date->epoch - $booking_date->epoch < $cutoff_days * ONE_DAY;
                } @{$bookings}
            ];
        }

        # We have to extract the equipmentids from the $BOOKINGS_EQUIPMENT_TABLE
        ( $stmt, @bind ) = $sql->select( $BOOKINGS_EQUIPMENT_TABLE, q{*}, );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $bookings_equipment = $sth->fetchall_arrayref( {} );

        # Then we have to get the equipment that's referenced in the bookings
        # and the bookings_equipment table and add it to the bookings.
        ( $stmt, @bind ) = $sql->select( $EQUIPMENT_TABLE, q{*}, { equipmentid => { -in => [ map { $_->{'equipmentid'} } @{$bookings_equipment} ] } } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $equipment = $sth->fetchall_arrayref( {} );

        # Finally we add the equipment that's referenced in the bookings_equipment
        # by its bookingid to the booking itself.
        foreach my $booking ( @{$bookings} ) {
            $booking->{'equipment'} = reduce {
                if ( $b->{'bookingid'} == $booking->{'bookingid'} ) {
                    my ($equipment_obj) = grep { $_->{'equipmentid'} == $b->{'equipmentid'} } @{$equipment};
                    push @{$a}, $equipment_obj;
                }
                return $a;
            } [], @{$bookings_equipment};
        }

        return $c->render( status => 200, openapi => $bookings );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $body = $c->req->json;

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

        my $booking_id = $c->param('booking_id');
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
        my $booking_id = $c->param('booking_id');

        my $body = $c->req->json;

        return _check_and_save_booking( $body, $c, $booking_id );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $booking_id = $c->param('booking_id');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) =
            $sql->select( $BOOKINGS_TABLE, q{*}, { bookingid => $booking_id } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $booking = $sth->fetchrow_hashref();
        if ( !$booking ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        ( $stmt, @bind ) =
            $sql->delete( $BOOKINGS_TABLE, { bookingid => $booking_id } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $start = substr( $booking->{'start'}, 0, 16 );
        $start =~ s/ /T/;
        my $end = substr( $booking->{'end'}, 0, 16 );
        $end =~ s/ /T/;
        send_email_confirmation(
            {   borrowernumber    => $booking->{'borrowernumber'},
                roomid            => $booking->{'roomid'},
                start             => $start,
                end               => $end,
                letter_code       => 'ROOM_CANCELLATION',
                send_confirmation => 1,
            }
        );

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

    return try {
        local $ENV{HTTP_ACCEPT_LANGUAGE} = $c->param('lang');

        my $sql = SQL::Abstract->new;

        if ( !( Time::Piece->strptime( $body->{'start'}, '%Y-%m-%dT%H:%M' )->epoch < Time::Piece->strptime( $body->{'end'}, '%Y-%m-%dT%H:%M' )->epoch ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('End time must be after start time') }
            );
        }

        if ( !is_allowed_to_book( $body->{'borrowernumber'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => $self->retrieve_data('restrict_message') || __('The patron is not allowed to book rooms.') }
            );
        }

        if ( !is_bookable_time( $body->{'roomid'}, $body->{'start'}, $body->{'end'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('The booking exceeds the maximum allowed time for the room.') }
            );
        }

        if ( !is_open_during_booking_time( $body->{'roomid'}, $body->{'start'}, $body->{'end'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('The institution is closed during the selected time frame.') }
            );
        }

        if ( has_conflicting_booking( $body->{'roomid'}, $body->{'start'}, $body->{'end'}, $booking_id ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('There is a conflicting booking.') }
            );
        }

        if ( !$booking_id ) {
            my ( $has_reached_reservation_limit, $message ) =
                has_reached_reservation_limit( $body->{'borrowernumber'}, $body->{'roomid'}, $body->{'start'} );
            if ($has_reached_reservation_limit) {
                return $c->render(
                    status  => 400,
                    openapi => { error => __('The borrower has reached the ') . $message . __(' limit of reservations.') }
                );
            }
        }

        my $booking = {
            borrowernumber => $body->{'borrowernumber'},
            roomid         => $body->{'roomid'},
            start          => $body->{'start'},
            end            => $body->{'end'},
            blackedout     => $body->{'blackedout'} || 0
        };

        my $is_update = defined $booking_id;
        my ( $stmt, @bind ) =
              $is_update
            ? $sql->update( $BOOKINGS_TABLE, $booking, { bookingid => $booking_id } )
            : $sql->insert( $BOOKINGS_TABLE, $booking );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $new_booking_id = $sth->last_insert_id();
        if ($is_update) {

            # Clear existing equipment associations
            ( $stmt, @bind ) = $sql->delete( $BOOKINGS_EQUIPMENT_TABLE, { bookingid => $booking_id } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);
            $new_booking_id = $booking_id;
        }

        if ( defined $body->{'equipment'} && scalar @{ $body->{'equipment'} } > 0 ) {
            foreach my $item ( @{ $body->{'equipment'} } ) {
                ( $stmt, @bind ) = $sql->insert(
                    $BOOKINGS_EQUIPMENT_TABLE,
                    {   bookingid   => $new_booking_id,
                        equipmentid => $item,
                    }
                );
                $sth = $dbh->prepare($stmt);
                $sth->execute(@bind);
            }
        }

        # If all went well, we send an email to the associated borrower
        my $is_sent = send_email_confirmation($body);

        return $c->render(
            status  => defined $booking_id ? $CONSTANTS->{'HTTP_OK'} : $CONSTANTS->{'HTTP_CREATED'},
            openapi => $body
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}
1;
