import { describe, expect, it } from "vitest";
import { packSlotValue, unpackSlotValue } from "../../src/lib/slots";

describe("slots", () => {
  describe("packSlotValue", () => {
    it("joins start and end with a pipe", () => {
      expect(packSlotValue("2026-06-02T10:00:00", "2026-06-02T12:00:00")).toBe(
        "2026-06-02T10:00:00|2026-06-02T12:00:00",
      );
    });
  });

  describe("unpackSlotValue", () => {
    it("splits a packed value back into start and end", () => {
      expect(
        unpackSlotValue("2026-06-02T10:00:00|2026-06-02T12:00:00"),
      ).toEqual({
        start: "2026-06-02T10:00:00",
        end: "2026-06-02T12:00:00",
      });
    });

    it("round-trips with packSlotValue", () => {
      const start = "2026-06-02T10:00:00";
      const end = "2026-06-02T12:00:00";
      expect(unpackSlotValue(packSlotValue(start, end))).toEqual({
        start,
        end,
      });
    });

    it.each([
      "",
      undefined,
      null,
      "2026-06-02T10:00:00",
      "|",
      "|2026-06-02T12:00:00",
      "2026-06-02T10:00:00|",
    ])("returns undefined for the incomplete value %o", (value) => {
      expect(unpackSlotValue(value)).toBeUndefined();
    });
  });
});
