import { LitElement, html } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";

export default class LMSContainer extends LitElement {
  static get properties() {
    return {
      classes: { type: Array },
      _elements: { state: true },
    };
  }

  static styles = [bootstrapStyles];

  constructor() {
    super();
    this.classes = ["container"];
    this._elements = [];
  }

  render() {
    return html`
      <div class=${this.classes.join(" ")}>
        ${this._elements?.map((element) => html`${element}`) ??
        html`<slot></slot>`}
      </div>
    `;
  }
}
customElements.define("lms-container", LMSContainer);
