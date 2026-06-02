package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Rooms;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use Mojo::JSON qw( false true );
use Try::Tiny  qw( catch try );

use Koha::Plugin::Com::LMSCloud::RoomReservations::Checks qw(
    compute_room_slots
    is_open_during_booking_time
    has_conflicting_booking
    has_passed
);

our $VERSION = '1.0.0';

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $ROOMS_TABLE = $self ? $self->get_qualified_table_name('rooms') : undef;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh   = C4::Context->dbh;
        my $query = "SELECT * FROM $ROOMS_TABLE WHERE deleted_at IS NULL";
        my $sth   = $dbh->prepare($query);
        $sth->execute();

        my $rooms = $sth->fetchall_arrayref( {} );
        return $c->render( status => 200, openapi => $rooms );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub slots {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $roomid = $c->param('roomid');
        my $date   = $c->param('date');

        my $dbh = C4::Context->dbh;
        my $sth = $dbh->prepare("SELECT slot_length FROM $ROOMS_TABLE WHERE roomid = ? AND deleted_at IS NULL");
        $sth->execute($roomid);
        my ($slot_length) = $sth->fetchrow_array;
        $slot_length = defined $slot_length ? $slot_length + 0 : undef;

        my $slots = compute_room_slots( $roomid, $date );

        # Decorate each slot with availability: it must be in the future, fall
        # within open hours (and clear of holidays/blackouts) and not collide
        # with an existing booking.
        for my $slot ( @{$slots} ) {
            my $available =
                  !has_passed( $slot->{start} )
                && is_open_during_booking_time( $roomid, $slot->{start}, $slot->{end} )
                && !has_conflicting_booking( $roomid, $slot->{start}, $slot->{end} );

            $slot->{available} = $available ? true : false;
        }

        return $c->render(
            status  => 200,
            openapi => { slot_length => $slot_length, slots => $slots }
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
