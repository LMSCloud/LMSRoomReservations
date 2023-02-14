import { LitElement, html, css, nothing } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import { faEdit, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import TranslationHandler from "../lib/TranslationHandler.js";
import { observeState } from "lit-element-state";
import RequestHandler from "../state/RequestHandler.js";

export default class LMSRoom extends observeState(LitElement) {
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
      libraries: { type: Array },
      editable: { type: Boolean },
      _i18n: { state: true },
    };
  }

  static styles = [
    bootstrapStyles,
    css`
      .lms-room {
        max-width: 24rem;
      }

      .lms-room-img {
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

  async _init() {
    const translationHandler = new TranslationHandler();
    await translationHandler.loadTranslations();
    this._i18n = translationHandler.i18n;
  }

  constructor() {
    super();
    this.editable = false;
    this._i18n = undefined;
    this._init();
  }

  handleEdit() {
    this.editable = true;
  }

  async handleSave() {
    const { response } = await RequestHandler.updateData({
      id: this.roomid,
      endpoint: "rooms",
      data: {
        maxcapacity: this.maxcapacity,
        color: this.color,
        image: this.image,
        description: this.description,
        maxbookabletime: this.maxbookabletime,
        branch: this.branch,
        roomnumber: this.roomnumber,
      },
    });

    if (response.status === 200) {
      // Emit an event with the current property values
      const event = new CustomEvent("modified", { bubbles: true });
      this.dispatchEvent(event);
      this.editable = false;
      return;
    }

    if (response.status >= 400) {
      const result = await response.json();
      const event = new CustomEvent("error", {
        bubbles: true,
        detail: { errors: result.error, status: response.status },
      });
      this.dispatchEvent(event);
    }
  }

  async handleDelete() {
    const { response } = await RequestHandler.deleteData({
      id: this.roomid,
      endpoint: "rooms",
    });

    if (response.status === 204) {
      // Emit an event with the current property values
      const event = new CustomEvent("deleted", { bubbles: true });
      this.dispatchEvent(event);
    }
  }

  render() {
    return !this._i18n?.gettext
      ? nothing
      : html`
          <div class="card lms-room my-1">
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
                <label for="roomnumber">${this._i18n.gettext(
                  "Room Number"
                )}</label>
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
                <label for="maxcapacity"></label>${this._i18n.gettext(
                  "Max Capacity"
                )}</label>
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
                <label for="description">${this._i18n.gettext(
                  "Description"
                )}</label>
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
                <label for="color">${this._i18n.gettext("Color")}</label>
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
                <label for="image">${this._i18n.gettext("Image")}</label>
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
                <label for="branch">${this._i18n.gettext("Branch")}</label>
                <select
                  ?disabled=${!this.editable}
                  @change=${(e) => {
                    this.branch = e.target.value;
                  }}
                  class="form-control"
                  id="branch"
                >
                  ${this.libraries?.map(
                    (library) =>
                      html`<option
                        value=${library.value}
                        ?selected=${this.branch === library.value}
                      >
                        ${library.name}
                      </option>`
                  )}
              </select>
              </div>
              <div class="form-group">
                <label for="maxbookabletime">${this._i18n.gettext(
                  "Max Bookable Time"
                )}</label>
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
              <div class="d-flex flex-column">
                <button @click=${this.handleEdit} class="btn btn-dark my-1">
                  ${litFontawesome(faEdit)}  
                  <span>${this._i18n.gettext("Edit")}</span>
                </button>
                <button @click=${this.handleSave} class="btn btn-dark my-1">
                  ${litFontawesome(faSave)}  
                  <span>${this._i18n.gettext("Save")}</span>
                </button>
                <button @click=${this.handleDelete} class="btn btn-danger my-1">
                  ${litFontawesome(faTrash)}
                  <span>${this._i18n.gettext("Delete")}</span>
                </button>
              </div>
            </div>
          </div>
        `;
  }
}

customElements.define("lms-room", LMSRoom);
