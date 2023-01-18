import LMSModal from "./LMSModal";

export default class LMSEquipmentModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.fields = [
      { name: "equipmentid", type: "text" },
      { name: "equipmentname", type: "text", desc: "Equipmentname" },
      { name: "description", type: "text", desc: "Description" },
      { name: "image", type: "text", desc: "Image" },
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
  }
}

customElements.define("lms-equipment-modal", LMSEquipmentModal);
