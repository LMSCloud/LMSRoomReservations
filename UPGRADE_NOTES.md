# Upgrade notes — since v5.16.0

Ephemeral. Delete after the next release ships and the relevant items
land in CHANGELOG / customer-facing comms.

## Fixed-slot booking (new in v5.23.0)

Rooms can now be configured to be bookable only in fixed slots (e.g. a
2-hour rhythm: 10–12, 12–14, …) instead of a free start time + duration.

- **Schema:** `007_add_room_slot_length.sql` adds two nullable columns to
  `rooms`: `slot_length` (minutes; NULL/0 = free mode, unchanged behaviour)
  and `slot_start` (TIME anchor; NULL = align slots to that weekday's
  opening time). `__CURRENT_MIGRATION__` advances to `"007"`.
- **On the wire:**
  - Room request/response schemas gain `slot_length` and `slot_start`.
  - New `GET /public/rooms/{roomid}/slots?date=YYYY-MM-DD` →
    `{ slot_length, slots: [{ start, end, available }] }`. `available`
    folds in past times, open hours, blackouts/holidays and existing
    bookings.
  - `POST /public/bookings` and `POST /bookings` now 400 when a slot-mode
    room's start/end don't match a generated slot. Staff can pass
    `slot_override: 1` to bypass *only* the slot check (open-hours,
    conflict and max-time checks still apply); the public endpoint has no
    override.
- **UI:** OPAC `LMSBookie` swaps the date/time + duration inputs for a date
  picker + available-slot dropdown on slot-mode rooms. Staff room cards /
  add-room modal expose Slot length + Slot start. The staff bookings modal
  gains an "Override slot restriction" checkbox.
- **Look out for:** existing rooms are untouched (`slot_length` NULL → free
  mode). Setting `slot_length` on a room immediately constrains OPAC
  bookings and (unless overridden) staff bookings. Slots are generated only
  within regular open hours — special-hours deviations don't yet widen the
  grid.

## Staff bookings list: pagination, ordering & search (new in v5.26.0)

The staff bookings table is now server-paginated and searchable, and the
staff REST surface is gated more granularly.

- **`GET /bookings` is now paginated.** It accepts `_page`, `_per_page` and
  `_order_by` (Koha REST conventions; `_order_by` takes a leading `-` for
  descending) plus a `q` JSON search/filter param.
  - **Behaviour change — look out for:** the endpoint now returns **at most
    20 rows by default** (`_per_page`), where it previously returned *all*
    non-cutoff bookings. The plugin's own staff UI was updated in lockstep,
    but any external/automation client of `GET /bookings` that expected the
    full list must now paginate or pass `_per_page=-1` (unpaginated).
  - Responses carry an `X-Total-Count` header.
- **Search/filter (`q`).** Same JSON contract as Koha's `objects->search`
  endpoints, translated to SQL via `SQL::Abstract` over a column +
  operator whitelist (everything else is stripped; values are always
  bound). A bare term matches purpose, dates, ids, **patron name** and
  **room number** (the list `LEFT JOIN`s `borrowers` and `rooms`).
- **Permissions are now granular** (no longer the blanket `plugins` flag):
  booking endpoints require the `tool` subpermission; room/equipment/
  settings writes and all opening-hours endpoints require `configure`;
  shared room/equipment reads accept either. Opening-hours management moved
  from the tool menu to configuration. Existing staff who held the full
  `plugins` flag are unaffected; review any custom roles that relied on it.

## What's on the wire

| Endpoint | Before | After |
|---|---|---|
| `DELETE /rooms/{id}` | 500 if FK held by bookings | 204 (soft-delete); 409 if `bookings.end >= NOW()` |
| `GET /rooms` | all rows | active rows only; `?include_deleted=1` to include retired |
| `GET /rooms/{id}` | 404 once deleted | 200 even when retired (so booking history resolves) |
| `POST /bookings`, `POST /public/bookings` | accepted any roomid | 400 if room is retired (`is_active_room` gate) |
| `DELETE /equipment/{id}` | 204, cascaded `bookings_equipment` away | 204 (soft-delete); 409 if reserved by a future booking |
| `GET /equipment` | all rows | active rows only; `?include_deleted=1` to include retired |
| `GET /equipment/{id}` | 404 once deleted | 200 even when retired |
| `POST /bookings.equipment` | any equipmentid | 400 if any equipmentid is retired |
| `DELETE /bookings/{id}` (staff) | 204 always | 204 if `end >= NOW()`; **409 if booking has ended** |
| `DELETE /public/patron/bookings/{id}` | 204 always | same — **409 on past bookings** |

