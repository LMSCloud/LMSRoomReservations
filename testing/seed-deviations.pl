#!/usr/bin/env perl

use Modern::Perl;
use utf8;
use 5.010;

use FindBin qw( $RealBin );
use File::Spec;
use Term::ANSIColor qw( colored );
use Getopt::Long;
use Readonly qw( Readonly );

binmode STDOUT, ':encoding(UTF-8)';

# Seeds open-hours blackout/special-hours deviations to exercise the OPAC
# calendar's synthetic "Closed" entries. Rooms/open hours must already exist
# (run `just seed` first). Every seeded row is tagged in the unused `rrule`
# column so `--clean` can remove them without touching real deviations.

Readonly my $SEED_MARKER => 'seed:lmsrr';

# Recurrence-day codes are 0=Mon .. 6=Sun (matches the plugin's storage).
Readonly my $WEDNESDAY => 2;

my $container = $ENV{CONTAINER_NAME} || 'kohadev-koha-1';
my $binary    = $ENV{DOCKER_BINARY}  || 'docker';
my $database  = $ENV{DATABASE_NAME}  || 'kohadev';
my $branch    = $ENV{BRANCH_CODE}    || 'CPL';
my $clean     = 0;

GetOptions(
    'container=s' => \$container,
    'binary=s'    => \$binary,
    'database=s'  => \$database,
    'branch=s'    => \$branch,
    'clean'       => \$clean,
);

say colored( ['cyan'], 'Seeding open-hours deviations for LMSRoomReservations' );
say "Container: $container";
say "Branch: $branch";
say q{};

# Resolve the plugin's table prefix the same way seed-fixtures.pl does.
my $env_file     = File::Spec->catfile( $RealBin, '..', '.env' );
my $plugin_class = 'Koha::Plugin::Com::LMSCloud::RoomReservations';
if ( -f $env_file ) {
    open my $fh, '<', $env_file or die "Cannot open $env_file: $!";
    while ( my $line = <$fh> ) {
        chomp $line;
        if ( $line =~ /^PLUGIN_CLASS_NAME=(.+)$/xms ) {
            $plugin_class = $1;
            last;
        }
    }
    close $fh;
}

my $table_prefix = lc $plugin_class;
$table_prefix =~ s/::/_/gxms;

my $tables = {
    deviations => $table_prefix . '_open_hours_deviations',
    branches   => $table_prefix . '_deviation_branches',
    rooms      => $table_prefix . '_deviation_rooms',
};

# Pipe a batch of statements into the container's database.
sub run_sql {
    my ($sql) = @_;

    open my $fh, '|-', $binary, 'exec', '-i', $container, 'koha-mysql', $database
        or die colored( ['red'], "Failed to execute database command: $!" );
    print {$fh} $sql;
    close $fh;

    return $? == 0;
}

# Remove anything previously seeded (cascade clears branch/room junction rows).
my $cleanup = "DELETE FROM $tables->{deviations} WHERE rrule = '$SEED_MARKER';";

if ($clean) {
    say colored( ['cyan'], 'Removing previously seeded deviations...' );
    exit( run_sql($cleanup) ? 0 : 1 );
}

# A datetime relative to today: TIMESTAMP(date, time) combines the two.
sub at {
    my ( $day_offset, $time ) = @_;
    return "TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL $day_offset DAY), '$time')";
}

# A date relative to today.
sub on {
    my ($day_offset) = @_;
    return "DATE_ADD(CURDATE(), INTERVAL $day_offset DAY)";
}

