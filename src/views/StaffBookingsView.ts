import { createSchema, fromURL, get, merge } from "@jpahd/qparams";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { requestHandler } from "../lib/RequestHandler";
import { normalizeForInput } from "../lib/converters/datetimeConverters";
import { __ } from "../lib/translate";
import { LMSBookingsModal, LMSBookingsTable } from "../main";
import { cardDeckStylesStaff } from "../styles/cardDeck";
import { skeletonStyles } from "../styles/skeleton";
import { tailwindStyles } from "../tailwind.lit";
import { Column } from "../types/common";

declare global {
    interface HTMLElementTagNameMap {
        "lms-bookings-modal": LMSBookingsModal;
        "lms-bookings-table": LMSBookingsTable;
    }
}

const DEFAULT_PER_PAGE = 20;
const DEFAULT_ORDER_BY = "start";

// _page/_per_page/_order_by are plain last-write-wins params; the schema gives
// us a single, consistent place to merge updates into the URL.
const QUERY_SCHEMA = createSchema();

@customElement("lms-staff-bookings-view")
export default class StaffBookingsView extends LitElement {
    @state() hasLoaded = false;

    @state() private bookings: Column[] = [];

    @state() private nextPage: Column[] | undefined = undefined;

    @state() private borrowers: Record<string, unknown> = {};

    @state() private _page = 1;

    @state() private _per_page = DEFAULT_PER_PAGE;

    @state() private _order_by = DEFAULT_ORDER_BY;

    private _q = "{}";

    private isEmpty = false;

    private rooms?: Column[];

    private activeRooms?: Column[];

    private equipment?: Column[];

    private activeEquipment?: Column[];

    private boundHandlePopState = this.handlePopState.bind(this);

    static override styles = [tailwindStyles, skeletonStyles, cardDeckStylesStaff];

    override connectedCallback() {
        super.connectedCallback();

        this.syncStateFromUrl();
        // Write the resolved defaults back so the URL is explicit and the
        // pagination control always has page/per-page to work from.
        this.commitState(
            { _page: String(this._page), _per_page: String(this._per_page), _order_by: this._order_by },
            "replace",
        );

        window.addEventListener("popstate", this.boundHandlePopState);
        this.loadReferenceData()
            .then(() => this.loadPage())
            .then(() => {
                this.hasLoaded = true;
            });
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("popstate", this.boundHandlePopState);
    }

    private handlePopState() {
        this.syncStateFromUrl();
        void this.loadPage();
    }

    private syncStateFromUrl() {
        const params = fromURL(window.location.href);
        this._page = Math.max(1, parseInt(get(params, "_page") ?? "", 10) || 1);
        this._per_page = parseInt(get(params, "_per_page") ?? "", 10) || DEFAULT_PER_PAGE;
        this._order_by = get(params, "_order_by") ?? DEFAULT_ORDER_BY;
        this._q = get(params, "q") ?? "{}";
    }

    private commitState(updates: Record<string, string>, mode: "push" | "replace") {
        const merged = merge(QUERY_SCHEMA, fromURL(window.location.href), updates);
        const url = new URL(window.location.href);
        url.search = merged.toString();
        window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", url.toString());
        this.syncStateFromUrl();
    }

    private bookingsQuery(page = this._page) {
        const query: Record<string, string> = {
            _page: String(page),
            _per_page: String(this._per_page),
            _order_by: this._order_by,
        };
        if (this._q && this._q !== "{}") {
            query["q"] = this._q;
        }
        return query;
    }

    private async loadReferenceData() {
        const [roomsResponse, equipmentResponse] = await Promise.all([
            requestHandler.get("rooms", { include_deleted: "1" }),
            requestHandler.get("equipment", { include_deleted: "1" }),
        ]);
        const [rooms, equipment] = await Promise.all([roomsResponse.json(), equipmentResponse.json()]);

        const toRoomOption = (room: any) => ({
            id: room.roomid,
            name: room.roomnumber,
            slot_length: room.slot_length,
            slot_start: room.slot_start,
        });
        const toEquipmentOption = (item: any) => ({
            id: item.equipmentid,
            name: item.equipmentname,
            roomid: item.roomid,
        });

        this.rooms = rooms.map(toRoomOption);
        this.activeRooms = rooms.filter((room: any) => !room.deleted_at).map(toRoomOption);
        this.equipment = equipment.map(toEquipmentOption);
        this.activeEquipment = equipment.filter((item: any) => !item.deleted_at).map(toEquipmentOption);
    }

