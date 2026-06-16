import dayjs from "dayjs";
import { PropertyValueMap, TemplateResult, html } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";
import LMSTable from "../components/LMSTable";
import { requestHandler } from "../lib/RequestHandler";
import { extractEquipmentItems, findRoomName, listEquipmentNames, patronDisplay } from "../lib/bookingDisplay";
import { formatDatetimeByLocale } from "../lib/converters/datetimeConverters";
import { packSlotValue, unpackSlotValue } from "../lib/slots";
import { __, attr__, localeFull, t } from "../lib/translate";
import { Column, Input } from "../types/common";

type EquipmentSelection = [number, any[]];

type Slot = { start: string; end: string; available: boolean };

type RowSlotState = { date: string; slots: Slot[]; selected: string };

@customElement("lms-bookings-table")
export default class LMSBookingsTable extends LMSTable {
    @property({ type: Array }) bookings: any[] = [];

    @property({ type: Array }) borrowers: any[] = [];

    @property({ type: Array }) rooms: any[] = [];

    @property({ type: Array }) equipment: any[] = [];

    @queryAll('select[name="roomid"]') roomSelects!: NodeListOf<HTMLSelectElement>;

    private originalEquipmentSelection: EquipmentSelection | undefined;

    // Bookings (by bookingid) whose inline edit is in custom-time mode: start/end
    // fall back to free datetime-local inputs instead of the slot dropdown.
    private overriddenRows = new Set<number>();

    // Per-row slot picker state (date, fetched slots, selected "start|end").
    private rowSlotState = new Map<number, RowSlotState>();

    // The bookingid whose inline edit is currently open, so we can reset its
    // transient slot/override state when it closes.
    private editingId?: number;

    private boundUpdateEquipmentItemsOnRoomChange = this.updateEquipmentItemsOnRoomChange.bind(this);

    override async handleSave(e: Event) {
        const target = e.target as HTMLElement;

        const parent = target.closest("tr");
        let key: string | undefined,
            borrowernumber: string | undefined,
            inputs: NodeListOf<HTMLInputElement | HTMLSelectElement> | undefined,
            equipmentCheckboxInputs: HTMLInputElement[] | undefined,
            checkboxInputs: HTMLInputElement[] | undefined;

        if (parent) {
            const cells = Array.from(parent.cells);

            key = cells[0]?.textContent?.trim();
            borrowernumber = cells[1]?.querySelector(".badge.borrowernumber")?.textContent?.replace(/\D/g, "").trim();

            inputs = parent.querySelectorAll('input:not([type="checkbox"]), select') as NodeListOf<
                HTMLInputElement | HTMLSelectElement
            >;

            const checkboxInputsArray = parent.querySelectorAll(
                'input[type="checkbox"]',
            ) as NodeListOf<HTMLInputElement>;
            equipmentCheckboxInputs = Array.from(checkboxInputsArray).filter((input) =>
                input.id.includes("equipment_"),
            );
            checkboxInputs = Array.from(checkboxInputsArray).filter((input) => !input.id.includes("equipment_"));
        }

        if (!key || !inputs) {
            return;
        }

        const body: Record<string, any> = {
            borrowernumber,
            equipment: equipmentCheckboxInputs?.reduce((acc: string[], equipmentCheckboxInput) => {
                if (equipmentCheckboxInput.checked) {
                    acc.push(equipmentCheckboxInput.name);
                }
                return acc;
            }, []),
            ...checkboxInputs?.reduce((acc: Record<string, boolean>, checkboxInput) => {
                acc[checkboxInput.name] = checkboxInput.checked;
                return acc;
            }, {}),
            ...Array.from(inputs).reduce((acc: Record<string, string>, input: Input) => {
                acc[input.name] = input.value;
                return acc;
            }, {}),
        };

        // Slot-mode rooms edit times through a single dropdown whose value packs
        // "start|end"; unpack it into the fields the API expects.
        if (body["slot"] !== undefined) {
            const unpacked = unpackSlotValue(String(body["slot"]));
            if (!unpacked) {
                this.renderToast("", { error: t("Please select a time slot"), errors: [] });
                return;
            }
            body["start"] = unpacked.start;
            body["end"] = unpacked.end;
            delete body["slot"];
            delete body["slot-date"];
        }

        const response = await requestHandler.put("bookings", body, undefined, [key.toString()]);
        if (response.ok) {
            inputs.forEach((input) => {
                input.disabled = true;
            });
            this.toggleEdit(
                new CustomEvent("click", {
                    detail: target.closest("td")?.querySelector(".btn-edit"),
                }),
            );
            this.dispatchEvent(new CustomEvent("updated", { detail: key }));
            return;
        } else {
            const error = await response.json();
            this.renderToast(response.statusText, error);
        }
    }

