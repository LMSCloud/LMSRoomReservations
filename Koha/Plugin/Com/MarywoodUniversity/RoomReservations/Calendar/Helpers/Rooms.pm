package Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Rooms;

use 5.010;

use strict;
use warnings;
use utf8;
use C4::Context;
use DateTime;
use Exporter qw(import);
our $VERSION = '1.0.0';
our @EXPORT  = qw(
    get_rooms_with_equipment
    get_room_number_by_id
    is_room_available_at_specified_time
    get_room_availability
    are_any_rooms_available
    get_available_rooms
    load_all_max_capacities
    get_all_room_numbers
    get_room_details_by_id
    get_all_room_numbers_and_ids_available_to_delete
    get_current_room_numbers
    get_all_room_ids
    count_rooms
    delete_room
    add_room
    load_room_details_to_edit_by_room_id
    update_room_details
    are_any_rooms_available_to_delete
);

my $ROOMS_TABLE         = 'booking_rooms';
my $OPENING_HOURS_TABLE = 'booking_opening_hours';
my $BOOKINGS_TABLE      = 'bookings';
my $EQUIPMENT_TABLE     = 'booking_equipment';
my $ROOMEQUIPMENT_TABLE = 'booking_room_equipment';

sub get_rooms_with_equipment {

    ## load access to database
    my $dbh = C4::Context->dbh;

    ## database statement handler
    my $sth_rooms     = q{};
    my $sth_equipment = q{};

    my $rooms_query = <<~"EOF";
        SELECT *
        FROM $ROOMS_TABLE;
    EOF
    my $equipment_query = q{};

    $sth_rooms = $dbh->prepare($rooms_query);
    $sth_rooms->execute();

    my @rooms_with_equipment;

    while ( my $rooms_row = $sth_rooms->fetchrow_hashref() ) {
        my $roomid = $rooms_row->{'roomid'};

        $equipment_query = <<~"EOF";
            SELECT equipmentname
            FROM $EQUIPMENT_TABLE AS equipment
            LEFT JOIN $ROOMEQUIPMENT_TABLE as roomequipment ON equipment.equipmentid = roomequipment.equipmentid
            LEFT JOIN $ROOMS_TABLE AS room ON roomequipment.roomid = room.roomid
            WHERE room.roomid = $roomid;
        EOF

        $sth_equipment = $dbh->prepare($equipment_query);
        $sth_equipment->execute();

        my @equipment;
        while ( my $equipment_row = $sth_equipment->fetchrow_hashref() ) {
            push @equipment, $equipment_row;
        }

        $rooms_row->{'equipment'} = \@equipment;
        push @rooms_with_equipment, $rooms_row;
    }

    return \@rooms_with_equipment;
}

sub get_room_number_by_id {

    my ($roomid) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT roomnumber
        FROM $ROOMS_TABLE
        WHERE roomid = $roomid;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @room_number_from_id;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @room_number_from_id, $row;
    }

    return \@room_number_from_id;
}

sub is_room_available_at_specified_time {
    my ($datetime) = @_;
    my $result     = 0;
    my $dbh        = C4::Context->dbh;
    my $sth        = q{};
    my $weekday    = $datetime->day_of_week;

    my $query = <<~"EOF";
        SELECT start, end
        FROM $OPENING_HOURS_TABLE
        WHERE day = $weekday;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @opening_hours;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @opening_hours, $row;
    }

    foreach my $opening_hour (@opening_hours) {
        my @times    = split /:/smx, $opening_hour->{'start'};
        my $dt_start = DateTime->new(
            year   => $datetime->year,
            month  => $datetime->month,
            day    => $datetime->day,
            hour   => $times[0],
            minute => $times[1],
        );

        @times = split /:/smx, $opening_hour->{'end'};
        my $dt_end = DateTime->new(
            year   => $datetime->year,
            month  => $datetime->month,
            day    => $datetime->day,
            hour   => $times[0],
            minute => $times[1],
        );

        if ( DateTime->compare( $datetime, $dt_start ) >= 0 && DateTime->compare( $datetime, $dt_end ) <= 0 ) { $result = 1; last; }
    }

    return $result;
}

sub get_room_availability {

    my ( $room_id, $start, $end ) = @_;

    # check if start and end time are in opening hours
    if ( is_room_available_at_specified_time($start) == 0 || is_room_available_at_specified_time($end) == 0 ) { return 0; }

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT roomid
        FROM $BOOKINGS_TABLE
        WHERE
        \'$end\' > start AND \'$start\' < end AND roomid = \'$room_id\';
    EOF

    $sth = $dbh->prepare($query);
    my $count = $sth->execute();

    $count != 0 ? return 0 : return 1;

    return;
}

sub are_any_rooms_available {

    my ($rooms) = @_;

    if ( @{$rooms} > 0 ) {
        return 1;
    }
    else {
        return 0;
    }
}

sub get_available_rooms {

    my ( $start, $end, $capacity, $equipment ) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT *
        FROM $ROOMS_TABLE
        WHERE maxcapacity = $capacity
        AND roomid NOT IN
            (SELECT roomid
            FROM $BOOKINGS_TABLE
            WHERE
            \'$end\' > start AND \'$start\' < end)
    EOF

    # if dereferenced array ref has zero elements (length evaluated in scalar context)
    if ( @{$equipment} > 0 ) {

        # counts number of elements
        my $total_elements = scalar @{$equipment};

        $query .= <<~"EOF";
            AND roomid IN 
                (SELECT roomid
                FROM $ROOMEQUIPMENT_TABLE
                WHERE
        EOF

        foreach my $piece ( @{$equipment} ) {
            if ( --$total_elements == 0 ) {
                $query .= " equipmentid = $piece)";
            }
            else {
                $query .= " equipmentid = $piece AND";
            }

            $total_elements--;
        }
    }

    $query .= ' GROUP BY roomnumber;';

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @all_available_rooms;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @all_available_rooms, $row;
    }

    return \@all_available_rooms;
}

sub load_all_max_capacities {

    ## load access to database
    my $dbh = C4::Context->dbh;

    ## database statement handler
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT DISTINCT maxcapacity
        FROM $ROOMS_TABLE;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @all_max_capacities;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @all_max_capacities, $row;
    }

    return \@all_max_capacities;
}

