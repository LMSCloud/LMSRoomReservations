import { html } from "lit";
import LMSTable from "./LMSTable";

export default class LMSOpenHoursTable extends LMSTable {
  static get properties() {
    return {
      data: {
        type: Array,
        convert: (value) => JSON.parse(value),
      },
      branch: { type: String },
      _isEditable: { type: Boolean, attribute: false },
    };
  }

  _handleEdit(e) {
    if (this._isSetup) {
      let parent = e.target.parentElement;
      while (parent.tagName !== "TR") {
        parent = parent.parentElement;
      }

      const inputs = parent.querySelectorAll("input");
      inputs.forEach((input) => {
        input.disabled = false;
      });
    }
  }

  async _handleSave(e) {
    let parent = e.target.parentElement;
    while (parent.tagName !== "TR") {
      parent = parent.parentElement;
    }

    const inputs = Array.from(parent.querySelectorAll("input"));
    const [start, end] = inputs;
    const response = await fetch(
      `/api/v1/contrib/roomreservations/open_hours/${this.branch}/${
        this._dayConversionMap[start.name]
      }`,
      {
        method: "PUT",
        body: JSON.stringify({
          start: start.value,
          end: end.value,
        }),
        headers: {
          Accept: "",
        },
      }
    );

    if (response.status === 201) {
      // Implement success message
      [start, end].forEach((input) => (input.disabled = true));
    }

    if (response.status >= 400) {
      const result = await response.json();
      this._renderToast(response.status, result);
    }
  }

  async _setup() {
    const endpoint = "/api/v1/contrib/roomreservations/open_hours";
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "",
      },
    });
    const result = await response.json();

    const branchResult = result.filter((entry) => entry.branch === this.branch);
    if (!branchResult.length) {
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(
          Array.from({ length: 7 }, (_, i) => ({
            branch: this.branch,
            day: i,
            start: "00:00",
            end: "00:00",
          }))
        ),
        headers: {
          Accept: "",
        },
      });

      this._isSetup = response.status === 201;
      if (this._isSetup) {
        const data = await this._getData();
        this.data = this._init(data);
      }
      return;
    }

    this._isSetup = true;
  }

  _init(data) {
    return (
      data?.map((datum) => {
        const { day, start, end } = datum;
        const weekday = Object.keys(this._dayConversionMap)[day];
        return {
          day: html`${weekday}`,
          start: html`<input
            class="form-control"
            type="time"
            name="${weekday}"
            value="${start}"
            disabled
          />`,
          end: html`<input
            class="form-control"
            type="time"
            name="${weekday}"
            value="${end}"
            disabled
          />`,
        };
      }) ?? []
    );
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.data?.length) {
      this.data = this._init(this.data);
    }
  }

  render() {
    return html`
      <h4><span class="badge badge-secondary">${this.branch}</span></h4>
      ${super.render()}
    `;
  }

  constructor() {
    super();
    this._isEditable = true;
    this._dayConversionMap = {
      monday: 0,
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
      saturday: 5,
      sunday: 6,
    };
    this._isSetup = false;
    this._setup();
  }

  async _getData() {
    const endpoint = "/api/v1/contrib/roomreservations/open_hours";
    const options = {
      headers: {
        Accept: "",
      },
    };
    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (result.length) {
      const groupedResult = this._groupBy(result, (item) => item.branch);
      console.log(groupedResult);
      return groupedResult[this.branch];
    }
  }

  _groupBy(array, predicate) {
    return array.reduce((acc, value, index, array) => {
      (acc[predicate(value, index, array)] ||= []).push(value);
      return acc;
    }, {});
  }
}

customElements.define("lms-open-hours-table", LMSOpenHoursTable);
