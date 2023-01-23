package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Settings;

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

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $query = <<~"QUERY";
            SELECT * FROM plugin_data
            WHERE plugin_class = 'Koha::Plugin::Com::LMSCloud::RoomReservations'
        QUERY
        my $sth = $dbh->prepare($query);
        $sth->execute();

        my $settings = $sth->fetchall_arrayref( {} );

        return $c->render( status => 200, openapi => $settings );
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

        for my $setting ( $body->@* ) {
            $self->store_data( { $setting->{'setting'} => $setting->{'value'} } );
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
        my $setting = $c->validation->param('setting');
        my $value   = $self->retrieve_data($setting);

        return $c->render( status => 200, openapi => { setting => $setting, value => $value } );
    }
    catch {
        $c->unhandled_exception($_);
    }
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $setting = $c->validation->param('setting');
        my $body    = $c->validation->param('body');

        $self->store_data( { $setting => $body->{'value'} } );
        return $c->render( status => 201, openapi => $body );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $setting = $c->validation->param('setting');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( 'plugin_data', q{*}, { plugin_class => 'Koha::Plugin::Com::LMSCloud::RoomReservations', plugin_key => $setting } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $setting_to_delete = $sth->fetchrow_hashref();
        if ( !$setting_to_delete ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Setting not found' }
            );
        }

        my ( $stmt, @bind ) = $sql->delete( 'plugin_data', { plugin_class => 'Koha::Plugin::Com::LMSCloud::RoomReservations', plugin_key => $setting } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render( status => 204, openapi => q{} );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

1;
