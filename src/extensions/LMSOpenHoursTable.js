import { html, nothing } from "lit";
import LMSTable from "../components/LMSTable";
import TranslationHandler from "../lib/TranslationHandler";
export default class LMSOpenHoursTable extends LMSTable {
  static get properties() {
    return {
      data: {
        type: Array,
        convert: (value) => JSON.parse(value),
      },
      branch: { type: String },
      _branches: { type: Array, attribute: false },
      _isEditable: { type: Boolean, attribute: false },
      _errorLabel: { type: Object, attribute: false },
      _i18n: { state: true },
    };
  }

  constructor() {
    super();
    this._isEditable = true;
    this._dayConversionMap = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].reduce(
      (map, day, index) => ((map[day] = index), (map[index] = day), map),
      {}
    );
    this._isSetup = false;
    this._branches = [];
    this._errorLabel = undefined;
    this._i18n = undefined;
    this._setup();
  }

  async _setup() {
    const branchResult = await this._getOpenHours();
    if (!branchResult?.length) {
      const response = await fetch(
        "/api/v1/contrib/roomreservations/open_hours",
        {
          method: "POST",
          body: JSON.stringify(
            Array.from({ length: 7 }, (_, i) => ({
              branch: this.branch,
              day: i,
              start: "00:00",
              end: "00:00",
            }))
          ),
        }
      );

      this._isSetup = response.status === 201;

      if (this._isSetup) {
        const data = await this._getOpenHours();
        await this._init(data);
      }
      return;
    }

    this._isSetup = true;
  }

  async _init(data) {
    if (!data) return [];

    const translationHandler = new TranslationHandler();
    await translationHandler.loadTranslations();
    this._i18n = translationHandler.i18n;

    this.data = data.map((datum) => {
      const { day, start, end } = datum;
      const weekday = this._i18n.gettext(this._dayConversionMap[day]);
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
    });
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.data?.length) {
      this._init(this.data);
    }
    this._getBranches();
  }

  _handleEdit(e) {
    /** Before we enable all inputs in a row
     *  we disable all other rows */
    this.renderRoot.querySelectorAll("input").forEach((input) => {
      input.disabled = true;
    });

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
    this._errorLabel = undefined;
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
      }
    );

    if (response.status === 201) {
      // Implement success message
      [start, end].forEach((input) => (input.disabled = true));
    }

    if (response.status >= 400) {
      const result = await response.json();
      if (result.error) {
        this._errorLabel = {
          status: response.status,
          message: result.error,
        };
        return;
      }

      if (result.errors) {
        this._errorLabel = {
          status: response.status,
          message: Object.values(result.errors)
            .map(({ message, path }) => `Sorry! ${message} at ${path}`)
            .join(" & "),
        };
      }
    }
  }

  async _getOpenHours() {
    const endpoint = "/api/v1/contrib/roomreservations/open_hours";
    const response = await fetch(endpoint);
    const result = await response.json();

    if (result.length) {
      const groupedResult = this._groupBy(result, (item) => item.branch);
      return groupedResult[this.branch];
    }
  }

  async _getBranches() {
    const response = await fetch("/api/v1/libraries");
    const result = await response.json();
    this._branches = result.reduce(
      (acc, library) => ({
        ...acc,
        [library.library_id]: library.name,
      }),
      {}
    );
  }

  render() {
    return !this._i18n?.gettext && !this.data.length
      ? nothing
      : html`
          <h4>
            <span class="badge badge-secondary"
              >${this._branches[this.branch] ?? this.branch}</span
            >
            <span class="badge badge-danger" ?hidden=${!this._errorLabel}>
              ${this._errorLabel?.status}: ${this._errorLabel?.message}
            </span>
          </h4>
          ${super.render()}
        `;
  }

  _groupBy(array, predicate) {
    return array.reduce((acc, value, index, array) => {
      (acc[predicate(value, index, array)] ||= []).push(value);
      return acc;
    }, {});
  }
}

customElements.define("lms-open-hours-table", LMSOpenHoursTable);
