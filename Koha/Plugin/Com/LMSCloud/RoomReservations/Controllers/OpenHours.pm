package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::OpenHours;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context;
use Try::Tiny;
use JSON;
use SQL::Abstract;
use Time::Piece;
use Locale::TextDomain ( 'com.lmscloud.roomreservations', undef );
use Locale::Messages qw(:locale_h :libintl_h bind_textdomain_filter);
use POSIX qw(setlocale);
use Encode;

our $VERSION = '1.0.0';

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();
setlocale Locale::Messages::LC_MESSAGES(), q{};
textdomain 'com.lmscloud.roomreservations';
bind_textdomain_filter 'com.lmscloud.roomreservations', \&Encode::decode_utf8;
bindtextdomain 'com.lmscloud.roomreservations' => $self->bundle_path . '/locales/';

my $OPEN_HOURS_TABLE = $self ? $self->get_qualified_table_name('open_hours') : undef;

use Koha::Plugin::Com::LMSCloud::RoomReservations::lib::Validator;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $OPEN_HOURS_TABLE, q{*} );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $open_hours = $sth->fetchall_arrayref( {} );

        return $c->render( status => 200, openapi => $open_hours );
    } catch {
        $c->unhandled_exception($_);
    };
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $json = $c->req->body;
        my $body = from_json($json);

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind, $sth );
        for my $entry ( $body->@* ) {
            ( $stmt, @bind ) = $sql->insert( $OPEN_HOURS_TABLE, $entry );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);
        }

        return $c->render( status => 201, openapi => $body );

    } catch {
        $c->unhandled_exception($_);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $branch = $c->validation->param('branch');
        my $day    = $c->validation->param('day');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $OPEN_HOURS_TABLE, q{*}, { branch => $branch, day => $day } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $open_hours = $sth->fetchrow_hashref;
        if ( !$open_hours ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'No entry found for day' }
            );
        }

        return $c->render( status => 200, openapi => $open_hours );
    } catch {
        $c->unhandled_exception($_);
    }
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        local $ENV{LANGUAGE}       = $c->validation->param('lang') || 'en';
        local $ENV{OUTPUT_CHARSET} = 'UTF-8';
        my $branch = $c->validation->param('branch');
        my $day    = $c->validation->param('day');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $OPEN_HOURS_TABLE, q{*}, { branch => $branch, day => $day } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $open_hours = $sth->fetchrow_hashref();
        if ( !$open_hours ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        my $new_open_hours = $c->validation->param('body');

        # We have to strip of the seconds of start and end time
        # that's needlessly supplied by firefox's time picker.
        # To do that we map the $new_open_hours hash and strip
        # of the seconds.
        $new_open_hours = {
            map { $_ => substr $new_open_hours->{$_}, 0, 5 }
                keys %{$new_open_hours}
        };
        my $validator = Koha::Plugin::Com::LMSCloud::RoomReservations::lib::Validator->new(
            {
                schema => [
                    {
                        type  => 'time',
                        key   => 'start',
                        value => $new_open_hours->{'start'}
                    },
                    {
                        type  => 'time',
                        key   => 'end',
                        value => $new_open_hours->{'end'}
                    },
                ]
            }
        );
        my ( $is_valid, $errors ) = $validator->validate();
        if ( !$is_valid ) {
            return $c->render(
                status  => 400,
                openapi => { error => join q{ & }, @{$errors} }
            );
        }

        if ( Time::Piece->strptime( $new_open_hours->{'end'}, '%H:%M:%S' )->epoch <
            Time::Piece->strptime( $new_open_hours->{'start'}, '%H:%M:%S' )->epoch )
        {
            return $c->render(
                status  => 400,
                openapi => { error => __('End time must be after start time') }
            );
        }

        ( $stmt, @bind ) = $sql->update( $OPEN_HOURS_TABLE, $new_open_hours, { branch => $branch, day => $day } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render(
            status  => 201,
            openapi => { %{$new_open_hours}, day => $day, branch => $branch }
        );
    } catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $branch = $c->validation->param('branch');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->delete( $OPEN_HOURS_TABLE, { branch => $branch } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render( status => 204, openapi => {} );
    } catch {
        $c->unhandled_exception($_);
    }
}

1;
