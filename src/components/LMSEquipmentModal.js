import LMSModal from "./LMSModal";

export default class LMSEquipmentModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.fields = [
      { name: "equipmentid", type: "text" },
      { name: "equipmentname", type: "text", desc: "Equipmentname", required: true },
      { name: "description", type: "text", desc: "Description", required: true },
      { name: "image", type: "text", desc: "Image", required: true },
      { name: "maxbookabletime", type: "text", desc: "Max bookable time" },
      {
        name: "info",
        type: "info",
        desc: "You can assign this item to a room once its created.",
      },
    ];
    this.createOpts = {
      endpoint: "/api/v1/contrib/roomreservations/equipment",
      method: "POST",
    };
    this._modalTitle = "Add Equipment";
  }
}

customElements.define("lms-equipment-modal", LMSEquipmentModal);
