import { html } from "lit";
import { LMSContainer } from "../components/LMSContainer";

export default class StaffBookingsView extends LMSContainer {
  constructor() {
    super();
    this._endpoint = "/api/v1/contrib/roomreservations/bookings";
    this.classes = ["container-fluid"];
    this._init();
  }

  async _init() {
    await this._getElements();
  }

  async _getElements() {
    const response = await fetch(this._endpoint, { headers: { Accept: "" } });
    const result = await response.json();

    if (response.status === 200) {
      const lmsBookingsTable = document.createElement("lms-bookings-table", {
        is: "lms-bookings-table",
      });
      lmsBookingsTable.setAttribute("data", JSON.stringify(result));
      this._elements = [lmsBookingsTable];
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
customElements.define(
  "lms-staff-bookings-view",
  StaffBookingsView
);
