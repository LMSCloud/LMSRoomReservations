#!/usr/bin/perl
#
# Copyright 2017 Marywood University
#
# This file is not part of Koha.
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
use strict;
use warnings;
use utf8;
use English qw( -no_match_vars );
use Modern::Perl;

our $VERSION = q{1.0.0};

use Carp;
use C4::Context;
use C4::Output;
use C4::Auth;
use C4::Languages;
use C4::Letters;
use Koha::Email;
use Mail::Sendmail;
use MIME::QuotedPrint;
use MIME::Base64;
use Koha::Patrons;
use Koha::Patron::Category;
use Koha::Patron::Categories;
use Koha::DateUtils;
use Cwd qw( abs_path );
use File::Basename qw( dirname );
use POSIX qw( floor );
use DateTime;
use Readonly;

use CGI qw ( -utf8 );

# use Data::Dumper;
use Locale::Messages;
Locale::Messages->select_package('gettext_pp');
use Locale::Messages qw(:locale_h :libintl_h);

use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Bookings;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Equipment;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Limits;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Misc;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Rooms;
use Koha::Plugin::Com::MarywoodUniversity::RoomReservations::Calendar::Helpers::Times;

use Calendar::Simple;

my $plugin_dir = dirname( abs_path($PROGRAM_NAME) );

my @months = (
    gettext('January'), gettext('February'), gettext('March'),     gettext('April'),   gettext('May'),      gettext('June'),
    gettext('July'),    gettext('August'),   gettext('September'), gettext('October'), gettext('November'), gettext('December'),
);

my $template_name  = $plugin_dir . '/calendar.tt';
my $template2_name = $plugin_dir . '/calendar-sendconfirmation.tt';

my $rooms_table         = 'booking_rooms';
my $opening_hours_table = 'booking_opening_hours';
my $bookings_table      = 'bookings';
my $equipment_table     = 'booking_equipment';
my $roomequipment_table = 'booking_room_equipment';

my $valid;    # used to check if booking still valid prior to insertion of new booking

my $cgi = CGI->new;

# initial value -- calendar is displayed while $op is undef
# otherwise one of the form pages is displayed
my $op = $cgi->param('op');

my ( $template, $borrowernumber, $cookie ) = get_template_and_user(
    {   template_name   => $template_name,
        query           => $cgi,
        type            => 'opac',
        authnotrequired => 0,
        is_plugin       => 1,
    }
);

$template->param(
    language => C4::Languages::getlanguage($cgi) || 'en',
    mbf_path => abs_path('../translations')
);

DEFAULT: {
    if ( !defined $op ) {
        Readonly my $MONTH                 => 1;
        Readonly my $LOCALTIME_BASE_YEAR   => 1900;
        Readonly my $LOCALTIME_MONTH_FIELD => 4;
        Readonly my $LOCALTIME_YEAR_FIELD  => 5;
        Readonly my $MONTHS_IN_YEAR        => 12;

        my $selected_month = $cgi->param('selected_month');

        my $mon = (localtime)[$LOCALTIME_MONTH_FIELD] + $MONTH;
        my $yr  = (localtime)[$LOCALTIME_YEAR_FIELD] + $LOCALTIME_BASE_YEAR;

        if ( defined $selected_month ) {
            $yr  = $yr + floor( ( $mon + $selected_month - 1 ) / $MONTHS_IN_YEAR );
            $mon = ( $mon + $selected_month ) % $MONTHS_IN_YEAR;
            if ( $mon == 0 ) {
                $mon = $MONTHS_IN_YEAR;
            }
        }

        my @month = calendar( $mon, $yr );
        my @month_days;

        foreach (@month) {
            push @month_days, map { $_ ? sprintf '%d', $_ : q{} } @{$_};
        }

        my $calendar_bookings = get_confirmed_calendar_bookings_by_month_and_year( $mon, $yr );

        my $dt       = DateTime->new( year => $yr, month => $mon, day => 1, );
        my $dt_start = DateTime->new( year => $yr, month => $mon, day => 1, );
        my $dt_end   = DateTime->new( year => $yr, month => $mon, day => 1, );

        my @booking_days;
        for my $month_day (@month_days) {
            if ( $month_day eq q{} ) { next; }

            my @bookings;
            $dt->set( day => $month_day );

            for my $booking ( @{$calendar_bookings} ) {
                $dt_start->set( day => $booking->{'monthdate_start'}, month => $booking->{'month_start'}, year => $booking->{'year_start'} );
                $dt_end->set( day => $booking->{'monthdate_end'}, month => $booking->{'month_end'}, year => $booking->{'year_end'} );
                if ( DateTime->compare( $dt, $dt_start ) >= 0 && DateTime->compare( $dt, $dt_end ) <= 0 ) {
                    push @bookings, $booking;
                }
            }
            push @booking_days, \@bookings;
        }

        my $month = sprintf '%02s', $mon;
        my $rooms = get_rooms_with_equipment();

        my $userenv  = C4::Context->userenv;
        my $number   = $userenv->{'number'};
        my $patron   = Koha::Patrons->find($number);
        my $category = $patron->category->categorycode;

        my $is_restricted = is_restricted_category($category);

        my $restricted_message = get_restricted_message();

        if ( $is_restricted > 0 ) {
            $template->param(
                is_restricted         => 1,
                is_restricted_message => $restricted_message,
                patron_category       => $category,
            );
        }
        else {
            $template->param(
                is_restricted   => undef,
                patron_category => $category,
            );
        }

        $template->param(
            current_month_cal => \@month_days,
            calendar_bookings => $calendar_bookings,
            booking_days      => \@booking_days,
            active_month      => $months[ $mon - 1 ],
            active_year       => $yr + 0,
            month_is_active   => 1,
            op                => $op,
            plugin_dir        => $plugin_dir,
            rooms             => $rooms,
            selected_month    => $selected_month,
        );
    }
}

