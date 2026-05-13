# OPAC Theming — `<lms-room-reservations-view>`

The public-facing room reservations view exposes a CSS `::part` API plus a small set of opt-in CSS custom properties so site CSS (e.g. `opac.css` or a Koha system preference like `OPACUserCSS`) can restyle and reorder the UI without modifying the plugin source.

## Exposed parts

| Part | Element | Purpose |
|------|---------|---------|
| `root` | `<div>` (shadow-root wrapper) | Flex column container holding the two top-level rows. Reorder its children here. |
| `reservation` | `<div>` | Row containing the bookie + calendar. |
| `bookie` | `<lms-bookie>` | The booking form. Only the host element is reachable; its internals are encapsulated. |
| `calendar` | `<lms-calendar>` or `<div>` placeholder | The kalendus calendar. Before data loads, the same part name is on a placeholder `<div>` so layout rules apply consistently. |
| `rooms` | `<div>` | Horizontal strip containing the room cards. |
| `room-card` | `<div>` | Wrapper for an individual room card. |
| `room-card-figure` | `<figure>` | Card image wrapper. |
| `room-card-image` | `<img>` | Card image. |
| `room-card-body` | `<div>` | Card body. |
| `room-card-title` | `<h2>` | Card title (room number + color badge). |
| `room-card-color-badge` | `<span>` | Inline badge colored to match the room. |
| `room-card-description` | `<p>` | Free-text room description. |
| `room-card-properties` | `<div>` | Wrapper around the property rows. |
| `room-card-property` | `<div>` (×3) | One property row (branch / max bookable time / max capacity). |
| `room-card-actions` | `<div>` | Actions footer. |
| `room-card-book-button` | `<button>` | The "Book this room" button. |

## Reordering the layout

`::part(root)` is `display: flex; flex-direction: column;`, so its children (`reservation` and `rooms`) are flex items and accept `order`.

```css
/* Move the room cards above the booking row */
lms-room-reservations-view::part(rooms) { order: -1; }
lms-room-reservations-view::part(reservation) { order: 1; }
```

The reservation row is itself a flex container (column on mobile, row from `lg:` up), so the bookie and calendar can be swapped:

```css
lms-room-reservations-view::part(bookie) { order: 2; }
lms-room-reservations-view::part(calendar) { order: 1; }
```

The rooms strip is a flex row, so individual cards can be reordered too (though there is no stable identifier per card — order applies positionally).

## Restyling parts

Standard rules apply once a part is selected — including pseudo-classes:

```css
lms-room-reservations-view::part(room-card) {
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

lms-room-reservations-view::part(room-card-book-button):hover {
    background: rebeccapurple;
    color: white;
}
```

### `::part()` caveats

1. **You cannot descend into a part.** `::part(room-card) img` does **not** work. Only elements that themselves carry a `part` attribute are reachable from outside — that is why the image, button, title, etc. each have their own part name.
2. **No transparent traversal through nested shadow roots.** `::part(bookie)` styles the `<lms-bookie>` host (size, margin, order) but cannot reach anything inside its own shadow root. To expose those internals the child component would need its own `part` attributes plus an `exportparts` declaration on the `<lms-bookie>` tag in `RoomReservationsView`. Not currently wired up.
3. **Pseudo-classes chain after the part**, not before: `::part(name):hover`, not `:hover::part(name)`.

## Single-room layout

When the configured rooms list contains exactly one entry, the host element reflects a `single-room` boolean attribute. This is the supported hook for restyling the lone card across the layout — pure `::part(room-card):only-child` can re-flex the card itself, but cannot reach the figure or body conditionally because `::part()` does not combine with descendant combinators.

The attribute is set in `updated()` once the rooms fetch resolves, so the rule does not flash on during the loading skeleton.

### Recipe: image-left / body-right at wide viewports

The card defaults to DaisyUI's column stacking. Let the card grow to fill the strip at every viewport, then *only* at wide viewports flip it into row layout and rotate the figure's rounded corners onto the leading edge.