    override async handleDelete(e: Event, target = this.confirmationModal.ref as HTMLElement) {
        if (!target) {
            target = e.target as HTMLElement;
        }

        let parent = target.closest("tr");

        let id = undefined;
        if (parent) {
            id = parent.firstElementChild?.textContent?.trim();
        }

        if (!id) {
            return;
        }

        const response = await requestHandler.delete("bookings", undefined, [id.toString()]);
        if (response.ok) {
            this.dispatchEvent(new CustomEvent("deleted", { detail: id }));
            return;
        } else {
            const error = await response.json();
            this.renderToast(response.statusText, error);
        }
    }

    constructor() {
        super();
        this.order = [
            "bookingid",
            "borrowernumber",
            "roomid",
            "start",
            "end",
            "purpose_of_use",
            "equipment",
            "blackedout",
            "created",
            "updated_at",
        ];
        this.isEditable = true;
        this.isDeletable = true;
        this.isExpandable = true;
        this.hasControls = true;
        this.hasSearch = true;
        this.sortClientSide = false;
        this.unsortableColumns = ["equipment"];
        // Virtual search fields (not table columns): a bare-term search also
        // matches patron name and room number via the backend's joined query.
        // "id" stays first to satisfy the SortableColumns type; the backend
        // simply ignores it as it maps to no real column.
        this.sortableColumns = ["id", "patron", "roomnumber"];
        this.leftAlignedColumns = ["purpose_of_use"];
    }

    override connectedCallback() {
        super.connectedCallback();
        this.hydrate();
    }

    private hydrate() {
        this.renderInputs();
    }

    protected override getExpansionFields(datum: Column) {
        const raw = (datum as any)._raw;
        if (!raw) {
            return super.getExpansionFields(datum);
        }

        const borrower = this.borrowers[raw.borrowernumber];
        const equipmentItems = extractEquipmentItems(raw.equipment);
        const equipmentNames = listEquipmentNames(this.equipment, equipmentItems);

        const emptyMark = html`<span class="expansion-empty">-</span>`;
        return [
            { label: __("Booking ID"), value: String(raw.bookingid) },
            { label: __("Patron"), value: patronDisplay(borrower, raw.borrowernumber) },
            { label: __("Room"), value: findRoomName(this.rooms, raw.roomid) },
            { label: __("Start"), value: formatDatetimeByLocale(raw.start, localeFull) },
            { label: __("End"), value: formatDatetimeByLocale(raw.end, localeFull) },
            { label: __("Purpose of use"), value: raw.purpose_of_use || emptyMark },
            { label: __("Equipment"), value: equipmentNames || emptyMark },
            { label: __("Blacked out"), value: raw.blackedout ? __("Yes") : __("No") },
            { label: __("Created"), value: formatDatetimeByLocale(raw.created, localeFull) },
            { label: __("Updated at"), value: formatDatetimeByLocale(raw.updated_at, localeFull) },
        ];
    }

