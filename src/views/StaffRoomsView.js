import { html } from "lit";
import { LMSContainer } from "../components/LMSContainer";

export default class StaffRoomsView extends LMSContainer {
  constructor() {
    super();
    this._endpoint = "/api/v1/contrib/roomreservations/rooms";
    this.classes = ["container-fluid"];
    this._init();
  }

  async _init() {
    await this._getElements();
  }

  async _getElements() {
    const response = await fetch(this._endpoint);
    const result = await response.json();

    if (response.status === 200) {
      this._elements = result.map((room) => {
        const lmsRoom = document.createElement("lms-room", { is: "lms-room" });
        Object.keys(room).forEach((key) => {
          lmsRoom.setAttribute(key, room[key]);
        });
        return lmsRoom;
      });
    }
  }

  _handleCreated() {
    this._getElements();
  }

  _handleModified() {
    this._getElements();
  }

  _handleDeleted() {
    this._getElements();
  }

  _handleError(e) {
    const { errors, status } = e.detail;
    const element = document.createElement("lms-toast", { is: "lms-toast" });
    element.setAttribute("heading", status);
    element.setAttribute(
      "message",
      errors.reduce(
        (acc, { message, path }, idx) =>
          `${acc} message: ${message} path: ${path} ${idx > 0 ? "& " : ""}`,
        ""
      )
    );
    this.renderRoot.appendChild(element);
  }

  render() {
    return html`
      <div
        class=${this.classes.join(" ")}
        @created=${this._handleCreated}
        @modified=${this._handleModified}
        @deleted=${this._handleDeleted}
        @error=${this._handleError}
      >
        <div class="row">
          ${this._elements?.map(
            (element) =>
              html`<div
                class="col-xl-2 col-lg-3 col-lg-2 col-md-4 col-sm-6 col-xs-12"
              >
                ${element}
              </div>`
          )}
        </div>
        <lms-room-modal></lms-room-modal>
      </div>
    `;
  }
}
customElements.define("lms-staff-rooms-view", StaffRoomsView);
