import { LitElement, html, css } from "lit";

export default class LMSBookie extends LitElement {
  static properties = {
    _openHours: { state: true },
    _rooms: { state: true },
  };

  static styles = [
    css`
      .card {
        padding: 16px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--seperator-light);
        border-radius: var(--border-radius-lg);
      }

      #rooms {
        overflow-y: scroll;
        height: 80%; /* adjust to desired height */
        display: flex;
        gap: 1em;
      }

      .room {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid var(--seperator-light);
        border-radius: var(--border-radius-md);
      }

      .room img {
        width: 100%;
        border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
        aspect-ratio: 16 / 9;
      }

      .room p {
        margin: 5px 0;
      }

      dl {
        padding: 0 1em;
      }

      dt,
      dd {
        font-size: small;
      }

      dt {
        font-weight: bold;
      }

      dd {
        border-bottom: 1px solid var(--seperator-light);
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
    this._openHours = [];
    this._rooms = [];
    this._init();
  }

  _handleSubmit() {
    const [roomid, start, duration] = [
      this.renderRoot.getElementById("room"),
      this.renderRoot.getElementById("start-datetime"),
      this.renderRoot.getElementById("duration"),
    ].map((input) => input.value);

    //TODO: Add duration to start and assign to end

    const response = fetch("/api/v1/contrib/roomreservations/bookings/", {
      method: "POST",
      headers: {
        accept: "",
      },
      body: JSON.stringify([
        {
          borrowernumber: 42,
          roomid,
          start,
          end,
          blackedout: 0,
        },
      ]),
    });
  }

  render() {
    return html`
      <div class="card" ?hidden=${!this._rooms.length}>
        <div id="booking">
          <div><strong>Book a room</strong></div>
          <small
            >Pick a room, a date, a time and the duration of your
            reservation.</small
          >
          <div>
            <label for="room">
              Room
              <select id="room" name="room">
                ${this._rooms.length &&
                this._rooms.map(
                  (room) =>
                    html`<option value="${room.roomid}">
                      ${room.roomnumber}
                    </option>`
                )}
              </select>
            </label>
          </div>
          <div>
            <label for="start-datetime">
              Date & Time
              <input
                type="datetime-local"
                id="start-datetime"
                name="start-datetime"
              />
            </label>
          </div>
          <div>
            <label for="duration">
              Duration
              <input
                type="number"
                list="durations"
                id="duration"
                name="duration"
              />
              <datalist id="durations">
                <option>30</option>
                <option>60</option>
                <option>90</option>
                <option>120</option>
              </datalist>
            </label>
          </div>
          <button type="submit" @click=${this._handleSubmit}>Submit</button>
        </div>
        <div>
          <strong ?hidden=${!this._openHours.length}>Open hours</strong>
        </div>
        <div id="open-hours" ?hidden=${!this._openHours.length}>
          ${this._openHours.map(
            (day) => html`
              <div>
                <span>${day.day}</span>
                <span>${day.start}</span>
                <span>${day.end}</span>
              </div>
            `
          )}
        </div>
        <div><strong>Rooms</strong></div>
        <div id="rooms">
          ${this._rooms.map(
            (room) => html`
              <div class="room">
                <img src="${room.image}" />
                <dl>
                  <dt>Room Number</dt>
                  <dd>${room.roomnumber}</dd>
                  <dt>Description</dt>
                  <dd>${room.description}</dd>
                  <dt>Branch</dt>
                  <dd>${room.branch}</dd>
                  <dt>Max Bookable Time</dt>
                  <dd>${room.maxbookabletime}</dd>
                  <dt>Capacity</dt>
                  <dd>${room.maxcapacity}</dd>
                </dl>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }
}
customElements.define("lms-bookie", LMSBookie);
