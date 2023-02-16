/* eslint-disable no-underscore-dangle */
import { LitElement, html, css, nothing } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import { faCheck, faCancel } from "@fortawesome/free-solid-svg-icons";
import TranslationHandler from "../lib/TranslationHandler";

export default class LMSConfirmationModal extends LitElement {
  static get properties() {
    return {
      isOpen: { type: Boolean },
      message: { type: String },
      _alertMessage: { state: true },
      _modalTitle: { state: true },
      _i18n: { state: true },
    };
  }

  static get styles() {
    return [
      bootstrapStyles,
      css`
        .backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgb(0 0 0 / 50%);
          z-index: 1048;
        }

        svg {
          display: inline-block;
          width: 1em;
          height: 1em;
          color: #ffffff;
        }

        button {
          white-space: nowrap;
        }

        button.btn-modal > svg {
          color: var(--text-color);
        }
      `,
    ];
  }

  async _init() {
    const translationHandler = new TranslationHandler();
    await translationHandler.loadTranslations();
    this._i18n = translationHandler.i18n;
  }

  constructor() {
    super();
    this.isOpen = false;
    this.message = "";
    this._alertMessage = "";
    this._modalTitle = "";
    this._i18n = undefined;
    this._init();
  }

  _toggleModal() {
    this.isOpen = !this.isOpen;
  }

  _dismissAlert() {
    this._alertMessage = "";
  }

  _handleAbort() {
    this._toggleModal();
    this.dispatchEvent(
      new CustomEvent("abort", {
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleConfirm() {
    this._toggleModal();
    this.dispatchEvent(
      new CustomEvent("confirm", {
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return !this._i18n?.gettext
      ? nothing
      : html`
          <div class="backdrop" ?hidden=${!this.isOpen}></div>
          <div
            class="modal fade ${this.isOpen && "d-block show"}"
            id="lms-modal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="lms-modal-title"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-dialog-centered" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="lms-modal-title">
                    ${this._modalTitle || "Confirm"}
                  </h5>
                  <button
                    @click=${this._handleAbort}
                    type="button"
                    class="close"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <div
                    role="alert"
                    ?hidden=${!this._alertMessage}
                    class="alert alert-${this._alertMessage.includes(
                      "Sorry!"
                    ) && "danger"} alert-dismissible fade show"
                  >
                    ${this._alertMessage}
                    <button
                      @click=${this._dismissAlert}
                      type="button"
                      class="close"
                      data-dismiss="alert"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  ${this.message}
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-dismiss="modal"
                    @click=${this._handleAbort}
                  >
                    ${litFontawesome(faCancel)}
                    <span>${this._i18n.gettext("Cancel")}</span>
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    @click=${this._handleConfirm}
                  >
                    ${litFontawesome(faCheck)}
                    <span>${this._i18n.gettext("Ok")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
  }
}

customElements.define("lms-confirmation-modal", LMSConfirmationModal);
