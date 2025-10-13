package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Settings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use File::Basename qw( dirname );
use SQL::Abstract  ();
use Try::Tiny      qw( catch try );

use Koha::Plugin::Com::LMSCloud::Util::I18N qw( __ );

our $VERSION = '1.0.0';

my $i18n = Koha::Plugin::Com::LMSCloud::Util::I18N->new( 'com.lmscloud.roomreservations', dirname(__FILE__) . '/../locales/' );
my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        local $ENV{HTTP_ACCEPT_LANGUAGE} = $c->param('lang');

        my $restricted_patron_categories = _get_restricted_patron_categories();
        my $patron_categories            = _get_patron_categories();

        my $settings = [
            {   setting     => 'default_max_booking_time',
                value       => $self->retrieve_data('default_max_booking_time'),
                description => __('Default maximum bookable time for all rooms'),
                type        => 'number',
                placeholder => __('A duration in minutes, e.g. 60 for an hour'),
            },
            {   setting     => 'absolute_reservation_limit',
                value       => $self->retrieve_data('absolute_reservation_limit'),
                description => __('Absolute reservation limit per patron'),
                type        => 'number',
                placeholder => __('A number, e.g. 5 for five reservations'),
            },
            {   setting     => 'daily_reservation_limit',
                value       => $self->retrieve_data('daily_reservation_limit'),
                description => __('Daily reservation limit per patron'),
                type        => 'number',
                placeholder => __('A number, e.g. 3 for three reservations'),
            },
            {   setting     => 'restricted_patron_categories',
                value       => $restricted_patron_categories,
                description => __('Restricted patron categories which are not allowed to book rooms'),
                type        => 'array',
            },
            {   setting => 'patron_categories',
                value   => sub {
                    my $params    = shift;
                    my %cmp_table = map { $_->{'categorycode'} => 1 } @{ $params->{'cmp_with'} };
                    return [ grep { not exists $cmp_table{ $_->{'categorycode'} } } @{ $params->{'cmp_on'} } ];
                }
                    ->(
                    {   cmp_with => $restricted_patron_categories,
                        cmp_on   => $patron_categories
                    }
                    ),
                description => __('Existing patron categories'),
                type        => 'array',
            },
            {   setting     => 'restrict_message',
                value       => $self->retrieve_data('restrict_message'),
                description => __('Message that is shown to restricted patron categories trying to book rooms'),
                type        => 'text',
                placeholder => __(q{A message, e.g. 'You are not allowed to book rooms'}),
            },
            {   setting     => 'reply_to_address',
                value       => $self->retrieve_data('reply_to_address'),
                description => __('Email address to which confirmation emails for patrons are mirrored'),
                type        => 'email',
                placeholder => __('An email address, e.g. contact@institution.com'),
            },
            {   setting     => 'remove_past_reservations_after',
                value       => $self->retrieve_data('remove_past_reservations_after'),
                description => __('Days after which past reservations are removed from the system'),
                type        => 'number',
                placeholder => __('A number of days, e.g. 14'),
            },
            {   setting     => 'enforce_email_notification',
                value       => $self->retrieve_data('enforce_email_notification'),
                description => __('Enforce email notifications for all OPAC reservations'),
                type        => 'checkbox',
            }
        ];

        return $c->render( status => 200, openapi => $settings );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $body = $c->req->json;

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
        my $setting = $c->param('setting');
        my $value   = $self->retrieve_data($setting);

        return $c->render(
            status  => 200,
            openapi => { setting => $setting, value => $value }
        );
    }
    catch {
        $c->unhandled_exception($_);
    }
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $setting = $c->param('setting');
        my $body    = $c->req->json;

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
        my $setting = $c->param('setting');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select(
            'plugin_data',
            q{*},
            {   plugin_class => 'Koha::Plugin::Com::LMSCloud::RoomReservations',
                plugin_key   => $setting
            }
        );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $setting_to_delete = $sth->fetchrow_hashref();
        if ( !$setting_to_delete ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Setting not found' }
            );
        }

        ( $stmt, @bind ) = $sql->delete(
            'plugin_data',
            {   plugin_class => 'Koha::Plugin::Com::LMSCloud::RoomReservations',
                plugin_key   => $setting
            }
        );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render( status => 204, openapi => q{} );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub _get_patron_categories {
    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    my ( $stmt, @bind ) =
        $sql->select( 'categories', [ 'categorycode', 'description' ], undef, { -asc => 'categorycode' } );

    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);

    return $sth->fetchall_arrayref( {} );
}

sub _get_restricted_patron_categories {
    my $dbh = C4::Context->dbh;

    my $query = <<~"QUERY";
        SELECT categorycode, description
        FROM categories, plugin_data
        WHERE plugin_class = 'Koha::Plugin::Com::LMSCloud::RoomReservations'
        AND plugin_key LIKE 'rcat_%'
        AND plugin_value = categorycode;
    QUERY
    my $sth = $dbh->prepare($query);
    $sth->execute();

    return $sth->fetchall_arrayref( {} );
}

1;
