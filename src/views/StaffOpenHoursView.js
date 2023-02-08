import { html } from "lit";
import { LMSContainer } from "../components/LMSContainer";

export default class StaffOpenHoursView extends LMSContainer {
  constructor() {
    super();
    this._endpoint = "/api/v1/contrib/roomreservations/public/open_hours";
    this.classes = ["container-fluid"];
    this._init();
  }

  async _init() {
    await this._getElements();
  }

  async _getElements() {
    const openHours = await fetch(this._endpoint);

    if (openHours.status === 200) {
      const _openHours = await openHours.json();
      if (_openHours.length) {
        const groupedResult = this._groupBy(_openHours, (item) => item.branch);
        let elements = [];
        Array.from(Object.entries(groupedResult)).forEach(([branch, data]) => {
          const lmsOpenHoursTable = document.createElement(
            "lms-open-hours-table",
            {
              is: "lms-open-hours-table",
            }
          );
          lmsOpenHoursTable.setAttribute("branch", branch);
          lmsOpenHoursTable.setAttribute("data", JSON.stringify(data));
          elements.push(lmsOpenHoursTable);
        });
        this._elements = elements;
        return;
      }

      const libraries = await fetch("/api/v1/libraries");
      const _libraries = await libraries.json();
      let elements = [];
      _libraries
        .map((library) => ({
          branch: library.library_id,
        }))
        .forEach(({ branch }) => {
          const lmsOpenHoursTable = document.createElement(
            "lms-open-hours-table",
            {
              is: "lms-open-hours-table",
            }
          );
          lmsOpenHoursTable.setAttribute("branch", branch);
          elements.push(lmsOpenHoursTable);
        });
      this._elements = elements;
    }
  }

  _groupBy(array, predicate) {
    return array.reduce((acc, value, index, array) => {
      (acc[predicate(value, index, array)] ||= []).push(value);
      return acc;
    }, {});
  }

  render() {
    return html`
      <div class=${this.classes.join(" ")}>
        <div class="row justify-content-start">
          ${this._elements?.map(
            (element) => html`<div class="col">${element}</div>`
          )}
        </div>
      </div>
    `;
  }
}
customElements.define(
  "lms-staff-open-hours-view",
  StaffOpenHoursView
);
