package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Rooms;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context   ();
use Try::Tiny     qw( catch try );
use SQL::Abstract ();

our $VERSION = '1.0.0';

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();

my $ROOMS_TABLE = $self ? $self->get_qualified_table_name('rooms') : undef;

use Koha::Plugin::Com::LMSCloud::RoomReservations::lib::Validator;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh   = C4::Context->dbh;
        my $query = "SELECT * FROM $ROOMS_TABLE";
        my $sth   = $dbh->prepare($query);
        $sth->execute();

        my $rooms = $sth->fetchall_arrayref( {} );
        return $c->render( status => 200, openapi => $rooms );
    } catch {
        $c->unhandled_exception($_);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $roomid = $c->param('roomid');
        my $query  = "SELECT * FROM $ROOMS_TABLE WHERE roomid = ?";
        my $sth    = $dbh->prepare($query);
        $sth->execute($roomid);

        my $room = $sth->fetchrow_hashref();
        if ( !$room ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Room not found' }
            );
        }

        return $c->render( status => 200, openapi => $room );
    } catch {
        $c->unhandled_exception($_);
    }
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my $room      = $c->param('body');
        my $validator = Koha::Plugin::Com::LMSCloud::RoomReservations::lib::Validator->new(
            {
                schema => [
                    {
                        key   => 'maxcapacity',
                        value => $room->{'maxcapacity'},
                        type  => 'number'
                    },
                    {
                        key   => 'color',
                        value => $room->{'color'},
                        type  => 'color'
                    },
                    {
                        key     => 'maxbookabletime',
                        value   => $room->{'maxbookabletime'},
                        type    => 'number',
                        options => { nullable => 1 }
                    },
                    {
                        key     => 'roomnumber',
                        value   => $room->{'roomnumber'},
                        type    => 'string',
                        options => { length => 20, alphanumeric => 0 }
                    },
                ]
            }
        );
        my ( $is_valid, $errors ) = $validator->validate();
        if ( !$is_valid ) {
            return $c->render(
                status  => 400,
                openapi => { error => join q{ & }, @{$errors} }
            );
        }

        my ( $stmt, @bind ) = $sql->insert( $ROOMS_TABLE, $room );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render(
            status  => 201,
            openapi => $room
        );
    } catch {
        $c->unhandled_exception($_);
    };
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my $roomid = $c->param('roomid');
        my $query  = "SELECT * FROM $ROOMS_TABLE WHERE roomid = ?";
        my $sth    = $dbh->prepare($query);
        $sth->execute($roomid);

        my $room = $sth->fetchrow_hashref();
        if ( !$room ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        my $new_room = $c->param('body');

        # We have to convert all nullish values to NULL in our new_room to undef before passing them to SQL::Abstract.
        # To do this we assign a new hashref back to $new_room and check for each key if the value is nullish, e.g. undef or empty string.
        $new_room =
            { map { $_ => $new_room->{$_} || undef } keys %{$new_room} };
        my $validator = Koha::Plugin::Com::LMSCloud::RoomReservations::lib::Validator->new(
            {
                schema => [
                    {
                        key   => 'maxcapacity',
                        value => $new_room->{'maxcapacity'},
                        type  => 'number'
                    },
                    {
                        key   => 'color',
                        value => $new_room->{'color'},
                        type  => 'color'
                    },
                    {
                        key     => 'maxbookabletime',
                        value   => $new_room->{'maxbookabletime'},
                        type    => 'number',
                        options => { nullable => 1 }
                    },
                    {
                        key     => 'roomnumber',
                        value   => $new_room->{'roomnumber'},
                        type    => 'string',
                        options => { length => 20, alphanumeric => 0 }
                    },
                ]
            }
        );
        my ( $is_valid, $errors ) = $validator->validate();
        if ( !$is_valid ) {
            return $c->render(
                status  => 400,
                openapi => { error => join q{ & }, @{$errors} }
            );
        }

        my ( $stmt, @bind ) =
            $sql->update( $ROOMS_TABLE, $new_room, { roomid => $roomid } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render(
            status  => 200,
            openapi => { %{$new_room}, roomid => $roomid }
        );
    } catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $roomid = $c->param('roomid');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) =
            $sql->select( $ROOMS_TABLE, q{*}, { roomid => $roomid } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $equipment = $sth->fetchrow_hashref();
        if ( !$equipment ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        ( $stmt, @bind ) = $sql->delete( $ROOMS_TABLE, { roomid => $roomid } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render(
            status  => 204,
            openapi => q{}
        );
    } catch {
        $c->unhandled_exception($_);
    };
}

1;
