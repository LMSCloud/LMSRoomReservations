const template = document.createElement('template');
template.innerHTML = `
  <div class="lmsr-edit-modal">
    <div class="lmsr-edit-modal-header">
      <strong>&quest;</strong>
      <slot name="title"></slot>
      <button type="button" class="lmsr-button-close lmsr-modal-button-close" aria-label="Close" disabled>
        <span aria-hidden="true">&times;</i></span>
      </button>
    </div>
    <slot name="content"></slot>
    <slot name="hidden-inputs"></slot>
    <slot name="submit"></slot>
  </div>
  <style>
    @import url('/api/v1/contrib/roomreservations/static/css/main.css');
  </style>
`;

export default class LmsrEditModal extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  connectedCallback() {
    const lmsrEditModal = document.querySelector('lmsr-edit-modal');
    const lmsrModalButtonClose = this.shadowRoot.querySelector('.lmsr-modal-button-close');
    lmsrModalButtonClose.addEventListener('click', () => { lmsrEditModal.remove(); });
    lmsrModalButtonClose.disabled = false;
  }
}
