import { LitElement, html, css } from "lit";

export default class LMSEquipmentItem extends LitElement {
  static get properties() {
    return {
      equipmentid: { type: String },
      equipmentname: { type: String },
      editable: { type: Boolean },
    };
  }

  static styles = css`
    div {
      padding: 1em;
      border: 1px solid var(--seperator-light);
      border-radius: var(--border-radius-md);
      width: max-content;
      background-color: var(--background-color);
    }

    span {
      font-weight: bold;
    }

    button {
      border: 2px solid rgb(51, 51, 51);
      border-radius: 3px;
      background-color: rgb(51, 51, 51);
      color: rgb(255, 255, 255);
      cursor: pointer;
    }
  `;

  constructor() {
    super();
    this.editable = false;
  }

  handleEdit() {
    this.editable = true;
  }

  handleSave() {
    this.editable = false;
    // Emit an event with the current property values
    const event = new CustomEvent("modified", { bubbles: true });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div>
        <span>${this.equipmentid}</span>
        <input
          type="text"
          ?disabled=${!this.editable}
          .value=${this.equipmentname}
          @input=${(e) => {
            this.equipmentname = e.target.value;
          }}
          class="input"
        />
        <button @click=${this.handleEdit}>
          Edit
        </button>
        <button @click=${this.handleSave}>
          Save
        </button>
      </div>
    `;
  }
}

customElements.define("lms-equipment-item", LMSEquipmentItem);
