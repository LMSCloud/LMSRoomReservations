package Calendar::Helpers::Times;

use strict;
use warnings;
use utf8;
use C4::Context;
use Readonly;
use feature qw(switch);
use POSIX qw(strftime);
use Exporter qw(import);

our $VERSION = '1.0.0';
our @EXPORT  = qw(
    get_opening_hours
    get_confirmed_calendar_bookings_by_month_and_year
    get_current_timestamp
    delete_opening_hours_by_id
    add_opening_hours
);

my $ROOMS_TABLE         = 'booking_rooms';
my $OPENING_HOURS_TABLE = 'booking_opening_hours';
my $BOOKINGS_TABLE      = 'bookings';

sub get_opening_hours {

    my $convert_weekdays = 0;
    $convert_weekdays = shift;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = <<~"EOF";
        SELECT openid,day, DATE_FORMAT(start, '%H:%i') as start, DATE_FORMAT(end, '%H:%i') as end
        FROM $OPENING_HOURS_TABLE
        ORDER BY day ASC, start ASC;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @opening_hours;
    Readonly my $MONDAY    => 1;
    Readonly my $TUESDAY   => 2;
    Readonly my $WEDNESDAY => 3;
    Readonly my $THRUSDAY  => 4;
    Readonly my $FRIDAY    => 5;
    Readonly my $SATURDAY  => 6;
    Readonly my $SUNDAY    => 7;

    while ( my $row = $sth->fetchrow_hashref() ) {
        if ( $convert_weekdays == 1 ) {
            given ( $row->{'day'} ) {
                when ($MONDAY)    { $row->{'day'} = 'Monday'; }
                when ($TUESDAY)   { $row->{'day'} = 'Tuesday'; }
                when ($WEDNESDAY) { $row->{'day'} = 'Wednesday'; }
                when ($THRUSDAY)  { $row->{'day'} = 'Thursday'; }
                when ($FRIDAY)    { $row->{'day'} = 'Friday'; }
                when ($SATURDAY)  { $row->{'day'} = 'Saturday'; }
                when ($SUNDAY)    { $row->{'day'} = 'Sunday'; }
            }
        }
        push @opening_hours, $row;
    }

    return \@opening_hours;
}

sub get_confirmed_calendar_bookings_by_month_and_year {

    my ( $month, $year ) = @_;

    ## zero-pad the month to be DATETIME-friendly (two-digit)
    $month = sprintf '%02s', $month;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    ## Returns hashref of the fields:
    ## roomnumber, monthdate, bookedtime
    my $query = <<~"EOF";
        SELECT r.roomnumber,
        DATE_FORMAT(b.start, "%Y") AS year_start,
        DATE_FORMAT(b.start, "%c") AS month_start,
        DATE_FORMAT(b.start, "%e") AS monthdate_start,
        DATE_FORMAT(b.start, "%Y") AS year_end,
        DATE_FORMAT(b.end, "%c") AS month_end,
        DATE_FORMAT(b.end, "%e") AS monthdate_end,
        CONCAT(DATE_FORMAT(b.start, "%H:%i"), " - ", DATE_FORMAT(b.end, "%H:%i")) AS bookedtime
        FROM $ROOMS_TABLE AS r, $BOOKINGS_TABLE AS b WHERE r.roomid = b.roomid
        AND $month BETWEEN DATE_FORMAT(b.start, "%c") AND DATE_FORMAT(b.end, "%c")
        AND $year BETWEEN DATE_FORMAT(b.start, "%Y") AND DATE_FORMAT(b.end, "%Y")
        ORDER BY b.roomid ASC, start ASC
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @calendar_bookings;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @calendar_bookings, $row;
    }

    return \@calendar_bookings;
}

sub get_current_timestamp {

    my $timestamp = strftime( '%m/%d/%Y %I:%M:%S %p', localtime );

    return $timestamp;
}

sub delete_opening_hours_by_id {

    my ($openId) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = q{};

    my $query = qq{DELETE FROM booking_opening_hours WHERE openid = $openId;};

    $sth = $dbh->prepare($query);
    my $count = $sth->execute();

    $count == 0
        ? return 0
        : return 1;    # ? no row(s) affected : sucessfully deleted row(s)

    return;
}

sub add_opening_hours {
    my ( $days, $start, $end ) = @_;

    my $dbh = C4::Context->dbh;

    foreach my $day ( @{$days} ) {
        if ($day) {
            my $statement = <<~"EOF";
                INSERT INTO $OPENING_HOURS_TABLE (day, start, end)
                VALUES ($day, '$start', '$end');
            EOF
            $dbh->do($statement);
        }
    }

    return;
}
1;
