import { LitElement, html, css } from "lit";

export default class LMSEquipmentItem extends LitElement {
  static get properties() {
    return {
      equipmentid: { type: String },
      equipmentname: { type: String },
      description: { type: String },
      image: { type: String },
      maxbookabletime: { type: String },
      roomid: { type: Number },
      _rooms: { state: true },
      editable: { type: Boolean },
    };
  }

  static styles = css`
    .card {
      margin: 16px;
      padding: 16px;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
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

    span {
      font-weight: bold;
    }
  `;

  constructor() {
    super();
    this._rooms = [];
    this.editable = false;
    this._init();
  }

  async _init() {
    const response = await fetch("/api/v1/contrib/roomreservations/rooms", {
      headers: {
        Accept: "",
      },
    });
    const result = await response.json();
    this._rooms = result.map((room) => ({
      value: room.roomid,
      name: room.roomnumber,
    }));
  }

  handleEdit() {
    this.editable = true;
  }

  async handleSave() {
    this.editable = false;

    const response = await fetch(
      `/api/v1/contrib/roomreservations/equipment/${this.equipmentid}`,
      {
        method: "PUT",
        headers: {
          Accept: "",
        },
        body: JSON.stringify({
          equipmentname: this.equipmentname,
          description: this.description,
          image: this.image,
          maxbookabletime: this.maxbookabletime,
          roomid: this.roomid,
        }),
      }
    );
    const result = await response.json();

    console.log("Result: ", result);

    // Emit an event with the current property values
    const event = new CustomEvent("modified", { bubbles: true });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div class="card">
        <span>${this.equipmentid}</span>
        <label class="label">Equipmentname</label>
        <input
          type="text"
          ?disabled=${!this.editable}
          .value=${this.equipmentname}
          @input=${(e) => {
            this.equipmentname = e.target.value;
          }}
          class="input"
        />
        <label class="label">Description</label>
        <input
          type="text"
          ?disabled=${!this.editable}
          .value=${this.description}
          @input=${(e) => {
            this.description = e.target.value;
          }}
          class="input"
        />
        <label class="label">Image</label>
        <input
          type="text"
          ?disabled=${!this.editable}
          .value=${this.image}
          @input=${(e) => {
            this.image = e.target.value;
          }}
          class="input"
        />
        <label class="label">Max bookable time</label>
        <input
          type="text"
          ?disabled=${!this.editable}
          .value=${this.maxbookabletime}
          @input=${(e) => {
            this.maxbookabletime = e.target.value;
          }}
          class="input"
        />
        <label class="label" ?hidden=${!this._rooms.length}>Roomid</label>
        <select
          ?hidden=${!this._rooms.length}
          type="text"
          ?disabled=${!this.editable}
          .value=${this.roomid}
          @change=${(e) => {
            this.roomid = e.target.value;
          }}
          class="input"
        >
          <option>${this.roomid}</option>
          ${this._rooms
            .filter((room) => room.value !== this.roomid)
            .map(
              (room) =>
                html`<option value="${room.value}">${room.name}</option>`
            )}
        </select>
        <div class="buttons">
          <button class="button" @click=${this.handleEdit}>Edit</button>
          <button class="button" @click=${this.handleSave}>Save</button>
        </div>
      </div>
    `;
  }
}

customElements.define("lms-equipment-item", LMSEquipmentItem);