# Each spec exercises one rendering path of the new calendar converter.
my $deviations = [
    {   description    => 'Public Holiday',
        isblackout     => 1,
        start          => at( 1, '00:00:00' ),
        end            => at( 1, '23:59:59' ),
        recurrencetype => 'none',
        branches       => [],                    # all branches
        rooms          => [],                    # all rooms -> "Closed" banner
    },
    {   description    => 'Staff Training Days',
        isblackout     => 1,
        start          => at( 5, '00:00:00' ),
        end            => at( 7, '23:59:59' ),    # multi-day -> spanning banner
        recurrencetype => 'none',
        branches       => [$branch],
        rooms          => [],
    },
    {   description    => 'Maintenance Window',
        isblackout     => 1,
        start          => at( 2, '14:00:00' ),
        end            => at( 2, '16:00:00' ),    # partial -> timed block
        recurrencetype => 'none',
        branches       => [$branch],
        rooms          => [],
    },
    {   description    => 'Deep Cleaning',
        isblackout     => 1,
        start          => at( 3, '00:00:00' ),
        end            => at( 3, '23:59:59' ),
        recurrencetype => 'none',
        branches       => [],
        rooms          => [1],                    # room-scoped -> "Closed: Room 101"
    },
    {   description    => 'Furniture Delivery',
        isblackout     => 1,
        start          => at( 4, '00:00:00' ),
        end            => at( 4, '23:59:59' ),
        recurrencetype => 'none',
        branches       => [],
        rooms          => [ 3, 4 ],               # multi-room -> "Closed: Study Room A, Study Room B"
    },
    {   description     => 'Closed every Wednesday',
        isblackout      => 1,
        start           => at( -14, '00:00:00' ),
        end             => at( -14, '23:59:59' ),
        recurrencetype  => 'weekly',
        recurrencedays  => $WEDNESDAY,
        recurrenceuntil => on(56),                # recurring full-day banners
        branches        => [],
        rooms           => [],
    },
    {   description     => 'Early Closing',
        isblackout      => 1,
        start           => at( 0, '16:00:00' ),
        end             => at( 0, '17:00:00' ),
        recurrencetype  => 'weekdays',
        recurrenceuntil => on(14),                # recurring timed blocks Mon-Fri
        branches        => [$branch],
        rooms           => [],
    },
    {   description    => 'Reduced Service Hours',
        isblackout     => 0,                       # special hours -> must NOT appear
        start          => at( 1, '10:00:00' ),
        end            => at( 1, '14:00:00' ),
        recurrencetype => 'none',
        branches       => [$branch],
        rooms          => [],
    },
];

# SQL literal for a possibly-undef value.
sub val {
    my ($v) = @_;
    return defined $v ? "'$v'" : 'NULL';
}

my @statements = ($cleanup);
for my $d ( @{$deviations} ) {
    push @statements,
          "INSERT INTO $tables->{deviations} "
        . '(isblackout, `start`, `end`, recurrencetype, recurrencedays, recurrenceuntil, rrule, description) VALUES ('
        . join( ', ',
        $d->{isblackout}, $d->{start}, $d->{end},
        val( $d->{recurrencetype} ), val( $d->{recurrencedays} ), $d->{recurrenceuntil} || 'NULL',
        "'$SEED_MARKER'", val( $d->{description} ) )
        . ');';

    push @statements, 'SET @id := LAST_INSERT_ID();';

    for my $b ( @{ $d->{branches} } ) {
        push @statements, "INSERT INTO $tables->{branches} (deviationid, branch) VALUES (\@id, '$b');";
    }
    for my $r ( @{ $d->{rooms} } ) {
        push @statements, "INSERT INTO $tables->{rooms} (deviationid, roomid) VALUES (\@id, $r);";
    }
}

say colored( ['cyan'], 'Loading deviations...' );
my $ok = run_sql( join "\n", @statements );

if ($ok) {
    say q{};
    say colored( ['green'], '✓ Seeded ' . scalar( @{$deviations} ) . ' deviations (re-run to refresh; `--clean` to remove).' );
    say q{};
    say 'Seeded closures exercise: full-day banner, multi-day span, partial timed block,';
    say 'room-scoped headings, weekly + weekdays recurrence, and one special-hours row';
    say 'that must stay off the calendar.';
}
else {
    say colored( ['red'], '✗ Failed to seed deviations' );
    exit 1;
}
