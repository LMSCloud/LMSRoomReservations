import { faClock, faCog, faCube, faList, faTag } from "@fortawesome/free-solid-svg-icons";
import { customElement, property } from "lit/decorators.js";
import LMSFloatingMenu from "../components/LMSFloatingMenu";
import { __ } from "../lib/translate";

@customElement("lms-room-reservations-menu")
export default class LMSRoomReservationsMenu extends LMSFloatingMenu {
    @property({ type: String, attribute: "base-url" }) baseUrl = "";

    @property({ type: String, attribute: "plugin-class" }) pluginClass = "";

    override connectedCallback() {
        super.connectedCallback();
        this.hydrate();
    }

    private composeUrl(method: string, op?: string) {
        const searchParams = new URLSearchParams(this.baseUrl);
        searchParams.set("class", this.pluginClass);
        searchParams.set("method", method);
        if (op) {
            searchParams.set("op", op);
        }
        return `${this.baseUrl}?${searchParams.toString()}`;
    }

    private hydrate() {
        this.items = [
            {
                name: __("Settings"),
                icon: faCog,
                url: this.composeUrl("configure"),
                method: "configure",
            },
            {
                name: __("Rooms"),
                icon: faCube,
                url: this.composeUrl("configure", "rooms"),
                method: "configure",
            },
            {
                name: __("Equipment"),
                icon: faTag,
                url: this.composeUrl("configure", "equipment"),
                method: "configure",
            },
            {
                name: __("Bookings"),
                icon: faList,
                url: this.composeUrl("tool"),
                method: "tool",
            },
            {
                name: __("Open Hours"),
                icon: faClock,
                url: this.composeUrl("tool", "open-hours"),
                method: "tool",
            },
        ];
    }
}
