package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Bookings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use File::Basename qw( dirname );
use Readonly       qw( Readonly );
use SQL::Abstract  ();
use Try::Tiny      qw( catch try );

use Koha::Plugin::Com::LMSCloud::RoomReservations::Checks qw(
    is_allowed_to_book
    is_bookable_time
    is_open_during_booking_time
    has_conflicting_booking
    has_reached_reservation_limit
    has_passed
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

my $i18n = Koha::Plugin::Com::LMSCloud::Util::I18N->new( 'com.lmscloud.roomreservations', dirname(__FILE__) . '/../../locales/' );
my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $BOOKINGS_TABLE           = $self ? $self->get_qualified_table_name('bookings')           : undef;
my $BOOKINGS_EQUIPMENT_TABLE = $self ? $self->get_qualified_table_name('bookings_equipment') : undef;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $BOOKINGS_TABLE, [ 'roomid', 'start', 'end', 'blackedout' ] );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

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
        my $body = $c->req->json;

        if ( $body->{'borrowernumber'} eq q{} ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('You need to login first to book rooms.') }
            );
        }

        return _check_and_save_booking( $body, $c );
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

        if ( !is_allowed_to_book( $body->{'borrowernumber'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => $self->retrieve_data('restrict_message') || __('You are not allowed to book rooms') }
            );
        }

        if ( has_passed( $body->{'start'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('A booking cannot be scheduled for a past date.') }
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

        my ( $has_reached_reservation_limit, $message ) =
            has_reached_reservation_limit( $body->{'borrowernumber'}, $body->{'roomid'}, $body->{'start'} );
        if ($has_reached_reservation_limit) {
            return $c->render(
                status  => 400,
                openapi => { error => __('You have reached the ') . $message . __(' limit of reservations.') }
            );
        }

        my $booking = {
            borrowernumber => $body->{'borrowernumber'},
            roomid         => $body->{'roomid'},
            start          => $body->{'start'},
            end            => $body->{'end'},
            blackedout     => 0
        };

        if ( $body->{'purpose_of_use'} ) {
            $booking->{'purpose_of_use'} = $body->{'purpose_of_use'};
        }

        my ( $stmt, @bind ) =
            defined $booking_id
            ? $sql->update( $BOOKINGS_TABLE, $booking, { bookingid => $booking_id } )
            : $sql->insert( $BOOKINGS_TABLE, $booking );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $new_booking_id = $sth->last_insert_id();
        if ( defined $body->{'equipment'} && scalar $body->{'equipment'} > 0 ) {
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
        # or force email confirmation if setting is the enforce_email_notification
        # is enabled.
        my $enforce_email = $self->retrieve_data('enforce_email_notification');
        if ($enforce_email) {
            $body->{'send_confirmation'} = 1;
        }
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
