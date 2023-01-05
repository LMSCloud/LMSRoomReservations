import LMSTable from "./LMSTable";

export default class LMSBookingsTable extends LMSTable {
  static get properties() {
    return {
      data: { type: Array },
      _isEditable: { type: Boolean, attribute: false },
    };
  }

  _handleEdit(e) {
    let parent = e.target.parentElement;
    while (parent.tagName !== "TR") {
      parent = parent.parentElement;
    }

    const inputs = parent.querySelectorAll("input");
    inputs.forEach((input) => {
      input.disabled = false;
    });
  }

  async _handleSave(e) {
    let parent = e.target.parentElement;
    while (parent.tagName !== "TR") {
      parent = parent.parentElement;
    }

    const inputs = Array.from(parent.querySelectorAll("input"));
    const actions = {
      restricted_patron_categories: () => {
        const data = inputs.filter((input) => !input.checked);
      },
      patron_categories: async () => {
        const data = inputs
          .filter((input) => input.checked)
          .map((input) => ({
            setting: `rcat_${input.name}`,
            value: input.name,
          }));

        const response = await fetch(
          "/api/v1/contrib/roomreservations/settings",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              'Accept': '',
            },
          }
        );
        return response.status;
      },
    };

    if (inputs.length > 1) {
      const category = parent.firstElementChild.textContent;
      if (inputs.every((input) => input.type === "checkbox")) {
        const action = actions[category];
        if (action) {
          const status = await action();
          if ([201, 204].includes(status)) {
            // Implement success message
            inputs.forEach((input) => {
              input.disabled = true;
            });
          }
        }
      }
      return;
    }

    const [input] = inputs;
    const response = await fetch(
      `/api/v1/contrib/roomreservations/settings/${input.name}`,
      {
        method: "PUT",
        body: JSON.stringify({ value: input.value }),
        headers: {
          'Accept': '',
        },
      }
    );

    if (response.status === 201) {
      // Implement success message
      input.disabled = true;
    }
  }

  _handleChange() {}

  constructor() {
    super();
    this._isEditable = true;
  }
}

customElements.define("lms-bookings-table", LMSBookingsTable);