`openapi.json` reflects all of the above (new `include_deleted` query
params; 409 on `deleteRoomBooking`; `roomid` nullable on the
`getRoomBookings` and `getRoomPatronBookingsPublic` response items).

## Schema changes that ship

| Migration | What it does |
|---|---|
| `001_initial_schema.sql` | retroactively patched: dropped the `DROP TABLE IF EXISTS` preamble, every `CREATE TABLE`/`CREATE INDEX` now gated with `IF NOT EXISTS` |
| `002_add_purpose_of_use.sql` | retroactively patched: `ADD COLUMN IF NOT EXISTS` |
| `003_cascade_borrower_fk.sql` | retroactively patched: `DROP FOREIGN KEY IF EXISTS` + `ADD CONSTRAINT … FOREIGN KEY IF NOT EXISTS` (MariaDB grammar puts `IF NOT EXISTS` on the FK clause, not after `CONSTRAINT`) |
| `004_add_open_hours_deviations.sql` | retroactively patched: same `IF NOT EXISTS` gating as 001 |
| `005_soft_delete_rooms.sql` | `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL` |
| `006_soft_delete_equipment.sql` | `ALTER TABLE equipment ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL` |

Every migration is now individually idempotent at the plain-SQL
level — re-running any of them against an existing schema is a no-op
rather than failing with `duplicate-column` / `constraint-already-exists`.
Combined with the schema-defense in `MigrationHelper::upgrade()`,
re-execution from `001` is safe even if the high-water counter is
reset. Syntax target: MariaDB 10.0.2+ (the in-tree target is 10.5).

## Plugin lifecycle changes

- `uninstall()` now `DELETE`s `__CURRENT_MIGRATION__` from `plugin_data`.
  Before this fix, an uninstall-then-reinstall left a stale counter
  pointing at a high-water mark that no longer existed, causing
  `upgrade()` to skip every migration and leave the schema empty.
- `Util/MigrationHelper::upgrade()` (synced from
  `koha-plugin-lmscloud-util` `3629b81`) now probes
  `information_schema.tables` for the mapped plugin tables and, if
  none exist, treats the counter as stale and re-runs all migrations
  from `001`. Safe because `001`/`004` are `IF NOT EXISTS`-gated.

The vendor submodule pointer moved to `3629b81` — anyone cloning the
repo fresh after this release needs `git submodule update --init` (or
to re-run `npm run util:sync` after pulling).

## UI / frontend changes

These don't affect the wire, but a customer running QA will notice
them. Worth flagging in any release notes that go out.

- **Staff room and equipment cards restyled** to match
  `LMSStaffEventCard` from `LMSEventManagement`: `shadow-md` instead of
  `shadow-xl`, the image is now the background of a `bg-cover`
  `card-title` with the room/equipment name overlaid in a `bg-base-100`
  chip, and Edit / Save / Delete consolidated into a `join` button row
  with icon-only labels below the `sm:` breakpoint. Visual only; no
  behavior change.
- **`LMSRoom` gained Data / Preview tabs.** The Data tab keeps the
  form fields; the Preview tab renders the same layout
  `RoomReservationsView` ships on the OPAC (figure with full image,
  color badge, description, branch / max bookable time / max capacity
  rows, disabled Book button) so staff can see exactly what patrons
  will get. Closes the regression where the restyle hid the full
  image inside `bg-cover`. Patterned after `LMSStaffEventCardDeck`'s
  tabbed shell.
- **Live "≈ N hour(s), N minute(s)" hint under the Max Bookable Time
  input.** Updates per keystroke (the card-body now listens for
  `@input` alongside `@change`). Driven by
  `formatMinutesHumanReadable`, which was reshaped — see the next
  bullet.
