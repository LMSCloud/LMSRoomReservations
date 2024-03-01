package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Equipment;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use Readonly      qw( Readonly );
use Scalar::Util  qw( looks_like_number );
use SQL::Abstract ();
use Try::Tiny     qw( catch try );

use Locale::Messages qw(
    bind_textdomain_filter
    bindtextdomain
    setlocale
    textdomain
);
use Locale::TextDomain ( 'com.lmscloud.roomreservations', undef );

our $VERSION = '1.0.0';

Readonly my $MAX_LENGTH_EQUIPMENTNAME => 20;

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

setlocale Locale::Messages::LC_MESSAGES(), q{};
textdomain 'com.lmscloud.roomreservations';
bind_textdomain_filter 'com.lmscloud.roomreservations', \&Encode::decode_utf8;
bindtextdomain 'com.lmscloud.roomreservations' => $self->bundle_path . '/locales/';

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
            ? { %{$equipment}, roomid => $roomid }
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
        local $ENV{LANGUAGE}       = $c->param('lang') || 'en';
        local $ENV{OUTPUT_CHARSET} = 'UTF-8';

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my $equipment = $c->param('body');

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
        local $ENV{LANGUAGE}       = $c->param('lang') || 'en';
        local $ENV{OUTPUT_CHARSET} = 'UTF-8';

        my $dbh = C4::Context->dbh;
        my $sql = SQL::Abstract->new;

        my $equipmentid = $c->param('equipmentid');
        my ( $stmt, @bind ) = $sql->select( $EQUIPMENT_TABLE, q{*}, { equipmentid => $equipmentid } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);
        my $equipment = $sth->fetchrow_hashref();

        if ($equipment) {
            my $new_equipment = $c->param('body');

            # We have to convert all nullish values to NULL in our new_equipment to undef before passing them to SQL::Abstract.
            # To do this we assign a new hashref back to $new_equipment and check for each key if the value is nullish, e.g. undef or empty string.
            $new_equipment = {
                map { $_ => $new_equipment->{$_} || undef }
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

        ( $stmt, @bind ) =
            $sql->delete( $EQUIPMENT_TABLE, { equipmentid => $equipmentid } );
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
