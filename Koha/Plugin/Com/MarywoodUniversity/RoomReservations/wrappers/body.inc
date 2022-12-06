<body>
  [% INCLUDE 'header.inc' %]
  [% INCLUDE 'cat-search.inc' %]

  [% INCLUDE "$PLUGIN_DIR/includes/breadcrumbs.inc" %]

  <div id="doc3">
    <h3 id="lmsr-heading-main">[% gtx.gettext("Koha: Room Reservations Plugin: Configuration") %]</h3>
    [% INCLUDE "$PLUGIN_DIR/includes/menu.inc" %]

    <div class="lmsr-content-main">
      [% content %]
    </div>

    [% INCLUDE "$PLUGIN_DIR/includes/menu_hydration.inc" %]
    
[% INCLUDE 'intranet-bottom.inc' %]
