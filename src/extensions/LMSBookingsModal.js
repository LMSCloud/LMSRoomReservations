import LMSModal from "../components/LMSModal";

export default class LMSBookingsModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.fields = [
      { name: "borrowernumber", type: "number", desc: "Borrowernumber", required: true },
      {
        name: "roomid",
        type: "select",
        desc: "Roomid",
        logic: async () => {
          const response = await fetch(
            "/api/v1/contrib/roomreservations/rooms",
            { headers: { accept: "" } }
          );
          const result = await response.json();
          return result.map((room) => ({
            value: room.roomid,
            name: room.roomnumber,
          }));
        },
        required: true
      },
      { name: "start", type: "datetime-local", desc: "Starts at", required: true },
      { name: "end", type: "datetime-local", desc: "Ends at", required: true },
      { name: "blackedout", type: "checkbox", desc: "Is blackout" },
      { name: "send_confirmation", type: "checkbox", desc: "Send confirmation email to patron" },
    ];
    this.createOpts = {
      endpoint: "/api/v1/contrib/roomreservations/bookings",
      method: "POST",
    };
    this._modalTitle = "Add Booking";
  }
}

customElements.define("lms-bookings-modal", LMSBookingsModal);
