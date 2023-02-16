import { html } from "lit";
import LMSContainer from "../components/LMSContainer";
import { observeState } from "lit-element-state";
import RequestHandler from "../state/RequestHandler";

export default class StaffBookingsView extends observeState(LMSContainer) {
  static get properties() {
    return {
      _lmsBookingsTableRef: { type: Object },
      _confirmationModal: { type: Object },
    };
  }

  constructor() {
    super();
    this.classes = ["container-fluid"];
    this._lmsBookingsTableRef = undefined;
    this._confirmationModal = {
      message: "",
      isOpen: false,
      callback: () => {
        console.info("This callback wasn't implemented");
      },
    };
    this._init();
  }

  async _init() {
    await this._getElements({ force: false });
    this._lmsBookingsTableRef =
      this.renderRoot.querySelector("lms-bookings-table");
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

  _handleCreated() {
    this._getElements({ force: true });
  }

  _handleConfirmAction(e) {
    const { id, endpoint, action, callback } = e.detail;
    this._confirmationModal = {
      message: html`<p>${endpoint}: ${action} #${id}?</p>`,
      isOpen: true,
      callback,
    };
  }

  _handleAbort() {
    this._confirmationModal = {
      message: "",
      isOpen: false,
      callback: () => {
        console.info("This callback wasn't implemented");
      },
    };
  }

  _handleConfirm() {
    this._confirmationModal.callback();
    this._confirmationModal = {
      message: "",
      isOpen: false,
      callback: () => {
        console.info("This callback wasn't implemented");
      },
    };
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
        @error=${this._handleError}
        @confirm-action=${this._handleConfirmAction}
        @abort=${this._handleAbort}
        @confirm=${this._handleConfirm}
      >
        <div class="row justify-content-start">
          ${this._elements?.map(
            (element) => html`<div class="col">${element}</div>`
          )}
        </div>
        <lms-bookings-modal></lms-bookings-modal>
        <lms-confirmation-modal
          .isOpen=${this._confirmationModal.isOpen}
          .message=${this._confirmationModal.message}
        ></lms-confirmation-modal>
      </div>
    `;
  }
}
customElements.define("lms-staff-bookings-view", StaffBookingsView);
