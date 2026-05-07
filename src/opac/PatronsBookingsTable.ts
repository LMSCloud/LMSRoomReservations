import { LitElement, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { requestHandler } from "../lib/RequestHandler";
import { convertToFormat, formatDatetimeByLocale } from "../lib/converters/datetimeConverters";
import { __, locale } from "../lib/translate";

@customElement("lms-patrons-bookings-table")
export default class PatronsBookingsTable extends LitElement {
    @property({ type: Array, attribute: "patrons-bookings" }) patronsBookings: any[] = [];

    @property({ type: Array }) rooms: any[] = [];

    @property({ type: String, attribute: "page-url" }) pageUrl: string = "";

    @query("#confirm-dialog") private confirmDialog: HTMLDialogElement | undefined;

    @state() private pendingBooking: { id: string; description: string } | undefined;

    protected override createRenderRoot() {
        return this;
    }

    private async handleDeleteClick(e: Event) {
        const target = e.target as HTMLElement;
        const button = target.closest("button");
        if (!button) {
            return;
        }
        const { id } = button.dataset;
        if (!id) {
            return;
        }
        const booking = this.patronsBookings.find((b) => String(b.bookingid) === id);
        if (!booking) {
            return;
        }
        const room = this.rooms.find((r) => r.roomid == booking.roomid);
        const roomName = room ? room.roomnumber : booking.roomid;
        const start = convertToFormat(booking.start, "L LT", locale);
        const end = convertToFormat(booking.end, "L LT", locale);

        this.pendingBooking = {
            id,
            description: `${roomName} (${start} – ${end})`,
        };
        await this.updateComplete;
        this.confirmDialog?.showModal();
    }

    private handleAbort() {
        this.confirmDialog?.close();
        this.pendingBooking = undefined;
    }

    private handleConfirm() {
        const id = this.pendingBooking?.id;
        this.confirmDialog?.close();
        this.pendingBooking = undefined;
        if (id) {
            this.handleCancellation(id);
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

    private get upcomingBookings() {
        const now = new Date();
        return this.patronsBookings.filter((booking) => new Date(booking.end) >= now);
    }

    private get pastBookings() {
        const now = new Date();
        return this.patronsBookings.filter((booking) => new Date(booking.end) < now);
    }

    private renderBookingsTable(bookings: any[], withActions: boolean) {
        return html`
            <table class="table-striped table-bordered table-responsive-sm table">
                <thead>
                    <tr>
                        <th>${__("Room")}</th>
                        <th>${__("Start")}</th>
                        <th>${__("End")}</th>
                        <th>${__("Purpose of Use")}</th>
                        ${withActions ? html`<th>${__("actions")}</th>` : nothing}
                    </tr>
                </thead>
                <tbody>
                    ${repeat(
                        bookings,
                        (booking) => booking.bookingid,
                        (booking) => {
                            const { bookingid, roomid, start, end, purpose_of_use } = booking;
                            return html`
                                <tr>
                                    <td>${this.rooms.find((room) => room.roomid == roomid).roomnumber}</td>
                                    <td>${formatDatetimeByLocale(start, locale)}</td>
                                    <td>${formatDatetimeByLocale(end, locale)}</td>
                                    <td
                                        class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap"
                                        title="${purpose_of_use}"
                                    >
                                        ${purpose_of_use}
                                    </td>
                                    ${withActions
                                        ? html`<td>
                                              <button class="btn" data-id=${bookingid} @click=${this.handleDeleteClick}>
                                                  ${__("Delete")}
                                              </button>
                                          </td>`
                                        : nothing}
                                </tr>
                            `;
                        },
                    )}
                </tbody>
            </table>
        `;
    }

    private renderUpcomingMaybe() {
        if (!this.patronsBookings.length) return nothing;
        const upcoming = this.upcomingBookings;
        return html`
            <section>
                <h2>${__("Upcoming reservations")}</h2>
                ${upcoming.length
                    ? html`
                          <p>${__("This table shows your current room reservations")}.</p>
                          ${this.renderBookingsTable(upcoming, true)}
                      `
                    : html`<p>${__("You have no upcoming reservations.")}</p>`}
            </section>
        `;
    }

    private renderPastMaybe() {
        const past = this.pastBookings;
        if (!past.length) return nothing;
        return html`
            <section>
                <h2>${__("Past reservations")}</h2>
                ${this.renderBookingsTable(past, false)}
            </section>
        `;
    }

    private renderConfirmDialog() {
        return html`
            <style>
                lms-patrons-bookings-table dialog.modal#confirm-dialog {
                    /* BS5 .modal { position: fixed; display: none; width: 100%; height: 100% } would
                       collide with native <dialog> top-layer rendering — revert to UA dialog defaults */
                    display: revert;
                    position: revert;
                    top: revert;
                    left: revert;
                    width: revert;
                    height: revert;
                    overflow: revert;
                    /* Strip the <dialog> UA chrome so .modal-content paints the card */
                    border: 0;
                    padding: 0;
                    background: transparent;
                }
                lms-patrons-bookings-table dialog.modal#confirm-dialog::backdrop {
                    background: rgba(0, 0, 0, 0.5);
                }
            </style>
            <dialog id="confirm-dialog" class="modal" aria-labelledby="confirm-dialog-title">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="confirm-dialog-title">${__("Please confirm")}</h5>
                            <button
                                type="button"
                                class="btn-close"
                                aria-label="${__("Close")}"
                                @click=${this.handleAbort}
                            ></button>
                        </div>
                        <div class="modal-body">
                            <p>${__("Are you sure you want to cancel this reservation:")}</p>
                            <p><strong>${this.pendingBooking?.description ?? ""}</strong></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click=${this.handleAbort}>
                                <i class="fa fa-times" aria-hidden="true"></i> ${__("Abort")}
                            </button>
                            <button type="button" class="btn btn-primary" @click=${this.handleConfirm}>
                                <i class="fa fa-check" aria-hidden="true"></i> ${__("Confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            </dialog>
        `;
    }

    override render() {
        return html`
            <h1>${__("Your bookings")}</h1>
            ${this.renderInfoMaybe()}
            ${this.pageUrl ? html`<a class="py-2" href="${this.pageUrl}">${__("Make a reservation")}</a>` : nothing}
            ${this.renderUpcomingMaybe()} ${this.renderPastMaybe()} ${this.renderConfirmDialog()}
        `;
    }
}
