package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Public::Libraries;

# This file is part of Koha.
#
# Koha is free software; you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# Koha is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Koha; if not, see <http://www.gnu.org/licenses>.

use Modern::Perl;

use Mojo::Base 'Mojolicious::Controller';
use Koha::Libraries;
use Koha::Library;

use Try::Tiny qw( catch try );
use Readonly;

Readonly::Array my @ALLOWED_PROPERTIES => qw(
    address1
    address2
    address3
    city
    country
    email
    fax
    library_id
    name
    postal_code
    state
    url
);

=head1 NAME

Koha::REST::V1::Library - Koha REST API for handling libraries (V1)

=head1 API

=head2 Methods

=cut

=head3 list

Controller function that handles listing Koha::Library objects
TODO: Remove on 22.11 and later versions

=cut

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $libraries                     = $c->objects->search( Koha::Libraries->new );
        my $libraries_filtered_properties = [];

        foreach my $library_ref ( @{$libraries} ) {
            my $filtered_library = {};
            foreach my $property (@ALLOWED_PROPERTIES) {
                $filtered_library->{$property} = $library_ref->{$property} if exists $library_ref->{$property};
            }
            push @{$libraries_filtered_properties}, $filtered_library;
        }

        return $c->render( status => 200, openapi => $libraries_filtered_properties );
    } catch {
        $c->unhandled_exception($_);
    };
}

1;
