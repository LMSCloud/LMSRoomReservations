## [unreleased]

### ⚙️ Miscellaneous Tasks

- Increment major, minor versions for new release
## [5.2.0-beta.14] - 2025-10-21

### 🚀 Features

- Migrate OPAC interface to Koha Pages
- Add optional enforced email notifications for OPAC bookings
- Add open hours deviations management with Koha calendar integration

### 🐛 Bug Fixes

- Prevent FK violations in Koha by cascading on update and delete
- Ensure OPAC page creation during plugin upgrade

### 🚜 Refactor

- Migrate to pders01/koha-plugin for project management
- Migrate from Rollup to Rolldown with code splitting
- Migrate Util to shared submodule

### 🧪 Testing

- Add db seed for testing, update README.md, justfile

### ⚙️ Miscellaneous Tasks

- Update staticapi to updated upstream, update justfile, env
- Update Util submodule to include module files
- Reformat docs, fix some linter complaints
- Remove unused dependencies and old Rollup config
- Update koha-plugin-lmscloud-util
- Add Template::Plugin::Gettext for string extraction via xgettext-tt2
- Update german translations
- Build new bundle
- Add CHANGELOG.md
## [4.8.5-beta.13] - 2024-12-21

### 🐛 Bug Fixes

- Remove perl version requirement of 5.032
- *(LMSCalendar)* Update to ba36bbdef0aba9d06c043e99dba9b773a587f815 to prevent date generation errors in 2025

### ⚙️ Miscellaneous Tasks

- Reformat
- Increment patch version
- Build new bundle
## [4.8.3-beta.12] - 2024-09-02

### 🐛 Bug Fixes

- Prevent conflicts with core booking feature in operation ids

### 💼 Other

- Increment patch version
## [4.8.2-beta.11] - 2024-03-05

### 🐛 Bug Fixes

- Adjust response schema to usage in settings deletion

### 💼 Other

- Build new package

### 🚜 Refactor

- Add generic translation util LMSCloud::Util::I18N
- Add interface to resolve lms-patron-search

### ⚙️ Miscellaneous Tasks

- Increment patch version
## [4.8.1-beta.10] - 2024-03-01

### 🐛 Bug Fixes

- Update submodule LMSCalendar

### 💼 Other

- Move to current submodule commit for LMSCalendar
- Build new package
- Build new package

### ⚙️ Miscellaneous Tasks

- Increment patch version
## [4.8.0-beta.9] - 2024-03-01

### 🚀 Features

- Update LMSCalendar to new version
- Add a purpose of use field for bookings
- Update LMSCalendar to current main
- Add deletion of bookings and display of purpose of use to patron's bookings view

### 🐛 Bug Fixes

- Add branch in guard clause for change handler in LMSRoom
- Only allow branches w/ opening hours set to be displayed in branch select
- Add borrowernumber class for easier retrieval in save handler
- Explicitly import textdomain (only temporary, this is still a problem)
- Add perlimports config and exclude Locale::TextDomain
- Only allow hex color definitions in backend validation for colors

### 💼 Other

- Increase version on feature and build new package
- *(2439c595db1290773b7d7ef08b54a7124b0f1ec8)* Update to latest patch
- *(4e064ed5bb735fee6cbba6854e108087470f9f4f)* Update latests build w/ LMSCalendar fix
- Fix typo in README.md
- Add whitespace nowrap to all string fields that could have line breaks for table rows
- Build new package
- *(653bdd0c0186c50babd93576bc5d89018f794d83)* Update german translations
- *(f6fc03d80cca742ba2a776a223e776bf7f5406a4)* Add root module
- *(f6fc03d80cca742ba2a776a223e776bf7f5406a4)* Add import from scalar util
- *(f6fc03d80cca742ba2a776a223e776bf7f5406a4)* Replace param->('body') calls and req->body to json conversion w/ $c->req->json
- *(f6fc03d80cca742ba2a776a223e776bf7f5406a4)* Move migration helper into safer LMSCloud::Util namespace
- Update mapping to luxon style objects and build new package

