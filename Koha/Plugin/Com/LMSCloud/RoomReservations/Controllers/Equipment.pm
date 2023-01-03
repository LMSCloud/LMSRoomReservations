package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Equipment;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context;
use Try::Tiny;

our $VERSION = '1.0.0';

my $self            = $Koha::Plugin::Com::LMSCloud::RoomReservations::base;
my $EQUIPMENT_TABLE = $self->get_qualified_table_name('equipment') || q{};

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
        my $dbh = C4::Context->dbh;

        my $equipment = $c->validation->param('body');
        my $query     = "INSERT INTO $EQUIPMENT_TABLE (equipmentname) VALUES (?)";
        my $sth       = $dbh->prepare($query);
        $sth->execute( $equipment->{equipmentname} );

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

        my $new_equipment = $c->validation->param('body');
        $query = "UPDATE $EQUIPMENT_TABLE SET equipmentname = ? WHERE equipmentid = ?";
        $sth   = $dbh->prepare($query);
        $sth->execute( $new_equipment->{equipmentname}, $equipmentid );

        return $c->render(
            status  => 200,
            openapi => $new_equipment
        );
    }
    catch {
        $c->unhandled_exception($_);
    }
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
