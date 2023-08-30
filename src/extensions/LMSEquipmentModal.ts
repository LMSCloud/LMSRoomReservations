import { customElement } from "lit/decorators.js";
import LMSModal from "../components/LMSModal";
import { __, attr__ } from "../lib/translate";

@customElement("lms-equipment-modal")
export default class LMSEquipmentModal extends LMSModal {
    override connectedCallback() {
        super.connectedCallback();
        this.hydrate();
    }

    private hydrate() {
        this.modalTitle = __("Add Equipment");
        this.createOpts = {
            endpoint: "equipment",
        };
        this.fields = [
            {
                name: "equipmentname",
                type: "text",
                desc: __("Equipmentname"),
                placeholder: attr__("An identifier for the equipment, e.g. 'Laptop' or '3D-Printer'"),
                required: true,
            },
            {
                name: "description",
                type: "text",
                desc: __("Description"),
                placeholder: attr__("A short description for the equipment"),
                required: true,
            },
            {
                name: "image",
                type: "text",
                desc: __("Image"),
                placeholder: attr__("A URL for the image of the equipment, e.g. 'https://example.com/room'"),
                required: true,
            },
            {
                name: "maxbookabletime",
                type: "text",
                placeholder: attr__("Max time the equipment is allowed to be booked (in minutes), e.g. '120'"),
                desc: __("Max bookable time"),
            },
            {
                name: "info",
                type: "info",
                desc: __("You can assign this item to a room once its created."),
            },
        ];

        this.inputs = this.fields.flatMap((field) => this.composeTaggedInputs(field));
    }
}
