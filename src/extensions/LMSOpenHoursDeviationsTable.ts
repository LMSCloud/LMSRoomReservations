import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { repeat } from "lit/directives/repeat.js";
import LMSTable from "../components/LMSTable";
import { formatDatetimeByLocale } from "../lib/converters/datetimeConverters";
import { requestHandler } from "../lib/RequestHandler";
import { localeFull, __ } from "../lib/translate";

@customElement("lms-open-hours-deviations-table")
export default class LMSOpenHoursDeviationsTable extends LMSTable {
    @property({ type: Object }) branch: any = {};

    @property({ type: Array }) deviations: any[] = [];

    @property({ type: Array }) rooms: any[] = [];

    @property({ type: Array }) libraries: any[] = [];

    override async handleDelete(e: Event) {
        console.log("handleDelete called", e);

        // The event comes from the confirmation modal, but we need to use the stored ref
        // @ts-ignore - accessing private property from parent
        const originalButton = this.confirmationModal.ref as HTMLElement;
        console.log("originalButton", originalButton);

        if (!originalButton) {
            console.error("No reference button found in confirmation modal");
            return;
        }

        let parent = originalButton.parentElement;
        while (parent && parent.tagName !== "TR") {
            parent = parent.parentElement;
        }

        if (!parent) {
            console.error("Could not find parent TR element");
            return;
        }

        const key = (parent as HTMLTableRowElement).dataset["deviationid"];

        if (!key) {
            console.error("No deviationid found on TR element");
            return;
        }

        const response = await requestHandler.delete("openHoursDeviations", undefined, [key.toString()]);
        if (response.status >= 200 && response.status <= 299) {
            this.dispatchEvent(new CustomEvent("deleted", { detail: key }));
            return;
        }

        if (response.status >= 400) {
            const error = await response.json();
            this.renderToast(response.statusText, error);
        }
    }

    constructor() {
        super();
        this.order = [
            "source",
            "isblackout",
            "start",
            "end",
            "recurrencetype",
            "recurrencedays",
            "recurrenceuntil",
            "branches",
            "rooms",
            "description",
        ];
        this.isEditable = false;
        this.isDeletable = true;
        this.hasControls = false;
    }

    override connectedCallback() {
        super.connectedCallback();
        this.hydrate();
    }

    private hydrate() {
        this.data = this.deviations.map((deviation) => {
            // Add a source indicator with min-width to prevent badge width changes
            const source = deviation.is_koha_holiday
                ? html`<span class="badge badge-info badge-sm min-w-[6rem] whitespace-nowrap"
                      >${__("Koha Calendar")}</span
                  >`
                : html`<span class="badge badge-primary badge-sm min-w-[6rem] whitespace-nowrap"
                      >${__("Plugin")}</span
                  >`;

            // Format branches - interpolate branch names from IDs
            const branchesText =
                deviation.branches && deviation.branches.length > 0
                    ? deviation.branches
                          .map((branchId: string) => {
                              const library = this.libraries.find(
                                  (lib: any) => lib.id === branchId || lib.library_id === branchId,
                              );
                              return library ? library.name : branchId;
                          })
                          .join(", ")
                    : __("All branches");
            const branches = html`<span class="whitespace-nowrap">${branchesText}</span>`;

            // Format rooms - keep room numbers together
            const roomsText =
                deviation.rooms && deviation.rooms.length > 0
                    ? deviation.rooms
                          .map((roomId: number) => {
                              const room = this.rooms.find((r: any) => r.roomid === roomId);
                              return room ? room.roomnumber : `Room ${roomId}`;
                          })
                          .join(", ")
                    : __("All rooms");
            const rooms = html`<span class="whitespace-nowrap">${roomsText}</span>`;

            // Format recurrence type with min-width for consistency
            const recurrencetypeText = deviation.recurrencetype ? __(deviation.recurrencetype) : __("none");
            const recurrencetype = html`<span class="min-w-[5rem] whitespace-nowrap">${recurrencetypeText}</span>`;

            // Format recurrence days - keep short abbreviations together
            const recurrencedays = deviation.recurrencedays
                ? html`<span class="whitespace-nowrap">${this.formatWeekdays(deviation.recurrencedays)}</span>`
                : html`<span class="whitespace-nowrap">-</span>`;

            // Format recurrence until date
            const recurrenceuntil = deviation.recurrenceuntil
                ? html`<span class="whitespace-nowrap">${deviation.recurrenceuntil}</span>`
                : html`<span class="whitespace-nowrap">-</span>`;

            // Format isblackout as a badge with consistent width
            const isblackout = deviation.isblackout
                ? html`<span class="badge badge-error badge-sm min-w-[5rem] whitespace-nowrap">${__("Closed")}</span>`
                : html`<span class="badge badge-success badge-sm min-w-[5rem] whitespace-nowrap"
                      >${__("Special Hours")}</span
                  >`;

            // Format datetime fields using localized datetime formatter (readonly display)
            const start = deviation.start
                ? html`<span class="whitespace-nowrap">${formatDatetimeByLocale(deviation.start, localeFull)}</span>`
                : html`<span class="whitespace-nowrap">-</span>`;

            const end = deviation.end
                ? html`<span class="whitespace-nowrap">${formatDatetimeByLocale(deviation.end, localeFull)}</span>`
                : html`<span class="whitespace-nowrap">-</span>`;

            // Format description - use line-clamp for multi-line truncation with tooltip
            const description = html`<span
                class="line-clamp-2 inline-block max-w-xs"
                title="${deviation.description || "-"}"
                >${deviation.description || "-"}</span
            >`;

            return Object.fromEntries([
                ["source", source],
                ["isblackout", isblackout],
                ["start", start],
                ["end", end],
                ["recurrencetype", recurrencetype],
                ["recurrencedays", recurrencedays],
                ["recurrenceuntil", recurrenceuntil],
                ["branches", branches],
                ["rooms", rooms],
                ["description", description],
            ]);
        });
    }

