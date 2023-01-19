import { css, html, LitElement } from 'lit';

const style = css`
  @import url("/api/v1/contrib/roomreservations/static/css/main.css");
`;

class LmsrEquipmentSelection extends LitElement {
  static get styles() {
    return [style];
  }

  render() {
    return html`
      <slot name="lmsr-check-input"></slot>
      <slot name="lmsr-check-label"></slot>
    `;
  }
}

customElements.define('lmsr-equipment-selection', LmsrEquipmentSelection);
