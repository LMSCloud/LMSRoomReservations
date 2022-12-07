import { html, css, LitElement } from 'lit';

export default class LMSMenu extends LitElement {
  static get properties() {
    return {
      items: { type: Array },
      showForm: { type: Boolean },
      formVariables: { type: Object },
    };
  }

  static styles = css`
    .lmsr-menu {
      grid-row: 2;
      grid-column: 1/2;
      margin: 0.5em 0.8em;
    }

    .lmsr-menu-list {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }

    .lmsr-menu-list-heading {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      padding: 0.5em 0;
      list-style-type: none;
    }

    .lmsr-menu-list-item {
      list-style-type: none;
    }

    .lmsr-menu-list-item {
      color: #004d99;
    }

    .lmsr-menu-list-item:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  `;

  render() {
    const { items, showForm, formVariables } = this;

    return html`
      <div class="lmsr-menu">
        <ol class="lmsr-menu-list">
          <li class="lmsr-menu-list-heading">Menu</li>
          ${items.map(
    (item) => html`
              <li class="lmsr-menu-list-item" data-value="${item.value}">
                ${item.text}
              </li>
            `,
  )}
        </ol>
      </div>
      ${showForm
    ? html`
            <form name="config_actions" method="post" action="#">
              <input type="hidden" name="class" value="${formVariables.class}" />
              <input type="hidden" name="method" value="${formVariables.method}" />
              <input type="hidden" name="op" value="" />
              <input
                type="submit"
                name="config-actions-submit"
                value="${formVariables.value}"
                class="lmsr-menu-input"
              />
            </form>
          `
    : ''}
    `;
  }
}

customElements.define('lms-menu', LMSMenu);

/* Usage
const items = [
  {
    text: '[% 'Display rooms' | gettext %]',
    value: 'display-rooms',
  },
  {
    text: '[% 'Add room' | gettext %]',
    value: 'add-rooms',
  },
  // ...
];

<lmsr-menu .items=${items} showForm />
*/
