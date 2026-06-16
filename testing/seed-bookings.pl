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

# Volume bookings to exercise the paginated bookings table. Rooms/equipment must
# already exist (run `just seed` first); patrons come from Koha's sample data.

Readonly my $DEFAULT_COUNT  => 200;
Readonly my $FIRST_HOUR     => 9;     # earliest start hour of a seeded booking
Readonly my $HOURS_SPAN     => 8;     # start hours spread over 09:00..16:00
Readonly my $MAX_DURATION   => 3;     # booking length cycles 1..3 hours
Readonly my $BLACKOUT_EVERY => 17;    # every Nth booking is blacked out
Readonly my $EQUIPMENT_EVERY => 3;    # bookings whose id % N == 0 get their room's equipment
Readonly my $SEED_MARKER    => 'Seeded booking #';

my $container = $ENV{CONTAINER_NAME} || 'kohadev-koha-1';
my $binary    = $ENV{DOCKER_BINARY}  || 'docker';
my $count     = $DEFAULT_COUNT;
my $clean     = 0;

GetOptions(
    'container=s' => \$container,
    'binary=s'    => \$binary,
    'count=i'     => \$count,
    'clean'       => \$clean,
);

say colored( ['cyan'], 'Seeding bookings for LMSRoomReservations' );
say "Container: $container";
say '';

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
    bookings           => $table_prefix . '_bookings',
    bookings_equipment => $table_prefix . '_bookings_equipment',
    rooms              => $table_prefix . '_rooms',
    rooms_equipment    => $table_prefix . '_rooms_equipment',
};

# Run a query in the container and return its rows (one value per line).
sub query_rows {
    my ($sql) = @_;

    open my $fh, '-|', $binary, 'exec', '-i', $container, 'koha-mysql', 'kohadev', '-N', '-e', $sql
        or die colored( ['red'], "Failed to query database: $!" );
    my $rows = [ map { chomp; $_ } <$fh> ];
    close $fh;

    return $rows;
}

# Pipe a batch of statements into the container's database.
sub run_sql {
    my ($sql) = @_;

    open my $fh, '|-', $binary, 'exec', '-i', $container, 'koha-mysql', 'kohadev'
        or die colored( ['red'], "Failed to execute database command: $!" );
    print {$fh} $sql;
    close $fh;

    return $? == 0;
}

# Remove any previously seeded bookings (cascade clears their equipment links).
my $cleanup = "DELETE FROM $tables->{bookings} WHERE purpose_of_use LIKE '$SEED_MARKER%';";

if ($clean) {
    say colored( ['cyan'], 'Removing previously seeded bookings...' );
    exit( run_sql($cleanup) ? 0 : 1 );
}

my $room_ids = query_rows("SELECT roomid FROM $tables->{rooms} WHERE deleted_at IS NULL ORDER BY roomid");
if ( !@{$room_ids} ) {
    die colored( ['red'], "No rooms found in $tables->{rooms}. Run `just seed` first.\n" );
}

my $borrowernumbers = query_rows('SELECT borrowernumber FROM borrowers ORDER BY borrowernumber LIMIT 50');
if ( !@{$borrowernumbers} ) {
    die colored( ['red'], "No patrons found in the borrowers table.\n" );
}

say "Using " . scalar( @{$room_ids} ) . ' room(s) and ' . scalar( @{$borrowernumbers} ) . ' patron(s).';
say "Generating $count booking(s)...";

# Spread the bookings symmetrically around today so ordering by `start` produces
# many distinct pages of past and future reservations.
my $values = [];
foreach my $i ( 0 .. $count - 1 ) {
    my $room_id        = $room_ids->[ $i % scalar @{$room_ids} ];
    my $borrowernumber = $borrowernumbers->[ $i % scalar @{$borrowernumbers} ];
    my $day_offset     = $i - int( $count / 2 );
    my $start_hour     = $FIRST_HOUR + ( $i % $HOURS_SPAN );
    my $duration       = 1 + ( $i % $MAX_DURATION );
    my $end_hour       = $start_hour + $duration;
    my $blackedout     = ( $i % $BLACKOUT_EVERY == 0 ) ? 1 : 0;
    my $purpose        = $SEED_MARKER . $i;

    push @{$values},
          "($borrowernumber, $room_id, "
        . "DATE_ADD(DATE_ADD(CURDATE(), INTERVAL $day_offset DAY), INTERVAL $start_hour HOUR), "
        . "DATE_ADD(DATE_ADD(CURDATE(), INTERVAL $day_offset DAY), INTERVAL $end_hour HOUR), "
        . "$blackedout, '$purpose')";
}

my $insert =
    "INSERT INTO $tables->{bookings} (borrowernumber, roomid, `start`, `end`, blackedout, purpose_of_use) VALUES\n"
    . join( ",\n", @{$values} ) . ';';

# Give a representative fraction of seeded bookings (those whose bookingid is a
# multiple of EQUIPMENT_EVERY) the equipment configured for their room.
my $attach_equipment =
      "INSERT IGNORE INTO $tables->{bookings_equipment} (bookingid, equipmentid) "
    . "SELECT b.bookingid, re.equipmentid FROM $tables->{bookings} b "
    . "JOIN $tables->{rooms_equipment} re ON re.roomid = b.roomid "
    . "WHERE b.purpose_of_use LIKE '$SEED_MARKER%' AND (b.bookingid % $EQUIPMENT_EVERY = 0);";

say colored( ['cyan'], 'Loading bookings...' );
my $ok = run_sql( join "\n", $cleanup, $insert, $attach_equipment );

if ($ok) {
    say '';
    say colored( ['green'], "✓ Seeded $count bookings (re-run to refresh; `--clean` to remove)." );
}
else {
    say colored( ['red'], '✗ Failed to seed bookings' );
    exit 1;
}
