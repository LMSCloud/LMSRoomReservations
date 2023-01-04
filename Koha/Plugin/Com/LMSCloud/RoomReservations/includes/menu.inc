[% base_url = "/cgi-bin/koha/plugins/run.pl" %]

<div class="lmsr-menu">
  <a
    href="[% base_url %]?class=[% CLASS %]&method=configure"
    class="lmsr-menu-item"
    >Settings</a
  >
  <a
    href="[% base_url %]?class=[% CLASS %]&method=configure&op=rooms"
    class="lmsr-menu-item"
    >Rooms</a
  >
  <a
    href="[% base_url %]?class=[% CLASS %]&method=configure&op=equipment"
    class="lmsr-menu-item"
    >Equipment</a
  >
  <a
    href="[% base_url %]?class=[% CLASS %]&method=tool"
    class="lmsr-menu-item"
    >Bookings</a
  >
  <a
    href="[% base_url %]?class=[% CLASS %]&method=tool&op=blackouts"
    class="lmsr-menu-item"
    >Blackouts</a
  >
  <a
    href="[% base_url %]?class=[% CLASS %]&method=tool&op=open-hours"
    class="lmsr-menu-item"
    >Open Hours</a
  >
</div>
