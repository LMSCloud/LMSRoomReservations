// OPAC-specific entry point
// Only includes components needed for public-facing room reservations

import LMSBookie from "./components/custom/LMSBookie";
import RoomReservationsView from "./views/RoomReservationsView";

import LMSCalendar from "@jpahd/kalendus";

export { LMSBookie, LMSCalendar, RoomReservationsView };
