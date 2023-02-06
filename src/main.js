import LMSRoom from "./components/LMSRoom";
import LMSModal from "./components/LMSModal";
import LMSRoomModal from "./components/LMSRoomModal";
import LMSEquipmentItem from "./components/LMSEquipmentItem";
import LMSEquipmentModal from "./components/LMSEquipmentModal";
import LMSSearch from "./components/LMSSearch";
import LMSTable from "./components/LMSTable";
import LMSSettingsTable from "./components/LMSSettingsTable";
import LMSOpenHoursTable from "./components/LMSOpenHoursTable";
import LMSBookingsTable from "./components/LMSBookingsTable";
import LMSBookingsModal from "./components/LMSBookingsModal";
import LMSCalendar from "./components/LMSCalendar/lib/lms-calendar";
import LMSBookie from "./components/LMSBookie";
import LMSToast from "./components/LMSToast";
import LMSRoomsContainer from "./components/LMSRoomsContainer";
import LMSEquipmentContainer from "./components/LMSEquipmentContainer";
import LMSOpenHoursTablesContainer from "./components/LMSOpenHoursTablesContainer";
import LMSBookingsTableContainer from "./components/LMSBookingsTableContainer";
import "./main.css";

import Gettext from "gettext.js";

function renderCalendar() {
  const i18n = Gettext();

  const currentDate = new Date();
  const options = { headers: { accept: "" } };
  const response = fetch(
    "/api/v1/contrib/roomreservations/public/bookings",
    options
  );

  const calendar = document.querySelector("lms-calendar");
  if (!calendar) {
    throw Error("No calendar reference found.");
  }

  calendar.heading = i18n.gettext("Current Bookings");
  calendar.activeDate = {
    day: currentDate.getDate(),
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };

  response
    .then((result) => result.json())
    .then(async (entries) => {
      const response = await fetch(
        "/api/v1/contrib/roomreservations/public/rooms",
        options
      );
      const rooms = await response.json();

      calendar.entries = entries.map(({ roomid, start, end }) => {
        const [s, e] = [new Date(start), new Date(end)];
        const _roomid = roomid;
        const room = rooms.find(({ roomid }) => roomid == _roomid);
        return {
          date: {
            start: {
              day: s.getDate(),
              month: s.getMonth() + 1,
              year: s.getFullYear(),
            },
            end: {
              day: e.getDate(),
              month: e.getMonth() + 1,
              year: e.getFullYear(),
            },
          },
          time: {
            start: { hours: s.getHours(), minutes: s.getMinutes() },
            end: { hours: e.getHours(), minutes: e.getMinutes() },
          },
          heading: room.roomnumber,
          content: i18n.gettext("booked"),
          color: room.color,
        };
      });
    });
}

export {
  LMSRoom,
  LMSModal,
  LMSRoomModal,
  LMSEquipmentItem,
  LMSEquipmentModal,
  LMSSearch,
  LMSTable,
  LMSSettingsTable,
  LMSOpenHoursTable,
  LMSBookingsTable,
  LMSBookingsModal,
  LMSCalendar,
  LMSBookie,
  LMSToast,
  LMSRoomsContainer,
  LMSEquipmentContainer,
  LMSOpenHoursTablesContainer,
  LMSBookingsTableContainer,
  renderCalendar,
};
