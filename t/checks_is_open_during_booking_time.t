#!/usr/bin/env perl

use Modern::Perl;

use Test::More tests => 11;

use FindBin qw( $Bin );
use lib "$Bin/lib";

use t::lib::TestBuilder;
use t::lib::Mocks;

use Koha::Database;

use TestHelper;
use Koha::Plugin::Com::LMSCloud::RoomReservations::Checks qw(
    is_open_during_booking_time
);

my $schema  = Koha::Database->new->schema;
my $builder = t::lib::TestBuilder->new;

TestHelper::setup_tables();

my $library = $builder->build_object( { class => 'Koha::Libraries' } );
my $branch  = $library->branchcode;

# 2027-01-04 is a Monday (day=0 in schema), 2027-01-05 is Tuesday, etc.
my $monday  = '2027-01-04';
my $tuesday = '2027-01-05';
my $sunday  = '2027-01-03';

# Helper: insert open hours for one weekday in this branch.
sub set_hours {
    my ( $day, $start, $end ) = @_;
    TestHelper::insert_open_hours(
        branch => $branch,
        day    => $day,
        start  => $start,
        end    => $end,
    );
    return;
}

# Helper: create a fresh room in this branch.
sub make_room {
    return TestHelper::insert_room(
        roomnumber  => 'C-R1',
        maxcapacity => 4,
        branch      => $branch,
    );
}

subtest 'same-day booking fully within open hours' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '08:00:00', '18:00:00' );

    ok( is_open_during_booking_time( $room->{roomid}, "${monday}T10:00", "${monday}T11:00" ),
        'booking inside open hours is allowed' );

    $schema->storage->txn_rollback;
};

subtest 'same-day booking starting before opening time' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '08:00:00', '18:00:00' );

    ok( !is_open_during_booking_time( $room->{roomid}, "${monday}T07:30", "${monday}T08:30" ),
        'booking that starts before open is rejected' );

    $schema->storage->txn_rollback;
};

subtest 'same-day booking ending after closing time' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '08:00:00', '18:00:00' );

    ok( !is_open_during_booking_time( $room->{roomid}, "${monday}T17:30", "${monday}T18:30" ),
        'booking that ends after close is rejected' );

    $schema->storage->txn_rollback;
};

subtest 'closed day (00:00:00 / 00:00:00)' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '00:00:00', '00:00:00' );

    ok( !is_open_during_booking_time( $room->{roomid}, "${monday}T10:00", "${monday}T11:00" ),
        'booking on a closed day is rejected' );

    $schema->storage->txn_rollback;
};

subtest 'closed day (no row at all)' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();

    # Only Monday hours set; Tuesday has no row.
    set_hours( 0, '08:00:00', '18:00:00' );

    ok( !is_open_during_booking_time( $room->{roomid}, "${tuesday}T10:00", "${tuesday}T11:00" ),
        'booking on a day with no open_hours row is rejected' );

    $schema->storage->txn_rollback;
};

# The original bug: a booking that starts at 23:30 and ends at 00:30 the next day
# was accepted because the validator normalized both timestamps to 1970-01-01 and
# compared time-of-day only, so end (00:30) looked earlier than close (22:00).
subtest 'cross-midnight regression: both days close at 22:00' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '08:00:00', '22:00:00' );    # Mon
    set_hours( 1, '08:00:00', '22:00:00' );    # Tue

    ok( !is_open_during_booking_time( $room->{roomid}, "${monday}T23:30", "${tuesday}T00:30" ),
        'cross-midnight booking is rejected when neither day covers the boundary' );

    $schema->storage->txn_rollback;
};

subtest 'cross-midnight: day N covers up to midnight, day N+1 still closed' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '00:00:00', '23:59:59' );    # Mon 24h
    set_hours( 1, '00:00:00', '00:00:00' );    # Tue closed

    ok( !is_open_during_booking_time( $room->{roomid}, "${monday}T23:30", "${tuesday}T00:30" ),
        'cross-midnight booking is rejected when the next day is closed' );

    $schema->storage->txn_rollback;
};

subtest 'cross-midnight: both days open through the boundary' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '00:00:00', '23:59:59' );    # Mon 24h
    set_hours( 1, '00:00:00', '12:00:00' );    # Tue 00:00-12:00

    ok( is_open_during_booking_time( $room->{roomid}, "${monday}T23:30", "${tuesday}T00:30" ),
        'cross-midnight booking is allowed when both days cover the boundary' );

    $schema->storage->txn_rollback;
};

subtest 'cross-midnight: day N+1 does not start at 00:00' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '00:00:00', '23:59:59' );    # Mon 24h
    set_hours( 1, '06:00:00', '22:00:00' );    # Tue opens at 06:00

    ok( !is_open_during_booking_time( $room->{roomid}, "${monday}T23:30", "${tuesday}T00:30" ),
        'cross-midnight booking is rejected when the next day does not open at midnight' );

    $schema->storage->txn_rollback;
};

subtest 'booking ending exactly at midnight only validates day N' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '08:00:00', '23:59:59' );    # Mon open through midnight
    set_hours( 1, '00:00:00', '00:00:00' );    # Tue closed (must NOT be consulted)

    ok( is_open_during_booking_time( $room->{roomid}, "${monday}T23:00", "${tuesday}T00:00" ),
        'booking ending exactly at midnight is allowed when day N is open through end-of-day' );

    # And if day N closes before midnight, ending exactly at midnight is rejected.
    TestHelper::cleanup_all();
    my $room2 = make_room();
    set_hours( 0, '08:00:00', '22:00:00' );    # Mon closes at 22:00

    ok( !is_open_during_booking_time( $room2->{roomid}, "${monday}T23:00", "${tuesday}T00:00" ),
        'booking ending exactly at midnight is rejected when day N closes earlier' );

    $schema->storage->txn_rollback;
};

# Schema is 0=Mon..6=Sun; ensure Sunday (Time::Piece's wday=0) maps to schema day=6.
subtest 'weekday mapping: Sunday is day 6' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 6, '08:00:00', '18:00:00' );    # Sunday only

    ok( is_open_during_booking_time( $room->{roomid}, "${sunday}T10:00", "${sunday}T11:00" ),
        'Sunday booking is allowed against day=6 row' );

    ok( !is_open_during_booking_time( $room->{roomid}, "${monday}T10:00", "${monday}T11:00" ),
        'Monday booking is rejected when only Sunday has hours' );

    $schema->storage->txn_rollback;
};
