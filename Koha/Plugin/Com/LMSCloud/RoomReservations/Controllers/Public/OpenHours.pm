package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::OpenHours;

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

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $OPEN_HOURS_TABLE, [ 'branch', 'day', 'start', 'end' ] );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $open_hours = $sth->fetchall_arrayref( {} );

        return $c->render( status => 200, openapi => $open_hours );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
