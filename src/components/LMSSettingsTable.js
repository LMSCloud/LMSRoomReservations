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
        // eslint-disable-next-line no-unused-vars
        const { placeholder, type, ...setting } = obj;
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
        return {...response, status: response.every((res) => res.status === 204) ? 204 : 207 };
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
        return response;
      },
    };

    const category = parent.firstElementChild.textContent;
    const action = actions[category];
    const [input] = inputs;
    const response = action
      ? await action()
      : await fetch(`/api/v1/contrib/roomreservations/settings/${input.name}`, {
          method: "PUT",
          body: JSON.stringify({ value: input.value }),
          headers: {
            Accept: "",
          },
        });

    if ([201, 204].includes(response.status)) {
      // Implement success message
      inputs.forEach((input) => {
        input.disabled = true;
      });

      this.data = this._getData();
    }

    if (response.status >= 400) {
      const result = await response.json();
      this._renderToast(response.status, result);
    }
  }

  constructor() {
    super();
    this._isEditable = true;
    this._getData();
  }

  _getFieldMarkup(field) {
    /** The field properties are coming from the list method of the settings endpoint */
    if (["number", "string"].includes(field.type)) {
      return `<input
        class="form-control"
        type="${field.type}"
        name="${field.setting}"
        value="${field.value}"
        placeholder="${field.placeholder || ""}"
        disabled
      />`;
    }

    if (field.type === "array") {
      return field.value.length
        ? field.value.reduce(
            (accumulator, category) => `${accumulator}
          <div class="form-check d-inline">
          <input
            type="checkbox"
            name="${category.categorycode}"
            ${field.setting === "restricted_patron_categories" && "checked"}
            disabled
            class="form-check-input"
            id="${category.categorycode}
          />
          <label for="${
            category.categorycode
          }" class="form-check-label">&nbsp;${
              category.description
            }&nbsp;</label>
          </div>`,
            ""
          )
        : `<p>There are currently no <code>${field.setting}</code> selected.`;
    }
  }
}

customElements.define("lms-settings-table", LMSSettingsTable);
