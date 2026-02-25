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

subtest 'list rooms' => sub {
    plan tests => 6;
    $schema->storage->txn_begin;

    $t->get_ok("$base_url/rooms")
      ->status_is(200)
      ->json_is( [] );

    TestHelper::insert_room(
        roomnumber  => 'R101',
        maxcapacity => 10,
        color       => '#ff0000',
        description => 'Test room',
        branch      => $branch,
    );

    $t->get_ok("$base_url/rooms")
      ->status_is(200)
      ->json_has('/0/roomnumber');

    $schema->storage->txn_rollback;
};

subtest 'add room' => sub {
    plan tests => 9;
    $schema->storage->txn_begin;

    # Valid room
    $t->post_ok( "$base_url/rooms" => json => {
        roomnumber  => 'R201',
        maxcapacity => 20,
        color       => '#00ff00',
        description => 'A valid room',
        branch      => $branch,
    } )->status_is(201)
      ->json_is( '/roomnumber' => 'R201' );

    # Invalid color
    $t->post_ok( "$base_url/rooms" => json => {
        roomnumber  => 'R202',
        maxcapacity => 10,
        color       => '#GG',
        description => 'Bad color',
        branch      => $branch,
    } )->status_is(400);

    # Invalid maxcapacity
    $t->post_ok( "$base_url/rooms" => json => {
        roomnumber  => 'R203',
        maxcapacity => 'abc',
        color       => '#aabbcc',
        description => 'Bad capacity',
        branch      => $branch,
    } )->status_is(400);

    # roomnumber too long (>20 chars)
    $t->post_ok( "$base_url/rooms" => json => {
        roomnumber  => 'A' x 21,
        maxcapacity => 5,
        color       => '#112233',
        description => 'Long roomnumber',
        branch      => $branch,
    } )->status_is(400);

    $schema->storage->txn_rollback;
};

subtest 'get room' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    my $room = TestHelper::insert_room(
        roomnumber  => 'R301',
        maxcapacity => 15,
        color       => '#abcdef',
        description => 'Test room',
        branch      => $branch,
    );

    $t->get_ok("$base_url/rooms/$room->{roomid}")
      ->status_is(200)
      ->json_is( '/roomnumber' => 'R301' );

    $t->get_ok("$base_url/rooms/999999")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'update room' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    my $room = TestHelper::insert_room(
        roomnumber  => 'R401',
        maxcapacity => 10,
        color       => '#111111',
        description => 'Test room',
        branch      => $branch,
    );

    $t->put_ok( "$base_url/rooms/$room->{roomid}" => json => {
        roomnumber  => 'R401-updated',
        maxcapacity => 25,
        color       => '#222222',
        description => 'Updated room',
        branch      => $branch,
    } )->status_is(200)
      ->json_is( '/roomnumber' => 'R401-updated' );

    # Non-existent room
    $t->put_ok( "$base_url/rooms/999999" => json => {
        roomnumber  => 'X',
        maxcapacity => 1,
        color       => '#000000',
        description => 'Nonexistent',
        branch      => $branch,
    } )->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'delete room' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    my $room = TestHelper::insert_room(
        roomnumber  => 'R501',
        maxcapacity => 5,
        color       => '#333333',
        description => 'Test room',
        branch      => $branch,
    );

    $t->delete_ok("$base_url/rooms/$room->{roomid}")
      ->status_is(204);

    $t->delete_ok("$base_url/rooms/999999")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

END { TestHelper::teardown_tables() }
