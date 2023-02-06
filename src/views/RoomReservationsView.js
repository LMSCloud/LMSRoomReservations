import { html, css, LitElement } from "lit";
import TranslationHandler from "../lib/TranslationHandler";

export default class RoomReservationsView extends LitElement {
  static get properties() {
    return {
      borrowernumber: { type: String },
      _endpoints: { type: Object, attribute: false },
      _currentDate: { type: String, attribute: false },
      _i18n: { state: true },
      _lmsCalendar: { state: true },
      _bookings: { state: true },
      _rooms: { state: true },
    };
  }

  static get styles() {
    return [
      css`
        div {
          display: flex;
          flex-direction: row;
          gap: var(--spacing-md);
        }

        lms-calendar {
          width: 80%;
          max-height: 90vh;
        }

        lms-bookie {
          width: 20%;
        }

        @media (max-width: 1200px) {
          div {
            flex-direction: column;
          }

          lms-calendar {
            width: 100%;
            height: 75vh;
          }

          lms-bookie {
            width: 100%;
          }
        }
      `,
    ];
  }

  constructor() {
    super();
    this.borrowernumber = undefined;
    this._endpoints = {
      bookings: "/api/v1/contrib/roomreservations/bookings",
      rooms: "/api/v1/contrib/roomreservations/rooms",
    };
    this._currentDate = new Date();
    this._lmsCalendar = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    this._init();
  }

  async _init() {
    const translationHandler = new TranslationHandler();
    await translationHandler.loadTranslations();
    this._i18n = translationHandler.i18n;

    this._lmsCalendar = this.renderRoot.querySelector("lms-calendar");
    this._lmsCalendar.heading = this._i18n.gettext("Current Bookings");
    this._lmsCalendar.activeDate = {
      day: this._currentDate.getDate(),
      month: this._currentDate.getMonth() + 1,
      year: this._currentDate.getFullYear(),
    };

    const [bookings, rooms] = await Promise.all([
      fetch(this._endpoints.bookings, { headers: { accept: "" } }),
      fetch(this._endpoints.rooms, { headers: { accept: "" } }),
    ]);

    this._bookings = await bookings.json();
    this._rooms = await rooms.json();

    this._getEntries();
  }

  async _getBookings() {
    const response = await fetch(this._endpoints.bookings, {
      headers: { accept: "" },
    });
    this._bookings = await response.json();
  }

  async _getEntries() {
    this._lmsCalendar.entries = this._bookings.map(({ roomid, start, end }) => {
      const [s, e] = [new Date(start), new Date(end)];
      const bookedRoomid = roomid;
      const room = this._rooms.find(({ roomid }) => roomid == bookedRoomid);

      return {
        date: {
          start: {
            day: s.getDate(),
            month: s.getMonth() + 1,
            year: s.getFullYear(),
          },
          end: {
            day: e.getDate(),
            month: e.getMonth() + 1,
            year: e.getFullYear(),
          },
        },
        time: {
          start: { hours: s.getHours(), minutes: s.getMinutes() },
          end: { hours: e.getHours(), minutes: e.getMinutes() },
        },
        heading: room.roomnumber,
        content: this._i18n.gettext("booked"),
        color: room.color,
      };
    });
  }

  async _handleSubmit() {
    await this._getBookings();
    this._getEntries();
  }

  render() {
    return html`
      <div>
        <lms-calendar></lms-calendar>
        <lms-bookie
          .borrowernumber=${this.borrowernumber}
          @submitted=${this._handleSubmit}
        ></lms-bookie>
      </div>
    `;
  }
}
customElements.define("lms-room-reservations-view", RoomReservationsView);
