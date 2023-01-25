import { LitElement, html, css } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";

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

  static styles = [
    bootstrapStyles,
    css`
      .lms-room {
        max-width: 18rem;
      }

      .lms-room-img {
        aspect-ratio: 4 / 3;
        object-fit: cover;
      }
    `,
  ];

  constructor() {
    super();
    this.editable = false;
  }

  handleEdit() {
    this.editable = true;
  }

  async handleSave() {
    this.editable = false;

    const response = await fetch(
      `/api/v1/contrib/roomreservations/rooms/${this.roomid}`,
      {
        method: "PUT",
        headers: {
          Accept: "",
        },
        body: JSON.stringify({
          maxcapacity: this.maxcapacity,
          color: this.color,
          image: this.image,
          description: this.description,
          maxbookabletime: this.maxbookabletime,
          branch: this.branch,
          roomnumber: this.roomnumber,
        }),
      }
    );

    if (response.status === 200) {
      // Emit an event with the current property values
      const event = new CustomEvent("modified", { bubbles: true });
      this.dispatchEvent(event);
    }
  }

  async handleDelete() {
    const response = await fetch(
      `/api/v1/contrib/roomreservations/rooms/${this.roomid}`,
      {
        method: "DELETE",
        headers: {
          Accept: "",
        },
      }
    );

    if (response.status === 204) {
      // Emit an event with the current property values
      const event = new CustomEvent("deleted", { bubbles: true });
      this.dispatchEvent(event);
    }
  }

  render() {
    return html`
      <div class="card lms-room">
        <img
          class="card-img-top lms-room-img"
          ?hidden=${!this.image}
          src=${this.image ?? "..."}
          alt="Image for ${this.roomnumber}"
        />
        <div class="card-body">
          <h5 class="card-title">
            <span class="badge badge-primary">${this.roomid}</span>
          </h5>
          <div class="form-group">
            <label for="roomnumber">Room Number</label>
            <input
              ?disabled=${!this.editable}
              type="text"
              .value=${this.roomnumber}
              @input=${(e) => {
                this.roomnumber = e.target.value;
              }}
              class="form-control"
              id="roomnumber"
            />
          </div>
          <div class="form-group">
            <label for="maxcapacity">Max Capacity</label>
            <input
              ?disabled=${!this.editable}
              type="text"
              .value=${this.maxcapacity}
              @input=${(e) => {
                this.maxcapacity = e.target.value;
              }}
              class="form-control"
              id="maxcapacity"
            />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <input
              ?disabled=${!this.editable}
              type="text"
              .value=${this.description}
              @input=${(e) => {
                this.description = e.target.value;
              }}
              class="form-control"
              id="description"
            />
          </div>
          <div class="form-group">
            <label for="color">Color</label>
            <input
              ?disabled=${!this.editable}
              type="color"
              .value=${this.color}
              @input=${(e) => {
                this.color = e.target.value;
              }}
              class="form-control"
              id="color"
            />
          </div>
          <div class="form-group">
            <label for="image">Image</label>
            <input
              ?disabled=${!this.editable}
              type="text"
              .value=${this.image}
              @input=${(e) => {
                this.image = e.target.value;
              }}
              class="form-control"
              id="image"
            />
          </div>
          <div class="form-group">
            <label for="branch">Branch</label>
            <input
              ?disabled=${!this.editable}
              type="text"
              .value=${this.branch}
              @input=${(e) => {
                this.branch = e.target.value;
              }}
              class="form-control"
              id="branch"
            />
          </div>
          <div class="form-group">
            <label for="maxbookabletime">Max Bookable Time</label>
            <input
              ?disabled=${!this.editable}
              type="number"
              .value=${this.maxbookabletime}
              @input=${(e) => {
                this.maxbookabletime = e.target.value;
              }}
              class="form-control"
              id="maxbookabletime"
            />
          </div>
          <button @click=${this.handleEdit} class="btn btn-dark">Edit</button>
          <button @click=${this.handleSave} class="btn btn-dark">Save</button>
          <button @click=${this.handleDelete} class="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define("lms-room", LMSRoom);
