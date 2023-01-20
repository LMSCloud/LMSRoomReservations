import { html, css, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
export default class LMSTable extends LitElement {
  static get properties() {
    return {
      data: { type: Array },
      _isEditable: { type: Boolean, attribute: false },
    };
  }

  static styles = [
    css`
      table {
        background: white;
        padding: 1em;
        border-radius: var(--border-radius-lg);
      }

      thead {
        border-bottom: 1px solid var(--seperator-light);
      }

      tbody > tr:nth-child(odd) {
        background-color: whitesmoke;
      }
    `,
  ];

  constructor() {
    super();
    this._isEditable = false;
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
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0]).map((key) => html`<th>${key}</th>`)}
                ${this._isEditable ? html`<th>actions</th>` : html``}
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
                            <div class="columns">
                              <div class="column">
                                <button @click=${this._handleEdit} class="">
                                  Edit
                                </button>
                              </div>
                              <div class="column">
                                <button @click=${this._handleSave} class="">
                                  Save
                                </button>
                              </div>
                              <div class="column">
                                <button @click=${this._handleDelete} class="">
                                  Delete
                                </button>
                              </div>
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
