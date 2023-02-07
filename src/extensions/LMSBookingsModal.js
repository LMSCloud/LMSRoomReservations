import LMSModal from "../components/LMSModal";

export default class LMSBookingsModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.createOpts = {
      endpoint: "/api/v1/contrib/roomreservations/bookings",
      method: "POST",
    };
    this._i18n
      .then((i18n) => {
        this._modalTitle = i18n.gettext("Add Booking");
        this.fields = [
          {
            name: "borrowernumber",
            type: "number",
            desc: i18n.gettext("Borrowernumber"),
            required: true,
          },
          {
            name: "roomid",
            type: "select",
            desc: i18n.gettext("Roomid"),
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
            required: true,
          },
          {
            name: "start",
            type: "datetime-local",
            desc: i18n.gettext("Starts at"),
            required: true,
          },
          {
            name: "end",
            type: "datetime-local",
            desc: i18n.gettext("Ends at"),
            required: true,
          },
          {
            name: "blackedout",
            type: "checkbox",
            desc: i18n.gettext("Is blackout"),
          },
          {
            name: "send_confirmation",
            type: "checkbox",
            desc: i18n.gettext("Send confirmation to patron"),
          },
        ];
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

customElements.define("lms-bookings-modal", LMSBookingsModal);
