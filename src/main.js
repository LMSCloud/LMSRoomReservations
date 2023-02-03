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
import LMSToast from "./components/LMSToast";
import "./main.css";

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
        const element = document.createElement(tagname, { is: tagname });
        Object.keys(item).forEach((key) => {
          element.setAttribute(key, item[key]);
        });
        entryPointRef.appendChild(element);
      });
    }
  });
}

function renderToastOnError({ entryPoint, eventName }) {
  const entryPointRef = entryPoint;
  entryPointRef.addEventListener(eventName, (e) => {
    const { errors, status } = e.detail;
    const element = document.createElement("lms-toast", { is: "lms-toast" });
    element.setAttribute("heading", status);
    element.setAttribute(
      "message",
      errors.reduce(
        (acc, { message, path }, idx) =>
          `${acc} message: ${message} path: ${path} ${idx > 0 ? "& " : ""}`,
        ""
      )
    );
    entryPointRef.appendChild(element);
  });
}

function renderCalendar() {
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
          content: "booked",
          color: room.color,
        };
      });
    });
}

function renderOpenHours() {
  const entryPoint = document.getElementById("entry-point");
  const endpoint = "/api/v1/contrib/roomreservations/public/open_hours";
  const options = {
    headers: {
      Accept: "",
    },
  };
  const openHours = fetch(endpoint, options);
  openHours
    .then((response) => response.json())
    .then((result) => {
      if (result.length) {
        const groupedResult = groupBy(result, (item) => item.branch);
        Array.from(Object.entries(groupedResult)).forEach(([branch, data]) => {
          const lmsOpenHoursTable = document.createElement(
            "lms-open-hours-table",
            {
              is: "lms-open-hours-table",
            }
          );
          lmsOpenHoursTable.setAttribute("branch", branch);
          lmsOpenHoursTable.setAttribute("data", JSON.stringify(data));
          entryPoint.appendChild(lmsOpenHoursTable);
        });
        return;
      }

      const branches = fetch("/api/v1/libraries");
      branches
        .then((response) => response.json())
        .then((result) => {
          result
            .map((library) => ({
              branch: library.library_id,
            }))
            .forEach(({ branch }) => {
              const lmsOpenHoursTable = document.createElement(
                "lms-open-hours-table",
                {
                  is: "lms-open-hours-table",
                }
              );
              lmsOpenHoursTable.setAttribute("branch", branch);
              entryPoint.appendChild(lmsOpenHoursTable);
            });
        });
    });
}

function groupBy(array, predicate) {
  return array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {});
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
  LMSToast,
  renderOnUpdate,
  renderCalendar,
  renderOpenHours,
  renderToastOnError,
};
