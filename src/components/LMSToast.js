import { css, html, LitElement } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";
export default class LMSToast extends LitElement {
  static properties = {
    heading: { type: String },
    message: { type: String },
    _elapsedTime: { state: true },
  };

  static styles = [
    bootstrapStyles,
    css`
      div:first {
        bottom: 1em;
        position: absolute;
        min-height: 200px;
      }

      .toast {
        position: absolute;
        bottom: 1em;
        left: 50%;
        opacity: 1;
      }
    `,
  ];

  constructor() {
    super();
    this.heading = "";
    this.message = "";
    this._elapsedTime = 0;
  }

  render() {
    return html`
      <div aria-live="polite" aria-atomic="true">
        <div class="toast">
          <div class="toast-header">
            <strong class="mr-auto">${this.heading}</strong>
            <small>${this._elapsedTime} sec ago</small>
            <button
              type="button"
              class="ml-2 mb-1 close"
              data-dismiss="toast"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="toast-body">${this.message}</div>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    setInterval(() => {
      this._elapsedTime++;
    }, 1000);

    this.renderRoot.addEventListener("click", (e) => {
      if (e.target.tagName === "SPAN") {
        this.remove();
      }
    });

    setTimeout(() => {
      this.remove();
    }, 10000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.renderRoot.removeEventListener("click", (e) => {
      if (e.target.tagName === "SPAN") {
        this.remove();
      }
    });
  }
}

customElements.define("lms-toast", LMSToast);
