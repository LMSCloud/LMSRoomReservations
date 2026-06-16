package Koha::Plugin::Com::LMSCloud::RoomReservations::Controllers::Bookings;

use 5.010;

use utf8;
use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller';

use C4::Context ();

use File::Basename qw( dirname );
use List::Util     qw( any );
use Mojo::JSON     qw( decode_json );
use Readonly       qw( Readonly );
use SQL::Abstract  ();
use Scalar::Util   qw( blessed );
use Time::Piece    ();
use Try::Tiny      qw( catch try );

use Koha::Plugin::Com::LMSCloud::RoomReservations::Checks qw(
    is_allowed_to_book
    is_active_room
    is_active_equipment
    is_bookable_time
    is_open_during_booking_time
    has_conflicting_booking
    has_reached_reservation_limit
    is_valid_slot
);
use Koha::Plugin::Com::LMSCloud::RoomReservations::Actions qw(
    send_email_confirmation
);
use Koha::Plugin::Com::LMSCloud::RoomReservations::Util::I18N qw( __ );

our $VERSION = '1.0.0';

Readonly my $CONSTANTS => {
    HTTP_OK      => 200,
    HTTP_CREATED => 201,
};

my $i18n = Koha::Plugin::Com::LMSCloud::RoomReservations::Util::I18N->new( 'com.lmscloud.roomreservations', dirname(__FILE__) . '/../locales/' );
my $self = Koha::Plugin::Com::LMSCloud::RoomReservations->new;

my $BOOKINGS_TABLE           = $self ? $self->get_qualified_table_name('bookings')           : undef;
my $BOOKINGS_EQUIPMENT_TABLE = $self ? $self->get_qualified_table_name('bookings_equipment') : undef;
my $EQUIPMENT_TABLE          = $self ? $self->get_qualified_table_name('equipment')          : undef;
my $ROOMS_TABLE              = $self ? $self->get_qualified_table_name('rooms')              : undef;

Readonly my $DEFAULT_PER_PAGE => 20;
Readonly my $UNPAGINATED      => -1;

# The bookings list joins borrowers and rooms so it can be searched by patron
# name and room number; this means every column reference has to be qualified.
my $FROM_WITH_JOINS =
      "`$BOOKINGS_TABLE` "
    . "LEFT JOIN `borrowers` ON `borrowers`.`borrowernumber` = `$BOOKINGS_TABLE`.`borrowernumber` "
    . "LEFT JOIN `$ROOMS_TABLE` ON `$ROOMS_TABLE`.`roomid` = `$BOOKINGS_TABLE`.`roomid`";

# Columns the bookings list may be ordered by. Values outside this set fall back
# to 'start', which keeps the ORDER BY clause injection-safe.
my $SORTABLE_BOOKING_COLUMNS = {
    map { $_ => 1 }
        qw(
        bookingid borrowernumber roomid start end purpose_of_use blackedout created updated_at
        )
};

# Logical search field => trusted, fully-qualified SQL expression. A `q` may
# only reference these keys; anything else is stripped, so the only identifiers
# ever emitted come from this map (values always become binds). 'patron' and
# 'roomnumber' search the joined borrowers/rooms tables.
my $SEARCH_COLUMN_SQL = {
    bookingid      => "`$BOOKINGS_TABLE`.`bookingid`",
    borrowernumber => "`$BOOKINGS_TABLE`.`borrowernumber`",
    roomid         => "`$BOOKINGS_TABLE`.`roomid`",
    start          => "`$BOOKINGS_TABLE`.`start`",
    end            => "`$BOOKINGS_TABLE`.`end`",
    purpose_of_use => "`$BOOKINGS_TABLE`.`purpose_of_use`",
    blackedout     => "`$BOOKINGS_TABLE`.`blackedout`",
    created        => "`$BOOKINGS_TABLE`.`created`",
    updated_at     => "`$BOOKINGS_TABLE`.`updated_at`",
    roomnumber     => "`$ROOMS_TABLE`.`roomnumber`",
    patron         => q{CONCAT_WS(' ', `borrowers`.`firstname`, `borrowers`.`surname`)},
};

