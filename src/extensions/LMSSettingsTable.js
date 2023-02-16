import { html } from "lit";
import LMSTable from "../components/LMSTable";
import { observeState } from "lit-element-state";
import RequestHandler from "../state/RequestHandler";

export default class LMSSettingsTable extends observeState(LMSTable) {
  static get properties() {
    return {
      data: { type: Array },
      _isEditable: { type: Boolean, attribute: false },
    };
  }

  async _getData() {
    const { data } = await RequestHandler.fetchData({
      endpoint: "settings",
      force: true,
    });

    let order = ["setting", "value", "description"];
    this.data = data
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
    /** Before we enable all inputs in a row
     *  we disable all other rows */
    this.renderRoot.querySelectorAll("input").forEach((input) => {
      input.disabled = true;
    });

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
              { method: "DELETE" }
            )
          );
        });

        const response = await Promise.all(responses);
        return {
          ...response,
          status: response.every((res) => res.status === 204) ? 204 : 207,
        };
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
          { method: "POST", body: JSON.stringify(data) }
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
        });

    if (response.status >= 200 && response.status <= 299) {
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
      return html`<input
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
            (accumulator, category) => html`${accumulator}
              <div class="form-check form-check-inline">
                <input
                  type="checkbox"
                  name="${category.categorycode}"
                  ?checked=${field.setting === "restricted_patron_categories"}
                  disabled
                  class="form-check-input"
                  id=${category.categorycode}
                />
                <label for="${category.categorycode}" class="form-check-label"
                  >&nbsp;${category.description}&nbsp;</label
                >
              </div>`,
            ""
          )
        : html`<p>
            There are currently no <code>${field.setting}</code> selected.
          </p>`;
    }
  }
}

customElements.define("lms-settings-table", LMSSettingsTable);
