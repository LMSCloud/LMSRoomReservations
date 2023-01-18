# LMSRoomReservations

## Notes

- All scripts that are accessed via apache2 ScriptAlias need exec permissions. Added to calendar.pl already.

### kohadev.conf (instance.conf)

The ScriptAlias points the configured path to the entry point of our frontend, in this case `calendar.pl`.
The Alias makes the plugins directory accessible to the OPAC.

```conf
ScriptAlias /roomreservations "/var/lib/koha/kohadev/plugins/Koha/Plugin/Com/LMSCloud/RoomReservations/Opac/calendar.pl"
Alias /plugin "/var/lib/koha/kohadev/plugins"
```

### apache2.conf

Here we grant access to the plugins directory to get around circumvent problems.

```conf
<Directory /var/lib/koha/kohadev/plugins/>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

### Components

- There is one component in the src/components dir that is a git submodule: **LMSCalendar**. Changes to this submodule must be staged and committed seperately.

### Infuriating errors

- If something goes wrong with the installer statements in the install hook, you will
  1. Get an error like this one `Calling 'install' died for plugin Koha::Plugin::Com::LMSCloud::RoomReservationsCompilation failed in require at /usr/share/perl/5.32/Module/Load.pm line 77.`.
  2. (Optionally) get other errors that lead you on a wrong path.
- Always validate your create statements **first** or you will regret it 2 hours down the line.
- Example: I had an excess comma on the last line of a create statement:
  ```sql
    CREATE TABLE $EQUIPMENT (
        `equipmentid` INT NOT NULL AUTO_INCREMENT,
        `equipmentname` VARCHAR(20) NOT NULL,
        `description` TEXT, -- equipment description to display in OPAC
        `image` TEXT, -- equipment image to display in OPAC
        `maxbookabletime` INT, -- the maximum timespan for a booking of this item
        PRIMARY KEY (equipmentid), -- THIS ONE!
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
  ```
  This produced the following errors:
  ```log
    Calling 'install' died for plugin Koha::Plugin::Com::LMSCloud::RoomReservations at /kohadevbox/koha/Koha/Plugins.pm line 246.
    Calling 'install' died for plugin Koha::Plugin::Com::LMSCloud::RoomReservationsCompilation failed in require at /usr/share/perl/5.32/Module/Load.pm line 77.
    Can't locate Koha/Plugin/Com/LMSCloud/RoomReservations/Controllers/Bookings in @INC (@INC contains: /kohadevbox/koha /kohadevbox/koha/lib /kohadevbox/qa-test-tools /etc/perl /usr/local/lib/aarch64-linux-gnu/perl/5.32.1 /usr/local/share/perl/5.32.1 /usr/lib/aarch64-linux-gnu/perl5/5.32 /usr/share/perl5 /usr/lib/aarch64-linux-gnu/perl-base /usr/lib/aarch64-linux-gnu/perl/5.32 /usr/share/perl/5.32 /usr/local/lib/site_perl /var/lib/koha/kohadev/plugins) at /usr/share/perl/5.32/Module/Load.pm line 77.
    ...
  ```
  Don't look at the **files it can't locate**, that's (most likely) **not** the source of your problems.