# Operators accepted inside a `q` condition. SQL::Abstract maps these to safe,
# parameterised SQL; anything else is stripped before the query is built.
my $SEARCH_OPERATORS = { map { $_ => 1 } qw( -like -not_like = != <> < > <= >= -in -not_in ) };

sub list {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $page     = $c->param('_page')     // 1;
        my $per_page = $c->param('_per_page') // $DEFAULT_PER_PAGE;
        my $order_by = $c->param('_order_by') // 'start';

        # A leading '-' on _order_by requests descending order (Koha REST convention).
        my $direction = 'ASC';
        if ( $order_by =~ s/\A-//xms ) {
            $direction = 'DESC';
        }
        if ( !$SORTABLE_BOOKING_COLUMNS->{$order_by} ) {
            $order_by = 'start';
        }
        if ( $page !~ /\A\d+\z/xms || $page < 1 ) {
            $page = 1;
        }

        # Only a positive count or -1 (unpaginated) is valid; anything else
        # (0, other negatives, non-numeric) falls back to the default so a bad
        # value can't reach LIMIT as a negative and 500.
        if ( $per_page !~ /\A-?\d+\z/xms || ( $per_page < 1 && $per_page != $UNPAGINATED ) ) {
            $per_page = $DEFAULT_PER_PAGE;
        }

        # Hide bookings that lie further in the past than the configured cutoff.
        # Equivalent to the previous in-Perl filter, pushed into SQL so it works
        # together with pagination and the total count.
        my $where       = [];
        my $bind        = [];
        my $cutoff_days = $self->retrieve_data('remove_past_reservations_after') || 0;
        if ( $cutoff_days > 0 ) {
            push @{$where}, "DATE(`$BOOKINGS_TABLE`.`start`) > DATE_SUB(CURDATE(), INTERVAL ? DAY)";
            push @{$bind},  $cutoff_days;
        }

        # Apply the Koha-style `q` search/filter (same JSON contract as the
        # objects->search endpoints), translated to SQL via SQL::Abstract.
        my ( $search_sql, $search_bind ) = _build_search_where( $c->param('q') );
        if ($search_sql) {
            push @{$where}, $search_sql;
            push @{$bind},  @{$search_bind};
        }

        my $where_clause = @{$where} ? 'WHERE ' . join( ' AND ', @{$where} ) : q{};

        my ($total) = $dbh->selectrow_array( "SELECT COUNT(*) FROM $FROM_WITH_JOINS $where_clause", undef, @{$bind} );

        my $stmt      = "SELECT `$BOOKINGS_TABLE`.* FROM $FROM_WITH_JOINS $where_clause " . "ORDER BY `$BOOKINGS_TABLE`.`$order_by` $direction";
        my $page_bind = [ @{$bind} ];
        if ( $per_page != $UNPAGINATED ) {
            $stmt .= ' LIMIT ? OFFSET ?';
            push @{$page_bind}, $per_page, ( $page - 1 ) * $per_page;
        }

        my $sth = $dbh->prepare($stmt);
        $sth->execute( @{$page_bind} );
        my $bookings = $sth->fetchall_arrayref( {} );

        _attach_equipment( $dbh, $bookings );

        $c->res->headers->header( 'X-Total-Count' => $total );
        return $c->render( status => 200, openapi => $bookings );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

# Attach the equipment booked alongside each booking on the current page. Scoped
# to the page's booking ids so pagination doesn't pull the whole join table.
sub _attach_equipment {
    my ( $dbh, $bookings ) = @_;

    return if !@{$bookings};

    my $booking_ids  = [ map { $_->{'bookingid'} } @{$bookings} ];
    my $placeholders = join q{,}, (q{?}) x @{$booking_ids};

    my $links_sth = $dbh->prepare("SELECT * FROM $BOOKINGS_EQUIPMENT_TABLE WHERE bookingid IN ($placeholders)");
    $links_sth->execute( @{$booking_ids} );
    my $links = $links_sth->fetchall_arrayref( {} );

    my $equipment_by_id = {};
    my $equipment_ids   = [ map { $_->{'equipmentid'} } @{$links} ];
    if ( @{$equipment_ids} ) {
        my $equipment_placeholders = join q{,}, (q{?}) x @{$equipment_ids};
        my $equipment_sth          = $dbh->prepare("SELECT * FROM $EQUIPMENT_TABLE WHERE equipmentid IN ($equipment_placeholders)");
        $equipment_sth->execute( @{$equipment_ids} );
        $equipment_by_id = { map { $_->{'equipmentid'} => $_ } @{ $equipment_sth->fetchall_arrayref( {} ) } };
    }

    my $equipment_for_booking = {};
    foreach my $link ( @{$links} ) {
        my $equipment_obj = $equipment_by_id->{ $link->{'equipmentid'} };
        next if !$equipment_obj;
        push @{ $equipment_for_booking->{ $link->{'bookingid'} } }, $equipment_obj;
    }

    foreach my $booking ( @{$bookings} ) {
        $booking->{'equipment'} = $equipment_for_booking->{ $booking->{'bookingid'} } // [];
    }

    return;
}

# Translate a Koha-style `q` JSON string into an SQL WHERE fragment + bind
# values. Returns ( "(...)", [ @binds ] ), or ( undef, [] ) when there is
# nothing safe to filter on. The decoded query is sanitised against the column
# and operator whitelists before SQL::Abstract sees it, and JSON values can only
# be scalars/arrays, so every value becomes a bind — no literal SQL is injected.
sub _build_search_where {
    my ($q_json) = @_;

    return ( undef, [] ) if !defined $q_json || $q_json eq q{} || $q_json eq '{}';

    my $decoded = eval { decode_json($q_json) };
    return ( undef, [] ) if !defined $decoded;

    my $clean = _sanitize_query($decoded);
    return ( undef, [] ) if !defined $clean;

    # Rewrite the whitelisted logical column names to their trusted, qualified
    # SQL expressions, then let SQL::Abstract emit them verbatim (no quoting —
    # the expressions are already qualified/back-ticked and come only from us).
    my $qualified = _qualify_columns($clean);

    my $sqla = SQL::Abstract->new;
    my ( $stmt, @bind ) = $sqla->where($qualified);
    $stmt =~ s/\A\s*WHERE\s+//ixms;
    return ( undef, [] ) if $stmt !~ /\S/xms;

    return ( "($stmt)", [@bind] );
}

# Walk a sanitised query and replace each logical column key with its trusted
# SQL expression from $SEARCH_COLUMN_SQL. Operator hashes and bind values pass
# through untouched.
sub _qualify_columns {
    my ($node) = @_;

    my $ref = ref $node;
    if ( $ref eq 'ARRAY' ) {
        return [ map { _qualify_columns($_) } @{$node} ];
    }
    if ( $ref eq 'HASH' ) {
        my $out = {};
        foreach my $key ( keys %{$node} ) {
            if ( $key =~ /\A-(?:and|or)\z/ixms ) {
                $out->{$key} = _qualify_columns( $node->{$key} );
                next;
            }
            $out->{ $SEARCH_COLUMN_SQL->{$key} } = $node->{$key};
        }
        return $out;
    }

    return $node;
}

# Recursively keep only whitelisted columns and logic operators (-and/-or),
# dropping everything else. Returns the cleaned node or undef when empty.
sub _sanitize_query {
    my ($node) = @_;

    my $ref = ref $node;
    if ( $ref eq 'ARRAY' ) {
        my $kept = [ grep {defined} map { _sanitize_query($_) } @{$node} ];
        return @{$kept} ? $kept : undef;
    }
    if ( $ref eq 'HASH' ) {
        my $kept = {};
        foreach my $key ( keys %{$node} ) {
            if ( $key =~ /\A-(?:and|or)\z/ixms ) {
                my $sub = _sanitize_query( $node->{$key} );
                if ( defined $sub ) {
                    $kept->{$key} = $sub;
                }
                next;
            }
            next if !$SEARCH_COLUMN_SQL->{$key};
            my $condition = _sanitize_condition( $node->{$key} );
            if ( defined $condition ) {
                $kept->{$key} = $condition;
            }
        }
        return %{$kept} ? $kept : undef;
    }

    return;
}

# A condition is a scalar (equality), an array of scalars (OR of equalities),
# or a hash of whitelisted operators to scalar/array operands.
sub _sanitize_condition {
    my ($value) = @_;
    $value = _coerce_boolean($value);

    my $ref = ref $value;
    return $value if $ref eq q{};

    if ( $ref eq 'ARRAY' ) {
        my $items = [ map { _coerce_boolean($_) } @{$value} ];
        return if any {ref} @{$items};
        return $items;
    }
    if ( $ref eq 'HASH' ) {
        my $kept = {};
        foreach my $op ( keys %{$value} ) {
            next if !$SEARCH_OPERATORS->{$op};
            my $operand = $value->{$op};
            if ( ref $operand eq 'ARRAY' ) {
                $operand = [ map { _coerce_boolean($_) } @{$operand} ];
                next if any {ref} @{$operand};
            }
            else {
                $operand = _coerce_boolean($operand);
                next if ref $operand;
            }
            $kept->{$op} = $operand;
        }
        return %{$kept} ? $kept : undef;
    }

    return;
}

# decode_json yields JSON booleans as blessed JSON::PP::Boolean objects, which
# the sanitiser would otherwise drop as refs. Coerce them to 0/1 so a client can
# filter e.g. blackedout with true/false; leave everything else untouched.
sub _coerce_boolean {
    my ($value) = @_;
    return $value if !blessed $value;
    return $value->isa('JSON::PP::Boolean') ? ( $value ? 1 : 0 ) : $value;
}

sub add {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $body = $c->req->json;

        return _check_and_save_booking( $body, $c );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub get {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $dbh = C4::Context->dbh;

        my $booking_id = $c->param('booking_id');
        my $query      = "SELECT * FROM $BOOKINGS_TABLE WHERE bookingid = ?";
        my $sth        = $dbh->prepare($query);
        $sth->execute($booking_id);

        my $booking = $sth->fetchrow_hashref;
        if ( !$booking ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'No entry found for id' }
            );
        }

        return $c->render( status => 200, openapi => $booking );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub update {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $booking_id = $c->param('booking_id');

        my $body = $c->req->json;

        return _check_and_save_booking( $body, $c, $booking_id );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub delete {
    my $c = shift->openapi->valid_input or return;

    return try {
        my $booking_id = $c->param('booking_id');

        my $sql = SQL::Abstract->new;
        my $dbh = C4::Context->dbh;

        my ( $stmt, @bind ) =
            $sql->select( $BOOKINGS_TABLE, q{*}, { bookingid => $booking_id } );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $booking = $sth->fetchrow_hashref();
        if ( !$booking ) {
            return $c->render(
                status  => 404,
                openapi => { error => 'Object not found' }
            );
        }

        my $end_epoch = Time::Piece->strptime( $booking->{'end'}, '%Y-%m-%d %H:%M:%S' )->epoch;
        if ( $end_epoch < time() ) {
            return $c->render(
                status  => 409,
                openapi => { error => __('Cannot delete a booking that has already ended') }
            );
        }

        ( $stmt, @bind ) =
            $sql->delete( $BOOKINGS_TABLE, { bookingid => $booking_id } );
        $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        if ( $end_epoch >= time() ) {
            my $start = substr( $booking->{'start'}, 0, 16 );
            $start =~ s/ /T/;
            my $end = substr( $booking->{'end'}, 0, 16 );
            $end =~ s/ /T/;
            send_email_confirmation(
                {   borrowernumber    => $booking->{'borrowernumber'},
                    roomid            => $booking->{'roomid'},
                    start             => $start,
                    end               => $end,
                    letter_code       => 'ROOM_CANCELLATION',
                    send_confirmation => 1,
                }
            );
        }

        return $c->render(
            status  => 204,
            openapi => q{},
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}

sub _check_and_save_booking {
    my ( $body, $c, $booking_id ) = @_;

    my $dbh = C4::Context->dbh;

    return try {
        local $ENV{HTTP_ACCEPT_LANGUAGE} = $c->param('lang');

        my $sql = SQL::Abstract->new;

        if ( !( Time::Piece->strptime( $body->{'start'}, '%Y-%m-%dT%H:%M' )->epoch < Time::Piece->strptime( $body->{'end'}, '%Y-%m-%dT%H:%M' )->epoch ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('End time must be after start time') }
            );
        }

        if ( !is_allowed_to_book( $body->{'borrowernumber'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => $self->retrieve_data('restrict_message') || __('The patron is not allowed to book rooms.') }
            );
        }

        if ( !is_active_room( $body->{'roomid'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('The selected room is no longer available.') }
            );
        }

        if ( defined $body->{'equipment'} && @{ $body->{'equipment'} } ) {
            for my $equipmentid ( @{ $body->{'equipment'} } ) {
                if ( !is_active_equipment($equipmentid) ) {
                    return $c->render(
                        status  => 400,
                        openapi => { error => __('One of the selected equipment items is no longer available.') }
                    );
                }
            }
        }

        if ( !is_bookable_time( $body->{'roomid'}, $body->{'start'}, $body->{'end'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('The booking exceeds the maximum allowed time for the room.') }
            );
        }

        if ( !is_open_during_booking_time( $body->{'roomid'}, $body->{'start'}, $body->{'end'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('The institution is closed during the selected time frame.') }
            );
        }

        # Slot-mode rooms require bookings to match a generated slot. Staff can
        # bypass this with slot_override (other checks above still apply).
        if ( !$body->{'slot_override'} && !is_valid_slot( $body->{'roomid'}, $body->{'start'}, $body->{'end'} ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('The selected time does not match an available slot for this room. Enable override to book a custom time.') }
            );
        }

        if ( has_conflicting_booking( $body->{'roomid'}, $body->{'start'}, $body->{'end'}, $booking_id ) ) {
            return $c->render(
                status  => 400,
                openapi => { error => __('There is a conflicting booking.') }
            );
        }

        if ( !$booking_id ) {
            my ( $has_reached_reservation_limit, $message ) =
                has_reached_reservation_limit( $body->{'borrowernumber'}, $body->{'roomid'}, $body->{'start'} );
            if ($has_reached_reservation_limit) {
                return $c->render(
                    status  => 400,
                    openapi => { error => __('The borrower has reached the ') . $message . __(' limit of reservations.') }
                );
            }
        }

        my $booking = {
            borrowernumber => $body->{'borrowernumber'},
            roomid         => $body->{'roomid'},
            start          => $body->{'start'},
            end            => $body->{'end'},
            blackedout     => $body->{'blackedout'} || 0
        };

        if ( exists $body->{'purpose_of_use'} ) {
            $booking->{'purpose_of_use'} = $body->{'purpose_of_use'} || undef;
        }

        my $is_update = defined $booking_id;
        my ( $stmt, @bind ) =
              $is_update
            ? $sql->update( $BOOKINGS_TABLE, $booking, { bookingid => $booking_id } )
            : $sql->insert( $BOOKINGS_TABLE, $booking );
        my $sth = $dbh->prepare($stmt);
        $sth->execute(@bind);

        my $new_booking_id = $sth->last_insert_id();
        if ($is_update) {

            # Clear existing equipment associations
            ( $stmt, @bind ) = $sql->delete( $BOOKINGS_EQUIPMENT_TABLE, { bookingid => $booking_id } );
            $sth = $dbh->prepare($stmt);
            $sth->execute(@bind);
            $new_booking_id = $booking_id;
        }

        if ( defined $body->{'equipment'} && scalar @{ $body->{'equipment'} } > 0 ) {
            foreach my $item ( @{ $body->{'equipment'} } ) {
                ( $stmt, @bind ) = $sql->insert(
                    $BOOKINGS_EQUIPMENT_TABLE,
                    {   bookingid   => $new_booking_id,
                        equipmentid => $item,
                    }
                );
                $sth = $dbh->prepare($stmt);
                $sth->execute(@bind);
            }
        }

        # If all went well, we send an email to the associated borrower
        my $is_sent = send_email_confirmation($body);

        return $c->render(
            status  => defined $booking_id ? $CONSTANTS->{'HTTP_OK'} : $CONSTANTS->{'HTTP_CREATED'},
            openapi => $body
        );
    }
    catch {
        $c->unhandled_exception($_);
    };
}
1;
