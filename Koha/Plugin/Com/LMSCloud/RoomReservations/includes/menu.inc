[% base_url = "/cgi-bin/koha/plugins/run.pl" %]

<div class="lmsr-menu">
  <a
    href="[% base_url %]?class=[% CLASS %]&method=configure"
    class="lmsr-menu-item configure"
    ><i class="fa fa-cog" aria-hidden="true"></i>&nbsp;
    <span>Settings</span>
  </a>
  <a
    href="[% base_url %]?class=[% CLASS %]&method=configure&op=rooms"
    class="lmsr-menu-item configure"
    ><i class="fa fa-cube" aria-hidden="true"></i>&nbsp;
    <span>Rooms</span>
  </a>
  <a
    href="[% base_url %]?class=[% CLASS %]&method=configure&op=equipment"
    class="lmsr-menu-item configure"
    ><i class="fa fa-tag" aria-hidden="true"></i>&nbsp;
    <span>Equipment</span>
  </a>
  <a
    href="[% base_url %]?class=[% CLASS %]&method=tool"
    class="lmsr-menu-item tool"
    ><i class="fa fa-list" aria-hidden="true"></i>&nbsp;
    <span>Bookings</span>
  </a>
  <a
    href="[% base_url %]?class=[% CLASS %]&method=tool&op=open-hours"
    class="lmsr-menu-item tool"
    ><i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;
    <span>Open Hours</span>
  </a>
</div>
