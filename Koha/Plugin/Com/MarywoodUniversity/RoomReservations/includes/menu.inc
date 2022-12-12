<div class="lmsr-menu">
  <ol class="lmsr-menu-list">
    <li class="lmsr-menu-list-heading">Menu</li>
    <li class="lmsr-menu-list-item" data-value="">[% 'Settings' | gettext %]</li>
    <li class="lmsr-menu-list-item" data-value="rooms">[% 'Rooms' | gettext %]</li>
    <li class="lmsr-menu-list-item" data-value="equipment">[% 'Equipment' | gettext %]</li>
    <li class="lmsr-menu-list-item" data-value="restrictions">[% 'Restrictions' | gettext %]</li>
  </ol>
</div>

<form name="config_actions" method="post" action="#">
  <input type="hidden" name="class" value="[% CLASS %]" />
  <input type="hidden" name="method" value="[% METHOD %]" />
  <input type="hidden" name="op" value="" />
  <input type="submit" name="config-actions-submit" value="[% 'Continue' | gettext %]" class="lmsr-menu-input" />
</form>