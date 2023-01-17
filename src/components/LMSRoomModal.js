import LMSModal from "./LMSModal";

export default class LMSRoomModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.fields = [
      { name: "maxcapacity", type: "text", desc: "Max capacity" },
      { name: "color", type: "color", desc: "Color" },
      { name: "image", type: "text", desc: "Image" },
      { name: "description", type: "text", desc: "description" },
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
      },
      { name: "roomnumber", type: "text", desc: "Roomnumber" },
    ];
    this.createOpts = {
      endpoint: "/api/v1/contrib/roomreservations/rooms",
      method: "POST",
    };
  }
}

customElements.define("lms-room-modal", LMSRoomModal);
