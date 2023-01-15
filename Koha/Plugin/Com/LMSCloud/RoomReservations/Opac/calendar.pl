#!/usr/bin/perl

use utf8;
use English qw( -no_match_vars );
use Modern::Perl;

use File::Basename;
use File::Spec;
use CGI qw ( -utf8 );

use C4::Output qw( output_html_with_http_headers );
use C4::Auth qw( get_template_and_user );

our $VERSION = '1.0.0';

my @dirs = File::Spec->splitdir( dirname(__FILE__) );

splice @dirs, -1;
my $plugin_dir = File::Spec->catdir(@dirs);

my $query = CGI->new;
my ( $template, $borrowernumber, $cookie ) = get_template_and_user(
    {   template_name   => $plugin_dir . '/views/opac/calendar.tt',
        query           => $query,
        type            => 'opac',
        authnotrequired => 1,
        is_plugin       => 1,
    }
);

$template->param( borrowernumber => $borrowernumber, );

output_html_with_http_headers $query, $cookie, $template->output;