### 🚜 Refactor

- Opening hours view, visual cleanup
- Reformat w/ perlimports and access param directly
- L10n, validation, pathing (details below)

### ⚙️ Miscellaneous Tasks

- Remove submodules and add note in README.md
- Add no-fmt variant for build script
- Add perltidyc, update format scripts, replace perltidy config w/ pbp variant
- Add cache files to gitignore and remove from git cache
- Update german translations
- Add .kohaignore
- Update german translations
- Increment by two minor versions
## [4.4.2-beta.8] - 2023-12-05

### 🐛 Bug Fixes

- Prevent display of unassociated items on pending room selection

### 💼 Other

- Build new package
- Increment version on patch
- Increment version on patch

### 🚜 Refactor

- Add some vertical spacing to lms bookie cbs

### ⚙️ Miscellaneous Tasks

- Update README.md
## [4.4.0-beta.7] - 2023-12-05

### 🚀 Features

- Introduce ZodErrorElement and handle modal errors gracefully

### 🐛 Bug Fixes

- No reaction for undefined value in roomChange handler
- Improvements to a user's reservation view
- Correct comparison of booking times to branch's open hours
- Env setup for translations
- Refetch borrowers on event creation

### 💼 Other

- Update german translations
- Add public controller dir to translatables
- Update german translations
- Build new package
- Increment version on new feat and patches

### 🚜 Refactor

- Clean up the save handler for readability

### 🎨 Styling

- Adjust deref to dbh auto commit to convention

### ⚙️ Miscellaneous Tasks

- Update german translations
## [4.3.1-beta.6] - 2023-11-24

### 🐛 Bug Fixes

- Unset min-width on sm+ viewports

### 💼 Other

- Increment version on patch
## [4.3.0-beta.5] - 2023-11-23

### 🚀 Features

- Add endpoint to retrieve authorized patron's details
- Improve LMSBookie component and add login prompt

### ⚙️ Miscellaneous Tasks

- Update build script to use p-kpz from .local/bin
- Update german translations
- Increment version on feats
## [4.3.0-beta.4] - 2023-11-11

### 💼 Other

- Correct property name in equipment loop in template

### ⚙️ Miscellaneous Tasks

- Prevent undefined from being rendered in template
- Move button to the right of card in template
## [4.1.4-beta.3] - 2023-09-19

### 🐛 Bug Fixes

- Allow preselect of room, prevent display of unassoc items

### 💼 Other

- Move check for preselect into updated hook
- Increment version on patch

### ⚙️ Miscellaneous Tasks

- Add example template for entry page to templates dir
## [4.1.1-beta.3] - 2023-09-19

### 💼 Other

- Don't run the workflow on every push for the moment
- Temp rename
- Fix cached dirname from Lib to lib
## [4.1.1-beta.2] - 2023-09-19

### 🐛 Bug Fixes

- Contrib libraries endpoint for compat w/ 21.05
- Prevent line-breaks in table cells

### 💼 Other

- Remove non-canonical req param 'lang'
- Remove unused dependency
- Increment version on patch
- Increment version on patch

### ⚙️ Miscellaneous Tasks

- Update README.md
## [4.1.0-beta.1] - 2023-08-31

### 🚀 Features

- Migrate to ts + tailwind and reuse LMSEventManagement's patterns

### 🐛 Bug Fixes

- Make email input field more specific
- Snapshot lit-elements in modal base
- Display patron search value on roomid changes
- List mutating input first for ease of use
- Handle full datetime strings passed as property
- Swap map for repeat in table base
- Prevent desctructuring of undefined property
- Change url path in menu to room reservations
- Update german translations

### 💼 Other

- Increment minor version

### ⚙️ Miscellaneous Tasks

- Build new package
- Update README.md
- Update README.md
- Update submodule commit id, build new package
## [4.0.0-beta.1] - 2023-02-14
