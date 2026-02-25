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

subtest 'list open hours' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;

    $t->get_ok("$base_url/open_hours")
      ->status_is(200);

    $schema->storage->txn_rollback;
};

subtest 'add open hours' => sub {
    plan tests => 3;
    $schema->storage->txn_begin;

    my @entries = map {
        { branch => $branch, day => $_, start => '08:00', end => '18:00' }
    } ( 0 .. 4 );    # Mon-Fri

    $t->post_ok( "$base_url/open_hours" => json => \@entries )
      ->status_is(201)
      ->json_has('/0/branch');

    $schema->storage->txn_rollback;
};

subtest 'get open hours' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    TestHelper::insert_open_hours(
        branch => $branch,
        day    => 0,
        start  => '09:00',
        end    => '17:00',
    );

    # day 0 = Monday
    $t->get_ok("$base_url/open_hours/$branch/0")
      ->status_is(200)
      ->json_is( '/branch' => $branch );

    # Non-existent day for this branch
    $t->get_ok("$base_url/open_hours/$branch/6")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'update open hours' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    TestHelper::insert_open_hours(
        branch => $branch,
        day    => 1,
        start  => '08:00',
        end    => '17:00',
    );

    $t->put_ok( "$base_url/open_hours/$branch/1" => json => {
        start => '09:00',
        end   => '18:00',
    } )->status_is(200)
      ->json_is( '/start' => '09:00' );

    # Non-existent entry
    $t->put_ok( "$base_url/open_hours/$branch/6" => json => {
        start => '09:00',
        end   => '18:00',
    } )->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'delete open hours' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    # Seed Mon-Fri for this branch
    for my $day ( 0 .. 4 ) {
        TestHelper::insert_open_hours(
            branch => $branch,
            day    => $day,
            start  => '08:00',
            end    => '18:00',
        );
    }

    $t->delete_ok("$base_url/open_hours/$branch")
      ->status_is(204);

    # Non-existent branch -> 404
    $t->delete_ok("$base_url/open_hours/NONEXISTENT_BRANCH_XYZ")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

END { TestHelper::teardown_tables() }
