package Koha::Plugin::Com::LMSCloud::RoomReservations::Checks;

use Modern::Perl;
use utf8;
use 5.010;

use C4::Context ();

use Koha::Patrons ();
use DateTime      ();

use Exporter 'import';
use Readonly      qw( Readonly );
use SQL::Abstract ();
use Time::Piece   qw( localtime );

use Koha::Plugin::Com::LMSCloud::RoomReservations;
use Koha::Plugin::Com::LMSCloud::RoomReservations::State qw(
    get_restricted_patron_categories
);
use Koha::Plugin::Com::LMSCloud::RoomReservations::Util::I18N qw( __ );

use Module::Load              qw( load );
use Module::Load::Conditional qw( check_install );

# Koha::Calendar was moved to Koha::Library::Calendar in newer Koha versions
my $CALENDAR_CLASS;

BEGIN {
    $CALENDAR_CLASS =
        check_install( module => 'Koha::Library::Calendar' )
        ? 'Koha::Library::Calendar'
        : 'Koha::Calendar';
    load $CALENDAR_CLASS;
}

our $VERSION = '1.0.0';

BEGIN {
    our @EXPORT_OK = qw(
        is_allowed_to_book
        is_active_room
        is_active_equipment
        is_bookable_time
        is_open_during_booking_time
        has_conflicting_booking
        has_reached_reservation_limit
        has_passed
        is_koha_calendar_open
        has_open_hours_deviation
        is_valid_duration_grain
        compute_room_slots
        is_slot_mode
        is_valid_slot
    );
}

Readonly my $CONSTANTS => {
    DATETIME_YEAR_START          => 0,
    DATETIME_YEAR_LENGTH         => 4,
    DATETIME_MONTH_START         => 5,
    DATETIME_MONTH_LENGTH        => 2,
    DATETIME_DAY_START           => 8,
    DATETIME_DAY_LENGTH          => 2,
    DATETIME_HOUR_START          => 11,
    DATETIME_HOUR_LENGTH         => 2,
    DATETIME_MINUTE_START        => 14,
    DATETIME_MINUTE_LENGTH       => 2,
    DATE_STRING_LENGTH           => 10,       # length of YYYY-MM-DD
    DOW_MONDAY                   => 1,
    DOW_FRIDAY                   => 5,
    DOW_SUNDAY                   => 7,
    RECURRENCE_MAX_INSTANCES     => 730,      # 2 years of daily occurrences
    RECURRENCE_END_OF_DAY_HOUR   => 23,
    RECURRENCE_END_OF_DAY_MINUTE => 59,
    SECONDS_PER_MINUTE           => 60,
    SECONDS_PER_HOUR             => 3600,
    SECONDS_PER_DAY              => 86_400,
};

my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $BOOKINGS_TABLE     = $self ? $self->get_qualified_table_name('bookings')              : undef;
my $OPEN_HOURS_TABLE   = $self ? $self->get_qualified_table_name('open_hours')            : undef;
my $ROOMS_TABLE        = $self ? $self->get_qualified_table_name('rooms')                 : undef;
my $EQUIPMENT_TABLE    = $self ? $self->get_qualified_table_name('equipment')             : undef;
my $DEVIATIONS_TABLE   = $self ? $self->get_qualified_table_name('open_hours_deviations') : undef;
my $DEV_BRANCHES_TABLE = $self ? $self->get_qualified_table_name('deviation_branches')    : undef;
my $DEV_ROOMS_TABLE    = $self ? $self->get_qualified_table_name('deviation_rooms')       : undef;

sub has_passed {
    my ($start_time) = @_;

    # Parse the start time into a Time::Piece object
    my $parsed_start_time = Time::Piece->strptime( $start_time, '%Y-%m-%dT%H:%M' );

    # Get the current time as a Time::Piece object
    my $current_time = localtime;

    # Return true if the start time is in the past
    return $parsed_start_time < $current_time;
}

