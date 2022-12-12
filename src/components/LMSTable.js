import { html, css, LitElement } from "lit";

export default class LMSTable extends LitElement {
  static get properties() {
    return {
      data: { type: Array },
    };
  }

  static styles = css`
    table {
      border-collapse: collapse;
      width: 100%;
      font-family: "Roboto", sans-serif;
    }

    th,
    td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      font-weight: 500;
      color: #3f51b5;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    tr:hover {
      background-color: #eee;
    }
  `;

  render() {
    const { data } = this;

    return html`
      <table>
        <thead>
          <tr>
            ${Object.keys(data[0]).map((key) => html`<th>${key}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${data.map(
            (item) => html`
              <tr>
                ${Object.keys(item).map((key) =>
                  key === "value"
                    ? html`<td><input type="text" value=${item[key]} /></td>`
                    : html`<td>${item[key]}</td>`
                )}
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}

customElements.define("lms-table", LMSTable);

/* Usage
const data = [
  {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'janesmith@example.com',
  },
  // ...
];

<lit-table .data=${data} />
*/
