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

my $room = TestHelper::insert_room(
    roomnumber      => 'DEV-R1',
    maxcapacity     => 10,
    color           => '#aabbcc',
    description     => 'Deviation test room',
    branch          => $branch,
    maxbookabletime => 120,
);

my $base_url = "//$userid:$password@/api/v1/contrib/roomreservations";

subtest 'list deviations' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;

    $t->get_ok("$base_url/open_hours_deviations")
      ->status_is(200);

    $schema->storage->txn_rollback;
};

subtest 'add deviation' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    $t->post_ok( "$base_url/open_hours_deviations" => json => {
        isblackout  => 1,
        start       => '2027-06-01 08:00:00',
        end         => '2027-06-01 18:00:00',
        description => 'Summer closure',
        branches    => [$branch],
        rooms       => [ $room->{roomid} ],
    } )->status_is(201)
      ->json_has('/deviationid')
      ->json_is( '/branches/0' => $branch );

    $schema->storage->txn_rollback;
};

subtest 'get deviation' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    my $dev = TestHelper::insert_open_hours_deviation(
        isblackout  => 1,
        start       => '2027-07-01 08:00:00',
        end         => '2027-07-01 18:00:00',
        description => 'Holiday',
    );
    TestHelper::insert_deviation_branch(
        deviationid => $dev->{deviationid},
        branch      => $branch,
    );
    TestHelper::insert_deviation_room(
        deviationid => $dev->{deviationid},
        roomid      => $room->{roomid},
    );

    $t->get_ok("$base_url/open_hours_deviations/$dev->{deviationid}")
      ->status_is(200)
      ->json_is( '/description' => 'Holiday' );

    # Non-existent deviation
    $t->get_ok("$base_url/open_hours_deviations/999999")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'update deviation' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    my $dev = TestHelper::insert_open_hours_deviation(
        isblackout  => 0,
        start       => '2027-08-01 09:00:00',
        end         => '2027-08-01 12:00:00',
        description => 'Special hours',
    );
    TestHelper::insert_deviation_branch(
        deviationid => $dev->{deviationid},
        branch      => $branch,
    );

    $t->put_ok( "$base_url/open_hours_deviations/$dev->{deviationid}" => json => {
        description => 'Updated special hours',
        branches    => [$branch],
    } )->status_is(200)
      ->json_is( '/description' => 'Updated special hours' );

    # Non-existent deviation
    $t->put_ok( "$base_url/open_hours_deviations/999999" => json => {
        description => 'Nope',
    } )->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'delete deviation' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    my $dev = TestHelper::insert_open_hours_deviation(
        isblackout  => 1,
        start       => '2027-09-01 00:00:00',
        end         => '2027-09-01 23:59:59',
        description => 'To be deleted',
    );

    $t->delete_ok("$base_url/open_hours_deviations/$dev->{deviationid}")
      ->status_is(204);

    # Non-existent deviation
    $t->delete_ok("$base_url/open_hours_deviations/999999")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

END { TestHelper::teardown_tables() }
