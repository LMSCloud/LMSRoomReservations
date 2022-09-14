const template = document.createElement('template');
template.innerHTML = `
  <slot name="lmsr-check-input"></slot>
  <slot name="lmsr-check-label"></slot>
  <style>
    @import url('/api/v1/contrib/roomreservations/static/css/main.css');
  </style>
`;

export default class LmsrEquipmentSelection extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));
  }
}
