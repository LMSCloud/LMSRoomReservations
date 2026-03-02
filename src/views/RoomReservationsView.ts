import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { styleMap } from "lit/directives/style-map.js";
import { requestHandler } from "../lib/RequestHandler";
import { formatMinutesHumanReadable } from "../lib/converters/timeConverter";
import { __, attr__ } from "../lib/translate";
import { LMSBookie, LMSCalendar } from "../main";
import { tailwindStyles } from "../tailwind.lit";

declare global {
    interface HTMLElementTagNameMap {
        "lms-bookie": LMSBookie;
        "lms-calendar": LMSCalendar;
    }
}

@customElement("lms-room-reservations-view")
export default class RoomReservationsView extends LitElement {
    @state() hasLoaded = false;

    @state() selectedRoom?: any;

    @property({ type: String }) borrowernumber?: string;

    private patron?: Record<string, any>;

    private bookings: any[] = [];

    private equipment: any[] = [];

    private libraries: any[] = [];

    private openHours: any[] = [];

    private rooms: any[] = [];

    private defaultMaxBookingtime: number = 0;

    private currentDate = new Date();

    @query("lms-calendar") lmsCalendar!: LMSCalendar;

    @query("lms-bookie") lmsBookie!: LMSBookie;

    static override styles = [
        tailwindStyles,
        css`
            lms-calendar {
                height: 90vh;
                width: 100%;

                /* kalendus "default" theme tokens */
                --background-color: white;
                --primary-color: #3b82f6;
                --system-ui: system-ui, 'Segoe UI', Roboto, Helvetica, Arial,
                    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
                    'Segoe UI Symbol';
                --monospace-ui: 'SF Mono', Monaco, 'Cascadia Code',
                    'Roboto Mono', Consolas, 'Courier New', monospace;
                --header-text-color: rgba(0, 0, 0, 0.6);
                --indicator-color: var(--primary-color);
                --indicator-font-weight: 600;
                --day-label-font-weight: 500;
                --day-label-number-font-weight: 600;
                --menu-item-font-weight: 500;
                --menu-title-font-weight: 500;
                --border-radius-sm: 5px;
                --border-radius-md: 7px;
                --border-radius-lg: 12px;
                --entry-border-radius: var(--border-radius-sm);
                --month-indicator-border-radius: 1em;
                --year-day-cell-border-radius: 50%;
                --float-text-border-radius: 3px;
                --shadow-sm: rgba(0, 0, 0, 0.18) 0px 2px 4px;
                --shadow-md: rgba(0, 0, 0, 0.15) 0px 3px 3px 0px;
                --shadow-lg: rgba(0, 0, 0, 0.15) 0px 2px 8px;
                --shadow-hv: rgba(0, 0, 0, 0.08) 0px 4px 12px;
                --active-indicator-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
                --float-text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                --transition-speed: 0.15s;
                --hover-bg: var(--separator-light, rgba(0, 0, 0, 0.1));
                --focus-bg: var(--separator-light, rgba(0, 0, 0, 0.1));
                --peek-active-bg: var(--separator-mid, rgba(0, 0, 0, 0.12));
                --current-day-hover-opacity: 0.85;
                --export-hover-opacity: 0.7;
                --entry-background-color: var(--background-color);
                --entry-color: var(--primary-color);
                --entry-highlight-color: var(--separator-light);
                --entry-title-weight: 500;
                --entry-time-opacity: 0.8;
                --title-column-weight: 500;
                --context-bg: var(
                    --separator-light,
                    rgba(0, 0, 0, 0.06)
                );
                --active-indicator-bg: var(--background-color, white);
                --indicator-backdrop-filter: blur(10px);
                --multi-day-separator: 3px solid rgba(255, 255, 255, 0.4);
                --month-label-font-weight: 600;
                --year-weekday-font-weight: 500;
                --year-month-label-hover-color: var(
                    --primary-color,
                    #3b82f6
                );
                --cw-hover-color: var(--primary-color, #3b82f6);
                --cw-hover-bg: var(
                    --separator-light,
                    rgba(0, 0, 0, 0.06)
                );
                --current-day-bg: var(--primary-color, #3b82f6);
                --current-day-color: white;
                --current-day-font-weight: 600;
                --current-dot-bg: rgba(255, 255, 255, 0.9);
                --year-heatmap-4-text: white;
                --float-text-bg: rgba(255, 255, 255, 0.95);
                --menu-transform-origin: scale(0.95);
                --menu-transform-active: scale(1);
            }

            @media (min-width: 1024px) {
                lms-calendar {
                    height: 700px;
                }
            }
        `,
    ];

