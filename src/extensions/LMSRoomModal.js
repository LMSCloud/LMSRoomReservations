import LMSModal from "../components/LMSModal";

export default class LMSRoomModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.fields = [
      { name: "maxcapacity", type: "text", desc: "Max capacity", required: true },
      { name: "color", type: "color", desc: "Color", required: true },
      { name: "image", type: "text", desc: "Image", required: true },
      { name: "description", type: "text", desc: "description", required: true },
      { name: "maxbookabletime", type: "text", desc: "Max bookable time" },
      { name: "roomid", type: "text" },
      {
        name: "branch",
        type: "select",
        desc: "Branch",
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
      { name: "roomnumber", type: "text", desc: "Roomnumber", required: true },
    ];
    this.createOpts = {
      endpoint: "/api/v1/contrib/roomreservations/rooms",
      method: "POST",
    };
    this._modalTitle = "Add a Room";
  }
}

customElements.define("lms-room-modal", LMSRoomModal);
