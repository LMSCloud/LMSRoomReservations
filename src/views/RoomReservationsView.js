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
      _isLoading: { state: true },
    };
  }

  static get styles() {
    return [
      css`
        .container {
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

        .skeleton {
          background-color: lightgray;
          border-radius: 5px;
          animation: skeleton-loading 1s linear infinite alternate;
        }

        .skeleton-container {
          display: flex;
          height: 100vh;
          gap: 1em;
        }

        .skeleton-bookie {
          height: 80vh;
          width: 20%;
        }

        .skeleton-calendar {
          height: 80vh;
          width: 80%;
        }

        @keyframes skeleton-loading {
          0% {
            background-color: hsl(200, 20%, 70%);
          }

          100% {
            background-color: hsl(200, 20%, 95%);
          }
        }

        @media (max-width: 1200px) {
          .container, .skeleton-container {
            flex-direction: column;
          }

          lms-calendar, .skeleton-calendar {
            width: 100%;
            height: 75vh;
          }

          lms-bookie, .skeleton-bookie {
            width: 100%;
          }

          .skeleton-bookie {
            height: 75vh;
          }
        }
      `,
    ];
  }

  constructor() {
    super();
    this.borrowernumber = undefined;
    this._endpoints = {
      bookings: "/api/v1/contrib/roomreservations/public/bookings",
      rooms: "/api/v1/contrib/roomreservations/public/rooms",
    };
    this._currentDate = new Date();
    this._lmsCalendar = undefined;
    this._isLoading = true;
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
      fetch(this._endpoints.bookings),
      fetch(this._endpoints.rooms),
    ]);

    this._bookings = await bookings.json();
    this._rooms = await rooms.json();

    this._getEntries();
  }

  async _getBookings() {
    const response = await fetch(this._endpoints.bookings);
    this._bookings = await response.json();
  }

  async _getEntries() {
    this._lmsCalendar.entries = this._bookings.map(({ roomid, start, end }) => {
      const [s, e] = [new Date(start), new Date(end)];
      const bookedRoomid = roomid;
      const room = this._rooms.find(({ roomid }) => roomid == bookedRoomid);
      this._isLoading = false;
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
    return html`<div
        class="skeleton-container"
        style="display: ${this._isLoading ? "flex" : "none"}"
      >
        <div class="skeleton skeleton-bookie"></div>
        <div class="skeleton skeleton-calendar"></div>
      </div>
      <div class="container">
        <lms-bookie
          .borrowernumber=${this.borrowernumber}
          @submitted=${this._handleSubmit}
          ?hidden=${this._isLoading}
        ></lms-bookie>
        <lms-calendar ?hidden=${this._isLoading}></lms-calendar>
      </div>`;
  }
}
customElements.define("lms-room-reservations-view", RoomReservationsView);
