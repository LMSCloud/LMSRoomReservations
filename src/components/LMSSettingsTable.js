import LMSTable from "./LMSTable";

export default class LMSSettingsTable extends LMSTable {
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
        const data = inputs
          .filter((input) => !input.checked)
          .map((input) => ({
            setting: `rcat_${input.name}`,
          }));

        const responses = [];
        data.forEach(async (datum) => {
          responses.push(
            fetch(
              `/api/v1/contrib/roomreservations/settings/${datum.setting}`,
              {
                method: "DELETE",
                headers: {
                  Accept: "",
                },
              }
            )
          );
        });

        return Promise.all(responses).then((response) =>
          response.every((res) => res.status === 204) ? 204 : 207
        );
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
              Accept: "",
            },
          }
        );
        return response.status;
      },
    };

    const category = parent.firstElementChild.textContent;
    const action = actions[category];
    const status = action
      ? await action()
      : (
          await fetch(
            `/api/v1/contrib/roomreservations/settings/${inputs[0].name}`,
            {
              method: "PUT",
              body: JSON.stringify({ value: inputs[0].value }),
              headers: {
                Accept: "",
              },
            }
          )
        ).status;

    if ([201, 204].includes(status)) {
      // Implement success message
      inputs.forEach((input) => {
        input.disabled = true;
      });
    }
  }

  constructor() {
    super();
    this._isEditable = true;
  }
}

customElements.define("lms-settings-table", LMSSettingsTable);
