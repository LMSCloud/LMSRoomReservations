package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::OpenHours;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context;
use Try::Tiny;
use JSON;
use SQL::Abstract;

our $VERSION = '1.0.0';

my $self = undef;
if ( Koha::Plugin::Com::LMSCloud::RoomReservations->can('new') ) {
    $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();
}

my $OPEN_HOURS_TABLE = $self ? $self->get_qualified_table_name('open_hours') : undef;

use Koha::Plugin::Com::LMSCloud::RoomReservations::Lib::Validator;

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

    }
    catch {
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
    }
    catch {
        $c->unhandled_exception($_);
    }
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
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
        my $validator      = Koha::Plugin::Com::LMSCloud::RoomReservations::Lib::Validator->new(
            { schema => [ { type => 'time', key => 'start', value => $new_open_hours->{'start'} }, { type => 'time', key => 'end', value => $new_open_hours->{'end'} }, ] } );
        my ( $is_valid, $errors ) = $validator->validate();
        if ( !$is_valid ) {
            return $c->render(
                status  => 400,
                openapi => { error => join q{ & }, @{$errors} }
            );
        }

        ( $stmt, @bind ) = $sql->update( $OPEN_HOURS_TABLE, $new_open_hours, { branch => $branch, day => $day } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render( status => 201, openapi => { %{$new_open_hours}, day => $day, branch => $branch } );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