    private renderInputs() {
        this.data = this.bookings.map((booking) => {
            const converted = Object.fromEntries(
                this.getColumnData(booking, [
                    ["roomid", this.rooms],
                    ["borrowernumber", this.borrowers],
                    ["equipment", this.equipment],
                ]),
            );

            const room = this.findRoom(booking.roomid);
            if (this.isSlotRoom(room)) {
                const id = Number(booking.bookingid);
                if (this.overriddenRows.has(id)) {
                    (converted as any).start = this.renderOverriddenStartCell((converted as any).start);
                } else {
                    (converted as any).start = this.renderSlotStartCell(booking);
                    (converted as any).end = this.renderSlotEndCell(booking);
                }
            }

            (converted as any)._raw = booking;
            (converted as any).uuid = `booking-${booking.bookingid}`;
            return converted;
        });
    }

    private findRoom(roomid: unknown) {
        return this.rooms.find((room) => Number((room as any).id) === Number(roomid));
    }

    private isSlotRoom(room: any): boolean {
        return Number(room?.slot_length) > 0;
    }

    private getRowState(booking: any): RowSlotState {
        const id = Number(booking.bookingid);
        let state = this.rowSlotState.get(id);
        if (!state) {
            state = {
                date: booking.start ? dayjs(booking.start).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                slots: [],
                selected: booking.start && booking.end ? `${booking.start}|${booking.end}` : "",
            };
            this.rowSlotState.set(id, state);
        }
        return state;
    }

    private async fetchRowSlots(booking: any) {
        const room = this.findRoom(booking.roomid);
        const state = this.getRowState(booking);
        if (!this.isSlotRoom(room) || !state.date) {
            state.slots = [];
            return;
        }

        try {
            const response = await requestHandler.get("roomSlotsPublic", { date: state.date }, [
                String((room as any).id),
                "slots",
            ]);
            state.slots = response.ok ? ((await response.json()).slots ?? []) : [];
        } catch (error) {
            state.slots = [];
            return;
        }

        // When the booking sits on the fetched date, reconcile the selection to
        // the matching fetched slot so its <option> value lines up exactly.
        if (booking.start && booking.end && dayjs(booking.start).format("YYYY-MM-DD") === state.date) {
            const match = state.slots.find(
                (slot) => dayjs(slot.start).isSame(dayjs(booking.start)) && dayjs(slot.end).isSame(dayjs(booking.end)),
            );
            if (match) {
                state.selected = `${match.start}|${match.end}`;
            }
        }
    }

    /**
     * Slot-mode start cell: a "Custom time" override toggle, a date picker and a
     * dropdown of available slots. Mirrors the staff booking modal, but inline.
     * Controls render disabled and are enabled by the table's edit toggle.
     */
    private renderSlotStartCell(booking: any): TemplateResult {
        const state = this.getRowState(booking);
        const today = dayjs().format("YYYY-MM-DD");

        // Offer available slots plus the booking's own slot (which the slots
        // endpoint reports as unavailable because it conflicts with itself).
        const onGrid = state.slots.filter(
            (slot) => slot.available || (booking.start && dayjs(slot.start).isSame(dayjs(booking.start))),
        );
        const hasSelected = onGrid.some((slot) => packSlotValue(slot.start, slot.end) === state.selected);
        const current = unpackSlotValue(state.selected);
        const options = hasSelected || !current ? onGrid : [{ ...current, available: true } as Slot, ...onGrid];

        return html`
            <div class="flex items-center whitespace-nowrap px-2">
                <label class="flex cursor-pointer items-center pr-2">
                    <input
                        type="checkbox"
                        name="slot_override"
                        class="checkbox"
                        ?disabled=${true}
                        @change=${this.handleOverrideToggle}
                    />
                    <span class="label-text pl-2">${__("Custom time")}</span>
                </label>
                <input
                    type="date"
                    name="slot-date"
                    class="input input-bordered w-min"
                    aria-label=${attr__("Booking date")}
                    min=${today}
                    .value=${state.date}
                    ?disabled=${true}
                    @change=${this.handleRowDateChange}
                />
                <select
                    name="slot"
                    class="select select-bordered w-min"
                    aria-label=${attr__("Time slot")}
                    ?disabled=${true}
                    @change=${this.handleRowSlotChange}
                >
                    <option value="">
                        ${options.length === 0 ? __("No slots available") : __("Please select a time slot")}
                    </option>
                    ${options.map((slot) => {
                        const value = packSlotValue(slot.start, slot.end);
                        const label = `${dayjs(slot.start).format("HH:mm")} – ${dayjs(slot.end).format("HH:mm")}`;
                        return html`<option value=${value} ?selected=${value === state.selected}>${label}</option>`;
                    })}
                </select>
            </div>
        `;
    }

