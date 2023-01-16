import { LitElement, html, css } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";

export default class LMSBookie extends LitElement {
  static properties = {
    borrowernumber: { type: String },
    _openHours: { state: true },
    _rooms: { state: true },
    _alertMessage: { state: true },
  };

  static styles = [
    bootstrapStyles,
    css`
      :host > div {
        padding: 16px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--seperator-light);
        border-radius: var(--border-radius-lg);
        font-family: var(--system-ui);
        background: white;
        display: flex;
        flex-direction: column;
        gap: 1em;
      }

      #rooms {
        display: flex;
        overflow-y: scroll;
        flex-wrap: nowrap;
        gap: 1em;
      }

      .room {
        flex: 0 0 15vw;
      }

      .room img {
        aspect-ratio: 16 / 9;
      }

      section:not(:last-child) {
        padding-bottom: 1em;
        border-bottom: 3px dotted var(--seperator-light);
      }
    `,
  ];

  async _init() {
    const options = { headers: { accept: "" } };
    const [openHours, rooms] = await Promise.all([
      fetch("/api/v1/contrib/roomreservations/open_hours", options),
      fetch("/api/v1/contrib/roomreservations/rooms", options),
    ]);

    if (openHours.ok) {
      this._openHours = await openHours.json();
    } else {
      console.error("Error fetching open hours");
    }

    if (rooms.ok) {
      this._rooms = await rooms.json();
    } else {
      console.error("Error fetching rooms");
    }
  }

  constructor() {
    super();
    this.borrowernumber = "";
    this._openHours = [];
    this._rooms = [];
    this._alertMessage = "";
    this._init();
  }

  async _handleSubmit() {
    const inputs = [
      this.renderRoot.getElementById("room"),
      this.renderRoot.getElementById("start-datetime"),
      this.renderRoot.getElementById("duration"),
    ];
    const [roomid, start, duration] = inputs.map((input) => input.value);

    /** Important note: This uses the dayjs library present in Koha
     *  You'll find this included as an asset in views/opac/calendar.tt */
    const startDatetime = dayjs(start);
    const end = startDatetime
      .add(duration, "minute")
      .format("YYYY-MM-DDTHH:mm");

    const response = await fetch("/api/v1/contrib/roomreservations/bookings/", {
      method: "POST",
      headers: {
        accept: "",
      },
      body: JSON.stringify([
        {
          borrowernumber: this.borrowernumber,
          roomid,
          start,
          end,
          blackedout: 0,
        },
      ]),
    });

    if ([201].includes(response.status)) {
      inputs.forEach((input) => {
        input.value = "";
      });
      this._alertMessage = "Success! Your booking is set.";
      return;
    }

    this._alertMessage = "Sorry! There has been a problem.";
  }

  _dismissAlert() {
    this._alertMessage = "";
  }

  render() {
    return html`
      <div ?hidden=${!this._rooms.length}>
        <section>
          <h5>Book a room</h5>
          <div
            class="alert alert-${this._alertMessage.includes("Success!")
              ? "success"
              : "warning"} alert-dismissible fade show"
            role="alert"
            ?hidden=${!this._alertMessage}
          >
            ${this._alertMessage}
            <button
              @click=${this._dismissAlert}
              type="button"
              class="close"
              data-dismiss="alert"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div id="booking">
            <div class="form-group">
              <label for="room">Room</label>
              <select
                id="room"
                name="room"
                class="form-control"
                aria-describedby="booking-help"
              >
                ${this._rooms.length &&
                this._rooms.map(
                  (room) =>
                    html`<option value="${room.roomid}">
                      ${room.roomnumber}
                    </option>`
                )}
              </select>
            </div>
            <div class="form-group">
              <label for="start-datetime">Date & Time</label>
              <input
                type="datetime-local"
                id="start-datetime"
                name="start-datetime"
                class="form-control"
                aria-describedby="booking-help"
              />
            </div>
            <div class="form-group">
              <label for="duration">Duration</label>
              <input
                type="number"
                list="durations"
                id="duration"
                name="duration"
                class="form-control"
                aria-describedby="booking-help"
              />
              <datalist id="durations">
                <option>30</option>
                <option>60</option>
                <option>90</option>
                <option>120</option>
              </datalist>
            </div>
            <small class="form-text text-muted" id="booking-help"
              >Pick a room, a date, a time and the duration of your
              reservation.</small
            >
            <button
              type="submit"
              @click=${this._handleSubmit}
              class="btn btn-primary mt-2 float-right"
            >
              Submit
            </button>
          </div>
        </section>
        <section>
          <h5 ?hidden=${!this._openHours.length}>Open hours</h5>
          <div id="open-hours" ?hidden=${!this._openHours.length}>
            <table class="table table-striped table-bordered table-sm">
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Open from</th>
                  <th scope="col">Closed after</th>
                </tr>
              </thead>
              <tbody>
                ${this._openHours.map(
                  (day) => html`
                    <tr>
                      <td>${day.day}</td>
                      <td>${day.start}</td>
                      <td>${day.end}</td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h5>Rooms</h5>
          <div id="rooms">
            ${this._rooms.map(
              (room) => html`
                <div class="room card">
                  <img class="card-img-top" src="${room.image}" alt="..." />
                  <div class="card-body">
                    <h5 class="card-title">${room.roomnumber}</h5>
                    <p class="card-text">${room.description}</p>
                  </div>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                      <strong>Branch</strong>&nbsp;<span>${room.branch}</span>
                    </li>
                    <li class="list-group-item">
                      <strong>Max bookable time</strong>&nbsp;<span
                        >${room.maxbookabletime}</span
                      >
                    </li>
                    <li class="list-group-item">
                      <strong>Max Capacity</strong>&nbsp;<span
                        >${room.maxcapacity}</span
                      >
                    </li>
                  </ul>
                  <div class="card-body">
                    <a href="#" class="card-link">Card link</a>
                  </div>
                </div>
              `
            )}
          </div>
        </section>
      </div>
    `;
  }
}
customElements.define("lms-bookie", LMSBookie);
