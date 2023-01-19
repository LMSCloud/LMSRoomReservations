import { LitElement, html, css } from 'lit';

export default class LMSRoom extends LitElement {
  static get properties() {
    return {
      maxcapacity: { type: String },
      color: { type: String },
      image: { type: String },
      description: { type: String },
      maxbookabletime: { type: String },
      roomid: { type: String },
      branch: { type: String },
      roomnumber: { type: String },
      editable: { type: Boolean },
    };
  }

  static styles = css`
    .card {
      margin: 16px;
      padding: 16px;
      box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
      border-radius: 4px;
      background-color: var(--background-color);
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

    .p-0 {
      padding: 0;
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
      <div class="card w-0">
        <label class="label">Room ID</label>
        <input disabled type="text" .value=${this.roomid} class="input" />
        <label class="label">Room Number</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.roomnumber}
          @input=${(e) => { this.roomnumber = e.target.value; }}
          class="input"
        />
        <label class="label">Max Capacity</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.maxcapacity}
          @input=${(e) => { this.maxcapacity = e.target.value; }}
          class="input"
        />
        <label class="label">Description</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.description}
          @input=${(e) => { this.description = e.target.value; }}
          class="input"
        />
        <label class="label">Color</label>
        <input
          ?disabled=${!this.editable}
          type="color"
          .value=${this.color}
          @input=${(e) => { this.color = e.target.value; }}
          class="input p-0"
        />
        <label class="label">Image</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.image}
          @input=${(e) => { this.image = e.target.value; }}
          class="input"
        />
        <label class="label">Branch</label>
        <input
          ?disabled=${!this.editable}
          type="text"
          .value=${this.branch}
          @input=${(e) => { this.branch = e.target.value; }}
          class="input"
        />
        <label class="label">Max Bookable Time</label>
        <input
          ?disabled=${!this.editable}
          type="number"
          .value=${this.maxbookabletime}
          @input=${(e) => { this.maxbookabletime = e.target.value; }}
          class="input"
        />
        <div class="buttons">
          <button @click=${this.handleEdit} class="button">Edit</button>
          <button @click=${this.handleSave} class="button">Save</button>
        </div>
      </div>
    `;
  }
}

customElements.define('lms-room', LMSRoom);