    /** Slot-mode end cell: read-only, derived from the selected slot. */
    private renderSlotEndCell(booking: any): TemplateResult {
        const end = unpackSlotValue(this.getRowState(booking).selected)?.end;
        return html`<span class="whitespace-nowrap px-2">${end ? dayjs(end).format("HH:mm") : "—"}</span>`;
    }

    /** Override mode: keep the free datetime-local start input, prepend the toggle. */
    private renderOverriddenStartCell(originalStart: TemplateResult): TemplateResult {
        return html`
            <div class="flex items-center whitespace-nowrap px-2">
                <label class="flex cursor-pointer items-center pr-2">
                    <input
                        type="checkbox"
                        name="slot_override"
                        class="checkbox"
                        ?checked=${true}
                        ?disabled=${true}
                        @change=${this.handleOverrideToggle}
                    />
                    <span class="label-text pl-2">${__("Custom time")}</span>
                </label>
                ${originalStart}
            </div>
        `;
    }

    /**
     * The slot <select> lives in a cached template, so a re-render re-commits it
     * with the `selected` attribute (defaultSelected), which the browser ignores
     * for the live value. Sync each row's select value imperatively.
     */
    private syncSlotSelects() {
        this.renderRoot.querySelectorAll<HTMLSelectElement>('select[name="slot"]').forEach((select) => {
            const id = Number(select.closest("tr")?.firstElementChild?.textContent?.trim());
            const state = this.rowSlotState.get(id);
            if (state && select.value !== state.selected) {
                select.value = state.selected;
            }
        });
    }

    private bookingFromRow(row: Element | null): { id: number; booking: any } | undefined {
        const id = Number(row?.firstElementChild?.textContent?.trim());
        if (!id) {
            return undefined;
        }
        const booking = this.bookings.find((candidate: any) => Number(candidate.bookingid) === id);
        return booking ? { id, booking } : undefined;
    }

    // A template swap (slot dropdown <-> free inputs) renders the new inputs
    // disabled; re-enable the row's inputs after the re-render so the open edit
    // session stays editable.
    private async reenableRow(row: Element | null) {
        await this.updateComplete;
        row?.querySelectorAll("input, select, textarea, .lit-element").forEach((input) =>
            input.removeAttribute("disabled"),
        );
    }

    private async handleOverrideToggle(e: Event) {
        const checkbox = e.target as HTMLInputElement;
        const row = checkbox.closest("tr");
        const found = this.bookingFromRow(row);
        if (!found) {
            return;
        }

        if (checkbox.checked) {
            this.overriddenRows.add(found.id);
        } else {
            this.overriddenRows.delete(found.id);
            await this.fetchRowSlots(found.booking);
        }
        this.renderInputs();
        await this.reenableRow(row);

        // The re-render swaps the start-cell template, destroying the checkbox
        // the user just activated. Move focus to the recreated one so keyboard
        // and screen-reader users keep their place and hear the new state.
        row?.querySelector<HTMLInputElement>('input[name="slot_override"]')?.focus();
    }

    private handleRowDateChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const row = input.closest("tr");
        const found = this.bookingFromRow(row);
        if (!found) {
            return;
        }

