#!/usr/bin/env perl

use Modern::Perl;

use Test::More;
use Test::Mojo;

use FindBin qw( $Bin );
use lib "$Bin/lib";

use Mojo::JSON qw( encode_json true );
use Mojo::URL  ();

use t::lib::TestBuilder;
use t::lib::Mocks;

use Koha::Database;

use TestHelper;

use Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Bookings;

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

# Insert a room plus a set of future-dated bookings (future dates keep them clear
# of the remove_past_reservations_after cutoff). Returns the bookings, newest last.
sub _seed_bookings {
    my $room = TestHelper::insert_room(
        roomnumber  => 'Search Room',
        maxcapacity => 10,
        branch      => $branch,
    );

    my $purposes = [ 'alpha meeting', 'beta workshop', 'gamma meeting', 'delta lecture', 'epsilon meeting' ];
    my $bookings = [];
    my $day      = 1;
    foreach my $purpose ( @{$purposes} ) {
        push @{$bookings}, TestHelper::insert_booking(
            borrowernumber => $borrowernumber,
            roomid         => $room->{roomid},
            start          => sprintf( '2035-01-%02d 10:00:00', $day ),
            end            => sprintf( '2035-01-%02d 11:00:00', $day ),
            purpose_of_use => $purpose,
        );
        $day++;
    }

    return { room => $room, bookings => $bookings };
}

sub _bookings_url {
    my (%query) = @_;
    my $url = Mojo::URL->new("$base_url/bookings");
    $url->query( \%query );
    return $url;
}

subtest '_build_search_where sanitises and translates q' => sub {
    plan tests => 13;

    my $build = \&Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Bookings::_build_search_where;

    my ( $sql, $bind ) = $build->( encode_json( [ { purpose_of_use => { '-like' => '%meeting%' } } ] ) );
    ok( defined $sql, 'valid q produces a WHERE fragment' );
    like( $sql, qr/purpose_of_use/, 'fragment references the whitelisted column' );
    is_deeply( $bind, ['%meeting%'], 'value is passed as a bind, not interpolated' );

    ( $sql, $bind ) = $build->( encode_json( { roomid => 3 } ) );
    is_deeply( $bind, [3], 'exact match binds the scalar value' );

    ( $sql, $bind ) =
        $build->( encode_json( [ { id => { '-like' => '%x%' } }, { purpose_of_use => { '-like' => '%x%' } } ] ) );
    is_deeply( $bind, ['%x%'], 'unknown column (id) is stripped, whitelisted one survives' );

    ( $sql, $bind ) = $build->( encode_json( { borrowernumber => { '; DROP TABLE x; --' => 1 } } ) );
    is( $sql, undef, 'unknown operator is stripped, leaving no filter' );

    ( $sql, $bind ) = $build->( encode_json( { '1=1; DROP TABLE x' => 1 } ) );
    is( $sql, undef, 'injection-shaped column name is stripped' );

    ( $sql, $bind ) = $build->('{}');
    is( $sql, undef, 'empty query produces no filter' );

    ( $sql, $bind ) = $build->( encode_json( { patron => { '-like' => '%smith%' } } ) );
    like( $sql, qr/CONCAT_WS/, 'patron search expands to a joined-name expression' );
    is_deeply( $bind, ['%smith%'], 'patron search binds the term' );

    ( $sql, $bind ) = $build->( encode_json( { roomnumber => { '-like' => '%101%' } } ) );
    like( $sql, qr/roomnumber/, 'roomnumber search targets the joined rooms column' );
    is_deeply( $bind, ['%101%'], 'roomnumber search binds the term' );

    ( $sql, $bind ) = $build->( encode_json( { blackedout => true } ) );
    is_deeply( $bind, [1], 'JSON boolean is coerced to a 0/1 bind' );
};

subtest 'pagination and X-Total-Count' => sub {
    plan tests => 10;
    $schema->storage->txn_begin;

    _seed_bookings();

    $t->get_ok( _bookings_url( _page => 1, _per_page => 2 ) )->status_is(200)
        ->header_is( 'X-Total-Count' => 5 );
    is( scalar @{ $t->tx->res->json }, 2, 'first page returns _per_page rows' );

    $t->get_ok( _bookings_url( _page => 3, _per_page => 2 ) )->status_is(200);
    is( scalar @{ $t->tx->res->json }, 1, 'last page returns the remainder' );

    # An invalid negative per_page must clamp to the default, not reach LIMIT
    # as a negative and 500.
    $t->get_ok( _bookings_url( _per_page => -5 ) )->status_is(200);
    is( scalar @{ $t->tx->res->json }, 5, 'invalid per_page falls back to the default page size' );

    $schema->storage->txn_rollback;
};

subtest 'ordering by _order_by' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    _seed_bookings();

    $t->get_ok( _bookings_url( _order_by => 'start', _per_page => 100 ) )->status_is(200)
        ->json_is( '/0/start' => '2035-01-01 10:00:00' );

    $t->get_ok( _bookings_url( _order_by => '-start', _per_page => 100 ) )
        ->json_is( '/0/start' => '2035-01-05 10:00:00' );

    $schema->storage->txn_rollback;
};

subtest 'search filters via q' => sub {
    plan tests => 4;
    $schema->storage->txn_begin;

    _seed_bookings();

    my $q = encode_json( [ { purpose_of_use => { '-like' => '%meeting%' } } ] );
    $t->get_ok( _bookings_url( q => $q, _per_page => 100 ) )->status_is(200)
        ->header_is( 'X-Total-Count' => 3 );
    is( scalar @{ $t->tx->res->json }, 3, 'only bookings matching the search are returned' );

    $schema->storage->txn_rollback;
};

subtest 'malicious q is ignored, not executed' => sub {
    plan tests => 3;
    $schema->storage->txn_begin;

    _seed_bookings();

    # An unknown column / injection-shaped key must be stripped, leaving the full
    # unfiltered result set rather than an error or a leaked/altered query.
    my $q = encode_json( { '1=1); DROP TABLE x; --' => 1 } );
    $t->get_ok( _bookings_url( q => $q, _per_page => 100 ) )->status_is(200)
        ->header_is( 'X-Total-Count' => 5 );

    $schema->storage->txn_rollback;
};

subtest 'search by patron name' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    _seed_bookings();    # all five bookings belong to $patron

    my $match = encode_json( [ { patron => { '-like' => '%' . $patron->surname . '%' } } ] );
    $t->get_ok( _bookings_url( q => $match, _per_page => 100 ) )->status_is(200)
        ->header_is( 'X-Total-Count' => 5 );

    my $miss = encode_json( [ { patron => { '-like' => '%zzz_no_such_patron_zzz%' } } ] );
    $t->get_ok( _bookings_url( q => $miss, _per_page => 100 ) )
        ->header_is( 'X-Total-Count' => 0 );

    $schema->storage->txn_rollback;
};

subtest 'search by room number' => sub {
    plan tests => 5;
    $schema->storage->txn_begin;

    _seed_bookings();    # all five bookings are in room 'Search Room'

    my $match = encode_json( [ { roomnumber => { '-like' => '%Search Room%' } } ] );
    $t->get_ok( _bookings_url( q => $match, _per_page => 100 ) )->status_is(200)
        ->header_is( 'X-Total-Count' => 5 );

    my $miss = encode_json( [ { roomnumber => { '-like' => '%No Such Room%' } } ] );
    $t->get_ok( _bookings_url( q => $miss, _per_page => 100 ) )
        ->header_is( 'X-Total-Count' => 0 );

    $schema->storage->txn_rollback;
};

done_testing();

END {
    TestHelper::teardown_tables();
}
