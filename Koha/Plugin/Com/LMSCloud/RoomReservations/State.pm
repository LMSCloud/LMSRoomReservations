package Koha::Plugin::Com::LMSCloud::RoomReservations::State;

use Modern::Perl;
use utf8;
use 5.010;

use C4::Context ();

use Exporter 'import';
use SQL::Abstract ();

our $VERSION = '1.0.0';

BEGIN {
    our @EXPORT_OK = qw( get_patron_categories get_restricted_patron_categories );
}

sub get_patron_categories {
    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    my ( $stmt, @bind ) =
        $sql->select( 'categories', [ 'categorycode', 'description' ], undef, { -asc => 'categorycode' } );

    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);

    return $sth->fetchall_arrayref( {} );
}

sub get_restricted_patron_categories {
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