        const state = this.getRowState(found.booking);
        state.date = input.value;
        state.selected = "";
        void this.fetchRowSlots(found.booking).then(() => this.renderInputs());
    }

    private handleRowSlotChange(e: Event) {
        const select = e.target as HTMLSelectElement;
        const found = this.bookingFromRow(select.closest("tr"));
        if (!found) {
            return;
        }

        this.getRowState(found.booking).selected = select.value;
        this.renderInputs();
    }

    // Fetch the available slots for a row when its inline edit opens, and drop a
    // row's transient slot/override state when its edit closes so display cells
    // always fall back to the canonical slot view. Each edit session is seeded
    // fresh from the current booking.
    protected override toggleEdit(e: Event | CustomEvent) {
        super.toggleEdit(e);

        const opened = this.bookingFromRow(this.renderRoot.querySelector(".btn-edit.active")?.closest("tr") ?? null);
        const openedId = opened?.id;

        // A previously open row just closed (save/abort/switching rows).
        if (this.editingId !== undefined && this.editingId !== openedId) {
            this.overriddenRows.delete(this.editingId);
            this.rowSlotState.delete(this.editingId);
        }
        this.editingId = openedId;

        if (opened && this.isSlotRoom(this.findRoom(opened.booking.roomid))) {
            this.overriddenRows.delete(opened.id);
            this.rowSlotState.delete(opened.id);
            void this.fetchRowSlots(opened.booking).then(() => this.renderInputs());
        }

        this.renderInputs();
    }

    private updateEquipmentItemsOnRoomChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        const { value } = target;

        if (!value) {
            return;
        }

        const parentRow = target.closest("tr");
        if (!parentRow) {
            return;
        }

        const bookingKey = parentRow.firstElementChild?.textContent?.trim();
        if (!bookingKey) {
            return;
        }

        const bookingIndex = this.bookings.findIndex((booking: any) => booking.bookingid == bookingKey);
        if (bookingIndex === -1) {
            return;
        }

        if (!this.originalEquipmentSelection) {
            this.originalEquipmentSelection = this.bookings[bookingIndex]?.equipment;
        }

        const roomid = Number(value);
        const updatedBooking = {
            ...this.bookings[bookingIndex],
            roomid,
            equipment: roomid === this.originalEquipmentSelection?.[0] ? this.originalEquipmentSelection : [roomid, []],
        };
        this.bookings[bookingIndex] = updatedBooking;

        // The room drives whether start/end are slot or free inputs. Reset this
        // row's slot state (the old slot belongs to the old room) and refetch.
        const id = Number(updatedBooking.bookingid);
        this.overriddenRows.delete(id);
        this.rowSlotState.set(id, {
            date: updatedBooking.start
                ? dayjs(updatedBooking.start).format("YYYY-MM-DD")
                : dayjs().format("YYYY-MM-DD"),
            slots: [],
            selected: "",
        });

        const newRoomIsSlot = this.isSlotRoom(this.findRoom(roomid));
        const row = target.closest("tr");
        if (newRoomIsSlot) {
            void this.fetchRowSlots(updatedBooking).then(async () => {
                this.renderInputs();
                await this.reenableRow(row);
            });
        } else {
            this.renderInputs();
            void this.reenableRow(row);
        }
    }

    protected override updated(_changedProperties: PropertyValueMap<never> | Map<PropertyKey, unknown>): void {
        super.updated(_changedProperties);
        if (_changedProperties.has("bookings")) {
            this.hydrate();

            if (this.roomSelects) {
                this.roomSelects.forEach((roomSelect) => {
                    roomSelect.addEventListener("change", this.boundUpdateEquipmentItemsOnRoomChange);
                });
            }
        }

        this.syncSlotSelects();
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();

        if (this.roomSelects) {
            this.roomSelects.forEach((roomSelect) => {
                roomSelect.removeEventListener("change", this.boundUpdateEquipmentItemsOnRoomChange);
            });
        }
    }
}
