import { LitElement, PropertyValueMap, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { requestHandler } from "../lib/RequestHandler";
import { formatDatetimeByLocale } from "../lib/converters/datetimeConverters";
import { __, locale } from "../lib/translate";

@customElement("lms-patrons-bookings-table")
export default class PatronsBookingsTable extends LitElement {
    @property({ type: Array, attribute: "patrons-bookings" }) patronsBookings: any[] = [];

    @property({ type: Array }) rooms: any[] = [];

    @property({ type: String, attribute: "external-stylesheet-src" }) externalStylesSrc: string | undefined;

    @property({ type: String }) error: "CSS_NOT_FOUND" | undefined;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    protected override updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (_changedProperties.has("externalStylesSrc") && this.externalStylesSrc) {
            fetch(this.externalStylesSrc)
                .then((response) => response.text())
                .then((styleSheet) => {
                    const styleTag = document.createElement("style");
                    styleTag.textContent = styleSheet;
                    this.shadowRoot?.appendChild(styleTag);
                });
        }
    }

    private handleConfirmation(e: Event) {
        const target = e.target as HTMLElement;
        const button = target.closest("button");
        if (!button) {
            return;
        }

        const initiateSpan = button.querySelector(".initiate-delete");
        const confirmSpan = button.querySelector(".confirm-delete");

        if (!initiateSpan || !confirmSpan) {
            return;
        }

        initiateSpan.classList.toggle("d-none");
        confirmSpan.classList.toggle("d-none");

        if (confirmSpan.classList.contains("d-none")) {
            const { id } = button.dataset;
            if (id) {
                this.handleCancellation(id);
            }
        }
    }

    private handleCancellation(id: string) {
        requestHandler.delete("patronBookingsPublic", undefined, [id]).then((response) => {
            if (response.ok) {
                requestHandler
                    .get("patronBookingsPublic")
                    .then((response) => response.json())
                    .then((patronsBookings) => (this.patronsBookings = patronsBookings));
            }
        });
    }

    private renderInfoMaybe() {
        return this.patronsBookings.length
            ? nothing
            : html`
                  <p>
                      ${__(
                          "You haven't made any room reservations yet. Future reservations will show up right here in your user profile.",
                      )}
                  </p>
              `;
    }

    private renderPatronsBookingsTableMaybe() {
        return !this.patronsBookings.length
            ? nothing
            : html`
                  <p>${__("This table shows your current room reservations")}.</p>
                  <table class="table-striped table-bordered table-responsive-sm table">
                      <thead>
                          <tr>
                              <th>${__("Room")}</th>
                              <th>${__("Start")}</th>
                              <th>${__("End")}</th>
                              <th>${__("Purpose of Use")}</th>
                              <th>${__("actions")}</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${repeat(
                              this.patronsBookings,
                              (booking) => booking.bookingid,
                              (booking) => {
                                  const { bookingid, roomid, start, end, purpose_of_use } = booking;
                                  return html`
                                      <tr>
                                          <td>${this.rooms.find((room) => room.roomid == roomid).roomnumber}</td>
                                          <td>${formatDatetimeByLocale(start, locale)}</td>
                                          <td>${formatDatetimeByLocale(end, locale)}</td>
                                          <td>${purpose_of_use}</td>
                                          <td>
                                              <button
                                                  class="btn"
                                                  data-id=${bookingid}
                                                  @click=${this.handleConfirmation}
                                              >
                                                  <span class="initiate-delete">${__("Delete")}</span>
                                                  <span class="confirm-delete d-none">${__("Confirm")}</span>
                                              </button>
                                          </td>
                                      </tr>
                                  `;
                              },
                          )}
                      </tbody>
                  </table>
              `;
    }

    override render() {
        if (this.error) {
            return html` <p>${__("There has been a technical error. Please inform the staff.")}</p> `;
        }

        return html`
            <h1>${__("Your bookings")}</h1>
            ${this.renderInfoMaybe()}
            <a class="py-2" href="/roomreservations">${__("Make a reservation")}</a>
            ${this.renderPatronsBookingsTableMaybe()}
        `;
    }
}
