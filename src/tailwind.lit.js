import { css } from "lit";
    export const tailwindStyles = css`/*
! tailwindcss v3.3.3 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured sans font-family by default.
5. Use the user's configured sans font-feature-settings by default.
6. Use the user's configured sans font-variation-settings by default.
*/

html {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from html so users can set them as a class directly on the html element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured mono font family by default.
2. Correct the odd em font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-size: 1em;
  /* 2 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent sub and sup elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional :invalid styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to inherit in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements display: block by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add vertical-align: middle to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden] {
  display: none;
}

:host,
[data-theme] {
  background-color: hsl(var(--b1) / var(--tw-bg-opacity, 1));
  color: hsl(var(--bc) / var(--tw-text-opacity, 1));
}

html {
  -webkit-tap-highlight-color: transparent;
}

:host {
  color-scheme: light;
  --pf: 141 50% 53%;
  --sf: 219 96% 53%;
  --af: 10 81% 49%;
  --nf: 219 20% 18%;
  --b2: 0 0% 93%;
  --b3: 0 0% 86%;
  --in: 198 93% 60%;
  --su: 158 64% 52%;
  --wa: 43 96% 56%;
  --er: 0 91% 71%;
  --inc: 198 100% 12%;
  --suc: 158 100% 10%;
  --wac: 43 100% 11%;
  --erc: 0 100% 14%;
  --rounded-box: 1rem;
  --rounded-btn: 0.5rem;
  --rounded-badge: 1.9rem;
  --btn-text-case: uppercase;
  --border-btn: 1px;
  --tab-border: 1px;
  --tab-radius: 0.5rem;
  --p: 141 50% 60%;
  --pc: 151 28% 19%;
  --s: 219 96% 60%;
  --sc: 210 20% 98%;
  --a: 10 81% 56%;
  --ac: 210 20% 98%;
  --n: 219 20% 25%;
  --nc: 210 20% 98%;
  --b1: 0 0% 100%;
  --bc: 219 20% 25%;
  --animation-btn: 0;
  --animation-input: 0;
  --btn-focus-scale: 1;
}

*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
}

.container {
  width: 100%;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}

.alert {
  display: grid;
  width: 100%;
  grid-auto-flow: row;
  align-content: flex-start;
  align-items: center;
  justify-items: center;
  gap: 1rem;
  text-align: center;
  border-width: 1px;
  --tw-border-opacity: 1;
  border-color: hsl(var(--b2) / var(--tw-border-opacity));
  padding: 1rem;
  --tw-text-opacity: 1;
  color: hsl(var(--bc) / var(--tw-text-opacity));
  border-radius: var(--rounded-box, 1rem);
  --alert-bg: hsl(var(--b2));
  --alert-bg-mix: hsl(var(--b1));
  background-color: var(--alert-bg);
}

@media (min-width: 640px) {
  .alert {
    grid-auto-flow: column;
    grid-template-columns: auto minmax(auto,1fr);
    justify-items: start;
    text-align: left;
  }
}

.avatar.placeholder > div {
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
  transition-duration: 200ms;
  height: 1.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  width: -moz-fit-content;
  width: fit-content;
  padding-left: 0.563rem;
  padding-right: 0.563rem;
  border-width: 1px;
  --tw-border-opacity: 1;
  border-color: hsl(var(--b2) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--bc) / var(--tw-text-opacity));
  border-radius: var(--rounded-badge, 1.9rem);
}

@media (hover:hover) {
  .label a:hover {
    --tw-text-opacity: 1;
    color: hsl(var(--bc) / var(--tw-text-opacity));
  }

  .link-primary:hover {
    --tw-text-opacity: 1;
    color: hsl(var(--pf) / var(--tw-text-opacity));
  }

  .menu li > *:not(ul):not(.menu-title):not(details):active,
.menu li > *:not(ul):not(.menu-title):not(details).active,
.menu li > details > summary:active {
    --tw-bg-opacity: 1;
    background-color: hsl(var(--n) / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: hsl(var(--nc) / var(--tw-text-opacity));
  }

  .table tr.hover:hover,
  .table tr.hover:nth-child(even):hover {
    --tw-bg-opacity: 1;
    background-color: hsl(var(--b2) / var(--tw-bg-opacity));
  }

  .table-zebra tr.hover:hover,
  .table-zebra tr.hover:nth-child(even):hover {
    --tw-bg-opacity: 1;
    background-color: hsl(var(--b3) / var(--tw-bg-opacity));
  }
}

.btn {
  display: inline-flex;
  flex-shrink: 0;
  cursor: pointer;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  border-color: transparent;
  border-color: hsl(var(--b2) / var(--tw-border-opacity));
  text-align: center;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
  transition-duration: 200ms;
  border-radius: var(--rounded-btn, 0.5rem);
  height: 3rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  line-height: 1em;
  min-height: 3rem;
  gap: 0.5rem;
  font-weight: 600;
  text-decoration-line: none;
  border-width: var(--border-btn, 1px);
  animation: button-pop var(--animation-btn, 0.25s) ease-out;
  text-transform: var(--btn-text-case, uppercase);
  --tw-border-opacity: 1;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--bc) / var(--tw-text-opacity));
  outline-color: hsl(var(--bc) / 1);
}

.btn-disabled,
  .btn[disabled],
  .btn:disabled {
  pointer-events: none;
}

.btn-square {
  height: 3rem;
  width: 3rem;
  padding: 0px;
}

.btn-circle {
  height: 3rem;
  width: 3rem;
  border-radius: 9999px;
  padding: 0px;
}

.btn-group > input[type="radio"].btn {
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
}

.btn-group > input[type="radio"].btn:before {
  content: attr(data-title);
}

.btn:is(input[type="checkbox"]),
.btn:is(input[type="radio"]) {
  width: auto;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
}

.btn:is(input[type="checkbox"]):after,
.btn:is(input[type="radio"]):after {
  --tw-content: attr(aria-label);
  content: var(--tw-content);
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--rounded-box, 1rem);
}

.card:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.card-body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  padding: var(--padding-card, 2rem);
  gap: 0.5rem;
}

.card-body :where(p) {
  flex-grow: 1;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.5rem;
}

.card figure {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card.image-full {
  display: grid;
}

.card.image-full:before {
  position: relative;
  content: "";
  z-index: 10;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--n) / var(--tw-bg-opacity));
  opacity: 0.75;
  border-radius: var(--rounded-box, 1rem);
}

.card.image-full:before,
    .card.image-full > * {
  grid-column-start: 1;
  grid-row-start: 1;
}

.card.image-full > figure img {
  height: 100%;
  -o-object-fit: cover;
     object-fit: cover;
}

.card.image-full > .card-body {
  position: relative;
  z-index: 20;
  --tw-text-opacity: 1;
  color: hsl(var(--nc) / var(--tw-text-opacity));
}

.checkbox {
  flex-shrink: 0;
  --chkbg: var(--bc);
  --chkfg: var(--b1);
  height: 1.5rem;
  width: 1.5rem;
  cursor: pointer;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  border-width: 1px;
  border-color: hsl(var(--bc) / var(--tw-border-opacity));
  --tw-border-opacity: 0.2;
  border-radius: var(--rounded-btn, 0.5rem);
}

.collapse:not(td):not(tr):not(colgroup) {
  visibility: visible;
}

.collapse {
  position: relative;
  display: grid;
  overflow: hidden;
  grid-template-rows: auto 0fr;
  transition: grid-template-rows 0.2s;
  width: 100%;
  border-radius: var(--rounded-box, 1rem);
}

.collapse-title,
.collapse > input[type="checkbox"],
.collapse > input[type="radio"],
.collapse-content {
  grid-column-start: 1;
  grid-row-start: 1;
}

.collapse > input[type="checkbox"],
.collapse > input[type="radio"] {
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  opacity: 0;
}

.collapse[open],
.collapse-open,
.collapse:focus:not(.collapse-close) {
  grid-template-rows: auto 1fr;
}

.collapse:not(.collapse-close):has(> input[type="checkbox"]:checked),
.collapse:not(.collapse-close):has(> input[type="radio"]:checked) {
  grid-template-rows: auto 1fr;
}

.collapse[open] .collapse-content,
.collapse-open .collapse-content,
.collapse:focus:not(.collapse-close) .collapse-content,
.collapse:not(.collapse-close) input[type="checkbox"]:checked ~ .collapse-content,
.collapse:not(.collapse-close) input[type="radio"]:checked ~ .collapse-content {
  visibility: visible;
  min-height: -moz-fit-content;
  min-height: fit-content;
}

.divider {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: stretch;
  margin-top: 1rem;
  margin-bottom: 1rem;
  height: 1rem;
  white-space: nowrap;
}

.divider:before,
  .divider:after {
  content: "";
  flex-grow: 1;
  height: 0.125rem;
  width: 100%;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown > *:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.dropdown .dropdown-content {
  position: absolute;
}

.dropdown:is(:not(details)) .dropdown-content {
  visibility: hidden;
  opacity: 0;
  transform-origin: top;
  --tw-scale-x: .95;
  --tw-scale-y: .95;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
  transition-duration: 200ms;
}

.dropdown-end .dropdown-content {
  right: 0px;
}

.dropdown-left .dropdown-content {
  top: 0px;
  right: 100%;
  bottom: auto;
  transform-origin: right;
}

.dropdown-right .dropdown-content {
  left: 100%;
  top: 0px;
  bottom: auto;
  transform-origin: left;
}

.dropdown-bottom .dropdown-content {
  bottom: auto;
  top: 100%;
  transform-origin: top;
}

.dropdown-top .dropdown-content {
  bottom: 100%;
  top: auto;
  transform-origin: bottom;
}

.dropdown-end.dropdown-right .dropdown-content {
  bottom: 0px;
  top: auto;
}

.dropdown-end.dropdown-left .dropdown-content {
  bottom: 0px;
  top: auto;
}

.dropdown.dropdown-open .dropdown-content,
.dropdown:not(.dropdown-hover):focus .dropdown-content,
.dropdown:focus-within .dropdown-content {
  visibility: visible;
  opacity: 1;
}

@media (hover: hover) {
  .dropdown.dropdown-hover:hover .dropdown-content {
    visibility: visible;
    opacity: 1;
  }

  .btm-nav > *.disabled:hover,
      .btm-nav > *[disabled]:hover {
    pointer-events: none;
    --tw-border-opacity: 0;
    background-color: hsl(var(--n) / var(--tw-bg-opacity));
    --tw-bg-opacity: 0.1;
    color: hsl(var(--bc) / var(--tw-text-opacity));
    --tw-text-opacity: 0.2;
  }

  .btn:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--b3) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--b3) / var(--tw-bg-opacity));
  }

  .btn-primary:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--pf) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--pf) / var(--tw-bg-opacity));
  }

  .btn-secondary:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--sf) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--sf) / var(--tw-bg-opacity));
  }

  .btn-accent:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--af) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--af) / var(--tw-bg-opacity));
  }

  .btn.glass:hover {
    --glass-opacity: 25%;
    --glass-border-opacity: 15%;
  }

  .btn-ghost:hover {
    --tw-border-opacity: 0;
    background-color: hsl(var(--bc) / var(--tw-bg-opacity));
    --tw-bg-opacity: 0.2;
  }

  .btn-outline:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--bc) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--bc) / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: hsl(var(--b1) / var(--tw-text-opacity));
  }

  .btn-outline.btn-primary:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--pf) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--pf) / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: hsl(var(--pc) / var(--tw-text-opacity));
  }

  .btn-outline.btn-secondary:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--sf) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--sf) / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: hsl(var(--sc) / var(--tw-text-opacity));
  }

  .btn-outline.btn-accent:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--af) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--af) / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: hsl(var(--ac) / var(--tw-text-opacity));
  }

  .btn-outline.btn-success:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--su) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--su) / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: hsl(var(--suc) / var(--tw-text-opacity));
  }

  .btn-outline.btn-info:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--in) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--in) / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: hsl(var(--inc) / var(--tw-text-opacity));
  }

  .btn-outline.btn-warning:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--wa) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--wa) / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: hsl(var(--wac) / var(--tw-text-opacity));
  }

  .btn-outline.btn-error:hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--er) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--er) / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: hsl(var(--erc) / var(--tw-text-opacity));
  }

  .btn-disabled:hover,
    .btn[disabled]:hover,
    .btn:disabled:hover {
    --tw-border-opacity: 0;
    background-color: hsl(var(--n) / var(--tw-bg-opacity));
    --tw-bg-opacity: 0.2;
    color: hsl(var(--bc) / var(--tw-text-opacity));
    --tw-text-opacity: 0.2;
  }

  .btn:is(input[type="checkbox"]:checked):hover, .btn:is(input[type="radio"]:checked):hover {
    --tw-border-opacity: 1;
    border-color: hsl(var(--pf) / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: hsl(var(--pf) / var(--tw-bg-opacity));
  }

  .dropdown.dropdown-hover:hover .dropdown-content {
    --tw-scale-x: 1;
    --tw-scale-y: 1;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  :where(.menu li:not(.menu-title):not(.disabled) > *:not(ul):not(details):not(.menu-title)):not(.active):hover, :where(.menu li:not(.menu-title):not(.disabled) > details > summary:not(.menu-title)):not(.active):hover {
    cursor: pointer;
    background-color: hsl(var(--bc) / 0.1);
    --tw-text-opacity: 1;
    color: hsl(var(--bc) / var(--tw-text-opacity));
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
}

.dropdown:is(details) summary::-webkit-details-marker {
  display: none;
}

.footer {
  display: grid;
  width: 100%;
  grid-auto-flow: row;
  place-items: start;
  row-gap: 2.5rem;
  -moz-column-gap: 1rem;
       column-gap: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.footer > * {
  display: grid;
  place-items: start;
  gap: 0.5rem;
}

@media (min-width: 48rem) {
  .footer {
    grid-auto-flow: column;
  }

  .footer-center {
    grid-auto-flow: row dense;
  }
}

.form-control {
  display: flex;
  flex-direction: column;
}

.label {
  display: flex;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
  align-items: center;
  justify-content: space-between;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.\\!input {
  flex-shrink: 1 !important;
  height: 3rem !important;
  padding-left: 1rem !important;
  padding-right: 1rem !important;
  font-size: 1rem !important;
  line-height: 2 !important;
  line-height: 1.5rem !important;
  border-width: 1px !important;
  border-color: hsl(var(--bc) / var(--tw-border-opacity)) !important;
  --tw-border-opacity: 0 !important;
  --tw-bg-opacity: 1 !important;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity)) !important;
  border-radius: var(--rounded-btn, 0.5rem) !important;
}

.input {
  flex-shrink: 1;
  height: 3rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 1rem;
  line-height: 2;
  line-height: 1.5rem;
  border-width: 1px;
  border-color: hsl(var(--bc) / var(--tw-border-opacity));
  --tw-border-opacity: 0;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
  border-radius: var(--rounded-btn, 0.5rem);
}

.input-group > .\\!input {
  isolation: isolate !important;
}

.input-group > .input {
  isolation: isolate;
}


  .input-group > .\\!input {
  border-radius: 0px !important;
}

.input-group > *,
  .input-group > .input,
  .input-group > .textarea,
  .input-group > .select {
  border-radius: 0px;
}

.join {
  display: inline-flex;
  align-items: stretch;
  border-radius: var(--rounded-btn, 0.5rem);
}

.join :where(.join-item) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
}

.join .join-item:not(:first-child):not(:last-child),
  .join *:not(:first-child):not(:last-child) .join-item {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
}

.join .join-item:first-child:not(:last-child),
  .join *:first-child:not(:last-child) .join-item {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.join :where(.join-item:first-child:not(:last-child)),
  .join :where(*:first-child:not(:last-child) .join-item) {
  border-bottom-left-radius: inherit;
  border-top-left-radius: inherit;
}

.join .join-item:last-child:not(:first-child),
  .join *:last-child:not(:first-child) .join-item {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
}

.join :where(.join-item:last-child:not(:first-child)),
  .join :where(*:last-child:not(:first-child) .join-item) {
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
}

:where(.join *) {
  border-radius: inherit;
}

.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: hsl(var(--bc) / var(--tw-border-opacity));
  --tw-border-opacity: 0.2;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity));
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: var(--rounded-btn, 0.5rem);
  border-bottom-width: 2px;
  min-height: 2.2em;
  min-width: 2.2em;
}

.link {
  cursor: pointer;
  text-decoration-line: underline;
}

.menu {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding: 0.5rem;
}

.menu :where(li ul) {
  position: relative;
  white-space: nowrap;
  margin-left: 1rem;
  padding-left: 0.5rem;
}

.menu :where(li:not(.menu-title) > *:not(ul):not(details):not(.menu-title)),
  .menu :where(li:not(.menu-title) > details > summary:not(.menu-title)) {
  display: grid;
  grid-auto-flow: column;
  align-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  grid-auto-columns: minmax(auto, max-content) auto max-content;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}

.menu li.disabled {
  cursor: not-allowed;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
  color: hsl(var(--bc) / 0.3);
}

.menu :where(li > .menu-dropdown:not(.menu-dropdown-show)) {
  display: none;
}

:where(.menu li) {
  position: relative;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: stretch;
}

:where(.menu li) .badge {
  justify-self: end;
}

.modal {
  pointer-events: none;
  position: fixed;
  inset: 0px;
  margin: 0px;
  display: grid;
  height: 100%;
  max-height: none;
  width: 100%;
  max-width: none;
  justify-items: center;
  padding: 0px;
  opacity: 0;
  overscroll-behavior: contain;
  z-index: 999;
  background-color: transparent;
  color: inherit;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
  transition-property: transform, opacity, visibility;
  overflow-y: hidden;
}

:where(.modal) {
  align-items: center;
}

.modal-box {
  max-height: calc(100vh - 5em);
  grid-column-start: 1;
  grid-row-start: 1;
  width: 91.666667%;
  max-width: 32rem;
  --tw-scale-x: .9;
  --tw-scale-y: .9;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
  padding: 1.5rem;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
  transition-duration: 200ms;
  border-top-left-radius: var(--rounded-box, 1rem);
  border-top-right-radius: var(--rounded-box, 1rem);
  border-bottom-left-radius: var(--rounded-box, 1rem);
  border-bottom-right-radius: var(--rounded-box, 1rem);
  box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.modal-open,
.modal:target,
.modal-toggle:checked + .modal,
.modal[open] {
  pointer-events: auto;
  visibility: visible;
  opacity: 1;
}

.modal-action {
  display: flex;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

:host:has(:is(.modal-open, .modal:target, .modal-toggle:checked + .modal, .modal[open])) {
  overflow: hidden;
}

.navbar {
  display: flex;
  align-items: center;
  padding: var(--navbar-padding, 0.5rem);
  min-height: 4rem;
  width: 100%;
}

:where(.navbar > *) {
  display: inline-flex;
  align-items: center;
}

.navbar-start {
  width: 50%;
  justify-content: flex-start;
}

.navbar-center {
  flex-shrink: 0;
}

.navbar-end {
  width: 50%;
  justify-content: flex-end;
}

.select {
  display: inline-flex;
  cursor: pointer;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  height: 3rem;
  padding-left: 1rem;
  padding-right: 2.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  line-height: 2;
  min-height: 3rem;
  border-width: 1px;
  border-color: hsl(var(--bc) / var(--tw-border-opacity));
  --tw-border-opacity: 0;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
  font-weight: 600;
  border-radius: var(--rounded-btn, 0.5rem);
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position: calc(100% - 20px) calc(1px + 50%), calc(100% - 16px) calc(1px + 50%);
  background-size: 4px 4px, 4px 4px;
  background-repeat: no-repeat;
}

.select[multiple] {
  height: auto;
}

.steps .step {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  grid-template-columns: auto;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  grid-template-rows: 40px 1fr;
  place-items: center;
  text-align: center;
  min-width: 4rem;
}

.table {
  position: relative;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.25rem;
  border-radius: var(--rounded-box, 1rem);
}

.table :where(.table-pin-rows thead tr) {
  position: sticky;
  top: 0px;
  z-index: 1;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
}

.table :where(.table-pin-rows tfoot tr) {
  position: sticky;
  bottom: 0px;
  z-index: 1;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
}

.table :where(.table-pin-cols tr th) {
  position: sticky;
  left: 0px;
  right: 0px;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
}

.table-zebra tbody tr:nth-child(even) :where(.table-pin-cols tr th) {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity));
}

.textarea {
  flex-shrink: 1;
  min-height: 3rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  line-height: 2;
  border-width: 1px;
  border-color: hsl(var(--bc) / var(--tw-border-opacity));
  --tw-border-opacity: 0;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
  border-radius: var(--rounded-btn, 0.5rem);
}

.toast {
  position: fixed;
  display: flex;
  min-width: -moz-fit-content;
  min-width: fit-content;
  flex-direction: column;
  white-space: nowrap;
  gap: 0.5rem;
  padding: 1rem;
}

.toggle {
  flex-shrink: 0;
  --tglbg: hsl(var(--b1));
  --handleoffset: 1.5rem;
  --handleoffsetcalculator: calc(var(--handleoffset) * -1);
  --togglehandleborder: 0 0;
  height: 1.5rem;
  width: 3rem;
  cursor: pointer;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  border-width: 1px;
  border-color: hsl(var(--bc) / var(--tw-border-opacity));
  --tw-border-opacity: 0.2;
  background-color: hsl(var(--bc) / var(--tw-bg-opacity));
  --tw-bg-opacity: 0.5;
  border-radius: var(--rounded-badge, 1.9rem);
  transition: background, box-shadow var(--animation-input, 0.2s) ease-out;
  box-shadow: var(--handleoffsetcalculator) 0 0 2px var(--tglbg) inset, 0 0 0 2px var(--tglbg) inset,
    var(--togglehandleborder);
}

.alert-info {
  border-color: hsl(var(--in) / 0.2);
  --tw-text-opacity: 1;
  color: hsl(var(--inc) / var(--tw-text-opacity));
  --alert-bg: hsl(var(--in));
  --alert-bg-mix: hsl(var(--b1));
}

.alert-success {
  border-color: hsl(var(--su) / 0.2);
  --tw-text-opacity: 1;
  color: hsl(var(--suc) / var(--tw-text-opacity));
  --alert-bg: hsl(var(--su));
  --alert-bg-mix: hsl(var(--b1));
}

.alert-warning {
  border-color: hsl(var(--wa) / 0.2);
  --tw-text-opacity: 1;
  color: hsl(var(--wac) / var(--tw-text-opacity));
  --alert-bg: hsl(var(--wa));
  --alert-bg-mix: hsl(var(--b1));
}

.alert-error {
  border-color: hsl(var(--er) / 0.2);
  --tw-text-opacity: 1;
  color: hsl(var(--erc) / var(--tw-text-opacity));
  --alert-bg: hsl(var(--er));
  --alert-bg-mix: hsl(var(--b1));
}

.badge-neutral {
  --tw-border-opacity: 1;
  border-color: hsl(var(--n) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--n) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--nc) / var(--tw-text-opacity));
}

.badge-outline {
  border-color: currentColor;
  --tw-border-opacity: 0.5;
  background-color: transparent;
  color: currentColor;
}

.badge-outline.badge-neutral {
  --tw-text-opacity: 1;
  color: hsl(var(--n) / var(--tw-text-opacity));
}

.badge-outline.badge-primary {
  --tw-text-opacity: 1;
  color: hsl(var(--p) / var(--tw-text-opacity));
}

.badge-outline.badge-secondary {
  --tw-text-opacity: 1;
  color: hsl(var(--s) / var(--tw-text-opacity));
}

.badge-outline.badge-accent {
  --tw-text-opacity: 1;
  color: hsl(var(--a) / var(--tw-text-opacity));
}

.badge-outline.badge-info {
  --tw-text-opacity: 1;
  color: hsl(var(--in) / var(--tw-text-opacity));
}

.badge-outline.badge-success {
  --tw-text-opacity: 1;
  color: hsl(var(--su) / var(--tw-text-opacity));
}

.badge-outline.badge-warning {
  --tw-text-opacity: 1;
  color: hsl(var(--wa) / var(--tw-text-opacity));
}

.badge-outline.badge-error {
  --tw-text-opacity: 1;
  color: hsl(var(--er) / var(--tw-text-opacity));
}

.btm-nav > *:where(.active) {
  border-top-width: 2px;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
}

.btm-nav > *.disabled,
    .btm-nav > *[disabled] {
  pointer-events: none;
  --tw-border-opacity: 0;
  background-color: hsl(var(--n) / var(--tw-bg-opacity));
  --tw-bg-opacity: 0.1;
  color: hsl(var(--bc) / var(--tw-text-opacity));
  --tw-text-opacity: 0.2;
}

.btm-nav > * .label {
  font-size: 1rem;
  line-height: 1.5rem;
}

.btn:active:hover,
  .btn:active:focus {
  animation: button-pop 0s ease-out;
  transform: scale(var(--btn-focus-scale, 0.97));
}

.btn:focus-visible {
  outline-style: solid;
  outline-width: 2px;
  outline-offset: 2px;
}

.btn-primary {
  --tw-border-opacity: 1;
  border-color: hsl(var(--p) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--p) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--pc) / var(--tw-text-opacity));
  outline-color: hsl(var(--p) / 1);
}

.btn-primary.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--pf) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--pf) / var(--tw-bg-opacity));
}

.btn-secondary {
  --tw-border-opacity: 1;
  border-color: hsl(var(--s) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--s) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--sc) / var(--tw-text-opacity));
  outline-color: hsl(var(--s) / 1);
}

.btn-secondary.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--sf) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--sf) / var(--tw-bg-opacity));
}

.btn-accent {
  --tw-border-opacity: 1;
  border-color: hsl(var(--a) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--a) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--ac) / var(--tw-text-opacity));
  outline-color: hsl(var(--a) / 1);
}

.btn-accent.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--af) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--af) / var(--tw-bg-opacity));
}

.btn.glass {
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  outline-color: currentColor;
}

.btn.glass.btn-active {
  --glass-opacity: 25%;
  --glass-border-opacity: 15%;
}

.btn-ghost {
  border-width: 1px;
  border-color: transparent;
  background-color: transparent;
  color: currentColor;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  outline-color: currentColor;
}

.btn-ghost.btn-active {
  --tw-border-opacity: 0;
  background-color: hsl(var(--bc) / var(--tw-bg-opacity));
  --tw-bg-opacity: 0.2;
}

.btn-outline {
  border-color: currentColor;
  background-color: transparent;
  --tw-text-opacity: 1;
  color: hsl(var(--bc) / var(--tw-text-opacity));
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.btn-outline.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--bc) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--bc) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--b1) / var(--tw-text-opacity));
}

.btn-outline.btn-primary {
  --tw-text-opacity: 1;
  color: hsl(var(--p) / var(--tw-text-opacity));
}

.btn-outline.btn-primary.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--pf) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--pf) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--pc) / var(--tw-text-opacity));
}

.btn-outline.btn-secondary {
  --tw-text-opacity: 1;
  color: hsl(var(--s) / var(--tw-text-opacity));
}

.btn-outline.btn-secondary.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--sf) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--sf) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--sc) / var(--tw-text-opacity));
}

.btn-outline.btn-accent {
  --tw-text-opacity: 1;
  color: hsl(var(--a) / var(--tw-text-opacity));
}

.btn-outline.btn-accent.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--af) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--af) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--ac) / var(--tw-text-opacity));
}

.btn-outline.btn-success {
  --tw-text-opacity: 1;
  color: hsl(var(--su) / var(--tw-text-opacity));
}

.btn-outline.btn-success.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--su) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--su) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--suc) / var(--tw-text-opacity));
}

.btn-outline.btn-info {
  --tw-text-opacity: 1;
  color: hsl(var(--in) / var(--tw-text-opacity));
}

.btn-outline.btn-info.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--in) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--in) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--inc) / var(--tw-text-opacity));
}

.btn-outline.btn-warning {
  --tw-text-opacity: 1;
  color: hsl(var(--wa) / var(--tw-text-opacity));
}

.btn-outline.btn-warning.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--wa) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--wa) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--wac) / var(--tw-text-opacity));
}

.btn-outline.btn-error {
  --tw-text-opacity: 1;
  color: hsl(var(--er) / var(--tw-text-opacity));
}

.btn-outline.btn-error.btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--er) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--er) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--erc) / var(--tw-text-opacity));
}

.btn.btn-disabled,
  .btn[disabled],
  .btn:disabled {
  --tw-border-opacity: 0;
  background-color: hsl(var(--n) / var(--tw-bg-opacity));
  --tw-bg-opacity: 0.2;
  color: hsl(var(--bc) / var(--tw-text-opacity));
  --tw-text-opacity: 0.2;
}

.btn-group > input[type="radio"]:checked.btn,
  .btn-group > .btn-active {
  --tw-border-opacity: 1;
  border-color: hsl(var(--p) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--p) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--pc) / var(--tw-text-opacity));
}

.btn-group > input[type="radio"]:checked.btn:focus-visible, .btn-group > .btn-active:focus-visible {
  outline-style: solid;
  outline-width: 2px;
  outline-color: hsl(var(--p) / 1);
}

.btn:is(input[type="checkbox"]:checked),
.btn:is(input[type="radio"]:checked) {
  --tw-border-opacity: 1;
  border-color: hsl(var(--p) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--p) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--pc) / var(--tw-text-opacity));
}

.btn:is(input[type="checkbox"]:checked):focus-visible, .btn:is(input[type="radio"]:checked):focus-visible {
  outline-color: hsl(var(--p) / 1);
}

@keyframes button-pop {
  0% {
    transform: scale(var(--btn-focus-scale, 0.98));
  }

  40% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
}

.card :where(figure:first-child) {
  overflow: hidden;
  border-start-start-radius: inherit;
  border-start-end-radius: inherit;
  border-end-start-radius: unset;
  border-end-end-radius: unset;
}

.card :where(figure:last-child) {
  overflow: hidden;
  border-start-start-radius: unset;
  border-start-end-radius: unset;
  border-end-start-radius: inherit;
  border-end-end-radius: inherit;
}

.card:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.card.bordered {
  border-width: 1px;
  --tw-border-opacity: 1;
  border-color: hsl(var(--b2) / var(--tw-border-opacity));
}

.card.compact .card-body {
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 600;
}

.card.image-full :where(figure) {
  overflow: hidden;
  border-radius: inherit;
}

.checkbox:focus-visible {
  outline-style: solid;
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: hsl(var(--bc) / 1);
}

.checkbox:checked,
  .checkbox[checked="true"],
  .checkbox[aria-checked="true"] {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--bc) / var(--tw-bg-opacity));
  background-repeat: no-repeat;
  animation: checkmark var(--animation-input, 0.2s) ease-out;
  background-image: linear-gradient(-45deg, transparent 65%, hsl(var(--chkbg)) 65.99%),
      linear-gradient(45deg, transparent 75%, hsl(var(--chkbg)) 75.99%),
      linear-gradient(-45deg, hsl(var(--chkbg)) 40%, transparent 40.99%),
      linear-gradient(
        45deg,
        hsl(var(--chkbg)) 30%,
        hsl(var(--chkfg)) 30.99%,
        hsl(var(--chkfg)) 40%,
        transparent 40.99%
      ),
      linear-gradient(-45deg, hsl(var(--chkfg)) 50%, hsl(var(--chkbg)) 50.99%);
}

.checkbox:indeterminate {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--bc) / var(--tw-bg-opacity));
  background-repeat: no-repeat;
  animation: checkmark var(--animation-input, 0.2s) ease-out;
  background-image: linear-gradient(90deg, transparent 80%, hsl(var(--chkbg)) 80%),
      linear-gradient(-90deg, transparent 80%, hsl(var(--chkbg)) 80%),
      linear-gradient(
        0deg,
        hsl(var(--chkbg)) 43%,
        hsl(var(--chkfg)) 43%,
        hsl(var(--chkfg)) 57%,
        hsl(var(--chkbg)) 57%
      );
}

.checkbox:disabled {
  cursor: not-allowed;
  border-color: transparent;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--bc) / var(--tw-bg-opacity));
  opacity: 0.2;
}

@keyframes checkmark {
  0% {
    background-position-y: 5px;
  }

  50% {
    background-position-y: -2px;
  }

  100% {
    background-position-y: 0;
  }
}

[dir="rtl"] .checkbox:checked,
    [dir="rtl"] .checkbox[checked="true"],
    [dir="rtl"] .checkbox[aria-checked="true"] {
  background-image: linear-gradient(45deg, transparent 65%, hsl(var(--chkbg)) 65.99%),
        linear-gradient(-45deg, transparent 75%, hsl(var(--chkbg)) 75.99%),
        linear-gradient(45deg, hsl(var(--chkbg)) 40%, transparent 40.99%),
        linear-gradient(
          -45deg,
          hsl(var(--chkbg)) 30%,
          hsl(var(--chkfg)) 30.99%,
          hsl(var(--chkfg)) 40%,
          transparent 40.99%
        ),
        linear-gradient(45deg, hsl(var(--chkfg)) 50%, hsl(var(--chkbg)) 50.99%);
}

details.collapse {
  width: 100%;
}

details.collapse summary {
  position: relative;
  display: block;
  outline: 2px solid transparent;
  outline-offset: 2px;
}

details.collapse summary::-webkit-details-marker {
  display: none;
}

.collapse:focus-visible {
  outline-style: solid;
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: hsl(var(--bc) / 1);
}

.collapse:has(.collapse-title:focus-visible),
.collapse:has(> input[type="checkbox"]:focus-visible),
.collapse:has(> input[type="radio"]:focus-visible) {
  outline-style: solid;
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: hsl(var(--bc) / 1);
}

.collapse:not(.collapse-open):not(.collapse-close) input[type="checkbox"],
.collapse:not(.collapse-open):not(.collapse-close) input[type="radio"]:not(:checked),
.collapse:not(.collapse-open):not(.collapse-close) .collapse-title {
  cursor: pointer;
}

.collapse:focus:not(.collapse-open):not(.collapse-close):not(.collapse[open]) .collapse-title {
  cursor: unset;
}

:where(.collapse > input[type="checkbox"]),
:where(.collapse > input[type="radio"]) {
  z-index: 1;
}

.collapse-title,
:where(.collapse > input[type="checkbox"]),
:where(.collapse > input[type="radio"]) {
  width: 100%;
  padding: 1rem;
  padding-right: 3rem;
  min-height: 3.75rem;
  transition: background-color 0.2s ease-out;
}

.collapse[open] :where(.collapse-content),
.collapse-open :where(.collapse-content),
.collapse:focus:not(.collapse-close) :where(.collapse-content),
.collapse:not(.collapse-close) :where(input[type="checkbox"]:checked ~ .collapse-content),
.collapse:not(.collapse-close) :where(input[type="radio"]:checked ~ .collapse-content) {
  padding-bottom: 1rem;
  transition: padding 0.2s ease-out, background-color 0.2s ease-out;
}

.collapse[open].collapse-arrow .collapse-title:after,
.collapse-open.collapse-arrow .collapse-title:after,
.collapse-arrow:focus:not(.collapse-close) .collapse-title:after,
.collapse-arrow:not(.collapse-close) input[type="checkbox"]:checked ~ .collapse-title:after,
.collapse-arrow:not(.collapse-close) input[type="radio"]:checked ~ .collapse-title:after {
  --tw-translate-y: -50%;
  --tw-rotate: 225deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

[dir="rtl"] .collapse[open].collapse-arrow .collapse-title:after,
[dir="rtl"] .collapse-open.collapse-arrow .collapse-title:after,
[dir="rtl"] .collapse-arrow:focus:not(.collapse-close) .collapse-title:after,
[dir="rtl"]
  .collapse-arrow:not(.collapse-close)
  input[type="checkbox"]:checked
  ~ .collapse-title:after {
  --tw-rotate: 135deg;
}

.collapse[open].collapse-plus .collapse-title:after,
.collapse-open.collapse-plus .collapse-title:after,
.collapse-plus:focus:not(.collapse-close) .collapse-title:after,
.collapse-plus:not(.collapse-close) input[type="checkbox"]:checked ~ .collapse-title:after,
.collapse-plus:not(.collapse-close) input[type="radio"]:checked ~ .collapse-title:after {
  content: "−";
}

.divider:before {
  background-color: hsl(var(--bc) / var(--tw-bg-opacity));
  --tw-bg-opacity: 0.1;
}

.divider:after {
  background-color: hsl(var(--bc) / var(--tw-bg-opacity));
  --tw-bg-opacity: 0.1;
}

.divider:not(:empty) {
  gap: 1rem;
}

.dropdown.dropdown-open .dropdown-content,
.dropdown:focus .dropdown-content,
.dropdown:focus-within .dropdown-content {
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.label-text {
  font-size: 0.875rem;
  line-height: 1.25rem;
  --tw-text-opacity: 1;
  color: hsl(var(--bc) / var(--tw-text-opacity));
}

.\\!input[list]::-webkit-calendar-picker-indicator {
  line-height: 1em !important;
}

.input[list]::-webkit-calendar-picker-indicator {
  line-height: 1em;
}

.input-bordered {
  --tw-border-opacity: 0.2;
}

.\\!input:focus {
  outline-style: solid !important;
  outline-width: 2px !important;
  outline-offset: 2px !important;
  outline-color: hsl(var(--bc) / 0.2) !important;
}

.input:focus {
  outline-style: solid;
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: hsl(var(--bc) / 0.2);
}


  .\\!input:disabled,
  .\\!input[disabled] {
  cursor: not-allowed !important;
  --tw-border-opacity: 1 !important;
  border-color: hsl(var(--b2) / var(--tw-border-opacity)) !important;
  --tw-bg-opacity: 1 !important;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity)) !important;
  --tw-text-opacity: 0.2 !important;
}

.input-disabled,
  .input:disabled,
  .input[disabled] {
  cursor: not-allowed;
  --tw-border-opacity: 1;
  border-color: hsl(var(--b2) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity));
  --tw-text-opacity: 0.2;
}


  .\\!input:disabled,
  .\\!input[disabled] {
  cursor: not-allowed !important;
  --tw-border-opacity: 1 !important;
  border-color: hsl(var(--b2) / var(--tw-border-opacity)) !important;
  --tw-bg-opacity: 1 !important;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity)) !important;
  --tw-text-opacity: 0.2 !important;
}

.\\!input:disabled::-moz-placeholder, .\\!input[disabled]::-moz-placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity)) !important;
  --tw-placeholder-opacity: 0.2 !important;
}


  .\\!input:disabled::placeholder,
  .\\!input[disabled]::placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity)) !important;
  --tw-placeholder-opacity: 0.2 !important;
}

.input-disabled::-moz-placeholder, .input:disabled::-moz-placeholder, .input[disabled]::-moz-placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity));
  --tw-placeholder-opacity: 0.2;
}

.input-disabled::placeholder,
  .input:disabled::placeholder,
  .input[disabled]::placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity));
  --tw-placeholder-opacity: 0.2;
}

.\\!input:disabled::-moz-placeholder, .\\!input[disabled]::-moz-placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity)) !important;
  --tw-placeholder-opacity: 0.2 !important;
}


  .\\!input:disabled::placeholder,
  .\\!input[disabled]::placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity)) !important;
  --tw-placeholder-opacity: 0.2 !important;
}

.join > :where(*:not(:first-child)) {
  margin-top: 0px;
  margin-bottom: 0px;
  margin-left: -1px;
}

.join-item:focus {
  isolation: isolate;
}

.link-primary {
  --tw-text-opacity: 1;
  color: hsl(var(--p) / var(--tw-text-opacity));
}

.link:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.loading {
  pointer-events: none;
  display: inline-block;
  aspect-ratio: 1 / 1;
  width: 1.5rem;
  background-color: currentColor;
  -webkit-mask-size: 100%;
          mask-size: 100%;
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  -webkit-mask-position: center;
          mask-position: center;
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='24' height='24' stroke='%23000' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E.spinner_V8m1%7Btransform-origin:center;animation:spinner_zKoa 2s linear infinite%7D.spinner_V8m1 circle%7Bstroke-linecap:round;animation:spinner_YpZS 1.5s ease-out infinite%7D%40keyframes spinner_zKoa%7B100%25%7Btransform:rotate(360deg)%7D%7D%40keyframes spinner_YpZS%7B0%25%7Bstroke-dasharray:0 150;stroke-dashoffset:0%7D47.5%25%7Bstroke-dasharray:42 150;stroke-dashoffset:-16%7D95%25%2C100%25%7Bstroke-dasharray:42 150;stroke-dashoffset:-59%7D%7D%3C%2Fstyle%3E%3Cg class='spinner_V8m1'%3E%3Ccircle cx='12' cy='12' r='9.5' fill='none' stroke-width='3'%3E%3C%2Fcircle%3E%3C%2Fg%3E%3C%2Fsvg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg width='24' height='24' stroke='%23000' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E.spinner_V8m1%7Btransform-origin:center;animation:spinner_zKoa 2s linear infinite%7D.spinner_V8m1 circle%7Bstroke-linecap:round;animation:spinner_YpZS 1.5s ease-out infinite%7D%40keyframes spinner_zKoa%7B100%25%7Btransform:rotate(360deg)%7D%7D%40keyframes spinner_YpZS%7B0%25%7Bstroke-dasharray:0 150;stroke-dashoffset:0%7D47.5%25%7Bstroke-dasharray:42 150;stroke-dashoffset:-16%7D95%25%2C100%25%7Bstroke-dasharray:42 150;stroke-dashoffset:-59%7D%7D%3C%2Fstyle%3E%3Cg class='spinner_V8m1'%3E%3Ccircle cx='12' cy='12' r='9.5' fill='none' stroke-width='3'%3E%3C%2Fcircle%3E%3C%2Fg%3E%3C%2Fsvg%3E");
}

:where(.menu li:empty) {
  background-color: hsl(var(--bc) / 0.1);
  margin: 0.5rem 1rem;
  height: 1px;
}

.menu :where(li ul):before {
  position: absolute;
  left: 0px;
  top: 0.75rem;
  bottom: 0.75rem;
  width: 1px;
  background-color: hsl(var(--bc) / 0.1);
  content: "";
}

.menu :where(li:not(.menu-title) > *:not(ul):not(details):not(.menu-title)),
.menu :where(li:not(.menu-title) > details > summary:not(.menu-title)) {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: left;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
  transition-duration: 200ms;
  border-radius: var(--rounded-btn, 0.5rem);
  text-wrap: balance;
}

:where(.menu li:not(.menu-title):not(.disabled) > *:not(ul):not(details):not(.menu-title)):not(summary):not(.active).focus,
  :where(.menu li:not(.menu-title):not(.disabled) > *:not(ul):not(details):not(.menu-title)):not(summary):not(.active):focus,
  :where(.menu li:not(.menu-title):not(.disabled) > *:not(ul):not(details):not(.menu-title)):is(summary):not(.active):focus-visible,
  :where(.menu li:not(.menu-title):not(.disabled) > details > summary:not(.menu-title)):not(summary):not(.active).focus,
  :where(.menu li:not(.menu-title):not(.disabled) > details > summary:not(.menu-title)):not(summary):not(.active):focus,
  :where(.menu li:not(.menu-title):not(.disabled) > details > summary:not(.menu-title)):is(summary):not(.active):focus-visible {
  cursor: pointer;
  background-color: hsl(var(--bc) / 0.1);
  --tw-text-opacity: 1;
  color: hsl(var(--bc) / var(--tw-text-opacity));
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.menu li > *:not(ul):not(.menu-title):not(details):active,
.menu li > *:not(ul):not(.menu-title):not(details).active,
.menu li > details > summary:active {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--n) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--nc) / var(--tw-text-opacity));
}

.menu :where(li > details > summary)::-webkit-details-marker {
  display: none;
}

.menu :where(li > details > summary):after,
.menu :where(li > .menu-dropdown-toggle):after {
  justify-self: end;
  display: block;
  margin-top: -0.5rem;
  height: 0.5rem;
  width: 0.5rem;
  transform: rotate(45deg);
  transition-property: transform, margin-top;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  content: "";
  transform-origin: 75% 75%;
  box-shadow: 2px 2px;
  pointer-events: none;
}

.menu :where(li > details[open] > summary):after,
.menu :where(li > .menu-dropdown-toggle.menu-dropdown-show):after {
  transform: rotate(225deg);
  margin-top: 0;
}

.mockup-phone .display {
  overflow: hidden;
  border-radius: 40px;
  margin-top: -25px;
}

.mockup-browser .mockup-browser-toolbar .\\!input {
  position: relative !important;
  margin-left: auto !important;
  margin-right: auto !important;
  display: block !important;
  height: 1.75rem !important;
  width: 24rem !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  --tw-bg-opacity: 1 !important;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity)) !important;
  padding-left: 2rem !important;
}

.mockup-browser .mockup-browser-toolbar .input {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  display: block;
  height: 1.75rem;
  width: 24rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity));
  padding-left: 2rem;
}

.mockup-browser .mockup-browser-toolbar .\\!input:before {
  content: "" !important;
  position: absolute !important;
  top: 50% !important;
  left: 0.5rem !important;
  aspect-ratio: 1 / 1 !important;
  height: 0.75rem !important;
  --tw-translate-y: -50% !important;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) !important;
  border-radius: 9999px !important;
  border-width: 2px !important;
  border-color: currentColor !important;
  opacity: 0.6 !important;
}

.mockup-browser .mockup-browser-toolbar .input:before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0.5rem;
  aspect-ratio: 1 / 1;
  height: 0.75rem;
  --tw-translate-y: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  border-radius: 9999px;
  border-width: 2px;
  border-color: currentColor;
  opacity: 0.6;
}

.mockup-browser .mockup-browser-toolbar .\\!input:after {
  content: "" !important;
  position: absolute !important;
  top: 50% !important;
  left: 1.25rem !important;
  height: 0.5rem !important;
  --tw-translate-y: 25% !important;
  --tw-rotate: -45deg !important;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) !important;
  border-radius: 9999px !important;
  border-width: 1px !important;
  border-color: currentColor !important;
  opacity: 0.6 !important;
}

.mockup-browser .mockup-browser-toolbar .input:after {
  content: "";
  position: absolute;
  top: 50%;
  left: 1.25rem;
  height: 0.5rem;
  --tw-translate-y: 25%;
  --tw-rotate: -45deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  border-radius: 9999px;
  border-width: 1px;
  border-color: currentColor;
  opacity: 0.6;
}

.modal:not(dialog:not(.modal-open)),
  .modal::backdrop {
  background-color: rgba(0, 0, 0, 0.3);
  animation: modal-pop 0.2s ease-out;
}

.modal-open .modal-box,
.modal-toggle:checked + .modal .modal-box,
.modal:target .modal-box,
.modal[open] .modal-box {
  --tw-translate-y: 0px;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.modal-action > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-right: calc(0.5rem * var(--tw-space-x-reverse));
  margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
}

@keyframes modal-pop {
  0% {
    opacity: 0;
  }
}

@keyframes progress-loading {
  50% {
    background-position-x: -115%;
  }
}

@keyframes radiomark {
  0% {
    box-shadow: 0 0 0 12px hsl(var(--b1)) inset, 0 0 0 12px hsl(var(--b1)) inset;
  }

  50% {
    box-shadow: 0 0 0 3px hsl(var(--b1)) inset, 0 0 0 3px hsl(var(--b1)) inset;
  }

  100% {
    box-shadow: 0 0 0 4px hsl(var(--b1)) inset, 0 0 0 4px hsl(var(--b1)) inset;
  }
}

@keyframes rating-pop {
  0% {
    transform: translateY(-0.125em);
  }

  40% {
    transform: translateY(-0.125em);
  }

  100% {
    transform: translateY(0);
  }
}

.select-bordered {
  --tw-border-opacity: 0.2;
}

.select:focus {
  outline-style: solid;
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: hsl(var(--bc) / 0.2);
}

.select-disabled,
  .select:disabled,
  .select[disabled] {
  cursor: not-allowed;
  --tw-border-opacity: 1;
  border-color: hsl(var(--b2) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity));
  --tw-text-opacity: 0.2;
}

.select-disabled::-moz-placeholder, .select:disabled::-moz-placeholder, .select[disabled]::-moz-placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity));
  --tw-placeholder-opacity: 0.2;
}

.select-disabled::placeholder,
  .select:disabled::placeholder,
  .select[disabled]::placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity));
  --tw-placeholder-opacity: 0.2;
}

.select-multiple,
  .select[multiple],
  .select[size].select:not([size="1"]) {
  background-image: none;
  padding-right: 1rem;
}

[dir="rtl"] .select {
  background-position: calc(0% + 12px) calc(1px + 50%), calc(0% + 16px) calc(1px + 50%);
}

.steps .step:before {
  top: 0px;
  grid-column-start: 1;
  grid-row-start: 1;
  height: 0.5rem;
  width: 100%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b3) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--bc) / var(--tw-text-opacity));
  content: "";
  margin-left: -100%;
}

.steps .step:after {
  content: counter(step);
  counter-increment: step;
  z-index: 1;
  position: relative;
  grid-column-start: 1;
  grid-row-start: 1;
  display: grid;
  height: 2rem;
  width: 2rem;
  place-items: center;
  place-self: center;
  border-radius: 9999px;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b3) / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: hsl(var(--bc) / var(--tw-text-opacity));
}

.steps .step:first-child:before {
  content: none;
}

.steps .step[data-content]:after {
  content: attr(data-content);
}

.table :where(th, td) {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  vertical-align: middle;
}

.table tr.active,
  .table tr.active:nth-child(even),
  .table-zebra tbody tr:nth-child(even) {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity));
}

.table-zebra tr.active,
    .table-zebra tr.active:nth-child(even),
    .table-zebra-zebra tbody tr:nth-child(even) {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b3) / var(--tw-bg-opacity));
}

.table :where(thead, tbody) :where(tr:not(:last-child)),
    .table :where(thead, tbody) :where(tr:first-child:last-child) {
  border-bottom-width: 1px;
  --tw-border-opacity: 1;
  border-bottom-color: hsl(var(--b2) / var(--tw-border-opacity));
}

.table :where(thead, tfoot) {
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 700;
  color: hsl(var(--bc) / 0.6);
}

.textarea:focus {
  outline-style: solid;
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: hsl(var(--bc) / 0.2);
}

.textarea-disabled,
  .textarea:disabled,
  .textarea[disabled] {
  cursor: not-allowed;
  --tw-border-opacity: 1;
  border-color: hsl(var(--b2) / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity));
  --tw-text-opacity: 0.2;
}

.textarea-disabled::-moz-placeholder, .textarea:disabled::-moz-placeholder, .textarea[disabled]::-moz-placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity));
  --tw-placeholder-opacity: 0.2;
}

.textarea-disabled::placeholder,
  .textarea:disabled::placeholder,
  .textarea[disabled]::placeholder {
  color: hsl(var(--bc) / var(--tw-placeholder-opacity));
  --tw-placeholder-opacity: 0.2;
}

.toast > * {
  animation: toast-pop 0.25s ease-out;
}

@keyframes toast-pop {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

[dir="rtl"] .toggle {
  --handleoffsetcalculator: calc(var(--handleoffset) * 1);
}

.toggle:focus-visible {
  outline-style: solid;
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: hsl(var(--bc) / 0.2);
}

.toggle:checked,
  .toggle[checked="true"],
  .toggle[aria-checked="true"] {
  --handleoffsetcalculator: var(--handleoffset);
  --tw-border-opacity: 1;
  --tw-bg-opacity: 1;
}

[dir="rtl"] .toggle:checked, [dir="rtl"] .toggle[checked="true"], [dir="rtl"] .toggle[aria-checked="true"] {
  --handleoffsetcalculator: calc(var(--handleoffset) * -1);
}

.toggle:indeterminate {
  --tw-border-opacity: 1;
  --tw-bg-opacity: 1;
  box-shadow: calc(var(--handleoffset) / 2) 0 0 2px var(--tglbg) inset,
      calc(var(--handleoffset) / -2) 0 0 2px var(--tglbg) inset, 0 0 0 2px var(--tglbg) inset;
}

[dir="rtl"] .toggle:indeterminate {
  box-shadow: calc(var(--handleoffset) / 2) 0 0 2px var(--tglbg) inset,
        calc(var(--handleoffset) / -2) 0 0 2px var(--tglbg) inset, 0 0 0 2px var(--tglbg) inset;
}

.toggle:disabled {
  cursor: not-allowed;
  --tw-border-opacity: 1;
  border-color: hsl(var(--bc) / var(--tw-border-opacity));
  background-color: transparent;
  opacity: 0.3;
  --togglehandleborder: 0 0 0 3px hsl(var(--bc)) inset,
      var(--handleoffsetcalculator) 0 0 3px hsl(var(--bc)) inset;
}

.\\!tooltip.tooltip-primary {
  --tooltip-color: hsl(var(--p)) !important;
  --tooltip-text-color: hsl(var(--pc)) !important;
}

.tooltip.tooltip-primary {
  --tooltip-color: hsl(var(--p));
  --tooltip-text-color: hsl(var(--pc));
}

.\\!tooltip.tooltip-secondary {
  --tooltip-color: hsl(var(--s)) !important;
  --tooltip-text-color: hsl(var(--sc)) !important;
}

.tooltip.tooltip-secondary {
  --tooltip-color: hsl(var(--s));
  --tooltip-text-color: hsl(var(--sc));
}

.\\!tooltip.tooltip-accent {
  --tooltip-color: hsl(var(--a)) !important;
  --tooltip-text-color: hsl(var(--ac)) !important;
}

.tooltip.tooltip-accent {
  --tooltip-color: hsl(var(--a));
  --tooltip-text-color: hsl(var(--ac));
}

.\\!tooltip.tooltip-info {
  --tooltip-color: hsl(var(--in)) !important;
  --tooltip-text-color: hsl(var(--inc)) !important;
}

.tooltip.tooltip-info {
  --tooltip-color: hsl(var(--in));
  --tooltip-text-color: hsl(var(--inc));
}

.\\!tooltip.tooltip-success {
  --tooltip-color: hsl(var(--su)) !important;
  --tooltip-text-color: hsl(var(--suc)) !important;
}

.tooltip.tooltip-success {
  --tooltip-color: hsl(var(--su));
  --tooltip-text-color: hsl(var(--suc));
}

.\\!tooltip.tooltip-warning {
  --tooltip-color: hsl(var(--wa)) !important;
  --tooltip-text-color: hsl(var(--wac)) !important;
}

.tooltip.tooltip-warning {
  --tooltip-color: hsl(var(--wa));
  --tooltip-text-color: hsl(var(--wac));
}

.\\!tooltip.tooltip-error {
  --tooltip-color: hsl(var(--er)) !important;
  --tooltip-text-color: hsl(var(--erc)) !important;
}

.tooltip.tooltip-error {
  --tooltip-color: hsl(var(--er));
  --tooltip-text-color: hsl(var(--erc));
}

.rounded-box {
  border-radius: var(--rounded-box, 1rem);
}

.badge-lg {
  height: 1.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
  padding-left: 0.688rem;
  padding-right: 0.688rem;
}

.btm-nav-xs > *:where(.active) {
  border-top-width: 1px;
}

.btm-nav-sm > *:where(.active) {
  border-top-width: 2px;
}

.btm-nav-md > *:where(.active) {
  border-top-width: 2px;
}

.btm-nav-lg > *:where(.active) {
  border-top-width: 4px;
}

.btn-sm {
  height: 2rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  min-height: 2rem;
  font-size: 0.875rem;
}

.btn-square:where(.btn-xs) {
  height: 1.5rem;
  width: 1.5rem;
  padding: 0px;
}

.btn-square:where(.btn-sm) {
  height: 2rem;
  width: 2rem;
  padding: 0px;
}

.btn-square:where(.btn-md) {
  height: 3rem;
  width: 3rem;
  padding: 0px;
}

.btn-square:where(.btn-lg) {
  height: 4rem;
  width: 4rem;
  padding: 0px;
}

.btn-circle:where(.btn-xs) {
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 9999px;
  padding: 0px;
}

.btn-circle:where(.btn-sm) {
  height: 2rem;
  width: 2rem;
  border-radius: 9999px;
  padding: 0px;
}

.btn-circle:where(.btn-md) {
  height: 3rem;
  width: 3rem;
  border-radius: 9999px;
  padding: 0px;
}

.btn-circle:where(.btn-lg) {
  height: 4rem;
  width: 4rem;
  border-radius: 9999px;
  padding: 0px;
}

.join.join-vertical {
  flex-direction: column;
}

.join.join-vertical .join-item:first-child:not(:last-child),
  .join.join-vertical *:first-child:not(:last-child) .join-item {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

.join.join-vertical .join-item:last-child:not(:first-child),
  .join.join-vertical *:last-child:not(:first-child) .join-item {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}

.join.join-horizontal {
  flex-direction: row;
}

.join.join-horizontal .join-item:first-child:not(:last-child),
  .join.join-horizontal *:first-child:not(:last-child) .join-item {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: inherit;
  border-top-left-radius: inherit;
}

.join.join-horizontal .join-item:last-child:not(:first-child),
  .join.join-horizontal *:last-child:not(:first-child) .join-item {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-bottom-right-radius: inherit;
  border-top-right-radius: inherit;
}

.kbd-md {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
  min-height: 2.2em;
  min-width: 2.2em;
}

.menu-horizontal {
  display: inline-flex;
  flex-direction: row;
}

.menu-horizontal > li:not(.menu-title) > details > ul {
  position: absolute;
}

.modal-bottom {
  place-items: end;
}

.steps-horizontal .step {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  place-items: center;
  text-align: center;
}

.steps-vertical .step {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(1, minmax(0, 1fr));
}

:where(.toast) {
  right: 0px;
  left: auto;
  top: auto;
  bottom: 0px;
  --tw-translate-x: 0px;
  --tw-translate-y: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.toast:where(.toast-start) {
  right: auto;
  left: 0px;
  --tw-translate-x: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.toast:where(.toast-center) {
  right: 50%;
  left: 50%;
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.toast:where(.toast-end) {
  right: 0px;
  left: auto;
  --tw-translate-x: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.toast:where(.toast-bottom) {
  top: auto;
  bottom: 0px;
  --tw-translate-y: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.toast:where(.toast-middle) {
  top: 50%;
  bottom: auto;
  --tw-translate-y: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.toast:where(.toast-top) {
  top: 0px;
  bottom: auto;
  --tw-translate-y: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.\\!tooltip {
  position: relative !important;
  display: inline-block !important;
  --tooltip-offset: calc(100% + 1px + var(--tooltip-tail, 0px)) !important;
}

.tooltip {
  position: relative;
  display: inline-block;
  --tooltip-offset: calc(100% + 1px + var(--tooltip-tail, 0px));
}

.\\!tooltip:before {
  position: absolute !important;
  pointer-events: none !important;
  z-index: 1 !important;
  content: var(--tw-content) !important;
  --tw-content: attr(data-tip) !important;
}

.tooltip:before {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  content: var(--tw-content);
  --tw-content: attr(data-tip);
}

.\\!tooltip:before {
  transform: translateX(-50%) !important;
  top: auto !important;
  left: 50% !important;
  right: auto !important;
  bottom: var(--tooltip-offset) !important;
}

.tooltip:before, .tooltip-top:before {
  transform: translateX(-50%);
  top: auto;
  left: 50%;
  right: auto;
  bottom: var(--tooltip-offset);
}

.tooltip-right:before {
  transform: translateY(-50%);
  top: 50%;
  left: var(--tooltip-offset);
  right: auto;
  bottom: auto;
}

.btn-group .btn:not(:first-child):not(:last-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group .btn:first-child:not(:last-child) {
  margin-top: -0px;
  margin-left: -1px;
  border-top-left-radius: var(--rounded-btn, 0.5rem);
  border-top-right-radius: 0;
  border-bottom-left-radius: var(--rounded-btn, 0.5rem);
  border-bottom-right-radius: 0;
}

.btn-group .btn:last-child:not(:first-child) {
  border-top-left-radius: 0;
  border-top-right-radius: var(--rounded-btn, 0.5rem);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: var(--rounded-btn, 0.5rem);
}

.btn-group-horizontal .btn:not(:first-child):not(:last-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group-horizontal .btn:first-child:not(:last-child) {
  margin-top: -0px;
  margin-left: -1px;
  border-top-left-radius: var(--rounded-btn, 0.5rem);
  border-top-right-radius: 0;
  border-bottom-left-radius: var(--rounded-btn, 0.5rem);
  border-bottom-right-radius: 0;
}

.btn-group-horizontal .btn:last-child:not(:first-child) {
  border-top-left-radius: 0;
  border-top-right-radius: var(--rounded-btn, 0.5rem);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: var(--rounded-btn, 0.5rem);
}

.btn-group-vertical .btn:first-child:not(:last-child) {
  margin-top: -1px;
  margin-left: -0px;
  border-top-left-radius: var(--rounded-btn, 0.5rem);
  border-top-right-radius: var(--rounded-btn, 0.5rem);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group-vertical .btn:last-child:not(:first-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: var(--rounded-btn, 0.5rem);
  border-bottom-right-radius: var(--rounded-btn, 0.5rem);
}

.card-compact .card-body {
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.card-compact .card-title {
  margin-bottom: 0.25rem;
}

.card-normal .card-body {
  padding: var(--padding-card, 2rem);
  font-size: 1rem;
  line-height: 1.5rem;
}

.card-normal .card-title {
  margin-bottom: 0.75rem;
}

.join.join-vertical > :where(*:not(:first-child)) {
  margin-left: 0px;
  margin-right: 0px;
  margin-top: -1px;
}

.join.join-horizontal > :where(*:not(:first-child)) {
  margin-top: 0px;
  margin-bottom: 0px;
  margin-left: -1px;
}

.menu-horizontal > li:not(.menu-title) > details > ul {
  margin-top: 1rem;
  margin-left: 0px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-right: 0.5rem;
}

.menu-horizontal > li > details > ul:before {
  content: none;
}

:where(.menu-horizontal > li:not(.menu-title) > details > ul) {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  border-radius: var(--rounded-box, 1rem);
}

.menu-sm :where(li:not(.menu-title) > *:not(ul):not(details):not(.menu-title)),
  .menu-sm :where(li:not(.menu-title) > details > summary:not(.menu-title)) {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  border-radius: var(--rounded-btn, 0.5rem);
}

.menu-sm .menu-title {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.modal-top :where(.modal-box) {
  width: 100%;
  max-width: none;
  --tw-translate-y: -2.5rem;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: var(--rounded-box, 1rem);
  border-bottom-right-radius: var(--rounded-box, 1rem);
}

.modal-middle :where(.modal-box) {
  width: 91.666667%;
  max-width: 32rem;
  --tw-translate-y: 0px;
  --tw-scale-x: .9;
  --tw-scale-y: .9;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  border-top-left-radius: var(--rounded-box, 1rem);
  border-top-right-radius: var(--rounded-box, 1rem);
  border-bottom-left-radius: var(--rounded-box, 1rem);
  border-bottom-right-radius: var(--rounded-box, 1rem);
}

.modal-bottom :where(.modal-box) {
  width: 100%;
  max-width: none;
  --tw-translate-y: 2.5rem;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  border-top-left-radius: var(--rounded-box, 1rem);
  border-top-right-radius: var(--rounded-box, 1rem);
}

.steps-horizontal .step {
  grid-template-rows: 40px 1fr;
  grid-template-columns: auto;
  min-width: 4rem;
}

.steps-horizontal .step:before {
  height: 0.5rem;
  width: 100%;
  --tw-translate-y: 0px;
  --tw-translate-x: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  content: "";
  margin-left: -100%;
}

.steps-vertical .step {
  gap: 0.5rem;
  grid-template-columns: 40px 1fr;
  grid-template-rows: auto;
  min-height: 4rem;
  justify-items: start;
}

.steps-vertical .step:before {
  height: 100%;
  width: 0.5rem;
  --tw-translate-y: -50%;
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  margin-left: 50%;
}

[dir="rtl"] .steps-vertical .step:before {
  margin-right: auto;
}

.table-lg :not(thead):not(tfoot) tr {
  font-size: 1rem;
  line-height: 1.5rem;
}

.table-lg :where(th, td) {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.\\!tooltip {
  position: relative !important;
  display: inline-block !important;
  text-align: center !important;
  --tooltip-tail: 0.1875rem !important;
  --tooltip-color: hsl(var(--n)) !important;
  --tooltip-text-color: hsl(var(--nc)) !important;
  --tooltip-tail-offset: calc(100% + 0.0625rem - var(--tooltip-tail)) !important;
}

.tooltip {
  position: relative;
  display: inline-block;
  text-align: center;
  --tooltip-tail: 0.1875rem;
  --tooltip-color: hsl(var(--n));
  --tooltip-text-color: hsl(var(--nc));
  --tooltip-tail-offset: calc(100% + 0.0625rem - var(--tooltip-tail));
}

.\\!tooltip:before,
.\\!tooltip:after {
  opacity: 0 !important;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter !important;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter !important;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter !important;
  transition-delay: 100ms !important;
  transition-duration: 200ms !important;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.tooltip:before,
.tooltip:after {
  opacity: 0;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-delay: 100ms;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.\\!tooltip:before,
.\\!tooltip:after {
  opacity: 0 !important;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter !important;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter !important;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter !important;
  transition-delay: 100ms !important;
  transition-duration: 200ms !important;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.\\!tooltip:after {
  position: absolute !important;
  content: "" !important;
  border-style: solid !important;
  border-width: var(--tooltip-tail, 0) !important;
  width: 0 !important;
  height: 0 !important;
  display: block !important;
}

.tooltip:after {
  position: absolute;
  content: "";
  border-style: solid;
  border-width: var(--tooltip-tail, 0);
  width: 0;
  height: 0;
  display: block;
}

.\\!tooltip:before {
  max-width: 20rem !important;
  border-radius: 0.25rem !important;
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
  padding-top: 0.25rem !important;
  padding-bottom: 0.25rem !important;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
  background-color: var(--tooltip-color) !important;
  color: var(--tooltip-text-color) !important;
  width: -moz-max-content !important;
  width: max-content !important;
}

.tooltip:before {
  max-width: 20rem;
  border-radius: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: var(--tooltip-color);
  color: var(--tooltip-text-color);
  width: -moz-max-content;
  width: max-content;
}

.\\!tooltip.tooltip-open:before,
.\\!tooltip.tooltip-open:after,
.\\!tooltip:hover:before,
.\\!tooltip:hover:after {
  opacity: 1 !important;
  transition-delay: 75ms !important;
}

.tooltip.tooltip-open:before,
.tooltip.tooltip-open:after,
.tooltip:hover:before,
.tooltip:hover:after {
  opacity: 1;
  transition-delay: 75ms;
}

.\\!tooltip.tooltip-open:before,
.\\!tooltip.tooltip-open:after,
.\\!tooltip:hover:before,
.\\!tooltip:hover:after {
  opacity: 1 !important;
  transition-delay: 75ms !important;
}

.\\!tooltip:has(:focus-visible):after,
.\\!tooltip:has(:focus-visible):before {
  opacity: 1 !important;
  transition-delay: 75ms !important;
}

.tooltip:has(:focus-visible):after,
.tooltip:has(:focus-visible):before {
  opacity: 1;
  transition-delay: 75ms;
}

.\\!tooltip:has(:focus-visible):after,
.\\!tooltip:has(:focus-visible):before {
  opacity: 1 !important;
  transition-delay: 75ms !important;
}

.\\!tooltip:not([data-tip]):hover:before,
.\\!tooltip:not([data-tip]):hover:after {
  visibility: hidden !important;
  opacity: 0 !important;
}

.tooltip:not([data-tip]):hover:before,
.tooltip:not([data-tip]):hover:after {
  visibility: hidden;
  opacity: 0;
}

.\\!tooltip:not([data-tip]):hover:before,
.\\!tooltip:not([data-tip]):hover:after {
  visibility: hidden !important;
  opacity: 0 !important;
}

.\\!tooltip:after {
  transform: translateX(-50%) !important;
  border-color: var(--tooltip-color) transparent transparent transparent !important;
  top: auto !important;
  left: 50% !important;
  right: auto !important;
  bottom: var(--tooltip-tail-offset) !important;
}

.tooltip:after, .tooltip-top:after {
  transform: translateX(-50%);
  border-color: var(--tooltip-color) transparent transparent transparent;
  top: auto;
  left: 50%;
  right: auto;
  bottom: var(--tooltip-tail-offset);
}

.tooltip-right:after {
  transform: translateY(-50%);
  border-color: transparent var(--tooltip-color) transparent transparent;
  top: 50%;
  left: calc(var(--tooltip-tail-offset) + 0.0625rem);
  right: auto;
  bottom: auto;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.pointer-events-none {
  pointer-events: none;
}

.pointer-events-auto {
  pointer-events: auto;
}

.visible {
  visibility: visible;
}

.invisible {
  visibility: hidden;
}

.collapse {
  visibility: collapse;
}

.static {
  position: static;
}

.fixed {
  position: fixed;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-y-0 {
  top: 0px;
  bottom: 0px;
}

.bottom-0 {
  bottom: 0px;
}

.bottom-4 {
  bottom: 1rem;
}

.left-0 {
  left: 0px;
}

.right-0 {
  right: 0px;
}

.right-2 {
  right: 0.5rem;
}

.right-4 {
  right: 1rem;
}

.top-0 {
  top: 0px;
}

.top-2 {
  top: 0.5rem;
}

.z-10 {
  z-index: 10;
}

.z-30 {
  z-index: 30;
}

.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 50;
}

.z-\\[1050\\] {
  z-index: 1050;
}

.order-1 {
  order: 1;
}

.order-2 {
  order: 2;
}

.m-2 {
  margin: 0.5rem;
}

.m-4 {
  margin: 1rem;
}

.mx-4 {
  margin-left: 1rem;
  margin-right: 1rem;
}

.mx-8 {
  margin-left: 2rem;
  margin-right: 2rem;
}

.my-1 {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.my-2 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.my-4 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mr-auto {
  margin-right: auto;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-4 {
  margin-top: 1rem;
}

.block {
  display: block;
}

.inline-block {
  display: inline-block;
}

.\\!flex {
  display: flex !important;
}

.flex {
  display: flex;
}

.inline-flex {
  display: inline-flex;
}

.table {
  display: table;
}

.hidden {
  display: none;
}

.h-20 {
  height: 5rem;
}

.h-4 {
  height: 1rem;
}

.h-6 {
  height: 1.5rem;
}

.h-8 {
  height: 2rem;
}

.h-full {
  height: 100%;
}

.h-screen {
  height: 100vh;
}

.min-h-\\[1em\\] {
  min-height: 1em;
}

.min-h-fit {
  min-height: -moz-fit-content;
  min-height: fit-content;
}

.w-0 {
  width: 0px;
}

.w-0\\.5 {
  width: 0.125rem;
}

.w-20 {
  width: 5rem;
}

.w-4 {
  width: 1rem;
}

.w-6 {
  width: 1.5rem;
}

.w-8 {
  width: 2rem;
}

.w-fit {
  width: -moz-fit-content;
  width: fit-content;
}

.w-full {
  width: 100%;
}

.w-max {
  width: -moz-max-content;
  width: max-content;
}

.w-screen {
  width: 100vw;
}

.min-w-full {
  min-width: 100%;
}

.min-w-min {
  min-width: -moz-min-content;
  min-width: min-content;
}

.max-w-min {
  max-width: -moz-min-content;
  max-width: min-content;
}

.flex-1 {
  flex: 1 1 0%;
}

.flex-grow {
  flex-grow: 1;
}

.rotate-45 {
  --tw-rotate: 45deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.cursor-pointer {
  cursor: pointer;
}

.resize {
  resize: both;
}

.flex-row {
  flex-direction: row;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-start {
  justify-content: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.space-y-2 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
}

.self-stretch {
  align-self: stretch;
}

.overflow-x-auto {
  overflow-x: auto;
}

.overflow-y-clip {
  overflow-y: clip;
}

.overflow-x-scroll {
  overflow-x: scroll;
}

.overflow-y-scroll {
  overflow-y: scroll;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-none {
  border-radius: 0px;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-t-xl {
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}

.border {
  border-width: 1px;
}

.border-r {
  border-right-width: 1px;
}

.border-t-4 {
  border-top-width: 4px;
}

.border-dotted {
  border-style: dotted;
}

.border-none {
  border-style: none;
}

.border-base-200 {
  --tw-border-opacity: 1;
  border-color: hsl(var(--b2) / var(--tw-border-opacity));
}

.border-gray-300 {
  --tw-border-opacity: 1;
  border-color: rgb(209 213 219 / var(--tw-border-opacity));
}

.bg-base-100 {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
}

.bg-black {
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity));
}

.bg-current {
  background-color: currentColor;
}

.bg-gray-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity));
}

.bg-primary {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--p) / var(--tw-bg-opacity));
}

.bg-primary-focus {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--pf) / var(--tw-bg-opacity));
}

.bg-transparent {
  background-color: transparent;
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}

.bg-yellow-200 {
  --tw-bg-opacity: 1;
  background-color: rgb(254 240 138 / var(--tw-bg-opacity));
}

.object-cover {
  -o-object-fit: cover;
     object-fit: cover;
}

.p-0 {
  padding: 0px;
}

.p-2 {
  padding: 0.5rem;
}

.p-4 {
  padding: 1rem;
}

.p-8 {
  padding: 2rem;
}

.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.pt-4 {
  padding-top: 1rem;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.align-middle {
  vertical-align: middle;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.normal-case {
  text-transform: none;
}

.text-primary {
  --tw-text-opacity: 1;
  color: hsl(var(--p) / var(--tw-text-opacity));
}

.opacity-0 {
  opacity: 0;
}

.opacity-100 {
  opacity: 1;
}

.shadow {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-md {
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-sm {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-xl {
  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.blur {
  --tw-blur: blur(8px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

@media (min-width: 640px) {
  .sm\\:navbar-start {
    width: 50%;
    justify-content: flex-start;
  }

  .sm\\:navbar-center {
    flex-shrink: 0;
  }

  .sm\\:navbar-end {
    width: 50%;
    justify-content: flex-end;
  }

  .sm\\:min-h-16 {
    min-height: 4rem;
  }

  .sm\\:modal-middle {
    place-items: center;
  }

  .sm\\:modal-middle :where(.modal-box) {
    width: 91.666667%;
    max-width: 32rem;
    --tw-translate-y: 0px;
    --tw-scale-x: .9;
    --tw-scale-y: .9;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
    border-top-left-radius: var(--rounded-box, 1rem);
    border-top-right-radius: var(--rounded-box, 1rem);
    border-bottom-left-radius: var(--rounded-box, 1rem);
    border-bottom-right-radius: var(--rounded-box, 1rem);
  }
}

.last\\:border-r-0:last-child {
  border-right-width: 0px;
}

.hover\\:relative:hover {
  position: relative;
}

.hover\\:bottom-2:hover {
  bottom: 0.5rem;
}

.hover\\:cursor-pointer:hover {
  cursor: pointer;
}

.hover\\:bg-base-200:hover {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b2) / var(--tw-bg-opacity));
}

.hover\\:bg-gray-100:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity));
}

.hover\\:shadow-lg:hover {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.hover\\:shadow-md:hover {
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@media (prefers-color-scheme: dark) {
  .dark\\:opacity-50 {
    opacity: 0.5;
  }
}

@media (min-width: 640px) {
  .sm\\:static {
    position: static;
  }

  .sm\\:inline {
    display: inline;
  }

  .sm\\:flex {
    display: flex;
  }

  .sm\\:hidden {
    display: none;
  }

  .sm\\:w-1\\/2 {
    width: 50%;
  }

  .sm\\:w-96 {
    width: 24rem;
  }

  .sm\\:w-auto {
    width: auto;
  }

  .sm\\:w-fit {
    width: -moz-fit-content;
    width: fit-content;
  }

  .sm\\:w-full {
    width: 100%;
  }

  .sm\\:min-w-0 {
    min-width: 0px;
  }

  .sm\\:flex-row {
    flex-direction: row;
  }

  .sm\\:flex-col {
    flex-direction: column;
  }

  .sm\\:overflow-x-auto {
    overflow-x: auto;
  }

  .sm\\:overflow-y-visible {
    overflow-y: visible;
  }

  .sm\\:rounded-xl {
    border-radius: 0.75rem;
  }

  .sm\\:border-b {
    border-bottom-width: 1px;
  }

  .sm\\:border-r-0 {
    border-right-width: 0px;
  }

  .sm\\:p-4 {
    padding: 1rem;
  }

  .sm\\:last\\:border-b-0:last-child {
    border-bottom-width: 0px;
  }
}

@media (min-width: 1024px) {
  .lg\\:order-1 {
    order: 1;
  }

  .lg\\:order-2 {
    order: 2;
  }

  .lg\\:mx-4 {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .lg\\:inline {
    display: inline;
  }

  .lg\\:flex {
    display: flex;
  }

  .lg\\:hidden {
    display: none;
  }

  .lg\\:max-h-screen {
    max-height: 100vh;
  }

  .lg\\:w-1\\/4 {
    width: 25%;
  }

  .lg\\:w-3\\/4 {
    width: 75%;
  }

  .lg\\:flex-row {
    flex-direction: row;
  }
}

@media (min-width: 1280px) {
  .xl\\:block {
    display: block;
  }

  .xl\\:hidden {
    display: none;
  }
}`;