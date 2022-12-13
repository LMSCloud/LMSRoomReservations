import LMSTable from "./LMSTable";

export default class LMSSettingsTable extends LMSTable {
  static get properties() {
    return {
      data: { type: Array },
      _isEditable: { type: Boolean, attribute: false },
    };
  }

  _handleEdit() {
    console.log("edit");
  }

  _handleSave() {
    console.log("save");
  }

  constructor() {
    super();
    this._isEditable = true;
  }
}

customElements.define("lms-settings-table", LMSSettingsTable);
