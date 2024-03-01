package Koha::Plugin::Com::LMSCloud::RoomReservations::Checks;

use Modern::Perl;
use utf8;
use 5.010;

use C4::Context ();

use Koha::Patrons ();

use Exporter 'import';
use Readonly         qw( Readonly );
use SQL::Abstract    ();
use Time::Piece      qw( localtime );
use Locale::Messages qw( LC_TIME setlocale );

use Koha::Plugin::Com::LMSCloud::RoomReservations;
use Koha::Plugin::Com::LMSCloud::RoomReservations::State qw(
    get_restricted_patron_categories
);

our $VERSION = '1.0.0';

BEGIN {
    our @EXPORT_OK = qw(
        is_allowed_to_book
        is_bookable_time
        is_open_during_booking_time
        has_conflicting_booking
        has_reached_reservation_limit
        has_passed
    );
}

Readonly my $CONSTANTS => {
    INDEX_SUNDAY_TIME_PIECE_WDAY => -1,
    INDEX_SUNDAY_SCHEMA          => 6,
};

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $BOOKINGS_TABLE   = $self ? $self->get_qualified_table_name('bookings')   : undef;
my $OPEN_HOURS_TABLE = $self ? $self->get_qualified_table_name('open_hours') : undef;
my $ROOMS_TABLE      = $self ? $self->get_qualified_table_name('rooms')      : undef;

sub has_passed {
    my ($start_time) = @_;

    # Parse the start time into a Time::Piece object
    my $parsed_start_time = Time::Piece->strptime( $start_time, '%Y-%m-%dT%H:%M' );

    # Get the current time as a Time::Piece object
    my $current_time = localtime;

    # Return true if the start time is in the past
    return $parsed_start_time < $current_time;
}

sub is_bookable_time {
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
    my $duration    = ( $_end_time - $_start_time )->minutes
        || $self->retrieve_data('default_max_booking_time');

    return $duration <= $max_bookable_time;
}

