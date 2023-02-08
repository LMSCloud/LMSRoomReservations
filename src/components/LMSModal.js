/* eslint-disable no-underscore-dangle */
import { LitElement, html, css, nothing } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";
import TranslationHandler from "../lib/TranslationHandler";

export default class LMSModal extends LitElement {
  static get properties() {
    return {
      fields: { type: Array },
      createOpts: { type: Object },
      editable: { type: Boolean },
      isOpen: { type: Boolean },
      _alertMessage: { state: true },
      _i18n: { state: true },
    };
  }

  static get styles() {
    return [
      bootstrapStyles,
      css`
        .btn-modal-wrapper {
          position: fixed;
          bottom: 1em;
          right: 1em;
          border-radius: 50%;
          background-color: rgb(35, 39, 43);
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: var(--shadow-hv);
          cursor: pointer;
          z-index: 1049;
        }

        .btn-modal-wrapper > .btn-modal {
          background: none;
          border: none;
          color: #fff;
          font-size: 2em;
          width: 2em;
          height: 2em;
        }

        .backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgb(0 0 0 / 50%);
          z-index: 1048;
        }

        button.btn-modal:not(.tilted) {
          transition: 0.2s;
          transition-timing-function: ease-in-out;
          transform: translateX(0%) translateY(0%) rotate(0deg);
        }

        .tilted {
          transition: 0.2s;
          transition-timing-function: ease-in-out;
          transform: translateX(2px) translateY(-1px) rotate(45deg);
        }
      `,
    ];
  }

  async _init() {
    const translationHandler = new TranslationHandler();
    this._i18n = new Promise((resolve, reject) => {
      translationHandler
        .loadTranslations()
        .then(() => {
          resolve(translationHandler.i18n);
        })
        .catch((err) => reject(err));
    });
  }

  constructor() {
    super();
    this.fields = [];
    this.createOpts = {
      endpoint: undefined,
      method: undefined,
      id: undefined,
      body: undefined,
    };
    this.editable = false;
    this.isOpen = false;
    this._alertMessage = "";
    this._modalTitle = "";
    this._i18n = undefined;
    this._init();
  }

  connectedCallback() {
    super.connectedCallback();
    this._i18n.then(() => {
      this.fields
        .filter((field) => field.logic)
        .map((asyncFetcher) =>
          asyncFetcher
            .logic()
            .then((entries) => (asyncFetcher.entries = entries))
        );
    });
  }

  updated() {
    /** We have to set the _i18n attribute to the actual
     *  class after the promise has been resolved.
     *  We also want to cover the case were this._i18n
     *  is defined but not yet a Promise. */
    if (this._i18n instanceof Promise) {
      this._i18n.then((i18n) => {
        this._i18n = i18n;
      });
    }
  }

  _toggleModal() {
    this.isOpen = !this.isOpen;
  }

  async _create(e) {
    e.preventDefault();
    const { endpoint, method } = this.createOpts;
    const response = await fetch(`${endpoint}`, {
      method,
      body: JSON.stringify(
        Object.assign(
          ...this.fields.map(({ name, value }) => ({ [name]: value }))
        )
      ),
    });

    if (response.status === 201) {
      this._toggleModal();

      const event = new CustomEvent("created", { bubbles: true });
      this.dispatchEvent(event);
    }

    if (response.status >= 400) {
      const result = await response.json();

      /** We have to check whether we get a single error or an
       *  errors object. If we get an errors object, we have to
       *  loop through it and display each error message. */
      if (result.error) {
        this._alertMessage = `Sorry! ${result.error}`;
        return;
      }

      if (result.errors) {
        this._alertMessage = Object.values(result.errors)
          .map(({ message, path }) => `Sorry! ${message} at ${path}`)
          .join(" & ");
      }
    }
  }

  _dismissAlert() {
    this._alertMessage = "";
  }

  render() {
    return !this._i18n?.gettext
      ? nothing
      : html`
          <div class="btn-modal-wrapper">
            <button
              @click=${this._toggleModal}
              class="btn-modal ${this.isOpen && "tilted"}"
              type="button"
            >
              +
            </button>
          </div>
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
                    ${this._modalTitle || "Add"}
                  </h5>
                  <button
                    @click=${this._toggleModal}
                    type="button"
                    class="close"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <form @submit="${this._create}">
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
                    ${this.fields.map((field) => this._getFieldMarkup(field))}
                  </div>
                  <div class="modal-footer">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      data-dismiss="modal"
                      @click=${this._toggleModal}
                    >
                      ${this._i18n.gettext("Close")}
                    </button>
                    <button type="submit" class="btn btn-primary">
                      ${this._i18n.gettext("Create")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        `;
  }

  _getFieldMarkup(field) {
    if (!field.desc) return html``;
    if (field.type === "select" && field.entries) {
      /** We have to initialize the select with a default
       *  value because otherwise NULL is supplied until
       *  the first change event occurs. */
      [{ value: field.value }] = field.entries;
      return html` <div class="form-group">
        <label for=${field.name}>${field.desc}</label>
        <select
          name=${field.name}
          id=${field.name}
          class="form-control"
          @change=${(e) => {
            field.value = e.target.value;
          }}
          ?required=${field.required}
        >
          ${field.entries.map(
            (entry) => html`<option value=${entry.value}>${entry.name}</option>`
          )}
        </select>
      </div>`;
    }
    if (field.type === "checkbox") {
      return html` <div class="form-check">
        <input
          type=${field.type}
          name=${field.name}
          id=${field.name}
          value="1"
          class="form-check-input"
          @input=${(e) => {
            field.value = e.target.value;
          }}
          ?required=${field.required}
        />
        <label for=${field.name}>&nbsp;${field.desc}</label>
      </div>`;
    }
    if (field.type === "info") {
      return html` <p>${field.desc}</p> `;
    }
    return html` <div class="form-group">
      <label for=${field.name}>${field.desc}</label>
      <input
        type=${field.type}
        name=${field.name}
        id=${field.name}
        class="form-control"
        @input=${(e) => {
          field.value = e.target.value;
        }}
        ?required=${field.required}
      />
    </div>`;
  }
}
