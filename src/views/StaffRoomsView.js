import { html } from "lit";
import LMSContainer from "../components/LMSContainer";
import { observeState } from "lit-element-state";
import RequestHandler from "../state/RequestHandler";

export default class StaffRoomsView extends observeState(LMSContainer) {
  constructor() {
    super();
    this.classes = ["container-fluid"];
    this._init();
  }

  async _init() {
    await this._getElements({ force: false });
  }

  async _getElements({ force }) {
    const [roomsResponse, librariesResponse] = await Promise.all([
      RequestHandler.fetchData({
        endpoint: "rooms",
        force,
      }),
      RequestHandler.fetchData({
        endpoint: "libraries",
      }),
    ]);
    const rooms = roomsResponse.data;
    let libraries = librariesResponse.data;
    libraries = libraries.map((library) => ({
      value: library.library_id,
      name: library.name,
    }));

    if (
      [roomsResponse.response, librariesResponse.response].every(
        ({ status }) => status === 200
      )
    ) {
      this._elements = rooms.map((room) => {
        const _room = { ...room, libraries };
        const lmsRoom = document.createElement("lms-room", { is: "lms-room" });
        Object.keys(_room).forEach((key) => {
          lmsRoom.setAttribute(
            key,
            _room[key] instanceof Array
              ? JSON.stringify(_room[key])
              : _room[key]
          );
        });
        return lmsRoom;
      });
    }
  }

  _handleCreated() {
    this._getElements({ force: true });
  }

  _handleModified() {
    this._getElements({ force: true });
  }

  _handleDeleted() {
    this._getElements({ force: true });
  }

  _handleError(e) {
    const { errors, status } = e.detail;
    const element = document.createElement("lms-toast", { is: "lms-toast" });
    element.setAttribute("heading", status);
    element.setAttribute(
      "message",
      errors instanceof Array
        ? errors.reduce(
            (acc, { message, path }, idx) =>
              `${acc} message: ${message} path: ${path} ${idx > 0 ? "& " : ""}`,
            ""
          )
        : errors
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
