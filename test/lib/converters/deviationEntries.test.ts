import { deviationsToCalendarEntries, expandDeviationInstances } from "../../../src/lib/converters/deviationEntries";
import type { Deviation } from "../../../src/types/common";

function makeDeviation(overrides: Partial<Deviation> = {}): Deviation {
    return {
        deviationid: 1,
        isblackout: 1,
        start: "2026-06-17 00:00:00",
        end: "2026-06-17 23:59:59",
        recurrencetype: "none",
        recurrencedays: null,
        recurrenceuntil: null,
        rrule: null,
        description: null,
        created: "2026-06-01 00:00:00",
        updated_at: "2026-06-01 00:00:00",
        branches: [],
        rooms: [],
        ...overrides,
    };
}

const ROOMS = [
    { roomid: 10, roomnumber: "A1", branch: "MAIN" },
    { roomid: 20, roomnumber: "B2", branch: "MAIN" },
    { roomid: 30, roomnumber: "C3", branch: "OTHER" },
];

const WINDOW_START = new Date("2026-01-01T00:00:00");
const WINDOW_END = new Date("2026-12-31T23:59:59");
const OPTS = { closedLabel: "Closed", allRoomsLabel: "all rooms", roomsLabel: "rooms", color: "#dc2626" };

describe("expandDeviationInstances", () => {
    it("returns a single instance for a non-recurring deviation", () => {
        const instances = expandDeviationInstances(makeDeviation(), WINDOW_START, WINDOW_END);
        expect(instances).toHaveLength(1);
        expect(instances[0]!.start.getDate()).toBe(17);
    });

    it("expands a daily deviation across the window, capped by recurrenceuntil", () => {
        const deviation = makeDeviation({
            start: "2026-06-01 09:00:00",
            end: "2026-06-01 12:00:00",
            recurrencetype: "daily",
            recurrenceuntil: "2026-06-05",
        });
        const instances = expandDeviationInstances(deviation, WINDOW_START, WINDOW_END);
        // June 1–5 inclusive.
        expect(instances).toHaveLength(5);
        expect(instances.every((i) => i.start.getHours() === 9 && i.end.getHours() === 12)).toBe(true);
    });

    it("expands weekdays-only recurrence to Mon–Fri", () => {
        const deviation = makeDeviation({
            // 2026-06-01 is a Monday.
            start: "2026-06-01 09:00:00",
            end: "2026-06-01 12:00:00",
            recurrencetype: "weekdays",
            recurrenceuntil: "2026-06-07", // through Sunday
        });
        const instances = expandDeviationInstances(deviation, WINDOW_START, WINDOW_END);
        // Mon–Fri only — Saturday(6th)/Sunday(7th) excluded.
        expect(instances).toHaveLength(5);
        expect(instances.every((i) => [1, 2, 3, 4, 5].includes(i.start.getDay()))).toBe(true);
    });

    it("expands weekly recurrence on the stored recurrencedays (0=Mon..6=Sun)", () => {
        const deviation = makeDeviation({
            start: "2026-06-01 09:00:00",
            end: "2026-06-01 12:00:00",
            recurrencetype: "weekly",
            recurrencedays: "2,4", // Wednesday and Friday
            recurrenceuntil: "2026-06-14",
        });
        const instances = expandDeviationInstances(deviation, WINDOW_START, WINDOW_END);
        // Wed(3rd,10th) + Fri(5th,12th) within the two weeks.
        expect(instances.map((i) => i.start.getDate()).sort((a, b) => a - b)).toEqual([3, 5, 10, 12]);
    });

    it("fast-forwards a long-running closure that started before the window", () => {
        const deviation = makeDeviation({
            // Started two years before the window, no end date.
            start: "2024-01-01 00:00:00",
            end: "2024-01-01 23:59:59",
            recurrencetype: "weekly",
            recurrencedays: "0", // Mondays
            recurrenceuntil: null,
        });
        const instances = expandDeviationInstances(deviation, WINDOW_START, WINDOW_END);
        // Every instance lands inside the window and on a Monday, despite the
        // far-past start — none of the cap is wasted on pre-window dates.
        expect(instances.length).toBeGreaterThan(40);
        expect(instances.every((i) => i.start >= WINDOW_START && i.start <= WINDOW_END)).toBe(true);
        expect(instances.every((i) => i.start.getDay() === 1)).toBe(true);
    });

    it("matches the monthly day-of-month", () => {
        const deviation = makeDeviation({
            start: "2026-01-15 09:00:00",
            end: "2026-01-15 12:00:00",
            recurrencetype: "monthly",
            recurrenceuntil: "2026-03-31",
        });
        const instances = expandDeviationInstances(deviation, WINDOW_START, WINDOW_END);
        expect(instances.map((i) => i.start.getMonth())).toEqual([0, 1, 2]);
        expect(instances.every((i) => i.start.getDate() === 15)).toBe(true);
    });
});

