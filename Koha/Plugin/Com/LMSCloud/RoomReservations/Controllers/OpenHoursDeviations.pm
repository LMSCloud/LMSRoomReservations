package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::OpenHoursDeviations;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use File::Basename qw( dirname );
use List::Util     qw( any );
use Readonly       qw( Readonly );
use SQL::Abstract  ();
use Try::Tiny      qw( catch try );

use Koha::Plugin::Com::LMSCloud::Util::I18N qw( __ );

our $VERSION = '1.0.0';

my $i18n = Koha::Plugin::Com::LMSCloud::Util::I18N->new( 'com.lmscloud.roomreservations', dirname(__FILE__) . '/../locales/' );
my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $DEVIATIONS_TABLE = $self ? $self->get_qualified_table_name('open_hours_deviations') : undef;
my $BRANCHES_TABLE   = $self ? $self->get_qualified_table_name('deviation_branches')    : undef;
my $ROOMS_TABLE      = $self ? $self->get_qualified_table_name('deviation_rooms')       : undef;

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $DEVIATIONS_TABLE, q{*} );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $deviations = $sth->fetchall_arrayref( {} );

        # Fetch associated branches and rooms for each deviation
        for my $deviation ( @{$deviations} ) {
            $deviation->{'branches'} = _get_deviation_branches( $dbh, $sql, $deviation->{'deviationid'} );
            $deviation->{'rooms'}    = _get_deviation_rooms( $dbh, $sql, $deviation->{'deviationid'} );
        }

        # Fetch Koha calendar holidays and merge them (only if setting is enabled)
        my $use_koha_calendar = $self->retrieve_data('use_koha_calendar');
        if ($use_koha_calendar) {
            my $koha_holidays = _get_koha_calendar_holidays();
            push @{$deviations}, @{$koha_holidays};
        }

        return $c->render( status => 200, openapi => $deviations );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $body = $c->req->json;

        my $dbh = C4::Context->dbh;
        my $sql = SQL::Abstract->new;

        # Extract branches and rooms arrays
        my $branches = delete $body->{'branches'} // [];
        my $rooms    = delete $body->{'rooms'}    // [];

        # Begin transaction
        $dbh->begin_work;

        # Insert main deviation record
        my ( $stmt, @bind ) = $sql->insert( $DEVIATIONS_TABLE, $body );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $deviation_id = $dbh->last_insert_id( undef, undef, $DEVIATIONS_TABLE, 'deviationid' );

        # Insert branch associations if any
        for my $branch ( @{$branches} ) {
            ( $stmt, @bind ) = $sql->insert( $BRANCHES_TABLE, { deviationid => $deviation_id, branch => $branch } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);
        }

        # Insert room associations if any
        for my $roomid ( @{$rooms} ) {
            ( $stmt, @bind ) = $sql->insert( $ROOMS_TABLE, { deviationid => $deviation_id, roomid => $roomid } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);
        }

        $dbh->commit;

        # Fetch the created deviation with associations
        my $created_deviation = { %{$body}, deviationid => $deviation_id, branches => $branches, rooms => $rooms };

        return $c->render( status => 201, openapi => $created_deviation );
    }
    catch {
        my $error = $_;
        my $dbh   = C4::Context->dbh;
        $dbh->rollback if $dbh;
        $c->unhandled_exception($error);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $deviation_id = $c->param('deviationid');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) = $sql->select( $DEVIATIONS_TABLE, q{*}, { deviationid => $deviation_id } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $deviation = $sth->fetchrow_hashref;
        if ( !$deviation ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Deviation not found' }
            );
        }

        # Fetch associated branches and rooms
        $deviation->{'branches'} = _get_deviation_branches( $dbh, $sql, $deviation_id );
        $deviation->{'rooms'}    = _get_deviation_rooms( $dbh, $sql, $deviation_id );

        return $c->render( status => 200, openapi => $deviation );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $deviation_id = $c->param('deviationid');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        # Check if deviation exists
        my ( $stmt, @bind ) = $sql->select( $DEVIATIONS_TABLE, q{*}, { deviationid => $deviation_id } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $existing_deviation = $sth->fetchrow_hashref;
        if ( !$existing_deviation ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Deviation not found' }
            );
        }

        my $body = $c->req->json;

        # Extract branches and rooms arrays
        my $branches = delete $body->{'branches'};
        my $rooms    = delete $body->{'rooms'};

        # Begin transaction
        $dbh->begin_work;

        # Update main deviation record
        ( $stmt, @bind ) = $sql->update( $DEVIATIONS_TABLE, $body, { deviationid => $deviation_id } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        # Update branch associations if provided
        if ( defined $branches ) {

            # Delete existing associations
            ( $stmt, @bind ) = $sql->delete( $BRANCHES_TABLE, { deviationid => $deviation_id } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);

            # Insert new associations
            for my $branch ( @{$branches} ) {
                ( $stmt, @bind ) = $sql->insert( $BRANCHES_TABLE, { deviationid => $deviation_id, branch => $branch } );
                $sth = $dbh->prepare($stmt);
                $sth->execute(@bind);
            }
        }

        # Update room associations if provided
        if ( defined $rooms ) {

            # Delete existing associations
            ( $stmt, @bind ) = $sql->delete( $ROOMS_TABLE, { deviationid => $deviation_id } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);

            # Insert new associations
            for my $roomid ( @{$rooms} ) {
                ( $stmt, @bind ) = $sql->insert( $ROOMS_TABLE, { deviationid => $deviation_id, roomid => $roomid } );
                $sth = $dbh->prepare($stmt);
                $sth->execute(@bind);
            }
        }

        $dbh->commit;

        # Fetch updated deviation with associations
        ( $stmt, @bind ) = $sql->select( $DEVIATIONS_TABLE, q{*}, { deviationid => $deviation_id } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $updated_deviation = $sth->fetchrow_hashref;
        $updated_deviation->{branches} = _get_deviation_branches( $dbh, $sql, $deviation_id );
        $updated_deviation->{rooms}    = _get_deviation_rooms( $dbh, $sql, $deviation_id );

        return $c->render( status => 200, openapi => $updated_deviation );
    }
    catch {
        my $error = $_;
        my $dbh   = C4::Context->dbh;
        $dbh->rollback if $dbh;
        $c->unhandled_exception($error);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $deviation_id = $c->param('deviationid');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        # Check if deviation exists
        my ( $stmt, @bind ) = $sql->select( $DEVIATIONS_TABLE, q{*}, { deviationid => $deviation_id } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        if ( !$sth->fetchrow_hashref ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Deviation not found' }
            );
        }

        # Delete deviation (cascade will handle junction tables)
        ( $stmt, @bind ) = $sql->delete( $DEVIATIONS_TABLE, { deviationid => $deviation_id } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        return $c->render( status => 204, openapi => {} );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

# Helper function to get branches for a deviation
sub _get_deviation_branches {
    my ( $dbh, $sql, $deviation_id ) = @_;

    my ( $stmt, @bind ) = $sql->select( $BRANCHES_TABLE, ['branch'], { deviationid => $deviation_id } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);

    my @branches;
    while ( my $row = $sth->fetchrow_hashref ) {
        push @branches, $row->{'branch'};
    }

    return \@branches;
}

# Helper function to get rooms for a deviation
sub _get_deviation_rooms {
    my ( $dbh, $sql, $deviation_id ) = @_;

    my ( $stmt, @bind ) = $sql->select( $ROOMS_TABLE, ['roomid'], { deviationid => $deviation_id } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);

    my @rooms;
    while ( my $row = $sth->fetchrow_hashref ) {
        push @rooms, $row->{'roomid'};
    }

    return \@rooms;
}

# Helper function to fetch upcoming Koha calendar holidays
sub _get_koha_calendar_holidays {
    my $dbh = C4::Context->dbh;

    # Query special_holidays table for upcoming holidays (not exceptions)
    # We'll fetch holidays from today onwards
    my $query = <<~'SQL';
        SELECT
            branchcode,
            year,
            month,
            day,
            title,
            description
        FROM special_holidays
        WHERE isexception = 0
        AND CONCAT(year, '-', LPAD(month, 2, '0'), '-', LPAD(day, 2, '0')) >= CURDATE()
        ORDER BY year, month, day
    SQL

    my $sth = $dbh->prepare($query);
    $sth->execute();

    my @koha_holidays;
    while ( my $row = $sth->fetchrow_hashref ) {

        # Convert to deviation format
        # Koha holidays are full-day closures, so we set time to 00:00:00 - 23:59:59
        my $date_str = sprintf '%04d-%02d-%02d', $row->{'year'}, $row->{'month'}, $row->{'day'};

        push @koha_holidays, {
            deviationid     => undef,                                                                                                     # No ID for Koha holidays
            isblackout      => 1,                                                                                                         # Koha holidays are always blackouts
            start           => "$date_str 00:00:00",
            end             => "$date_str 23:59:59",
            recurrencetype  => 'none',
            recurrencedays  => undef,
            recurrenceuntil => undef,
            rrule           => undef,
            description     => join( q{}, $row->{'title'}, ( $row->{'description'} ? join q{}, q{ - }, $row->{'description'} : q{} ) ),
            created         => undef,
            branches        => [ $row->{branchcode} ],
            rooms           => [],                                                                                                        # Applies to all rooms
            is_koha_holiday => 1,    # Flag to identify these as Koha holidays (read-only)
        };
    }

    return \@koha_holidays;
}

1;
