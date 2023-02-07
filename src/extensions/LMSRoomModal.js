import LMSModal from "../components/LMSModal";

export default class LMSRoomModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.createOpts = {
      endpoint: "/api/v1/contrib/roomreservations/rooms",
      method: "POST",
    };
    this._i18n
      .then((i18n) => {
        this._modalTitle = i18n.gettext("Add a Room");
        this.fields = [
          {
            name: "maxcapacity",
            type: "text",
            desc: i18n.gettext("Max capacity"),
            required: true,
          },
          {
            name: "color",
            type: "color",
            desc: i18n.gettext("Color"),
            required: true,
          },
          {
            name: "image",
            type: "text",
            desc: i18n.gettext("Image"),
            required: true,
          },
          {
            name: "description",
            type: "text",
            desc: i18n.gettext("Description"),
            required: true,
          },
          {
            name: "maxbookabletime",
            type: "text",
            desc: i18n.gettext("Max bookable time"),
          },
          { name: "roomid", type: "text" },
          {
            name: "branch",
            type: "select",
            desc: i18n.gettext("Branch"),
            logic: async () => {
              const response = await fetch("/api/v1/libraries");
              const result = await response.json();
              return result.map((library) => ({
                value: library.library_id,
                name: library.name,
              }));
            },
            required: true,
          },
          {
            name: "roomnumber",
            type: "text",
            desc: i18n.gettext("Roomnumber"),
            required: true,
          },
        ];
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

customElements.define("lms-room-modal", LMSRoomModal);
