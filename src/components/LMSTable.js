import { html, css, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";

export default class LMSTable extends LitElement {
  static get properties() {
    return {
      data: { type: Array },
      _isEditable: { type: Boolean, attribute: false },
      _isDeletable: { type: Boolean, attribute: false },
    };
  }

  static styles = [
    bootstrapStyles,
    css`
      table {
        background: white;
        padding: 1em;
      }
    `,
  ];

  constructor() {
    super();
    this._isEditable = false;
    this._isDeletable = false;
    this._notImplementedInBaseMessage =
      "Implement this method in your extended LMSTable component.";
  }

  _handleEdit() {
    console.log(this._notImplementedInBaseMessage);
  }

  _handleSave() {
    console.log(this._notImplementedInBaseMessage);
  }

  _handleDelete() {
    console.log(this._notImplementedInBaseMessage);
  }

  render() {
    const { data } = this;

    return data?.length
      ? html`
          <table class="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                ${Object.keys(data[0]).map(
                  (key) => html`<th scope="col">${key}</th>`
                )}
                ${this._isEditable
                  ? html`<th scope="col">actions</th>`
                  : html``}
              </tr>
            </thead>
            <tbody>
              ${data.map(
                (item) => html`
                  <tr>
                    ${Object.keys(item).map(
                      (key) => html`<td>${unsafeHTML(item[key])}</td>`
                    )}
                    ${this._isEditable
                      ? html`
                          <td>
                            <div class="d-flex">
                              <button
                                @click=${this._handleEdit}
                                type="button"
                                class="btn btn-dark mx-2"
                              >
                                Edit
                              </button>
                              <button
                                @click=${this._handleSave}
                                type="button"
                                class="btn btn-dark mx-2"
                              >
                                Save
                              </button>
                              <button
                                @click=${this._handleDelete}
                                ?hidden=${!this._isDeletable}
                                type="button"
                                class="btn btn-danger mx-2"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        `
                      : html``}
                  </tr>
                `
              )}
            </tbody>
          </table>
        `
      : html``;
  }
}

customElements.define("lms-table", LMSTable);
