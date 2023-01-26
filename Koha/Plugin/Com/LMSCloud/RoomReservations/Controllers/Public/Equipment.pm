package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Equipment;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context;
use Try::Tiny;
use SQL::Abstract;

our $VERSION = '1.0.0';

my $self = undef;
if ( Koha::Plugin::Com::LMSCloud::RoomReservations->can('new') ) {
    $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();
}

my $EQUIPMENT_TABLE       = $self ? $self->get_qualified_table_name('equipment')       : undef;
my $ROOMS_EQUIPMENT_TABLE = $self ? $self->get_qualified_table_name('rooms_equipment') : undef;

sub list {
    my $c = shift->openapi->valid_input or return;

    my $dbh = C4::Context->dbh;
    my $sql = SQL::Abstract->new;

    my ( $stmt, @bind ) = $sql->select( $EQUIPMENT_TABLE, q{*} );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);

    my $equipment = $sth->fetchall_arrayref( {} );
    foreach my $item ( $equipment->@* ) {
        ( $stmt, @bind ) = $sql->select( $ROOMS_EQUIPMENT_TABLE, 'roomid', { equipmentid => $item->{equipmentid} } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $roomid = $sth->fetchrow_hashref();
        if ($roomid) {
            $item->{roomid} = $roomid->{roomid};
        }
    }

    return $c->render( status => 200, openapi => $equipment );
}

1;
