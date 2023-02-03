package Koha::Plugin::Com::LMSCloud::RoomReservations::Lib::Actions;

use Modern::Perl;
use utf8;
use 5.010;

use SQL::Abstract;
use Try::Tiny;
use Time::Piece;

use C4::Context;
use C4::Letters;
use Koha::Patrons;

our $VERSION = '1.0.0';
use Exporter 'import';

BEGIN {
    our @EXPORT_OK = qw( send_email_confirmation );
}

my $self = undef;
if ( Koha::Plugin::Com::LMSCloud::RoomReservations->can('new') ) {
    $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();
}

my $ROOMS_TABLE = $self ? $self->get_qualified_table_name('rooms') : undef;

sub send_email_confirmation {
    my ($body) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # We have to fetch the roomnumber for the given roomid
    my ( $stmt, @bind ) = $sql->select( $ROOMS_TABLE, q{*}, { roomid => $body->{'roomid'} } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my $room = $sth->fetchrow_hashref();

    # Then we fetch the patron
    my $patron = Koha::Patrons->find( $body->{'borrowernumber'} );
    if ( !$patron ) {
        return 0;
    }

    my $letter = C4::Letters::GetPreparedLetter(
        module                 => 'members',
        letter_code            => 'ROOM_RESERVATION',
        lang                   => $patron->lang,
        message_transport_type => 'email',
        substitute             => {
            user                => "$patron->firstname $patron->surname",
            room                => $room->{'roomnumber'},
            from                => $body->{'start'},
            to                  => $body->{'end'},
            confirmed_timestamp => Time::Piece->new->strftime('%Y-%m-%d %H:%M:%S'),
        },
    );

    my $send_confirmation = $body->{'send_confirmation'};
    my $reply_to_address  = $self->retrieve_data('reply_to_address');
    if ( !$send_confirmation && !$reply_to_address ) {
        return 0;
    }

    my @message_ids;
    if ( $send_confirmation && $patron->email ) {
        push @message_ids,
            C4::Letters::EnqueueLetter(
            {   letter                 => $letter,
                borrowernumber         => $body->{'borrowernumber'},
                branchcode             => $patron->branchcode,
                message_transport_type => 'email',
            }
            );
    }

    if ($reply_to_address) {
        push @message_ids,
            C4::Letters::EnqueueLetter(
            {   letter                 => $letter,
                to_address             => $reply_to_address,
                branchcode             => $patron->branchcode,
                message_transport_type => 'email',
            }
            );
    }

    for my $message_id (@message_ids) {
        C4::Letters::SendQueuedMessages( { message_id => $message_id } );
    }

    if ( $send_confirmation && $patron->email ) {
        return C4::Letters::GetMessage( shift @message_ids )->{'status'} eq 'sent' ? 1 : 0;
    }

    return 0;
}

1;