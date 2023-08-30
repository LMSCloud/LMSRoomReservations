import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { repeat } from "lit/directives/repeat.js";
import LMSContainer from "../components/LMSContainer";
import { requestHandler } from "../lib/RequestHandler";
import { __ } from "../lib/translate";
import { cardDeckStylesStaff } from "../styles/cardDeck";
import { skeletonStyles } from "../styles/skeleton";
import { tailwindStyles } from "../tailwind.lit";
import { Column } from "../types/common";

@customElement("lms-staff-equipment-view")
export default class StaffEquipmentView extends LMSContainer {
    @state() hasLoaded = false;

    private isEmpty = false;

    // private hasNoResults = false;

    private equipmentItems: Column[] = [];

    private rooms: Column[] = [];

    static override styles = [tailwindStyles, skeletonStyles, cardDeckStylesStaff];

    override connectedCallback() {
        super.connectedCallback();

        Promise.all([requestHandler.get("equipment"), requestHandler.get("rooms")])
            .then((responses) => Promise.all(responses.map((response) => response.json())))
            .then(([equipment, rooms]) => {
                this.equipmentItems = equipment;
                this.rooms = rooms;
            })
            .then(() => {
                this.isEmpty = !this.hasData();
                this.hasLoaded = true;
            });
    }

    private hasData() {
        return this.equipmentItems.length > 0;
    }

    async fetchUpdate() {
        const response = await requestHandler.get("equipment");
        this.equipmentItems = await response.json();
        const isEmptyOrNoResults = this.equipmentItems.length === 0;
        this.isEmpty = isEmptyOrNoResults;
        // this.hasNoResults = isEmptyOrNoResults;
        this.requestUpdate();
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
            return html`<h1 class="text-center">
                    ${__("You can add a new equipment item by clicking on the + button below")}.
                </h1>
                <lms-equipment-modal @created=${this.fetchUpdate}></lms-equipment-modal>`;
        }

        return html`
            <div class="mx-8">
                <div class="card-deck">
                    ${repeat(
                        this.equipmentItems,
                        (equipmentItem) => equipmentItem["equipmentid"],
                        (equipmentItem) => html`
                            <lms-equipment-item
                                .description=${equipmentItem["description"]}
                                .equipmentid=${equipmentItem["equipmentid"]}
                                .equipmentname=${equipmentItem["equipmentname"]}
                                .image=${equipmentItem["image"]}
                                .maxbookabletime=${equipmentItem["maxbookabletime"]}
                                .roomid=${equipmentItem["roomid"]}
                                .rooms=${this.rooms}
                                @deleted=${this.fetchUpdate}
                                @updated=${this.fetchUpdate}
                                class="bg-transparent"
                            ></lms-equipment-item>
                        `,
                    )}
                </div>
                <div>
                    <lms-equipment-modal @created=${this.fetchUpdate}></lms-equipment-modal>
                </div>
            </div>
        `;
    }
}
