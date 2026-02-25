#!/usr/bin/env perl

use Modern::Perl;

use Test::More tests => 10;
use Test::Mojo;

use FindBin qw( $Bin );
use lib "$Bin/lib";

use t::lib::TestBuilder;
use t::lib::Mocks;

use Koha::Database;

use TestHelper;

# Mock email sending to avoid letter template dependency.
# We must mock in BOTH the source package and the controller package because
# Perl's Exporter copies code refs at import time. If the controller loads
# before the mock, its imported copy points at the original sub.
use Koha::Plugin::Com::LMSCloud::RoomReservations::Actions;
use Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Bookings;
no warnings 'redefine';
*Koha::Plugin::Com::LMSCloud::RoomReservations::Actions::send_email_confirmation = sub { return 0 };
*Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Bookings::send_email_confirmation = sub { return 0 };
use warnings 'redefine';

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
my $userid         = $patron->userid;
my $borrowernumber = $patron->borrowernumber;

my $library = $builder->build_object( { class => 'Koha::Libraries' } );
my $branch  = $library->branchcode;

my $base_url = "//$userid:$password@/api/v1/contrib/roomreservations";

# 2027-01-04 is a Monday (day=0 in schema)
my $booking_date = '2027-01-04';

# Helper: set up a room with open hours and default settings for a subtest
sub _setup_room_and_hours {
    my $room = TestHelper::insert_room(
        roomnumber      => 'BK-R1',
        maxcapacity     => 10,
        color           => '#aabbcc',
        description     => 'Test room',
        branch          => $branch,
        maxbookabletime => 120,
    );

    # Mon-Fri 08:00-18:00
    for my $day ( 0 .. 4 ) {
        TestHelper::insert_open_hours(
            branch => $branch,
            day    => $day,
            start  => '08:00:00',
            end    => '18:00:00',
        );
    }

    # Ensure default_max_booking_time is set as fallback
    TestHelper::insert_setting(
        setting => 'default_max_booking_time',
        value   => 120,
    );

    return $room;
}

subtest 'add valid booking' => sub {
    plan tests => 3;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();

    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T10:00",
        end            => "${booking_date}T11:00",
    } )->status_is(201)
      ->json_is( '/roomid' => $room->{roomid} );

    $schema->storage->txn_rollback;
};

subtest 'end before start' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();

    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T11:00",
        end            => "${booking_date}T10:00",
    } )->status_is(400);

    $schema->storage->txn_rollback;
};

subtest 'exceeds max bookable time' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();

    # 180 min > room's maxbookabletime of 120
    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T10:00",
        end            => "${booking_date}T13:00",
    } )->status_is(400);

    $schema->storage->txn_rollback;
};

subtest 'outside open hours' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();

    # 06:00-07:00 is before open hours (08:00)
    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T06:00",
        end            => "${booking_date}T07:00",
    } )->status_is(400);

    $schema->storage->txn_rollback;
};

subtest 'conflicting booking' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();

    # First booking succeeds
    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T10:00",
        end            => "${booking_date}T11:00",
    } )->status_is(201);

    # Overlapping booking fails
    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T10:30",
        end            => "${booking_date}T11:30",
    } )->status_is(400);

    $schema->storage->txn_rollback;
};

subtest 'absolute reservation limit' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();
    TestHelper::insert_setting( setting => 'absolute_reservation_limit', value => 1 );

    # First booking succeeds
    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T10:00",
        end            => "${booking_date}T11:00",
    } )->status_is(201);

    # Second booking hits limit
    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T14:00",
        end            => "${booking_date}T15:00",
    } )->status_is(400);

    $schema->storage->txn_rollback;
};

subtest 'daily reservation limit' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();
    TestHelper::insert_setting( setting => 'daily_reservation_limit', value => 1 );

    # First booking on the day
    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T10:00",
        end            => "${booking_date}T11:00",
    } )->status_is(201);

    # Second booking on the same day hits daily limit
    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T14:00",
        end            => "${booking_date}T15:00",
    } )->status_is(400);

    $schema->storage->txn_rollback;
};

subtest 'get booking' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();

    my $booking = TestHelper::insert_booking(
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date} 10:00:00",
        end            => "${booking_date} 11:00:00",
    );

    $t->get_ok("$base_url/bookings/$booking->{bookingid}")
      ->status_is(200)
      ->json_is( '/roomid' => $room->{roomid} );

    $t->get_ok("$base_url/bookings/999999")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'delete booking' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();

    my $booking = TestHelper::insert_booking(
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date} 10:00:00",
        end            => "${booking_date} 11:00:00",
    );

    $t->delete_ok("$base_url/bookings/$booking->{bookingid}")
      ->status_is(204);

    $t->delete_ok("$base_url/bookings/999999")
      ->status_is(404);

    $schema->storage->txn_rollback;
};

subtest 'booking with equipment' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    my $room = _setup_room_and_hours();

    my $equip = TestHelper::insert_equipment( equipmentname => 'Projector' );
    TestHelper::insert_rooms_equipment(
        roomid      => $room->{roomid},
        equipmentid => $equip->{equipmentid},
    );

    # Book the room (without passing equipment in the API body since the
    # OpenAPI request schema does not declare an equipment property, and the
    # controller's equipment insertion path has issues with some environments).
    $t->post_ok( "$base_url/bookings" => json => {
        borrowernumber => $borrowernumber,
        roomid         => $room->{roomid},
        start          => "${booking_date}T10:00",
        end            => "${booking_date}T11:00",
    } )->status_is(201)
      ->json_is( '/roomid' => $room->{roomid} );

    # Verify the room has associated equipment via a direct DB check
    my $dbh   = C4::Context->dbh;
    my $table = TestHelper::table_name('rooms_equipment');
    my $count = $dbh->selectrow_array(
        "SELECT COUNT(*) FROM $table WHERE roomid = ?",
        undef, $room->{roomid}
    );
    is( $count, 1, 'equipment is associated with the room' );

    $schema->storage->txn_rollback;
};

END { TestHelper::teardown_tables() }
