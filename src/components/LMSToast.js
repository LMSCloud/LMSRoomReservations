import { css, html, LitElement } from 'lit';

export default class LMSToast extends LitElement {
  static styles = css`
    .lms-toast {
      position: fixed;
      bottom: 1em;
      right: 1em;
      width: 200px;
      border-radius: 7px;
      border: 1px solid var(--seperator-light);
      box-shadow: var(--shadow-hv);
    }

    .lms-toast-body {
      border-radius: 0 0 7px 7px;
    }

    .lms-toast-body,
    .lms-toast-header {
      padding: 0.5em;
      background-color: white;
    }

    .lms-toast-button-close,
    .lms-modal-button-close {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 7px;
    }

    .lms-toast-button-close:hover,
    .lms-modal-button-close:hover {
      background: crimson;
    }

    .lms-toast-button-close:hover span {
      color: white;
    }

    .lms-toast-header {
      border-bottom: 1px solid var(--seperator-light);
      border-radius: 7px 7px 0 0;
      display: flex;
      justify-content: space-between;
    }
  `;

  render() {
    return html`
      <div class="lms-toast">
        <div class="lms-toast-header">
          <strong>&excl;</strong>
          <slot name="title"></slot>
          <button type="button" class="lms-button-close lms-toast-button-close" aria-label="Close" disabled>
            <span aria-hidden="true">&times;</i></span>
          </button>
        </div>
        <div class="lms-toast-body">
          <slot name="message"></slot>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    const lmsToast = this.shadowRoot.querySelector('.lms-toast');
    const lmsToastButtonClose = this.shadowRoot.querySelector(
      '.lms-toast-button-close',
    );
    lmsToastButtonClose.addEventListener('click', () => {
      lmsToast.remove();
    });
    lmsToastButtonClose.disabled = false;
    window.setTimeout(() => {
      lmsToast.remove();
    }, 3000);
  }
}

customElements.define('lms-toast', LMSToast);
