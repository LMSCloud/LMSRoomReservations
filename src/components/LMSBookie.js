import { LitElement, html, css } from "lit";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";
import dayjs from "dayjs";

export default class LMSBookie extends LitElement {
  static properties = {
    borrowernumber: { type: String },
    _openHours: { state: true },
    _rooms: { state: true },
    _equipment: { state: true },
    _alertMessage: { state: true },
    _selectedRoom: { state: true },
    _defaultMaxBookingTime: { state: true },
  };

  static styles = [
    bootstrapStyles,
    css`
      :host > div {
        padding: 16px;
        box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
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
        flex: 0 0 100%;
      }

      .room img {
        aspect-ratio: 16 / 9;
        object-fit: cover;
      }

      section:not(:last-child) {
        padding-bottom: 1em;
        border-bottom: 3px dotted var(--seperator-light);
      }
    `,
  ];

  async _init() {
    const options = { headers: { accept: "" } };
    const [openHours, rooms, equipment, defaultMaxBookingTime] =
      await Promise.all([
        fetch("/api/v1/contrib/roomreservations/public/open_hours", options),
        fetch("/api/v1/contrib/roomreservations/public/rooms", options),
        fetch("/api/v1/contrib/roomreservations/public/equipment", options),
        fetch(
          "/api/v1/contrib/roomreservations/public/settings/default_max_booking_time",
          options
        ),
      ]);

    if (openHours.ok) {
      this._openHours = await openHours.json();
    } else {
      console.error("Error fetching open hours");
    }

    if (rooms.ok) {
      this._rooms = await rooms.json();
      [this._selectedRoom] = this._rooms;
    } else {
      console.error("Error fetching rooms");
    }

    if (equipment.ok) {
      this._equipment = await equipment.json();
    } else {
      console.error("Error fetching equipment");
    }

    if (defaultMaxBookingTime.ok) {
      this._defaultMaxBookingTime = await defaultMaxBookingTime.json();
    } else {
      console.error("Error fetching default max booking time");
    }
  }

  constructor() {
    super();
    this.borrowernumber = "";
    this._openHours = [];
    this._rooms = [];
    this._equipment = [];
    this._alertMessage = "";
    this._defaultMaxBookingTime = undefined;
    this._init();
  }

  async _handleSubmit() {
    const inputs = [
      this.renderRoot.getElementById("room"),
      this.renderRoot.getElementById("start-datetime"),
      this.renderRoot.getElementById("duration"),
      this.renderRoot.querySelectorAll(".equipment-item"),
    ];
    const [roomid, start, duration] = inputs.map((input) => input.value);

    /** We filter for checked checkbox inputs here. */
    const [, , , equipmentInputs] = inputs;
    const equipment = [...equipmentInputs].reduce(
      (accumulator, equipmentInput) => {
        if (equipmentInput.checked) {
          accumulator.push(equipmentInput.id);
        }
        return accumulator;
      },
      []
    );

    const startDatetime = dayjs(start);
    const end = startDatetime
      .add(duration, "minute")
      .format("YYYY-MM-DDTHH:mm");

    const response = await fetch(
      "/api/v1/contrib/roomreservations/public/bookings",
      {
        method: "POST",
        headers: {
          accept: "",
        },
        body: JSON.stringify({
          borrowernumber: this.borrowernumber,
          roomid,
          start,
          end,
          blackedout: 0,
          equipment,
        }),
      }
    );

    if ([201].includes(response.status)) {
      inputs.forEach((input) => {
        input.value = "";
      });
      this._alertMessage = "Success! Your booking is set.";

      const event = new CustomEvent("submitted", { bubbles: true });
      this.dispatchEvent(event);
      return;
    }

    const result = await response.json();
    this._alertMessage = `Sorry! ${result.error}`;
  }

  _dismissAlert() {
    this._alertMessage = "";
  }

  _selectRoom(e) {
    const roomInput = this.renderRoot.getElementById("room");
    const options = [...roomInput.options];
    options.find((option) => option.value === e.target.id).selected = true;

    const event = new Event("change");
    roomInput.dispatchEvent(event);
    roomInput.scrollIntoView();
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
                @change=${(e) => {
                  this._selectedRoom = this._rooms.find(
                    (room) => room.roomid === e.target.value
                  );
                }}
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
                placeholder="In minutes, e.g. 60"
              />
              <datalist id="durations">
                <!-- Check if this._selectedRoom.maxbookabletime or this._defaultMaxBookingTime has a value, if not, output nothing
                Else, create an array with chunks of 30, using this._selectedRoom.maxbookabletime or this._defaultMaxBookingTime, 
                if the value is not divisible by 30, add the value as the last element of the array, 
                and then use map function to create <option> elements with each value of the array -->
                ${this._selectedRoom?.maxbookabletime ||
                this._defaultMaxBookingTime
                  ? Array.from(
                      {
                        length: Math.floor(
                          (this._selectedRoom.maxbookabletime ||
                            this._defaultMaxBookingTime) / 30
                        ),
                      },
                      (_, i) => (i + 1) * 30
                    )
                      .concat(
                        (this._selectedRoom.maxbookabletime ||
                          this._defaultMaxBookingTime) %
                          30 ===
                          0
                          ? []
                          : this._selectedRoom.maxbookabletime ||
                              this._defaultMaxBookingTime
                      )
                      .map((timespan) => html`<option>${timespan}</option>`)
                  : ""}
              </datalist>
            </div>
            <div
              ?hidden=${!this._equipment.length ||
              !this._equipment.filter(
                (item) => item.roomid == this._selectedRoom.roomid
              ).length}
              class="form-group"
            >
              <label for="equipment">Equipment</label>
              ${this._equipment
                .filter((item) => item.roomid == this._selectedRoom.roomid)
                .map(
                  (item) => html`
                    <div class="form-check">
                      <input
                        type="checkbox"
                        class="form-check-input equipment-item"
                        id="${item.equipmentid}"
                      />
                      <label class="form-check-label" for="${item.equipmentid}"
                        >${item.equipmentname}</label
                      >
                    </div>
                  `
                )}
            </div>
            <div class="form-group">
              <label for="confirmation">Confirmation Email</label>
              <div class="form-check">
                <input
                  type="checkbox"
                  id="confirmation-email"
                  name="confirmation-email"
                  class="form-check-input"
                />
                <label class="form-check-label" for="confirmation-email">Should we send you a confirmation email?</label>
              </div>
            </div>
            <small class="form-text text-muted" id="booking-help"
              >Pick a room, a date, a time<span
                ?hidden=${!this._equipment.length}
                >, items you'd like to use</span
              >
              and the duration of your reservation.</small
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
        <section ?hidden=${!this._openHours.length}>
          <h5>Open hours</h5>
          <div id="open-hours">
            <table class="table table-striped table-bordered table-sm">
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Open from</th>
                  <th scope="col">Closed after</th>
                </tr>
              </thead>
              <tbody>
                ${this._openHours
                  .filter((day) => day.branch === this._selectedRoom?.branch)
                  .map(({ day, start, end }) => {
                    return html`
                      <tr>
                        <td>${day}</td>
                        <td>${start.slice(0, -3)}</td>
                        <td>${end.slice(0, -3)}</td>
                      </tr>
                    `;
                  })}
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
                  <img
                    class="card-img-top"
                    src="${room.image}"
                    alt="Image for ${room.roomnumber}"
                  />
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
                    <a
                      href="#"
                      class="card-link"
                      id=${room.roomid}
                      @click=${(e) => {
                        this._selectRoom(e);
                      }}
                      >Book this room</a
                    >
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
