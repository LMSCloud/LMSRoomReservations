const userMenuUl = document.querySelector("#usermenu > #menu > ul");

if (userMenuUl) {
  function handleMenuEntryClick() {
    const userMenuItems = Array.from(userMenuUl.children);
    userMenuItems.forEach((element) => element.classList.remove("active"));
    userMenuItems[userMenuItems.length - 1].classList.add("active");

    const mainContent = document.querySelector(".maincontent");
    mainContent.innerHTML = "";

    Promise.all([
      fetch("/api/v1/contrib/roomreservations/public/patron/bookings"),
      fetch("/api/v1/contrib/roomreservations/public/rooms"),
    ])
      .then((responses) =>
        Promise.all(responses.map((response) => response.json())),
      )
      .then(([patronsBookings, rooms]) => {
        const lmsPatronsBookingsTable = document.createElement(
          "lms-patrons-bookings-table",
        );
        lmsPatronsBookingsTable.setAttribute(
          "is",
          "lms-patrons-bookings-table",
        );

        const stylesheetLink = document.querySelector(
          'link[rel="stylesheet"][href*="/opac-tmpl/bootstrap/css/opac_"][href$=".css"]',
        );
        if (!stylesheetLink) {
          lmsPatronsBookingsTable.setAttribute("error", "CSS_NOT_FOUND");
        } else {
          lmsPatronsBookingsTable.setAttribute(
            "external-stylesheet-src",
            stylesheetLink.href,
          );
          lmsPatronsBookingsTable.setAttribute(
            "patrons-bookings",
            JSON.stringify(patronsBookings),
          );
          lmsPatronsBookingsTable.setAttribute("rooms", JSON.stringify(rooms));
          const pageUrl = window.__LMS_ROOM_RESERVATIONS_PAGE_URL__;
          if (pageUrl) {
            lmsPatronsBookingsTable.setAttribute("page-url", pageUrl);
          }
        }

        mainContent.appendChild(lmsPatronsBookingsTable);
      });
  }

  fetch("/api/v1/contrib/roomreservations/static/dist/PatronsBookingsTable.js")
    .then((response) => response.text())
    .then((result) => {
      // Load the component
      const script = document.createElement("script");
      script.text = result;
      document.body.appendChild(script);

      // Setup translations
      const locale = document.documentElement.lang.slice(0, 2);
      const menuEntryTitleTranslation = {
        en: "Room Reservations",
        de: "Raumbuchungen",
      };
      const menuEntryText = menuEntryTitleTranslation[locale];

      // Create the menu entry for the room reservations page
      const roomReservationsMenuEntry = document.createElement("li");
      roomReservationsMenuEntry.innerHTML = `<a href="#"> ${menuEntryText} </a>`;
      userMenuUl.appendChild(roomReservationsMenuEntry);

      // Add the event listener for rendering the page
      roomReservationsMenuEntry.addEventListener("click", handleMenuEntryClick);
    });
}
