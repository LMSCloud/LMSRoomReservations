import { html } from "lit";
import LMSTable from "../components/LMSTable";

export default class LMSBookingsTable extends LMSTable {
  static properties = {
    data: { type: Array },
    _isEditable: { type: Boolean, attribute: false },
    _bookings: { type: Array, attribute: false },
    _rooms: { type: Array, attribute: false },
  };

  _handleEdit(e) {
    let parent = e.target.parentElement;
    while (parent.tagName !== "TR") {
      parent = parent.parentElement;
    }

    const inputs = parent.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.disabled = false;
    });
  }

  async _handleSave(e) {
    let parent = e.target.parentElement;
    while (parent.tagName !== "TR") {
      parent = parent.parentElement;
    }

    /** The api expects integers so we convert them */
    const [bookingid, borrowernumber] = [
      ...Array.from(parent.children).map((element) =>
        parseInt(element.textContent, 10)
      ),
    ];
    const inputs = parent.querySelectorAll("input, select");
    /** Same here, roomid needs to be an integer */
    console.log(inputs);
    const [roomid, start, end] = [
      ...Array.from(inputs).map((input, index) =>
        index === 0 ? parseInt(input.value, 10) : input.value
      ),
    ];

    const response = await fetch(
      `/api/v1/contrib/roomreservations/bookings/${bookingid}`,
      {
        method: "PUT",
        body: JSON.stringify({ borrowernumber, roomid, start, end }),
      }
    );

    if ([200, 201].includes(response.status)) {
      // Implement success message
      inputs.forEach((input) => {
        input.disabled = true;
      });

      this._getData();
    }

    if (response.status >= 400) {
      const result = await response.json();
      this._renderToast(response.status, result);
    }
  }

  async _handleDelete(e) {
    let parent = e.target.parentElement;
    while (parent.tagName !== "TR") {
      parent = parent.parentElement;
    }

    /** The api expects integers so we convert them */
    const [bookingid] = [
      ...Array.from(parent.children).map((element) =>
        parseInt(element.textContent, 10)
      ),
    ];

    const response = await fetch(
      `/api/v1/contrib/roomreservations/bookings/${bookingid}`,
      { method: "DELETE" }
    );

    if (response.status === 204) {
      this._getData();
    }
  }

  async _getData() {
    const [bookingsReponse, roomsResponse] = await Promise.all([
      fetch("/api/v1/contrib/roomreservations/bookings"),
      fetch("/api/v1/contrib/roomreservations/rooms"),
    ]);
    this._bookings = await bookingsReponse.json();
    this._rooms = await roomsResponse.json();

    const order = [
      "bookingid",
      "borrowernumber",
      "roomid",
      "start",
      "end",
      "blackedout",
      "created",
      "updated_at",
    ];

    this.data = this._bookings.length
      ? this._bookings
          .map((datum) => {
            const sortedDatum = Object.keys(datum).sort(
              (a, b) => order.indexOf(a) - order.indexOf(b)
            );
            return sortedDatum.reduce(
              (acc, key) => ({ ...acc, [key]: datum[key] }),
              {}
            );
          })
          .map((datum) => {
            return Object.keys(datum).reduce((acc, key) => {
              return {
                ...acc,
                [key]: this._inputFromValue({
                  key,
                  value:
                    typeof datum[key] !== "string"
                      ? datum[key].toString()
                      : datum[key],
                }),
              };
            }, {});
          })
      : this._bookings;
  }

  _inputFromValue({ key, value }) {
    const inputs = {
      start: html`<input
        class="form-control"
        type="datetime-local"
        name="start"
        value="${value}"
        disabled
      />`,
      end: html`<input
        class="form-control"
        type="datetime-local"
        name="end"
        value="${value}"
        disabled
      />`,
      roomid: () => {
        return html`<select
          class="form-control"
          type="number"
          name="roomid"
          disabled
        >
          ${this._rooms.map(
            (room) =>
              html`<option
                value=${room.roomid}
                ?selected=${room.roomid === parseInt(value, 10)}
              >
                ${room.roomnumber}
              </option>`
          )}
        </select>`;
      },
    };
    return inputs[key] instanceof Function
      ? inputs[key]()
      : inputs[key] || value;
  }

  constructor() {
    super();
    this._isEditable = true;
    this._isDeletable = true;
    this.data = [];
    this._getData();
  }
}

customElements.define("lms-bookings-table", LMSBookingsTable);
