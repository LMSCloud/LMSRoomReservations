import { customElement, property } from "lit/decorators.js";
import LMSModal from "../components/LMSModal";
import { __, attr__ } from "../lib/translate";

@customElement("lms-room-modal")
export default class LMSRoomModal extends LMSModal {
    @property({ type: Array }) libraries: any[] = [];

    override connectedCallback() {
        super.connectedCallback();
        this.hydrate();
    }

    private hydrate() {
        this.modalTitle = __("Add a Room");
        this.createOpts = {
            endpoint: "rooms",
        };
        this.fields = [
            {
                name: "maxcapacity",
                type: "text",
                desc: __("Max capacity"),
                placeholder: attr__(
                    "The max allowed number of people that can use this room at the same time, e.g. '10'",
                ),
                required: true,
            },
            {
                name: "color",
                type: "color",
                desc: __("Color"),
                required: true,
            },
            {
                name: "image",
                type: "text",
                desc: __("Image"),
                placeholder: attr__("A URL for the image of the room, e.g. 'https://example.com/room'"),
                required: true,
            },
            {
                name: "description",
                type: "text",
                desc: __("Description"),
                placeholder: attr__("A short description for the room, e.g. 'Small room with blankets and couches'"),
                required: true,
            },
            {
                name: "maxbookabletime",
                type: "text",
                placeholder: attr__("Max time the room is allowed to be booked (in minutes), e.g. '120'"),
                desc: __("Max bookable time"),
            },
            {
                name: "branch",
                type: "select",
                desc: __("Branch"),
                required: true,
            },
            {
                name: "roomnumber",
                type: "text",
                desc: __("Roomnumber"),
                placeholder: attr__("An identifier for the room, e.g. '101' or 'Concert Hall'"),
                required: true,
            },
        ];

        this.inputs = this.fields.flatMap((field) => this.composeTaggedInputs(field, [["branch", this.libraries]]));
    }
}