    private async fetchBookingsPage(page: number): Promise<Column[]> {
        const response = await requestHandler.get("bookings", this.bookingsQuery(page));
        const bookings = await response.json();
        return bookings.map((booking: any) => ({
            ...booking,
            start: normalizeForInput(booking["start"], "datetime-local"),
            end: normalizeForInput(booking["end"], "datetime-local"),
            equipment: [booking["roomid"], booking["equipment"]],
        }));
    }

    private async fetchBorrowersFor(bookings: Column[]): Promise<Record<string, unknown>> {
        const borrowernumbers = Array.from(new Set(bookings.map((booking: any) => booking.borrowernumber))).filter(
            (borrowernumber) => borrowernumber !== undefined && borrowernumber !== null,
        );
        if (!borrowernumbers.length) {
            return {};
        }

        const response = await fetch(`/api/v1/patrons?_per_page=-1&q={"borrowernumber":[${borrowernumbers}]}`);
        const borrowers: any[] = await response.json();
        return borrowers.reduce((acc, borrower) => ({ ...acc, [borrower.patron_id]: borrower }), {});
    }

    private async loadPage() {
        // Fetch the current page and the next one together; the next page drives
        // the pagination control's "hasNext", and refetching it on every load
        // keeps it correct after searches/sorts/mutations that don't change the
        // page number.
        const [bookings, nextPage] = await Promise.all([
            this.fetchBookingsPage(this._page),
            this.fetchBookingsPage(this._page + 1),
        ]);
        const borrowers = await this.fetchBorrowersFor(bookings);
        // Commit together so the table never renders a page whose patrons
        // haven't loaded yet (which blanked the borrowernumber column).
        this.borrowers = borrowers;
        this.bookings = bookings;
        this.nextPage = nextPage;
        // "Empty" — show the add-a-booking prompt — only when there are genuinely
        // no bookings AND no active search. A search that matches nothing must
        // keep the table (and its search box) so the user can refine or clear it.
        this.isEmpty = this._page === 1 && bookings.length === 0 && this._q === "{}";
    }

    private handlePage = (e: CustomEvent) => {
        const { _page, _per_page } = e.detail;
        this.commitState({ _page: String(_page), _per_page: String(_per_page) }, "push");
        void this.loadPage();
    };

    private handleSearch = (e: CustomEvent) => {
        const { q } = e.detail;
        this.commitState({ q: q ?? "{}", _page: "1" }, "push");
        void this.loadPage();
    };

    private handleSort = (e: CustomEvent) => {
        const { _order_by } = e.detail;
        const active = this._order_by.replace(/^-/, "");
        // Re-clicking the active column flips the direction; a new column starts ascending.
        const next = active === _order_by && !this._order_by.startsWith("-") ? `-${_order_by}` : _order_by;
        this.commitState({ _order_by: next, _page: "1" }, "push");
        void this.loadPage();
    };

    private handleMutation = () => {
        void this.loadPage();
    };

    override render() {
        if (!this.hasLoaded) {
            return html` <div class="mx-8">
                <div class="skeleton skeleton-table"></div>
            </div>`;
        }

        if (this.isEmpty) {
            return html`<h1 class="text-center">
                    ${__("You can add a new booking by clicking on the + button below")}.
                </h1>
                <lms-bookings-modal
                    .rooms=${this.activeRooms ?? []}
                    .equipment=${this.activeEquipment ?? []}
                    @created=${this.handleMutation}
                ></lms-bookings-modal>`;
        }

        return html`
            <lms-bookings-table
                .bookings=${this.bookings}
                .rooms=${this.rooms ?? []}
                .borrowers=${this.borrowers}
                .equipment=${this.equipment ?? []}
                .nextPage=${this.nextPage}
                .hasNoResults=${this.bookings.length === 0}
                ._page=${this._page}
                ._per_page=${this._per_page}
                @page=${this.handlePage}
                @sort=${this.handleSort}
                @search=${this.handleSearch}
                @deleted=${this.handleMutation}
                @updated=${this.handleMutation}
            ></lms-bookings-table>
            <lms-bookings-modal
                .rooms=${this.activeRooms ?? []}
                .equipment=${this.activeEquipment ?? []}
                @created=${this.handleMutation}
            ></lms-bookings-modal>
        `;
    }
}
