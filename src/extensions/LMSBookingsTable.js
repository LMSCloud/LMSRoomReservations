import { html, nothing } from "lit";
import LMSTable from "../components/LMSTable";

export default class LMSBookingsTable extends LMSTable {
  static properties = {
    data: { type: Array },
    _isEditable: { type: Boolean, attribute: false },
    _bookings: { type: Array, attribute: false },
    _borrowers: { type: Array, attribute: false },
    _rooms: { type: Object, attribute: false },
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
      "equipment",
      "created",
      "updated_at",
    ];

    if (this._bookings.length) {
      this._borrowers = this._bookings.reduce((acc, booking) => {
        return !acc.has(booking.borrowernumber)
          ? acc.add(booking.borrowernumber)
          : acc;
      }, new Set());

      if (this._borrowers.size) {
        const borrowersReponse = await fetch(
          `/api/v1/patrons?${[...this._borrowers].reduce(
            (acc, borrowernumber, idx) =>
              `${acc}${
                idx > 0 ? "&" : ""
              }q={"borrowernumber":"${borrowernumber}"}`,
            ""
          )}`
        );
        this._borrowers = await borrowersReponse.json();
      }

      this.data = this._bookings
        .map((datum) => {
          const sortedDatum = Object.keys(datum).sort(
            (a, b) => order.indexOf(a) - order.indexOf(b)
          );
          return sortedDatum.reduce(
            (acc, key) => ({ ...acc, [key]: datum[key] }),
            {}
          );
        })
        .map((datum) =>
          Object.keys(datum).reduce(
            (acc, key) => ({
              ...acc,
              [key]: this._inputFromValue({
                key,
                value: (() => {
                  if (datum[key] instanceof Array) {
                    return datum[key];
                  }
                  if (typeof datum[key] !== "string") {
                    return datum[key].toString();
                  }
                  return datum[key];
                })(),
              }),
            }),
            {}
          )
        );
    }
  }

  _inputFromValue({ key, value }) {
    const inputs = {
      start: () => html`<input
        class="form-control"
        type="datetime-local"
        name="start"
        value="${value}"
        disabled
      />`,
      end: () => html`<input
        class="form-control"
        type="datetime-local"
        name="end"
        value="${value}"
        disabled
      />`,
      roomid: () => html`<select
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
      </select>`,
      borrowernumber: () => {
        const borrower = this._borrowers.find(
          ({ patron_id }) => patron_id === parseInt(value, 10)
        );
        return html`
          <span class="badge badge-secondary">${value}</span>&nbsp;
          <a href="/cgi-bin/koha/members/moremember.pl?borrowernumber=${value}"
            ><span
              >${borrower.firstname}&nbsp;${borrower.surname}&nbsp;(${borrower.cardnumber})</span
            ></a
          >
        `;
      },
      equipment: () => {
        console.log(value);
        return value.length
          ? value.map((item) => {
              return html`
                  <div class="form-check form-check-inline">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      id=${item.equipmentid}
                      checked disabled
                    />
                    &nbsp;
                    <label class="form-check-label" for=${item.equipmentid}
                      >${item.equipmentname}
                    </label>
                  </div>
              `;
            })
          : nothing;
      },
    };
    return (inputs[key] instanceof Function && inputs[key]()) || value;
  }

  constructor() {
    super();
    this._isEditable = true;
    this._isDeletable = true;
    this.data = [];
    this._bookings = [];
    this._rooms = [];
    this._borrowers = new Set();
    this._getData();
  }
}

customElements.define("lms-bookings-table", LMSBookingsTable);
