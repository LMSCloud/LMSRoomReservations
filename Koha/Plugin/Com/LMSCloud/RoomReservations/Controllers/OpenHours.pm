package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::OpenHours;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context;
use Try::Tiny;
use JSON;

our $VERSION = '1.0.0';

my $self = undef;
if ( Koha::Plugin::Com::LMSCloud::RoomReservations->can('new') ) {
    $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();
}

my $OPEN_HOURS_TABLE = $self ? $self->get_qualified_table_name('open_hours') : undef;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $query = "SELECT * FROM $OPEN_HOURS_TABLE";
        my $sth   = $dbh->prepare($query);
        $sth->execute();

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

        my $dbh = C4::Context->dbh;

        my $query = "INSERT INTO $OPEN_HOURS_TABLE (day, start, end) VALUES (?, ?, ?)";
        my $sth   = $dbh->prepare($query);

        for my $day ( $body->@* ) {
            $sth->execute( $day->{'day'}, $day->{'start'}, $day->{'end'} );
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
        my $dbh = C4::Context->dbh;

        my $day   = $c->validation->param('day');
        my $query = "SELECT * FROM $OPEN_HOURS_TABLE WHERE day = ?";
        my $sth   = $dbh->prepare($query);
        $sth->execute($day);

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
        my $day = $c->validation->param('day');

        my $dbh = C4::Context->dbh;

        my $query = "SELECT * FROM $OPEN_HOURS_TABLE WHERE day = ?";
        my $sth   = $dbh->prepare($query);
        $sth->execute($day);

        my $open_hours = $sth->fetchrow_hashref();
        if ( !$open_hours ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        my $new_open_hours = $c->validation->param('body');
        $query = "UPDATE $OPEN_HOURS_TABLE SET start = ?, end = ? WHERE day = ?";
        $sth   = $dbh->prepare($query);
        $sth->execute( $new_open_hours->{'start'}, $new_open_hours->{'end'}, $day );

        return $c->render( status => 201, openapi => { %{$new_open_hours}, day => $day } );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
