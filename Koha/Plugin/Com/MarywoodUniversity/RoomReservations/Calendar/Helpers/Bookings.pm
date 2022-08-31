package Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Bookings;

use strict;
use warnings;
use utf8;
use C4::Context;
use Exporter qw(import);

our $VERSION = '1.0.0';
our @EXPORT  = qw(
    pre_booking_availability_check
    add_booking
    delete_booking_by_id
    add_blackout_booking
    get_all_blackout_bookings
    get_all_bookings
);

my $ROOMS_TABLE    = 'booking_rooms';
my $BOOKINGS_TABLE = 'bookings';

sub pre_booking_availability_check {
    my ( $roomid, $start, $end ) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT COUNT(*)
        FROM $BOOKINGS_TABLE
        WHERE roomid = $roomid
        AND \'$end\' > start
        AND \'$start\' < end;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my ($count) = $sth->fetchrow_array();

    if ( $count > 0 ) {    # a conflicting booking was found
        return 0;
    }
    else {                 # no conflict found
        return 1;
    }
}

sub add_booking {

    my ( $borrowernumber, $roomid, $start, $end ) = @_;

    my $dbh = C4::Context->dbh;

    my $statement = <<~"EOF";
        INSERT INTO $BOOKINGS_TABLE (borrowernumber, roomid, start, end)
        VALUES ($borrowernumber, $roomid, '$start', '$end');
    EOF

    $dbh->do($statement);

    return;
}

sub delete_booking_by_id {

    my ($bookingId) = @_;

    my $dbh = C4::Context->dbh;

    my $sth = q{};

    my $query = qq{DELETE FROM bookings WHERE bookingid = $bookingId;};

    $sth = $dbh->prepare($query);

    my $count = $sth->execute();

    if ( $count == 0 ) {    # no row(s) affected
        return 0;
    }
    else {                  # sucessfully deleted row(s)
        return 1;
    }
}

sub add_blackout_booking {

    my ( $borrowernumber, $roomid, $start, $end ) = @_;

    my $dbh = C4::Context->dbh;

    my $statement = <<~"EOF";
        INSERT INTO $BOOKINGS_TABLE (borrowernumber, roomid, start, end, blackedout)
        VALUES ($borrowernumber, $roomid, '$start', '$end', 1);
    EOF

    $dbh->do($statement);

    return;
}

sub get_all_blackout_bookings {

    my $dbh = C4::Context->dbh;

    my $sth = q{};

    my $query = <<~"EOF";
        SELECT bk.bookingid, r.roomnumber, DATE_FORMAT(bk.start, '%d.%m.%Y %H:%i') AS start, DATE_FORMAT(bk.end, '%d.%m.%Y %H:%i') AS end
        FROM $BOOKINGS_TABLE bk, $ROOMS_TABLE r
        WHERE bk.roomid = r.roomid
        AND bk.blackedout = 1
        ORDER BY bk.start ASC;
    EOF

    # AND bk.start BETWEEN CAST(CONCAT(CURDATE(), ' 00:00:00') AS DATETIME) AND CAST(CONCAT(DATE_ADD(CURDATE(), INTERVAL 30 DAY), ' 23:59:59') AS DATETIME)

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @allBlackedoutBookings;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @allBlackedoutBookings, $row;
    }

    return \@allBlackedoutBookings;
}

sub get_all_bookings {

    my $dbh = C4::Context->dbh;

    my $sth = q{};

    my $query = <<~"EOF";
        SELECT bk.bookingid, r.roomnumber, b.firstname, b.surname, DATE_FORMAT(bk.start, \"%d.%m.%Y %H:%i\") AS start, DATE_FORMAT(bk.end, \"%d.%m.%Y %H:%i \") AS end
        FROM borrowers b, $BOOKINGS_TABLE bk, $ROOMS_TABLE r
        WHERE b.borrowernumber = bk.borrowernumber
        AND bk.roomid = r.roomid
        ORDER BY bk.roomid ASC, bk.start DESC;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @allBookings;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @allBookings, $row;
    }

    return \@allBookings;
}

1;
