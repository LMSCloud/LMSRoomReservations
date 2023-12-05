package Koha::Plugin::Com::LMSCloud::RoomReservations::lib::Translations;

use Modern::Perl;
use utf8;
use Exporter 'import';
use POSIX qw(setlocale);
use Encode;

our @EXPORT_OK = qw(set_translation_environment with_language_context);

sub set_translation_environment {
    my $self = shift;

    my $package_name = ref($self) || $self;
    $package_name =~ s/^Koha::Plugin:://;
    my $textdomain = lc $package_name;
    $textdomain =~ s/::/\./g;

    require Locale::TextDomain;
    Locale::TextDomain->import( $textdomain, ':all' );

    require Locale::Messages;
    Locale::Messages->import( ':locale_h', ':libintl_h', 'bind_textdomain_filter' );

    setlocale Locale::Messages::LC_MESSAGES(), q{};
    Locale::TextDomain::textdomain($textdomain);
    bind_textdomain_filter( $textdomain, \&Encode::decode_utf8 );
    Locale::TextDomain::bindtextdomain( $textdomain, $self->bundle_path . '/locales/' );

    return $self;
}

sub with_language_context {
    my ( $lang, $code_block ) = @_;

    # Save the current environment settings
    my $old_lang    = $ENV{LANGUAGE};
    my $old_charset = $ENV{OUTPUT_CHARSET};

    # Set the new language environment
    local $ENV{LANGUAGE}       = $lang || 'en';
    local $ENV{OUTPUT_CHARSET} = 'UTF-8';

    # Execute the code block in this environment
    my $result = $code_block->();

    # Restore the old environment settings
    $ENV{LANGUAGE}       = $old_lang;
    $ENV{OUTPUT_CHARSET} = $old_charset;

    return $result;
}

1;
