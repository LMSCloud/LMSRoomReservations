package Koha::Plugin::Com::LMSCloud::RoomReservations::Lib::Validators;

use Modern::Perl;
use utf8;
use 5.010;

our $VERSION = '1.0.0';
use Exporter 'import';

BEGIN {
    our @EXPORT_OK = qw( is_valid_string is_valid_number is_valid_datetime );
}

use constant {
    MAX_LENGTH_VARCHAR => 255,
    MAX_LENGTH_INT     => 2_147_483_647,
};

sub is_valid_string {
    my ( $value, $length ) = @_;

    # Return immediately if the given value is not defined.
    return ( 0, ['The given value is not defined.'] ) if !defined $value;

    # Uses a regular expression to check whether the given value is alphanumeric.
    my $is_alphanumeric = $value =~ m/^[[:alpha:]\d]+$/smx;

    # Uses a regular expression to check whether the given value has a certain length using the supplied length.
    my $has_given_length = $value =~ m/^.{1,$length}$/smx;

    # Checks whether the given value exceeds the MAX_LENGTH_VARCHAR.
    my $exceeds_max_length = length $value <= MAX_LENGTH_VARCHAR;

    if ( $is_alphanumeric && $has_given_length && !$exceeds_max_length ) {
        return (1);
    }

    my $errors = [];
    push @{$errors}, 'The given value is not alphanumeric.'        if !$is_alphanumeric;
    push @{$errors}, 'The given value has not the given length.'   if !$has_given_length;
    push @{$errors}, 'The given value exceeds the maximum length.' if !$exceeds_max_length;

    return ( 0, $errors );
}

sub is_valid_number {
    my ($args) = @_;

    # Return immediately if the given value is not defined.
    return ( 0, ['The given value is not defined.'] ) if !defined $args->{'value'};

    my ( $min, $max ) = @{ $args->{'range'} } || ( 0, MAX_LENGTH_INT );

    # Uses a regular expression to check whether the given number is a number.
    my $is_number = $args->{'value'} =~ m/^\d+$/smx;

    # Uses a regular expression to check whether the given number has a certain length if the length option is defined.
    my $has_given_length = defined $args->{'length'} ? $args->{'value'} =~ m/^.{1,$args->{'length'}}$/smx : 1;

    # Uses a regular expression to check whether the given number is positive if the positive option is true.
    my $is_positive = $args->{'positive'} ? $args->{'value'} =~ m/^[1-9]\d*$/smx : 1;

    # Checks whether the given value exceeds a certain value if the max_value option defined.
    my $exceeds_max_value = defined $args->{'max_value'} ? $args->{'value'} > $args->{'max_value'} : 0;

    # Checks whether the given value is in a certain range if the range option is defined or between 0 and MAX_LENGTH_INT.
    my $is_in_range = defined $args->{'range'} ? ( $args->{'value'} >= $min && $args->{'value'} <= $max ) : ( $args->{'value'} >= 0 && $args->{'value'} <= MAX_LENGTH_INT );

    # Check if all options specified in args are true.
    if (   $is_number
        && $has_given_length
        && $is_positive
        && !$exceeds_max_value
        && $is_in_range )
    {
        return (1);
    }

    my $errors = [];
    push @{$errors}, 'The given value is not a number.'           if !$is_number;
    push @{$errors}, 'The given value has not the given length.'  if !$has_given_length;
    push @{$errors}, 'The given value is not positive.'           if !$is_positive;
    push @{$errors}, 'The given value exceeds the maximum value.' if $exceeds_max_value;
    push @{$errors}, 'The given value is not in the given range.' if !$is_in_range;

    return ( 0, $errors );
}

sub is_valid_datetime {
    my ($args) = @_;

    # Return immediately if the given value is not defined.
    return ( 0, ['The given value is not defined.'] ) if !defined $args->{'value'};

    # Uses a regular expression to check whether the given value is a datetime in the format YYYY-MM-DDTHH:mm.
    my $is_valid_datetime = $args->{'value'} =~ m/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/smx;

    # Checks whether the given value is equal or greater than the current localtime if the after option is true.
    # This assumes that the server this is run on is in the same timezone as the client.
    my $is_after_localtime = defined $args->{'after'} ? ( $args->{'value'} ge localtime->strftime('%Y-%m-%dT%H:%M') ) : 1;

    # Checks whether the given value is equal or less than a supplied datetime in the format YYYY-MM-DDTHH:mm if the before option is defined.
    my $is_before = defined $args->{'before'} ? ( $args->{'value'} le $args->{'before'} ) : 1;

    # Check if all options specified in args are true.
    if ( $is_valid_datetime && $is_after_localtime && $is_before ) {
        return (1);
    }

    my $errors = [];
    push @{$errors}, 'The given value is not a datetime in the format YYYY-MM-DDTHH:mm.' if !$is_valid_datetime;
    push @{$errors}, 'The given value is not after the current localtime.'               if !$is_after_localtime;
    push @{$errors}, 'The given value is not before the given datetime.'                 if !$is_before;

    return ( 0, $errors );
}

1;
