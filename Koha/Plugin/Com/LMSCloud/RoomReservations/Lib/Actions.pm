package Koha::Plugin::Com::LMSCloud::RoomReservations::lib::Actions;

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

use Koha::Plugin::Com::LMSCloud::RoomReservations;

BEGIN {
    our @EXPORT_OK = qw( send_email_confirmation );
}

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new();

my $ROOMS_TABLE = $self ? $self->get_qualified_table_name('rooms') : undef;

sub send_email_confirmation {
    my ($body) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # If we are not going to send any emails we can return early
    my $send_confirmation = $body->{'send_confirmation'};
    my $reply_to_address  = $self->retrieve_data('reply_to_address');
    if ( !$send_confirmation && !$reply_to_address ) {
        return 0;
    }

    if ( !$body->{'letter_code'} ) {
        return 0;
    }

    # We have to fetch the roomnumber for the given roomid
    my ( $stmt, @bind ) =
        $sql->select( $ROOMS_TABLE, q{*}, { roomid => $body->{'roomid'} } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my $room = $sth->fetchrow_hashref();

    # Then we fetch the patron
    my $patron = Koha::Patrons->find( $body->{'borrowernumber'} );
    if ( !$patron ) {
        return 0;
    }

    # We need to get the letter template from the body and create the $letter
    # variable accordingly because they need different substitutions
    my $letters = {
        q{ROOM_RESERVATION} => {
            module                 => 'members',
            letter_code            => 'ROOM_RESERVATION',
            message_transport_type => 'email',
            substitute             => {
                user => $patron->firstname . q{ } . $patron->surname,
                room => $room->{'roomnumber'},
                from => Time::Piece->strptime( $body->{'start'}, '%Y-%m-%dT%H:%M' )->strftime('%Y-%m-%d %H:%M'),
                to   => Time::Piece->strptime( $body->{'end'},   '%Y-%m-%dT%H:%M' )->strftime('%Y-%m-%d %H:%M'),
                confirmed_timestamp => Time::Piece->new->strftime('%Y-%m-%d %H:%M:%S'),
            },
        },
        q{ROOM_CANCELLATION} => {
            module                 => 'members',
            letter_code            => 'ROOM_CANCELLATION',
            message_transport_type => 'email',
            substitute             => {
                user => $patron->firstname . q{ } . $patron->surname,
                room => $room->{'roomnumber'},
                from => Time::Piece->strptime( $body->{'start'}, '%Y-%m-%dT%H:%M' )->strftime('%Y-%m-%d %H:%M'),
                to   => Time::Piece->strptime( $body->{'end'},   '%Y-%m-%dT%H:%M' )->strftime('%Y-%m-%d %H:%M'),
                confirmed_timestamp => Time::Piece->new->strftime('%Y-%m-%d %H:%M:%S'),
            }
        }
    };

    my $letter = C4::Letters::GetPreparedLetter( %{ $letters->{ $body->{'letter_code'} } } );

    my @message_ids;
    if ( $send_confirmation && $patron->email ) {
        push @message_ids,
            C4::Letters::EnqueueLetter(
            {
                letter                 => $letter,
                borrowernumber         => $body->{'borrowernumber'},
                branchcode             => $patron->branchcode,
                message_transport_type => 'email',
            }
            );
    }

    if ($reply_to_address) {
        push @message_ids,
            C4::Letters::EnqueueLetter(
            {
                letter                 => $letter,
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
