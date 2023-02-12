import LMSFloatingMenu from "../components/LMSFloatingMenu";
import {
  faCog,
  faCube,
  faTag,
  faList,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

export default class LMSRoomReservationsMenu extends LMSFloatingMenu {
  static properties = {
    baseurl: { type: String },
    pluginclass: { type: String },
  };

  constructor() {
    super();
    this.baseurl = "";
    this.pluginclass = "";
  }

  connectedCallback() {
    super.connectedCallback();
    this._i18n.then((i18n) => {
      this.items = [
        {
          name: i18n.gettext("Settings"),
          icon: faCog,
          url: `${this.baseurl}?class=${this.pluginclass}&method=configure`,
          method: "configure",
        },
        {
          name: i18n.gettext("Rooms"),
          icon: faCube,
          url: `${this.baseurl}?class=${this.pluginclass}&method=configure&op=rooms`,
          method: "configure",
        },
        {
          name: i18n.gettext("Equipment"),
          icon: faTag,
          url: `${this.baseurl}?class=${this.pluginclass}&method=configure&op=equipment`,
          method: "configure",
        },
        {
          name: i18n.gettext("Bookings"),
          icon: faList,
          url: `${this.baseurl}?class=${this.pluginclass}&method=tool`,
          method: "tool",
        },
        {
          name: i18n.gettext("Open Hours"),
          icon: faClock,
          url: `${this.baseurl}?class=${this.pluginclass}&method=tool&op=open-hours`,
          method: "tool",
        },
      ];
    });
  }
}
customElements.define("lms-room-reservations-menu", LMSRoomReservationsMenu);