```css
/* Base: let the lone card fill the rooms strip at any viewport.
   At narrow widths DaisyUI's column stacking is fine — figure spans
   the card cross-axis and the body sits beneath it. */
lms-room-reservations-view[single-room]::part(room-card) {
    width: 100%;
    max-width: none;
}

/* Wide viewports: image on the left, body on the right. */
@media (min-width: 1024px) {
    lms-room-reservations-view[single-room]::part(room-card) {
        flex-direction: row;
    }
    lms-room-reservations-view[single-room]::part(room-card-figure) {
        width: 40%;
        flex-shrink: 0;
        /* DaisyUI rounds the figure's top corners for column stacking;
           rotate the rounded pair to the leading edge for row stacking. */
        border-start-start-radius: inherit;
        border-start-end-radius: 0;
        border-end-start-radius: inherit;
        border-end-end-radius: 0;
    }
    lms-room-reservations-view[single-room]::part(room-card-image) {
        height: 100%;
        object-fit: cover;
    }
    lms-room-reservations-view[single-room]::part(room-card-body) {
        flex: 1;
    }
}
```

Everything that would visibly break the column layout (`flex-direction: row`, the figure's `width: 40%`, the corner rotation, the image `height: 100%`) is inside the media query. If you see the figure shrink to a thumbnail on mobile, the `@media (min-width: 1024px)` wrapper is missing or mistyped — those rules must not reach narrow viewports.

### Specificity notes

`::part(x)` alone is a pseudo-element at **(0,0,1)** — it loses to DaisyUI's `.card` **(0,1,0)** and `.card figure` / `.card :where(figure:first-child)` **(0,1,1)**. Including the host type selector *and* the `[single-room]` attribute brings the rule to **(0,1,2)**, which wins cleanly. Dropping either drops you back into tie-or-lose territory.

`inherit` on the figure radii walks up to `.card` and resolves to `var(--rounded-box, 1rem)`, so the figure stays in sync if the host theme overrides the box radius. Logical properties keep the layout correct in RTL contexts — the rounded pair follows the leading edge.

## Skeleton / space-reservation hooks

The bookie hydrates immediately while the calendar and room cards wait on data fetches. With the **default layout** this is invisible — the rooms section is below the fold and the calendar placeholder collapses harmlessly above it. When the layout is **reordered** (typically to put rooms above the reservation row) the empty placeholders cause a noticeable layout shift the moment data lands.

The component ships opt-in CSS hooks for this case. They are no-ops until at least one of the relevant custom properties is set from outside:

| Property | Default | Effect |
|---|---|---|
| `--lmsrr-calendar-min-height` | `0` | Min-height on the calendar placeholder (the `<div>` used before `<lms-calendar>` upgrades). Applies only to the placeholder, not the real calendar. |
| `--lmsrr-rooms-min-height` | `0` | Min-height on the rooms strip **only while it contains no card children** (uses `:has(> *)`). Disappears the moment cards mount. |
| `--lmsrr-skeleton-bg` | `transparent` | Background applied to both placeholders. |
| `--lmsrr-skeleton-radius` | `0` | Border-radius applied to both placeholders. |
| `--lmsrr-skeleton-animation` | `none` | Animation shorthand applied to both placeholders. The plugin defines `@keyframes lmsrr-skeleton-pulse` (a 1.5s opacity pulse) as a ready-made option. |

### Example: reordered layout with skeletons

```css
lms-room-reservations-view {
    /* reservations */
    --lmsrr-calendar-min-height: 90vh;
    --lmsrr-rooms-min-height: 22rem;

    /* visual */
    --lmsrr-skeleton-bg: oklch(95% 0 0);
    --lmsrr-skeleton-radius: 0.5rem;
    --lmsrr-skeleton-animation: lmsrr-skeleton-pulse 1.5s ease-in-out infinite;
}

@media (min-width: 1024px) {
    lms-room-reservations-view {
        --lmsrr-calendar-min-height: 700px;
    }
}

/* the actual reorder */
lms-room-reservations-view::part(rooms) { order: -1; }
lms-room-reservations-view::part(reservation) { order: 1; }
```

### Why the rules disappear at the right time

- **Calendar:** the selector is `div[part="calendar"]`. The placeholder is a `<div>`; once the real `<lms-calendar>` element is in the tree the tag selector no longer matches, so the min-height/background/animation evaporate. The real calendar keeps its own `height: 90vh` / `700px` rule.
- **Rooms:** the selector is `[part="rooms"]:not(:has(> *))`. While the array is empty, the strip has no element children and the rule applies; the moment Lit renders the first `room-card` the `:has(> *)` clause flips and the rule stops matching. `:has()` is supported in all evergreen browsers (Chrome 105+, Safari 15.4+, Firefox 121+).

## Browser support

- `::part()` — all evergreen browsers.
- `:has()` — Chrome 105+, Safari 15.4+, Firefox 121+. The skeleton hooks degrade gracefully on older browsers: the rooms `min-height` simply applies a touch later (after Lit renders cards there is no effect either way).
- CSS custom properties — universal.
