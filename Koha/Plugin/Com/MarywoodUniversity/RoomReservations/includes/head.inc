[% USE gtx = Gettext('com.marywooduniversity.roomreservations', language, 'utf-8', mbf_path) %]
[%- USE JSON.Escape; -%]

[% INCLUDE 'doc-head-open.inc' %]
  <title>Plugins - [% gtx.gettext("Koha: Room Reservations Plugin: Configuration") %]</title>
  <link rel="stylesheet" href="/api/v1/contrib/roomreservations/static/css/main.css">
  <script type="text/javascript" src="/api/v1/contrib/roomreservations/static/js/main.js"></script>
  [% INCLUDE 'doc-head-close.inc' %]
</head>