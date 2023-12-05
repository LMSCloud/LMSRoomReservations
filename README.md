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
    Options FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

### Or just in INSTANCE.conf

```conf
ScriptAlias /roomreservations "/var/lib/koha/INSTANCE/plugins/Koha/Plugin/Com/LMSCloud/RoomReservations/Opac/calendar.pl"
Alias /plugin "/var/lib/koha/INSTANCE/plugins"

<Directory /var/lib/koha/INSTANCE/plugins/>
    Options FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

### Components

- There is one component in the src/components dir that is a git submodule: **LMSCalendar**. Changes to this submodule must be staged and committed seperately.

<!--
### Translating

To generate the pot file we use `xgettext` and include all dirs, perl or JavaScript where translated strings show up.
It's important to include shorthands like `__`. Otherwise those strings will be skipped.

```bash
xgettext --output=com.lmscloud.roomreservations.pot --from-code=utf-8  --force-po --keyword=__ --keyword=this._i18n.gettext src/extensions/*.js src/views/*.js src/components/*.js Koha/Plugin/Com/LMSCloud/RoomReservations/Controllers/**/*.pm Koha/Plugin/Com/LMSCloud/RoomReservations/Lib/*.pm dynamically_added_strings.js
```

If the pot file is created we use `msginit` to create a po file for our locale.
Then we translate our strings within that po file.

```bash
msginit --input=com.lmscloud.roomreservations.pot --locale=de -o locales/de.po
```

### Dynamically added Strings

Sometimes we don't have strings in our Markup that can be parsed by xgettext.

#### Example

The render method within the LMSTable component translates dynamically added strings.

```JavaScript
${Object.keys(headers).map(
    (key) => html`<th scope="col">${this._i18n.gettext(key)}</th>`
)}
```

We could add an object as a map of the occurring strings or we could just use [dynamically_added_strings.md](https://github.com/LMSCloud/LMSRoomReservations/blob/tabula-rasa/dynamically_added_strings.md).

#### JS

To include the translations in our client-side code, we use `npx gulp translations` to run the parsing and conversion
to json. This uses `po2json@next`. The output format `mf` works but we have to append metadata in an empty key as the library doesn't add it for this format.

#### Updating translations

If want to add translations for new modules or fix the spelling in the source locale you just have to update the pot file with xgettext and then use Poedit to update the translations from the pot file **Translation -> Update from POT file**.

### Infuriating errors

#### Install hook weirdness

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

#### Requesting the wrong endpoint

- If you see these errors popping up

  ```log
    [2023/01/18 15:19:42] [WARN] ERROR: Unsupported method history at /kohadevbox/koha/Koha/Logger.pm line 135.
    [2023/01/18 15:19:42] [ERROR] Can't use an undefined value as an ARRAY reference at template mojo/debug.h
    tml.ep line 288.
    Context:
      283:               </div>
      284:               <div class="tap tap-border-top">tap for more</div>
      285:             </div>
      286:           </div>
  ```

  you **likely** didn't request the endpoint, you think you did.
- Check your AJAX or whatever you use for the requests to hit the endpoint/method you intended.

-->

## Message Templates

**ROOM_RESERVATION**

```sql
INSERT IGNORE INTO letter ( module, code, branchcode, name, is_html, title, message_transport_type, lang, content ) VALUES (
    'members', 'ROOM_RESERVATION', q{}, 'Raumreservierungsbenachrichtigung', 1, 'Reservierung eines Raumes', 'email', 'default',
'<html>
  <head>
    <style>
      h2 {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      h3 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      span {
        font-size: 16px;
        margin-bottom: 5px;
        display: block;
      }
      .container {
        width: max-content;
        text-align: center;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      }
      .card {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Ihre Raumreservierung wurde bestätigt</h2>
      <div class="card">
        <h3>Ihre Angaben</h3>
        <span>Name: [% user %]</span><br>
        <span>Raum: [% room %]</span><br>
        <span>Von: [% from %]</span><br>
        <span>Bis: [% to %]</span>
      </div>
      <div class="card">
        <h3>Ihre gebuchte Ausstattung</h3>
        <span>[% booked_equipment %]</span>
      </div>
      <div class="card">
        <h3>Zeitpunkt der Bestätigung</h3>
        <span>[% confirmed_timestamp %]</span>
      </div>
      <div class="footer">
        Mit freundlichen Grüßen,<br>
        Ihre Bibliothek
      </div>
    </div>
  </body>
</html>'
);
```

**ROOM_CANCELLATION**

```sql
INSERT IGNORE INTO letter ( module, code, branchcode, name, is_html, title, message_transport_type, lang, content ) VALUES (
    'members', 'ROOM_CANCELLATION', q{}, 'Raumreservierungsstornierungsbenachrichtigung', 1, 'Stornierung der Reservierung eines Raumes', 'email', 'default',
'<html>
  <head>
    <style>
      h2 {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      h3 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      p {
        font-size: 16px;
        margin-bottom: 20px;
      }
      span {
        font-size: 16px;
        margin-bottom: 5px;
        display: block;
      }
      .container {
        width: max-content;
        text-align: center;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      }
      .card {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Ihre Raumreservierung wurde storniert</h2>
      <p>Es tut uns Leid, Sie darüber informieren zu müssen, dass Ihre Reservierung storniert werden musste.</p>
      <div class="card">
        <h3>Ihre Angaben</h3>
        <span>Raum: [% room %]</span><br>
        <span>Von: [% from %]</span><br>
        <span>Bis: [% to %]</span>
      </div>
      <div class="footer">
        Mit freundlichen Grüßen,<br>
        Ihre Bibliothek
      </div>
    </div>
  </body>
</html>'
);
```
