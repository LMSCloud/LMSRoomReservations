import { html } from "lit";
import LMSContainer from "../components/LMSContainer";
import { observeState } from "lit-element-state";
import RequestHandler from "../state/RequestHandler";

export default class StaffBookingsView extends observeState(LMSContainer) {
  constructor() {
    super();
    this.classes = ["container-fluid"];
    this._init();
  }

  async _init() {
    await this._getElements({ force: false });
  }

  async _getElements({ force }) {
    const { response, data } = await RequestHandler.fetchData({
      endpoint: "bookings",
      force,
    });

    if (response.status === 200) {
      const lmsBookingsTable = document.createElement("lms-bookings-table", {
        is: "lms-bookings-table",
      });
      lmsBookingsTable.setAttribute("data", JSON.stringify(data));
      this._elements = [lmsBookingsTable];
    }
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
        @error=${this._handleError}
      >
        <div class="row justify-content-start">
          ${this._elements?.map(
            (element) => html`<div class="col">${element}</div>`
          )}
        </div>
        <lms-bookings-modal></lms-bookings-modal>
      </div>
    `;
  }
}
customElements.define("lms-staff-bookings-view", StaffBookingsView);
