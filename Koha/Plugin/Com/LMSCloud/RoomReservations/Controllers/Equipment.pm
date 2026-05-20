package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Equipment;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use File::Basename qw( dirname );
use Readonly       qw( Readonly );
use Scalar::Util   qw( looks_like_number );
use SQL::Abstract  ();
use Try::Tiny      qw( catch try );

use Koha::Plugin::Com::LMSCloud::RoomReservations::Util::I18N qw( __ );

our $VERSION = '1.0.0';

Readonly my $MAX_LENGTH_EQUIPMENTNAME => 20;

my $i18n = Koha::Plugin::Com::LMSCloud::RoomReservations::Util::I18N->new( 'com.lmscloud.roomreservations', dirname(__FILE__) . '/../locales/' );
my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $EQUIPMENT_TABLE          = $self ? $self->get_qualified_table_name('equipment')          : undef;
my $ROOMS_EQUIPMENT_TABLE    = $self ? $self->get_qualified_table_name('rooms_equipment')    : undef;
my $BOOKINGS_TABLE           = $self ? $self->get_qualified_table_name('bookings')           : undef;
my $BOOKINGS_EQUIPMENT_TABLE = $self ? $self->get_qualified_table_name('bookings_equipment') : undef;

sub list {
    my $c = shift->openapi->valid_input or return;

    my $dbh = C4::Context->dbh;
    my $sql = SQL::Abstract->new;

    my $include_deleted = $c->param('include_deleted');
    my ( $stmt, @bind ) =
          $include_deleted
        ? $sql->select( $EQUIPMENT_TABLE, q{*} )
        : $sql->select( $EQUIPMENT_TABLE, q{*}, { deleted_at => undef } );
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

        my $equipmentid = $c->param('equipmentid');
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

        return $c->render(
            status  => 200,
            openapi => $roomid
            ? { %{$equipment}, roomid => $roomid->{roomid} }
            : $equipment
        );
    }
    catch {
        $c->unhandled_exception($_);
    }
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        local $ENV{HTTP_ACCEPT_LANGUAGE} = $c->param('lang');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my $equipment = $c->req->json;

        my $errors = [];
        if ( length $equipment->{'equipmentname'} > $MAX_LENGTH_EQUIPMENTNAME ) {
            push @{$errors}, __('The maximum length for') . q{ } . __('equipmentname') . q{ } . __('is 20 characters');
        }

        if ( $equipment->{'maxbookabletime'} and !looks_like_number( $equipment->{'maxbookabletime'} ) ) {
            push @{$errors}, __('Please enter a number for') . q{ } . __('maxbookabletime');
        }

        if ( @{$errors} ) {
            return $c->render(
                status  => 400,
                openapi => { error => join qq{ \n }, @{$errors} }
            );
        }

        my ( $stmt, @bind ) = $sql->insert( $EQUIPMENT_TABLE, $equipment );
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
        local $ENV{HTTP_ACCEPT_LANGUAGE} = $c->param('lang');

        my $dbh = C4::Context->dbh;
        my $sql = SQL::Abstract->new;

        my $equipmentid = $c->param('equipmentid');
        my ( $stmt, @bind ) = $sql->select( $EQUIPMENT_TABLE, q{*}, { equipmentid => $equipmentid, deleted_at => undef } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);
        my $equipment = $sth->fetchrow_hashref();

        if ($equipment) {
            my $new_equipment = $c->req->json;

            # Convert empty strings to undef (SQL NULL) while preserving valid falsy values like 0.
            $new_equipment = {
                map { $_ => ( defined $new_equipment->{$_} && $new_equipment->{$_} ne q{} ? $new_equipment->{$_} : undef ) }
                    keys %{$new_equipment}
            };
            my $errors = [];
            if ( length $new_equipment->{'equipmentname'} > $MAX_LENGTH_EQUIPMENTNAME ) {
                push @{$errors}, __('The maximum length for') . q{ } . __('equipmentname') . q{ } . __('is 20 characters');
            }

            if ( $new_equipment->{'maxbookabletime'} and !looks_like_number( $new_equipment->{'maxbookabletime'} ) ) {
                push @{$errors}, __('Please enter a number for') . q{ } . __('maxbookabletime');
            }

            if ( @{$errors} ) {
                return $c->render(
                    status  => 400,
                    openapi => { error => join qq{ \n }, @{$errors} }
                );
            }

            my $roomid;

            # We have to delete the entry from the junction table before we modify it
            # or we'll get duplicate pk errors
            ( $stmt, @bind ) = $sql->delete( $ROOMS_EQUIPMENT_TABLE, { equipmentid => $equipmentid } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);

            # Handles a new association
            if ( exists $new_equipment->{'roomid'}
                && $new_equipment->{'roomid'} )
            {
                $roomid = delete $new_equipment->{'roomid'};

                ( $stmt, @bind ) =
                    $sql->insert( $ROOMS_EQUIPMENT_TABLE, { roomid => $roomid, equipmentid => $equipmentid } );
                $sth = $dbh->prepare($stmt);
                $sth->execute(@bind);
            }

            if ( exists $new_equipment->{'roomid'}
                && !$new_equipment->{'roomid'} )
            {
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
                openapi => $roomid
                ? { %{$new_equipment},
                    equipmentid => $equipmentid,
                    roomid      => $roomid
                    }
                : { %{$new_equipment}, equipmentid => $equipmentid }
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
        my $equipmentid = $c->param('equipmentid');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $EQUIPMENT_TABLE, q{*}, { equipmentid => $equipmentid, deleted_at => undef } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $equipment = $sth->fetchrow_hashref();
        if ( !$equipment ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        my $upcoming_sth = $dbh->prepare(
            "SELECT COUNT(*) FROM $BOOKINGS_EQUIPMENT_TABLE be
             JOIN $BOOKINGS_TABLE b ON b.bookingid = be.bookingid
             WHERE be.equipmentid = ? AND b.`end` >= NOW()"
        );
        $upcoming_sth->execute($equipmentid);
        my ($upcoming_count) = $upcoming_sth->fetchrow_array();
        if ($upcoming_count) {
            return $c->render(
                status  => 409,
                openapi => { error => __('Cannot delete equipment that is reserved by upcoming bookings') }
            );
        }

        my $soft_delete_sth = $dbh->prepare("UPDATE $EQUIPMENT_TABLE SET deleted_at = NOW() WHERE equipmentid = ?");
        $soft_delete_sth->execute($equipmentid);

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
