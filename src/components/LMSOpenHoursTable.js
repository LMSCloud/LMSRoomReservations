import LMSTable from "./LMSTable";

export default class LMSOpenHoursTable extends LMSTable {
  static get properties() {
    return {
      data: { type: Array },
      _isEditable: { type: Boolean, attribute: false },
    };
  }

  _handleEdit(e) {
    if (this._isReady) {
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
      `/api/v1/contrib/roomreservations/open_hours/${
        this._dayConversionMap[start.name]
      }`,
      {
        method: "PUT",
        body: JSON.stringify({
          day: this._dayConversionMap[start.name],
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
  }

  _handleChange() {}

  async _init() {
    const endpoint = "/api/v1/contrib/roomreservations/open_hours";
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "",
      },
    });
    const result = await response.json();
    if (!result.length) {
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(
          Array.from({ length: 7 }, (_, i) => ({
            day: i,
            start: "00:00",
            end: "00:00",
          }))
        ),
        headers: {
          Accept: "",
        },
      });
      return response.status === 201;
    }
    return result.length > 0;
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
    this._isReady = this._init();
  }
}

customElements.define("lms-open-hours-table", LMSOpenHoursTable);