describe("deviationsToCalendarEntries", () => {
    it("skips special-hours (non-blackout) deviations", () => {
        const entries = deviationsToCalendarEntries([makeDeviation({ isblackout: 0 })], ROOMS, WINDOW_START, WINDOW_END, OPTS);
        expect(entries).toHaveLength(0);
    });

    it("renders a full-day library-wide closure as an all-day-shaped entry", () => {
        const entries = deviationsToCalendarEntries([makeDeviation()], ROOMS, WINDOW_START, WINDOW_END, OPTS);
        expect(entries).toHaveLength(1);
        expect(entries[0]!.heading).toBe("Closed");
        expect(entries[0]!.color).toBe("#dc2626");
        // 00:00–23:59 → kalendus treats a ≥23h span as all-day.
        expect(entries[0]!.time.start).toEqual({ hour: 0, minute: 0 });
        expect(entries[0]!.time.end).toEqual({ hour: 23, minute: 59 });
    });

    it("keeps partial-hour closures as timed blocks", () => {
        const entries = deviationsToCalendarEntries(
            [makeDeviation({ start: "2026-06-17 14:00:00", end: "2026-06-17 18:00:00" })],
            ROOMS,
            WINDOW_START,
            WINDOW_END,
            OPTS,
        );
        expect(entries[0]!.time.start).toEqual({ hour: 14, minute: 0 });
        expect(entries[0]!.time.end).toEqual({ hour: 18, minute: 0 });
    });

    it("names a single scoped room in the heading", () => {
        const entries = deviationsToCalendarEntries([makeDeviation({ rooms: [10] })], ROOMS, WINDOW_START, WINDOW_END, OPTS);
        expect(entries[0]!.heading).toBe("Closed: A1");
    });

    it("summarises multiple scoped rooms in the heading but lists them in the content", () => {
        const entries = deviationsToCalendarEntries([makeDeviation({ rooms: [10, 20] })], ROOMS, WINDOW_START, WINDOW_END, OPTS);
        expect(entries[0]!.heading).toBe("Closed: 2 rooms");
        expect(entries[0]!.content).toBe("Closed — A1, B2");
    });

    it("drops closures that apply only to branches/rooms not on display", () => {
        const entries = deviationsToCalendarEntries(
            [makeDeviation({ branches: ["NOWHERE"] }), makeDeviation({ rooms: [999] })],
            ROOMS,
            WINDOW_START,
            WINDOW_END,
            OPTS,
        );
        expect(entries).toHaveLength(0);
    });

    it("uses the deviation description as the entry content when present", () => {
        const entries = deviationsToCalendarEntries(
            [makeDeviation({ description: "Christmas Holiday" })],
            ROOMS,
            WINDOW_START,
            WINDOW_END,
            OPTS,
        );
        expect(entries[0]!.content).toBe("Christmas Holiday (all rooms)");
    });
});
