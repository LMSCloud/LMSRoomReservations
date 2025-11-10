import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import dayjs from "dayjs";
import { html, LitElement, nothing, PropertyValueMap, TemplateResult } from "lit";
import { customElement, property, query, queryAll, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { map } from "lit/directives/map.js";
import { requestHandler } from "../../lib/RequestHandler";
import { attr__, __ } from "../../lib/translate";
import { tailwindStyles } from "../../tailwind.lit";
import { Deviation } from "../../types/common";
import { dayMapping } from "../../views/StaffOpenHoursView";

type Alert = {
    active: boolean;
    type: "Success" | "Warning";
    message: string | TemplateResult;
};

type OpenHoursRow = {
    day: number;
    start: string;
    end: string;
    branch?: string;
    isDeviation?: boolean;
    isBlackout?: boolean;
    isFirstRowForDay?: boolean;
    originalStart?: string | null;
    originalEnd?: string | null;
};

@customElement("lms-bookie")
export default class LMSBookie extends LitElement {
    @property({ type: String }) borrowernumber?: string;

    @property({ type: Object }) patron?: Record<string, any>;

    @property({ type: Array }) openHours: any[] = [];

    @property({ type: Array }) rooms: any[] = [];

    @property({ type: Array }) equipment: any[] = [];

    @property({ type: Number }) defaultMaxBookingTime: number = 0;

    @property({ type: Object }) selectedRoom?: any;

    @state() alert?: Alert;

    @state() enforceEmailNotification: boolean = false;

    @state() selectedDate: dayjs.Dayjs = dayjs();

    @state() weekDeviations: Deviation[] = [];

    @query("#room") roomSelect!: HTMLSelectElement;

    @query("#start-datetime") startDatetimeInput!: HTMLInputElement;

    @query("#duration") durationInput!: HTMLInputElement;

    @query("#purpose-of-use") purposeOfUseInput!: HTMLInputElement;

    @query("#confirmation-email") confirmationEmailInput!: HTMLInputElement;

    @queryAll(".equipment-item")
    equipmentItemInputs!: NodeListOf<HTMLInputElement>;

    private preselectedRoom?: any;

    static override styles = [tailwindStyles];

    override async connectedCallback() {
        super.connectedCallback();
        await this.fetchEnforceEmailNotificationSetting();
    }

    private async fetchEnforceEmailNotificationSetting() {
        const response = await requestHandler.get("settingsPublic", undefined, ["enforce_email_notification"]);
        if (response.ok) {
            const data = await response.json();
            this.enforceEmailNotification = data.value === "1" || data.value === 1;
        }
    }

    private async handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        const inputs = [
            this.roomSelect,
            this.startDatetimeInput,
            this.durationInput,
            this.purposeOfUseInput,
            this.confirmationEmailInput,
        ];
        const [roomid, start, duration, purposeOfUse, confirmation] = inputs.map((input) => input.value);

        /** We filter for checked checkbox inputs here. */
        const equipment = Array.from(this.equipmentItemInputs).reduce((accumulator: string[], equipmentInput) => {
            if (equipmentInput.checked) {
                accumulator.push(equipmentInput.id);
            }
            return accumulator;
        }, []);

        const startDatetime = dayjs(start);
        const end = startDatetime.add(parseInt(duration ?? "0", 10), "minute").format("YYYY-MM-DDTHH:mm");

        const response = await requestHandler.post("bookingsPublic", {
            borrowernumber: this.borrowernumber,
            roomid,
            start,
            end,
            blackedout: 0,
            equipment,
            send_confirmation: this.enforceEmailNotification ? 1 : confirmation || 0,
            letter_code: "ROOM_RESERVATION",
            purpose_of_use: purposeOfUse || null,
        });

        if (response.ok) {
            inputs.forEach((input) => {
                input.value = "";
            });

            this.alert = {
                active: true,
                type: "Success",
                message: html`<h3 class="font-bold">${__("Success")}!</h3>
                    <span class="text-xs">${__("Your booking is set")}.</span>`,
            };

            const event = new CustomEvent("updated", { bubbles: true });
            this.dispatchEvent(event);
            return;
        } else {
            const result = await response.json();
            let message = result?.error ?? undefined;
            this.alert = {
                active: true,
                type: "Warning",
                message: html`<h3 class="font-bold">${__("Sorry")}!</h3>
                    <span class="text-xs">${message ?? `${__("Something went wrong")}.`}</span>`,
            };
        }
    }

    private dismissAlert() {
        this.alert = undefined;
    }

    /**
     * Check if this._selectedRoom.maxbookabletime or this._defaultMaxBookingTime has a value, if not, output nothing
     * Else, create an array with chunks of 30, using this._selectedRoom.maxbookabletime or this._defaultMaxBookingTime,
     * if the value is not divisible by 30, add the value as the last element of the array,
     * and then use map function to create <option> elements with each value of the array
     * @param selectedRoom
     * @param defaultMaxBookingTime
     * @returns
     */
    private renderTimeOptionsMaybe() {
        const maxBookingTime = this.selectedRoom?.maxbookabletime || this.defaultMaxBookingTime;

        return maxBookingTime
            ? Array.from(
                  { length: Math.floor(maxBookingTime / 30) + (maxBookingTime % 30 === 0 ? 0 : 1) },
                  (_, i) => (i + 1) * 30,
              ).map((timespan) => html`<option>${timespan}</option>`)
            : nothing;
    }

    private handleRoomChange(e: Event) {
        const target = e.target as HTMLOptionElement;
        if (!target?.value) {
            this.selectedRoom = undefined;
            return;
        }

        this.selectedRoom = this.rooms.find((room) => room.roomid === parseInt(target.value, 10));
        this.fetchWeekDeviations();
    }

    private handleDateChange(e: Event) {
        const target = e.target as HTMLInputElement;
        if (!target?.value) {
            this.selectedDate = dayjs();
            this.weekDeviations = [];
            return;
        }

        this.selectedDate = dayjs(target.value);
        this.fetchWeekDeviations();
    }

    private async fetchWeekDeviations() {
        if (!this.selectedRoom) {
            this.weekDeviations = [];
            return;
        }

        try {
            const response = await requestHandler.get("openHoursDeviationsPublic");
            if (response.ok) {
                const allDeviations: Deviation[] = await response.json();

                const weekStart = this.selectedDate.startOf("week");
                const weekEnd = this.selectedDate.endOf("week");

                this.weekDeviations = allDeviations.filter((deviation) => {
                    const appliesToBranch =
                        deviation.branches.length === 0 || deviation.branches.includes(this.selectedRoom!.branch);

                    const appliesToRoom =
                        deviation.rooms.length === 0 || deviation.rooms.includes(this.selectedRoom!.roomid);

                    if (!appliesToBranch || !appliesToRoom) {
                        return false;
                    }

                    const deviationStart = dayjs(deviation.start);
                    const deviationEnd = dayjs(deviation.end);

                    return deviationStart.isBefore(weekEnd) && deviationEnd.isAfter(weekStart);
                });
            }
        } catch (error) {
            this.weekDeviations = [];
        }
    }

    private shouldDisplayEquipment() {
        return this.equipment.some((item: any) => item.roomid && item.roomid === this.selectedRoom?.roomid);
    }

    private getOpenHoursWithDeviations(): OpenHoursRow[] {
        if (!this.selectedRoom) {
            return this.openHours.filter((day) => day.branch === this.selectedRoom?.branch);
        }

        const regularHours = this.openHours.filter((day) => day.branch === this.selectedRoom.branch);
        const rowsByDay = new Map<number, OpenHoursRow[]>();

        for (const hours of regularHours) {
            rowsByDay.set(hours.day, [{ ...hours, isDeviation: false }]);
        }

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const dayDeviations = this.weekDeviations.filter((deviation) =>
                this.deviationAppliesToDay(deviation, dayIndex),
            );
            this.applyDeviationsToDay(dayIndex, dayDeviations, rowsByDay);
        }

        return this.flattenRowsByDay(rowsByDay);
    }

    private deviationAppliesToDay(deviation: Deviation, dayIndex: number): boolean {
        const recurrenceCheckers = {
            none: () => {
                const devStart = dayjs(deviation.start);
                const devDayOfWeek = (devStart.day() + 6) % 7;
                return devDayOfWeek === dayIndex;
            },
            weekly: () => {
                if (deviation.recurrencedays) {
                    const allowedDays = deviation.recurrencedays.split(",").map((d) => parseInt(d.trim(), 10));
                    return allowedDays.includes(dayIndex);
                }
                const devStart = dayjs(deviation.start);
                const devDayOfWeek = (devStart.day() + 6) % 7;
                return devDayOfWeek === dayIndex;
            },
            daily: () => true,
            weekdays: () => dayIndex >= 0 && dayIndex <= 4,
            monthly: () => false,
        };

        const checker = recurrenceCheckers[deviation.recurrencetype];
        return checker ? checker() : false;
    }

    private applyDeviationsToDay(dayIndex: number, dayDeviations: Deviation[], rowsByDay: Map<number, OpenHoursRow[]>) {
        const existingRows = rowsByDay.get(dayIndex) || [];
        if (!existingRows.length) {
            return;
        }

        const [regularRow] = existingRows;
        if (!regularRow) {
            return;
        }

        if (dayDeviations.length === 0) {
            regularRow.isFirstRowForDay = true;
            return;
        }

        for (const deviation of dayDeviations) {
            if (deviation.isblackout) {
                this.applyBlackoutToDay(dayIndex, deviation, regularRow, rowsByDay);
                break;
            } else {
                this.mergeSpecialHoursIntoDay(dayIndex, deviation, regularRow, rowsByDay);
            }
        }
    }

    private applyBlackoutToDay(
        dayIndex: number,
        deviation: Deviation,
        regularRow: OpenHoursRow,
        rowsByDay: Map<number, OpenHoursRow[]>,
    ) {
        if (!regularRow) return;

        const devStart = dayjs(deviation.start);
        const devEnd = dayjs(deviation.end);
        const regStart = dayjs(`1970-01-01 ${regularRow.start}`);
        const regEnd = dayjs(`1970-01-01 ${regularRow.end}`);
        const blackoutStart = dayjs(`1970-01-01 ${devStart.format("HH:mm:ss")}`);
        const blackoutEnd = dayjs(`1970-01-01 ${devEnd.format("HH:mm:ss")}`);

        const isFullDayClosure =
            (blackoutStart.isBefore(regStart) || blackoutStart.isSame(regStart)) &&
            (blackoutEnd.isAfter(regEnd) || blackoutEnd.isSame(regEnd));

        if (isFullDayClosure) {
            rowsByDay.set(dayIndex, [this.createClosedRow(dayIndex)]);
        } else {
            const windows = this.createPartialClosureWindows(
                dayIndex,
                regularRow,
                blackoutStart,
                blackoutEnd,
                regStart,
                regEnd,
                devStart,
                devEnd,
            );
            rowsByDay.set(dayIndex, windows.length > 0 ? windows : [this.createClosedRow(dayIndex)]);
        }
    }

    private createClosedRow(dayIndex: number): OpenHoursRow {
        return {
            day: dayIndex,
            start: "00:00:00",
            end: "00:00:00",
            isDeviation: true,
            isBlackout: true,
            isFirstRowForDay: true,
        };
    }

    private createPartialClosureWindows(
        dayIndex: number,
        regularRow: OpenHoursRow,
        blackoutStart: dayjs.Dayjs,
        blackoutEnd: dayjs.Dayjs,
        regStart: dayjs.Dayjs,
        regEnd: dayjs.Dayjs,
        devStart: dayjs.Dayjs,
        devEnd: dayjs.Dayjs,
    ): OpenHoursRow[] {
        const windows: OpenHoursRow[] = [];

        if (blackoutStart.isAfter(regStart)) {
            windows.push({
                day: dayIndex,
                start: regularRow.start,
                end: devStart.format("HH:mm:ss"),
                isDeviation: false,
                isBlackout: false,
                isFirstRowForDay: windows.length === 0,
            });
        }

        if (blackoutEnd.isBefore(regEnd)) {
            windows.push({
                day: dayIndex,
                start: devEnd.format("HH:mm:ss"),
                end: regularRow.end,
                isDeviation: false,
                isBlackout: false,
                isFirstRowForDay: windows.length === 0,
            });
        }

        return windows;
    }

    private mergeSpecialHoursIntoDay(
        dayIndex: number,
        deviation: Deviation,
        regularRow: OpenHoursRow,
        rowsByDay: Map<number, OpenHoursRow[]>,
    ) {
        if (!regularRow) return;

        const devStart = dayjs(deviation.start);
        const devEnd = dayjs(deviation.end);
        const regStart = dayjs(`1970-01-01 ${regularRow.start}`);
        const regEnd = dayjs(`1970-01-01 ${regularRow.end}`);
        const devStartTime = dayjs(`1970-01-01 ${devStart.format("HH:mm:ss")}`);
        const devEndTime = dayjs(`1970-01-01 ${devEnd.format("HH:mm:ss")}`);

        const mergedStart = devStartTime.isBefore(regStart) ? devStart.format("HH:mm:ss") : regularRow.start;
        const mergedEnd = devEndTime.isAfter(regEnd) ? devEnd.format("HH:mm:ss") : regularRow.end;

        rowsByDay.set(dayIndex, [
            {
                day: dayIndex,
                start: mergedStart,
                end: mergedEnd,
                originalStart: mergedStart !== regularRow.start ? regularRow.start : null,
                originalEnd: mergedEnd !== regularRow.end ? regularRow.end : null,
                isDeviation: true,
                isBlackout: false,
                isFirstRowForDay: true,
            },
        ]);
    }

    private flattenRowsByDay(rowsByDay: Map<number, OpenHoursRow[]>): OpenHoursRow[] {
        const allRows: OpenHoursRow[] = [];
        for (let i = 0; i < 7; i++) {
            const rows = rowsByDay.get(i) || [];
            allRows.push(...rows);
        }
        return allRows;
    }

    private getPreselectedRoomid() {
        const queryParams = new URLSearchParams(window.location.search);
        return queryParams.get("roomid");
    }

    /** Tries to open the loginModal if no borrowernumber is obtained from koha. */
    private showLoginModalMaybe() {
        if (!this.borrowernumber) {
            (document.getElementById("members")?.querySelector(".loginModal-trigger") as HTMLElement)?.click();
        }
    }

    private renderLoginPromptMaybe() {
        return !this.borrowernumber
            ? html`<div class="alert my-2" role="alert">
                  ${litFontawesome(faInfoCircle, { className: "inline-block w-4 h-4" })}
                  <span>${__("Please log in to book rooms")}.</span>
                  <div>
                      <button class="btn btn-sm" @click=${this.showLoginModalMaybe}>${__("Log in")}</button>
                  </div>
              </div>`
            : nothing;
    }

    protected override updated(_changedProperties: PropertyValueMap<never> | Map<PropertyKey, unknown>): void {
        if (_changedProperties.has("rooms") && !this.selectedRoom) {
            this.preselectedRoom = this.getPreselectedRoomid();
            if (this.preselectedRoom) {
                this.selectedRoom = this.rooms.find((room) => room.roomid === parseInt(this.preselectedRoom, 10));
            }
        }
    }

    override render() {
        const shouldDisplayEquipment = this.shouldDisplayEquipment();
        return html`
            <div class="card bg-base-100 shadow-lg">
                <div class="card-body">
                    <section>
                        <h5 id="book-it-here">${__("Book a room")}</h5>
                        ${this.renderLoginPromptMaybe()}
                        <div
                            class="${classMap({
                                hidden: !(this.alert?.type === "Warning"),
                            })} alert alert-warning my-2"
                            role="alert"
                        >
                            ${litFontawesome(faExclamationCircle, { className: "inline-block w-4 h-4" })}
                            <div>${this.alert?.message}</div>
                            <div>
                                <button
                                    @click=${this.dismissAlert}
                                    type="button"
                                    class="btn btn-circle btn-ghost btn-sm"
                                    data-dismiss="alert"
                                    aria-label="Close"
                                >
                                    ${litFontawesome(faTimes, { className: "inline-block w-4 h-4" })}
                                </button>
                            </div>
                        </div>
                        <div id="booking">
                            <form @submit=${this.handleSubmit}>
                                <div class="form-control">
                                    <label class="label" for="room">
                                        <span class="label-text"> ${__("Room")} </span>
                                    </label>
                                    <select
                                        id="room"
                                        name="room"
                                        class="select select-bordered w-full"
                                        aria-describedby="booking-help"
                                        @change=${this.handleRoomChange}
                                        ?disabled=${!this.borrowernumber}
                                        required
                                    >
                                        <option value="">${__("Please select a room")}</option>
                                        ${map(this.rooms, (room) => {
                                            const { roomid, roomnumber } = room;
                                            const isSelected = roomid === this.selectedRoom?.roomid;
                                            return html`<option value=${roomid} ?selected=${isSelected}>
                                                ${roomnumber}
                                            </option>`;
                                        })}
                                    </select>
                                </div>
                                <div class="form-control">
                                    <label class="label" for="start-datetime">
                                        <span class="label-text"> ${__("Date & Time")} </span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="start-datetime"
                                        name="start-datetime"
                                        class="input input-bordered w-full"
                                        aria-describedby="booking-help"
                                        ?disabled=${!this.borrowernumber}
                                        @change=${this.handleDateChange}
                                        required
                                    />
                                </div>
                                <div class="form-control">
                                    <label class="label" for="duration">
                                        <span class="label-text">${__("Duration")}</span></label
                                    >
                                    <input
                                        type="number"
                                        list="durations"
                                        id="duration"
                                        name="duration"
                                        class="input input-bordered w-full"
                                        aria-describedby="booking-help"
                                        placeholder=${attr__("In minutes, e.g. 60")}
                                        max=${ifDefined(this.selectedRoom?.maxbookabletime)}
                                        ?disabled=${!this.borrowernumber}
                                        required
                                    />
                                    <datalist id="durations">${this.renderTimeOptionsMaybe()}</datalist>
                                </div>
                                <div class=${classMap({ hidden: !shouldDisplayEquipment })}>
                                    <div class="divider">
                                        <span class="label-text"> ${__("Equipment")} </span>
                                    </div>
                                    ${map(
                                        this.equipment.filter((item) => item.roomid == this.selectedRoom?.roomid),
                                        (item) => {
                                            const { equipmentid, equipmentname } = item;
                                            return html`
                                                <div class="form-control">
                                                    <label class="label" for=${equipmentid}>
                                                        <input
                                                            type="checkbox"
                                                            class="equipment-item checkbox mr-2"
                                                            id=${equipmentid}
                                                            ?disabled=${!this.borrowernumber}
                                                        />
                                                        <span class="label-text"> ${equipmentname} </span>
                                                    </label>
                                                </div>
                                            `;
                                        },
                                    )}
                                    <div class="divider"></div>
                                </div>
                                <div class="form-control">
                                    <label class="label" for="purpose-of-use">
                                        <span class="label-text"> ${__("Purpose of Use")} </span>
                                    </label>
                                    <input
                                        type="text"
                                        id="purpose-of-use"
                                        name="purpose-of-use"
                                        class="input input-bordered w-full"
                                        ?disabled=${!this.borrowernumber}
                                        placeholder=${attr__("Would you like to communicate something to the staff?")}
                                    />
                                </div>
                                <div class="form-control">
                                    <label class="label" for="confirmation">
                                        <span class="label-text"> ${__("Confirmation Email")} </span>
                                    </label>
                                    <div class="form-control">
                                        <label class="label" for="confirmation-email">
                                            <input
                                                type="checkbox"
                                                value="1"
                                                id="confirmation-email"
                                                name="confirmation-email"
                                                class="checkbox mr-2"
                                                ?disabled=${!this.borrowernumber || this.enforceEmailNotification}
                                                ?checked=${this.enforceEmailNotification || true}
                                            />
                                            <span class="label-text">
                                                ${__("Should we send you a confirmation email")}?
                                            </span>
                                        </label>
                                        <div
                                            class="${classMap({
                                                hidden: !this.patron?.["email"],
                                            })} text-sm"
                                        >
                                            ${__("We would use")}&nbsp;
                                            <span class="badge badge-neutral badge-outline">
                                                ${this.patron?.["email"]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="my-4">
                                    <small class="text-muted" id="booking-help"
                                        >${__("Pick a room, a date, a time")}<span
                                            class=${classMap({ hidden: !shouldDisplayEquipment })}
                                            >, ${__("items you'd like to use")}</span
                                        >
                                        ${__("and the duration of your reservation")}.</small
                                    >
                                </div>
                                <div class="card-actions justify-end">
                                    <button type="submit" class="btn btn-primary" ?disabled=${!this.borrowernumber}>
                                        ${__("Submit")}
                                    </button>
                                </div>
                            </form>
                            <div
                                class="${classMap({
                                    hidden: !(this.alert?.type === "Success"),
                                })} alert alert-success my-2"
                                role="alert"
                            >
                                ${litFontawesome(faCheckCircle, { className: "inline-block w-4 h-4" })}
                                <div>${this.alert?.message}</div>
                                <div>
                                    <button
                                        @click=${this.dismissAlert}
                                        type="button"
                                        class="btn btn-circle btn-ghost btn-sm"
                                        data-dismiss="alert"
                                        aria-label="Close"
                                    >
                                        ${litFontawesome(faTimes, { className: "inline-block w-4 h-4" })}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="${classMap({ hidden: !this.selectedRoom })} border-t-4 border-dotted pt-4">
                        <h5>${__("Open hours")}</h5>
                        <p class="mb-2 text-sm text-base-content/70">
                            ${__("Week of")} ${this.selectedDate.startOf("week").format("MMM D")} -
                            ${this.selectedDate.endOf("week").format("MMM D, YYYY")}
                        </p>
                        <div id="open-hours">
                            <div class="overflow-x-scroll">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>${__("Day")}</th>
                                            <th>${__("Open from")}</th>
                                            <th>${__("Closed after")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${map(this.getOpenHoursWithDeviations(), (row) => {
                                            const stringifiedIndex = row.day.toString();
                                            const dayString = dayMapping.get(stringifiedIndex);
                                            if (!dayString) {
                                                return nothing;
                                            }

                                            let startString = row.start.slice(0, -3);
                                            let endString = row.end.slice(0, -3);

                                            const rowClass = classMap({
                                                "bg-red-100": (row.isDeviation && row.isBlackout) ?? false,
                                                "bg-base-200": !row.isBlackout && row.day % 2 === 0,
                                            });

                                            if ([startString, endString].every((string) => string === "00:00")) {
                                                startString = `${__("Closed")}`;
                                                endString = "&mdash";
                                            }

                                            const startDisplay = row.originalStart
                                                ? html`${startString}
                                                      <span class="ml-1 text-xs text-base-content/60 line-through"
                                                          >${row.originalStart.slice(0, -3)}</span
                                                      >`
                                                : startString;

                                            const endDisplay = row.originalEnd
                                                ? html`${endString}
                                                      <span class="ml-1 text-xs text-base-content/60 line-through"
                                                          >${row.originalEnd.slice(0, -3)}</span
                                                      >`
                                                : endString;

                                            return html`
                                                <tr class="${rowClass}">
                                                    <td>${row.isFirstRowForDay ? __(dayString) : nothing}</td>
                                                    <td>${startDisplay}</td>
                                                    <td>${endDisplay}</td>
                                                </tr>
                                            `;
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
}
