import LMSTable from "./LMSTable";

export default class LMSSettingsTable extends LMSTable {
  static get properties() {
    return {
      data: { type: Array },
      _isEditable: { type: Boolean, attribute: false },
    };
  }

  async _getData() {
    const response = await fetch("/api/v1/contrib/roomreservations/settings", {
      headers: {
        Accept: "",
      },
    });

    const result = await response.json();

    let order = ["setting", "value", "description"];
    this.data = result
      .map((setting) => ({
        ...setting,
        value: this._getFieldMarkup(setting),
      }))
      .map((obj) => {
        const { type, ...setting } = obj;
        return setting;
      })
      .map((obj) =>
        Object.fromEntries(
          Object.entries(obj).sort(
            ([a], [b]) => order.indexOf(a) - order.indexOf(b)
          )
        )
      );
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
      restricted_patron_categories: async () => {
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

        const response = await Promise.all(responses);
        return response.every((res) => res.status === 204) ? 204 : 207;
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
    const [input] = inputs;
    const status = action
      ? await action()
      : (
          await fetch(
            `/api/v1/contrib/roomreservations/settings/${input.name}`,
            {
              method: "PUT",
              body: JSON.stringify({ value: input.value }),
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

      this.data = this._getData();
    }
  }

  constructor() {
    super();
    this._isEditable = true;
    this._getData();
  }

  _getFieldMarkup(field) {
    if (["number", "string"].includes(field.type)) {
      return `<input
        class="input"
        type="${field.type}"
        name="${field.setting}"
        value="${field.value}"
        disabled
      />`;
    }

    if (field.type === "array") {
      return field.value.reduce(
        (accumulator, category) => `${accumulator}
          <label class="checkbox">
            <input
              type="checkbox"
              name="${category.categorycode}"
              ${field.setting === "restricted_patron_categories" && "checked"}
              disabled
            />
            ${category.description}
          </label> `,
        ""
      );
    }
  }
}

customElements.define("lms-settings-table", LMSSettingsTable);
