import type { CalendarEntry } from "@jpahd/kalendus";
import dayjs from "dayjs";
import type { Deviation } from "../../types/common";

/** Matches Checks.pm RECURRENCE_MAX_INSTANCES — two years of daily occurrences. */
const RECURRENCE_MAX_INSTANCES = 730;

export type DeviationInstance = {
    start: Date;
    end: Date;
};

type RoomLike = {
    roomid: number;
    roomnumber: string;
    branch: string;
};

type BlockedEntryOptions = {
    /** Translated word for a closure, e.g. "Closed". Rendered as a bracketed
        marker ("[Closed] …") so a closure never reads as a room that happens to
        share the entry color — booking headings are room numbers, closures are
        always bracket-marked. */
    closedLabel: string;
    /** Translated label for a library-wide closure, e.g. "all rooms". */
    allRoomsLabel: string;
    /** Translated plural noun for the "{n} rooms" summary, e.g. "rooms". */
    roomsLabel: string;
    /** CSS color for the blocked-entry indicator. */
    color: string;
};

/** Beyond a single scoped room we summarise as "{n} rooms" in the heading so a
    month-view chip can't truncate mid-name; the full list goes in the content. */
function buildScopeLabel(roomNumbers: string[], allRoomsLabel: string, roomsLabel: string): string {
    if (roomNumbers.length === 0) return allRoomsLabel;
    if (roomNumbers.length === 1) return roomNumbers[0]!;
    return `${roomNumbers.length} ${roomsLabel}`;
}

/**
 * Expand a deviation into the concrete instances that fall within
 * [windowStart, windowEnd]. Ported from Checks.pm::_expand_deviation_instances
 * so the OPAC calendar materializes recurring closures the same way the
 * booking checks do server-side.
 */
export function expandDeviationInstances(
    deviation: Deviation,
    windowStart: Date,
    windowEnd: Date,
): DeviationInstance[] {
    const recurrenceType = deviation.recurrencetype || "none";
    const devStart = dayjs(deviation.start);
    const devEnd = dayjs(deviation.end);
    const durationMs = devEnd.diff(devStart);

    const recurrenceUntil = deviation.recurrenceuntil ? dayjs(`${deviation.recurrenceuntil}T23:59`) : null;

    // Non-recurring deviation — a single instance. The caller filters by window.
    if (recurrenceType === "none") {
        return [{ start: devStart.toDate(), end: devEnd.toDate() }];
    }

    // Pattern matchers mirror the Perl dispatch table. dayjs().day() is
    // 0=Sunday..6=Saturday; recurrencedays is stored 0=Monday..6=Sunday.
    const matchers: Record<string, (current: dayjs.Dayjs) => boolean> = {
        daily: () => true,
        weekdays: (current) => {
            const dow = current.day();
            return dow >= 1 && dow <= 5;
        },
        weekly: (current) => {
            const dow = (current.day() + 6) % 7;
            if (deviation.recurrencedays) {
                const allowedDays = deviation.recurrencedays.split(",").map((day) => parseInt(day.trim(), 10));
                return allowedDays.includes(dow);
            }
            const originalDow = (devStart.day() + 6) % 7;
            return dow === originalDow;
        },
        monthly: (current) => current.date() === devStart.date(),
    };

    const matcher = matchers[recurrenceType];
    if (!matcher) return [];

    const windowStartDay = dayjs(windowStart);
    const windowEndDay = dayjs(windowEnd);
    const instances: DeviationInstance[] = [];

    // Fast-forward to the window so a long-running closure that began far in the
    // past doesn't exhaust the instance cap on dates nobody can see. Advancing by
    // whole days preserves the deviation's time-of-day, and the recurrence
    // matchers key off each date itself, so skipping ahead is safe.
    let current = devStart;
    if (current.isBefore(windowStartDay)) {
        const daysBehind = windowStartDay.startOf("day").diff(current.startOf("day"), "day");
        current = current.add(daysBehind, "day");
    }

    for (let count = 0; count < RECURRENCE_MAX_INSTANCES; count++) {
        if (recurrenceUntil && current.isAfter(recurrenceUntil)) break;
        if (count > 0 && current.isAfter(windowEndDay)) break;

        if (matcher(current)) {
            const instanceEnd = current.add(durationMs, "millisecond");
            instances.push({ start: current.toDate(), end: instanceEnd.toDate() });
        }

        current = current.add(1, "day");
    }

    return instances;
}

function deviationApplies(
    deviation: Deviation,
    displayedBranches: Set<string>,
    displayedRoomIds: Set<number>,
): boolean {
    const branchOk =
        deviation.branches.length === 0 || deviation.branches.some((branch) => displayedBranches.has(branch));
    const roomOk = deviation.rooms.length === 0 || deviation.rooms.some((roomid) => displayedRoomIds.has(roomid));
    return branchOk && roomOk;
}

function toCalendarEntry(instance: DeviationInstance, heading: string, content: string, color: string): CalendarEntry {
    const { start, end } = instance;
    return {
        date: {
            start: { day: start.getDate(), month: start.getMonth() + 1, year: start.getFullYear() },
            end: { day: end.getDate(), month: end.getMonth() + 1, year: end.getFullYear() },
        },
        // Full-day closures (00:00–23:59) and multi-day spans are detected as
        // all-day by kalendus and render as banners; partial-hour closures keep
        // their times and render as timed blocks.
        time: {
            start: { hour: start.getHours(), minute: start.getMinutes() },
            end: { hour: end.getHours(), minute: end.getMinutes() },
        },
        heading,
        content,
        color,
        isContinuation: false,
    };
}

/**
 * Convert blackout deviations into synthetic kalendus entries for the OPAC
 * calendar. Special-hours deviations (isblackout = 0) are additive open hours,
 * not closures, so they are skipped. Recurring closures are materialized across
 * the [windowStart, windowEnd] horizon.
 */
export function deviationsToCalendarEntries(
    deviations: Deviation[],
    rooms: RoomLike[],
    windowStart: Date,
    windowEnd: Date,
    { closedLabel, allRoomsLabel, roomsLabel, color }: BlockedEntryOptions,
): CalendarEntry[] {
    const displayedBranches = new Set(rooms.map((room) => room.branch));
    const displayedRoomIds = new Set(rooms.map((room) => room.roomid));
    const roomNumberById = new Map(rooms.map((room) => [room.roomid, room.roomnumber]));

    return deviations
        .filter((deviation) => deviation.isblackout)
        .filter((deviation) => deviationApplies(deviation, displayedBranches, displayedRoomIds))
        .flatMap((deviation) => {
            const scopedRoomNumbers = deviation.rooms
                .map((roomid) => roomNumberById.get(roomid))
                .filter((roomnumber): roomnumber is string => Boolean(roomnumber));
            const scopeLabel = buildScopeLabel(scopedRoomNumbers, allRoomsLabel, roomsLabel);
            const scopeDetail = scopedRoomNumbers.length > 0 ? scopedRoomNumbers.join(", ") : allRoomsLabel;
            // The distinct red banner/color now carries the "closed" signal, so no
            // bracketed marker is needed; room-scoped closures still name their rooms.
            const heading = scopedRoomNumbers.length > 0 ? `${closedLabel}: ${scopeLabel}` : closedLabel;
            const content = deviation.description?.trim()
                ? `${deviation.description} (${scopeDetail})`
                : `${closedLabel} — ${scopeDetail}`;

            return expandDeviationInstances(deviation, windowStart, windowEnd)
                .filter((instance) => instance.end > windowStart && instance.start < windowEnd)
                .map((instance) => toCalendarEntry(instance, heading, content, color));
        });
}
