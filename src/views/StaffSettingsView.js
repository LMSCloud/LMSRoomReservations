import { html } from "lit";
import LMSContainer from "../components/LMSContainer";

export default class StaffSettingsView extends LMSContainer {
  constructor() {
    super();
    this.classes = ["container-fluid"];
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
      <div class=${this.classes.join(" ")} @error=${this._handleError}>
        <div class="row justify-content-start">
          <div class="col">
            <lms-settings-table></lms-settings-table>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("lms-staff-settings-view", StaffSettingsView);
