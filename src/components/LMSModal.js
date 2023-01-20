/* eslint-disable no-underscore-dangle */
import { LitElement, html, css } from "lit";

export default class LMSModal extends LitElement {
  static get properties() {
    return {
      fields: { type: Array },
      createOpts: { type: Object },
      editable: { type: Boolean },
      isOpen: { type: Boolean },
    };
  }

  static get styles() {
    return [
      css`
        .label {
          display: block;
          margin: 8px 0;
          font-weight: bold;
        }

        .input {
          display: block;
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }

        .button {
          display: inline-block;
          margin-right: 8px;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background-color: #333;
          color: #fff;
          cursor: pointer;
        }

        .buttons {
          display: flex;
          justify-content: right;
          margin: 8px 0;
        }

        .button:hover {
          background-color: #444;
        }

        .plus-button {
          position: fixed;
          bottom: 1em;
          right: 1em;
          border-radius: 50%;
          background-color: #333;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
          cursor: pointer;
          z-index: 99;
        }

        .plus-button > button {
          background: none;
          border: none;
          color: #fff;
          font-size: 2em;
          width: 2em;
          height: 2em;
        }

        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 16px;
          box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
          border-radius: 4px;
          z-index: 100;
        }

        .dark-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgb(0 0 0 / 50%);
          z-index: 98;
        }

        .tilted {
          transition: 0.2s;
          transition-timing-function: ease-in-out;
          transform: rotate(45deg);
        }

        .checkbox {
          margin: 1em 0;
        }

        .checkbox > label {
          vertical-align: text-bottom;
        }
      `,
    ];
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
  }

  _toggleModal() {
    this.isOpen = !this.isOpen;
  }

  async _create(e) {
    e.preventDefault();
    const { endpoint, method, multiple } = this.createOpts;
    const response = await fetch(`${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "",
      },
      body: JSON.stringify(
        Object.assign(
          ...this.fields.map(({ name, value }) => ({ [name]: value }))
        )
      ),
    });

    if (response.status === 201) {
      this._toggleModal(); /** Implement success toast here */

      const event = new CustomEvent("created", { bubbles: true });
      this.dispatchEvent(event);
    }

    if ([400, 500].includes(response.status)) {
      /** Implement other toast here with the error message. */
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.fields
      .filter((field) => field.logic)
      .map((_field) =>
        _field.logic().then((entries) => (_field.entries = entries))
      );
  }

  render() {
    return html`
      <div class="plus-button">
        <button @click="${this._toggleModal}" class=${this.isOpen && "tilted"}>
          +
        </button>
      </div>
      <div
        class="dark-background"
        ?hidden=${!this.isOpen}
        @click=${this._toggleModal}
      ></div>
      ${this.isOpen
        ? html`
            <div class="modal">
              <form @submit="${this._create}">
                ${this.fields.map((field) => this._getFieldMarkup(field))}
                <div class="buttons">
                  <button type="submit" class="button">Create</button>
                </div>
              </form>
            </div>
          `
        : html``}
    `;
  }

  _getFieldMarkup(field) {
    if (!field.desc) return html``;
    if (field.type === "select" && field.entries) {
      /** We have to initialize the select with a default
       *  value because otherwise NULL is supplied until
       *  the first change event occurs. */
      [{ value: field.value }] = field.entries;
      return html`<label class="label">${field.desc}</label>
        <select
          name=${field.name}
          class="input"
          @change=${(e) => {
            field.value = e.target.value;
          }}
        >
          ${field.entries.map(
            (entry) => html`<option value=${entry.value}>${entry.name}</option>`
          )}
        </select>`;
    }
    if (field.type === "checkbox") {
      return html` <div class="checkbox">
        <input
          type=${field.type}
          name=${field.name}
          value="1"
          @input=${(e) => {
            field.value = e.target.value;
          }}
        />
        <label>${field.desc}</label>
      </div>`;
    }
    if (field.type === "info") {
      return html` <p>${field.desc}</p> `;
    }
    return html`<label class="label">${field.desc}</label>
      <input
        type=${field.type}
        name=${field.name}
        class="input"
        @input=${(e) => {
          field.value = e.target.value;
        }}
      />`;
  }
}
