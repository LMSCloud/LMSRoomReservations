import { formatMinutesHumanReadable } from "../../../src/lib/converters/timeConverter";

describe("formatMinutesHumanReadable", () => {
    it("returns empty array for 0 minutes", () => {
        const result = formatMinutesHumanReadable(0);
        expect(result).toHaveLength(0);
    });

    it("returns a single part for exactly 60 minutes", () => {
        const result = formatMinutesHumanReadable(60);
        expect(result).toHaveLength(1);
        const values = result[0].values;
        expect(values).toContain(1);
    });

    it("returns two parts for 90 minutes (1h 30m)", () => {
        const result = formatMinutesHumanReadable(90);
        expect(result).toHaveLength(2);
    });

    it("returns a part containing days for 1500 minutes", () => {
        const result = formatMinutesHumanReadable(1500);
        expect(result.length).toBeGreaterThanOrEqual(1);
        const allValues = result.flatMap((r) => [...r.values]);
        expect(allValues).toContain(1); // 1 day
    });

    it("returns only minutes part for values under 60", () => {
        const result = formatMinutesHumanReadable(45);
        expect(result).toHaveLength(1);
        const values = result[0].values;
        expect(values).toContain(45);
    });

    it("handles exact day boundary (1440 minutes)", () => {
        const result = formatMinutesHumanReadable(1440);
        expect(result).toHaveLength(1);
        const values = result[0].values;
        expect(values).toContain(1); // 1 day
    });
});
