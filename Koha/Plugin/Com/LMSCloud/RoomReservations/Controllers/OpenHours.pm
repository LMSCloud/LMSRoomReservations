package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::OpenHours;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use DateTime::Format::Strptime ();
use File::Basename             qw( dirname );
use List::Util                 qw( all );
use Readonly                   qw( Readonly );
use SQL::Abstract              ();
use Time::Piece                ();
use Try::Tiny                  qw( catch try );

use Koha::Plugin::Com::LMSCloud::Util::I18N qw( __ );

our $VERSION = '1.0.0';

Readonly my $DATETIME_POS_SECONDS => 5;

my $i18n = Koha::Plugin::Com::LMSCloud::Util::I18N->new( 'com.lmscloud.roomreservations', dirname(__FILE__) . '/../locales/' );
my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $OPEN_HOURS_TABLE = $self ? $self->get_qualified_table_name('open_hours') : undef;

my $t_format = DateTime::Format::Strptime->new( pattern => '%H:%M' );

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
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $body = $c->req->json;

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind, $sth );
        for my $entry ( $body->@* ) {
            ( $stmt, @bind ) = $sql->insert( $OPEN_HOURS_TABLE, $entry );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);
        }

        return $c->render( status => 201, openapi => $body );

    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $branch = $c->param('branch');
        my $day    = $c->param('day');

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
    }
    catch {
        $c->unhandled_exception($_);
    }
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        local $ENV{HTTP_ACCEPT_LANGUAGE} = $c->param('lang');

        my $branch = $c->param('branch');
        my $day    = $c->param('day');

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

        my $new_open_hours = $c->req->json;

        # We have to strip of the seconds of start and end time
        # that's needlessly supplied by firefox's time picker.
        # To do that we map the $new_open_hours hash and strip
        # of the seconds.
        $new_open_hours = {
            map { $_ => substr $new_open_hours->{$_}, 0, $DATETIME_POS_SECONDS }
                keys %{$new_open_hours}
        };

        my $is_valid = all { $t_format->parse_datetime($_) } values %{$new_open_hours};
        if ( !$is_valid ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('One of the supplied times is invalid, please use HH:mm') }
            );
        }

        if ( Time::Piece->strptime( $new_open_hours->{'end'}, '%H:%M:%S' )->epoch < Time::Piece->strptime( $new_open_hours->{'start'}, '%H:%M:%S' )->epoch ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('End time must be after start time') }
            );
        }

        ( $stmt, @bind ) =
            $sql->update( $OPEN_HOURS_TABLE, $new_open_hours, { branch => $branch, day => $day } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render(
            status  => 201,
            openapi => { %{$new_open_hours}, day => $day, branch => $branch }
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $branch = $c->param('branch');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->delete( $OPEN_HOURS_TABLE, { branch => $branch } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render( status => 204, openapi => {} );
    }
    catch {
        $c->unhandled_exception($_);
    }
}

1;
