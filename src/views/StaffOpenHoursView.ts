import BiMap from "bidirectional-map";
import { LitElement, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { repeat } from "lit/directives/repeat.js";
import { requestHandler } from "../lib/RequestHandler";
import { __ } from "../lib/translate";
import { cardDeckStylesStaff } from "../styles/cardDeck";
import { skeletonStyles } from "../styles/skeleton";
import { tailwindStyles } from "../tailwind.lit";
import { Column } from "../types/common";

export const dayMapping: BiMap<string> = new BiMap({
    0: "Monday",
    1: "Tuesday",
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
    5: "Saturday",
    6: "Sunday",
});

@customElement("lms-staff-open-hours-view")
export default class StaffOpenHoursView extends LitElement {
    @state() hasLoaded = false;

    // private isEmpty = false;

    // private hasNoResults = false;

    private libraries: Column[] = [];

    private openHours: Column[] = [];

    private dayMapping: BiMap<string> = dayMapping;

    static override styles = [tailwindStyles, skeletonStyles, cardDeckStylesStaff];

    override connectedCallback() {
        super.connectedCallback();

        Promise.all([fetch("/api/v1/libraries"), requestHandler.get("openHours")])
            .then((responses) => Promise.all(responses.map((response) => response.json())))
            .then(([libraries, openHours]) => {
                (this.libraries = libraries.map((library: any) => ({
                    id: library.library_id,
                    name: library.name,
                }))),
                    (this.openHours = openHours);
            })
            .then(() => {
                // this.isEmpty = !this.hasData();
                this.hasLoaded = true;
            });
    }

    // private hasData() {
    //     return this.openHours.length > 0;
    // }

    async fetchUpdate() {
        const response = await requestHandler.get("openHours");
        this.openHours = await response.json();
        // const isEmptyOrNoResults = this.openHours.length === 0;
        // this.isEmpty = isEmptyOrNoResults;
        // this.hasNoResults = isEmptyOrNoResults;
        this.requestUpdate();
    }

    /**
        CREATE TABLE { { open_hours } } (
            openid INT NOT NULL AUTO_INCREMENT,
            day INT NOT NULL,
            start TIME NOT NULL,
            -- start date/time of opening hours
            end TIME NOT NULL,
            -- end date/time of opening hours
            branch VARCHAR(255),
            -- branch on which open hours apply
            PRIMARY KEY (openid)
            ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;
            */

    private async handleReconciliation(e: Event) {
        e.preventDefault();
        const target = e.target as HTMLFormElement;

        const selectedBranches = Array.from(target.querySelectorAll('input[type="checkbox"]:checked')).map(
            (checkbox) => checkbox.id,
        );
        const existingBranchIds = this.openHours.map((openHours) => openHours["branch"]);

        const existingBranchIdsSet = new Set(existingBranchIds);
        const selectedBranchesSet = new Set(selectedBranches);

        const branchesToDelete = existingBranchIds.filter((branchId) => !selectedBranchesSet.has(branchId as string));
        const branchesToCreate = selectedBranches.filter((branchId) => !existingBranchIdsSet.has(branchId));

        // Delete branches from the openHours array
        this.openHours = this.openHours.filter((openHours) => !branchesToDelete.includes(openHours["branch"]));

        // Delete branches from the server
        const uniqueBranchesToDelete = new Set(branchesToDelete);
        const deletePromises = Array.from(uniqueBranchesToDelete).map((branchId) =>
            requestHandler.delete("openHours", undefined, [branchId as string]),
        );
        if (deletePromises.length) {
            await Promise.all(deletePromises);
        }

        // Create branches in the openHours array
        const uninitialisedTime = "00:00:00";
        const createOpenHoursData: any[] = [];
        branchesToCreate.forEach((branchId) => {
            Array.from(this.dayMapping.keys()).forEach((day) => {
                createOpenHoursData.push({
                    day,
                    start: uninitialisedTime,
                    end: uninitialisedTime,
                    branch: branchId,
                });
            });
        });

        if (createOpenHoursData.length) {
            await requestHandler.post("openHours", createOpenHoursData);
        }

        // this.isEmpty = !this.hasData();
        this.fetchUpdate();
    }

    override render() {
        if (!this.hasLoaded) {
            return html` <div class="mx-8">
                <div class="card-deck">
                    ${map([...Array(10)], () => html`<div class="skeleton skeleton-card"></div>`)}
                </div>
            </div>`;
        }

        const openHoursIds = this.openHours.map((openHours) => openHours["branch"]);
        return html`
            <form
                @submit=${this.handleReconciliation}
                class="m-2 flex flex-row items-center justify-between rounded-lg bg-base-100 p-2 shadow-md"
            >
                <span class="mx-2"> ${__("Please select the branches you'd like to define open hours for")}. </span>
                <div class="flex flex-row overflow-x-scroll">
                    ${repeat(
                        this.libraries,
                        (library) => library["id"],
                        (library) => html`
                            <div class="form-control">
                                <label class="label cursor-pointer">
                                    <input
                                        type="checkbox"
                                        class="checkbox mr-2"
                                        id=${library["id"]}
                                        name=${library["id"]}
                                        ?checked=${openHoursIds.includes(library["id"])}
                                    />
                                    <span class="label-text">${library["name"]}</span>
                                </label>
                            </div>
                        `,
                    )}
                </div>
                <button class="btn" type="submit">${__("Update")}</button>
            </form>
            <div class="card-deck">
                ${repeat(
                    this.libraries,
                    (library) => library["id"],
                    (library) => {
                        const openHoursByLibrary = this.openHours.filter(
                            (openHours) => openHours["branch"] == library["id"],
                        );

                        if (!openHoursByLibrary.length) {
                            return nothing;
                        }

                        return html`
                            <div class="card my-4 rounded-xl border bg-base-100 py-4 shadow-xl">
                                <div class="badge badge-lg mx-4">${library["name"]}</div>
                                <lms-open-hours-table
                                    .openHours=${openHoursByLibrary}
                                    .libraries=${this.libraries}
                                    .branch=${library}
                                    class="my-2"
                                ></lms-open-hours-table>
                            </div>
                        `;
                    },
                )}
            </div>
        `;
    }
}