    private formatWeekdays(days: string) {
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        const dayNumbers = days.split(",").map((d) => parseInt(d.trim(), 10));
        const dayList = dayNumbers.map((num) => dayNames[num]).filter(Boolean);

        return html`${dayList.map((day, i) => html`${i > 0 ? html`, ` : nothing}${__(day!)}`)}`;
    }

    override updated(changedProperties: Map<string, never>) {
        super.updated(changedProperties);
        if (changedProperties.has("deviations")) {
            this.hydrate();
        }
    }

    private handleDeviationConfirm(e: Event) {
        console.log("handleDeviationConfirm called", e.target);
        this.confirmationModal.header = __("Please confirm");
        this.confirmationModal.message = __("Are you sure you want to delete this deviation?");
        this.confirmationModal.ref = e.target;
        this.confirmationModal.showModal();
    }

    // Override render to handle Koha holidays differently (non-deletable)
    override render() {
        if (!this.data.length) {
            return html`<h1 class="text-center">${this.emptyTableMessage}</h1>`;
        }

        // Get headers from order since headers is private
        const headers = this.order;

        return html`
            <div class="mx-4">
                <div class="overflow-x-auto overflow-y-clip">
                    <table class="table table-lg bg-base-100">
                        <thead>
                            <tr>
                                ${map(
                                    headers,
                                    (key) => html`<th class="text-center text-base font-medium">${__(key)}</th>`,
                                )}
                                ${this.isDeletable
                                    ? html`<th class="text-center text-base font-medium">${__("actions")}</th>`
                                    : nothing}
                            </tr>
                        </thead>
                        <tbody>
                            ${repeat(
                                this.data,
                                (datum) => datum["uuid"],
                                (datum, index) => {
                                    const deviation = this.deviations[index];
                                    const isKohaHoliday = deviation?.is_koha_holiday;

                                    return html`
                                        <tr class="h-full" data-deviationid=${deviation?.deviationid || ""}>
                                            ${map(
                                                headers,
                                                (header) =>
                                                    html`<td class="px-2 py-3 text-center align-middle">
                                                        ${datum[header]}
                                                    </td>`,
                                            )}
                                            ${this.isDeletable
                                                ? html`
                                                      <td class="px-2 py-3 text-center align-middle">
                                                          ${isKohaHoliday
                                                              ? html`<span
                                                                    class="inline-block text-xs text-base-content/60"
                                                                    >${__("Managed by Koha")}</span
                                                                >`
                                                              : html`
                                                                    <button
                                                                        @click=${this.handleDeviationConfirm}
                                                                        type="button"
                                                                        class="btn btn-sm"
                                                                    >
                                                                        ${__("Delete")}
                                                                    </button>
                                                                `}
                                                      </td>
                                                  `
                                                : nothing}
                                        </tr>
                                    `;
                                },
                            )}
                        </tbody>
                    </table>
                </div>
                <lms-confirmation-modal @confirm=${this.handleDelete}></lms-confirmation-modal>
            </div>
        `;
    }
}
