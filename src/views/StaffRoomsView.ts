import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { repeat } from "lit/directives/repeat.js";
import { requestHandler } from "../lib/RequestHandler";
import { __ } from "../lib/translate";
import { LMSRoom } from "../main";
import { cardDeckStylesStaff } from "../styles/cardDeck";
import { skeletonStyles } from "../styles/skeleton";
import { tailwindStyles } from "../tailwind.lit";
import { Column } from "../types/common";

declare global {
    interface HTMLTagNameMap {
        "lms-room": LMSRoom;
    }
}

@customElement("lms-staff-rooms-view")
export default class StaffRoomsView extends LitElement {
    @state() hasLoaded = false;

    private isEmpty = false;

    // private hasNoResults = false;

    private libraries: Column[] = [];

    private rooms: Column[] = [];

    private openHours: Column[] = [];

    static override styles = [tailwindStyles, skeletonStyles, cardDeckStylesStaff];

    override connectedCallback() {
        super.connectedCallback();

        Promise.all([fetch("/api/v1/libraries"), requestHandler.get("rooms"), requestHandler.get("openHours")])
            .then((responses) => Promise.all(responses.map((response) => response.json())))
            .then(([libraries, rooms, openHours]) => {
                this.libraries = libraries.map((library: any) => ({
                    id: library.library_id,
                    name: library.name,
                }));
                this.rooms = rooms;
                this.openHours = openHours;
            })
            .then(() => {
                this.isEmpty = !this.hasData();
                this.hasLoaded = true;
            });
    }

    private hasData() {
        return this.rooms.length > 0;
    }

    async fetchUpdate() {
        const response = await requestHandler.get("rooms");
        this.rooms = await response.json();
        const isEmptyOrNoResults = this.rooms.length === 0;
        this.isEmpty = isEmptyOrNoResults;
        // this.hasNoResults = isEmptyOrNoResults;
        this.requestUpdate();
    }

    private filterLibrariesWithOpenHours() {
        const librariesWithOpenHours = this.openHours.reduce((accumulator: Set<string>, openHour: any) => {
            if (!accumulator.has(openHour.branch)) {
                accumulator.add(openHour.branch);
            }

            return accumulator;
        }, new Set());

        return this.libraries.filter((library) => librariesWithOpenHours.has(library["id"]!.toString()));
    }

    override render() {
        if (!this.hasLoaded) {
            return html` <div class="mx-8">
                <div class="card-deck">
                    ${map([...Array(10)], () => html`<div class="skeleton skeleton-card"></div>`)}
                </div>
            </div>`;
        }

        if (this.hasLoaded && this.isEmpty) {
            return html`<h1 class="text-center">${__("You can add a new room by clicking on the + button below")}.</h1>
                <lms-room-modal
                    .libraries=${this.filterLibrariesWithOpenHours()}
                    @created=${this.fetchUpdate}
                ></lms-room-modal>`;
        }

        return html`
            <div class="mx-8">
                <div class="card-deck">
                    ${repeat(
                        this.rooms,
                        (room) => room["roomid"],
                        (room) => html`
                            <lms-room
                                .branch=${room["branch"]}
                                .color=${room["color"]}
                                .description=${room["description"]}
                                .image=${room["image"]}
                                .libraries=${this.libraries}
                                .openHours=${this.openHours}
                                .maxbookabletime=${room["maxbookabletime"]}
                                .maxcapacity=${room["maxcapacity"]}
                                .roomid=${room["roomid"]}
                                .roomnumber=${room["roomnumber"]}
                                @deleted=${this.fetchUpdate}
                                @updated=${this.fetchUpdate}
                                class="bg-transparent"
                            ></lms-room>
                        `,
                    )}
                </div>
            </div>
            <lms-room-modal
                .libraries=${this.filterLibrariesWithOpenHours()}
                @created=${this.fetchUpdate}
            ></lms-room-modal>
        `;
    }
}
