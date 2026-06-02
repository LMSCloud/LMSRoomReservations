import { afterEach, beforeEach, describe, expect, it } from "vitest";
import LMSBookingsModal from "../../src/extensions/LMSBookingsModal";

// The class is otherwise only referenced in type positions, which would let the
// transpiler elide the import as type-only — and with it the @customElement side
// effect that registers <lms-bookings-modal>. Touch it as a value to keep it.
void LMSBookingsModal;

// Two runtime-only bugs bit the slot picker during the KPROOM-48 work and both
// survived the type checker and the existing tests:
//   1. The slot <option> list is part of a cached modal template. Rendering it
//      with Lit's one-shot map() directive emptied the list on the next
//      re-commit; native Array.map survives repeated commits.
//   2. The ?selected attribute sets defaultSelected, which the browser ignores
//      for a re-committed <select>'s live value, so the chosen slot was lost on
//      re-render. An updated() hook syncs select.value imperatively.
// These regressions only show up once the component actually renders and then
// re-renders, so the test drives the real element.

const SLOTS = [
    { start: "2026-06-02T10:00", end: "2026-06-02T12:00", available: true },
    { start: "2026-06-02T12:00", end: "2026-06-02T14:00", available: true },
];

const packed = (slot: { start: string; end: string }) => `${slot.start}|${slot.end}`;

// Compose a slot-mode modal and render it. fields is emptied so renderInputs
// composes nothing but the slot picker — the non-slot inputs are irrelevant here
// and dragging the full field machinery in would only add noise.
async function mountSlotModal(slots = SLOTS): Promise<LMSBookingsModal> {
    const el = document.createElement("lms-bookings-modal") as LMSBookingsModal;
    document.body.appendChild(el);
    await el.updateComplete;

    const internals = el as unknown as {
        fields: Array<{ name: string; value: unknown }>;
        selectedRoomObj: unknown;
        overrideOn: boolean;
        slotDate: string;
        slots: unknown[];
        renderInputs: () => void;
    };
    // Only the start/end data sinks are needed: setFieldValue updates existing
    // fields, and in slot mode renderInputs composes nothing but the slot picker,
    // so these don't render as inputs — they just receive the chosen slot.
    internals.fields = [
        { name: "start", value: "" },
        { name: "end", value: "" },
    ];
    internals.selectedRoomObj = { id: 1, slot_length: 120 };
    internals.overrideOn = false;
    internals.slotDate = "2026-06-02";
    internals.slots = slots;
    internals.renderInputs();
    await el.updateComplete;

    return el;
}

function slotSelect(el: LMSBookingsModal): HTMLSelectElement {
    const select = el.renderRoot.querySelector<HTMLSelectElement>('select[name="slot"]');
    if (!select) {
        throw new Error("slot select not rendered");
    }
    return select;
}

function optionValues(el: LMSBookingsModal): string[] {
    return Array.from(slotSelect(el).querySelectorAll("option")).map((option) => option.value);
}

function fieldValue(el: LMSBookingsModal, name: string): unknown {
    const fields = (el as unknown as { fields: Array<{ name: string; value: unknown }> }).fields;
    return fields.find((field) => field.name === name)?.value;
}

describe("LMSBookingsModal slot picker", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("renders one option per available slot plus the placeholder", async () => {
        const el = await mountSlotModal();

        expect(optionValues(el)).toEqual(["", packed(SLOTS[0]), packed(SLOTS[1])]);
    });

    it("keeps the option list populated across a plain re-render", async () => {
        const el = await mountSlotModal();
        expect(optionValues(el)).toHaveLength(3);

        // A re-commit of the cached template without recomposing inputs — this is
        // what emptied the list when the options came from a one-shot generator.
        el.requestUpdate();
        await el.updateComplete;

        expect(optionValues(el)).toEqual(["", packed(SLOTS[0]), packed(SLOTS[1])]);
    });

    it("sets start/end from the chosen slot", async () => {
        const el = await mountSlotModal();
        const select = slotSelect(el);

        select.value = packed(SLOTS[1]);
        select.dispatchEvent(new Event("change"));
        await el.updateComplete;

        expect(fieldValue(el, "start")).toBe(SLOTS[1].start);
        expect(fieldValue(el, "end")).toBe(SLOTS[1].end);
    });

    it("re-syncs the select's live value to the chosen slot on update", async () => {
        const el = await mountSlotModal();
        const select = slotSelect(el);

        select.value = packed(SLOTS[1]);
        select.dispatchEvent(new Event("change"));
        await el.updateComplete;

        // A real browser drops a re-committed <select>'s live value (it honors
        // only the selected attribute / defaultSelected), so the chosen slot is
        // lost on re-render unless updated() restores it. jsdom doesn't reproduce
        // that quirk through a normal re-render, so emulate the dropped value and
        // assert the hook re-syncs it — without the hook the select stays empty.
        select.value = "";
        (el as unknown as { updated: (changed: Map<PropertyKey, unknown>) => void }).updated(new Map());

        expect(select.value).toBe(packed(SLOTS[1]));
    });
});
