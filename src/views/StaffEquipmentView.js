import { html } from "lit";
import LMSContainer from "../components/LMSContainer";

export default class StaffEquipmentView extends LMSContainer {
  constructor() {
    super();
    this._endpoint = "/api/v1/contrib/roomreservations/equipment";
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
      this._elements = result.map((equipmentItem) => {
        const lmsEquipmentItem = document.createElement("lms-equipment-item", {
          is: "lms-equipment-item",
        });
        Object.keys(equipmentItem).forEach((key) => {
          lmsEquipmentItem.setAttribute(key, equipmentItem[key]);
        });
        return lmsEquipmentItem;
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
        <div class="row justify-content-start">
          ${this._elements?.map(
            (element) =>
              html`<div
                class="col-xl-2 col-lg-3 col-lg-2 col-md-4 col-sm-6 col-xs-12"
              >
                ${element}
              </div>`
          )}
        </div>
        <lms-equipment-modal></lms-equipment-modal>
      </div>
    `;
  }
}
customElements.define("lms-staff-equipment-view", StaffEquipmentView);
