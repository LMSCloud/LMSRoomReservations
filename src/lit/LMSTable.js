import { html, LitElement } from 'lit';

export default class LMSTable extends LitElement {
  static get properties() {
    return {
      data: { type: Array },
    };
  }

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
          ${data.map((item) => html`
            <tr>
              ${Object.keys(item).map((key) => html`<td>${item[key]}</td>`)}
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }
}

customElements.define('lms-table', LMSTable);

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
