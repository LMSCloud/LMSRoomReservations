import LMSModal from "../components/LMSModal";

export default class LMSEquipmentModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.createOpts = {
      endpoint: "/api/v1/contrib/roomreservations/equipment",
      method: "POST",
    };
    this._i18n
      .then((i18n) => {
        this._modalTitle = i18n.gettext("Add Equipment");
        this.fields = [
          { name: "equipmentid", type: "text" },
          {
            name: "equipmentname",
            type: "text",
            desc: i18n.gettext("Equipmentname"),
            required: true,
          },
          {
            name: "description",
            type: "text",
            desc: i18n.gettext("Description"),
            required: true,
          },
          {
            name: "image",
            type: "text",
            desc: i18n.gettext("Image"),
            required: true,
          },
          {
            name: "maxbookabletime",
            type: "text",
            desc: i18n.gettext("Max bookable time"),
          },
          {
            name: "info",
            type: "info",
            desc: i18n.gettext(
              "You can assign this item to a room once its created."
            ),
          },
        ];
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

customElements.define("lms-equipment-modal", LMSEquipmentModal);
