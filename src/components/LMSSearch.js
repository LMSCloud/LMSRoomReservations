import { LitElement, html } from 'lit';

export default class LMSSearch extends LitElement {
  static get properties() {
    return {
      tagName: { type: String },
      search: { type: String },
    };
  }

  constructor() {
    super();
    this.tagName = '';
    this.search = '';
    this.indexedContent = [];
  }

  firstUpdated() {
    this.indexedContent = [...document.getElementsByTagName(this.tagName)];
  }

  update(changedProperties) {
    if (changedProperties.has('search')) {
      this.indexedContent.forEach((element) => {
        if (element.textContent.includes(this.search)) {
          element.style.display = 'block';
        } else {
          element.style.display = 'none';
        }
      });
    }

    super.update(changedProperties);
  }

  render() {
    return html` <input type="text" @input="${this.handleSearchChange}" /> `;
  }

  handleSearchChange(event) {
    this.search = event.target.value;
  }
}

customElements.define('lms-search', LMSSearch);