AVAILABILITY_SEARCH: {
    if ( defined $op && $op eq 'availability-search' ) {

        my $equipment     = load_all_equipment();
        my $rooms         = get_rooms_with_equipment();
        my $max_num_days  = get_future_days() || '0';
        my $max_time      = get_max_time()    || '0';
        my $opening_hours = get_opening_hours(1);

        if ( $max_num_days eq '0' ) { $max_num_days = q{}; }
        if ( $max_time eq '0' )     { $max_time     = q{}; }

        my $submit_check_room_availability = $cgi->param('submit-check-room-availability') || q{};
        my $pre_selected_room_id           = $cgi->param('room-id')                        || q{};

        if ( $submit_check_room_availability ne q{} ) {

            my $start_date        = $cgi->param('availability-search-start-date');
            my $start_time        = $cgi->param('availability-search-start-time');
            my $end_date          = $cgi->param('availability-search-end-date');
            my $end_time          = $cgi->param('availability-search-end-time');
            my $start_datetime    = dt_from_string( sprintf '%s %s', $start_date, $start_time );
            my $end_datetime      = dt_from_string( sprintf '%s %s', $end_date,   $end_time );
            my $room_id           = $cgi->param('availability-search-room');
            my $is_room_available = get_room_availability( $room_id, $start_datetime, $end_datetime );

            if ($is_room_available) {    # --> go to confirmation page
                my $displayed_start          = output_pref( { dt => $start_datetime, } );
                my $displayed_end            = output_pref( { dt => $end_datetime, } );
                my $displayed_event_time     = "$displayed_start - $displayed_end";
                my $user_fn                  = C4::Context->userenv->{'firstname'} || q{};
                my $user_ln                  = C4::Context->userenv->{'surname'}   || q{};
                my $user_bn                  = C4::Context->userenv->{'number'};
                my $user                     = "$user_fn $user_ln";
                my $email                    = C4::Context->userenv->{'emailaddress'};
                my $selected_room_number     = get_room_number_by_id($room_id);
                my $count_limit              = get_daily_reservation_limit();
                my $current_user_daily_limit = get_daily_reservation_limit_of_patron( $user_bn, $start_date );

                $template->param(
                    op                  => 'room-selection-confirmation',
                    current_user        => $user,
                    current_user_fn     => $user_fn,
                    current_user_ln     => $user_ln,
                    current_user_email  => $email,
                    selected_room_id    => $room_id,
                    selected_room_no    => $selected_room_number,
                    displayed_time      => $displayed_event_time,
                    selected_start_time => $start_datetime,
                    selected_end_time   => $end_datetime,
                    displayed_start     => $displayed_start,
                    displayed_end       => $displayed_end,
                    count_limit         => $count_limit,
                    user_daily_limit    => $current_user_daily_limit,
                );
            }
            else {    # --> room is not available: print warning
                $template->param(
                    op                       => $op,
                    room_checked             => 0,
                    rooms                    => $rooms,
                    available_room_equipment => $equipment,
                    max_days                 => $max_num_days,
                    max_time                 => $max_time,
                    opening_hours            => $opening_hours,
                );
            }
        }
        else {    # --> submit button not pressed, yet
            my @pre_selected_room = grep { $_->{'roomid'} == $pre_selected_room_id } @{$rooms};

            $template->param(
                op                       => $op,
                room_checked             => -1,
                rooms                    => $rooms,
                available_room_equipment => $equipment,
                max_days                 => $max_num_days,
                max_time                 => $max_time,
                opening_hours            => $opening_hours,
                pre_selected_room        => shift @pre_selected_room,
            );
        }
    }
}

