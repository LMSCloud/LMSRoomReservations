package Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Misc;

use strict;
use warnings;
use utf8;

use C4::Context;
use Encode;
use Locale::Messages;
Locale::Messages->select_package('gettext_pp');

use Locale::Messages qw(:locale_h :libintl_h);

use Exporter qw(import);
our $VERSION = '1.0.0';
our @EXPORT  = qw(
    get_restricted_message
    is_restricted_category
    get_translation
    get_patron_categories
    clear_patron_category_restriction
    get_restricted_patron_categories
);

sub get_restricted_message {

    my $dbh = C4::Context->dbh;
    my $sql = q{SELECT plugin_value FROM plugin_data WHERE plugin_class = ? AND plugin_key = ?};
    my $sth = $dbh->prepare($sql);
    $sth->execute( 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations', 'restricted_message' );
    my $row = $sth->fetchrow_hashref();

    return $row->{'plugin_value'};
}

sub is_restricted_category {

    my ($category) = @_;

    my $dbh = C4::Context->dbh;

    my $sth = q{};

    my $query = <<~'EOF';
        SELECT COUNT(categorycode)
        FROM categories, plugin_data
        WHERE plugin_class = 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations'
        AND plugin_key LIKE 'rcat_%'
        AND plugin_value = categorycode
        AND plugin_value = ?;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute($category);

    my $rows = $sth->fetchrow_arrayref->[0];

    if ( $rows != 0 ) {
        return 1;    # restricted
    }
    else {
        return 0;    # not restricted
    }
}

sub get_translation {
    my ($string) = @_;
    return Encode::decode( 'UTF-8', gettext($string) );
}

sub get_patron_categories {

    my $dbh = C4::Context->dbh;

    my $sth = q{};

    my $query = <<~'EOF';
        SELECT categorycode, description
        FROM categories
        ORDER BY categorycode ASC;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @categories;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @categories, $row;
    }

    return \@categories;
}

sub clear_patron_category_restriction {

    my ($restricted_category) = @_;

    my $delete_query;

    if ( $restricted_category == undef ) {
        my $dbh = C4::Context->dbh;

        $delete_query = <<~'EOF';
            DELETE FROM plugin_data
            WHERE plugin_class = 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations'
            AND plugin_key LIKE 'rcat_%';
        EOF

        $dbh->do($delete_query);
    }
    else {
        my @restricted = @{$restricted_category};

        my $counter = scalar @restricted;

        my $dbh = C4::Context->dbh;

        $delete_query = <<~"EOF";
            DELETE FROM plugin_data
            WHERE plugin_class = 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations'
            AND plugin_key LIKE 'rcat_%'
        EOF

        if ( $counter == 0 ) {
            $delete_query .= q{;};
        }
        else {
            $delete_query .= q{ AND plugin_value NOT IN (};

            for my $code (@restricted) {

                if ( $counter > 0 && $counter != 1 ) {
                    $delete_query .= "'$code', ";
                }
                else {
                    $delete_query .= "'$code'";
                }

                $counter--;
            }

            $delete_query .= q{);};
        }

        $dbh->do($delete_query);
    }

    return;
}

sub get_restricted_patron_categories {

    my $dbh = C4::Context->dbh;

    my $sth = q{};

    my $query = <<~"EOF";
        SELECT categorycode, description
        FROM categories, plugin_data
        WHERE plugin_class = 'Koha::Plugin::Com::MarywoodUniversity::RoomReservations'
        AND plugin_key LIKE 'rcat_%'
        AND plugin_value = categorycode;
    EOF

    $sth = $dbh->prepare($query);
    $sth->execute();

    my @categories;

    while ( my $row = $sth->fetchrow_hashref() ) {
        push @categories, $row;
    }

    return \@categories;
}
1;
