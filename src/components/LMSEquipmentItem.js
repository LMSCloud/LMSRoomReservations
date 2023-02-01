import { LitElement, html, css } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";

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

  static styles = [
    bootstrapStyles,
    css`
      .lms-equipment-item {
        max-width: 18rem;
      }

      .lms-equipment-item-img {
        aspect-ratio: 4 / 3;
        object-fit: cover;
      }
    `,
  ];

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
        /** We need to filter properties from the payload the are null
         *  because the backend set NULL by default on non-supplied args */
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries({
              equipmentname: this.equipmentname,
              description: this.description,
              image: this.image,
              maxbookabletime: this.maxbookabletime,
              roomid: this.roomid,
            }).filter(([, value]) => !["", null, "null"].includes(value))
          )
        ),
      }
    );

    if ([200, 201].includes(response.status)) {
      // Emit an event with the current property values
      const event = new CustomEvent("modified", { bubbles: true });
      this.dispatchEvent(event);
    }
  }

  async handleDelete() {
    const response = await fetch(
      `/api/v1/contrib/roomreservations/equipment/${this.equipmentid}`,
      {
        method: "DELETE",
        headers: {
          Accept: "",
        },
      }
    );

    if (response.status === 204) {
      // Emit an event with the current property values
      const event = new CustomEvent("modified", { bubbles: true });
      this.dispatchEvent(event);
    }
  }

  render() {
    return html`
      <div class="card lms-equipment-item">
        <img
          class="card-img-top lms-equipment-item-img"
          ?hidden=${!this.image}
          src="${this.image ?? "..."}"
          alt="Image for ${this.equipmentname}"
        />
        <div class="card-body">
          <h5 class="card-title">
            <span class="badge badge-primary">${this.equipmentid}</span>
          </h5>
          <div class="form-group">
            <label for="name">Equipmentname</label>
            <input
              type="text"
              ?disabled=${!this.editable}
              .value=${this.equipmentname}
              @input=${(e) => {
                this.equipmentname = e.target.value;
              }}
              class="form-control"
              id="name"
            />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <input
              type="text"
              ?disabled=${!this.editable}
              .value=${this.description.match(/^null$/i)
                ? null
                : this.description ?? ""}
              @input=${(e) => {
                this.description = e.target.value;
              }}
              class="form-control"
              id="description"
            />
          </div>
          <div class="form-group">
            <label for="image">Image</label>
            <input
              type="text"
              ?disabled=${!this.editable}
              .value=${this.image.match(/^null$/i) ? null : this.image ?? ""}
              @input=${(e) => {
                this.image = e.target.value;
              }}
              class="form-control"
              id="image"
            />
          </div>
          <div class="form-group">
            <label for="maxbookabletime">Max bookable time</label>
            <input
              type="text"
              ?disabled=${!this.editable}
              .value=${this.maxbookabletime.match(/^null$/i)
                ? null
                : this.maxbookabletime ?? ""}
              @input=${(e) => {
                this.maxbookabletime = e.target.value;
              }}
              class="form-control"
              id="maxbookabletime"
            />
          </div>
          <div class="form-group" ?hidden=${!this._rooms.length}>
            <label for="roomid">Roomid</label>
            <select
              ?disabled=${!this.editable}
              @change=${(e) => {
                this.roomid = e.target.value === "No room associated" ? null : e.target.value;
              }}
              class="form-control"
              id="roomid"
            >
              ${this._rooms.map(
                (room) =>
                  html`<option
                    ?selected=${room.value == this.roomid}
                    value="${room.value}"
                  >
                    ${room.name}
                  </option>`
              )}
              <option ?selected=${!this.roomid}>No room associated</option>
            </select>
          </div>
          <button class="btn btn-dark" @click=${this.handleEdit}>Edit</button>
          <button class="btn btn-dark" @click=${this.handleSave}>Save</button>
          <button class="btn btn-danger" @click=${this.handleDelete}>
            Delete
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define("lms-equipment-item", LMSEquipmentItem);
