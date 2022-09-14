const template = document.createElement('template');
template.innerHTML = `
  <div class="lmsr-toast">
    <div class="lmsr-toast-header">
      <strong>&excl;</strong>
      <slot name="title"></slot>
      <button type="button" class="lmsr-button-close lmsr-toast-button-close" aria-label="Close" disabled>
        <span aria-hidden="true">&times;</i></span>
      </button>
    </div>
    <div class="lmsr-toast-body">
      <slot name="message"></slot>
    </div>
  </div>
  <style>
    @import url('/api/v1/contrib/roomreservations/static/css/main.css');
  </style>
`;

export default class LmsrToast extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  connectedCallback() {
    const lmsrToast = this.shadowRoot.querySelector('.lmsr-toast');
    const lmsrToastButtonClose = this.shadowRoot.querySelector('.lmsr-toast-button-close');
    lmsrToastButtonClose.addEventListener('click', () => { lmsrToast.remove(); });
    lmsrToastButtonClose.disabled = false;
    window.setTimeout(() => { lmsrToast.remove(); }, 3000);
  }
}
