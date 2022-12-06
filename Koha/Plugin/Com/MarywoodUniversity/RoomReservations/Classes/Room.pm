package Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Classes::Room;

use 5.010;

use utf8;
use Modern::Perl;

use base qw(Koha::Object);
use C4::Context;

our $VERSION = '1.0.0';

sub store {
    my ($self) = @_;

    my $saved;
    if ( $self->get_column('roomid') ) {
        $saved = $self->replace;
    }
    else {
        $saved = $self->add;
    }

    return $saved;
}

sub add {
    my ($self) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = $dbh->prepare(
        <<~"STATEMENT"
            INSERT INTO rooms (roomnumber, maxcapacity, description, color, image, branch, maxbookabletime)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        STATEMENT
    );

    $sth->execute( $self->roomnumber, $self->maxcapacity, $self->description, $self->color, $self->image, $self->branch, $self->maxbookabletime, );

    my $roomid = $dbh->last_insert_id( undef, undef, 'rooms', 'roomid' );
    $self->set_column( 'roomid', $roomid );

    return $self;
}

sub replace {
    my ($self) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = $dbh->prepare(
        <<~"STATEMENT"
            REPLACE INTO rooms (roomid, roomnumber, maxcapacity, description, color, image, branch, maxbookabletime)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        STATEMENT
    );

    $sth->execute( $self->roomid, $self->roomnumber, $self->maxcapacity, $self->description, $self->color, $self->image, $self->branch, $self->maxbookabletime, );

    return $self;
}
1;
