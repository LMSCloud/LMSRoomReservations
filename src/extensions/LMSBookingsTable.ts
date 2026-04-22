import { PropertyValueMap, html } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";
import LMSTable from "../components/LMSTable";
import { requestHandler } from "../lib/RequestHandler";
import { extractEquipmentItems, findRoomName, listEquipmentNames, patronDisplay } from "../lib/bookingDisplay";
import { formatDatetimeByLocale } from "../lib/converters/datetimeConverters";
import { __, localeFull } from "../lib/translate";
import { Column, Input } from "../types/common";

type EquipmentSelection = [number, any[]];

@customElement("lms-bookings-table")
export default class LMSBookingsTable extends LMSTable {
    @property({ type: Array }) bookings: any[] = [];

    @property({ type: Array }) borrowers: any[] = [];

    @property({ type: Array }) rooms: any[] = [];

    @property({ type: Array }) equipment: any[] = [];

    @queryAll('select[name="roomid"]') roomSelects!: NodeListOf<HTMLSelectElement>;

    private originalEquipmentSelection: EquipmentSelection | undefined;

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

        const response = await requestHandler.put(
            "bookings",
            {
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
            },
            undefined,
            [key.toString()],
        );
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
        this.hasControls = false;
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

        const emptyMark = html`<span class="expansion-empty">${__("—")}</span>`;
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
            (converted as any)._raw = booking;
            (converted as any).uuid = `booking-${booking.bookingid}`;
            return converted;
        });
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

        this.renderInputs();
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
