import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { styleMap } from "lit/directives/style-map.js";
import { requestHandler } from "../lib/RequestHandler";
import { formatMinutesHumanReadable } from "../lib/converters/timeConverter";
import { __, attr__ } from "../lib/translate";
import { LMSBookie, LMSCalendar } from "../main";
import { tailwindStyles } from "../tailwind.lit";

@customElement("lms-room-reservations-view")
export default class RoomReservationsView extends LitElement {
    @state() hasLoaded = false;

    @state() selectedRoom: any | undefined;

    @property({ type: String }) borrowernumber: string = "";

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
            }

            @media (min-width: 1024px) {
                lms-calendar {
                    height: unset;
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
        ])
            .then((responses) => Promise.all(responses.map((response) => response.json())))
            .then(([libraries, openHours, rooms, equipment, default_max_booking_time, bookings]) => {
                (this.libraries = libraries), (this.openHours = openHours);
                this.rooms = rooms;
                this.equipment = equipment;
                this.defaultMaxBookingtime = default_max_booking_time.value;
                this.bookings = bookings;
            })
            .then(() => {
                this.lmsCalendar.activeDate = {
                    day: this.currentDate.getDate(),
                    month: this.currentDate.getMonth() + 1,
                    year: this.currentDate.getFullYear(),
                };
                this.updateCalendar();
                this.hasLoaded = true;
            });
    }

    private updateCalendar() {
        this.lmsCalendar.entries = this.bookings.map((booking) => {
            const { roomid, start, end, blackedout } = booking;
            const [s, e] = [new Date(start), new Date(end)];
            const bookedRoomId = roomid;
            const room = this.rooms.find((room) => room.roomid == bookedRoomId);
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
                    start: { hours: s.getHours(), minutes: s.getMinutes() },
                    end: { hours: e.getHours(), minutes: e.getMinutes() },
                },
                heading,
                content: blackedout ? __("Blocked") : __("Booked"),
                color,
            };
        });
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
        return html` <div class="flex w-full flex-col gap-4 lg:mx-4 lg:flex-row">
                <lms-bookie
                    .borrowernumber=${this.borrowernumber}
                    .openHours=${this.openHours}
                    .rooms=${this.rooms}
                    .equipment=${this.equipment}
                    .defaultMaxBookingTime=${this.defaultMaxBookingtime}
                    .selectedRoom=${this.selectedRoom}
                    class="order-2 w-full lg:order-1 lg:w-1/4"
                    @updated=${this.fetchUpdate}
                ></lms-bookie>
                <lms-calendar class="order-1 w-full lg:order-2 lg:max-h-screen lg:w-3/4"></lms-calendar>
            </div>
            <div class="mt-4 flex flex-row gap-4 overflow-x-scroll lg:mx-4">
                ${map(this.rooms, (room) => {
                    const { branch, color, description, image, maxbookabletime, maxcapacity, roomnumber } = room;
                    const library = this.libraries.find((library) => library.library_id === branch);

                    return html`
                        <div class="card min-w-full border bg-base-100 sm:w-96 sm:min-w-max">
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
                                        <span>${library.name}</span>
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
