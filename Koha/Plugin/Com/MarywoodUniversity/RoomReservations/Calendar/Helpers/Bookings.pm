package Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Bookings;

use 5.010;

use strict;
use warnings;
use utf8;
use C4::Context;
use C4::Letters;
use Exporter qw(import);
use Time::Piece;
use Koha::Patrons;

our $VERSION = '1.0.0';
our @EXPORT  = qw(
    pre_booking_availability_check
    add_booking
    delete_booking_by_id
    add_blackout_booking
    get_all_blackout_bookings
    get_all_bookings
    get_booking_by_id
    update_booking_by_id
);

my $ROOMS_TABLE              = 'booking_rooms';
my $BOOKINGS_TABLE           = 'bookings';
my $BOOKINGS_EQUIPMENT_TABLE = 'booking_bookings_equipment';

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

    my ( $borrowernumber, $roomid, $start, $end, @equipment ) = @_;

    my $timestamp = localtime->strftime('%Y-%m-%d %H:%M:%S');
    my $dbh       = C4::Context->dbh;
    my $sth       = q{};

    my $statement = <<~"EOF";
        INSERT INTO $BOOKINGS_TABLE (borrowernumber, roomid, start, end, created)
        VALUES ($borrowernumber, $roomid, '$start', '$end', '$timestamp');
    EOF

    $sth = $dbh->prepare($statement);
    $sth->execute();

    my $query_for_last_inserted_id = qq{SELECT bookingid FROM $BOOKINGS_TABLE WHERE created = ?;};
    $sth = $dbh->prepare($query_for_last_inserted_id);
    $sth->execute($timestamp);

    my $last_inserted_row = $sth->fetchrow_hashref();
    my $last_insert_id    = $last_inserted_row->{'bookingid'};

    for my $item (@equipment) {
        my $statement_insert_item = <<~"EOF";
            INSERT INTO $BOOKINGS_EQUIPMENT_TABLE (bookingid, equipmentid)
            VALUES (?, ?);
        EOF

        $sth = $dbh->prepare($statement_insert_item);
        $sth->execute( $last_insert_id, $item );
    }

    return;
}

sub delete_booking_by_id {

    my ($booking_id) = @_;

    my $dbh = C4::Context->dbh;

    my $sth_query     = q{};
    my $sth_statement = q{};

    my $query = <<~"EOF";
        SELECT b.borrowernumber, r.roomnumber,
        DATE_FORMAT(b.start, '%d.%m.%Y %H:%i') AS start, DATE_FORMAT(b.end, '%d.%m.%Y %H:%i') AS end
        FROM $BOOKINGS_TABLE b, $ROOMS_TABLE r
        WHERE b.roomid = r.roomid
        AND b.bookingid = ?;
    EOF
    my $statement = qq{DELETE FROM $BOOKINGS_TABLE WHERE bookingid = ?;};

    $sth_query = $dbh->prepare($query);
    $sth_query->execute($booking_id);

    my @bookings;
    while ( my $row = $sth_query->fetchrow_hashref() ) {
        push @bookings, $row;
    }

    my $booking = shift @bookings;

    $sth_statement = $dbh->prepare($statement);
    my $count = $sth_statement->execute($booking_id);

    if ( $count == 0 ) {    # no row(s) affected
        return 0;
    }
    else {                  # sucessfully deleted row(s)
        my $patron = Koha::Patrons->find( $booking->{'borrowernumber'} );
        my $letter = C4::Letters::GetPreparedLetter(
            module                 => 'members',
            letter_code            => 'ROOM_CANCELLATION',
            lang                   => $patron->lang,
            message_transport_type => 'email',
            substitute             => {
                room => $booking->{'roomnumber'},
                from => $booking->{'start'},
                to   => $booking->{'end'},
            },
        );

        my @message_ids;
        push @message_ids,
            C4::Letters::EnqueueLetter(
            {   letter                 => $letter,
                borrowernumber         => $booking->{'borrowernumber'},
                branchcode             => $patron->branchcode,
                message_transport_type => 'email',
            }
            );

        if ( C4::Context->preference('ReplytoDefault') ) {
            push @message_ids,
                C4::Letters::EnqueueLetter(
                {   letter                 => $letter,
                    to_address             => C4::Context->preference('ReplytoDefault'),
                    branchcode             => $patron->branchcode,
                    message_transport_type => 'email',
                }
                );
        }

        for my $message_id (@message_ids) {
            C4::Letters::SendQueuedMessages( { message_id => $message_id } );
        }
        return 1;
    }
}