sub is_open_during_booking_time {
    my ( $roomid, $start_time, $end_time ) = @_;

    # Set the locale of Time::Piece to en_US for the duration of this function call
    my $global_locale = setlocale(LC_TIME);
    setlocale( LC_TIME, 'en_US' );

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # First we need to get the branchcode of the branch the room is located in
    my ( $stmt, @bind ) =
        $sql->select( $ROOMS_TABLE, 'branch', { roomid => $roomid } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my ($branch) = $sth->fetchrow_array;

    # Then we have to find the open hours for the branch on the day of the booking.
    # The wday with index 0 is Monday in the $OPEN_HOURS_TABLE and the _wday method
    # returns index 0 as Sunday so we have to subtract 1 from the _wday result and set
    # the value to 6 if it is -1.
    my $start_wday = ( Time::Piece->strptime( $start_time, '%Y-%m-%dT%H:%M' )->_wday - 1 );
    $start_wday = $start_wday == $CONSTANTS->{'INDEX_SUNDAY_TIME_PIECE_WDAY'} ? $CONSTANTS->{'INDEX_SUNDAY_SCHEMA'} : $start_wday;
    ( $stmt, @bind ) = $sql->select( $OPEN_HOURS_TABLE, [ 'start', 'end' ], { branch => $branch, day => $start_wday } );
    $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my ( $start_hour, $end_hour ) = $sth->fetchrow_array;

    # If both the start and end hours are "00:00:00" then the branch is closed on that day
    # meaning that we return false.
    return 0 if $start_hour eq '00:00:00' and $end_hour eq '00:00:00';

    # Reset the locale of Time::Piece to the original value
    setlocale( LC_TIME, $global_locale );

    # Now we have to use Time::Piece to check if the $start_time's time portion is equal or
    # greater than the $start_hour and if the $end_time's time portion is equal or less than
    # the $end_hour. We normalize the date components to a fixed date for time comparison.
    my $fixed_date    = '1970-01-01';
    my $booking_start = Time::Piece->strptime( "$fixed_date " . Time::Piece->strptime( $start_time, '%Y-%m-%dT%H:%M' )->hms, '%Y-%m-%d %H:%M:%S' );
    my $booking_end   = Time::Piece->strptime( "$fixed_date " . Time::Piece->strptime( $end_time,   '%Y-%m-%dT%H:%M' )->hms, '%Y-%m-%d %H:%M:%S' );
    my $branch_open   = Time::Piece->strptime( "$fixed_date " . Time::Piece->strptime( $start_hour, '%H:%M:%S' )->hms,       '%Y-%m-%d %H:%M:%S' );
    my $branch_close  = Time::Piece->strptime( "$fixed_date " . Time::Piece->strptime( $end_hour,   '%H:%M:%S' )->hms,       '%Y-%m-%d %H:%M:%S' );

    return $booking_start->epoch >= $branch_open->epoch
        && $booking_end->epoch <= $branch_close->epoch;
}

sub has_conflicting_booking {
    my ( $room_id, $start_time, $end_time, $booking_id ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # We have to check if the booking we are trying to create overlaps with
    # any other booking but if it starts on the same minute another booking ends
    # we have to allow it.
    my ( $where, @bind ) = $sql->where(
        {   roomid => $room_id,
            -and   => [
                start => { '<' => $end_time },
                end   => { '>' => $start_time },
            ]
        }
    );

    if ($booking_id) {
        $where .= ' AND bookingid != ?' and push @bind, $booking_id;
    }

    my $check_query = "SELECT COUNT(*) FROM $BOOKINGS_TABLE $where";
    my $check_sth   = $dbh->prepare($check_query);
    $check_sth->execute(@bind);
    my ($conflict_count) = $check_sth->fetchrow_array;

    return $conflict_count > 0;
}

sub has_reached_reservation_limit {
    my ( $borrowernumber, $roomid, $start ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # We have to check the bookings table for bookings with the given borrowernumber.
    # and return 400 if the number of bookings is greater than the absolute_reservation_limit.
    # The bookings we check against have to be on the current day of our locale or in the future.
    my $absolute_reservation_limit = $self->retrieve_data('absolute_reservation_limit');
    if ($absolute_reservation_limit) {
        my ( $stmt, @bind ) = $sql->select(
            $BOOKINGS_TABLE,
            ['COUNT(*)'],
            {   borrowernumber => $borrowernumber,
                start          => { '>=', Time::Piece->new->strftime('%Y-%m-%d') . q{ 00:00:00} }
            }
        );

        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);
        my $bookings_quantity = $sth->fetchrow_array;

        if ( scalar $bookings_quantity >= $absolute_reservation_limit ) {
            return ( 1, __('absolute') );
        }
    }

    # Then we have to check whether the borrowernumber exceeds the daily reservation limit.
    # Therefore we have to check the daily reservation limit against the number of existing
    # bookings for the supplied day.
    my $daily_reservation_limit = $self->retrieve_data('daily_reservation_limit');
    if ($daily_reservation_limit) {
        my ( $stmt, @bind ) = $sql->select(
            $BOOKINGS_TABLE,
            ['COUNT(*)'],
            {   borrowernumber => $borrowernumber,
                start          => { 'like' => Time::Piece->strptime( $start, '%Y-%m-%dT%H:%M' )->strftime('%Y-%m-%d') . q{%} }
            }
        );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);
        my $bookings_quantity = $sth->fetchrow_array;

        if ( scalar $bookings_quantity >= $daily_reservation_limit ) {
            return ( 1, __('daily') );
        }
    }

    return ( 0, undef );
}

sub is_allowed_to_book {
    my ($borrowernumber) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # We have to check whether the borrowernumber is allowed to book the room.
    # Therefore we have to check the roomid against the borrowernumber's categorycode.
    my $patron = Koha::Patrons->find($borrowernumber);
    if ( !$patron ) {
        return 0;
    }

    my $is_allowed = 1;
    foreach my $category ( @{ get_restricted_patron_categories() } ) {
        if ( $category->{'categorycode'} eq $patron->categorycode ) {
            $is_allowed = 0;
            last;
        }
    }

    return $is_allowed;
}

1;
