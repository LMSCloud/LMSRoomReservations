package Calendar::Helpers::Equipment;

use strict;
use warnings;
use utf8;
use C4::Context;
use Exporter qw(import);
our $VERSION = '1.0.0';
our @EXPORT  = qw(
    load_all_equipment
    get_room_equipment_by_id
    get_all_room_equipment_names_and_ids_available_to_delete
    get_all_room_equipment_names_and_ids
    get_all_room_equipment_names
    delete_equipment
    add_equipment
    load_room_equipment_names_to_edit_by_room_id
    update_room_equipment
);

my $EQUIPMENT_TABLE     = 'booking_equipment';
my $ROOMEQUIPMENT_TABLE = 'booking_room_equipment';

sub load_all_equipment {

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT *
        FROM $EQUIPMENT_TABLE;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @all_available_equipment_names;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @all_available_equipment_names, $row;
    }

    return \@all_available_equipment_names;
}

sub get_room_equipment_by_id {

    my ($selectedRoomId) = @_;

    ## load access to database
    my $dbh = C4::Context->dbh;

    ## database statement handler
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT e.equipmentname
        FROM $EQUIPMENT_TABLE AS e, $ROOMEQUIPMENT_TABLE AS re
        WHERE e.equipmentid = re.equipmentid
        AND re.roomid = $selectedRoomId;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @selectedRoomEquipment;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @selectedRoomEquipment, $row;
    }

    return \@selectedRoomEquipment;
}

sub get_all_room_equipment_names_and_ids_available_to_delete {

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT equipmentid, equipmentname
        FROM $EQUIPMENT_TABLE
        WHERE equipmentid NOT IN
            (SELECT equipmentid FROM $ROOMEQUIPMENT_TABLE)
        ORDER BY equipmentname;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @allEquipmentNamesAndIds;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @allEquipmentNamesAndIds, $row;
    }

    return \@allEquipmentNamesAndIds;
}

sub get_all_room_equipment_names_and_ids {

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT equipmentid, equipmentname
        FROM $EQUIPMENT_TABLE
        ORDER BY equipmentname;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @allEquipmentNamesAndIds;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @allEquipmentNamesAndIds, $row;
    }

    return \@allEquipmentNamesAndIds;
}

sub get_all_room_equipment_names {

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT equipmentname
        FROM $EQUIPMENT_TABLE
        ORDER BY equipmentname;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @allEquipmentNames;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @allEquipmentNames, $row;
    }

    return \@allEquipmentNames;
}

sub delete_equipment {

    my ($equipmentId) = @_;

    my $dbh = C4::Context->dbh;

    $dbh->do("DELETE FROM $EQUIPMENT_TABLE WHERE equipmentid = $equipmentId");

    return;
}

sub add_equipment {

    my ($equipmentname) = @_;

    my $dbh = C4::Context->dbh;

    $dbh->do("INSERT INTO $EQUIPMENT_TABLE (equipmentname) VALUES ($equipmentname);");

    return;
}

## DO NOT USE - causes strange TT software errors
sub load_room_equipment_names_to_edit_by_room_id {

    my ($roomid) = @_;

    ## load access to database
    my $dbh = C4::Context->dbh;

    ## database statement handler
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT e.equipmentname
        FROM $EQUIPMENT_TABLE AS e, $ROOMEQUIPMENT_TABLE AS re
        WHERE re.equipmentid = e.equipmentid
        AND re.roomid = $roomid;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @equipmentNames;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @equipmentNames, $row;
    }

    return \@equipmentNames;
}

sub update_room_equipment {

    my ( $roomid, $equipment ) = @_;

    my $dbh = C4::Context->dbh;

    $dbh->do("DELETE FROM $ROOMEQUIPMENT_TABLE WHERE roomid = $roomid;");

    foreach my $piece (@{ $equipment }) {

        $dbh->do("INSERT INTO $ROOMEQUIPMENT_TABLE (roomid, equipmentid) VALUES ($roomid, $piece);");
    }

    return;
}

1;
