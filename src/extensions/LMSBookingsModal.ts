import { PropertyValueMap } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import LMSModal from "../components/LMSModal";
import { __, attr__ } from "../lib/translate";

@customElement("lms-bookings-modal")
export default class LMSBookingsModal extends LMSModal {
    @property({ type: Array }) rooms: any[] = [];

    @property({ type: Array }) equipment: any[] = [];

    @query('select[name="roomid"]') roomSelect!: HTMLSelectElement;

    private boundUpdateEquipmentItemsOnRoomChange = this.updateEquipmentItemsOnRoomChange.bind(this);

    override connectedCallback(): void {
        super.connectedCallback();
        this.hydrate();
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
                desc: __("Roomid (Changing this resets other fields)"),
                required: true,
            },
            {
                name: "borrowernumber",
                type: "patron-search",
                desc: __("Borrowernumber (Search)"),
                placeholder: attr__("The borrowernumber of the borrower which the booking is for"),
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
                name: "send_confirmation",
                type: "checkbox",
                desc: __("Send confirmation to patron"),
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

    private renderInputs(equipment: any[] = []) {
        this.inputs = this.fields.flatMap((field) =>
            this.composeTaggedInputs(field, [
                ["roomid", this.rooms],
                ["borrowernumber", []],
                ["equipment", equipment],
            ]),
        );
    }

    private updateEquipmentItemsOnRoomChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        const { value } = target;

        if (!value) {
            return;
        }

        const newEquipmentItems = this.equipment.filter((equipmentItem) => equipmentItem.roomid == value);
        if (!newEquipmentItems) {
            return;
        }

        this.renderInputs(newEquipmentItems);
    }

    protected override updated(_changedProperties: PropertyValueMap<never> | Map<PropertyKey, unknown>): void {
        super.updated(_changedProperties);

        if (this.roomSelect) {
            this.roomSelect.addEventListener("change", this.boundUpdateEquipmentItemsOnRoomChange);
        }
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();

        if (this.roomSelect) {
            this.roomSelect.removeEventListener("change", this.boundUpdateEquipmentItemsOnRoomChange);
        }
    }
}
