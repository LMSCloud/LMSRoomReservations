#!/usr/bin/env perl

use Modern::Perl;

use Test::More tests => 20;

use FindBin qw( $Bin );
use lib "$Bin/lib";

use t::lib::TestBuilder;
use t::lib::Mocks;

use Koha::Database;

use TestHelper;
use Koha::Plugin::Com::LMSCloud::RoomReservations::Checks qw(
    compute_room_slots
    is_slot_mode
    is_valid_slot
);

my $schema  = Koha::Database->new->schema;
my $builder = t::lib::TestBuilder->new;

TestHelper::setup_tables();

my $library = $builder->build_object( { class => 'Koha::Libraries' } );
my $branch  = $library->branchcode;

# 2027-01-04 is a Monday (day=0 in schema).
my $monday = '2027-01-04';

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

sub make_room {
    my (%args) = @_;
    return TestHelper::insert_room(
        roomnumber  => 'S-R1',
        maxcapacity => 4,
        branch      => $branch,
        %args,
    );
}

# Insert an open-hours deviation. Defaults to a one-off special-hours window
# (not a blackout, no recurrence) that applies to every branch/room because no
# association rows are created. Pass start/end as 'YYYY-MM-DD HH:MM:SS'.
sub add_deviation {
    my (%args) = @_;
    return TestHelper::insert_open_hours_deviation(
        isblackout     => 0,
        recurrencetype => 'none',
        %args,
    );
}

subtest 'free mode (no slot_length) yields no slots' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '10:00:00', '18:00:00' );

    is_deeply( compute_room_slots( $room->{roomid}, $monday ), [], 'no slots in free mode' );

    $schema->storage->txn_rollback;
};

subtest 'divisible window produces aligned slots' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120 );
    set_hours( 0, '10:00:00', '18:00:00' );

    is_deeply(
        compute_room_slots( $room->{roomid}, $monday ),
        [   { start => "${monday}T10:00", end => "${monday}T12:00" },
            { start => "${monday}T12:00", end => "${monday}T14:00" },
            { start => "${monday}T14:00", end => "${monday}T16:00" },
            { start => "${monday}T16:00", end => "${monday}T18:00" },
        ],
        '10:00-18:00 in 120m blocks => four slots'
    );

    $schema->storage->txn_rollback;
};

subtest 'trailing remainder is dropped' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120 );
    set_hours( 0, '10:00:00', '17:00:00' );

    is_deeply(
        compute_room_slots( $room->{roomid}, $monday ),
        [   { start => "${monday}T10:00", end => "${monday}T12:00" },
            { start => "${monday}T12:00", end => "${monday}T14:00" },
            { start => "${monday}T14:00", end => "${monday}T16:00" },
        ],
        'final 16:00-18:00 block is dropped because it exceeds 17:00'
    );

    $schema->storage->txn_rollback;
};

subtest 'slot_start anchors the grid' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120, slot_start => '10:00:00' );
    set_hours( 0, '09:00:00', '18:00:00' );

    is_deeply(
        compute_room_slots( $room->{roomid}, $monday ),
        [   { start => "${monday}T10:00", end => "${monday}T12:00" },
            { start => "${monday}T12:00", end => "${monday}T14:00" },
            { start => "${monday}T14:00", end => "${monday}T16:00" },
            { start => "${monday}T16:00", end => "${monday}T18:00" },
        ],
        'grid starts at the 10:00 anchor, not the 09:00 opening time'
    );

    $schema->storage->txn_rollback;
};

subtest 'anchor before opening time is clamped to open hours' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120, slot_start => '09:00:00' );
    set_hours( 0, '10:00:00', '14:00:00' );

    # Grid points: 09:00 (before open, skipped), 11:00 (11-13 fits), 13:00 (13-15 exceeds close).
    is_deeply(
        compute_room_slots( $room->{roomid}, $monday ),
        [ { start => "${monday}T11:00", end => "${monday}T13:00" } ],
        'slots before the opening time are not offered'
    );

    $schema->storage->txn_rollback;
};

subtest 'closed day (no open_hours row) yields no slots' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120 );

    is_deeply( compute_room_slots( $room->{roomid}, $monday ), [], 'no row => no slots' );

    $schema->storage->txn_rollback;
};

subtest 'closed day (00:00:00/00:00:00) yields no slots' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120 );
    set_hours( 0, '00:00:00', '00:00:00' );

    is_deeply( compute_room_slots( $room->{roomid}, $monday ), [], 'closed day => no slots' );

    $schema->storage->txn_rollback;
};

subtest 'is_valid_slot accepts any time in free mode' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room();
    set_hours( 0, '10:00:00', '18:00:00' );

    ok( is_valid_slot( $room->{roomid}, "${monday}T10:37", "${monday}T12:37" ),
        'off-grid time is fine when the room has no fixed slots' );

    $schema->storage->txn_rollback;
};

subtest 'is_valid_slot accepts an exact slot match' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120 );
    set_hours( 0, '10:00:00', '18:00:00' );

    ok( is_valid_slot( $room->{roomid}, "${monday}T12:00", "${monday}T14:00" ),
        'a booking matching a generated slot is valid' );

    $schema->storage->txn_rollback;
};

subtest 'is_valid_slot rejects an off-grid start' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120 );
    set_hours( 0, '10:00:00', '18:00:00' );

    ok( !is_valid_slot( $room->{roomid}, "${monday}T11:00", "${monday}T13:00" ),
        'a start that does not land on the grid is rejected' );

    $schema->storage->txn_rollback;
};

