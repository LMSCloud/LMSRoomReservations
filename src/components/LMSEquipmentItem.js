import { LitElement, html, css, nothing } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import { faEdit, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import TranslationHandler from "../lib/TranslationHandler.js";
export default class LMSEquipmentItem extends LitElement {
  static get properties() {
    return {
      equipmentid: { type: String },
      equipmentname: { type: String },
      description: { type: String },
      image: { type: String },
      maxbookabletime: { type: String },
      roomid: { type: Number },
      editable: { type: Boolean },
      _rooms: { state: true },
      _i18n: { state: true },
    };
  }

  static styles = [
    bootstrapStyles,
    css`
      .lms-equipment-item {
        max-width: 24rem;
      }

      .lms-equipment-item-img {
        aspect-ratio: 4 / 3;
        object-fit: cover;
      }

      svg {
        display: inline-block;
        width: 1em;
        height: 1em;
        color: #ffffff;
      }

      button {
        white-space: nowrap;
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
    const translationHandler = new TranslationHandler();
    await translationHandler.loadTranslations();
    this._i18n = translationHandler.i18n;

    const response = await fetch("/api/v1/contrib/roomreservations/rooms");
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
    const response = await fetch(
      `/api/v1/contrib/roomreservations/equipment/${this.equipmentid}`,
      {
        method: "PUT",
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
      this.editable = false;
    }

    if (response.status >= 400) {
      const error = await response.json();
      const event = new CustomEvent("error", { bubbles: true, detail: error });
      this.dispatchEvent(event);
    }
  }

  async handleDelete() {
    const response = await fetch(
      `/api/v1/contrib/roomreservations/equipment/${this.equipmentid}`,
      { method: "DELETE" }
    );

    if (response.status === 204) {
      // Emit an event with the current property values
      const event = new CustomEvent("modified", { bubbles: true });
      this.dispatchEvent(event);
    }
  }

  render() {
    return !this._i18n?.gettext
      ? nothing
      : html`
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
                <label for="name">${this._i18n.gettext("Equipmentname")}</label>
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
                <label for="description"
                  >${this._i18n.gettext("Description")}</label
                >
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
                <label for="image">${this._i18n.gettext("Image")}</label>
                <input
                  type="text"
                  ?disabled=${!this.editable}
                  .value=${this.image.match(/^null$/i)
                    ? null
                    : this.image ?? ""}
                  @input=${(e) => {
                    this.image = e.target.value;
                  }}
                  class="form-control"
                  id="image"
                />
              </div>
              <div class="form-group">
                <label for="maxbookabletime"
                  >${this._i18n.gettext("Max bookable time")}</label
                >
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
                <label for="roomid">${this._i18n.gettext("Roomid")}</label>
                <select
                  ?disabled=${!this.editable}
                  @change=${(e) => {
                    this.roomid =
                      e.target.value === "No room associated"
                        ? null
                        : e.target.value;
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
                  <option ?selected=${!this.roomid}>
                    ${this._i18n.gettext("No room associated")}
                  </option>
                </select>
              </div>
              <div class="d-flex justify-content-between">
                <button class="btn btn-dark" @click=${this.handleEdit}>
                  ${litFontawesome(faEdit)}
                  <span>${this._i18n.gettext("Edit")}</span>
                </button>
                <button class="btn btn-dark" @click=${this.handleSave}>
                  ${litFontawesome(faSave)}
                  <span>${this._i18n.gettext("Save")}</span>
                </button>
                <button class="btn btn-danger" @click=${this.handleDelete}>
                  ${litFontawesome(faTrash)}
                  <span>${this._i18n.gettext("Delete")}</span>
                </button>
              </div>
            </div>
          </div>
        `;
  }
}

customElements.define("lms-equipment-item", LMSEquipmentItem);
