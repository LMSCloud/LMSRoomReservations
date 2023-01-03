import { LitElement, html, css } from 'lit';

export default class LMSEquipmentItem extends LitElement {
  static get properties() {
    return {
      equipmentid: { type: String },
      equipmentname: { type: String },
      editable: { type: Boolean },
    };
  }

  static styles = css`
    .pill {
      padding: 0.5em 1em;
      border-radius: 20px;
      background-color: #333;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1em;
    }

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
      background-color: #fff;
    }

    .button {
      display: inline-block;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: #555;
      color: #fff;
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
    const event = new CustomEvent('modified', { bubbles: true });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div class="pill">
        <label class="label">${this.equipmentid}</label>
        <input
          type="text"
          ?disabled=${!this.editable}
          .value=${this.equipmentname}
          @input=${(e) => { this.equipmentname = e.target.value; }}
          class="input"
        />
        <button @click=${this.handleEdit} class="button">Edit</button>
        <button @click=${this.handleSave} class="button">Save</button>
      </div>
    `;
  }
}

customElements.define('lms-equipment-item', LMSEquipmentItem);
