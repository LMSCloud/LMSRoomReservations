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

my $base_url = "//$userid:$password@/api/v1/contrib/roomreservations";

subtest 'list settings' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;

    # Pre-populate settings to avoid null values that fail OpenAPI response
    # validation (the response schema types value as string|array, not nullable).
    TestHelper::insert_setting( setting => 'default_max_booking_time',        value => '120' );
    TestHelper::insert_setting( setting => 'absolute_reservation_limit',      value => '5' );
    TestHelper::insert_setting( setting => 'daily_reservation_limit',         value => '3' );
    TestHelper::insert_setting( setting => 'restrict_message',                value => 'Not allowed' );
    TestHelper::insert_setting( setting => 'reply_to_address',                value => 'test@example.com' );
    TestHelper::insert_setting( setting => 'remove_past_reservations_after',  value => '14' );
    TestHelper::insert_setting( setting => 'enforce_email_notification',      value => '0' );
    TestHelper::insert_setting( setting => 'use_koha_calendar',              value => '0' );

    $t->get_ok("$base_url/settings")
      ->status_is(200);

    $schema->storage->txn_rollback;
};

subtest 'add settings' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;

    $t->post_ok( "$base_url/settings" => json => [
        { setting => 'default_max_booking_time', value => '120' },
        { setting => 'absolute_reservation_limit', value => '5' },
    ] )->status_is(201);

    $schema->storage->txn_rollback;
};

subtest 'get setting' => sub {
    plan tests => 3;
    $schema->storage->txn_begin;

    TestHelper::insert_setting(
        setting => 'default_max_booking_time',
        value   => '90',
    );

    $t->get_ok("$base_url/settings/default_max_booking_time")
      ->status_is(200)
      ->json_is( '/value' => '90' );

    $schema->storage->txn_rollback;
};

subtest 'update setting' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;

    TestHelper::insert_setting(
        setting => 'daily_reservation_limit',
        value   => '3',
    );

    $t->put_ok( "$base_url/settings/daily_reservation_limit" => json => {
        value => '5',
    } )->status_is(201);    # Note: controller returns 201 for updates

    $schema->storage->txn_rollback;
};

subtest 'delete setting' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    TestHelper::insert_setting(
        setting => 'reply_to_address',
        value   => 'test@example.com',
    );

    $t->delete_ok("$base_url/settings/reply_to_address")
      ->status_is(204);

    $t->delete_ok("$base_url/settings/nonexistent_setting_xyz")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

END { TestHelper::teardown_tables() }
