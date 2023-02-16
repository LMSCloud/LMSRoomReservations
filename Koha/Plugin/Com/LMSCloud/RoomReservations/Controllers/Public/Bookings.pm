package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Bookings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use Try::Tiny;
use JSON;
use SQL::Abstract;
use Time::Piece;
use Locale::TextDomain ( 'com.lmscloud.roomreservations', undef );
use Locale::Messages qw(:locale_h :libintl_h bind_textdomain_filter);
use POSIX qw(setlocale);
use Encode;

use C4::Context;
use C4::Letters;
use Koha::Patrons;
use Koha::Plugin::Com::LMSCloud::RoomReservations::Lib::Checks qw(
    is_allowed_to_book
    is_bookable_time
    is_open_during_booking_time
    has_conflicting_booking
    has_reached_reservation_limit
);
use Koha::Plugin::Com::LMSCloud::RoomReservations::Lib::Actions qw( send_email_confirmation );

our $VERSION = '1.0.0';

my $self = undef;
if ( Koha::Plugin::Com::LMSCloud::RoomReservations->can('new') ) {
    $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();
    my $locale = C4::Context->preference('language');
    $ENV{LANGUAGE}       = length $locale > 2 ? substr( $locale, 0, 2 ) : $locale;
    $ENV{OUTPUT_CHARSET} = 'UTF-8';

    setlocale Locale::Messages::LC_MESSAGES(), q{};
    textdomain 'com.lmscloud.roomreservations';
    bind_textdomain_filter 'com.lmscloud.roomreservations', \&Encode::decode_utf8;
    bindtextdomain 'com.lmscloud.roomreservations' => $self->bundle_path . '/locales/';
}

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
        my $json = $c->req->body;
        my $body = from_json($json);

        if ( $body->{'borrowernumber'} eq q{} ) {
            return $c->render( status => 400, openapi => { error => __('You need to login first to book rooms.') } );
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
    $dbh->begin_work;    # start transaction

    my $sql = SQL::Abstract->new;

    if ( !is_allowed_to_book( $body->{'borrowernumber'} ) ) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => $self->retrieve_data('restrict_message') || __('You are not allowed to book rooms') } );
    }

    if ( !is_bookable_time( $body->{'roomid'}, $body->{'start'}, $body->{'end'} ) ) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => __('The booking exceeds the maximum allowed time for the room.') } );
    }

    if ( !is_open_during_booking_time( $body->{'start'}, $body->{'end'} ) ) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => __('The institution is closed during the selected time frame.') } );
    }

    if ( has_conflicting_booking( $body->{'roomid'}, $body->{'start'}, $body->{'end'}, $booking_id ) ) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => __('There is a conflicting booking.') } );
    }

    my ( $has_reached_reservation_limit, $message ) = has_reached_reservation_limit( $body->{'borrowernumber'}, $body->{'roomid'}, $body->{'start'} );
    if ($has_reached_reservation_limit) {
        $dbh->rollback;    # rollback transaction
        return $c->render( status => 400, openapi => { error => __('You have reached the ') . $message . __(' limit of reservations.') } );
    }

    try {
        my $booking = {
            borrowernumber => $body->{'borrowernumber'},
            roomid         => $body->{'roomid'},
            start          => $body->{'start'},
            end            => $body->{'end'},
            blackedout     => 0
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

        $dbh->commit;    # commit transaction

        # If all went well, we send an email to the associated borrower
        my $is_sent = send_email_confirmation($body);

        return $c->render( status => defined $booking_id ? 200 : 201, openapi => $body );
    }
    catch {
        $dbh->rollback;
        $c->unhandled_exception($_);
    };

}

1;
