package Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Controllers::Rooms;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Classes::Rooms;
use Try::Tiny;

our $VERSION = '1.0.0';

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $rooms_set = Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Classes::Rooms->new;
        my $rooms     = $c->objects->search($rooms_set);
        return $c->render( status => 200, openapi => $rooms );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $room = Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Classes::Rooms->find( $c->validation->param('room_id') );
        if ( !$room ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Room not found' }
            );
        }

        return $c->render( status => 200, openapi => $room->to_api );
    }
    catch {
        $c->unhandled_exception($_);
    }
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $room = Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Classes::Rooms->new_from_api( $c->validation->param('body') );
        $room->store;
        $c->res->headers->location( $c->req->url->to_string . q{/} . $room->roomid );
        return $c->render(
            status  => 201,
            openapi => $room->to_api
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub update {
    my $c = shift->openapi->valid_input or return;

    my $room = Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Classes::Rooms->find( $c->validation->param('room_id') );

    if ( not defined $room ) {
        return $c->render(
            status  => 404,
            openapi => { error => 'Object not found' }
        );
    }

    return try {
        $room->set_from_api( $c->validation->param('body') );
        $room->store();
        return $c->render( status => 200, openapi => $room->to_api );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    Copy code my $room = Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Classes::Rooms->find( $c->validation->param('room_id') );
    if ( not defined $room ) {
        return $c->render(
            status  => 404,
            openapi => { error => 'Object not found' }
        );
    }

    return try {
        $room->delete;
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
