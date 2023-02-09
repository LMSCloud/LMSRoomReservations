import { LitElement, html, css } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";
import { litFontawesome } from "@weavedev/lit-fontawesome";

export default class LMSFloatingMenu extends LitElement {
  static get properties() {
    return {
      brand: { type: String },
      items: {
        type: Array,
        convert: (value) => JSON.parse(value),
      },
      _currentUrl: { type: String, attribute: false },
    };
  }

  static styles = [
    bootstrapStyles,
    css`
      svg {
        width: 1rem;
        height: 1rem;
      }

      nav {
        background-color: var(--background-color);
        backdrop-filter: blur(5px);
        box-shadow: var(--shadow-hv);
      }
    `,
  ];

  constructor() {
    super();
    this.items = [];
    this.brand = "Navigation";
    this._currentUrl = window.location.href;
    this._currentSearchParams = new URLSearchParams(window.location.search);
  }

  render() {
    return html` <nav
      class="navbar navbar-expand-lg navbar-light mx-2 mt-3 mb-5 rounded"
    >
      <a class="navbar-brand" href="#"><strong>${this.brand}</strong></a>
      <button
        @click=${() =>
          this.renderRoot
            .getElementById("navbarNav")
            .classList.toggle("collapse")}
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          ${this.items.map((item) => {
            /** We split the searchParams from the URL and
             *  compare them to the currentSearchParams of
             *  the window.location. If they match, we add
             *  the "active" class to the item. */
            let [, itemSearchParams] = item.url.split("?");
            itemSearchParams = new URLSearchParams(itemSearchParams ?? "");
            const matches =
              itemSearchParams.toString() ===
              this._currentSearchParams.toString();

            return html` <li class="nav-item ${matches ? "active" : ""}">
              <a class="nav-link" href="${item.url}"
                >${litFontawesome(item.icon)}
                ${item.name}${matches
                  ? html` <span class="sr-only">(current)</span>`
                  : ""}</a
              >
            </li>`;
          })}
        </ul>
      </div>
    </nav>`;
  }
}
customElements.define("lms-floating-menu", LMSFloatingMenu);
