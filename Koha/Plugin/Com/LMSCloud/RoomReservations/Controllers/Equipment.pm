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

    return try {
        my $dbh   = C4::Context->dbh;
        my $query = "SELECT * FROM $EQUIPMENT_TABLE";
        my $sth   = $dbh->prepare($query);
        $sth->execute();

        my $equipment = $sth->fetchall_arrayref( {} );
        return $c->render( status => 200, openapi => $equipment );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $equipmentid = $c->validation->param('equipmentid');
        my $query       = "SELECT * FROM $EQUIPMENT_TABLE WHERE equipmentid = ?";
        my $sth         = $dbh->prepare($query);
        $sth->execute($equipmentid);

        my $equipment = $sth->fetchrow_hashref();
        if ( !$equipment ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Equipment not found' }
            );
        }

        return $c->render( status => 200, openapi => $equipment );
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
            if ( exists $new_equipment->{'roomid'} && $new_equipment->{'roomid'} ) {
                $roomid = delete $new_equipment->{'roomid'};

                ( $stmt, @bind ) = $sql->insert( $ROOMS_EQUIPMENT_TABLE, { roomid => $roomid, equipmentid => $equipmentid } );
                $sth = $dbh->prepare($stmt);
                $sth->execute(@bind);
            }

            ( $stmt, @bind ) = $sql->update( $EQUIPMENT_TABLE, $new_equipment, { equipmentid => $equipmentid } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);

            return $c->render(
                status  => 200,
                openapi => $roomid ? { $new_equipment->%*, equipmentid => $equipmentid, roomid => $roomid } : { $new_equipment->%*, equipmentid => $equipmentid }
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

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $equipmentid = $c->validation->param('equipmentid');
        my $query       = "SELECT * FROM $EQUIPMENT_TABLE WHERE equipmentid = ?";
        my $sth         = $dbh->prepare($query);
        $sth->execute($equipmentid);

        my $equipment = $sth->fetchrow_hashref();
        if ( !$equipment ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        $query = "DELETE FROM $EQUIPMENT_TABLE WHERE equipmentid = ?";
        $sth   = $dbh->prepare($query);
        $sth->execute($equipmentid);

        return $c->render(
            status  => 200,
            openapi => { success => 1 }
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