subtest 'is_valid_slot rejects a mismatched duration' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120 );
    set_hours( 0, '10:00:00', '18:00:00' );

    ok( !is_valid_slot( $room->{roomid}, "${monday}T10:00", "${monday}T11:00" ),
        'a slot-aligned start with the wrong end is rejected' );

    $schema->storage->txn_rollback;
};

subtest 'special hours open slots on an otherwise-closed day' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    # No regular open_hours row for Monday, so the only window is the deviation.
    my $room = make_room( slot_length => 120 );
    add_deviation( start => "$monday 10:00:00", end => "$monday 14:00:00" );

    is_deeply(
        compute_room_slots( $room->{roomid}, $monday ),
        [   { start => "${monday}T10:00", end => "${monday}T12:00" },
            { start => "${monday}T12:00", end => "${monday}T14:00" },
        ],
        'a special-hours window generates slots even with no regular hours'
    );

    $schema->storage->txn_rollback;
};

subtest 'special hours extend past regular close and dedup the overlap' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120 );
    set_hours( 0, '10:00:00', '16:00:00' );
    add_deviation( start => "$monday 14:00:00", end => "$monday 20:00:00" );

    # Regular 10-16 => 10-12,12-14,14-16. Special 14-20 => 14-16,16-18,18-20.
    # 14-16 appears in both windows and must not be duplicated.
    is_deeply(
        compute_room_slots( $room->{roomid}, $monday ),
        [   { start => "${monday}T10:00", end => "${monday}T12:00" },
            { start => "${monday}T12:00", end => "${monday}T14:00" },
            { start => "${monday}T14:00", end => "${monday}T16:00" },
            { start => "${monday}T16:00", end => "${monday}T18:00" },
            { start => "${monday}T18:00", end => "${monday}T20:00" },
        ],
        'the union of regular and special hours is deduped and sorted'
    );

    $schema->storage->txn_rollback;
};

subtest 'slot_start phase is preserved across a special-hours window' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120, slot_start => '10:00:00' );
    set_hours( 0, '10:00:00', '12:00:00' );
    add_deviation( start => "$monday 17:00:00", end => "$monday 21:00:00" );

    # slot_start anchors every window to the 10:00 phase, so the grid points are
    # 10,12,...,18,20. Within the 17-21 window only 18-20 fits — NOT 17-19, which
    # is what anchoring to the window's own start would have produced.
    is_deeply(
        compute_room_slots( $room->{roomid}, $monday ),
        [   { start => "${monday}T10:00", end => "${monday}T12:00" },
            { start => "${monday}T18:00", end => "${monday}T20:00" },
        ],
        'special-hours slots stay on the slot_start grid phase'
    );

    $schema->storage->txn_rollback;
};

subtest 'a blackout deviation contributes no slots' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    # Closed day plus a blackout window: blackouts narrow availability elsewhere,
    # they never create bookable slots, so the grid stays empty.
    my $room = make_room( slot_length => 120 );
    add_deviation( isblackout => 1, start => "$monday 10:00:00", end => "$monday 14:00:00" );

    is_deeply( compute_room_slots( $room->{roomid}, $monday ), [], 'blackout windows are ignored by the grid' );

    $schema->storage->txn_rollback;
};

subtest 'a special-hours deviation scoped to another room is ignored' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room  = make_room( slot_length => 120 );
    my $other = TestHelper::insert_room( roomnumber => 'S-R2', maxcapacity => 4, branch => $branch );

    my $deviation = add_deviation( start => "$monday 10:00:00", end => "$monday 14:00:00" );
    TestHelper::insert_deviation_room( deviationid => $deviation->{deviationid}, roomid => $other->{roomid} );

    is_deeply(
        compute_room_slots( $room->{roomid}, $monday ),
        [],
        'a deviation bound to a different room does not open slots here'
    );

    $schema->storage->txn_rollback;
};

subtest 'an impossible calendar date yields no slots' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    my $room = make_room( slot_length => 120 );
    set_hours( 0, '10:00:00', '18:00:00' );

    is_deeply( compute_room_slots( $room->{roomid}, '2027-13-45' ), [], 'a non-existent date does not throw' );

    $schema->storage->txn_rollback;
};

subtest 'is_slot_mode is false for a free-mode room' => sub {
    plan tests => 2;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    ok( !is_slot_mode( make_room()->{roomid} ), 'no slot_length => free mode' );
    ok( !is_slot_mode( make_room( slot_length => 0 )->{roomid} ), 'slot_length 0 => free mode' );

    $schema->storage->txn_rollback;
};

subtest 'is_slot_mode is true once a slot_length is set' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    ok( is_slot_mode( make_room( slot_length => 120 )->{roomid} ), 'a positive slot_length => slot mode' );

    $schema->storage->txn_rollback;
};

subtest 'a recurring weekly special-hours deviation lands on the date' => sub {
    plan tests => 1;
    $schema->storage->txn_begin;
    TestHelper::cleanup_all();

    # Weekly on Mondays (0=Mon in the schema's day numbering), originating a week
    # before the target Monday. The expansion must produce an instance on $monday.
    my $room = make_room( slot_length => 120 );
    add_deviation(
        start           => '2026-12-28 10:00:00',
        end             => '2026-12-28 14:00:00',
        recurrencetype  => 'weekly',
        recurrencedays  => '0',
        recurrenceuntil => '2027-12-31',
    );

    is_deeply(
        compute_room_slots( $room->{roomid}, $monday ),
        [   { start => "${monday}T10:00", end => "${monday}T12:00" },
            { start => "${monday}T12:00", end => "${monday}T14:00" },
        ],
        'the weekly instance falling on the target Monday opens its slots'
    );

    $schema->storage->txn_rollback;
};
