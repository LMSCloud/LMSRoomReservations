import { LitElement, html, css } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import { nothing } from "lit";

export default class LMSFloatingMenu extends LitElement {
  static get properties() {
    return {
      brand: { type: String },
      items: {
        type: Array,
        convert: (value) => JSON.parse(value),
      },
      _current_url: { type: String, attribute: false },
    };
  }

  static styles = [
    bootstrapStyles,
    css`
      svg {
        width: 1rem;
        height: 1rem;
      }
    `,
  ];

  constructor() {
    super();
    this.items = [];
    this.brand = "Navigation";
    this._current_url = window.location.href;
  }

  render() {
    return html` <nav
      class="navbar navbar-expand-lg navbar-dark bg-dark mx-2 mt-3 mb-5 rounded"
    >
      <a class="navbar-brand" href="#"><strong>${this.brand}</strong></a>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarText"
        aria-controls="navbarText"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarText">
        <ul class="navbar-nav mr-auto">
          ${this.items.map(
            (item) => html` <li
              class="nav-item ${this._current_url.includes(item.url)
                ? "active"
                : nothing}"
            >
              <a class="nav-link" href="${item.url}"
                >${litFontawesome(item.icon)}
                ${item.name}${this._current_url.includes(item.url)
                  ? html` <span class="sr-only">(current)</span>`
                  : nothing}</a
              >
            </li>`
          )}
        </ul>
      </div>
    </nav>`;
  }
}
customElements.define("lms-floating-menu", LMSFloatingMenu);