## Used in display-rooms
## Returns an array
## Key: roomnumber
## Value: maxcapacity
sub get_all_room_numbers {

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = q{};

    ## room selection query
    $query = "SELECT * FROM $ROOMS_TABLE;";

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @all_rooms;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @all_rooms, $row;
    }

    return \@all_rooms;
}

sub get_room_details_by_id {

    my ($selected_room_id) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    ## Note: GROUP BY is used to prevent duplication of rows in next step
    my $query = <<~"EOF";
        SELECT r.roomnumber, r.maxcapacity, r.description, r.color, r.branch, e.equipmentname
        FROM $ROOMS_TABLE AS r, $EQUIPMENT_TABLE AS e, $ROOMEQUIPMENT_TABLE AS re
        WHERE r.roomid = re.roomid
        AND   e.equipmentid = re.equipmentid
        AND r.roomid = $selected_room_id
        GROUP BY r.roomnumber;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @selected_room_details;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @selected_room_details, $row;
    }

    return \@selected_room_details;
}

sub get_all_room_numbers_and_ids_available_to_delete {

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT roomid, roomnumber
        FROM $ROOMS_TABLE
        WHERE roomid NOT IN
            (SELECT roomid FROM $BOOKINGS_TABLE)
        ORDER BY roomid;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @all_room_numbers_and_ids;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @all_room_numbers_and_ids, $row;
    }

    return \@all_room_numbers_and_ids;
}

sub get_current_room_numbers {

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT roomid, roomnumber
        FROM $ROOMS_TABLE
        ORDER BY roomnumber;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @all_room_numbers;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @all_room_numbers, $row;
    }

    return \@all_room_numbers;
}

sub get_all_room_ids {

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT roomid
        FROM $ROOMS_TABLE
        ORDER BY roomid;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @all_room_ids;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @all_room_ids, $row;
    }

    return \@all_room_ids;
}

sub count_rooms {

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT COUNT(roomid) AS count
        FROM $ROOMS_TABLE;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my $row = $sth->fetchrow_hashref();

    my $count = $row->{'count'};

    return $count;
}

sub delete_room {

    my ($roomId) = @_;

    my $dbh = C4::Context->dbh;

    $dbh->do("DELETE FROM $ROOMEQUIPMENT_TABLE WHERE roomid = $roomId");

    $dbh->do("DELETE FROM $ROOMS_TABLE WHERE roomid = $roomId");

    return;
}

sub add_room {

    # roomnumber, maxcapacity, description, color, image, equipment
    my ($args) = @_;

    ## make $roomnumber SQL-friendly by surrounding with single quotes
    my $roomnumber  = qq{'$args->{'roomnumber'}'};
    my $description = qq{'$args->{'description'}'};
    my $color       = qq{'$args->{'color'}'};
    my $image       = qq{'$args->{'image'}'};
    my $branch      = qq{'$args->{'branch'}'};

    my $dbh = C4::Context->dbh;

    ## first insert roomnumber and maxcapacity into $ROOMS_TABLE
    $dbh->do(
        <<~"EOF"
            INSERT IGNORE INTO $ROOMS_TABLE (roomnumber, maxcapacity, description, color, image, branch)
            VALUES ($roomnumber, $args->{'maxcapacity'}, $description, $color, $image, $branch);
        EOF
    );

    foreach my $piece ( @{ $args->{'selected_equipment'} } ) {
        $dbh->do(
            <<~"EOF"
                INSERT IGNORE INTO $ROOMEQUIPMENT_TABLE (roomid, equipmentid)
                VALUES ((SELECT roomid FROM $ROOMS_TABLE WHERE roomnumber = $roomnumber), $piece);
            EOF
        );
    }

    return;
}

sub load_room_details_to_edit_by_room_id {

    my ($roomid) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT *
        FROM $ROOMS_TABLE
        WHERE roomid = $roomid;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @room_details;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @room_details, $row;
    }

    return \@room_details;
}

sub update_room_details {

    # roomid, roomnumber, description, maxcapacity, color, image
    my ($args) = @_;

    my $roomnumber  = qq{'$args->{'updated_room_number'}'};
    my $description = qq{'$args->{'updated_description'}'};
    my $color       = qq{'$args->{'updated_color'}'};
    my $image       = qq{'$args->{'updated_image'}'};
    my $branch      = qq{'$args->{'updated_branch'}'};

    ## load access to database
    my $dbh = C4::Context->dbh;

    my $query = <<~"EOF";
        UPDATE $ROOMS_TABLE
        SET roomnumber = $roomnumber, maxcapacity = $args->{'updated_max_capacity'}, description = $description, color = $color, image = $image, branch = $branch
        WHERE roomid = $args->{'room_id_to_update'};
    EOF

    $dbh->do($query);

    return;
}

sub are_any_rooms_available_to_delete {

    my ($rooms) = @_;

    if ( @{$rooms} > 0 ) {
        return 1;
    }
    else {
        return 0;
    }
}
1;
