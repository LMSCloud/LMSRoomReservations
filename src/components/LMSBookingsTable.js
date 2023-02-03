import LMSTable from "./LMSTable";

export default class LMSBookingsTable extends LMSTable {
  static properties = {
    data: { type: Array },
    _isEditable: { type: Boolean, attribute: false },
  };

  _handleEdit(e) {
    let parent = e.target.parentElement;
    while (parent.tagName !== "TR") {
      parent = parent.parentElement;
    }

    const inputs = parent.querySelectorAll("input");
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
    const inputs = Array.from(parent.querySelectorAll("input"));
    /** Same here, roomid needs to be an integer */
    const [roomid, start, end] = [
      ...inputs.map((input, index) =>
        index === 0 ? parseInt(input.value, 10) : input.value
      ),
    ];

    const response = await fetch(
      `/api/v1/contrib/roomreservations/bookings/${bookingid}`,
      {
        method: "PUT",
        body: JSON.stringify({ borrowernumber, roomid, start, end }),
        headers: {
          Accept: "",
        },
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
      {
        method: "DELETE",
        headers: {
          Accept: "",
        },
      }
    );

    if (response.status === 204) {
      this._getData();
    }
  }

  async _getData() {
    const response = await fetch("/api/v1/contrib/roomreservations/bookings", {
      method: "GET",
      headers: {
        Accept: "",
      },
    });

    const result = await response.json();

    this.data = result.length
      ? result
          .map((datum) =>
            Object.keys(datum)
              .sort((a, b) => {
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
                return order.indexOf(a) - order.indexOf(b);
              })
              .reduce((acc, key) => ({ ...acc, [key]: datum[key] }), {})
          )
          .map((datum) =>
            Object.keys(datum).reduce(
              (acc, key) => ({
                ...acc,
                [key]: this._inputFromValue({
                  key,
                  value:
                    typeof datum[key] !== "string"
                      ? datum[key].toString()
                      : datum[key],
                }),
              }),
              {}
            )
          )
      : result;
  }

  _inputFromValue({ key, value }) {
    return (
      {
        start: `<input class="form-control" type="datetime-local" name="start" value="${value}" disabled />`,
        end: `<input class="form-control" type="datetime-local" name="end" value="${value}" disabled />`,
        roomid: `<input class="form-control" type="number" name="roomid" value="${value}" disabled />`,
      }[key] || value
    );
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
