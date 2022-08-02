package Calendar::Helpers::Limits;

use strict;
use warnings;
use utf8;
use C4::Context;
use Exporter qw(import);
our $VERSION = '1.0.0';
our @EXPORT  = qw(
    get_future_days
    get_max_time
    get_daily_reservation_limit
    get_daily_reservation_limit_of_patron
);

sub get_future_days {

    my $dbh = C4::Context->dbh;
    my $sql = q{SELECT plugin_value FROM plugin_data WHERE plugin_class = ? AND plugin_key = ?};
    my $sth = $dbh->prepare($sql);
    $sth->execute( 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations', 'max_future_days' );
    my $row = $sth->fetchrow_hashref();

    return $row->{'plugin_value'};
}

sub get_max_time {

    my $dbh = C4::Context->dbh;
    my $sql = q{SELECT plugin_value FROM plugin_data WHERE plugin_class = ? AND plugin_key = ?};
    my $sth = $dbh->prepare($sql);
    $sth->execute( 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations', 'max_time' );
    my $row = $sth->fetchrow_hashref();

    return $row->{'plugin_value'};
}

sub get_daily_reservation_limit {

    my $dbh = C4::Context->dbh;
    my $sql = q{SELECT plugin_value FROM plugin_data WHERE plugin_class = ? AND plugin_key = ?};
    my $sth = $dbh->prepare($sql);
    $sth->execute( 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations', 'count_limit' );
    my $row = $sth->fetchrow_hashref();

    return $row->{'plugin_value'};
}

sub get_daily_reservation_limit_of_patron {

    my ( $bn, $date ) = @_;

    $date = "$date%";

    my $dbh = C4::Context->dbh;
    my $sql = q{SELECT COUNT(*) AS daily_total FROM bookings WHERE borrowernumber = ? AND start LIKE ?};
    my $sth = $dbh->prepare($sql);
    $sth->execute( $bn, $date );
    my $row = $sth->fetchrow_hashref();

    return $row->{'daily_total'};
}

1;
