package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Rooms;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context;
use Try::Tiny;

our $VERSION = '1.0.0';

my $self        = $Koha::Plugin::Com::LMSCloud::RoomReservations::base;
my $ROOMS_TABLE = $self->get_qualified_table_name('rooms') || q{};

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh   = C4::Context->dbh;
        my $query = "SELECT * FROM $ROOMS_TABLE";
        my $sth   = $dbh->prepare($query);
        $sth->execute();

        my $rooms = $sth->fetchall_arrayref( {} );
        return $c->render( status => 200, openapi => $rooms );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $roomid = $c->validation->param('roomid');
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
    }
    catch {
        $c->unhandled_exception($_);
    }
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $room  = $c->validation->param('body');
        my $query = "INSERT INTO $ROOMS_TABLE (maxcapacity, color, image, description, maxbookabletime, branch, roomnumber) VALUES (?, ?, ?, ?, ?, ?, ?)";
        my $sth   = $dbh->prepare($query);
        $sth->execute( $room->{maxcapacity}, $room->{color}, $room->{image}, $room->{description}, $room->{maxbookabletime}, $room->{branch}, $room->{roomnumber} );

        return $c->render(
            status  => 201,
            openapi => $room
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $roomid = $c->validation->param('roomid');
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

        my $new_room = $c->validation->param('body');
        $query = "UPDATE $ROOMS_TABLE SET maxcapacity = ?, color = ?, image = ?, description = ?, maxbookabletime = ?, branch = ?, roomnumber = ? WHERE roomid = ?";
        $sth   = $dbh->prepare($query);
        $sth->execute(
            $new_room->{maxcapacity},
            $new_room->{color}, $new_room->{image},
            $new_room->{description},
            $new_room->{maxbookabletime},
            $new_room->{branch}, $new_room->{roomnumber}, $roomid
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $roomid = $c->validation->param('roomid');
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

        $query = "DELETE FROM $ROOMS_TABLE WHERE roomid = ?";
        $sth   = $dbh->prepare($query);
        $sth->execute($roomid);

        return $c->render(
            status  => 204,
            openapi => q{}
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
