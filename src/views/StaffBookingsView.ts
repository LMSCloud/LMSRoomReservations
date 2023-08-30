import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { requestHandler } from "../lib/RequestHandler";
import { normalizeForInput } from "../lib/converters/datetimeConverters";
import { __ } from "../lib/translate";
import { cardDeckStylesStaff } from "../styles/cardDeck";
import { skeletonStyles } from "../styles/skeleton";
import { tailwindStyles } from "../tailwind.lit";
import { Column } from "../types/common";

@customElement("lms-staff-bookings-view")
export default class StaffBookingsView extends LitElement {
    @state() hasLoaded = false;

    private isEmpty = false;

    // private hasNoResults = false;

    private borrowers: Record<string, any> = {};

    private rooms: Column[] = [];

    private bookings: Column[] = [];

    private equipment: Column[] = [];

    static override styles = [tailwindStyles, skeletonStyles, cardDeckStylesStaff];

    override connectedCallback() {
        super.connectedCallback();

        Promise.all([requestHandler.get("rooms"), requestHandler.get("bookings"), requestHandler.get("equipment")])
            .then((responses) => Promise.all(responses.map((response) => response.json())))
            .then(([rooms, bookings, equipment]) => {
                this.rooms = rooms.map((room: any) => ({
                    id: room.roomid,
                    name: room.roomnumber,
                }));
                this.bookings = bookings.map((booking: any) => {
                    return {
                        ...booking,
                        start: normalizeForInput(booking["start"], "datetime-local"),
                        end: normalizeForInput(booking["end"], "datetime-local"),
                        equipment: [booking["roomid"], booking["equipment"]],
                    };
                });
                this.equipment = equipment.map((equipmentItem: any) => ({
                    id: equipmentItem.equipmentid,
                    name: equipmentItem.equipmentname,
                    roomid: equipmentItem.roomid,
                }));

                return Array.from(new Set(bookings.map((booking: any) => booking.borrowernumber)));
            })
            .then((borrowernumbers) => {
                return fetch(`/api/v1/patrons?q={"borrowernumber":[${borrowernumbers}]}`);
            })
            .then((response) => response.json())
            .then((borrowers: any[]) => {
                this.borrowers = borrowers.reduce(
                    (acc, borrower) => ({
                        ...acc,
                        [borrower.patron_id]: borrower,
                    }),
                    {},
                );
                this.isEmpty = !this.hasData();
                this.hasLoaded = true;
            });
    }

    private hasData() {
        return this.bookings.length > 0;
    }

    async fetchUpdate() {
        const response = await requestHandler.get("bookings");
        const bookings = await response.json();
        this.bookings = bookings.map((booking: any) => {
            return {
                ...booking,
                start: normalizeForInput(booking["start"], "datetime-local"),
                end: normalizeForInput(booking["end"], "datetime-local"),
                equipment: [booking["roomid"], booking["equipment"]],
            };
        });
        const isEmptyOrNoResults = this.bookings.length === 0;
        this.isEmpty = isEmptyOrNoResults;
        // this.hasNoResults = isEmptyOrNoResults;
        this.requestUpdate();
    }

    override render() {
        if (!this.hasLoaded) {
            return html` <div class="mx-8">
                <div class="skeleton skeleton-table"></div>
            </div>`;
        }

        if (this.hasLoaded && this.isEmpty) {
            return html`<h1 class="text-center">
                    ${__("You can add a new booking by clicking on the + button below")}.
                </h1>
                <lms-bookings-modal
                    .rooms=${this.rooms}
                    .equipment=${this.equipment}
                    @created=${this.fetchUpdate}
                ></lms-bookings-modal>`;
        }

        return html`
            <lms-bookings-table
                .bookings=${this.bookings}
                .rooms=${this.rooms}
                .borrowers=${this.borrowers}
                .equipment=${this.equipment}
                @deleted=${this.fetchUpdate}
            ></lms-bookings-table>
            <lms-bookings-modal
                .rooms=${this.rooms}
                .equipment=${this.equipment}
                @created=${this.fetchUpdate}
            ></lms-bookings-modal>
        `;
    }
}
