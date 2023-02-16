import { LitElement, html, css } from "lit";
import { nothing } from "lit-html";
import { bootstrapStyles } from "@granite-elements/granite-lit-bootstrap";
import dayjs from "dayjs";
import TranslationHandler from "../lib/TranslationHandler";
import { observeState } from "lit-element-state";
import RequestHandler from "../state/RequestHandler";

export default class LMSBookie extends observeState(LitElement) {
  static properties = {
    borrowernumber: { type: String },
    _openHours: { state: true },
    _rooms: { state: true },
    _equipment: { state: true },
    _alertMessage: { state: true },
    _selectedRoom: { state: true },
    _defaultMaxBookingTime: { state: true },
    _i18n: { state: true },
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

      @media (max-width: 1200px) {
        .room {
          flex: 0 0 18rem;
        }
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
    const translationHandler = new TranslationHandler();
    await translationHandler.loadTranslations();
    this._i18n = translationHandler.i18n;

    const [openHours, rooms, equipment, defaultMaxBookingTime] =
      await Promise.all([
        RequestHandler.fetchData({ endpoint: "publicOpenHours" }),
        RequestHandler.fetchData({ endpoint: "publicRooms" }),
        RequestHandler.fetchData({ endpoint: "publicEquipment" }),
        RequestHandler.fetchData({
          endpoint: "publicSettings",
          id: "default_max_booking_time",
        }),
      ]);

    if (openHours.response.ok) {
      this._openHours = openHours.data;
    } else {
      console.error("Error fetching open hours");
    }

    if (rooms.response.ok) {
      this._rooms = rooms.data;
      [this._selectedRoom] = this._rooms;
    } else {
      console.error("Error fetching rooms");
    }

    if (equipment.response.ok) {
      this._equipment = equipment.data;
    } else {
      console.error("Error fetching equipment");
    }

    if (defaultMaxBookingTime.response.ok) {
      this._defaultMaxBookingTime = defaultMaxBookingTime.data;
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
      this.renderRoot.getElementById("confirmation-email"),
      this.renderRoot.querySelectorAll(".equipment-item"),
    ];
    const [roomid, start, duration, confirmation] = inputs.map(
      (input) => input.value
    );

    /** We filter for checked checkbox inputs here. */
    const [, , , , equipmentInputs] = inputs;
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

    const { response } = await RequestHandler.createData({
      endpoint: "publicBookings",
      data: {
        borrowernumber: this.borrowernumber,
        roomid,
        start,
        end,
        blackedout: 0,
        equipment,
        send_confirmation: confirmation || 0,
        letter_code: "ROOM_RESERVATION",
      },
    });

    if (response.status >= 200 && response.status <= 299) {
      inputs.forEach((input) => {
        input.value = "";
      });
      this._alertMessage = `${this._i18n.gettext(
        "Success"
      )}! ${this._i18n.gettext("Your booking is set")}.`;

      const event = new CustomEvent("submitted", { bubbles: true });
      this.dispatchEvent(event);
      return;
    }

    const result = await response.json();
    this._alertMessage = `${this._i18n.gettext("Sorry")}! ${result.error}`;
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
    return !this._i18n?.gettext
      ? nothing
      : html`
          <div ?hidden=${!this._rooms.length}>
            <section>
              <h5 id="book-it-here">${this._i18n.gettext("Book a room")}</h5>
              <div
                class="alert alert-${this._alertMessage.includes(
                  `${this._i18n.gettext("Success")}!`
                )
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
                  <label for="room">${this._i18n.gettext("Room")}</label>
                  <select
                    id="room"
                    name="room"
                    class="form-control"
                    aria-describedby="booking-help"
                    @change=${(e) => {
                      this._selectedRoom = this._rooms.find(
                        (room) => room.roomid === parseInt(e.target.value, 10)
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
                  <label for="start-datetime"
                    >${this._i18n.gettext("Date & Time")}</label
                  >
                  <input
                    type="datetime-local"
                    id="start-datetime"
                    name="start-datetime"
                    class="form-control"
                    aria-describedby="booking-help"
                  />
                </div>
                <div class="form-group">
                  <label for="duration"
                    >${this._i18n.gettext("Duration")}</label
                  >
                  <input
                    type="number"
                    list="durations"
                    id="duration"
                    name="duration"
                    class="form-control"
                    aria-describedby="booking-help"
                    placeholder=${this._i18n.gettext("In minutes, e.g. 60")}
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
                              (this._selectedRoom?.maxbookabletime ||
                                this._defaultMaxBookingTime) / 30
                            ),
                          },
                          (_, i) => (i + 1) * 30
                        )
                          .concat(
                            (this._selectedRoom?.maxbookabletime ||
                              this._defaultMaxBookingTime) %
                              30 ===
                              0
                              ? []
                              : this._selectedRoom?.maxbookabletime ||
                                  this._defaultMaxBookingTime
                          )
                          .map((timespan) => html`<option>${timespan}</option>`)
                      : ""}
                  </datalist>
                </div>
                <div
                  ?hidden=${!this._equipment.length ||
                  !this._equipment.filter(
                    (item) => item.roomid == this._selectedRoom?.roomid
                  ).length}
                  class="form-group"
                >
                  <label for="equipment"
                    >${this._i18n.gettext("Equipment")}</label
                  >
                  ${this._equipment
                    .filter((item) => item.roomid == this._selectedRoom?.roomid)
                    .map(
                      (item) => html`
                        <div class="form-check">
                          <input
                            type="checkbox"
                            class="form-check-input equipment-item"
                            id="${item.equipmentid}"
                          />
                          <label
                            class="form-check-label"
                            for="${item.equipmentid}"
                            >${item.equipmentname}</label
                          >
                        </div>
                      `
                    )}
                </div>
                <div class="form-group">
                  <label for="confirmation"
                    >${this._i18n.gettext("Confirmation Email")}</label
                  >
                  <div class="form-check">
                    <input
                      type="checkbox"
                      value="1"
                      id="confirmation-email"
                      name="confirmation-email"
                      class="form-check-input"
                    />
                    <label class="form-check-label" for="confirmation-email"
                      >${this._i18n.gettext(
                        "Should we send you a confirmation email"
                      )}?</label
                    >
                  </div>
                </div>
                <small class="form-text text-muted" id="booking-help"
                  >${this._i18n.gettext("Pick a room, a date, a time")}<span
                    ?hidden=${!this._equipment.length}
                    >, ${this._i18n.gettext("items you'd like to use")}</span
                  >
                  ${this._i18n.gettext(
                    "and the duration of your reservation"
                  )}.</small
                >
                <button
                  type="submit"
                  @click=${this._handleSubmit}
                  class="btn btn-primary mt-2 float-right"
                >
                  ${this._i18n.gettext("Submit")}
                </button>
              </div>
            </section>
            <section ?hidden=${!this._openHours.length}>
              <h5>${this._i18n.gettext("Open hours")}</h5>
              <div id="open-hours">
                <table class="table table-striped table-bordered table-sm">
                  <thead>
                    <tr>
                      <th scope="col">${this._i18n.gettext("Day")}</th>
                      <th scope="col">${this._i18n.gettext("Open from")}</th>
                      <th scope="col">${this._i18n.gettext("Closed after")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this._openHours
                      .filter(
                        (day) => day.branch === this._selectedRoom?.branch
                      )
                      .map(({ day, start, end }) => {
                        return html`
                          <tr>
                            <td>
                              ${{
                                0: this._i18n.gettext("Mon"),
                                1: this._i18n.gettext("Tues"),
                                2: this._i18n.gettext("Wed"),
                                3: this._i18n.gettext("Thurs"),
                                4: this._i18n.gettext("Fri"),
                                5: this._i18n.gettext("Sat"),
                                6: this._i18n.gettext("Sun"),
                              }[day]}
                            </td>
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
              <h5>${this._i18n.gettext("Rooms")}</h5>
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
                          <strong>${this._i18n.gettext("Branch")}</strong
                          >&nbsp;<span>${room.branch}</span>
                        </li>
                        <li class="list-group-item">
                          <strong
                            >${this._i18n.gettext("Max bookable time")}</strong
                          >&nbsp;<span>${room.maxbookabletime}</span>
                        </li>
                        <li class="list-group-item">
                          <strong>${this._i18n.gettext("Max Capacity")}</strong
                          >&nbsp;<span>${room.maxcapacity}</span>
                        </li>
                      </ul>
                      <div class="card-body">
                        <a
                          href="#book-it-here"
                          class="card-link"
                          id=${room.roomid}
                          @click=${(e) => {
                            this._selectRoom(e);
                          }}
                          >${this._i18n.gettext("Book this room")}</a
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
