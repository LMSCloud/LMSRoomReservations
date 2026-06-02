#!/usr/bin/env perl

use Modern::Perl;

use Test::More tests => 7;

use FindBin qw( $Bin );
use lib "$Bin/lib";

use DateTime ();

use t::lib::TestBuilder;
use t::lib::Mocks;

use Koha::Database;

use Koha::Plugin::Com::LMSCloud::RoomReservations::Checks ();

# _expand_deviation_instances is a pure function of its deviation hashref plus a
# booking date range — it touches no database — so it can be exercised directly.
# This characterization test pins the set of instances each recurrence branch
# produces. The call convention is isolated to expand() so that interface
# refactors only touch that one wrapper, while every assertion below keeps
# guarding the expansion logic itself.

sub dt {
    my ($iso) = @_;
    my ( $y, $mo, $d, $h, $mi ) = $iso =~ /(\d+)-(\d+)-(\d+)T(\d+):(\d+)/sm;
    return DateTime->new( year => $y, month => $mo, day => $d, hour => $h, minute => $mi );
}

sub iso {
    my ($datetime) = @_;
    return $datetime->strftime('%Y-%m-%dT%H:%M');
}

sub expand {
    my ( $deviation, $range_start_iso, $range_end_iso ) = @_;
    my $instances = Koha::Plugin::Com::LMSCloud::RoomReservations::Checks::_expand_deviation_instances(
        $deviation,
        dt($range_start_iso),
        dt($range_end_iso),
    );
    return [ map { iso( $_->{start} ) . q{..} . iso( $_->{end} ) } @{$instances} ];
}

# 2027-01-04 is a Monday.

subtest 'non-recurring yields the single window verbatim' => sub {
    plan tests => 1;

    my $deviation = {
        start          => '2027-01-04 10:00:00',
        end            => '2027-01-04 14:00:00',
        recurrencetype => 'none',
    };

    is_deeply(
        expand( $deviation, '2027-01-04T00:00', '2027-01-04T23:59' ),
        ['2027-01-04T10:00..2027-01-04T14:00'],
        'one instance, unchanged'
    );
};

subtest 'unknown recurrence type yields no instances' => sub {
    plan tests => 1;

    my $deviation = {
        start          => '2027-01-04 10:00:00',
        end            => '2027-01-04 14:00:00',
        recurrencetype => 'fortnightly',
    };

    is_deeply(
        expand( $deviation, '2027-01-04T00:00', '2027-01-31T23:59' ),
        [],
        'an unrecognised pattern expands to nothing'
    );
};

subtest 'daily repeats every day through the cutoff' => sub {
    plan tests => 1;

    my $deviation = {
        start           => '2027-01-04 10:00:00',
        end             => '2027-01-04 11:00:00',
        recurrencetype  => 'daily',
        recurrenceuntil => '2027-01-06',
    };

    is_deeply(
        expand( $deviation, '2027-01-04T00:00', '2027-01-06T23:59' ),
        [   '2027-01-04T10:00..2027-01-04T11:00',
            '2027-01-05T10:00..2027-01-05T11:00',
            '2027-01-06T10:00..2027-01-06T11:00',
        ],
        'three daily instances, bounded by recurrenceuntil'
    );
};

subtest 'weekly with recurrencedays matches the listed weekdays' => sub {
    plan tests => 1;

    # 0=Mon..6=Sun. '0,2' => Mondays and Wednesdays.
    my $deviation = {
        start           => '2027-01-04 10:00:00',
        end             => '2027-01-04 12:00:00',
        recurrencetype  => 'weekly',
        recurrencedays  => '0,2',
        recurrenceuntil => '2027-01-17',
    };

    is_deeply(
        expand( $deviation, '2027-01-04T00:00', '2027-01-17T23:59' ),
        [   '2027-01-04T10:00..2027-01-04T12:00',    # Mon
            '2027-01-06T10:00..2027-01-06T12:00',    # Wed
            '2027-01-11T10:00..2027-01-11T12:00',    # Mon
            '2027-01-13T10:00..2027-01-13T12:00',    # Wed
        ],
        'only the listed weekdays recur'
    );
};

subtest 'weekly without recurrencedays repeats the original weekday' => sub {
    plan tests => 1;

    my $deviation = {
        start           => '2027-01-04 10:00:00',    # Monday
        end             => '2027-01-04 12:00:00',
        recurrencetype  => 'weekly',
        recurrenceuntil => '2027-01-18',
    };

    is_deeply(
        expand( $deviation, '2027-01-04T00:00', '2027-01-18T23:59' ),
        [   '2027-01-04T10:00..2027-01-04T12:00',
            '2027-01-11T10:00..2027-01-11T12:00',
            '2027-01-18T10:00..2027-01-18T12:00',
        ],
        'recurs on Mondays, the original weekday'
    );
};

subtest 'weekdays matches Monday through Friday only' => sub {
    plan tests => 1;

    my $deviation = {
        start           => '2027-01-04 10:00:00',    # Monday
        end             => '2027-01-04 11:00:00',
        recurrencetype  => 'weekdays',
        recurrenceuntil => '2027-01-10',
    };

    is_deeply(
        expand( $deviation, '2027-01-04T00:00', '2027-01-10T23:59' ),
        [   '2027-01-04T10:00..2027-01-04T11:00',    # Mon
            '2027-01-05T10:00..2027-01-05T11:00',    # Tue
            '2027-01-06T10:00..2027-01-06T11:00',    # Wed
            '2027-01-07T10:00..2027-01-07T11:00',    # Thu
            '2027-01-08T10:00..2027-01-08T11:00',    # Fri
        ],
        'the weekend is skipped'
    );
};

subtest 'monthly matches the original day of month' => sub {
    plan tests => 1;

    my $deviation = {
        start           => '2027-01-04 10:00:00',
        end             => '2027-01-04 11:00:00',
        recurrencetype  => 'monthly',
        recurrenceuntil => '2027-03-31',
    };

    is_deeply(
        expand( $deviation, '2027-01-04T00:00', '2027-03-31T23:59' ),
        [   '2027-01-04T10:00..2027-01-04T11:00',
            '2027-02-04T10:00..2027-02-04T11:00',
            '2027-03-04T10:00..2027-03-04T11:00',
        ],
        'recurs on the 4th of each month'
    );
};