sub add_blackout_booking {

    my ( $borrowernumber, $roomid, $start, $end ) = @_;
    my $timestamp = localtime->strftime('%Y-%m-%d %H:%M:%S');

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my @statements = (
        <<~"EOF",
            INSERT INTO $BOOKINGS_TABLE (borrowernumber, roomid, start, end, blackedout, created)
            VALUES ($borrowernumber, $roomid, '$start', '$end', 1, '$timestamp');
        EOF
    );

    for my $statement (@statements) {
        $sth = $dbh->prepare($statement);
        $sth->execute();
    }

    return;
}

sub get_all_blackout_bookings {

    my $dbh = C4::Context->dbh;

    my $sth = q{};

    my $query = <<~"EOF";
        SELECT bk.bookingid, r.roomnumber,
        DATE_FORMAT(bk.start, '%d.%m.%Y %H:%i') AS start, DATE_FORMAT(bk.end, '%d.%m.%Y %H:%i') AS end
        FROM $BOOKINGS_TABLE bk, $ROOMS_TABLE r
        WHERE bk.roomid = r.roomid
        AND bk.blackedout = 1
        ORDER BY bk.start ASC;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @all_blackedout_bookings;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @all_blackedout_bookings, $row;
    }

    return \@all_blackedout_bookings;
}

sub get_all_bookings {

    my $dbh = C4::Context->dbh;

    my $sth = q{};

    my $query = <<~"EOF";
        SELECT bk.bookingid, r.roomnumber, b.firstname, b.surname,
        DATE_FORMAT(bk.start, \"%d.%m.%Y %H:%i\") AS start, DATE_FORMAT(bk.end, \"%d.%m.%Y %H:%i \") AS end
        FROM borrowers b, $BOOKINGS_TABLE bk, $ROOMS_TABLE r
        WHERE b.borrowernumber = bk.borrowernumber
        AND bk.roomid = r.roomid
        ORDER BY r.roomnumber ASC, bk.start ASC;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @all_bookings;
    while ( my $row = $sth->fetchrow_hashref() ) {
        push @all_bookings, $row;
    }

    my $query_booked_equipment = qq{SELECT * FROM $BOOKINGS_EQUIPMENT_TABLE;};

    $sth = $dbh->prepare($query_booked_equipment);
    $sth->execute();

    my @booked_equipment;
    while ( my $row = $sth->fetchrow_hashref() ) {
        push @booked_equipment, $row;
    }

    my $booked_equipment_by_id = {};
    for my $booked_item (@booked_equipment) {
        if ( !( exists $booked_equipment_by_id->{ $booked_item->{'bookingid'} } ) ) {
            $booked_equipment_by_id->{ $booked_item->{'bookingid'} } = [ $booked_item->{'equipmentid'} ];
        }
        else {
            push @{ $booked_equipment_by_id->{ $booked_item->{'bookingid'} } }, $booked_item->{'equipmentid'};
        }
    }

    for my $booking (@all_bookings) {
        if ( exists $booked_equipment_by_id->{ $booking->{'bookingid'} } ) {
            $booking->{'equipment'} = $booked_equipment_by_id->{ $booking->{'bookingid'} };
        }
    }

    return \@all_bookings;
}

sub get_booking_by_id {

    my ($selected_booking_id) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT *
        FROM $BOOKINGS_TABLE
        WHERE bookingid = ?;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute($selected_booking_id);

    my $row = $sth->fetchrow_hashref();

    return \$row;

}

sub update_booking_by_id {

    my ($args) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $booking_update = <<~"EOF";
        UPDATE $BOOKINGS_TABLE
        SET roomid = ?, start = ?, end = ?
        WHERE bookingid = ?;
    EOF

    $sth = $dbh->prepare($booking_update);
    $sth->execute( $args->{'roomid'}, $args->{'start'}, $args->{'end'}, $args->{'bookingid'} );

    return 1;

}

1;
