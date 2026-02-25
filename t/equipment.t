#!/usr/bin/env perl

use Modern::Perl;

use Test::More tests => 5;
use Test::Mojo;

use FindBin qw( $Bin );
use lib "$Bin/lib";

use t::lib::TestBuilder;
use t::lib::Mocks;

use Koha::Database;

use TestHelper;

my $schema  = Koha::Database->new->schema;
my $builder = t::lib::TestBuilder->new;

my $t = Test::Mojo->new('Koha::REST::V1');
t::lib::Mocks::mock_preference( 'RESTBasicAuth', 1 );

TestHelper::setup_tables();

my $password = 'thePassword123';
my $patron   = $builder->build_object(
    {   class => 'Koha::Patrons',
        value => { flags => 536870911 }
    }
);
$patron->set_password( { password => $password, skip_validation => 1 } );
my $userid = $patron->userid;

my $library = $builder->build_object( { class => 'Koha::Libraries' } );
my $branch  = $library->branchcode;

my $base_url = "//$userid:$password@/api/v1/contrib/roomreservations";

subtest 'list equipment' => sub {
    plan tests => 6;
    $schema->storage->txn_begin;

    $t->get_ok("$base_url/equipment")
      ->status_is(200)
      ->json_is( [] );

    my $room = TestHelper::insert_room(
        roomnumber  => 'EQ-R1',
        maxcapacity => 10,
        color       => '#aabbcc',
        description => 'Test room',
        branch      => $branch,
    );

    my $equip = TestHelper::insert_equipment( equipmentname => 'Projector' );
    TestHelper::insert_rooms_equipment(
        roomid      => $room->{roomid},
        equipmentid => $equip->{equipmentid},
    );

    $t->get_ok("$base_url/equipment")
      ->status_is(200)
      ->json_has('/0/equipmentname');

    $schema->storage->txn_rollback;
};

subtest 'add equipment' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    $t->post_ok( "$base_url/equipment" => json => {
        equipmentname => 'Whiteboard',
    } )->status_is(201)
      ->json_is( '/equipmentname' => 'Whiteboard' );

    # equipmentname too long (>20 chars)
    $t->post_ok( "$base_url/equipment" => json => {
        equipmentname => 'A' x 21,
    } )->status_is(400);

    $schema->storage->txn_rollback;
};

subtest 'get equipment' => sub {
    plan tests => 6;
    $schema->storage->txn_begin;

    my $room = TestHelper::insert_room(
        roomnumber  => 'EQ-R2',
        maxcapacity => 5,
        color       => '#112233',
        description => 'Test room',
        branch      => $branch,
    );

    my $equip = TestHelper::insert_equipment( equipmentname => 'Mic' );
    TestHelper::insert_rooms_equipment(
        roomid      => $room->{roomid},
        equipmentid => $equip->{equipmentid},
    );

    $t->get_ok("$base_url/equipment/$equip->{equipmentid}")
      ->status_is(200)
      ->json_is( '/equipmentname' => 'Mic' )
      ->json_is( '/roomid' => $room->{roomid} );

    $t->get_ok("$base_url/equipment/999999")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'update equipment' => sub {
    plan tests => 6;
    $schema->storage->txn_begin;

    my $room1 = TestHelper::insert_room(
        roomnumber  => 'EQ-R3',
        maxcapacity => 10,
        color       => '#aaaaaa',
        description => 'Test room',
        branch      => $branch,
    );
    my $room2 = TestHelper::insert_room(
        roomnumber  => 'EQ-R4',
        maxcapacity => 10,
        color       => '#bbbbbb',
        description => 'Test room',
        branch      => $branch,
    );

    my $equip = TestHelper::insert_equipment( equipmentname => 'Laptop' );
    TestHelper::insert_rooms_equipment(
        roomid      => $room1->{roomid},
        equipmentid => $equip->{equipmentid},
    );

    # Update equipment and change room association
    $t->put_ok( "$base_url/equipment/$equip->{equipmentid}" => json => {
        equipmentname => 'Laptop-v2',
        roomid        => $room2->{roomid},
    } )->status_is(200)
      ->json_is( '/equipmentname' => 'Laptop-v2' )
      ->json_is( '/roomid' => $room2->{roomid} );

    # Non-existent equipment
    $t->put_ok( "$base_url/equipment/999999" => json => {
        equipmentname => 'X',
    } )->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'delete equipment' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    my $equip = TestHelper::insert_equipment( equipmentname => 'Eraser' );

    $t->delete_ok("$base_url/equipment/$equip->{equipmentid}")
      ->status_is(204);

    $t->delete_ok("$base_url/equipment/999999")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

END { TestHelper::teardown_tables() }