- **`formatMinutesHumanReadable` return type changed** from
  `TemplateResult[]` to a single `TemplateResult`, parts now joined
  with `, ` and proper singular forms (`1 minute` / `2 minutes`,
  `1 hour` / `2 hours`, `1 day` / `2 days`). External callers using
  `${formatMinutesHumanReadable(n)}` in Lit templates keep working
  unchanged; anyone treating the result as an array (`.length`,
  `.map`, etc.) will need to update. Internal callers
  (`RoomReservationsView`, `LMSRoom`'s preview) are fine.
- **OPAC room cards skip the `<figure>` when there is no image.**
  Previously the `<img>` rendered with empty `src` and the
  `A depiction of room X` alt fallback, which browsers surfaced as
  broken-image text.
- **`LMSPatronSearch` rewritten** as a thin wrapper around
  `LMSCombobox` (the same combobox used for Duration in `LMSBookie`).
  External properties (`name`, `description`, `placeholder`, `value`,
  `required`) and the change-event contract
  (`detail = { name, value: borrowernumber }`) are unchanged — the
  bookings modal needs no edits. Gains:
    - `role="combobox"`, `aria-expanded`, `aria-activedescendant`,
      `aria-controls` now wired correctly; the previous hand-rolled
      implementation was missing `aria-expanded` and
      `aria-activedescendant`.
    - Option rendering follows Koha core's
      `patron_autocomplete._renderItem` convention from
      `staff-global.js`: primary line "Surname, Firstname [Middle]
      (cardnumber)" + `<small>` carrying `Id: N`.
    - `/api/v1/patrons` query now includes `_per_page=10` and
      `_order_by=+me.surname,+me.firstname` mirroring Koha's own
      autocomplete.
    - The bespoke in-result highlighting from the old
      `LMSPatronSearch` is gone. If you used to rely on the
      `<span class="bg-yellow-200">` wrap around matches, it's no
      longer there — option labels are plain text now (with a
      `<small>` for the secondary info).
- **`LMSCombobox` is now registered in the staff bundle** (`staff.ts`
  imports/exports it). Without that, `<lms-combobox>` instances inside
  `lms-patron-search` would render as unknown elements. If you ship
  your own staff entrypoint, it must register `LMSCombobox` for the
  hydration to take effect.
- **`LMSCombobox.handleInput` now `e.stopPropagation()`-s the native
  input event** so consumers' `@input` listeners only see the
  canonical `CustomEvent("input")` (`detail: { value }`). Previously
  the native input bubbled past the host (composed: true) as a
  duplicate with `e.detail === undefined`, racing with the custom
  event and crashing any handler that destructured `detail.value`.
- **`LMSComboboxOption` type widened**: `label` is now
  `string | TemplateResult`; an optional `searchText` field is used
  for the built-in substring filter when `label` isn't a plain
  string. Existing options that pass a string `label` and rely on
  label-based filtering keep working without changes.

## What to look out for on existing installations

1. **Admin scripts that delete past bookings will now 409.** If there
   is any cron / cleanup pipeline that issues
   `DELETE /bookings/{id}` for historical entries (purges,
   GDPR retention, test-data cleanup), it will start failing. Audit
   for callers. The new behavior is intentional — preserves audit
   trail — but downstream tooling will need updating or a
   dedicated bypass endpoint.

2. **Admin workflows that delete rooms/equipment with upcoming
   bookings will now 409.** UI surfaces this via the toast we added
   in `LMSRoom` / `LMSEquipmentItem`. Anyone using the API directly
   gets the `error` JSON body — check that any automation handles
   the 409 explicitly rather than treating it like a generic 5xx.

3. **Staff bookings list may show `roomid: null` for historical
   bookings whose room was soft-deleted** if/when that happens —
   the openapi schema now declares it nullable. The frontend renders
   the value as-is; no "Retired" badge yet. Worth a visual check
   after the first room is retired in production.

4. **First call to `DELETE /rooms/{id}` after upgrade can succeed
   silently if there are *no* bookings on the room.** The row still
   stays in the DB with `deleted_at` set; this is the new soft-delete
   semantics. Anyone expecting `SELECT FROM rooms` to drop the row
   needs to query with the `deleted_at IS NULL` filter (or use the
   API endpoints, which already filter).

5. **The destructive reinstall trap that wiped the schema on this
   dev container during the session is now closed**, but recovery
   from any state where someone hand-DROPs tables outside the
   plugin's normal path still requires either a version bump or
   manually clearing `__INSTALLED__` from `plugin_data`. Koha's
   `Plugins::Base::new()` lifecycle only inspects version, not
   schema. We considered overriding `new()` to add a
   schema-presence backstop and decided to defer — call out if it
   bites anyone before the next session.

6. **Migration `003_cascade_borrower_fk.sql` only got the
   idempotency gate** (`DROP FOREIGN KEY IF EXISTS` / `ADD CONSTRAINT
   IF NOT EXISTS`); the borrower-deletion-cascades-bookings behavior
   it sets up is unchanged (intentional, GDPR-shaped). Don't conflate
   it with the new past-booking deletion guard — that guard is on
   the *staff/patron API*, not on borrower lifecycle.

7. **Vendor mirror asymmetry.** The submodule's `origin` points at
   GitHub (`https://github.com/lmscloudpauld/koha-plugin-lmscloud-util`),
   but the working clone we pushed from uses the LMSCloud git host.
   `3629b81` was reachable via GitHub immediately after we pushed to
   LMSCloud — they appear auto-mirrored. If the mirror ever lags,
   `git submodule update --init` from this repo will fail.

8. **Dist bundles still need to be rebuilt** before this release
   actually carries the frontend changes. There are now many:
   the toast in `LMSRoom` / `LMSEquipmentItem`, the
   `include_deleted=1` on the bookings view's room/equipment fetches,
   the card restyle, the Data / Preview tabs and live max-bookable-time
   hint on the staff room card, the OPAC empty-image guard, and the
   `LMSPatronSearch` → `LMSCombobox` rewrite. `npm run build` then a
   `chore: build new bundles` commit per repo convention. The
   `util:sync` step in the build also reproduces the `MigrationHelper`
   contents from vendor, which is already what's in tree right now.

9. **Anyone with their own external consumer of
   `formatMinutesHumanReadable` outside this repo will break** if
   they treated the return value as an array. Quick grep against any
   sibling plugins before shipping.

10. **External staff-side imports of `LMSCombobox` need verifying.**
    The `e.stopPropagation()` on the native input event in
    `handleInput` is the kind of small behavior change that could
    surprise an out-of-tree consumer wiring an `@input` listener.
    Worth a quick search through any other consumers (none in this
    repo besides `LMSBookie`, which reads `.value` at submit and
    doesn't care).

## Suggested smoke test on a customer install

1. Pre-upgrade: snapshot a room with past + future bookings and one
   without bookings; same for equipment.
2. Apply upgrade (whatever release vehicle is used).
3. Verify `__CURRENT_MIGRATION__` advanced to `"006"` and both new
   `deleted_at` columns exist (`SHOW COLUMNS FROM ..._rooms LIKE
   'deleted_at'` etc.).
4. Try `DELETE /rooms/{room_with_future_booking}` → expect 409.
5. Try `DELETE /rooms/{room_without_bookings}` → expect 204; row
   stays with `deleted_at` set; row no longer appears in `GET /rooms`;
   `GET /rooms/{id}` still returns it.
6. Same flow for equipment.
7. Try `DELETE /bookings/{past_booking_id}` → expect 409.
8. Confirm OPAC room/equipment lists hide the retired entries.
9. Confirm staff bookings view (with rebuilt JS) renders the
   retired-room dropdown correctly for any historical bookings that
   point at the now-soft-deleted room.
10. Open the staff Rooms admin page and verify the restyled card:
    `shadow-md`, image-as-bg title, join button row. Click between
    Data and Preview tabs — the Preview tab should show a card that
    visually matches what patrons see in the OPAC.
11. Edit a room's Max Bookable Time and watch the
    "≈ N hour(s), N minute(s)" hint update as you type. Quick spot
    checks: `60` → "1 hour", `90` → "1 hour, 30 minutes", `1501` →
    "1 day, 1 hour, 1 minute".
12. In the staff bookings modal, focus the Borrower field and start
    typing — confirm the dropdown shows Koha-styled rows
    (`Surname, Firstname (cardnumber)` + small `Id: N`), keyboard
    arrow navigation works, Esc closes, and a screen reader picks up
    the combobox role with `aria-expanded` toggling.
13. Open an OPAC room card whose room has no image — confirm there's
    no broken-image figure, just the card body.
