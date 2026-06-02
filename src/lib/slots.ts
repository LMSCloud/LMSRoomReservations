// Slot times are passed through a single <select> value as "start|end" so one
// control can drive both the booking start and end. These helpers single-source
// that packing format across the slot picker (option values, end display) and
// the save path (unpacking back into the API's start/end fields).

export function packSlotValue(start: string, end: string): string {
    return `${start}|${end}`;
}

export function unpackSlotValue(value: string | undefined | null): { start: string; end: string } | undefined {
    if (!value) {
        return undefined;
    }
    const [start, end] = value.split("|");
    if (!start || !end) {
        return undefined;
    }
    return { start, end };
}