    override connectedCallback() {
        super.connectedCallback();

        Promise.all([
            // TODO: Replace librariesPublic on 22.11 w/ native endpoint
            requestHandler.get("librariesPublic"),
            requestHandler.get("openHoursPublic"),
            requestHandler.get("roomsPublic"),
            requestHandler.get("equipmentPublic"),
            requestHandler.get("settingsPublic", undefined, ["default_max_booking_time"]),
            requestHandler.get("bookingsPublic"),
            requestHandler.get("patronPublic"),
        ])
            .then((responses) => Promise.all(responses.map((response) => response.json())))
            .then(([libraries, openHours, rooms, equipment, default_max_booking_time, bookings, patron]) => {
                this.libraries = libraries;
                this.openHours = openHours;
                this.rooms = rooms;
                this.equipment = equipment;
                this.defaultMaxBookingtime = default_max_booking_time.value;
                this.bookings = bookings;
                this.patron = patron;
            })
            .then(() => {
                this.lmsCalendar.activeDate = {
                    day: this.currentDate.getDate(),
                    month: this.currentDate.getMonth() + 1,
                    year: this.currentDate.getFullYear(),
                };
                this.updateCalendar();
                this.hasLoaded = true;
            })
            .catch((error) => {
                console.error("Failed to load room reservations data:", error);
                this.hasLoaded = true;
            });
    }

    private updateCalendar() {
        this.lmsCalendar.entries = this.bookings.map((booking) => {
            const { roomid, start, end, blackedout } = booking;
            const [s, e] = [new Date(start), new Date(end)];
            const bookedRoomId = roomid;
            const room = this.rooms.find((room) => room.roomid == bookedRoomId);
            if (!room) return null;
            const { roomnumber: heading, color } = room;
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
                    start: { hour: s.getHours(), minute: s.getMinutes() },
                    end: { hour: e.getHours(), minute: e.getMinutes() },
                },
                heading,
                content: (blackedout ? __("Blocked") : __("Booked")) as unknown as string,
                color,
                isContinuation: false,
            };
        }).filter((entry): entry is NonNullable<typeof entry> => entry != null);
    }

    async fetchUpdate() {
        const response = await requestHandler.get("bookingsPublic");
        this.bookings = await response.json();
        this.requestUpdate();
        this.updateCalendar();
    }

    private handleRoomSelection(room: any) {
        this.selectedRoom = room;
        const bookieAnchor = this.lmsBookie.shadowRoot?.getElementById("book-it-here");
        bookieAnchor?.scrollIntoView();
    }

    override render() {
        return html` <div class="flex w-full flex-col gap-4 lg:flex-row lg:px-4">
                <lms-bookie
                    .borrowernumber=${this.borrowernumber}
                    .patron=${this.patron}
                    .openHours=${this.openHours}
                    .rooms=${this.rooms}
                    .equipment=${this.equipment}
                    .defaultMaxBookingTime=${this.defaultMaxBookingtime}
                    .selectedRoom=${this.selectedRoom}
                    class="order-2 w-full lg:order-1 lg:w-1/4"
                    @updated=${this.fetchUpdate}
                ></lms-bookie>
                <lms-calendar year-drill-target="day" year-density-mode="heatmap" class="order-1 min-w-0 overflow-hidden w-full lg:order-2 lg:w-3/4"></lms-calendar>
            </div>
            <div class="mt-4 flex flex-row gap-4 overflow-x-auto lg:px-4">
                ${map(this.rooms, (room) => {
                    const { branch, color, description, image, maxbookabletime, maxcapacity, roomnumber } = room;
                    const library = this.libraries.find((library) => library.library_id === branch);

                    return html`
                        <div class="card w-72 shrink-0 border bg-base-100 sm:w-80">
                            <figure>
                                <img
                                    class="w-full object-cover"
                                    src=${image}
                                    alt="${attr__("A depiction of room")}&nbsp;${roomnumber}"
                                />
                            </figure>
                            <div class="card-body">
                                <h2 class="card-title">
                                    ${roomnumber}&nbsp;<span
                                        class="badge badge-lg shadow-md"
                                        style=${styleMap({
                                            color,
                                            backgroundColor: color,
                                            borderColor: color,
                                        })}
                                    ></span>
                                </h2>
                                <p>${description}</p>
                                <hr />
                                <!-- List of Properties -->
                                <div class="space-y-2">
                                    <div class="flex items-center justify-between">
                                        <span class="font-semibold">${__("Branch")}</span>
                                        <span>${library?.name ?? branch}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="font-semibold">${__("Max Bookable Time")}</span>
                                        <span>${formatMinutesHumanReadable(parseInt(maxbookabletime, 10))}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="font-semibold">${__("Max Capacity")}</span>
                                        <span>${maxcapacity} ${__("persons")}</span>
                                    </div>
                                </div>
                                <hr />
                                <div class="card-actions justify-end">
                                    <button class="btn btn-outline" @click=${() => this.handleRoomSelection(room)}>
                                        ${__("Book this room")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                })}
            </div>`;
    }
}
