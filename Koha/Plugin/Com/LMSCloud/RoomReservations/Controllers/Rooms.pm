package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Rooms;

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

Readonly my $MAX_LENGTH_ROOMNUMBER => 20;

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

setlocale Locale::Messages::LC_MESSAGES(), q{};
textdomain 'com.lmscloud.roomreservations';
bind_textdomain_filter 'com.lmscloud.roomreservations', \&Encode::decode_utf8;
bindtextdomain 'com.lmscloud.roomreservations' => $self->bundle_path . '/locales/';

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
        local $ENV{LANGUAGE}       = $c->param('lang') || 'en';
        local $ENV{OUTPUT_CHARSET} = 'UTF-8';

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my $room = $c->req->json;

        my $errors = [];
        if ( !looks_like_number( $room->{'maxcapacity'} ) ) {
            push @{$errors}, __('Please enter a number for') . q{ } . __('maxcapacity');
        }

        if ( !( $room->{'color'} =~ m/^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\((\d{1,3},\s*){2}\d{1,3}\)$|^rgba\((\d{1,3},\s*){3}(0(\.\d+)?|1(\.0+)?)\)$/smx ) ) {
            push @{$errors}, __('Please enter a color in the format #RRGGBB or rgb(0-255, 0-255, 0-255) or rgba(0-255, 0-255, 0-255, 0.0-1.0) for') . q{ } . __('color');
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
        local $ENV{LANGUAGE}       = $c->param('lang') || 'en';
        local $ENV{OUTPUT_CHARSET} = 'UTF-8';

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

        # We have to convert all nullish values to NULL in our new_room to undef before passing them to SQL::Abstract.
        # To do this we assign a new hashref back to $new_room and check for each key if the value is nullish, e.g. undef or empty string.
        $new_room =
            { map { $_ => $new_room->{$_} || undef } keys %{$new_room} };

        my $errors = [];
        if ( !looks_like_number( $new_room->{'maxcapacity'} ) ) {
            push @{$errors}, __('Please enter a number for') . q{ } . __('maxcapacity');
        }

        if ( !( $new_room->{'color'} =~ m/^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\((\d{1,3},\s*){2}\d{1,3}\)$|^rgba\((\d{1,3},\s*){3}(0(\.\d+)?|1(\.0+)?)\)$/smx ) ) {
            push @{$errors}, __('Please enter a color in the format #RRGGBB or rgb(0-255, 0-255, 0-255) or rgba(0-255, 0-255, 0-255, 0.0-1.0) for') . q{ } . __('color');
        }

        if ( $room->{'maxbookabletime'} and !looks_like_number( $room->{'maxbookabletime'} ) ) {
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
