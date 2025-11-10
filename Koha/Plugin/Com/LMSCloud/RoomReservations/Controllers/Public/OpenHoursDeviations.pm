package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::OpenHoursDeviations;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use SQL::Abstract ();
use Try::Tiny     qw( catch try );

our $VERSION = '1.0.0';

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
