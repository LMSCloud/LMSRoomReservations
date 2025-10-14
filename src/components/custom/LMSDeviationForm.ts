import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { requestHandler } from "../../lib/RequestHandler";
import { attr__, __ } from "../../lib/translate";
import { tailwindStyles } from "../../tailwind.lit";

interface DeviationFormData {
    isblackout: number;
    start: string;
    end: string;
    recurrencetype: "none" | "daily" | "weekdays" | "weekly" | "monthly";
    recurrencedays: string | null;
    recurrenceuntil: string | null;
    rrule: string | null;
    description: string | null;
    branches: string[];
    rooms: number[];
}

@customElement("lms-deviation-form")
export default class LMSDeviationForm extends LitElement {
    @property({ type: String }) branchId?: string;

    @state() isSubmitting = false;

    @state() selectedRecurrenceType: string = "none";

    @state() selectedWeekdays: Set<number> = new Set();

    @state() selectedRooms: Set<number> = new Set();

    @state() availableRooms: any[] = [];

    @state() isLoadingRooms = false;

    static override styles = [tailwindStyles];

    override async connectedCallback() {
        super.connectedCallback();
        await this.fetchRooms();
    }

    private async fetchRooms() {
        if (!this.branchId) {
            return;
        }

        this.isLoadingRooms = true;
        try {
            const response = await requestHandler.get("rooms");
            if (response.status >= 200 && response.status <= 299) {
                const allRooms = await response.json();
                // Filter rooms for this branch
                this.availableRooms = allRooms.filter((room: any) => room.branch === this.branchId);
            }
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        } finally {
            this.isLoadingRooms = false;
        }
    }

    private getRecurrenceHelp() {
        let helpText;

        switch (this.selectedRecurrenceType) {
            case "none":
                helpText = __("One-time deviation - will not repeat");
                break;
            case "daily":
                helpText = __("Repeats every day at the selected time range");
                break;
            case "weekdays":
                helpText = __("Repeats Monday through Friday at the selected time range");
                break;
            case "weekly":
                helpText = __("Repeats on selected days of the week at the selected time range");
                break;
            case "monthly":
                helpText = __("Repeats on the same day of each month at the selected time range");
                break;
            default:
                helpText = "";
        }

        return html`
            <label class="label">
                <span class="label-text-alt">${helpText}</span>
            </label>
        `;
    }

    private async handleSubmit(e: Event) {
        e.preventDefault();
        this.isSubmitting = true;

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        // Convert datetime-local format to MySQL datetime format
        const formatDateTime = (dateTimeLocal: string): string => {
            if (!dateTimeLocal) return "";
            // datetime-local gives us: YYYY-MM-DDTHH:mm
            // MySQL wants: YYYY-MM-DD HH:mm:ss
            return dateTimeLocal.replace("T", " ") + ":00";
        };

        // Combine date and time inputs to create MySQL datetime
        const combineDateTime = (date: string, time: string): string => {
            if (!date || !time) return "";
            // date gives us: YYYY-MM-DD
            // time gives us: HH:mm
            // MySQL wants: YYYY-MM-DD HH:mm:ss
            return `${date} ${time}:00`;
        };

        // Determine start and end based on recurrence type
        let start: string;
        let end: string;

        if (this.selectedRecurrenceType === "none") {
            // For one-time deviations, use datetime-local inputs
            start = formatDateTime(formData.get("startDateTime") as string);
            end = formatDateTime(formData.get("endDateTime") as string);
        } else {
            // For recurring deviations, combine date + time inputs
            const date = formData.get("date") as string;
            const startTime = formData.get("startTime") as string;
            const endTime = formData.get("endTime") as string;
            start = combineDateTime(date, startTime);
            end = combineDateTime(date, endTime);
        }

        // Get recurrence days from selected checkboxes
        const recurrenceDays =
            this.selectedRecurrenceType === "weekly" && this.selectedWeekdays.size > 0
                ? Array.from(this.selectedWeekdays).sort().join(",")
                : null;

        const deviation: DeviationFormData = {
            isblackout: formData.get("isblackout") === "1" ? 1 : 0,
            start,
            end,
            recurrencetype: (formData.get("recurrencetype") as DeviationFormData["recurrencetype"]) || "none",
            recurrencedays: recurrenceDays,
            recurrenceuntil: formData.get("recurrenceuntil") ? (formData.get("recurrenceuntil") as string) : null,
            rrule: null, // Future: for complex patterns
            description: (formData.get("description") as string) || null,
            branches: this.branchId ? [this.branchId] : [],
            rooms: Array.from(this.selectedRooms),
        };

        try {
            const response = await requestHandler.post("openHoursDeviations", deviation);
            if (response.status >= 200 && response.status <= 299) {
                this.dispatchEvent(new CustomEvent("deviation-created", { bubbles: true, composed: true }));
                form.reset();
            } else {
                const error = await response.json();
                console.error("Failed to create deviation:", error);
            }
        } catch (error) {
            console.error("Failed to create deviation:", error);
        } finally {
            this.isSubmitting = false;
        }
    }

