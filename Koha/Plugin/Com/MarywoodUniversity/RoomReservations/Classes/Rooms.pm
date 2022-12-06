package Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Classes::Rooms;

use 5.010;

use utf8;
use Modern::Perl;

our $VERSION = '1.0.0';

use base qw(Koha::Objects);

sub type {
    return 'Room';
}

sub object_class {
    return 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Classes::Rooms';
}

1;
