package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Rooms;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use File::Basename qw( dirname );
use Readonly       qw( Readonly );
use SQL::Abstract  ();
use Scalar::Util   qw( looks_like_number );
use Try::Tiny      qw( catch try );

use Koha::Plugin::Com::LMSCloud::Util::I18N qw( __ );

our $VERSION = '1.0.0';

Readonly my $MAX_LENGTH_ROOMNUMBER => 20;

my $i18n = Koha::Plugin::Com::LMSCloud::Util::I18N->new( 'com.lmscloud.roomreservations', dirname(__FILE__) . '/../locales/' );
my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $ROOMS_TABLE = $self ? $self->get_qualified_table_name('rooms') : undef;

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

        my $roomid = $c->param('roomid');
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
        local $ENV{HTTP_ACCEPT_LANGUAGE} = $c->param('lang');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my $room = $c->req->json;

        my $errors = [];
        if ( !looks_like_number( $room->{'maxcapacity'} ) ) {
            push @{$errors}, __('Please enter a number for') . q{ } . __('maxcapacity');
        }

        if ( !( $room->{'color'} =~ m/^#[0-9a-fA-F]{3,6}$/smx ) ) {
            push @{$errors}, __('Please enter a color in the format #RRGGBB for') . q{ } . __('color');
        }

        if ( $room->{'maxbookabletime'} and !looks_like_number( $room->{'maxbookabletime'} ) ) {
            push @{$errors}, __('Please enter a number for') . q{ } . __('maxbookabletime');
        }

        if ( length $room->{'roomnumber'} > $MAX_LENGTH_ROOMNUMBER ) {
            push @{$errors}, __('The maximum length for') . q{ } . __('roomnumber') . q{ } . __('is 20 characters');
        }

        if ( @{$errors} ) {
            return $c->render(
                status  => 400,
                openapi => { error => join qq{ \n }, @{$errors} }
            );
        }

        my ( $stmt, @bind ) = $sql->insert( $ROOMS_TABLE, $room );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

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
        local $ENV{HTTP_ACCEPT_LANGUAGE} = $c->param('lang');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my $roomid = $c->param('roomid');
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

        my $new_room = $c->req->json;

        # Convert empty strings to undef (SQL NULL) while preserving valid falsy values like 0.
        $new_room =
            { map { $_ => ( defined $new_room->{$_} && $new_room->{$_} ne q{} ? $new_room->{$_} : undef ) } keys %{$new_room} };

        my $errors = [];
        if ( !looks_like_number( $new_room->{'maxcapacity'} ) ) {
            push @{$errors}, __('Please enter a number for') . q{ } . __('maxcapacity');
        }

        if ( !( $new_room->{'color'} =~ m/^#[0-9a-fA-F]{3,6}$/smx ) ) {
            push @{$errors}, __('Please enter a color in the format #RRGGBB for') . q{ } . __('color');
        }

        if ( $new_room->{'maxbookabletime'} and !looks_like_number( $new_room->{'maxbookabletime'} ) ) {
            push @{$errors}, __('Please enter a number for') . q{ } . __('maxbookabletime');
        }

        if ( length $new_room->{'roomnumber'} > $MAX_LENGTH_ROOMNUMBER ) {
            push @{$errors}, __('The maximum length for') . q{ } . __('roomnumber') . q{ } . __('is 20 characters');
        }

        if ( @{$errors} ) {
            return $c->render(
                status  => 400,
                openapi => { error => join qq{ \n }, @{$errors} }
            );
        }

        my ( $stmt, @bind ) =
            $sql->update( $ROOMS_TABLE, $new_room, { roomid => $roomid } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render(
            status  => 200,
            openapi => { %{$new_room}, roomid => $roomid }
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $roomid = $c->param('roomid');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) =
            $sql->select( $ROOMS_TABLE, q{*}, { roomid => $roomid } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $equipment = $sth->fetchrow_hashref();
        if ( !$equipment ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        ( $stmt, @bind ) = $sql->delete( $ROOMS_TABLE, { roomid => $roomid } );
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
