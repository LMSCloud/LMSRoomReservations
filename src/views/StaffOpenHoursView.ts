import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import BiMap from "bidirectional-map";
import { LitElement, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import { requestHandler } from "../lib/RequestHandler";
import { __, attr__ } from "../lib/translate";
import { LMSOpenHoursTable } from "../main";
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

declare global {
    interface HTMLTagNameMap {
        "lms-open-hours-table": LMSOpenHoursTable;
    }
}

@customElement("lms-staff-open-hours-view")
export default class StaffOpenHoursView extends LitElement {
    @state() hasLoaded = false;

    @state() selectedLibraryId?: string;

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

    private handleEdit(e: Event) {
        const target = e.target;
        if (!(target instanceof HTMLButtonElement)) {
            return;
        }

        this.selectedLibraryId = target.id;
    }

    private handleAbort() {
        this.selectedLibraryId = undefined;
    }

    private toggleTooltip(e: Event) {
        const target = e.target;
        if (!(target instanceof Element)) {
            return;
        }

        const tooltip = target.closest("div");
        if (!tooltip) {
            return;
        }

        tooltip.classList.toggle("tooltip-open");
    }

    private renderOpeningHoursTableMaybe(openHoursByLibrary: any[]) {
        if (!openHoursByLibrary.length) {
            return nothing;
        }

        const library = this.libraries.find((library) => library["id"] == this.selectedLibraryId);
        if (!library) {
            console.error("The selected library could not be found within the libraries endpoint response.");
            return nothing;
        }

        return html`
            <div class="badge badge-lg m-4">${library["name"]}</div>
            <lms-open-hours-table
                .openHours=${openHoursByLibrary}
                .libraries=${this.libraries}
                .branch=${library}
                class="my-2"
            ></lms-open-hours-table>
        `;
    }

    override render() {
        if (!this.hasLoaded) {
            return html` <div class="mx-8">
                <div class="skeleton skeleton-table"></div>
            </div>`;
        }

        const openHoursIds = this.openHours.map((openHours) => openHours["branch"]);
        const openHoursByLibrary = this.openHours.filter((openHours) => openHours["branch"] == this.selectedLibraryId);
        return html`
            <div class="flex flex-col sm:flex-row">
                <form
                    @submit=${this.handleReconciliation}
                    class="m-2 flex flex-row items-center justify-between gap-2 rounded-xl bg-base-100 p-2 shadow-sm sm:w-fit sm:flex-col sm:p-4"
                >
                    <div
                        class="tooltip tooltip-right"
                        data-tip="${attr__("Please select the branches you'd like to define open hours for")}."
                        @click=${this.toggleTooltip}
                    >
                        <button class="btn btn-square">
                            ${litFontawesome(faInfoCircle, { className: "inline-block w-6 h-6" })}
                        </button>
                    </div>
                    <div
                        class="flex flex-row overflow-x-scroll rounded-xl border border-base-200 sm:flex-col sm:overflow-x-auto"
                    >
                        ${repeat(
                            this.libraries,
                            (library) => library["id"],
                            (library) => html`
                                <div
                                    class="inline-flex items-center justify-between border-r border-base-200 p-2 last:border-r-0 sm:border-b sm:border-r-0  sm:p-4 sm:last:border-b-0"
                                >
                                    <div class="form-control">
                                        <label class="label cursor-pointer">
                                            <input
                                                type="checkbox"
                                                class="checkbox mr-2"
                                                id=${ifDefined(library["id"])}
                                                name=${ifDefined(library["id"])}
                                                ?checked=${openHoursIds.includes(library["id"])}
                                            />
                                            <span class="label-text whitespace-nowrap">${library["name"]}</span>
                                        </label>
                                    </div>
                                    <button
                                        class="${classMap({
                                            hidden: this.selectedLibraryId === library["id"],
                                        })} btn btn-sm"
                                        id=${ifDefined(library["id"])}
                                        @click=${this.handleEdit}
                                        ?disabled=${!openHoursIds.includes(library["id"])}
                                    >
                                        ${__("Edit")}
                                    </button>
                                    <button
                                        class="${classMap({
                                            hidden: this.selectedLibraryId !== library["id"],
                                            block:
                                                this.selectedLibraryId !== undefined &&
                                                this.selectedLibraryId === library["id"],
                                        })} btn btn-sm"
                                        id=${ifDefined(library["id"])}
                                        @click=${this.handleAbort}
                                    >
                                        ${__("Abort")}
                                    </button>
                                </div>
                            `,
                        )}
                    </div>
                    <button class="btn sm:w-full" type="submit">${__("Update")}</button>
                </form>
                <div class="flex-grow">${this.renderOpeningHoursTableMaybe(openHoursByLibrary)}</div>
            </div>
        `;
    }
}
