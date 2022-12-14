WARNING: Prior to version 1.1.15 there is no safeguard in place to prevent data from being deleted during an upgrade. Be sure to backup/save data prior to upgrading. Beginning with version 1.1.15 as a new install, existing table data (reservations, rooms, room equipment, etc.) will persist after upgrades. Even so, always remember to perform a database backup prior to upgrading any component!

# Install dependencies

* Install Template::Plugin::Gettext: `sudo cpanm Template::Plugin::Gettext`

# Apache Configuration

* These instructions assume the plugin is being installed in [kohadevbox](https://github.com/digibib/kohadevbox). If installing for production change the file paths accordingly.

In order for the Room Reservations plugin to work from the OPAC, Apache needs to be tweaked.

First, add the following ScriptAlias Directive to your Apache configuration file under the OPAC section (on Debian, depending on your installation, the configuration file is typically located in `/etc/apache2/sites-enabled`)

    ScriptAlias /booking "/var/lib/koha/kohadev/plugins/Koha/Plugin/Com/MarywoodUniversity/RoomReservations/opac/calendar.pl"

Next, also under the OPAC section of the koha.conf Apache configuration file, we need to add an Alias entry so the plugins folder can be reached from the OPAC

    Alias /plugin "/var/lib/koha/kohadev/plugins"

Last, we need to add a directive to `/etc/apache2/apache2.conf` to prevent 403 errors on the OPAC
    
**Important**
The following directory stanza is only required in **Apache 2.4+**. `Require all granted` will result in breaks on **Apache 2.2 and below**.
    
    <Directory /var/lib/koha/kohadev/plugins/>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>
# Prerequisite Modules

This plugin requires the following modules to be installed:
* Cwd
* File::Basename
* Calendar::Simple ( This plugin *requires* version 1.21, version 2.0.0 changes the output. Version 1.21 can be installed from Debian packages (`apt-get install -y libcalendar-simple-perl`, installing from cpan `cpanm Calendar::Simple` will get you the incorrect version 2.0.0 )

# Add link to OPAC

To add a link to this plugin for acess from the OPAC add the following lines to the `OPACUserJs` System Preference

    /* Add Booking link for redirection plugin script */
    $("#moresearches li:contains('Advanced search')").after("<li><a href='/booking' target='_blank'>Booking</a></li>");

# Translations

This plugin supports translations!

Basic translation Workflow:
1) Run: `xgettext-tt2 --output=com.marywooduniversity.roomreservations.pot  --add-comments=TRANSLATORS: --from-code=utf-8 --force-po *`
from Koha/Plugin/Com/MarywoodUniversity/RoomReservations to update com.marywooduniversity.roomreservations.pot
2) To generate a .po file for your language, run: `msginit --input=com.marywooduniversity.roomreservations.pot --locale=fr` replacing `fr` with the language code of your choice.
3) Edit the .po file, add you translated string
4) Compile the .po file to a .mo file using the command: `msgfmt --check --statistics --verbose -o fr.mo fr.po`
5) Move the .mo file to `Koha/Plugin/Com/MarywoodUniversity/RoomReservations/translations/fr/LC_MESSAGES/com.marywooduniversity.roomreservations.mo`
6) Send us the .po and .mo files! If you know how, you can submit a pull request on GitHub!

# Additional Info

This plugin expects two message templates!

On a clean install, these will be inserted into the database. But.. Since you most likely want to edit the messages to your patrons to look a little more 'branded' and even chique, you'll have to generate these yourself, if you just do an upgrade.

The letter codes are **ROOM_RESERVATION** and **ROOM_CANCELLATION**.

This is what gets inserted into the DB on a fresh install:

__ROOM_RESERVATION__

```sql
INSERT IGNORE INTO letter ( module, code, branchcode, name, is_html, title, message_transport_type, lang, content ) VALUES (
    'members', 'ROOM_RESERVATION', "", "Raumreservierungsbenachrichtigung", 1, "Reservierung eines Raumes", "email", "default", 
    "<h2>Ihre Raumreservierung wurde best??tigt</h2>
    <hr>
    <h3>Ihre Angaben</h3>
    <span>Name: [% user %]</span><br>
    <span>Raum: [% room %]</span><br>
    <span>Von: [% from %]</span><br>
    <span>Bis: [% to %]</span>
    <hr>
    <h3>Ihre gebuchte Ausstattung</h3>
    <span>[% booked_equipment %]</span>
    <hr>
    <h3>Zeitpunkt der Best??tigung</h3>
    <span>[% confirmed_timestamp %]</span>"
);
```

__ROOM_CANCELLATION__

```sql
INSERT IGNORE INTO letter ( module, code, branchcode, name, is_html, title, message_transport_type, lang, content ) VALUES (
    'members', 'ROOM_CANCELLATION', "", "Raumreservierungsstornierungsbenachrichtigung", 1, "Stornierung der Reservierung eines Raumes", "email", "default",
    "<h2>Ihre Raumreservierung wurde storniert</h2>
    <p>Es tut uns Leid, Sie dar??ber informieren zu m??ssen, dass Ihre Reservierung storniert werden musste.</p>
    <hr>
    <h3>Ihre Angaben</h3>
    <span>Raum: [% room %]</span><br>
    <span>Von: [% from %]</span><br>
    <span>Bis: [% to %]</span>"
);
```

Just remember to insert these if you're wondering why no mails reach their respective targets.
