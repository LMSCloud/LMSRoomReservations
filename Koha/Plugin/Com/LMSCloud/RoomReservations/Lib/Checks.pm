package Koha::Plugin::Com::LMSCloud::RoomReservations::Lib::Checks;

use Modern::Perl;
use utf8;
use 5.010;

use SQL::Abstract;
use Try::Tiny;

use C4::Context;
use Koha::Patrons;

use Koha::Plugin::Com::LMSCloud::RoomReservations::Lib::State qw( get_patron_categories get_restricted_patron_categories );

our $VERSION = '1.0.0';
use Exporter 'import';

BEGIN {
    our @EXPORT_OK = qw( is_allowed_to_book );
}

sub is_allowed_to_book {
    my ($borrowernumber) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # We have to check whether the borrowernumber is allowed to book the room.
    # Therefore we have to check the roomid against the borrowernumber's categorycode.
    my $patron = Koha::Patrons->find($borrowernumber);
    if ( !$patron ) {
        return 0;
    }

    my $is_allowed = 1;
    foreach my $category ( @{ get_restricted_patron_categories() } ) {
        if ( $category->{'categorycode'} eq $patron->categorycode ) {
            $is_allowed = 0;
            last;
        }
    }

    return $is_allowed;
}

1;
