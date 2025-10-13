#!/usr/bin/env perl

use Modern::Perl;
use utf8;
use 5.010;

use FindBin qw( $RealBin );
use File::Spec;
use Term::ANSIColor qw( colored );
use Getopt::Long;

# Get options
my $container = $ENV{CONTAINER_NAME} || 'kohadev-koha-1';
my $binary    = $ENV{DOCKER_BINARY}  || 'docker';
my $branch    = $ENV{BRANCH_CODE}    || 'CPL';

GetOptions(
    'container=s' => \$container,
    'binary=s'    => \$binary,
    'branch=s'    => \$branch,
);

say colored( ['cyan'], "Seeding test fixtures for LMSRoomReservations" );
say "Container: $container";
say "Branch: $branch";
say "";

# Load .env to get plugin class name
my $env_file = File::Spec->catfile( $RealBin, '..', '.env' );
my $plugin_class = 'Koha::Plugin::Com::LMSCloud::RoomReservations';

if ( -f $env_file ) {
    open my $fh, '<', $env_file or die "Cannot open $env_file: $!";
    while ( my $line = <$fh> ) {
        chomp $line;
        if ( $line =~ /^PLUGIN_CLASS_NAME=(.+)$/ ) {
            $plugin_class = $1;
            last;
        }
    }
    close $fh;
}

# Convert plugin class name to table prefix
# Koha::Plugin::Com::LMSCloud::RoomReservations -> koha_plugin_com_lmscloud_roomreservations
my $table_prefix = lc($plugin_class);
$table_prefix =~ s/::/_/g;

# Table names
my $rooms_table           = $table_prefix . '_rooms';
my $equipment_table       = $table_prefix . '_equipment';
my $rooms_equipment_table = $table_prefix . '_rooms_equipment';
my $open_hours_table      = $table_prefix . '_open_hours';

say colored( ['yellow'], "Using table names:" );
say "  - $rooms_table";
say "  - $equipment_table";
say "  - $rooms_equipment_table";
say "  - $open_hours_table";
say "";

# Read seed file
my $seed_file = File::Spec->catfile( $RealBin, 'fixtures', 'seed.sql' );
die colored( ['red'], "Error: Seed file not found: $seed_file" ) unless -f $seed_file;

open my $fh, '<:utf8', $seed_file or die "Cannot open $seed_file: $!";
my $sql = do { local $/; <$fh> };
close $fh;

# Replace placeholders
$sql =~ s/__ROOMS_TABLE__/$rooms_table/g;
$sql =~ s/__EQUIPMENT_TABLE__/$equipment_table/g;
$sql =~ s/__ROOMS_EQUIPMENT_TABLE__/$rooms_equipment_table/g;
$sql =~ s/__OPEN_HOURS_TABLE__/$open_hours_table/g;
$sql =~ s/__BRANCH__/$branch/g;

# Execute SQL in container
say colored( ['cyan'], "Loading fixtures..." );

# Pipe SQL to docker exec
open my $docker, '|-', $binary, 'exec', '-i', $container, 'koha-mysql', 'kohadev'
    or die colored( ['red'], "Failed to execute docker command: $!" );

print $docker $sql;

close $docker;

if ( $? == 0 ) {
    say "";
    say colored( ['green'], "✓ Fixtures loaded successfully!" );
    say "";
    say "Sample data created:";
    say "  - 5 Equipment items (Projector, Whiteboard, Video Conference, Laptop, Microphone)";
    say "  - 5 Rooms with varying capacities (Room 101, Room 202, Study Room A/B, Auditorium)";
    say "  - Equipment assignments for each room";
    say "  - Open hours (Mon-Fri, 9am-5pm)";
    say "";
    say colored( ['green'], "You can now test the room reservation system!" );
}
else {
    say colored( ['red'], "✗ Failed to load fixtures" );
    exit 1;
}