    override render() {
        return html`
            <div class="rounded-xl bg-base-100 p-4 shadow-sm">
                <h3 class="mb-4 text-lg font-semibold">${__("Add Deviation")}</h3>
                <form @submit=${this.handleSubmit} class="space-y-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">${__("Type")}</span>
                        </label>
                        <select name="isblackout" class="select select-bordered" required>
                            <option value="1">${__("Blackout (Closed)")}</option>
                            <option value="0">${__("Special Hours")}</option>
                        </select>
                        <label class="label">
                            <span class="label-text-alt"
                                >${__(
                                    "Choose 'Blackout' for closures or 'Special Hours' for modified opening times",
                                )}</span
                            >
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">${__("Recurrence")}</span>
                        </label>
                        <select
                            name="recurrencetype"
                            class="select select-bordered"
                            @change=${(e: Event) => {
                                this.selectedRecurrenceType = (e.target as HTMLSelectElement).value;
                            }}
                        >
                            <option value="none">${__("None")}</option>
                            <option value="daily">${__("Daily")}</option>
                            <option value="weekdays">${__("Weekdays (Mon-Fri)")}</option>
                            <option value="weekly">${__("Weekly")}</option>
                            <option value="monthly">${__("Monthly")}</option>
                        </select>
                        ${this.getRecurrenceHelp()}
                    </div>

                    ${this.selectedRecurrenceType === "none"
                        ? html`
                              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div class="form-control">
                                      <label class="label">
                                          <span class="label-text">${__("Start Date/Time")}</span>
                                      </label>
                                      <input
                                          type="datetime-local"
                                          name="startDateTime"
                                          class="input input-bordered"
                                          required
                                      />
                                  </div>

                                  <div class="form-control">
                                      <label class="label">
                                          <span class="label-text">${__("End Date/Time")}</span>
                                      </label>
                                      <input
                                          type="datetime-local"
                                          name="endDateTime"
                                          class="input input-bordered"
                                          required
                                      />
                                  </div>
                              </div>
                          `
                        : html`
                              <div class="form-control">
                                  <label class="label">
                                      <span class="label-text">${__("Date")}</span>
                                  </label>
                                  <input type="date" name="date" class="input input-bordered" required />
                                  <label class="label">
                                      <span class="label-text-alt"
                                          >${__("Starting date for this recurrence pattern")}</span
                                      >
                                  </label>
                              </div>

                              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div class="form-control">
                                      <label class="label">
                                          <span class="label-text">${__("Start Time")}</span>
                                      </label>
                                      <input type="time" name="startTime" class="input input-bordered" required />
                                  </div>

                                  <div class="form-control">
                                      <label class="label">
                                          <span class="label-text">${__("End Time")}</span>
                                      </label>
                                      <input type="time" name="endTime" class="input input-bordered" required />
                                  </div>
                              </div>
                          `}
                    ${this.selectedRecurrenceType === "weekly"
                        ? html`
                              <div class="form-control">
                                  <label class="label">
                                      <span class="label-text">${__("Repeat On")}</span>
                                  </label>
                                  <div class="flex flex-wrap gap-2">
                                      ${[
                                          { day: 0, label: __("Mon") },
                                          { day: 1, label: __("Tue") },
                                          { day: 2, label: __("Wed") },
                                          { day: 3, label: __("Thu") },
                                          { day: 4, label: __("Fri") },
                                          { day: 5, label: __("Sat") },
                                          { day: 6, label: __("Sun") },
                                      ].map(
                                          ({ day, label }) => html`
                                              <label class="label cursor-pointer gap-2">
                                                  <input
                                                      type="checkbox"
                                                      class="checkbox checkbox-sm"
                                                      ?checked=${this.selectedWeekdays.has(day)}
                                                      @change=${(e: Event) => {
                                                          const checked = (e.target as HTMLInputElement).checked;
                                                          if (checked) {
                                                              this.selectedWeekdays.add(day);
                                                          } else {
                                                              this.selectedWeekdays.delete(day);
                                                          }
                                                          this.requestUpdate();
                                                      }}
                                                  />
                                                  <span class="label-text">${label}</span>
                                              </label>
                                          `,
                                      )}
                                  </div>
                                  <label class="label">
                                      <span class="label-text-alt"
                                          >${__("Select which days of the week this deviation repeats on")}</span
                                      >
                                  </label>
                              </div>
                          `
                        : ""}
                    ${this.selectedRecurrenceType !== "none"
                        ? html`
                              <div class="form-control">
                                  <label class="label">
                                      <span class="label-text">${__("Repeat Until (optional)")}</span>
                                  </label>
                                  <input type="date" name="recurrenceuntil" class="input input-bordered" />
                                  <label class="label">
                                      <span class="label-text-alt">${__("Leave empty for indefinite recurrence")}</span>
                                  </label>
                              </div>
                          `
                        : ""}
                    ${this.availableRooms.length > 0
                        ? html`
                              <div class="form-control">
                                  <label class="label">
                                      <span class="label-text">${__("Apply to Rooms")}</span>
                                  </label>
                                  ${this.isLoadingRooms
                                      ? html`<div class="flex items-center gap-2">
                                            <span class="loading loading-spinner loading-sm"></span>
                                            <span class="text-sm">${__("Loading rooms...")}</span>
                                        </div>`
                                      : html`
                                            <div class="flex flex-col gap-2 rounded-lg border border-base-200 p-3">
                                                <label class="label cursor-pointer justify-start gap-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        class="checkbox checkbox-sm"
                                                        ?checked=${this.selectedRooms.size === 0}
                                                        @change=${(e: Event) => {
                                                            const checked = (e.target as HTMLInputElement).checked;
                                                            if (checked) {
                                                                this.selectedRooms.clear();
                                                            }
                                                            this.requestUpdate();
                                                        }}
                                                    />
                                                    <span class="label-text font-semibold">${__("All Rooms")}</span>
                                                </label>
                                                <div class="divider my-0"></div>
                                                ${this.availableRooms.map(
                                                    (room) => html`
                                                        <label class="label cursor-pointer justify-start gap-2 py-1">
                                                            <input
                                                                type="checkbox"
                                                                class="checkbox checkbox-sm"
                                                                ?checked=${this.selectedRooms.has(room.roomid)}
                                                                @change=${(e: Event) => {
                                                                    const checked = (e.target as HTMLInputElement)
                                                                        .checked;
                                                                    if (checked) {
                                                                        this.selectedRooms.add(room.roomid);
                                                                    } else {
                                                                        this.selectedRooms.delete(room.roomid);
                                                                    }
                                                                    this.requestUpdate();
                                                                }}
                                                            />
                                                            <span class="label-text"
                                                                >${room.roomnumber}
                                                                ${room.description
                                                                    ? html`<span class="text-xs text-base-content/60"
                                                                          >(${room.description})</span
                                                                      >`
                                                                    : ""}</span
                                                            >
                                                        </label>
                                                    `,
                                                )}
                                            </div>
                                        `}
                                  <label class="label">
                                      <span class="label-text-alt"
                                          >${__("Leave 'All Rooms' checked to apply to all rooms in this branch")}</span
                                      >
                                  </label>
                              </div>
                          `
                        : ""}

                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">${__("Description")}</span>
                        </label>
                        <textarea
                            name="description"
                            class="textarea textarea-bordered"
                            rows="3"
                            placeholder="${attr__("e.g., Christmas Holiday, Staff Training Day")}"
                        ></textarea>
                    </div>

                    <div class="flex gap-2">
                        <button type="submit" class="btn btn-primary" ?disabled=${this.isSubmitting}>
                            ${this.isSubmitting ? html`<span class="loading loading-spinner"></span>` : __("Save")}
                        </button>
                        <button
                            type="button"
                            @click=${() =>
                                this.dispatchEvent(new CustomEvent("cancel", { bubbles: true, composed: true }))}
                            class="btn"
                            ?disabled=${this.isSubmitting}
                        >
                            ${__("Cancel")}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
}