sub is_valid_duration_grain {
    my ( $start_time, $end_time ) = @_;

    return 1 if !$self->retrieve_data('enforce_booking_time_grain');

    my $min  = $self->retrieve_data('default_booking_time_min')  || 0;
    my $step = $self->retrieve_data('default_booking_time_step') || 0;

    return 1 if $min <= 0 && $step <= 0;

    my $start    = Time::Piece->strptime( $start_time, '%Y-%m-%dT%H:%M' );
    my $end      = Time::Piece->strptime( $end_time,   '%Y-%m-%dT%H:%M' );
    my $duration = ( $end - $start )->minutes;

    return 0 if $duration <= 0;
    return 0 if $min > 0  && $duration < $min;
    return 0 if $step > 0 && ( $duration - $min ) % $step != 0;

    return 1;
}

# Build the fixed booking-slot grid for a room on a given day (YYYY-MM-DD).
# Slots are generated from every open window that applies to the room that day —
# the weekday's regular open hours plus any non-blackout special-hours
# deviations — stepping by the room's slot_length and clamped to each window.
# The grid is anchored to the room's slot_start when set (a stable per-room
# phase across every window), otherwise to each window's own opening time.
# Overlapping windows are deduplicated and the slots returned in chronological
# order, as an arrayref of { start, end } in YYYY-MM-DDTHH:MM form — empty when
# the room is in free mode (no slot_length) or has no open window that day.
# This is a pure function of the room configuration and open hours; remaining
# availability (bookings, blackouts, holidays, past times) is decorated by
# callers. Slots from special hours are mirrored by is_open_during_booking_time,
# which treats those windows as additionally bookable.
sub compute_room_slots {
    my ( $roomid, $date ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    my ( $stmt, @bind ) = $sql->select( $ROOMS_TABLE, [ 'branch', 'slot_length', 'slot_start' ], { roomid => $roomid } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my ( $branch, $slot_length, $slot_start ) = $sth->fetchrow_array;

    # Free mode — no fixed slots
    return [] if !$slot_length || $slot_length <= 0;

    my ( $year, $month, $day ) = split /-/sm, $date;
    return [] if !( $year && $month && $day );

    my $step_sec = $slot_length * $CONSTANTS->{'SECONDS_PER_MINUTE'};
    return [] if $step_sec <= 0;

    # Schema stores day as 0=Mon..6=Sun; DateTime->day_of_week is 1=Mon..7=Sun.
    my $day_dt = eval { DateTime->new( year => $year, month => $month, day => $day ) };
    return [] if !$day_dt;
    my $wday = $day_dt->day_of_week - 1;

    # Collect every open window for the day as second-of-day [start, end) ranges:
    # the weekday's regular open hours, plus any special-hours deviations.
    my $windows = [];

    ( $stmt, @bind ) = $sql->select( $OPEN_HOURS_TABLE, [ 'start', 'end' ], { branch => $branch, day => $wday } );
    $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my ( $open_start, $open_end ) = $sth->fetchrow_array;

    # A regular row is open unless it's missing or both endpoints are "00:00:00".
    if ( defined $open_start && !( $open_start eq '00:00:00' && $open_end eq '00:00:00' ) ) {
        push @{$windows}, { start => _time_string_to_seconds($open_start), end => _time_string_to_seconds($open_end) };
    }

    push @{$windows}, @{ _special_hours_windows_for_date( $branch, $roomid, $date ) };

    return [] if !@{$windows};

    # Build the grid for each window. When slot_start is configured the anchor is
    # the same phase for every window; otherwise each window anchors to its own
    # opening second. Dedup by start so overlapping windows don't repeat a slot
    # (slot_length is constant, so equal starts imply equal ends), then sort.
    my %seen;
    my $slots = [];
    for my $window ( @{$windows} ) {
        my $anchor_sec = $slot_start ? _time_string_to_seconds($slot_start) : $window->{start};
        for my $slot ( @{ _slots_in_window( $date, $window->{start}, $window->{end}, $anchor_sec, $step_sec ) } ) {
            next if $seen{ $slot->{start} }++;
            push @{$slots}, $slot;
        }
    }

    return [ sort { $a->{start} cmp $b->{start} } @{$slots} ];
}

# Generate slot hashrefs for a single open window. Steps from the anchor by
# step_sec, emitting a { start, end } for every full slot that lands inside
# [window_start_sec, window_end_sec). The trailing remainder is dropped.
sub _slots_in_window {
    my ( $date, $window_start_sec, $window_end_sec, $anchor_sec, $step_sec ) = @_;

    my $slots  = [];
    my $cursor = $anchor_sec;
    while ( $cursor + $step_sec <= $window_end_sec ) {
        if ( $cursor >= $window_start_sec ) {
            push @{$slots},
                {
                start => _date_seconds_to_iso( $date, $cursor ),
                end   => _date_seconds_to_iso( $date, $cursor + $step_sec ),
                };
        }
        $cursor += $step_sec;
    }

    return $slots;
}

# Collect non-blackout special-hours deviation windows that apply to the room on
# a given date, as second-of-day [start, end) ranges clamped to that date.
# Recurring deviations are expanded. Blackouts are skipped — they narrow
# availability (decorated by is_open_during_booking_time) rather than create
# bookable slots, mirroring the additive semantics of has_open_hours_deviation.
sub _special_hours_windows_for_date {
    my ( $branch, $roomid, $date ) = @_;

    my $dbh = C4::Context->dbh;

    my $day_start_dt = _parse_datetime("${date}T00:00");
    my $day_end_dt   = _parse_datetime("${date}T23:59");

    my $query = <<~"SQL";
        SELECT d.deviationid, d.isblackout, d.start, d.end,
               d.recurrencetype, d.recurrencedays, d.recurrenceuntil
        FROM $DEVIATIONS_TABLE d
    SQL
    my $sth = $dbh->prepare($query);
    $sth->execute();

    my $windows = [];
    while ( my $deviation = $sth->fetchrow_hashref ) {
        next if $deviation->{'isblackout'};
        next if !_deviation_applies_to_branch( $deviation->{'deviationid'}, $branch );
        next if !_deviation_applies_to_room( $deviation->{'deviationid'}, $roomid );

        for my $instance ( @{ _expand_deviation_instances( $deviation, $day_start_dt, $day_end_dt ) } ) {
            my $istart = $instance->{start};
            my $iend   = $instance->{end};

            # Keep only instances that overlap the requested date.
            next if DateTime->compare( $istart, $day_end_dt ) > 0;
            next if DateTime->compare( $iend,   $day_start_dt ) <= 0;

            # Clamp to the date: instances starting earlier open from 00:00,
            # instances ending later run through to end-of-day.
            my $start_sec = $istart->ymd lt $date ? 0 : ( $istart->hour * $CONSTANTS->{'SECONDS_PER_HOUR'} ) + ( $istart->minute * $CONSTANTS->{'SECONDS_PER_MINUTE'} );
            my $end_sec =
                  $iend->ymd gt $date
                ? $CONSTANTS->{'SECONDS_PER_DAY'}
                : ( $iend->hour * $CONSTANTS->{'SECONDS_PER_HOUR'} ) + ( $iend->minute * $CONSTANTS->{'SECONDS_PER_MINUTE'} );

            push @{$windows}, { start => $start_sec, end => $end_sec };
        }
    }

    return $windows;
}

# True when the room is configured for fixed-slot booking (slot_length > 0).
# In slot mode the slot length defines the booking duration, so the global
# duration-grain rules don't apply.
sub is_slot_mode {
    my ($roomid) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    my ( $stmt, @bind ) = $sql->select( $ROOMS_TABLE, ['slot_length'], { roomid => $roomid } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my ($slot_length) = $sth->fetchrow_array;

    return ( $slot_length && $slot_length > 0 ) ? 1 : 0;
}

# Validate that a booking's start/end land on the room's slot grid. Rooms in
# free mode (no slot_length) accept any time. In slot mode the start and end
# must exactly match one generated slot for the start date.
sub is_valid_slot {
    my ( $roomid, $start_time, $end_time ) = @_;

    # Free mode — any time is acceptable
    return 1 if !is_slot_mode($roomid);

    my $date  = substr $start_time, 0, $CONSTANTS->{'DATE_STRING_LENGTH'};
    my $slots = compute_room_slots( $roomid, $date );

    for my $slot ( @{$slots} ) {
        return 1 if $slot->{start} eq $start_time && $slot->{end} eq $end_time;
    }

    return 0;
}

sub _date_seconds_to_iso {
    my ( $date, $seconds ) = @_;

    my $hour   = int( $seconds / $CONSTANTS->{'SECONDS_PER_HOUR'} );
    my $minute = int( ( $seconds % $CONSTANTS->{'SECONDS_PER_HOUR'} ) / $CONSTANTS->{'SECONDS_PER_MINUTE'} );

    return sprintf '%sT%02d:%02d', $date, $hour, $minute;
}

sub is_active_room {
    my ($room_id) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = $dbh->prepare("SELECT 1 FROM $ROOMS_TABLE WHERE roomid = ? AND deleted_at IS NULL");
    $sth->execute($room_id);

    return $sth->fetchrow_array ? 1 : 0;
}

sub is_active_equipment {
    my ($equipment_id) = @_;

    my $dbh = C4::Context->dbh;
    my $sth = $dbh->prepare("SELECT 1 FROM $EQUIPMENT_TABLE WHERE equipmentid = ? AND deleted_at IS NULL");
    $sth->execute($equipment_id);

    return $sth->fetchrow_array ? 1 : 0;
}

sub is_bookable_time {
    my ( $room_id, $start_time, $end_time ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # Get the maxbookabletime for the room
    my ( $where, @bind ) = $sql->where( { roomid => $room_id } );
    my $room_query = "SELECT maxbookabletime FROM $ROOMS_TABLE $where";
    my $room_sth   = $dbh->prepare($room_query);
    $room_sth->execute(@bind);
    my ($max_bookable_time) = $room_sth->fetchrow_array;

    # Fall back to the global default if room-level limit is not set
    $max_bookable_time //= $self->retrieve_data('default_max_booking_time');

    # No limit configured at either level — allow any duration
    return 1 if !$max_bookable_time;

    # Check if the difference between start and end times exceeds the limit
    my $_start_time = Time::Piece->strptime( $start_time, '%Y-%m-%dT%H:%M' );
    my $_end_time   = Time::Piece->strptime( $end_time,   '%Y-%m-%dT%H:%M' );
    my $duration    = ( $_end_time - $_start_time )->minutes;

    # Reject zero or negative duration (end must be after start)
    return 0 if $duration <= 0;

    return $duration <= $max_bookable_time;
}

sub is_open_during_booking_time {
    my ( $roomid, $start_time, $end_time ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # First we need to get the branchcode of the branch the room is located in
    my ( $stmt, @bind ) =
        $sql->select( $ROOMS_TABLE, 'branch', { roomid => $roomid } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my ($branch) = $sth->fetchrow_array;

    # Check Koha's calendar first - if the library is closed on this day, booking is not allowed
    # Only check if the setting is enabled (opt-in for backward compatibility)
    my $use_koha_calendar = $self->retrieve_data('use_koha_calendar');
    if ( $use_koha_calendar && !is_koha_calendar_open( $branch, $start_time, $end_time ) ) {
        return 0;
    }

    # Check for open hours deviations (blackouts or special hours) across the full range
    my $deviation_result = has_open_hours_deviation( $branch, $roomid, $start_time, $end_time );

    # If blocked by blackout, deny the booking
    return 0 if $deviation_result->{status} eq 'blocked';

    # If explicitly allowed by special hours, allow immediately (bypass regular hours check)
    return 1 if $deviation_result->{status} eq 'allowed';

    # Regular hours: walk the booking one calendar day at a time and require each day's
    # segment to fit within that weekday's open hours. This correctly handles bookings
    # that cross midnight — both days must be open, and continuously so across the boundary.
    my $start_dt = _parse_datetime($start_time);
    my $end_dt   = _parse_datetime($end_time);

    my $cursor = $start_dt->clone;
    while ( DateTime->compare( $cursor, $end_dt ) < 0 ) {
        my $next_midnight = $cursor->clone->truncate( to => 'day' )->add( days => 1 );
        my $segment_end   = DateTime->compare( $next_midnight, $end_dt ) < 0 ? $next_midnight : $end_dt;

        # Schema stores day as 0=Mon..6=Sun; DateTime->day_of_week is 1=Mon..7=Sun.
        my $wday = $cursor->day_of_week - 1;

        ( $stmt, @bind ) = $sql->select( $OPEN_HOURS_TABLE, [ 'start', 'end' ], { branch => $branch, day => $wday } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);
        my ( $start_hour, $end_hour ) = $sth->fetchrow_array;

        # No row, or both endpoints "00:00:00" -> closed that day
        if ( !defined $start_hour || ( $start_hour eq '00:00:00' && $end_hour eq '00:00:00' ) ) {
            return 0;
        }

        my $open_sod      = _time_string_to_seconds($start_hour);
        my $close_sod     = _time_string_to_seconds($end_hour);
        my $seg_start_sod = ( $cursor->hour * $CONSTANTS->{'SECONDS_PER_HOUR'} ) + ( $cursor->minute * $CONSTANTS->{'SECONDS_PER_MINUTE'} ) + $cursor->second;

        # When the segment runs into the next day, compare its end against end-of-day
        # (23:59:59). That way an open_hours row ending at 23:59:59 qualifies as
        # "open through midnight" and allows continuity into the next day's hours.
        my $seg_end_sod =
            DateTime->compare( $segment_end, $next_midnight ) == 0
            ? $CONSTANTS->{'SECONDS_PER_DAY'} - 1
            : ( $segment_end->hour * $CONSTANTS->{'SECONDS_PER_HOUR'} ) + ( $segment_end->minute * $CONSTANTS->{'SECONDS_PER_MINUTE'} ) + $segment_end->second;

        return 0 if $seg_start_sod < $open_sod || $seg_end_sod > $close_sod;

        $cursor = $next_midnight;
    }

    return 1;
}

sub _time_string_to_seconds {
    my ($hms) = @_;
    my ( $h, $m, $s ) = split /:/sm, $hms;
    return ( $h * $CONSTANTS->{'SECONDS_PER_HOUR'} ) + ( $m * $CONSTANTS->{'SECONDS_PER_MINUTE'} ) + ( $s // 0 );
}

sub has_conflicting_booking {
    my ( $room_id, $start_time, $end_time, $booking_id ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # We have to check if the booking we are trying to create overlaps with
    # any other booking but if it starts on the same minute another booking ends
    # we have to allow it.
    my ( $where, @bind ) = $sql->where(
        {   roomid => $room_id,
            -and   => [
                start => { '<' => $end_time },
                end   => { '>' => $start_time },
            ]
        }
    );

    if ($booking_id) {
        $where .= ' AND bookingid != ?' and push @bind, $booking_id;
    }

    my $check_query = "SELECT COUNT(*) FROM $BOOKINGS_TABLE $where";
    my $check_sth   = $dbh->prepare($check_query);
    $check_sth->execute(@bind);
    my ($conflict_count) = $check_sth->fetchrow_array;

    return $conflict_count > 0;
}

sub has_reached_reservation_limit {
    my ( $borrowernumber, $roomid, $start ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # We have to check the bookings table for bookings with the given borrowernumber.
    # and return 400 if the number of bookings is greater than the absolute_reservation_limit.
    # The bookings we check against have to be on the current day of our locale or in the future.
    my $absolute_reservation_limit = $self->retrieve_data('absolute_reservation_limit');
    if ($absolute_reservation_limit) {
        my ( $stmt, @bind ) = $sql->select(
            $BOOKINGS_TABLE,
            ['COUNT(*)'],
            {   borrowernumber => $borrowernumber,
                start          => { '>=', Time::Piece->new->strftime('%Y-%m-%d') . q{ 00:00:00} }
            }
        );

        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);
        my $bookings_quantity = $sth->fetchrow_array;

        if ( scalar $bookings_quantity >= $absolute_reservation_limit ) {
            return ( 1, __('absolute') );
        }
    }

    # Then we have to check whether the borrowernumber exceeds the daily reservation limit.
    # Therefore we have to check the daily reservation limit against the number of existing
    # bookings for the supplied day.
    my $daily_reservation_limit = $self->retrieve_data('daily_reservation_limit');
    if ($daily_reservation_limit) {
        my ( $stmt, @bind ) = $sql->select(
            $BOOKINGS_TABLE,
            ['COUNT(*)'],
            {   borrowernumber => $borrowernumber,
                start          => { 'like' => Time::Piece->strptime( $start, '%Y-%m-%dT%H:%M' )->strftime('%Y-%m-%d') . q{%} }
            }
        );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);
        my $bookings_quantity = $sth->fetchrow_array;

        if ( scalar $bookings_quantity >= $daily_reservation_limit ) {
            return ( 1, __('daily') );
        }
    }

    return ( 0, undef );
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

# Helper function to parse ISO 8601 datetime string (YYYY-MM-DDTHH:MM) into DateTime object
sub _parse_datetime {
    my ($datetime_str) = @_;

    return DateTime->new(
        year   => substr( $datetime_str, $CONSTANTS->{'DATETIME_YEAR_START'},   $CONSTANTS->{'DATETIME_YEAR_LENGTH'} ),
        month  => substr( $datetime_str, $CONSTANTS->{'DATETIME_MONTH_START'},  $CONSTANTS->{'DATETIME_MONTH_LENGTH'} ),
        day    => substr( $datetime_str, $CONSTANTS->{'DATETIME_DAY_START'},    $CONSTANTS->{'DATETIME_DAY_LENGTH'} ),
        hour   => substr( $datetime_str, $CONSTANTS->{'DATETIME_HOUR_START'},   $CONSTANTS->{'DATETIME_HOUR_LENGTH'} ),
        minute => substr( $datetime_str, $CONSTANTS->{'DATETIME_MINUTE_START'}, $CONSTANTS->{'DATETIME_MINUTE_LENGTH'} ),
    );
}

sub is_koha_calendar_open {
    my ( $branch, $start_time, $end_time ) = @_;

    # Initialize the Koha calendar for the branch
    my $calendar = $CALENDAR_CLASS->new( branchcode => $branch, days_mode => 'Calendar' );

    # Convert start and end times to DateTime objects
    my $start_dt = _parse_datetime($start_time);
    my $end_dt   = _parse_datetime($end_time);

    # Check if the start date is a holiday
    if ( $calendar->is_holiday($start_dt) ) {
        return 0;
    }

    # Check if the end date is a holiday (if booking spans multiple days)
    if ( $start_dt->ymd ne $end_dt->ymd && $calendar->is_holiday($end_dt) ) {
        return 0;
    }

    return 1;
}

sub has_open_hours_deviation {
    my ( $branch, $roomid, $start_time, $end_time ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # Convert times to DateTime for comparison
    my $start_dt = _parse_datetime($start_time);
    my $end_dt   = _parse_datetime($end_time);

    # Query to find all deviations (including recurring ones)
    my $query = <<~"SQL";
        SELECT d.deviationid, d.isblackout, d.start, d.end,
               d.recurrencetype, d.recurrencedays, d.recurrenceuntil
        FROM $DEVIATIONS_TABLE d
    SQL

    my $sth = $dbh->prepare($query);
    $sth->execute();

    # Track if we found a special hours window that allows this booking
    my $allowed_by_special_hours = 0;

    while ( my $deviation = $sth->fetchrow_hashref ) {

        # Check if this deviation applies to our branch/room
        my $applies_to_branch = _deviation_applies_to_branch( $deviation->{'deviationid'}, $branch );
        my $applies_to_room   = _deviation_applies_to_room( $deviation->{'deviationid'}, $roomid );

        # Skip if deviation doesn't apply to this branch/room
        if ( !$applies_to_branch || !$applies_to_room ) {
            next;
        }

        # Get all instances of this deviation (expanded if recurring)
        my $instances = _expand_deviation_instances( $deviation, $start_dt, $end_dt );

        # Check each instance for overlap with booking time
        for my $instance ( @{$instances} ) {
            my $deviation_start_dt = $instance->{start};
            my $deviation_end_dt   = $instance->{end};

            # Check if this instance overlaps with the booking
            # A deviation overlaps if: deviation_start < booking_end AND deviation_end > booking_start
            if ( DateTime->compare( $deviation_start_dt, $end_dt ) < 0 && DateTime->compare( $deviation_end_dt, $start_dt ) > 0 ) {

                # If it's a blackout, booking is not allowed - return immediately
                if ( $deviation->{'isblackout'} ) {
                    return { status => 'blocked', reason => 'blackout' };
                }

                # If it's special hours (not blackout), check if booking fits entirely within the special hours
                # If booking fits within this special hours window, mark as allowed
                if ( DateTime->compare( $start_dt, $deviation_start_dt ) >= 0 && DateTime->compare( $end_dt, $deviation_end_dt ) <= 0 ) {
                    $allowed_by_special_hours = 1;
                }
            }
        }
    }

    # Return values:
    # { status => 'allowed', reason => 'special_hours' } - Explicitly allowed by special hours (bypass regular hours check)
    # { status => 'neutral' } - No applicable deviation (continue to regular hours check)
    return $allowed_by_special_hours
        ? { status => 'allowed', reason => 'special_hours' }
        : { status => 'neutral' };
}

# Expand a deviation into all its instances within the given time range.
# Returns an arrayref of hashrefs with {start => DateTime, end => DateTime}.
sub _expand_deviation_instances {
    my ( $deviation, $booking_start_dt, $booking_end_dt ) = @_;

    my $recurrence_type = $deviation->{recurrencetype} || 'none';

    # Parse deviation times using the existing datetime parser
    # Convert MySQL DATETIME (YYYY-MM-DD HH:MM:SS) to parser format (YYYY-MM-DDTHH:MM)
    my $dev_start_str = $deviation->{start};
    $dev_start_str =~ s/ /T/sm;         # Convert space to T
    $dev_start_str =~ s/:\d\d$//smx;    # Remove seconds
    my $dev_start_dt = _parse_datetime($dev_start_str);

    my $dev_end_str = $deviation->{end};
    $dev_end_str =~ s/ /T/sm;
    $dev_end_str =~ s/:\d\d$//smx;
    my $dev_end_dt = _parse_datetime($dev_end_str);

    # Calculate duration
    my $duration = $dev_end_dt->subtract_datetime($dev_start_dt);

    # Parse recurrenceuntil if present
    my $recurrence_until_dt;
    if ( $deviation->{recurrenceuntil} ) {
        my $until_str = join q{}, $deviation->{recurrenceuntil}, sprintf 'T%02d:%02d', $CONSTANTS->{'RECURRENCE_END_OF_DAY_HOUR'}, $CONSTANTS->{'RECURRENCE_END_OF_DAY_MINUTE'};
        $recurrence_until_dt = _parse_datetime($until_str);
    }

    # Non-recurring deviation - return early
    if ( $recurrence_type eq 'none' ) {
        return [ { start => $dev_start_dt->clone, end => $dev_end_dt->clone } ];
    }

    # Dispatch table for recurrence pattern matching
    my $pattern_matchers = {
        daily => sub {
            return 1;    # Every day matches
        },
        weekdays => sub {
            my ($current_dt) = @_;
            my $dow = $current_dt->day_of_week;             # 1=Monday, 7=Sunday
            return $dow >= $CONSTANTS->{DOW_MONDAY} && $dow <= $CONSTANTS->{DOW_FRIDAY};
        },
        weekly => sub {
            my ($current_dt) = @_;
            my $dow = $current_dt->day_of_week - 1;             # Convert to 0=Monday, 6=Sunday

            if ( $deviation->{recurrencedays} ) {
                my @allowed_days = split /,/smx, $deviation->{recurrencedays};
                return grep { $_ == $dow } @allowed_days;
            }

            # If no days specified, repeat on same day of week as original
            my $orig_dow = $dev_start_dt->day_of_week - 1;
            return $dow == $orig_dow;
        },
        monthly => sub {
            my ($current_dt) = @_;
            return $current_dt->day == $dev_start_dt->day;
        },
    };

    # Get the matcher for this recurrence type
    my $matcher = $pattern_matchers->{$recurrence_type};
    if ( !$matcher ) {
        return [];
    }

    # Generate recurring instances
    my $instances      = [];
    my $current_dt     = $dev_start_dt->clone;
    my $max_instances  = $CONSTANTS->{'RECURRENCE_MAX_INSTANCES'};
    my $instance_count = 0;

    while ( $instance_count < $max_instances ) {

        # Stop if we've passed the recurrence end date
        last if $recurrence_until_dt && DateTime->compare( $current_dt, $recurrence_until_dt ) > 0;

        # Stop if we're past the booking end date (optimization)
        last if $instance_count > 0 && DateTime->compare( $current_dt, $booking_end_dt ) > 0;

        # Check if this date matches the recurrence pattern
        if ( $matcher->($current_dt) ) {
            my $instance_end_dt = $current_dt->clone->add_duration($duration);
            push @{$instances}, { start => $current_dt->clone, end => $instance_end_dt };
        }

        # Move to next day
        $current_dt->add( days => 1 );
        $instance_count++;
    }

    return $instances;
}

sub _deviation_applies_to_branch {
    my ( $deviation_id, $branch ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # Check if there are any branch associations for this deviation
    my ( $stmt, @bind ) = $sql->select( $DEV_BRANCHES_TABLE, ['COUNT(*)'], { deviationid => $deviation_id } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my ($count) = $sth->fetchrow_array;

    # If no branch associations, deviation applies to all branches
    return 1 if $count == 0;

    # Check if this specific branch is in the associations
    ( $stmt, @bind ) = $sql->select( $DEV_BRANCHES_TABLE, ['COUNT(*)'], { deviationid => $deviation_id, branch => $branch } );
    $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    ($count) = $sth->fetchrow_array;

    return $count > 0;
}

sub _deviation_applies_to_room {
    my ( $deviation_id, $roomid ) = @_;

    my $sql = SQL::Abstract->new;
    my $dbh = C4::Context->dbh;

    # Check if there are any room associations for this deviation
    my ( $stmt, @bind ) = $sql->select( $DEV_ROOMS_TABLE, ['COUNT(*)'], { deviationid => $deviation_id } );
    my $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    my ($count) = $sth->fetchrow_array;

    # If no room associations, deviation applies to all rooms
    return 1 if $count == 0;

    # Check if this specific room is in the associations
    ( $stmt, @bind ) = $sql->select( $DEV_ROOMS_TABLE, ['COUNT(*)'], { deviationid => $deviation_id, roomid => $roomid } );
    $sth = $dbh->prepare($stmt);
    $sth->execute(@bind);
    ($count) = $sth->fetchrow_array;

    return $count > 0;
}

1;
