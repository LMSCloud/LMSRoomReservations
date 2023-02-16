import { html } from "lit";
import LMSContainer from "../components/LMSContainer";
import { observeState } from "lit-element-state";
import RequestHandler from "../state/RequestHandler";

export default class StaffOpenHoursView extends observeState(LMSContainer) {
  constructor() {
    super();
    this.classes = ["container-fluid"];
    this._init();
  }

  async _init() {
    await this._getElements({ force: false });
  }

  async _getElements({ force }) {
    const openHours = await RequestHandler.fetchData({
      endpoint: "openHours",
      force,
    });

    if (openHours.response.status >= 200 && openHours.response.status <= 299) {
      const _openHours = openHours.data;
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

      const libraries = await RequestHandler.fetchData({
        endpoint: "libraries",
      });
      let elements = [];
      libraries.data
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
customElements.define("lms-staff-open-hours-view", StaffOpenHoursView);
