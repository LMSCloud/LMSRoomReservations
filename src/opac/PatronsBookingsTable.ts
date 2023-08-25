import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { formatDatetimeByLocale } from "../lib/converters/datetimeConverters";
import { locale } from "../lib/translate";

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

    override render() {
        if (this.error) {
            return html` <p>${__("There has been a technical error. Please inform the staff.")}</p> `;
        }

        return html`
            <h1>${__("Your bookings")}</h1>
            <p>${__("This table shows your current room reservations")}.</p>
            <table class="table-striped table-bordered table-responsive-sm table">
                <thead>
                    <tr>
                        <th>${__("Room")}</th>
                        <th>${__("Start")}</th>
                        <th>${__("End")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${map(this.patronsBookings, (booking) => {
                        const { roomid, start, end } = booking;
                        return html`
                            <tr>
                                <td>${this.rooms.find((room) => room.roomid == roomid).roomnumber}</td>
                                <td>${formatDatetimeByLocale(start, locale)}</td>
                                <td>${formatDatetimeByLocale(end, locale)}</td>
                            </tr>
                        `;
                    })}
                </tbody>
            </table>
        `;
    }
}
