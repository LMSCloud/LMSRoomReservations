import dayjs from "dayjs";
import { PropertyValues, TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import LMSModal from "../components/LMSModal";
import { requestHandler } from "../lib/RequestHandler";
import { __, attr__ } from "../lib/translate";
import { ModalField, TaggedData } from "../types/common";

@customElement("lms-bookings-modal")
export default class LMSBookingsModal extends LMSModal {
    @property({ type: Array }) rooms: any[] = [];

    @property({ type: Array }) equipment: any[] = [];

    private selectedRoomObj?: any;

    private overrideOn = false;

    private slotDate = "";

    private selectedSlotValue = "";

    private slots: Array<{ start: string; end: string; available: boolean }> = [];

    private currentEquipment: any[] = [];

    override connectedCallback(): void {
        super.connectedCallback();
        this.hydrate();
    }

    private get slotMode(): boolean {
        return Number(this.selectedRoomObj?.slot_length) > 0;
    }

    /** Slot mode is active unless staff opted to override and book a custom time. */
    private get slotPickerActive(): boolean {
        return this.slotMode && !this.overrideOn;
    }

    private hydrate() {
        this.modalTitle = __("Add Booking");
        this.createOpts = {
            endpoint: "bookings",
        };
        this.fields = [
            {
                name: "roomid",
                type: "select",
                desc: __("Room (changing this resets the fields below)"),
                required: true,
            },
            {
                name: "borrowernumber",
                type: "patron-search",
                desc: __("Patron"),
                placeholder: attr__("Search by name or card number"),
                required: true,
            },
            {
                name: "start",
                type: "datetime-local",
                desc: __("Starts at"),
                required: true,
            },
            {
                name: "end",
                type: "datetime-local",
                desc: __("Ends at"),
                required: true,
            },
            {
                name: "equipment",
                type: "checklist",
                desc: __("Equipment items"),
                required: false,
                value: [],
            },
            {
                name: "blackedout",
                type: "checkbox",
                desc: __("Is blackout"),
                value: 0,
            },
            {
                name: "blackout_hint",
                type: "info",
                desc: __(
                    "Blackout bookings require a patron and can't exceed the normal booking duration. For full-day, multi-day or recurring closures (events, maintenance, holidays), add a blackout under Open Hours → Deviations instead.",
                ),
            },
            {
                name: "slot_override",
                type: "checkbox",
                desc: __("Override slot restriction"),
                value: 0,
            },
            {
                name: "slot_override_hint",
                type: "info",
                desc: __(
                    "For rooms with fixed slots, start and end must match an available slot. Enable this to book a custom time instead.",
                ),
            },
            {
                name: "send_confirmation",
                type: "checkbox",
                desc: __("Send confirmation to patron"),
                value: 0,
            },
            {
                name: "letter_code",
                type: "hidden",
                desc: "Letter code to pick for patron notification",
                value: "ROOM_RESERVATION",
            },
        ];

        this.renderInputs();
    }

    /**
     * Composes the modal inputs. The time selection is swapped depending on the
     * selected room: slot-mode rooms get a date picker + slot dropdown (and an
     * override toggle), while free rooms keep the plain start/end inputs.
     */
    private renderInputs() {
        const tagged: TaggedData[] = [
            ["roomid", this.rooms],
            ["borrowernumber", []],
            ["equipment", this.currentEquipment],
        ];

        const pairsFor = (name: string): Array<[ModalField, TemplateResult]> => {
            const field = this.fields.find((candidate) => candidate.name === name);
            return field ? this.composeTaggedInputs(field, tagged) : [];
        };

        const inputs: Array<[ModalField, TemplateResult]> = [];
        inputs.push(...pairsFor("roomid"));
        inputs.push(...pairsFor("borrowernumber"));

        if (this.slotPickerActive) {
            inputs.push([
                { name: "__slotpicker__", type: "info", desc: "", value: "__slotpicker__" },
                this.renderSlotPicker(),
            ]);
        } else {
            inputs.push(...pairsFor("start"));
            inputs.push(...pairsFor("end"));
        }

        inputs.push(...pairsFor("equipment"));
        inputs.push(...pairsFor("blackedout"));
        inputs.push(...pairsFor("blackout_hint"));

        if (this.slotMode) {
            inputs.push(...pairsFor("slot_override"));
            inputs.push(...pairsFor("slot_override_hint"));
        }

        inputs.push(...pairsFor("send_confirmation"));
        inputs.push(...pairsFor("letter_code"));

        this.inputs = inputs;
    }

    private renderSlotPicker(): TemplateResult {
        const today = dayjs().format("YYYY-MM-DD");
        return html`
            <div class="form-control w-full">
                <label class="label"><span class="label-text">${__("Date")}</span></label>
                <input
                    type="date"
                    name="slot-date"
                    class="input input-bordered w-full"
                    min=${today}
                    .value=${this.slotDate}
                    @change=${this.handleSlotDateChange}
                    required
                />
            </div>
            <div class="form-control w-full">
                <label class="label"><span class="label-text">${__("Time slot")}</span></label>
                <select
                    name="slot"
                    class="select select-bordered w-full"
                    ?disabled=${this.slots.length === 0}
                    @change=${this.handleSlotSelectChange}
                    required
                >
                    <option value="">
                        ${this.slots.length === 0 ? __("No slots available") : __("Please select a time slot")}
                    </option>
                    ${this.slots.map((slot) => {
                        const value = `${slot.start}|${slot.end}`;
                        const label = `${dayjs(slot.start).format("HH:mm")} – ${dayjs(slot.end).format("HH:mm")}`;
                        return html`<option value=${value} ?selected=${value === this.selectedSlotValue}>
                            ${label}
                        </option>`;
                    })}
                </select>
            </div>
        `;
    }

    private setFieldValue(name: string, value: ModalField["value"]) {
        this.fields = this.fields.map((field) => (field.name === name ? { ...field, value } : field));
    }

    private async fetchSlots() {
        if (!this.selectedRoomObj || !this.slotMode || !this.slotDate) {
            this.slots = [];
            return;
        }

        try {
            const response = await requestHandler.get("roomSlotsPublic", { date: this.slotDate }, [
                String(this.selectedRoomObj.id),
                "slots",
            ]);
            this.slots = response.ok
                ? ((await response.json()).slots ?? []).filter((slot: { available: boolean }) => slot.available)
                : [];
        } catch (error) {
            this.slots = [];
        }
    }

    private async handleRoomChange(roomid: string) {
        this.selectedRoomObj = this.rooms.find((room) => String(room.id) === roomid);
        this.currentEquipment = this.equipment.filter((item) => String(item.roomid) === roomid);
        this.overrideOn = false;
        this.selectedSlotValue = "";
        this.setFieldValue("slot_override", 0);
        this.setFieldValue("start", "");
        this.setFieldValue("end", "");
        this.slotDate = this.slotMode ? dayjs().format("YYYY-MM-DD") : "";
        await this.fetchSlots();
        this.renderInputs();
    }

    private handleSlotDateChange(e: Event) {
        e.stopPropagation();
        this.slotDate = (e.target as HTMLInputElement).value;
        this.selectedSlotValue = "";
        this.setFieldValue("start", "");
        this.setFieldValue("end", "");
        void this.fetchSlots().then(() => this.renderInputs());
    }

    private handleSlotSelectChange(e: Event) {
        e.stopPropagation();
        const value = (e.target as HTMLSelectElement).value;
        this.selectedSlotValue = value;
        const [start, end] = value.split("|");
        this.setFieldValue("start", start ?? "");
        this.setFieldValue("end", end ?? "");
    }

    // The slot <select> is part of a cached template, so a re-render re-commits
    // it with the `selected` attribute (defaultSelected), which the browser
    // ignores for the live value. Sync the value property imperatively so the
    // chosen slot sticks and the required field stays satisfied.
    protected override updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (!this.slotPickerActive) {
            return;
        }
        const select = this.renderRoot.querySelector<HTMLSelectElement>('select[name="slot"]');
        if (select && select.value !== this.selectedSlotValue) {
            select.value = this.selectedSlotValue;
        }
    }

    protected override mediateChange(e: Event | CustomEvent) {
        super.mediateChange(e);

        const name =
            e instanceof CustomEvent
                ? (e.detail?.name as string)
                : ((e.target as HTMLElement | null)?.getAttribute?.("name") ?? "");

        if (name === "roomid") {
            const value = e instanceof CustomEvent ? e.detail?.value : (e.target as HTMLInputElement | null)?.value;
            void this.handleRoomChange(String(value ?? ""));
        } else if (name === "slot_override") {
            const value = e instanceof CustomEvent ? e.detail?.value : false;
            this.overrideOn = Boolean(value);
            this.renderInputs();
        }
    }
}