ROOM_SELECTION_CONFIRMATION: {
    if ( defined $op && $op eq 'room-selection-confirmation' ) {

        my $selected_id     = $cgi->param('selected-room-id');
        my $displayed_start = $cgi->param('displayed-start');
        my $displayed_end   = $cgi->param('displayed-end');
        my $event_start     = $cgi->param('event-start-time');
        my $event_end       = $cgi->param('event-end-time');

        my $start_date = $cgi->param('start-date');

        my $displayed_event_time = "$displayed_start - $displayed_end";

        my $user_fn = C4::Context->userenv->{'firstname'} || q{};
        my $user_ln = C4::Context->userenv->{'surname'}   || q{};
        my $user_bn = C4::Context->userenv->{'number'};

        my $user  = "$user_fn $user_ln";
        my $email = C4::Context->userenv->{'emailaddress'};

        my $selected_room_number = get_room_number_by_id($selected_id);

        my $count_limit = get_daily_reservation_limit();

        my $current_user_daily_limit = get_daily_reservation_limit_of_patron( $user_bn, $start_date );

        $template->param(
            op                  => $op,
            current_user        => $user,
            current_user_fn     => $user_fn,
            current_user_ln     => $user_ln,
            current_user_email  => $email,
            selected_room_id    => $selected_id,
            selected_room_no    => $selected_room_number,
            displayed_time      => $displayed_event_time,
            selected_start_time => $event_start,
            selected_end_time   => $event_end,
            displayed_start     => $displayed_start,
            displayed_end       => $displayed_end,
            count_limit         => $count_limit,
            user_daily_limit    => $current_user_daily_limit,
        );
    }
}

RESERVATION_CONFIRMED: {
    if ( defined $op && $op eq 'reservation-confirmed' ) {

        # my $borrowernumber    = C4::Context->userenv->{'number'};
        my $roomid            = $cgi->param('confirmed-room-id');
        my $start             = $cgi->param('confirmed-start');
        my $end               = $cgi->param('confirmed-end');
        my $send_copy         = $cgi->param('send-confirmation-copy') || q{};
        my $submit_button     = $cgi->param('confirmationSubmit');
        my $start_over_submit = $cgi->param('startOverSubmit');
        my $user              = $cgi->param('confirmed-user');
        my $roomnumber        = $cgi->param('confirmed-roomnumber');
        my $displayed_start   = $cgi->param('confirmed-displayed-start');
        my $displayed_end     = $cgi->param('confirmed-displayed-end');
        my $patron_email      = $cgi->param('confirmed-email');

        if ( defined $start_over_submit && ( $start_over_submit eq 'Start over' || $start_over_submit eq 'Abbrechen' ) ) {
            $op = 'availability-search';
            goto AVAILABILITY_SEARCH;
        }
        else {

            $valid = pre_booking_availability_check( $roomid, $start, $end );

            if ($valid) {
                add_booking( $borrowernumber, $roomid, $start, $end );
            }
            else {
                $template->param( invalid_booking => 1, );
            }
        }

        my $timestamp = get_current_timestamp();
        my $patron    = Koha::Patrons->find($borrowernumber);
        my $letter    = C4::Letters::GetPreparedLetter(
            module                 => 'members',
            letter_code            => 'ROOM_RESERVATION',
            lang                   => $patron->lang,
            message_transport_type => 'email',
            substitute             => {
                user                => $user,
                room                => $roomnumber,
                from                => $displayed_start,
                to                  => $displayed_end,
                confirmed_timestamp => $timestamp,
            },
        );

        my @message_ids;
        if ( $send_copy eq '1' && $valid ) {
            push @message_ids,
                C4::Letters::EnqueueLetter(
                {   letter                 => $letter,
                    borrowernumber         => $borrowernumber,
                    branchcode             => $patron->branchcode,
                    message_transport_type => 'email',
                }
                );
        }

        push @message_ids,
            C4::Letters::EnqueueLetter(
            {   letter                 => $letter,
                borrowernumber         => '1363',
                branchcode             => $patron->branchcode,
                message_transport_type => 'email',
            }
            );

        for my $message_id (@message_ids) {
            C4::Letters::SendQueuedMessages( { message_id => $message_id } );
        }

        my $message_to_patron = C4::Letters::GetMessage( shift @message_ids );

        $template->param( op => $op, SENT => $message_to_patron->{'status'} eq 'sent' ? 1 : 0, patron_email => $patron_email );
    }
}

output_html_with_http_headers $cgi, $cookie, $template->output;
