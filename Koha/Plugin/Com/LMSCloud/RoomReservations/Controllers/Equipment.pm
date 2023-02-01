package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Equipment;

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

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;
        my $sql = SQL::Abstract->new;

        my $equipmentid = $c->validation->param('equipmentid');
        my ( $stmt, @bind ) = $sql->select( $EQUIPMENT_TABLE, q{*}, { equipmentid => $equipmentid } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $equipment = $sth->fetchrow_hashref();
        if ( !$equipment ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Equipment not found' }
            );
        }

        ( $stmt, @bind ) = $sql->select( $ROOMS_EQUIPMENT_TABLE, 'roomid', { equipmentid => $equipmentid } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $roomid = $sth->fetchrow_hashref();

        return $c->render( status => 200, openapi => $roomid ? { %{$equipment}, roomid => $roomid } : $equipment );
    }
    catch {
        $c->unhandled_exception($_);
    }
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $equipment = $c->validation->param('body');
        my $sql       = SQL::Abstract->new;

        my ( $stmt, @bind ) = $sql->insert( $EQUIPMENT_TABLE, $equipment );

        my $dbh = C4::Context->dbh;
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render(
            status  => 201,
            openapi => $equipment
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
        my $sql = SQL::Abstract->new;

        my $equipmentid = $c->validation->param('equipmentid');
        my ( $stmt, @bind ) = $sql->select( $EQUIPMENT_TABLE, q{*}, { equipmentid => $equipmentid } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);
        my $equipment = $sth->fetchrow_hashref();

        if ($equipment) {
            my $new_equipment = $c->validation->param('body');

            my $roomid;

            # We have to delete the entry from the junction table before we modify it
            # or we'll get duplicate pk errors
            ( $stmt, @bind ) = $sql->delete( $ROOMS_EQUIPMENT_TABLE, { equipmentid => $equipmentid } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);

            # Handles a new association
            if ( exists $new_equipment->{'roomid'} && $new_equipment->{'roomid'} ) {
                $roomid = delete $new_equipment->{'roomid'};

                ( $stmt, @bind ) = $sql->insert( $ROOMS_EQUIPMENT_TABLE, { roomid => $roomid, equipmentid => $equipmentid } );
                $sth = $dbh->prepare($stmt);
                $sth->execute(@bind);
            }

            if ( exists $new_equipment->{'roomid'} && !$new_equipment->{'roomid'} ) {
                $roomid = delete $new_equipment->{'roomid'};

                ( $stmt, @bind ) = $sql->delete( $ROOMS_EQUIPMENT_TABLE, { equipmentid => $equipmentid } );
                $sth = $dbh->prepare($stmt);
                $sth->execute(@bind);
            }

            ( $stmt, @bind ) = $sql->update( $EQUIPMENT_TABLE, $new_equipment, { equipmentid => $equipmentid } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);

            return $c->render(
                status  => 200,
                openapi => $roomid ? { %{$new_equipment}, equipmentid => $equipmentid, roomid => $roomid } : { %{$new_equipment}, equipmentid => $equipmentid }
            );
        }

        return $c->render(
            status  => 404,
            openapi => { error => 'Item not found' }
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

# sub update {
#     my $c = shift->openapi->valid_input or return;

#     my $dbh = C4::Context->dbh;
#     my $sql = SQL::Abstract->new;

#     my $equipmentid = $c->validation->param('equipmentid');
#     my ( $stmt, @bind ) = $sql->select( $EQUIPMENT_TABLE, '*', { equipmentid => $equipmentid } );
#     my $sth = $dbh->prepare($stmt);
#     $sth->execute(@bind);
#     my $equipment = $sth->fetchrow_hashref();

#     if (!$equipment) {
#         return $c->render(
#             status  => 404,
#             openapi => { error => 'Item not found' }
#         );
#     }

#     my $new_equipment = $c->validation->param('body');

#     if ( exists $new_equipment->{'roomid'} && $new_equipment->{'roomid'} ) {
#         my $roomid = delete $new_equipment->{'roomid'};

#         ( $stmt, @bind ) = $sql->insert( $ROOMS_EQUIPMENT_TABLE, { roomid => $roomid, equipmentid => $equipmentid } );
#         $sth = $dbh->prepare($stmt);
#         $sth->execute(@bind);
#     } elsif ( exists $new_equipment->{'roomid'} && !$new_equipment->{'roomid'} ) {
#         delete $new_equipment->{'roomid'};

#         ( $stmt, @bind ) = $sql->delete( $ROOMS_EQUIPMENT_TABLE, { equipmentid => $equipmentid } );
#         $sth = $dbh->prepare($stmt);
#         $sth->execute(@bind);
#     }

#     ( $stmt, @bind ) = $sql->update( $EQUIPMENT_TABLE, $new_equipment, { equipmentid => $equipmentid } );
#     $sth = $dbh->prepare($stmt);
#     $sth->execute(@bind);

#     return $c->render(
#         status  => 200,
#         openapi => { $new_equipment->%*, equipmentid => $equipmentid }
#     );
# }

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $equipmentid = $c->validation->param('equipmentid');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $EQUIPMENT_TABLE, q{*}, { equipmentid => $equipmentid } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $equipment = $sth->fetchrow_hashref();
        if ( !$equipment ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        ( $stmt, @bind ) = $sql->delete( $EQUIPMENT_TABLE, { equipmentid => $equipmentid } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

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
