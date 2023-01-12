# LMSRoomReservations

## Notes

- All scripts that are accessed via apache2 ScriptAlias need exec permissions. Added to calendar.pl already.

### kohadev.conf (instance.conf)

The ScriptAlias points the configured path to the entry point of our frontend, in this case ```calendar.pl```.
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