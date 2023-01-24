import { html, LitElement } from "lit";
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

function renderOnUpdate({
  entryPoint,
  tagname,
  eventName,
  eventTarget,
  endpoint,
  options = {},
}) {
  const entryPointRef = entryPoint;
  const eventTargetRef = eventTarget || entryPoint;
  eventTargetRef.addEventListener(eventName, async () => {
    const response = await fetch(endpoint, options);
    if ([200, 201, 204].includes(response.status)) {
      const result = await response.json();
      entryPointRef.innerHTML = "";
      result.forEach((item) => {
        const element = document.createElement(tagname);
        Object.keys(item).forEach((key) => {
          element.setAttribute(key, item[key]);
        });
        entryPointRef.appendChild(element);
      });
    }
  });
}

function renderCalendar() {
  const currentDate = new Date();
  const options = { headers: { accept: "" } };
  const response = fetch("/api/v1/contrib/roomreservations/bookings", options);

  const calendar = document.querySelector("lms-calendar");
  if (!calendar) {
    throw Error("No calendar reference found.");
  }

  calendar.heading = "Current Bookings";
  calendar.activeDate = {
    day: currentDate.getDate(),
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };

  response
    .then((result) => result.json())
    .then(async (entries) => {
      const response = await fetch(
        "/api/v1/contrib/roomreservations/rooms",
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
          content: "booked",
          color: room.color,
        };
      });
    });
}

export {
  html,
  LitElement,
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
  renderOnUpdate,
  renderCalendar,
};
