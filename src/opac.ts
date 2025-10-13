// OPAC-specific entry point
// Only includes components needed for public-facing room reservations

import LMSBookie from "./components/custom/LMSBookie";
import RoomReservationsView from "./views/RoomReservationsView";

// @ts-ignore
import LMSCalendar from "./components/custom/LMSCalendar/build/lms-calendar.bundled.js";

export { LMSBookie, LMSCalendar, RoomReservationsView };
