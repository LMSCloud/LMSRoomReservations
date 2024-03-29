import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import dayjs from "dayjs";
import { LitElement, PropertyValueMap, TemplateResult, html, nothing } from "lit";
import { customElement, property, query, queryAll, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { map } from "lit/directives/map.js";
import { requestHandler } from "../../lib/RequestHandler";
import { __, attr__ } from "../../lib/translate";
import { tailwindStyles } from "../../tailwind.lit";
import { dayMapping } from "../../views/StaffOpenHoursView";

type Alert = {
    active: boolean;
    type: "Success" | "Warning";
    message: string | TemplateResult;
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

    @query("#room") roomSelect!: HTMLSelectElement;

    @query("#start-datetime") startDatetimeInput!: HTMLInputElement;

    @query("#duration") durationInput!: HTMLInputElement;

    @query("#purpose-of-use") purposeOfUseInput!: HTMLInputElement;

    @query("#confirmation-email") confirmationEmailInput!: HTMLInputElement;

    @queryAll(".equipment-item")
    equipmentItemInputs!: NodeListOf<HTMLInputElement>;

    private preselectedRoom?: any;

    static override styles = [tailwindStyles];

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
            send_confirmation: confirmation || 0,
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
    }

    private shouldDisplayEquipment() {
        return this.equipment.some((item: any) => item.roomid && item.roomid === this.selectedRoom?.roomid);
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
                                                ?disabled=${!this.borrowernumber}
                                                checked
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
                        <div id="open-hours">
                            <div class="overflow-x-scroll">
                                <table class="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>${__("Day")}</th>
                                            <th>${__("Open from")}</th>
                                            <th>${__("Closed after")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${map(
                                            this.openHours.filter((day) => day.branch === this.selectedRoom?.branch),
                                            ({ day, start, end }) => {
                                                const stringifiedIndex = day.toString();
                                                const dayString = dayMapping.get(stringifiedIndex);
                                                if (!dayString) {
                                                    return nothing;
                                                }

                                                let startString = start.slice(0, -3);
                                                let endString = end.slice(0, -3);
                                                if ([startString, endString].every((string) => string === "00:00")) {
                                                    startString = __("Closed");
                                                    endString = html`&mdash;`;
                                                }
                                                return html`
                                                    <tr>
                                                        <td>${__(dayString)}</td>
                                                        <td>${startString}</td>
                                                        <td>${endString}</td>
                                                    </tr>
                                                `;
                                            },
                                        )}
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
