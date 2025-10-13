package Koha::Plugin::Com::LMSCloud::Util::Pages;

use Modern::Perl;
use utf8;
use 5.010;

use C4::Context              ();
use Koha::AdditionalContents ();
use Koha::DateUtils          qw( dt_from_string );

use Carp    qw( carp croak );
use English qw( -no_match_vars );

our $VERSION = '1.0.0';
use Exporter 'import';

BEGIN {
    our @EXPORT_OK = qw(
        create_opac_page
        update_opac_page
        delete_opac_page
        page_exists
    );
}

=head1 NAME

Koha::Plugin::Com::LMSCloud::Util::Pages - Manage Koha Additional Content pages

=head1 DESCRIPTION

This module provides functions to manage Koha Additional Content (Pages) for plugins.
It handles creation, updating, and deletion of OPAC pages programmatically.

=head1 FUNCTIONS

=head2 create_opac_page

    create_opac_page({
        code    => 'roomreservations',
        title   => 'Room Reservations',
        content => '<div>...</div>',
        lang    => 'default',
    });

Creates a new Koha page for the OPAC. Returns the idnew of the created page or undef on failure.

Parameters:
- code: Unique identifier for the page (required)
- title: Title of the page (required)
- content: HTML content for the page (required)
- lang: Language code (default: 'default')
- branchcode: Library code (default: undef = all libraries)

=cut

sub create_opac_page {
    my ($params) = @_;

    my $code       = $params->{'code'}    or croak 'code parameter is required';
    my $title      = $params->{'title'}   or croak 'title parameter is required';
    my $content    = $params->{'content'} or croak 'content parameter is required';
    my $lang       = $params->{'lang'} // 'default';
    my $branchcode = $params->{'branchcode'};

    # Check if page already exists
    if ( page_exists( { code => $code, lang => $lang } ) ) {
        carp "Page with code '$code' and lang '$lang' already exists";
        return;
    }

    my $dbh = C4::Context->dbh;

    my $sql = <<~'SQL';
        INSERT INTO additional_contents (
            category,
            code,
            location,
            branchcode,
            title,
            content,
            lang,
            published_on,
            number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    SQL

    my $published_on = dt_from_string()->ymd();

    my $sth = $dbh->prepare($sql);
    my $rv  = $sth->execute(
        'pages',          # category
        $code,            # code
        'opac_only',      # location
        $branchcode,      # branchcode
        $title,           # title
        $content,         # content
        $lang,            # lang
        $published_on,    # published_on
        0,                # number
    );

    if ( !$rv ) {
        carp join q{ }, 'Failed to create OPAC page:', $dbh->errstr;
        return;
    }

    return $dbh->last_insert_id( undef, undef, 'additional_contents', 'idnew' );
}

=head2 update_opac_page

    update_opac_page({
        code    => 'roomreservations',
        title   => 'Updated Title',
        content => '<div>...</div>',
        lang    => 'default',
    });

Updates an existing Koha page. Returns 1 on success, undef on failure.

Parameters:
- code: Unique identifier for the page (required)
- title: New title (optional)
- content: New HTML content (optional)
- lang: Language code (default: 'default')

=cut

sub update_opac_page {
    my ($params) = @_;

    my $code = $params->{'code'} or croak 'code parameter is required';
    my $lang = $params->{'lang'} // 'default';

    my $page = Koha::AdditionalContents->search(
        {   category => 'pages',
            code     => $code,
            lang     => $lang,
            location => 'opac_only',
        }
    )->next;

    if ( !$page ) {
        carp "Page with code '$code' and lang '$lang' not found";
        return;
    }

    if ( exists $params->{'title'} ) {
        $page->title( $params->{'title'} );
    }

    if ( exists $params->{'content'} ) {
        $page->content( $params->{'content'} );
    }

    my $rv = $page->store;

    if ( !$rv ) {
        carp 'Failed to update OPAC page';
        return;
    }

    return 1;
}

=head2 delete_opac_page

    delete_opac_page({
        code => 'roomreservations',
        lang => 'default',
    });

Deletes a Koha page by code and language. Returns 1 on success, undef if page not found.

Parameters:
- code: Unique identifier for the page (required)
- lang: Language code (default: 'default')

=cut

sub delete_opac_page {
    my ($params) = @_;

    my $code = $params->{'code'} or croak 'code parameter is required';
    my $lang = $params->{'lang'} // 'default';

    my $pages = Koha::AdditionalContents->search(
        {   category => 'pages',
            code     => $code,
            lang     => $lang,
            location => 'opac_only',
        }
    );

    if ( !$pages->count ) {
        carp "Page with code '$code' and lang '$lang' not found";
        return;
    }

    my $deleted_count = $pages->delete;

    return $deleted_count;
}

=head2 page_exists

    my $exists = page_exists({
        code => 'roomreservations',
        lang => 'default',
    });

Checks if a page exists with the given code and language.

Parameters:
- code: Unique identifier for the page (required)
- lang: Language code (default: 'default')

Returns 1 if page exists, 0 otherwise.

=cut

sub page_exists {
    my ($params) = @_;

    my $code = $params->{'code'} or croak 'code parameter is required';
    my $lang = $params->{'lang'} // 'default';

    my $count = Koha::AdditionalContents->search(
        {   category => 'pages',
            code     => $code,
            lang     => $lang,
            location => 'opac_only',
        }
    )->count;

    return $count > 0 ? 1 : 0;
}

=head1 AUTHOR

LMSCloud GmbH

=cut

1;
