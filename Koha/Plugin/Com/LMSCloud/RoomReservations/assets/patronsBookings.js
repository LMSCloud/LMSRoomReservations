const userMenuUl = document.querySelector("#usermenu > #menu > ul");

if (userMenuUl) {
    class PatronsRoomReservationsView {
        constructor() {
            this.init();
        }

        async init() {
            await this.loadMainScript();
            
            const locale = document.documentElement.lang.slice(0, 2);
            const menuEntryTileTranslations = {
                en: "Your Room Reservations",
                de: "Raumbuchungen",
            };
            const menuEntryText = menuEntryTileTranslations[locale];

            const roomReservationsMenuEntry = document.createElement("li");
            roomReservationsMenuEntry.innerHTML = `<a href="#"> ${menuEntryText} </a>`;
            userMenuUl.appendChild(roomReservationsMenuEntry);

            roomReservationsMenuEntry.addEventListener("click", async () => {
                await this.handleMenuEntryClick();
            });
        }

        async loadMainScript() {
            const response = await fetch("/api/v1/contrib/roomreservations/static/dist/main.js");
            const text = await response.text();
            const script = document.createElement("script");
            script.text = text;
            document.body.appendChild(script);
        }

        async handleMenuEntryClick() {
            const userMenuItems = Array.from(userMenuUl.children);
            userMenuItems.forEach((element) => element.classList.remove("active"));
            userMenuItems[userMenuItems.length - 1].classList.add("active");

            const mainContent = document.querySelector(".maincontent");
            mainContent.innerHTML = "";

            const [patronsBookingsResponse, roomsResponse] = await Promise.all([
                fetch("/api/v1/contrib/roomreservations/public/patron/bookings"),
                fetch("/api/v1/contrib/roomreservations/public/rooms"),
            ]);

            const [patronsBookings, rooms] = await Promise.all([patronsBookingsResponse.json(), roomsResponse.json()]);

            const lmsPatronsBookingsTable = document.createElement("lms-patrons-bookings-table");
            lmsPatronsBookingsTable.setAttribute("is", "lms-patrons-bookings-table");

            const stylesheetLink = document.querySelector('link[rel="stylesheet"][href*="/opac-tmpl/bootstrap/css/opac_"][href$=".css"]');
            console.log(stylesheetLink.href);
            if (!stylesheetLink) {
                lmsPatronsBookingsTable.setAttribute("error", "CSS_NOT_FOUND");
            } else {
                lmsPatronsBookingsTable.setAttribute("external-stylesheet-src", stylesheetLink.href);
                lmsPatronsBookingsTable.setAttribute("patrons-bookings", JSON.stringify(patronsBookings));
                lmsPatronsBookingsTable.setAttribute("rooms", JSON.stringify(rooms));
            }

            mainContent.appendChild(lmsPatronsBookingsTable);
        }
    }

    new PatronsRoomReservationsView();
}
